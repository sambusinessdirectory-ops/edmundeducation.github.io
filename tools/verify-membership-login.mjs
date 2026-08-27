// Optional live smoke test. Prompts without echo; never writes or prints credentials/tokens.
// Uses normal public Auth/RPC paths, never a service key. Creates an isolated anonymous
// browser identity and logs it out afterwards. It does not save or publish configuration.
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import assert from 'node:assert/strict';
const context = { window: {} };
runInNewContext(readFileSync(new URL('../supabase-config.js', import.meta.url), 'utf8'), context);
const { url, anonKey } = context.window.EDMUND_SUPABASE;
const input = process.stdin;
if (!input.isTTY) throw new Error('Run this verification in an interactive terminal.');
process.stdout.write('Membership admin password (hidden): ');
const password = await new Promise((resolve, reject) => {
  let value = '';
  input.setRawMode(true); input.resume(); input.setEncoding('utf8');
  const handler = chunk => {
    for (const char of chunk) {
      if (char === '\u0003') { cleanup(); reject(new Error('Cancelled')); return; }
      if (char === '\r' || char === '\n') { cleanup(); resolve(value); return; }
      if (char === '\u007f') value = value.slice(0, -1); else value += char;
    }
  };
  function cleanup() { input.off('data', handler); input.setRawMode(false); input.pause(); process.stdout.write('\n'); }
  input.on('data', handler);
});
let accessToken = ''; let adminToken = '';
async function call(path, payload, method = 'POST') {
  const response = await fetch(`${url}${path}`, {
    method, headers: { apikey: anonKey, 'Content-Type': 'application/json', ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
    body: payload === undefined ? undefined : JSON.stringify(payload), signal: AbortSignal.timeout(20000)
  });
  if (!response.ok) throw new Error(`Live verification failed: ${path} HTTP ${response.status}`);
  const text = await response.text(); return text ? JSON.parse(text) : null;
}
try {
  const auth = await call('/auth/v1/signup', {});
  accessToken = auth.access_token;
  assert.ok(accessToken, 'Anonymous browser session unavailable');
  const login = await call('/rest/v1/rpc/membership_admin_login', { p_name: 'Sam SaaS', p_password: password });
  assert.equal(login.ok, true, 'Administrator credentials not accepted');
  adminToken = login.token;
  const data = await call('/rest/v1/rpc/membership_admin_load', { p_admin_token: adminToken });
  assert.equal(data.sales_enabled, false);
  assert.ok(Array.isArray(data.plans));
  console.log(`PASS: real admin login and private configuration load; ${data.plans.length} draft plan(s); payment disabled.`);
  await call('/rest/v1/rpc/membership_admin_logout', { p_admin_token: adminToken });
  const denied = await fetch(`${url}/rest/v1/rpc/membership_admin_load`, { method: 'POST', headers: { apikey: anonKey, Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ p_admin_token: adminToken }), signal: AbortSignal.timeout(20000) });
  assert.equal(denied.status, 403);
  adminToken = '';
  console.log('PASS: logged-out admin token denied. No configuration was changed.');
} finally {
  if (adminToken) await call('/rest/v1/rpc/membership_admin_logout', { p_admin_token: adminToken }).catch(() => {});
  if (accessToken) await call('/auth/v1/logout?scope=local', undefined).catch(() => {});
}
