import type { GameSession } from "../../services/game-session";
import { useStore } from "../useStore";

type Props = {
  readonly session: GameSession;
};

export function QuestPanel({ session }: Props) {
  const state = useStore(session.store);
  const locale = state.settings.locale;
  const current = session.quests.getCurrentQuest();
  const complete = session.quests.isCurrentQuestComplete();
  const dailies = session.quests.getDailyQuests();

  return (
    <section class="hub-panel" data-testid="quest-panel">
      <h2 class="game__heading">{session.i18n.translate("hub.quests")}</h2>

      {current ? (
        <article class="hub-card">
          <p class="hub-card__title">
            {locale === "en" ? current.text_en : current.text}
          </p>
          <p class="game__meta">
            {locale === "en" ? current.rewardText_en : current.rewardText}
          </p>
          <button
            type="button"
            class="game__btn game__btn--primary"
            data-testid="claim-main-quest"
            disabled={!complete}
            onClick={() => {
              session.quests.claimReward();
            }}
          >
            {complete ? "Claim reward" : "In progress"}
          </button>
        </article>
      ) : (
        <p class="game__meta">All main quests completed.</p>
      )}

      <h3 class="panel__sub">{session.i18n.translate("hub.daily")}</h3>
      <ul class="hub-list">
        {dailies.map((daily) => (
          <li key={daily.id} class="hub-card hub-card--compact">
            <p class="hub-card__title">
              {locale === "en" ? daily.text_en : daily.text}
            </p>
            <p class="game__meta">
              {daily.progress}/{daily.target}
            </p>
            <button
              type="button"
              class="game__btn"
              data-testid={`claim-daily-${daily.id}`}
              disabled={!daily.isComplete || daily.isClaimed}
              onClick={() => {
                session.quests.claimDailyReward(daily.id);
              }}
            >
              {daily.isClaimed ? "Claimed" : "Claim"}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
