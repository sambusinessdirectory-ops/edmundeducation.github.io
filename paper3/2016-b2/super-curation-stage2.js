(() => {
  'use strict';

  const lesson = window.EDMUND_2016_B2_CURATION;
  const part1 = window.EDMUND_2016_B2_CURATION_DEBUG;
  if (!lesson?.categories?.length || !part1 || !document.querySelector('#curation-next')) return;

  const categories = lesson.categories.map((step, index) => ({...step, index, target: document.querySelector(step.selector)}));
  const byId = new Map(categories.map(step => [step.id, step]));
  const storageKey = `${lesson.storageKey}-stage2-v1`;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const make = (tag, className = '', text = '') => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };
  const tasksOnly = list => [...new Set((Array.isArray(list) ? list : []).filter(task => 'ABC'.includes(task)))].sort();
  const initialSelection = step => ({
    tasks: tasksOnly(step.initialTasks),
    status: step.noTask ? 'no-task' : step.uncertain ? 'uncertain' : 'tasks'
  });
  const targetAudit = categories.filter(step => !step.target).map(step => ({id: step.id, selector: step.selector}));
  if (targetAudit.length) console.error('2016 Stage 2 target audit failed.', targetAudit);

  function blankState() {
    return {
      currentId: categories[0].id,
      completedIds: [],
      selections: Object.fromEntries(categories.map(step => [step.id, initialSelection(step)])),
      revisionShown: [],
      bookmarks: [],
      helpDrafts: {},
      spotlight: true,
      complete: false,
      active: false,
      migratedFrom: lesson.version
    };
  }

  function normalizeSelection(value, step) {
    const fallback = initialSelection(step);
    if (!value || typeof value !== 'object' || Array.isArray(value)) return fallback;
    const tasks = tasksOnly(value.tasks);
    if (value.status === 'no-task') return {tasks: [], status: 'no-task'};
    if (value.status === 'uncertain') return {tasks: [], status: 'uncertain'};
    return tasks.length ? {tasks, status: 'tasks'} : fallback;
  }

  function restore(value) {
    const clean = blankState();
    if (!value || typeof value !== 'object' || Array.isArray(value)) return clean;
    const known = list => [...new Set((Array.isArray(list) ? list : []).filter(id => byId.has(id)))];
    clean.currentId = byId.has(value.currentId) ? value.currentId : categories[0].id;
    clean.completedIds = known(value.completedIds);
    clean.revisionShown = known(value.revisionShown);
    clean.bookmarks = known(value.bookmarks);
    clean.spotlight = value.spotlight !== false;
    clean.complete = value.complete === true && clean.completedIds.includes(categories.at(-1).id);
    clean.active = value.active === true;
    clean.selections = Object.fromEntries(categories.map(step => [step.id, normalizeSelection(value.selections?.[step.id], step)]));
    if (value.helpDrafts && typeof value.helpDrafts === 'object' && !Array.isArray(value.helpDrafts)) {
      clean.helpDrafts = Object.fromEntries(Object.entries(value.helpDrafts)
        .filter(([id, text]) => byId.has(id) && typeof text === 'string')
        .map(([id, text]) => [id, text.slice(0, 4000)]));
    }
    return clean;
  }

  let state = blankState();
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (stored?.schema === 1 && stored.version === lesson.stage2Version) state = restore(stored.state);
  } catch (error) {
    console.warn('2016 Stage 2 progress could not be restored.', error);
  }

  function persist(message = 'Stage 2 分類與選擇已自動儲存。') {
    try {
      localStorage.setItem(storageKey, JSON.stringify({schema: 1, version: lesson.stage2Version, state}));
      $('#curation-save-status').textContent = message;
    } catch {
      $('#curation-save-status').textContent = '未能儲存；本次操作仍可繼續。';
    }
  }

  const current = () => byId.get(state.currentId) || categories[0];
  const maxUnlocked = () => Math.min(categories.length - 1, Math.max(-1, ...state.completedIds.map(id => byId.get(id)?.index ?? -1)) + 1);
  const stage1Complete = () => part1.getState().stageComplete === true;

  const panel = make('section', 'curation-category-panel');
  panel.id = 'curation-category-panel';
  panel.hidden = true;
  panel.innerHTML = `
    <dl id="curation-category-details" class="curation-category-details"></dl>
    <fieldset><legend>你會先標哪個任務？</legend>
      <label><input type="checkbox" value="A" data-category-task> Task A</label>
      <label><input type="checkbox" value="B" data-category-task> Task B</label>
      <label><input type="checkbox" value="C" data-category-task> Task C</label>
      <label class="category-neutral"><input type="checkbox" value="uncertain" data-category-status> 未能確定</label>
      <label class="category-neutral"><input type="checkbox" value="no-task" data-category-status> 不屬 A/B/C</label>
    </fieldset>
    <button type="button" id="curation-revision-toggle">顯示讀後修正</button>
    <p id="curation-revision" hidden></p>`;
  $('#curation-points').after(panel);

  const categoryIconGroups = new Map();
  for (const step of categories) {
    if (!step.target) continue;
    const holder = make('span', 'curation-category-icons');
    holder.setAttribute('aria-label', '這份資料的暫定任務分類');
    holder.hidden = true;
    step.target.append(holder);
    categoryIconGroups.set(step.id, holder);
  }

  const stampGroups = new Map();
  for (const pageNumber of new Set(categories.map(step => step.page))) {
    const header = $(`#page-${pageNumber} > header`);
    if (!header) continue;
    const holder = make('div', 'curation-file-stamps curation-stage2-file-stamps');
    holder.dataset.stage2 = 'true';
    holder.setAttribute('aria-label', 'Stage 2 暫定頁面分類');
    const stamps = {};
    for (const task of ['A', 'B', 'C']) {
      const stamp = make('span', `curation-file-stamp curation-file-stamp-${task}`, task);
      stamp.hidden = true;
      stamp.setAttribute('role', 'img');
      stamp.setAttribute('aria-label', `暫定標記：Task ${task}`);
      holder.append(stamp);
      stamps[task] = stamp;
    }
    header.prepend(holder);
    stampGroups.set(pageNumber, {header, holder, stamps});
  }

  const revisionButton = $('#curation-revision-toggle');
  const part1Spotlight = () => part1.getState().spotlight !== false;
  let savedPart1Spotlight = part1Spotlight();

  function renderIcon(step, reached) {
    const holder = categoryIconGroups.get(step.id);
    if (!holder) return;
    holder.replaceChildren();
    holder.hidden = !state.active || !reached;
    if (holder.hidden) return;
    const selection = state.selections[step.id];
    if (selection.status === 'tasks') {
      for (const task of selection.tasks) {
        const icon = make('span', `curation-source-task curation-source-task-${task} is-revealed`, task);
        icon.setAttribute('role', 'img');
        icon.setAttribute('aria-label', `暫定 Task ${task}`);
        holder.append(icon);
      }
    } else {
      const noTask = selection.status === 'no-task';
      const icon = make('span', 'curation-source-task curation-source-task-neutral is-revealed', noTask ? '×' : '?');
      icon.setAttribute('role', 'img');
      icon.setAttribute('aria-label', noTask ? '不屬 A、B 或 C' : '未能確定任務');
      holder.append(icon);
    }
  }

  function renderStamps(step) {
    const reached = categories.slice(0, step.index + 1);
    for (const [pageNumber, group] of stampGroups) {
      const tasks = tasksOnly(reached.filter(item => item.page === pageNumber)
        .flatMap(item => state.selections[item.id]?.status === 'tasks' ? state.selections[item.id].tasks : []));
      for (const task of ['A', 'B', 'C']) group.stamps[task].hidden = !tasks.includes(task);
      group.header.classList.toggle('curation-has-stage2-file-stamps', state.active && tasks.length > 0);
    }
  }

  function hideStage2Visuals() {
    categoryIconGroups.forEach(holder => { holder.hidden = true; });
    stampGroups.forEach(group => {
      Object.values(group.stamps).forEach(stamp => { stamp.hidden = true; });
      group.header.classList.remove('curation-has-stage2-file-stamps');
    });
    $$('.curation-target-stage2').forEach(node => node.classList.remove('curation-target-stage2'));
    panel.hidden = true;
  }

  function renderTaskMap(step) {
    $('.curation-task-map h2').textContent = '三項資料分類圖';
    $('.curation-task-map > p').textContent = '只統計已到達的暫定文件標記；句子證據與答案仍然隱藏。';
    const reached = categories.slice(0, step.index + 1);
    for (const task of ['A', 'B', 'C']) {
      const card = $(`.curation-task-map [data-task="${task}"]`);
      const matching = reached.filter(item => state.selections[item.id]?.status === 'tasks' && state.selections[item.id].tasks.includes(task));
      card.classList.toggle('is-revealed', matching.length > 0);
      $('strong', card).textContent = `${matching.length} 份`;
      $('ol', card).replaceChildren(...matching.map(item => make('li', '', item.title)));
    }
  }

  function rebuildSelects(step) {
    $('#curation-step-jump').replaceChildren(...categories.map(item => {
      const option = make('option', '', `${item.index + 1}. ${item.title}`);
      option.value = item.id;
      option.disabled = item.index > maxUnlocked();
      option.selected = item.id === step.id;
      return option;
    }));
    const placeholder = make('option', '', '選擇書籤');
    placeholder.value = '';
    $('#curation-bookmark-jump').replaceChildren(placeholder, ...state.bookmarks.map(id => {
      const item = byId.get(id);
      const option = make('option', '', `${item.index + 1}. ${item.title}`);
      option.value = id;
      return option;
    }));
  }

  function renderRail() {
    const instruction = $('.curation-stage-item[data-stage="instruction"]');
    const categorize = $('.curation-stage-item[data-stage="categorize"]');
    instruction.classList.remove('active');
    instruction.classList.add('complete');
    instruction.setAttribute('aria-current', 'false');
    $('.curation-stage-dot', instruction).textContent = '✓';
    categorize.disabled = false;
    categorize.classList.add('active');
    categorize.classList.toggle('complete', state.complete);
    categorize.setAttribute('aria-current', 'step');
    $('.curation-stage-dot', categorize).textContent = state.complete ? '✓' : '2';
    $('.curation-stage-count', categorize).textContent = `${state.completedIds.length}/${categories.length}`;
  }

  function hideMasks() {
    $$('.curation-mask').forEach(mask => { mask.hidden = true; });
  }

  function renderSpotlight() {
    hideMasks();
    const target = current().target;
    if (!state.active || !state.spotlight || !target?.isConnected || $('#curation-toggle').getAttribute('aria-pressed') !== 'true') return;
    const masks = $$('.curation-mask');
    const rect = target.getBoundingClientRect();
    const top = Math.max(0, rect.top - 10);
    const bottom = Math.min(innerHeight, rect.bottom + 10);
    const left = Math.max(0, rect.left - 10);
    const right = Math.min(innerWidth, rect.right + 10);
    const boxes = [[0,0,innerWidth,top],[0,bottom,innerWidth,Math.max(0,innerHeight-bottom)],[0,top,left,Math.max(0,bottom-top)],[right,top,Math.max(0,innerWidth-right),Math.max(0,bottom-top)]];
    masks.forEach((mask, index) => {
      const [x,y,width,height] = boxes[index];
      Object.assign(mask.style, {left:`${x}px`,top:`${y}px`,width:`${width}px`,height:`${height}px`});
      mask.hidden = false;
    });
  }

  function render(focus = true) {
    if (!state.active) return;
    const step = current();
    document.body.classList.add('curation-stage2-active');
    panel.hidden = false;
    renderRail();
    rebuildSelects(step);
    renderTaskMap(step);
    categories.forEach(item => renderIcon(item, item.index <= step.index));
    renderStamps(step);
    $$('.curation-target').forEach(node => node.classList.remove('curation-target'));
    $$('.curation-target-stage2').forEach(node => node.classList.remove('curation-target-stage2'));
    step.target?.classList.add('curation-target-stage2');

    $('.curation-dock > header span').textContent = '2016 B2 · SUPER CURATION · STAGE 2';
    $('#curation-step-id').textContent = `STEP ID · ${step.id}`;
    $('#curation-step-count').textContent = `步驟 ${step.index + 1} / ${categories.length} · 完成 ${state.completedIds.length} / ${categories.length}`;
    $('#curation-progress').max = categories.length;
    $('#curation-progress').value = state.completedIds.length;
    $('#curation-progress').setAttribute('aria-label', 'Stage 2 完成進度');
    $('#curation-source').textContent = step.sourcePage;
    $('#curation-title').textContent = step.title;
    $('#curation-quote').textContent = step.quote;
    $('#curation-translation').textContent = '先按題目、文件標題和文件類型作暫定分類；不要提前逐句取證。';
    $('#curation-type').textContent = `${step.documentType} · 暫定資料分類`;
    $('#curation-explanation').textContent = step.explanation;
    $('#curation-points').hidden = true;
    $('#curation-category-details').innerHTML = `<div><dt>文件類型</dt><dd>${step.documentType}</dd></div><div><dt>寫作者／說話者</dt><dd>${step.writer}</dd></div><div><dt>讀者</dt><dd>${step.reader}</dd></div><div><dt>日期</dt><dd>${step.date}</dd></div>`;
    const selection = state.selections[step.id];
    $$('[data-category-task]', panel).forEach(input => { input.checked = selection.status === 'tasks' && selection.tasks.includes(input.value); });
    $$('[data-category-status]', panel).forEach(input => { input.checked = selection.status === input.value; });
    const revisionShown = state.revisionShown.includes(step.id);
    revisionButton.textContent = revisionShown ? '隱藏讀後修正' : '顯示讀後修正';
    $('#curation-revision').textContent = step.revision;
    $('#curation-revision').hidden = !revisionShown;
    $('#curation-prev').disabled = step.index === 0;
    $('#curation-next').disabled = state.complete && step.index === categories.length - 1;
    $('#curation-next').textContent = state.complete && step.index === categories.length - 1 ? 'Stage 2 已完成 ✓' : step.index === categories.length - 1 ? '完成 Stage 2 ✓' : '下一步 →';
    $('#curation-bookmark').textContent = state.bookmarks.includes(step.id) ? '★' : '☆';
    $('#curation-bookmark').setAttribute('aria-pressed', String(state.bookmarks.includes(step.id)));
    $('#curation-bookmark-count').textContent = state.bookmarks.length ? `${state.bookmarks.length} 個書籤` : '尚無書籤';
    $('#curation-spotlight').checked = state.spotlight;
    persist(state.complete ? 'Stage 2 已完成；Stage 3–5 保持鎖定。' : undefined);
    if (focus && step.target) step.target.scrollIntoView({block: 'center', inline: 'nearest', behavior: 'auto'});
    requestAnimationFrame(() => requestAnimationFrame(renderSpotlight));
  }

  function setCurrent(index) {
    state.currentId = categories[Math.max(0, Math.min(categories.length - 1, index))].id;
    render(true);
  }

  function enterStage2() {
    if (!stage1Complete()) return;
    savedPart1Spotlight = part1Spotlight();
    part1.setSpotlight(false);
    state.active = true;
    persist('Stage 1 進度已保留；已進入 Stage 2。');
    render(true);
  }

  function leaveStage2() {
    if (!state.active) return;
    state.active = false;
    persist('Stage 2 離開位置已儲存。');
    document.body.classList.remove('curation-stage2-active');
    hideStage2Visuals();
    hideMasks();
    part1.goById('p1-stage-complete');
    part1.setSpotlight(savedPart1Spotlight);
  }

  const stopWhenActive = event => {
    if (!state.active) return false;
    event.preventDefault();
    event.stopImmediatePropagation();
    return true;
  };

  $('#curation-next').addEventListener('click', event => {
    if (state.active) {
      stopWhenActive(event);
      const step = current();
      if (!state.completedIds.includes(step.id)) state.completedIds.push(step.id);
      if (step.index === categories.length - 1) {
        state.complete = true;
        render(false);
      } else setCurrent(step.index + 1);
      return;
    }
  }, true);
  $('#curation-next').addEventListener('click', () => {
    if (!state.active && part1.getState().stepId === 'p1-stage-complete' && stage1Complete()) enterStage2();
  });
  $('#curation-prev').addEventListener('click', event => {
    if (!stopWhenActive(event)) return;
    setCurrent(current().index - 1);
  }, true);
  $('#curation-step-jump').addEventListener('change', event => {
    if (!stopWhenActive(event)) return;
    const step = byId.get(event.target.value);
    if (step && step.index <= maxUnlocked()) setCurrent(step.index);
  }, true);
  $('#curation-bookmark-jump').addEventListener('change', event => {
    if (!stopWhenActive(event)) return;
    const step = byId.get(event.target.value);
    if (step) setCurrent(step.index);
  }, true);
  $('#curation-bookmark').addEventListener('click', event => {
    if (!stopWhenActive(event)) return;
    const id = current().id;
    state.bookmarks = state.bookmarks.includes(id) ? state.bookmarks.filter(item => item !== id) : [...state.bookmarks, id];
    render(false);
  }, true);
  $('#curation-spotlight').addEventListener('change', event => {
    if (!stopWhenActive(event)) return;
    state.spotlight = event.target.checked;
    renderSpotlight();
    persist();
  }, true);
  $('#curation-help').addEventListener('click', event => {
    if (!stopWhenActive(event)) return;
    const step = current();
    $('#curation-help-context').textContent = `${step.sourcePage} · ${step.title} · STEP ID ${step.id}`;
    $('#curation-help-guidance').textContent = step.help;
    $('#curation-help-question').value = state.helpDrafts[step.id] || '';
    $('#curation-help-status').textContent = '問題草稿只會儲存在此瀏覽器，不會自動傳送。';
    const dialog = $('.curation-help-dialog');
    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.open = true;
  }, true);
  $('#curation-help-form').addEventListener('submit', event => {
    if (!state.active) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const value = $('#curation-help-question').value.trim();
    if (value) state.helpDrafts[current().id] = value; else delete state.helpDrafts[current().id];
    persist('問題草稿已儲存於此瀏覽器；未有傳送。');
    $('#curation-help-status').textContent = '問題草稿已儲存於此瀏覽器；未有傳送。';
  }, true);

  panel.addEventListener('change', event => {
    const step = current();
    const selection = state.selections[step.id];
    if (event.target.matches('[data-category-task]')) {
      const tasks = tasksOnly($$('[data-category-task]:checked', panel).map(input => input.value));
      state.selections[step.id] = tasks.length ? {tasks, status: 'tasks'} : {tasks: [], status: 'uncertain'};
    } else if (event.target.matches('[data-category-status]') && event.target.checked) {
      state.selections[step.id] = {tasks: [], status: event.target.value};
    } else if (event.target.matches('[data-category-status]')) {
      state.selections[step.id] = {tasks: [], status: 'uncertain'};
    } else return;
    render(false);
  });
  revisionButton.addEventListener('click', () => {
    const id = current().id;
    state.revisionShown = state.revisionShown.includes(id) ? state.revisionShown.filter(item => item !== id) : [...state.revisionShown, id];
    render(false);
  });

  $('.curation-stage-item[data-stage="categorize"]').addEventListener('click', event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    enterStage2();
  }, true);
  $('.curation-stage-item[data-stage="instruction"]').addEventListener('click', event => {
    if (!state.active) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    leaveStage2();
  }, true);

  document.addEventListener('keydown', event => {
    if (!state.active || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName) || $('.curation-help-dialog').open) return;
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (event.key === 'ArrowLeft') setCurrent(current().index - 1);
    else if (!$('#curation-next').disabled) $('#curation-next').click();
  }, true);
  window.addEventListener('scroll', renderSpotlight, {passive: true});
  window.addEventListener('resize', renderSpotlight);
  window.addEventListener('pagehide', () => persist());
  $('#curation-close').addEventListener('click', () => queueMicrotask(hideMasks), true);
  $('#curation-toggle').addEventListener('click', () => {
    queueMicrotask(() => {
      if ($('#curation-toggle').getAttribute('aria-pressed') === 'true' && state.active && stage1Complete()) render(true);
      else hideMasks();
    });
  });

  window.EDMUND_2016_B2_CURATION_STAGE2_DEBUG = Object.freeze({
    version: lesson.stage2Version,
    storageKey,
    categories: categories.map(({target, ...step}) => step),
    targetAudit,
    getState: () => ({...state, position: current().index, stepId: current().id}),
    enter: enterStage2,
    leave: leaveStage2,
    next: () => $('#curation-next').click(),
    prev: () => $('#curation-prev').click(),
    goById: id => { const step = byId.get(id); if (step) { state.currentId = id; render(true); } },
    setSpotlight: value => { state.spotlight = value !== false; render(false); },
    reset: () => { state = blankState(); state.active = true; render(true); }
  });

  const part1State = part1.getState();
  $('.curation-stage-item[data-stage="categorize"]').disabled = !part1State.stageComplete;
  if (part1State.stageComplete) {
    const categorize = $('.curation-stage-item[data-stage="categorize"]');
    categorize.disabled = false;
    $('.curation-stage-count', categorize).textContent = `${state.completedIds.length}/${categories.length}`;
  }
  if (state.active && part1State.stageComplete && $('#curation-toggle').getAttribute('aria-pressed') === 'true') enterStage2();
})();
