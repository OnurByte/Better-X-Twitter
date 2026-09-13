import type { BetterXDatabase } from "../core/plugin";

const stores = ["posts", "bookmarks", "likes", "rediscover_history", "user_notes", "feed_rule_cache", "ai_verdict_cache", "download_history", "library_entries", "account_country_cache"] as const;

export class IndexedDb implements BetterXDatabase {
  private db?: IDBDatabase;
  private async open(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("better-x", 1);
      request.onupgradeneeded = () => stores.forEach((store) => { if (!request.result.objectStoreNames.contains(store)) request.result.createObjectStore(store); });
      request.onsuccess = () => { this.db = request.result; resolve(request.result); };
      request.onerror = () => reject(request.error ?? new Error("IndexedDB open failed"));
    });
  }
  async get<T>(store: string, key: IDBValidKey): Promise<T | undefined> { return this.transaction<T | undefined>(store, "readonly", (objectStore) => objectStore.get(key)); }
  async put<T>(store: string, value: T): Promise<void> { await this.transaction(store, "readwrite", (objectStore) => objectStore.put(value)); }
  async delete(store: string, key: IDBValidKey): Promise<void> { await this.transaction(store, "readwrite", (objectStore) => objectStore.delete(key)); }
  async all<T>(store: string): Promise<T[]> { return this.transaction<T[]>(store, "readonly", (objectStore) => objectStore.getAll()); }
  private async transaction<T>(store: string, mode: IDBTransactionMode, action: (objectStore: IDBObjectStore) => IDBRequest): Promise<T> { if (!stores.includes(store as typeof stores[number])) throw new Error(`Unknown store: ${store}`); const db = await this.open(); return new Promise((resolve, reject) => { const request = action(db.transaction(store, mode).objectStore(store)); request.onsuccess = () => resolve(request.result as T); request.onerror = () => reject(request.error ?? new Error("IndexedDB transaction failed")); }); }
}
