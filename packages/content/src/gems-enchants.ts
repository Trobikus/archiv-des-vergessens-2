import type {
  EnchantmentDefinition,
  GemDefinition,
  RuneDefinition,
} from "./types";

/** From v1 `js/data/gems_enchants.js`. */
export const GEMS = {
  ruby_flawless: {
    id: "ruby_flawless",
    name: "Makelloser Rubin",
    type: "ruby",
    color: "#ff4d4d",
    icon: "💎",
    stats: {
      damagePercent: 15
    },
    description: "+15% Physikalischer Schaden",
    costMneme: 500
  },
  sapphire_flawless: {
    id: "sapphire_flawless",
    name: "Makelloser Saphir",
    type: "sapphire",
    color: "#3399ff",
    icon: "🔷",
    stats: {
      maxHpPercent: 20
    },
    description: "+20% Maximale Gesundheit",
    costMneme: 500
  },
  emerald_flawless: {
    id: "emerald_flawless",
    name: "Makelloser Smaragd",
    type: "emerald",
    color: "#33cc66",
    icon: "🟢",
    stats: {
      critChancePercent: 12,
      attackSpeedPercent: 5
    },
    description: "+12% Krit-Chance & +5% Angriffsgeschwindigkeit",
    costMneme: 500
  },
  topaz_flawless: {
    id: "topaz_flawless",
    name: "Makelloser Topas",
    type: "topaz",
    color: "#ffcc00",
    icon: "🟡",
    stats: {
      mnemeGainPercent: 25
    },
    description: "+25% Mneme-Ertrag",
    costMneme: 500
  }
} as const satisfies Record<string, GemDefinition>;

export const ENCHANTMENTS = {
  scroll_mneme_power: {
    id: "scroll_mneme_power",
    name: "Rolle des Mnemischen Zorns",
    icon: "📜",
    enchantName: "Mnemischer Zorn",
    stats: {
      flatDamage: 25,
      damagePercent: 10
    },
    description: "+25 Flat-Schaden & +10% Schaden",
    costMneme: 1000
  },
  scroll_aegis_shield: {
    id: "scroll_aegis_shield",
    name: "Rolle des Titanenschutzes",
    icon: "📜",
    enchantName: "Titanenschutz",
    stats: {
      flatDefense: 30,
      maxHpPercent: 15
    },
    description: "+30 Flat-Rüstung & +15% Max HP",
    costMneme: 1000
  },
  scroll_swift_wind: {
    id: "scroll_swift_wind",
    name: "Rolle des Rückenwinds",
    icon: "📜",
    enchantName: "Rückenwind",
    stats: {
      attackSpeedPercent: 12,
      critMultiplierPercent: 15
    },
    description: "+12% Angriffsgeschwindigkeit & +15% Krit-Schaden",
    costMneme: 1000
  }
} as const satisfies Record<string, EnchantmentDefinition>;

export const RUNES = {
  rune_el: {
    id: "rune_el",
    name: "Rune El",
    type: "rune",
    color: "#e2e8f0",
    icon: "ᛖ",
    stats: {
      flatDamage: 10,
      attackSpeedPercent: 5
    },
    description: "+10 Angriff & +5% Angriffsgeschwindigkeit",
    costMneme: 300
  },
  rune_eth: {
    id: "rune_eth",
    name: "Rune Eth",
    type: "rune",
    color: "#a7f3d0",
    icon: "ᚦ",
    stats: {
      flatDefense: 15,
      maxHpPercent: 8
    },
    description: "+15 Rüstung & +8% Max HP",
    costMneme: 300
  },
  rune_ith: {
    id: "rune_ith",
    name: "Rune Ith",
    type: "rune",
    color: "#fef08a",
    icon: "ᛁ",
    stats: {
      critChancePercent: 8,
      critMultiplierPercent: 10
    },
    description: "+8% Krit-Chance & +10% Krit-Schaden",
    costMneme: 400
  },
  rune_ort: {
    id: "rune_ort",
    name: "Rune Ort",
    type: "rune",
    color: "#c084fc",
    icon: "ᛟ",
    stats: {
      mnemeGainPercent: 20
    },
    description: "+20% Mneme-Ertrag",
    costMneme: 400
  },
  rune_sol: {
    id: "rune_sol",
    name: "Rune Sol",
    type: "rune",
    color: "#fb7185",
    icon: "ᛋ",
    stats: {
      flatDamage: 25,
      flatDefense: 20
    },
    description: "+25 Angriff & +20 Rüstung",
    costMneme: 600
  },
  rune_ohm: {
    id: "rune_ohm",
    name: "Rune Ohm",
    type: "rune",
    color: "#38bdf8",
    icon: "ᛟ",
    stats: {
      damagePercent: 20,
      attackSpeedPercent: 10
    },
    description: "+20% Schaden & +10% Angriffsgeschwindigkeit",
    costMneme: 800
  }
} as const satisfies Record<string, RuneDefinition>;
