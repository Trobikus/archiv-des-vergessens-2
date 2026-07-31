import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  buildBalancingSnapshot,
  type BalancingSnapshot,
} from "./balancing-snapshot";

const here = dirname(fileURLToPath(import.meta.url));
const goldenPath = join(here, "snapshots", "balancing.golden.json");

describe("balancing golden snapshot", () => {
  it("matches frozen v1-derived golden file", () => {
    const current = buildBalancingSnapshot();
    const golden = JSON.parse(
      readFileSync(goldenPath, "utf8"),
    ) as BalancingSnapshot;
    expect(current).toEqual(golden);
  });

  it("keeps config values word-identical to v1 anchors", () => {
    const { config } = buildBalancingSnapshot();
    expect(config.GATHER.BASE_AMOUNT).toBe(1);
    expect(config.GATHER.UPGRADE_BASE_COST).toBe(50);
    expect(config.GATHER.UPGRADE_COST_MULT).toBe(1.5);
    expect(config.GATHER.POWER_MULT).toBe(2);
    expect(config.GATHER.COOLDOWN_MS).toBe(40);
    expect(config.RELIC_HUNT.COST).toBe(25);
    expect(config.HERO.BASE_EXP_TO_NEXT).toBe(50);
    expect(config.HERO.EXP_MULTIPLIER).toBe(1.2);
    expect(config.STORY.BASE_EXP_REWARD).toBe(20);
    expect(config.CLAN.COLLECTOR_RATE).toBe(2.0);
    expect(config.SYSTEM.LOGIC_TICK_MS).toBe(100);
    expect(config.SYSTEM.SLOW_TICK_MS).toBe(500);
    expect(config.SYSTEM.MAX_OFFLINE_MS).toBe(12 * 60 * 60 * 1000);
    expect(config.SYSTEM.AUTOSAVE_INTERVAL_MS).toBe(15000);
  });
});
