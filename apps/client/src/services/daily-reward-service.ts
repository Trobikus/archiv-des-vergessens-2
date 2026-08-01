import type { EventBus, Store } from "@adv/core";
import { createRng } from "@adv/core";

import type { GameState, InventoryItem } from "../state/game-state";
import { createItemFromTemplate } from "./hero-service";
import type { HeroService } from "./hero-service";
import type { ResourceService } from "./resource-service";

export type DailyRewardResult = {
  readonly success: boolean;
  readonly streak?: number;
  readonly message?: string;
};

export type DailyRewardService = {
  canClaimToday(now?: number): boolean;
  claimDailyReward(now?: number): DailyRewardResult;
  getStreak(): number;
  getCurrentBoost(now?: number): string | null;
};

function dayKey(now: number): string {
  const date = new Date(now);
  return `${String(date.getFullYear())}-${String(date.getMonth() + 1)}-${String(date.getDate())}`;
}

function daysBetween(start: string, end: string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
}

export function createDailyRewardService(
  store: Store<GameState>,
  eventBus: EventBus,
  resources: ResourceService,
  _hero: HeroService,
): DailyRewardService {
  const rng = createRng();

  return {
    canClaimToday(now = Date.now()) {
      const today = dayKey(now);
      return store.getState().quests.daily.lastClaimDate !== today;
    },

    claimDailyReward(now = Date.now()) {
      if (!this.canClaimToday(now)) {
        return { success: false, message: "Already claimed today." };
      }

      const today = dayKey(now);
      const daily = store.getState().quests.daily;
      let streak = 1;
      if (daily.lastClaimDate) {
        const diff = daysBetween(daily.lastClaimDate, today);
        if (diff === 1) {
          streak = daily.streak + 1;
        } else if (diff > 1) {
          streak = 1;
        } else {
          streak = daily.streak || 1;
        }
      }
      streak = Math.min(Math.max(streak, 1), 365);

      type Reward = {
        particles?: number;
        relics?: number;
        artifacts?: number;
        title?: string;
        amulet?: boolean;
        boost?: string;
      };

      let reward: Reward;
      if (streak === 7) {
        reward = {
          particles: 250,
          relics: 15,
          artifacts: 5,
          title: "Tagebuch der Erinnerung",
          amulet: true,
        };
      } else {
        const pool: Reward[] = [
          { particles: 80 },
          { relics: 12 },
          { artifacts: 4 },
          { particles: 50, relics: 4, boost: "collect-2x" },
        ];
        reward = pool[Math.floor(rng.next() * pool.length)] ?? { particles: 50 };
      }

      if (reward.particles) {
        resources.addParticles(reward.particles);
      }
      if (reward.relics) {
        resources.addRelics(reward.relics);
      }
      if (reward.artifacts) {
        resources.addArtifacts(reward.artifacts);
      }
      if (reward.boost) {
        store.setState((prev) => ({
          ...prev,
          quests: {
            ...prev.quests,
            daily: {
              ...prev.quests.daily,
              currentBoost: reward.boost ?? null,
              boostUntil: now + 3_600_000,
            },
          },
        }));
      }
      if (reward.amulet) {
        const amulet: InventoryItem = createItemFromTemplate(
          "Amulett der täglichen Wiederkehr",
          {
            slot: "amulet",
            rarity: "legendary",
            stats: { attack: 6, defense: 4, stamina: 4 },
          },
          1,
        );
        store.setState((prev) => ({
          ...prev,
          hero: {
            ...prev.hero,
            inventory: {
              equipment: [...prev.hero.inventory.equipment, amulet],
            },
          },
        }));
      }
      if (reward.title) {
        store.setState((prev) => ({
          ...prev,
          hero: { ...prev.hero, title: reward.title ?? prev.hero.title },
        }));
      }

      store.setState((prev) => ({
        ...prev,
        quests: {
          ...prev.quests,
          daily: {
            ...prev.quests.daily,
            lastClaimDate: today,
            streak,
          },
        },
      }));

      eventBus.publish("daily:claimed", { streak, reward });
      return { success: true, streak };
    },

    getStreak() {
      return store.getState().quests.daily.streak;
    },

    getCurrentBoost(now = Date.now()) {
      const daily = store.getState().quests.daily;
      if (daily.boostUntil > now && daily.currentBoost) {
        return daily.currentBoost;
      }
      return null;
    },
  };
}
