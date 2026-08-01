import { useEffect, useState } from "preact/hooks";

import { createGameSession, type GameSession } from "../services/game-session";
import { AccountBadge } from "./auth/AccountBadge";
import { LoginView } from "./auth/LoginView";
import { CharacterSelectView } from "./CharacterSelectView";
import { GameView } from "./GameView";
import { useStore } from "./useStore";

function BootShell({ message }: { readonly message: string }) {
  return (
    <main class="boot">
      <p class="boot__brand">Archiv des Vergessens</p>
      <p class="boot__status" data-testid="boot-status">
        {message}
      </p>
    </main>
  );
}

function LocaleCorner({ session }: { readonly session: GameSession }) {
  const state = useStore(session.store);
  const locale = state.settings.locale;
  const next = locale === "de" ? "en" : "de";

  return (
    <button
      type="button"
      class="locale-fab"
      data-testid="locale-toggle"
      aria-label={session.i18n.translate(
        next === "en" ? "options.lang_en" : "options.lang_de",
      )}
      title={session.i18n.translate(
        next === "en" ? "options.lang_en" : "options.lang_de",
      )}
      onClick={() => {
        session.i18n.setLocale(next);
      }}
    >
      {next.toUpperCase()}
    </button>
  );
}

function SessionRoot({ session }: { readonly session: GameSession }) {
  const state = useStore(session.store);
  const authState = useStore(session.auth.store);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [showConvert, setShowConvert] = useState(false);

  if (!authState.ready) {
    return <BootShell message="Verbinde…" />;
  }

  let body;
  if (showAuthGate) {
    body = (
      <LoginView
        auth={session.auth}
        i18n={session.i18n}
        onContinue={() => {
          setShowAuthGate(false);
        }}
      />
    );
  } else if (showConvert) {
    body = (
      <LoginView
        auth={session.auth}
        i18n={session.i18n}
        mode="convert"
        onContinue={() => {
          setShowConvert(false);
          void session.cloud.push(session.store.getState());
        }}
      />
    );
  } else {
    body = (
      <>
        <div class="session-chrome">
          <AccountBadge
            auth={session.auth}
            i18n={session.i18n}
            ws={session.ws}
            cloud={session.cloud}
            onConvertGuest={() => {
              setShowConvert(true);
            }}
          />
          <button
            type="button"
            class="session-chrome__auth"
            data-testid="open-auth"
            onClick={() => {
              setShowAuthGate(true);
            }}
          >
            {session.i18n.translate("auth.login")}
          </button>
        </div>
        {!state.hero.created ? (
          <CharacterSelectView session={session} />
        ) : (
          <GameView session={session} />
        )}
      </>
    );
  }

  return (
    <>
      {body}
      <LocaleCorner session={session} />
    </>
  );
}

export function App() {
  const [session, setSession] = useState<GameSession | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const next = createGameSession({ useIndexedDb: true });
    const lifecycle = { cancelled: false };

    void (async () => {
      try {
        await next.boot();
        if (lifecycle.cancelled) {
          next.destroy();
          return;
        }
        setSession(next);
      } catch (cause) {
        next.destroy();
        if (!lifecycle.cancelled) {
          setError(cause instanceof Error ? cause.message : "Boot failed");
        }
      }
    })();

    return () => {
      lifecycle.cancelled = true;
      next.destroy();
    };
  }, []);

  if (error !== null) {
    return <BootShell message={error} />;
  }

  if (session === null) {
    return <BootShell message="Lade Spielstand…" />;
  }

  return <SessionRoot session={session} />;
}
