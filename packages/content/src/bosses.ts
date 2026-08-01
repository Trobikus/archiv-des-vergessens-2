import type { StoryBoss } from "./types";

/** Mirrors `CONFIG.STORY` in @adv/sim (word-identical to v1). */
const STORY_LAYOUT = {
  MAX_CHAPTERS: 10,
  FIGHTS_PER_CHAPTER: 10,
} as const;

export const BOSS_NAMES = [
  "Verlorener Schatten",
  "Gedankenwandler",
  "Nebelkreatur",
  "Staubgeist",
  "Fragment der Erinnerung",
  "Phantom des Archivs",
  "Rastloser Wächter",
  "Dunkles Echo"
] as const;

export const CHAPTER_BOSSES = [
  {
    name: "Rastloses Echo von Eldoria",
    items: [
      "Bruchstück der Gläsernen Ära"
    ]
  },
  {
    name: "Malakor, der gefallene Erste (Obsidiantitan)",
    items: [
      "Sternenlicht-Klinge des Hüters"
    ]
  },
  {
    name: "Schattenreiter der Seelenfluten",
    items: [
      "Seelenfänger-Amulett"
    ]
  },
  {
    name: "Aurelia, das schweigende Meer (Kristallträne)",
    items: [
      "Ring der unendlichen Gezeiten"
    ]
  },
  {
    name: "Eisernes Abwehrprogramm Alpha",
    items: [
      "Schattenstahl-Klinge"
    ]
  },
  {
    name: "Goliath-7, Die kybernetische Dämmerung",
    items: [
      "Rostplatte der Techno-Endzeit"
    ]
  },
  {
    name: "Der Namenlose Archivar",
    items: [
      "Zerrissenes Foliantenblatt"
    ]
  },
  {
    name: "Nyx, Herrin des sanften Vergessens",
    items: [
      "Dunkler Reif des Nichts"
    ]
  },
  {
    name: "Der Archivar der Ersten Dynastie",
    items: [
      "Inschrift-Schwert des Ur-Zirkels"
    ]
  },
  {
    name: "Die Chronistin des Schmerzes",
    items: [
      "Gewebte Chronisten-Robe"
    ]
  },
  {
    name: "Wächter der reinen Aethel-Mneme",
    items: [
      "Lichtbringer-Amulett"
    ]
  },
  {
    name: "Der Erinnerungssammler von Valanis",
    items: [
      "Reif der Ewigen Reue"
    ]
  },
  {
    name: "Der Erste Mnemoniker",
    items: [
      "Urahnen-Klinge der Ersten"
    ]
  },
  {
    name: "Die Urerinnerung des Kosmos",
    items: [
      "Sterne-Garnierte Ur-Plattenrüstung"
    ]
  },
  {
    name: "Der Ewige Wächter der Stasis",
    items: [
      "Amulett der Stillstehenden Zeit"
    ]
  },
  {
    name: "Die Unendliche Leere",
    items: [
      "Band der ewigen Stille"
    ]
  },
  {
    name: "Der Große Architekt des Archivs",
    items: [
      "Entwurfs-Klinge der Realität"
    ]
  },
  {
    name: "Die Gestalterin des Schicksalsfadens",
    items: [
      "Schicksalsweber-Gewand"
    ]
  },
  {
    name: "Der Vergessene Gott (Urahn des Glaubens)",
    items: [
      "Heilige Klinge der Götterdämmerung",
      "Urmacht-Brustplatte"
    ]
  },
  {
    name: "Die Letzte Mneme (Krone der Schöpfung)",
    items: [
      "Krone des Kollektiven Bewusstseins"
    ]
  }
] as const;

export function generateStoryBosses(): readonly StoryBoss[] {
  const bosses: StoryBoss[] = [];
  let globalId = 1;
  const maxChapters = STORY_LAYOUT.MAX_CHAPTERS;
  const fightsPerChapter = STORY_LAYOUT.FIGHTS_PER_CHAPTER;

  for (let chap = 1; chap <= maxChapters; chap += 1) {
    const baseHp = 40 * Math.pow(1.6, chap - 1);
    const baseAtk = 6 * Math.pow(1.4, chap - 1);
    const baseDef = 2 * Math.pow(1.4, chap - 1);

    for (let fight = 1; fight <= fightsPerChapter; fight += 1) {
      const isMidBoss = fight === 5;
      const isEndBoss = fight === 10;
      const roman = (["I", "II", "III", "IV"] as const)[fight % 4] ?? "I";
      const namePool =
        BOSS_NAMES[(chap + fight) % BOSS_NAMES.length] ?? BOSS_NAMES[0];
      let name = `${namePool} ${roman}`;
      let items: readonly string[] = [];

      if (isMidBoss) {
        const chapterBoss = CHAPTER_BOSSES[(chap - 1) * 2];
        if (chapterBoss) {
          name = chapterBoss.name;
          items = chapterBoss.items;
        }
      } else if (isEndBoss) {
        const chapterBoss = CHAPTER_BOSSES[(chap - 1) * 2 + 1];
        if (chapterBoss) {
          name = chapterBoss.name;
          items = chapterBoss.items;
        }
      }

      const multiplier = 1 + fight * 0.1;
      const chapterExpScaling = Math.pow(1.25, chap - 1);
      bosses.push({
        id: globalId,
        name,
        chapter: chap,
        hp: Math.floor(
          baseHp * multiplier * (isEndBoss ? 2 : isMidBoss ? 1.5 : 1),
        ),
        attack: Math.floor(
          baseAtk * multiplier * (isEndBoss ? 1.5 : isMidBoss ? 1.2 : 1),
        ),
        defense: Math.floor(
          baseDef * multiplier * (isEndBoss ? 1.5 : isMidBoss ? 1.2 : 1),
        ),
        reward: {
          exp: Math.floor(
            20 * chap * chapterExpScaling * multiplier * (isEndBoss ? 3 : 1),
          ),
          items,
        },
      });
      globalId += 1;
    }
  }

  return bosses;
}

export const STORY_BOSSES = generateStoryBosses();
