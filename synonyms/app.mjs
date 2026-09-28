import { importantModule } from './important-data.mjs?v=20260928-important1';

const words = importantModule.words;
const total = words.length * 2;
const dashboard = document.querySelector('[data-view="dashboard"]');
const empty = dashboard?.querySelector('.learning-portal-empty');
empty?.remove();
const host = document.createElement('section');
host.className = 'syn-app';
host.setAttribute('aria-label', 'Important 同義詞練習');
dashboard?.append(host);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const keyFor = (stage, exercise) => String(stage + 1) + '-' + String(exercise + 1);
let owner = null;
let progress = { answers: {} };
let view = 'overview', stage = 0, exercise = 0, choice = null, hintOpen = false, streak = 0;
let storageFailed = false;
const progressKey = () => 'edmund-synonyms-important-v1:' + owner;
const record = (s, e) => progress.answers[keyFor(s, e)] || null;
const attempted = () => Object.values(progress.answers).filter(x => x.attempts > 0).length;
const mastered = () => Object.values(progress.answers).filter(x => x.mastered).length;
function readProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(progressKey()) || 'null');
    progress = saved && typeof saved.answers === 'object' && saved.answers ? saved : { answers: {} };
    storageFailed = false;
  } catch { progress = { answers: {} }; storageFailed = true; }
}
function saveProgress() {
  try { localStorage.setItem(progressKey(), JSON.stringify(progress)); storageFailed = false; }
  catch { storageFailed = true; }
}
function start(s, e = 0) {
  stage = s; exercise = e; choice = null; hintOpen = false; view = 'question'; render();
  host.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
}
function answer(letter) {
  if (view !== 'question' || choice) return;
  const question = words[stage].exercises[exercise];
  const option = question.options.find(o => o.letter === letter);
  if (!option) return;
  choice = letter;
  const correct = option.text === question.answer;
  const previous = record(stage, exercise) || { attempts: 0, mastered: false };
  progress.answers[keyFor(stage, exercise)] = {
    attempts: previous.attempts + 1,
    mastered: Boolean(previous.mastered || correct),
    lastCorrect: correct,
    lastChoice: letter,
    answeredAt: new Date().toISOString()
  };
  streak = correct ? streak + 1 : 0;
  saveProgress(); render();
  if (correct) {
    host.classList.remove('syn-celebrate');
    void host.offsetWidth;
    host.classList.add('syn-celebrate');
    setTimeout(() => host.classList.remove('syn-celebrate'), 900);
  }
  host.querySelector('.syn-feedback')?.focus({ preventScroll: true });
}
function next() {
  if (view !== 'question' || !choice) return;
  if (exercise === 0) start(stage, 1);
  else { view = 'stage-clear'; render(); host.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
}
function continueJourney() {
  if (stage === words.length - 1) { view = 'finish'; render(); }
  else start(stage + 1);
}
function stats() {
  const done = attempted();
  return '<div class="syn-stats" aria-label="練習進度">' +
    '<span><strong>' + done + '</strong><small>/ ' + total + ' 已作答</small></span>' +
    '<span><strong>' + mastered() + '</strong><small>已掌握</small></span>' +
    '<span><strong>' + streak + '</strong><small>連續答對</small></span></div>';
}
function shell(content) {
  const done = attempted();
  host.innerHTML = '<div class="syn-ambient" aria-hidden="true"><i></i><i></i><i></i></div>' +
    '<header class="syn-heading"><div><p class="syn-kicker">SYNONYM EXPANSION · MODULE 01</p>' +
    '<h2>把 <em>important</em> 說得更準確</h2><p>讀懂語境，選出最貼切的同義詞。</p></div>' + stats() + '</header>' +
    '<div class="syn-progress" role="progressbar" aria-label="已作答題目" aria-valuemin="0" aria-valuemax="' + total + '" aria-valuenow="' + done + '"><span style="width:' + (done / total * 100) + '%"></span></div>' +
    (storageFailed ? '<p class="syn-storage-note" role="status">此瀏覽器未能儲存進度；請勿關閉頁面。</p>' : '') + content;
}
function renderOverview() {
  const cards = words.map((word, index) => {
    const a = record(index, 0), b = record(index, 1);
    const count = Number(Boolean(a)) + Number(Boolean(b));
    const learned = Boolean(a?.mastered && b?.mastered);
    const visible = count > 0;
    return '<button class="syn-stage-card ' + (learned ? 'is-mastered' : count ? 'is-started' : '') + '" type="button" data-stage="' + index + '" aria-label="第 ' + (index + 1) + ' 組，' + (visible ? esc(word.word) : '未解鎖詞語') + '，已作答 ' + count + ' 題">' +
      '<span class="syn-stage-number">' + String(index + 1).padStart(2, '0') + '</span>' +
      '<span class="syn-stage-copy"><strong>' + (visible ? esc(word.word) : '探索新詞') + '</strong><small>' + (visible ? esc(word.meaning) : '完成題目後揭曉') + '</small></span>' +
      '<span class="syn-stage-dots" aria-hidden="true"><i class="' + (a ? 'done' : '') + '"></i><i class="' + (b ? 'done' : '') + '"></i></span></button>';
  }).join('');
  shell('<div class="syn-overview syn-enter"><div class="syn-overview-lead"><div><p class="syn-kicker">THE WORD JOURNEY</p><h3>14 組語境 · 28 道選擇題</h3><p>從原句出發，選出更精準的字。每組兩題；答後可查看每個選項的意思。</p></div><button class="syn-primary" type="button" data-start>開始挑戰 <span aria-hidden="true">↗</span></button></div>' +
    '<div class="syn-stage-grid">' + cards + '</div><p class="syn-footnote">按 1–6 可選答案；每組均可重新練習。進度保存在此瀏覽器的學生帳戶下。</p></div>');
}
function questionMarkup() {
  const word = words[stage], q = word.exercises[exercise];
  const selected = q.options.find(o => o.letter === choice);
  const correct = selected?.text === q.answer;
  const original = esc(q.original).replace(/\bimportant\b/gi, '<mark>$&</mark>');
  const upgrade = esc(q.upgrade).replace('______', '<span class="syn-blank ' + (choice ? 'is-filled' : '') + '">' + (choice ? esc(q.answer) : '________') + '</span>');
  const options = q.options.map(o => {
    const state = choice ? o.text === q.answer ? 'is-correct' : o.letter === choice ? 'is-wrong' : 'is-muted' : '';
    return '<button class="syn-option ' + state + '" type="button" data-answer="' + o.letter + '" ' + (choice ? 'disabled' : '') + '><span class="syn-option-letter">' + o.letter + '</span><span>' + esc(o.text) + '</span><span class="syn-option-icon" aria-hidden="true">' + (choice && o.text === q.answer ? '✓' : choice && o.letter === choice ? '×' : '↗') + '</span></button>';
  }).join('');
  const selectedNote = selected ? selected.explanation : '';
  const correctNote = q.options.find(o => o.text === q.answer)?.explanation || '';
  const feedback = choice ? '<section class="syn-feedback ' + (correct ? 'is-right' : 'is-try-again') + '" tabindex="-1" aria-live="polite"><div class="syn-feedback-top"><span class="syn-feedback-symbol" aria-hidden="true">' + (correct ? '✦' : '↺') + '</span><div><p class="syn-kicker">' + (correct ? 'NICE CHOICE' : 'LEARN THE DIFFERENCE') + '</p><h4>' + (correct ? '選得準確！' : '再看一次語境') + '</h4></div></div><p class="syn-reveal"><strong>' + esc(q.answer) + '</strong> · ' + esc(word.meaning) + '</p>' +
    '<p>' + esc(correct ? correctNote : selectedNote) + '</p>' + (!correct ? '<p class="syn-correct-note">正確答案：' + esc(correctNote) + '</p>' : '') +
    '<p class="syn-translation">中文語境：' + esc(q.zh) + '</p><details><summary>看看六個選項的解釋</summary><div class="syn-explanations">' + q.options.map(o => '<div><strong>' + o.letter + '. ' + esc(o.text) + '</strong><span>' + esc(o.explanation) + '</span></div>').join('') + '</div></details>' +
    '<button class="syn-primary" type="button" data-next>' + (exercise === 0 ? '下一題' : '完成這組') + ' <span aria-hidden="true">→</span></button></section>' : '';
  return '<div class="syn-play syn-enter"><nav class="syn-play-nav" aria-label="練習導覽"><button type="button" data-overview>← 返回詞語地圖</button><span>第 ' + String(stage + 1).padStart(2, '0') + ' 組 <b>·</b> ' + (exercise + 1) + ' / 2</span></nav>' +
    '<div class="syn-track" aria-hidden="true"><span style="width:' + ((stage * 2 + exercise + 1) / total * 100) + '%"></span></div>' +
    '<section class="syn-question-card"><div class="syn-question-label"><span class="syn-orbit" aria-hidden="true">✦</span><span>選出比 important 更準確的詞</span><small>QUESTION ' + String(stage * 2 + exercise + 1).padStart(2, '0') + ' / ' + total + '</small></div>' +
    '<div class="syn-sentences"><div class="syn-original"><span>ORIGINAL · 原句</span><p lang="en">' + original + '</p></div><div class="syn-upgrade"><span>YOUR UPGRADE · 改寫</span><p lang="en">' + upgrade + '</p></div></div>' +
    '<div class="syn-helpers"><button type="button" data-hint aria-expanded="' + hintOpen + '">中文語境 ' + (hintOpen ? '−' : '+') + '</button><button type="button" data-speak>聽原句 ♪</button></div>' +
    (hintOpen ? '<p class="syn-hint">' + esc(q.zh) + '</p>' : '') + '<div class="syn-options" role="group" aria-label="選擇最貼切的同義詞">' + options + '</div>' +
    (!choice ? '<p class="syn-keyboard">點選答案，或按鍵盤 1–6。</p>' : '') + feedback + '</section></div>';
}
function renderQuestion() { shell(questionMarkup()); }
function renderStageClear() {
  const word = words[stage], one = record(stage, 0), two = record(stage, 1);
  const count = Number(Boolean(one?.mastered)) + Number(Boolean(two?.mastered));
  shell('<section class="syn-clear syn-enter"><div class="syn-clear-emblem" aria-hidden="true">✦</div><p class="syn-kicker">STAGE ' + String(stage + 1).padStart(2, '0') + ' COMPLETE</p><h3>' + esc(word.word) + '</h3><p class="syn-clear-meaning">' + esc(word.meaning) + '</p><p>本組已掌握 <strong>' + count + ' / 2</strong> 題。' + (count < 2 ? '可以重練，直到兩題都答對。' : '很棒，繼續探索下一個詞。') + '</p><div class="syn-clear-actions"><button class="syn-secondary" type="button" data-retry>重練這組</button><button class="syn-primary" type="button" data-continue>' + (stage === words.length - 1 ? '查看學習成果' : '探索下一組') + ' →</button></div></section>');
}
function renderFinish() {
  const weak = words.map((w, i) => ({w,i})).filter(({i}) => !record(i,0)?.mastered || !record(i,1)?.mastered);
  shell('<section class="syn-clear syn-enter"><div class="syn-clear-emblem" aria-hidden="true">✧</div><p class="syn-kicker">JOURNEY COMPLETE</p><h3>28 題旅程完成</h3><p>已掌握 <strong>' + mastered() + ' / ' + total + '</strong> 題。' + (weak.length ? '這些詞值得再練一次：' : '14 個同義詞都已掌握！') + '</p>' + (weak.length ? '<div class="syn-review-list">' + weak.map(({w,i}) => '<button type="button" data-stage="' + i + '">' + esc(w.word) + ' ↗</button>').join('') + '</div>' : '') + '<button class="syn-primary" type="button" data-overview>返回詞語地圖 →</button></section>');
}
function render() {
  if (!owner || !host.isConnected) return;
  if (view === 'question') renderQuestion();
  else if (view === 'stage-clear') renderStageClear();
  else if (view === 'finish') renderFinish();
  else renderOverview();
}
function syncSession() {
  const snapshot = window.EDMUND_LEARNING_PORTAL_CONTEXT?.getSession?.();
  const nextOwner = snapshot?.user?.id || null;
  if (nextOwner === owner) return;
  owner = nextOwner; streak = 0; view = 'overview'; choice = null;
  if (owner) readProgress(); else progress = { answers: {} };
  render();
}
window.addEventListener('edmund:learning-portal-session', syncSession);
window.addEventListener('storage', event => { if (owner && event.key === progressKey()) { readProgress(); render(); } });
host.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.hasAttribute('data-answer')) answer(button.dataset.answer);
  else if (button.hasAttribute('data-start')) start(0);
  else if (button.hasAttribute('data-stage')) start(Number(button.dataset.stage));
  else if (button.hasAttribute('data-next')) next();
  else if (button.hasAttribute('data-retry')) start(stage);
  else if (button.hasAttribute('data-continue')) continueJourney();
  else if (button.hasAttribute('data-overview')) { view = 'overview'; choice = null; render(); }
  else if (button.hasAttribute('data-hint')) { hintOpen = !hintOpen; render(); host.querySelector('[data-hint]')?.focus(); }
  else if (button.hasAttribute('data-speak') && 'speechSynthesis' in window) {
    speechSynthesis.cancel(); const speech = new SpeechSynthesisUtterance(words[stage].exercises[exercise].original);
    speech.lang = 'en-GB'; speech.rate = 0.9; speechSynthesis.speak(speech);
  }
});
window.addEventListener('keydown', event => {
  if (!owner || document.querySelector('[data-view="dashboard"]')?.hidden || /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || '') || event.altKey || event.ctrlKey || event.metaKey) return;
  if (view === 'question' && !choice && /^[1-6]$/.test(event.key)) answer('ABCDEF'[Number(event.key) - 1]);
  else if (view === 'question' && choice && event.key === 'Enter' && document.activeElement === document.body) next();
  else if (event.key === 'Escape' && view !== 'overview') { view = 'overview'; choice = null; render(); }
});
syncSession();
