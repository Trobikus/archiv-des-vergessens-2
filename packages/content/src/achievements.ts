import type { AchievementDefinition } from "./types";

/** Base templates from v1 `achievement-service.js` `_buildBaseAchievements()`. */
export const ACHIEVEMENT_DEFINITIONS = [
  {
    id: "particles_100",
    label: "100 Partikel gesammelt",
    target: 100,
    progress: 0,
    achieved: false,
    claimed: false,
    reward: {
      particles: 50,
      title: "Novize des Lichts"
    }
  },
  {
    id: "particles_1000",
    label: "1.000 Partikel gesammelt",
    target: 1000,
    progress: 0,
    achieved: false,
    claimed: false,
    reward: {
      particles: 200,
      title: "Sammler"
    }
  },
  {
    id: "particles_10000",
    label: "10.000 Partikel gesammelt",
    target: 10000,
    progress: 0,
    achieved: false,
    claimed: false,
    reward: {
      particles: 1000,
      title: "Chronometer-König"
    }
  },
  {
    id: "particles_100000",
    label: "100.000 Partikel gesammelt",
    target: 100000,
    progress: 0,
    achieved: false,
    claimed: false,
    reward: {
      particles: 5000,
      title: "Lichtweber"
    }
  },
  {
    id: "particles_1000000",
    label: "1.000.000 Partikel gesammelt",
    target: 1000000,
    progress: 0,
    achieved: false,
    claimed: false,
    reward: {
      particles: 50000,
      title: "Mneme-Gott"
    }
  },
  {
    id: "relics_10",
    label: "10 Relikte geborgen",
    target: 10,
    progress: 0,
    achieved: false,
    claimed: false,
    reward: {
      relics: 5,
      title: "Spurensucher"
    }
  },
  {
    id: "relics_100",
    label: "100 Relikte geborgen",
    target: 100,
    progress: 0,
    achieved: false,
    claimed: false,
    reward: {
      relics: 30,
      title: "Erinnerungsarchivar"
    }
  },
  {
    id: "relics_500",
    label: "500 Relikte geborgen",
    target: 500,
    progress: 0,
    achieved: false,
    claimed: false,
    reward: {
      relics: 150,
      title: "Reliktwächter"
    }
  },
  {
    id: "relics_2000",
    label: "2.000 Relikte geborgen",
    target: 2000,
    progress: 0,
    achieved: false,
    claimed: false,
    reward: {
      relics: 600,
      title: "Chronist der Ewigkeit"
    }
  },
  {
    id: "recipes_1",
    label: "Erstes Rezept geschmiedet",
    target: 1,
    progress: 0,
    achieved: false,
    claimed: false,
    reward: {
      artifacts: 1,
      title: "Lehrling"
    }
  },
  {
    id: "recipes_10",
    label: "10 Rezepte geschmiedet",
    target: 10,
    progress: 0,
    achieved: false,
    claimed: false,
    reward: {
      artifacts: 8,
      title: "Eisenschmied"
    }
  },
  {
    id: "recipes_50",
    label: "50 Rezepte geschmiedet",
    target: 50,
    progress: 0,
    achieved: false,
    claimed: false,
    reward: {
      artifacts: 20,
      title: "Meisterschmied"
    }
  },
  {
    id: "recipes_100",
    label: "100 Rezepte geschmiedet",
    target: 100,
    progress: 0,
    achieved: false,
    claimed: false,
    reward: {
      artifacts: 50,
      title: "Großschmied"
    }
  },
  {
    id: "expeditions_1",
    label: "Erste Expedition erfolgreich",
    target: 1,
    progress: 0,
    achieved: false,
    claimed: false,
    reward: {
      relics: 2,
      title: "Pfadfinder"
    }
  },
  {
    id: "expeditions_10",
    label: "10 Expeditionen erfolgreich",
    target: 10,
    progress: 0,
    achieved: false,
    claimed: false,
    reward: {
      relics: 10,
      title: "Entdecker"
    }
  },
  {
    id: "expeditions_50",
    label: "50 Expeditionen erfolgreich",
    target: 50,
    progress: 0,
    achieved: false,
    claimed: false,
    reward: {
      relics: 35,
      title: "Pionier des Bundes"
    }
  },
  {
    id: "expeditions_100",
    label: "100 Expeditionen erfolgreich",
    target: 100,
    progress: 0,
    achieved: false,
    claimed: false,
    reward: {
      relics: 80,
      title: "Weltenwanderer"
    }
  },
  {
    id: "boss_1",
    label: "Ersten Boss bezwungen",
    target: 1,
    progress: 0,
    achieved: false,
    claimed: false,
    reward: {
      particles: 100,
      title: "Krieger des Bundes"
    }
  },
  {
    id: "boss_5",
    label: "5 Bosse bezwungen",
    target: 5,
    progress: 0,
    achieved: false,
    claimed: false,
    reward: {
      particles: 500,
      title: "Nemesis-Bezwinger"
    }
  },
  {
    id: "boss_10",
    label: "10 Bosse bezwungen",
    target: 10,
    progress: 0,
    achieved: false,
    claimed: false,
    reward: {
      relics: 15,
      title: "Bossjäger"
    }
  },
  {
    id: "boss_20",
    label: "20 Bosse bezwungen",
    target: 20,
    progress: 0,
    achieved: false,
    claimed: false,
    reward: {
      relics: 50,
      title: "Legende des Archivs"
    }
  },
  {
    id: "boss_first_no_equip",
    label: "Boss ohne Ausrüstung besiegt",
    target: 1,
    progress: 0,
    achieved: false,
    claimed: false,
    reward: {
      particles: 200,
      title: "Nackter Streiter"
    }
  },
  {
    id: "prestige_1",
    label: "Einmal verewigt (Prestige 1)",
    target: 1,
    progress: 0,
    achieved: false,
    claimed: false,
    reward: {
      relics: 15,
      title: "Wiedergeborener"
    }
  },
  {
    id: "prestige_5",
    label: "5-mal verewigt (Prestige 5)",
    target: 5,
    progress: 0,
    achieved: false,
    claimed: false,
    reward: {
      relics: 100,
      title: "Unsterblicher"
    }
  }
] as const satisfies readonly AchievementDefinition[];
