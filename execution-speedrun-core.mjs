// Pure timing helpers. All values are integer milliseconds; paused time is excluded.
export function formatTime(ms, precise = false) {
  if (ms == null) return '—';
  const n = Math.max(0, Math.floor(ms));
  const seconds = Math.floor(n / 1000);
  const hours = Math.floor(seconds / 3600);
  return `${hours ? `${hours}:` : ''}${hours ? String(Math.floor(seconds / 60) % 60).padStart(2, '0') : Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}${precise ? `.${String(Math.floor(n % 1000 / 10)).padStart(2, '0')}` : ''}`;
}
export function formatDelta(ms) {
  return ms == null ? '—' : `${ms < 0 ? '−' : ms > 0 ? '+' : '±'}${formatTime(Math.abs(ms), Math.abs(ms) < 1000 && ms !== 0)}`;
}
export function parseTime(value) {
  if (!/^\d{1,4}:[0-5]\d$/.test(value.trim())) throw new Error('預計時間請填寫 分鐘:秒，例如 5:30。');
  const [m, s] = value.trim().split(':').map(Number);
  const ms = (m * 60 + s) * 1000;
  if (ms < 1000 || ms > 86400000) throw new Error('每個子項目的預計時間須介乎 0:01 至 1440:00。');
  return ms;
}
export const sectionItems = section => section.items.length ? section.items : [{ id:section.id, title:section.title, expected_ms:section.expected_ms, standalone:true }];
export const flatten = sections => sections.flatMap(section => sectionItems(section).map(item => ({ ...item, section: section.title, sectionId: section.id })));
export const expectedTotal = sections => flatten(sections).reduce((n, item) => n + item.expected_ms, 0);
export function elapsed(run, now = Date.now()) {
  return run ? Math.floor(run.elapsed_ms + (run.status === 'running' ? Math.max(0, now - Date.parse(run.anchor_at)) : 0)) : 0;
}
export function transition(run, action, now = Date.now()) {
  const next = structuredClone(run);
  const total = elapsed(run, now);
  const count = flatten(run.sections).length;
  if (action === 'resume' && run.status === 'paused') next.status = 'running';
  else if (action === 'pause' && run.status === 'running') next.status = 'paused';
  else if (action === 'split' && run.status === 'running') {
    const previous = run.splits.reduce((n, split) => n + split.elapsed_ms, 0);
    next.splits.push({ elapsed_ms: total - previous, completed: true });
    if (next.splits.length === count) next.status = 'completed';
  } else if (action === 'end' && ['running', 'paused'].includes(run.status)) next.status = 'ended';
  else throw new Error('此計時操作不適用於目前狀態。');
  next.elapsed_ms = total;
  next.anchor_at = next.status === 'running' ? new Date(now).toISOString() : null;
  next.revision++;
  if (['completed', 'ended'].includes(next.status)) next.ended_at = new Date(now).toISOString();
  return next;
}
export function resizeRect(rect, corner, dx, dy, viewport) {
  const gap = 8, minW = Math.min(300, viewport.width - gap * 2), minH = Math.min(280, viewport.height - gap * 2);
  const left = corner.includes('w') ? Math.max(gap, Math.min(rect.right - minW, rect.left + dx)) : rect.left;
  const top = corner.includes('n') ? Math.max(gap, Math.min(rect.bottom - minH, rect.top + dy)) : rect.top;
  const right = corner.includes('e') ? Math.min(viewport.width - gap, Math.max(left + minW, rect.right + dx)) : rect.right;
  const bottom = corner.includes('s') ? Math.min(viewport.height - gap, Math.max(top + minH, rect.bottom + dy)) : rect.bottom;
  return { left, top, width: right - left, height: bottom - top };
}
