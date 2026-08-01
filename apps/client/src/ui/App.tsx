import { useCallback, useEffect, useState } from "preact/hooks";

import type { BootProgress } from "../services/boot-progress";
import { createGameSession, type GameSession } from "../services/game-session";
import { AccountBadge } from "./auth/AccountBadge";
import { LoginView } from "./auth/LoginView";
import { CharacterSelectView } from "./CharacterSelectView";
import { GameView } from "./GameView";
import { IntroView } from "./IntroView";
import { OptionsView } from "./OptionsView";
import { PauseMenu } from "./PauseMenu";
import { PcFrame } from "./PcFrame";
import { TutorialUI } from "./tutorial/TutorialUI";
import { useStore } from "./useStore";

type Screen = "login" | "options" | "characterSelect" | "game" | "convert";

type ConfirmState = {
  readonly title: string;
  readonly message: string;
  readonly onConfirm: () => void;
} | null;

const INITIAL_BOOT_PROGRESS: BootProgress = {
  step: 0,
  total: 9,
  pct: 0,
  labelDe: "Initialisiere Archiv-Kern…",
  labelEn: "Initializing archive core…",
};

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

function ConfirmModal({
  state,
  onCancel,
  confirmLabel,
  cancelLabel,
}: {
  readonly state: ConfirmState;
  readonly onCancel: () => void;
  readonly confirmLabel: string;
  readonly cancelLabel: string;
}) {
  useEffect(() => {
    if (state === null) {
      return;
    }
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
      } else if (event.key === "Enter") {
        event.preventDefault();
        const action = state.onConfirm;
        onCancel();
        action();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [onCancel, state]);

  if (state === null) {
    return null;
  }

  return (
    <div class="confirm-modal" role="alertdialog" aria-modal="true">
      <div class="glass-panel confirm-modal__panel">
        <h2 class="glow-text text-gold">{state.title}</h2>
        <p class="text-muted">{state.message}</p>
        <div class="confirm-modal__actions">
          <button
            type="button"
            class="glass-btn"
            data-testid="confirm-cancel"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            class="glass-btn primary"
            data-testid="confirm-ok"
            onClick={() => {
              const action = state.onConfirm;
              onCancel();
              action();
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function SessionRoot({ session }: { readonly session: GameSession }) {
  const state = useStore(session.store);
  const authState = useStore(session.auth.store);
  const [screen, setScreen] = useState<Screen>("login");
  const [returnScreen, setReturnScreen] = useState<Screen>("characterSelect");
  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const [pauseOpen, setPauseOpen] = useState(false);
  const [loginFormKey, setLoginFormKey] = useState(0);

  const t = session.i18n.translate.bind(session.i18n);

  const askConfirm = useCallback(
    (
      messageKey:
        | "menu.quitConfirm"
        | "menu.newGameConfirm"
        | "menu.resetConfirm"
        | "charSelect.deleteConfirm",
      onConfirm: () => void,
    ) => {
      setConfirm({
        title: t("common.confirm"),
        message: t(messageKey),
        onConfirm,
      });
    },
    [t],
  );

  const handleQuit = useCallback(() => {
    askConfirm("menu.quitConfirm", () => {
      void session.quitGame();
    });
  }, [askConfirm, session]);

  useEffect(() => {
    if (!authState.ready) {
      return;
    }
    if (
      !session.auth.isRegistered() &&
      screen !== "login" &&
      screen !== "convert"
    ) {
      setScreen("login");
    }
  }, [authState.ready, authState.token, authState.user, screen, session.auth]);

  useEffect(() => {
    if (screen !== "game") {
      setPauseOpen(false);
    }
  }, [screen]);

  useEffect(() => {
    if (screen !== "options" && screen !== "game") {
      return;
    }
    const onKey = (event: KeyboardEvent): void => {
      if (event.key !== "Escape" || confirm !== null) {
        return;
      }
      event.preventDefault();
      if (screen === "options") {
        setScreen(returnScreen);
        return;
      }
      setPauseOpen((open) => !open);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [confirm, returnScreen, screen]);

  if (!authState.ready) {
    return <BootShell message="Verbinde…" />;
  }

  let body;
  switch (screen) {
    case "login":
      body = (
        <LoginView
          key={loginFormKey}
          auth={session.auth}
          i18n={session.i18n}
          ws={session.ws}
          onQuit={handleQuit}
          onOptions={() => {
            setReturnScreen("login");
            setScreen("options");
          }}
          onContinue={() => {
            setScreen(
              returnScreen === "options" ? "options" : "characterSelect",
            );
          }}
        />
      );
      break;
    case "convert":
      body = (
        <LoginView
          auth={session.auth}
          i18n={session.i18n}
          ws={session.ws}
          mode="convert"
          onContinue={() => {
            setScreen(returnScreen);
            void session.cloud.push(session.store.getState());
          }}
        />
      );
      break;
    case "options":
      body = (
        <OptionsView
          session={session}
          onBack={() => {
            setScreen(returnScreen);
          }}
          onOpenAccount={() => {
            setReturnScreen("options");
            setScreen("login");
          }}
          onHardReset={() => {
            askConfirm("menu.resetConfirm", () => {
              void session.resetProgress().then(() => {
                setScreen(
                  returnScreen === "game" ? "characterSelect" : returnScreen,
                );
              });
            });
          }}
        />
      );
      break;
    case "characterSelect":
      body = (
        <>
          <div class="session-chrome session-chrome--wide">
            <AccountBadge
              auth={session.auth}
              i18n={session.i18n}
              ws={session.ws}
              cloud={session.cloud}
              onConvertGuest={() => {
                setReturnScreen("characterSelect");
                setScreen("convert");
              }}
            />
          </div>
          <CharacterSelectView
            session={session}
            onPlay={() => {
              if (!state.hero.created) {
                return;
              }
              if (!state.tutorial.finished) {
                session.tutorial.maybeAutoStart();
              }
              setScreen("game");
            }}
            onBack={() => {
              setReturnScreen("characterSelect");
              setScreen("login");
            }}
            onOptions={() => {
              setReturnScreen("characterSelect");
              setScreen("options");
            }}
            onQuit={handleQuit}
            onDelete={() => {
              askConfirm("charSelect.deleteConfirm", () => {
                void session.resetProgress();
              });
            }}
          />
        </>
      );
      break;
    case "game":
      body = (
        <div class="game-screen" data-testid="game-screen">
          <GameView session={session} />
          <TutorialUI session={session} />
          {pauseOpen ? (
            <PauseMenu
              title={t("pause.title")}
              optionsLabel={t("menu.options")}
              logOutLabel={t("pause.logOut")}
              exitLabel={t("pause.exitGame")}
              resumeLabel={t("pause.resume")}
              onOptions={() => {
                setPauseOpen(false);
                setReturnScreen("game");
                setScreen("options");
              }}
              onLogOut={() => {
                setPauseOpen(false);
                void session.saveNow().then(() => {
                  session.auth.logout();
                  setReturnScreen("characterSelect");
                  setLoginFormKey((key) => key + 1);
                  setScreen("login");
                });
              }}
              onExit={handleQuit}
              onResume={() => {
                setPauseOpen(false);
              }}
            />
          ) : null}
        </div>
      );
      break;
    default:
      body = null;
  }

  return (
    <>
      {body}
      <ConfirmModal
        state={confirm}
        onCancel={() => {
          setConfirm(null);
        }}
        confirmLabel={t("common.confirm")}
        cancelLabel={t("common.cancel")}
      />
    </>
  );
}

export function App() {
  const [session, setSession] = useState<GameSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bootProgress, setBootProgress] = useState<BootProgress>(
    INITIAL_BOOT_PROGRESS,
  );
  const [bootReady, setBootReady] = useState(false);
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    const next = createGameSession({ useIndexedDb: true });
    const lifecycle = { cancelled: false };

    void (async () => {
      try {
        await next.boot((progress) => {
          if (!lifecycle.cancelled) {
            setBootProgress(progress);
          }
        });
        if (lifecycle.cancelled) {
          next.destroy();
          return;
        }
        setSession(next);
        setBootReady(true);
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

  let content;
  if (error !== null) {
    content = <BootShell message={error} />;
  } else if (!introDone) {
    content = (
      <IntroView
        progress={bootProgress}
        ready={bootReady}
        locale={session?.i18n.getLocale() ?? "de"}
        onFinished={() => {
          setIntroDone(true);
        }}
      />
    );
  } else if (session === null) {
    content = <BootShell message="Lade Spielstand…" />;
  } else {
    content = <SessionRoot session={session} />;
  }

  return <PcFrame>{content}</PcFrame>;
}
