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
import { createAuthService, type AuthService } from "./auth-service";
import {
  createBootProgressReporter,
  type BootProgressListener,
} from "./boot-progress";
import {
  createCloudSyncService,
  type CloudSyncService,
} from "./cloud-sync-service";
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
import { createWsClient, type WsClient } from "./ws-client";

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
  readonly ws: WsClient;
  readonly auth: AuthService;
  readonly cloud: CloudSyncService;
  boot(onProgress?: BootProgressListener): Promise<OfflineReport | null>;
  saveNow(): Promise<boolean>;
  resetProgress(): Promise<void>;
  quitGame(): Promise<void>;
  dismissOfflineReport(): void;
  destroy(): void;
};

export type GameSessionOptions = {
  readonly storage?: SaveStorage;
  readonly now?: () => number;
  readonly autosaveMs?: number;
  readonly useIndexedDb?: boolean;
  readonly ws?: WsClient;
  readonly connectNetwork?: boolean;
};

function defaultStorage(useIndexedDb: boolean): SaveStorage {
  if (useIndexedDb && typeof indexedDB !== "undefined") {
    return createIndexedDbSaveStorage();
  }
  return createMemorySaveStorage();
}

function yieldToUi(): Promise<void> {
  // Prefer setTimeout over rAF so boot progress works under test rAF mocks
  // and still lets the UI paint between steps in the browser.
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
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
  const ws = options.ws ?? createWsClient();
  const auth = createAuthService({ ws });
  const cloud = createCloudSyncService({ ws, auth, storage });

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
    void cloud.push(store.getState(), stamp);
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
    ws,
    auth,
    cloud,

    async boot(onProgress) {
      const progress = createBootProgressReporter(onProgress);
      const step = async (id: Parameters<typeof progress.report>[0]): Promise<void> => {
        progress.report(id);
        await yieldToUi();
      };

      await step("core");

      await step("fonts");
      if (typeof document !== "undefined" && "fonts" in document) {
        try {
          await document.fonts.ready;
        } catch {
          // Font loading is best-effort; continue boot.
        }
      }

      if (options.connectNetwork !== false) {
        await step("network");
        await step("auth");
        await auth.boot();
      } else {
        await step("network");
        await step("auth");
      }

      await step("save");
      const loaded = await saves.load();
      if (!loaded.ok) {
        log.warn(`load failed, starting fresh: ${loaded.error}`);
      } else if (loaded.value) {
        store.replace(loaded.value);
      }

      await step("cloud");
      if (auth.isRegistered()) {
        const merged = await cloud.pullAndMerge(store.getState());
        if (merged.ok) {
          store.replace(merged.value);
        }
        await cloud.flushPending();
      }

      await step("offline");
      const report = offline.applyOnBoot(nowFn());

      await step("systems");
      // rAF only schedules frames; timestamps must stay on the same clock as
      // `now` (Date.now). Passing rAF's performance.now values here previously
      // made every slow delta negative, so idle income and autofight never ran.
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
                requestAnimationFrame(() => {
                  cb(nowFn());
                }),
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

      await step("ready");
      return report;
    },

    saveNow,

    async resetProgress() {
      const locale = store.getState().settings.locale;
      const next = createInitialGameState(nowFn());
      store.replace({
        ...next,
        settings: { ...next.settings, locale },
      });
      await saveNow();
    },

    async quitGame() {
      await saveNow();
      const win = window as Window & {
        __TAURI__?: { core?: { invoke?: (cmd: string) => Promise<unknown> } };
        electronAPI?: { sendQuitReady?: () => void };
      };
      if (win.electronAPI?.sendQuitReady) {
        win.electronAPI.sendQuitReady();
        return;
      }
      if (win.__TAURI__?.core?.invoke) {
        try {
          await win.__TAURI__.core.invoke("quit_app");
          return;
        } catch {
          // fall through to window.close
        }
      }
      window.close();
    },

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
      cloud.destroy();
      auth.destroy();
      ws.close();
      store.destroy();
    },
  };
}
