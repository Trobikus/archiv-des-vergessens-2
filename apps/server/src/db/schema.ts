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

export const LEADERBOARD_SCHEMA = `
CREATE TABLE IF NOT EXISTS leaderboard (
  userId TEXT PRIMARY KEY,
  username TEXT,
  prestige INTEGER,
  bosses INTEGER,
  level INTEGER,
  timestamp INTEGER
);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rank
  ON leaderboard(prestige DESC, bosses DESC, level DESC);
`;

export const CHATS_SCHEMA = `
CREATE TABLE IF NOT EXISTS chats (
  id TEXT PRIMARY KEY,
  player TEXT,
  message TEXT,
  timestamp INTEGER,
  type TEXT,
  guildId TEXT
);
CREATE INDEX IF NOT EXISTS idx_chats_global
  ON chats(type, timestamp DESC);
`;

export const MAX_CHAT_MESSAGE_LENGTH = 200;
export const CHAT_HISTORY_LIMIT = 50;
export const CHAT_PRUNE_KEEP = 500;
export const LEADERBOARD_TOP_N = 10;
export const MAX_LEADERBOARD_PRESTIGE = 99_999;
export const MAX_LEADERBOARD_BOSSES = 999_999;
export const MAX_LEADERBOARD_LEVEL = 100_000;
export const LEADERBOARD_JUMP_PRESTIGE = 50;
export const LEADERBOARD_JUMP_BOSSES = 200;
export const LEADERBOARD_JUMP_LEVEL = 1000;
