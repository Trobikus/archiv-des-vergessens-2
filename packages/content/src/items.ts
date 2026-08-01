import type { ItemTemplate } from "./types";

/** Item templates from v1 `js/data/items.js`, plus chapter unique rewards (v1 gap fix). */
export const ITEM_TEMPLATES = {
  "Staubige Klinge": {
    slot: "weapon",
    rarity: "common",
    stats: {
      attack: 3
    }
  },
  "Rissiges Kurzschwert": {
    slot: "weapon",
    rarity: "common",
    stats: {
      attack: 4
    }
  },
  "Zerbrochener Mneme-Stab": {
    slot: "weapon",
    rarity: "common",
    stats: {
      attack: 2,
      agility: 1
    }
  },
  "Rostiger Kolben": {
    slot: "weapon",
    rarity: "common",
    stats: {
      attack: 5
    }
  },
  Schattenschneide: {
    slot: "weapon",
    rarity: "uncommon",
    stats: {
      attack: 8,
      agility: 2
    }
  },
  "Scharfer Dolch der Erinnerung": {
    slot: "weapon",
    rarity: "uncommon",
    stats: {
      attack: 6,
      agility: 4
    }
  },
  "Stab des Suchenden": {
    slot: "weapon",
    rarity: "uncommon",
    stats: {
      attack: 5,
      stamina: 3
    }
  },
  Schattenklinge: {
    slot: "weapon",
    rarity: "rare",
    stats: {
      attack: 14,
      agility: 4
    }
  },
  "Runenschwert des Suchenden": {
    slot: "weapon",
    rarity: "rare",
    stats: {
      attack: 12,
      stamina: 5
    }
  },
  "Klinge der Gezeiten": {
    slot: "weapon",
    rarity: "rare",
    stats: {
      attack: 16,
      agility: 2
    }
  },
  "Archiv-Klinge": {
    slot: "weapon",
    rarity: "epic",
    stats: {
      attack: 24,
      agility: 8
    }
  },
  "Großschwert der Vergessenen": {
    slot: "weapon",
    rarity: "epic",
    stats: {
      attack: 32,
      stamina: 6
    }
  },
  "Zauberstab der Äonen": {
    slot: "weapon",
    rarity: "epic",
    stats: {
      attack: 20,
      agility: 12
    }
  },
  "Klinge der Ersten": {
    slot: "weapon",
    rarity: "legendary",
    stats: {
      attack: 45,
      agility: 15
    }
  },
  "Architekten-Klinge": {
    slot: "weapon",
    rarity: "legendary",
    stats: {
      attack: 55,
      agility: 18,
      defense: 4
    }
  },
  "Gott-Klinge": {
    slot: "weapon",
    rarity: "legendary",
    stats: {
      attack: 75,
      agility: 25,
      defense: 6
    }
  },
  "Seelenreißer": {
    slot: "weapon",
    rarity: "legendary",
    stats: {
      attack: 65,
      agility: 22,
      stamina: 10
    }
  },
  Holzschild: {
    slot: "shield",
    rarity: "common",
    stats: {
      defense: 2
    }
  },
  "Rissiger Rundschild": {
    slot: "shield",
    rarity: "common",
    stats: {
      defense: 3
    }
  },
  "Verstärktes Holzschild": {
    slot: "shield",
    rarity: "uncommon",
    stats: {
      defense: 6,
      stamina: 1
    }
  },
  "Rostiger Eisenschild": {
    slot: "shield",
    rarity: "uncommon",
    stats: {
      defense: 8
    }
  },
  "Wappen des Chronisten": {
    slot: "shield",
    rarity: "rare",
    stats: {
      defense: 14,
      stamina: 3
    }
  },
  "Bastion des Vergessens": {
    slot: "shield",
    rarity: "rare",
    stats: {
      defense: 18,
      agility: -2
    }
  },
  "Mneme-Schild der Ewigkeit": {
    slot: "shield",
    rarity: "epic",
    stats: {
      defense: 28,
      stamina: 6
    }
  },
  "Bollwerk der Vergeltung": {
    slot: "shield",
    rarity: "epic",
    stats: {
      defense: 35,
      attack: 4
    }
  },
  "Ur-Schild der Götter": {
    slot: "shield",
    rarity: "legendary",
    stats: {
      defense: 52,
      stamina: 12
    }
  },
  "Ägide des Architekten": {
    slot: "shield",
    rarity: "legendary",
    stats: {
      defense: 64,
      stamina: 15,
      agility: 5
    }
  },
  Lederkappe: {
    slot: "helmet",
    rarity: "common",
    stats: {
      defense: 1,
      agility: 1
    }
  },
  "Kapuze des Zweiflers": {
    slot: "helmet",
    rarity: "common",
    stats: {
      defense: 1,
      stamina: 1
    }
  },
  Eisenhelm: {
    slot: "helmet",
    rarity: "uncommon",
    stats: {
      defense: 4,
      stamina: 2
    }
  },
  "Maske des Mneme-Ordens": {
    slot: "helmet",
    rarity: "uncommon",
    stats: {
      defense: 3,
      agility: 3
    }
  },
  "Visier der Wahrheit": {
    slot: "helmet",
    rarity: "rare",
    stats: {
      defense: 8,
      stamina: 4,
      agility: 2
    }
  },
  "Krone des Wissenssuchenden": {
    slot: "helmet",
    rarity: "rare",
    stats: {
      defense: 6,
      attack: 4,
      stamina: 2
    }
  },
  "Mneme-Helm der Weisheit": {
    slot: "helmet",
    rarity: "epic",
    stats: {
      defense: 15,
      stamina: 8,
      agility: 5
    }
  },
  "Schleier der Unendlichkeit": {
    slot: "helmet",
    rarity: "epic",
    stats: {
      defense: 12,
      agility: 12,
      stamina: 4
    }
  },
  "Diadem des Schöpfers": {
    slot: "helmet",
    rarity: "legendary",
    stats: {
      defense: 25,
      stamina: 15,
      agility: 10,
      attack: 5
    }
  },
  "Krone der verlorenen Könige": {
    slot: "helmet",
    rarity: "legendary",
    stats: {
      defense: 20,
      attack: 15,
      stamina: 12
    }
  },
  "Lederne Achselstücke": {
    slot: "shoulders",
    rarity: "common",
    stats: {
      defense: 1
    }
  },
  Stoffschultern: {
    slot: "shoulders",
    rarity: "common",
    stats: {
      agility: 1
    }
  },
  Eisenschulterplatten: {
    slot: "shoulders",
    rarity: "uncommon",
    stats: {
      defense: 3,
      stamina: 1
    }
  },
  "Schulterschützer der Wachsamkeit": {
    slot: "shoulders",
    rarity: "uncommon",
    stats: {
      defense: 2,
      agility: 2
    }
  },
  "Schwingen des Vergessens": {
    slot: "shoulders",
    rarity: "rare",
    stats: {
      defense: 6,
      agility: 5
    }
  },
  "Schulterstücke des Bewahrers": {
    slot: "shoulders",
    rarity: "rare",
    stats: {
      defense: 8,
      stamina: 3
    }
  },
  "Epauletten der Ahnen": {
    slot: "shoulders",
    rarity: "epic",
    stats: {
      defense: 12,
      stamina: 6,
      attack: 4
    }
  },
  "Mneme-Schulterplatten": {
    slot: "shoulders",
    rarity: "epic",
    stats: {
      defense: 14,
      agility: 6,
      stamina: 4
    }
  },
  "Platten des Sternenlichts": {
    slot: "shoulders",
    rarity: "legendary",
    stats: {
      defense: 22,
      stamina: 12,
      attack: 10,
      agility: 8
    }
  },
  "Schultern der Schöpfung": {
    slot: "shoulders",
    rarity: "legendary",
    stats: {
      defense: 28,
      stamina: 16,
      agility: 10
    }
  },
  "Flickwerk-Rüstung": {
    slot: "armor",
    rarity: "common",
    stats: {
      defense: 2
    }
  },
  "Grobes Lederwams": {
    slot: "armor",
    rarity: "common",
    stats: {
      defense: 1,
      agility: 1
    }
  },
  "Zerfetzter Mantel": {
    slot: "armor",
    rarity: "common",
    stats: {
      defense: 1,
      stamina: 1
    }
  },
  "Kettenhemd der Wache": {
    slot: "armor",
    rarity: "uncommon",
    stats: {
      defense: 5,
      stamina: 2
    }
  },
  "Gewand des Mneme-Adepten": {
    slot: "armor",
    rarity: "uncommon",
    stats: {
      defense: 3,
      agility: 4
    }
  },
  Abgrundplatte: {
    slot: "armor",
    rarity: "rare",
    stats: {
      defense: 10,
      stamina: 4
    }
  },
  "Harnisch des standhaften Ritters": {
    slot: "armor",
    rarity: "rare",
    stats: {
      defense: 12,
      stamina: 3
    }
  },
  "Mantel der Schatten": {
    slot: "armor",
    rarity: "rare",
    stats: {
      defense: 6,
      agility: 8
    }
  },
  "Chronisten-Robe": {
    slot: "armor",
    rarity: "epic",
    stats: {
      defense: 18,
      stamina: 8
    }
  },
  "Plattenpanzer der Ewigkeit": {
    slot: "armor",
    rarity: "epic",
    stats: {
      defense: 25,
      stamina: 6,
      agility: 2
    }
  },
  "Ur-Rüstung": {
    slot: "armor",
    rarity: "legendary",
    stats: {
      defense: 32,
      stamina: 14
    }
  },
  "Gestalter-Robe": {
    slot: "armor",
    rarity: "legendary",
    stats: {
      defense: 28,
      stamina: 12,
      agility: 10
    }
  },
  "Gott-Rüstung": {
    slot: "armor",
    rarity: "legendary",
    stats: {
      defense: 48,
      stamina: 22,
      attack: 8
    }
  },
  "Gewand der Leere": {
    slot: "armor",
    rarity: "legendary",
    stats: {
      defense: 35,
      agility: 20,
      stamina: 15
    }
  },
  "Abgenutzte Lederhandschuhe": {
    slot: "gloves",
    rarity: "common",
    stats: {
      defense: 1
    }
  },
  Stoffwickel: {
    slot: "gloves",
    rarity: "common",
    stats: {
      agility: 1
    }
  },
  Kettenhandschuhe: {
    slot: "gloves",
    rarity: "uncommon",
    stats: {
      defense: 3,
      stamina: 1
    }
  },
  "Handschützer des Adepten": {
    slot: "gloves",
    rarity: "uncommon",
    stats: {
      agility: 3,
      attack: 1
    }
  },
  "Griffe der Finsternis": {
    slot: "gloves",
    rarity: "rare",
    stats: {
      attack: 6,
      agility: 4
    }
  },
  "Handschuhe der Präzision": {
    slot: "gloves",
    rarity: "rare",
    stats: {
      agility: 8,
      stamina: 2
    }
  },
  "Mneme-Handschuhe der Macht": {
    slot: "gloves",
    rarity: "epic",
    stats: {
      attack: 12,
      defense: 6,
      agility: 4
    }
  },
  "Runen-Gauntlets": {
    slot: "gloves",
    rarity: "epic",
    stats: {
      defense: 10,
      stamina: 6,
      agility: 4
    }
  },
  "Gott-Handschuhe": {
    slot: "gloves",
    rarity: "legendary",
    stats: {
      attack: 22,
      defense: 12,
      agility: 10,
      stamina: 8
    }
  },
  "Berührung der Leere": {
    slot: "gloves",
    rarity: "legendary",
    stats: {
      agility: 18,
      attack: 14,
      stamina: 10
    }
  },
  "Einfacher Ledergürtel": {
    slot: "belt",
    rarity: "common",
    stats: {
      defense: 1
    }
  },
  "Strick-Gürtel": {
    slot: "belt",
    rarity: "common",
    stats: {
      stamina: 1
    }
  },
  "Schnallengürtel": {
    slot: "belt",
    rarity: "uncommon",
    stats: {
      defense: 3,
      stamina: 1
    }
  },
  "Schärpe des Mneme-Ordens": {
    slot: "belt",
    rarity: "uncommon",
    stats: {
      agility: 2,
      stamina: 2
    }
  },
  "Kette der Standhaftigkeit": {
    slot: "belt",
    rarity: "rare",
    stats: {
      defense: 6,
      stamina: 4
    }
  },
  "Gürtel der Schatten": {
    slot: "belt",
    rarity: "rare",
    stats: {
      agility: 6,
      attack: 2
    }
  },
  "Mneme-Gürtel der Bewahrung": {
    slot: "belt",
    rarity: "epic",
    stats: {
      defense: 10,
      stamina: 8,
      agility: 4
    }
  },
  "Gürtel des Vergessens": {
    slot: "belt",
    rarity: "epic",
    stats: {
      attack: 8,
      defense: 6,
      stamina: 6
    }
  },
  "Gurt des Schöpfers": {
    slot: "belt",
    rarity: "legendary",
    stats: {
      defense: 18,
      stamina: 14,
      attack: 8
    }
  },
  "Gürtel der Unendlichkeit": {
    slot: "belt",
    rarity: "legendary",
    stats: {
      stamina: 16,
      agility: 12,
      defense: 10
    }
  },
  "Ausgetretene Lederschuhe": {
    slot: "boots",
    rarity: "common",
    stats: {
      defense: 1
    }
  },
  Stoffstiefel: {
    slot: "boots",
    rarity: "common",
    stats: {
      agility: 1
    }
  },
  "Eisenbeschlagene Stiefel": {
    slot: "boots",
    rarity: "uncommon",
    stats: {
      defense: 3,
      stamina: 1
    }
  },
  "Panzerschuhe der Wache": {
    slot: "boots",
    rarity: "uncommon",
    stats: {
      defense: 4
    }
  },
  "Späherstiefel": {
    slot: "boots",
    rarity: "rare",
    stats: {
      agility: 6,
      stamina: 2
    }
  },
  "Schritte der Stille": {
    slot: "boots",
    rarity: "rare",
    stats: {
      agility: 8,
      defense: 2
    }
  },
  "Mneme-Stiefel": {
    slot: "boots",
    rarity: "epic",
    stats: {
      agility: 14,
      defense: 6,
      stamina: 4
    }
  },
  "Pfadfinder der Äonen": {
    slot: "boots",
    rarity: "epic",
    stats: {
      stamina: 10,
      agility: 10,
      defense: 4
    }
  },
  "Schritte der Ewigkeit": {
    slot: "boots",
    rarity: "legendary",
    stats: {
      agility: 24,
      defense: 10,
      stamina: 10,
      attack: 6
    }
  },
  "Gott-Stiefel": {
    slot: "boots",
    rarity: "legendary",
    stats: {
      defense: 18,
      stamina: 16,
      agility: 16
    }
  },
  "Amulett der Dämmerung": {
    slot: "amulet",
    rarity: "uncommon",
    stats: {
      attack: 4,
      stamina: 2
    }
  },
  "Amulett der Namenlosen": {
    slot: "amulet",
    rarity: "rare",
    stats: {
      attack: 8,
      defense: 4
    }
  },
  "Siegel des Sternenlichts": {
    slot: "amulet",
    rarity: "rare",
    stats: {
      agility: 6,
      stamina: 4
    }
  },
  "Mneme-Amulett": {
    slot: "amulet",
    rarity: "epic",
    stats: {
      attack: 12,
      defense: 8,
      stamina: 4
    }
  },
  "Amulett der Ewigkeit": {
    slot: "amulet",
    rarity: "legendary",
    stats: {
      attack: 22,
      defense: 15,
      stamina: 10
    }
  },
  "Halskette der Götter": {
    slot: "amulet",
    rarity: "legendary",
    stats: {
      attack: 30,
      agility: 20,
      stamina: 15
    }
  },
  "Mneme-Krone": {
    slot: "amulet",
    rarity: "legendary",
    stats: {
      attack: 15,
      defense: 10,
      stamina: 10,
      agility: 10
    }
  },
  "Ring der Einkehr": {
    slot: "ring",
    rarity: "uncommon",
    stats: {
      defense: 2,
      agility: 2
    }
  },
  "Band des Schweigens": {
    slot: "ring",
    rarity: "uncommon",
    stats: {
      agility: 3,
      stamina: 1
    }
  },
  "Ring der Leere": {
    slot: "ring",
    rarity: "rare",
    stats: {
      agility: 6,
      stamina: 4
    }
  },
  "Band des Vergessens": {
    slot: "ring",
    rarity: "rare",
    stats: {
      attack: 5,
      defense: 5
    }
  },
  "Ring der Erinnerung": {
    slot: "ring",
    rarity: "epic",
    stats: {
      agility: 10,
      stamina: 6,
      attack: 4
    }
  },
  "Siegelring der Ewigkeit": {
    slot: "ring",
    rarity: "epic",
    stats: {
      defense: 8,
      stamina: 8,
      agility: 4
    }
  },
  "Ring der Unendlichkeit": {
    slot: "ring",
    rarity: "legendary",
    stats: {
      agility: 18,
      stamina: 12,
      attack: 10
    }
  },
  "Ring der Götter": {
    slot: "ring",
    rarity: "legendary",
    stats: {
      attack: 16,
      defense: 16,
      stamina: 12,
      agility: 12
    }
  },
  "Bruchstück der Gläsernen Ära": {
    slot: "amulet",
    rarity: "legendary",
    stats: {
      attack: 8,
      stamina: 6,
      agility: 4
    }
  },
  "Sternenlicht-Klinge des Hüters": {
    slot: "weapon",
    rarity: "legendary",
    stats: {
      attack: 28,
      agility: 10
    }
  },
  "Seelenfänger-Amulett": {
    slot: "amulet",
    rarity: "legendary",
    stats: {
      attack: 14,
      defense: 8
    }
  },
  "Ring der unendlichen Gezeiten": {
    slot: "ring",
    rarity: "legendary",
    stats: {
      agility: 12,
      stamina: 8,
      defense: 6
    }
  },
  "Schattenstahl-Klinge": {
    slot: "weapon",
    rarity: "legendary",
    stats: {
      attack: 32,
      agility: 12
    }
  },
  "Rostplatte der Techno-Endzeit": {
    slot: "armor",
    rarity: "legendary",
    stats: {
      defense: 30,
      stamina: 14
    }
  },
  "Zerrissenes Foliantenblatt": {
    slot: "amulet",
    rarity: "legendary",
    stats: {
      attack: 10,
      agility: 10,
      stamina: 8
    }
  },
  "Dunkler Reif des Nichts": {
    slot: "ring",
    rarity: "legendary",
    stats: {
      attack: 12,
      agility: 14
    }
  },
  "Inschrift-Schwert des Ur-Zirkels": {
    slot: "weapon",
    rarity: "legendary",
    stats: {
      attack: 38,
      stamina: 8
    }
  },
  "Gewebte Chronisten-Robe": {
    slot: "armor",
    rarity: "legendary",
    stats: {
      defense: 26,
      stamina: 12,
      agility: 8
    }
  },
  "Lichtbringer-Amulett": {
    slot: "amulet",
    rarity: "legendary",
    stats: {
      attack: 18,
      defense: 10,
      stamina: 8
    }
  },
  "Reif der Ewigen Reue": {
    slot: "ring",
    rarity: "legendary",
    stats: {
      defense: 10,
      stamina: 12,
      attack: 8
    }
  },
  "Urahnen-Klinge der Ersten": {
    slot: "weapon",
    rarity: "legendary",
    stats: {
      attack: 42,
      agility: 14
    }
  },
  "Sterne-Garnierte Ur-Plattenrüstung": {
    slot: "armor",
    rarity: "legendary",
    stats: {
      defense: 36,
      stamina: 16,
      attack: 6
    }
  },
  "Amulett der Stillstehenden Zeit": {
    slot: "amulet",
    rarity: "legendary",
    stats: {
      defense: 12,
      stamina: 14,
      agility: 8
    }
  },
  "Band der ewigen Stille": {
    slot: "ring",
    rarity: "legendary",
    stats: {
      agility: 16,
      stamina: 10
    }
  },
  "Entwurfs-Klinge der Realität": {
    slot: "weapon",
    rarity: "legendary",
    stats: {
      attack: 48,
      agility: 16,
      defense: 4
    }
  },
  "Schicksalsweber-Gewand": {
    slot: "armor",
    rarity: "legendary",
    stats: {
      defense: 34,
      stamina: 14,
      agility: 12
    }
  },
  "Heilige Klinge der Götterdämmerung": {
    slot: "weapon",
    rarity: "legendary",
    stats: {
      attack: 55,
      agility: 18,
      defense: 6
    }
  },
  "Urmacht-Brustplatte": {
    slot: "armor",
    rarity: "legendary",
    stats: {
      defense: 42,
      stamina: 18,
      attack: 8
    }
  },
  "Krone des Kollektiven Bewusstseins": {
    slot: "helmet",
    rarity: "legendary",
    stats: {
      defense: 22,
      stamina: 16,
      attack: 10,
      agility: 10
    }
  }
} as const satisfies Record<string, ItemTemplate>;

export type ItemTemplateName = keyof typeof ITEM_TEMPLATES;

export function getItemTemplate(name: string): ItemTemplate | undefined {
  if (Object.prototype.hasOwnProperty.call(ITEM_TEMPLATES, name)) {
    return ITEM_TEMPLATES[name as ItemTemplateName];
  }
  return undefined;
}
