import {juniorHighlightToolbar, mountJuniorHighlighter} from '../junior-text-highlighter.mjs';

const JAYDEN_ID = 'df2a3ba9-25be-4b0c-823a-304d4c29c2ba';
const MODULES = [
  {
    id: 'the-last-train',
    moduleKey: 'the-last-train-2026',
    title: 'The Last Train',
    summary: 'Reading — Text 2 · 14 段 · 39 句',
    dataUrl: './junior-quiz-review/the-last-train.json?v=20261013-1',
    audioUrl: './junior-quiz-review/audio-manifest.json?v=20261013-1',
    expectedParagraphs: 14,
    expectedFootnotes: 0,
    expectedSentences: 39
  },
  {
    id: 'valentines-day-landmines',
    moduleKey: 'valentines-day-landmines-2026',
    title: 'Valentine’s Day landmines everywhere',
    summary: 'Reading — Text 2 · 6 段 · 3 則註腳 · 31 句',
    dataUrl: './junior-quiz-review/valentines-day-landmines.json?v=20261113-1',
    audioUrl: './junior-quiz-review/valentines-day-landmines-audio-manifest.json?v=20261113-1',
    expectedParagraphs: 6,
    expectedFootnotes: 3,
    expectedSentences: 31
  }
];
const moduleById = id => MODULES.find(module => module.id === id);
const host = document.createElement('section');
host.className = 'quiz-app';
host.setAttribute('aria-label', '初中測驗溫習內容');
document.querySelector('[data-view="dashboard"]')?.append(host);
const highlighter = mountJuniorHighlighter(host, '.quiz-paragraph p, .quiz-footnote p', 'quiz');

