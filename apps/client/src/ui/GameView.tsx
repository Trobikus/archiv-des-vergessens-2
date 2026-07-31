import { formatAmount, formatDuration } from "@adv/core";

import { nextGedankenArchivCost } from "../services/idle-service";
import type { GameSession } from "../services/game-session";
import { useStore } from "./useStore";

type Props = {
  readonly session: GameSession;
};

export function GameView({ session }: Props) {
  const state = useStore(session.store);
  const yieldPerSec = session.idle.getYieldPerSecond();
  const clickGain = session.gather.getClickGain();
  const clickUpgradeCost = session.gather.getUpgradeCost();
  const archivCost = nextGedankenArchivCost(state);
  const offline = state.meta.offlineReport;

  return (
    <main class="game">
      <header class="game__hero">
        <p class="game__brand">Archiv des Vergessens</p>
        <p class="game__tagline">Sammle. Tick. Speichere. Offline weiter.</p>
      </header>

      {offline !== null && offline.mnemeGained > 0 ? (
        <section class="game__offline" aria-live="polite">
          <p>
            Offline {formatDuration(offline.clampedSeconds * 1000)} · +
            {formatAmount(offline.mnemeGained)} Mneme-Fragmente
          </p>
          <button
            type="button"
            class="game__btn game__btn--ghost"
            onClick={() => {
              session.dismissOfflineReport();
            }}
          >
            Schließen
          </button>
        </section>
      ) : null}

      <section class="game__panel">
        <h1 class="game__heading">Partikel</h1>
        <p class="game__stat" data-testid="particles">
          {formatAmount(state.resources.particles)}
        </p>
        <p class="game__meta">
          Klickkraft Stufe {String(state.gather.clickPowerLevel)} · +
          {formatAmount(clickGain)} / Klick
        </p>
        <div class="game__actions">
          <button
            type="button"
            class="game__btn game__btn--primary"
            data-testid="gather-click"
            onClick={() => {
              session.gather.gather();
            }}
          >
            Sammeln
          </button>
          <button
            type="button"
            class="game__btn"
            data-testid="gather-upgrade"
            onClick={() => {
              session.gather.upgradeClickPower();
            }}
          >
            Klickkraft ({formatAmount(clickUpgradeCost)})
          </button>
        </div>
      </section>

      <section class="game__panel">
        <h2 class="game__heading">GedankenArchiv</h2>
        <p class="game__stat" data-testid="mneme">
          {formatAmount(state.resources.mnemeFragmente)}
          <span class="game__unit"> Mneme</span>
        </p>
        <p class="game__meta">
          Stufe {String(state.idleGenerators.gedankenArchiv.level)} ·{" "}
          {formatAmount(yieldPerSec)} / s
        </p>
        <div class="game__actions">
          <button
            type="button"
            class="game__btn game__btn--primary"
            data-testid="archiv-buy"
            onClick={() => {
              session.idle.buyLevel(1);
            }}
          >
            Ausbauen ({formatAmount(archivCost)})
          </button>
          <button
            type="button"
            class="game__btn"
            data-testid="manual-save"
            onClick={() => {
              void session.saveNow();
            }}
          >
            Speichern
          </button>
        </div>
        <p class="game__save" data-testid="save-status">
          {state.meta.lastSavedAt === null
            ? "Noch nicht gespeichert"
            : `Gespeichert ${new Date(state.meta.lastSavedAt).toLocaleTimeString()}`}
        </p>
      </section>
    </main>
  );
}
