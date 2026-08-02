import type { WebSocket } from "ws";

export type ClientSession = {
  userId: string | null;
  username: string;
  sessionToken: string | null;
  isGuest: boolean;
  clientIp: string;
};

export type SessionStore = {
  get(ws: WebSocket): ClientSession | undefined;
  set(ws: WebSocket, session: ClientSession): void;
  delete(ws: WebSocket): void;
  forEach(fn: (ws: WebSocket, session: ClientSession) => void): void;
};

export function createSessionStore(): SessionStore {
  const clients = new Map<WebSocket, ClientSession>();
  return {
    get(ws) {
      return clients.get(ws);
    },
    set(ws, session) {
      clients.set(ws, session);
    },
    delete(ws) {
      clients.delete(ws);
    },
    forEach(fn) {
      for (const [ws, session] of clients) {
        fn(ws, session);
      }
    },
  };
}
