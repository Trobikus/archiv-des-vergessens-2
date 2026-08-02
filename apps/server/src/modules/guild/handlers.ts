import {
  validateGuildAcceptDeclinePayload,
  validateGuildCreatePayload,
  validateGuildUsernamePayload,
  WS_EVENTS,
  type GuildInfo,
  type GuildInviteEntry,
  type GuildMember,
  type GuildUpdatePayload,
} from "@adv/protocol";
import type { WebSocket } from "ws";

import type { PreparedStatements, UserRow } from "../../db/open";
import {
  MAX_GUILD_MEMBERS,
  MAX_GUILD_NAME_LENGTH,
} from "../../db/schema";
import { sendJson, sendToUserIds } from "../../net/send";
import type { ClientSession } from "../../net/session";
import { hasActiveRegisteredSession } from "../auth/session-guard";
import { sanitizeText } from "../auth/validate-local";

export type GuildHandlerDeps = {
  readonly stmts: PreparedStatements;
  readonly forEachSession: (
    fn: (ws: WebSocket, session: ClientSession) => void,
  ) => void;
};

type GuildMembershipRow = {
  readonly guildId: string;
  readonly userId: string;
  readonly role: string;
  readonly joinedAt: number;
  readonly guildName: string;
  readonly ownerId: string;
  readonly guildCreatedAt: number;
};

function createGuildId(): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `guild_${Date.now().toString(36)}_${rand}`;
}

function buildGuildUpdate(
  stmts: PreparedStatements,
  userId: string,
): GuildUpdatePayload {
  const membership = stmts.getGuildMembershipByUser.get(
    userId,
  ) as GuildMembershipRow | undefined;
  let guild: GuildInfo | null = null;
  let members: GuildMember[] = [];
  let outgoingInvites: GuildInviteEntry[] = [];
  if (membership !== undefined) {
    guild = {
      id: membership.guildId,
      name: membership.guildName,
      ownerId: membership.ownerId,
      createdAt: membership.guildCreatedAt,
    };
    members = stmts.listGuildMembers.all(membership.guildId) as GuildMember[];
    outgoingInvites = stmts.listOutgoingGuildInvites.all(
      membership.guildId,
    ) as GuildInviteEntry[];
  }
  const invites = stmts.listGuildInvitesForUser.all(
    userId,
  ) as GuildInviteEntry[];
  return { guild, members, invites, outgoingInvites };
}

export function sendGuildUpdate(
  ws: WebSocket,
  stmts: PreparedStatements,
  userId: string,
): void {
  const update = buildGuildUpdate(stmts, userId);
  sendJson(ws, WS_EVENTS.GUILD_UPDATE, {
    guild: update.guild,
    members: [...update.members],
    invites: [...update.invites],
    outgoingInvites: [...update.outgoingInvites],
  });
}

function pushGuildUpdateToUsers(
  deps: GuildHandlerDeps,
  userIds: readonly string[],
): void {
  for (const userId of userIds) {
    const update = buildGuildUpdate(deps.stmts, userId);
    sendToUserIds(deps.forEachSession, [userId], WS_EVENTS.GUILD_UPDATE, {
      guild: update.guild,
      members: [...update.members],
      invites: [...update.invites],
      outgoingInvites: [...update.outgoingInvites],
    });
  }
}

function memberUserIds(
  stmts: PreparedStatements,
  guildId: string,
): string[] {
  const rows = stmts.listGuildMembers.all(guildId) as Array<{
    userId: string;
  }>;
  return rows.map((row) => row.userId);
}

function requireRegistered(
  ws: WebSocket,
  session: ClientSession,
  deps: GuildHandlerDeps,
): string | null {
  if (
    !hasActiveRegisteredSession(session, deps.stmts) ||
    session.userId === null
  ) {
    sendJson(ws, WS_EVENTS.GUILD_ERROR, {
      error: "Nur registrierte Konten können Gilden verwalten.",
    });
    return null;
  }
  return session.userId;
}

