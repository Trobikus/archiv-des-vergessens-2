import type { DailyQuestDefinition, MainQuestDefinition } from "./types";

/** From v1 `js/data/quests.js`. */
export const MAIN_QUESTS_DATA = [
  {
    id: "q1",
    text: "Klicke auf \"Extrahieren\" bis du 50 Partikel hast",
    text_en: "Click \"Extract\" until you have 50 particles",
    target: 50,
    rewardText: "15 Partikel",
    rewardText_en: "15 Particles",
    reward: {
      particles: 15
    }
  },
  {
    id: "q2",
    text: "Rekrutiere deinen ersten Mneme-Sammler (kostet 10)",
    text_en: "Recruit your first Mneme Collector (costs 10)",
    target: 1,
    rewardText: "20 Partikel",
    rewardText_en: "20 Particles",
    reward: {
      particles: 20
    }
  },
  {
    id: "q3",
    text: "Sende ein Mitglied auf Expedition (Klick auf Tabelle)",
    text_en: "Send a member on an expedition (click Table)",
    target: 1,
    rewardText: "5 Relikte",
    rewardText_en: "5 Relics",
    reward: {
      relics: 5
    }
  },
  {
    id: "q4",
    text: "Besiege den ersten Boss (Story & Bosse)",
    text_en: "Defeat the first Boss (Story & Bosses)",
    target: 1,
    rewardText: "50 Partikel & 1 Artefakt",
    rewardText_en: "50 Particles & 1 Artifact",
    reward: {
      particles: 50,
      artifacts: 1
    }
  },
  {
    id: "q5",
    text: "Rüste einen Gegenstand aus (Mein Held)",
    text_en: "Equip an item (My Hero)",
    target: 1,
    rewardText: "30 Partikel",
    rewardText_en: "30 Particles",
    reward: {
      particles: 30
    }
  },
  {
    id: "q6",
    text: "Verbessere deine Klick-Stärke (Hauptbildschirm)",
    text_en: "Upgrade your click power (Main Screen)",
    target: 1,
    rewardText: "30 Partikel",
    rewardText_en: "30 Particles",
    reward: {
      particles: 30
    }
  },
  {
    id: "q7",
    text: "Schmiede dein erstes Artefakt (Artefakt-Schmiede)",
    text_en: "Forge your first artifact (Artifact Forge)",
    target: 1,
    rewardText: "10 Erinnerungsstaub",
    rewardText_en: "10 Memory Dust",
    reward: {
      memoryDust: 10
    }
  },
  {
    id: "q8",
    text: "Erreiche Kapitel 2 in der Story (Besiege Boss 10)",
    text_en: "Reach Chapter 2 in the story (Defeat Boss 10)",
    target: 10,
    rewardText: "100 Partikel, 10 Relikte",
    rewardText_en: "100 Particles, 10 Relics",
    reward: {
      particles: 100,
      relics: 10
    }
  },
  {
    id: "q9",
    text: "Sammle mindestens 20 Relikte",
    text_en: "Collect at least 20 Relics",
    target: 20,
    rewardText: "15 Relikte",
    rewardText_en: "15 Relics",
    reward: {
      relics: 15
    }
  },
  {
    id: "q10",
    text: "Rekrutiere 5 Mitglieder für den Bund",
    text_en: "Recruit 5 members for the alliance",
    target: 5,
    rewardText: "200 Partikel",
    rewardText_en: "200 Particles",
    reward: {
      particles: 200
    }
  },
  {
    id: "q11",
    text: "Erreiche Stufe 10 mit deinem Helden",
    text_en: "Reach level 10 with your hero",
    target: 10,
    rewardText: "50 Staub",
    rewardText_en: "50 Dust",
    reward: {
      memoryDust: 50
    }
  },
  {
    id: "q12",
    text: "Werte einen Ausrüstungsgegenstand auf (Schmiede)",
    text_en: "Upgrade an equipment item (Forge)",
    target: 2,
    rewardText: "30 Staub",
    rewardText_en: "30 Dust",
    reward: {
      memoryDust: 30
    }
  },
  {
    id: "q13",
    text: "Schließe 25 Expeditionen ab",
    text_en: "Complete 25 expeditions",
    target: 25,
    rewardText: "25 Relikte",
    rewardText_en: "25 Relics",
    reward: {
      relics: 25
    }
  },
  {
    id: "q14",
    text: "Erreiche Kapitel 3 in der Story (Besiege Boss 20)",
    text_en: "Reach Chapter 3 in the story (Defeat Boss 20)",
    target: 20,
    rewardText: "300 Partikel, 5 Artefakte",
    rewardText_en: "300 Particles, 5 Artifacts",
    reward: {
      particles: 300,
      artifacts: 5
    }
  },
  {
    id: "q15",
    text: "Sammle 1000 Partikel (Insgesamt)",
    text_en: "Collect 1000 Particles (total)",
    target: 1000,
    rewardText: "Prestige-Vorbereitung: 10 Artefakte",
    rewardText_en: "Prestige Prep: 10 Artifacts",
    reward: {
      artifacts: 10
    }
  },
  {
    id: "q16",
    text: "Schalte dein erstes Talent im Talentbaum frei",
    text_en: "Unlock your first talent in the talent tree",
    target: 1,
    rewardText: "100 Partikel, 10 Relikte",
    rewardText_en: "100 Particles, 10 Relics",
    reward: {
      particles: 100,
      relics: 10
    }
  },
  {
    id: "q17",
    text: "Besitze mindestens 100 Erinnerungsstaub",
    text_en: "Possess at least 100 Memory Dust",
    target: 100,
    rewardText: "50 Erinnerungsstaub, 1 Artefakt",
    rewardText_en: "50 Memory Dust, 1 Artifact",
    reward: {
      memoryDust: 50,
      artifacts: 1
    }
  },
  {
    id: "q18",
    text: "Erreiche Heldenstufe 15",
    text_en: "Reach hero level 15",
    target: 15,
    rewardText: "150 Partikel, 20 Relikte",
    rewardText_en: "150 Particles, 20 Relics",
    reward: {
      particles: 150,
      relics: 20
    }
  },
  {
    id: "q19",
    text: "Besiege Boss 25 in der Story",
    text_en: "Defeat Boss 25 in the story",
    target: 25,
    rewardText: "250 Partikel, 2 Artefakte",
    rewardText_en: "250 Particles, 2 Artifacts",
    reward: {
      particles: 250,
      artifacts: 2
    }
  },
  {
    id: "q20",
    text: "Rekrutiere 10 Mitglieder für deinen Clan",
    text_en: "Recruit 10 members for your clan",
    target: 10,
    rewardText: "300 Partikel",
    rewardText_en: "300 Particles",
    reward: {
      particles: 300
    }
  },
  {
    id: "q21",
    text: "Erreiche Handwerksstufe 3",
    text_en: "Reach crafting level 3",
    target: 3,
    rewardText: "100 Erinnerungsstaub",
    rewardText_en: "100 Memory Dust",
    reward: {
      memoryDust: 100
    }
  },
  {
    id: "q22",
    text: "Besitze ein Item der Seltenheit Selten, Episch oder Legendär",
    text_en: "Possess an item of quality Rare, Epic or Legendary",
    target: 1,
    rewardText: "2 Artefakte, 50 Staub",
    rewardText_en: "2 Artifacts, 50 Dust",
    reward: {
      artifacts: 2,
      memoryDust: 50
    }
  },
  {
    id: "q23",
    text: "Schließe insgesamt 50 erfolgreiche Expeditionen ab",
    text_en: "Complete 50 successful expeditions total",
    target: 50,
    rewardText: "80 Relikte, 5 Artefakte",
    rewardText_en: "80 Relics, 5 Artifacts",
    reward: {
      relics: 80,
      artifacts: 5
    }
  },
  {
    id: "q24",
    text: "Sammle mindestens 50 Relikte auf einmal",
    text_en: "Collect at least 50 Relics at once",
    target: 50,
    rewardText: "30 Relikte",
    rewardText_en: "30 Relics",
    reward: {
      relics: 30
    }
  },
  {
    id: "q25",
    text: "Besiege Boss 30 in der Story",
    text_en: "Defeat Boss 30 in the story",
    target: 30,
    rewardText: "400 Partikel, 3 Artefakte",
    rewardText_en: "400 Particles, 3 Artifacts",
    reward: {
      particles: 400,
      artifacts: 3
    }
  },
  {
    id: "q26",
    text: "Erreiche Heldenstufe 25",
    text_en: "Reach hero level 25",
    target: 25,
    rewardText: "300 Partikel, 40 Relikte",
    rewardText_en: "300 Particles, 40 Relics",
    reward: {
      particles: 300,
      relics: 40
    }
  },
  {
    id: "q27",
    text: "Schalte 3 Talente im Talentbaum frei",
    text_en: "Unlock 3 talents in the talent tree",
    target: 3,
    rewardText: "150 Erinnerungsstaub",
    rewardText_en: "150 Memory Dust",
    reward: {
      memoryDust: 150
    }
  },
  {
    id: "q28",
    text: "Sammle insgesamt 1.000 Relikte",
    text_en: "Collect a total of 1,000 Relics",
    target: 1000,
    rewardText: "50 Relikte, 3 Artefakte",
    rewardText_en: "50 Relics, 3 Artifacts",
    reward: {
      relics: 50,
      artifacts: 3
    }
  },
  {
    id: "q29",
    text: "Führe deine erste Verewigung durch (Prestige Stufe 1)",
    text_en: "Perform your first Eternalization (Prestige level 1)",
    target: 1,
    rewardText: "1000 Partikel, 10 Artefakte",
    rewardText_en: "1000 Particles, 10 Artifacts",
    reward: {
      particles: 1000,
      artifacts: 10
    }
  },
  {
    id: "q30",
    text: "Besiege Boss 40 in der Story",
    text_en: "Defeat Boss 40 in the story",
    target: 40,
    rewardText: "500 Partikel, 5 Artefakte",
    rewardText_en: "500 Particles, 5 Artifacts",
    reward: {
      particles: 500,
      artifacts: 5
    }
  },
  {
    id: "q31",
    text: "Erreiche Heldenstufe 40",
    text_en: "Reach hero level 40",
    target: 40,
    rewardText: "400 Partikel, 100 Erinnerungsstaub",
    rewardText_en: "400 Particles, 100 Memory Dust",
    reward: {
      particles: 400,
      memoryDust: 100
    }
  },
  {
    id: "q32",
    text: "Besitze 500 Einheiten Erinnerungsstaub",
    text_en: "Possess 500 units of Memory Dust",
    target: 500,
    rewardText: "250 Erinnerungsstaub",
    rewardText_en: "250 Memory Dust",
    reward: {
      memoryDust: 250
    }
  },
  {
    id: "q33",
    text: "Erreiche Handwerksstufe 5",
    text_en: "Reach crafting level 5",
    target: 5,
    rewardText: "150 Erinnerungsstaub, 5 Artefakte",
    rewardText_en: "150 Memory Dust, 5 Artifacts",
    reward: {
      memoryDust: 150,
      artifacts: 5
    }
  },
  {
    id: "q34",
    text: "Werte einen Ausrüstungsgegenstand auf Stufe 5 auf",
    text_en: "Upgrade an equipment item to level 5",
    target: 5,
    rewardText: "200 Erinnerungsstaub",
    rewardText_en: "200 Memory Dust",
    reward: {
      memoryDust: 200
    }
  },
  {
    id: "q35",
    text: "Schließe insgesamt 100 erfolgreiche Expeditionen ab",
    text_en: "Complete 100 successful expeditions total",
    target: 100,
    rewardText: "200 Relikte, 10 Artefakte",
    rewardText_en: "200 Relics, 10 Artifacts",
    reward: {
      relics: 200,
      artifacts: 10
    }
  },
  {
    id: "q36",
    text: "Schalte 5 Talente im Talentbaum frei",
    text_en: "Unlock 5 talents in the talent tree",
    target: 5,
    rewardText: "200 Erinnerungsstaub, 5 Artefakte",
    rewardText_en: "200 Memory Dust, 5 Artifacts",
    reward: {
      memoryDust: 200,
      artifacts: 5
    }
  },
  {
    id: "q37",
    text: "Besitze einen Ausrüstungsgegenstand der Seltenheit Legendär",
    text_en: "Possess a Legendary equipment item",
    target: 1,
    rewardText: "15 Artefakte, 500 Partikel",
    rewardText_en: "15 Artifacts, 500 Particles",
    reward: {
      artifacts: 15,
      particles: 500
    }
  },
  {
    id: "q38",
    text: "Sammle 10.000 Partikel auf einmal",
    text_en: "Collect 10,000 Particles at once",
    target: 10000,
    rewardText: "5.000 Partikel, 10 Artefakte",
    rewardText_en: "5,000 Particles, 10 Artifacts",
    reward: {
      particles: 5000,
      artifacts: 10
    }
  },
  {
    id: "q39",
    text: "Erreiche Prestige Stufe 2",
    text_en: "Reach Prestige level 2",
    target: 2,
    rewardText: "2.500 Partikel, 20 Artefakte",
    rewardText_en: "2,500 Particles, 20 Artifacts",
    reward: {
      particles: 2500,
      artifacts: 20
    }
  },
  {
    id: "q40",
    text: "Besiege Boss 50 in der Story",
    text_en: "Defeat Boss 50 in the story",
    target: 50,
    rewardText: "1.000 Partikel, 15 Artefakte",
    rewardText_en: "1,000 Particles, 15 Artifacts",
    reward: {
      particles: 1000,
      artifacts: 15
    }
  },
  {
    id: "q41",
    text: "Erreiche Heldenstufe 60",
    text_en: "Reach hero level 60",
    target: 60,
    rewardText: "1.000 Partikel, 300 Erinnerungsstaub",
    rewardText_en: "1,000 Particles, 300 Memory Dust",
    reward: {
      particles: 1000,
      memoryDust: 300
    }
  },
  {
    id: "q42",
    text: "Besitze 5 Katalysatoren",
    text_en: "Possess 5 Catalysts",
    target: 5,
    rewardText: "5 Katalysatoren",
    rewardText_en: "5 Catalysts",
    reward: {
      catalyst: 5
    }
  },
  {
    id: "q43",
    text: "Erreiche Handwerksstufe 10",
    text_en: "Reach crafting level 10",
    target: 10,
    rewardText: "500 Erinnerungsstaub, 15 Artefakte",
    rewardText_en: "500 Memory Dust, 15 Artifacts",
    reward: {
      memoryDust: 500,
      artifacts: 15
    }
  },
  {
    id: "q44",
    text: "Schalte 8 Talente im Talentbaum frei",
    text_en: "Unlock 8 talents in the talent tree",
    target: 8,
    rewardText: "400 Erinnerungsstaub, 10 Artefakte",
    rewardText_en: "400 Memory Dust, 10 Artifacts",
    reward: {
      memoryDust: 400,
      artifacts: 10
    }
  },
  {
    id: "q45",
    text: "Erreiche Prestige Stufe 3 oder besiege Boss 60",
    text_en: "Reach Prestige level 3 or defeat Boss 60",
    target: 1,
    rewardText: "Meister des Vergessens: 50 Artefakte",
    rewardText_en: "Master of Forgetting: 50 Artifacts",
    reward: {
      artifacts: 50
    }
  }
] as const satisfies readonly MainQuestDefinition[];

export const DAILY_QUESTS_DATA = [
  {
    id: "daily_1",
    text: "Extrahiere 50x manuell",
    text_en: "Extract manually 50x",
    target: 50,
    key: "gatherClicks",
    rewardText: "100 Partikel",
    rewardText_en: "100 Particles",
    reward: {
      particles: 100
    }
  },
  {
    id: "daily_2",
    text: "Schließe 5 Expeditionen ab",
    text_en: "Complete 5 expeditions",
    target: 5,
    key: "expeditions",
    rewardText: "15 Relikte",
    rewardText_en: "15 Relics",
    reward: {
      relics: 15
    }
  },
  {
    id: "daily_3",
    text: "Schmiede 3 Gegenstände",
    text_en: "Forge 3 items",
    target: 3,
    key: "craftedItems",
    rewardText: "2 Artefakte",
    rewardText_en: "2 Artifacts",
    reward: {
      artifacts: 2
    }
  }
] as const satisfies readonly DailyQuestDefinition[];
