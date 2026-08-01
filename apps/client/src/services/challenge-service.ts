import { CHALLENGES_DATA, type ChallengeDefinition } from "@adv/content";
import type { EventBus, Store } from "@adv/core";

import type { GameState } from "../state/game-state";
import type { HeroService } from "./hero-service";

export type ChallengeResult = {
  readonly success: boolean;
  readonly message: string;
};

export type ChallengeService = {
  getChallenges(): ChallengeDefinition[];
  getChallenge(id: string): ChallengeDefinition | null;
  startChallenge(challengeId: string): ChallengeResult;
  abortChallenge(): ChallengeResult;
  getPermanentBonuses(): {
    readonly pacifistRing: boolean;
    readonly droughtBonus: boolean;
  };
  checkChallengeProgress(): void;
};

export function createChallengeService(
  store: Store<GameState>,
  eventBus: EventBus,
  _hero: HeroService,
): ChallengeService {
  const completeChallenge = (challengeId: string): void => {
    if (!(challengeId in CHALLENGES_DATA)) {
      return;
    }

    store.setState((prev) => ({
      ...prev,
      challenges: {
        ...prev.challenges,
        active: null,
        completed: [...prev.challenges.completed, challengeId],
        pacifistUnlocked:
          challengeId === "pacifist" ? true : prev.challenges.pacifistUnlocked,
        droughtBonus:
          challengeId === "drought" ? true : prev.challenges.droughtBonus,
      },
    }));

    eventBus.publish("challenge:completed", { challengeId });
  };

  const service: ChallengeService = {
    getChallenges() {
      return Object.values(CHALLENGES_DATA);
    },

    getChallenge(id) {
      return id in CHALLENGES_DATA
        ? CHALLENGES_DATA[id as keyof typeof CHALLENGES_DATA]
        : null;
    },

    startChallenge(challengeId) {
      if (!(challengeId in CHALLENGES_DATA)) {
        return { success: false, message: "Challenge not found." };
      }
      const challenge =
        CHALLENGES_DATA[challengeId as keyof typeof CHALLENGES_DATA];

      const state = store.getState();
      if (state.challenges.active) {
        return { success: false, message: "A challenge is already active." };
      }
      if (state.challenges.completed.includes(challengeId)) {
        return { success: false, message: "Challenge already completed." };
      }
      if (state.hero.prestige.bossProgress > 0) {
        return {
          success: false,
          message: "Challenges can only start at fresh prestige.",
        };
      }

      store.setState((prev) => ({
        ...prev,
        challenges: { ...prev.challenges, active: challengeId },
      }));
      eventBus.publish("challenge:started", { challengeId });
      return { success: true, message: `Started ${challenge.name}.` };
    },

    abortChallenge() {
      if (!store.getState().challenges.active) {
        return { success: false, message: "No active challenge." };
      }
      store.setState((prev) => ({
        ...prev,
        challenges: { ...prev.challenges, active: null },
      }));
      eventBus.publish("challenge:aborted", {});
      return { success: true, message: "Challenge aborted." };
    },

    getPermanentBonuses() {
      const state = store.getState();
      return {
        pacifistRing: state.challenges.pacifistUnlocked,
        droughtBonus: state.challenges.droughtBonus,
      };
    },

    checkChallengeProgress() {
      const activeId = store.getState().challenges.active;
      if (!activeId) {
        return;
      }
      if (!(activeId in CHALLENGES_DATA)) {
        return;
      }
      const challenge =
        CHALLENGES_DATA[activeId as keyof typeof CHALLENGES_DATA];
      const bossProgress = store.getState().hero.prestige.bossProgress;
      const currentChapter = Math.floor(bossProgress / 10) + 1;
      if (currentChapter >= challenge.targetChapter) {
        completeChallenge(activeId);
      }
    },
  };

  eventBus.subscribe("story:bossDefeated", () => {
    service.checkChallengeProgress();
  });

  return service;
}
