import { useEffect, useState } from "preact/hooks";

import type { GameSession } from "../../services/game-session";
import { useStore } from "../useStore";

type Props = {
  readonly session: GameSession;
};

type LeaderboardTab = "personal" | "global";

export function LeaderboardPanel({ session }: Props) {
  useStore(session.store);
  const [tab, setTab] = useState<LeaderboardTab>("personal");
  const [error, setError] = useState<string | null>(
    session.leaderboard.lastError(),
  );
  const [, setGlobalTick] = useState(0);
  const stats = session.leaderboard.getFormattedStats();
  const records = session.leaderboard.getRecords();
  const globalEntries = session.leaderboard.getGlobalEntries();

  useEffect(() => {
    const errorSub = session.eventBus.subscribe("leaderboard:error", (data) => {
      const payload = data as { error?: string };
      if (typeof payload.error === "string" && payload.error.length > 0) {
        setError(payload.error);
      }
    });
    const updateSub = session.eventBus.subscribe(
      "leaderboard:globalUpdated",
      () => {
        setError(null);
        session.leaderboard.clearError();
        setGlobalTick((n) => n + 1);
      },
    );
    return () => {
      session.eventBus.unsubscribe(errorSub);
      session.eventBus.unsubscribe(updateSub);
    };
  }, [session]);

  return (
    <section class="hub-panel" data-testid="leaderboard-panel">
      <h2 class="game__heading">{session.i18n.translate("hub.leaderboard")}</h2>

      <div class="game__actions">
        <button
          type="button"
          class={
            tab === "personal" ? "game__btn game__btn--primary" : "game__btn"
          }
          data-testid="leaderboard-tab-personal"
          onClick={() => {
            setTab("personal");
          }}
        >
          Persönlich
        </button>
        <button
          type="button"
          class={
            tab === "global" ? "game__btn game__btn--primary" : "game__btn"
          }
          data-testid="leaderboard-tab-global"
          onClick={() => {
            setTab("global");
            session.leaderboard.fetch();
          }}
        >
          Global
        </button>
      </div>

      {error !== null ? (
        <p class="game__meta" role="alert" data-testid="leaderboard-error">
          {error}
        </p>
      ) : null}

      {tab === "personal" ? (
        <>
          <ul class="hub-list">
            {Object.entries(stats).map(([label, value]) => (
              <li key={label} class="hub-card hub-card--compact">
                <p class="hub-card__title">{label}</p>
                <p class="game__meta">{value}</p>
              </li>
            ))}
          </ul>
          <p class="game__meta">
            Sitzungen: {String(records.sessionCount)} · Spielzeit:{" "}
            {String(Math.floor(records.totalPlayTime / 60))} min
          </p>
          <button
            type="button"
            class="game__btn"
            data-testid="leaderboard-reset"
            onClick={() => {
              session.leaderboard.reset();
            }}
          >
            Rekorde zurücksetzen
          </button>
        </>
      ) : (
        <>
          <div class="game__actions">
            <button
              type="button"
              class="game__btn"
              data-testid="leaderboard-refresh"
              onClick={() => {
                session.leaderboard.fetch();
              }}
            >
              Aktualisieren
            </button>
          </div>
          <ul class="hub-list" data-testid="leaderboard-global-list">
            {globalEntries.length === 0 ? (
              <li class="game__meta">
                Keine globalen Einträge (Server offline?).
              </li>
            ) : (
              globalEntries.map((entry, index) => (
                <li key={entry.userId} class="hub-card hub-card--compact">
                  <p class="hub-card__title">
                    #{String(index + 1)} {entry.username}
                  </p>
                  <p class="game__meta">
                    Prestige {String(entry.prestige)} · Bosse{" "}
                    {String(entry.bosses)} · Lvl {String(entry.level)}
                  </p>
                </li>
              ))
            )}
          </ul>
        </>
      )}
    </section>
  );
}
