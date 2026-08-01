import { ACHIEVEMENT_DEFINITIONS, type AchievementDefinition } from "@adv/content";
import type { EventBus, Store } from "@adv/core";

import type { GameState } from "../state/game-state";
import type { HeroService } from "./hero-service";
import type { ResourceService } from "./resource-service";

export type AchievementView = AchievementDefinition;

export type AchievementService = {
  getAchievements(): AchievementView[];
  claimReward(id: string): boolean;
  checkProgress(): void;
};

function buildProgressMap(state: GameState): Record<string, number> {
  const hero = state.hero;
  const resources = state.resources;
  const defeated = hero.prestige.defeatedBosses.length;

  return {
    particles_100: Number(resources.totalParticles),
    particles_1000: Number(resources.totalParticles),
    particles_10000: Number(resources.totalParticles),
    particles_100000: Number(resources.totalParticles),
    particles_1000000: Number(resources.totalParticles),
    relics_10: Number(resources.totalRelics),
    relics_100: Number(resources.totalRelics),
    relics_500: Number(resources.totalRelics),
    relics_2000: Number(resources.totalRelics),
    recipes_1: state.forge.craftedCount,
    recipes_10: state.forge.craftedCount,
    recipes_50: state.forge.craftedCount,
    recipes_100: state.forge.craftedCount,
    expeditions_1: 0,
    expeditions_10: 0,
    expeditions_50: 0,
    expeditions_100: 0,
    boss_1: defeated,
    boss_5: defeated,
    boss_10: defeated,
    boss_20: defeated,
    boss_first_no_equip: 0,
    prestige_1: 0,
    prestige_5: 0,
  };
}

export function createAchievementService(
  store: Store<GameState>,
  eventBus: EventBus,
  resources: ResourceService,
  _hero: HeroService,
): AchievementService {
  const service: AchievementService = {
    getAchievements() {
      const state = store.getState();
      return ACHIEVEMENT_DEFINITIONS.map((def) => {
        const saved = state.achievements.progress[def.id];
        return {
          ...def,
          progress: saved?.progress ?? def.progress,
          achieved: saved?.achieved ?? def.achieved,
          claimed: saved?.claimed ?? def.claimed,
        };
      });
    },

    claimReward(id) {
      const entry = service.getAchievements().find((a) => a.id === id);
      if (!entry || !entry.achieved || entry.claimed) {
        return false;
      }

      const reward = entry.reward;
      if (reward.particles) {
        resources.addParticles(reward.particles);
      }
      if (reward.relics) {
        resources.addRelics(reward.relics);
      }
      if (reward.artifacts) {
        resources.addArtifacts(reward.artifacts);
      }
      if (reward.title) {
        store.setState((prev) => ({
          ...prev,
          hero: {
            ...prev.hero,
            title: reward.title ?? prev.hero.title,
          },
        }));
      }

      store.setState((prev) => ({
        ...prev,
        achievements: {
          progress: {
            ...prev.achievements.progress,
            [id]: {
              progress: entry.progress,
              achieved: true,
              claimed: true,
            },
          },
        },
      }));
      eventBus.publish("achievement:claimed", { achievement: entry });
      return true;
    },

    checkProgress() {
      const progressMap = buildProgressMap(store.getState());
      const newlyUnlocked: string[] = [];

      store.setState((prev) => {
        const nextProgress = { ...prev.achievements.progress };
        let changed = false;

        for (const def of ACHIEVEMENT_DEFINITIONS) {
          const current = progressMap[def.id] ?? 0;
          const progress = Math.min(current, def.target);
          const saved = nextProgress[def.id] ?? {
            progress: 0,
            achieved: false,
            claimed: false,
          };

          if (saved.claimed) {
            continue;
          }

          const achieved = progress >= def.target;
          if (
            saved.progress !== progress ||
            (!saved.achieved && achieved)
          ) {
            changed = true;
            nextProgress[def.id] = {
              progress,
              achieved: saved.achieved || achieved,
              claimed: saved.claimed,
            };
            if (!saved.achieved && achieved) {
              newlyUnlocked.push(def.id);
            }
          }
        }

        if (!changed && Object.keys(prev.achievements.progress).length > 0) {
          return prev;
        }

        return {
          ...prev,
          achievements: { progress: nextProgress },
        };
      });

      if (newlyUnlocked.length > 0) {
        eventBus.publish("achievement:unlocked", {});
      }
    },
  };

  eventBus.subscribe("story:bossDefeated", () => {
    service.checkProgress();
  });
  eventBus.subscribe("forge:crafted", () => {
    service.checkProgress();
  });

  return service;
}
