import {session, saveState, loadState} from './learning-state.mjs?v=20260916-ui-polish1';
import {shuffleChoices, correctSourceLetter, initialChoiceOrders, retryChoiceOrder, validChoiceOrder} from './synonym-quiz.mjs?v=20260930-options1';

const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[character]));
const roman = number => String(number).padStart(2, '0');
const letters = 'ABCDEF';
const soundKey = 'edmund-professional-sound-effects-v1';
let soundContext = null;

async function playFeedback(correct) {
  try {
    if (localStorage.getItem(soundKey) === 'off') return;
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return;
    if (!soundContext || soundContext.state === 'closed') soundContext = new Context();
    if (soundContext.state !== 'running') await soundContext.resume();
    const start = soundContext.currentTime + .015;
    const notes = correct ? [[523.25, 0, .16], [659.25, .11, .19], [783.99, .22, .29]] : [[330, 0, .18], [247, .16, .27]];
    for (const [frequency, delay, length] of notes) {
      const oscillator = soundContext.createOscillator();
      const gain = soundContext.createGain();
      oscillator.type = correct ? 'sine' : 'triangle';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(.0001, start + delay);
      gain.gain.exponentialRampToValueAtTime(correct ? .15 : .10, start + delay + .02);
      gain.gain.exponentialRampToValueAtTime(.0001, start + delay + length);
      oscillator.connect(gain).connect(soundContext.destination);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
      oscillator.start(start + delay);
      oscillator.stop(start + delay + length + .03);
    }
  } catch { /* A later user gesture can retry the sound context. */ }
}

