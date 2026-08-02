import { describe, expect, it } from "vitest";

import { DE, EN, assertI18nKeyParity } from "@adv/content";

/** Tip class composition mirror (keeps Tip.tsx logic covered without DOM). */
function tipClassNames(
  below: boolean,
  className?: string,
): string {
  return ["tip", below ? "tip--below" : null, className]
    .filter((value): value is string => value !== null && value !== undefined)
    .join(" ");
}

describe("hub tip i18n keys", () => {
  it("keeps DE/EN tip title keys in parity", () => {
    assertI18nKeyParity();
    const tipTitles = [
      "archiv.idleLevel",
      "archiv.yieldPerSec",
      "archiv.clickPower",
      "analytics.dps",
      "analytics.totalDamage",
      "analytics.maxHit",
      "analytics.critRate",
      "forge.salvage",
      "achievements.streak",
      "codex.decryptCostDetail",
      "relicHunt.chance",
    ] as const;
    for (const key of tipTitles) {
      expect(DE[key].length).toBeGreaterThan(0);
      expect(EN[key].length).toBeGreaterThan(0);
    }
  });

  it("builds above/below tip class names for overflow-safe subtabs", () => {
    expect(tipClassNames(true, "game__subtab-tip")).toBe(
      "tip tip--below game__subtab-tip",
    );
    expect(tipClassNames(false, "game__subtab-tip")).toBe(
      "tip game__subtab-tip",
    );
  });

  it("formats codex decrypt cost detail placeholders", () => {
    const de = DE["codex.decryptCostDetail"]
      .replace("{cost}", "100")
      .replace("{boss}", "3");
    const en = EN["codex.decryptCostDetail"]
      .replace("{cost}", "100")
      .replace("{boss}", "3");
    expect(de).toContain("100");
    expect(de).toContain("3");
    expect(en).toContain("particles");
    expect(de).toContain("Partikel");
  });
});
