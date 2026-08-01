import "fake-indexeddb/auto";

import { afterEach, describe, expect, it } from "vitest";

import {
  createIndexedDbSaveStorage,
  createMemorySaveStorage,
} from "./save-storage";

describe("save-storage", () => {
  afterEach(async () => {
    const dbs = await indexedDB.databases();
    await Promise.all(
      dbs.map(
        (db) =>
          new Promise<void>((resolve, reject) => {
            if (db.name === undefined) {
              resolve();
              return;
            }
            const req = indexedDB.deleteDatabase(db.name);
            req.onsuccess = () => {
              resolve();
            };
            req.onerror = () => {
              reject(req.error ?? new Error("deleteDatabase failed"));
            };
          }),
      ),
    );
  });

  it("memory adapter round-trips values", async () => {
    const storage = createMemorySaveStorage();
    await storage.set("k", { n: 1 });
    expect(await storage.get("k")).toEqual({ n: 1 });
    await storage.delete("k");
    expect(await storage.get("k")).toBeNull();
  });

  it("indexedDB adapter round-trips envelopes", async () => {
    const storage = createIndexedDbSaveStorage();
    const envelope = {
      schemaVersion: 1,
      savedAt: 42,
      payload: { ok: true },
    };
    await storage.set("slot_local_1", envelope);
    expect(await storage.get("slot_local_1")).toEqual(envelope);
    await storage.delete("slot_local_1");
    expect(await storage.get("slot_local_1")).toBeNull();
  });
});
