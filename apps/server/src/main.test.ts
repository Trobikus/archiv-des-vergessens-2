import { pathToFileURL } from "node:url";

import { describe, expect, it } from "vitest";

import { bootBanner, isExecutedDirectly, main } from "./main";

describe("server boot", () => {
  it("reports boot status with schema version", () => {
    expect(bootBanner()).toContain("Boot OK");
    expect(bootBanner()).toContain("v1");
  });

  it("main logs without throwing", () => {
    expect(() => {
      main();
    }).not.toThrow();
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
