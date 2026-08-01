import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { loadConfig } from "./config";
import { createRateLimiter } from "./modules/auth/rate-limit";
import { isOriginAllowed, resolveClientIp } from "./net/origins";

describe("rate limiter", () => {
  it("allows up to max then blocks until window resets", () => {
    let now = 1_000;
    const limiter = createRateLimiter(() => now);
    for (let i = 0; i < 5; i += 1) {
      expect(limiter.check("1.1.1.1").allowed).toBe(true);
    }
    const blocked = limiter.check("1.1.1.1");
    expect(blocked.allowed).toBe(false);
    if (!blocked.allowed) {
      expect(blocked.retryAfter).toBeGreaterThan(0);
    }
    now += 16 * 60 * 1000;
    expect(limiter.check("1.1.1.1").allowed).toBe(true);
    limiter.clear();
  });
});

describe("origins helpers", () => {
  it("allows missing origins and listed ones", () => {
    expect(isOriginAllowed(undefined, ["http://localhost:5173"])).toBe(true);
    expect(isOriginAllowed("", ["http://localhost:5173"])).toBe(true);
    expect(
      isOriginAllowed("http://localhost:5173", ["http://localhost:5173"]),
    ).toBe(true);
    expect(isOriginAllowed("http://evil.test", ["http://localhost:5173"])).toBe(
      false,
    );
  });

  it("resolves client ip with and without proxy trust", () => {
    expect(
      resolveClientIp(
        { "x-forwarded-for": "9.9.9.9, 8.8.8.8" },
        "1.2.3.4",
        true,
      ),
    ).toBe("9.9.9.9");
    expect(
      resolveClientIp({ "x-real-ip": "7.7.7.7" }, "1.2.3.4", true),
    ).toBe("7.7.7.7");
    expect(
      resolveClientIp(
        { "x-forwarded-for": "9.9.9.9" },
        "1.2.3.4",
        false,
      ),
    ).toBe("1.2.3.4");
    expect(resolveClientIp({}, undefined, false)).toBe("unknown");
    expect(
      resolveClientIp({ "x-forwarded-for": "" }, "1.2.3.4", true),
    ).toBe("1.2.3.4");
  });
});

describe("config", () => {
  it("parses env overrides", () => {
    const dir = mkdtempSync(join(tmpdir(), "adv2-cfg-"));
    const cfg = loadConfig({
      PORT: "9090",
      DATA_DIR: dir,
      ALLOWED_ORIGINS: "http://a.test,http://b.test",
      TRUST_PROXY: "true",
      CLOUD_SAVE_VERSION: "2.0.0-test",
    });
    expect(cfg.port).toBe(9090);
    expect(cfg.allowedOrigins).toEqual(["http://a.test", "http://b.test"]);
    expect(cfg.trustProxy).toBe(true);
    expect(cfg.cloudVersion).toBe("2.0.0-test");
    rmSync(dir, { recursive: true, force: true });
  });
});
