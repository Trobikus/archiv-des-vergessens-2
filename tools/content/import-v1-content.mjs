import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "../..");
const v1 = "F:/Max_Projekte/archiv-des-vergessens-1";
const outDir = path.join(root, "packages/content/src");

const { ITEM_TEMPLATES } = await import(
  pathToFileURL(path.join(v1, "js/data/items.js")).href
);
const bossesMod = await import(
  pathToFileURL(path.join(v1, "js/data/bosses.js")).href
);
const introMod = await import(
  pathToFileURL(path.join(v1, "js/data/story_fights_intro.js")).href
);
const questsMod = await import(
  pathToFileURL(path.join(v1, "js/data/quests.js")).href
);
const challengesMod = await import(
  pathToFileURL(path.join(v1, "js/data/challenges.js")).href
);
const recipesMod = await import(
  pathToFileURL(path.join(v1, "js/data/recipes.js")).href
);
const craftingRecipesMod = await import(
  pathToFileURL(path.join(v1, "js/data/crafting_recipes.js")).href
);
const gemsEnchantsMod = await import(
  pathToFileURL(path.join(v1, "js/data/gems_enchants.js")).href
);
const talentNodesMod = await import(
  pathToFileURL(path.join(v1, "js/data/talent-nodes.js")).href
);
const storyBranchesMod = await import(
  pathToFileURL(path.join(v1, "js/data/story_branches.js")).href
);
const dialogsMod = await import(
  pathToFileURL(path.join(v1, "js/data/dialogs.js")).href
);
const codexMod = await import(
  pathToFileURL(path.join(v1, "js/data/codex_entries.js")).href
);
const loreNodesMod = await import(
  pathToFileURL(path.join(v1, "js/data/lore-nodes.js")).href
);

function extractI18n(filePath, phase6Keys = {}) {
  let src = fs.readFileSync(filePath, "utf8");
  src = src.replace(/import \{ APP_VERSION \} from '[^']+';\r?\n\r?\n/, "");
  src = src.replace(
    /`Version \$\{APP_VERSION\} – AAA Overhaul`/g,
    "'Version 2.0.0 – AAA Overhaul'",
  );
  src = src.replace(/\};\s*$/, "");
  src = src.trimEnd();
  if (!src.endsWith(",")) {
    src += ",";
  }
  const phase6Lines = Object.entries(phase6Keys).map(
    ([key, value]) => `    ${JSON.stringify(key)}: ${JSON.stringify(value)},`,
  );
  if (phase6Lines.length > 0) {
    src += "\n\n    // ===== PHASE 6 =====\n";
    src += phase6Lines.join("\n");
    src += "\n";
  }
  src += "} as const satisfies Record<string, string>;\n";
  return src.trim() + "\n";
}

function extractMethodReturnArray(filePath, methodName) {
  const src = fs.readFileSync(filePath, "utf8");
  const marker = `${methodName}()`;
  const start = src.indexOf(marker);
  if (start < 0) {
    throw new Error(`Could not find ${methodName} in ${filePath}`);
  }
  const returnIdx = src.indexOf("return", start);
  const arrayStart = src.indexOf("[", returnIdx);
  if (arrayStart < 0) {
    throw new Error(`Could not find return array in ${methodName} (${filePath})`);
  }
  let depth = 0;
  for (let i = arrayStart; i < src.length; i += 1) {
    const ch = src[i];
    if (ch === "[") depth += 1;
    if (ch === "]") {
      depth -= 1;
      if (depth === 0) {
        return new Function(`return ${src.slice(arrayStart, i + 1)}`)();
      }
    }
  }
  throw new Error(`Unterminated array in ${methodName} (${filePath})`);
}

