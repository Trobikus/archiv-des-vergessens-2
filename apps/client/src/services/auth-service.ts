import { createLogger, createStore, type Store } from "@adv/core";
import {
  authErrorKey,
  normalizeAuthErrorCode,
  validateAuthConvertGuestSuccessPayload,
  validateAuthSessionSuccessPayload,
  WS_EVENTS,
  type AuthUser,
} from "@adv/protocol";

import type { WsClient } from "./ws-client";

const log = createLogger("auth-service");

const SESSION_KEY = "adv2_auth_session";
const GUEST_KEY = "adv2_guest_id";

export type AuthSessionState = {
  readonly user: AuthUser | null;
  readonly token: string | null;
  readonly ready: boolean;
  readonly lastError: string | null;
};

export type AuthService = {
  readonly store: Store<AuthSessionState>;
  boot(): Promise<void>;
  playAsGuest(username?: string): Promise<boolean>;
  register(input: {
    username: string;
    email: string;
    password: string;
  }): Promise<boolean>;
  login(input: {
    usernameOrEmail: string;
    password: string;
  }): Promise<boolean>;
  convertGuest(input: {
    username: string;
    email: string;
    password: string;
  }): Promise<boolean>;
  logout(): void;
  isRegistered(): boolean;
  guestId(): string;
  destroy(): void;
};

export type AuthServiceOptions = {
  readonly ws: WsClient;
  readonly storage?: Pick<Storage, "getItem" | "setItem" | "removeItem">;
};

function createGuestId(): string {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `guest_${Date.now().toString(36)}_${rand}`;
}

function readStoredSession(
  storage: Pick<Storage, "getItem">,
): { user: AuthUser; token: string } | null {
  const raw = storage.getItem(SESSION_KEY);
  if (raw === null) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    const validated = validateAuthSessionSuccessPayload(parsed);
    if (!validated.ok) {
      return null;
    }
    return validated.value;
  } catch {
    return null;
  }
}

