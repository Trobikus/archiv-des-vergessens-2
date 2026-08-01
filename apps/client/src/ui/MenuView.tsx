import type { GameSession } from "../services/game-session";
import { AccountBadge } from "./auth/AccountBadge";
import { useStore } from "./useStore";

type Props = {
  readonly session: GameSession;
  readonly onNewGame: () => void;
  readonly onContinue: () => void;
  readonly onOptions: () => void;
  readonly onQuit: () => void;
  readonly onConvertGuest: () => void;
  readonly onOpenLogin: () => void;
};

export function MenuView({
  session,
  onNewGame,
  onContinue,
  onOptions,
  onQuit,
  onConvertGuest,
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
      <div class="menu-screen__account">
        <AccountBadge
          auth={session.auth}
          i18n={session.i18n}
          ws={session.ws}
          cloud={session.cloud}
          onConvertGuest={onConvertGuest}
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

      <footer class="menu-footer">{t("menu.version")}</footer>
    </section>
  );
}
