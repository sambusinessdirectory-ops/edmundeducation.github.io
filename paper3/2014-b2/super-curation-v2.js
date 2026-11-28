(() => {
  'use strict';

  const lesson = window.EDMUND_2014_B2_CURATION;
  const stage2 = window.EDMUND_2014_B2_CURATION_STAGE2;
  const stage3 = window.EDMUND_2014_B2_CURATION_STAGE3;
  const stage4 = window.EDMUND_2014_B2_CURATION_STAGE4;
  const stage5 = window.EDMUND_2014_B2_CURATION_STAGE5;
  if (!lesson?.steps?.length || !stage2?.steps?.length || !stage3?.cues?.length || !stage4?.records?.length || !stage5?.steps?.length || !document.querySelector('#page-4 .email-window')) return;

  const SCHEMA = 5;
  const VERSION = stage5.version;
  const LEGACY_VERSION = '2014-b2-super-curation-stage1-v3';
  const PREVIOUS_VERSION_V1 = '2014-b2-super-curation-stage2-v1';
  const PREVIOUS_VERSION_V2 = '2014-b2-super-curation-stage2-v2';
  const PREVIOUS_VERSION_V3 = '2014-b2-super-curation-stage2-v3';
  const PREVIOUS_VERSION_STAGE3 = stage3.version;
  const PREVIOUS_VERSION_STAGE4 = stage4.version;
  const PREVIOUS_VERSION_STAGE5 = '2014-b2-super-curation-stage5-v1';
  const stageOrder = ['instruction', 'categorize', 'podcast', 'data', 'writing'];
  const stage4SourceById = new Map(stage4.inventory.map(source => [source.id, source]));
  const stage4Kind = record => record.type === 6 ? 'noise' : record.type >= 4 ? 'hint' : record.task;
  const stage4Routes = new Map([
    ['p09-squeers-letter-005', {selector:'#page-9 .newspaper-sheet', label:'查核免費孤兒計劃：醫院並非只為賺錢'}],
    ['p09-squeers-letter-009', {selector:'#page-7 .newspaper-sheet', label:'返回較早報道：主人棄養、外來魚與生態損害'}],
    ['p09-squeers-letter-011', {selector:'#page-11 .email-window', label:'前往較後電郵：疾病率低的條件與風險界線'}],
    ['p09-squeers-letter-012', {selector:'#page-11 .email-window', label:'前往較後電郵：公眾安全指控的限定證據'}]
  ]);
  const stepsByStage = {
    instruction: lesson.steps.map((step, index) => ({...step, stage: 'instruction', index})),
    categorize: stage2.steps.map((step, index) => ({...step, stage: 'categorize', index})),
    podcast: stage3.cues.map((cue, index) => ({
      ...cue, stage: 'podcast', index, sourcePage: `Pet Club podcast · ${formatClock(cue.sourceEnd - stage3.audio.segmentStart)}`,
      translation: cue.task ? `寫入 ${stage3.fields[cue.field]}，並標記 Task ${cue.task}。` : cue.field ? `寫入 ${stage3.fields[cue.field]}；此點只作聆聽筆記。` : '錄音結束，不新增筆記。'
    })),
    data: stage4.records.map((record, index) => {
      const source = stage4SourceById.get(record.sourceId);
      return {
        ...record,
        stage: 'data',
        index,
        final: index === stage4.records.length - 1,
        kind: stage4Kind(record),
        title: record.heading,
        quote: record.excerpt,
        sourcePage: `Data File · 第 ${record.page} 頁 · ${source.title}`,
        explanation: Object.entries(record.analysis).map(([label, value]) => `${label}：${value}`).join('\n'),
        help: `先按原文最小完整事實單位判斷。類型 ${record.type}；作答決定：${record.decision}。`
      };
    }),
    writing: stage5.steps.map((step, index) => ({...step, stage:'writing', index}))
  };
  const allSteps = stageOrder.flatMap(stage => stepsByStage[stage]);
  const stepById = new Map(allSteps.map(step => [step.id, step]));
  const recordById = new Map(stage2.inventory.map(record => [record.id, record]));
  const marksByStep = new Map();
  const stage4MarksByStep = new Map();
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
  const clone = value => JSON.parse(JSON.stringify(value));
  function formatClock(seconds) {
    const value = Math.max(0, Number(seconds) || 0);
    return `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, '0')}`;
  }

  function blankState() {
    return {
      currentStage: 'instruction',
      positions: {instruction: stepsByStage.instruction[0].id, categorize: stepsByStage.categorize[0].id, podcast: stepsByStage.podcast[0].id, data: stepsByStage.data[0].id, writing: stepsByStage.writing[0].id},
      completed: {instruction: [], categorize: [], podcast: [], data: [], writing: []},
      completedStages: [], categories: {}, bookmarks: [], spotlight: true, open: false, helpDrafts: {},
      heard: [],
      podcast: {cueId: stepsByStage.podcast[0].id, currentTime: stage3.audio.segmentStart, completedThrough: -1, playbackRate: 1, followTranscript: true},
      data: {highestReached: -1, detourFrom: null, detourTarget: null},
      writing: {
        task:'A', plans:{A:'',B:'',C:''}, drafts:{A:'',B:'',C:''}, checks:{A:[],B:[],C:[]},
        revealed:{A:false,B:false,C:false}, revealWarnings:{A:false,B:false,C:false}, modelUnits:{A:null,B:null,C:null},
        sourceOrigin:null, evidenceFilter:'task', visited:[], transfers:{A:false,B:false,C:false}, essayPositions:{A:-1,B:-1,C:-1}
      }
    };
  }

  function restore(raw) {
    const clean = blankState();
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return clean;
    const knownFor = (stage, list) => [...new Set((Array.isArray(list) ? list : []).filter(id => stepsByStage[stage].some(step => step.id === id)))];
    clean.currentStage = stageOrder.includes(raw.currentStage) ? raw.currentStage : clean.currentStage;
    for (const stage of stageOrder) {
      if (stepsByStage[stage].some(step => step.id === raw.positions?.[stage])) clean.positions[stage] = raw.positions[stage];
      clean.completed[stage] = knownFor(stage, raw.completed?.[stage]);
    }
    clean.completedStages = [...new Set((Array.isArray(raw.completedStages) ? raw.completedStages : []).filter(stage => stageOrder.includes(stage)))];
    clean.bookmarks = [...new Set((Array.isArray(raw.bookmarks) ? raw.bookmarks : []).filter(id => stepById.has(id)))];
    clean.spotlight = raw.spotlight !== false;
    clean.open = raw.open === true;
    if (raw.categories && typeof raw.categories === 'object' && !Array.isArray(raw.categories)) {
      for (const [id, values] of Object.entries(raw.categories)) {
        if (!recordById.has(id) || !Array.isArray(values)) continue;
        const valid = [...new Set(values.filter(value => ['A', 'B', 'C', '?'].includes(value)))];
        clean.categories[id] = valid.includes('?') ? ['?'] : valid.filter(value => value !== '?').sort();
      }
    }
    if (raw.helpDrafts && typeof raw.helpDrafts === 'object' && !Array.isArray(raw.helpDrafts)) {
      clean.helpDrafts = Object.fromEntries(Object.entries(raw.helpDrafts)
        .filter(([id, value]) => stepById.has(id) && typeof value === 'string')
        .map(([id, value]) => [id, value.slice(0, 4000)]));
    }
    clean.heard = knownFor('podcast', raw.heard);
    const firstMissing = stepsByStage.podcast.findIndex(step => !clean.heard.includes(step.id));
    const completedThrough = firstMissing < 0 ? stepsByStage.podcast.length - 1 : firstMissing - 1;
    const expectedCue = stepsByStage.podcast[Math.min(completedThrough + 1, stepsByStage.podcast.length - 1)];
    const rawTime = Number(raw.podcast?.currentTime);
    clean.podcast = {
      cueId: stepsByStage.podcast.some(step => step.id === raw.podcast?.cueId) ? raw.podcast.cueId : expectedCue.id,
      currentTime: Number.isFinite(rawTime) && rawTime >= stage3.audio.segmentStart && rawTime <= stage3.audio.segmentEnd ? rawTime : expectedCue.playbackStart,
      completedThrough,
      playbackRate: [0.5,0.75,1,1.25,1.5,1.75,2,2.25,2.5,2.75,3].includes(Number(raw.podcast?.playbackRate)) ? Number(raw.podcast.playbackRate) : 1,
      followTranscript: raw.podcast?.followTranscript !== false
    };
    const rawHighest = Number(raw.data?.highestReached);
    clean.data.highestReached = Number.isInteger(rawHighest) ? Math.max(-1, Math.min(stepsByStage.data.length - 1, rawHighest)) : -1;
    clean.data.detourFrom = stepById.has(raw.data?.detourFrom) ? raw.data.detourFrom : null;
    clean.data.detourTarget = typeof raw.data?.detourTarget === 'string' ? raw.data.detourTarget : null;
    const writing = raw.writing && typeof raw.writing === 'object' && !Array.isArray(raw.writing) ? raw.writing : {};
    clean.writing.task = ['A','B','C'].includes(writing.task) ? writing.task : 'A';
    for (const task of ['A','B','C']) {
      clean.writing.plans[task] = typeof writing.plans?.[task] === 'string' ? writing.plans[task] : '';
      clean.writing.drafts[task] = typeof writing.drafts?.[task] === 'string' ? writing.drafts[task] : '';
      clean.writing.checks[task] = [...new Set((Array.isArray(writing.checks?.[task]) ? writing.checks[task] : []).filter(id => stage5.checklists[task][Number(id)] !== undefined).map(String))];
      clean.writing.revealed[task] = writing.revealed?.[task] === true;
      clean.writing.revealWarnings[task] = writing.revealWarnings?.[task] === true;
      clean.writing.modelUnits[task] = stage5.models[task].units.some(unit => unit.id === writing.modelUnits?.[task]) ? writing.modelUnits[task] : null;
      clean.writing.transfers[task] = writing.transfers?.[task] === true;
      const rawEssayPosition=Number(writing.essayPositions?.[task]);
      clean.writing.essayPositions[task]=Number.isInteger(rawEssayPosition)?Math.max(-1,Math.min(stepsByStage.writing.length-1,rawEssayPosition)):-1;
    }
    clean.writing.sourceOrigin = stepsByStage.writing.some(item => item.id === writing.sourceOrigin) ? writing.sourceOrigin : null;
    clean.writing.evidenceFilter = ['task','used','available'].includes(writing.evidenceFilter) ? writing.evidenceFilter : 'task';
    clean.writing.visited = knownFor('writing', writing.visited);
    return clean;
  }

  function migrateLegacy(raw) {
    const clean = blankState();
    const known = list => [...new Set((Array.isArray(list) ? list : []).filter(id => stepsByStage.instruction.some(step => step.id === id)))];
    if (stepsByStage.instruction.some(step => step.id === raw?.currentStepId)) clean.positions.instruction = raw.currentStepId;
    clean.completed.instruction = known(raw?.completedIds);
    clean.bookmarks = known(raw?.bookmarks);
    clean.spotlight = raw?.spotlight !== false;
    clean.open = raw?.open === true;
    if (raw?.stageComplete === true && clean.completed.instruction.includes(stepsByStage.instruction.at(-1).id)) clean.completedStages.push('instruction');
    if (raw?.helpDrafts && typeof raw.helpDrafts === 'object') {
      clean.helpDrafts = Object.fromEntries(Object.entries(raw.helpDrafts)
        .filter(([id, value]) => stepById.has(id) && typeof value === 'string')
        .map(([id, value]) => [id, value.slice(0, 4000)]));
    }
    return clean;
  }

  function migrateStage2V1(raw) {
    const clean = restore(raw);
    const previous = clean.categories['p2-p03-pet-club-notes'];
    if (!previous || (previous.length === 1 && previous[0] === 'A')) {
      clean.categories['p2-p03-pet-club-notes'] = ['A', 'C'];
    }
    return clean;
  }

  let state = blankState();
  try {
    const stored = JSON.parse(localStorage.getItem(lesson.storageKey) || 'null');
    if (stored?.schema === SCHEMA && stored.version === VERSION) state = restore(stored.state);
    else if (stored?.schema === 4 && stored.version === PREVIOUS_VERSION_STAGE5) state = restore(stored.state);
    else if (stored?.schema === 3 && stored.version === PREVIOUS_VERSION_STAGE4) state = restore(stored.state);
    else if (stored?.schema === 2 && stored.version === PREVIOUS_VERSION_STAGE3) state = restore(stored.state);
    else if (stored?.schema === 2 && stored.version === PREVIOUS_VERSION_V3) state = restore(stored.state);
    else if (stored?.schema === 2 && stored.version === PREVIOUS_VERSION_V2) state = restore(stored.state);
    else if (stored?.schema === 2 && stored.version === PREVIOUS_VERSION_V1) state = migrateStage2V1(stored.state);
    else if (stored?.schema === 1 && stored.version === LEGACY_VERSION) state = migrateLegacy(stored.state);
  } catch (error) {
    console.warn('2014 Super Curation progress could not be restored.', error);
  }

  function persist(message = '進度已自動儲存在此瀏覽器') {
    try {
      localStorage.setItem(lesson.storageKey, JSON.stringify({schema: SCHEMA, version: VERSION, state}));
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

  function markPhrase(step, phrase, primary = false) {
    const root = $(step.selector);
    if (!root) {
      targetAudit.push({stepId: step.id, selector: step.selector, phrase, reason: 'selector-missing'});
      return null;
    }
    if (!phrase && step.final) {
      if (primary) step.target = root;
      return null;
    }
    const reused = $$('.curation-mark', root).find(mark => canonical(mark.textContent) === canonical(phrase));
    if (reused) {
      reused.dataset.stepIds = [...new Set([...(reused.dataset.stepIds || '').split(',').filter(Boolean), step.id])].join(',');
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
    if (primary && step.point) mark.dataset.point = step.point;
    if (step.task) mark.dataset.task = step.task;
    mark.append(range.extractContents());
    range.insertNode(mark);
    if (primary) step.target = mark;
    return mark;
  }

  for (const step of stepsByStage.instruction) {
    const marks = [];
    const primary = markPhrase(step, step.phrase, true);
    if (primary) marks.push(primary);
    for (const phrase of step.secondaryPhrases || []) {
      const mark = markPhrase(step, phrase);
      if (mark) marks.push(mark);
    }
    marksByStep.set(step.id, marks);
  }
  for (const step of stepsByStage.categorize) {
    step.target = $(step.selector);
    if (!step.target) targetAudit.push({stepId: step.id, selector: step.selector, reason: 'selector-missing'});
  }

  function looseTextMap(root) {
    const nodes = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: node => node.parentElement?.closest('.translation, .curation-podcast-translation')
        ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
    });
    let node;
    while ((node = walker.nextNode())) nodes.push(node);
    const chars = [];
    for (const textNode of nodes) {
      for (let offset = 0; offset < textNode.length; offset += 1) chars.push({char:textNode.data[offset], node:textNode, offset});
      chars.push({char:' ', node:textNode, offset:textNode.length});
    }
    const normalized = [];
    const map = [];
    const isAlphaNum = char => /[\p{L}\p{N}]/u.test(char);
    for (let index = 0; index < chars.length; index += 1) {
      let char = chars[index].char.normalize('NFKC').replace(/[’‘]/g, "'").replace(/[–—−]/g, '-').toLocaleLowerCase();
      if (/[¹²³]/u.test(chars[index].char)) continue;
      if (/[123]/.test(char) && isAlphaNum(chars[index - 1]?.char || '') && /\s/u.test(chars[index + 1]?.char || '')) continue;
      char = isAlphaNum(char) ? char : ' ';
      if (char === ' ' && normalized.at(-1) === ' ') continue;
      normalized.push(char); map.push(chars[index]);
    }
    const joined = normalized.join('');
    const leading = joined.length - joined.trimStart().length;
    const trimmed = joined.trim();
    return {text:trimmed, map:map.slice(leading, leading + trimmed.length)};
  }

  function normalizeLoose(value) {
    return String(value).normalize('NFKC').replace(/(?<=\p{L})[123](?=\s)/gu, '').replace(/[’‘]/g, "'")
      .replace(/[¹²³]/g, '').replace(/[–—−]/g, '-').toLocaleLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, ' ').trim().replace(/\s+/g, ' ');
  }

  function locateLooseRange(root, phrase) {
    const mapped = looseTextMap(root);
    const needle = normalizeLoose(phrase);
    const start = mapped.text.indexOf(needle);
    if (start < 0 || !needle) return null;
    const first = mapped.map[start];
    const last = mapped.map[start + needle.length - 1];
    if (!first?.node || !last?.node) return null;
    const range = document.createRange();
    range.setStart(first.node, first.offset);
    range.setEnd(last.node, Math.min(last.offset + 1, last.node.length));
    return range;
  }

  function markStage4Segment(step, phrase, primary = false) {
    const root = $(step.targetSelector);
    if (!root) {
      targetAudit.push({stepId:step.id, selector:step.targetSelector, phrase, reason:'stage4-selector-missing'});
      return null;
    }
    const existing = $$('.curation-stage4-mark', root).find(mark => normalizeLoose(mark.textContent) === normalizeLoose(phrase));
    if (existing) {
      existing.dataset.stepIds = [...new Set([...(existing.dataset.stepIds || '').split(',').filter(Boolean), step.id])].join(',');
      if (primary) step.target = existing;
      return existing;
    }
    const range = locateLooseRange(root, phrase);
    if (!range) {
      targetAudit.push({stepId:step.id, selector:step.targetSelector, phrase, reason:'stage4-phrase-missing'});
      return null;
    }
    const mark = make('mark', `curation-stage4-mark curation-stage4-mark-${step.kind}`);
    mark.dataset.stepIds = step.id;
    mark.dataset.type = String(step.type);
    if (step.task) mark.dataset.task = step.task;
    mark.append(range.extractContents());
    range.insertNode(mark);
    if (primary) step.target = mark;
    return mark;
  }

  for (const step of stepsByStage.data) {
    const sourceRoot = $(step.targetSelector);
    if (!sourceRoot) {
      targetAudit.push({stepId:step.id, selector:step.targetSelector, reason:'stage4-selector-missing'});
      continue;
    }
    if (step.targetKind !== 'text') {
      step.target = sourceRoot;
      stage4MarksByStep.set(step.id, []);
      continue;
    }
    const marks = [];
    for (const [index, phrase] of step.matchSegments.entries()) {
      const mark = markStage4Segment(step, phrase, index === 0);
      if (mark) marks.push(mark);
    }
    if (!step.target) step.target = sourceRoot;
    stage4MarksByStep.set(step.id, marks);
  }
  if (targetAudit.length) console.error('2014 Super Curation target audit failed.', targetAudit);

  const taskParagraphs = {
    A: $('#page-4 .email-content .bilingual:nth-of-type(3) p[lang="en"]'),
    B: $('#page-4 .email-content .bilingual:nth-of-type(5) p[lang="en"]'),
    C: $('#page-4 .email-content .bilingual:nth-of-type(6) p[lang="en"]')
  };
  Object.entries(taskParagraphs).forEach(([task, paragraph]) => { if (paragraph) paragraph.dataset.curationTask = task; });

  const stampSources = [];
  function stampHolderFor(heading) {
    if (!heading) return null;
    heading.classList.add('curation-source-file-heading');
    let holder = $('.curation-file-stamps', heading);
    if (!holder) {
      holder = make('span', 'curation-file-stamps');
      holder.hidden = true;
      holder.setAttribute('aria-label', '這份來源文件的暫定任務標記');
      heading.append(holder);
    }
    return holder;
  }
  stepsByStage.instruction.filter(step => step.sourceJump && /^[ABC]$/.test(step.task || '')).forEach(step => {
    const heading = step.target?.closest('h2');
    const holder = stampHolderFor(heading);
    if (holder) stampSources.push({kind: 'route', step, heading, holder});
  });
  for (const record of stage2.inventory) {
    const heading = $(record.selector);
    const holder = stampHolderFor(heading);
    const step = stepById.get(record.id);
    if (holder && step) stampSources.push({kind: 'category', record, step, heading, holder});
  }
  const subheadingSources = [];
  for (const record of stage2.inventory.filter(item => item.subheadings?.length)) {
    const recordStep = stepById.get(record.id);
    for (const subheading of record.subheadings) {
      const subheadingStep = stepById.get(subheading.id);
      const heading = $(subheading.selector);
      if (!heading) {
        targetAudit.push({stepId: record.id, selector: subheading.selector, reason: 'subheading-selector-missing'});
        continue;
      }
      heading.classList.add('curation-podcast-subheading');
      let title = $('.curation-subheading-title', heading);
      if (!title) {
        title = make('span', 'curation-subheading-title');
        while (heading.firstChild) title.append(heading.firstChild);
        heading.append(title);
      }
      const holder = make('span', 'curation-subheading-tags');
      holder.hidden = true;
      holder.dataset.subheadingId = subheading.id;
      holder.setAttribute('aria-label', `${subheading.title}：${subheading.label}`);
      const labels = subheading.tasks.length ? subheading.tasks : ['listening'];
      holder.replaceChildren(...labels.map(task => make('span', `curation-subheading-tag curation-subheading-tag-${task}`, task === 'listening' ? '聆聽筆記' : `Task ${task}`)));
      heading.append(holder);
      subheadingSources.push({record, recordStep, subheadingStep, subheading, heading, holder});
    }
  }
  const categorySelection = record => Array.isArray(state.categories[record.id]) && state.categories[record.id].length ? [...state.categories[record.id]] : [...record.initialTasks];

  function syncFileStamps(step) {
    const holders = [...new Set(stampSources.map(entry => entry.holder))];
    for (const holder of holders) {
      const tasks = [];
      let currentTasks = [];
      const holderEntries = stampSources.filter(item => item.holder === holder);
      const reachedCategory = (step.stage === 'categorize' && holderEntries.some(entry => entry.kind === 'category' && entry.step.index <= step.index)) || ['podcast', 'data'].includes(step.stage);
      for (const entry of holderEntries) {
        if (entry.kind === 'route') {
          const visible = step.stage === 'instruction' ? entry.step.index <= step.index : !reachedCategory && step.stage === 'categorize';
          if (visible) tasks.push(entry.step.task);
          if (entry.step.id === step.id) currentTasks.push(entry.step.task);
        } else if ((step.stage === 'categorize' && entry.step.index <= step.index) || ['podcast', 'data'].includes(step.stage)) {
          const selection = categorySelection(entry.record).filter(value => value !== '?');
          tasks.push(...selection);
          if (entry.step.id === step.id) currentTasks = selection;
        }
      }
      const unique = [...new Set(tasks)].sort();
      holder.replaceChildren(...unique.map(task => {
        const badge = make('span', `curation-file-stamp curation-file-stamp-${task}`, task);
        badge.dataset.task = task;
        badge.setAttribute('role', 'img');
        badge.setAttribute('aria-label', `來源分類標記：Task ${task}`);
        if (currentTasks.includes(task)) badge.classList.add('curation-file-stamp-enter');
        return badge;
      }));
      holder.hidden = unique.length === 0;
      holder.parentElement?.classList.toggle('curation-has-file-stamps', unique.length > 0);
    }
  }

  function syncSubheadingLabels(step) {
    for (const entry of subheadingSources) {
      const visible = (step.stage === 'categorize' && entry.subheadingStep?.index <= step.index) || ['podcast', 'data'].includes(step.stage);
      entry.holder.hidden = !visible;
      entry.heading.classList.toggle('curation-subheading-labelled', visible);
      entry.heading.classList.remove('curation-subheading-excluded');
      entry.heading.classList.toggle('curation-subheading-listening', visible && entry.subheading.tasks.length === 0);
      entry.heading.classList.toggle('curation-subheading-included', visible && entry.subheading.tasks.length > 0);
    }
  }

  const stage4SourceBars = stage4.inventory.map(source => {
    const root = $(source.selector);
    if (!root) return null;
    const bar = make('header', 'curation-stage4-source-bar');
    bar.dataset.sourceId = source.id;
    bar.hidden = true;
    const identity = make('span', 'curation-stage4-source-identity', `${String(source.order).padStart(2, '0')} · 第 ${source.page} 頁 · ${source.title}`);
    const stamps = make('span', 'curation-stage4-source-stamps');
    for (const task of source.final) stamps.append(make('span', `curation-stage4-source-stamp curation-stage4-source-stamp-${task}`, `Task ${task}`));
    bar.append(identity, stamps);
    root.insertAdjacentElement('beforebegin', bar);
    return {source, root, bar};
  }).filter(Boolean);

  function syncStage4SourceBars(step) {
    const active = state.open && step.stage === 'data';
    for (const entry of stage4SourceBars) {
      const firstIndex = stepsByStage.data.findIndex(item => item.sourceId === entry.source.id);
      const reached = active && firstIndex <= step.index;
      entry.bar.hidden = !reached;
      entry.bar.classList.toggle('is-current', active && entry.source.id === step.sourceId);
      entry.root.classList.toggle('curation-stage4-source-current', active && entry.source.id === step.sourceId);
      entry.root.classList.toggle('curation-stage4-source-read', reached);
    }
  }

  const launch = make('button', 'curation-launch', '✦ Super Curation');
  launch.type = 'button';
  launch.id = 'curation-toggle';
  launch.setAttribute('aria-pressed', 'false');
  $('.toolbar')?.append(launch);

  const stageRailLabels = {instruction:'任務指示',categorize:'資料分類',podcast:'聆聽錄音',data:'逐句取證',writing:'三篇寫作'};
  const rail = make('nav', 'curation-stage');
  rail.hidden = true;
  rail.setAttribute('aria-label', 'Super Curation 五階段進度');
  rail.innerHTML = `<div class="curation-stage-line" aria-hidden="true"></div><div class="curation-stage-fill" aria-hidden="true"></div><div class="curation-stage-items">${lesson.stages.map((stage, index) => `<button type="button" class="curation-stage-item" data-stage="${stage.id}" ${stageOrder.includes(stage.id) ? '' : 'disabled'}><span class="curation-stage-dot">${index + 1}</span><span class="curation-stage-label">${stageRailLabels[stage.id] || stage.label}</span><small class="curation-stage-count"></small></button>`).join('')}</div>`;

  const dock = make('aside', 'curation-dock');
  dock.hidden = true;
  dock.setAttribute('aria-label', '2014 Super Curation 教學面板');
  dock.innerHTML = `
    <header><span id="curation-dock-stage">2014 B2 · SUPER CURATION</span><button type="button" id="curation-close" aria-label="關閉 Super Curation">×</button></header>
    <div class="curation-actions"><button type="button" id="curation-prev">← 上一步</button><button type="button" id="curation-help">需要更多協助</button><button type="button" id="curation-next">下一步 →</button></div>
    <div class="curation-tools"><label>自由瀏覽本階段<select id="curation-step-jump" aria-label="自由瀏覽本階段所有步驟"></select></label><label>書籤<select id="curation-bookmark-jump" aria-label="跳至書籤"><option value="">選擇書籤</option></select></label></div>
    <div class="curation-meta"><button type="button" id="curation-bookmark" aria-label="將本步加入書籤" aria-pressed="false">☆</button></div>
    <div class="curation-progress"><span id="curation-step-count"></span><progress id="curation-progress" min="0" max="1" value="0" aria-label="目前階段完成進度"></progress></div>
    <div class="curation-options"><label><input type="checkbox" id="curation-spotlight"> 聚光燈</label><span id="curation-bookmark-count">尚無書籤</span></div>
    <div class="curation-legend"><span class="color-A">A · 資訊頁</span><span class="color-B">B · 開放日演辭</span><span class="color-C">C · 致編輯的信</span><span class="color-hint">來源／提示</span><span class="color-noise">不取材</span></div>
    <section class="curation-content"><p id="curation-source"></p><h2 id="curation-title"></h2><blockquote id="curation-quote" lang="en"></blockquote><p id="curation-translation"></p><p id="curation-type"></p><div id="curation-explanation"></div><ul id="curation-points" hidden></ul>
      <section id="curation-category-panel" hidden>
        <dl class="curation-source-profile"><div><dt>文類</dt><dd id="curation-document-type"></dd></div><div><dt>作者／機構</dt><dd id="curation-writer"></dd></div><div><dt>讀者</dt><dd id="curation-reader"></dd></div><div><dt>日期</dt><dd id="curation-date"></dd></div></dl>
        <section id="curation-subheading-panel" hidden><h3>Podcast sub-heading 分流</h3><p>逐欄判斷，不把整段錄音一概歸入同一任務。</p><ol id="curation-subheading-list"></ol></section>
        <p class="curation-category-prompt">這份文件暫時屬於哪些任務？可複選。</p>
        <div class="curation-category-choices" role="group" aria-label="文件任務分類"><label><input type="checkbox" value="A"> Task A</label><label><input type="checkbox" value="B"> Task B</label><label><input type="checkbox" value="C"> Task C</label><label class="uncertain"><input type="checkbox" value="?"> 暫未確定</label></div>
        <p id="curation-category-status" role="status"></p>
        <button type="button" id="curation-revision-toggle" aria-expanded="false">顯示讀後修正提示</button>
        <div id="curation-revision" hidden><p id="curation-possible-final"></p><p id="curation-revision-guidance"></p><p id="curation-risk"></p></div>
      </section>
    </section>
    <small id="curation-save-status" role="status">尚未儲存</small>`;

  const taskMap = make('aside', 'curation-task-map');
  taskMap.hidden = true;
  taskMap.setAttribute('aria-label', '三項寫作任務地圖');
  taskMap.innerHTML = `<h2 id="curation-map-title">三項任務地圖</h2><p id="curation-map-intro"></p>${[['A','資訊頁 · 年輕人／離校生'],['B','開放日演辭 · 現場公眾'],['C','致編輯的信 · Kowloon Herald'],['?','資料仍不足']].map(([task,label]) => `<section data-task="${task}"><header><span>${task === '?' ? '暫未確定' : `Task ${task}`}</span><strong>0</strong></header><p>${label}</p><ol></ol></section>`).join('')}`;

  const dialog = make('dialog', 'curation-help-dialog');
  dialog.innerHTML = `<form method="dialog" id="curation-help-form"><header><div><small>ASK A QUESTION · 提問</small><h2>需要更多協助</h2></div><button type="button" id="curation-help-close" aria-label="關閉提問表格">×</button></header><p id="curation-help-context"></p><p id="curation-help-guidance"></p><label for="curation-help-question">你的問題</label><textarea id="curation-help-question" rows="5" maxlength="4000" placeholder="例如：為甚麼這份文件先標 Task B？"></textarea><p id="curation-help-status" role="status">問題草稿只會儲存在此瀏覽器，不會自動傳送。</p><div><button type="button" id="curation-help-cancel">取消</button><button type="submit">儲存問題草稿</button></div></form>`;

  const audio = new Audio(stage3.audio.url);
  audio.preload = 'metadata';
  audio.setAttribute('aria-label', '2014 Pet Club podcast 錄音');
  const player = make('section', 'curation-podcast-player');
  player.id = 'curation-podcast-player';
  player.hidden = true;
  player.innerHTML = `<strong>Pet Club · Podcast</strong><button type="button" class="curation-podcast-play" aria-label="播放錄音">▶</button><button type="button" class="curation-podcast-pins-toggle" aria-pressed="false">顯示停頓點</button><span class="curation-podcast-timeline"><input class="curation-podcast-seek" type="range" min="${stage3.audio.segmentStart}" max="${stage3.audio.segmentEnd}" step="0.01" value="${stage3.audio.segmentStart}" aria-label="Podcast 播放位置"><span class="curation-podcast-pins" hidden></span></span><output class="curation-podcast-time">0:00 / ${formatClock(stage3.audio.segmentDuration)}</output><label>速度 <select class="curation-podcast-speed" aria-label="播放速度"></select></label><button type="button" class="curation-podcast-fit">重設視窗</button>`;
  const speed = $('.curation-podcast-speed', player);
  for (const rate of [0.5,0.75,1,1.25,1.5,1.75,2,2.25,2.5,2.75,3]) {
    const option = make('option', '', `${rate}×`); option.value = String(rate); speed.append(option);
  }
  const pins = $('.curation-podcast-pins', player);
  stage3.cues.forEach(cue => {
    const pin = make('button', 'curation-podcast-pin');
    pin.type = 'button'; pin.dataset.cueId = cue.id;
    pin.style.left = `${((cue.sourceEnd - stage3.audio.segmentStart) / stage3.audio.segmentDuration) * 100}%`;
    pin.title = `${cue.number}. ${cue.title} · ${formatClock(cue.sourceEnd - stage3.audio.segmentStart)}`;
    pin.setAttribute('aria-label', `重播第 ${cue.number} 個停頓點：${cue.title}`);
    pins.append(pin);
  });

  const transcriptWindow = make('aside', 'curation-podcast-transcript');
  transcriptWindow.id = 'curation-podcast-transcript';
  transcriptWindow.hidden = true;
  transcriptWindow.classList.add('show-translation');
  transcriptWindow.setAttribute('aria-label', 'Pet Club podcast 逐句稿');
  transcriptWindow.innerHTML = `<header><strong>錄音稿 · 自由捲動</strong><button type="button" class="curation-transcript-follow" aria-pressed="true">跟隨播放</button><button type="button" class="curation-transcript-zh" aria-pressed="true">隱藏中文</button></header><div class="curation-transcript-body" tabindex="0"></div><span class="curation-transcript-resize" aria-hidden="true"></span>`;
  const transcriptBody = $('.curation-transcript-body', transcriptWindow);
  stage3.transcript.forEach(turn => {
    const row = make('article', 'curation-transcript-row');
    row.dataset.turnId = turn.id; row.dataset.start = String(turn.start); row.dataset.end = String(turn.end);
    row.dataset.provenance = turn.provenance;
    const speaker = make('strong', 'curation-transcript-speaker', `${turn.speaker}:`);
    const copy = make('span', 'curation-transcript-copy', turn.text);
    const translation = make('p', 'curation-transcript-translation', turn.translation);
    translation.lang = 'zh-Hant';
    row.append(speaker, copy, translation); transcriptBody.append(row);
  });
  const podcastMarksByCue = new Map();
  for (const cue of stage3.cues) {
    const marks = [];
    const pointPhrases = cue.note ? (cue.highlights || (cue.quote ? [cue.quote] : [])) : [];
    for (const phrase of pointPhrases) {
      const copy = $$('.curation-transcript-copy', transcriptWindow).find(node => canonical(node.textContent).toLowerCase().includes(canonical(phrase).toLowerCase()));
      const range = copy ? locateRange(copy, phrase) : null;
      if (!range) {
        targetAudit.push({stepId:cue.id, phrase, reason:'podcast-highlight-missing'});
        continue;
      }
      const mark = make('mark', 'curation-podcast-source-phrase');
      mark.dataset.cueId = cue.id;
      mark.dataset.task = cue.task || 'listening';
      mark.append(range.extractContents());
      range.insertNode(mark);
      marks.push(mark);
    }
    podcastMarksByCue.set(cue.id, marks);
  }
  for (const copy of $$('.curation-transcript-copy', transcriptWindow)) {
    const walker = document.createTreeWalker(copy, NodeFilter.SHOW_TEXT, {
      acceptNode: node => node.parentElement.closest('.curation-podcast-source-phrase') || !node.textContent.trim()
        ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
    });
    const noiseNodes = [];
    let noiseNode;
    while ((noiseNode = walker.nextNode())) noiseNodes.push(noiseNode);
    for (const node of noiseNodes) {
      const noise = make('span', 'curation-podcast-noise');
      noise.textContent = node.textContent;
      node.replaceWith(noise);
    }
  }

  const noteFields = new Map();
  for (const [fieldId, label] of Object.entries(stage3.fields)) {
    const field = $(`#page-3 textarea[data-note="${fieldId}"]`);
    if (!field) continue;
    field.dataset.curationField = fieldId;
    const route = make('small', 'curation-note-route', `${label} · 錄音證據會在相應停頓點寫入；你原有的文字會保留。`);
    route.hidden = true;
    field.insertAdjacentElement('afterend', route);
    noteFields.set(fieldId, {field, route});
  }
  for (const step of stepsByStage.podcast) step.target = step.field ? noteFields.get(step.field)?.field : $('#page-3 .conference-notes');

  const stage4RecordById = new Map(stepsByStage.data.map(step => [step.id, step]));
  const stage3CueById = new Map(stepsByStage.podcast.map(step => [step.id, step]));
  const practice = make('article', 'paper-page curation-practice-page');
  practice.id = 'practice'; practice.dataset.kind = 'practice';
  practice.innerHTML = '<header><span>Stage 5 · Three writing tasks</span></header><div class="curation-practice-intro"><small>2014 B2 · SUPER CURATION</small><h1>Three Writing Tasks</h1><p>先完成自己的構思和草稿，再逐句檢視參考範文。所有草稿只儲存在此瀏覽器。</p></div><div class="curation-draft-cards"></div>';
  $('#reader').append(practice);
  const writingWorkspace = practice;
  const cardsRoot = $('.curation-draft-cards', practice);

  const writingBank = make('aside', 'curation-writing-bank');
  writingBank.id = 'curation-writing-bank'; writingBank.hidden = true;
  writingBank.setAttribute('aria-label','Stage 5 任務證據庫');
  writingBank.innerHTML = '<header><h2>寫作證據庫</h2><p>紅線表示這項內容已在目前進度的範文中使用。</p></header><div id="curation-writing-bank-list"></div>';
  document.body.append(writingBank);

  const sourcePreview=make('aside','curation-source-preview');sourcePreview.id='curation-source-preview';sourcePreview.hidden=true;sourcePreview.setAttribute('role','dialog');sourcePreview.setAttribute('aria-modal','false');sourcePreview.setAttribute('aria-label','原頁取證視窗');
  sourcePreview.innerHTML='<div class="curation-source-preview-head"><strong>原頁取證</strong><span>拖曳移動 · 四角調整大小 · 藍線：已用於範文</span><button type="button" aria-label="關閉原頁取證視窗">×</button></div><div class="curation-source-preview-body"></div>';
  const sourcePreviewBody=$('.curation-source-preview-body',sourcePreview);$('.curation-source-preview-head button',sourcePreview).addEventListener('click',()=>{sourcePreview.hidden=true;});
  for(const corner of ['nw','ne','sw','se']){const handle=make('span',`curation-resize-handle curation-resize-${corner}`);handle.dataset.resize=corner;sourcePreview.append(handle);}document.body.append(sourcePreview);
  let previewPointer=null;
  sourcePreview.addEventListener('pointerdown',event=>{const handle=event.target.closest('[data-resize]'),head=event.target.closest('.curation-source-preview-head');if(!handle&&!head||event.target.closest('button'))return;event.preventDefault();const r=sourcePreview.getBoundingClientRect();previewPointer={id:event.pointerId,mode:handle?.dataset.resize||'move',x:event.clientX,y:event.clientY,left:r.left,top:r.top,width:r.width,height:r.height};sourcePreview.setPointerCapture(event.pointerId);});
  sourcePreview.addEventListener('pointermove',event=>{if(!previewPointer||previewPointer.id!==event.pointerId)return;const dx=event.clientX-previewPointer.x,dy=event.clientY-previewPointer.y,minW=320,minH=220;let {left,top,width,height}=previewPointer;if(previewPointer.mode==='move'){left+=dx;top+=dy;}else{if(previewPointer.mode.includes('e'))width=Math.max(minW,width+dx);if(previewPointer.mode.includes('s'))height=Math.max(minH,height+dy);if(previewPointer.mode.includes('w')){const next=Math.max(minW,width-dx);left+=width-next;width=next;}if(previewPointer.mode.includes('n')){const next=Math.max(minH,height-dy);top+=height-next;height=next;}}width=Math.min(width,innerWidth-8);height=Math.min(height,innerHeight-8);left=Math.max(4,Math.min(left,innerWidth-width-4));top=Math.max(4,Math.min(top,innerHeight-height-4));Object.assign(sourcePreview.style,{left:`${left}px`,top:`${top}px`,width:`${width}px`,height:`${height}px`,right:'auto'});});
  sourcePreview.addEventListener('pointerup',()=>{previewPointer=null;});sourcePreview.addEventListener('lostpointercapture',()=>{previewPointer=null;});

  const wrapPhrase=(root,phrase,className)=>{const wanted=canonical(phrase).toLowerCase(),walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),nodes=[];let node,full='';while((node=walker.nextNode())){nodes.push({node,start:full.length,end:full.length+node.length});full+=node.textContent;}const at=canonical(full).toLowerCase().indexOf(wanted);if(at<0)return false;const first=nodes.find(x=>x.end>at),last=nodes.find(x=>x.end>=at+phrase.length);if(!first||!last)return false;const range=document.createRange();range.setStart(first.node,at-first.start);range.setEnd(last.node,at+phrase.length-last.start);const mark=make('span',className);mark.append(range.extractContents());range.insertNode(mark);return true;};
  const modelRoot=make('div','curation-writing-models');cardsRoot.append(modelRoot);
  const paragraphStarts=new Set(['a03','a06','a09','a11','b03','b05','b07','b10','b13','c02','c04','c06','c10','c13','c16','c18','c20']);
  for(const task of 'ABC'){
    const brief=stage5.briefs[task],card=make('section',`curation-draft-card task-${task}`);card.dataset.writingTask=task;
    card.innerHTML=`<header><span>Task ${task} · Task ${brief.number}</span><h2>${brief.genre}</h2><p>${brief.reader} · ${brief.wordGuide}</p></header><label>Planning notes / 構思與證據安排<textarea data-writing-plan="${task}" rows="6" spellcheck="true"></textarea></label><label>Your draft / 英文初稿<textarea data-writing-draft="${task}" rows="13" spellcheck="true"></textarea></label><div class="curation-draft-actions"><output data-writing-words="${task}">0 words</output><button type="button" data-writing-transfer="${task}">明確轉移至原卷答案欄</button><span data-writing-status="${task}" role="status">尚未轉移；不會自動交文。</span></div><details class="curation-task-checklist"><summary>Task ${task} 核對表</summary><div></div></details>`;
    const checklist=$('.curation-task-checklist div',card);stage5.checklists[task].forEach((copy,index)=>{const label=make('label');const input=make('input');input.type='checkbox';input.dataset.writingCheck=String(index);input.dataset.task=task;label.append(input,document.createTextNode(copy));checklist.append(label);});
    const details=make('details',`curation-model-essay task-${task}`);details.id=`curation-model-${task}`;details.append(make('summary','',`查看 Task ${task} 參考範文`));
    const article=make('article');article.dataset.modelTask=task;let paragraph=null;
    for(const unit of stage5.models[task].units){const span=make('span','curation-essay-unit',unit.text);span.dataset.unitId=unit.id;span.dataset.task=task;span.dataset.ordinal=String(unit.ordinal);for(const phrase of unit.keywords)wrapPhrase(span,phrase,`curation-essay-keyword curation-essay-keyword-${task}`);for(const phrase of unit.structurePhrases)wrapPhrase(span,phrase,'curation-essay-structure');if(unit.kind==='title'){const h=make('h4');h.append(span);article.append(h);paragraph=null;}else{if(!paragraph||paragraphStarts.has(unit.id)){paragraph=make('p');article.append(paragraph);}paragraph.append(span,document.createTextNode(' '));}}
    details.append(article);card.append(details);cardsRoot.insertBefore(card,modelRoot);
  }
  for(const task of 'ABC'){const group=make('details',`curation-bank-group curation-bank-${task}`);group.innerHTML=`<summary>Task ${task} <strong>0</strong></summary><ol></ol>`;const seen=new Set(),list=$('ol',group);for(const unit of stage5.models[task].units)for(const id of unit.evidence){if(seen.has(id))continue;seen.add(id);const li=make('li');li.dataset.evidenceId=id;const button=make('button','curation-bank-ink',id);button.type='button';button.dataset.writingSource=id;button.dataset.task=task;li.append(button);list.append(li);}writingBank.append(group);}
  for(const step of stepsByStage.writing){if(step.kind==='model-unit'||step.kind==='essay-return')step.target=$(`[data-model-task="${step.task}"] [data-unit-id="${step.unitId}"]`,practice);else if(step.kind==='essay-source'){const source=stage4RecordById.get(step.evidenceId)||stage3CueById.get(step.evidenceId);step.target=source?.target||practice;}else step.target=$(`[data-writing-task="${step.task}"]`,practice)||practice;}
  for (const task of ['A','B','C']) {
    const number=stage5.briefs[task].number;
    stage5.briefs[task].submissionTarget.forEach((id,index)=>{const field=document.getElementById(id);if(!field)return;field.dataset.save=`draft-${number}-part-${index+1}`;field.dataset.wordTask=String(number);});
  }
  import('/paper3-writing-reader.mjs?v=20261123-stage5-v1').catch(error=>console.warn('Writing Submission bridge could not be mounted; local drafts remain available.',error));

  const routeArrow = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  routeArrow.id = 'curation-route-arrow';
  routeArrow.setAttribute('hidden', '');
  routeArrow.innerHTML = '<defs><marker id="curation-tip-2014" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M1 1L7 4L1 7" fill="none" stroke="#d0282d" stroke-width="1.6"/></marker></defs><path class="curation-route-path" marker-end="url(#curation-tip-2014)"/>';
  const routeCallout = make('div', 'curation-route-callout');
  routeCallout.hidden = true;
  const masks = Array.from({length: 4}, () => {
    const mask = make('div', 'curation-mask');
    mask.hidden = true;
    document.body.append(mask);
    return mask;
  });
  document.body.append(rail, dock, taskMap, routeArrow, routeCallout, dialog, player, transcriptWindow);

  const currentSteps = () => stepsByStage[state.currentStage];
  const current = () => stepById.get(state.positions[state.currentStage]) || currentSteps()[0];
  const completedCount = stage => state.completed[stage].length;
  const typeLabel = step => {
    if (step.stage === 'writing') return `Stage 5 · Task ${step.task || state.writing.task} · ${step.kind === 'essay-source' ? '原文取證' : step.kind === 'essay-return' ? '返回範文' : step.kind === 'model-unit' ? '逐句範文教學' : '獨立寫作'}`;
    if (step.stage === 'data') {
      const labels = {
        1:'Task A 可用事實', 2:'Task B 可用事實', 3:'Task C 可用事實',
        4:'證據限定／語境', 5:'來源指路／結構', 6:'不取材：只刪去此精確片語'
      };
      return `Stage 4 · 類型 ${step.type} · ${labels[step.type]}`;
    }
    if (step.stage === 'podcast') {
      if (step.final) return 'Stage 3 · 完整聆聽結束';
      return step.task ? `Stage 3 · Task ${step.task} 錄音證據` : 'Stage 3 · 必做聆聽筆記／不納入作文';
    }
    if (step.stage === 'categorize') {
      if (step.final) return 'Stage 2 · 完成檢查';
      if (step.subheadingStep) return `Stage 2 · Podcast 細分欄目 · ${step.label}`;
      return step.categoryStep ? `Stage 2 · ${step.documentType}` : 'Stage 2 · 資料分類';
    }
    return step.final ? 'Stage 1 · 完成檢查' : step.type === 1 ? 'Task A · 任務要求' : step.type === 2 ? 'Task B · 任務要求' : step.type === 3 ? 'Task C · 任務要求' : step.type === 4 ? '重要語氣／資格' : step.type === 6 ? '不寫入答案' : '來源／格式提示';
  };

  function reveal(step) {
    $$('.curation-mark').forEach(mark => mark.classList.remove('is-revealed'));
    $$('.curation-stage4-mark').forEach(mark => mark.classList.remove('is-revealed', 'is-current'));
    const instructionLimit = step.stage === 'instruction' ? step.index : stepsByStage.instruction.length - 1;
    for (const item of stepsByStage.instruction.slice(0, instructionLimit + 1)) {
      if (item.essential || item.sourceJump) {
        for (const mark of marksByStep.get(item.id) || []) mark.classList.add('is-revealed');
      }
    }
    Object.entries(taskParagraphs).forEach(([task, paragraph]) => {
      const first = stepsByStage.instruction.find(item => item.task === task)?.index ?? 999;
      paragraph?.classList.toggle('curation-task-revealed', instructionLimit >= first);
    });
    if (step.stage === 'data') {
      for (const item of stepsByStage.data.slice(0, step.index + 1)) {
        for (const mark of stage4MarksByStep.get(item.id) || []) mark.classList.add('is-revealed');
      }
      for (const mark of stage4MarksByStep.get(step.id) || []) mark.classList.add('is-current');
    }
    if (step.stage === 'writing' && step.kind === 'essay-source') {
      const source = stage4RecordById.get(step.evidenceId);
      for (const mark of stage4MarksByStep.get(step.evidenceId) || []) mark.classList.add('is-revealed','is-current');
      if (source) step.target = source.target;
      const cue = stage3CueById.get(step.evidenceId);
      if (cue) {
        for (const mark of podcastMarksByCue.get(step.evidenceId) || []) mark.classList.add('is-revealed','is-current');
        step.target = (podcastMarksByCue.get(step.evidenceId) || [])[0] || cue.target;
      }
    }
    $$('.curation-target').forEach(target => target.classList.remove('curation-target'));
    if (step.target?.isConnected && !(step.stage==='writing'&&step.kind==='essay-source')) step.target.classList.add('curation-target');
  }

  function renderInstructionMap(step) {
    $('#curation-map-title').textContent = '三項任務地圖';
    $('#curation-map-intro').textContent = '只顯示目前讀到的任務規格；資料檔證據和答案仍然隱藏。';
    $('.curation-task-map [data-task="?"]').hidden = true;
    for (const task of ['A', 'B', 'C']) {
      const relevant = stepsByStage.instruction.filter(item => item.task === task && !item.sourceJump && !item.routeReturn && item.index <= step.index);
      const total = stepsByStage.instruction.filter(item => item.task === task && !item.sourceJump && !item.routeReturn).length;
      const card = $(`.curation-task-map [data-task="${task}"]`);
      card.hidden = false;
      card.classList.toggle('is-revealed', relevant.length > 0);
      $('strong', card).textContent = relevant.length ? `${relevant.length}/${total}` : '未讀到';
      $('ol', card).replaceChildren(...relevant.slice(-4).map(item => make('li', '', item.title)));
    }
  }

  function renderCategoryMap(step) {
    $('#curation-map-title').textContent = 'Stage 2 · 資料分類盤';
    $('#curation-map-intro').textContent = '只列出目前位置以前的暫定分類；返回前一步會隱藏未到達的標記。';
    for (const task of ['A', 'B', 'C', '?']) {
      const card = $(`.curation-task-map [data-task="${task}"]`);
      card.hidden = false;
      const relevant = stage2.inventory.filter(record => stepById.get(record.id).index <= step.index && categorySelection(record).includes(task));
      card.classList.toggle('is-revealed', relevant.length > 0);
      $('strong', card).textContent = String(relevant.length);
      $('ol', card).replaceChildren(...relevant.map(record => make('li', '', record.title)));
    }
  }

  function renderPodcastMap(step) {
    $('#curation-map-title').textContent = 'Stage 3 · 六欄聆聽路線';
    $('#curation-map-intro').textContent = '筆記和逐句標記會跟隨實際播放位置；向前拖動會顯示，向後拖動會收回。';
    const groups = {A:[], B:[], C:[], '?':[]};
    for (const cue of stage3.cues) {
      if (!cue.field || cue.index > step.index) continue;
      const key = cue.task || '?';
      groups[key].push(cue);
    }
    for (const task of ['A', 'B', 'C', '?']) {
      const card = $(`.curation-task-map [data-task="${task}"]`);
      const relevant = groups[task];
      card.hidden = task === 'B' && relevant.length === 0;
      card.classList.toggle('is-revealed', relevant.length > 0);
      $('strong', card).textContent = String(relevant.length);
      $('p', card).textContent = task === '?' ? '只作聆聽筆記，不納入三篇作文' : task === 'A' ? '獸醫護士資訊頁可用錄音證據' : task === 'C' ? '負責任飼養／醫院服務證據' : '本錄音沒有 Task B 答案';
      $('ol', card).replaceChildren(...relevant.slice(-5).map(cue => make('li', '', cue.note || cue.title)));
    }
  }

  function renderDataMap(step) {
    $('#curation-map-title').textContent = 'Stage 4 · 證據庫';
    $('#curation-map-intro').textContent = '只收錄目前位置以前可直接取用的原子事實。點選任何證據可返回來源；後退時，未到達項目會同步收回。';
    for (const task of ['A', 'B', 'C', '?']) {
      const card = $(`.curation-task-map [data-task="${task}"]`);
      card.hidden = task === '?';
      if (task === '?') continue;
      const relevant = stepsByStage.data.filter(item => item.index <= step.index && item.bankEligible && item.task === task);
      card.classList.toggle('is-revealed', relevant.length > 0);
      $('strong', card).textContent = String(relevant.length);
      const list = $('ol', card);
      list.replaceChildren(...relevant.map(item => {
        const li = make('li', 'curation-evidence-item');
        const button = make('button', 'curation-evidence-jump', item.heading);
        button.type = 'button'; button.dataset.evidenceId = item.id;
        button.setAttribute('aria-label', `返回來源：${item.heading}`);
        li.append(button, make('small', '', `第 ${item.page} 頁 · ${stage4SourceById.get(item.sourceId).title}`));
        return li;
      }));
    }
  }

  const words = value => (String(value).trim().match(/\S+/g) || []).length;
  const evidenceMeta = id => {
    const item = stage4RecordById.get(id);
    if (item) return {id,kind:'Stage 4',title:item.heading,page:item.page,source:stage4SourceById.get(item.sourceId)?.title || item.sourceId,phrase:item.excerpt,reached:item.index <= state.data.highestReached};
    const cue = stage3CueById.get(id);
    if (cue) return {id,kind:'Stage 3',title:cue.title,page:'錄音',source:'Pet Club podcast',phrase:cue.quote || cue.note,reached:state.heard.includes(id)};
    return {id,kind:'來源',title:id,page:'—',source:'未找到',phrase:'',reached:false};
  };

  function renderWritingBank(step) {
    const task = state.writing.task;
    const used = new Set(stage5.models[task].units.flatMap(unit => unit.evidence));
    const filter = state.writing.evidenceFilter;
    const available = [...stepsByStage.data.filter(item => item.bankEligible && item.task === task), ...stepsByStage.podcast.filter(item => item.task === task && item.note)];
    const shown = available.filter(item => filter === 'used' ? used.has(item.id) : filter === 'available' ? !used.has(item.id) : true);
    $('#curation-writing-bank-task').textContent = task;
    $('#curation-writing-bank-filter').value = filter;
    $('#curation-writing-bank-list').replaceChildren(...shown.map(item => {
      const meta=evidenceMeta(item.id),li=make('li',`curation-writing-evidence ${used.has(item.id)?'is-used':'is-unused'} ${meta.reached?'is-reached':'is-not-reached'}`);
      const button=make('button','',meta.title);button.type='button';button.dataset.writingSource=item.id;button.dataset.task=task;button.setAttribute('aria-label',`查核來源：${meta.title}`);
      li.append(button,make('small','',`${meta.kind} · ${meta.page==='錄音'?'錄音':`第 ${meta.page} 頁`} · ${meta.source}`),make('span','',`${used.has(item.id)?'範文已使用':'可用但範文未使用'} · ${meta.reached?'已在前階段發現':'尚未在前階段到達'}`));
      return li;
    }));
  }

  function renderWritingWorkspace(step) {
    const task = step.task || state.writing.task || 'A';
    state.writing.task = task;
    if (!state.writing.visited.includes(step.id)) state.writing.visited.push(step.id);
    const brief=stage5.briefs[task];
    if(step.unitId)state.writing.modelUnits[task]=step.unitId;
    $$('.curation-writing-tabs [data-writing-task]',writingWorkspace).forEach(button=>{const active=button.dataset.writingTask===task;button.setAttribute('aria-selected',String(active));button.classList.toggle('active',active);});
    const briefRoot=$('#curation-writing-brief'); briefRoot.replaceChildren();
    briefRoot.append(make('p','curation-writing-eyebrow',`TASK ${task} · TASK ${brief.number} · ${brief.wordGuide}`),make('h2','',brief.title));
    const facts=make('dl');
    for(const [label,value] of [['作者',`${brief.writer} · ${brief.role}`],['讀者',brief.reader],['目的',brief.purpose],['文類',brief.genre],['語氣',brief.tone]]){const row=make('div');row.append(make('dt','',label),make('dd','',value));facts.append(row);} briefRoot.append(facts);
    const requirements=make('details');requirements.append(make('summary','','查看任務要求、結構和禁用資料'));
    const reqList=make('ul');[...brief.requiredContent.map(v=>`必寫：${v}`),...brief.structure.map(v=>`結構：${v}`),...stage5.rejected[task].map(v=>`不採用：${v}`)].forEach(v=>reqList.append(make('li','',v)));requirements.append(reqList);briefRoot.append(requirements);
    const plan=$('#curation-writing-plan'); if(document.activeElement!==plan&&plan.value!==state.writing.plans[task])plan.value=state.writing.plans[task];plan.setAttribute('aria-label',`Task ${task} planning notes`);
    plan.placeholder=brief.structure.join('\n');
    const draft=$('#curation-writing-draft');if(document.activeElement!==draft&&draft.value!==state.writing.drafts[task])draft.value=state.writing.drafts[task];draft.setAttribute('aria-label',`Task ${task} learner draft`);
    draft.placeholder=`Task ${task} · ${brief.genre} · ${brief.wordGuide}`;
    $('#curation-writing-words').textContent=`${words(state.writing.drafts[task])} words`;
    $('#curation-writing-transfer-status').textContent=state.writing.transfers[task]?'此草稿已明確轉移至原卷答案欄；之後的修訂仍只保存在工作台，須再次轉移。':'尚未轉移；不會自動交文。';
    const checklist=$('#curation-writing-checklist');checklist.replaceChildren(make('h2','',`Task ${task} 任務核對表`));
    stage5.checklists[task].forEach((copy,index)=>{const label=make('label');const input=make('input');input.type='checkbox';input.dataset.writingCheck=String(index);input.checked=state.writing.checks[task].includes(String(index));label.append(input,document.createTextNode(copy));checklist.append(label);});
    const revealed=state.writing.revealed[task];
    $('#curation-writing-warning').textContent=revealed?'已顯示教師草擬範文；它不是 HKEAA 官方答案，也不會取代你的草稿。':state.writing.revealWarnings[task]?'建議先完成自己的初稿。若仍要提早查看，請再按一次確認。':'先完成自己的初稿，再比較寫作決定。';
    $('#curation-writing-reveal').textContent=revealed?'教師草擬範文已顯示':state.writing.revealWarnings[task]?'仍要提早查看（確認）':'完成初稿後查看';
    $('#curation-writing-reveal').disabled=revealed;
    const taskArticle=$(`[data-model-task="${task}"]`,modelRoot);
    $$('[data-model-task]',modelRoot).forEach(article=>article.hidden=article!==taskArticle||!revealed);
    if(revealed){
      const currentUnit=step.unitId ? stage5.models[task].units.findIndex(unit=>unit.id===step.unitId) : -1;
      const postModel=['compare','revise','transfer','final'].includes(step.kind);
      $$('.curation-writing-model-unit',taskArticle).forEach((section,index)=>{const visible=postModel||currentUnit<0||index<=currentUnit;section.hidden=!visible;section.classList.toggle('is-current',section.dataset.unitId===step.unitId);});
    }
    const writingTargets={
      'evidence-plan':writingBank,'reject-evidence':writingBank,'content-plan':plan,'structure':plan,'draft':draft,
      'content-check':checklist,'genre-check':checklist,'model-introduction':$('#curation-writing-reveal'),'compare':modelRoot,'revise':draft,'transfer':$('#curation-writing-transfer'),'final':writingWorkspace
    };
    if(step.kind!=='model-unit'&&step.kind!=='source-reference')step.target=writingTargets[step.kind]||writingWorkspace;
    $$('.curation-target').forEach(target=>target.classList.remove('curation-target'));if(step.target?.isConnected)step.target.classList.add('curation-target');
    renderWritingBank(step);
  }

  const writingLimitFor=task=>state.writing.essayPositions?.[task]??(current().task===task?current().index:-1);
  const usedEssaySources=task=>new Set(stepsByStage.writing.filter(item=>item.task===task&&item.kind==='essay-source'&&item.index<=writingLimitFor(task)).map(item=>item.evidenceId));
  function syncEssaySourceMarks(){
    $$('.curation-essay-source-used,.curation-essay-source-new').forEach(node=>node.classList.remove('curation-essay-source-used','curation-essay-source-new'));
    const used=new Set([...usedEssaySources('A'),...usedEssaySources('B'),...usedEssaySources('C')]);
    for(const id of used){const source=stage4RecordById.get(id)||stage3CueById.get(id),target=stage3CueById.has(id)?(podcastMarksByCue.get(id)||[])[0]:source?.target;if(target)target.classList.add('curation-essay-source-used');for(const mark of podcastMarksByCue.get(id)||[])mark.classList.add('curation-essay-source-used');}
  }
  function renderWritingBank(step){
    const task=step.task||state.writing.task;state.writing.task=task;
    for(const other of 'ABC'){
      const group=$(`.curation-bank-${other}`,writingBank),used=usedEssaySources(other);group.open=other===task;
      const rows=$$('li',group);$('strong',group).textContent=String(rows.filter(row=>used.has(row.dataset.evidenceId)).length);
      for(const row of rows){const meta=evidenceMeta(row.dataset.evidenceId),isUsed=used.has(row.dataset.evidenceId);row.classList.toggle('curation-bank-used',isUsed);row.classList.toggle('curation-bank-used-new',step.kind==='essay-source'&&step.evidenceId===row.dataset.evidenceId);const button=$('button',row);button.textContent=meta.title;button.title=`${meta.kind} · ${meta.page==='錄音'?'錄音':`第 ${meta.page} 頁`} · ${meta.source}`;}
    }
  }
  function syncEssayPreview(step){
    $$('.curation-essay-source-new').forEach(node=>node.classList.remove('curation-essay-source-new'));
    if(step.kind!=='essay-source'){sourcePreview.hidden=true;sourcePreviewBody.replaceChildren();return;}
    const source=stage4RecordById.get(step.evidenceId)||stage3CueById.get(step.evidenceId),target=stage3CueById.has(step.evidenceId)?(podcastMarksByCue.get(step.evidenceId)||[])[0]:source?.target;if(!target)return;
    target.classList.add('curation-essay-source-used','curation-essay-source-new');
    const page=target.closest('.paper-page')||target.closest('.curation-podcast-transcript')||transcriptWindow,copy=page.cloneNode(true);copy.hidden=false;copy.removeAttribute('id');copy.classList.add('curation-preview-page');$$('[id]',copy).forEach(node=>node.removeAttribute('id'));
    let cloneTarget=null;if(stage4RecordById.has(step.evidenceId))cloneTarget=$$('[data-step-ids]',copy).find(node=>(node.dataset.stepIds||'').split(',').includes(step.evidenceId));else cloneTarget=$(`[data-cue-id="${step.evidenceId}"]`,copy);
    if(!cloneTarget){const needle=canonical(evidenceMeta(step.evidenceId).phrase).trim().toLowerCase();cloneTarget=$$('*',copy).find(node=>canonical(node.textContent).trim().toLowerCase()===needle)||$$('*',copy).find(node=>canonical(node.textContent).toLowerCase().includes(needle));}
    cloneTarget?.classList.add('curation-essay-source-used','curation-essay-source-new');copy.setAttribute('inert','');sourcePreviewBody.replaceChildren(copy);
    const meta=evidenceMeta(step.evidenceId);$('.curation-source-preview-head strong',sourcePreview).textContent=meta.page==='錄音'?'Pet Club 錄音稿 · 原文':`Data File 第 ${meta.page} 頁 · 原文`;sourcePreview.hidden=false;
    requestAnimationFrame(()=>{if(!cloneTarget||sourcePreview.hidden)return;const a=cloneTarget.getBoundingClientRect(),b=sourcePreviewBody.getBoundingClientRect();sourcePreviewBody.scrollTop+=a.top-b.top-80;});
  }
  function renderWritingWorkspace(step){
    const task=step.task||state.writing.task||'A';state.writing.task=task;if(!state.writing.visited.includes(step.id))state.writing.visited.push(step.id);if(step.unitId)state.writing.modelUnits[task]=step.unitId;
    for(const other of 'ABC'){
      const plan=$(`[data-writing-plan="${other}"]`,practice),draft=$(`[data-writing-draft="${other}"]`,practice),details=$(`#curation-model-${other}`),limit=writingLimitFor(other),modelSteps=stepsByStage.writing.filter(item=>item.task===other&&item.kind==='model-unit');
      if(document.activeElement!==plan)plan.value=state.writing.plans[other];if(document.activeElement!==draft)draft.value=state.writing.drafts[other];plan.placeholder=stage5.briefs[other].structure.join('\n');draft.placeholder=`Task ${other} · ${stage5.briefs[other].genre} · ${stage5.briefs[other].wordGuide}`;$(`[data-writing-words="${other}"]`).textContent=`${words(draft.value)} words`;$(`[data-writing-status="${other}"]`).textContent=state.writing.transfers[other]?'已轉移至原卷答案欄；再次修改後須重新轉移。':'尚未轉移；不會自動交文。';
      $$(`[data-writing-check][data-task="${other}"]`,practice).forEach(input=>{input.checked=state.writing.checks[other].includes(input.dataset.writingCheck);});
      if(other===task&&(step.kind==='model-unit'||step.kind==='essay-source'||step.kind==='essay-return'))details.open=true;
      for(const unitNode of $$(`[data-model-task="${other}"] .curation-essay-unit`,practice)){const unitStep=modelSteps.find(item=>item.unitId===unitNode.dataset.unitId),revealed=unitStep&&unitStep.index<=limit;unitNode.classList.toggle('is-revealed',revealed);unitNode.classList.toggle('is-current',other===task&&step.unitId===unitNode.dataset.unitId&&(step.kind==='model-unit'||step.kind==='essay-return'));}
    }
    $$('.curation-draft-card',practice).forEach(card=>card.classList.toggle('is-current',card.dataset.writingTask===task));syncEssaySourceMarks();renderWritingBank(step);syncEssayPreview(step);
  }

  const generatedNotes = new Set(stage3.cues.map(cue => cue.note).filter(Boolean));
  const noteEquals = (a, b) => canonical(a).replace(/\s+/g, ' ').trim() === canonical(b).replace(/\s+/g, ' ').trim();
  function projectCompletedNotes() {
    for (const [fieldId, {field}] of noteFields) {
      const authored = field.value.split('\n').filter(line => ![...generatedNotes].some(note => noteEquals(line, note)));
      const generated = stage3.cues.filter(cue => cue.field === fieldId && cue.note && state.heard.includes(cue.id)).map(cue => cue.note);
      const next = [...authored, ...generated].join('\n').replace(/^\n+|\n+$/g, '');
      if (field.value !== next) {
        field.value = next;
        field.dispatchEvent(new Event('input', {bubbles:true}));
      }
    }
  }

  function reconcilePodcastProgress(time, {selectCue = true} = {}) {
    const clamped = Math.max(stage3.audio.segmentStart, Math.min(stage3.audio.segmentEnd, Number(time) || stage3.audio.segmentStart));
    const reached = stage3.cues.filter(cue => cue.sourceEnd <= clamped + .07);
    const reachedIds = reached.map(cue => cue.id);
    state.heard = reachedIds;
    state.completed.podcast = [...reachedIds];
    state.podcast.completedThrough = reached.length - 1;
    state.podcast.currentTime = clamped;
    if (reached.length === stage3.cues.length) {
      if (!state.completedStages.includes('podcast')) state.completedStages.push('podcast');
    } else state.completedStages = state.completedStages.filter(stage => stage !== 'podcast');
    const cue = stage3.cues.find(item => item.sourceEnd > clamped + .04) || stage3.cues.at(-1);
    if (selectCue) {
      state.positions.podcast = cue.id;
      state.podcast.cueId = cue.id;
    }
    projectCompletedNotes();
    return cue;
  }

  function syncTranscriptEvidence(time = state.podcast.currentTime) {
    const cutoff = Number(time) || stage3.audio.segmentStart;
    $$('.curation-transcript-row', transcriptWindow).forEach(row => {
      row.classList.toggle('is-revealed', Number(row.dataset.end) <= cutoff + .07);
    });
  }

  function setCurrentCueStyles(step = current()) {
    $$('.curation-podcast-source-phrase', transcriptWindow).forEach(mark => mark.classList.remove('is-current'));
    for (const mark of podcastMarksByCue.get(step.id) || []) mark.classList.add('is-current');
    $$('.curation-podcast-pin', player).forEach(pin => {
      const cue = stepById.get(pin.dataset.cueId);
      pin.classList.toggle('is-current', cue?.id === step.id);
      pin.classList.toggle('is-heard', state.heard.includes(pin.dataset.cueId));
    });
    for (const [fieldId, {field, route}] of noteFields) {
      const active = step.stage === 'podcast' && step.field === fieldId;
      field.classList.toggle('curation-note-current', active);
      route.hidden = !(active && state.open);
      if (active) route.textContent = `${stage3.fields[fieldId]} · ${step.task ? `Task ${step.task} 可用證據` : '只作聆聽筆記'} · ${formatClock(step.sourceStart - stage3.audio.segmentStart)}–${formatClock(step.sourceEnd - stage3.audio.segmentStart)}`;
    }
    $$('.curation-transcript-row', transcriptWindow).forEach(row => {
      const start = Number(row.dataset.start); const end = Number(row.dataset.end);
      const source = step.stage === 'podcast' && end >= step.sourceStart - .05 && start <= step.sourceEnd + .05;
      row.classList.toggle('is-source', source);
      row.classList.toggle('is-listening-only', source && !step.task);
      row.classList.toggle('is-task-A', source && step.task === 'A');
      row.classList.toggle('is-task-C', source && step.task === 'C');
    });
    syncTranscriptEvidence(state.podcast.currentTime);
    if (step.stage === 'podcast' && audio.paused && !transcriptWindow.hidden) {
      const sourceRow = $('.curation-transcript-row.is-source', transcriptWindow);
      if (sourceRow) {
        programmaticTranscriptScroll = true;
        sourceRow.scrollIntoView({block:'center', behavior:'auto'});
        requestAnimationFrame(() => { programmaticTranscriptScroll = false; });
      }
    }
  }

  function activeTranscriptRow(time = audio.currentTime) {
    return $$('.curation-transcript-row', transcriptWindow).find(row => time >= Number(row.dataset.start) - .02 && time <= Number(row.dataset.end) + .05)
      || $$('.curation-transcript-row', transcriptWindow).findLast(row => Number(row.dataset.start) <= time);
  }

  let programmaticTranscriptScroll = false;
  function syncTranscriptFollow() {
    $$('.curation-transcript-row.is-playing', transcriptWindow).forEach(row => row.classList.remove('is-playing'));
    const row = activeTranscriptRow();
    if (!row) return;
    row.classList.add('is-playing');
    if (!audio.paused && state.podcast.followTranscript && !transcriptWindow.hidden) {
      programmaticTranscriptScroll = true;
      row.scrollIntoView({block:'center', behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
      setTimeout(() => { programmaticTranscriptScroll = false; }, 180);
    }
  }

  function syncPlayer() {
    const clamped = Math.max(stage3.audio.segmentStart, Math.min(stage3.audio.segmentEnd, audio.currentTime || state.podcast.currentTime));
    $('.curation-podcast-seek', player).value = String(clamped);
    $('.curation-podcast-time', player).textContent = `${formatClock(clamped - stage3.audio.segmentStart)} / ${formatClock(stage3.audio.segmentDuration)}`;
    $('.curation-podcast-play', player).textContent = audio.paused ? '▶' : '❚❚';
    $('.curation-podcast-play', player).setAttribute('aria-label', audio.paused ? '播放錄音' : '暫停錄音');
    speed.value = String(audio.playbackRate || state.podcast.playbackRate);
    state.podcast.currentTime = clamped;
    state.podcast.playbackRate = audio.playbackRate || 1;
    syncTranscriptEvidence(clamped);
    syncTranscriptFollow();
  }

  function fitTranscriptWindow() {
    transcriptWindow.dataset.moved = '';
    Object.assign(transcriptWindow.style, {left:'', right:'18px', top:'170px', width:'min(390px, calc(100vw - 36px))', height:'min(560px, calc(100vh - 200px))'});
  }

  function syncPodcastVisibility() {
    const writingCue = state.open && state.currentStage === 'writing' && current().kind === 'essay-source' && stage3CueById.has(current().evidenceId);
    const visible = state.open && state.currentStage === 'podcast';
    player.hidden = !visible;
    transcriptWindow.hidden = !(visible || writingCue);
    document.body.classList.toggle('curation-podcast-active', visible || writingCue);
    if (writingCue) {
      const cue=stage3CueById.get(current().evidenceId);syncTranscriptEvidence(cue.sourceEnd);setCurrentCueStyles(cue);
    } else if (visible) {
      audio.playbackRate = state.podcast.playbackRate;
      if (audio.readyState >= 1 && Math.abs(audio.currentTime - state.podcast.currentTime) > .25) audio.currentTime = state.podcast.currentTime;
      setCurrentCueStyles(); syncPlayer();
    } else if (!audio.paused) audio.pause();
  }

  let boundaryLock = false;
  let requestedPlaybackCue = null;
  function completePodcastCue(cue) {
    if (boundaryLock) return;
    boundaryLock = true;
    audio.pause();
    audio.currentTime = cue.sourceEnd;
    reconcilePodcastProgress(cue.sourceEnd, {selectCue:false});
    state.podcast.cueId = cue.id;
    state.podcast.currentTime = cue.sourceEnd;
    state.positions.podcast = cue.id;
    render(false);
    $('#curation-save-status').textContent = cue.note ? `已在 ${formatClock(cue.sourceEnd - stage3.audio.segmentStart)} 停下並寫入「${stage3.fields[cue.field]}」` : 'Podcast 已完整播放；六欄筆記可自由核對。';
    if (cue.field) noteFields.get(cue.field)?.field.focus({preventScroll:true});
    boundaryLock = false;
  }

  function playCue(cue, replay = false) {
    if (!cue) return;
    state.currentStage = 'podcast';
    state.positions.podcast = cue.id;
    const start = replay ? cue.playbackStart : Math.max(cue.playbackStart, Math.min(audio.currentTime || cue.playbackStart, cue.sourceEnd - .05));
    const run = () => {
      audio.currentTime = start;
      state.podcast.currentTime = start;
      state.podcast.cueId = cue.id;
      requestedPlaybackCue = cue;
      render(false);
      audio.play().catch(() => { $('#curation-save-status').textContent = '瀏覽器未能開始播放；請再按一次播放鍵。'; });
    };
    if (audio.readyState >= 1) run(); else audio.addEventListener('loadedmetadata', run, {once:true});
  }

  function hideSpotlight() {
    masks.forEach(mask => { mask.hidden = true; });
  }

  function spotlight() {
    const target = current().target;
    if (!state.open || state.currentStage==='writing' || !state.spotlight || !target?.isConnected) return hideSpotlight();
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
      Object.assign(mask.style, {left: `${x}px`, top: `${y}px`, width: `${width}px`, height: `${height}px`});
      mask.hidden = false;
    });
  }

  function route(step) {
    const detour = step.stage === 'data' && state.data.detourFrom === step.id ? stage4Routes.get(step.id) : null;
    const detourTarget = detour ? $(detour.selector) : null;
    if (state.open && detour && detourTarget) {
      $$('.curation-stage4-detour-target').forEach(node => node.classList.remove('curation-stage4-detour-target'));
      detourTarget.classList.add('curation-stage4-detour-target');
      const rect = detourTarget.getBoundingClientRect();
      const startX = 366, startY = 230;
      const endX = Math.max(20, rect.left - 12);
      const endY = Math.max(20, Math.min(innerHeight - 20, rect.top + Math.min(rect.height / 2, 160)));
      routeArrow.setAttribute('viewBox', `0 0 ${innerWidth} ${innerHeight}`);
      routeArrow.querySelector('path.curation-route-path').setAttribute('d', `M${startX},${startY} C${startX + 110},${startY} ${endX - 100},${endY} ${endX},${endY}`);
      routeArrow.removeAttribute('hidden');
      const copy = make('span', '', detour.label);
      const back = make('button', 'curation-route-return', '↩ 返回主線');
      back.type = 'button'; back.dataset.returnStage4 = step.id;
      routeCallout.replaceChildren(make('strong', '', 'Stage 4 · 查核路線'), copy, back);
      routeCallout.hidden = false;
      return;
    }
    $$('.curation-stage4-detour-target').forEach(node => node.classList.remove('curation-stage4-detour-target'));
    if (!state.open || step.stage !== 'instruction' || !step.sourceJump || !step.target?.isConnected) {
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
    routeCallout.replaceChildren(make('strong', '', step.sourcePage), make('span', '', step.routeLabel || step.title));
    routeCallout.hidden = false;
  }

  function rebuildSelects(step) {
    const jump = $('#curation-step-jump');
    jump.replaceChildren(...currentSteps().map(item => {
      const option = make('option', '', `${item.index + 1}. ${item.title}`);
      option.value = item.id;
      option.selected = item.id === step.id;
      return option;
    }));
    const placeholder = make('option', '', '選擇書籤');
    placeholder.value = '';
    $('#curation-bookmark-jump').replaceChildren(placeholder, ...state.bookmarks.map(id => {
      const item = stepById.get(id);
      const option = make('option', '', `Stage ${{instruction:1,categorize:2,podcast:3,data:4,writing:5}[item.stage]} · ${item.index + 1}. ${item.title}`);
      option.value = id;
      return option;
    }));
  }

  function renderCategoryPanel(step) {
    const panel = $('#curation-category-panel');
    panel.hidden = !step.categoryStep;
    if (!step.categoryStep) return;
    if (!state.categories[step.id]) state.categories[step.id] = [...step.initialTasks];
    $('#curation-document-type').textContent = step.documentType;
    $('#curation-writer').textContent = step.writer;
    $('#curation-reader').textContent = step.reader;
    $('#curation-date').textContent = step.date;
    const subheadingPanel = $('#curation-subheading-panel');
    subheadingPanel.hidden = !step.subheadings?.length;
    if (step.subheadings?.length) {
      $('#curation-subheading-list').replaceChildren(...step.subheadings.map(subheading => {
        const item = make('li', 'curation-subheading-row');
        const heading = make('div', 'curation-subheading-row-title');
        heading.append(make('strong', '', subheading.title));
        item.append(heading, make('p', '', '接下來以獨立步驟判斷並標記此欄。'));
        return item;
      }));
    } else $('#curation-subheading-list').replaceChildren();
    const selection = categorySelection(step);
    $$('.curation-category-choices input').forEach(input => { input.checked = selection.includes(input.value); });
    $('#curation-category-status').textContent = selection.includes('?') ? '目前保存：暫未確定' : `目前保存：${selection.map(task => `Task ${task}`).join(' + ')}`;
    $('#curation-possible-final').textContent = `細讀後可能保留：${step.possibleFinalTasks.map(task => `Task ${task}`).join(' + ')}`;
    $('#curation-revision-guidance').textContent = step.revisionGuidance;
    $('#curation-risk').textContent = `核對風險：${step.risk}`;
    $('#curation-revision').hidden = true;
    $('#curation-revision-toggle').setAttribute('aria-expanded', 'false');
    $('#curation-revision-toggle').textContent = '顯示讀後修正提示';
  }

  function renderRail() {
    const stageIndex = stageOrder.indexOf(state.currentStage);
    for (const [index, stage] of lesson.stages.entries()) {
      const button = $(`.curation-stage-item[data-stage="${stage.id}"]`);
      if (!button) continue;
      const active = stage.id === state.currentStage;
      const done = state.completedStages.includes(stage.id);
      button.classList.toggle('active', active);
      button.classList.toggle('done', done);
      button.classList.remove('complete');
      button.setAttribute('aria-current', active ? 'step' : 'false');
      const dot = $('.curation-stage-dot', button);
      dot.textContent = done ? '✓' : String(index + 1);
      const count = $('.curation-stage-count', button);
      if (!stageOrder.includes(stage.id)) count.textContent = '未開放';
      else if (active) {
        const position = stepsByStage[stage.id].findIndex(step => step.id === state.positions[stage.id]);
        count.textContent = `${Math.max(0, position) + 1}/${stepsByStage[stage.id].length}`;
      } else count.textContent = done ? '完成' : '';
    }
    $('.curation-stage-fill', rail).style.width = `${Math.max(0, stageIndex) * 20}%`;
  }

  function focusSource(step) {
    if (!step.target?.isConnected) return;
    if (step.targetKind === 'scan-only' && step.target.matches('details')) step.target.open = true;
    step.target.scrollIntoView({block: step.stage === 'writing' && step.kind === 'writing-prompt' ? 'start' : 'center', inline: 'nearest', behavior: 'instant'});
    if (step.stage === 'data' && innerWidth <= 760) {
      const dockBottom = dock.getBoundingClientRect().bottom;
      const targetTop = step.target.getBoundingClientRect().top;
      window.scrollBy({top:targetTop - dockBottom - 12, behavior:'instant'});
    }
    requestAnimationFrame(() => requestAnimationFrame(() => { spotlight(); route(step); }));
  }

  function render(focus = true) {
    const step = current();
    document.body.classList.toggle('curation-data-active', state.open && step.stage === 'data');
    document.documentElement.classList.toggle('curation-data-active-root', state.open && step.stage === 'data');
    document.body.classList.toggle('curation-writing-active', state.open && step.stage === 'writing');
    document.body.classList.toggle('curation-writing-source-active', state.open && step.stage === 'writing' && step.kind === 'essay-source');
    writingWorkspace.hidden = !(state.open && step.stage === 'writing');
    writingBank.hidden = !(state.open && step.stage === 'writing');
    taskMap.hidden = !state.open || step.stage === 'writing';
    reveal(step);
    syncFileStamps(step);
    syncSubheadingLabels(step);
    syncStage4SourceBars(step);
    if (step.stage === 'instruction') renderInstructionMap(step);
    else if (step.stage === 'categorize') renderCategoryMap(step);
    else if (step.stage === 'podcast') renderPodcastMap(step);
    else if (step.stage === 'data') renderDataMap(step);
    else renderWritingWorkspace(step);
    rebuildSelects(step);
    renderRail();
    $('#curation-dock-stage').textContent = `2014 B2 · SUPER CURATION · STAGE ${{instruction:1,categorize:2,podcast:3,data:4,writing:5}[step.stage]}`;
    const steps = currentSteps();
    $('#curation-step-count').textContent = `步驟 ${step.index + 1} / ${steps.length} · 完成 ${completedCount(step.stage)} / ${steps.length}`;
    $('#curation-progress').max = steps.length;
    $('#curation-progress').value = completedCount(step.stage);
    $('#curation-progress').setAttribute('aria-label', `Stage ${{instruction:1,categorize:2,podcast:3,data:4,writing:5}[step.stage]} 完成進度`);
    $('#curation-source').textContent = step.sourcePage;
    $('#curation-title').textContent = step.title;
    $('#curation-quote').textContent = step.quote || step.documentTitle || step.phrase || '';
    $('#curation-translation').textContent = step.translation || step.contents || '';
    $('#curation-type').textContent = typeLabel(step);
    const explanation = $('#curation-explanation');
    explanation.replaceChildren();
    if (step.stage === 'data') {
      for (const [label, value] of Object.entries(step.analysis)) {
        const paragraph = make('p', 'curation-stage4-analysis');
        paragraph.append(make('strong', '', `${label}：`), document.createTextNode(value));
        explanation.append(paragraph);
      }
      const decision = make('p', 'curation-stage4-decision');
      decision.append(make('strong', '', '作答決定：'), document.createTextNode(step.decision));
      explanation.append(decision);
      const detour = stage4Routes.get(step.id);
      if (detour) {
        const button = make('button', 'curation-stage4-detour', `查核來源 → ${detour.label}`);
        button.type = 'button'; button.dataset.detourId = step.id;
        explanation.append(button);
      }
      if (state.writing.sourceOrigin) {
        const back=make('button','curation-writing-return','返回 Stage 5 原來位置');back.type='button';back.dataset.returnWritingStep=state.writing.sourceOrigin;explanation.append(back);
      }
      const mobileBank = make('details', 'curation-mobile-evidence-bank');
      const available = stepsByStage.data.filter(item => item.index <= step.index && item.bankEligible);
      mobileBank.append(make('summary', '', `流動版證據庫 · ${available.length} 項`));
      for (const task of ['A', 'B', 'C']) {
        const relevant = available.filter(item => item.task === task);
        const group = make('section', `curation-mobile-evidence-group task-${task}`);
        group.append(make('h3', '', `Task ${task} · ${relevant.length}`));
        const list = make('ol');
        for (const item of relevant) {
          const row = make('li');
          const button = make('button', 'curation-evidence-jump', item.heading);
          button.type = 'button'; button.dataset.evidenceId = item.id;
          row.append(button); list.append(row);
        }
        group.append(list); mobileBank.append(group);
      }
      explanation.append(mobileBank);
    } else if (step.stage === 'writing') {
      const brief=stage5.briefs[step.task || state.writing.task], unit=stage5.models[step.task || state.writing.task].units.find(item=>item.id===step.unitId);
      if(step.kind==='writing-prompt') explanation.append(make('p','',step.lead),make('p','curation-source-refs',step.hint));
      else if(step.kind==='model-unit'&&unit) explanation.append(make('p','curation-analysis-why',`為甚麼這句：${unit.whyZh||unit.why}`),make('p','curation-source-refs curation-analysis-structure',`可重用結構：${unit.structureZh||unit.structure}`));
      else if(step.kind==='essay-source'){
        const meta=evidenceMeta(step.evidenceId);explanation.append(make('p','curation-process',`${meta.kind} · ${meta.page==='錄音'?'錄音':`第 ${meta.page} 頁`} · ${meta.source}`),make('blockquote','',meta.phrase),make('p','',`這項原文支援範文第 ${unit?.ordinal} 個單元；藍線表示已取用，並不代表整段照抄。`));
      } else if(step.kind==='essay-return') explanation.append(make('p','',`返回同一個範文單元，繼續檢視它的寫作作用。`),make('p','curation-source-refs',`可重用結構：${unit?.structureZh||unit?.structure||''}`));
      else explanation.append(make('p','',`作者：${brief.writer}；讀者：${brief.reader}；文類：${brief.genre}；目的：${brief.purpose}`));
    } else explanation.append(make('p', '', step.explanation || step.reason || ''));
    if (step.stage === 'podcast') {
      $('#curation-explanation').append(
        make('p', 'curation-source-refs', `連續播放：${formatClock(step.playbackStart - stage3.audio.segmentStart)} → ${formatClock(step.sourceEnd - stage3.audio.segmentStart)}；答案來源：${formatClock(step.sourceStart - stage3.audio.segmentStart)} → ${formatClock(step.sourceEnd - stage3.audio.segmentStart)}`),
        make('p', 'curation-podcast-freedom', state.heard.includes(step.id) ? '播放位置已越過此停頓點；相關筆記和逐句標記已顯示。' : '可自由瀏覽任何步驟。拖動時間軸會按所在時間同步顯示或收回筆記與逐句標記。')
      );
      if (step.id === 'p3-cue-01-definition') $('#curation-explanation').append(make('p', 'curation-source-warning', '來源註記：原始五頁錄音稿遺漏本段；文字與時間由實際 MP3 及站內時間稿交叉核實。'));
    }
    if (step.categoryStep) {
      $('#curation-explanation').append(make('p', 'curation-classification-reason', `暫定理由：${step.reason}`));
      $('#curation-explanation').append(make('p', 'curation-source-refs', `來源路線：${step.sourceRefs.join('；')}`));
    }
    if (step.subheadingStep) {
      const decision = make('div', 'curation-subheading-decision');
      decision.append(make('strong', '', '細分欄目標記'));
      const labels = step.labelTasks.length ? step.labelTasks : ['listening'];
      decision.append(...labels.map(task => make('span', `curation-subheading-tag curation-subheading-tag-${task}`, task === 'listening' ? '聆聽筆記' : `Task ${task}`)));
      $('#curation-explanation').append(decision, make('p', 'curation-subheading-help', step.help));
    }
    const points = $('#curation-points');
    points.replaceChildren(...(step.points || []).map(point => make('li', '', point)));
    points.hidden = !step.points?.length;
    renderCategoryPanel(step);
    $('#curation-prev').disabled = step.index === 0 && step.stage === 'instruction';
    const terminalComplete = step.stage === 'categorize' && step.final && state.completedStages.includes('categorize');
    $('#curation-next').disabled = false;
    if (step.stage === 'instruction' && step.final) $('#curation-next').textContent = '進入 Stage 2 →';
    else if (step.stage === 'categorize' && step.final) $('#curation-next').textContent = terminalComplete ? '進入 Stage 3 →' : '完成 Stage 2 並進入 Stage 3 →';
    else if (step.stage === 'podcast' && step.final) $('#curation-next').textContent = state.heard.includes(step.id) ? '進入 Stage 4 →' : '播放至錄音結尾 →';
    else if (step.stage === 'data' && step.final) $('#curation-next').textContent = state.completedStages.includes('data') ? '進入 Stage 5 →' : '完成 Stage 4 並進入 Stage 5 →';
    else if (step.stage === 'writing' && step.final) $('#curation-next').textContent = state.completedStages.includes('writing') ? '完整 Super Curation 已完成 ✓' : '完成 Stage 5 ✓';
    else $('#curation-next').textContent = '下一步 →';
    $('#curation-bookmark').textContent = state.bookmarks.includes(step.id) ? '★' : '☆';
    $('#curation-bookmark').setAttribute('aria-pressed', String(state.bookmarks.includes(step.id)));
    $('#curation-bookmark-count').textContent = state.bookmarks.length ? `${state.bookmarks.length} 個書籤` : '尚無書籤';
    $('#curation-spotlight').checked = state.spotlight;
    setCurrentCueStyles(step);
    syncPodcastVisibility();
    persist(step.stage === 'categorize' ? 'Stage 2 分類及位置已儲存。' : step.stage === 'podcast' ? 'Stage 3 播放位置及筆記已儲存。' : step.stage === 'data' ? 'Stage 4 來源位置及證據庫已儲存。' : step.stage === 'writing' ? 'Stage 5 構思、草稿及核對狀態已儲存。' : undefined);
    if (focus) {
      $('.curation-content').scrollTop = 0;
      focusSource(step);
    } else { spotlight(); route(step); }
  }

  function setStage(stage, focus = true) {
    if (!stageOrder.includes(stage)) return;
    if (state.currentStage === 'podcast' && stage !== 'podcast') audio.pause();
    state.currentStage = stage;
    render(focus);
  }

  function setCurrent(index, stage = state.currentStage) {
    const steps = stepsByStage[stage];
    if (state.currentStage === 'podcast') audio.pause();
    state.currentStage = stage;
    const safeIndex = Math.max(0, Math.min(steps.length - 1, index));
    state.positions[stage] = steps[safeIndex].id;
    if (stage === 'data') {
      state.completed.data = steps.slice(0, safeIndex).map(item => item.id);
      state.data.highestReached = Math.max(state.data.highestReached, safeIndex);
      state.data.detourFrom = null; state.data.detourTarget = null;
      if (safeIndex < steps.length - 1) state.completedStages = state.completedStages.filter(item => item !== 'data');
    }
    if (stage === 'writing') {
      state.writing.task = steps[safeIndex].task || state.writing.task;
      state.writing.essayPositions[state.writing.task] = safeIndex;
      state.completed.writing = state.completed.writing.filter(id=>{const item=stepById.get(id);return item?.task!==state.writing.task||item.index<safeIndex;});
      if (safeIndex < steps.length - 1) state.completedStages = state.completedStages.filter(item => item !== 'writing');
    }
    render(true);
  }

  function goToStep(step) {
    if (step) setCurrent(step.index, step.stage);
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
      audio.pause();
      document.body.classList.remove('curation-data-active');
      document.body.classList.remove('curation-writing-active');
      document.body.classList.remove('curation-writing-source-active');
      document.documentElement.classList.remove('curation-data-active-root');
      writingWorkspace.hidden = true; writingBank.hidden = true; sourcePreview.hidden = true;
      syncStage4SourceBars(current());
      hideSpotlight();
      routeArrow.setAttribute('hidden', '');
      routeCallout.hidden = true;
      syncPodcastVisibility();
      persist('已儲存離開位置');
    }
  }

  launch.addEventListener('click', () => setOpen(!state.open));
  $('#curation-close').addEventListener('click', () => setOpen(false));
  $$('.curation-stage-item[data-stage]').forEach(button => button.addEventListener('click', () => { if (!button.disabled) setStage(button.dataset.stage); }));
  $('#curation-prev').addEventListener('click', () => {
    const step = current();
    if (step.index > 0) setCurrent(step.index - 1);
    else if (step.stage === 'categorize') setCurrent(stepsByStage.instruction.length - 1, 'instruction');
    else if (step.stage === 'podcast') setCurrent(stepsByStage.categorize.length - 1, 'categorize');
    else if (step.stage === 'data') setCurrent(stepsByStage.podcast.length - 1, 'podcast');
    else if (step.stage === 'writing') setCurrent(stepsByStage.data.length - 1, 'data');
  });
  $('#curation-next').addEventListener('click', () => {
    const step = current();
    if (step.stage !== 'podcast' && !state.completed[step.stage].includes(step.id)) state.completed[step.stage].push(step.id);
    if (step.final && step.stage === 'instruction') {
      if (!state.completedStages.includes('instruction')) state.completedStages.push('instruction');
      setCurrent(0, 'categorize');
    } else if (step.final && step.stage === 'categorize') {
      if (!state.completedStages.includes('categorize')) state.completedStages.push('categorize');
      setCurrent(0, 'podcast');
    } else if (step.stage === 'podcast') {
      if (step.final) {
        if (!state.heard.includes(step.id)) playCue(step, false); else setCurrent(0, 'data');
      } else {
        const next = stepsByStage.podcast[step.index + 1];
        setCurrent(step.index + 1, 'podcast');
        if (state.heard.includes(step.id)) playCue(next, false);
      }
    } else if (step.stage === 'data') {
      if (!state.completed.data.includes(step.id)) state.completed.data.push(step.id);
      if (step.final) {
        if (!state.completedStages.includes('data')) state.completedStages.push('data');
        setCurrent(0,'writing');
      } else setCurrent(step.index + 1, 'data');
    } else if (step.stage === 'writing') {
      if (!state.completed.writing.includes(step.id)) state.completed.writing.push(step.id);
      if (step.final) {
        if (!state.completedStages.includes('writing')) state.completedStages.push('writing');
        render(false);
      } else setCurrent(step.index + 1,'writing');
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
  $('#curation-step-jump').addEventListener('change', event => goToStep(stepById.get(event.target.value)));
  $('#curation-bookmark-jump').addEventListener('change', event => goToStep(stepById.get(event.target.value)));
  taskMap.addEventListener('click', event => {
    const id = event.target.closest('[data-evidence-id]')?.dataset.evidenceId;
    if (id) goToStep(stepById.get(id));
  });
  $('#curation-explanation').addEventListener('click', event => {
    const returnUnit=event.target.closest('[data-return-writing-unit]')?.dataset.returnWritingUnit;
    if(returnUnit){goToStep(stepById.get(returnUnit));return;}
    const returnStep=event.target.closest('[data-return-writing-step]')?.dataset.returnWritingStep;
    if(returnStep){state.writing.sourceOrigin=null;goToStep(stepById.get(returnStep));return;}
    const evidenceId = event.target.closest('[data-evidence-id]')?.dataset.evidenceId;
    if (evidenceId) { goToStep(stepById.get(evidenceId)); return; }
    const id = event.target.closest('[data-detour-id]')?.dataset.detourId;
    if (!id || current().id !== id) return;
    const detour = stage4Routes.get(id);
    state.data.detourFrom = id; state.data.detourTarget = detour?.selector || null;
    const target = detour ? $(detour.selector) : null;
    if (target) target.scrollIntoView({block:'center', behavior:'instant'});
    persist('查核路線及返回點已儲存。');
    requestAnimationFrame(() => route(current()));
  });
  let writingSaveTimer;
  const saveWritingSoon=message=>{clearTimeout(writingSaveTimer);writingSaveTimer=setTimeout(()=>persist(message),220);};
  writingWorkspace.addEventListener('input',event=>{const planTask=event.target.dataset.writingPlan,draftTask=event.target.dataset.writingDraft;if(planTask){state.writing.plans[planTask]=event.target.value;saveWritingSoon(`Task ${planTask} 構思已儲存；不會加入交文。`);}if(draftTask){state.writing.drafts[draftTask]=event.target.value;state.writing.transfers[draftTask]=false;$(`[data-writing-words="${draftTask}"]`).textContent=`${words(event.target.value)} words`;$(`[data-writing-status="${draftTask}"]`).textContent='草稿已修訂；尚未再次轉移。';saveWritingSoon(`Task ${draftTask} 草稿已儲存於此瀏覽器。`);}});
  writingWorkspace.addEventListener('change',event=>{if(!event.target.matches('[data-writing-check]'))return;const task=event.target.dataset.task,id=event.target.dataset.writingCheck;state.writing.checks[task]=event.target.checked?[...new Set([...state.writing.checks[task],id])]:state.writing.checks[task].filter(value=>value!==id);persist(`Task ${task} 核對表已儲存。`);});
  writingWorkspace.addEventListener('click',event=>{const task=event.target.closest('[data-writing-transfer]')?.dataset.writingTransfer;if(!task)return;const text=state.writing.drafts[task],status=$(`[data-writing-status="${task}"]`);if(!text.trim()){status.textContent='草稿為空，沒有轉移。';return;}const fields=stage5.briefs[task].submissionTarget.map(id=>document.getElementById(id)).filter(Boolean);if(!fields.length){status.textContent='找不到原卷答案欄；草稿仍安全保存在這裡。';return;}fields[0].value=text;fields.slice(1).forEach(field=>field.value='');fields.forEach(field=>field.dispatchEvent(new Event('input',{bubbles:true})));state.writing.transfers[task]=true;status.textContent=`Task ${task} 已轉移至原卷答案欄；未有提交。`;persist(status.textContent);});
  for(const task of 'ABC')$(`#curation-model-${task} summary`)?.addEventListener('click',()=>setTimeout(()=>{const model=$(`#curation-model-${task}`);if(!model.open)return;const first=stepsByStage.writing.find(step=>step.task===task&&step.kind==='model-unit');if(first)goToStep(first);},0));
  writingBank.addEventListener('click',event=>{const button=event.target.closest('[data-writing-source]');if(!button)return;const task=button.dataset.task,id=button.dataset.writingSource,limit=writingLimitFor(task);const visits=stepsByStage.writing.filter(step=>step.task===task&&step.kind==='essay-source'&&step.evidenceId===id);const ref=visits.find(step=>step.index>=limit)||visits[0];if(ref)goToStep(ref);});
  routeCallout.addEventListener('click', event => {
    const id = event.target.closest('[data-return-stage4]')?.dataset.returnStage4;
    if (!id) return;
    state.data.detourFrom = null; state.data.detourTarget = null;
    $$('.curation-stage4-detour-target').forEach(node => node.classList.remove('curation-stage4-detour-target'));
    const step = stepById.get(id);
    if (step?.target) step.target.scrollIntoView({block:'center', behavior:'instant'});
    persist('已返回 Stage 4 主線。');
    requestAnimationFrame(() => route(current()));
  });
  $$('.curation-category-choices input').forEach(input => input.addEventListener('change', event => {
    const step = current();
    if (!step.categoryStep) return;
    if (event.target.value === '?' && event.target.checked) state.categories[step.id] = ['?'];
    else {
      const selected = $$('.curation-category-choices input').filter(item => item.value !== '?' && item.checked).map(item => item.value);
      state.categories[step.id] = selected.length ? selected.sort() : ['?'];
    }
    render(false);
  }));
  $('#curation-revision-toggle').addEventListener('click', () => {
    const panel = $('#curation-revision');
    panel.hidden = !panel.hidden;
    $('#curation-revision-toggle').setAttribute('aria-expanded', String(!panel.hidden));
    $('#curation-revision-toggle').textContent = panel.hidden ? '顯示讀後修正提示' : '隱藏讀後修正提示';
  });
  $('#curation-help').addEventListener('click', () => {
    const step = current();
    $('#curation-help-context').textContent = `${step.sourcePage} · ${step.title}`;
    $('#curation-help-guidance').textContent = step.help || (step.stage === 'writing' ? '先用右側已驗證證據完成自己的構思與草稿；範文只用來比較寫作決定，不會自動加入答案。' : '');
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

  let playbackCue = null;
  $('.curation-podcast-play', player).addEventListener('click', () => {
    if (!audio.paused) { audio.pause(); return; }
    const time = audio.readyState >= 1 ? audio.currentTime : state.podcast.currentTime;
    const cue = stage3.cues.find(item => item.sourceEnd > time + .04) || stage3.cues.at(-1);
    playCue(cue, false);
  });
  $('.curation-podcast-seek', player).addEventListener('input', event => {
    audio.pause();
    audio.currentTime = Number(event.target.value);
    reconcilePodcastProgress(audio.currentTime);
    render(false); syncPlayer();
    persist('已按播放位置同步筆記及逐句標記。');
  });
  speed.addEventListener('change', () => {
    audio.playbackRate = Number(speed.value);
    state.podcast.playbackRate = audio.playbackRate;
    syncPlayer(); persist('播放速度已儲存。');
  });
  $('.curation-podcast-pins-toggle', player).addEventListener('click', event => {
    pins.hidden = !pins.hidden;
    event.currentTarget.setAttribute('aria-pressed', String(!pins.hidden));
    event.currentTarget.textContent = pins.hidden ? '顯示停頓點' : '隱藏停頓點';
  });
  pins.addEventListener('click', event => {
    const cue = stepById.get(event.target.closest('[data-cue-id]')?.dataset.cueId);
    if (cue) playCue(cue, true);
  });
  transcriptBody.addEventListener('click', event => {
    const row = event.target.closest('.curation-transcript-row');
    if (!row) return;
    audio.pause(); audio.currentTime = Number(row.dataset.start);
    reconcilePodcastProgress(audio.currentTime);
    render(false); syncPlayer();
  });
  $('.curation-transcript-zh', transcriptWindow).addEventListener('click', event => {
    const show = transcriptWindow.classList.toggle('show-translation');
    event.currentTarget.setAttribute('aria-pressed', String(show));
    event.currentTarget.textContent = show ? '隱藏中文' : '顯示中文';
  });
  $('.curation-transcript-follow', transcriptWindow).addEventListener('click', event => {
    state.podcast.followTranscript = !state.podcast.followTranscript;
    event.currentTarget.setAttribute('aria-pressed', String(state.podcast.followTranscript));
    event.currentTarget.textContent = state.podcast.followTranscript ? '跟隨播放' : '自由捲動';
    if (state.podcast.followTranscript) syncTranscriptFollow();
    persist('錄音稿跟隨設定已儲存。');
  });
  const disableFollow = () => {
    if (programmaticTranscriptScroll || !state.podcast.followTranscript) return;
    state.podcast.followTranscript = false;
    const button = $('.curation-transcript-follow', transcriptWindow);
    button.setAttribute('aria-pressed', 'false'); button.textContent = '自由捲動';
  };
  transcriptBody.addEventListener('wheel', disableFollow, {passive:true});
  transcriptBody.addEventListener('touchstart', disableFollow, {passive:true});
  $('.curation-podcast-fit', player).addEventListener('click', fitTranscriptWindow);

  audio.addEventListener('loadedmetadata', () => {
    audio.currentTime = Math.max(stage3.audio.segmentStart, Math.min(stage3.audio.segmentEnd, state.podcast.currentTime));
    audio.playbackRate = state.podcast.playbackRate;
    reconcilePodcastProgress(audio.currentTime);
    syncPlayer();
  });
  audio.addEventListener('play', () => {
    playbackCue = requestedPlaybackCue || stage3.cues.find(cue => cue.sourceEnd > audio.currentTime + .04) || stage3.cues.at(-1);
    requestedPlaybackCue = null;
    state.positions.podcast = playbackCue.id; state.podcast.cueId = playbackCue.id;
    syncPlayer(); render(false);
  });
  audio.addEventListener('pause', () => { syncPlayer(); persist('播放位置已儲存。'); });
  audio.addEventListener('ratechange', syncPlayer);
  audio.addEventListener('seeked', () => {
    if (!state.open || state.currentStage !== 'podcast' || boundaryLock) return;
    reconcilePodcastProgress(audio.currentTime);
    render(false); syncPlayer();
  });
  audio.addEventListener('timeupdate', () => {
    if (!state.open || state.currentStage !== 'podcast') return;
    syncPlayer();
    if (!audio.paused && playbackCue && audio.currentTime >= playbackCue.sourceEnd - .07) {
      const cue = playbackCue; playbackCue = null; completePodcastCue(cue);
    }
  });

  let transcriptPointer = null;
  transcriptWindow.addEventListener('pointerdown', event => {
    const resize = event.target.closest('.curation-transcript-resize');
    const header = event.target.closest('header');
    if (!resize && (!header || event.target.closest('button'))) return;
    const rect = transcriptWindow.getBoundingClientRect();
    transcriptPointer = {mode:resize ? 'resize' : 'move', x:event.clientX, y:event.clientY, left:rect.left, top:rect.top, width:rect.width, height:rect.height};
    transcriptWindow.dataset.moved = '1'; transcriptWindow.setPointerCapture(event.pointerId); event.preventDefault();
  });
  transcriptWindow.addEventListener('pointermove', event => {
    if (!transcriptPointer) return;
    const dx = event.clientX - transcriptPointer.x, dy = event.clientY - transcriptPointer.y;
    if (transcriptPointer.mode === 'move') {
      const left = Math.max(4, Math.min(innerWidth - transcriptPointer.width - 4, transcriptPointer.left + dx));
      const top = Math.max(4, Math.min(innerHeight - transcriptPointer.height - 4, transcriptPointer.top + dy));
      Object.assign(transcriptWindow.style, {left:`${left}px`, right:'auto', top:`${top}px`});
    } else {
      const width = Math.max(280, Math.min(innerWidth - transcriptPointer.left - 4, transcriptPointer.width + dx));
      const height = Math.max(240, Math.min(innerHeight - transcriptPointer.top - 4, transcriptPointer.height + dy));
      Object.assign(transcriptWindow.style, {width:`${width}px`, height:`${height}px`});
    }
  });
  const endTranscriptPointer = () => { transcriptPointer = null; };
  transcriptWindow.addEventListener('pointerup', endTranscriptPointer);
  transcriptWindow.addEventListener('lostpointercapture', endTranscriptPointer);
  document.addEventListener('keydown', event => {
    if (!state.open || dialog.open || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
    if (event.key === 'ArrowLeft' && !$('#curation-prev').disabled) $('#curation-prev').click();
    if (event.key === 'ArrowRight' && !$('#curation-next').disabled) $('#curation-next').click();
    if (event.key === 'Escape') setOpen(false);
  });
  window.addEventListener('scroll', () => { spotlight(); route(current()); }, {passive: true});
  window.addEventListener('resize', () => { spotlight(); route(current()); });
  window.addEventListener('pagehide', () => persist());

  window.EDMUND_2014_B2_CURATION_DEBUG = Object.freeze({
    version: VERSION,
    stage2Version: stage2.version,
    stage3Version: stage3.version,
    stage4Version: stage4.version,
    stage5Version: stage5.version,
    architecture: stage4.architecture,
    stepsByStage: Object.fromEntries(stageOrder.map(stage => [stage, stepsByStage[stage].map(({target, ...step}) => step)])),
    inventory: stage2.inventory.map(record => ({...record})), targetAudit,
    cueLedger: stage3.cues.map(cue => ({...cue})),
    transcript: stage3.transcript.map(turn => ({...turn})),
    stage4Inventory: stage4.inventory.map(source => ({...source})),
    evidenceLedger: stage4.records.map(record => ({...record})),
    stage4Routes: Object.fromEntries(stage4Routes),
    taskBriefs: clone(stage5.briefs),
    writingModels: clone(stage5.models),
    writingChecklists: clone(stage5.checklists),
    audio: stage3.audio,
    getAudio: () => audio,
    getState: () => ({...clone(state), position: current().index, stepId: current().id}),
    open: () => setOpen(true), close: () => setOpen(false),
    next: () => $('#curation-next').click(), prev: () => $('#curation-prev').click(),
    goById: id => goToStep(stepById.get(id)), setStage: stage => setStage(stage),
    playCue: (id, replay = true) => playCue(stepById.get(id), replay),
    setWritingText: (task, kind, value) => { if(['A','B','C'].includes(task)&&['plans','drafts'].includes(kind)){state.writing[kind][task]=String(value);render(false);persist();} },
    revealModel: task => { if(['A','B','C'].includes(task)){state.writing.task=task;state.writing.revealed[task]=true;render(false);persist();} },
    completeCueForTest: id => completePodcastCue(stepById.get(id)),
    setSpotlight: value => { state.spotlight = value !== false; render(false); },
    reset: () => { audio.pause(); state = blankState(); projectCompletedNotes(); audio.currentTime = stage3.audio.segmentStart; state.open = true; render(true); }
  });

  fitTranscriptWindow();
  projectCompletedNotes();
  audio.load();
  if (new URLSearchParams(location.search).get('curation') === '1' || state.open) setOpen(true);
})();

