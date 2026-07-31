export type ServiceToken<T> = symbol & { readonly __brand?: T };

export function createToken<T>(description: string): ServiceToken<T> {
  return Symbol(description) as ServiceToken<T>;
}

export type Factory<T> = (container: Container) => T;

/**
 * Minimal DI container: factory registration, lazy singleton cache.
 */
export class Container {
  readonly #factories = new Map<symbol, Factory<unknown>>();
  readonly #instances = new Map<symbol, unknown>();

  register<T>(token: ServiceToken<T>, factory: Factory<T>): this {
    this.#factories.set(token, factory as Factory<unknown>);
    this.#instances.delete(token);
    return this;
  }

  has(token: ServiceToken<unknown>): boolean {
    return this.#factories.has(token);
  }

  get<T>(token: ServiceToken<T>): T {
    const cached = this.#instances.get(token);
    if (cached !== undefined) {
      return cached as T;
    }

    const factory = this.#factories.get(token);
    if (!factory) {
      const keys = [...this.#factories.keys()]
        .map((key) => key.description ?? String(key))
        .join(", ");
      throw new Error(
        `DI: service "${token.description ?? String(token)}" is not registered. Available: ${keys}`,
      );
    }

    const instance = factory(this) as T;
    this.#instances.set(token, instance);
    return instance;
  }

  invalidate(token: ServiceToken<unknown>): void {
    const instance = this.#instances.get(token);
    if (instance !== undefined && isDestroyable(instance)) {
      instance.destroy();
    }
    this.#instances.delete(token);
  }

  invalidateAll(): void {
    for (const instance of this.#instances.values()) {
      if (isDestroyable(instance)) {
        instance.destroy();
      }
    }
    this.#instances.clear();
  }

  clear(): void {
    this.invalidateAll();
    this.#factories.clear();
  }

  keys(): readonly string[] {
    return [...this.#factories.keys()].map(
      (key) => key.description ?? String(key),
    );
  }

  get size(): number {
    return this.#factories.size;
  }
}

export function createContainer(): Container {
  return new Container();
}

type Destroyable = { destroy: () => void };

function isDestroyable(value: unknown): value is Destroyable {
  return (
    typeof value === "object" &&
    value !== null &&
    "destroy" in value &&
    typeof (value as Destroyable).destroy === "function"
  );
}
