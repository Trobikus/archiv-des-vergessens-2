import { HERO_CLASSES, type HeroClassId } from "@adv/content";
import { useState } from "preact/hooks";

import type { GameSession } from "../services/game-session";
import { useStore } from "./useStore";

type Props = {
  readonly session: GameSession;
};

export function CharacterSelectView({ session }: Props) {
  const state = useStore(session.store);
  const [name, setName] = useState("");
  const [classId, setClassId] = useState<HeroClassId>("archive_keeper");
  const [error, setError] = useState<string | null>(null);
  const locale = state.settings.locale;

  return (
    <main class="select">
      <header class="select__hero">
        <p class="select__brand">{session.i18n.translate("menu.title")}</p>
        <p class="select__tagline">{session.i18n.translate("menu.subtitle")}</p>
      </header>

      <section class="select__panel">
        <h1 class="select__heading">{session.i18n.translate("menu.newGame")}</h1>
        <label class="select__label" for="hero-name">
          {session.i18n.translate("auth.username")}
        </label>
        <input
          id="hero-name"
          class="select__input"
          data-testid="hero-name"
          maxlength={20}
          value={name}
          onInput={(event) => {
            setName((event.target as HTMLInputElement).value);
          }}
        />

        <p class="select__label">{session.i18n.translate("hero.title")}</p>
        <div class="select__classes" role="listbox">
          {HERO_CLASSES.map((klass) => {
            const label = locale === "en" ? klass.titleEn : klass.titleDe;
            const selected = classId === klass.id;
            return (
              <button
                key={klass.id}
                type="button"
                role="option"
                aria-selected={selected}
                class={selected ? "select__class is-active" : "select__class"}
                data-testid={`hero-class-${klass.id}`}
                onClick={() => {
                  setClassId(klass.id);
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {error !== null ? <p class="select__error">{error}</p> : null}

        <div class="select__actions">
          <button
            type="button"
            class="game__btn game__btn--primary"
            data-testid="create-hero"
            onClick={() => {
              const ok = session.hero.createHero({ name, classId });
              if (!ok) {
                setError(
                  locale === "en"
                    ? "Name must be 2–20 characters."
                    : "Name muss 2–20 Zeichen haben.",
                );
                return;
              }
              void session.saveNow();
            }}
          >
            {session.i18n.translate("common.confirm")}
          </button>
        </div>
      </section>
    </main>
  );
}
