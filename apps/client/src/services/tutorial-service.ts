import { TUTORIAL_STEPS, type TutorialStep } from "@adv/content";
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

export type TutorialService = {
  getSteps(): readonly TutorialStep[];
  getCurrentStep(): TutorialStep | null;
  isActive(): boolean;
  startStep(index: number): void;
  nextStep(): void;
  finish(): void;
  skip(): void;
  maybeAutoStart(): void;
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

  const mapStep = (step: TutorialStep): TutorialStep => {
    if (!step.target) {
      return step;
    }
    const override = V2_TARGET_OVERRIDES[step.target];
    return override ? { ...step, target: override } : step;
  };

  const getSteps = (): readonly TutorialStep[] =>
    TUTORIAL_STEPS.map((step) => mapStep(step));

  const clearHooks = (): void => {
    clickCleanup?.();
    clickCleanup = null;
    storeSub?.();
    storeSub = null;
  };

  const publishStep = (index: number): void => {
    const steps = getSteps();
    const step = steps[index];
    if (!step) {
      return;
    }
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

  const service: TutorialService = {
    getSteps,

    getCurrentStep() {
      if (!active || currentIndex < 0) {
        return null;
      }
      return getSteps()[currentIndex] ?? null;
    },

    isActive() {
      return active;
    },

    startStep(index) {
      const steps = getSteps();
      if (index < 0 || index >= steps.length) {
        this.finish();
        return;
      }
      active = true;
      currentIndex = index;
      store.setState((prev) => ({
        ...prev,
        tutorial: { ...prev.tutorial, step: index, finished: false },
      }));
      const step = steps[index];
      if (step) {
        publishStep(index);
        setupHooks(index, step);
      }
    },

    nextStep() {
      clearHooks();
      const next = currentIndex + 1;
      const steps = getSteps();
      if (next >= steps.length) {
        this.finish();
        return;
      }
      this.startStep(next);
    },

    finish() {
      clearHooks();
      active = false;
      currentIndex = -1;
      store.setState((prev) => ({
        ...prev,
        tutorial: { step: -1, finished: true },
      }));
      eventBus.publish("tutorial:end", {});
    },

    skip() {
      this.finish();
    },

    maybeAutoStart() {
      const { tutorial } = store.getState();
      if (tutorial.finished || tutorial.step < 0) {
        return;
      }
      const index = Math.max(0, tutorial.step);
      if (!active || currentIndex !== index) {
        this.startStep(index);
        return;
      }
      // Session/boot may start the tutorial before TutorialUI mounts.
      // Re-emit so late subscribers still receive the current step.
      const step = getSteps()[currentIndex];
      if (step) {
        publishStep(currentIndex);
      }
    },

    destroy() {
      clearHooks();
      active = false;
      currentIndex = -1;
    },
  };

  return service;
}
