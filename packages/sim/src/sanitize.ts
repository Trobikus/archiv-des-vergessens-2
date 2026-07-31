/** Number sanitizer (v1 `sanitizeNumber`) for pure sim formulas. */
export function sanitizeNumber(value: unknown, fallback = 0): number {
  const safeFallback = Number.isFinite(fallback) ? fallback : 0;
  if (value === null || value === undefined || typeof value === "boolean") {
    return safeFallback;
  }
  const num = Number(value);
  return Number.isFinite(num) ? num : safeFallback;
}
