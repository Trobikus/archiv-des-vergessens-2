import { describe, expect, it, vi } from "vitest";

import { createGameSession } from "./game-session";
import { createMemorySaveStorage } from "./save-storage";

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
