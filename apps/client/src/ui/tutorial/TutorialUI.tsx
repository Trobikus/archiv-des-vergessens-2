import type { TutorialStep } from "@adv/content";
import { useEffect, useState } from "preact/hooks";

import type { GameSession } from "../../services/game-session";
import { useStore } from "../useStore";

type Props = {
  readonly session: GameSession;
};

type ActiveStep = {
  readonly index: number;
  readonly step: TutorialStep;
};

export function TutorialUI({ session }: Props) {
  const tutorialState = useStore(session.store).tutorial;
  const [active, setActive] = useState<ActiveStep | null>(null);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const onStep = (data: unknown): void => {
      const payload = data as { index?: number; step?: TutorialStep };
      if (payload.step && payload.index !== undefined) {
        setActive({ index: payload.index, step: payload.step });
      }
    };
    const onEnd = (): void => {
      setActive(null);
      setHighlightRect(null);
    };
    const stepSub = session.eventBus.subscribe("tutorial:step", onStep);
    const endSub = session.eventBus.subscribe("tutorial:end", onEnd);
    if (!tutorialState.finished) {
      session.tutorial.maybeAutoStart();
      const current = session.tutorial.getCurrentStep();
      const index = session.store.getState().tutorial.step;
      if (current && index >= 0) {
        setActive({ index, step: current });
      }
    }
    return () => {
      session.eventBus.unsubscribe(stepSub);
      session.eventBus.unsubscribe(endSub);
    };
  }, [
    session,
    tutorialState.finished,
    tutorialState.step,
    tutorialState.activeGuide,
  ]);

  useEffect(() => {
    if (!active?.step.target) {
      setHighlightRect(null);
      return;
    }
    const update = (): void => {
      const el = document.querySelector(active.step.target as string);
      setHighlightRect(el?.getBoundingClientRect() ?? null);
    };
    update();
    const id = setInterval(update, 250);
    return () => {
      clearInterval(id);
    };
  }, [active]);

  if (tutorialState.finished || !active) {
    return null;
  }

  const { step } = active;

  return (
    <div class="tutorial-overlay" data-testid="tutorial-overlay">
      {highlightRect ? (
        <div
          class="tutorial-overlay__highlight"
          style={{
            top: `${String(highlightRect.top - 4)}px`,
            left: `${String(highlightRect.left - 4)}px`,
            width: `${String(highlightRect.width + 8)}px`,
            height: `${String(highlightRect.height + 8)}px`,
          }}
        />
      ) : null}
      <div class="tutorial-overlay__card glass-panel">
        {step.title ? (
          <h3 class="glow-text">{step.title}</h3>
        ) : null}
        <p
          class="tutorial-overlay__text"
          dangerouslySetInnerHTML={{ __html: step.text }}
        />
        <div class="game__actions">
          {step.action === "next" ||
          step.action === "finish" ||
          step.action === "wait_event" ? (
            <button
              type="button"
              class="game__btn game__btn--primary"
              data-testid="tutorial-next"
              onClick={() => {
                if (step.action === "finish") {
                  session.tutorial.finish();
                } else {
                  session.tutorial.nextStep();
                }
              }}
            >
              {step.action === "finish" ? "Abschließen" : "Weiter"}
            </button>
          ) : null}
          <button
            type="button"
            class="game__btn game__btn--ghost"
            data-testid="tutorial-skip"
            onClick={() => {
              session.tutorial.skip();
            }}
          >
            Überspringen
          </button>
        </div>
      </div>
    </div>
  );
}
