import { describe, expect, it } from "vitest";

import { createRng, seededRandom } from "./rng";

describe("Rng", () => {
  it("is deterministic for a fixed seed", () => {
    const a = createRng(12345);
    const b = createRng(12345);
    expect(a.next()).toBe(b.next());
    expect(a.randomInt(0, 10)).toBe(b.randomInt(0, 10));
  });

  it("shuffles and picks elements", () => {
    const rng = createRng(7);
    expect(rng.randomElement([])).toBeUndefined();
    expect(rng.randomElement(["x"])).toBe("x");
    const shuffled = rng.shuffle([1, 2, 3, 4]);
    expect(shuffled).toHaveLength(4);
    expect(new Set(shuffled)).toEqual(new Set([1, 2, 3, 4]));
  });

  it("normalizes bad seeds and exposes get/set", () => {
    const rng = createRng(Number.NaN);
    expect(rng.getSeed()).toBe(1);
    rng.setSeed(0);
    expect(rng.getSeed()).toBe(1);
    rng.setSeed(-3);
    expect(rng.getSeed()).toBeGreaterThan(0);
  });

  it("matches v1 seededRandom", () => {
    const x = Math.sin(42) * 10000;
    expect(seededRandom(42)).toBe(x - Math.floor(x));
  });
});
