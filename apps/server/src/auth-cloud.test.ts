import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  createDefaultHeroSave,
  createDefaultSettingsSave,
  createDefaultStorySave,
  createSaveEnvelope,
} from "@adv/protocol";
import { afterEach, describe, expect, it } from "vitest";
import WebSocket from "ws";

import { loadConfig } from "./config";
import {
  generateSalt,
  hashPassword,
  verifyPassword,
} from "./crypto/password";
import { createGameServer, type RunningServer } from "./main";

function samplePayload() {
  return {
    resources: {
      particles: "0",
      totalParticles: "0",
      mnemeFragmente: "0",
      totalMnemeFragmente: "0",
      ewigeMneme: "0",
    },
    idleGenerators: {
      gedankenArchiv: {
        level: 0,
        baseCost: 10,
        costMultiplier: 1.15,
        baseYield: 1,
        upgrades: { focusBonus: 0 },
      },
    },
    gather: { clickPowerLevel: 0 },
    hero: createDefaultHeroSave(),
    story: createDefaultStorySave(),
    settings: createDefaultSettingsSave(),
    meta: { lastActiveAt: Date.now() },
  };
}

async function waitForMessage(
  ws: WebSocket,
  types: readonly string[],
  timeoutMs = 5_000,
): Promise<{ type: string; payload: Record<string, unknown> }> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`timeout waiting for ${types.join(",")}`));
    }, timeoutMs);
    const onMessage = (data: WebSocket.RawData) => {
      const text =
        typeof data === "string"
          ? data
          : Buffer.isBuffer(data)
            ? data.toString("utf8")
            : Array.isArray(data)
              ? Buffer.concat(data).toString("utf8")
              : Buffer.from(data).toString("utf8");
      const parsed = JSON.parse(text) as {
        type: string;
        payload: Record<string, unknown>;
      };
      if (types.includes(parsed.type)) {
        clearTimeout(timer);
        ws.off("message", onMessage);
        resolve(parsed);
      }
    };
    ws.on("message", onMessage);
  });
}

describe("password crypto", () => {
  it("hashes and verifies with v1 PBKDF2 params", () => {
    const salt = generateSalt();
    const hash = hashPassword("secret12", salt);
    expect(hash).toHaveLength(128);
    expect(verifyPassword("secret12", salt, hash)).toBe(true);
    expect(verifyPassword("wrong", salt, hash)).toBe(false);
  });
});

