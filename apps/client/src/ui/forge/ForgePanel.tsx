import { formatAmount } from "@adv/core";

import type { GameSession } from "../../services/game-session";
import { Tip, TipBubble } from "../Tip";
import { useStore } from "../useStore";

type Props = {
  readonly session: GameSession;
};

export function ForgePanel({ session }: Props) {
  const state = useStore(session.store);
  const recipes = session.forge.getRecipes();
  const t = session.i18n.translate.bind(session.i18n);

  return (
    <section class="hub-panel" data-testid="forge-panel">
      <h2 class="game__heading">{t("hub.forge")}</h2>
      <p class="game__meta">
        Crafted: {String(state.forge.craftedCount)} ·{" "}
        <Tip
          title={t("resource.memoryDust")}
          text={t("resource.tip.memoryDust")}
        >
          Dust: {formatAmount(state.resources.memoryDust)}
        </Tip>
      </p>

      <ul class="hub-list">
        {recipes.map((recipe) => {
          const cost = session.forge.getRecipeCost(recipe);
          const costLabel = Object.entries(cost)
            .map(([key, amount]) => `${key}: ${String(amount)}`)
            .join(", ");
          return (
            <li key={recipe.id} class="hub-card hub-card--compact">
              <p class="hub-card__title">{recipe.name}</p>
              <p class="game__meta">{recipe.desc}</p>
              <p class="game__meta">{costLabel}</p>
              <button
                type="button"
                class="game__btn game__btn--primary"
                data-testid={`forge-craft-${recipe.id}`}
                onClick={() => {
                  session.forge.craft(recipe.id);
                }}
              >
                Craft
              </button>
            </li>
          );
        })}
      </ul>

      {state.hero.inventory.equipment.length > 0 ? (
        <>
          <h3 class="panel__sub tip tip--below">
            {t("forge.salvage")}
            <TipBubble title={t("forge.salvage")}>{t("forge.salvageTip")}</TipBubble>
          </h3>
          <ul class="hub-list">
            {state.hero.inventory.equipment.map((item, index) => (
              <li key={item.id} class="hub-card hub-card--compact">
                <p class="hub-card__title">{item.name}</p>
                <p class="game__meta">
                  {item.rarity} · Lv {String(item.level)}
                </p>
                <Tip text={t("forge.salvageTip")}>
                  <button
                    type="button"
                    class="game__btn"
                    disabled={item.rarity !== "common"}
                    onClick={() => {
                      session.forge.salvageItem(index);
                    }}
                  >
                    {t("forge.salvage")}
                  </button>
                </Tip>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}
