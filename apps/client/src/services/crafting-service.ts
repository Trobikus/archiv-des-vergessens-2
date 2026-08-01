import { MASTER_RECIPES, type MasterRecipe } from "@adv/content";
import type { EventBus, Store } from "@adv/core";
import { createRng } from "@adv/core";

import type { GameState } from "../state/game-state";
import { createItemFromTemplate } from "./hero-service";
import type { ForgeService } from "./forge-service";
import type { HeroService } from "./hero-service";
import type { LibraryService } from "./library-service";
import type { ResourceService } from "./resource-service";

export type CraftingResult = {
  readonly success: boolean;
  readonly message: string;
  readonly quality?: number;
};

export type CraftingService = {
  getAvailableRecipes(): MasterRecipe[];
  getRecipeCost(recipe: MasterRecipe): Record<string, number>;
  craftMasterRecipe(recipeId: string): CraftingResult;
  getCraftingLevel(): number;
  getLevelProgress(): number;
};

const BASE_RECIPES = ["basic_weapon", "basic_armor"] as const;
const EXP_MULT = 1.2;

export function createCraftingService(
  store: Store<GameState>,
  eventBus: EventBus,
  resources: ResourceService,
  _hero: HeroService,
  _forge: ForgeService,
  library: LibraryService,
): CraftingService {
  const rng = createRng();

  const unlockedRecipes = (): string[] => {
    const list = store.getState().crafting.unlockedRecipes;
    return list.length > 0 ? [...list] : [...BASE_RECIPES];
  };

  const payCost = (cost: Record<string, number>): boolean => {
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
      if (key === "memoryDust" && res.memoryDust < BigInt(amount)) {
        return false;
      }
      if (key === "catalyst" && res.catalyst < BigInt(amount)) {
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
      } else if (key === "memoryDust") {
        resources.removeMemoryDust(amount);
      } else if (key === "catalyst") {
        resources.removeCatalyst(amount);
      }
    }
    return true;
  };

  const addExp = (amount: number): void => {
    if (amount <= 0) {
      return;
    }
    store.setState((prev) => {
      let exp = prev.crafting.exp + amount;
      let level = prev.crafting.level;
      let expToNext = prev.crafting.expToNext;
      while (exp >= expToNext) {
        exp -= expToNext;
        level += 1;
        expToNext = Math.floor(expToNext * EXP_MULT);
      }
      return {
        ...prev,
        crafting: { ...prev.crafting, exp, level, expToNext },
      };
    });
  };

  const calculateQuality = (baseQuality: number): number => {
    let quality = baseQuality + (rng.next() - 0.5) * 30;
    quality += store.getState().crafting.level;
    const critChance = 5 + store.getState().crafting.level * 0.5;
    if (rng.next() * 100 < critChance) {
      quality *= 1.5;
    }
    return Math.min(100, Math.max(0, Math.floor(quality)));
  };

  return {
    getAvailableRecipes() {
      const unlocked = unlockedRecipes();
      const bossProgress = store.getState().hero.prestige.bossProgress;
      return Object.values(MASTER_RECIPES).filter((recipe) => {
        if (!unlocked.includes(recipe.id)) {
          return false;
        }
        if ("unlockBoss" in recipe && bossProgress < recipe.unlockBoss) {
          return false;
        }
        return true;
      });
    },

    getRecipeCost(recipe) {
      const discount = library.getBonus("forge_discount");
      const multiplier = Math.max(0.1, 1 - discount);
      const cost: Record<string, number> = {};
      for (const [key, amount] of Object.entries(recipe.cost)) {
        cost[key] = Math.max(1, Math.floor(amount * multiplier));
      }
      return cost;
    },

    craftMasterRecipe(recipeId) {
      if (!(recipeId in MASTER_RECIPES)) {
        return { success: false, message: "Recipe not found." };
      }
      const recipe: MasterRecipe =
        MASTER_RECIPES[recipeId as keyof typeof MASTER_RECIPES];
      if (!unlockedRecipes().includes(recipeId)) {
        return { success: false, message: "Recipe locked." };
      }

      const cost = this.getRecipeCost(recipe);
      if (!payCost(cost)) {
        return { success: false, message: "Not enough resources." };
      }

      const quality = calculateQuality(recipe.baseQuality);

      if (recipe.isResourceRecipe && recipe.resourceResult) {
        for (const [key, amount] of Object.entries(recipe.resourceResult)) {
          if (key === "catalyst") {
            resources.addCatalyst(amount);
          } else if (key === "particles") {
            resources.addParticles(amount);
          } else if (key === "relics") {
            resources.addRelics(amount);
          } else if (key === "artifacts") {
            resources.addArtifacts(amount);
          } else if (key === "memoryDust") {
            resources.addMemoryDust(amount);
          }
        }
        addExp(recipe.difficulty * 3);
        eventBus.publish("crafting:masterwork", { recipe, quality });
        return {
          success: true,
          message: `${recipe.resultName} crafted (${String(quality)}%).`,
          quality,
        };
      }

      if (recipe.resultSlot === "none") {
        addExp(10 + recipe.difficulty * 2);
        return { success: true, message: "Craft complete.", quality };
      }

      const statMultiplier = 0.5 + (quality / 100) * 0.5;
      const baseStats = recipe.baseStats;
      const stats = {
        attack: Math.floor((baseStats.attack ?? 0) * statMultiplier),
        defense: Math.floor((baseStats.defense ?? 0) * statMultiplier),
        agility: Math.floor((baseStats.agility ?? 0) * statMultiplier),
        stamina: Math.floor((baseStats.stamina ?? 0) * statMultiplier),
      };

      const item = createItemFromTemplate(
        recipe.resultName,
        {
          slot: recipe.resultSlot,
          rarity: recipe.resultRarity,
          stats,
        },
        1,
      );

      store.setState((prev) => {
        let nextUnlocked = prev.crafting.unlockedRecipes;
        if (nextUnlocked.length === 0) {
          nextUnlocked = [...BASE_RECIPES];
        }
        const merged = new Set(nextUnlocked);
        for (const id of recipe.unlocks ?? []) {
          merged.add(id);
        }
        nextUnlocked = [...merged];
        return {
          ...prev,
          crafting: { ...prev.crafting, unlockedRecipes: nextUnlocked },
          hero: {
            ...prev.hero,
            inventory: {
              equipment: [...prev.hero.inventory.equipment, item],
            },
          },
        };
      });

      addExp(10 + recipe.difficulty * 2 + Math.floor(quality / 10));
      eventBus.publish("crafting:masterwork", { recipe, item, quality });
      eventBus.publish("forge:crafted", { recipe, item, quality });
      return {
        success: true,
        message: `${item.name} (${String(quality)}%).`,
        quality,
      };
    },

    getCraftingLevel() {
      return store.getState().crafting.level;
    },

    getLevelProgress() {
      const crafting = store.getState().crafting;
      if (crafting.expToNext <= 0) {
        return 0;
      }
      return Math.min(100, (crafting.exp / crafting.expToNext) * 100);
    },
  };
}
