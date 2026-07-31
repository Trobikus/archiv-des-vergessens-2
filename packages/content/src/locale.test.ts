import { describe, expect, it } from "vitest";

import { bootLabel, isLocale } from "./locale";

describe("locale", () => {
  it("returns boot labels", () => {
    expect(bootLabel("de")).toBe("Boot OK");
    expect(bootLabel("en")).toBe("Boot OK");
  });

  it("narrows locale strings", () => {
    expect(isLocale("de")).toBe(true);
    expect(isLocale("fr")).toBe(false);
  });
});
