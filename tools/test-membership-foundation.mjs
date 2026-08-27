import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SALES_ENABLED, amountFromInput, formatAmount, safeHttps, SYSTEMS } from '../membership-shared.mjs';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = file => readFileSync(resolve(root, file), 'utf8');

test('public purchase preview is reachable without any student authentication', () => {
  const page = read('membership.html');
  assert.match(read('index.html'), /href="membership.html"[^>]*>[\s\S]*?Edmund 學習系統<br>會員計劃/);
  assert.match(page, /href="membership-admin.html">Admin login/);
  assert.match(page, /disabled>尚未開放訂閱/);
  assert.doesNotMatch(page, /type="password"|student-login|auth-guard/);
  assert.equal(SALES_ENABLED, false);
  assert.match(read('membership.js'), /action.disabled = true/);
  assert.doesNotMatch(read('membership.js'), /signIn|subscriptions\/checkout/);
});
test('all new local HTML assets/links exist, and each page has a CSP', () => {
  for (const file of ['membership.html', 'membership-admin.html', 'membership-status.html']) {
    const page = read(file);
    assert.match(page, /Content-Security-Policy/);
    for (const [, url] of page.matchAll(/(?:src|href)="([^"#]+)"/g)) {
      if (/^(https?:|mailto:)/.test(url)) continue;
      assert.ok(existsSync(resolve(root, url.split(/[?#]/)[0].replace(/^\//, ''))), `${file}: missing ${url}`);
    }
  }
});
test('admin session is isolated and editable content is rendered as text', () => {
  const admin = read('membership-admin.js');
  assert.match(admin, /storageKey: 'edmund-membership-auth-v1'/);
  assert.match(admin, /membership_admin_login/);
  assert.match(admin, /membership_admin_logout/);
  assert.match(admin, /p_revision: revision/);
  assert.match(admin, /p_publish: publish/);
  for (const file of ['membership-admin.js', 'membership.js', 'membership-shared.mjs']) assert.doesNotMatch(read(file), /innerHTML\s*=|insertAdjacentHTML/);
  assert.doesNotMatch(read('membership-admin.html'), /value="[^"\n]*[!?@][^"\n]*"/);
});
test('money input and policy links reject unsafe or ambiguous values', () => {
  assert.equal(amountFromInput(''), null);
  assert.equal(amountFromInput('199.90'), 19990);
  assert.equal(amountFromInput('0.29'), 29);
  for (const bad of ['0', '-1', '1e2', '12.345', 'not money', '1,000']) assert.throws(() => amountFromInput(bad));
  assert.equal(formatAmount(null), '價格待公布');
  assert.equal(safeHttps('javascript:alert(1)'), '');
  assert.equal(safeHttps('https://user:password@example.com'), '');
  assert.equal(safeHttps('https://example.com/terms'), 'https://example.com/terms');
  assert.equal(new Set(SYSTEMS.map(([id]) => id)).size, SYSTEMS.length);
});
test('migration maintains a private financial boundary and cannot publish sales enabled', () => {
  const sql = read('supabase/migrations/20260827101941_membership_billing_foundation.sql');
  assert.match(sql, /revoke all on public.membership_catalog from public, anon, authenticated/);
  assert.match(sql, /grant select on public.membership_catalog to anon, authenticated/);
  assert.match(sql, /s.auth_user_id=auth.uid\(\)/);
  assert.match(sql, /s.expires_at>now\(\)/);
  assert.match(sql, /'sales_enabled',false/);
  assert.match(sql, /stripe_event_id text primary key/);
  assert.doesNotMatch(sql, /insert into membership_private.admin_accounts/);
  assert.match(read('.github/workflows/pages.yml'), /--exclude='supabase'/);
});
