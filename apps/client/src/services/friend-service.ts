import type { EventBus, Store } from "@adv/core";
import {
  validateFriendErrorPayload,
  validateFriendUpdatePayload,
  WS_EVENTS,
  type FriendEntry,
  type FriendRequestEntry,
} from "@adv/protocol";

import type { GameState } from "../state/game-state";
import type { AuthService } from "./auth-service";
import { sanitizeClientText } from "./sanitize-client-text";
import type { WsClient } from "./ws-client";

export type FriendActionResult =
  | { readonly success: true; readonly message: string }
  | { readonly success: false; readonly message: string };

export type FriendService = {
  addFriend(name: string): FriendActionResult;
  acceptFriend(name: string): FriendActionResult;
  declineFriendRequest(name: string): FriendActionResult;
  cancelSentRequest(name: string): FriendActionResult;
  removeFriend(name: string): FriendActionResult;
  sync(): boolean;
  lastError(): string | null;
  clearError(): void;
  getFriends(): GameState["friends"]["list"];
  getPendingRequests(): GameState["friends"]["pending"];
  getSentRequests(): GameState["friends"]["sent"];
  destroy(): void;
};

export type FriendServiceOptions = {
  readonly ws: WsClient;
  readonly auth: AuthService;
};

function mapFriendEntry(entry: FriendEntry): GameState["friends"]["list"][number] {
  return {
    name: entry.username,
    added: entry.added,
    userId: entry.userId,
  };
}

function mapRequest(
  entry: FriendRequestEntry,
): GameState["friends"]["pending"][number] {
  return {
    from: entry.fromUsername,
    to: entry.toUsername,
    timestamp: entry.timestamp,
    fromUserId: entry.fromUserId,
    toUserId: entry.toUserId,
  };
}

export function createFriendService(
  store: Store<GameState>,
  eventBus: EventBus,
  options: FriendServiceOptions,
): FriendService {
  const { ws, auth } = options;
  const unsubs: Array<() => void> = [];
  let lastError: string | null = null;

  const setError = (message: string | null): void => {
    lastError = message;
    if (message !== null) {
      eventBus.publish("friend:error", { error: message });
    }
  };

  const canUseNetwork = (): boolean =>
    ws.status() === "open" && auth.isRegistered();

  const requireNetwork = (): FriendActionResult | null => {
    if (!auth.isRegistered()) {
      return {
        success: false,
        message: "Freunde erfordern ein registriertes Konto.",
      };
    }
    if (ws.status() !== "open") {
      return {
        success: false,
        message: "Keine Verbindung zum Server.",
      };
    }
    return null;
  };

  const sendAction = (
    type: string,
    username: string,
    successMessage: string,
  ): FriendActionResult => {
    const blocked = requireNetwork();
    if (blocked !== null) {
      return blocked;
    }
    if (!ws.send(type, { username })) {
      return { success: false, message: "Verbindung nicht verfügbar." };
    }
    setError(null);
    return { success: true, message: successMessage };
  };

  unsubs.push(
    ws.on(WS_EVENTS.FRIEND_UPDATE, (payload) => {
      const parsed = validateFriendUpdatePayload(payload);
      if (!parsed.ok) {
        return;
      }
      setError(null);
      store.setState((prev) => ({
        ...prev,
        friends: {
          list: parsed.value.list.map(mapFriendEntry),
          pending: parsed.value.pending.map(mapRequest),
          sent: parsed.value.sent.map(mapRequest),
        },
      }));
      eventBus.publish("friend:update", parsed.value);
    }),
  );

  unsubs.push(
    ws.on(WS_EVENTS.FRIEND_ERROR, (payload) => {
      const parsed = validateFriendErrorPayload(payload);
      if (!parsed.ok) {
        return;
      }
      setError(parsed.value.error);
    }),
  );

  return {
    addFriend(name) {
      const playerName = store.getState().hero.name;
      const authName = auth.store.getState().user?.username ?? playerName;
      const cleanName = sanitizeClientText(name, 50);
      if (!cleanName) {
        return { success: false, message: "Bitte gib einen Namen ein." };
      }
      if (cleanName.toLowerCase() === authName.toLowerCase()) {
        return {
          success: false,
          message: "Du kannst dich nicht selbst als Freund hinzufügen.",
        };
      }
      return sendAction(
        WS_EVENTS.FRIEND_REQUEST,
        cleanName,
        `Anfrage an ${cleanName} gesendet.`,
      );
    },

    acceptFriend(name) {
      const cleanName = sanitizeClientText(name, 50);
      if (!cleanName) {
        return { success: false, message: "Bitte gib einen Namen ein." };
      }
      return sendAction(
        WS_EVENTS.FRIEND_ACCEPT,
        cleanName,
        `${cleanName} ist jetzt dein Freund.`,
      );
    },

    declineFriendRequest(name) {
      const cleanName = sanitizeClientText(name, 50);
      if (!cleanName) {
        return { success: false, message: "Bitte gib einen Namen ein." };
      }
      return sendAction(
        WS_EVENTS.FRIEND_DECLINE,
        cleanName,
        `Anfrage von ${cleanName} abgelehnt.`,
      );
    },

    cancelSentRequest(name) {
      const cleanName = sanitizeClientText(name, 50);
      if (!cleanName) {
        return { success: false, message: "Bitte gib einen Namen ein." };
      }
      return sendAction(
        WS_EVENTS.FRIEND_CANCEL,
        cleanName,
        `Anfrage an ${cleanName} zurückgezogen.`,
      );
    },

    removeFriend(name) {
      const cleanName = sanitizeClientText(name, 50);
      if (!cleanName) {
        return { success: false, message: "Bitte gib einen Namen ein." };
      }
      return sendAction(
        WS_EVENTS.FRIEND_REMOVE,
        cleanName,
        `${cleanName} entfernt.`,
      );
    },

    sync() {
      if (!canUseNetwork()) {
        return false;
      }
      return ws.send(WS_EVENTS.FRIEND_LIST, {});
    },

    lastError() {
      return lastError;
    },

    clearError() {
      setError(null);
    },

    getFriends() {
      return store.getState().friends.list;
    },

    getPendingRequests() {
      return store.getState().friends.pending;
    },

    getSentRequests() {
      return store.getState().friends.sent;
    },

    destroy() {
      for (const unsub of unsubs) {
        unsub();
      }
      unsubs.length = 0;
    },
  };
}
