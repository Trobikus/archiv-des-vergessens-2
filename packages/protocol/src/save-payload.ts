import type { ValidationResult } from "./save-envelope";

export type GedankenArchivSave = {
  readonly level: number;
  readonly baseCost: number;
  readonly costMultiplier: number;
  readonly baseYield: number;
  readonly upgrades: {
    readonly focusBonus: number;
  };
};

export type StatBlockSave = {
  readonly attack: number;
  readonly defense: number;
  readonly agility: number;
  readonly stamina: number;
};

export type ItemSave = {
  readonly id: string;
  readonly name: string;
  readonly slot: string;
  readonly rarity: string;
  readonly level: number;
  readonly stats: StatBlockSave;
};

export type EquipmentSave = {
  readonly weapon: ItemSave | null;
  readonly shield: ItemSave | null;
  readonly helmet: ItemSave | null;
  readonly shoulders: ItemSave | null;
  readonly armor: ItemSave | null;
  readonly gloves: ItemSave | null;
  readonly belt: ItemSave | null;
  readonly boots: ItemSave | null;
  readonly amulet: ItemSave | null;
  readonly ring: ItemSave | null;
  readonly ring2: ItemSave | null;
};

export type HeroSave = {
  readonly id: string;
  readonly name: string;
  readonly title: string;
  readonly avatar: string;
  readonly created: boolean;
  readonly level: number;
  readonly experience: number;
  readonly expToNext: number;
  readonly baseStats: StatBlockSave;
  readonly spentStats: StatBlockSave;
  readonly unspentStatPoints: number;
  readonly equipment: EquipmentSave;
  readonly inventory: {
    readonly equipment: readonly ItemSave[];
  };
  readonly prestige: {
    readonly bossProgress: number;
    readonly defeatedBosses: readonly number[];
  };
  readonly unlockedSkills: readonly string[];
};

export type StorySave = {
  readonly storyFightsIntroSeen: boolean;
  readonly selectedChapter: number;
};

export type SettingsSave = {
  readonly locale: "de" | "en";
};

/** Phase-2+ save payload (resources / idle / gather / hero / story / settings). */
export type Phase2SavePayload = {
  readonly resources: {
    readonly particles: string;
    readonly totalParticles: string;
    readonly mnemeFragmente: string;
    readonly totalMnemeFragmente: string;
    readonly ewigeMneme: string;
  };
  readonly idleGenerators: {
    readonly gedankenArchiv: GedankenArchivSave;
  };
  readonly gather: {
    readonly clickPowerLevel: number;
  };
  readonly hero: HeroSave;
  readonly story: StorySave;
  readonly settings: SettingsSave;
  readonly meta: {
    readonly lastActiveAt: number;
  };
};

