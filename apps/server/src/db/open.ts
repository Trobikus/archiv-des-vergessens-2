import Database from "better-sqlite3";

import {
  CHATS_SCHEMA,
  FRIENDS_SCHEMA,
  GUILDS_SCHEMA,
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
  readonly getUserByUsername: Database.Statement;
  readonly insertUser: Database.Statement;
  readonly updateSession: Database.Statement;
  readonly getEmail: Database.Statement;
  readonly getSave: Database.Statement;
  readonly upsertSave: Database.Statement;
  readonly migrateGuestSave: Database.Statement;
  readonly insertChat: Database.Statement;
  readonly getGlobalChatHistory: Database.Statement;
  readonly getGuildChatHistory: Database.Statement;
  readonly countChats: Database.Statement;
  readonly pruneOldChats: Database.Statement;
  readonly getLeaderboardUser: Database.Statement;
  readonly upsertLeaderboard: Database.Statement;
  readonly getTopLeaderboard: Database.Statement;
  readonly insertFriendRequest: Database.Statement;
  readonly deleteFriendRequest: Database.Statement;
  readonly deleteFriendRequestsBetween: Database.Statement;
  readonly getFriendRequest: Database.Statement;
  readonly listPendingFriendRequests: Database.Statement;
  readonly listSentFriendRequests: Database.Statement;
  readonly insertFriendship: Database.Statement;
  readonly deleteFriendship: Database.Statement;
  readonly getFriendship: Database.Statement;
  readonly listFriendships: Database.Statement;
  readonly countFriendships: Database.Statement;
  readonly insertGuild: Database.Statement;
  readonly getGuildById: Database.Statement;
  readonly getGuildByName: Database.Statement;
  readonly deleteGuild: Database.Statement;
  readonly insertGuildMember: Database.Statement;
  readonly deleteGuildMember: Database.Statement;
  readonly deleteGuildMembers: Database.Statement;
  readonly getGuildMember: Database.Statement;
  readonly getGuildMembershipByUser: Database.Statement;
  readonly listGuildMembers: Database.Statement;
  readonly countGuildMembers: Database.Statement;
  readonly insertGuildInvite: Database.Statement;
  readonly deleteGuildInvite: Database.Statement;
  readonly deleteGuildInvitesForGuild: Database.Statement;
  readonly deleteGuildInvitesForUser: Database.Statement;
  readonly getGuildInvite: Database.Statement;
  readonly listGuildInvitesForUser: Database.Statement;
  readonly listOutgoingGuildInvites: Database.Statement;
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
  db.exec(FRIENDS_SCHEMA);
  db.exec(GUILDS_SCHEMA);

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
    getUserByUsername: db.prepare(
      "SELECT * FROM users WHERE LOWER(username) = LOWER(?) LIMIT 1",
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
      SELECT id, player, message, timestamp, type, guildId
      FROM chats
      WHERE type = 'global'
      ORDER BY timestamp DESC
      LIMIT ?
    `),
    getGuildChatHistory: db.prepare(`
      SELECT id, player, message, timestamp, type, guildId
      FROM chats
      WHERE type = 'guild' AND guildId = ?
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
    insertFriendRequest: db.prepare(`
      INSERT INTO friend_requests (fromUserId, toUserId, createdAt)
      VALUES (?, ?, ?)
    `),
    deleteFriendRequest: db.prepare(`
      DELETE FROM friend_requests
      WHERE fromUserId = ? AND toUserId = ?
    `),
    deleteFriendRequestsBetween: db.prepare(`
      DELETE FROM friend_requests
      WHERE (fromUserId = ? AND toUserId = ?)
         OR (fromUserId = ? AND toUserId = ?)
    `),
    getFriendRequest: db.prepare(`
      SELECT fromUserId, toUserId, createdAt
      FROM friend_requests
      WHERE fromUserId = ? AND toUserId = ?
    `),
    listPendingFriendRequests: db.prepare(`
      SELECT fr.fromUserId, u1.username AS fromUsername,
             fr.toUserId, u2.username AS toUsername, fr.createdAt AS timestamp
      FROM friend_requests fr
      INNER JOIN users u1 ON u1.id = fr.fromUserId
      INNER JOIN users u2 ON u2.id = fr.toUserId
      WHERE fr.toUserId = ?
      ORDER BY fr.createdAt DESC
    `),
    listSentFriendRequests: db.prepare(`
      SELECT fr.fromUserId, u1.username AS fromUsername,
             fr.toUserId, u2.username AS toUsername, fr.createdAt AS timestamp
      FROM friend_requests fr
      INNER JOIN users u1 ON u1.id = fr.fromUserId
      INNER JOIN users u2 ON u2.id = fr.toUserId
      WHERE fr.fromUserId = ?
      ORDER BY fr.createdAt DESC
    `),
    insertFriendship: db.prepare(`
      INSERT INTO friendships (userIdLow, userIdHigh, createdAt)
      VALUES (?, ?, ?)
    `),
    deleteFriendship: db.prepare(`
      DELETE FROM friendships
      WHERE userIdLow = ? AND userIdHigh = ?
    `),
    getFriendship: db.prepare(`
      SELECT userIdLow, userIdHigh, createdAt
      FROM friendships
      WHERE userIdLow = ? AND userIdHigh = ?
    `),
    listFriendships: db.prepare(`
      SELECT
        CASE WHEN f.userIdLow = ? THEN f.userIdHigh ELSE f.userIdLow END AS userId,
        u.username AS username,
        f.createdAt AS added
      FROM friendships f
      INNER JOIN users u ON u.id = CASE
        WHEN f.userIdLow = ? THEN f.userIdHigh ELSE f.userIdLow
      END
      WHERE f.userIdLow = ? OR f.userIdHigh = ?
      ORDER BY f.createdAt DESC
    `),
    countFriendships: db.prepare(`
      SELECT COUNT(*) AS count
      FROM friendships
      WHERE userIdLow = ? OR userIdHigh = ?
    `),
    insertGuild: db.prepare(`
      INSERT INTO guilds (id, name, ownerId, createdAt)
      VALUES (?, ?, ?, ?)
    `),
    getGuildById: db.prepare(`
      SELECT id, name, ownerId, createdAt FROM guilds WHERE id = ?
    `),
    getGuildByName: db.prepare(`
      SELECT id, name, ownerId, createdAt
      FROM guilds
      WHERE LOWER(name) = LOWER(?)
      LIMIT 1
    `),
    deleteGuild: db.prepare(`DELETE FROM guilds WHERE id = ?`),
    insertGuildMember: db.prepare(`
      INSERT INTO guild_members (guildId, userId, role, joinedAt)
      VALUES (?, ?, ?, ?)
    `),
    deleteGuildMember: db.prepare(`
      DELETE FROM guild_members WHERE guildId = ? AND userId = ?
    `),
    deleteGuildMembers: db.prepare(`
      DELETE FROM guild_members WHERE guildId = ?
    `),
    getGuildMember: db.prepare(`
      SELECT guildId, userId, role, joinedAt
      FROM guild_members
      WHERE guildId = ? AND userId = ?
    `),
    getGuildMembershipByUser: db.prepare(`
      SELECT gm.guildId, gm.userId, gm.role, gm.joinedAt,
             g.name AS guildName, g.ownerId, g.createdAt AS guildCreatedAt
      FROM guild_members gm
      INNER JOIN guilds g ON g.id = gm.guildId
      WHERE gm.userId = ?
    `),
    listGuildMembers: db.prepare(`
      SELECT gm.userId, u.username, gm.role, gm.joinedAt
      FROM guild_members gm
      INNER JOIN users u ON u.id = gm.userId
      WHERE gm.guildId = ?
      ORDER BY
        CASE gm.role WHEN 'owner' THEN 0 ELSE 1 END,
        gm.joinedAt ASC
    `),
    countGuildMembers: db.prepare(`
      SELECT COUNT(*) AS count FROM guild_members WHERE guildId = ?
    `),
    insertGuildInvite: db.prepare(`
      INSERT INTO guild_invites (guildId, toUserId, fromUserId, createdAt)
      VALUES (?, ?, ?, ?)
    `),
    deleteGuildInvite: db.prepare(`
      DELETE FROM guild_invites WHERE guildId = ? AND toUserId = ?
    `),
    deleteGuildInvitesForGuild: db.prepare(`
      DELETE FROM guild_invites WHERE guildId = ?
    `),
    deleteGuildInvitesForUser: db.prepare(`
      DELETE FROM guild_invites WHERE toUserId = ?
    `),
    getGuildInvite: db.prepare(`
      SELECT guildId, toUserId, fromUserId, createdAt
      FROM guild_invites
      WHERE guildId = ? AND toUserId = ?
    `),
    listGuildInvitesForUser: db.prepare(`
      SELECT gi.guildId, g.name AS guildName,
             gi.fromUserId, u1.username AS fromUsername,
             gi.toUserId, u2.username AS toUsername,
             gi.createdAt AS timestamp
      FROM guild_invites gi
      INNER JOIN guilds g ON g.id = gi.guildId
      INNER JOIN users u1 ON u1.id = gi.fromUserId
      INNER JOIN users u2 ON u2.id = gi.toUserId
      WHERE gi.toUserId = ?
      ORDER BY gi.createdAt DESC
    `),
    listOutgoingGuildInvites: db.prepare(`
      SELECT gi.guildId, g.name AS guildName,
             gi.fromUserId, u1.username AS fromUsername,
             gi.toUserId, u2.username AS toUsername,
             gi.createdAt AS timestamp
      FROM guild_invites gi
      INNER JOIN guilds g ON g.id = gi.guildId
      INNER JOIN users u1 ON u1.id = gi.fromUserId
      INNER JOIN users u2 ON u2.id = gi.toUserId
      WHERE gi.guildId = ?
      ORDER BY gi.createdAt DESC
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
