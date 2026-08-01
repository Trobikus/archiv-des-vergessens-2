import {
  FORGE_RECIPES,
  type ForgeRecipe,
  type ItemRarity,
  type ItemSlot,
} from "@adv/content";
import type { EventBus, Store } from "@adv/core";
import { createRng } from "@adv/core";

import type { GameState, InventoryItem } from "../state/game-state";
import { createItemFromTemplate } from "./hero-service";
import type { HeroService } from "./hero-service";
import type { LibraryService } from "./library-service";
import type { ResourceService } from "./resource-service";

export type ForgeResult = {
  readonly success: boolean;
  readonly message: string;
  readonly item?: InventoryItem;
};

export type ForgeService = {
  getRecipes(): readonly ForgeRecipe[];
  getRecipeCost(recipe: ForgeRecipe): Record<string, number>;
  craft(recipeId: string): ForgeResult;
  upgradeEquipped(slot: keyof GameState["hero"]["equipment"]): ForgeResult;
  salvageItem(index: number): ForgeResult;
};

const SALVAGE_DUST: Record<ItemRarity, number> = {
  common: 1,
  uncommon: 3,
  rare: 10,
  epic: 25,
  legendary: 100,
};

const RARITY_PREFIX: Record<ItemRarity, string> = {
  common: "Einfacher ",
  uncommon: "Guter ",
  rare: "Verstärkter ",
  epic: "Meisterhafter ",
  legendary: "Göttlicher ",
};

const SLOT_NAMES: Record<ItemSlot, string> = {
  weapon: "Schmiede-Stahl",
  armor: "Schmiede-Panzer",
  amulet: "Schmiede-Kristall",
  ring: "Schmiede-Reif",
  shield: "Schmiede-Schild",
  helmet: "Schmiede-Helm",
  shoulders: "Schmiede-Schultern",
  gloves: "Schmiede-Handschuhe",
  belt: "Schmiede-Gürtel",
  boots: "Schmiede-Stiefel",
};

function rollRarity(roll: number, masterpiece: boolean): ItemRarity {
  if (roll > (masterpiece ? 0.85 : 0.96)) {
    return "legendary";
  }
  if (roll > (masterpiece ? 0.6 : 0.85)) {
    return "epic";
  }
  if (roll > (masterpiece ? 0.3 : 0.65)) {
    return "rare";
  }
  if (roll > (masterpiece ? 0 : 0.4)) {
    return "uncommon";
  }
  return "common";
}

function statMultiplier(rarity: ItemRarity): number {
  switch (rarity) {
    case "legendary":
      return 4;
    case "epic":
      return 2.8;
    case "rare":
      return 1.8;
    case "uncommon":
      return 1.3;
    default:
      return 1;
  }
}

