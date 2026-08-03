import { describe, expect, it } from "vitest";

import type { TutorialStep } from "./types";
import {
  TUTORIAL_GUIDE_IDS,
  TUTORIAL_GUIDES,
  TUTORIAL_MILESTONES,
  TUTORIAL_STEPS,
} from "./tutorial-steps";

describe("tutorial guides", () => {
  it("exposes every guide id with at least one finish step", () => {
    for (const id of TUTORIAL_GUIDE_IDS) {
      const guide = TUTORIAL_GUIDES[id];
      expect(guide.id).toBe(id);
      expect(guide.steps.length).toBeGreaterThan(0);
      expect(guide.steps.some((step) => step.action === "finish")).toBe(true);
    }
  });

  it("lists each guide exactly once in milestone order", () => {
    const ids = TUTORIAL_MILESTONES.map((entry) => entry.guideId);
    expect(ids).toEqual([...TUTORIAL_GUIDE_IDS]);
  });

  it("keeps TUTORIAL_STEPS as the archiv guide", () => {
    expect(TUTORIAL_STEPS).toEqual(TUTORIAL_GUIDES.archiv.steps);
  });

  it("provides DE and EN copy on every step", () => {
    for (const id of TUTORIAL_GUIDE_IDS) {
      for (const raw of TUTORIAL_GUIDES[id].steps) {
        const step: TutorialStep = raw;
        expect(step.text.length).toBeGreaterThan(0);
        expect(step.text_en.length).toBeGreaterThan(0);
        expect(step.text_en).not.toBe(step.text);
        if (step.title !== undefined) {
          expect(step.title_en?.length).toBeGreaterThan(0);
          expect(step.title_en).not.toBe(step.title);
        }
      }
    }
  });
});
