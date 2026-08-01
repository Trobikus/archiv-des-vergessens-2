import { useEffect, useState } from "preact/hooks";

import type { DialogDefinition, NpcDefinition } from "@adv/content";

import type { GameSession } from "../../services/game-session";

type Props = {
  readonly session: GameSession;
};

export function DialogPanel({ session }: Props) {
  const locale = session.i18n.getLocale();
  const [npc, setNpc] = useState<NpcDefinition | null>(
    session.dialog.getActiveNpc(),
  );
  const [dialog, setDialog] = useState<DialogDefinition | null>(
    session.dialog.getCurrentDialog(),
  );

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

  const localize = (de: string, en?: string): string =>
    locale === "en" && en ? en : de;

  return (
    <section class="phase6-panel" data-testid="dialog-panel">
      <h3 class="panel__sub">Dialog</h3>
      <div class="game__actions">
        <button
          type="button"
          class="game__btn"
          data-testid="dialog-start-archivist"
          onClick={() => {
            session.dialog.startDialog("archivist");
          }}
        >
          Archivar Theron
        </button>
        <button
          type="button"
          class="game__btn"
          data-testid="dialog-start-merchant"
          onClick={() => {
            session.dialog.startDialog("merchant");
          }}
        >
          Händler
        </button>
      </div>

      {npc && dialog ? (
        <div class="phase6-dialog" data-testid="dialog-active">
          <p class="game__meta">
            {localize(npc.name, npc.name_en)} ·{" "}
            {localize(npc.title, npc.title_en)}
          </p>
          <p class="phase6-panel__text">
            {localize(dialog.text, dialog.text_en)}
          </p>
          <div class="game__actions">
            {dialog.options.map((option, index) => (
              <button
                key={`${option.next}-${String(index)}`}
                type="button"
                class="game__btn"
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
              Schließen
            </button>
          </div>
        </div>
      ) : (
        <p class="game__meta">Wähle einen NPC für ein Gespräch.</p>
      )}
    </section>
  );
}
