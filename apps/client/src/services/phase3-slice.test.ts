import { afterEach, describe, expect, it } from "vitest";

import { createGameSession } from "./game-session";
import { createMemorySaveStorage } from "./save-storage";

describe("phase-3 content combat story slice", () => {
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

  it("creates a hero and switches locale", async () => {
    const session = bootSession();
    await session.boot();

    expect(session.store.getState().hero.created).toBe(false);
    expect(session.hero.createHero({ name: "A", classId: "archmage" })).toBe(
      false,
    );
    expect(
      session.hero.createHero({ name: "Mneme", classId: "archive_keeper" }),
    ).toBe(true);
    expect(session.store.getState().hero.created).toBe(true);
    expect(session.store.getState().hero.name).toBe("Mneme");

    expect(session.i18n.translate("hero.level")).toBe("Stufe");
    session.i18n.setLocale("en");
    expect(session.i18n.translate("hero.level")).toBe("Level");
  });

  it("runs a deterministic boss fight to victory with rewards", async () => {
    const session = bootSession();
    await session.boot();
    session.hero.createHero({ name: "Hüter", classId: "light_warrior" });

    // Force fast win: spend stats then fight with low-roll boss damage.
    for (let i = 0; i < 30; i += 1) {
      session.hero.addExperience(50);
    }
    while (session.store.getState().hero.unspentStatPoints > 0) {
      session.hero.spendStatPoint("attack");
    }

    expect(session.story.startBossFight()).toBe(true);
    expect(session.store.getState().story.battleInProgress).toBe(true);

    let guard = 0;
    while (session.store.getState().story.battleInProgress && guard < 40) {
      session.story.processBattleTick(500);
      guard += 1;
    }

    expect(session.store.getState().story.battleInProgress).toBe(false);
    expect(session.store.getState().hero.prestige.bossProgress).toBe(1);
    expect(session.store.getState().hero.prestige.defeatedBosses).toContain(1);
    expect(session.store.getState().hero.level).toBeGreaterThan(1);
  });

  it("casts spells and flees battles", async () => {
    const session = bootSession();
    await session.boot();
    session.hero.createHero({ name: "Caster", classId: "archmage" });
    expect(session.story.startBossFight()).toBe(true);

    expect(session.story.castSpell("spear")).toBe(true);
    expect(session.story.castSpell("shield")).toBe(true);
    expect(session.story.castSpell("heal")).toBe(true);
    expect(session.story.castSpell("spear")).toBe(false);

    session.story.fleeBattle();
    expect(session.store.getState().story.battleInProgress).toBe(false);
  });

  it("equips inventory rewards and handles defeat", async () => {
    const session = bootSession();
    await session.boot();
    session.hero.createHero({ name: "Gear", classId: "light_warrior" });

    session.store.setState((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        prestige: { bossProgress: 4, defeatedBosses: [1, 2, 3, 4] },
        baseStats: { attack: 80, defense: 0, agility: 0, stamina: 20 },
        spentStats: { attack: 0, defense: 0, agility: 0, stamina: 0 },
      },
    }));

    expect(session.story.getCurrentBoss()?.id).toBe(5);
    expect(session.story.startBossFight()).toBe(true);
    session.story.castSpell("spear");

    expect(session.store.getState().hero.prestige.bossProgress).toBe(5);
    expect(
      session.store.getState().hero.inventory.equipment.length,
    ).toBeGreaterThan(0);
    const reward = session.store.getState().hero.inventory.equipment[0];
    expect(reward).toBeDefined();
    if (!reward) {
      return;
    }
    expect(session.hero.equipFromInventory(reward.id)).toBe(true);
    const equipment = session.store.getState().hero.equipment;
    const equippedSlot = (
      Object.keys(equipment) as Array<keyof typeof equipment>
    ).find((slot) => equipment[slot]?.id === reward.id);
    expect(equippedSlot).toBeDefined();
    if (!equippedSlot) {
      return;
    }
    expect(session.hero.unequip(equippedSlot)).toBe(true);
    expect(session.store.getState().hero.equipment[equippedSlot]).toBeNull();

    const defeatSession = createGameSession({
      storage: createMemorySaveStorage(),
      useIndexedDb: false,
      autosaveMs: 60_000,
      connectNetwork: false,
    });
    sessions.push(defeatSession);
    await defeatSession.boot();
    defeatSession.hero.createHero({ name: "Weak", classId: "archmage" });
    defeatSession.store.setState((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        baseStats: { attack: 1, defense: 0, agility: 0, stamina: 1 },
        spentStats: { attack: 0, defense: 0, agility: 0, stamina: 0 },
      },
    }));
    const { createStoryService } = await import("./story-service");
    const { createHeroService } = await import("./hero-service");
    const hero = createHeroService(defeatSession.store);
    const forced = createStoryService(defeatSession.store, hero, () => 0.99);
    expect(forced.startBossFight()).toBe(true);
    defeatSession.store.setState((prev) => {
      const battle = prev.story.battle;
      if (!battle) {
        return prev;
      }
      return {
        ...prev,
        story: {
          ...prev.story,
          battle: {
            ...battle,
            heroHp: 5,
            heroMaxHp: 5,
            boss: { ...battle.boss, attack: 500, defense: 999 },
          },
        },
      };
    });
    forced.processBattleTick(500);
    expect(defeatSession.store.getState().story.battleInProgress).toBe(false);
    expect(defeatSession.store.getState().hero.prestige.bossProgress).toBe(0);

    session.story.selectChapter(2);
    expect(session.store.getState().story.selectedChapter).toBe(2);
    expect(session.story.getBossesForChapter(2)).toHaveLength(10);
    expect(session.story.getBosses()).toHaveLength(100);
  });

  it("persists hero and story progress across save/load", async () => {
    const storage = createMemorySaveStorage();
    const first = createGameSession({
      storage,
      useIndexedDb: false,
      autosaveMs: 60_000,
      connectNetwork: false,
    });
    sessions.push(first);
    await first.boot();
    first.hero.createHero({ name: "Persist", classId: "shadow_runner" });
    first.story.markIntroSeen();
    first.i18n.setLocale("en");
    first.hero.addExperience(50);
    await first.saveNow();
    first.destroy();
    sessions.length = 0;

    const second = createGameSession({
      storage,
      useIndexedDb: false,
      autosaveMs: 60_000,
      connectNetwork: false,
    });
    sessions.push(second);
    await second.boot();
    const state = second.store.getState();
    expect(state.hero.created).toBe(true);
    expect(state.hero.name).toBe("Persist");
    expect(state.hero.level).toBe(2);
    expect(state.story.storyFightsIntroSeen).toBe(true);
    expect(state.settings.locale).toBe("en");
  });
});