export function getUserGuildId(
  stmts: PreparedStatements,
  userId: string,
): string | null {
  const membership = stmts.getGuildMembershipByUser.get(
    userId,
  ) as GuildMembershipRow | undefined;
  return membership?.guildId ?? null;
}

export function handleGuildMessage(
  ws: WebSocket,
  type: string,
  payload: Record<string, unknown>,
  session: ClientSession,
  deps: GuildHandlerDeps,
): boolean {
  switch (type) {
    case WS_EVENTS.GUILD_GET: {
      const userId = requireRegistered(ws, session, deps);
      if (userId === null) {
        return true;
      }
      sendGuildUpdate(ws, deps.stmts, userId);
      return true;
    }
    case WS_EVENTS.GUILD_CREATE: {
      const userId = requireRegistered(ws, session, deps);
      if (userId === null) {
        return true;
      }
      const parsed = validateGuildCreatePayload(payload);
      if (!parsed.ok) {
        sendJson(ws, WS_EVENTS.GUILD_ERROR, { error: parsed.error });
        return true;
      }
      const name = sanitizeText(parsed.value.name, MAX_GUILD_NAME_LENGTH);
      if (name.length < 3) {
        sendJson(ws, WS_EVENTS.GUILD_ERROR, {
          error: "Gildenname muss mindestens 3 Zeichen haben.",
        });
        return true;
      }
      const existingMembership = deps.stmts.getGuildMembershipByUser.get(userId);
      if (existingMembership !== undefined) {
        sendJson(ws, WS_EVENTS.GUILD_ERROR, {
          error: "Du bist bereits in einer Gilde.",
        });
        return true;
      }
      const nameTaken = deps.stmts.getGuildByName.get(name);
      if (nameTaken !== undefined) {
        sendJson(ws, WS_EVENTS.GUILD_ERROR, {
          error: "Dieser Gildenname ist bereits vergeben.",
        });
        return true;
      }
      const guildId = createGuildId();
      const now = Date.now();
      try {
        deps.stmts.insertGuild.run(guildId, name, userId, now);
        deps.stmts.insertGuildMember.run(guildId, userId, "owner", now);
        deps.stmts.deleteGuildInvitesForUser.run(userId);
      } catch {
        sendJson(ws, WS_EVENTS.GUILD_ERROR, {
          error: "Gilde konnte nicht erstellt werden.",
        });
        return true;
      }
      pushGuildUpdateToUsers(deps, [userId]);
      return true;
    }
    case WS_EVENTS.GUILD_INVITE: {
      const userId = requireRegistered(ws, session, deps);
      if (userId === null) {
        return true;
      }
      const parsed = validateGuildUsernamePayload(payload);
      if (!parsed.ok) {
        sendJson(ws, WS_EVENTS.GUILD_ERROR, { error: parsed.error });
        return true;
      }
      const membership = deps.stmts.getGuildMembershipByUser.get(
        userId,
      ) as GuildMembershipRow | undefined;
      if (membership === undefined) {
        sendJson(ws, WS_EVENTS.GUILD_ERROR, {
          error: "Du bist in keiner Gilde.",
        });
        return true;
      }
      if (membership.role !== "owner") {
        sendJson(ws, WS_EVENTS.GUILD_ERROR, {
          error: "Nur der Gildenführer kann einladen.",
        });
        return true;
      }
      const countRow = deps.stmts.countGuildMembers.get(membership.guildId) as
        | { count: number }
        | undefined;
      if ((countRow?.count ?? 0) >= MAX_GUILD_MEMBERS) {
        sendJson(ws, WS_EVENTS.GUILD_ERROR, {
          error: "Die Gilde ist voll.",
        });
        return true;
      }
      const username = sanitizeText(parsed.value.username, 32);
      const target = deps.stmts.getUserByUsername.get(username) as
        | UserRow
        | undefined;
      if (target === undefined) {
        sendJson(ws, WS_EVENTS.GUILD_ERROR, {
          error: `Spieler "${username}" wurde nicht gefunden.`,
        });
        return true;
      }
      if (target.id === userId) {
        sendJson(ws, WS_EVENTS.GUILD_ERROR, {
          error: "Du kannst dich nicht selbst einladen.",
        });
        return true;
      }
      const targetMembership = deps.stmts.getGuildMembershipByUser.get(
        target.id,
      );
      if (targetMembership !== undefined) {
        sendJson(ws, WS_EVENTS.GUILD_ERROR, {
          error: `${target.username} ist bereits in einer Gilde.`,
        });
        return true;
      }
      const existingInvite = deps.stmts.getGuildInvite.get(
        membership.guildId,
        target.id,
      );
      if (existingInvite !== undefined) {
        sendJson(ws, WS_EVENTS.GUILD_ERROR, {
          error: "Einladung wurde bereits gesendet.",
        });
        return true;
      }
      try {
        deps.stmts.insertGuildInvite.run(
          membership.guildId,
          target.id,
          userId,
          Date.now(),
        );
      } catch {
        sendJson(ws, WS_EVENTS.GUILD_ERROR, {
          error: "Einladung konnte nicht gespeichert werden.",
        });
        return true;
      }
      pushGuildUpdateToUsers(deps, [userId, target.id]);
      return true;
    }
    case WS_EVENTS.GUILD_ACCEPT_INVITE: {
      const userId = requireRegistered(ws, session, deps);
      if (userId === null) {
        return true;
      }
      const parsed = validateGuildAcceptDeclinePayload(payload);
      if (!parsed.ok) {
        sendJson(ws, WS_EVENTS.GUILD_ERROR, { error: parsed.error });
        return true;
      }
      const guildId = sanitizeText(parsed.value.guildId, 64);
      const invite = deps.stmts.getGuildInvite.get(guildId, userId);
      if (invite === undefined) {
        sendJson(ws, WS_EVENTS.GUILD_ERROR, {
          error: "Keine Einladung für diese Gilde.",
        });
        return true;
      }
      const existingMembership = deps.stmts.getGuildMembershipByUser.get(userId);
      if (existingMembership !== undefined) {
        sendJson(ws, WS_EVENTS.GUILD_ERROR, {
          error: "Du bist bereits in einer Gilde.",
        });
        return true;
      }
      const guild = deps.stmts.getGuildById.get(guildId);
      if (guild === undefined) {
        deps.stmts.deleteGuildInvite.run(guildId, userId);
        sendJson(ws, WS_EVENTS.GUILD_ERROR, {
          error: "Diese Gilde existiert nicht mehr.",
        });
        return true;
      }
      const countRow = deps.stmts.countGuildMembers.get(guildId) as
        | { count: number }
        | undefined;
      if ((countRow?.count ?? 0) >= MAX_GUILD_MEMBERS) {
        sendJson(ws, WS_EVENTS.GUILD_ERROR, {
          error: "Die Gilde ist voll.",
        });
        return true;
      }
      deps.stmts.deleteGuildInvite.run(guildId, userId);
      deps.stmts.deleteGuildInvitesForUser.run(userId);
      deps.stmts.insertGuildMember.run(guildId, userId, "member", Date.now());
      const affected = memberUserIds(deps.stmts, guildId);
      pushGuildUpdateToUsers(deps, affected);
      return true;
    }
    case WS_EVENTS.GUILD_DECLINE_INVITE: {
      const userId = requireRegistered(ws, session, deps);
      if (userId === null) {
        return true;
      }
      const parsed = validateGuildAcceptDeclinePayload(payload);
      if (!parsed.ok) {
        sendJson(ws, WS_EVENTS.GUILD_ERROR, { error: parsed.error });
        return true;
      }
      const guildId = sanitizeText(parsed.value.guildId, 64);
      const invite = deps.stmts.getGuildInvite.get(guildId, userId) as
        | { fromUserId: string }
        | undefined;
      if (invite === undefined) {
        sendJson(ws, WS_EVENTS.GUILD_ERROR, {
          error: "Keine Einladung für diese Gilde.",
        });
        return true;
      }
      deps.stmts.deleteGuildInvite.run(guildId, userId);
      pushGuildUpdateToUsers(deps, [userId, invite.fromUserId]);
      return true;
    }
    case WS_EVENTS.GUILD_LEAVE: {
      const userId = requireRegistered(ws, session, deps);
      if (userId === null) {
        return true;
      }
      const membership = deps.stmts.getGuildMembershipByUser.get(
        userId,
      ) as GuildMembershipRow | undefined;
      if (membership === undefined) {
        sendJson(ws, WS_EVENTS.GUILD_ERROR, {
          error: "Du bist in keiner Gilde.",
        });
        return true;
      }
      if (membership.role === "owner") {
        sendJson(ws, WS_EVENTS.GUILD_ERROR, {
          error:
            "Als Gildenführer musst du die Gilde auflösen statt sie zu verlassen.",
        });
        return true;
      }
      const guildId = membership.guildId;
      deps.stmts.deleteGuildMember.run(guildId, userId);
      const remaining = memberUserIds(deps.stmts, guildId);
      pushGuildUpdateToUsers(deps, [userId, ...remaining]);
      return true;
    }
    case WS_EVENTS.GUILD_KICK: {
      const userId = requireRegistered(ws, session, deps);
      if (userId === null) {
        return true;
      }
      const parsed = validateGuildUsernamePayload(payload);
      if (!parsed.ok) {
        sendJson(ws, WS_EVENTS.GUILD_ERROR, { error: parsed.error });
        return true;
      }
      const membership = deps.stmts.getGuildMembershipByUser.get(
        userId,
      ) as GuildMembershipRow | undefined;
      if (membership === undefined || membership.role !== "owner") {
        sendJson(ws, WS_EVENTS.GUILD_ERROR, {
          error: "Nur der Gildenführer kann Mitglieder entfernen.",
        });
        return true;
      }
      const username = sanitizeText(parsed.value.username, 32);
      const target = deps.stmts.getUserByUsername.get(username) as
        | UserRow
        | undefined;
      if (target === undefined) {
        sendJson(ws, WS_EVENTS.GUILD_ERROR, {
          error: "Mitglied nicht gefunden.",
        });
        return true;
      }
      if (target.id === userId) {
        sendJson(ws, WS_EVENTS.GUILD_ERROR, {
          error: "Du kannst dich nicht selbst entfernen.",
        });
        return true;
      }
      const targetMember = deps.stmts.getGuildMember.get(
        membership.guildId,
        target.id,
      );
      if (targetMember === undefined) {
        sendJson(ws, WS_EVENTS.GUILD_ERROR, {
          error: "Mitglied nicht in der Gilde.",
        });
        return true;
      }
      deps.stmts.deleteGuildMember.run(membership.guildId, target.id);
      const remaining = memberUserIds(deps.stmts, membership.guildId);
      pushGuildUpdateToUsers(deps, [target.id, ...remaining]);
      return true;
    }
    case WS_EVENTS.GUILD_DISBAND: {
      const userId = requireRegistered(ws, session, deps);
      if (userId === null) {
        return true;
      }
      const membership = deps.stmts.getGuildMembershipByUser.get(
        userId,
      ) as GuildMembershipRow | undefined;
      if (membership === undefined || membership.role !== "owner") {
        sendJson(ws, WS_EVENTS.GUILD_ERROR, {
          error: "Nur der Gildenführer kann die Gilde auflösen.",
        });
        return true;
      }
      const guildId = membership.guildId;
      const affected = memberUserIds(deps.stmts, guildId);
      deps.stmts.deleteGuildInvitesForGuild.run(guildId);
      deps.stmts.deleteGuildMembers.run(guildId);
      deps.stmts.deleteGuild.run(guildId);
      pushGuildUpdateToUsers(deps, affected);
      return true;
    }
    default:
      return false;
  }
}
