import { describe, expect, it } from "vitest";

import {
  validateChatErrorPayload,
  validateChatGetHistoryPayload,
  validateChatGlobalPayload,
  validateChatGuildPayload,
  validateChatHistoryPayload,
  validateChatMessage,
  validateFriendEntry,
  validateFriendErrorPayload,
  validateFriendRequestEntry,
  validateFriendUpdatePayload,
  validateFriendUsernamePayload,
  validateGuildAcceptDeclinePayload,
  validateGuildCreatePayload,
  validateGuildErrorPayload,
  validateGuildInfo,
  validateGuildInviteEntry,
  validateGuildMember,
  validateGuildUpdatePayload,
  validateGuildUsernamePayload,
  validateLeaderboardEntry,
  validateLeaderboardErrorPayload,
  validateLeaderboardSubmitPayload,
  validateLeaderboardUpdatePayload,
} from "./social-payloads";

describe("social payloads", () => {
  it("validates chat:global", () => {
    expect(validateChatGlobalPayload({ message: "Hallo" }).ok).toBe(true);
    expect(validateChatGlobalPayload({ message: 1 }).ok).toBe(false);
    expect(validateChatGlobalPayload(null).ok).toBe(false);
  });

  it("validates chat:guild", () => {
    expect(validateChatGuildPayload({ message: "Gilde hi" }).ok).toBe(true);
    expect(validateChatGuildPayload({ message: 1 }).ok).toBe(false);
    expect(validateChatGuildPayload("x").ok).toBe(false);
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
    expect(validateChatHistoryPayload({ messages: "x" }).ok).toBe(false);
    expect(validateChatHistoryPayload(null).ok).toBe(false);
    expect(
      validateChatHistoryPayload({ messages: [{ ...msg, type: "clan" }] }).ok,
    ).toBe(false);
    const guildMsg = {
      ...msg,
      type: "guild" as const,
      guildId: "g1",
    };
    expect(validateChatMessage(guildMsg).ok).toBe(true);
    expect(
      validateChatMessage({ ...msg, type: "guild" as const }).ok,
    ).toBe(false);
    expect(validateChatMessage(null).ok).toBe(false);
    expect(validateChatMessage({ ...msg, id: "" }).ok).toBe(false);
    expect(validateChatMessage({ ...msg, player: "" }).ok).toBe(false);
    expect(validateChatMessage({ ...msg, message: 1 }).ok).toBe(false);
    expect(validateChatMessage({ ...msg, timestamp: -1 }).ok).toBe(false);
    expect(validateChatMessage({ ...msg, guildId: "" }).ok).toBe(false);
  });

  it("validates chat:getHistory guildId", () => {
    expect(validateChatGetHistoryPayload({}).ok).toBe(true);
    expect(validateChatGetHistoryPayload({ guildId: null }).ok).toBe(true);
    expect(validateChatGetHistoryPayload({ guildId: "g1" }).ok).toBe(true);
    expect(validateChatGetHistoryPayload({ guildId: 3 }).ok).toBe(false);
    expect(validateChatGetHistoryPayload(null).ok).toBe(false);
  });

  it("validates chat:error and leaderboard:error", () => {
    expect(validateChatErrorPayload({ error: "fail" }).ok).toBe(true);
    expect(validateChatErrorPayload({ error: "" }).ok).toBe(false);
    expect(validateChatErrorPayload(null).ok).toBe(false);
    expect(validateLeaderboardErrorPayload({ error: "jump" }).ok).toBe(true);
    expect(validateLeaderboardErrorPayload({}).ok).toBe(false);
    expect(validateLeaderboardErrorPayload(null).ok).toBe(false);
  });

  it("validates leaderboard submit + update", () => {
    expect(
      validateLeaderboardSubmitPayload({ prestige: 1, bosses: 2, level: 3 })
        .ok,
    ).toBe(true);
    expect(validateLeaderboardSubmitPayload(null).ok).toBe(false);
    expect(
      validateLeaderboardSubmitPayload({ prestige: -1, bosses: 2, level: 3 })
        .ok,
    ).toBe(false);
    expect(
      validateLeaderboardSubmitPayload({ prestige: 1, bosses: 1.5, level: 3 })
        .ok,
    ).toBe(false);
    expect(
      validateLeaderboardSubmitPayload({ prestige: 1, bosses: 2, level: 0 })
        .ok,
    ).toBe(false);
    const entry = {
      userId: "u1",
      username: "Ada",
      prestige: 1,
      bosses: 2,
      level: 3,
      timestamp: 10,
    };
    expect(validateLeaderboardEntry(entry).ok).toBe(true);
    expect(validateLeaderboardEntry(null).ok).toBe(false);
    expect(validateLeaderboardEntry({ ...entry, userId: "" }).ok).toBe(false);
    expect(validateLeaderboardEntry({ ...entry, username: "" }).ok).toBe(
      false,
    );
    expect(validateLeaderboardEntry({ ...entry, prestige: -1 }).ok).toBe(
      false,
    );
    expect(validateLeaderboardEntry({ ...entry, bosses: 1.2 }).ok).toBe(false);
    expect(validateLeaderboardEntry({ ...entry, level: 0 }).ok).toBe(false);
    expect(validateLeaderboardEntry({ ...entry, timestamp: -1 }).ok).toBe(
      false,
    );
    expect(
      validateLeaderboardUpdatePayload({ entries: [entry] }).ok,
    ).toBe(true);
    expect(validateLeaderboardUpdatePayload(null).ok).toBe(false);
    expect(validateLeaderboardUpdatePayload({ entries: "x" }).ok).toBe(false);
    expect(
      validateLeaderboardUpdatePayload({
        entries: [{ ...entry, userId: "" }],
      }).ok,
    ).toBe(false);
  });

  it("validates friend payloads", () => {
    expect(validateFriendUsernamePayload({ username: "Ada" }).ok).toBe(true);
    expect(validateFriendUsernamePayload({ username: "" }).ok).toBe(false);
    expect(validateFriendUsernamePayload(null).ok).toBe(false);

    const friend = { userId: "u1", username: "Ada", added: 1 };
    expect(validateFriendEntry(friend).ok).toBe(true);
    expect(validateFriendEntry(null).ok).toBe(false);
    expect(validateFriendEntry({ ...friend, userId: "" }).ok).toBe(false);
    expect(validateFriendEntry({ ...friend, username: "" }).ok).toBe(false);
    expect(validateFriendEntry({ ...friend, added: -1 }).ok).toBe(false);

    const request = {
      fromUserId: "a",
      fromUsername: "Ada",
      toUserId: "b",
      toUsername: "Bob",
      timestamp: 1,
    };
    expect(validateFriendRequestEntry(request).ok).toBe(true);
    expect(validateFriendRequestEntry(null).ok).toBe(false);
    expect(validateFriendRequestEntry({ ...request, fromUserId: "" }).ok).toBe(
      false,
    );
    expect(
      validateFriendRequestEntry({ ...request, fromUsername: "" }).ok,
    ).toBe(false);
    expect(validateFriendRequestEntry({ ...request, toUserId: "" }).ok).toBe(
      false,
    );
    expect(validateFriendRequestEntry({ ...request, toUsername: "" }).ok).toBe(
      false,
    );
    expect(validateFriendRequestEntry({ ...request, timestamp: -1 }).ok).toBe(
      false,
    );

    expect(
      validateFriendUpdatePayload({
        list: [friend],
        pending: [request],
        sent: [request],
      }).ok,
    ).toBe(true);
    expect(validateFriendUpdatePayload(null).ok).toBe(false);
    expect(
      validateFriendUpdatePayload({ list: [], pending: [], sent: "x" }).ok,
    ).toBe(false);
    expect(
      validateFriendUpdatePayload({
        list: [{ ...friend, userId: "" }],
        pending: [],
        sent: [],
      }).ok,
    ).toBe(false);
    expect(
      validateFriendUpdatePayload({
        list: [],
        pending: [{ ...request, fromUserId: "" }],
        sent: [],
      }).ok,
    ).toBe(false);
    expect(
      validateFriendUpdatePayload({
        list: [],
        pending: [],
        sent: [{ ...request, toUserId: "" }],
      }).ok,
    ).toBe(false);

    expect(validateFriendErrorPayload({ error: "nope" }).ok).toBe(true);
    expect(validateFriendErrorPayload({ error: "" }).ok).toBe(false);
    expect(validateFriendErrorPayload(null).ok).toBe(false);
  });

  it("validates guild payloads", () => {
    expect(validateGuildCreatePayload({ name: "Hüter" }).ok).toBe(true);
    expect(validateGuildCreatePayload({ name: "" }).ok).toBe(false);
    expect(validateGuildCreatePayload(null).ok).toBe(false);

    expect(validateGuildUsernamePayload({ username: "Ada" }).ok).toBe(true);
    expect(validateGuildUsernamePayload({ username: "" }).ok).toBe(false);
    expect(validateGuildUsernamePayload(null).ok).toBe(false);

    expect(validateGuildAcceptDeclinePayload({ guildId: "g1" }).ok).toBe(true);
    expect(validateGuildAcceptDeclinePayload({ guildId: "" }).ok).toBe(false);
    expect(validateGuildAcceptDeclinePayload(null).ok).toBe(false);

    const member = {
      userId: "u1",
      username: "Ada",
      role: "owner" as const,
      joinedAt: 1,
    };
    expect(validateGuildMember(member).ok).toBe(true);
    expect(validateGuildMember({ ...member, role: "member" }).ok).toBe(true);
    expect(validateGuildMember(null).ok).toBe(false);
    expect(validateGuildMember({ ...member, userId: "" }).ok).toBe(false);
    expect(validateGuildMember({ ...member, username: "" }).ok).toBe(false);
    expect(validateGuildMember({ ...member, role: "admin" }).ok).toBe(false);
    expect(validateGuildMember({ ...member, joinedAt: -1 }).ok).toBe(false);

    const invite = {
      guildId: "g1",
      guildName: "Hüter",
      fromUserId: "a",
      fromUsername: "Ada",
      toUserId: "b",
      toUsername: "Bob",
      timestamp: 1,
    };
    expect(validateGuildInviteEntry(invite).ok).toBe(true);
    expect(validateGuildInviteEntry(null).ok).toBe(false);
    expect(validateGuildInviteEntry({ ...invite, guildId: "" }).ok).toBe(false);
    expect(validateGuildInviteEntry({ ...invite, guildName: "" }).ok).toBe(
      false,
    );
    expect(validateGuildInviteEntry({ ...invite, fromUserId: "" }).ok).toBe(
      false,
    );
    expect(validateGuildInviteEntry({ ...invite, fromUsername: "" }).ok).toBe(
      false,
    );
    expect(validateGuildInviteEntry({ ...invite, toUserId: "" }).ok).toBe(
      false,
    );
    expect(validateGuildInviteEntry({ ...invite, toUsername: "" }).ok).toBe(
      false,
    );
    expect(validateGuildInviteEntry({ ...invite, timestamp: -1 }).ok).toBe(
      false,
    );

    const guild = {
      id: "g1",
      name: "Hüter",
      ownerId: "a",
      createdAt: 1,
    };
    expect(validateGuildInfo(null).ok).toBe(true);
    expect(validateGuildInfo(guild).ok).toBe(true);
    expect(validateGuildInfo("x").ok).toBe(false);
    expect(validateGuildInfo({ ...guild, id: "" }).ok).toBe(false);
    expect(validateGuildInfo({ ...guild, name: "" }).ok).toBe(false);
    expect(validateGuildInfo({ ...guild, ownerId: "" }).ok).toBe(false);
    expect(validateGuildInfo({ ...guild, createdAt: -1 }).ok).toBe(false);

    expect(
      validateGuildUpdatePayload({
        guild: null,
        members: [],
        invites: [],
        outgoingInvites: [],
      }).ok,
    ).toBe(true);
    expect(
      validateGuildUpdatePayload({
        guild,
        members: [member],
        invites: [invite],
        outgoingInvites: [invite],
      }).ok,
    ).toBe(true);
    expect(validateGuildUpdatePayload(null).ok).toBe(false);
    expect(
      validateGuildUpdatePayload({
        guild: { ...guild, id: "" },
        members: [],
        invites: [],
        outgoingInvites: [],
      }).ok,
    ).toBe(false);
    expect(
      validateGuildUpdatePayload({
        guild: null,
        members: "x",
        invites: [],
        outgoingInvites: [],
      }).ok,
    ).toBe(false);
    expect(
      validateGuildUpdatePayload({
        guild: null,
        members: [{ ...member, userId: "" }],
        invites: [],
        outgoingInvites: [],
      }).ok,
    ).toBe(false);
    expect(
      validateGuildUpdatePayload({
        guild: null,
        members: [],
        invites: [{ ...invite, guildId: "" }],
        outgoingInvites: [],
      }).ok,
    ).toBe(false);
    expect(
      validateGuildUpdatePayload({
        guild: null,
        members: [],
        invites: [],
        outgoingInvites: [{ ...invite, toUserId: "" }],
      }).ok,
    ).toBe(false);

    expect(validateGuildErrorPayload({ error: "fail" }).ok).toBe(true);
    expect(validateGuildErrorPayload({ error: "" }).ok).toBe(false);
    expect(validateGuildErrorPayload(null).ok).toBe(false);
  });
});
