import {
  TUTORIAL_GUIDE_IDS,
  TUTORIAL_GUIDES,
  TUTORIAL_MILESTONES,
  type TutorialGuideId,
  type TutorialStep,
} from "@adv/content";
import type { EventBus, Store } from "@adv/core";

import type { GameState } from "../state/game-state";

/** v2 DOM selectors mapped from v1 tutorial targets. */
const V2_TARGET_OVERRIDES: Record<string, string> = {
  "#hub-archive": '[data-testid="tab-idle"]',
  "#manual-gather-btn": '[data-testid="gather-click"]',
  "#upgrade-click-btn": '[data-testid="gather-upgrade"]',
  "#back-to-hub-btn": '[data-testid="tab-idle"]',
  "#hub-hero": '[data-testid="tab-hero"]',
  "#hero-close": '[data-testid="tab-idle"]',
  "#hub-story": '[data-testid="tab-story"]',
  "#story-close": '[data-testid="tab-idle"]',
};

function isGuideId(value: string): value is TutorialGuideId {
  return (TUTORIAL_GUIDE_IDS as readonly string[]).includes(value);
}

export type TutorialService = {
  getSteps(): readonly TutorialStep[];
  getCurrentStep(): TutorialStep | null;
  getActiveGuideId(): TutorialGuideId | null;
  isActive(): boolean;
  startGuide(guideId: TutorialGuideId): void;
  startStep(index: number): void;
  nextStep(): void;
  finish(): void;
  skip(): void;
  maybeAutoStart(): void;
  evaluateMilestones(): void;
  destroy(): void;
};

