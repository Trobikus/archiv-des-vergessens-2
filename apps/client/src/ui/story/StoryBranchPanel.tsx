import type { GameSession } from "../../services/game-session";
import { Tip } from "../Tip";
import { useStore } from "../useStore";

type Props = {
  readonly session: GameSession;
};

export function StoryBranchPanel({ session }: Props) {
  const state = useStore(session.store);
  const node = session.storyBranch.getCurrentNode();
  const options = session.storyBranch.getAvailableOptions();
  const affinity = session.storyBranch.getAffinity();
  const progress = session.storyBranch.getProgress();
  const t = session.i18n.translate.bind(session.i18n);

  if (!node) {
    return null;
  }

  return (
    <section class="phase6-panel" data-testid="story-branch-panel">
      <h3 class="panel__sub">{t("hub.story")}</h3>
      <p class="game__meta">
        {node.title} · {String(progress)}% ·{" "}
        <Tip title="Aethel" text={t("story.affinityTip.aethel")}>
          Aethel {String(affinity.aethel)}
        </Tip>
        {" / "}
        <Tip title="Lethe" text={t("story.affinityTip.lethe")}>
          Lethe {String(affinity.lethe)}
        </Tip>
      </p>
      <p class="phase6-panel__text">{node.text}</p>
      {node.isEnding ? (
        <p class="game__meta">Ende erreicht: {node.title}</p>
      ) : (
        <div class="game__actions">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              class="game__btn"
              data-testid={`story-option-${option.id}`}
              onClick={() => {
                session.storyBranch.chooseOption(option.id);
              }}
            >
              {option.text}
            </button>
          ))}
          {options.length === 0 ? (
            <p class="game__meta">
              {node.bossRequired !== undefined &&
              state.hero.prestige.bossProgress < node.bossRequired
                ? `Benötigt Boss-Fortschritt ${String(node.bossRequired)}`
                : "Keine Optionen verfügbar."}
            </p>
          ) : null}
        </div>
      )}
      <div class="game__actions">
        <button
          type="button"
          class="game__btn game__btn--ghost"
          data-testid="story-branch-reset"
          onClick={() => {
            session.storyBranch.resetStory();
          }}
        >
          Chronik zurücksetzen
        </button>
      </div>
    </section>
  );
}
