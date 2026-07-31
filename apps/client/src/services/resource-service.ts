import type { Store } from "@adv/core";

import type { GameState } from "../state/game-state";

function sanitizeAmount(amount: number): number {
  if (!Number.isFinite(amount) || amount <= 0) {
    return 0;
  }
  return Math.floor(amount);
}

export type ResourceService = {
  addParticles(amount: number): number;
  removeParticles(amount: number): boolean;
  addMnemeFragmente(amount: number): number;
  removeMnemeFragmente(amount: number): boolean;
};

export function createResourceService(store: Store<GameState>): ResourceService {
  return {
    addParticles(amount) {
      const safe = sanitizeAmount(amount);
      if (safe <= 0) {
        return 0;
      }
      const add = BigInt(safe);
      store.setState((prev) => ({
        ...prev,
        resources: {
          ...prev.resources,
          particles: prev.resources.particles + add,
          totalParticles: prev.resources.totalParticles + add,
        },
      }));
      return safe;
    },

    removeParticles(amount) {
      const safe = sanitizeAmount(amount);
      if (safe <= 0) {
        return false;
      }
      const remove = BigInt(safe);
      const current = store.getState().resources.particles;
      if (current < remove) {
        return false;
      }
      store.setState((prev) => ({
        ...prev,
        resources: {
          ...prev.resources,
          particles: prev.resources.particles - remove,
        },
      }));
      return true;
    },

    addMnemeFragmente(amount) {
      const safe = sanitizeAmount(amount);
      if (safe <= 0) {
        return 0;
      }
      const add = BigInt(safe);
      store.setState((prev) => ({
        ...prev,
        resources: {
          ...prev.resources,
          mnemeFragmente: prev.resources.mnemeFragmente + add,
          totalMnemeFragmente: prev.resources.totalMnemeFragmente + add,
        },
      }));
      return safe;
    },

    removeMnemeFragmente(amount) {
      const safe = sanitizeAmount(amount);
      if (safe <= 0) {
        return false;
      }
      const remove = BigInt(safe);
      const current = store.getState().resources.mnemeFragmente;
      if (current < remove) {
        return false;
      }
      store.setState((prev) => ({
        ...prev,
        resources: {
          ...prev.resources,
          mnemeFragmente: prev.resources.mnemeFragmente - remove,
        },
      }));
      return true;
    },
  };
}
