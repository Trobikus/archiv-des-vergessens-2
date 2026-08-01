import { describe, expect, it } from "vitest";

import {
  createDefaultAccountVaultSave,
  createDefaultAchievementsSave,
  createDefaultChallengesSave,
  createDefaultCodexSave,
  createDefaultCraftingSave,
  createDefaultForgeSave,
  createDefaultLibrarySave,
  createDefaultQuestsSave,
  createDefaultRelicHuntSave,
  createDefaultStoryBranchSave,
  createDefaultTalentsSave,
  createDefaultTutorialSave,
  validatePhase2SavePayload,
} from "./save-payload";

const base = {
  resources: {
    particles: "100",
    totalParticles: "100",
    mnemeFragmente: "10",
    totalMnemeFragmente: "10",
    ewigeMneme: "0",
    relics: "5",
    totalRelics: "5",
    artifacts: "2",
    memoryDust: "50",
    catalyst: "1",
  },
  idleGenerators: {
    gedankenArchiv: {
      level: 1,
      baseCost: 10,
      costMultiplier: 1.15,
      baseYield: 1,
      upgrades: { focusBonus: 0 },
    },
  },
  gather: { clickPowerLevel: 2 },
  meta: { lastActiveAt: 1_700_000_000_000 },
};

const sampleItem = {
  id: "vault_item_1",
  name: "Staubige Klinge",
  slot: "weapon",
  rarity: "common",
  level: 1,
  stats: { attack: 3, defense: 0, agility: 0, stamina: 0 },
};

const fullPhase6 = {
  quests: {
    mainIndex: 2,
    daily: {
      date: "2026-8-1",
      gatherClicks: 25,
      expeditions: 3,
      craftedItems: 1,
      claimed: ["daily_1"],
      lastClaimDate: "2026-7-31",
      streak: 4,
      currentBoost: "collect-2x",
      boostUntil: 9_999_999_999_999,
    },
  },
  achievements: {
    progress: {
      particles_100: { progress: 100, achieved: true, claimed: false },
    },
  },
  forge: { craftedCount: 7 },
  crafting: {
    level: 3,
    exp: 40,
    expToNext: 144,
    unlockedRecipes: ["basic_weapon", "basic_armor"],
  },
  library: {
    upgrades: {
      gather_boost: 2,
      clan_boost: 1,
      forge_discount: 3,
    },
  },
  talents: {
    points: 5,
    allocatedNodeIds: ["str_1", "agi_1"],
  },
  challenges: {
    active: "drought",
    completed: ["pacifist"],
    pacifistUnlocked: true,
    droughtBonus: false,
  },
  codex: {
    unlockedIds: ["origin_of_mneme"],
    decryptedLoreIds: ["lore_fragment_1"],
  },
  storyBranch: {
    currentNode: "prologue",
    flags: { met_archivist: true, trust_level: 2, path: "help" },
    visited: ["prologue", "chapter_1"],
    history: ["prologue"],
    endingReached: null,
  },
  relicHunt: { cooldownEnd: 1_800_000_000_000 },
  accountVault: {
    particles: "200",
    relics: "10",
    artifacts: "3",
    memoryDust: "25",
    items: [sampleItem],
  },
  tutorial: { step: 2, finished: false },
  settings: {
    locale: "en" as const,
    particlesEnabled: false,
    floatingTextEnabled: false,
    audioEnabled: true,
    autosaveMs: 30_000,
  },
};

