import { initSpeechPreferences, setSpeechStudentNavigation } from '/speech-curation-preferences.mjs';
initSpeechPreferences();
const $ = selector => document.querySelector(selector);
const SESSION_KEY = 'edmund-speech-curation-session-v1';
const LOGIN_URL = '/speech-curation.html?next=churchill';
const CHAPTERS = [
  { first: 1, title: '開場與致意', short: '開場' },
  { first: 11, title: '歐洲與世界秩序', short: '歐洲團結' },
  { first: 36, title: '議會的自由與權力', short: '議會權力' },
  { first: 87, title: '人權與歐洲法院', short: '人權' },
  { first: 107, title: '鐵幕後的空席', short: '空席' },
  { first: 129, title: '德國與歐洲和平', short: '德國' },
  { first: 207, title: '復興歐洲的精神', short: '結語' }
];
const PARAGRAPH_STARTS = [0, 10, 22, 35, 50, 61, 74, 86, 106, 128, 141, 145, 153, 170, 177, 187, 206];
const CONTEXT_IMAGES = ['history', 'importance', 'after', 'style', 'people'];
// Phrases with yellow shading in the user's annotated PDF, grouped by pre-read chapter.
const CONTEXT_HIGHLIGHTS = [
  ['東歐多國受到蘇聯控制', 'Churchill形容這些地方位於「鐵幕」之後', 'Churchill在這個重要時刻發表演說', '討論歐洲團結、議會權力、人權、德國重新參與歐洲事務', '以及東歐國家暫時無法參與大會的問題'],
  ['相當完整的歐洲合作方向', '人權是演說中的核心內容之一', '他支持建立共同的人權原則', '也提出設立歐洲法院的構想', '讓侵犯人權的案件得到國際審視'],
  ['Churchill提出的幾個方向逐漸發展成實際制度', '之後制定《歐洲人權公約》', '並建立歐洲人權法院', '使人權保障從政治理想進一步走向法律制度', '整個過程沒有立即完成', '人權、德國參與和歐洲合作都在1950年代得到明顯推進'],
  ['正式之中帶有幽默', '也很善於使用比喻', '他把政治制度比作建築的「支柱」', '也用「鐵幕」描寫歐洲分裂', '他甚至用「先看看姑娘長甚麼樣，再決定是否結婚」來比喻不要過早作出政治承諾', '令抽象政治問題更容易理解', '也讓整篇演說既有權威感', '又不會過分沉重'],
  ['Winston Churchill 是演說者', 'Herbert Morrison 是英國政治家', 'Napoleon 被引用來談憲法設計', 'André Philip 提出「空席」問題', 'Winston Churchill', 'Herbert Morrison', 'Napoleon', 'André Philip']
];
const config = window.EDMUND_SUPABASE || {};
const el = {
  status: $('[data-status]'), loadingPanel: $('[data-loading-panel]'), loadProgress: $('[data-load-progress]'), loadFill: $('[data-load-fill]'), loadPercent: $('[data-load-percent]'), reader: $('[data-reader]'), context: $('[data-context]'),
  contextReading: $('[data-context-reading]'), fullText: $('[data-full-text]'), fullSection: $('#full-speech'),
  addressTranslation: $('[data-address-translation]'), addressRules: $('[data-address-rules]'), progressFill: $('[data-progress-fill]'), progressValue: $('[data-progress-value]'), pinnedSentence: $('[data-pinned-sentence]'), pinnedText: $('[data-pinned-text]'),
  chapters: $('[data-chapters]'), addressChapters: $('[data-address-chapters]'), addressNavToggle: $('[data-address-nav-toggle]'), lines: $('[data-lines]'),
  search: $('[data-search]'), count: $('[data-line-count]'), translationToggle: $('[data-translation-toggle]'),
  speechSearch: $('[data-speech-search]'), speechSearchResults: $('[data-speech-search-results]'), speechSearchClear: $('[data-speech-search-clear]'),
  accountName: $('[data-account-name]'), logout: $('[data-logout]'), albumToggle: $('[data-album-toggle]'), albumPages: $('[data-album-pages]'), albumAction: $('[data-album-action]')
};
let client, lesson, selected = -1, contextSelected = -1, selectedAddress = -1;
const cards = [];
const marks = new Set();
const markKey = (kind, index, idea = -1) => `${kind}:${index}:${idea}`;
const markArgs = (index, kind, idea, active) => {
  const current = tokenSession();
  return {
    p_slug: 'churchill-1949', p_line_index: index, p_kind: kind, p_idea_index: idea, p_active: active,
    p_account_token: current.role === 'admin' ? null : current.token,
    p_admin_token: current.role === 'admin' ? current.token : null
  };
};
function refreshMarks() {
  document.querySelectorAll('[data-bookmark-kind]').forEach(button => {
    const active = marks.has(markKey(button.dataset.bookmarkKind, Number(button.dataset.bookmarkLine), Number(button.dataset.bookmarkIdea || -1)));
    button.setAttribute('aria-pressed', String(active));
    button.textContent = active ? '已收藏' : '加入書籤';
  });
  cards.forEach((card, index) => card.classList.toggle('is-viewed', marks.has(markKey('view', index))));
}
function bookmarkButton(kind, index, idea = -1) {
  const button = node('button', 'bookmark-button', '加入書籤');
  button.type = 'button';
  button.dataset.bookmarkKind = kind;
  button.dataset.bookmarkLine = String(index);
  button.dataset.bookmarkIdea = String(idea);
  button.setAttribute('aria-label', `收藏第 ${index + 1} 句${kind === 'idea' ? `第 ${idea + 1} 項導讀` : ''}`);
  button.setAttribute('aria-pressed', 'false');
  return button;
}
async function saveMark(index, kind, idea, active) {
  const key = markKey(kind, index, idea);
  const before = marks.has(key);
  if (active) marks.add(key); else marks.delete(key);
  refreshMarks();
  try { await rpc('speech_curation_reader_mark', markArgs(index, kind, idea, active)); }
  catch (error) {
    if (before) marks.add(key); else marks.delete(key);
    refreshMarks();
    console.warn('Reader mark save failed', error);
    el.status.hidden = false;
    el.status.textContent = '書籤暫時未能儲存，請稍後再試。';
  }
}
function markViewed(index) {
  const key = markKey('view', index);
  if (marks.has(key)) return;
  marks.add(key); refreshMarks();
  void rpc('speech_curation_reader_mark', markArgs(index, 'view', -1, true)).catch(error => console.warn('Reader history save failed', error));
}

