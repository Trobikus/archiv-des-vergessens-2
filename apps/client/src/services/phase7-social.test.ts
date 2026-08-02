import { createEventBus, createStore } from "@adv/core";
import { WS_EVENTS } from "@adv/protocol";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createInitialGameState } from "../state/game-state";
import { createAuthService } from "./auth-service";
import { createChatService } from "./chat-service";
import { createFriendService } from "./friend-service";
import { createGameSession } from "./game-session";
import { createGuildService } from "./guild-service";
import { createLeaderboardService } from "./leaderboard-service";
import { createMemorySaveStorage } from "./save-storage";
import type { WsClient, WsClientStatus } from "./ws-client";

function createListenerWs(): WsClient & {
  emit(type: string, payload: Record<string, unknown>): void;
  readonly sent: Array<{ type: string; payload: Record<string, unknown> }>;
  setStatus(next: WsClientStatus): void;
} {
  let status: WsClientStatus = "open";
  const handlers = new Map<
    string,
    Set<(payload: Record<string, unknown>) => void>
  >();
  const sent: Array<{ type: string; payload: Record<string, unknown> }> = [];
  return {
    url: "ws://fake",
    sent,
    status: () => status,
    setStatus(next) {
      status = next;
    },
    connect() {
      status = "open";
      return Promise.resolve();
    },
    close() {
      status = "disconnected";
    },
    send(type, payload = {}) {
      if (status !== "open") {
        return false;
      }
      sent.push({ type, payload });
      return true;
    },
    on(type, handler) {
      let set = handlers.get(type);
      if (set === undefined) {
        set = new Set();
        handlers.set(type, set);
      }
      set.add(handler);
      return () => {
        set.delete(handler);
      };
    },
    onStatus() {
      return () => undefined;
    },
    request() {
      return Promise.reject(new Error("not used"));
    },
    emit(type, payload) {
      const set = handlers.get(type);
      if (set === undefined) {
        return;
      }
      for (const handler of set) {
        handler(payload);
      }
    },
  };
}

function createRegisteredAuth(ws: WsClient) {
  const auth = createAuthService({
    ws,
    storage: {
      getItem: () => null,
      setItem: () => undefined,
      removeItem: () => undefined,
    },
  });
  auth.store.setState((prev) => ({
    ...prev,
    user: {
      id: "u1",
      username: "Tester",
      email: "t@example.com",
      avatar: "A",
      createdAt: 1,
      lastLogin: 1,
      isGuest: false,
    },
    token: "tok",
    ready: true,
    lastError: null,
  }));
  return auth;
}

