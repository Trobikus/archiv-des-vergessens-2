import { LORE_NODES } from "@adv/content";
import { formatAmount } from "@adv/core";

import type { GameSession } from "../../services/game-session";
import { useStore } from "../useStore";

type Props = {
  readonly session: GameSession;
};

export function CodexPanel({ session }: Props) {
  const state = useStore(session.store);
  const entries = session.codex.getEntries();
  const progress = session.codex.getProgress();
  const unlocked = entries.filter((entry) => entry.unlocked);
  const locked = entries.filter((entry) => !entry.unlocked);

  return (
    <section class="phase6-panel" data-testid="codex-panel">
      <h2 class="game__heading">{session.i18n.translate("hub.codex")}</h2>
      <p class="game__meta">
        {String(unlocked.length)}/{String(entries.length)} · {String(progress)}%
      </p>

      <h3 class="panel__sub">Freigeschaltet</h3>
      <ul class="panel__list">
        {unlocked.map((entry) => (
          <li key={entry.id} data-testid={`codex-entry-${entry.id}`}>
            {entry.icon} {entry.title}
            <p class="game__meta">{entry.description}</p>
            {entry.lore ? <p class="phase6-panel__text">{entry.lore}</p> : null}
          </li>
        ))}
        {unlocked.length === 0 ? (
          <li class="game__meta">Noch keine Einträge.</li>
        ) : null}
      </ul>

      {locked.length > 0 ? (
        <>
          <h3 class="panel__sub">Verschlossen</h3>
          <ul class="panel__list">
            {locked.slice(0, 6).map((entry) => (
              <li key={entry.id}>??? · {entry.category}</li>
            ))}
          </ul>
        </>
      ) : null}

      <h3 class="panel__sub">Lore-Chroniken</h3>
      <ul class="panel__list">
        {Object.values(LORE_NODES).map((node) => {
          const decrypted = state.codex.decryptedLoreIds.includes(node.id);
          const canDecrypt =
            !decrypted &&
            state.hero.prestige.bossProgress >= node.requiredBoss &&
            state.resources.particles >= BigInt(node.cost);
          return (
            <li key={node.id} data-testid={`lore-node-${node.id}`}>
              {node.title}
              {decrypted ? " ✓" : ""}
              {!decrypted ? (
                <div class="game__actions">
                  {node.choices.map((choice) => (
                    <button
                      key={choice.id}
                      type="button"
                      class="game__btn"
                      data-testid={`lore-decrypt-${node.id}-${choice.id}`}
                      disabled={!canDecrypt}
                      title={`${formatAmount(node.cost)} Partikel`}
                      onClick={() => {
                        session.codex.decryptNode(node.id, choice.id);
                      }}
                    >
                      {choice.title}
                    </button>
                  ))}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
