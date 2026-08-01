import { createEventBus, createStore } from "@adv/core";
import { WS_EVENTS } from "@adv/protocol";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createInitialGameState } from "../state/game-state";
import { createAuthService } from "./auth-service";
import { createChatService } from "./chat-service";
import { createFriendService } from "./friend-service";
import { createGameSession } from "./game-session";
import { createLeaderboardService } from "./leaderboard-service";
import { createMemorySaveStorage } from "./save-storage";
import type { WsClient, WsClientStatus } from "./ws-client";

function createListenerWs(): WsClient & {
  emit(type: string, payload: Record<string, unknown>): void;
} {
  let status: WsClientStatus = "open";
  const handlers = new Map<
    string,
    Set<(payload: Record<string, unknown>) => void>
  >();
  return {
    url: "ws://fake",
    status: () => status,
    connect() {
      status = "open";
      return Promise.resolve();
    },
    close() {
      status = "disconnected";
    },
    send() {
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
        set?.delete(handler);
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

  it("friend add simulates accept for NPC names after 5s", () => {
    vi.useFakeTimers();
    const base = createInitialGameState();
    const store = createStore({
      initialState: {
        ...base,
        hero: { ...base.hero, name: "Tester" },
      },
    });
    const eventBus = createEventBus();
    const friends = createFriendService(store, eventBus);

    const result = friends.addFriend("Eldor");
    expect(result.success).toBe(true);
    expect(friends.getSentRequests()).toHaveLength(1);
    expect(friends.getFriends()).toHaveLength(0);

    vi.advanceTimersByTime(5_000);

    expect(friends.getSentRequests()).toHaveLength(0);
    expect(friends.getFriends()).toHaveLength(1);
    expect(friends.getFriends()[0]?.name).toBe("Eldor");

    friends.destroy();
    eventBus.destroy();
    store.destroy();
  });

  it("friend accept/decline/cancel/remove work locally", async () => {
    const session = await bootSession();
    session.friends.simulateIncomingRequest("Chronos");
    expect(session.friends.getPendingRequests()).toHaveLength(1);

    expect(session.friends.declineFriendRequest("Chronos").success).toBe(true);
    expect(session.friends.getPendingRequests()).toHaveLength(0);

    session.friends.simulateIncomingRequest("Aria");
    expect(session.friends.acceptFriend("Aria").success).toBe(true);
    expect(session.friends.getFriends().some((f) => f.name === "Aria")).toBe(
      true,
    );

    expect(session.friends.addFriend("Luminos").success).toBe(true);
    expect(session.friends.cancelSentRequest("Luminos").success).toBe(true);
    expect(session.friends.getSentRequests()).toHaveLength(0);

    expect(session.friends.removeFriend("Aria").success).toBe(true);
    expect(session.friends.getFriends()).toHaveLength(0);
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

  it("chat falls back to local global messages when offline", async () => {
    const session = await bootSession();
    expect(session.ws.status()).not.toBe("open");

    const result = session.chat.sendGlobal("Hallo Archiv");
    expect(result.success).toBe(true);
    const messages = session.chat.getGlobalMessages();
    expect(messages).toHaveLength(1);
    expect(messages[0]?.message).toBe("Hallo Archiv");
    expect(messages[0]?.player).toBe("Tester");
    expect(messages[0]?.type).toBe("global");

    expect(session.chat.sendClan("Clan hallo").success).toBe(true);
    expect(session.chat.getClanMessages()[0]?.type).toBe("clan");
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
      chatErrors.push(String((data as { error: string }).error));
    });
    const lbSub = eventBus.subscribe("leaderboard:error", (data) => {
      lbErrors.push(String((data as { error: string }).error));
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
