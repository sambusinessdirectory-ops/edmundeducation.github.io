// The Writing map owns the student's companion choice on this browser.
const COMPANIONS = new Set(['eddy', 'phoebe', 'elsie', 'noir', 'celeste']);
export function companionFor(owner) {
  if (!owner) return 'eddy';
  try {
    const saved = JSON.parse(localStorage.getItem(`writing-chess-map-v1:${owner}`) || 'null');
    return COMPANIONS.has(saved?.character) ? saved.character : 'eddy';
  } catch { return 'eddy'; }
}
export const companionName = Object.freeze({eddy:'Eddie',phoebe:'Phoebe',elsie:'Elsie',noir:'Noir',celeste:'Celeste'});
