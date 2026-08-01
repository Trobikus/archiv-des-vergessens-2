#!/usr/bin/env node
/**
 * Migrate v1 users table into a v2 SQLite DB.
 * Default mode is dry-run (no writes). Pass --apply to insert.
 *
 * Usage:
 *   node tools/migrate-v1-users/migrate-v1-users.mjs --source path/to/v1.db --target path/to/v2.db
 *   node tools/migrate-v1-users/migrate-v1-users.mjs --source v1.db --target v2.db --apply
 */
import { createRequire } from "node:module";
import { resolve } from "node:path";

const require = createRequire(import.meta.url);

function parseArgs(argv) {
  const args = {
    source: null,
    target: null,
    apply: false,
    force: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--source") {
      args.source = argv[++i] ?? null;
    } else if (arg === "--target") {
      args.target = argv[++i] ?? null;
    } else if (arg === "--apply") {
      args.apply = true;
    } else if (arg === "--force") {
      args.force = true;
    } else if (arg === "--dry-run") {
      args.apply = false;
    }
  }
  return args;
}

function isHex(value) {
  return typeof value === "string" && /^[0-9a-f]+$/i.test(value) && value.length >= 16;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.source || !args.target) {
    console.error(
      "Usage: node tools/migrate-v1-users/migrate-v1-users.mjs --source <v1.db> --target <v2.db> [--apply]",
    );
    process.exitCode = 1;
    return;
  }

  let Database;
  try {
    Database = require("better-sqlite3");
  } catch (cause) {
    console.error(
      "better-sqlite3 is required. Install workspace deps first.",
      cause instanceof Error ? cause.message : cause,
    );
    process.exitCode = 1;
    return;
  }

  const sourcePath = resolve(args.source);
  const targetPath = resolve(args.target);
  const source = new Database(sourcePath, { readonly: true, fileMustExist: true });

  const rows = source
    .prepare(
      `SELECT id, username, email, passwordHash, salt, avatar, createdAt, lastLogin
       FROM users`,
    )
    .all();

  const report = {
    total: rows.length,
    wouldInsert: 0,
    wouldSkipDuplicate: 0,
    invalid: 0,
    sampleIds: [],
    applied: false,
  };

  const validRows = [];
  for (const row of rows) {
    if (
      typeof row.id !== "string" ||
      typeof row.username !== "string" ||
      typeof row.email !== "string" ||
      !isHex(row.passwordHash) ||
      !isHex(row.salt)
    ) {
      report.invalid += 1;
      continue;
    }
    validRows.push(row);
    if (report.sampleIds.length < 5) {
      report.sampleIds.push(row.id);
    }
  }

  if (!args.apply) {
    report.wouldInsert = validRows.length;
    console.log(JSON.stringify({ dryRun: true, ...report }, null, 2));
    source.close();
    return;
  }

  const target = new Database(targetPath);
  target.exec(`
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
  `);

  const existsById = target.prepare("SELECT id FROM users WHERE id = ?");
  const existsByName = target.prepare(
    "SELECT id FROM users WHERE LOWER(username) = LOWER(?)",
  );
  const existsByEmail = target.prepare(
    "SELECT id FROM users WHERE LOWER(email) = LOWER(?)",
  );
  const insert = target.prepare(`
    INSERT INTO users (id, username, email, passwordHash, salt, avatar, createdAt, lastLogin, sessionToken)
    VALUES (@id, @username, @email, @passwordHash, @salt, @avatar, @createdAt, @lastLogin, NULL)
  `);

  const tx = target.transaction((items) => {
    for (const row of items) {
      const duplicate =
        existsById.get(row.id) ||
        existsByName.get(row.username) ||
        existsByEmail.get(row.email);
      if (duplicate) {
        if (!args.force) {
          report.wouldSkipDuplicate += 1;
          continue;
        }
      }
      insert.run({
        id: row.id,
        username: row.username,
        email: row.email,
        passwordHash: row.passwordHash,
        salt: row.salt,
        avatar: row.avatar ?? "A",
        createdAt: row.createdAt ?? Date.now(),
        lastLogin: row.lastLogin ?? Date.now(),
      });
      report.wouldInsert += 1;
    }
  });

  tx(validRows);
  report.applied = true;
  console.log(JSON.stringify(report, null, 2));
  source.close();
  target.close();
}

main();
