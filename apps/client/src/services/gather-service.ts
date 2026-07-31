import type { Store } from "@adv/core";
import {
  CONFIG,
  calculateGatherPower,
  calculateGatherUpgradeCost,
} from "@adv/sim";

import type { GameState } from "../state/game-state";
import type { ResourceService } from "./resource-service";

export type GatherService = {
  getClickGain(): number;
  getUpgradeCost(): number;
  gather(now?: number): number;
  upgradeClickPower(): boolean;
};

export function createGatherService(
  store: Store<GameState>,
  resources: ResourceService,
): GatherService {
  return {
    getClickGain() {
      return calculateGatherPower(store.getState().gather.clickPowerLevel);
    },

    getUpgradeCost() {
      return calculateGatherUpgradeCost(store.getState().gather.clickPowerLevel);
    },

    gather(now = Date.now()) {
      const state = store.getState();
      if (now - state.gather.lastClickAt < CONFIG.GATHER.COOLDOWN_MS) {
        return 0;
      }
      const gain = Math.floor(
        calculateGatherPower(state.gather.clickPowerLevel),
      );
      if (gain <= 0) {
        return 0;
      }
      store.setState((prev) => ({
        ...prev,
        gather: { ...prev.gather, lastClickAt: now },
        meta: { ...prev.meta, lastActiveAt: now },
      }));
      return resources.addParticles(gain);
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
