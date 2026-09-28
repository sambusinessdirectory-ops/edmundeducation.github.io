// The Writing map owns the student's companion choice on this browser.
const COMPANIONS = new Set(['eddy', 'phoebe', 'elsie', 'noir', 'celeste']);
export function companionStorageKeys(owner) {
  if (!owner) return [];
  const id = String(owner).replace(/^id:/, '');
  return [`writing-chess-map-v1:id:${id}`, `writing-chess-map-v1:${id}`];
}
export function companionFor(owner) {
  for (const key of companionStorageKeys(owner)) {
    try {
      const saved = JSON.parse(localStorage.getItem(key) || 'null');
      if (COMPANIONS.has(saved?.character)) return saved.character;
    } catch { /* Try the older unprefixed key. */ }
  }
  return 'eddy';
}
export const companionName = Object.freeze({eddy:'Eddie',phoebe:'Phoebe',elsie:'Elsie',noir:'Noir',celeste:'Celeste'});
