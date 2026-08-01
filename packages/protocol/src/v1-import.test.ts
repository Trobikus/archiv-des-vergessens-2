import { describe, expect, it } from "vitest";

import { validatePhase2SavePayload } from "./save-payload";
import {
  importV1Save,
  importV1SaveJson,
  mapV1StateToPayload,
  unwrapV1Save,
} from "./v1-import";

function sampleV1State() {
  return {
    hero: {
      id: "hero_1",
      name: "ErzmagierMax",
      avatar: "🔮",
      title: "Erzmagier",
      level: 12,
      experience: 40,
      expToNext: 180,
      baseStats: { attack: 5, defense: 3, agility: 4, stamina: 6 },
      spentStats: { attack: 3, defense: 1, agility: 0, stamina: 2 },
      unspentStatPoints: 1,
      equipment: {
        weapon: {
          name: "Archiv-Klinge",
          slot: "weapon",
          rarity: "rare",
          stats: { attack: 12, defense: 0, agility: 0, stamina: 0 },
          level: 3,
        },
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
      inventory: {
        equipment: [
          {
            name: "Chronisten-Robe",
            slot: "armor",
            rarity: "uncommon",
            baseStats: { attack: 0, defense: 4, agility: 1, stamina: 2 },
            level: 2,
          },
        ],
        loot: [],
      },
      prestige: {
        level: 1,
        points: 2,
        bossProgress: 3,
        defeatedBosses: [1, 2, 3],
        activePact: "solitary_wanderer",
      },
      unlockedSkills: [],
      clickPowerLevel: 4,
      talents: { points: 1, allocatedNodeIds: ["start_0", "node_a"] },
      _craftedRecipeCount: 7,
    },
    resources: {
      particles: "12500",
      relics: "80",
      artifacts: "3",
      memoryDust: "10",
      catalyst: "2",
      totalParticles: "50000",
      totalRelics: "120",
      mnemeFragmente: "5",
      totalMnemeFragmente: "5",
      ewigeMneme: "1",
    },
    idleGenerators: {
      gedankenArchiv: {
        level: 8,
        baseCost: 10,
        costMultiplier: 1.15,
        baseYield: 1,
        upgrades: { focusBonus: 2 },
      },
    },
    quests: {
      mainIndex: 5,
      daily: {
        date: "2026-08-01",
        gatherClicks: 20,
        expeditions: 2,
        craftedItems: 1,
        claimed: ["daily_gather"],
      },
    },
    achievements: {
      list: [
        {
          id: "particles_100",
          progress: 100,
          achieved: true,
          claimed: true,
        },
      ],
      progress: {},
    },
    crafting: {
      level: 4,
      exp: 40,
      expToNext: 160,
      unlockedRecipes: ["basic_weapon", "basic_armor"],
    },
    library: {
      upgrades: { gather_boost: 2, clan_boost: 1, forge_discount: 0 },
    },
    challenges: {
      active: null,
      completed: ["pacifist"],
      _pacifistUnlocked: true,
      _droughtBonus: false,
    },
    friends: {
      list: [{ name: "Eldor", added: 1720000000000 }],
      pending: [],
      sent: [],
    },
    clan: {
      members: [
        {
          id: 1,
          name: "Lyra",
          role: "collector",
          level: 3,
          experience: 20,
          progress: 0,
          expToNextLevel: 80,
          baseCollectRate: 2,
        },
      ],
      nextId: 2,
      expeditionStatus: { "1": false },
      raid: {
        active: false,
        members: [],
        durationSeconds: 0,
        maxDuration: 3600,
        lastRaidTime: 0,
        rewardClaimed: false,
      },
    },
    codex: {
      entries: {
        entry_a: { unlocked: true, unlockedAt: 1 },
        entry_b: { unlocked: false, unlockedAt: 0 },
      },
    },
    lore: {
      decrypted: { node_prologue: "diligence", node_cataclysm: "soulflow" },
    },
    storyBranch: {
      currentNode: "chapter_2",
      flags: { chose_path_a: true, aethel: 2 },
      visited: ["prologue", "chapter_1", "chapter_2"],
      history: [
        {
          from: "prologue",
          option: "opt_1",
          to: "chapter_1",
          timestamp: 1,
        },
      ],
      endingReached: false,
    },
    leaderboard: {
      highestPrestige: 1,
      totalPrestiges: 1,
      fastestBossKill: null,
      totalBossesDefeated: 3,
      highestChapterReached: 2,
      highestLevel: 12,
      fastestLevelUp: "Infinity",
      highestCraftingLevel: 4,
      totalMasterworksCrafted: 0,
      highestItemQuality: 112,
      peakParticlesPerSecond: 15.2,
      totalParticlesCollected: 50000,
      peakRelicsPerSecond: 0.4,
      totalRelicsCollected: 120,
      totalExpeditions: 15,
      successfulExpeditions: 12,
      achievementsUnlocked: 3,
      fastestPrestige: null,
      totalPlayTime: 3600000,
      sessionCount: 8,
      lastPlayed: 1720000000000,
    },
    settings: {
      particles: true,
      floatingText: false,
      autosave: 30000,
      music: true,
      sfx: false,
      language: "en",
    },
    system: {
      lastSave: 1720000000000,
      tutorialStep: -1,
      tutorialFinished: true,
      storyFightsIntroSeen: true,
    },
    chat: {
      global: [{ id: "x", player: "A", message: "hi", timestamp: 1 }],
      clan: [],
    },
    story: {
      battleState: { hp: 1 },
      currentBoss: null,
    },
  };
}

describe("unwrapV1Save", () => {
  it("accepts inner state", () => {
    const result = unwrapV1Save(sampleV1State());
    expect(result.ok).toBe(true);
  });

  it("unwraps IndexedDB envelope", () => {
    const result = unwrapV1Save({
      key: "slot_guest_1",
      timestamp: 99,
      version: "1.0.11",
      state: sampleV1State(),
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.savedAt).toBe(99);
    }
  });

  it("unwraps cloud saveData", () => {
    const result = unwrapV1Save({
      userId: "u1",
      timestamp: 42,
      saveData: sampleV1State(),
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.savedAt).toBe(42);
    }
  });

  it("rejects v2 envelopes", () => {
    const result = unwrapV1Save({
      schemaVersion: 1,
      savedAt: 1,
      payload: {},
    });
    expect(result.ok).toBe(false);
  });
});

describe("importV1Save", () => {
  it("maps a full mid-game v1 state into a valid envelope", () => {
    const result = importV1Save(
      {
        timestamp: 1720000000000,
        state: sampleV1State(),
        vaultData: {
          particles: "9",
          relics: "1",
          artifacts: "0",
          memoryDust: "0",
          sharedVault: [
            {
              name: "Vault Ring",
              slot: "ring",
              rarity: "rare",
              stats: { attack: 1, defense: 0, agility: 2, stamina: 0 },
              level: 1,
            },
          ],
        },
      },
      { savedAt: 1720000000000 },
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.value.schemaVersion).toBe(1);
    expect(result.value.savedAt).toBe(1720000000000);

    const payload = validatePhase2SavePayload(result.value.payload);
    expect(payload.ok).toBe(true);
    if (!payload.ok) {
      return;
    }

    expect(payload.value.hero.name).toBe("ErzmagierMax");
    expect(payload.value.hero.created).toBe(true);
    expect(payload.value.hero.equipment.weapon?.id).toBe("v1_weapon");
    expect(payload.value.hero.inventory.equipment).toHaveLength(1);
    expect(payload.value.gather.clickPowerLevel).toBe(4);
    expect(payload.value.talents.allocatedNodeIds).toEqual([
      "start_0",
      "node_a",
    ]);
    expect(payload.value.achievements.progress["particles_100"]?.claimed).toBe(
      true,
    );
    expect(payload.value.forge.craftedCount).toBe(7);
    expect(payload.value.challenges.pacifistUnlocked).toBe(true);
    expect(payload.value.codex.unlockedIds).toEqual(["entry_a"]);
    expect(payload.value.codex.decryptedLoreIds).toEqual([
      "node_prologue",
      "node_cataclysm",
    ]);
    expect(payload.value.storyBranch.history[0]).toBe(
      "prologue>opt_1>chapter_1",
    );
    expect(payload.value.storyBranch.endingReached).toBeNull();
    expect(payload.value.leaderboard.fastestLevelUp).toBeNull();
    expect(payload.value.settings.locale).toBe("en");
    expect(payload.value.settings.autosaveMs).toBe(30_000);
    expect(payload.value.settings.floatingTextEnabled).toBe(false);
    expect(payload.value.story.storyFightsIntroSeen).toBe(true);
    expect(payload.value.story.selectedChapter).toBe(2);
    expect(payload.value.tutorial.finished).toBe(true);
    expect(payload.value.accountVault.particles).toBe("9");
    expect(payload.value.accountVault.items[0]?.name).toBe("Vault Ring");
    expect(payload.value.friends.list[0]?.name).toBe("Eldor");
    expect(payload.value.clan.members).toHaveLength(1);
  });

  it("imports from JSON text", () => {
    const result = importV1SaveJson(JSON.stringify(sampleV1State()));
    expect(result.ok).toBe(true);
  });

  it("rejects invalid JSON text", () => {
    expect(importV1SaveJson("{").ok).toBe(false);
  });

  it("fills defaults for sparse legacy saves", () => {
    const mapped = mapV1StateToPayload({
      resources: { particles: 10, totalParticles: 10 },
      idleGenerators: {},
      hero: { name: "Gast" },
    });
    const validated = validatePhase2SavePayload(mapped);
    expect(validated.ok).toBe(true);
    if (validated.ok) {
      expect(validated.value.resources.particles).toBe("10");
      expect(validated.value.idleGenerators.gedankenArchiv.level).toBe(0);
      expect(validated.value.hero.created).toBe(true);
    }
  });

  it("rejects non-objects and incomplete wrappers", () => {
    expect(importV1Save(null).ok).toBe(false);
    expect(importV1Save("x").ok).toBe(false);
    expect(importV1Save({ foo: 1 }).ok).toBe(false);
    expect(importV1Save({ saveData: null }).ok).toBe(false);
  });

  it("maps edge-case fields and wrappers", () => {
    const result = importV1Save({
      timestamp: 11,
      saveData: {
        state: {
          resources: {
            particles: 3n,
            totalParticles: "9",
            relics: 1.9,
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
          hero: {
            name: "Edge",
            created: true,
            equipment: {
              weapon: {
                id: "w1",
                name: "",
                slot: "weapon",
                rarity: "common",
                level: 1,
              },
              shield: { name: "Holzschild", slot: "shield", rarity: "" },
            },
            inventory: {
              equipment: [null, { name: "X", slot: "ring", rarity: "common" }],
              loot: [{ name: "Y", slot: "ring2", rarity: "rare", level: 2 }],
            },
            prestige: { bossProgress: 0, defeatedBosses: [0, "x", 2] },
            unlockedSkills: ["a", 1],
            talents: { points: 0, allocatedNodeIds: ["start_0"] },
          },
          talents: { points: 2, allocatedNodeIds: ["node_b"] },
          settings: {
            locale: "de",
            audioEnabled: false,
            particlesEnabled: false,
            floatingTextEnabled: true,
            autosaveMs: 5000,
          },
          story: { storyFightsIntroSeen: false, selectedChapter: 3 },
          storyBranch: {
            currentNode: null,
            flags: { ok: true, bad: { nested: 1 }, n: 1, s: "x" },
            visited: ["end"],
            history: ["plain", { from: "a", option: "b", to: "c" }, 1],
            endingReached: true,
          },
          challenges: { active: "drought", completed: ["x", 2], droughtBonus: true },
          clan: {
            members: [
              {
                id: 9,
                name: "Z",
                role: "not-a-role",
                level: 1,
                experience: 0,
                progress: 0,
                expToNextLevel: 10,
                baseCollectRate: 1,
              },
            ],
            nextId: 10,
            expeditionStatus: { a: true, b: "no" },
            raid: {
              active: true,
              members: [9, -1],
              durationSeconds: 1,
              maxDuration: 10,
              lastRaidTime: 0,
              rewardClaimed: true,
            },
          },
          friends: {
            list: [{ name: "A", added: 1 }, { added: 2 }],
            pending: [{ from: "a", to: "b", timestamp: 1 }, { from: 1 }],
            sent: [{ from: "c", to: "d", timestamp: 2 }],
          },
          leaderboard: {
            fastestBossKill: Number.POSITIVE_INFINITY,
            fastestLevelUp: null,
            fastestPrestige: "null",
            peakParticlesPerSecond: -1,
          },
          achievements: {
            progress: {
              p1: { progress: 1, achieved: true, claimed: false },
              bad: "x",
            },
            list: [{ id: "p2", progress: 2, achieved: true, claimed: true }, {}],
          },
          crafting: {
            level: 2,
            exp: 1,
            expToNext: 10,
            unlockedRecipes: ["r1", 2],
          },
          library: { upgrades: { gather_boost: 1, clan_boost: 0, forge_discount: 0 } },
          codex: {
            unlockedIds: ["u1"],
            decryptedLoreIds: ["d1"],
            entries: { e1: { unlocked: true } },
          },
          lore: { decrypted: { n1: "c1" } },
          relicHunt: { cooldownEnd: 5 },
          accountVault: {
            particles: "1",
            items: [
              {
                name: "V",
                slot: "amulet",
                rarity: "epic",
                stats: { attack: 1 },
              },
            ],
          },
          forge: { craftedCount: 3 },
          quests: {
            mainIndex: 1,
            daily: {
              date: "d",
              gatherClicks: 1,
              expeditions: 0,
              craftedItems: 0,
              claimed: ["c", 1],
              lastClaimDate: "d",
              streak: 1,
              currentBoost: "boost",
              boostUntil: 9,
            },
          },
          system: {
            tutorialFinished: false,
            tutorialStep: 2,
            lastSave: 11,
          },
          meta: { lastActiveAt: 11 },
        },
      },
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    const payload = validatePhase2SavePayload(result.value.payload);
    expect(payload.ok).toBe(true);
    if (!payload.ok) {
      return;
    }
    expect(payload.value.resources.particles).toBe("3");
    expect(payload.value.gather.clickPowerLevel).toBe(2);
    expect(payload.value.talents.points).toBe(2);
    expect(payload.value.hero.equipment.weapon).toBeNull();
    expect(payload.value.hero.equipment.shield?.rarity).toBe("common");
    expect(payload.value.hero.inventory.equipment).toHaveLength(2);
    expect(payload.value.storyBranch.endingReached).toBe("end");
    expect(payload.value.clan.members[0]?.role).toBe("collector");
    expect(payload.value.leaderboard.fastestBossKill).toBeNull();
    expect(payload.value.settings.audioEnabled).toBe(false);
    expect(payload.value.tutorial.finished).toBe(false);
    expect(payload.value.tutorial.step).toBe(2);
    expect(payload.value.accountVault.items[0]?.name).toBe("V");
    expect(payload.value.challenges.active).toBe("drought");
    expect(payload.value.quests.daily.currentBoost).toBe("boost");
  });

  it("accepts optional vault override on import options", () => {
    const result = importV1Save(
      {
        resources: { particles: "1", totalParticles: "1" },
        idleGenerators: {
          gedankenArchiv: {
            level: 0,
            baseCost: 10,
            costMultiplier: 1.15,
            baseYield: 1,
            upgrades: { focusBonus: 0 },
          },
        },
        hero: { name: "V" },
      },
      {
        savedAt: 5,
        accountVault: {
          particles: "8",
          relics: "0",
          artifacts: "0",
          memoryDust: "0",
          sharedVault: [],
        },
      },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    const payload = validatePhase2SavePayload(result.value.payload);
    expect(payload.ok).toBe(true);
    if (payload.ok) {
      expect(payload.value.accountVault.particles).toBe("8");
      expect(result.value.savedAt).toBe(5);
    }
  });
});
