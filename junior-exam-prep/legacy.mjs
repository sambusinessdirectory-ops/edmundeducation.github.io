import {juniorHighlightToolbar, mountJuniorHighlighter} from '../junior-text-highlighter.mjs?v=20261021-study2';

const MODULE_KEY = 's2-exam-prep-oct-2026';
const JAYDEN_ID = 'df2a3ba9-25be-4b0c-823a-304d4c29c2ba';
const host = document.createElement('section');
host.className = 'junior-app';
host.setAttribute('aria-label', '初中考試溫習內容');
document.querySelector('[data-view="dashboard"]')?.append(host);
const highlighter = mountJuniorHighlighter(host, '.junior-table-shell td, .junior-table-shell th, .junior-question__sentence, .junior-question__translation', 'exam', {
  scopeSelector: '.junior-table-shell, .junior-question',
  scopeKey: scope => scope.classList.contains('junior-table-shell') ? 'legacy:forms' : `legacy:q${scope.dataset.question}`
});

const FORM_GROUPS = [
  ['role model', [['role model','榜樣；單數名詞'],['role models','榜樣；複數名詞']]],
  ['achievement', [['achieve','達成；動詞原形'],['achieved','已達成；過去式／過去分詞'],['achievement','成就；單數名詞'],['achievements','成就；複數名詞']]],
  ['trustworthy', [['trust','信任；名詞／動詞'],['trustworthiness','可靠程度；名詞'],['trustworthy','值得信賴的；形容詞']]],
  ['shortcoming', [['shortcoming','缺點；單數名詞'],['shortcomings','缺點；複數名詞']]],
  ['throw a tantrum', [['throw a tantrum','發脾氣；動詞原形'],['throws a tantrum','發脾氣；第三人稱單數'],['threw a tantrum','發了脾氣；過去式'],['thrown a tantrum','發過脾氣；過去分詞']]],
  ['cautionary', [['caution','謹慎；名詞'],['cautionary','警示性的；形容詞'],['cautious','謹慎的；形容詞'],['cautiously','謹慎地；副詞']]],
  ['diligence', [['diligence','勤奮；名詞'],['diligent','勤奮的；形容詞'],['diligently','勤奮地；副詞']]],
  ['perseverance', [['perseverance','毅力；名詞'],['persevere','堅持；動詞']]],
  ['pay off', [['pay off','得到回報；動詞原形'],['pays off','得到回報；第三人稱單數'],['paid off','得到回報；過去式／過去分詞'],['paying off','正得到回報；現在分詞']]],
  ['groundbreaking', [['groundbreaking','開創性的；形容詞'],['groundbreaking discovery','突破性發現；名詞片語']]],
  ['diagnose', [['diagnose','診斷；動詞原形'],['diagnosed','診斷了；過去式／過去分詞'],['diagnoses','診斷；第三人稱單數／複數名詞'],['diagnosis','診斷結果；單數名詞']]],
  ['brilliant', [['brilliance','卓越才智；名詞'],['brilliant','傑出的；形容詞'],['brilliantly','精彩地；副詞']]],
  ['frustrated', [['frustrate','使感到挫敗；動詞'],['frustrated','感到挫敗的；形容詞'],['frustration','挫敗感；名詞']]],
  ['communicate', [['communicate','溝通；動詞原形'],['communicated','已溝通；過去式／過去分詞'],['communicates','溝通；第三人稱單數'],['communication','溝通；名詞']]],
  ['stumble upon', [['stumble upon','偶然發現；動詞原形'],['stumbled upon','偶然發現了；過去式／過去分詞'],['stumbles upon','偶然發現；第三人稱單數']]]
];
const FORM_COUNT = FORM_GROUPS.reduce((count, [, forms]) => count + forms.length, 0);
if (FORM_COUNT !== 47) throw new Error('Word-form table must contain exactly 47 forms');

let owner = null;
let token = '';
let questions = null;
let clips = null;
let answers = {};
let submitted = {};
let view = 'home';
let tableVisible = true;
let translationVisible = true;
let saving = false;
const player = new Audio();
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const key = (number) => String(number).padStart(3, '0');
const draftKey = () => `edmund-junior-exam-${MODULE_KEY}:${owner}`;
const translationKey = () => `edmund-junior-exam-translation:${owner}`;

function translationButton() {
  return `<button type="button" class="junior-translation-toggle" data-toggle-translation aria-pressed="${!translationVisible}">${translationVisible ? '隱藏中文翻譯' : '顯示中文翻譯'}</button>`;
}
function syncTranslationControls() {
  host.dataset.translationHidden = String(!translationVisible);
  host.querySelectorAll('[data-toggle-translation]').forEach((button) => {
    button.textContent = translationVisible ? '隱藏中文翻譯' : '顯示中文翻譯';
    button.setAttribute('aria-pressed', String(!translationVisible));
  });
}

