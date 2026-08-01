import type { MasterRecipe } from "./types";

/** From v1 `js/data/crafting_recipes.js`. */
export const MASTER_RECIPES = {
  basic_weapon: {
    id: "basic_weapon",
    name: "Einfache Waffe",
    desc: "Eine solide Waffe für den Anfang.",
    cost: {
      particles: 50,
      relics: 5
    },
    resultName: "Grundlegende Klinge",
    resultSlot: "weapon",
    resultRarity: "uncommon",
    baseStats: {
      attack: 8,
      agility: 2
    },
    baseQuality: 60,
    difficulty: 1,
    unlocks: [
      "improved_weapon"
    ]
  },
  basic_armor: {
    id: "basic_armor",
    name: "Einfache Rüstung",
    desc: "Bietet grundlegenden Schutz.",
    cost: {
      particles: 50,
      relics: 5
    },
    resultName: "Grundlegende Platte",
    resultSlot: "armor",
    resultRarity: "uncommon",
    baseStats: {
      defense: 7,
      stamina: 3
    },
    baseQuality: 60,
    difficulty: 1,
    unlocks: [
      "improved_armor"
    ]
  },
  improved_weapon: {
    id: "improved_weapon",
    name: "Verbesserte Waffe",
    desc: "Deutlich stärker als die Basisversion.",
    cost: {
      particles: 120,
      relics: 15,
      catalyst: 3
    },
    resultName: "Stahlklinge",
    resultSlot: "weapon",
    resultRarity: "rare",
    baseStats: {
      attack: 15,
      agility: 6
    },
    baseQuality: 65,
    difficulty: 2,
    unlockBoss: 1,
    unlocks: [
      "elite_weapon"
    ]
  },
  improved_armor: {
    id: "improved_armor",
    name: "Verbesserte Rüstung",
    desc: "Besserer Schutz.",
    cost: {
      particles: 120,
      relics: 15,
      catalyst: 3
    },
    resultName: "Stahlpanzer",
    resultSlot: "armor",
    resultRarity: "rare",
    baseStats: {
      defense: 14,
      stamina: 6
    },
    baseQuality: 65,
    difficulty: 2,
    unlockBoss: 1,
    unlocks: [
      "elite_armor"
    ]
  },
  elite_weapon: {
    id: "elite_weapon",
    name: "Elite-Waffe",
    desc: "Für wahre Krieger.",
    cost: {
      particles: 300,
      relics: 40,
      artifacts: 10,
      catalyst: 12,
      essence: 5
    },
    resultName: "Dämonenklinge",
    resultSlot: "weapon",
    resultRarity: "epic",
    baseStats: {
      attack: 28,
      agility: 12,
      stamina: 4
    },
    baseQuality: 75,
    difficulty: 4,
    unlockBoss: 5,
    unlocks: [
      "legendary_weapon"
    ]
  },
  elite_armor: {
    id: "elite_armor",
    name: "Elite-Rüstung",
    desc: "Schützt vor den finstersten Mächten.",
    cost: {
      particles: 300,
      relics: 40,
      artifacts: 10,
      catalyst: 12,
      essence: 5
    },
    resultName: "Dämonenpanzer",
    resultSlot: "armor",
    resultRarity: "epic",
    baseStats: {
      defense: 26,
      stamina: 12,
      agility: 4
    },
    baseQuality: 75,
    difficulty: 4,
    unlockBoss: 5,
    unlocks: [
      "legendary_armor"
    ]
  },
  legendary_weapon: {
    id: "legendary_weapon",
    name: "Legendäre Waffe",
    desc: "Nur die Größten können sie schmieden.",
    cost: {
      particles: 800,
      relics: 100,
      artifacts: 30,
      catalyst: 30,
      essence: 20
    },
    resultName: "Göttliche Klinge",
    resultSlot: "weapon",
    resultRarity: "legendary",
    baseStats: {
      attack: 50,
      agility: 20,
      stamina: 10,
      defense: 5
    },
    baseQuality: 85,
    difficulty: 6,
    unlockBoss: 10,
    unlocks: [
      "mythic_weapon"
    ]
  },
  legendary_armor: {
    id: "legendary_armor",
    name: "Legendäre Rüstung",
    desc: "Unverwüstlich.",
    cost: {
      particles: 800,
      relics: 100,
      artifacts: 30,
      catalyst: 30,
      essence: 20
    },
    resultName: "Göttlicher Panzer",
    resultSlot: "armor",
    resultRarity: "legendary",
    baseStats: {
      defense: 48,
      stamina: 20,
      agility: 10,
      attack: 5
    },
    baseQuality: 85,
    difficulty: 6,
    unlockBoss: 10,
    unlocks: [
      "mythic_armor"
    ]
  },
  mythic_weapon: {
    id: "mythic_weapon",
    name: "Mythische Waffe",
    desc: "Jenseits von Legendär.",
    cost: {
      particles: 2000,
      relics: 300,
      artifacts: 80,
      catalyst: 80,
      essence: 50
    },
    resultName: "Klinge der Unendlichkeit",
    resultSlot: "weapon",
    resultRarity: "legendary",
    baseStats: {
      attack: 80,
      agility: 30,
      stamina: 20,
      defense: 10
    },
    baseQuality: 95,
    difficulty: 8,
    unlockBoss: 20,
    unlocks: []
  },
  mythic_armor: {
    id: "mythic_armor",
    name: "Mythische Rüstung",
    desc: "Die ultimative Verteidigung.",
    cost: {
      particles: 2000,
      relics: 300,
      artifacts: 80,
      catalyst: 80,
      essence: 50
    },
    resultName: "Rüstung der Ewigkeit",
    resultSlot: "armor",
    resultRarity: "legendary",
    baseStats: {
      defense: 75,
      stamina: 30,
      agility: 20,
      attack: 10
    },
    baseQuality: 95,
    difficulty: 8,
    unlockBoss: 20,
    unlocks: []
  },
  catalyst_from_essence: {
    id: "catalyst_from_essence",
    name: "Katalysator aus Essenz",
    desc: "Wandle Essenz in Katalysator um.",
    cost: {
      essence: 3
    },
    resultName: "Katalysator-Brocken",
    resultSlot: "none",
    resultRarity: "common",
    baseStats: {},
    baseQuality: 50,
    difficulty: 1,
    isResourceRecipe: true,
    resourceResult: {
      catalyst: 1
    }
  }
} as const satisfies Record<string, MasterRecipe>;
