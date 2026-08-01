import { describe, expect, it, vi } from "vitest";

import { createObjectPool } from "./object-pool";

describe("ObjectPool", () => {
  it("reuses released instances and resets them", () => {
    let created = 0;
    const reset = vi.fn((item: { n: number }) => {
      item.n = 0;
    });
    const pool = createObjectPool({
      create: () => {
        created += 1;
        return { n: created };
      },
      reset,
      initialSize: 2,
      maxSize: 4,
    });

    expect(pool.getStats()).toEqual({ total: 2, active: 0, available: 2 });
    const a = pool.acquire();
    const b = pool.acquire();
    expect(created).toBe(2);
    pool.release(a);
    expect(reset).toHaveBeenCalledWith(a);
    const c = pool.acquire();
    expect(c).toBe(a);
    expect(created).toBe(2);
    pool.release(b);
    pool.release(c);
    pool.destroy();
    expect(pool.destroyed).toBe(true);
    expect(pool.getStats().total).toBe(0);
  });

  it("disposes excess on release/trim and is leak-safe after destroy", () => {
    const disposed: number[] = [];
    let seq = 0;
    const pool = createObjectPool({
      create: () => {
        seq += 1;
        return seq;
      },
      dispose: (n) => {
        disposed.push(n);
      },
      maxSize: 2,
    });

    const a = pool.acquire();
    const b = pool.acquire();
    const c = pool.acquire();
    pool.release(a);
    pool.release(b);
    pool.release(c);
    expect(pool.getStats().total).toBeLessThanOrEqual(2);
    pool.trim();
    expect(pool.getStats().total).toBeLessThanOrEqual(2);

    pool.destroy();
    pool.destroy();
    const orphan = pool.acquire();
    pool.release(orphan);
    expect(disposed.length).toBeGreaterThan(0);
  });
});
