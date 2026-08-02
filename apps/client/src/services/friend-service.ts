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

const MAX_FRIENDS = 50;
const SIMULATED_NAMES = [
  "Eldor",
  "Chronos",
  "Luminos",
  "Thalia",
  "Aria",
  "Kaelen",
  "Morrigan",
  "Archivar",
  "Mnemosyne",
] as const;

export type FriendActionResult =
  | { readonly success: true; readonly message: string }
  | { readonly success: false; readonly message: string };

export type FriendService = {
  addFriend(name: string): FriendActionResult;
  acceptFriend(name: string): FriendActionResult;
  declineFriendRequest(name: string): FriendActionResult;
  cancelSentRequest(name: string): FriendActionResult;
  removeFriend(name: string): FriendActionResult;
  simulateIncomingRequest(name: string): void;
  sync(): boolean;
  lastError(): string | null;
  clearError(): void;
  getFriends(): GameState["friends"]["list"];
  getPendingRequests(): GameState["friends"]["pending"];
  getSentRequests(): GameState["friends"]["sent"];
  destroy(): void;
};

export type FriendServiceOptions = {
  readonly schedule?: (
    fn: () => void,
    ms: number,
  ) => ReturnType<typeof setTimeout>;
  readonly clearSchedule?: (id: ReturnType<typeof setTimeout>) => void;
  readonly now?: () => number;
  readonly ws?: WsClient;
  readonly auth?: AuthService;
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
  options: FriendServiceOptions = {},
): FriendService {
  const schedule = options.schedule ?? setTimeout;
  const clearSchedule = options.clearSchedule ?? clearTimeout;
  const nowFn = options.now ?? Date.now;
  const ws = options.ws;
  const auth = options.auth;
  const pendingTimers = new Set<ReturnType<typeof setTimeout>>();
  const unsubs: Array<() => void> = [];
  let lastError: string | null = null;

  const setError = (message: string | null): void => {
    lastError = message;
    if (message !== null) {
      eventBus.publish("friend:error", { error: message });
    }
  };

  const canUseNetwork = (): boolean =>
    ws !== undefined &&
    ws.status() === "open" &&
    auth !== undefined &&
    auth.isRegistered();

  const applyServerUpdate = (list: readonly FriendEntry[], pending: readonly FriendRequestEntry[], sent: readonly FriendRequestEntry[]): void => {
    store.setState((prev) => ({
      ...prev,
      friends: {
        list: list.map(mapFriendEntry),
        pending: pending.map(mapRequest),
        sent: sent.map(mapRequest),
      },
    }));
    eventBus.publish("friend:update", { list, pending, sent });
  };

  if (ws !== undefined) {
    unsubs.push(
      ws.on(WS_EVENTS.FRIEND_UPDATE, (payload) => {
        const parsed = validateFriendUpdatePayload(payload);
        if (!parsed.ok) {
          return;
        }
        setError(null);
        applyServerUpdate(
          parsed.value.list,
          parsed.value.pending,
          parsed.value.sent,
        );
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
  }

  const scheduleAccept = (cleanName: string): void => {
    const isSimulated = SIMULATED_NAMES.map((n) => n.toLowerCase()).includes(
      cleanName.toLowerCase(),
    );
    const delay = isSimulated ? 5_000 : 10_000;
    const timer = schedule(() => {
      pendingTimers.delete(timer);
      const current = store.getState();
      const stillSent = current.friends.sent.some((r) => r.to === cleanName);
      if (!stillSent || current.friends.list.length >= MAX_FRIENDS) {
        return;
      }
      store.setState((prev) => ({
        ...prev,
        friends: {
          ...prev.friends,
          sent: prev.friends.sent.filter((r) => r.to !== cleanName),
          list: [...prev.friends.list, { name: cleanName, added: nowFn() }],
        },
      }));
      eventBus.publish("friend:accepted", { name: cleanName });
    }, delay);
    pendingTimers.add(timer);
  };

  return {
    addFriend(name) {
      const state = store.getState();
      const playerName = state.hero.name;
      const cleanName = sanitizeClientText(name, 50);
      if (!cleanName) {
        return { success: false, message: "Bitte gib einen Namen ein." };
      }
      if (cleanName === playerName) {
        return {
          success: false,
          message: "Du kannst dich nicht selbst als Freund hinzufügen.",
        };
      }
      if (canUseNetwork() && ws !== undefined) {
        const sent = ws.send(WS_EVENTS.FRIEND_REQUEST, { username: cleanName });
        if (!sent) {
          return {
            success: false,
            message: "Verbindung nicht verfügbar.",
          };
        }
        setError(null);
        return { success: true, message: `Anfrage an ${cleanName} gesendet.` };
      }
      if (state.friends.list.some((f) => f.name === cleanName)) {
        return {
          success: false,
          message: `${cleanName} ist bereits dein Freund.`,
        };
      }
      if (state.friends.list.length >= MAX_FRIENDS) {
        return {
          success: false,
          message: "Du hast die maximale Anzahl an Freunden erreicht.",
        };
      }
      if (
        state.friends.pending.some(
          (r) => r.from === cleanName && r.to === playerName,
        )
      ) {
        return this.acceptFriend(cleanName);
      }
      if (state.friends.sent.some((r) => r.to === cleanName)) {
        return {
          success: false,
          message: "Du hast bereits eine Anfrage an diese Person gesendet.",
        };
      }

      store.setState((prev) => ({
        ...prev,
        friends: {
          ...prev.friends,
          sent: [
            ...prev.friends.sent,
            { from: playerName, to: cleanName, timestamp: nowFn() },
          ],
        },
      }));
      eventBus.publish("friend:requestSent", {
        from: playerName,
        to: cleanName,
      });
      scheduleAccept(cleanName);
      return { success: true, message: `Anfrage an ${cleanName} gesendet.` };
    },

    acceptFriend(name) {
      const cleanName = sanitizeClientText(name, 50);
      if (canUseNetwork() && ws !== undefined) {
        const sent = ws.send(WS_EVENTS.FRIEND_ACCEPT, { username: cleanName });
        if (!sent) {
          return { success: false, message: "Verbindung nicht verfügbar." };
        }
        setError(null);
        return { success: true, message: `${cleanName} ist jetzt dein Freund.` };
      }
      const state = store.getState();
      const playerName = state.hero.name;
      const request = state.friends.pending.find(
        (r) => r.from === cleanName && r.to === playerName,
      );
      if (!request) {
        return { success: false, message: "Keine Anfrage von dieser Person." };
      }
      if (state.friends.list.length >= MAX_FRIENDS) {
        return {
          success: false,
          message: "Du hast die maximale Anzahl an Freunden erreicht.",
        };
      }

      store.setState((prev) => ({
        ...prev,
        friends: {
          ...prev.friends,
          list: [...prev.friends.list, { name: cleanName, added: nowFn() }],
          pending: prev.friends.pending.filter(
            (r) => !(r.from === cleanName && r.to === playerName),
          ),
        },
      }));
      eventBus.publish("friend:accepted", { name: cleanName });
      return { success: true, message: `${cleanName} ist jetzt dein Freund.` };
    },

    declineFriendRequest(name) {
      const cleanName = sanitizeClientText(name, 50);
      if (canUseNetwork() && ws !== undefined) {
        const sent = ws.send(WS_EVENTS.FRIEND_DECLINE, { username: cleanName });
        if (!sent) {
          return { success: false, message: "Verbindung nicht verfügbar." };
        }
        setError(null);
        return {
          success: true,
          message: `Anfrage von ${cleanName} abgelehnt.`,
        };
      }
      const state = store.getState();
      const playerName = state.hero.name;
      const request = state.friends.pending.find(
        (r) => r.from === cleanName && r.to === playerName,
      );
      if (!request) {
        return { success: false, message: "Keine Anfrage von dieser Person." };
      }
      store.setState((prev) => ({
        ...prev,
        friends: {
          ...prev.friends,
          pending: prev.friends.pending.filter(
            (r) => !(r.from === cleanName && r.to === playerName),
          ),
        },
      }));
      eventBus.publish("friend:requestDeclined", { name: cleanName });
      return {
        success: true,
        message: `Anfrage von ${cleanName} abgelehnt.`,
      };
    },

    cancelSentRequest(name) {
      const cleanName = sanitizeClientText(name, 50);
      if (canUseNetwork() && ws !== undefined) {
        const sent = ws.send(WS_EVENTS.FRIEND_CANCEL, { username: cleanName });
        if (!sent) {
          return { success: false, message: "Verbindung nicht verfügbar." };
        }
        setError(null);
        return {
          success: true,
          message: `Anfrage an ${cleanName} zurückgezogen.`,
        };
      }
      const request = store
        .getState()
        .friends.sent.find((r) => r.to === cleanName);
      if (!request) {
        return {
          success: false,
          message: "Keine gesendete Anfrage an diese Person.",
        };
      }
      store.setState((prev) => ({
        ...prev,
        friends: {
          ...prev.friends,
          sent: prev.friends.sent.filter((r) => r.to !== cleanName),
        },
      }));
      eventBus.publish("friend:sentCancelled", { name: cleanName });
      return {
        success: true,
        message: `Anfrage an ${cleanName} zurückgezogen.`,
      };
    },

    removeFriend(name) {
      const cleanName = sanitizeClientText(name, 50);
      if (canUseNetwork() && ws !== undefined) {
        const sent = ws.send(WS_EVENTS.FRIEND_REMOVE, { username: cleanName });
        if (!sent) {
          return { success: false, message: "Verbindung nicht verfügbar." };
        }
        setError(null);
        return { success: true, message: `${cleanName} entfernt.` };
      }
      if (!store.getState().friends.list.some((f) => f.name === cleanName)) {
        return {
          success: false,
          message: `${cleanName} ist nicht in deiner Freundesliste.`,
        };
      }
      store.setState((prev) => ({
        ...prev,
        friends: {
          ...prev.friends,
          list: prev.friends.list.filter((f) => f.name !== cleanName),
        },
      }));
      eventBus.publish("friend:removed", { name: cleanName });
      return { success: true, message: `${cleanName} entfernt.` };
    },

    simulateIncomingRequest(name) {
      const state = store.getState();
      const playerName = state.hero.name;
      const cleanName = sanitizeClientText(name, 50);
      if (!cleanName || cleanName === playerName) {
        return;
      }
      if (state.friends.list.some((f) => f.name === cleanName)) {
        return;
      }
      if (state.friends.pending.some((r) => r.from === cleanName)) {
        return;
      }
      store.setState((prev) => ({
        ...prev,
        friends: {
          ...prev.friends,
          pending: [
            ...prev.friends.pending,
            { from: cleanName, to: playerName, timestamp: nowFn() },
          ],
        },
      }));
      eventBus.publish("friend:requestReceived", {
        from: cleanName,
        to: playerName,
      });
    },

    sync() {
      if (!canUseNetwork() || ws === undefined) {
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
      for (const timer of pendingTimers) {
        clearSchedule(timer);
      }
      pendingTimers.clear();
      for (const unsub of unsubs) {
        unsub();
      }
      unsubs.length = 0;
    },
  };
}
