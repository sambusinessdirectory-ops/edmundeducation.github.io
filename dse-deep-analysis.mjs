// The reading interface is an additional view over the source, never a summary.
export const DEEP_ANALYSIS_ARTICLES = new Set(['dse-2023-a']);
const CATEGORIES = { task: '讀懂題目', answer: '參考答案', evidence: '原文證據', reasoning: '逐步推理', traps: '拆解陷阱', technique: '答題技巧' };
const PARAGRAPHS = [[1],[1],[1],[1],[2,3,4],[4],[5],[6],[7],[9],[9],[10],[10,12],[11],[11],[12,13],[15],[14,15],[12,16],[10,11,12,14,15,16],[2,4,5,6,7,8,10,11,12,13,14,15,16],[11,12,13,15,16]];
const cache = new Map();
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
export function sourceBody(page) { return page.body.join('\n'); }
export function pageCategories(page) {
  const body = sourceBody(page);
  const tags = new Set([page.category]);
  if (/原文定位|對應原文|^原文[：說]|^Paragraph \d/m.test(body)) tags.add('evidence');
  if (/常見(?:錯|誤)|陷阱|為甚麼(?:不|[A-D] 不)/.test(body)) tags.add('traps');
  if (/Edmund Reading 技巧|reasoning chain|技巧總結/.test(body)) tags.add('technique');
  if (/^答案[：重]?/m.test(body)) tags.add('answer');
  return [...tags];
}
export function findPages(pages, query) {
  const needle = query.trim().toLocaleLowerCase();
  return needle ? pages.filter(p => p.text.toLocaleLowerCase().includes(needle)) : pages;
}
function highlight(text, query) {
  if (!query.trim()) return esc(text);
  const needle = query.trim(); const haystack = text.toLocaleLowerCase(); let from = 0; let output = ''; let at;
  while ((at = haystack.indexOf(needle.toLocaleLowerCase(), from)) !== -1) {
    output += esc(text.slice(from, at)) + '<mark>' + esc(text.slice(at, at + needle.length)) + '</mark>'; from = at + needle.length;
  }
  return output + esc(text.slice(from));
}

export function renderRichBody(page, query = '') {
  if (!page.richBody) return page.body.map(line => '<div>' + highlight(line,query) + '</div>').join('');
  const palette = new Set(['yellow','pink','cyan','green','orange','lavender']);
  return page.richBody.map(row => {
    const gap = Math.min(1.8, Math.max(0, (Number(row.gap) - 6) / 22));
    // A terminal full stop has no advance width, but stays visible beside its
    // preceding character. Only layout changes: source text is never removed.
    const lastRun = row.runs.findLastIndex(run => run.text.trim());
    const runs = row.runs.map((run, index) => {
      const style = run.style || {};
      const scale = Math.min(1.7, Math.max(.93, (Number(style.size) || 14) / 14));
      const ending = index === lastRun && run.text.match(/([^\s。．.])([。．.])(\s*)$/u);
      let text = ending
        ? highlight(run.text.slice(0, ending.index), query) +
          '<span class="deep-sentence-end">' + highlight(ending[1], query) +
          '<span class="deep-hanging-stop">' + highlight(ending[2], query) +
          '</span></span>' + highlight(ending[3], query)
        : highlight(run.text,query);
      if (style.bold) text = '<strong>' + text + '</strong>';
      if (style.italic) text = '<em>' + text + '</em>';
      const color = palette.has(style.highlight) ? ' source-highlight source-highlight-' + style.highlight : '';
      return '<span class="deep-source-run' + color + '" style="font-size:' + scale.toFixed(3) + 'em">' + text + '</span>';
    }).join('');
    return '<div class="deep-rich-line" style="margin-top:' + gap.toFixed(2) + 'em">' + runs + '</div>';
  }).join('');
}

