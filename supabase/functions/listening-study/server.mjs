import { inspectMp3 } from './mp3.mjs';

const BUCKET = 'listening-recordings';
const MAX_FILE = 3 * 1024 * 1024;
const MAX_TOTAL = 100 * 1024 * 1024;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ORIGINS = new Set(['https://edmundeducation.com', 'https://www.edmundeducation.com', 'https://edmundeducation.github.io']);
const PUBLIC_FIELDS = 'id,practice,part,row_index,title,transcript,size_bytes,duration_ms,storage_state,created_at';
class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
const fail = (status, message) => { throw new HttpError(status, message); };

async function readBytes(request, maximum) {
  const size = request.headers.get('content-length');
  if (size !== null && (!/^\d+$/.test(size) || Number(size) > maximum)) fail(413, 'Request is too large.');
  if (!request.body) return new Uint8Array();
  const reader = request.body.getReader();
  const chunks = []; let length = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.length;
      if (length > maximum) { await reader.cancel(); fail(413, 'Request is too large.'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(length); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return bytes;
}
async function readJson(request) {
  const bytes = await readBytes(request, 12000);
  try { return JSON.parse(new TextDecoder().decode(bytes)); } catch { fail(400, 'Invalid request.'); }
}
async function digest(bytes) {
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function handleRequest(request, env, transport = fetch) {
  const origin = request.headers.get('origin') || '';
  const headers = {
    'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store',
    'Vary': 'Origin', 'X-Content-Type-Options': 'nosniff',
    ...(ORIGINS.has(origin) ? { 'Access-Control-Allow-Origin': origin } : {}),
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  };
  const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers });
  try {
    if (!ORIGINS.has(origin)) fail(403, 'Origin not allowed.');
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (!env.url || !env.key) fail(503, 'Listening storage is not configured yet.');
    const upstream = async (path, options = {}) => {
      const h = new Headers(options.headers || {});
      h.set('apikey', env.key);
      if (!env.key.startsWith('sb_secret_')) h.set('Authorization', `Bearer ${env.key}`);
      return transport(`${env.url}${path}`, { ...options, headers: h, redirect: 'manual', signal: AbortSignal.timeout(25000) });
    };
    const data = async (path, options = {}) => {
      const res = await upstream(path, options);
      if (!res.ok) fail(502, 'Listening service is temporarily unavailable. Your unsaved MP3 is still available to download.');
      const text = await res.text();
      return text ? JSON.parse(text) : null;
    };
    const rpc = (name, payload) => data(`/rest/v1/rpc/${name}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    });
    const table = (name, params, options) => data(`/rest/v1/${name}?${new URLSearchParams(params)}`, options);
    const patch = body => ({ method: 'PATCH', headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' }, body: JSON.stringify(body) });
    const url = new URL(request.url);
    const path = url.pathname.replace(/^.*\/listening-study/, '');
    const method = request.method;
    if (path === '/admin/login' && method === 'POST') {
      const { username, password } = await readJson(request);
      if (typeof username !== 'string' || typeof password !== 'string') fail(400, 'Enter your username and password.');
      const result = await rpc('listening_admin_login', { p_name: username, p_password: password });
      if (result.limited) fail(429, 'Too many attempts. Please wait one minute.');
      if (!result.token) fail(401, 'Invalid username or password.');
      return json(result);
    }
    const token = (request.headers.get('authorization') || '').match(/^Bearer (\S+)$/i)?.[1];
    if (!UUID.test(token || '')) fail(401, 'Please sign in again.');
    const isAdmin = path.startsWith('/admin/');
    const profiles = await rpc(isAdmin ? 'listening_admin_me' : 'listening_student_profile', { p_token: token });
    const user = profiles?.[0];
    if (!user?.id) fail(401, 'Your session has expired. Please sign in again.');
    if (path === '/admin/me' && method === 'GET') return json({ name: user.name });
    if (path === '/admin/logout' && method === 'POST') {
      await rpc('listening_admin_logout', { p_token: token }); return json({ ok: true });
    }
    if ((path === '/bookmarks' || path === '/admin/bookmarks') && method === 'GET') {
      const offset = Number(url.searchParams.get('offset') || 0);
      if (!Number.isSafeInteger(offset) || offset < 0 || offset > 1000000) fail(400, 'Invalid page.');
      const rows = await table('learning_portal_bookmarks', {
        select: 'item_key,title,detail,href,difficulty,created_at,updated_at' + (isAdmin ? ',student_id,flashcard_students!inner(name)' : ''),
        system_key: 'eq.listening', ...(!isAdmin ? { student_id: `eq.${user.id}` } : {}),
        order: 'created_at.asc,student_id.asc,item_key.asc', limit: '500', offset: String(offset)
      });
      return json({ rows, nextOffset: rows.length === 500 ? offset + 500 : null });
    }
    if (path === '/bookmarks/rating' && method === 'PATCH') {
      const { itemKey, difficulty } = await readJson(request);
      if (typeof itemKey !== 'string' || itemKey.length > 180 || !Number.isInteger(difficulty) || difficulty < 1 || difficulty > 5) fail(400, 'Choose a difficulty from 1 to 5.');
      const rows = await table('learning_portal_bookmarks', { student_id: `eq.${user.id}`, system_key: 'eq.listening', item_key: `eq.${itemKey}` }, patch({ difficulty, updated_at: new Date().toISOString() }));
      if (!rows.length) fail(404, 'Bookmark no longer exists. Refresh your bookmarks.');
      return json({ difficulty });
    }
    if (path === '/recordings' && method === 'GET') {
      // Each valid MP3 is >= 1 sec; paginate, never silently truncate quota usage.
      const rows = []; let offset = 0;
      while (true) {
        const page = await table('listening_recordings', { select: PUBLIC_FIELDS, student_id: `eq.${user.id}`, order: 'created_at.desc,id.asc', limit: '500', offset: String(offset) });
        rows.push(...page); if (page.length < 500) break; offset += 500;
        if (offset > 200000) fail(503, 'Please contact your teacher to review recording storage.');
      }
      const usedBytes = rows.reduce((sum, row) => sum + row.size_bytes, 0);
      return json({ rows, quota: { usedBytes, maxBytes: MAX_TOTAL, maxFileBytes: MAX_FILE, maxDurationMs: 300000 } });
    }
    if (path === '/recordings' && method === 'POST') {
      const bytes = await readBytes(request, MAX_FILE + 32 * 1024);
      const type = request.headers.get('content-type') || '';
      if (!type.startsWith('multipart/form-data;')) fail(415, 'A recorded MP3 is required.');
      let form;
      try { form = await new Response(bytes, { headers: { 'Content-Type': type } }).formData(); } catch { fail(400, 'Invalid recording upload.'); }
      const text = (key) => {
        if (form.getAll(key).length !== 1 || typeof form.get(key) !== 'string') fail(400, 'Invalid recording details.');
        return form.get(key);
      };
      const id = text('id'), practice = Number(text('practice')), part = Number(text('part'));
      const rowValue = text('rowIndex'), row = rowValue === '' ? null : Number(rowValue);
      const title = text('title'), transcript = text('transcript');
      if (!UUID.test(id) || !Number.isInteger(practice) || practice < 1 || practice > 20 || !Number.isInteger(part) || part < 1 || part > 4
        || (row !== null && (!Number.isInteger(row) || row < 0 || row > 9999)) || !title.trim() || title.length > 300 || transcript.length > 3000) fail(400, 'Invalid recording details.');
      const file = form.get('file');
      if (form.getAll('file').length !== 1 || !file || typeof file.arrayBuffer !== 'function' || file.type !== 'audio/mpeg') fail(415, 'A genuine MP3 recording is required.');
      if (file.size > MAX_FILE) fail(413, 'Each recording must be smaller than 3 MB.');
      const audio = new Uint8Array(await file.arrayBuffer());
      const mp3 = inspectMp3(audio);
      if (!mp3) fail(415, 'This is not a valid MP3 recording.');
      if (mp3.durationMs > 301000) fail(413, 'Each recording can be up to 5 minutes long.');
      const hash = await digest(audio);
      const reserved = await rpc('listening_reserve_recording', {
        p_student: user.id, p_id: id, p_practice: practice, p_part: part, p_row: row,
        p_title: title, p_transcript: transcript, p_size: file.size, p_duration: mp3.durationMs, p_sha256: hash
      });
      if (reserved.error) fail(reserved.status || 409, reserved.error);
      const recording = reserved.recording;
      if (recording.storage_state !== 'ready') {
        const object = `/storage/v1/object/${BUCKET}/${recording.object_path}`;
        const uploaded = await upstream(object, { method: 'POST', headers: { 'Content-Type': 'audio/mpeg', 'x-upsert': 'false' }, body: audio });
        if (!uploaded.ok) {
          // Idempotent retry after an ambiguous response: verify the stored bytes,
          // never overwrite an object or charge the student's quota twice.
          const existing = await upstream(object);
          if (!existing.ok || await digest(new Uint8Array(await existing.arrayBuffer())) !== hash) fail(502, 'Upload did not finish. Keep this page open and retry Save, or download the MP3.');
        }
        const finished = await table('listening_recordings', { id: `eq.${id}`, student_id: `eq.${user.id}`, storage_state: 'eq.uploading' }, patch({ storage_state: 'ready', updated_at: new Date().toISOString() }));
        if (!finished.length) fail(409, 'Recording changed while saving. Please refresh your recordings.');
      }
      return json({ id, saved: true });
    }
    const recordingMatch = path.match(/^\/recordings\/([0-9a-f-]{36})$/i);
    if (recordingMatch && ['GET', 'DELETE'].includes(method)) {
      const id = recordingMatch[1];
      if (!UUID.test(id)) fail(404, 'Recording not found.');
      const rows = await table('listening_recordings', { select: '*', id: `eq.${id}`, student_id: `eq.${user.id}` });
      if (!rows.length) fail(404, 'Recording not found.');
      let row = rows[0];
      if (method === 'DELETE') {
        const claim = await rpc('listening_claim_recording_delete', { p_student: user.id, p_id: id });
        if (claim.error) fail(claim.status, claim.error);
        row = claim.recording;
        const deleted = await upstream(`/storage/v1/object/${BUCKET}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prefixes: [row.object_path] }) });
        if (!deleted.ok) fail(502, 'Deletion did not finish. Please retry Delete; your recording still counts towards storage.');
        await table('listening_recordings', { id: `eq.${id}`, student_id: `eq.${user.id}`, storage_state: 'eq.deleting' }, { method: 'DELETE' });
        return json({ deleted: true });
      }
      if (row.storage_state !== 'ready') fail(409, 'Recording is still being saved or deleted.');
      const media = await upstream(`/storage/v1/object/${BUCKET}/${row.object_path}`);
      if (!media.ok) fail(502, 'This recording is temporarily unavailable.');
      return new Response(media.body, { headers: { ...headers, 'Content-Type': 'audio/mpeg', 'Content-Disposition': `attachment; filename="listening-${id}.mp3"` } });
    }
    fail(404, 'Not found.');
  } catch (error) {
    // Never log credentials, bearer tokens, transcripts, or upstream payloads.
    return json({ error: error instanceof HttpError ? error.message : 'Listening service is temporarily unavailable. Please retry.' }, error instanceof HttpError ? error.status : 503);
  }
}
