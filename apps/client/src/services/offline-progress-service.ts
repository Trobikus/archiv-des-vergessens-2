import type { Store } from "@adv/core";
import { CONFIG, calculateOfflineProgress, calculateYieldPerSecond } from "@adv/sim";

import type { GameState, OfflineReport } from "../state/game-state";
import type { ResourceService } from "./resource-service";

const EWIGE_MNEME_BONUS = 0.1;

export type OfflineProgressService = {
  applyOnBoot(now?: number): OfflineReport | null;
};

export function createOfflineProgressService(
  store: Store<GameState>,
  resources: ResourceService,
): OfflineProgressService {
  return {
    applyOnBoot(now = Date.now()) {
      const state = store.getState();
      const gen = state.idleGenerators.gedankenArchiv;
      const prestigeMult =
        1 + Number(state.resources.ewigeMneme) * EWIGE_MNEME_BONUS;
      const yieldPerSec = calculateYieldPerSecond(
        gen.baseYield,
        gen.level,
        gen.upgrades.focusBonus,
        prestigeMult,
      );

      const progress = calculateOfflineProgress(
        state.meta.lastActiveAt,
        now,
        yieldPerSec,
        CONFIG.SYSTEM.MAX_OFFLINE_MS / 1000,
      );

      let report: OfflineReport | null = null;
      if (progress.totalYield > 0) {
        resources.addMnemeFragmente(progress.totalYield);
        report = {
          elapsedSeconds: progress.elapsedSeconds,
          clampedSeconds: progress.clampedSeconds,
          mnemeGained: progress.totalYield,
        };
      }

      store.setState((prev) => ({
        ...prev,
        meta: {
          ...prev.meta,
          lastActiveAt: now,
          bootstrapped: true,
          offlineReport: report,
        },
      }));

      return report;
    },
  };
}
