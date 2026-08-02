import { formatAmount, formatDuration } from "@adv/core";
import type { I18nKey } from "@adv/content";
import { useEffect, useState } from "preact/hooks";

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
import { useStore } from "./useStore";
import { VaultPanel } from "./vault/VaultPanel";

/** Ornate compass seal for cinematic brand mark (inline SVG, mock-faithful). */
function BrandSeal() {
  return (
    <svg
      class="game__brand-seal-svg"
      viewBox="0 0 40 40"
      width="40"
      height="40"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="20" cy="20" r="18.5" fill="none" stroke="currentColor" stroke-width="1.1" />
      <circle cx="20" cy="20" r="14.5" fill="none" stroke="currentColor" stroke-width="0.7" opacity="0.85" />
      <circle cx="20" cy="20" r="4.2" fill="none" stroke="currentColor" stroke-width="0.9" />
      <path
        d="M20 3.5 V36.5 M3.5 20 H36.5 M8.2 8.2 L31.8 31.8 M31.8 8.2 L8.2 31.8"
        fill="none"
        stroke="currentColor"
        stroke-width="0.75"
        opacity="0.9"
      />
      <path
        d="M20 7.5 L21.2 11.5 L20 10.2 L18.8 11.5 Z M32.5 20 L28.5 21.2 L29.8 20 L28.5 18.8 Z M20 32.5 L18.8 28.5 L20 29.8 L21.2 28.5 Z M7.5 20 L11.5 18.8 L10.2 20 L11.5 21.2 Z"
        fill="currentColor"
        opacity="0.95"
      />
    </svg>
  );
}

function ParticleIcon() {
  return (
    <svg
      class="game__resource-icon-svg"
      viewBox="0 0 20 20"
      width="18"
      height="18"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="10" cy="10" r="8.2" fill="none" stroke="currentColor" stroke-width="1.2" />
      <circle cx="10" cy="10" r="3.1" fill="currentColor" opacity="0.9" />
      <path
        d="M10 2.8 V6.2 M10 13.8 V17.2 M2.8 10 H6.2 M13.8 10 H17.2 M5.1 5.1 L7.4 7.4 M12.6 12.6 L14.9 14.9 M14.9 5.1 L12.6 7.4 M7.4 12.6 L5.1 14.9"
        fill="none"
        stroke="currentColor"
        stroke-width="0.9"
        opacity="0.85"
      />
    </svg>
  );
}

