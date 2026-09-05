import { describe, expect, it, vi } from "vitest";

import { createBootProgressReporter } from "./boot-progress";

describe("boot progress reporter", () => {
  it("reports monotonic percentages for real boot steps", () => {
    const updates: number[] = [];
    const labels: string[] = [];
    const reporter = createBootProgressReporter((progress) => {
      updates.push(progress.pct);
      labels.push(progress.labelDe);
    });

    reporter.report("core");
    reporter.report("fonts");
    reporter.report("save");
    reporter.report("offline");
    reporter.report("systems");
    reporter.report("ready");

    expect(updates).toEqual([17, 33, 50, 67, 83, 100]);
    expect(labels[0]).toContain("Archiv-Kern");
    expect(labels.at(-1)).toBe("Das Archiv ist bereit.");
    expect(reporter.total).toBe(6);
  });

  it("ignores unknown steps safely", () => {
    const onProgress = vi.fn();
    const reporter = createBootProgressReporter(onProgress);
    // @ts-expect-error intentional invalid id
    reporter.report("nope");
    expect(onProgress).not.toHaveBeenCalled();
  });
});
