import { el, newPlan, SYSTEMS, CURRENCIES, amountFromInput, safeHttps } from './membership-shared.mjs';

const $ = selector => document.querySelector(selector);
const key = 'edmund-membership-admin-v1';
const config = window.EDMUND_SUPABASE;
const client = window.supabase?.createClient(config?.url, config?.anonKey, {
  auth: { storage: window.sessionStorage, storageKey: 'edmund-membership-auth-v1', persistSession: true, detectSessionInUrl: false, autoRefreshToken: true }
});
let token = sessionStorage.getItem(key) || '';
let revision = 0;
let expiryTimer;
let dirty = false;

async function rpc(name, values = {}) {
  if (!client) throw new Error('管理服務未能載入，請重新整理。');
  const { data, error } = await client.rpc(name, values);
  if (error) {
    if (error.code === '42501') logoutLocal('管理階段已結束，請重新登入。');
    throw new Error(error.code === '40001' ? '設定已在另一個視窗更新。請重新整理後再修改，避免覆蓋。' : error.message);
  }
  return data;
}
function logoutLocal(message = '') {
  token = ''; sessionStorage.removeItem(key); clearTimeout(expiryTimer);
  $('#admin-view').hidden = true; $('#logout').hidden = true; $('#login-view').hidden = false;
  $('#plan-editors').replaceChildren();
  $('#configuration-form').reset();
  $('#admin-password').value = ''; $('#login-status').textContent = message;
  dirty = false;
}
function field(label, name, value = '', type = 'text', max = 1000) {
  const wrapper = el('label', 'field', label);
  const input = el(type === 'textarea' ? 'textarea' : 'input');
  if (input.tagName === 'INPUT') input.type = type;
  input.dataset.field = name; input.value = value ?? ''; input.maxLength = max;
  wrapper.append(input); return wrapper;
}
function addEditor(plan, open = false) {
  const details = el('details', 'plan-editor'); details.dataset.planId = plan.id; details.open = open;
  const summary = el('summary', '', plan.title || '新會員計劃'); details.append(summary);
  const grid = el('div', 'admin-grid');
  const title = field('方案名稱', 'title', plan.title, 'text', 100); title.querySelector('input').required = true;
  title.addEventListener('input', event => { summary.textContent = event.target.value || '新會員計劃'; });
  const amount = field('每月金額（不是分）', 'amount', plan.amount_minor == null ? '' : (plan.amount_minor / 100).toFixed(2));
  amount.querySelector('input').inputMode = 'decimal'; amount.querySelector('input').placeholder = '未定價';
  const currencyLabel = el('label', 'field', '貨幣'); const currency = el('select'); currency.dataset.field = 'currency';
  CURRENCIES.forEach(c => { const option = el('option', '', c); option.value = c; currency.append(option); });
  currency.value = plan.currency; currencyLabel.append(currency);
  const intro = field('簡短介紹', 'summary', plan.summary, 'textarea', 1000);
  const benefits = field('對外列出的內容（每行一項）', 'benefits', plan.benefits.join('\n'), 'textarea', 6000);
  const testPrice = field('Stripe 測試 Price ID（可留空）', 'stripe_test_price_id', plan.stripe_test_price_id, 'text', 100);
  const livePrice = field('Stripe 正式 Price ID（可留空）', 'stripe_live_price_id', plan.stripe_live_price_id, 'text', 100);
  for (const price of [testPrice, livePrice]) price.querySelector('input').placeholder = 'price_…（不是 sk_ 或 whsec_）';
  grid.append(title, amount, currencyLabel, intro, benefits, testPrice, livePrice);
  const systems = el('fieldset', 'full-width'); systems.append(el('legend', '', '預定包含系統（尚不會實際授權）'));
  const choices = el('div', 'admin-grid');
  SYSTEMS.forEach(([id, label]) => {
    const line = el('label', 'check-field'); const check = el('input'); check.type = 'checkbox'; check.value = id; check.dataset.system = id; check.checked = plan.system_ids.includes(id);
    line.append(check, document.createTextNode(label)); choices.append(line);
  });
  systems.append(choices); grid.append(systems); details.append(grid);
  const visibleLabel = el('label', 'check-field'); const visible = el('input'); visible.type = 'checkbox'; visible.dataset.field = 'visible'; visible.checked = plan.visible;
  visibleLabel.append(visible, document.createTextNode('在公開頁顯示這個計劃預覽（不代表可付款）'));
  details.append(el('p', 'quiet', '暫停顯示：取消下方勾選，再按「儲存並公布預覽」。紀錄會保留。'), visibleLabel);
  $('#plan-editors').append(details);
}
function readSettings() {
  const settings = {};
  document.querySelectorAll('[data-setting]').forEach(input => {
    settings[input.dataset.setting] = input.dataset.setting === 'grace_days' ? (input.value === '' ? null : Number(input.value)) : input.value.trim();
  });
  for (const fieldName of ['terms_url', 'privacy_url']) if (settings[fieldName] && !safeHttps(settings[fieldName])) throw new Error('政策網址必須是有效的 HTTPS 連結。');
  return settings;
}
function readPlans() {
  return [...document.querySelectorAll('.plan-editor')].map(editor => {
    const value = name => editor.querySelector(`[data-field="${name}"]`).value.trim();
    for (const name of ['stripe_test_price_id', 'stripe_live_price_id']) if (value(name) && !/^price_[A-Za-z0-9]+$/.test(value(name))) throw new Error('Stripe Price ID 必須以 price_ 開頭。請勿填入秘密金鑰。');
    return { id: editor.dataset.planId, title: value('title'), summary: value('summary'), amount_minor: amountFromInput(value('amount')), currency: value('currency'), benefits: value('benefits').split('\n').map(s => s.trim()).filter(Boolean), system_ids: [...editor.querySelectorAll('[data-system]:checked')].map(c => c.value), stripe_test_price_id: value('stripe_test_price_id'), stripe_live_price_id: value('stripe_live_price_id'), visible: editor.querySelector('[data-field="visible"]').checked };
  });
}
function renderReadiness(data) {
  const checks = [
    [data.plans.some(p => p.amount_minor > 0 && p.benefits.length), '價格與方案內容已填寫', '填寫價格與方案内容'],
    [Boolean(data.settings.terms_url && data.settings.privacy_url && data.settings.cancellation_text && data.settings.refund_text && data.settings.policy_version), '政策草稿已填寫（仍需確認適用性）', '準備訂閱條款、私隱、續期與退款安排'],
    [false, '', '連接及驗證公司 Stripe 帳戶與銀行帳戶'],
    [false, '', '核對 Stripe 月費 Price、貨幣與付款方式'],
    [false, '', '部署及測試 webhook、重試與帳單管理'],
    [false, '', '完成電郵驗證、啟用與各系統權限檢查'],
    [false, '', '測試續期、拒付、取消與重複通知'],
    [false, '', '試行後另行部署正式收款版本']
  ];
  $('#readiness').replaceChildren(...checks.map(([done, ready, pending]) => el('li', '', (done ? '✓ ' : '') + (done ? ready : pending))));
}
async function loadAdmin() {
  const data = await rpc('membership_admin_load', { p_admin_token: token });
  revision = data.revision;
  $('#plan-editors').replaceChildren(); data.plans.forEach((plan, i) => addEditor(plan, i === 0));
  document.querySelectorAll('[data-setting]').forEach(input => { input.value = data.settings[input.dataset.setting] ?? ''; });
  $('#saved-at').textContent = `草稿版本 ${revision} · ${new Date(data.updated_at).toLocaleString('zh-HK')} · ${data.published_at ? '已公布預覽' : '尚未公布預覽'}`;
  $('#subscription-count').textContent = data.counts.subscriptions;
  $('#event-count').textContent = data.counts.events;
  $('#job-count').textContent = data.counts.jobs;
  renderReadiness(data); $('#admin-view').hidden = false; $('#login-view').hidden = true; $('#logout').hidden = false;
  clearTimeout(expiryTimer); expiryTimer = setTimeout(() => logoutLocal('管理階段已結束，請重新登入。'), Math.max(0, Date.parse(data.expires_at) - Date.now()));
  dirty = false;
}
async function save(publish) {
  if (!$('#configuration-form').reportValidity()) return;
  const buttons = [$('#save-draft'), $('#publish-preview')]; buttons.forEach(b => { b.disabled = true; });
  $('#save-status').classList.remove('error'); $('#save-status').textContent = '正在安全儲存…';
  try {
    await rpc('membership_admin_save', { p_admin_token: token, p_settings: readSettings(), p_plans: readPlans(), p_revision: revision, p_publish: publish });
    await loadAdmin(); $('#save-status').textContent = publish ? '計劃預覽已公布。付款仍未啟用。' : '草稿已儲存，公開頁未更改。';
  } catch (error) { $('#save-status').classList.add('error'); $('#save-status').textContent = error.message; }
  finally { buttons.forEach(b => { b.disabled = false; }); }
}
$('#admin-login-form').addEventListener('submit', async event => {
  event.preventDefault(); $('#login-button').disabled = true; $('#login-status').textContent = '正在驗證…';
  try {
    if (!client) throw new Error('管理服務未能載入，請重新整理。');
    const { data: session } = await client.auth.getSession();
    if (!session.session) { const { error } = await client.auth.signInAnonymously(); if (error) throw new Error('安全登入連線暫未能建立，請稍後再試。'); }
    const result = await rpc('membership_admin_login', { p_name: $('#admin-name').value.trim(), p_password: $('#admin-password').value });
    $('#admin-password').value = '';
    if (!result.ok) throw new Error(result.reason === 'rate_limited' ? '嘗試次數過多，請於 15 分鐘後再試。' : '管理員名稱或密碼不正確。');
    token = result.token; sessionStorage.setItem(key, token); await loadAdmin(); $('#login-status').textContent = '';
  } catch (error) { $('#admin-password').value = ''; $('#login-status').textContent = error.message; }
  finally { $('#login-button').disabled = false; }
});
$('#logout').addEventListener('click', async () => {
  try { await rpc('membership_admin_logout', { p_admin_token: token }); logoutLocal(); await client.auth.signOut({ scope: 'local' }); }
  catch { $('#save-status').textContent = '未能完成伺服器登出，請重試。'; }
});
$('#add-plan').addEventListener('click', () => {
  if (document.querySelectorAll('.plan-editor').length >= 12) { $('#save-status').textContent = '最多可建立 12 個方案。'; return; }
  addEditor(newPlan(), true); dirty = true;
});
$('#configuration-form').addEventListener('input', () => { dirty = true; });
$('#configuration-form').addEventListener('submit', event => { event.preventDefault(); save(false); });
$('#publish-preview').addEventListener('click', () => save(true));
window.addEventListener('beforeunload', event => { if (dirty) { event.preventDefault(); event.returnValue = ''; } });
if (token) loadAdmin().catch(() => logoutLocal('請重新登入以繼續。'));
