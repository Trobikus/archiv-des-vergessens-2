import { describe, expect, it } from "vitest";

import { CONFIG } from "./config";
import {
  calculateBuildingCost,
  calculateBulkBuildingCost,
  calculateGatherPower,
  calculateGatherUpgradeCost,
  calculateMaxAffordableLevel,
  calculateMilestoneMultiplier,
  calculateOfflineProgress,
  calculatePrestigeCurrency,
  calculateYieldPerSecond,
} from "./math";

describe("sim math (v1 parity probes)", () => {
  it("calculates building and bulk costs", () => {
    expect(calculateBuildingCost(10, 1.15, 0)).toBe(10);
    expect(calculateBuildingCost(10, 1.15, 1)).toBe(11);
    expect(calculateBulkBuildingCost(10, 1.15, 0, 0)).toBe(0);
    expect(calculateBulkBuildingCost(10, 1.15, 0, 2)).toBe(
      calculateBuildingCost(10, 1.15, 0) + calculateBuildingCost(10, 1.15, 1),
    );
  });

  it("calculates max affordable and milestones", () => {
    expect(calculateMaxAffordableLevel(10, 1.15, 0, 0)).toEqual({
      count: 0,
      totalCost: 0,
    });
    expect(calculateMaxAffordableLevel(10, 1.15, 0, 100n).count).toBeGreaterThan(
      0,
    );
    expect(calculateMilestoneMultiplier(0)).toBe(1);
    expect(calculateMilestoneMultiplier(25)).toBe(2);
    expect(calculateMilestoneMultiplier(50)).toBe(4);
  });

  it("calculates yield, offline, prestige", () => {
    expect(calculateYieldPerSecond(1, 25, 0, 1)).toBe(50);
    expect(
      calculateOfflineProgress(0, 1000, 1),
    ).toEqual({ elapsedSeconds: 0, clampedSeconds: 0, totalYield: 0 });
    const offline = calculateOfflineProgress(1_000, 61_000, 2);
    expect(offline.elapsedSeconds).toBe(60);
    expect(offline.totalYield).toBe(120);
    const capped = calculateOfflineProgress(
      1,
      1 + CONFIG.SYSTEM.MAX_OFFLINE_MS + 60_000,
      1,
    );
    expect(capped.clampedSeconds).toBe(CONFIG.SYSTEM.MAX_OFFLINE_MS / 1000);
    expect(calculatePrestigeCurrency(9999)).toBe(0);
    expect(calculatePrestigeCurrency(10_000)).toBe(1);
    expect(calculatePrestigeCurrency(BigInt(Number.MAX_SAFE_INTEGER) + 1n)).toBe(
      Math.floor(Math.sqrt(Number.MAX_SAFE_INTEGER / 10_000)),
    );
  });

  it("uses gather config bases", () => {
    expect(calculateGatherUpgradeCost(0)).toBe(CONFIG.GATHER.UPGRADE_BASE_COST);
    expect(calculateGatherPower(0)).toBe(CONFIG.GATHER.BASE_AMOUNT);
    expect(calculateGatherPower(1)).toBe(
      CONFIG.GATHER.BASE_AMOUNT * CONFIG.GATHER.POWER_MULT,
    );
  });

  it("sanitizes invalid inputs", () => {
    expect(calculateBuildingCost(Number.NaN)).toBe(0);
    expect(calculateYieldPerSecond(-1, -1, -1, 0)).toBe(0);
    expect(calculatePrestigeCurrency("nope" as unknown as number)).toBe(0);
  });
});