describe("phase-6 save payload validation", () => {
  it("accepts a full payload with all Phase 6 sections populated", () => {
    const result = validatePhase2SavePayload({ ...base, ...fullPhase6 });
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.value.quests.mainIndex).toBe(2);
    expect(result.value.quests.daily.streak).toBe(4);
    expect(result.value.achievements.progress["particles_100"]?.achieved).toBe(
      true,
    );
    expect(result.value.forge.craftedCount).toBe(7);
    expect(result.value.crafting.level).toBe(3);
    expect(result.value.library.upgrades.gather_boost).toBe(2);
    expect(result.value.talents.allocatedNodeIds).toEqual(["str_1", "agi_1"]);
    expect(result.value.challenges.active).toBe("drought");
    expect(result.value.codex.unlockedIds).toContain("origin_of_mneme");
    expect(result.value.storyBranch.flags["met_archivist"]).toBe(true);
    expect(result.value.relicHunt.cooldownEnd).toBe(1_800_000_000_000);
    expect(result.value.accountVault.items[0]?.id).toBe("vault_item_1");
    expect(result.value.tutorial.step).toBe(2);
    expect(result.value.settings.locale).toBe("en");
    expect(result.value.resources.relics).toBe("5");
    expect(result.value.resources.catalyst).toBe("1");
  });

  it("round-trips via validatePhase2SavePayload with partial Phase 6 fields", () => {
    const partial = validatePhase2SavePayload({
      ...base,
      quests: { mainIndex: 1 },
      forge: { craftedCount: 2 },
      tutorial: { step: 0, finished: true },
    });
    expect(partial.ok).toBe(true);
    if (!partial.ok) {
      return;
    }
    expect(partial.value.quests.daily.streak).toBe(0);
    expect(partial.value.achievements.progress).toEqual({});
    expect(partial.value.crafting.level).toBe(1);
    expect(partial.value.library.upgrades.forge_discount).toBe(0);
    expect(partial.value.tutorial.finished).toBe(true);

    const roundTrip = validatePhase2SavePayload(partial.value);
    expect(roundTrip.ok).toBe(true);
    if (roundTrip.ok) {
      expect(roundTrip.value).toEqual(partial.value);
    }
  });

  it("exercises createDefault* helpers for Phase 6 slices", () => {
    expect(createDefaultQuestsSave().mainIndex).toBe(0);
    expect(createDefaultQuestsSave().daily.claimed).toEqual([]);
    expect(createDefaultAchievementsSave().progress).toEqual({});
    expect(createDefaultForgeSave().craftedCount).toBe(0);
    expect(createDefaultCraftingSave().unlockedRecipes).toEqual([]);
    expect(createDefaultLibrarySave().upgrades.gather_boost).toBe(0);
    expect(createDefaultTalentsSave().points).toBe(0);
    expect(createDefaultChallengesSave().active).toBeNull();
    expect(createDefaultCodexSave().unlockedIds).toEqual([]);
    expect(createDefaultStoryBranchSave().currentNode).toBeNull();
    expect(createDefaultRelicHuntSave().cooldownEnd).toBe(0);
    expect(createDefaultAccountVaultSave().particles).toBe("0");
    expect(createDefaultTutorialSave().finished).toBe(false);
  });

  it("rejects invalid quests and daily fields", () => {
    expect(validatePhase2SavePayload({ ...base, quests: null }).ok).toBe(false);
    expect(
      validatePhase2SavePayload({ ...base, quests: { mainIndex: -1 } }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...base,
        quests: { mainIndex: 0, daily: null },
      }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...base,
        quests: { mainIndex: 0, daily: { date: 1 } },
      }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...base,
        quests: { mainIndex: 0, daily: { date: "", gatherClicks: -1 } },
      }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...base,
        quests: { mainIndex: 0, daily: { date: "", expeditions: -1 } },
      }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...base,
        quests: { mainIndex: 0, daily: { date: "", craftedItems: -1 } },
      }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...base,
        quests: { mainIndex: 0, daily: { date: "", claimed: [1] } },
      }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...base,
        quests: { mainIndex: 0, daily: { date: "", lastClaimDate: 1 } },
      }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...base,
        quests: { mainIndex: 0, daily: { date: "", streak: -1 } },
      }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...base,
        quests: { mainIndex: 0, daily: { date: "", currentBoost: 1 } },
      }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...base,
        quests: { mainIndex: 0, daily: { date: "", boostUntil: -1 } },
      }).ok,
    ).toBe(false);
  });

  it("rejects invalid achievements, forge, and crafting shapes", () => {
    expect(
      validatePhase2SavePayload({ ...base, achievements: null }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({ ...base, achievements: { progress: null } })
        .ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...base,
        achievements: { progress: { x: null } },
      }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...base,
        achievements: {
          progress: { x: { progress: -1, achieved: false, claimed: false } },
        },
      }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...base,
        achievements: {
          progress: { x: { progress: 0, achieved: "no", claimed: false } },
        },
      }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...base,
        achievements: {
          progress: { x: { progress: 0, achieved: true, claimed: "no" } },
        },
      }).ok,
    ).toBe(false);

    expect(validatePhase2SavePayload({ ...base, forge: null }).ok).toBe(false);
    expect(
      validatePhase2SavePayload({ ...base, forge: { craftedCount: -1 } }).ok,
    ).toBe(false);

    expect(validatePhase2SavePayload({ ...base, crafting: null }).ok).toBe(
      false,
    );
    expect(
      validatePhase2SavePayload({ ...base, crafting: { level: 0 } }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...base,
        crafting: { level: 1, exp: -1 },
      }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...base,
        crafting: { level: 1, exp: 0, expToNext: 0 },
      }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...base,
        crafting: { level: 1, exp: 0, expToNext: 10, unlockedRecipes: [1] },
      }).ok,
    ).toBe(false);
  });

  it("rejects invalid library, talents, and challenges shapes", () => {
    expect(validatePhase2SavePayload({ ...base, library: null }).ok).toBe(false);
    expect(
      validatePhase2SavePayload({ ...base, library: { upgrades: null } }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...base,
        library: { upgrades: { gather_boost: -1 } },
      }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...base,
        library: { upgrades: { gather_boost: 0, clan_boost: -1 } },
      }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...base,
        library: {
          upgrades: { gather_boost: 0, clan_boost: 0, forge_discount: -1 },
        },
      }).ok,
    ).toBe(false);

    expect(validatePhase2SavePayload({ ...base, talents: null }).ok).toBe(
      false,
    );
    expect(
      validatePhase2SavePayload({ ...base, talents: { points: -1 } }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...base,
        talents: { points: 0, allocatedNodeIds: [1] },
      }).ok,
    ).toBe(false);

    expect(
      validatePhase2SavePayload({ ...base, challenges: null }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({ ...base, challenges: { active: 1 } }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...base,
        challenges: { active: null, completed: [1] },
      }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...base,
        challenges: {
          active: null,
          completed: [],
          pacifistUnlocked: "yes",
        },
      }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...base,
        challenges: {
          active: null,
          completed: [],
          pacifistUnlocked: false,
          droughtBonus: 1,
        },
      }).ok,
    ).toBe(false);
  });

  it("rejects invalid codex, storyBranch, relicHunt, vault, tutorial, settings", () => {
    expect(validatePhase2SavePayload({ ...base, codex: null }).ok).toBe(false);
    expect(
      validatePhase2SavePayload({ ...base, codex: { unlockedIds: [1] } }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...base,
        codex: { unlockedIds: [], decryptedLoreIds: [false] },
      }).ok,
    ).toBe(false);

    expect(
      validatePhase2SavePayload({ ...base, storyBranch: null }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({ ...base, storyBranch: { currentNode: 1 } })
        .ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...base,
        storyBranch: { currentNode: null, flags: null },
      }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...base,
        storyBranch: {
          currentNode: null,
          flags: { bad: {} },
          visited: [],
          history: [],
          endingReached: null,
        },
      }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...base,
        storyBranch: {
          currentNode: null,
          flags: {},
          visited: [1],
          history: [],
          endingReached: null,
        },
      }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...base,
        storyBranch: {
          currentNode: null,
          flags: {},
          visited: [],
          history: [1],
          endingReached: null,
        },
      }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...base,
        storyBranch: {
          currentNode: null,
          flags: {},
          visited: [],
          history: [],
          endingReached: 1,
        },
      }).ok,
    ).toBe(false);

    expect(
      validatePhase2SavePayload({ ...base, relicHunt: null }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({ ...base, relicHunt: { cooldownEnd: -1 } }).ok,
    ).toBe(false);

    expect(
      validatePhase2SavePayload({ ...base, accountVault: null }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...base,
        accountVault: { particles: "1.5" },
      }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...base,
        accountVault: { particles: "0", relics: "bad" },
      }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...base,
        accountVault: {
          particles: "0",
          relics: "0",
          artifacts: "bad",
        },
      }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...base,
        accountVault: {
          particles: "0",
          relics: "0",
          artifacts: "0",
          memoryDust: "bad",
        },
      }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...base,
        accountVault: {
          particles: "0",
          relics: "0",
          artifacts: "0",
          memoryDust: "0",
          items: null,
        },
      }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...base,
        accountVault: {
          particles: "0",
          relics: "0",
          artifacts: "0",
          memoryDust: "0",
          items: [{ ...sampleItem, id: "" }],
        },
      }).ok,
    ).toBe(false);

    expect(validatePhase2SavePayload({ ...base, tutorial: null }).ok).toBe(
      false,
    );
    expect(
      validatePhase2SavePayload({ ...base, tutorial: { step: -1 } }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...base,
        tutorial: { step: 0, finished: "yes" },
      }).ok,
    ).toBe(false);

    expect(
      validatePhase2SavePayload({
        ...base,
        resources: { ...base.resources, relics: "not-a-number" },
      }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...base,
        settings: { particlesEnabled: "yes" },
      }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...base,
        settings: { floatingTextEnabled: "yes" },
      }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...base,
        settings: { audioEnabled: "yes" },
      }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...base,
        settings: { autosaveMs: 0 },
      }).ok,
    ).toBe(false);
  });

  it("accepts storyBranch with undefined flags and optional vault digit strings", () => {
    const storyOnlyFlags = validatePhase2SavePayload({
      ...base,
      storyBranch: { currentNode: "node_a" },
    });
    expect(storyOnlyFlags.ok).toBe(true);
    if (storyOnlyFlags.ok) {
      expect(storyOnlyFlags.value.storyBranch.flags).toEqual({});
      expect(storyOnlyFlags.value.storyBranch.currentNode).toBe("node_a");
    }

    const vaultDefaults = validatePhase2SavePayload({
      ...base,
      accountVault: {},
    });
    expect(vaultDefaults.ok).toBe(true);
    if (vaultDefaults.ok) {
      expect(vaultDefaults.value.accountVault.particles).toBe("0");
      expect(vaultDefaults.value.accountVault.items).toEqual([]);
    }
  });
});
