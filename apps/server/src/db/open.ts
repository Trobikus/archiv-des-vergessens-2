import Database from "better-sqlite3";

import { SAVES_SCHEMA, USERS_SCHEMA } from "./schema";

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
