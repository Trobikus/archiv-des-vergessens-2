import {
  PERFORMANCE_BUDGETS,
  type EventBus,
  type Store,
} from "@adv/core";
import {
  validateChatErrorPayload,
  validateChatHistoryPayload,
  validateChatMessage,
  WS_EVENTS,
  type ChatMessage,
} from "@adv/protocol";

import type { ClanChatMessage, GameState } from "../state/game-state";
import { sanitizeClientText } from "./sanitize-client-text";
import type { WsClient } from "./ws-client";

const MAX_MESSAGES = PERFORMANCE_BUDGETS.maxChatMessages;
const MAX_MESSAGE_LENGTH = 200;

export type ChatSendResult =
  | { readonly success: true }
  | { readonly success: false; readonly message: string };

export type ChatService = {
  sendGlobal(text: string): ChatSendResult;
  sendClan(text: string): ChatSendResult;
  getGlobalMessages(limit?: number): readonly ChatMessage[];
  getClanMessages(limit?: number): readonly ClanChatMessage[];
  getHistory(guildId?: string | null): boolean;
  lastError(): string | null;
  clearError(): void;
  clearGlobal(): void;
  clearClan(): void;
  clearLocal(): void;
  destroy(): void;
};

function createLocalId(): string {
  return `local_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function trimMessages<T>(messages: readonly T[]): T[] {
  if (messages.length <= MAX_MESSAGES) {
    return [...messages];
  }
  return messages.slice(messages.length - MAX_MESSAGES);
}

export function createChatService(
  store: Store<GameState>,
  eventBus: EventBus,
  ws: WsClient,
): ChatService {
  const unsubs: Array<() => void> = [];
  let lastError: string | null = null;

  const setError = (message: string | null): void => {
    lastError = message;
    if (message !== null) {
      eventBus.publish("chat:error", { error: message });
    }
  };

  const appendGlobal = (msg: ChatMessage): void => {
    store.setState((prev) => ({
      ...prev,
      chat: {
        ...prev.chat,
        global: trimMessages([...prev.chat.global, msg]),
      },
    }));
    eventBus.publish("chat:globalMessage", msg);
  };

  const appendClan = (msg: ClanChatMessage): void => {
    store.setState((prev) => ({
      ...prev,
      chat: {
        ...prev.chat,
        clan: trimMessages([...prev.chat.clan, msg]),
      },
    }));
    eventBus.publish("chat:clanMessage", msg);
  };

  unsubs.push(
    ws.on(WS_EVENTS.CHAT_GLOBAL_MESSAGE, (payload) => {
      const parsed = validateChatMessage(payload);
      if (!parsed.ok || parsed.value.type !== "global") {
        return;
      }
      appendGlobal(parsed.value);
    }),
  );

  unsubs.push(
    ws.on(WS_EVENTS.CHAT_GUILD_MESSAGE, (payload) => {
      const parsed = validateChatMessage(payload);
      if (!parsed.ok || parsed.value.type !== "guild") {
        return;
      }
      appendClan({
        id: parsed.value.id,
        player: parsed.value.player,
        message: parsed.value.message,
        timestamp: parsed.value.timestamp,
        type: "guild",
        ...(typeof parsed.value.guildId === "string"
          ? { guildId: parsed.value.guildId }
          : {}),
      });
    }),
  );

  unsubs.push(
    ws.on(WS_EVENTS.CHAT_HISTORY, (payload) => {
      const parsed = validateChatHistoryPayload(payload);
      if (!parsed.ok) {
        return;
      }
      setError(null);
      const globalMsgs = parsed.value.messages.filter(
        (msg) => msg.type === "global",
      );
      const guildMsgs = parsed.value.messages
        .filter((msg) => msg.type === "guild")
        .map((msg): ClanChatMessage => {
          return {
            id: msg.id,
            player: msg.player,
            message: msg.message,
            timestamp: msg.timestamp,
            type: "guild",
            ...(typeof msg.guildId === "string" ? { guildId: msg.guildId } : {}),
          };
        });
      store.setState((prev) => ({
        ...prev,
        chat: {
          global:
            globalMsgs.length > 0
              ? trimMessages(globalMsgs)
              : prev.chat.global,
          clan:
            guildMsgs.length > 0 ? trimMessages(guildMsgs) : prev.chat.clan,
        },
      }));
      eventBus.publish("chat:history", { messages: parsed.value.messages });
    }),
  );

  unsubs.push(
    ws.on(WS_EVENTS.CHAT_ERROR, (payload) => {
      const parsed = validateChatErrorPayload(payload);
      if (!parsed.ok) {
        return;
      }
      setError(parsed.value.error);
    }),
  );

  return {
    sendGlobal(text) {
      const clean = sanitizeClientText(text, MAX_MESSAGE_LENGTH);
      if (!clean) {
        const message = "Nachricht darf nicht leer sein.";
        setError(message);
        return { success: false, message };
      }

      if (ws.status() === "open" && ws.send(WS_EVENTS.CHAT_GLOBAL, { message: clean })) {
        setError(null);
        return { success: true };
      }

      const player = store.getState().hero.name || "Gast";
      appendGlobal({
        id: createLocalId(),
        player,
        message: clean,
        timestamp: Date.now(),
        type: "global",
      });
      setError(null);
      return { success: true };
    },

    sendClan(text) {
      const clean = sanitizeClientText(text, MAX_MESSAGE_LENGTH);
      if (!clean) {
        const message = "Nachricht darf nicht leer sein.";
        setError(message);
        return { success: false, message };
      }

      const guildId = store.getState().guild.guild?.id ?? null;
      if (
        guildId !== null &&
        ws.status() === "open" &&
        ws.send(WS_EVENTS.CHAT_GUILD, { message: clean })
      ) {
        setError(null);
        return { success: true };
      }

      if (guildId === null && ws.status() === "open") {
        const message =
          "Tritt einer Gilde bei, um den Gilden-Chat zu nutzen.";
        setError(message);
        return { success: false, message };
      }

      const player = store.getState().hero.name || "Gast";
      appendClan({
        id: createLocalId(),
        player,
        message: clean,
        timestamp: Date.now(),
        type: guildId !== null ? "guild" : "clan",
        ...(guildId !== null ? { guildId } : {}),
      });
      setError(null);
      return { success: true };
    },

    getGlobalMessages(limit = 50) {
      return store.getState().chat.global.slice(-limit);
    },

    getClanMessages(limit = 50) {
      return store.getState().chat.clan.slice(-limit);
    },

    getHistory(guildId) {
      if (ws.status() !== "open") {
        return false;
      }
      if (typeof guildId === "string" && guildId.length > 0) {
        return ws.send(WS_EVENTS.CHAT_GET_HISTORY, { guildId });
      }
      return ws.send(WS_EVENTS.CHAT_GET_HISTORY, {});
    },

    lastError() {
      return lastError;
    },

    clearError() {
      setError(null);
    },

    clearGlobal() {
      store.setState((prev) => ({
        ...prev,
        chat: { ...prev.chat, global: [] },
      }));
      eventBus.publish("chat:cleared", { type: "global" });
    },

    clearClan() {
      store.setState((prev) => ({
        ...prev,
        chat: { ...prev.chat, clan: [] },
      }));
      eventBus.publish("chat:cleared", { type: "clan" });
    },

    clearLocal() {
      store.setState((prev) => ({
        ...prev,
        chat: { global: [], clan: [] },
      }));
      eventBus.publish("chat:cleared", { type: "all" });
    },

    destroy() {
      for (const unsub of unsubs) {
        unsub();
      }
      unsubs.length = 0;
    },
  };
}
