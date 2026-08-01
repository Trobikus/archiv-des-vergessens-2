import { pathToFileURL } from "node:url";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { loadConfig } from "./config";
import { bootBanner, createGameServer, isExecutedDirectly } from "./main";

describe("server boot", () => {
  const dirs: string[] = [];

  afterEach(() => {
    for (const dir of dirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("reports boot status with schema version", () => {
    expect(bootBanner()).toContain("Boot OK");
    expect(bootBanner()).toContain("v1");
  });

  it("opens sqlite and listens", async () => {
    const dir = mkdtempSync(join(tmpdir(), "adv2-boot-"));
    dirs.push(dir);
    const server = createGameServer(
      loadConfig({ PORT: "0", DATA_DIR: dir }),
    );
    await new Promise<void>((resolve) => {
      server.httpServer.listen(0, () => {
        resolve();
      });
    });
    expect(server.db.open).toBe(true);
    await server.close();
  });

  it("detects direct execution vs import", () => {
    expect(isExecutedDirectly(undefined)).toBe(false);
    expect(isExecutedDirectly("/tmp/other.mjs", "file:///tmp/main.mjs")).toBe(
      false,
    );
    const entry = "/tmp/main.mjs";
    expect(isExecutedDirectly(entry, pathToFileURL(entry).href)).toBe(true);
  });
});
