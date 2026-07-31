import { describe, expect, it } from "vitest";

import { SAVE_SCHEMA_VERSION, validateSaveEnvelope } from "./save-envelope";

describe("validateSaveEnvelope", () => {
  it("accepts a valid envelope", () => {
    const result = validateSaveEnvelope({
      schemaVersion: SAVE_SCHEMA_VERSION,
      savedAt: 1,
      payload: { shards: 0 },
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.payload).toEqual({ shards: 0 });
    }
  });

  it("rejects non-objects", () => {
    expect(validateSaveEnvelope(null).ok).toBe(false);
    expect(validateSaveEnvelope("x").ok).toBe(false);
  });

  it("rejects unsupported schema versions", () => {
    const result = validateSaveEnvelope({
      schemaVersion: 99,
      savedAt: 1,
      payload: {},
    });
    expect(result.ok).toBe(false);
  });

  it("rejects invalid savedAt", () => {
    const result = validateSaveEnvelope({
      schemaVersion: SAVE_SCHEMA_VERSION,
      savedAt: Number.NaN,
      payload: {},
    });
    expect(result.ok).toBe(false);
  });

  it("requires payload", () => {
    const result = validateSaveEnvelope({
      schemaVersion: SAVE_SCHEMA_VERSION,
      savedAt: 1,
    });
    expect(result.ok).toBe(false);
  });
});