function node(tag, className, value) {
  const result = document.createElement(tag);
  if (className) result.className = className;
  if (value !== undefined) result.textContent = value;
  return result;
}
function setLoadProgress(percent, message) {
  const value = Math.max(0, Math.min(100, percent));
  el.status.hidden = false;
  el.status.textContent = message;
  el.loadFill.style.width = `${value}%`;
  el.loadProgress.setAttribute('aria-valuenow', String(value));
  el.loadPercent.textContent = `${value}%`;
}
function ownSession() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null'); }
  catch { return null; }
}
function tokenSession() {
  const own = ownSession();
  if (own?.token && (own.role === 'account' || own.role === 'admin')) return own;
  const shared = window.EdmundSystemNav?.getStudentSession?.();
  return shared?.role === 'student' && shared.token ? shared : null;
}
async function rpc(name, args) {
  if (!window.supabase?.createClient || !config.url || !config.anonKey) {
    throw new Error('登入服務暫時未能載入。');
  }
  if (!client) {
    let storage;
    try { storage = sessionStorage; } catch { storage = undefined; }
    client = window.supabase.createClient(config.url, config.anonKey, {
      auth: { persistSession: Boolean(storage), ...(storage ? { storage } : {}), autoRefreshToken: true, detectSessionInUrl: false }
    });
  }
  const current = await client.auth.getSession();
  if (current.error) throw current.error;
  if (!current.data?.session?.user?.id) {
    const signedIn = await client.auth.signInAnonymously();
    if (signedIn.error) throw signedIn.error;
  }
  const response = await client.rpc(name, args);
  if (response.error) throw response.error;
  return response.data;
}
function escapeLogin() { location.replace(LOGIN_URL); }

