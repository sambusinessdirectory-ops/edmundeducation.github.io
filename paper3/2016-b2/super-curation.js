(() => {
  'use strict';

  const lesson = window.EDMUND_2016_B2_CURATION;
  if (!lesson?.steps?.length || !document.querySelector('#page-4 .email-window')) return;

  const SCHEMA = 1;
  const steps = lesson.steps.map((step, index) => ({...step, index}));
  const stepById = new Map(steps.map(step => [step.id, step]));
  const marksByStep = new Map();
  const targetAudit = [];
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const make = (tag, className = '', text = '') => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };
  const canonical = value => String(value).normalize('NFKC')
    .replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/\u00a0/g, ' ');

  function blankState() {
    return {
      currentStepId: steps[0].id,
      completedIds: [],
      bookmarks: [],
      spotlight: true,
      open: false,
      stageComplete: false,
      helpDrafts: {}
    };
  }

  function restore(raw) {
    const clean = blankState();
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return clean;
    const known = list => [...new Set((Array.isArray(list) ? list : []).filter(id => stepById.has(id)))];
    clean.completedIds = known(raw.completedIds);
    clean.bookmarks = known(raw.bookmarks);
    clean.currentStepId = stepById.has(raw.currentStepId) ? raw.currentStepId : steps[0].id;
    clean.spotlight = raw.spotlight !== false;
    clean.open = raw.open === true;
    clean.stageComplete = raw.stageComplete === true && clean.completedIds.includes(steps.at(-1).id);
    if (raw.helpDrafts && typeof raw.helpDrafts === 'object' && !Array.isArray(raw.helpDrafts)) {
      clean.helpDrafts = Object.fromEntries(Object.entries(raw.helpDrafts)
        .filter(([id, value]) => stepById.has(id) && typeof value === 'string')
        .map(([id, value]) => [id, value.slice(0, 4000)]));
    }
    return clean;
  }

  let state = blankState();
  try {
    const stored = JSON.parse(localStorage.getItem(lesson.storageKey) || 'null');
    if (stored?.schema === SCHEMA && stored.version === lesson.version) state = restore(stored.state);
  } catch (error) {
    console.warn('2016 Stage 1 progress could not be restored.', error);
  }

  function persist(message = '進度已自動儲存在此瀏覽器') {
    try {
      localStorage.setItem(lesson.storageKey, JSON.stringify({schema: SCHEMA, version: lesson.version, state}));
      if ($('#curation-save-status')) $('#curation-save-status').textContent = message;
    } catch {
      if ($('#curation-save-status')) $('#curation-save-status').textContent = '未能儲存；本次操作仍可繼續。';
    }
  }

  function locateRange(root, phrase) {
    const raw = root.textContent || '';
    let start = raw.indexOf(phrase);
    if (start < 0) start = canonical(raw).indexOf(canonical(phrase));
    if (start < 0) return null;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let offset = 0;
    let node;
    while ((node = walker.nextNode())) {
      nodes.push({node, start: offset, end: offset + node.length});
      offset += node.length;
    }
    const first = nodes.find(item => item.end > start);
    const last = nodes.find(item => item.end >= start + phrase.length);
    if (!first || !last) return null;
    const range = document.createRange();
    range.setStart(first.node, start - first.start);
    range.setEnd(last.node, start + phrase.length - last.start);
    return range;
  }

  function markPhrase(step, phrase, primary = false, point = null) {
    const root = $(step.selector);
    if (!root) {
      targetAudit.push({stepId: step.id, selector: step.selector, phrase, reason: 'selector-missing'});
      return null;
    }
    const reused = $$('.curation-mark', root).find(mark => canonical(mark.textContent) === canonical(phrase));
    if (reused) {
      reused.dataset.stepIds = [...new Set([...(reused.dataset.stepIds || '').split(',').filter(Boolean), step.id])].join(',');
      if (point && !reused.dataset.point) reused.dataset.point = point;
      if (primary) step.target = reused;
      return reused;
    }
    const range = locateRange(root, phrase);
    if (!range) {
      targetAudit.push({stepId: step.id, selector: step.selector, phrase, reason: 'phrase-missing'});
      return null;
    }
    const mark = make('mark', `curation-mark curation-mark-${step.kind}`);
    mark.dataset.stepIds = step.id;
    if (point) mark.dataset.point = point;
    if (step.task) mark.dataset.task = step.task;
    mark.append(range.extractContents());
    range.insertNode(mark);
    if (primary) step.target = mark;
    return mark;
  }

  for (const step of steps) {
    const marks = [];
    const customHighlights = Array.isArray(step.highlights);
    const highlights = step.highlight === false ? [] : customHighlights
      ? step.highlights
      : [{phrase: step.phrase, point: step.point}, ...(step.secondaryPhrases || []).map(phrase => ({phrase}))];
    for (const [index, entry] of highlights.entries()) {
      const spec = typeof entry === 'string' ? {phrase: entry} : entry;
      const mark = markPhrase(step, spec.phrase, index === 0, spec.point || null);
      if (mark) marks.push(mark);
    }
    if (!marks.length) step.target = $(step.selector);
    marksByStep.set(step.id, marks);
  }
  if (targetAudit.length) console.error('2016 Stage 1 target audit failed.', targetAudit);

  const taskParagraphs = {
    A: $('#page-4 .email-content .bilingual:nth-of-type(3) p[lang="en"]'),
    B: $('#page-4 .email-content .bilingual:nth-of-type(4) p[lang="en"]'),
    C: $('#page-4 .email-content .bilingual:nth-of-type(5) p[lang="en"]')
  };
  Object.entries(taskParagraphs).forEach(([task, paragraph]) => {
    if (!paragraph) return;
    paragraph.dataset.curationTask = task;
    const badge = make('span', `curation-task-badge curation-task-badge-${task}`, task);
    badge.setAttribute('aria-hidden', 'true');
    paragraph.append(badge);
  });

  const sourceTaskVisits = steps.filter(step => step.sourceJump && step.task);
  const sourceTaskMarkers = sourceTaskVisits.map(step => {
    const heading = $(step.selector);
    if (!heading) return null;
    const marker = make('span', `curation-source-task curation-source-task-${step.task}`, step.task);
    marker.setAttribute('role', 'img');
    marker.setAttribute('aria-label', `Task ${step.task} 來源`);
    marker.setAttribute('aria-hidden', 'true');
    heading.append(marker);
    return {step, marker};
  }).filter(Boolean);

  const fileStampGroups = new Map();
  for (const step of sourceTaskVisits) {
    const page = $(`#page-${step.page}`);
    const header = page?.querySelector(':scope > header');
    if (!header) continue;
    let group = fileStampGroups.get(step.page);
    if (!group) {
      const holder = make('div', 'curation-file-stamps');
      holder.setAttribute('aria-label', '這頁已發現的任務標記');
      header.prepend(holder);
      group = {header, holder, stamps: []};
      fileStampGroups.set(step.page, group);
    }
    if (group.stamps.some(item => item.step.task === step.task)) continue;
    const stamp = make('span', `curation-file-stamp curation-file-stamp-${step.task}`, step.task);
    stamp.setAttribute('role', 'img');
    stamp.setAttribute('aria-label', `暫定標記：Task ${step.task}`);
    stamp.hidden = true;
    group.holder.append(stamp);
    group.stamps.push({step, stamp});
  }

  const launch = make('button', 'curation-launch', '✦ Super Curation');
  launch.type = 'button';
  launch.id = 'curation-toggle';
  launch.setAttribute('aria-pressed', 'false');
  $('.toolbar')?.append(launch);

  const rail = make('nav', 'curation-stage');
  rail.hidden = true;
  rail.setAttribute('aria-label', 'Super Curation 五階段進度');
  rail.innerHTML = `<div class="curation-stage-line"></div><div class="curation-stage-items">${lesson.stages.map((stage, index) => `<button type="button" class="curation-stage-item${index === 0 ? ' active' : ''}" data-stage="${stage.id}" ${stage.enabled ? '' : 'disabled'} aria-current="${index === 0 ? 'step' : 'false'}"><span class="curation-stage-dot">${index + 1}</span><span class="curation-stage-label">${stage.label}</span><span class="curation-stage-count">${index === 0 ? `0/${steps.length}` : '未開放'}</span></button>`).join('')}</div>`;

  const dock = make('aside', 'curation-dock');
  dock.hidden = true;
  dock.setAttribute('aria-label', '2016 Super Curation 教學面板');
  dock.innerHTML = `
    <header><span>2016 B2 · SUPER CURATION · STAGE 1</span><button type="button" id="curation-close" aria-label="關閉 Super Curation">×</button></header>
    <div class="curation-actions"><button type="button" id="curation-prev">← 上一步</button><button type="button" id="curation-help">需要更多協助</button><button type="button" id="curation-next">下一步 →</button></div>
    <div class="curation-tools"><label>跳至已開放步驟<select id="curation-step-jump" aria-label="跳至已開放步驟"></select></label><label>書籤<select id="curation-bookmark-jump" aria-label="跳至書籤"><option value="">選擇書籤</option></select></label></div>
    <div class="curation-meta"><span id="curation-step-id"></span><button type="button" id="curation-bookmark" aria-label="將本步加入書籤" aria-pressed="false">☆</button></div>
    <div class="curation-progress"><span id="curation-step-count"></span><progress id="curation-progress" min="0" max="${steps.length}" value="0" aria-label="Stage 1 完成進度"></progress></div>
    <div class="curation-options"><label><input type="checkbox" id="curation-spotlight"> 聚光燈</label><span id="curation-bookmark-count">尚無書籤</span></div>
    <div class="curation-legend"><span class="color-A">A · 回覆電郵</span><span class="color-B">B · 網站介紹</span><span class="color-C">C · 報告主體</span><span class="color-hint">來源／提示</span><span class="color-noise">不取材</span></div>
    <section class="curation-content"><p id="curation-source"></p><h2 id="curation-title"></h2><blockquote id="curation-quote" lang="en"></blockquote><p id="curation-translation"></p><p id="curation-type"></p><div id="curation-explanation"></div><ul id="curation-points" hidden></ul></section>
    <small id="curation-save-status" role="status">尚未儲存</small>`;

  const taskMap = make('aside', 'curation-task-map');
  taskMap.hidden = true;
  taskMap.setAttribute('aria-label', '三項寫作任務地圖');
  taskMap.innerHTML = `<h2>三項任務地圖</h2><p>只顯示已讀到的任務規格；Stage 2–5 的證據與答案仍然隱藏。</p>${[['A','回覆電郵 · Ms Ip'],['B','網站介紹 · 公眾訪客'],['C','報告主體 · Museum Board']].map(([task,label]) => `<section data-task="${task}"><header><span>Task ${task}</span><strong>未讀到</strong></header><p>${label}</p><ol></ol></section>`).join('')}`;

  const dialog = make('dialog', 'curation-help-dialog');
  dialog.innerHTML = `<form method="dialog" id="curation-help-form"><header><div><small>ASK A QUESTION · 提問</small><h2>需要更多協助</h2></div><button type="button" id="curation-help-close" aria-label="關閉提問表格">×</button></header><p id="curation-help-context"></p><p id="curation-help-guidance"></p><label for="curation-help-question">你的問題</label><textarea id="curation-help-question" rows="5" maxlength="4000" placeholder="例如：為甚麼這句只是來源提示，不是可用內容？"></textarea><p id="curation-help-status" role="status">問題草稿只會儲存在此瀏覽器，不會自動傳送。</p><div><button type="button" id="curation-help-cancel">取消</button><button type="submit">儲存問題草稿</button></div></form>`;

  const routeArrow = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  routeArrow.id = 'curation-route-arrow';
  routeArrow.setAttribute('hidden', '');
  routeArrow.innerHTML = '<defs><marker id="curation-tip-2016" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M1 1L7 4L1 7" fill="none" stroke="#d0282d" stroke-width="1.6"/></marker></defs><path class="curation-route-path" marker-end="url(#curation-tip-2016)"/>';
  const routeCallout = make('div', 'curation-route-callout');
  routeCallout.hidden = true;
  const masks = Array.from({length: 4}, () => {
    const mask = make('div', 'curation-mask');
    mask.hidden = true;
    document.body.append(mask);
    return mask;
  });
  document.body.append(rail, dock, taskMap, routeArrow, routeCallout, dialog);

  const current = () => stepById.get(state.currentStepId) || steps[0];
  const completedCount = () => state.completedIds.length;
  const typeLabel = step => step.final ? 'Stage 1 · 完成檢查' : step.type === 1 ? 'Task A · 任務要求' : step.type === 2 ? 'Task B · 任務要求' : step.type === 3 ? 'Task C · 任務要求' : step.type === 4 ? '重要語氣／資格' : step.type === 6 ? '不寫入答案' : '來源／格式提示';

  function reveal(step) {
    $$('.curation-mark').forEach(mark => mark.classList.remove('is-revealed'));
    for (const item of steps.slice(0, step.index + 1)) {
      for (const mark of marksByStep.get(item.id) || []) mark.classList.add('is-revealed');
    }
    Object.entries(taskParagraphs).forEach(([task, paragraph]) => {
      const first = steps.find(item => item.task === task)?.index ?? 999;
      paragraph?.classList.toggle('curation-task-revealed', step.index >= first);
    });
    for (const item of sourceTaskMarkers) {
      const revealed = step.index >= item.step.index;
      item.marker.classList.toggle('is-revealed', revealed);
      item.marker.setAttribute('aria-hidden', String(!revealed));
    }
    for (const group of fileStampGroups.values()) {
      let visible = 0;
      for (const item of group.stamps) {
        item.stamp.hidden = step.index < item.step.index;
        if (!item.stamp.hidden) visible += 1;
      }
      group.header.classList.toggle('curation-has-file-stamps', visible > 0);
    }
    $$('.curation-target').forEach(mark => mark.classList.remove('curation-target'));
    if (step.highlight !== false && step.target?.isConnected) step.target.classList.add('curation-target');
  }

  function renderTaskMap(step) {
    for (const task of ['A', 'B', 'C']) {
      const relevant = steps.filter(item => item.task === task && item.kind === task && !item.sourceJump && !item.routeReturn && item.index <= step.index);
      const total = steps.filter(item => item.task === task && item.kind === task && !item.sourceJump && !item.routeReturn).length;
      const card = $(`.curation-task-map [data-task="${task}"]`);
      card.classList.toggle('is-revealed', relevant.length > 0);
      $('strong', card).textContent = relevant.length ? `${relevant.length}/${total}` : '未讀到';
      const list = $('ol', card);
      list.replaceChildren(...relevant.slice(-4).map(item => make('li', '', item.title)));
    }
  }

  function hideSpotlight() {
    masks.forEach(mask => { mask.hidden = true; });
  }

  function spotlight() {
    const target = current().target;
    if (!state.open || !state.spotlight || !target?.isConnected) return hideSpotlight();
    const rect = target.getBoundingClientRect();
    const top = Math.max(0, rect.top - 10);
    const bottom = Math.min(innerHeight, rect.bottom + 10);
    const left = Math.max(0, rect.left - 10);
    const right = Math.min(innerWidth, rect.right + 10);
    const boxes = [
      [0, 0, innerWidth, top], [0, bottom, innerWidth, Math.max(0, innerHeight - bottom)],
      [0, top, left, Math.max(0, bottom - top)], [right, top, Math.max(0, innerWidth - right), Math.max(0, bottom - top)]
    ];
    masks.forEach((mask, index) => {
      const [x, y, width, height] = boxes[index];
      Object.assign(mask.style, {left:`${x}px`, top:`${y}px`, width:`${width}px`, height:`${height}px`});
      mask.hidden = false;
    });
  }

  function route(step) {
    if (!state.open || !step.sourceJump || !step.target?.isConnected) {
      routeArrow.setAttribute('hidden', '');
      routeCallout.hidden = true;
      return;
    }
    const rect = step.target.getBoundingClientRect();
    const startX = 360;
    const startY = 230;
    const endX = Math.max(20, rect.left - 12);
    const endY = Math.max(20, Math.min(innerHeight - 20, rect.top + rect.height / 2));
    routeArrow.setAttribute('viewBox', `0 0 ${innerWidth} ${innerHeight}`);
    routeArrow.querySelector('path.curation-route-path').setAttribute('d', `M${startX},${startY} C${startX + 100},${startY} ${endX - 100},${endY} ${endX},${endY}`);
    routeArrow.removeAttribute('hidden');
    routeCallout.innerHTML = `<strong>${step.sourcePage}</strong><span>${step.routeLabel || step.title}</span>`;
    routeCallout.hidden = false;
  }

  function rebuildSelects(step) {
    const jump = $('#curation-step-jump');
    jump.replaceChildren(...steps.map(item => {
      const option = make('option', '', `${item.index + 1}. ${item.title}`);
      option.value = item.id;
      option.selected = item.id === step.id;
      return option;
    }));
    const bookmarks = $('#curation-bookmark-jump');
    const placeholder = make('option', '', '選擇書籤');
    placeholder.value = '';
    bookmarks.replaceChildren(placeholder, ...state.bookmarks.map(id => {
      const item = stepById.get(id);
      const option = make('option', '', `${item.index + 1}. ${item.title}`);
      option.value = id;
      return option;
    }));
  }

  function focusSource(step) {
    if (!step.target?.isConnected) return;
    step.target.scrollIntoView({block: 'center', inline: 'nearest', behavior: 'auto'});
    requestAnimationFrame(() => requestAnimationFrame(() => { spotlight(); route(step); }));
  }

  function render(focus = true) {
    const step = current();
    reveal(step);
    renderTaskMap(step);
    rebuildSelects(step);
    $('#curation-step-id').textContent = `STEP ID · ${step.id}`;
    $('#curation-step-count').textContent = `步驟 ${step.index + 1} / ${steps.length} · 完成 ${completedCount()} / ${steps.length}`;
    $('#curation-progress').value = completedCount();
    $('.curation-stage-item[data-stage="instruction"] .curation-stage-count').textContent = `${completedCount()}/${steps.length}`;
    $('#curation-source').textContent = step.sourcePage;
    $('#curation-title').textContent = step.title;
    $('#curation-quote').textContent = step.quote || step.phrase;
    $('#curation-translation').textContent = step.translation;
    $('#curation-type').textContent = typeLabel(step);
    $('#curation-explanation').textContent = step.explanation;
    const points = $('#curation-points');
    points.replaceChildren(...(step.points || []).map(point => make('li', '', point)));
    points.hidden = !step.points?.length;
    $('#curation-prev').disabled = step.index === 0;
    $('#curation-next').disabled = state.stageComplete && step.final;
    $('#curation-next').textContent = state.stageComplete && step.final ? 'Stage 1 已完成 ✓' : step.final ? '完成 Stage 1 ✓' : '下一步 →';
    $('#curation-bookmark').textContent = state.bookmarks.includes(step.id) ? '★' : '☆';
    $('#curation-bookmark').setAttribute('aria-pressed', String(state.bookmarks.includes(step.id)));
    $('#curation-bookmark-count').textContent = state.bookmarks.length ? `${state.bookmarks.length} 個書籤` : '尚無書籤';
    $('#curation-spotlight').checked = state.spotlight;
    persist(state.stageComplete ? 'Stage 1 已完成；Stage 2–5 保持鎖定。' : undefined);
    if (focus) focusSource(step); else { spotlight(); route(step); }
  }

  function setCurrent(index) {
    state.currentStepId = steps[Math.max(0, Math.min(steps.length - 1, index))].id;
    render(true);
  }

  function setOpen(open) {
    state.open = open;
    rail.hidden = !open;
    dock.hidden = !open;
    taskMap.hidden = !open;
    document.body.classList.toggle('curation-active', open);
    launch.setAttribute('aria-pressed', String(open));
    launch.textContent = open ? '✦ 離開 Curation' : '✦ Super Curation';
    if (open) render(true);
    else {
      hideSpotlight();
      routeArrow.setAttribute('hidden', '');
      routeCallout.hidden = true;
      persist('已儲存離開位置');
    }
  }

  launch.addEventListener('click', () => setOpen(!state.open));
  $('#curation-close').addEventListener('click', () => setOpen(false));
  $('#curation-prev').addEventListener('click', () => setCurrent(current().index - 1));
  $('#curation-next').addEventListener('click', () => {
    const step = current();
    if (!state.completedIds.includes(step.id)) state.completedIds.push(step.id);
    if (step.final) {
      state.stageComplete = true;
      render(false);
    } else setCurrent(step.index + 1);
  });
  $('#curation-bookmark').addEventListener('click', () => {
    const id = current().id;
    state.bookmarks = state.bookmarks.includes(id) ? state.bookmarks.filter(item => item !== id) : [...state.bookmarks, id];
    render(false);
  });
  $('#curation-spotlight').addEventListener('change', event => {
    state.spotlight = event.target.checked;
    spotlight();
    persist();
  });
  $('#curation-step-jump').addEventListener('change', event => {
    const step = stepById.get(event.target.value);
    if (step) setCurrent(step.index);
  });
  $('#curation-bookmark-jump').addEventListener('change', event => {
    const step = stepById.get(event.target.value);
    if (step) setCurrent(step.index);
  });
  $('#curation-help').addEventListener('click', () => {
    const step = current();
    $('#curation-help-context').textContent = `${step.sourcePage} · ${step.title} · STEP ID ${step.id}`;
    $('#curation-help-guidance').textContent = step.help;
    $('#curation-help-question').value = state.helpDrafts[step.id] || '';
    $('#curation-help-status').textContent = '問題草稿只會儲存在此瀏覽器，不會自動傳送。';
    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.open = true;
  });
  const closeHelp = () => { if (typeof dialog.close === 'function') dialog.close(); else dialog.open = false; };
  $('#curation-help-close').addEventListener('click', closeHelp);
  $('#curation-help-cancel').addEventListener('click', closeHelp);
  $('#curation-help-form').addEventListener('submit', event => {
    event.preventDefault();
    const value = $('#curation-help-question').value.trim();
    if (value) state.helpDrafts[current().id] = value; else delete state.helpDrafts[current().id];
    persist('問題草稿已儲存於此瀏覽器；未有傳送。');
    $('#curation-help-status').textContent = '問題草稿已儲存於此瀏覽器；未有傳送。';
  });
  document.addEventListener('keydown', event => {
    if (!state.open || dialog.open || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
    if (event.key === 'ArrowLeft') setCurrent(current().index - 1);
    if (event.key === 'ArrowRight' && !$('#curation-next').disabled) $('#curation-next').click();
    if (event.key === 'Escape') setOpen(false);
  });
  window.addEventListener('scroll', () => { spotlight(); route(current()); }, {passive: true});
  window.addEventListener('resize', () => { spotlight(); route(current()); });
  window.addEventListener('pagehide', () => persist());

  window.EDMUND_2016_B2_CURATION_DEBUG = Object.freeze({
    version: lesson.version,
    steps: steps.map(({target, ...step}) => step),
    targetAudit,
    getState: () => ({...state, position: current().index, stepId: current().id}),
    open: () => setOpen(true),
    close: () => setOpen(false),
    next: () => $('#curation-next').click(),
    prev: () => $('#curation-prev').click(),
    goById: id => { if (stepById.has(id)) setCurrent(stepById.get(id).index); },
    setSpotlight: value => { state.spotlight = value !== false; render(false); },
    reset: () => { state = blankState(); state.open = true; render(true); }
  });

  if (new URLSearchParams(location.search).get('curation') === '1' || state.open) setOpen(true);
})();
