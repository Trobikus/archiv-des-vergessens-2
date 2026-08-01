import type { EventBus, Store } from "@adv/core";
import {
  createDefaultLeaderboardSave,
  validateLeaderboardUpdatePayload,
  WS_EVENTS,
  type LeaderboardEntry,
  type LeaderboardSave,
} from "@adv/protocol";

import type { GameState } from "../state/game-state";
import type { AuthService } from "./auth-service";
import type { WsClient } from "./ws-client";

export type FormattedLeaderboardStats = Readonly<Record<string, string>>;

export type LeaderboardService = {
  getRecords(): LeaderboardSave;
  getFormattedStats(): FormattedLeaderboardStats;
  getGlobalEntries(): readonly LeaderboardEntry[];
  syncFromState(): void;
  submit(): boolean;
  fetch(): boolean;
  markSessionStart(): void;
  addEntry(data: {
    readonly prestige?: number;
    readonly bosses?: number;
    readonly level?: number;
    readonly craftingLevel?: number;
    readonly particles?: number;
  }): void;
  reset(): void;
  destroy(): void;
};

export type LeaderboardServiceOptions = {
  readonly now?: () => number;
  readonly playTimeIntervalMs?: number;
};

function formatSeconds(value: number | null): string {
  if (value === null || !Number.isFinite(value)) {
    return "—";
  }
  return `${String(Math.round(value))}s`;
}

