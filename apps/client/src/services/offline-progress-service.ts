import type { Store } from "@adv/core";
import { CONFIG, calculateOfflineProgress, calculateYieldPerSecond } from "@adv/sim";

import type { GameState, OfflineReport } from "../state/game-state";
import type { ResourceService } from "./resource-service";

const EWIGE_MNEME_BONUS = 0.1;

export type OfflineProgressService = {
  applyOnBoot(now?: number): OfflineReport | null;
};

function estimateClanOffline(
  state: GameState,
  clampedSeconds: number,
): { particles: number; relics: number } {
  if (clampedSeconds <= 0) {
    return { particles: 0, relics: 0 };
  }
  const elapsedMs = clampedSeconds * 1000;
  const prestigeBonus = Number(state.resources.ewigeMneme) * 2;
  const libraryBonus = state.library.upgrades.clan_boost * 0.05;
  let particles = 0;
  let relics = 0;

  for (const member of state.clan.members) {
    if (state.clan.expeditionStatus[String(member.id)] === true) {
      continue;
    }
    let rate = member.baseCollectRate * Math.pow(1.05, member.level - 1);
    rate *= 1 + prestigeBonus / 100;
    rate *= 1 + libraryBonus;
    const cycles = (rate * elapsedMs) / CONFIG.CLAN.TICK_RATE_MS;
    if (cycles <= 0) {
      continue;
    }
    if (member.role === "collector") {
      particles += cycles;
    } else if (member.role === "weaver") {
      relics += cycles * 0.1;
      particles += cycles * 1.8;
    } else if (member.role === "guardian") {
      particles += cycles * 2.85;
    } else if (member.role === "archivist") {
      relics += cycles * 0.15;
      particles += cycles * 3.4;
    } else {
      relics += cycles * 0.2;
      particles += cycles * 4.2;
    }
  }

  return {
    particles: Math.floor(particles),
    relics: Math.floor(relics),
  };
}

export function createOfflineProgressService(
  store: Store<GameState>,
  resources: ResourceService,
): OfflineProgressService {
  return {
    applyOnBoot(now = Date.now()) {
      const state = store.getState();
      const gen = state.idleGenerators.gedankenArchiv;
      const prestigeMult =
        1 + Number(state.resources.ewigeMneme) * EWIGE_MNEME_BONUS;
      const yieldPerSec = calculateYieldPerSecond(
        gen.baseYield,
        gen.level,
        gen.upgrades.focusBonus,
        prestigeMult,
      );

      const progress = calculateOfflineProgress(
        state.meta.lastActiveAt,
        now,
        yieldPerSec,
        CONFIG.SYSTEM.MAX_OFFLINE_MS / 1000,
      );

      const clan = estimateClanOffline(state, progress.clampedSeconds);
      if (clan.particles > 0) {
        resources.addParticles(clan.particles);
      }
      if (clan.relics > 0) {
        resources.addRelics(clan.relics);
      }

      let report: OfflineReport | null = null;
      if (progress.totalYield > 0 || clan.particles > 0 || clan.relics > 0) {
        if (progress.totalYield > 0) {
          resources.addMnemeFragmente(progress.totalYield);
        }
        report = {
          elapsedSeconds: progress.elapsedSeconds,
          clampedSeconds: progress.clampedSeconds,
          mnemeGained: progress.totalYield,
          ...(clan.particles > 0
            ? { clanParticlesGained: clan.particles }
            : {}),
          ...(clan.relics > 0 ? { clanRelicsGained: clan.relics } : {}),
        };
      }

      store.setState((prev) => ({
        ...prev,
        meta: {
          ...prev.meta,
          lastActiveAt: now,
          bootstrapped: true,
          offlineReport: report,
        },
      }));

      return report;
    },
  };
}
