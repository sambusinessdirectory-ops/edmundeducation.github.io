const $ = (selector, root = document) => root.querySelector(selector);
const app = $('#app');
const config = window.EDMUND_SUPABASE || {};
const client = window.supabase?.createClient?.(config.url, config.anonKey, {
  auth: { persistSession: true, storage: sessionStorage, autoRefreshToken: true, detectSessionInUrl: false }
});
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const arrowIcon = '<svg class="arrow-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 19 19 5M8 5h11v11"/></svg>';
const adminStorageKey = 'edmund-news-discussion-admin-v1';
const studentStorageKey = 'edmund-news-discussion-student-v1';
const state = { role: null, name: '', token: '', cards: [], article: null, progress: {}, view: 'home', question: null, argument: null, pick: null, images: new Map(), structureOpen: false, structurePosition: null };
let loginMode = 'student';
let busy = false;
let toastTimer;

async function rpc(name, args = {}) {
  if (!client) throw new Error('登入服務暫時無法載入，請重新整理頁面。');
  const session = await client.auth.getSession();
  if (session.error) throw session.error;
  if (!session.data.session?.user?.id) {
    const result = await client.auth.signInAnonymously();
    if (result.error) throw result.error;
  }
  const { data, error } = await client.rpc(name, args);
  if (error) throw error;
  return data;
}

function tokens() {
  return { p_student_token: state.role === 'student' ? state.token : null, p_admin_token: state.role === 'admin' ? state.token : null };
}

function toast(message, isError = false) {
  const node = $('#toast');
  node.textContent = message;
  node.classList.toggle('is-error', isError);
  node.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { node.hidden = true; }, 4500);
}

function setAccount(role, name, token) {
  state.role = role;
  state.name = name;
  state.token = token;
  $('#account-name').textContent = `${name} · ${role === 'admin' ? '管理員' : '學生'}`;
  $('#account-name').hidden = false;
  $('#logout').hidden = false;
  $('#login-view').hidden = true;
  $('#app-view').hidden = false;
  sessionStorage.setItem(role === 'admin' ? adminStorageKey : studentStorageKey, JSON.stringify({ name, token }));
  if (role === 'student') window.EdmundSystemNav?.rememberStudentSession?.({ token, name, role: 'student' });
}

function setLoginMode(mode) {
  loginMode = mode;
  $('#student-tab').setAttribute('aria-selected', String(mode === 'student'));
  $('#admin-tab').setAttribute('aria-selected', String(mode === 'admin'));
  $('#login-title').textContent = mode === 'admin' ? '登入管理員帳戶' : '登入學生帳戶';
  $('#login-status').textContent = '';
}

async function login(event) {
  event.preventDefault();
  if (busy) return;
  const form = new FormData(event.currentTarget);
  const username = String(form.get('username') || '').trim();
  const password = String(form.get('password') || '');
  const status = $('#login-status');
  if (!username || !password) { status.textContent = '請輸入用戶名稱和密碼。'; return; }
  busy = true;
  $('button[type=submit]', event.currentTarget).disabled = true;
  status.textContent = '正在核對帳戶…';
  try {
    if (loginMode === 'admin') {
      const result = await rpc('news_discussion_admin_login', { p_name: username, p_password: password });
      if (!result?.token || !result?.name) throw new Error('用戶名稱或密碼不正確。');
      setAccount('admin', result.name, result.token);
    } else {
      const rows = await rpc('flashcard_student_login', { p_name: username, p_password: password });
      const token = Array.isArray(rows) ? rows[0]?.session_token : null;
      if (!token) throw new Error('用戶名稱或密碼不正確。');
      const profile = await rpc('flashcard_student_session_profile', { p_token: token });
      const student = Array.isArray(profile) ? profile[0] : null;
      if (!student?.id) throw new Error('學生登入已失效，請重試。');
      setAccount('student', student.name, token);
      window.EdmundSystemNav?.rememberStudentSession?.({ token, id: student.id, name: student.name, role: 'student' });
    }
    $('#login-form').reset();
    await loadCards();
  } catch (error) {
    status.textContent = error.message || '登入暫時失敗，請稍後再試。';
  } finally {
    busy = false;
    $('button[type=submit]', event.currentTarget).disabled = false;
  }
}

