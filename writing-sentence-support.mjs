const placementByFunction = Object.freeze({
  'intro-background': 'I-BG', 'intro-transition': 'I-TR', 'intro-effect': 'I-EF',
  'intro-stance': 'I-ST', 'intro-thesis': 'I-TH',
  'body1-topic': 'B1-TP', 'body1-explanation': 'B1-EX', 'body1-examples': 'B1-EG',
  'body1-action': 'B1-AP', 'body1-conclusion': 'B1-CL',
  'body2-topic': 'B2-TP', 'body2-explanation': 'B2-EX', 'body2-examples': 'B2-EG',
  'body2-action': 'B2-AP', 'body2-conclusion': 'B2-CL',
  'rebuttal-opponent-topic': 'R-OT', 'rebuttal-opponent-explanations': 'R-OX',
  'rebuttal-opponent-examples': 'R-OE', 'rebuttal-opponent-conclusion': 'R-OC',
  'rebuttal-your-topic': 'R-YT', 'rebuttal-your-explanations': 'R-YX',
  'rebuttal-your-examples': 'R-YE', 'rebuttal-your-conclusions': 'R-YC',
  'conclusion-stance': 'C-ST', 'conclusion-arguments': 'C-AR',
  'conclusion-action': 'C-AP', 'conclusion-closing': 'C-CL'
});

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]));
const generalFunction = { id: 'across-sections', title: 'Across sections', titleZh: '跨段落通用句型' };
const panelLayoutKey = 'edmund-writing-structure-panel-layout-v1';
const progressKey = owner => `edmund-writing-structure-progress-v1:${owner}`;
const clamp = (value, minimum, maximum) => Math.min(Math.max(value, minimum), maximum);

function formulaHtml(value) {
  return String(value || '').split(/(\[[^\]]+\])/g).map(part =>
    part.startsWith('[') && part.endsWith(']')
      ? `<mark class="writing-structure-slot">${escapeHtml(part)}</mark>`
      : escapeHtml(part)
  ).join('');
}

export function exampleHtml(formula, example) {
  const text = String(example || '');
  const parts = String(formula || '').split(/(\[[^\]]+\])/g);
  const ranges = [];
  let cursor = 0;
  for (let index = 0; index < parts.length; index += 1) {
    if (parts[index].startsWith('[') && parts[index].endsWith(']')) continue;
    const literal = parts[index].replace(/^[^A-Za-z]+|[^A-Za-z]+$/g, '').trim();
    if (!/[A-Za-z]{3,}/.test(literal)) continue;
    const expression = new RegExp(`\\b${literal.split(/\s+/).map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\s+')}\\b`, 'i');
    const found = expression.exec(text.slice(cursor));
    if (!found) continue;
    const start = cursor + found.index;
    const end = start + found[0].length;
    ranges.push({ index, start, end, kind: 'match' });
    cursor = end;
  }
  if (!ranges.length) return escapeHtml(text);
  const literals = [...ranges];
  for (let index = 0; index < parts.length; index += 1) {
    if (!parts[index].startsWith('[') || !parts[index].endsWith(']')) continue;
    const before = literals.filter(range => range.index < index).at(-1);
    const after = literals.find(range => range.index > index);
    if (!before && !after) continue;
    let start = before?.end ?? 0;
    let end = after?.start ?? text.length;
    while (start < end && /\s/.test(text[start])) start += 1;
    while (end > start && /[\s.!?]/.test(text[end - 1])) end -= 1;
    if (end > start) ranges.push({ index, start, end, kind: 'variable' });
  }
  ranges.sort((a, b) => a.start - b.start || b.end - a.end);
  let output = '';
  let position = 0;
  for (const range of ranges) {
    if (range.start < position) continue;
    output += escapeHtml(text.slice(position, range.start));
    output += `<mark class="writing-structure-${range.kind}">${escapeHtml(text.slice(range.start, range.end))}</mark>`;
    position = range.end;
  }
  return output + escapeHtml(text.slice(position));
}

