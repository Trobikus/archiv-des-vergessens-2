import type { Store } from "@adv/core";
import {
  CONFIG,
  calculateGatherPower,
  calculateGatherUpgradeCost,
} from "@adv/sim";

import type { GameState } from "../state/game-state";
import type { LibraryService } from "./library-service";
import type { ResourceService } from "./resource-service";

export type GatherService = {
  getClickGain(): number;
  getUpgradeCost(): number;
  gather(now?: number): number;
  upgradeClickPower(): boolean;
};

export type GatherServiceDeps = {
  readonly onGather?: () => void;
};

export function createGatherService(
  store: Store<GameState>,
  resources: ResourceService,
  library?: LibraryService,
  deps: GatherServiceDeps = {},
): GatherService {
  const baseGain = (): number =>
    calculateGatherPower(store.getState().gather.clickPowerLevel);

  const gatherBoost = (): number => {
    if (!library) {
      const level = store.getState().library.upgrades.gather_boost;
      return 1 + level * 0.1;
    }
    return 1 + library.getBonus("gather_boost");
  };

  return {
    getClickGain() {
      return Math.floor(baseGain() * gatherBoost());
    },

    getUpgradeCost() {
      return calculateGatherUpgradeCost(store.getState().gather.clickPowerLevel);
    },

    gather(now = Date.now()) {
      const state = store.getState();
      if (now - state.gather.lastClickAt < CONFIG.GATHER.COOLDOWN_MS) {
        return 0;
      }
      const gain = Math.floor(baseGain() * gatherBoost());
      if (gain <= 0) {
        return 0;
      }
      store.setState((prev) => ({
        ...prev,
        gather: { ...prev.gather, lastClickAt: now },
        meta: { ...prev.meta, lastActiveAt: now },
      }));
      const added = resources.addParticles(gain);
      if (added > 0) {
        deps.onGather?.();
      }
      return added;
    },

    upgradeClickPower() {
      const cost = calculateGatherUpgradeCost(
        store.getState().gather.clickPowerLevel,
      );
      if (cost <= 0 || !resources.removeParticles(cost)) {
        return false;
      }
      store.setState((prev) => ({
        ...prev,
        gather: {
          ...prev.gather,
          clickPowerLevel: prev.gather.clickPowerLevel + 1,
        },
      }));
      return true;
    },
  };
}
