// Ephemeral lesson display state. Durable progress remains in each system's save API.
export const classroomPollDelay = (active, lastActivity, now = Date.now()) =>
  !active ? 60000 : now - lastActivity < 60000 ? 2000 : 30000;
export function createClassroomLiveSync({ system, context, read, apply, rpc, environment = globalThis }) {
  const env = environment, doc = env.document;
  let key = '', revision = 0, pending = null, serial = 0, busy = false, stopped = false;
  let nextPoll = 0, lastActivity = Date.now(), lastInput = 0, failures = 0, applying = false, lastSent = '';
  const identity = c => c?.owner && c?.token && c?.scope ? `${c.owner}:${c.token}:${c.scope}` : '';
  const activity = e => { lastActivity = Date.now(); if (e.type === 'input') lastInput = lastActivity; };
  for (const event of ['pointerdown', 'keydown', 'input']) doc?.addEventListener(event, activity, { passive: true });
  function current() {
    const c = context(), next = identity(c);
    if (next !== key) { key = next; revision = 0; pending = null; serial++; nextPoll = 0; failures = 0; lastSent = ''; }
    return c;
  }
  function publish() {
    if (stopped || applying) return;
    const c = current(); if (!key || !c.active) return;
    const payload = read(); if (!payload) return;
    const encoded = JSON.stringify(payload); if (encoded === lastSent) return;
    lastSent = encoded;
    pending = { payload: JSON.parse(encoded), mutation: env.crypto.randomUUID(), serial: ++serial };
    lastActivity = Date.now(); nextPoll = 0;
    void tick();
  }
  async function tick() {
    if (stopped || busy || doc?.hidden) return;
    const c = current(); if (!key || Date.now() < nextPoll) return;
    // Do not replace a sentence while this device is actively composing it.
    if (!pending && Date.now() - lastInput < 1000) return;
    busy = true; const requestKey = key, requestSerial = serial, write = pending;
    try {
      const result = await rpc('classroom_live_sync', {
        p_token: c.token, p_system: system, p_scope: String(c.scope), p_since: revision,
        p_payload: write?.payload ?? null, p_mutation: write?.mutation ?? null
      });
      if (stopped || identity(context()) !== requestKey || key !== requestKey) return;
      failures = 0;
      if (write && pending?.mutation === write.mutation) pending = null;
      if (result?.revision != null && requestSerial === serial) {
        if (!write && result.payload && !pending) {
          if (Date.now() - lastInput < 1000) { nextPoll = Date.now() + 1000; return; }
          lastActivity = Date.now(); lastSent = JSON.stringify(result.payload);
          applying = true;
          try { await apply(result.payload); } finally { applying = false; }
        }
        revision = Number(result.revision);
      }
      nextPoll = Date.now() + (pending ? 0 : classroomPollDelay(c.active, lastActivity));
    } catch {
      failures++;
      nextPoll = Date.now() + Math.min(60000, 2000 * 2 ** Math.min(failures, 5));
    } finally { busy = false; }
  }
  const resume = () => { if (!doc?.hidden) { nextPoll = 0; lastActivity = Date.now(); void tick(); } };
  doc?.addEventListener('visibilitychange', resume); env.addEventListener?.('online', resume);
  const timer = env.setInterval(() => { void tick(); }, 1000);
  return { publish, refresh: resume, tick, get applying() { return applying; }, stop() {
    stopped = true; env.clearInterval(timer);
    for (const event of ['pointerdown', 'keydown', 'input']) doc?.removeEventListener(event, activity);
    doc?.removeEventListener('visibilitychange', resume); env.removeEventListener?.('online', resume);
  } };
}
