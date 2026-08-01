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

/** Legacy full-session key — cleared on boot; tokens are never restored. */
const SESSION_KEY = "adv2_auth_session";
const REMEMBER_USERNAME_KEY = "adv2_remember_username";
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
    rememberMe?: boolean;
  }): Promise<boolean>;
  login(input: {
    usernameOrEmail: string;
    password: string;
    rememberMe?: boolean;
  }): Promise<boolean>;
  convertGuest(input: {
    username: string;
    email: string;
    password: string;
  }): Promise<boolean>;
  logout(): void;
  isRegistered(): boolean;
  rememberedUsername(): string | null;
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

  const persistRememberedUsername = (username: string | null): void => {
    if (username !== null && username.trim().length > 0) {
      storage.setItem(REMEMBER_USERNAME_KEY, username.trim());
    } else {
      storage.removeItem(REMEMBER_USERNAME_KEY);
    }
  };

  const applySession = (
    user: AuthUser,
    token: string,
    rememberMe = true,
  ): void => {
    // Never persist tokens across restarts — only optionally remember username.
    storage.removeItem(SESSION_KEY);
    if (!user.isGuest) {
      persistRememberedUsername(rememberMe ? user.username : null);
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
    rememberMe = true,
  ): boolean => {
    if (type === WS_EVENTS.AUTH_CONVERT_GUEST_SUCCESS) {
      const parsed = validateAuthConvertGuestSuccessPayload(payload);
      if (!parsed.ok) {
        setError(authErrorKey("server_error"));
        return false;
      }
      applySession(parsed.value.user, parsed.value.token, rememberMe);
      return true;
    }
    const parsed = validateAuthSessionSuccessPayload(payload);
    if (!parsed.ok) {
      setError(authErrorKey("server_error"));
      return false;
    }
    applySession(parsed.value.user, parsed.value.token, rememberMe);
    return true;
  };

  return {
    store,
    guestId() {
      return stableGuestId;
    },
    rememberedUsername() {
      return storage.getItem(REMEMBER_USERNAME_KEY);
    },
    isRegistered() {
      const state = store.getState();
      return (
        state.user !== null && !state.user.isGuest && state.token !== null
      );
    },
    async boot() {
      // Drop legacy auto-login sessions (token + user).
      storage.removeItem(SESSION_KEY);

      try {
        await options.ws.connect();
      } catch (cause) {
        log.warn(
          `ws connect failed: ${cause instanceof Error ? cause.message : String(cause)}`,
        );
        // Stay offline — do not retry connect() here; a second handshake
        // race can leave boot hanging when the server rejects the socket.
        const id = this.guestId();
        const guestUser: AuthUser = {
          id,
          username: "Gast",
          email: null,
          avatar: "A",
          createdAt: Date.now(),
          lastLogin: Date.now(),
          isGuest: true,
        };
        applySession(guestUser, "");
        store.setState((prev) => ({
          ...prev,
          token: null,
          user: guestUser,
          ready: true,
        }));
        return;
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
          applySession(guestUser, "");
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
          return applySuccess(response.type, response.payload, rememberMe);
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
          return applySuccess(response.type, response.payload, rememberMe);
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
          return applySuccess(response.type, response.payload, true);
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
      persistRememberedUsername(null);
      void this.playAsGuest();
    },

    destroy() {
      store.destroy();
    },
  };
}
