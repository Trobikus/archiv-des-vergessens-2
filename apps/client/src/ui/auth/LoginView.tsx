import { useEffect, useState } from "preact/hooks";

import { formatVersionLabel } from "../../app-version";
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
  /** Fired after login/register/guest identity changes so the session can swap save slots. */
  readonly onIdentityChanged?: () => void;
};

type Tab = "login" | "register";

function LoginRuneMarks() {
  const ticks = Array.from({ length: 36 }, (_, index) => {
    const angle = (index * 10 * Math.PI) / 180;
    const outer = 238;
    const inner = index % 3 === 0 ? 222 : 230;
    const x1 = 250 + Math.cos(angle) * outer;
    const y1 = 250 + Math.sin(angle) * outer;
    const x2 = 250 + Math.cos(angle) * inner;
    const y2 = 250 + Math.sin(angle) * inner;
    return (
      <line
        key={`tick-${String(index)}`}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={
          index % 3 === 0
            ? "rgba(197,160,89,0.42)"
            : "rgba(197,160,89,0.18)"
        }
        stroke-width={index % 3 === 0 ? 1.4 : 0.8}
      />
    );
  });

  const glyphs = [
    { char: "ᚠ", x: 250, y: 28 },
    { char: "ᚢ", x: 402, y: 98 },
    { char: "ᚦ", x: 468, y: 250 },
    { char: "ᚨ", x: 402, y: 402 },
    { char: "ᚱ", x: 250, y: 478 },
    { char: "ᚲ", x: 98, y: 402 },
    { char: "ᚷ", x: 32, y: 250 },
    { char: "ᚹ", x: 98, y: 98 },
  ] as const;

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
        r="230"
        fill="none"
        stroke="rgba(197,160,89,0.28)"
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
      />
      <circle
        cx="250"
        cy="250"
        r="188"
        fill="none"
        stroke="rgba(197,160,89,0.22)"
        stroke-width="1"
        stroke-dasharray="3 9"
      />
      <polygon
        points="250,42 420,145 420,355 250,458 80,355 80,145"
        fill="none"
        stroke="rgba(197,160,89,0.12)"
        stroke-width="1"
      />
      <polygon
        points="250,55 436,357 64,357"
        fill="none"
        stroke="rgba(197,160,89,0.14)"
        stroke-width="1"
      />
      <polygon
        points="250,445 64,143 436,143"
        fill="none"
        stroke="rgba(197,160,89,0.12)"
        stroke-width="1"
      />
      <circle
        cx="250"
        cy="250"
        r="148"
        fill="none"
        stroke="rgba(197,160,89,0.3)"
        stroke-width="1.1"
        stroke-dasharray="14 10"
      />
      <circle
        cx="250"
        cy="250"
        r="112"
        fill="none"
        stroke="rgba(197,160,89,0.18)"
        stroke-width="0.9"
      />
      {ticks}
      {glyphs.map((glyph) => (
        <text
          key={glyph.char}
          x={glyph.x}
          y={glyph.y}
          text-anchor="middle"
          dominant-baseline="middle"
          fill="rgba(197,160,89,0.38)"
          font-size="15"
          font-family="Cinzel, serif"
          class="login-rune-glyph"
        >
          {glyph.char}
        </text>
      ))}
      <circle cx="250" cy="28" r="3" fill="rgba(197,160,89,0.45)" />
      <circle cx="468" cy="250" r="3" fill="rgba(197,160,89,0.35)" />
      <circle cx="250" cy="472" r="3" fill="rgba(197,160,89,0.45)" />
      <circle cx="32" cy="250" r="3" fill="rgba(197,160,89,0.35)" />
    </>
  );
}