describe("server auth + cloud", () => {
  const servers: RunningServer[] = [];
  const dirs: string[] = [];

  afterEach(async () => {
    for (const server of servers.splice(0)) {
      await server.close();
    }
    for (const dir of dirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  async function startServer(): Promise<RunningServer> {
    const dir = mkdtempSync(join(tmpdir(), "adv2-server-"));
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

  it("registers, cloudsaves, and rejects superseded token", async () => {
    const server = await startServer();
    const first = await connect(server);
    const username = `keeper_${Date.now().toString(36)}`;
    const email = `${username}@example.com`;

    first.send(
      JSON.stringify({
        type: "auth:register",
        payload: { username, email, password: "secret12" },
      }),
    );
    const registered = await waitForMessage(first, ["auth:register:success"]);
    const token = registered.payload["token"];
    expect(typeof token).toBe("string");

    const envelope = createSaveEnvelope(samplePayload(), Date.now());
    first.send(
      JSON.stringify({
        type: "cloud:save",
        payload: { envelope, version: "2.0.0" },
      }),
    );
    const saved = await waitForMessage(first, [
      "cloud:save:success",
      "cloud:save:error",
    ]);
    expect(saved.type).toBe("cloud:save:success");

    const second = await connect(server);
    second.send(
      JSON.stringify({
        type: "auth:login",
        payload: { usernameOrEmail: username, password: "secret12" },
      }),
    );
    await waitForMessage(second, ["auth:login:success"]);

    first.send(
      JSON.stringify({
        type: "cloud:save",
        payload: { envelope, version: "2.0.0" },
      }),
    );
    const denied = await waitForMessage(first, ["cloud:save:error"]);
    expect(denied.type).toBe("cloud:save:error");

    second.send(JSON.stringify({ type: "cloud:load", payload: {} }));
    const loaded = await waitForMessage(second, ["cloud:load:success"]);
    expect(loaded.payload["envelope"]).toBeTruthy();

    first.close();
    second.close();
  });

  it("guest cannot cloud save", async () => {
    const server = await startServer();
    const ws = await connect(server);
    ws.send(
      JSON.stringify({
        type: "auth",
        payload: { userId: "guest_abc", username: "Gast" },
      }),
    );
    await waitForMessage(ws, ["auth:success"]);
    const envelope = createSaveEnvelope(samplePayload(), Date.now());
    ws.send(
      JSON.stringify({
        type: "cloud:save",
        payload: { envelope },
      }),
    );
    const denied = await waitForMessage(ws, ["cloud:save:error"]);
    expect(denied.payload["error"]).toBeTruthy();
    ws.close();
  });

  it("converts guest and verifies token roundtrip", async () => {
    const server = await startServer();
    const ws = await connect(server);
    const guestId = `guest_${Date.now().toString(36)}`;
    ws.send(
      JSON.stringify({
        type: "auth",
        payload: { userId: guestId, username: "Gast" },
      }),
    );
    await waitForMessage(ws, ["auth:success"]);

    const username = `conv_${Date.now().toString(36)}`;
    ws.send(
      JSON.stringify({
        type: "auth:convertGuest",
        payload: {
          guestId,
          username,
          email: `${username}@example.com`,
          password: "secret12",
        },
      }),
    );
    const converted = await waitForMessage(ws, [
      "auth:convertGuest:success",
      "auth:convertGuest:error",
    ]);
    expect(converted.type).toBe("auth:convertGuest:success");
    const token = converted.payload["token"];
    const user = converted.payload["user"] as { id: string };
    expect(typeof token).toBe("string");

    const second = await connect(server);
    second.send(
      JSON.stringify({
        type: "auth:verifyToken",
        payload: { userId: user.id, token },
      }),
    );
    const verified = await waitForMessage(second, [
      "auth:verifyToken:success",
      "auth:verifyToken:error",
    ]);
    expect(verified.type).toBe("auth:verifyToken:success");

    second.send(
      JSON.stringify({
        type: "auth:login",
        payload: {
          usernameOrEmail: username,
          password: "wrong-password",
        },
      }),
    );
    const badLogin = await waitForMessage(second, ["auth:login:error"]);
    expect(badLogin.type).toBe("auth:login:error");

    ws.close();
    second.close();
  });

  it("rejects invalid register payloads", async () => {
    const server = await startServer();
    const ws = await connect(server);
    ws.send(
      JSON.stringify({
        type: "auth:register",
        payload: { username: "ab", email: "bad", password: "1" },
      }),
    );
    const failed = await waitForMessage(ws, ["auth:register:error"]);
    expect(failed.type).toBe("auth:register:error");

    ws.send(
      JSON.stringify({
        type: "auth:register",
        payload: {
          username: "admin",
          email: "admin@example.com",
          password: "secret12",
        },
      }),
    );
    const blacklisted = await waitForMessage(ws, ["auth:register:error"]);
    expect(String(blacklisted.payload["error"])).toContain("blacklist");

    ws.send(JSON.stringify({ type: "not-a-real-event", payload: {} }));
    const unknown = await waitForMessage(ws, ["error"]);
    expect(unknown.type).toBe("error");

    ws.send("not-json");
    const badJson = await waitForMessage(ws, ["error"]);
    expect(badJson.type).toBe("error");
    ws.close();
  });

  it("loads empty cloud save for new account", async () => {
    const server = await startServer();
    const ws = await connect(server);
    const username = `empty_${Date.now().toString(36)}`;
    ws.send(
      JSON.stringify({
        type: "auth:register",
        payload: {
          username,
          email: `${username}@example.com`,
          password: "secret12",
        },
      }),
    );
    await waitForMessage(ws, ["auth:register:success"]);
    ws.send(JSON.stringify({ type: "cloud:load", payload: {} }));
    const loaded = await waitForMessage(ws, ["cloud:load:success"]);
    expect(loaded.payload["envelope"]).toBeNull();
    ws.close();
  });
});
