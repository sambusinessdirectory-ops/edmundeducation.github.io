/* Recordings for the essay memorization system stay in this browser's own IndexedDB. */
(() => {
  'use strict';
  const databaseName = 'edmund-essay-memory-recordings';
  const storeName = 'recordings';
  function open() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(databaseName, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(storeName, {keyPath: 'id'});
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  async function transact(mode, action) {
    const db = await open();
    try {
      return await new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, mode);
        const request = action(transaction.objectStore(storeName));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        transaction.onerror = () => reject(transaction.error);
      });
    } finally { db.close(); }
  }
  window.EssayMemoryRecordings = {
    list: () => transact('readonly', store => store.getAll()),
    get: id => transact('readonly', store => store.get(id)),
    save: record => transact('readwrite', store => store.put(record)),
    remove: id => transact('readwrite', store => store.delete(id)),
  };
})();
