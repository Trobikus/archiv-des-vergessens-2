import type { Store } from "@adv/core";

import type { GameState } from "../state/game-state";

function sanitizeAmount(amount: number): number {
  if (!Number.isFinite(amount) || amount <= 0) {
    return 0;
  }
  return Math.floor(amount);
}

type ResourceKey =
  | "particles"
  | "mnemeFragmente"
  | "relics"
  | "artifacts"
  | "memoryDust"
  | "catalyst";

const TOTAL_KEYS: Partial<Record<ResourceKey, keyof GameState["resources"]>> = {
  particles: "totalParticles",
  mnemeFragmente: "totalMnemeFragmente",
  relics: "totalRelics",
};

function addResource(
  store: Store<GameState>,
  key: ResourceKey,
  amount: number,
): number {
  const safe = sanitizeAmount(amount);
  if (safe <= 0) {
    return 0;
  }
  const add = BigInt(safe);
  const totalKey = TOTAL_KEYS[key];
  store.setState((prev) => ({
    ...prev,
    resources: {
      ...prev.resources,
      [key]: prev.resources[key] + add,
      ...(totalKey
        ? { [totalKey]: prev.resources[totalKey] + add }
        : {}),
    },
  }));
  return safe;
}

function removeResource(
  store: Store<GameState>,
  key: ResourceKey,
  amount: number,
): boolean {
  const safe = sanitizeAmount(amount);
  if (safe <= 0) {
    return false;
  }
  const remove = BigInt(safe);
  const current = store.getState().resources[key];
  if (current < remove) {
    return false;
  }
  store.setState((prev) => ({
    ...prev,
    resources: {
      ...prev.resources,
      [key]: prev.resources[key] - remove,
    },
  }));
  return true;
}

export type ResourceService = {
  addParticles(amount: number): number;
  removeParticles(amount: number): boolean;
  addMnemeFragmente(amount: number): number;
  removeMnemeFragmente(amount: number): boolean;
  addRelics(amount: number): number;
  removeRelics(amount: number): boolean;
  addArtifacts(amount: number): number;
  removeArtifacts(amount: number): boolean;
  addMemoryDust(amount: number): number;
  removeMemoryDust(amount: number): boolean;
  addCatalyst(amount: number): number;
  removeCatalyst(amount: number): boolean;
};

export function createResourceService(store: Store<GameState>): ResourceService {
  return {
    addParticles(amount) {
      return addResource(store, "particles", amount);
    },
    removeParticles(amount) {
      return removeResource(store, "particles", amount);
    },
    addMnemeFragmente(amount) {
      return addResource(store, "mnemeFragmente", amount);
    },
    removeMnemeFragmente(amount) {
      return removeResource(store, "mnemeFragmente", amount);
    },
    addRelics(amount) {
      return addResource(store, "relics", amount);
    },
    removeRelics(amount) {
      return removeResource(store, "relics", amount);
    },
    addArtifacts(amount) {
      return addResource(store, "artifacts", amount);
    },
    removeArtifacts(amount) {
      return removeResource(store, "artifacts", amount);
    },
    addMemoryDust(amount) {
      return addResource(store, "memoryDust", amount);
    },
    removeMemoryDust(amount) {
      return removeResource(store, "memoryDust", amount);
    },
    addCatalyst(amount) {
      return addResource(store, "catalyst", amount);
    },
    removeCatalyst(amount) {
      return removeResource(store, "catalyst", amount);
    },
  };
}
