import { learningUnits, practiceMissions, writingFormats } from './dse-practical-writing-data.mjs?v=20261104-4';

const $ = (selector, root = document) => root.querySelector(selector);
const config = window.EDMUND_SUPABASE || {};
const sessionKey = 'edmund-dse-practical-writing-session-v1';
const draftPrefix = 'edmund-dse-practical-writing-mission-v2';
const completePrefix = 'edmund-dse-practical-writing-complete-v2';
const authMemory = new Map();
const resilientStorage = {
  getItem(key) { if (authMemory.has(key)) return authMemory.get(key); try { return sessionStorage.getItem(key); } catch { return null; } },
  setItem(key, value) { authMemory.set(key, value); try { sessionStorage.setItem(key, value); } catch { /* Keep authentication in memory. */ } },
  removeItem(key) { authMemory.delete(key); try { sessionStorage.removeItem(key); } catch { /* Continue in memory. */ } }
};
const client = window.supabase?.createClient?.(config.url, config.anonKey, {
  auth: { persistSession: true, storage: resilientStorage, autoRefreshToken: true, detectSessionInUrl: false }
});
const state = { user: null, screen: 'hub', mode: '', activeId: '', translation: false, modelTranslation: false, saveTimer: 0, toastTimer: 0 };

async function rpc(name, args = {}) {
  if (!client) throw new Error('登入服務暫時未能載入，請重新整理頁面。');
  const current = await client.auth.getSession();
  if (current.error || !current.data.session?.user?.id) {
    const result = await client.auth.signInAnonymously();
    if (result.error) throw result.error;
  }
  const { data, error } = await client.rpc(name, args);
  if (error) throw error;
  return data;
}
function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]); }
function nl2html(value) { return escapeHtml(value).replace(/\n/g, '<br>'); }
function ownerKey() { return state.user?.id || state.user?.name || 'student'; }
function draftKey(id) { return `${draftPrefix}:${ownerKey()}:${id}`; }
function completeKey(id) { return `${completePrefix}:${ownerKey()}:${id}`; }
function readDraft(id) { try { return localStorage.getItem(draftKey(id)) || ''; } catch { return ''; } }
function writeDraft(id, value) { try { localStorage.setItem(draftKey(id), value); return true; } catch { return false; } }
function isComplete(id) { try { return localStorage.getItem(completeKey(id)) === '1'; } catch { return false; } }
function setComplete(id) { try { localStorage.setItem(completeKey(id), '1'); return true; } catch { return false; } }
function wordCount(value) { return String(value || '').trim().match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g)?.length || 0; }
function activeCollection() { return state.mode === 'learning' ? writingFormats : practiceMissions; }
function activeItem() { return activeCollection().find(item => item.id === state.activeId); }
function showToast(message) {
  const toast = $('[data-save-toast]');
  toast.textContent = message; toast.hidden = false;
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => { toast.hidden = true; }, 1700);
}
function renderBack(label = '返回') { return `<button class="field-button field-button--back" type="button" data-action="back"><span aria-hidden="true">←</span>${escapeHtml(label)}</button>`; }
function renderTranslationToggle() { return `<button class="field-button ${state.translation ? 'is-active' : ''}" type="button" data-action="translation" aria-pressed="${state.translation}">${state.translation ? '隱藏繁體中文' : '顯示繁體中文翻譯'}</button>`; }

