import { describe, expect, it } from "vitest";

import {
  addAmount,
  clampAmount,
  formatAmount,
  formatDuration,
  gteAmount,
  mulAmount,
  subAmount,
  toBigInt,
  toSafeNumber,
} from "./bignum";

describe("bignum", () => {
  it("parses and arithmetics amounts", () => {
    expect(toBigInt("12")).toBe(12n);
    expect(toBigInt("x", 3n)).toBe(3n);
    expect(toBigInt(Number.NaN, 1n)).toBe(1n);
    expect(addAmount("2", 3)).toBe(5n);
    expect(subAmount(10n, "4")).toBe(6n);
    expect(mulAmount(2, 5)).toBe(10n);
    expect(gteAmount("5", 5)).toBe(true);
    expect(clampAmount(100, 0, 10)).toBe(10n);
    expect(clampAmount(-1, 0, 10)).toBe(0n);
  });

  it("caps to safe number", () => {
    expect(toSafeNumber(BigInt(Number.MAX_SAFE_INTEGER) + 1n)).toBe(
      Number.MAX_SAFE_INTEGER,
    );
    expect(toSafeNumber(BigInt(Number.MIN_SAFE_INTEGER) - 1n)).toBe(
      Number.MIN_SAFE_INTEGER,
    );
    expect(toSafeNumber("42")).toBe(42);
  });

  it("formats amounts like v1", () => {
    expect(formatAmount(950)).toBe("950");
    expect(formatAmount(1500)).toBe("1,5 Tsd.");
    expect(formatAmount(2_300_000)).toBe("2,3 Mio.");
    expect(formatAmount(4_000_000_000)).toBe("4,0 Mrd.");
    expect(formatAmount(null)).toBe("0");
    expect(formatAmount(1.5, { locale: "en", decimals: 1 })).toBe("1.5");
    expect(formatAmount(BigInt("12345678901234567890"))).toMatch(/e19$/);
    expect(formatAmount(1e20)).toMatch(/e\+?20/);
  });

  it("formats duration", () => {
    expect(formatDuration(3_661_000)).toBe("1h 1m 1s");
    expect(formatDuration(Number.NaN)).toBe("0s");
  });
});
