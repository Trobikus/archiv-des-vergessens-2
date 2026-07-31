import type { Store } from "@adv/core";
import {
  calculateBuildingCost,
  calculateBulkBuildingCost,
  calculateYieldPerSecond,
} from "@adv/sim";

import type { GameState } from "../state/game-state";
import type { ResourceService } from "./resource-service";

const EWIGE_MNEME_BONUS = 0.1;

export type IdleService = {
  getYieldPerSecond(): number;
  getUpgradeCost(count?: number): number;
  buyLevel(count?: number): boolean;
  processTick(deltaMs: number): number;
};

export function createIdleService(
  store: Store<GameState>,
  resources: ResourceService,
): IdleService {
  let partialYield = 0;

  const getPrestigeMultiplier = (): number => {
    const ewige = Number(store.getState().resources.ewigeMneme);
    return 1 + ewige * EWIGE_MNEME_BONUS;
  };

  const getYieldPerSecond = (): number => {
    const gen = store.getState().idleGenerators.gedankenArchiv;
    return calculateYieldPerSecond(
      gen.baseYield,
      gen.level,
      gen.upgrades.focusBonus,
      getPrestigeMultiplier(),
    );
  };

  return {
    getYieldPerSecond,

    getUpgradeCost(count = 1) {
      const gen = store.getState().idleGenerators.gedankenArchiv;
      const safeCount = Math.max(1, Math.floor(count));
      return calculateBulkBuildingCost(
        gen.baseCost,
        gen.costMultiplier,
        gen.level,
        safeCount,
      );
    },

    buyLevel(count = 1) {
      const safeCount = Math.max(1, Math.floor(count));
      const gen = store.getState().idleGenerators.gedankenArchiv;
      const totalCost = calculateBulkBuildingCost(
        gen.baseCost,
        gen.costMultiplier,
        gen.level,
        safeCount,
      );
      if (totalCost <= 0) {
        return false;
      }
      if (!resources.removeMnemeFragmente(totalCost)) {
        return false;
      }
      store.setState((prev) => {
        const current = prev.idleGenerators.gedankenArchiv;
        return {
          ...prev,
          idleGenerators: {
            gedankenArchiv: {
              ...current,
              level: current.level + safeCount,
            },
          },
        };
      });
      return true;
    },

    processTick(deltaMs) {
      const yieldPerSec = getYieldPerSecond();
      if (yieldPerSec <= 0 || !Number.isFinite(deltaMs) || deltaMs <= 0) {
        return 0;
      }
      partialYield += (yieldPerSec * deltaMs) / 1000;
      if (partialYield < 1) {
        return 0;
      }
      const fullAmount = Math.floor(partialYield);
      partialYield -= fullAmount;
      return resources.addMnemeFragmente(fullAmount);
    },
  };
}

/** Expose next-level unit cost helper for UI labels. */
export function nextGedankenArchivCost(state: GameState): number {
  const gen = state.idleGenerators.gedankenArchiv;
  return calculateBuildingCost(gen.baseCost, gen.costMultiplier, gen.level);
}
