import { useEffect, useState } from "preact/hooks";

import type { AuthService } from "../../services/auth-service";
import type { I18nService } from "../../services/i18n-service";
import type { WsClient } from "../../services/ws-client";
import { useStore } from "../useStore";

type Props = {
  readonly auth: AuthService;
  readonly i18n: I18nService;
  readonly ws?: WsClient;
  readonly onContinue: () => void;
  readonly onQuit?: () => void;
  readonly onOptions?: () => void;
  readonly mode?: "gate" | "convert";
};

type Tab = "login" | "register";

function LoginPortalBackdrop() {
  return (
    <div class="login-bg-portal" aria-hidden="true">
      <div class="login-god-rays" />
      <div class="login-portal-core" />
      <div class="login-rune-ring">
        <svg viewBox="0 0 500 500" class="login-rune-svg">
          <circle
            cx="250"
            cy="250"
            r="230"
            fill="none"
            stroke="rgba(197,160,89,0.2)"
            stroke-width="1.5"
            stroke-dasharray="8 6"
          />
          <circle
            cx="250"
            cy="250"
            r="215"
            fill="none"
            stroke="rgba(197,160,89,0.12)"
            stroke-width="1"
          />
          <polygon
            points="250,35 436,357 64,357"
            fill="none"
            stroke="rgba(197,160,89,0.1)"
            stroke-width="1"
          />
          <polygon
            points="250,465 64,143 436,143"
            fill="none"
            stroke="rgba(197,160,89,0.1)"
            stroke-width="1"
          />
          <circle
            cx="250"
            cy="250"
            r="160"
            fill="none"
            stroke="rgba(197,160,89,0.25)"
            stroke-width="1"
            stroke-dasharray="12 12"
          />
        </svg>
      </div>
    </div>
  );
}

