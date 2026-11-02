/* Recordings for the essay memorization system stay in this browser's own IndexedDB. */
(() => {
  'use strict';
  const databaseName = 'edmund-essay-memory-recordings';
  const storeName = 'recordings';
  const owner = () => window.EssayMemoryAuth?.user?.id;
  const ownedId = id => `${owner()}:${id}`;
  const legacyOwnerKey = 'edmund-essay-memory-legacy-owner-v1';
  function ownsLegacy(claim = false) {
    try {
      const claimed = localStorage.getItem(legacyOwnerKey);
      if (!claimed && claim) localStorage.setItem(legacyOwnerKey, owner());
      return claimed === owner() || (!claimed && claim);
    } catch { return false; }
  }
  function requireOwner() {
    if (!owner()) throw new Error('請先登入學生帳戶。');
  }
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
    list: async () => {
      requireOwner();
      const records = await transact('readonly', store => store.getAll());
      const includeLegacy = ownsLegacy(records.some(record => !record.ownerId));
      return records
        .filter(record => record.ownerId === owner() || (includeLegacy && !record.ownerId))
        .map(({ownerId, ...record}) => ({...record, id: ownerId ? record.id.slice(ownerId.length + 1) : record.id}));
    },
    get: async id => {
      requireOwner();
      let record = await transact('readonly', store => store.get(ownedId(id)));
      if (!record && !/^[0-9a-f-]{36}:/.test(id)) {
        const legacy = await transact('readonly', store => store.get(id));
        if (legacy && !legacy.ownerId && ownsLegacy(true)) record = legacy;
      }
      if (!record) return undefined;
      return record?.ownerId === owner() || (!record?.ownerId && ownsLegacy()) ? {...record, id} : undefined;
    },
    save: record => {
      requireOwner();
      return transact('readwrite', store => store.put({...record, id: ownedId(record.id), ownerId: owner()}));
    },
    remove: id => {
      requireOwner();
      return transact('readwrite', store => store.delete(ownedId(id))).then(() =>
        ownsLegacy() && !/^[0-9a-f-]{36}:/.test(id) ? transact('readwrite', store => store.delete(id)) : undefined);
    },
  };
})();
