import Database from "better-sqlite3";

import {
  CHATS_SCHEMA,
  LEADERBOARD_SCHEMA,
  SAVES_SCHEMA,
  USERS_SCHEMA,
} from "./schema";

export type AppDatabase = Database.Database;

export type PreparedStatements = {
  readonly checkUsername: Database.Statement;
  readonly getUserById: Database.Statement;
  readonly getUserByLogin: Database.Statement;
  readonly getUserBySession: Database.Statement;
  readonly insertUser: Database.Statement;
  readonly updateSession: Database.Statement;
  readonly getEmail: Database.Statement;
  readonly getSave: Database.Statement;
  readonly upsertSave: Database.Statement;
  readonly migrateGuestSave: Database.Statement;
  readonly insertChat: Database.Statement;
  readonly getGlobalChatHistory: Database.Statement;
  readonly countChats: Database.Statement;
  readonly pruneOldChats: Database.Statement;
  readonly getLeaderboardUser: Database.Statement;
  readonly upsertLeaderboard: Database.Statement;
  readonly getTopLeaderboard: Database.Statement;
};

export type OpenDatabaseResult = {
  readonly db: AppDatabase;
  readonly stmts: PreparedStatements;
};

export function openDatabase(dbFile: string): OpenDatabaseResult {
  const db = new Database(dbFile);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(USERS_SCHEMA);
  db.exec(SAVES_SCHEMA);
  db.exec(LEADERBOARD_SCHEMA);
  db.exec(CHATS_SCHEMA);

  const integrity = db.pragma("integrity_check") as Array<{
    integrity_check: string;
  }>;
  const first = integrity[0];
  if (first === undefined || first.integrity_check !== "ok") {
    db.close();
    throw new Error("database integrity check failed");
  }

  const stmts: PreparedStatements = {
    checkUsername: db.prepare(
      "SELECT id FROM users WHERE LOWER(username) = ? LIMIT 1",
    ),
    getUserById: db.prepare("SELECT * FROM users WHERE id = ?"),
    getUserByLogin: db.prepare(
      "SELECT * FROM users WHERE username = ? OR email = ?",
    ),
    getUserBySession: db.prepare(
      "SELECT * FROM users WHERE id = ? AND sessionToken = ?",
    ),
    insertUser: db.prepare(`
      INSERT INTO users (id, username, email, passwordHash, salt, avatar, createdAt, lastLogin, sessionToken)
      VALUES (@id, @username, @email, @passwordHash, @salt, @avatar, @createdAt, @lastLogin, @sessionToken)
    `),
    updateSession: db.prepare(
      "UPDATE users SET lastLogin = ?, sessionToken = ? WHERE id = ?",
    ),
    getEmail: db.prepare("SELECT id FROM users WHERE email = ?"),
    getSave: db.prepare(
      "SELECT saveData, version, timestamp FROM saves WHERE userId = ?",
    ),
    upsertSave: db.prepare(`
      INSERT INTO saves (userId, username, saveData, version, timestamp)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(userId) DO UPDATE SET
        username = excluded.username,
        saveData = excluded.saveData,
        version = excluded.version,
        timestamp = excluded.timestamp
    `),
    migrateGuestSave: db.prepare(`
      UPDATE saves
      SET userId = ?, username = ?, version = ?, timestamp = ?
      WHERE userId = ?
    `),
    insertChat: db.prepare(`
      INSERT INTO chats (id, player, message, timestamp, type, guildId)
      VALUES (?, ?, ?, ?, ?, ?)
    `),
    getGlobalChatHistory: db.prepare(`
      SELECT id, player, message, timestamp, type
      FROM chats
      WHERE type = 'global'
      ORDER BY timestamp DESC
      LIMIT ?
    `),
    countChats: db.prepare("SELECT COUNT(*) AS count FROM chats"),
    pruneOldChats: db.prepare(`
      DELETE FROM chats
      WHERE id NOT IN (
        SELECT id FROM chats ORDER BY timestamp DESC LIMIT ?
      )
    `),
    getLeaderboardUser: db.prepare(
      "SELECT prestige, bosses, level FROM leaderboard WHERE userId = ?",
    ),
    upsertLeaderboard: db.prepare(`
      INSERT INTO leaderboard (userId, username, prestige, bosses, level, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(userId) DO UPDATE SET
        username = excluded.username,
        prestige = MAX(leaderboard.prestige, excluded.prestige),
        bosses = MAX(leaderboard.bosses, excluded.bosses),
        level = MAX(leaderboard.level, excluded.level),
        timestamp = CASE
          WHEN excluded.prestige > leaderboard.prestige
               OR excluded.bosses > leaderboard.bosses
               OR excluded.level > leaderboard.level
          THEN excluded.timestamp
          ELSE leaderboard.timestamp
        END
    `),
    getTopLeaderboard: db.prepare(`
      SELECT l.userId, l.username, l.prestige, l.bosses, l.level, l.timestamp
      FROM leaderboard l
      INNER JOIN users u ON u.id = l.userId
      ORDER BY l.prestige DESC, l.bosses DESC, l.level DESC
      LIMIT ?
    `),
  };

  return { db, stmts };
}

export type UserRow = {
  readonly id: string;
  readonly username: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly salt: string;
  readonly avatar: string | null;
  readonly createdAt: number;
  readonly lastLogin: number;
  readonly sessionToken: string | null;
};