const PHASE6_I18N = {
  de: {
    "hub.library": "Bibliothek",
    "hub.libraryDesc": "Forschungen",
    "hub.challenges": "Anomalien",
    "hub.challengesDesc": "Extreme Herausforderungen",
    "hub.achievements": "Erfolge",
    "hub.achievementsDesc": "Meilensteine & Titel",
    "hub.daily": "Tägliche Missionen",
    "hub.dailyDesc": "Tagesziele",
    "hub.tutorial": "Tutorial",
    "hub.tutorialDesc": "Einführung",
    "hub.vault": "Account-Lager",
    "hub.vaultDesc": "Gemeinsamer Tresor",
    "hub.analytics": "Kampf-Analyse",
    "hub.analyticsDesc": "DPS & Statistiken",
    "common.claim": "Abholen",
    "common.start": "Starten",
    "common.done": "Erledigt",
    "common.locked": "Gesperrt",
    "common.next": "Weiter",
    "common.finish": "Abschließen",
    "quests.main": "Hauptmissionen",
    "quests.daily": "Tägliche Missionen",
    "quests.noActive": "Keine aktive Mission",
    "quests.ready": "Mission bereit – Klicken zum Abholen",
    "quests.emptyDaily": "Keine täglichen Missionen verfügbar.",
    "achievements.title": "Erfolge & Meilensteine",
    "achievements.subtitle":
      "Erreiche Ziele, um seltene Titel und Belohnungen freizuschalten.",
    "achievements.empty": "Keine Erfolge verfügbar.",
    "achievements.claimed": "Abgeholt",
    "challenges.title": "Anomalien",
    "challenges.startHint": "Nur direkt nach Prestige",
    "tutorial.skip": "Tutorial überspringen",
    "library.title": "Die Archiv-Bibliothek",
    "vault.title": "Account-Lager",
    "vault.subtitle": "Tresor aller Charakter-Slots",
    "analytics.title": "Kampf-Analyse & DPS-Meter",
    "analytics.subtitle": "Echtzeit-Statistiken der aktuellen Begegnung",
    "analytics.reset": "Statistiken Zurücksetzen",
  },
  en: {
    "hub.library": "Library",
    "hub.libraryDesc": "Research",
    "hub.challenges": "Anomalies",
    "hub.challengesDesc": "Extreme Challenges",
    "hub.achievements": "Achievements",
    "hub.achievementsDesc": "Milestones & Titles",
    "hub.daily": "Daily Quests",
    "hub.dailyDesc": "Daily goals",
    "hub.tutorial": "Tutorial",
    "hub.tutorialDesc": "Introduction",
    "hub.vault": "Account Vault",
    "hub.vaultDesc": "Shared Vault",
    "hub.analytics": "Combat Analytics",
    "hub.analyticsDesc": "DPS & Statistics",
    "common.claim": "Claim",
    "common.start": "Start",
    "common.done": "Done",
    "common.locked": "Locked",
    "common.next": "Next",
    "common.finish": "Finish",
    "quests.main": "Main Quests",
    "quests.daily": "Daily Quests",
    "quests.noActive": "No active quest",
    "quests.ready": "Quest ready – Click to claim",
    "quests.emptyDaily": "No daily quests available.",
    "achievements.title": "Achievements & Milestones",
    "achievements.subtitle":
      "Reach goals to unlock rare titles and rewards.",
    "achievements.empty": "No achievements available.",
    "achievements.claimed": "Claimed",
    "challenges.title": "Anomalies",
    "challenges.startHint": "Only right after Prestige",
    "tutorial.skip": "Skip tutorial",
    "library.title": "The Archive Library",
    "vault.title": "Account Vault",
    "vault.subtitle": "Vault for all character slots",
    "analytics.title": "Combat Analytics & DPS Meter",
    "analytics.subtitle": "Real-time statistics for current encounter",
    "analytics.reset": "Reset Stats",
  },
};

const achievementDefs = extractMethodReturnArray(
  path.join(v1, "js/core/services/achievement-service.js"),
  "_buildBaseAchievements",
);
const tutorialSteps = extractMethodReturnArray(
  path.join(v1, "js/core/services/tutorial-service.js"),
  "getSteps",
);

