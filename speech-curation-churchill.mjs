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
const config = window.EDMUND_SUPABASE || {};
const el = {
  status: $('[data-status]'), reader: $('[data-reader]'), context: $('[data-context]'),
  chapters: $('[data-chapters]'), lines: $('[data-lines]'), detail: $('[data-detail]'),
  search: $('[data-search]'), count: $('[data-line-count]'),
  accountName: $('[data-account-name]'), logout: $('[data-logout]')
};
let client, lesson, selected = -1;
const translated = new Set();
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
    const card = node('details', 'context-card');
    const summary = node('summary', '', '');
    summary.append(node('span', 'context-number', String(index + 1).padStart(2, '0')), node('span', '', item.title), node('span', 'context-chevron', '＋'));
    card.append(summary, node('p', '', item.text));
    el.context.append(card);
  });
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
  const top = node('div', 'line-top');
  top.append(node('span', 'line-number', String(index + 1).padStart(3, '0')));
  const toggle = node('button', 'translation-toggle', '顯示中譯');
  toggle.type = 'button'; toggle.dataset.translate = String(index);
  toggle.setAttribute('aria-pressed', 'false');
  toggle.setAttribute('aria-controls', `translation-${index}`);
  top.append(toggle);
  const open = node('button', 'line-open', line.english);
  open.type = 'button'; open.dataset.open = String(index);
  open.setAttribute('aria-label', `第 ${index + 1} 句：${line.english}。開啟導讀`);
  const translation = node('p', 'inline-translation', line.chinese);
  translation.id = `translation-${index}`;
  translation.hidden = true;
  card.append(top, open, translation);
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
  el.count.textContent = `${lines.length} 句 · 點選查看導讀`;
}
function setTranslation(index, visible) {
  if (visible) translated.add(index); else translated.delete(index);
  const card = cards[index];
  card.querySelector('.inline-translation').hidden = !visible;
  const toggle = card.querySelector('.translation-toggle');
  toggle.textContent = visible ? '隱藏中譯' : '顯示中譯';
  toggle.setAttribute('aria-pressed', String(visible));
  if (selected === index) {
    const detailButton = el.detail.querySelector('[data-detail-translate]');
    if (detailButton) detailButton.textContent = visible ? '隱藏中譯' : '顯示中譯';
    const detailTranslation = el.detail.querySelector('.detail-translation');
    if (detailTranslation) detailTranslation.hidden = !visible;
  }
}
function renderDetail(index) {
  const line = lesson.lines[index];
  el.detail.replaceChildren();
  const top = node('div', 'detail-top');
  const eyebrow = node('p', 'eyebrow', `LINE ${String(index + 1).padStart(3, '0')} / ${lesson.lines.length}`);
  const close = node('button', 'detail-close', '關閉');
  close.type = 'button'; close.dataset.close = '';
  top.append(eyebrow, close);
  const heading = node('h3', '', line.english);
  const translationButton = node('button', 'detail-translate', translated.has(index) ? '隱藏中譯' : '顯示中譯');
  translationButton.type = 'button'; translationButton.dataset.detailTranslate = '';
  const translation = node('p', 'detail-translation', line.chinese);
  translation.hidden = !translated.has(index);
  const label = node('h4', '', '語言與思想導讀');
  const notes = node('div', 'detail-notes');
  line.notes.forEach((note, noteIndex) => {
    const block = node('div', 'note');
    block.append(node('span', 'note-number', String(noteIndex + 1).padStart(2, '0')), node('p', '', note.replace(/^\d+\.\s*/, '')));
    notes.append(block);
  });
  const collocations = node('div', 'collocations', '');
  collocations.append(node('h4', '', '配詞 · Collocations'), node('p', '', line.collocations.replace(/^Collocations 配詞:\s*/, '')));
  const nav = node('div', 'detail-navigation');
  for (const [delta, label] of [[-1, '← 上一句'], [1, '下一句 →']]) {
    const button = node('button', '', label);
    button.type = 'button'; button.dataset.step = String(delta);
    button.disabled = index + delta < 0 || index + delta >= lesson.lines.length;
    nav.append(button);
  }
  el.detail.append(top, heading, translationButton, translation, label, notes, collocations, nav);
  el.detail.classList.add('is-open');
}
function openLine(index, focus = false) {
  if (index < 0 || index >= lesson.lines.length) return;
  if (cards[index].hidden) { el.search.value = ''; filterLines(); }
  if (selected >= 0) cards[selected].classList.remove('is-selected');
  selected = index;
  cards[index].classList.add('is-selected');
  renderDetail(index);
  if (focus) cards[index].querySelector('.line-open').focus({ preventScroll: true });
  cards[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
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
  el.count.textContent = query ? `${visible} / ${cards.length} 句` : `${cards.length} 句 · 點選查看導讀`;
}

el.lines.addEventListener('click', event => {
  const toggle = event.target.closest('[data-translate]');
  if (toggle) return setTranslation(Number(toggle.dataset.translate), !translated.has(Number(toggle.dataset.translate)));
  const open = event.target.closest('[data-open]');
  if (open) openLine(Number(open.dataset.open));
});
el.detail.addEventListener('click', event => {
  if (event.target.closest('[data-detail-translate]') && selected >= 0) setTranslation(selected, !translated.has(selected));
  const step = event.target.closest('[data-step]');
  if (step && selected >= 0) openLine(selected + Number(step.dataset.step), true);
  if (event.target.closest('[data-close]')) el.detail.classList.remove('is-open');
});
el.search.addEventListener('input', filterLines);
document.addEventListener('keydown', event => {
  if (event.target instanceof HTMLInputElement || event.altKey || event.metaKey || event.ctrlKey) return;
  if (event.key === 'Escape') el.detail.classList.remove('is-open');
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
    renderChapters();
    renderLines(data.lines);
    el.status.hidden = true;
    el.reader.hidden = false;
    const remembered = Number(sessionStorage.getItem('edmund-speech-churchill-line'));
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
