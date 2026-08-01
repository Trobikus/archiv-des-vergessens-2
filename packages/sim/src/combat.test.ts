import { describe, expect, it } from "vitest";

import {
  absorbDamage,
  applyExperience,
  calculateCombatStats,
  calculateHealAmount,
  calculateShieldAmount,
  calculateSpearDamage,
  rollBossAutoAttack,
  rollHeroAutoAttack,
  scaleItemStats,
  sumAttributes,
} from "./combat";

describe("combat stats", () => {
  it("matches v1 fresh-hero derived stats", () => {
    const attrs = sumAttributes(
      { attack: 5, defense: 3, agility: 4, stamina: 6 },
      { attack: 0, defense: 0, agility: 0, stamina: 0 },
    );
    const combat = calculateCombatStats(attrs);
    expect(combat.maxHp).toBe(166);
    expect(combat.damageReduction).toBeCloseTo(3 / 103, 5);
    expect(combat.critChance).toBeCloseTo(7, 5);
    expect(combat.critDamage).toBeCloseTo(152.5, 5);
    expect(combat.dodgeChance).toBeCloseTo(1, 5);
  });

  it("includes equipment bonuses", () => {
    const attrs = sumAttributes(
      { attack: 5, defense: 3, agility: 4, stamina: 6 },
      { attack: 0, defense: 0, agility: 0, stamina: 0 },
      [{ attack: 3 }],
    );
    expect(attrs.attack).toBe(8);
  });
});

describe("combat rolls", () => {
  it("rolls hero damage through boss defense", () => {
    const combat = calculateCombatStats({
      attack: 5,
      defense: 3,
      agility: 4,
      stamina: 6,
    });
    const roll = rollHeroAutoAttack(
      combat,
      { hp: 44, attack: 6, defense: 2 },
      () => 0.99,
    );
    expect(roll.damage).toBeGreaterThanOrEqual(1);
    expect(roll.dodged).toBe(false);
  });

  it("can dodge boss attacks", () => {
    const combat = {
      ...calculateCombatStats({
        attack: 5,
        defense: 3,
        agility: 200,
        stamina: 6,
      }),
      dodgeChance: 100,
    };
    const roll = rollBossAutoAttack(
      combat,
      { hp: 44, attack: 6, defense: 2 },
      () => 0,
      false,
    );
    expect(roll.dodged).toBe(true);
    expect(roll.damage).toBe(0);
  });

  it("applies spear / shield / heal formulas", () => {
    const combat = calculateCombatStats({
      attack: 10,
      defense: 0,
      agility: 0,
      stamina: 10,
    });
    expect(calculateSpearDamage(combat, { hp: 100, attack: 1, defense: 0 })).toBe(
      15,
    );
    expect(calculateShieldAmount(200)).toBe(80);
    expect(calculateHealAmount(200)).toBe(70);
    expect(absorbDamage(30, 10)).toEqual({
      remainingDamage: 20,
      remainingShield: 0,
    });
  });
});

describe("experience and item scaling", () => {
  it("levels up and grants stat points", () => {
    const gained = applyExperience(
      { level: 1, experience: 0, expToNext: 50, unspentStatPoints: 0 },
      50,
    );
    expect(gained.level).toBe(2);
    expect(gained.unspentStatPoints).toBe(3);
    expect(gained.expToNext).toBe(60);
    expect(gained.levelsGained).toBe(1);
  });

  it("scales item stats by level", () => {
    expect(scaleItemStats({ attack: 10 }, 3)).toEqual({ attack: 14 });
  });
});