const CHAPTER_UNIQUE_TEMPLATES = {
  "Bruchstück der Gläsernen Ära": {
    slot: "amulet",
    rarity: "legendary",
    stats: { attack: 8, stamina: 6, agility: 4 },
  },
  "Sternenlicht-Klinge des Hüters": {
    slot: "weapon",
    rarity: "legendary",
    stats: { attack: 28, agility: 10 },
  },
  "Seelenfänger-Amulett": {
    slot: "amulet",
    rarity: "legendary",
    stats: { attack: 14, defense: 8 },
  },
  "Ring der unendlichen Gezeiten": {
    slot: "ring",
    rarity: "legendary",
    stats: { agility: 12, stamina: 8, defense: 6 },
  },
  "Schattenstahl-Klinge": {
    slot: "weapon",
    rarity: "legendary",
    stats: { attack: 32, agility: 12 },
  },
  "Rostplatte der Techno-Endzeit": {
    slot: "armor",
    rarity: "legendary",
    stats: { defense: 30, stamina: 14 },
  },
  "Zerrissenes Foliantenblatt": {
    slot: "amulet",
    rarity: "legendary",
    stats: { attack: 10, agility: 10, stamina: 8 },
  },
  "Dunkler Reif des Nichts": {
    slot: "ring",
    rarity: "legendary",
    stats: { attack: 12, agility: 14 },
  },
  "Inschrift-Schwert des Ur-Zirkels": {
    slot: "weapon",
    rarity: "legendary",
    stats: { attack: 38, stamina: 8 },
  },
  "Gewebte Chronisten-Robe": {
    slot: "armor",
    rarity: "legendary",
    stats: { defense: 26, stamina: 12, agility: 8 },
  },
  "Lichtbringer-Amulett": {
    slot: "amulet",
    rarity: "legendary",
    stats: { attack: 18, defense: 10, stamina: 8 },
  },
  "Reif der Ewigen Reue": {
    slot: "ring",
    rarity: "legendary",
    stats: { defense: 10, stamina: 12, attack: 8 },
  },
  "Urahnen-Klinge der Ersten": {
    slot: "weapon",
    rarity: "legendary",
    stats: { attack: 42, agility: 14 },
  },
  "Sterne-Garnierte Ur-Plattenrüstung": {
    slot: "armor",
    rarity: "legendary",
    stats: { defense: 36, stamina: 16, attack: 6 },
  },
  "Amulett der Stillstehenden Zeit": {
    slot: "amulet",
    rarity: "legendary",
    stats: { defense: 12, stamina: 14, agility: 8 },
  },
  "Band der ewigen Stille": {
    slot: "ring",
    rarity: "legendary",
    stats: { agility: 16, stamina: 10 },
  },
  "Entwurfs-Klinge der Realität": {
    slot: "weapon",
    rarity: "legendary",
    stats: { attack: 48, agility: 16, defense: 4 },
  },
  "Schicksalsweber-Gewand": {
    slot: "armor",
    rarity: "legendary",
    stats: { defense: 34, stamina: 14, agility: 12 },
  },
  "Heilige Klinge der Götterdämmerung": {
    slot: "weapon",
    rarity: "legendary",
    stats: { attack: 55, agility: 18, defense: 6 },
  },
  "Urmacht-Brustplatte": {
    slot: "armor",
    rarity: "legendary",
    stats: { defense: 42, stamina: 18, attack: 8 },
  },
  "Krone des Kollektiven Bewusstseins": {
    slot: "helmet",
    rarity: "legendary",
    stats: { defense: 22, stamina: 16, attack: 10, agility: 10 },
  },
};

const mergedItems = { ...ITEM_TEMPLATES, ...CHAPTER_UNIQUE_TEMPLATES };

function serializeValue(value, indent = 0) {
  const pad = "  ".repeat(indent);
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "[]";
    }
    const items = value.map(
      (entry) => `${pad}  ${serializeValue(entry, indent + 1)}`,
    );
    return `[\n${items.join(",\n")}\n${pad}]`;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value);
    if (entries.length === 0) {
      return "{}";
    }
    const lines = entries.map(([key, entry]) => {
      const renderedKey = /^[A-Za-z_][A-Za-z0-9_]*$/.test(key)
        ? key
        : JSON.stringify(key);
      return `${pad}  ${renderedKey}: ${serializeValue(entry, indent + 1)}`;
    });
    return `{\n${lines.join(",\n")}\n${pad}}`;
  }
  return JSON.stringify(value);
}

