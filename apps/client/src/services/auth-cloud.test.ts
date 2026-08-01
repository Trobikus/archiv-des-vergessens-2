import { describe, expect, it } from "vitest";

import { createAuthService } from "./auth-service";
import { createCloudSyncService } from "./cloud-sync-service";
import { createInitialGameState } from "../state/game-state";
import { createMemorySaveStorage } from "./save-storage";
import { createWsClient, type WsClient } from "./ws-client";

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

describe("auth-service offline guest", () => {
  it("creates a persistent guest id without server", async () => {
    const storage = memoryStorage();
    function FailingSocket(): never {
      throw new Error("offline");
    }
    Object.assign(FailingSocket, { OPEN: 1 });
    const ws = createWsClient({
      url: "ws://127.0.0.1:1",
      WebSocketImpl: FailingSocket as unknown as typeof WebSocket,
    });
    const auth = createAuthService({ ws, storage });
    await auth.boot();
    expect(auth.guestId().startsWith("guest_")).toBe(true);
    expect(auth.store.getState().user?.isGuest).toBe(true);
    auth.destroy();
  });
});

describe("cloud-sync pending queue", () => {
  it("queues envelope when offline for registered user", async () => {
    const storage = createMemorySaveStorage();
    const ws = {
      status: () => "disconnected" as const,
      request: () => Promise.reject(new Error("offline")),
    } as unknown as WsClient;
    const auth = {
      isRegistered: () => true,
      store: {
        getState: () => ({
          user: {
            id: "usr_1",
            username: "keeper",
            email: "a@b.co",
            avatar: "A",
            createdAt: 1,
            lastLogin: 1,
            isGuest: false,
          },
          token: "tok_1",
          ready: true,
          lastError: null,
        }),
      },
    };
    const cloud = createCloudSyncService({
      ws,
      auth: auth as never,
      storage,
    });
    const result = await cloud.push(createInitialGameState(1000), 1000);
    expect(result.ok).toBe(true);
    expect(cloud.status()).toBe("pending");
    expect(await storage.get("cloud_pending_usr_1")).toBeTruthy();
    cloud.destroy();
  });
});
