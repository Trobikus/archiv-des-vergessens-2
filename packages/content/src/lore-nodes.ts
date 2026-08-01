import type { LoreNode } from "./types";

/** From v1 `js/data/lore-nodes.js`. */
export const LORE_NODES = {
  node_prologue: {
    id: "node_prologue",
    title: "Kapitel I: Der Fall von Eldoria",
    requiredBoss: 10,
    cost: 1000,
    description: "Die rekonstruierten Daten enthüllen das Schicksal der vergessenen Metropole Eldoria vor dem großen Stillstand. Trümmer und Asche verhüllen die einstige Pracht. Wie interpretierst du den Fall?",
    choices: [
      {
        id: "diligence",
        title: "Lehre des Fleißes",
        text: "Der Fall lehrt uns unermüdliches Streben. Jede Erfahrung formt den Geist.",
        passiveDescription: "Dauerhaft +15% Helden-Erfahrungsgewinn (EXP).",
        effects: {
          expMultiplier: 1.15
        }
      },
      {
        id: "metal",
        title: "Lehre des Erzes",
        text: "Nur die stärksten Materialien überdauern die Jahrhunderte. Die Materie siegt.",
        passiveDescription: "Dauerhaft +10% Erhöhung der Schmiede- & Handwerksqualität.",
        effects: {
          forgeQualityMultiplier: 1.1
        }
      }
    ]
  },
  node_cataclysm: {
    id: "node_cataclysm",
    title: "Kapitel III: Das Wesen des Urstroms",
    requiredBoss: 30,
    cost: 10000,
    description: "Tief im Datenstrom flüstern Fragmente über den Ursprung der Mneme-Partikel. Sie sind nicht bloß Energie – sie sind verdichtete Erinnerungen. Welche Verbindung gehst du mit ihnen ein?",
    choices: [
      {
        id: "soulflow",
        title: "Fluss der Seelen",
        text: "Lasse die Erinnerungen frei durch dich hindurchströmen, um die Quelle zu weiten.",
        passiveDescription: "Dauerhaft +20% Erzeugung von Mneme-Partikeln.",
        effects: {
          particlesMultiplier: 1.2
        }
      },
      {
        id: "philosopher",
        title: "Stein der Weisen",
        text: "Verdichte die Erinnerungen zu unvergänglichen Relikten der Urzeit.",
        passiveDescription: "Dauerhaft +15% Erzeugung von Mneme-Relikten.",
        effects: {
          relicsMultiplier: 1.15
        }
      }
    ]
  },
  node_eternity: {
    id: "node_eternity",
    title: "Kapitel V: Die versiegelten Archive",
    requiredBoss: 50,
    cost: 100000,
    description: "Du erreichst das Herz des Ewigen Archivs. Die Inschriften sprechen von einer Verbindung aller Geister im gemeinsamen Bund. Was ist deine Bestimmung?",
    choices: [
      {
        id: "synergy",
        title: "Gilden-Synergie",
        text: "Der Bund stärkt die Mitglieder. Niemand kämpft allein in den Expeditionen.",
        passiveDescription: "Dauerhaft +20% Expeditionsgeschwindigkeit für Clan-Mitglieder.",
        effects: {
          expeditionSpeedMultiplier: 1.2
        }
      },
      {
        id: "warrior",
        title: "Unbändiger Wille",
        text: "Die Entschlossenheit des Einzelnen durchbricht jede feindliche Barriere.",
        passiveDescription: "Dauerhaft +10% Schaden gegen Kapitel-Bosse.",
        effects: {
          bossDamageMultiplier: 1.1
        }
      }
    ]
  }
} as const satisfies Record<string, LoreNode>;
