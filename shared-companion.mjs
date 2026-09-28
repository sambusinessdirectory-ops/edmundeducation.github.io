const VALID = new Set(['eddy', 'phoebe', 'elsie', 'noir', 'celeste']);
const PREFIX = 'edmund-companion-v1:';

export function companionKey(owner) {
  return `${PREFIX}${String(owner || '').replace(/^id:/, '')}`;
}

export function selectedCompanion(owner, storage = globalThis.localStorage) {
  if (!owner || !storage) return null;
  const id = String(owner).replace(/^id:/, '');
  const keys = [companionKey(id), `edmund-lesson-map-v1:sentence-structure:${id}`,
    `edmund-expression-meadow-v2:${id}`, `writing-chess-map-v1:id:${id}`,
    `writing-chess-map-v1:${id}`];
  try {
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key?.startsWith('edmund-lesson-map-v1:') && key.endsWith(`:${id}`) && !keys.includes(key)) keys.push(key);
    }
    for (const key of keys) {
      const choice = JSON.parse(storage.getItem(key) || 'null')?.character;
      if (VALID.has(choice)) return choice;
    }
  } catch { /* Storage can be disabled; keep the map's local choice. */ }
  return null;
}

export function selectCompanion(owner, character, storage = globalThis.localStorage) {
  if (!owner || !VALID.has(character) || !storage) return false;
  try {
    storage.setItem(companionKey(owner), JSON.stringify({ character }));
    return true;
  } catch { return false; }
}
