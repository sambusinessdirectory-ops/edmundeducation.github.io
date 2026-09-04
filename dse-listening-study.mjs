// Bilingual answer guides are fetched only when their year is opened.
const guideCounts = new Map([[2012,53],[2013,58],[2014,60],[2015,58],[2016,58],[2017,54],[2018,51],[2019,53],[2020,52],[2021,56],[2023,53]]);
const guideUrls = new Map([...guideCounts.keys()].map(year => [year, new URL(`./assets/dse-listening/${year}/guide.json?v=20260904-archiveguides1`, import.meta.url)]));
const guides = new Map(), pending = new Map(), failures = new Set();
export const getDseGuide = year => guides.get(Number(year));
export const hasDseGuide = year => guideUrls.has(Number(year));
export const dseGuideFailed = year => failures.has(Number(year));
export async function loadDseGuide(year) {
  year = Number(year);
  if (!guideUrls.has(year)) return null;
  if (guides.has(year)) return guides.get(year);
  if (!pending.has(year)) {
    failures.delete(year);
    pending.set(year, fetch(guideUrls.get(year)).then(async response => {
      if (!response.ok) throw new Error(`DSE guide HTTP ${response.status}`);
      const guide = await response.json();
      if (guide.year !== year || Object.keys(guide.analysis || {}).length !== guideCounts.get(year) || ![1, 2, 3, 4].every(task => guide.transcript?.[task]?.length)) throw new Error('Incomplete DSE guide');
      guides.set(year, guide);
      return guide;
    }).catch(error => { failures.add(year); throw error; }).finally(() => pending.delete(year)));
  }
  return pending.get(year);
}

export function dseBookmarkHref(year, task, anchor = '') {
  return `listening-system.html?section=dse&year=${Number(year)}&task=${Number(task)}${anchor ? `#${anchor}` : ''}`;
}

export const dseAnswerReplayStart = time => Number.isFinite(time) && time >= 0 ? Math.max(0, time - 15) : null;

