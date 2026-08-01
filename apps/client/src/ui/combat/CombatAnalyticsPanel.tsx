import type { GameSession } from "../../services/game-session";
import { useEffect, useState } from "preact/hooks";

type Props = {
  readonly session: GameSession;
};

export function CombatAnalyticsPanel({ session }: Props) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setTick((value) => value + 1);
    }, 500);
    return () => {
      clearInterval(id);
    };
  }, []);

  const stats = session.combatAnalytics.getStats();

  return (
    <section class="phase6-panel" data-testid="combat-analytics-panel">
      <h2 class="game__heading">{session.i18n.translate("hub.analytics")}</h2>
      <p class="game__meta">{session.i18n.translate("hub.analyticsDesc")}</p>
      <dl class="phase6-stats">
        <div>
          <dt>DPS (10s)</dt>
          <dd data-testid="analytics-dps">{String(stats.dps)}</dd>
        </div>
        <div>
          <dt>Gesamtschaden</dt>
          <dd>{String(stats.totalDamage)}</dd>
        </div>
        <div>
          <dt>Max Treffer</dt>
          <dd>{String(stats.maxHit)}</dd>
        </div>
        <div>
          <dt>Ø Treffer</dt>
          <dd>{String(stats.avgHit)}</dd>
        </div>
        <div>
          <dt>Treffer</dt>
          <dd>{String(stats.totalHits)}</dd>
        </div>
        <div>
          <dt>Krit %</dt>
          <dd>{String(stats.critRatePercent)}</dd>
        </div>
        <div>
          <dt>Heilung</dt>
          <dd>{String(stats.totalHeal)}</dd>
        </div>
        <div>
          <dt>Dauer (s)</dt>
          <dd>{String(stats.durationSeconds)}</dd>
        </div>
      </dl>
      <div class="game__actions">
        <button
          type="button"
          class="game__btn game__btn--ghost"
          data-testid="analytics-reset"
          onClick={() => {
            session.combatAnalytics.reset();
          }}
        >
          Zurücksetzen
        </button>
      </div>
    </section>
  );
}
