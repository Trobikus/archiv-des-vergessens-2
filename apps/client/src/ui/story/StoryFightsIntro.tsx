import {
  STORY_FIGHTS_INTRO_FRAMES,
  type Locale,
} from "@adv/content";
import { useEffect, useState } from "preact/hooks";

type Props = {
  readonly locale: Locale;
  readonly skipLabel: string;
  readonly onDone: () => void;
};

/** Fullscreen cinematic overlay shown once on first Story → Fights open. */
export function StoryFightsIntro({ locale, skipLabel, onDone }: Props) {
  const [index, setIndex] = useState(0);
  const frame = STORY_FIGHTS_INTRO_FRAMES[index];

  useEffect(() => {
    if (!frame) {
      onDone();
      return;
    }
    const timer = window.setTimeout(() => {
      if (index >= STORY_FIGHTS_INTRO_FRAMES.length - 1) {
        onDone();
        return;
      }
      setIndex((prev) => prev + 1);
    }, frame.durationMs);
    return () => {
      window.clearTimeout(timer);
    };
    // Intentionally omit onDone: parent passes an inline callback.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- stable intro progression
  }, [frame, index]);

  if (!frame) {
    return null;
  }

  const lines = locale === "en" ? frame.linesEn : frame.linesDe;

  return (
    <section
      class="intro"
      role="dialog"
      aria-modal="true"
      aria-label={lines[0]}
      data-testid="story-intro"
    >
      <div class="intro__veil" aria-hidden="true" />
      <div class="intro__plane" aria-hidden="true" />
      <div class="intro__copy" key={frame.id}>
        {lines.map((line) => (
          <p key={line} class="intro__line">
            {line}
          </p>
        ))}
      </div>
      <button
        type="button"
        class="intro__skip"
        data-testid="skip-intro"
        onClick={onDone}
      >
        {skipLabel}
      </button>
    </section>
  );
}
