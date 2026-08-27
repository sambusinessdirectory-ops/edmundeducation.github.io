import { el, formatAmount, safeHttps } from './membership-shared.mjs';

async function loadCatalogue() {
  const settings = window.EDMUND_SUPABASE;
  if (!settings) return;
  try {
    const response = await fetch(`${settings.url}/rest/v1/membership_catalog?id=eq.1&select=payload`, {
      headers: { apikey: settings.anonKey }, cache: 'no-store', signal: AbortSignal.timeout(12000)
    });
    if (!response.ok) throw new Error('catalog_unavailable');
    const rows = await response.json();
    const catalogue = rows?.[0]?.payload;
    if (!catalogue) return;
    if (Array.isArray(catalogue.plans) && catalogue.plans.length) {
      const list = document.querySelector('#plan-list');
      list.replaceChildren();
      catalogue.plans.forEach(plan => {
        const card = el('article', 'plan-card');
        const price = el('p', 'plan-price', formatAmount(plan.amount_minor, plan.currency));
        price.append(el('small', '', ' / 月'));
        const benefits = el('ul');
        for (const item of (plan.benefits || [])) benefits.append(el('li', '', item));
        const action = el('button', 'button button-dark', '尚未開放訂閱');
        action.disabled = true;
        // Deliberately no form submission or checkout link in the foundation release.
        card.append(el('span', 'small-label', '計劃預覽 · 暫未收款'), el('h3', '', plan.title), price, el('p', '', plan.summary), benefits, action);
        list.append(card);
      });
    }
    const policy = catalogue.settings || {};
    if (safeHttps(policy.terms_url)) document.querySelector('#terms-link').href = safeHttps(policy.terms_url);
    if (safeHttps(policy.privacy_url)) document.querySelector('#privacy-link').href = safeHttps(policy.privacy_url);
    if (policy.cancellation_text) document.querySelector('#cancellation-copy').textContent = policy.cancellation_text;
    if (policy.refund_text) document.querySelector('#refund-copy').textContent = policy.refund_text;
    if (/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(policy.support_email || '')) {
      const support = document.querySelector('#support-link');
      support.href = `mailto:${policy.support_email}`;
      support.hidden = false;
    }
  } catch {
    document.querySelector('#catalog-message').textContent = '暫時未能更新計劃資料，請稍後重新整理。付款功能仍未開放。';
  }
}
loadCatalogue();
