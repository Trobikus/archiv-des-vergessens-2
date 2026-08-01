import { PERFORMANCE_BUDGETS } from "./performance-budget";

export type ObjectPoolOptions<T> = {
  readonly create: () => T;
  readonly reset?: (item: T) => void;
  readonly dispose?: (item: T) => void;
  readonly initialSize?: number;
  readonly maxSize?: number;
};

/**
 * Generic acquire/release pool. Prefer this over allocating in hot loops.
 * For DOM nodes use the client `DomPool` wrapper.
 */
export class ObjectPool<T> {
  readonly #create: () => T;
  readonly #reset: ((item: T) => void) | undefined;
  readonly #dispose: ((item: T) => void) | undefined;
  readonly #maxSize: number;
  readonly #free: T[] = [];
  readonly #active = new Set<T>();
  #destroyed = false;

  constructor(options: ObjectPoolOptions<T>) {
    this.#create = options.create;
    this.#reset = options.reset;
    this.#dispose = options.dispose;
    this.#maxSize = options.maxSize ?? PERFORMANCE_BUDGETS.maxPoolSize;
    const initial = options.initialSize ?? 0;
    for (let i = 0; i < initial; i += 1) {
      this.#free.push(this.#create());
    }
  }

  get destroyed(): boolean {
    return this.#destroyed;
  }

  getStats(): { total: number; active: number; available: number } {
    return {
      total: this.#free.length + this.#active.size,
      active: this.#active.size,
      available: this.#free.length,
    };
  }

  acquire(): T {
    if (this.#destroyed) {
      return this.#create();
    }
    const item = this.#free.pop() ?? this.#create();
    this.#active.add(item);
    return item;
  }

  release(item: T): void {
    if (this.#destroyed || !this.#active.delete(item)) {
      return;
    }
    this.#reset?.(item);
    if (this.#free.length + this.#active.size >= this.#maxSize) {
      this.#dispose?.(item);
      return;
    }
    this.#free.push(item);
  }

  /** Shrink free list toward `maxSize` and dispose excess. */
  trim(): void {
    if (this.#destroyed) {
      return;
    }
    const total = this.#free.length + this.#active.size;
    if (total <= this.#maxSize || this.#free.length === 0) {
      return;
    }
    const excess = Math.min(total - this.#maxSize, this.#free.length);
    const removed = this.#free.splice(0, excess);
    for (const item of removed) {
      this.#dispose?.(item);
    }
  }

  destroy(): void {
    if (this.#destroyed) {
      return;
    }
    this.#destroyed = true;
    for (const item of this.#free) {
      this.#dispose?.(item);
    }
    for (const item of this.#active) {
      this.#dispose?.(item);
    }
    this.#free.length = 0;
    this.#active.clear();
  }
}

export function createObjectPool<T>(
  options: ObjectPoolOptions<T>,
): ObjectPool<T> {
  return new ObjectPool(options);
}
