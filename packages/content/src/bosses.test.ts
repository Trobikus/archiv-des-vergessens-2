import { describe, expect, it } from "vitest";

import { getItemTemplate } from "./items";
import { generateStoryBosses, STORY_BOSSES } from "./bosses";

describe("story bosses", () => {
  it("generates 100 bosses with chapter-1 sample stats", () => {
    const bosses = generateStoryBosses();
    expect(bosses).toHaveLength(100);
    expect(STORY_BOSSES).toHaveLength(100);

    expect(bosses[0]).toMatchObject({
      id: 1,
      hp: 44,
      attack: 6,
      defense: 2,
      reward: { exp: 22, items: [] },
    });
    expect(bosses[4]).toMatchObject({
      id: 5,
      name: "Rastloses Echo von Eldoria",
      hp: 90,
      attack: 10,
      defense: 3,
      reward: { exp: 30 },
    });
    expect(bosses[9]).toMatchObject({
      id: 10,
      hp: 160,
      attack: 18,
      defense: 6,
      reward: { exp: 120 },
    });
  });

  it("resolves every chapter unique reward to an item template", () => {
    for (const boss of STORY_BOSSES) {
      for (const itemName of boss.reward.items) {
        expect(getItemTemplate(itemName), itemName).toBeDefined();
      }
    }
    expect(getItemTemplate("does-not-exist")).toBeUndefined();
  });
});