const typesTs = `export type Locale = "de" | "en";

export type StatKey = "attack" | "defense" | "agility" | "stamina";

export type ItemSlot =
  | "weapon"
  | "shield"
  | "helmet"
  | "shoulders"
  | "armor"
  | "gloves"
  | "belt"
  | "boots"
  | "amulet"
  | "ring";

export type ItemRarity =
  | "common"
  | "uncommon"
  | "rare"
  | "epic"
  | "legendary";

export type ItemStats = Partial<Record<StatKey, number>>;

export type ItemTemplate = {
  readonly slot: ItemSlot;
  readonly rarity: ItemRarity;
  readonly stats: ItemStats;
};

export type BossReward = {
  readonly exp: number;
  readonly items: readonly string[];
};

export type StoryBoss = {
  readonly id: number;
  readonly name: string;
  readonly chapter: number;
  readonly hp: number;
  readonly attack: number;
  readonly defense: number;
  readonly reward: BossReward;
};

export type StoryFightsIntroFrame = {
  readonly id: string;
  readonly src: string;
  readonly durationMs: number;
  readonly linesDe: readonly string[];
  readonly linesEn: readonly string[];
};

export type HeroClassId =
  | "light_warrior"
  | "archmage"
  | "shadow_runner"
  | "archive_keeper";

export type HeroClassOption = {
  readonly id: HeroClassId;
  readonly titleDe: string;
  readonly titleEn: string;
  readonly avatar: string;
};

export type QuestReward = Partial<
  Record<
    "particles" | "relics" | "artifacts" | "memoryDust" | "catalyst",
    number
  >
>;

export type MainQuestDefinition = {
  readonly id: string;
  readonly text: string;
  readonly text_en: string;
  readonly target: number;
  readonly rewardText: string;
  readonly rewardText_en: string;
  readonly reward: QuestReward;
};

export type DailyQuestDefinition = MainQuestDefinition & {
  readonly key: string;
};

export type AchievementReward = QuestReward & {
  readonly title?: string;
};

export type AchievementDefinition = {
  readonly id: string;
  readonly label: string;
  readonly target: number;
  readonly progress: number;
  readonly achieved: boolean;
  readonly claimed: boolean;
  readonly reward: AchievementReward;
};

export type ChallengeDefinition = {
  readonly id: string;
  readonly name: string;
  readonly desc: string;
  readonly rewardDesc: string;
  readonly targetChapter: number;
};

export type ForgeRecipeCost = Partial<
  Record<"particles" | "relics" | "artifacts", number>
>;

export type ForgeRecipe = {
  readonly id: string;
  readonly name: string;
  readonly slot: ItemSlot | "random";
  readonly desc: string;
  readonly cost: ForgeRecipeCost;
  readonly unlockLevel?: number;
};

export type MasterRecipeCost = Partial<
  Record<
    "particles" | "relics" | "artifacts" | "catalyst" | "memoryDust" | "essence",
    number
  >
>;

export type MasterRecipe = {
  readonly id: string;
  readonly name: string;
  readonly desc: string;
  readonly cost: MasterRecipeCost;
  readonly resultName: string;
  readonly resultSlot: ItemSlot | "none";
  readonly resultRarity: ItemRarity;
  readonly baseStats: ItemStats;
  readonly baseQuality: number;
  readonly difficulty: number;
  readonly unlocks?: readonly string[];
  readonly unlockBoss?: number;
  readonly isResourceRecipe?: boolean;
  readonly resultResource?: string;
  readonly resourceResult?: Partial<
    Record<"particles" | "relics" | "artifacts" | "catalyst" | "memoryDust" | "essence", number>
  >;
};

export type GemDefinition = {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly color: string;
  readonly icon: string;
  readonly stats: Record<string, number>;
  readonly description: string;
  readonly costMneme: number;
};

export type EnchantmentDefinition = {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  readonly enchantName: string;
  readonly stats: Record<string, number>;
  readonly description: string;
  readonly costMneme: number;
};

export type RuneDefinition = {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly color: string;
  readonly icon: string;
  readonly stats: Record<string, number>;
  readonly description: string;
  readonly costMneme: number;
};

export type TalentNodeType = "start" | "small" | "notable" | "keystone";

export type TalentNode = {
  readonly id: string;
  readonly name: string;
  readonly type: TalentNodeType;
  readonly x: number;
  readonly y: number;
  readonly cost: number;
  readonly connections: readonly string[];
  readonly stats: Record<string, number>;
  readonly description: string;
  readonly icon: string;
};

export type StoryBranchOption = {
  readonly id: string;
  readonly text: string;
  readonly next: string;
  readonly flags?: Record<string, number | boolean>;
  readonly condition?: Record<string, unknown>;
  readonly requireFlags?: readonly string[];
};

export type StoryBranchNode = {
  readonly id: string;
  readonly title: string;
  readonly text: string;
  readonly options: readonly StoryBranchOption[];
  readonly flags?: Record<string, number | boolean>;
  readonly bossRequired?: number;
  readonly isEnding?: boolean;
};

export type DialogOption = {
  readonly text: string;
  readonly text_en?: string;
  readonly next: string;
  readonly action?: string;
};

export type DialogDefinition = {
  readonly id: string;
  readonly text: string;
  readonly text_en?: string;
  readonly cinematic?: string;
  readonly options: readonly DialogOption[];
  readonly isEnding?: boolean;
};

export type NpcDefinition = {
  readonly id: string;
  readonly name: string;
  readonly name_en?: string;
  readonly title: string;
  readonly title_en?: string;
  readonly portrait: string;
  readonly location: string;
  readonly isCinematic?: boolean;
  readonly cinematic?: string;
  readonly dialogs: readonly DialogDefinition[];
  readonly defaultDialog: string;
};

export type CodexStats = {
  readonly hp?: number;
  readonly attack?: number;
  readonly defense?: number;
};

export type CodexEntry = {
  readonly id: string;
  readonly category: string;
  readonly title: string;
  readonly icon: string;
  readonly unlocked: boolean;
  readonly description: string;
  readonly lore?: string;
  readonly stats?: CodexStats;
};

export type LoreChoice = {
  readonly id: string;
  readonly title: string;
  readonly text: string;
  readonly passiveDescription: string;
  readonly effects: Record<string, number>;
};

export type LoreNode = {
  readonly id: string;
  readonly title: string;
  readonly requiredBoss: number;
  readonly cost: number;
  readonly description: string;
  readonly choices: readonly LoreChoice[];
};

export type TutorialStepAction =
  | "next"
  | "click_target"
  | "wait_event"
  | "finish";

export type TutorialStep = {
  readonly title?: string;
  readonly text: string;
  readonly target: string | null;
  readonly action: TutorialStepAction;
  readonly dialogPosition?: string;
};
`;