export function createForgeService(
  store: Store<GameState>,
  eventBus: EventBus,
  resources: ResourceService,
  _hero: HeroService,
  library: LibraryService,
): ForgeService {
  const rng = createRng();

  const payCost = (cost: Record<string, number>): boolean => {
    for (const [key, amount] of Object.entries(cost)) {
      const current = store.getState().resources;
      if (key === "particles" && current.particles < BigInt(amount)) {
        return false;
      }
      if (key === "relics" && current.relics < BigInt(amount)) {
        return false;
      }
      if (key === "artifacts" && current.artifacts < BigInt(amount)) {
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
    return true;
  };

  return {
    getRecipes() {
      return FORGE_RECIPES;
    },

    getRecipeCost(recipe) {
      const discount = Math.min(0.5, 0.1 + library.getBonus("forge_discount"));
      const multiplier = 1 - discount;
      const cost: Record<string, number> = {};
      for (const [key, amount] of Object.entries(recipe.cost)) {
        cost[key] = Math.max(1, Math.floor(amount * multiplier));
      }
      return cost;
    },

    craft(recipeId) {
      const recipe = FORGE_RECIPES.find((entry) => entry.id === recipeId);
      if (!recipe) {
        return { success: false, message: "Recipe not found." };
      }

      const state = store.getState();
      if (
        "unlockLevel" in recipe &&
        Number(state.resources.ewigeMneme) < recipe.unlockLevel
      ) {
        return { success: false, message: "Prestige locked." };
      }

      const cost = this.getRecipeCost(recipe);
      if (!payCost(cost)) {
        return { success: false, message: "Not enough resources." };
      }

      const masterpiece = recipe.id === "craft_master";
      const rarity = rollRarity(rng.next(), masterpiece);
      const mult = statMultiplier(rarity);
      const slots: ItemSlot[] = ["weapon", "armor", "amulet", "ring"];
      const finalSlot: ItemSlot =
        recipe.slot === "random"
          ? (slots[Math.floor(rng.next() * slots.length)] ?? "weapon")
          : recipe.slot;

      const basePower = masterpiece ? 8 : 4;
      const power = Math.floor(basePower * mult) + Math.floor(rng.next() * 3);
      const stats = { attack: 0, defense: 0, agility: 0, stamina: 0 };

      switch (finalSlot) {
        case "weapon":
          stats.attack = power + 2;
          if (rng.next() > 0.5) {
            stats.agility = Math.floor(power / 2);
          }
          break;
        case "armor":
          stats.defense = power + 2;
          if (rng.next() > 0.5) {
            stats.stamina = Math.floor(power / 2);
          }
          break;
        case "amulet":
          stats.attack = Math.floor(power / 1.5);
          stats.stamina = Math.floor(power / 1.5);
          break;
        case "ring":
          stats.defense = Math.floor(power / 1.5);
          stats.agility = Math.floor(power / 1.5);
          break;
        default:
          stats.attack = power;
          break;
      }

      const item = createItemFromTemplate(
        `${RARITY_PREFIX[rarity]}${SLOT_NAMES[finalSlot]}`,
        { slot: finalSlot, rarity, stats },
        1,
      );

      store.setState((prev) => ({
        ...prev,
        forge: { craftedCount: prev.forge.craftedCount + 1 },
        hero: {
          ...prev.hero,
          inventory: {
            equipment: [...prev.hero.inventory.equipment, item],
          },
        },
      }));

      eventBus.publish("forge:crafted", { recipe, item });
      return { success: true, message: `${item.name} forged.`, item };
    },

    upgradeEquipped(slot) {
      const item = store.getState().hero.equipment[slot];
      if (!item) {
        return { success: false, message: "No item in slot." };
      }
      if (item.level >= 10) {
        return { success: false, message: "Max level reached." };
      }

      const rarityMult =
        item.rarity === "legendary"
          ? 5
          : item.rarity === "epic"
            ? 3
            : item.rarity === "rare"
              ? 2
              : 1;
      const cost = item.level * 10 * rarityMult;
      if (!resources.removeMemoryDust(cost)) {
        return { success: false, message: `Need ${String(cost)} memory dust.` };
      }

      store.setState((prev) => {
        const equipped = prev.hero.equipment[slot];
        if (!equipped) {
          return prev;
        }
        return {
          ...prev,
          hero: {
            ...prev.hero,
            equipment: {
              ...prev.hero.equipment,
              [slot]: { ...equipped, level: equipped.level + 1 },
            },
          },
        };
      });

      eventBus.publish("forge:upgraded", { slot });
      return { success: true, message: "Item upgraded." };
    },

    salvageItem(index) {
      const inventory = store.getState().hero.inventory.equipment;
      const item = inventory[index];
      if (!item) {
        return { success: false, message: "Item not found." };
      }
      if (item.rarity !== "common") {
        return { success: false, message: "Only common items can be salvaged here." };
      }

      const dust = SALVAGE_DUST[item.rarity] * item.level;
      store.setState((prev) => ({
        ...prev,
        hero: {
          ...prev.hero,
          inventory: {
            equipment: prev.hero.inventory.equipment.filter((_, i) => i !== index),
          },
        },
      }));
      resources.addMemoryDust(dust);
      eventBus.publish("forge:salvaged", { item, amount: dust });
      return { success: true, message: `Salvaged for ${String(dust)} dust.` };
    },
  };
}
