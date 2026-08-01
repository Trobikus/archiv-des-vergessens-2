import { t, type I18nKey, type Locale } from "@adv/content";
import type { Store } from "@adv/core";

import type { GameState } from "../state/game-state";

export type I18nService = {
  getLocale(): Locale;
  setLocale(locale: Locale): void;
  translate(key: I18nKey, fallback?: string): string;
};

export function createI18nService(store: Store<GameState>): I18nService {
  return {
    getLocale() {
      return store.getState().settings.locale;
    },

    setLocale(locale) {
      store.setState((prev) => ({
        ...prev,
        settings: { ...prev.settings, locale },
      }));
    },

    translate(key, fallback) {
      return t(store.getState().settings.locale, key, fallback);
    },
  };
}