const itemsTs = `import type { ItemTemplate } from "./types";

/** Item templates from v1 \`js/data/items.js\`, plus chapter unique rewards (v1 gap fix). */
export const ITEM_TEMPLATES = ${serializeValue(mergedItems)} as const satisfies Record<string, ItemTemplate>;

export type ItemTemplateName = keyof typeof ITEM_TEMPLATES;

export function getItemTemplate(name: string): ItemTemplate | undefined {
  if (Object.prototype.hasOwnProperty.call(ITEM_TEMPLATES, name)) {
    return ITEM_TEMPLATES[name as ItemTemplateName];
  }
  return undefined;
}
`;

const bossesTs = `import type { StoryBoss } from "./types";

/** Mirrors \`CONFIG.STORY\` in @adv/sim (word-identical to v1). */
const STORY_LAYOUT = {
  MAX_CHAPTERS: 10,
  FIGHTS_PER_CHAPTER: 10,
} as const;

export const BOSS_NAMES = ${serializeValue(bossesMod.BOSS_NAMES)} as const;

export const CHAPTER_BOSSES = ${serializeValue(bossesMod.CHAPTER_BOSSES)} as const;

export function generateStoryBosses(): readonly StoryBoss[] {
  const bosses: StoryBoss[] = [];
  let globalId = 1;
  const maxChapters = STORY_LAYOUT.MAX_CHAPTERS;
  const fightsPerChapter = STORY_LAYOUT.FIGHTS_PER_CHAPTER;

  for (let chap = 1; chap <= maxChapters; chap += 1) {
    const baseHp = 40 * Math.pow(1.6, chap - 1);
    const baseAtk = 6 * Math.pow(1.4, chap - 1);
    const baseDef = 2 * Math.pow(1.4, chap - 1);

    for (let fight = 1; fight <= fightsPerChapter; fight += 1) {
      const isMidBoss = fight === 5;
      const isEndBoss = fight === 10;
      const roman = (["I", "II", "III", "IV"] as const)[fight % 4] ?? "I";
      const namePool =
        BOSS_NAMES[(chap + fight) % BOSS_NAMES.length] ?? BOSS_NAMES[0];
      let name = \`\${namePool} \${roman}\`;
      let items: readonly string[] = [];

      if (isMidBoss) {
        const chapterBoss = CHAPTER_BOSSES[(chap - 1) * 2];
        if (chapterBoss) {
          name = chapterBoss.name;
          items = chapterBoss.items;
        }
      } else if (isEndBoss) {
        const chapterBoss = CHAPTER_BOSSES[(chap - 1) * 2 + 1];
        if (chapterBoss) {
          name = chapterBoss.name;
          items = chapterBoss.items;
        }
      }

      const multiplier = 1 + fight * 0.1;
      const chapterExpScaling = Math.pow(1.25, chap - 1);
      bosses.push({
        id: globalId,
        name,
        chapter: chap,
        hp: Math.floor(
          baseHp * multiplier * (isEndBoss ? 2 : isMidBoss ? 1.5 : 1),
        ),
        attack: Math.floor(
          baseAtk * multiplier * (isEndBoss ? 1.5 : isMidBoss ? 1.2 : 1),
        ),
        defense: Math.floor(
          baseDef * multiplier * (isEndBoss ? 1.5 : isMidBoss ? 1.2 : 1),
        ),
        reward: {
          exp: Math.floor(
            20 * chap * chapterExpScaling * multiplier * (isEndBoss ? 3 : 1),
          ),
          items,
        },
      });
      globalId += 1;
    }
  }

  return bosses;
}

export const STORY_BOSSES = generateStoryBosses();
`;

