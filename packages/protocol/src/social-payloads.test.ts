import { describe, expect, it } from "vitest";

import {
  validateChatErrorPayload,
  validateChatGetHistoryPayload,
  validateChatGlobalPayload,
  validateChatHistoryPayload,
  validateChatMessage,
  validateLeaderboardErrorPayload,
  validateLeaderboardSubmitPayload,
  validateLeaderboardUpdatePayload,
} from "./social-payloads";

describe("social payloads", () => {
  it("validates chat:global", () => {
    expect(validateChatGlobalPayload({ message: "Hallo" }).ok).toBe(true);
    expect(validateChatGlobalPayload({ message: 1 }).ok).toBe(false);
  });

  it("validates chat history messages", () => {
    const msg = {
      id: "a1",
      player: "Max",
      message: "Hi",
      timestamp: 1,
      type: "global" as const,
    };
    expect(validateChatMessage(msg).ok).toBe(true);
    expect(validateChatHistoryPayload({ messages: [msg] }).ok).toBe(true);
    expect(
      validateChatHistoryPayload({ messages: [{ ...msg, type: "clan" }] }).ok,
    ).toBe(false);
  });

  it("validates chat:getHistory guildId", () => {
    expect(validateChatGetHistoryPayload({}).ok).toBe(true);
    expect(validateChatGetHistoryPayload({ guildId: null }).ok).toBe(true);
    expect(validateChatGetHistoryPayload({ guildId: "g1" }).ok).toBe(true);
    expect(validateChatGetHistoryPayload({ guildId: 3 }).ok).toBe(false);
  });

  it("validates leaderboard submit + update", () => {
    expect(
      validateLeaderboardSubmitPayload({ prestige: 1, bosses: 2, level: 3 })
        .ok,
    ).toBe(true);
    expect(
      validateLeaderboardSubmitPayload({ prestige: -1, bosses: 2, level: 3 })
        .ok,
    ).toBe(false);
    expect(
      validateLeaderboardUpdatePayload({
        entries: [
          {
            userId: "u1",
            username: "Ada",
            prestige: 1,
            bosses: 2,
            level: 3,
            timestamp: 10,
          },
        ],
      }).ok,
    ).toBe(true);
  });

  it("validates chat:error and leaderboard:error", () => {
    expect(validateChatErrorPayload({ error: "fail" }).ok).toBe(true);
    expect(validateChatErrorPayload({ error: "" }).ok).toBe(false);
    expect(validateLeaderboardErrorPayload({ error: "jump" }).ok).toBe(true);
    expect(validateLeaderboardErrorPayload({}).ok).toBe(false);
  });
});
