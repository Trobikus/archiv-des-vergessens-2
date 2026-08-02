import {
  createDefaultAccountVaultSave,
  createDefaultAchievementsSave,
  createDefaultChallengesSave,
  createDefaultClanSave,
  createDefaultCodexSave,
  createDefaultCraftingSave,
  createDefaultForgeSave,
  createDefaultFriendsSave,
  createDefaultHeroSave,
  createDefaultLeaderboardSave,
  createDefaultLibrarySave,
  createDefaultQuestsSave,
  createDefaultRelicHuntSave,
  createDefaultSettingsSave,
  createDefaultStoryBranchSave,
  createDefaultStorySave,
  createDefaultTalentsSave,
  createDefaultTutorialSave,
  type AccountVaultSave,
  type AchievementsSave,
  type ChallengesSave,
  type ChatMessage,
  type ClanSave,
  type CodexSave,
  type CraftingSave,
  type EquipmentSave,
  type ForgeSave,
  type FriendsSave,
  type GuildInfo,
  type GuildInviteEntry,
  type GuildMember,
  type HeroSave,
  type ItemSave,
  type LeaderboardSave,
  type LibrarySave,
  type Phase2SavePayload,
  type QuestsSave,
  type RelicHuntSave,
  type SettingsSave,
  type StatBlockSave,
  type StoryBranchSave,
  type StorySave,
  type TalentsSave,
  type TutorialSave,
} from "@adv/protocol";
import type { Locale, StoryBoss } from "@adv/content";

export type GedankenArchivState = {
  readonly level: number;
  readonly baseCost: number;
  readonly costMultiplier: number;
  readonly baseYield: number;
  readonly upgrades: {
    readonly focusBonus: number;
  };
};

export type ResourcesState = {
  readonly particles: bigint;
  readonly totalParticles: bigint;
  readonly mnemeFragmente: bigint;
  readonly totalMnemeFragmente: bigint;
  readonly ewigeMneme: bigint;
  readonly relics: bigint;
  readonly totalRelics: bigint;
  readonly artifacts: bigint;
  readonly memoryDust: bigint;
  readonly catalyst: bigint;
};

export type OfflineReport = {
  readonly elapsedSeconds: number;
  readonly clampedSeconds: number;
  readonly mnemeGained: number;
  readonly clanParticlesGained?: number;
  readonly clanRelicsGained?: number;
};

export type ClanChatMessage = {
  readonly id: string;
  readonly player: string;
  readonly message: string;
  readonly timestamp: number;
  readonly type: "clan" | "guild";
  readonly guildId?: string;
};

export type ChatState = {
  readonly global: readonly ChatMessage[];
  readonly clan: readonly ClanChatMessage[];
};

export type GuildState = {
  readonly guild: GuildInfo | null;
  readonly members: readonly GuildMember[];
  readonly invites: readonly GuildInviteEntry[];
  readonly outgoingInvites: readonly GuildInviteEntry[];
};

export type StatBlock = StatBlockSave;
export type InventoryItem = ItemSave;
export type EquipmentState = EquipmentSave;
export type HeroState = HeroSave;
export type StoryMetaState = StorySave;
export type SettingsState = SettingsSave;
export type QuestsState = QuestsSave;
export type AchievementsState = AchievementsSave;
export type ForgeState = ForgeSave;
export type CraftingState = CraftingSave;
export type LibraryState = LibrarySave;
export type TalentsState = TalentsSave;
export type ChallengesState = ChallengesSave;
export type CodexState = CodexSave;
export type StoryBranchState = StoryBranchSave;
export type RelicHuntState = RelicHuntSave;
export type AccountVaultState = {
  readonly particles: bigint;
  readonly relics: bigint;
  readonly artifacts: bigint;
  readonly memoryDust: bigint;
  readonly items: readonly ItemSave[];
};
export type TutorialState = TutorialSave;
export type FriendsState = FriendsSave;
export type ClanState = ClanSave;
export type LeaderboardState = LeaderboardSave;

export type CombatLogEntry = {
  readonly text: string;
  readonly type: string;
};

export type SpellState = {
  readonly id: "spear" | "shield" | "heal";
  readonly name: string;
  readonly cooldown: number;
  readonly maxCooldown: number;
};

