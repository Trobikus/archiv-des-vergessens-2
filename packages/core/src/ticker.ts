export type TickPayload = {
  readonly timestamp: number;
  readonly deltaMs: number;
};

export type TickerOptions = {
  readonly logicIntervalMs: number;
  readonly slowIntervalMs: number;
  /** Anti-speed-hack clamp (v1 default 100). */
  readonly maxDeltaMs?: number;
  readonly now?: () => number;
  readonly scheduleFrame?: (cb: (timestamp: number) => void) => number;
  readonly cancelFrame?: (id: number) => void;
  readonly onLogicTick?: (payload: TickPayload) => void;
  readonly onSlowTick?: (payload: TickPayload) => void;
  readonly onFrame?: (payload: TickPayload) => void;
  readonly onSpeedClamp?: () => void;
};

function defaultNow(): number {
  return Date.now();
}

function defaultScheduleFrame(cb: (timestamp: number) => void): number {
  const handle = setTimeout(() => {
    cb(defaultNow());
  }, 16);
  return handle as unknown as number;
}

function defaultCancelFrame(id: number): void {
  clearTimeout(id);
}

/**
 * Logic/slow ticker with delta clamping. Frame schedule is injectable for tests.
 * Defaults use setTimeout so `@adv/core` stays Node-friendly; clients may inject rAF.
 */
export class Ticker {
  readonly #logicIntervalMs: number;
  readonly #slowIntervalMs: number;
  readonly #maxDeltaMs: number;
  readonly #now: () => number;
  readonly #scheduleFrame: (cb: (timestamp: number) => void) => number;
  readonly #cancelFrame: (id: number) => void;
  readonly #onLogicTick: ((payload: TickPayload) => void) | undefined;
  readonly #onSlowTick: ((payload: TickPayload) => void) | undefined;
  readonly #onFrame: ((payload: TickPayload) => void) | undefined;
  readonly #onSpeedClamp: (() => void) | undefined;

  #running = false;
  #frameId: number | null = null;
  #lastTimestamp = 0;
  #lastLogicTick = 0;
  #lastSlowTick = 0;
  readonly #boundTick: (timestamp: number) => void;

  constructor(options: TickerOptions) {
    this.#logicIntervalMs = options.logicIntervalMs;
    this.#slowIntervalMs = options.slowIntervalMs;
    this.#maxDeltaMs = options.maxDeltaMs ?? 100;
    this.#now = options.now ?? defaultNow;
    this.#scheduleFrame = options.scheduleFrame ?? defaultScheduleFrame;
    this.#cancelFrame = options.cancelFrame ?? defaultCancelFrame;
    this.#onLogicTick = options.onLogicTick;
    this.#onSlowTick = options.onSlowTick;
    this.#onFrame = options.onFrame;
    this.#onSpeedClamp = options.onSpeedClamp;
    this.#boundTick = (timestamp) => {
      this.#tick(timestamp);
    };
  }

  get running(): boolean {
    return this.#running;
  }

  start(): void {
    if (this.#running) {
      return;
    }
    this.#running = true;
    const now = this.#now();
    this.#lastTimestamp = now;
    this.#lastLogicTick = now;
    this.#lastSlowTick = now;
    this.#frameId = this.#scheduleFrame(this.#boundTick);
  }

  stop(): void {
    if (!this.#running) {
      return;
    }
    this.#running = false;
    if (this.#frameId !== null) {
      this.#cancelFrame(this.#frameId);
      this.#frameId = null;
    }
  }

  destroy(): void {
    this.stop();
  }

  /** Drive a single frame without scheduling the next (tests / catch-up). */
  step(timestamp: number): void {
    this.#process(timestamp);
  }

  #tick(timestamp: number): void {
    if (!this.#running) {
      return;
    }
    this.#process(timestamp);
    this.#frameId = this.#scheduleFrame(this.#boundTick);
  }

  #process(timestamp: number): void {
    let delta = timestamp - this.#lastTimestamp;
    this.#lastTimestamp = timestamp;

    if (delta > this.#maxDeltaMs) {
      delta = this.#maxDeltaMs;
      this.#onSpeedClamp?.();
    }

    this.#onFrame?.({ timestamp, deltaMs: delta });

    if (timestamp - this.#lastLogicTick >= this.#logicIntervalMs) {
      const logicDelta = timestamp - this.#lastLogicTick;
      this.#lastLogicTick = timestamp;
      this.#onLogicTick?.({
        timestamp,
        deltaMs: Math.min(logicDelta, this.#maxDeltaMs),
      });
    }

    if (timestamp - this.#lastSlowTick >= this.#slowIntervalMs) {
      const slowDelta = timestamp - this.#lastSlowTick;
      this.#lastSlowTick = timestamp;
      this.#onSlowTick?.({
        timestamp,
        deltaMs: Math.min(slowDelta, this.#maxDeltaMs * 5),
      });
    }
  }
}

export function createTicker(options: TickerOptions): Ticker {
  return new Ticker(options);
}
