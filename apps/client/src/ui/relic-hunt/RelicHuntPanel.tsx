import { formatAmount, formatDuration } from "@adv/core";
import { CONFIG } from "@adv/sim";
import { useEffect, useState } from "preact/hooks";

import type { GameSession } from "../../services/game-session";
import { Tip } from "../Tip";
import { useStore } from "../useStore";

type Props = {
  readonly session: GameSession;
};

export function RelicHuntPanel({ session }: Props) {
  useStore(session.store);
  const [cooldown, setCooldown] = useState(session.relicHunt.getCooldownStatus());
  const [message, setMessage] = useState<string | null>(null);
  const chance = Math.round(session.relicHunt.getSuccessChance() * 100);
  const t = session.i18n.translate.bind(session.i18n);

  useEffect(() => {
    const tick = (): void => {
      setCooldown(session.relicHunt.getCooldownStatus());
    };
    tick();
    const id = setInterval(tick, 500);
    return () => {
      clearInterval(id);
    };
  }, [session]);

  useEffect(() => {
    const sub = session.eventBus.subscribe("relicHunt:result", (data) => {
      const payload = data as { message?: string };
      setMessage(payload.message ?? null);
    });
    return () => {
      session.eventBus.unsubscribe(sub);
    };
  }, [session]);

  return (
    <section class="phase6-panel" data-testid="relic-hunt-panel">
      <h2 class="game__heading">{t("hub.relicHunt")}</h2>
      <p class="game__meta">
        Kosten: {formatAmount(CONFIG.RELIC_HUNT.COST)}{" "}
        {t("resource.particles")} ·{" "}
        <Tip title="Chance" text={t("relicHunt.chanceTip")}>
          Chance {String(chance)}%
        </Tip>
      </p>
      {cooldown.ready ? (
        <p class="game__meta" data-testid="relic-hunt-ready">
          Bereit zur Jagd
        </p>
      ) : (
        <p class="game__meta" data-testid="relic-hunt-cooldown">
          Cooldown: {formatDuration(cooldown.remaining)}
        </p>
      )}
      {message ? <p class="phase6-panel__message">{message}</p> : null}
      <div class="game__actions">
        <button
          type="button"
          class="game__btn game__btn--primary"
          data-testid="relic-hunt-start"
          disabled={!cooldown.ready}
          onClick={() => {
            const result = session.relicHunt.performHunt();
            setMessage(result.message);
            setCooldown(session.relicHunt.getCooldownStatus());
          }}
        >
          Jagd starten
        </button>
      </div>
    </section>
  );
}
