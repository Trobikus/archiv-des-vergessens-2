import {
  PERFORMANCE_BUDGETS,
  createObjectPool,
  type ObjectPool,
} from "@adv/core";

export type DomPoolOptions = {
  readonly create: () => HTMLElement;
  readonly parent?: ParentNode;
  readonly initialSize?: number;
  readonly maxSize?: number;
  readonly baseClass?: string;
};

/**
 * DOM element pool (v1 `js/core/pool.js` parity). Hides/resets nodes on release;
 * `destroy()` removes every node and clears the free list (leak-safe).
 */
export class DomPool {
  readonly #pool: ObjectPool<HTMLElement>;
  readonly #parent: ParentNode;
  readonly #baseClass: string;
  #destroyed = false;

  constructor(options: DomPoolOptions) {
    this.#parent = options.parent ?? document.body;
    this.#baseClass = options.baseClass ?? "";
    const maxSize = options.maxSize ?? PERFORMANCE_BUDGETS.maxPoolSize;

    this.#pool = createObjectPool<HTMLElement>({
      create: () => {
        const el = options.create();
        if (this.#baseClass) {
          el.dataset["baseClass"] = this.#baseClass;
          el.className = this.#baseClass;
        }
        el.style.display = "none";
        el.style.pointerEvents = "none";
        this.#parent.appendChild(el);
        return el;
      },
      reset: (el: HTMLElement) => {
        el.style.display = "none";
        el.style.transform = "";
        el.style.opacity = "";
        el.style.left = "";
        el.style.top = "";
        el.style.pointerEvents = "none";
        el.textContent = "";
        el.className = el.dataset["baseClass"] || this.#baseClass;
      },
      dispose: (el: HTMLElement) => {
        el.remove();
      },
      initialSize: options.initialSize ?? 0,
      maxSize,
    });
  }

  get destroyed(): boolean {
    return this.#destroyed;
  }

  getStats(): { total: number; active: number; available: number } {
    return this.#pool.getStats();
  }

  get(): HTMLElement {
    if (this.#destroyed) {
      const el = document.createElement("span");
      el.style.pointerEvents = "none";
      return el;
    }
    const el = this.#pool.acquire();
    el.style.display = "";
    el.style.pointerEvents = "none";
    return el;
  }

  release(el: HTMLElement): void {
    if (this.#destroyed) {
      return;
    }
    this.#pool.release(el);
  }

  destroy(): void {
    if (this.#destroyed) {
      return;
    }
    this.#destroyed = true;
    this.#pool.destroy();
  }
}

export function createDomPool(options: DomPoolOptions): DomPool {
  return new DomPool(options);
}
