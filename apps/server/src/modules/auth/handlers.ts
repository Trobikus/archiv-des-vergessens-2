import type { AuthUser } from "@adv/protocol";
import {
  authErrorKey,
  validateAuthConvertGuestPayload,
  validateAuthLoginPayload,
  validateAuthRegisterPayload,
  validateAuthVerifyTokenPayload,
  validateGuestAuthPayload,
  WS_EVENTS,
} from "@adv/protocol";
import type { WebSocket } from "ws";

import {
  generateSalt,
  generateToken,
  generateUserId,
  hashPassword,
  verifyPassword,
} from "../../crypto/password";
import type { AppDatabase, PreparedStatements, UserRow } from "../../db/open";
import {
  DEFAULT_AVATAR,
  MAX_PASSWORD_LENGTH,
  USERNAME_BLACKLIST,
} from "../../db/schema";
import { sendJson } from "../../net/send";
import type { ClientSession } from "../../net/session";
import type { createRateLimiter } from "./rate-limit";
import {
  isValidUsernameChars,
  sanitizeText,
  validateEmailFormat,
} from "./validate-local";

type RateLimiter = ReturnType<typeof createRateLimiter>;

function toAuthUser(row: UserRow, overrides?: Partial<AuthUser>): AuthUser {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    avatar: row.avatar ?? DEFAULT_AVATAR,
    createdAt: row.createdAt,
    lastLogin: row.lastLogin,
    isGuest: false,
    ...overrides,
  };
}

function checkUsernameAvailable(
  stmts: PreparedStatements,
  username: string,
): { ok: true } | { ok: false; error: string } {
  const normalized = username.toLowerCase();
  if ((USERNAME_BLACKLIST as readonly string[]).includes(normalized)) {
    return { ok: false, error: authErrorKey("username_blacklisted") };
  }
  const existing = stmts.checkUsername.get(normalized) as
    | { id: string }
    | undefined;
  if (existing !== undefined) {
    return { ok: false, error: authErrorKey("username_taken") };
  }
  return { ok: true };
}

function validateCredentials(input: {
  username: string;
  email: string;
  password: string;
}):
  | { ok: true; username: string; email: string }
  | { ok: false; error: string; message?: string } {
  const username = sanitizeText(input.username, 25);
  if (username.length < 3 || username.length > 25) {
    return {
      ok: false,
      error: authErrorKey("username_short"),
      message: "Username must be 3-25 characters.",
    };
  }
  if (!isValidUsernameChars(username)) {
    return {
      ok: false,
      error: authErrorKey("username_invalid_chars"),
      message: "Username may only contain letters, numbers, and underscores.",
    };
  }
  const emailRaw = input.email.trim().toLowerCase();
  if (!validateEmailFormat(emailRaw)) {
    return {
      ok: false,
      error: authErrorKey("email_invalid"),
      message: "Invalid email format.",
    };
  }
  const email = emailRaw.substring(0, 100);
  if (
    input.password.length < 6 ||
    input.password.length > MAX_PASSWORD_LENGTH
  ) {
    return {
      ok: false,
      error: authErrorKey("password_short"),
      message: "Password must be 6-128 characters.",
    };
  }
  return { ok: true, username, email };
}

export type AuthHandlerDeps = {
  readonly stmts: PreparedStatements;
  readonly db: AppDatabase;
  readonly rateLimiter: RateLimiter;
};

