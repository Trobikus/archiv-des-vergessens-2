import type { StatKey } from "@adv/sim";

import type { GameSession } from "../../services/game-session";
import { useStore } from "../useStore";

type Props = {
  readonly session: GameSession;
};

const STATS: readonly StatKey[] = ["attack", "defense", "agility", "stamina"];

export function HeroPanel({ session }: Props) {
  const state = useStore(session.store);
  const attrs = session.hero.getAttributes();
  const combat = session.hero.getCombatStats();
  const hero = state.hero;

  return (
    <section class="panel" data-testid="hero-panel">
      <h2 class="game__heading">{session.i18n.translate("hub.hero")}</h2>
      <p class="game__stat">
        {hero.name}
        <span class="game__unit"> · {hero.title}</span>
      </p>
      <p class="game__meta">
        {session.i18n.translate("hero.level")} {String(hero.level)} ·{" "}
        {session.i18n.translate("hero.xp")} {String(hero.experience)}/
        {String(hero.expToNext)}
      </p>
      <p class="game__meta">
        {session.i18n.translate("hero.hp")} {String(combat.maxHp)} ·{" "}
        {session.i18n.translate("hero.atk")} {String(attrs.attack)} ·{" "}
        {session.i18n.translate("hero.def")} {String(attrs.defense)} ·{" "}
        {session.i18n.translate("hero.crit")}{" "}
        {combat.critChance.toFixed(1)}%
      </p>

      <h3 class="panel__sub">{session.i18n.translate("hero.stats")}</h3>
      <p class="game__meta">
        Punkte: {String(hero.unspentStatPoints)}
      </p>
      <div class="game__actions">
        {STATS.map((stat) => (
          <button
            key={stat}
            type="button"
            class="game__btn"
            data-testid={`spend-${stat}`}
            disabled={hero.unspentStatPoints <= 0}
            onClick={() => {
              session.hero.spendStatPoint(stat);
            }}
          >
            {stat} ({String(hero.spentStats[stat])})
          </button>
        ))}
      </div>

      <h3 class="panel__sub">{session.i18n.translate("hero.equipment")}</h3>
      <ul class="panel__list">
        {(
          Object.keys(hero.equipment) as Array<keyof typeof hero.equipment>
        ).map((slot) => {
          const item = hero.equipment[slot];
          return (
            <li key={slot}>
              {slot}: {item === null ? "—" : item.name}
              {item !== null ? (
                <button
                  type="button"
                  class="game__btn game__btn--ghost"
                  onClick={() => {
                    session.hero.unequip(slot);
                  }}
                >
                  ×
                </button>
              ) : null}
            </li>
          );
        })}
      </ul>

      <h3 class="panel__sub">{session.i18n.translate("hero.inventory")}</h3>
      <ul class="panel__list" data-testid="hero-inventory">
        {hero.inventory.equipment.length === 0 ? (
          <li>—</li>
        ) : (
          hero.inventory.equipment.map((item) => (
            <li key={item.id}>
              {item.name}{" "}
              <button
                type="button"
                class="game__btn"
                data-testid={`equip-${item.id}`}
                onClick={() => {
                  session.hero.equipFromInventory(item.id);
                }}
              >
                Equip
              </button>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
