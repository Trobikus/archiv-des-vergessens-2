import type { GameSession } from "../services/game-session";
import { AccountBadge } from "./auth/AccountBadge";
import { useStore } from "./useStore";

type Props = {
  readonly session: GameSession;
  readonly onNewGame: () => void;
  readonly onContinue: () => void;
  readonly onOptions: () => void;
  readonly onQuit: () => void;
  readonly onOpenLogin: () => void;
};

const RUNE_GLYPHS = ["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ"] as const;

function placeGlyphs(
  count: number,
  radius: number,
  offsetDeg = -90,
): ReadonlyArray<{ char: string; x: number; y: number }> {
  return Array.from({ length: count }, (_, index) => {
    const angle = ((offsetDeg + (index * 360) / count) * Math.PI) / 180;
    return {
      char: RUNE_GLYPHS[index % RUNE_GLYPHS.length] ?? "ᚠ",
      x: 250 + Math.cos(angle) * radius,
      y: 250 + Math.sin(angle) * radius,
    };
  });
}

function RuneTicks({
  count,
  outer,
  majorInner,
  minorInner,
}: {
  readonly count: number;
  readonly outer: number;
  readonly majorInner: number;
  readonly minorInner: number;
}) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => {
        const angle = (index * (360 / count) * Math.PI) / 180;
        const inner = index % 3 === 0 ? majorInner : minorInner;
        return (
          <line
            key={`tick-${String(index)}`}
            x1={250 + Math.cos(angle) * outer}
            y1={250 + Math.sin(angle) * outer}
            x2={250 + Math.cos(angle) * inner}
            y2={250 + Math.sin(angle) * inner}
            stroke={
              index % 3 === 0
                ? "rgba(197,160,89,0.4)"
                : "rgba(197,160,89,0.16)"
            }
            stroke-width={index % 3 === 0 ? 1.3 : 0.7}
          />
        );
      })}
    </>
  );
}

function MenuRuneRingSvg({
  variant,
}: {
  readonly variant: 1 | 2 | 3 | 4;
}) {
  if (variant === 1) {
    const glyphs = placeGlyphs(4, 208, -90);
    return (
      <>
        <circle
          cx="250"
          cy="250"
          r="230"
          fill="none"
          stroke="rgba(197,160,89,0.28)"
          stroke-width="1.4"
          stroke-dasharray="8 6"
        />
        <circle
          cx="250"
          cy="250"
          r="198"
          fill="none"
          stroke="rgba(197,160,89,0.18)"
          stroke-width="0.9"
        />
        <polygon
          points="250,55 445,250 250,445 55,250"
          fill="none"
          stroke="rgba(197,160,89,0.14)"
          stroke-width="1"
        />
        {glyphs.map((glyph) => (
          <text
            key={`r1-${glyph.char}-${String(glyph.x)}`}
            x={glyph.x}
            y={glyph.y}
            text-anchor="middle"
            dominant-baseline="middle"
            fill="rgba(197,160,89,0.42)"
            font-size="16"
            font-family="Cinzel, serif"
            class="menu-rune-glyph"
          >
            {glyph.char}
          </text>
        ))}
      </>
    );
  }

  if (variant === 2) {
    const glyphs = placeGlyphs(6, 220, -60);
    return (
      <>
        <circle
          cx="250"
          cy="250"
          r="238"
          fill="none"
          stroke="rgba(197,160,89,0.2)"
          stroke-width="1"
        />
        <circle
          cx="250"
          cy="250"
          r="222"
          fill="none"
          stroke="rgba(197,160,89,0.32)"
          stroke-width="1.5"
          stroke-dasharray="12 8"
        />
        <RuneTicks count={24} outer={238} majorInner={214} minorInner={224} />
        <polygon
          points="250,42 420,145 420,355 250,458 80,355 80,145"
          fill="none"
          stroke="rgba(197,160,89,0.12)"
          stroke-width="1"
        />
        {glyphs.map((glyph) => (
          <text
            key={`r2-${glyph.char}-${String(glyph.x)}`}
            x={glyph.x}
            y={glyph.y}
            text-anchor="middle"
            dominant-baseline="middle"
            fill="rgba(197,160,89,0.38)"
            font-size="14"
            font-family="Cinzel, serif"
            class="menu-rune-glyph"
          >
            {glyph.char}
          </text>
        ))}
      </>
    );
  }

  if (variant === 3) {
    const glyphs = placeGlyphs(8, 226, -90);
    return (
      <>
        <circle
          cx="250"
          cy="250"
          r="242"
          fill="none"
          stroke="rgba(197,160,89,0.14)"
          stroke-width="1"
        />
        <circle
          cx="250"
          cy="250"
          r="228"
          fill="none"
          stroke="rgba(197,160,89,0.3)"
          stroke-width="1.6"
          stroke-dasharray="10 7"
        />
        <circle
          cx="250"
          cy="250"
          r="208"
          fill="none"
          stroke="rgba(197,160,89,0.16)"
          stroke-width="1"
          stroke-dasharray="3 9"
        />
        <RuneTicks count={36} outer={242} majorInner={222} minorInner={232} />
        <polygon
          points="250,48 430,155 430,345 250,452 70,345 70,155"
          fill="none"
          stroke="rgba(197,160,89,0.11)"
          stroke-width="1"
        />
        {glyphs.map((glyph) => (
          <text
            key={`r3-${glyph.char}-${String(glyph.x)}`}
            x={glyph.x}
            y={glyph.y}
            text-anchor="middle"
            dominant-baseline="middle"
            fill="rgba(197,160,89,0.36)"
            font-size="13"
            font-family="Cinzel, serif"
            class="menu-rune-glyph"
          >
            {glyph.char}
          </text>
        ))}
      </>
    );
  }

  const glyphs = placeGlyphs(8, 230, -67.5);
  return (
    <>
      <circle
        cx="250"
        cy="250"
        r="244"
        fill="none"
        stroke="rgba(197,160,89,0.12)"
        stroke-width="1"
      />
      <circle
        cx="250"
        cy="250"
        r="232"
        fill="none"
        stroke="rgba(197,160,89,0.26)"
        stroke-width="1.4"
        stroke-dasharray="14 10"
      />
      <circle
        cx="250"
        cy="250"
        r="214"
        fill="none"
        stroke="rgba(197,160,89,0.14)"
        stroke-width="0.9"
      />
      <RuneTicks count={48} outer={244} majorInner={226} minorInner={236} />
      <polygon
        points="250,38 436,148 436,352 250,462 64,352 64,148"
        fill="none"
        stroke="rgba(197,160,89,0.1)"
        stroke-width="1"
      />
      <polygon
        points="250,62 418,355 82,355"
        fill="none"
        stroke="rgba(197,160,89,0.1)"
        stroke-width="0.8"
      />
      {glyphs.map((glyph) => (
        <text
          key={`r4-${glyph.char}-${String(glyph.x)}`}
          x={glyph.x}
          y={glyph.y}
          text-anchor="middle"
          dominant-baseline="middle"
          fill="rgba(197,160,89,0.32)"
          font-size="12"
          font-family="Cinzel, serif"
          class="menu-rune-glyph"
        >
          {glyph.char}
        </text>
      ))}
    </>
  );
}

