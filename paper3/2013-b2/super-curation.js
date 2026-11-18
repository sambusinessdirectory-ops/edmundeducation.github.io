(() => {
  'use strict';

  const model = window.EDMUND_2013_B2_STAGE1;
  const toolbar = document.querySelector('.toolbar');
  if (!model || !toolbar || document.body.dataset.reader !== '2013-b2') return;

  const VERSION = model.contentVersion;
  const LEGACY_VERSIONS = new Set(['2013-b2-stage1-v1', '2013-b2-stage2-v1']);
  const STORAGE_KEY = 'edmund-paper3-2013-b2-super-curation-stage1-v1';
  const steps = model.steps.map((item, index) => ({...item, index}));
  const stepsById = new Map(steps.map(item => [item.id, item]));
  const ids = new Set(stepsById.keys());
  const categories = (model.categorySteps || model.categoryDocuments || [])
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((item, index) => ({...item, index, categoryKind:item.kind || 'document', kind:'category'}));
  const categoriesById = new Map(categories.map(item => [item.id, item]));
  const categoryIds = new Set(categoriesById.keys());
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const create = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  };
  const canonical = value => String(value)
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
  const comparable = value => String(value)
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-');

  function candidateFor(step) {
    const root = $(step.sourceRoot || `#page-${step.sourcePage}`);
    if (!root) return null;
    const phrase = canonical(step.sourcePhrase);
    const candidates = [root, ...$$('p[lang="en"], h1, h2, h3, h4, li, .email-headers > div, .answer-title', root)]
      .filter(node => canonical(node.textContent).includes(phrase));
    return candidates.find(node => canonical(node.textContent) === phrase)
      || candidates.sort((a, b) => a.textContent.length - b.textContent.length)[0]
      || null;
  }

  function wrapPhraseInRoot(root, phrase, step, point = step.point) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let node;
    let offset = 0;
    while ((node = walker.nextNode())) {
      if (node.parentElement?.closest('.translation')) continue;
      const start = offset;
      offset += node.length;
      nodes.push({node, start, end:offset});
    }
    const combined = nodes.map(item => item.node.textContent).join('');
    const at = comparable(combined).indexOf(comparable(phrase));
    if (at < 0) return null;
    // The comparison swaps only same-length punctuation, so offsets remain exact.
    const first = nodes.find(item => item.end > at);
    const last = nodes.find(item => item.end >= at + phrase.length);
    if (!first || !last) return null;
    const range = document.createRange();
    range.setStart(first.node, at - first.start);
    range.setEnd(last.node, at + phrase.length - last.start);
    const visualKind = step.excluded ? 'excluded' : (step.markKind || step.task || 'neutral');
    const mark = create('mark', `curation-source-mark curation-mark-${visualKind}`);
    mark.dataset.stepId = step.id;
    mark.dataset.sourcePage = String(step.sourcePage);
    mark.tabIndex = 0;
    mark.setAttribute('aria-label', `${point ? `要求 ${point}：` : ''}${step.title}：${phrase}`);
    mark.dataset.visualKind = visualKind;
    if (step.task) mark.classList.add(`task-${step.task}`);
    if (step.excluded) mark.classList.add('is-excluded');
    if (point) mark.dataset.point = point;
    mark.append(range.extractContents());
    range.insertNode(mark);
    return mark;
  }

  function wrapPhrase(step) {
    const root = candidateFor(step);
    if (!root) return null;
    if (step.pointPhrases?.length) {
      const marks = step.pointPhrases.map(item => wrapPhraseInRoot(root, item.phrase, step, item.point));
      if (marks.some(mark => !mark)) return null;
      root.dataset.visualKind = step.markKind || step.task || 'neutral';
      root.dataset.curationPointGroup = step.id;
      root.tabIndex = 0;
      root.setAttribute('aria-label', `${step.title}：${step.sourcePhrase}`);
      return root;
    }
    return wrapPhraseInRoot(root, step.sourcePhrase, step);
  }

  function wrapCategoryClue(root, phrase, item) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let node;
    let offset = 0;
    while ((node = walker.nextNode())) {
      if (node.parentElement?.closest('.translation')) continue;
      const start = offset;
      offset += node.length;
      nodes.push({node, start, end:offset});
    }
    const combined = nodes.map(entry => entry.node.textContent).join('');
    const at = comparable(combined).indexOf(comparable(phrase));
    if (at < 0) return null;
    const first = nodes.find(entry => entry.end > at);
    const last = nodes.find(entry => entry.end >= at + phrase.length);
    if (!first || !last) return null;
    const range = document.createRange();
    range.setStart(first.node, at - first.start);
    range.setEnd(last.node, at + phrase.length - last.start);
    const mark = create('mark', 'curation-category-clue');
    mark.dataset.categoryStep = item.id;
    mark.tabIndex = 0;
    mark.setAttribute('aria-label', `首個決定線索：${phrase}`);
    mark.append(range.extractContents());
    range.insertNode(mark);
    return mark;
  }

  const missing = [];
  for (const item of steps) {
    if (item.kind === 'route') {
      item.target = $(item.routeTarget);
      if (!item.target) missing.push(`${item.id}: route target ${item.routeTarget}`);
    } else {
      item.target = wrapPhrase(item);
      if (!item.target) missing.push(`${item.id}: ${item.sourcePhrase}`);
    }
  }

  // The 2025 Boss Letter reveals one handwritten task stamp beside each task's
  // opening instruction. Keep the task-to-paragraph mapping in the 2013 data.
  const taskStamps = new Map();
  for (const item of steps.filter(step => step.taskStamp)) {
    const paragraph = item.target?.closest('p[lang="en"]');
    if (!paragraph) {
      missing.push(`${item.id}: task stamp paragraph`);
      continue;
    }
    paragraph.dataset.curationTask = item.taskStamp;
    paragraph.dataset.curationStampStep = item.id;
    taskStamps.set(item.taskStamp, {step:item, paragraph});
  }

  // A source route lands on a specific Fact File document, not merely a page.
  // Group route steps by that document's heading so shared sources can carry
  // more than one square task stamp (for example, the podcast notes serve A/C).
  const factRouteGroups = new Map();
  const routeHeadings = new Map();
  for (const item of steps.filter(step => step.kind === 'route' && step.task && step.target)) {
    const heading = item.target.matches('h1,h2,h3')
      ? item.target
      : (item.target.previousElementSibling?.matches('h1,h2,h3')
        ? item.target.previousElementSibling
        : item.target.closest('.recreated-page')?.querySelector('h2'));
    if (!heading) {
      missing.push(`${item.id}: fact file heading`);
      continue;
    }
    routeHeadings.set(item.id, heading);
    if (!factRouteGroups.has(heading)) factRouteGroups.set(heading, {heading, routes:[], holder:null, wrapper:null, signature:''});
    factRouteGroups.get(heading).routes.push(item);
  }
  for (const group of factRouteGroups.values()) {
    const wrapper = create('div', 'curation-fact-heading');
    const holder = create('div', 'curation-fact-stamps');
    holder.setAttribute('aria-label', '來源路線 Task 標記');
    group.heading.before(wrapper);
    wrapper.append(holder, group.heading);
    group.wrapper = wrapper;
    group.holder = holder;
  }

  // Source-document stamps and note-sheet marks have separate reveal histories.
  // Classification focus may be an exact clue below the heading, while the
  // square A/B/C stamp remains attached to the source title.
  const categoryViews = new Map();
  const noteViews = new Map();
  for (const item of categories) {
    const rawTarget = $(item.target);
    if (!rawTarget) {
      missing.push(`${item.id}: category target ${item.target}`);
      continue;
    }
    item.targetNode = item.cluePhrase ? wrapCategoryClue(rawTarget, item.cluePhrase, item) : rawTarget;
    if (!item.targetNode) {
      missing.push(`${item.id}: category clue ${item.cluePhrase}`);
      continue;
    }
    item.focusTarget = item.targetNode;
    if (item.categoryKind !== 'document' && item.categoryKind !== 'note') continue;
    const heading = item.categoryKind === 'document' ? $(item.stampTarget) : rawTarget;
    if (!heading) { missing.push(`${item.id}: category heading ${item.stampTarget || item.target}`); continue; }
    let wrapper = heading.closest('.curation-fact-heading');
    if (!wrapper) {
      wrapper = create('div', item.categoryKind === 'note' ? 'curation-note-heading' : 'curation-fact-heading');
      heading.before(wrapper);
      wrapper.append(heading);
    }
    const holder = create('div', item.categoryKind === 'note' ? 'curation-note-stamps' : 'curation-category-stamps');
    holder.setAttribute('aria-label', item.categoryKind === 'note' ? '聆聽筆記欄目 Task 標記' : '資料分類 Task 標記');
    wrapper.prepend(holder);
    const view = {wrapper, holder, heading, signature:''};
    if (item.categoryKind === 'document') categoryViews.set(item.id, view);
    else noteViews.set(item.id, view);
  }

  const CATEGORY_ID_MIGRATIONS = Object.freeze({
    '2013-category-03-travel-report-notes':'2013-category-03-note-sheet-overview'
  });
  const migrateCategoryId = id => CATEGORY_ID_MIGRATIONS[id] || id;

  const blankState = () => ({
    schemaVersion: model.schemaVersion,
    activeStage: 'instructions',
    currentStepId: steps[0].id,
    position: 0,
    completed: [],
    categoryCurrentStepId: categories[0]?.id || '',
    categoryPosition: 0,
    categoryCompleted: [],
    categorySelections: Object.fromEntries(categories.map(item => [item.id, {
      tasks:[...item.initialTasks],
      initialTasks:[...item.initialTasks]
    }])),
    categoryStageComplete: false,
    bookmarks: [],
    spotlight: true,
    stageComplete: false,
    open: false,
    updated: Date.now()
  });

  function sanitize(raw) {
    const clean = blankState();
    if (!raw || typeof raw !== 'object') return clean;
    const restoredId = ids.has(raw.currentStepId)
      ? raw.currentStepId
      : steps[Math.min(Math.max(Number(raw.position) || 0, 0), steps.length - 1)].id;
    clean.currentStepId = restoredId;
    clean.position = stepsById.get(restoredId).index;
    clean.completed = [...new Set((Array.isArray(raw.completed) ? raw.completed : []).filter(id => ids.has(id)))];
    const requestedCategoryId = migrateCategoryId(raw.categoryCurrentStepId);
    const restoredCategoryId = categoryIds.has(requestedCategoryId)
      ? requestedCategoryId
      : categories[Math.min(Math.max(Number(raw.categoryPosition) || 0, 0), Math.max(0, categories.length - 1))]?.id;
    clean.categoryCurrentStepId = restoredCategoryId || '';
    clean.categoryPosition = categoriesById.get(clean.categoryCurrentStepId)?.index || 0;
    clean.categoryCompleted = [...new Set((Array.isArray(raw.categoryCompleted) ? raw.categoryCompleted : [])
      .map(migrateCategoryId).filter(id => categoryIds.has(id)))];
    for (const item of categories) {
      const legacyId = Object.keys(CATEGORY_ID_MIGRATIONS).find(id => CATEGORY_ID_MIGRATIONS[id] === item.id);
      const incoming = raw.categorySelections?.[item.id] || (legacyId ? raw.categorySelections?.[legacyId] : null);
      const tasks = [...new Set((Array.isArray(incoming?.tasks) ? incoming.tasks : item.initialTasks).filter(task => ['A','B','C'].includes(task)))];
      clean.categorySelections[item.id] = {
        tasks,
        initialTasks:[...item.initialTasks]
      };
    }
    clean.categoryStageComplete = raw.categoryStageComplete === true && clean.categoryCompleted.length === categories.length;
    clean.bookmarks = [...new Set((Array.isArray(raw.bookmarks) ? raw.bookmarks : [])
      .map(id => ids.has(id) ? id : migrateCategoryId(id)).filter(id => ids.has(id) || categoryIds.has(id)))];
    clean.spotlight = raw.spotlight !== false;
    clean.stageComplete = raw.stageComplete === true && clean.completed.length === steps.length;
    clean.activeStage = raw.activeStage === 'categorization' && clean.stageComplete ? 'categorization' : 'instructions';
    clean.open = raw.open === true;
    clean.updated = Number(raw.updated) || Date.now();
    return clean;
  }

  let saved = {version: VERSION, activeSlot:'1', slots:{}};
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if ((parsed.version === VERSION || LEGACY_VERSIONS.has(parsed.version)) && parsed.slots && typeof parsed.slots === 'object') saved = parsed;
  } catch {}
  let activeSlot = /^[1-3]$/.test(saved.activeSlot) ? saved.activeSlot : '1';
  let state = sanitize(saved.slots[activeSlot]);
  let open = false;
  let helpOpen = false;
  let lastStampSignature = '';
  let lastRouteStepId = '';
  let focusRun = 0;

  const launch = create('button', 'action-btn curation-launch', '✦ Super Curation');
  launch.type = 'button';
  launch.id = 'curation-toggle';
  launch.setAttribute('aria-pressed', 'false');
  toolbar.append(launch);

  const stage = create('nav', 'curation-stage');
  stage.id = 'curation-stage';
  stage.hidden = true;
  stage.setAttribute('aria-label', 'Super Curation 五個階段');
  stage.innerHTML = '<div class="curation-stage-line" aria-hidden="true"></div><div class="curation-stage-fill" aria-hidden="true"></div><div class="curation-stage-items"></div>';
  const stageItems = $('.curation-stage-items', stage);
  model.stages.forEach((item, index) => {
    const button = create('button', 'curation-stage-item');
    button.type = 'button';
    button.disabled = index > 1;
    button.dataset.stageId = item.id;
    button.setAttribute('aria-label', index < 2 ? `Stage ${index + 1} ${item.name}` : `Stage ${index + 1} ${item.name}，尚未開放`);
    button.innerHTML = `<span class="curation-stage-dot">${item.label}</span><span class="curation-stage-label">${item.short}</span><small class="curation-stage-count">${index === 0 ? `1/${steps.length}` : '未開放'}</small>`;
    stageItems.append(button);
  });

  const dock = create('aside', 'curation-dock');
  dock.id = 'curation-dock';
  dock.hidden = true;
  dock.setAttribute('aria-label', '2013 B2 Super Curation 教學卡');
  dock.innerHTML = `
    <div class="curation-dock-top"><div><div class="curation-kicker">SUPER CURATION · 2013 B2</div><small id="curation-part-label">PART 1 · TASK INSTRUCTIONS</small></div><button type="button" class="curation-close" id="curation-close" aria-label="離開 Super Curation">×</button></div>
    <div class="curation-actions"><button type="button" id="curation-prev">← 上一步</button><button type="button" id="curation-help">需要更多協助</button><button type="button" class="primary" id="curation-next">下一步 →</button></div>
    <div class="curation-header"><strong id="curation-stage-title">Stage 1 · 任務指示</strong><button type="button" class="curation-bookmark" id="curation-bookmark" aria-label="將本步加入書籤" aria-pressed="false">☆</button></div>
    <div class="curation-jump"><label>跳至步驟<button type="button" id="curation-step-jump" aria-haspopup="dialog" aria-controls="curation-picker"></button></label><label>書籤<button type="button" id="curation-bookmark-jump" aria-haspopup="dialog" aria-controls="curation-picker">選擇書籤</button></label></div>
    <div class="curation-legend" aria-label="Task 顏色"><span class="curation-chip curation-chip-A">A</span><span class="curation-chip curation-chip-B">B</span><span class="curation-chip curation-chip-C">C</span><span class="curation-chip curation-chip-hint">來源／提示</span></div>
    <div class="curation-local-progress"><span id="curation-step-count"></span><span id="curation-completion-count"></span></div>
    <div class="curation-options"><label><input type="checkbox" id="curation-spotlight"> 聚光燈</label><span>只顯示已到達標記</span></div>
    <div class="curation-content">
      <p class="curation-source" id="curation-source"></p><h2 class="curation-title" id="curation-title"></h2><span class="curation-badge" id="curation-badge"></span>
      <blockquote class="curation-quote" id="curation-quote" lang="en"></blockquote><div class="curation-explanation" id="curation-explanation"></div><fieldset class="curation-category-controls" id="curation-category-controls" hidden><legend>你會先標哪個任務？</legend><div class="curation-category-task-row"><label class="task-A"><input type="checkbox" value="A">Task A</label><label class="task-B"><input type="checkbox" value="B">Task B</label><label class="task-C"><input type="checkbox" value="C">Task C</label></div><small>先看標題；標題不足，才由第一行往下讀至首個決定線索。</small></fieldset>
      <div class="curation-help-panel" id="curation-help-panel" hidden></div><div id="curation-route-card"></div><div id="curation-final"></div>
    </div>
    <details class="curation-save"><summary>自動儲存 · 匯出 / 匯入</summary><div class="curation-save-row"><label for="curation-slot">儲存格</label><select id="curation-slot" aria-label="選擇儲存格"></select><button type="button" id="curation-save-now">儲存</button><button type="button" id="curation-export">匯出</button><label class="curation-import-label">匯入<input id="curation-import" type="file" accept="application/json,.json"></label></div><small class="curation-save-status" id="curation-save-status" role="status"></small></details>`;

  const picker = create('dialog', 'curation-picker');
  picker.id = 'curation-picker';
  picker.setAttribute('aria-label', '選擇教學步驟');
  picker.innerHTML = '<div class="curation-picker-head"><h2 id="curation-picker-title">選擇步驟</h2><button type="button" id="curation-picker-close" aria-label="關閉">×</button></div><input id="curation-picker-search" type="search" placeholder="搜尋步驟或原文…" aria-label="搜尋步驟"><div class="curation-picker-list" id="curation-picker-list"></div>';

  const masks = Array.from({length:4}, () => {
    const mask = create('div', 'curation-mask');
    mask.hidden = true;
    return mask;
  });
  const routeArrow = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  routeArrow.classList.add('curation-route-arrow');
  routeArrow.hidden = true;
  routeArrow.setAttribute('aria-hidden', 'true');
  routeArrow.innerHTML = '<defs><marker id="curation-arrow-head" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M1 1 L7 4 L1 7" fill="none" stroke="#d0282d" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path></marker></defs><path class="curation-route-path" pathLength="1"></path>';
  const routeCallout = create('div', 'curation-route-callout');
  routeCallout.hidden = true;

  document.body.append(stage, dock, picker, ...masks, routeArrow, routeCallout);
  for (let index = 1; index <= 3; index += 1) {
    const option = create('option', '', `Slot ${index}`);
    option.value = String(index);
    $('#curation-slot', dock).append(option);
  }
  $('#curation-slot', dock).value = activeSlot;

  function inCategories() { return state.activeStage === 'categorization'; }
  function currentList() { return inCategories() ? categories : steps; }
  function current() { return inCategories() ? (categories[state.categoryPosition] || categories[0]) : (steps[state.position] || steps[0]); }
  function pageLabel(item) {
    if (item.kind === 'category') return `2013 B2 · Data File 第 ${item.page} 頁 · 資料分類`;
    if (item.kind === 'route') return `來源路線 · Data File 第 ${item.routePage} 頁`;
    if (item.sourcePage <= 11) return `2013 B2 · Data File 第 ${item.sourcePage} 頁`;
    return `2013 B2 · Question-Answer Book 第 ${item.sourcePage - 11} 頁`;
  }
  function persist(message = '') {
    if (inCategories()) {
      state.categoryCurrentStepId = current().id;
      state.categoryPosition = current().index;
    } else {
      state.currentStepId = current().id;
      state.position = current().index;
    }
    state.open = open;
    state.updated = Date.now();
    saved.version = VERSION;
    saved.activeSlot = activeSlot;
    saved.slots[activeSlot] = state;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      $('#curation-save-status', dock).textContent = message || `Slot ${activeSlot} · 已保存在這部裝置`;
    } catch {
      $('#curation-save-status', dock).textContent = '未能寫入瀏覽器儲存；可匯出存檔。';
    }
  }

  function ensurePageVisible(item) {
    const pageNumber = item.kind === 'category' ? item.page : (item.kind === 'route' ? item.routePage : item.sourcePage);
    const page = $(`#page-${pageNumber}`);
    if (page?.hidden) $('[data-filter="all"]')?.click();
  }

  function syncMarks() {
    const stage1Cutoff = inCategories() && state.stageComplete ? steps.length - 1 : state.position;
    const reached = new Set(steps.slice(0, stage1Cutoff + 1).filter(item => item.kind !== 'route').map(item => item.id));
    $$('.curation-source-mark').forEach(mark => {
      mark.classList.toggle('is-revealed', reached.has(mark.dataset.stepId));
      mark.classList.toggle('is-current', !inCategories() && mark.dataset.stepId === current().id);
    });
    for (const item of categories.filter(entry => entry.cluePhrase)) {
      item.targetNode?.classList.toggle('is-revealed', inCategories() && item.index <= state.categoryPosition);
    }
    $$('.curation-source-target').forEach(node => node.classList.remove('curation-source-target'));
    $$('.curation-route-target').forEach(node => node.classList.remove('curation-route-target'));
    $$('.curation-category-target').forEach(node => node.classList.remove('curation-category-target'));
    const item = current();
    if (item.kind === 'category') {
      item.focusTarget?.classList.add('curation-category-target');
    } else if (item.kind === 'route') item.target?.classList.add('curation-route-target');
    else {
      item.target?.classList.add('curation-source-target');
      item.target?.setAttribute('data-curation-current', item.target.dataset.visualKind || item.task || 'neutral');
    }
    $$('.curation-source-mark:not(.curation-source-target)').forEach(node => node.removeAttribute('data-curation-current'));
  }

  function syncTaskStamps() {
    const revealed = [];
    for (const [task, entry] of taskStamps) {
      const visible = entry.step.index <= (inCategories() && state.stageComplete ? steps.length - 1 : state.position);
      entry.paragraph.classList.toggle('curation-task-revealed', visible);
      if (!visible) entry.paragraph.classList.remove('curation-task-stamp-enter');
      if (visible) revealed.push(task);
    }
    const signature = revealed.join('');
    if (signature !== lastStampSignature) {
      for (const task of revealed) {
        const entry = taskStamps.get(task);
        entry.paragraph.classList.toggle('curation-task-stamp-enter', !lastStampSignature.includes(task));
      }
      lastStampSignature = signature;
    }
  }

  function syncFactRouteStamps() {
    for (const group of factRouteGroups.values()) {
      const visibleByTask = new Map();
      for (const routeStep of group.routes) {
        const cutoff = inCategories() && state.stageComplete ? steps.length - 1 : state.position;
        if (routeStep.index <= cutoff && !visibleByTask.has(routeStep.task)) {
          visibleByTask.set(routeStep.task, routeStep);
        }
      }
      const signature = [...visibleByTask.keys()].join('');
      if (signature === group.signature) continue;
      const previous = group.signature;
      group.holder.replaceChildren();
      for (const [task, routeStep] of visibleByTask) {
        const stamp = create('span', `curation-fact-stamp curation-fact-stamp-${task}`, task);
        stamp.dataset.task = task;
        stamp.dataset.curationRouteStep = routeStep.id;
        stamp.setAttribute('role', 'img');
        stamp.setAttribute('aria-label', `來源路線標記：Task ${task}`);
        if (!previous.includes(task)) stamp.classList.add('curation-fact-stamp-enter');
        group.holder.append(stamp);
      }
      group.wrapper.classList.toggle('has-stamps', visibleByTask.size > 0);
      group.signature = signature;
    }
  }

  function syncCategoryStamps() {
    for (const item of categories) {
      const view = categoryViews.get(item.id);
      if (!view) continue;
      const visible = inCategories() && item.index <= state.categoryPosition;
      const selection = state.categorySelections[item.id];
      const signature = visible ? selection.tasks.join('') : '';
      if (signature === view.signature) continue;
      const previous = view.signature;
      view.holder.replaceChildren();
      if (visible) {
        for (const task of selection.tasks) {
          const stamp = create('span', `curation-fact-stamp curation-fact-stamp-${task}`, task);
          stamp.dataset.task = task;
          stamp.dataset.categoryStep = item.id;
          stamp.setAttribute('role', 'img');
          stamp.setAttribute('aria-label', `資料分類：Task ${task}`);
          if (!previous.includes(task)) stamp.classList.add('curation-fact-stamp-enter');
          view.holder.append(stamp);
        }
      }
      view.wrapper.classList.toggle('has-category-stamps', visible && selection.tasks.length > 0);
      view.signature = signature;
    }
  }

  function syncNoteMarks() {
    for (const item of categories.filter(entry => entry.categoryKind === 'note')) {
      const view = noteViews.get(item.id);
      if (!view) continue;
      const visible = inCategories() && item.index <= state.categoryPosition;
      const signature = visible ? (item.noteKind === 'task' ? item.task : 'noise') : '';
      if (signature === view.signature) continue;
      const previous = view.signature;
      view.holder.replaceChildren();
      view.wrapper.classList.toggle('has-note-stamp', visible && item.noteKind === 'task');
      view.heading.classList.toggle('curation-note-noise', visible && item.noteKind === 'noise');
      if (visible && item.noteKind === 'task') {
        const stamp = create('span', `curation-fact-stamp curation-fact-stamp-${item.task}`, item.task);
        stamp.dataset.task = item.task;
        stamp.dataset.categoryStep = item.id;
        stamp.setAttribute('role', 'img');
        stamp.setAttribute('aria-label', `聆聽筆記欄目：Task ${item.task}`);
        if (!previous.includes(item.task)) stamp.classList.add('curation-fact-stamp-enter');
        view.holder.append(stamp);
      }
      view.signature = signature;
    }
  }

  function setMaskRect(mask, top, left, width, height) {
    Object.assign(mask.style, {top:`${Math.max(0, top)}px`, left:`${Math.max(0, left)}px`, width:`${Math.max(0, width)}px`, height:`${Math.max(0, height)}px`});
  }
  function syncSpotlight() {
    const target = current().focusTarget || current().target;
    if (!open || !state.spotlight || !target?.isConnected) {
      masks.forEach(mask => { mask.hidden = true; });
      return;
    }
    const rect = target.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const pad = 10;
    const left = Math.max(0, rect.left - pad);
    const top = Math.max(0, rect.top - pad);
    const right = Math.min(innerWidth, rect.right + pad);
    const bottom = Math.min(innerHeight, rect.bottom + pad);
    masks.forEach(mask => { mask.hidden = false; });
    setMaskRect(masks[0], 0, 0, innerWidth, top);
    setMaskRect(masks[1], top, 0, left, bottom - top);
    setMaskRect(masks[2], top, right, innerWidth - right, bottom - top);
    setMaskRect(masks[3], bottom, 0, innerWidth, innerHeight - bottom);
  }

  function syncRoute() {
    const item = current();
    if (!open || item.kind !== 'route' || !item.target?.isConnected) {
      routeArrow.hidden = true;
      routeArrow.style.display = 'none';
      routeCallout.hidden = true;
      routeArrow.classList.remove('is-drawing');
      lastRouteStepId = '';
      return;
    }
    const rect = item.target.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dockRect = dock.getBoundingClientRect();
    const calloutWidth = 240;
    const calloutLeft = Math.min(innerWidth - calloutWidth - 18, Math.max(dockRect.right + 18, rect.left + Math.min(rect.width * .55, 260)));
    const calloutTop = Math.max(112, Math.min(innerHeight - 105, rect.top - 78));
    routeCallout.innerHTML = `<strong>從指示前往第 ${item.routePage} 頁</strong><span>${item.routeLabel}</span>`;
    Object.assign(routeCallout.style, {left:`${calloutLeft}px`, top:`${calloutTop}px`});
    routeCallout.hidden = false;
    routeArrow.setAttribute('viewBox', `0 0 ${innerWidth} ${innerHeight}`);
    const startX = calloutLeft + 40;
    const startY = calloutTop + 62;
    const endX = rect.left + Math.min(rect.width * .55, 280);
    const endY = rect.top + Math.min(rect.height * .5, 30);
    $('.curation-route-path', routeArrow).setAttribute('d', `M ${startX} ${startY} C ${startX} ${startY + 35}, ${endX - 35} ${endY}, ${endX} ${endY}`);
    routeArrow.hidden = false;
    routeArrow.style.display = 'block';
    if (lastRouteStepId !== item.id) {
      routeArrow.classList.remove('is-drawing');
      void routeArrow.getBoundingClientRect();
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) routeArrow.classList.add('is-drawing');
      lastRouteStepId = item.id;
    }
  }

  function focusCurrent() {
    const item = current();
    const target = item.focusTarget || item.target;
    const run = ++focusRun;
    ensurePageVisible(item);
    requestAnimationFrame(() => {
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      target?.scrollIntoView({block:'center', inline:'nearest', behavior:reduced ? 'instant' : 'smooth'});
      const until = performance.now() + (reduced ? 0 : 900);
      const track = () => {
        if (run !== focusRun) return;
        syncSpotlight();
        syncRoute();
        if (performance.now() < until) requestAnimationFrame(track);
      };
      requestAnimationFrame(track);
    });
  }

  function render(focus = true) {
    if (!open) return;
    const item = current();
    helpOpen = false;
    document.body.classList.toggle('curation-stage-2', inCategories());
    syncMarks();
    syncTaskStamps();
    syncFactRouteStamps();
    syncCategoryStamps();
    syncNoteMarks();
    // Clear any route overlay synchronously before a rapid Next/Back sequence
    // can paint the following source. The later focus pass redraws it when the
    // new step is itself a route.
    syncRoute();
    syncSpotlight();
    const list = currentList();
    const completed = inCategories() ? state.categoryCompleted : state.completed;
    $('#curation-step-count', dock).textContent = `${item.index + 1} / ${list.length} 步`;
    $('#curation-completion-count', dock).textContent = `${completed.length} 已完成`;
    $('#curation-source', dock).textContent = pageLabel(item);
    $('#curation-title', dock).textContent = item.title;
    const badge = $('#curation-badge', dock);
    badge.textContent = inCategories() ? item.badge : (item.badge || '任務指示');
    badge.className = `curation-badge${item.task ? ` task-${item.task}` : ''}`;
    $('#curation-part-label', dock).textContent = inCategories() ? 'PART 2 · DATA CATEGORIZATION' : 'PART 1 · TASK INSTRUCTIONS';
    $('#curation-stage-title', dock).textContent = inCategories() ? 'Stage 2 · 資料分類' : 'Stage 1 · 任務指示';
    $('#curation-quote', dock).textContent = inCategories() ? item.sourceTitle : item.sourcePhrase;
    $('#curation-explanation', dock).innerHTML = `<p>${item.explanation}</p>`;
    const controls = $('#curation-category-controls', dock);
    controls.hidden = !inCategories() || !item.choiceRequired;
    if (inCategories() && item.choiceRequired) {
      const selection = state.categorySelections[item.id];
      $$('input[type="checkbox"][value]', controls).forEach(input => { input.checked = selection.tasks.includes(input.value); });
    }
    const help = $('#curation-help-panel', dock);
    help.hidden = true;
    help.innerHTML = inCategories()
      ? `<strong>再看一次分類理由</strong><p>${item.help}</p>${item.choiceRequired ? `<small>先標分類：${item.initialTasks.map(task => `Task ${task}`).join(' + ')}。Stage 4 逐句閱讀後才修正取證，不在 Stage 2 預讀答案。</small>` : ''}`
      : (item.help || '先說出這句屬於「身分、讀者、文類、必寫內容、來源、限制」哪一類，再檢查它是否能直接放進答案。');
    const routeCard = $('#curation-route-card', dock);
    routeCard.innerHTML = item.kind === 'route' ? `<div class="curation-route-card"><strong>只建立路線，不取答案</strong>定位：Data File 第 ${item.routePage} 頁 · ${item.routeLabel}</div>` : '';
    const isCategoryFinal = inCategories() && item.index === categories.length - 1;
    $('#curation-final', dock).innerHTML = isCategoryFinal
      ? '<div class="curation-final">✓ Part 2 最後一個筆記欄目。完成後保存資料分類並標記 Stage 2 完成；Stage 3 仍會鎖定。</div>'
      : (!inCategories() && item.final ? '<div class="curation-final">✓ Part 1 最後一步：三項任務合約已完整核對。完成後可進入 Stage 2 資料分類。</div>' : '');
    const bookmarked = state.bookmarks.includes(item.id);
    $('#curation-bookmark', dock).textContent = bookmarked ? '★' : '☆';
    $('#curation-bookmark', dock).setAttribute('aria-pressed', String(bookmarked));
    $('#curation-step-jump', dock).textContent = `${item.index + 1}. ${item.title}`;
    $('#curation-bookmark-jump', dock).textContent = state.bookmarks.length ? `${state.bookmarks.length} 個書籤` : '選擇書籤';
    $('#curation-prev', dock).disabled = item.index === 0;
    const next = $('#curation-next', dock);
    if (inCategories()) {
      const hasChoice = !item.choiceRequired || state.categorySelections[item.id].tasks.length > 0;
      next.disabled = !hasChoice || (isCategoryFinal && state.categoryStageComplete);
      next.textContent = isCategoryFinal ? (state.categoryStageComplete ? 'Stage 2 已完成 ✓' : '完成 Stage 2 ✓') : '下一步 →';
    } else {
      next.disabled = false;
      next.textContent = item.final ? (state.stageComplete ? '進入 Stage 2 →' : '完成 Stage 1 ✓') : '下一步 →';
    }
    $('#curation-spotlight', dock).checked = state.spotlight;
    for (const [index, stageItem] of model.stages.entries()) {
      const button = $(`[data-stage-id="${stageItem.id}"]`, stage);
      const active = (index === 0 && !inCategories()) || (index === 1 && inCategories());
      const done = (index === 0 && state.stageComplete) || (index === 1 && state.categoryStageComplete);
      button.classList.toggle('active', active);
      button.classList.toggle('done', done);
      button.disabled = index === 1 ? !state.stageComplete : index > 1;
      button.toggleAttribute('aria-current', active);
      $('.curation-stage-dot', button).textContent = done ? '✓' : String(index + 1);
      $('.curation-stage-count', button).textContent = index === 0
        ? (state.stageComplete ? '完成' : `${state.position + 1}/${steps.length}`)
        : (index === 1 ? (state.categoryStageComplete ? '完成' : (state.stageComplete ? `${state.categoryPosition + 1}/${categories.length}` : '未開放')) : '未開放');
    }
    $('.curation-stage-fill', stage).style.width = state.stageComplete ? '20%' : '0';
    persist();
    if (focus) focusCurrent(); else { syncSpotlight(); syncRoute(); }
  }

  function goTo(index, options = {}) {
    if (inCategories()) {
      state.categoryPosition = Math.min(Math.max(index, 0), categories.length - 1);
      state.categoryCurrentStepId = current().id;
    } else {
      state.position = Math.min(Math.max(index, 0), steps.length - 1);
      state.currentStepId = current().id;
    }
    render(options.focus !== false);
  }

  function switchStage(stageId, options = {}) {
    if (stageId === 'categorization' && !state.stageComplete) return;
    state.activeStage = stageId === 'categorization' ? 'categorization' : 'instructions';
    render(options.focus !== false);
  }

  function setOpen(value) {
    open = Boolean(value);
    stage.hidden = !open;
    dock.hidden = !open;
    document.body.classList.toggle('curation-active', open);
    launch.setAttribute('aria-pressed', String(open));
    launch.textContent = open ? '✦ 離開 Curation' : '✦ Super Curation';
    if (open) render();
    else {
      masks.forEach(mask => { mask.hidden = true; });
      routeArrow.hidden = true;
      routeArrow.style.display = 'none';
      routeCallout.hidden = true;
      $$('.curation-source-target,.curation-route-target,.curation-category-target').forEach(node => node.classList.remove('curation-source-target', 'curation-route-target', 'curation-category-target'));
      persist();
    }
  }

  function showPicker(kind) {
    const list = $('#curation-picker-list', picker);
    list.replaceChildren();
    $('#curation-picker-title', picker).textContent = kind === 'bookmark' ? '已儲存的書籤' : '跳至步驟';
    const lookup = id => stepsById.get(id) || categoriesById.get(id);
    const source = kind === 'bookmark' ? state.bookmarks.map(lookup).filter(Boolean) : currentList();
    for (const item of source) {
      const button = create('button', 'curation-picker-option');
      button.type = 'button';
      const sourceText = item.sourcePhrase || item.sourceTitle;
      button.dataset.search = canonical(`${item.title} ${sourceText} ${item.id}`).toLowerCase();
      button.innerHTML = `<strong>${item.index + 1}. ${item.title}</strong><span>${sourceText}</span>`;
      button.addEventListener('click', () => { picker.close(); goTo(item.index); });
      list.append(button);
    }
    if (!source.length) list.append(create('p', '', '暫時沒有書籤。'));
    $('#curation-picker-search', picker).value = '';
    picker.showModal();
    $('#curation-picker-search', picker).focus();
  }

  launch.addEventListener('click', () => setOpen(!open));
  $('#curation-close', dock).addEventListener('click', () => setOpen(false));
  $('#curation-prev', dock).addEventListener('click', () => goTo((inCategories() ? state.categoryPosition : state.position) - 1));
  $('#curation-next', dock).addEventListener('click', () => {
    const item = current();
    if (inCategories()) {
      if (item.choiceRequired && !state.categorySelections[item.id].tasks.length) return;
      if (!state.categoryCompleted.includes(item.id)) state.categoryCompleted.push(item.id);
      if (item.index === categories.length - 1) {
        state.categoryStageComplete = state.categoryCompleted.length === categories.length;
        render(false);
        $('#curation-save-status', dock).textContent = 'Stage 2 已完成並保存；Stage 3 仍未開放。';
        return;
      }
      goTo(item.index + 1);
      return;
    }
    if (item.final && state.stageComplete) {
      switchStage('categorization');
      return;
    }
    if (!state.completed.includes(item.id)) state.completed.push(item.id);
    if (item.final) {
      state.stageComplete = state.completed.length === steps.length;
      render(false);
      $('#curation-save-status', dock).textContent = 'Stage 1 已完成並保存；可進入 Stage 2。';
      return;
    }
    goTo(item.index + 1);
  });
  $('#curation-help', dock).addEventListener('click', () => {
    helpOpen = !helpOpen;
    $('#curation-help-panel', dock).hidden = !helpOpen;
    $('#curation-help', dock).setAttribute('aria-expanded', String(helpOpen));
  });
  $('#curation-bookmark', dock).addEventListener('click', () => {
    const id = current().id;
    state.bookmarks = state.bookmarks.includes(id) ? state.bookmarks.filter(item => item !== id) : [...state.bookmarks, id];
    render(false);
  });
  $('#curation-spotlight', dock).addEventListener('change', event => {
    state.spotlight = event.target.checked;
    syncSpotlight();
    persist();
  });
  $('#curation-category-controls', dock).addEventListener('change', event => {
    if (!inCategories()) return;
    const item = current();
    if (!item.choiceRequired) return;
    const selection = state.categorySelections[item.id];
    if (event.target.matches('input[value]')) {
      selection.tasks = $$('input[value]:checked', event.currentTarget).map(input => input.value);
    }
    if (!selection.tasks.length) {
      state.categoryCompleted = state.categoryCompleted.filter(id => id !== item.id);
      state.categoryStageComplete = false;
    }
    if (categoryViews.has(item.id)) categoryViews.get(item.id).signature = '__refresh__';
    render(false);
    persist('先標分類已保存；逐句閱讀後可修訂。');
  });
  $('[data-stage-id="instructions"]', stage).addEventListener('click', () => switchStage('instructions'));
  $('[data-stage-id="categorization"]', stage).addEventListener('click', () => switchStage('categorization'));
  $('#curation-step-jump', dock).addEventListener('click', () => showPicker('step'));
  $('#curation-bookmark-jump', dock).addEventListener('click', () => showPicker('bookmark'));
  $('#curation-picker-close', picker).addEventListener('click', () => picker.close());
  $('#curation-picker-search', picker).addEventListener('input', event => {
    const query = canonical(event.target.value).toLowerCase();
    $$('.curation-picker-option', picker).forEach(button => { button.hidden = !button.dataset.search.includes(query); });
  });
  picker.addEventListener('click', event => { if (event.target === picker) picker.close(); });
  $('#curation-slot', dock).addEventListener('change', event => {
    persist();
    activeSlot = event.target.value;
    state = sanitize(saved.slots[activeSlot]);
    render();
  });
  $('#curation-save-now', dock).addEventListener('click', () => persist('目前進度已儲存。'));
  $('#curation-export', dock).addEventListener('click', () => {
    persist();
    const blob = new Blob([JSON.stringify({version:VERSION, exported:new Date().toISOString(), state}, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const anchor = create('a');
    anchor.href = url;
    anchor.download = `2013-b2-stage2-v2-slot-${activeSlot}.json`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  $('#curation-import', dock).addEventListener('change', async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      if (file.size > 1024 * 1024) throw new Error('存檔過大');
      const imported = JSON.parse(await file.text());
      if (!(imported.version === VERSION || LEGACY_VERSIONS.has(imported.version)) || !imported.state) throw new Error('版本不符');
      state = sanitize(imported.state);
      render();
      persist('匯入完成；已按穩定步驟 ID 還原。');
    } catch (error) {
      $('#curation-save-status', dock).textContent = `匯入失敗：${error.message}`;
    }
    event.target.value = '';
  });

  window.addEventListener('scroll', () => { if (open) { syncSpotlight(); syncRoute(); } }, {passive:true});
  window.addEventListener('resize', () => { if (open) { syncSpotlight(); syncRoute(); } });
  document.addEventListener('keydown', event => {
    if (!open || /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName)) return;
    if (event.key === 'ArrowLeft' && !$('#curation-prev', dock).disabled) { event.preventDefault(); goTo((inCategories() ? state.categoryPosition : state.position) - 1); }
    if (event.key === 'ArrowRight' && !$('#curation-next', dock).disabled) { event.preventDefault(); $('#curation-next', dock).click(); }
    if (event.key === 'Escape' && !picker.open) setOpen(false);
  });

  const runtimeApi = Object.freeze({
    version: VERSION,
    steps,
    categories,
    missingTargets: missing,
    getState: () => JSON.parse(JSON.stringify(state)),
    goToId: id => {
      const stage1Item = stepsById.get(id);
      const categoryItem = categoriesById.get(id);
      if (stage1Item) { switchStage('instructions', {focus:false}); goTo(stage1Item.index); }
      if (categoryItem && state.stageComplete) { switchStage('categorization', {focus:false}); goTo(categoryItem.index); }
    },
    switchStage,
    setOpen,
    reset: () => { state = blankState(); render(); }
  });
  window.__EDMUND_2013_STAGE1__ = runtimeApi;
  window.__EDMUND_2013_SUPER_CURATION__ = runtimeApi;

  if (missing.length) {
    console.error('2013 B2 Super Curation source mapping failures:', missing);
    $('#curation-save-status', dock).textContent = `來源對應錯誤：${missing.length} 項；請勿發佈。`;
  }

  const queryOpen = new URLSearchParams(location.search).get('curation') === '1';
  if (queryOpen || state.open) setOpen(true);
})();