describe("phase 7 social services", () => {
  const sessions: Array<ReturnType<typeof createGameSession>> = [];

  afterEach(() => {
    for (const session of sessions) {
      session.destroy();
    }
    sessions.length = 0;
    vi.useRealTimers();
  });

  async function bootSession() {
    const session = createGameSession({
      storage: createMemorySaveStorage(),
      useIndexedDb: false,
      autosaveMs: 60_000,
      connectNetwork: false,
    });
    sessions.push(session);
    await session.boot();
    session.store.setState((prev) => ({
      ...prev,
      hero: { ...prev.hero, name: "Tester" },
    }));
    return session;
  }

  it("friend actions send wire events when registered", () => {
    const store = createStore({ initialState: createInitialGameState() });
    const eventBus = createEventBus();
    const ws = createListenerWs();
    const auth = createRegisteredAuth(ws);
    const friends = createFriendService(store, eventBus, { ws, auth });

    expect(friends.addFriend("Ada").success).toBe(true);
    expect(ws.sent.some((f) => f.type === WS_EVENTS.FRIEND_REQUEST)).toBe(true);
    expect(friends.acceptFriend("Ada").success).toBe(true);
    expect(friends.declineFriendRequest("Ada").success).toBe(true);
    expect(friends.cancelSentRequest("Ada").success).toBe(true);
    expect(friends.removeFriend("Ada").success).toBe(true);

    friends.destroy();
    auth.destroy();
    eventBus.destroy();
    store.destroy();
  });

  it("friend actions reject without registered online session", async () => {
    const session = await bootSession();
    expect(session.friends.addFriend("Ada").success).toBe(false);
    expect(session.friends.acceptFriend("Ada").success).toBe(false);
    expect(session.friends.removeFriend("Ada").success).toBe(false);
  });

  it("clan recruit costs scale and deduct particles", async () => {
    const session = await bootSession();
    expect(session.clan.getRecruitCost("collector")).toBe(10);

    session.resources.addParticles(100);
    expect(session.clan.recruitMember("collector")).toBe(true);
    expect(session.clan.getMembers()).toHaveLength(1);
    expect(session.clan.getMembers()[0]?.role).toBe("collector");
    expect(session.clan.getMembers()[0]?.baseCollectRate).toBe(2.0);
    expect(session.store.getState().resources.particles).toBe(90n);
    expect(session.clan.getRecruitCost("collector")).toBe(11);

    expect(session.clan.recruitMember("collector")).toBe(true);
    expect(session.clan.getRecruitCost("collector")).toBe(13);
    expect(session.clan.getRecruitCost("weaver")).toBe(25);
  });

  it("chat rejects send when offline", async () => {
    const session = await bootSession();
    expect(session.ws.status()).not.toBe("open");

    const result = session.chat.sendGlobal("Hallo Archiv");
    expect(result.success).toBe(false);
    expect(session.chat.getGlobalMessages()).toHaveLength(0);
    expect(session.chat.sendClan("Gilde hallo").success).toBe(false);
    expect(session.chat.getClanMessages()).toHaveLength(0);
  });

  it("leaderboard syncs prestige from ewigeMneme and bosses from bossProgress", async () => {
    const session = await bootSession();
    session.store.setState((prev) => ({
      ...prev,
      resources: { ...prev.resources, ewigeMneme: 3n },
      hero: {
        ...prev.hero,
        level: 12,
        prestige: { bossProgress: 7, defeatedBosses: [1, 2, 3, 4, 5, 6, 7] },
      },
    }));

    session.leaderboard.syncFromState();
    const records = session.leaderboard.getRecords();
    expect(records.highestPrestige).toBe(3);
    expect(records.totalBossesDefeated).toBe(7);
    expect(records.highestLevel).toBe(12);
    expect(records.highestChapterReached).toBe(1);

    session.leaderboard.addEntry({ prestige: 5, bosses: 25, level: 20 });
    const updated = session.leaderboard.getRecords();
    expect(updated.highestPrestige).toBe(5);
    expect(updated.totalBossesDefeated).toBe(25);
    expect(updated.highestLevel).toBe(20);
    expect(updated.highestChapterReached).toBe(3);
  });

  it("applies friend:update and guild:update from the wire", () => {
    const store = createStore({ initialState: createInitialGameState() });
    const eventBus = createEventBus();
    const ws = createListenerWs();
    const auth = createRegisteredAuth(ws);
    const friends = createFriendService(store, eventBus, { ws, auth });
    const guild = createGuildService(store, eventBus, { ws, auth });
    const chat = createChatService(store, eventBus, ws);

    ws.emit(WS_EVENTS.FRIEND_UPDATE, {
      list: [{ userId: "u2", username: "Ada", added: 10 }],
      pending: [],
      sent: [],
    });
    expect(friends.getFriends()).toHaveLength(1);
    expect(friends.getFriends()[0]?.name).toBe("Ada");

    ws.emit(WS_EVENTS.GUILD_UPDATE, {
      guild: {
        id: "guild_1",
        name: "Hüter",
        ownerId: "u1",
        createdAt: 1,
      },
      members: [
        { userId: "u1", username: "Tester", role: "owner", joinedAt: 1 },
      ],
      invites: [],
      outgoingInvites: [],
    });
    expect(guild.getGuild()?.name).toBe("Hüter");

    ws.emit(WS_EVENTS.CHAT_GUILD_MESSAGE, {
      id: "c1",
      player: "Tester",
      message: "Gildenruf",
      timestamp: 20,
      type: "guild",
      guildId: "guild_1",
    });
    expect(chat.getClanMessages()[0]?.message).toBe("Gildenruf");
    expect(chat.getClanMessages()[0]?.type).toBe("guild");

    friends.destroy();
    guild.destroy();
    chat.destroy();
    auth.destroy();
    eventBus.destroy();
    store.destroy();
  });

  it("surfaces chat:error and leaderboard:error from the wire", () => {
    const store = createStore({ initialState: createInitialGameState() });
    const eventBus = createEventBus();
    const ws = createListenerWs();
    const auth = createAuthService({
      ws,
      storage: {
        getItem: () => null,
        setItem: () => undefined,
        removeItem: () => undefined,
      },
    });
    const chat = createChatService(store, eventBus, ws);
    const leaderboard = createLeaderboardService(store, eventBus, ws, auth, {
      playTimeIntervalMs: 60_000,
    });

    const chatErrors: string[] = [];
    const lbErrors: string[] = [];
    const chatSub = eventBus.subscribe("chat:error", (data) => {
      chatErrors.push((data as { error: string }).error);
    });
    const lbSub = eventBus.subscribe("leaderboard:error", (data) => {
      lbErrors.push((data as { error: string }).error);
    });

    ws.emit(WS_EVENTS.CHAT_ERROR, { error: "Nicht authentifiziert." });
    ws.emit(WS_EVENTS.LEADERBOARD_ERROR, {
      error: "Ungültiger Highscore-Sprung.",
    });

    expect(chat.lastError()).toBe("Nicht authentifiziert.");
    expect(leaderboard.lastError()).toBe("Ungültiger Highscore-Sprung.");
    expect(chatErrors).toEqual(["Nicht authentifiziert."]);
    expect(lbErrors).toEqual(["Ungültiger Highscore-Sprung."]);

    chat.clearError();
    leaderboard.clearError();
    expect(chat.lastError()).toBeNull();
    expect(leaderboard.lastError()).toBeNull();

    eventBus.unsubscribe(chatSub);
    eventBus.unsubscribe(lbSub);
    chat.destroy();
    leaderboard.destroy();
    auth.destroy();
    eventBus.destroy();
    store.destroy();
  });

  it("clan expedition and raid complete offline", async () => {
    const session = await bootSession();
    session.resources.addParticles(100);
    expect(session.clan.recruitMember("collector")).toBe(true);
    const memberId = session.clan.getMembers()[0]?.id;
    expect(memberId).toBeTypeOf("number");

    expect(session.clan.startExpedition(memberId as number, 1)).toBe(true);
    expect(session.clan.isOnExpedition(memberId as number)).toBe(true);
    session.clan.processTick(1_500);
    expect(session.clan.isOnExpedition(memberId as number)).toBe(false);

    const raid = session.clan.startClanRaid([memberId as number]);
    expect(raid.success).toBe(true);
    expect(session.store.getState().clan.raid.active).toBe(true);
    session.clan.processTick(301_000);
    expect(session.store.getState().clan.raid.durationSeconds).toBe(0);
    const claim = session.clan.claimRaidReward();
    expect(claim.success).toBe(true);
    expect(session.store.getState().clan.raid.active).toBe(false);
  });

  it("applies clan offline production in boot report", async () => {
    const storage = createMemorySaveStorage();
    let now = 100_000;
    const first = createGameSession({
      storage,
      now: () => now,
      useIndexedDb: false,
      autosaveMs: 60_000,
      connectNetwork: false,
    });
    sessions.push(first);
    await first.boot();
    first.resources.addParticles(100);
    expect(first.clan.recruitMember("collector")).toBe(true);
    expect(await first.saveNow()).toBe(true);
    first.destroy();
    sessions.pop();

    now = 100_000 + 60_000;
    const second = createGameSession({
      storage,
      now: () => now,
      useIndexedDb: false,
      autosaveMs: 60_000,
      connectNetwork: false,
    });
    sessions.push(second);
    const report = await second.boot();
    expect(report).not.toBeNull();
    expect((report?.clanParticlesGained ?? 0) > 0).toBe(true);
  });
});
