import { calculateGatherPower } from "./math";

/** Phase-0 helper retained for callers; prefer `calculateGatherPower`. */
export function clickGain(basePower: number, multiplier = 1): number {
  if (!Number.isFinite(basePower) || basePower < 0) {
    return 0;
  }
  if (!Number.isFinite(multiplier) || multiplier < 0) {
    return 0;
  }
  return basePower * multiplier;
}

export function applyClick(shards: number, gain: number): number {
  if (!Number.isFinite(shards) || !Number.isFinite(gain)) {
    return 0;
  }
  return Math.max(0, shards) + Math.max(0, gain);
}

/** Gather click gain from click-power level (CONFIG.GATHER). */
export function gatherClickGain(
  clickPowerLevel: number,
  extraMultiplier = 1,
): number {
  return calculateGatherPower(clickPowerLevel, extraMultiplier);
}
