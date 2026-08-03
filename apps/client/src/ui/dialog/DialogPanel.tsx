import {
  isNpcUnlocked,
  listNpcs,
  type DialogDefinition,
  type NpcDefinition,
} from "@adv/content";
import { useEffect, useState } from "preact/hooks";

import type { GameSession } from "../../services/game-session";
import { useStore } from "../useStore";

type Props = {
  readonly session: GameSession;
};

export function DialogPanel({ session }: Props) {
  const state = useStore(session.store);
  const locale = state.settings.locale;
  const bossProgress = state.hero.prestige.bossProgress;
  const t = session.i18n.translate.bind(session.i18n);
  const npcs = listNpcs();

  const [npc, setNpc] = useState<NpcDefinition | null>(
    session.dialog.getActiveNpc(),
  );
  const [dialog, setDialog] = useState<DialogDefinition | null>(
    session.dialog.getCurrentDialog(),
  );
  const [unlockHint, setUnlockHint] = useState<string | null>(null);

  useEffect(() => {
    const onChanged = (): void => {
      setNpc(session.dialog.getActiveNpc());
      setDialog(session.dialog.getCurrentDialog());
    };
    const sub = session.eventBus.subscribe("dialog:changed", onChanged);
    const closedSub = session.eventBus.subscribe("dialog:closed", onChanged);
    return () => {
      session.eventBus.unsubscribe(sub);
      session.eventBus.unsubscribe(closedSub);
    };
  }, [session]);

  useEffect(() => {
    const sub = session.eventBus.subscribe("story:bossDefeated", () => {
      const snapshot = session.store.getState();
      const progress = snapshot.hero.prestige.bossProgress;
      const loc = snapshot.settings.locale;
      const unlocked = listNpcs().filter(
        (entry) => (entry.bossRequired ?? 0) === progress,
      );
      if (unlocked.length === 0) {
        return;
      }
      const names = unlocked
        .map((entry) =>
          loc === "en" && entry.name_en ? entry.name_en : entry.name,
        )
        .join(", ");
      setUnlockHint(
        session.i18n.translate("dialog.unlockHint").replace("{name}", names),
      );
    });
    return () => {
      session.eventBus.unsubscribe(sub);
    };
  }, [session]);

  useEffect(() => {
    if (!unlockHint) {
      return;
    }
    const timer = window.setTimeout(() => {
      setUnlockHint(null);
    }, 8000);
    return () => {
      window.clearTimeout(timer);
    };
  }, [unlockHint]);

  const localize = (de: string, en?: string): string =>
    locale === "en" && en ? en : de;

  const startNpc = (entry: NpcDefinition): void => {
    if (!isNpcUnlocked(entry, bossProgress)) {
      return;
    }
    setUnlockHint(null);
    session.dialog.startDialog(entry.id);
  };

  return (
    <>
      <section class="phase6-panel" data-testid="dialog-panel">
        <h3 class="panel__sub">{t("dialog.title")}</h3>
        {unlockHint ? (
          <p class="phase6-panel__message" data-testid="dialog-unlock-hint">
            {unlockHint}
          </p>
        ) : null}
        <div class="game__actions">
          {npcs.map((entry) => {
            const unlocked = isNpcUnlocked(entry, bossProgress);
            const label = localize(entry.name, entry.name_en);
            const lockedTitle = entry.bossRequired
              ? t("dialog.locked").replace(
                  "{boss}",
                  String(entry.bossRequired),
                )
              : undefined;
            return (
              <button
                key={entry.id}
                type="button"
                class="game__btn"
                data-testid={`dialog-start-${entry.id}`}
                disabled={!unlocked}
                title={!unlocked ? lockedTitle : undefined}
                onClick={() => {
                  startNpc(entry);
                }}
              >
                {unlocked ? label : `${label} · ${lockedTitle ?? ""}`}
              </button>
            );
          })}
        </div>
        {!npc || !dialog ? (
          <p class="game__meta">{t("dialog.pickNpc")}</p>
        ) : null}
      </section>

      {npc && dialog ? (
        <div
          class="dialog-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={localize(npc.name, npc.name_en)}
          data-testid="dialog-active"
        >
          <div class="dialog-overlay__veil" aria-hidden="true" />
          <div class="dialog-overlay__stage">
            <p class="dialog-overlay__speaker">
              {localize(npc.name, npc.name_en)} ·{" "}
              {localize(npc.title, npc.title_en)}
            </p>
            <p class="dialog-overlay__text">
              {localize(dialog.text, dialog.text_en)}
            </p>
            <div class="game__actions dialog-overlay__actions">
              {dialog.options.map((option, index) => (
                <button
                  key={`${option.next}-${String(index)}`}
                  type="button"
                  class="game__btn game__btn--primary"
                  data-testid={`dialog-option-${String(index)}`}
                  onClick={() => {
                    session.dialog.chooseOption(index);
                  }}
                >
                  {localize(option.text, option.text_en)}
                </button>
              ))}
              <button
                type="button"
                class="game__btn game__btn--ghost"
                data-testid="dialog-close"
                onClick={() => {
                  session.dialog.closeDialog();
                }}
              >
                {t("common.close")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
