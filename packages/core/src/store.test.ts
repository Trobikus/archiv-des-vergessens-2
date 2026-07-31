import { describe, expect, it, vi } from "vitest";

import { createStore } from "./store";

describe("Store", () => {
  it("updates immutably and notifies subscribers", () => {
    const store = createStore({ initialState: { n: 0 } });
    const listener = vi.fn();
    const unsub = store.subscribe(listener);
    store.setState((s) => ({ n: s.n + 1 }));
    expect(store.getState()).toEqual({ n: 1 });
    expect(listener).toHaveBeenCalledWith({ n: 1 });
    unsub();
    store.replace({ n: 9 });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("skips notify when state is unchanged", () => {
    const initial = { n: 1 };
    const store = createStore({ initialState: initial });
    const listener = vi.fn();
    store.subscribe(listener);
    store.setState((s) => s);
    expect(listener).not.toHaveBeenCalled();
  });

  it("rejects nested setState", () => {
    const store = createStore({ initialState: 0 });
    expect(() => {
      store.setState(() => {
        store.setState(() => 1);
        return 2;
      });
    }).toThrow(/nested setState/);
  });

  it("debounces notifications", () => {
    const handles: Array<() => void> = [];
    const store = createStore({
      initialState: 0,
      debounceMs: 16,
      schedule: (fn) => {
        handles.push(fn);
        return handles.length;
      },
      cancel: () => undefined,
    });
    const listener = vi.fn();
    store.subscribe(listener);
    store.setState(() => 1);
    store.setState(() => 2);
    expect(listener).not.toHaveBeenCalled();
    handles.at(-1)?.();
    expect(listener).toHaveBeenCalledWith(2);
    store.destroy();
  });
});
