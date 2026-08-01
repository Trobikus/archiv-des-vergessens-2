import { describe, expect, it } from "vitest";

import {
  createDefaultHeroSave,
  createDefaultSettingsSave,
  createDefaultStorySave,
  validatePhase2SavePayload,
} from "./save-payload";

const base = {
  resources: {
    particles: "0",
    totalParticles: "0",
    mnemeFragmente: "0",
    totalMnemeFragmente: "0",
    ewigeMneme: "0",
  },
  idleGenerators: {
    gedankenArchiv: {
      level: 0,
      baseCost: 10,
      costMultiplier: 1.15,
      baseYield: 1,
      upgrades: { focusBonus: 0 },
    },
  },
  gather: { clickPowerLevel: 0 },
  meta: { lastActiveAt: 1 },
};

const sampleItem = {
  id: "i1",
  name: "Staubige Klinge",
  slot: "weapon",
  rarity: "common",
  level: 1,
  stats: { attack: 3, defense: 0, agility: 0, stamina: 0 },
};

describe("phase-3 save payload hero/story/settings", () => {
  it("accepts a full hero/story/settings payload", () => {
    const hero = {
      ...createDefaultHeroSave(),
      created: true,
      name: "Test",
      title: "Hüter",
      avatar: "archive_keeper",
      equipment: {
        ...createDefaultHeroSave().equipment,
        weapon: sampleItem,
      },
      inventory: { equipment: [sampleItem] },
      prestige: { bossProgress: 2, defeatedBosses: [1, 2] },
      unlockedSkills: ["warrior_2"],
    };
    const result = validatePhase2SavePayload({
      ...base,
      hero,
      story: { storyFightsIntroSeen: true, selectedChapter: 3 },
      settings: { locale: "en" },
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.hero.name).toBe("Test");
      expect(result.value.hero.equipment.weapon?.name).toBe("Staubige Klinge");
      expect(result.value.story.selectedChapter).toBe(3);
      expect(result.value.settings.locale).toBe("en");
    }
  });

  it("rejects invalid hero fields", () => {
    const hero = createDefaultHeroSave();
    expect(validatePhase2SavePayload({ ...base, hero: null }).ok).toBe(false);
    expect(
      validatePhase2SavePayload({ ...base, hero: { ...hero, id: "" } }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({ ...base, hero: { ...hero, name: 1 } }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({ ...base, hero: { ...hero, title: 1 } }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({ ...base, hero: { ...hero, avatar: 1 } }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({ ...base, hero: { ...hero, created: "yes" } })
        .ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({ ...base, hero: { ...hero, level: 0 } }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...base,
        hero: { ...hero, experience: -1 },
      }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({ ...base, hero: { ...hero, expToNext: 0 } })
        .ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...base,
        hero: { ...hero, unspentStatPoints: -1 },
      }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...base,
        hero: { ...hero, baseStats: { attack: -1 } },
      }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...base,
        hero: { ...hero, spentStats: null },
      }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...base,
        hero: { ...hero, equipment: null },
      }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...base,
        hero: {
          ...hero,
          equipment: { ...hero.equipment, weapon: { ...sampleItem, id: "" } },
        },
      }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...base,
        hero: { ...hero, inventory: { equipment: [null] } },
      }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...base,
        hero: { ...hero, prestige: null },
      }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...base,
        hero: {
          ...hero,
          prestige: { bossProgress: -1, defeatedBosses: [] },
        },
      }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...base,
        hero: {
          ...hero,
          prestige: { bossProgress: 0, defeatedBosses: ["x"] },
        },
      }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...base,
        hero: { ...hero, unlockedSkills: [1] },
      }).ok,
    ).toBe(false);
  });

  it("rejects invalid story/settings and exposes defaults helpers", () => {
    expect(createDefaultStorySave().selectedChapter).toBe(1);
    expect(createDefaultSettingsSave().locale).toBe("de");
    expect(validatePhase2SavePayload({ ...base, story: null }).ok).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...base,
        story: { storyFightsIntroSeen: "yes", selectedChapter: 1 },
      }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...base,
        story: { storyFightsIntroSeen: true, selectedChapter: 0 },
      }).ok,
    ).toBe(false);
    expect(validatePhase2SavePayload({ ...base, settings: null }).ok).toBe(
      false,
    );
    expect(
      validatePhase2SavePayload({ ...base, settings: { locale: "fr" } }).ok,
    ).toBe(false);
  });
});
