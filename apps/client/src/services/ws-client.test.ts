import { describe, expect, it, vi } from "vitest";

import {
  createWsClient,
  defaultWsUrl,
  RELEASE_WS_URL,
} from "./ws-client";

class FakeSocket {
  static OPEN = 1;
  readyState = 0;
  readonly listeners = new Map<
    string,
    Set<(event: { data?: string }) => void>
  >();

  addEventListener(
    type: string,
    handler: (event: { data?: string }) => void,
  ): void {
    let set = this.listeners.get(type);
    if (set === undefined) {
      set = new Set();
      this.listeners.set(type, set);
    }
    set.add(handler);
  }

  send(_data: string): void {
    // no-op
  }

  close(): void {
    this.readyState = 3;
    this.emit("close");
  }

  emit(type: string, data?: string): void {
    const set = this.listeners.get(type);
    if (set === undefined) {
      return;
    }
    for (const handler of set) {
      if (data === undefined) {
        handler({});
      } else {
        handler({ data });
      }
    }
  }

  open(): void {
    this.readyState = FakeSocket.OPEN;
    this.emit("open");
  }
}

describe("defaultWsUrl", () => {
  it("uses the live WSS endpoint as the release default", () => {
    expect(RELEASE_WS_URL).toBe("wss://archiv.grimoire-interactive.de");
    expect(defaultWsUrl()).toBe(RELEASE_WS_URL);
  });
});

describe("ws-client", () => {
  it("connects, sends, and dispatches typed messages", async () => {
    let lastSocket: FakeSocket | undefined;
    const WsImpl = vi.fn(function WsImpl() {
      const socket = new FakeSocket();
      lastSocket = socket;
      queueMicrotask(() => {
        socket.open();
      });
      return socket;
    }) as unknown as typeof WebSocket;
    Object.assign(WsImpl, { OPEN: 1 });

    const client = createWsClient({
      url: "ws://test",
      WebSocketImpl: WsImpl,
    });
    const seen: string[] = [];
    client.on("auth:success", (payload) => {
      const userId = payload["userId"];
      seen.push(typeof userId === "string" ? userId : "");
    });

    await client.connect();
    expect(client.status()).toBe("open");
    expect(client.send("auth", { userId: "guest_1", username: "Gast" })).toBe(
      true,
    );
    lastSocket?.emit(
      "message",
      JSON.stringify({
        type: "auth:success",
        payload: { userId: "guest_1", username: "Gast" },
      }),
    );
    expect(seen).toEqual(["guest_1"]);
    client.close();
    expect(client.status()).toBe("disconnected");
  });

  it("rejects connect when the socket closes during handshake", async () => {
    const WsImpl = vi.fn(function WsImpl() {
      const socket = new FakeSocket();
      queueMicrotask(() => {
        socket.emit("close");
      });
      return socket;
    }) as unknown as typeof WebSocket;
    Object.assign(WsImpl, { OPEN: 1 });

    const client = createWsClient({
      url: "ws://test",
      WebSocketImpl: WsImpl,
    });
    await expect(client.connect()).rejects.toThrow("WebSocket connection failed");
    expect(client.status()).toBe("disconnected");
  });
});
