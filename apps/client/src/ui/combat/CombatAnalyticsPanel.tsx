import type { GameSession } from "../../services/game-session";
import { useEffect, useId, useState } from "preact/hooks";

import { TipBubble } from "../Tip";

type Props = {
  readonly session: GameSession;
};

export function CombatAnalyticsPanel({ session }: Props) {
  const [, setTick] = useState(0);
  const t = session.i18n.translate.bind(session.i18n);
  const dpsTipId = useId();
  const totalTipId = useId();
  const maxHitTipId = useId();
  const critTipId = useId();

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
      <h2 class="game__heading">{t("hub.analytics")}</h2>
      <p class="game__meta">{t("hub.analyticsDesc")}</p>
      <dl class="phase6-stats">
        <div class="tip tip--below" tabIndex={0} aria-describedby={dpsTipId}>
          <dt>{t("analytics.dps")}</dt>
          <dd data-testid="analytics-dps">{String(stats.dps)}</dd>
          <TipBubble id={dpsTipId} title={t("analytics.dps")}>
            {t("analytics.dpsTip")}
          </TipBubble>
        </div>
        <div class="tip tip--below" tabIndex={0} aria-describedby={totalTipId}>
          <dt>{t("analytics.totalDamage")}</dt>
          <dd>{String(stats.totalDamage)}</dd>
          <TipBubble id={totalTipId} title={t("analytics.totalDamage")}>
            {t("analytics.totalDamageTip")}
          </TipBubble>
        </div>
        <div class="tip tip--below" tabIndex={0} aria-describedby={maxHitTipId}>
          <dt>{t("analytics.maxHit")}</dt>
          <dd>{String(stats.maxHit)}</dd>
          <TipBubble id={maxHitTipId} title={t("analytics.maxHit")}>
            {t("analytics.maxHitTip")}
          </TipBubble>
        </div>
        <div>
          <dt>Ø Treffer</dt>
          <dd>{String(stats.avgHit)}</dd>
        </div>
        <div>
          <dt>Treffer</dt>
          <dd>{String(stats.totalHits)}</dd>
        </div>
        <div class="tip tip--below" tabIndex={0} aria-describedby={critTipId}>
          <dt>{t("analytics.critRate")}</dt>
          <dd>{String(stats.critRatePercent)}</dd>
          <TipBubble id={critTipId} title={t("analytics.critRate")}>
            {t("analytics.critTip")}
          </TipBubble>
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