export function createAuthService(options: AuthServiceOptions): AuthService {
  const storage =
    options.storage ??
    (typeof localStorage !== "undefined"
      ? localStorage
      : {
          getItem: () => null,
          setItem: () => undefined,
          removeItem: () => undefined,
        });
  const store = createStore<AuthSessionState>({
    initialState: {
      user: null,
      token: null,
      ready: false,
      lastError: null,
    },
  });

  let guestIdValue = storage.getItem(GUEST_KEY);
  if (guestIdValue === null || !guestIdValue.startsWith("guest_")) {
    guestIdValue = createGuestId();
    storage.setItem(GUEST_KEY, guestIdValue);
  }
  const stableGuestId = guestIdValue;

  const persistSession = (user: AuthUser, token: string): void => {
    storage.setItem(SESSION_KEY, JSON.stringify({ user, token }));
    store.setState((prev) => ({
      ...prev,
      user,
      token,
      lastError: null,
      ready: true,
    }));
  };

  const clearSession = (): void => {
    storage.removeItem(SESSION_KEY);
    store.setState((prev) => ({
      ...prev,
      user: null,
      token: null,
      lastError: null,
    }));
  };

  const setError = (code: string): void => {
    const normalized = normalizeAuthErrorCode(code);
    store.setState((prev) => ({
      ...prev,
      lastError: normalized !== null ? authErrorKey(normalized) : code,
    }));
  };

  const applySuccess = (
    type: string,
    payload: Record<string, unknown>,
  ): boolean => {
    if (type === WS_EVENTS.AUTH_CONVERT_GUEST_SUCCESS) {
      const parsed = validateAuthConvertGuestSuccessPayload(payload);
      if (!parsed.ok) {
        setError(authErrorKey("server_error"));
        return false;
      }
      persistSession(parsed.value.user, parsed.value.token);
      return true;
    }
    const parsed = validateAuthSessionSuccessPayload(payload);
    if (!parsed.ok) {
      setError(authErrorKey("server_error"));
      return false;
    }
    persistSession(parsed.value.user, parsed.value.token);
    return true;
  };

  return {
    store,
    guestId() {
      return stableGuestId;
    },
    isRegistered() {
      const state = store.getState();
      return (
        state.user !== null && !state.user.isGuest && state.token !== null
      );
    },
    async boot() {
      try {
        await options.ws.connect();
      } catch (cause) {
        log.warn(
          `ws connect failed: ${cause instanceof Error ? cause.message : String(cause)}`,
        );
        await this.playAsGuest();
        store.setState((prev) => ({ ...prev, ready: true }));
        return;
      }

      const stored = readStoredSession(storage);
      if (stored !== null) {
        try {
          const response = await options.ws.request(
            WS_EVENTS.AUTH_VERIFY_TOKEN,
            { userId: stored.user.id, token: stored.token },
            [WS_EVENTS.AUTH_VERIFY_TOKEN_SUCCESS],
            [WS_EVENTS.AUTH_VERIFY_TOKEN_ERROR],
          );
          if (response.type === WS_EVENTS.AUTH_VERIFY_TOKEN_SUCCESS) {
            applySuccess(response.type, response.payload);
            store.setState((prev) => ({ ...prev, ready: true }));
            return;
          }
          clearSession();
        } catch {
          clearSession();
        }
      }

      await this.playAsGuest();
      store.setState((prev) => ({ ...prev, ready: true }));
    },

    async playAsGuest(username = "Gast") {
      const id = this.guestId();
      const guestUser: AuthUser = {
        id,
        username,
        email: null,
        avatar: "A",
        createdAt: Date.now(),
        lastLogin: Date.now(),
        isGuest: true,
      };
      if (options.ws.status() !== "open") {
        try {
          await options.ws.connect();
        } catch {
          persistSession(guestUser, "");
          store.setState((prev) => ({
            ...prev,
            token: null,
            user: guestUser,
          }));
          return true;
        }
      }
      const ok = options.ws.send(WS_EVENTS.AUTH, { userId: id, username });
      store.setState((prev) => ({
        ...prev,
        user: guestUser,
        token: null,
        lastError: null,
      }));
      storage.removeItem(SESSION_KEY);
      return ok || options.ws.status() !== "open";
    },

    async register(input) {
      try {
        if (options.ws.status() !== "open") {
          await options.ws.connect();
        }
        const response = await options.ws.request(
          WS_EVENTS.AUTH_REGISTER,
          { ...input },
          [WS_EVENTS.AUTH_REGISTER_SUCCESS],
          [WS_EVENTS.AUTH_REGISTER_ERROR],
        );
        if (response.type === WS_EVENTS.AUTH_REGISTER_SUCCESS) {
          return applySuccess(response.type, response.payload);
        }
        const error =
          typeof response.payload["error"] === "string"
            ? response.payload["error"]
            : authErrorKey("server_error");
        setError(error);
        return false;
      } catch {
        setError(authErrorKey("server_timeout"));
        return false;
      }
    },

    async login(input) {
      try {
        if (options.ws.status() !== "open") {
          await options.ws.connect();
        }
        const response = await options.ws.request(
          WS_EVENTS.AUTH_LOGIN,
          { ...input },
          [WS_EVENTS.AUTH_LOGIN_SUCCESS],
          [WS_EVENTS.AUTH_LOGIN_ERROR],
        );
        if (response.type === WS_EVENTS.AUTH_LOGIN_SUCCESS) {
          return applySuccess(response.type, response.payload);
        }
        const error =
          typeof response.payload["error"] === "string"
            ? response.payload["error"]
            : authErrorKey("server_error");
        setError(error);
        return false;
      } catch {
        setError(authErrorKey("server_timeout"));
        return false;
      }
    },

    async convertGuest(input) {
      const state = store.getState();
      if (state.user === null || !state.user.isGuest) {
        setError(authErrorKey("not_guest"));
        return false;
      }
      try {
        if (options.ws.status() !== "open") {
          await options.ws.connect();
        }
        const response = await options.ws.request(
          WS_EVENTS.AUTH_CONVERT_GUEST,
          {
            guestId: state.user.id,
            username: input.username,
            email: input.email,
            password: input.password,
          },
          [WS_EVENTS.AUTH_CONVERT_GUEST_SUCCESS],
          [WS_EVENTS.AUTH_CONVERT_GUEST_ERROR],
        );
        if (response.type === WS_EVENTS.AUTH_CONVERT_GUEST_SUCCESS) {
          return applySuccess(response.type, response.payload);
        }
        const error =
          typeof response.payload["error"] === "string"
            ? response.payload["error"]
            : authErrorKey("server_error");
        setError(error);
        return false;
      } catch {
        setError(authErrorKey("server_timeout"));
        return false;
      }
    },

    logout() {
      clearSession();
      void this.playAsGuest();
    },

    destroy() {
      store.destroy();
    },
  };
}
