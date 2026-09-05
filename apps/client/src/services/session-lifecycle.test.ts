import { afterEach, describe, expect, it, vi } from "vitest";

import { createGameSession } from "./game-session";
import { createMemorySaveStorage } from "./save-storage";
import { DEFAULT_SAVE_KEY, guestSaveKey } from "./save-store";

describe("session lifecycle / leak safety", () => {
  it("destroy stops autosave and rejects further saves", async () => {
    const session = createGameSession({
      storage: createMemorySaveStorage(),
      useIndexedDb: false,
      now: () => 1_000_000,
      autosaveMs: 60_000,
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

describe("local offline saves", () => {
  const sessions: Array<ReturnType<typeof createGameSession>> = [];

  afterEach(() => {
    for (const session of sessions) {
      session.destroy();
    }
    sessions.length = 0;
  });

  function localSession(storage = createMemorySaveStorage()) {
    const session = createGameSession({
      storage,
      useIndexedDb: false,
      now: () => 2_000_000,
      autosaveMs: 20,
    });
    sessions.push(session);
    return { session, storage };
  }

  it("guestSaveKey stays off the default slot", () => {
    expect(guestSaveKey("guest_abc_1")).toBe("slot_guest_guest_abc_1");
    expect(guestSaveKey("guest_abc_1")).not.toBe(DEFAULT_SAVE_KEY);
  });

  it("persists progress under slot_guest_* only", async () => {
    const { session, storage } = localSession();
    await session.boot();

    session.resources.addParticles(42);
    expect(await session.saveNow()).toBe(true);

    const key = guestSaveKey("local");
    expect(await storage.get(key)).toBeTruthy();
    expect(await storage.get(DEFAULT_SAVE_KEY)).toBeNull();
  });

  it("interval-autosaves to the local slot", async () => {
    const { session, storage } = localSession();
    await session.boot();
    session.resources.addParticles(7);
    await new Promise((resolve) => {
      setTimeout(resolve, 60);
    });
    expect(await storage.get(guestSaveKey("local"))).toBeTruthy();
    expect(await storage.get(DEFAULT_SAVE_KEY)).toBeNull();
  });
});
