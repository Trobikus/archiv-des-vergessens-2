import { HERO_CLASSES, type HeroClassId } from "@adv/content";
import type { ComponentChildren } from "preact";
import { useEffect, useState } from "preact/hooks";

import type { GameSession } from "../services/game-session";
import { useStore } from "./useStore";

type Props = {
  readonly session: GameSession;
  readonly accountSlot?: ComponentChildren;
  readonly onPlay: () => void;
  readonly onBack: () => void;
  readonly onOptions: () => void;
  readonly onQuit: () => void;
  readonly onDelete: () => void;
};

type Mode = "roster" | "create";

function classLabel(avatar: string, locale: "de" | "en"): string {
  const klass = HERO_CLASSES.find((entry) => entry.avatar === avatar);
  if (!klass) {
    return avatar;
  }
  return locale === "en" ? klass.titleEn : klass.titleDe;
}

function PlaceholderFigure({
  classId,
  empty,
}: {
  readonly classId: string;
  readonly empty: boolean;
}) {
  return (
    <div
      class={
        empty
          ? "char-select__figure is-empty"
          : `char-select__figure char-select__figure--${classId}`
      }
      aria-hidden="true"
      data-testid="char-preview-figure"
    >
      <div class="char-select__ground" />
      <div class="char-select__silhouette">
        <span class="char-select__silhouette-head" />
        <span class="char-select__silhouette-body" />
        <span class="char-select__silhouette-cape" />
      </div>
    </div>
  );
}