function MnemeIcon() {
  return (
    <svg
      class="game__resource-icon-svg"
      viewBox="0 0 20 20"
      width="18"
      height="18"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M5.2 16.5 C5.2 16.5 6.8 11.5 11.5 7.2 C14.8 4.2 17.2 3.2 17.2 3.2 C17.2 3.2 16.4 6.1 13.6 9 C10.4 12.4 6.8 14.8 5.2 16.5 Z"
        fill="none"
        stroke="currentColor"
        stroke-width="1.15"
        stroke-linejoin="round"
      />
      <path
        d="M6.4 15.2 C8.6 12.8 11.2 10.4 13.8 8.4"
        fill="none"
        stroke="currentColor"
        stroke-width="0.85"
        opacity="0.75"
      />
      <path
        d="M4.6 17.2 L6.1 15.4"
        fill="none"
        stroke="currentColor"
        stroke-width="1.2"
        stroke-linecap="round"
      />
    </svg>
  );
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

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

/** Scene keys matching `public/scenes/` art (Phase M1). */
type SceneId = "archiv" | "forschung" | "kodex" | "rituale" | "karte";

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

/**
 * Hub category → cinematic scene asset.
 * Defaults without dedicated mock art: hero → archiv, social → karte.
 */
const SCENE_BY_CATEGORY: Record<CategoryId, SceneId> = {
  archiv: "archiv",
  workshop: "forschung",
  collection: "kodex",
  story: "rituale",
  missions: "karte",
  hero: "archiv",
  social: "karte",
};

const SCENE_FILES: Record<SceneId, string> = {
  archiv: "scenes/game-banner-archiv.png",
  forschung: "scenes/scene-forschung.png",
  kodex: "scenes/scene-kodex.png",
  rituale: "scenes/scene-rituale.png",
  karte: "scenes/scene-karte.png",
};

function sceneBackgroundUrl(sceneId: SceneId): string {
  return `url("${import.meta.env.BASE_URL}${SCENE_FILES[sceneId]}")`;
}

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
  const archivProgressPct =
    archivCost > 0
      ? Math.min(
          100,
          Math.floor(
            Number(
              (state.resources.particles * 100n) /
                BigInt(Math.max(1, archivCost)),
            ),
          ),
        )
      : 0;
  const gatherUpgradeProgressPct =
    clickUpgradeCost > 0
      ? Math.min(
          100,
          Math.floor(
            Number(
              (state.resources.particles * 100n) /
                BigInt(Math.max(1, clickUpgradeCost)),
            ),
          ),
        )
      : 0;
  const offline = state.meta.offlineReport;
  const sceneId = SCENE_BY_CATEGORY[category];

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

  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }
      if (isTypingTarget(event.target)) {
        return;
      }
      const key = event.key.toLowerCase();
      if (key !== "q" && key !== "e") {
        return;
      }
      event.preventDefault();
      const idx = CATEGORIES.findIndex((def) => def.id === category);
      if (idx < 0) {
        return;
      }
      const direction = key === "e" ? 1 : -1;
      const next =
        CATEGORIES[(idx + direction + CATEGORIES.length) % CATEGORIES.length];
      if (next === undefined) {
        return;
      }
      if (next.id === "story") {
        const boss = session.story.getCurrentBoss();
        if (boss !== null) {
          session.story.selectChapter(boss.chapter);
        }
        setStoryNav("fights");
      }
      setCategory(next.id);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [category, session.story]);

  return (
    <main class="game game--cinematic">
      <div
        class={`game__scene game__scene--${sceneId}`}
        data-testid="game-scene"
        data-scene={sceneId}
        style={{ backgroundImage: sceneBackgroundUrl(sceneId) }}
        aria-hidden="true"
      />
      <div class="game__veil" aria-hidden="true" />

      <header class="game__topbar">
        <div class="game__topbar-brand">
          <span class="game__brand-seal" aria-hidden="true">
            <BrandSeal />
          </span>
          <p class="game__brand">{t("menu.title")}</p>
        </div>

        <nav class="game__tabs" aria-label="Game sections">
          <span class="game__tab-cycle" aria-hidden="true">
            [Q]
          </span>
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
              <span class="game__tab-label">{t(def.labelKey)}</span>
              {category === def.id ? (
                <span class="game__tab-ornament" aria-hidden="true">
                  <span class="game__tab-ornament-line" />
                  <span class="game__tab-ornament-diamond" />
                </span>
              ) : null}
            </button>
          ))}
          <span class="game__tab-cycle" aria-hidden="true">
            [E]
          </span>
        </nav>

        <div class="game__topbar-resources" aria-label="Resources">
          <span class="game__resource" aria-label="Partikel">
            <span class="game__resource-icon" aria-hidden="true">
              <ParticleIcon />
            </span>
            <span class="game__resource-value" data-testid="topbar-particles">
              {formatAmount(state.resources.particles)}
            </span>
          </span>
          <span class="game__resource" aria-label="Mneme">
            <span class="game__resource-icon" aria-hidden="true">
              <MnemeIcon />
            </span>
            <span class="game__resource-value" data-testid="topbar-mneme">
              {formatAmount(state.resources.mnemeFragmente)}
            </span>
          </span>
          <span
            class="game__resource game__resource--level"
            aria-label={`${t("hero.level")} ${String(state.hero.level)}`}
          >
            <span class="game__resource-label">{t("hero.level")}</span>
            <span class="game__resource-value" data-testid="topbar-level">
              {String(state.hero.level)}
            </span>
          </span>
        </div>
      </header>

      {category === "hero" ? (
        <nav class="game__subtabs" aria-label={t("hub.hero")}>
          {(
            [
              ["stats", "hero.stats", "hero-subtab-stats"],
              ["inventory", "hero.inventory", "hero-subtab-inventory"],
              ["equipment", "hero.equipment", "hero-subtab-equipment"],
              ["skilltree", "hub.skilltree", "tab-skilltree"],
              ["vault", "hub.vault", "tab-vault"],
            ] as const
          ).map(([id, key, testId]) => (
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
          ))}
        </nav>
      ) : null}

      {category === "story" ? (
        <nav class="game__subtabs" aria-label={t("hub.story")}>
          {(
            [
              ["fights", "hub.battles", "tab-story-fights"],
              ["challenges", "hub.challenges", "tab-challenges"],
              ["analytics", "hub.analytics", "tab-analytics"],
            ] as const
          ).map(([id, key, testId]) => (
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
          ))}
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
              <section class="game__focus-panel shell-frame">
                <span class="shell-frame__corners" aria-hidden="true" />
                <h2 class="game__focus-panel__title shell-heading">
                  GedankenArchiv
                </h2>
                <p class="game__focus-panel__flavor">
                  Alpha — Mneme sammelt sich, sobald das Archiv steht.
                </p>
                <p class="game__stat" data-testid="mneme">
                  {formatAmount(state.resources.mnemeFragmente)}
                  <span class="game__unit"> Mneme</span>
                </p>
                <div
                  class="shell-progress-rail"
                  aria-hidden="true"
                  style={{
                    "--shell-progress": `${String(archivProgressPct)}%`,
                  }}
                >
                  <span class="shell-progress-rail__track" />
                  <span class="shell-progress-rail__fill" />
                  <span class="shell-progress-rail__diamond" />
                </div>
                <dl class="game__focus-panel__stats">
                  <div>
                    <dt>Idle-Stufe</dt>
                    <dd>
                      {String(state.idleGenerators.gedankenArchiv.level)}
                    </dd>
                  </div>
                  <div>
                    <dt>Yield / s</dt>
                    <dd>{formatAmount(yieldPerSec)}</dd>
                  </div>
                </dl>
                <div class="game__actions game__actions--stack">
                  <button
                    type="button"
                    class="game__btn game__btn--primary game__btn--framed"
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
                    class="game__btn game__btn--primary game__btn--framed"
                    data-testid="gather-click"
                    onClick={() => {
                      session.gather.gather();
                    }}
                  >
                    Sammeln
                  </button>
                </div>
              </section>

              <section class="game__status-card shell-frame">
                <span class="shell-frame__corners" aria-hidden="true" />
                <h3 class="game__status-card__title shell-heading">Partikel</h3>
                <ul class="game__resource-rows">
                  <li>
                    <span class="game__resource-rows__label">Partikel</span>
                    <span
                      class="game__resource-rows__value"
                      data-testid="particles"
                    >
                      {formatAmount(state.resources.particles)}
                    </span>
                  </li>
                  <li>
                    <span class="game__resource-rows__label">Mneme</span>
                    <span class="game__resource-rows__value">
                      {formatAmount(state.resources.mnemeFragmente)}
                    </span>
                  </li>
                </ul>
              </section>
            </aside>

            <div class="game__archiv-center" aria-hidden="true" />

            <aside class="game__rail game__rail--right" aria-label="Status">
              <section class="game__rail-panel shell-frame">
                <span class="shell-frame__corners" aria-hidden="true" />

                <div class="game__rail-section">
                  <h3 class="game__status-card__title shell-heading">
                    Klickkraft
                  </h3>
                  <p class="game__status-card__value">
                    Stufe {String(state.gather.clickPowerLevel)}
                  </p>
                  <p class="game__meta">
                    +{formatAmount(clickGain)} / Klick
                  </p>
                  <div
                    class="shell-progress-rail"
                    aria-hidden="true"
                    style={{
                      "--shell-progress": `${String(gatherUpgradeProgressPct)}%`,
                    }}
                  >
                    <span class="shell-progress-rail__track" />
                    <span class="shell-progress-rail__fill" />
                    <span class="shell-progress-rail__diamond" />
                  </div>
                  <div class="game__actions">
                    <button
                      type="button"
                      class="game__btn game__btn--framed"
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
                </div>

                <div class="game__rail-section">
                  <h3 class="game__status-card__title shell-heading">
                    Idle-Status
                  </h3>
                  <p class="game__meta">
                    {state.idleGenerators.gedankenArchiv.level === 0
                      ? "Wartet auf ersten Ausbau"
                      : `Läuft · ${formatAmount(yieldPerSec)} Mneme / s`}
                  </p>
                </div>

                <div class="game__rail-section">
                  <h3 class="game__status-card__title shell-heading">
                    Save-Status
                  </h3>
                  <p class="game__save" data-testid="save-status">
                    {state.meta.lastSavedAt === null
                      ? "Noch nicht gespeichert"
                      : `Gespeichert ${new Date(state.meta.lastSavedAt).toLocaleTimeString()}`}
                  </p>
                  <div class="game__actions">
                    <button
                      type="button"
                      class="game__btn game__btn--framed"
                      data-testid="manual-save"
                      onClick={() => {
                        void session.saveNow();
                      }}
                    >
                      {t("common.save")}
                    </button>
                  </div>
                </div>
              </section>
            </aside>
          </div>
        ) : null}
      </div>

      <footer class="game__hotkeys" aria-label={t("pause.title")}>
        <span class="game__hotkeys-rule" aria-hidden="true">
          <span class="game__hotkeys-rule__line" />
          <span class="game__hotkeys-rule__diamond" />
        </span>
        <span class="game__hotkey">
          <kbd>Esc</kbd>
          <span>{t("pause.escHint")}</span>
        </span>
      </footer>
    </main>
  );
}
