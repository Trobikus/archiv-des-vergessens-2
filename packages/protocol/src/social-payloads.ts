import type { ValidationResult } from "./save-envelope";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isNonNegativeInt(value: unknown): value is number {
  return isFiniteNumber(value) && value >= 0 && Number.isInteger(value);
}

function isPositiveInt(value: unknown): value is number {
  return isFiniteNumber(value) && value >= 1 && Number.isInteger(value);
}

export type ChatGlobalPayload = {
  readonly message: string;
};

export type ChatGuildPayload = {
  readonly message: string;
};

export type ChatGetHistoryPayload = {
  readonly guildId?: string | null;
};

export type ChatMessageType = "global" | "guild";

export type ChatMessage = {
  readonly id: string;
  readonly player: string;
  readonly message: string;
  readonly timestamp: number;
  readonly type: ChatMessageType;
  readonly guildId?: string;
};

export type ChatErrorPayload = {
  readonly error: string;
};

export type FriendUsernamePayload = {
  readonly username: string;
};

export type FriendEntry = {
  readonly userId: string;
  readonly username: string;
  readonly added: number;
};

export type FriendRequestEntry = {
  readonly fromUserId: string;
  readonly fromUsername: string;
  readonly toUserId: string;
  readonly toUsername: string;
  readonly timestamp: number;
};

export type FriendUpdatePayload = {
  readonly list: readonly FriendEntry[];
  readonly pending: readonly FriendRequestEntry[];
  readonly sent: readonly FriendRequestEntry[];
};

export type FriendErrorPayload = {
  readonly error: string;
};

export type GuildRole = "owner" | "member";

export type GuildCreatePayload = {
  readonly name: string;
};

export type GuildUsernamePayload = {
  readonly username: string;
};

export type GuildAcceptDeclinePayload = {
  readonly guildId: string;
};

export type GuildMember = {
  readonly userId: string;
  readonly username: string;
  readonly role: GuildRole;
  readonly joinedAt: number;
};

export type GuildInviteEntry = {
  readonly guildId: string;
  readonly guildName: string;
  readonly fromUserId: string;
  readonly fromUsername: string;
  readonly toUserId: string;
  readonly toUsername: string;
  readonly timestamp: number;
};

export type GuildInfo = {
  readonly id: string;
  readonly name: string;
  readonly ownerId: string;
  readonly createdAt: number;
};

export type GuildUpdatePayload = {
  readonly guild: GuildInfo | null;
  readonly members: readonly GuildMember[];
  readonly invites: readonly GuildInviteEntry[];
  readonly outgoingInvites: readonly GuildInviteEntry[];
};

export type GuildErrorPayload = {
  readonly error: string;
};

export type LeaderboardSubmitPayload = {
  readonly prestige: number;
  readonly bosses: number;
  readonly level: number;
};

export type LeaderboardEntry = {
  readonly userId: string;
  readonly username: string;
  readonly prestige: number;
  readonly bosses: number;
  readonly level: number;
  readonly timestamp: number;
};

export type LeaderboardErrorPayload = {
  readonly error: string;
};

export function validateChatGlobalPayload(
  value: unknown,
): ValidationResult<ChatGlobalPayload> {
  if (!isRecord(value)) {
    return { ok: false, error: "chat:global payload must be an object" };
  }
  const message = value["message"];
  if (typeof message !== "string") {
    return { ok: false, error: "chat:global.message must be a string" };
  }
  return { ok: true, value: { message } };
}

export function validateChatGuildPayload(
  value: unknown,
): ValidationResult<ChatGuildPayload> {
  if (!isRecord(value)) {
    return { ok: false, error: "chat:guild payload must be an object" };
  }
  const message = value["message"];
  if (typeof message !== "string") {
    return { ok: false, error: "chat:guild.message must be a string" };
  }
  return { ok: true, value: { message } };
}

export function validateChatGetHistoryPayload(
  value: unknown,
): ValidationResult<ChatGetHistoryPayload> {
  if (!isRecord(value)) {
    return { ok: false, error: "chat:getHistory payload must be an object" };
  }
  const guildId = value["guildId"];
  if (
    guildId !== undefined &&
    guildId !== null &&
    typeof guildId !== "string"
  ) {
    return { ok: false, error: "chat:getHistory.guildId invalid" };
  }
  return {
    ok: true,
    value:
      typeof guildId === "string"
        ? { guildId }
        : guildId === null
          ? { guildId: null }
          : {},
  };
}

