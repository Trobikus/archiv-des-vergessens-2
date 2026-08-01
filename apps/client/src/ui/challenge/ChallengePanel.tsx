import type { GameSession } from "../../services/game-session";
import { useStore } from "../useStore";

type Props = {
  readonly session: GameSession;
};

export function ChallengePanel({ session }: Props) {
  const state = useStore(session.store);
  const challenges = session.challenges.getChallenges();
  const bonuses = session.challenges.getPermanentBonuses();

  return (
    <section class="hub-panel" data-testid="challenge-panel">
      <h2 class="game__heading">{session.i18n.translate("hub.challenges")}</h2>
      <p class="game__meta">
        Active: {state.challenges.active ?? "none"} · Completed:{" "}
        {String(state.challenges.completed.length)}
      </p>
      {bonuses.droughtBonus ? (
        <p class="game__meta">Permanent +50% idle production unlocked.</p>
      ) : null}
      {bonuses.pacifistRing ? (
        <p class="game__meta">Second ring slot unlocked.</p>
      ) : null}

      <ul class="hub-list">
        {challenges.map((challenge) => {
          const done = state.challenges.completed.includes(challenge.id);
          const active = state.challenges.active === challenge.id;
          return (
            <li key={challenge.id} class="hub-card hub-card--compact">
              <p class="hub-card__title">{challenge.name}</p>
              <p class="game__meta">{challenge.desc}</p>
              <p class="game__meta">{challenge.rewardDesc}</p>
              {done ? (
                <p class="game__meta">Completed</p>
              ) : active ? (
                <button
                  type="button"
                  class="game__btn"
                  onClick={() => {
                    session.challenges.abortChallenge();
                  }}
                >
                  Abort
                </button>
              ) : (
                <button
                  type="button"
                  class="game__btn game__btn--primary"
                  data-testid={`start-challenge-${challenge.id}`}
                  disabled={state.challenges.active !== null}
                  onClick={() => {
                    session.challenges.startChallenge(challenge.id);
                  }}
                >
                  Start
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