export function mountSentenceSupport(root, writingFunctions, options = {}) {
  if (!root) return { open() {}, close() {} };
  const getOwner = options.getOwner || (() => '');
  const toggle = root.querySelector('[data-structure-toggle]');
  const panel = root.querySelector('[data-structure-panel]');
  const functionPicker = root.querySelector('.writing-structure-select');
  const functionTrigger = root.querySelector('[data-structure-function-trigger]');
  const functionValue = root.querySelector('[data-structure-function-value]');
  const functionMenu = root.querySelector('[data-structure-function-menu]');
  const search = root.querySelector('[data-structure-search]');
  const results = root.querySelector('[data-structure-results]');
  const heading = root.querySelector('[data-structure-heading]');
  const count = root.querySelector('[data-structure-count]');
  const more = root.querySelector('[data-structure-more]');
  const drag = panel.querySelector('[data-structure-drag]');
  const closeButton = panel.querySelector('[data-structure-close]');
  document.body.append(panel);
  let catalog = null;
  let loading = null;
  let active = writingFunctions[0]?.id || '';
  let visibleCount = 30;
  let owner = '';
  let mastered = new Set();
  let progressPending = false;
  let saveTimer = null;
  let saving = false;
  let geometry = null;

  function writeLocalProgress() {
    if (!owner) return;
    try { localStorage.setItem(progressKey(owner), JSON.stringify({ ids: [...mastered], pending: progressPending })); }
    catch { /* Keep the current selections in memory. */ }
  }

  function readProgress() {
    const nextOwner = String(getOwner() || '');
    if (owner === nextOwner) return;
    owner = nextOwner;
    try {
      const saved = JSON.parse(localStorage.getItem(progressKey(owner)) || '[]');
      const ids = Array.isArray(saved) ? saved : saved?.ids;
      mastered = new Set(Array.isArray(ids) ? ids.filter(id => /^S\d{3}$/.test(id)) : []);
      progressPending = Array.isArray(saved) ? mastered.size > 0 : saved?.pending === true;
    } catch { mastered = new Set(); progressPending = false; }
  }

  function saveProgress() {
    progressPending = true;
    writeLocalProgress();
    scheduleRemoteSave();
  }

  function scheduleRemoteSave(delay = 2500) {
    if (!options.saveProgress || !owner) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      if (String(getOwner() || '') !== owner) return;
      if (saving || !progressPending) return;
      const requestedOwner = owner;
      const requestedIds = [...mastered].sort();
      saving = true;
      try {
        await options.saveProgress(requestedIds, requestedOwner);
        if (owner === requestedOwner && JSON.stringify([...mastered].sort()) === JSON.stringify(requestedIds)) {
          progressPending = false;
          writeLocalProgress();
          if (!panel.hidden) updateCount();
        }
      } catch (error) {
        if (owner === requestedOwner && progressPending && error?.status !== 400) {
          scheduleRemoteSave(Math.max(5000, error?.retryAfterMs || 30000));
        }
      }
      finally {
        saving = false;
        if (owner === requestedOwner && progressPending && JSON.stringify([...mastered].sort()) !== JSON.stringify(requestedIds)) scheduleRemoteSave();
      }
    }, 600);
  }

  async function loadRemoteProgress() {
    if (!options.loadProgress || !owner) return;
    const requestedOwner = owner;
    try {
      const ids = await options.loadProgress(requestedOwner);
      if (owner !== requestedOwner || !Array.isArray(ids)) return;
      if (progressPending) { scheduleRemoteSave(); return; }
      mastered = new Set(ids.filter(id => /^S\d{3}$/.test(id)));
      writeLocalProgress();
      if (!panel.hidden) render();
    } catch { /* The local copy remains usable while offline. */ }
  }

  function fitGeometry(value) {
    const margin = 8;
    const width = clamp(Number(value?.width) || 470, Math.min(300, innerWidth - 2 * margin), Math.max(300, innerWidth - 2 * margin));
    const height = clamp(Number(value?.height) || 620, Math.min(260, innerHeight - 2 * margin), Math.max(260, innerHeight - 2 * margin));
    return {
      left: clamp(Number(value?.left) || margin, margin, Math.max(margin, innerWidth - width - margin)),
      top: clamp(Number(value?.top) || Math.min(90, innerHeight - height - margin), margin, Math.max(margin, innerHeight - height - margin)),
      width, height
    };
  }

  function setGeometry(value, persist = false) {
    geometry = fitGeometry(value);
    for (const key of ['left', 'top', 'width', 'height']) panel.style[key] = `${geometry[key]}px`;
    if (persist) try { localStorage.setItem(panelLayoutKey, JSON.stringify(geometry)); } catch { /* Keep the current layout in memory. */ }
  }

  try { geometry = JSON.parse(localStorage.getItem(panelLayoutKey) || 'null'); } catch { geometry = null; }
  setGeometry(geometry);

  let group = '';
  let groupNode = null;
  for (const item of [...writingFunctions, generalFunction]) {
    const groupLabel = item.group ? `${item.group} · ${item.groupZh}` : '跨段落';
    if (groupLabel !== group) {
      group = groupLabel;
      groupNode = document.createElement('div');
      groupNode.className = 'writing-structure-select-group';
      groupNode.setAttribute('role', 'group');
      groupNode.setAttribute('aria-label', groupLabel);
      const heading = document.createElement('span');
      heading.className = 'writing-structure-select-group-title';
      heading.textContent = groupLabel;
      groupNode.append(heading);
      functionMenu.append(groupNode);
    }
    const option = document.createElement('button');
    option.type = 'button';
    option.className = 'writing-structure-select-option';
    option.setAttribute('role', 'option');
    option.setAttribute('aria-selected', 'false');
    option.dataset.structureFunctionOption = item.id;
    option.tabIndex = -1;
    option.innerHTML = `<strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.titleZh)}</small>`;
    groupNode.append(option);
  }
  const functionOptions = [...functionMenu.querySelectorAll('[data-structure-function-option]')];

  function closeFunctionMenu(restoreFocus = false) {
    functionMenu.hidden = true;
    functionTrigger.setAttribute('aria-expanded', 'false');
    functionPicker.classList.remove('is-open');
    if (restoreFocus) functionTrigger.focus();
  }

  function openFunctionMenu() {
    functionMenu.hidden = false;
    functionTrigger.setAttribute('aria-expanded', 'true');
    functionPicker.classList.add('is-open');
    const room = panel.getBoundingClientRect().bottom - functionTrigger.getBoundingClientRect().bottom - 16;
    functionMenu.style.maxHeight = `${Math.max(150, Math.min(360, room))}px`;
    const current = functionOptions.find(option => option.dataset.structureFunctionOption === active) || functionOptions[0];
    current.focus();
    current.scrollIntoView({ block: 'nearest' });
  }

  function chooseFunction(id) {
    active = id;
    visibleCount = 30;
    search.value = '';
    closeFunctionMenu(true);
    render();
  }

  const matches = () => {
    const tag = placementByFunction[active];
    const query = search.value.trim().toLocaleLowerCase();
    return (catalog || []).filter(item => (active === generalFunction.id
      ? item.tags.some(value => value.startsWith('F-')) : item.tags.includes(tag)) && (
      !query || `${item.id} ${item.formula} ${item.meaning} ${item.usage} ${item.example}`.toLocaleLowerCase().includes(query)
    )).sort((left, right) => right.sourceRows - left.sourceRows || left.id.localeCompare(right.id));
  };

  function updateCount(items = matches()) {
    count.textContent = `${items.length} 個適用句型 · ${items.filter(item => mastered.has(item.id)).length} 個已能使用${progressPending ? ' · 待同步' : ''}`;
  }

  function render() {
    const current = writingFunctions.find(item => item.id === active) || generalFunction;
    heading.textContent = `${current.title} · ${current.titleZh}`;
    functionValue.textContent = `${current.title} · ${current.titleZh}`;
    functionOptions.forEach(option => {
      const selected = option.dataset.structureFunctionOption === current.id;
      option.setAttribute('aria-selected', String(selected));
      option.classList.toggle('is-selected', selected);
    });
    if (!catalog) return;
    const items = matches();
    updateCount(items);
    results.innerHTML = items.length ? items.slice(0, visibleCount).map(item => {
      const example = item.example
        ? `<p lang="en">${exampleHtml(item.formula, item.example)}</p><small>${escapeHtml(item.source)}</small>${item.sourceUrl ? `<a href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noopener">在 Writing Practice 查看來源 ↗</a>` : ''}`
        : '<p>目前的 Writing Practice 題庫未收錄這條來源原句。</p>';
      return `<article class="writing-structure-card${mastered.has(item.id) ? ' is-mastered' : ''}"><div class="writing-structure-card-top"><button type="button" class="writing-structure-formula" data-structure-preview aria-expanded="false"><span>${escapeHtml(item.id)} · ${item.sourceRows} 筆來源</span><strong>${formulaHtml(item.formula)}</strong></button><label class="writing-structure-mastered"><input type="checkbox" data-structure-mastered="${escapeHtml(item.id)}" ${mastered.has(item.id) ? 'checked' : ''}><span>已能使用</span></label></div><p class="writing-structure-meaning">${escapeHtml(item.meaning)}</p><p class="writing-structure-usage">${escapeHtml(item.usage)}</p><div class="writing-structure-example"><strong>Writing Practice 原文例句</strong>${example}</div></article>`;
    }).join('') : '<p class="writing-structure-empty">這個句子功能暫無已標註的句型。可在上方選擇另一個功能。</p>';
    more.hidden = items.length <= visibleCount;
  }

  async function load() {
    if (catalog) return;
    if (!loading) {
      loading = fetch('writing-sentence-support-data.json?v=20261021-1', { cache: 'force-cache' })
        .then(response => {
          if (!response.ok) throw new Error('Catalog unavailable');
          return response.json();
        })
        .then(rows => {
          if (!Array.isArray(rows)) throw new Error('Invalid catalog');
          catalog = rows;
        })
        .finally(() => { loading = null; });
    }
    await loading;
  }

  async function open(id = active) {
    if (placementByFunction[id] || id === generalFunction.id) active = id;
    closeFunctionMenu();
    readProgress();
    setGeometry(geometry);
    visibleCount = 30;
    search.value = '';
    panel.hidden = false;
    root.dataset.open = 'true';
    toggle.setAttribute('aria-expanded', 'true');
    results.innerHTML = '<p class="writing-structure-empty">正在載入句型…</p>';
    heading.textContent = (writingFunctions.find(item => item.id === active) || generalFunction).title;
    count.textContent = '';
    try { await load(); render(); void loadRemoteProgress(); }
    catch { results.innerHTML = '<p class="writing-structure-empty">暫時未能載入句型，請關閉後重試。</p>'; }
  }

  function close() {
    closeFunctionMenu();
    panel.hidden = true;
    root.dataset.open = 'false';
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', () => panel.hidden ? void open() : close());
  closeButton.addEventListener('click', close);
  functionTrigger.addEventListener('click', () => functionMenu.hidden ? openFunctionMenu() : closeFunctionMenu(true));
  functionTrigger.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); openFunctionMenu(); }
  });
  functionMenu.addEventListener('click', event => {
    const option = event.target.closest('[data-structure-function-option]');
    if (option) chooseFunction(option.dataset.structureFunctionOption);
  });
  functionMenu.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); closeFunctionMenu(true); return; }
    if (event.key === 'Tab') { closeFunctionMenu(); return; }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const index = functionOptions.indexOf(document.activeElement);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? functionOptions.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + functionOptions.length) % functionOptions.length;
    functionOptions[next].focus();
    functionOptions[next].scrollIntoView({ block: 'nearest' });
  });
  document.addEventListener('pointerdown', event => { if (!functionPicker.contains(event.target)) closeFunctionMenu(); });
  search.addEventListener('input', () => { visibleCount = 30; render(); });
  more.addEventListener('click', () => { visibleCount += 30; render(); });
  results.addEventListener('click', event => {
    const button = event.target.closest('[data-structure-preview]');
    if (!button) return;
    const card = button.closest('.writing-structure-card');
    const expanded = !card.classList.contains('is-expanded');
    card.classList.toggle('is-expanded', expanded);
    button.setAttribute('aria-expanded', String(expanded));
  });
  results.addEventListener('change', event => {
    const input = event.target.closest('[data-structure-mastered]');
    if (!input) return;
    if (input.checked) mastered.add(input.dataset.structureMastered);
    else mastered.delete(input.dataset.structureMastered);
    input.closest('.writing-structure-card').classList.toggle('is-mastered', input.checked);
    saveProgress();
    updateCount();
  });

  function beginPointerMove(event, corner = '') {
    if (event.button !== 0 || (corner === '' && event.target.closest('button'))) return;
    event.preventDefault();
    const start = { ...geometry };
    const x = event.clientX;
    const y = event.clientY;
    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);
    const move = next => {
      const dx = next.clientX - x;
      const dy = next.clientY - y;
      const updated = { ...start };
      if (!corner) { updated.left += dx; updated.top += dy; }
      else {
        if (corner.includes('w')) { updated.left += dx; updated.width -= dx; }
        if (corner.includes('e')) updated.width += dx;
        if (corner.includes('n')) { updated.top += dy; updated.height -= dy; }
        if (corner.includes('s')) updated.height += dy;
        const minWidth = Math.min(300, innerWidth - 16);
        const minHeight = Math.min(260, innerHeight - 16);
        if (updated.width < minWidth) { if (corner.includes('w')) updated.left -= minWidth - updated.width; updated.width = minWidth; }
        if (updated.height < minHeight) { if (corner.includes('n')) updated.top -= minHeight - updated.height; updated.height = minHeight; }
      }
      setGeometry(updated);
    };
    const end = () => {
      target.removeEventListener('pointermove', move);
      target.removeEventListener('pointerup', end);
      target.removeEventListener('pointercancel', end);
      setGeometry(geometry, true);
    };
    target.addEventListener('pointermove', move);
    target.addEventListener('pointerup', end);
    target.addEventListener('pointercancel', end);
  }
  drag.addEventListener('pointerdown', event => beginPointerMove(event));
  panel.querySelectorAll('[data-structure-resize]').forEach(handle => {
    handle.addEventListener('pointerdown', event => beginPointerMove(event, handle.dataset.structureResize));
    handle.addEventListener('keydown', event => {
      const delta = { ArrowLeft: [-12, 0], ArrowRight: [12, 0], ArrowUp: [0, -12], ArrowDown: [0, 12] }[event.key];
      if (!delta) return;
      event.preventDefault();
      const corner = handle.dataset.structureResize;
      const updated = { ...geometry };
      if (corner.includes('w')) { updated.left += delta[0]; updated.width -= delta[0]; }
      if (corner.includes('e')) updated.width += delta[0];
      if (corner.includes('n')) { updated.top += delta[1]; updated.height -= delta[1]; }
      if (corner.includes('s')) updated.height += delta[1];
      setGeometry(updated, true);
    });
  });
  window.addEventListener('resize', () => setGeometry(geometry));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !panel.hidden) close(); });
  return { open, close };
}
