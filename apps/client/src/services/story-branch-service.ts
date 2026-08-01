import {
  getStoryNode,
  isEndingNode,
  STORY_BRANCHES,
  type StoryBranchNode,
  type StoryBranchOption,
} from "@adv/content";
import type { EventBus, Store } from "@adv/core";

import type { GameState } from "../state/game-state";
import type { HeroService } from "./hero-service";

const START_NODE = "prologue";

export type StoryCondition = {
  readonly flag?: string;
  readonly value?: boolean | number | string;
  readonly requireFlags?: readonly string[];
  readonly excludeFlags?: readonly string[];
  readonly anyFlags?: readonly string[];
  readonly flags?: Record<string, boolean | number | string>;
  readonly bossDefeated?: number;
  readonly minBossProgress?: number;
  readonly prestigeLevel?: number;
  readonly minAethel?: number;
  readonly minLethe?: number;
  readonly maxAethel?: number;
  readonly maxLethe?: number;
  readonly op?: "and" | "or";
  readonly conditions?: readonly StoryCondition[];
};

export type ChooseOptionResult =
  | { readonly success: true; readonly node: StoryBranchNode; readonly flags: Record<string, boolean | number | string> }
  | { readonly success: false; readonly message: string };

export type StoryBranchService = {
  getCurrentNode(): StoryBranchNode | null;
  getAvailableOptions(): readonly StoryBranchOption[];
  chooseOption(optionId: string): ChooseOptionResult;
  resetStory(): void;
  canProgress(): boolean;
  getProgress(): number;
  getFlags(): Record<string, boolean | number | string>;
  hasFlag(key: string, expected?: boolean | number | string): boolean;
  setFlag(key: string, value?: boolean | number | string): void;
  setFlags(flagMap: Record<string, boolean | number | string>): void;
  getVisitedNodes(): readonly string[];
  getAffinity(): { readonly aethel: number; readonly lethe: number };
  destroy(): void;
};

function resolveCurrentNodeId(state: GameState): string {
  return state.storyBranch.currentNode ?? START_NODE;
}

function clampAffinity(value: number): number {
  return Math.min(100, Math.max(0, value));
}

