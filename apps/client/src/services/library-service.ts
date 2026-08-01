import type { EventBus, Store } from "@adv/core";

import type { GameState } from "../state/game-state";
import type { ResourceService } from "./resource-service";

type UpgradeId = keyof GameState["library"]["upgrades"];

type UpgradeConfig = {
  readonly id: UpgradeId;
  readonly name: string;
  readonly desc: string;
  readonly baseCost: Partial<Record<"particles" | "relics" | "artifacts", number>>;
  readonly costMult: number;
  readonly maxLevel: number;
  readonly bonus: (level: number) => number;
};

const UPGRADE_CONFIGS: Record<UpgradeId, UpgradeConfig> = {
  gather_boost: {
    id: "gather_boost",
    name: "Mneme-Fokus",
    desc: "+10% click yield per level",
    baseCost: { particles: 1000 },
    costMult: 1.5,
    maxLevel: 999,
    bonus: (level) => level * 0.1,
  },
  clan_boost: {
    id: "clan_boost",
    name: "Synergie des Bundes",
    desc: "+5% clan production per level",
    baseCost: { particles: 5000, relics: 50 },
    costMult: 1.6,
    maxLevel: 999,
    bonus: (level) => level * 0.05,
  },
  forge_discount: {
    id: "forge_discount",
    name: "Geheimnisse der Schmiede",
    desc: "-1% forge cost per level (max -50%)",
    baseCost: { particles: 10000, artifacts: 10 },
    costMult: 1.8,
    maxLevel: 50,
    bonus: (level) => Math.min(level * 0.01, 0.5),
  },
};

export type LibraryUpgradeView = UpgradeConfig & {
  readonly level: number;
  readonly isMaxed: boolean;
};

export type LibraryService = {
  getUpgrades(): LibraryUpgradeView[];
  getUpgradeCost(upgradeId: UpgradeId): Record<string, number>;
  buyUpgrade(upgradeId: UpgradeId): boolean;
  getBonus(upgradeId: UpgradeId): number;
  getAllBonuses(): Record<UpgradeId, number>;
};

export function createLibraryService(
  store: Store<GameState>,
  eventBus: EventBus,
  resources: ResourceService,
): LibraryService {
  return {
    getUpgrades() {
      const levels = store.getState().library.upgrades;
      return Object.values(UPGRADE_CONFIGS).map((cfg) => ({
        ...cfg,
        level: levels[cfg.id],
        isMaxed: levels[cfg.id] >= cfg.maxLevel,
      }));
    },

    getUpgradeCost(upgradeId) {
      const cfg = UPGRADE_CONFIGS[upgradeId];
      const currentLevel = store.getState().library.upgrades[upgradeId];
      if (currentLevel >= cfg.maxLevel) {
        return {};
      }
      const cost: Record<string, number> = {};
      for (const [res, base] of Object.entries(cfg.baseCost)) {
        cost[res] = Math.floor(base * cfg.costMult ** currentLevel);
      }
      return cost;
    },

    buyUpgrade(upgradeId) {
      const cfg = UPGRADE_CONFIGS[upgradeId];
      const currentLevel = store.getState().library.upgrades[upgradeId];
      if (currentLevel >= cfg.maxLevel) {
        return false;
      }

      const cost = this.getUpgradeCost(upgradeId);
      const res = store.getState().resources;
      for (const [key, amount] of Object.entries(cost)) {
        if (key === "particles" && res.particles < BigInt(amount)) {
          return false;
        }
        if (key === "relics" && res.relics < BigInt(amount)) {
          return false;
        }
        if (key === "artifacts" && res.artifacts < BigInt(amount)) {
          return false;
        }
      }

      for (const [key, amount] of Object.entries(cost)) {
        if (key === "particles") {
          resources.removeParticles(amount);
        } else if (key === "relics") {
          resources.removeRelics(amount);
        } else if (key === "artifacts") {
          resources.removeArtifacts(amount);
        }
      }

      store.setState((prev) => ({
        ...prev,
        library: {
          upgrades: {
            ...prev.library.upgrades,
            [upgradeId]: currentLevel + 1,
          },
        },
      }));

      eventBus.publish("library:upgraded", {
        upgradeId,
        newLevel: currentLevel + 1,
      });
      return true;
    },

    getBonus(upgradeId) {
      const level = store.getState().library.upgrades[upgradeId];
      return UPGRADE_CONFIGS[upgradeId].bonus(level);
    },

    getAllBonuses() {
      const levels = store.getState().library.upgrades;
      return {
        gather_boost: UPGRADE_CONFIGS.gather_boost.bonus(levels.gather_boost),
        clan_boost: UPGRADE_CONFIGS.clan_boost.bonus(levels.clan_boost),
        forge_discount: UPGRADE_CONFIGS.forge_discount.bonus(
          levels.forge_discount,
        ),
      };
    },
  };
}
