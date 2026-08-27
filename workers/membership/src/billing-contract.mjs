// Tested integration contracts for the next Stripe-connected phase. Not wired to live routes.
export const STRIPE_EVENTS = Object.freeze([
  'checkout.session.completed', 'invoice.paid', 'invoice.payment_failed',
  'invoice.payment_action_required', 'customer.subscription.updated',
  'customer.subscription.deleted', 'customer.subscription.paused',
  'customer.subscription.resumed', 'charge.refunded', 'charge.dispute.created'
]);

export function buildCheckoutParameters(plan, signupId, siteOrigin, mode = 'test') {
  if (!['test', 'live'].includes(mode)) throw new Error('Invalid Stripe mode');
  if (!plan || plan.verified !== true || plan.interval !== 'month' || plan.interval_count !== 1 || plan.active !== true) throw new Error('Plan not verified');
  if (plan.mode !== mode || !/^price_[A-Za-z0-9]+$/.test(plan.stripe_price_id || '')) throw new Error('Price mode mismatch');
  if (!/^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i.test(signupId)) throw new Error('Invalid signup identifier');
  // Return URLs are from server configuration, NEVER a browser-provided destination.
  const origin = new URL(siteOrigin);
  if (origin.protocol !== 'https:' || origin.username || origin.password || origin.pathname !== '/' || origin.search || origin.hash) throw new Error('Invalid site origin');
  return new URLSearchParams({
    mode: 'subscription', 'line_items[0][price]': plan.stripe_price_id, 'line_items[0][quantity]': '1',
    client_reference_id: signupId, 'metadata[signup_id]': signupId,
    'subscription_data[metadata][signup_id]': signupId,
    success_url: `${origin.origin}/membership-status.html`, cancel_url: `${origin.origin}/membership.html#plans`
  });
}

export function hasPaidAccess(subscription, now = Date.now()) {
  if (!subscription || subscription.verified !== true || subscription.livemode !== true) return false;
  const expiry = Date.parse(subscription.paid_through || '');
  if (['active', 'canceled'].includes(subscription.state)) return expiry > now;
  if (subscription.state === 'past_due') return Date.parse(subscription.grace_until || '') > now && Number.isFinite(expiry);
  // Trials and pause exceptions need explicit business policy. Default: no grant.
  return false;
}

export async function verifyStripeSignature(rawBody, header, secret, now = Date.now()) {
  if (!secret || !header) return false;
  const entries = header.split(',').map(part => part.trim().split('='));
  const times = entries.filter(([k]) => k === 't');
  if (times.length !== 1 || !/^\d+$/.test(times[0][1])) return false;
  const timestamp = Number(times[0][1]);
  if (!Number.isSafeInteger(timestamp) || Math.abs(now / 1000 - timestamp) > 300) return false;
  const signatures = entries.filter(([k, v]) => k === 'v1' && /^[a-f\d]{64}$/i.test(v)).map(([, v]) => v);
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
  for (const signature of signatures) {
    const bytes = Uint8Array.from(signature.match(/../g), pair => parseInt(pair, 16));
    if (await crypto.subtle.verify('HMAC', key, bytes, encoder.encode(`${timestamp}.${rawBody}`))) return true;
  }
  return false;
}