const introTs = `import type { StoryFightsIntroFrame } from "./types";

export const STORY_FIGHTS_INTRO_FRAMES = ${serializeValue(
  introMod.STORY_FIGHTS_INTRO_FRAMES,
)} as const satisfies readonly StoryFightsIntroFrame[];

export const STORY_FIGHTS_INTRO_CROSSFADE_MS = ${
  introMod.STORY_FIGHTS_INTRO_CROSSFADE_MS
} as const;
`;

const classesTs = `import type { HeroClassOption } from "./types";

export const HERO_CLASSES = [
  {
    id: "light_warrior",
    titleDe: "Krieger des Lichts",
    titleEn: "Warrior of Light",
    avatar: "light_warrior",
  },
  {
    id: "archmage",
    titleDe: "Erzmagier",
    titleEn: "Archmage",
    avatar: "archmage",
  },
  {
    id: "shadow_runner",
    titleDe: "Schattenläufer",
    titleEn: "Shadow Runner",
    avatar: "shadow_runner",
  },
  {
    id: "archive_keeper",
    titleDe: "Hüter des Archivs",
    titleEn: "Archive Keeper",
    avatar: "archive_keeper",
  },
] as const satisfies readonly HeroClassOption[];
`;

const i18nKeysTs = `import { DE } from "./de";
import { EN } from "./en";

export type I18nKey = keyof typeof DE;

export function listI18nKeys(): readonly I18nKey[] {
  return Object.keys(DE) as I18nKey[];
}

export function assertI18nKeyParity(): void {
  const deKeys = Object.keys(DE).sort();
  const enKeys = Object.keys(EN).sort();
  const missingInEn = deKeys.filter(
    (key) => !Object.prototype.hasOwnProperty.call(EN, key),
  );
  const missingInDe = enKeys.filter(
    (key) => !Object.prototype.hasOwnProperty.call(DE, key),
  );
  if (missingInEn.length > 0 || missingInDe.length > 0) {
    throw new Error(
      \`i18n key mismatch: missingInEn=\${missingInEn.join(",")} missingInDe=\${missingInDe.join(",")}\`,
    );
  }
}
`;

const translateTs = `import type { Locale } from "../types";
import { DE } from "./de";
import { EN } from "./en";
import type { I18nKey } from "./keys";

const TABLES = {
  de: DE,
  en: EN,
} as const;

export function t(locale: Locale, key: I18nKey, fallback?: string): string {
  const primary = TABLES[locale][key];
  if (typeof primary === "string" && primary.length > 0) {
    return primary;
  }
  const deFallback = DE[key];
  if (typeof deFallback === "string" && deFallback.length > 0) {
    return deFallback;
  }
  return fallback ?? key;
}
`;

const i18nIndexTs = `export { DE } from "./de";
export { EN } from "./en";
export {
  assertI18nKeyParity,
  listI18nKeys,
  type I18nKey,
} from "./keys";
export { t } from "./translate";
`;

const questsTs = `import type { DailyQuestDefinition, MainQuestDefinition } from "./types";

/** From v1 \`js/data/quests.js\`. */
export const MAIN_QUESTS_DATA = ${serializeValue(questsMod.MAIN_QUESTS_DATA)} as const satisfies readonly MainQuestDefinition[];

export const DAILY_QUESTS_DATA = ${serializeValue(questsMod.DAILY_QUESTS_DATA)} as const satisfies readonly DailyQuestDefinition[];
`;

const achievementsTs = `import type { AchievementDefinition } from "./types";

/** Base templates from v1 \`achievement-service.js\` \`_buildBaseAchievements()\`. */
export const ACHIEVEMENT_DEFINITIONS = ${serializeValue(achievementDefs)} as const satisfies readonly AchievementDefinition[];
`;

