(()=>{
  'use strict';
  const sourceData=window.EDMUND_2019_B2_SOURCE_UNITS;
  const listeningData=window.EDMUND_2019_B2_LISTENING;
  const modelData=window.EDMUND_2019_B2_MODELS;
  if(!sourceData||!listeningData||!modelData||!document.querySelector('#reader')||document.querySelector('#super-curation'))return;

  const VERSION='2019-b2-super-curation-v4';
  const STORAGE='edmund-paper3-2019-b2-curation-v4';
  const LEGACY_STORAGE_V3='edmund-paper3-2019-b2-curation-v3';
  const LEGACY_STORAGE_V2='edmund-paper3-2019-b2-curation-v2';
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
  const defaultState=()=>({version:VERSION,tab:'contracts',contractIndex:0,unitId:units[0].id,decision:'all',task:'all',reviewed:[],bank:{8:[],9:[],10:[]},notes:{},generatedNotes:{},noteRevealed:[],heardCues:[],categories:{},categoryRevealed:[],bookmarks:[],completedTabs:[],writingTask:8,plans:{8:'',9:'',10:''},drafts:{8:'',9:'',10:''},modelUnlocked:{8:false,9:false,10:false},modelUses:{8:[],9:[],10:[]},questionDraft:'',playbackRate:1,transcriptOpen:false,spotlight:false,windowLayout:{transcript:null,preview:null},returnRoute:null});
  function sanitizeState(saved){
    const fresh=defaultState();if(!saved||typeof saved!=='object')return fresh;
    const validIds=new Set(units.map(unit=>unit.id));const validCue=index=>Number.isInteger(index)&&index>=0&&index<listeningData.cueCount;
    const clean={...fresh,version:VERSION};
    clean.tab=['contracts','categorize','listen','evidence','writing'].includes(saved.tab)?saved.tab:'contracts';
    clean.contractIndex=Number.isInteger(saved.contractIndex)?Math.max(0,Math.min(26,saved.contractIndex)):0;
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
    if(!Number.isInteger(saved.contractIndex))clean.completedTabs=clean.completedTabs.filter(tab=>tab!=='contracts');
    clean.writingTask=[8,9,10].includes(Number(saved.writingTask))?Number(saved.writingTask):8;
    clean.plans={...fresh.plans,...(saved.plans||{})};clean.drafts={...fresh.drafts,...(saved.drafts||{})};clean.modelUnlocked={...fresh.modelUnlocked,...(saved.modelUnlocked||{})};
    clean.modelUses={8:[],9:[],10:[]};for(const task of [8,9,10])clean.modelUses[task]=[...new Set(Array.isArray(saved.modelUses?.[task])?saved.modelUses[task].filter(id=>validIds.has(id)):[])];
    clean.questionDraft=typeof saved.questionDraft==='string'?saved.questionDraft.slice(0,5000):'';
    clean.playbackRate=[.5,.75,1,1.25,1.5,1.75,2].includes(Number(saved.playbackRate))?Number(saved.playbackRate):1;
    clean.spotlight=saved.version===VERSION?Boolean(saved.spotlight):false;
    clean.transcriptOpen=Boolean(saved.transcriptOpen);clean.windowLayout=saved.windowLayout&&typeof saved.windowLayout==='object'?{...fresh.windowLayout,...saved.windowLayout}:{...fresh.windowLayout};
    // A return route is only meaningful inside the current page session. Persisting it
    // leaves a refreshed or second tab stranded away from the active native source.
    clean.returnRoute=null;
    return clean;
  }
  function loadEnvelope(){
    try{const stored=JSON.parse(localStorage.getItem(STORAGE)||'null');if(stored?.version===VERSION&&stored.slots&&typeof stored.slots==='object'){const activeSlot=/^[1-5]$/.test(String(stored.activeSlot))?String(stored.activeSlot):'1';const slots={};for(let index=1;index<=5;index+=1)if(stored.slots[index])slots[index]=sanitizeState(stored.slots[index]);return {activeSlot,slots};}}catch{}
    try{const stored=JSON.parse(localStorage.getItem(LEGACY_STORAGE_V3)||'null');if(stored?.version==='2019-b2-super-curation-v3'&&stored.slots&&typeof stored.slots==='object'){const activeSlot=/^[1-5]$/.test(String(stored.activeSlot))?String(stored.activeSlot):'1';const slots={};for(let index=1;index<=5;index+=1)if(stored.slots[index])slots[index]=sanitizeState(stored.slots[index]);return {activeSlot,slots};}}catch{}
    try{const stored=JSON.parse(localStorage.getItem(LEGACY_STORAGE_V2)||'null');if(stored?.version==='2019-b2-super-curation-v2'&&stored.slots&&typeof stored.slots==='object'){const activeSlot=/^[1-5]$/.test(String(stored.activeSlot))?String(stored.activeSlot):'1';const slots={};for(let index=1;index<=5;index+=1)if(stored.slots[index])slots[index]=sanitizeState(stored.slots[index]);return {activeSlot,slots};}}catch{}
    try{const legacy=JSON.parse(localStorage.getItem(LEGACY_STORAGE)||'null');if(legacy?.version==='2019-b2-super-curation-v1')return {activeSlot:'1',slots:{1:sanitizeState(legacy)}};}catch{}
    return {activeSlot:'1',slots:{}};
  }
  const envelope=loadEnvelope();let activeSlot=envelope.activeSlot;let slots=envelope.slots;let state=sanitizeState(slots[activeSlot]);
  const save=()=>{state.version=VERSION;state.updatedAt=new Date().toISOString();slots[activeSlot]=sanitizeState(state);const status=$('#gm-save-status');try{localStorage.setItem(STORAGE,JSON.stringify({version:VERSION,activeSlot,slots}));if(status)status.textContent=`Slot ${activeSlot} · 已自動儲存在這部裝置`;}catch(error){if(status)status.textContent='本機儲存失敗；目前工作階段仍可使用，請匯出存檔。';announce('Local save failed; current session remains usable and export is available.');}};
  const announce=message=>{const live=$('#gm-live');if(live)live.textContent=message;};
  const afterMotion=(node,eventName,timeout,callback)=>{let settled=false;const finish=()=>{if(settled)return;settled=true;clearTimeout(timer);node?.removeEventListener(eventName,finish);callback();};const timer=setTimeout(finish,reduceMotion?0:timeout);node?.addEventListener(eventName,finish,{once:true});return finish;};
  const viewportBox=()=>({left:visualViewport?.offsetLeft||0,top:visualViewport?.offsetTop||0,width:visualViewport?.width||innerWidth,height:visualViewport?.height||innerHeight});
  let spotlightFrame=0,spotlightUntil=0,pendingStampUnit=null,routeGhostUnit=null,noteTyping=null,previewInkTimer=0,currentNativeTarget=null;
  const bankTransfers=new Set();
  function spotlightTarget(){return state.spotlight&&!state.returnRoute?currentNativeTarget:null;}
  function placeSpotlight(){const wrap=$('.gm-spotlight');const target=spotlightTarget();if(!wrap||!target){if(wrap)wrap.hidden=true;return;}const rect=target.getBoundingClientRect(),pad=9,view=viewportBox(),viewRight=view.left+view.width,viewBottom=view.top+view.height;wrap.hidden=false;const top=Math.max(view.top,rect.top-pad),left=Math.max(view.left,rect.left-pad),right=Math.min(viewRight,rect.right+pad),bottom=Math.min(viewBottom,rect.bottom+pad);Object.assign($('[data-mask="top"]',wrap).style,{left:`${view.left}px`,top:`${view.top}px`,width:`${view.width}px`,height:`${Math.max(0,top-view.top)}px`});Object.assign($('[data-mask="right"]',wrap).style,{left:`${right}px`,top:`${top}px`,width:`${Math.max(0,viewRight-right)}px`,height:`${Math.max(0,bottom-top)}px`});Object.assign($('[data-mask="bottom"]',wrap).style,{left:`${view.left}px`,top:`${bottom}px`,width:`${view.width}px`,height:`${Math.max(0,viewBottom-bottom)}px`});Object.assign($('[data-mask="left"]',wrap).style,{left:`${view.left}px`,top:`${top}px`,width:`${Math.max(0,left-view.left)}px`,height:`${Math.max(0,bottom-top)}px`});target.classList.add('gm-active-target');}
  function trackSpotlight(){cancelAnimationFrame(spotlightFrame);$$('.gm-active-target').forEach(node=>node.classList.remove('gm-active-target'));placeSpotlight();spotlightUntil=performance.now()+(reduceMotion?0:900);const follow=now=>{placeSpotlight();if(now<spotlightUntil)spotlightFrame=requestAnimationFrame(follow);};if(!reduceMotion)spotlightFrame=requestAnimationFrame(follow);}
  function suspendSpotlight(){cancelAnimationFrame(spotlightFrame);const wrap=$('.gm-spotlight');if(wrap)wrap.hidden=true;$$('.gm-active-target').forEach(node=>node.classList.remove('gm-active-target'));}
  function animateArrival(panel){if(!panel)return;panel.classList.remove('gm-arriving');void panel.offsetWidth;panel.classList.add('gm-arriving');afterMotion(panel,'animationend',550,()=>panel.classList.remove('gm-arriving'));}
  function scrollInstant(target,block='start'){if(!target)return;const root=document.documentElement,previous=root.style.scrollBehavior;root.style.scrollBehavior='auto';target.scrollIntoView({behavior:'auto',block});root.style.scrollBehavior=previous;}
  function nativePageAsset(page){const original=$(`#page-${page} .reference-scan img`);return original?.currentSrc||original?.src||new URL(`assets/page-${String(page).padStart(2,'0')}.webp`,document.baseURI).href;}
  function nativeTargetForUnit(unit){
    if(!unit)return null;
    const exact=$(`[data-unit="${unit.id}"]`);if(exact)return exact;
    const page=$(`#page-${unit.page}`);if(!page)return null;
    const phrase=String(unit.excerpt||unit.heading||'').replace(/[\[\]*]/g,'').replace(/^“|”$/g,'').trim().toLocaleLowerCase();
    if(phrase.length>=8){const candidates=$$('[lang="en"]',page).filter(node=>!node.closest('.translation'));const match=candidates.filter(node=>node.textContent.toLocaleLowerCase().includes(phrase)).sort((a,b)=>a.textContent.length-b.textContent.length)[0];if(match)return match;}
    return $('.native-document',page)||page;
  }
  function setNativeTarget(target,{scroll=true}={}){
    $$('.gm-native-current').forEach(node=>node.classList.remove('gm-native-current'));
    currentNativeTarget=target||null;
    if(!currentNativeTarget)return;
    currentNativeTarget.classList.add('gm-native-current');
    if(scroll){const expected=currentNativeTarget;let remaining=6;const align=()=>{if(currentNativeTarget!==expected||remaining--<=0)return;const rect=expected.getBoundingClientRect(),offset=innerWidth<=1099?150:174;if(Math.abs(rect.top-offset)<=2)return;const root=document.documentElement,previous=root.style.scrollBehavior;root.style.scrollBehavior='auto';window.scrollTo({top:Math.max(0,window.scrollY+rect.top-offset),behavior:'auto'});root.style.scrollBehavior=previous;requestAnimationFrame(align);};align();}
  }
  function syncNativeSource({scroll=true}={}){
    if(state.returnRoute)return;
    let target=null;
    if(state.tab==='contracts')target=contractNativeTarget(contractSteps[state.contractIndex]);
    else if(['categorize','evidence'].includes(state.tab)){const panel=currentExplorerPanel();const unit=panel?currentUnit(panel).unit:null;target=nativeTargetForUnit(unit);}
    else if(state.tab==='listen'){const active=activeCueIndex($('#gm-audio')?.currentTime||0);const note=noteDefinitions.find(item=>active>=0&&active<=item.cue);target=note?$(`[data-curation-note="${note.id}"]`):nativeNoteSheet;target=target||$('#page-3 .native-document');}
    else if(state.tab==='writing')target=$(`#page-${tasks[state.writingTask].page} .native-document`)||$(`#page-${tasks[state.writingTask].page}`);
    setNativeTarget(target,{scroll});
  }

  const tasks={
    8:{name:'Task 8 · Report',genre:'Formal report',audience:'Inter-School Visual Media Society committee',purpose:'Persuade the committee not to choose Brighthouse Cinema.',words:'around 180',sources:'B2 Data File + listening notes',page:12,prohibition:'Use verified incompatibilities. Do not turn compliant facts into faults.'},
    9:{name:'Task 9 · Programme text',genre:'Festival programme copy',audience:'Visual Media Festival audience',purpose:'Explain the theme, outline the plot and promote the stand-out scene.',words:'around 120',sources:'B2 Data File',page:15,prohibition:'Do not repeat pre-filled metadata or convert production anecdotes into plot.'},
    10:{name:'Task 10 · Introductory speech',genre:'Spoken introduction',audience:'Post-screening discussion audience',purpose:'Open a balanced discussion on home/cinema viewing and blockbusters/low-budget films.',words:'around 200',sources:'B2 Data File + listening notes',page:17,prohibition:'Present both sides; do not turn forum hyperbole into certain fact.'}
  };
  const contractBossSteps=[
    {id:'boss-to',selector:'#page-4 .email-headers>div:nth-child(1)',excerpt:'To: Nico Lin',translation:'收件人：Nico Lin。',title:'先辨認寫作者身份',typeNumber:5,decision:'只控制身份／情境',analysis:'你是 Nico Lin。這個身份控制三項工作的共同情境，但不是任何一篇答案要抄寫的內容。',annotations:[{phrase:'Nico Lin',kind:'context'}]},
    {id:'boss-from',selector:'#page-4 .email-headers>div:nth-child(2)',excerpt:'From: Ringo Chow',translation:'寄件人：Ringo Chow。',title:'辨認任務發出者',typeNumber:5,decision:'只控制身份／情境',analysis:'Ringo Chow 發出三項工作。寄件者資料用來理解指示來源，不寫進答案。',annotations:[{phrase:'Ringo Chow',kind:'context'}]},
    {id:'boss-subject',selector:'#page-4 .email-headers>div:nth-child(3)',excerpt:'Subject: Things to do',translation:'主旨：要做的事情。',title:'辨認這是一封任務電郵',typeNumber:5,decision:'只作指路',sourceIds:['2019-B2-U0044'],annotations:[{phrase:'Things to do',kind:'hint'}]},
    {id:'boss-sent',selector:'#page-4 .email-headers>div:nth-child(4)',excerpt:'Sent: Sat 6 April 2019 9:02AM',translation:'寄出時間：2019 年 4 月 6 日星期六上午 9:02。',title:'鎖定資料先後',typeNumber:5,decision:'只用來判斷證據狀態',sourceIds:['2019-B2-U0045'],annotations:[{phrase:'Sat 6 April 2019 9:02AM',kind:'context'}]},
    {id:'boss-salutation',text:'Hi Nico',excerpt:'Hi Nico',translation:'Nico，你好：',title:'電郵稱呼不是答案內容',typeNumber:6,decision:'不寫入答案',sourceIds:['2019-B2-U0046'],annotations:[{phrase:'Hi Nico',kind:'reject'}]},
    {id:'boss-context',text:'We need to make sure we are on schedule',excerpt:'We need to make sure we are on schedule in our preparations for the screening of ‘The Electronic Durian’.',translation:'我們要確保《The Electronic Durian》放映會的籌備工作按進度進行。',title:'共同背景，不等於任務內容',typeNumber:4,decision:'不寫入答案',sourceIds:['2019-B2-U0057'],annotations:[{phrase:'on schedule',kind:'context'},{phrase:'screening of ‘The Electronic Durian’',kind:'context'}]},
    {id:'boss-task8',text:'First, write a brief report',excerpt:'First, write a brief report on the Brighthouse Cinema in Sha Tak for the next Inter-School Visual Media Society committee meeting.',translation:'首先，請為下次校際視像媒體學會委員會會議撰寫一份關於沙達 Brighthouse Cinema 的簡短報告。',title:'Task 8：先鎖定文體、主題與讀者',task:8,typeNumber:1,decision:'只控制語氣／格式',sourceIds:['2019-B2-U0058','2019-B2-U0059','2019-B2-U0060'],annotations:[{phrase:'write a brief report',task:8},{phrase:'Brighthouse Cinema in Sha Tak',task:8},{phrase:'next Inter-School Visual Media Society committee meeting',task:8}]},
    {id:'boss-task8-purpose',text:'We need to persuade the committee',excerpt:'We need to persuade the committee not to take this venue.',translation:'我們需要說服委員會不要選用這個場地。',title:'Task 8：記錄核心寫作目的',task:8,typeNumber:1,decision:'合併寫入',sourceIds:['2019-B2-U0061'],annotations:[{phrase:'persuade the committee not to take this venue',task:8,point:1}]},
    {id:'boss-task8-sources',text:'You can start by having a look at the minutes',excerpt:'You can start by having a look at the minutes from the committee meeting and Alia’s site visit notes as well as the notes you took from the video conference I had with Mira.',translation:'你可以參考委員會會議紀錄、Alia 的實地考察筆記，以及你在我與 Mira 的視像會議中所作的筆記。',title:'Task 8：辨認三條來源路線',task:8,typeNumber:5,decision:'只作指路',sourceIds:['2019-B2-U0062','2019-B2-U0063','2019-B2-U0064'],annotations:[{phrase:'minutes from the committee meeting',task:8,kind:'hint'},{phrase:'Alia’s site visit notes',task:8,kind:'hint'},{phrase:'notes you took from the video conference I had with Mira',task:8,kind:'hint'}]},
    {id:'boss-task9',text:'Second, write the text',excerpt:'Second, write the text for the Visual Media Festival programme for the ‘The Electronic Durian’.',translation:'第二，為視像媒體節的《The Electronic Durian》場刊撰寫文字。',title:'Task 9：鎖定節目冊文體與電影',task:9,typeNumber:2,decision:'只控制語氣／格式',sourceIds:['2019-B2-U0065','2019-B2-U0066'],annotations:[{phrase:'write the text',task:9},{phrase:'Visual Media Festival programme',task:9},{phrase:'‘The Electronic Durian’',task:9}]},
    {id:'boss-task9-theme-plot',text:'Include the main theme',excerpt:'Include the main theme of the film and an outline of the plot.',translation:'包括電影的主題和劇情概要。',title:'Task 9：逐項記錄指定內容',task:9,typeNumber:2,decision:'合併寫入',sourceIds:['2019-B2-U0067','2019-B2-U0068'],annotations:[{phrase:'main theme of the film',task:9,point:1},{phrase:'an outline of the plot',task:9,point:2}]},
    {id:'boss-task9-scene',text:'Don’t forget to mention',excerpt:'Don’t forget to mention that ‘stand-out scene’.',translation:'別忘了提及那個「最出色的場景」。',title:'Task 9：第三項內容不可漏寫',task:9,typeNumber:2,decision:'合併寫入',sourceIds:['2019-B2-U0069'],annotations:[{phrase:'‘stand-out scene’',task:9,point:3}]},
    {id:'boss-task9-sources',text:'You can start by looking at the interview',excerpt:'You can start by looking at the interview with Isabel Luna and the FilmTalk Forum to help you.',translation:'你可以參考 Isabel Luna 的訪問和 FilmTalk 論壇。',title:'Task 9：辨認兩條來源路線',task:9,typeNumber:5,decision:'只作指路',sourceIds:['2019-B2-U0070','2019-B2-U0071'],annotations:[{phrase:'interview with Isabel Luna',task:9,kind:'hint'},{phrase:'FilmTalk Forum',task:9,kind:'hint'}]},
    {id:'boss-task10',text:'Finally, you will be giving',excerpt:'Finally, you will be giving the introductory speech before the discussion, which will take place on the stage at the cinema after the screening of ‘The Electronic Durian’.',translation:'最後，你會在《The Electronic Durian》放映後、於戲院舞台上的討論開始前致開場辭。',title:'Task 10：鎖定演說文體、場合與時機',task:10,typeNumber:3,decision:'只控制語氣／格式',sourceIds:['2019-B2-U0072','2019-B2-U0073','2019-B2-U0074'],annotations:[{phrase:'introductory speech',task:10},{phrase:'before the discussion',task:10},{phrase:'on the stage at the cinema',task:10},{phrase:'after the screening of ‘The Electronic Durian’',task:10}]},
    {id:'boss-task10-theme',text:'The theme for the discussion',excerpt:'The theme for the discussion is the Current State of Cinema.',translation:'討論主題是「電影業現況」。',title:'Task 10：記錄討論總主題',task:10,typeNumber:3,decision:'合併寫入',sourceIds:['2019-B2-U0075'],annotations:[{phrase:'Current State of Cinema',task:10,point:1}]},
    {id:'boss-task10-full',text:'I want to see your speech',excerpt:'I want to see your speech written out in full.',translation:'我想看到你完整寫好的講稿。',title:'Task 10：提交完整講稿',task:10,typeNumber:5,decision:'只控制語氣／格式',sourceIds:['2019-B2-U0076'],annotations:[{phrase:'speech written out in full',task:10}]},
    {id:'boss-task10-sources',text:'Start by looking at the FilmTalk Forum',excerpt:'Start by looking at the FilmTalk Forum, our WhatsApp group as well as the notes you took from the video conference I had with Mira.',translation:'請先參考 FilmTalk 論壇、我們的 WhatsApp 群組，以及你在我與 Mira 的視像會議中所作的筆記。',title:'Task 10：辨認三條來源路線',task:10,typeNumber:5,decision:'只作指路',sourceIds:['2019-B2-U0077','2019-B2-U0078','2019-B2-U0079'],annotations:[{phrase:'FilmTalk Forum',task:10,kind:'hint'},{phrase:'our WhatsApp group',task:10,kind:'hint'},{phrase:'notes you took from the video conference I had with Mira',task:10,kind:'hint'}]},
    {id:'boss-followup',text:'I’ll try and catch up',excerpt:'I’ll try and catch up with you at school next week if I have time.',translation:'如果有時間，我下星期會在學校找你談談。',title:'可能的後續聯絡不是證據',typeNumber:6,decision:'不寫入答案',sourceIds:['2019-B2-U0080'],annotations:[{phrase:'I’ll try and catch up with you at school next week if I have time',kind:'reject'}]},
    {id:'boss-signature',text:'Mr Chow',excerpt:'Mr Chow',translation:'Chow 先生',title:'電郵署名不是答案內容',typeNumber:6,decision:'不寫入答案',sourceIds:['2019-B2-U0081'],annotations:[{phrase:'Mr Chow',kind:'reject'}]}
  ];
  const contractRoutes={
    'boss-task8-sources':[
      {id:'route-task8-minutes',sourceId:'2019-B2-U0062',task:8,page:6,selector:'#page-6 .meeting-minutes',label:'委員會會議紀錄',note:'先確認場地要求、原來的選址理由和委員會分歧；此步只加 Task 8 來源標記。'},
      {id:'route-task8-site',sourceId:'2019-B2-U0063',task:8,page:7,selector:'#page-7 .site-notes',label:'Alia 的實地考察筆記',note:'先確認 Brighthouse 的實際設施與衛生紀錄；內容取證留到後面的逐句分類。'},
      {id:'route-task8-notes',sourceId:'2019-B2-U0064',task:8,page:3,selector:'#page-3 .conference-notes',label:'視像會議聆聽筆記',note:'Task 8 還需要錄音中的輪椅、工作人手和 noodles 活動資料。下一步返回 Ringo 電郵。'}
    ],
    'boss-task9-sources':[
      {id:'route-task9-interview',sourceId:'2019-B2-U0070',task:9,page:8,selector:'#page-8 .interview',label:'Isabel Luna 訪問',note:'這份訪問是 Task 9 的情節主幹來源；此步只辨認文件，不提前抽取內容點。'},
      {id:'route-task9-forum',sourceId:'2019-B2-U0071',task:9,page:5,selector:'#page-5 .forum-document',label:'FilmTalk Forum',note:'論壇可補充主題和 stand-out scene 的觀眾反應。下一步返回 Ringo 電郵。'}
    ],
    'boss-task10-sources':[
      {id:'route-task10-forum',sourceId:'2019-B2-U0077',task:10,page:5,selector:'#page-5 .forum-document',label:'FilmTalk Forum',note:'Task 10 以論壇中的相反看法建立討論，而不是把留言當成確定事實。'},
      {id:'route-task10-chat',sourceId:'2019-B2-U0078',task:10,page:10,selector:'#page-10 .group-chat',label:'Committee WhatsApp 群組',note:'群組對話補充低成本電影的創新自由與觀眾反應；此步只加 Task 10 標記。'},
      {id:'route-task10-notes',sourceId:'2019-B2-U0079',task:10,page:3,selector:'#page-3 .conference-notes',label:'視像會議聆聽筆記',note:'錄音筆記補充 home viewing、blockbusters 與 low-budget films。下一步返回 Ringo 電郵。'}
    ]
  };
  const contractSteps=[];
  for(const boss of contractBossSteps){contractSteps.push({...boss,kind:'boss',page:4});for(const route of contractRoutes[boss.id]||[])contractSteps.push({...route,kind:'route',originId:boss.id,excerpt:boss.excerpt,translation:boss.translation,typeNumber:5,decision:'只作指路'});}
  const contractStepById=new Map(contractSteps.map((step,index)=>[step.id,{step,index}]));
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
    <nav class="gm-tabs" role="tablist" aria-label="Super Curation 五個階段">
      <button class="gm-tab" role="tab" data-tab="contracts" aria-controls="gm-contracts"><span class="gm-stage-dot">1</span><span class="gm-stage-label">任務指示</span><small class="gm-stage-count"></small></button>
      <button class="gm-tab" role="tab" data-tab="categorize" aria-controls="gm-categorize"><span class="gm-stage-dot">2</span><span class="gm-stage-label">資料分類</span><small class="gm-stage-count"></small></button>
      <button class="gm-tab" role="tab" data-tab="listen" aria-controls="gm-listen"><span class="gm-stage-dot">3</span><span class="gm-stage-label">聆聽錄音</span><small class="gm-stage-count"></small></button>
      <button class="gm-tab" role="tab" data-tab="evidence" aria-controls="gm-evidence"><span class="gm-stage-dot">4</span><span class="gm-stage-label">逐句取證</span><small class="gm-stage-count"></small></button>
      <button class="gm-tab" role="tab" data-tab="writing" aria-controls="gm-writing"><span class="gm-stage-dot">5</span><span class="gm-stage-label">三篇寫作</span><small class="gm-stage-count"></small></button>
    </nav>
    <aside class="gm-dock" aria-label="Super Curation 指導卡">
      <div class="gm-dock-top"><span>SUPER CURATION · 2019 B2</span><button type="button" id="gm-close-curation" aria-label="離開 Curation">×</button></div>
      <div class="gm-controller" aria-label="Super Curation controller">
        <div class="gm-controller-nav"><button class="gm-btn" id="gm-prev-step">← 上一步</button><button class="gm-btn" id="gm-help" aria-haspopup="dialog" aria-controls="gm-help-dialog">需要更多協助</button><button class="gm-btn primary" id="gm-next-step">下一步 →</button></div>
        <div class="gm-controller-state"><strong id="gm-step-status">Chapter 1</strong><button class="gm-btn" id="gm-spotlight-toggle" aria-pressed="false">Spotlight：關</button><button class="gm-icon-btn" id="gm-bookmark" aria-pressed="false" aria-label="將目前位置加入書籤">☆</button><label>書籤 <select id="gm-bookmark-jump" aria-label="跳至書籤"><option value="">選擇書籤</option></select></label></div>
      </div>
      <div class="gm-dock-body">
        <section class="gm-panel" id="gm-contracts" role="tabpanel" data-panel="contracts"></section>
        <section class="gm-panel" id="gm-categorize" role="tabpanel" data-panel="categorize" hidden></section>
        <section class="gm-panel" id="gm-listen" role="tabpanel" data-panel="listen" hidden></section>
        <section class="gm-panel" id="gm-evidence" role="tabpanel" data-panel="evidence" hidden></section>
        <section class="gm-panel" id="gm-writing" role="tabpanel" data-panel="writing" hidden></section>
      </div>
      <details class="gm-save"><summary>遊戲存檔 · 自動儲存 / 匯出 / 匯入</summary><div class="gm-save-grid"><label>遊戲存檔 <select id="gm-slot" aria-label="選擇存檔格">${[1,2,3,4,5].map(index=>`<option value="${index}">Slot ${index}</option>`).join('')}</select></label><button class="gm-btn" id="gm-save-now">儲存</button><button class="gm-btn" id="gm-export">匯出存檔</button><label class="gm-btn gm-import">匯入存檔<input id="gm-import" type="file" accept="application/json,.json"></label></div><small id="gm-save-status" role="status"></small></details>
    </aside>
    <aside class="gm-evidence-rail" aria-label="三項寫作證據庫"><h2>三項寫作證據庫</h2><p>紅線＝範文已使用；Type 6 紅線才表示不採用。</p><div id="gm-rail-groups"></div></aside>
    <button class="gm-return-route" id="gm-return-route" hidden>↩ 返回 Super Curation</button>
    <div class="gm-spotlight" aria-hidden="true" hidden><i data-mask="top"></i><i data-mask="right"></i><i data-mask="bottom"></i><i data-mask="left"></i></div>
    <aside class="gm-floating-window gm-transcript-window" id="gm-transcript-window" hidden aria-label="浮動錄音稿"><div class="gm-window-head"><strong>完整錄音稿 · 107 cues</strong><button class="gm-window-toggle" data-toggle-translation aria-pressed="false">中文對照</button><span>拖曳移動 · 四角調整大小</span><button class="gm-window-close" data-close-window="transcript" aria-label="關閉浮動錄音稿">×</button></div><div class="gm-window-body"></div><span class="gm-resize-handle nw" data-resize="nw"></span><span class="gm-resize-handle ne" data-resize="ne"></span><span class="gm-resize-handle sw" data-resize="sw"></span><span class="gm-resize-handle se" data-resize="se"></span></aside>
    <aside class="gm-floating-window gm-model-preview" id="gm-model-preview" hidden aria-label="範文來源預覽"><div class="gm-window-head"><strong>Model → original source</strong><span>拖曳移動 · 四角調整大小</span><button class="gm-window-close" data-close-window="preview" aria-label="關閉來源預覽">×</button></div><div class="gm-window-body"></div><span class="gm-resize-handle nw" data-resize="nw"></span><span class="gm-resize-handle ne" data-resize="ne"></span><span class="gm-resize-handle sw" data-resize="sw"></span><span class="gm-resize-handle se" data-resize="se"></span></aside>
    <dialog id="gm-help-dialog" class="gm-help-dialog"><form method="dialog"><button class="gm-window-close" value="close" aria-label="關閉協助">×</button><p class="gm-kicker">Contextual help</p><h3>需要更多協助</h3><div id="gm-help-content"></div><label><strong>我的問題（只保留在本機存檔）</strong><textarea id="gm-question-draft" rows="5" maxlength="5000"></textarea></label><div class="gm-btn-row"><button class="gm-btn primary" value="close">保留問題並返回</button></div></form></dialog>
    <p id="gm-live" class="gm-live" aria-live="polite"></p>`;
  $('.hero').insertAdjacentElement('afterend',shell);
  const launch=document.createElement('button');launch.type='button';launch.id='gm-curation-toggle';launch.className='curation-launch';launch.textContent='✦ 離開 Curation';$('.toolbar')?.append(launch);
  document.body.classList.add('gm-curation-active');
  let curationOpen=true;
  function setCurationOpen(value){curationOpen=Boolean(value);shell.hidden=!curationOpen;document.body.classList.toggle('gm-curation-active',curationOpen);launch.textContent=curationOpen?'✦ 離開 Curation':'✦ Super Curation';launch.setAttribute('aria-pressed',String(curationOpen));if(curationOpen)requestAnimationFrame(()=>{syncNativeSource({scroll:true});trackSpotlight();});else suspendSpotlight();}
  const footer=$('body>footer');if(footer)footer.textContent='來源：2019 Paper 3.pdf、原裝 Part B 錄音、canonical fact-line analysis 及 length-controlled model set。19 頁已逐頁核對；中文只作學習輔助，英文原卷為準。';
  $('#gm-slot').value=activeSlot;

  const cueTranslations=new Map(),cueTeaching=new Map();
  for(const unit of units)if(unit.audioCue){const teaching=cueTeaching.get(unit.audioCue.index)||[];teaching.push({id:unit.id,decision:unit.decision,tasks:unit.tasks});cueTeaching.set(unit.audioCue.index,teaching);if(unit.translation){const list=cueTranslations.get(unit.audioCue.index)||[];if(!list.includes(unit.translation))list.push(unit.translation);cueTranslations.set(unit.audioCue.index,list);}}
  const transcriptSections=new Map([[0,'Instructions'],[9,'Short Video Competition'],[40,'Brighthouse Cinema'],[70,'Prize Giving Ceremony'],[81,'Cinema and home viewing'],[94,'Blockbusters and low-budget films'],[103,'Closing instructions']]);
  function bookmarkKey(){if(['categorize','evidence'].includes(state.tab))return `${state.tab}:${state.unitId}`;if(state.tab==='listen'){const audio=$('#gm-audio');return `listen:${activeCueIndex(audio?.currentTime||0)}`;}if(state.tab==='writing')return `writing:${state.writingTask}`;return `contracts:${state.contractIndex}`;}
  function bookmarkLabel(key){const [kind,value]=key.split(':');if(kind==='categorize'||kind==='evidence')return `${kind==='categorize'?'分類':'取證'} · ${value}`;if(kind==='listen')return `聆聽 · cue ${Number(value)+1}`;if(kind==='writing')return `寫作 · Task ${value}`;if(kind==='contracts')return `任務指示 · ${Number(value)+1}/${contractSteps.length}`;return '任務指示';}
  function updateBookmarks(){const select=$('#gm-bookmark-jump');if(!select)return;select.innerHTML='<option value="">選擇書籤</option>'+state.bookmarks.map(key=>`<option value="${escape(key)}">${escape(bookmarkLabel(key))}</option>`).join('');const saved=state.bookmarks.includes(bookmarkKey());$('#gm-bookmark').setAttribute('aria-pressed',String(saved));$('#gm-bookmark').textContent=saved?'★':'☆';}
  function updateController(){
    const status=$('#gm-step-status');if(!status)return;
    const chapterIndex=['contracts','categorize','listen','evidence','writing'].indexOf(state.tab)+1;let detail='';
    if(state.tab==='contracts')detail=`${state.contractIndex+1}/${contractSteps.length} · ${contractSteps[state.contractIndex]?.id||'boss email'}`;
    else if(['categorize','evidence'].includes(state.tab)){const panel=currentExplorerPanel();const item=panel?currentUnit(panel):{list:[],index:0};detail=item.unit?`${item.index+1}/${item.list.length} · ${item.unit.id}`:'empty matched state';}
    else if(state.tab==='listen')detail=`${state.heardCues.length}/${listeningData.cueCount} cues heard`;
    else if(state.tab==='writing')detail=`Task ${state.writingTask} · ${wordCount(state.drafts[state.writingTask])} words`;
    else detail='task instructions';
    status.textContent=`Chapter ${chapterIndex}/5 · ${detail}`;updateBookmarks();shell.style.setProperty('--gm-stage-progress',`${(chapterIndex-1)*20}%`);
    $$('.gm-tab').forEach((button,index)=>{const complete=state.completedTabs.includes(button.dataset.tab),active=index===chapterIndex-1;button.classList.toggle('is-complete',complete);button.dataset.stageState=complete?'完成':active?'目前':'未到';button.setAttribute('aria-label',`${button.querySelector('.gm-stage-label')?.textContent||button.textContent.trim()} · ${button.dataset.stageState}`);const dot=$('.gm-stage-dot',button),count=$('.gm-stage-count',button);if(dot)dot.textContent=complete?'✓':String(index+1);if(count)count.textContent=complete?'完成':active?(state.tab==='contracts'?`${state.contractIndex+1}/${contractSteps.length}`:state.tab==='categorize'||state.tab==='evidence'?detail.split(' · ')[0]:state.tab==='listen'?`${state.heardCues.length}/${listeningData.cueCount}`:state.tab==='writing'?`Task ${state.writingTask}`:''):'';});
    const next=$('#gm-next-step');if(next&&state.tab==='contracts')next.textContent=state.contractIndex===contractSteps.length-1?'完成 Stage 1 →':'下一步 →';else if(next)next.textContent='下一步 →';
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
  function mountNativeNoteSheet(){if(!nativeNoteSheet)return;prepareNativeNoteSheet();restoreNativeNoteSheet();nativeNoteSheet.hidden=false;const host=$('#gm-native-note-host');if(host)host.innerHTML='<p class="gm-native-host-note">筆記直接寫在中央原卷第 3 頁；此處不再複製 worksheet。</p>';}

  function contractBossNode(step){
    if(!step||step.kind==='route')return null;
    if(step.selector)return $(step.selector);
    return $$('#page-4 .email-content p[lang="en"]').find(node=>node.textContent.includes(step.text));
  }
  function contractNativeTarget(step){
    if(!step)return $('#page-4 .email-document');
    if(step.kind==='route')return $(step.selector)||$(`#page-${step.page} .native-document`)||$(`#page-${step.page}`);
    return $(`.gm-contract-mark[data-contract-step="${step.id}"]`)||contractBossNode(step)||$('#page-4 .email-document');
  }
  function wrapContractPhrase(root,annotation,step){
    if(!root||!annotation?.phrase||$(`[data-contract-mark="${step.id}:${annotation.phrase}"]`,root))return;
    const phrase=annotation.phrase,haystack=root.textContent.toLocaleLowerCase(),start=haystack.indexOf(phrase.toLocaleLowerCase());if(start<0)return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:node=>node.parentElement?.closest('.translation')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});
    const nodes=[];let node,offset=0;while((node=walker.nextNode())){nodes.push({node,start:offset,end:offset+node.length});offset+=node.length;}
    const first=nodes.find(item=>item.end>start),last=nodes.find(item=>item.end>=start+phrase.length);if(!first||!last)return;
    const range=document.createRange();range.setStart(first.node,start-first.start);range.setEnd(last.node,start+phrase.length-last.start);
    const mark=document.createElement('mark');const task=annotation.task||step.task||0;mark.className=`gm-contract-mark ${task?`gm-source-mark-t${task}`:''} ${annotation.kind==='hint'?'is-hint':''} ${annotation.kind==='context'?'is-context':''} ${annotation.kind==='reject'?'is-rejected':''} ${annotation.point?'has-point':''}`;mark.dataset.contractMark=`${step.id}:${annotation.phrase}`;mark.dataset.contractStep=step.id;if(task)mark.dataset.contractTask=String(task);if(annotation.point)mark.dataset.point=String(annotation.point);if(step.sourceIds?.[0])mark.dataset.sourceId=step.sourceIds[0];
    try{mark.append(range.extractContents());range.insertNode(mark);}catch{}
  }
  function prepareContractSource(){
    for(const step of contractBossSteps){const node=contractBossNode(step);if(!node)continue;node.classList.add('gm-contract-paragraph');if(!node.dataset.contractLine)node.dataset.contractLine=step.id;if(step.task&&!node.dataset.contractTaskLabel)node.dataset.contractTaskLabel=`Task ${step.task}`;for(const annotation of step.annotations||[])wrapContractPhrase(node,annotation,step);}
    for(const step of contractSteps.filter(item=>item.kind==='route')){const target=contractNativeTarget(step);if(!target)continue;target.classList.add('gm-contract-route-target');let badges=$(':scope > .gm-contract-route-badges',target);if(!badges){badges=document.createElement('span');badges.className='gm-contract-route-badges';target.prepend(badges);}if(!$(`[data-contract-route-badge="${step.id}"]`,badges)){const badge=document.createElement('span');badge.className=`gm-contract-route-badge task${step.task}`;badge.dataset.contractRouteBadge=step.id;badge.textContent=`Task ${step.task}`;badges.append(badge);}}
  }
  function updateContractNativeMarks(){
    prepareContractSource();const current=state.contractIndex;
    $$('.gm-contract-mark').forEach(mark=>{const item=contractStepById.get(mark.dataset.contractStep);mark.classList.toggle('is-revealed',Boolean(item&&item.index<=current));mark.classList.toggle('is-current',Boolean(item&&item.index===current));});
    const currentBoss=contractSteps[current]?.kind==='boss'?contractBossNode(contractSteps[current]):null;
    $$('.gm-contract-paragraph').forEach(node=>{const item=contractStepById.get(node.dataset.contractLine);node.classList.toggle('is-contract-revealed',Boolean(item&&item.index<=current));node.classList.toggle('is-contract-current',node===currentBoss);});
    $$('.gm-contract-route-badge').forEach(badge=>{const item=contractStepById.get(badge.dataset.contractRouteBadge);badge.classList.toggle('is-revealed',Boolean(item&&item.index<=current));badge.classList.toggle('is-current',Boolean(item&&item.index===current));});
  }
  function contractRecordsHtml(step){
    const records=(step.sourceIds||[]).map(id=>unitById.get(id)).filter(Boolean);if(!records.length)return `<div class="gm-contract-analysis"><strong>分析</strong><p>${escape(step.analysis||'這項資料只控制閱讀情境，不會直接成為答案內容。')}</p></div>`;
    return `<div class="gm-contract-analysis"><strong>Line-by-line record</strong>${records.map(unit=>`<article><span>Type ${unit.typeNumber} · ${escape(unit.decision)}</span><p>${escape(unit.prompts.says)}</p></article>`).join('')}</div>`;
  }
  function renderContracts(){
    state.contractIndex=Math.max(0,Math.min(contractSteps.length-1,state.contractIndex));const step=contractSteps[state.contractIndex],progress=Math.round((state.contractIndex+1)/contractSteps.length*100),taskLabel=step.task?`Task ${step.task}`:'Route / context';updateContractNativeMarks();
    const body=step.kind==='route'?`<div class="gm-contract-route-note"><strong>到原卷第 ${step.page} 頁辨認來源</strong><p>${escape(step.note)}</p><small>這一站不抽取 evidence；按「下一步」會自動回到 Ringo 電郵的下一句。</small></div>`:contractRecordsHtml(step);
    $('#gm-contracts').innerHTML=`<div class="gm-card gm-contract-card" data-contract-kind="${step.kind}" data-contract-id="${step.id}"><div class="gm-contract-progress"><strong>${state.contractIndex+1} / ${contractSteps.length}</strong><span><i style="width:${progress}%"></i></span><small>${progress}%</small></div><p class="gm-kicker">Chapter 1 · ${step.kind==='route'?'source route':'Ringo boss email'} · ${taskLabel}</p><div class="gm-contract-tags"><span class="${step.task?`task${step.task}`:''}">${taskLabel}</span><span>Type ${step.typeNumber}</span><span>${escape(step.decision)}</span></div><h3>${escape(step.kind==='route'?`${taskLabel}：前往${step.label}`:step.title)}</h3><blockquote class="gm-contract-excerpt">${escape(step.excerpt)}</blockquote><p class="gm-translation" lang="zh-Hant">${escape(step.translation||'')}</p>${body}<p class="gm-contract-rule">${step.kind==='route'?'Source route：只加任務標記，內容點留待逐句分類。':'按原文順序讀取：先辨認文體、讀者、指定內容與來源提示，再決定 Type 和 answer decision。'}</p></div>`;
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
    const local=$('.gm-bank-list',root);if(local)local.innerHTML=items.length?items.map(({task,unit})=>`<div class="gm-bank-item ${state.modelUses[task].includes(unit.id)?'is-consumed':''}" data-task="${task}" data-bank-unit="${unit.id}"><button aria-label="Remove ${unit.id} from Task ${task}" data-remove-bank="${task}:${unit.id}">×</button><strong>Task ${task} · ${unit.id}</strong><br><span>${escape(unit.excerpt)}</span></div>`).join(''):'<p class="gm-empty">尚未加入證據。只有「獨立寫入／合併寫入／只保留結論」可加入。</p>';
    renderEvidenceRail();
  }
  function renderEvidenceRail(){
    const host=$('#gm-rail-groups');if(!host)return;
    host.innerHTML=[8,9,10].map(task=>{const ids=state.bank[task],used=new Set(state.modelUses[task]);return `<details class="gm-rail-task task${task}" ${task===Number(state.writingTask)||state.tab==='evidence'?'open':''}><summary><span>Task ${task}</span><strong>${ids.length} 句</strong></summary><div>${ids.length?ids.map(id=>{const unit=unitById.get(id);if(!unit)return '';return `<article class="gm-rail-item ${used.has(id)?'is-consumed':''}"><button type="button" data-open-unit="${id}"><strong>${id}</strong><span>${escape(unit.excerpt)}</span></button><button type="button" class="gm-rail-remove" aria-label="Remove ${id} from Task ${task}" data-remove-bank="${task}:${id}">×</button></article>`;}).join(''):'<p class="gm-empty">尚未加入證據</p>'}</div></details>`;}).join('');
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
    renderBank(panel);refreshNativeMarks();updateController();syncNativeSource({scroll:true});requestAnimationFrame(()=>{drawCurrentRoute(panel);trackSpotlight();});
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
    renderEvidenceRail();updateController();syncNativeSource({scroll:false});
  }

  function renderAll(){renderContracts();renderCategorize();renderListening();renderEvidence();renderWriting();renderEvidenceRail();$('#gm-slot').value=activeSlot;$('#gm-question-draft').value=state.questionDraft;setTab(state.tab,false);addPageBadges();updateController();}
  function setTab(tab,focus=true){
    if(!['contracts','categorize','listen','evidence','writing'].includes(tab))tab='contracts';state.tab=tab;save();
    $$('.gm-tab').forEach(button=>{const selected=button.dataset.tab===tab;button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1;});
    $$('.gm-panel').forEach(panel=>panel.hidden=panel.dataset.panel!==tab);
    if(tab!=='listen'){if(noteTyping)cancelNoteTyping();restoreNativeNoteSheet();$('#gm-transcript-window').hidden=true;$('#gm-audio')?.pause();}else{mountNativeNoteSheet();if(state.transcriptOpen)openTranscriptWindow();}
    if(!['writing','evidence'].includes(tab))closeModelPreview();
    if(!['categorize','evidence'].includes(tab))routeGhostUnit=null;const activePanel=$(`.gm-panel[data-panel="${tab}"]`);animateArrival(activePanel);if(focus)$(`.gm-tab[data-tab="${tab}"]`).focus();announce(`Opened chapter ${tab}`);updateController();renderEvidenceRail();syncNativeSource({scroll:true});requestAnimationFrame(()=>{syncNativeSource({scroll:true});trackSpotlight();});
  }
  function setWritingTask(task){state.writingTask=Number(task);save();renderWriting();requestAnimationFrame(()=>syncNativeSource({scroll:true}));announce(`Task ${task} writing workspace`);}
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
  function returnToCuration(){const route=state.returnRoute;if(!route)return;state.returnRoute=null;if(route.unitId&&unitById.has(route.unitId))state.unitId=route.unitId;if([8,9,10].includes(Number(route.writingTask)))state.writingTask=Number(route.writingTask);routeGhostUnit=route.sourceRoute?route.unitId:null;setTab(route.tab||'contracts',false);if(state.tab==='writing')renderWriting();else if(state.tab==='categorize')renderCategorize();else if(state.tab==='evidence')renderEvidence();save();requestAnimationFrame(()=>syncNativeSource({scroll:true}));updateController();announce(route.sourceRoute?'Returned to the exact route origin; route remains as a 0.16 ghost.':'Returned to the exact Super Curation context.');}
  function addPageBadges(){
    for(let page=1;page<=19;page+=1){const header=$(`#page-${page}>header`);if(!header||$('.gm-page-badges',header))continue;const pageUnits=units.filter(unit=>unit.page===page);const taskSet=new Set(pageUnits.flatMap(unit=>unit.tasks));const wrap=document.createElement('span');wrap.className='gm-page-badges';wrap.innerHTML=`<span class="gm-page-badge">${pageUnits.length} units</span>${[8,9,10].filter(task=>taskSet.has(task)).map(task=>`<span class="gm-page-badge t${task}">T${task}</span>`).join('')}`;header.append(wrap);}
  }
  function refreshNativeMarks(){
    $$('mark[data-unit]:not(.gm-contract-mark)').forEach(mark=>mark.classList.toggle('is-revealed',state.categoryRevealed.includes(mark.dataset.unit)||state.reviewed.includes(mark.dataset.unit)));
  }
  function markNativePhrases(){
    let marked=0;
    for(const unit of units.filter(item=>item.page<=19&&item.page!==4&&item.typeNumber>=1&&item.typeNumber<=6)){
      const phrase=unit.excerpt.replace(/[\[\]*]/g,'').replace(/^“|”$/g,'').trim();if(phrase.length<8||phrase.includes('...'))continue;
      const candidates=$$(`#page-${unit.page} [lang="en"]`).filter(node=>!node.closest('.translation'));
      for(const candidate of candidates){
        const text=candidate.textContent;const start=text.toLocaleLowerCase().indexOf(phrase.toLocaleLowerCase());if(start<0)continue;
        const taskLabel=unit.tasks.length?unit.tasks.map(task=>`T${task}`).join(' · '):'route';candidate.classList.add('gm-source-paragraph');candidate.dataset.gmTasks=[...new Set([...(candidate.dataset.gmTasks||'').split(' · ').filter(Boolean),...taskLabel.split(' · ')])].join(' · ');candidate.setAttribute('aria-label',`${candidate.dataset.gmTasks} source paragraph: ${text.trim()}`);
        const walker=document.createTreeWalker(candidate,NodeFilter.SHOW_TEXT);const nodes=[];let node,offset=0;
        while((node=walker.nextNode())){nodes.push({node,start:offset,end:offset+node.length});offset+=node.length;}
        const first=nodes.find(item=>item.end>start);const last=nodes.find(item=>item.end>=start+phrase.length);if(!first||!last)continue;
        const range=document.createRange();range.setStart(first.node,start-first.start);range.setEnd(last.node,start+phrase.length-last.start);
        if($$('.gm-source-mark',candidate).some(existing=>range.intersectsNode(existing))){range.detach();continue;}
        const mark=document.createElement('mark');mark.className=`gm-source-mark gm-source-mark-t${unit.tasks[0]||0} gm-source-mark-type${unit.typeNumber} ${unit.decision==='不寫入答案'?'gm-source-mark-rejected':''}`;mark.dataset.unit=unit.id;mark.title=`${unit.id} · ${unit.decision}`;mark.classList.toggle('is-revealed',state.categoryRevealed.includes(unit.id)||state.reviewed.includes(unit.id));
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
    if(state.tab==='contracts'){if(state.contractIndex<contractSteps.length-1){state.contractIndex+=1;save();renderContracts();updateController();syncNativeSource({scroll:true});trackSpotlight();announce(`Stage 1 unit ${state.contractIndex+1} of ${contractSteps.length}.`);return;}completeTab('contracts');setTab('categorize');return;}
    if(['categorize','evidence'].includes(state.tab)){const panel=currentExplorerPanel(),{list,index}=currentUnit(panel);if(index<list.length-1){goUnit('next');return;}completeTab(state.tab);setTab(state.tab==='categorize'?'listen':'writing');return;}
    if(state.tab==='listen'){const next=listeningData.cues.find(cue=>!state.heardCues.includes(cue.index));if(next){playCue(next.index);return;}completeTab('listen');setTab('evidence');return;}
    if(state.tab==='writing'){if(state.writingTask<10){setWritingTask(state.writingTask===8?9:10);return;}completeTab('writing');announce('三項寫作 workspace 已到最後一項。');}
  }
  function controllerPrev(){
    if(state.tab==='contracts'){if(state.contractIndex>0){state.contractIndex-=1;save();renderContracts();updateController();syncNativeSource({scroll:true});trackSpotlight();announce(`Stage 1 unit ${state.contractIndex+1} of ${contractSteps.length}.`);}return;}
    if(['categorize','evidence'].includes(state.tab)){const panel=currentExplorerPanel(),{index}=currentUnit(panel);if(index>0){goUnit('prev');return;}setTab(state.tab==='categorize'?'contracts':'listen');return;}
    if(state.tab==='listen'){const audio=$('#gm-audio');let index=activeCueIndex(audio?.currentTime||0);if(index>0){audio.currentTime=listeningData.cues[index-1].start;updateAudioState(audio);return;}setTab('categorize');return;}
    if(state.tab==='writing'){if(state.writingTask>8){setWritingTask(state.writingTask===10?9:8);return;}setTab('evidence');}
  }
  function navigateBookmark(key){if(!key)return;const [kind,value]=key.split(':');if(kind==='categorize'||kind==='evidence'){if(unitById.has(value))state.unitId=value;state.decision='all';state.task='all';setTab(kind);kind==='categorize'?renderCategorize():renderEvidence();}
    else if(kind==='listen'){setTab('listen');const audio=$('#gm-audio'),cue=listeningData.cues[Number(value)];if(cue){audio.currentTime=cue.start;updateAudioState(audio);}}
    else if(kind==='writing'){setWritingTask(Number(value));setTab('writing');}else if(kind==='contracts'){state.contractIndex=Math.max(0,Math.min(contractSteps.length-1,Number(value)||0));renderContracts();setTab('contracts');}else setTab('contracts');save();}
  function openHelp(){const help={contracts:'依 Ringo 電郵的原文順序閱讀 27 個單位：19 個 boss-email 單位加八次即時來源探訪。顏色只標示任務或來源；圈號才是指定內容點；Type 6 紅線表示不寫入答案。',categorize:'先自行選 Task 8/9/10 或 route/noise，再揭示 canonical Type 1–6 和七種 answer decision。',listen:'按 cue 播放會在句末自動停止；只有完整聽完才會開啟 evidence gate。前跳不算已聽，倒帶會撤回之後狀態。',evidence:'只有「獨立寫入／合併寫入／只保留結論」可進 evidence bank；每項保留 stable source ID。',writing:'先寫至少 20 words 才解鎖 model；選 model 句子會顯示 exact source IDs 和可拖曳原文 preview。'};$('#gm-help-content').innerHTML=`<p>${help[state.tab]}</p><p><strong>目前位置：</strong> ${escape($('#gm-step-status').textContent)}</p>`;$('#gm-question-draft').value=state.questionDraft;const dialog=$('#gm-help-dialog');if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');}
  function switchSlot(next){save();activeSlot=String(next);state=sanitizeState(slots[activeSlot]);renderAll();$('#gm-save-status').textContent=`Slot ${activeSlot} · 已切換並自動儲存`;announce(`Switched to save slot ${activeSlot}.`);}
  function exportSlot(){save();const payload={format:'edmund-paper3-curation-save',version:VERSION,year:2019,level:'B2',slot:activeSlot,createdAt:new Date().toISOString(),state:sanitizeState(state)};const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));const anchor=document.createElement('a');anchor.href=url;anchor.download=`paper3-2019-b2-curation-slot-${activeSlot}.json`;anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  async function importSlot(file){try{if(!file||file.size>1024*1024)throw Error('存檔缺失或超過 1 MB');const payload=JSON.parse(await file.text());if(payload?.format!=='edmund-paper3-curation-save'||payload.version!==VERSION||payload.year!==2019||String(payload.level).toUpperCase()!=='B2'||!payload.state||typeof payload.state!=='object')throw Error('這不是 2019 B2 v4 的有效存檔');state=sanitizeState(payload.state);save();renderAll();$('#gm-save-status').textContent=`已驗證並匯入至 Slot ${activeSlot}`;}catch(error){$('#gm-save-status').textContent=`匯入失敗：${error.message}`;}}

  launch.addEventListener('click',()=>setCurationOpen(!curationOpen));$('#gm-close-curation').addEventListener('click',()=>setCurationOpen(false));
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
  syncNativeSource({scroll:true});renderEvidenceRail();
  window.EDMUND_2019_B2_CURATION_DIAGNOSTICS=Object.freeze({version:VERSION,contractStepCount:contractSteps.length,contractBossCount:contractBossSteps.length,contractRouteCount:contractSteps.filter(step=>step.kind==='route').length,unitCount:units.length,decisionCount:DECISIONS.length,cueCount:listeningData.cueCount,audioOwnerCount:$$('#gm-audio').length,nativeMarks,nativeTaskParagraphs:$$('.gm-source-paragraph,.gm-contract-paragraph').length,saveSlotCount:5,missingModelSources,getState:()=>JSON.parse(JSON.stringify(state)),getEnvelope:()=>JSON.parse(JSON.stringify({version:VERSION,activeSlot,slots}))});
})();