export function CharacterSelectView({
  session,
  accountSlot,
  onPlay,
  onBack,
  onOptions,
  onQuit,
  onDelete,
}: Props) {
  const state = useStore(session.store);
  const hero = state.hero;
  const hasHero = hero.created;
  const locale = state.settings.locale;
  const t = session.i18n.translate.bind(session.i18n);

  const [mode, setMode] = useState<Mode>("roster");
  const [selected, setSelected] = useState(hasHero);
  const [name, setName] = useState("");
  const [classId, setClassId] = useState<HeroClassId>("archive_keeper");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setSelected(hasHero);
    if (hasHero) {
      setMode("roster");
    }
  }, [hasHero]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if (document.querySelector(".confirm-modal") !== null) {
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        if (mode === "create") {
          setMode("roster");
          setError(null);
          return;
        }
        onBack();
        return;
      }
      if (event.key !== "Enter") {
        return;
      }
      const target = event.target as HTMLElement | null;
      if (
        target !== null &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (mode === "roster" && hasHero && selected && !busy) {
        event.preventDefault();
        onPlay();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [busy, hasHero, mode, onBack, onPlay, selected]);

  const createHero = (): void => {
    setBusy(true);
    setError(null);
    const ok = session.hero.createHero({ name, classId });
    if (!ok) {
      setError(t("charSelect.nameError"));
      setBusy(false);
      return;
    }
    void session
      .saveNow()
      .catch(() => {
        // Hero is already in memory; still leave create mode.
      })
      .finally(() => {
        setBusy(false);
        setMode("roster");
        setSelected(true);
        setName("");
      });
  };

  const canPlay = hasHero && selected && mode === "roster" && !busy;
  const selectedName =
    mode === "roster" && hasHero && selected ? hero.name : null;

  return (
    <main
      class="char-select fade-in"
      data-testid="character-select"
      role="main"
      aria-label={t("charSelect.title")}
    >
      <div class="char-select__scene" aria-hidden="true">
        <div class="char-select__scene-glow" />
        <div class="char-select__scene-fog" />
      </div>

      <header class="char-select__top">
        <div class="char-select__brand-block">
          <p class="char-select__brand glow-text text-gold cinzel">
            {t("menu.title")}
          </p>
          <p class="char-select__brand-sub text-muted cinzel">
            {t("charSelect.title")}
          </p>
        </div>
        <nav class="char-select__top-nav" aria-label="Character select menu">
          {accountSlot !== undefined ? (
            <div class="char-select__account">{accountSlot}</div>
          ) : null}
          <button
            type="button"
            class="char-select__top-link"
            data-testid="char-options"
            onClick={onOptions}
          >
            {t("menu.options")}
          </button>
          <button
            type="button"
            class="char-select__top-link"
            data-testid="char-quit"
            onClick={onQuit}
          >
            {t("menu.quit")}
          </button>
        </nav>
      </header>

      <div class="char-select__stage">
        <section class="char-select__preview">
          {mode === "create" ? (
            <form
              class="char-select__create glass-panel"
              data-testid="char-create-form"
              onSubmit={(event) => {
                event.preventDefault();
                createHero();
              }}
            >
              <h2 class="cinzel text-gold">{t("charSelect.create")}</h2>
              <PlaceholderFigure classId={classId} empty={false} />
              <label class="char-select__field">
                <span class="cinzel text-gold">{t("charSelect.nameLabel")}</span>
                <input
                  id="hero-name"
                  class="form-input"
                  data-testid="hero-name"
                  maxlength={20}
                  required
                  autoFocus
                  disabled={busy}
                  value={name}
                  onInput={(event) => {
                    setName((event.target as HTMLInputElement).value);
                  }}
                />
              </label>
              <p class="char-select__label cinzel text-gold">
                {t("charSelect.classLabel")}
              </p>
              <div class="char-select__classes" role="listbox">
                {HERO_CLASSES.map((klass) => {
                  const label =
                    locale === "en" ? klass.titleEn : klass.titleDe;
                  const active = classId === klass.id;
                  return (
                    <button
                      key={klass.id}
                      type="button"
                      role="option"
                      aria-selected={active}
                      class={
                        active ? "select__class is-active" : "select__class"
                      }
                      data-testid={`hero-class-${klass.id}`}
                      disabled={busy}
                      onClick={() => {
                        setClassId(klass.id);
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              {error !== null ? (
                <p class="select__error" data-testid="char-create-error">
                  {error}
                </p>
              ) : null}
              <button
                type="submit"
                class="glass-btn primary"
                data-testid="create-hero"
                disabled={busy}
              >
                {busy
                  ? t("charSelect.creating")
                  : t("charSelect.confirmCreate")}
              </button>
            </form>
          ) : (
            <div
              class={
                hasHero && selected
                  ? "char-select__preview-body"
                  : "char-select__preview-body is-empty"
              }
              data-testid={
                hasHero && selected ? "char-preview" : "char-preview-empty"
              }
            >
              <PlaceholderFigure
                classId={hasHero && selected ? hero.avatar : "archive_keeper"}
                empty={!hasHero || !selected}
              />
              {!hasHero || !selected ? (
                <p class="text-muted char-select__hint">
                  {t("charSelect.previewEmpty")}
                </p>
              ) : null}
            </div>
          )}
        </section>

        <aside
          class="char-select__list"
          aria-label={t("charSelect.title")}
        >
          <p class="char-select__list-heading cinzel text-gold">
            {t("charSelect.title")}
          </p>
          <div class="char-select__slots">
            <button
              type="button"
              class={
                selected && hasHero && mode === "roster"
                  ? "char-select__slot is-active"
                  : "char-select__slot"
              }
              data-testid="char-slot-hero"
              disabled={!hasHero}
              aria-selected={selected && hasHero && mode === "roster"}
              onClick={() => {
                if (hasHero) {
                  setSelected(true);
                  setMode("roster");
                }
              }}
            >
              {hasHero ? (
                <>
                  <span class="char-select__slot-name cinzel">{hero.name}</span>
                  <span class="char-select__slot-meta">
                    {t("hero.level")} {hero.level}{" "}
                    <span class="char-select__slot-class">
                      {classLabel(hero.avatar, locale)}
                    </span>
                  </span>
                  <span class="char-select__slot-loc text-muted">
                    {hero.title}
                  </span>
                </>
              ) : (
                <span class="char-select__slot-name text-muted">
                  {t("charSelect.emptySlot")}
                </span>
              )}
            </button>
          </div>

          <div class="char-select__list-actions">
            <button
              type="button"
              class="glass-btn primary char-select__create-btn"
              data-testid="char-create"
              disabled={hasHero || busy}
              onClick={() => {
                setMode("create");
                setSelected(false);
                setError(null);
              }}
            >
              {t("charSelect.create")}
            </button>
            <button
              type="button"
              class="glass-btn btn-danger char-select__delete-btn"
              data-testid="char-delete"
              disabled={!hasHero || mode === "create" || busy}
              title={t("charSelect.delete")}
              aria-label={t("charSelect.delete")}
              onClick={onDelete}
            >
              {t("charSelect.delete")}
            </button>
          </div>
        </aside>
      </div>

      <footer class="char-select__dock">
        <button
          type="button"
          class="glass-btn char-select__back"
          data-testid="char-back"
          onClick={onBack}
        >
          « {t("common.back")}
        </button>

        <div class="char-select__enter">
          {selectedName !== null ? (
            <p class="char-select__enter-name cinzel text-gold glow-text">
              {selectedName}
            </p>
          ) : (
            <p class="char-select__enter-name is-placeholder">&nbsp;</p>
          )}
          <button
            type="button"
            class="glass-btn primary char-select__enter-btn"
            data-testid="char-play"
            disabled={!canPlay}
            onClick={onPlay}
          >
            {t("charSelect.play")}
          </button>
        </div>

        <div class="char-select__dock-spacer" aria-hidden="true" />
      </footer>
    </main>
  );
}
