export type StoreListener<T> = (state: T) => void;
export type StoreUpdater<T> = (prev: T) => T;

export type StoreOptions<T> = {
  readonly initialState: T;
  /** Debounce subscriber notifications (ms). 0 = sync. */
  readonly debounceMs?: number;
  readonly schedule?: (fn: () => void, ms: number) => unknown;
  readonly cancel?: (handle: unknown) => void;
};

/**
 * Immutable state store with optional debounced notifications.
 */
export class Store<T> {
  #state: T;
  readonly #listeners = new Map<number, StoreListener<T>>();
  #nextId = 0;
  readonly #debounceMs: number;
  readonly #schedule: (fn: () => void, ms: number) => unknown;
  readonly #cancel: (handle: unknown) => void;
  #timer: unknown = null;
  #dispatching = false;

  constructor(options: StoreOptions<T>) {
    this.#state = options.initialState;
    this.#debounceMs = options.debounceMs ?? 0;
    this.#schedule =
      options.schedule ??
      ((fn, ms) => {
        return setTimeout(fn, ms);
      });
    this.#cancel =
      options.cancel ??
      ((handle) => {
        clearTimeout(handle as ReturnType<typeof setTimeout>);
      });
  }

  getState(): T {
    return this.#state;
  }

  setState(updater: StoreUpdater<T>): T {
    if (this.#dispatching) {
      throw new Error("Store: nested setState is not allowed");
    }
    this.#dispatching = true;
    try {
      const next = updater(this.#state);
      if (Object.is(next, this.#state)) {
        return this.#state;
      }
      this.#state = next;
      this.#notify();
      return this.#state;
    } finally {
      this.#dispatching = false;
    }
  }

  replace(state: T): T {
    return this.setState(() => state);
  }

  subscribe(listener: StoreListener<T>): () => void {
    const id = ++this.#nextId;
    this.#listeners.set(id, listener);
    return () => {
      this.#listeners.delete(id);
    };
  }

  destroy(): void {
    if (this.#timer !== null) {
      this.#cancel(this.#timer);
      this.#timer = null;
    }
    this.#listeners.clear();
  }

  #notify(): void {
    if (this.#debounceMs <= 0) {
      this.#flush();
      return;
    }
    if (this.#timer !== null) {
      this.#cancel(this.#timer);
    }
    this.#timer = this.#schedule(() => {
      this.#timer = null;
      this.#flush();
    }, this.#debounceMs);
  }

  #flush(): void {
    const snapshot = this.#state;
    for (const listener of this.#listeners.values()) {
      listener(snapshot);
    }
  }
}

export function createStore<T>(options: StoreOptions<T>): Store<T> {
  return new Store(options);
}
