import { describe, expect, it } from "vitest";

import { validatePhase2SavePayload } from "./save-payload";

const validPayload = {
  resources: {
    particles: "10",
    totalParticles: "10",
    mnemeFragmente: "5",
    totalMnemeFragmente: "5",
    ewigeMneme: "0",
  },
  idleGenerators: {
    gedankenArchiv: {
      level: 2,
      baseCost: 10,
      costMultiplier: 1.15,
      baseYield: 1,
      upgrades: { focusBonus: 0 },
    },
  },
  gather: { clickPowerLevel: 1 },
  meta: { lastActiveAt: 1000 },
};

describe("validatePhase2SavePayload", () => {
  it("accepts a valid phase-2 payload and fills hero/story defaults", () => {
    const result = validatePhase2SavePayload(validPayload);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.gather.clickPowerLevel).toBe(1);
      expect(result.value.idleGenerators.gedankenArchiv.level).toBe(2);
      expect(result.value.hero.created).toBe(false);
      expect(result.value.story.selectedChapter).toBe(1);
      expect(result.value.settings.locale).toBe("de");
    }
  });

  it("rejects non-objects and missing sections", () => {
    expect(validatePhase2SavePayload(null).ok).toBe(false);
    expect(validatePhase2SavePayload([]).ok).toBe(false);
    expect(validatePhase2SavePayload({ ...validPayload, resources: null }).ok).toBe(
      false,
    );
    expect(
      validatePhase2SavePayload({ ...validPayload, idleGenerators: null }).ok,
    ).toBe(false);
    expect(validatePhase2SavePayload({ ...validPayload, gather: null }).ok).toBe(
      false,
    );
    const { meta: _meta, ...rest } = validPayload;
    expect(validatePhase2SavePayload(rest).ok).toBe(false);
  });

  it("rejects invalid resource strings", () => {
    for (const key of [
      "particles",
      "totalParticles",
      "mnemeFragmente",
      "totalMnemeFragmente",
      "ewigeMneme",
    ] as const) {
      const result = validatePhase2SavePayload({
        ...validPayload,
        resources: { ...validPayload.resources, [key]: "1.5" },
      });
      expect(result.ok).toBe(false);
    }
  });

  it("rejects invalid gedankenArchiv fields", () => {
    const base = validPayload.idleGenerators.gedankenArchiv;
    expect(
      validatePhase2SavePayload({
        ...validPayload,
        idleGenerators: { gedankenArchiv: null },
      }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...validPayload,
        idleGenerators: { gedankenArchiv: { ...base, level: -1 } },
      }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...validPayload,
        idleGenerators: { gedankenArchiv: { ...base, baseCost: -1 } },
      }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...validPayload,
        idleGenerators: { gedankenArchiv: { ...base, costMultiplier: 0.5 } },
      }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...validPayload,
        idleGenerators: { gedankenArchiv: { ...base, baseYield: -1 } },
      }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...validPayload,
        idleGenerators: { gedankenArchiv: { ...base, upgrades: null } },
      }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...validPayload,
        idleGenerators: {
          gedankenArchiv: { ...base, upgrades: { focusBonus: -1 } },
        },
      }).ok,
    ).toBe(false);
  });

  it("rejects invalid gather/meta numbers", () => {
    expect(
      validatePhase2SavePayload({
        ...validPayload,
        gather: { clickPowerLevel: -1 },
      }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...validPayload,
        gather: { clickPowerLevel: Number.NaN },
      }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...validPayload,
        meta: { lastActiveAt: -1 },
      }).ok,
    ).toBe(false);
    expect(
      validatePhase2SavePayload({
        ...validPayload,
        meta: { lastActiveAt: Number.NaN },
      }).ok,
    ).toBe(false);
  });
});
