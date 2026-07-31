import { describe, expect, it } from "vitest";

import { createSaveEnvelope } from "./envelope";
import { SAVE_SCHEMA_VERSION } from "./save-envelope";

describe("createSaveEnvelope", () => {
  it("wraps payload with schema version and timestamp", () => {
    const envelope = createSaveEnvelope({ a: 1 }, 123);
    expect(envelope).toEqual({
      schemaVersion: SAVE_SCHEMA_VERSION,
      savedAt: 123,
      payload: { a: 1 },
    });
  });
});
