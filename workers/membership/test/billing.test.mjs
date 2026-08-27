import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac, webcrypto } from 'node:crypto';
import worker from '../src/index.mjs';
import { buildCheckoutParameters, hasPaidAccess, verifyStripeSignature } from '../src/billing-contract.mjs';

if (!globalThis.crypto) globalThis.crypto = webcrypto;
const origin = 'https://edmundeducation.com';
const request = (path, method = 'GET', headers = {}) => new Request(`https://example.workers.dev${path}`, { method, headers });

test('health explicitly describes a non-billing foundation', async () => {
  const response = await worker.fetch(request('/health'));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { service: 'edmund-membership', phase: 'foundation', checkout_enabled: false, provisioning_enabled: false, webhook_processing_enabled: false });
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
});
for (const [path, method] of [
  ['/api/subscriptions/checkout', 'POST'], ['/api/subscriptions/status', 'GET'],
  ['/api/billing/portal', 'POST'], ['/api/stripe/webhook', 'POST'], ['/api/accounts/activate', 'POST']
]) {
  test(`${path} fails closed even with enabling flags and keys`, async () => {
    const req = request(path, method, { Origin: origin });
    req.json = req.text = () => { throw new Error('Must not read customer data'); };
    const response = await worker.fetch(req, { SALES_ENABLED: 'true', STRIPE_SECRET_KEY: 'test-fixture-not-a-real-key' });
    assert.equal(response.status, 503);
    assert.equal((await response.json()).error, 'membership_not_launched');
    assert.equal(response.headers.get('Access-Control-Allow-Origin'), origin);
  });
}
test('routes restrict methods/origins, and never allow wildcard CORS', async () => {
  assert.equal((await worker.fetch(request('/missing'))).status, 404);
  assert.equal((await worker.fetch(request('/api/subscriptions/checkout'))).status, 405);
  const foreign = await worker.fetch(request('/health', 'GET', { Origin: 'https://another.example' }));
  assert.equal(foreign.status, 403);
  assert.equal(foreign.headers.get('Access-Control-Allow-Origin'), null);
  const preflight = await worker.fetch(request('/api/subscriptions/checkout', 'OPTIONS', { Origin: origin }));
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('Access-Control-Allow-Methods'), 'POST');
});

const plan = { verified: true, active: true, interval: 'month', interval_count: 1, mode: 'test', stripe_price_id: 'price_fixture' };
const signupId = '36dd7f90-bd3f-428a-8fc3-845db9626dd0';
test('future checkout contract uses a verified monthly server price, not an amount', () => {
  const parameters = buildCheckoutParameters(plan, signupId, origin);
  assert.equal(parameters.get('mode'), 'subscription');
  assert.equal(parameters.get('line_items[0][price]'), 'price_fixture');
  assert.equal(parameters.get('line_items[0][quantity]'), '1');
  assert.equal(parameters.get('subscription_data[metadata][signup_id]'), signupId);
  assert.equal(parameters.has('amount'), false);
  assert.throws(() => buildCheckoutParameters({ ...plan, verified: false }, signupId, origin));
  assert.throws(() => buildCheckoutParameters({ ...plan, interval: 'year' }, signupId, origin));
  assert.throws(() => buildCheckoutParameters(plan, signupId, origin, 'live'));
  assert.throws(() => buildCheckoutParameters(plan, 'unsafe-id', origin));
  assert.throws(() => buildCheckoutParameters(plan, signupId, 'http://example.com'));
  assert.throws(() => buildCheckoutParameters(plan, signupId, `${origin}/redirect`));
});
const now = Date.parse('2026-08-27T12:00:00Z');
test('future access contract requires verified live payment and valid paid dates', () => {
  const sub = { verified: true, livemode: true, state: 'active', paid_through: '2026-09-27T12:00:00Z' };
  assert.equal(hasPaidAccess(sub, now), true);
  assert.equal(hasPaidAccess({ ...sub, state: 'canceled' }, now), true);
  assert.equal(hasPaidAccess({ ...sub, paid_through: '2026-08-01T00:00:00Z' }, now), false);
  assert.equal(hasPaidAccess({ ...sub, verified: false }, now), false);
  assert.equal(hasPaidAccess({ ...sub, livemode: false }, now), false);
  for (const state of ['trialing', 'incomplete', 'incomplete_expired', 'paused', 'unpaid']) assert.equal(hasPaidAccess({ ...sub, state }, now), false);
  assert.equal(hasPaidAccess({ ...sub, state: 'past_due', grace_until: '2026-08-28T12:00:00Z' }, now), true);
  assert.equal(hasPaidAccess({ ...sub, state: 'past_due', paid_through: null, grace_until: '2026-08-28T12:00:00Z' }, now), false);
});
test('future signature contract rejects altered, stale and malformed signatures', async () => {
  const body = '{"id":"evt_fixture","type":"invoice.paid"}';
  const secret = 'local-test-secret';
  const t = Math.floor(now / 1000);
  const sig = createHmac('sha256', secret).update(`${t}.${body}`).digest('hex');
  const header = `t=${t},v1=${sig}`;
  assert.equal(await verifyStripeSignature(body, header, secret, now), true);
  assert.equal(await verifyStripeSignature(body + ' ', header, secret, now), false);
  assert.equal(await verifyStripeSignature(body, header, 'other-secret', now), false);
  assert.equal(await verifyStripeSignature(body, header, secret, now + 301000), false);
  assert.equal(await verifyStripeSignature(body, `t=${t},t=${t},v1=${sig}`, secret, now), false);
  assert.equal(await verifyStripeSignature(body, `t=no,v1=${sig}`, secret, now), false);
  assert.equal(await verifyStripeSignature(body, `t=${t},v1=invalid`, secret, now), false);
  assert.equal(await verifyStripeSignature(body, `t=${t},v1=${'0'.repeat(64)},v1=${sig}`, secret, now), true);
});
