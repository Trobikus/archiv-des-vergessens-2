import { describe, expect, it, vi } from "vitest";

import { createLogger } from "./logger";

describe("createLogger", () => {
  it("prefixes messages with scope", () => {
    const sink = vi.fn();
    const log = createLogger("boot", sink);
    log.info("ready", { ok: true });
    expect(sink).toHaveBeenCalledWith("info", "[boot] ready", { ok: true });
  });

  it("routes warn/error to console by default", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const log = createLogger("boot");
    log.warn("w");
    log.error("e");
    expect(warn).toHaveBeenCalled();
    expect(error).toHaveBeenCalled();
    warn.mockRestore();
    error.mockRestore();
  });
});
