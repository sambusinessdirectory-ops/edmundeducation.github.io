(function () {
  'use strict';

  const data = window.EDMUND_2022_B2_CURATION;
  if (!data || document.body.dataset.reader !== '2022-b2') return;

  const storageKey = 'edmund-paper3-2022-b2-curation-v1';
  const state = JSON.parse(localStorage.getItem(storageKey) || '{}');
  state.stage ||= 'orient';
  state.categorised ||= {};
  state.bookmarks ||= [];

  const save = () => localStorage.setItem(storageKey, JSON.stringify(state));
  const clean = value => String(value || '').replace(/\s+/g, ' ').trim();
  const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

  function classify(text, page) {
    const lower = text.toLowerCase();
    if (/^(dear |to:|from:|sent:|subject:|file |date$|venue$|in attendance$|end of|this is the last|task \d|answer continuation)/i.test(text) || text.length < 3) return 6;
    if (/situation|contents|listening note-taking|instructions|write around|complete the speech|things to do|first, ms|next, i.d like|finally, ms|would like you|according to the|question:|response %/i.test(lower)) return 5;
    if (page === 9 || page === 10) return 2;
    if (page === 6 || (/1990|2022|number of staff|profit|ranking|largest lighting|growth information/i.test(lower) && page === 7)) return 1;
    if (page === 8) return 3;
    if (page === 11) {
      if (/residents|11 p\.?m|maintenance|fault|liability|concern|meeting/i.test(lower)) return 2;
      if (/drone|neon|survey|weather|appeal|future/i.test(lower)) return 3;
      return 4;
    }
    if (page === 5) return /drone|tokyo|olympic|complicated|expensive|future/i.test(lower) ? 3 : 1;
    if (page === 7) return /light emission|sleep|temperature|guideline/i.test(lower) ? 2 : 1;
    if (page === 4) return 5;
    if (page <= 3) return 5;
    return 4;
  }

  function reason(type, text, page) {
    const quote = text.length > 118 ? `${text.slice(0, 115)}…` : text;
    const specific = {
      1: `這項資料補足公司歷史的「創辦／命名／實現夢想／增長與認可」其中一格。原文證據是「${quote}」。`,
      2: `這項資料可用來回應 light pollution 或 rotating-cube safety，並建立負責任的公司語氣。原文證據是「${quote}」。`,
      3: `這項資料可支持 3D、drone 或 neon lasting appeal 的演說內容。原文證據是「${quote}」。`,
      4: `意思與任務相關，但原句的用途或文體不適合直接搬用；應先核對第 ${page} 頁上下文再轉述。`,
      5: `這是篩選路標：它界定身分、受眾、來源或要求，而不是成品正文。第 ${page} 頁的字眼是「${quote}」。`,
      6: `這是稱呼、介面、行政字樣或非 B2 主線細節；直接寫入會浪費字數。第 ${page} 頁原文是「${quote}」。`
    };
    return specific[type];
  }

  function mountShell() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    const section = document.createElement('section');
    section.className = 'curation-hub';
    section.innerHTML = `
      <div class="curation-title"><div><p class="curation-kicker">2022 B2 · SUPER CURATION</p><h2>由拆題到成文：五階段學習路線</h2></div><output id="curation-coverage" aria-live="polite">建立逐句索引…</output></div>
      <nav class="curation-stages" aria-label="Super Curation stages">
        <button data-stage="orient">1 拆 Boss letter</button><button data-stage="sort">2 六類篩料</button><button data-stage="listen">3 Podcast</button><button data-stage="write">4 Model essays</button><button data-stage="audit">5 自我審核</button>
      </nav>
      <div class="curation-panels">
        <section data-panel="orient"><div class="task-grid">${data.tasks.map(task => `<article><b>Task ${task.id}</b><h3>${task.title}</h3><p>${task.purpose}</p><small>主來源：${task.sources}</small></article>`).join('')}</div></section>
        <section data-panel="sort"><p>點擊原卷每個英文文字單位旁的分類標籤，查看「為甚麼」和下一步。每個單位只有一個主要類型。</p><div class="type-legend">${Object.entries(data.types).map(([id, type]) => `<span class="type-${id}"><b>${id}</b>${type.label}</span>`).join('')}</div></section>
        <section data-panel="listen"><div class="podcast-player"><div><b>Authentic 2022 Part B podcast</b><small>7:25 · source SHA-256 verified</small></div><audio id="b2-podcast" controls preload="metadata" src="${data.podcast.src}"></audio><div class="cue-list">${data.podcast.cues.map((cue, index) => `<button data-cue="${index}"><time>${Math.floor(cue.time / 60)}:${String(Math.floor(cue.time % 60)).padStart(2, '0')}</time><span>${cue.heading}<small>${cue.note}</small></span></button>`).join('')}</div></div></section>
        <section data-panel="write"><div class="essay-tabs" role="tablist">${data.essays.map(essay => `<button role="tab" data-essay="${essay.task}">Task ${essay.task}</button>`).join('')}</div><div id="essay-view"></div></section>
        <section data-panel="audit"><div class="audit-list"><label><input type="checkbox" data-audit="requirements"> 每段都回應題目指定內容</label><label><input type="checkbox" data-audit="sources"> 每個事實可追溯至 Data File 或 podcast</label><label><input type="checkbox" data-audit="genre"> 文體、受眾、語氣正確</label><label><input type="checkbox" data-audit="synthesis"> 已轉述及整合，沒有大段照抄</label><label><input type="checkbox" data-audit="accuracy"> 年份、數字、因果和人物關係準確</label></div></section>
      </div>`;
    hero.insertAdjacentElement('afterend', section);

    section.querySelectorAll('[data-stage]').forEach(button => button.addEventListener('click', () => setStage(button.dataset.stage)));
    section.querySelectorAll('[data-cue]').forEach(button => button.addEventListener('click', () => {
      const audio = document.querySelector('#b2-podcast');
      const cue = data.podcast.cues[Number(button.dataset.cue)];
      audio.currentTime = cue.time;
      audio.play().catch(() => {});
      if (cue.answer) revealNote(cue);
    }));
    section.querySelectorAll('[data-essay]').forEach(button => button.addEventListener('click', () => renderEssay(Number(button.dataset.essay))));
    section.querySelectorAll('[data-audit]').forEach(input => {
      input.checked = Boolean(state[`audit-${input.dataset.audit}`]);
      input.addEventListener('change', () => { state[`audit-${input.dataset.audit}`] = input.checked; save(); });
    });
    renderEssay(8);
    setStage(state.stage);
  }

  function setStage(stage) {
    state.stage = stage;
    save();
    document.querySelectorAll('[data-stage]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.stage === stage)));
    document.querySelectorAll('[data-panel]').forEach(panel => panel.hidden = panel.dataset.panel !== stage);
  }

  function revealNote(cue) {
    const fields = Array.from(document.querySelectorAll('#page-3 textarea'));
    const target = cue.heading.includes('Award') ? fields[0] : cue.heading.includes('History') ? fields[2] : cue.heading.includes('Job') ? fields[3] : fields[4];
    if (!target || target.value.includes(cue.answer)) return;
    const prompt = document.createElement('button');
    prompt.className = 'cue-note-prompt';
    prompt.textContent = `把關鍵詞加入原卷筆記欄：${cue.answer}`;
    prompt.addEventListener('click', () => {
      target.value = `${target.value}${target.value ? '\n' : ''}${cue.answer}`;
      target.dispatchEvent(new Event('input', { bubbles: true }));
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      prompt.remove();
    });
    document.querySelector('.podcast-player').append(prompt);
  }

  function renderEssay(task) {
    const essay = data.essays.find(item => item.task === task);
    if (!essay) return;
    document.querySelectorAll('[data-essay]').forEach(button => button.setAttribute('aria-selected', String(Number(button.dataset.essay) === task)));
    const guide = new Map(essay.guide.map(row => [row[0], row]));
    const paragraphs = essay.paragraphs.map(paragraph => {
      const exact = guide.get(paragraph);
      if (exact) return sentenceMarkup(exact);
      if (/^(Turning|Growth)/.test(paragraph) || paragraph === essay.title) return `<h4>${escapeHtml(paragraph)}</h4>`;
      if (/^(Dear |Yours sincerely|\(Continuation)/.test(paragraph)) return `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`;
      const rows = essay.guide.filter(row => paragraph.includes(row[0]));
      let output = escapeHtml(paragraph);
      rows.forEach((row, index) => { output = output.replace(escapeHtml(row[0]), `<button class="essay-sentence" data-guide="${index}">${escapeHtml(row[0])}</button>`); });
      return `<p>${output}</p><div class="essay-guide-stack">${rows.map((row, index) => `<aside id="guide-${task}-${index}"><b>Why it works</b><span>${escapeHtml(row[1])}</span><small>Evidence: ${escapeHtml(row[2])}</small></aside>`).join('')}</div>`;
    }).join('');
    document.querySelector('#essay-view').innerHTML = `<article class="model-essay"><p class="essay-source">Revised benchmark PDF · final reviewed version</p><h3>Task ${task} · ${escapeHtml(essay.title)}</h3>${paragraphs}</article>`;
  }

  function sentenceMarkup(row) {
    return `<p><button class="essay-sentence">${escapeHtml(row[0])}</button></p><aside class="essay-guide-stack"><b>Why it works</b><span>${escapeHtml(row[1])}</span><small>Evidence: ${escapeHtml(row[2])}</small></aside>`;
  }

  function indexSourceUnits() {
    const selectors = 'h2,h3,h4,h5,p,li,th,td,dt,dd,figcaption';
    const units = [];
    document.querySelectorAll('.paper-page .native-document').forEach(documentPage => {
      const pageArticle = documentPage.closest('.paper-page');
      const page = Number(pageArticle.id.replace('page-', ''));
      documentPage.querySelectorAll(selectors).forEach((element, localIndex) => {
        if (element.lang === 'zh-Hant' || element.classList.contains('translation') || element.closest('.translation') || element.querySelector('textarea, input') || element.closest('.curation-unit')) return;
        const text = clean(element.textContent);
        if (!text) return;
        const type = classify(text, page);
        const id = `${page}-${localIndex}`;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `curation-tag type-${type}`;
        button.dataset.unit = id;
        button.setAttribute('aria-label', `類型 ${type}：${data.types[type].label}`);
        button.innerHTML = `<b>${type}</b><span>${data.types[type].short}</span>`;
        button.addEventListener('click', () => openDrawer({ id, type, text, page }));
        element.classList.add('curation-unit');
        element.append(button);
        units.push({ id, type, text, page });
      });
    });
    const counts = units.reduce((result, unit) => ({ ...result, [unit.type]: (result[unit.type] || 0) + 1 }), {});
    const output = document.querySelector('#curation-coverage');
    if (output) output.textContent = `${units.length} 個原文單位 · 六類全覆蓋 · ${Object.entries(counts).map(([type, count]) => `T${type} ${count}`).join(' / ')}`;
    window.EDMUND_2022_B2_SOURCE_UNITS = units;
  }

  function openDrawer(unit) {
    let drawer = document.querySelector('#curation-drawer');
    if (!drawer) {
      drawer = document.createElement('aside');
      drawer.id = 'curation-drawer';
      drawer.className = 'curation-drawer';
      drawer.setAttribute('aria-live', 'polite');
      document.body.append(drawer);
    }
    const type = data.types[unit.type];
    const bookmarked = state.bookmarks.includes(unit.id);
    drawer.innerHTML = `<button class="drawer-close" aria-label="關閉分析">×</button><p class="drawer-type type-${unit.type}">類型 ${unit.type} · ${type.label}</p><blockquote>${escapeHtml(unit.text)}</blockquote><h3>為甚麼這樣分？</h3><p>${escapeHtml(reason(unit.type, unit.text, unit.page))}</p><h3>Next step</h3><p>${escapeHtml(type.next)}</p><button class="bookmark-unit" aria-pressed="${bookmarked}">${bookmarked ? '已收藏' : '收藏這項證據'}</button>`;
    drawer.querySelector('.drawer-close').addEventListener('click', () => drawer.remove());
    drawer.querySelector('.bookmark-unit').addEventListener('click', event => {
      state.bookmarks = state.bookmarks.includes(unit.id) ? state.bookmarks.filter(id => id !== unit.id) : [...state.bookmarks, unit.id];
      save();
      event.currentTarget.textContent = state.bookmarks.includes(unit.id) ? '已收藏' : '收藏這項證據';
      event.currentTarget.setAttribute('aria-pressed', String(state.bookmarks.includes(unit.id)));
    });
  }

  mountShell();
  indexSourceUnits();
}());
