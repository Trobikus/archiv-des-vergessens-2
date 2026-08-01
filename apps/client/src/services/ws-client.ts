import { createLogger } from "@adv/core";
import { validateWsMessage, type WsMessage } from "@adv/protocol";

const log = createLogger("ws-client");

export type WsClientStatus = "disconnected" | "connecting" | "open";

export type WsClient = {
  readonly url: string;
  status(): WsClientStatus;
  connect(): Promise<void>;
  close(): void;
  send(type: string, payload?: Record<string, unknown>): boolean;
  on(type: string, handler: (payload: Record<string, unknown>) => void): () => void;
  onStatus(handler: (status: WsClientStatus) => void): () => void;
  request(
    type: string,
    payload: Record<string, unknown>,
    successTypes: readonly string[],
    errorTypes: readonly string[],
    timeoutMs?: number,
  ): Promise<WsMessage>;
};

export type WsClientOptions = {
  readonly url?: string;
  readonly WebSocketImpl?: typeof WebSocket;
  readonly now?: () => number;
};

/** Live release endpoint (TLS via reverse proxy / Let's Encrypt), same as v1. */
export const RELEASE_WS_URL = "wss://grimoireinteractive.duckdns.org";

type ViteClientEnv = {
  readonly VITE_WS_URL?: string;
  readonly DEV?: boolean;
};

function readViteEnv(): ViteClientEnv {
  return (
    import.meta as ImportMeta & {
      readonly env: ViteClientEnv;
    }
  ).env;
}

/**
 * Resolve the multiplayer WebSocket URL.
 * Order matches v1 `NetworkService._getServerUrl`:
 * 1. localStorage override (`archiv_server_url`)
 * 2. `VITE_WS_URL` (baked at build time)
 * 3. Vite DEV on localhost → `ws://localhost:8080`
 * 4. Production / release → encrypted live server
 */
export function defaultWsUrl(): string {
  try {
    if (typeof localStorage !== "undefined") {
      const custom = localStorage.getItem("archiv_server_url");
      if (typeof custom === "string" && custom.length > 0) {
        return custom;
      }
    }
  } catch {
    // ignore storage access errors (SSR / restricted contexts)
  }

  const viteEnv = readViteEnv();
  const fromEnv = viteEnv.VITE_WS_URL;
  if (typeof fromEnv === "string" && fromEnv.length > 0) {
    return fromEnv;
  }

  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const isViteDev = viteEnv.DEV === true;
    const isLocalHost =
      (hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname === "[::1]") &&
      window.location.port !== "";

    if (isViteDev && isLocalHost) {
      return "ws://localhost:8080";
    }
  }

  return RELEASE_WS_URL;
}

export function createWsClient(options: WsClientOptions = {}): WsClient {
  const url = options.url ?? defaultWsUrl();
  const WsImpl = options.WebSocketImpl ?? WebSocket;
  const handlers = new Map<
    string,
    Set<(payload: Record<string, unknown>) => void>
  >();
  const statusHandlers = new Set<(status: WsClientStatus) => void>();
  let socket: WebSocket | null = null;
  let status: WsClientStatus = "disconnected";

  const setStatus = (next: WsClientStatus): void => {
    status = next;
    for (const handler of statusHandlers) {
      handler(next);
    }
  };

  const dispatch = (raw: string): void => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw) as unknown;
    } catch {
      log.warn("invalid JSON from server");
      return;
    }
    const message = validateWsMessage(parsed);
    if (!message.ok) {
      log.warn(`invalid WS message: ${message.error}`);
      return;
    }
    const set = handlers.get(message.value.type);
    if (set === undefined) {
      return;
    }
    for (const handler of set) {
      handler(message.value.payload);
    }
  };

  return {
    url,
    status() {
      return status;
    },
    connect() {
      if (status === "open" || status === "connecting") {
        return Promise.resolve();
      }
      setStatus("connecting");
      return new Promise<void>((resolve, reject) => {
        let connection: WebSocket;
        try {
          connection = new WsImpl(url);
          socket = connection;
        } catch (cause) {
          setStatus("disconnected");
          reject(cause instanceof Error ? cause : new Error(String(cause)));
          return;
        }
        let settled = false;
        const settle = (fn: () => void): void => {
          if (settled) {
            return;
          }
          settled = true;
          fn();
        };
        const isCurrent = (): boolean => socket === connection;

        connection.addEventListener("open", () => {
          if (!isCurrent()) {
            return;
          }
          settle(() => {
            setStatus("open");
            resolve();
          });
        });
        connection.addEventListener("message", (event) => {
          if (!isCurrent()) {
            return;
          }
          if (typeof event.data === "string") {
            dispatch(event.data);
          }
        });
        connection.addEventListener("close", () => {
          if (!isCurrent()) {
            return;
          }
          const wasConnecting = status === "connecting";
          setStatus("disconnected");
          socket = null;
          // Handshake failures often emit close without a usable error.
          if (wasConnecting) {
            settle(() => {
              reject(new Error("WebSocket connection failed"));
            });
          }
        });
        connection.addEventListener("error", () => {
          if (!isCurrent()) {
            return;
          }
          if (status === "connecting") {
            setStatus("disconnected");
            settle(() => {
              reject(new Error("WebSocket connection failed"));
            });
          }
        });
      });
    },
    close() {
      socket?.close();
      socket = null;
      setStatus("disconnected");
    },
    send(type, payload = {}) {
      if (socket === null || socket.readyState !== WsImpl.OPEN) {
        return false;
      }
      socket.send(JSON.stringify({ type, payload }));
      return true;
    },
    on(type, handler) {
      let set = handlers.get(type);
      if (set === undefined) {
        set = new Set();
        handlers.set(type, set);
      }
      const listeners = set;
      listeners.add(handler);
      return () => {
        listeners.delete(handler);
      };
    },
    onStatus(handler) {
      statusHandlers.add(handler);
      return () => {
        statusHandlers.delete(handler);
      };
    },
    request(type, payload, successTypes, errorTypes, timeoutMs = 8_000) {
      return new Promise<WsMessage>((resolve, reject) => {
        const unsubs: Array<() => void> = [];
        const timer = setTimeout(() => {
          cleanup();
          reject(new Error("request timeout"));
        }, timeoutMs);

        const cleanup = (): void => {
          clearTimeout(timer);
          for (const unsub of unsubs) {
            unsub();
          }
        };

        for (const successType of successTypes) {
          unsubs.push(
            this.on(successType, (successPayload) => {
              cleanup();
              resolve({ type: successType, payload: successPayload });
            }),
          );
        }
        for (const errorType of errorTypes) {
          unsubs.push(
            this.on(errorType, (errorPayload) => {
              cleanup();
              resolve({ type: errorType, payload: errorPayload });
            }),
          );
        }

        if (!this.send(type, payload)) {
          cleanup();
          reject(new Error("WebSocket not connected"));
        }
      });
    },
  };
}
