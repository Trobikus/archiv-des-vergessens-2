export type Locale = "de" | "en";

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