const challengesTs = `import type { ChallengeDefinition } from "./types";

/** From v1 \`js/data/challenges.js\`. */
export const CHALLENGES_DATA = ${serializeValue(challengesMod.CHALLENGES_DATA)} as const satisfies Record<string, ChallengeDefinition>;
`;

const recipesTs = `import type { ForgeRecipe } from "./types";

/** From v1 \`js/data/recipes.js\`. */
export const FORGE_RECIPES = ${serializeValue(recipesMod.FORGE_RECIPES)} as const satisfies readonly ForgeRecipe[];
`;

const craftingRecipesTs = `import type { MasterRecipe } from "./types";

/** From v1 \`js/data/crafting_recipes.js\`. */
export const MASTER_RECIPES = ${serializeValue(craftingRecipesMod.MASTER_RECIPES)} as const satisfies Record<string, MasterRecipe>;
`;

const gemsEnchantsTs = `import type {
  EnchantmentDefinition,
  GemDefinition,
  RuneDefinition,
} from "./types";

/** From v1 \`js/data/gems_enchants.js\`. */
export const GEMS = ${serializeValue(gemsEnchantsMod.GEMS)} as const satisfies Record<string, GemDefinition>;

export const ENCHANTMENTS = ${serializeValue(gemsEnchantsMod.ENCHANTMENTS)} as const satisfies Record<string, EnchantmentDefinition>;

export const RUNES = ${serializeValue(gemsEnchantsMod.RUNES)} as const satisfies Record<string, RuneDefinition>;
`;

const talentNodesTs = `import type { TalentNode } from "./types";

/** From v1 \`js/data/talent-nodes.js\`. */
export const TALENT_NODES = ${serializeValue(talentNodesMod.TALENT_NODES)} as const satisfies Record<string, TalentNode>;
`;

const storyBranchesTs = `import type { StoryBranchNode } from "./types";

/** From v1 \`js/data/story_branches.js\`. */
export const STORY_BRANCHES = ${serializeValue(storyBranchesMod.STORY_BRANCHES)} as const satisfies Record<string, StoryBranchNode>;

export function getStoryNode(id: string): StoryBranchNode | null {
  if (Object.prototype.hasOwnProperty.call(STORY_BRANCHES, id)) {
    return STORY_BRANCHES[id as keyof typeof STORY_BRANCHES];
  }
  return null;
}

export function isEndingNode(id: string): boolean {
  const node = getStoryNode(id);
  return node ? node.isEnding === true : false;
}
`;

const dialogsTs = `import type { DialogDefinition, NpcDefinition } from "./types";

/** From v1 \`js/data/dialogs.js\`. */
export const NPCS = ${serializeValue(dialogsMod.NPCS)} as const satisfies Record<string, NpcDefinition>;

export function getNPC(id: string): NpcDefinition | null {
  if (Object.prototype.hasOwnProperty.call(NPCS, id)) {
    return NPCS[id as keyof typeof NPCS];
  }
  return null;
}

export function getDialog(npcId: string, dialogId: string): DialogDefinition | null {
  const npc = getNPC(npcId);
  if (!npc) return null;
  return npc.dialogs.find((dialog) => dialog.id === dialogId) ?? null;
}
`;

const codexEntriesTs = `import type { CodexEntry } from "./types";

/** From v1 \`js/data/codex_entries.js\`. */
export const CODEX_ENTRIES = ${serializeValue(codexMod.CODEX_ENTRIES)} as const satisfies Record<string, CodexEntry>;
`;

const loreNodesTs = `import type { LoreNode } from "./types";

/** From v1 \`js/data/lore-nodes.js\`. */
export const LORE_NODES = ${serializeValue(loreNodesMod.LORE_NODES)} as const satisfies Record<string, LoreNode>;
`;

const tutorialStepsTs = `import type { TutorialStep } from "./types";

/** From v1 \`tutorial-service.js\` \`getSteps()\`. */
export const TUTORIAL_STEPS = ${serializeValue(tutorialSteps)} as const satisfies readonly TutorialStep[];
`;

