import { pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";

import {
  MAX_PASSWORD_LENGTH,
  PBKDF2_DIGEST,
  PBKDF2_ITERATIONS,
  PBKDF2_KEYLEN,
} from "../db/schema";

export function generateSalt(): string {
  return randomBytes(16).toString("hex");
}

export function hashPassword(password: string, salt: string): string {
  const safePassword = password.substring(0, MAX_PASSWORD_LENGTH);
  return pbkdf2Sync(
    safePassword,
    salt,
    PBKDF2_ITERATIONS,
    PBKDF2_KEYLEN,
    PBKDF2_DIGEST,
  ).toString("hex");
}

export function verifyPassword(
  password: string,
  salt: string,
  storedHash: string,
): boolean {
  if (
    typeof password !== "string" ||
    typeof salt !== "string" ||
    typeof storedHash !== "string"
  ) {
    return false;
  }
  const computedHash = hashPassword(password, salt);
  const bufA = Buffer.from(computedHash, "hex");
  const bufB = Buffer.from(storedHash, "hex");
  if (bufA.length !== bufB.length || bufA.length === 0) {
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

export function generateToken(): string {
  return `tok_${randomBytes(24).toString("hex")}`;
}

export function generateUserId(): string {
  return `usr_${Date.now().toString(36)}_${randomBytes(4).toString("hex")}`;
}
