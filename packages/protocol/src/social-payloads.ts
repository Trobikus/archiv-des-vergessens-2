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

export type ChatGetHistoryPayload = {
  readonly guildId?: string | null;
};

export type ChatMessage = {
  readonly id: string;
  readonly player: string;
  readonly message: string;
  readonly timestamp: number;
  readonly type: "global";
};

export type ChatErrorPayload = {
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
  if (type !== "global") {
    return { ok: false, error: "chat message.type must be global" };
  }
  return {
    ok: true,
    value: { id, player, message, timestamp, type },
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
