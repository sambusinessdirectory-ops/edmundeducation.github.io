(() => {
  'use strict';
  const databaseName = 'edmund-student-practice-v1';
  const storeName = 'progress';
  let databasePromise;
  function database() {
    if (databasePromise) return databasePromise;
    databasePromise = new Promise((resolve, reject) => {
      if (!window.indexedDB) { reject(new Error('IndexedDB unavailable')); return; }
      const request = indexedDB.open(databaseName, 1);
      const timer = setTimeout(() => reject(new Error('IndexedDB timed out')), 3500);
      request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains(storeName)) request.result.createObjectStore(storeName); };
      request.onsuccess = () => { clearTimeout(timer); resolve(request.result); };
      request.onerror = () => { clearTimeout(timer); reject(request.error || new Error('IndexedDB unavailable')); };
      request.onblocked = () => { clearTimeout(timer); reject(new Error('IndexedDB blocked')); };
    });
    return databasePromise;
  }
  async function get(key) {
    const db = await database();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const request = transaction.objectStore(storeName).get(key);
      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => reject(request.error);
      transaction.onerror = () => reject(transaction.error);
    });
  }
  async function put(key, value) {
    const db = await database();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      transaction.objectStore(storeName).put(value, key);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error || new Error('IndexedDB write aborted'));
    });
  }
  function localRead(key) {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); }
    catch { return null; }
  }
  async function read(key) {
    const local = localRead(key);
    try {
      const stored = await get(key);
      if (stored != null) return stored;
      if (local != null) await put(key, local);
    } catch { /* Fall back to existing local data. */ }
    return local;
  }
  async function write(key, value) {
    try { await put(key, value); return 'indexeddb'; }
    catch {
      try { localStorage.setItem(key, JSON.stringify(value)); return 'localStorage'; }
      catch { return 'unavailable'; }
    }
  }
  window.EDMUND_DURABLE_STUDENT_PROGRESS = Object.freeze({ read, write });
})();
