export const AUTH_ERROR_CODES = [
  "missing_fields",
  "username_short",
  "username_invalid_chars",
  "username_taken",
  "username_blacklisted",
  "email_invalid",
  "email_taken",
  "password_short",
  "wrong_password",
  "user_not_found",
  "invalid_guest",
  "rate_limit",
  "server_error",
  "not_guest",
  "server_timeout",
] as const;

export type AuthErrorCode = (typeof AUTH_ERROR_CODES)[number];

export function authErrorKey(code: AuthErrorCode): `auth.error.${AuthErrorCode}` {
  return `auth.error.${code}`;
}

export function isAuthErrorCode(value: unknown): value is AuthErrorCode {
  return (
    typeof value === "string" &&
    (AUTH_ERROR_CODES as readonly string[]).includes(value)
  );
}

/** Accepts bare codes or v1-style `auth.error.*` keys. */
export function normalizeAuthErrorCode(value: unknown): AuthErrorCode | null {
  if (typeof value !== "string") {
    return null;
  }
  if (isAuthErrorCode(value)) {
    return value;
  }
  if (value.startsWith("auth.error.")) {
    const bare = value.slice("auth.error.".length);
    if (isAuthErrorCode(bare)) {
      return bare;
    }
  }
  return null;
}
