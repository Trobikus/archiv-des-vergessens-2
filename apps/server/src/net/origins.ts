export function isOriginAllowed(
  origin: string | undefined,
  allowedOrigins: readonly string[],
): boolean {
  if (origin === undefined || origin.length === 0) {
    return true;
  }
  return allowedOrigins.includes(origin);
}

export function resolveClientIp(
  headers: Record<string, string | string[] | undefined>,
  remoteAddress: string | undefined,
  trustProxy: boolean,
): string {
  if (trustProxy) {
    const forwarded = headers["x-forwarded-for"];
    if (typeof forwarded === "string" && forwarded.length > 0) {
      const first = forwarded.split(",")[0]?.trim();
      if (first !== undefined && first.length > 0) {
        return first;
      }
    }
    const realIp = headers["x-real-ip"];
    if (typeof realIp === "string" && realIp.length > 0) {
      return realIp;
    }
  }
  return remoteAddress ?? "unknown";
}