export function validateChatMessage(
  value: unknown,
): ValidationResult<ChatMessage> {
  if (!isRecord(value)) {
    return { ok: false, error: "chat message must be an object" };
  }
  const id = value["id"];
  const player = value["player"];
  const message = value["message"];
  const timestamp = value["timestamp"];
  const type = value["type"];
  if (typeof id !== "string" || id.length === 0) {
    return { ok: false, error: "chat message.id invalid" };
  }
  if (typeof player !== "string" || player.length === 0) {
    return { ok: false, error: "chat message.player invalid" };
  }
  if (typeof message !== "string") {
    return { ok: false, error: "chat message.message invalid" };
  }
  if (!isFiniteNumber(timestamp) || timestamp < 0) {
    return { ok: false, error: "chat message.timestamp invalid" };
  }
  if (type !== "global" && type !== "guild") {
    return { ok: false, error: "chat message.type must be global or guild" };
  }
  const guildId = value["guildId"];
  if (
    guildId !== undefined &&
    (typeof guildId !== "string" || guildId.length === 0)
  ) {
    return { ok: false, error: "chat message.guildId invalid" };
  }
  if (type === "guild" && typeof guildId !== "string") {
    return { ok: false, error: "chat message.guildId required for guild chat" };
  }
  return {
    ok: true,
    value:
      typeof guildId === "string"
        ? { id, player, message, timestamp, type, guildId }
        : { id, player, message, timestamp, type },
  };
}

export type ChatHistoryPayload = {
  readonly messages: readonly ChatMessage[];
};

export function validateChatHistoryPayload(
  value: unknown,
): ValidationResult<ChatHistoryPayload> {
  if (!isRecord(value)) {
    return { ok: false, error: "chat:history payload must be an object" };
  }
  const raw = value["messages"];
  if (!Array.isArray(raw)) {
    return { ok: false, error: "chat:history.messages must be an array" };
  }
  const messages: ChatMessage[] = [];
  for (const entry of raw) {
    const parsed = validateChatMessage(entry);
    if (!parsed.ok) {
      return parsed;
    }
    messages.push(parsed.value);
  }
  return { ok: true, value: { messages } };
}

export function validateChatErrorPayload(
  value: unknown,
): ValidationResult<ChatErrorPayload> {
  if (!isRecord(value)) {
    return { ok: false, error: "chat:error payload must be an object" };
  }
  const error = value["error"];
  if (typeof error !== "string" || error.length === 0) {
    return { ok: false, error: "chat:error.error must be a non-empty string" };
  }
  return { ok: true, value: { error } };
}

export function validateLeaderboardSubmitPayload(
  value: unknown,
): ValidationResult<LeaderboardSubmitPayload> {
  if (!isRecord(value)) {
    return { ok: false, error: "leaderboard:submit payload must be an object" };
  }
  const prestige = value["prestige"];
  const bosses = value["bosses"];
  const level = value["level"];
  if (!isNonNegativeInt(prestige)) {
    return { ok: false, error: "leaderboard:submit.prestige invalid" };
  }
  if (!isNonNegativeInt(bosses)) {
    return { ok: false, error: "leaderboard:submit.bosses invalid" };
  }
  if (!isPositiveInt(level)) {
    return { ok: false, error: "leaderboard:submit.level invalid" };
  }
  return { ok: true, value: { prestige, bosses, level } };
}

export function validateLeaderboardEntry(
  value: unknown,
): ValidationResult<LeaderboardEntry> {
  if (!isRecord(value)) {
    return { ok: false, error: "leaderboard entry must be an object" };
  }
  const userId = value["userId"];
  const username = value["username"];
  const prestige = value["prestige"];
  const bosses = value["bosses"];
  const level = value["level"];
  const timestamp = value["timestamp"];
  if (typeof userId !== "string" || userId.length === 0) {
    return { ok: false, error: "leaderboard entry.userId invalid" };
  }
  if (typeof username !== "string" || username.length === 0) {
    return { ok: false, error: "leaderboard entry.username invalid" };
  }
  if (!isNonNegativeInt(prestige)) {
    return { ok: false, error: "leaderboard entry.prestige invalid" };
  }
  if (!isNonNegativeInt(bosses)) {
    return { ok: false, error: "leaderboard entry.bosses invalid" };
  }
  if (!isPositiveInt(level)) {
    return { ok: false, error: "leaderboard entry.level invalid" };
  }
  if (!isFiniteNumber(timestamp) || timestamp < 0) {
    return { ok: false, error: "leaderboard entry.timestamp invalid" };
  }
  return {
    ok: true,
    value: { userId, username, prestige, bosses, level, timestamp },
  };
}

