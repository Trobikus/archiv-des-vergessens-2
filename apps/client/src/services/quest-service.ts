import {
  DAILY_QUESTS_DATA,
  MAIN_QUESTS_DATA,
  type DailyQuestDefinition,
  type MainQuestDefinition,
  type QuestReward,
} from "@adv/content";
import type { EventBus, Store } from "@adv/core";

import type { GameState } from "../state/game-state";
import type { HeroService } from "./hero-service";
import type { ResourceService } from "./resource-service";

export type DailyQuestView = DailyQuestDefinition & {
  readonly progress: number;
  readonly isClaimed: boolean;
  readonly isComplete: boolean;
};

export type QuestService = {
  getCurrentQuest(): MainQuestDefinition | null;
  isCurrentQuestComplete(): boolean;
  checkCurrentQuest(): void;
  claimReward(): boolean;
  getDailyQuests(): DailyQuestView[];
  claimDailyReward(dailyId: string): boolean;
  checkDailyReset(): void;
};

function todayKey(now = Date.now()): string {
  return new Date(now).toISOString().split("T")[0] ?? "";
}

function hasEquippedItem(state: GameState): boolean {
  return Object.values(state.hero.equipment).some((item) => item !== null);
}

function hasHighRarityItem(state: GameState): boolean {
  const high = new Set(["rare", "epic", "legendary"]);
  const fromEquipment = Object.values(state.hero.equipment).some(
    (item) => item !== null && high.has(item.rarity),
  );
  const fromInventory = state.hero.inventory.equipment.some((item) =>
    high.has(item.rarity),
  );
  return fromEquipment || fromInventory;
}

function hasItemAtLevel(state: GameState, minLevel: number): boolean {
  const check = (item: GameState["hero"]["inventory"]["equipment"][number]) =>
    item.level >= minLevel;
  return (
    Object.values(state.hero.equipment).some(
      (item) => item !== null && check(item),
    ) || state.hero.inventory.equipment.some(check)
  );
}

function hasLegendaryItem(state: GameState): boolean {
  return (
    Object.values(state.hero.equipment).some(
      (item) => item !== null && item.rarity === "legendary",
    ) ||
    state.hero.inventory.equipment.some((item) => item.rarity === "legendary")
  );
}

function talentCount(state: GameState): number {
  return state.talents.allocatedNodeIds.filter((id) => id !== "start_0").length;
}

