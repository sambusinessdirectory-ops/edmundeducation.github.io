(() => {
  'use strict';

  const TYPES = [
    'Opinions',
    'Discuss both views + Opinions',
    'Advantages & Disadvantages',
    'Cause & Solution',
    'Direct question'
  ];
  const STORAGE_KEY = 'edmund-ielts-writing-preview-types-v1';
  const $ = (id) => document.getElementById(id);
  const node = (name, className, text) => {
    const element = document.createElement(name);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };

  let savedTypes = {};
  try { savedTypes = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {}; }
  catch { savedTypes = {}; }
  let task1 = [];
  let task2 = [];
  let translationsShown = false;

  function showTab(tab) {
    for (const name of ['task1', 'task2']) {
      const active = name === tab;
      $(`panel-${name}`).hidden = !active;
      $(`tab-${name}`).classList.toggle('is-active', active);
      $(`tab-${name}`).setAttribute('aria-selected', String(active));
    }
    history.replaceState(null, '', tab === 'task2' ? '#task2' : '#task1');
  }

  function fillFilter(id, values) {
    const select = $(id);
    for (const value of values) {
      const option = node('option', '', value);
      option.value = value;
      select.append(option);
    }
  }

  function openDiagram(item) {
    $('dialog-type').textContent = `TASK 1 · ${item.type}`;
    $('dialog-title').textContent = item.title;
    $('dialog-prompt').textContent = item.prompt;
    $('dialog-image').src = `/${item.image.replace(/^\//, '')}`;
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
      image.src = `/${item.image.replace(/^\//, '')}`;
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
      const select = node('select', 'type-select');
      select.setAttribute('aria-label', `${item.id} 題型`);
      const placeholder = node('option', '', '選擇題型');
      placeholder.value = '';
      select.append(placeholder);
      for (const type of TYPES) {
        const option = node('option', '', type);
        option.value = type;
        select.append(option);
      }
      select.value = TYPES.includes(savedTypes[item.id]) ? savedTypes[item.id] : '';
      select.addEventListener('change', () => {
        if (select.value) savedTypes[item.id] = select.value;
        else delete savedTypes[item.id];
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(savedTypes)); } catch { /* private browsing */ }
      });
      typeCell.append(select);
      row.append(idCell, promptCell, typeCell);
      fragment.append(row);
    }
    rows.replaceChildren(fragment);
    filterTask2();
  }

  function filterTask1() {
    const search = $('task1-search').value.trim().toLocaleLowerCase();
    const type = $('task1-type').value;
    let visible = 0;
    for (const row of $('task1-rows').rows) {
      row.hidden = !(row.dataset.search.includes(search) && (!type || row.dataset.type === type));
      if (!row.hidden) visible++;
    }
    $('task1-count').textContent = `${visible} / ${task1.length} 題`;
  }

  function filterTask2() {
    const search = $('task2-search').value.trim().toLocaleLowerCase();
    const topic = $('task2-topic').value;
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
    $('task1-type').addEventListener('change', filterTask1);
    $('task2-search').addEventListener('input', filterTask2);
    $('task2-topic').addEventListener('change', filterTask2);
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
      fillFilter('task1-type', [...new Set(task1.map((item) => item.type))]);
      fillFilter('task2-topic', [...new Set(task2.map((item) => item.topic))]);
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