let owner = null;
let token = '';
let activeModule = null;
let story = null;
let audio = null;
let sentences = [];
let view = 'home';
let drafts = {};
let solved = {};
let attempts = {};
let lastSubmitted = {};
let moduleProgress = {};
let queue = [];
let cursor = 0;
let round = 1;
let busy = false;
let practiceMode = 'sequential';
let randomCount = 10;
let practiceScope = [];
let practiceSolved = {};
let review = [];
let awaitingContinue = false;
let showTranslation = true;
let speed = 1;
const sentencePlayer = new Audio();
const escapeHtml = text => String(text ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const key = number => String(number).padStart(2, '0');
const totalCount = () => sentences.length || activeModule?.expectedSentences || 0;
const draftKey = () => `edmund-quiz-${activeModule.moduleKey}:${owner}`;
const allIds = () => sentences.map((_, index) => index + 1);
const currentId = () => queue[cursor];
const correctCount = () => Object.values(solved).filter(Boolean).length;
const isPracticeCorrect = id => practiceMode === 'random' ? Boolean(practiceSolved[id]) : Boolean(solved[id]);
const practiceCorrectCount = () => practiceScope.filter(isPracticeCorrect).length;
const shuffledIds = () => {
  const ids = allIds();
  for (let index = ids.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [ids[index], ids[swap]] = [ids[swap], ids[index]];
  }
  return ids;
};
const speedOptions = Array.from({length: 16}, (_, index) => (index + 1) / 4);

function readDraft() {
  try {
    const value = JSON.parse(localStorage.getItem(draftKey()) || '{}');
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch { return {}; }
}
function saveDraft() {
  try { localStorage.setItem(draftKey(), JSON.stringify(drafts)); } catch { /* Account submissions remain saved. */ }
}
function setStatus(message, error = false) {
  host.querySelectorAll('[data-status]').forEach(node => {
    node.textContent = message;
    node.classList.toggle('is-error', error);
  });
}
function resetActiveModule(module) {
  sentencePlayer.pause();
  host.querySelector('audio')?.pause();
  activeModule = module;
  story = null;
  audio = null;
  sentences = [];
  drafts = readDraft();
  solved = {};
  attempts = {};
  lastSubmitted = {};
  queue = [];
  cursor = 0;
  round = 1;
  practiceMode = 'sequential';
  randomCount = Math.min(10, module.expectedSentences);
  practiceScope = [];
  practiceSolved = {};
  review = [];
  awaitingContinue = false;
}
function renderHome() {
  sentencePlayer.pause();
  activeModule = null;
  story = null;
  audio = null;
  sentences = [];
  view = 'home';
  if (!owner) return;
  if (owner !== JAYDEN_ID) {
    host.innerHTML = '<article class="quiz-not-assigned"><p class="quiz-eyebrow">YOUR LEARNING SPACE</p><h2>已成功登入</h2><p>目前沒有分配給您的測驗溫習教材。</p></article>';
    return;
  }
  host.innerHTML = `<div class="quiz-home"><p class="quiz-eyebrow">JAYDEN · READING & DICTATION</p><h2>您的測驗溫習</h2>${MODULES.map((module, index) => `<button type="button" class="quiz-module" data-open-module="${escapeHtml(module.id)}"><span class="quiz-module__number">${key(index + 1)}</span><span><strong>${escapeHtml(module.title)}</strong><small>${escapeHtml(module.summary)}</small><em>${Number(moduleProgress[module.id] || 0)} / ${module.expectedSentences} 句已完成</em></span><span aria-hidden="true">↗</span></button>`).join('')}</div>`;
}
async function loadStory() {
  if (story && audio) return;
  const [dataResponse, audioResponse] = await Promise.all([fetch(activeModule.dataUrl), fetch(activeModule.audioUrl)]);
  if (!dataResponse.ok || !audioResponse.ok) throw new Error('文章或語音暫時未能載入。');
  const [data, manifest] = await Promise.all([dataResponse.json(), audioResponse.json()]);
  const footnotes = Array.isArray(data.footnotes) ? data.footnotes : [];
  const sections = [
    ...data.paragraphs.map(paragraph => ({...paragraph, sectionLabel: `原文第 ${paragraph.number} 段`})),
    ...footnotes.map(footnote => ({...footnote, sectionLabel: `註腳 ${footnote.number}`}))
  ];
  const loadedSentences = sections.flatMap(section => section.sentences.map(text => ({text, sectionLabel: section.sectionLabel})));
  if (data.id !== activeModule.id || data.paragraphs?.length !== activeModule.expectedParagraphs || footnotes.length !== activeModule.expectedFootnotes || loadedSentences.length !== activeModule.expectedSentences || manifest.sentences?.length !== activeModule.expectedSentences || manifest.voice !== 'bf_isabella' || manifest.locale !== 'en-gb') throw new Error('教材資料未通過完整性檢查。');
  story = data;
  audio = manifest;
  sentences = loadedSentences;
  queue = allIds().filter(id => !solved[id]);
}
async function fetchProgress(module) {
  return window.EDMUND_LEARNING_PORTAL_CONTEXT.rpc('junior_quiz_list_responses', {p_token: token, p_module_key: module.moduleKey});
}
async function loadHomeProgress(expectedOwner) {
  const entries = await Promise.all(MODULES.map(async module => {
    try {
      const rows = await fetchProgress(module);
      return [module.id, Array.isArray(rows) ? rows.filter(row => Boolean(row.correct)).length : 0];
    } catch { return [module.id, 0]; }
  }));
  if (owner !== expectedOwner) return;
  moduleProgress = Object.fromEntries(entries);
  if (view === 'home') renderHome();
}
async function loadProgress(expectedOwner) {
  try {
    const rows = await fetchProgress(activeModule);
    if (owner !== expectedOwner || !Array.isArray(rows)) return;
    for (const row of rows) {
      const id = Number(row.sentence_number);
      if (id < 1 || id > totalCount()) continue;
      const saved = String(row.answer || '');
      lastSubmitted[id] = saved;
      if (!drafts[id]) drafts[id] = saved;
      solved[id] = Boolean(row.correct);
      attempts[id] = Number(row.attempts) || 0;
    }
    moduleProgress[activeModule.id] = correctCount();
    round = Math.max(1, ...Object.values(attempts)) + (Object.keys(attempts).length ? 1 : 0);
    queue = allIds().filter(id => !solved[id]);
    cursor = 0;
  } catch {
    setStatus('暫時未能讀取帳戶紀錄；本機草稿仍可使用。', true);
  }
}
function translationButton() {
  return `<button type="button" class="quiz-button quiz-button--light" data-toggle-translation aria-pressed="${!showTranslation}">${showTranslation ? '隱藏中文翻譯' : '顯示中文翻譯'}</button>`;
}
function speedButtons() {
  return `<div class="quiz-speeds" role="group" aria-label="播放速度">${speedOptions.map(value => `<button type="button" data-speed="${value}" class="${speed === value ? 'is-active' : ''}" aria-pressed="${speed === value}">${Number.isInteger(value) ? value.toFixed(1) : value}×</button>`).join('')}</div>`;
}
function renderParagraph(paragraph) {
  return `<article class="quiz-paragraph"><span>${key(paragraph.number)}</span><p lang="en">${escapeHtml(paragraph.sentences.join(' '))}</p><p class="quiz-paragraph__zh" lang="zh-Hant">${escapeHtml(paragraph.zh)}</p></article>`;
}
function renderFootnote(footnote) {
  const marker = ['¹', '²', '³'][footnote.number - 1] || String(footnote.number);
  return `<article class="quiz-footnote"><span>${marker}</span><p lang="en">${escapeHtml(footnote.sentences.join(' '))}</p><p class="quiz-paragraph__zh" lang="zh-Hant">${escapeHtml(footnote.zh)}</p></article>`;
}
function practiceSetup() {
  const maximum = totalCount();
  randomCount = Math.max(1, Math.min(randomCount, maximum));
  return `<section class="quiz-practice-setup" data-practice-setup aria-labelledby="practice-mode-title"><div><p class="quiz-eyebrow">DICTATION MODE</p><h3 id="practice-mode-title">選擇默寫模式</h3><p>順序模式依原文次序練習；隨機模式會抽選完整句子並打亂次序。</p></div><fieldset><legend>練習方式</legend><label><input type="radio" name="practice-mode" value="sequential" data-practice-mode ${practiceMode === 'sequential' ? 'checked' : ''}><span><strong>順序模式</strong><small>由第 1 句開始，按原文次序前進</small></span></label><label><input type="radio" name="practice-mode" value="random" data-practice-mode ${practiceMode === 'random' ? 'checked' : ''}><span><strong>隨機默寫模式</strong><small>從全文完整句子中隨機抽選</small></span></label></fieldset><label class="quiz-random-count" data-random-options ${practiceMode === 'random' ? '' : 'hidden'}><span>隨機句子數量</span><input type="number" min="1" max="${maximum}" value="${randomCount}" inputmode="numeric" data-random-count><small>可選 1–${maximum} 句；每句由句首至句號為一個完整單位。</small></label><button type="button" class="quiz-button" data-start>開始${practiceMode === 'random' ? ` ${randomCount} 句隨機` : '順序'}默寫</button></section>`;
}
function renderStory() {
  if (!story || !audio) return;
  view = 'story';
  sentencePlayer.pause();
  const footnotes = Array.isArray(story.footnotes) ? story.footnotes : [];
  host.innerHTML = `<div class="quiz-story-head"><button type="button" class="quiz-back" data-home>← 所有模組</button><p class="quiz-eyebrow">${escapeHtml(story.category)}</p><h2>${escapeHtml(story.title)}</h2><p>${escapeHtml(story.introduction)}</p><div class="quiz-story-actions">${translationButton()}<button type="button" class="quiz-button" data-focus-practice>設定聆聽默寫 →</button></div></div>
  <section class="quiz-listening" aria-label="聆聽全篇"><div><span class="quiz-eyebrow">LISTEN TO THE STORY</span><h3>聆聽全文</h3><p>英式女聲朗讀。可調整播放位置及速度。</p></div><audio controls preload="metadata" src="./${escapeHtml(audio.full)}" aria-label="${escapeHtml(story.title)} 全文朗讀"></audio>${speedButtons()}</section>
  ${practiceSetup()}
  ${juniorHighlightToolbar()}
  <div class="quiz-paragraphs" data-translation-visible="${showTranslation}">${story.paragraphs.map(renderParagraph).join('')}${footnotes.length ? `<section class="quiz-footnotes" aria-label="註腳"><h3>Footnotes · 註腳</h3>${footnotes.map(renderFootnote).join('')}</section>` : ''}</div>
  <div class="quiz-story-bottom"><button type="button" class="quiz-button" data-focus-practice>選擇模式並開始</button></div>`;
  host.querySelector('audio').playbackRate = speed;
  highlighter.syncToolbar();
}
function reviewMarkup() {
  if (!review.length) return '';
  return `<section class="quiz-review" aria-live="polite"><p class="quiz-eyebrow">CORRECT SENTENCE · 正確句子</p>${review.map(entry => { const sentence = sentences[entry.id - 1]?.text || ''; return `<article class="${entry.correct ? 'is-correct' : 'is-wrong'}"><strong>${entry.correct ? '✓ 答對' : '✕ 答錯'} · 第 ${key(entry.id)} 句</strong><p lang="en">${escapeHtml(sentence)}</p></article>`; }).join('')}</section>`;
}
function renderExercise() {
  if (!story || !audio) return;
  view = 'exercise';
  const total = practiceScope.length || totalCount();
  if (!queue.length) {
    host.innerHTML = `${reviewMarkup()}<div class="quiz-finished"><p class="quiz-eyebrow">ALL SENTENCES COMPLETE</p><h2>${total} 句全部答對了</h2><p>你已完成${practiceMode === 'random' ? '本次隨機' : '全文'}默寫。可以返回文章重讀或重聽。</p><button type="button" class="quiz-button" data-story>返回文章</button></div>`;
    return;
  }
  cursor = Math.max(0, Math.min(cursor, queue.length - 1));
  const id = currentId();
  const item = sentences[id - 1];
  const filled = practiceScope.filter(number => String(drafts[number] || '').trim()).length;
  const missing = total - filled;
  const correct = practiceCorrectCount();
  host.innerHTML = `<div class="quiz-exercise-head"><button type="button" class="quiz-back" data-story>← 返回文章</button><p class="quiz-eyebrow">${practiceMode === 'random' ? 'RANDOM DICTATION' : 'LISTEN · TYPE · CHECK'}</p><h2>${practiceMode === 'random' ? '隨機逐句默寫' : '逐句聆聽默寫'}</h2><p>聽一句，輸入完整英文句子。拼字、詞序及英文字母大小寫均須正確；標點及註腳標記不影響判分。每次提交後都會顯示正確句子，答錯的句子會在下一輪重現。</p></div>
  <div class="quiz-progress" aria-label="完成進度"><strong>${correct} / ${total} 句已答對</strong><span>第 ${round} 輪 · 第 ${cursor + 1} / ${queue.length} 句</span><div><i style="width:${Math.round(correct / total * 100)}%"></i></div></div>
  ${reviewMarkup()}
  <section class="quiz-dictation" aria-label="第 ${id} 句默寫"><div class="quiz-dictation__meta"><span>第 ${key(id)} 句</span><span>${escapeHtml(item.sectionLabel)}</span>${attempts[id] ? `<span>已嘗試 ${attempts[id]} 次</span>` : ''}</div><button type="button" class="quiz-play" data-play-sentence>▶ 播放這一句</button>${speedButtons()}<label for="quiz-answer">聽後輸入完整句子</label><textarea id="quiz-answer" data-answer rows="4" spellcheck="false" autocomplete="off" autocapitalize="off" placeholder="在此輸入聽到的英文句子…" ${awaitingContinue ? 'readonly' : ''}>${escapeHtml(drafts[id] || '')}</textarea><p class="quiz-hint">${awaitingContinue ? '請先閱讀上方正確句子，再繼續下一句。' : '可重播；英文字母大小寫必須與原句完全相同。閱讀原文只在文章頁顯示。'}</p><p class="quiz-status" data-status role="status" aria-live="polite"></p><div class="quiz-dictation__actions">${awaitingContinue ? `<button type="button" class="quiz-button" data-continue>已閱讀，繼續下一句 →</button>` : `<button type="button" class="quiz-button quiz-button--light" data-prev ${cursor === 0 ? 'disabled' : ''}>← 上一句</button><button type="button" class="quiz-button" data-check ${String(drafts[id] || '').trim() && !busy ? '' : 'disabled'}>檢查答案</button><button type="button" class="quiz-button quiz-button--light" data-next>下一句 →</button>`}</div></section>
  <section class="quiz-submit"><div><h3>提交本次練習</h3><p>可提交已填句子，或填完本次 ${total} 句後一次提交；提交後會列出每句正確句子。</p><small>${filled} / ${total} 句已填${missing ? ` · 尚餘 ${missing} 句` : ''}</small></div><div><button type="button" class="quiz-button quiz-button--light" data-submit="partial" ${filled && !busy && !awaitingContinue ? '' : 'disabled'}>提交已填答案</button><button type="button" class="quiz-button" data-submit="full" ${missing || busy || awaitingContinue ? 'disabled' : ''}>提交全部 ${total} 句</button></div><p class="quiz-status" data-status role="status" aria-live="polite"></p></section>`;
  if (!awaitingContinue) host.querySelector('[data-answer]')?.focus({preventScroll:true});
}
function move(delta) {
  sentencePlayer.pause();
  review = [];
  awaitingContinue = false;
  const next = cursor + delta;
  if (next >= 0 && next < queue.length) {
    cursor = next;
    renderExercise();
    return;
  }
  if (delta > 0 && next >= queue.length) {
    const pending = queue.filter(id => !isPracticeCorrect(id));
    queue = pending;
    cursor = 0;
    if (pending.length) round += 1;
    renderExercise();
    if (pending.length) setStatus(`進入第 ${round} 輪：重聽尚未答對的 ${pending.length} 句。`);
  }
}
async function submit(ids, full = false, advance = false) {
  if (busy || owner !== JAYDEN_ID || !activeModule) return;
  const total = practiceScope.length;
  const payload = {};
  for (const id of ids) if (String(drafts[id] || '').trim()) payload[key(id)] = String(drafts[id]).trim();
  if (full && Object.keys(payload).length !== total) { setStatus(`請先填妥 ${total} 句。`, true); return; }
  if (!Object.keys(payload).length) { setStatus('請先輸入至少一句。', true); return; }
  busy = true;
  host.querySelectorAll('[data-check], [data-submit]').forEach(button => { button.disabled = true; });
  setStatus('正在檢查並儲存到學生帳戶…');
  try {
    const result = await window.EDMUND_LEARNING_PORTAL_CONTEXT.rpc('junior_quiz_submit', {p_token:token, p_module_key:activeModule.moduleKey, p_answers:payload, p_final:full && total === totalCount()});
    review = [];
    for (const [raw, correct] of Object.entries(result.results || {})) {
      const id = Number(raw);
      solved[id] = Boolean(correct) || Boolean(solved[id]);
      if (practiceMode === 'random') practiceSolved[id] = Boolean(correct);
      attempts[id] = (attempts[id] || 0) + 1;
      lastSubmitted[id] = drafts[id];
      review.push({id, correct:Boolean(correct)});
    }
    moduleProgress[activeModule.id] = correctCount();
    const checked = Object.keys(payload).length;
    const correct = Object.values(result.results || {}).filter(Boolean).length;
    if (advance) {
      const id = ids[0];
      const submittedResult = Boolean(result.results?.[key(id)]);
      awaitingContinue = true;
      renderExercise();
      setStatus(submittedResult ? '答對了！請閱讀正確句子後繼續。' : '答案不完全相同（包括大小寫）。請閱讀正確句子；這一句會在下一輪再試。', !submittedResult);
    } else {
      queue = practiceScope.filter(id => !isPracticeCorrect(id));
      cursor = 0;
      if (queue.length) round += 1;
      renderExercise();
      setStatus(`已提交 ${checked} 句，其中 ${correct} 句正確。${queue.length ? `第 ${round} 輪尚餘 ${queue.length} 句。` : '全文完成！'}`);
    }
    saveDraft();
  } catch (error) {
    setStatus(`未能儲存：${error.message || '請檢查網絡後重試。'} 本機草稿仍在。`, true);
  } finally {
    busy = false;
    host.querySelectorAll('[data-check], [data-submit]').forEach(button => {
      if (button.hasAttribute('data-check')) button.disabled = awaitingContinue || !String(drafts[currentId()] || '').trim();
      else button.disabled = awaitingContinue || (button.dataset.submit === 'full' ? practiceScope.some(id => !String(drafts[id] || '').trim()) : !practiceScope.some(id => String(drafts[id] || '').trim()));
    });
  }
}
host.addEventListener('input', event => {
  if (event.target.matches('[data-random-count]')) {
    randomCount = Math.max(1, Math.min(Number(event.target.value) || 1, totalCount()));
    const start = host.querySelector('[data-start]');
    if (start && practiceMode === 'random') start.textContent = `開始 ${randomCount} 句隨機默寫`;
    return;
  }
  if (!event.target.matches('[data-answer]')) return;
  drafts[currentId()] = event.target.value;
  saveDraft();
  host.querySelector('[data-check]').disabled = !event.target.value.trim() || busy;
});
host.addEventListener('change', event => {
  if (!event.target.matches('[data-practice-mode]')) return;
  practiceMode = event.target.value === 'random' ? 'random' : 'sequential';
  const options = host.querySelector('[data-random-options]');
  if (options) options.hidden = practiceMode !== 'random';
  const start = host.querySelector('[data-start]');
  if (start) start.textContent = practiceMode === 'random' ? `開始 ${randomCount} 句隨機默寫` : '開始順序默寫';
});
host.addEventListener('click', async event => {
  const target = event.target.closest('button');
  if (!target) return;
  if (target.matches('[data-home]')) {
    host.querySelector('audio')?.pause();
    if (activeModule) moduleProgress[activeModule.id] = correctCount();
    renderHome();
  } else if (target.matches('[data-open-module]')) {
    const module = moduleById(target.dataset.openModule);
    if (!module) return;
    resetActiveModule(module);
    host.innerHTML = '<p class="quiz-loading" role="status">正在載入文章與語音…</p>';
    try { await loadStory(); await loadProgress(owner); if (owner === JAYDEN_ID) renderStory(); }
    catch (error) { host.innerHTML = `<p class="quiz-error" role="alert">${escapeHtml(error.message)}</p><button type="button" data-home>返回模組</button>`; }
  } else if (target.matches('[data-story]')) {
    sentencePlayer.pause();
    renderStory();
  } else if (target.matches('[data-focus-practice]')) {
    host.querySelector('[data-practice-setup]')?.scrollIntoView({behavior:'smooth', block:'center'});
  } else if (target.matches('[data-start]')) {
    host.querySelector('audio')?.pause();
    const countInput = host.querySelector('[data-random-count]');
    randomCount = Math.max(1, Math.min(Number(countInput?.value) || 1, totalCount()));
    practiceScope = practiceMode === 'random' ? shuffledIds().slice(0, randomCount) : allIds();
    practiceSolved = {};
    review = [];
    awaitingContinue = false;
    queue = practiceMode === 'random' ? [...practiceScope] : practiceScope.filter(id => !solved[id]);
    cursor = 0;
    round = 1;
    renderExercise();
  } else if (target.matches('[data-toggle-translation]')) {
    showTranslation = !showTranslation;
    target.textContent = showTranslation ? '隱藏中文翻譯' : '顯示中文翻譯';
    target.setAttribute('aria-pressed', String(!showTranslation));
    host.querySelector('.quiz-paragraphs').dataset.translationVisible = String(showTranslation);
  } else if (target.matches('[data-speed]')) {
    speed = Number(target.dataset.speed);
    const fullPlayer = host.querySelector('audio');
    if (fullPlayer) fullPlayer.playbackRate = speed;
    sentencePlayer.playbackRate = speed;
    host.querySelectorAll('[data-speed]').forEach(button => { button.classList.toggle('is-active', Number(button.dataset.speed) === speed); button.setAttribute('aria-pressed', String(Number(button.dataset.speed) === speed)); });
  } else if (target.matches('[data-play-sentence]')) {
    const clip = audio.sentences[currentId() - 1];
    const src = `./${clip}`;
    if (sentencePlayer.src.endsWith(clip) && !sentencePlayer.paused) { sentencePlayer.pause(); return; }
    sentencePlayer.pause(); sentencePlayer.src = src; sentencePlayer.playbackRate = speed;
    try { await sentencePlayer.play(); } catch { setStatus('語音暫時無法播放，請稍後再試。', true); }
  } else if (target.matches('[data-prev]')) move(-1);
  else if (target.matches('[data-next]')) move(1);
  else if (target.matches('[data-continue]')) move(1);
  else if (target.matches('[data-check]')) void submit([currentId()], false, true);
  else if (target.matches('[data-submit]')) void submit(practiceScope, target.dataset.submit === 'full');
});

function syncSession() {
  const session = window.EDMUND_LEARNING_PORTAL_CONTEXT?.getSession?.();
  const next = session?.user?.id || null;
  if (next === owner) { token = session?.token || ''; return; }
  owner = next;
  token = session?.token || '';
  sentencePlayer.pause();
  host.querySelector('audio')?.pause();
  activeModule = null; story = null; audio = null; sentences = []; view = 'home'; drafts = {}; solved = {}; attempts = {}; lastSubmitted = {}; moduleProgress = {}; queue = []; cursor = 0; round = 1;
  if (!owner) { host.replaceChildren(); return; }
  renderHome();
  if (owner === JAYDEN_ID) void loadHomeProgress(owner);
}
window.addEventListener('edmund:learning-portal-session', syncSession);
syncSession();
