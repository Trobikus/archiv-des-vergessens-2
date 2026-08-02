import { createServer, type Server as HttpServer } from "node:http";
import { pathToFileURL } from "node:url";

import { createLogger } from "@adv/core";
import { SAVE_SCHEMA_VERSION } from "@adv/protocol";
import { WebSocketServer, type WebSocket } from "ws";

import { loadConfig, type ServerConfig } from "./config";
import { openDatabase, type AppDatabase } from "./db/open";
import { createRateLimiter } from "./modules/auth/rate-limit";
import { sendChatHistory } from "./modules/chat/handlers";
import { sendFriendUpdate } from "./modules/friends/handlers";
import { sendGuildUpdate } from "./modules/guild/handlers";
import { sendLeaderboardUpdate } from "./modules/leaderboard/handlers";
import { isOriginAllowed, resolveClientIp } from "./net/origins";
import { routeMessage } from "./net/router";
import { createSessionStore, type ClientSession } from "./net/session";
import { hasActiveRegisteredSession } from "./modules/auth/session-guard";

const log = createLogger("server");

export function bootBanner(): string {
  return `Boot OK (save schema v${String(SAVE_SCHEMA_VERSION)})`;
}

export type RunningServer = {
  readonly httpServer: HttpServer;
  readonly wss: WebSocketServer;
  readonly db: AppDatabase;
  readonly config: ServerConfig;
  readonly port: number;
  close(): Promise<void>;
};

export function createGameServer(
  config: ServerConfig = loadConfig(),
): RunningServer {
  const { db, stmts } = openDatabase(config.dbFile);
  const sessions = createSessionStore();
  const rateLimiter = createRateLimiter();

  const httpServer = createServer((_req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Archiv des Vergessens v2 — Multiplayer-Server läuft.\n");
  });

  const wss = new WebSocketServer({
    server: httpServer,
    maxPayload: 256 * 1024,
    verifyClient: (info, cb) => {
      const originHeader = info.req.headers.origin;
      const origin =
        info.origin.length > 0
          ? info.origin
          : typeof originHeader === "string"
            ? originHeader
            : undefined;
      if (isOriginAllowed(origin, config.allowedOrigins)) {
        cb(true);
      } else {
        log.warn(`rejected origin: ${origin ?? "unknown"}`);
        cb(false, 403, "Forbidden");
      }
    },
  });

  const routerDeps = {
    stmts,
    db,
    rateLimiter,
    cloudVersion: config.cloudVersion,
    broadcastClients: () => wss.clients,
    forEachSession: (fn: (ws: WebSocket, session: ClientSession) => void) => {
      sessions.forEach(fn);
    },
    onAuthenticated: (ws: WebSocket) => {
      sendChatHistory(ws, stmts);
      sendLeaderboardUpdate(ws, stmts);
      const session = sessions.get(ws);
      if (
        session !== undefined &&
        session.userId !== null &&
        hasActiveRegisteredSession(session, stmts)
      ) {
        sendFriendUpdate(ws, stmts, session.userId);
        sendGuildUpdate(ws, stmts, session.userId);
      }
    },
  };

  wss.on("connection", (ws: WebSocket, req) => {
    const clientIp = resolveClientIp(
      req.headers,
      req.socket.remoteAddress,
      config.trustProxy,
    );
    sessions.set(ws, {
      userId: null,
      username: "Anonymus",
      sessionToken: null,
      isGuest: false,
      clientIp,
    });

    ws.on("message", (data, isBinary) => {
      if (isBinary) {
        return;
      }
      const session = sessions.get(ws);
      if (session === undefined) {
        return;
      }
      const raw =
        typeof data === "string"
          ? data
          : Buffer.isBuffer(data)
            ? data.toString("utf8")
            : Array.isArray(data)
              ? Buffer.concat(data).toString("utf8")
              : Buffer.from(data).toString("utf8");
      routeMessage(ws, raw, session, routerDeps);
    });

    ws.on("close", () => {
      sessions.delete(ws);
    });
  });

  return {
    httpServer,
    wss,
    db,
    config,
    port: config.port,
    async close() {
      await new Promise<void>((resolve, reject) => {
        wss.close((err) => {
          if (err) {
            reject(err);
            return;
          }
          httpServer.close((httpErr) => {
            if (httpErr) {
              reject(httpErr);
              return;
            }
            db.close();
            resolve();
          });
        });
      });
    },
  };
}

export async function listen(
  server: RunningServer = createGameServer(),
): Promise<RunningServer> {
  await new Promise<void>((resolve) => {
    server.httpServer.listen(server.port, () => {
      resolve();
    });
  });
  log.info(`${bootBanner()} · ws://localhost:${String(server.port)}`);
  return server;
}

export function main(): void {
  void listen().catch((cause: unknown) => {
    log.error(
      `server failed: ${cause instanceof Error ? cause.message : String(cause)}`,
    );
    process.exitCode = 1;
  });
}

/** True when this module is the process entrypoint (not imported by tests). */
export function isExecutedDirectly(
  entryPath: string | undefined = process.argv[1],
  moduleUrl: string = import.meta.url,
): boolean {
  if (entryPath === undefined) {
    return false;
  }
  return moduleUrl === pathToFileURL(entryPath).href;
}

if (isExecutedDirectly()) {
  main();
}
