import { describe, expect, it } from "vitest";

import { sanitizeNumber } from "./sanitize";

describe("sanitizeNumber", () => {
  it("accepts finite numbers", () => {
    expect(sanitizeNumber(3.5)).toBe(3.5);
    expect(sanitizeNumber("7")).toBe(7);
  });

  it("falls back for nullish, boolean, and non-finite", () => {
    expect(sanitizeNumber(null, 9)).toBe(9);
    expect(sanitizeNumber(undefined, 9)).toBe(9);
    expect(sanitizeNumber(true, 9)).toBe(9);
    expect(sanitizeNumber(Number.NaN, 9)).toBe(9);
    expect(sanitizeNumber(Number.POSITIVE_INFINITY, 9)).toBe(9);
    expect(sanitizeNumber("x", Number.NaN)).toBe(0);
  });
});
