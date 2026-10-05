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
  status: $('[data-status]'), reader: $('[data-reader]'), context: $('[data-context]'),
  contextReading: $('[data-context-reading]'), fullText: $('[data-full-text]'), fullSection: $('#full-speech'),
  addressTranslation: $('[data-address-translation]'), progressFill: $('[data-progress-fill]'), progressValue: $('[data-progress-value]'),
  chapters: $('[data-chapters]'), lines: $('[data-lines]'),
  search: $('[data-search]'), count: $('[data-line-count]'), translationToggle: $('[data-translation-toggle]'),
  accountName: $('[data-account-name]'), logout: $('[data-logout]')
};
let client, lesson, selected = -1, contextSelected = -1, selectedAddress = -1;
const cards = [];

function node(tag, className, value) {
  const result = document.createElement(tag);
  if (className) result.className = className;
  if (value !== undefined) result.textContent = value;
  return result;
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
    const english = node('p', 'address-english');
    const pieces = lines.slice(starts[i], starts[i + 1]);
    pieces.forEach((line, position) => {
      const sentence = node('span', 'address-sentence', line.english.trim());
      sentence.dataset.addressLine = String(starts[i] + position);
      sentence.setAttribute('role', 'button');
      sentence.setAttribute('tabindex', '0');
      sentence.setAttribute('aria-label', `開啟第 ${starts[i] + position + 1} 段語言導讀：${line.english}`);
      english.append(sentence);
      if (position < pieces.length - 1) english.append(document.createTextNode(' '));
    });
    const chinese = node('p', 'address-chinese', pieces.map(line => line.chinese.trim()).join(''));
    const insight = node('div', 'address-insight'); insight.hidden = true;
    paragraph.append(english, chinese, insight);
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
  CHAPTERS.forEach((chapter, i) => {
    const link = node('a', '', '');
    link.href = `#chapter-${i + 1}`;
    link.append(node('span', 'nav-index', String(i + 1).padStart(2, '0')), node('span', '', chapter.short));
    el.chapters.append(link);
  });
}
function makeCard(line, index) {
  const card = node('article', 'line-card');
  card.dataset.index = String(index);
  const open = node('button', 'line-open');
  open.type = 'button'; open.dataset.open = String(index);
  open.setAttribute('aria-expanded', 'false');
  open.setAttribute('aria-controls', `line-body-${index}`);
  open.append(node('span', 'line-number', String(index + 1).padStart(3, '0')), node('span', 'line-english', line.english), node('span', 'line-chevron', '+'));
  const translation = node('p', 'line-translation', line.chinese);
  const body = node('div', 'line-body'); body.id = `line-body-${index}`;
  body.append(node('div', 'line-body-inner'));
  card.append(open, translation, body);
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
function buildNote(note, noteIndex) {
  const clean = String(note).replace(/^\d+\.\s*/, '').trim();
  const examplesAt = clean.search(/Examples?\s*:/i);
  const prose = examplesAt < 0 ? clean : clean.slice(0, examplesAt).trim();
  const exampleText = examplesAt < 0 ? '' : clean.slice(examplesAt).replace(/^Examples?\s*:\s*/i, '');
  const colon = prose.search(/[:：]/);
  const title = colon > 0 && colon < 105 ? prose.slice(0, colon).trim() : '';
  const description = title ? prose.slice(colon + 1).trim() : prose;
  const block = node('section', 'note');
  const heading = node('div', 'note-heading');
  heading.append(node('span', 'note-number', String(noteIndex + 1).padStart(2, '0')), node('h5', '', title || '語言觀察'));
  block.append(heading);
  const detail = node('div', 'note-description');
  splitDescription(description).forEach(part => detail.append(node('p', '', part)));
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
  content.append(node('h4', 'curation-title', '語言與思想導讀'));
  const notes = node('div', 'annotation-grid');
  (line.notes || []).forEach((note, noteIndex) => notes.append(buildNote(note, noteIndex)));
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
  fillLineBody(index);
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
    const previousInsight = previous?.closest('.address-paragraph')?.querySelector('.address-insight');
    if (previousInsight) { previousInsight.classList.remove('is-open'); previousInsight.hidden = true; }
  }
  if (selectedAddress === index) { selectedAddress = -1; return; }
  selectedAddress = index;
  trigger.classList.add('is-selected');
  const insight = trigger.closest('.address-paragraph').querySelector('.address-insight');
  insight.replaceChildren(buildCuratedContent(index));
  insight.hidden = false;
  requestAnimationFrame(() => insight.classList.add('is-open'));
  queueProgressUpdate();
}

el.context.addEventListener('click', event => {
  const button = event.target.closest('[data-context]');
  if (button) showContext(Number(button.dataset.context));
});
el.contextReading.addEventListener('click', event => {
  if (event.target.closest('[data-context-close]') && contextSelected >= 0) showContext(contextSelected);
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
  document.querySelectorAll('[data-font]').forEach(option => option.setAttribute('aria-pressed', String(option === button)));
  queueProgressUpdate();
}));
el.translationToggle.addEventListener('click', () => {
  const visible = !el.lines.classList.contains('translations-on');
  el.lines.classList.toggle('translations-on', visible);
  el.translationToggle.setAttribute('aria-pressed', String(visible));
  el.translationToggle.textContent = visible ? '隱藏全部中譯' : '顯示全部中譯';
});
el.search.addEventListener('input', filterLines);
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
  try {
    const data = await rpc('speech_curation_lesson', {
      p_slug: 'churchill-1949',
      p_account_token: current.role === 'admin' ? null : current.token,
      p_admin_token: current.role === 'admin' ? current.token : null
    });
    if (!data?.lines?.length || !data?.introduction?.length) throw new Error('Lesson unavailable');
    lesson = data;
    renderContext(data.introduction);
    renderFullText(data.lines);
    renderChapters();
    renderLines(data.lines);
    if (current.role === 'admin') {
      const source = node('a', 'source-link', '英文原文來源 ↗');
      source.href = data.source_url || 'https://www.nationalchurchillmuseum.org/the-council-of-europe.html';
      source.target = '_blank'; source.rel = 'noopener noreferrer';
      $('.hero-actions').append(source);
    }
    el.status.hidden = true;
    el.reader.hidden = false;
    window.addEventListener('scroll', queueProgressUpdate, { passive: true });
    window.addEventListener('resize', queueProgressUpdate);
    queueProgressUpdate();
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
