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

/** Fixed probe inputs for the golden balancing gate. */
export const BALANCING_PROBES = {
  building: {
    baseCost: 10,
    costMultiplier: 1.15,
    levels: [0, 1, 10, 25, 100] as const,
    bulkCounts: [1, 5, 25] as const,
    affordResources: [0, 50, 1_000, 1_000_000] as const,
  },
  yield: {
    baseYield: 1.5,
    levels: [0, 1, 25, 50] as const,
    bonuses: [0, 0.5] as const,
    prestige: [1, 1.1] as const,
  },
  offline: {
    last: 1_000_000,
    spansMs: [0, 60_000, 13 * 60 * 60 * 1000] as const,
    yieldPerSecond: 2.5,
  },
  prestige: {
    resources: [0, 9999, 10_000, 1_000_000, 10_000_000] as const,
    threshold: 10_000,
  },
  gatherLevels: [0, 1, 5, 10] as const,
} as const;

export type BalancingSnapshot = {
  readonly version: 1;
  readonly config: typeof CONFIG;
  readonly math: {
    readonly buildingCost: readonly number[];
    readonly bulkCost: readonly number[];
    readonly maxAffordable: ReadonlyArray<{
      resources: number;
      count: number;
      totalCost: number;
    }>;
    readonly milestones: readonly number[];
    readonly yields: readonly number[];
    readonly offline: ReadonlyArray<{
      spanMs: number;
      elapsedSeconds: number;
      clampedSeconds: number;
      totalYield: number;
    }>;
    readonly prestige: readonly number[];
    readonly gatherUpgradeCost: readonly number[];
    readonly gatherPower: readonly number[];
  };
};

export function buildBalancingSnapshot(): BalancingSnapshot {
  const { building, yield: y, offline, prestige, gatherLevels } =
    BALANCING_PROBES;

  const buildingCost = building.levels.map((level) =>
    calculateBuildingCost(building.baseCost, building.costMultiplier, level),
  );

  const bulkCost = building.bulkCounts.map((count) =>
    calculateBulkBuildingCost(
      building.baseCost,
      building.costMultiplier,
      0,
      count,
    ),
  );

  const maxAffordable = building.affordResources.map((resources) => {
    const result = calculateMaxAffordableLevel(
      building.baseCost,
      building.costMultiplier,
      0,
      resources,
    );
    return { resources, count: result.count, totalCost: result.totalCost };
  });

  const milestones = [0, 24, 25, 49, 50, 100].map((level) =>
    calculateMilestoneMultiplier(level),
  );

  const yields: number[] = [];
  for (const level of y.levels) {
    for (const bonus of y.bonuses) {
      for (const prestigeMult of y.prestige) {
        yields.push(
          calculateYieldPerSecond(y.baseYield, level, bonus, prestigeMult),
        );
      }
    }
  }

  const offlineResults = offline.spansMs.map((spanMs) => {
    const result = calculateOfflineProgress(
      offline.last,
      offline.last + spanMs,
      offline.yieldPerSecond,
    );
    return {
      spanMs,
      elapsedSeconds: result.elapsedSeconds,
      clampedSeconds: result.clampedSeconds,
      totalYield: result.totalYield,
    };
  });

  const prestigeResults = prestige.resources.map((resources) =>
    calculatePrestigeCurrency(resources, prestige.threshold),
  );

  const gatherUpgradeCost = gatherLevels.map((level) =>
    calculateGatherUpgradeCost(level),
  );
  const gatherPower = gatherLevels.map((level) => calculateGatherPower(level));

  return {
    version: 1,
    config: CONFIG,
    math: {
      buildingCost,
      bulkCost,
      maxAffordable,
      milestones,
      yields,
      offline: offlineResults,
      prestige: prestigeResults,
      gatherUpgradeCost,
      gatherPower,
    },
  };
}
