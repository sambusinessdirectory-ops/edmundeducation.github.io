(() => {
  'use strict';

  const data = window.EDMUND_2016_B2_STAGE3;
  const lesson = window.EDMUND_2016_B2_CURATION;
  const part1 = window.EDMUND_2016_B2_CURATION_DEBUG;
  const part2 = window.EDMUND_2016_B2_CURATION_STAGE2_DEBUG;
  if (!data?.steps?.length || data.transcript.length !== 44 || !part1 || !document.querySelector('#curation-next')) return;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const make = (tag, className = '', text = '') => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };
  const steps = data.steps.map(step => ({...step}));
  const byId = new Map(steps.map(step => [step.id, step]));
  const cuesById = new Map(data.cues.map(cue => [cue.id, cue]));
  const cueStepById = new Map(steps.filter(step => step.kind === 'cue').map(step => [step.cueId, step]));
  const fieldById = new Map(data.fields.map(field => [field.id, field]));
  const transactionLog = [];
  const stage3Panel = make('div', 'curation-stage3-actions');
  stage3Panel.id = 'curation-stage3-actions';
  stage3Panel.hidden = true;
  $('#curation-points').after(stage3Panel);

  function blankState() {
    return {
      currentId: steps[0].id,
      completedIds: [],
      bookmarks: [],
      heardCueIds: [],
      customizedCueIds: [],
      authoredNotes: {},
      helpDrafts: {},
      active: false,
      complete: false,
      transcriptTranslation: false,
      pinsShown: false,
      playbackRate: 1,
      audioTime: 0,
      migratedFrom: {
        stage1: lesson?.version || null,
        stage2: lesson?.stage2Version || null
      }
    };
  }

  function restore(value) {
    const clean = blankState();
    if (!value || typeof value !== 'object' || Array.isArray(value)) return clean;
    const knownSteps = list => [...new Set((Array.isArray(list) ? list : []).filter(id => byId.has(id)))];
    const knownCues = list => [...new Set((Array.isArray(list) ? list : []).filter(id => cuesById.has(id)))];
    clean.currentId = byId.has(value.currentId) ? value.currentId : steps[0].id;
    clean.completedIds = knownSteps(value.completedIds);
    clean.bookmarks = knownSteps(value.bookmarks);
    clean.heardCueIds = knownCues(value.heardCueIds);
    clean.customizedCueIds = knownCues(value.customizedCueIds);
    clean.active = value.active === true;
    clean.complete = value.complete === true && clean.completedIds.includes(steps.at(-1).id);
    clean.transcriptTranslation = value.transcriptTranslation === true;
    clean.pinsShown = value.pinsShown === true;
    clean.playbackRate = [0.5,0.75,1,1.25,1.5,1.75,2,2.25,2.5,2.75,3].includes(Number(value.playbackRate)) ? Number(value.playbackRate) : 1;
    clean.audioTime = Number.isFinite(value.audioTime) ? Math.max(0, Math.min(data.audio.duration, value.audioTime)) : 0;
    if (value.authoredNotes && typeof value.authoredNotes === 'object' && !Array.isArray(value.authoredNotes)) {
      clean.authoredNotes = Object.fromEntries(Object.entries(value.authoredNotes)
        .filter(([id, text]) => fieldById.has(id) && typeof text === 'string')
        .map(([id, text]) => [id, text.slice(0, 12000)]));
    }
    if (value.helpDrafts && typeof value.helpDrafts === 'object' && !Array.isArray(value.helpDrafts)) {
      clean.helpDrafts = Object.fromEntries(Object.entries(value.helpDrafts)
        .filter(([id, text]) => byId.has(id) && typeof text === 'string')
        .map(([id, text]) => [id, text.slice(0, 4000)]));
    }
    return clean;
  }

  let state = blankState();
  try {
    const saved = JSON.parse(localStorage.getItem(data.storageKey) || 'null');
    if (saved?.schema === data.schema && saved.version === data.version) state = restore(saved.state);
  } catch (error) {
    console.warn('2016 Stage 3 progress could not be restored.', error);
  }

  function persist(message = 'Stage 3 錄音、筆記與逐字稿進度已自動儲存。') {
    try {
      localStorage.setItem(data.storageKey, JSON.stringify({
        schema: data.schema,
        version: data.version,
        architectureVersion: data.architectureVersion,
        state
      }));
      if ($('#curation-save-status')) $('#curation-save-status').textContent = message;
    } catch {
      if ($('#curation-save-status')) $('#curation-save-status').textContent = '未能儲存；本次操作仍可繼續。';
    }
  }

  const fieldRefs = new Map();
  const generatedNotes = fieldId => data.cues.filter(cue =>
    cue.field === fieldId && cue.note && state.heardCueIds.includes(cue.id) && !state.customizedCueIds.includes(cue.id)
  );
  const normalizeLine = value => String(value || '').trim().replace(/[’‘]/g, "'").replace(/\s+/g, ' ');
  const noteMatches = (left, right) => normalizeLine(left) === normalizeLine(right);
  let typingCueId = null;
  let typingTimer = null;

  function extractAuthored(fieldId, value) {
    const cueNotes = data.cues.filter(cue => cue.field === fieldId && cue.note).map(cue => cue.note);
    return String(value || '').split('\n').filter(line => !cueNotes.some(note => noteMatches(line, note))).join('\n').trim();
  }

  function buildEvidencePanel(field) {
    const details = make('details', 'curation-notes-evidence');
    details.dataset.notesSection = field.id;
    const summary = make('summary', '', '顯示相關錄音內容');
    summary.setAttribute('aria-label', `${field.title}：顯示或收起相關錄音內容`);
    const body = make('div', 'curation-notes-evidence-body');
    const label = make('p', `curation-notes-scope ${field.task ? `is-task-${field.task}` : 'is-listening'}`,
      field.task ? `Task ${field.task} 寫作證據` : '完整聆聽筆記 · 不屬 A／B／C');
    const tip = make('p', '', field.help);
    const firstCue = data.cues.find(cue => cue.field === field.id);
    const play = make('button', 'curation-notes-play', firstCue ? `▶ 由 ${formatTime(firstCue.start)} 播放這欄` : '未有錄音段落');
    play.type = 'button';
    play.disabled = !firstCue;
    play.addEventListener('click', () => {
      if (!firstCue) return;
      playCue(firstCue, true);
    });
    const excerpt = make('div', 'curation-notes-excerpt');
    data.transcript.slice(field.transcriptStart, field.transcriptEnd + 1).forEach(turn => {
      const line = make('p');
      line.append(make('strong', '', `${turn.speaker}: `), document.createTextNode(turn.text));
      excerpt.append(line);
    });
    body.append(label, tip, play, excerpt);
    details.append(summary, body);
    details.addEventListener('toggle', () => {
      summary.textContent = details.open ? '收起相關錄音內容' : '顯示相關錄音內容';
    });
    return details;
  }

  for (const field of data.fields) {
    const textarea = $(field.selector);
    const heading = $(field.headingSelector);
    if (!textarea || !heading) continue;
    const headingId = `notes-heading-2016-${field.slug}`;
    const fieldId = `notes-2016-${field.slug}`;
    heading.id = headingId;
    heading.classList.add('curation-native-note-heading', field.task ? `curation-native-note-task-${field.task}` : 'curation-native-note-listening');
    let headingCopy = $('.curation-native-heading-copy', heading);
    if (!headingCopy) {
      const text = [...heading.childNodes].filter(node => node.nodeType === Node.TEXT_NODE).map(node => node.textContent).join('').trim();
      [...heading.childNodes].filter(node => node.nodeType === Node.TEXT_NODE).forEach(node => node.remove());
      headingCopy = make('span', 'curation-native-heading-copy', text || field.title);
      heading.prepend(headingCopy);
    }
    textarea.id = fieldId;
    textarea.setAttribute('aria-labelledby', headingId);
    textarea.classList.add('curation-native-note-field');
    let stateMark = $('.curation-stage3-heading-state', heading);
    if (!stateMark) {
      stateMark = make('span', `curation-stage3-heading-state ${field.task ? `curation-stage3-heading-task-${field.task}` : 'curation-stage3-heading-listening'}`);
      stateMark.setAttribute('role', 'img');
      stateMark.setAttribute('aria-label', field.task ? `Task ${field.task}` : '不屬 Task A、B 或 C');
      stateMark.textContent = field.task || '不取材';
      heading.append(stateMark);
    }
    let panel = textarea.nextElementSibling?.matches('.curation-notes-evidence') ? textarea.nextElementSibling : null;
    if (!panel) {
      panel = buildEvidencePanel(field);
      textarea.after(panel);
    }
    if (!(field.id in state.authoredNotes)) state.authoredNotes[field.id] = extractAuthored(field.id, textarea.value);
    textarea.addEventListener('input', event => {
      if (!event.isTrusted) return;
      if (typingTimer) clearInterval(typingTimer);
      typingTimer = null;
      const activeCue = typingCueId ? cuesById.get(typingCueId) : null;
      if (activeCue) state.customizedCueIds = [...new Set([...state.customizedCueIds, activeCue.id])];
      typingCueId = null;
      const lines = textarea.value.split('\n');
      for (const cue of generatedNotes(field.id)) {
        if (!lines.some(line => noteMatches(line, cue.note))) {
          state.customizedCueIds = [...new Set([...state.customizedCueIds, cue.id])];
        }
      }
      state.authoredNotes[field.id] = extractAuthored(field.id, textarea.value);
      textarea.classList.remove('curation-note-writing');
      persist('你輸入的筆記已保留；生成筆記不會覆寫。');
      render(false);
    });
    fieldRefs.set(field.id, {field, textarea, heading, panel, stateMark});
  }

  function syncNotes() {
    for (const [fieldId, ref] of fieldRefs) {
      const generated = generatedNotes(fieldId)
        .filter(cue => cue.id !== typingCueId)
        .map(cue => cue.note);
      const authored = state.authoredNotes[fieldId]?.trim() || '';
      const value = [authored, ...generated].filter(Boolean).join('\n');
      if (ref.textarea.value !== value && !(typingCueId && cuesById.get(typingCueId)?.field === fieldId)) {
        ref.textarea.value = value;
        ref.textarea.dispatchEvent(new Event('input', {bubbles: true}));
      }
    }
  }

  const player = make('div', 'curation-player curation-player-2016');
  player.id = 'curation-player-2016';
  player.hidden = true;
  player.dataset.podcastArchitecture = data.architectureVersion;
  player.innerHTML = `
    <span class="curation-player-title">2016 Part B · Podcast</span>
    <button type="button" class="curation-player-play" aria-label="播放錄音">▶</button>
    <button type="button" class="curation-player-pins-toggle" aria-pressed="false" aria-controls="curation-player-pins-2016">顯示停頓點</button>
    <span class="curation-player-timeline">
      <input class="curation-player-seek" type="range" min="0" max="${data.audio.duration}" step="0.01" value="0" aria-label="錄音進度">
      <span class="curation-player-pins" id="curation-player-pins-2016" hidden></span>
    </span>
    <output class="curation-player-time">0:00 / 13:52</output>
    <label class="curation-player-speed">速度 <select aria-label="播放速度"></select></label>
    <span class="curation-player-status" role="status"></span>`;
  const audio = document.createElement('audio');
  audio.src = data.audio.src;
  audio.preload = 'metadata';
  audio.setAttribute('aria-label', '2016 DSE Paper 3 Part B 完整錄音');
  audio.hidden = true;
  player.append(audio);
  const speed = $('.curation-player-speed select', player);
  for (const rate of [0.5,0.75,1,1.25,1.5,1.75,2,2.25,2.5,2.75,3]) {
    const option = make('option', '', `${rate}×`);
    option.value = String(rate);
    speed.append(option);
  }
  speed.value = String(state.playbackRate);
  audio.playbackRate = state.playbackRate;
  const pins = $('.curation-player-pins', player);
  for (const [index, cue] of data.cues.entries()) {
    const pin = make('span', 'curation-player-pin');
    pin.dataset.cueId = cue.id;
    pin.style.left = `${(cue.endpoint / data.audio.duration) * 100}%`;
    pin.setAttribute('role', 'img');
    pin.setAttribute('aria-label', `${index + 1}. ${cue.title} · ${formatTime(cue.endpoint)}`);
    pin.title = pin.getAttribute('aria-label');
    pins.append(pin);
  }

  const transcriptWindow = make('aside', 'curation-transcript-window curation-transcript-window-2016');
  transcriptWindow.id = 'curation-transcript-window-2016';
  transcriptWindow.hidden = true;
  transcriptWindow.setAttribute('aria-label', '2016 Part B 浮動錄音稿');
  transcriptWindow.innerHTML = `
    <div class="curation-transcript-window-head">
      <strong>錄音稿 · 自由捲動</strong>
      <button type="button" class="curation-transcript-translate" aria-pressed="false">中文對照</button>
      <span>拖曳移動 · 四角調整大小</span>
    </div>
    <div class="curation-transcript-window-body"></div>`;
  const transcriptBody = $('.curation-transcript-window-body', transcriptWindow);
  const transcriptRows = [];
  const transcriptSentenceEls = [];

  function appendSemanticText(container, sentence) {
    const ranges = sentence.highlightRanges || [];
    const pointClass = sentence.task
      ? `curation-transcript-inline-task curation-transcript-inline-task-${sentence.task}`
      : 'curation-transcript-inline-listening';
    const ordered = ranges.map(range => ({...range, className: pointClass}))
      .sort((a, b) => a.start - b.start || b.end - a.end);
    let cursor = 0;
    for (const range of ordered) {
      if (range.start < cursor) continue;
      if (range.start > cursor) {
        container.append(make('span', 'curation-transcript-inline-noise', sentence.text.slice(cursor, range.start)));
      }
      container.append(make('span', range.className, sentence.text.slice(range.start, range.end)));
      cursor = range.end;
    }
    if (cursor < sentence.text.length) {
      container.append(make('span', 'curation-transcript-inline-noise', sentence.text.slice(cursor)));
    }
  }

  for (const turn of data.transcript) {
    const row = make('article', `curation-transcript-turn curation-transcript-${turn.kind}`);
    row.dataset.transcriptIndex = String(turn.index);
    if (turn.task) row.dataset.task = turn.task;
    const speaker = make('strong', 'curation-transcript-speaker', turn.speaker);
    const copy = make('div', 'curation-transcript-copy');
    const sentences = data.transcriptSentences.filter(sentence => sentence.sourceTurnIndex === turn.index);
    for (const sentence of sentences) {
      const sentenceEl = make('span', `curation-transcript-sentence curation-transcript-sentence-${sentence.kind}`);
      sentenceEl.dataset.sentenceIndex = String(sentence.index);
      sentenceEl.dataset.sourceTurnIndex = String(turn.index);
      const original = make('span', 'curation-transcript-original');
      appendSemanticText(original, sentence);
      const translation = make('span', 'curation-transcript-translation', sentence.translation);
      translation.lang = 'zh-Hant';
      sentenceEl.append(original, translation);
      copy.append(sentenceEl);
      transcriptSentenceEls[sentence.index] = sentenceEl;
    }
    const time = make('time', '', `${formatTime(turn.start)}–${formatTime(turn.end)}`);
    row.append(speaker, time, copy);
    transcriptBody.append(row);
    transcriptRows.push(row);
  }
  for (const corner of ['nw','ne','sw','se']) {
    const handle = make('span', `curation-resize-handle curation-resize-${corner}`);
    handle.dataset.resize = corner;
    handle.setAttribute('role', 'separator');
    handle.setAttribute('aria-label', `調整錄音稿大小 · ${corner}`);
    transcriptWindow.append(handle);
  }

  const bank = make('aside', 'curation-stage3-bank');
  bank.id = 'curation-stage3-bank';
  bank.hidden = true;
  bank.setAttribute('aria-label', 'Stage 3 錄音證據庫');
  bank.innerHTML = `
    <header><h2>錄音證據庫</h2><p>只收已聽到且可用於寫作的內容；路線與講座仍留在筆記表。</p></header>
    <details data-task="A" open><summary><span>Task A · 回覆電郵</span><strong data-count>0 點</strong></summary><ol></ol></details>
    <details data-task="B" open><summary><span>Task B · 網站介紹</span><strong data-count>0 點</strong></summary><ol></ol></details>
    <details data-task="C"><summary><span>Task C · 報告主體</span><strong data-count>0 點</strong></summary><ol></ol></details>
    <section class="curation-listening-only-summary"><h3>完整聆聽筆記</h3><p><strong data-count>0</strong> 個 listening-only 停頓點已完成，不進寫作證據庫。</p></section>`;
  document.body.append(player, transcriptWindow, bank);

  function formatTime(value) {
    const whole = Math.max(0, Math.floor(Number.isFinite(value) ? value : 0));
    return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
  }

  const current = () => byId.get(state.currentId) || steps[0];
  const isCurationOpen = () => $('#curation-toggle')?.getAttribute('aria-pressed') === 'true';
  const isVisible = () => state.active && isCurationOpen();
  let activeBoundaryCueId = null;
  let pointerOperation = null;

  function nextBoundary(after = audio.currentTime) {
    return data.cues.find(cue => cue.endpoint > after + 0.04) || null;
  }

  function armNextBoundary(after = audio.currentTime) {
    activeBoundaryCueId = nextBoundary(after)?.id || null;
    return activeBoundaryCueId;
  }

  function syncPlayer() {
    const duration = Number.isFinite(audio.duration) ? audio.duration : data.audio.duration;
    const time = Number.isFinite(audio.currentTime) ? audio.currentTime : state.audioTime;
    $('.curation-player-play', player).textContent = audio.paused ? '▶' : '❚❚';
    $('.curation-player-play', player).setAttribute('aria-label', audio.paused ? '播放錄音' : '暫停錄音');
    $('.curation-player-seek', player).max = String(duration);
    $('.curation-player-seek', player).value = String(Math.min(time, duration));
    $('.curation-player-time', player).textContent = `${formatTime(time)} / ${formatTime(duration)}`;
    $$('.curation-player-pin', player).forEach(pin => pin.classList.toggle('is-heard', state.heardCueIds.includes(pin.dataset.cueId)));
    pins.hidden = !state.pinsShown;
    const pinToggle = $('.curation-player-pins-toggle', player);
    pinToggle.setAttribute('aria-pressed', String(state.pinsShown));
    pinToggle.textContent = state.pinsShown ? '隱藏停頓點' : '顯示停頓點';
  }

  function renderTranscript(focus = false) {
    const step = current();
    const reviewStart = steps.find(item => item.kind === 'review')?.index ?? Infinity;
    const inReview = step.index >= reviewStart;
    const reviewIndex = step.kind === 'review'
      ? step.sentenceIndex
      : (inReview ? data.transcriptSentences.length - 1 : -1);
    const time = Number.isFinite(audio.currentTime) ? audio.currentTime : state.audioTime;
    const audioCurrentIndex = data.transcriptSentences.findIndex(sentence =>
      time >= sentence.start - 0.04 && time < sentence.end - 0.04);
    transcriptSentenceEls.forEach((sentenceEl, index) => {
      const sentence = data.transcriptSentences[index];
      sentenceEl.classList.toggle('is-audio-reached', sentence.end <= time + 0.12);
      sentenceEl.classList.toggle('is-reviewed', inReview && index <= reviewIndex);
      sentenceEl.classList.toggle('is-current', step.kind === 'review' ? index === reviewIndex : index === audioCurrentIndex);
    });
    transcriptWindow.classList.toggle('show-translation', state.transcriptTranslation);
    const translate = $('.curation-transcript-translate', transcriptWindow);
    translate.setAttribute('aria-pressed', String(state.transcriptTranslation));
    translate.textContent = state.transcriptTranslation ? '隱藏中文' : '中文對照';
    if (focus && step.kind === 'review') {
      const sentenceEl = transcriptSentenceEls[step.sentenceIndex];
      if (sentenceEl) sentenceEl.scrollIntoView({block: 'center', behavior: 'auto'});
    }
  }

  function renderBank() {
    for (const task of ['A','B','C']) {
      const group = $(`#curation-stage3-bank [data-task="${task}"]`);
      const list = $('ol', group);
      const visible = data.cues.filter(cue => cue.task === task && state.heardCueIds.includes(cue.id));
      list.replaceChildren(...visible.map(cue => {
        const item = make('li');
        const button = make('button', '', cue.note);
        button.type = 'button';
        button.addEventListener('click', () => setCurrent(cueStepById.get(cue.id).index, true));
        item.append(button, make('small', '', `${fieldById.get(cue.field)?.title} · ${formatTime(cue.endpoint)}`));
        return item;
      }));
      $('[data-count]', group).textContent = `${visible.length} 點`;
    }
    const listeningCount = data.cues.filter(cue => cue.use === 'listening' && state.heardCueIds.includes(cue.id)).length;
    $('.curation-listening-only-summary [data-count]', bank).textContent = String(listeningCount);
  }

  function rebuildSelects(step) {
    $('#curation-step-jump').replaceChildren(...steps.map(item => {
      const option = make('option', '', `${item.index + 1}. ${item.title}`);
      option.value = item.id;
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
    const stage1 = $('.curation-stage-item[data-stage="instruction"]');
    const stage2 = $('.curation-stage-item[data-stage="categorize"]');
    const stage3 = $('.curation-stage-item[data-stage="podcast"]');
    for (const item of $$('.curation-stage-item')) {
      item.classList.remove('active');
      item.setAttribute('aria-current', 'false');
    }
    stage1.classList.toggle('complete', part1.getState().stageComplete === true);
    $('.curation-stage-dot', stage1).textContent = part1.getState().stageComplete ? '✓' : '1';
    stage2.classList.toggle('complete', part2?.getState().complete === true);
    $('.curation-stage-dot', stage2).textContent = part2?.getState().complete ? '✓' : '2';
    stage3.disabled = false;
    stage3.classList.add('active');
    stage3.classList.toggle('complete', state.complete);
    stage3.setAttribute('aria-current', 'step');
    $('.curation-stage-dot', stage3).textContent = state.complete ? '✓' : '3';
    $('.curation-stage-count', stage3).textContent = `${state.completedIds.length}/${steps.length}`;
    const stage4 = $('.curation-stage-item[data-stage="data"]');
    const stage4Debug = window.EDMUND_2016_B2_CURATION_STAGE4_DEBUG;
    stage4.disabled = !stage4Debug;
    $('.curation-stage-count', stage4).textContent = stage4Debug ? `${stage4Debug.getState().completedIds.length}/${stage4Debug.records.length}` : '載入中';
    const stage5 = $('.curation-stage-item[data-stage="writing"]');
    stage5.disabled = true;
    $('.curation-stage-count', stage5).textContent = '未開放';
  }

  function renderActions(step) {
    stage3Panel.replaceChildren();
    if (step.kind === 'controls') {
      const full = make('button', 'curation-stage3-small', '▶ 完整由 0:00 播放');
      full.type = 'button';
      full.addEventListener('click', () => playFrom(0));
      const interview = make('button', 'curation-stage3-small', '▶ 由正式訪問 6:33 播放');
      interview.type = 'button';
      interview.addEventListener('click', () => playFrom(393.91));
      stage3Panel.append(full, interview);
    } else if (step.kind === 'cue') {
      const cue = cuesById.get(step.cueId);
      const replay = make('button', 'curation-stage3-small', `↻ 重聽至 ${formatTime(cue.endpoint)}`);
      replay.type = 'button';
      replay.addEventListener('click', () => playCue(cue, true));
      stage3Panel.append(replay);
    } else if (step.kind === 'review') {
      const sentence = data.transcriptSentences[step.sentenceIndex];
      const play = make('button', 'curation-stage3-small', `▶ 播放這句 ${formatTime(sentence.start)}`);
      play.type = 'button';
      play.addEventListener('click', () => {
        audio.currentTime = sentence.start;
        activeBoundaryCueId = null;
        audio.play().catch(showAudioError);
      });
      stage3Panel.append(play);
    }
  }

  function typeLabel(step) {
    if (step.kind === 'cue') {
      const cue = cuesById.get(step.cueId);
      return cue.task ? `Task ${cue.task} · 錄音答案` : cue.use === 'closure' ? '錄音完結' : '完整聆聽筆記 · 不進寫作';
    }
    if (step.kind === 'review') {
      if (step.task) return `Task ${step.task} · 可用錄音內容`;
      if (step.reviewKind === 'noise') return 'Type 6 · 不取材';
      if (step.reviewKind === 'listening') return '完整聆聽筆記 · 不進寫作';
      if (step.reviewKind === 'mixed') return '混合內容 · 只取精確片段';
      return 'Type 5 · 提示／語境';
    }
    if (step.kind === 'verification') return 'Stage 3 · 最後核對';
    if (step.kind === 'complete') return 'Stage 3 · 完成';
    return 'Stage 3 · 聆聽準備';
  }

  function targetFor(step) {
    if (step.kind === 'cue') {
      const cue = cuesById.get(step.cueId);
      return cue.field ? fieldRefs.get(cue.field)?.textarea : $('#page-3 .conference-notes h2');
    }
    if (step.kind === 'review') return transcriptSentenceEls[step.sentenceIndex];
    return $('#page-3 .conference-notes h2');
  }

  function render(focus = false) {
    if (!isVisible()) return;
    const step = current();
    document.body.classList.add('curation-stage3-active', 'curation-podcast-active');
    stage3Panel.hidden = false;
    player.hidden = false;
    transcriptWindow.hidden = false;
    bank.hidden = false;
    $('.curation-dock > header span').textContent = '2016 B2 · SUPER CURATION · STAGE 3';
    $('#curation-step-id').textContent = `STEP ID · ${step.id}`;
    $('#curation-step-count').textContent = `步驟 ${step.index + 1} / ${steps.length} · 完成 ${state.completedIds.length} / ${steps.length}`;
    $('#curation-progress').max = steps.length;
    $('#curation-progress').value = state.completedIds.length;
    $('#curation-progress').setAttribute('aria-label', 'Stage 3 完成進度');
    $('#curation-source').textContent = step.sourcePage;
    $('#curation-title').textContent = step.title;
    $('#curation-quote').textContent = step.quote;
    $('#curation-translation').textContent = step.translation;
    $('#curation-type').textContent = typeLabel(step);
    $('#curation-explanation').textContent = step.explanation;
    $('#curation-points').hidden = true;
    $('#curation-prev').disabled = step.index === 0;
    const cuePending = step.kind === 'cue' && (!state.heardCueIds.includes(step.cueId) || typingCueId === step.cueId);
    $('#curation-next').disabled = cuePending || (state.complete && step.kind === 'complete');
    $('#curation-next').textContent = state.complete && step.kind === 'complete' ? 'Stage 3 已完成 ✓' : step.kind === 'complete' ? '完成 Stage 3 ✓' : '下一步 →';
    $('#curation-bookmark').textContent = state.bookmarks.includes(step.id) ? '★' : '☆';
    $('#curation-bookmark').setAttribute('aria-pressed', String(state.bookmarks.includes(step.id)));
    $('#curation-bookmark-count').textContent = state.bookmarks.length ? `${state.bookmarks.length} 個書籤` : '尚無書籤';
    $('#curation-spotlight').checked = false;
    rebuildSelects(step);
    renderRail();
    renderActions(step);
    syncNotes();
    syncPlayer();
    renderTranscript(focus);
    renderBank();
    persist(state.complete ? 'Stage 3 已完成；Stage 4–5 保持未開放。' : undefined);
    if (focus && step.kind !== 'review') targetFor(step)?.scrollIntoView({block: 'center', inline: 'nearest', behavior: 'auto'});
  }

  function rewindToStep(step) {
    state.completedIds = state.completedIds.filter(id => byId.get(id)?.index <= step.index);
    state.complete = false;
    if (step.index < steps.find(item => item.kind === 'review').index) {
      const cueStep = step.kind === 'cue' ? step : null;
      const keepThrough = cueStep ? data.cues.findIndex(cue => cue.id === cueStep.cueId) : -1;
      const kept = data.cues.slice(0, keepThrough + 1).map(cue => cue.id);
      state.heardCueIds = state.heardCueIds.filter(id => kept.includes(id));
      audio.pause();
      const cutoff = keepThrough >= 0 ? data.cues[keepThrough].endpoint : 0;
      if (audio.readyState >= 1) audio.currentTime = cutoff;
      state.audioTime = cutoff;
      activeBoundaryCueId = nextBoundary(cutoff)?.id || null;
      cancelTyping();
    }
  }

  function setCurrent(index, focus = true, rewind = false) {
    const target = steps[Math.max(0, Math.min(steps.length - 1, index))];
    if (rewind && target.index < current().index) rewindToStep(target);
    state.currentId = target.id;
    render(focus);
  }

  function cancelTyping() {
    if (typingTimer) clearInterval(typingTimer);
    typingTimer = null;
    if (typingCueId) {
      const cue = cuesById.get(typingCueId);
      fieldRefs.get(cue?.field)?.textarea.classList.remove('curation-note-writing');
    }
    typingCueId = null;
  }

  function writeCueNote(cue) {
    if (!cue.field || !cue.note || state.customizedCueIds.includes(cue.id)) return Promise.resolve();
    const ref = fieldRefs.get(cue.field);
    if (!ref) return Promise.reject(new Error(`Missing authentic note field ${cue.field}`));
    if (ref.textarea.value.split('\n').some(line => noteMatches(line, cue.note))) {
      typingCueId = null;
      ref.textarea.classList.remove('curation-note-writing');
      return Promise.resolve();
    }
    const prefix = ref.textarea.value.trimEnd();
    const startValue = prefix ? `${prefix}\n` : '';
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      ref.textarea.value = startValue + cue.note;
      ref.textarea.dispatchEvent(new Event('input', {bubbles: true}));
      typingCueId = null;
      return Promise.resolve();
    }
    return new Promise(resolve => {
      if (typingTimer) clearInterval(typingTimer);
      typingTimer = null;
      typingCueId = cue.id;
      ref.textarea.classList.add('curation-note-writing');
      let count = 0;
      typingTimer = setInterval(() => {
        count = Math.min(cue.note.length, count + 5);
        ref.textarea.value = startValue + cue.note.slice(0, count);
        ref.textarea.dispatchEvent(new Event('input', {bubbles: true}));
        ref.textarea.scrollTop = ref.textarea.scrollHeight;
        if (count >= cue.note.length) {
          clearInterval(typingTimer);
          typingTimer = null;
          typingCueId = null;
          ref.textarea.classList.remove('curation-note-writing');
          resolve();
        }
      }, 24);
    });
  }

  async function commitCue(cue) {
    audio.pause();
    if (audio.readyState >= 1) audio.currentTime = cue.endpoint;
    state.audioTime = cue.endpoint;
    if (!state.heardCueIds.includes(cue.id)) state.heardCueIds.push(cue.id);
    const step = cueStepById.get(cue.id);
    state.currentId = step.id;
    activeBoundaryCueId = null;
    if (cue.note && !state.customizedCueIds.includes(cue.id)) typingCueId = cue.id;
    const record = {
      cueId: cue.id,
      index: data.cues.findIndex(item => item.id === cue.id),
      audioTime: cue.endpoint,
      endpoint: cue.endpoint,
      destination: cue.field,
      text: cue.note,
      architectureVersion: data.architectureVersion,
      releaseSha: document.documentElement.dataset.releaseSha || null
    };
    transactionLog.push(record);
    window.dispatchEvent(new CustomEvent('edmund:2016-stage3-cue', {detail: record}));
    render(false);
    try {
      await writeCueNote(cue);
      syncNotes();
      persist(`錄音停在 ${formatTime(cue.endpoint)}；筆記已寫入原生欄目。`);
    } catch (error) {
      console.error(error);
      $('.curation-player-status', player).textContent = `找不到筆記欄 ${cue.field || ''}；未寫入其他欄目。`;
    }
    render(false);
  }

  function playFrom(time) {
    if (audio.readyState >= 1) audio.currentTime = time;
    else audio.addEventListener('loadedmetadata', () => { audio.currentTime = time; }, {once: true});
    activeBoundaryCueId = nextBoundary(time)?.id || null;
    audio.play().catch(showAudioError);
  }

  function playCue(cue, replay = false) {
    cancelTyping();
    const start = replay ? cue.start : Math.max(cue.start, Math.min(audio.currentTime || cue.start, cue.endpoint - 0.05));
    if (audio.readyState >= 1) audio.currentTime = start;
    else audio.addEventListener('loadedmetadata', () => { audio.currentTime = start; }, {once: true});
    activeBoundaryCueId = cue.id;
    state.currentId = cueStepById.get(cue.id).id;
    render(false);
    audio.play().catch(showAudioError);
  }

  function showAudioError() {
    $('.curation-player-status', player).textContent = '錄音未能播放；可重試，逐字稿仍可檢查，但不會把停頓點標成已聽。';
  }

  function deliberateSeek(time) {
    cancelTyping();
    audio.pause();
    audio.currentTime = Math.max(0, Math.min(data.audio.duration, time));
    state.audioTime = audio.currentTime;
    state.heardCueIds = data.cues.filter(cue => cue.endpoint <= audio.currentTime + 0.12).map(cue => cue.id);
    activeBoundaryCueId = nextBoundary(audio.currentTime)?.id || null;
    persist('已按新播放位置重建停頓點、生成筆記與逐字稿標記。');
    render(false);
  }

  audio.addEventListener('loadedmetadata', () => {
    audio.currentTime = Math.min(state.audioTime, audio.duration || data.audio.duration);
    audio.playbackRate = state.playbackRate;
    syncPlayer();
  });
  audio.addEventListener('timeupdate', () => {
    state.audioTime = audio.currentTime;
    const cue = activeBoundaryCueId ? cuesById.get(activeBoundaryCueId) : null;
    if (cue && audio.currentTime >= cue.endpoint - 0.06) {
      activeBoundaryCueId = null;
      void commitCue(cue);
      return;
    }
    syncPlayer();
    renderTranscript(false);
  });
  audio.addEventListener('play', () => {
    if (!activeBoundaryCueId) armNextBoundary(audio.currentTime);
    $('.curation-player-status', player).textContent = '';
    syncPlayer();
  });
  audio.addEventListener('pause', () => {
    state.audioTime = audio.currentTime;
    syncPlayer();
    persist();
  });
  audio.addEventListener('error', showAudioError);
  audio.addEventListener('ended', () => {
    const endCue = data.cues.at(-1);
    if (!state.heardCueIds.includes(endCue.id)) void commitCue(endCue);
  });
  $('.curation-player-play', player).addEventListener('click', () => {
    if (audio.paused) {
      if (!activeBoundaryCueId) armNextBoundary(audio.currentTime);
      audio.play().catch(showAudioError);
    } else audio.pause();
  });
  $('.curation-player-pins-toggle', player).addEventListener('click', () => {
    state.pinsShown = !state.pinsShown;
    syncPlayer();
    persist();
  });
  $('.curation-player-seek', player).addEventListener('input', event => {
    $('.curation-player-time', player).textContent = `${formatTime(Number(event.target.value))} / ${formatTime(Number(event.target.max))}`;
  });
  $('.curation-player-seek', player).addEventListener('change', event => deliberateSeek(Number(event.target.value)));
  speed.addEventListener('change', () => {
    state.playbackRate = Number(speed.value);
    audio.playbackRate = state.playbackRate;
    persist();
  });
  $('.curation-transcript-translate', transcriptWindow).addEventListener('click', () => {
    state.transcriptTranslation = !state.transcriptTranslation;
    renderTranscript(false);
    persist();
  });

  function fitTranscriptWindow() {
    if (transcriptWindow.hidden) return;
    if (innerWidth <= 700) {
      transcriptWindow.removeAttribute('data-moved');
      for (const property of ['left','top','right','width','height']) transcriptWindow.style.removeProperty(property);
      return;
    }
    if (!transcriptWindow.dataset.moved) return;
    const rect = transcriptWindow.getBoundingClientRect();
    transcriptWindow.style.left = `${Math.max(4, Math.min(rect.left, innerWidth - rect.width - 4))}px`;
    transcriptWindow.style.top = `${Math.max(4, Math.min(rect.top, innerHeight - rect.height - 4))}px`;
  }
  transcriptWindow.addEventListener('pointerdown', event => {
    const corner = event.target.dataset.resize;
    const head = event.target.closest('.curation-transcript-window-head');
    if ((!corner && !head) || event.target.closest('button,input,select')) return;
    event.preventDefault();
    const rect = transcriptWindow.getBoundingClientRect();
    pointerOperation = {corner, move: !!head, x: event.clientX, y: event.clientY, left: rect.left, top: rect.top, width: rect.width, height: rect.height};
    transcriptWindow.dataset.moved = '1';
    transcriptWindow.setPointerCapture(event.pointerId);
  });
  transcriptWindow.addEventListener('pointermove', event => {
    if (!pointerOperation) return;
    const operation = pointerOperation;
    const dx = event.clientX - operation.x;
    const dy = event.clientY - operation.y;
    let {left, top, width, height} = operation;
    if (operation.move) {
      left += dx;
      top += dy;
    } else {
      if (operation.corner.includes('w')) { left += dx; width -= dx; } else width += dx;
      if (operation.corner.includes('n')) { top += dy; height -= dy; } else height += dy;
      if (width < 300) { if (operation.corner.includes('w')) left -= 300 - width; width = 300; }
      if (height < 180) { if (operation.corner.includes('n')) top -= 180 - height; height = 180; }
    }
    width = Math.min(width, innerWidth - 8);
    height = Math.min(height, innerHeight - 8);
    left = Math.max(4, Math.min(left, innerWidth - width - 4));
    top = Math.max(4, Math.min(top, innerHeight - height - 4));
    Object.assign(transcriptWindow.style, {left: `${left}px`, top: `${top}px`, width: `${width}px`, height: `${height}px`, right: 'auto'});
  });
  transcriptWindow.addEventListener('pointerup', () => { pointerOperation = null; });
  transcriptWindow.addEventListener('lostpointercapture', () => { pointerOperation = null; });

  function suspendVisuals() {
    cancelTyping();
    audio.pause();
    document.body.classList.remove('curation-stage3-active', 'curation-podcast-active');
    stage3Panel.hidden = true;
    player.hidden = true;
    transcriptWindow.hidden = true;
    bank.hidden = true;
  }

  function enter() {
    if (part2?.getState().active) part2.leave();
    part1.setSpotlight(false);
    state.active = true;
    persist('已進入 Stage 3；Stage 1/2 進度保持不變。');
    render(true);
  }

  function leave({switchStage = true} = {}) {
    if (switchStage) state.active = false;
    suspendVisuals();
    persist('Stage 3 離開位置已儲存。');
  }

  const stopWhenActive = event => {
    if (!state.active) return false;
    event.preventDefault();
    event.stopImmediatePropagation();
    return true;
  };

  $('#curation-next').addEventListener('click', event => {
    if (!stopWhenActive(event)) return;
    const step = current();
    if (step.kind === 'cue' && (!state.heardCueIds.includes(step.cueId) || typingCueId === step.cueId)) return;
    if (!state.completedIds.includes(step.id)) state.completedIds.push(step.id);
    if (step.kind === 'complete') {
      state.complete = true;
      render(false);
      return;
    }
    const next = steps[Math.min(steps.length - 1, step.index + 1)];
    state.currentId = next.id;
    render(next.kind === 'review');
    if (next.kind === 'cue' && !state.heardCueIds.includes(next.cueId)) playCue(cuesById.get(next.cueId));
  }, true);
  $('#curation-prev').addEventListener('click', event => {
    if (!stopWhenActive(event)) return;
    setCurrent(current().index - 1, true, true);
  }, true);
  $('#curation-step-jump').addEventListener('change', event => {
    if (!stopWhenActive(event)) return;
    const step = byId.get(event.target.value);
    if (step) setCurrent(step.index, true, true);
  }, true);
  $('#curation-bookmark-jump').addEventListener('change', event => {
    if (!stopWhenActive(event)) return;
    const step = byId.get(event.target.value);
    if (step) setCurrent(step.index, true, true);
  }, true);
  $('#curation-bookmark').addEventListener('click', event => {
    if (!stopWhenActive(event)) return;
    const id = current().id;
    state.bookmarks = state.bookmarks.includes(id) ? state.bookmarks.filter(item => item !== id) : [...state.bookmarks, id];
    render(false);
  }, true);
  $('#curation-spotlight').addEventListener('change', event => {
    if (!stopWhenActive(event)) return;
    event.target.checked = false;
    $('#curation-save-status').textContent = 'Stage 3 的播放器與逐字稿不使用聚光燈遮罩。';
  }, true);
  $('#curation-help').addEventListener('click', event => {
    if (!stopWhenActive(event)) return;
    const step = current();
    $('#curation-help-context').textContent = `${step.sourcePage} · ${step.title} · STEP ID ${step.id}`;
    $('#curation-help-guidance').textContent = step.explanation;
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

  $('.curation-stage-item[data-stage="podcast"]').addEventListener('click', event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    enter();
  }, true);
  $('.curation-stage-item[data-stage="instruction"]').addEventListener('click', event => {
    if (!state.active) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    leave({switchStage: true});
    part1.goById(part1.getState().stepId);
  }, true);
  document.addEventListener('keydown', event => {
    if (!state.active || !isCurationOpen() || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName) || $('.curation-help-dialog').open) return;
    if (!['ArrowLeft','ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (event.key === 'ArrowLeft') setCurrent(current().index - 1, true, true);
    else if (!$('#curation-next').disabled) $('#curation-next').click();
  }, true);
  window.addEventListener('resize', fitTranscriptWindow);
  window.addEventListener('pagehide', () => {
    state.audioTime = audio.currentTime;
    persist();
  });
  $('#curation-close').addEventListener('click', () => {
    if (!state.active) return;
    queueMicrotask(() => leave({switchStage: false}));
  }, true);
  $('#curation-toggle').addEventListener('click', () => {
    queueMicrotask(() => {
      if (!state.active) return;
      if (isCurationOpen()) enter();
      else leave({switchStage: false});
    });
  });

  window.EDMUND_2016_B2_CURATION_STAGE3_DEBUG = Object.freeze({
    version: data.version,
    architectureVersion: data.architectureVersion,
    storageKey: data.storageKey,
    steps: steps.map(step => ({...step})),
    fields: data.fields,
    cues: data.cues,
    transcript: data.transcript,
    transcriptSentences: data.transcriptSentences,
    transactionLog,
    getState: () => ({...state, position: current().index, stepId: current().id, typingCueId, activeBoundaryCueId, audioTime: audio.currentTime}),
    enter,
    leave: () => leave({switchStage: true}),
    next: () => $('#curation-next').click(),
    prev: () => $('#curation-prev').click(),
    goById: id => { const step = byId.get(id); if (step) setCurrent(step.index, true, true); },
    playCue: id => { const cue = cuesById.get(id); if (cue) playCue(cue, true); },
    seek: deliberateSeek,
    commitCue: id => { const cue = cuesById.get(id); return cue ? commitCue(cue) : Promise.reject(new Error('Unknown cue')); },
    reset: () => {
      cancelTyping();
      state = blankState();
      state.active = true;
      for (const field of data.fields) state.authoredNotes[field.id] = '';
      audio.pause();
      audio.currentTime = 0;
      render(true);
    },
    audio
  });

  const stage3 = $('.curation-stage-item[data-stage="podcast"]');
  stage3.disabled = false;
  $('.curation-stage-count', stage3).textContent = `${state.completedIds.length}/${steps.length}`;
  window.podcastArchitectureVersion2016 = data.architectureVersion;
  if (state.active && isCurationOpen()) enter();
})();
