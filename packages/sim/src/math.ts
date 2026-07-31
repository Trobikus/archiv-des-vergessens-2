import { CONFIG } from "./config";
import { sanitizeNumber } from "./sanitize";

/**
 * Building/upgrade cost for a single level.
 * cost = floor(baseCost * (costMultiplier ^ currentLevel))
 */
export function calculateBuildingCost(
  baseCost: number,
  costMultiplier = 1.15,
  currentLevel = 0,
): number {
  const safeBase = Math.max(0, sanitizeNumber(baseCost, 0));
  const safeMult = Math.max(1.0, sanitizeNumber(costMultiplier, 1.15));
  const safeLevel = Math.max(0, sanitizeNumber(currentLevel, 0));
  return Math.floor(safeBase * Math.pow(safeMult, safeLevel));
}

/** Total cost for buying `count` levels starting at `currentLevel`. */
export function calculateBulkBuildingCost(
  baseCost: number,
  costMultiplier = 1.15,
  currentLevel = 0,
  count = 1,
): number {
  const safeCount = Math.max(0, Math.floor(sanitizeNumber(count, 1)));
  if (safeCount <= 0) {
    return 0;
  }

  let totalCost = 0;
  const startLevel = Math.max(0, Math.floor(sanitizeNumber(currentLevel, 0)));

  for (let i = 0; i < safeCount; i += 1) {
    const levelCost = calculateBuildingCost(
      baseCost,
      costMultiplier,
      startLevel + i,
    );
    totalCost += levelCost;
    if (totalCost > Number.MAX_SAFE_INTEGER) {
      return Number.MAX_SAFE_INTEGER;
    }
  }

  return totalCost;
}

export type AffordableLevel = {
  readonly count: number;
  readonly totalCost: number;
};

/** Max levels affordable with `availableResources`. */
export function calculateMaxAffordableLevel(
  baseCost: number,
  costMultiplier = 1.15,
  currentLevel = 0,
  availableResources: number | bigint = 0,
): AffordableLevel {
  let resources = 0;
  if (typeof availableResources === "bigint") {
    resources =
      availableResources > BigInt(Number.MAX_SAFE_INTEGER)
        ? Number.MAX_SAFE_INTEGER
        : Number(availableResources);
  } else {
    resources = Math.max(0, sanitizeNumber(availableResources, 0));
  }

  const startLevel = Math.max(0, Math.floor(sanitizeNumber(currentLevel, 0)));
  let count = 0;
  let totalCost = 0;

  while (count < 10000) {
    const nextCost = calculateBuildingCost(
      baseCost,
      costMultiplier,
      startLevel + count,
    );
    if (totalCost + nextCost > resources || nextCost <= 0) {
      break;
    }
    totalCost += nextCost;
    count += 1;
  }

  return { count, totalCost };
}

/** Milestone multiplier: 2^(floor(level / 25)). */
export function calculateMilestoneMultiplier(level: number): number {
  const safeLevel = Math.max(0, sanitizeNumber(level, 0));
  const milestones = Math.floor(safeLevel / 25);
  return Math.pow(2, milestones);
}

/**
 * Yield per second:
 * baseYield * level * (1 + upgradeBonusesSum) * prestigeMultiplier * milestoneMultiplier
 */
export function calculateYieldPerSecond(
  baseYield: number,
  level: number,
  upgradeBonusesSum = 0,
  prestigeMultiplier = 1.0,
): number {
  const safeBase = Math.max(0, sanitizeNumber(baseYield, 0));
  const safeLevel = Math.max(0, sanitizeNumber(level, 0));
  const safeBonus = Math.max(0, sanitizeNumber(upgradeBonusesSum, 0));
  const safePrestige = Math.max(1.0, sanitizeNumber(prestigeMultiplier, 1.0));
  const milestoneMult = calculateMilestoneMultiplier(safeLevel);
  return safeBase * safeLevel * (1 + safeBonus) * safePrestige * milestoneMult;
}

export type OfflineProgress = {
  readonly elapsedSeconds: number;
  readonly clampedSeconds: number;
  readonly totalYield: number;
};

export function calculateOfflineProgress(
  lastTimestamp: number,
  currentTimestamp: number,
  yieldPerSecond: number,
  maxOfflineSeconds: number = CONFIG.SYSTEM.MAX_OFFLINE_MS / 1000,
): OfflineProgress {
  const last = sanitizeNumber(lastTimestamp, 0);
  const now = sanitizeNumber(currentTimestamp, 0);
  const safeYield = Math.max(0, sanitizeNumber(yieldPerSecond, 0));
  const maxSec = Math.max(
    0,
    sanitizeNumber(maxOfflineSeconds, CONFIG.SYSTEM.MAX_OFFLINE_MS / 1000),
  );

  if (now <= last || last <= 0) {
    return { elapsedSeconds: 0, clampedSeconds: 0, totalYield: 0 };
  }

  const elapsedSeconds = Math.floor((now - last) / 1000);
  const clampedSeconds = Math.min(elapsedSeconds, maxSec);
  const totalYield = Math.floor(clampedSeconds * safeYield);

  return { elapsedSeconds, clampedSeconds, totalYield };
}

/** Prestige currency = floor(sqrt(totalResources / threshold)). */
export function calculatePrestigeCurrency(
  totalResources: number | bigint,
  threshold = 10000,
): number {
  let numResources = 0;
  if (typeof totalResources === "bigint") {
    numResources =
      totalResources > BigInt(Number.MAX_SAFE_INTEGER)
        ? Number.MAX_SAFE_INTEGER
        : Number(totalResources);
  } else {
    numResources = sanitizeNumber(totalResources, 0);
  }

  const safeThreshold = sanitizeNumber(threshold, 10000);

  if (numResources < safeThreshold || safeThreshold <= 0) {
    return 0;
  }

  return Math.floor(Math.sqrt(numResources / safeThreshold));
}

/** Gather upgrade cost using CONFIG.GATHER (word-identical bases). */
export function calculateGatherUpgradeCost(currentLevel: number): number {
  return calculateBuildingCost(
    CONFIG.GATHER.UPGRADE_BASE_COST,
    CONFIG.GATHER.UPGRADE_COST_MULT,
    currentLevel,
  );
}

/** Click/gather power: BASE_AMOUNT * POWER_MULT^level * extraMultiplier. */
export function calculateGatherPower(
  clickPowerLevel: number,
  extraMultiplier = 1,
): number {
  const level = Math.max(0, Math.floor(sanitizeNumber(clickPowerLevel, 0)));
  const extra = Math.max(0, sanitizeNumber(extraMultiplier, 1));
  return (
    CONFIG.GATHER.BASE_AMOUNT *
    Math.pow(CONFIG.GATHER.POWER_MULT, level) *
    extra
  );
}