export type BattleState = {
  readonly heroHp: number;
  readonly heroMaxHp: number;
  readonly bossHp: number;
  readonly bossMaxHp: number;
  readonly boss: StoryBoss;
  readonly combatLog: readonly CombatLogEntry[];
  readonly spells: readonly SpellState[];
  readonly activeEffects: {
    readonly shieldAmount: number;
    readonly isEnraged: boolean;
  };
  readonly floatingTexts: readonly FloatingText[];
};

export type FloatingText = {
  readonly id: string;
  readonly text: string;
  readonly kind: "damage" | "crit" | "heal" | "miss" | "info";
};

export type GameState = {
  readonly resources: ResourcesState;
  readonly idleGenerators: {
    readonly gedankenArchiv: GedankenArchivState;
  };
  readonly gather: {
    readonly clickPowerLevel: number;
    readonly lastClickAt: number;
  };
  readonly hero: HeroState;
  readonly story: StoryMetaState & {
    readonly battleInProgress: boolean;
    readonly battle: BattleState | null;
  };
  readonly settings: SettingsState;
  readonly quests: QuestsState;
  readonly achievements: AchievementsState;
  readonly forge: ForgeState;
  readonly crafting: CraftingState;
  readonly library: LibraryState;
  readonly talents: TalentsState;
  readonly challenges: ChallengesState;
  readonly codex: CodexState;
  readonly storyBranch: StoryBranchState;
  readonly relicHunt: RelicHuntState;
  readonly accountVault: AccountVaultState;
  readonly tutorial: TutorialState;
  readonly friends: FriendsState;
  readonly clan: ClanState;
  readonly leaderboard: LeaderboardState;
  /** Runtime-only; not persisted in save payload. */
  readonly chat: ChatState;
  /** Runtime-only multiplayer guild; synced from server. */
  readonly guild: GuildState;
  readonly meta: {
    readonly lastActiveAt: number;
    readonly lastSavedAt: number | null;
    readonly bootstrapped: boolean;
    readonly offlineReport: OfflineReport | null;
    /** Runtime-only: frame-budget degradation (particles / floaters off). */
    readonly visualDegraded: boolean;
  };
};

function accountVaultFromSave(vault: AccountVaultSave): AccountVaultState {
  return {
    particles: BigInt(vault.particles),
    relics: BigInt(vault.relics),
    artifacts: BigInt(vault.artifacts),
    memoryDust: BigInt(vault.memoryDust),
    items: vault.items,
  };
}

function accountVaultToSave(vault: AccountVaultState): AccountVaultSave {
  return {
    particles: vault.particles.toString(),
    relics: vault.relics.toString(),
    artifacts: vault.artifacts.toString(),
    memoryDust: vault.memoryDust.toString(),
    items: [...vault.items],
  };
}

export function createInitialGameState(now = Date.now()): GameState {
  return {
    resources: {
      particles: 0n,
      totalParticles: 0n,
      mnemeFragmente: 0n,
      totalMnemeFragmente: 0n,
      ewigeMneme: 0n,
      relics: 0n,
      totalRelics: 0n,
      artifacts: 0n,
      memoryDust: 0n,
      catalyst: 0n,
    },
    idleGenerators: {
      gedankenArchiv: {
        level: 0,
        baseCost: 10,
        costMultiplier: 1.15,
        baseYield: 1,
        upgrades: { focusBonus: 0 },
      },
    },
    gather: {
      clickPowerLevel: 0,
      lastClickAt: 0,
    },
    hero: createDefaultHeroSave(),
    story: {
      ...createDefaultStorySave(),
      battleInProgress: false,
      battle: null,
    },
    settings: createDefaultSettingsSave(),
    quests: createDefaultQuestsSave(),
    achievements: createDefaultAchievementsSave(),
    forge: createDefaultForgeSave(),
    crafting: createDefaultCraftingSave(),
    library: createDefaultLibrarySave(),
    talents: createDefaultTalentsSave(),
    challenges: createDefaultChallengesSave(),
    codex: createDefaultCodexSave(),
    storyBranch: createDefaultStoryBranchSave(),
    relicHunt: createDefaultRelicHuntSave(),
    accountVault: accountVaultFromSave(createDefaultAccountVaultSave()),
    tutorial: createDefaultTutorialSave(),
    friends: createDefaultFriendsSave(),
    clan: createDefaultClanSave(),
    leaderboard: createDefaultLeaderboardSave(now),
    chat: { global: [], clan: [] },
    guild: {
      guild: null,
      members: [],
      invites: [],
      outgoingInvites: [],
    },
    meta: {
      lastActiveAt: now,
      lastSavedAt: null,
      bootstrapped: false,
      offlineReport: null,
      visualDegraded: false,
    },
  };
}

