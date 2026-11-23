(() => {
  'use strict';

  const model = window.EDMUND_2013_B2_STAGE1;
  const podcastModel = window.EDMUND_2013_B2_PODCAST;
  const timedTranscript = window.EDMUND_DSE_LISTENING_2013_TRANSCRIPT?.partB;
  const toolbar = document.querySelector('.toolbar');
  if (!model || !podcastModel || !Array.isArray(timedTranscript) || !toolbar || document.body.dataset.reader !== '2013-b2') return;

  const VERSION = model.contentVersion;
  const LEGACY_VERSIONS = new Set(['2013-b2-stage1-v1', '2013-b2-stage2-v1', '2013-b2-stage2-v2', '2013-b2-stage2-v3-free-navigation', '2013-b2-stage3-v1']);
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

  const slug = value => canonical(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').split('-').slice(0, 7).join('-') || 'utterance';
  const transcriptRows = timedTranscript
    .map((row, sourceIndex) => ({...row, sourceIndex}))
    .filter(row => row.sourceIndex >= podcastModel.transcript.startIndex && row.sourceIndex <= podcastModel.transcript.endIndex);
  const cueByTranscriptIndex = new Map();
  for (const item of podcastModel.cues) for (const sourceIndex of item.transcriptIndices || []) cueByTranscriptIndex.set(sourceIndex, item);
  const transcriptPointIndices = new Set(podcastModel.transcript.pointIndices || []);
  const podcastSteps = [];
  podcastSteps.push({
    id:'podcast-orientation-travel-report', kind:'podcast-intro',
    title:'先認識播放器、筆記表和停頓規則', sourcePhrase:'Travel Report · 2013 Part B recording',
    explanation:'播放範圍由「The recording is about to begin」開始，顯示為 0:00。正常播放會由目前位置繼續；每個答案邊界只停一次。「重聽本段」才會回到本步的 replay start。學生輸入和系統生成筆記分開顯示，互不覆寫。',
    help:'先確認第 3 頁五個原有欄目。Stage 3 有 28 個真實停頓點；完成錄音後才開放逐句錄音稿核對。',
    badge:'Stage 3 導航', focusSelector:'#doc-2013-travel-report-notes'
  });
  for (const item of podcastModel.cues) podcastSteps.push({
    id:`podcast-cue-${item.id}`, kind:'podcast-cue', cue:item, task:item.task || null,
    title:item.title, sourcePhrase:item.quote, explanation:item.explanation, help:item.finalDecision,
    badge:item.task ? `Task ${item.task} · 錄音停頓 ${item.number}` : `錄音停頓 ${item.number}`
  });
  podcastSteps.push({
    id:'podcast-transcript-review-intro', kind:'podcast-review-intro',
    title:'完整錄音稿核對：154 個原始時間段', sourcePhrase:'Recording complete · transcript review',
    explanation:'錄音已完整到達結尾。現在逐段核對完整英文錄音稿：分辨主持問題、已確認答案、更正、限定、個人評價，以及 Task A／C 可用內容。可按「中文對照」逐行顯示專業繁體中文翻譯；英文原文會一直保留。',
    help:'逐句模式只移動錄音稿焦點，不會自動播放或改寫學生筆記。', badge:'錄音稿核對'
  });
  for (const row of transcriptRows) {
    const relatedCue = cueByTranscriptIndex.get(row.sourceIndex);
    podcastSteps.push({
      id:`podcast-review-${Math.round(row.start * 100)}-${slug(row.text)}`,
      kind:'podcast-review', row, relatedCue,
      title:`錄音稿核對 · ${relatedCue?.speaker || (row.speaker === 'Narrator' ? '考試旁白' : podcastModel.transcript.unresolvedSpeakerLabel)}`,
      sourcePhrase:row.text,
      explanation:relatedCue
        ? `${relatedCue.explanation} 最終判斷：${relatedCue.finalDecision}`
        : '這一段提供節目流程、提問、反應或銜接。先看它是否真正完成一項筆記答案；沒有確定內容便只保留語境，不收入 Task A、B 或 C。',
      help:relatedCue?.finalDecision || '原對齊檔沒有把每一個非答案句分配到個別嘉賓；未能由 2013 來源確認的說話者保持未細分。',
      badge:relatedCue?.task ? `Task ${relatedCue.task} · 錄音稿` : (relatedCue?.rejected ? '不採用／更正' : '錄音稿語境')
    });
  }
  podcastSteps.push({
    id:'podcast-stage-complete', kind:'podcast-final', final:true,
    title:'Stage 3 完成：錄音、筆記與逐句稿已核對', sourcePhrase:'Travel Report recording and transcript review complete',
    explanation:'28 個停頓點、完整錄音結尾及 154 個原始時間段都已核對。Stage 1–2 保持原狀；Stage 4 Data File 逐句取證和 Stage 5 Writing 尚未開放。',
    help:'可自由返回任何 Stage 1–3 步驟重溫。未經批准不會開始 Stage 4。', badge:'Stage 3 完成', focusSelector:'#doc-2013-travel-report-notes'
  });
  podcastSteps.forEach((item, index) => { item.index = index; });
  const podcastStepsById = new Map(podcastSteps.map(item => [item.id, item]));
  const podcastIds = new Set(podcastStepsById.keys());
  const cueStepByCueId = new Map(podcastSteps.filter(item => item.cue).map(item => [item.cue.id, item]));

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
    podcastCurrentStepId: podcastSteps[0].id,
    podcastPosition: 0,
    podcastCompleted: [],
    transcriptReviewCompleted: [],
    heardCueIds: [],
    generatedCueIds: [],
    podcastCurrentTime: 0,
    podcastPlaybackRate: 1,
    podcastPinsVisible: false,
    podcastTranscriptFollow: true,
    podcastTranslationVisible: false,
    podcastStageComplete: false,
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
    const restoredPodcastId = podcastIds.has(raw.podcastCurrentStepId)
      ? raw.podcastCurrentStepId
      : podcastSteps[Math.min(Math.max(Number(raw.podcastPosition) || 0, 0), podcastSteps.length - 1)].id;
    clean.podcastCurrentStepId = restoredPodcastId;
    clean.podcastPosition = podcastStepsById.get(restoredPodcastId).index;
    clean.podcastCompleted = [...new Set((Array.isArray(raw.podcastCompleted) ? raw.podcastCompleted : []).filter(id => podcastIds.has(id)))];
    clean.transcriptReviewCompleted = [...new Set((Array.isArray(raw.transcriptReviewCompleted) ? raw.transcriptReviewCompleted : [])
      .filter(id => podcastStepsById.get(id)?.kind === 'podcast-review'))];
    clean.heardCueIds = [...new Set((Array.isArray(raw.heardCueIds) ? raw.heardCueIds : []).filter(id => cueStepByCueId.has(id)))];
    clean.generatedCueIds = [...new Set((Array.isArray(raw.generatedCueIds) ? raw.generatedCueIds : clean.heardCueIds).filter(id => cueStepByCueId.has(id)))];
    clean.podcastCurrentTime = Math.min(Math.max(Number(raw.podcastCurrentTime) || 0, 0), podcastModel.audio.segmentDuration);
    clean.podcastPlaybackRate = podcastModel.supportedRates.includes(Number(raw.podcastPlaybackRate)) ? Number(raw.podcastPlaybackRate) : 1;
    clean.podcastPinsVisible = raw.podcastPinsVisible === true;
    clean.podcastTranscriptFollow = raw.podcastTranscriptFollow !== false;
    clean.podcastTranslationVisible = raw.podcastTranslationVisible === true;
    clean.podcastStageComplete = raw.podcastStageComplete === true && podcastSteps.every(item => clean.podcastCompleted.includes(item.id));
    clean.bookmarks = [...new Set((Array.isArray(raw.bookmarks) ? raw.bookmarks : [])
      .map(id => ids.has(id) || podcastIds.has(id) ? id : migrateCategoryId(id)).filter(id => ids.has(id) || categoryIds.has(id) || podcastIds.has(id)))];
    clean.spotlight = raw.spotlight !== false;
    clean.stageComplete = raw.stageComplete === true && clean.completed.length === steps.length;
    // Stage 1 and Stage 2 are independent teaching views. Completion records
    // progress; it must never be used as an access gate.
    clean.activeStage = ['categorization','podcast'].includes(raw.activeStage) ? raw.activeStage : 'instructions';
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
    button.disabled = index > 2;
    button.dataset.stageId = item.id;
    button.setAttribute('aria-label', index < 3 ? `Stage ${index + 1} ${item.name}` : `Stage ${index + 1} ${item.name}，尚未開放`);
    button.innerHTML = `<span class="curation-stage-dot">${item.label}</span><span class="curation-stage-label">${item.short}</span><small class="curation-stage-count">${index === 0 ? `1/${steps.length}` : (index === 1 ? `1/${categories.length}` : (index === 2 ? `1/${podcastSteps.length}` : '未開放'))}</small>`;
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
      <div class="curation-help-panel" id="curation-help-panel" hidden></div><div id="curation-route-card"></div><div id="curation-podcast-actions"></div><div id="curation-final"></div>
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
  const audio = new Audio(podcastModel.audio.url);
  audio.preload = 'metadata';
  const audioBar = create('section', 'curation-podcast-player');
  audioBar.id = 'curation-podcast-player';
  audioBar.hidden = true;
  audioBar.setAttribute('aria-label', 'Travel Report 錄音播放器');
  audioBar.innerHTML = `<strong>Travel Report · Podcast</strong><button type="button" class="curation-player-play" aria-label="播放錄音">▶</button><button type="button" class="curation-player-replay" aria-label="重聽目前停頓段">↻ 重聽本段</button><button type="button" class="curation-player-pins-toggle" aria-pressed="false">顯示停頓點</button><span class="curation-player-timeline"><input class="curation-player-seek" type="range" min="0" max="${podcastModel.audio.segmentDuration}" step="0.01" value="0" aria-label="錄音進度"><span class="curation-player-pins" hidden></span></span><output class="curation-player-time">0:00 / 9:51</output><label>速度 <select class="curation-player-speed" aria-label="播放速度"></select></label>`;
  const speedSelect = $('.curation-player-speed', audioBar);
  for (const rate of podcastModel.supportedRates) {
    const option = create('option', '', `${rate}×`);
    option.value = String(rate);
    speedSelect.append(option);
  }
  const cuePins = $('.curation-player-pins', audioBar);
  for (const item of podcastModel.cues) {
    const pin = create('button', 'curation-player-pin');
    pin.type = 'button';
    pin.dataset.cueId = item.id;
    pin.style.left = `${((item.endpoint - podcastModel.audio.segmentStart) / podcastModel.audio.segmentDuration) * 100}%`;
    pin.setAttribute('aria-label', `${item.number}. ${item.title}`);
    pin.title = `${item.number}. ${item.title}`;
    cuePins.append(pin);
  }

  const transcriptWindow = create('aside', 'curation-transcript-window');
  transcriptWindow.id = 'curation-transcript-window';
  transcriptWindow.hidden = true;
  transcriptWindow.setAttribute('aria-label', 'Travel Report 浮動錄音稿');
  transcriptWindow.innerHTML = '<div class="curation-transcript-window-head"><strong>English transcript</strong><button type="button" class="curation-transcript-translation" aria-pressed="false" title="顯示或隱藏逐行繁體中文翻譯">中文對照</button><button type="button" class="curation-transcript-follow" aria-pressed="true">跟隨播放</button><button type="button" class="curation-transcript-fit">重設視窗</button><span>拖曳移動 · 四角調整</span></div><div class="curation-transcript-window-body" tabindex="0"></div>';
  const transcriptBody = $('.curation-transcript-window-body', transcriptWindow);
  const transcriptNodes = new Map();
  for (const row of transcriptRows) {
    const relatedCue = cueByTranscriptIndex.get(row.sourceIndex);
    const article = create('article', 'curation-transcript-row');
    article.dataset.sourceIndex = String(row.sourceIndex);
    article.dataset.start = String(row.start);
    article.dataset.end = String(row.end);
    const isPoint = transcriptPointIndices.has(row.sourceIndex) && !relatedCue?.rejected;
    article.dataset.kind = isPoint ? 'point' : 'nonpoint';
    article.classList.add(isPoint ? 'is-point' : 'is-nonpoint');
    if (isPoint && relatedCue?.task) article.classList.add(`task-${relatedCue.task}`);
    if (relatedCue?.rejected) article.classList.add('is-rejected');
    if (relatedCue?.decision === 'correction') article.classList.add('is-correction');
    if (relatedCue?.decision === 'qualification') article.classList.add('is-qualification');
    const speaker = create('strong', 'curation-transcript-speaker', relatedCue?.speaker || (row.speaker === 'Narrator' ? '考試旁白' : podcastModel.transcript.unresolvedSpeakerLabel));
    const copy = create('p', 'curation-transcript-copy');
    copy.append(create('span', 'curation-transcript-ink', row.text));
    const translation = create('p', 'curation-transcript-translation-copy', podcastModel.transcript.translations?.[row.sourceIndex]);
    translation.lang = 'zh-Hant-HK';
    const time = create('time', '', formatDisplayTime(row.start - podcastModel.audio.segmentStart));
    article.append(speaker, copy, time, translation);
    transcriptBody.append(article);
    transcriptNodes.set(row.sourceIndex, article);
  }
  for (const item of podcastSteps.filter(step => step.kind === 'podcast-review')) item.target = transcriptNodes.get(item.row.sourceIndex);
  for (const corner of ['nw','ne','sw','se']) {
    const handle = create('span', `curation-resize-handle curation-resize-${corner}`);
    handle.dataset.resize = corner;
    handle.setAttribute('aria-label', `調整錄音稿視窗大小 ${corner}`);
    transcriptWindow.append(handle);
  }
  document.body.append(audioBar, transcriptWindow);
  for (const item of podcastSteps) {
    if (item.cue?.destination) {
      const field = podcastModel.noteFields[item.cue.destination];
      item.focusTarget = $(field?.learner || field?.heading || field?.generated || '');
    } else if (item.focusSelector) item.focusTarget = $(item.focusSelector);
    else if (item.kind === 'podcast-review') item.focusTarget = item.target;
    else if (item.kind === 'podcast-review-intro' || item.kind === 'podcast-cue') item.focusTarget = audioBar;
    if (!item.focusTarget && item.kind !== 'podcast-review') missing.push(`${item.id}: podcast focus target`);
  }
  for (let index = 1; index <= 3; index += 1) {
    const option = create('option', '', `Slot ${index}`);
    option.value = String(index);
    $('#curation-slot', dock).append(option);
  }
  $('#curation-slot', dock).value = activeSlot;

  function formatDisplayTime(value) {
    const safe = Math.max(0, Number.isFinite(value) ? value : 0);
    const minutes = Math.floor(safe / 60);
    const seconds = Math.floor(safe % 60);
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  }
  function inCategories() { return state.activeStage === 'categorization'; }
  function inPodcast() { return state.activeStage === 'podcast'; }
  function currentList() { return inPodcast() ? podcastSteps : (inCategories() ? categories : steps); }
  function current() { return inPodcast() ? (podcastSteps[state.podcastPosition] || podcastSteps[0]) : (inCategories() ? (categories[state.categoryPosition] || categories[0]) : (steps[state.position] || steps[0])); }
  function pageLabel(item) {
    if (item.kind?.startsWith('podcast')) return item.kind === 'podcast-review' ? `2013 B2 · Travel Report 錄音稿 · ${formatDisplayTime(item.row.start - podcastModel.audio.segmentStart)}` : '2013 B2 · Data File 第 3 頁 · Travel Report';
    if (item.kind === 'category') return `2013 B2 · Data File 第 ${item.page} 頁 · 資料分類`;
    if (item.kind === 'route') return `來源路線 · Data File 第 ${item.routePage} 頁`;
    if (item.sourcePage <= 11) return `2013 B2 · Data File 第 ${item.sourcePage} 頁`;
    return `2013 B2 · Question-Answer Book 第 ${item.sourcePage - 11} 頁`;
  }
  function persist(message = '') {
    if (inPodcast()) {
      state.podcastCurrentStepId = current().id;
      state.podcastPosition = current().index;
    } else if (inCategories()) {
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
    if (item.kind?.startsWith('podcast')) {
      if (item.kind === 'podcast-review') return;
      const page = $('#page-3');
      if (page?.hidden) $('[data-filter="all"]')?.click();
      return;
    }
    const pageNumber = item.kind === 'category' ? item.page : (item.kind === 'route' ? item.routePage : item.sourcePage);
    const page = $(`#page-${pageNumber}`);
    if (page?.hidden) $('[data-filter="all"]')?.click();
  }

  function priorStage1StepIsVisible(item) {
    if (!inCategories() && !inPodcast()) return item.index <= state.position;
    return state.stageComplete || state.completed.includes(item.id);
  }

  function priorCategoryStepIsVisible(item) {
    if (inCategories()) return item.index <= state.categoryPosition;
    if (inPodcast()) return state.categoryStageComplete || state.categoryCompleted.includes(item.id);
    return false;
  }

  function syncMarks() {
    // A later stage inherits only work the learner has actually reached or
    // completed. Direct Stage 3 access must not disclose untouched Stage 1/2
    // classifications, while completed prior-stage ink remains cumulative.
    const reached = new Set(steps.filter(item => item.kind !== 'route' && priorStage1StepIsVisible(item)).map(item => item.id));
    $$('.curation-source-mark').forEach(mark => {
      mark.classList.toggle('is-revealed', reached.has(mark.dataset.stepId));
      mark.classList.toggle('is-current', !inCategories() && !inPodcast() && mark.dataset.stepId === current().id);
    });
    for (const item of categories.filter(entry => entry.cluePhrase)) {
      item.targetNode?.classList.toggle('is-revealed', priorCategoryStepIsVisible(item));
    }
    $$('.curation-source-target').forEach(node => node.classList.remove('curation-source-target'));
    $$('.curation-route-target').forEach(node => node.classList.remove('curation-route-target'));
    $$('.curation-category-target').forEach(node => node.classList.remove('curation-category-target'));
    $$('.curation-podcast-target').forEach(node => node.classList.remove('curation-podcast-target'));
    const item = current();
    if (inPodcast()) {
      item.focusTarget?.classList.add('curation-podcast-target');
    } else if (item.kind === 'category') {
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
      const visible = priorStage1StepIsVisible(entry.step);
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
        if (priorStage1StepIsVisible(routeStep) && !visibleByTask.has(routeStep.task)) {
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
      const visible = priorCategoryStepIsVisible(item);
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
      const visible = priorCategoryStepIsVisible(item);
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

  const toDisplayTime = sourceTime => Math.min(Math.max(sourceTime - podcastModel.audio.segmentStart, 0), podcastModel.audio.segmentDuration);
  const toSourceTime = displayTime => podcastModel.audio.segmentStart + Math.min(Math.max(displayTime, 0), podcastModel.audio.segmentDuration);
  let playbackSession = 0;
  let playbackTarget = null;
  let lastBoundaryKey = '';
  let playbackFrame = 0;
  let activeTranscriptIndex = -1;
  let transcriptPointer = null;
  let audioPersistTimer = 0;

  function currentCueStep() {
    const item = current();
    return item?.cue ? item : null;
  }

  function visibleGeneratedCueIds() {
    if (!inPodcast()) return new Set();
    return new Set(state.generatedCueIds.filter(id => (cueStepByCueId.get(id)?.index ?? Infinity) <= state.podcastPosition));
  }

  function syncGeneratedNotes() {
    const visible = visibleGeneratedCueIds();
    for (const field of Object.values(podcastModel.noteFields)) {
      const output = $(field.generated);
      if (!output) continue;
      if (field.generated === '#stats-given-india') {
        output.classList.toggle('is-cue-confirmed', visible.has('statistics-india-given'));
        continue;
      }
      const reached = podcastModel.cues.filter(item => item.destination && field === podcastModel.noteFields[item.destination] && visible.has(item.id) && item.writes?.length);
      output.replaceChildren();
      if (!reached.length) continue;
      if (output.classList.contains('curation-generated-notes')) {
        output.append(create('strong', '', '系統生成筆記（不覆寫你的筆記）'));
        const list = create('ul');
        for (const cueItem of reached) {
          for (const note of cueItem.writes) {
            const row = create('li', cueItem.task ? `task-${cueItem.task}` : '', note);
            row.dataset.cueId = cueItem.id;
            if (currentCueStep()?.cue.id === cueItem.id) row.classList.add('is-current');
            list.append(row);
          }
        }
        output.append(list);
      } else {
        output.textContent = `錄音答案：${reached.flatMap(item => item.writes).join(' · ')}`;
        output.classList.add('is-revealed');
      }
    }
  }

  function speakerForRow(row) {
    const cueItem = cueByTranscriptIndex.get(row.sourceIndex);
    return cueItem?.speaker || (row.speaker === 'Narrator' ? '考試旁白' : podcastModel.transcript.unresolvedSpeakerLabel);
  }

  function scrollTranscriptRowIntoView(node, behavior = 'auto') {
    if (!node) return;
    const rowRect = node.getBoundingClientRect();
    const bodyRect = transcriptBody.getBoundingClientRect();
    transcriptBody.scrollTo({
      top:Math.max(0, transcriptBody.scrollTop + rowRect.top - bodyRect.top - bodyRect.height * .32),
      behavior
    });
  }

  function syncTranscript(options = {}) {
    const item = current();
    const sourceTime = audio.readyState >= 1 ? audio.currentTime : toSourceTime(state.podcastCurrentTime);
    let nextActiveIndex = -1;
    for (const row of transcriptRows) {
      const node = transcriptNodes.get(row.sourceIndex);
      const reached = row.end <= sourceTime + .1;
      node.classList.toggle('is-reviewed', reached);
      node.classList.toggle('is-current-review', item.kind === 'podcast-review' && item.row.sourceIndex === row.sourceIndex);
      const active = !audio.paused && row.start <= sourceTime && row.end >= sourceTime;
      node.classList.toggle('is-active', active);
      if (active) nextActiveIndex = row.sourceIndex;
      $('.curation-transcript-speaker', node).textContent = speakerForRow(row);
    }
    if (nextActiveIndex !== activeTranscriptIndex) {
      activeTranscriptIndex = nextActiveIndex;
      const node = transcriptNodes.get(nextActiveIndex);
      // Scroll only the floating transcript. Element.scrollIntoView() may also
      // move the paper document and break its alignment during playback.
      if (node && state.podcastTranscriptFollow && options.followPlayback) scrollTranscriptRowIntoView(node, matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth');
    }
  }

  function syncPlayer() {
    const displayTime = audio.readyState >= 1 ? toDisplayTime(audio.currentTime) : state.podcastCurrentTime;
    $('.curation-player-play', audioBar).textContent = audio.paused ? '▶' : '❚❚';
    $('.curation-player-play', audioBar).setAttribute('aria-label', audio.paused ? '播放錄音' : '暫停錄音');
    $('.curation-player-seek', audioBar).value = String(displayTime);
    $('.curation-player-time', audioBar).textContent = `${formatDisplayTime(displayTime)} / ${formatDisplayTime(podcastModel.audio.segmentDuration)}`;
    speedSelect.value = String(audio.playbackRate || state.podcastPlaybackRate);
    cuePins.hidden = !state.podcastPinsVisible;
    $('.curation-player-pins-toggle', audioBar).setAttribute('aria-pressed', String(state.podcastPinsVisible));
    $('.curation-player-pins-toggle', audioBar).textContent = state.podcastPinsVisible ? '隱藏停頓點' : '顯示停頓點';
    const follow = $('.curation-transcript-follow', transcriptWindow);
    follow.setAttribute('aria-pressed', String(state.podcastTranscriptFollow));
    follow.textContent = state.podcastTranscriptFollow ? '跟隨播放' : '自由捲動';
    const translation = $('.curation-transcript-translation', transcriptWindow);
    transcriptWindow.classList.toggle('show-translation', state.podcastTranslationVisible);
    translation.setAttribute('aria-pressed', String(state.podcastTranslationVisible));
    translation.textContent = state.podcastTranslationVisible ? '隱藏中文' : '中文對照';
    for (const pin of $$('.curation-player-pin', cuePins)) pin.classList.toggle('is-heard', state.heardCueIds.includes(pin.dataset.cueId));
    const cueStep = currentCueStep();
    $('.curation-player-replay', audioBar).disabled = !cueStep;
    $('.curation-player-replay', audioBar).textContent = cueStep ? `↻ 重聽第 ${cueStep.cue.number} 段` : '↻ 重聽本段';
  }

  function positionPodcastChrome() {
    if (audioBar.hidden) return;
    const rail = stage.getBoundingClientRect();
    const left = Math.max(12, dock.getBoundingClientRect().right + 12);
    const top = Math.min(Math.ceil(rail.bottom + 8), Math.max(4, innerHeight - Math.max(audioBar.offsetHeight, 58) - 4));
    // Viewport chrome owns its positioning. Current-step emphasis must never
    // reflow the player into the paper document.
    Object.assign(audioBar.style, {position:'fixed', top:`${top}px`, bottom:'auto', left:`${left}px`, right:'18px'});
    if (!transcriptWindow.dataset.moved) {
      const transcriptTop = Math.min(Math.ceil(top + audioBar.getBoundingClientRect().height + 10), Math.max(4, innerHeight - 220));
      Object.assign(transcriptWindow.style, {position:'fixed', top:`${transcriptTop}px`, right:'18px', left:'auto'});
    }
  }

  function fitTranscriptWindow() {
    if (transcriptWindow.hidden || !transcriptWindow.dataset.moved) return;
    const rect = transcriptWindow.getBoundingClientRect();
    const width = Math.min(rect.width, innerWidth - 8);
    const height = Math.min(rect.height, innerHeight - 8);
    const left = Math.max(4, Math.min(rect.left, innerWidth - width - 4));
    const top = Math.max(4, Math.min(rect.top, innerHeight - height - 4));
    Object.assign(transcriptWindow.style, {position:'fixed', left:`${left}px`, top:`${top}px`, width:`${width}px`, height:`${height}px`, right:'auto'});
  }

  function syncPodcastChrome() {
    const visible = open && inPodcast();
    audioBar.hidden = !visible;
    transcriptWindow.hidden = !visible;
    document.body.classList.toggle('curation-stage-3', visible);
    if (!visible) {
      audio.pause();
      cancelAnimationFrame(playbackFrame);
      playbackTarget = null;
      return;
    }
    positionPodcastChrome();
    syncPlayer();
    syncGeneratedNotes();
    syncTranscript();
  }

  function scheduleAudioPersist() {
    clearTimeout(audioPersistTimer);
    audioPersistTimer = setTimeout(() => {
      state.podcastCurrentTime = toDisplayTime(audio.currentTime);
      persist();
    }, 250);
  }

  function completeAudioCue(cueItem) {
    const key = `${playbackSession}:${cueItem.id}`;
    if (lastBoundaryKey === key) return;
    lastBoundaryKey = key;
    playbackTarget = null;
    audio.pause();
    audio.currentTime = cueItem.endpoint;
    state.podcastCurrentTime = toDisplayTime(cueItem.endpoint);
    if (!state.heardCueIds.includes(cueItem.id)) state.heardCueIds.push(cueItem.id);
    if (!state.generatedCueIds.includes(cueItem.id)) state.generatedCueIds.push(cueItem.id);
    const cueStep = cueStepByCueId.get(cueItem.id);
    state.podcastPosition = cueStep.index;
    state.podcastCurrentStepId = cueStep.id;
    if (!state.podcastCompleted.includes(cueStep.id)) state.podcastCompleted.push(cueStep.id);
    render(false, {preserveAudio:true});
    $('#curation-save-status', dock).textContent = `已在 ${formatDisplayTime(toDisplayTime(cueItem.endpoint))} 停下 · 第 ${cueItem.number} 個停頓點只觸發一次`;
  }

  // A scrub is a deterministic state transition, not merely a media seek.
  // Moving forward materialises every cue whose endpoint has been crossed;
  // moving backward removes all later notes, completion and transcript marks.
  function reconcilePodcastSeek(displayTime) {
    const sourceTime = toSourceTime(displayTime);
    const reachedCues = podcastModel.cues.filter(item => item.endpoint <= sourceTime + .1);
    const reachedIds = new Set(reachedCues.map(item => item.id));
    const reachedStepIds = new Set(reachedCues.map(item => cueStepByCueId.get(item.id).id));
    state.heardCueIds = [...reachedIds];
    state.generatedCueIds = [...reachedIds];
    state.podcastCompleted = state.podcastCompleted.filter(id => {
      const step = podcastStepsById.get(id);
      if (step?.kind === 'podcast-cue') return reachedStepIds.has(id);
      if (sourceTime < podcastModel.audio.segmentEnd - .1 && ['podcast-review-intro','podcast-review','podcast-final'].includes(step?.kind)) return false;
      return true;
    });
    for (const id of reachedStepIds) if (!state.podcastCompleted.includes(id)) state.podcastCompleted.push(id);
    if (sourceTime < podcastModel.audio.segmentEnd - .1) {
      state.transcriptReviewCompleted = [];
      state.podcastStageComplete = false;
    }
    const targetCue = podcastModel.cues.find(item => item.endpoint > sourceTime + .1) || podcastModel.cues[podcastModel.cues.length - 1];
    const targetStep = cueStepByCueId.get(targetCue.id);
    state.podcastPosition = targetStep.index;
    state.podcastCurrentStepId = targetStep.id;
    return reachedCues.length;
  }

  function watchPlayback() {
    cancelAnimationFrame(playbackFrame);
    if (audio.paused || !playbackTarget) return;
    if (audio.currentTime >= playbackTarget.endpoint - .035) {
      completeAudioCue(playbackTarget);
      return;
    }
    syncPlayer();
    syncTranscript({followPlayback:true});
    playbackFrame = requestAnimationFrame(watchPlayback);
  }

  function armPlayback(cueItem, startSourceTime) {
    if (!cueItem) return;
    playbackSession += 1;
    lastBoundaryKey = '';
    playbackTarget = cueItem;
    const start = Math.min(Math.max(startSourceTime, podcastModel.audio.segmentStart), cueItem.endpoint - .05);
    const begin = () => {
      audio.currentTime = start;
      audio.playbackRate = state.podcastPlaybackRate;
      audio.play().then(() => { syncPlayer(); watchPlayback(); }).catch(() => {
        playbackTarget = null;
        $('#curation-save-status', dock).textContent = '錄音未能播放；請再按播放或重聽。';
      });
    };
    if (audio.readyState >= 1) begin(); else audio.addEventListener('loadedmetadata', begin, {once:true});
  }

  function playNormal() {
    if (!audio.paused) { audio.pause(); return; }
    let sourceTime = audio.readyState >= 1 ? audio.currentTime : toSourceTime(state.podcastCurrentTime);
    if (sourceTime < podcastModel.audio.segmentStart || sourceTime >= podcastModel.audio.segmentEnd - .04) sourceTime = podcastModel.audio.segmentStart;
    const target = podcastModel.cues.find(item => item.endpoint > sourceTime + .04);
    if (!target) return;
    armPlayback(target, sourceTime);
  }

  function replayCurrentCue() {
    const cueStep = currentCueStep();
    if (!cueStep) return;
    armPlayback(cueStep.cue, cueStep.cue.replayStart);
  }

  function playCueFromPrevious(cueStep) {
    armPlayback(cueStep.cue, cueStep.cue.playbackStart);
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
      if (item.kind === 'podcast-review' && target) {
        // Review navigation is an explicit learner command. Position the line
        // synchronously so a prior free-scroll/follow state cannot leave the
        // newly selected row outside the floating transcript viewport.
        scrollTranscriptRowIntoView(target);
      } else if (target && target !== audioBar && target !== transcriptWindow) {
        target.scrollIntoView({block:'center', inline:'nearest', behavior:reduced ? 'instant' : 'smooth'});
      }
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

  function render(focus = true, options = {}) {
    if (!open) return;
    const item = current();
    helpOpen = false;
    document.body.classList.toggle('curation-stage-2', inCategories());
    document.body.classList.toggle('curation-podcast-review', inPodcast() && state.podcastPosition >= podcastStepsById.get('podcast-transcript-review-intro').index);
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
    syncPodcastChrome();
    const list = currentList();
    const completed = inPodcast() ? state.podcastCompleted : (inCategories() ? state.categoryCompleted : state.completed);
    $('#curation-step-count', dock).textContent = `${item.index + 1} / ${list.length} 步`;
    $('#curation-completion-count', dock).textContent = `${completed.length} 已完成`;
    $('#curation-source', dock).textContent = pageLabel(item);
    $('#curation-title', dock).textContent = item.title;
    const badge = $('#curation-badge', dock);
    badge.textContent = inPodcast() ? item.badge : (inCategories() ? item.badge : (item.badge || '任務指示'));
    badge.className = `curation-badge${item.task ? ` task-${item.task}` : ''}`;
    $('#curation-part-label', dock).textContent = inPodcast() ? 'PART 3 · PODCAST' : (inCategories() ? 'PART 2 · DATA CATEGORIZATION' : 'PART 1 · TASK INSTRUCTIONS');
    $('#curation-stage-title', dock).textContent = inPodcast() ? 'Stage 3 · 聆聽錄音' : (inCategories() ? 'Stage 2 · 資料分類' : 'Stage 1 · 任務指示');
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
    help.innerHTML = inPodcast()
      ? `<strong>再聽／再判斷</strong><p>${item.help}</p>${item.cue ? `<small>Replay start ${formatDisplayTime(toDisplayTime(item.cue.replayStart))} · endpoint ${formatDisplayTime(toDisplayTime(item.cue.endpoint))} · ${item.cue.timestampConfidence} confidence</small>` : ''}`
      : inCategories()
      ? `<strong>再看一次分類理由</strong><p>${item.help}</p>${item.choiceRequired ? `<small>先標分類：${item.initialTasks.map(task => `Task ${task}`).join(' + ')}。Stage 4 逐句閱讀後才修正取證，不在 Stage 2 預讀答案。</small>` : ''}`
      : (item.help || '先說出這句屬於「身分、讀者、文類、必寫內容、來源、限制」哪一類，再檢查它是否能直接放進答案。');
    const routeCard = $('#curation-route-card', dock);
    routeCard.innerHTML = item.kind === 'route' ? `<div class="curation-route-card"><strong>只建立路線，不取答案</strong>定位：Data File 第 ${item.routePage} 頁 · ${item.routeLabel}</div>` : '';
    const podcastActions = $('#curation-podcast-actions', dock);
    podcastActions.replaceChildren();
    if (inPodcast() && item.cue) {
      const replay = create('button', 'curation-small', `↻ 重聽第 ${item.cue.number} 段`);
      replay.type = 'button';
      replay.addEventListener('click', replayCurrentCue);
      podcastActions.append(replay);
      const decision = create('p', `curation-podcast-decision${item.task ? ` task-${item.task}` : ''}`, `最終判斷：${item.cue.finalDecision}`);
      podcastActions.append(decision);
    }
    const isCategoryFinal = inCategories() && item.index === categories.length - 1;
    $('#curation-final', dock).innerHTML = item.kind === 'podcast-final'
      ? '<div class="curation-final">✓ Part 3 最後一步：錄音、28 個停頓點和完整錄音稿已核對。Stage 4–5 尚未開放。</div>'
      : isCategoryFinal
      ? '<div class="curation-final">✓ Part 2 最後一個筆記欄目。完成後保存資料分類並標記 Stage 2 完成；亦可直接選 Stage 3。</div>'
      : (!inCategories() && item.final ? '<div class="curation-final">✓ Part 1 最後一步：三項任務合約已完整核對。完成後可進入 Stage 2 資料分類。</div>' : '');
    const bookmarked = state.bookmarks.includes(item.id);
    $('#curation-bookmark', dock).textContent = bookmarked ? '★' : '☆';
    $('#curation-bookmark', dock).setAttribute('aria-pressed', String(bookmarked));
    $('#curation-step-jump', dock).textContent = `${item.index + 1}. ${item.title}`;
    $('#curation-bookmark-jump', dock).textContent = state.bookmarks.length ? `${state.bookmarks.length} 個書籤` : '選擇書籤';
    $('#curation-prev', dock).disabled = item.index === 0;
    const next = $('#curation-next', dock);
    if (inPodcast()) {
      const cueReady = !item.cue || state.heardCueIds.includes(item.cue.id);
      next.disabled = !cueReady || (item.final && state.podcastStageComplete);
      next.textContent = item.final ? (state.podcastStageComplete ? 'Stage 3 已完成 ✓' : '完成 Stage 3 ✓') : (item.cue && !cueReady ? '先播放至停頓點' : '下一步 →');
    } else if (inCategories()) {
      const hasChoice = !item.choiceRequired || state.categorySelections[item.id].tasks.length > 0;
      next.disabled = !hasChoice || (isCategoryFinal && state.categoryStageComplete);
      next.textContent = isCategoryFinal ? (state.categoryStageComplete ? 'Stage 2 已完成 ✓' : '完成 Stage 2 ✓') : '下一步 →';
    } else {
      next.disabled = false;
      next.textContent = item.final ? (state.stageComplete ? '進入 Stage 2 →' : '完成 Stage 1 ✓') : '下一步 →';
    }
    $('#curation-spotlight', dock).checked = state.spotlight;
    const activeStageIndex = inPodcast() ? 2 : (inCategories() ? 1 : 0);
    for (const [index, stageItem] of model.stages.entries()) {
      const button = $(`[data-stage-id="${stageItem.id}"]`, stage);
      const active = index === activeStageIndex;
      // Free access is independent of completion: visiting Stage 3 must not
      // falsely award completion ticks to Stage 1 or Stage 2.
      const done = (index === 0 && state.stageComplete) || (index === 1 && state.categoryStageComplete) || (index === 2 && state.podcastStageComplete);
      button.classList.toggle('active', active);
      button.classList.toggle('done', done);
      button.disabled = index > 2;
      button.toggleAttribute('aria-current', active);
      $('.curation-stage-dot', button).textContent = done ? '✓' : String(index + 1);
      $('.curation-stage-count', button).textContent = index === 0
        ? (state.stageComplete ? '完成' : `${state.position + 1}/${steps.length}`)
        : (index === 1 ? (state.categoryStageComplete ? '完成' : `${state.categoryPosition + 1}/${categories.length}`) : (index === 2 ? (state.podcastStageComplete ? '完成' : `${state.podcastPosition + 1}/${podcastSteps.length}`) : '未開放'));
    }
    $('.curation-stage-fill', stage).style.width = `${activeStageIndex * 20}%`;
    persist();
    if (focus) focusCurrent(); else { syncSpotlight(); syncRoute(); }
  }

  function goTo(index, options = {}) {
    if (inPodcast()) {
      audio.pause();
      playbackTarget = null;
      state.podcastPosition = Math.min(Math.max(index, 0), podcastSteps.length - 1);
      state.podcastCurrentStepId = current().id;
    } else if (inCategories()) {
      state.categoryPosition = Math.min(Math.max(index, 0), categories.length - 1);
      state.categoryCurrentStepId = current().id;
    } else {
      state.position = Math.min(Math.max(index, 0), steps.length - 1);
      state.currentStepId = current().id;
    }
    render(options.focus !== false);
  }

  function switchStage(stageId, options = {}) {
    state.activeStage = ['categorization','podcast'].includes(stageId) ? stageId : 'instructions';
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
      audio.pause();
      playbackTarget = null;
      audioBar.hidden = true;
      transcriptWindow.hidden = true;
      $$('.curation-source-target,.curation-route-target,.curation-category-target,.curation-podcast-target').forEach(node => node.classList.remove('curation-source-target', 'curation-route-target', 'curation-category-target', 'curation-podcast-target'));
      persist();
    }
  }

  function showPicker(kind) {
    const list = $('#curation-picker-list', picker);
    list.replaceChildren();
    $('#curation-picker-title', picker).textContent = kind === 'bookmark' ? '已儲存的書籤' : '跳至步驟';
    const lookup = id => stepsById.get(id) || categoriesById.get(id) || podcastStepsById.get(id);
    const source = kind === 'bookmark' ? state.bookmarks.map(lookup).filter(Boolean) : currentList();
    for (const item of source) {
      const button = create('button', 'curation-picker-option');
      button.type = 'button';
      const sourceText = item.sourcePhrase || item.sourceTitle;
      button.dataset.search = canonical(`${item.title} ${sourceText} ${item.id}`).toLowerCase();
      button.innerHTML = `<strong>${item.index + 1}. ${item.title}</strong><span>${sourceText}</span>`;
      button.addEventListener('click', () => {
        picker.close();
        if (stepsById.has(item.id)) state.activeStage = 'instructions';
        else if (categoriesById.has(item.id)) state.activeStage = 'categorization';
        else if (podcastStepsById.has(item.id)) state.activeStage = 'podcast';
        goTo(item.index);
      });
      list.append(button);
    }
    if (!source.length) list.append(create('p', '', '暫時沒有書籤。'));
    $('#curation-picker-search', picker).value = '';
    picker.showModal();
    $('#curation-picker-search', picker).focus();
  }

  launch.addEventListener('click', () => setOpen(!open));
  $('#curation-close', dock).addEventListener('click', () => setOpen(false));
  $('#curation-prev', dock).addEventListener('click', () => goTo((inPodcast() ? state.podcastPosition : (inCategories() ? state.categoryPosition : state.position)) - 1));
  $('#curation-next', dock).addEventListener('click', () => {
    const item = current();
    if (inPodcast()) {
      if (item.cue && !state.heardCueIds.includes(item.cue.id)) return;
      if (!state.podcastCompleted.includes(item.id)) state.podcastCompleted.push(item.id);
      if (item.kind === 'podcast-review' && !state.transcriptReviewCompleted.includes(item.id)) state.transcriptReviewCompleted.push(item.id);
      if (item.final) {
        state.podcastStageComplete = state.podcastCompleted.length === podcastSteps.length;
        render(false);
        $('#curation-save-status', dock).textContent = state.podcastStageComplete ? 'Stage 3 已完成並保存；Stage 4–5 尚未開放。' : '仍有 Stage 3 步驟未完成；可用步驟選單返回。';
        return;
      }
      const nextItem = podcastSteps[item.index + 1];
      goTo(item.index + 1);
      if (nextItem?.cue) playCueFromPrevious(nextItem);
      return;
    }
    if (inCategories()) {
      if (item.choiceRequired && !state.categorySelections[item.id].tasks.length) return;
      if (!state.categoryCompleted.includes(item.id)) state.categoryCompleted.push(item.id);
      if (item.index === categories.length - 1) {
        state.categoryStageComplete = state.categoryCompleted.length === categories.length;
        render(false);
        $('#curation-save-status', dock).textContent = 'Stage 2 已完成並保存；可自由進入 Stage 3。';
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
  $('[data-stage-id="podcast"]', stage).addEventListener('click', () => switchStage('podcast'));
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
    anchor.download = `2013-b2-super-curation-v4-slot-${activeSlot}.json`;
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

  $('.curation-player-play', audioBar).addEventListener('click', playNormal);
  $('.curation-player-replay', audioBar).addEventListener('click', replayCurrentCue);
  $('.curation-player-pins-toggle', audioBar).addEventListener('click', () => {
    state.podcastPinsVisible = !state.podcastPinsVisible;
    syncPlayer();
    persist();
  });
  $('.curation-player-seek', audioBar).addEventListener('input', event => {
    audio.pause();
    playbackTarget = null;
    state.podcastCurrentTime = Math.min(Math.max(Number(event.target.value) || 0, 0), podcastModel.audio.segmentDuration);
    if (audio.readyState >= 1) audio.currentTime = toSourceTime(state.podcastCurrentTime);
    const reachedCount = reconcilePodcastSeek(state.podcastCurrentTime);
    render(false, {preserveAudio:true});
    persist(`已移動至 ${formatDisplayTime(state.podcastCurrentTime)}；已同步 ${reachedCount} 項筆記，較後內容已移除。`);
  });
  speedSelect.addEventListener('change', () => {
    state.podcastPlaybackRate = Number(speedSelect.value);
    audio.playbackRate = state.podcastPlaybackRate;
    syncPlayer();
    persist();
  });
  cuePins.addEventListener('click', event => {
    const cueId = event.target.closest('[data-cue-id]')?.dataset.cueId;
    const cueStep = cueStepByCueId.get(cueId);
    if (!cueStep) return;
    state.activeStage = 'podcast';
    state.podcastPosition = cueStep.index;
    state.podcastCurrentStepId = cueStep.id;
    render();
    replayCurrentCue();
  });

  function setTranscriptFollow(value, message = '') {
    state.podcastTranscriptFollow = Boolean(value);
    const button = $('.curation-transcript-follow', transcriptWindow);
    button.setAttribute('aria-pressed', String(state.podcastTranscriptFollow));
    button.textContent = state.podcastTranscriptFollow ? '跟隨播放' : '自由捲動';
    persist(message);
  }
  $('.curation-transcript-follow', transcriptWindow).addEventListener('click', () => setTranscriptFollow(!state.podcastTranscriptFollow));
  $('.curation-transcript-translation', transcriptWindow).addEventListener('click', () => {
    state.podcastTranslationVisible = !state.podcastTranslationVisible;
    syncPlayer();
    persist(state.podcastTranslationVisible ? '已顯示逐行繁體中文對照。' : '已隱藏中文對照；英文原文保持顯示。');
  });
  const disableTranscriptFollow = event => {
    if (event.isTrusted && state.podcastTranscriptFollow) setTranscriptFollow(false, '已改為自由捲動；正常播放不會搶走你的位置。');
  };
  transcriptBody.addEventListener('wheel', disableTranscriptFollow, {passive:true});
  transcriptBody.addEventListener('touchstart', disableTranscriptFollow, {passive:true});
  transcriptBody.addEventListener('pointerdown', disableTranscriptFollow, {passive:true});
  function resetTranscriptWindow() {
    transcriptWindow.dataset.moved = '';
    transcriptWindow.style.cssText = '';
    positionPodcastChrome();
    setTranscriptFollow(true);
  }
  $('.curation-transcript-fit', transcriptWindow).addEventListener('click', resetTranscriptWindow);
  transcriptWindow.addEventListener('pointerdown', event => {
    const corner = event.target.dataset.resize;
    const head = event.target.closest('.curation-transcript-window-head');
    if ((!corner && !head) || event.target.closest('button,input,select')) return;
    event.preventDefault();
    const rect = transcriptWindow.getBoundingClientRect();
    transcriptPointer = {corner, move:!corner, x:event.clientX, y:event.clientY, left:rect.left, top:rect.top, width:rect.width, height:rect.height};
    transcriptWindow.dataset.moved = '1';
    transcriptWindow.setPointerCapture(event.pointerId);
  });
  transcriptWindow.addEventListener('pointermove', event => {
    if (!transcriptPointer) return;
    const pointer = transcriptPointer;
    const dx = event.clientX - pointer.x;
    const dy = event.clientY - pointer.y;
    let left = pointer.left;
    let top = pointer.top;
    let width = pointer.width;
    let height = pointer.height;
    if (pointer.move) { left += dx; top += dy; }
    else {
      if (pointer.corner.includes('w')) { left += dx; width -= dx; } else width += dx;
      if (pointer.corner.includes('n')) { top += dy; height -= dy; } else height += dy;
      if (width < 340) { if (pointer.corner.includes('w')) left -= 340 - width; width = 340; }
      if (height < 220) { if (pointer.corner.includes('n')) top -= 220 - height; height = 220; }
    }
    width = Math.min(width, innerWidth - 8);
    height = Math.min(height, innerHeight - 8);
    left = Math.max(4, Math.min(left, innerWidth - width - 4));
    top = Math.max(4, Math.min(top, innerHeight - height - 4));
    Object.assign(transcriptWindow.style, {left:`${left}px`, top:`${top}px`, width:`${width}px`, height:`${height}px`, right:'auto'});
  });
  transcriptWindow.addEventListener('pointerup', () => { transcriptPointer = null; });
  transcriptWindow.addEventListener('lostpointercapture', () => { transcriptPointer = null; });

  audio.addEventListener('loadedmetadata', () => {
    audio.currentTime = toSourceTime(state.podcastCurrentTime);
    audio.playbackRate = state.podcastPlaybackRate;
    syncPlayer();
    syncTranscript();
  });
  audio.addEventListener('play', () => { syncPlayer(); watchPlayback(); });
  audio.addEventListener('pause', () => {
    cancelAnimationFrame(playbackFrame);
    state.podcastCurrentTime = toDisplayTime(audio.currentTime);
    syncPlayer();
    syncTranscript();
    persist();
  });
  audio.addEventListener('timeupdate', () => {
    state.podcastCurrentTime = toDisplayTime(audio.currentTime);
    if (playbackTarget && audio.currentTime >= playbackTarget.endpoint - .035) completeAudioCue(playbackTarget);
    else {
      syncPlayer();
      syncTranscript({followPlayback:true});
      scheduleAudioPersist();
    }
  });
  audio.addEventListener('ratechange', () => {
    if (podcastModel.supportedRates.includes(audio.playbackRate)) state.podcastPlaybackRate = audio.playbackRate;
    syncPlayer();
  });
  audio.addEventListener('ended', () => {
    state.podcastCurrentTime = podcastModel.audio.segmentDuration;
    syncPlayer();
    persist();
  });

  window.addEventListener('scroll', () => { if (open) { syncSpotlight(); syncRoute(); } }, {passive:true});
  function handleViewportChange() {
    if (!open) return;
    positionPodcastChrome();
    fitTranscriptWindow();
    syncSpotlight();
    syncRoute();
  }
  window.addEventListener('resize', handleViewportChange);
  window.visualViewport?.addEventListener('resize', handleViewportChange);
  document.addEventListener('keydown', event => {
    if (!open || /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName)) return;
    if (event.key === 'ArrowLeft' && !$('#curation-prev', dock).disabled) { event.preventDefault(); goTo((inPodcast() ? state.podcastPosition : (inCategories() ? state.categoryPosition : state.position)) - 1); }
    if (event.key === 'ArrowRight' && !$('#curation-next', dock).disabled) { event.preventDefault(); $('#curation-next', dock).click(); }
    if (event.key === 'Escape' && !picker.open) setOpen(false);
  });

  const runtimeApi = Object.freeze({
    version: VERSION,
    steps,
    categories,
    podcastSteps,
    podcastCues:podcastModel.cues,
    missingTargets: missing,
    getState: () => JSON.parse(JSON.stringify(state)),
    goToId: id => {
      const stage1Item = stepsById.get(id);
      const categoryItem = categoriesById.get(id);
      const podcastItem = podcastStepsById.get(id);
      if (stage1Item) { switchStage('instructions', {focus:false}); goTo(stage1Item.index); }
      if (categoryItem) { switchStage('categorization', {focus:false}); goTo(categoryItem.index); }
      if (podcastItem) { switchStage('podcast', {focus:false}); goTo(podcastItem.index); }
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

  const query = new URLSearchParams(location.search);
  const queryOpen = query.get('curation') === '1';
  const queryStage = query.get('stage');
  const queryStep = query.get('step');
  const directStage1Step = stepsById.get(queryStep);
  const directStage2Step = categoriesById.get(queryStep);
  const directStage3Step = podcastStepsById.get(queryStep);
  if (directStage1Step) {
    state.activeStage = 'instructions';
    state.position = directStage1Step.index;
    state.currentStepId = directStage1Step.id;
  } else if (directStage2Step) {
    state.activeStage = 'categorization';
    state.categoryPosition = directStage2Step.index;
    state.categoryCurrentStepId = directStage2Step.id;
  } else if (directStage3Step) {
    state.activeStage = 'podcast';
    state.podcastPosition = directStage3Step.index;
    state.podcastCurrentStepId = directStage3Step.id;
  } else if (['3', 'part3', 'stage3', 'podcast'].includes(String(queryStage).toLowerCase())) {
    state.activeStage = 'podcast';
  } else if (['2', 'part2', 'stage2', 'categorization'].includes(String(queryStage).toLowerCase())) {
    state.activeStage = 'categorization';
  } else if (['1', 'part1', 'stage1', 'instructions'].includes(String(queryStage).toLowerCase())) {
    state.activeStage = 'instructions';
  }
  if (queryOpen || queryStage || queryStep || state.open) setOpen(true);
})();
