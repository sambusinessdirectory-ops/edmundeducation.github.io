(function () {
  'use strict';
  const data = window.EDMUND_2022_B2_CURATION;
  if (!data || document.body.dataset.reader !== '2022-b2') return;

  const VERSION = '2022-b2-super-curation-v2';
  const STORAGE = 'edmund-paper3-2022-b2-curation-v2';
  const chapterList = [
    ['boss', '任務指示', '先找身分、文類、讀者、硬性內容要求與指定來源。'],
    ['categorize', '資料分類', '先按文件標題和任務作暫定分類，再用後文與錄音修正。'],
    ['podcast', '聆聽錄音', '聽到答案邊界便暫停，把關鍵詞寫進原卷筆記欄。'],
    ['data', '逐句取證', '逐份讀 Data File；每句只給一個主要類型，必要時跨任務轉存。'],
    ['writing', '三篇寫作', '先完成自己的答案，再逐句檢視修訂範文的功能與證據。']
  ];
  const taskForType = { 1: 'A', 2: 'B', 3: 'C' };
  const taskNumber = { A: 8, B: 9, C: 10 };
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const make = (tag, className, text) => { const node = document.createElement(tag); if (className) node.className = className; if (text != null) node.textContent = text; return node; };
  const clean = value => String(value || '').replace(/\s+/g, ' ').trim();
  const esc = value => String(value || '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

  function blankState() {
    return { version: VERSION, chapter: 'boss', positions: { boss: 0, categorize: 0, podcast: 0, data: 0, writing: 0 }, completed: [], heard: [], bookmarks: [], evidence: { A: [], B: [], C: [] }, spotlight: true, dialogue: true };
  }
  let activeSlot = localStorage.getItem(`${STORAGE}-active-slot`) || '1';
  function loadState(slot = activeSlot) {
    try {
      const saved = JSON.parse(localStorage.getItem(`${STORAGE}-slot-${slot}`) || 'null');
      if (saved?.version === VERSION) return { ...blankState(), ...saved, positions: { ...blankState().positions, ...saved.positions }, evidence: { ...blankState().evidence, ...saved.evidence } };
    } catch (_) {}
    return blankState();
  }
  let state = loadState();
  const steps = { boss: [], categorize: [], podcast: [], data: [], writing: [] };
  let isOpen = false;

  function save(message = '已自動儲存') {
    localStorage.setItem(`${STORAGE}-active-slot`, activeSlot);
    localStorage.setItem(`${STORAGE}-slot-${activeSlot}`, JSON.stringify(state));
    if ($('#curation-save-status')) $('#curation-save-status').textContent = `${message} · ${new Date().toLocaleTimeString('zh-HK', { hour: '2-digit', minute: '2-digit' })}`;
  }

  function classify(text, page) {
    const lower = text.toLowerCase();
    if (/^(dear |to:|from:|sent:|subject:|file |date$|venue$|in attendance$|end of|this is the last|task \d|answer continuation)/i.test(text) || text.length < 3) return 6;
    if (/situation|contents|listening note-taking|instructions|write around|complete the speech|things to do|would like you|question:|response %/i.test(lower)) return 5;
    if (page === 9 || page === 10) return 2;
    if (page === 6 || (/1990|2022|number of staff|profit|ranking|largest lighting|growth information/i.test(lower) && page === 7)) return 1;
    if (page === 8) return 3;
    if (page === 11) return /residents|11 p\.?m|maintenance|fault|liability|concern|meeting/i.test(lower) ? 2 : /drone|neon|survey|weather|appeal|future/i.test(lower) ? 3 : 4;
    if (page === 5) return /drone|tokyo|olympic|complicated|expensive|future/i.test(lower) ? 3 : 1;
    if (page === 7) return /light emission|sleep|temperature|guideline/i.test(lower) ? 2 : 1;
    if (page <= 4) return 5;
    return 4;
  }

  function upgradeReader() {
    const top = $('.top');
    if (top) { top.classList.add('curation-site-top'); top.insertAdjacentHTML('afterbegin', '<a class="curation-brand" href="/">EdmundEducation</a>'); }
    const hero = $('.hero'); if (!hero) return;
    hero.classList.add('curation-reader-hero');
    const paragraphs = $$(':scope > p', hero);
    $('h1', hero).textContent = 'Data File 分析 + PP';
    if (paragraphs[0]) paragraphs[0].textContent = '2022 · DSE PAPER 3 · PART B2';
    if (paragraphs[1]) paragraphs[1].textContent = '逐頁讀懂原文，把線索變成答案。完整資料檔、問答冊、聆聽錄音與三篇修訂範文。';
    hero.insertAdjacentHTML('beforeend', '<div class="curation-facts"><span><b>11</b> Data File 頁</span><span><b>8</b> 問答冊頁</span><span><b>8</b> Podcast 停頓點</span><span><b>3</b> 寫作任務</span></div>');
    const toolbar = $('.toolbar', hero);
    if (toolbar) {
      toolbar.classList.add('curation-reader-toolbar'); hero.insertAdjacentElement('afterend', toolbar);
      $('[data-filter="all"]', toolbar).textContent = '全部內容';
      $('[data-filter="qab"]', toolbar).textContent = 'PP 練習';
      $('[data-filter="qab"]', toolbar).insertAdjacentHTML('beforebegin', '<button type="button" data-open-podcast>錄音稿</button>');
      toolbar.insertAdjacentHTML('beforeend', '<button type="button" class="curation-launch" aria-pressed="false">✦ Super Curation</button>');
    }
    $('.layout > aside')?.classList.add('curation-reading-route');
    if ($('.layout > aside > strong')) $('.layout > aside > strong').textContent = '閱讀路線';
  }

  function buildSteps() {
    const source = [];
    $$('.paper-page[data-kind="data"] .native-document').forEach(pageDocument => {
      const page = Number(pageDocument.closest('.paper-page').id.replace('page-', ''));
      $$('h2,h3,h4,h5,p,li,th,td,dt,dd,figcaption', pageDocument).forEach((node, localIndex) => {
        if (node.lang === 'zh-Hant' || node.classList.contains('translation') || node.closest('.translation') || node.querySelector('textarea,input') || node.closest('.curation-unit')) return;
        const text = clean(node.textContent); if (!text) return;
        const type = classify(text, page); const id = `source-${page}-${localIndex}`;
        node.classList.add('curation-unit'); node.tabIndex = 0; node.dataset.curationId = id;
        source.push({ id, chapter: 'data', page, type, task: taskForType[type] || null, title: `Data File 第 ${page} 頁`, quote: text, target: node });
      });
    });
    source.filter(step => step.page === 4).forEach((step, index) => steps.boss.push({ ...step, id: `boss-${index}`, chapter: 'boss', type: 5, task: null, title: index < 2 ? '辨認主管電郵與身分' : '拆解主管指示' }));
    source.filter(step => step.page >= 4 && step.page <= 11).forEach(step => steps.data.push(step));
    [
      [5, '剪報與旅遊博客', ['A', 'C'], '山難與創辦史暫存 Task A；drone 博客暫存 Task C。'],
      [6, 'Pris Fong 日記', ['A'], '按日期建立創辦、命名與實現夢想的時間線。'],
      [7, '公司報告與 EPD 指引', ['A', 'B'], '報告數據支援 Task A；燈光指引支援 Task B。'],
      [8, '顧客調查與產品冊', ['C'], '調查解答 neon lasting appeal；產品例子支援 3D。'],
      [9, '居民協會電郵', ['B'], '只處理居民提出的 concerns，保持正式而關心的語氣。'],
      [10, '事故新聞附件', ['B'], '連同最新會議紀錄讀，不把舊事故寫成現時責任。'],
      [11, '管理委員會會議紀錄', ['B', 'C'], '最新決定同時更新居民回信與演說。']
    ].forEach(([page, title, tasks, quote]) => steps.categorize.push({ id: `category-${page}`, chapter: 'categorize', page, title, tasks, task: tasks[0], quote, target: $(`#page-${page}`) }));
    data.podcast.cues.forEach((cue, index) => steps.podcast.push({ id: `cue-${index}`, chapter: 'podcast', page: 3, title: cue.heading, quote: cue.answer || cue.note, type: cue.type, task: taskForType[cue.type] || null, cue, target: $('#page-3 .notes-form-body') }));
    data.essays.forEach(essay => essay.guide.forEach((row, sentenceIndex) => steps.writing.push({ id: `essay-${essay.task}-${sentenceIndex}`, chapter: 'writing', page: essay.task === 8 ? 12 : essay.task === 9 ? 14 : 17, title: `Task ${essay.task} · ${essay.title}`, quote: row[0], explanation: row[1], source: row[2], task: String.fromCharCode(57 + essay.task), essay, sentenceIndex, target: $(`#page-${essay.task === 8 ? 12 : essay.task === 9 ? 14 : 17}`) })));
    Object.values(steps).forEach(list => list.forEach((step, index) => { step.index = index; }));
  }

  function mount() {
    document.body.insertAdjacentHTML('beforeend', `
      <section class="curation-stage" id="curation-stage" hidden><div class="curation-stage-items"><div class="curation-stage-line"><i class="curation-stage-fill"></i></div>${chapterList.map((chapter, index) => `<button class="curation-stage-item" type="button" data-chapter="${chapter[0]}"><span class="curation-stage-dot">${index + 1}</span><strong class="curation-stage-label">${chapter[1]}</strong><small class="curation-stage-count"></small></button>`).join('')}</div></section>
      <aside class="curation-dock" id="curation-dock" hidden><header class="curation-top"><span class="curation-kicker">SUPER CURATION · 2022 B2</span><button id="curation-close" aria-label="離開">×</button></header><div class="curation-actions"><button id="curation-prev">← 上一步</button><button id="curation-help">需要更多協助</button><button id="curation-next">下一步 →</button></div><p class="curation-chapter" id="curation-chapter"></p><div class="curation-jumps"><button id="curation-step-jump"></button><button id="curation-bookmark-jump">選擇書籤　⌄</button></div><div class="curation-task-jump" id="curation-task-jump"></div><div class="curation-legend"><span class="type-1">A</span><span class="type-2">B</span><span class="type-3">C</span><span class="type-4">語氣 / Type 4</span><span class="type-5">提示</span><span class="type-6">排除</span></div><div class="curation-options"><label><input id="curation-spotlight" type="checkbox" checked> 聚光燈</label><label><input id="curation-dialogue" type="checkbox" checked> Eddy 對話</label><button id="curation-bookmark">☆</button></div><div class="curation-content"><p id="curation-source"></p><h2 id="curation-title"></h2><blockquote id="curation-quote"></blockquote><div id="curation-analysis"></div><div id="curation-writing"></div></div><footer class="curation-save"><div><select id="curation-slot" aria-label="存檔欄">${[1, 2, 3, 4, 5].map(slot => `<option value="${slot}"${String(slot) === activeSlot ? ' selected' : ''}>Slot ${slot}</option>`).join('')}</select><button id="curation-save-now">存檔</button><button id="curation-export">匯出</button><label class="curation-import">匯入<input id="curation-import" type="file" accept="application/json"></label></div><small id="curation-save-status">自動儲存已啟用</small></footer></aside>
      <aside class="curation-bank" id="curation-bank" hidden><h2>三項寫作證據庫</h2><p>紅線＝範文已使用；深藍＝原文已取證。</p>${['A', 'B', 'C'].map(task => `<details class="curation-bank-${task}" open><summary><strong>Task ${task}</strong><span data-bank-count="${task}">0 句</span></summary><div data-bank-list="${task}"></div></details>`).join('')}</aside>
      <div class="curation-masks" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
      <section class="curation-podcast" id="curation-podcast" hidden><header><strong>2022 Part B Podcast · Wish You Were Here</strong><button data-close-podcast>×</button></header><audio id="b2-podcast" controls preload="metadata" src="${esc(data.podcast.src)}"></audio><div>${data.podcast.cues.map((cue, index) => `<button data-cue="${index}"><time>${Math.floor(cue.time / 60)}:${String(Math.floor(cue.time % 60)).padStart(2, '0')}</time><span><b>${esc(cue.heading)}</b><small>${esc(cue.note)}</small></span></button>`).join('')}</div></section>
      <dialog class="curation-picker" id="curation-picker"><header><strong>跳至步驟</strong><button data-picker-close>×</button></header><input type="search" placeholder="搜尋步驟或原文"><div></div></dialog>`);
    bind();
  }

  function current() { const list = steps[state.chapter]; return list[Math.max(0, Math.min(state.positions[state.chapter] || 0, list.length - 1))]; }
  function setOpen(value) {
    isOpen = value;
    ['#curation-stage', '#curation-dock', '#curation-bank'].forEach(selector => $(selector).hidden = !value);
    document.body.classList.toggle('curation-active', value);
    $('.curation-launch').textContent = value ? '✦ 離開 Curation' : '✦ Super Curation';
    $('.curation-launch').setAttribute('aria-pressed', String(value));
    if (value) render(); else { clearTarget(); mask(null); $('#curation-podcast').hidden = true; $('#b2-podcast')?.pause(); }
  }

  function explanation(step) {
    if (step.chapter === 'boss') return '<h3>Boss letter · 拆題</h3><p>圈出身分、文類、讀者、必須回答的內容，以及指定先看的來源。這些句是路標，不是可直接抄入答案的正文。</p>';
    if (step.chapter === 'categorize') return `<h3>先分類，再修正</h3><p>${esc(step.quote)}</p><p class="curation-type-card">暫定：${step.tasks.map(task => `Task ${task}`).join(' + ')}</p>`;
    if (step.chapter === 'podcast') return `<h3>聽到這裏便暫停</h3><p>${esc(step.cue.note)}</p>${step.cue.answer ? `<p class="curation-type-card">應記：${esc(step.cue.answer)}</p>` : ''}<button class="curation-cue-play" data-play-current>▶ 從 ${Math.floor(step.cue.time / 60)}:${String(Math.floor(step.cue.time % 60)).padStart(2, '0')} 播放</button>`;
    if (step.chapter === 'writing') return `<h3>句子功能</h3><p>${esc(step.explanation)}</p><p class="curation-type-card">Evidence: ${esc(step.source)}</p>`;
    const type = data.types[step.type];
    const reason = step.type <= 3 ? `可支援 Task ${step.task}（原卷 Task ${taskNumber[step.task]}）。保留原意，再按文體和受眾轉述。` : step.type === 4 ? '意思相關，但原句用途或文體不宜直接搬用；核對上下文後轉述。' : step.type === 5 ? '這是提示、更新或篩選線索，不是成品句子。' : '這是行政字樣、介面或非主線細節，不寫入答案。';
    return `<p class="curation-type-card type-${step.type}">類型 ${step.type} · ${esc(type.label)}</p><h3>分析</h3><p>${esc(reason)}</p><h3>下一步</h3><p>${esc(type.next)}</p>`;
  }

  function clearTarget() { $$('.curation-target').forEach(node => node.classList.remove('curation-target')); }
  function focus(step) {
    clearTarget(); const target = step.target; if (!target) return;
    target.classList.add('curation-target');
    target.scrollIntoView({ block: 'center', behavior: 'auto' });
    setTimeout(() => mask(target), 80);
  }
  function mask(target) {
    const masks = $$('.curation-masks i');
    if (!isOpen || !state.spotlight || !target || innerWidth < 760) { masks.forEach(item => item.hidden = true); return; }
    const rect = target.getBoundingClientRect(); const pad = 9; const left = Math.max(0, rect.left - pad); const top = Math.max(0, rect.top - pad); const right = Math.min(innerWidth, rect.right + pad); const bottom = Math.min(innerHeight, rect.bottom + pad);
    masks.forEach(item => item.hidden = false);
    [[0, 0, innerWidth, top], [0, top, left, bottom - top], [right, top, innerWidth - right, bottom - top], [0, bottom, innerWidth, innerHeight - bottom]].forEach((box, index) => Object.assign(masks[index].style, { left: `${box[0]}px`, top: `${box[1]}px`, width: `${box[2]}px`, height: `${box[3]}px` }));
  }

  function renderBank() {
    for (const task of ['A', 'B', 'C']) {
      const list = $(`[data-bank-list="${task}"]`); list.replaceChildren();
      state.evidence[task].forEach(id => { const step = Object.values(steps).flat().find(item => item.id === id); if (!step) return; const button = make('button', '', step.quote); button.addEventListener('click', () => { state.chapter = step.chapter; state.positions[step.chapter] = step.index; render(); }); list.append(button); });
      $(`[data-bank-count="${task}"]`).textContent = `${state.evidence[task].length} 句`;
    }
  }

  function render(focusSource = true) {
    const step = current(); if (!step) return;
    const chapterIndex = chapterList.findIndex(chapter => chapter[0] === state.chapter);
    $$('#curation-stage [data-chapter]').forEach((button, index) => {
      const list = steps[chapterList[index][0]]; const done = list.length && list.every(item => state.completed.includes(item.id));
      button.classList.toggle('active', index === chapterIndex); button.classList.toggle('done', done); button.setAttribute('aria-current', index === chapterIndex ? 'step' : 'false');
      $('.curation-stage-dot', button).textContent = done ? '✓' : String(index + 1);
      $('.curation-stage-count', button).textContent = index === chapterIndex ? `${step.index + 1}/${steps[state.chapter].length}` : done ? '完成' : '';
    });
    $('.curation-stage-fill').style.width = `${chapterIndex * 25}%`;
    $('#curation-chapter').textContent = chapterList[chapterIndex][2];
    $('#curation-step-jump').textContent = `${step.index + 1} / ${steps[state.chapter].length} · ${step.quote.slice(0, 28)}${step.quote.length > 28 ? '…' : ''}　⌄`;
    $('#curation-source').textContent = step.chapter === 'podcast' ? 'PODCAST · AUTHENTIC 2022 PART B' : step.chapter === 'writing' ? `MODEL ESSAY · TASK ${step.essay.task}` : `DATA FILE · PAGE ${step.page}`;
    $('#curation-title').textContent = step.title; $('#curation-quote').textContent = step.quote; $('#curation-analysis').innerHTML = explanation(step);
    $('#curation-writing').innerHTML = step.chapter === 'writing' ? `<article class="curation-model-card"><p>REVISED BENCHMARK · TASK ${step.essay.task}</p><h3>${esc(step.essay.title)}</h3><div>${esc(step.quote)}</div><small>Sentence ${step.sentenceIndex + 1} / ${step.essay.guide.length}</small><button data-open-answer>開啟原卷答題頁</button></article>` : '';
    $('[data-open-answer]')?.addEventListener('click', () => $(`#page-${step.page}`).scrollIntoView({ block: 'start', behavior: 'smooth' }));
    $('#curation-bookmark').textContent = state.bookmarks.includes(step.id) ? '★' : '☆';
    $('#curation-prev').disabled = step.index === 0;
    $('#curation-next').textContent = step.index === steps[state.chapter].length - 1 ? (chapterIndex === chapterList.length - 1 ? '返回第一章 ↺' : '完成本章 ✓') : '下一步 →';
    const taskJump = $('#curation-task-jump'); taskJump.replaceChildren(); taskJump.hidden = !['data', 'writing'].includes(state.chapter);
    if (!taskJump.hidden) ['A', 'B', 'C'].forEach(task => { const first = steps[state.chapter].find(item => item.task === task); if (first) { const button = make('button', '', `Task ${task}`); button.addEventListener('click', () => { state.positions[state.chapter] = first.index; render(); }); taskJump.append(button); } });
    if (step.chapter === 'podcast') $('#curation-podcast').hidden = false;
    renderBank(); if (focusSource) focus(step); else mask(step.target); save();
  }

  function go(delta) { const list = steps[state.chapter]; state.positions[state.chapter] = Math.max(0, Math.min(state.positions[state.chapter] + delta, list.length - 1)); render(); }
  function addEvidence(step) { if (step.task && step.type <= 3 && !state.evidence[step.task].includes(step.id)) state.evidence[step.task].push(step.id); }
  function writeNote(step) {
    if (!step.cue.answer) return;
    const fields = $$('#page-3 textarea'); const target = step.cue.heading.includes('Award') ? fields[0] : step.cue.heading.includes('History') ? fields[2] : step.cue.heading.includes('Job') ? fields[3] : fields[4];
    if (target && !target.value.includes(step.cue.answer)) { target.value += `${target.value ? '\n' : ''}${step.cue.answer}`; target.dispatchEvent(new Event('input', { bubbles: true })); }
  }
  function picker(bookmarksOnly) {
    const dialog = $('#curation-picker'); const list = $('#curation-picker > div'); list.replaceChildren();
    const source = bookmarksOnly ? state.bookmarks.map(id => Object.values(steps).flat().find(item => item.id === id)).filter(Boolean) : steps[state.chapter];
    source.forEach(step => { const button = make('button', '', `${step.index + 1}. ${step.title} — ${step.quote.slice(0, 68)}`); button.addEventListener('click', () => { dialog.close(); state.chapter = step.chapter; state.positions[step.chapter] = step.index; render(); }); list.append(button); }); dialog.showModal();
  }

  function bind() {
    $('.curation-launch').addEventListener('click', () => setOpen(!isOpen));
    $('[data-open-podcast]').addEventListener('click', () => { $('#curation-podcast').hidden = false; });
    $('[data-close-podcast]').addEventListener('click', () => { $('#curation-podcast').hidden = true; });
    $('#curation-close').addEventListener('click', () => setOpen(false));
    $$('#curation-stage [data-chapter]').forEach(button => button.addEventListener('click', () => { state.chapter = button.dataset.chapter; render(); }));
    $('#curation-prev').addEventListener('click', () => go(-1));
    $('#curation-next').addEventListener('click', () => { const step = current(); addEvidence(step); if (!state.completed.includes(step.id)) state.completed.push(step.id); if (step.chapter === 'podcast') { if (!state.heard.includes(step.id)) state.heard.push(step.id); writeNote(step); } if (step.index < steps[state.chapter].length - 1) go(1); else { state.chapter = chapterList[(chapterList.findIndex(chapter => chapter[0] === state.chapter) + 1) % chapterList.length][0]; render(); } });
    $('#curation-step-jump').addEventListener('click', () => picker(false)); $('#curation-bookmark-jump').addEventListener('click', () => picker(true));
    $('[data-picker-close]').addEventListener('click', () => $('#curation-picker').close());
    $('#curation-picker input').addEventListener('input', event => $$('#curation-picker > div > button').forEach(button => { button.hidden = !button.textContent.toLowerCase().includes(event.target.value.toLowerCase()); }));
    $('#curation-bookmark').addEventListener('click', () => { const id = current().id; state.bookmarks = state.bookmarks.includes(id) ? state.bookmarks.filter(item => item !== id) : [...state.bookmarks, id]; render(false); });
    $('#curation-spotlight').addEventListener('change', event => { state.spotlight = event.target.checked; mask(current().target); save(); });
    $('#curation-dialogue').addEventListener('change', event => { state.dialogue = event.target.checked; $('#curation-dock').classList.toggle('dialogue', state.dialogue); save(); });
    $('#curation-help').addEventListener('click', () => { $('#curation-save-status').textContent = '先讀原句 → 看類型 → 說出用途 → 再按下一步。'; });
    $('#curation-save-now').addEventListener('click', () => save('已手動存檔'));
    $('#curation-slot').addEventListener('change', event => { save(); activeSlot = event.target.value; state = loadState(activeSlot); render(); });
    $('#curation-export').addEventListener('click', () => { const url = URL.createObjectURL(new Blob([JSON.stringify({ version: VERSION, state }, null, 2)], { type: 'application/json' })); const link = make('a'); link.href = url; link.download = 'paper3-2022-b2-curation.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); });
    $('#curation-import').addEventListener('change', async event => { const file = event.target.files?.[0]; if (!file) return; try { const payload = JSON.parse(await file.text()); if (payload.version !== VERSION) throw new Error('版本不符'); Object.assign(state, payload.state); render(); } catch (error) { save(`匯入失敗：${error.message}`); } event.target.value = ''; });
    $$('#curation-podcast [data-cue]').forEach(button => button.addEventListener('click', () => { const index = Number(button.dataset.cue); const audio = $('#b2-podcast'); state.chapter = 'podcast'; state.positions.podcast = index; audio.currentTime = data.podcast.cues[index].time; audio.play().catch(() => {}); if (isOpen) render(false); }));
    document.addEventListener('click', event => { if (event.target.closest('[data-play-current]')) { const step = current(); const audio = $('#b2-podcast'); audio.currentTime = step.cue.time; audio.play().catch(() => {}); } });
    $$('.curation-unit').forEach(node => node.addEventListener('click', event => { if (!isOpen) return; const step = steps.data.find(item => item.id === node.dataset.curationId) || steps.boss.find(item => item.target === node); if (!step) return; event.preventDefault(); state.chapter = step.chapter; state.positions[step.chapter] = step.index; render(false); }));
    window.addEventListener('resize', () => mask(current()?.target)); window.addEventListener('scroll', () => mask(current()?.target), { passive: true });
    document.addEventListener('keydown', event => { if (isOpen && event.key === 'Escape' && !$('#curation-picker').open) setOpen(false); });
  }

  upgradeReader(); buildSteps(); mount();
  if (new URLSearchParams(location.search).get('curation') === '1') setOpen(true);
}());
