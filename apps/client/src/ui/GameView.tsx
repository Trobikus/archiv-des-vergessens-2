import { formatAmount, formatDuration } from "@adv/core";
import { useState } from "preact/hooks";

import { nextGedankenArchivCost } from "../services/idle-service";
import type { GameSession } from "../services/game-session";
import { HeroPanel, type HeroSubTab } from "./hero/HeroPanel";
import { StoryPanel } from "./story/StoryPanel";
import { useStore } from "./useStore";

type Props = {
  readonly session: GameSession;
};

type TabId = "idle" | "hero" | "story";

export function GameView({ session }: Props) {
  const state = useStore(session.store);
  const [tab, setTab] = useState<TabId>("idle");
  const [heroSubTab, setHeroSubTab] = useState<HeroSubTab>("stats");
  const yieldPerSec = session.idle.getYieldPerSecond();
  const clickGain = session.gather.getClickGain();
  const clickUpgradeCost = session.gather.getUpgradeCost();
  const archivCost = nextGedankenArchivCost(state);
  const canUpgradeGather =
    clickUpgradeCost > 0 &&
    state.resources.particles >= BigInt(clickUpgradeCost);
  const canBuyArchiv =
    archivCost > 0 && state.resources.particles >= BigInt(archivCost);
  const offline = state.meta.offlineReport;

  return (
    <main class="game">
      <header class="game__hero">
        <p class="game__brand">{session.i18n.translate("menu.title")}</p>
        <p class="game__tagline">
          {state.hero.name} · {state.hero.title}
        </p>
      </header>

      <nav class="game__tabs" aria-label="Game sections">
        {(
          [
            ["idle", "Idle"],
            ["hero", session.i18n.translate("hub.hero")],
            ["story", session.i18n.translate("hub.story")],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            class={tab === id ? "game__tab is-active" : "game__tab"}
            data-testid={`tab-${id}`}
            onClick={() => {
              if (id === "story") {
                const boss = session.story.getCurrentBoss();
                if (boss !== null) {
                  session.story.selectChapter(boss.chapter);
                }
              }
              setTab(id);
            }}
          >
            {label}
          </button>
        ))}
      </nav>

      {tab === "hero" ? (
        <nav
          class="hero__subtabs"
          aria-label={session.i18n.translate("hub.hero")}
        >
          {(
            [
              ["stats", "hero.stats"],
              ["inventory", "hero.inventory"],
              ["equipment", "hero.equipment"],
            ] as const
          ).map(([id, key]) => (
            <button
              key={id}
              type="button"
              class={
                heroSubTab === id ? "hero__subtab is-active" : "hero__subtab"
              }
              data-testid={`hero-subtab-${id}`}
              aria-current={heroSubTab === id ? "page" : undefined}
              onClick={() => {
                setHeroSubTab(id);
              }}
            >
              {session.i18n.translate(key)}
            </button>
          ))}
        </nav>
      ) : null}

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
            {session.i18n.translate("common.close")}
          </button>
        </section>
      ) : null}

      {tab === "hero" ? (
        <HeroPanel session={session} subTab={heroSubTab} />
      ) : null}
      {tab === "story" ? <StoryPanel session={session} /> : null}

      {tab === "idle" ? (
        <>
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
                disabled={!canUpgradeGather}
                title={
                  canUpgradeGather
                    ? undefined
                    : `Benötigt ${formatAmount(clickUpgradeCost)} Partikel`
                }
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
              {state.idleGenerators.gedankenArchiv.level === 0
                ? " · Idle aktiv nach erstem Ausbau"
                : " · Idle läuft"}
            </p>
            <div class="game__actions">
              <button
                type="button"
                class="game__btn game__btn--primary"
                data-testid="archiv-buy"
                disabled={!canBuyArchiv}
                title={
                  canBuyArchiv
                    ? undefined
                    : `Benötigt ${formatAmount(archivCost)} Partikel`
                }
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
                {session.i18n.translate("common.save")}
              </button>
            </div>
            <p class="game__save" data-testid="save-status">
              {state.meta.lastSavedAt === null
                ? "Noch nicht gespeichert"
                : `Gespeichert ${new Date(state.meta.lastSavedAt).toLocaleTimeString()}`}
            </p>
          </section>
        </>
      ) : null}
    </main>
  );
}
