import { useState } from "preact/hooks";

import type { AuthService } from "../../services/auth-service";
import type { I18nService } from "../../services/i18n-service";
import { useStore } from "../useStore";

type Props = {
  readonly auth: AuthService;
  readonly i18n: I18nService;
  readonly onContinue: () => void;
  readonly mode?: "gate" | "convert";
};

type Tab = "login" | "register";

export function LoginView({
  auth,
  i18n,
  onContinue,
  mode = "gate",
}: Props) {
  const authState = useStore(auth.store);
  const [tab, setTab] = useState<Tab>("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const t = (key: Parameters<I18nService["translate"]>[0]): string =>
    i18n.translate(key);

  const errorText =
    authState.lastError !== null
      ? t(authState.lastError as Parameters<I18nService["translate"]>[0])
      : null;

  const submit = async (): Promise<void> => {
    setBusy(true);
    try {
      let ok = false;
      if (mode === "convert") {
        ok = await auth.convertGuest({ username, email, password });
      } else if (tab === "login") {
        ok = await auth.login({ usernameOrEmail: username, password });
      } else {
        ok = await auth.register({ username, email, password });
      }
      if (ok) {
        onContinue();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <main class="auth" data-testid="login-view">
      <header class="auth__hero">
        <p class="auth__brand">{t("menu.title")}</p>
        <h1 class="auth__title">
          {mode === "convert" ? t("auth.convertTitle") : t("auth.title")}
        </h1>
      </header>

      {mode === "gate" ? (
        <nav class="auth__tabs" aria-label="Auth modes">
          <button
            type="button"
            class={tab === "login" ? "auth__tab is-active" : "auth__tab"}
            data-testid="auth-tab-login"
            onClick={() => {
              setTab("login");
            }}
          >
            {t("auth.login")}
          </button>
          <button
            type="button"
            class={tab === "register" ? "auth__tab is-active" : "auth__tab"}
            data-testid="auth-tab-register"
            onClick={() => {
              setTab("register");
            }}
          >
            {t("auth.register")}
          </button>
        </nav>
      ) : null}

      <form
        class="auth__form"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <label class="auth__field">
          <span>{t("auth.username")}</span>
          <input
            data-testid="auth-username"
            value={username}
            autocomplete="username"
            onInput={(event) => {
              setUsername((event.target as HTMLInputElement).value);
            }}
          />
        </label>

        {(mode === "convert" || tab === "register") && (
          <label class="auth__field">
            <span>{t("auth.email")}</span>
            <input
              data-testid="auth-email"
              type="email"
              value={email}
              autocomplete="email"
              onInput={(event) => {
                setEmail((event.target as HTMLInputElement).value);
              }}
            />
          </label>
        )}

        <label class="auth__field">
          <span>{t("auth.password")}</span>
          <input
            data-testid="auth-password"
            type="password"
            value={password}
            autocomplete={tab === "login" ? "current-password" : "new-password"}
            onInput={(event) => {
              setPassword((event.target as HTMLInputElement).value);
            }}
          />
        </label>

        {errorText !== null ? (
          <p class="auth__error" data-testid="auth-error" role="alert">
            {errorText}
          </p>
        ) : null}

        <button
          type="submit"
          class="auth__submit"
          data-testid="auth-submit"
          disabled={busy}
        >
          {mode === "convert"
            ? t("auth.upgradeGuest")
            : tab === "login"
              ? t("auth.login")
              : t("auth.register")}
        </button>
      </form>

      {mode === "gate" ? (
        <button
          type="button"
          class="auth__guest"
          data-testid="auth-guest"
          onClick={() => {
            void auth.playAsGuest().then(() => {
              onContinue();
            });
          }}
        >
          {t("auth.playAsGuest")}
        </button>
      ) : (
        <button
          type="button"
          class="auth__guest"
          data-testid="auth-cancel"
          onClick={onContinue}
        >
          {t("common.cancel")}
        </button>
      )}
    </main>
  );
}