async function restore() {
  try {
    const admin = JSON.parse(sessionStorage.getItem(adminStorageKey) || 'null');
    if (admin?.token) {
      const name = await rpc('news_discussion_admin_me', { p_admin_token: admin.token });
      if (name) { setAccount('admin', name, admin.token); await loadCards(); return; }
    }
    sessionStorage.removeItem(adminStorageKey);
    const own = JSON.parse(sessionStorage.getItem(studentStorageKey) || 'null');
    const universal = window.EdmundSystemNav?.getStudentSession?.();
    const candidate = universal?.role === 'student' ? universal : own;
    if (candidate?.token) {
      const rows = await rpc('flashcard_student_session_profile', { p_token: candidate.token });
      const student = Array.isArray(rows) ? rows[0] : null;
      if (student?.id) { setAccount('student', student.name, candidate.token); await loadCards(); return; }
    }
    sessionStorage.removeItem(studentStorageKey);
  } catch (error) {
    toast('暫時未能恢復登入；請重新登入。', true);
  }
}

async function logout() {
  if (state.role === 'admin') {
    try { await rpc('news_discussion_admin_logout', { p_admin_token: state.token }); } catch { /* Expiry also revokes access. */ }
    sessionStorage.removeItem(adminStorageKey);
  } else {
    sessionStorage.removeItem(studentStorageKey);
    window.EdmundSystemNav?.forgetStudentSession?.();
  }
  state.role = null; state.name = ''; state.token = ''; state.article = null; state.progress = {}; state.cards = []; state.pick = null; state.images.clear();
  $('#account-name').hidden = true; $('#logout').hidden = true;
  $('#app-view').hidden = true; $('#login-view').hidden = false;
  app.replaceChildren();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function loadCards() {
  app.innerHTML = '<div class="loading" role="status"><span></span>正在整理新聞…</div>';
  try {
    state.cards = await rpc('news_discussion_list', tokens());
    state.view = 'home';
    renderHome();
  } catch (error) {
    app.innerHTML = `<div class="error-card" role="alert">無法讀取新聞：${esc(error.message)} <button type="button" data-retry>重試</button></div>`;
  }
}

async function imageFor(id) {
  if (state.images.has(id)) return state.images.get(id);
  const image = await rpc('news_discussion_image', { p_article_id: id, ...tokens() });
  state.images.set(id, image);
  return image;
}

function hydrateImages() {
  app.querySelectorAll('img[data-image-id]').forEach(async img => {
    const id = img.dataset.imageId;
    try { const src = await imageFor(id); if (img.isConnected && src) img.src = src; }
    catch { if (img.isConnected) img.alt = '圖片暫時未能載入'; }
  });
}

function renderHome() {
  state.view = 'home'; state.article = null; state.structureOpen = false; state.pick = null;
  const admin = state.role === 'admin';
  app.innerHTML = `<div class="section-head"><div><span class="eyebrow">THE NEWS ROOM · 75</span><h1>熱議新聞討論</h1><p>選一則新聞，從事實出發比較正反立場，再收藏值得重用的論點與語句。</p></div><button class="outline-button" type="button" data-bookmarks>☆ 我的書籤</button></div>
    ${admin ? `<form id="create-card" class="admin-create"><label>新增新聞卡<input name="title" required maxlength="160" placeholder="輸入新聞標題"></label><button class="primary-button" type="submit">＋ 建立卡片</button></form>` : ''}
    <div class="news-grid">${state.cards.map((card, index) => `<article class="news-card ${card.hidden ? 'is-hidden' : ''}"><button type="button" class="news-card__open" data-open="${esc(card.id)}"><span class="news-card__image">${card.has_image ? `<img data-image-id="${esc(card.id)}" alt="${esc(card.title)}" loading="lazy">` : '<span class="news-card__placeholder" aria-hidden="true"><b>EDMUND</b><em>NEWS ARCHIVE</em><i>✦</i></span>'}</span><span class="news-card__body"><small>NEWS ${String(index + 1).padStart(2, '0')}${card.hidden ? ' · 已隱藏' : ''}</small><strong>${esc(card.title)}</strong><span>${esc(card.brief || '點擊進入，查看新聞摘要、論點與討論句式。')}</span><span class="news-card__foot">${card.question_count} 個討論問題 <b aria-hidden="true">${arrowIcon}</b></span></span></button>${admin ? `<div class="admin-card-tools"><label class="upload-button">上載圖片<input type="file" data-upload="${esc(card.id)}" accept="image/png,image/jpeg,image/webp" hidden></label><form data-url-form="${esc(card.id)}"><input type="url" name="url" placeholder="新聞原文 URL" value="${esc(card.source_url || '')}" aria-label="新聞原文 URL"><button type="submit">儲存連結</button></form><div><button type="button" data-hide="${esc(card.id)}">${card.hidden ? '重新顯示' : '隱藏'}</button><button type="button" class="danger" data-remove="${esc(card.id)}">移除</button></div></div>` : ''}</article>`).join('')}</div>${state.cards.length ? '' : '<div class="empty-state">目前沒有可閱讀的新聞。</div>'}`;
  hydrateImages();
}

function itemState(id) { return state.progress[id] || { checked: false, bookmarked: false }; }
function itemTools(id, label = '') {
  const record = itemState(id);
  return `<span class="item-tools"><label class="check-tool" title="標記已學習"><input type="checkbox" data-check="${esc(id)}" ${record.checked ? 'checked' : ''} aria-label="標記已學習：${esc(label)}"><span aria-hidden="true"></span></label><button class="star-tool ${record.bookmarked ? 'is-on' : ''}" type="button" data-star="${esc(id)}" aria-label="${record.bookmarked ? '移除書籤' : '加入書籤'}：${esc(label)}" aria-pressed="${record.bookmarked}">${record.bookmarked ? '★' : '☆'}</button></span>`;
}

function question() { return state.article?.content?.questions?.find(item => item.id === state.question); }
function glossaryMarkup(argument, prefix = '') {
  return `<div class="argument-detail"><p>${esc(argument.description)}</p><h4>Glossary · 關鍵詞彙</h4><ul class="glossary">${(argument.glossary || []).map(entry => `<li id="${esc(prefix + entry.id)}"><div class="glossary-copy"><strong>${esc(entry.english)}</strong><span>${esc(entry.chinese)}</span></div>${itemTools(entry.id, entry.english)}</li>`).join('')}</ul></div>`;
}

function renderArgument(argument, side, picker = null) {
  const open = state.argument === argument.id;
  const picked = picker !== null && state.pick?.selected[picker]?.has(argument.id);
  return `<article class="argument ${open ? 'is-open' : ''} ${picked ? 'is-picked' : ''}" id="${esc(argument.id)}"><div class="argument-head"><button type="button" data-argument="${esc(argument.id)}" aria-expanded="${open}"><small>${String(argument.number).padStart(2, '0')} · ${esc(argument.angle)}</small><strong>${esc(argument.title)}</strong><span class="disclosure">${open ? '−' : '+'}</span></button>${picker !== null ? `<button class="pick-toggle ${picked ? 'is-picked' : ''}" type="button" data-pick-id="${esc(argument.id)}" aria-pressed="${Boolean(picked)}" aria-label="${picked ? '取消選取' : '選取'}：${esc(argument.title)}">${picked ? '✓ 已選' : '＋ 選取'}</button>` : ''}${itemTools(argument.id, argument.title)}</div>${open ? glossaryMarkup(argument) : ''}</article>`;
}

function renderPickedArgument(argument, index) {
  const collapsed = state.pick.collapsed[index].has(argument.id);
  return `<article class="argument picked-argument ${collapsed ? 'is-collapsed' : ''}" id="picker-${index + 1}-${esc(argument.id)}"><div class="picked-argument__head"><button type="button" data-collapse-pick="${esc(argument.id)}" data-picker="${index}" aria-expanded="${!collapsed}" aria-label="${collapsed ? '展開' : '收起'}：${esc(argument.title)}"><small>${String(argument.number).padStart(2, '0')} · ${esc(argument.angle)}</small><strong>${esc(argument.title)}</strong><span aria-hidden="true">${collapsed ? '+' : '−'}</span></button>${itemTools(argument.id, argument.title)}</div>${collapsed ? '' : glossaryMarkup(argument, `picker-${index + 1}-`)}</article>`;
}

function pickCounts(index) {
  const q = question();
  const selected = state.pick.selected[index];
  return { for: (q?.for || []).filter(a => selected.has(a.id)).length, against: (q?.against || []).filter(a => selected.has(a.id)).length };
}

function renderPickPage(preserveScroll = false) {
  const q = question();
  if (!q || !state.pick) return;
  const priorScroll = window.scrollY;
  const index = state.pick.phase - 1;
  const counts = pickCounts(index);
  state.view = 'pick';
  app.innerHTML = `<div class="pick-page"><div class="pick-intro"><span class="eyebrow">PICK MODE · ${state.pick.phase} / 3</span><h1>選論點 · Picker ${state.pick.phase}</h1><p>${esc(q.text)}</p><p class="pick-instruction">從正方及反方挑選想討論的論點。按論點可查看簡述和詞彙；勾選與書籤仍會儲存於您的帳戶。</p></div><div class="argument-grid pick-grid"><section class="side side--for"><header><span>FOR · 正方</span><h3>${esc(q.for_label)}</h3><small>已選 ${counts.for} / ${q.for?.length || 0}</small></header><div>${(q.for || []).map(a => renderArgument(a, 'for', index)).join('')}</div></section><section class="side side--against"><header><span>AGAINST · 反方</span><h3>${esc(q.against_label)}</h3><small>已選 ${counts.against} / ${q.against?.length || 0}</small></header><div>${(q.against || []).map(a => renderArgument(a, 'against', index)).join('')}</div></section></div></div><div class="pick-bottom-bar" role="navigation" aria-label="選論點步驟"><div><strong>Picker ${state.pick.phase}</strong><span>正方 ${counts.for} · 反方 ${counts.against}</span></div><div class="pick-bottom-bar__actions"><button type="button" class="outline-button" data-structures>句式表</button><button type="button" class="outline-button" data-pick-back>${state.pick.phase === 1 ? '退出選取' : '返回 Picker 1'}</button><button type="button" class="primary-button" data-pick-next ${counts.for + counts.against ? '' : 'disabled'}>${state.pick.phase === 1 ? '下一頁 · Picker 2 →' : '查看雙人比較 →'}</button></div></div>${renderStructures()}`;
  if (preserveScroll) window.scrollTo({ top: priorScroll, behavior: 'instant' });
  else window.scrollTo({ top: 0, behavior: 'instant' });
}

function renderComparison(preserveScroll = false) {
  const q = question();
  if (!q || !state.pick) return;
  const priorScroll = window.scrollY;
  state.view = 'comparison';
  const column = index => {
    const selected = state.pick.selected[index];
    const side = (key, label) => {
      const args = (q[key] || []).filter(a => selected.has(a.id));
      return `<section class="side side--${key}"><header><span>${key === 'for' ? 'FOR · 正方' : 'AGAINST · 反方'}</span><h3>${esc(label)}</h3><small>${args.length} 個已選論點</small></header><div>${args.map(a => renderPickedArgument(a, index)).join('') || '<p class="pick-empty">沒有選取此方論點。</p>'}</div></section>`;
    };
    const againstFirst = state.pick.order[index] === 'against';
    return `<section class="comparison-picker"><div class="comparison-picker__title"><h2>Picker ${index + 1}</h2><div class="side-order" role="group" aria-label="Picker ${index + 1} 論點順序"><button type="button" data-pick-order="for" data-picker="${index}" aria-pressed="${!againstFirst}">正方先</button><button type="button" data-pick-order="against" data-picker="${index}" aria-pressed="${againstFirst}">反方先</button></div></div>${againstFirst ? side('against', q.against_label) + side('for', q.for_label) : side('for', q.for_label) + side('against', q.against_label)}</section>`;
  };
  app.innerHTML = `<div class="comparison-page"><div class="pick-top-bar" role="navigation" aria-label="結束選論點練習"><div><span class="eyebrow">PICK MODE · 3 / 3</span><strong>雙人論點比較</strong></div><button type="button" class="outline-button" data-structures>句式表</button><button type="button" class="outline-button" data-pick-back>← 返回選取</button><button type="button" class="primary-button" data-pick-end>結束練習</button></div><div class="comparison-intro"><h1>雙人論點比較</h1><p>${esc(q.text)}</p></div><div class="comparison-grid">${column(0)}${column(1)}</div></div>${renderStructures()}`;
  window.scrollTo({ top: preserveScroll ? priorScroll : 0, behavior: 'instant' });
}

function startPickMode() {
  if (!state.question) state.question = state.article?.content?.questions?.[0]?.id || null;
  if (!question()) return;
  state.pick = { phase: 1, selected: [new Set(), new Set()], collapsed: [new Set(), new Set()], order: ['for', 'for'] };
  state.argument = null;
  state.structureOpen = false;
  renderPickPage();
}

function endPickMode() {
  state.pick = null;
  state.argument = null;
  renderArticle(true);
}

function renderQuestion() {
  const q = question();
  if (!q) return '';
  return `<section class="question-panel"><div class="question-panel__top"><div><span class="eyebrow">DISCUSSION DESK</span><h2>${esc(q.text)}</h2><p>選擇一個論點，展開簡述及詞彙；展開內容不會自動勾選；請自行勾選已學習的項目，或按星號收藏。</p></div><button class="structure-launch" type="button" data-structures>句式表 <span>${arrowIcon}</span></button></div><div class="argument-grid"><section class="side side--for"><header><span>FOR · 正方</span><h3>${esc(q.for_label)}</h3><small>${q.for?.length || 0} 個論點</small></header><div>${(q.for || []).map(a => renderArgument(a, 'for')).join('')}</div></section><section class="side side--against"><header><span>AGAINST · 反方</span><h3>${esc(q.against_label)}</h3><small>${q.against?.length || 0} 個論點</small></header><div>${(q.against || []).map(a => renderArgument(a, 'against')).join('')}</div></section></div></section>`;
}

function renderStructures() {
  const q = question();
  if (!q || !state.structureOpen) return '';
  const style = state.structurePosition ? `style="left:${state.structurePosition.x}px;top:${state.structurePosition.y}px"` : '';
  return `<aside class="structure-float" id="structure-float" ${style} aria-label="討論句式浮動視窗"><div class="structure-handle" data-drag-handle><div><span class="eyebrow">SENTENCE STRUCTURE</span><h3>討論句式 · ${q.structures?.length || 0}</h3></div><button type="button" data-close-structures aria-label="關閉句式表">×</button></div><div class="structure-content">${(q.structures || []).map(item => `<div class="structure-row" id="${esc(item.id)}"><div class="structure-row__copy"><small>${String(item.number).padStart(2, '0')}</small><strong lang="en">${esc(item.english)}</strong><span>${esc(item.purpose)}</span></div>${itemTools(item.id, item.english)}</div>`).join('')}</div><div class="resize-note">拖動上方標題列移動 · 拖動右下角調整大小</div></aside>`;
}

function renderArticle(scroll = false) {
  const article = state.article;
  if (!article) return;
  state.view = 'article';
  const priorScroll = window.scrollY;
  const hasQ = Boolean(question());
  app.innerHTML = `<div class="article-top"><button type="button" class="back-button" data-home>← 返回新聞</button><div class="article-top__actions">${(article.content?.questions || []).length ? `<button type="button" class="primary-button" data-start-pick>Pick Mode · 選論點</button>` : ''}<button type="button" class="outline-button" data-bookmarks>☆ 我的書籤</button></div></div><article class="article-shell"><div class="article-hero"><div class="article-hero__text"><span class="eyebrow">NEWS DISCUSSION · ${esc(article.created_at?.slice(0,10) || '')}</span><h1>${esc(article.title)}</h1><span class="source-chip">原文與討論素材</span></div>${article.has_image ? `<img data-image-id="${esc(article.id)}" alt="${esc(article.title)}">` : ''}</div><div class="source-row"><strong>新聞原文</strong>${article.source_url ? `<a href="${esc(article.source_url)}" target="_blank" rel="noopener noreferrer">${esc(article.source_url)} <span aria-hidden="true">${arrowIcon}</span></a>` : '<span>原文連結稍後補上</span>'}</div><section class="brief"><span class="eyebrow">BRIEF NEWS CONTENT · 新聞摘要</span><p>${esc(article.brief || '新聞摘要稍後補上。')}</p></section><section class="questions"><div class="section-title"><span class="eyebrow">DISCUSSION QUESTIONS</span><h2>討論問題</h2></div>${(article.content?.questions || []).length ? article.content.questions.map((q, index) => `<button class="question-button ${state.question === q.id ? 'is-active' : ''}" type="button" data-question="${esc(q.id)}" aria-expanded="${state.question === q.id}"><span>${String(index + 1).padStart(2, '0')}</span><strong>${esc(q.text)}</strong><span aria-hidden="true">${state.question === q.id ? '−' : '+'}</span></button>`).join('') : '<p class="empty-state">這則新聞的討論內容稍後加入。</p>'}</section>${hasQ ? renderQuestion() : ''}</article>${renderStructures()}`;
  hydrateImages();
  if (scroll) $('.questions')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  else window.scrollTo({ top: priorScroll, behavior: 'auto' });
}

async function openArticle(id) {
  app.innerHTML = '<div class="loading" role="status"><span></span>正在載入討論內容…</div>';
  try {
    const [article, progress] = await Promise.all([
      rpc('news_discussion_get', { p_article_id: id, ...tokens() }),
      rpc('news_discussion_state', { p_article_id: id, ...tokens() })
    ]);
    state.article = article; state.progress = progress || {}; state.question = null; state.argument = null; state.pick = null; state.structureOpen = false; state.structurePosition = null;
    renderArticle();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (error) { toast(`無法開啟新聞：${error.message}`, true); await loadCards(); }
}

async function saveItem(id, patch) {
  const previous = itemState(id);
  const next = { ...previous, ...patch };
  state.progress[id] = next;
  app.querySelectorAll(`[data-check="${CSS.escape(id)}"]`).forEach(input => { input.checked = next.checked; });
  app.querySelectorAll(`[data-star="${CSS.escape(id)}"]`).forEach(button => { button.textContent = next.bookmarked ? '★' : '☆'; button.classList.toggle('is-on', next.bookmarked); button.setAttribute('aria-pressed', String(next.bookmarked)); });
  try {
    await rpc('news_discussion_save_state', { p_article_id: state.article.id, p_item_id: id, p_checked: next.checked, p_bookmarked: next.bookmarked, ...tokens() });
  } catch (error) {
    state.progress[id] = previous;
    app.querySelectorAll(`[data-check="${CSS.escape(id)}"]`).forEach(input => { input.checked = previous.checked; });
    app.querySelectorAll(`[data-star="${CSS.escape(id)}"]`).forEach(button => { button.textContent = previous.bookmarked ? '★' : '☆'; button.classList.toggle('is-on', previous.bookmarked); });
    toast('未能儲存，請稍後重試。', true);
  }
}

function labelForItem(article, id) {
  for (const q of article.content?.questions || []) {
    if (id === `q:${q.id}`) return { title: q.text, type: '討論問題' };
    const structure = q.structures?.find(item => item.id === id);
    if (structure) return { title: structure.english, type: '句式' };
    for (const side of ['for','against']) for (const argument of q[side] || []) {
      if (argument.id === id) return { title: argument.title, type: side === 'for' ? '正方論點' : '反方論點' };
      const term = argument.glossary?.find(item => item.id === id);
      if (term) return { title: `${term.english} · ${term.chinese}`, type: '詞彙' };
    }
  }
  return { title: id, type: '書籤' };
}

function locationForItem(article, id) {
  for (const q of article?.content?.questions || []) {
    if (id === `q:${q.id}`) return { question: q.id };
    if (q.structures?.some(item => item.id === id)) return { question: q.id, structure: true };
    for (const side of ['for', 'against']) for (const argument of q[side] || []) {
      if (argument.id === id) return { question: q.id, argument: argument.id };
      if (argument.glossary?.some(item => item.id === id)) return { question: q.id, argument: argument.id };
    }
  }
  return null;
}

async function showBookmarks() {
  app.innerHTML = '<div class="loading" role="status"><span></span>正在整理您的書籤…</div>';
  try {
    const entries = await Promise.all(state.cards.filter(card => !card.hidden || state.role === 'admin').map(async card => {
      const progress = await rpc('news_discussion_state', { p_article_id: card.id, ...tokens() });
      const ids = Object.keys(progress || {}).filter(id => progress[id]?.bookmarked);
      if (!ids.length) return [];
      const article = await rpc('news_discussion_get', { p_article_id: card.id, ...tokens() });
      return ids.map(id => ({ card, id, ...labelForItem(article, id) }));
    }));
    state.view = 'bookmarks';
    app.innerHTML = `<div class="article-top"><button type="button" class="back-button" data-home>← 返回新聞</button></div><div class="bookmark-page"><span class="eyebrow">PERSONAL RECORD</span><h1>我的書籤</h1><p>各新聞中收藏的論點、詞彙和句式。</p><div class="bookmark-list">${entries.flat().map(item => `<button type="button" data-bookmark-open="${esc(item.card.id)}" data-bookmark-item="${esc(item.id)}"><small>${esc(item.card.title)} · ${esc(item.type)}</small><strong>${esc(item.title)}</strong><span>查看 ${arrowIcon}</span></button>`).join('') || '<div class="empty-state">尚未加入書籤。閱讀新聞時按 ☆ 即可收藏。</div>'}</div></div>`;
  } catch (error) { toast(`無法讀取書籤：${error.message}`, true); renderHome(); }
}

async function adminAction(name, args, success) {
  if (busy) return;
  busy = true;
  try { await rpc(name, { p_admin_token: state.token, ...args }); toast(success); await loadCards(); }
  catch (error) { toast(error.message || '儲存失敗', true); }
  finally { busy = false; }
}

async function preparedImage(file) {
  if (!file.type.startsWith('image/')) throw new Error('請選擇圖片檔案。');
  let image;
  let release = () => {};
  if (typeof createImageBitmap === 'function') {
    image = await createImageBitmap(file);
    release = () => image.close?.();
  } else {
    const objectUrl = URL.createObjectURL(file);
    try {
      image = await new Promise((resolve, reject) => {
        const element = new Image();
        element.onload = () => resolve(element);
        element.onerror = () => reject(new Error('無法讀取這張圖片。'));
        element.src = objectUrl;
      });
    } catch (error) { URL.revokeObjectURL(objectUrl); throw error; }
    release = () => URL.revokeObjectURL(objectUrl);
  }
  const width = image.width || image.naturalWidth;
  const height = image.height || image.naturalHeight;
  const scale = Math.min(1, 1400 / Math.max(width, height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
  release();
  let quality = .85;
  let blob;
  do { blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', quality)); quality -= .1; }
  while (blob && blob.size > 1400000 && quality >= .35);
  if (!blob || blob.size > 1500000) throw new Error('圖片太大，請使用較小的圖片。');
  const dataUri = await new Promise((resolve, reject) => {
    const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(blob);
  });
  return { mime: 'image/webp', base64: String(dataUri).split(',')[1] };
}

app.addEventListener('submit', async event => {
  if (event.target.id === 'create-card') {
    event.preventDefault();
    const title = String(new FormData(event.target).get('title') || '').trim();
    if (title) await adminAction('news_discussion_admin_create', { p_title: title }, '已建立新卡片。');
  } else if (event.target.matches('[data-url-form]')) {
    event.preventDefault();
    const id = event.target.dataset.urlForm;
    const url = String(new FormData(event.target).get('url') || '').trim();
    await adminAction('news_discussion_admin_set_url', { p_article_id: id, p_source_url: url }, '新聞連結已儲存。');
  }
});

app.addEventListener('change', async event => {
  const input = event.target;
  if (input.matches('[data-check]')) {
    if (state.article) await saveItem(input.dataset.check, { checked: input.checked });
  } else if (input.matches('[data-upload]') && input.files?.[0]) {
    try {
      toast('正在處理圖片…');
      const prepared = await preparedImage(input.files[0]);
      await adminAction('news_discussion_admin_set_image', { p_article_id: input.dataset.upload, p_mime: prepared.mime, p_base64: prepared.base64 }, '圖片已上載。');
      state.images.delete(input.dataset.upload);
      hydrateImages();
    } catch (error) { toast(error.message || '圖片上載失敗。', true); }
  }
});

app.addEventListener('click', async event => {
  const button = event.target.closest('button');
  if (!button || button.closest('[data-drag-handle]') && !button.matches('[data-close-structures]')) return;
  if (button.matches('[data-retry]')) return loadCards();
  if (button.matches('[data-home]')) return loadCards();
  if (button.matches('[data-bookmarks]')) return showBookmarks();
  if (button.matches('[data-open]')) return openArticle(button.dataset.open);
  if (button.matches('[data-bookmark-open]')) {
    await openArticle(button.dataset.bookmarkOpen);
    const id = button.dataset.bookmarkItem;
    const location = locationForItem(state.article, id);
    if (location) {
      state.question = location.question;
      state.argument = location.argument || null;
      state.structureOpen = Boolean(location.structure);
      renderArticle();
    }
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    return;
  }
  if (button.matches('[data-question]')) {
    state.question = state.question === button.dataset.question ? null : button.dataset.question;
    state.argument = null; state.structureOpen = false;
    renderArticle();
    return;
  }
  if (button.matches('[data-start-pick]')) { startPickMode(); return; }
  if (button.matches('[data-pick-id]') && state.pick?.phase < 3) {
    const selected = state.pick.selected[state.pick.phase - 1];
    const id = button.dataset.pickId;
    if (selected.has(id)) selected.delete(id); else selected.add(id);
    renderPickPage(true);
    app.querySelector(`[data-pick-id="${CSS.escape(id)}"]`)?.focus({ preventScroll: true });
    return;
  }
  if (button.matches('[data-pick-next]') && state.pick) {
    if (state.pick.selected[state.pick.phase - 1].size === 0) return;
    state.argument = null;
    state.pick.phase += 1;
    if (state.pick.phase === 3) renderComparison(); else renderPickPage();
    return;
  }
  if (button.matches('[data-pick-back]') && state.pick) {
    if (state.pick.phase === 1) endPickMode();
    else { state.pick.phase -= 1; state.argument = null; renderPickPage(); }
    return;
  }
  if (button.matches('[data-pick-end]') && state.pick) { endPickMode(); return; }
  if (button.matches('[data-pick-order]') && state.pick?.phase === 3) {
    state.pick.order[Number(button.dataset.picker)] = button.dataset.pickOrder;
    renderComparison(true);
    return;
  }
  if (button.matches('[data-collapse-pick]') && state.pick?.phase === 3) {
    const index = Number(button.dataset.picker);
    const collapsed = state.pick.collapsed[index];
    const id = button.dataset.collapsePick;
    if (collapsed.has(id)) collapsed.delete(id); else collapsed.add(id);
    renderComparison(true);
    app.querySelector(`[data-picker="${index}"][data-collapse-pick="${CSS.escape(id)}"]`)?.focus({ preventScroll: true });
    return;
  }
  if (button.matches('[data-argument]')) {
    state.argument = state.argument === button.dataset.argument ? null : button.dataset.argument;
    if (state.pick && state.view === 'pick') renderPickPage(true); else renderArticle();
    return;
  }
  if (button.matches('[data-star]')) return saveItem(button.dataset.star, { bookmarked: !itemState(button.dataset.star).bookmarked });
  if (button.matches('[data-structures]')) {
    state.structureOpen = true;
    if (state.view === 'pick') renderPickPage(true);
    else if (state.view === 'comparison') renderComparison(true);
    else renderArticle();
    return;
  }
  if (button.matches('[data-close-structures]')) {
    state.structureOpen = false;
    if (state.view === 'pick') renderPickPage(true);
    else if (state.view === 'comparison') renderComparison(true);
    else renderArticle();
    return;
  }
  if (button.matches('[data-hide]')) {
    const card = state.cards.find(item => item.id === button.dataset.hide);
    return adminAction('news_discussion_admin_set_hidden', { p_article_id: card.id, p_hidden: !card.hidden }, card.hidden ? '卡片已重新顯示。' : '卡片已隱藏。');
  }
  if (button.matches('[data-remove]')) {
    const card = state.cards.find(item => item.id === button.dataset.remove);
    if (!window.confirm(`移除「${card?.title || '這則新聞'}」？學生將無法再看到這張卡。`)) return;
    return adminAction('news_discussion_admin_remove', { p_article_id: card.id }, '卡片已移除。');
  }
});

let dragging = null;
app.addEventListener('pointerdown', event => {
  const handle = event.target.closest('[data-drag-handle]');
  if (!handle || event.target.closest('button')) return;
  const float = $('#structure-float');
  if (!float) return;
  const rect = float.getBoundingClientRect();
  dragging = { x: event.clientX - rect.left, y: event.clientY - rect.top, pointer: event.pointerId };
  handle.setPointerCapture(event.pointerId);
});
app.addEventListener('pointermove', event => {
  if (!dragging || dragging.pointer !== event.pointerId) return;
  const float = $('#structure-float');
  if (!float) return;
  const x = Math.max(8, Math.min(window.innerWidth - float.offsetWidth - 8, event.clientX - dragging.x));
  const y = Math.max(8, Math.min(window.innerHeight - float.offsetHeight - 8, event.clientY - dragging.y));
  float.style.left = `${x}px`; float.style.top = `${y}px`; float.style.right = 'auto';
  state.structurePosition = { x, y };
});
app.addEventListener('pointerup', () => { dragging = null; });
app.addEventListener('pointercancel', () => { dragging = null; });

$('#student-tab').addEventListener('click', () => setLoginMode('student'));
$('#admin-tab').addEventListener('click', () => setLoginMode('admin'));
$('#login-form').addEventListener('submit', login);
$('#logout').addEventListener('click', logout);
void restore();
