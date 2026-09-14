import {initTimeMapper} from './execution-time-mapper.js?v=20260914-3';
import { formatTime, formatDelta, parseTime, flatten, sectionItems, expectedTotal, elapsed, transition, resizeRect } from './execution-speedrun-core.mjs?v=20260914-3';

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]);
const uuid = () => crypto.randomUUID();
const deltaClass = n => n < 0 ? 'ahead' : n > 0 ? 'behind' : 'neutral';
const terminal = run => run && ['completed', 'ended'].includes(run.status);
const active = () => state.run && !terminal(state.run);
const pageMode = document.body.dataset.speedrunPage || 'all';
const statusNames = { running:'正在挑戰', paused:'已暫停', completed:'挑戰完成', ended:'提前結束 · 已保留用時' };
const state = { client:null, role:'', token:'', user:null, meters:[], selected:null, run:null, queue:[], flushing:false, conflict:false, locked:false, storageKey:'', stats:{}, history:[], historyCount:0, draft:null, floating:false, saving:false, loadId:0, sortMode:'custom', libraryBusy:false, recordsFilter:null, deletion:null };
function message(text, kind = 'online') {
  $('[data-sync-bar]').hidden = false;
  $('[data-sync-bar]').dataset.state = kind;
  $('[data-sync]').textContent = text;
  $('[data-retry]').hidden = !state.queue.length || state.conflict;
  $('[data-export]').hidden = !state.queue.length;
  $('[data-latest]').hidden = !state.conflict;
}
async function rpc(name, params = {}) {
  const { data, error } = await state.client.rpc(name, { ...params, p_student_token:state.role === 'student' ? state.token : null, p_admin_token:state.role === 'admin' ? state.token : null });
  if (error) throw error;
  return data;
}
function persist() {
  try {
    if (!state.queue.length && !active()) localStorage.removeItem(state.storageKey);
    else localStorage.setItem(state.storageKey, JSON.stringify({ run:state.run, queue:state.queue }));
  } catch {
    message('此瀏覽器未能保留離線備份。請保持此頁開啟，直至顯示已儲存至資料庫。', 'error');
  }
}
async function flush() {
  if (state.flushing || state.conflict || !state.queue.length) return;
  state.flushing = true;
  try {
    while (state.queue.length) {
      const event = state.queue[0];
      message(`正在儲存 ${state.queue.length} 項計時操作…`, 'pending');
      const saved = await rpc(event.rpc, event.params);
      state.queue.shift();
      // Later local clicks already include this event, so do not rewind their display.
      if (!state.queue.length) state.run = saved;
      persist();
    }
    message('已儲存至資料庫 · 所有計時操作已同步');
    if (terminal(state.run)) {
      try { await load(state.selected?.id, false); }
      catch { message('計時已儲存至資料庫；紀錄暫時未能重新載入，請按「重新整理」。','pending'); }
    }
    renderLibrary(); renderMeter();
  } catch (error) {
    state.conflict = ['40001','42501','23505'].includes(error.code);
    message(state.conflict
      ? '另一視窗已更新此挑戰，或登入已過期。未同步紀錄已保留；可匯出備份並載入最新紀錄，或重新登入後再試。'
      : '暫時未能同步。計時操作已保留在此裝置，恢復連線後會自動重試；請勿清除瀏覽器資料。', 'error');
    renderControls();
  } finally { state.flushing = false; renderControls(); }
}
function queueEvent(name, params) {
  state.queue.push({ rpc:name, params });
  persist();
  void flush();
}
function exportRecovery() {
  const url = URL.createObjectURL(new Blob([JSON.stringify({run:state.run,events:state.queue},null,2)],{type:'application/json'}));
  const a = document.createElement('a'); a.href = url; a.download = `speedrun-recovery-${state.run?.id || 'records'}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(url),1000);
}
function startRun() {
  if (!state.selected || active() || state.queue.length || state.locked || state.conflict || state.saving) return;
  const now = new Date().toISOString();
  state.run = { id:uuid(), meter_id:state.selected.id, title:state.selected.title, sections:structuredClone(state.selected.sections), meter_version:state.selected.version, status:'running', elapsed_ms:0, splits:[], anchor_at:now, started_at:now, ended_at:null, revision:0 };
  queueEvent('execution_speedrun_start', { p_id:state.run.id, p_meter_id:state.selected.id, p_version:state.selected.version, p_at:now });
  renderMeter(); renderLibrary();
}
function act(action) {
  if (!active() || state.locked || state.conflict) return;
  const now = Date.now(), old = state.run;
  try { state.run = transition(old, action, now); } catch { return; }
  queueEvent('execution_speedrun_event', { p_id:uuid(), p_run_id:old.id, p_action:action, p_revision:old.revision, p_elapsed_ms:state.run.elapsed_ms, p_at:new Date(now).toISOString() });
  renderMeter(); renderLibrary();
  if (action === 'split') $('[data-splits] .current')?.scrollIntoView({ block:'nearest', behavior:'instant' });
}
async function load(meterId = null, restoreRun = false, append = false) {
  const request = ++state.loadId;
  const data = await rpc('execution_speedrun_load', { p_meter_id:meterId, p_offset:append ? state.history.length : 0 });
  if (request !== state.loadId) return;
  state.meters = data.meters;
  if (restoreRun && !state.queue.length) state.run = data.active;
  const id = active() ? state.run.meter_id : data.selected_id;
  state.selected = state.meters.find(m => m.id === id) || null;
  if (pageMode === 'favourites' && !active() && !meterId && !state.selected?.favourite) {
    const favourite = state.meters.find(m => m.favourite);
    if (favourite) return load(favourite.id,restoreRun,append);
    state.selected = null;
  }
  state.stats = data.stats || {};
  if (pageMode === 'records') {
    const records = await rpc('execution_speedrun_records',{p_meter_id:state.recordsFilter,p_offset:append ? state.history.length : 0});
    if (request !== state.loadId) return;
    data.history = records.history; data.history_count = records.history_count;
    const filter = $('[data-records-filter]');
    filter.innerHTML = '<option value="">所有計時器</option>' + state.meters.map(m => `<option value="${escape(m.id)}">${escape(m.title)}</option>`).join('');
    filter.value = state.recordsFilter || '';
  }
  state.history = append ? [...state.history, ...data.history] : data.history;
  state.historyCount = data.history_count;
  renderLibrary(); renderHistory(); renderStats(); renderMeter();
}
function orderedMeters() {
  const custom = [...state.meters].sort((a,b) => (a.sort_order||0)-(b.sort_order||0) || String(b.updated_at||'').localeCompare(String(a.updated_at||'')) || a.id.localeCompare(b.id));
  return state.sortMode === 'alpha' ? custom.sort((a,b) => new Intl.Collator('en',{numeric:true,sensitivity:'base'}).compare(a.title,b.title)) : custom;
}
function renderLibrary() {
  const meters = orderedMeters().filter(m => pageMode !== 'favourites' || m.favourite);
  $('[data-meter-count]').textContent = meters.length;
  $('[data-library]').innerHTML = meters.length ? meters.map((m,i) => `<article class="library-entry"><button type="button" class="library-item" data-meter-id="${escape(m.id)}" aria-current="${m.id === state.selected?.id}" ${active() && m.id !== state.run.meter_id || state.queue.length ? 'disabled' : ''}><strong>${escape(m.title)}</strong><small>${flatten(m.sections).length} 個計時項目 · ${formatTime(expectedTotal(m.sections))}</small></button><div class="library-actions"><button type="button" data-library-action="favourite" data-id="${escape(m.id)}" aria-pressed="${!!m.favourite}" aria-label="${m.favourite ? '取消最愛' : '加入最愛'}：${escape(m.title)}" ${state.libraryBusy ? 'disabled' : ''}>${m.favourite ? '★' : '☆'}</button><button type="button" data-library-action="up" data-id="${escape(m.id)}" aria-label="向上移動：${escape(m.title)}" ${state.libraryBusy || state.sortMode !== 'custom' || i===0 ? 'disabled' : ''}>↑</button><button type="button" data-library-action="down" data-id="${escape(m.id)}" aria-label="向下移動：${escape(m.title)}" ${state.libraryBusy || state.sortMode !== 'custom' || i===meters.length-1 ? 'disabled' : ''}>↓</button><button type="button" class="remove" data-delete-meter="${escape(m.id)}" aria-label="永久刪除：${escape(m.title)}" ${state.queue.length || state.libraryBusy ? 'disabled' : ''}>刪除</button></div></article>`).join('') : `<p class="muted">${pageMode === 'favourites' ? '尚未加入最愛。到「全部計時器」按 ☆ 即可收藏。' : '尚未建立計時器。'}</p>`;
  $('[data-empty]').hidden = !!state.selected;
  $('[data-selected]').hidden = !state.selected;
  $$('[data-new]').forEach(b => { b.disabled = !!active() || !!state.queue.length || state.locked || state.conflict; });
  $('[data-edit]').disabled = !!active() || !!state.queue.length || state.locked || state.conflict;
  if (state.selected) {
    $('[data-selected-title]').textContent = state.selected.title;
    $('[data-version]').textContent = `版本 ${state.selected.version} · ${state.selected.sections.length} 個主項目 · ${flatten(state.selected.sections).length} 個計時項目`;
  }
  if (pageMode === 'records') { $('[data-selected]').hidden = false; $('[data-empty]').hidden = true; }
}
function renderControls() {
  const running = state.run?.status === 'running', paused = state.run?.status === 'paused';
  $('[data-start]').hidden = !!active();
  $('[data-start]').textContent = terminal(state.run) ? '再次挑戰' : '開始計時';
  $('[data-start]').disabled = !state.selected || !!state.queue.length || state.locked || state.conflict || state.saving;
  $('[data-split]').hidden = !running;
  $('[data-pause]').hidden = !active();
  $('[data-pause]').textContent = paused ? '繼續' : '暫停';
  $('[data-end]').hidden = !active();
  ['split','pause','end'].forEach(s => { $(`[data-${s}]`).disabled = state.locked || state.conflict; });
  if (active()) $('[data-split]').textContent = state.run.splits.length + 1 === flatten(state.run.sections).length ? '完成最後一項 ✓' : '完成 → 下一項';
}
function renderMeter() {
  renderControls();
  if (!state.selected || pageMode === 'records') return;
  const model = state.run?.meter_id === state.selected.id ? state.run : state.selected;
  const run = model === state.run ? state.run : null;
  $('[data-race-title]').textContent = model.title;
  $('[data-run-status]').textContent = state.locked ? '另一視窗正在使用此計時器' : run ? statusNames[run.status] : '準備開始';
  let index = 0;
  $('[data-splits]').innerHTML = model.sections.map(section => {
    const startIndex = index;
    const rows = sectionItems(section).map(item => {
      const i = index++, split = run?.splits[i];
      return `<div class="split-row ${!section.items.length ? 'standalone' : ''} ${split ? 'done' : active() && i === run.splits.length ? 'current' : ''}" data-split-index="${i}"><span class="split-name">${escape(item.title)}</span><span>${formatTime(item.expected_ms)}</span><span data-actual>${split ? formatTime(split.elapsed_ms, true) : '—'}</span><b data-delta class="${split ? deltaClass(split.elapsed_ms - item.expected_ms) : ''}">${split ? formatDelta(split.elapsed_ms - item.expected_ms) : '—'}</b></div>`;
    }).join('');
    if (!section.items.length) return rows;
    return `<div class="section-row" data-section-start="${startIndex}" data-section-count="${section.items.length}"><span class="split-name">${escape(section.title)}</span><span>${formatTime(section.items.reduce((n,i) => n+i.expected_ms,0))}</span><span data-section-actual>—</span><b data-section-delta>—</b></div>${rows}`;
  }).join('');
  renderStats(); tick();
}
function tick() {
  if (!state.selected || pageMode === 'records') return;
  const run = state.run?.meter_id === state.selected.id ? state.run : null;
  const total = elapsed(run), items = flatten(run?.sections || state.selected.sections);
  const splits = run?.splits || [];
  const finished = splits.reduce((n,s) => n+s.elapsed_ms,0), current = total - finished;
  const expected = items.slice(0, splits.length + (run && !terminal(run) || run?.status === 'ended' ? 1 : 0)).reduce((n,i) => n+i.expected_ms,0);
  const time = formatTime(total, true).split('.');
  $('[data-clock]').innerHTML = `${time[0]}<span>.${time[1]}</span>`;
  $('[data-clock]').className = `big-clock ${run ? deltaClass(total - expected) : ''}`;
  const diff = $('[data-total-delta]'); diff.textContent = run ? formatDelta(total - expected) : '—'; diff.className = run ? deltaClass(total - expected) : '';
  $('[data-segment-clock]').textContent = run?.status === 'completed' ? '完成' : formatTime(current, true);
  if (run && splits.length < items.length) {
    const row = $(`[data-split-index="${splits.length}"]`);
    row.querySelector('[data-actual]').textContent = formatTime(current, true);
    const d = current - items[splits.length].expected_ms;
    row.querySelector('[data-delta]').textContent = formatDelta(d);
    row.querySelector('[data-delta]').className = deltaClass(d);
  }
  $$('[data-section-start]').forEach(row => {
    const start = Number(row.dataset.sectionStart), end = start + Number(row.dataset.sectionCount);
    const upto = Math.min(end, splits.length + (run && run.status !== 'completed' ? 1 : 0));
    if (!run || upto <= start) return;
    const actual = splits.slice(start,end).reduce((n,s) => n+s.elapsed_ms,0) + (splits.length >= start && splits.length < end ? current : 0);
    const target = items.slice(start, upto).reduce((n,i) => n+i.expected_ms,0);
    row.querySelector('[data-section-actual]').textContent = formatTime(actual, true);
    row.querySelector('[data-section-delta]').textContent = formatDelta(actual-target);
    row.querySelector('[data-section-delta]').className = deltaClass(actual-target);
  });
  const best = state.stats.best_segments || [];
  const remaining = items.slice(splits.length).map((_,i) => best[splits.length+i]);
  const possible = !run || run.meter_version !== state.selected.version || remaining.some(v => v == null) ? null : finished + remaining.reduce((n,v,i) => n + (i === 0 ? Math.max(v,current) : v),0);
  $('[data-best-possible]').textContent = run?.status === 'ended' ? '—' : formatTime(possible, true);
}
function renderStats() {
  for (const name of ['completed','fastest','average','slowest']) $(`[data-stat="${name}"]`).textContent = name === 'completed' ? state.stats[name] || 0 : formatTime(state.stats[name], true);
  $('[data-personal-best]').textContent = formatTime(state.stats.fastest, true);
  const best = state.stats.best_segments || [];
  $('[data-best-sum]').textContent = formatTime(state.selected && best.length === flatten(state.selected.sections).length ? best.reduce((a,b) => a+b,0) : null, true);
}
function renderHistory() {
  $('[data-history]').innerHTML = state.history.length ? state.history.map(run => {
    const target = expectedTotal(run.sections), complete = run.status === 'completed';
    const shownRun = {...run,elapsed_ms:elapsed(run)};
    const date = new Intl.DateTimeFormat('zh-HK',{dateStyle:'medium',timeStyle:'medium'}).format(new Date(run.started_at));
    return `<details><summary><span>${escape(run.title)} · ${escape(date)} · 版本 ${run.meter_version} · ${run.source === 'mapper' ? 'Time Mapper · ' : ''}${complete ? '完整挑戰' : statusNames[run.status]} ▾</span><b>${formatTime(shownRun.elapsed_ms,true)} <span class="${complete ? deltaClass(run.elapsed_ms-target) : ''}">${complete ? formatDelta(run.elapsed_ms-target) : `${run.splits.length}/${flatten(run.sections).length} 項完成`}</span></b></summary><div class="history-table-wrap"><table><thead><tr><th>主項目 / 子項目</th><th>預計</th><th>實際</th><th>差異</th></tr></thead><tbody>${historyRows(shownRun)}</tbody></table></div><button type="button" class="remove delete-attempt" data-delete-run="${escape(run.id)}" ${state.queue.length ? 'disabled' : ''}>永久刪除此嘗試</button></details>`;
  }).join('') : '<p class="muted">此範圍內暫時沒有挑戰紀錄。</p>';
  $('[data-more]').hidden = state.history.length >= state.historyCount;
}
function historyRows(run) {
  let index = 0;
  const partial = run.elapsed_ms - run.splits.reduce((n,s) => n+s.elapsed_ms,0);
  return run.sections.map(section => {
    const items = sectionItems(section);
    const start = index, end = start + items.length;
    const finished = run.splits.slice(start,end);
    const includesPartial = run.status !== 'completed' && run.splits.length >= start && run.splits.length < end;
    const actual = finished.length || includesPartial ? finished.reduce((n,s) => n+s.elapsed_ms,0) + (includesPartial ? partial : 0) : null;
    const target = items.reduce((n,i) => n+i.expected_ms,0);
    const diff = finished.length === items.length ? actual-target : null;
    const heading = section.items.length ? `<tr><th>${escape(section.title)}</th><th>${formatTime(target)}</th><th>${formatTime(actual,true)}</th><th class="${diff == null ? '' : deltaClass(diff)}">${formatDelta(diff)}</th></tr>` : '';
    return heading + items.map(item => {
      const i = index++, isPartial = run.status !== 'completed' && i === run.splits.length;
      const actual = run.splits[i]?.elapsed_ms ?? (isPartial ? partial : null), diff = actual == null ? null : actual-item.expected_ms;
      return `<tr><td>${escape(item.title)}${isPartial ? '（未完成）' : actual == null ? '（未開始）' : ''}</td><td>${formatTime(item.expected_ms)}</td><td>${formatTime(actual,true)}</td><td class="${diff == null ? '' : deltaClass(diff)}">${formatDelta(diff)}${isPartial ? ' *' : ''}</td></tr>`;
    }).join('');
  }).join('') + (run.status === 'ended' ? '<tr><td colspan="4">* 未完成子項目的差異僅表示已用時間，並非完成成績。</td></tr>' : '');
}
function newItem() { return { id:uuid(), title:'', expected_text:'5:00' }; }
function newSection() { return { id:uuid(), title:'', expected_text:'5:00', items:[newItem()] }; }
function openEditor(edit = false) {
  if (active() || state.queue.length || state.locked) return;
  state.draft = edit ? structuredClone(state.selected) : { id:uuid(), title:'', version:0, sections:[newSection()] };
  state.draft.sections.forEach(s => { const ms = s.expected_ms || (s.items.length && s.items.every(i => i.expected_ms) ? expectedTotal([s]) : 300000); s.expected_text = `${Math.floor(ms / 60000)}:${String(ms / 1000 % 60).padStart(2,'0')}`; });
  state.draft.sections.forEach(s => s.items.forEach(i => { i.expected_text ||= `${Math.floor(i.expected_ms / 60000)}:${String(i.expected_ms / 1000 % 60).padStart(2,'0')}`; }));
  $('[data-editor]').hidden = false; $('[data-meter-area]').hidden = true;
  $('#editor-heading').textContent = edit ? '編輯計時器' : '建立計時器';
  $('[name=title]').value = state.draft.title;
  renderEditor(); $('[name=title]').focus();
}
function renderEditor() {
  $('[data-sections]').innerHTML = state.draft.sections.map((section, s) => `<section class="section-editor"><header><label>主項目 ${s+1}<input required maxlength="160" data-section-title="${s}" value="${escape(section.title)}" placeholder="例如：閱讀理解"></label><button type="button" class="remove" data-remove-section="${s}" aria-label="移除主項目 ${s+1}">移除</button></header>${!section.items.length ? `<label class="standalone-time">主項目預計時間（分鐘:秒）<input required pattern="[0-9]{1,4}:[0-5][0-9]" data-section-time="${s}" value="${escape(section.expected_text || '5:00')}"></label>` : ''}${section.items.map((item,i) => `<div class="subsection-editor"><label>子項目 ${i+1}<input required maxlength="160" data-item-title="${s}:${i}" value="${escape(item.title)}" placeholder="例如：閱讀文章"></label><label>預計 分:秒<input required inputmode="text" pattern="[0-9]{1,4}:[0-5][0-9]" data-item-time="${s}:${i}" value="${escape(item.expected_text)}" aria-label="子項目 ${i+1} 預計時間"></label><button type="button" class="remove" data-remove-item="${s}:${i}" aria-label="移除子項目 ${i+1}">×</button></div>`).join('')}<footer><button type="button" data-add-item="${s}">＋ 新增子項目</button><span>主項目合計 <b data-section-total="${s}">—</b></span></footer></section>`).join('');
  updateEditorTotals();
}
function updateEditorTotals() {
  let total = 0, valid = true;
  state.draft.sections.forEach((section,s) => {
    try { const sum = section.items.length ? section.items.reduce((n,i) => n+parseTime(i.expected_text),0) : parseTime(section.expected_text || '5:00'); total += sum; $(`[data-section-total="${s}"]`).textContent = formatTime(sum); }
    catch { valid = false; $(`[data-section-total="${s}"]`).textContent = '—'; }
  });
  $('[data-editor-total]').textContent = valid ? formatTime(total) : '—';
}
function closeEditor() { state.draft = null; $('[data-editor]').hidden = true; $('[data-meter-area]').hidden = false; }
async function saveMeter(event) {
  event.preventDefault(); if (state.saving) return;
  try {
    const sections = state.draft.sections.map(s => ({ id:s.id, title:s.title.trim(), ...(!s.items.length ? {expected_ms:parseTime(s.expected_text || '5:00')} : {}), items:s.items.map(i => ({ id:i.id, title:i.title.trim(), expected_ms:parseTime(i.expected_text) })) }));
    if (!sections.length || sections.some(s => !s.title || s.items.some(i => !i.title)) || !$('[name=title]').value.trim()) throw new Error('請填寫所有名稱及預計時間。');
    state.saving = true; $('[data-save]').disabled = true;
    const meter = await rpc('execution_speedrun_meter_save',{ p_id:state.draft.id, p_title:$('[name=title]').value.trim(), p_sections:sections, p_version:state.draft.version });
    if (pageMode === 'favourites') await rpc('execution_speedrun_library_update',{p_id:meter.id,p_action:'favourite',p_favourite:true});
    closeEditor(); state.run = null; await load(meter.id); message('計時器已儲存至資料庫，可以隨時再次使用。');
  } catch (error) { message(error.message || '未能儲存計時器，請稍後重試。','error'); }
  finally { state.saving = false; $('[data-save]').disabled = false; renderControls(); }
}
function applyGeometry(rect) { const meter = $('[data-race-meter]'); for (const key of ['left','top','width','height']) meter.style[key] = `${rect[key]}px`; }
function keepOnScreen() {
  updateColumnHint();
  if (!state.floating) return;
  const rect = $('[data-race-meter]').getBoundingClientRect(), width = Math.min(rect.width,innerWidth-16), height = Math.min(rect.height,innerHeight-16);
  applyGeometry({ width,height,left:Math.max(8,Math.min(rect.left,innerWidth-width-8)),top:Math.max(8,Math.min(rect.top,innerHeight-height-8)) });
}
function toggleFloat() {
  state.floating = !state.floating;
  const meter = $('[data-race-meter]'); meter.classList.toggle('floating',state.floating);
  $('[data-float]').textContent = state.floating ? '還原 ↙' : '浮動小視窗 ↗';
  $$('[data-corner]').forEach(b => { b.hidden = !state.floating; });
  if (state.floating) {
    const width = Math.min(440,innerWidth-16), height = Math.min(650,innerHeight-32);
    applyGeometry({ left:innerWidth-width-16, top:Math.max(8,Math.min(100,innerHeight-height-16)),width,height });
    $('[data-meter-home]').style.minHeight = '80px';
  } else { for (const key of ['left','top','width','height']) meter.style.removeProperty(key); $('[data-meter-home]').style.minHeight = ''; }
}
function pointerGeometry(event, corner = null) {
  if (!state.floating || event.button !== 0 || !corner && event.target.closest('button')) return;
  event.preventDefault();
  const handle = event.currentTarget, rect = $('[data-race-meter]').getBoundingClientRect(), x = event.clientX, y = event.clientY;
  handle.setPointerCapture(event.pointerId);
  const move = e => {
    const dx = e.clientX-x, dy = e.clientY-y;
    applyGeometry(corner ? resizeRect(rect,corner,dx,dy,{width:innerWidth,height:innerHeight}) : { width:rect.width,height:rect.height,left:Math.max(8,Math.min(innerWidth-rect.width-8,rect.left+dx)),top:Math.max(8,Math.min(innerHeight-rect.height-8,rect.top+dy)) });
  };
  const stop = () => { handle.removeEventListener('pointermove',move); handle.removeEventListener('pointerup',stop); handle.removeEventListener('pointercancel',stop); };
  handle.addEventListener('pointermove',move); handle.addEventListener('pointerup',stop); handle.addEventListener('pointercancel',stop);
}
function bind() {
  $$('[data-new]').forEach(b => b.addEventListener('click',() => openEditor()));
  $('[data-edit]').addEventListener('click',() => openEditor(true));
  $('[data-cancel-edit]').addEventListener('click',closeEditor);
  $('[data-meter-form]').addEventListener('submit',saveMeter);
  $('[data-add-section]').addEventListener('click',() => { if (state.draft.sections.length >= 50) return message('最多可建立 50 個主項目。','error'); state.draft.sections.push(newSection()); renderEditor(); });
  $('[data-sections]').addEventListener('input',e => {
    const el = e.target;
    if (el.dataset.sectionTime != null) state.draft.sections[Number(el.dataset.sectionTime)].expected_text = el.value;
    if (el.dataset.sectionTitle != null) state.draft.sections[Number(el.dataset.sectionTitle)].title = el.value;
    for (const key of ['itemTitle','itemTime']) if (el.dataset[key]) { const [s,i] = el.dataset[key].split(':').map(Number); state.draft.sections[s].items[i][key === 'itemTitle' ? 'title' : 'expected_text'] = el.value; }
    updateEditorTotals();
  });
  $('[data-sections]').addEventListener('click',e => {
    const el = e.target.closest('button'); if (!el) return;
    if (el.dataset.addItem != null) { const items = state.draft.sections[Number(el.dataset.addItem)].items; if (items.length >= 100 || state.draft.sections.reduce((n,s) => n+s.items.length,0) >= 500) return message('最多 500 個子項目，每個主項目最多 100 個。','error'); items.push(newItem()); }
    if (el.dataset.removeSection != null) state.draft.sections.splice(Number(el.dataset.removeSection),1);
    if (el.dataset.removeItem) { const [s,i] = el.dataset.removeItem.split(':').map(Number); state.draft.sections[s].items.splice(i,1); }
    renderEditor();
  });
  $('[data-library]').addEventListener('click',e => { if (e.target.closest('[data-library-action],[data-delete-meter]')) return; const b = e.target.closest('[data-meter-id]'); if (!b || active() || state.queue.length) return; closeEditor(); state.run = null; void load(b.dataset.meterId).catch(error => message(error.message,'error')); });
  $('[data-start]').addEventListener('click',startRun);
  $('[data-split]').addEventListener('click',() => act('split'));
  $('[data-pause]').addEventListener('click',() => act(state.run.status === 'paused' ? 'resume' : 'pause'));
  $('[data-end]').addEventListener('click',() => $('[data-end-dialog]').showModal());
  $('[data-cancel-end]').addEventListener('click',() => $('[data-end-dialog]').close());
  $('[data-confirm-end]').addEventListener('click',() => { $('[data-end-dialog]').close(); act('end'); });
  $('[data-retry]').addEventListener('click',() => void flush());
  $('[data-export]').addEventListener('click',exportRecovery);
  $('[data-latest]').addEventListener('click',async () => {
    if (!state.conflict) return;
    const pending = state.queue, run = state.run;
    exportRecovery();
    try {
      localStorage.setItem(`${state.storageKey}:conflict:${uuid()}`,JSON.stringify({run,queue:pending}));
      state.queue = []; state.conflict = false;
      await load(state.selected?.id,true); persist();
      message('已載入資料庫的最新紀錄；未同步計時另存為下載檔及此裝置的備份。');
    } catch {
      state.queue = pending; state.run = run; state.conflict = true;
      message('未能載入最新紀錄。備份仍然保留；請重新登入後再試。','error');
      renderLibrary(); renderMeter();
    }
  });
  $('[data-refresh]').addEventListener('click',() => { if (state.queue.length) return void flush(); void load(state.selected?.id,true).catch(e => message(e.message,'error')); });
  $('[data-more]').addEventListener('click',async () => { $('[data-more]').disabled = true; try { await load(state.selected?.id,false,true); } catch(e) { message(e.message,'error'); } finally { $('[data-more]').disabled = false; } });
  $('[data-float]').addEventListener('click',toggleFloat);
  $('[data-drag]').addEventListener('pointerdown',e => pointerGeometry(e));
  $$('[data-corner]').forEach(handle => {
    handle.addEventListener('pointerdown',e => pointerGeometry(e,handle.dataset.corner));
    handle.addEventListener('keydown',e => { if (!e.key.startsWith('Arrow')) return; e.preventDefault(); applyGeometry(resizeRect($('[data-race-meter]').getBoundingClientRect(),handle.dataset.corner,e.key === 'ArrowRight' ? 10 : e.key === 'ArrowLeft' ? -10 : 0,e.key === 'ArrowDown' ? 10 : e.key === 'ArrowUp' ? -10 : 0,{width:innerWidth,height:innerHeight})); });
  });
  $('[data-drag]').addEventListener('keydown',e => { if (!state.floating || e.target !== e.currentTarget || !e.key.startsWith('Arrow')) return; e.preventDefault(); const r = $('[data-race-meter]').getBoundingClientRect(); applyGeometry({left:r.left+(e.key === 'ArrowRight' ? 10 : e.key === 'ArrowLeft' ? -10 : 0),top:r.top+(e.key === 'ArrowDown' ? 10 : e.key === 'ArrowUp' ? -10 : 0),width:r.width,height:r.height}); keepOnScreen(); });
  window.addEventListener('resize',keepOnScreen);
  window.addEventListener('online',() => void flush());
  window.addEventListener('beforeunload',e => { if (state.queue.length) { e.preventDefault(); e.returnValue = ''; } });
  document.addEventListener('visibilitychange',() => { tick(); if (!document.hidden) void flush(); });
  document.addEventListener('keydown',e => {
    if (pageMode === 'records' || $('[data-delete-dialog]').open) return;
    if (e.repeat || e.ctrlKey || e.metaKey || e.altKey || e.target.closest('input,textarea,select,button,a,[contenteditable=true]') || $('[data-end-dialog]').open || state.draft || !active()) return;
    if (e.code === 'Space' && state.run.status === 'running') { e.preventDefault(); act('split'); }
    if (e.key.toLowerCase() === 'p') { e.preventDefault(); act(state.run.status === 'paused' ? 'resume' : 'pause'); }
  });
  setInterval(tick,50);
  setInterval(() => { if (navigator.onLine) void flush(); },15000);
}
function bindLibrary() {
  $$('[data-page]').forEach(link => { if (link.dataset.page === pageMode) link.setAttribute('aria-current','page'); });
  $('[data-sort]').addEventListener('change',e => {
    state.sortMode = e.target.value;
    try { localStorage.setItem(`${state.storageKey}:sort`,state.sortMode); } catch {}
    renderLibrary();
  });
  $('[data-records-filter]').addEventListener('change',async e => {
    state.recordsFilter = e.target.value || null;
    try { await load(state.selected?.id); } catch(error) { message(error.message,'error'); }
  });
  $('[data-library]').addEventListener('click',async e => {
    const remove = e.target.closest('[data-delete-meter]');
    if (remove) return confirmDeletion('meter',remove.dataset.deleteMeter);
    const button = e.target.closest('[data-library-action]');
    if (!button || state.libraryBusy) return;
    const meter = state.meters.find(m => m.id === button.dataset.id);
    if (!meter) return;
    state.libraryBusy = true; renderLibrary();
    try {
      await rpc('execution_speedrun_library_update',{p_id:meter.id,p_action:button.dataset.libraryAction,p_favourite:button.dataset.libraryAction === 'favourite' ? !meter.favourite : pageMode === 'favourites'});
      await load(pageMode === 'favourites' && button.dataset.libraryAction === 'favourite' ? null : state.selected?.id);
      message('收藏與自訂排序已儲存至帳戶。');
    } catch(error) { message(error.message || '未能更新計時器。','error'); }
    finally { state.libraryBusy = false; renderLibrary(); }
  });
  $('[data-history]').addEventListener('click',e => {
    const button = e.target.closest('[data-delete-run]');
    if (button) confirmDeletion('run',button.dataset.deleteRun);
  });
  $('[data-cancel-delete]').addEventListener('click',() => $('[data-delete-dialog]').close());
  $('[data-confirm-delete]').addEventListener('click',async () => {
    if (!state.deletion || state.queue.length) return;
    const {kind,record} = state.deletion;
    $('[data-confirm-delete]').disabled = true; $('[data-delete-error]').hidden = true;
    try {
      await rpc('execution_speedrun_delete',{p_id:record.id,p_kind:kind,p_revision:kind === 'meter' ? record.version : record.revision});
      if (kind === 'meter' ? state.run?.meter_id === record.id : state.run?.id === record.id) state.run = null;
      // Remove the same deleted attempt's local recovery copies, never other attempts.
      for (const key of Object.keys(localStorage).filter(k => k.startsWith(state.storageKey))) {
        try {
          const recovery = JSON.parse(localStorage.getItem(key));
          if (recovery?.run && (kind === 'meter' ? recovery.run.meter_id === record.id : recovery.run.id === record.id)) localStorage.removeItem(key);
        } catch {}
      }
      if (kind === 'meter' && state.recordsFilter === record.id) state.recordsFilter = null;
      if (state.floating && !state.run) toggleFloat();
      if (kind === 'meter' && state.draft?.id === record.id) closeEditor();
      $('[data-delete-dialog]').close(); state.deletion = null;
      try { await load(kind === 'meter' && state.selected?.id === record.id ? null : state.selected?.id,true); }
      catch { message('刪除已完成；請重新整理以載入最新紀錄。','pending'); return; }
      message(kind === 'meter' ? '計時器及其所有嘗試、分段與操作紀錄已永久刪除。' : '此嘗試及其分段、操作紀錄已永久刪除；統計已重新計算。');
    } catch(error) { $('[data-delete-error]').textContent = error.message || '刪除未完成，請重新整理後再試。'; $('[data-delete-error]').hidden = false; message('刪除未完成，請查看確認視窗。','error'); }
    finally { $('[data-confirm-delete]').disabled = false; }
  });
}
function confirmDeletion(kind,id) {
  if (state.queue.length) return message('請先完成同步，再刪除紀錄。','pending');
  const record = (kind === 'meter' ? state.meters : state.history).find(r => r.id === id);
  if (!record) return;
  state.deletion = {kind,record}; $('[data-delete-error]').hidden = true;
  $('[data-delete-title]').textContent = kind === 'meter' ? `永久刪除「${record.title}」？` : `永久刪除此嘗試？`;
  $('[data-delete-copy]').textContent = kind === 'meter'
    ? '這會刪除此計時器及所有歷史嘗試、分段和操作紀錄。進行中的挑戰也會停止，無法復原。'
    : `${record.title} · ${new Date(record.started_at).toLocaleString('zh-HK')}。這次嘗試的所有分段及操作紀錄將完全移除，並重新計算最佳與平均成績。進行中的挑戰也會停止，無法復原。`;
  $('[data-delete-dialog]').showModal();
}
function updateColumnHint() {
  const scroll = $('.meter-scroll');
  $('[data-column-overflow]').hidden = scroll.scrollWidth <= scroll.clientWidth + 2;
}
function bindColumns() {
  const meter = $('[data-race-meter]'), header = $('.split-labels');
  const storageKey = `${state.storageKey}:column-widths`;
  if (window.ResizeObserver) new ResizeObserver(updateColumnHint).observe(meter);
  function apply(widths,save = false) {
    if (!Array.isArray(widths) || widths.length !== 4 || widths.some(v => !Number.isFinite(v) || v < 60 || v > 1600)) return;
    meter.style.setProperty('--speedrun-columns',widths.map(v => `${v}px`).join(' '));
    meter.style.setProperty('--speedrun-table-min',`${widths.reduce((n,v) => n+v,0)+74}px`);
    $$('[data-column-resize]').forEach((handle,i) => handle.setAttribute('aria-valuenow',Math.round(widths[i])));
    updateColumnHint();
    if (save) try { localStorage.setItem(storageKey,JSON.stringify(widths)); } catch {}
  }
  function widths() { return [...header.children].map((el,i) => Math.max(i === 0 ? 100 : 60,Math.round(el.getBoundingClientRect().width))); }
  try { apply(JSON.parse(localStorage.getItem(storageKey))); } catch {}
  $$('[data-column-resize]').forEach((handle,index) => {
    handle.addEventListener('pointerdown',e => {
      if (e.button !== 0) return;
      e.preventDefault(); e.stopPropagation();
      const original = widths(), start = e.clientX;
      const changed = [...original];
      handle.setPointerCapture(e.pointerId);
      const move = ev => { changed[index] = Math.max(index === 0 ? 100 : 60,Math.min(1600,original[index]+ev.clientX-start)); apply(changed); };
      const stop = () => { apply(changed,true); handle.removeEventListener('pointermove',move); handle.removeEventListener('pointerup',stop); handle.removeEventListener('pointercancel',stop); };
      handle.addEventListener('pointermove',move); handle.addEventListener('pointerup',stop); handle.addEventListener('pointercancel',stop);
    });
    handle.addEventListener('keydown',e => {
      if (!['ArrowLeft','ArrowRight'].includes(e.key)) return;
      e.preventDefault(); const changed = widths(); changed[index] = Math.max(index === 0 ? 100 : 60,Math.min(1600,changed[index]+(e.key === 'ArrowRight' ? 10 : -10))); apply(changed,true);
    });
  });
  $('[data-reset-columns]').addEventListener('click',() => {
    meter.style.removeProperty('--speedrun-columns'); meter.style.removeProperty('--speedrun-table-min');
    try { localStorage.removeItem(storageKey); } catch {}
    $$('[data-column-resize]').forEach(handle => handle.removeAttribute('aria-valuenow'));
    updateColumnHint();
  });
}

async function init() {
  try {
    const config = window.EDMUND_EXECUTION_CONFIG, settings = window.EDMUND_SUPABASE;
    state.client = window.supabase.createClient(settings.url,settings.anonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
    const { data, error } = await state.client.auth.getSession(); if (error) throw error;
    if (!data.session) { const { error } = await state.client.auth.signInAnonymously(); if (error) throw error; }
    let own; try { own = JSON.parse(sessionStorage.getItem(config.sessionKey) || 'null'); } catch {}
    const universal = window.EdmundSystemNav?.getStudentSession?.();
    const candidate = own?.role === 'admin' ? own : universal?.role === 'student' ? universal : own;
    if (!candidate?.token) { $('[data-loading]').hidden = true; $('[data-login-needed]').hidden = false; $('[data-connection-status]').textContent = '請登入'; return; }
    const result = await state.client.rpc(candidate.role === 'admin' ? config.adminMeRpc : config.studentProfileRpc,candidate.role === 'admin' ? {p_admin_token:candidate.token} : {p_token:candidate.token});
    if (result.error) throw result.error;
    const user = result.data?.[0];
    if (!user?.id) { $('[data-loading]').hidden = true; $('[data-login-needed]').hidden = false; return; }
    state.role = candidate.role; state.token = user.session_token || candidate.token; state.user = user;
    state.storageKey = `edmund-speedrun-recovery-v1:${state.role}:${user.id}`;
    if (pageMode !== 'records' && navigator.locks) await new Promise(resolve => {
      navigator.locks.request(state.storageKey,{ifAvailable:true},lock => { state.locked = !lock; resolve(); return lock ? new Promise(() => {}) : undefined; }).catch(() => { state.locked = true; resolve(); });
    });
    let recovery; try { recovery = JSON.parse(localStorage.getItem(state.storageKey) || 'null'); } catch {}
    if (pageMode !== 'records' && !state.locked && recovery?.queue?.length && recovery.run) { state.queue = recovery.queue; state.run = recovery.run; }
    try { state.sortMode = localStorage.getItem(`${state.storageKey}:sort`) || 'custom'; } catch {}
    $('[data-sort]').value = state.sortMode;
    await load(state.run?.meter_id || new URLSearchParams(location.search).get('meter'),true);
    $('[data-loading]').hidden = true; $('[data-app]').hidden = false;
    $('[data-user-pill]').hidden = false; $('[data-user-pill]').textContent = user.name;
    $('[data-connection-status]').textContent = '已安全連接';
    bind(); bindLibrary(); bindColumns();
    if (pageMode !== 'records') initTimeMapper({
      key:`${state.storageKey}:mapper`, canOpen:()=>!active() && !state.queue.length && !state.locked && !state.conflict && !state.saving && !state.draft,
      rpc, message, onSaved:async saved=>{
        state.run=null;
        if(pageMode==='favourites') await rpc('execution_speedrun_library_update',{p_id:saved.id,p_action:'favourite',p_favourite:true});
        await load(saved.id); message('Time Mapper 已儲存計時器與實測紀錄，可以隨時再次挑戰。');
      }
    });
    if (state.locked) message('此帳戶的計時器已在另一視窗開啟。請在原視窗操作，或關閉原視窗後重新整理此頁。','pending');
    else if (state.queue.length) { message('已找回未同步的挑戰，正在恢復…','pending'); void flush(); }
    else if (pageMode === 'records') message('已載入所有嘗試紀錄，可篩選計時器或展開詳情。');
    else message(active() ? '已恢復進行中的挑戰 · 暫停時間不會計入成績' : '已連接資料庫 · 建立或選擇計時器即可開始');
  } catch (error) {
    $('[data-loading]').textContent = '暫時未能開啟計時器，請重新整理或返回執行動力系統登入。';
    $('[data-login-needed]').hidden = false;
    $('[data-connection-status]').textContent = '連線失敗';
    message(error.message || '未能載入計時器。','error');
  }
}
void init();
