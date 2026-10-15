import type { LearningProgress } from '../types/user';
export interface ProgressCache { userId: string; progress: LearningProgress; base: LearningProgress | null; revision: number; pending: boolean }
class IndexedDBService {
  private opening?: Promise<IDBDatabase>;
  init() {
    return this.opening ||= new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('CoddyCloneDB', 2);
      let blocked = false;
      request.onblocked = () => { blocked = true; this.opening = undefined; reject(new Error('Close older Alvio tabs to upgrade device storage.')); };
      request.onupgradeneeded = () => {
        const db = request.result;
        for (const name of ['users', 'session']) if (db.objectStoreNames.contains(name)) db.deleteObjectStore(name);
        for (const name of ['progress', 'progressCache']) if (!db.objectStoreNames.contains(name)) db.createObjectStore(name, { keyPath: 'userId' });
      };
      request.onsuccess = () => {
        if (blocked) { request.result.close(); return; }
        request.result.onversionchange = () => { request.result.close(); this.opening = undefined; };
        resolve(request.result);
      };
      request.onerror = () => { this.opening = undefined; reject(request.error); };
    });
  }
  private async read<T>(store: string, userId: string): Promise<T | null> {
    const db = await this.init();
    return new Promise((resolve, reject) => { const r = db.transaction(store).objectStore(store).get(userId); r.onsuccess = () => resolve(r.result || null); r.onerror = () => reject(r.error); });
  }
  getProgress(userId: string) { return this.read<LearningProgress>('progress', userId); }
  getCache(userId: string) { return this.read<ProgressCache>('progressCache', userId); }
  async saveProgress(progress: LearningProgress) {
    const db = await this.init();
    await new Promise<void>((resolve, reject) => { const tx = db.transaction('progress', 'readwrite'); tx.objectStore('progress').put(progress); tx.oncomplete = () => resolve(); tx.onerror = tx.onabort = () => reject(tx.error); });
  }
  async saveCache(cache: ProgressCache) {
    const db = await this.init();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(['progress', 'progressCache'], 'readwrite');
      tx.objectStore('progress').put(cache.progress); tx.objectStore('progressCache').put(cache);
      tx.oncomplete = () => resolve(); tx.onerror = tx.onabort = () => reject(tx.error);
    });
  }
}
export const dbService = new IndexedDBService();
