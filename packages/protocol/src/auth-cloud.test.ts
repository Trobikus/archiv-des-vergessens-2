import { describe, expect, it } from "vitest";

import {
  authErrorKey,
  isAuthErrorCode,
  normalizeAuthErrorCode,
} from "./auth-errors";
import {
  validateAuthConvertGuestPayload,
  validateAuthConvertGuestSuccessPayload,
  validateAuthErrorPayload,
  validateAuthLoginPayload,
  validateAuthRegisterPayload,
  validateAuthSessionSuccessPayload,
  validateAuthVerifyTokenPayload,
  validateGuestAuthPayload,
} from "./auth-payloads";
import { createSaveEnvelope } from "./envelope";
import {
  validateCloudErrorPayload,
  validateCloudLoadSuccessPayload,
  validateCloudSavePayload,
  validateCloudSaveSuccessPayload,
} from "./cloud-payloads";

const user = {
  id: "usr_1",
  username: "keeper",
  email: "a@b.co",
  avatar: "A",
  createdAt: 1,
  lastLogin: 2,
  isGuest: false,
};

describe("auth error helpers", () => {
  it("detects and normalizes codes", () => {
    expect(isAuthErrorCode("username_taken")).toBe(true);
    expect(isAuthErrorCode("nope")).toBe(false);
    expect(normalizeAuthErrorCode("username_taken")).toBe("username_taken");
    expect(normalizeAuthErrorCode("auth.error.email_taken")).toBe("email_taken");
    expect(normalizeAuthErrorCode("auth.error.unknown")).toBeNull();
    expect(normalizeAuthErrorCode(1)).toBeNull();
    expect(authErrorKey("rate_limit")).toBe("auth.error.rate_limit");
  });
});

describe("auth payload validators", () => {
  it("validates guest/register/login/token/convertGuest", () => {
    expect(
      validateGuestAuthPayload({ userId: "guest_1", username: "Gast" }).ok,
    ).toBe(true);
    expect(validateGuestAuthPayload({ userId: "guest_1" }).ok).toBe(true);
    expect(
      validateAuthRegisterPayload({
        username: "keeper",
        email: "a@b.co",
        password: "secret1",
        avatar: "A",
      }).ok,
    ).toBe(true);
    expect(
      validateAuthLoginPayload({
        usernameOrEmail: "keeper",
        password: "secret1",
      }).ok,
    ).toBe(true);
    expect(
      validateAuthVerifyTokenPayload({
        userId: "usr_1",
        token: "tok_abc",
      }).ok,
    ).toBe(true);
    expect(
      validateAuthConvertGuestPayload({
        guestId: "guest_1",
        username: "keeper",
        email: "a@b.co",
        password: "secret1",
        avatar: "B",
      }).ok,
    ).toBe(true);
  });

  it("rejects incomplete auth payloads", () => {
    expect(validateGuestAuthPayload({}).ok).toBe(false);
    expect(validateGuestAuthPayload(null).ok).toBe(false);
    expect(validateAuthRegisterPayload({ username: "x" }).ok).toBe(false);
    expect(validateAuthRegisterPayload(null).ok).toBe(false);
    expect(validateAuthLoginPayload({ password: "x" }).ok).toBe(false);
    expect(validateAuthLoginPayload([]).ok).toBe(false);
    expect(validateAuthVerifyTokenPayload({ userId: "x" }).ok).toBe(false);
    expect(validateAuthConvertGuestPayload({ guestId: "guest_1" }).ok).toBe(
      false,
    );
  });

  it("validates session/convert success and error payloads", () => {
    expect(
      validateAuthSessionSuccessPayload({ user, token: "tok_1" }).ok,
    ).toBe(true);
    expect(
      validateAuthSessionSuccessPayload({
        user: { ...user, email: null },
        token: "tok_1",
      }).ok,
    ).toBe(true);
    expect(validateAuthSessionSuccessPayload({ user }).ok).toBe(false);
    expect(validateAuthSessionSuccessPayload({ token: "tok" }).ok).toBe(false);
    expect(
      validateAuthConvertGuestSuccessPayload({
        user,
        token: "tok_1",
        migrated: { save: true, leaderboard: false },
      }).ok,
    ).toBe(true);
    expect(
      validateAuthConvertGuestSuccessPayload({
        user,
        token: "tok_1",
      }).ok,
    ).toBe(false);
    expect(
      validateAuthErrorPayload({
        error: "username_taken",
        message: "taken",
        retryAfter: 12,
      }).ok,
    ).toBe(true);
    expect(validateAuthErrorPayload({ error: "" }).ok).toBe(false);
    expect(validateAuthErrorPayload(null).ok).toBe(false);
  });
});

describe("cloud payload validators", () => {
  it("requires a valid save envelope", () => {
    const envelope = createSaveEnvelope({ resources: {} }, 100);
    expect(
      validateCloudSavePayload({ envelope, version: "2.0.0" }).ok,
    ).toBe(true);
    expect(validateCloudSavePayload({ envelope }).ok).toBe(true);
    expect(validateCloudSavePayload({ saveData: {} }).ok).toBe(false);
    expect(validateCloudSavePayload({ envelope, version: 1 }).ok).toBe(false);
    expect(validateCloudSavePayload(null).ok).toBe(false);
    expect(validateCloudSaveSuccessPayload({ timestamp: 1 }).ok).toBe(true);
    expect(validateCloudSaveSuccessPayload({ timestamp: "x" }).ok).toBe(false);
    expect(validateCloudLoadSuccessPayload({ envelope: null }).ok).toBe(true);
    expect(
      validateCloudLoadSuccessPayload({
        envelope,
        userId: "usr_1",
        timestamp: 100,
        version: "2.0.0",
      }).ok,
    ).toBe(true);
    expect(
      validateCloudLoadSuccessPayload({
        envelope: null,
        userId: "usr_1",
        timestamp: 1,
        version: "x",
      }).ok,
    ).toBe(true);
    expect(validateCloudLoadSuccessPayload({ envelope: { bad: true } }).ok).toBe(
      false,
    );
    expect(validateCloudErrorPayload({ error: "boom" }).ok).toBe(true);
    expect(validateCloudErrorPayload({ error: "" }).ok).toBe(false);
    expect(validateCloudErrorPayload(null).ok).toBe(false);
  });
});
