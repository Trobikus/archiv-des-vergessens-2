const DB_NAME = "adv2-saves";
const STORE_NAME = "saves";
const DB_VERSION = 1;

export type SaveStorage = {
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown): Promise<void>;
  delete(key: string): Promise<void>;
};

/** In-memory adapter for tests / SSR fallbacks. */
export function createMemorySaveStorage(
  seed: Record<string, unknown> = {},
): SaveStorage {
  const map = new Map<string, unknown>(Object.entries(seed));
  return {
    get(key) {
      return Promise.resolve(map.has(key) ? (map.get(key) ?? null) : null);
    },
    set(key, value) {
      map.set(key, value);
      return Promise.resolve();
    },
    delete(key) {
      map.delete(key);
      return Promise.resolve();
    },
  };
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      reject(request.error ?? new Error("indexedDB open failed"));
    };
  });
}

/** IndexedDB cache for local/offline saves (ADR 0002). */
export function createIndexedDbSaveStorage(): SaveStorage {
  return {
    async get(key) {
      const db = await openDb();
      try {
        return await new Promise<unknown>((resolve, reject) => {
          const tx = db.transaction(STORE_NAME, "readonly");
          const store = tx.objectStore(STORE_NAME);
          const req = store.get(key);
          req.onsuccess = () => {
            resolve(req.result ?? null);
          };
          req.onerror = () => {
            reject(req.error ?? new Error("indexedDB get failed"));
          };
        });
      } finally {
        db.close();
      }
    },
    async set(key, value) {
      const db = await openDb();
      try {
        await new Promise<void>((resolve, reject) => {
          const tx = db.transaction(STORE_NAME, "readwrite");
          const store = tx.objectStore(STORE_NAME);
          const req = store.put(value, key);
          req.onsuccess = () => {
            resolve();
          };
          req.onerror = () => {
            reject(req.error ?? new Error("indexedDB put failed"));
          };
        });
      } finally {
        db.close();
      }
    },
    async delete(key) {
      const db = await openDb();
      try {
        await new Promise<void>((resolve, reject) => {
          const tx = db.transaction(STORE_NAME, "readwrite");
          const store = tx.objectStore(STORE_NAME);
          const req = store.delete(key);
          req.onsuccess = () => {
            resolve();
          };
          req.onerror = () => {
            reject(req.error ?? new Error("indexedDB delete failed"));
          };
        });
      } finally {
        db.close();
      }
    },
  };
}
