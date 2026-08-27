import { WorkerEntrypoint } from 'cloudflare:workers';

// Internal RPC only: no fetch() handler, URL route, CORS access or browser token.
// Existing student routes remain in index.js and never call this entrypoint.
export class BackupSource extends WorkerEntrypoint {
  async #request(path, options = {}) {
    const origin = new URL(this.env.SUPABASE_URL);
    if (origin.origin !== 'https://ookkxzgpdclzrrhfmvqx.supabase.co') throw new Error('Backup source origin mismatch');
    const key = this.env.SUPABASE_SECRET_KEY || this.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!key) throw new Error('Backup source unavailable');
    const headers = new Headers(options.headers);
    headers.set('apikey', key);
    if (!key.startsWith('sb_secret_')) headers.set('Authorization', `Bearer ${key}`);
    const response = await fetch(origin.origin + path, { ...options, headers, redirect: 'manual', signal: AbortSignal.timeout(120000) });
    if (!response.ok) {
      await response.body?.cancel();
      // Do not log upstream SQL, credentials, or student content.
      throw new Error(`Backup source request failed (${response.status})`);
    }
    return response;
  }
  async #rpc(name, payload, stream = false) {
    const response = await this.#request(`/rest/v1/rpc/${name}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    });
    return stream ? response : response.json();
  }
  capture(requestedFor, leaseId) {
    return this.#rpc('system_backup_capture', { p_requested_for: requestedFor, p_lease_id: leaseId });
  }
  chunk(runId, ordinal, leaseId) {
    if (!Number.isSafeInteger(ordinal) || ordinal < 0) throw new Error('Invalid chunk');
    return this.#rpc('system_backup_chunk', { p_run_id: runId, p_ordinal: ordinal, p_lease_id: leaseId }, true);
  }
  storageManifest(runId, leaseId) {
    return this.#rpc('system_backup_storage_manifest', { p_run_id: runId, p_lease_id: leaseId });
  }
  readStorage(bucket, name) {
    if (!/^[a-zA-Z0-9_-]{1,100}$/.test(bucket) || typeof name !== 'string' || name.length > 2048
      || name.split('/').some(part => !part || part === '.' || part === '..')) throw new Error('Invalid storage object');
    return this.#request(`/storage/v1/object/authenticated/${encodeURIComponent(bucket)}/${name.split('/').map(encodeURIComponent).join('/')}`);
  }
  verify(runId, leaseId, objectKey, sha256) {
    return this.#rpc('system_backup_verify', { p_run_id: runId, p_lease_id: leaseId, p_object_key: objectKey, p_sha256: sha256 });
  }
  requestV2(requestedFor, leaseId) {
    return this.#rpc('system_backup_request_v2', { p_requested_for: requestedFor, p_lease_id: leaseId });
  }
  pageV2(runId, after, leaseId) {
    if (!Number.isSafeInteger(after) || after < -1) throw new Error('Invalid page cursor');
    return this.#rpc('system_backup_page_v2', { p_run_id: runId, p_after: after, p_lease_id: leaseId }, true);
  }
  storageV2(runId, leaseId) {
    return this.#rpc('system_backup_storage_v2', { p_run_id: runId, p_lease_id: leaseId });
  }
  storagePartV2(bucket, name, offset, length, etag) {
    if (!/^[a-zA-Z0-9_-]{1,100}$/.test(bucket) || typeof name !== 'string' || name.length > 2048
      || name.split('/').some(part => !part || part === '.' || part === '..')
      || !Number.isSafeInteger(offset) || offset < 0 || !Number.isSafeInteger(length) || length < 1 || length > 1048576) throw new Error('Invalid recording range');
    const headers = { Range: `bytes=${offset}-${offset + length - 1}` };
    if (etag) {
      const clean = String(etag).replace(/^"|"$/g, '');
      if (!/^[A-Za-z0-9_-]{1,150}$/.test(clean)) throw new Error('Invalid recording version');
      headers['If-Match'] = `"${clean}"`;
    }
    return this.#request(`/storage/v1/object/authenticated/${encodeURIComponent(bucket)}/${name.split('/').map(encodeURIComponent).join('/')}`, {headers});
  }
  verifyV2(runId, leaseId, objectKey, sha256) {
    return this.#rpc('system_backup_verify_v2', { p_run_id: runId, p_lease_id: leaseId, p_object_key: objectKey, p_sha256: sha256 });
  }
  cleanupV2(runId) {
    return this.#rpc('system_backup_cleanup_v2', { p_run_id: runId });
  }
}
