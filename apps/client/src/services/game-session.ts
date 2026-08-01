import {
  createLogger,
  createStore,
  createTicker,
  type Store,
  type Ticker,
  type TickPayload,
} from "@adv/core";
import { CONFIG } from "@adv/sim";

import {
  createInitialGameState,
  type GameState,
  type OfflineReport,
} from "../state/game-state";
import { createGatherService, type GatherService } from "./gather-service";
import { createHeroService, type HeroService } from "./hero-service";
import { createIdleService, type IdleService } from "./idle-service";
import { createI18nService, type I18nService } from "./i18n-service";
import {
  createOfflineProgressService,
  type OfflineProgressService,
} from "./offline-progress-service";
import { createResourceService, type ResourceService } from "./resource-service";
import {
  createIndexedDbSaveStorage,
  createMemorySaveStorage,
  type SaveStorage,
} from "./save-storage";
import { createSaveStore, type SaveStore } from "./save-store";
import { createStoryService, type StoryService } from "./story-service";

const log = createLogger("game-session");

export type GameSession = {
  readonly store: Store<GameState>;
  readonly resources: ResourceService;
  readonly idle: IdleService;
  readonly gather: GatherService;
  readonly offline: OfflineProgressService;
  readonly hero: HeroService;
  readonly story: StoryService;
  readonly i18n: I18nService;
  readonly saves: SaveStore;
  boot(): Promise<OfflineReport | null>;
  saveNow(): Promise<boolean>;
  dismissOfflineReport(): void;
  destroy(): void;
};

export type GameSessionOptions = {
  readonly storage?: SaveStorage;
  readonly now?: () => number;
  readonly autosaveMs?: number;
  readonly useIndexedDb?: boolean;
};

function defaultStorage(useIndexedDb: boolean): SaveStorage {
  if (useIndexedDb && typeof indexedDB !== "undefined") {
    return createIndexedDbSaveStorage();
  }
  return createMemorySaveStorage();
}

export function createGameSession(
  options: GameSessionOptions = {},
): GameSession {
  const nowFn = options.now ?? Date.now;
  const storage =
    options.storage ?? defaultStorage(options.useIndexedDb !== false);
  const store = createStore<GameState>({
    initialState: createInitialGameState(nowFn()),
  });
  const resources = createResourceService(store);
  const idle = createIdleService(store, resources);
  const gather = createGatherService(store, resources);
  const offline = createOfflineProgressService(store, resources);
  const hero = createHeroService(store);
  const story = createStoryService(store, hero);
  const i18n = createI18nService(store);
  const saves = createSaveStore(storage);

  let ticker: Ticker | null = null;
  let autosaveTimer: ReturnType<typeof setInterval> | null = null;
  let destroyed = false;

  const touchActive = (timestamp: number): void => {
    store.setState((prev) => ({
      ...prev,
      meta: { ...prev.meta, lastActiveAt: timestamp },
    }));
  };

  const saveNow = async (): Promise<boolean> => {
    if (destroyed) {
      return false;
    }
    const stamp = nowFn();
    const result = await saves.save(store.getState(), undefined, stamp);
    if (!result.ok) {
      log.warn(`autosave failed: ${result.error}`);
      return false;
    }
    store.setState((prev) => ({
      ...prev,
      meta: { ...prev.meta, lastActiveAt: stamp, lastSavedAt: stamp },
    }));
    return true;
  };

  return {
    store,
    resources,
    idle,
    gather,
    offline,
    hero,
    story,
    i18n,
    saves,

    async boot() {
      const loaded = await saves.load();
      if (!loaded.ok) {
        log.warn(`load failed, starting fresh: ${loaded.error}`);
      } else if (loaded.value) {
        store.replace(loaded.value);
      }

      const report = offline.applyOnBoot(nowFn());

      const tickerOptions = {
        logicIntervalMs: CONFIG.SYSTEM.LOGIC_TICK_MS,
        slowIntervalMs: CONFIG.SYSTEM.SLOW_TICK_MS,
        now: nowFn,
        onSlowTick: (payload: TickPayload) => {
          idle.processTick(payload.deltaMs);
          story.processBattleTick(payload.deltaMs);
          touchActive(payload.timestamp);
        },
        ...(typeof requestAnimationFrame === "function"
          ? {
              scheduleFrame: (cb: (timestamp: number) => void) =>
                requestAnimationFrame(cb),
            }
          : {}),
        ...(typeof cancelAnimationFrame === "function"
          ? {
              cancelFrame: (id: number) => {
                cancelAnimationFrame(id);
              },
            }
          : {}),
      };
      ticker = createTicker(tickerOptions);
      ticker.start();

      const autosaveMs = options.autosaveMs ?? CONFIG.SYSTEM.AUTOSAVE_INTERVAL_MS;
      autosaveTimer = setInterval(() => {
        void saveNow();
      }, autosaveMs);

      store.setState((prev) => ({
        ...prev,
        meta: { ...prev.meta, bootstrapped: true },
      }));

      return report;
    },

    saveNow,

    dismissOfflineReport() {
      store.setState((prev) => ({
        ...prev,
        meta: { ...prev.meta, offlineReport: null },
      }));
    },

    destroy() {
      destroyed = true;
      ticker?.destroy();
      ticker = null;
      if (autosaveTimer !== null) {
        clearInterval(autosaveTimer);
        autosaveTimer = null;
      }
      store.destroy();
    },
  };
}
