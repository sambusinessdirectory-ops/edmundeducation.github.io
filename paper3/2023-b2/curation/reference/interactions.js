/* 2023 B2 interaction layer. Content decisions remain in the source and audit ledgers. */
(() => {
  'use strict';
  const css = new URL('reference/interactions.css?v=20261103-sourcefocus', location.href).href;
  for (const root of [document.head, shell, native]) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = css;
    root.append(link);
  }
  const $ = selector => shell.querySelector(selector);
  const normalize = text => String(text || '').toLowerCase().replace(/[’‘]/g, "'").replace(/[^\p{L}\p{N}]/gu, '');
  const cueId = cue => 'cue:'+cue[0];
  const storageKey = 'cur23-v11-slots';
  const stageKey = 'cur23-v11-stage-positions';
  const reviewKey = 'cur23-v11-review';
  const isDataKey = key => key !== storageKey && !key.startsWith('cur23-slot') && (key.startsWith('cur23-') || key.startsWith('class23-') || key.startsWith('2023-draft-'));
  const capture = () => {
    const state = {};
    for (let n = 0; n < localStorage.length; n++) {
      const key = localStorage.key(n);
      if (isDataKey(key)) state[key] = localStorage.getItem(key);
    }
    return state;
  };
  const apply = state => {
    for (const key of Object.keys(localStorage)) if (isDataKey(key)) localStorage.removeItem(key);
    for (const [key, value] of Object.entries(state)) if (isDataKey(key) && typeof value === 'string') localStorage.setItem(key, value);
  };
  let bundle;
  try { bundle = JSON.parse(localStorage.getItem(storageKey) || 'null'); } catch {}
  if (!bundle || bundle.format !== 'edmund-paper3-2023-b2-v11' || !bundle.slots || typeof bundle.slots !== 'object') {
    bundle = {format:'edmund-paper3-2023-b2-v11', version:1, active:'1', slots:{'1':capture()}};
  }
  if (!/^[1-5]$/.test(bundle.active)) bundle.active = '1';
  const status = $('#curation-save-status');
  const slotSelect = $('#curation-slot');
  slotSelect.value = bundle.active;
  if (typeof store !== 'undefined') store.hidden = true;
  let saveTimer = 0;
  function saveNow(message) {
    clearTimeout(saveTimer);
    try {
      bundle.slots[bundle.active] = capture();
      localStorage.setItem(storageKey, JSON.stringify(bundle));
      if (message) {status.textContent = message;status.dataset.noticeUntil=String(Date.now()+4000);}
      else if (Date.now() > Number(status.dataset.noticeUntil || 0)) status.textContent = `位置 ${bundle.active} · 已自動儲存在這部裝置`;
      return true;
    } catch {
      status.textContent = '儲存失敗；請嘗試匯出存檔。';
      return false;
    }
  }
  const queueSave = () => { clearTimeout(saveTimer); saveTimer = setTimeout(() => saveNow(), 180); };
  slotSelect.onchange = () => {
    const next = slotSelect.value;
    if (!/^[1-5]$/.test(next) || next === bundle.active) return;
    if (!saveNow()) { slotSelect.value = bundle.active; return; }
    bundle.active = next;
    bundle.slots[next] ||= {};
    localStorage.setItem(storageKey, JSON.stringify(bundle));
    window.removeEventListener('pagehide',remember23);
    audio.removeEventListener('pause',remember23);
    apply(bundle.slots[next]);
    sessionStorage.setItem('cur23-v11-message', `已載入位置 ${next}`);
    location.reload();
  };
  $('#curation-save-now').onclick = () => saveNow(`位置 ${bundle.active} · 已儲存`);
  $('#curation-export').onclick = () => {
    if (!saveNow()) return;
    const file = {format:bundle.format,version:1,paper:'2023-b2',slot:bundle.active,state:bundle.slots[bundle.active]};
    const url = URL.createObjectURL(new Blob([JSON.stringify(file,null,2)],{type:'application/json'}));
    const link = document.createElement('a');
    link.href = url; link.download = `paper3-2023-b2-curation-slot-${bundle.active}.json`;
    link.click(); setTimeout(() => URL.revokeObjectURL(url),1000);
  };
  $('#curation-import').onchange = async event => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    try {
      if (file.size > 1024 * 1024) throw Error('存檔超過 1 MB');
      const value = JSON.parse(await file.text());
      if (value.format !== bundle.format || value.version !== 1 || value.paper !== '2023-b2' || !value.state || typeof value.state !== 'object' || Array.isArray(value.state)) throw Error('這不是有效的 2023 B2 存檔');
      const cleaned = {};
      for (const [key, item] of Object.entries(value.state)) {
        if (!isDataKey(key) || typeof item !== 'string' || item.length >= 30000) continue;
        cleaned[key] = item;
      }
      const rowIds = new Set(rows.map(key23));
      const validWritingBookmark = id => {const hit=/^(.*)\|writing:(\d+)$/.exec(id);if(!hit||!rowIds.has(hit[1]))return false;const row=rows.find(item=>key23(item)===hit[1]);return row?.stage===4&&Number(hit[2])>0&&Number(hit[2])<=2*(row.used?.length||0);};
      const jsonKeys = ['cur23-stars','cur23-done','cur23-task-progress','cur23-shown','cur23-stableUse','cur23-audioState','cur23-v11-stage-positions'];
      for (const key of jsonKeys) if (key in cleaned) {
        let parsed;try {parsed=JSON.parse(cleaned[key]);} catch {throw Error(`存檔內的 ${key} 格式無效`);}
        if (key === 'cur23-stars' || key === 'cur23-done') {
          if (!Array.isArray(parsed)) throw Error(`存檔內的 ${key} 格式無效`);
          parsed=parsed.filter(id => typeof id === 'string' && (rowIds.has(id) || cues.some(cue => cueId(cue) === id) || validWritingBookmark(id) || reviewUnits.some(unit => reviewId(unit) === id) || key === 'cur23-done' && facts.some(fact => `heard:${fact[2]}` === id)));
          cleaned[key]=JSON.stringify([...new Set(parsed)]);
        } else if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw Error(`存檔內的 ${key} 格式無效`);
        else if (key === 'cur23-stableUse') cleaned[key] = JSON.stringify(Object.fromEntries(Object.entries(parsed).filter(([task,entry]) => '123'.includes(task) && entry && typeof entry.key === 'string' && rowIds.has(entry.key) && Number.isInteger(Number(entry.n)))));
        else if (key === 'cur23-shown') cleaned[key] = JSON.stringify(Object.fromEntries(Object.entries(parsed).filter(([task,entry]) => '123'.includes(task) && entry && Number.isInteger(Number(entry.i)) && rows[Number(entry.i)] && Number.isInteger(Number(entry.n)))));
      }
      if (cleaned['cur23-stable'] && !rowIds.has(cleaned['cur23-stable'])) delete cleaned['cur23-stable'];
      for (const key of ['cur23-position','cur23-cue','cur23-v11-review']) if (key in cleaned && !Number.isInteger(Number(cleaned[key]))) delete cleaned[key];
      bundle.slots[bundle.active] = cleaned;
      localStorage.setItem(storageKey, JSON.stringify(bundle));
      window.removeEventListener('pagehide',remember23);
      audio.removeEventListener('pause',remember23);
      apply(cleaned);
      sessionStorage.setItem('cur23-v11-message', `已匯入至位置 ${bundle.active}`);
      location.reload();
    } catch (error) { status.textContent = `匯入失敗：${error.message}`;status.dataset.noticeUntil=String(Date.now()+4000); }
    input.value = '';
  };
  const restoredMessage = sessionStorage.getItem('cur23-v11-message');
  status.textContent = restoredMessage || `位置 ${bundle.active} · 自動儲存已啟用`;
  if (restoredMessage) status.dataset.noticeUntil=String(Date.now()+4000);
  sessionStorage.removeItem('cur23-v11-message');
  document.addEventListener('input', queueSave, true);
  document.addEventListener('change', queueSave, true);
  audio.addEventListener('timeupdate', () => { if (Math.floor(audio.currentTime) % 5 === 0) queueSave(); });

  // Bank rows follow the reached source boundary, including when an earlier stage is revisited.
  const originalSyncBank = syncBank;
  syncBank = function() {
    originalSyncBank();
    const stage = rows[i].stage;
    for (const group of shell.querySelectorAll('#curation-bank-groups details')) {
      for (const item of [...group.querySelectorAll('li')]) {
        const text = item.querySelector('button')?.textContent;
        const fact = facts.find(f => f[2] === text);
        if (!fact) continue;
        let visible = stage === 4;
        if (fact[1] === 19 && stage === 2) {
          const cue = cues.findIndex(c => transcript[c[0]].text.includes(fact[2]));
          visible = reviewIndex >= 0 || (cue >= 0 && (cue < cueIndex || cue === cueIndex && done));
        } else if (fact[1] === 19 && stage === 3) visible = true;
        else if (fact[1] !== 19 && stage === 3) {
          const exact = rows.findIndex(r => r.stage === 3 && r.p === fact[1] && normalize(r.q) === normalize(fact[2]));
          const related = exact >= 0 ? exact : rows.findIndex(r => r.stage === 3 && r.p === fact[1] && normalize(r.q).includes(normalize(fact[2])));
          visible = related >= 0 && related <= i;
        }
        if (!visible) item.remove();
      }
      const count = group.querySelector('[data-count]');
      if (count) count.textContent = `${group.querySelectorAll('li').length} 句`;
    }
  };

  // A stage button resumes the last stable step in that chapter.
  let stagePositions;
  try { stagePositions = JSON.parse(localStorage.getItem(stageKey) || '{}'); } catch { stagePositions = {}; }
  if (!stagePositions || typeof stagePositions !== 'object') stagePositions = {};
  const first = stage => rows.findIndex(row => row.stage === stage);
  function recordPosition() {
    const row = rows[i];
    stagePositions[row.stage] = {key:key23(row),cue:row.stage === 2 ? cueIndex : undefined,review:row.stage === 2 ? (reviewIndex >= 0 ? reviewIndex : stagePositions[2]?.review ?? -1) : undefined};
    localStorage.setItem(stageKey, JSON.stringify(stagePositions));
  }
  let reviewIndex = Number(localStorage.getItem(reviewKey) || -1);
  if (!Number.isInteger(reviewIndex)) reviewIndex = -1;
  const reviewUnits = transcript.slice(6,82).flatMap((turn, offset) => {
    const segments = typeof Intl.Segmenter === 'function'
      ? [...new Intl.Segmenter('en',{granularity:'sentence'}).segment(turn.text)].map(item => item.segment.trim())
      : turn.text.split(/(?<=[.!?])\s+/).map(item => item.trim());
    return segments.filter(Boolean).map((sentence,part) => ({turn:offset+6,part,sentence,speaker:turn.speaker}));
  });
  if (reviewIndex >= reviewUnits.length) reviewIndex = -1;
  const cueByTurn = new Map(cues.map((cue,j) => [cue[0],{cue,j}]));
  function reviewRole(unit) {
    const text = normalize(unit.sentence);
    const matching = facts.filter(f => f[1] === 19 && text.includes(normalize(f[2])));
    if (matching.length) return {type:matching[0][0],fact:matching[0],explanation:matching[0][4]};
    const hit = cueByTurn.get(unit.turn);
    if (hit && hit.cue[1] > 0) return {type:hit.cue[1],explanation:cueHelp[hit.j]};
    if (noiseTurns.has(unit.turn)) return {type:6,explanation:'這句屬寒暄或旁枝資訊；不作三項寫作的直接內容點。'};
    if (hit) return {type:5,explanation:cueHelp[hit.j] || '記下錄音脈絡，再核對是否屬於寫作要求。'};
    return {type:5,explanation:'保留講者及前後文，核對後續更新；沒有證實前不要當作可直接採用的內容。'};
  }
  const reviewId = unit => `review:${unit.turn}:${unit.part}`;
  let lastReview = -1, lastReviewLanguage = '';
  function clearReviewFocus() {
    const translated = language.getAttribute('aria-pressed') === 'true';
    for (const p of E('turns').children) {
      const turn = transcript[Number(p.dataset.id)];
      p.classList.remove('cur23-review-current','cur23-review-noise');
      p.textContent = `${turn.speaker} · ${turn.text}` + (translated ? `　${zhTurns[Number(p.dataset.id)-6] || ''}` : '');
    }
  }
  function paintReviewSentences() {
    const translated = language.getAttribute('aria-pressed') === 'true';
    for (const p of E('turns').children) {
      const turnIndex = Number(p.dataset.id), turn = transcript[turnIndex];
      const units = reviewUnits.map((unit,index) => ({unit,index})).filter(entry => entry.unit.turn === turnIndex);
      p.replaceChildren(document.createTextNode(`${turn.speaker} · `));
      p.classList.toggle('cur23-review-current',units.some(entry => entry.index === reviewIndex));
      let cursor = 0;
      for (const {unit,index} of units) {
        const at = turn.text.indexOf(unit.sentence,cursor);
        if (at < 0) continue;
        p.append(document.createTextNode(turn.text.slice(cursor,at)));
        const span = document.createElement('span');span.textContent=unit.sentence;
        const role = reviewRole(unit);
        if (index === reviewIndex) {
          span.classList.add('cur23-review-sentence');
          if (role.type === 6) span.classList.add('cur23-review-rejected');
          else if (role.type >= 1 && role.type <= 3) span.classList.add(`cur23-review-task-${role.type}`);
        } else if (index < reviewIndex && completed.has(reviewId(unit))) {
          if (role.type === 6) span.classList.add('cur23-review-rejected');
          else if (role.type >= 1 && role.type <= 3) span.classList.add(`cur23-review-task-${role.type}`);
        }
        p.append(span);cursor=at+unit.sentence.length;
      }
      p.append(document.createTextNode(turn.text.slice(cursor)));
      if (translated) p.append(document.createTextNode(`　${zhTurns[turnIndex-6] || ''}`));
    }
    const unit = reviewUnits[reviewIndex];
    const target = [...E('turns').children].find(p => Number(p.dataset.id) === unit.turn);
    target?.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
    lastReview = reviewIndex;lastReviewLanguage=String(translated);
  }
  function renderReview() {
    if (reviewIndex < 0 || rows[i].stage !== 2) return;
    const unit = reviewUnits[reviewIndex], role = reviewRole(unit), total = cues.length + reviewUnits.length, number = cues.length + reviewIndex + 1;
    audio.pause();
    scriptWindow.hidden = false;
    $('#curation-chapter').textContent = '先完成關鍵停頓，再逐句檢查會議逐字稿。';
    $('#curation-source').textContent = `會議逐字稿 · 第 ${reviewIndex+1} / ${reviewUnits.length} 句`;
    $('#curation-title').textContent = '會議錄音 · 逐句核對';
    $('#curation-quote').hidden = false;
    $('#curation-quote').textContent = `${unit.speaker}: ${unit.sentence}`;
    const explanation = $('#curation-explanation'); explanation.replaceChildren();
    const banner = document.createElement('p'); banner.className = `curation-type curation-type-${role.type}`; banner.textContent = `類型：${types[role.type]}`;
    const reason = document.createElement('p'); reason.textContent = role.explanation;
    explanation.append(banner,reason);
    $('#curation-step-count').textContent = `${number} / ${total} · ${reviewIndex+1} / ${reviewUnits.length} 句逐句核對`;
    $('#curation-step-jump').textContent = `${number} / ${total} · ${unit.sentence.slice(0,24)}…`;
    const stageCount = $('.curation-stage-item[data-chapter="podcast"] small'); if (stageCount) stageCount.textContent = `${number}/${total}`;
    $('#curation-next').disabled = false;
    $('#curation-next').textContent = reviewIndex === reviewUnits.length-1 ? '完成本章 ✓' : '下一句 →';
    $('#curation-prev').disabled = false;
    $('#curation-bookmark').textContent = books.includes(reviewId(unit)) ? '★' : '☆';
    $('#curation-bookmark').setAttribute('aria-pressed', String(books.includes(reviewId(unit))));
    $('#curation-bookmark-jump').textContent = books.length ? `${books.length} 個書籤　⌄` : '選擇書籤　⌄';
    if (lastReview !== reviewIndex || lastReviewLanguage !== String(language.getAttribute('aria-pressed') === 'true')) paintReviewSentences();
    localStorage.setItem(reviewKey, String(reviewIndex));
  }
  function enterReview(index=0) {
    const needsStage = rows[i].stage !== 2 || !E('notes23');
    i = first(2);
    if (needsStage) render();
    reviewIndex = Math.max(0,Math.min(index,reviewUnits.length-1));
    audio.pause(); done = true; E('next').disabled = false; notes(cues.length);
    scriptWindow.classList.add('mobile-visible');
    E('transcript-toggle').setAttribute('aria-expanded','true');
    E('transcript-toggle').textContent='收起逐字稿';
    completed.add(key23(rows[i]));chaptersDone();
    stagePositions[2] = {key:key23(rows[i]),cue:cueIndex,review:reviewIndex};
    localStorage.setItem(stageKey,JSON.stringify(stagePositions));
    renderReview(); queueSave();
  }
  function leaveReview(targetStage=3) {
    reviewIndex = -1; lastReview = -1; localStorage.setItem(reviewKey,'-1');
    if (stagePositions[2]) stagePositions[2].review = -1;
    clearReviewFocus();
    scriptWindow.classList.remove('mobile-visible');
    E('transcript-toggle').setAttribute('aria-expanded','false');
    E('transcript-toggle').textContent='查看逐字稿';
    i = first(targetStage); render(); update23(true); queueSave();
  }
  function reviewNext() {
    const unit = reviewUnits[reviewIndex], role = reviewRole(unit);
    completed.add(reviewId(unit));
    if (role.fact) completed.add('heard:'+role.fact[2]);
    chaptersDone();
    if (reviewIndex < reviewUnits.length-1) {reviewIndex++; renderReview(); update23(true);} else leaveReview();
  }
  function reviewBack() {
    if (reviewIndex > 0) {reviewIndex--; renderReview(); update23(true); return;}
    reviewIndex = -1; lastReview = -1; localStorage.setItem(reviewKey,'-1');
    if (stagePositions[2]) stagePositions[2].review = -1;
    clearReviewFocus();
    listen(cues.length-1,false); audio.currentTime = transcript[cues.at(-1)[0]].end; done = true;
    E('next').disabled = false; notes(cues.length); paint(); update23(true);
  }
  const oldUpdate = update23;
  update23 = function(force=false) {
    const before = lastSync;
    oldUpdate(force);
    if (before !== lastSync || force) {recordPosition(); queueSave();}
    $('#curation-bookmark-jump').textContent=books.length?books.length+' 個書籤　⌄':'選擇書籤　⌄';
    const row = rows[i], stageRows = rows.filter(x => x.stage === row.stage);
    if (row.stage === 2) {
      const total = cues.length + reviewUnits.length;
      if (reviewIndex >= 0) renderReview();
      else {
        $('#curation-step-count').textContent = `${cueIndex+1} / ${total} · 聆聽關鍵點 ${cueIndex+1} / ${cues.length}`;
        $('#curation-step-jump').textContent = `${cueIndex+1} / ${total} · ${cues[cueIndex][2] || '會議結束'}`;
        const starred=books.includes(cueId(cues[cueIndex])) || cueIndex===0 && books.includes(key23(rows[first(2)]));
        $('#curation-bookmark').textContent=starred?'★':'☆';
        $('#curation-bookmark').setAttribute('aria-pressed',String(starred));
        const count = $('.curation-stage-item[data-chapter="podcast"] small'); if (count) count.textContent = `${cueIndex+1}/${total}`;
        $('#curation-next').textContent = cueIndex === cues.length-1 ? '逐句核對 →' : '下一步 →';
      }
    } else {
      const firstIndex = first(row.stage), endIndex = first(row.stage+1);
      $('#curation-prev').disabled = i === firstIndex;
      if (endIndex >= 0 && i === endIndex-1) $('#curation-next').textContent = '完成本章 ✓';
      if (row.stage === 4 && i === rows.length-1) {$('#curation-next').disabled = false; $('#curation-next').textContent = '返回第一章 ↺';}
    }
  };
  for (const [stage,button] of [...shell.querySelectorAll('.curation-stage-item')].entries()) {
    button.onclick = () => {
      if (stage === 2 && stagePositions[2]?.key) {
        const savedReview = stagePositions[2].review;
        i = first(2); render();
        if (savedReview >= 0) enterReview(savedReview);
        else listen(Math.max(0,Math.min(stagePositions[2].cue || 0,cues.length-1)),false);
      } else {
        if (rows[i].stage === 2 && reviewIndex >= 0) stagePositions[2] = {key:key23(rows[i]),cue:cueIndex,review:reviewIndex};
        reviewIndex = -1;clearReviewFocus();lastReview=-1;
        const saved = stagePositions[stage]?.key, target = saved ? entry23(saved) : -1;
        jump23(target >= 0 && rows[target].stage === stage ? target : first(stage));
      }
      update23(true);
    };
  }
  const oldNext = $('#curation-next').onclick;
  let moving = false;
  async function fly(text,from,task) {
    const to = $(`.curation-bank-${'ABC'[task-1]} summary`);
    if (!from || !to || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
    if (!a.width || !b.width) return;
    const flight = document.createElement('div'); flight.className = `curation-flying cur23-flight-${task}`;
    flight.textContent = text; shell.append(flight);
    Object.assign(flight.style,{left:`${a.left}px`,top:`${a.top}px`,width:`${Math.min(a.width,400)}px`});
    await new Promise(resolve => { requestAnimationFrame(() => {flight.style.transform=`translate(${b.left-a.left}px,${b.top-a.top}px) scale(.3)`;flight.style.opacity='0';}); flight.addEventListener('transitionend',resolve,{once:true});setTimeout(resolve,700); });
    flight.remove();
  }
  $('#curation-next').onclick = async () => {
    if (moving) return;
    if (reviewIndex >= 0 && rows[i].stage === 2) {
      moving = true;
      const unit = reviewUnits[reviewIndex], role = reviewRole(unit);
      if (role.fact && role.type <= 3) await fly(unit.sentence,[...E('turns').children].find(p => +p.dataset.id === unit.turn),role.type);
      reviewNext(); moving = false; return;
    }
    if (rows[i].stage === 2 && cueIndex === cues.length-1 && done) { enterReview(); update23(true); return; }
    if (rows[i].stage === 4 && i === rows.length-1) { completed.add(key23(rows[i])); chaptersDone(); leaveReview(0); return; }
    const row = rows[i];
    const matching = row.stage === 3 && row.t >= 1 && row.t <= 3 && row.state !== 'REJECT' && row.state !== 'SUPERSEDED' && facts.some(f => f[0] === row.t && f[1] === row.p && normalize(row.q) === normalize(f[2]));
    const route = E('refs').querySelector('.route23');
    if (matching && !diag.open && !routing && (!route || route.dataset.seen)) {
      moving = true;
      await fly(row.q,native.querySelector('mark.target'),row.t);
      moving = false;
    }
    oldNext(); update23(true);
  };
  const oldPrev = $('#curation-prev').onclick;
  $('#curation-prev').onclick = () => { if (reviewIndex >= 0 && rows[i].stage === 2) reviewBack(); else oldPrev(); };

  // The step picker and bookmarks include every transcript review sentence.
  function picker(bookmarksOnly) {
    const dialog = $('.curation-picker'), list = $('.choices'), search = $('#curation-picker-search');
    list.replaceChildren();
    const entries = [];
    let writingNumber=0;
    rows.forEach((row,index) => {
      if(row.stage===2)return;
      if(row.stage===4){
        writingNumber++;
        const baseNumber=writingNumber,baseId=key23(row);
        const activate=offset=>{
          if(rows[i].stage===2&&reviewIndex>=0)stagePositions[2]={key:key23(rows[i]),cue:cueIndex,review:reviewIndex};
          reviewIndex=-1;jump23(index);
          if(offset>0){visitIndex=Math.ceil(offset/2);shownByTask[row.t]={i,n:visitIndex};localStorage.setItem('cur23-shown',JSON.stringify(shownByTask));
            if(offset%2)sourceVisit(row.used[visitIndex-1]);else update23(true);
          }
        };
        if((bookmarksOnly&&books.includes(baseId))||(!bookmarksOnly&&rows[i].stage===4))
          entries.push({label:`${baseNumber}. ${row.q||row.a}`,detail:`Task ${'ABC'[row.t-1]} · ${row.p||''}`,activate:()=>activate(0)});
        if(row.pattern)row.used.forEach((factId,refIndex)=>{
          for(let returnStep=0;returnStep<2;returnStep++){
            const offset=refIndex*2+1+returnStep,id=`${baseId}|writing:${offset}`,number=baseNumber+offset,fact=facts[factId];
            if(bookmarksOnly&&!books.includes(id)||!bookmarksOnly&&rows[i].stage!==4)continue;
            entries.push({label:returnStep?`${number}. 返回範文 · ${row.q}`:`${number}. 原文取證 · ${fact[2]}`,
              detail:`Task ${'ABC'[row.t-1]} · ${fact[1]===19?'會議錄音':'Data File 第 '+fact[1]+' 頁'}`,activate:()=>activate(offset)});
          }
        });
        writingNumber+=row.pattern?2*row.used.length:0;
        return;
      }
      if(!bookmarksOnly&&row.stage!==rows[i].stage)return;
      if(bookmarksOnly&&!books.includes(key23(row)))return;
      entries.push({label:`${row.q||row.a}`,detail:`${names23[row.stage]} · ${row.p||''}`,activate:()=>{if(rows[i].stage===2&&reviewIndex>=0)stagePositions[2]={key:key23(rows[i]),cue:cueIndex,review:reviewIndex};reviewIndex=-1;jump23(index);}});
    });
    if (bookmarksOnly || rows[i].stage === 2) cues.forEach((cue,index) => (!bookmarksOnly || books.includes(cueId(cue)) || index===0 && books.includes(key23(rows[first(2)]))) && entries.push({label:`${index+1}. ${cue[2] || '會議結束'}`,detail:'聆聽關鍵點',activate:() => {reviewIndex=-1;localStorage.setItem(reviewKey,'-1');i=first(2);render();listen(index,false);update23(true);}}));
    if (!bookmarksOnly && rows[i].stage === 2 || bookmarksOnly) reviewUnits.forEach((unit,index) => {
      if (bookmarksOnly && !books.includes(reviewId(unit))) return;
      entries.push({label:`${index+1}. ${unit.sentence}`,detail:`會議逐字稿 · ${unit.speaker}`,activate:() => {enterReview(index);update23(true);}});
    });
    for (const entry of entries) {
      const button = document.createElement('button'); button.type='button'; button.className='curation-picker-option';
      const strong=document.createElement('strong'), small=document.createElement('span');
      strong.textContent=entry.label; small.textContent=entry.detail; button.append(strong,small);
      button.dataset.search = `${entry.label} ${entry.detail}`.toLowerCase();
      button.onclick=() => {dialog.close();entry.activate();}; list.append(button);
    }
    if (!entries.length) { const empty=document.createElement('p');empty.className='curation-picker-empty';empty.textContent='暫時沒有書籤。按導覽卡的星號新增。';list.append(empty); }
    search.value=''; search.oninput=() => {const query=search.value.trim().toLowerCase();for(const button of list.querySelectorAll('.curation-picker-option')) button.hidden=!button.dataset.search.includes(query);};
    dialog.showModal(); search.focus();
  }
  $('#curation-step-jump').onclick = () => picker(false);
  $('#curation-bookmark-jump').onclick = () => picker(true);
  const oldBookmark = $('#curation-bookmark').onclick;
  $('#curation-bookmark').onclick = () => {
    if (rows[i].stage !== 2) {oldBookmark();queueSave();return;}
    const id = reviewIndex < 0 ? cueId(cues[cueIndex]) : reviewId(reviewUnits[reviewIndex]);
    if(reviewIndex<0 && cueIndex===0 && books.includes(key23(rows[first(2)]))) books=books.map(key=>key===key23(rows[first(2)])?id:key);
    books = books.includes(id) ? books.filter(item => item !== id) : [...books,id];
    localStorage.setItem('cur23-stars',JSON.stringify(books));update23(true);queueSave();
  };
  // Preserve the real question form installed by reference/question.js.
  $('#curation-help').onclick = () => document.querySelector('.learning-question-launcher')?.click();
  $('#curation-dialogue').onchange = event => {
    $('.curation-dock').classList.toggle('dialogue',event.target.checked);
    $('.curation-character').hidden = !event.target.checked;
    localStorage.setItem('cur23-dialogue',event.target.checked?'1':'0');queueSave();
  };
  $('#curation-dialogue').checked = localStorage.getItem('cur23-dialogue') === '1';
  $('.curation-dock').classList.toggle('dialogue',$('#curation-dialogue').checked);
  $('.curation-character').hidden = !$('#curation-dialogue').checked;
  $('#curation-spotlight').checked = localStorage.getItem('cur23-spotlight') === '1';
  E('spot23').checked = $('#curation-spotlight').checked;

  $('#curation-spotlight').onchange = event => {
    E('spot23').checked = event.target.checked;

    localStorage.setItem('cur23-spotlight',event.target.checked?'1':'0');queueSave();
  };

  // Annotate the reconstructed source, preserving its original text and page order.
  const requirementPoints = new Map([
    ['show our support','1'],['acknowledge and explain William’s mistake','2'],['explain the misunderstandings','3'],
    ['Three courses will be enough','1'],['explain how their work will benefit from each one','2'],
    ['we’ve made several changes since that draft','1']
  ]);
  const initialRoutes = new Map([
    ['see the article from Big Cheese Celebrity Food Gossip',[5,'A']],
    ['present his side of the story',[7,'A']],
    ['Corporate Training Intranet page, along with reviews',[9,'B']],
    ['script for the promotional video',[6,'C']],
    ['both William and Dante giving some updates',[8,'C']]
  ]);
  const stampCache = new Map();
  function currentTasks(page) {
    const tasks = new Set();
    const bossLimit = rows[i].stage > 0 ? rows.filter(r => r.stage === 0).length-1 : i;
    rows.slice(0,bossLimit+1).filter(r => r.stage === 0).forEach(r => {
      if (page === 4 && r.t >= 1 && r.t <= 3) tasks.add('ABC'[r.t-1]);
      const route = initialRoutes.get(r.q);if (route?.[0] === page) tasks.add(route[1]);
    });
    rows.forEach((r,index) => {
      if (r.stage !== 1 || r.leaf !== page || (rows[i].stage === 1 && index > i) || rows[i].stage < 1) return;
      for (const task of 'ABC') if (localStorage.getItem('class23-'+index+task)==='1') tasks.add(task);
    });
    const sourceLimit = rows[i].stage > 3 ? rows.length-1 : rows[i].stage === 3 ? i : -1;
    rows.slice(0,sourceLimit+1).filter(r => r.stage === 3 && r.p === page && r.t >= 1 && r.t <= 3 && r.state !== 'REJECT').forEach(r => tasks.add('ABC'[r.t-1]));
    return [...tasks].sort();
  }
  function decorateSource(page) {
    const article = native.querySelector('.paper-page'); if (!article) return;
    const marks = [...article.querySelectorAll('mark')];
    for (const mark of marks) {
      const candidate = rows[Number(mark.dataset.stepIndex)];
      if (candidate) {
        const point = requirementPoints.get(candidate.q);
        if (page === 4 && point) {mark.classList.add('cur23-boss-point');mark.dataset.point=point;}
        if (page === 4 && candidate.t === 5) mark.classList.add('cur23-boss-hint');
        mark.dataset.stepIndex = String(rows.indexOf(candidate));mark.tabIndex=0;
        mark.setAttribute('role','button');mark.setAttribute('aria-label',`回到導覽步驟：${candidate.q}`);
      }
    }
    if (page === 4) {
      for (const p of article.querySelectorAll('.email-content p[lang="en"]')) {
        const text = p.textContent;
        const task = text.startsWith('I need you to write the announcement')?'A':text.startsWith('I also need you to write an email')?'B':text.startsWith('Next, please write the script')?'C':null;
        if (!task) continue;
        p.dataset.curationTask=task;
        p.classList.toggle('cur23-task-revealed',marks.some(mark => p.contains(mark)));
      }
    }
    const tasks = currentTasks(page), header = article.querySelector(':scope > header');
    if (header) {
      header.querySelector('.cur23-file-stamps')?.remove();
      if (tasks.length) {
        const holder=document.createElement('div');holder.className='cur23-file-stamps';holder.setAttribute('aria-label',`本頁任務標記：${tasks.join('、')}`);
        const before = stampCache.get(page) || [];
        for (const task of tasks) {const stamp=document.createElement('span');stamp.className=`cur23-file-stamp cur23-file-stamp-${task}`;stamp.textContent=task;stamp.setAttribute('role','img');stamp.setAttribute('aria-label',`Task ${task}`);if (!before.includes(task)) stamp.classList.add('cur23-stamp-enter');holder.append(stamp);}
        header.prepend(holder);
      }
      header.classList.toggle('cur23-has-file-stamps',!!tasks.length);
      stampCache.set(page,tasks);
    }
    article.onclick = event => {
      const mark = event.target.closest('mark[data-step-index]');
      if (mark) jump23(Number(mark.dataset.stepIndex));
    };
    article.onkeydown = event => {
      if (!['Enter',' '].includes(event.key)) return;
      const mark = event.target.closest('mark[data-step-index]');
      if (mark) {event.preventDefault();jump23(Number(mark.dataset.stepIndex));}
    };
  }
  const oldNative = nativePage;
  nativePage = function(page,row) {oldNative(page,row);decorateSource(page);};
  const oldUpdateNative = update23;
  let lastDecorated = '';
  update23 = function(force=false) {
    oldUpdateNative(force);
    const signature = `${i}:${rows[i].leaf || 4}:${lastNative}`;
    if (!nativeHost.hidden && (force || signature !== lastDecorated)) {decorateSource(rows[i].leaf || 4);lastDecorated = signature;}
  };
  // Reapply category stamps immediately when a learner changes a provisional task.
  shell.addEventListener('change',event => {if (event.target.closest('.curation-category-choices')) {decorateSource(rows[i].leaf || 4);lastDecorated = '';queueSave();}});
  if (rows[i].stage === 2 && reviewIndex >= 0) enterReview(reviewIndex);
  update23(true); saveNow();
})();

