import type { GameSession } from "../../services/game-session";
import { useStore } from "../useStore";

type Props = {
  readonly session: GameSession;
};

export function CraftingPanel({ session }: Props) {
  const state = useStore(session.store);
  const recipes = session.crafting.getAvailableRecipes();
  const progress = session.crafting.getLevelProgress();

  return (
    <section class="hub-panel" data-testid="crafting-panel">
      <h2 class="game__heading">{session.i18n.translate("hub.crafting")}</h2>
      <p class="game__meta">
        Level {String(state.crafting.level)} · {Math.floor(progress)}% to next
      </p>

      <ul class="hub-list">
        {recipes.map((recipe) => {
          const cost = session.crafting.getRecipeCost(recipe);
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
                data-testid={`craft-${recipe.id}`}
                onClick={() => {
                  session.crafting.craftMasterRecipe(recipe.id);
                }}
              >
                Craft
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
