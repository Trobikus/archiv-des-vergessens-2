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
  readonly title_en?: string;
  readonly text: string;
  readonly text_en: string;
  readonly target: string | null;
  readonly action: TutorialStepAction;
  readonly dialogPosition?: string;
};
