import { companionKey, selectedCompanion } from '../shared-companion.mjs?v=20260928-sync1';
export function companionStorageKeys(owner) {
  if (!owner) return [];
  const id = String(owner).replace(/^id:/, '');
  return [companionKey(id), `edmund-lesson-map-v1:sentence-structure:${id}`, `edmund-expression-meadow-v2:${id}`, `writing-chess-map-v1:id:${id}`, `writing-chess-map-v1:${id}`];
}
export function companionFor(owner) {
  return selectedCompanion(owner) || 'eddy';
}
export const companionName = Object.freeze({eddy:'Eddie',phoebe:'Phoebe',elsie:'Elsie',noir:'Noir',celeste:'Celeste'});
