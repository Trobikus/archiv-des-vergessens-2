import type { I18nKey } from "@adv/content";
import { useState } from "preact/hooks";

import type { GameSession } from "../../services/game-session";
import { FloatingDamageOverlay } from "../combat/FloatingDamageOverlay";
import { DialogPanel } from "../dialog/DialogPanel";
import { Tip } from "../Tip";
import { useStore } from "../useStore";
import { StoryBranchPanel } from "./StoryBranchPanel";
import { StoryFightsIntro } from "./StoryFightsIntro";

const SPELL_TIP_KEY: Record<"spear" | "shield" | "heal", I18nKey> = {
  spear: "combat.spellTip.spear",
  shield: "combat.spellTip.shield",
  heal: "combat.spellTip.heal",
};

type Props = {
  readonly session: GameSession;
};

export function StoryPanel({ session }: Props) {
  const state = useStore(session.store);
  const [showIntro, setShowIntro] = useState(!state.story.storyFightsIntroSeen);
  const chapter = state.story.selectedChapter;
  const bosses = session.story.getBossesForChapter(chapter);
  const current = session.story.getCurrentBoss();
  const battle = state.story.battle;
  const currentInView =
    current !== null && bosses.some((boss) => boss.id === current.id);
  const canStartFight =
    current !== null && currentInView && !state.story.battleInProgress;
  const t = session.i18n.translate.bind(session.i18n);

  if (showIntro && !state.story.storyFightsIntroSeen) {
    return (
      <StoryFightsIntro
        locale={state.settings.locale}
        skipLabel={t("story.fightsIntro.skip")}
        onDone={() => {
          session.story.markIntroSeen();
          setShowIntro(false);
          const boss = session.story.getCurrentBoss();
          if (boss !== null) {
            session.story.selectChapter(boss.chapter);
          }
          void session.saveNow();
        }}
      />
    );
  }

  return (
    <section class="panel" data-testid="story-panel">
      <h2 class="game__heading">{t("hub.story")}</h2>
      <p class="game__meta">
        {t("story.chapterProgress")
          .replace("{chapter}", String(chapter))
          .replace("{progress}", String(state.hero.prestige.bossProgress))}
      </p>
      {current !== null ? (
        <p class="game__meta" data-testid="next-boss">
          {t("story.nextFight")
            .replace("{id}", String(current.id))
            .replace("{name}", current.name)}
          {!currentInView
            ? ` ${t("story.inChapter").replace("{chapter}", String(current.chapter))}`
            : ""}
        </p>
      ) : (
        <p class="game__meta" data-testid="next-boss">
          {t("story.allBossesDefeated")}
        </p>
      )}
      <div class="game__actions">
        <button
          type="button"
          class="game__btn"
          data-testid="chapter-prev"
          disabled={chapter <= 1}
          onClick={() => {
            session.story.selectChapter(chapter - 1);
          }}
        >
          ←
        </button>
        <button
          type="button"
          class="game__btn"
          data-testid="chapter-next"
          disabled={chapter >= 10}
          onClick={() => {
            session.story.selectChapter(chapter + 1);
          }}
        >
          →
        </button>
        {!currentInView && current !== null ? (
          <button
            type="button"
            class="game__btn"
            data-testid="chapter-current"
            onClick={() => {
              session.story.selectChapter(current.chapter);
            }}
          >
            {t("story.goToFight")}
          </button>
        ) : null}
        <button
          type="button"
          class="game__btn game__btn--primary"
          data-testid="start-fight"
          disabled={!canStartFight}
          title={
            current === null
              ? t("story.noMoreBosses")
              : !currentInView
                ? t("story.nextBossChapter").replace(
                    "{chapter}",
                    String(current.chapter),
                  )
                : undefined
          }
          onClick={() => {
            session.story.startBossFight();
          }}
        >
          {t("story.startFight")}
        </button>
        {state.story.battleInProgress ? (
          <button
            type="button"
            class="game__btn"
            data-testid="flee-fight"
            onClick={() => {
              session.story.fleeBattle();
            }}
          >
            {t("story.flee")}
          </button>
        ) : null}
      </div>

      {state.hero.prestige.bossProgress >= 1 ? (
        <DialogPanel session={session} />
      ) : null}

      <ul class="panel__list" data-testid="boss-list">
        {bosses.map((boss) => {
          const defeated = state.hero.prestige.defeatedBosses.includes(boss.id);
          const isCurrent = current?.id === boss.id;
          return (
            <li key={boss.id} class={isCurrent ? "is-current" : undefined}>
              #{String(boss.id)} {boss.name}
              {defeated ? " ✓" : ""}
              {isCurrent ? " ←" : ""}
            </li>
          );
        })}
      </ul>

      {battle !== null ? (
        <div class="battle" data-testid="battle-hud">
          {state.hero.prestige.bossProgress === 0 ? (
            <p class="game__meta" data-testid="combat-auto-hint">
              {t("story.combatAutoHint")}
            </p>
          ) : null}
          <FloatingDamageOverlay
            texts={battle.floatingTexts}
            disabled={
              !state.settings.floatingTextEnabled || state.meta.visualDegraded
            }
          />
          <p class="game__meta">
            {t("story.heroHp")
              .replace("{hp}", String(battle.heroHp))
              .replace("{max}", String(battle.heroMaxHp))}{" "}
            · {battle.boss.name} {String(battle.bossHp)}/
            {String(battle.bossMaxHp)}
            {battle.activeEffects.isEnraged ? t("story.enraged") : ""}
          </p>
          <div class="hp">
            <div
              class="hp__fill hp__fill--hero"
              style={{
                width: `${String((battle.heroHp / battle.heroMaxHp) * 100)}%`,
              }}
            />
          </div>
          <div class="hp">
            <div
              class="hp__fill hp__fill--boss"
              style={{
                width: `${String((battle.bossHp / battle.bossMaxHp) * 100)}%`,
              }}
            />
          </div>
          <div class="game__actions">
            {battle.spells.map((spell) => (
              <Tip
                key={spell.id}
                title={spell.name}
                text={t(SPELL_TIP_KEY[spell.id])}
              >
                <button
                  type="button"
                  class="game__btn"
                  data-testid={`spell-${spell.id}`}
                  disabled={spell.cooldown > 0}
                  onClick={() => {
                    session.story.castSpell(spell.id);
                  }}
                >
                  {spell.name}
                  {spell.cooldown > 0
                    ? ` (${String(Math.ceil(spell.cooldown / 1000))}s)`
                    : ""}
                </button>
              </Tip>
            ))}
          </div>
          <ul class="panel__list battle__log" data-testid="combat-log">
            {battle.combatLog.map((entry, index) => (
              <li key={`${entry.type}-${String(index)}`}>{entry.text}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {state.hero.prestige.bossProgress >= 1 ? (
        <StoryBranchPanel session={session} />
      ) : null}
    </section>
  );
}
