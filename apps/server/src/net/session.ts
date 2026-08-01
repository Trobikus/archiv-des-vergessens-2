import type { WebSocket } from "ws";

export type ClientSession = {
  userId: string | null;
  username: string;
  sessionToken: string | null;
  isGuest: boolean;
  clientIp: string;
};

export function createSessionStore(): {
  get(ws: WebSocket): ClientSession | undefined;
  set(ws: WebSocket, session: ClientSession): void;
  delete(ws: WebSocket): void;
} {
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
  };
}
