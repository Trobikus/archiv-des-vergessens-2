import type { Locale } from "../types";
import { DE } from "./de";
import { EN } from "./en";
import type { I18nKey } from "./keys";

const TABLES = {
  de: DE,
  en: EN,
} as const;

export function t(locale: Locale, key: I18nKey, fallback?: string): string {
  const primary = TABLES[locale][key];
  if (typeof primary === "string" && primary.length > 0) {
    return primary;
  }
  const deFallback = DE[key];
  if (typeof deFallback === "string" && deFallback.length > 0) {
    return deFallback;
  }
  return fallback ?? key;
}