export function LoginView({
  auth,
  i18n,
  ws,
  onContinue,
  onQuit,
  onOptions,
  mode = "gate",
}: Props) {
  const authState = useStore(auth.store);
  const [tab, setTab] = useState<Tab>("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [wsOpen, setWsOpen] = useState(
    () => ws === undefined || ws.status() === "open",
  );

  const t = (key: Parameters<I18nService["translate"]>[0]): string =>
    i18n.translate(key);

  useEffect(() => {
    if (ws === undefined) {
      return;
    }
    setWsOpen(ws.status() === "open");
    return ws.onStatus((status) => {
      setWsOpen(status === "open");
    });
  }, [ws]);

  const serverOffline = ws !== undefined && !wsOpen;

  const currentUser = authState.user;
  const isLoggedIn =
    mode === "gate" &&
    currentUser !== null &&
    !currentUser.isGuest &&
    authState.token !== null;

  const authErrorText =
    authState.lastError !== null
      ? t(authState.lastError as Parameters<I18nService["translate"]>[0])
      : null;
  const offlineText =
    serverOffline && mode === "gate" && !isLoggedIn
      ? t("auth.serverOffline")
      : null;
  const errorText = localError ?? authErrorText ?? offlineText;

  useEffect(() => {
    setSuccessMessage(null);
    setLocalError(null);
  }, [tab]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if (event.key !== "Escape") {
        return;
      }
      if (mode === "convert") {
        event.preventDefault();
        onContinue();
        return;
      }
      if (tab === "register") {
        event.preventDefault();
        setTab("login");
        return;
      }
      if (onQuit !== undefined && !isLoggedIn) {
        event.preventDefault();
        onQuit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [isLoggedIn, mode, onContinue, onQuit, tab]);

  const proceedSoon = (message: string): void => {
    setSuccessMessage(message);
    setTimeout(() => {
      onContinue();
    }, 800);
  };

  const submit = async (): Promise<void> => {
    setLocalError(null);
    setSuccessMessage(null);

    const needsEmail = mode === "convert" || tab === "register";
    if (
      username.trim().length === 0 ||
      password.trim().length === 0 ||
      (needsEmail && email.trim().length === 0)
    ) {
      setLocalError(t("auth.error.missing_fields"));
      return;
    }

    setBusy(true);
    try {
      let ok = false;
      if (mode === "convert") {
        ok = await auth.convertGuest({ username, email, password });
        if (ok) {
          proceedSoon(t("auth.success.guestConverted"));
        }
      } else if (tab === "login") {
        ok = await auth.login({
          usernameOrEmail: username,
          password,
          rememberMe,
        });
        if (ok) {
          proceedSoon(t("auth.success.login"));
        }
      } else {
        ok = await auth.register({
          username,
          email,
          password,
          rememberMe,
        });
        if (ok) {
          proceedSoon(t("auth.success.registered"));
        }
      }
    } finally {
      setBusy(false);
    }
  };

  const currentLang = i18n.getLocale();
  const showRegister = mode === "convert" || tab === "register";

  return (
    <section
      id="login-container"
      class="fade-in login-screen login-screen--portal"
      role="main"
      aria-label="Login-Portal"
      data-testid="login-view"
    >
      <LoginPortalBackdrop />

      <header class="login-screen__brand">
        <h1 class="glow-text text-gold cinzel login-screen__title">
          {t("menu.title")}
        </h1>
        <p class="login-screen__subtitle cinzel text-gold">
          {t("menu.subtitle")}
        </p>
      </header>

      <div class="login-screen__center">
        <div class="login-card">
          {isLoggedIn ? (
            <div class="login-screen__logged-in">
              <div class="login-screen__avatar" aria-hidden="true">
                {currentUser.avatar || "A"}
              </div>
              <div>
                <div class="cinzel text-gold login-screen__username">
                  {currentUser.username}
                </div>
                <div class="text-muted login-screen__email">
                  {currentUser.email ?? t("auth.keeperTitle")}
                </div>
              </div>
              <button
                type="button"
                class="glass-btn primary w-100 login-screen__cta"
                data-testid="auth-continue"
                onClick={onContinue}
              >
                {t("menu.continueToMenu")}
              </button>
              <button
                type="button"
                class="glass-btn btn-danger w-100"
                data-testid="auth-logout"
                onClick={() => {
                  auth.logout();
                  setSuccessMessage(null);
                }}
              >
                {t("auth.logout")}
              </button>
            </div>
          ) : (
            <>
              <p class="login-screen__form-heading cinzel text-gold">
                {mode === "convert"
                  ? t("auth.convertTitle")
                  : showRegister
                    ? t("auth.register")
                    : t("auth.login")}
              </p>

              {errorText !== null ? (
                <div
                  class="auth-error-box error-shake"
                  data-testid="auth-error"
                  role="alert"
                >
                  <div>
                    <div class="auth-banner__title">{t("common.error")}</div>
                    <div class="auth-banner__body">{errorText}</div>
                  </div>
                </div>
              ) : null}

              {successMessage !== null ? (
                <div class="auth-success-box" data-testid="auth-success">
                  <div>
                    <div class="auth-banner__title">{t("common.success")}</div>
                    <div class="auth-banner__body">{successMessage}</div>
                  </div>
                </div>
              ) : null}

              <form
                class="login-screen__form"
                onSubmit={(event) => {
                  event.preventDefault();
                  void submit();
                }}
              >
                <label class="login-screen__field">
                  <span class="cinzel text-gold">
                    {tab === "login" && mode === "gate"
                      ? `${t("auth.email")} / ${t("auth.username")}`
                      : t("auth.username")}
                  </span>
                  <input
                    class="form-input"
                    data-testid="auth-username"
                    required
                    autoFocus
                    autocomplete="username"
                    value={username}
                    onInput={(event) => {
                      setUsername((event.target as HTMLInputElement).value);
                    }}
                  />
                </label>

                {showRegister ? (
                  <label class="login-screen__field">
                    <span class="cinzel text-gold">{t("auth.email")}</span>
                    <input
                      class="form-input"
                      data-testid="auth-email"
                      type="email"
                      required
                      autocomplete="email"
                      value={email}
                      onInput={(event) => {
                        setEmail((event.target as HTMLInputElement).value);
                      }}
                    />
                  </label>
                ) : null}

                <label class="login-screen__field">
                  <span class="cinzel text-gold">{t("auth.password")}</span>
                  <input
                    class="form-input"
                    data-testid="auth-password"
                    type="password"
                    required
                    minLength={6}
                    autocomplete={
                      tab === "login" ? "current-password" : "new-password"
                    }
                    value={password}
                    onInput={(event) => {
                      setPassword((event.target as HTMLInputElement).value);
                    }}
                  />
                </label>

                {mode === "gate" && tab === "login" ? (
                  <label class="login-screen__remember">
                    <input
                      type="checkbox"
                      data-testid="auth-remember"
                      checked={rememberMe}
                      onChange={(event) => {
                        setRememberMe(
                          (event.target as HTMLInputElement).checked,
                        );
                      }}
                    />
                    <span>{t("auth.rememberMe")}</span>
                  </label>
                ) : null}

                <button
                  type="submit"
                  class="glass-btn primary w-100 login-screen__cta"
                  data-testid="auth-submit"
                  disabled={busy}
                >
                  {busy
                    ? showRegister
                      ? t("auth.registering")
                      : t("auth.authenticating")
                    : mode === "convert"
                      ? t("auth.upgradeGuest")
                      : showRegister
                        ? t("auth.register")
                        : t("auth.login")}
                </button>
              </form>

              {mode === "convert" ? (
                <button
                  type="button"
                  class="glass-btn w-100"
                  data-testid="auth-cancel"
                  onClick={onContinue}
                >
                  {t("common.cancel")}
                </button>
              ) : null}
            </>
          )}
        </div>
      </div>

      {mode === "gate" ? (
        <aside class="login-screen__side-actions" aria-label="Login actions">
          {onOptions !== undefined ? (
            <button
              type="button"
              class="glass-btn login-screen__side-btn"
              data-testid="login-options"
              onClick={onOptions}
            >
              {t("menu.options")}
            </button>
          ) : null}
          {!isLoggedIn ? (
            <button
              type="button"
              class="glass-btn login-screen__side-btn"
              data-testid={
                tab === "register" ? "auth-tab-login" : "auth-tab-register"
              }
              onClick={() => {
                setTab(tab === "register" ? "login" : "register");
              }}
            >
              {tab === "register" ? t("auth.login") : t("auth.register")}
            </button>
          ) : null}
          {onQuit !== undefined ? (
            <button
              type="button"
              class="glass-btn login-screen__side-btn"
              data-testid="login-quit"
              onClick={onQuit}
            >
              {t("menu.quit")}
            </button>
          ) : null}
        </aside>
      ) : null}

      <footer class="login-screen__footer">
        <span class="login-screen__version text-muted">{t("menu.version")}</span>
        <div class="login-screen__langs">
          <button
            type="button"
            class={
              currentLang === "de"
                ? "glass-btn btn-small primary"
                : "glass-btn btn-small"
            }
            data-testid="login-lang-de"
            onClick={() => {
              i18n.setLocale("de");
            }}
          >
            DE
          </button>
          <button
            type="button"
            class={
              currentLang === "en"
                ? "glass-btn btn-small primary"
                : "glass-btn btn-small"
            }
            data-testid="login-lang-en"
            onClick={() => {
              i18n.setLocale("en");
            }}
          >
            EN
          </button>
        </div>
      </footer>
    </section>
  );
}