export function handleAuthMessage(
  ws: WebSocket,
  type: string,
  payload: Record<string, unknown>,
  session: ClientSession,
  deps: AuthHandlerDeps,
): boolean {
  switch (type) {
    case WS_EVENTS.AUTH: {
      const parsed = validateGuestAuthPayload(payload);
      if (!parsed.ok) {
        sendJson(ws, WS_EVENTS.AUTH_ERROR, { message: parsed.error });
        return true;
      }
      const username = sanitizeText(parsed.value.username, 25) || "Gast";
      session.userId = parsed.value.userId;
      session.username = username;
      session.isGuest = true;
      session.sessionToken = null;
      sendJson(ws, WS_EVENTS.AUTH_SUCCESS, {
        userId: parsed.value.userId,
        username,
      });
      return true;
    }

    case WS_EVENTS.AUTH_REGISTER: {
      try {
        const parsed = validateAuthRegisterPayload(payload);
        if (!parsed.ok) {
          sendJson(ws, WS_EVENTS.AUTH_REGISTER_ERROR, {
            error: authErrorKey("missing_fields"),
            message: parsed.error,
          });
          return true;
        }
        const creds = validateCredentials(parsed.value);
        if (!creds.ok) {
          sendJson(ws, WS_EVENTS.AUTH_REGISTER_ERROR, {
            error: creds.error,
            ...(creds.message !== undefined ? { message: creds.message } : {}),
          });
          return true;
        }
        const rate = deps.rateLimiter.check(session.clientIp);
        if (!rate.allowed) {
          sendJson(ws, WS_EVENTS.AUTH_REGISTER_ERROR, {
            error: authErrorKey("rate_limit"),
            retryAfter: rate.retryAfter,
            message: `Too many attempts. Wait ${String(rate.retryAfter)}s.`,
          });
          return true;
        }
        const nameCheck = checkUsernameAvailable(deps.stmts, creds.username);
        if (!nameCheck.ok) {
          sendJson(ws, WS_EVENTS.AUTH_REGISTER_ERROR, { error: nameCheck.error });
          return true;
        }
        if (deps.stmts.getEmail.get(creds.email) !== undefined) {
          sendJson(ws, WS_EVENTS.AUTH_REGISTER_ERROR, {
            error: authErrorKey("email_taken"),
          });
          return true;
        }

        const userId = generateUserId();
        const salt = generateSalt();
        const passwordHash = hashPassword(parsed.value.password, salt);
        const token = generateToken();
        const now = Date.now();
        const avatar =
          sanitizeText(parsed.value.avatar, 10) || DEFAULT_AVATAR;

        const run = deps.db.transaction(() => {
          deps.stmts.insertUser.run({
            id: userId,
            username: creds.username,
            email: creds.email,
            passwordHash,
            salt,
            avatar,
            createdAt: now,
            lastLogin: now,
            sessionToken: token,
          });
          deps.stmts.upsertSave.run(
            userId,
            creds.username,
            JSON.stringify(null),
            "2.0.0-phase5",
            now,
          );
        });
        run();

        session.userId = userId;
        session.username = creds.username;
        session.sessionToken = token;
        session.isGuest = false;

        const user: AuthUser = {
          id: userId,
          username: creds.username,
          email: creds.email,
          avatar,
          createdAt: now,
          lastLogin: now,
          isGuest: false,
        };
        sendJson(ws, WS_EVENTS.AUTH_REGISTER_SUCCESS, { user, token });
        sendJson(ws, WS_EVENTS.AUTH_SUCCESS, {
          userId,
          username: creds.username,
        });
      } catch {
        sendJson(ws, WS_EVENTS.AUTH_REGISTER_ERROR, {
          error: authErrorKey("server_error"),
        });
      }
      return true;
    }

    case WS_EVENTS.AUTH_LOGIN: {
      try {
        const parsed = validateAuthLoginPayload(payload);
        if (!parsed.ok) {
          sendJson(ws, WS_EVENTS.AUTH_LOGIN_ERROR, {
            error: authErrorKey("missing_fields"),
          });
          return true;
        }
        const query = sanitizeText(parsed.value.usernameOrEmail, 100);
        const password = parsed.value.password;
        if (query.length === 0 || password.length === 0) {
          sendJson(ws, WS_EVENTS.AUTH_LOGIN_ERROR, {
            error: authErrorKey("missing_fields"),
          });
          return true;
        }
        if (password.length > MAX_PASSWORD_LENGTH) {
          sendJson(ws, WS_EVENTS.AUTH_LOGIN_ERROR, {
            error: authErrorKey("wrong_password"),
          });
          return true;
        }
        const user = deps.stmts.getUserByLogin.get(query, query) as
          | UserRow
          | undefined;
        if (user === undefined) {
          sendJson(ws, WS_EVENTS.AUTH_LOGIN_ERROR, {
            error: authErrorKey("user_not_found"),
          });
          return true;
        }
        if (!verifyPassword(password, user.salt, user.passwordHash)) {
          sendJson(ws, WS_EVENTS.AUTH_LOGIN_ERROR, {
            error: authErrorKey("wrong_password"),
          });
          return true;
        }
        const newToken = generateToken();
        const now = Date.now();
        deps.stmts.updateSession.run(now, newToken, user.id);
        session.userId = user.id;
        session.username = user.username;
        session.sessionToken = newToken;
        session.isGuest = false;
        const authUser = toAuthUser(user, { lastLogin: now });
        sendJson(ws, WS_EVENTS.AUTH_LOGIN_SUCCESS, {
          user: authUser,
          token: newToken,
        });
        sendJson(ws, WS_EVENTS.AUTH_SUCCESS, {
          userId: user.id,
          username: user.username,
        });
      } catch {
        sendJson(ws, WS_EVENTS.AUTH_LOGIN_ERROR, {
          error: authErrorKey("server_error"),
        });
      }
      return true;
    }

    case WS_EVENTS.AUTH_VERIFY_TOKEN: {
      try {
        const parsed = validateAuthVerifyTokenPayload(payload);
        if (!parsed.ok) {
          sendJson(ws, WS_EVENTS.AUTH_VERIFY_TOKEN_ERROR, {
            error: "Missing session credentials.",
          });
          return true;
        }
        const userId = sanitizeText(parsed.value.userId, 50);
        const user = deps.stmts.getUserBySession.get(
          userId,
          parsed.value.token,
        ) as UserRow | undefined;
        if (user === undefined) {
          sendJson(ws, WS_EVENTS.AUTH_VERIFY_TOKEN_ERROR, {
            error: "Session token invalid or expired.",
          });
          return true;
        }
        session.userId = user.id;
        session.username = user.username;
        session.sessionToken = parsed.value.token;
        session.isGuest = false;
        sendJson(ws, WS_EVENTS.AUTH_VERIFY_TOKEN_SUCCESS, {
          user: toAuthUser(user),
          token: parsed.value.token,
        });
        sendJson(ws, WS_EVENTS.AUTH_SUCCESS, {
          userId: user.id,
          username: user.username,
        });
      } catch {
        sendJson(ws, WS_EVENTS.AUTH_VERIFY_TOKEN_ERROR, {
          error: "Session token invalid or expired.",
        });
      }
      return true;
    }

    case WS_EVENTS.AUTH_CONVERT_GUEST: {
      try {
        const parsed = validateAuthConvertGuestPayload(payload);
        if (!parsed.ok) {
          sendJson(ws, WS_EVENTS.AUTH_CONVERT_GUEST_ERROR, {
            error: authErrorKey("missing_fields"),
            message: parsed.error,
          });
          return true;
        }
        const guestId = sanitizeText(parsed.value.guestId, 50);
        if (!guestId.startsWith("guest_")) {
          sendJson(ws, WS_EVENTS.AUTH_CONVERT_GUEST_ERROR, {
            error: authErrorKey("invalid_guest"),
          });
          return true;
        }
        const creds = validateCredentials(parsed.value);
        if (!creds.ok) {
          sendJson(ws, WS_EVENTS.AUTH_CONVERT_GUEST_ERROR, {
            error: creds.error,
            ...(creds.message !== undefined ? { message: creds.message } : {}),
          });
          return true;
        }
        const rate = deps.rateLimiter.check(session.clientIp);
        if (!rate.allowed) {
          sendJson(ws, WS_EVENTS.AUTH_CONVERT_GUEST_ERROR, {
            error: authErrorKey("rate_limit"),
            retryAfter: rate.retryAfter,
          });
          return true;
        }
        const nameCheck = checkUsernameAvailable(deps.stmts, creds.username);
        if (!nameCheck.ok) {
          sendJson(ws, WS_EVENTS.AUTH_CONVERT_GUEST_ERROR, {
            error: nameCheck.error,
          });
          return true;
        }
        if (deps.stmts.getEmail.get(creds.email) !== undefined) {
          sendJson(ws, WS_EVENTS.AUTH_CONVERT_GUEST_ERROR, {
            error: authErrorKey("email_taken"),
          });
          return true;
        }

        const guestSave = deps.stmts.getSave.get(guestId) as
          | { saveData: string; version: string; timestamp: number }
          | undefined;
        const userId = generateUserId();
        const salt = generateSalt();
        const passwordHash = hashPassword(parsed.value.password, salt);
        const token = generateToken();
        const now = Date.now();
        const avatar =
          sanitizeText(parsed.value.avatar, 10) || DEFAULT_AVATAR;

        const run = deps.db.transaction(() => {
          deps.stmts.insertUser.run({
            id: userId,
            username: creds.username,
            email: creds.email,
            passwordHash,
            salt,
            avatar,
            createdAt: now,
            lastLogin: now,
            sessionToken: token,
          });
          if (guestSave !== undefined) {
            deps.stmts.migrateGuestSave.run(
              userId,
              creds.username,
              guestSave.version || "2.0.0-phase5",
              now,
              guestId,
            );
          } else {
            deps.stmts.upsertSave.run(
              userId,
              creds.username,
              JSON.stringify(null),
              "2.0.0-phase5",
              now,
            );
          }
        });
        run();

        session.userId = userId;
        session.username = creds.username;
        session.sessionToken = token;
        session.isGuest = false;

        sendJson(ws, WS_EVENTS.AUTH_CONVERT_GUEST_SUCCESS, {
          user: {
            id: userId,
            username: creds.username,
            email: creds.email,
            avatar,
            createdAt: now,
            lastLogin: now,
            isGuest: false,
          },
          token,
          migrated: {
            save: guestSave !== undefined,
            leaderboard: false,
          },
        });
        sendJson(ws, WS_EVENTS.AUTH_SUCCESS, {
          userId,
          username: creds.username,
        });
      } catch {
        sendJson(ws, WS_EVENTS.AUTH_CONVERT_GUEST_ERROR, {
          error: authErrorKey("server_error"),
        });
      }
      return true;
    }

    default:
      return false;
  }
}
