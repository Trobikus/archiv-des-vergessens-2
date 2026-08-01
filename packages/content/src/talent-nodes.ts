import type { TalentNode } from "./types";

/** From v1 `js/data/talent-nodes.js`. */
export const TALENT_NODES = {
  start_0: {
    id: "start_0",
    name: "Ursprung der Mneme",
    type: "start",
    x: 0,
    y: 0,
    cost: 0,
    connections: [
      "str_1",
      "mneme_1",
      "dex_1",
      "def_1"
    ],
    stats: {
      damagePercent: 2,
      maxHpPercent: 2,
      mnemeGainPercent: 2
    },
    description: "Der Nexus des Bewusstseins. Verbindet alle Pfade der Macht.",
    icon: "🌀"
  },
  str_1: {
    id: "str_1",
    name: "Machtimpuls I",
    type: "small",
    x: 0,
    y: -80,
    cost: 1,
    connections: [
      "start_0",
      "str_2"
    ],
    stats: {
      damagePercent: 4
    },
    description: "+4% Physikalischer Schaden.",
    icon: "⚔️"
  },
  str_2: {
    id: "str_2",
    name: "Machtimpuls II",
    type: "small",
    x: 0,
    y: -160,
    cost: 1,
    connections: [
      "str_1",
      "str_notable_1",
      "str_crit_1"
    ],
    stats: {
      damagePercent: 6
    },
    description: "+6% Physikalischer Schaden.",
    icon: "⚔️"
  },
  str_notable_1: {
    id: "str_notable_1",
    name: "Schicksalsklinge",
    type: "notable",
    x: -80,
    y: -240,
    cost: 2,
    connections: [
      "str_2",
      "str_3"
    ],
    stats: {
      damagePercent: 12,
      critChancePercent: 5
    },
    description: "+12% Physikalischer Schaden und +5% Kritische Trefferchance.",
    icon: "🗡️"
  },
  str_crit_1: {
    id: "str_crit_1",
    name: "Präziser Schnitt",
    type: "small",
    x: 80,
    y: -240,
    cost: 1,
    connections: [
      "str_2",
      "str_3"
    ],
    stats: {
      critMultiplierPercent: 15
    },
    description: "+15% Kritischer Schadensmultiplikator.",
    icon: "🎯"
  },
  str_3: {
    id: "str_3",
    name: "Kriegskunst",
    type: "small",
    x: 0,
    y: -320,
    cost: 1,
    connections: [
      "str_notable_1",
      "str_crit_1",
      "keystone_berserk"
    ],
    stats: {
      damagePercent: 8,
      attackSpeedPercent: 5
    },
    description: "+8% Schaden und +5% Angriffsgeschwindigkeit.",
    icon: "⚡"
  },
  keystone_berserk: {
    id: "keystone_berserk",
    name: "Blutiger Zorn",
    type: "keystone",
    x: 0,
    y: -420,
    cost: 3,
    connections: [
      "str_3"
    ],
    stats: {
      damagePercent: 30,
      critMultiplierPercent: 25,
      defensePercent: -10
    },
    description: "SCHLÜSSELKNOTEN: +30% Schaden & +25% Krit-Schaden, aber -10% Rüstung.",
    icon: "🔥"
  },
  mneme_1: {
    id: "mneme_1",
    name: "Mnemischer Fluss I",
    type: "small",
    x: 80,
    y: 0,
    cost: 1,
    connections: [
      "start_0",
      "mneme_2"
    ],
    stats: {
      mnemeGainPercent: 8
    },
    description: "+8% Mneme-Ertrag.",
    icon: "✨"
  },
  mneme_2: {
    id: "mneme_2",
    name: "Mnemischer Fluss II",
    type: "small",
    x: 160,
    y: 0,
    cost: 1,
    connections: [
      "mneme_1",
      "mneme_notable_1",
      "mneme_cd_1"
    ],
    stats: {
      mnemeGainPercent: 12
    },
    description: "+12% Mneme-Ertrag.",
    icon: "✨"
  },
  mneme_notable_1: {
    id: "mneme_notable_1",
    name: "Mnemischer Sog",
    type: "notable",
    x: 240,
    y: -80,
    cost: 2,
    connections: [
      "mneme_2",
      "mneme_3"
    ],
    stats: {
      mnemeGainPercent: 25,
      xpGainPercent: 10
    },
    description: "+25% Mneme-Ertrag und +10% Erfahrungs-Bonus.",
    icon: "🌟"
  },
  mneme_cd_1: {
    id: "mneme_cd_1",
    name: "Geistesgegenwart",
    type: "small",
    x: 240,
    y: 80,
    cost: 1,
    connections: [
      "mneme_2",
      "mneme_3"
    ],
    stats: {
      cooldownReductionPercent: 5
    },
    description: "+5% Abklingzeit-Reduktion.",
    icon: "⌛"
  },
  mneme_3: {
    id: "mneme_3",
    name: "Kognitives Erwachen",
    type: "small",
    x: 320,
    y: 0,
    cost: 1,
    connections: [
      "mneme_notable_1",
      "mneme_cd_1",
      "keystone_mindstorm"
    ],
    stats: {
      mnemeGainPercent: 15,
      damagePercent: 5
    },
    description: "+15% Mneme-Ertrag und +5% Schaden.",
    icon: "🔮"
  },
  keystone_mindstorm: {
    id: "keystone_mindstorm",
    name: "Gedankensturm",
    type: "keystone",
    x: 420,
    y: 0,
    cost: 3,
    connections: [
      "mneme_3"
    ],
    stats: {
      mnemeGainPercent: 50,
      cooldownReductionPercent: 10,
      maxHpPercent: -15
    },
    description: "SCHLÜSSELKNOTEN: +50% Mneme-Ertrag & +10% Abklingzeit-Reduktion, aber -15% Max HP.",
    icon: "🌩️"
  },
  dex_1: {
    id: "dex_1",
    name: "Reflexe I",
    type: "small",
    x: 0,
    y: 80,
    cost: 1,
    connections: [
      "start_0",
      "dex_2"
    ],
    stats: {
      attackSpeedPercent: 4
    },
    description: "+4% Angriffsgeschwindigkeit.",
    icon: "🏹"
  },
  dex_2: {
    id: "dex_2",
    name: "Reflexe II",
    type: "small",
    x: 0,
    y: 160,
    cost: 1,
    connections: [
      "dex_1",
      "dex_notable_1",
      "dex_crit_1"
    ],
    stats: {
      attackSpeedPercent: 6
    },
    description: "+6% Angriffsgeschwindigkeit.",
    icon: "🏹"
  },
  dex_notable_1: {
    id: "dex_notable_1",
    name: "Tödliche Eleganz",
    type: "notable",
    x: -80,
    y: 240,
    cost: 2,
    connections: [
      "dex_2",
      "dex_3"
    ],
    stats: {
      attackSpeedPercent: 10,
      critChancePercent: 8
    },
    description: "+10% Angriffsgeschwindigkeit und +8% Kritische Trefferchance.",
    icon: "⚡"
  },
  dex_crit_1: {
    id: "dex_crit_1",
    name: "Schattenfokus",
    type: "small",
    x: 80,
    y: 240,
    cost: 1,
    connections: [
      "dex_2",
      "dex_3"
    ],
    stats: {
      critChancePercent: 5,
      critMultiplierPercent: 10
    },
    description: "+5% Kritische Trefferchance und +10% Krit-Schaden.",
    icon: "🗡️"
  },
  dex_3: {
    id: "dex_3",
    name: "Meister der Klingen",
    type: "small",
    x: 0,
    y: 320,
    cost: 1,
    connections: [
      "dex_notable_1",
      "dex_crit_1",
      "keystone_shadow"
    ],
    stats: {
      attackSpeedPercent: 8,
      damagePercent: 6
    },
    description: "+8% Angriffsgeschwindigkeit und +6% Schaden.",
    icon: "🌪️"
  },
  keystone_shadow: {
    id: "keystone_shadow",
    name: "Schattenlauf",
    type: "keystone",
    x: 0,
    y: 420,
    cost: 3,
    connections: [
      "dex_3"
    ],
    stats: {
      critChancePercent: 15,
      attackSpeedPercent: 15,
      damagePercent: -10
    },
    description: "SCHLÜSSELKNOTEN: +15% Krit-Chance & +15% Tempo, aber -10% Basis-Schaden.",
    icon: "👤"
  },
  def_1: {
    id: "def_1",
    name: "Abhärtung I",
    type: "small",
    x: -80,
    y: 0,
    cost: 1,
    connections: [
      "start_0",
      "def_2"
    ],
    stats: {
      maxHpPercent: 5
    },
    description: "+5% Maximale Gesundheit.",
    icon: "🛡️"
  },
  def_2: {
    id: "def_2",
    name: "Abhärtung II",
    type: "small",
    x: -160,
    y: 0,
    cost: 1,
    connections: [
      "def_1",
      "def_notable_1",
      "def_armor_1"
    ],
    stats: {
      maxHpPercent: 8
    },
    description: "+8% Maximale Gesundheit.",
    icon: "🛡️"
  },
  def_notable_1: {
    id: "def_notable_1",
    name: "Eherne Festung",
    type: "notable",
    x: -240,
    y: -80,
    cost: 2,
    connections: [
      "def_2",
      "def_3"
    ],
    stats: {
      maxHpPercent: 15,
      defensePercent: 15
    },
    description: "+15% Maximale Gesundheit und +15% Rüstung.",
    icon: "🏰"
  },
  def_armor_1: {
    id: "def_armor_1",
    name: "Mnemische Panzerung",
    type: "small",
    x: -240,
    y: 80,
    cost: 1,
    connections: [
      "def_2",
      "def_3"
    ],
    stats: {
      defensePercent: 10,
      hpRegenPercent: 1
    },
    description: "+10% Rüstung und +1% Lebensregeneration.",
    icon: "🧱"
  },
  def_3: {
    id: "def_3",
    name: "Unerschütterlicher Wille",
    type: "small",
    x: -320,
    y: 0,
    cost: 1,
    connections: [
      "def_notable_1",
      "def_armor_1",
      "keystone_titan"
    ],
    stats: {
      maxHpPercent: 10,
      defensePercent: 10
    },
    description: "+10% Maximale Gesundheit und +10% Rüstung.",
    icon: "⛰️"
  },
  keystone_titan: {
    id: "keystone_titan",
    name: "Titanische Aura",
    type: "keystone",
    x: -420,
    y: 0,
    cost: 3,
    connections: [
      "def_3"
    ],
    stats: {
      maxHpPercent: 40,
      defensePercent: 30,
      attackSpeedPercent: -15
    },
    description: "SCHLÜSSELKNOTEN: +40% Max HP & +30% Rüstung, aber -15% Angriffsgeschwindigkeit.",
    icon: "🗿"
  }
} as const satisfies Record<string, TalentNode>;
