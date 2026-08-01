import { describe, expect, it } from "vitest";

import { shouldBlockBrowserShortcut } from "./desktop-lockdown";

const bodyTarget = { tagName: "DIV" } as unknown as EventTarget;
const inputTarget = { tagName: "INPUT" } as unknown as EventTarget;

describe("desktop lockdown", () => {
  it("blocks reload, zoom, and DevTools shortcuts", () => {
    expect(
      shouldBlockBrowserShortcut({
        key: "F5",
        ctrlKey: false,
        metaKey: false,
        altKey: false,
        shiftKey: false,
        target: bodyTarget,
      }),
    ).toBe(true);

    expect(
      shouldBlockBrowserShortcut({
        key: "r",
        ctrlKey: true,
        metaKey: false,
        altKey: false,
        shiftKey: false,
        target: bodyTarget,
      }),
    ).toBe(true);

    expect(
      shouldBlockBrowserShortcut({
        key: "=",
        ctrlKey: true,
        metaKey: false,
        altKey: false,
        shiftKey: false,
        target: bodyTarget,
      }),
    ).toBe(true);

    expect(
      shouldBlockBrowserShortcut({
        key: "F12",
        ctrlKey: false,
        metaKey: false,
        altKey: false,
        shiftKey: false,
        target: bodyTarget,
      }),
    ).toBe(true);
  });

  it("keeps Escape and editable Backspace usable", () => {
    expect(
      shouldBlockBrowserShortcut({
        key: "Escape",
        ctrlKey: false,
        metaKey: false,
        altKey: false,
        shiftKey: false,
        target: bodyTarget,
      }),
    ).toBe(false);

    expect(
      shouldBlockBrowserShortcut({
        key: "Backspace",
        ctrlKey: false,
        metaKey: false,
        altKey: false,
        shiftKey: false,
        target: inputTarget,
      }),
    ).toBe(false);

    expect(
      shouldBlockBrowserShortcut({
        key: "Backspace",
        ctrlKey: false,
        metaKey: false,
        altKey: false,
        shiftKey: false,
        target: bodyTarget,
      }),
    ).toBe(true);
  });
});
