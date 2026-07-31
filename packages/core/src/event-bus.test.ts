import { describe, expect, it, vi } from "vitest";

import { createEventBus } from "./event-bus";

describe("EventBus", () => {
  it("delivers by priority and unsubscribes", () => {
    const bus = createEventBus();
    const order: number[] = [];
    const low = bus.subscribe("e", () => {
      order.push(1);
    }, 0);
    bus.subscribe("e", () => {
      order.push(2);
    }, 10);
    bus.publish("e");
    expect(order).toEqual([2, 1]);
    bus.unsubscribe(low);
    order.length = 0;
    bus.publish("e");
    expect(order).toEqual([2]);
  });

  it("queues nested publishes", () => {
    const bus = createEventBus();
    const seen: string[] = [];
    bus.subscribe("a", () => {
      seen.push("a");
      bus.publish("b", { x: 1 });
    });
    bus.subscribe("b", () => {
      seen.push("b");
    });
    bus.publish("a");
    expect(seen).toEqual(["a", "b"]);
  });

  it("notifies global listeners and reports stats", () => {
    const bus = createEventBus();
    const global = vi.fn();
    const id = bus.subscribeAll(global);
    bus.publishSync("ping", { ok: true });
    expect(global).toHaveBeenCalledWith("ping", { ok: true });
    expect(bus.countListeners("ping")).toBe(0);
    bus.subscribe("ping", () => undefined);
    expect(bus.getStats().listenerCount).toBe(1);
    bus.unsubscribe(id);
    bus.clear();
    expect(bus.getStats().eventCount).toBe(0);
  });

  it("routes handler errors to onError and ignores after destroy", () => {
    const onError = vi.fn();
    const bus = createEventBus({ onError });
    bus.subscribe("boom", () => {
      throw new Error("x");
    });
    bus.subscribeAll(() => {
      throw new Error("g");
    });
    bus.publish("boom");
    expect(onError).toHaveBeenCalledTimes(2);
    bus.destroy();
    expect(bus.subscribe("boom", () => undefined)).toBe(-1);
    expect(bus.subscribeAll(() => undefined)).toBe(-1);
    bus.publish("boom");
    bus.publishSync("boom");
    bus.unsubscribe(1);
  });
});
