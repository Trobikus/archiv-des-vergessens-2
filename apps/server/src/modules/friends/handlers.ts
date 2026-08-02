import {
  validateFriendUsernamePayload,
  WS_EVENTS,
  type FriendEntry,
  type FriendRequestEntry,
  type FriendUpdatePayload,
} from "@adv/protocol";
import type { WebSocket } from "ws";

import type { PreparedStatements, UserRow } from "../../db/open";
import { MAX_FRIENDS } from "../../db/schema";
import { sendJson, sendToUserIds } from "../../net/send";
import type { ClientSession } from "../../net/session";
import { hasActiveRegisteredSession } from "../auth/session-guard";
import { sanitizeText } from "../auth/validate-local";

export type FriendsHandlerDeps = {
  readonly stmts: PreparedStatements;
  readonly forEachSession: (
    fn: (ws: WebSocket, session: ClientSession) => void,
  ) => void;
};

type FriendshipPair = {
  readonly low: string;
  readonly high: string;
};

function pairIds(a: string, b: string): FriendshipPair {
  return a < b ? { low: a, high: b } : { low: b, high: a };
}

function buildFriendUpdate(
  stmts: PreparedStatements,
  userId: string,
): FriendUpdatePayload {
  const list = stmts.listFriendships.all(
    userId,
    userId,
    userId,
    userId,
  ) as FriendEntry[];
  const pending = stmts.listPendingFriendRequests.all(
    userId,
  ) as FriendRequestEntry[];
  const sent = stmts.listSentFriendRequests.all(userId) as FriendRequestEntry[];
  return { list, pending, sent };
}

export function sendFriendUpdate(
  ws: WebSocket,
  stmts: PreparedStatements,
  userId: string,
): void {
  const update = buildFriendUpdate(stmts, userId);
  sendJson(ws, WS_EVENTS.FRIEND_UPDATE, {
    list: [...update.list],
    pending: [...update.pending],
    sent: [...update.sent],
  });
}

function pushFriendUpdate(
  deps: FriendsHandlerDeps,
  userIds: readonly string[],
): void {
  for (const userId of userIds) {
    const update = buildFriendUpdate(deps.stmts, userId);
    sendToUserIds(deps.forEachSession, [userId], WS_EVENTS.FRIEND_UPDATE, {
      list: [...update.list],
      pending: [...update.pending],
      sent: [...update.sent],
    });
  }
}

function requireRegistered(
  ws: WebSocket,
  session: ClientSession,
  deps: FriendsHandlerDeps,
): string | null {
  if (
    !hasActiveRegisteredSession(session, deps.stmts) ||
    session.userId === null
  ) {
    sendJson(ws, WS_EVENTS.FRIEND_ERROR, {
      error: "Nur registrierte Konten können Freunde verwalten.",
    });
    return null;
  }
  return session.userId;
}

function resolveUserByUsername(
  stmts: PreparedStatements,
  username: string,
): UserRow | undefined {
  return stmts.getUserByUsername.get(username) as UserRow | undefined;
}

