import type { EventBus, Store } from "@adv/core";
import {
  validateGuildErrorPayload,
  validateGuildUpdatePayload,
  WS_EVENTS,
  type GuildInfo,
  type GuildInviteEntry,
  type GuildMember,
  type GuildUpdatePayload,
} from "@adv/protocol";

import type { GameState, GuildState } from "../state/game-state";
import type { AuthService } from "./auth-service";
import { sanitizeClientText } from "./sanitize-client-text";
import type { WsClient } from "./ws-client";

export type GuildActionResult =
  | { readonly success: true; readonly message: string }
  | { readonly success: false; readonly message: string };

export type GuildService = {
  create(name: string): GuildActionResult;
  invite(username: string): GuildActionResult;
  acceptInvite(guildId: string): GuildActionResult;
  declineInvite(guildId: string): GuildActionResult;
  leave(): GuildActionResult;
  kick(username: string): GuildActionResult;
  disband(): GuildActionResult;
  sync(): boolean;
  getState(): GuildState;
  getGuild(): GuildInfo | null;
  getMembers(): readonly GuildMember[];
  getInvites(): readonly GuildInviteEntry[];
  getOutgoingInvites(): readonly GuildInviteEntry[];
  lastError(): string | null;
  clearError(): void;
  destroy(): void;
};

export type GuildServiceOptions = {
  readonly ws: WsClient;
  readonly auth: AuthService;
};

function emptyGuildState(): GuildState {
  return {
    guild: null,
    members: [],
    invites: [],
    outgoingInvites: [],
  };
}

export function createGuildService(
  store: Store<GameState>,
  eventBus: EventBus,
  options: GuildServiceOptions,
): GuildService {
  const { ws, auth } = options;
  const unsubs: Array<() => void> = [];
  let lastError: string | null = null;

  const setError = (message: string | null): void => {
    lastError = message;
    if (message !== null) {
      eventBus.publish("guild:error", { error: message });
    }
  };

  const canUseNetwork = (): boolean =>
    ws.status() === "open" && auth.isRegistered();

  const applyUpdate = (update: GuildUpdatePayload): void => {
    store.setState((prev) => ({
      ...prev,
      guild: {
        guild: update.guild,
        members: update.members,
        invites: update.invites,
        outgoingInvites: update.outgoingInvites,
      },
    }));
    eventBus.publish("guild:update", update);
  };

  unsubs.push(
    ws.on(WS_EVENTS.GUILD_UPDATE, (payload) => {
      const parsed = validateGuildUpdatePayload(payload);
      if (!parsed.ok) {
        return;
      }
      setError(null);
      applyUpdate(parsed.value);
    }),
  );

  unsubs.push(
    ws.on(WS_EVENTS.GUILD_ERROR, (payload) => {
      const parsed = validateGuildErrorPayload(payload);
      if (!parsed.ok) {
        return;
      }
      setError(parsed.value.error);
    }),
  );

  const sendAction = (
    type: string,
    payload: Record<string, unknown>,
    successMessage: string,
  ): GuildActionResult => {
    if (!canUseNetwork()) {
      return {
        success: false,
        message: "Gilden erfordern ein registriertes Konto und Verbindung.",
      };
    }
    if (!ws.send(type, payload)) {
      return { success: false, message: "Verbindung nicht verfügbar." };
    }
    setError(null);
    return { success: true, message: successMessage };
  };

  return {
    create(name) {
      const clean = sanitizeClientText(name, 32);
      if (clean.length < 3) {
        return {
          success: false,
          message: "Gildenname muss mindestens 3 Zeichen haben.",
        };
      }
      return sendAction(WS_EVENTS.GUILD_CREATE, { name: clean }, "Gilde erstellt.");
    },

    invite(username) {
      const clean = sanitizeClientText(username, 50);
      if (!clean) {
        return { success: false, message: "Bitte gib einen Namen ein." };
      }
      return sendAction(
        WS_EVENTS.GUILD_INVITE,
        { username: clean },
        `Einladung an ${clean} gesendet.`,
      );
    },

    acceptInvite(guildId) {
      const clean = sanitizeClientText(guildId, 64);
      if (!clean) {
        return { success: false, message: "Ungültige Einladung." };
      }
      return sendAction(
        WS_EVENTS.GUILD_ACCEPT_INVITE,
        { guildId: clean },
        "Gilde beigetreten.",
      );
    },

    declineInvite(guildId) {
      const clean = sanitizeClientText(guildId, 64);
      if (!clean) {
        return { success: false, message: "Ungültige Einladung." };
      }
      return sendAction(
        WS_EVENTS.GUILD_DECLINE_INVITE,
        { guildId: clean },
        "Einladung abgelehnt.",
      );
    },

    leave() {
      return sendAction(WS_EVENTS.GUILD_LEAVE, {}, "Gilde verlassen.");
    },

    kick(username) {
      const clean = sanitizeClientText(username, 50);
      if (!clean) {
        return { success: false, message: "Bitte gib einen Namen ein." };
      }
      return sendAction(
        WS_EVENTS.GUILD_KICK,
        { username: clean },
        `${clean} entfernt.`,
      );
    },

    disband() {
      return sendAction(WS_EVENTS.GUILD_DISBAND, {}, "Gilde aufgelöst.");
    },

    sync() {
      if (!canUseNetwork()) {
        return false;
      }
      return ws.send(WS_EVENTS.GUILD_GET, {});
    },

    getState() {
      return store.getState().guild;
    },

    getGuild() {
      return store.getState().guild.guild;
    },

    getMembers() {
      return store.getState().guild.members;
    },

    getInvites() {
      return store.getState().guild.invites;
    },

    getOutgoingInvites() {
      return store.getState().guild.outgoingInvites;
    },

    lastError() {
      return lastError;
    },

    clearError() {
      setError(null);
    },

    destroy() {
      for (const unsub of unsubs) {
        unsub();
      }
      unsubs.length = 0;
      store.setState((prev) => ({
        ...prev,
        guild: emptyGuildState(),
      }));
    },
  };
}
