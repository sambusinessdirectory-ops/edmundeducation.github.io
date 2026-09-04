(() => {
  'use strict';
  const core = window.EdmundSentenceAnalysis;
  const data = window.EDMUND_B2_SENTENCE_ANALYSIS;
  if (!core || !data) return;
  const sections = {1:'cover',2:'orientation',3:'listening-notes',4:'boss-letter',
    5:'duncan-henley-emails',6:'wellness-poster',7:'student-interview',8:'whatsapp-chat',
    9:'duncan-singh-emails',10:'influator-blog',11:'sports-article'};
  const side = document.querySelector('.side');
  const mobile = window.matchMedia('(max-width:1100px)');
  const items = new WeakMap();
  let selected = null;
  let returnFocus = null;
  const panel = document.createElement('aside');
  panel.id = 'sentence-analysis-panel';
  panel.className = 'sentence-analysis-panel';
  panel.setAttribute('aria-label','逐句分析');
  panel.hidden = true;
  const heading = document.createElement('header');
  const title = document.createElement('h2');
  title.textContent = '逐句分析';
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'sentence-analysis-close';
  close.textContent = '關閉 ×';
  close.setAttribute('aria-label','關閉逐句分析');
  heading.append(title, close);
  const content = document.createElement('div');
  content.className = 'sentence-analysis-content';
  panel.append(heading, content);
  side.prepend(panel);
  const instruction = document.createElement('p');
  instruction.className = 'sentence-analysis-instruction';
  instruction.textContent = '逐句分析 · 游標移到 Data File 原文可標示句子，按一下查看分析。手機可直接輕觸；鍵盤可用 Tab、Enter 及 Esc。';
  document.querySelector('.toolbar').after(instruction);
  const status = document.createElement('p');
  status.className = 'visually-hidden';
  status.setAttribute('role','status');
  instruction.after(status);

  const createText = (tag, text, className) => {
    const element = document.createElement(tag);
    element.textContent = text;
    if (className) element.className = className;
    return element;
  };
  function guides(text, section, page) {
    if (/^(?:dear |hi |hey |thanks,|good luck with|mr duncan$|john$|melissa$|manraj$)/i.test(text.trim())) {
      return [{section,quote:text,supplemental:true,originalPage:page,blocks:[
        '這是電郵稱呼、禮貌結語或署名，用來辨認收件人、寄件人和溝通關係，並不是三項寫作的內容點。正式作答應按各自的讀者及文類另行安排稱呼與結語。']}];
    }
    if (section === 'cover') {
      let note = '這是原卷的應試或交卷安排，不是三項寫作的內容點。';
      if (/General Instructions/.test(text)) note += '完整一般指示應參照 Part A 問答冊第 1 頁。';
      else if (/inserted/.test(text)) note += '原卷說明 B2 問答冊夾在 Data File 內；本重建頁並未提供正式問答冊，不應把下方額外練習區當作原卷。';
      else if (/attempt EITHER/.test(text)) note += 'Part B 在 B1 和 B2 之間二選一，不是兩部分都作答。';
      else if (/pen/.test(text)) note += '原卷建議 Part B 使用原子筆作答。';
      else if (/NOT be collected/.test(text)) note += 'Data File 不會收回，因此不能把它當作正式交卷的答案冊。';
      else if (/Do NOT write/.test(text)) note += '正式答案須寫在問答冊，不是 Data File。';
      else if (/Hand in/.test(text)) note += '只交一份 Part B 問答冊（B1 或 B2），並按指示與 Part A 問答冊綁在一起。';
      return [{quote:text,supplemental:true,originalPage:1,blocks:[note]}];
    }
    return [];
  }
  function recordsFor(text, section, page, contextText) {
    const administrative = guides(text,section,page);
    if (administrative.length) return administrative;
    return core.matchRecords(text,section,data.records,contextText);
  }
  function placePanel() {
    if (!selected) return;
    if (mobile.matches) {
      const block = items.get(selected).block;
      const anchor = block.closest('.poster, .definition') || block.closest('.bilingual') || block;
      anchor.after(panel);
      document.body.classList.remove('sentence-analysis-open');
    } else {
      side.prepend(panel);
      document.body.classList.add('sentence-analysis-open');
      side.scrollTop = 0;
    }
  }
  function dismiss(focus = false) {
    if (selected) {
      selected.classList.remove('is-selected');
      selected.setAttribute('aria-expanded','false');
    }
    selected = null;
    panel.hidden = true;
    document.body.classList.remove('sentence-analysis-open');
    if (focus) returnFocus?.focus({preventScroll:true});
    status.textContent = '';
  }
  function show(button) {
    if (selected === button) { dismiss(); return; }
    dismiss();
    selected = button;
    returnFocus = button;
    const item = items.get(button);
    button.classList.add('is-selected');
    button.setAttribute('aria-expanded','true');
    content.replaceChildren();
    content.append(createText('p',`Data File 第 ${item.page} 頁 · 第 ${item.number} 項`,'sentence-analysis-location'));
    const quote = createText('blockquote',item.text.trim(),'sentence-analysis-quote');
    quote.lang = 'en';
    content.append(quote);
    const records = recordsFor(item.text,item.section,item.page,item.contextText);
    if (!records.length) {
      content.append(createText('p','這段原文在現有材料中沒有獨立的逐句分析。請參考本頁的整段分析；不會以其他句子的解說代替。'));
    }
    for (const record of records) {
      const article = document.createElement('section');
      article.className = 'sentence-analysis-entry';
      article.append(createText('p',record.supplemental ? '導讀補充 · 非 PDF 原句分析' : 'Benchmark 原有分析','sentence-analysis-source-label'));
      for (const block of record.blocks) {
        if (block === '分析：') continue;
        const kind = block.startsWith('類型：') ? 'sentence-analysis-type' :
          block.startsWith('[') ? 'sentence-analysis-translation' : '';
        article.append(createText('p',block,kind));
      }
      const citation = record.pages?.length ? `Benchmark PDF 第 ${record.pages.join('、')} 頁` : `原 Data File 第 ${record.originalPage || item.page} 頁`;
      article.append(createText('p',citation,'sentence-analysis-citation'));
      content.append(article);
    }
    const link = createText('a','開啟完整 Data File 分析 ↗');
    link.href = '/dse-paper3-analysis.html#2025-b2';
    link.target = '_blank';
    link.rel = 'noopener';
    content.append(link);
    panel.hidden = false;
    placePanel();
    status.textContent = `已開啟第 ${item.page} 頁第 ${item.number} 項分析。`;
  }
  close.addEventListener('click',()=>dismiss(true));
  document.addEventListener('keydown',event=>{if(event.key==='Escape' && selected) dismiss(true);});
  mobile.addEventListener('change',placePanel);
  document.querySelectorAll('[data-filter], .page-nav a, #page-jump').forEach(control=>{
    control.addEventListener(control.tagName === 'SELECT' ? 'change' : 'click',()=>dismiss());
  });
  window.addEventListener('hashchange',()=>dismiss());

  function wrapBlock(block, page, section, counter) {
    // A printed line break separates words even though textContent omits it.
    for (const br of block.querySelectorAll('br')) {
      if (!br.closest('.translation')) br.before(document.createTextNode(' '));
    }
    const walker = document.createTreeWalker(block,NodeFilter.SHOW_TEXT,{
      acceptNode:node=>node.parentElement.closest('.translation, .sentence-item') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
    });
    const nodes = [];
    let node, text = '';
    while ((node = walker.nextNode())) {
      nodes.push({node,start:text.length,end:text.length+node.textContent.length});
      text += node.textContent;
    }
    const segments = core.sentences(text).map(segment=>({...segment,number:++counter.value}));
    // Work backwards so offsets in the original text nodes remain valid.
    for (const segment of segments.reverse()) {
      const start = nodes.find(part=>segment.start>=part.start && segment.start<part.end);
      const end = nodes.find(part=>segment.end>part.start && segment.end<=part.end);
      if (!start || !end) continue;
      const range = document.createRange();
      range.setStart(start.node,segment.start-start.start);
      range.setEnd(end.node,segment.end-end.start);
      const button = document.createElement('span');
      button.className = 'sentence-item';
      button.tabIndex = 0;
      button.setAttribute('role','button');
      button.setAttribute('aria-expanded','false');
      button.setAttribute('aria-controls',panel.id);
      button.setAttribute('aria-label',`第 ${segment.number} 項，查看分析：${segment.text.trim()}`);
      button.append(range.extractContents());
      range.insertNode(button);
      items.set(button,{...segment,page,section,block,contextText:text});
      button.addEventListener('click',event=>{
        event.preventDefault();
        if (!window.getSelection()?.toString()) show(button);
      });
      button.addEventListener('keydown',event=>{
        if (event.key==='Enter' || event.key===' ') {event.preventDefault();show(button);}
      });
    }
  }
  for (const page of document.querySelectorAll('.page[data-kind="data"]')) {
    const pageNumber = Number(page.id.replace('page-',''));
    const counter = {value:0};
    const targets = page.querySelectorAll('.source-paper .bilingual > p[lang="en"], .poster h2, .poster h3, .poster li, .poster .yoga p, .note-sheet h3, .note-sheet .writing-label');
    for (const block of targets) {
      if (block.closest('.analysis') || block.querySelector('.sentence-item')) continue;
      if (block.matches('.writing-label') && !block.textContent.trim().startsWith('•')) continue;
      const section = pageNumber === 10 && block.closest('.email') ? 'sports-email' : sections[pageNumber];
      wrapBlock(block,pageNumber,section,counter);
    }
    page.dataset.analysisItems = String(counter.value);
  }
})();