export function handleFriendsMessage(
  ws: WebSocket,
  type: string,
  payload: Record<string, unknown>,
  session: ClientSession,
  deps: FriendsHandlerDeps,
): boolean {
  switch (type) {
    case WS_EVENTS.FRIEND_LIST: {
      const userId = requireRegistered(ws, session, deps);
      if (userId === null) {
        return true;
      }
      sendFriendUpdate(ws, deps.stmts, userId);
      return true;
    }
    case WS_EVENTS.FRIEND_REQUEST: {
      const userId = requireRegistered(ws, session, deps);
      if (userId === null) {
        return true;
      }
      const parsed = validateFriendUsernamePayload(payload);
      if (!parsed.ok) {
        sendJson(ws, WS_EVENTS.FRIEND_ERROR, { error: parsed.error });
        return true;
      }
      const username = sanitizeText(parsed.value.username, 32);
      if (username.length === 0) {
        sendJson(ws, WS_EVENTS.FRIEND_ERROR, {
          error: "Bitte gib einen gültigen Namen ein.",
        });
        return true;
      }
      if (username.toLowerCase() === session.username.toLowerCase()) {
        sendJson(ws, WS_EVENTS.FRIEND_ERROR, {
          error: "Du kannst dich nicht selbst als Freund hinzufügen.",
        });
        return true;
      }
      const target = resolveUserByUsername(deps.stmts, username);
      if (target === undefined) {
        sendJson(ws, WS_EVENTS.FRIEND_ERROR, {
          error: `Spieler "${username}" wurde nicht gefunden.`,
        });
        return true;
      }
      const pair = pairIds(userId, target.id);
      const existing = deps.stmts.getFriendship.get(pair.low, pair.high);
      if (existing !== undefined) {
        sendJson(ws, WS_EVENTS.FRIEND_ERROR, {
          error: `${target.username} ist bereits dein Freund.`,
        });
        return true;
      }
      const countRow = deps.stmts.countFriendships.get(userId, userId) as
        | { count: number }
        | undefined;
      if ((countRow?.count ?? 0) >= MAX_FRIENDS) {
        sendJson(ws, WS_EVENTS.FRIEND_ERROR, {
          error: "Du hast die maximale Anzahl an Freunden erreicht.",
        });
        return true;
      }
      const reverse = deps.stmts.getFriendRequest.get(target.id, userId);
      if (reverse !== undefined) {
        deps.stmts.deleteFriendRequestsBetween.run(
          userId,
          target.id,
          target.id,
          userId,
        );
        deps.stmts.insertFriendship.run(pair.low, pair.high, Date.now());
        pushFriendUpdate(deps, [userId, target.id]);
        return true;
      }
      const alreadySent = deps.stmts.getFriendRequest.get(userId, target.id);
      if (alreadySent !== undefined) {
        sendJson(ws, WS_EVENTS.FRIEND_ERROR, {
          error: "Du hast bereits eine Anfrage an diese Person gesendet.",
        });
        return true;
      }
      try {
        deps.stmts.insertFriendRequest.run(userId, target.id, Date.now());
      } catch {
        sendJson(ws, WS_EVENTS.FRIEND_ERROR, {
          error: "Anfrage konnte nicht gespeichert werden.",
        });
        return true;
      }
      pushFriendUpdate(deps, [userId, target.id]);
      return true;
    }
    case WS_EVENTS.FRIEND_ACCEPT: {
      const userId = requireRegistered(ws, session, deps);
      if (userId === null) {
        return true;
      }
      const parsed = validateFriendUsernamePayload(payload);
      if (!parsed.ok) {
        sendJson(ws, WS_EVENTS.FRIEND_ERROR, { error: parsed.error });
        return true;
      }
      const username = sanitizeText(parsed.value.username, 32);
      const fromUser = resolveUserByUsername(deps.stmts, username);
      if (fromUser === undefined) {
        sendJson(ws, WS_EVENTS.FRIEND_ERROR, {
          error: "Keine Anfrage von dieser Person.",
        });
        return true;
      }
      const request = deps.stmts.getFriendRequest.get(fromUser.id, userId);
      if (request === undefined) {
        sendJson(ws, WS_EVENTS.FRIEND_ERROR, {
          error: "Keine Anfrage von dieser Person.",
        });
        return true;
      }
      const countRow = deps.stmts.countFriendships.get(userId, userId) as
        | { count: number }
        | undefined;
      if ((countRow?.count ?? 0) >= MAX_FRIENDS) {
        sendJson(ws, WS_EVENTS.FRIEND_ERROR, {
          error: "Du hast die maximale Anzahl an Freunden erreicht.",
        });
        return true;
      }
      const pair = pairIds(userId, fromUser.id);
      deps.stmts.deleteFriendRequestsBetween.run(
        userId,
        fromUser.id,
        fromUser.id,
        userId,
      );
      deps.stmts.insertFriendship.run(pair.low, pair.high, Date.now());
      pushFriendUpdate(deps, [userId, fromUser.id]);
      return true;
    }
    case WS_EVENTS.FRIEND_DECLINE: {
      const userId = requireRegistered(ws, session, deps);
      if (userId === null) {
        return true;
      }
      const parsed = validateFriendUsernamePayload(payload);
      if (!parsed.ok) {
        sendJson(ws, WS_EVENTS.FRIEND_ERROR, { error: parsed.error });
        return true;
      }
      const username = sanitizeText(parsed.value.username, 32);
      const fromUser = resolveUserByUsername(deps.stmts, username);
      if (fromUser === undefined) {
        sendJson(ws, WS_EVENTS.FRIEND_ERROR, {
          error: "Keine Anfrage von dieser Person.",
        });
        return true;
      }
      const changes = deps.stmts.deleteFriendRequest.run(fromUser.id, userId);
      if (changes.changes === 0) {
        sendJson(ws, WS_EVENTS.FRIEND_ERROR, {
          error: "Keine Anfrage von dieser Person.",
        });
        return true;
      }
      pushFriendUpdate(deps, [userId, fromUser.id]);
      return true;
    }
    case WS_EVENTS.FRIEND_CANCEL: {
      const userId = requireRegistered(ws, session, deps);
      if (userId === null) {
        return true;
      }
      const parsed = validateFriendUsernamePayload(payload);
      if (!parsed.ok) {
        sendJson(ws, WS_EVENTS.FRIEND_ERROR, { error: parsed.error });
        return true;
      }
      const username = sanitizeText(parsed.value.username, 32);
      const toUser = resolveUserByUsername(deps.stmts, username);
      if (toUser === undefined) {
        sendJson(ws, WS_EVENTS.FRIEND_ERROR, {
          error: "Keine gesendete Anfrage an diese Person.",
        });
        return true;
      }
      const changes = deps.stmts.deleteFriendRequest.run(userId, toUser.id);
      if (changes.changes === 0) {
        sendJson(ws, WS_EVENTS.FRIEND_ERROR, {
          error: "Keine gesendete Anfrage an diese Person.",
        });
        return true;
      }
      pushFriendUpdate(deps, [userId, toUser.id]);
      return true;
    }
    case WS_EVENTS.FRIEND_REMOVE: {
      const userId = requireRegistered(ws, session, deps);
      if (userId === null) {
        return true;
      }
      const parsed = validateFriendUsernamePayload(payload);
      if (!parsed.ok) {
        sendJson(ws, WS_EVENTS.FRIEND_ERROR, { error: parsed.error });
        return true;
      }
      const username = sanitizeText(parsed.value.username, 32);
      const other = resolveUserByUsername(deps.stmts, username);
      if (other === undefined) {
        sendJson(ws, WS_EVENTS.FRIEND_ERROR, {
          error: `${username} ist nicht in deiner Freundesliste.`,
        });
        return true;
      }
      const pair = pairIds(userId, other.id);
      const changes = deps.stmts.deleteFriendship.run(pair.low, pair.high);
      if (changes.changes === 0) {
        sendJson(ws, WS_EVENTS.FRIEND_ERROR, {
          error: `${other.username} ist nicht in deiner Freundesliste.`,
        });
        return true;
      }
      pushFriendUpdate(deps, [userId, other.id]);
      return true;
    }
    default:
      return false;
  }
}
