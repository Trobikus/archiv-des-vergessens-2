import { afterEach, describe, expect, it, vi } from "vitest";

import { createDomPool } from "./dom-pool";

function installDomStub(): {
  body: {
    appendChild: (node: HTMLElement) => HTMLElement;
    children: HTMLElement[];
  };
  createElement: (tag: string) => HTMLElement;
} {
  const children: HTMLElement[] = [];
  const body = {
    children,
    appendChild(node: HTMLElement) {
      children.push(node);
      return node;
    },
  };

  const createElement = (tag: string): HTMLElement => {
    const el = {
      tagName: tag.toUpperCase(),
      className: "",
      textContent: "",
      style: {
        display: "",
        transform: "",
        opacity: "",
        left: "",
        top: "",
        pointerEvents: "",
      },
      dataset: {} as Record<string, string>,
      remove: vi.fn(() => {
        const idx = children.indexOf(el as unknown as HTMLElement);
        if (idx >= 0) {
          children.splice(idx, 1);
        }
      }),
    };
    return el as unknown as HTMLElement;
  };

  vi.stubGlobal("document", { body, createElement });
  return { body, createElement };
}

describe("DomPool", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reuses nodes and removes them on destroy (no leak)", () => {
    const { body } = installDomStub();
    const pool = createDomPool({
      create: () => document.createElement("span"),
      parent: body as unknown as ParentNode,
      baseClass: "floater",
      initialSize: 2,
      maxSize: 4,
    });

    expect(body.children).toHaveLength(2);
    const a = pool.get();
    a.textContent = "12";
    a.className = "floater floater--crit";
    pool.release(a);
    expect(a.style.display).toBe("none");
    expect(a.textContent).toBe("");
    expect(a.className).toBe("floater");

    const b = pool.get();
    expect(b).toBe(a);

    pool.destroy();
    expect(pool.destroyed).toBe(true);
    expect(body.children).toHaveLength(0);
    expect(pool.getStats().total).toBe(0);
  });
});
