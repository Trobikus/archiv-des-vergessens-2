import { CONFIG } from "@adv/sim";
import { afterEach, describe, expect, it } from "vitest";

import { gameStateToPayload } from "../state/game-state";
import { createGameSession } from "./game-session";
import { createMemorySaveStorage } from "./save-storage";

describe("phase-6 waves D+E+F", () => {
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

  it("relic hunt costs particles and sets cooldown", async () => {
    const session = bootSession();
    await session.boot();
    session.resources.addParticles(100);

    const result = session.relicHunt.performHunt();
    expect(result.message.length).toBeGreaterThan(0);

    const state = session.store.getState();
    expect(state.resources.particles).toBe(
      100n - BigInt(CONFIG.RELIC_HUNT.COST),
    );
    expect(state.relicHunt.cooldownEnd).toBeGreaterThan(Date.now() - 1000);
    expect(session.relicHunt.getCooldownStatus().ready).toBe(false);
  });

  it("vault deposit and withdraw move resources", async () => {
    const session = bootSession();
    await session.boot();
    session.resources.addParticles(10);

    expect(session.accountVault.depositResource("particles", 5)).toBe(true);
    expect(session.store.getState().resources.particles).toBe(5n);
    expect(session.store.getState().accountVault.particles).toBe(5n);

    expect(session.accountVault.withdrawResource("particles", 3)).toBe(true);
    expect(session.store.getState().resources.particles).toBe(8n);
    expect(session.store.getState().accountVault.particles).toBe(2n);
  });

  it("story branch chooseOption advances node", async () => {
    const session = bootSession();
    await session.boot();

    const start = session.storyBranch.getCurrentNode();
    expect(start?.id).toBe("prologue");

    const options = session.storyBranch.getAvailableOptions();
    expect(options.length).toBeGreaterThan(0);

    const first = options[0];
    expect(first).toBeDefined();
    if (first === undefined) {
      throw new Error("expected first story option");
    }
    const result = session.storyBranch.chooseOption(first.id);
    expect(result.success).toBe(true);

    const next = session.storyBranch.getCurrentNode();
    expect(next?.id).toBe(first.next);
    expect(session.store.getState().storyBranch.history.length).toBe(1);
  });

  it("codex unlock adds entry id", async () => {
    const session = bootSession();
    await session.boot();

    expect(session.codex.isUnlocked("origin_of_mneme")).toBe(false);
    expect(session.codex.unlockEntry("origin_of_mneme")).toBe(true);
    expect(session.codex.isUnlocked("origin_of_mneme")).toBe(true);
    expect(session.store.getState().codex.unlockedIds).toContain(
      "origin_of_mneme",
    );
  });

  it("tutorial nextStep advances persisted step", async () => {
    const session = bootSession();
    await session.boot();

    expect(session.store.getState().tutorial.finished).toBe(false);
    session.tutorial.startStep(0);
    expect(session.store.getState().tutorial.step).toBe(0);

    session.tutorial.nextStep();
    expect(session.store.getState().tutorial.step).toBe(1);
    expect(session.tutorial.getCurrentStep()?.title).toBe("Die Berufung");
  });

  it("settings toggle persists via gameStateToPayload", async () => {
    const session = bootSession();
    await session.boot();

    session.store.setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        particlesEnabled: false,
        floatingTextEnabled: false,
        audioEnabled: false,
        autosaveMs: 30_000,
      },
    }));

    const payload = gameStateToPayload(session.store.getState());
    expect(payload.settings.particlesEnabled).toBe(false);
    expect(payload.settings.floatingTextEnabled).toBe(false);
    expect(payload.settings.audioEnabled).toBe(false);
    expect(payload.settings.autosaveMs).toBe(30_000);
  });

  it("boss defeat unlocks codex via event bus", async () => {
    const session = bootSession();
    await session.boot();
    session.hero.createHero({ name: "Tester", classId: "light_warrior" });

    for (let i = 0; i < 30; i += 1) {
      session.hero.addExperience(50);
    }
    while (session.store.getState().hero.unspentStatPoints > 0) {
      session.hero.spendStatPoint("attack");
    }

    expect(session.story.startBossFight()).toBe(true);
    let guard = 0;
    while (session.store.getState().story.battleInProgress && guard < 40) {
      session.story.processBattleTick(500);
      guard += 1;
    }

    expect(session.codex.isUnlocked("origin_of_mneme")).toBe(true);
  });
});
