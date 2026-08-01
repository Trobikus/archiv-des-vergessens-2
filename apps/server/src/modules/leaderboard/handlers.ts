import {
  validateLeaderboardSubmitPayload,
  WS_EVENTS,
  type LeaderboardEntry,
} from "@adv/protocol";
import type { WebSocket } from "ws";

import type { PreparedStatements } from "../../db/open";
import {
  LEADERBOARD_JUMP_BOSSES,
  LEADERBOARD_JUMP_LEVEL,
  LEADERBOARD_JUMP_PRESTIGE,
  LEADERBOARD_TOP_N,
  MAX_LEADERBOARD_BOSSES,
  MAX_LEADERBOARD_LEVEL,
  MAX_LEADERBOARD_PRESTIGE,
} from "../../db/schema";
import { broadcastJson, sendJson } from "../../net/send";
import type { ClientSession } from "../../net/session";

export type LeaderboardHandlerDeps = {
  readonly stmts: PreparedStatements;
  readonly broadcastClients: () => Iterable<WebSocket>;
};

type LeaderboardRow = {
  readonly userId: string;
  readonly username: string;
  readonly prestige: number;
  readonly bosses: number;
  readonly level: number;
  readonly timestamp: number;
};

function hasActiveRegisteredSession(
  session: ClientSession,
  stmts: PreparedStatements,
): boolean {
  if (
    session.userId === null ||
    session.sessionToken === null ||
    session.isGuest
  ) {
    return false;
  }
  const row = stmts.getUserBySession.get(
    session.userId,
    session.sessionToken,
  );
  return row !== undefined;
}

export function getTopLeaderboard(
  stmts: PreparedStatements,
  limit = LEADERBOARD_TOP_N,
): LeaderboardEntry[] {
  const rows = stmts.getTopLeaderboard.all(limit) as LeaderboardRow[];
  return rows.map((row) => ({
    userId: row.userId,
    username: row.username,
    prestige: row.prestige,
    bosses: row.bosses,
    level: row.level,
    timestamp: row.timestamp,
  }));
}

export function sendLeaderboardUpdate(
  ws: WebSocket,
  stmts: PreparedStatements,
): void {
  sendJson(ws, WS_EVENTS.LEADERBOARD_UPDATE, {
    entries: getTopLeaderboard(stmts),
  });
}

export function handleLeaderboardMessage(
  ws: WebSocket,
  type: string,
  payload: Record<string, unknown>,
  session: ClientSession,
  deps: LeaderboardHandlerDeps,
): boolean {
  switch (type) {
    case WS_EVENTS.LEADERBOARD_SUBMIT: {
      if (!hasActiveRegisteredSession(session, deps.stmts)) {
        sendJson(ws, WS_EVENTS.LEADERBOARD_ERROR, {
          error: "Nicht authentifiziert oder Sitzung abgelaufen.",
        });
        return true;
      }
      if (session.userId === null) {
        return true;
      }
      const registered = deps.stmts.getUserById.get(session.userId);
      if (registered === undefined) {
        sendJson(ws, WS_EVENTS.LEADERBOARD_ERROR, {
          error: "Nur registrierte Konten können Highscores einreichen.",
        });
        return true;
      }
      const parsed = validateLeaderboardSubmitPayload(payload);
      if (!parsed.ok) {
        sendJson(ws, WS_EVENTS.LEADERBOARD_ERROR, { error: parsed.error });
        return true;
      }
      const prestige = Math.min(
        MAX_LEADERBOARD_PRESTIGE,
        Math.max(0, parsed.value.prestige),
      );
      const bosses = Math.min(
        MAX_LEADERBOARD_BOSSES,
        Math.max(0, parsed.value.bosses),
      );
      const level = Math.min(
        MAX_LEADERBOARD_LEVEL,
        Math.max(1, parsed.value.level),
      );
      const existing = deps.stmts.getLeaderboardUser.get(session.userId) as
        | { prestige: number; bosses: number; level: number }
        | undefined;
      if (existing !== undefined) {
        if (
          prestige > existing.prestige + LEADERBOARD_JUMP_PRESTIGE ||
          bosses > existing.bosses + LEADERBOARD_JUMP_BOSSES ||
          level > existing.level + LEADERBOARD_JUMP_LEVEL
        ) {
          sendJson(ws, WS_EVENTS.LEADERBOARD_ERROR, {
            error: "Ungültiger Highscore-Sprung.",
          });
          return true;
        }
      } else if (
        prestige > LEADERBOARD_JUMP_PRESTIGE ||
        bosses > LEADERBOARD_JUMP_BOSSES ||
        level > LEADERBOARD_JUMP_LEVEL
      ) {
        const saveRow = deps.stmts.getSave.get(session.userId);
        if (saveRow === undefined) {
          sendJson(ws, WS_EVENTS.LEADERBOARD_ERROR, {
            error: "Erstübertragung ohne Speicherstand verweigert.",
          });
          return true;
        }
      }
      try {
        deps.stmts.upsertLeaderboard.run(
          session.userId,
          session.username,
          prestige,
          bosses,
          level,
          Date.now(),
        );
      } catch {
        sendJson(ws, WS_EVENTS.LEADERBOARD_ERROR, {
          error: "Highscore konnte nicht gespeichert werden.",
        });
        return true;
      }
      broadcastJson(deps.broadcastClients(), WS_EVENTS.LEADERBOARD_UPDATE, {
        entries: getTopLeaderboard(deps.stmts),
      });
      return true;
    }
    case WS_EVENTS.LEADERBOARD_GET: {
      sendLeaderboardUpdate(ws, deps.stmts);
      return true;
    }
    default:
      return false;
  }
}
