import { bookmarkLocation, safeBookmarkHref, bookmarksCsv, RowReplay } from './listening-study-core.mjs?v=20260827-study1';
import { createListeningRecorder } from './listening-recorder.js?v=20260827-study1';

export function createListeningStudy({ state, rpc, escapeHtml: esc, showView, updateRoute, pauseAllAudio, loadAudioCatalogue, toast, openPractice }) {
  const $ = selector => document.querySelector(selector);
  const endpoint = `${window.EDMUND_SUPABASE.url}/functions/v1/listening-study`;
  const transcripts = window.EDMUND_IELTS_LISTENING_PRACTICE_1_TRANSCRIPT || {};
  const timings = window.EDMUND_IELTS_LISTENING_PRACTICE_1_TIMINGS || {};
  const replay = new RowReplay($('[data-row-audio]'));
  let rows = [], adminRows = [], generation = 0, replayRequest = 0;
  let adminToken = '', adminName = '', reportLoaded = false;
  const locationFor = row => bookmarkLocation(row, transcripts, timings);
  async function api(path, options = {}) {
    const token = path.startsWith('/admin/') ? adminToken : state.token;
    const { blob, ...init } = options;
    const response = await fetch(endpoint + path, {
      ...init, headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(init.body && !(init.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}), ...init.headers },
      cache: 'no-store', credentials: 'omit', signal: AbortSignal.timeout(45000)
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `暫時未能完成（${response.status}），請重試。`);
    }
    return blob ? response.blob() : response.json();
  }
  async function allRows(path) {
    const result = []; let offset = 0;
    do {
      const page = await api(`${path}?offset=${offset}`);
      if (!Array.isArray(page.rows)) throw new Error('資料格式不正確，請重試。');
      result.push(...page.rows); offset = page.nextOffset;
    } while (offset !== null);
    return result;
  }
  const recorder = createListeningRecorder({ api, getStudent: () => state.user, pauseAudio: pauseAllAudio, playModel: playRow, escapeHtml: esc, toast });
  function stopReplay() {
    replayRequest++; replay.stop(); $('[data-row-player]').hidden = true;
  }
  async function playRow(context) {
    if (!context) return toast('此書簽沒有對應的逐行時間，請按「返回練習」。');
    pauseAllAudio(); recorder.pause(); const request = ++replayRequest;
    try {
      await loadAudioCatalogue();
      if (request !== replayRequest) return;
      const track = state.tracks.get(`${context.practice}:${context.part}`);
      if (!track) throw new Error('這一行的錄音暫時未能載入。');
      $('[data-row-title]').textContent = context.title;
      $('[data-row-speed]').value = String(state.speed);
      $('[data-row-player]').hidden = false;
      await replay.play(track.url,context.start,context.end,state.speed);
    } catch (error) { if (request === replayRequest) toast(error.message || '請再按一次播放。'); }
  }
  async function loadBookmarks({ required = false } = {}) {
    const token = state.token, g = generation;
    if (!token) return;
    let next;
    try { next = await allRows('/bookmarks'); }
    catch (error) {
      if (required) throw error;
      // Old deployed bookmark data remains usable during a staged rollout.
      next = await rpc('learning_portal_list_bookmarks', { p_token: token, p_system_key: 'listening' });
    }
    if (g !== generation || state.token !== token) return;
    rows = Array.isArray(next) ? next : [];
    state.listeningBookmarks = new Set(rows.map(r => r.item_key));
  }
  async function openBookmarks() {
    if (!state.user) return showView('login');
    pauseAllAudio(); updateRoute('bookmarks'); showView('bookmarks');
    $('[data-bookmarks-status]').textContent = '正在載入您的書簽…';
    renderBookmarks();
    try { await loadBookmarks({ required: true }); if (state.view === 'bookmarks') renderBookmarks(); }
    catch (error) { $('[data-bookmarks-status]').textContent = `${error.message} 請按「重新載入」。`; }
  }
  function filteredBookmarks() {
    const search = $('[data-bookmark-search]').value.trim().toLocaleLowerCase();
    const difficulty = Number($('[data-bookmark-filter]').value);
    return rows.filter(r => (!difficulty || r.difficulty === difficulty) && (!search || `${r.title} ${r.detail}`.toLocaleLowerCase().includes(search)));
  }
  function renderBookmarks() {
    const filtered = filteredBookmarks();
    $('[data-bookmarks-status]').textContent = `共 ${rows.length} 個書簽 · 顯示 ${filtered.length} 個`;
    $('[data-bookmark-library]').innerHTML = filtered.length ? filtered.map(row => {
      const context = locationFor(row);
      return `<article class="bookmark-study-card panel" data-library-key="${esc(row.item_key)}"><p class="eyebrow">${context ? esc(`PRACTICE ${context.practice} · PART ${context.part} · ROW ${context.rowIndex+1}`) : 'SAVED BOOKMARK'}</p><h2>${esc(row.title)}</h2><p class="bookmark-detail">${esc(context?.transcript || row.detail)}</p><div class="bookmark-difficulty"><span>難度 <small>1 易 → 5 難</small></span><div class="difficulty-stars" role="group" aria-label="${esc(row.title)}的難度">${[1,2,3,4,5].map(star => `<button type="button" data-rate-key="${esc(row.item_key)}" data-rating="${star}" aria-pressed="${row.difficulty===star}" aria-label="${star} 星難度" class="${star <= row.difficulty ? 'is-filled' : ''}">${star <= row.difficulty ? '★' : '☆'}</button>`).join('')}</div><small>${row.difficulty ? `${row.difficulty} / 5` : '未評分'}</small></div><div class="bookmark-actions">${context ? `<button class="primary-button" type="button" data-replay-key="${esc(row.item_key)}">▶ 只重聽這一行</button><button class="secondary-button" type="button" data-record-key="${esc(row.item_key)}">● 朗讀練習</button>` : '<small>此內容沒有對應的逐行錄音。</small>'}<a class="secondary-button" href="${esc(safeBookmarkHref(row.href))}">返回練習</a><button class="secondary-button" type="button" data-remove-key="${esc(row.item_key)}">移除書簽</button></div></article>`;
    }).join('') : '<div class="empty-state panel"><h2>尚未有符合的書簽</h2><p>在錄音稿按「收藏此行」或點擊單字，即可收藏並在這裡重溫。</p></div>';
  }
  function updateLocalBookmark(item, bookmarked) {
    rows = rows.filter(r => r.item_key !== item.item_key);
    if (bookmarked) rows.push({ ...item, difficulty: null, created_at: new Date().toISOString() });
  }
  async function rate(button) {
    const key = button.dataset.rateKey, difficulty = Number(button.dataset.rating), g = generation;
    const controls = [...button.closest('.difficulty-stars').querySelectorAll('button')];
    controls.forEach(b => { b.disabled = true; });
    try {
      await api('/bookmarks/rating', { method: 'PATCH', body: JSON.stringify({ itemKey: key, difficulty }) });
      if (g !== generation) return;
      const row = rows.find(r => r.item_key === key); if (row) row.difficulty = difficulty;
      renderBookmarks();
      $('[data-bookmark-library]').querySelector(`[data-rate-key="${CSS.escape(key)}"][data-rating="${difficulty}"]`)?.focus({ preventScroll: true });
      toast(`已儲存 ${difficulty} 星難度。`);
    } catch (error) { toast(error.message); } finally { controls.forEach(b => { b.disabled = false; }); }
  }
  async function remove(button) {
    const key = button.dataset.removeKey, row = rows.find(r => r.item_key === key), g = generation;
    if (!row) return; button.disabled = true;
    try {
      await rpc('learning_portal_set_bookmark', { p_token: state.token, p_system_key: 'listening', p_item_key: key, p_title: row.title, p_detail: row.detail, p_href: safeBookmarkHref(row.href), p_bookmarked: false });
      if (g !== generation) return;
      rows = rows.filter(r => r.item_key !== key); state.listeningBookmarks.delete(key); renderBookmarks();
    } catch (error) { toast(error.message); button.disabled = false; }
  }
  function adminSession(value) {
    adminToken = value?.token || ''; adminName = value?.name || '';
    state.listeningAdminName = adminName;
    try { if (value) sessionStorage.setItem('edmund-listening-admin-v1', JSON.stringify(value)); else sessionStorage.removeItem('edmund-listening-admin-v1'); } catch { /* server session remains authoritative */ }
  }
  function adminLoginView() { pauseAllAudio(); updateRoute('admin'); showView('admin-login'); }
  async function restoreAdmin() {
    let value; try { value = JSON.parse(sessionStorage.getItem('edmund-listening-admin-v1')); } catch { /* invalid local session */ }
    if (!value?.token) { adminLoginView(); return; }
    adminSession(value);
    try { await api('/admin/me'); await openAdmin(); } catch { adminSession(null); adminLoginView(); }
  }
  async function openAdmin() {
    showView('admin'); updateRoute('admin'); await loadReport();
  }
  async function loadReport() {
    const token = adminToken;
    reportLoaded = false; $('[data-admin-export]').disabled = true;
    $('[data-admin-report-status]').textContent = '正在載入所有學生書簽…';
    try {
      const result = await allRows('/admin/bookmarks');
      if (token !== adminToken) return;
      adminRows = result; reportLoaded = true; renderReport();
    } catch (error) { $('[data-admin-report-status]').textContent = `${error.message} 請按「重新載入」。`; }
  }
  function filteredReport() {
    const text = $('[data-admin-search]').value.trim().toLocaleLowerCase(), filter = $('[data-admin-filter]').value;
    return adminRows.filter(r => (filter === 'all' || (filter === 'rated' ? r.difficulty : !r.difficulty)) && (!text || `${r.flashcard_students?.name} ${r.title} ${r.detail}`.toLocaleLowerCase().includes(text)));
  }
  function renderReport() {
    const list = filteredReport();
    $('[data-admin-export]').disabled = !reportLoaded;
    $('[data-admin-report-status]').textContent = `共 ${adminRows.length} 個書簽 · ${adminRows.filter(r => r.difficulty).length} 個已評星級 · 目前顯示 ${list.length} 個。CSV 匯出目前篩選結果。`;
    $('[data-admin-report]').innerHTML = `<table class="admin-bookmark-table"><thead><tr><th>學生</th><th>書簽 / 錄音稿</th><th>難度</th><th>更新時間</th></tr></thead><tbody>${list.map(r => `<tr><td>${esc(r.flashcard_students?.name || '—')}</td><td><strong>${esc(r.title)}</strong><p>${esc(r.detail)}</p><a href="${esc(safeBookmarkHref(r.href))}" target="_blank" rel="noopener">開啟練習</a></td><td>${r.difficulty ? `${'★'.repeat(r.difficulty)}<br>${r.difficulty} / 5` : '未評分'}</td><td>${esc(new Date(r.updated_at).toLocaleString())}</td></tr>`).join('')}</tbody></table>`;
  }
  $('[data-admin-login-form]').addEventListener('submit', async event => {
    event.preventDefault(); const form = event.currentTarget, button = form.querySelector('button[type="submit"]');
    const values = new FormData(form); button.disabled = true;
    $('[data-admin-login-status]').textContent = '正在核對…';
    try {
      const session = await api('/admin/login', { method: 'POST', body: JSON.stringify({ username: values.get('username'), password: values.get('password') }) });
      form.reset(); adminSession(session); await openAdmin();
    } catch (error) { $('[data-admin-login-status]').textContent = error.message; }
    finally { button.disabled = false; }
  });
  document.addEventListener('click', event => {
    const b = event.target.closest('button'); if (!b) return;
    if (b.matches('[data-open-bookmarks], [data-refresh-bookmarks]')) void openBookmarks();
    else if (b.dataset.rateKey) void rate(b);
    else if (b.dataset.removeKey) void remove(b);
    else if (b.dataset.replayKey) void playRow(locationFor(rows.find(r => r.item_key === b.dataset.replayKey) || {}));
    else if (b.dataset.recordKey) { const context = locationFor(rows.find(r => r.item_key === b.dataset.recordKey) || {}); if (context) void recorder.open(context); }
    else if (b.hasAttribute('data-replay-row') || b.hasAttribute('data-record-row')) {
      const context = locationFor({ item_key: `practice${state.practice}:transcript:p${state.practicePart}:line:${b.dataset.replayRow ?? b.dataset.recordRow}` });
      if (b.hasAttribute('data-replay-row')) void playRow(context); else if (context) void recorder.open(context);
    }
    else if (b.hasAttribute('data-record-part')) void recorder.open({ practice: state.practice, part: Number(b.dataset.recordPart), title: `Practice ${state.practice} · Part ${b.dataset.recordPart}`, transcript: '' });
    else if (b.matches('[data-floating-record]')) {
      const part = Number($('[data-floating-audio]').dataset.part) || state.practicePart;
      void recorder.open({ practice: state.practice, part, title: `Practice ${state.practice} · Part ${part}`, transcript: '' });
    }
    else if (b.matches('[data-row-close]')) stopReplay();
    else if (b.matches('[data-open-admin]')) adminLoginView();
    else if (b.matches('[data-student-login]')) { updateRoute(); showView('login'); }
    else if (b.matches('[data-admin-refresh]')) void loadReport();
    else if (b.matches('[data-admin-export]') && reportLoaded) {
      const url = URL.createObjectURL(new Blob([bookmarksCsv(filteredReport())], { type: 'text/csv;charset=utf-8' }));
      const link = document.createElement('a'); link.href = url; link.download = `listening-bookmarks-${new Date().toISOString().slice(0,10)}.csv`; link.click(); setTimeout(() => URL.revokeObjectURL(url),30000);
    }
  });
  document.addEventListener('input', e => {
    if (e.target.matches('[data-bookmark-search]')) renderBookmarks();
    if (e.target.matches('[data-admin-search]')) renderReport();
  });
  document.addEventListener('change', e => {
    if (e.target.matches('[data-bookmark-filter]')) renderBookmarks();
    if (e.target.matches('[data-admin-filter]')) renderReport();
    if (e.target.matches('[data-row-speed]')) $('[data-row-audio]').playbackRate = Number(e.target.value);
  });
  document.addEventListener('play', event => {
    if (!(event.target instanceof HTMLAudioElement)) return;
    if (event.target.matches('[data-audio-part]')) { stopReplay(); recorder.pause(); }
    document.querySelectorAll('audio').forEach(audio => { if (audio !== event.target) audio.pause(); });
  }, true);
  return {
    loadBookmarks, openBookmarks, updateLocalBookmark, stopReplay, restoreAdmin,
    async logout() {
      if (!recorder.close()) return false;
      generation++; rows = []; adminRows = []; reportLoaded = false; state.listeningBookmarks.clear();
      $('[data-bookmark-library]').replaceChildren(); $('[data-admin-report]').replaceChildren();
      if (adminToken) { try { await api('/admin/logout', { method: 'POST' }); } catch { /* local logout still works */ } }
      adminSession(null); return true;
    }
  };
}
