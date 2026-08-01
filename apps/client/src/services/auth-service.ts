import { createLogger, createStore, type Store } from "@adv/core";
import {
  authErrorKey,
  normalizeAuthErrorCode,
  validateAuthSessionSuccessPayload,
  WS_EVENTS,
  type AuthUser,
} from "@adv/protocol";

import type { WsClient } from "./ws-client";

const log = createLogger("auth-service");

const SESSION_KEY = "adv2_auth_session";
const LEGACY_GUEST_KEY = "adv2_guest_id";

export type AuthSessionState = {
  readonly user: AuthUser | null;
  readonly token: string | null;
  readonly ready: boolean;
  readonly lastError: string | null;
};

export type AuthService = {
  readonly store: Store<AuthSessionState>;
  boot(): Promise<void>;
  register(input: {
    username: string;
    email: string;
    password: string;
    rememberMe?: boolean;
  }): Promise<boolean>;
  login(input: {
    usernameOrEmail: string;
    password: string;
    rememberMe?: boolean;
  }): Promise<boolean>;
  logout(): void;
  isRegistered(): boolean;
  destroy(): void;
};

export type AuthServiceOptions = {
  readonly ws: WsClient;
  readonly storage?: Pick<Storage, "getItem" | "setItem" | "removeItem">;
};

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
    // Reject leftover guest sessions from older builds.
    if (validated.value.user.isGuest || validated.value.token.length === 0) {
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

  const persistSession = (
    user: AuthUser,
    token: string,
    rememberMe = true,
  ): void => {
    if (user.isGuest || token.length === 0) {
      setError(authErrorKey("server_error"));
      return;
    }
    if (rememberMe) {
      storage.setItem(SESSION_KEY, JSON.stringify({ user, token }));
    } else {
      storage.removeItem(SESSION_KEY);
    }
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
    storage.removeItem(LEGACY_GUEST_KEY);
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
    payload: Record<string, unknown>,
    rememberMe = true,
  ): boolean => {
    const parsed = validateAuthSessionSuccessPayload(payload);
    if (!parsed.ok || parsed.value.user.isGuest || parsed.value.token.length === 0) {
      setError(authErrorKey("server_error"));
      return false;
    }
    persistSession(parsed.value.user, parsed.value.token, rememberMe);
    return true;
  };

  const markReady = (): void => {
    store.setState((prev) => ({ ...prev, ready: true }));
  };

  return {
    store,
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
        // Account required — stay logged out while offline.
        clearSession();
        markReady();
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
            applySuccess(response.payload);
            markReady();
            return;
          }
          clearSession();
        } catch {
          clearSession();
        }
      }

      storage.removeItem(LEGACY_GUEST_KEY);
      markReady();
    },

    async register(input) {
      const rememberMe = input.rememberMe !== false;
      try {
        if (options.ws.status() !== "open") {
          await options.ws.connect();
        }
        const response = await options.ws.request(
          WS_EVENTS.AUTH_REGISTER,
          {
            username: input.username,
            email: input.email,
            password: input.password,
          },
          [WS_EVENTS.AUTH_REGISTER_SUCCESS],
          [WS_EVENTS.AUTH_REGISTER_ERROR],
        );
        if (response.type === WS_EVENTS.AUTH_REGISTER_SUCCESS) {
          return applySuccess(response.payload, rememberMe);
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
      const rememberMe = input.rememberMe !== false;
      try {
        if (options.ws.status() !== "open") {
          await options.ws.connect();
        }
        const response = await options.ws.request(
          WS_EVENTS.AUTH_LOGIN,
          {
            usernameOrEmail: input.usernameOrEmail,
            password: input.password,
          },
          [WS_EVENTS.AUTH_LOGIN_SUCCESS],
          [WS_EVENTS.AUTH_LOGIN_ERROR],
        );
        if (response.type === WS_EVENTS.AUTH_LOGIN_SUCCESS) {
          return applySuccess(response.payload, rememberMe);
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
    },

    destroy() {
      store.destroy();
    },
  };
}