export function createQuestService(
  store: Store<GameState>,
  eventBus: EventBus,
  resources: ResourceService,
  _hero: HeroService,
): QuestService {
  const grantReward = (reward: QuestReward): void => {
    if (reward.particles) {
      resources.addParticles(reward.particles);
    }
    if (reward.relics) {
      resources.addRelics(reward.relics);
    }
    if (reward.artifacts) {
      resources.addArtifacts(reward.artifacts);
    }
    if (reward.memoryDust) {
      resources.addMemoryDust(reward.memoryDust);
    }
    if (reward.catalyst) {
      resources.addCatalyst(reward.catalyst);
    }
  };

  const checkCondition = (questId: string): boolean => {
    const state = store.getState();
    const hero = state.hero;
    const res = state.resources;

    switch (questId) {
      case "q1":
        return res.particles >= 50n;
      case "q2":
        return false;
      case "q3":
        return false;
      case "q4":
        return hero.prestige.bossProgress >= 1;
      case "q5":
        return hasEquippedItem(state);
      case "q6":
        return state.gather.clickPowerLevel >= 1;
      case "q7":
        return state.forge.craftedCount > 0;
      case "q8":
        return hero.prestige.bossProgress >= 10;
      case "q9":
        return res.relics >= 20n;
      case "q10":
        return false;
      case "q11":
        return hero.level >= 10;
      case "q12":
        return hasItemAtLevel(state, 2);
      case "q13":
        return false;
      case "q14":
        return hero.prestige.bossProgress >= 20;
      case "q15":
        return res.totalParticles >= 1000n;
      case "q16":
        return talentCount(state) >= 1;
      case "q17":
        return res.memoryDust >= 100n;
      case "q18":
        return hero.level >= 15;
      case "q19":
        return hero.prestige.bossProgress >= 25;
      case "q20":
        return false;
      case "q21":
        return state.crafting.level >= 3;
      case "q22":
        return hasHighRarityItem(state);
      case "q23":
        return false;
      case "q24":
        return res.relics >= 50n;
      case "q25":
        return hero.prestige.bossProgress >= 30;
      case "q26":
        return hero.level >= 25;
      case "q27":
        return talentCount(state) >= 3;
      case "q28":
        return res.totalRelics >= 1000n;
      case "q29":
        return false;
      case "q30":
        return hero.prestige.bossProgress >= 40;
      case "q31":
        return hero.level >= 40;
      case "q32":
        return res.memoryDust >= 500n;
      case "q33":
        return state.crafting.level >= 5;
      case "q34":
        return hasItemAtLevel(state, 5);
      case "q35":
        return false;
      case "q36":
        return talentCount(state) >= 5;
      case "q37":
        return hasLegendaryItem(state);
      case "q38":
        return res.particles >= 10000n;
      case "q39":
        return false;
      case "q40":
        return hero.prestige.bossProgress >= 50;
      case "q41":
        return hero.level >= 60;
      case "q42":
        return res.catalyst >= 5n;
      case "q43":
        return state.crafting.level >= 10;
      case "q44":
        return talentCount(state) >= 8;
      case "q45":
        return hero.prestige.bossProgress >= 60;
      default:
        return false;
    }
  };

  const checkDailyReset = (): void => {
    const today = todayKey();
    store.setState((prev) => {
      if (prev.quests.daily.date === today) {
        return prev;
      }
      return {
        ...prev,
        quests: {
          ...prev.quests,
          daily: {
            ...prev.quests.daily,
            date: today,
            gatherClicks: 0,
            expeditions: 0,
            craftedItems: 0,
            claimed: [],
          },
        },
      };
    });
  };

  const incrementDaily = (key: "gatherClicks" | "expeditions" | "craftedItems"): void => {
    checkDailyReset();
    store.setState((prev) => ({
      ...prev,
      quests: {
        ...prev.quests,
        daily: {
          ...prev.quests.daily,
          [key]: prev.quests.daily[key] + 1,
        },
      },
    }));
  };

  eventBus.subscribe("forge:crafted", () => {
    incrementDaily("craftedItems");
  });
  eventBus.subscribe("story:bossDefeated", () => {
    service.checkCurrentQuest();
  });
  eventBus.subscribe("quest:manualGather", () => {
    incrementDaily("gatherClicks");
    service.checkCurrentQuest();
  });

  const service: QuestService = {
    getCurrentQuest() {
      const index = store.getState().quests.mainIndex;
      if (index >= MAIN_QUESTS_DATA.length) {
        return null;
      }
      return MAIN_QUESTS_DATA[index] ?? null;
    },

    isCurrentQuestComplete() {
      const quest = service.getCurrentQuest();
      if (!quest) {
        return false;
      }
      return checkCondition(quest.id);
    },

    checkCurrentQuest() {
      if (service.isCurrentQuestComplete()) {
        eventBus.publish("quest:completed", { quest: service.getCurrentQuest() });
      }
      eventBus.publish("quest:updated", {});
    },

    claimReward() {
      const quest = service.getCurrentQuest();
      if (!quest || !service.isCurrentQuestComplete()) {
        return false;
      }
      grantReward(quest.reward);
      store.setState((prev) => ({
        ...prev,
        quests: {
          ...prev.quests,
          mainIndex: prev.quests.mainIndex + 1,
        },
      }));
      eventBus.publish("quest:updated", {});
      return true;
    },

    getDailyQuests() {
      checkDailyReset();
      const daily = store.getState().quests.daily;
      return DAILY_QUESTS_DATA.map((def) => {
        const raw = daily[def.key as keyof typeof daily];
        const progress = typeof raw === "number" ? raw : 0;
        const isClaimed = daily.claimed.includes(def.id);
        return {
          ...def,
          progress: Math.min(progress, def.target),
          isClaimed,
          isComplete: progress >= def.target,
        };
      });
    },

    claimDailyReward(dailyId) {
      const entry = service.getDailyQuests().find((q) => q.id === dailyId);
      if (!entry || !entry.isComplete || entry.isClaimed) {
        return false;
      }
      grantReward(entry.reward);
      store.setState((prev) => ({
        ...prev,
        quests: {
          ...prev.quests,
          daily: {
            ...prev.quests.daily,
            claimed: [...prev.quests.daily.claimed, dailyId],
          },
        },
      }));
      eventBus.publish("quest:updated", {});
      return true;
    },

    checkDailyReset,
  };

  return service;
}
