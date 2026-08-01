/** Exact v1 PBKDF2 parameters — must not drift. */
export const PBKDF2_ITERATIONS = 100_000;
export const PBKDF2_KEYLEN = 64;
export const PBKDF2_DIGEST = "sha512" as const;
export const MAX_PASSWORD_LENGTH = 128;

export const USERNAME_BLACKLIST = [
  "admin",
  "administrator",
  "system",
  "root",
  "moderator",
  "mod",
  "support",
  "help",
  "info",
  "test",
  "null",
  "undefined",
  "user",
  "guest",
  "bot",
  "server",
  "official",
  "archive",
  "vergessen",
] as const;

export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
export const RATE_LIMIT_MAX = 5;
export const MAX_RATE_LIMIT_ENTRIES = 10_000;

export const DEFAULT_AVATAR = "A";

export const USERS_SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE COLLATE NOCASE NOT NULL,
  email TEXT UNIQUE COLLATE NOCASE NOT NULL,
  passwordHash TEXT NOT NULL,
  salt TEXT NOT NULL,
  avatar TEXT,
  createdAt INTEGER,
  lastLogin INTEGER,
  sessionToken TEXT
);
`;

export const SAVES_SCHEMA = `
CREATE TABLE IF NOT EXISTS saves (
  userId TEXT PRIMARY KEY,
  username TEXT,
  saveData TEXT,
  version TEXT,
  timestamp INTEGER
);
`;
