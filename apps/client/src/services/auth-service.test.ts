import { describe, expect, it } from "vitest";

import { WS_EVENTS } from "@adv/protocol";

import { createAuthService } from "./auth-service";
import type { WsClient, WsClientStatus } from "./ws-client";

function memoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem(key: string) {
      return map.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      map.set(key, value);
    },
    removeItem(key: string) {
      map.delete(key);
    },
  };
}

function createFakeWs(
  responders: Record<
    string,
    { type: string; payload: Record<string, unknown> }
  >,
): WsClient {
  let status: WsClientStatus = "disconnected";
  return {
    url: "ws://fake",
    status: () => status,
    connect() {
      status = "open";
      return Promise.resolve();
    },
    close() {
      status = "disconnected";
    },
    send() {
      return true;
    },
    on() {
      return () => undefined;
    },
    onStatus() {
      return () => undefined;
    },
    request(type) {
      const response = responders[type];
      if (response === undefined) {
        return Promise.reject(new Error(`no responder for ${type}`));
      }
      return Promise.resolve(response);
    },
  };
}

describe("auth-service register/login", () => {
  it("registers and logs in through ws responses", async () => {
    const user = {
      id: "usr_1",
      username: "keeper",
      email: "a@b.co",
      avatar: "A",
      createdAt: 1,
      lastLogin: 2,
      isGuest: false,
    };
    const ws = createFakeWs({
      [WS_EVENTS.AUTH_REGISTER]: {
        type: WS_EVENTS.AUTH_REGISTER_SUCCESS,
        payload: { user, token: "tok_1" },
      },
      [WS_EVENTS.AUTH_LOGIN]: {
        type: WS_EVENTS.AUTH_LOGIN_SUCCESS,
        payload: { user, token: "tok_2" },
      },
    });
    const auth = createAuthService({ ws, storage: memoryStorage() });
    expect(
      await auth.register({
        username: "keeper",
        email: "a@b.co",
        password: "secret12",
      }),
    ).toBe(true);
    expect(auth.isRegistered()).toBe(true);
    expect(
      await auth.login({
        usernameOrEmail: "keeper",
        password: "secret12",
      }),
    ).toBe(true);
    expect(auth.store.getState().token).toBe("tok_2");
    expect(auth.rememberedUsername()).toBe("keeper");
    auth.logout();
    expect(auth.rememberedUsername()).toBeNull();
    auth.destroy();
  });

  it("remembers username across boot without restoring the session", async () => {
    const user = {
      id: "usr_1",
      username: "keeper",
      email: "a@b.co",
      avatar: "A",
      createdAt: 1,
      lastLogin: 2,
      isGuest: false,
    };
    const storage = memoryStorage();
    const responders = {
      [WS_EVENTS.AUTH_LOGIN]: {
        type: WS_EVENTS.AUTH_LOGIN_SUCCESS,
        payload: { user, token: "tok_live" },
      },
      [WS_EVENTS.AUTH]: {
        type: WS_EVENTS.AUTH_SUCCESS,
        payload: { userId: "guest_x", username: "Gast" },
      },
    };
    const first = createAuthService({
      ws: createFakeWs(responders),
      storage,
    });
    await first.boot();
    expect(first.isRegistered()).toBe(false);
    expect(
      await first.login({
        usernameOrEmail: "keeper",
        password: "secret12",
        rememberMe: true,
      }),
    ).toBe(true);
    expect(first.rememberedUsername()).toBe("keeper");
    first.destroy();

    const second = createAuthService({
      ws: createFakeWs(responders),
      storage,
    });
    await second.boot();
    expect(second.isRegistered()).toBe(false);
    expect(second.store.getState().user?.isGuest).toBe(true);
    expect(second.rememberedUsername()).toBe("keeper");
    expect(storage.getItem("adv2_auth_session")).toBeNull();
    second.destroy();
  });

  it("convertGuest promotes the guest session to a registered account", async () => {
    const converted = {
      id: "usr_conv",
      username: "keeper",
      email: "a@b.co",
      avatar: "A",
      createdAt: 1,
      lastLogin: 2,
      isGuest: false,
    };
    const ws = createFakeWs({
      [WS_EVENTS.AUTH]: {
        type: WS_EVENTS.AUTH_SUCCESS,
        payload: { userId: "guest_local", username: "Gast" },
      },
      [WS_EVENTS.AUTH_CONVERT_GUEST]: {
        type: WS_EVENTS.AUTH_CONVERT_GUEST_SUCCESS,
        payload: {
          user: converted,
          token: "tok_conv",
          migrated: { save: false, leaderboard: false },
        },
      },
    });
    const auth = createAuthService({ ws, storage: memoryStorage() });
    await auth.boot();
    expect(auth.store.getState().user?.isGuest).toBe(true);
    expect(
      await auth.convertGuest({
        username: "keeper",
        email: "a@b.co",
        password: "secret12",
      }),
    ).toBe(true);
    expect(auth.isRegistered()).toBe(true);
    expect(auth.store.getState().token).toBe("tok_conv");
    expect(auth.store.getState().user?.username).toBe("keeper");
    auth.destroy();
  });
});
