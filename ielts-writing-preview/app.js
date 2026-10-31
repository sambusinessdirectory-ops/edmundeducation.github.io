(() => {
  'use strict';

  const TYPES = [
    'Opinions',
    'Discuss both views + Opinions',
    'Advantages & Disadvantages',
    'Cause & Solution',
    'Direct question'
  ];
  const LEGACY_STORAGE_KEY = 'edmund-ielts-writing-preview-types-v1';
  const STUDENT_STORAGE_PREFIX = 'edmund-ielts-writing-preview-types-v2:';
  const TASK1_TENSES = ['Past Tense', 'Present Tense', 'Future Tense', 'Present Perfect Tense', 'Past Perfect Tense'];
  const TASK1_STATES = ['動態 (Dynamic)', '靜態 (Static)'];
  const ADMIN_SESSION_KEY = 'edmund-ielts-preview-admin-v1';
  const DEVICE_KEY = 'edmund-ielts-preview-device-v1';
  const SPEED_KEY = 'edmund-ielts-preview-speed-v1';
  const SIZE_KEY = 'edmund-ielts-preview-size-v1';
  const imageUrl = (path) => /^https?:\/\//i.test(path) ? path : `/${path.replace(/^\//, '')}`;
  const $ = (id) => document.getElementById(id);
  const node = (name, className, text) => {
    const element = document.createElement(name);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };
  const quizPrompt = (item) => item.quizPrompt || item.prompt;
  function promptLines(text) {
    const sentences = text.split(/(?<=[.!?])\s+(?=[A-Z])/u);
    let firstTask = sentences.length;
    while (firstTask > 0 && (sentences[firstTask - 1].endsWith('?') || /^Discuss\b/i.test(sentences[firstTask - 1]))) firstTask--;
    if (firstTask === sentences.length) return [text];
    return [...(firstTask ? [sentences.slice(0, firstTask).join(' ')] : []), ...sentences.slice(firstTask)];
  }

  const readStoredObject = (storage, key) => {
    try {
      const value = JSON.parse(storage.getItem(key) || 'null');
      return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    } catch { return {}; }
  };
  const safeStorage = (kind) => {
    try { return window[kind]; } catch { return null; }
  };
  function storageKey() {
    const universal = readStoredObject(safeStorage('sessionStorage'), 'edmund-universal-student-session-v1');
    const writing = readStoredObject(safeStorage('localStorage'), 'edmundWritingSession');
    const student = universal.role === 'student' ? universal : writing.role === 'student' ? writing : null;
    const identity = String(student?.id || student?.name || '').trim().toLocaleLowerCase();
    return identity ? `${STUDENT_STORAGE_PREFIX}${encodeURIComponent(identity)}` : LEGACY_STORAGE_KEY;
  }
  function readSavedTypes(key) {
    const storage = safeStorage('localStorage');
    const values = readStoredObject(storage, key);
    if (key === LEGACY_STORAGE_KEY || Object.keys(values).length) return values;
    const legacy = readStoredObject(storage, LEGACY_STORAGE_KEY);
    if (!Object.keys(legacy).length) return values;
    try {
      storage.setItem(key, JSON.stringify(legacy));
      storage.removeItem(LEGACY_STORAGE_KEY);
    } catch { /* Keep the choices in memory if storage is unavailable. */ }
    return legacy;
  }
  let activeStorageKey = storageKey();
  let savedTypes = readSavedTypes(activeStorageKey);
  let savedTask1 = readStoredObject(safeStorage('localStorage'), `${activeStorageKey}:task1`);
  let task1 = [];
  let task2 = [];
  let audioManifest = {};
  const questionAudio = new Audio();
  let playingButton = null;
  let translationsShown = false;
  let task2Topic = '';
  let activeMenuTrigger = null;
  const menu = $('choice-menu');
  let accessVerified = false;
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const sessionStore = safeStorage('sessionStorage');
  let deviceId = sessionStore?.getItem(DEVICE_KEY);
  if (!uuidPattern.test(deviceId || '')) {
    deviceId = crypto.randomUUID();
    try { sessionStore?.setItem(DEVICE_KEY, deviceId); } catch { /* Ephemeral device. */ }
  }
  let adminSession = readStoredObject(sessionStore, ADMIN_SESSION_KEY);
  let adminSlots = [''];
  let onlineStudents = [];
  let adminAnswers = {};
  let adminBusy = false;
  let studentOwner = '';
  let studentReady = Promise.resolve();
  let studentBusy = false;
  const pendingChoices = new Map();

  function studentSession() {
    const candidate = window.EdmundSystemNav?.getStudentSession?.()
      || readStoredObject(sessionStore, 'edmund-universal-student-session-v1');
    return candidate?.role === 'student' && uuidPattern.test(candidate.token || '') ? candidate : null;
  }

  async function rpc(name, payload) {
    const config = window.EDMUND_SUPABASE;
    if (!config?.url || !config?.anonKey) throw new Error('資料服務暫時無法使用');
    const response = await fetch(`${config.url}/rest/v1/rpc/${name}`, {
      method: 'POST', cache: 'no-store', credentials: 'omit',
      headers: { apikey: config.anonKey, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload), signal: AbortSignal.timeout(12000)
    });
    if (!response.ok) {
      const detail = await response.json().catch(() => ({}));
      const error = new Error(`資料服務回應 ${response.status}`);
      error.status = response.status;
      error.code = detail.code;
      throw error;
    }
    return response.json();
  }

  function refreshAccountUI() {
    const student = studentSession();
    $('account-label').textContent = accessVerified ? (adminSession.token ? `管理員 · ${adminSession.name}` : student ? `學生 · ${student.name}` : '') : '';
    $('logout-button').hidden = !accessVerified;
    $('login-open').textContent = accessVerified ? '切換帳戶' : '登入';
    $('panel-task2').classList.toggle('is-admin', Boolean(adminSession.token));
  }

  function applyAccessGate(verified) {
    accessVerified = Boolean(verified);
    $('learning-content').hidden = !accessVerified;
    $('login-gate').hidden = accessVerified;
    const form = $('login-form');
    const host = accessVerified ? $('login-dialog') : $('gate-form-host');
    if (form.parentElement !== host) host.append(form);
    refreshAccountUI();
  }

  function syncStudentOwner() {
    if (adminSession.token) return;
    const student = studentSession();
    const next = student ? `${student.id || student.name}:${student.token}` : '';
    if (next === studentOwner) return;
    studentOwner = next;
    pendingChoices.clear();
    refreshStorageOwner();
    refreshAccountUI();
    if (!student) return;
    const initial = { ...savedTypes };
    studentReady = rpc('ielts_preview_student_sync', {
      p_token: student.token, p_device: deviceId, p_initial_answers: initial
    }).then((data) => {
      if (studentOwner !== next || adminSession.token) return;
      savedTypes = { ...savedTypes, ...data.answers };
      try { safeStorage('localStorage')?.setItem(activeStorageKey, JSON.stringify(savedTypes)); } catch { /* Keep in memory. */ }
      refreshTask2Buttons();
      updateTask2Count();
      applyAccessGate(true);
      void flushPendingChoices();
    }).catch((error) => {
      if (studentOwner === next) {
        studentOwner = '';
        if (error.status === 401 || error.status === 403 || error.code === '28000') {
          window.EdmundSystemNav?.forgetStudentSession?.();
          sessionStore?.removeItem('edmund-universal-student-session-v1');
          applyAccessGate(false);
        }
      }
      /* Local choices remain available; next visible heartbeat retries. */
    });
  }

  async function flushPendingChoices() {
    if (studentBusy || !pendingChoices.size || adminSession.token) return;
    const student = studentSession();
    if (!student) return;
    studentBusy = true;
    try {
      await studentReady;
      if (adminSession.token || `${student.id || student.name}:${student.token}` !== studentOwner) return;
      for (const [questionId, answer] of [...pendingChoices]) {
        if (adminSession.token || `${student.id || student.name}:${student.token}` !== studentOwner) break;
        await rpc('ielts_preview_student_sync', {
          p_token: student.token, p_device: deviceId, p_question_id: questionId, p_answer: answer
        });
        if (pendingChoices.get(questionId) === answer) pendingChoices.delete(questionId);
      }
    } catch { /* Keep pending choices for retry. */ }
    finally { studentBusy = false; }
  }

  async function studentHeartbeat() {
    if (document.hidden || adminSession.token) return;
    syncStudentOwner();
    const student = studentSession();
    if (!student) return;
    if (pendingChoices.size) { void flushPendingChoices(); return; }
    try { await rpc('ielts_preview_student_sync', { p_token: student.token, p_device: deviceId }); }
    catch { /* The next heartbeat retries without losing local choices. */ }
  }

  function refreshTask2Buttons() {
    for (const button of document.querySelectorAll('#task2-rows .answer-trigger')) {
      setAnswerButton(button, TYPES.includes(savedTypes[button.dataset.questionId]) ? savedTypes[button.dataset.questionId] : '');
    }
  }

  function updateTask2Count() {
    if (!task2.length) return;
    const answers = adminSession.token ? (adminAnswers[adminSlots.find(Boolean)] || {}) : savedTypes;
    const answered = task2.reduce((total, item) => total + Number(TYPES.includes(answers[item.id])), 0);
    $('task2-count').textContent = `${answered} / ${task2.length} 題`;
  }

  function closeMenu(restoreFocus = false) {
    if (!activeMenuTrigger) return;
    const trigger = activeMenuTrigger;
    activeMenuTrigger = null;
    menu.hidden = true;
    menu.classList.remove('is-compact');
    menu.replaceChildren();
    trigger.setAttribute('aria-expanded', 'false');
    if (restoreFocus) trigger.focus();
  }

  function openMenu(trigger, options, selected, choose, multiple = false, compact = false) {
    if (activeMenuTrigger === trigger) { closeMenu(); return; }
    closeMenu();
    menu.replaceChildren();
    let current = selected;
    for (const option of options) {
      const item = node('button', 'choice-menu__option');
      item.type = 'button';
      item.setAttribute('role', multiple ? 'menuitemcheckbox' : 'menuitemradio');
      item.setAttribute('aria-checked', String(multiple ? current.includes(option.value) : option.value === current));
      item.dataset.value = option.value;
      item.append(node('span', 'choice-menu__check', (multiple ? current.includes(option.value) : option.value === current) ? '✓' : ''), node('span', '', option.label));
      item.addEventListener('click', () => {
        if (!multiple) { choose(option.value); closeMenu(true); return; }
        current = choose(option.value);
        for (const button of menu.querySelectorAll('.choice-menu__option')) {
          const checked = current.includes(button.dataset.value);
          button.setAttribute('aria-checked', String(checked));
          button.querySelector('.choice-menu__check').textContent = checked ? '✓' : '';
        }
      });
      menu.append(item);
    }
    activeMenuTrigger = trigger;
    menu.classList.toggle('is-compact', compact);
    trigger.setAttribute('aria-expanded', 'true');
    menu.hidden = false;
    const rect = trigger.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth;
    const width = Math.min(Math.max(rect.width, compact ? 132 : 282), viewportWidth - 24);
    menu.style.width = `${width}px`;
    menu.style.left = `${Math.max(12, Math.min(rect.left, viewportWidth - width - 12))}px`;
    menu.style.maxHeight = `${Math.min(360, Math.max(180, window.innerHeight - 32))}px`;
    const height = menu.getBoundingClientRect().height;
    const below = window.innerHeight - rect.bottom;
    const above = rect.top;
    menu.style.top = `${below < height + 12 && above > below ? Math.max(12, rect.top - height - 8) : Math.min(window.innerHeight - height - 12, rect.bottom + 8)}px`;
    const buttons = [...menu.querySelectorAll('button')];
    (buttons.find((item) => multiple ? current.includes(item.dataset.value) : item.dataset.value === current) || buttons[0])?.focus();
  }

  menu.addEventListener('keydown', (event) => {
    const buttons = [...menu.querySelectorAll('button')];
    const index = buttons.indexOf(document.activeElement);
    let next = index;
    if (event.key === 'ArrowDown') next = (index + 1) % buttons.length;
    else if (event.key === 'ArrowUp') next = (index - 1 + buttons.length) % buttons.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = buttons.length - 1;
    else if (event.key === 'Escape') { event.preventDefault(); closeMenu(true); return; }
    else if (event.key === 'Tab') { closeMenu(); return; }
    else return;
    event.preventDefault();
    buttons[next]?.focus();
  });
  document.addEventListener('pointerdown', (event) => {
    if (activeMenuTrigger && !menu.contains(event.target) && !activeMenuTrigger.contains(event.target)) closeMenu();
  });
  document.addEventListener('scroll', (event) => {
    if (activeMenuTrigger && !menu.contains(event.target)) closeMenu();
  }, true);
  window.addEventListener('resize', () => closeMenu());

  function showTab(tab) {
    closeMenu();
    for (const name of ['task1', 'task2']) {
      const active = name === tab;
      $(`panel-${name}`).hidden = !active;
      $(`tab-${name}`).classList.toggle('is-active', active);
      $(`tab-${name}`).setAttribute('aria-selected', String(active));
    }
    history.replaceState(null, '', tab === 'task2' ? '#task2' : '#task1');
  }

  function setFilterButton(id, label) { $(id).querySelector('span').textContent = label; }

  function setAnswerButton(button, value, placeholder = '選擇題型') {
    button.dataset.value = value;
    button.classList.toggle('is-selected', Boolean(value));
    button.querySelector('.answer-label').textContent = value || placeholder;
  }

  function task1Answer(id) {
    const answer = savedTask1[id];
    return answer && typeof answer === 'object' ? answer : {};
  }
  function saveTask1Answer(id, field, value) {
    savedTask1[id] = { ...task1Answer(id), [field]: value };
    try { safeStorage('localStorage')?.setItem(`${activeStorageKey}:task1`, JSON.stringify(savedTask1)); } catch { /* Keep choices in memory. */ }
  }
  function refreshTask1Buttons() {
    for (const button of document.querySelectorAll('#task1-rows .answer-trigger')) {
      const answer = task1Answer(button.dataset.questionId);
      const field = button.dataset.field;
      const value = field === 'tenses' ? (Array.isArray(answer.tenses) ? answer.tenses.filter((tense) => TASK1_TENSES.includes(tense)) : []).join('、') : answer[field];
      setAnswerButton(button, value || '', button.dataset.placeholder);
    }
  }

  function refreshStorageOwner() {
    const nextKey = storageKey();
    if (nextKey === activeStorageKey) return;
    activeStorageKey = nextKey;
    savedTypes = readSavedTypes(nextKey);
    savedTask1 = readStoredObject(safeStorage('localStorage'), `${nextKey}:task1`);
    for (const button of document.querySelectorAll('#task2-rows .answer-trigger')) {
      setAnswerButton(button, TYPES.includes(savedTypes[button.dataset.questionId]) ? savedTypes[button.dataset.questionId] : '');
    }
    refreshTask1Buttons();
    updateTask2Count();
    closeMenu();
  }

  function audioButton(section, item) {
    const button = node('button', 'question-audio');
    button.type = 'button';
    const clip = audioManifest[`${section}:${item.id}`];
    button.disabled = !clip?.path;
    button.setAttribute('aria-label', `播放 ${item.id} 英文題目`);
    button.setAttribute('aria-pressed', 'false');
    button.append(node('span', 'question-audio__icon'), node('span', 'question-audio__text', '聆聽題目'));
    button.addEventListener('click', () => {
      if (!clip) return;
      if (playingButton === button && !questionAudio.paused) { questionAudio.pause(); return; }
      questionAudio.pause();
      if (playingButton) { playingButton.classList.remove('is-playing'); playingButton.setAttribute('aria-pressed', 'false'); }
      playingButton = button;
      questionAudio.src = imageUrl(clip.path);
      button.classList.add('is-playing');
      button.setAttribute('aria-pressed', 'true');
      button.querySelector('.question-audio__text').textContent = '聆聽題目';
      questionAudio.play().catch(() => {
        button.classList.remove('is-playing');
        button.setAttribute('aria-pressed', 'false');
        button.querySelector('.question-audio__text').textContent = '播放失敗，請重試';
      });
    });
    return button;
  }
  const resetAudioButton = () => {
    if (playingButton && questionAudio.paused) {
      playingButton.classList.remove('is-playing');
      playingButton.setAttribute('aria-pressed', 'false');
    }
  };
  questionAudio.addEventListener('pause', resetAudioButton);
  questionAudio.addEventListener('ended', resetAudioButton);

  function task1Choice(item, field, options, placeholder, multiple = false) {
    const button = node('button', 'answer-trigger');
    button.type = 'button';
    button.dataset.questionId = item.id;
    button.dataset.field = field;
    button.dataset.placeholder = placeholder;
    button.setAttribute('aria-label', `${item.id} ${placeholder}`);
    button.setAttribute('aria-haspopup', 'menu');
    button.setAttribute('aria-expanded', 'false');
    button.append(node('span', 'answer-marker', '●'), node('span', 'answer-label'), node('span', 'menu-chevron'));
    const value = task1Answer(item.id)[field];
    setAnswerButton(button, multiple ? (Array.isArray(value) ? value.join('、') : '') : (value || ''), placeholder);
    button.addEventListener('click', () => {
      refreshStorageOwner();
      const current = task1Answer(item.id)[field];
      openMenu(button, [
        ...(!multiple ? [{ value: '', label: '清除選擇' }] : []),
        ...options.map((option) => ({ value: option, label: option }))
      ], multiple ? (Array.isArray(current) ? current : []) : (current || ''), (chosen) => {
        if (!multiple) {
          saveTask1Answer(item.id, field, chosen);
          setAnswerButton(button, chosen, placeholder);
          return;
        }
        const selected = Array.isArray(task1Answer(item.id)[field]) ? [...task1Answer(item.id)[field]] : [];
        const position = selected.indexOf(chosen);
        if (position >= 0) selected.splice(position, 1);
        else selected.push(chosen);
        const ordered = options.filter((option) => selected.includes(option));
        saveTask1Answer(item.id, field, ordered);
        setAnswerButton(button, ordered.join('、'), placeholder);
        return ordered;
      }, multiple);
    });
    return button;
  }

  function openDiagram(item) {
    $('dialog-type').textContent = `TASK 1 · ${item.id}`;
    $('dialog-title').textContent = quizPrompt(item);
    $('dialog-prompt').textContent = '';
    $('dialog-image').src = imageUrl(item.image);
    $('dialog-image').alt = `${item.id} 題圖`;
    $('diagram-dialog').showModal();
  }

  function renderTask1() {
    const rows = $('task1-rows');
    const fragment = document.createDocumentFragment();
    const graphTypes = [...new Set(task1.map((item) => item.type))];
    const displayOrder = [...task1];
    let seed = 20301030;
    for (let index = displayOrder.length - 1; index > 0; index--) {
      seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
      const swap = seed % (index + 1);
      [displayOrder[index], displayOrder[swap]] = [displayOrder[swap], displayOrder[index]];
    }
    for (const item of displayOrder) {
      const row = node('tr');
      row.dataset.search = `${item.id} ${quizPrompt(item)}`.toLocaleLowerCase();
      const chartCell = node('td', 'chart-cell');
      const heading = node('h3', 'question', quizPrompt(item));
      heading.lang = 'en';
      chartCell.append(node('span', 'row-id', item.id), heading, audioButton('task1', item));
      const button = node('button', 'diagram-button');
      button.type = 'button';
      button.setAttribute('aria-label', `查看 ${item.id} 題圖`);
      const image = node('img');
      image.src = imageUrl(item.image);
      image.alt = '';
      image.loading = 'lazy';
      button.append(image, node('span', '', '放大題圖'));
      button.addEventListener('click', () => openDiagram(item));
      chartCell.append(button);
      const typeCell = node('td', 'task1-answer-cell');
      typeCell.append(task1Choice(item, 'type', graphTypes, '選擇圖表類型'));
      const motionCell = node('td', 'task1-answer-cell');
      motionCell.append(task1Choice(item, 'motion', TASK1_STATES, '選擇動態 / 靜態'));
      const tenseCell = node('td', 'task1-answer-cell');
      tenseCell.append(task1Choice(item, 'tenses', TASK1_TENSES, '選擇適用時態', true));
      row.append(chartCell, typeCell, motionCell, tenseCell);
      fragment.append(row);
    }
    rows.replaceChildren(fragment);
    filterTask1();
  }

  function renderAdminHead() {
    const head = $('task2-head');
    $('panel-task2').style.setProperty('--admin-table-min-width', `${725 + 190 * adminSlots.length}px`);
    for (const extra of head.querySelectorAll('.student-column-head:not(#type-head)')) extra.remove();
    if (!adminSession.token) { $('type-head').classList.remove('student-column-head'); $('type-head').replaceChildren(node('span', 'visually-hidden', '題型選擇')); return; }
    const makeHead = (index) => {
      const th = index === 0 ? $('type-head') : node('th', 'student-column-head');
      th.className = 'student-column-head';
      th.scope = 'col';
      const box = node('div', 'student-head');
      const top = node('div', 'student-head__top');
      top.append(node('span', '', `Student ${index + 1}`));
      const actions = node('span', 'student-head__actions');
      if (index === adminSlots.length - 1 && adminSlots.length < 10) {
        const add = node('button', '', '+'); add.type = 'button'; add.title = '新增學生欄';
        add.setAttribute('aria-label', '新增學生欄');
        add.addEventListener('click', () => { adminSlots.push(''); renderTask2(); });
        actions.append(add);
      }
      if (adminSlots.length > 1) {
        const remove = node('button', '', '−'); remove.type = 'button'; remove.title = `移除 Student ${index + 1}`;
        remove.setAttribute('aria-label', `移除 Student ${index + 1}`);
        remove.addEventListener('click', () => { adminSlots.splice(index, 1); renderTask2(); });
        actions.append(remove);
      }
      top.append(actions);
      const select = node('select'); select.setAttribute('aria-label', `Student ${index + 1} 在線帳戶`);
      select.dataset.slot = String(index);
      fillStudentSelect(select, adminSlots[index]);
      select.addEventListener('change', () => { adminSlots[index] = select.value; renderAdminAnswers(); updateTask2Count(); void refreshAdmin(); });
      box.append(top, select);
      th.replaceChildren(box);
      if (index > 0) head.append(th);
    };
    for (let index = 0; index < adminSlots.length; index++) makeHead(index);
  }

  function fillStudentSelect(select, selected) {
    const students = [...onlineStudents];
    if (selected && !students.some((student) => student.id === selected)) {
      students.push({ id: selected, name: '已離線學生' });
    }
    const options = [new Option('選擇在線學生', ''), ...students.map((student) => new Option(student.name, student.id))];
    select.replaceChildren(...options);
    select.value = selected || '';
  }

  function renderAdminAnswers() {
    for (const row of $('task2-rows').rows) {
      const questionId = row.dataset.questionId;
      row.querySelectorAll('.student-answer').forEach((element) => {
        const studentId = adminSlots[Number(element.dataset.slot)];
        const value = studentId ? adminAnswers[studentId]?.[questionId] : '';
        element.textContent = value || '—';
        element.classList.toggle('is-empty', !value);
      });
    }
    updateTask2Count();
  }

  async function refreshAdmin() {
    if (!adminSession.token || adminBusy || document.hidden) return;
    const requestToken = adminSession.token;
    adminBusy = true;
    try {
      const data = await rpc('ielts_preview_admin_snapshot', {
        p_token: requestToken, p_student_ids: adminSlots.filter(Boolean)
      });
      if (adminSession.token !== requestToken) return;
      const before = JSON.stringify(onlineStudents);
      onlineStudents = Array.isArray(data.students) ? data.students : [];
      adminAnswers = data.answers && typeof data.answers === 'object' ? data.answers : {};
      applyAccessGate(true);
      if (JSON.stringify(onlineStudents) !== before) {
        for (const select of document.querySelectorAll('.student-head select')) {
          if (select === document.activeElement) continue;
          fillStudentSelect(select, adminSlots[Number(select.dataset.slot)]);
        }
      }
      renderAdminAnswers();
    } catch (error) {
      if (adminSession.token !== requestToken) return;
      if (error.code === '28000' || error.status === 401 || error.status === 403) {
        // A rejected session must no longer show the admin table or student data.
        adminSession = {};
        try { sessionStore?.removeItem(ADMIN_SESSION_KEY); } catch { /* private browsing */ }
        onlineStudents = [];
        adminAnswers = {};
        applyAccessGate(false);
        renderTask2();
      }
    } finally { adminBusy = false; }
  }

  function renderTask2() {
    const rows = $('task2-rows');
    const fragment = document.createDocumentFragment();
    renderAdminHead();
    for (const item of task2) {
      const row = node('tr');
      row.dataset.search = `${item.en} ${item.zh}`.toLocaleLowerCase();
      row.dataset.topic = item.topic;
      row.dataset.questionId = item.id;
      const idCell = node('td');
      idCell.append(node('span', 'row-id', item.id), node('span', 'topic', item.topic));
      const audioCell = node('td', 'audio-cell');
      audioCell.append(audioButton('task2', item));
      const promptCell = node('td', 'prompt-cell');
      const question = node('p', 'question');
      const lines = promptLines(item.en);
      lines.forEach((line, index) => question.append(node('span', index ? 'prompt-task-line' : 'prompt-context-line', line + (index < lines.length - 1 ? ' ' : ''))));
      question.lang = 'en';
      promptCell.append(question);
      const translation = node('p', 'translation', item.zh);
      translation.hidden = !translationsShown;
      translation.lang = 'zh-Hant';
      promptCell.append(translation);
      row.append(idCell, audioCell, promptCell);
      if (adminSession.token) {
        for (let index = 0; index < adminSlots.length; index++) {
          const cell = node('td');
          cell.dataset.studentLabel = `Student ${index + 1}`;
          const answer = node('span', 'student-answer is-empty', '—');
          answer.dataset.slot = String(index);
          cell.append(answer);
          row.append(cell);
        }
      } else {
        const typeCell = node('td');
        const trigger = node('button', 'answer-trigger');
        trigger.type = 'button';
        trigger.dataset.questionId = item.id;
        trigger.setAttribute('aria-label', `${item.id} 題型`);
        trigger.setAttribute('aria-haspopup', 'menu');
        trigger.setAttribute('aria-expanded', 'false');
        trigger.append(node('span', 'answer-marker', '●'), node('span', 'answer-label'), node('span', 'menu-chevron'));
        setAnswerButton(trigger, TYPES.includes(savedTypes[item.id]) ? savedTypes[item.id] : '');
        trigger.addEventListener('click', () => openMenu(trigger, [
          { value: '', label: '清除選擇' },
          ...TYPES.map((type) => ({ value: type, label: type }))
        ], trigger.dataset.value, (value) => {
          refreshStorageOwner();
          if (value) savedTypes[item.id] = value;
          else delete savedTypes[item.id];
          setAnswerButton(trigger, value);
          updateTask2Count();
          try { safeStorage('localStorage')?.setItem(activeStorageKey, JSON.stringify(savedTypes)); } catch { /* private browsing */ }
          if (studentSession()) { pendingChoices.set(item.id, value); void flushPendingChoices(); }
        }));
        typeCell.append(trigger);
        row.append(typeCell);
      }
      fragment.append(row);
    }
    rows.replaceChildren(fragment);
    if (adminSession.token) renderAdminAnswers();
    filterTask2();
  }

  function filterTask1() {
    const search = $('task1-search').value.trim().toLocaleLowerCase();
    let visible = 0;
    for (const row of $('task1-rows').rows) {
      row.hidden = !row.dataset.search.includes(search);
      if (!row.hidden) visible++;
    }
    $('task1-count').textContent = `${visible} / ${task1.length} 題`;
  }

  function filterTask2() {
    const search = $('task2-search').value.trim().toLocaleLowerCase();
    const topic = task2Topic;
    for (const row of $('task2-rows').rows) {
      row.hidden = !(row.dataset.search.includes(search) && (!topic || row.dataset.topic === topic));
    }
    updateTask2Count();
  }

  async function start() {
    applyAccessGate(false);
    const readingControls = document.querySelector('.reading-controls');
    const desktopControlsHost = document.querySelector('.prompt-heading');
    const mobileControlsHost = $('mobile-reading-controls');
    const placeReadingControls = () => {
      const host = window.matchMedia('(max-width: 1100px)').matches ? mobileControlsHost : desktopControlsHost;
      if (readingControls.parentElement !== host) host.append(readingControls);
    };
    placeReadingControls();
    window.addEventListener('resize', placeReadingControls);
    const speed = $('playback-speed');
    const size = $('text-size');
    const speedValues = ['0.25', '0.5', '0.75', '1', '1.25', '1.5', '1.75', '2', '2.25', '2.5', '2.75', '3'];
    const sizeValues = ['0.5', '1', '1.5', '2', '2.5', '3', '3.5', '4', '4.5', '5'];
    const setControl = (button, value) => { button.dataset.value = value; button.querySelector('.reading-control__value').textContent = `${value}×`; };
    const savedSpeed = safeStorage('localStorage')?.getItem(SPEED_KEY);
    const savedSize = safeStorage('localStorage')?.getItem(SIZE_KEY);
    setControl(speed, speedValues.includes(savedSpeed) ? savedSpeed : '1');
    setControl(size, sizeValues.includes(savedSize) ? savedSize : '1');
    questionAudio.playbackRate = Number(speed.dataset.value);
    $('panel-task2').style.setProperty('--question-scale', size.dataset.value);
    speed.addEventListener('click', () => openMenu(speed, speedValues.map((value) => ({ value, label: `${value}×` })), speed.dataset.value, (value) => {
      setControl(speed, value);
      questionAudio.playbackRate = Number(value);
      try { safeStorage('localStorage')?.setItem(SPEED_KEY, value); } catch { /* Preference is optional. */ }
    }, false, true));
    size.addEventListener('click', () => openMenu(size, sizeValues.map((value) => ({ value, label: `${value}×` })), size.dataset.value, (value) => {
      setControl(size, value);
      $('panel-task2').style.setProperty('--question-scale', value);
      try { safeStorage('localStorage')?.setItem(SIZE_KEY, value); } catch { /* Preference is optional. */ }
    }, false, true));
    $('login-open').addEventListener('click', () => {
      $('login-error').hidden = true;
      $('login-password').value = '';
      if (!accessVerified) { $('login-name').focus(); return; }
      $('login-dialog').showModal();
      $('login-name').focus();
    });
    $('login-close').addEventListener('click', () => $('login-dialog').close());
    $('login-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const submit = $('login-submit');
      const role = document.querySelector('[name="login-role"]:checked').value;
      const name = $('login-name').value.trim();
      const password = $('login-password').value;
      submit.disabled = true;
      $('login-error').hidden = true;
      try {
        if (role === 'admin') {
          const account = await rpc('ielts_preview_admin_login', { p_name: name, p_password: password });
          if (!account?.token) throw new Error('用戶名稱或密碼不正確。');
          adminSession = account;
          sessionStore?.setItem(ADMIN_SESSION_KEY, JSON.stringify(account));
          adminSlots = [''];
          onlineStudents = [];
          adminAnswers = {};
          applyAccessGate(true);
          renderTask2();
          void refreshAdmin();
        } else {
          const result = await rpc('flashcard_student_login', { p_name: name, p_password: password });
          const account = Array.isArray(result) ? result[0] : null;
          if (!account?.session_token) throw new Error('用戶名稱或密碼不正確。');
          if (adminSession.token) {
            try { await rpc('ielts_preview_admin_logout', { p_token: adminSession.token }); } catch { /* Session expires server-side. */ }
            adminSession = {};
            sessionStore?.removeItem(ADMIN_SESSION_KEY);
          }
          const student = { token: account.session_token, id: account.id, name: account.name, role: 'student' };
          sessionStore?.setItem('edmund-universal-student-session-v1', JSON.stringify(student));
          window.EdmundSystemNav?.bridgeStudentSession?.(student, true);
          applyAccessGate(true);
          renderTask2();
          syncStudentOwner();
        }
        if ($('login-dialog').open) $('login-dialog').close();
      } catch (error) {
        $('login-error').textContent = error.message || '登入失敗，請重試。';
        $('login-error').hidden = false;
      } finally { $('login-password').value = ''; submit.disabled = false; }
    });
    $('logout-button').addEventListener('click', async () => {
      const oldAdmin = adminSession.token;
      const oldStudent = studentSession();
      if (oldAdmin) {
        adminSession = {};
        sessionStore?.removeItem(ADMIN_SESSION_KEY);
        void rpc('ielts_preview_admin_logout', { p_token: oldAdmin }).catch(() => {});
        onlineStudents = [];
        adminAnswers = {};
        adminSlots = [''];
      } else if (oldStudent) {
        void rpc('ielts_preview_student_leave', { p_token: oldStudent.token, p_device: deviceId }).catch(() => {});
        window.EdmundSystemNav?.forgetStudentSession?.();
      }
      studentOwner = '';
      pendingChoices.clear();
      $('login-name').value = '';
      $('login-password').value = '';
      applyAccessGate(false);
      renderTask2();
    });
    refreshAccountUI();
    for (const tab of document.querySelectorAll('[data-tab]')) {
      tab.addEventListener('click', () => showTab(tab.dataset.tab));
    }
    showTab(location.hash === '#task2' ? 'task2' : 'task1');
    $('task1-search').addEventListener('input', filterTask1);
    $('task2-search').addEventListener('input', filterTask2);
    $('task2-topic').addEventListener('click', () => openMenu($('task2-topic'), [
      { value: '', label: '所有主題' },
      ...[...new Set(task2.map((item) => item.topic))].map((topic) => ({ value: topic, label: topic }))
    ], task2Topic, (value) => {
      task2Topic = value;
      setFilterButton('task2-topic', value || '所有主題');
      filterTask2();
    }));
    window.addEventListener('edmund-student-session-change', syncStudentOwner);
    window.addEventListener('focus', () => { syncStudentOwner(); void refreshAdmin(); void studentHeartbeat(); });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) { void refreshAdmin(); void studentHeartbeat(); } });
    window.setInterval(() => { void refreshAdmin(); }, 2000);
    window.setInterval(() => { void studentHeartbeat(); }, 10000);
    window.addEventListener('storage', (event) => {
      if (event.key === `${activeStorageKey}:task1`) {
        savedTask1 = readStoredObject(safeStorage('localStorage'), event.key);
        refreshTask1Buttons();
      }
      if (event.key === activeStorageKey) {
        savedTypes = readSavedTypes(activeStorageKey);
        refreshTask2Buttons();
        updateTask2Count();
      }
    });
    $('translation-toggle').addEventListener('click', () => {
      translationsShown = !translationsShown;
      $('translation-toggle').setAttribute('aria-pressed', String(translationsShown));
      $('translation-toggle').textContent = translationsShown ? '隱藏繁體中文翻譯' : '顯示繁體中文翻譯';
      for (const element of document.querySelectorAll('#task2-rows .translation')) element.hidden = !translationsShown;
    });
    $('dialog-close').addEventListener('click', () => $('diagram-dialog').close());
    $('diagram-dialog').addEventListener('click', (event) => {
      if (event.target === $('diagram-dialog')) $('diagram-dialog').close();
    });
    try {
      const [task1Response, task2Response, audioResponse] = await Promise.all([
        fetch('/ielts-writing-preview/task1-diagrams.json?v=20261030-3'),
        fetch('/ielts-writing-preview/task2-questions.json?v=20261030-3'),
        fetch('/ielts-writing-preview/question-audio.json?v=20261030-3')
      ]);
      if (!task1Response.ok || !task2Response.ok || !audioResponse.ok) throw new Error('Question data unavailable');
      [task1, task2] = await Promise.all([task1Response.json(), task2Response.json()]);
      audioManifest = await audioResponse.json();
      renderTask1();
      renderTask2();
      syncStudentOwner();
      if (adminSession.token) void refreshAdmin();
    } catch {
      $('task1-count').textContent = '載入失敗';
      $('task2-count').textContent = '載入失敗';
      $('task1-rows').replaceChildren(node('tr', '', '請重新整理頁面以載入題目。'));
      $('task2-rows').replaceChildren(node('tr', '', '請重新整理頁面以載入題目。'));
    }
  }

  start();
})();
