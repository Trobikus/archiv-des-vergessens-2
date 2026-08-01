import { STORY_BOSSES, type StoryBoss } from "@adv/content";
import {
  PERFORMANCE_BUDGETS,
  createRng,
  type EventBus,
  type Store,
} from "@adv/core";
import {
  absorbDamage,
  calculateHealAmount,
  calculateShieldAmount,
  calculateSpearDamage,
  rollBossAutoAttack,
  rollHeroAutoAttack,
} from "@adv/sim";

import type {
  BattleState,
  CombatLogEntry,
  FloatingText,
  GameState,
  SpellState,
} from "../state/game-state";
import type { CombatAnalyticsService } from "./combat-analytics-service";
import {
  createHeroService,
  resolveRewardItems,
  type HeroService,
} from "./hero-service";

export type StoryServiceDeps = {
  readonly eventBus?: EventBus;
  readonly combatAnalytics?: CombatAnalyticsService;
};

export type StoryService = {
  getBosses(): readonly StoryBoss[];
  getCurrentBoss(): StoryBoss | null;
  getBossesForChapter(chapter: number): readonly StoryBoss[];
  selectChapter(chapter: number): void;
  markIntroSeen(): void;
  startBossFight(): boolean;
  fleeBattle(): void;
  castSpell(spellId: SpellState["id"]): boolean;
  processBattleTick(deltaMs: number): void;
};

const DEFAULT_SPELLS: readonly SpellState[] = [
  {
    id: "spear",
    name: "Speer des Bundes",
    cooldown: 0,
    maxCooldown: 6000,
  },
  {
    id: "shield",
    name: "Schild der Vergessenen",
    cooldown: 0,
    maxCooldown: 10000,
  },
  {
    id: "heal",
    name: "Temporale Heilung",
    cooldown: 0,
    maxCooldown: 8000,
  },
];

let floatingSeq = 0;

function pushLog(
  log: readonly CombatLogEntry[],
  entry: CombatLogEntry,
): CombatLogEntry[] {
  const next = [...log, entry];
  const max = PERFORMANCE_BUDGETS.maxCombatLog;
  return next.length > max ? next.slice(next.length - max) : next;
}

function pushFloat(
  texts: readonly FloatingText[],
  text: string,
  kind: FloatingText["kind"],
): FloatingText[] {
  floatingSeq += 1;
  const next = [
    ...texts,
    { id: `ft_${String(floatingSeq)}`, text, kind },
  ];
  const max = PERFORMANCE_BUDGETS.maxFloatingTexts;
  return next.length > max ? next.slice(next.length - max) : next;
}

