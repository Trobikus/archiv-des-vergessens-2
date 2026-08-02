import { formatAmount, formatDuration } from "@adv/core";
import type { I18nKey } from "@adv/content";
import { useState } from "preact/hooks";

import { nextGedankenArchivCost } from "../services/idle-service";
import type { GameSession } from "../services/game-session";
import { AchievementPanel } from "./achievement/AchievementPanel";
import { ChallengePanel } from "./challenge/ChallengePanel";
import { ChatPanel } from "./chat/ChatPanel";
import { ClanPanel } from "./clan/ClanPanel";
import { CombatAnalyticsPanel } from "./combat/CombatAnalyticsPanel";
import { CodexPanel } from "./codex/CodexPanel";
import { CraftingPanel } from "./crafting/CraftingPanel";
import { ForgePanel } from "./forge/ForgePanel";
import { FriendsPanel } from "./friends/FriendsPanel";
import { GuildPanel } from "./guild/GuildPanel";
import { HeroPanel, type HeroSubTab } from "./hero/HeroPanel";
import { LeaderboardPanel } from "./leaderboard/LeaderboardPanel";
import { LibraryPanel } from "./library/LibraryPanel";
import { QuestPanel } from "./quest/QuestPanel";
import { RelicHuntPanel } from "./relic-hunt/RelicHuntPanel";
import { SkillTreePanel } from "./skilltree/SkillTreePanel";
import { StoryPanel } from "./story/StoryPanel";
import { Tip, TipBubble } from "./Tip";
import { useStore } from "./useStore";
import { VaultPanel } from "./vault/VaultPanel";

type Props = {
  readonly session: GameSession;
};

type CategoryId =
  | "archiv"
  | "hero"
  | "story"
  | "missions"
  | "workshop"
  | "collection"
  | "social";

type HeroNavId = HeroSubTab | "skilltree" | "vault";
type StoryNavId = "fights" | "challenges" | "analytics";
type MissionsNavId = "quests" | "achievements";
type WorkshopNavId = "forge" | "crafting" | "library";
type CollectionNavId = "relicHunt" | "codex";
type SocialNavId = "chat" | "friends" | "guild" | "clan" | "leaderboard";

type CategoryDef = {
  readonly id: CategoryId;
  readonly labelKey: I18nKey;
  readonly testId: string;
};

const CATEGORIES: readonly CategoryDef[] = [
  { id: "archiv", labelKey: "hub.archive", testId: "tab-idle" },
  { id: "hero", labelKey: "hub.hero", testId: "tab-hero" },
  { id: "story", labelKey: "hub.story", testId: "tab-story" },
  { id: "missions", labelKey: "hub.missions", testId: "tab-missions" },
  { id: "workshop", labelKey: "hub.workshop", testId: "tab-workshop" },
  { id: "collection", labelKey: "hub.collection", testId: "tab-collection" },
  { id: "social", labelKey: "hub.guild", testId: "tab-social" },
];