export function createTutorialService(
  store: Store<GameState>,
  eventBus: EventBus,
): TutorialService {
  let currentIndex = -1;
  let active = false;
  let clickCleanup: (() => void) | null = null;
  let storeSub: (() => void) | null = null;
  const subscriptions: number[] = [];

  const mapStep = (step: TutorialStep): TutorialStep => {
    if (!step.target) {
      return step;
    }
    const override = V2_TARGET_OVERRIDES[step.target];
    return override ? { ...step, target: override } : step;
  };

  const resolveGuideId = (): TutorialGuideId | null => {
    const guideId = store.getState().tutorial.activeGuide;
    return guideId && isGuideId(guideId) ? guideId : null;
  };

  const guideSteps = (guideId: TutorialGuideId): readonly TutorialStep[] =>
    TUTORIAL_GUIDES[guideId].steps.map((step) => mapStep(step));

  const clearHooks = (): void => {
    clickCleanup?.();
    clickCleanup = null;
    storeSub?.();
    storeSub = null;
  };

  const isCompleted = (guideId: TutorialGuideId): boolean => {
    const { tutorial } = store.getState();
    if (tutorial.finished) {
      return true;
    }
    return tutorial.completedGuides.includes(guideId);
  };

  const publishStep = (index: number, step: TutorialStep): void => {
    eventBus.publish("tutorial:step", { index, step });
  };

  const setupHooks = (index: number, step: TutorialStep): void => {
    clearHooks();

    if (step.target && step.action === "click_target") {
      const selector = step.target;
      const interval = setInterval(() => {
        const el = document.querySelector(selector);
        if (!el) {
          return;
        }
        clearInterval(interval);
        const onClick = (): void => {
          el.removeEventListener("click", onClick);
          setTimeout(() => {
            if (currentIndex === index) {
              service.nextStep();
            }
          }, 100);
        };
        el.addEventListener("click", onClick);
        clickCleanup = () => {
          el.removeEventListener("click", onClick);
        };
      }, 100);
      setTimeout(() => {
        clearInterval(interval);
      }, 10_000);
    }

    if (step.action === "wait_event" && step.target?.includes("gather-click")) {
      storeSub = store.subscribe((state) => {
        if (currentIndex !== index) {
          return;
        }
        if (state.resources.particles >= 50n) {
          service.nextStep();
        }
      });
    }
  };

  const completeActiveGuide = (): void => {
    clearHooks();
    const { tutorial } = store.getState();
    const guideId = tutorial.activeGuide;
    const completedGuides =
      guideId && !tutorial.completedGuides.includes(guideId)
        ? [...tutorial.completedGuides, guideId]
        : [...tutorial.completedGuides];
    const finished = TUTORIAL_GUIDE_IDS.every((id) =>
      completedGuides.includes(id),
    );
    active = false;
    currentIndex = -1;
    store.setState((prev) => ({
      ...prev,
      tutorial: {
        step: -1,
        finished,
        activeGuide: null,
        completedGuides,
      },
    }));
    eventBus.publish("tutorial:end", {});
    service.evaluateMilestones();
  };

  const milestoneUnlocked = (
    milestone: (typeof TUTORIAL_MILESTONES)[number],
    state: GameState,
  ): boolean => {
    if (milestone.trigger === "first_enter") {
      return state.hero.created;
    }
    if (milestone.trigger === "boss") {
      return state.hero.prestige.bossProgress >= milestone.minBossProgress;
    }
    return state.quests.mainIndex >= milestone.minMainIndex;
  };

  const service: TutorialService = {
    getSteps() {
      const guideId = resolveGuideId();
      return guideId ? guideSteps(guideId) : [];
    },

    getCurrentStep() {
      if (!active || currentIndex < 0) {
        return null;
      }
      return this.getSteps()[currentIndex] ?? null;
    },

    getActiveGuideId() {
      return resolveGuideId();
    },

    isActive() {
      return active;
    },

    startGuide(guideId) {
      if (isCompleted(guideId) || active) {
        return;
      }
      store.setState((prev) => ({
        ...prev,
        tutorial: {
          ...prev.tutorial,
          activeGuide: guideId,
          finished: false,
          step: 0,
        },
      }));
      this.startStep(0);
    },

    startStep(index) {
      const guideId = resolveGuideId();
      if (!guideId) {
        return;
      }
      const steps = guideSteps(guideId);
      if (index < 0 || index >= steps.length) {
        completeActiveGuide();
        return;
      }
      active = true;
      currentIndex = index;
      store.setState((prev) => ({
        ...prev,
        tutorial: {
          ...prev.tutorial,
          step: index,
          finished: false,
          activeGuide: guideId,
        },
      }));
      const step = steps[index];
      if (step) {
        publishStep(index, step);
        setupHooks(index, step);
      }
    },

    nextStep() {
      clearHooks();
      const next = currentIndex + 1;
      const steps = this.getSteps();
      if (next >= steps.length) {
        this.finish();
        return;
      }
      this.startStep(next);
    },

    finish() {
      if (!resolveGuideId()) {
        return;
      }
      completeActiveGuide();
    },

    skip() {
      if (!resolveGuideId()) {
        return;
      }
      completeActiveGuide();
    },

    maybeAutoStart() {
      const { tutorial } = store.getState();
      if (tutorial.finished) {
        return;
      }
      if (tutorial.activeGuide && isGuideId(tutorial.activeGuide)) {
        const index = Math.max(0, tutorial.step);
        if (!active || currentIndex !== index) {
          this.startStep(index);
          return;
        }
        const step = this.getSteps()[currentIndex];
        if (step) {
          publishStep(currentIndex, step);
        }
        return;
      }
      this.evaluateMilestones();
    },

    evaluateMilestones() {
      const state = store.getState();
      if (state.tutorial.finished || active || state.tutorial.activeGuide) {
        return;
      }
      for (const milestone of TUTORIAL_MILESTONES) {
        if (isCompleted(milestone.guideId)) {
          continue;
        }
        if (!milestoneUnlocked(milestone, state)) {
          continue;
        }
        this.startGuide(milestone.guideId);
        return;
      }
    },

    destroy() {
      clearHooks();
      for (const id of subscriptions) {
        eventBus.unsubscribe(id);
      }
      subscriptions.length = 0;
      active = false;
      currentIndex = -1;
    },
  };

  subscriptions.push(
    eventBus.subscribe("story:bossDefeated", () => {
      service.evaluateMilestones();
    }),
  );
  subscriptions.push(
    eventBus.subscribe("quest:updated", () => {
      service.evaluateMilestones();
    }),
  );
  subscriptions.push(
    eventBus.subscribe("quest:completed", () => {
      service.evaluateMilestones();
    }),
  );

  return service;
}