function renderHub() {
  state.screen = 'hub'; state.mode = ''; state.activeId = '';
  $('[data-screen-root]').innerHTML = `<section class="mode-hub">
    <header class="field-heading"><p class="eyebrow">CARD 80 · DSE PRACTICAL ENGLISH WRITING</p><h1>DSE 學生使用<span>實用文練習系統</span></h1><p>先掌握每種實用文的任務邏輯，再進入情境完成自己的作品。</p></header>
    <div class="mode-grid">
      <button class="mode-card mode-card--learn" type="button" data-mode="learning"><span class="mode-number">01</span><span class="mode-kicker">LEARNING</span><strong>Learning mode<span>學習模式</span></strong><small>${learningUnits.length} 種實用文 · 結構、語氣及常用表達</small><i>開啟學習目錄 →</i></button>
      <button class="mode-card mode-card--practice" type="button" data-mode="practice"><span class="mode-number">02</span><span class="mode-kicker">PRACTICE</span><strong>Practice mode<span>練習模式</span></strong><small>${practiceMissions.length} 個完整情境 · 自動儲存及參考範文</small><i>開啟練習目錄 →</i></button>
    </div></section>`;
}
function renderMap() {
  state.screen = 'map';
  const isLearning = state.mode === 'learning';
  const items = activeCollection();
  const completed = isLearning ? 0 : items.filter(item => isComplete(item.id)).length;
  $('[data-screen-root]').innerHTML = `<section class="campaign-map ${isLearning ? 'is-learning' : 'is-practice'}">
    <div class="map-toolbar">${renderBack('返回模式選擇')}<div><p class="eyebrow">${isLearning ? 'LEARNING' : 'PRACTICE'}</p><h1>${isLearning ? '實用文學習目錄' : '實用文練習目錄'}</h1></div><div class="map-count"><strong>${isLearning ? items.length : completed}</strong><span>${isLearning ? '個學習單元' : `/ ${items.length} 已完成`}</span></div></div>
    <div class="map-index">${items.map(item => `<button type="button" data-item-id="${escapeHtml(item.id)}"><b>${escapeHtml(item.number)}</b><span>${escapeHtml(item.title)}</span><small>${escapeHtml(item.zhTitle)}</small></button>`).join('')}</div>
  </section>`;
}
function bilingual(en, zh, tag = 'p') { return `<${tag} class="bilingual-copy"><span lang="en">${nl2html(en)}</span>${state.translation ? `<span lang="zh-Hant">${nl2html(zh)}</span>` : ''}</${tag}>`; }
function renderModelBlocks(model, showChinese = state.translation) {
  return `<div class="bilingual-model">${model.blocks.map(block => `<section class="model-block model-block--${escapeHtml(block.type)}" data-model-block="${escapeHtml(block.id)}"><div class="model-english" lang="en">${nl2html(block.en)}</div>${showChinese ? `<div class="model-chinese" lang="zh-Hant">${nl2html(block.zh)}</div>` : ''}</section>`).join('')}</div>`;
}
function renderLearningProfile(item) {
  return `<div class="learning-profile"><article><h3>AUDIENCE · 讀者</h3>${bilingual(item.audience[0], item.audience[1], 'div')}</article><article><h3>REGISTER · 語氣</h3>${bilingual(item.register[0], item.register[1], 'div')}</article></div>`;
}
function renderRequirementCoverage(item) {
  return `<div class="coverage-list">${item.requirements.map(group => `<section><h4>${escapeHtml(group.heading)}${state.translation ? ` · ${escapeHtml(group.zhHeading)}` : ''}</h4>${group.points.map(([en, zh]) => `<div class="coverage-point"><span aria-hidden="true">✓</span>${bilingual(en, zh, 'div')}</div>`).join('')}</section>`).join('')}</div>`;
}
function renderLearningBriefing(item) {
  return `<div class="briefing-sheet learning-sheet"><div class="briefing-title"><p class="eyebrow">FIELD MANUAL · ${escapeHtml(item.number)}</p><h1>${escapeHtml(item.title)}</h1><h2>${escapeHtml(item.zhTitle)}</h2></div>
    <section class="briefing-section briefing-purpose"><h3>MISSION PURPOSE · 寫作目的</h3>${bilingual(item.purpose, item.purposeZh)}</section>
    ${renderLearningProfile(item)}
    <section class="briefing-section"><h3>FORMAT RULES · 格式規則</h3><ul>${item.formatRules.map(([en, zh]) => `<li>${bilingual(en, zh, 'div')}</li>`).join('')}</ul></section>
    <section class="briefing-section"><h3>WRITING ROUTE · 寫作路線</h3><ol class="route-list">${item.structure.map(([en, zh]) => `<li>${bilingual(en, zh, 'div')}</li>`).join('')}</ol></section>
    <section class="briefing-section learning-model-section"><div class="section-heading-row"><div><h3>COMPLETE MODEL · 完整參考範文</h3></div>${renderTranslationToggle()}</div>${renderModelBlocks(item.model, state.translation)}</section>
    <section class="briefing-section"><h3>REQUIREMENT COVERAGE · 題目要求對照</h3>${renderRequirementCoverage(item)}</section>
    <section class="briefing-section"><h3>USEFUL LANGUAGE · 常用表達</h3><div class="expression-grid">${item.expressions.map(([en, zh]) => `<article>${bilingual(en, zh, 'div')}</article>`).join('')}</div></section>
    <section class="briefing-section common-errors"><h3>COMMON ERRORS · 常見錯誤</h3><ul>${item.commonErrors.map(([en, zh]) => `<li>${bilingual(en, zh, 'div')}</li>`).join('')}</ul></section>
    <footer class="briefing-actions">${renderBack('返回學習目錄')} ${renderTranslationToggle()}<button class="field-button field-button--primary" type="button" data-action="practice-linked">前往相關練習 <span aria-hidden="true">→</span></button></footer></div>`;
}
function renderPracticeBriefing(item) {
  return `<div class="briefing-sheet mission-sheet"><div class="briefing-title"><p class="eyebrow">MISSION ${escapeHtml(item.number)} · ${escapeHtml(item.type)}</p><h1>${escapeHtml(item.title)}</h1><h2>${escapeHtml(item.zhTitle)}</h2></div>
    <section class="briefing-section briefing-purpose"><h3>SITUATION · 情境</h3>${bilingual(item.situation, item.situationZh)}</section>
    <div class="requirement-grid">${item.requirements.map(group => `<section class="briefing-section"><h3>${escapeHtml(group.heading)}${state.translation ? ` · ${escapeHtml(group.zhHeading)}` : ''}</h3><ul>${group.points.map(([en, zh]) => `<li>${bilingual(en, zh, 'div')}</li>`).join('')}</ul></section>`).join('')}</div>
    <footer class="briefing-actions">${renderBack('返回練習目錄')} ${renderTranslationToggle()}<button class="field-button field-button--primary" type="button" data-action="start">開始練習 <span aria-hidden="true">→</span></button></footer></div>`;
}
function renderBriefing() {
  state.screen = 'briefing'; const item = activeItem(); if (!item) { renderMap(); return; }
  $('[data-screen-root]').innerHTML = `<section class="briefing-scene">${state.mode === 'learning' ? renderLearningBriefing(item) : renderPracticeBriefing(item)}</section>`;
}
function renderRequirementPanel(item) {
  return `<aside class="desk-panel desk-requirements"><div class="desk-panel__head"><p class="eyebrow">MISSION NOTES</p><h2>內容要點</h2></div><div class="desk-scroll"><section class="desk-situation"><h3>Situation</h3>${bilingual(item.situation, item.situationZh, 'div')}</section>${item.requirements.map(group => `<section><h3>${escapeHtml(state.translation ? group.zhHeading : group.heading)}</h3><ul>${group.points.map(([en, zh]) => `<li>${escapeHtml(state.translation ? zh : en)}</li>`).join('')}</ul></section>`).join('')}</div></aside>`;
}
function renderExpressionPanel(item) {
  return `<aside class="desk-panel desk-expressions"><div class="desk-panel__head"><p class="eyebrow">LANGUAGE KIT</p><h2>句式與表達</h2></div><div class="desk-scroll"><p class="insert-hint">按一下英文句式，可加入文章游標位置。</p>${item.expressions.map(([en, zh]) => `<button class="expression-card" type="button" data-insert="${escapeHtml(en)}"><strong>${escapeHtml(en)}</strong>${state.translation ? `<span>${escapeHtml(zh)}</span>` : ''}<small>加入文章 ＋</small></button>`).join('')}</div><button class="model-button" type="button" data-action="model">查看參考範文</button></aside>`;
}
function renderWorkspace() {
  state.screen = 'workspace'; const item = activeItem(); if (!item) { renderMap(); return; }
  const draft = readDraft(item.id);
  $('[data-screen-root]').innerHTML = `<section class="writing-desk">
    <header class="desk-toolbar">${renderBack('返回任務簡報')}<div><p class="eyebrow">WRITING MISSION ${escapeHtml(item.number)}</p><h1>${escapeHtml(item.title)}</h1></div><div class="desk-toolbar__actions">${renderTranslationToggle()}<button class="field-button" type="button" data-action="model">查看參考範文</button></div></header>
    <div class="desk-grid">${renderRequirementPanel(item)}<main class="desk-editor"><div class="paper-heading"><div><p class="eyebrow">MY WRITING · 我的文章</p><h2>${escapeHtml(item.zhTitle)}</h2></div><span><strong data-word-count>${wordCount(draft)}</strong> words</span></div><textarea data-editor spellcheck="true" autocomplete="off" placeholder="Start writing here…">${escapeHtml(draft)}</textarea><div class="editor-footer"><span data-save-indicator>${draft ? '已載入已儲存草稿' : '輸入後即時自動儲存'}</span><div><button type="button" data-action="clear" ${draft ? '' : 'hidden'}>清除草稿</button><button class="submit-writing" type="button" data-action="submit">${isComplete(item.id) ? '已提交 · 再次完成' : '完成並提交'}</button></div></div></main>${renderExpressionPanel(item)}</div>
  </section>`;
  requestAnimationFrame(() => $('[data-editor]')?.focus({ preventScroll: true }));
}
function saveActiveDraft({ quiet = false } = {}) {
  if (state.screen !== 'workspace' || !state.activeId) return;
  const editor = $('[data-editor]'); if (!editor) return;
  const success = writeDraft(state.activeId, editor.value); const indicator = $('[data-save-indicator]');
  if (indicator) indicator.textContent = success ? '草稿已儲存於此裝置' : '未能自動儲存，請先複製文章';
  const clear = $('[data-action="clear"]'); if (clear) clear.hidden = !editor.value.trim();
  if (success && !quiet) showToast('草稿已儲存');
}
function insertExpression(value) {
  const editor = $('[data-editor]'); if (!editor) return;
  const start = editor.selectionStart, end = editor.selectionEnd, prefix = editor.value.slice(0, start), suffix = editor.value.slice(end), spacer = prefix && !/\s$/.test(prefix) ? ' ' : '';
  editor.value = `${prefix}${spacer}${value}${suffix}`; const cursor = prefix.length + spacer.length + value.length;
  editor.setSelectionRange(cursor, cursor); editor.focus(); editor.dispatchEvent(new Event('input', { bubbles: true }));
}
function openModel() {
  const item = activeItem(); if (!item?.model) return;
  const dialog = $('[data-model-dialog]'); $('[data-model-title]').textContent = `${item.title} · ${item.zhTitle}`;
  $('[data-model-copy]').innerHTML = renderModelBlocks(item.model, state.modelTranslation);
  $('[data-model-language]').textContent = state.modelTranslation ? '隱藏繁體中文' : '顯示繁體中文翻譯';
  $('[data-model-language]').setAttribute('aria-pressed', String(state.modelTranslation));
  if (!dialog.open) dialog.showModal();
}
function navigateBack() {
  if (state.screen === 'map') renderHub(); else if (state.screen === 'briefing') renderMap(); else if (state.screen === 'workspace') { saveActiveDraft({ quiet: true }); renderBriefing(); }
}
function handleAction(action) {
  if (action === 'back') { navigateBack(); return; }
  if (action === 'translation') { state.translation = !state.translation; if (state.screen === 'briefing') renderBriefing(); if (state.screen === 'workspace') { saveActiveDraft({ quiet: true }); renderWorkspace(); } return; }
  if (action === 'start') { renderWorkspace(); return; }
  if (action === 'practice-linked') { const item = activeItem(); state.mode = 'practice'; state.activeId = item.practiceMissionId; state.translation = false; renderBriefing(); return; }
  if (action === 'model') { openModel(); return; }
  if (action === 'clear') { if (!confirm('確定清除這一道任務的草稿？')) return; writeDraft(state.activeId, ''); renderWorkspace(); showToast('草稿已清除'); return; }
  if (action === 'submit') { const editor = $('[data-editor]'); if (!editor?.value.trim()) { alert('請先完成文章，然後再提交。'); editor?.focus(); return; } saveActiveDraft({ quiet: true }); setComplete(state.activeId); showToast('練習已完成並儲存'); $('[data-action="submit"]').textContent = '已提交 · 再次完成'; }
}
function showApp() { $('[data-view="login"]').hidden = true; $('[data-view="app"]').hidden = false; $('[data-account-actions]').hidden = false; $('[data-account-name]').textContent = `${state.user.name} · 學生`; renderHub(); }
function showLogin() { state.user = null; state.screen = 'hub'; state.mode = ''; state.activeId = ''; $('[data-view="login"]').hidden = false; $('[data-view="app"]').hidden = true; $('[data-account-actions]').hidden = true; $('[data-login-status]').textContent = ''; }
function remember(user) { state.user = { token: String(user.token), id: String(user.id || ''), name: String(user.name || 'Student'), role: 'student' }; try { sessionStorage.setItem(sessionKey, JSON.stringify(state.user)); } catch {} try { window.EdmundSystemNav?.rememberStudentSession?.(state.user); } catch {} }
async function validate(token) { const rows = await rpc('flashcard_student_session_profile', { p_token: String(token) }); const profile = Array.isArray(rows) ? rows[0] : null; if (!profile?.id) return false; remember({ token: profile.session_token || token, id: profile.id, name: profile.name }); return true; }
async function login(event) {
  event.preventDefault(); const form = event.currentTarget, button = $('button[type="submit"]', form), status = $('[data-login-status]'), values = new FormData(form), username = String(values.get('username') || '').trim(), password = String(values.get('password') || '');
  if (!username || !password) { status.textContent = '請輸入用戶名稱及密碼。'; return; }
  button.disabled = true; status.textContent = '正在核對學生帳戶…';
  try { const rows = await rpc('flashcard_student_login', { p_name: username, p_password: password }); const token = Array.isArray(rows) ? rows[0]?.session_token : null; if (!token || !await validate(token)) throw new Error('用戶名稱或密碼不正確。'); form.reset(); showApp(); }
  catch (error) { status.textContent = error.message || '登入暫時失敗，請稍後重試。'; } finally { button.disabled = false; }
}
async function restore() {
  if (['127.0.0.1', 'localhost'].includes(location.hostname) && new URLSearchParams(location.search).get('preview') === '1') {
    state.user = { token: 'local-preview', id: 'local-preview', name: 'Local Preview', role: 'student' };
    showApp();
    return;
  }
  let own = null; try { own = JSON.parse(sessionStorage.getItem(sessionKey) || 'null'); } catch {}
  let universal = null; try { universal = window.EdmundSystemNav?.getStudentSession?.() || null; if (!universal) { window.EdmundSystemNav?.bridgeStudentSession?.(); universal = window.EdmundSystemNav?.getStudentSession?.() || null; } } catch {}
  const candidate = universal?.role === 'student' ? universal : own; if (!candidate?.token) { showLogin(); return; }
  try { if (await validate(candidate.token)) { showApp(); return; } } catch {} showLogin();
}

