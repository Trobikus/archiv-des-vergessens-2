import type { PreparedStatements } from "../../db/open";
import type { ClientSession } from "../../net/session";

export function hasActiveRegisteredSession(
  session: ClientSession,
  stmts: PreparedStatements,
): boolean {
  if (
    session.userId === null ||
    session.sessionToken === null ||
    session.isGuest
  ) {
    return false;
  }
  const row = stmts.getUserBySession.get(
    session.userId,
    session.sessionToken,
  );
  return row !== undefined;
}
