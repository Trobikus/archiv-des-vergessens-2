import { useEffect, useState } from "preact/hooks";

import { createGameSession, type GameSession } from "../services/game-session";
import { GameView } from "./GameView";

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
    return (
      <main class="boot">
        <p class="boot__brand">Archiv des Vergessens</p>
        <p class="boot__status">{error}</p>
      </main>
    );
  }

  if (session === null) {
    return (
      <main class="boot">
        <p class="boot__brand">Archiv des Vergessens</p>
        <p class="boot__status" data-testid="boot-status">
          Lade Spielstand…
        </p>
      </main>
    );
  }

  return <GameView session={session} />;
}
