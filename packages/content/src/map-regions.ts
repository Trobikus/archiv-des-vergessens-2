import type { MapRegion } from "./types";

/**
 * Selectable hubs on the wasteland map (`scene-karte.png`).
 * Coordinates are percent of the 1536×1024 art (hotspot centers).
 */
export const MAP_REGIONS = [
  {
    id: "oede-lager",
    nameDe: "Öde-Lager",
    nameEn: "Wasteland Camp",
    blurbDe:
      "Ein knisterndes Lagerfeuer in der Asche. Sammler und Flüchtlinge tauschen hier Mneme-Scherben und Warnungen.",
    blurbEn:
      "A crackling fire in the ash. Gatherers and refugees trade Mneme shards and warnings here.",
    xPct: 36,
    yPct: 57,
  },
  {
    id: "schrein",
    nameDe: "Schrein der Stille",
    nameEn: "Shrine of Silence",
    blurbDe:
      "Ein verwitterter Tempel, in dem selbst die Lethe einen Moment innehält. Die Glyphen flüstern von vergessenen Eiden.",
    blurbEn:
      "A weathered temple where even the Lethe pauses. The glyphs whisper of forgotten oaths.",
    xPct: 44,
    yPct: 40,
  },
  {
    id: "bruchland",
    nameDe: "Bruchland",
    nameEn: "Shatterland",
    blurbDe:
      "Zersplitterte Klippen aus einer untergegangenen Epoche. Hier bricht die Erde unter dem Gewicht verlorener Königreiche.",
    blurbEn:
      "Shattered cliffs from a fallen epoch. Here the earth breaks under the weight of lost kingdoms.",
    xPct: 61,
    yPct: 36,
  },
  {
    id: "gewoelbe",
    nameDe: "Das Verborgene Gewölbe",
    nameEn: "The Hidden Vault",
    blurbDe:
      "Ein ruinöses Portal im Herzen der Öde. Dahinter lagern Siegel und Erinnerungen, die die Realität noch zusammenhalten.",
    blurbEn:
      "A ruinous portal at the heart of the waste. Beyond it lie seals and memories that still hold reality together.",
    xPct: 51,
    yPct: 52,
  },
  {
    id: "nebelhort",
    nameDe: "???",
    nameEn: "???",
    blurbDe: "Der Nebel gibt diesen Ort noch nicht preis.",
    blurbEn: "The mist has not yet revealed this place.",
    xPct: 68,
    yPct: 60,
    locked: true,
  },
] as const satisfies readonly MapRegion[];

export const DEFAULT_MAP_REGION_ID = "gewoelbe" as const;

export function getMapRegion(id: string): MapRegion | null {
  return MAP_REGIONS.find((region) => region.id === id) ?? null;
}
