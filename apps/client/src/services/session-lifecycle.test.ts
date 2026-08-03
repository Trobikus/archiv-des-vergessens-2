import { afterEach, describe, expect, it, vi } from "vitest";

import { createGameSession } from "./game-session";
import { createMemorySaveStorage } from "./save-storage";
import { DEFAULT_SAVE_KEY, guestSaveKey } from "./save-store";
import { createWsClient } from "./ws-client";

describe("session lifecycle / leak safety", () => {
  it("destroy stops autosave and rejects further saves", async () => {
    const session = createGameSession({
      storage: createMemorySaveStorage(),
      useIndexedDb: false,
      now: () => 1_000_000,
      autosaveMs: 60_000,
      connectNetwork: false,
    });

    await session.boot();
    expect(session.store.getState().meta.bootstrapped).toBe(true);
    expect(session.store.getState().meta.visualDegraded).toBe(false);

    const clearSpy = vi.spyOn(globalThis, "clearInterval");
    session.destroy();
    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();

    await expect(session.saveNow()).resolves.toBe(false);
  });
});

describe("offline guest local saves", () => {
  const sessions: Array<ReturnType<typeof createGameSession>> = [];

  afterEach(() => {
    for (const session of sessions) {
      session.destroy();
    }
    sessions.length = 0;
  });

  function offlineGuestSession(storage = createMemorySaveStorage()) {
    function FailingSocket(): never {
      throw new Error("offline");
    }
    Object.assign(FailingSocket, { OPEN: 1 });
    const ws = createWsClient({
      url: "ws://127.0.0.1:1",
      WebSocketImpl: FailingSocket as unknown as typeof WebSocket,
    });
    const session = createGameSession({
      storage,
      useIndexedDb: false,
      now: () => 2_000_000,
      autosaveMs: 20,
      connectNetwork: true,
      ws,
    });
    sessions.push(session);
    return { session, storage };
  }

  it("guestSaveKey stays off the registered slot", () => {
    expect(guestSaveKey("guest_abc_1")).toBe("slot_guest_guest_abc_1");
    expect(guestSaveKey("guest_abc_1")).not.toBe(DEFAULT_SAVE_KEY);
  });

  it("persists guest progress under slot_guest_* only", async () => {
    const { session, storage } = offlineGuestSession();
    await session.boot();
    expect(session.auth.store.getState().user?.isGuest).toBe(true);

    session.resources.addParticles(42);
    expect(await session.saveNow()).toBe(true);

    const key = guestSaveKey(session.auth.guestId());
    expect(await storage.get(key)).toBeTruthy();
    expect(await storage.get(DEFAULT_SAVE_KEY)).toBeNull();
  });

  it("does not interval-autosave while guest", async () => {
    const { session, storage } = offlineGuestSession();
    await session.boot();
    session.resources.addParticles(7);
    await new Promise((resolve) => {
      setTimeout(resolve, 60);
    });
    expect(await storage.get(guestSaveKey(session.auth.guestId()))).toBeNull();
    expect(await storage.get(DEFAULT_SAVE_KEY)).toBeNull();
  });
});
