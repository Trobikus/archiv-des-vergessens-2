import type { Locale } from "./types";

export type { Locale };

const BOOT_LABELS = {
  de: "Boot OK",
  en: "Boot OK",
} as const satisfies Record<Locale, string>;

export function bootLabel(locale: Locale): string {
  return BOOT_LABELS[locale];
}

export function isLocale(value: string): value is Locale {
  return value === "de" || value === "en";
}
