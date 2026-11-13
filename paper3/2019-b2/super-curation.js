(()=>{
  'use strict';
  const sourceData=window.EDMUND_2019_B2_SOURCE_UNITS;
  const listeningData=window.EDMUND_2019_B2_LISTENING;
  const modelData=window.EDMUND_2019_B2_MODELS;
  if(!sourceData||!listeningData||!modelData||!document.querySelector('#reader')||document.querySelector('#super-curation'))return;

  const VERSION='2019-b2-super-curation-v2';
  const STORAGE='edmund-paper3-2019-b2-curation-v2';
  const LEGACY_STORAGE='edmund-paper3-2019-b2-curation-v1';
  const DECISIONS=['獨立寫入','合併寫入','只保留結論','只控制語氣／格式','只用來判斷證據狀態','只作指路','不寫入答案'];
  const BANKABLE=new Set(['獨立寫入','合併寫入','只保留結論']);
  const units=sourceData.units;
  const unitById=new Map(units.map(unit=>[unit.id,unit]));
  const contentPointMaps={8:new Map(),9:new Map(),10:new Map()};
  for(const task of [8,9,10])units.filter(unit=>unit.tasks.includes(task)&&[1,2,3].includes(unit.typeNumber)&&BANKABLE.has(unit.decision)).forEach((unit,index)=>contentPointMaps[task].set(unit.id,index+1));
  const NOTE_IDS=new Set(['poster','deadline','brighthouse','prize','cinema-home','film-budget']);
  const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $=(selector,root=document)=>root.querySelector(selector);
  const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
  const escape=value=>String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const wordCount=value=>(String(value||'').trim().match(/[A-Za-z]+(?:[’'-][A-Za-z]+)*/g)||[]).length;
  const formatTime=seconds=>`${Math.floor(seconds/60)}:${String(Math.floor(seconds%60)).padStart(2,'0')}`;
  const defaultState=()=>({version:VERSION,tab:'contracts',unitId:units[0].id,decision:'all',task:'all',reviewed:[],bank:{8:[],9:[],10:[]},notes:{},generatedNotes:{},noteRevealed:[],heardCues:[],categories:{},categoryRevealed:[],bookmarks:[],completedTabs:[],writingTask:8,plans:{8:'',9:'',10:''},drafts:{8:'',9:'',10:''},modelUnlocked:{8:false,9:false,10:false},modelUses:{8:[],9:[],10:[]},questionDraft:'',playbackRate:1,transcriptOpen:false,spotlight:true,windowLayout:{transcript:null,preview:null},returnRoute:null});
  function sanitizeState(saved){
    const fresh=defaultState();if(!saved||typeof saved!=='object')return fresh;
    const validIds=new Set(units.map(unit=>unit.id));const validCue=index=>Number.isInteger(index)&&index>=0&&index<listeningData.cueCount;
    const clean={...fresh,version:VERSION};
    clean.tab=['contracts','categorize','listen','evidence','writing'].includes(saved.tab)?saved.tab:'contracts';
    clean.unitId=validIds.has(saved.unitId)?saved.unitId:units[0].id;
    clean.decision=saved.decision==='all'||DECISIONS.includes(saved.decision)?saved.decision:'all';
    clean.task=['all','none','8','9','10'].includes(String(saved.task))?String(saved.task):'all';
    clean.reviewed=[...new Set(Array.isArray(saved.reviewed)?saved.reviewed.filter(id=>validIds.has(id)):[])];
    clean.bank={8:[],9:[],10:[]};for(const task of [8,9,10])clean.bank[task]=[...new Set(Array.isArray(saved.bank?.[task])?saved.bank[task].filter(id=>validIds.has(id)):[])];
    clean.notes=saved.notes&&typeof saved.notes==='object'?{...saved.notes}:{};
    clean.generatedNotes={};if(saved.generatedNotes&&typeof saved.generatedNotes==='object')for(const [id,value] of Object.entries(saved.generatedNotes))if(NOTE_IDS.has(id)&&typeof value==='string')clean.generatedNotes[id]=value.slice(0,2000);
    clean.noteRevealed=[...new Set(Array.isArray(saved.noteRevealed)?saved.noteRevealed.filter(id=>NOTE_IDS.has(id)):[])];
    clean.heardCues=[...new Set(Array.isArray(saved.heardCues)?saved.heardCues.filter(validCue):[])].sort((a,b)=>a-b);
    clean.categories={};if(saved.categories&&typeof saved.categories==='object')for(const [id,value] of Object.entries(saved.categories))if(validIds.has(id)&&Array.isArray(value))clean.categories[id]=[...new Set(value.map(Number).filter(task=>[8,9,10].includes(task)))];
    clean.categoryRevealed=[...new Set(Array.isArray(saved.categoryRevealed)?saved.categoryRevealed.filter(id=>validIds.has(id)):[])];
    clean.bookmarks=[...new Set(Array.isArray(saved.bookmarks)?saved.bookmarks.filter(value=>typeof value==='string'&&value.length<100):[])];
    clean.completedTabs=[...new Set(Array.isArray(saved.completedTabs)?saved.completedTabs.filter(tab=>['contracts','categorize','listen','evidence','writing'].includes(tab)):[])];
    clean.writingTask=[8,9,10].includes(Number(saved.writingTask))?Number(saved.writingTask):8;
    clean.plans={...fresh.plans,...(saved.plans||{})};clean.drafts={...fresh.drafts,...(saved.drafts||{})};clean.modelUnlocked={...fresh.modelUnlocked,...(saved.modelUnlocked||{})};
    clean.modelUses={8:[],9:[],10:[]};for(const task of [8,9,10])clean.modelUses[task]=[...new Set(Array.isArray(saved.modelUses?.[task])?saved.modelUses[task].filter(id=>validIds.has(id)):[])];
    clean.questionDraft=typeof saved.questionDraft==='string'?saved.questionDraft.slice(0,5000):'';
    clean.playbackRate=[.5,.75,1,1.25,1.5,1.75,2].includes(Number(saved.playbackRate))?Number(saved.playbackRate):1;
    clean.spotlight=saved.spotlight===undefined?true:Boolean(saved.spotlight);
    clean.transcriptOpen=Boolean(saved.transcriptOpen);clean.windowLayout=saved.windowLayout&&typeof saved.windowLayout==='object'?{...fresh.windowLayout,...saved.windowLayout}:{...fresh.windowLayout};
    clean.returnRoute=saved.returnRoute&&typeof saved.returnRoute==='object'?saved.returnRoute:null;
    return clean;
  }
  function loadEnvelope(){
    try{const stored=JSON.parse(localStorage.getItem(STORAGE)||'null');if(stored?.version===VERSION&&stored.slots&&typeof stored.slots==='object'){const activeSlot=/^[1-5]$/.test(String(stored.activeSlot))?String(stored.activeSlot):'1';const slots={};for(let index=1;index<=5;index+=1)if(stored.slots[index])slots[index]=sanitizeState(stored.slots[index]);return {activeSlot,slots};}}catch{}
    try{const legacy=JSON.parse(localStorage.getItem(LEGACY_STORAGE)||'null');if(legacy?.version==='2019-b2-super-curation-v1')return {activeSlot:'1',slots:{1:sanitizeState(legacy)}};}catch{}
    return {activeSlot:'1',slots:{}};
  }
  const envelope=loadEnvelope();let activeSlot=envelope.activeSlot;let slots=envelope.slots;let state=sanitizeState(slots[activeSlot]);
  const save=()=>{state.version=VERSION;state.updatedAt=new Date().toISOString();slots[activeSlot]=sanitizeState(state);const status=$('#gm-save-status');try{localStorage.setItem(STORAGE,JSON.stringify({version:VERSION,activeSlot,slots}));if(status)status.textContent=`Slot ${activeSlot} · 已自動儲存在這部裝置`;}catch(error){if(status)status.textContent='本機儲存失敗；目前工作階段仍可使用，請匯出存檔。';announce('Local save failed; current session remains usable and export is available.');}};
  const announce=message=>{const live=$('#gm-live');if(live)live.textContent=message;};
  const afterMotion=(node,eventName,timeout,callback)=>{let settled=false;const finish=()=>{if(settled)return;settled=true;clearTimeout(timer);node?.removeEventListener(eventName,finish);callback();};const timer=setTimeout(finish,reduceMotion?0:timeout);node?.addEventListener(eventName,finish,{once:true});return finish;};
  const viewportBox=()=>({left:visualViewport?.offsetLeft||0,top:visualViewport?.offsetTop||0,width:visualViewport?.width||innerWidth,height:visualViewport?.height||innerHeight});
  let spotlightFrame=0,spotlightUntil=0,pendingStampUnit=null,routeGhostUnit=null,noteTyping=null,previewInkTimer=0;
  const bankTransfers=new Set();
  function spotlightTarget(){if(!state.spotlight||state.returnRoute||!['contracts','categorize','evidence'].includes(state.tab))return null;if(state.tab==='contracts')return $('#gm-contracts .gm-task-card');return $(`#gm-${state.tab} .gm-unit`);}
  function placeSpotlight(){const wrap=$('.gm-spotlight');const target=spotlightTarget();if(!wrap||!target){if(wrap)wrap.hidden=true;return;}const rect=target.getBoundingClientRect(),pad=9,view=viewportBox(),viewRight=view.left+view.width,viewBottom=view.top+view.height;wrap.hidden=false;const top=Math.max(view.top,rect.top-pad),left=Math.max(view.left,rect.left-pad),right=Math.min(viewRight,rect.right+pad),bottom=Math.min(viewBottom,rect.bottom+pad);Object.assign($('[data-mask="top"]',wrap).style,{left:`${view.left}px`,top:`${view.top}px`,width:`${view.width}px`,height:`${Math.max(0,top-view.top)}px`});Object.assign($('[data-mask="right"]',wrap).style,{left:`${right}px`,top:`${top}px`,width:`${Math.max(0,viewRight-right)}px`,height:`${Math.max(0,bottom-top)}px`});Object.assign($('[data-mask="bottom"]',wrap).style,{left:`${view.left}px`,top:`${bottom}px`,width:`${view.width}px`,height:`${Math.max(0,viewBottom-bottom)}px`});Object.assign($('[data-mask="left"]',wrap).style,{left:`${view.left}px`,top:`${top}px`,width:`${Math.max(0,left-view.left)}px`,height:`${Math.max(0,bottom-top)}px`});target.classList.add('gm-active-target');}
  function trackSpotlight(){cancelAnimationFrame(spotlightFrame);$$('.gm-active-target').forEach(node=>node.classList.remove('gm-active-target'));placeSpotlight();spotlightUntil=performance.now()+(reduceMotion?0:900);const follow=now=>{placeSpotlight();if(now<spotlightUntil)spotlightFrame=requestAnimationFrame(follow);};if(!reduceMotion)spotlightFrame=requestAnimationFrame(follow);}
  function suspendSpotlight(){cancelAnimationFrame(spotlightFrame);const wrap=$('.gm-spotlight');if(wrap)wrap.hidden=true;$$('.gm-active-target').forEach(node=>node.classList.remove('gm-active-target'));}
  function animateArrival(panel){if(!panel)return;panel.classList.remove('gm-arriving');void panel.offsetWidth;panel.classList.add('gm-arriving');afterMotion(panel,'animationend',550,()=>panel.classList.remove('gm-arriving'));}
  function scrollInstant(target,block='start'){if(!target)return;const root=document.documentElement,previous=root.style.scrollBehavior;root.style.scrollBehavior='auto';target.scrollIntoView({behavior:'auto',block});root.style.scrollBehavior=previous;}
  function nativePageAsset(page){const original=$(`#page-${page} .reference-scan img`);return original?.currentSrc||original?.src||new URL(`assets/page-${String(page).padStart(2,'0')}.webp`,document.baseURI).href;}

  const tasks={
    8:{name:'Task 8 · Report',genre:'Formal report',audience:'Inter-School Visual Media Society committee',purpose:'Persuade the committee not to choose Brighthouse Cinema.',words:'around 180',sources:'B2 Data File + listening notes',page:12,prohibition:'Use verified incompatibilities. Do not turn compliant facts into faults.'},
    9:{name:'Task 9 · Programme text',genre:'Festival programme copy',audience:'Visual Media Festival audience',purpose:'Explain the theme, outline the plot and promote the stand-out scene.',words:'around 120',sources:'B2 Data File',page:15,prohibition:'Do not repeat pre-filled metadata or convert production anecdotes into plot.'},
    10:{name:'Task 10 · Introductory speech',genre:'Spoken introduction',audience:'Post-screening discussion audience',purpose:'Open a balanced discussion on home/cinema viewing and blockbusters/low-budget films.',words:'around 200',sources:'B2 Data File + listening notes',page:17,prohibition:'Present both sides; do not turn forum hyperbole into certain fact.'}
  };
  const noteDefinitions=[
    {id:'poster',label:'Short Video Competition · Poster',cue:28,check:'Correct URL: www.isvms.hk; QR code at the bottom-left corner.'},
    {id:'deadline',label:'Short Video Competition · Deadline',cue:34,check:'Extended deadline: 13 May.'},
    {id:'brighthouse',label:'Brighthouse Cinema',cue:69,check:'Isabel still attending in a wheelchair; ramp to stage required; at least 10 ushers; noodles/outside-food permission is essential.'},
    {id:'prize',label:'Prize Giving Ceremony',cue:80,check:'Cultural Plaza, Central; Saturday 22 June; 7:30 p.m.'},
    {id:'cinema-home',label:'Speech · cinema vs home',cue:93,check:'Home VR can provide the same 360-degree sofa experience; balance this with the Data File’s shared group experience.'},
    {id:'film-budget',label:'Speech · blockbusters vs low-budget films',cue:101,check:'Resource concentration, larger profits and multi-million-dollar marketing disadvantage; add the Data File’s optimistic counterargument.'}
  ];
  const nativeNoteSheet=$('#page-3 .conference-notes');
  const nativeNoteAnchor=document.createComment('2019 B2 native note sheet mount point');
  if(nativeNoteSheet)nativeNoteSheet.parentNode.insertBefore(nativeNoteAnchor,nativeNoteSheet);

  const shell=document.createElement('section');
  shell.id='super-curation';shell.className='gm-shell';shell.setAttribute('aria-labelledby','gm-title');
  shell.innerHTML=`
    <div class="gm-masthead"><p class="gm-kicker">Golden Manual · 2019 B2 permanent curation</p><h2 id="gm-title">From source unit to full-mark answer</h2><p>先讀任務、再分類、按錄音做筆記、逐項取證，最後才寫作和核對範文。每一步只處理一個有穩定編號的 source unit。</p><div class="gm-proof-strip"><span>420 atomic units</span><span>7 answer decisions</span><span>19 source pages</span><span>107 authentic cues</span><span>3 bidirectional model maps</span></div></div>
    <div class="gm-tabs" role="tablist" aria-label="Super Curation chapters">
      <button class="gm-tab" role="tab" data-tab="contracts" aria-controls="gm-contracts">1 · 任務</button>
      <button class="gm-tab" role="tab" data-tab="categorize" aria-controls="gm-categorize">2 · 分類</button>
      <button class="gm-tab" role="tab" data-tab="listen" aria-controls="gm-listen">3 · 聆聽</button>
      <button class="gm-tab" role="tab" data-tab="evidence" aria-controls="gm-evidence">4 · 取證</button>
      <button class="gm-tab" role="tab" data-tab="writing" aria-controls="gm-writing">5 · 寫作</button>
    </div>
    <div class="gm-controller" aria-label="Super Curation controller">
      <div class="gm-controller-nav"><button class="gm-btn" id="gm-prev-step">← 上一步</button><button class="gm-btn" id="gm-help" aria-haspopup="dialog" aria-controls="gm-help-dialog">需要更多協助</button><button class="gm-btn primary" id="gm-next-step">下一步 →</button></div>
      <div class="gm-controller-state"><strong id="gm-step-status">Chapter 1</strong><button class="gm-btn" id="gm-spotlight-toggle" aria-pressed="true">Spotlight：開</button><button class="gm-icon-btn" id="gm-bookmark" aria-pressed="false" aria-label="將目前位置加入書籤">☆</button><label>書籤 <select id="gm-bookmark-jump" aria-label="跳至書籤"><option value="">選擇書籤</option></select></label></div>
      <details class="gm-save"><summary>遊戲存檔 · 自動儲存 / 匯出 / 匯入</summary><div class="gm-save-grid"><label>遊戲存檔 <select id="gm-slot" aria-label="選擇存檔格">${[1,2,3,4,5].map(index=>`<option value="${index}">Slot ${index}</option>`).join('')}</select></label><button class="gm-btn" id="gm-save-now">儲存</button><button class="gm-btn" id="gm-export">匯出存檔</button><label class="gm-btn gm-import">匯入存檔<input id="gm-import" type="file" accept="application/json,.json"></label></div><small id="gm-save-status" role="status"></small></details>
    </div>
    <section class="gm-panel" id="gm-contracts" role="tabpanel" data-panel="contracts"></section>
    <section class="gm-panel" id="gm-categorize" role="tabpanel" data-panel="categorize" hidden></section>
    <section class="gm-panel" id="gm-listen" role="tabpanel" data-panel="listen" hidden></section>
    <section class="gm-panel" id="gm-evidence" role="tabpanel" data-panel="evidence" hidden></section>
    <section class="gm-panel" id="gm-writing" role="tabpanel" data-panel="writing" hidden></section>
    <button class="gm-return-route" id="gm-return-route" hidden>↩ 返回 Super Curation</button>
    <div class="gm-spotlight" aria-hidden="true" hidden><i data-mask="top"></i><i data-mask="right"></i><i data-mask="bottom"></i><i data-mask="left"></i></div>
    <aside class="gm-floating-window gm-transcript-window" id="gm-transcript-window" hidden aria-label="浮動錄音稿"><div class="gm-window-head"><strong>完整錄音稿 · 107 cues</strong><button class="gm-window-toggle" data-toggle-translation aria-pressed="false">中文對照</button><span>拖曳移動 · 四角調整大小</span><button class="gm-window-close" data-close-window="transcript" aria-label="關閉浮動錄音稿">×</button></div><div class="gm-window-body"></div><span class="gm-resize-handle nw" data-resize="nw"></span><span class="gm-resize-handle ne" data-resize="ne"></span><span class="gm-resize-handle sw" data-resize="sw"></span><span class="gm-resize-handle se" data-resize="se"></span></aside>
    <aside class="gm-floating-window gm-model-preview" id="gm-model-preview" hidden aria-label="範文來源預覽"><div class="gm-window-head"><strong>Model → original source</strong><span>拖曳移動 · 四角調整大小</span><button class="gm-window-close" data-close-window="preview" aria-label="關閉來源預覽">×</button></div><div class="gm-window-body"></div><span class="gm-resize-handle nw" data-resize="nw"></span><span class="gm-resize-handle ne" data-resize="ne"></span><span class="gm-resize-handle sw" data-resize="sw"></span><span class="gm-resize-handle se" data-resize="se"></span></aside>
    <dialog id="gm-help-dialog" class="gm-help-dialog"><form method="dialog"><button class="gm-window-close" value="close" aria-label="關閉協助">×</button><p class="gm-kicker">Contextual help</p><h3>需要更多協助</h3><div id="gm-help-content"></div><label><strong>我的問題（只保留在本機存檔）</strong><textarea id="gm-question-draft" rows="5" maxlength="5000"></textarea></label><div class="gm-btn-row"><button class="gm-btn primary" value="close">保留問題並返回</button></div></form></dialog>
    <p id="gm-live" class="gm-live" aria-live="polite"></p>`;
  $('.hero').insertAdjacentElement('afterend',shell);
  const footer=$('body>footer');if(footer)footer.textContent='來源：2019 Paper 3.pdf、原裝 Part B 錄音、canonical fact-line analysis 及 length-controlled model set。19 頁已逐頁核對；中文只作學習輔助，英文原卷為準。';
  $('#gm-slot').value=activeSlot;

  const cueTranslations=new Map(),cueTeaching=new Map();
  for(const unit of units)if(unit.audioCue){const teaching=cueTeaching.get(unit.audioCue.index)||[];teaching.push({id:unit.id,decision:unit.decision,tasks:unit.tasks});cueTeaching.set(unit.audioCue.index,teaching);if(unit.translation){const list=cueTranslations.get(unit.audioCue.index)||[];if(!list.includes(unit.translation))list.push(unit.translation);cueTranslations.set(unit.audioCue.index,list);}}
  const transcriptSections=new Map([[0,'Instructions'],[9,'Short Video Competition'],[40,'Brighthouse Cinema'],[70,'Prize Giving Ceremony'],[81,'Cinema and home viewing'],[94,'Blockbusters and low-budget films'],[103,'Closing instructions']]);
  function bookmarkKey(){if(['categorize','evidence'].includes(state.tab))return `${state.tab}:${state.unitId}`;if(state.tab==='listen'){const audio=$('#gm-audio');return `listen:${activeCueIndex(audio?.currentTime||0)}`;}if(state.tab==='writing')return `writing:${state.writingTask}`;return 'contracts:0';}
  function bookmarkLabel(key){const [kind,value]=key.split(':');if(kind==='categorize'||kind==='evidence')return `${kind==='categorize'?'分類':'取證'} · ${value}`;if(kind==='listen')return `聆聽 · cue ${Number(value)+1}`;if(kind==='writing')return `寫作 · Task ${value}`;return '任務合約';}
  function updateBookmarks(){const select=$('#gm-bookmark-jump');if(!select)return;select.innerHTML='<option value="">選擇書籤</option>'+state.bookmarks.map(key=>`<option value="${escape(key)}">${escape(bookmarkLabel(key))}</option>`).join('');const saved=state.bookmarks.includes(bookmarkKey());$('#gm-bookmark').setAttribute('aria-pressed',String(saved));$('#gm-bookmark').textContent=saved?'★':'☆';}
  function updateController(){
    const status=$('#gm-step-status');if(!status)return;
    const chapterIndex=['contracts','categorize','listen','evidence','writing'].indexOf(state.tab)+1;let detail='';
    if(['categorize','evidence'].includes(state.tab)){const panel=currentExplorerPanel();const item=panel?currentUnit(panel):{list:[],index:0};detail=item.unit?`${item.index+1}/${item.list.length} · ${item.unit.id}`:'empty matched state';}
    else if(state.tab==='listen')detail=`${state.heardCues.length}/${listeningData.cueCount} cues heard`;
    else if(state.tab==='writing')detail=`Task ${state.writingTask} · ${wordCount(state.drafts[state.writingTask])} words`;
    else detail='3 task contracts';
    status.textContent=`Chapter ${chapterIndex}/5 · ${detail}`;updateBookmarks();shell.style.setProperty('--gm-stage-progress',`${chapterIndex*20}%`);
    $$('.gm-tab').forEach((button,index)=>{const complete=state.completedTabs.includes(button.dataset.tab),active=index===chapterIndex-1;button.classList.toggle('is-complete',complete);button.dataset.stageState=complete?'完成':active?'目前':'未到';button.setAttribute('aria-label',`${button.textContent.trim()} · ${button.dataset.stageState}`);});
    const spotlight=$('#gm-spotlight-toggle');if(spotlight){spotlight.setAttribute('aria-pressed',String(state.spotlight));spotlight.textContent=`Spotlight：${state.spotlight?'開':'關'}`;}
    $('#gm-return-route').hidden=!state.returnRoute;const saveStatus=$('#gm-save-status');if(saveStatus&&!saveStatus.textContent.trim())saveStatus.textContent=`Slot ${activeSlot} · 已自動儲存在這部裝置`;
  }
  function applyWindowLayout(element,key){const layout=state.windowLayout?.[key];if(!layout)return;for(const property of ['left','top','width','height'])if(Number.isFinite(layout[property]))element.style[property]=`${layout[property]}px`;element.style.right='auto';}
  function storeWindowLayout(element,key){const rect=element.getBoundingClientRect();state.windowLayout[key]={left:Math.round(rect.left),top:Math.round(rect.top),width:Math.round(rect.width),height:Math.round(rect.height)};save();}
  function clampWindow(element){if(element.hidden)return;const rect=element.getBoundingClientRect(),view=viewportBox();const width=Math.min(rect.width,view.width-8),height=Math.min(rect.height,view.height-8);const left=Math.max(view.left+4,Math.min(rect.left,view.left+view.width-width-4)),top=Math.max(view.top+4,Math.min(rect.top,view.top+view.height-height-4));Object.assign(element.style,{left:`${left}px`,top:`${top}px`,width:`${width}px`,height:`${height}px`,right:'auto'});}
  function bindFloatingWindow(element,key){
    let operation=null;const head=$('.gm-window-head',element);
    element.addEventListener('pointerdown',event=>{const corner=event.target.dataset.resize;if((!corner&&!event.target.closest('.gm-window-head'))||event.target.closest('button,input,select,textarea'))return;event.preventDefault();const rect=element.getBoundingClientRect();operation={pointer:event.pointerId,corner,move:!corner,x:event.clientX,y:event.clientY,left:rect.left,top:rect.top,width:rect.width,height:rect.height};element.setPointerCapture(event.pointerId);});
    element.addEventListener('pointermove',event=>{if(!operation)return;const dx=event.clientX-operation.x,dy=event.clientY-operation.y,view=viewportBox();let {left,top,width,height}=operation;if(operation.move){left+=dx;top+=dy;}else{if(operation.corner.includes('w')){left+=dx;width-=dx;}else width+=dx;if(operation.corner.includes('n')){top+=dy;height-=dy;}else height+=dy;const minWidth=Math.min(320,view.width-8),minHeight=Math.min(210,view.height-8);if(width<minWidth){if(operation.corner.includes('w'))left-=minWidth-width;width=minWidth;}if(height<minHeight){if(operation.corner.includes('n'))top-=minHeight-height;height=minHeight;}}width=Math.min(width,view.width-8);height=Math.min(height,view.height-8);left=Math.max(view.left+4,Math.min(left,view.left+view.width-width-4));top=Math.max(view.top+4,Math.min(top,view.top+view.height-height-4));Object.assign(element.style,{left:`${left}px`,top:`${top}px`,width:`${width}px`,height:`${height}px`,right:'auto'});});
    const finish=()=>{if(!operation)return;operation=null;storeWindowLayout(element,key);};element.addEventListener('pointerup',finish);element.addEventListener('lostpointercapture',finish);head?.setAttribute('title','拖曳移動；四角可調整大小');applyWindowLayout(element,key);
  }
  function renderTranscriptWindow(){
    const windowNode=$('#gm-transcript-window'),body=$('.gm-window-body',windowNode);body.innerHTML=listeningData.cues.map(cue=>`${transcriptSections.has(cue.index)?`<h3 class="gm-transcript-section">${escape(transcriptSections.get(cue.index))}</h3>`:''}<section class="gm-floating-cue ${cueTeaching.get(cue.index)?.some(item=>item.decision==='不寫入答案')?'has-rejection':''}" data-floating-cue="${cue.index}"><h4><span>${formatTime(cue.start)}–${formatTime(cue.end)}</span><span>${escape(cue.speaker)}</span><span>${escape(cue.id)}</span></h4><p lang="en"><span>${escape(cue.text)}</span></p>${cueTranslations.has(cue.index)?`<p class="gm-floating-translation" lang="zh-Hant">${escape(cueTranslations.get(cue.index).join('／'))}</p>`:''}${cueTeaching.has(cue.index)?`<div class="gm-floating-status">${cueTeaching.get(cue.index).slice(0,3).map(item=>`<span>${escape(item.id)} · ${escape(item.decision)}${item.tasks.length?` · T${item.tasks.join('/T')}`:''}</span>`).join('')}</div>`:''}</section>`).join('');
  }
  function openTranscriptWindow(){const windowNode=$('#gm-transcript-window');windowNode.hidden=false;state.transcriptOpen=true;applyWindowLayout(windowNode,'transcript');clampWindow(windowNode);save();updateAudioState($('#gm-audio'));}
  function closeTranscriptWindow(){state.transcriptOpen=false;$('#gm-transcript-window').hidden=true;save();}
  function modelUsedIds(task){return new Set(modelData.tasks[task].sections.flatMap(section=>section.sentences.flatMap(sentence=>sentence.sources)));}
  let previewSourceIds=[];
  function noteForUnit(unit){if(!unit?.audioCue)return null;return noteDefinitions.find(note=>unit.audioCue.index<=note.cue&&(!noteDefinitions.find(other=>other.cue>=unit.audioCue.index&&other.cue<note.cue)))||null;}
  function renderModelPreview(sourceId){
    const unit=unitById.get(sourceId),windowNode=$('#gm-model-preview'),body=$('.gm-window-body',windowNode);if(!unit)return;
    const note=noteForUnit(unit),generated=note&&state.generatedNotes[note.id];
    body.innerHTML=`<div class="gm-preview-source-nav">${previewSourceIds.map(id=>`<button class="gm-pill ${id===sourceId?'is-current':''}" data-preview-source="${id}">${id}</button>`).join('')}</div><p class="gm-kicker">Native page P${String(unit.page).padStart(2,'0')} · ${escape(unit.section)} · ${escape(unit.decision)}</p><h3>${escape(unit.heading)}</h3><blockquote class="gm-excerpt gm-navy-ink" data-preview-ink="${unit.id}"><span>${escape(unit.excerpt)}</span></blockquote>${unit.translation?`<p class="gm-translation" lang="zh-Hant">${escape(unit.translation)}</p>`:''}${generated?`<div class="gm-note-mirror" data-note-use="${note.id}"><strong>Native note · ${escape(note.label)}</strong><span class="gm-note-used-line">${escape(generated)}</span><small>此為非破壞性 mirror；原 textarea 內容未被改寫。</small></div>`:''}<div class="gm-prompt-list"><div class="gm-prompt"><h4>Why it matters</h4><p>${escape(unit.prompts.use)}</p></div><div class="gm-prompt"><h4>Allowed treatment</h4><p>${escape(unit.prompts.treatment)}</p></div></div><figure class="gm-preview-scan"><img src="${escape(nativePageAsset(unit.page))}" alt="Original paper page ${unit.page} for ${unit.id}"><figcaption>${unit.id} · analysis line ${unit.analysisLine}</figcaption></figure><div class="gm-btn-row"><button class="gm-btn" data-native-page="${unit.page}">到原卷位置</button><button class="gm-btn" data-open-unit="${unit.id}">在逐句取證開啟</button></div>`;
    clearTimeout(previewInkTimer);previewInkTimer=setTimeout(()=>{const ink=$(`[data-preview-ink="${sourceId}"]`,body);ink?.classList.add('is-used');$('.gm-note-used-line',body)?.classList.add('is-used');},reduceMotion?0:260);
  }
  function openModelPreview(ids){previewSourceIds=[...new Set(ids)].filter(id=>unitById.has(id));if(!previewSourceIds.length)return;const windowNode=$('#gm-model-preview');renderModelPreview(previewSourceIds[0]);windowNode.hidden=false;applyWindowLayout(windowNode,'preview');clampWindow(windowNode);}
  function closeModelPreview(){$('#gm-model-preview').hidden=true;}
  bindFloatingWindow($('#gm-transcript-window'),'transcript');bindFloatingWindow($('#gm-model-preview'),'preview');renderTranscriptWindow();
  const handleViewportChange=()=>{clampWindow($('#gm-transcript-window'));clampWindow($('#gm-model-preview'));trackSpotlight();const panel=currentExplorerPanel();if(panel)requestAnimationFrame(()=>drawCurrentRoute(panel));};addEventListener('resize',handleViewportChange);visualViewport?.addEventListener('resize',handleViewportChange);
  function restoreNativeNoteSheet(){if(nativeNoteSheet&&nativeNoteAnchor.parentNode&&nativeNoteSheet.parentNode!==nativeNoteAnchor.parentNode)nativeNoteAnchor.parentNode.insertBefore(nativeNoteSheet,nativeNoteAnchor.nextSibling);}
  function removeExactGeneratedLine(value,line){const lines=String(value||'').split('\n');const index=lines.findIndex(item=>item===line);if(index>=0)lines.splice(index,1);return lines.join('\n').replace(/^\n+|\n+$/g,'');}
  function setNoteTransactionActive(active){const next=$('#gm-next-step');if(next){next.disabled=active;next.setAttribute('aria-busy',String(active));}shell.classList.toggle('is-note-typing',active);}
  function cancelNoteTyping({restore=false,reason='Learner input cancelled generated typing; the current edit was preserved.'}={}){if(!noteTyping)return;const current=noteTyping;clearInterval(current.timer);if(restore){current.field.value=current.before;state.notes[current.id]=current.before;}else state.notes[current.id]=current.field.value;current.field.classList.remove('gm-note-writing');noteTyping=null;setNoteTransactionActive(false);save();const audio=$('#gm-audio');if(audio)updateAudioState(audio);announce(reason);}
  function completeGeneratedNote(id,field,before,line){const prefix=before.trim()?`${before.replace(/\n+$/,'')}\n`:'';field.value=`${prefix}${line}`;state.notes[id]=field.value;state.generatedNotes[id]=line;if(!state.noteRevealed.includes(id))state.noteRevealed.push(id);field.classList.remove('gm-note-writing');noteTyping=null;setNoteTransactionActive(false);save();updateAudioState($('#gm-audio'));announce(`${id} suggested line completed in the authentic note field.`);}
  function typeSuggestedNote(id){const note=noteDefinitions.find(item=>item.id===id),field=$(`[data-curation-note="${id}"]`);if(!note||!field||!state.heardCues.includes(note.cue))return;if(noteTyping)cancelNoteTyping();const line=note.check;if(String(field.value).split('\n').includes(line)){state.generatedNotes[id]=line;if(!state.noteRevealed.includes(id))state.noteRevealed.push(id);save();updateAudioState($('#gm-audio'));announce(`${id} already contains the exact generated line; replay did not duplicate it.`);return;}const before=field.value;field.classList.add('gm-note-writing');field.focus({preventScroll:true});field.setSelectionRange(field.value.length,field.value.length);setNoteTransactionActive(true);const reveal=$(`[data-reveal-note="${id}"]`);if(reveal){reveal.disabled=true;reveal.textContent='正在寫入…';}if(reduceMotion){completeGeneratedNote(id,field,before,line);return;}let count=0;noteTyping={id,field,before,line,timer:null};noteTyping.timer=setInterval(()=>{if(!noteTyping||noteTyping.id!==id)return;count=Math.min(line.length,count+2);const prefix=before.trim()?`${before.replace(/\n+$/,'')}\n`:'';field.value=`${prefix}${line.slice(0,count)}`;field.setSelectionRange(field.value.length,field.value.length);field.scrollTop=field.scrollHeight;state.notes[id]=field.value;if(count>=line.length){clearInterval(noteTyping.timer);completeGeneratedNote(id,field,before,line);}},28);}
  function prepareNativeNoteSheet(){
    if(!nativeNoteSheet)return;
    for(const note of noteDefinitions){const field=$(`[data-note="3-${note.id}"]`,nativeNoteSheet);if(!field)continue;field.id=`gm-native-note-${note.id}`;field.dataset.curationNote=note.id;field.value=state.notes[note.id]||'';
      const label=field.closest('label')||field.previousElementSibling;const labelId=`gm-native-note-label-${note.id}`;if(label){label.id=labelId;field.setAttribute('aria-labelledby',labelId);}else field.setAttribute('aria-label',note.label);
      let panel=$(`[data-note-card="${note.id}"]`,nativeNoteSheet);if(!panel){panel=document.createElement('div');panel.className='gm-native-evidence';panel.dataset.noteCard=note.id;panel.innerHTML=`<small>Evidence gate: 完成 cue ${note.cue+1}</small><button class="gm-btn" data-reveal-note="${note.id}" disabled>寫入建議筆記</button><div class="gm-note-check">${escape(note.check)}</div>`;field.insertAdjacentElement('afterend',panel);}
      if(!field.dataset.gmBound){field.dataset.gmBound='1';field.addEventListener('input',event=>{if(noteTyping?.id===note.id&&event.isTrusted)cancelNoteTyping();state.notes[note.id]=field.value;save();});field.addEventListener('focus',()=>shell.classList.add('is-native-note-focused'));field.addEventListener('blur',()=>shell.classList.remove('is-native-note-focused'));}
    }
  }
  function mountNativeNoteSheet(){const host=$('#gm-native-note-host');if(!host||!nativeNoteSheet)return;prepareNativeNoteSheet();host.append(nativeNoteSheet);nativeNoteSheet.hidden=false;}

  function taskCard(task){const item=tasks[task];return `<article class="gm-task-card" data-task="${task}"><p class="gm-kicker">${item.name}</p><h3>${escape(item.purpose)}</h3><dl><dt>Genre</dt><dd>${escape(item.genre)}</dd><dt>Reader</dt><dd>${escape(item.audience)}</dd><dt>Length</dt><dd>${escape(item.words)}</dd><dt>Sources</dt><dd>${escape(item.sources)}</dd></dl><p class="gm-warning"><strong>Boundary:</strong> ${escape(item.prohibition)}</p><div class="gm-btn-row"><button class="gm-btn" data-native-page="${item.page}">看原題</button><button class="gm-btn primary" data-start-task="${task}">開始 Task ${task}</button></div></article>`;}
  function renderContracts(){
    $('#gm-contracts').innerHTML=`<div class="gm-card"><p class="gm-kicker">Chapter 1 · task contracts</p><h3>先鎖定身份、文體、讀者、目的、資料來源和字數</h3><p>你是 Nico Lin，校際視像媒體學會秘書。三篇答案共用同一個情境，但不可把不同任務的資料混寫。</p><div class="gm-task-grid">${[8,9,10].map(taskCard).join('')}</div><div class="gm-manifest"><div class="gm-metric"><strong>${sourceData.unitCount}</strong><span>stable source units</span></div><div class="gm-metric"><strong>${Object.keys(sourceData.decisionCounts).length}</strong><span>answer decisions</span></div><div class="gm-metric"><strong>${listeningData.cueCount}</strong><span>timestamped cues</span></div><div class="gm-metric"><strong>19 + 4</strong><span>full pages + embedded visuals</span></div></div><p class="gm-warning">Source text、teacher analysis、learner notes 和 model answers 分開保存。Marking scheme 只用作最後 validation，不代替 source reasoning。</p><button class="gm-btn" id="gm-reset">重設 Super Curation 學習紀錄</button></div>`;
  }

  function filtersHtml(){return `<div class="gm-filters" aria-label="Filter source units"><button class="gm-filter" data-decision="all">全部決定</button>${DECISIONS.map(decision=>`<button class="gm-filter" data-decision="${escape(decision)}">${escape(decision)} · ${sourceData.decisionCounts[decision]}</button>`).join('')}</div><div class="gm-filters" aria-label="Filter by writing task"><button class="gm-filter" data-task-filter="all">全部任務</button>${[8,9,10].map(task=>`<button class="gm-filter" data-task-filter="${task}">Task ${task}</button>`).join('')}<button class="gm-filter" data-task-filter="none">路由／噪音</button></div>`;}
  function filteredUnits(){return units.filter(unit=>(state.decision==='all'||unit.decision===state.decision)&&(state.task==='all'||(state.task==='none'?!unit.tasks.length:unit.tasks.includes(Number(state.task)))));}
  function explorerLayout(panel,mode){
    panel.innerHTML=`<div class="gm-status-line"><strong class="gm-unit-index"></strong><div class="gm-progress" aria-label="Reviewed progress"><span></span></div><span class="gm-reviewed-count"></span></div>${filtersHtml()}<div class="gm-grid"><div class="gm-card gm-unit" tabindex="-1"></div><aside class="gm-card gm-source-preview"><figure><img alt="Original paper page for the current source unit"><figcaption></figcaption></figure><div class="gm-btn-row"><button class="gm-btn" data-jump-current>到原卷位置</button><button class="gm-btn" data-open-scan>展開原卷影像</button></div><div class="gm-bank"><h4>Evidence bank</h4><div class="gm-bank-list"></div></div></aside></div>`;
    panel.dataset.mode=mode;
    renderExplorer(panel);
  }
  function currentUnit(panel){const list=filteredUnits();let index=list.findIndex(unit=>unit.id===state.unitId);if(index<0){index=0;state.unitId=list[0]?.id||units[0].id;save();}return {list,index,unit:list[index]};}
  function taskPills(unit){return unit.tasks.length?unit.tasks.map(task=>`<span class="gm-pill task${task}">Task ${task}</span>${contentPointMaps[task].has(unit.id)?`<span class="gm-pill point task${task}" title="Numbered content point for Task ${task}">CP T${task}-${String(contentPointMaps[task].get(unit.id)).padStart(2,'0')}</span>`:''}`).join(''):'<span class="gm-pill">Route / context</span>';}
  function bankButtons(unit){if(!BANKABLE.has(unit.decision)||!unit.tasks.length)return '<span class="gm-pill">不可直接入 evidence bank</span>';const audioLocked=unit.audioCue&&!state.heardCues.includes(unit.audioCue.index);if(audioLocked)return `<button class="gm-btn" disabled>先完成 cue ${unit.audioCue.index+1} 才可入 evidence bank</button>`;return unit.tasks.map(task=>{const added=state.bank[task].includes(unit.id);return `<button class="gm-btn ${added?'good':''}" data-bank-task="${task}" ${added?'disabled':''}>${added?'已加入':'加入'} Task ${task}</button>`;}).join('');}
  function renderBank(root){
    const items=[8,9,10].flatMap(task=>state.bank[task].map(id=>({task,unit:unitById.get(id)}))).filter(item=>item.unit);
    $('.gm-bank-list',root).innerHTML=items.length?items.map(({task,unit})=>`<div class="gm-bank-item ${state.modelUses[task].includes(unit.id)?'is-consumed':''}" data-task="${task}" data-bank-unit="${unit.id}"><button aria-label="Remove ${unit.id} from Task ${task}" data-remove-bank="${task}:${unit.id}">×</button><strong>Task ${task} · ${unit.id}</strong><br><span>${escape(unit.excerpt)}</span></div>`).join(''):'<p class="gm-empty">尚未加入證據。只有「獨立寫入／合併寫入／只保留結論」可加入。</p>';
  }
  function stampHtml(unit,animate){const taskLetters={8:'A',9:'B',10:'C'},tasksToStamp=unit.tasks.length?unit.tasks:['route'];return `<div class="gm-category-stamps" aria-label="Canonical classification stamps">${tasksToStamp.map((task,index)=>`<span class="gm-file-stamp task${task} ${animate?'is-new':''}" style="--stamp-index:${index}" role="img" aria-label="${task==='route'?'Route or context':`Task ${task} stamp`}">${task==='route'?'R':taskLetters[task]}</span>`).join('')}<small>Type ${unit.typeNumber} · ${escape(unit.decision)}</small></div>`;}
  function routeHtml(unit){if(unit.decision!=='只作指路')return '';return `<div class="gm-source-route ${routeGhostUnit===unit.id?'is-ghost':''}" data-route-unit="${unit.id}"><svg aria-hidden="true"><defs><marker id="gm-route-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z"></path></marker></defs><path class="gm-route-path" pathLength="1" marker-end="url(#gm-route-arrow)"></path></svg><button class="gm-route-callout" data-route-visit="${unit.id}"><span>Source route · exact audited page</span><strong>P${String(unit.page).padStart(2,'0')} · ${escape(unit.section)}</strong></button></div>`;}
  function drawCurrentRoute(panel){const route=$('.gm-source-route',panel),unitNode=$('.gm-unit',panel),source=$('.gm-excerpt',panel),callout=$('.gm-route-callout',panel);if(!route||!unitNode||!source||!callout)return;const root=unitNode.getBoundingClientRect(),from=source.getBoundingClientRect(),to=callout.getBoundingClientRect(),svg=$('svg',route),path=$('.gm-route-path',route);Object.assign(svg.style,{top:`${-route.offsetTop}px`,height:`${unitNode.scrollHeight}px`});svg.setAttribute('viewBox',`0 0 ${Math.max(1,root.width)} ${Math.max(1,unitNode.scrollHeight)}`);const x1=from.left-root.left+Math.min(from.width-18,Math.max(18,from.width*.72)),y1=from.bottom-root.top-4,x2=to.left-root.left+Math.min(to.width-22,Math.max(22,to.width*.3)),y2=to.top-root.top+4,curve=Math.max(35,(y2-y1)*.55);path.setAttribute('d',`M ${x1} ${y1} C ${x1} ${y1+curve}, ${x2} ${y2-curve}, ${x2} ${y2}`);route.classList.add(route.classList.contains('is-ghost')?'gm-route-ghost':'gm-route-drawing');if(!route.classList.contains('is-ghost'))afterMotion(path,'animationend',1000,()=>route.classList.remove('gm-route-drawing'));}
  function commitBankTransfer(panel,unit,task){if(!state.bank[task].includes(unit.id))state.bank[task].push(unit.id);bankTransfers.delete(`${task}:${unit.id}`);save();renderExplorer(panel);announce(`${unit.id} transferred once to Task ${task} evidence bank.`);}
  function animateBankTransfer(button,panel,unit,task){const key=`${task}:${unit.id}`;if(bankTransfers.has(key)||state.bank[task].includes(unit.id)||!BANKABLE.has(unit.decision)||!unit.tasks.includes(task))return;bankTransfers.add(key);button.disabled=true;button.setAttribute('aria-busy','true');const source=$('.gm-excerpt',panel),target=$('.gm-bank',panel);if(reduceMotion||!source||!target){commitBankTransfer(panel,unit,task);return;}const from=source.getBoundingClientRect(),to=target.getBoundingClientRect(),clone=document.createElement('div');clone.className='gm-bank-flight';clone.setAttribute('aria-hidden','true');clone.textContent=unit.excerpt;Object.assign(clone.style,{left:`${from.left}px`,top:`${from.top}px`,width:`${Math.min(from.width,520)}px`,'--flight-x':`${to.left-from.left+Math.min(to.width,120)}px`,'--flight-y':`${to.top-from.top+24}px`});document.body.append(clone);let committed=false;const finish=()=>{if(committed)return;committed=true;clone.remove();commitBankTransfer(panel,unit,task);};afterMotion(clone,'animationend',700,finish);}
  function renderExplorer(panel){
    const {list,index,unit}=currentUnit(panel);
    const reviewed=new Set(state.reviewed);const progress=Math.round(reviewed.size/units.length*100);
    $('.gm-unit-index',panel).textContent=unit?`${unit.id} · filtered ${index+1}/${list.length}`:'No units match both filters';
    $('.gm-progress>span',panel).style.width=`${progress}%`;$('.gm-reviewed-count',panel).textContent=`${reviewed.size}/${units.length} reviewed`;
    $$('.gm-filter[data-decision]',panel).forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.decision===state.decision)));
    $$('.gm-filter[data-task-filter]',panel).forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.taskFilter===String(state.task))));
    if(!unit){
      routeGhostUnit=null;
      $('.gm-unit',panel).innerHTML='<p class="gm-kicker">Empty matched state</p><h3>這個 answer decision 在所選 task 沒有 source unit。</h3><p>這是有效的語義結果，不會用舊卡片冒充。請改選另一個 decision 或「全部任務」。</p><button class="gm-btn" data-clear-filters>清除兩個 filters</button>';
      const img=$('.gm-source-preview img',panel);img.removeAttribute('src');img.alt='No source page for the empty filter state';
      $('.gm-source-preview figcaption',panel).textContent='No matching source unit';
      renderBank(panel);updateController();return;
    }
    if(routeGhostUnit&&routeGhostUnit!==unit.id)routeGhostUnit=null;
    const cue=unit.audioCue?`<button class="gm-pill" data-seek-unit="${unit.audioCue.index}">🎧 ${formatTime(unit.audioCue.start)} · cue ${unit.audioCue.index+1}</button>`:'';
    const isCategorize=panel.dataset.mode==='categorize',revealed=state.categoryRevealed.includes(unit.id),draftTasks=state.categories[unit.id]||[];
    const categoryUi=isCategorize?`<fieldset class="gm-category"><legend>先作 provisional classification</legend>${[8,9,10].map(task=>`<label><input type="checkbox" data-category-task="${task}" ${draftTasks.includes(task)?'checked':''}> Task ${task}</label>`).join('')}<label><input type="checkbox" data-category-none ${draftTasks.length?'':'checked'}> Route / context / noise</label><button class="gm-btn" data-reveal-category>${revealed?'已核對 canonical classification':'核對 canonical classification'}</button><span class="gm-category-stamp ${revealed?'is-verified':'is-provisional'}" role="status">${revealed?'Canonical classification shown above':'Provisional · 尚未揭示答案'}</span></fieldset>`:'';
    const decisionUi=!isCategorize||revealed?`<div class="gm-decision"><strong>${escape(unit.decision)}</strong><span>${escape(unit.type)}</span></div><div class="gm-prompt-list"><div class="gm-prompt"><h4>1 · 這句在說甚麼</h4><p>${escape(unit.prompts.says||'以原句和上下文辨認資料功能。')}</p></div><div class="gm-prompt"><h4>2 · 這句有甚麼用</h4><p>${escape(unit.prompts.use||'用來判斷來源路線、任務界線或答案內容。')}</p></div><div class="gm-prompt"><h4>3 · 為何是這個決定</h4><p>${escape(unit.prompts.reason||'依任務要求及其他來源核對後作此決定。')}</p></div><div class="gm-prompt"><h4>4 · 答案怎樣處理</h4><p>${escape(unit.prompts.treatment||unit.decision)}</p></div></div>`:'<div class="gm-decision pending"><strong>Canonical decision hidden</strong><span>先選 provisional task ownership，再核對 Type 1–6 和七種 answer decision。</span></div>';
    const decisionVisible=!isCategorize||revealed,stamp= isCategorize&&revealed?stampHtml(unit,pendingStampUnit===unit.id):'',excerpt=unit.decision==='不寫入答案'&&decisionVisible?`<span class="gm-rejected-exact">${escape(unit.excerpt)}</span>`:escape(unit.excerpt);
    const unitNode=$('.gm-unit',panel);unitNode.classList.remove('is-entering','has-stamp');unitNode.innerHTML=`<div class="gm-unit-meta"><span class="gm-pill">${escape(unit.part)}</span>${decisionVisible?`<span class="gm-pill">Type ${unit.typeNumber}</span>${taskPills(unit)}`:'<span class="gm-pill">Type hidden</span>'}${cue}</div>${stamp}<h3>${escape(unit.heading)}</h3><blockquote class="gm-excerpt">${excerpt}</blockquote>${unit.translation?`<p class="gm-translation" lang="zh-Hant">${escape(unit.translation)}</p>`:''}${categoryUi}${decisionUi}${decisionVisible?routeHtml(unit):''}<div class="gm-btn-row" style="margin-top:16px"><button class="gm-btn" data-unit-nav="prev" ${index===0?'disabled':''}>← 上一項</button><button class="gm-btn ${reviewed.has(unit.id)?'good':''}" data-review-unit>${reviewed.has(unit.id)?'已核對':'標記已核對'}</button><button class="gm-btn" data-unit-nav="next" ${index===list.length-1?'disabled':''}>下一項 →</button>${!isCategorize?bankButtons(unit):''}</div>`;
    unitNode.classList.toggle('has-stamp',Boolean(stamp));
    unitNode.classList.add('is-entering');
    const img=$('.gm-source-preview img',panel);img.src=nativePageAsset(unit.page);img.alt=`Original paper page ${unit.page} for ${unit.id}`;
    $('.gm-source-preview figcaption',panel).textContent=`Native page P${String(unit.page).padStart(2,'0')} · analysis line ${unit.analysisLine} · ${unit.section}`;
    renderBank(panel);updateController();requestAnimationFrame(()=>{drawCurrentRoute(panel);trackSpotlight();});
    if(pendingStampUnit===unit.id){afterMotion($('.gm-file-stamp.is-new',unitNode),'animationend',760,()=>{$$('.gm-file-stamp.is-new',unitNode).forEach(node=>node.classList.remove('is-new'));pendingStampUnit=null;});}
  }

  let playbackCue=null,lastAudioTime=0,audioStopLock=false;
  function renderListening(){
    restoreNativeNoteSheet();
    $('#gm-listen').innerHTML=`<div class="gm-grid"><div class="gm-card gm-audio-card"><p class="gm-kicker">Chapter 3 · one audio owner</p><h3>Authentic 2019 Part B video conference</h3><audio id="gm-audio" preload="metadata" crossorigin="anonymous" src="${escape(listeningData.audioUrl)}"></audio><div class="gm-player" aria-label="Recording controls"><button class="gm-icon-btn" data-audio-play aria-label="播放目前 cue">▶</button><button class="gm-btn" data-toggle-pins aria-pressed="false">顯示停頓點</button><label class="gm-player-timeline"><span class="gm-live">錄音進度</span><input type="range" data-audio-seek min="0" max="${listeningData.lastEnd}" step="0.1" value="0"><span class="gm-cue-pins" hidden>${listeningData.cues.map(cue=>`<button type="button" data-pin-cue="${cue.index}" style="--pin:${cue.start/listeningData.lastEnd*100}%" aria-label="Cue ${cue.index+1} · ${formatTime(cue.start)}"></button>`).join('')}</span></label><output class="gm-player-time">0:00 / ${formatTime(listeningData.lastEnd)}</output><label>速度 <select data-audio-rate aria-label="播放速度">${[.5,.75,1,1.25,1.5,1.75,2].map(rate=>`<option value="${rate}" ${rate===state.playbackRate?'selected':''}>${rate}×</option>`).join('')}</select></label></div><div class="gm-btn-row gm-audio-tools"><button class="gm-btn" data-open-transcript>浮動完整錄音稿</button><span class="gm-pill">${state.heardCues.length}/${listeningData.cueCount} cues heard</span><span class="gm-pill">逐 cue 自動停止</span></div><div class="gm-now"><strong>Current cue</strong><p>錄音尚未開始。</p></div><div class="gm-transcript" aria-label="Timestamped transcript">${listeningData.cues.map(cue=>`${transcriptSections.has(cue.index)?`<h4 class="gm-transcript-section">${escape(transcriptSections.get(cue.index))}</h4>`:''}<button class="gm-cue ${cueTeaching.get(cue.index)?.some(item=>item.decision==='不寫入答案')?'has-rejection':''}" data-cue="${cue.index}"><small><span>${formatTime(cue.start)}–${formatTime(cue.end)}</span><span>${escape(cue.speaker)}</span></small><span>${escape(cue.text)}</span></button>`).join('')}</div></div><aside class="gm-card gm-native-notes-card"><p class="gm-kicker">Official note sheet pipeline · native host</p><h3>在原卷第 3 頁的六個真實欄位做筆記</h3><p>這裡移入同一個 native note-sheet element，沒有複製或合成 worksheet。前跳不會冒充已聽；倒帶會撤回之後的 evidence state，而手寫內容保留。</p><div id="gm-native-note-host"></div><div class="gm-btn-row" style="margin-top:14px"><button class="gm-btn" data-native-page="3">到原卷位置</button><button class="gm-btn primary" data-tab-target="evidence">錄音後逐項取證</button></div></aside></div>`;
    mountNativeNoteSheet();
    const audio=$('#gm-audio');playbackCue=null;lastAudioTime=0;audio.playbackRate=state.playbackRate;
    for(const event of ['timeupdate','seeking','seeked','loadedmetadata','ended','play','pause'])audio.addEventListener(event,eventObject=>handleAudioEvent(eventObject,audio));
    $$('.gm-cue').forEach(button=>button.addEventListener('click',()=>playCue(Number(button.dataset.cue))));
    $$('[data-pin-cue]').forEach(button=>button.addEventListener('click',()=>playCue(Number(button.dataset.pinCue))));
    $('[data-audio-play]').addEventListener('click',()=>{if(!audio.paused){audio.pause();return;}let index=activeCueIndex(audio.currentTime);if(index<0)index=0;const cue=listeningData.cues[index];if(state.heardCues.includes(index)&&audio.currentTime>=cue.end-.15)index=Math.min(index+1,listeningData.cueCount-1);playCue(index);});
    $('[data-audio-seek]').addEventListener('input',event=>{audio.currentTime=Number(event.target.value);updateAudioState(audio);});
    $('[data-audio-rate]').addEventListener('change',event=>{state.playbackRate=Number(event.target.value);audio.playbackRate=state.playbackRate;save();});
    $('[data-toggle-pins]').addEventListener('click',event=>{const pins=$('.gm-cue-pins');pins.hidden=!pins.hidden;event.currentTarget.setAttribute('aria-pressed',String(!pins.hidden));event.currentTarget.textContent=pins.hidden?'顯示停頓點':'隱藏停頓點';});
    $('[data-open-transcript]').addEventListener('click',openTranscriptWindow);
    if(state.tab==='listen'&&state.transcriptOpen)openTranscriptWindow();else $('#gm-transcript-window').hidden=true;
    updateAudioState(audio);
  }
  function playCue(index){const audio=$('#gm-audio'),cue=listeningData.cues[index];if(!audio||!cue)return;playbackCue=index;audioStopLock=false;audio.currentTime=cue.start;lastAudioTime=cue.start;updateAudioState(audio);const button=$(`.gm-cue[data-cue="${index}"]`),transcript=button?.closest('.gm-transcript');if(button&&transcript)transcript.scrollTo({top:Math.max(0,button.offsetTop-transcript.offsetTop-40),behavior:reduceMotion?'auto':'smooth'});audio.play().catch(()=>{playbackCue=null;announce('錄音未能播放；請再按一次播放。');});announce(`Playing cue ${cue.index+1}: ${cue.text}`);}
  function handleAudioEvent(event,audio){
    if(event.type==='seeking'&&audio.currentTime<lastAudioTime-.12){if(noteTyping)cancelNoteTyping({restore:true,reason:'倒帶取消未完成的生成筆記。'});state.heardCues=state.heardCues.filter(index=>listeningData.cues[index].end<=audio.currentTime+.05);for(const note of noteDefinitions){if(state.heardCues.includes(note.cue))continue;const generated=state.generatedNotes[note.id];if(generated){state.notes[note.id]=removeExactGeneratedLine(state.notes[note.id],generated);const field=$(`[data-curation-note="${note.id}"]`);if(field)field.value=state.notes[note.id];delete state.generatedNotes[note.id];}}state.noteRevealed=state.noteRevealed.filter(id=>{const note=noteDefinitions.find(item=>item.id===id);return note&&state.heardCues.includes(note.cue);});for(const task of [8,9,10])state.bank[task]=state.bank[task].filter(id=>{const unit=unitById.get(id);return !unit?.audioCue||state.heardCues.includes(unit.audioCue.index);});playbackCue=null;save();announce('已倒帶；之後的 cue、生成筆記、reveal 與 audio-evidence bank state 已撤回，獨立手寫內容保留。');}
    if(playbackCue!==null&&!audioStopLock){const completedIndex=playbackCue,cue=listeningData.cues[completedIndex];if(audio.currentTime>=cue.end-.06){audioStopLock=true;audio.pause();audio.currentTime=cue.end;if(!state.heardCues.includes(completedIndex))state.heardCues.push(completedIndex);state.heardCues.sort((a,b)=>a-b);playbackCue=null;save();announce(`Cue ${cue.index+1} completed and stopped at ${formatTime(cue.end)}.`);const note=noteDefinitions.find(item=>item.cue===completedIndex);if(note)setTimeout(()=>typeSuggestedNote(note.id),0);audioStopLock=false;}}
    if(event.type==='ended'){for(const cue of listeningData.cues)if(cue.end<=audio.currentTime+.05&&!state.heardCues.includes(cue.index))state.heardCues.push(cue.index);state.heardCues.sort((a,b)=>a-b);save();}
    lastAudioTime=audio.currentTime;updateAudioState(audio);
  }
  function activeCueIndex(time){let result=-1;for(const cue of listeningData.cues){if(cue.start<=time)result=cue.index;else break;}return result;}
  function updateAudioState(audio){
    const active=activeCueIndex(audio.currentTime);const cue=listeningData.cues[active];
    $('.gm-now p').textContent=cue?`${formatTime(cue.start)} · ${cue.speaker}: ${cue.text}`:'錄音尚未開始。';
    $$('.gm-cue').forEach((button,index)=>{button.classList.toggle('is-active',index===active);button.classList.toggle('is-past',state.heardCues.includes(index));});
    for(const note of noteDefinitions){const card=$(`[data-note-card="${note.id}"]`);const heard=state.heardCues.includes(note.cue),generated=Boolean(state.generatedNotes[note.id]);card.classList.toggle('is-heard',heard);card.classList.toggle('is-revealed',heard&&state.noteRevealed.includes(note.id));const reveal=$(`[data-reveal-note="${note.id}"]`);reveal.disabled=!heard||noteTyping?.id===note.id;reveal.textContent=generated?'已寫入（重播不重複）':noteTyping?.id===note.id?'正在寫入…':'寫入建議筆記';}
    const play=$('[data-audio-play]');if(play){play.textContent=audio.paused?'▶':'❚❚';play.setAttribute('aria-label',audio.paused?'播放目前 cue':'暫停錄音');}
    const seek=$('[data-audio-seek]');if(seek){seek.max=String(Number.isFinite(audio.duration)?audio.duration:listeningData.lastEnd);seek.value=String(Math.min(audio.currentTime,Number(seek.max)));}
    const time=$('.gm-player-time');if(time)time.textContent=`${formatTime(audio.currentTime)} / ${formatTime(audio.duration||listeningData.lastEnd)}`;
    $$('[data-pin-cue]').forEach((pin,index)=>pin.classList.toggle('is-heard',state.heardCues.includes(index)));
    $$('.gm-floating-cue').forEach((section,index)=>{section.classList.toggle('is-active',index===active);section.classList.toggle('is-heard',state.heardCues.includes(index));});
    shell.dataset.activeCue=String(active);
    updateController();
  }

  function renderEvidence(){explorerLayout($('#gm-evidence'),'evidence');}
  function renderCategorize(){
    explorerLayout($('#gm-categorize'),'categorize');
    const card=$('.gm-unit',$('#gm-categorize'));card.insertAdjacentHTML('afterbegin','<p class="gm-kicker">Chapter 2 · classify before drafting</p>');
  }

  function evidenceList(task){const ids=state.bank[task],used=modelUsedIds(task);if(!ids.length)return '<p class="gm-empty">尚未有 evidence。到「取證」加入已核准 source units。</p>';return ids.map(id=>{const unit=unitById.get(id),isUsed=used.has(id),consumed=state.modelUses[task].includes(id);return `<button class="gm-cue gm-writing-evidence ${isUsed?'is-model-used':'is-model-new'} ${consumed?'is-consumed':''}" data-open-unit="${id}"><small><span>${id}</span><span>${consumed?'Consumed in inspected model sentence':isUsed?'Model uses this':'Approved · not used in model'}</span></small><span>${escape(unit.excerpt)}</span></button>`;}).join('');}
  function modelWordCount(model){return wordCount(Object.values(model.sections).flatMap(section=>section.sentences.map(sentence=>sentence.text)).join(' '));}
  function modelHtml(task){
    const model=modelData.tasks[task];
    if(!state.modelUnlocked[task])return `<div class="gm-model-lock"><strong>Model locked</strong><p>先完成自己的 draft（至少 20 words），再勾選核對。</p><label><input type="checkbox" data-unlock-model="${task}" ${wordCount(state.drafts[task])<20?'disabled':''}> 我已先寫自己的版本，現在核對 model</label></div>`;
    return `<div class="gm-model" data-model-task="${task}"><div class="gm-status-line"><strong>${escape(model.title)}</strong><span>${modelWordCount(model)} words</span></div>${model.sections.map(section=>`<section data-structure="${escape(section.heading)}"><h4>${escape(section.heading)}</h4><p>${section.sentences.map((sentence,index)=>`<button class="gm-model-sentence ${sentence.sources.length?'has-source':'is-rhetorical'} task${task}" data-model-sentence="${task}:${escape(section.heading)}:${index}" title="${escape(sentence.function)}">${escape(sentence.text)}</button>`).join(' ')}</p></section>`).join('')}<div class="gm-model-map"><strong>Sentence evidence map</strong><p>選擇一句查看來源；有 factual source 的句子會同時開啟可拖曳的 original-source preview。</p></div><div class="gm-prohibited"><strong>Do not claim:</strong><ul>${model.prohibited.map(item=>`<li>${escape(item)}</li>`).join('')}</ul></div></div>`;
  }
  function renderWriting(){
    const task=Number(state.writingTask);const info=tasks[task];
    $('#gm-writing').innerHTML=`<div class="gm-writing-task-tabs" role="tablist" aria-label="Writing tasks">${[8,9,10].map(number=>`<button class="gm-btn" role="tab" data-writing-task="${number}" aria-selected="${number===task}">Task ${number}</button>`).join('')}</div><div class="gm-writing-layout"><div class="gm-card gm-writing"><p class="gm-kicker">Chapter 5 · ${info.genre}</p><h3>${escape(info.purpose)}</h3><label><strong>Plan · 先列證據和段落功能</strong><textarea data-kind="plan" rows="6">${escape(state.plans[task])}</textarea></label><label><strong>Your draft</strong><textarea data-kind="draft" spellcheck="true">${escape(state.drafts[task])}</textarea></label><div class="gm-status-line"><span class="gm-word-count">${wordCount(state.drafts[task])} words · target ${info.words}</span><div class="gm-btn-row"><button class="gm-btn" data-copy-qab="${task}">複製到 QAB 首頁</button><button class="gm-btn" data-native-page="${info.page}">看原題</button></div></div><div data-model-host>${modelHtml(task)}</div></div><aside class="gm-card"><p class="gm-kicker">Task ${task} evidence bank</p><h3>只顯示已獲准證據</h3><div class="gm-transcript" style="max-height:680px">${evidenceList(task)}</div></aside></div>`;
    const plan=$('[data-kind="plan"]',$('#gm-writing'));const draft=$('[data-kind="draft"]',$('#gm-writing'));
    plan.addEventListener('input',()=>{state.plans[task]=plan.value;save();});
    draft.addEventListener('input',()=>{state.drafts[task]=draft.value;save();$('.gm-word-count').textContent=`${wordCount(draft.value)} words · target ${info.words}`;const unlock=$('[data-unlock-model]');if(unlock)unlock.disabled=wordCount(draft.value)<20;updateController();});
    updateController();
  }

  function renderAll(){renderContracts();renderCategorize();renderListening();renderEvidence();renderWriting();$('#gm-slot').value=activeSlot;$('#gm-question-draft').value=state.questionDraft;setTab(state.tab,false);addPageBadges();updateController();}
  function setTab(tab,focus=true){
    if(!['contracts','categorize','listen','evidence','writing'].includes(tab))tab='contracts';state.tab=tab;save();
    $$('.gm-tab').forEach(button=>{const selected=button.dataset.tab===tab;button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1;});
    $$('.gm-panel').forEach(panel=>panel.hidden=panel.dataset.panel!==tab);
    if(tab!=='listen'){if(noteTyping)cancelNoteTyping();restoreNativeNoteSheet();$('#gm-transcript-window').hidden=true;$('#gm-audio')?.pause();}else{mountNativeNoteSheet();if(state.transcriptOpen)openTranscriptWindow();}
    if(!['writing','evidence'].includes(tab))closeModelPreview();
    if(!['categorize','evidence'].includes(tab))routeGhostUnit=null;const activePanel=$(`.gm-panel[data-panel="${tab}"]`);animateArrival(activePanel);if(focus)$(`.gm-tab[data-tab="${tab}"]`).focus();announce(`Opened chapter ${tab}`);updateController();requestAnimationFrame(trackSpotlight);
  }
  function setWritingTask(task){state.writingTask=Number(task);save();renderWriting();announce(`Task ${task} writing workspace`);}
  function jumpPage(page,openScan=false){
    state.returnRoute={tab:state.tab,unitId:state.unitId,writingTask:state.writingTask,label:state.tab==='writing'?`Task ${state.writingTask} writing`:state.tab};save();
    suspendSpotlight();
    if(page===3)restoreNativeNoteSheet();
    $$('.gm-page-target').forEach(node=>node.classList.remove('gm-page-target'));
    const target=$(`#page-${page}`);if(!target)return;
    target.classList.add('gm-page-target');
    if(openScan){const details=$('.reference-scan',target);if(details)details.open=true;}
    scrollInstant(target);updateController();announce(`Original page ${page} · use the fixed return control to resume.`);
  }
  function visitSourceRoute(unit){state.returnRoute={tab:state.tab,unitId:unit.id,writingTask:state.writingTask,label:`${unit.id} route`,sourceRoute:true,page:unit.page};save();suspendSpotlight();restoreNativeNoteSheet();const target=$(`#page-${unit.page}`);if(!target){announce(`${unit.id} destination is unavailable; the route clue remains visible for manual navigation.`);return;}$$('.gm-page-target').forEach(node=>node.classList.remove('gm-page-target'));target.classList.add('gm-page-target');scrollInstant(target);updateController();announce(`Visited exact audited destination P${unit.page} for ${unit.id}.`);}
  function returnToCuration(){const route=state.returnRoute;if(!route)return;state.returnRoute=null;if(route.unitId&&unitById.has(route.unitId))state.unitId=route.unitId;if([8,9,10].includes(Number(route.writingTask)))state.writingTask=Number(route.writingTask);routeGhostUnit=route.sourceRoute?route.unitId:null;setTab(route.tab||'contracts',false);if(state.tab==='writing')renderWriting();else if(state.tab==='categorize')renderCategorize();else if(state.tab==='evidence')renderEvidence();save();scrollInstant(shell);updateController();announce(route.sourceRoute?'Returned to the exact route origin; route remains as a 0.16 ghost.':'Returned to the exact Super Curation context.');}
  function addPageBadges(){
    for(let page=1;page<=19;page+=1){const header=$(`#page-${page}>header`);if(!header||$('.gm-page-badges',header))continue;const pageUnits=units.filter(unit=>unit.page===page);const taskSet=new Set(pageUnits.flatMap(unit=>unit.tasks));const wrap=document.createElement('span');wrap.className='gm-page-badges';wrap.innerHTML=`<span class="gm-page-badge">${pageUnits.length} units</span>${[8,9,10].filter(task=>taskSet.has(task)).map(task=>`<span class="gm-page-badge t${task}">T${task}</span>`).join('')}`;header.append(wrap);}
  }
  function markNativePhrases(){
    let marked=0;
    for(const unit of units.filter(item=>item.page<=11&&item.typeNumber>=1&&item.typeNumber<=3)){
      const phrase=unit.excerpt.replace(/\[|\]/g,'').replace(/^“|”$/g,'').trim();if(phrase.length<8)continue;
      const candidates=$$(`#page-${unit.page} [lang="en"]`).filter(node=>!node.closest('.translation'));
      for(const candidate of candidates){
        const text=candidate.textContent;const start=text.toLocaleLowerCase().indexOf(phrase.toLocaleLowerCase());if(start<0)continue;
        const taskLabel=unit.tasks.length?unit.tasks.map(task=>`T${task}`).join(' · '):'route';candidate.classList.add('gm-source-paragraph');candidate.dataset.gmTasks=[...new Set([...(candidate.dataset.gmTasks||'').split(' · ').filter(Boolean),...taskLabel.split(' · ')])].join(' · ');candidate.setAttribute('aria-label',`${candidate.dataset.gmTasks} source paragraph: ${text.trim()}`);
        if(candidate.querySelector('mark'))continue;
        const walker=document.createTreeWalker(candidate,NodeFilter.SHOW_TEXT);const nodes=[];let node,offset=0;
        while((node=walker.nextNode())){nodes.push({node,start:offset,end:offset+node.length});offset+=node.length;}
        const first=nodes.find(item=>item.end>start);const last=nodes.find(item=>item.end>=start+phrase.length);if(!first||!last)continue;
        const range=document.createRange();range.setStart(first.node,start-first.start);range.setEnd(last.node,start+phrase.length-last.start);
        const mark=document.createElement('mark');mark.className=`gm-source-mark gm-source-mark-t${unit.tasks[0]||0}`;mark.dataset.unit=unit.id;mark.title=`${unit.id} · ${unit.decision}`;
        try{mark.append(range.extractContents());range.insertNode(mark);marked+=1;}catch{}
        break;
      }
    }
    return marked;
  }
  function currentExplorerPanel(){return state.tab==='categorize'?$('#gm-categorize'):$('#gm-evidence');}
  function goUnit(direction){const panel=currentExplorerPanel();const {list,index}=currentUnit(panel);const next=list[index+(direction==='next'?1:-1)];if(!next)return;state.unitId=next.id;save();renderExplorer(panel);$('.gm-unit',panel).focus({preventScroll:true});announce(next.id);}
  function openUnit(id){if(!unitById.has(id))return;state.unitId=id;state.decision='all';state.task='all';setTab('evidence');renderEvidence();$('#gm-evidence .gm-unit').focus();}
  function completeTab(tab){if(!state.completedTabs.includes(tab))state.completedTabs.push(tab);save();}
  function controllerNext(){
    if(state.tab==='contracts'){completeTab('contracts');setTab('categorize');return;}
    if(['categorize','evidence'].includes(state.tab)){const panel=currentExplorerPanel(),{list,index}=currentUnit(panel);if(index<list.length-1){goUnit('next');return;}completeTab(state.tab);setTab(state.tab==='categorize'?'listen':'writing');return;}
    if(state.tab==='listen'){const next=listeningData.cues.find(cue=>!state.heardCues.includes(cue.index));if(next){playCue(next.index);return;}completeTab('listen');setTab('evidence');return;}
    if(state.tab==='writing'){if(state.writingTask<10){setWritingTask(state.writingTask===8?9:10);return;}completeTab('writing');announce('三項寫作 workspace 已到最後一項。');}
  }
  function controllerPrev(){
    if(state.tab==='contracts')return;
    if(['categorize','evidence'].includes(state.tab)){const panel=currentExplorerPanel(),{index}=currentUnit(panel);if(index>0){goUnit('prev');return;}setTab(state.tab==='categorize'?'contracts':'listen');return;}
    if(state.tab==='listen'){const audio=$('#gm-audio');let index=activeCueIndex(audio?.currentTime||0);if(index>0){audio.currentTime=listeningData.cues[index-1].start;updateAudioState(audio);return;}setTab('categorize');return;}
    if(state.tab==='writing'){if(state.writingTask>8){setWritingTask(state.writingTask===10?9:8);return;}setTab('evidence');}
  }
  function navigateBookmark(key){if(!key)return;const [kind,value]=key.split(':');if(kind==='categorize'||kind==='evidence'){if(unitById.has(value))state.unitId=value;state.decision='all';state.task='all';setTab(kind);kind==='categorize'?renderCategorize():renderEvidence();}
    else if(kind==='listen'){setTab('listen');const audio=$('#gm-audio'),cue=listeningData.cues[Number(value)];if(cue){audio.currentTime=cue.start;updateAudioState(audio);}}
    else if(kind==='writing'){setWritingTask(Number(value));setTab('writing');}else setTab('contracts');save();}
  function openHelp(){const help={contracts:'逐項核對身份、讀者、文體、目的、字數、指定來源和禁止事項。',categorize:'先自行選 Task 8/9/10 或 route/noise，再揭示 canonical Type 1–6 和七種 answer decision。',listen:'按 cue 播放會在句末自動停止；只有完整聽完才會開啟 evidence gate。前跳不算已聽，倒帶會撤回之後狀態。',evidence:'只有「獨立寫入／合併寫入／只保留結論」可進 evidence bank；每項保留 stable source ID。',writing:'先寫至少 20 words 才解鎖 model；選 model 句子會顯示 exact source IDs 和可拖曳原文 preview。'};$('#gm-help-content').innerHTML=`<p>${help[state.tab]}</p><p><strong>目前位置：</strong> ${escape($('#gm-step-status').textContent)}</p>`;$('#gm-question-draft').value=state.questionDraft;const dialog=$('#gm-help-dialog');if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');}
  function switchSlot(next){save();activeSlot=String(next);state=sanitizeState(slots[activeSlot]);renderAll();$('#gm-save-status').textContent=`Slot ${activeSlot} · 已切換並自動儲存`;announce(`Switched to save slot ${activeSlot}.`);}
  function exportSlot(){save();const payload={format:'edmund-paper3-curation-save',version:VERSION,year:2019,level:'B2',slot:activeSlot,createdAt:new Date().toISOString(),state:sanitizeState(state)};const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));const anchor=document.createElement('a');anchor.href=url;anchor.download=`paper3-2019-b2-curation-slot-${activeSlot}.json`;anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  async function importSlot(file){try{if(!file||file.size>1024*1024)throw Error('存檔缺失或超過 1 MB');const payload=JSON.parse(await file.text());if(payload?.format!=='edmund-paper3-curation-save'||payload.version!==VERSION||payload.year!==2019||String(payload.level).toUpperCase()!=='B2'||!payload.state||typeof payload.state!=='object')throw Error('這不是 2019 B2 v2 的有效存檔');state=sanitizeState(payload.state);save();renderAll();$('#gm-save-status').textContent=`已驗證並匯入至 Slot ${activeSlot}`;}catch(error){$('#gm-save-status').textContent=`匯入失敗：${error.message}`;}}

  $('#gm-prev-step').addEventListener('click',controllerPrev);$('#gm-next-step').addEventListener('click',controllerNext);$('#gm-help').addEventListener('click',openHelp);
  $('#gm-spotlight-toggle').addEventListener('click',()=>{state.spotlight=!state.spotlight;save();updateController();trackSpotlight();announce(`Spotlight ${state.spotlight?'enabled':'disabled'}; active outlines and evidence marks are unchanged.`);});
  $('#gm-bookmark').addEventListener('click',()=>{const key=bookmarkKey(),index=state.bookmarks.indexOf(key);if(index>=0)state.bookmarks.splice(index,1);else state.bookmarks.push(key);save();updateBookmarks();announce(index>=0?'Bookmark removed.':'Bookmark saved.');});
  $('#gm-bookmark-jump').addEventListener('change',event=>{navigateBookmark(event.target.value);event.target.value='';});
  $('#gm-slot').addEventListener('change',event=>switchSlot(event.target.value));$('#gm-save-now').addEventListener('click',save);$('#gm-export').addEventListener('click',exportSlot);
  $('#gm-import').addEventListener('change',async event=>{const file=event.target.files?.[0];await importSlot(file);event.target.value='';});
  $('#gm-question-draft').addEventListener('input',event=>{state.questionDraft=event.target.value;save();});$('#gm-return-route').addEventListener('click',returnToCuration);

  shell.addEventListener('click',event=>{
    const tab=event.target.closest('[data-tab]');if(tab){setTab(tab.dataset.tab);return;}
    const tabTarget=event.target.closest('[data-tab-target]');if(tabTarget){setTab(tabTarget.dataset.tabTarget);return;}
    const start=event.target.closest('[data-start-task]');if(start){setWritingTask(start.dataset.startTask);setTab('writing');return;}
    const native=event.target.closest('[data-native-page]');if(native){jumpPage(Number(native.dataset.nativePage));return;}
    if(event.target.closest('[data-jump-current]')){const {unit}=currentUnit(currentExplorerPanel());jumpPage(unit.page);return;}
    if(event.target.closest('[data-open-scan]')){const {unit}=currentUnit(currentExplorerPanel());jumpPage(unit.page,true);return;}
    const decision=event.target.closest('[data-decision]');if(decision){state.decision=decision.dataset.decision;save();renderExplorer(currentExplorerPanel());return;}
    const taskFilter=event.target.closest('[data-task-filter]');if(taskFilter){state.task=taskFilter.dataset.taskFilter;save();renderExplorer(currentExplorerPanel());return;}
    if(event.target.closest('[data-clear-filters]')){state.decision='all';state.task='all';save();renderExplorer(currentExplorerPanel());return;}
    const categoryTask=event.target.closest('[data-category-task]');if(categoryTask){const panel=currentExplorerPanel(),{unit}=currentUnit(panel),task=Number(categoryTask.dataset.categoryTask);const values=new Set(state.categories[unit.id]||[]);categoryTask.checked?values.add(task):values.delete(task);state.categories[unit.id]=[...values].sort((a,b)=>a-b);state.categoryRevealed=state.categoryRevealed.filter(id=>id!==unit.id);save();renderExplorer(panel);return;}
    const categoryNone=event.target.closest('[data-category-none]');if(categoryNone){const panel=currentExplorerPanel(),{unit}=currentUnit(panel);if(categoryNone.checked)state.categories[unit.id]=[];state.categoryRevealed=state.categoryRevealed.filter(id=>id!==unit.id);save();renderExplorer(panel);return;}
    if(event.target.closest('[data-reveal-category]')){const panel=currentExplorerPanel(),{unit}=currentUnit(panel);if(!state.categoryRevealed.includes(unit.id)){state.categoryRevealed.push(unit.id);pendingStampUnit=unit.id;}save();renderExplorer(panel);announce(`${unit.id} canonical classification revealed after provisional choice.`);return;}
    const nav=event.target.closest('[data-unit-nav]');if(nav){goUnit(nav.dataset.unitNav);return;}
    if(event.target.closest('[data-review-unit]')){const panel=currentExplorerPanel();const {unit}=currentUnit(panel);if(!state.reviewed.includes(unit.id))state.reviewed.push(unit.id);save();renderExplorer(panel);announce(`${unit.id} reviewed`);return;}
    const bank=event.target.closest('[data-bank-task]');if(bank){const panel=currentExplorerPanel();const {unit}=currentUnit(panel);const task=Number(bank.dataset.bankTask),audioReady=!unit.audioCue||state.heardCues.includes(unit.audioCue.index);if(audioReady)animateBankTransfer(bank,panel,unit,task);else announce(`Cue ${unit.audioCue.index+1} must be heard first.`);return;}
    const remove=event.target.closest('[data-remove-bank]');if(remove){const [task,id]=remove.dataset.removeBank.split(':');state.bank[task]=state.bank[task].filter(item=>item!==id);save();renderExplorer(currentExplorerPanel());return;}
    const seek=event.target.closest('[data-seek-unit]');if(seek){setTab('listen');playCue(Number(seek.dataset.seekUnit));return;}
    const reveal=event.target.closest('[data-reveal-note]');if(reveal&&!reveal.disabled){typeSuggestedNote(reveal.dataset.revealNote);return;}
    const routeVisit=event.target.closest('[data-route-visit]');if(routeVisit){const unit=unitById.get(routeVisit.dataset.routeVisit);if(unit)visitSourceRoute(unit);return;}
    const writingTask=event.target.closest('[data-writing-task]');if(writingTask){setWritingTask(writingTask.dataset.writingTask);return;}
    const unlock=event.target.closest('[data-unlock-model]');if(unlock&&unlock.checked){const task=Number(unlock.dataset.unlockModel);if(wordCount(state.drafts[task])>=20){state.modelUnlocked[task]=true;save();renderWriting();}return;}
    const sentenceButton=event.target.closest('[data-model-sentence]');if(sentenceButton){const [task,heading,index]=sentenceButton.dataset.modelSentence.split(':');const taskNumber=Number(task),section=modelData.tasks[task].sections.find(item=>item.heading===heading);const sentence=section?.sentences[Number(index)];const host=$('.gm-model-map');$$('.gm-model-sentence').forEach(button=>button.classList.toggle('is-selected',button===sentenceButton));if(sentence&&host){host.innerHTML=`<strong>${escape(sentence.function)}</strong><p>${sentence.sources.length?sentence.sources.map(id=>`<button class="gm-pill" data-preview-source="${id}">${id}</button>`).join(' '):'<span class="gm-pill">Documented rhetorical function · no source claim</span>'}</p>`;for(const id of sentence.sources)if(!state.modelUses[taskNumber].includes(id))state.modelUses[taskNumber].push(id);save();$$('.gm-writing-evidence').forEach(button=>button.classList.toggle('is-consumed',state.modelUses[taskNumber].includes(button.dataset.openUnit)));if(sentence.sources.length)openModelPreview(sentence.sources);else closeModelPreview();}return;}
    const previewSource=event.target.closest('[data-preview-source]');if(previewSource){renderModelPreview(previewSource.dataset.previewSource);return;}
    const open=event.target.closest('[data-open-unit]');if(open){openUnit(open.dataset.openUnit);return;}
    const copy=event.target.closest('[data-copy-qab]');if(copy){const task=Number(copy.dataset.copyQab);const target=$(`#answer-${tasks[task].page}`);if(target){target.value=state.drafts[task];target.dispatchEvent(new Event('input',{bubbles:true}));jumpPage(tasks[task].page);announce(`Task ${task} draft copied to Question-Answer Book page`);}return;}
    const closeWindow=event.target.closest('[data-close-window]');if(closeWindow){closeWindow.dataset.closeWindow==='transcript'?closeTranscriptWindow():closeModelPreview();return;}
    const translationToggle=event.target.closest('[data-toggle-translation]');if(translationToggle){const windowNode=$('#gm-transcript-window'),show=windowNode.classList.toggle('show-translation');translationToggle.setAttribute('aria-pressed',String(show));translationToggle.textContent=show?'隱藏中文':'中文對照';return;}
    if(event.target.closest('#gm-reset')){if(confirm(`只重設 2019 B2 Super Curation Slot ${activeSlot} 的進度、筆記、證據庫和草稿？其他 slots 與原卷 reader 不受影響。`)){slots[activeSlot]=defaultState();state=sanitizeState(slots[activeSlot]);save();renderAll();announce(`Super Curation Slot ${activeSlot} reset`);}return;}
  });
  shell.addEventListener('keydown',event=>{
    const activeTab=event.target.closest?.('.gm-tab');
    if(activeTab&&['ArrowRight','ArrowLeft','Home','End'].includes(event.key)){
      event.preventDefault();const tabs=$$('.gm-tab');let index=tabs.indexOf(activeTab);
      if(event.key==='ArrowRight')index=(index+1)%tabs.length;
      if(event.key==='ArrowLeft')index=(index-1+tabs.length)%tabs.length;
      if(event.key==='Home')index=0;if(event.key==='End')index=tabs.length-1;
      setTab(tabs[index].dataset.tab);return;
    }
    if(event.target.matches('textarea,input,audio'))return;
    if(event.key==='ArrowRight'&&['categorize','evidence'].includes(state.tab)){event.preventDefault();goUnit('next');}
    if(event.key==='ArrowLeft'&&['categorize','evidence'].includes(state.tab)){event.preventDefault();goUnit('prev');}
  });
  document.addEventListener('keydown',event=>{if(event.key!=='Escape')return;const preview=$('#gm-model-preview'),transcript=$('#gm-transcript-window'),dialog=$('#gm-help-dialog');if(preview&&!preview.hidden){closeModelPreview();event.preventDefault();return;}if(transcript&&!transcript.hidden){closeTranscriptWindow();event.preventDefault();return;}if(dialog?.open){dialog.close();event.preventDefault();}});

  const missingModelSources=[];
  for(const [task,model] of Object.entries(modelData.tasks))for(const section of model.sections)for(const sentence of section.sentences)for(const id of sentence.sources)if(!unitById.has(id))missingModelSources.push({task,sentence:sentence.text,id});
  renderAll();
  const nativeMarks=markNativePhrases();
  window.EDMUND_2019_B2_CURATION_DIAGNOSTICS=Object.freeze({version:VERSION,unitCount:units.length,decisionCount:DECISIONS.length,cueCount:listeningData.cueCount,audioOwnerCount:$$('#gm-audio').length,nativeMarks,nativeTaskParagraphs:$$('.gm-source-paragraph').length,saveSlotCount:5,missingModelSources,getState:()=>JSON.parse(JSON.stringify(state)),getEnvelope:()=>JSON.parse(JSON.stringify({version:VERSION,activeSlot,slots}))});
})();
