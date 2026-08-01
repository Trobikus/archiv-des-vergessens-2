import { createLogger, err, ok, type Result } from "@adv/core";
import {
  createSaveEnvelope,
  migrateSaveEnvelope,
  validateCloudLoadSuccessPayload,
  validatePhase2SavePayload,
  WS_EVENTS,
  type SaveEnvelope,
} from "@adv/protocol";

import {
  gameStateFromPayload,
  gameStateToPayload,
  type GameState,
} from "../state/game-state";
import type { AuthService } from "./auth-service";
import type { SaveStorage } from "./save-storage";
import type { WsClient } from "./ws-client";

const log = createLogger("cloud-sync");

export const CLOUD_PENDING_PREFIX = "cloud_pending_";

export type CloudSyncStatus = "idle" | "syncing" | "pending" | "error";

export type CloudSyncService = {
  status(): CloudSyncStatus;
  lastError(): string | null;
  pullAndMerge(local: GameState): Promise<Result<GameState>>;
  push(state: GameState, now?: number): Promise<Result<void>>;
  flushPending(): Promise<Result<void>>;
  destroy(): void;
};

export type CloudSyncOptions = {
  readonly ws: WsClient;
  readonly auth: AuthService;
  readonly storage: SaveStorage;
  readonly appVersion?: string;
};

function pendingKey(userId: string): string {
  return `${CLOUD_PENDING_PREFIX}${userId}`;
}

export function createCloudSyncService(
  options: CloudSyncOptions,
): CloudSyncService {
  let status: CloudSyncStatus = "idle";
  let lastError: string | null = null;
  // Prefer explicit appVersion from game-session (root package.json via Vite).
  const version = options.appVersion ?? "0.0.0-dev";

  const setError = (message: string): void => {
    status = "error";
    lastError = message;
  };

  return {
    status() {
      return status;
    },
    lastError() {
      return lastError;
    },

    async pullAndMerge(local) {
      if (!options.auth.isRegistered() || options.ws.status() !== "open") {
        return ok(local);
      }
      status = "syncing";
      try {
        const response = await options.ws.request(
          WS_EVENTS.CLOUD_LOAD,
          {},
          [WS_EVENTS.CLOUD_LOAD_SUCCESS],
          [WS_EVENTS.CLOUD_LOAD_ERROR],
        );
        if (response.type === WS_EVENTS.CLOUD_LOAD_ERROR) {
          const message =
            typeof response.payload["error"] === "string"
              ? response.payload["error"]
              : "cloud load failed";
          setError(message);
          return err(message);
        }
        const parsed = validateCloudLoadSuccessPayload(response.payload);
        if (!parsed.ok) {
          setError(parsed.error);
          return err(parsed.error);
        }
        if (parsed.value.envelope === null) {
          status = "idle";
          lastError = null;
          return ok(local);
        }
        const migrated = migrateSaveEnvelope(parsed.value.envelope);
        if (!migrated.ok) {
          setError(migrated.error);
          return err(migrated.error);
        }
        const payload = validatePhase2SavePayload(migrated.value.payload);
        if (!payload.ok) {
          setError(payload.error);
          return err(payload.error);
        }
        const cloudState = gameStateFromPayload(payload.value);
        const localSavedAt = local.meta.lastSavedAt ?? local.meta.lastActiveAt;
        const cloudSavedAt = migrated.value.savedAt;
        status = "idle";
        lastError = null;
        if (cloudSavedAt > localSavedAt) {
          return ok(cloudState);
        }
        return ok(local);
      } catch (cause) {
        const message =
          cause instanceof Error ? cause.message : "cloud load failed";
        setError(message);
        return err(message);
      }
    },

    async push(state, now = Date.now()) {
      const envelope: SaveEnvelope = createSaveEnvelope(
        gameStateToPayload({
          ...state,
          meta: { ...state.meta, lastActiveAt: now, lastSavedAt: now },
        }),
        now,
      );

      if (!options.auth.isRegistered()) {
        return ok(undefined);
      }

      const user = options.auth.store.getState().user;
      if (user === null) {
        return ok(undefined);
      }

      if (options.ws.status() !== "open") {
        await options.storage.set(pendingKey(user.id), envelope);
        status = "pending";
        return ok(undefined);
      }

      status = "syncing";
      try {
        const response = await options.ws.request(
          WS_EVENTS.CLOUD_SAVE,
          { envelope, version },
          [WS_EVENTS.CLOUD_SAVE_SUCCESS],
          [WS_EVENTS.CLOUD_SAVE_ERROR],
        );
        if (response.type === WS_EVENTS.CLOUD_SAVE_ERROR) {
          const message =
            typeof response.payload["error"] === "string"
              ? response.payload["error"]
              : "cloud save failed";
          await options.storage.set(pendingKey(user.id), envelope);
          setError(message);
          status = "pending";
          return err(message);
        }
        await options.storage.delete(pendingKey(user.id));
        status = "idle";
        lastError = null;
        return ok(undefined);
      } catch (cause) {
        await options.storage.set(pendingKey(user.id), envelope);
        const message =
          cause instanceof Error ? cause.message : "cloud save failed";
        log.warn(message);
        status = "pending";
        lastError = message;
        return err(message);
      }
    },

    async flushPending() {
      if (!options.auth.isRegistered() || options.ws.status() !== "open") {
        return ok(undefined);
      }
      const user = options.auth.store.getState().user;
      if (user === null) {
        return ok(undefined);
      }
      const pending = await options.storage.get(pendingKey(user.id));
      if (pending === null || pending === undefined) {
        return ok(undefined);
      }
      const migrated = migrateSaveEnvelope(pending);
      if (!migrated.ok) {
        await options.storage.delete(pendingKey(user.id));
        return err(migrated.error);
      }
      status = "syncing";
      try {
        const response = await options.ws.request(
          WS_EVENTS.CLOUD_SAVE,
          { envelope: migrated.value, version },
          [WS_EVENTS.CLOUD_SAVE_SUCCESS],
          [WS_EVENTS.CLOUD_SAVE_ERROR],
        );
        if (response.type === WS_EVENTS.CLOUD_SAVE_ERROR) {
          const message =
            typeof response.payload["error"] === "string"
              ? response.payload["error"]
              : "cloud flush failed";
          setError(message);
          status = "pending";
          return err(message);
        }
        await options.storage.delete(pendingKey(user.id));
        status = "idle";
        lastError = null;
        return ok(undefined);
      } catch (cause) {
        const message =
          cause instanceof Error ? cause.message : "cloud flush failed";
        setError(message);
        status = "pending";
        return err(message);
      }
    },

    destroy() {
      status = "idle";
      lastError = null;
    },
  };
}
