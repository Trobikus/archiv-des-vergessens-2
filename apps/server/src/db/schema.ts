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
CREATE INDEX IF NOT EXISTS idx_chats_guild
  ON chats(guildId, timestamp DESC);
`;

export const FRIENDS_SCHEMA = `
CREATE TABLE IF NOT EXISTS friend_requests (
  fromUserId TEXT NOT NULL,
  toUserId TEXT NOT NULL,
  createdAt INTEGER NOT NULL,
  PRIMARY KEY (fromUserId, toUserId)
);
CREATE INDEX IF NOT EXISTS idx_friend_requests_to
  ON friend_requests(toUserId);

CREATE TABLE IF NOT EXISTS friendships (
  userIdLow TEXT NOT NULL,
  userIdHigh TEXT NOT NULL,
  createdAt INTEGER NOT NULL,
  PRIMARY KEY (userIdLow, userIdHigh)
);
CREATE INDEX IF NOT EXISTS idx_friendships_low
  ON friendships(userIdLow);
CREATE INDEX IF NOT EXISTS idx_friendships_high
  ON friendships(userIdHigh);
`;

export const GUILDS_SCHEMA = `
CREATE TABLE IF NOT EXISTS guilds (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE COLLATE NOCASE NOT NULL,
  ownerId TEXT NOT NULL,
  createdAt INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS guild_members (
  guildId TEXT NOT NULL,
  userId TEXT NOT NULL,
  role TEXT NOT NULL,
  joinedAt INTEGER NOT NULL,
  PRIMARY KEY (guildId, userId),
  UNIQUE (userId)
);
CREATE INDEX IF NOT EXISTS idx_guild_members_guild
  ON guild_members(guildId);

CREATE TABLE IF NOT EXISTS guild_invites (
  guildId TEXT NOT NULL,
  toUserId TEXT NOT NULL,
  fromUserId TEXT NOT NULL,
  createdAt INTEGER NOT NULL,
  PRIMARY KEY (guildId, toUserId)
);
CREATE INDEX IF NOT EXISTS idx_guild_invites_to
  ON guild_invites(toUserId);
`;

export const MAX_CHAT_MESSAGE_LENGTH = 200;
export const CHAT_HISTORY_LIMIT = 50;
export const CHAT_PRUNE_KEEP = 500;
export const MAX_FRIENDS = 50;
export const MAX_GUILD_NAME_LENGTH = 32;
export const MAX_GUILD_MEMBERS = 20;
export const LEADERBOARD_TOP_N = 10;
export const MAX_LEADERBOARD_PRESTIGE = 99_999;
export const MAX_LEADERBOARD_BOSSES = 999_999;
export const MAX_LEADERBOARD_LEVEL = 100_000;
export const LEADERBOARD_JUMP_PRESTIGE = 50;
export const LEADERBOARD_JUMP_BOSSES = 200;
export const LEADERBOARD_JUMP_LEVEL = 1000;
