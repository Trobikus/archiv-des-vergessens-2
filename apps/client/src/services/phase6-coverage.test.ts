import { afterEach, describe, expect, it } from "vitest";

import { createItemFromTemplate } from "./hero-service";
import { createGameSession } from "./game-session";
import { createMemorySaveStorage } from "./save-storage";

describe("phase 6 service coverage smoke tests", () => {
  const sessions: Array<ReturnType<typeof createGameSession>> = [];

  afterEach(() => {
    for (const session of sessions) {
      session.destroy();
    }
    sessions.length = 0;
  });

  function bootSession() {
    const session = createGameSession({
      storage: createMemorySaveStorage(),
      useIndexedDb: false,
      autosaveMs: 60_000,
      connectNetwork: false,
    });
    sessions.push(session);
    return session;
  }

  it("daily rewards claim, streak, and canClaimToday", async () => {
    const session = bootSession();
    await session.boot();

    const now = Date.UTC(2026, 7, 1, 12, 0, 0);
    expect(session.dailyRewards.canClaimToday(now)).toBe(true);
    expect(session.dailyRewards.getStreak()).toBe(0);

    const claim = session.dailyRewards.claimDailyReward(now);
    expect(claim.success).toBe(true);
    expect(claim.streak).toBeGreaterThanOrEqual(1);
    expect(session.dailyRewards.getStreak()).toBe(claim.streak);
    expect(session.dailyRewards.canClaimToday(now)).toBe(false);

    const again = session.dailyRewards.claimDailyReward(now);
    expect(again.success).toBe(false);
  });

  it("crafting crafts a master recipe and reports level progress", async () => {
    const session = bootSession();
    await session.boot();

    session.resources.addParticles(500);
    session.resources.addRelics(50);

    const recipes = session.crafting.getAvailableRecipes();
    expect(recipes.length).toBeGreaterThan(0);

    const recipe = recipes.find((entry) => entry.id === "basic_weapon");
    expect(recipe).toBeDefined();
    if (recipe === undefined) {
      throw new Error("expected basic_weapon recipe");
    }

    const cost = session.crafting.getRecipeCost(recipe);
    expect(Object.keys(cost).length).toBeGreaterThan(0);

    const beforeCount = session.store.getState().hero.inventory.equipment.length;
    const result = session.crafting.craftMasterRecipe("basic_weapon");
    expect(result.success).toBe(true);
    expect(session.store.getState().hero.inventory.equipment.length).toBe(
      beforeCount + 1,
    );
    expect(session.crafting.getCraftingLevel()).toBeGreaterThanOrEqual(1);
    expect(session.crafting.getLevelProgress()).toBeGreaterThanOrEqual(0);
  });

  it("challenges start, list, and abort", async () => {
    const session = bootSession();
    await session.boot();

    const list = session.challenges.getChallenges();
    expect(list.length).toBeGreaterThan(0);
    expect(session.challenges.getChallenge("pacifist")?.id).toBe("pacifist");

    const started = session.challenges.startChallenge("pacifist");
    expect(started.success).toBe(true);
    expect(session.store.getState().challenges.active).toBe("pacifist");

    const blocked = session.challenges.startChallenge("drought");
    expect(blocked.success).toBe(false);

    const aborted = session.challenges.abortChallenge();
    expect(aborted.success).toBe(true);
    expect(session.store.getState().challenges.active).toBeNull();
  });

  it("dialog open and advance through options", async () => {
    const session = bootSession();
    await session.boot();

    expect(session.dialog.startDialog("archivist")).toBe(true);
    expect(session.dialog.getActiveNpc()?.id).toBe("archivist");
    expect(session.dialog.getCurrentDialog()?.id).toBe("first_meeting");

    expect(session.dialog.chooseOption(0)).toBe(true);
    expect(session.dialog.getCurrentDialog()?.id).toBe("what_is_archive");
  });

  it("forge salvage and upgrade equipped item", async () => {
    const session = bootSession();
    await session.boot();

    const common = createItemFromTemplate(
      "Schrott-Klinge",
      {
        slot: "weapon",
        rarity: "common",
        stats: { attack: 2 },
      },
      1,
    );
    session.store.setState((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        inventory: {
          equipment: [...prev.hero.inventory.equipment, common],
        },
        equipment: { ...prev.hero.equipment, weapon: common },
      },
    }));

    session.resources.addMemoryDust(100);
    const upgraded = session.forge.upgradeEquipped("weapon");
    expect(upgraded.success).toBe(true);
    expect(session.store.getState().hero.equipment.weapon?.level).toBe(2);

    const salvageIndex = session.store
      .getState()
      .hero.inventory.equipment.findIndex((item) => item.rarity === "common");
    if (salvageIndex >= 0) {
      const salvaged = session.forge.salvageItem(salvageIndex);
      expect(salvaged.success).toBe(true);
    }
  });

  it("daily quests list and claim after progress", async () => {
    const session = bootSession();
    await session.boot();

    session.store.setState((prev) => ({
      ...prev,
      quests: {
        ...prev.quests,
        daily: { ...prev.quests.daily, gatherClicks: 50 },
      },
    }));

    const dailies = session.quests.getDailyQuests();
    const gatherQuest = dailies.find((entry) => entry.id === "daily_1");
    expect(gatherQuest?.isComplete).toBe(true);

    const before = session.store.getState().resources.particles;
    expect(session.quests.claimDailyReward("daily_1")).toBe(true);
    expect(session.store.getState().resources.particles).toBeGreaterThan(before);
  });

  it("achievements claim after forced progress", async () => {
    const session = bootSession();
    await session.boot();

    session.resources.addParticles(100);
    session.achievements.checkProgress();

    const entry = session.achievements
      .getAchievements()
      .find((achievement) => achievement.id === "particles_100");
    expect(entry?.achieved).toBe(true);

    const before = session.store.getState().resources.particles;
    expect(session.achievements.claimReward("particles_100")).toBe(true);
    expect(session.store.getState().resources.particles).toBeGreaterThan(before);
  });

  it("tutorial skip completes the active guide only", async () => {
    const session = bootSession();
    await session.boot();
    session.hero.createHero({ name: "Skipper", classId: "light_warrior" });

    session.tutorial.startGuide("archiv");
    expect(session.tutorial.isActive()).toBe(true);
    session.tutorial.skip();
    expect(session.store.getState().tutorial.completedGuides).toContain(
      "archiv",
    );
    expect(session.store.getState().tutorial.finished).toBe(false);
    expect(session.tutorial.isActive()).toBe(false);
  });

  it("tutorial maybeAutoStart re-emits current step for late UI", async () => {
    const session = bootSession();
    await session.boot();
    session.hero.createHero({ name: "Late", classId: "light_warrior" });

    session.tutorial.startGuide("archiv");
    expect(session.tutorial.isActive()).toBe(true);

    let seenIndex: number | null = null;
    const sub = session.eventBus.subscribe("tutorial:step", (data) => {
      const payload = data as { index?: number };
      if (typeof payload.index === "number") {
        seenIndex = payload.index;
      }
    });
    session.tutorial.maybeAutoStart();
    session.eventBus.unsubscribe(sub);

    expect(seenIndex).toBe(0);
    expect(session.tutorial.getCurrentStep()?.title).toBe("Das Erwachen");
  });

  it("tutorial maybeAutoStart starts archiv on first enter after createHero", async () => {
    const session = bootSession();
    await session.boot();
    expect(session.hero.createHero({ name: "First", classId: "archive_keeper" })).toBe(
      true,
    );
    expect(session.store.getState().tutorial.activeGuide).toBeNull();

    session.tutorial.maybeAutoStart();

    expect(session.tutorial.getActiveGuideId()).toBe("archiv");
    expect(session.tutorial.isActive()).toBe(true);
    expect(session.tutorial.getCurrentStep()?.title).toBe("Das Erwachen");
  });

  it("tutorial maybeAutoStart recovers after createHero mid-guide", async () => {
    const session = bootSession();
    await session.boot();
    session.hero.createHero({ name: "Old", classId: "light_warrior" });
    session.tutorial.startGuide("archiv");
    expect(session.tutorial.isActive()).toBe(true);

    expect(session.hero.createHero({ name: "New", classId: "archmage" })).toBe(
      true,
    );
    expect(session.store.getState().tutorial.activeGuide).toBeNull();

    session.tutorial.maybeAutoStart();

    expect(session.tutorial.getActiveGuideId()).toBe("archiv");
    expect(session.tutorial.isActive()).toBe(true);
  });

  it("starts combat_hero then workshop after first boss defeat", async () => {
    const session = bootSession();
    await session.boot();
    session.hero.createHero({ name: "Boss", classId: "light_warrior" });
    session.tutorial.startGuide("archiv");
    session.tutorial.skip();
    expect(session.store.getState().tutorial.activeGuide).toBeNull();

    session.store.setState((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        prestige: { ...prev.hero.prestige, bossProgress: 1 },
      },
    }));
    session.eventBus.publish("story:bossDefeated", {
      bossId: "c1_f1",
      bossProgress: 1,
    });

    expect(session.tutorial.getActiveGuideId()).toBe("combat_hero");
    expect(session.tutorial.isActive()).toBe(true);

    session.tutorial.skip();
    expect(session.tutorial.getActiveGuideId()).toBe("workshop");
  });

  it("starts clan guide when main quest index reaches recruit quest", async () => {
    const session = bootSession();
    await session.boot();
    session.hero.createHero({ name: "Clan", classId: "light_warrior" });
    session.tutorial.startGuide("archiv");
    session.tutorial.skip();

    session.store.setState((prev) => ({
      ...prev,
      quests: { ...prev.quests, mainIndex: 1 },
    }));
    session.eventBus.publish("quest:updated", {});

    expect(session.tutorial.getActiveGuideId()).toBe("clan");
  });

  it("combat analytics recordHit, getStats, and reset", async () => {
    const session = bootSession();
    await session.boot();

    session.combatAnalytics.recordHit(50, true, "physical");
    session.combatAnalytics.recordHit(20, false, "heal");
    session.combatAnalytics.recordMnemeGained(15);

    const stats = session.combatAnalytics.getStats();
    expect(stats.totalHits).toBe(1);
    expect(stats.critHits).toBe(1);
    expect(stats.totalHeal).toBe(20);
    expect(stats.totalMneme).toBe(15);
    expect(session.combatAnalytics.getCurrentDPS()).toBeGreaterThanOrEqual(0);

    session.combatAnalytics.reset();
    expect(session.combatAnalytics.getStats().totalHits).toBe(0);
  });

  it("account vault deposit and withdraw items", async () => {
    const session = bootSession();
    await session.boot();

    const item = createItemFromTemplate(
      "Tresor-Relikt",
      {
        slot: "amulet",
        rarity: "rare",
        stats: { defense: 4 },
      },
      1,
    );
    session.store.setState((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        inventory: {
          equipment: [...prev.hero.inventory.equipment, item],
        },
      },
    }));

    expect(session.accountVault.depositItem(item.id)).toBe(true);
    expect(session.accountVault.getSharedVaultItems().length).toBe(1);
    expect(
      session.store
        .getState()
        .hero.inventory.equipment.some((entry) => entry.id === item.id),
    ).toBe(false);

    expect(session.accountVault.withdrawItem(0)).toBe(true);
    expect(session.accountVault.getSharedVaultItems().length).toBe(0);
    expect(
      session.store
        .getState()
        .hero.inventory.equipment.some((entry) => entry.id === item.id),
    ).toBe(true);
  });

  it("library getUpgrades and getUpgradeCost", async () => {
    const session = bootSession();
    await session.boot();

    const upgrades = session.library.getUpgrades();
    expect(upgrades.length).toBe(3);
    expect(upgrades.every((entry) => entry.level >= 0)).toBe(true);

    const cost = session.library.getUpgradeCost("gather_boost");
    expect(cost["particles"]).toBeGreaterThan(0);
    expect(session.library.getAllBonuses()["gather_boost"]).toBe(0);
  });

  it("talents resetTalents and getAggregatedStats", async () => {
    const session = bootSession();
    await session.boot();

    session.talents.syncPointsFromHeroLevel();
    expect(session.talents.allocateNode("str_1")).toBe(true);

    const stats = session.talents.getAggregatedStats();
    expect(Object.keys(stats).length).toBeGreaterThan(0);

    session.talents.resetTalents();
    expect(session.talents.getAllocatedNodeIds()).toContain("start_0");
    expect(session.talents.getAllocatedNodeIds()).not.toContain("str_1");
    expect(
      session.talents.getAggregatedStats()["damagePercent"],
    ).toBeGreaterThan(0);
  });
});
