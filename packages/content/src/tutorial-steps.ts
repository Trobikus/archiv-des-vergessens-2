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
        title_en: "The Awakening",
        text: "Die Welten brannten im eisigen Wind des Vergessens. Nur das mystische <b>Archiv des Vergessens</b> steht noch als letzte Bastion des Seins.",
        text_en:
          "The worlds burned in the icy wind of forgetting. Only the mystic <b>Archive of Forgetting</b> still stands as the last bastion of being.",
        target: null,
        action: "next",
      },
      {
        title: "Die Berufung",
        title_en: "The Calling",
        text: "Du bist Hüter der verlorenen Mnemes. Sammle Erinnerungspartikel, um das Archiv wiederaufzubauen.",
        text_en:
          "You are keeper of the lost Mneme. Gather memory particles to rebuild the Archive.",
        target: null,
        action: "next",
      },
      {
        text: "Öffne zuerst das <b>Archiv</b>.",
        text_en: "First open the <b>Archive</b>.",
        target: "#hub-archive",
        action: "click_target",
      },
      {
        text: "Klicke mehrmals auf <b>Sammeln</b>, bis du mindestens 50 Partikel hast.",
        text_en:
          "Click <b>Gather</b> until you have at least 50 particles.",
        target: "#manual-gather-btn",
        action: "wait_event",
      },
      {
        text: "Verbessere nun deine <b>Klickkraft</b> (Kosten: 50 Partikel).",
        text_en: "Now upgrade your <b>Click Power</b> (cost: 50 particles).",
        target: "#upgrade-click-btn",
        action: "click_target",
      },
      {
        title: "Der erste Schritt",
        title_en: "The First Step",
        text: "Gut. Sammeln und Verbessern sind der Kern des Archivs. Als Nächstes: öffne die <b>Chronik</b> und starte den ersten Boss.",
        text_en:
          "Good. Gathering and upgrading are the core of the Archive. Next: open the <b>Chronicle</b> and start the first boss.",
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
        title_en: "The First Victory",
        text: "Du hast den ersten Wächter der Vergessenheit bezwungen. Zeit, Held und Chronik-Kämpfe bewusst zu nutzen.",
        text_en:
          "You defeated the first guardian of forgetting. Time to use hero and Chronicle fights with intent.",
        target: null,
        action: "next",
      },
      {
        text: "Öffne <b>Held</b> — hier verteilst du Attribute und rüstest Beute.",
        text_en:
          "Open <b>Hero</b> — spend attributes and equip loot here.",
        target: "#hub-hero",
        action: "click_target",
      },
      {
        text: "Attribute, Ausrüstung und Inventar findest du hier. Wechsle danach zurück über die Hub-Leiste.",
        text_en:
          "Attributes, equipment, and inventory live here. Then return via the hub bar.",
        target: "#hero-close",
        action: "click_target",
        dialogPosition: "bottom_center",
      },
      {
        text: "Unter <b>Chronik</b> wartest du auf den nächsten Boss. Kämpfe freischalten Kapitel — einer nach dem anderen.",
        text_en:
          "Under <b>Chronicle</b> you face the next boss. Fights unlock chapters — one after another.",
        target: "#hub-story",
        action: "click_target",
      },
      {
        title: "Bereit",
        title_en: "Ready",
        text: "Held stärken, Boss besiegen, Fortschritt sichern — so wächst der Bund.",
        text_en:
          "Strengthen the hero, defeat bosses, secure progress — that is how the bond grows.",
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
        title_en: "The Workshop",
        text: "Mit dem ersten Boss-Sieg öffnen sich frühe Rezepte. Die Werkstatt formt Beute zu Macht.",
        text_en:
          "The first boss victory unlocks early recipes. The workshop turns loot into power.",
        target: null,
        action: "next",
      },
      {
        text: "Öffne die <b>Werkstatt</b>.",
        text_en: "Open the <b>Workshop</b>.",
        target: '[data-testid="tab-workshop"]',
        action: "click_target",
      },
      {
        text: "Wechsle zu <b>Handwerk</b> — dort liegen die freigeschalteten Meisterrezepte.",
        text_en:
          "Switch to <b>Crafting</b> — unlocked master recipes wait there.",
        target: '[data-testid="tab-crafting"]',
        action: "click_target",
      },
      {
        title: "Geschmiedet",
        title_en: "Forged",
        text: "Weitere Stufen folgen mit höheren Bossen. Schmiede und Bibliothek warten in derselben Werkstatt.",
        text_en:
          "Further tiers follow with higher bosses. Forge and library wait in the same workshop.",
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
        title_en: "Servants of the Bond",
        text: "Dein Auftrag verlangt Gefährten. Sammler, Weber und Wächter arbeiten, während du fehlst.",
        text_en:
          "Your charge needs companions. Collectors, weavers, and guardians work while you are away.",
        target: null,
        action: "next",
      },
      {
        text: "Öffne den Bereich <b>Social</b> / Gilde in der Hub-Leiste.",
        text_en: "Open <b>Social</b> / Guild in the hub bar.",
        target: '[data-testid="tab-social"]',
        action: "click_target",
      },
      {
        text: "Wechsle zum Tab <b>Clan</b>.",
        text_en: "Switch to the <b>Clan</b> tab.",
        target: '[data-testid="tab-clan"]',
        action: "click_target",
      },
      {
        text: "Hier rekrutierst du Gefährten:<br/><br/>• <b>Sammler</b> (10 Partikel)<br/>• <b>Weber</b> (25 Partikel)<br/>• <b>Wächter</b> (40 Partikel)",
        text_en:
          "Recruit companions here:<br/><br/>• <b>Collector</b> (10 particles)<br/>• <b>Weaver</b> (25 particles)<br/>• <b>Guardian</b> (40 particles)",
        target: "#clan-recruit-panel",
        action: "next",
      },
      {
        title: "Verbunden",
        title_en: "Bound",
        text: "Rekrutiere, sende Expeditionen, starte Raids — der Clan trägt den Idle-Fortschritt.",
        text_en:
          "Recruit, send expeditions, start raids — the clan carries idle progress.",
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
        title_en: "The Memory",
        text: "Kapitel zwei öffnet tiefere Lore. Der Codex bewahrt, was die Bosse freigeben.",
        text_en:
          "Chapter two opens deeper lore. The Codex keeps what bosses unlock.",
        target: null,
        action: "next",
      },
      {
        text: "Öffne die <b>Sammlung</b>.",
        text_en: "Open the <b>Collection</b>.",
        target: '[data-testid="tab-collection"]',
        action: "click_target",
      },
      {
        text: "Wechsle zum <b>Codex</b> — Einträge und entschlüsselbare Lore-Knoten warten dort.",
        text_en:
          "Switch to the <b>Codex</b> — entries and decryptable lore nodes wait there.",
        target: '[data-testid="tab-codex"]',
        action: "click_target",
      },
      {
        title: "Bewahrt",
        title_en: "Preserved",
        text: "Neue Bosse und Lore-Knoten erweitern dieses Archiv. Lies, wenn du Atem holst.",
        text_en:
          "New bosses and lore nodes expand this archive. Read when you catch your breath.",
        target: null,
        action: "finish",
      },
    ],
  },
} as const satisfies Record<TutorialGuideId, TutorialGuide>;

/** Flat archiv steps (alias of TUTORIAL_GUIDES.archiv.steps). */
export const TUTORIAL_STEPS = TUTORIAL_GUIDES.archiv.steps;