export function createDeepAnalysisReader() {
  const dialog = document.createElement('dialog'); dialog.className = 'deep-reader';
  dialog.setAttribute('aria-labelledby', 'deep-title'); document.body.append(dialog);
  let data, question, article, answers, userId, selected = 0, mode = 'guided', query = '', category = '', openedBy, progress = {}, supplement = false;
  let request = 0;
  const $ = selector => dialog.querySelector(selector);
  const pages = () => (supplement ? data.supplementaryPages : question.pages).map(n => data.pages[n-1]);
  const key = () => `edmund-deep-reading:${data.version}:${userId}:${article.id}:q${question.number}`;
  function storeProgress() { try { localStorage.setItem(key(), JSON.stringify(progress)); } catch { $('[data-deep-storage]').textContent = '此瀏覽器不能儲存閱讀進度；仍可繼續研讀。'; } }
  function close() { request++; if (dialog.open) dialog.close(); }
  dialog.addEventListener('close', () => { document.documentElement.classList.remove('deep-reader-open'); if (openedBy?.isConnected) openedBy.focus({ preventScroll: true }); });
  dialog.addEventListener('cancel', () => { request++; });
  function shell() {
    dialog.innerHTML = `<header class="deep-header"><div><p class="deep-eyebrow">EDMUND · DEEP READING LAB</p><h2 id="deep-title">第 ${question.number} 題 · 深度研讀</h2></div><button type="button" data-deep-close aria-label="關閉深度解析，返回作答">✕ <span>返回作答</span></button></header>
      <div class="deep-scroll"><section class="deep-intro"><p>${esc(article.title)}</p><h3>不只知道答案，更要讀懂每一步。</h3><p>完整保留本題 ${question.pages.length} 頁解說 · 原書第 ${question.startPage}–${question.endPage} 頁。分類只是導航，不是刪節。</p></section>
      <details class="deep-comparison" open><summary>你的作答 ↔ 參考答案</summary><div class="deep-compare-grid"><section><h3>你的作答</h3><p class="deep-verbatim">${esc(answers)}</p></section><section><h3>原書答案總表 · p.34</h3><p class="deep-verbatim">${esc(question.answer)}</p><small>供自行核對；開放題不以字面相同自動判錯。</small></section></div>${question.number === 21 ? '<p class="deep-source-note">原書總表列出 good example，但第 280–301 頁的完整解說同時接受 good / not good 兩條有證據的路線。兩者均完整保留，請一起閱讀。</p>' : ''}</details>
      <div class="deep-toolbar"><div class="deep-modes" role="group" aria-label="閱讀模式"><button type="button" data-deep-mode="guided">逐步研讀</button><button type="button" data-deep-mode="full">本題全文</button><button type="button" data-deep-mode="original">原頁對照</button></div><label class="deep-search">搜尋完整解說<input type="search" data-deep-search placeholder="例如 unless、陷阱、mumbled" autocomplete="off"></label><button type="button" data-deep-clear>清除搜尋</button><label>字級<select data-deep-font><option value="normal">標準</option><option value="large">大字</option><option value="larger">特大</option></select></label></div>
      <p class="deep-emphasis-legend"><span class="source-highlight source-highlight-yellow">黃</span> <span class="source-highlight source-highlight-pink">粉紅</span> <span class="source-highlight source-highlight-cyan">青藍</span> · 保留原稿重點標示、粗體及文字大小層次；搜尋命中另加紫色外框。</p><div class="deep-workspace"><aside class="deep-map"><h3>研讀路線</h3><p>按主題找方向；按步驟讀完整內容。同一步可包含多種解說。</p><div class="deep-categories" role="group" aria-label="按解說功能篩選"></div><p data-deep-count role="status"></p><nav data-deep-steps aria-label="本題所有研讀步驟"></nav><details class="deep-context"><summary>對照閱讀原文</summary>${article.paragraphs.filter(p => PARAGRAPHS[question.number-1].includes(p.number)).map(p=>`<section><h4>Paragraph ${p.number}</h4><p>${esc(p.text)}</p></section>`).join('')}</details><p class="deep-local-note" data-deep-storage>「已理解」進度只儲存在此裝置及此學生帳戶，不影響試卷分數。</p><progress data-deep-progress max="${question.pages.length}" value="0" aria-label="已標記理解的研讀步驟"></progress><p data-deep-progress-label></p><details><summary>完整來源及補充內容</summary><p>原文、翻譯、總表及第 16–22 題總結亦未刪除。</p><button type="button" data-deep-supplement>閱讀補充頁</button><a href="dse-reading-analysis/${esc(article.id)}/original.pdf" target="_blank" rel="noopener">開啟完整原版 PDF（322 頁） ↗</a></details></aside><main class="deep-main" data-deep-main tabindex="-1"></main></div></div><footer class="deep-footer"><span data-deep-position aria-live="polite"></span><button type="button" data-deep-prev>← 上一步</button><button type="button" data-deep-understood>✓ 標記已理解</button><button type="button" data-deep-next>下一步 →</button></footer>`;
    render();
  }
  function original(page) { return `<a class="deep-original-link" href="dse-reading-analysis/${esc(article.id)}/${page.image}" target="_blank" rel="noopener"><img src="dse-reading-analysis/${esc(article.id)}/${page.image}" alt="原書第 ${page.number} 頁；完整文字於研讀模式提供" loading="lazy"><span>點擊放大原書第 ${page.number} 頁 ↗</span></a>`; }
  function renderPage(page, full = false) {
    // All body lines are rendered verbatim. Original furniture is retained, not dropped.
    return `<article class="deep-page" data-category="${page.category}" id="deep-page-${page.number}"><header><span class="deep-category">${CATEGORIES[page.category]}</span><span>原書 p.${page.number}</span></header>${mode === 'original' ? original(page) : `<div class="deep-source-body" lang="zh-Hant">${renderRichBody(page,query)}</div><details class="deep-original"><summary>查看本頁原版排版、顏色與重點標示</summary><template data-deep-image="${page.number}"></template></details>`}<details class="deep-furniture"><summary>原頁頁眉、頁尾及出處（完整保留）</summary><p class="deep-verbatim">${highlight([...page.header,...page.footer].join('\n'),query)}</p></details>${full ? `<button type="button" data-deep-page-mark="${page.number}" aria-pressed="${!!progress[page.number]}">${progress[page.number] ? '✓ 已理解' : '標記本頁已理解'}</button>` : ''}</article>`;
  }
  function renderNavigation() {
    const list = pages();
    const filtered = findPages(list,query).filter(p=>!category || pageCategories(p).includes(category));
    $('.deep-categories').innerHTML = `<button type="button" data-deep-category="" aria-pressed="${!category}">全部 ${list.length}</button>` + Object.entries(CATEGORIES).map(([id,label])=>`<button type="button" data-deep-category="${id}" aria-pressed="${category===id}">${label} ${list.filter(p=>pageCategories(p).includes(id)).length}</button>`).join('');
    $('[data-deep-count]').textContent = `${supplement ? '補充內容' : '本題內容'} · 顯示 ${filtered.length} / ${list.length} 步${query ? '（搜尋亦包含頁眉及頁尾）' : ''}`;
    $('[data-deep-steps]').innerHTML = filtered.length ? filtered.map(p=>`<button type="button" data-deep-step="${list.indexOf(p)}" ${list[selected]===p ? 'aria-current="step"' : ''}><span>${progress[p.number] ? '✓' : list.indexOf(p)+1}</span><span>${esc(p.title)}<small>原書 p.${p.number} · ${CATEGORIES[p.category]}</small></span></button>`).join('') : '<p>沒有相符內容。清除搜尋或選擇「全部」即可返回完整路線。</p>';
    return filtered;
  }
  function render() {
    const list = pages(); selected = Math.min(selected,list.length-1);
    const filtered = renderNavigation(); const page = list[selected];
    dialog.querySelectorAll('[data-deep-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.deepMode===mode)));
    $('[data-deep-main]').innerHTML = mode === 'full' ? `<p class="deep-source-note">全文模式不受左方分類或搜尋篩選限制：以下顯示${supplement ? '所有補充頁' : '本題全部解說'}，搜尋詞會標亮。</p>${list.map(p=>renderPage(p,true)).join('')}` : `${query || category ? `<p class="deep-source-note">左方有 ${filtered.length} 個相符步驟。正在閱讀第 ${selected+1} 步；上／下一步仍依原書完整順序。</p>` : ''}${renderPage(page)}`;
    $('[data-deep-position]').textContent = `${supplement ? '補充' : '研讀'} ${selected+1} / ${list.length} · p.${page.number}`;
    $('[data-deep-prev]').disabled = selected===0; $('[data-deep-next]').disabled=selected===list.length-1;
    $('[data-deep-understood]').hidden = mode==='full' || supplement;
    $('[data-deep-understood]').textContent = progress[page.number] ? '✓ 已理解（取消標記）' : '✓ 標記已理解';
    $('[data-deep-understood]').setAttribute('aria-pressed',String(!!progress[page.number]));
    const completed=question.pages.filter(n=>progress[n]).length;
    $('[data-deep-progress]').value=completed; $('[data-deep-progress-label]').textContent=`已理解 ${completed} / ${question.pages.length} 步`;
    $('[data-deep-supplement]').textContent=supplement ? '返回本題解說' : '閱讀補充頁';
  }
  function focusContent() { $('[data-deep-main]').focus({preventScroll:true}); $('[data-deep-main]').scrollIntoView({block:'start',behavior:'instant'}); }
  dialog.addEventListener('click', event=>{
    const button=event.target.closest('button'); if(!button) return;
    if(button.hasAttribute('data-deep-close')) return close();
    if(button.hasAttribute('data-deep-retry')) return open(article,question.number,userId,answers,openedBy);
    if(button.dataset.deepMode) { mode=button.dataset.deepMode; render(); return focusContent(); }
    if(button.hasAttribute('data-deep-category')) { category=button.dataset.deepCategory; renderNavigation(); return; }
    if(button.hasAttribute('data-deep-clear')) { query='';category='';$('[data-deep-search]').value='';render();$('[data-deep-search]').focus();return; }
    if(button.hasAttribute('data-deep-step')) { selected=Number(button.dataset.deepStep); if(mode==='full') mode='guided';render();return focusContent(); }
    if(button.hasAttribute('data-deep-prev') || button.hasAttribute('data-deep-next')) { selected += button.hasAttribute('data-deep-next') ? 1 : -1; if(mode==='full') mode='guided'; render();return focusContent(); }
    if(button.hasAttribute('data-deep-understood') || button.hasAttribute('data-deep-page-mark')) { const n=Number(button.dataset.deepPageMark)||pages()[selected].number;progress[n]=!progress[n];storeProgress();const y=$('.deep-scroll').scrollTop;render();$('.deep-scroll').scrollTop=y; (button.hasAttribute('data-deep-page-mark') ? $(`[data-deep-page-mark="${n}"]`) : $('[data-deep-understood]'))?.focus({preventScroll:true});return; }
    if(button.hasAttribute('data-deep-supplement')) { supplement=!supplement;selected=0;category='';query='';$('[data-deep-search]').value='';render();focusContent(); }
  });
  dialog.addEventListener('input', event=>{if(event.target.matches('[data-deep-search]')) {query=event.target.value;render();}});
  dialog.addEventListener('change', event=>{if(event.target.matches('[data-deep-font]')) dialog.dataset.font=event.target.value;});
  dialog.addEventListener('toggle',event=>{
    if(event.target.matches('.deep-original') && event.target.open) { const template=event.target.querySelector('template'); if(template) template.outerHTML=original(data.pages[Number(template.dataset.deepImage)-1]); }
  },true);
  async function open(nextArticle, number, nextUserId, nextAnswers, trigger=document.activeElement) {
    article=nextArticle; userId=nextUserId; answers=nextAnswers; openedBy=trigger; question={number};
    selected=0;mode='guided';query='';category='';supplement=false; progress={};
    const ticket=++request;
    dialog.innerHTML='<header class="deep-header"><h2 id="deep-title">正在載入完整解析…</h2><button type="button" data-deep-close>返回作答</button></header><p class="deep-loading" role="status">正在準備原文、逐步研讀及原版頁面。</p>';
    if(!dialog.open) dialog.showModal(); document.documentElement.classList.add('deep-reader-open');
    try {
      if(!cache.has(article.id)) { const response=await fetch(`dse-reading-analysis/${encodeURIComponent(article.id)}/index.json?v=20260904-emphasis1`);if(!response.ok) throw new Error('Analysis unavailable');const result=await response.json();if(result.articleId!==article.id || !result.questions?.length) throw new Error('Analysis mismatch');cache.set(article.id,result); }
      if(ticket!==request || !dialog.open) return;
      data=cache.get(article.id); question=data.questions.find(q=>q.number===number);if(!question) throw new Error('Question unavailable');
      try { const saved=JSON.parse(localStorage.getItem(key())||'{}'); if(saved && typeof saved==='object' && !Array.isArray(saved)) progress=saved; } catch {}
      shell(); $('[data-deep-close]').focus();
    } catch {
      if(ticket!==request || !dialog.open) return;
      dialog.innerHTML='<header class="deep-header"><h2 id="deep-title">解析暫時未能載入</h2><button type="button" data-deep-close>返回作答</button></header><p class="deep-loading">你的作答仍然保留。請檢查連線後重試。</p><button type="button" data-deep-retry>重試載入完整解析</button>';
    }
  }
  return {open,close};
}
