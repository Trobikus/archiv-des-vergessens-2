import { TALENT_NODES, type TalentNode } from "@adv/content";
import type { EventBus, Store } from "@adv/core";

import type { GameState } from "../state/game-state";

const TALENT_NODE_MAP = TALENT_NODES as Record<string, TalentNode>;

const START_NODE = "start_0";
const STARTING_POINTS = 3;
const POINTS_PER_LEVEL = 1;

export type TalentService = {
  getAllocatedNodeIds(): readonly string[];
  getAvailablePoints(): number;
  syncPointsFromHeroLevel(): void;
  isNodeAllocatable(nodeId: string): boolean;
  allocateNode(nodeId: string): boolean;
  canUnallocateNode(nodeId: string): boolean;
  unallocateNode(nodeId: string): boolean;
  resetTalents(): void;
  getAggregatedStats(): Record<string, number>;
};

function spentPoints(allocated: readonly string[]): number {
  return allocated
    .filter((id) => id !== START_NODE)
    .reduce((sum, id) => sum + (TALENT_NODE_MAP[id]?.cost ?? 0), 0);
}

function ensureStartNode(store: Store<GameState>): void {
  const talents = store.getState().talents;
  if (!talents.allocatedNodeIds.includes(START_NODE)) {
    store.setState((prev) => ({
      ...prev,
      talents: {
        ...prev.talents,
        allocatedNodeIds: [START_NODE, ...prev.talents.allocatedNodeIds],
      },
    }));
  }
}

export function createTalentService(
  store: Store<GameState>,
  eventBus: EventBus,
): TalentService {
  ensureStartNode(store);

  const service: TalentService = {
    getAllocatedNodeIds() {
      return store.getState().talents.allocatedNodeIds;
    },

    getAvailablePoints() {
      return store.getState().talents.points;
    },

    syncPointsFromHeroLevel() {
      ensureStartNode(store);
      const state = store.getState();
      const earned =
        STARTING_POINTS +
        Math.max(0, state.hero.level - 1) * POINTS_PER_LEVEL;
      const available = earned - spentPoints(state.talents.allocatedNodeIds);
      store.setState((prev) => ({
        ...prev,
        talents: { ...prev.talents, points: Math.max(0, available) },
      }));
    },

    isNodeAllocatable(nodeId) {
      const allocated = service.getAllocatedNodeIds();
      if (allocated.includes(nodeId)) {
        return false;
      }
      const node = TALENT_NODE_MAP[nodeId];
      if (!node || service.getAvailablePoints() < node.cost) {
        return false;
      }
      return node.connections.some((connId: string) => allocated.includes(connId));
    },

    allocateNode(nodeId) {
      if (!service.isNodeAllocatable(nodeId)) {
        return false;
      }
      const node = TALENT_NODE_MAP[nodeId];
      if (!node) {
        return false;
      }
      store.setState((prev) => ({
        ...prev,
        talents: {
          points: prev.talents.points - node.cost,
          allocatedNodeIds: [...prev.talents.allocatedNodeIds, nodeId],
        },
      }));
      eventBus.publish("hero:updated", { nodeId, action: "allocated" });
      return true;
    },

    canUnallocateNode(nodeId) {
      const allocated = [...service.getAllocatedNodeIds()];
      if (!allocated.includes(nodeId) || nodeId === START_NODE) {
        return false;
      }
      const remaining = allocated.filter((id) => id !== nodeId);
      const visited = new Set<string>([START_NODE]);
      const queue = [START_NODE];
      while (queue.length > 0) {
        const currentId = queue.shift();
        if (!currentId) {
          continue;
        }
        const currentNode = TALENT_NODE_MAP[currentId];
        if (!currentNode) {
          continue;
        }
        for (const neighborId of currentNode.connections) {
          if (remaining.includes(neighborId) && !visited.has(neighborId)) {
            visited.add(neighborId);
            queue.push(neighborId);
          }
        }
      }
      return remaining.every((id) => visited.has(id));
    },

    unallocateNode(nodeId) {
      if (!service.canUnallocateNode(nodeId)) {
        return false;
      }
      const node = TALENT_NODE_MAP[nodeId];
      if (!node) {
        return false;
      }
      store.setState((prev) => ({
        ...prev,
        talents: {
          points: prev.talents.points + node.cost,
          allocatedNodeIds: prev.talents.allocatedNodeIds.filter(
            (id) => id !== nodeId,
          ),
        },
      }));
      eventBus.publish("hero:updated", { nodeId, action: "unallocated" });
      return true;
    },

    resetTalents() {
      const allocated = service.getAllocatedNodeIds();
      const refund = spentPoints(allocated);
      store.setState((prev) => ({
        ...prev,
        talents: {
          points: prev.talents.points + refund,
          allocatedNodeIds: [START_NODE],
        },
      }));
      service.syncPointsFromHeroLevel();
      eventBus.publish("hero:updated", { action: "reset" });
    },

    getAggregatedStats() {
      const aggregated: Record<string, number> = {};
      for (const id of service.getAllocatedNodeIds()) {
        const node = TALENT_NODE_MAP[id];
        if (!node?.stats) {
          continue;
        }
        for (const [key, value] of Object.entries(node.stats)) {
          aggregated[key] = (aggregated[key] ?? 0) + value;
        }
      }
      return aggregated;
    },
  };

  return service;
}
