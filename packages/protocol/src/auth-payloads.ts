import type { ValidationResult } from "./save-envelope";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readOptionalString(
  record: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = record[key];
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== "string") {
    return undefined;
  }
  return value;
}

function requireString(
  record: Record<string, unknown>,
  key: string,
): string | null {
  const value = record[key];
  if (typeof value !== "string") {
    return null;
  }
  return value;
}

export type AuthUser = {
  readonly id: string;
  readonly username: string;
  readonly email: string | null;
  readonly avatar: string;
  readonly createdAt: number;
  readonly lastLogin: number;
  readonly isGuest: boolean;
};

export type GuestAuthPayload = {
  readonly userId: string;
  readonly username: string;
};

export type AuthRegisterPayload = {
  readonly username: string;
  readonly email: string;
  readonly password: string;
  readonly avatar?: string;
};

export type AuthLoginPayload = {
  readonly usernameOrEmail: string;
  readonly password: string;
};

export type AuthVerifyTokenPayload = {
  readonly userId: string;
  readonly token: string;
};

export type AuthConvertGuestPayload = {
  readonly guestId: string;
  readonly username: string;
  readonly email: string;
  readonly password: string;
  readonly avatar?: string;
};

export type AuthSessionSuccessPayload = {
  readonly user: AuthUser;
  readonly token: string;
};

export type AuthConvertGuestSuccessPayload = AuthSessionSuccessPayload & {
  readonly migrated: {
    readonly save: boolean;
    readonly leaderboard: boolean;
  };
};

export type AuthErrorPayload = {
  readonly error: string;
  readonly message?: string;
  readonly retryAfter?: number;
};

function validateAuthUser(value: unknown): ValidationResult<AuthUser> {
  if (!isRecord(value)) {
    return { ok: false, error: "user must be an object" };
  }
  const id = requireString(value, "id");
  const username = requireString(value, "username");
  if (id === null || username === null) {
    return { ok: false, error: "user.id and user.username required" };
  }
  const emailRaw = value["email"];
  const email =
    emailRaw === null || emailRaw === undefined
      ? null
      : typeof emailRaw === "string"
        ? emailRaw
        : null;
  if (emailRaw !== null && emailRaw !== undefined && email === null) {
    return { ok: false, error: "user.email must be string or null" };
  }
  const avatar = requireString(value, "avatar") ?? "";
  const createdAt = value["createdAt"];
  const lastLogin = value["lastLogin"];
  if (typeof createdAt !== "number" || !Number.isFinite(createdAt)) {
    return { ok: false, error: "user.createdAt must be a finite number" };
  }
  if (typeof lastLogin !== "number" || !Number.isFinite(lastLogin)) {
    return { ok: false, error: "user.lastLogin must be a finite number" };
  }
  const isGuest = value["isGuest"] === true;
  return {
    ok: true,
    value: { id, username, email, avatar, createdAt, lastLogin, isGuest },
  };
}

export function validateGuestAuthPayload(
  value: unknown,
): ValidationResult<GuestAuthPayload> {
  if (!isRecord(value)) {
    return { ok: false, error: "payload must be an object" };
  }
  const userId = requireString(value, "userId");
  if (userId === null || userId.length === 0) {
    return { ok: false, error: "userId is required" };
  }
  const username = requireString(value, "username") ?? "Gast";
  return { ok: true, value: { userId, username } };
}

export function validateAuthRegisterPayload(
  value: unknown,
): ValidationResult<AuthRegisterPayload> {
  if (!isRecord(value)) {
    return { ok: false, error: "payload must be an object" };
  }
  const username = requireString(value, "username");
  const email = requireString(value, "email");
  const password = requireString(value, "password");
  if (username === null || email === null || password === null) {
    return { ok: false, error: "username, email, and password are required" };
  }
  const avatar = readOptionalString(value, "avatar");
  if (avatar !== undefined) {
    return { ok: true, value: { username, email, password, avatar } };
  }
  return { ok: true, value: { username, email, password } };
}

export function validateAuthLoginPayload(
  value: unknown,
): ValidationResult<AuthLoginPayload> {
  if (!isRecord(value)) {
    return { ok: false, error: "payload must be an object" };
  }
  const usernameOrEmail = requireString(value, "usernameOrEmail");
  const password = requireString(value, "password");
  if (usernameOrEmail === null || password === null) {
    return { ok: false, error: "usernameOrEmail and password are required" };
  }
  return { ok: true, value: { usernameOrEmail, password } };
}

export function validateAuthVerifyTokenPayload(
  value: unknown,
): ValidationResult<AuthVerifyTokenPayload> {
  if (!isRecord(value)) {
    return { ok: false, error: "payload must be an object" };
  }
  const userId = requireString(value, "userId");
  const token = requireString(value, "token");
  if (userId === null || token === null) {
    return { ok: false, error: "userId and token are required" };
  }
  return { ok: true, value: { userId, token } };
}

export function validateAuthConvertGuestPayload(
  value: unknown,
): ValidationResult<AuthConvertGuestPayload> {
  if (!isRecord(value)) {
    return { ok: false, error: "payload must be an object" };
  }
  const guestId = requireString(value, "guestId");
  const username = requireString(value, "username");
  const email = requireString(value, "email");
  const password = requireString(value, "password");
  if (
    guestId === null ||
    username === null ||
    email === null ||
    password === null
  ) {
    return {
      ok: false,
      error: "guestId, username, email, and password are required",
    };
  }
  const avatar = readOptionalString(value, "avatar");
  if (avatar !== undefined) {
    return {
      ok: true,
      value: { guestId, username, email, password, avatar },
    };
  }
  return { ok: true, value: { guestId, username, email, password } };
}

export function validateAuthSessionSuccessPayload(
  value: unknown,
): ValidationResult<AuthSessionSuccessPayload> {
  if (!isRecord(value)) {
    return { ok: false, error: "payload must be an object" };
  }
  const user = validateAuthUser(value["user"]);
  if (!user.ok) {
    return user;
  }
  const token = requireString(value, "token");
  if (token === null || token.length === 0) {
    return { ok: false, error: "token is required" };
  }
  return { ok: true, value: { user: user.value, token } };
}

export function validateAuthConvertGuestSuccessPayload(
  value: unknown,
): ValidationResult<AuthConvertGuestSuccessPayload> {
  const base = validateAuthSessionSuccessPayload(value);
  if (!base.ok) {
    return base;
  }
  if (!isRecord(value)) {
    return { ok: false, error: "payload must be an object" };
  }
  const migratedRaw = value["migrated"];
  if (!isRecord(migratedRaw)) {
    return { ok: false, error: "migrated must be an object" };
  }
  return {
    ok: true,
    value: {
      ...base.value,
      migrated: {
        save: migratedRaw["save"] === true,
        leaderboard: migratedRaw["leaderboard"] === true,
      },
    },
  };
}

export function validateAuthErrorPayload(
  value: unknown,
): ValidationResult<AuthErrorPayload> {
  if (!isRecord(value)) {
    return { ok: false, error: "payload must be an object" };
  }
  const error = value["error"];
  if (typeof error !== "string" || error.length === 0) {
    return { ok: false, error: "error is required" };
  }
  const message = readOptionalString(value, "message");
  const retryAfterRaw = value["retryAfter"];
  const result: AuthErrorPayload = { error };
  if (message !== undefined) {
    (result as { message?: string }).message = message;
  }
  if (typeof retryAfterRaw === "number" && Number.isFinite(retryAfterRaw)) {
    (result as { retryAfter?: number }).retryAfter = retryAfterRaw;
  }
  return { ok: true, value: result };
}
