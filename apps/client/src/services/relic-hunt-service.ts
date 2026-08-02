import { createRng, type EventBus, type Store } from "@adv/core";
import { CONFIG } from "@adv/sim";

import type { GameState } from "../state/game-state";
import type { HeroService } from "./hero-service";
import type { ResourceService } from "./resource-service";

export type RelicHuntResult =
  | {
      readonly success: true;
      readonly message: string;
      readonly reward: { readonly relics: number; readonly experience: number };
    }
  | { readonly success: false; readonly message: string };

export type RelicHuntCooldown =
  | { readonly ready: true }
  | { readonly ready: false; readonly remaining: number; readonly total: number };

export type RelicHuntService = {
  performHunt(): RelicHuntResult;
  getCooldownStatus(now?: number): RelicHuntCooldown;
  getSuccessChance(): number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function readActivePact(hero: GameState["hero"]): string | undefined {
  const prestige = hero.prestige as { activePact?: string };
  return prestige.activePact;
}

export function createRelicHuntService(
  store: Store<GameState>,
  eventBus: EventBus,
  resources: ResourceService,
  heroService: HeroService,
  random?: () => number,
): RelicHuntService {
  const rng = createRng();
  const nextRandom = random ?? (() => rng.next());
  const cfg = CONFIG.RELIC_HUNT;

  const computeChance = (): number => {
    const state = store.getState();
    const hero = state.hero;
    let chance = cfg.BASE_CHANCE;
    chance += hero.level * cfg.LEVEL_BONUS;
    chance += heroService.getAttributes().attack * cfg.POWER_BONUS;
    const activePact = readActivePact(hero);
    if (activePact === "ruthless_greed") {
      chance *= 1.5;
    }
    return clamp(chance, cfg.MIN_CHANCE, cfg.MAX_CHANCE);
  };

  return {
    performHunt() {
      const now = Date.now();
      const cooldownEnd = store.getState().relicHunt.cooldownEnd;
      if (cooldownEnd > now) {
        const remaining = Math.ceil((cooldownEnd - now) / 1000);
        return { success: false, message: `Warte noch ${String(remaining)}s...` };
      }

      if (!resources.removeParticles(cfg.COST)) {
        return {
          success: false,
          message: `Nicht genug Partikel (${String(cfg.COST)} benötigt).`,
        };
      }

      const hero = store.getState().hero;
      const chance = computeChance();
      const roll = nextRandom();
      const huntSuccess = roll < chance;
      const activePact = readActivePact(hero);

      let message = "";
      let reward: { relics: number; experience: number } | undefined;

      if (huntSuccess) {
        let relics =
          1 +
          Math.floor(nextRandom() * 2) +
          Math.floor(hero.level / 10);
        if (activePact === "ruthless_greed") {
          relics = Math.floor(relics * 1.5);
        }
        const finalRelics = Math.max(1, relics);
        resources.addRelics(finalRelics);
        const exp = 5 + Math.floor(nextRandom() * 5);
        heroService.addExperience(exp);
        message = `Erfolg! +${String(finalRelics)} Relikte und +${String(exp)} EP.`;
        reward = { relics: finalRelics, experience: exp };
      } else {
        message = "Fehlgeschlagen... Die Erinnerung war nur ein Schatten.";
      }

      store.setState((prev) => ({
        ...prev,
        relicHunt: { cooldownEnd: now + cfg.COOLDOWN_MS },
      }));

      eventBus.publish("relicHunt:result", {
        success: huntSuccess,
        message,
        reward,
      });

      if (huntSuccess && reward) {
        return { success: true, message, reward };
      }
      return { success: false, message };
    },

    getCooldownStatus(now = Date.now()) {
      const cooldownEnd = store.getState().relicHunt.cooldownEnd;
      if (cooldownEnd <= now) {
        return { ready: true };
      }
      return {
        ready: false,
        remaining: cooldownEnd - now,
        total: cfg.COOLDOWN_MS,
      };
    },

    getSuccessChance() {
      return computeChance();
    },
  };
}