export function mountSynonymPage(page, data, audioManifest = {}) {
  let currentModule = null;
  let queue = [], orders = [], position = 0, selected = null;
  let questionAudio = null;
  const owner = session()?.user?.id;
  const belongs = () => Boolean(owner) && session()?.user?.id === owner;
  const stateKey = id => `draft:synonym:lesson-5:${id}`;
  const header = () => '<header class="pro-page-header"><a href="./">← 返回課程 · Back to course</a><a href="./situation-cards.html">處境卡答案</a></header>';
  const route = (view, push = true) => {
    if (!push) return;
    const url = new URL(location.href);
    if (currentModule) url.searchParams.set('module', currentModule.id);
    else url.searchParams.delete('module');
    if (view === 'guide' || view === 'index') url.searchParams.delete('view');
    else url.searchParams.set('view', view);
    if (url.href !== location.href) history.pushState(null, '', url);
  };
  const actions = (active = 'guide') => `<nav class="syn-actions syn-actions--top" aria-label="詞語練習導覽">
    <button type="button" class="syn-start" data-start>${active === 'quiz' ? '繼續 28 題練習' : '開始 28 題練習'}</button>
    ${active === 'false' ? '<button type="button" class="syn-back" data-guide>返回同義詞指南</button>' : '<button type="button" class="syn-back" data-false>容易混淆的詞</button>'}
    <button type="button" class="syn-back" data-list>返回詞語列表</button>
  </nav>`;
  const questionById = id => currentModule.questions.find(question => question.id === id);
  const stopQuestionAudio = () => {
    if (questionAudio) { const previous = questionAudio; questionAudio = null; previous.onended = null; previous.onerror = null; previous.pause(); previous.removeAttribute('src'); previous.load(); }
  };
  const audioStatus = text => { const node = page.querySelector('[data-syn-audio-status]'); if (node) node.textContent = text; };

  function showIndex(push = true) {
    stopQuestionAudio(); currentModule = null; route('index', push);
    page.innerHTML = header() + `<section class="syn-intro"><small>PROFESSIONAL ENGLISH · LESSON 5</small><h1>同義詞 (Synonym) · 一義多詞練習</h1><p>先讀用法，再在真實語境中選出更精確的字詞。</p></section><div class="syn-grid">${data.modules.map((item, index) => `<a class="syn-module-card" href="?module=${esc(item.id)}" data-open="${esc(item.id)}"><small>${roman(index + 1)} · ${item.guide.length} 個說法 · ${item.questions.length} 題</small><b>${esc(item.title)}</b><span>查看詞語指南及練習 →</span></a>`).join('')}</div>`;
  }

  function showGuide(push = true) {
    stopQuestionAudio(); route('guide', push);
    page.innerHTML = header() + `<section class="syn-intro"><small>LESSON 5 · ${esc(currentModule.title)}</small><h1>${esc(currentModule.title)} 的 14 種更精確說法</h1><p>先讀用法，再在語境中選出更精確的字詞。</p></section>${actions('guide')}<section class="syn-section"><h2>同義詞指南</h2><div class="syn-grid">${currentModule.guide.map(word => `<article class="syn-guide-card"><h3>${roman(word.order)} ${esc(word.word)}</h3><p class="meaning">${esc(word.meaning)}</p><p>${esc(word.description)}</p><p class="example" lang="en">${esc(word.example)}</p><p class="zh">${esc(word.zh)}</p><p class="zh">${esc(word.usage)}</p></article>`).join('')}</div></section>`;
  }

  function showFalseSynonyms(push = true) {
    stopQuestionAudio(); route('false', push);
    page.innerHTML = header() + `<section class="syn-intro"><small>LESSON 5 · ${esc(currentModule.title)}</small><h1>容易混淆的詞</h1><p>比較看似相近、用法卻不同的字詞。</p></section>${actions('false')}<section class="syn-section"><div class="syn-grid">${currentModule.falseSynonyms.map(word => `<article class="syn-false-card"><h3>${roman(word.order)} ${esc(word.name)}</h3><p>${esc(word.note.replace(/^#+\s*/, ''))}</p><p>${esc(word.detail)}</p></article>`).join('')}</div></section>`;
  }

  function freshAttempt() {
    const first = shuffleChoices(currentModule.questions.filter(question => question.id.endsWith('.1')).map(question => question.id));
    const second = shuffleChoices(currentModule.questions.filter(question => question.id.endsWith('.2')).map(question => question.id));
    queue = [...first, ...second];
    orders = initialChoiceOrders(queue.map(questionById));
    position = 0; selected = null;
  }

  function persist() {
    if (!belongs() || !currentModule) return;
    saveState(stateKey(currentModule.id), {version:2, queue, orders, position, selected, updatedAt:Date.now()}, owner);
  }

  async function startQuiz(push = true) {
    stopQuestionAudio(); route('quiz', push);
    const saved = await loadState(stateKey(currentModule.id));
    if (!belongs()) return;
    const ids = new Set(currentModule.questions.map(question => question.id));
    const validQueue = Array.isArray(saved?.queue) && saved.queue.length >= currentModule.questions.length &&
      saved.queue.every(id => ids.has(id)) && Number.isInteger(saved.position) &&
      saved.position >= 0 && saved.position <= saved.queue.length;
    if (validQueue) {
      queue = [...saved.queue]; position = saved.position; selected = saved.selected ?? null;
      orders = saved.version === 2 && Array.isArray(saved.orders) && saved.orders.length === queue.length &&
        saved.orders.every((order, index) => validChoiceOrder(questionById(queue[index]), order))
        ? saved.orders.map(order => [...order]) : initialChoiceOrders(queue.map(questionById));
      if (saved.version !== 2) persist();
    } else { freshAttempt(); persist(); }
    showQuiz();
  }

  function marked(sentence) {
    const base = currentModule.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return esc(sentence).replace(new RegExp(`\\b(${base})\\b`, 'i'), '<mark>$1</mark>');
  }

  function showQuiz() {
    if (position >= queue.length) {
      page.innerHTML = header() + `<section class="syn-quiz"><h1>${esc(currentModule.title)} · 練習完成</h1><p>28 題已全部答對。</p><nav class="syn-actions syn-actions--top"><button class="syn-start" type="button" data-restart>重新練習</button><button class="syn-back" type="button" data-guide>返回同義詞指南</button></nav></section>`;
      return;
    }
    const question = questionById(queue[position]);
    const ordered = orders[position].map(letter => question.options.find(option => option.letter === letter));
    const correct = correctSourceLetter(question);
    const answered = selected !== null;
    const clip = audioManifest[`${currentModule.id}:${question.id}`];
    page.innerHTML = header() + `<section class="syn-intro"><small>LESSON 5 · ${esc(currentModule.title)}</small><h1>選出最適合語境的詞語</h1><nav class="syn-actions syn-actions--top"><button class="syn-back" type="button" data-guide>返回同義詞指南</button><button class="syn-back" type="button" data-false>容易混淆的詞</button></nav><p>${position + 1} / ${queue.length} 題 · 6 個選項</p><div class="syn-progress" role="progressbar" aria-valuenow="${position}" aria-valuemin="0" aria-valuemax="${queue.length}"><span style="width:${position / queue.length * 100}%"></span></div></section><section class="syn-quiz"><small>目標詞語：${esc(question.target)} · QUESTION ${esc(question.id)}</small><p class="syn-question" lang="en">${marked(question.original)}</p><div class="syn-audio-controls"><button type="button" data-play-question ${clip?.path ? '' : 'disabled'}>▶ 聆聽句子</button><span data-syn-audio-status role="status">${clip?.path ? '' : '這句錄音暫時未能載入。'}</span></div>${question.zh ? `<p>${esc(question.zh)}</p>` : ''}<div class="syn-options">${ordered.map((option, index) => `<button type="button" data-choice="${option.letter}" ${answered ? 'disabled' : ''} class="${answered && option.letter === correct ? 'is-correct' : answered && option.letter === selected ? 'is-wrong' : ''}"><b>${letters[index]}</b>　${esc(option.text)}</button>`).join('')}</div>${answered ? `<div class="syn-feedback" role="status"><strong>${selected === correct ? '答對！' : '再試一次；這題稍後會重現。'} 正確用法：${esc(question.answer)}</strong>${ordered.map((option, index) => `<p><b>${letters[index]}. ${esc(option.text)}</b> — ${esc(question.feedback[option.letter] || '')}</p>`).join('')}</div><button class="syn-next" type="button" data-next>下一題 →</button>` : ''}</section>`;
  }

  async function playQuestion() {
    const question = questionById(queue[position]);
    const clip = audioManifest[`${currentModule.id}:${question.id}`];
    if (!clip?.path) return;
    stopQuestionAudio();
    const player = new Audio(new URL(clip.path, location.href).href);
    questionAudio = player;
    player.onplay = () => audioStatus('正在播放…');
    player.onended = () => { if (questionAudio === player) { questionAudio = null; audioStatus('播放完畢。'); } };
    player.onerror = () => { if (questionAudio === player) { questionAudio = null; audioStatus('錄音未能播放，請再試。'); } };
    try { await player.play(); } catch { if (questionAudio === player) { questionAudio = null; audioStatus('錄音未能播放，請再按一次。'); } }
  }

  async function open(id, view = 'guide', push = true) {
    const found = data.modules.find(item => item.id === id);
    if (!found) { showIndex(push); return; }
    currentModule = found;
    if (view === 'false') showFalseSynonyms(push);
    else if (view === 'quiz') await startQuiz(push);
    else showGuide(push);
  }

  page.addEventListener('click', event => {
    const button = event.target.closest('[data-open],[data-list],[data-guide],[data-false],[data-start],[data-choice],[data-next],[data-restart],[data-play-question]');
    if (!button || !belongs()) return;
    if (button.matches('a')) event.preventDefault();
    if (button.dataset.open) void open(button.dataset.open);
    else if (button.hasAttribute('data-list')) showIndex();
    else if (button.hasAttribute('data-guide')) showGuide();
    else if (button.hasAttribute('data-false')) showFalseSynonyms();
    else if (button.hasAttribute('data-start')) void startQuiz();
    else if (button.hasAttribute('data-restart')) { stopQuestionAudio(); freshAttempt(); persist(); route('quiz'); showQuiz(); }
    else if (button.hasAttribute('data-play-question')) void playQuestion();
    else if (button.dataset.choice && selected === null) {
      stopQuestionAudio();
      selected = button.dataset.choice;
      const correct = selected === correctSourceLetter(questionById(queue[position]));
      void playFeedback(correct);
      persist(); showQuiz();
    } else if (button.hasAttribute('data-next') && selected !== null) {
      const question = questionById(queue[position]);
      if (selected !== correctSourceLetter(question)) {
        const at = Math.min(queue.length, position + 6);
        queue.splice(at, 0, question.id);
        orders.splice(at, 0, retryChoiceOrder(question, orders[position]));
      }
      stopQuestionAudio(); position++; selected = null; persist(); showQuiz();
      window.scrollTo({top:0, behavior:'smooth'});
    }
  });
  window.addEventListener('popstate', () => {
    const params = new URLSearchParams(location.search);
    void open(params.get('module'), params.get('view') || 'guide', false);
  });
  const params = new URLSearchParams(location.search);
  void open(params.get('module'), params.get('view') || 'guide', false);
}

let mounted = false;
async function initialise() {
  if (mounted || !document.querySelector('#root .course-section') || !session()?.user?.id) return;
  mounted = true;
  const page = document.createElement('main');
  page.className = 'pro-practice-page syn-page';
  document.body.classList.add('pro-dialogue-open', 'syn-page-open');
  document.body.append(page);
  try {
    const contentResponse = await fetch('./content/lesson-5-synonyms.json?v=20260930-audio1');
    if (!contentResponse.ok) throw Error('content');
    const data = await contentResponse.json();
    const audioManifest = await fetch('./content/lesson-5-synonym-audio.json?v=20260930-audio1')
      .then(response => response.ok ? response.json() : {}).catch(() => ({}));
    mountSynonymPage(page, data, audioManifest);
  } catch {
    page.innerHTML = '<p role="alert">同義詞教材暫時未能載入。請重新整理頁面。</p>';
  }
}
if (typeof document !== 'undefined' && document.getElementById('root')) {
  new MutationObserver(initialise).observe(document.getElementById('root'), {childList:true, subtree:true});
  initialise();
}
