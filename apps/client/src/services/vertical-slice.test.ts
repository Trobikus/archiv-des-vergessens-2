import { createStore } from "@adv/core";
import { createSaveEnvelope } from "@adv/protocol";
import { afterEach, describe, expect, it } from "vitest";

import {
  createInitialGameState,
  gameStateToPayload,
} from "../state/game-state";
import { createGameSession } from "./game-session";
import { createGatherService } from "./gather-service";
import { createIdleService } from "./idle-service";
import { createOfflineProgressService } from "./offline-progress-service";
import { createResourceService } from "./resource-service";
import { createMemorySaveStorage } from "./save-storage";
import { createSaveStore } from "./save-store";

describe("phase-2 vertical slice", () => {
  const sessions: Array<ReturnType<typeof createGameSession>> = [];

  afterEach(() => {
    for (const session of sessions) {
      session.destroy();
    }
    sessions.length = 0;
  });

  it("gathers particles and upgrades click power", () => {
    const store = createStore({ initialState: createInitialGameState(1000) });
    const resources = createResourceService(store);
    const gather = createGatherService(store, resources);

    expect(gather.gather(1000)).toBe(1);
    expect(store.getState().resources.particles).toBe(1n);

    resources.addParticles(49);
    expect(gather.upgradeClickPower()).toBe(true);
    expect(store.getState().gather.clickPowerLevel).toBe(1);
    expect(gather.gather(1100)).toBe(2);
  });

  it("buys gedankenarchiv and ticks mneme", () => {
    const store = createStore({ initialState: createInitialGameState(0) });
    const resources = createResourceService(store);
    const idle = createIdleService(store, resources);

    resources.addMnemeFragmente(10);
    expect(idle.buyLevel(1)).toBe(true);
    expect(store.getState().idleGenerators.gedankenArchiv.level).toBe(1);
    expect(idle.getYieldPerSecond()).toBe(1);

    const gained = idle.processTick(1500);
    expect(gained).toBe(1);
    expect(store.getState().resources.mnemeFragmente).toBe(1n);
  });

  it("applies offline mneme on boot clock", () => {
    const store = createStore({
      initialState: {
        ...createInitialGameState(0),
        idleGenerators: {
          gedankenArchiv: {
            level: 2,
            baseCost: 10,
            costMultiplier: 1.15,
            baseYield: 1,
            upgrades: { focusBonus: 0 },
          },
        },
        meta: {
          lastActiveAt: 1_000,
          lastSavedAt: null,
          bootstrapped: false,
          offlineReport: null,
        },
      },
    });
    const resources = createResourceService(store);
    const offline = createOfflineProgressService(store, resources);

    // 2 yield/s * 10s = 20
    const report = offline.applyOnBoot(11_000);
    expect(report?.mnemeGained).toBe(20);
    expect(store.getState().resources.mnemeFragmente).toBe(20n);
  });

  it("round-trips save/load through memory storage", async () => {
    const storage = createMemorySaveStorage();
    const saves = createSaveStore(storage);
    const state = createInitialGameState(5_000);
    const withProgress = {
      ...state,
      resources: {
        ...state.resources,
        particles: 42n,
        totalParticles: 42n,
        mnemeFragmente: 7n,
        totalMnemeFragmente: 7n,
      },
      gather: { ...state.gather, clickPowerLevel: 3 },
    };

    const saved = await saves.save(withProgress, undefined, 9_000);
    expect(saved.ok).toBe(true);

    const loaded = await saves.load();
    expect(loaded.ok).toBe(true);
    if (loaded.ok && loaded.value) {
      expect(loaded.value.resources.particles).toBe(42n);
      expect(loaded.value.gather.clickPowerLevel).toBe(3);
      expect(loaded.value.meta.lastActiveAt).toBe(9_000);
    }
  });

  it("rejects corrupt envelopes on load", async () => {
    const storage = createMemorySaveStorage({
      slot_local_1: { schemaVersion: 1, savedAt: 1, payload: { broken: true } },
    });
    const saves = createSaveStore(storage);
    const loaded = await saves.load();
    expect(loaded.ok).toBe(false);
  });

  it("boots session, gathers, autosaves, and reloads offline progress", async () => {
    const storage = createMemorySaveStorage();
    let now = 100_000;

    const first = createGameSession({
      storage,
      now: () => now,
      autosaveMs: 60_000,
      useIndexedDb: false,
      connectNetwork: false,
    });
    sessions.push(first);

    await first.boot();
    first.resources.addMnemeFragmente(10);
    expect(first.idle.buyLevel(1)).toBe(true);
    first.gather.gather(now);
    expect(await first.saveNow()).toBe(true);
    first.destroy();

    now = 100_000 + 10_000;
    const second = createGameSession({
      storage,
      now: () => now,
      autosaveMs: 60_000,
      useIndexedDb: false,
      connectNetwork: false,
    });
    sessions.push(second);

    const report = await second.boot();
    expect(report?.mnemeGained).toBeGreaterThan(0);
    expect(second.store.getState().resources.particles).toBe(1n);
    expect(second.store.getState().idleGenerators.gedankenArchiv.level).toBe(1);
  });

  it("serializes payload compatible with envelope helper", () => {
    const payload = gameStateToPayload(createInitialGameState(1));
    const envelope = createSaveEnvelope(payload, 1);
    expect(envelope.schemaVersion).toBe(1);
    expect(envelope.payload).toEqual(payload);
  });
});
