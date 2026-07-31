import { describe, expect, it, vi } from "vitest";

import { createTicker } from "./ticker";

describe("Ticker", () => {
  it("emits logic and slow ticks on intervals", () => {
    const logic = vi.fn();
    const slow = vi.fn();
    const frame = vi.fn();
    const ticker = createTicker({
      logicIntervalMs: 100,
      slowIntervalMs: 500,
      maxDeltaMs: 100,
      now: () => 0,
      onLogicTick: logic,
      onSlowTick: slow,
      onFrame: frame,
    });

    ticker.step(0);
    ticker.step(100);
    ticker.step(500);

    expect(frame).toHaveBeenCalled();
    expect(logic).toHaveBeenCalled();
    expect(slow).toHaveBeenCalled();
    expect(ticker.running).toBe(false);
  });

  it("clamps large deltas and schedules frames while running", () => {
    const clamped = vi.fn();
    const frames: Array<(t: number) => void> = [];
    const ticker = createTicker({
      logicIntervalMs: 100,
      slowIntervalMs: 500,
      maxDeltaMs: 100,
      now: () => 1000,
      scheduleFrame: (cb) => {
        frames.push(cb);
        return frames.length;
      },
      cancelFrame: () => undefined,
      onSpeedClamp: clamped,
      onFrame: vi.fn(),
    });

    ticker.start();
    expect(ticker.running).toBe(true);
    ticker.start(); // idempotent
    const first = frames.shift();
    first?.(1300);
    expect(clamped).toHaveBeenCalled();
    ticker.stop();
    expect(ticker.running).toBe(false);
    ticker.stop();
    ticker.destroy();
  });
});
