import type { CodexEntry } from "./types";

/** From v1 `js/data/codex_entries.js`. */
export const CODEX_ENTRIES = {
  lost_shadow: {
    id: "lost_shadow",
    category: "bosses",
    title: "Malakor, der gefallene Erste",
    icon: "👤",
    unlocked: false,
    description: "Ein monumentaler Schattenwächter aus obsidianfarbenem Glas, in dessen Brusthöhle ein korrumpiertes goldenes Uhrwerk tickt.",
    lore: "Als der erste verheerende Einbruch der Lethe die Welt bedrohte, opferte sich Malakor, der erste und weiseste aller Mneme-Hüter. Er absorbierte die gesamten Erinnerungen, Sünden und Träume einer gesamten gläsernen Epoche in sein eigenes Bewusstsein. Unfähig, die unendliche Qual dieses sterbenden Zeitalters zu tragen, zersplitterte sein Verstand. Nun wandert er als gequälter Obsidian-Riese durch den Asche-Garten, gefangen in einem endlosen Loop seines größten Opfers.",
    stats: {
      hp: 40,
      attack: 6,
      defense: 2
    }
  },
  memory_phantom: {
    id: "memory_phantom",
    category: "bosses",
    title: "Aurelia, das schweigende Meer",
    icon: "🌊",
    unlocked: false,
    description: "Eine titanische, wehmütige Frauenfigur, halb aus Tiefseekristall und halb aus gefrorenem Nebel, in einem Kleid aus Sternen-Tinte.",
    lore: "In der Seereich-Epoche von Valanis drohte der Ozean der Erinnerungen im Nebel des Vergessens zu verdampfen. Aurelia, die Hohepriesterin des Wassers, gab ihre eigene Stimme auf, um ein ewiges, magisches Wiegenlied zu singen, welches die Fluten band und das Vergessen zurückhielt. Doch als das Vergessen ihr Volk verschlang und niemand mehr Aurelias Namen flüsterte, gefror sie zu einer weinenden Statue aus Eis. Sie kämpft nicht aus Bosheit, sondern weil sie jeden Eindringling als den Nebel wahrnimmt, der ihre Welt ertränkte.",
    stats: {
      hp: 80,
      attack: 12,
      defense: 4
    }
  },
  shadow_guardian: {
    id: "shadow_guardian",
    category: "bosses",
    title: "Goliath-7, Die kybernetische Dämmerung",
    icon: "🤖",
    unlocked: false,
    description: "Ein gigantischer, brutalistischer Koloss aus rostigem Eisen, durchsetzt mit freiliegenden, pulsierenden Datenkabeln.",
    lore: "Dieses Relikt stammt aus dem hochtechnologisierten Zeitalter der Kybernetischen Dämmerung. Goliath-7 war der ultimative Sicherheitswächter, programmiert, um die Kernreaktoren und Datenbanken einer sterbenden Zivilisation vor dem Kollaps zu bewahren. Das Reich ging in Flammen auf, die Schöpfer starben vor Jahrtausenden, doch Goliaths Algorithmen laufen stur weiter. Da er keinen Code für \"Frieden\" besitzt, interpretiert er jeden organischen Eindringling im Archiv als schädlichen Systemfehler, der restlos gelöscht werden muss.",
    stats: {
      hp: 150,
      attack: 20,
      defense: 8
    }
  },
  ancient_one: {
    id: "ancient_one",
    category: "bosses",
    title: "Der Vergessene Gott (Urahn)",
    icon: "🧙",
    unlocked: false,
    description: "Ein uraltes, formloses Bewusstsein, das älter ist als das Archiv selbst und die Trümmer mythologischer Welten um sich schart.",
    lore: "Er war das allererste transzendente Konzept von Glauben und Hoffnung, das die Menschheit jemals ersann. Als das Große Vergessen einsetzte und die Götterdämmerung einläutete, schrumpfte seine Macht zu Staub. Nun haust er in den Tiefen der versiegelten Kammern. Er ist kein Schöpfer mehr, sondern ein verwirrtes, unberechenbares Relikt, das verzweifelt versucht, die Reste seines einstigen goldenen Himmels zu verteidigen.",
    stats: {
      hp: 300,
      attack: 35,
      defense: 15
    }
  },
  nyx: {
    id: "nyx",
    category: "bosses",
    title: "Nyx – Herrin des sanften Vergessens",
    icon: "🌑",
    unlocked: false,
    description: "Die ätherische Verkörperung des Vergessens. Eine fließende, tinteartige Silhouette, die Trost im Nichts verspricht.",
    lore: "Einst war sie die strahlendste aller Mneme-Hüterinnen. Doch als sie sah, dass das unbarmherzige Konservieren schmerzhafter Erinnerungen die Seelen der Verstorbenen in ewiger Pein gefangen hielt, rebellierte sie. Sie stürzte sich in das schwarze Ur-Vakuum der Lethe und verschmolz mit ihr. Nun bietet sie der erschöpften Menschheit die ultimative Gnade: die vollkommene Auslöschung aller Individualität und allen Leides in einem schmerzfreien, ewigen Schlaf.",
    stats: {
      hp: 500,
      attack: 50,
      defense: 25
    }
  },
  archive_hall: {
    id: "archive_hall",
    category: "locations",
    title: "Die große Halle des Archivs",
    icon: "🏛️",
    unlocked: false,
    description: "Der zentrale Ort des Archivs. Hier werden die Mneme-Partikel gesammelt und sortiert.",
    lore: "Erbaut aus dem Stein der ersten Erinnerungen. Jede Säule trägt die Geschichte eines vergessenen Volkes."
  },
  forgotten_chamber: {
    id: "forgotten_chamber",
    category: "locations",
    title: "Die vergessene Kammer",
    icon: "🚪",
    unlocked: false,
    description: "Ein verborgener Raum unter dem Archiv. Hier liegen die ältesten Geheimnisse.",
    lore: "Nur wenige haben die Kammer betreten. Diejenigen, die zurückkehrten, sprachen von einem Licht, das stärker war als die Sonne."
  },
  mneme_crown: {
    id: "mneme_crown",
    category: "items",
    title: "Die Mneme-Krone",
    icon: "👑",
    unlocked: false,
    description: "Eine Krone aus reinen Mneme-Partikeln. Sie verleiht die Macht über alle Erinnerungen.",
    lore: "Die Krone wurde von den ersten Hütern geschmiedet, um die Mneme zu bündeln. Sie ist sowohl Segen als auch Fluch."
  },
  ancient_blade: {
    id: "ancient_blade",
    category: "items",
    title: "Die uralte Klinge",
    icon: "🗡️",
    unlocked: false,
    description: "Eine Klinge aus vergessenem Stahl, die die Erinnerung ihrer Opfer in sich aufnimmt.",
    lore: "Die Klinge wurde im Herzen der ersten Mneme geschmiedet. Jeder Schlag hinterlässt eine Narbe in der Geschichte."
  },
  origin_of_mneme: {
    id: "origin_of_mneme",
    category: "lore",
    title: "Die Ursprünge der Mneme",
    icon: "📜",
    unlocked: false,
    description: "Die Mneme sind die Fragmente der ersten Erinnerung – geboren aus dem ersten Gedanken der ersten Existenz.",
    lore: "Als der erste Mensch den ersten Gedanken dachte, entstand die erste Mneme. Seitdem wächst das Archiv mit jeder Erinnerung, die jemals gemacht wurde."
  },
  the_great_forgetting: {
    id: "the_great_forgetting",
    category: "lore",
    title: "Das Große Vergessen",
    icon: "🌫️",
    unlocked: false,
    description: "Ein Ereignis, das beinahe alle Erinnerungen der Welt auslöschte. Nur das Archiv überlebte.",
    lore: "Vor Äonen versuchte ein Wesen, das als \"Der Leere\" bekannt war, alle Mneme zu vernichten. Es scheiterte – aber der Schaden war immens."
  },
  the_covenant: {
    id: "the_covenant",
    category: "lore",
    title: "Der Bund der Hüter",
    icon: "🤝",
    unlocked: false,
    description: "Ein uralter Pakt zwischen den ersten Hütern, das Archiv für immer zu bewachen.",
    lore: "Der Bund wurde in einer Zeit geschlossen, als die Welt noch jung war. Die Hüter schworen, die Erinnerungen zu schützen – koste es, was es wolle."
  },
  ending_victory: {
    id: "ending_victory",
    category: "endings",
    title: "🏆 Sieg des Lichts",
    icon: "⭐",
    unlocked: false,
    description: "Das Gute Ende. Du hast das Vergessen besiegt und das Archiv wiederhergestellt."
  },
  ending_sacrifice: {
    id: "ending_sacrifice",
    category: "endings",
    title: "🕯️ Das Opfer",
    icon: "🕯️",
    unlocked: false,
    description: "Das tragische Ende. Du opferst dich für das Archiv – und wirst zur Legende."
  }
} as const satisfies Record<string, CodexEntry>;
