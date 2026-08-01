import { describe, expect, it, vi } from "vitest";

import {
  PERFORMANCE_BUDGETS,
  createFrameBudgetMonitor,
  trimToBudget,
} from "./performance-budget";

describe("performance budgets", () => {
  it("exports stable long-session limits", () => {
    expect(PERFORMANCE_BUDGETS.maxDomListItems).toBe(50);
    expect(PERFORMANCE_BUDGETS.frameBudgetMs).toBe(32);
    expect(PERFORMANCE_BUDGETS.frameBudgetStreak).toBe(5);
    expect(PERFORMANCE_BUDGETS.maxFloatingTexts).toBe(12);
  });

  it("trims FIFO lists to the DOM budget", () => {
    const items = Array.from({ length: 60 }, (_, i) => i);
    expect(trimToBudget(items)).toEqual(
      Array.from({ length: 50 }, (_, i) => i + 10),
    );
    expect(trimToBudget([1, 2, 3], 10)).toEqual([1, 2, 3]);
  });

  it("degrades after slow-frame streak and recovers after good frames", () => {
    const onDegrade = vi.fn();
    const onRecover = vi.fn();
    const monitor = createFrameBudgetMonitor({
      budgetMs: 32,
      degradeStreak: 5,
      recoverStreak: 3,
      onDegrade,
      onRecover,
    });

    for (let i = 0; i < 4; i += 1) {
      expect(monitor.sample(40)).toBe(false);
    }
    expect(monitor.sample(40)).toBe(true);
    expect(onDegrade).toHaveBeenCalledOnce();

    expect(monitor.sample(16)).toBe(true);
    expect(monitor.sample(16)).toBe(true);
    expect(monitor.sample(16)).toBe(false);
    expect(onRecover).toHaveBeenCalledOnce();

    monitor.reset();
    expect(monitor.degraded).toBe(false);
  });
});
