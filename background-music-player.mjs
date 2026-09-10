import { escapeHtml as escape } from './learning-hub-client.mjs';

const STORAGE_KEY = 'edmund-background-music-preferences-v3';
const GENRE_ZH = {
  Blues: '藍調', Classical: '古典', Country: '鄉村', Electronic: '電子', Experimental: '實驗',
  Folk: '民謠', 'Hip-Hop': '嘻哈', Instrumental: '純音樂', International: '世界音樂', Jazz: '爵士',
  'Old-Time/Historic': '懷舊音樂', Pop: '流行', Rock: '搖滾', 'Soul-RnB': '靈魂與節奏藍調'
};

let library;
let audio;
let activeTrack;
let activeGenre = '';
let activeView = { type: 'genre', value: '' };
let dialog;
const mounts = new Set();

function readPreferences() {
  const fallback = { language: 'both', favorites: [], playlists: {} };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    return {
      language: ['zh', 'en', 'both'].includes(saved?.language) ? saved.language : 'both',
      favorites: Array.isArray(saved?.favorites) ? [...new Set(saved.favorites.map(String))] : [],
      playlists: saved?.playlists && typeof saved.playlists === 'object' ? saved.playlists : {}
    };
  } catch { return fallback; }
}
let preferences = readPreferences();

function savePreferences() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences)); } catch {}
}

function bilingual(zh, en, className = '') {
  return `<span class="music-copy ${className}"><span class="music-zh">${escape(zh)}</span><span class="music-en">${escape(en)}</span></span>`;
}

function spoken(zh, en) {
  if (preferences.language === 'zh') return zh;
  if (preferences.language === 'en') return en;
  return `${zh} · ${en}`;
}