const indexTs = `export {
  BOSS_NAMES,
  CHAPTER_BOSSES,
  generateStoryBosses,
  STORY_BOSSES,
} from "./bosses";
export { ACHIEVEMENT_DEFINITIONS } from "./achievements";
export { CHALLENGES_DATA } from "./challenges";
export { CODEX_ENTRIES } from "./codex-entries";
export { MASTER_RECIPES } from "./crafting-recipes";
export { getDialog, getNPC, NPCS } from "./dialogs";
export { ENCHANTMENTS, GEMS, RUNES } from "./gems-enchants";
export { HERO_CLASSES } from "./hero-classes";
export {
  assertI18nKeyParity,
  DE,
  EN,
  listI18nKeys,
  t,
  type I18nKey,
} from "./i18n";
export {
  getItemTemplate,
  ITEM_TEMPLATES,
  type ItemTemplateName,
} from "./items";
export { LORE_NODES } from "./lore-nodes";
export { bootLabel, isLocale } from "./locale";
export { DAILY_QUESTS_DATA, MAIN_QUESTS_DATA } from "./quests";
export { FORGE_RECIPES } from "./recipes";
export {
  getStoryNode,
  isEndingNode,
  STORY_BRANCHES,
} from "./story-branches";
export {
  STORY_FIGHTS_INTRO_CROSSFADE_MS,
  STORY_FIGHTS_INTRO_FRAMES,
} from "./story-fights-intro";
export { TALENT_NODES } from "./talent-nodes";
export { TUTORIAL_STEPS } from "./tutorial-steps";
export type {
  AchievementDefinition,
  AchievementReward,
  BossReward,
  ChallengeDefinition,
  CodexEntry,
  CodexStats,
  DailyQuestDefinition,
  DialogDefinition,
  EnchantmentDefinition,
  ForgeRecipe,
  GemDefinition,
  HeroClassId,
  HeroClassOption,
  ItemRarity,
  ItemSlot,
  ItemStats,
  ItemTemplate,
  Locale,
  LoreChoice,
  LoreNode,
  MainQuestDefinition,
  MasterRecipe,
  NpcDefinition,
  QuestReward,
  RuneDefinition,
  StatKey,
  StoryBoss,
  StoryBranchNode,
  StoryBranchOption,
  StoryFightsIntroFrame,
  TalentNode,
  TalentNodeType,
  TutorialStep,
  TutorialStepAction,
} from "./types";
`;

fs.mkdirSync(path.join(outDir, "i18n"), { recursive: true });
fs.writeFileSync(path.join(outDir, "types.ts"), typesTs);
fs.writeFileSync(path.join(outDir, "items.ts"), itemsTs);
fs.writeFileSync(path.join(outDir, "bosses.ts"), bossesTs);
fs.writeFileSync(path.join(outDir, "story-fights-intro.ts"), introTs);
fs.writeFileSync(path.join(outDir, "hero-classes.ts"), classesTs);
fs.writeFileSync(path.join(outDir, "quests.ts"), questsTs);
fs.writeFileSync(path.join(outDir, "achievements.ts"), achievementsTs);
fs.writeFileSync(path.join(outDir, "challenges.ts"), challengesTs);
fs.writeFileSync(path.join(outDir, "recipes.ts"), recipesTs);
fs.writeFileSync(path.join(outDir, "crafting-recipes.ts"), craftingRecipesTs);
fs.writeFileSync(path.join(outDir, "gems-enchants.ts"), gemsEnchantsTs);
fs.writeFileSync(path.join(outDir, "talent-nodes.ts"), talentNodesTs);
fs.writeFileSync(path.join(outDir, "story-branches.ts"), storyBranchesTs);
fs.writeFileSync(path.join(outDir, "dialogs.ts"), dialogsTs);
fs.writeFileSync(path.join(outDir, "codex-entries.ts"), codexEntriesTs);
fs.writeFileSync(path.join(outDir, "lore-nodes.ts"), loreNodesTs);
fs.writeFileSync(path.join(outDir, "tutorial-steps.ts"), tutorialStepsTs);
fs.writeFileSync(path.join(outDir, "index.ts"), indexTs);
// Keep curated v2 i18n (Phase 3+ keys). Do not overwrite from v1.
void extractI18n;
void PHASE6_I18N;
fs.writeFileSync(path.join(outDir, "i18n/keys.ts"), i18nKeysTs);
fs.writeFileSync(path.join(outDir, "i18n/translate.ts"), translateTs);
fs.writeFileSync(path.join(outDir, "i18n/index.ts"), i18nIndexTs);

console.log("wrote content sources");
console.log("item count", Object.keys(mergedItems).length);
console.log("main quests", questsMod.MAIN_QUESTS_DATA.length);
console.log("achievements", achievementDefs.length);
console.log("tutorial steps", tutorialSteps.length);
console.log("story branches", Object.keys(storyBranchesMod.STORY_BRANCHES).length);
