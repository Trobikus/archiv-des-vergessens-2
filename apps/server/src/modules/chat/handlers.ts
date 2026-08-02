import {
  validateChatGetHistoryPayload,
  validateChatGlobalPayload,
  validateChatGuildPayload,
  WS_EVENTS,
  type ChatMessage,
} from "@adv/protocol";
import type { WebSocket } from "ws";

import type { PreparedStatements } from "../../db/open";
import {
  CHAT_HISTORY_LIMIT,
  CHAT_PRUNE_KEEP,
  MAX_CHAT_MESSAGE_LENGTH,
} from "../../db/schema";
import { broadcastJson, sendJson, sendToUserIds } from "../../net/send";
import type { ClientSession } from "../../net/session";
import { hasActiveRegisteredSession } from "../auth/session-guard";
import { sanitizeText } from "../auth/validate-local";
import { getUserGuildId } from "../guild/handlers";

export type ChatHandlerDeps = {
  readonly stmts: PreparedStatements;
  readonly broadcastClients: () => Iterable<WebSocket>;
  readonly forEachSession: (
    fn: (ws: WebSocket, session: ClientSession) => void,
  ) => void;
};

type ChatRow = {
  readonly id: string;
  readonly player: string;
  readonly message: string;
  readonly timestamp: number;
  readonly type: string;
  readonly guildId: string | null;
};

let chatMessageCounter = 0;