// Keep the writing chapter on its own workspace; reveal models after four preparation actions.
(() => {
  'use strict';
  const writingStarts = [
    ['Public announcement concerning','Teen NetChef TV supports','William did flood','Some viewers believe','Finally, some viewers thought','We ask viewers'],
    ['Dear all,','I recommend three courses','Hazard Awareness,','The Chef’s Special','Be Your Best!','Each course counts','Please sign up','Regards,'],
    ['Viewer’s Choice: A New Way','TITLE CARD:','VOICEOVER: Meet','EPISODE 1 CARD:','VOICEOVER: In Episode','PRIZE CARD','VOICEOVER: One lucky','FlyingFood will','Viewer’s Choice -','Watch and vote!']
  ];
  const prepTitles = ['拆解題目','整理內容骨架','獨立完成初稿','核對事實及語氣'];
  const contracts = [
    [['寫作者','Nico Lin，Teen NetChef TV 員工'],['讀者','網站公眾'],['文類','網站公告'],['內容','支持 William；承認並解釋真實失誤；澄清其他誤會'],['來源','Data File 與會議筆記']],
    [['寫作者','Nico Lin，Teen NetChef TV 員工'],['讀者','全體員工'],['文類','培訓推薦電郵'],['內容','推薦三門課，說明各門課的工作得益'],['來源','Data File 與會議筆記']],
    [['寫作者','Nico Lin，Teen NetChef TV 員工'],['讀者','節目觀眾'],['文類','宣傳短片劇本'],['內容','介紹最新節目安排和觀眾參與方法'],['來源','Data File 與會議筆記']]
  ];
  const skeletons = [
    ['開首：公司立場','已確認的錯誤及原因','其他指控與逐項澄清','結尾：安全承諾'],
    ['課程 1：名稱、供應者、工作技能','課程 2：名稱、供應者、工作技能','課程 3：名稱、供應者、工作技能','學分和額外假期的條件'],
    ['開場畫面及兩位主持','直播和觀眾投票','首集選項與免費投票方法','獎品、送遞及收尾']
  ];
  const checks = [
    ['水浸是已確認的失誤；其他指控須逐項澄清','不把小報說法寫成已證實的事實','語氣適合公開網站公告'],
    ['三門課和供應者逐一配對','分開培訓學分與有條件的額外假期','稱呼、語氣和結尾適合全體員工電郵'],
    ['使用更新後的節目資料，不照抄過時分鏡','交代直播、免費 app 投票、首集選項及獎品','畫面卡與旁白清楚分開']
  ];
  const promptPage = [11,14,16];
  let lastWritingStep = '';
  function taskNav() {
    const nav=document.createElement('nav');nav.className='cur23-model-nav';nav.setAttribute('aria-label','切換寫作任務並返回上次位置');
    for(let task=1;task<=3;task++){
      const button=document.createElement('button');button.type='button';button.textContent=`Task ${'ABC'[task-1]}`;
      button.setAttribute('aria-current',String(task===rows[i].t));
      button.onclick=()=>{const saved=shownByTask[task],target=rows[saved?.i]?.stage===4&&rows[saved.i]?.t===task?saved.i:rows.findIndex(item=>item.stage===4&&item.t===task);jump23(target);if(saved?.i===target&&rows[target]?.pattern){visitIndex=Math.max(0,Math.min(rows[target].used.length,Number(saved.n)||0));shownByTask[task]={i:target,n:visitIndex};localStorage.setItem('cur23-shown',JSON.stringify(shownByTask));update23(true);}};
      nav.append(button);
    }
    return nav;
  }
  function paperHeader(row,preparing) {
    const header=document.createElement('header');header.className='cur23-model-header';
    const eyebrow=document.createElement('span');eyebrow.textContent=`TASK ${row.t+7} · ${preparing?'WRITING PREPARATION':'TEACHING MODEL'}`;
    const heading=document.createElement('h2');heading.textContent=preparing?`Task ${'ABC'[row.t-1]} · ${prepTitles[rows.filter(item=>item.stage===4&&item.t===row.t).indexOf(row)]}`:`Task ${'ABC'[row.t-1]} · 參考範文`;
    const kind=document.createElement('p');kind.textContent=['網站公告 · 公眾','培訓推薦電郵 · 全體員工','宣傳短片講稿 · 觀眾'][row.t-1];
    header.append(eyebrow,heading,kind);return header;
  }
  function renderPreparation(row) {
    const taskRows=rows.filter(item=>item.stage===4&&item.t===row.t),step=taskRows.indexOf(row);
    surface.replaceChildren();surface.className='paper cur23-writing-paper';
    surface.append(paperHeader(row,true),taskNav());
    const progress=document.createElement('p');progress.className='cur23-prep-progress';progress.textContent=`準備 ${step+1} / 4 · 完成四步後逐句閱讀參考範文`;surface.append(progress);
    const question=document.createElement('blockquote');question.className='cur23-writing-prompt';{const lines=leaves[promptPage[row.t-1]].split('\n');question.textContent=[lines.find(line=>line.startsWith(`Task ${row.t+7}:`)),lines.find(line=>line.startsWith('Write '))].filter(Boolean).join(' ');}surface.append(question);
    const guide=document.createElement('p');guide.className='cur23-model-note';guide.textContent=row.a;surface.append(guide);
    if(step===0){
      const list=document.createElement('dl');list.className='cur23-writing-contract';
      for(const [name,value] of contracts[row.t-1]){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=name;dd.textContent=value;list.append(dt,dd);}surface.append(list);
    }else if(step===1){
      const grid=document.createElement('div');grid.className='cur23-writing-skeleton';
      skeletons[row.t-1].forEach((label,index)=>{
        const field=document.createElement('label'),title=document.createElement('strong'),area=document.createElement('textarea');
        const key=`cur23-plan-${row.t}-${index}`;title.textContent=label;area.rows=2;area.value=localStorage.getItem(key)||'';
        area.setAttribute('aria-label',label);area.oninput=()=>localStorage.setItem(key,area.value);
        field.append(title,area);grid.append(field);
      });surface.append(grid);
    }else if(step===2){
      const note=document.createElement('p');note.className='cur23-prep-draft-note';note.textContent='在下方草稿欄獨立寫作。參考範文會在下一步的事實及語氣核對後開啟。';surface.append(note);
    }else if(step===3){
      const list=document.createElement('div');list.className='cur23-writing-checks';
      checks[row.t-1].forEach((label,index)=>{
        const item=document.createElement('label'),box=document.createElement('input'),key=`cur23-check-${row.t}-${index}`;
        box.type='checkbox';box.checked=localStorage.getItem(key)==='1';box.onchange=()=>localStorage.setItem(key,box.checked?'1':'0');
        item.append(box,document.createTextNode(label));list.append(item);
      });surface.append(list);
      const open=document.createElement('button');open.type='button';open.className='cur23-open-model';open.textContent=`開啟 Task ${'ABC'[row.t-1]} 參考範文 →`;
      open.onclick=()=>shell.querySelector('#curation-next').click();surface.append(open);
    }
  }
  function renderModel(row) {
    const full=models[row.t-1].replace(/\s+/g,' ').trim();
    const starts=writingStarts[row.t-1].map(phrase=>full.indexOf(phrase)).filter(at=>at>=0);
    if(!starts.includes(0))starts.unshift(0);starts.sort((a,b)=>a-b);
    const modelRows=writingRows.filter(item=>item.t===row.t&&item.pattern),positions=new Map();
    let cursor=0;
    for(const item of modelRows){let at=full.indexOf(item.q,cursor);if(at<0)at=full.indexOf(item.q);positions.set(item,at);if(at>=0)cursor=at+item.q.length;}
    const currentAt=positions.get(row)??-1,currentEnd=currentAt+row.q.length;
    const marks=[];
    for(const item of modelRows){if(rows.indexOf(item)>i)break;const at=positions.get(item);if(at==null||at<0)continue;
      const phrase=item.pattern,structureAt=item.q.toLowerCase().indexOf(phrase.toLowerCase());
      if(structureAt>=0)marks.push({lo:at+structureAt,hi:at+structureAt+phrase.length,kind:'structure'});
      for(const id of item.used){const keyword=facts[id]?.[3];if(!keyword)continue;const local=item.q.toLowerCase().indexOf(keyword.toLowerCase());
        if(local>=0)marks.push({lo:at+local,hi:at+local+keyword.length,kind:'content'});
      }
    }
    function appendColored(parent,from,to){
      const boundaries=new Set([from,to]);for(const mark of marks){if(mark.hi<=from||mark.lo>=to)continue;boundaries.add(Math.max(from,mark.lo));boundaries.add(Math.min(to,mark.hi));}
      const ordered=[...boundaries].sort((a,b)=>a-b);
      for(let k=0;k<ordered.length-1;k++){const lo=ordered[k],hi=ordered[k+1];if(hi<=lo)continue;
        const active=marks.filter(mark=>mark.lo<=lo&&mark.hi>=hi);const kind=active.some(mark=>mark.kind==='structure')?'structure':active.length?'content':'';
        if(!kind)parent.append(document.createTextNode(full.slice(lo,hi)));
        else{const span=document.createElement('span');span.textContent=full.slice(lo,hi);span.className=kind==='structure'?'cur23-essay-structure':`cur23-essay-content-${'ABC'[row.t-1]}`;parent.append(span);}
      }
    }
    surface.replaceChildren();surface.className='paper cur23-writing-paper';surface.append(paperHeader(row,false),taskNav());
    const essay=document.createElement('div');essay.className='cur23-model-essay';
    for(let j=0;j<starts.length;j++){
      const lo=starts[j],rawHi=starts[j+1]??full.length,hi=rawHi>lo&&full[rawHi-1]===' '?rawHi-1:rawHi;
      if(hi<=lo)continue;const paragraph=document.createElement(j===0?'h3':'p');
      if(currentAt<lo||currentAt>=hi)appendColored(paragraph,lo,hi);
      else{
        appendColored(paragraph,lo,currentAt);
        const current=document.createElement('span');current.className='current-model';appendColored(current,currentAt,Math.min(currentEnd,hi));paragraph.append(current);
        appendColored(paragraph,Math.min(currentEnd,hi),hi);
      }
      essay.append(paragraph);
    }
    surface.append(essay);
  }
  for(let task=1;task<=3;task++){choose.children[task-1].onclick=()=>{const stage=rows[i].stage===3?3:4;const target=rows.findIndex(item=>item.stage===stage&&item.t===task);if(target>=0)jump23(target);};}
  const previousDisplayUpdate=update23;
  update23=function(force=false){
    previousDisplayUpdate(force);
    const row=rows[i],showNative=!opened||row.stage===0||row.stage===1||row.stage===3;
    nativeHost.hidden=!showNative;
    if(showNative)nativeHost.style.removeProperty('display');
    else nativeHost.style.setProperty('display','none','important');
    section23.classList.toggle('native-active',showNative);
    E('title').hidden=opened&&row.stage===4;
    E('open').hidden=opened&&row.stage===4;
    if(opened&&row.stage===4){
      E('pdf').hidden=true;surface.hidden=false;surface.style.removeProperty('display');
      const signature=`${i}:${row.t}:${row.q}`;
      if(signature!==lastWritingStep||!surface.classList.contains('cur23-writing-paper')){
        lastWritingStep=signature;
        if(row.pattern)renderModel(row);else renderPreparation(row);
      }
    }else lastWritingStep='';
  };
  // Count source inspection and the return to the essay as separate writing steps.
  const writingRows=rows.filter(row=>row.stage===4);
  const writingTotal=writingRows.reduce((sum,row)=>sum+1+(row.pattern?2*row.used.length:0),0);
  const writingStepKey='cur23-writing-step';
  let lastVirtualState='';
  function writingOffset(row){return row.pattern?Math.max(0,Math.min(2*row.used.length,2*visitIndex-(diag.open?1:0))):0;}
  function writingNumber(row){let number=1;for(const item of writingRows){if(item===row)break;number+=1+(item.pattern?2*item.used.length:0);}return number+writingOffset(row);}
  const previousCountUpdate=update23;
  update23=function(force=false){
    previousCountUpdate(force);
    const row=rows[i];if(row.stage!==4||!opened)return;
    const offset=writingOffset(row),number=writingNumber(row);
    shell.querySelector('#curation-step-count').textContent=`${number} / ${writingTotal} · ${row.pattern?'逐句核對':'寫作準備'}`;
    if(!row.pattern){const step=writingRows.filter(item=>item.t===row.t).indexOf(row);shell.querySelector('#curation-source').textContent=`Question-Answer Book · Task ${row.t+7}`;shell.querySelector('#curation-title').textContent=`Task ${'ABC'[row.t-1]} · ${prepTitles[step]}`;}
    const stepLabel=shell.querySelector('.curation-stage-item[data-chapter="writing"] small');
    if(stepLabel)stepLabel.textContent=`${number}/${writingTotal}`;
    shell.querySelector('#curation-step-jump').textContent=`${number} / ${writingTotal} · ${(row.q||row.a).slice(0,25)}`;
    if(row.pattern&&diag.open){
      const fact=row.used[visitIndex-1];
      if(fact!=null)shell.querySelector('#curation-source').textContent=`原文取證 · ${facts[fact][1]===19?'會議錄音':'Data File 第 '+facts[fact][1]+' 頁'}`;
      shell.querySelector('#curation-next').textContent='返回範文 →';
    }else if(row.pattern&&visitIndex>0&&visitIndex<=row.used.length){
      shell.querySelector('#curation-next').textContent=visitIndex<row.used.length?'核對下一處原文 →':'下一句 →';
    }
    const bookmarkId=offset>0?`${key23(row)}|writing:${offset}`:key23(row);
    shell.querySelector('#curation-bookmark').textContent=books.includes(bookmarkId)?'★':'☆';
    shell.querySelector('#curation-bookmark').setAttribute('aria-pressed',String(books.includes(bookmarkId)));
    shell.querySelector('#curation-bookmark-jump').textContent=books.length?`${books.length} 個書籤　⌄`:'選擇書籤　⌄';
    const state=JSON.stringify({key:key23(row),offset});
    if(state!==lastVirtualState){localStorage.setItem(writingStepKey,state);lastVirtualState=state;}
  };
  const previousWritingBookmark=shell.querySelector('#curation-bookmark').onclick;
  shell.querySelector('#curation-bookmark').onclick=()=>{const row=rows[i],offset=row.stage===4?writingOffset(row):0;if(offset===0){previousWritingBookmark();return;}
    const id=`${key23(row)}|writing:${offset}`;books=books.includes(id)?books.filter(item=>item!==id):[...books,id];
    localStorage.setItem('cur23-stars',JSON.stringify(books));update23(true);
  };
  const previousWritingBack=shell.querySelector('#curation-prev').onclick;
  shell.querySelector('#curation-prev').onclick=()=>{
    const row=rows[i],atSentence=row.stage===4&&row.pattern&&!diag.open&&visitIndex===0;
    if(row.stage===4&&row.pattern&&!diag.open&&visitIndex>0){sourceVisit(row.used[visitIndex-1]);update23(true);return;}
    previousWritingBack();
    const earlier=rows[i];
    if(atSentence&&earlier!==row&&earlier.stage===4&&earlier.pattern&&earlier.used.length){
      visitIndex=earlier.used.length;shownByTask[earlier.t]={i,n:visitIndex};
      localStorage.setItem('cur23-shown',JSON.stringify(shownByTask));update23(true);
    }
  };
  let savedWriting;
  try{savedWriting=JSON.parse(localStorage.getItem(writingStepKey)||'null')}catch{}
  if(savedWriting&&rows[i].stage===4&&savedWriting.key===key23(rows[i])){
    const row=rows[i],offset=Number(savedWriting.offset);
    if(Number.isInteger(offset)&&offset>=0&&offset<=2*(row.used?.length||0)){
      visitIndex=Math.ceil(offset/2);shownByTask[row.t]={i,n:visitIndex};
      if(offset%2===1&&row.used[visitIndex-1]!=null)sourceVisit(row.used[visitIndex-1]);
    }
  }
  update23(true);
})();
