import { describe, expect, it } from "vitest";

import { applyClick, clickGain, gatherClickGain } from "./click";
import { CONFIG } from "./config";

describe("clickGain", () => {
  it("multiplies base power", () => {
    expect(clickGain(10, 2)).toBe(20);
  });

  it("rejects non-finite or negative inputs", () => {
    expect(clickGain(Number.NaN)).toBe(0);
    expect(clickGain(-1)).toBe(0);
    expect(clickGain(1, -2)).toBe(0);
  });
});

describe("applyClick", () => {
  it("adds gain to shards", () => {
    expect(applyClick(5, 3)).toBe(8);
  });

  it("clamps negative values and rejects non-finite", () => {
    expect(applyClick(-2, 4)).toBe(4);
    expect(applyClick(1, Number.NaN)).toBe(0);
  });
});

describe("gatherClickGain", () => {
  it("uses CONFIG.GATHER power curve", () => {
    expect(gatherClickGain(0)).toBe(CONFIG.GATHER.BASE_AMOUNT);
    expect(gatherClickGain(2, 3)).toBe(
      CONFIG.GATHER.BASE_AMOUNT *
        CONFIG.GATHER.POWER_MULT *
        CONFIG.GATHER.POWER_MULT *
        3,
    );
  });
});