export function createLeaderboardService(
  store: Store<GameState>,
  eventBus: EventBus,
  ws: WsClient,
  auth: AuthService,
  options: LeaderboardServiceOptions = {},
): LeaderboardService {
  const nowFn = options.now ?? Date.now;
  const playTimeIntervalMs = options.playTimeIntervalMs ?? 10_000;
  const unsubs: Array<() => void> = [];
  let globalEntries: LeaderboardEntry[] = [];
  let isUpdating = false;
  let lastParticles = store.getState().resources.totalParticles;
  let lastRelics = store.getState().resources.totalRelics;
  let lastTickTime = nowFn();
  let sessionStartTime = nowFn();
  let battleStartTime: number | null = null;
  let playTimeTimer: ReturnType<typeof setInterval> | null = null;

  const getRecords = (): LeaderboardSave => store.getState().leaderboard;

  const setRecords = (next: LeaderboardSave): void => {
    if (isUpdating) {
      return;
    }
    isUpdating = true;
    try {
      store.setState((prev) => ({ ...prev, leaderboard: next }));
    } finally {
      isUpdating = false;
    }
  };

  const getFormattedStats = (): FormattedLeaderboardStats => {
    const r = getRecords();
    return {
      Prestige: `Stufe ${String(r.highestPrestige)} (${String(r.totalPrestiges)}x)`,
      Bosse: `${String(r.totalBossesDefeated)} besiegt, Kapitel ${String(r.highestChapterReached)}`,
      Held: `Level ${String(r.highestLevel)}`,
      Handwerk: `Stufe ${String(r.highestCraftingLevel)}, ${String(r.totalMasterworksCrafted)} Meisterwerke`,
      "Beste Qualität": `${String(r.highestItemQuality)}%`,
      "Partikel/Sekunde": String(Math.round(r.peakParticlesPerSecond)),
      "Schnellster Boss": formatSeconds(r.fastestBossKill),
      "Schnellstes Prestige": formatSeconds(r.fastestPrestige),
    };
  };

  const submit = (): boolean => {
    if (!auth.isRegistered() || ws.status() !== "open") {
      return false;
    }
    const r = getRecords();
    return ws.send(WS_EVENTS.LEADERBOARD_SUBMIT, {
      prestige: r.highestPrestige,
      bosses: r.totalBossesDefeated,
      level: r.highestLevel,
    });
  };

  const syncFromState = (): void => {
    if (isUpdating) {
      return;
    }
    const state = store.getState();
    const r = { ...state.leaderboard };
    let changed = false;

    const prestigeLevel = Number(state.resources.ewigeMneme);
    if (prestigeLevel > r.highestPrestige) {
      r.highestPrestige = prestigeLevel;
      changed = true;
    }

    const bosses = state.hero.prestige.bossProgress;
    if (bosses > r.totalBossesDefeated) {
      r.totalBossesDefeated = bosses;
      changed = true;
    }

    const currentChapter = Math.floor(bosses / 10) + 1;
    if (currentChapter > r.highestChapterReached) {
      r.highestChapterReached = currentChapter;
      changed = true;
    }

    if (state.hero.level > r.highestLevel) {
      r.highestLevel = state.hero.level;
      changed = true;
    }

    if (state.crafting.level > r.highestCraftingLevel) {
      r.highestCraftingLevel = state.crafting.level;
      changed = true;
    }

    const totalParticles = Number(state.resources.totalParticles);
    if (totalParticles > r.totalParticlesCollected) {
      r.totalParticlesCollected = totalParticles;
      changed = true;
    }
    const totalRelicsCollected = Number(state.resources.totalRelics);
    if (totalRelicsCollected > r.totalRelicsCollected) {
      r.totalRelicsCollected = totalRelicsCollected;
      changed = true;
    }

    const achievementsUnlocked = Object.values(
      state.achievements.progress,
    ).filter((entry) => entry.achieved).length;
    if (achievementsUnlocked > r.achievementsUnlocked) {
      r.achievementsUnlocked = achievementsUnlocked;
      changed = true;
    }

    const now = nowFn();
    const elapsedSeconds = (now - lastTickTime) / 1000;
    const currentParticles = state.resources.totalParticles;
    const currentRelics = state.resources.totalRelics;
    if (elapsedSeconds >= 1 && lastTickTime > 0) {
      if (currentParticles > lastParticles) {
        const pps = Number(currentParticles - lastParticles) / elapsedSeconds;
        if (pps > r.peakParticlesPerSecond) {
          r.peakParticlesPerSecond = pps;
          changed = true;
        }
      }
      if (currentRelics > lastRelics) {
        const rps = Number(currentRelics - lastRelics) / elapsedSeconds;
        if (rps > r.peakRelicsPerSecond) {
          r.peakRelicsPerSecond = rps;
          changed = true;
        }
      }
    }
    lastParticles = currentParticles;
    lastRelics = currentRelics;
    lastTickTime = now;
    r.lastPlayed = now;

    if (changed) {
      setRecords(r);
      submit();
      eventBus.publish("leaderboard:updated", {
        records: getFormattedStats(),
      });
    }
  };

  unsubs.push(
    ws.on(WS_EVENTS.LEADERBOARD_UPDATE, (payload) => {
      const parsed = validateLeaderboardUpdatePayload(payload);
      if (!parsed.ok) {
        return;
      }
      globalEntries = [...parsed.value.entries];
      eventBus.publish("leaderboard:globalUpdated", globalEntries);
    }),
  );

  const storeUnsub = store.subscribe(() => {
    if (!isUpdating) {
      queueMicrotask(() => {
        syncFromState();
      });
    }
  });
  unsubs.push(storeUnsub);

  const battleStartId = eventBus.subscribe("story:battleStarted", () => {
    battleStartTime = nowFn();
  });
  unsubs.push(() => {
    eventBus.unsubscribe(battleStartId);
  });

  const bossId = eventBus.subscribe("story:bossDefeated", () => {
    if (battleStartTime !== null) {
      const elapsed = (nowFn() - battleStartTime) / 1000;
      const r = { ...getRecords() };
      if (r.fastestBossKill === null || elapsed < r.fastestBossKill) {
        r.fastestBossKill = elapsed;
        setRecords(r);
      }
      battleStartTime = null;
    }
    syncFromState();
    submit();
  });
  unsubs.push(() => {
    eventBus.unsubscribe(bossId);
  });

  const craftId = eventBus.subscribe("crafting:masterwork", () => {
    const r = { ...getRecords() };
    r.totalMasterworksCrafted += 1;
    setRecords(r);
  });
  unsubs.push(() => {
    eventBus.unsubscribe(craftId);
  });

  const expId = eventBus.subscribe("expedition:complete", (data: unknown) => {
    const payload = data as { success?: boolean };
    const r = { ...getRecords() };
    r.totalExpeditions += 1;
    if (payload.success) {
      r.successfulExpeditions += 1;
    }
    setRecords(r);
  });
  unsubs.push(() => {
    eventBus.unsubscribe(expId);
  });

  playTimeTimer = setInterval(() => {
    const now = nowFn();
    const elapsed = (now - sessionStartTime) / 1000;
    sessionStartTime = now;
    const r = { ...getRecords() };
    r.totalPlayTime += elapsed;
    r.lastPlayed = now;
    setRecords(r);
  }, playTimeIntervalMs);

  return {
    getRecords,
    getFormattedStats,
    getGlobalEntries() {
      return globalEntries;
    },
    syncFromState,
    submit,
    fetch() {
      if (ws.status() !== "open") {
        eventBus.publish("leaderboard:globalUpdated", null);
        return false;
      }
      return ws.send(WS_EVENTS.LEADERBOARD_GET, {});
    },
    markSessionStart() {
      sessionStartTime = nowFn();
      lastParticles = store.getState().resources.totalParticles;
      lastRelics = store.getState().resources.totalRelics;
      lastTickTime = nowFn();
      setRecords({
        ...getRecords(),
        sessionCount: getRecords().sessionCount + 1,
        lastPlayed: nowFn(),
      });
    },
    addEntry(data) {
      const r = { ...getRecords() };
      let changed = false;
      if (data.prestige !== undefined && data.prestige > r.highestPrestige) {
        r.highestPrestige = data.prestige;
        changed = true;
      }
      if (data.bosses !== undefined && data.bosses > r.totalBossesDefeated) {
        r.totalBossesDefeated = data.bosses;
        changed = true;
      }
      if (data.bosses !== undefined) {
        const chapter = Math.floor(data.bosses / 10) + 1;
        if (chapter > r.highestChapterReached) {
          r.highestChapterReached = chapter;
          changed = true;
        }
      }
      if (data.level !== undefined && data.level > r.highestLevel) {
        r.highestLevel = data.level;
        changed = true;
      }
      if (
        data.craftingLevel !== undefined &&
        data.craftingLevel > r.highestCraftingLevel
      ) {
        r.highestCraftingLevel = data.craftingLevel;
        changed = true;
      }
      if (
        data.particles !== undefined &&
        data.particles > r.totalParticlesCollected
      ) {
        r.totalParticlesCollected = data.particles;
        changed = true;
      }
      r.lastPlayed = nowFn();
      if (changed) {
        setRecords(r);
        submit();
      }
      eventBus.publish("leaderboard:updated", {
        records: getFormattedStats(),
      });
    },
    reset() {
      setRecords(createDefaultLeaderboardSave(nowFn()));
      submit();
      eventBus.publish("leaderboard:cleared", {});
    },
    destroy() {
      for (const unsub of unsubs) {
        unsub();
      }
      unsubs.length = 0;
      if (playTimeTimer !== null) {
        clearInterval(playTimeTimer);
        playTimeTimer = null;
      }
    },
  };
}
