import type { ForgeRecipe } from "./types";

/** From v1 `js/data/recipes.js`. */
export const FORGE_RECIPES = [
  {
    id: "craft_weapon",
    name: "Gedankenklinge",
    slot: "weapon",
    desc: "Schmiedet eine zufällige Waffe.",
    cost: {
      particles: 50,
      artifacts: 2
    }
  },
  {
    id: "craft_armor",
    name: "Erinnerungspanzer",
    slot: "armor",
    desc: "Schmiedet eine zufällige Rüstung.",
    cost: {
      particles: 50,
      artifacts: 2
    }
  },
  {
    id: "craft_amulet",
    name: "Amulett des Fokus",
    slot: "amulet",
    desc: "Schmiedet ein zufälliges Amulett.",
    cost: {
      particles: 80,
      relics: 5,
      artifacts: 3
    }
  },
  {
    id: "craft_ring",
    name: "Ring der Bindung",
    slot: "ring",
    desc: "Schmiedet einen zufälligen Ring.",
    cost: {
      particles: 80,
      relics: 5,
      artifacts: 3
    }
  },
  {
    id: "craft_master",
    name: "Meisterwerk",
    slot: "random",
    desc: "Zufälliges Meisterwerk mit hoher Seltenheits-Chance.",
    cost: {
      particles: 200,
      relics: 15,
      artifacts: 10
    }
  },
  {
    id: "craft_prestige",
    name: "Prestige-Exklusiv",
    slot: "random",
    desc: "Schmiedet ein nur durch Prestige freigegebenes Item.",
    cost: {
      particles: 180,
      relics: 20,
      artifacts: 12
    },
    unlockLevel: 1
  }
] as const satisfies readonly ForgeRecipe[];
