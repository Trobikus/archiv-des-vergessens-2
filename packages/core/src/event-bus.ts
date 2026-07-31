export type EventHandler<T = unknown> = (data: T) => void;
export type GlobalEventHandler = (event: string, data: unknown) => void;
export type SubscriptionId = number;

type Listener<T> = {
  readonly id: SubscriptionId;
  readonly callback: EventHandler<T>;
  readonly priority: number;
};

export type EventBusOptions = {
  readonly onError?: (error: unknown, event: string, subscriptionId: SubscriptionId) => void;
};

/**
 * Priority event bus with re-entrant publish queue (v1 semantics, typed).
 */
export class EventBus {
  readonly #listeners = new Map<string, Listener<unknown>[]>();
  readonly #globalListeners: Array<{
    id: SubscriptionId;
    callback: GlobalEventHandler;
  }> = [];
  readonly #subscriptionMap = new Map<SubscriptionId, string | null>();
  readonly #queue: Array<{ event: string; data: unknown }> = [];
  readonly #onError:
    | ((error: unknown, event: string, subscriptionId: SubscriptionId) => void)
    | undefined;
  #idCounter = 0;
  #destroyed = false;
  #publishing = false;

  constructor(options: EventBusOptions = {}) {
    this.#onError = options.onError;
  }

  subscribe<T = unknown>(
    event: string,
    callback: EventHandler<T>,
    priority = 0,
  ): SubscriptionId {
    if (this.#destroyed) {
      return -1;
    }
    const id = ++this.#idCounter;
    const list = this.#listeners.get(event) ?? [];
    list.push({
      id,
      callback: callback as EventHandler,
      priority,
    });
    list.sort((a, b) => b.priority - a.priority);
    this.#listeners.set(event, list);
    this.#subscriptionMap.set(id, event);
    return id;
  }

  subscribeAll(callback: GlobalEventHandler): SubscriptionId {
    if (this.#destroyed) {
      return -1;
    }
    const id = ++this.#idCounter;
    this.#globalListeners.push({ id, callback });
    this.#subscriptionMap.set(id, null);
    return id;
  }

  unsubscribe(subscriptionId: SubscriptionId): void {
    if (this.#destroyed || subscriptionId === -1) {
      return;
    }

    const event = this.#subscriptionMap.get(subscriptionId);
    if (event === undefined) {
      return;
    }

    if (event === null) {
      const index = this.#globalListeners.findIndex(
        (sub) => sub.id === subscriptionId,
      );
      if (index !== -1) {
        this.#globalListeners.splice(index, 1);
      }
      this.#subscriptionMap.delete(subscriptionId);
      return;
    }

    const subscribers = this.#listeners.get(event);
    if (subscribers) {
      const index = subscribers.findIndex((sub) => sub.id === subscriptionId);
      if (index !== -1) {
        subscribers.splice(index, 1);
        if (subscribers.length === 0) {
          this.#listeners.delete(event);
        }
      }
    }
    this.#subscriptionMap.delete(subscriptionId);
  }

  publish(event: string, data: unknown = {}): void {
    if (this.#destroyed) {
      return;
    }
    if (this.#publishing) {
      this.#queue.push({ event, data });
      return;
    }

    this.#publishing = true;
    try {
      this.#publishNow(event, data);
      let i = 0;
      while (i < this.#queue.length) {
        const next = this.#queue[i];
        i += 1;
        if (!next) {
          continue;
        }
        this.#publishNow(next.event, next.data);
      }
      this.#queue.length = 0;
    } finally {
      this.#publishing = false;
    }
  }

  publishSync(event: string, data: unknown = {}): void {
    if (this.#destroyed) {
      return;
    }
    this.#publishNow(event, data);
  }

  clear(): void {
    this.#listeners.clear();
    this.#globalListeners.length = 0;
    this.#subscriptionMap.clear();
    this.#queue.length = 0;
    this.#idCounter = 0;
  }

  destroy(): void {
    this.#destroyed = true;
    this.clear();
  }

  countListeners(event: string): number {
    return this.#listeners.get(event)?.length ?? 0;
  }

  getStats(): {
    eventCount: number;
    listenerCount: number;
    globalListenerCount: number;
    queueLength: number;
  } {
    let listenerCount = 0;
    for (const subs of this.#listeners.values()) {
      listenerCount += subs.length;
    }
    return {
      eventCount: this.#listeners.size,
      listenerCount,
      globalListenerCount: this.#globalListeners.length,
      queueLength: this.#queue.length,
    };
  }

  #publishNow(event: string, data: unknown): void {
    const subscribers = this.#listeners.get(event);
    if (subscribers && subscribers.length > 0) {
      for (const sub of [...subscribers]) {
        try {
          sub.callback(data);
        } catch (error) {
          this.#onError?.(error, event, sub.id);
        }
      }
    }

    if (this.#globalListeners.length > 0) {
      for (const sub of [...this.#globalListeners]) {
        try {
          sub.callback(event, data);
        } catch (error) {
          this.#onError?.(error, event, sub.id);
        }
      }
    }
  }
}

export function createEventBus(options?: EventBusOptions): EventBus {
  return new EventBus(options);
}
