/* Recordings for the essay memorization system stay in this browser's own IndexedDB. */
(() => {
  'use strict';
  const databaseName = 'edmund-essay-memory-recordings';
  const storeName = 'recordings';
  const owner = () => window.EssayMemoryAuth?.user?.id;
  const ownedId = id => `${owner()}:${id}`;
  const legacyOwnerKey = 'edmund-essay-memory-legacy-owner-v1';
  function ownsLegacy() {
    try {
      const claimed = localStorage.getItem(legacyOwnerKey);
      if (!claimed) localStorage.setItem(legacyOwnerKey, owner());
      return !claimed || claimed === owner();
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
      const includeLegacy = ownsLegacy();
      return (await transact('readonly', store => store.getAll()))
        .filter(record => record.ownerId === owner() || (includeLegacy && !record.ownerId))
        .map(({ownerId, ...record}) => ({...record, id: ownerId ? record.id.slice(ownerId.length + 1) : record.id}));
    },
    get: async id => {
      requireOwner();
      let record = await transact('readonly', store => store.get(ownedId(id)));
      if (!record && ownsLegacy()) record = await transact('readonly', store => store.get(id));
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
        ownsLegacy() ? transact('readwrite', store => store.delete(id)) : undefined);
    },
  };
})();