export function createDseStudy({state, escapeHtml: esc, playCue = () => {}}) {
  const preferences = new Map();
  let binding;
  function prefs(year, task) {
    const key = `${year}:${task}`;
    if (!preferences.has(key)) preferences.set(key, {answers: new Set(), zh: false, questionZh: false, full: false});
    return preferences.get(key);
  }
  function bookmark(year, task, key, title, detail, anchor, label) {
    const item = `dse${year}:${key}`;
    const active = state.listeningBookmarks.has(item);
    return `<button type="button" class="bookmark-entry" data-bookmark-item="${item}" data-bookmark-title="${esc(title)}" data-bookmark-detail="${esc(detail)}" data-bookmark-href="${dseBookmarkHref(year, task, anchor)}" data-bookmarked="${active}" aria-label="${esc(label)}">${active ? '★' : '☆'} ${esc(label)}</button>`;
  }
  function analysisBookmark(year, task, number, analysis) {
    return bookmark(year, task, `analysis:q${number}`, `${year} DSE · Task ${task} · 第 ${number} 題解析`, `${analysis.answer}\n${analysis.explanation}`, `dse-analysis-q${number}`, '收藏解析');
  }
  function replayButton(number, row) {
    return dseAnswerReplayStart(row.audioTime) === null ? '' : `<button class="secondary-button dse-answer-replay" type="button" data-dse-answer-replay="${number}" aria-label="第 ${number} 題：從答案前 15 秒播放">▶ 答案前 15 秒</button>`;
  }
  function renderAnalysis(year, task) {
    const guide = getDseGuide(year);
    if (!guide) return '';
    const entries = Object.entries(guide.analysis).filter(([, row]) => row.task === task);
    return `${guide.analysisNote ? `<p class="dse-guide-note">${esc(guide.analysisNote)}</p>` : ''}<div class="dse-study-toolbar"><button class="secondary-button" type="button" data-dse-all-answers>顯示全部答案</button><button class="secondary-button" type="button" data-dse-hide-answers>隱藏全部答案</button><a class="secondary-button" href="#dse-transcript-title">前往錄音稿 ↓</a></div>
    <details class="listening-analysis dse-study-analysis" data-dse-full-analysis${prefs(year, task).full ? ' open' : ''}><summary>Task ${task} 完整答案解析 · ${entries.length} 題</summary><div class="listening-analysis-grid">${entries.map(([number, row]) => `<article class="listening-analysis-card" id="dse-analysis-q${number}"><div class="listening-analysis-card__head"><span>${number}</span><div><small>參考答案</small><strong>${esc(row.answer)}</strong></div>${analysisBookmark(year, task, number, row)}</div><p>${esc(row.explanation)}</p>${replayButton(number, row)}</article>`).join('')}</div></details>
    <aside class="answer-analysis-dialog dse-study-dialog" data-dse-study-dialog hidden role="dialog" aria-label="DSE 答案解析"><button type="button" data-dse-close-analysis aria-label="關閉解析">×</button><p class="eyebrow" data-dse-dialog-title></p><h3>答案：<span data-dse-dialog-answer></span></h3><p data-dse-dialog-copy></p><div class="answer-analysis-dialog__actions" data-dse-dialog-actions></div></aside>`;
  }
  function renderTranscript(year, task) {
    const guide = getDseGuide(year);
    if (!guide) return '';
    const p = prefs(year, task);
    return `<section class="listening-transcript dse-transcript" aria-labelledby="dse-transcript-title"><div class="listening-transcript__head"><div><p class="eyebrow">TRANSCRIPT · 錄音稿</p><div class="transcript-title-row"><h3 id="dse-transcript-title">Task ${task} 錄音稿</h3><button class="transcript-sync-toggle" type="button" data-toggle-transcript-sync aria-pressed="${state.syncHighlights}">同步高亮：${state.syncHighlights ? '開' : '關'}</button><button class="secondary-button" type="button" data-dse-toggle-zh aria-pressed="${p.zh}">${p.zh ? '隱藏' : '顯示'}中文翻譯</button></div></div><p>${esc(guide.transcriptNote || 'Edmund Sir 題解書原文及繁體中文翻譯。點擊一行可跳到相應錄音附近。')}</p></div><div class="transcript-lines" data-dse-transcript>${guide.transcript[task].map((row, index) => `<div class="transcript-line" id="dse-transcript-${task}-${index}" role="button" tabindex="0" data-dse-transcript-line="${index}" data-start="${row.start}" data-end="${row.end}"><div class="transcript-line__top"><div><strong class="dse-speaker">${esc(row.speaker)}</strong><span>${esc(row.text)}</span></div>${bookmark(year, task, `transcript:t${task}:line:${index}`, `${year} DSE · Task ${task} · 錄音稿第 ${index + 1} 行`, `${row.speaker}: ${row.text}\n${row.zh}`, `dse-transcript-${task}-${index}`, '收藏此行')}</div><small lang="zh-Hant" data-dse-zh${p.zh ? '' : ' hidden'}>${esc(row.zh)}</small></div>`).join('')}</div></section>`;
  }
  function mount(host, year, task) {
    binding?.abort();
    binding = new AbortController();
    const guide = getDseGuide(year);
    if (!guide) return;
    const signal = binding.signal, p = prefs(year, task);
    const dialog = host.querySelector('[data-dse-study-dialog]');
    if (!dialog) return;
    const questions = guide.questions?.[task], sheet = host.querySelector('.dse-paper-sheet');
    if (questions && sheet) {
      // Collect the original blocks before inserting translations. Do not clone
      // answer inputs or replace the English question/illustration markup.
      const blocks = [...sheet.children];
      sheet.insertAdjacentHTML('beforebegin', `<div class="dse-study-toolbar"><button type="button" class="secondary-button" data-dse-toggle-question-zh aria-pressed="${p.questionZh}">${p.questionZh ? '隱藏' : '顯示'}題目中文翻譯</button></div><div class="dse-question-translation" data-dse-question-zh lang="zh-Hant"${p.questionZh ? '' : ' hidden'}><strong>${esc(questions.title)}</strong><p>${esc(questions.instruction)}</p></div>`);
      blocks.forEach((block, i) => {
        const text = questions.blocks[i];
        if (!text) return;
        const translated = esc(text).replace(/\{\{(\d+)\}\}/g, '<span class="dse-translated-blank">（$1）______</span>');
        block.insertAdjacentHTML('afterend', `<div class="dse-question-translation" data-dse-question-zh lang="zh-Hant"${p.questionZh ? '' : ' hidden'}>${translated}</div>`);
      });
    }
    const entries = Object.entries(guide.analysis).filter(([, row]) => row.task === task);
    const lastTools = new Map();
    for (const [number, row] of entries) {
      const input = host.querySelector(`[data-dse-answer-q="${number}"]`);
      // Group choices, ordering, ranking and maze tasks have shared controls,
      // rather than a text input per question. Keep tools outside those labels.
      const group = [...host.querySelectorAll('[data-dse-answer-group],[data-dse-order-group]')].find(node => (node.dataset.dseAnswerGroup || node.dataset.dseOrderGroup).split(',').includes(number));
      const special = host.querySelector(`[data-dse-ranking="${number}"],[data-dse-maze-q="${number}"]`);
      const anchor = input ? (['radio','checkbox'].includes(input.type) ? input.closest('.dse-multiple-choice') : input.closest('label') || input) : group?.closest('.dse-answer-group') || special?.closest('.dse-answer-group,.dse-maze');
      if (!anchor) continue;
      const previous = lastTools.get(anchor) || anchor;
      previous.insertAdjacentHTML('afterend', `<span class="single-answer-tools dse-answer-tools">${!input ? `<b class="dse-group-answer-number">${number}</b>` : ''}<button class="single-answer-reveal" type="button" data-dse-reveal="${number}" aria-pressed="${p.answers.has(number)}">${p.answers.has(number) ? '隱藏答案' : '看答案'}</button><button class="listening-official-answer" type="button" data-dse-analysis="${number}"${p.answers.has(number) ? '' : ' hidden'} aria-label="查看第 ${number} 題解析">答案：<strong>${esc(row.answer)}</strong><span>查看解析</span></button></span>`);
      lastTools.set(anchor, previous.nextElementSibling);
    }
    const refresh = () => {
      for (const [number] of entries) {
        const reveal = host.querySelector(`[data-dse-reveal="${number}"]`);
        const answer = host.querySelector(`[data-dse-analysis="${number}"]`);
        if (reveal) { reveal.setAttribute('aria-pressed', String(p.answers.has(number))); reveal.textContent = p.answers.has(number) ? '隱藏答案' : '看答案'; }
        if (answer) answer.hidden = !p.answers.has(number);
      }
    };
    function openAnalysis(button) {
      const number = button.dataset.dseAnalysis, row = guide.analysis[number];
      dialog.querySelector('[data-dse-dialog-title]').textContent = `${year} · Task ${task} · 第 ${number} 題`;
      dialog.querySelector('[data-dse-dialog-answer]').textContent = row.answer;
      dialog.querySelector('[data-dse-dialog-copy]').textContent = row.explanation;
      dialog.querySelector('[data-dse-dialog-actions]').innerHTML = replayButton(number, row) + analysisBookmark(year, task, number, row);
      dialog.hidden = false;
      const rect = button.getBoundingClientRect(), width = Math.min(480, window.innerWidth - 24);
      dialog.style.width = `${width}px`;
      dialog.style.left = `${Math.max(12, Math.min(window.innerWidth - width - 12, rect.left))}px`;
      dialog.style.top = `${Math.max(12, Math.min(window.innerHeight - dialog.offsetHeight - 12, rect.bottom + 8))}px`;
    }
    host.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (!button) return;
      if (button.matches('[data-dse-reveal]')) {
        const number = button.dataset.dseReveal;
        if (p.answers.has(number)) p.answers.delete(number); else p.answers.add(number);
        dialog.hidden = true; refresh();
      } else if (button.matches('[data-dse-all-answers]')) { entries.forEach(([number]) => p.answers.add(number)); refresh(); }
      else if (button.matches('[data-dse-hide-answers]')) { p.answers.clear(); dialog.hidden = true; refresh(); }
      else if (button.matches('[data-dse-analysis]')) openAnalysis(button);
      else if (button.matches('[data-dse-answer-replay]')) playCue(year, task, Number(button.dataset.dseAnswerReplay));
      else if (button.matches('[data-dse-close-analysis]')) dialog.hidden = true;
      else if (button.matches('[data-dse-toggle-question-zh]')) {
        p.questionZh = !p.questionZh;
        button.setAttribute('aria-pressed', String(p.questionZh));
        button.textContent = `${p.questionZh ? '隱藏' : '顯示'}題目中文翻譯`;
        host.querySelectorAll('[data-dse-question-zh]').forEach(row => { row.hidden = !p.questionZh; });
      }
      else if (button.matches('[data-dse-toggle-zh]')) {
        p.zh = !p.zh;
        button.setAttribute('aria-pressed', String(p.zh)); button.textContent = `${p.zh ? '隱藏' : '顯示'}中文翻譯`;
        host.querySelectorAll('[data-dse-zh]').forEach(row => { row.hidden = !p.zh; });
      }
    }, {signal});
    host.addEventListener('mouseover', event => { const button = event.target.closest('[data-dse-analysis]'); if (button && !button.hidden) openAnalysis(button); }, {signal});
    host.addEventListener('focusin', event => { if (event.target.matches('[data-dse-analysis]')) openAnalysis(event.target); }, {signal});
    document.addEventListener('click', event => { if (!dialog.contains(event.target) && !event.target.closest('[data-dse-analysis]')) dialog.hidden = true; }, {signal});
    document.addEventListener('keydown', event => { if (event.key === 'Escape') dialog.hidden = true; }, {signal});
    host.querySelector('[data-dse-full-analysis]').addEventListener('toggle', event => { p.full = event.target.open; }, {signal});
    // Links saved in the shared bookmark library return to this exact task/card.
    const anchor = /^#dse-(?:analysis-q\d+|transcript-[1-4]-\d+)$/.test(location.hash) ? host.querySelector(location.hash) : null;
    if (anchor) {
      const details = anchor.closest('details');
      if (details) details.open = true;
      requestAnimationFrame(() => anchor.scrollIntoView({block: 'start'}));
    }
  }
  return {renderAnalysis, renderTranscript, mount};
}