export function GameView({ session }: Props) {
  const state = useStore(session.store);
  const t = session.i18n.translate.bind(session.i18n);

  const [category, setCategory] = useState<CategoryId>("archiv");
  const [heroNav, setHeroNav] = useState<HeroNavId>("stats");
  const [storyNav, setStoryNav] = useState<StoryNavId>("fights");
  const [missionsNav, setMissionsNav] = useState<MissionsNavId>("quests");
  const [workshopNav, setWorkshopNav] = useState<WorkshopNavId>("forge");
  const [collectionNav, setCollectionNav] =
    useState<CollectionNavId>("relicHunt");
  const [socialNav, setSocialNav] = useState<SocialNavId>("chat");

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

  const openCategory = (id: CategoryId): void => {
    if (id === "story") {
      const boss = session.story.getCurrentBoss();
      if (boss !== null) {
        session.story.selectChapter(boss.chapter);
      }
      setStoryNav("fights");
    }
    setCategory(id);
  };

  return (
    <main class="game game--cinematic">
      <div class="game__scene" aria-hidden="true" />
      <div class="game__veil" aria-hidden="true" />

      <header class="game__topbar">
        <div class="game__topbar-brand">
          <p class="game__brand">{t("menu.title")}</p>
        </div>

        <nav class="game__tabs" aria-label="Game sections">
          {CATEGORIES.map((def) => (
            <button
              key={def.id}
              type="button"
              class={category === def.id ? "game__tab is-active" : "game__tab"}
              data-testid={def.testId}
              aria-current={category === def.id ? "page" : undefined}
              onClick={() => {
                openCategory(def.id);
              }}
            >
              {t(def.labelKey)}
            </button>
          ))}
        </nav>

        <div class="game__topbar-resources" aria-label="Resources">
          <Tip
            className="game__resource"
            title={t("resource.particles")}
            text={t("resource.tip.particles")}
          >
            <span class="game__resource-label">{t("resource.particles")}</span>
            <span class="game__resource-value">
              {formatAmount(state.resources.particles)}
            </span>
          </Tip>
          <Tip
            className="game__resource"
            title={t("resource.mneme")}
            text={t("resource.tip.mneme")}
          >
            <span class="game__resource-label">{t("resource.mneme")}</span>
            <span class="game__resource-value">
              {formatAmount(state.resources.mnemeFragmente)}
            </span>
          </Tip>
          <span class="game__resource game__resource--level">
            <span class="game__resource-label">{t("hero.level")}</span>
            <span class="game__resource-value">{String(state.hero.level)}</span>
          </span>
        </div>
      </header>

      {category === "hero" ? (
        <nav class="game__subtabs" aria-label={t("hub.hero")}>
          {(
            [
              ["stats", "hero.stats", "hero-subtab-stats", null],
              ["inventory", "hero.inventory", "hero-subtab-inventory", null],
              ["equipment", "hero.equipment", "hero-subtab-equipment", null],
              [
                "skilltree",
                "hub.skilltree",
                "tab-skilltree",
                "skilltree.pointsTip",
              ],
              ["vault", "hub.vault", "tab-vault", "hub.vaultDesc"],
            ] as const
          ).map(([id, key, testId, tipKey]) =>
            tipKey === null ? (
              <button
                key={id}
                type="button"
                class={
                  heroNav === id ? "game__subtab is-active" : "game__subtab"
                }
                data-testid={testId}
                aria-current={heroNav === id ? "page" : undefined}
                onClick={() => {
                  setHeroNav(id);
                }}
              >
                {t(key)}
              </button>
            ) : (
              <Tip key={id} className="game__subtab-tip" text={t(tipKey)}>
                <button
                  type="button"
                  class={
                    heroNav === id ? "game__subtab is-active" : "game__subtab"
                  }
                  data-testid={testId}
                  aria-current={heroNav === id ? "page" : undefined}
                  onClick={() => {
                    setHeroNav(id);
                  }}
                >
                  {t(key)}
                </button>
              </Tip>
            ),
          )}
        </nav>
      ) : null}

      {category === "story" ? (
        <nav class="game__subtabs" aria-label={t("hub.story")}>
          {(
            [
              ["fights", "hub.battles", "tab-story-fights", null],
              [
                "challenges",
                "hub.challenges",
                "tab-challenges",
                "hub.challengesDesc",
              ],
              ["analytics", "hub.analytics", "tab-analytics", "hub.analyticsDesc"],
            ] as const
          ).map(([id, key, testId, tipKey]) =>
            tipKey === null ? (
              <button
                key={id}
                type="button"
                class={
                  storyNav === id ? "game__subtab is-active" : "game__subtab"
                }
                data-testid={testId}
                aria-current={storyNav === id ? "page" : undefined}
                onClick={() => {
                  setStoryNav(id);
                }}
              >
                {t(key)}
              </button>
            ) : (
              <Tip key={id} className="game__subtab-tip" text={t(tipKey)}>
                <button
                  type="button"
                  class={
                    storyNav === id ? "game__subtab is-active" : "game__subtab"
                  }
                  data-testid={testId}
                  aria-current={storyNav === id ? "page" : undefined}
                  onClick={() => {
                    setStoryNav(id);
                  }}
                >
                  {t(key)}
                </button>
              </Tip>
            ),
          )}
        </nav>
      ) : null}

      {category === "missions" ? (
        <nav class="game__subtabs" aria-label={t("hub.missions")}>
          {(
            [
              ["quests", "hub.quests", "tab-quests"],
              ["achievements", "hub.achievements", "tab-achievements"],
            ] as const
          ).map(([id, key, testId]) => (
            <button
              key={id}
              type="button"
              class={
                missionsNav === id ? "game__subtab is-active" : "game__subtab"
              }
              data-testid={testId}
              aria-current={missionsNav === id ? "page" : undefined}
              onClick={() => {
                setMissionsNav(id);
              }}
            >
              {t(key)}
            </button>
          ))}
        </nav>
      ) : null}

      {category === "workshop" ? (
        <nav class="game__subtabs" aria-label={t("hub.workshop")}>
          {(
            [
              ["forge", "hub.forge", "tab-forge"],
              ["crafting", "hub.crafting", "tab-crafting"],
              ["library", "hub.library", "tab-library"],
            ] as const
          ).map(([id, key, testId]) => (
            <button
              key={id}
              type="button"
              class={
                workshopNav === id ? "game__subtab is-active" : "game__subtab"
              }
              data-testid={testId}
              aria-current={workshopNav === id ? "page" : undefined}
              onClick={() => {
                setWorkshopNav(id);
              }}
            >
              {t(key)}
            </button>
          ))}
        </nav>
      ) : null}

      {category === "collection" ? (
        <nav class="game__subtabs" aria-label={t("hub.collection")}>
          {(
            [
              ["relicHunt", "hub.relicHunt", "tab-relicHunt"],
              ["codex", "hub.codex", "tab-codex"],
            ] as const
          ).map(([id, key, testId]) => (
            <button
              key={id}
              type="button"
              class={
                collectionNav === id
                  ? "game__subtab is-active"
                  : "game__subtab"
              }
              data-testid={testId}
              aria-current={collectionNav === id ? "page" : undefined}
              onClick={() => {
                setCollectionNav(id);
              }}
            >
              {t(key)}
            </button>
          ))}
        </nav>
      ) : null}

      {category === "social" ? (
        <nav class="game__subtabs" aria-label={t("hub.guild")}>
          {(
            [
              ["chat", "hub.chat", "tab-chat"],
              ["friends", "hub.friends", "tab-friends"],
              ["guild", "hub.guild", "tab-guild"],
              ["clan", "hub.clan", "tab-clan"],
              ["leaderboard", "hub.leaderboard", "tab-leaderboard"],
            ] as const
          ).map(([id, key, testId]) => (
            <button
              key={id}
              type="button"
              class={
                socialNav === id ? "game__subtab is-active" : "game__subtab"
              }
              data-testid={testId}
              aria-current={socialNav === id ? "page" : undefined}
              onClick={() => {
                setSocialNav(id);
              }}
            >
              {t(key)}
            </button>
          ))}
        </nav>
      ) : null}

      {offline !== null &&
      (offline.mnemeGained > 0 ||
        (offline.clanParticlesGained ?? 0) > 0 ||
        (offline.clanRelicsGained ?? 0) > 0) ? (
        <section class="game__offline" aria-live="polite">
          <p>
            Offline {formatDuration(offline.clampedSeconds * 1000)}
            {offline.mnemeGained > 0
              ? ` · +${formatAmount(offline.mnemeGained)} Mneme-Fragmente`
              : ""}
            {(offline.clanParticlesGained ?? 0) > 0
              ? ` · +${formatAmount(offline.clanParticlesGained ?? 0)} Clan-Partikel`
              : ""}
            {(offline.clanRelicsGained ?? 0) > 0
              ? ` · +${formatAmount(offline.clanRelicsGained ?? 0)} Clan-Relikte`
              : ""}
          </p>
          <button
            type="button"
            class="game__btn game__btn--ghost"
            onClick={() => {
              session.dismissOfflineReport();
            }}
          >
            {t("common.close")}
          </button>
        </section>
      ) : null}

      <div
        class={
          category === "archiv"
            ? "game__stage game__stage--archiv"
            : "game__stage game__stage--panels"
        }
      >
        {category !== "archiv" ? (
          <div class="game__stage-surface" key={`stage-${category}`}>
            {category === "hero" &&
            (heroNav === "stats" ||
              heroNav === "inventory" ||
              heroNav === "equipment") ? (
              <HeroPanel session={session} subTab={heroNav} />
            ) : null}
            {category === "hero" && heroNav === "skilltree" ? (
              <SkillTreePanel session={session} />
            ) : null}
            {category === "hero" && heroNav === "vault" ? (
              <VaultPanel session={session} />
            ) : null}

            {category === "story" && storyNav === "fights" ? (
              <StoryPanel session={session} />
            ) : null}
            {category === "story" && storyNav === "challenges" ? (
              <ChallengePanel session={session} />
            ) : null}
            {category === "story" && storyNav === "analytics" ? (
              <CombatAnalyticsPanel session={session} />
            ) : null}

            {category === "missions" && missionsNav === "quests" ? (
              <QuestPanel session={session} />
            ) : null}
            {category === "missions" && missionsNav === "achievements" ? (
              <AchievementPanel session={session} />
            ) : null}

            {category === "workshop" && workshopNav === "forge" ? (
              <ForgePanel session={session} />
            ) : null}
            {category === "workshop" && workshopNav === "crafting" ? (
              <CraftingPanel session={session} />
            ) : null}
            {category === "workshop" && workshopNav === "library" ? (
              <LibraryPanel session={session} />
            ) : null}

            {category === "collection" && collectionNav === "relicHunt" ? (
              <RelicHuntPanel session={session} />
            ) : null}
            {category === "collection" && collectionNav === "codex" ? (
              <CodexPanel session={session} />
            ) : null}

            {category === "social" && socialNav === "chat" ? (
              <ChatPanel session={session} />
            ) : null}
            {category === "social" && socialNav === "friends" ? (
              <FriendsPanel session={session} />
            ) : null}
            {category === "social" && socialNav === "guild" ? (
              <GuildPanel session={session} />
            ) : null}
            {category === "social" && socialNav === "clan" ? (
              <ClanPanel session={session} />
            ) : null}
            {category === "social" && socialNav === "leaderboard" ? (
              <LeaderboardPanel session={session} />
            ) : null}
          </div>
        ) : null}

        {category === "archiv" ? (
          <div class="game__archiv" key="stage-archiv" data-testid="archiv-layout">
            <aside class="game__rail game__rail--left" aria-label="GedankenArchiv">
              <section class="game__focus-panel">
                <h2 class="game__focus-panel__title">GedankenArchiv</h2>
                <p class="game__focus-panel__flavor">
                  Alpha — Mneme sammelt sich, sobald das Archiv steht.
                </p>
                <Tip
                  className="game__stat-tip"
                  title={t("resource.mneme")}
                  text={t("resource.tip.mneme")}
                >
                  <p class="game__stat" data-testid="mneme">
                    {formatAmount(state.resources.mnemeFragmente)}
                    <span class="game__unit"> {t("resource.mneme")}</span>
                  </p>
                </Tip>
                <dl class="game__focus-panel__stats">
                  <div class="tip tip--below">
                    <dt>Idle-Stufe</dt>
                    <dd>
                      {String(state.idleGenerators.gedankenArchiv.level)}
                    </dd>
                    <TipBubble title="Idle-Stufe">
                      {t("archiv.idleLevelTip")}
                    </TipBubble>
                  </div>
                  <div class="tip tip--below">
                    <dt>Yield / s</dt>
                    <dd>{formatAmount(yieldPerSec)}</dd>
                    <TipBubble title="Yield / s">
                      {t("archiv.yieldTip")}
                    </TipBubble>
                  </div>
                </dl>
                <div class="game__actions game__actions--stack">
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
                    class="game__btn game__btn--primary"
                    data-testid="gather-click"
                    onClick={() => {
                      session.gather.gather();
                    }}
                  >
                    Sammeln
                  </button>
                </div>
              </section>
            </aside>

            <div class="game__archiv-center" aria-hidden="true" />

            <aside class="game__rail game__rail--right" aria-label="Status">
              <section class="game__status-card">
                <Tip
                  className="game__status-card__tip"
                  title="Klickkraft"
                  text={t("archiv.clickPowerTip")}
                >
                  <h3 class="game__status-card__title">Klickkraft</h3>
                </Tip>
                <p class="game__status-card__value">
                  Stufe {String(state.gather.clickPowerLevel)}
                </p>
                <p class="game__meta">
                  +{formatAmount(clickGain)} / Klick
                </p>
                <div class="game__actions">
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
                    Upgrade ({formatAmount(clickUpgradeCost)})
                  </button>
                </div>
              </section>

              <section class="game__status-card">
                <Tip
                  className="game__status-card__tip"
                  title={t("resource.particles")}
                  text={t("resource.tip.particles")}
                >
                  <h3 class="game__status-card__title">
                    {t("resource.particles")}
                  </h3>
                </Tip>
                <p class="game__status-card__value" data-testid="particles">
                  {formatAmount(state.resources.particles)}
                </p>
              </section>

              <section class="game__status-card">
                <h3 class="game__status-card__title">Idle-Status</h3>
                <p class="game__meta">
                  {state.idleGenerators.gedankenArchiv.level === 0
                    ? "Wartet auf ersten Ausbau"
                    : `Läuft · ${formatAmount(yieldPerSec)} Mneme / s`}
                </p>
              </section>

              <section class="game__status-card">
                <h3 class="game__status-card__title">Save-Status</h3>
                <p class="game__save" data-testid="save-status">
                  {state.meta.lastSavedAt === null
                    ? "Noch nicht gespeichert"
                    : `Gespeichert ${new Date(state.meta.lastSavedAt).toLocaleTimeString()}`}
                </p>
                <div class="game__actions">
                  <button
                    type="button"
                    class="game__btn"
                    data-testid="manual-save"
                    onClick={() => {
                      void session.saveNow();
                    }}
                  >
                    {t("common.save")}
                  </button>
                </div>
              </section>
            </aside>
          </div>
        ) : null}
      </div>

      <footer class="game__hotkeys" aria-label={t("pause.title")}>
        <span class="game__hotkey">
          <kbd>Esc</kbd>
          <span>{t("pause.escHint")}</span>
        </span>
      </footer>
    </main>
  );
}