export function gameStateToPayload(state: GameState): Phase2SavePayload {
  return {
    resources: {
      particles: state.resources.particles.toString(),
      totalParticles: state.resources.totalParticles.toString(),
      mnemeFragmente: state.resources.mnemeFragmente.toString(),
      totalMnemeFragmente: state.resources.totalMnemeFragmente.toString(),
      ewigeMneme: state.resources.ewigeMneme.toString(),
      relics: state.resources.relics.toString(),
      totalRelics: state.resources.totalRelics.toString(),
      artifacts: state.resources.artifacts.toString(),
      memoryDust: state.resources.memoryDust.toString(),
      catalyst: state.resources.catalyst.toString(),
    },
    idleGenerators: {
      gedankenArchiv: state.idleGenerators.gedankenArchiv,
    },
    gather: {
      clickPowerLevel: state.gather.clickPowerLevel,
    },
    hero: state.hero,
    story: {
      storyFightsIntroSeen: state.story.storyFightsIntroSeen,
      selectedChapter: state.story.selectedChapter,
    },
    settings: state.settings,
    quests: state.quests,
    achievements: state.achievements,
    forge: state.forge,
    crafting: state.crafting,
    library: state.library,
    talents: state.talents,
    challenges: state.challenges,
    codex: state.codex,
    storyBranch: state.storyBranch,
    relicHunt: state.relicHunt,
    accountVault: accountVaultToSave(state.accountVault),
    tutorial: state.tutorial,
    friends: state.friends,
    clan: state.clan,
    leaderboard: state.leaderboard,
    meta: {
      lastActiveAt: state.meta.lastActiveAt,
    },
  };
}

export function gameStateFromPayload(payload: Phase2SavePayload): GameState {
  return {
    resources: {
      particles: BigInt(payload.resources.particles),
      totalParticles: BigInt(payload.resources.totalParticles),
      mnemeFragmente: BigInt(payload.resources.mnemeFragmente),
      totalMnemeFragmente: BigInt(payload.resources.totalMnemeFragmente),
      ewigeMneme: BigInt(payload.resources.ewigeMneme),
      relics: BigInt(payload.resources.relics),
      totalRelics: BigInt(payload.resources.totalRelics),
      artifacts: BigInt(payload.resources.artifacts),
      memoryDust: BigInt(payload.resources.memoryDust),
      catalyst: BigInt(payload.resources.catalyst),
    },
    idleGenerators: {
      gedankenArchiv: payload.idleGenerators.gedankenArchiv,
    },
    gather: {
      clickPowerLevel: payload.gather.clickPowerLevel,
      lastClickAt: 0,
    },
    hero: payload.hero,
    story: {
      ...payload.story,
      battleInProgress: false,
      battle: null,
    },
    settings: payload.settings,
    quests: payload.quests,
    achievements: payload.achievements,
    forge: payload.forge,
    crafting: payload.crafting,
    library: payload.library,
    talents: payload.talents,
    challenges: payload.challenges,
    codex: payload.codex,
    storyBranch: payload.storyBranch,
    relicHunt: payload.relicHunt,
    accountVault: accountVaultFromSave(payload.accountVault),
    tutorial: payload.tutorial,
    friends: payload.friends,
    clan: payload.clan,
    leaderboard: payload.leaderboard,
    chat: { global: [], clan: [] },
    guild: {
      guild: null,
      members: [],
      invites: [],
      outgoingInvites: [],
    },
    meta: {
      lastActiveAt: payload.meta.lastActiveAt,
      lastSavedAt: null,
      bootstrapped: true,
      offlineReport: null,
      visualDegraded: false,
    },
  };
}

export type { Locale };
