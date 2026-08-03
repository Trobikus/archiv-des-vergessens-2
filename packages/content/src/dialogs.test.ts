import { describe, expect, it } from "vitest";

import {
  getNPC,
  isNpcUnlocked,
  listNpcs,
  NPCS,
} from "./dialogs";

describe("story NPC unlock gates", () => {
  it("lists all cinematic NPCs", () => {
    expect(listNpcs()).toHaveLength(Object.keys(NPCS).length);
    expect(getNPC("guardian_npc")?.bossRequired).toBe(4);
    expect(getNPC("shadow_voice")?.bossRequired).toBe(10);
  });

  it("unlocks archivist and merchant from the start", () => {
    expect(isNpcUnlocked(NPCS.archivist, 0)).toBe(true);
    expect(isNpcUnlocked(NPCS.merchant, 0)).toBe(true);
    expect(isNpcUnlocked(NPCS.guardian_npc, 0)).toBe(false);
    expect(isNpcUnlocked(NPCS.shadow_voice, 0)).toBe(false);
  });

  it("gates Elara and Nyx on boss progress milestones", () => {
    expect(isNpcUnlocked(NPCS.guardian_npc, 3)).toBe(false);
    expect(isNpcUnlocked(NPCS.guardian_npc, 4)).toBe(true);
    expect(isNpcUnlocked(NPCS.shadow_voice, 9)).toBe(false);
    expect(isNpcUnlocked(NPCS.shadow_voice, 10)).toBe(true);
  });
});
