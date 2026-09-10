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
let preferencesReconciled = false;
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
    reconcileLibraryPreferences(library.tracks);
  }
  return library.tracks;
}

const clock = seconds => {
  seconds = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
};
const genres = rows => [...new Set(rows.map(row => row.genre))];
const rowKey = row => row.catalogId || `${row.id}-${row.genre}`;
const songKey = row => String(row.catalogId || `${row.genre}:${row.id}`);
const uniqueSongs = rows => [...new Map(rows.map(row => [songKey(row), row])).values()];
const isFavorite = row => Boolean(row && preferences.favorites.includes(songKey(row)));

function reconcileLibraryPreferences(rows) {
  if (preferencesReconciled) return;
  preferencesReconciled = true;
  const currentKeys = new Set(rows.map(songKey));
  const legacyKeys = new Map();
  rows.forEach(row => {
    legacyKeys.set(String(row.id), songKey(row));
    legacyKeys.set(String(rowKey(row)), songKey(row));
  });
  const migrate = ids => [...new Set((ids || []).map(id => {
    const value = String(id);
    return currentKeys.has(value) ? value : legacyKeys.get(value);
  }).filter(Boolean))];
  const favorites = migrate(preferences.favorites);
  const playlists = Object.fromEntries(Object.entries(preferences.playlists).map(([name, ids]) => [name, migrate(ids)]));
  const changed = JSON.stringify(favorites) !== JSON.stringify(preferences.favorites)
    || JSON.stringify(playlists) !== JSON.stringify(preferences.playlists);
  preferences.favorites = favorites;
  preferences.playlists = playlists;
  if (changed) savePreferences();
}