export function createStoryService(
  store: Store<GameState>,
  heroService: HeroService = createHeroService(store),
  deps: StoryServiceDeps = {},
  random?: () => number,
): StoryService {
  const rng = createRng();
  const nextRandom = random ?? (() => rng.next());
  const { eventBus, combatAnalytics } = deps;

  const recordHeroHit = (damage: number, isCrit: boolean): void => {
    combatAnalytics?.recordHit(damage, isCrit, "physical");
  };
  const getCurrentBoss = (): StoryBoss | null => {
    const progress = store.getState().hero.prestige.bossProgress;
    if (progress >= STORY_BOSSES.length) {
      return null;
    }
    return STORY_BOSSES[progress] ?? null;
  };

  const finishBattle = (victory: boolean, boss: StoryBoss): void => {
    store.setState((prev) => ({
      ...prev,
      story: {
        ...prev.story,
        battleInProgress: false,
        battle: null,
      },
    }));

    if (!victory) {
      return;
    }

    const rewards = resolveRewardItems(boss.reward.items);
    store.setState((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        prestige: {
          bossProgress: prev.hero.prestige.bossProgress + 1,
          defeatedBosses: [...prev.hero.prestige.defeatedBosses, boss.id],
        },
        inventory: {
          equipment: [...prev.hero.inventory.equipment, ...rewards],
        },
      },
    }));
    heroService.addExperience(boss.reward.exp);
    eventBus?.publish("story:bossDefeated", { boss });
    combatAnalytics?.reset();
  };

  return {
    getBosses() {
      return STORY_BOSSES;
    },

    getCurrentBoss,

    getBossesForChapter(chapter) {
      return STORY_BOSSES.filter((boss) => boss.chapter === chapter);
    },

    selectChapter(chapter) {
      const safe = Math.min(10, Math.max(1, Math.floor(chapter)));
      store.setState((prev) => ({
        ...prev,
        story: { ...prev.story, selectedChapter: safe },
      }));
    },

    markIntroSeen() {
      store.setState((prev) => ({
        ...prev,
        story: { ...prev.story, storyFightsIntroSeen: true },
      }));
    },

    startBossFight() {
      const state = store.getState();
      if (state.story.battleInProgress) {
        return false;
      }
      const boss = getCurrentBoss();
      if (!boss) {
        return false;
      }
      const combat = heroService.getCombatStats();
      const battle: BattleState = {
        heroHp: combat.maxHp,
        heroMaxHp: combat.maxHp,
        bossHp: boss.hp,
        bossMaxHp: boss.hp,
        boss,
        combatLog: [
          { text: `Der Kampf gegen ${boss.name} beginnt!`, type: "info" },
        ],
        spells: DEFAULT_SPELLS.map((spell) => ({ ...spell })),
        activeEffects: { shieldAmount: 0, isEnraged: false },
        floatingTexts: [],
      };
      store.setState((prev) => ({
        ...prev,
        story: {
          ...prev.story,
          battleInProgress: true,
          battle,
          selectedChapter: boss.chapter,
        },
      }));
      combatAnalytics?.reset();
      return true;
    },

    fleeBattle() {
      if (!store.getState().story.battleInProgress) {
        return;
      }
      store.setState((prev) => ({
        ...prev,
        story: {
          ...prev.story,
          battleInProgress: false,
          battle: null,
        },
      }));
    },

    castSpell(spellId) {
      const state = store.getState();
      const battle = state.story.battle;
      if (!state.story.battleInProgress || battle === null) {
        return false;
      }
      const spell = battle.spells.find((entry) => entry.id === spellId);
      if (!spell || spell.cooldown > 0) {
        return false;
      }

      const combat = heroService.getCombatStats();
      const damageMultiplier = state.hero.unlockedSkills.includes("warrior_2")
        ? 1.2
        : 1;

      let bossHp = battle.bossHp;
      let heroHp = battle.heroHp;
      let shieldAmount = battle.activeEffects.shieldAmount;
      let combatLog = [...battle.combatLog];
      let floatingTexts = [...battle.floatingTexts];
      let logMessage = "";

      if (spellId === "spear") {
        const damage = calculateSpearDamage(
          combat,
          battle.boss,
          damageMultiplier,
        );
        bossHp = Math.max(0, bossHp - damage);
        logMessage = `Speer des Bundes: ${String(damage)} Schaden.`;
        floatingTexts = pushFloat(floatingTexts, String(damage), "damage");
        recordHeroHit(damage, false);
      } else if (spellId === "shield") {
        shieldAmount = calculateShieldAmount(battle.heroMaxHp);
        logMessage = `Schild absorbiert bis zu ${String(shieldAmount)} Schaden.`;
        floatingTexts = pushFloat(floatingTexts, "Schild", "info");
      } else {
        const heal = calculateHealAmount(battle.heroMaxHp);
        heroHp = Math.min(battle.heroMaxHp, heroHp + heal);
        logMessage = `Heilung +${String(heal)} HP.`;
        floatingTexts = pushFloat(floatingTexts, `+${String(heal)}`, "heal");
      }

      combatLog = pushLog(combatLog, {
        text: logMessage,
        type: `spell-${spellId}`,
      });

      const nextBattle: BattleState = {
        ...battle,
        bossHp,
        heroHp,
        combatLog,
        floatingTexts,
        spells: battle.spells.map((entry) =>
          entry.id === spellId
            ? { ...entry, cooldown: entry.maxCooldown }
            : entry,
        ),
        activeEffects: {
          ...battle.activeEffects,
          shieldAmount,
        },
      };

      store.setState((prev) => ({
        ...prev,
        story: { ...prev.story, battle: nextBattle },
      }));

      if (bossHp <= 0) {
        finishBattle(true, battle.boss);
      }
      return true;
    },

    processBattleTick(deltaMs) {
      const state = store.getState();
      const battle = state.story.battle;
      if (!state.story.battleInProgress || battle === null) {
        return;
      }

      const combat = heroService.getCombatStats();
      const damageMultiplier = state.hero.unlockedSkills.includes("warrior_2")
        ? 1.2
        : 1;

      const updatedSpells = battle.spells.map((spell) => ({
        ...spell,
        cooldown: Math.max(0, spell.cooldown - deltaMs),
      }));

      let combatLog = [...battle.combatLog];
      let floatingTexts = [...battle.floatingTexts];
      let heroHp = battle.heroHp;
      let bossHp = battle.bossHp;
      let shieldAmount = battle.activeEffects.shieldAmount;
      let isEnraged = battle.activeEffects.isEnraged;

      const heroHit = rollHeroAutoAttack(
        combat,
        battle.boss,
        nextRandom,
        damageMultiplier,
      );
      bossHp = Math.max(0, bossHp - heroHit.damage);
      combatLog = pushLog(combatLog, {
        text: `Du triffst ${battle.boss.name} für ${String(heroHit.damage)} Schaden.${heroHit.isCrit ? " (KRITISCH!)" : ""}`,
        type: heroHit.isCrit ? "crit" : "damage-deal",
      });
      floatingTexts = pushFloat(
        floatingTexts,
        String(heroHit.damage),
        heroHit.isCrit ? "crit" : "damage",
      );
      recordHeroHit(heroHit.damage, heroHit.isCrit);

      if (bossHp <= 0) {
        store.setState((prev) => ({
          ...prev,
          story: {
            ...prev.story,
            battle: {
              ...battle,
              heroHp,
              bossHp,
              combatLog,
              floatingTexts,
              spells: updatedSpells,
              activeEffects: { shieldAmount, isEnraged },
            },
          },
        }));
        finishBattle(true, battle.boss);
        return;
      }

      if (bossHp <= battle.boss.hp / 2 && !isEnraged) {
        isEnraged = true;
        combatLog = pushLog(combatLog, {
          text: `${battle.boss.name} gerät in Wut! (+50% Angriff)`,
          type: "enrage",
        });
      }

      const bossHit = rollBossAutoAttack(
        combat,
        battle.boss,
        nextRandom,
        isEnraged,
      );
      if (bossHit.dodged) {
        combatLog = pushLog(combatLog, {
          text: `Du weichst dem Angriff von ${battle.boss.name} aus!`,
          type: "dodge",
        });
        floatingTexts = pushFloat(floatingTexts, "Miss", "miss");
      } else {
        const absorbed = absorbDamage(bossHit.damage, shieldAmount);
        shieldAmount = absorbed.remainingShield;
        if (bossHit.damage > absorbed.remainingDamage) {
          combatLog = pushLog(combatLog, {
            text: `Schild absorbiert ${String(bossHit.damage - absorbed.remainingDamage)} Schaden.`,
            type: "shield-absorb",
          });
        }
        if (absorbed.remainingDamage > 0) {
          heroHp = Math.max(0, heroHp - absorbed.remainingDamage);
          combatLog = pushLog(combatLog, {
            text: `${battle.boss.name} trifft dich für ${String(absorbed.remainingDamage)} Schaden.`,
            type: "damage-taken",
          });
          floatingTexts = pushFloat(
            floatingTexts,
            String(absorbed.remainingDamage),
            "damage",
          );
        }
      }

      if (heroHp <= 0) {
        store.setState((prev) => ({
          ...prev,
          story: {
            ...prev.story,
            battle: {
              ...battle,
              heroHp,
              bossHp,
              combatLog,
              floatingTexts,
              spells: updatedSpells,
              activeEffects: { shieldAmount, isEnraged },
            },
          },
        }));
        finishBattle(false, battle.boss);
        return;
      }

      store.setState((prev) => ({
        ...prev,
        story: {
          ...prev.story,
          battle: {
            ...battle,
            heroHp,
            bossHp,
            combatLog,
            floatingTexts,
            spells: updatedSpells,
            activeEffects: { shieldAmount, isEnraged },
          },
        },
      }));
    },
  };
}
