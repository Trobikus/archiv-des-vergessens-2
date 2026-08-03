import {
  createSaveEnvelope,
  migrateSaveEnvelope,
  validatePhase2SavePayload,
  type Phase2SavePayload,
} from "@adv/protocol";
import { err, ok, type Result } from "@adv/core";

import {
  gameStateFromPayload,
  gameStateToPayload,
  type GameState,
} from "../state/game-state";
import type { SaveStorage } from "./save-storage";

export const DEFAULT_SAVE_KEY = "slot_local_1";

/** IndexedDB key for offline guest progress (never shares `slot_local_1`). */
export function guestSaveKey(guestId: string): string {
  const safe = guestId.replace(/[^a-zA-Z0-9_]/g, "_").slice(0, 64);
  return `slot_guest_${safe.length > 0 ? safe : "unknown"}`;
}

export type SaveStore = {
  load(key?: string): Promise<Result<GameState | null>>;
  save(state: GameState, key?: string, now?: number): Promise<Result<void>>;
  clear(key?: string): Promise<Result<void>>;
};

export function createSaveStore(storage: SaveStorage): SaveStore {
  return {
    async load(key = DEFAULT_SAVE_KEY) {
      try {
        const raw = await storage.get(key);
        if (raw === null || raw === undefined) {
          return ok(null);
        }
        const migrated = migrateSaveEnvelope(raw);
        if (!migrated.ok) {
          return err(migrated.error);
        }
        const payload = validatePhase2SavePayload(migrated.value.payload);
        if (!payload.ok) {
          return err(payload.error);
        }
        return ok(gameStateFromPayload(payload.value));
      } catch (cause) {
        return err(cause instanceof Error ? cause.message : "load failed");
      }
    },

    async save(state, key = DEFAULT_SAVE_KEY, now = Date.now()) {
      try {
        const payload: Phase2SavePayload = gameStateToPayload({
          ...state,
          meta: { ...state.meta, lastActiveAt: now },
        });
        const envelope = createSaveEnvelope(payload, now);
        await storage.set(key, envelope);
        return ok(undefined);
      } catch (cause) {
        return err(cause instanceof Error ? cause.message : "save failed");
      }
    },

    async clear(key = DEFAULT_SAVE_KEY) {
      try {
        await storage.delete(key);
        return ok(undefined);
      } catch (cause) {
        return err(cause instanceof Error ? cause.message : "clear failed");
      }
    },
  };
}