function readDraft() {
  try {
    const value = JSON.parse(localStorage.getItem(draftKey()) || '{}');
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch { return {}; }
}
function saveDraft() {
  try { localStorage.setItem(draftKey(), JSON.stringify(answers)); } catch { /* The server still keeps submitted answers. */ }
}
function answeredCount() { return Object.values(answers).filter((value) => String(value || '').trim()).length; }

function renderHome() {
  if (!owner) return;
  if (owner !== JAYDEN_ID) {
    host.innerHTML = '<article class="junior-empty"><p class="junior-eyebrow">YOUR LEARNING SPACE</p><h2>已成功登入</h2><p>目前沒有分配給您的考試溫習模組。新課題加入後會在這裏顯示。</p></article>';
    return;
  }
  host.innerHTML = `<div class="junior-home-heading"><p class="junior-eyebrow">YOUR EXAM PREPARATION</p><h2>您的溫習模組</h2><p>使用 47 個詞形完成 470 道混合填空題，並可分段提交。</p></div>
    <button class="junior-module-card" type="button" data-open-module><span class="junior-module-card__number">01</span><span><strong>S2 Exam Prep - Oct 2026</strong><small>Word Form Challenge · 47 forms × 10 questions</small><em data-home-progress>${Object.keys(submitted).length} / 470 題已提交</em></span><span aria-hidden="true">↗</span></button>`;
}

async function openLegacyModule() {
  view = 'module';
  host.innerHTML = '<p class="junior-loading" role="status">正在載入 470 題與語音…</p>';
  try { await loadModule(); if (view === 'module' && owner === JAYDEN_ID) renderModule(); }
  catch (error) { host.innerHTML = `<p class="junior-error" role="alert">${escapeHtml(error.message)}</p><button type="button" data-back>返回模組</button>`; }
}

async function loadModule() {
  if (questions && clips) return;
  const [dataResponse, audioResponse] = await Promise.all([
    fetch('./junior-exam-prep/s2-oct-2026-questions.json?v=20261012-s2-1'),
    fetch('./junior-exam-prep/audio-manifest.json?v=20261012-s2-1')
  ]);
  if (!dataResponse.ok || !audioResponse.ok) throw new Error('教材或語音暫時未能載入，請稍後再試。');
  const [data, audio] = await Promise.all([dataResponse.json(), audioResponse.json()]);
  if (data.module !== MODULE_KEY || data.questions?.length !== 470 || Object.keys(audio).length !== 470) throw new Error('教材資料未通過完整性檢查。');
  questions = data.questions;
  clips = audio;
}

async function loadSubmissions(expectedOwner) {
  try {
    const rows = await window.EDMUND_LEARNING_PORTAL_CONTEXT.rpc('junior_exam_list_responses', {p_token: token, p_module_key: MODULE_KEY});
    if (owner !== expectedOwner || !Array.isArray(rows)) return;
    const serverAnswers = {};
    submitted = {};
    for (const row of rows) {
      const number = Number(row.question_number);
      if (number < 1 || number > 470) continue;
      serverAnswers[key(number)] = String(row.answer || '');
      submitted[key(number)] = Boolean(row.correct);
    }
    answers = {...serverAnswers, ...readDraft()};
    if (view === 'module') renderModule(); else renderHome();
  } catch {
    if (owner === expectedOwner) {
      const status = host.querySelector('[data-submit-status]');
      if (status) status.textContent = '暫時未能讀取帳戶紀錄；已載入本機草稿。';
    }
  }
}

function tableRows() {
  return FORM_GROUPS.flatMap(([family, forms]) => forms.map(([form, meaning], index) =>
    `<tr><th scope="row">${index === 0 ? escapeHtml(family) : ''}</th><td lang="en">${escapeHtml(form)}</td><td>${escapeHtml(meaning)}</td></tr>`
  )).join('');
}
function questionCard(question) {
  const number = key(question.number);
  const sentence = escapeHtml(question.sentence).replace('_____', `<input class="junior-answer" data-answer="${number}" name="answer-${number}" type="text" maxlength="100" autocomplete="off" spellcheck="false" aria-label="第 ${question.number} 題答案" value="${escapeHtml(answers[number] || '')}">`);
  const result = submitted[number] === undefined ? '' : `<span class="junior-result ${submitted[number] ? 'is-correct' : 'is-incorrect'}" data-result="${number}">${submitted[number] ? '✓ 正確' : '請再試一次'}</span>`;
  return `<article class="junior-question" id="junior-q-${number}" data-question="${number}"><div class="junior-question__top"><span class="junior-question__number">${number}</span><button type="button" class="junior-audio" data-play="${number}" aria-label="播放第 ${question.number} 題的英文語音">▶ 聆聽</button></div><p class="junior-question__sentence" lang="en">${sentence}</p><p class="junior-question__translation">${escapeHtml(question.translation)}</p><div class="junior-question__feedback" data-feedback="${number}">${result}</div></article>`;
}
function renderModule() {
  if (!questions || !clips || !owner) return;
  const groups = [];
  for (let start = 0; start < 470; start += 20) {
    groups.push(`<section class="junior-question-group" aria-labelledby="junior-group-${start + 1}"><h3 id="junior-group-${start + 1}">Questions ${String(start + 1).padStart(3, '0')}–${String(Math.min(start + 20, 470)).padStart(3, '0')}</h3>${questions.slice(start, start + 20).map(questionCard).join('')}</section>`);
  }
  host.innerHTML = `<div class="junior-module-heading"><button type="button" class="junior-back" data-back>← 所有模組</button><p class="junior-eyebrow">S2 · OCTOBER 2026</p><h2>S2 Exam Prep - Oct 2026</h2><p>每題填入一個詞或片語。可以先提交已填答案，或填妥 470 題後作完整提交。</p></div>
  ${juniorHighlightToolbar()}
  <div class="junior-table-shell ${tableVisible ? '' : 'is-hidden'}" data-table-shell><div class="junior-table-head"><div><span class="junior-eyebrow">REFERENCE TABLE</span><h3>47 個詞形一覽</h3><p>先查看全部 47 個詞形，再開始作答。</p></div><button type="button" data-toggle-table aria-expanded="${tableVisible}">${tableVisible ? '隱藏詞形表' : '顯示詞形表'}</button></div><div class="junior-table-scroll"><table><thead><tr><th>詞族</th><th>詞形</th><th>用法與意思</th></tr></thead><tbody>${tableRows()}</tbody></table></div></div>
  <aside class="junior-table-float ${tableVisible ? '' : 'is-hidden'}" data-table-float hidden aria-label="浮動詞形表"><div class="junior-table-head"><strong>47 個詞形一覽</strong><button type="button" data-toggle-table aria-expanded="${tableVisible}">${tableVisible ? '隱藏詞形表' : '顯示詞形表'}</button></div><div class="junior-table-scroll"><table><thead><tr><th>詞族</th><th>詞形</th><th>用法與意思</th></tr></thead><tbody>${tableRows()}</tbody></table></div></aside>
  <div class="junior-exam-toolbar"><span><strong data-answered-count>${answeredCount()}</strong> / 470 題已填</span>${translationButton()}<label>跳至題目 <input type="number" min="1" max="470" data-jump aria-label="跳至題目編號"></label><button type="button" data-jump-button>前往</button><span data-submitted-count>${Object.keys(submitted).length} 題已提交</span><button type="button" data-submit-now="partial">提交已填答案</button><button type="button" data-submit-now="final" ${answeredCount() === 470 ? '' : 'disabled'}>提交全部</button><span class="junior-toolbar-status" role="status" aria-live="polite" data-toolbar-status></span></div>
  <form data-exam-form novalidate>${groups.join('')}<div class="junior-submit-bar"><div><strong>提交答案</strong><small>部分提交會保存所有已填答案；完整提交需要填妥 470 題。</small><p role="status" aria-live="polite" data-submit-status></p></div>${translationButton()}<button type="submit" name="mode" value="partial" data-submit-partial>提交已填答案</button><button type="submit" name="mode" value="final" data-submit-final ${answeredCount() === 470 ? '' : 'disabled'}>提交全部 470 題</button></div></form>`;
  syncTranslationControls();
  highlighter.syncToolbar();
  updateCounters();
  updateSticky();
}

function updateCounters() {
  host.querySelector('[data-answered-count]')?.replaceChildren(String(answeredCount()));
  host.querySelectorAll('[data-submit-final], [data-submit-now="final"]').forEach((button) => { button.disabled = answeredCount() !== 470 || saving; });
  host.querySelectorAll('[data-submit-partial], [data-submit-now="partial"]').forEach((button) => { button.disabled = answeredCount() === 0 || saving; });
  host.querySelector('[data-submitted-count]')?.replaceChildren(`${Object.keys(submitted).length} 題已提交`);
}
function updateSticky() {
  const table = host.querySelector('[data-table-shell]');
  const floating = host.querySelector('[data-table-float]');
  if (!table || !floating) return;
  floating.hidden = table.getBoundingClientRect().bottom >= 76;
}
window.addEventListener('scroll', updateSticky, {passive: true});

async function submit(final) {
  if (saving || !owner || owner !== JAYDEN_ID) return;
  const payload = Object.fromEntries(Object.entries(answers).filter(([, value]) => String(value || '').trim()).map(([number, value]) => [number, String(value).trim()]));
  const count = Object.keys(payload).length;
  const statuses = host.querySelectorAll('[data-submit-status], [data-toolbar-status]');
  const showStatus = (message) => statuses.forEach((status) => { status.textContent = message; });
  if (!count || (final && count !== 470)) {
    showStatus(final ? '請先填妥全部 470 題。' : '請先填寫至少一題。');
    return;
  }
  saving = true;
  updateCounters();
  showStatus('正在儲存到學生帳戶…');
  try {
    const outcome = await window.EDMUND_LEARNING_PORTAL_CONTEXT.rpc('junior_exam_submit', {p_token: token, p_module_key: MODULE_KEY, p_answers: payload, p_final: final});
    for (const [number, correct] of Object.entries(outcome.results || {})) {
      submitted[number] = Boolean(correct);
      const feedback = host.querySelector(`[data-feedback="${number}"]`);
      if (feedback) feedback.innerHTML = `<span class="junior-result ${correct ? 'is-correct' : 'is-incorrect'}">${correct ? '✓ 正確' : '請再試一次'}</span>`;
    }
    host.querySelector('[data-submitted-count]')?.replaceChildren(`${Object.keys(submitted).length} 題已提交`);
    showStatus(`${final ? '完整' : '部分'}提交成功：${outcome.submitted} 題，${outcome.correct} 題正確。答案已儲存到學生帳戶。`);
    saveDraft();
  } catch (error) {
    showStatus(`未能提交：${error.message || '請檢查網絡後重試。'} 本機草稿仍在。`);
  } finally { saving = false; updateCounters(); }
}

host.addEventListener('input', (event) => {
  const input = event.target.closest('[data-answer]');
  if (!input) return;
  answers[input.dataset.answer] = input.value;
  delete submitted[input.dataset.answer];
  host.querySelector(`[data-feedback="${input.dataset.answer}"]`)?.replaceChildren();
  saveDraft();
  updateCounters();
});
host.addEventListener('submit', (event) => {
  if (!event.target.matches('[data-exam-form]')) return;
  event.preventDefault();
  void submit(event.submitter?.value === 'final');
});
host.addEventListener('click', async (event) => {
  if (event.target.closest('[data-open-module]')) {
    await openLegacyModule();
  } else if (event.target.closest('[data-back]')) {
    player.pause(); window.location.assign('./junior-exam-prep.html');
  } else if (event.target.closest('[data-submit-now]')) {
    void submit(event.target.closest('[data-submit-now]').dataset.submitNow === 'final');
  } else if (event.target.closest('[data-toggle-table]')) {
    tableVisible = !tableVisible;
    host.querySelectorAll('[data-table-shell], [data-table-float]').forEach((table) => table.classList.toggle('is-hidden', !tableVisible));
    host.querySelectorAll('[data-toggle-table]').forEach((button) => { button.textContent = tableVisible ? '隱藏詞形表' : '顯示詞形表'; button.setAttribute('aria-expanded', String(tableVisible)); });
    requestAnimationFrame(updateSticky);
  } else if (event.target.closest('[data-toggle-translation]')) {
    translationVisible = !translationVisible;
    try { localStorage.setItem(translationKey(), translationVisible ? 'visible' : 'hidden'); } catch { /* The current-page toggle still works. */ }
    syncTranslationControls();
  } else if (event.target.closest('[data-jump-button]')) {
    const number = Number(host.querySelector('[data-jump]')?.value);
    if (number >= 1 && number <= 470) host.querySelector(`#junior-q-${key(number)}`)?.scrollIntoView({behavior: 'smooth', block: 'start'});
  } else if (event.target.closest('[data-play]')) {
    const button = event.target.closest('[data-play]');
    const clip = clips?.[button.dataset.play];
    if (!clip) return;
    if (player.src.endsWith(`/q${button.dataset.play}.mp3`) && !player.paused) { player.pause(); return; }
    player.pause(); player.src = `./${clip.path}`;
    try { await player.play(); } catch { button.textContent = '音檔暫時無法播放'; }
  }
});

function syncSession() {
  const session = window.EDMUND_LEARNING_PORTAL_CONTEXT?.getSession?.();
  const next = session?.user?.id || null;
  if (next === owner) { token = session?.token || ''; return; }
  owner = next; token = session?.token || '';
  player.pause(); answers = {}; submitted = {}; view = 'home';
  if (!owner) { host.replaceChildren(); return; }
  try { translationVisible = localStorage.getItem(translationKey()) !== 'hidden'; } catch { translationVisible = true; }
  answers = readDraft();
  renderHome();
  if (owner === JAYDEN_ID) {
    void loadSubmissions(owner);
    if (window.location.hash === '#module') void openLegacyModule();
  }
}
window.addEventListener('edmund:learning-portal-session', syncSession);
syncSession();
