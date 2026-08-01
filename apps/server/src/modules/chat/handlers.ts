import {
  validateChatGetHistoryPayload,
  validateChatGlobalPayload,
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
import { broadcastJson, sendJson } from "../../net/send";
import type { ClientSession } from "../../net/session";
import { sanitizeText } from "../auth/validate-local";

export type ChatHandlerDeps = {
  readonly stmts: PreparedStatements;
  readonly broadcastClients: () => Iterable<WebSocket>;
};

type ChatRow = {
  readonly id: string;
  readonly player: string;
  readonly message: string;
  readonly timestamp: number;
  readonly type: string;
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
    case WS_EVENTS.CHAT_GET_HISTORY: {
      const parsed = validateChatGetHistoryPayload(payload);
      if (!parsed.ok) {
        sendJson(ws, WS_EVENTS.CHAT_ERROR, { error: parsed.error });
        return true;
      }
      const guildId =
        typeof parsed.value.guildId === "string"
          ? sanitizeText(parsed.value.guildId, 64)
          : null;
      if (guildId !== null && guildId.length > 0) {
        sendJson(ws, WS_EVENTS.CHAT_ERROR, {
          error:
            "Gilden-Chatverlauf ist ohne serverseitige Mitgliedschaftsverwaltung nicht verfügbar.",
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
