(() => {
  'use strict';
  const initStarted = performance.now();
  const data = window.EDMUND_2016_B2_CURATION_STAGE4;
  const part1 = window.EDMUND_2016_B2_CURATION_DEBUG;
  if (!data?.records?.length || !part1 || !document.querySelector('#page-4 .museum-manual')) return;

  const SCHEMA = 1;
  const records = data.records;
  const byId = new Map(records.map(record => [record.id, record]));
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const make = (tag, className = '', text = '') => { const node = document.createElement(tag); if (className) node.className = className; if (text) node.textContent = text; return node; };
  const targetAudit = [];
  const targetMap = new Map();
  const canonicalModels = new WeakMap();
  const transactionLog = [];
  const highlightNames = ['stage4-a','stage4-b','stage4-c','stage4-hint','stage4-rejected'];
  const masks = $$('.curation-mask');
  let spotlightFrame = 0;
  let spotlightUntil = 0;
  let flight = null;
  let flightPeak = 0;
  let activeRoute = null;

  function blankState() {
    return {currentId:records[0].id, complete:false, active:false, spotlight:true, bookmarks:[], helpDrafts:{}, classificationRevisions:{}};
  }
  function restore(raw) {
    const state = blankState();
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return state;
    state.currentId = byId.has(raw.currentId) ? raw.currentId : records[0].id;
    state.complete = raw.complete === true && state.currentId === records.at(-1).id;
    state.active = raw.active === true;
    state.spotlight = raw.spotlight !== false;
    state.bookmarks = [...new Set((Array.isArray(raw.bookmarks) ? raw.bookmarks : []).filter(id => byId.has(id)))];
    state.helpDrafts = raw.helpDrafts && typeof raw.helpDrafts === 'object' && !Array.isArray(raw.helpDrafts)
      ? Object.fromEntries(Object.entries(raw.helpDrafts).filter(([id,value]) => byId.has(id) && typeof value === 'string').map(([id,value]) => [id,value.slice(0,4000)])) : {};
    state.classificationRevisions = raw.classificationRevisions && typeof raw.classificationRevisions === 'object' ? raw.classificationRevisions : {};
    return state;
  }
  let state = blankState();
  try {
    const stored = JSON.parse(localStorage.getItem(data.storageKey) || 'null');
    if (stored?.schema === SCHEMA && stored.version === data.version) state = restore(stored.state);
  } catch (error) { console.warn('2016 Stage 4 progress could not be restored.', error); }
  const current = () => byId.get(state.currentId) || records[0];
  const currentIndex = () => current().index;
  const completedIds = () => records.slice(0, currentIndex() + (state.complete ? 1 : 0)).map(record => record.id);
  function persist(message = 'Stage 4 進度已自動儲存在此瀏覽器') {
    try {
      localStorage.setItem(data.storageKey, JSON.stringify({schema:SCHEMA, version:data.version, state}));
      $('#curation-save-status').textContent = message;
    } catch { $('#curation-save-status').textContent = '未能儲存；本次操作仍可繼續。'; }
  }

  function canonicalWithMap(root) {
    if (canonicalModels.has(root)) return canonicalModels.get(root);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {acceptNode: node => node.parentElement?.closest('.translation') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT});
    const chars = [];
    let node;
    while ((node = walker.nextNode())) {
      for (let offset = 0; offset < node.data.length; offset += 1) {
        const original = node.data[offset];
        const normalized = original.normalize('NFKC').toLowerCase();
        const value = /[\p{L}\p{N}]/u.test(normalized) ? normalized : ' ';
        for (const char of value) chars.push({char, node, offset});
      }
      chars.push({char:' ', node, offset:node.data.length});
    }
    const compact = [];
    for (const item of chars) {
      if (item.char === ' ' && (!compact.length || compact.at(-1).char === ' ')) continue;
      compact.push(item);
    }
    while (compact[0]?.char === ' ') compact.shift();
    while (compact.at(-1)?.char === ' ') compact.pop();
    const model = {text:compact.map(item => item.char).join(''), map:compact};
    canonicalModels.set(root, model);
    return model;
  }
  const canonical = value => String(value || '').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').replace(/\s+/g, ' ').trim();
  function rangeFor(root, phrase, from = 0) {
    const model = canonicalWithMap(root);
    const needle = canonical(phrase);
    const start = model.text.indexOf(needle, from);
    if (start < 0 || !needle) return null;
    const first = model.map[start];
    const last = model.map[start + needle.length - 1];
    if (!first?.node || !last?.node) return null;
    const range = document.createRange();
    range.setStart(first.node, first.offset);
    range.setEnd(last.node, Math.min(last.node.data.length, last.offset + 1));
    return {range, next:start + needle.length};
  }

  function visualTarget(record) {
    if (/survey table/i.test(record.heading)) return $('#page-9 .survey-results-museum table');
    if (/photograph/i.test(record.heading)) return $('#page-7 .museum-whatsapp img');
    if (/thumbs-up/i.test(record.heading)) return $('#page-7 .museum-bubble:last-child p[lang="en"]');
    return null;
  }
  function recordRoot(record) {
    if (record.sourceKey === 'manual' && /Staff manual on borrowing/i.test(record.excerpt)) return $('#page-4 .museum-email > h2:nth-of-type(2)');
    return $(record.rootSelector);
  }
  function resolveTarget(record) {
    const root = recordRoot(record);
    if (!root) return {record, root:null, elements:[], ranges:[], reason:'source-root-missing'};
    if (record.visual) {
      const visual = visualTarget(record);
      return visual ? {record, root, elements:[visual], ranges:[]} : {record, root, elements:[], ranges:[], reason:'visual-target-missing'};
    }
    const parts = record.matchParts.filter(Boolean);
    const ranges = [];
    let cursor = 0;
    for (const part of parts) {
      let found = rangeFor(root, part, cursor);
      if (!found) found = rangeFor(root, part, 0);
      if (found) { ranges.push(found.range); cursor = found.next; }
    }
    if (!ranges.length) return {record, root, elements:[], ranges:[], reason:'exact-phrase-missing', parts};
    const elements = [...new Set(ranges.map(range => range.commonAncestorContainer.nodeType === Node.TEXT_NODE ? range.commonAncestorContainer.parentElement : range.commonAncestorContainer)
      .map(node => node?.closest?.('h2,h3,h4,p,tr,dt,dd,strong,time,.email-headers,.meeting-meta,.museum-bubble,.museum-interview-turn') || root))];
    return {record, root, elements, ranges, partial:ranges.length !== parts.length, parts};
  }
  for (const record of records) {
    const target = resolveTarget(record);
    targetMap.set(record.id, target);
    if (target.reason || target.partial) targetAudit.push({stepId:record.id, source:record.sourceKey, reason:target.reason || 'partial-match', matched:target.ranges.length, expected:target.parts?.length || 0, parts:target.parts});
  }
  const targetResolutionMs = performance.now() - initStarted;
  const findRecord = (sourceKey, pattern) => records.find(record => record.sourceKey === sourceKey && pattern.test(record.heading));
  const routeSpecs = [
    ['policy-manual', findRecord('minutes',/according to policy a glass cover/i), findRecord('manual',/all borrowed items must be displayed/i), '按政策回看 staff manual'],
    ['interview-transcript', findRecord('whatsapp',/link to the transcript/i), findRecord('resident-interview',/transcript of interview/i), '沿連結查看居民訪談'],
    ['left-door-correction', findRecord('resident-interview',/right door of the cupboard/i), findRecord('resident-interview',/she told me it was the left/i), '查看同一訪談的更正'],
    ['typhoon-confirmation', findRecord('resident-interview',/typhoon ellen in 1983/i), findRecord('news-survey',/death and destruction brought by typhoon ellen/i), '到同期新聞核實'],
    ['survey-results', findRecord('minutes',/results of the online survey/i), findRecord('news-survey',/visual.*survey table/i), '查看完整問卷'],
    ['director-approval', findRecord('whatsapp',/opens the toilet door/i), findRecord('whatsapp',/i like it.*yes/i), '查看館長批准']
  ];
  const routes = routeSpecs.map(([id,from,to,label]) => ({id,fromId:from?.id,toId:to?.id,label}));
  const routeAudit = routes.filter(route => !route.fromId || !route.toId);
  if (routeAudit.length) targetAudit.push(...routeAudit.map(route => ({stepId:route.fromId || route.id,reason:'route-target-missing',route})));
  const routeByFrom = new Map(routes.filter(route => route.fromId && route.toId).map(route => [route.fromId,route]));
  if (targetAudit.length) console.error('2016 Stage 4 exact-target audit failed.', targetAudit);

  const bank = make('aside', 'curation-stage4-bank');
  bank.hidden = true;
  bank.setAttribute('aria-label', 'Stage 4 寫作證據庫');
  bank.innerHTML = `<header><h2>寫作證據庫</h2><p>只收入已核對、可直接使用的資料。</p></header>${['A','B','C'].map(task => `<section data-task="${task}"><h3><span>${task}</span>${data.taskLabels[task]} <b data-count>0</b></h3><ol></ol></section>`).join('')}`;
  document.body.append(bank);
  const currentRangeLayer = make('div', 'curation-stage4-current-layer');
  currentRangeLayer.setAttribute('aria-hidden', 'true');
  document.body.append(currentRangeLayer);
  const stage4RouteCallout = make('div', 'curation-route-callout curation-stage4-route-callout');
  stage4RouteCallout.hidden = true;
  const stage4RouteArrow = document.createElementNS('http://www.w3.org/2000/svg','svg');
  stage4RouteArrow.id = 'curation-stage4-route-arrow'; stage4RouteArrow.hidden = true;
  stage4RouteArrow.innerHTML = '<defs><marker id="curation-tip-2016-stage4" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M1 1L7 4L1 7" fill="none" stroke="#d0282d" stroke-width="1.6"/></marker></defs><path class="curation-route-path" marker-end="url(#curation-tip-2016-stage4)"/>';
  document.body.append(stage4RouteArrow, stage4RouteCallout);

  const analysisPanel = make('section', 'curation-stage4-analysis');
  const search = make('label', 'curation-stage4-search');
  search.innerHTML = `搜尋步驟<input type="search" id="curation-stage4-search" placeholder="輸入來源、引文或 STEP ID">`;
  $('.curation-tools').prepend(search);

  const initialSourceTasks = {manual:['A'],minutes:['C'],'ip-email':['A'],whatsapp:['B'],'resident-interview':['B'],'news-survey':['B','C'],'oconnor-email':['C']};
  const stampGroups = new Map();
  for (const source of data.sources) {
    const page = $(`#page-${source.page}`);
    const header = page?.querySelector(':scope > header');
    if (!header) continue;
    const holder = make('div', 'curation-stage4-file-stamps');
    holder.setAttribute('aria-label', `${source.title} 的 Stage 4 證據狀態`);
    header.prepend(holder);
    stampGroups.set(source.key, {holder, source});
  }

  function clearHighlights() {
    if (CSS.highlights) for (const name of highlightNames) CSS.highlights.delete(name);
    currentRangeLayer.replaceChildren();
    $$('.curation-stage4-current,.curation-stage4-visual-a,.curation-stage4-visual-b,.curation-stage4-visual-c,.curation-stage4-visual-hint,.curation-stage4-visual-rejected').forEach(node => node.classList.remove('curation-stage4-current','curation-stage4-visual-a','curation-stage4-visual-b','curation-stage4-visual-c','curation-stage4-visual-hint','curation-stage4-visual-rejected'));
  }
  function highlightKind(record) {
    if (record.type === 6) return 'rejected';
    if (record.task && record.bankEligible) return record.task.toLowerCase();
    return 'hint';
  }
  function renderCurrentFocus() {
    currentRangeLayer.replaceChildren();
    if (!state.active) return;
    const active = targetMap.get(current().id);
    if (!active) return;
    if (!active.ranges.length) {
      active.elements.forEach(element => element.classList.add('curation-stage4-current'));
      return;
    }
    for (const range of active.ranges) {
      for (const rect of range.getClientRects()) {
        if (!rect.width || !rect.height || rect.bottom < 0 || rect.top > innerHeight) continue;
        const outline = make('span', 'curation-stage4-current-range');
        Object.assign(outline.style, {
          left:`${rect.left - 4}px`,
          top:`${rect.top - 3}px`,
          width:`${rect.width + 8}px`,
          height:`${rect.height + 6}px`
        });
        currentRangeLayer.append(outline);
      }
    }
  }
  function renderHighlights() {
    clearHighlights();
    const groups = {a:[],b:[],c:[],hint:[],rejected:[]};
    for (const record of records.slice(0, currentIndex() + 1)) {
      const target = targetMap.get(record.id);
      const kind = highlightKind(record);
      if (target.ranges.length) groups[kind].push(...target.ranges);
      else target.elements.forEach(element => element.classList.add(`curation-stage4-visual-${kind}`));
    }
    if (CSS.highlights && typeof Highlight === 'function') {
      for (const [kind,ranges] of Object.entries(groups)) if (ranges.length) CSS.highlights.set(`stage4-${kind}`, new Highlight(...ranges));
    }
    renderCurrentFocus();
  }

  function renderBank() {
    const committed = records.slice(0, currentIndex() + (state.complete ? 1 : 0)).filter(record => record.bankEligible && record.task);
    for (const task of ['A','B','C']) {
      const section = $(`[data-task="${task}"]`, bank);
      const rows = committed.filter(record => record.task === task);
      $('[data-count]', section).textContent = String(rows.length);
      $('ol', section).replaceChildren(...rows.map(record => {
        const li = make('li'); li.dataset.evidenceId = record.id;
        li.append(make('q', '', record.excerpt), make('small', '', `${record.sourcePage} · ${record.decision}`));
        return li;
      }));
    }
  }
  function discoveredTasks(sourceKey) {
    const reached = records.slice(0, currentIndex() + 1).filter(record => record.sourceKey === sourceKey && record.task && (record.bankEligible || record.status === 'provisional'));
    return [...new Set(reached.map(record => record.task))].sort();
  }
  function renderStamps() {
    for (const [sourceKey, group] of stampGroups) {
      const tasks = discoveredTasks(sourceKey);
      const initial = initialSourceTasks[sourceKey] || [];
      const revised = tasks.some(task => !initial.includes(task));
      if (revised) state.classificationRevisions[sourceKey] = tasks;
      group.holder.replaceChildren(...tasks.map(task => {
        const stamp = make('span', `curation-stage4-file-stamp curation-file-stamp-${task}`, task);
        stamp.append(make('small', '', revised ? '已修訂' : '已確認'));
        stamp.setAttribute('aria-label', `Task ${task} ${revised ? '分類已修訂' : '分類已確認'}`);
        return stamp;
      }));
    }
  }

  function rebuildSelects() {
    const query = canonical($('#curation-stage4-search').value);
    const visible = records.filter(record => !query || canonical(`${record.id} ${record.sourceTitle} ${record.heading} ${record.excerpt}`).includes(query));
    $('#curation-step-jump').replaceChildren(...visible.map(record => {
      const option = make('option', '', `${record.index + 1}. ${record.sourceTitle} · ${record.heading}`);
      option.value = record.id; option.selected = record.id === current().id; return option;
    }));
    if (!visible.some(record => record.id === current().id)) {
      const option = make('option', '', `${current().index + 1}. ${current().sourceTitle} · ${current().heading}`);
      option.value = current().id; option.selected = true; $('#curation-step-jump').prepend(option);
    }
    const placeholder = make('option', '', '選擇書籤'); placeholder.value = '';
    $('#curation-bookmark-jump').replaceChildren(placeholder, ...state.bookmarks.map(id => { const record = byId.get(id); const option = make('option','',`${record.index + 1}. ${record.heading}`); option.value=id; return option; }));
  }
  function renderRail() {
    for (const item of $$('.curation-stage-item')) { item.classList.remove('active'); item.setAttribute('aria-current','false'); }
    const stage1 = $('.curation-stage-item[data-stage="instruction"]');
    const stage2 = $('.curation-stage-item[data-stage="categorize"]');
    const stage3 = $('.curation-stage-item[data-stage="podcast"]');
    const stage4 = $('.curation-stage-item[data-stage="data"]');
    stage1.classList.add('complete'); $('.curation-stage-dot',stage1).textContent='✓';
    stage2.classList.add('complete'); $('.curation-stage-dot',stage2).textContent='✓';
    stage3.classList.add('complete'); $('.curation-stage-dot',stage3).textContent='✓';
    stage4.disabled=false; stage4.classList.add('active'); stage4.classList.toggle('complete',state.complete); stage4.setAttribute('aria-current','step');
    $('.curation-stage-dot',stage4).textContent=state.complete?'✓':'4'; $('.curation-stage-count',stage4).textContent=`${completedIds().length}/${records.length}`;
    const stage5=$('.curation-stage-item[data-stage="writing"]'); stage5.disabled=true; $('.curation-stage-count',stage5).textContent='未開放';
  }
  function renderDock() {
    const record = current();
    $('.curation-dock > header span').textContent='2016 B2 · SUPER CURATION · STAGE 4';
    $('#curation-source').textContent=`${record.sourcePage} · ${record.sourceTitle}`;
    $('#curation-title').textContent=record.heading;
    $('#curation-quote').textContent=record.excerpt;
    $('#curation-translation').textContent=record.translation;
    $('#curation-type').textContent=`${record.typeLabel} · ${record.decision}`;
    analysisPanel.replaceChildren();
    for (const [label,key] of [['這句／圖像在說甚麼','meaning'],['這句／圖像有甚麼用','use'],['為甚麼採用這個作答決定','rationale'],['答案可以怎樣處理','treatment']]) {
      const section=make('section'); section.append(make('h3','',label),make('p','',record.analysis[key])); analysisPanel.append(section);
    }
    const route = routeByFrom.get(record.id);
    if (route) {
      const visit=make('button','curation-stage4-route-button',`查看來源 · ${route.label} →`); visit.type='button'; visit.addEventListener('click',()=>beginRoute(route)); analysisPanel.append(visit);
    }
    $('#curation-explanation').replaceChildren(analysisPanel);
    $('#curation-step-id').textContent=`STEP ID · ${record.id}`;
    $('#curation-step-count').textContent=`${record.index + 1} / ${records.length}`;
    $('#curation-progress').max=records.length; $('#curation-progress').value=completedIds().length;
    $('#curation-prev').disabled=record.index===0;
    $('#curation-next').disabled=state.complete && record.index===records.length-1;
    $('#curation-next').textContent=record.index===records.length-1?'完成本章 ✓':'下一步 →';
    $('#curation-bookmark').textContent=state.bookmarks.includes(record.id)?'★':'☆';
    $('#curation-bookmark').setAttribute('aria-pressed',String(state.bookmarks.includes(record.id)));
    $('#curation-bookmark-count').textContent=state.bookmarks.length?`${state.bookmarks.length} 個書籤`:'尚無書籤';
    $('#curation-spotlight').checked=state.spotlight;
  }

  function hideMasks() { masks.forEach(mask => mask.hidden=true); }
  function clearRoute() {
    activeRoute=null;
    stage4RouteCallout.hidden=true;
    stage4RouteArrow.hidden=true;
    $$('.curation-stage4-route-target').forEach(node=>node.classList.remove('curation-stage4-route-target'));
  }
  function drawRouteArrow(origin,destination) {
    const arrow=stage4RouteArrow;
    const from=origin.getBoundingClientRect(),to=destination.getBoundingClientRect();
    const startX=Math.max(365,from.right),startY=from.top+from.height/2,endX=to.left,endY=to.top+Math.min(to.height,40)/2;
    arrow.querySelector('.curation-route-path').setAttribute('d',`M${startX},${startY} C${startX+90},${startY} ${endX-90},${endY} ${endX},${endY}`);arrow.hidden=false;
  }
  function beginRoute(route) {
    clearRoute();
    const destination=targetMap.get(route.toId)?.elements[0];
    const origin=targetMap.get(route.fromId)?.elements[0];
    const callout=stage4RouteCallout;
    if (!destination||!origin) { callout.replaceChildren(make('strong','',`未能精確定位：${route.label}`));callout.hidden=false;return; }
    activeRoute=route;destination.classList.add('curation-stage4-route-target');
    const back=make('button','',`← 返回原句`);back.type='button';back.addEventListener('click',returnRoute);
    callout.replaceChildren(make('strong','',`來源到訪 · ${route.label}`),make('span','',byId.get(route.toId).excerpt),back);callout.hidden=false;
    destination.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
    requestAnimationFrame(()=>drawRouteArrow(callout,destination));
    transactionLog.push({type:'route-visit',routeId:route.id,fromId:route.fromId,toId:route.toId,at:Date.now()});
  }
  function returnRoute() {
    if (!activeRoute) return;
    const route=activeRoute,origin=targetMap.get(route.fromId)?.elements[0];
    clearRoute();
    origin?.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
    transactionLog.push({type:'route-return',routeId:route.id,fromId:route.toId,toId:route.fromId,at:Date.now()});
  }
  function renderSpotlight() {
    cancelAnimationFrame(spotlightFrame);
    if (!state.active || !state.spotlight) { hideMasks(); return; }
    spotlightFrame=requestAnimationFrame(() => {
      const target=targetMap.get(current().id)?.elements[0];
      if (!target) { hideMasks(); return; }
      const rect=target.getBoundingClientRect();
      const left=Math.max(365,Math.min(innerWidth-390,rect.left-8));
      const right=Math.max(left+8,Math.min(innerWidth-380,rect.right+8));
      const top=Math.max(96,rect.top-8),bottom=Math.min(innerHeight,rect.bottom+8);
      const bounds={left:360,right:innerWidth-370,top:92,bottom:innerHeight};
      const boxes=[{left:bounds.left,top:bounds.top,width:bounds.right-bounds.left,height:Math.max(0,top-bounds.top)},{left:bounds.left,top:bottom,width:bounds.right-bounds.left,height:Math.max(0,bounds.bottom-bottom)},{left:bounds.left,top,width:Math.max(0,left-bounds.left),height:Math.max(0,bottom-top)},{left:right,top,width:Math.max(0,bounds.right-right),height:Math.max(0,bottom-top)}];
      masks.forEach((mask,index)=>{const box=boxes[index];mask.hidden=false;Object.assign(mask.style,{left:`${box.left}px`,top:`${box.top}px`,width:`${box.width}px`,height:`${box.height}px`});});
    });
  }
  function trackSpotlight() {
    spotlightUntil=performance.now()+900;
    const tick=()=>{ if (!state.active) return; renderSpotlight(); renderCurrentFocus(); if (performance.now()<spotlightUntil) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }

  function cancelFlight() { if (flight) { flight.remove(); flight=null; } }
  function flyToBank(record) {
    cancelFlight();
    if (!record.bankEligible || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const origin=targetMap.get(record.id)?.elements[0];
    const destination=$(`[data-task="${record.task}"] ol`,bank);
    if (!origin || !destination) return;
    const from=origin.getBoundingClientRect(),to=destination.getBoundingClientRect();
    const clone=make('div',`curation-stage4-flight curation-flight-${record.task}`,record.excerpt); flight=clone; document.body.append(clone); flightPeak=Math.max(flightPeak,$$('.curation-stage4-flight').length);
    Object.assign(clone.style,{left:`${from.left}px`,top:`${from.top}px`,width:`${Math.min(360,from.width)}px`});
    requestAnimationFrame(()=>clone.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:`translate(${to.left-from.left}px,${to.top-from.top}px) scale(.28)`,opacity:.12}],{duration:650,easing:'cubic-bezier(.2,.8,.2,1)'}).finished.finally(cancelFlight));
    setTimeout(cancelFlight,900);
    transactionLog.push({type:'bank-flight',id:record.id,at:Date.now()});
  }

  function showRecord(focus=true) {
    renderDock(); rebuildSelects(); renderRail(); renderHighlights(); renderBank(); renderStamps(); renderSpotlight();
    const target=targetMap.get(current().id)?.elements[0];
    if (focus && target) { target.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}); trackSpotlight(); }
    persist();
  }
  function go(index, focus=true) {
    clearRoute();
    const next=records[Math.max(0,Math.min(records.length-1,index))];
    state.currentId=next.id; state.complete=false; showRecord(focus);
  }
  function next() {
    const record=current();
    flyToBank(record);
    if (record.index===records.length-1) { state.complete=true; showRecord(false); persist('Stage 4 已完成；Stage 5 保持未開放。'); return; }
    go(record.index+1,true);
  }

  function enter() {
    if (window.EDMUND_2016_B2_CURATION_STAGE3_DEBUG?.getState().active) window.EDMUND_2016_B2_CURATION_STAGE3_DEBUG.leave();
    if (window.EDMUND_2016_B2_CURATION_STAGE2_DEBUG?.getState().active) window.EDMUND_2016_B2_CURATION_STAGE2_DEBUG.leave();
    state.active=true;
    document.body.classList.add('curation-active','curation-stage4-active');
    document.body.classList.remove('curation-stage2-active','curation-stage3-active');
    $('.curation-stage').hidden=false; $('.curation-dock').hidden=false; $('.curation-task-map').hidden=true; bank.hidden=false;
    $('#curation-toggle').setAttribute('aria-pressed','true');
    showRecord(true);
  }
  function leave(options={}) {
    state.active=false; persist(); cancelFlight(); clearRoute(); hideMasks(); clearHighlights(); bank.hidden=true;
    document.body.classList.remove('curation-stage4-active');
    if (options.switchStage !== false) part1.open();
  }
  function activeEvent(event) { if (!state.active) return false; event.preventDefault(); event.stopImmediatePropagation(); return true; }

  $('.curation-stage-item[data-stage="data"]').disabled=false;
  $('.curation-stage-count',$('.curation-stage-item[data-stage="data"]')).textContent=`${completedIds().length}/${records.length}`;
  $('.curation-stage-item[data-stage="data"]').addEventListener('click',event=>{event.preventDefault();event.stopImmediatePropagation();enter();},true);
  $('.curation-stage-item[data-stage="instruction"]').addEventListener('click',event=>{if(!activeEvent(event))return;leave({switchStage:true});},true);
  $('.curation-stage-item[data-stage="categorize"]').addEventListener('click',event=>{if(!activeEvent(event))return;leave({switchStage:false});window.EDMUND_2016_B2_CURATION_STAGE2_DEBUG?.enter();},true);
  $('.curation-stage-item[data-stage="podcast"]').addEventListener('click',event=>{if(!activeEvent(event))return;leave({switchStage:false});window.EDMUND_2016_B2_CURATION_STAGE3_DEBUG?.enter();},true);
  $('#curation-prev').addEventListener('click',event=>{if(!activeEvent(event))return;go(currentIndex()-1,true);},true);
  $('#curation-next').addEventListener('click',event=>{if(!activeEvent(event))return;next();},true);
  $('#curation-step-jump').addEventListener('change',event=>{if(!activeEvent(event))return;const record=byId.get(event.target.value);if(record)go(record.index,true);},true);
  $('#curation-bookmark-jump').addEventListener('change',event=>{if(!activeEvent(event))return;const record=byId.get(event.target.value);if(record)go(record.index,true);},true);
  $('#curation-bookmark').addEventListener('click',event=>{if(!activeEvent(event))return;const id=current().id;state.bookmarks=state.bookmarks.includes(id)?state.bookmarks.filter(item=>item!==id):[...state.bookmarks,id];showRecord(false);},true);
  $('#curation-spotlight').addEventListener('change',event=>{if(!activeEvent(event))return;state.spotlight=event.target.checked;renderSpotlight();persist();},true);
  $('#curation-stage4-search').addEventListener('input',()=>{if(state.active)rebuildSelects();});
  $('#curation-help').addEventListener('click',event=>{if(!activeEvent(event))return;const record=current();$('#curation-help-context').textContent=`${record.sourcePage} · ${record.heading} · STEP ID ${record.id}`;$('#curation-help-guidance').textContent=record.analysis.rationale;$('#curation-help-question').value=state.helpDrafts[record.id]||'';const dialog=$('.curation-help-dialog');if(typeof dialog.showModal==='function')dialog.showModal();else dialog.open=true;},true);
  $('#curation-help-form').addEventListener('submit',event=>{if(!state.active)return;event.preventDefault();event.stopImmediatePropagation();const value=$('#curation-help-question').value.trim();if(value)state.helpDrafts[current().id]=value;else delete state.helpDrafts[current().id];persist('問題草稿已儲存於此瀏覽器；未有傳送。');},true);
  $('#curation-close').addEventListener('click',()=>{if(state.active)queueMicrotask(()=>leave({switchStage:false}));},true);
  document.addEventListener('keydown',event=>{if(!state.active||/INPUT|TEXTAREA|SELECT/.test(event.target.tagName)||$('.curation-help-dialog').open)return;if(!['ArrowLeft','ArrowRight'].includes(event.key))return;event.preventDefault();event.stopImmediatePropagation();event.key==='ArrowLeft'?go(currentIndex()-1,true):next();},true);
  window.addEventListener('scroll',trackSpotlight,{passive:true}); window.addEventListener('resize',trackSpotlight); window.addEventListener('pagehide',()=>persist());

  window.EDMUND_2016_B2_CURATION_STAGE4_DEBUG=Object.freeze({
    version:data.version,architectureVersion:data.architectureVersion,storageKey:data.storageKey,
    records:records.map(record=>({...record})),sources:data.sources,routes:routes.map(route=>({...route})),targetAudit,transactionLog,
    getPerformance:()=>({initMs:targetResolutionMs,targetCount:targetMap.size,flightPeak,liveFlights:$$('.curation-stage4-flight').length}),
    getCurrentHighlightAudit:()=>{
      const record=current(),active=targetMap.get(record.id);
      const rejected=CSS.highlights?.get('stage4-rejected');
      const rejectedRanges=rejected?[...rejected]:[];
      return {id:record.id,type:record.type,bankEligible:record.bankEligible,activeRangeCount:active?.ranges.length||0,currentOutlineCount:currentRangeLayer.childElementCount,currentCustomHighlight:CSS.highlights?.has('stage4-current')||false,rejectedRangeCount:rejectedRanges.length,activeRangesInRejected:record.type!==6||active.ranges.every(range=>rejectedRanges.includes(range))};
    },
    getState:()=>({...state,position:currentIndex(),stepId:current().id,completedIds:completedIds(),bankIds:records.slice(0,currentIndex()+(state.complete?1:0)).filter(record=>record.bankEligible).map(record=>record.id)}),
    enter,leave:()=>leave({switchStage:true}),next,prev:()=>go(currentIndex()-1,true),goById:id=>{const record=byId.get(id);if(record)go(record.index,true);},
    beginRoute:id=>{const route=routes.find(item=>item.id===id);if(route)beginRoute(route);},returnRoute,
    setSpotlight:value=>{state.spotlight=value!==false;showRecord(false);},reset:()=>{state=blankState();state.active=true;enter();}
  });
  if (state.active && $('#curation-toggle').getAttribute('aria-pressed')==='true') enter();
})();
