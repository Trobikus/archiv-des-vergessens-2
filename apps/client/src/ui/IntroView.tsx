import { useEffect, useRef, useState } from "preact/hooks";

import type { BootProgress } from "../services/boot-progress";
import { startIntroParticles } from "./intro/intro-particles";

type Props = {
  readonly progress: BootProgress;
  readonly ready: boolean;
  readonly locale?: "de" | "en";
  readonly onFinished: () => void;
};

/** Full studio intro runtime before fade-out (matches v1). */
const INTRO_DURATION_MS = 7000;
const FADE_MS = 800;

export function IntroView({
  progress,
  ready,
  locale = "de",
  onFinished,
}: Props) {
  const [opacity, setOpacity] = useState(0);
  const [showLoader, setShowLoader] = useState(true);
  const [exiting, setExiting] = useState(false);
  const containerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const finishedRef = useRef(false);
  const readyRef = useRef(ready);
  const stopParticlesRef = useRef<(() => void) | null>(null);
  const onFinishedRef = useRef(onFinished);

  const label = locale === "en" ? progress.labelEn : progress.labelDe;
  const skipLabel = locale === "en" ? ">>Skip" : ">>Überspringen";

  readyRef.current = ready;
  onFinishedRef.current = onFinished;

  const beginExit = (): void => {
    if (finishedRef.current) {
      return;
    }
    finishedRef.current = true;
    setExiting(true);
    setShowLoader(false);
    stopParticlesRef.current?.();
    stopParticlesRef.current = null;
    setOpacity(0);
    window.setTimeout(() => {
      onFinishedRef.current();
    }, FADE_MS);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) {
      return undefined;
    }

    stopParticlesRef.current = startIntroParticles(canvas, containerRef.current);
    return () => {
      stopParticlesRef.current?.();
      stopParticlesRef.current = null;
    };
  }, []);

  useEffect(() => {
    // Fade in on mount.
    const fadeInId = window.setTimeout(() => {
      setOpacity(1);
    }, 30);

    let pollId: number | null = null;

    const durationId = window.setTimeout(() => {
      if (readyRef.current) {
        beginExit();
        return;
      }
      // Intro visuals finished, but boot is still running — wait for ready.
      pollId = window.setInterval(() => {
        if (readyRef.current) {
          if (pollId !== null) {
            window.clearInterval(pollId);
            pollId = null;
          }
          beginExit();
        }
      }, 50);
    }, INTRO_DURATION_MS);

    return () => {
      window.clearTimeout(fadeInId);
      window.clearTimeout(durationId);
      if (pollId !== null) {
        window.clearInterval(pollId);
      }
    };
    // beginExit is stable enough via refs; mount-once timer.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- full-length intro timer
  }, []);

  useEffect(() => {
    if (!ready || exiting) {
      return;
    }
    // Boot finished before (or during) the full intro: hide loader, offer skip.
    setShowLoader(false);
  }, [ready, exiting]);

  const canSkip = ready && !exiting;

  return (
    <section
      ref={containerRef}
      id="intro-container"
      class="center-layout"
      role="region"
      aria-label="Studio Intro"
      data-testid="intro-view"
      aria-busy={!ready}
      style={{
        display: "flex",
        opacity,
        transition: `opacity ${String(FADE_MS)}ms ease`,
        cursor: "default",
      }}
    >
      {canSkip ? (
        <button
          type="button"
          class="intro-skip-btn"
          data-testid="intro-skip"
          aria-label={skipLabel}
          onClick={(event) => {
            event.stopPropagation();
            beginExit();
          }}
        >
          {skipLabel}
        </button>
      ) : null}

      <canvas
        ref={canvasRef}
        id="intro-particle-canvas"
        aria-hidden="true"
      />
      <div class="intro-fog-layer intro-fog-layer--1" aria-hidden="true" />
      <div class="intro-fog-layer intro-fog-layer--2" aria-hidden="true" />
      <div class="intro-fog-layer intro-fog-layer--3" aria-hidden="true" />
      <div class="intro-rune-ring" aria-hidden="true">
        <svg viewBox="0 0 400 400" class="intro-rune-svg" aria-hidden="true">
          <circle
            cx="200"
            cy="200"
            r="185"
            fill="none"
            stroke="rgba(197,160,89,0.06)"
            stroke-width="1"
          />
          <circle
            cx="200"
            cy="200"
            r="175"
            fill="none"
            stroke="rgba(197,160,89,0.04)"
            stroke-width="0.5"
          />
          <text
            x="200"
            y="22"
            text-anchor="middle"
            fill="rgba(197,160,89,0.25)"
            font-size="11"
            font-family="serif"
            class="intro-rune-glyph"
            style={{ animationDelay: "0s" }}
          >
            ᚠ
          </text>
          <text
            x="352"
            y="80"
            text-anchor="middle"
            fill="rgba(197,160,89,0.25)"
            font-size="11"
            font-family="serif"
            class="intro-rune-glyph"
            style={{ animationDelay: "0.4s" }}
          >
            ᚢ
          </text>
          <text
            x="390"
            y="208"
            text-anchor="middle"
            fill="rgba(197,160,89,0.25)"
            font-size="11"
            font-family="serif"
            class="intro-rune-glyph"
            style={{ animationDelay: "0.8s" }}
          >
            ᚦ
          </text>
          <text
            x="348"
            y="335"
            text-anchor="middle"
            fill="rgba(197,160,89,0.25)"
            font-size="11"
            font-family="serif"
            class="intro-rune-glyph"
            style={{ animationDelay: "1.2s" }}
          >
            ᚨ
          </text>
          <text
            x="200"
            y="393"
            text-anchor="middle"
            fill="rgba(197,160,89,0.25)"
            font-size="11"
            font-family="serif"
            class="intro-rune-glyph"
            style={{ animationDelay: "1.6s" }}
          >
            ᚱ
          </text>
          <text
            x="50"
            y="335"
            text-anchor="middle"
            fill="rgba(197,160,89,0.25)"
            font-size="11"
            font-family="serif"
            class="intro-rune-glyph"
            style={{ animationDelay: "2.0s" }}
          >
            ᚲ
          </text>
          <text
            x="10"
            y="208"
            text-anchor="middle"
            fill="rgba(197,160,89,0.25)"
            font-size="11"
            font-family="serif"
            class="intro-rune-glyph"
            style={{ animationDelay: "2.4s" }}
          >
            ᚷ
          </text>
          <text
            x="52"
            y="80"
            text-anchor="middle"
            fill="rgba(197,160,89,0.25)"
            font-size="11"
            font-family="serif"
            class="intro-rune-glyph"
            style={{ animationDelay: "2.8s" }}
          >
            ᚹ
          </text>
          <polygon
            points="200,42 354,284 46,284"
            fill="none"
            stroke="rgba(197,160,89,0.05)"
            stroke-width="0.8"
          />
          <polygon
            points="200,58 338,278 62,278"
            fill="none"
            stroke="rgba(197,160,89,0.04)"
            stroke-width="0.5"
          />
          <polygon
            points="200,342 62,122 338,122"
            fill="none"
            stroke="rgba(197,160,89,0.04)"
            stroke-width="0.5"
          />
        </svg>
      </div>
      <div class="intro-logo-wrapper">
        <div class="intro-magic-circle" aria-hidden="true" />
        <div class="intro-book-icon" aria-hidden="true">
          <svg viewBox="0 0 100 100" class="intro-svg-book">
            <path
              d="M 50 25 C 38 18 20 22 15 25 L 15 75 C 20 72 38 68 50 75 C 62 68 80 72 85 75 L 85 25 C 80 22 62 18 50 25 Z"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M 50 25 L 50 75"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
            <path
              d="M 22 35 C 30 32 40 34 45 36 M 22 45 C 30 42 40 44 45 46 M 22 55 C 30 52 40 54 45 56"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              opacity="0.6"
            />
            <path
              d="M 78 35 C 70 32 60 34 55 36 M 78 45 C 70 42 60 44 55 46 M 78 55 C 70 52 60 54 55 56"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              opacity="0.6"
            />
            <polygon
              points="50,11 52,17 58,17 53,21 55,27 50,23 45,27 47,21 42,17 48,17"
              fill="#c5a059"
              class="intro-sparkle-star"
            />
          </svg>
        </div>
        <h2 class="intro-title">GRIMOIRE</h2>
        <h3 class="intro-subtitle">INTERACTIVE</h3>
      </div>

      <div
        class={
          showLoader
            ? "intro-loading-bar-container"
            : "intro-loading-bar-container is-hidden"
        }
        aria-hidden={!showLoader}
      >
        <div
          class="intro-loading-bar manual-progress"
          data-testid="intro-progress-bar"
          style={{ width: `${String(progress.pct)}%` }}
        />
        <div
          class="intro-loading-text"
          data-testid="intro-progress-label"
          style={{
            color: "var(--color-gold)",
            fontFamily: "Inter, sans-serif",
            fontSize: "0.7rem",
            letterSpacing: "2px",
            textTransform: "uppercase",
            marginTop: "10px",
            textAlign: "center",
            opacity: label ? 1 : 0,
            transition: "opacity 0.3s ease",
          }}
        >
          {label}
          <span class="intro-loading-step">
            {" "}
            ({progress.step}/{progress.total})
          </span>
        </div>
      </div>
    </section>
  );
}
