/** Long-session performance budgets (ported from v1 skill rules). */
export const PERFORMANCE_BUDGETS = {
  /** Hard cap for UI lists (chat, logs, inventory views). */
  maxDomListItems: 50,
  /** Floating combat numbers on screen. */
  maxFloatingTexts: 12,
  /** Combat log FIFO. */
  maxCombatLog: 25,
  /** Chat history FIFO (service-level). */
  maxChatMessages: 100,
  /** Frame longer than this counts toward degradation. */
  frameBudgetMs: 32,
  /** Consecutive slow frames before visual degradation. */
  frameBudgetStreak: 5,
  /** Good frames required before leaving degradation. */
  frameRecoverStreak: 30,
  /** Max pooled DOM/object instances. */
  maxPoolSize: 50,
} as const;

export type PerformanceBudgets = typeof PERFORMANCE_BUDGETS;

export type FrameBudgetOptions = {
  readonly budgetMs?: number;
  readonly degradeStreak?: number;
  readonly recoverStreak?: number;
  readonly onDegrade?: () => void;
  readonly onRecover?: () => void;
};

/**
 * Samples frame deltas and toggles visual degradation when the budget is breached.
 * Call from the central ticker `onFrame` — never from a UI `setInterval`.
 */
export class FrameBudgetMonitor {
  readonly #budgetMs: number;
  readonly #degradeStreak: number;
  readonly #recoverStreak: number;
  readonly #onDegrade: (() => void) | undefined;
  readonly #onRecover: (() => void) | undefined;

  #slowStreak = 0;
  #goodStreak = 0;
  #degraded = false;

  constructor(options: FrameBudgetOptions = {}) {
    this.#budgetMs = options.budgetMs ?? PERFORMANCE_BUDGETS.frameBudgetMs;
    this.#degradeStreak =
      options.degradeStreak ?? PERFORMANCE_BUDGETS.frameBudgetStreak;
    this.#recoverStreak =
      options.recoverStreak ?? PERFORMANCE_BUDGETS.frameRecoverStreak;
    this.#onDegrade = options.onDegrade;
    this.#onRecover = options.onRecover;
  }

  get degraded(): boolean {
    return this.#degraded;
  }

  sample(deltaMs: number): boolean {
    if (deltaMs > this.#budgetMs) {
      this.#slowStreak += 1;
      this.#goodStreak = 0;
      if (!this.#degraded && this.#slowStreak >= this.#degradeStreak) {
        this.#degraded = true;
        this.#onDegrade?.();
      }
    } else {
      this.#slowStreak = 0;
      if (this.#degraded) {
        this.#goodStreak += 1;
        if (this.#goodStreak >= this.#recoverStreak) {
          this.#degraded = false;
          this.#goodStreak = 0;
          this.#onRecover?.();
        }
      }
    }
    return this.#degraded;
  }

  reset(): void {
    this.#slowStreak = 0;
    this.#goodStreak = 0;
    this.#degraded = false;
  }
}

export function createFrameBudgetMonitor(
  options?: FrameBudgetOptions,
): FrameBudgetMonitor {
  return new FrameBudgetMonitor(options);
}

/** FIFO trim helper for UI/event lists. */
export function trimToBudget<T>(
  items: readonly T[],
  max: number = PERFORMANCE_BUDGETS.maxDomListItems,
): T[] {
  if (items.length <= max) {
    return [...items];
  }
  return items.slice(items.length - max);
}
