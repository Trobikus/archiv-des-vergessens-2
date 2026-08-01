import {
  createDefaultHeroSave,
  createDefaultSettingsSave,
  createDefaultStorySave,
  type EquipmentSave,
  type HeroSave,
  type ItemSave,
  type Phase2SavePayload,
  type SettingsSave,
  type StatBlockSave,
  type StorySave,
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
};

export type OfflineReport = {
  readonly elapsedSeconds: number;
  readonly clampedSeconds: number;
  readonly mnemeGained: number;
};

export type StatBlock = StatBlockSave;
export type InventoryItem = ItemSave;
export type EquipmentState = EquipmentSave;
export type HeroState = HeroSave;
export type StoryMetaState = StorySave;
export type SettingsState = SettingsSave;

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
  readonly meta: {
    readonly lastActiveAt: number;
    readonly lastSavedAt: number | null;
    readonly bootstrapped: boolean;
    readonly offlineReport: OfflineReport | null;
  };
};

export function createInitialGameState(now = Date.now()): GameState {
  return {
    resources: {
      particles: 0n,
      totalParticles: 0n,
      mnemeFragmente: 0n,
      totalMnemeFragmente: 0n,
      ewigeMneme: 0n,
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
    meta: {
      lastActiveAt: now,
      lastSavedAt: null,
      bootstrapped: false,
      offlineReport: null,
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
    meta: {
      lastActiveAt: payload.meta.lastActiveAt,
      lastSavedAt: null,
      bootstrapped: true,
      offlineReport: null,
    },
  };
}

export type { Locale };
