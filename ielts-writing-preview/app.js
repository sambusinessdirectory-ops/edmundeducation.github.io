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
  const imageUrl = (path) => /^https?:\/\//i.test(path) ? path : `/${path.replace(/^\//, '')}`;
  const $ = (id) => document.getElementById(id);
  const node = (name, className, text) => {
    const element = document.createElement(name);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };
  const quizPrompt = (item) => item.quizPrompt || item.prompt;

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

  function closeMenu(restoreFocus = false) {
    if (!activeMenuTrigger) return;
    const trigger = activeMenuTrigger;
    activeMenuTrigger = null;
    menu.hidden = true;
    menu.replaceChildren();
    trigger.setAttribute('aria-expanded', 'false');
    if (restoreFocus) trigger.focus();
  }

  function openMenu(trigger, options, selected, choose, multiple = false) {
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
    trigger.setAttribute('aria-expanded', 'true');
    menu.hidden = false;
    const rect = trigger.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth;
    const width = Math.min(Math.max(rect.width, 282), viewportWidth - 24);
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

  function renderTask2() {
    const rows = $('task2-rows');
    const fragment = document.createDocumentFragment();
    for (const item of task2) {
      const row = node('tr');
      row.dataset.search = `${item.en} ${item.zh}`.toLocaleLowerCase();
      row.dataset.topic = item.topic;
      const idCell = node('td');
      idCell.append(node('span', 'row-id', item.id), node('span', 'topic', item.topic));
      const promptCell = node('td');
      const question = node('p', 'question', item.en);
      question.lang = 'en';
      promptCell.append(question, audioButton('task2', item));
      const translation = node('p', 'translation', item.zh);
      translation.hidden = !translationsShown;
      translation.lang = 'zh-Hant';
      promptCell.append(translation);
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
        try { safeStorage('localStorage')?.setItem(activeStorageKey, JSON.stringify(savedTypes)); } catch { /* private browsing */ }
      }));
      typeCell.append(trigger);
      row.append(idCell, promptCell, typeCell);
      fragment.append(row);
    }
    rows.replaceChildren(fragment);
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
    let visible = 0;
    for (const row of $('task2-rows').rows) {
      row.hidden = !(row.dataset.search.includes(search) && (!topic || row.dataset.topic === topic));
      if (!row.hidden) visible++;
    }
    $('task2-count').textContent = `${visible} / ${task2.length} 題`;
  }

  async function start() {
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
    window.addEventListener('edmund-student-session-change', refreshStorageOwner);
    window.addEventListener('focus', refreshStorageOwner);
    window.addEventListener('storage', (event) => {
      if (event.key === `${activeStorageKey}:task1`) {
        savedTask1 = readStoredObject(safeStorage('localStorage'), event.key);
        refreshTask1Buttons();
      }
      if (event.key === activeStorageKey) {
        savedTypes = readSavedTypes(activeStorageKey);
        for (const button of document.querySelectorAll('#task2-rows .answer-trigger')) {
          setAnswerButton(button, TYPES.includes(savedTypes[button.dataset.questionId]) ? savedTypes[button.dataset.questionId] : '');
        }
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
    } catch {
      $('task1-count').textContent = '載入失敗';
      $('task2-count').textContent = '載入失敗';
      $('task1-rows').replaceChildren(node('tr', '', '請重新整理頁面以載入題目。'));
      $('task2-rows').replaceChildren(node('tr', '', '請重新整理頁面以載入題目。'));
    }
  }

  start();
})();
