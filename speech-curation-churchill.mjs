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
const config = window.EDMUND_SUPABASE || {};
const el = {
  status: $('[data-status]'), reader: $('[data-reader]'), context: $('[data-context]'),
  contextReading: $('[data-context-reading]'), fullText: $('[data-full-text]'),
  chapters: $('[data-chapters]'), lines: $('[data-lines]'),
  search: $('[data-search]'), count: $('[data-line-count]'), translationToggle: $('[data-translation-toggle]'),
  accountName: $('[data-account-name]'), logout: $('[data-logout]')
};
let client, lesson, selected = -1, contextSelected = -1;
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
    row.append(node('span', 'idea-number', String(ideaIndex + 1).padStart(2, '0')), node('p', '', part));
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
    el.fullText.append(node('p', '', lines.slice(starts[i], starts[i + 1]).map(line => line.english.trim()).join(' ')));
  }
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
function fillLineBody(index) {
  const line = lesson.lines[index];
  const inner = cards[index].querySelector('.line-body-inner');
  if (inner.childElementCount) return;
  const intro = node('div', 'annotation-heading');
  intro.append(node('p', 'eyebrow', `LINE ${String(index + 1).padStart(3, '0')}`), node('h4', '', '語言與思想導讀'));
  const notes = node('div', 'annotation-grid');
  (line.notes || []).forEach((note, noteIndex) => {
    const block = node('div', 'note');
    block.append(node('span', 'note-number', String(noteIndex + 1).padStart(2, '0')), node('p', '', note.replace(/^\d+\.\s*/, '')));
    notes.append(block);
  });
  inner.append(intro, notes);
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
    table.append(tbody); section.append(table); inner.append(section);
  }
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
    el.status.hidden = true;
    el.reader.hidden = false;
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
