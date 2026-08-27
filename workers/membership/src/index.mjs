/**
 * Membership foundation: every financial/activation route FAILS CLOSED.
 * A future reviewed release must supply Checkout, durable verified webhook processing,
 * provisioning and authenticated customer-portal handlers together, not just a flag/key.
 * No card, payer or learner data is collected or logged by this release.
 */
export default {
  async fetch(request, env = {}) {
    const origin = request.headers.get('Origin');
    const allowed = env.ALLOWED_ORIGIN || 'https://edmundeducation.com';
    const headers = {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Vary': 'Origin'
    };
    if (origin && origin !== allowed) return new Response(JSON.stringify({ error: 'origin_not_allowed' }), { status: 403, headers });
    if (origin === allowed) headers['Access-Control-Allow-Origin'] = origin;
    const path = new URL(request.url).pathname;
    const methods = {
      '/health': 'GET',
      '/api/subscriptions/checkout': 'POST',
      '/api/subscriptions/status': 'GET',
      '/api/billing/portal': 'POST',
      '/api/stripe/webhook': 'POST',
      '/api/accounts/activate': 'POST'
    };
    if (!methods[path]) return new Response(JSON.stringify({ error: 'not_found' }), { status: 404, headers });
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...headers, 'Access-Control-Allow-Methods': methods[path], 'Access-Control-Allow-Headers': 'Content-Type, Authorization' } });
    if (request.method !== methods[path]) return new Response(JSON.stringify({ error: 'method_not_allowed' }), { status: 405, headers: { ...headers, Allow: methods[path] } });
    if (path === '/health') return new Response(JSON.stringify({ service: 'edmund-membership', phase: 'foundation', checkout_enabled: false, provisioning_enabled: false, webhook_processing_enabled: false }), { headers });
    // In particular: never return 2xx to a webhook before a durable processor exists.
    return new Response(JSON.stringify({ error: 'membership_not_launched', message: '會員付款服務尚未啟用。沒有建立付款、訂閱或使用權限。' }), {
      status: 503, headers: { ...headers, 'Retry-After': '86400' }
    });
  }
};
