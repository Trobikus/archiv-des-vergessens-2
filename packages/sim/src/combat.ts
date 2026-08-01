import { sanitizeNumber } from "./sanitize";

export type StatKey = "attack" | "defense" | "agility" | "stamina";

export type HeroAttributes = Record<StatKey, number>;

export type EquipmentStats = Partial<HeroAttributes>;

export type CombatStats = HeroAttributes & {
  readonly maxHp: number;
  readonly damageReduction: number;
  readonly critChance: number;
  readonly critDamage: number;
  readonly dodgeChance: number;
};

export type BossCombatStats = {
  readonly hp: number;
  readonly attack: number;
  readonly defense: number;
};

export type DamageRoll = {
  readonly damage: number;
  readonly isCrit: boolean;
  readonly dodged: boolean;
};

const STAT_KEYS: readonly StatKey[] = [
  "attack",
  "defense",
  "agility",
  "stamina",
];

export function sumAttributes(
  base: HeroAttributes,
  spent: HeroAttributes,
  equipmentStats: readonly EquipmentStats[] = [],
): HeroAttributes {
  const totals: HeroAttributes = {
    attack: sanitizeNumber(base.attack, 0) + sanitizeNumber(spent.attack, 0),
    defense: sanitizeNumber(base.defense, 0) + sanitizeNumber(spent.defense, 0),
    agility: sanitizeNumber(base.agility, 0) + sanitizeNumber(spent.agility, 0),
    stamina: sanitizeNumber(base.stamina, 0) + sanitizeNumber(spent.stamina, 0),
  };

  for (const piece of equipmentStats) {
    for (const key of STAT_KEYS) {
      totals[key] += sanitizeNumber(piece[key] ?? 0, 0);
    }
  }

  return totals;
}

/** Derived combat stats from v1 `selectHeroCombatStats` (no pact multipliers). */
export function calculateCombatStats(attrs: HeroAttributes): CombatStats {
  const attack = sanitizeNumber(attrs.attack, 0);
  const defense = sanitizeNumber(attrs.defense, 0);
  const agility = sanitizeNumber(attrs.agility, 0);
  const stamina = sanitizeNumber(attrs.stamina, 0);

  return {
    attack,
    defense,
    agility,
    stamina,
    maxHp: 100 + stamina * 10 + defense * 2,
    damageReduction: defense / (defense + 100),
    critChance: Math.min(80, 5 + agility * 0.5),
    critDamage: 150 + attack * 0.5,
    dodgeChance: Math.min(50, agility * 0.25),
  };
}

export function defenseReduction(defense: number): number {
  const safe = Math.max(0, sanitizeNumber(defense, 0));
  return safe / (safe + 100);
}

export function rollHeroAutoAttack(
  combat: CombatStats,
  boss: BossCombatStats,
  random: () => number,
  damageMultiplier = 1,
): DamageRoll {
  const isCrit = random() < combat.critChance / 100;
  const multiplier = isCrit ? combat.critDamage / 100 : 1;
  const base = combat.attack * damageMultiplier * multiplier;
  const damage = Math.max(
    1,
    Math.floor(base * (1 - defenseReduction(boss.defense))),
  );
  return { damage, isCrit, dodged: false };
}

export function rollBossAutoAttack(
  combat: CombatStats,
  boss: BossCombatStats,
  random: () => number,
  enraged: boolean,
): DamageRoll {
  if (random() < combat.dodgeChance / 100) {
    return { damage: 0, isCrit: false, dodged: true };
  }
  const bossAttack = enraged ? boss.attack * 1.5 : boss.attack;
  const damage = Math.max(
    1,
    Math.floor(bossAttack * (1 - combat.damageReduction)),
  );
  return { damage, isCrit: false, dodged: false };
}

export function calculateSpearDamage(
  combat: CombatStats,
  boss: BossCombatStats,
  damageMultiplier = 1,
): number {
  const base = combat.attack * damageMultiplier * 1.5;
  return Math.max(1, Math.floor(base * (1 - defenseReduction(boss.defense))));
}

export function calculateShieldAmount(heroMaxHp: number): number {
  return Math.floor(Math.max(0, sanitizeNumber(heroMaxHp, 0)) * 0.4);
}

export function calculateHealAmount(heroMaxHp: number): number {
  return Math.floor(Math.max(0, sanitizeNumber(heroMaxHp, 0)) * 0.35);
}

export function absorbDamage(
  incoming: number,
  shieldAmount: number,
): { readonly remainingDamage: number; readonly remainingShield: number } {
  const damage = Math.max(0, sanitizeNumber(incoming, 0));
  const shield = Math.max(0, sanitizeNumber(shieldAmount, 0));
  const absorb = Math.min(shield, damage);
  return {
    remainingDamage: damage - absorb,
    remainingShield: shield - absorb,
  };
}

export type ExperienceState = {
  readonly level: number;
  readonly experience: number;
  readonly expToNext: number;
  readonly unspentStatPoints: number;
};

export type ExperienceGain = ExperienceState & {
  readonly levelsGained: number;
};

/** Apply EXP / level-ups (v1 `addHeroExperience` loop, without lore/pact multipliers). */
export function applyExperience(
  current: ExperienceState,
  amount: number,
  options: {
    readonly expMultiplier?: number;
    readonly maxLevel?: number;
    readonly statPointsPerLevel?: number;
  } = {},
): ExperienceGain {
  const safeAmount = Math.max(0, sanitizeNumber(amount, 0));
  const mult = Math.max(0, sanitizeNumber(options.expMultiplier ?? 1, 1));
  const maxLevel = Math.max(1, sanitizeNumber(options.maxLevel ?? 9999, 9999));
  const pointsPerLevel = Math.max(
    0,
    Math.floor(sanitizeNumber(options.statPointsPerLevel ?? 3, 3)),
  );

  let experience = current.experience + Math.floor(safeAmount * mult);
  let level = current.level;
  let expToNext = current.expToNext;
  let unspentStatPoints = current.unspentStatPoints;
  let levelsGained = 0;

  while (experience >= expToNext && level < maxLevel) {
    experience -= expToNext;
    level += 1;
    levelsGained += 1;
    unspentStatPoints += pointsPerLevel;
    expToNext = Math.floor(expToNext * 1.2);
  }

  if (level >= maxLevel) {
    experience = 0;
  }

  return {
    level,
    experience,
    expToNext,
    unspentStatPoints,
    levelsGained,
  };
}

export function scaleItemStats(
  baseStats: EquipmentStats,
  level: number,
): EquipmentStats {
  const safeLevel = Math.max(1, Math.floor(sanitizeNumber(level, 1)));
  const factor = 1 + (safeLevel - 1) * 0.2;
  const scaled: EquipmentStats = {};
  for (const key of STAT_KEYS) {
    const value = baseStats[key];
    if (value !== undefined) {
      scaled[key] = Math.floor(value * factor);
    }
  }
  return scaled;
}