function LoginPortalBackdrop() {
  return (
    <div class="login-bg-portal" aria-hidden="true">
      <div class="login-bg-depth" />
      <div class="login-bg-horizon" />
      <div class="login-bg-mist login-bg-mist--a" />
      <div class="login-bg-mist login-bg-mist--b" />
      <div class="login-god-rays login-god-rays--soft" />
      <div class="login-god-rays" />
      <div class="login-portal-halo" />
      <div class="login-portal-core" />
      <div class="login-portal-singularity" />
      <div class="login-rune-ring login-rune-ring--outer">
        <svg viewBox="0 0 500 500" class="login-rune-svg">
          <LoginRuneMarks />
        </svg>
      </div>
      <div class="login-rune-ring login-rune-ring--inner">
        <svg viewBox="0 0 500 500" class="login-rune-svg">
          <circle
            cx="250"
            cy="250"
            r="96"
            fill="none"
            stroke="rgba(197,160,89,0.35)"
            stroke-width="1.2"
            stroke-dasharray="6 8"
          />
          <circle
            cx="250"
            cy="250"
            r="72"
            fill="none"
            stroke="rgba(197,160,89,0.22)"
            stroke-width="0.9"
          />
          <polygon
            points="250,170 318,290 182,290"
            fill="none"
            stroke="rgba(197,160,89,0.2)"
            stroke-width="1"
          />
          <polygon
            points="250,330 182,210 318,210"
            fill="none"
            stroke="rgba(197,160,89,0.16)"
            stroke-width="1"
          />
        </svg>
      </div>
      <div class="login-embers">
        {Array.from({ length: 18 }, (_, index) => (
          <span
            key={`ember-${String(index)}`}
            class={`login-ember login-ember--${String((index % 6) + 1)}`}
          />
        ))}
      </div>
      <div class="login-bg-grain" />
      <div class="login-bg-vignette" />
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
  onIdentityChanged,
}: Props) {
  const authState = useStore(auth.store);
  const [tab, setTab] = useState<Tab>("login");
  const [username, setUsername] = useState(
    () => auth.rememberedUsername() ?? "",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [realmSelected, setRealmSelected] = useState(true);
  const [enteringRealm, setEnteringRealm] = useState(false);
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
    currentUser !== null &&
    !currentUser.isGuest &&
    authState.token !== null;

  const authErrorText =
    authState.lastError !== null
      ? t(authState.lastError as Parameters<I18nService["translate"]>[0])
      : null;
  const offlineText =
    serverOffline && !isLoggedIn ? t("auth.serverOffline") : null;
  const errorText = localError ?? authErrorText;

  const playAsGuest = (): void => {
    setLocalError(null);
    setBusy(true);
    void auth
      .playAsGuest()
      .then((ok) => {
        if (!ok) {
          setLocalError(t("auth.error.server_error"));
          return;
        }
        onIdentityChanged?.();
        onContinue();
      })
      .finally(() => {
        setBusy(false);
      });
  };

  useEffect(() => {
    setSuccessMessage(null);
    setLocalError(null);
  }, [tab]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if (event.key !== "Escape") {
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
  }, [isLoggedIn, onQuit, tab]);

  const enterRealm = (): void => {
    if (!realmSelected || enteringRealm || serverOffline) {
      return;
    }
    setEnteringRealm(true);
    window.setTimeout(() => {
      onContinue();
      setEnteringRealm(false);
    }, 420);
  };

  const submit = async (): Promise<void> => {
    setLocalError(null);
    setSuccessMessage(null);

    if (serverOffline) {
      setLocalError(t("auth.serverOffline"));
      return;
    }

    const needsEmail = tab === "register";
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
      if (tab === "login") {
        ok = await auth.login({
          usernameOrEmail: username,
          password,
          rememberMe,
        });
        if (ok) {
          setSuccessMessage(t("auth.success.login"));
          onIdentityChanged?.();
        }
      } else {
        ok = await auth.register({
          username,
          email,
          password,
          rememberMe,
        });
        if (ok) {
          setSuccessMessage(t("auth.success.registered"));
          onIdentityChanged?.();
        }
      }
    } finally {
      setBusy(false);
    }
  };

  const currentLang = i18n.getLocale();
  const showRegister = tab === "register";
  const formLocked = busy || serverOffline;

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
        <div
          class={
            isLoggedIn ? "login-card login-card--realm" : "login-card"
          }
        >
          {currentUser !== null &&
          !currentUser.isGuest &&
          authState.token !== null ? (
            <div class="login-screen__realm" data-testid="server-select">
              <p class="login-screen__form-heading cinzel text-gold">
                {t("serverSelect.title")}
              </p>
              <p class="login-screen__realm-welcome text-muted">
                {t("serverSelect.welcome")}{" "}
                <span class="text-gold">{currentUser.username}</span>
              </p>
              <p class="login-screen__realm-sub cinzel">
                {t("serverSelect.subtitle")}
              </p>

              {successMessage !== null ? (
                <div class="auth-success-box" data-testid="auth-success">
                  <div>
                    <div class="auth-banner__title">{t("common.success")}</div>
                    <div class="auth-banner__body">{successMessage}</div>
                  </div>
                </div>
              ) : null}

              <button
                type="button"
                class={[
                  "login-realm-row",
                  realmSelected ? "login-realm-row--selected" : "",
                  serverOffline ? "login-realm-row--offline" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                data-testid="server-realm-mneme"
                aria-pressed={realmSelected}
                disabled={enteringRealm || serverOffline}
                onClick={() => {
                  setRealmSelected(true);
                }}
              >
                <span class="login-realm-row__signal" aria-hidden="true" />
                <span class="login-realm-row__body">
                  <span class="login-realm-row__name cinzel text-gold">
                    {t("serverSelect.realmName")}
                  </span>
                  <span class="login-realm-row__tagline">
                    {t("serverSelect.realmTagline")}
                  </span>
                  <span class="login-realm-row__meta text-muted">
                    {t("serverSelect.realmType")}
                  </span>
                </span>
                <span class="login-realm-row__stats">
                  <span
                    class={
                      serverOffline
                        ? "login-realm-row__status login-realm-row__status--off"
                        : "login-realm-row__status login-realm-row__status--on"
                    }
                  >
                    {serverOffline
                      ? t("serverSelect.statusOffline")
                      : t("serverSelect.statusOnline")}
                  </span>
                  <span class="login-realm-row__load">
                    {t("serverSelect.population")}:{" "}
                    {t("serverSelect.populationNormal")}
                  </span>
                </span>
              </button>

              <button
                type="button"
                class="glass-btn primary w-100 login-screen__cta"
                data-testid="auth-continue"
                disabled={
                  !realmSelected || enteringRealm || serverOffline
                }
                onClick={enterRealm}
              >
                {enteringRealm
                  ? t("serverSelect.connecting")
                  : t("serverSelect.enter")}
              </button>
              <button
                type="button"
                class="glass-btn btn-danger w-100"
                data-testid="auth-logout"
                disabled={enteringRealm}
                onClick={() => {
                  auth.logout();
                  onIdentityChanged?.();
                  setSuccessMessage(null);
                  setEnteringRealm(false);
                }}
              >
                {t("auth.logout")}
              </button>
            </div>
          ) : (
            <>
              <p class="login-screen__form-heading cinzel text-gold">
                {showRegister ? t("auth.register") : t("auth.login")}
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
                    {tab === "login"
                      ? `${t("auth.email")} / ${t("auth.username")}`
                      : t("auth.username")}
                  </span>
                  <input
                    class="form-input"
                    data-testid="auth-username"
                    required
                    autoFocus={username.length === 0}
                    autocomplete="username"
                    disabled={formLocked}
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
                      disabled={formLocked}
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
                    autoFocus={username.length > 0}
                    autocomplete="off"
                    disabled={formLocked}
                    value={password}
                    onInput={(event) => {
                      setPassword((event.target as HTMLInputElement).value);
                    }}
                  />
                </label>

                {tab === "login" ? (
                  <label class="login-screen__remember">
                    <input
                      type="checkbox"
                      data-testid="auth-remember"
                      checked={rememberMe}
                      disabled={formLocked}
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
                  disabled={formLocked}
                >
                  {busy
                    ? showRegister
                      ? t("auth.registering")
                      : t("auth.authenticating")
                    : showRegister
                      ? t("auth.register")
                      : t("auth.login")}
                </button>
              </form>

              {offlineText !== null ? (
                <p class="text-muted" data-testid="auth-offline-hint">
                  {offlineText}
                </p>
              ) : null}

              <button
                type="button"
                class="glass-btn w-100 login-screen__cta"
                data-testid="auth-play-guest"
                disabled={busy}
                onClick={playAsGuest}
              >
                {t("auth.playAsGuest")}
              </button>
              <p class="text-muted" data-testid="auth-guest-hint">
                {t("auth.guestPlayHint")}
              </p>
            </>
          )}
        </div>
      </div>

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

      <footer class="login-screen__footer">
        <span class="login-screen__version text-muted">
          {formatVersionLabel(t("menu.version"))}
        </span>
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