function renderContext(items) {
  el.context.replaceChildren();
  items.forEach((item, index) => {
    const button = node('button', 'context-cover');
    button.type = 'button'; button.dataset.context = String(index);
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', 'context-reading');
    const image = node('img', 'cover-image');
    image.src = `/speech-curation-assets/context-${CONTEXT_IMAGES[index] || 'history'}.jpg`;
    image.alt = ''; image.loading = 'lazy';
    button.append(image, node('span', 'cover-number', `CHAPTER ${String(index + 1).padStart(2, '0')}`), node('span', 'cover-title', item.title), node('span', 'cover-action', '打開導讀 ↗'));
    el.context.append(button);
  });
  el.contextReading.id = 'context-reading';
}
function splitIdeas(text) {
  return (text.match(/[^。！？]+[。！？]?/g) || [text]).map(part => part.trim()).filter(Boolean);
}
function highlightedClause(text, chapterIndex) {
  const span = node('span', 'idea-clause');
  const phrases = CONTEXT_HIGHLIGHTS[chapterIndex] || [];
  const matches = phrases.filter(phrase => text.includes(phrase)).sort((a, b) => b.length - a.length);
  if (!matches.length) { span.textContent = text; return span; }
  const pattern = new RegExp(matches.map(phrase => phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');
  let cursor = 0;
  for (const match of text.matchAll(pattern)) {
    const position = match.index;
    if (position > cursor) span.append(document.createTextNode(text.slice(cursor, position)));
    span.append(node('mark', 'pdf-highlight', match[0]));
    cursor = position + match[0].length;
  }
  if (cursor < text.length) span.append(document.createTextNode(text.slice(cursor)));
  return span;
}
function appendGroupedClauses(target, text, chapterIndex) {
  const clauses = [];
  let current = '', quoted = 0;
  for (const character of text) {
    if (character === '「') quoted++;
    if (character === '」') quoted = Math.max(0, quoted - 1);
    current += character;
    if ((character === '，' || character === ',') && !quoted) { clauses.push(current); current = ''; }
  }
  if (current) clauses.push(current);
  clauses.forEach((clause, index) => {
    target.append(highlightedClause(clause, chapterIndex));
    if (index < clauses.length - 1) target.append(document.createTextNode('\u200b'));
  });
}
function showContext(index) {
  if (index === contextSelected) {
    contextSelected = -1;
    el.contextReading.classList.remove('is-open');
    el.contextReading.hidden = true;
    el.context.querySelectorAll('[data-context]').forEach(button => button.setAttribute('aria-expanded', 'false'));
    return;
  }
  contextSelected = index;
  const item = lesson.introduction[index];
  el.context.querySelectorAll('[data-context]').forEach(button => button.setAttribute('aria-expanded', String(Number(button.dataset.context) === index)));
  const top = node('div', 'context-reading-top');
  const close = node('button', 'context-close', '收起導讀 ×'); close.type = 'button'; close.dataset.contextClose = '';
  top.append(node('p', 'eyebrow', `ARCHIVE NOTE ${String(index + 1).padStart(2, '0')}`), close);
  const ideas = node('div', 'context-ideas');
  splitIdeas(item.text).forEach((part, ideaIndex) => {
    const row = node('div', 'context-idea');
    const prose = node('p');
    appendGroupedClauses(prose, part, index);
    row.append(node('span', 'idea-number', String(ideaIndex + 1).padStart(2, '0')), prose);
    ideas.append(row);
  });
  el.contextReading.replaceChildren(top, node('h3', '', item.title), ideas);
  el.contextReading.hidden = false;
  requestAnimationFrame(() => {
    el.contextReading.classList.add('is-open');
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries, observed) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observed.unobserve(entry.target); }
        });
      }, { threshold: 0.12 });
      ideas.querySelectorAll('.context-idea').forEach(row => observer.observe(row));
    } else ideas.querySelectorAll('.context-idea').forEach(row => row.classList.add('is-visible'));
    el.contextReading.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}
