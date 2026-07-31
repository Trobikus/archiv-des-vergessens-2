import { describe, expect, it } from "vitest";

import { migrateSaveEnvelope } from "./migrate";
import { SAVE_SCHEMA_VERSION } from "./save-envelope";

describe("migrateSaveEnvelope", () => {
  it("accepts schemaVersion 1 via identity migration", () => {
    const result = migrateSaveEnvelope({
      schemaVersion: SAVE_SCHEMA_VERSION,
      savedAt: 42,
      payload: { ok: true },
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.schemaVersion).toBe(1);
      expect(result.value.payload).toEqual({ ok: true });
    }
  });

  it("rejects invalid envelopes before migrating", () => {
    expect(
      migrateSaveEnvelope({ schemaVersion: 99, savedAt: 1, payload: {} }).ok,
    ).toBe(false);
    expect(migrateSaveEnvelope(null).ok).toBe(false);
  });
});
