import { CODEX_ENTRIES, LORE_NODES, type CodexEntry, type StoryBoss } from "@adv/content";
import type { EventBus, Store } from "@adv/core";

import type { GameState } from "../state/game-state";

export type CodexEntryView = CodexEntry & {
  readonly unlocked: boolean;
  readonly unlockedAt: number | null;
};

export type CodexService = {
  unlockEntry(entryId: string): boolean;
  isUnlocked(entryId: string): boolean;
  getEntry(entryId: string): CodexEntryView | null;
  getEntries(): readonly CodexEntryView[];
  getProgress(): number;
  decryptNode(nodeId: string, choiceId: string): boolean;
  destroy(): void;
};

const BOSS_UNLOCK_MAP: Record<number, string> = {
  1: "origin_of_mneme",
  5: "the_great_forgetting",
  10: "the_covenant",
};

export function createCodexService(
  store: Store<GameState>,
  eventBus: EventBus,
): CodexService {
  const bossSub = eventBus.subscribe("story:bossDefeated", (data) => {
    const payload = data as { boss?: StoryBoss };
    if (!payload.boss) {
      return;
    }
    const boss = payload.boss;
    for (const entry of Object.values(CODEX_ENTRIES)) {
      if (
        entry.category === "bosses" &&
        entry.title.toLowerCase().includes(boss.name.toLowerCase())
      ) {
        service.unlockEntry(entry.id);
      }
    }
    const mapped = BOSS_UNLOCK_MAP[boss.id];
    if (mapped) {
      service.unlockEntry(mapped);
    }
  });

  const endingSub = eventBus.subscribe("story:endingReached", (data) => {
    const payload = data as { endingId?: string };
    if (!payload.endingId) {
      return;
    }
    const entry = Object.values(CODEX_ENTRIES).find(
      (candidate) =>
        candidate.category === "endings" && candidate.id === payload.endingId,
    );
    if (entry) {
      service.unlockEntry(entry.id);
    }
  });

  const service: CodexService = {
    unlockEntry(entryId) {
      if (!(entryId in CODEX_ENTRIES)) {
        return false;
      }
      const def = CODEX_ENTRIES[entryId as keyof typeof CODEX_ENTRIES];
      const unlocked = store.getState().codex.unlockedIds;
      if (unlocked.includes(entryId)) {
        return false;
      }
      store.setState((prev) => ({
        ...prev,
        codex: {
          ...prev.codex,
          unlockedIds: [...prev.codex.unlockedIds, entryId],
        },
      }));
      eventBus.publish("codex:entryUnlocked", { entryId, entry: def });
      return true;
    },

    isUnlocked(entryId) {
      return store.getState().codex.unlockedIds.includes(entryId);
    },

    getEntry(entryId) {
      if (!(entryId in CODEX_ENTRIES)) {
        return null;
      }
      const def = CODEX_ENTRIES[entryId as keyof typeof CODEX_ENTRIES];
      return {
        ...def,
        unlocked: this.isUnlocked(entryId),
        unlockedAt: this.isUnlocked(entryId) ? Date.now() : null,
      };
    },

    getEntries() {
      const unlocked = new Set(store.getState().codex.unlockedIds);
      return Object.values(CODEX_ENTRIES).map((entry) => ({
        ...entry,
        unlocked: unlocked.has(entry.id),
        unlockedAt: unlocked.has(entry.id) ? Date.now() : null,
      }));
    },

    getProgress() {
      const total = Object.keys(CODEX_ENTRIES).length;
      if (total === 0) {
        return 0;
      }
      const count = store.getState().codex.unlockedIds.length;
      return Math.floor((count / total) * 100);
    },

    decryptNode(nodeId, choiceId) {
      if (!(nodeId in LORE_NODES)) {
        return false;
      }
      const node = LORE_NODES[nodeId as keyof typeof LORE_NODES];
      const state = store.getState();
      if (state.codex.decryptedLoreIds.includes(nodeId)) {
        return false;
      }
      if (state.hero.prestige.bossProgress < node.requiredBoss) {
        return false;
      }
      const cost = BigInt(node.cost);
      if (state.resources.particles < cost) {
        return false;
      }
      const choice = node.choices.find((entry) => entry.id === choiceId);
      if (!choice) {
        return false;
      }

      store.setState((prev) => ({
        ...prev,
        resources: {
          ...prev.resources,
          particles: prev.resources.particles - cost,
        },
        codex: {
          ...prev.codex,
          decryptedLoreIds: [...prev.codex.decryptedLoreIds, nodeId],
        },
      }));
      eventBus.publish("lore:nodeDecrypted", {
        nodeId,
        choiceId,
        effects: choice.effects,
      });
      return true;
    },

    destroy() {
      eventBus.unsubscribe(bossSub);
      eventBus.unsubscribe(endingSub);
    },
  };

  return service;
}
