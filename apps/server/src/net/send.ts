import type { WebSocket } from "ws";

export function sendJson(
  ws: WebSocket,
  type: string,
  payload: Record<string, unknown>,
): void {
  if (ws.readyState !== ws.OPEN) {
    return;
  }
  ws.send(JSON.stringify({ type, payload }));
}
