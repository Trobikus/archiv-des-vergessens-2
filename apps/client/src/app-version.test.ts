import { describe, expect, it } from "vitest";

import { formatVersionLabel, getAppVersion } from "./app-version";

describe("app-version", () => {
  it("exposes a non-empty build version from package.json", () => {
    expect(getAppVersion().length).toBeGreaterThan(0);
    expect(getAppVersion()).not.toBe("0.0.0-dev");
  });

  it("formats i18n version templates", () => {
    expect(formatVersionLabel("Version {version}")).toBe(
      `Version ${getAppVersion()}`,
    );
  });
});
