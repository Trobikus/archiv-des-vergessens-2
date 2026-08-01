import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { WS_EVENTS } from "@adv/protocol";
import { afterEach, describe, expect, it } from "vitest";
import WebSocket from "ws";

import { loadConfig } from "./config";
import { createGameServer, type RunningServer } from "./main";

type WsFrame = { type: string; payload: Record<string, unknown> };

function attachInbox(ws: WebSocket): {
  waitFor: (types: readonly string[], timeoutMs?: number) => Promise<WsFrame>;
} {
  const queue: WsFrame[] = [];
  const waiters: Array<{
    types: readonly string[];
    resolve: (frame: WsFrame) => void;
    reject: (err: Error) => void;
    timer: ReturnType<typeof setTimeout>;
  }> = [];

  ws.on("message", (data) => {
    const text =
      typeof data === "string"
        ? data
        : Buffer.isBuffer(data)
          ? data.toString("utf8")
          : Array.isArray(data)
            ? Buffer.concat(data).toString("utf8")
            : Buffer.from(data).toString("utf8");
    const parsed = JSON.parse(text) as WsFrame;
    const waiterIdx = waiters.findIndex((w) => w.types.includes(parsed.type));
    if (waiterIdx >= 0) {
      const waiter = waiters[waiterIdx];
      if (waiter !== undefined) {
        clearTimeout(waiter.timer);
        waiters.splice(waiterIdx, 1);
        waiter.resolve(parsed);
        return;
      }
    }
    queue.push(parsed);
  });

  return {
    waitFor(types, timeoutMs = 5_000) {
      const queuedIdx = queue.findIndex((frame) => types.includes(frame.type));
      if (queuedIdx >= 0) {
        const frame = queue.splice(queuedIdx, 1)[0];
        if (frame !== undefined) {
          return Promise.resolve(frame);
        }
      }
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          const idx = waiters.findIndex((w) => w.timer === timer);
          if (idx >= 0) {
            waiters.splice(idx, 1);
          }
          reject(new Error(`timeout waiting for ${types.join(",")}`));
        }, timeoutMs);
        waiters.push({ types, resolve, reject, timer });
      });
    },
  };
}

describe("phase 7 social server", () => {
  const servers: RunningServer[] = [];
  const dirs: string[] = [];

  afterEach(async () => {
    while (servers.length > 0) {
      const server = servers.pop();
      if (server !== undefined) {
        await server.close();
      }
    }
    while (dirs.length > 0) {
      const dir = dirs.pop();
      if (dir !== undefined) {
        rmSync(dir, { recursive: true, force: true });
      }
    }
  }, 15_000);

  async function startServer(): Promise<RunningServer> {
    const dir = mkdtempSync(join(tmpdir(), "adv2-social-"));
    dirs.push(dir);
    const config = loadConfig({
      PORT: "0",
      DATA_DIR: dir,
      ALLOWED_ORIGINS: "http://localhost:5173",
    });
    const server = createGameServer(config);
    await new Promise<void>((resolve) => {
      server.httpServer.listen(0, () => {
        resolve();
      });
    });
    const address = server.httpServer.address();
    if (address === null || typeof address === "string") {
      throw new Error("expected TCP address");
    }
    Object.defineProperty(server, "port", { value: address.port });
    servers.push(server);
    return server;
  }

  function connect(server: RunningServer): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(`ws://127.0.0.1:${String(server.port)}`, {
        origin: "http://localhost:5173",
      });
      ws.once("open", () => {
        resolve(ws);
      });
      ws.once("error", reject);
    });
  }

  it("broadcasts global chat and returns history", async () => {
    const server = await startServer();
    const ws = await connect(server);
    const inbox = attachInbox(ws);

    ws.send(
      JSON.stringify({
        type: WS_EVENTS.AUTH,
        payload: { userId: "guest_chat_1", username: "Chatty" },
      }),
    );
    await inbox.waitFor([WS_EVENTS.AUTH_SUCCESS]);
    await inbox.waitFor([WS_EVENTS.LEADERBOARD_UPDATE]);

    ws.send(
      JSON.stringify({
        type: WS_EVENTS.CHAT_GLOBAL,
        payload: { message: "Hallo Archiv" },
      }),
    );
    const broadcast = await inbox.waitFor([WS_EVENTS.CHAT_GLOBAL_MESSAGE]);
    expect(broadcast.payload["message"]).toBe("Hallo Archiv");
    expect(broadcast.payload["player"]).toBe("Chatty");
    expect(broadcast.payload["type"]).toBe("global");

    ws.send(
      JSON.stringify({
        type: WS_EVENTS.CHAT_GET_HISTORY,
        payload: {},
      }),
    );
    const history = await inbox.waitFor([WS_EVENTS.CHAT_HISTORY]);
    const messages = history.payload["messages"] as unknown[];
    expect(Array.isArray(messages)).toBe(true);
    expect(messages.length).toBeGreaterThanOrEqual(1);

    ws.close();
  }, 15_000);

  it("rejects guild chat history and guest leaderboard submit", async () => {
    const server = await startServer();
    const ws = await connect(server);
    const inbox = attachInbox(ws);

    ws.send(
      JSON.stringify({
        type: WS_EVENTS.AUTH,
        payload: { userId: "guest_lb_1", username: "Ranker" },
      }),
    );
    await inbox.waitFor([WS_EVENTS.AUTH_SUCCESS]);
    await inbox.waitFor([WS_EVENTS.LEADERBOARD_UPDATE]);

    ws.send(
      JSON.stringify({
        type: WS_EVENTS.CHAT_GET_HISTORY,
        payload: { guildId: "guild_x" },
      }),
    );
    const chatErr = await inbox.waitFor([WS_EVENTS.CHAT_ERROR]);
    expect(String(chatErr.payload["error"])).toMatch(/Gilden/i);

    ws.send(
      JSON.stringify({
        type: WS_EVENTS.LEADERBOARD_GET,
        payload: {},
      }),
    );
    const lb = await inbox.waitFor([WS_EVENTS.LEADERBOARD_UPDATE]);
    expect(lb.payload["entries"]).toEqual([]);

    ws.send(
      JSON.stringify({
        type: WS_EVENTS.LEADERBOARD_SUBMIT,
        payload: { prestige: 1, bosses: 2, level: 3 },
      }),
    );
    const submitErr = await inbox.waitFor([WS_EVENTS.LEADERBOARD_ERROR]);
    expect(String(submitErr.payload["error"])).toMatch(/authentifiziert/i);

    ws.close();
  }, 15_000);
});
