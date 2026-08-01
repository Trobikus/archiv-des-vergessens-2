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

  it("fires slow ticks when scheduleFrame uses the same clock as now()", () => {
    let wall = 1_000_000;
    const slow = vi.fn();
    const frames: Array<() => void> = [];
    const ticker = createTicker({
      logicIntervalMs: 100,
      slowIntervalMs: 500,
      maxDeltaMs: 100,
      now: () => wall,
      scheduleFrame: (cb) => {
        frames.push(() => {
          cb(wall);
        });
        return frames.length;
      },
      cancelFrame: () => undefined,
      onSlowTick: slow,
    });

    ticker.start();
    // Advance wall clock between frames (mirrors game-session rAF wrapper).
    wall += 250;
    frames.shift()?.();
    wall += 250;
    frames.shift()?.();
    wall += 250;
    frames.shift()?.();

    expect(slow.mock.calls.length).toBeGreaterThanOrEqual(1);
    ticker.destroy();
  });

  it("does not fire slow ticks when schedule timestamps regress vs now()", () => {
    const slow = vi.fn();
    const frames: Array<(t: number) => void> = [];
    // Seed with Date.now-scale, then feed performance.now-scale (the old bug).
    const ticker = createTicker({
      logicIntervalMs: 100,
      slowIntervalMs: 500,
      maxDeltaMs: 100,
      now: () => 1_700_000_000_000,
      scheduleFrame: (cb) => {
        frames.push(cb);
        return frames.length;
      },
      cancelFrame: () => undefined,
      onSlowTick: slow,
    });

    ticker.start();
    frames.shift()?.(16);
    frames.shift()?.(32);
    frames.shift()?.(548);
    expect(slow).not.toHaveBeenCalled();
    ticker.destroy();
  });
});
