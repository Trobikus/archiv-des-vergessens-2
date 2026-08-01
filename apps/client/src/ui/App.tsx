import { useCallback, useEffect, useRef, useState } from "preact/hooks";

import type { BootProgress } from "../services/boot-progress";
import { createGameSession, type GameSession } from "../services/game-session";
import { AccountBadge } from "./auth/AccountBadge";
import { LoginView } from "./auth/LoginView";
import { CharacterSelectView } from "./CharacterSelectView";
import { GameView } from "./GameView";
import { IntroView } from "./IntroView";
import { OptionsView } from "./OptionsView";
import { PcFrame } from "./PcFrame";
import {
  ScreenTransition,
  transitionLabelFor,
  type TransitionPhase,
} from "./ScreenTransition";
import { useStore } from "./useStore";

type Screen = "login" | "options" | "characterSelect" | "game";

const TRANSITION_COVER_MS = 720;
const TRANSITION_REVEAL_MS = 780;

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
  const [transitionPhase, setTransitionPhase] =
    useState<TransitionPhase>("idle");
  const [transitionLabel, setTransitionLabel] = useState("");
  const transitionTimers = useRef<number[]>([]);
  const screenRef = useRef(screen);
  const transitionPhaseRef = useRef(transitionPhase);
  screenRef.current = screen;
  transitionPhaseRef.current = transitionPhase;

  const t = session.i18n.translate.bind(session.i18n);

  const clearTransitionTimers = useCallback(() => {
    for (const id of transitionTimers.current) {
      window.clearTimeout(id);
    }
    transitionTimers.current = [];
  }, []);

  useEffect(() => () => {
    clearTransitionTimers();
  }, [clearTransitionTimers]);

  const navigateTo = useCallback(
    (next: Screen, options?: { readonly instant?: boolean }) => {
      if (next === screenRef.current) {
        return;
      }
      if (options?.instant === true) {
        clearTransitionTimers();
        setTransitionPhase("idle");
        setScreen(next);
        return;
      }
      if (transitionPhaseRef.current !== "idle") {
        return;
      }

      clearTransitionTimers();
      setTransitionLabel(t(transitionLabelFor(screenRef.current, next)));
      setTransitionPhase("cover");

      const swapId = window.setTimeout(() => {
        setScreen(next);
        setTransitionPhase("reveal");
        const idleId = window.setTimeout(() => {
          setTransitionPhase("idle");
        }, TRANSITION_REVEAL_MS);
        transitionTimers.current.push(idleId);
      }, TRANSITION_COVER_MS);
      transitionTimers.current.push(swapId);
    },
    [clearTransitionTimers, t],
  );

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
    // Account required — anything beyond login needs a registered session.
    if (!session.auth.isRegistered() && screen !== "login") {
      navigateTo("login", { instant: true });
    }
  }, [
    authState.ready,
    authState.token,
    authState.user,
    navigateTo,
    screen,
    session.auth,
  ]);

  useEffect(() => {
    if (screen !== "options") {
      return;
    }
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === "Escape" && confirm === null) {
        event.preventDefault();
        navigateTo(returnScreen === "login" ? "login" : "characterSelect");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [confirm, navigateTo, returnScreen, screen]);

  if (!authState.ready) {
    return <BootShell message="Verbinde…" />;
  }

  let body;
  switch (screen) {
    case "login":
      body = (
        <LoginView
          auth={session.auth}
          i18n={session.i18n}
          ws={session.ws}
          onQuit={handleQuit}
          onOptions={() => {
            setReturnScreen("login");
            navigateTo("options");
          }}
          onContinue={() => {
            if (!session.auth.isRegistered()) {
              return;
            }
            navigateTo("characterSelect");
          }}
        />
      );
      break;
    case "options":
      body = (
        <OptionsView
          session={session}
          onBack={() => {
            navigateTo(
              returnScreen === "login" ? "login" : "characterSelect",
            );
          }}
          onOpenAccount={() => {
            setReturnScreen("options");
            navigateTo("login");
          }}
          onHardReset={() => {
            askConfirm("menu.resetConfirm", () => {
              void session.resetProgress().then(() => {
                navigateTo(
                  returnScreen === "login" ? "login" : "characterSelect",
                );
              });
            });
          }}
        />
      );
      break;
    case "characterSelect":
      body = (
        <CharacterSelectView
          session={session}
          accountSlot={
            <AccountBadge
              auth={session.auth}
              i18n={session.i18n}
              ws={session.ws}
              cloud={session.cloud}
            />
          }
          onPlay={() => {
            if (!state.hero.created) {
              return;
            }
            navigateTo("game");
          }}
          onBack={() => {
            setReturnScreen("characterSelect");
            navigateTo("login");
          }}
          onOptions={() => {
            setReturnScreen("characterSelect");
            navigateTo("options");
          }}
          onQuit={handleQuit}
          onDelete={() => {
            askConfirm("charSelect.deleteConfirm", () => {
              void session.resetProgress();
            });
          }}
        />
      );
      break;
    case "game":
      body = (
        <>
          <div class="session-chrome">
            <AccountBadge
              auth={session.auth}
              i18n={session.i18n}
              ws={session.ws}
              cloud={session.cloud}
            />
            <button
              type="button"
              class="session-chrome__auth glass-btn btn-small"
              data-testid="game-back-chars"
              onClick={() => {
                void session.saveNow().then(() => {
                  navigateTo("characterSelect");
                });
              }}
            >
              « {t("charSelect.title")}
            </button>
          </div>
          <GameView session={session} />
        </>
      );
      break;
    default:
      body = null;
  }

  return (
    <>
      <div
        class={
          transitionPhase === "idle"
            ? "screen-stage"
            : `screen-stage screen-stage--${transitionPhase}`
        }
      >
        {body}
      </div>
      <ScreenTransition phase={transitionPhase} label={transitionLabel} />
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