export type LeaderboardUpdatePayload = {
  readonly entries: readonly LeaderboardEntry[];
};

export function validateLeaderboardUpdatePayload(
  value: unknown,
): ValidationResult<LeaderboardUpdatePayload> {
  if (!isRecord(value)) {
    return { ok: false, error: "leaderboard:update payload must be an object" };
  }
  const raw = value["entries"];
  if (!Array.isArray(raw)) {
    return { ok: false, error: "leaderboard:update.entries must be an array" };
  }
  const entries: LeaderboardEntry[] = [];
  for (const entry of raw) {
    const parsed = validateLeaderboardEntry(entry);
    if (!parsed.ok) {
      return parsed;
    }
    entries.push(parsed.value);
  }
  return { ok: true, value: { entries } };
}

export function validateLeaderboardErrorPayload(
  value: unknown,
): ValidationResult<LeaderboardErrorPayload> {
  if (!isRecord(value)) {
    return { ok: false, error: "leaderboard:error payload must be an object" };
  }
  const error = value["error"];
  if (typeof error !== "string" || error.length === 0) {
    return {
      ok: false,
      error: "leaderboard:error.error must be a non-empty string",
    };
  }
  return { ok: true, value: { error } };
}

function validateNonEmptyString(
  value: unknown,
  label: string,
): ValidationResult<string> {
  if (typeof value !== "string" || value.length === 0) {
    return { ok: false, error: `${label} must be a non-empty string` };
  }
  return { ok: true, value };
}

export function validateFriendUsernamePayload(
  value: unknown,
): ValidationResult<FriendUsernamePayload> {
  if (!isRecord(value)) {
    return { ok: false, error: "friend payload must be an object" };
  }
  const username = validateNonEmptyString(value["username"], "username");
  if (!username.ok) {
    return username;
  }
  return { ok: true, value: { username: username.value } };
}

export function validateFriendEntry(
  value: unknown,
): ValidationResult<FriendEntry> {
  if (!isRecord(value)) {
    return { ok: false, error: "friend entry must be an object" };
  }
  const userId = validateNonEmptyString(value["userId"], "friend.userId");
  if (!userId.ok) {
    return userId;
  }
  const username = validateNonEmptyString(
    value["username"],
    "friend.username",
  );
  if (!username.ok) {
    return username;
  }
  const added = value["added"];
  if (!isFiniteNumber(added) || added < 0) {
    return { ok: false, error: "friend.added invalid" };
  }
  return {
    ok: true,
    value: { userId: userId.value, username: username.value, added },
  };
}

export function validateFriendRequestEntry(
  value: unknown,
): ValidationResult<FriendRequestEntry> {
  if (!isRecord(value)) {
    return { ok: false, error: "friend request must be an object" };
  }
  const fromUserId = validateNonEmptyString(
    value["fromUserId"],
    "friendRequest.fromUserId",
  );
  if (!fromUserId.ok) {
    return fromUserId;
  }
  const fromUsername = validateNonEmptyString(
    value["fromUsername"],
    "friendRequest.fromUsername",
  );
  if (!fromUsername.ok) {
    return fromUsername;
  }
  const toUserId = validateNonEmptyString(
    value["toUserId"],
    "friendRequest.toUserId",
  );
  if (!toUserId.ok) {
    return toUserId;
  }
  const toUsername = validateNonEmptyString(
    value["toUsername"],
    "friendRequest.toUsername",
  );
  if (!toUsername.ok) {
    return toUsername;
  }
  const timestamp = value["timestamp"];
  if (!isFiniteNumber(timestamp) || timestamp < 0) {
    return { ok: false, error: "friendRequest.timestamp invalid" };
  }
  return {
    ok: true,
    value: {
      fromUserId: fromUserId.value,
      fromUsername: fromUsername.value,
      toUserId: toUserId.value,
      toUsername: toUsername.value,
      timestamp,
    },
  };
}