function MenuRuneRings() {
  return (
    <div class="menu-rune-rings" aria-hidden="true">
      <div class="menu-rune-ring menu-rune-ring--1">
        <svg viewBox="0 0 500 500" class="menu-rune-svg">
          <MenuRuneRingSvg variant={1} />
        </svg>
      </div>
      <div class="menu-rune-ring menu-rune-ring--2">
        <svg viewBox="0 0 500 500" class="menu-rune-svg">
          <MenuRuneRingSvg variant={2} />
        </svg>
      </div>
      <div class="menu-rune-ring menu-rune-ring--3">
        <svg viewBox="0 0 500 500" class="menu-rune-svg">
          <MenuRuneRingSvg variant={3} />
        </svg>
      </div>
      <div class="menu-rune-ring menu-rune-ring--4">
        <svg viewBox="0 0 500 500" class="menu-rune-svg">
          <MenuRuneRingSvg variant={4} />
        </svg>
      </div>
    </div>
  );
}

export function MenuView({
  session,
  onNewGame,
  onContinue,
  onOptions,
  onQuit,
  onOpenLogin,
}: Props) {
  const state = useStore(session.store);
  const hasSave = state.hero.created;
  const t = session.i18n.translate.bind(session.i18n);

  return (
    <section
      id="menu-container"
      class="center-layout fade-in menu-screen"
      role="main"
      aria-label="Hauptmenü"
      data-testid="menu-view"
    >
      <MenuRuneRings />

      <div class="menu-screen__account">
        <AccountBadge
          auth={session.auth}
          i18n={session.i18n}
          ws={session.ws}
          cloud={session.cloud}
        />
        <button
          type="button"
          class="glass-btn btn-small menu-screen__login"
          data-testid="menu-open-login"
          onClick={onOpenLogin}
        >
          {t("auth.login")}
        </button>
      </div>

      <div class="menu-screen__content">
        <h1 class="glow-text menu-screen__title">{t("menu.title")}</h1>
        <p class="subtitle menu-screen__subtitle" aria-label="Untertitel">
          {t("menu.subtitle")}
        </p>

        <nav class="menu-buttons" aria-label="Hauptmenü Navigation">
          {hasSave ? (
            <button
              type="button"
              class="menu-btn primary glass-btn"
              id="menu-continue"
              data-testid="menu-continue"
              onClick={onContinue}
            >
              {t("menu.continue")}
            </button>
          ) : null}
          <button
            type="button"
            class={hasSave ? "menu-btn glass-btn" : "menu-btn primary glass-btn"}
            id="menu-new-game"
            data-testid="menu-new-game"
            onClick={onNewGame}
          >
            {t("menu.newGame")}
          </button>
          <button
            type="button"
            class="menu-btn glass-btn"
            id="menu-options"
            data-testid="menu-options"
            onClick={onOptions}
          >
            {t("menu.options")}
          </button>
          <button
            type="button"
            class="menu-btn glass-btn"
            id="menu-quit"
            data-testid="menu-quit"
            onClick={onQuit}
          >
            {t("menu.quit")}
          </button>
        </nav>
      </div>

      <footer class="menu-footer">{t("menu.version")}</footer>
    </section>
  );
}
