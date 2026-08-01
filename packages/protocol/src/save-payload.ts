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
  readonly particlesEnabled: boolean;
  readonly floatingTextEnabled: boolean;
  readonly audioEnabled: boolean;
  readonly autosaveMs: number;
};

export type QuestsDailySave = {
  readonly date: string;
  readonly gatherClicks: number;
  readonly expeditions: number;
  readonly craftedItems: number;
  readonly claimed: readonly string[];
  readonly lastClaimDate: string;
  readonly streak: number;
  readonly currentBoost: string | null;
  readonly boostUntil: number;
};

export type QuestsSave = {
  readonly mainIndex: number;
  readonly daily: QuestsDailySave;
};

export type AchievementProgressSave = {
  readonly progress: number;
  readonly achieved: boolean;
  readonly claimed: boolean;
};

export type AchievementsSave = {
  readonly progress: Record<string, AchievementProgressSave>;
};

export type ForgeSave = {
  readonly craftedCount: number;
};

export type CraftingSave = {
  readonly level: number;
  readonly exp: number;
  readonly expToNext: number;
  readonly unlockedRecipes: readonly string[];
};

export type LibrarySave = {
  readonly upgrades: {
    readonly gather_boost: number;
    readonly clan_boost: number;
    readonly forge_discount: number;
  };
};

export type TalentsSave = {
  readonly points: number;
  readonly allocatedNodeIds: readonly string[];
};

export type ChallengesSave = {
  readonly active: string | null;
  readonly completed: readonly string[];
  readonly pacifistUnlocked: boolean;
  readonly droughtBonus: boolean;
};

export type CodexSave = {
  readonly unlockedIds: readonly string[];
  readonly decryptedLoreIds: readonly string[];
};

export type StoryBranchSave = {
  readonly currentNode: string | null;
  readonly flags: Record<string, boolean | number | string>;
  readonly visited: readonly string[];
  readonly history: readonly string[];
  readonly endingReached: string | null;
};

export type RelicHuntSave = {
  readonly cooldownEnd: number;
};

export type AccountVaultSave = {
  readonly particles: string;
  readonly relics: string;
  readonly artifacts: string;
  readonly memoryDust: string;
  readonly items: readonly ItemSave[];
};

export type TutorialSave = {
  readonly step: number;
  readonly finished: boolean;
};

