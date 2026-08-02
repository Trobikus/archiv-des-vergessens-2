import {
  getItemTemplate,
  HERO_CLASSES,
  type HeroClassId,
  type ItemTemplate,
} from "@adv/content";
import type { Store } from "@adv/core";
import { createDefaultTutorialSave } from "@adv/protocol";
import { CONFIG } from "@adv/sim";
import {
  applyExperience,
  calculateCombatStats,
  scaleItemStats,
  sumAttributes,
  type CombatStats,
  type HeroAttributes,
  type StatKey,
} from "@adv/sim";

import type {
  EquipmentState,
  GameState,
  InventoryItem,
} from "../state/game-state";

let itemSeq = 0;

export type HeroService = {
  getAttributes(): HeroAttributes;
  getCombatStats(): CombatStats;
  createHero(input: {
    readonly name: string;
    readonly classId: HeroClassId;
  }): boolean;
  addExperience(amount: number): number;
  spendStatPoint(stat: StatKey): boolean;
  equipFromInventory(itemId: string): boolean;
  unequip(slot: keyof EquipmentState): boolean;
};

function equipmentStatList(equipment: EquipmentState) {
  return Object.values(equipment)
    .filter((item): item is InventoryItem => item !== null)
    .map((item) => item.stats);
}

export function createItemFromTemplate(
  name: string,
  template: ItemTemplate,
  level = 1,
): InventoryItem {
  itemSeq += 1;
  const scaled = scaleItemStats(template.stats, level);
  return {
    id: `item_${String(itemSeq)}_${String(Date.now())}`,
    name,
    slot: template.slot,
    rarity: template.rarity,
    level,
    stats: {
      attack: scaled.attack ?? 0,
      defense: scaled.defense ?? 0,
      agility: scaled.agility ?? 0,
      stamina: scaled.stamina ?? 0,
    },
  };
}

export function createHeroService(store: Store<GameState>): HeroService {
  const getAttributes = (): HeroAttributes => {
    const hero = store.getState().hero;
    return sumAttributes(
      hero.baseStats,
      hero.spentStats,
      equipmentStatList(hero.equipment),
    );
  };

  return {
    getAttributes,

    getCombatStats() {
      return calculateCombatStats(getAttributes());
    },

    createHero({ name, classId }) {
      const trimmed = name.trim();
      if (trimmed.length < 2 || trimmed.length > 20) {
        return false;
      }
      const klass = HERO_CLASSES.find((entry) => entry.id === classId);
      if (!klass) {
        return false;
      }
      const locale = store.getState().settings.locale;
      const title = locale === "en" ? klass.titleEn : klass.titleDe;

      store.setState((prev) => ({
        ...prev,
        hero: {
          ...prev.hero,
          name: trimmed,
          title,
          avatar: klass.avatar,
          created: true,
        },
        // First enter per new character starts the onboarding tutorial.
        tutorial: createDefaultTutorialSave(),
      }));
      return true;
    },

    addExperience(amount) {
      const hero = store.getState().hero;
      const gained = applyExperience(
        {
          level: hero.level,
          experience: hero.experience,
          expToNext: hero.expToNext,
          unspentStatPoints: hero.unspentStatPoints,
        },
        amount,
        {
          maxLevel: CONFIG.HERO.MAX_LEVEL,
          statPointsPerLevel: CONFIG.HERO.STAT_POINTS_PER_LEVEL,
        },
      );
      store.setState((prev) => ({
        ...prev,
        hero: {
          ...prev.hero,
          level: gained.level,
          experience: gained.experience,
          expToNext: gained.expToNext,
          unspentStatPoints: gained.unspentStatPoints,
        },
      }));
      return gained.levelsGained;
    },

    spendStatPoint(stat) {
      const hero = store.getState().hero;
      if (hero.unspentStatPoints <= 0) {
        return false;
      }
      store.setState((prev) => ({
        ...prev,
        hero: {
          ...prev.hero,
          unspentStatPoints: prev.hero.unspentStatPoints - 1,
          spentStats: {
            ...prev.hero.spentStats,
            [stat]: prev.hero.spentStats[stat] + 1,
          },
        },
      }));
      return true;
    },

    equipFromInventory(itemId) {
      const hero = store.getState().hero;
      const item = hero.inventory.equipment.find((entry) => entry.id === itemId);
      if (!item) {
        return false;
      }

      const slotKey =
        item.slot === "ring" && hero.equipment.ring !== null
          ? ("ring2" as const)
          : (item.slot as keyof EquipmentState);

      if (!(slotKey in hero.equipment)) {
        return false;
      }

      const previous = hero.equipment[slotKey];
      const remaining = hero.inventory.equipment.filter(
        (entry) => entry.id !== itemId,
      );
      const nextInventory =
        previous === null ? remaining : [...remaining, previous];

      store.setState((prev) => ({
        ...prev,
        hero: {
          ...prev.hero,
          equipment: { ...prev.hero.equipment, [slotKey]: item },
          inventory: { equipment: nextInventory },
        },
      }));
      return true;
    },

    unequip(slot) {
      const hero = store.getState().hero;
      const equipped = hero.equipment[slot];
      if (equipped === null) {
        return false;
      }
      store.setState((prev) => ({
        ...prev,
        hero: {
          ...prev.hero,
          equipment: { ...prev.hero.equipment, [slot]: null },
          inventory: {
            equipment: [...prev.hero.inventory.equipment, equipped],
          },
        },
      }));
      return true;
    },
  };
}

export function resolveRewardItems(names: readonly string[]): InventoryItem[] {
  const items: InventoryItem[] = [];
  for (const name of names) {
    const template = getItemTemplate(name);
    if (template) {
      items.push(createItemFromTemplate(name, template, 1));
    }
  }
  return items;
}
