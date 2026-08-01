import { afterEach, describe, expect, it, vi } from "vitest";

import { checkForDesktopUpdate, openReleasePage } from "./updater-service";

describe("updater-service", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns unsupported without Tauri updater", async () => {
    vi.stubGlobal("window", {});
    await expect(checkForDesktopUpdate()).resolves.toEqual({
      status: "unsupported",
    });
  });

  it("reports available updates from Tauri", async () => {
    vi.stubGlobal("window", {
      __TAURI__: {
        updater: {
          check: () =>
            Promise.resolve({ available: true, version: "2.0.1" }),
        },
      },
    });
    await expect(checkForDesktopUpdate()).resolves.toEqual({
      status: "available",
      version: "2.0.1",
    });
  });

  it("invokes open_release_page on desktop", async () => {
    const invoke = vi.fn(() => Promise.resolve("ok"));
    vi.stubGlobal("window", {
      __TAURI__: { core: { invoke } },
      open: vi.fn(),
    });
    await openReleasePage(
      "https://github.com/Trobikus/archiv-des-vergessens-2/releases/latest",
    );
    expect(invoke).toHaveBeenCalledWith("open_release_page", {
      url: "https://github.com/Trobikus/archiv-des-vergessens-2/releases/latest",
    });
  });
});
