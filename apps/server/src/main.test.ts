import { describe, expect, it } from "vitest";

import { bootBanner } from "./main";

describe("server boot", () => {
  it("reports boot status with schema version", () => {
    expect(bootBanner()).toContain("Boot OK");
    expect(bootBanner()).toContain("v1");
  });
});