function createChatId(): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${Date.now().toString(36)}_${rand}`;
}

export function getGlobalChatHistory(
  stmts: PreparedStatements,
  limit = CHAT_HISTORY_LIMIT,
): ChatMessage[] {
  const rows = stmts.getGlobalChatHistory.all(limit) as ChatRow[];
  return rows
    .map((row) => ({
      id: row.id,
      player: row.player,
      message: row.message,
      timestamp: row.timestamp,
      type: "global" as const,
    }))
    .reverse();
}

export function getGuildChatHistory(
  stmts: PreparedStatements,
  guildId: string,
  limit = CHAT_HISTORY_LIMIT,
): ChatMessage[] {
  const rows = stmts.getGuildChatHistory.all(guildId, limit) as ChatRow[];
  return rows
    .map((row) => ({
      id: row.id,
      player: row.player,
      message: row.message,
      timestamp: row.timestamp,
      type: "guild" as const,
      guildId,
    }))
    .reverse();
}

export function sendChatHistory(
  ws: WebSocket,
  stmts: PreparedStatements,
): void {
  const messages = getGlobalChatHistory(stmts);
  for (const msg of messages) {
    sendJson(ws, WS_EVENTS.CHAT_GLOBAL_MESSAGE, { ...msg });
  }
}

function maybePruneChats(stmts: PreparedStatements): void {
  chatMessageCounter += 1;
  if (chatMessageCounter % 25 !== 0) {
    return;
  }
  const countRow = stmts.countChats.get() as { count: number } | undefined;
  if (countRow !== undefined && countRow.count > CHAT_PRUNE_KEEP + 50) {
    stmts.pruneOldChats.run(CHAT_PRUNE_KEEP);
  }
}

function guildMemberUserIds(
  stmts: PreparedStatements,
  guildId: string,
): string[] {
  const rows = stmts.listGuildMembers.all(guildId) as Array<{
    userId: string;
  }>;
  return rows.map((row) => row.userId);
}

export function handleChatMessage(
  ws: WebSocket,
  type: string,
  payload: Record<string, unknown>,
  session: ClientSession,
  deps: ChatHandlerDeps,
): boolean {
  switch (type) {
    case WS_EVENTS.CHAT_GLOBAL: {
      if (session.userId === null) {
        sendJson(ws, WS_EVENTS.CHAT_ERROR, {
          error: "Nicht authentifiziert.",
        });
        return true;
      }
      const parsed = validateChatGlobalPayload(payload);
      if (!parsed.ok) {
        sendJson(ws, WS_EVENTS.CHAT_ERROR, { error: parsed.error });
        return true;
      }
      const text = sanitizeText(parsed.value.message, MAX_CHAT_MESSAGE_LENGTH);
      if (text.length === 0) {
        sendJson(ws, WS_EVENTS.CHAT_ERROR, {
          error: "Nachricht darf nicht leer sein.",
        });
        return true;
      }
      const msg: ChatMessage = {
        id: createChatId(),
        player: session.username,
        message: text,
        timestamp: Date.now(),
        type: "global",
      };
      try {
        deps.stmts.insertChat.run(
          msg.id,
          msg.player,
          msg.message,
          msg.timestamp,
          msg.type,
          null,
        );
        maybePruneChats(deps.stmts);
      } catch {
        sendJson(ws, WS_EVENTS.CHAT_ERROR, {
          error: "Nachricht konnte nicht gespeichert werden.",
        });
        return true;
      }
      broadcastJson(deps.broadcastClients(), WS_EVENTS.CHAT_GLOBAL_MESSAGE, {
        ...msg,
      });
      return true;
    }
    case WS_EVENTS.CHAT_GUILD: {
      if (
        !hasActiveRegisteredSession(session, deps.stmts) ||
        session.userId === null
      ) {
        sendJson(ws, WS_EVENTS.CHAT_ERROR, {
          error: "Nur registrierte Konten können im Gilden-Chat schreiben.",
        });
        return true;
      }
      const userId = session.userId;
      const guildId = getUserGuildId(deps.stmts, userId);
      if (guildId === null) {
        sendJson(ws, WS_EVENTS.CHAT_ERROR, {
          error: "Du bist in keiner Gilde.",
        });
        return true;
      }
      const parsed = validateChatGuildPayload(payload);
      if (!parsed.ok) {
        sendJson(ws, WS_EVENTS.CHAT_ERROR, { error: parsed.error });
        return true;
      }
      const text = sanitizeText(parsed.value.message, MAX_CHAT_MESSAGE_LENGTH);
      if (text.length === 0) {
        sendJson(ws, WS_EVENTS.CHAT_ERROR, {
          error: "Nachricht darf nicht leer sein.",
        });
        return true;
      }
      const msg: ChatMessage = {
        id: createChatId(),
        player: session.username,
        message: text,
        timestamp: Date.now(),
        type: "guild",
        guildId,
      };
      try {
        deps.stmts.insertChat.run(
          msg.id,
          msg.player,
          msg.message,
          msg.timestamp,
          msg.type,
          guildId,
        );
        maybePruneChats(deps.stmts);
      } catch {
        sendJson(ws, WS_EVENTS.CHAT_ERROR, {
          error: "Nachricht konnte nicht gespeichert werden.",
        });
        return true;
      }
      sendToUserIds(
        deps.forEachSession,
        guildMemberUserIds(deps.stmts, guildId),
        WS_EVENTS.CHAT_GUILD_MESSAGE,
        { ...msg },
      );
      return true;
    }
    case WS_EVENTS.CHAT_GET_HISTORY: {
      const parsed = validateChatGetHistoryPayload(payload);
      if (!parsed.ok) {
        sendJson(ws, WS_EVENTS.CHAT_ERROR, { error: parsed.error });
        return true;
      }
      const requestedGuildId =
        typeof parsed.value.guildId === "string"
          ? sanitizeText(parsed.value.guildId, 64)
          : null;
      if (requestedGuildId !== null && requestedGuildId.length > 0) {
        if (
          !hasActiveRegisteredSession(session, deps.stmts) ||
          session.userId === null
        ) {
          sendJson(ws, WS_EVENTS.CHAT_ERROR, {
            error: "Gilden-Chatverlauf erfordert ein registriertes Konto.",
          });
          return true;
        }
        const userId = session.userId;
        const memberGuildId = getUserGuildId(deps.stmts, userId);
        if (memberGuildId === null || memberGuildId !== requestedGuildId) {
          sendJson(ws, WS_EVENTS.CHAT_ERROR, {
            error: "Kein Zugriff auf diesen Gilden-Chatverlauf.",
          });
          return true;
        }
        sendJson(ws, WS_EVENTS.CHAT_HISTORY, {
          messages: getGuildChatHistory(deps.stmts, requestedGuildId),
        });
        return true;
      }
      sendJson(ws, WS_EVENTS.CHAT_HISTORY, {
        messages: getGlobalChatHistory(deps.stmts),
      });
      return true;
    }
    default:
      return false;
  }
}