function renderFullText(lines) {
  el.fullText.replaceChildren();
  const starts = [...PARAGRAPH_STARTS, lines.length];
  for (let i = 0; i < starts.length - 1; i++) {
    const paragraph = node('section', 'address-paragraph');
    const chapterIndex = CHAPTERS.findIndex(chapter => chapter.first === starts[i] + 1);
    if (chapterIndex >= 0) paragraph.id = `address-chapter-${chapterIndex + 1}`;
    const english = node('div', 'address-english');
    const pieces = lines.slice(starts[i], starts[i + 1]);
    pieces.forEach((line, position) => {
      const sentence = node('span', 'address-sentence', line.english.trim());
      sentence.dataset.addressLine = String(starts[i] + position);
      sentence.setAttribute('role', 'button');
      sentence.setAttribute('tabindex', '0');
      sentence.setAttribute('aria-expanded', 'false');
      sentence.setAttribute('aria-label', `開啟第 ${starts[i] + position + 1} 段語言導讀：${line.english}`);
      english.append(sentence);
      if (position < pieces.length - 1) english.append(document.createTextNode(' '));
    });
    const chinese = node('p', 'address-chinese', pieces.map(line => line.chinese.trim()).join(''));
    paragraph.append(english, chinese);
    el.fullText.append(paragraph);
  }
}
function updateReadingProgress() {
  const bounds = el.fullText.getBoundingClientRect();
  const start = window.scrollY + bounds.top - 120;
  const end = window.scrollY + bounds.bottom - window.innerHeight + 120;
  const amount = Math.max(0, Math.min(1, (window.scrollY - start) / Math.max(1, end - start)));
  const percent = Math.round(amount * 100);
  el.progressFill.style.width = `${percent}%`;
  el.progressValue.value = `${percent}%`;
  el.progressValue.textContent = `${percent}%`;
  $('[data-reading-progress]').classList.toggle('is-complete', percent === 100);
  updatePinnedSentence();
}
function updatePinnedSentence() {
  const trigger = selectedAddress < 0 ? null : el.fullText.querySelector(`[data-address-line="${selectedAddress}"]`);
  const insight = trigger?.nextElementSibling?.matches('.address-insight.is-open') ? trigger.nextElementSibling : null;
  const progress = $('[data-reading-progress]');
  const boundary = progress.getBoundingClientRect().bottom;
  const visible = Boolean(trigger && insight && trigger.getBoundingClientRect().bottom < boundary + 12 && insight.getBoundingClientRect().bottom > boundary + 24);
  el.pinnedSentence.classList.toggle('is-visible', visible);
  el.pinnedSentence.setAttribute('aria-hidden', String(!visible));
}
let progressFrame = 0;
function queueProgressUpdate() {
  if (progressFrame) return;
  progressFrame = requestAnimationFrame(() => { progressFrame = 0; updateReadingProgress(); });
}
function chapterFor(index) {
  let chapter = CHAPTERS[0];
  for (const candidate of CHAPTERS) if (index + 1 >= candidate.first) chapter = candidate;
  return chapter;
}
function renderChapters() {
  el.chapters.replaceChildren(node('p', 'nav-title', '段落導覽'));
  el.addressChapters.replaceChildren(node('p', 'nav-title', '段落導覽'));
  CHAPTERS.forEach((chapter, i) => {
    const link = node('a', '', '');
    link.href = `#chapter-${i + 1}`;
    link.append(node('span', 'nav-index', String(i + 1).padStart(2, '0')), node('span', '', chapter.short));
    el.chapters.append(link);
    const addressLink = link.cloneNode(true);
    addressLink.href = `#address-chapter-${i + 1}`;
    el.addressChapters.append(addressLink);
  });
}
function makeCard(line, index) {
  const card = node('article', 'line-card');
  card.dataset.index = String(index);
  const open = node('button', 'line-open');
  open.type = 'button'; open.dataset.open = String(index);
  open.setAttribute('aria-expanded', 'false');
  open.setAttribute('aria-controls', `line-body-${index}`);
  const meta = node('span', 'line-meta');
  meta.append(node('span', 'line-number', String(index + 1).padStart(3, '0')), node('span', 'viewed-badge', '已瀏覽'));
  open.append(meta, node('span', 'line-english', line.english), node('span', 'line-chevron', '+'));
  const translation = node('p', 'line-translation', line.chinese);
  const body = node('div', 'line-body'); body.id = `line-body-${index}`;
  body.append(node('div', 'line-body-inner'));
  const actions = node('div', 'line-bookmark-actions');
  actions.append(bookmarkButton('line', index));
  card.append(open, actions, translation, body);
  return card;
}
function renderLines(lines) {
  el.lines.replaceChildren(); cards.length = 0;
  let section;
  lines.forEach((line, index) => {
    const chapter = chapterFor(index);
    if (chapter.first === index + 1) {
      const chapterIndex = CHAPTERS.indexOf(chapter) + 1;
      section = node('section', 'chapter');
      section.id = `chapter-${chapterIndex}`;
      const heading = node('h3', 'chapter-heading', '');
      heading.append(node('span', '', String(chapterIndex).padStart(2, '0')), document.createTextNode(chapter.title));
      section.append(heading);
      el.lines.append(section);
    }
    const card = makeCard(line, index);
    cards.push(card);
    section.append(card);
  });
  el.count.textContent = `${lines.length} 句`;
}
function vocabularyRows(collocations) {
  return String(collocations || '').replace(/^Collocations 配詞:\s*/, '').split(/[；;]/).map(part => part.trim()).filter(Boolean).map(part => {
    const separator = part.indexOf('=');
    return separator < 0 ? [part, '—'] : [part.slice(0, separator).trim(), part.slice(separator + 1).trim()];
  });
}
function splitDescription(text) {
  const protectedText = text.replace(/\b(?:Mr|Mrs|Ms|Dr|Prof|St|Jr|Sr|e\.g|i\.e|a\.m|p\.m|U\.S)\./gi, match => match.replace(/\./g, '\uE000'));
  return protectedText.split(/(?<=。)\s*|(?<=[.!?])\s+(?=[A-Z\u3400-\u9fff])/u)
    .map(part => part.replace(/\uE000/g, '.').trim()).filter(Boolean);
}
function parseExamples(text) {
  const rows = [];
  const pattern = /([^（]+?)（([^）]+)）/g;
  for (const match of text.matchAll(pattern)) {
    const english = match[1].replace(/^\s*[/／]\s*/, '').trim();
    if (english) rows.push([english, match[2].trim()]);
  }
  return rows;
}
function buildNote(note, noteIndex, lineIndex) {
  const clean = String(note).replace(/^\d+\.\s*/, '').trim();
  const examplesAt = clean.search(/Examples?\s*:/i);
  const prose = examplesAt < 0 ? clean : clean.slice(0, examplesAt).trim();
  const exampleText = examplesAt < 0 ? '' : clean.slice(examplesAt).replace(/^Examples?\s*:\s*/i, '');
  const colon = prose.search(/[:：]/);
  let title = colon > 0 && colon < 105 ? prose.slice(0, colon).trim() : '';
  let description = title ? prose.slice(colon + 1).trim() : prose;
  // A trailing Chinese explanation after the bracket belongs in the body, not the heading.
  const titleWithProse = title.match(/^(.+?（[^）]+）)\s*(.+)$/u);
  if (titleWithProse) {
    title = titleWithProse[1];
    description = `${titleWithProse[2]}${/[。！？]$/u.test(titleWithProse[2]) ? '' : '。'}${description}`;
  }
  const block = node('section', 'note');
  const heading = node('div', 'note-heading');
  const titleNode = node('h5');
  const titleParts = (title || '語言觀察').match(/^(.*?)\s*（([^）]+)）$/u);
  if (titleParts) titleNode.append(node('span', 'note-title-en', titleParts[1]), node('span', 'note-title-zh', `（${titleParts[2]}）`));
  else titleNode.textContent = title || '語言觀察';
  heading.append(node('span', 'note-number', String(noteIndex + 1).padStart(2, '0')), titleNode, bookmarkButton('idea', lineIndex, noteIndex));
  block.append(heading);
  const detail = node('div', 'note-description');
  splitDescription(description).forEach(part => {
    const paragraph = node('p');
    const excerpt = part.match(/^([“"‘'])([^”"’']+)([”"’'])(.*)$/u);
    if (excerpt && /[A-Za-z]/.test(excerpt[2])) {
      paragraph.append(node('strong', 'note-excerpt', `${excerpt[1]}${excerpt[2]}${excerpt[3]}`));
      const repeated = excerpt[4].match(/^\s*([“"‘'])([^”"’']+)([”"’'])(.*)$/u);
      const remainder = repeated && repeated[2].trim() === excerpt[2].trim() ? repeated[4] : excerpt[4];
      paragraph.append(document.createTextNode(remainder));
    } else paragraph.textContent = part;
    detail.append(paragraph);
  });
  block.append(detail);
  const examples = parseExamples(exampleText);
  if (examples.length) {
    const table = node('table', 'examples-table');
    const header = node('thead'); const row = node('tr');
    row.append(node('th', '', 'English example'), node('th', '', '中文翻譯'));
    header.append(row); table.append(header);
    const body = node('tbody');
    examples.forEach(([english, chinese]) => {
      const exampleRow = node('tr');
      exampleRow.append(node('td', '', english), node('td', '', chinese));
      body.append(exampleRow);
    });
    table.append(body); block.append(table);
  } else if (exampleText.trim()) block.append(node('p', 'examples-fallback', exampleText.trim()));
  return block;
}
function buildCuratedContent(index) {
  const line = lesson.lines[index];
  const content = node('div', 'curated-content');
  const heading = node('div', 'curation-heading');
  heading.append(node('h4', 'curation-title', '語言與思想導讀'), bookmarkButton('line', index));
  content.append(heading);
  const notes = node('div', 'annotation-grid');
  (line.notes || []).forEach((note, noteIndex) => notes.append(buildNote(note, noteIndex, index)));
  content.append(notes);
  const rows = vocabularyRows(line.collocations);
  if (rows.length) {
    const section = node('section', 'vocabulary');
    section.append(node('h4', '', '主題詞彙與配詞'));
    const table = node('table');
    const header = node('thead'); const headerRow = node('tr');
    headerRow.append(node('th', '', '英文表達'), node('th', '', '中文意思'));
    header.append(headerRow); table.append(header);
    const tbody = node('tbody');
    rows.forEach(([term, meaning]) => { const row = node('tr'); row.append(node('td', '', term), node('td', '', meaning)); tbody.append(row); });
    table.append(tbody); section.append(table); content.append(section);
  }
  return content;
}
function fillLineBody(index) {
  const inner = cards[index].querySelector('.line-body-inner');
  if (inner.childElementCount) return;
  inner.append(buildCuratedContent(index));
}
function openLine(index, focus = false) {
  if (index < 0 || index >= lesson.lines.length) return;
  if (cards[index].hidden) { el.search.value = ''; filterLines(); }
  if (selected === index && !focus) {
    cards[index].classList.remove('is-open');
    cards[index].querySelector('.line-open').setAttribute('aria-expanded', 'false');
    selected = -1;
    return;
  }
  if (selected >= 0) {
    cards[selected].classList.remove('is-open');
    cards[selected].querySelector('.line-open').setAttribute('aria-expanded', 'false');
  }
  selected = index;
  markViewed(index);
  fillLineBody(index);
  refreshMarks();
  cards[index].classList.add('is-open');
  cards[index].querySelector('.line-open').setAttribute('aria-expanded', 'true');
  if (focus) cards[index].querySelector('.line-open').focus({ preventScroll: true });
  cards[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
  try { sessionStorage.setItem('edmund-speech-churchill-line', String(index)); } catch { /* Optional. */ }
}
function filterLines() {
  const query = el.search.value.trim().toLocaleLowerCase();
  let visible = 0;
  cards.forEach((card, index) => {
    const line = lesson.lines[index];
    const match = !query || `${line.english} ${line.chinese}`.toLocaleLowerCase().includes(query);
    card.hidden = !match;
    if (match) visible++;
  });
  el.lines.querySelectorAll('.chapter').forEach(section => {
    section.hidden = !Array.from(section.querySelectorAll('.line-card')).some(card => !card.hidden);
  });
  el.count.textContent = query ? `${visible} / ${cards.length} 句` : `${cards.length} 句`;
}
function openAddressLine(index) {
  const trigger = el.fullText.querySelector(`[data-address-line="${index}"]`);
  if (!trigger) return;
  if (selectedAddress >= 0) {
    const previous = el.fullText.querySelector(`[data-address-line="${selectedAddress}"]`);
    previous?.classList.remove('is-selected');
    previous?.setAttribute('aria-expanded', 'false');
    const previousInsight = previous?.nextElementSibling?.matches('.address-insight') ? previous.nextElementSibling : null;
    if (previousInsight) {
      previousInsight.classList.remove('is-open');
      previousInsight.addEventListener('transitionend', () => previousInsight.remove(), { once: true });
      setTimeout(() => previousInsight.remove(), 650);
    }
  }
  if (selectedAddress === index) { selectedAddress = -1; queueProgressUpdate(); return; }
  selectedAddress = index;
  el.pinnedText.textContent = trigger.textContent.trim();
  markViewed(index);
  trigger.classList.add('is-selected');
  trigger.setAttribute('aria-expanded', 'true');
  const insight = node('div', 'address-insight');
  const inner = node('div', 'address-insight-inner');
  inner.append(buildCuratedContent(index));
  insight.append(inner);
  trigger.after(insight);
  refreshMarks();
  // Commit the collapsed state before the next frame so the opening animates.
  void insight.offsetHeight;
  requestAnimationFrame(() => insight.classList.add('is-open'));
  queueProgressUpdate();
}

function searchSpeech() {
  const query = el.speechSearch.value.trim().toLocaleLowerCase();
  el.speechSearchResults.replaceChildren();
  el.speechSearchResults.hidden = !query;
  if (!query || !lesson) return;
  const matches = lesson.lines.map((line, index) => ({ line, index }))
    .filter(({ line }) => `${line.english} ${line.chinese} ${(line.notes || []).join(' ')}`.toLocaleLowerCase().includes(query));
  const heading = node('p', 'speech-search-count', matches.length ? `《The Council of Europe》找到 ${matches.length} 句相關內容` : '這篇演說沒有相符內容');
  el.speechSearchResults.append(heading);
  matches.slice(0, 12).forEach(({ line, index }) => {
    const button = node('button', 'speech-search-hit');
    button.type = 'button';
    button.dataset.searchLine = String(index);
    button.append(node('span', 'speech-search-hit-number', `第 ${index + 1} 句`), node('span', '', line.english));
    el.speechSearchResults.append(button);
  });
  if (matches.length > 12) el.speechSearchResults.append(node('p', 'speech-search-more', `另有 ${matches.length - 12} 句；縮小搜尋詞可查看。`));
}
el.speechSearch.addEventListener('input', searchSpeech);
el.speechSearchClear.addEventListener('click', () => { el.speechSearch.value = ''; searchSpeech(); el.speechSearch.focus(); });
el.speechSearchResults.addEventListener('click', event => {
  const hit = event.target.closest('[data-search-line]');
  if (!hit) return;
  const index = Number(hit.dataset.searchLine);
  openLine(index);
});

el.context.addEventListener('click', event => {
  const button = event.target.closest('[data-context]');
  if (button) showContext(Number(button.dataset.context));
});
el.contextReading.addEventListener('click', event => {
  if (event.target.closest('[data-context-close]') && contextSelected >= 0) showContext(contextSelected);
});
document.addEventListener('click', event => {
  const button = event.target.closest('[data-bookmark-kind]');
  if (!button || !lesson) return;
  event.preventDefault(); event.stopPropagation();
  const kind = button.dataset.bookmarkKind;
  const index = Number(button.dataset.bookmarkLine);
  const idea = Number(button.dataset.bookmarkIdea);
  void saveMark(index, kind, idea, !marks.has(markKey(kind, index, idea)));
});
el.lines.addEventListener('click', event => {
  const open = event.target.closest('[data-open]');
  if (open) openLine(Number(open.dataset.open));
});
el.fullText.addEventListener('click', event => {
  const sentence = event.target.closest('[data-address-line]');
  if (sentence) openAddressLine(Number(sentence.dataset.addressLine));
});
el.fullText.addEventListener('keydown', event => {
  const sentence = event.target.closest('[data-address-line]');
  if (sentence && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault(); openAddressLine(Number(sentence.dataset.addressLine));
  }
});
el.addressTranslation.addEventListener('click', () => {
  const visible = !el.fullText.classList.contains('address-translations-on');
  el.fullText.classList.toggle('address-translations-on', visible);
  el.addressTranslation.setAttribute('aria-pressed', String(visible));
  el.addressTranslation.textContent = visible ? '隱藏全文中譯' : '顯示全文中譯';
  queueProgressUpdate();
});
document.querySelectorAll('[data-font]').forEach(button => button.addEventListener('click', () => {
  const times = button.dataset.font === 'times';
  el.fullText.classList.toggle('font-times', times);
  el.fullText.classList.toggle('font-courier-bold', button.dataset.font === 'courier-bold');
  document.querySelectorAll('[data-font]').forEach(option => option.setAttribute('aria-pressed', String(option === button)));
  queueProgressUpdate();
}));
el.addressRules.addEventListener('click', () => {
  const on = !el.fullText.classList.contains('address-rules-on');
  el.fullText.classList.toggle('address-rules-on', on);
  el.addressRules.setAttribute('aria-pressed', String(on));
  el.addressRules.textContent = on ? '閱讀輔助線：開' : '閱讀輔助線：關';
});
el.addressNavToggle.addEventListener('click', () => {
  const open = !el.addressChapters.classList.contains('is-open');
  el.addressChapters.classList.toggle('is-open', open);
  el.addressNavToggle.setAttribute('aria-expanded', String(open));
  el.addressNavToggle.setAttribute('aria-label', open ? '關閉段落導覽' : '開啟段落導覽');
});
el.addressChapters.addEventListener('click', event => {
  if (event.target.closest('a')) {
    el.addressChapters.classList.remove('is-open');
    el.addressNavToggle.setAttribute('aria-expanded', 'false');
  }
});
el.translationToggle.addEventListener('click', () => {
  const visible = !el.lines.classList.contains('translations-on');
  el.lines.classList.toggle('translations-on', visible);
  el.translationToggle.setAttribute('aria-pressed', String(visible));
  el.translationToggle.textContent = visible ? '隱藏全部中譯' : '顯示全部中譯';
});
el.search.addEventListener('input', filterLines);
el.albumToggle.addEventListener('click', () => {
  const open = el.albumToggle.getAttribute('aria-expanded') !== 'true';
  el.albumToggle.setAttribute('aria-expanded', String(open));
  el.albumPages.inert = !open;
  el.albumPages.setAttribute('aria-hidden', String(!open));
  el.albumToggle.closest('.archive-gallery').classList.toggle('is-open', open);
  el.albumAction.textContent = open ? '收起歷史影像' : '向下揭開歷史影像';
});
document.addEventListener('keydown', event => {
  if (event.target instanceof HTMLInputElement || event.altKey || event.metaKey || event.ctrlKey) return;
  if (event.key === 'Escape' && selected >= 0) openLine(selected);
  if (selected >= 0 && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
    event.preventDefault(); openLine(selected + (event.key === 'ArrowDown' ? 1 : -1), true);
  }
});
el.logout.addEventListener('click', async () => {
  const current = tokenSession();
  try { sessionStorage.removeItem(SESSION_KEY); } catch { /* Optional storage. */ }
  window.EdmundSystemNav?.forgetStudentSession?.();
  if (current?.role === 'account' || current?.role === 'admin') {
    try { await rpc(current.role === 'admin' ? 'speech_curation_admin_logout' : 'speech_curation_account_logout', { p_token: current.token }); }
    catch { /* Local logout still applies. */ }
  }
  location.assign('/speech-curation.html');
});

async function start() {
  const current = tokenSession();
  if (!current) return escapeLogin();
  el.accountName.textContent = current.name || '';
  setLoadProgress(10, '正在連接演講資料庫…');
  try {
    const data = await rpc('speech_curation_lesson', {
      p_slug: 'churchill-1949',
      p_account_token: current.role === 'admin' ? null : current.token,
      p_admin_token: current.role === 'admin' ? current.token : null
    });
    if (!data?.lines?.length || !data?.introduction?.length) throw new Error('Lesson unavailable');
    setLoadProgress(48, '演說資料已載入，正在排版…');
    lesson = data;
    renderContext(data.introduction);
    renderFullText(data.lines);
    renderChapters();
    renderLines(data.lines);
    setLoadProgress(78, '逐句導讀已備妥，正在讀取書籤…');
    const readerState = await rpc('speech_curation_reader_state', {
      p_slug: 'churchill-1949',
      p_account_token: current.role === 'admin' ? null : current.token,
      p_admin_token: current.role === 'admin' ? current.token : null
    });
    setSpeechStudentNavigation(Boolean(readerState?.is_student));
    (readerState?.marks || []).forEach(mark => marks.add(markKey(mark.kind, mark.line_index, mark.idea_index)));
    refreshMarks();
    setLoadProgress(100, '演說已準備好。');
    if (current.role === 'admin') {
      const source = node('a', 'source-link', '英文原文來源 ↗');
      source.href = data.source_url || 'https://www.nationalchurchillmuseum.org/the-council-of-europe.html';
      source.target = '_blank'; source.rel = 'noopener noreferrer';
      $('.hero-actions').append(source);
    }
    el.loadingPanel.hidden = true;
    el.reader.hidden = false;
    const floatingToolbar = $('.address-floating-toolbar');
    const measureToolbar = () => el.fullSection.style.setProperty('--address-toolbar-height', `${Math.ceil(floatingToolbar.getBoundingClientRect().height)}px`);
    measureToolbar();
    if ('ResizeObserver' in window) new ResizeObserver(measureToolbar).observe(floatingToolbar);
    window.addEventListener('scroll', queueProgressUpdate, { passive: true });
    window.addEventListener('resize', queueProgressUpdate);
    queueProgressUpdate();
    const params = new URLSearchParams(location.search);
    const requestedLine = Number(params.get('line'));
    const requestedIdea = Number(params.get('idea'));
    if (Number.isInteger(requestedLine) && requestedLine >= 1 && requestedLine <= data.lines.length) {
      requestAnimationFrame(() => {
        openLine(requestedLine - 1);
        if (Number.isInteger(requestedIdea) && requestedIdea >= 1) {
          const target = cards[requestedLine - 1].querySelectorAll('.note')[requestedIdea - 1];
          target?.classList.add('is-deep-linked');
          target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    }
    let remembered = -1;
    try { remembered = Number(sessionStorage.getItem('edmund-speech-churchill-line')); } catch { /* Optional. */ }
    if (Number.isInteger(remembered) && remembered > 0 && remembered < data.lines.length) {
      const resume = node('button', 'resume-button', `繼續閱讀第 ${remembered + 1} 句 →`);
      resume.type = 'button';
      resume.addEventListener('click', () => openLine(remembered, true));
      $('.hero-actions').append(resume);
    }
  } catch (error) {
    console.warn('Speech lesson load failed', error);
    if (/Access denied/i.test(error?.message || '')) return escapeLogin();
    el.status.textContent = '演說暫時未能載入。請重新整理頁面再試。';
  }
}
void start();