export function validateFriendUpdatePayload(
  value: unknown,
): ValidationResult<FriendUpdatePayload> {
  if (!isRecord(value)) {
    return { ok: false, error: "friend:update payload must be an object" };
  }
  if (
    !Array.isArray(value["list"]) ||
    !Array.isArray(value["pending"]) ||
    !Array.isArray(value["sent"])
  ) {
    return { ok: false, error: "friend:update lists invalid" };
  }
  const list: FriendEntry[] = [];
  for (const entry of value["list"]) {
    const parsed = validateFriendEntry(entry);
    if (!parsed.ok) {
      return parsed;
    }
    list.push(parsed.value);
  }
  const pending: FriendRequestEntry[] = [];
  for (const entry of value["pending"]) {
    const parsed = validateFriendRequestEntry(entry);
    if (!parsed.ok) {
      return parsed;
    }
    pending.push(parsed.value);
  }
  const sent: FriendRequestEntry[] = [];
  for (const entry of value["sent"]) {
    const parsed = validateFriendRequestEntry(entry);
    if (!parsed.ok) {
      return parsed;
    }
    sent.push(parsed.value);
  }
  return { ok: true, value: { list, pending, sent } };
}

export function validateFriendErrorPayload(
  value: unknown,
): ValidationResult<FriendErrorPayload> {
  if (!isRecord(value)) {
    return { ok: false, error: "friend:error payload must be an object" };
  }
  const error = value["error"];
  if (typeof error !== "string" || error.length === 0) {
    return { ok: false, error: "friend:error.error must be a non-empty string" };
  }
  return { ok: true, value: { error } };
}

export function validateGuildCreatePayload(
  value: unknown,
): ValidationResult<GuildCreatePayload> {
  if (!isRecord(value)) {
    return { ok: false, error: "guild:create payload must be an object" };
  }
  const name = validateNonEmptyString(value["name"], "guild:create.name");
  if (!name.ok) {
    return name;
  }
  return { ok: true, value: { name: name.value } };
}

export function validateGuildUsernamePayload(
  value: unknown,
): ValidationResult<GuildUsernamePayload> {
  if (!isRecord(value)) {
    return { ok: false, error: "guild username payload must be an object" };
  }
  const username = validateNonEmptyString(value["username"], "username");
  if (!username.ok) {
    return username;
  }
  return { ok: true, value: { username: username.value } };
}

export function validateGuildAcceptDeclinePayload(
  value: unknown,
): ValidationResult<GuildAcceptDeclinePayload> {
  if (!isRecord(value)) {
    return { ok: false, error: "guild invite payload must be an object" };
  }
  const guildId = validateNonEmptyString(value["guildId"], "guildId");
  if (!guildId.ok) {
    return guildId;
  }
  return { ok: true, value: { guildId: guildId.value } };
}

function validateGuildRole(value: unknown): ValidationResult<GuildRole> {
  if (value !== "owner" && value !== "member") {
    return { ok: false, error: "guild role invalid" };
  }
  return { ok: true, value };
}

export function validateGuildMember(
  value: unknown,
): ValidationResult<GuildMember> {
  if (!isRecord(value)) {
    return { ok: false, error: "guild member must be an object" };
  }
  const userId = validateNonEmptyString(value["userId"], "member.userId");
  if (!userId.ok) {
    return userId;
  }
  const username = validateNonEmptyString(
    value["username"],
    "member.username",
  );
  if (!username.ok) {
    return username;
  }
  const role = validateGuildRole(value["role"]);
  if (!role.ok) {
    return role;
  }
  const joinedAt = value["joinedAt"];
  if (!isFiniteNumber(joinedAt) || joinedAt < 0) {
    return { ok: false, error: "member.joinedAt invalid" };
  }
  return {
    ok: true,
    value: {
      userId: userId.value,
      username: username.value,
      role: role.value,
      joinedAt,
    },
  };
}

