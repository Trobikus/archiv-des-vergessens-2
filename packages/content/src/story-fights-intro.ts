import type { StoryFightsIntroFrame } from "./types";

export const STORY_FIGHTS_INTRO_FRAMES = [
  {
    id: "reality-fades",
    src: "/cinematic/story-fights-intro/kf1-reality-fades.jpg",
    durationMs: 4800,
    linesDe: [
      "DIE REALITÄT VERBLASST.",
      "DIE ERINNERUNGEN STERBEN."
    ],
    linesEn: [
      "REALITY FADES.",
      "MEMORIES DIE."
    ]
  },
  {
    id: "crystal-epoch",
    src: "/cinematic/story-fights-intro/kf2-crystal-epoch.jpg",
    durationMs: 5200,
    linesDe: [
      "JEDER BOSS VERKÖRPERT EINE VERBLASSTE EPOCHE.",
      "JEDE NIEDERLAGE TILGT SIE FÜR IMMER."
    ],
    linesEn: [
      "EVERY BOSS EMBODIES A FADED EPOCH.",
      "EVERY DEFEAT ERASES IT FOREVER."
    ]
  },
  {
    id: "guardian",
    src: "/cinematic/story-fights-intro/kf3-guardian.jpg",
    durationMs: 5600,
    linesDe: [
      "WIRST DU SIE BEWAHREN?",
      "TRITT DIE REISE AN",
      "ALS HÜTER DES ARCHIVS."
    ],
    linesEn: [
      "WILL YOU PRESERVE THEM?",
      "BEGIN THE JOURNEY",
      "AS GUARDIAN OF THE ARCHIVE."
    ]
  }
] as const satisfies readonly StoryFightsIntroFrame[];

export const STORY_FIGHTS_INTRO_CROSSFADE_MS = 900 as const;
