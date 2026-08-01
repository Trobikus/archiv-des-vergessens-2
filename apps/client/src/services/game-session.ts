import {
  createEventBus,
  createLogger,
  createStore,
  createTicker,
  type EventBus,
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
import {
  createAccountVaultService,
  type AccountVaultService,
} from "./account-vault-service";
import {
  createAchievementService,
  type AchievementService,
} from "./achievement-service";
import { createAuthService, type AuthService } from "./auth-service";
import {
  createBootProgressReporter,
  type BootProgressListener,
} from "./boot-progress";
import {
  createChallengeService,
  type ChallengeService,
} from "./challenge-service";
import { createChatService, type ChatService } from "./chat-service";
import { createClanService, type ClanService } from "./clan-service";
import {
  createCloudSyncService,
  type CloudSyncService,
} from "./cloud-sync-service";
import {
  createCodexService,
  type CodexService,
} from "./codex-service";
import {
  createCombatAnalyticsService,
  type CombatAnalyticsService,
} from "./combat-analytics-service";
import {
  createCraftingService,
  type CraftingService,
} from "./crafting-service";
import {
  createDailyRewardService,
  type DailyRewardService,
} from "./daily-reward-service";
import { createDialogService, type DialogService } from "./dialog-service";
import { createForgeService, type ForgeService } from "./forge-service";
import { createFriendService, type FriendService } from "./friend-service";
import { createGatherService, type GatherService } from "./gather-service";
import { createHeroService, type HeroService } from "./hero-service";
import { createIdleService, type IdleService } from "./idle-service";
import { createI18nService, type I18nService } from "./i18n-service";
import {
  createLeaderboardService,
  type LeaderboardService,
} from "./leaderboard-service";
import { createLibraryService, type LibraryService } from "./library-service";
import {
  createOfflineProgressService,
  type OfflineProgressService,
} from "./offline-progress-service";
import {
  createRelicHuntService,
  type RelicHuntService,
} from "./relic-hunt-service";
import { createQuestService, type QuestService } from "./quest-service";
import { createResourceService, type ResourceService } from "./resource-service";
import {
  createIndexedDbSaveStorage,
  createMemorySaveStorage,
  type SaveStorage,
} from "./save-storage";
import { createSaveStore, type SaveStore } from "./save-store";
import {
  createStoryBranchService,
  type StoryBranchService,
} from "./story-branch-service";
import { createStoryService, type StoryService } from "./story-service";
import { createTalentService, type TalentService } from "./talent-service";
import {
  createTutorialService,
  type TutorialService,
} from "./tutorial-service";
import { createWsClient, type WsClient } from "./ws-client";

const log = createLogger("game-session");

export type GameSession = {
  readonly store: Store<GameState>;
  readonly eventBus: EventBus;
  readonly resources: ResourceService;
  readonly idle: IdleService;
  readonly gather: GatherService;
  readonly offline: OfflineProgressService;
  readonly hero: HeroService;
  readonly story: StoryService;
  readonly storyBranch: StoryBranchService;
  readonly dialog: DialogService;
  readonly codex: CodexService;
  readonly relicHunt: RelicHuntService;
  readonly accountVault: AccountVaultService;
  readonly combatAnalytics: CombatAnalyticsService;
  readonly tutorial: TutorialService;
  readonly quests: QuestService;
  readonly achievements: AchievementService;
  readonly dailyRewards: DailyRewardService;
  readonly forge: ForgeService;
  readonly crafting: CraftingService;
  readonly library: LibraryService;
  readonly talents: TalentService;
  readonly challenges: ChallengeService;
  readonly chat: ChatService;
  readonly friends: FriendService;
  readonly clan: ClanService;
  readonly leaderboard: LeaderboardService;
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
  const eventBus = createEventBus();
  const resources = createResourceService(store);
  const library = createLibraryService(store, eventBus, resources);
  const idle = createIdleService(store, resources);
  const gather = createGatherService(store, resources, library, {
    onGather: () => {
      eventBus.publish("quest:manualGather", {});
    },
  });
  const offline = createOfflineProgressService(store, resources);
  const hero = createHeroService(store);
  const forge = createForgeService(store, eventBus, resources, hero, library);
  const crafting = createCraftingService(
    store,
    eventBus,
    resources,
    hero,
    forge,
    library,
  );
  const quests = createQuestService(store, eventBus, resources, hero);
  const achievements = createAchievementService(
    store,
    eventBus,
    resources,
    hero,
  );
  const dailyRewards = createDailyRewardService(
    store,
    eventBus,
    resources,
    hero,
  );
  const talents = createTalentService(store, eventBus);
  const challenges = createChallengeService(store, eventBus, hero);
  const combatAnalytics = createCombatAnalyticsService(eventBus);
  const story = createStoryService(store, hero, {
    eventBus,
    combatAnalytics,
  });
  const storyBranch = createStoryBranchService(store, eventBus, hero);
  const dialog = createDialogService(eventBus);
  const codex = createCodexService(store, eventBus);
  const relicHunt = createRelicHuntService(store, eventBus, resources, hero);
  const ws = options.ws ?? createWsClient();
  const auth = createAuthService({ ws });
  const accountVault = createAccountVaultService(store, eventBus, auth);
  const tutorial = createTutorialService(store, eventBus);
  const friends = createFriendService(store, eventBus, { now: nowFn });
  const clan = createClanService(store, eventBus, resources, library);
  const chat = createChatService(store, eventBus, ws);
  const leaderboard = createLeaderboardService(store, eventBus, ws, auth, {
    now: nowFn,
  });
  const i18n = createI18nService(store);
  const saves = createSaveStore(storage);
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
    eventBus,
    resources,
    idle,
    gather,
    offline,
    hero,
    story,
    storyBranch,
    dialog,
    codex,
    relicHunt,
    accountVault,
    combatAnalytics,
    tutorial,
    quests,
    achievements,
    dailyRewards,
    forge,
    crafting,
    library,
    talents,
    challenges,
    chat,
    friends,
    clan,
    leaderboard,
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
      quests.checkDailyReset();
      achievements.checkProgress();
      talents.syncPointsFromHeroLevel();
      leaderboard.markSessionStart();
      leaderboard.syncFromState();
      if (ws.status() === "open") {
        if (auth.isRegistered()) {
          leaderboard.submit();
        }
        chat.getHistory();
      }

      const tickerOptions = {
        logicIntervalMs: CONFIG.SYSTEM.LOGIC_TICK_MS,
        slowIntervalMs: CONFIG.SYSTEM.SLOW_TICK_MS,
        now: nowFn,
        onSlowTick: (payload: TickPayload) => {
          idle.processTick(payload.deltaMs);
          story.processBattleTick(payload.deltaMs);
          clan.processTick(payload.deltaMs);
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

      const settingsAutosave = store.getState().settings.autosaveMs;
      const autosaveMs = options.autosaveMs ?? settingsAutosave;
      autosaveTimer = setInterval(() => {
        void saveNow();
      }, autosaveMs);

      if (!store.getState().tutorial.finished) {
        tutorial.maybeAutoStart();
      }

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
      tutorial.destroy();
      codex.destroy();
      storyBranch.destroy();
      dialog.destroy();
      accountVault.destroy();
      combatAnalytics.destroy();
      chat.destroy();
      friends.destroy();
      clan.destroy();
      leaderboard.destroy();
      eventBus.destroy();
      cloud.destroy();
      auth.destroy();
      ws.close();
      store.destroy();
    },
  };
}
