import type { EventBus, Store } from "@adv/core";

import type { GameState } from "../state/game-state";
import { sanitizeClientText } from "./sanitize-client-text";

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
};

export function createFriendService(
  store: Store<GameState>,
  eventBus: EventBus,
  options: FriendServiceOptions = {},
): FriendService {
  const schedule = options.schedule ?? setTimeout;
  const clearSchedule = options.clearSchedule ?? clearTimeout;
  const nowFn = options.now ?? Date.now;
  const pendingTimers = new Set<ReturnType<typeof setTimeout>>();

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
      const state = store.getState();
      const playerName = state.hero.name;
      const cleanName = sanitizeClientText(name, 50);
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
      const state = store.getState();
      const playerName = state.hero.name;
      const cleanName = sanitizeClientText(name, 50);
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

    getFriends() {
      return store.getState().friends.list;
    },

    getPendingRequests() {
      const state = store.getState();
      return state.friends.pending.filter((r) => r.to === state.hero.name);
    },

    getSentRequests() {
      const state = store.getState();
      return state.friends.sent.filter((r) => r.from === state.hero.name);
    },

    destroy() {
      for (const timer of pendingTimers) {
        clearSchedule(timer);
      }
      pendingTimers.clear();
    },
  };
}
