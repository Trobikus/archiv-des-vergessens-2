import { formatAmount } from "@adv/core";

import type { GameSession } from "../../services/game-session";
import { useStore } from "../useStore";

type Props = {
  readonly session: GameSession;
};

export function AchievementPanel({ session }: Props) {
  const state = useStore(session.store);
  const achievements = session.achievements.getAchievements();
  const streak = session.dailyRewards.getStreak();
  const canClaimDaily = session.dailyRewards.canClaimToday();

  return (
    <section class="hub-panel" data-testid="achievement-panel">
      <h2 class="game__heading">
        {session.i18n.translate("hub.achievements")}
      </h2>

      <article class="hub-card hub-card--daily">
        <p class="hub-card__title">{session.i18n.translate("hub.daily")}</p>
        <p class="game__meta">
          Streak: {String(streak)} · Particles:{" "}
          {formatAmount(state.resources.particles)}
        </p>
        <button
          type="button"
          class="game__btn game__btn--primary"
          data-testid="claim-daily-reward"
          disabled={!canClaimDaily}
          onClick={() => {
            session.dailyRewards.claimDailyReward();
          }}
        >
          {canClaimDaily ? "Claim daily reward" : "Already claimed"}
        </button>
      </article>

      <ul class="hub-list">
        {achievements.map((ach) => (
          <li key={ach.id} class="hub-card hub-card--compact">
            <p class="hub-card__title">{ach.label}</p>
            <p class="game__meta">
              {ach.progress}/{ach.target}
              {ach.achieved ? " · Unlocked" : ""}
            </p>
            <button
              type="button"
              class="game__btn"
              data-testid={`claim-achievement-${ach.id}`}
              disabled={!ach.achieved || ach.claimed}
              onClick={() => {
                session.achievements.claimReward(ach.id);
              }}
            >
              {ach.claimed ? "Claimed" : ach.achieved ? "Claim" : "Locked"}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
