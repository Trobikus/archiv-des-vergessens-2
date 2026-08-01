import { describe, expect, it } from "vitest";

import { validateWsMessage } from "./ws-message";

describe("validateWsMessage", () => {
  it("accepts type + object payload", () => {
    const result = validateWsMessage({
      type: "auth:login",
      payload: { usernameOrEmail: "a", password: "b" },
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.type).toBe("auth:login");
      expect(result.value.payload["usernameOrEmail"]).toBe("a");
    }
  });

  it("defaults missing payload to empty object", () => {
    const result = validateWsMessage({ type: "cloud:load" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.payload).toEqual({});
    }
  });

  it("rejects invalid shapes", () => {
    expect(validateWsMessage(null).ok).toBe(false);
    expect(validateWsMessage({ type: 1, payload: {} }).ok).toBe(false);
    expect(validateWsMessage({ type: "x", payload: [] }).ok).toBe(false);
  });
});
