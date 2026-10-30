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
  const imageUrl = (path) => /^https?:\/\//i.test(path) ? path : `/${path.replace(/^\//, '')}`;
  const $ = (id) => document.getElementById(id);
  const node = (name, className, text) => {
    const element = document.createElement(name);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };

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
  let task1 = [];
  let task2 = [];
  let translationsShown = false;
  let task1Type = '';
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

  function openMenu(trigger, options, selected, choose) {
    if (activeMenuTrigger === trigger) { closeMenu(); return; }
    closeMenu();
    menu.replaceChildren();
    for (const option of options) {
      const item = node('button', 'choice-menu__option');
      item.type = 'button';
      item.setAttribute('role', 'menuitemradio');
      item.setAttribute('aria-checked', String(option.value === selected));
      item.dataset.value = option.value;
      item.append(node('span', 'choice-menu__check', option.value === selected ? '✓' : ''), node('span', '', option.label));
      item.addEventListener('click', () => { choose(option.value); closeMenu(true); });
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
    (buttons.find((item) => item.dataset.value === selected) || buttons[0])?.focus();
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

  function setAnswerButton(button, value) {
    button.dataset.value = value;
    button.classList.toggle('is-selected', Boolean(value));
    button.querySelector('.answer-label').textContent = value || '選擇題型';
  }

  function refreshStorageOwner() {
    const nextKey = storageKey();
    if (nextKey === activeStorageKey) return;
    activeStorageKey = nextKey;
    savedTypes = readSavedTypes(nextKey);
    for (const button of document.querySelectorAll('.answer-trigger')) {
      setAnswerButton(button, TYPES.includes(savedTypes[button.dataset.questionId]) ? savedTypes[button.dataset.questionId] : '');
    }
    closeMenu();
  }

  function openDiagram(item) {
    $('dialog-type').textContent = `TASK 1 · ${item.type}`;
    $('dialog-title').textContent = item.title;
    $('dialog-prompt').textContent = item.prompt;
    $('dialog-image').src = imageUrl(item.image);
    $('dialog-image').alt = `${item.title} 題圖`;
    $('diagram-dialog').showModal();
  }

  function renderTask1() {
    const rows = $('task1-rows');
    const fragment = document.createDocumentFragment();
    for (const item of task1) {
      const row = node('tr');
      row.dataset.search = `${item.title} ${item.prompt} ${item.type}`.toLocaleLowerCase();
      row.dataset.type = item.type;
      const idCell = node('td');
      idCell.append(node('span', 'row-id', item.id));
      const promptCell = node('td');
      promptCell.append(node('p', 'question', item.prompt), node('span', 'topic', item.type));
      const imageCell = node('td');
      const button = node('button', 'diagram-button');
      button.type = 'button';
      button.setAttribute('aria-label', `查看 ${item.id} 題圖`);
      const image = node('img');
      image.src = imageUrl(item.image);
      image.alt = '';
      image.loading = 'lazy';
      button.append(image, node('span', '', '放大題圖'));
      button.addEventListener('click', () => openDiagram(item));
      imageCell.append(button);
      row.append(idCell, promptCell, imageCell);
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
      promptCell.append(node('p', 'question', item.en));
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
    const type = task1Type;
    let visible = 0;
    for (const row of $('task1-rows').rows) {
      row.hidden = !(row.dataset.search.includes(search) && (!type || row.dataset.type === type));
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
    $('task1-type').addEventListener('click', () => openMenu($('task1-type'), [
      { value: '', label: '所有類型' },
      ...[...new Set(task1.map((item) => item.type))].map((type) => ({ value: type, label: type }))
    ], task1Type, (value) => {
      task1Type = value;
      setFilterButton('task1-type', value || '所有類型');
      filterTask1();
    }));
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
      if (event.key !== activeStorageKey) return;
      savedTypes = readSavedTypes(activeStorageKey);
      for (const button of document.querySelectorAll('.answer-trigger')) {
        setAnswerButton(button, TYPES.includes(savedTypes[button.dataset.questionId]) ? savedTypes[button.dataset.questionId] : '');
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
      const [task1Response, task2Response] = await Promise.all([
        fetch('/ielts-writing-preview/task1-diagrams.json'),
        fetch('/ielts-writing-preview/task2-questions.json')
      ]);
      if (!task1Response.ok || !task2Response.ok) throw new Error('Question data unavailable');
      [task1, task2] = await Promise.all([task1Response.json(), task2Response.json()]);
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
