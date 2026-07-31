/** Phase-0 placeholder; Phase 1 freezes balancing against v1 snapshots. */
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
