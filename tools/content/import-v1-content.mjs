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

function extractI18n(filePath) {
  let src = fs.readFileSync(filePath, "utf8");
  src = src.replace(/import \{ APP_VERSION \} from '[^']+';\r?\n\r?\n/, "");
  src = src.replace(
    /`Version \$\{APP_VERSION\} – AAA Overhaul`/g,
    "'Version 2.0.0 – AAA Overhaul'",
  );
  src = src.replace(/\};\s*$/, "} as const satisfies Record<string, string>;\n");
  return src.trim() + "\n";
}

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

fs.mkdirSync(path.join(outDir, "i18n"), { recursive: true });
fs.writeFileSync(path.join(outDir, "types.ts"), typesTs);
fs.writeFileSync(path.join(outDir, "items.ts"), itemsTs);
fs.writeFileSync(path.join(outDir, "bosses.ts"), bossesTs);
fs.writeFileSync(path.join(outDir, "story-fights-intro.ts"), introTs);
fs.writeFileSync(path.join(outDir, "hero-classes.ts"), classesTs);
fs.writeFileSync(
  path.join(outDir, "i18n/de.ts"),
  extractI18n(path.join(v1, "i18n/de.js")),
);
fs.writeFileSync(
  path.join(outDir, "i18n/en.ts"),
  extractI18n(path.join(v1, "i18n/en.js")),
);
fs.writeFileSync(path.join(outDir, "i18n/keys.ts"), i18nKeysTs);
fs.writeFileSync(path.join(outDir, "i18n/translate.ts"), translateTs);
fs.writeFileSync(path.join(outDir, "i18n/index.ts"), i18nIndexTs);

console.log("wrote content sources");
console.log("item count", Object.keys(mergedItems).length);