/** Phase-2+ save payload (resources / idle / gather / hero / story / settings / Phase-6 slices). */
export type Phase2SavePayload = {
  readonly resources: {
    readonly particles: string;
    readonly totalParticles: string;
    readonly mnemeFragmente: string;
    readonly totalMnemeFragmente: string;
    readonly ewigeMneme: string;
    readonly relics: string;
    readonly totalRelics: string;
    readonly artifacts: string;
    readonly memoryDust: string;
    readonly catalyst: string;
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
  readonly quests: QuestsSave;
  readonly achievements: AchievementsSave;
  readonly forge: ForgeSave;
  readonly crafting: CraftingSave;
  readonly library: LibrarySave;
  readonly talents: TalentsSave;
  readonly challenges: ChallengesSave;
  readonly codex: CodexSave;
  readonly storyBranch: StoryBranchSave;
  readonly relicHunt: RelicHuntSave;
  readonly accountVault: AccountVaultSave;
  readonly tutorial: TutorialSave;
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
  return {
    locale: "de",
    particlesEnabled: true,
    floatingTextEnabled: true,
    audioEnabled: true,
    autosaveMs: 15_000,
  };
}

export function createDefaultQuestsSave(): QuestsSave {
  return {
    mainIndex: 0,
    daily: {
      date: "",
      gatherClicks: 0,
      expeditions: 0,
      craftedItems: 0,
      claimed: [],
      lastClaimDate: "",
      streak: 0,
      currentBoost: null,
      boostUntil: 0,
    },
  };
}

export function createDefaultAchievementsSave(): AchievementsSave {
  return { progress: {} };
}

export function createDefaultForgeSave(): ForgeSave {
  return { craftedCount: 0 };
}

export function createDefaultCraftingSave(): CraftingSave {
  return {
    level: 1,
    exp: 0,
    expToNext: 100,
    unlockedRecipes: [],
  };
}

export function createDefaultLibrarySave(): LibrarySave {
  return {
    upgrades: {
      gather_boost: 0,
      clan_boost: 0,
      forge_discount: 0,
    },
  };
}

export function createDefaultTalentsSave(): TalentsSave {
  return { points: 0, allocatedNodeIds: [] };
}

export function createDefaultChallengesSave(): ChallengesSave {
  return {
    active: null,
    completed: [],
    pacifistUnlocked: false,
    droughtBonus: false,
  };
}

export function createDefaultCodexSave(): CodexSave {
  return { unlockedIds: [], decryptedLoreIds: [] };
}

export function createDefaultStoryBranchSave(): StoryBranchSave {
  return {
    currentNode: null,
    flags: {},
    visited: [],
    history: [],
    endingReached: null,
  };
}

export function createDefaultRelicHuntSave(): RelicHuntSave {
  return { cooldownEnd: 0 };
}

export function createDefaultAccountVaultSave(): AccountVaultSave {
  return {
    particles: "0",
    relics: "0",
    artifacts: "0",
    memoryDust: "0",
    items: [],
  };
}

export function createDefaultTutorialSave(): TutorialSave {
  return { step: 0, finished: false };
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

function validateOptionalDigitString(
  value: unknown,
  label: string,
): ValidationResult<string> {
  if (value === undefined) {
    return { ok: true, value: "0" };
  }
  if (!isDigitString(value)) {
    return { ok: false, error: `${label} must be an integer string` };
  }
  return { ok: true, value };
}

function validateStringArray(
  value: unknown,
  label: string,
): ValidationResult<string[]> {
  if (!Array.isArray(value)) {
    return { ok: false, error: `${label} must be an array` };
  }
  const items: string[] = [];
  for (const entry of value) {
    if (typeof entry !== "string") {
      return { ok: false, error: `${label} entry invalid` };
    }
    items.push(entry);
  }
  return { ok: true, value: items };
}

function validateStoryBranchFlagValue(
  value: unknown,
): value is boolean | number | string {
  return (
    typeof value === "boolean" ||
    typeof value === "string" ||
    (typeof value === "number" && Number.isFinite(value))
  );
}

function validateQuests(value: unknown): ValidationResult<QuestsSave> {
  if (value === undefined) {
    return { ok: true, value: createDefaultQuestsSave() };
  }
  if (!isRecord(value)) {
    return { ok: false, error: "quests must be an object" };
  }
  if (!isNonNegativeInt(value["mainIndex"])) {
    return { ok: false, error: "quests.mainIndex invalid" };
  }
  const daily = value["daily"];
  if (daily === undefined) {
    return {
      ok: true,
      value: {
        mainIndex: value["mainIndex"],
        daily: createDefaultQuestsSave().daily,
      },
    };
  }
  if (!isRecord(daily)) {
    return { ok: false, error: "quests.daily must be an object" };
  }
  if (typeof daily["date"] !== "string") {
    return { ok: false, error: "quests.daily.date invalid" };
  }
  if (!isNonNegativeInt(daily["gatherClicks"])) {
    return { ok: false, error: "quests.daily.gatherClicks invalid" };
  }
  if (!isNonNegativeInt(daily["expeditions"])) {
    return { ok: false, error: "quests.daily.expeditions invalid" };
  }
  if (!isNonNegativeInt(daily["craftedItems"])) {
    return { ok: false, error: "quests.daily.craftedItems invalid" };
  }
  const claimed = validateStringArray(daily["claimed"], "quests.daily.claimed");
  if (!claimed.ok) {
    return claimed;
  }
  if (typeof daily["lastClaimDate"] !== "string") {
    return { ok: false, error: "quests.daily.lastClaimDate invalid" };
  }
  if (!isNonNegativeInt(daily["streak"])) {
    return { ok: false, error: "quests.daily.streak invalid" };
  }
  const currentBoost = daily["currentBoost"];
  if (currentBoost !== null && typeof currentBoost !== "string") {
    return { ok: false, error: "quests.daily.currentBoost invalid" };
  }
  if (!isFiniteNumber(daily["boostUntil"]) || daily["boostUntil"] < 0) {
    return { ok: false, error: "quests.daily.boostUntil invalid" };
  }
  return {
    ok: true,
    value: {
      mainIndex: value["mainIndex"],
      daily: {
        date: daily["date"],
        gatherClicks: daily["gatherClicks"],
        expeditions: daily["expeditions"],
        craftedItems: daily["craftedItems"],
        claimed: claimed.value,
        lastClaimDate: daily["lastClaimDate"],
        streak: daily["streak"],
        currentBoost,
        boostUntil: daily["boostUntil"],
      },
    },
  };
}

function validateAchievements(
  value: unknown,
): ValidationResult<AchievementsSave> {
  if (value === undefined) {
    return { ok: true, value: createDefaultAchievementsSave() };
  }
  if (!isRecord(value)) {
    return { ok: false, error: "achievements must be an object" };
  }
  const progressRaw = value["progress"];
  if (progressRaw === undefined) {
    return { ok: true, value: createDefaultAchievementsSave() };
  }
  if (!isRecord(progressRaw)) {
    return { ok: false, error: "achievements.progress must be an object" };
  }
  const progress: Record<string, AchievementProgressSave> = {};
  for (const [key, entry] of Object.entries(progressRaw)) {
    if (!isRecord(entry)) {
      return { ok: false, error: `achievements.progress.${key} invalid` };
    }
    if (!isNonNegativeInt(entry["progress"])) {
      return {
        ok: false,
        error: `achievements.progress.${key}.progress invalid`,
      };
    }
    if (typeof entry["achieved"] !== "boolean") {
      return {
        ok: false,
        error: `achievements.progress.${key}.achieved invalid`,
      };
    }
    if (typeof entry["claimed"] !== "boolean") {
      return {
        ok: false,
        error: `achievements.progress.${key}.claimed invalid`,
      };
    }
    progress[key] = {
      progress: entry["progress"],
      achieved: entry["achieved"],
      claimed: entry["claimed"],
    };
  }
  return { ok: true, value: { progress } };
}

function validateForge(value: unknown): ValidationResult<ForgeSave> {
  if (value === undefined) {
    return { ok: true, value: createDefaultForgeSave() };
  }
  if (!isRecord(value)) {
    return { ok: false, error: "forge must be an object" };
  }
  if (!isNonNegativeInt(value["craftedCount"])) {
    return { ok: false, error: "forge.craftedCount invalid" };
  }
  return { ok: true, value: { craftedCount: value["craftedCount"] } };
}

function validateCrafting(value: unknown): ValidationResult<CraftingSave> {
  if (value === undefined) {
    return { ok: true, value: createDefaultCraftingSave() };
  }
  if (!isRecord(value)) {
    return { ok: false, error: "crafting must be an object" };
  }
  if (!isNonNegativeInt(value["level"]) || value["level"] < 1) {
    return { ok: false, error: "crafting.level invalid" };
  }
  if (!isNonNegativeInt(value["exp"])) {
    return { ok: false, error: "crafting.exp invalid" };
  }
  if (!isFiniteNumber(value["expToNext"]) || value["expToNext"] < 1) {
    return { ok: false, error: "crafting.expToNext invalid" };
  }
  const unlockedRecipes = validateStringArray(
    value["unlockedRecipes"],
    "crafting.unlockedRecipes",
  );
  if (!unlockedRecipes.ok) {
    return unlockedRecipes;
  }
  return {
    ok: true,
    value: {
      level: value["level"],
      exp: value["exp"],
      expToNext: value["expToNext"],
      unlockedRecipes: unlockedRecipes.value,
    },
  };
}

function validateLibrary(value: unknown): ValidationResult<LibrarySave> {
  if (value === undefined) {
    return { ok: true, value: createDefaultLibrarySave() };
  }
  if (!isRecord(value)) {
    return { ok: false, error: "library must be an object" };
  }
  const upgrades = value["upgrades"];
  if (upgrades === undefined) {
    return { ok: true, value: createDefaultLibrarySave() };
  }
  if (!isRecord(upgrades)) {
    return { ok: false, error: "library.upgrades must be an object" };
  }
  if (!isNonNegativeInt(upgrades["gather_boost"])) {
    return { ok: false, error: "library.upgrades.gather_boost invalid" };
  }
  if (!isNonNegativeInt(upgrades["clan_boost"])) {
    return { ok: false, error: "library.upgrades.clan_boost invalid" };
  }
  if (!isNonNegativeInt(upgrades["forge_discount"])) {
    return { ok: false, error: "library.upgrades.forge_discount invalid" };
  }
  return {
    ok: true,
    value: {
      upgrades: {
        gather_boost: upgrades["gather_boost"],
        clan_boost: upgrades["clan_boost"],
        forge_discount: upgrades["forge_discount"],
      },
    },
  };
}

function validateTalents(value: unknown): ValidationResult<TalentsSave> {
  if (value === undefined) {
    return { ok: true, value: createDefaultTalentsSave() };
  }
  if (!isRecord(value)) {
    return { ok: false, error: "talents must be an object" };
  }
  if (!isNonNegativeInt(value["points"])) {
    return { ok: false, error: "talents.points invalid" };
  }
  const allocatedNodeIds = validateStringArray(
    value["allocatedNodeIds"],
    "talents.allocatedNodeIds",
  );
  if (!allocatedNodeIds.ok) {
    return allocatedNodeIds;
  }
  return {
    ok: true,
    value: {
      points: value["points"],
      allocatedNodeIds: allocatedNodeIds.value,
    },
  };
}

function validateChallenges(
  value: unknown,
): ValidationResult<ChallengesSave> {
  if (value === undefined) {
    return { ok: true, value: createDefaultChallengesSave() };
  }
  if (!isRecord(value)) {
    return { ok: false, error: "challenges must be an object" };
  }
  const active = value["active"];
  if (active !== null && typeof active !== "string") {
    return { ok: false, error: "challenges.active invalid" };
  }
  const completed = validateStringArray(
    value["completed"],
    "challenges.completed",
  );
  if (!completed.ok) {
    return completed;
  }
  if (typeof value["pacifistUnlocked"] !== "boolean") {
    return { ok: false, error: "challenges.pacifistUnlocked invalid" };
  }
  if (typeof value["droughtBonus"] !== "boolean") {
    return { ok: false, error: "challenges.droughtBonus invalid" };
  }
  return {
    ok: true,
    value: {
      active,
      completed: completed.value,
      pacifistUnlocked: value["pacifistUnlocked"],
      droughtBonus: value["droughtBonus"],
    },
  };
}

function validateCodex(value: unknown): ValidationResult<CodexSave> {
  if (value === undefined) {
    return { ok: true, value: createDefaultCodexSave() };
  }
  if (!isRecord(value)) {
    return { ok: false, error: "codex must be an object" };
  }
  const unlockedIds = validateStringArray(
    value["unlockedIds"],
    "codex.unlockedIds",
  );
  if (!unlockedIds.ok) {
    return unlockedIds;
  }
  const decryptedLoreIds = validateStringArray(
    value["decryptedLoreIds"],
    "codex.decryptedLoreIds",
  );
  if (!decryptedLoreIds.ok) {
    return decryptedLoreIds;
  }
  return {
    ok: true,
    value: {
      unlockedIds: unlockedIds.value,
      decryptedLoreIds: decryptedLoreIds.value,
    },
  };
}

function validateStoryBranch(
  value: unknown,
): ValidationResult<StoryBranchSave> {
  if (value === undefined) {
    return { ok: true, value: createDefaultStoryBranchSave() };
  }
  if (!isRecord(value)) {
    return { ok: false, error: "storyBranch must be an object" };
  }
  const currentNode = value["currentNode"];
  if (currentNode !== null && typeof currentNode !== "string") {
    return { ok: false, error: "storyBranch.currentNode invalid" };
  }
  const flagsRaw = value["flags"];
  if (flagsRaw === undefined) {
    return {
      ok: true,
      value: {
        ...createDefaultStoryBranchSave(),
        currentNode,
      },
    };
  }
  if (!isRecord(flagsRaw)) {
    return { ok: false, error: "storyBranch.flags must be an object" };
  }
  const flags: Record<string, boolean | number | string> = {};
  for (const [key, flagValue] of Object.entries(flagsRaw)) {
    if (!validateStoryBranchFlagValue(flagValue)) {
      return { ok: false, error: `storyBranch.flags.${key} invalid` };
    }
    flags[key] = flagValue;
  }
  const visited = validateStringArray(value["visited"], "storyBranch.visited");
  if (!visited.ok) {
    return visited;
  }
  const history = validateStringArray(value["history"], "storyBranch.history");
  if (!history.ok) {
    return history;
  }
  const endingReached = value["endingReached"];
  if (endingReached !== null && typeof endingReached !== "string") {
    return { ok: false, error: "storyBranch.endingReached invalid" };
  }
  return {
    ok: true,
    value: {
      currentNode,
      flags,
      visited: visited.value,
      history: history.value,
      endingReached,
    },
  };
}

function validateRelicHunt(value: unknown): ValidationResult<RelicHuntSave> {
  if (value === undefined) {
    return { ok: true, value: createDefaultRelicHuntSave() };
  }
  if (!isRecord(value)) {
    return { ok: false, error: "relicHunt must be an object" };
  }
  if (!isFiniteNumber(value["cooldownEnd"]) || value["cooldownEnd"] < 0) {
    return { ok: false, error: "relicHunt.cooldownEnd invalid" };
  }
  return { ok: true, value: { cooldownEnd: value["cooldownEnd"] } };
}

function validateAccountVault(
  value: unknown,
): ValidationResult<AccountVaultSave> {
  if (value === undefined) {
    return { ok: true, value: createDefaultAccountVaultSave() };
  }
  if (!isRecord(value)) {
    return { ok: false, error: "accountVault must be an object" };
  }
  const particles = validateOptionalDigitString(
    value["particles"],
    "accountVault.particles",
  );
  if (!particles.ok) {
    return particles;
  }
  const relics = validateOptionalDigitString(
    value["relics"],
    "accountVault.relics",
  );
  if (!relics.ok) {
    return relics;
  }
  const artifacts = validateOptionalDigitString(
    value["artifacts"],
    "accountVault.artifacts",
  );
  if (!artifacts.ok) {
    return artifacts;
  }
  const memoryDust = validateOptionalDigitString(
    value["memoryDust"],
    "accountVault.memoryDust",
  );
  if (!memoryDust.ok) {
    return memoryDust;
  }
  const itemsRaw = value["items"];
  if (itemsRaw === undefined) {
    return {
      ok: true,
      value: {
        particles: particles.value,
        relics: relics.value,
        artifacts: artifacts.value,
        memoryDust: memoryDust.value,
        items: [],
      },
    };
  }
  if (!Array.isArray(itemsRaw)) {
    return { ok: false, error: "accountVault.items must be an array" };
  }
  const items: ItemSave[] = [];
  for (let i = 0; i < itemsRaw.length; i += 1) {
    const item = validateItemSave(itemsRaw[i], `accountVault.items[${String(i)}]`);
    if (!item.ok) {
      return item;
    }
    items.push(item.value);
  }
  return {
    ok: true,
    value: {
      particles: particles.value,
      relics: relics.value,
      artifacts: artifacts.value,
      memoryDust: memoryDust.value,
      items,
    },
  };
}

function validateTutorial(value: unknown): ValidationResult<TutorialSave> {
  if (value === undefined) {
    return { ok: true, value: createDefaultTutorialSave() };
  }
  if (!isRecord(value)) {
    return { ok: false, error: "tutorial must be an object" };
  }
  if (!isNonNegativeInt(value["step"])) {
    return { ok: false, error: "tutorial.step invalid" };
  }
  if (typeof value["finished"] !== "boolean") {
    return { ok: false, error: "tutorial.finished invalid" };
  }
  return {
    ok: true,
    value: { step: value["step"], finished: value["finished"] },
  };
}

function validateSettings(value: unknown): ValidationResult<SettingsSave> {
  if (value === undefined) {
    return { ok: true, value: createDefaultSettingsSave() };
  }
  if (!isRecord(value)) {
    return { ok: false, error: "settings must be an object" };
  }
  const defaults = createDefaultSettingsSave();
  const locale = value["locale"];
  if (locale !== undefined && locale !== "de" && locale !== "en") {
    return { ok: false, error: "settings.locale invalid" };
  }
  const particlesEnabled = value["particlesEnabled"];
  if (
    particlesEnabled !== undefined &&
    typeof particlesEnabled !== "boolean"
  ) {
    return { ok: false, error: "settings.particlesEnabled invalid" };
  }
  const floatingTextEnabled = value["floatingTextEnabled"];
  if (
    floatingTextEnabled !== undefined &&
    typeof floatingTextEnabled !== "boolean"
  ) {
    return { ok: false, error: "settings.floatingTextEnabled invalid" };
  }
  const audioEnabled = value["audioEnabled"];
  if (audioEnabled !== undefined && typeof audioEnabled !== "boolean") {
    return { ok: false, error: "settings.audioEnabled invalid" };
  }
  const autosaveMs = value["autosaveMs"];
  if (
    autosaveMs !== undefined &&
    (!isFiniteNumber(autosaveMs) || autosaveMs < 1)
  ) {
    return { ok: false, error: "settings.autosaveMs invalid" };
  }
  return {
    ok: true,
    value: {
      locale: locale ?? defaults.locale,
      particlesEnabled: particlesEnabled ?? defaults.particlesEnabled,
      floatingTextEnabled: floatingTextEnabled ?? defaults.floatingTextEnabled,
      audioEnabled: audioEnabled ?? defaults.audioEnabled,
      autosaveMs: autosaveMs ?? defaults.autosaveMs,
    },
  };
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
  const relics = validateOptionalDigitString(
    resources["relics"],
    "resources.relics",
  );
  if (!relics.ok) {
    return relics;
  }
  const totalRelics = validateOptionalDigitString(
    resources["totalRelics"],
    "resources.totalRelics",
  );
  if (!totalRelics.ok) {
    return totalRelics;
  }
  const artifacts = validateOptionalDigitString(
    resources["artifacts"],
    "resources.artifacts",
  );
  if (!artifacts.ok) {
    return artifacts;
  }
  const memoryDust = validateOptionalDigitString(
    resources["memoryDust"],
    "resources.memoryDust",
  );
  if (!memoryDust.ok) {
    return memoryDust;
  }
  const catalyst = validateOptionalDigitString(
    resources["catalyst"],
    "resources.catalyst",
  );
  if (!catalyst.ok) {
    return catalyst;
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
  const quests = validateQuests(value["quests"]);
  if (!quests.ok) {
    return quests;
  }
  const achievements = validateAchievements(value["achievements"]);
  if (!achievements.ok) {
    return achievements;
  }
  const forge = validateForge(value["forge"]);
  if (!forge.ok) {
    return forge;
  }
  const crafting = validateCrafting(value["crafting"]);
  if (!crafting.ok) {
    return crafting;
  }
  const library = validateLibrary(value["library"]);
  if (!library.ok) {
    return library;
  }
  const talents = validateTalents(value["talents"]);
  if (!talents.ok) {
    return talents;
  }
  const challenges = validateChallenges(value["challenges"]);
  if (!challenges.ok) {
    return challenges;
  }
  const codex = validateCodex(value["codex"]);
  if (!codex.ok) {
    return codex;
  }
  const storyBranch = validateStoryBranch(value["storyBranch"]);
  if (!storyBranch.ok) {
    return storyBranch;
  }
  const relicHunt = validateRelicHunt(value["relicHunt"]);
  if (!relicHunt.ok) {
    return relicHunt;
  }
  const accountVault = validateAccountVault(value["accountVault"]);
  if (!accountVault.ok) {
    return accountVault;
  }
  const tutorial = validateTutorial(value["tutorial"]);
  if (!tutorial.ok) {
    return tutorial;
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
        relics: relics.value,
        totalRelics: totalRelics.value,
        artifacts: artifacts.value,
        memoryDust: memoryDust.value,
        catalyst: catalyst.value,
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
      quests: quests.value,
      achievements: achievements.value,
      forge: forge.value,
      crafting: crafting.value,
      library: library.value,
      talents: talents.value,
      challenges: challenges.value,
      codex: codex.value,
      storyBranch: storyBranch.value,
      relicHunt: relicHunt.value,
      accountVault: accountVault.value,
      tutorial: tutorial.value,
      meta: {
        lastActiveAt,
      },
    },
  };
}
