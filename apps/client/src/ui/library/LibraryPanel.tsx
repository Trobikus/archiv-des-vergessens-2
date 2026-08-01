import { formatAmount } from "@adv/core";

import type { GameSession } from "../../services/game-session";
import { useStore } from "../useStore";

type Props = {
  readonly session: GameSession;
};

export function LibraryPanel({ session }: Props) {
  const state = useStore(session.store);
  const upgrades = session.library.getUpgrades();

  return (
    <section class="hub-panel" data-testid="library-panel">
      <h2 class="game__heading">{session.i18n.translate("hub.library")}</h2>
      <p class="game__meta">
        Particles: {formatAmount(state.resources.particles)}
      </p>

      <ul class="hub-list">
        {upgrades.map((upgrade) => {
          const cost = session.library.getUpgradeCost(upgrade.id);
          const costLabel = Object.entries(cost)
            .map(([key, amount]) => `${key}: ${String(amount)}`)
            .join(", ");
          const bonus = session.library.getBonus(upgrade.id);
          return (
            <li key={upgrade.id} class="hub-card hub-card--compact">
              <p class="hub-card__title">{upgrade.name}</p>
              <p class="game__meta">{upgrade.desc}</p>
              <p class="game__meta">
                Level {String(upgrade.level)}
                {upgrade.id === "gather_boost"
                  ? ` · +${String(Math.round(bonus * 100))}% gather`
                  : ""}
              </p>
              <p class="game__meta">{costLabel || "Maxed"}</p>
              <button
                type="button"
                class="game__btn game__btn--primary"
                data-testid={`library-buy-${upgrade.id}`}
                disabled={upgrade.isMaxed}
                onClick={() => {
                  session.library.buyUpgrade(upgrade.id);
                }}
              >
                Research
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
