import { describe, expect, it, vi } from "vitest";

import { Container, createContainer, createToken } from "./di";

describe("Container", () => {
  it("resolves singleton factories", () => {
    const container = createContainer();
    const token = createToken<{ n: number }>("counter");
    let builds = 0;
    container.register(token, () => {
      builds += 1;
      return { n: builds };
    });
    expect(container.get(token)).toEqual({ n: 1 });
    expect(container.get(token)).toEqual({ n: 1 });
    expect(builds).toBe(1);
  });

  it("supports dependent resolution", () => {
    const container = createContainer();
    const a = createToken<string>("a");
    const b = createToken<string>("b");
    container.register(a, () => "A");
    container.register(b, (c) => `${c.get(a)}-B`);
    expect(container.get(b)).toBe("A-B");
  });

  it("throws for missing services", () => {
    const container = new Container();
    const token = createToken<number>("missing");
    expect(() => container.get(token)).toThrow(/not registered/);
  });

  it("invalidates and destroys cached instances", () => {
    const container = createContainer();
    const token = createToken<{ destroy: () => void }>("svc");
    const destroy = vi.fn();
    container.register(token, () => ({ destroy }));
    container.get(token);
    container.invalidate(token);
    expect(destroy).toHaveBeenCalledOnce();
    expect(container.has(token)).toBe(true);
    container.clear();
    expect(container.size).toBe(0);
    expect(container.keys()).toEqual([]);
  });

  it("re-register clears cached instance", () => {
    const container = createContainer();
    const token = createToken<number>("n");
    container.register(token, () => 1);
    expect(container.get(token)).toBe(1);
    container.register(token, () => 2);
    expect(container.get(token)).toBe(2);
  });
});