function ensureStyles() {
  if (document.querySelector('link[data-background-music-player-style]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = new URL('./background-music-player.css?v=20260910-floating6', import.meta.url).href;
  link.dataset.backgroundMusicPlayerStyle = '';
  document.head.append(link);
}

async function tracks() {
  if (!library) {
    const response = await fetch(new URL('./background-music-catalog.json?v=20260910-five-per-genre', import.meta.url));
    if (!response.ok) throw Error('Music library could not load');
    library = await response.json();
  }
  return library.tracks;
}

const clock = seconds => {
  seconds = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
};
const genres = rows => [...new Set(rows.map(row => row.genre))];
const rowKey = row => row.catalogId || `${row.id}-${row.genre}`;
const songKey = row => String(row.id);
const uniqueSongs = rows => [...new Map(rows.map(row => [songKey(row), row])).values()];
const isFavorite = row => Boolean(row && preferences.favorites.includes(songKey(row)));

function rowsForView(rows) {
  if (activeView.type === 'favorites') return uniqueSongs(rows).filter(isFavorite);
  if (activeView.type === 'playlist') {
    const ids = new Set((preferences.playlists[activeView.value] || []).map(String));
    return uniqueSongs(rows).filter(row => ids.has(songKey(row)));
  }
  return rows.filter(row => row.genre === activeGenre);
}

function viewTitle(list) {
  if (activeView.type === 'favorites') return spoken('我的最愛', 'Favorites');
  if (activeView.type === 'playlist') return activeView.value;
  return `${GENRE_ZH[activeGenre] || activeGenre} · ${activeGenre}`;
}

function genreCards(rows, genre) {
  return genres(rows).map(name => {
    const first = rows.find(row => row.genre === name);
    const active = activeView.type === 'genre' && name === genre;
    return `<button type="button" class="music-genre-card${active ? ' is-active' : ''}" data-genre-card="${escape(name)}" aria-pressed="${active}"><img src="${escape(first.art)}" alt=""><span>${bilingual(GENRE_ZH[name] || name, name)}</span><small>${bilingual('5 首', '5 tracks')}</small></button>`;
  }).join('');
}

function playerMarkup(rows, genre) {
  return `<section class="music-player" data-music-player data-music-language="${preferences.language}">
    <header class="music-player-heading">
      <div><p>${bilingual('EDMUND 學習音樂', 'EDMUND STUDY SOUND')}</p><h2>${bilingual('背景音樂', 'Background Music')}</h2></div>
      <div class="music-heading-actions">
        <label class="music-language">${bilingual('語言', 'Language')}<select data-music-language-picker aria-label="${escape(spoken('語言', 'Language'))}"><option value="zh">中文</option><option value="en">English</option><option value="both">中文 + English</option></select></label>
        <button type="button" data-window aria-label="${escape(spoken('開啟浮動播放器', 'Open floating player'))}" aria-pressed="false">↗ <span>${bilingual('浮動播放器', 'Floating player')}</span></button>
      </div>
    </header>
    <div class="music-library-tools">
      <button type="button" class="music-library-favorites" data-view-favorites aria-pressed="false">♥ ${bilingual('我的最愛', 'Favorites')} <b data-favorite-count>0</b></button>
      <label>${bilingual('播放清單', 'Playlists')}<select data-playlist-view aria-label="${escape(spoken('選擇播放清單', 'Choose playlist'))}"><option value="">${escape(spoken('選擇播放清單', 'Choose playlist'))}</option></select></label>
      <button type="button" data-new-playlist>＋ ${bilingual('新增播放清單', 'New playlist')}</button>
    </div>
    <div class="music-genre-rail" data-genre-rail>${genreCards(rows, genre)}</div>
    <div class="music-player-stage">
      <div class="music-now-playing">
        <div class="music-track-heading"><small data-genre-label></small><h3 data-title>${escape(spoken('選擇歌曲', 'Select a track'))}</h3><p data-artist></p></div>
        <div class="music-disc" data-disc><img data-art alt=""><span aria-hidden="true"></span></div>
        <div class="music-track-meta"><div class="music-tempo"><strong data-bpm>— BPM</strong><span>${bilingual('預計節奏', 'Estimated tempo')}</span></div><div class="music-current-actions"><button type="button" data-favorite-current aria-pressed="false">♡ ${bilingual('收藏', 'Favorite')}</button><button type="button" data-add-current>＋ ${bilingual('加入播放清單', 'Add to playlist')}</button></div></div>
      </div>
      <div class="music-controls"><div class="music-progress"><time data-current>0:00</time><input data-seek type="range" min="0" max="1" step="0.1" value="0" aria-label="${escape(spoken('播放進度', 'Track progress'))}"><time data-duration>0:00</time></div>
        <div class="music-transport"><button type="button" data-shuffle aria-label="${escape(spoken('隨機播放', 'Shuffle'))}">⌘</button><button type="button" data-previous aria-label="${escape(spoken('上一首', 'Previous track'))}">|‹</button><button type="button" class="music-play" data-play aria-label="${escape(spoken('播放', 'Play'))}">▶</button><button type="button" data-next aria-label="${escape(spoken('下一首', 'Next track'))}">›|</button><button type="button" data-repeat aria-label="${escape(spoken('重複播放', 'Repeat'))}" aria-pressed="false">↻</button></div>
        <label class="music-volume">${bilingual('音量', 'Volume')}<input data-volume type="range" min="0" max="1" step=".05" value=".25"></label>
      </div>
      <aside class="music-queue"><div><p>${bilingual('歌曲清單', 'UP NEXT')}</p><strong data-queue-title></strong></div><div data-track-list></div><p class="music-empty" data-music-empty hidden></p></aside>
    </div>
    <footer class="music-status" role="status" aria-live="polite"></footer>
  </section>`;
}

function setupAudio() {
  if (audio) return audio;
  audio = new Audio();
  audio.preload="none";
  audio.volume = .25;
  ['timeupdate', 'loadedmetadata', 'play', 'pause'].forEach(name => audio.addEventListener(name, syncMounts));
  audio.addEventListener('ended', () => audio.loop ? (audio.currentTime = 0, audio.play().catch(() => {})) : playOffset(1));
  return audio;
}

function syncMounts() {
  for (const root of mounts) {
    if (!root.isConnected) { mounts.delete(root); continue; }
    const seek = root.querySelector('[data-seek]');
    if (seek) { seek.max = Number.isFinite(audio?.duration) ? audio.duration : 1; seek.value = audio?.currentTime || 0; }
    const current = root.querySelector('[data-current]'); if (current) current.textContent = clock(audio?.currentTime || 0);
    const duration = root.querySelector('[data-duration]'); if (duration) duration.textContent = clock(audio?.duration || 0);
    const play = root.querySelector('[data-play]');
    if (play) { play.textContent = audio && !audio.paused ? '❚❚' : '▶'; play.setAttribute('aria-label', audio && !audio.paused ? spoken('暫停', 'Pause') : spoken('播放', 'Play')); }
    root.querySelector('[data-disc]')?.classList.toggle('is-playing', Boolean(audio && !audio.paused));
  }
}

function setStatus(message = '') { for (const root of mounts) { const node = root.querySelector('[role=status]'); if (node) node.textContent = message; } }

async function setTrack(row, { autoplay = false } = {}) {
  if (!row) return;
  setupAudio(); activeTrack = row; activeGenre = row.genre;
  const resolved = new URL(row.src, location.href).href;
  if (audio.src !== resolved) { audio.src = row.src; audio.load(); }
  await renderAll();
  if (autoplay) try { await audio.play(); } catch (error) { setStatus(error.message); }
}

function playlistOptions() {
  return Object.keys(preferences.playlists).sort((a, b) => a.localeCompare(b, 'zh-Hant'));
}

function addSongToPlaylist(row) {
  if (!row) return;
  const names = playlistOptions();
  const suggestion = names[0] || '';
  const message = names.length ? `輸入播放清單名稱 / Playlist name\n現有 / Existing: ${names.join(', ')}` : '新增播放清單名稱 / New playlist name';
  const entered = window.prompt(message, suggestion);
  if (entered === null) return;
  const name = entered.trim().slice(0, 50);
  if (!name) return setStatus(spoken('請輸入播放清單名稱。', 'Enter a playlist name.'));
  const ids = new Set((preferences.playlists[name] || []).map(String));
  ids.add(songKey(row)); preferences.playlists[name] = [...ids]; savePreferences();
  setStatus(spoken(`已加入「${name}」。`, `Added to “${name}”.`)); renderAll();
}

function createPlaylist() {
  const entered = window.prompt('新增播放清單名稱 / New playlist name');
  if (entered === null) return;
  const name = entered.trim().slice(0, 50);
  if (!name) return setStatus(spoken('請輸入播放清單名稱。', 'Enter a playlist name.'));
  preferences.playlists[name] ||= []; savePreferences(); activeView = { type: 'playlist', value: name }; renderAll();
}

function toggleFavorite(row) {
  if (!row) return;
  const key = songKey(row), favorites = new Set(preferences.favorites);
  favorites.has(key) ? favorites.delete(key) : favorites.add(key);
  preferences.favorites = [...favorites]; savePreferences(); renderAll();
}

function renderRoot(root, rows) {
  root.dataset.musicLanguage = preferences.language;
  document.documentElement.dataset.musicLanguage = preferences.language;
  const language = root.querySelector('[data-music-language-picker]'); if (language) language.value = preferences.language;
  if (!activeGenre) activeGenre = rows[0]?.genre || '';
  const list = rowsForView(rows);
  if (!activeTrack) activeTrack = list[0] || rows[0] || null;
  root.querySelectorAll('[data-genre-card]').forEach(button => {
    const on = activeView.type === 'genre' && button.dataset.genreCard === activeGenre;
    button.classList.toggle('is-active', on); button.setAttribute('aria-pressed', String(on));
  });
  const favoriteView = root.querySelector('[data-view-favorites]');
  if (favoriteView) { favoriteView.classList.toggle('is-active', activeView.type === 'favorites'); favoriteView.setAttribute('aria-pressed', String(activeView.type === 'favorites')); }
  const count = root.querySelector('[data-favorite-count]'); if (count) count.textContent = String(preferences.favorites.length);
  const picker = root.querySelector('[data-playlist-view]');
  if (picker) { picker.innerHTML = `<option value="">${escape(spoken('選擇播放清單', 'Choose playlist'))}</option>${playlistOptions().map(name => `<option value="${escape(name)}">${escape(name)}</option>`).join('')}`; picker.value = activeView.type === 'playlist' ? activeView.value : ''; }
  const art = root.querySelector('[data-art]'); if (art && activeTrack) { art.src = activeTrack.art; art.alt = `${activeTrack.genre} artwork`; }
  root.querySelector('[data-genre-label]').innerHTML = activeTrack ? bilingual(GENRE_ZH[activeTrack.genre] || activeTrack.genre, activeTrack.genre) : '';
  root.querySelector('[data-title]').textContent = activeTrack?.title || spoken('沒有歌曲', 'No track available');
  root.querySelector('[data-artist]').textContent = activeTrack?.artist || '';
  root.querySelector('[data-bpm]').textContent = activeTrack?.bpm ? `≈ ${activeTrack.bpm} BPM` : '— BPM';
  const currentFavorite = root.querySelector('[data-favorite-current]');
  if (currentFavorite) { const favorite = isFavorite(activeTrack); currentFavorite.classList.toggle('is-active', favorite); currentFavorite.setAttribute('aria-pressed', String(favorite)); currentFavorite.innerHTML = `${favorite ? '♥' : '♡'} ${bilingual('收藏', 'Favorite')}`; }
  root.querySelector('[data-queue-title]').textContent = `${viewTitle(list)} · ${list.length}`;
  const empty = root.querySelector('[data-music-empty]');
  if (empty) { empty.hidden = list.length > 0; empty.innerHTML = activeView.type === 'favorites' ? bilingual('尚未收藏歌曲。按歌曲旁的心形即可收藏。', 'No favorites yet. Use the heart beside a song.') : bilingual('這個播放清單尚未有歌曲。', 'This playlist is empty.'); }
  root.querySelector('[data-track-list]').innerHTML = list.map((row, index) => `<article class="music-track-card${rowKey(row) === rowKey(activeTrack) ? ' is-active' : ''}">
    <button type="button" class="music-track-main" data-track-card="${escape(rowKey(row))}"><img src="${escape(row.art)}" alt=""><span><strong>${escape(row.title)}</strong><small>${escape(row.artist)} · ≈ ${row.bpm || '—'} BPM</small></span><b>${String(index + 1).padStart(2, '0')}</b></button>
    <button type="button" class="music-song-action${isFavorite(row) ? ' is-active' : ''}" data-favorite-song="${escape(rowKey(row))}" aria-pressed="${isFavorite(row)}" aria-label="${escape(spoken('收藏歌曲', 'Favorite song'))}">${isFavorite(row) ? '♥' : '♡'}</button>
    <button type="button" class="music-song-action" data-playlist-song="${escape(rowKey(row))}" aria-label="${escape(spoken('加入播放清單', 'Add to playlist'))}">＋</button>
  </article>`).join('');
  syncMounts();
}

async function renderAll() { const rows = await tracks(); for (const root of mounts) if (root.isConnected) renderRoot(root, rows); }

async function playOffset(offset) {
  const rows = await tracks(); let list = rowsForView(rows);
  if (!list.length) list = rows.filter(row => row.genre === activeGenre);
  if (!list.length) return;
  let index = Math.max(0, list.findIndex(row => rowKey(row) === rowKey(activeTrack)));
  index = (index + offset + list.length) % list.length;
  await setTrack(list[index], { autoplay: true });
}

export async function mountMusic(root) {
  ensureStyles(); const rows = await tracks(); setupAudio(); mounts.add(root);
  const initialGenre = activeGenre || rows[0]?.genre || ''; activeGenre = initialGenre;
  root.innerHTML = playerMarkup(rows, initialGenre);
  if (!activeTrack) activeTrack = rows.find(row => row.genre === initialGenre) || rows[0];
  root.addEventListener('click', async event => {
    const genre = event.target.closest('[data-genre-card]');
    if (genre) { activeGenre = genre.dataset.genreCard; activeView = { type: 'genre', value: activeGenre }; return setTrack(rows.find(row => row.genre === activeGenre), { autoplay: !audio.paused }); }
    if (event.target.closest('[data-view-favorites]')) { activeView = { type: 'favorites', value: '' }; return renderAll(); }
    if (event.target.closest('[data-new-playlist]')) return createPlaylist();
    if (event.target.closest('[data-favorite-current]')) return toggleFavorite(activeTrack);
    if (event.target.closest('[data-add-current]')) return addSongToPlaylist(activeTrack);
    const favorite = event.target.closest('[data-favorite-song]'); if (favorite) return toggleFavorite(rows.find(row => rowKey(row) === favorite.dataset.favoriteSong));
    const playlist = event.target.closest('[data-playlist-song]'); if (playlist) return addSongToPlaylist(rows.find(row => rowKey(row) === playlist.dataset.playlistSong));
    const track = event.target.closest('[data-track-card]'); if (track) return setTrack(rows.find(row => rowKey(row) === track.dataset.trackCard), { autoplay: true });
    if (event.target.closest('[data-play]')) { if (!activeTrack) return; if (!audio.src) await setTrack(activeTrack); return audio.paused ? audio.play().catch(error => setStatus(error.message)) : audio.pause(); }
    if (event.target.closest('[data-previous]')) return playOffset(-1);
    if (event.target.closest('[data-next]')) return playOffset(1);
    if (event.target.closest('[data-shuffle]')) { const list = rowsForView(rows); if (list.length) return setTrack(list[Math.floor(Math.random() * list.length)], { autoplay: true }); }
    if (event.target.closest('[data-repeat]')) { audio.loop = !audio.loop; event.target.closest('[data-repeat]').setAttribute('aria-pressed', String(audio.loop)); return; }
    if (event.target.closest('[data-window]')) {
      const playerDialog = root.closest('dialog.background-music-dialog');
      if (!playerDialog) return openMusic();
      const expanded = playerDialog.classList.toggle('is-expanded');
      const button = event.target.closest('[data-window]');
      button.setAttribute('aria-pressed', String(expanded));
      button.querySelector('span').innerHTML = expanded
        ? bilingual('還原浮動視窗', 'Restore panel')
        : bilingual('放大浮動視窗', 'Expand panel');
    }
  });
  root.querySelector('[data-music-language-picker]').addEventListener('change', event => { preferences.language = event.target.value; savePreferences(); renderAll(); });
  root.querySelector('[data-playlist-view]').addEventListener('change', event => { if (event.target.value) activeView = { type: 'playlist', value: event.target.value }; renderAll(); });
  root.querySelector('[data-seek]').addEventListener('input', event => { audio.currentTime = Number(event.target.value) || 0; });
  root.querySelector('[data-volume]').addEventListener('input', event => { audio.volume = Number(event.target.value); });
  renderRoot(root, rows);
}

export async function openMusic() {
  ensureStyles();
  if (dialog?.isConnected) { dialog.showModal(); return; }
  dialog = document.createElement('dialog'); dialog.className = 'background-music-dialog';
  dialog.innerHTML = `<button type="button" class="music-dialog-close" data-close aria-label="${escape(spoken('關閉', 'Close'))}">×</button><div data-player></div>`;
  document.body.append(dialog); dialog.querySelector('[data-close]').onclick = () => dialog.close();
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.showModal(); await mountMusic(dialog.querySelector('[data-player]'));
}

document.addEventListener('click', event => { if (event.target.closest('[data-edmund-music-header]')) openMusic().catch(console.error); });
const root = document.querySelector('[data-music-library]'); if (root) mountMusic(root).catch(error => root.textContent = error.message);
