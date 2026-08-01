import type { HeroClassOption } from "./types";

export const HERO_CLASSES = [
  {
    id: "light_warrior",
    titleDe: "Krieger des Lichts",
    titleEn: "Warrior of Light",
    avatar: "light_warrior",
  },
  {
    id: "archmage",
    titleDe: "Erzmagier",
    titleEn: "Archmage",
    avatar: "archmage",
  },
  {
    id: "shadow_runner",
    titleDe: "Schattenläufer",
    titleEn: "Shadow Runner",
    avatar: "shadow_runner",
  },
  {
    id: "archive_keeper",
    titleDe: "Hüter des Archivs",
    titleEn: "Archive Keeper",
    avatar: "archive_keeper",
  },
] as const satisfies readonly HeroClassOption[];
