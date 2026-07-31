import { describe, expect, it } from "vitest";

import { err, mapResult, ok } from "./result";

describe("Result", () => {
  it("creates ok and err", () => {
    expect(ok(1)).toEqual({ ok: true, value: 1 });
    expect(err("nope")).toEqual({ ok: false, error: "nope" });
  });

  it("maps ok values", () => {
    expect(mapResult(ok(2), (n) => n * 3)).toEqual({ ok: true, value: 6 });
  });

  it("passes err through mapResult", () => {
    expect(mapResult(err("x"), (n: number) => n + 1)).toEqual({
      ok: false,
      error: "x",
    });
  });
});