$('[data-login-form]').addEventListener('submit', login);
$('[data-logout]').addEventListener('click', () => { clearTimeout(state.saveTimer); saveActiveDraft({ quiet: true }); try { sessionStorage.removeItem(sessionKey); } catch {} try { window.EdmundSystemNav?.forgetStudentSession?.(); } catch {} showLogin(); });
$('[data-screen-root]').addEventListener('click', event => {
  const mode = event.target.closest('[data-mode]'); if (mode) { state.mode = mode.dataset.mode; state.translation = false; state.modelTranslation = false; renderMap(); return; }
  const item = event.target.closest('[data-item-id]'); if (item) { state.activeId = item.dataset.itemId; state.translation = false; state.modelTranslation = false; renderBriefing(); return; }
  const insert = event.target.closest('[data-insert]'); if (insert) { insertExpression(insert.dataset.insert); return; }
  const action = event.target.closest('[data-action]'); if (action) handleAction(action.dataset.action);
});
$('[data-screen-root]').addEventListener('input', event => { if (!event.target.matches('[data-editor]')) return; $('[data-word-count]').textContent = String(wordCount(event.target.value)); $('[data-save-indicator]').textContent = '正在儲存…'; clearTimeout(state.saveTimer); state.saveTimer = setTimeout(saveActiveDraft, 420); });
$('[data-model-language]').addEventListener('click', () => { state.modelTranslation = !state.modelTranslation; openModel(); });
window.addEventListener('pagehide', () => saveActiveDraft({ quiet: true }));
restore();
