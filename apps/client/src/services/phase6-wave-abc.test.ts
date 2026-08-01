import { afterEach, describe, expect, it } from "vitest";

import { createGameSession } from "./game-session";
import { createMemorySaveStorage } from "./save-storage";

describe("phase 6 waves A+B+C", () => {
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

  it("claims main quest reward when particle condition is met", async () => {
    const session = bootSession();
    await session.boot();

    expect(session.quests.getCurrentQuest()?.id).toBe("q1");
    session.resources.addParticles(10);
    session.quests.checkCurrentQuest();
    expect(session.quests.isCurrentQuestComplete()).toBe(true);

    const before = session.store.getState().resources.particles;
    expect(session.quests.claimReward()).toBe(true);
    expect(session.store.getState().quests.mainIndex).toBe(1);
    expect(session.store.getState().resources.particles).toBe(before + 15n);
  });

  it("forge craft costs particles and adds inventory item", async () => {
    const session = bootSession();
    await session.boot();

    session.resources.addParticles(100);
    session.resources.addArtifacts(10);

    const beforeParticles = session.store.getState().resources.particles;
    const beforeCount = session.store.getState().hero.inventory.equipment.length;

    const result = session.forge.craft("craft_weapon");
    expect(result.success).toBe(true);
    expect(session.store.getState().hero.inventory.equipment.length).toBe(
      beforeCount + 1,
    );
    expect(session.store.getState().resources.particles).toBeLessThan(
      beforeParticles,
    );
    expect(session.store.getState().forge.craftedCount).toBe(1);
  });

  it("library gather_boost increases gather amount", async () => {
    const session = bootSession();
    await session.boot();

    session.store.setState((prev) => ({
      ...prev,
      gather: { ...prev.gather, clickPowerLevel: 10 },
    }));
    const baseGain = session.gather.getClickGain();
    session.resources.addParticles(5000);
    expect(session.library.buyUpgrade("gather_boost")).toBe(true);
    expect(session.gather.getClickGain()).toBeGreaterThan(baseGain);
    expect(session.library.getBonus("gather_boost")).toBeGreaterThan(0);
  });

  it("talent allocate spends points", async () => {
    const session = bootSession();
    await session.boot();

    session.talents.syncPointsFromHeroLevel();
    const before = session.store.getState().talents.points;
    expect(before).toBeGreaterThan(0);

    expect(session.talents.allocateNode("str_1")).toBe(true);
    expect(session.store.getState().talents.points).toBe(before - 1);
    expect(session.store.getState().talents.allocatedNodeIds).toContain(
      "str_1",
    );
  });
});
