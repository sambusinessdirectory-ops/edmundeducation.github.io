import {juniorHighlightToolbar, mountJuniorHighlighter} from '../junior-text-highlighter.mjs?v=20261021-study3';

const JAYDEN_ID = 'df2a3ba9-25be-4b0c-823a-304d4c29c2ba';
import {MODULES} from './modules.mjs?v=20261019-homework1';
const host = document.createElement('section');
host.className = 'junior-app junior-advanced-app';
host.setAttribute('aria-label', '初中考試溫習內容');
document.querySelector('[data-view="dashboard"]')?.append(host);
const highlighter = mountJuniorHighlighter(host, '.junior-advanced-passage', 'exam', {
  scopeSelector: '.junior-advanced-passage-group',
  scopeKey: scope => `${active?.key || ''}:passage-${scope.dataset.passage}`
});
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const numberKey = (number) => String(number).padStart(3, '0');
let owner = null;
let token = '';
let active = null;
let data = null;
let answers = {};
let submitted = {};
let progress = Object.fromEntries(MODULES.map((module) => [module.key, 0]));
let saving = false;
let showExplanations = true;
let openVersion = 0;
const draftKey = (module) => `edmund-junior-exam-${module.key}:${owner}`;
function readDraft(module) {
  try {
    const parsed = JSON.parse(localStorage.getItem(draftKey(module)) || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch { return {}; }
}
function saveDraft() {
  if (!active) return;
  try { localStorage.setItem(draftKey(active), JSON.stringify(answers)); } catch { /* Account submissions remain saved. */ }
}
function filledCount() { return Object.values(answers).filter((answer) => String(answer || '').trim()).length; }
function renderHome() {
  if (!owner) { host.replaceChildren(); return; }
  if (owner !== JAYDEN_ID) {
    host.innerHTML = '<article class="junior-empty"><p class="junior-eyebrow">YOUR LEARNING SPACE</p><h2>已成功登入</h2><p>目前沒有分配給您的考試溫習模組。</p></article>';
    return;
  }
  host.innerHTML = `<div class="junior-home-heading"><p class="junior-eyebrow">YOUR EXAM PREPARATION</p><h2>您的溫習模組</h2><p>先選擇專題。所有模組都可分段提交；三個進階專題另附答案與七步解析。</p></div>
    <div class="junior-advanced-grid">${MODULES.map((module, index) => {
      const content = `<span class="junior-module-card__number">0${index + 1}</span><span><strong>${escapeHtml(module.title)}</strong><small>${escapeHtml(module.subtitle)}</small><em data-home-progress="${module.key}">${progress[module.key]} / ${module.total || 50} 題已提交</em></span><span aria-hidden="true">↗</span>`;
      return module.href ? `<a class="junior-module-card" href="${module.href}">${content}</a>` : `<button class="junior-module-card" type="button" data-open-module="${module.key}">${content}</button>`;
    }).join('')}</div>`;
}
async function loadData(module) {
  const response = await fetch(`./junior-exam-prep/${module.file}?v=20261019-advanced2`);
  if (!response.ok) throw new Error('教材暫時未能載入，請稍後再試。');
  const parsed = await response.json();
  if (parsed.module !== module.key || parsed.passages?.length !== 5 || parsed.questions?.length !== 50 || parsed.questions.some((question, index) => question.number !== index + 1 || question.steps?.length !== 7)) {
    throw new Error('教材資料未通過完整性檢查。');
  }
  return parsed;
}
async function loadSubmissions(module, expectedOwner) {
  const rows = await window.EDMUND_LEARNING_PORTAL_CONTEXT.rpc('junior_exam_list_responses', {p_token: token, p_module_key: module.key});
  if (owner !== expectedOwner || !Array.isArray(rows)) return;
  const serverAnswers = {};
  const serverResults = {};
  for (const row of rows) {
    const number = Number(row.question_number);
    if (number < 1 || number > (module.total || 50)) continue;
    serverAnswers[numberKey(number)] = String(row.answer || '');
    serverResults[numberKey(number)] = Boolean(row.correct);
  }
  progress[module.key] = Object.keys(serverResults).length;
  if (active?.key === module.key) {
    const draft = readDraft(module);
    answers = {...serverAnswers, ...draft};
    submitted = {...serverResults};
    for (const [number, value] of Object.entries(draft)) {
      if (serverAnswers[number] !== undefined && canonicalAnswer(value).toLowerCase() !== canonicalAnswer(serverAnswers[number]).toLowerCase()) delete submitted[number];
    }
    renderModule();
  } else if (!active) renderHome();
}
function renderPassageText(passage) {
  const pattern = data.type === 'articles' ? /\[(\d+): ([^\]]+)\]/g : data.type === 'other' ? /\[(\d+)\] _____ \(([^)]+)\)/g : /\((\d+)\) _____ \(([^)]+)\)/g;
  let last = 0;
  let html = '';
  for (const match of passage.text.matchAll(pattern)) {
    html += escapeHtml(passage.text.slice(last, match.index));
    const marker = Number(match[1]);
    const local = data.type === 'articles' ? ((marker - 1) % 10) + 1 : marker;
    const number = numberKey(data.type === 'articles' ? marker : (passage.number - 1) * 10 + local);
    const printed = match[2];
    const label = data.type === 'articles' ? `第 ${Number(number)} 題：${printed} 的改正` : `第 ${Number(number)} 題：${printed} 的正確詞形`;
    html += `<span class="junior-advanced-blank" id="junior-q-${number}"><span class="junior-advanced-prompt">${data.type === 'articles' ? `[${local}: ${escapeHtml(printed)}]` : `[${local}]`}</span><input class="junior-answer" data-answer="${number}" type="text" maxlength="100" autocomplete="off" spellcheck="false" aria-label="${escapeHtml(label)}" value="${escapeHtml(answers[number] || '')}">${data.type === 'articles' ? '' : `<span class="junior-advanced-hint">(${escapeHtml(printed)})</span>`}<span class="junior-advanced-feedback" data-feedback="${number}">${feedbackHtml(number)}</span></span>`;
    last = match.index + match[0].length;
  }
  html += escapeHtml(passage.text.slice(last));
  return html.split(/\n\s*\n/).map((paragraph) => `<p>${paragraph.replaceAll('\n', ' ')}</p>`).join('');
}
function feedbackHtml(number) {
  if (submitted[number] === undefined) return '';
  const question = data.questions[Number(number) - 1];
  return `<span class="junior-result ${submitted[number] ? 'is-correct' : 'is-incorrect'}">${submitted[number] ? '✓ 正確' : '請再試一次'}</span><span class="junior-advanced-correct">答案：${escapeHtml(question.answer)}</span>`;
}
function reviewHtml(passage) {
  const checked = data.questions.filter((question) => question.passage === passage.number && submitted[numberKey(question.number)] !== undefined);
  if (!checked.length) return '';
  return `<div class="junior-advanced-review"><h4>已檢查答案 · ${checked.length} / 10</h4>${checked.map((question) => {
    const number = numberKey(question.number);
    return `<details ${showExplanations ? 'open' : ''}><summary>第 ${question.local} 題 · ${submitted[number] ? '✓ 正確' : '再試一次'} · 答案：${escapeHtml(question.answer)}</summary><ol>${question.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol></details>`;
  }).join('')}</div>`;
}
function renderModule() {
  if (!active || !data || !owner) return;
  const count = filledCount();
  host.innerHTML = `<div class="junior-module-heading"><button type="button" class="junior-back" data-back>← 所有模組</button><p class="junior-eyebrow">S2 · ADVANCED PRACTICE</p><h2>${escapeHtml(active.title)}</h2><p>${escapeHtml(active.instructions)}</p><p>先閱讀整篇文章，再填答案。只需填一題即可部分提交及檢查；未填題目可以稍後完成。</p></div>
    ${juniorHighlightToolbar()}
    <div class="junior-exam-toolbar"><span><strong data-answered-count>${count}</strong> / 50 題已填</span><label>跳至題目 <input type="number" min="1" max="50" data-jump aria-label="跳至題目編號"></label><button type="button" data-jump-button>前往</button><span data-submitted-count>${Object.keys(submitted).length} 題已檢查</span><button type="button" data-submit-now="partial" ${count ? '' : 'disabled'}>提交已填答案並檢查</button><button type="button" data-submit-now="final" ${count === 50 ? '' : 'disabled'}>提交全部 50 題</button><span class="junior-toolbar-status" role="status" aria-live="polite" data-toolbar-status></span></div>
    <form data-exam-form novalidate>${data.passages.map((passage) => `<section class="junior-advanced-passage-group" data-passage="${passage.number}" aria-labelledby="junior-passage-${passage.number}"><h3 id="junior-passage-${passage.number}">Passage ${passage.number} — ${escapeHtml(passage.title.replace(/^Passage\s+\d+\s*[—:-]\s*/i, ''))}</h3><div class="junior-advanced-passage" lang="en">${renderPassageText(passage)}</div>${reviewHtml(passage)}</section>`).join('')}
    <div class="junior-submit-bar"><div><strong>提交答案與檢查</strong><small>部分提交只檢查已填題目；其餘題目仍可繼續作答。</small><p role="status" aria-live="polite" data-submit-status></p></div><button type="submit" name="mode" value="partial" data-submit-partial ${count ? '' : 'disabled'}>提交已填答案</button><button type="submit" name="mode" value="final" data-submit-final ${count === 50 ? '' : 'disabled'}>提交全部 50 題</button></div></form>`;
  highlighter.syncToolbar();
}
function updateCounters() {
  const count = filledCount();
  host.querySelector('[data-answered-count]')?.replaceChildren(String(count));
  host.querySelector('[data-submitted-count]')?.replaceChildren(`${Object.keys(submitted).length} 題已檢查`);
  host.querySelectorAll('[data-submit-final], [data-submit-now="final"]').forEach((button) => { button.disabled = saving || count !== 50; });
  host.querySelectorAll('[data-submit-partial], [data-submit-now="partial"]').forEach((button) => { button.disabled = saving || count === 0; });
}
function canonicalAnswer(answer) {
  const trimmed = String(answer).trim().replace(/\s+/g, ' ');
  if (active.type === 'articles' && /^(✓|✔|tick|check|correct)$/i.test(trimmed)) return 'TICK';
  return trimmed;
}
async function submit(final) {
  if (saving || !active || owner !== JAYDEN_ID) return;
  const payload = Object.fromEntries(Object.entries(answers).filter(([, value]) => String(value || '').trim()).map(([number, value]) => [number, canonicalAnswer(value)]));
  const count = Object.keys(payload).length;
  const statuses = host.querySelectorAll('[data-submit-status], [data-toolbar-status]');
  const showStatus = (message) => statuses.forEach((status) => { status.textContent = message; });
  if (!count || (final && count !== 50)) { showStatus(final ? '請先填妥全部 50 題。' : '請先填寫至少一題。'); return; }
  saving = true;
  updateCounters();
  showStatus('正在儲存及檢查答案…');
  try {
    const outcome = await window.EDMUND_LEARNING_PORTAL_CONTEXT.rpc('junior_exam_submit', {p_token: token, p_module_key: active.key, p_answers: payload, p_final: final});
    for (const [number, correct] of Object.entries(outcome.results || {})) submitted[number] = Boolean(correct);
    progress[active.key] = Object.keys(submitted).length;
    saveDraft();
    const scrollY = window.scrollY;
    renderModule();
    window.scrollTo({top: scrollY});
    host.querySelectorAll('[data-submit-status], [data-toolbar-status]').forEach((status) => { status.textContent = `${final ? '完整' : '部分'}提交成功：${outcome.submitted} 題，${outcome.correct} 題正確。已顯示答案及七步解析。`; });
  } catch (error) {
    showStatus(`未能提交：${error.message || '請檢查網絡後重試。'} 本機草稿仍在。`);
  } finally { saving = false; updateCounters(); }
}
host.addEventListener('input', (event) => {
  const input = event.target.closest('[data-answer]');
  if (!input) return;
  const number = input.dataset.answer;
  answers[number] = input.value;
  delete submitted[number];
  host.querySelector(`[data-feedback="${number}"]`)?.replaceChildren();
  saveDraft();
  updateCounters();
});
host.addEventListener('submit', (event) => {
  if (!event.target.matches('[data-exam-form]')) return;
  event.preventDefault();
  void submit(event.submitter?.value === 'final');
});
function setHomeworkRoute(module, question = 0) {
  const route = new URL(location.href);
  if (module) route.searchParams.set('module', module.key); else route.searchParams.delete('module');
  if (question) route.searchParams.set('question', question); else route.searchParams.delete('question');
  history.replaceState(null, '', route);
}
function requestedHomework() {
  const route = new URLSearchParams(location.search);
  const module = MODULES.find(item => item.key === route.get('module'));
  const value = route.get('question');
  if (!module || (module.href && value !== null) || (value !== null && (!/^[1-9]\d*$/.test(value) || Number(value) > 50))) return null;
  return {module, question: Number(value) || 0};
}
async function openModule(module, question = 0) {
  if (owner !== JAYDEN_ID || !token || !MODULES.includes(module)) return;
  if (module.href) { location.assign(module.href); return; }
  const expectedOwner = owner, version = ++openVersion;
  active = module; data = null; answers = readDraft(module); submitted = {};
  setHomeworkRoute(module, question);
  host.innerHTML = '<p class="junior-loading" role="status">正在載入五篇文章…</p>';
  try {
    const loaded = await loadData(module);
    if (owner !== expectedOwner || version !== openVersion || active?.key !== module.key) return;
    data = loaded;
    renderModule();
    try { await loadSubmissions(module, expectedOwner); }
    catch { if (owner === expectedOwner && version === openVersion) host.querySelector('[data-toolbar-status]')?.replaceChildren('暫時未能讀取帳戶紀錄；已載入本機草稿。'); }
    if (owner === expectedOwner && version === openVersion && question) host.querySelector(`#junior-q-${numberKey(question)}`)?.scrollIntoView({behavior: 'instant', block: 'center'});
  } catch (error) {
    if (owner === expectedOwner && version === openVersion) host.innerHTML = `<p class="junior-error" role="alert">${escapeHtml(error.message)}</p><button type="button" data-back>返回模組</button>`;
  }
}
host.addEventListener('click', (event) => {
  const open = event.target.closest('[data-open-module]');
  if (open) {
    const module = MODULES.find((item) => item.key === open.dataset.openModule);
    if (module) void openModule(module);
  } else if (event.target.closest('[data-back]')) {
    openVersion++; setHomeworkRoute(null);
    active = null; data = null; answers = {}; submitted = {}; renderHome();
  } else if (event.target.closest('[data-submit-now]')) {
    void submit(event.target.closest('[data-submit-now]').dataset.submitNow === 'final');
  } else if (event.target.closest('[data-jump-button]')) {
    const number = Number(host.querySelector('[data-jump]')?.value);
    if (number >= 1 && number <= 50) host.querySelector(`#junior-q-${numberKey(number)}`)?.scrollIntoView({behavior: 'smooth', block: 'center'});
  }
});
function syncSession() {
  const session = window.EDMUND_LEARNING_PORTAL_CONTEXT?.getSession?.();
  const next = session?.user?.id || null;
  if (next === owner) { token = session?.token || ''; return; }
  openVersion++;
  owner = next; token = session?.token || '';
  active = null; data = null; answers = {}; submitted = {};
  progress = Object.fromEntries(MODULES.map((module) => [module.key, 0]));
  renderHome();
  if (owner === JAYDEN_ID) {
    for (const module of MODULES) void loadSubmissions(module, owner).catch(() => {});
    const requested = requestedHomework();
    if (requested) void openModule(requested.module, requested.question);
  }
}
window.addEventListener('edmund:learning-portal-session', syncSession);
syncSession();
