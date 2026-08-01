import {
  MAX_RATE_LIMIT_ENTRIES,
  RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW_MS,
} from "../../db/schema";

export type RateLimitResult =
  | { readonly allowed: true }
  | { readonly allowed: false; readonly retryAfter: number };

type RateRecord = { count: number; resetTime: number };

export function createRateLimiter(
  nowFn: () => number = Date.now,
): {
  check(ip: string): RateLimitResult;
  clear(): void;
} {
  const map = new Map<string, RateRecord>();

  return {
    check(ip: string): RateLimitResult {
      const now = nowFn();
      let record = map.get(ip);

      if (record === undefined || now > record.resetTime) {
        if (record === undefined && map.size >= MAX_RATE_LIMIT_ENTRIES) {
          const oldestKey = map.keys().next().value;
          if (oldestKey !== undefined) {
            map.delete(oldestKey);
          }
        }
        record = { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };
        map.set(ip, record);
      }

      if (record.count >= RATE_LIMIT_MAX) {
        return {
          allowed: false,
          retryAfter: Math.ceil((record.resetTime - now) / 1000),
        };
      }

      record.count += 1;
      return { allowed: true };
    },
    clear() {
      map.clear();
    },
  };
}