export function createStoryBranchService(
  store: Store<GameState>,
  eventBus: EventBus,
  heroService?: HeroService,
): StoryBranchService {
  void heroService;

  const getBranch = () => store.getState().storyBranch;

  const getCurrentNode = (): StoryBranchNode | null => {
    const id = resolveCurrentNodeId(store.getState());
    return getStoryNode(id);
  };

  const allFlagsTruthy = (
    flags: Record<string, boolean | number | string>,
    keys: readonly string[],
  ): boolean => keys.every((key) => Boolean(flags[key]));

  const anyFlagTruthy = (
    flags: Record<string, boolean | number | string>,
    keys: readonly string[],
  ): boolean => keys.some((key) => Boolean(flags[key]));

  const evaluateCondition = (
    condition: StoryCondition | string | undefined,
    state: GameState,
  ): boolean => {
    if (condition === undefined) {
      return true;
    }
    if (typeof condition === "string") {
      return Boolean(state.storyBranch.flags[condition]);
    }

    const flags = state.storyBranch.flags;
    const hero = state.hero;
    const results: boolean[] = [];

    if (condition.conditions && condition.conditions.length > 0) {
      const nested = condition.conditions.map((entry) =>
        evaluateCondition(entry, state),
      );
      const op = condition.op === "or" ? "or" : "and";
      results.push(
        op === "or" ? nested.some(Boolean) : nested.every(Boolean),
      );
    }

    if (condition.flag !== undefined) {
      const expected = condition.value !== undefined ? condition.value : true;
      results.push(
        flags[condition.flag] === expected ||
          (expected === true && Boolean(flags[condition.flag])),
      );
    }

    if (condition.flags) {
      results.push(
        Object.entries(condition.flags).every(([key, expected]) => {
          if (expected === true) {
            return Boolean(flags[key]);
          }
          if (expected === false) {
            return !flags[key];
          }
          return flags[key] === expected;
        }),
      );
    }

    if (condition.requireFlags) {
      results.push(allFlagsTruthy(flags, condition.requireFlags));
    }
    if (condition.excludeFlags) {
      results.push(!anyFlagTruthy(flags, condition.excludeFlags));
    }
    if (condition.anyFlags) {
      results.push(anyFlagTruthy(flags, condition.anyFlags));
    }
    if (condition.bossDefeated !== undefined) {
      results.push(hero.prestige.defeatedBosses.includes(condition.bossDefeated));
    }
    if (condition.minBossProgress !== undefined) {
      results.push(hero.prestige.bossProgress >= condition.minBossProgress);
    }
    if (condition.prestigeLevel !== undefined) {
      results.push(hero.level >= condition.prestigeLevel);
    }
    if (condition.minAethel !== undefined) {
      results.push((Number(flags["aethel_affinity"]) || 0) >= condition.minAethel);
    }
    if (condition.minLethe !== undefined) {
      results.push((Number(flags["lethe_affinity"]) || 0) >= condition.minLethe);
    }
    if (condition.maxAethel !== undefined) {
      results.push((Number(flags["aethel_affinity"]) || 0) <= condition.maxAethel);
    }
    if (condition.maxLethe !== undefined) {
      results.push((Number(flags["lethe_affinity"]) || 0) <= condition.maxLethe);
    }

    if (results.length === 0) {
      return true;
    }
    const op = condition.op === "or" ? "or" : "and";
    return op === "or" ? results.some(Boolean) : results.every(Boolean);
  };

  const isOptionAvailable = (
    option: StoryBranchOption,
    state: GameState,
  ): boolean => {
    if (option.condition && !evaluateCondition(option.condition, state)) {
      return false;
    }
    if (
      option.requireFlags &&
      !allFlagsTruthy(state.storyBranch.flags, option.requireFlags)
    ) {
      return false;
    }
    return true;
  };

  const mergeFlags = (
    current: Record<string, boolean | number | string>,
    nodeFlags?: Record<string, number | boolean>,
    optionFlags?: Record<string, number | boolean>,
  ): Record<string, boolean | number | string> => {
    const out = { ...current };
    const apply = (src?: Record<string, number | boolean>) => {
      if (!src) {
        return;
      }
      for (const [key, value] of Object.entries(src)) {
        if (key === "aethel_affinity" || key === "lethe_affinity") {
          const prev = Number(out[key]) || 0;
          out[key] = clampAffinity(prev + (Number(value) || 0));
        } else {
          out[key] = value;
        }
      }
    };
    apply(nodeFlags);
    apply(optionFlags);
    return out;
  };

  const applyAffinityFromFlags = (
    flags: Record<string, boolean | number | string>,
    nodeFlags?: Record<string, number | boolean>,
    optionFlags?: Record<string, number | boolean>,
  ): void => {
    const sources = [nodeFlags, optionFlags].filter(Boolean) as Array<
      Record<string, number | boolean>
    >;
    let aethelDelta = 0;
    let letheDelta = 0;
    const aethelKeys = [
      "hero_path",
      "guardian_path",
      "secrets_path",
      "god_path",
      "seal_path",
      "epic_path",
      "malakor_spared",
      "theron_heard",
    ];
    const letheKeys = [
      "coward_path",
      "hidden_path",
      "scholar_path",
      "rebel_path",
      "lone_wolf_path",
      "void_path",
      "nyx_heard",
      "knowledge_gained",
    ];

    for (const src of sources) {
      for (const key of aethelKeys) {
        if (src[key] && !flags[`_aff_applied_${key}`]) {
          aethelDelta += 8;
          flags[`_aff_applied_${key}`] = true;
        }
      }
      for (const key of letheKeys) {
        if (src[key] && !flags[`_aff_applied_${key}`]) {
          letheDelta += 8;
          flags[`_aff_applied_${key}`] = true;
        }
      }
    }

    if (aethelDelta > 0) {
      flags["aethel_affinity"] = clampAffinity(
        (Number(flags["aethel_affinity"]) || 0) + aethelDelta,
      );
    }
    if (letheDelta > 0) {
      flags["lethe_affinity"] = clampAffinity(
        (Number(flags["lethe_affinity"]) || 0) + letheDelta,
      );
    }
  };

  const ensureStarted = (): void => {
    const branch = getBranch();
    if (branch.currentNode !== null) {
      return;
    }
    store.setState((prev) => ({
      ...prev,
      storyBranch: {
        ...prev.storyBranch,
        currentNode: START_NODE,
        visited: prev.storyBranch.visited.includes(START_NODE)
          ? prev.storyBranch.visited
          : [...prev.storyBranch.visited, START_NODE],
      },
    }));
  };

  return {
    getCurrentNode() {
      ensureStarted();
      return getCurrentNode();
    },

    getAvailableOptions() {
      ensureStarted();
      const node = getCurrentNode();
      if (!node || node.isEnding) {
        return [];
      }
      const state = store.getState();
      if (
        node.bossRequired !== undefined &&
        state.hero.prestige.bossProgress < node.bossRequired
      ) {
        return [];
      }
      return node.options.filter((option) => isOptionAvailable(option, state));
    },

    chooseOption(optionId) {
      ensureStarted();
      const node = getCurrentNode();
      if (!node) {
        return { success: false, message: "Kein aktueller Knoten." };
      }
      if (node.isEnding) {
        return { success: false, message: "Diese Geschichte ist bereits beendet." };
      }

      const option = node.options.find((entry) => entry.id === optionId);
      if (!option) {
        return { success: false, message: "Option nicht gefunden." };
      }

      const state = store.getState();
      if (
        node.bossRequired !== undefined &&
        state.hero.prestige.bossProgress < node.bossRequired
      ) {
        return {
          success: false,
          message: `Du musst zuerst mehr Bosse besiegen (${String(node.bossRequired)} benötigt).`,
        };
      }
      if (!isOptionAvailable(option, state)) {
        return {
          success: false,
          message: "Diese Option ist mit deinem bisherigen Pfad nicht verfügbar.",
        };
      }

      const fromId = resolveCurrentNodeId(state);
      const newFlags = mergeFlags(state.storyBranch.flags, node.flags, option.flags);
      applyAffinityFromFlags(newFlags, node.flags, option.flags);

      const nextNode = getStoryNode(option.next);
      if (!nextNode) {
        return {
          success: false,
          message: `Zielknoten "${option.next}" nicht gefunden.`,
        };
      }

      if (nextNode.flags) {
        Object.assign(newFlags, mergeFlags(newFlags, nextNode.flags));
        applyAffinityFromFlags(newFlags, nextNode.flags);
      }

      const historyEntry = `${fromId}|${optionId}|${option.next}`;
      const visited = state.storyBranch.visited.includes(option.next)
        ? state.storyBranch.visited
        : [...state.storyBranch.visited, option.next];

      store.setState((prev) => ({
        ...prev,
        storyBranch: {
          ...prev.storyBranch,
          currentNode: option.next,
          flags: newFlags,
          visited,
          history: [...prev.storyBranch.history, historyEntry],
          endingReached:
            nextNode.isEnding === true
              ? option.next
              : prev.storyBranch.endingReached,
        },
      }));

      if (nextNode.isEnding) {
        eventBus.publish("story:endingReached", {
          endingId: option.next,
          node: nextNode,
        });
      }

      eventBus.publish("story:branchChanged", {
        nodeId: option.next,
        node: nextNode,
        flags: { ...newFlags },
      });

      return { success: true, node: nextNode, flags: { ...newFlags } };
    },

    resetStory() {
      store.setState((prev) => ({
        ...prev,
        storyBranch: {
          currentNode: START_NODE,
          flags: {},
          visited: [START_NODE],
          history: [],
          endingReached: null,
        },
      }));
      eventBus.publish("story:branchReset", {});
    },

    canProgress() {
      const node = getCurrentNode();
      if (!node || node.isEnding) {
        return false;
      }
      const state = store.getState();
      if (
        node.bossRequired !== undefined &&
        state.hero.prestige.bossProgress < node.bossRequired
      ) {
        return false;
      }
      return this.getAvailableOptions().length > 0;
    },

    getProgress() {
      const total = Object.keys(STORY_BRANCHES).length;
      const visited = getBranch().visited.length;
      return Math.min(100, Math.floor((visited / total) * 100));
    },

    getFlags() {
      return { ...getBranch().flags };
    },

    hasFlag(key, expected = true) {
      const flags = getBranch().flags;
      if (expected === true) {
        return Boolean(flags[key]);
      }
      return flags[key] === expected;
    },

    setFlag(key, value = true) {
      store.setState((prev) => ({
        ...prev,
        storyBranch: {
          ...prev.storyBranch,
          flags: { ...prev.storyBranch.flags, [key]: value },
        },
      }));
      eventBus.publish("story:flagsChanged", { flags: this.getFlags() });
    },

    setFlags(flagMap) {
      store.setState((prev) => ({
        ...prev,
        storyBranch: {
          ...prev.storyBranch,
          flags: { ...prev.storyBranch.flags, ...flagMap },
        },
      }));
      eventBus.publish("story:flagsChanged", { flags: this.getFlags() });
    },

    getVisitedNodes() {
      return [...getBranch().visited];
    },

    getAffinity() {
      const flags = this.getFlags();
      return {
        aethel: clampAffinity(Number(flags["aethel_affinity"]) || 0),
        lethe: clampAffinity(Number(flags["lethe_affinity"]) || 0),
      };
    },

    destroy() {
      // no subscriptions
    },
  };
}

export { isEndingNode };
