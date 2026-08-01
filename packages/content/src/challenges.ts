import type { ChallengeDefinition } from "./types";

/** From v1 `js/data/challenges.js`. */
export const CHALLENGES_DATA = {
  pacifist: {
    id: "pacifist",
    name: "Pazifist",
    desc: "Erreiche Kapitel 3 ohne eine Waffe auszurüsten.",
    rewardDesc: "Schaltet einen zweiten Ring-Slot frei.",
    targetChapter: 3
  },
  drought: {
    id: "drought",
    name: "Ressourcen-Dürre",
    desc: "Sammler produzieren 80% weniger. Erreiche Kapitel 3.",
    rewardDesc: "+50% Basis-Produktion permanent.",
    targetChapter: 3
  }
} as const satisfies Record<string, ChallengeDefinition>;
