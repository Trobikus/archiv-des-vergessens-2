import type { Locale } from "@adv/content";

import type { GameSession } from "../services/game-session";
import { useStore } from "./useStore";

type Props = {
  readonly session: GameSession;
  readonly onBack: () => void;
  readonly onOpenAccount: () => void;
  readonly onHardReset: () => void;
};

export function OptionsView({
  session,
  onBack,
  onOpenAccount,
  onHardReset,
}: Props) {
  const state = useStore(session.store);
  const authState = useStore(session.auth.store);
  const locale = state.settings.locale;
  const t = session.i18n.translate.bind(session.i18n);
  const user = authState.user;

  return (
    <section
      id="options-container"
      class="center-layout fade-in options-screen"
      role="dialog"
      aria-label="Einstellungen"
      data-testid="options-view"
    >
      <div class="glass-panel options-screen__panel">
        <h2 class="glow-text text-center">{t("options.title").toUpperCase()}</h2>
        <p class="options-screen__subtitle text-center text-muted">
          {t("options.subtitle")}
        </p>

        <div class="options-panel">
          <h3 class="options-header">{t("options.language")}</h3>
          <div class="option-row flex-between">
            <span class="option-label text-muted">
              {t("options.activeLanguage")}
            </span>
            <select
              id="opt-language"
              class="ui-select"
              data-testid="opt-language"
              value={locale}
              aria-label={t("options.language")}
              onChange={(event) => {
                session.i18n.setLocale(
                  (event.target as HTMLSelectElement).value as Locale,
                );
              }}
            >
              <option value="de">{t("options.lang_de")}</option>
              <option value="en">{t("options.lang_en")}</option>
            </select>
          </div>

          <h3 class="options-header">{t("auth.title")}</h3>
          <div class="option-row flex-between">
            <span class="option-label text-muted">
              {user !== null && !user.isGuest
                ? `${t("auth.loggedInAs")}: ${user.username}`
                : t("auth.login")}
            </span>
            <button
              type="button"
              class="glass-btn btn-small"
              data-testid="opt-account"
              onClick={onOpenAccount}
            >
              {user !== null && !user.isGuest
                ? t("auth.accountDetails")
                : t("auth.login")}
            </button>
          </div>

          <h3 class="options-header">{t("options.cloudSync")}</h3>
          <div class="option-row flex-between">
            <span class="option-label text-muted">
              {session.cloud.status() === "pending"
                ? t("auth.cloudPending")
                : t("auth.cloudSynced")}
            </span>
            <button
              type="button"
              class="glass-btn btn-small"
              data-testid="opt-cloud-sync"
              onClick={() => {
                void session.cloud.push(session.store.getState());
              }}
            >
              {t("options.syncNow")}
            </button>
          </div>

          <h3 class="options-header">{t("options.audio")}</h3>
          <div class="option-row flex-between">
            <span class="option-label text-muted">
              {t("options.particles")}
            </span>
            <label class="option-toggle">
              <input
                type="checkbox"
                data-testid="opt-particles"
                checked={state.settings.particlesEnabled}
                onChange={(event) => {
                  const checked = (event.target as HTMLInputElement).checked;
                  session.store.setState((prev) => ({
                    ...prev,
                    settings: { ...prev.settings, particlesEnabled: checked },
                  }));
                }}
              />
              <span>
                {state.settings.particlesEnabled
                  ? t("options.enabled")
                  : t("options.disabled")}
              </span>
            </label>
          </div>
          <div class="option-row flex-between">
            <span class="option-label text-muted">
              {t("options.floatingText")}
            </span>
            <label class="option-toggle">
              <input
                type="checkbox"
                data-testid="opt-floating-text"
                checked={state.settings.floatingTextEnabled}
                onChange={(event) => {
                  const checked = (event.target as HTMLInputElement).checked;
                  session.store.setState((prev) => ({
                    ...prev,
                    settings: {
                      ...prev.settings,
                      floatingTextEnabled: checked,
                    },
                  }));
                }}
              />
              <span>
                {state.settings.floatingTextEnabled
                  ? t("options.enabled")
                  : t("options.disabled")}
              </span>
            </label>
          </div>
          <div class="option-row flex-between">
            <span class="option-label text-muted">{t("options.audio")}</span>
            <label class="option-toggle">
              <input
                type="checkbox"
                data-testid="opt-audio"
                checked={state.settings.audioEnabled}
                onChange={(event) => {
                  const checked = (event.target as HTMLInputElement).checked;
                  session.store.setState((prev) => ({
                    ...prev,
                    settings: { ...prev.settings, audioEnabled: checked },
                  }));
                }}
              />
              <span>
                {state.settings.audioEnabled
                  ? t("options.enabled")
                  : t("options.disabled")}
              </span>
            </label>
          </div>
          <div class="option-row flex-between">
            <span class="option-label text-muted">{t("options.autosave")}</span>
            <select
              class="ui-select"
              data-testid="opt-autosave"
              value={String(state.settings.autosaveMs)}
              onChange={(event) => {
                const ms = Number(
                  (event.target as HTMLSelectElement).value,
                );
                session.store.setState((prev) => ({
                  ...prev,
                  settings: { ...prev.settings, autosaveMs: ms },
                }));
              }}
            >
              <option value="5000">5s</option>
              <option value="15000">15s</option>
              <option value="30000">30s</option>
              <option value="60000">60s</option>
            </select>
          </div>

          <h3 class="options-header">System</h3>
          <div class="option-row flex-between option-row--danger">
            <span class="option-label text-danger">
              {t("options.deleteSave")}
            </span>
            <button
              type="button"
              class="btn-danger glass-btn"
              id="opt-hard-reset"
              data-testid="opt-hard-reset"
              onClick={onHardReset}
            >
              {locale === "de" ? "Löschen" : "Reset"}
            </button>
          </div>
        </div>

        <div class="text-center options-screen__back">
          <button
            type="button"
            class="glass-btn primary"
            id="options-back-btn"
            data-testid="options-back"
            onClick={onBack}
          >
            « {t("common.back").toUpperCase()}
          </button>
        </div>
      </div>
    </section>
  );
}