function rowsForView(rows) {
  if (activeView.type === 'favorites') {
    const byId = new Map(rows.map(row => [songKey(row), row]));
    return preferences.favorites.map(id => byId.get(String(id))).filter(Boolean);
  }
  if (activeView.type === 'playlist') {
    const byId = new Map(rows.map(row => [songKey(row), row]));
    return (preferences.playlists[activeView.value] || []).map(id => byId.get(String(id))).filter(Boolean);
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
      <div class="music-favorite-tools"><button type="button" class="music-library-favorites" data-view-favorites aria-pressed="false">♥ ${bilingual('我的最愛', 'Favorites')} <b data-favorite-count>0</b></button><button type="button" data-play-favorites title="Play favorites in order">▶</button></div>
      <label>${bilingual('播放清單', 'Playlists')}<input type="search" data-playlist-search placeholder="${escape(spoken('搜尋播放清單', 'Search playlists'))}"><select data-playlist-view aria-label="${escape(spoken('選擇播放清單', 'Choose playlist'))}"><option value="">${escape(spoken('選擇播放清單', 'Choose playlist'))}</option></select></label>
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
      <aside class="music-queue"><div><p>${bilingual('歌曲清單', 'UP NEXT')}</p><span><strong data-queue-title></strong><button type="button" data-edit-playlist hidden>✎ ${bilingual('編輯', 'Edit')}</button></span></div><div data-track-list></div><p class="music-empty" data-music-empty hidden></p></aside>
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
  audio.addEventListener('error', () => setStatus(''));
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
  if (autoplay) try { await audio.play(); } catch { setStatus(''); }
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
  if (picker) { const q=(root.querySelector('[data-playlist-search]')?.value||'').toLocaleLowerCase(); picker.innerHTML = `<option value="">${escape(spoken('選擇播放清單', 'Choose playlist'))}</option>${playlistOptions().filter(name=>!q||name.toLocaleLowerCase().includes(q)).map(name => `<option value="${escape(name)}">${escape(name)}</option>`).join('')}`; picker.value = activeView.type === 'playlist' ? activeView.value : ''; }
  const art = root.querySelector('[data-art]'); if (art && activeTrack) { art.src = activeTrack.art; art.alt = `${activeTrack.genre} artwork`; }
  root.querySelector('[data-genre-label]').innerHTML = activeTrack ? bilingual(GENRE_ZH[activeTrack.genre] || activeTrack.genre, activeTrack.genre) : '';
  root.querySelector('[data-title]').textContent = activeTrack?.title || spoken('沒有歌曲', 'No track available');
  root.querySelector('[data-artist]').textContent = activeTrack?.artist || '';
  root.querySelector('[data-bpm]').textContent = activeTrack?.bpm ? `≈ ${activeTrack.bpm} BPM` : '— BPM';
  const currentFavorite = root.querySelector('[data-favorite-current]');
  if (currentFavorite) { const favorite = isFavorite(activeTrack); currentFavorite.classList.toggle('is-active', favorite); currentFavorite.setAttribute('aria-pressed', String(favorite)); currentFavorite.innerHTML = `${favorite ? '♥' : '♡'} ${bilingual('收藏', 'Favorite')}`; }
  root.querySelector('[data-queue-title]').textContent = `${viewTitle(list)} · ${list.length}`;
  const edit = root.querySelector('[data-edit-playlist]'); if(edit) edit.hidden=activeView.type!=='playlist';
  const empty = root.querySelector('[data-music-empty]');
  if (empty) { empty.hidden = list.length > 0; empty.innerHTML = activeView.type === 'favorites' ? bilingual('尚未收藏歌曲。按歌曲旁的心形即可收藏。', 'No favorites yet. Use the heart beside a song.') : bilingual('這個播放清單尚未有歌曲。', 'This playlist is empty.'); }
  root.querySelector('[data-track-list]').innerHTML = list.map((row, index) => `<article draggable="${activeView.type==='favorites'||activeView.type==='playlist'}" data-song-key="${escape(songKey(row))}" class="music-track-card${rowKey(row) === rowKey(activeTrack) ? ' is-active' : ''}">
    <button type="button" class="music-track-main" data-track-card="${escape(rowKey(row))}"><img src="${escape(row.art)}" alt=""><span><strong>${escape(row.title)}</strong><small>${escape(row.artist)} · ≈ ${row.bpm || '—'} BPM</small></span><b>${String(index + 1).padStart(2, '0')}</b></button>
    <button type="button" class="music-song-action${isFavorite(row) ? ' is-active' : ''}" data-favorite-song="${escape(rowKey(row))}" aria-pressed="${isFavorite(row)}" aria-label="${escape(spoken('收藏歌曲', 'Favorite song'))}">${isFavorite(row) ? '♥' : '♡'}</button>
    <button type="button" class="music-song-action" ${activeView.type==='playlist'?'data-remove-playlist-song':'data-playlist-song'}="${escape(rowKey(row))}" aria-label="${escape(activeView.type==='playlist'?spoken('從播放清單移除','Remove from playlist'):spoken('加入播放清單', 'Add to playlist'))}">${activeView.type==='playlist'?'−':'＋'}</button>
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
    if (event.target.closest('[data-play-favorites]')) { activeView={type:'favorites',value:''}; const list=rowsForView(rows); if(list[0]) return setTrack(list[0],{autoplay:true}); }
    if (event.target.closest('[data-new-playlist]')) return createPlaylist();
    if (event.target.closest('[data-favorite-current]')) return toggleFavorite(activeTrack);
    if (event.target.closest('[data-add-current]')) return addSongToPlaylist(activeTrack);
    const favorite = event.target.closest('[data-favorite-song]'); if (favorite) return toggleFavorite(rows.find(row => rowKey(row) === favorite.dataset.favoriteSong));
    const playlist = event.target.closest('[data-playlist-song]'); if (playlist) return addSongToPlaylist(rows.find(row => rowKey(row) === playlist.dataset.playlistSong));
    const remove = event.target.closest('[data-remove-playlist-song]'); if(remove&&activeView.type==='playlist'){preferences.playlists[activeView.value]=(preferences.playlists[activeView.value]||[]).filter(id=>String(id)!==songKey(rows.find(row=>rowKey(row)===remove.dataset.removePlaylistSong)));savePreferences();return renderAll();}
    if(event.target.closest('[data-edit-playlist]')&&activeView.type==='playlist') return editPlaylist();
    const track = event.target.closest('[data-track-card]'); if (track) return setTrack(rows.find(row => rowKey(row) === track.dataset.trackCard), { autoplay: true });
    if (event.target.closest('[data-play]')) { if (!activeTrack) return; if (!audio.src) await setTrack(activeTrack); return audio.paused ? audio.play().catch(() => setStatus('')) : audio.pause(); }
    if (event.target.closest('[data-previous]')) return playOffset(-1);
    if (event.target.closest('[data-next]')) return playOffset(1);
    if (event.target.closest('[data-shuffle]')) { const list = rowsForView(rows); if (list.length) return setTrack(list[Math.floor(Math.random() * list.length)], { autoplay: true }); }
    if (event.target.closest('[data-repeat]')) { audio.loop = !audio.loop; event.target.closest('[data-repeat]').setAttribute('aria-pressed', String(audio.loop)); return; }
    if (event.target.closest('[data-window]')) {
      const playerDialog = root.closest('dialog.background-music-dialog');
      if (!playerDialog) return openMusic();
      playerDialog.classList.toggle('is-collapsed');
    }
  });
  root.querySelector('[data-music-language-picker]').addEventListener('change', event => { preferences.language = event.target.value; savePreferences(); renderAll(); });
  root.querySelector('[data-playlist-view]').addEventListener('change', event => { if (event.target.value) activeView = { type: 'playlist', value: event.target.value }; renderAll(); });
  root.querySelector('[data-playlist-search]').addEventListener('input',()=>renderAll());
  root.querySelector('[data-seek]').addEventListener('input', event => { audio.currentTime = Number(event.target.value) || 0; });
  root.querySelector('[data-volume]').addEventListener('input', event => { audio.volume = Number(event.target.value); });
  renderRoot(root, rows);
  let dragged='';
  root.querySelector('[data-track-list]').addEventListener('dragstart',event=>{dragged=event.target.closest('[data-song-key]')?.dataset.songKey||'';});
  root.querySelector('[data-track-list]').addEventListener('dragover',event=>{if(dragged)event.preventDefault();});
  root.querySelector('[data-track-list]').addEventListener('drop',event=>{const target=event.target.closest('[data-song-key]')?.dataset.songKey;if(!dragged||!target||dragged===target)return;const list=activeView.type==='favorites'?preferences.favorites:preferences.playlists[activeView.value];const from=list.indexOf(dragged),to=list.indexOf(target);if(from<0||to<0)return;list.splice(to,0,list.splice(from,1)[0]);savePreferences();dragged='';renderAll();});
}

function editPlaylist(){
  const old=activeView.value; const name=window.prompt('重新命名播放清單 / Rename playlist\n留空並確定即可刪除 / Leave blank to delete',old); if(name===null)return;
  const next=name.trim().slice(0,50); if(!next){if(confirm(`Delete “${old}”?`)){delete preferences.playlists[old];activeView={type:'genre',value:activeGenre};savePreferences();renderAll();}return;}
  if(next!==old){preferences.playlists[next]=preferences.playlists[old]||[];delete preferences.playlists[old];activeView={type:'playlist',value:next};savePreferences();renderAll();}
}

function makeFloating(panel){
  const grip=panel.querySelector('.music-floating-bar'); let drag=null;
  grip.addEventListener('pointerdown',event=>{if(event.target.closest('button'))return;const r=panel.getBoundingClientRect();drag={x:event.clientX-r.left,y:event.clientY-r.top};grip.setPointerCapture(event.pointerId);});
  grip.addEventListener('pointermove',event=>{if(!drag)return;panel.style.left=`${Math.max(0,Math.min(innerWidth-panel.offsetWidth,event.clientX-drag.x))}px`;panel.style.top=`${Math.max(0,Math.min(innerHeight-48,event.clientY-drag.y))}px`;panel.style.right='auto';panel.style.bottom='auto';});
  grip.addEventListener('pointerup',()=>drag=null);grip.addEventListener('pointercancel',()=>drag=null);
}

export async function openMusic() {
  ensureStyles();
  if (dialog?.isConnected) { if(!dialog.open)dialog.show();dialog.classList.remove('is-collapsed');return; }
  dialog = document.createElement('dialog'); dialog.className = 'background-music-dialog';
  dialog.innerHTML = `<div class="music-floating-bar"><strong>♫ ${escape(spoken('背景音樂','Background music'))}</strong><span><button type="button" data-collapse aria-label="Collapse">−</button><button type="button" data-close aria-label="${escape(spoken('關閉', 'Close'))}">×</button></span></div><div data-player></div>`;
  document.body.append(dialog); dialog.querySelector('[data-close]').onclick = () => dialog.close();dialog.querySelector('[data-collapse]').onclick=()=>dialog.classList.toggle('is-collapsed');
  dialog.show(); makeFloating(dialog); await mountMusic(dialog.querySelector('[data-player]'));
}

document.addEventListener('click', event => { if (event.target.closest('[data-edmund-music-header]')) openMusic().catch(console.error); });
const root = document.querySelector('[data-music-library]'); if (root) mountMusic(root).catch(error => root.textContent = error.message);