const EQUIPMENT_SLOTS = [
  "weapon",
  "shield",
  "helmet",
  "shoulders",
  "armor",
  "gloves",
  "belt",
  "boots",
  "amulet",
  "ring",
  "ring2",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isDigitString(value: unknown): value is string {
  return typeof value === "string" && /^-?\d+$/.test(value);
}

function isNonNegativeInt(value: unknown): value is number {
  return isFiniteNumber(value) && value >= 0 && Number.isInteger(value);
}

function validateGedankenArchiv(
  value: unknown,
): ValidationResult<GedankenArchivSave> {
  if (!isRecord(value)) {
    return { ok: false, error: "gedankenArchiv must be an object" };
  }
  if (!isFiniteNumber(value["level"]) || value["level"] < 0) {
    return { ok: false, error: "gedankenArchiv.level invalid" };
  }
  if (!isFiniteNumber(value["baseCost"]) || value["baseCost"] < 0) {
    return { ok: false, error: "gedankenArchiv.baseCost invalid" };
  }
  if (!isFiniteNumber(value["costMultiplier"]) || value["costMultiplier"] < 1) {
    return { ok: false, error: "gedankenArchiv.costMultiplier invalid" };
  }
  if (!isFiniteNumber(value["baseYield"]) || value["baseYield"] < 0) {
    return { ok: false, error: "gedankenArchiv.baseYield invalid" };
  }
  const upgrades = value["upgrades"];
  if (!isRecord(upgrades)) {
    return { ok: false, error: "gedankenArchiv.upgrades must be an object" };
  }
  if (!isFiniteNumber(upgrades["focusBonus"]) || upgrades["focusBonus"] < 0) {
    return { ok: false, error: "gedankenArchiv.upgrades.focusBonus invalid" };
  }
  return {
    ok: true,
    value: {
      level: Math.floor(value["level"]),
      baseCost: value["baseCost"],
      costMultiplier: value["costMultiplier"],
      baseYield: value["baseYield"],
      upgrades: { focusBonus: upgrades["focusBonus"] },
    },
  };
}

function validateStatBlock(
  value: unknown,
  label: string,
): ValidationResult<StatBlockSave> {
  if (!isRecord(value)) {
    return { ok: false, error: `${label} must be an object` };
  }
  const attack = value["attack"];
  const defense = value["defense"];
  const agility = value["agility"];
  const stamina = value["stamina"];
  if (!isFiniteNumber(attack) || attack < 0) {
    return { ok: false, error: `${label}.attack invalid` };
  }
  if (!isFiniteNumber(defense) || defense < 0) {
    return { ok: false, error: `${label}.defense invalid` };
  }
  if (!isFiniteNumber(agility) || agility < 0) {
    return { ok: false, error: `${label}.agility invalid` };
  }
  if (!isFiniteNumber(stamina) || stamina < 0) {
    return { ok: false, error: `${label}.stamina invalid` };
  }
  return {
    ok: true,
    value: {
      attack,
      defense,
      agility,
      stamina,
    },
  };
}

function validateItemSave(
  value: unknown,
  label: string,
): ValidationResult<ItemSave> {
  if (!isRecord(value)) {
    return { ok: false, error: `${label} must be an object` };
  }
  if (typeof value["id"] !== "string" || value["id"].length === 0) {
    return { ok: false, error: `${label}.id invalid` };
  }
  if (typeof value["name"] !== "string" || value["name"].length === 0) {
    return { ok: false, error: `${label}.name invalid` };
  }
  if (typeof value["slot"] !== "string" || value["slot"].length === 0) {
    return { ok: false, error: `${label}.slot invalid` };
  }
  if (typeof value["rarity"] !== "string" || value["rarity"].length === 0) {
    return { ok: false, error: `${label}.rarity invalid` };
  }
  if (!isNonNegativeInt(value["level"]) || value["level"] < 1) {
    return { ok: false, error: `${label}.level invalid` };
  }
  const stats = validateStatBlock(value["stats"], `${label}.stats`);
  if (!stats.ok) {
    return stats;
  }
  return {
    ok: true,
    value: {
      id: value["id"],
      name: value["name"],
      slot: value["slot"],
      rarity: value["rarity"],
      level: value["level"],
      stats: stats.value,
    },
  };
}

function validateEquipment(
  value: unknown,
): ValidationResult<EquipmentSave> {
  if (!isRecord(value)) {
    return { ok: false, error: "hero.equipment must be an object" };
  }
  const equipment = {} as Record<(typeof EQUIPMENT_SLOTS)[number], ItemSave | null>;
  for (const slot of EQUIPMENT_SLOTS) {
    const entry = value[slot];
    if (entry === null || entry === undefined) {
      equipment[slot] = null;
      continue;
    }
    const item = validateItemSave(entry, `hero.equipment.${slot}`);
    if (!item.ok) {
      return item;
    }
    equipment[slot] = item.value;
  }
  return { ok: true, value: equipment };
}

export function createDefaultHeroSave(): HeroSave {
  return {
    id: "hero_1",
    name: "",
    title: "",
    avatar: "",
    created: false,
    level: 1,
    experience: 0,
    expToNext: 50,
    baseStats: { attack: 5, defense: 3, agility: 4, stamina: 6 },
    spentStats: { attack: 0, defense: 0, agility: 0, stamina: 0 },
    unspentStatPoints: 0,
    equipment: {
      weapon: null,
      shield: null,
      helmet: null,
      shoulders: null,
      armor: null,
      gloves: null,
      belt: null,
      boots: null,
      amulet: null,
      ring: null,
      ring2: null,
    },
    inventory: { equipment: [] },
    prestige: { bossProgress: 0, defeatedBosses: [] },
    unlockedSkills: [],
  };
}

export function createDefaultStorySave(): StorySave {
  return {
    storyFightsIntroSeen: false,
    selectedChapter: 1,
  };
}

export function createDefaultSettingsSave(): SettingsSave {
  return { locale: "de" };
}

function validateHero(value: unknown): ValidationResult<HeroSave> {
  if (value === undefined) {
    return { ok: true, value: createDefaultHeroSave() };
  }
  if (!isRecord(value)) {
    return { ok: false, error: "hero must be an object" };
  }
  if (typeof value["id"] !== "string" || value["id"].length === 0) {
    return { ok: false, error: "hero.id invalid" };
  }
  if (typeof value["name"] !== "string") {
    return { ok: false, error: "hero.name invalid" };
  }
  if (typeof value["title"] !== "string") {
    return { ok: false, error: "hero.title invalid" };
  }
  if (typeof value["avatar"] !== "string") {
    return { ok: false, error: "hero.avatar invalid" };
  }
  if (typeof value["created"] !== "boolean") {
    return { ok: false, error: "hero.created invalid" };
  }
  if (!isNonNegativeInt(value["level"]) || value["level"] < 1) {
    return { ok: false, error: "hero.level invalid" };
  }
  if (!isNonNegativeInt(value["experience"])) {
    return { ok: false, error: "hero.experience invalid" };
  }
  if (!isFiniteNumber(value["expToNext"]) || value["expToNext"] < 1) {
    return { ok: false, error: "hero.expToNext invalid" };
  }
  if (!isNonNegativeInt(value["unspentStatPoints"])) {
    return { ok: false, error: "hero.unspentStatPoints invalid" };
  }

  const baseStats = validateStatBlock(value["baseStats"], "hero.baseStats");
  if (!baseStats.ok) {
    return baseStats;
  }
  const spentStats = validateStatBlock(value["spentStats"], "hero.spentStats");
  if (!spentStats.ok) {
    return spentStats;
  }
  const equipment = validateEquipment(value["equipment"]);
  if (!equipment.ok) {
    return equipment;
  }

  const inventory = value["inventory"];
  if (!isRecord(inventory) || !Array.isArray(inventory["equipment"])) {
    return { ok: false, error: "hero.inventory.equipment must be an array" };
  }
  const inventoryItems: ItemSave[] = [];
  for (let i = 0; i < inventory["equipment"].length; i += 1) {
    const item = validateItemSave(
      inventory["equipment"][i],
      `hero.inventory.equipment[${String(i)}]`,
    );
    if (!item.ok) {
      return item;
    }
    inventoryItems.push(item.value);
  }

  const prestige = value["prestige"];
  if (!isRecord(prestige)) {
    return { ok: false, error: "hero.prestige must be an object" };
  }
  if (!isNonNegativeInt(prestige["bossProgress"])) {
    return { ok: false, error: "hero.prestige.bossProgress invalid" };
  }
  if (!Array.isArray(prestige["defeatedBosses"])) {
    return { ok: false, error: "hero.prestige.defeatedBosses invalid" };
  }
  const defeatedBosses: number[] = [];
  for (const id of prestige["defeatedBosses"]) {
    if (!isNonNegativeInt(id) || id < 1) {
      return { ok: false, error: "hero.prestige.defeatedBosses entry invalid" };
    }
    defeatedBosses.push(id);
  }

  if (!Array.isArray(value["unlockedSkills"])) {
    return { ok: false, error: "hero.unlockedSkills invalid" };
  }
  const unlockedSkills: string[] = [];
  for (const skill of value["unlockedSkills"]) {
    if (typeof skill !== "string") {
      return { ok: false, error: "hero.unlockedSkills entry invalid" };
    }
    unlockedSkills.push(skill);
  }

  return {
    ok: true,
    value: {
      id: value["id"],
      name: value["name"],
      title: value["title"],
      avatar: value["avatar"],
      created: value["created"],
      level: value["level"],
      experience: value["experience"],
      expToNext: value["expToNext"],
      baseStats: baseStats.value,
      spentStats: spentStats.value,
      unspentStatPoints: value["unspentStatPoints"],
      equipment: equipment.value,
      inventory: { equipment: inventoryItems },
      prestige: {
        bossProgress: prestige["bossProgress"],
        defeatedBosses,
      },
      unlockedSkills,
    },
  };
}

function validateStory(value: unknown): ValidationResult<StorySave> {
  if (value === undefined) {
    return { ok: true, value: createDefaultStorySave() };
  }
  if (!isRecord(value)) {
    return { ok: false, error: "story must be an object" };
  }
  if (typeof value["storyFightsIntroSeen"] !== "boolean") {
    return { ok: false, error: "story.storyFightsIntroSeen invalid" };
  }
  if (
    !isNonNegativeInt(value["selectedChapter"]) ||
    value["selectedChapter"] < 1
  ) {
    return { ok: false, error: "story.selectedChapter invalid" };
  }
  return {
    ok: true,
    value: {
      storyFightsIntroSeen: value["storyFightsIntroSeen"],
      selectedChapter: value["selectedChapter"],
    },
  };
}

function validateSettings(value: unknown): ValidationResult<SettingsSave> {
  if (value === undefined) {
    return { ok: true, value: createDefaultSettingsSave() };
  }
  if (!isRecord(value)) {
    return { ok: false, error: "settings must be an object" };
  }
  const locale = value["locale"];
  if (locale !== "de" && locale !== "en") {
    return { ok: false, error: "settings.locale invalid" };
  }
  return { ok: true, value: { locale } };
}

export function validatePhase2SavePayload(
  value: unknown,
): ValidationResult<Phase2SavePayload> {
  if (!isRecord(value)) {
    return { ok: false, error: "payload must be an object" };
  }

  const resources = value["resources"];
  if (!isRecord(resources)) {
    return { ok: false, error: "resources must be an object" };
  }
  const particles = resources["particles"];
  const totalParticles = resources["totalParticles"];
  const mnemeFragmente = resources["mnemeFragmente"];
  const totalMnemeFragmente = resources["totalMnemeFragmente"];
  const ewigeMneme = resources["ewigeMneme"];
  if (!isDigitString(particles)) {
    return { ok: false, error: "resources.particles must be an integer string" };
  }
  if (!isDigitString(totalParticles)) {
    return {
      ok: false,
      error: "resources.totalParticles must be an integer string",
    };
  }
  if (!isDigitString(mnemeFragmente)) {
    return {
      ok: false,
      error: "resources.mnemeFragmente must be an integer string",
    };
  }
  if (!isDigitString(totalMnemeFragmente)) {
    return {
      ok: false,
      error: "resources.totalMnemeFragmente must be an integer string",
    };
  }
  if (!isDigitString(ewigeMneme)) {
    return {
      ok: false,
      error: "resources.ewigeMneme must be an integer string",
    };
  }

  const idleGenerators = value["idleGenerators"];
  if (!isRecord(idleGenerators)) {
    return { ok: false, error: "idleGenerators must be an object" };
  }
  const archiv = validateGedankenArchiv(idleGenerators["gedankenArchiv"]);
  if (!archiv.ok) {
    return archiv;
  }

  const gather = value["gather"];
  if (!isRecord(gather)) {
    return { ok: false, error: "gather must be an object" };
  }
  const clickPowerLevel = gather["clickPowerLevel"];
  if (!isFiniteNumber(clickPowerLevel) || clickPowerLevel < 0) {
    return { ok: false, error: "gather.clickPowerLevel invalid" };
  }

  const hero = validateHero(value["hero"]);
  if (!hero.ok) {
    return hero;
  }
  const story = validateStory(value["story"]);
  if (!story.ok) {
    return story;
  }
  const settings = validateSettings(value["settings"]);
  if (!settings.ok) {
    return settings;
  }

  const meta = value["meta"];
  if (!isRecord(meta)) {
    return { ok: false, error: "meta must be an object" };
  }
  const lastActiveAt = meta["lastActiveAt"];
  if (!isFiniteNumber(lastActiveAt) || lastActiveAt < 0) {
    return { ok: false, error: "meta.lastActiveAt invalid" };
  }

  return {
    ok: true,
    value: {
      resources: {
        particles,
        totalParticles,
        mnemeFragmente,
        totalMnemeFragmente,
        ewigeMneme,
      },
      idleGenerators: {
        gedankenArchiv: archiv.value,
      },
      gather: {
        clickPowerLevel: Math.floor(clickPowerLevel),
      },
      hero: hero.value,
      story: story.value,
      settings: settings.value,
      meta: {
        lastActiveAt,
      },
    },
  };
}
