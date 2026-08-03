import {
  STORY_FIGHTS_INTRO_CROSSFADE_MS,
  STORY_FIGHTS_INTRO_FRAMES,
  type Locale,
} from "@adv/content";
import { createPortal } from "preact/compat";
import { useEffect, useState } from "preact/hooks";

type Props = {
  readonly locale: Locale;
  readonly skipLabel: string;
  readonly onDone: () => void;
};

function frameArtUrl(src: string): string {
  const path = src.replace(/^\//, "");
  return `${import.meta.env.BASE_URL}${path}`;
}

function pcFrameHost(): HTMLElement | null {
  if (typeof document === "undefined") {
    return null;
  }
  return document.querySelector('[data-testid="pc-frame"]');
}

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
  const artUrl = frameArtUrl(frame.src);

  const overlay = (
    <section
      class="intro"
      role="dialog"
      aria-modal="true"
      aria-label={lines[0]}
      data-testid="story-intro"
    >
      <div
        key={frame.id}
        class="intro__art"
        style={{
          backgroundImage: `url("${artUrl}")`,
          animationDuration: `${String(STORY_FIGHTS_INTRO_CROSSFADE_MS)}ms`,
        }}
        aria-hidden="true"
      />
      <div class="intro__veil" aria-hidden="true" />
      <div class="intro__copy" key={`copy-${frame.id}`}>
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

  // Portal onto the 1920×1080 pc-frame so stage overflow cannot clip the
  // cinematic (matches studio #intro-container covering the full game surface).
  const host = pcFrameHost();
  return host ? createPortal(overlay, host) : overlay;
}
