import type { EventBus, Store } from "@adv/core";

import type { GameState, InventoryItem } from "../state/game-state";
import type { AuthService } from "./auth-service";

type VaultResourceKey = "particles" | "relics" | "artifacts" | "memoryDust";

export type AccountVaultService = {
  depositResource(type: VaultResourceKey, amount: number): boolean;
  withdrawResource(type: VaultResourceKey, amount: number): boolean;
  depositItem(itemId: string): boolean;
  withdrawItem(index: number): boolean;
  getVaultResources(): GameState["accountVault"];
  getSharedVaultItems(): readonly InventoryItem[];
  destroy(): void;
};

function sanitizeAmount(amount: number): number {
  if (!Number.isFinite(amount) || amount <= 0) {
    return 0;
  }
  return Math.floor(amount);
}

export function createAccountVaultService(
  store: Store<GameState>,
  eventBus: EventBus,
  auth?: AuthService,
): AccountVaultService {
  const isGuestBlocked = (): boolean => {
    if (!auth) {
      return false;
    }
    const user = auth.store.getState().user;
    return user?.isGuest === true;
  };

  const publishUpdate = (type: string): void => {
    eventBus.publish("vault:updated", {
      type,
      vault: store.getState().accountVault,
    });
  };

  return {
    depositResource(type, amount) {
      if (isGuestBlocked()) {
        return false;
      }
      const safe = sanitizeAmount(amount);
      if (safe <= 0) {
        return false;
      }
      const remove = BigInt(safe);
      const current = store.getState().resources[type];
      if (current < remove) {
        return false;
      }
      store.setState((prev) => ({
        ...prev,
        resources: {
          ...prev.resources,
          [type]: prev.resources[type] - remove,
        },
        accountVault: {
          ...prev.accountVault,
          [type]: prev.accountVault[type] + remove,
        },
      }));
      publishUpdate("deposit");
      return true;
    },

    withdrawResource(type, amount) {
      if (isGuestBlocked()) {
        return false;
      }
      const safe = sanitizeAmount(amount);
      if (safe <= 0) {
        return false;
      }
      const remove = BigInt(safe);
      const vault = store.getState().accountVault[type];
      if (vault < remove) {
        return false;
      }
      store.setState((prev) => ({
        ...prev,
        resources: {
          ...prev.resources,
          [type]: prev.resources[type] + remove,
        },
        accountVault: {
          ...prev.accountVault,
          [type]: prev.accountVault[type] - remove,
        },
      }));
      publishUpdate("withdraw");
      return true;
    },

    depositItem(itemId) {
      if (isGuestBlocked()) {
        return false;
      }
      const hero = store.getState().hero;
      const item = hero.inventory.equipment.find((entry) => entry.id === itemId);
      if (!item) {
        return false;
      }
      store.setState((prev) => ({
        ...prev,
        hero: {
          ...prev.hero,
          inventory: {
            equipment: prev.hero.inventory.equipment.filter(
              (entry) => entry.id !== itemId,
            ),
          },
        },
        accountVault: {
          ...prev.accountVault,
          items: [...prev.accountVault.items, item],
        },
      }));
      publishUpdate("item_deposited");
      return true;
    },

    withdrawItem(index) {
      if (isGuestBlocked()) {
        return false;
      }
      const items = store.getState().accountVault.items;
      if (index < 0 || index >= items.length) {
        return false;
      }
      const item = items[index];
      if (!item) {
        return false;
      }
      store.setState((prev) => ({
        ...prev,
        hero: {
          ...prev.hero,
          inventory: {
            equipment: [...prev.hero.inventory.equipment, item],
          },
        },
        accountVault: {
          ...prev.accountVault,
          items: prev.accountVault.items.filter((_, idx) => idx !== index),
        },
      }));
      publishUpdate("item_withdrawn");
      return true;
    },

    getVaultResources() {
      return store.getState().accountVault;
    },

    getSharedVaultItems() {
      return [...store.getState().accountVault.items];
    },

    destroy() {
      // no subscriptions
    },
  };
}
