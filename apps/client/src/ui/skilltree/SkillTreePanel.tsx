import { TALENT_NODES } from "@adv/content";

import type { GameSession } from "../../services/game-session";
import { useStore } from "../useStore";

type Props = {
  readonly session: GameSession;
};

export function SkillTreePanel({ session }: Props) {
  const state = useStore(session.store);
  const allocated = new Set(state.talents.allocatedNodeIds);
  const nodes = Object.values(TALENT_NODES);

  return (
    <section class="hub-panel" data-testid="skilltree-panel">
      <h2 class="game__heading">{session.i18n.translate("hub.skilltree")}</h2>
      <p class="game__meta">
        Points: {String(state.talents.points)} · Nodes:{" "}
        {String(allocated.size)}
      </p>

      <div class="hub-skill-grid">
        {nodes.map((node) => {
          const isAllocated = allocated.has(node.id);
          const canAllocate = session.talents.isNodeAllocatable(node.id);
          const canUnallocate = session.talents.canUnallocateNode(node.id);
          return (
            <article
              key={node.id}
              class={
                isAllocated
                  ? "hub-skill-node tip tip--below is-allocated"
                  : canAllocate
                    ? "hub-skill-node tip tip--below is-available"
                    : "hub-skill-node tip tip--below"
              }
            >
              <p class="hub-skill-node__icon">{node.icon}</p>
              <p class="hub-skill-node__name">{node.name}</p>
              <p class="game__meta">Cost {String(node.cost)}</p>
              <span class="tip__bubble" role="tooltip">
                <strong class="tip__title">{node.name}</strong>
                <span>{node.description}</span>
              </span>
              {isAllocated ? (
                <button
                  type="button"
                  class="game__btn"
                  data-testid={`talent-unallocate-${node.id}`}
                  disabled={!canUnallocate}
                  onClick={() => {
                    session.talents.unallocateNode(node.id);
                  }}
                >
                  Refund
                </button>
              ) : (
                <button
                  type="button"
                  class="game__btn game__btn--primary"
                  data-testid={`talent-allocate-${node.id}`}
                  disabled={!canAllocate}
                  onClick={() => {
                    session.talents.allocateNode(node.id);
                  }}
                >
                  Allocate
                </button>
              )}
            </article>
          );
        })}
      </div>

      <button
        type="button"
        class="game__btn game__btn--ghost"
        onClick={() => {
          session.talents.resetTalents();
        }}
      >
        Reset tree
      </button>
    </section>
  );
}
