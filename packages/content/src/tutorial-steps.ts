import type { TutorialStep } from "./types";

/** Milestone-gated onboarding guides (short, one mechanic each). */
export const TUTORIAL_GUIDE_IDS = [
  "archiv",
  "combat_hero",
  "workshop",
  "clan",
  "codex",
] as const;

export type TutorialGuideId = (typeof TUTORIAL_GUIDE_IDS)[number];

export type TutorialGuide = {
  readonly id: TutorialGuideId;
  readonly steps: readonly TutorialStep[];
};

export type TutorialMilestone =
  | { readonly guideId: "archiv"; readonly trigger: "first_enter" }
  | {
      readonly guideId: "combat_hero";
      readonly trigger: "boss";
      readonly minBossProgress: number;
    }
  | {
      readonly guideId: "workshop";
      readonly trigger: "boss";
      readonly minBossProgress: number;
    }
  | {
      readonly guideId: "clan";
      readonly trigger: "quest_index";
      readonly minMainIndex: number;
    }
  | {
      readonly guideId: "codex";
      readonly trigger: "boss";
      readonly minBossProgress: number;
    };

/** Evaluation order when several guides unlock at once. */
export const TUTORIAL_MILESTONES = [
  { guideId: "archiv", trigger: "first_enter" },
  { guideId: "combat_hero", trigger: "boss", minBossProgress: 1 },
  { guideId: "workshop", trigger: "boss", minBossProgress: 1 },
  /** q2 (recruit collector) becomes active at mainIndex 1. */
  { guideId: "clan", trigger: "quest_index", minMainIndex: 1 },
  { guideId: "codex", trigger: "boss", minBossProgress: 10 },
] as const satisfies readonly TutorialMilestone[];

export const TUTORIAL_GUIDES = {
  archiv: {
    id: "archiv",
    steps: [
      {
        title: "Das Erwachen",
        text: "Die Welten brannten im eisigen Wind des Vergessens. Nur das mystische <b>Archiv des Vergessens</b> steht noch als letzte Bastion des Seins.",
        target: null,
        action: "next",
      },
      {
        title: "Die Berufung",
        text: "Du bist Hüter der verlorenen Mnemes. Sammle Erinnerungspartikel, um das Archiv wiederaufzubauen.",
        target: null,
        action: "next",
      },
      {
        text: "Öffne zuerst das <b>Archiv</b>.",
        target: "#hub-archive",
        action: "click_target",
      },
      {
        text: "Klicke mehrmals auf <b>Mneme-Partikel extrahieren</b>, bis du mindestens 50 Partikel hast.",
        target: "#manual-gather-btn",
        action: "wait_event",
      },
      {
        text: "Verbessere nun deine <b>Klick-Stärke</b> (Kosten: 50 Partikel).",
        target: "#upgrade-click-btn",
        action: "click_target",
      },
      {
        title: "Der erste Schritt",
        text: "Gut. Extrahieren und Verbessern sind der Kern des Archivs. Weitere Lehren folgen, wenn die Geschichte sie freigibt.",
        target: null,
        action: "finish",
      },
    ],
  },
  combat_hero: {
    id: "combat_hero",
    steps: [
      {
        title: "Der erste Sieg",
        text: "Du hast den ersten Wächter der Vergessenheit bezwungen. Zeit, Held und Story-Kämpfe bewusst zu nutzen.",
        target: null,
        action: "next",
      },
      {
        text: "Öffne <b>Mein Held</b> — hier verteilst du Attribute und rüstest Beute.",
        target: "#hub-hero",
        action: "click_target",
      },
      {
        text: "Attribute, Ausrüstung und Inventar findest du hier. Wechsle danach zurück über die Hub-Leiste.",
        target: "#hero-close",
        action: "click_target",
        dialogPosition: "bottom_center",
      },
      {
        text: "Unter <b>Story</b> wartest du auf den nächsten Boss. Kämpfe freischalten Kapitel — einer nach dem anderen.",
        target: "#hub-story",
        action: "click_target",
      },
      {
        title: "Bereit",
        text: "Held stärken, Boss besiegen, Fortschritt sichern — so wächst der Bund.",
        target: null,
        action: "finish",
      },
    ],
  },
  workshop: {
    id: "workshop",
    steps: [
      {
        title: "Die Werkstatt",
        text: "Mit dem ersten Boss-Sieg öffnen sich frühe Rezepte. Die Werkstatt formt Beute zu Macht.",
        target: null,
        action: "next",
      },
      {
        text: "Öffne die <b>Werkstatt</b>.",
        target: '[data-testid="tab-workshop"]',
        action: "click_target",
      },
      {
        text: "Wechsle zu <b>Crafting</b> — dort liegen die freigeschalteten Meisterrezepte.",
        target: '[data-testid="tab-crafting"]',
        action: "click_target",
      },
      {
        title: "Geschmiedet",
        text: "Weitere Stufen folgen mit höheren Bossen. Schmiede und Bibliothek warten in derselben Werkstatt.",
        target: null,
        action: "finish",
      },
    ],
  },
  clan: {
    id: "clan",
    steps: [
      {
        title: "Die Diener des Bundes",
        text: "Dein Auftrag verlangt Gefährten. Sammler, Weber und Wächter arbeiten, während du fehlst.",
        target: null,
        action: "next",
      },
      {
        text: "Öffne den Bereich <b>Social</b> / Gilde in der Hub-Leiste.",
        target: '[data-testid="tab-social"]',
        action: "click_target",
      },
      {
        text: "Wechsle zum Tab <b>Clan</b>.",
        target: '[data-testid="tab-clan"]',
        action: "click_target",
      },
      {
        text: "Hier rekrutierst du Gefährten:<br/><br/>• <b>Sammler</b> (10 Partikel)<br/>• <b>Weber</b> (25 Partikel)<br/>• <b>Wächter</b> (40 Partikel)",
        target: "#clan-recruit-panel",
        action: "next",
      },
      {
        title: "Verbunden",
        text: "Rekrutiere, sende Expeditionen, starte Raids — der Clan trägt den Idle-Fortschritt.",
        target: null,
        action: "finish",
      },
    ],
  },
  codex: {
    id: "codex",
    steps: [
      {
        title: "Das Gedächtnis",
        text: "Kapitel zwei öffnet tiefere Lore. Der Codex bewahrt, was die Bosse freigeben.",
        target: null,
        action: "next",
      },
      {
        text: "Öffne die <b>Sammlung</b>.",
        target: '[data-testid="tab-collection"]',
        action: "click_target",
      },
      {
        text: "Wechsle zum <b>Codex</b> — Einträge und entschlüsselbare Lore-Knoten warten dort.",
        target: '[data-testid="tab-codex"]',
        action: "click_target",
      },
      {
        title: "Bewahrt",
        text: "Neue Bosse und Lore-Knoten erweitern dieses Archiv. Lies, wenn du Atem holst.",
        target: null,
        action: "finish",
      },
    ],
  },
} as const satisfies Record<TutorialGuideId, TutorialGuide>;

/** Flat archiv steps (alias of TUTORIAL_GUIDES.archiv.steps). */
export const TUTORIAL_STEPS = TUTORIAL_GUIDES.archiv.steps;