export function validateGuildInviteEntry(
  value: unknown,
): ValidationResult<GuildInviteEntry> {
  if (!isRecord(value)) {
    return { ok: false, error: "guild invite must be an object" };
  }
  const guildId = validateNonEmptyString(value["guildId"], "invite.guildId");
  if (!guildId.ok) {
    return guildId;
  }
  const guildName = validateNonEmptyString(
    value["guildName"],
    "invite.guildName",
  );
  if (!guildName.ok) {
    return guildName;
  }
  const fromUserId = validateNonEmptyString(
    value["fromUserId"],
    "invite.fromUserId",
  );
  if (!fromUserId.ok) {
    return fromUserId;
  }
  const fromUsername = validateNonEmptyString(
    value["fromUsername"],
    "invite.fromUsername",
  );
  if (!fromUsername.ok) {
    return fromUsername;
  }
  const toUserId = validateNonEmptyString(value["toUserId"], "invite.toUserId");
  if (!toUserId.ok) {
    return toUserId;
  }
  const toUsername = validateNonEmptyString(
    value["toUsername"],
    "invite.toUsername",
  );
  if (!toUsername.ok) {
    return toUsername;
  }
  const timestamp = value["timestamp"];
  if (!isFiniteNumber(timestamp) || timestamp < 0) {
    return { ok: false, error: "invite.timestamp invalid" };
  }
  return {
    ok: true,
    value: {
      guildId: guildId.value,
      guildName: guildName.value,
      fromUserId: fromUserId.value,
      fromUsername: fromUsername.value,
      toUserId: toUserId.value,
      toUsername: toUsername.value,
      timestamp,
    },
  };
}

export function validateGuildInfo(
  value: unknown,
): ValidationResult<GuildInfo | null> {
  if (value === null) {
    return { ok: true, value: null };
  }
  if (!isRecord(value)) {
    return { ok: false, error: "guild info must be an object or null" };
  }
  const id = validateNonEmptyString(value["id"], "guild.id");
  if (!id.ok) {
    return id;
  }
  const name = validateNonEmptyString(value["name"], "guild.name");
  if (!name.ok) {
    return name;
  }
  const ownerId = validateNonEmptyString(value["ownerId"], "guild.ownerId");
  if (!ownerId.ok) {
    return ownerId;
  }
  const createdAt = value["createdAt"];
  if (!isFiniteNumber(createdAt) || createdAt < 0) {
    return { ok: false, error: "guild.createdAt invalid" };
  }
  return {
    ok: true,
    value: {
      id: id.value,
      name: name.value,
      ownerId: ownerId.value,
      createdAt,
    },
  };
}

export function validateGuildUpdatePayload(
  value: unknown,
): ValidationResult<GuildUpdatePayload> {
  if (!isRecord(value)) {
    return { ok: false, error: "guild:update payload must be an object" };
  }
  const guild = validateGuildInfo(value["guild"]);
  if (!guild.ok) {
    return guild;
  }
  if (
    !Array.isArray(value["members"]) ||
    !Array.isArray(value["invites"]) ||
    !Array.isArray(value["outgoingInvites"])
  ) {
    return { ok: false, error: "guild:update lists invalid" };
  }
  const members: GuildMember[] = [];
  for (const entry of value["members"]) {
    const parsed = validateGuildMember(entry);
    if (!parsed.ok) {
      return parsed;
    }
    members.push(parsed.value);
  }
  const invites: GuildInviteEntry[] = [];
  for (const entry of value["invites"]) {
    const parsed = validateGuildInviteEntry(entry);
    if (!parsed.ok) {
      return parsed;
    }
    invites.push(parsed.value);
  }
  const outgoingInvites: GuildInviteEntry[] = [];
  for (const entry of value["outgoingInvites"]) {
    const parsed = validateGuildInviteEntry(entry);
    if (!parsed.ok) {
      return parsed;
    }
    outgoingInvites.push(parsed.value);
  }
  return {
    ok: true,
    value: {
      guild: guild.value,
      members,
      invites,
      outgoingInvites,
    },
  };
}

export function validateGuildErrorPayload(
  value: unknown,
): ValidationResult<GuildErrorPayload> {
  if (!isRecord(value)) {
    return { ok: false, error: "guild:error payload must be an object" };
  }
  const error = value["error"];
  if (typeof error !== "string" || error.length === 0) {
    return { ok: false, error: "guild:error.error must be a non-empty string" };
  }
  return { ok: true, value: { error } };
}
