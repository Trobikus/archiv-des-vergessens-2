export function sanitizeClientText(
  value: unknown,
  maxLength: number,
  fallback = "",
): string {
  if (typeof value !== "string") {
    return fallback;
  }
  const trimmed = value.trim().replace(/[<>]/g, "");
  if (trimmed.length === 0) {
    return fallback;
  }
  return trimmed.slice(0, maxLength);
}
