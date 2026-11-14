(()=>{
  'use strict';
  const sourceData=window.EDMUND_2019_B2_SOURCE_UNITS;
  const listeningData=window.EDMUND_2019_B2_LISTENING;
  const modelData=window.EDMUND_2019_B2_MODELS;
  const modelGuides=window.EDMUND_2019_B2_MODEL_GUIDES;
  if(!sourceData||!listeningData||!modelData||!modelGuides||!document.querySelector('#reader')||document.querySelector('#super-curation'))return;

  const VERSION='2019-b2-super-curation-v8';
  const STORAGE='edmund-paper3-2019-b2-curation-v8';
  const LEGACY_STORAGE_V7='edmund-paper3-2019-b2-curation-v7';
  const LEGACY_STORAGE_V6='edmund-paper3-2019-b2-curation-v6';
  const LEGACY_STORAGE_V5='edmund-paper3-2019-b2-curation-v5';
  const LEGACY_STORAGE_V4='edmund-paper3-2019-b2-curation-v4';
  const LEGACY_STORAGE_V3='edmund-paper3-2019-b2-curation-v3';
  const LEGACY_STORAGE_V2='edmund-paper3-2019-b2-curation-v2';
  const LEGACY_STORAGE='edmund-paper3-2019-b2-curation-v1';
  const DECISIONS=['獨立寫入','合併寫入','只保留結論','只控制語氣／格式','只用來判斷證據狀態','只作指路','不寫入答案'];
  const BANKABLE=new Set(['獨立寫入','合併寫入','只保留結論']);
  const units=sourceData.units;
  const unitById=new Map(units.map(unit=>[unit.id,unit]));
  // The canonical analysis keeps stable unit IDs, but six source-page fields
  // point to a quoted cross-reference instead of the unit's physical Data File
  // location. Stage 4 corrects only that routing metadata.
  const EVIDENCE_PAGE_OVERRIDES=new Map([
    ['2019-B2-U0152',6],
    ['2019-B2-U0275',10],
    ['2019-B2-U0278',10],
    ['2019-B2-U0290',10],
    ['2019-B2-U0291',10],
    ['2019-B2-U0292',10]
  ]);
  const sourcePage=unit=>EVIDENCE_PAGE_OVERRIDES.get(unit?.id)||unit?.page;
  const evidenceUnits=units.filter(unit=>sourcePage(unit)>=4&&sourcePage(unit)<=11).sort((a,b)=>sourcePage(a)-sourcePage(b)||a.ordinal-b.ordinal);
  const evidenceIds=new Set(evidenceUnits.map(unit=>unit.id));
  const evidenceIndexById=new Map(evidenceUnits.map((unit,index)=>[unit.id,index]));
  const evidenceBankableIds=new Set(evidenceUnits.filter(unit=>BANKABLE.has(unit.decision)&&unit.tasks.some(task=>[8,9,10].includes(task))).map(unit=>unit.id));
  const normalizeEvidence=value=>String(value||'').replace(/[’‘]/g,"'").replace(/\s+/g,' ').trim().toLocaleLowerCase();
  const EVIDENCE_ROUTES=new Map([
    ['2019-B2-U0062',{page:6,task:8,label:'委員會會議紀錄',selector:'#page-6 .meeting-minutes'}],
    ['2019-B2-U0063',{page:7,task:8,label:'Alia 的實地考察筆記',selector:'#page-7 .site-notes'}],
    ['2019-B2-U0064',{page:3,task:8,label:'視像會議聆聽筆記',selector:'#page-3 .conference-notes'}],
    ['2019-B2-U0070',{page:8,task:9,label:'Isabel Luna 訪問',selector:'#page-8 .interview'}],
    ['2019-B2-U0071',{page:5,task:9,label:'FilmTalk Forum',selector:'#page-5 .forum-document'}],
    ['2019-B2-U0077',{page:5,task:10,label:'FilmTalk Forum',selector:'#page-5 .forum-document'}],
    ['2019-B2-U0078',{page:10,task:10,label:'Committee WhatsApp 群組',selector:'#page-10 .group-chat'}],
    ['2019-B2-U0079',{page:3,task:10,label:'視像會議聆聽筆記',selector:'#page-3 .conference-notes'}],
    ['2019-B2-U0182',{page:7,task:8,label:'舞台平面圖',selector:'#page-7 .stage-plan'}]
  ]);
  const EVIDENCE_AUTHORED_TARGETS=new Map([
    ['2019-B2-U0264','#page-9 .regulations-window'],
    ['2019-B2-U0275','#page-10 .chat-heading'],
    ['2019-B2-U0290','#page-10 .chat-original-art'],
    ['2019-B2-U0291','#page-10 .chat-bubble:last-child p[lang="en"]'],
    ['2019-B2-U0292','#page-10 .chat-bubble:last-child p[lang="en"]'],
    ['2019-B2-U0303','#page-11 .chat-bubble.outgoing p[lang="en"]']
  ]);
  const contentPointMaps={8:new Map(),9:new Map(),10:new Map()};
  for(const task of [8,9,10])units.filter(unit=>unit.tasks.includes(task)&&[1,2,3].includes(unit.typeNumber)&&BANKABLE.has(unit.decision)).forEach((unit,index)=>contentPointMaps[task].set(unit.id,index+1));
  const NOTE_IDS=new Set(['poster','deadline','brighthouse','prize','cinema-home','film-budget']);
  const LISTEN_GUIDE_TARGETS=[28,34,69,80,93,101,102];
  const LISTEN_GUIDE_COUNT=LISTEN_GUIDE_TARGETS.length;
  const LISTEN_STEP_COUNT=LISTEN_GUIDE_COUNT+listeningData.cueCount;
  const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $=(selector,root=document)=>root.querySelector(selector);
  const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
  const escape=value=>String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const wordCount=value=>(String(value||'').trim().match(/[A-Za-z]+(?:[’'-][A-Za-z]+)*/g)||[]).length;
  const formatTime=seconds=>`${Math.floor(seconds/60)}:${String(Math.floor(seconds%60)).padStart(2,'0')}`;
  const categoryPageDefinitions=[
    {page:5,title:'FilmTalk Forum 完整討論',initial:'Boss letter 先指向 FilmTalk Forum，為 Task 9 尋找電影主題與觀眾反應；先標 Task 9。',revision:'前半段的主題與 metal-noodles 觀眾反應支援 Task 9；後半段的 Netflix 與共同觀影爭論則支援 Task 10。',tasks:[9,10],initialTasks:[9]},
    {page:6,title:'委員會會議紀錄',initial:'Boss letter 指向會議紀錄處理 Brighthouse 場地報告，先標 Task 8。',revision:'台口尺寸、輪椅上台需要、預算取向和場地疑慮都要和 site visit、政府規例及錄音核對；這頁只支援 Task 8。',tasks:[8],initialTasks:[8]},
    {page:7,title:'Brighthouse 實地考察筆記',initial:'Boss letter 指向 Alia 的 site visit notes，先標 Task 8。',revision:'把舞台、無障礙、出口、外來食物、清潔及人手逐項和場地要求、政府規例及錄音核對；裝潢和氣味不會自動成為反對理由。',tasks:[8],initialTasks:[8]},
    {page:8,title:'Isabel Luna 完整訪問（上）',initial:'Boss letter 指向 Isabel Luna 訪問，為 Task 9 尋找 theme、plot 和 stand-out scene；先標 Task 9。',revision:'保留 corporation 控制視野、Sammi 摘下 lenses 後看見真實世界和 metal-noodles 轉折；演員戴 contact lenses 的拍攝困難不是 plot。',tasks:[9],initialTasks:[9]},
    {page:9,title:'訪問（下）與戲院規例',initial:'這頁有兩種文件：低成本電影訪問指向 Task 10；戲院規例指向 Task 8。先同時標兩項。',revision:'訪問提供低成本導演與大片公司的相互需要；規例用來核對清潔、升降機及出口。Category III 規例不適用於已列為 IIA 的電影。',tasks:[10,8],initialTasks:[8,10]},
    {page:10,title:'Committee WhatsApp（上）',initial:'Boss letter 把 WhatsApp group 指向 Task 10，先標 Task 10。',revision:'低成本電影與 VR 的討論支援 Task 10；metal-noodles scene 的觀眾反應亦可補 Task 9，所以讀後追加 Task 9。',tasks:[10,9],initialTasks:[10]},
    {page:11,title:'Committee WhatsApp（下）',initial:'這是 WhatsApp 討論的續頁，仍先標 Task 10。',revision:'cheap technology、獨立創作自由與 blockbusters 避險的對比支援 Task 10；Nico 的 speech 提示確認用途。',tasks:[10],initialTasks:[10]},
    {page:3,title:'聆聽筆記表',initial:'先看筆記表欄目。Brighthouse Cinema 指向 Task 8；Introductory Speech 兩欄指向 Task 10；Short Video Competition 和 Prize Giving Ceremony 是這三篇作文的干擾。',revision:'錄音核對後，把場地需要寫進 Task 8，把觀影習慣和低成本電影論點寫進 Task 10。Task 9 不使用聆聽筆記。',tasks:[8,10],initialTasks:[]}
  ];
  const categoryNoteDefinitions=[
    {id:'short-video',selector:'#page-3 .notes-form-body h3:nth-of-type(1)',title:'短片比賽欄目',kind:'noise',help:'這欄要按錄音完成筆記，但不提供 Task 8、9 或 10 的作文內容。'},
    {id:'poster',selector:'#page-3 .notes-form-body label:nth-of-type(1)',title:'海報欄',kind:'noise',help:'海報 URL 和 QR code 要記在聆聽筆記；三篇 B2 作文不取證。'},
    {id:'deadline',selector:'#page-3 .notes-form-body label:nth-of-type(2)',title:'截止日期欄',kind:'noise',help:'延期日期屬短片比賽筆記；三篇 B2 作文不採用。'},
    {id:'brighthouse',selector:'#page-3 .notes-form-body h3:nth-of-type(2)',title:'Brighthouse Cinema 欄目',kind:'task',task:8,help:'輪椅上台、人手和外來食物要求支援 Task 8；聽到確認後才逐項寫下。'},
    {id:'prize',selector:'#page-3 .notes-form-body h3:nth-of-type(3)',title:'頒獎禮欄目',kind:'noise',help:'頒獎禮場地、日期和時間要完成筆記，但不屬三篇 B2 作文。'},
    {id:'speech',selector:'#page-3 .notes-form-body h3:nth-of-type(4)',title:'電影業現況引言演說欄目',kind:'task',task:10,help:'這個總欄目指向 Task 10；下兩欄分別整理兩組對比。'},
    {id:'cinema-home',selector:'#page-3 .notes-form-body label:nth-of-type(3)',title:'戲院與家中觀影欄',kind:'task',task:10,help:'home VR 與戲院共同體驗的比較支援 Task 10。'},
    {id:'film-budget',selector:'#page-3 .notes-form-body label:nth-of-type(4)',title:'大片與低成本電影欄',kind:'task',task:10,help:'資源、利潤、宣傳競爭與新導演來源的對比支援 Task 10。'}
  ];
  const categorySteps=[
    ...categoryPageDefinitions.map(entry=>({id:`category-page-${entry.page}`,kind:'page',page:entry.page,title:entry.title,entry,target:$(`#page-${entry.page} .recreated-page>h2:first-of-type`)})),
    ...categoryNoteDefinitions.map(entry=>({id:`category-note-${entry.id}`,kind:'note',page:3,title:`聆聽筆記表 · ${entry.title}`,entry,target:$(entry.selector)}))
  ].map((step,index)=>({...step,index}));
  const categoryStepIds=new Set(categorySteps.map(step=>step.id));
  const categoryPageStepIds=new Set(categorySteps.filter(step=>step.kind==='page').map(step=>step.id));
  const writingSteps=[];
  const writingTeachingUnits={8:[],9:[],10:[]};
  const writingTaskBounds={};
  for(const task of [8,9,10]){
    const first=writingSteps.length;
    for(const [prepIndex,prep] of modelGuides.prep[task].entries())writingSteps.push({id:`writing-${task}-prep-${prepIndex+1}`,task,kind:'prep',prepIndex,title:prep.title,quote:prep.title,lead:prep.lead,hint:prep.hint});
    let modelOrdinal=0,sentenceOrdinal=0;
    const addTeachingUnit=(kind,text,guide,sentence=null,section=null)=>{
      const teaching={id:`writing-${task}-model-${++modelOrdinal}`,task,kind:'model',modelKind:kind,modelOrdinal,text,quote:text,title:`Task ${task} 範文 · 第 ${modelOrdinal} 項`,guide,sentence,section,sources:sentence?.sources||[]};
      writingSteps.push(teaching);writingTeachingUnits[task].push(teaching);
      for(const [sourceIndex,sourceId] of teaching.sources.entries()){
        const source=unitById.get(sourceId);if(!source)continue;
        writingSteps.push({id:`${teaching.id}-source-${sourceIndex+1}`,task,kind:'source',title:`Task ${task} · 核對原文`,quote:source.excerpt,teachingId:teaching.id,modelOrdinal,sourceIndex,sourceId,source,page:sourcePage(source),guide});
        writingSteps.push({id:`${teaching.id}-return-${sourceIndex+1}`,task,kind:'return',title:`Task ${task} · 回到範文第 ${modelOrdinal} 項`,quote:text,teachingId:teaching.id,modelOrdinal,sourceIndex,sourceId,source,guide});
      }
    };
    const model=modelData.tasks[task];
    addTeachingUnit('title',model.title,modelGuides.titles[task]);
    for(const section of model.sections){
      addTeachingUnit('heading',section.heading,modelGuides.headings[task][section.heading],null,section.heading);
      for(const sentence of section.sentences)addTeachingUnit('sentence',sentence.text,modelGuides.sentences[task][sentenceOrdinal++]||{why:sentence.function,structure:'檢查這句在段落中的功能和銜接。',keywords:[],patterns:[]},sentence,section.heading);
    }
    writingTaskBounds[task]={first,last:writingSteps.length-1,prepLast:first+3,modelFirst:first+4};
  }
  writingSteps.forEach((step,index)=>{step.index=index;});
  const writingStepIds=new Set(writingSteps.map(step=>step.id));
  const defaultWritingPositions=()=>({8:writingTaskBounds[8].first,9:writingTaskBounds[9].first,10:writingTaskBounds[10].first});
  const defaultState=()=>({version:VERSION,tab:'contracts',contractIndex:0,categoryIndex:0,categoryCompleted:[],listenIndex:0,listenCompleted:[],evidenceIndex:0,evidenceCompleted:[],unitId:evidenceUnits[0].id,bank:{8:[],9:[],10:[]},notes:{},generatedNotes:{},noteRevealed:[],heardCues:[],categories:{},categoryRevealed:[],bookmarks:[],completedTabs:[],writingTask:8,writingIndex:writingTaskBounds[8].first,writingPositions:defaultWritingPositions(),writingCompleted:[],plans:{8:'',9:'',10:''},drafts:{8:'',9:'',10:''},questionDraft:'',playbackRate:1,transcriptOpen:true,spotlight:false,windowLayout:{transcript:null,preview:null},returnRoute:null});
  function sanitizeState(saved){
    const fresh=defaultState();if(!saved||typeof saved!=='object')return fresh;
    const validIds=new Set(units.map(unit=>unit.id));const validCue=index=>Number.isInteger(index)&&index>=0&&index<listeningData.cueCount;
    const stage2Compatible=[VERSION,'2019-b2-super-curation-v7','2019-b2-super-curation-v6','2019-b2-super-curation-v5'].includes(saved.version);
    const stage3Compatible=[VERSION,'2019-b2-super-curation-v7','2019-b2-super-curation-v6'].includes(saved.version);
    const stage4Compatible=[VERSION,'2019-b2-super-curation-v7'].includes(saved.version);
    const stage5Compatible=saved.version===VERSION;
    const clean={...fresh,version:VERSION};
    clean.tab=['contracts','categorize','listen','evidence','writing'].includes(saved.tab)?saved.tab:'contracts';
    clean.contractIndex=Number.isInteger(saved.contractIndex)?Math.max(0,Math.min(26,saved.contractIndex)):0;
    clean.categoryIndex=stage2Compatible&&Number.isInteger(saved.categoryIndex)?Math.max(0,Math.min(categorySteps.length-1,saved.categoryIndex)):0;
    clean.categoryCompleted=[...new Set(stage2Compatible&&Array.isArray(saved.categoryCompleted)?saved.categoryCompleted.filter(id=>categoryStepIds.has(id)):[])];
    clean.listenIndex=stage3Compatible&&Number.isInteger(saved.listenIndex)?Math.max(0,Math.min(LISTEN_STEP_COUNT-1,saved.listenIndex)):0;
    clean.listenCompleted=[...new Set(stage3Compatible&&Array.isArray(saved.listenCompleted)?saved.listenCompleted.filter(id=>typeof id==='string'&&(/^(guide|transcript)-/.test(id))):[])];
    clean.evidenceIndex=stage4Compatible&&Number.isInteger(saved.evidenceIndex)?Math.max(0,Math.min(evidenceUnits.length-1,saved.evidenceIndex)):0;
    clean.evidenceCompleted=[...new Set(stage4Compatible&&Array.isArray(saved.evidenceCompleted)?saved.evidenceCompleted.filter(id=>evidenceIds.has(id)):[])];
    clean.unitId=evidenceUnits[clean.evidenceIndex].id;
    clean.bank={8:[],9:[],10:[]};for(const task of [8,9,10])clean.bank[task]=[...new Set(Array.isArray(saved.bank?.[task])?saved.bank[task].filter(id=>evidenceBankableIds.has(id)&&unitById.get(id)?.tasks.includes(task)):[])];
    clean.notes=saved.notes&&typeof saved.notes==='object'?{...saved.notes}:{};
    clean.generatedNotes={};if(saved.generatedNotes&&typeof saved.generatedNotes==='object')for(const [id,value] of Object.entries(saved.generatedNotes))if(NOTE_IDS.has(id)&&typeof value==='string')clean.generatedNotes[id]=value.slice(0,2000);
    clean.noteRevealed=[...new Set(Array.isArray(saved.noteRevealed)?saved.noteRevealed.filter(id=>NOTE_IDS.has(id)):[])];
    clean.heardCues=[...new Set(Array.isArray(saved.heardCues)?saved.heardCues.filter(validCue):[])].sort((a,b)=>a-b);
    clean.categories={};if(saved.categories&&typeof saved.categories==='object')for(const [id,value] of Object.entries(saved.categories))if(categoryPageStepIds.has(id)&&Array.isArray(value))clean.categories[id]=[...new Set(value.map(Number).filter(task=>[8,9,10].includes(task)))];
    clean.categoryRevealed=[...new Set(stage2Compatible&&Array.isArray(saved.categoryRevealed)?saved.categoryRevealed.filter(id=>validIds.has(id)):[])];
    clean.bookmarks=[...new Set(Array.isArray(saved.bookmarks)?saved.bookmarks.filter(value=>typeof value==='string'&&value.length<100&&(stage3Compatible||!value.startsWith('listen:'))&&(!value.startsWith('evidence:')||evidenceIds.has(value.slice(9)))):[])];
    clean.completedTabs=[...new Set(Array.isArray(saved.completedTabs)?saved.completedTabs.filter(tab=>['contracts','categorize','listen','evidence','writing'].includes(tab)):[])];
    if(!Number.isInteger(saved.contractIndex))clean.completedTabs=clean.completedTabs.filter(tab=>tab!=='contracts');
    if(!stage2Compatible)clean.completedTabs=clean.completedTabs.filter(tab=>tab!=='categorize');
    if(!stage3Compatible){clean.completedTabs=clean.completedTabs.filter(tab=>tab!=='listen');if(['listen','evidence','writing'].includes(clean.tab))clean.tab='listen';}
    if(!stage4Compatible){clean.completedTabs=clean.completedTabs.filter(tab=>!['evidence','writing'].includes(tab));if(['evidence','writing'].includes(clean.tab))clean.tab='evidence';}
    if(!stage5Compatible)clean.completedTabs=clean.completedTabs.filter(tab=>tab!=='writing');
    clean.writingTask=[8,9,10].includes(Number(saved.writingTask))?Number(saved.writingTask):8;
    clean.writingPositions=defaultWritingPositions();
    if(stage5Compatible&&saved.writingPositions&&typeof saved.writingPositions==='object')for(const task of [8,9,10])clean.writingPositions[task]=Math.max(writingTaskBounds[task].first,Math.min(writingTaskBounds[task].last,Number(saved.writingPositions[task])||writingTaskBounds[task].first));
    clean.writingIndex=stage5Compatible?Math.max(writingTaskBounds[clean.writingTask].first,Math.min(writingTaskBounds[clean.writingTask].last,Number(saved.writingIndex)||clean.writingPositions[clean.writingTask])):writingTaskBounds[clean.writingTask].first;
    clean.writingPositions[clean.writingTask]=clean.writingIndex;
    clean.writingCompleted=[...new Set(stage5Compatible&&Array.isArray(saved.writingCompleted)?saved.writingCompleted.filter(id=>writingStepIds.has(id)):[])];
    clean.plans={...fresh.plans,...(saved.plans||{})};clean.drafts={...fresh.drafts,...(saved.drafts||{})};
    clean.questionDraft=typeof saved.questionDraft==='string'?saved.questionDraft.slice(0,5000):'';
    clean.playbackRate=[.5,.75,1,1.25,1.5,1.75,2].includes(Number(saved.playbackRate))?Number(saved.playbackRate):1;
    clean.spotlight=stage3Compatible?Boolean(saved.spotlight):false;
    clean.transcriptOpen=stage3Compatible?Boolean(saved.transcriptOpen):true;clean.windowLayout=saved.windowLayout&&typeof saved.windowLayout==='object'?{...fresh.windowLayout,...saved.windowLayout}:{...fresh.windowLayout};
    // A return route is only meaningful inside the current page session. Persisting it
    // leaves a refreshed or second tab stranded away from the active native source.
    clean.returnRoute=null;
    return clean;
  }
  function loadEnvelope(){
    try{const stored=JSON.parse(localStorage.getItem(STORAGE)||'null');if(stored?.version===VERSION&&stored.slots&&typeof stored.slots==='object'){const activeSlot=/^[1-5]$/.test(String(stored.activeSlot))?String(stored.activeSlot):'1';const slots={};for(let index=1;index<=5;index+=1)if(stored.slots[index])slots[index]=sanitizeState(stored.slots[index]);return {activeSlot,slots};}}catch{}
    try{const stored=JSON.parse(localStorage.getItem(LEGACY_STORAGE_V7)||'null');if(stored?.version==='2019-b2-super-curation-v7'&&stored.slots&&typeof stored.slots==='object'){const activeSlot=/^[1-5]$/.test(String(stored.activeSlot))?String(stored.activeSlot):'1';const slots={};for(let index=1;index<=5;index+=1)if(stored.slots[index])slots[index]=sanitizeState(stored.slots[index]);return {activeSlot,slots};}}catch{}
    try{const stored=JSON.parse(localStorage.getItem(LEGACY_STORAGE_V6)||'null');if(stored?.version==='2019-b2-super-curation-v6'&&stored.slots&&typeof stored.slots==='object'){const activeSlot=/^[1-5]$/.test(String(stored.activeSlot))?String(stored.activeSlot):'1';const slots={};for(let index=1;index<=5;index+=1)if(stored.slots[index])slots[index]=sanitizeState(stored.slots[index]);return {activeSlot,slots};}}catch{}
    try{const stored=JSON.parse(localStorage.getItem(LEGACY_STORAGE_V5)||'null');if(stored?.version==='2019-b2-super-curation-v5'&&stored.slots&&typeof stored.slots==='object'){const activeSlot=/^[1-5]$/.test(String(stored.activeSlot))?String(stored.activeSlot):'1';const slots={};for(let index=1;index<=5;index+=1)if(stored.slots[index])slots[index]=sanitizeState(stored.slots[index]);return {activeSlot,slots};}}catch{}
    try{const stored=JSON.parse(localStorage.getItem(LEGACY_STORAGE_V4)||'null');if(stored?.version==='2019-b2-super-curation-v4'&&stored.slots&&typeof stored.slots==='object'){const activeSlot=/^[1-5]$/.test(String(stored.activeSlot))?String(stored.activeSlot):'1';const slots={};for(let index=1;index<=5;index+=1)if(stored.slots[index])slots[index]=sanitizeState(stored.slots[index]);return {activeSlot,slots};}}catch{}
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
  let spotlightFrame=0,spotlightUntil=0,routeGhostUnit=null,noteTyping=null,previewInkTimer=0,currentNativeTarget=null;
  const bankTransfers=new Set();
  function spotlightTarget(){return state.spotlight&&!state.returnRoute&&state.tab!=='writing'?currentNativeTarget:null;}
  function placeSpotlight(){const wrap=$('.gm-spotlight');const target=spotlightTarget();if(!wrap||!target){if(wrap)wrap.hidden=true;return;}const rect=target.getBoundingClientRect(),pad=9,view=viewportBox(),viewRight=view.left+view.width,viewBottom=view.top+view.height;wrap.hidden=false;const top=Math.max(view.top,rect.top-pad),left=Math.max(view.left,rect.left-pad),right=Math.min(viewRight,rect.right+pad),bottom=Math.min(viewBottom,rect.bottom+pad);Object.assign($('[data-mask="top"]',wrap).style,{left:`${view.left}px`,top:`${view.top}px`,width:`${view.width}px`,height:`${Math.max(0,top-view.top)}px`});Object.assign($('[data-mask="right"]',wrap).style,{left:`${right}px`,top:`${top}px`,width:`${Math.max(0,viewRight-right)}px`,height:`${Math.max(0,bottom-top)}px`});Object.assign($('[data-mask="bottom"]',wrap).style,{left:`${view.left}px`,top:`${bottom}px`,width:`${view.width}px`,height:`${Math.max(0,viewBottom-bottom)}px`});Object.assign($('[data-mask="left"]',wrap).style,{left:`${view.left}px`,top:`${top}px`,width:`${Math.max(0,left-view.left)}px`,height:`${Math.max(0,bottom-top)}px`});target.classList.add('gm-active-target');}
  function trackSpotlight(){cancelAnimationFrame(spotlightFrame);$$('.gm-active-target').forEach(node=>node.classList.remove('gm-active-target'));placeSpotlight();spotlightUntil=performance.now()+(reduceMotion?0:900);const follow=now=>{placeSpotlight();if(now<spotlightUntil)spotlightFrame=requestAnimationFrame(follow);};if(!reduceMotion)spotlightFrame=requestAnimationFrame(follow);}
  function suspendSpotlight(){cancelAnimationFrame(spotlightFrame);const wrap=$('.gm-spotlight');if(wrap)wrap.hidden=true;$$('.gm-active-target').forEach(node=>node.classList.remove('gm-active-target'));}
  function animateArrival(panel){if(!panel)return;panel.classList.remove('gm-arriving');void panel.offsetWidth;panel.classList.add('gm-arriving');afterMotion(panel,'animationend',550,()=>panel.classList.remove('gm-arriving'));}
  function scrollInstant(target,block='start'){if(!target)return;const root=document.documentElement,previous=root.style.scrollBehavior;root.style.scrollBehavior='auto';target.scrollIntoView({behavior:'auto',block});root.style.scrollBehavior=previous;}
  function nativePageAsset(page){const original=$(`#page-${page} .reference-scan img`);return original?.currentSrc||original?.src||new URL(`assets/page-${String(page).padStart(2,'0')}.webp`,document.baseURI).href;}
  let exactTargetOverlay=null;
  function removeExactTargetOverlay(){exactTargetOverlay?.remove();exactTargetOverlay=null;}
  function exactRangeOverlay(root,phrase,unitId){
    const canonical=value=>value.replace(/[’‘]/g,"'").replace(/[│|]/g,'|').toLocaleLowerCase(),needle=canonical(phrase),haystack=canonical(root.textContent),start=haystack.indexOf(needle);if(start<0)return null;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:node=>node.parentElement?.closest('.translation')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}),nodes=[];let node,offset=0;
    while((node=walker.nextNode())){nodes.push({node,start:offset,end:offset+node.length});offset+=node.length;}
    const first=nodes.find(item=>item.end>start),last=nodes.find(item=>item.end>=start+phrase.length);if(!first||!last)return null;
    const range=document.createRange();range.setStart(first.node,start-first.start);range.setEnd(last.node,start+phrase.length-last.start);const rect=range.getBoundingClientRect();if(!rect.width||!rect.height)return null;
    removeExactTargetOverlay();exactTargetOverlay=document.createElement('span');exactTargetOverlay.className='gm-exact-target-overlay';exactTargetOverlay.dataset.evidenceTarget=unitId;exactTargetOverlay.setAttribute('aria-hidden','true');Object.assign(exactTargetOverlay.style,{left:`${window.scrollX+rect.left}px`,top:`${window.scrollY+rect.top}px`,width:`${rect.width}px`,height:`${rect.height}px`});document.body.append(exactTargetOverlay);return exactTargetOverlay;
  }
  function nativeTargetForUnit(unit){
    if(!unit)return null;
    const exact=$(`[data-unit="${unit.id}"]`);if(exact){removeExactTargetOverlay();return exact;}
    const page=$(`#page-${sourcePage(unit)}`);if(!page)return null;
    const authored=EVIDENCE_AUTHORED_TARGETS.get(unit.id);if(authored){const target=$(authored);if(target){removeExactTargetOverlay();return target;}}
    const raw=String(unit.excerpt||unit.heading||'').replace(/[\[\]*]/g,'').replace(/^“|”$/g,'').trim();
    const phrases=[raw,...raw.split(/\s*(?:\.{2,}|…)\s*/)].map(value=>value.trim()).filter(value=>value.length>=4).sort((a,b)=>b.length-a.length);
    const canonical=value=>value.replace(/[’‘]/g,"'").replace(/[│|]/g,'|').toLocaleLowerCase();
    const candidates=$$('p,h1,h2,h3,h4,li,dt,dd,td,th,blockquote,figcaption,img,svg text,[aria-label]',page).filter(node=>!node.matches('[lang="zh-Hant"]')&&!node.closest('.translation,.native-label,.reference-scan')&&!node.querySelector('p,h1,h2,h3,h4,li,dt,dd,td,th,blockquote'));
    for(const candidatePhrase of phrases){const variants=[candidatePhrase,candidatePhrase.replace(/[.!?,;:]+$/,'').trim()].filter((value,index,list)=>value.length>=4&&list.indexOf(value)===index);for(const phrase of variants){const match=candidates.filter(node=>canonical(node.textContent).includes(canonical(phrase))).sort((a,b)=>a.textContent.length-b.textContent.length)[0];if(match){const overlay=exactRangeOverlay(match,phrase,unit.id);if(overlay)return overlay;}}}
    const literal=String(unit.excerpt||unit.heading||'').replace(/\[[^\]]+\]/g,' ').replace(/visual element:/ig,' ').replace(/[“”‘’*]/g,' '),tokens=[...new Set((literal.toLocaleLowerCase().match(/[a-z0-9]+/g)||[]).filter(token=>token.length>=3&&!['the','and','for','with','from','that','this'].includes(token)))];
    if(tokens.length){const scored=candidates.map(node=>{const text=canonical(node.getAttribute?.('alt')||node.getAttribute?.('aria-label')||node.textContent||''),hits=tokens.filter(token=>text.includes(token)).length;return {node,hits,ratio:hits/tokens.length,length:text.length};}).filter(item=>item.hits>=Math.min(2,tokens.length)&&item.ratio>=.4).sort((a,b)=>b.ratio-a.ratio||b.hits-a.hits||a.length-b.length);if(scored[0]){removeExactTargetOverlay();return scored[0].node;}}
    removeExactTargetOverlay();
    return $('.native-document',page)||page;
  }
  function setNativeTarget(target,{scroll=true}={}){
    if(exactTargetOverlay&&target!==exactTargetOverlay)removeExactTargetOverlay();
    $$('.gm-native-current').forEach(node=>node.classList.remove('gm-native-current'));
    currentNativeTarget=target||null;
    if(!currentNativeTarget)return;
    currentNativeTarget.classList.add('gm-native-current');
    if(scroll&&!currentNativeTarget.closest('.gm-floating-window')){const expected=currentNativeTarget;let remaining=6;const align=()=>{if(currentNativeTarget!==expected||remaining--<=0)return;const rect=expected.getBoundingClientRect(),offset=state.tab==='listen'&&innerWidth>1099?264:innerWidth<=1099?150:174;if(Math.abs(rect.top-offset)<=2)return;const root=document.documentElement,previous=root.style.scrollBehavior;root.style.scrollBehavior='auto';window.scrollTo({top:Math.max(0,window.scrollY+rect.top-offset),behavior:'auto'});root.style.scrollBehavior=previous;requestAnimationFrame(align);};align();}
  }
  function syncNativeSource({scroll=true}={}){
    if(state.returnRoute)return;
    let target=null;
    if(state.tab==='contracts')target=contractNativeTarget(contractSteps[state.contractIndex]);
    else if(state.tab==='categorize')target=currentCategoryStep()?.target||$(`#page-${currentCategoryStep()?.page} .native-document`);
    else if(state.tab==='evidence'){const panel=currentExplorerPanel();const unit=panel?currentUnit(panel).unit:null;target=nativeTargetForUnit(unit);}
    else if(state.tab==='listen'){const step=currentListeningStep();if(step?.kind==='guide'&&step.noteId)target=$(`[data-curation-note="${step.noteId}"]`);else if(step?.kind==='transcript'&&!$('#gm-transcript-window')?.hidden)target=$(`[data-floating-cue="${step.cue}"]`);target=target||nativeNoteSheet||$('#page-3 .native-document');}
    else if(state.tab==='writing'){const step=currentWritingStep();target=step?.kind==='source'?$(`[data-preview-ink="${step.sourceId}"]`,$('#gm-model-preview')):$(`[data-writing-unit="${step?.teachingId||step?.id}"]`,writingPractice)||writingPractice;}
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
    {id:'cinema-home',label:'Speech · cinema vs home',cue:93,check:'Home VR can provide the same 360-degree experience from the sofa; there is no need to go to the cinema.'},
    {id:'film-budget',label:'Speech · blockbusters vs low-budget films',cue:101,check:'Studios focus resources on blockbusters for bigger profits; huge marketing campaigns leave low-budget filmmakers unable to compete.'}
  ];
  const nativeNoteSheet=$('#page-3 .conference-notes');
  const nativeNoteAnchor=document.createComment('2019 B2 native note sheet mount point');
  if(nativeNoteSheet)nativeNoteSheet.parentNode.insertBefore(nativeNoteAnchor,nativeNoteSheet);
  const categoryTaskLetter={8:'A',9:'B',10:'C'};
  function currentCategoryStep(){state.categoryIndex=Math.max(0,Math.min(categorySteps.length-1,state.categoryIndex));return categorySteps[state.categoryIndex];}
  function categoryCutoff(){const order=['contracts','categorize','listen','evidence','writing'],active=order.indexOf(state.tab),target=order.indexOf('categorize');return active<target?-1:active>target?categorySteps.length-1:state.categoryIndex;}
  function wrapCategoryNoiseText(target){
    if(!target||$('.gm-category-note-strike',target))return;
    const nodes=[];const walker=document.createTreeWalker(target,NodeFilter.SHOW_TEXT);let node;
    while((node=walker.nextNode()))if(node.textContent.trim()&&!node.parentElement.closest('textarea'))nodes.push(node);
    for(const textNode of nodes){const span=document.createElement('span');span.className='gm-category-note-strike';textNode.parentNode.insertBefore(span,textNode);span.append(textNode);}
  }
  function prepareCategoryTargets(){
    for(const step of categorySteps){
      if(!step.target)continue;
      step.target.dataset.categoryStep=step.id;
      if(step.kind==='page'){
        const page=step.target.closest('.recreated-page');if(!page)continue;
        page.classList.add('gm-category-page');let holder=$('.gm-category-page-stamps',page);
        if(!holder){holder=document.createElement('div');holder.className='gm-category-page-stamps';holder.setAttribute('aria-label','這頁的暫定任務標記');page.insertBefore(holder,step.target);}
        step.stampHolder=holder;
      }else{
        step.target.classList.add('gm-category-note-target');if(step.entry.kind==='task')step.target.classList.add('gm-category-note-task',`gm-category-note-task-${step.entry.task}`);else step.target.classList.add('gm-category-note-noise');
        step.target.dataset.categoryLetter=step.entry.task?categoryTaskLetter[step.entry.task]:'×';
        step.target.setAttribute('aria-label',`${step.target.textContent.trim()} · ${step.entry.kind==='task'?`分類：Task ${step.entry.task}`:'Type 6：不供三篇作文取證'}`);
        if(step.entry.kind==='noise')wrapCategoryNoiseText(step.target);
      }
    }
  }
  function selectedCategoryTasks(step){return Object.hasOwn(state.categories,step.id)?state.categories[step.id]:step.entry.initialTasks;}
  function syncCategoryMarks(animate=null){
    const cutoff=categoryCutoff();
    for(const step of categorySteps){
      const reached=step.index<=cutoff;
      if(step.kind==='page'){
        const selected=reached?selectedCategoryTasks(step):[];const holder=step.stampHolder;if(!holder)continue;
        const signature=selected.join(',');
        if(holder.dataset.tasks!==signature){holder.dataset.tasks=signature;holder.replaceChildren();for(const task of selected){const stamp=document.createElement('span');stamp.className=`gm-category-page-stamp task${task}`;stamp.textContent=categoryTaskLetter[task];stamp.dataset.task=String(task);stamp.setAttribute('role','img');stamp.setAttribute('aria-label',`暫定標記：Task ${task}`);if(animate?.page===step.page&&animate.task===task)stamp.classList.add('is-new');holder.append(stamp);}}
        holder.closest('.gm-category-page')?.classList.toggle('has-category-stamps',selected.length>0);
      }else step.target?.classList.toggle('is-revealed',reached);
    }
    const animated=$('.gm-category-page-stamp.is-new');if(animated)afterMotion(animated,'animationend',760,()=>animated.classList.remove('is-new'));
  }
  prepareCategoryTargets();

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
  const writingPractice=document.createElement('section');
  writingPractice.id='gm-writing-practice';writingPractice.className='gm-writing-practice';writingPractice.hidden=true;writingPractice.setAttribute('aria-label','2019 B2 PP writing practice');
  $('#reader').append(writingPractice);
  const launch=document.createElement('button');launch.type='button';launch.id='gm-curation-toggle';launch.className='curation-launch';launch.textContent='✦ 離開 Curation';$('.toolbar')?.append(launch);
  document.body.classList.add('gm-curation-active');
  let curationOpen=true;
  function setCurationOpen(value){curationOpen=Boolean(value);shell.hidden=!curationOpen;document.body.classList.toggle('gm-curation-active',curationOpen);launch.textContent=curationOpen?'✦ 離開 Curation':'✦ Super Curation';launch.setAttribute('aria-pressed',String(curationOpen));if(curationOpen)requestAnimationFrame(()=>{syncNativeSource({scroll:true});trackSpotlight();});else{suspendSpotlight();removeExactTargetOverlay();}}
  const footer=$('body>footer');if(footer)footer.textContent='來源：2019 Paper 3.pdf、原裝 Part B 錄音、canonical fact-line analysis 及 length-controlled model set。19 頁已逐頁核對；中文只作學習輔助，英文原卷為準。';
  $('#gm-slot').value=activeSlot;

  const cueTranslations=new Map(),cueTeaching=new Map();
  for(const unit of units)if(unit.audioCue){const teaching=cueTeaching.get(unit.audioCue.index)||[];teaching.push({id:unit.id,decision:unit.decision,tasks:unit.tasks,typeNumber:unit.typeNumber});cueTeaching.set(unit.audioCue.index,teaching);if(unit.translation){const list=cueTranslations.get(unit.audioCue.index)||[];if(!list.includes(unit.translation))list.push(unit.translation);cueTranslations.set(unit.audioCue.index,list);}}
  const transcriptSections=new Map([[0,'Instructions'],[9,'Short Video Competition'],[40,'Brighthouse Cinema'],[70,'Prize Giving Ceremony'],[81,'Cinema and home viewing'],[94,'Blockbusters and low-budget films'],[103,'Closing instructions']]);
  const listeningGuideSpecs=[
    {id:'guide-poster',cue:28,noteId:'poster',title:'短片比賽海報',lead:'聽出修正後的網址，並確認 QR code 的位置。',taskLabel:'Type 6 · 完成筆記，不供三篇作文取證'},
    {id:'guide-deadline',cue:34,noteId:'deadline',title:'短片比賽截止日期',lead:'辨認延期後的最終日期，而不是原來的日期。',taskLabel:'Type 6 · 完成筆記，不供三篇作文取證'},
    {id:'guide-brighthouse',cue:69,noteId:'brighthouse',title:'Brighthouse Cinema',lead:'把輪椅上台、人手和 noodles 活動的必要條件合併進同一欄。',taskLabel:'Task 8 · 錄音證據'},
    {id:'guide-prize',cue:80,noteId:'prize',title:'頒獎禮資料',lead:'核對場地、日期和時間；這些資料只完成筆記表。',taskLabel:'Type 6 · 完成筆記，不供三篇作文取證'},
    {id:'guide-cinema-home',cue:93,noteId:'cinema-home',title:'戲院與家中觀影',lead:'只記錄錄音對 home VR 的說法；Data File 的相反觀點留待 Stage 4。',taskLabel:'Task 10 · 錄音證據'},
    {id:'guide-film-budget',cue:101,noteId:'film-budget',title:'大片與低成本電影',lead:'只記錄錄音中的資源、利潤和宣傳競爭；不要提前加入其他來源。',taskLabel:'Task 10 · 錄音證據'},
    {id:'guide-content-end',cue:102,noteId:null,title:'錄音內容終點',lead:'聽到「I’ll pass on your message」後，內容筆記已完成；下一段開始逐句核對完整錄音稿。',taskLabel:'內容終點 · 後續行政對話仍會逐句核對'}
  ];
  const listeningGuideSteps=listeningGuideSpecs.map((spec,index)=>({...spec,kind:'guide',index,from:index===0?listeningData.cues[9].start:listeningData.cues[listeningGuideSpecs[index-1].cue].end,end:listeningData.cues[spec.cue].end}));
  const listeningTranscriptSteps=listeningData.cues.map((cue,cueIndex)=>{const teaching=cueTeaching.get(cueIndex)||[],tasks=[...new Set(teaching.flatMap(item=>item.tasks))];return {id:`transcript-${cueIndex}`,kind:'transcript',index:LISTEN_GUIDE_COUNT+cueIndex,cue:cueIndex,title:`逐句錄音稿 · Cue ${cueIndex+1}`,lead:cue.text,tasks,rejected:teaching.length>0&&teaching.every(item=>item.decision==='不寫入答案'),teaching};});
  const listeningSteps=[...listeningGuideSteps,...listeningTranscriptSteps];
  function currentListeningStep(){state.listenIndex=Math.max(0,Math.min(listeningSteps.length-1,state.listenIndex));return listeningSteps[state.listenIndex];}
  function currentWritingStep(){state.writingIndex=Math.max(0,Math.min(writingSteps.length-1,Number(state.writingIndex)||0));const step=writingSteps[state.writingIndex];if(step&&step.task!==Number(state.writingTask)){state.writingTask=step.task;state.writingPositions[step.task]=step.index;}return step;}
  function bookmarkKey(){if(state.tab==='categorize')return `categorize:${currentCategoryStep()?.id}`;if(state.tab==='evidence')return `evidence:${state.unitId}`;if(state.tab==='listen')return `listen:${currentListeningStep()?.id}`;if(state.tab==='writing')return `writing:${currentWritingStep()?.id}`;return `contracts:${state.contractIndex}`;}
  function bookmarkLabel(key){const [kind,value]=key.split(':');if(kind==='categorize'){const step=categorySteps.find(item=>item.id===value);return `分類 · ${step?.title||value}`;}if(kind==='evidence')return `取證 · ${value}`;if(kind==='listen'){const step=listeningSteps.find(item=>item.id===value);return `聆聽 · ${step?.index+1||1}/${LISTEN_STEP_COUNT} · ${step?.title||value}`;}if(kind==='writing'){const step=writingSteps.find(item=>item.id===value);return `寫作 · ${step?`${step.index+1}/${writingSteps.length} · Task ${step.task}`:`Task ${value}`}`;}if(kind==='contracts')return `任務指示 · ${Number(value)+1}/${contractSteps.length}`;return '任務指示';}
  function updateBookmarks(){const select=$('#gm-bookmark-jump');if(!select)return;select.innerHTML='<option value="">選擇書籤</option>'+state.bookmarks.map(key=>`<option value="${escape(key)}">${escape(bookmarkLabel(key))}</option>`).join('');const saved=state.bookmarks.includes(bookmarkKey());$('#gm-bookmark').setAttribute('aria-pressed',String(saved));$('#gm-bookmark').textContent=saved?'★':'☆';}
  function updateController(){
    const status=$('#gm-step-status');if(!status)return;
    const chapterIndex=['contracts','categorize','listen','evidence','writing'].indexOf(state.tab)+1;let detail='';
    if(state.tab==='contracts')detail=`${state.contractIndex+1}/${contractSteps.length} · ${contractSteps[state.contractIndex]?.id||'boss email'}`;
    else if(state.tab==='categorize'){const step=currentCategoryStep();detail=`${state.categoryIndex+1}/${categorySteps.length} · ${step?.title||'資料分類'}`;}
    else if(state.tab==='evidence'){const panel=currentExplorerPanel();const item=panel?currentUnit(panel):{list:[],index:0};detail=item.unit?`${item.index+1}/${item.list.length} · ${item.unit.id}`:'empty matched state';}
    else if(state.tab==='listen'){const step=currentListeningStep();detail=`${state.listenIndex+1}/${LISTEN_STEP_COUNT} · ${step?.title||'聆聽錄音'}`;}
    else if(state.tab==='writing'){const step=currentWritingStep();detail=`${step.index+1}/${writingSteps.length} · Task ${step.task} · ${step.kind==='prep'?step.title:step.kind==='model'?`範文第 ${step.modelOrdinal} 項`:step.kind==='source'?'核對原文':'返回範文'}`;}
    else detail='task instructions';
    status.textContent=`Chapter ${chapterIndex}/5 · ${detail}`;updateBookmarks();shell.style.setProperty('--gm-stage-progress',`${(chapterIndex-1)*20}%`);
    $$('.gm-tab').forEach((button,index)=>{const complete=state.completedTabs.includes(button.dataset.tab),active=index===chapterIndex-1;button.classList.toggle('is-complete',complete);button.dataset.stageState=complete?'完成':active?'目前':'未到';button.setAttribute('aria-label',`${button.querySelector('.gm-stage-label')?.textContent||button.textContent.trim()} · ${button.dataset.stageState}`);const dot=$('.gm-stage-dot',button),count=$('.gm-stage-count',button);if(dot)dot.textContent=complete?'✓':String(index+1);if(count)count.textContent=complete?'完成':active?(state.tab==='contracts'?`${state.contractIndex+1}/${contractSteps.length}`:state.tab==='categorize'||state.tab==='evidence'?detail.split(' · ')[0]:state.tab==='listen'?`${state.listenIndex+1}/${LISTEN_STEP_COUNT}`:state.tab==='writing'?`${state.writingIndex+1}/${writingSteps.length}`:''):'';});
    const next=$('#gm-next-step');if(next&&state.tab==='contracts')next.textContent=state.contractIndex===contractSteps.length-1?'完成 Stage 1 →':'下一步 →';else if(next&&state.tab==='categorize')next.textContent=state.categoryIndex===categorySteps.length-1?'完成本章 ✓':'下一步 →';else if(next&&state.tab==='listen'){const step=currentListeningStep(),done=state.listenCompleted.includes(step.id);next.textContent=step.kind==='guide'&&!done?'播放至停頓點 →':state.listenIndex===LISTEN_STEP_COUNT-1?'完成 Stage 3 →':step.kind==='guide'&&state.listenIndex===LISTEN_GUIDE_COUNT-1?'開始逐句核對 →':'下一步 →';}else if(next&&state.tab==='evidence')next.textContent=state.evidenceIndex===evidenceUnits.length-1?'完成本章 ✓':'下一步 →';else if(next&&state.tab==='writing')next.textContent=state.writingIndex===writingSteps.length-1?'完成 Stage 5 ✓':'下一步 →';else if(next)next.textContent='下一步 →';
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
    const windowNode=$('#gm-transcript-window'),body=$('.gm-window-body',windowNode);body.innerHTML=listeningTranscriptSteps.map(step=>{const cue=listeningData.cues[step.cue],taskClasses=step.tasks.map(task=>`task${task}`).join(' ');return `${transcriptSections.has(cue.index)?`<h3 class="gm-transcript-section">${escape(transcriptSections.get(cue.index))}</h3>`:''}<section class="gm-floating-cue ${taskClasses} ${step.rejected?'has-rejection':''}" data-floating-cue="${cue.index}" data-listen-step="${step.id}"><h4><span>${formatTime(cue.start)}–${formatTime(cue.end)}</span><span>${escape(cue.speaker)}</span><span>${escape(cue.id)}</span></h4><p lang="en"><span>${escape(cue.text)}</span></p>${cueTranslations.has(cue.index)?`<p class="gm-floating-translation" lang="zh-Hant">${escape(cueTranslations.get(cue.index).join('／'))}</p>`:''}${step.teaching.length?`<div class="gm-floating-status">${step.teaching.slice(0,3).map(item=>`<span>${escape(item.id)} · ${escape(item.decision)}${item.tasks.length?` · T${item.tasks.join('/T')}`:''}</span>`).join('')}</div>`:''}</section>`;}).join('');
  }
  function syncListeningMarks({scrollCurrent=false}={}){const step=currentListeningStep();$$('.gm-floating-cue').forEach(section=>{const cue=Number(section.dataset.floatingCue),reviewed=state.listenCompleted.includes(`transcript-${cue}`);section.classList.toggle('is-step-current',step?.kind==='transcript'&&step.cue===cue);section.classList.toggle('is-reviewed',reviewed);section.classList.toggle('is-heard',state.heardCues.includes(cue));});if(scrollCurrent&&step?.kind==='transcript'){const target=$(`[data-floating-cue="${step.cue}"]`),body=target?.closest('.gm-window-body');if(target&&body)body.scrollTo({top:Math.max(0,target.offsetTop-body.offsetTop-72),behavior:'auto'});}shell.dataset.listenKind=step?.kind||'';shell.dataset.listenIndex=String(state.listenIndex);}
  function openTranscriptWindow(){const windowNode=$('#gm-transcript-window');windowNode.hidden=false;state.transcriptOpen=true;applyWindowLayout(windowNode,'transcript');clampWindow(windowNode);syncListeningMarks({scrollCurrent:true});save();updateAudioState($('#gm-audio'));}
  function closeTranscriptWindow(){state.transcriptOpen=false;$('#gm-transcript-window').hidden=true;save();}
  function modelUsedIds(task){return new Set(modelData.tasks[task].sections.flatMap(section=>section.sentences.flatMap(sentence=>sentence.sources)));}
  let previewSourceIds=[];
  function noteForUnit(unit){if(!unit?.audioCue)return null;return noteDefinitions.find(note=>unit.audioCue.index<=note.cue&&(!noteDefinitions.find(other=>other.cue>=unit.audioCue.index&&other.cue<note.cue)))||null;}
  function renderModelPreview(sourceId){
    const unit=unitById.get(sourceId),windowNode=$('#gm-model-preview'),body=$('.gm-window-body',windowNode);if(!unit)return;
    const note=noteForUnit(unit),generated=note&&state.generatedNotes[note.id];
    const page=sourcePage(unit);
    const audioSource=Boolean(unit.audioCue),sourceLabel=audioSource?`錄音稿 · ${formatTime(unit.audioCue.start)}–${formatTime(unit.audioCue.end)}`:`Data File 第 ${page} 頁 · 原文`;
    $('.gm-window-head strong',windowNode).textContent=sourceLabel;
    body.innerHTML=`<div class="gm-preview-source-nav">${previewSourceIds.map(id=>`<button class="gm-pill ${id===sourceId?'is-current':''}" data-preview-source="${id}">${id}</button>`).join('')}</div><p class="gm-kicker">${escape(sourceLabel)} · ${escape(unit.section)} · ${escape(unit.decision)}</p><h3>${escape(unit.heading)}</h3>${audioSource?`<p class="gm-audio-source-line"><strong>${escape(unit.audioCue.speaker)}</strong><span>${escape(unit.audioCue.text)}</span></p>`:''}<blockquote class="gm-excerpt gm-navy-ink" data-preview-ink="${unit.id}"><span>${escape(unit.excerpt)}</span></blockquote>${unit.translation?`<p class="gm-translation" lang="zh-Hant">${escape(unit.translation)}</p>`:''}${generated?`<div class="gm-note-mirror" data-note-use="${note.id}"><strong>Native note · ${escape(note.label)}</strong><span class="gm-note-used-line">${escape(generated)}</span><small>此為非破壞性 mirror；原 textarea 內容未被改寫。</small></div>`:''}<div class="gm-prompt-list"><div class="gm-prompt"><h4>Why it matters</h4><p>${escape(unit.prompts.use)}</p></div><div class="gm-prompt"><h4>Allowed treatment</h4><p>${escape(unit.prompts.treatment)}</p></div></div>${audioSource?'':`<figure class="gm-preview-scan"><img src="${escape(nativePageAsset(page))}" alt="Original paper page ${page} for ${unit.id}"><figcaption>${unit.id} · analysis line ${unit.analysisLine}</figcaption></figure>`}<div class="gm-btn-row"><button class="gm-btn" data-native-page="${page}">${audioSource?'到原卷筆記頁':'到原卷位置'}</button>${audioSource?`<button class="gm-btn" data-seek-unit="${unit.audioCue.index}">到錄音 cue</button>`:`<button class="gm-btn" data-open-unit="${unit.id}">在逐句取證開啟</button>`}</div>`;
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
    const mark=document.createElement('mark');const task=annotation.task||step.task||0;mark.className=`gm-contract-mark ${task?`gm-source-mark-t${task}`:''} ${annotation.kind==='hint'?'is-hint':''} ${annotation.kind==='context'?'is-context':''} ${annotation.kind==='reject'?'is-rejected':''} ${annotation.point?'has-point':''}`;mark.dataset.contractMark=`${step.id}:${annotation.phrase}`;mark.dataset.contractStep=step.id;if(task)mark.dataset.contractTask=String(task);if(annotation.point)mark.dataset.point=String(annotation.point);const annotationIndex=(step.annotations||[]).indexOf(annotation),sourceId=step.sourceIds?.[annotationIndex]||step.sourceIds?.[0];if(sourceId){mark.dataset.sourceId=sourceId;mark.dataset.unit=sourceId;}
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

  function explorerLayout(panel,mode){
    panel.innerHTML=`<div class="gm-evidence-progress"><strong class="gm-unit-index"></strong><span><i></i></span><small class="gm-reviewed-count"></small></div><label class="gm-evidence-jump">跳至 Stage 4 步驟<select data-evidence-jump aria-label="跳至 Stage 4 步驟"></select></label><div class="gm-evidence-task-jump" aria-label="跳至任務的第一個 Data File 單位">${[8,9,10].map(task=>`<button type="button" class="task${task}" data-evidence-task="${task}">Task ${task}</button>`).join('')}</div><div class="gm-evidence-legend" aria-label="資料標記顏色"><span class="task8">A · Task 8</span><span class="task9">B · Task 9</span><span class="task10">C · Task 10</span><span class="hint">Type 4/5</span><span class="reject">Type 6</span></div><p class="gm-evidence-instruction">按 Data File 原頁順序閱讀；只有答案決定容許使用的內容，才會在按「下一步」後自動進入右側證據庫。</p><article class="gm-card gm-unit" tabindex="-1"></article>`;
    panel.dataset.mode=mode;
    renderExplorer(panel);
  }
  function currentUnit(){state.evidenceIndex=Math.max(0,Math.min(evidenceUnits.length-1,Number(state.evidenceIndex)||0));state.unitId=evidenceUnits[state.evidenceIndex].id;return {list:evidenceUnits,index:state.evidenceIndex,unit:evidenceUnits[state.evidenceIndex]};}
  function goEvidenceIndex(index,{focus=true}={}){state.evidenceIndex=Math.max(0,Math.min(evidenceUnits.length-1,Number(index)||0));state.unitId=evidenceUnits[state.evidenceIndex].id;save();const panel=currentExplorerPanel();if(panel)renderExplorer(panel);if(focus)$('.gm-unit',panel)?.focus({preventScroll:true});announce(`Stage 4 unit ${state.evidenceIndex+1} of ${evidenceUnits.length}: ${state.unitId}.`);}
  function taskPills(unit){return unit.tasks.length?unit.tasks.map(task=>`<span class="gm-pill task${task}">Task ${task}</span>${contentPointMaps[task].has(unit.id)?`<span class="gm-pill point task${task}" title="Numbered content point for Task ${task}">CP T${task}-${String(contentPointMaps[task].get(unit.id)).padStart(2,'0')}</span>`:''}`).join(''):'<span class="gm-pill">Route / context</span>';}
  function bankTasks(unit){return BANKABLE.has(unit.decision)?unit.tasks.filter(task=>[8,9,10].includes(task)):[];}
  function visibleBankIds(task){if(state.tab!=='evidence')return state.bank[task].slice();const cutoff=state.evidenceIndex,completed=new Set(state.evidenceCompleted);return state.bank[task].filter(id=>completed.has(id)&&(evidenceIndexById.get(id)??Infinity)<=cutoff);}
  function writingReached(step){return step.task===Number(state.writingTask)?step.index<=state.writingIndex:step.index<=state.writingPositions[step.task];}
  function writingUsedSourceIds(task){return new Set(writingSteps.filter(step=>step.task===task&&step.kind==='source'&&writingReached(step)).map(step=>step.sourceId));}
  function writingBankIds(task){const ids=visibleBankIds(task);if(state.tab==='writing')for(const step of writingSteps)if(step.task===task&&step.kind==='source'&&writingReached(step)&&!ids.includes(step.sourceId))ids.push(step.sourceId);return ids;}
  function renderEvidenceRail(){
    const host=$('#gm-rail-groups');if(!host)return;
    host.innerHTML=[8,9,10].map(task=>{const ids=writingBankIds(task),used=writingUsedSourceIds(task),current=currentWritingStep();return `<details class="gm-rail-task task${task}" ${task===Number(state.writingTask)||state.tab==='evidence'?'open':''}><summary><span>Task ${task}</span><strong>${ids.length} 句</strong></summary><div>${ids.length?ids.map(id=>{const unit=unitById.get(id);if(!unit)return '';return `<article class="gm-rail-item ${used.has(id)?'is-consumed':''} ${state.tab==='writing'&&current?.kind==='source'&&current.sourceId===id?'is-current':''}"><button type="button" data-open-unit="${id}"><strong>${id}</strong><span class="gm-rail-ink">${escape(unit.excerpt)}</span></button></article>`;}).join(''):'<p class="gm-empty">尚未加入證據</p>'}</div></details>`;}).join('');
  }
  function routeHtml(unit){const route=EVIDENCE_ROUTES.get(unit.id);if(!route)return '';return `<div class="gm-source-route ${routeGhostUnit===unit.id?'is-ghost':''}" data-route-unit="${unit.id}"><svg aria-hidden="true"><defs><marker id="gm-route-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z"></path></marker></defs><path class="gm-route-path" pathLength="1" marker-end="url(#gm-route-arrow)"></path></svg><button class="gm-route-callout" data-route-visit="${unit.id}"><span>Source route · exact audited destination</span><strong>第 ${route.page} 頁<br>${escape(route.label)}</strong></button></div>`;}
  function drawCurrentRoute(panel){const route=$('.gm-source-route',panel),unitNode=$('.gm-unit',panel),source=$('.gm-excerpt',panel),callout=$('.gm-route-callout',panel);if(!route||!unitNode||!source||!callout)return;const root=unitNode.getBoundingClientRect(),from=source.getBoundingClientRect(),to=callout.getBoundingClientRect(),svg=$('svg',route),path=$('.gm-route-path',route);Object.assign(svg.style,{top:`${-route.offsetTop}px`,height:`${unitNode.scrollHeight}px`});svg.setAttribute('viewBox',`0 0 ${Math.max(1,root.width)} ${Math.max(1,unitNode.scrollHeight)}`);const x1=from.left-root.left+Math.min(from.width-18,Math.max(18,from.width*.72)),y1=from.bottom-root.top-4,x2=to.left-root.left+Math.min(to.width-22,Math.max(22,to.width*.3)),y2=to.top-root.top+4,curve=Math.max(35,(y2-y1)*.55);path.setAttribute('d',`M ${x1} ${y1} C ${x1} ${y1+curve}, ${x2} ${y2-curve}, ${x2} ${y2}`);route.classList.add(route.classList.contains('is-ghost')?'gm-route-ghost':'gm-route-drawing');if(!route.classList.contains('is-ghost'))afterMotion(path,'animationend',1000,()=>route.classList.remove('gm-route-drawing'));}
  function hasEquivalentBankEvidence(task,unit){const normalized=normalizeEvidence(unit.excerpt);return state.bank[task].some(id=>id===unit.id||normalizeEvidence(unitById.get(id)?.excerpt)===normalized);}
  function commitBankTransfer(unit,task){if(!hasEquivalentBankEvidence(task,unit))state.bank[task].push(unit.id);bankTransfers.delete(`${task}:${unit.id}`);renderEvidenceRail();save();}
  function animateBankTransfer(unit,task){return new Promise(resolve=>{const key=`${task}:${unit.id}`;if(bankTransfers.has(key)||hasEquivalentBankEvidence(task,unit)){resolve();return;}bankTransfers.add(key);const source=nativeTargetForUnit(unit)||$('.gm-excerpt',currentExplorerPanel()),target=$(`.gm-rail-task.task${task} summary`);if(reduceMotion||!source||!target){commitBankTransfer(unit,task);resolve();return;}const from=source.getBoundingClientRect(),to=target.getBoundingClientRect(),clone=document.createElement('div');clone.className=`gm-bank-flight task${task}`;clone.setAttribute('aria-hidden','true');clone.textContent=unit.excerpt;Object.assign(clone.style,{left:`${from.left}px`,top:`${from.top}px`,width:`${Math.min(Math.max(from.width,180),520)}px`,'--flight-x':`${to.left-from.left+Math.min(to.width,120)}px`,'--flight-y':`${to.top-from.top+24}px`});document.body.append(clone);let committed=false;const finish=()=>{if(committed)return;committed=true;clone.remove();commitBankTransfer(unit,task);resolve();};afterMotion(clone,'animationend',700,finish);});}
  async function transferEvidenceUnit(unit){for(const task of bankTasks(unit))await animateBankTransfer(unit,task);}
  function renderExplorer(panel){
    const {list,index,unit}=currentUnit(panel);
    const completed=new Set(state.evidenceCompleted),progress=Math.round(completed.size/list.length*100),tasks=bankTasks(unit),page=sourcePage(unit);
    $('.gm-unit-index',panel).textContent=`${index+1} / ${list.length}`;
    $('.gm-evidence-progress i',panel).style.width=`${progress}%`;$('.gm-reviewed-count',panel).textContent=`${completed.size} 已完成`;
    const jump=$('[data-evidence-jump]',panel);jump.innerHTML=list.map((item,itemIndex)=>`<option value="${itemIndex}" data-unit-id="${item.id}" ${itemIndex===index?'selected':''}>${itemIndex+1}. P${String(sourcePage(item)).padStart(2,'0')} · ${escape(item.excerpt.slice(0,58))}${item.excerpt.length>58?'…':''}</option>`).join('');
    if(routeGhostUnit&&routeGhostUnit!==unit.id)routeGhostUnit=null;
    const cue=unit.audioCue?`<button class="gm-pill" data-seek-unit="${unit.audioCue.index}">🎧 ${formatTime(unit.audioCue.start)} · cue ${unit.audioCue.index+1}</button>`:'';
    const decisionUi=`<div class="gm-decision"><strong>${escape(unit.decision)}</strong><span>${escape(unit.type)}</span></div><div class="gm-prompt-list"><div class="gm-prompt"><h4>1 · 這句在說甚麼</h4><p>${escape(unit.prompts.says||'以原句和上下文辨認資料功能。')}</p></div><div class="gm-prompt"><h4>2 · 這句有甚麼用</h4><p>${escape(unit.prompts.use||'用來判斷來源路線、任務界線或答案內容。')}</p></div><div class="gm-prompt"><h4>3 · 為何是這個決定</h4><p>${escape(unit.prompts.reason||'依任務要求及其他來源核對後作此決定。')}</p></div><div class="gm-prompt"><h4>4 · 答案怎樣處理</h4><p>${escape(unit.prompts.treatment||unit.decision)}</p></div></div>`;
    const excerpt=unit.decision==='不寫入答案'?`<span class="gm-rejected-exact">${escape(unit.excerpt)}</span>`:escape(unit.excerpt),result=tasks.length?`按「下一步」會自動收入 ${tasks.map(task=>`Task ${task}`).join(' + ')} 證據庫。`:`${escape(unit.decision)}：這項只保留閱讀／判斷功能，不會進入證據庫。`;
    const unitNode=$('.gm-unit',panel);unitNode.classList.remove('is-entering','has-stamp');unitNode.innerHTML=`<p class="gm-evidence-source">Data File 第 ${page} 頁 · ${escape(unit.part)} · ${escape(unit.section)}</p><div class="gm-unit-meta"><span class="gm-pill">${unit.id}</span><span class="gm-pill">Type ${unit.typeNumber}</span>${taskPills(unit)}${cue}</div><h3>${escape(unit.heading)}</h3><blockquote class="gm-excerpt">${excerpt}</blockquote>${unit.translation?`<p class="gm-translation" lang="zh-Hant">${escape(unit.translation)}</p>`:''}${decisionUi}<p class="gm-evidence-result ${tasks.length?'is-bankable':'is-reference'}">${result}</p>${routeHtml(unit)}`;
    unitNode.classList.add('is-entering');
    renderEvidenceRail();refreshNativeMarks();updateController();syncNativeSource({scroll:true});requestAnimationFrame(()=>{drawCurrentRoute(panel);trackSpotlight();});
  }

  let playbackCue=null,playbackGuide=null,lastAudioTime=0,audioStopLock=false;
  function listeningJumpOptions(){return `<optgroup label="引導停頓">${listeningGuideSteps.map(step=>`<option value="${step.index}" ${step.index===state.listenIndex?'selected':''}>${step.index+1}. ${escape(step.title)}</option>`).join('')}</optgroup><optgroup label="逐句錄音稿">${listeningTranscriptSteps.map(step=>`<option value="${step.index}" ${step.index===state.listenIndex?'selected':''}>${step.index+1}. Cue ${step.cue+1} · ${escape(listeningData.cues[step.cue].speaker)}</option>`).join('')}</optgroup>`;}
  function listeningTeachingHtml(step){
    if(step.kind==='guide'){const cue=listeningData.cues[step.cue],done=state.listenCompleted.includes(step.id),note=step.noteId?noteDefinitions.find(item=>item.id===step.noteId):null;return `<p class="gm-listen-source">${formatTime(step.from)}–${formatTime(step.end)} · ${escape(cue.speaker)}</p><h3>${escape(step.title)}</h3><p class="gm-listen-lead">${escape(step.lead)}</p><blockquote class="gm-listen-quote">${escape(cue.text)}</blockquote><div class="gm-listen-decision ${note&&['brighthouse','cinema-home','film-budget'].includes(note.id)?'is-task':'is-noise'}"><strong>${escape(step.taskLabel)}</strong><span>${done?'已完整播放至指定句末；可以前往下一步。':'按「播放至停頓點」，系統會由上一個答案終點連續播放並在這句句末停止。'}</span></div>${note?`<p class="gm-listen-field">寫入原卷欄位：<strong>${escape(note.label)}</strong></p>`:'<p class="gm-listen-field"><strong>內容筆記完成。</strong> 下一步開始逐句核對整份錄音稿。</p>'}`;}
    const cue=listeningData.cues[step.cue],labels=step.teaching.length?step.teaching.slice(0,3).map(item=>`<li>${escape(item.id)} · Type ${item.typeNumber} · ${escape(item.decision)}${item.tasks.length?` · Task ${item.tasks.join('/')}`:''}</li>`).join(''):'<li>未映射為作文證據；仍屬完整錄音稿的一部分。</li>',taskPills=step.tasks.map(task=>`<span class="gm-pill task${task}">Task ${task}</span>`).join('');return `<p class="gm-listen-source">${formatTime(cue.start)}–${formatTime(cue.end)} · ${escape(cue.speaker)} · Cue ${cue.index+1}/107</p><h3>${escape(step.title)}</h3><blockquote class="gm-listen-quote ${step.rejected?'is-rejected':''}">${escape(cue.text)}</blockquote>${cueTranslations.has(step.cue)?`<p class="gm-listen-translation" lang="zh-Hant">${escape(cueTranslations.get(step.cue).join('／'))}</p>`:''}<div class="gm-listen-pills">${taskPills||'<span class="gm-pill">Route / context / noise</span>'}</div><ul class="gm-listen-map">${labels}</ul><p class="gm-listen-rule">逐句確認這句的任務歸屬和 answer decision；紅線只在 canonical decision 為「不寫入答案」時出現。</p>`;
  }
  function renderListeningStep({scrollTranscript=false}={}){const step=currentListeningStep(),card=$('[data-listening-card]');if(card)card.innerHTML=`<div class="gm-listen-progress"><strong>${step.index+1} / ${LISTEN_STEP_COUNT}</strong><span><i style="width:${(step.index+1)/LISTEN_STEP_COUNT*100}%"></i></span><small>${LISTEN_GUIDE_COUNT} guided + ${listeningData.cueCount} transcript</small></div><label class="gm-listen-jump">跳至 Stage 3 步驟<select data-listening-jump>${listeningJumpOptions()}</select></label><article class="gm-card gm-listen-card" tabindex="-1"><p class="gm-kicker">Chapter 3 · ${step.kind==='guide'?'guided answer stop':'sentence-by-sentence transcript review'}</p>${listeningTeachingHtml(step)}</article>`;const jump=$('[data-listening-jump]');jump?.addEventListener('change',event=>goListeningStep(Number(event.target.value),{focusTranscript:true}));syncListeningMarks({scrollCurrent:scrollTranscript});updateController();syncNativeSource({scroll:true});requestAnimationFrame(trackSpotlight);}
  function goListeningStep(index,{focusTranscript=false}={}){if(noteTyping)cancelNoteTyping();const audio=$('#gm-audio');audio?.pause();playbackCue=null;playbackGuide=null;state.listenIndex=Math.max(0,Math.min(LISTEN_STEP_COUNT-1,index));const step=currentListeningStep(),time=step.kind==='guide'?step.from:listeningData.cues[step.cue].start;if(audio){audio.currentTime=time;lastAudioTime=time;updateAudioState(audio);}save();renderListeningStep({scrollTranscript:focusTranscript});announce(`Stage 3 step ${state.listenIndex+1} of ${LISTEN_STEP_COUNT}: ${step.title}.`);}
  function renderListening(){
    restoreNativeNoteSheet();
    $('#gm-listen').innerHTML=`<div class="gm-listening-player-bar"><audio id="gm-audio" preload="metadata" crossorigin="anonymous" src="${escape(listeningData.audioUrl)}"></audio><div class="gm-player" aria-label="Authentic recording controls"><button class="gm-icon-btn" data-audio-play aria-label="播放目前步驟">▶</button><button class="gm-btn" data-toggle-pins aria-pressed="false">停頓點</button><label class="gm-player-timeline"><span class="gm-live">錄音進度</span><input type="range" data-audio-seek min="0" max="${listeningData.lastEnd}" step="0.1" value="0"><span class="gm-cue-pins" hidden>${listeningData.cues.map(cue=>`<button type="button" data-pin-cue="${cue.index}" style="--pin:${cue.start/listeningData.lastEnd*100}%" aria-label="Cue ${cue.index+1} · ${formatTime(cue.start)}"></button>`).join('')}</span></label><output class="gm-player-time">0:00 / ${formatTime(listeningData.lastEnd)}</output><label>速度 <select data-audio-rate aria-label="播放速度">${[.5,.75,1,1.25,1.5,1.75,2].map(rate=>`<option value="${rate}" ${rate===state.playbackRate?'selected':''}>${rate}×</option>`).join('')}</select></label><button class="gm-btn" data-open-transcript>完整錄音稿</button></div><div class="gm-now"><strong>Current audio</strong><p>錄音尚未開始。</p></div></div><div data-listening-card></div><div id="gm-native-note-host" class="gm-native-host-note">筆記直接寫在中央原卷第 3 頁；此處不複製 worksheet。</div>`;
    mountNativeNoteSheet();
    const audio=$('#gm-audio');playbackCue=null;playbackGuide=null;const step=currentListeningStep(),initialTime=step.kind==='guide'?step.from:listeningData.cues[step.cue].start;lastAudioTime=initialTime;audio.currentTime=initialTime;audio.playbackRate=state.playbackRate;
    for(const event of ['timeupdate','seeking','seeked','loadedmetadata','ended','play','pause'])audio.addEventListener(event,eventObject=>handleAudioEvent(eventObject,audio));
    $$('[data-pin-cue]').forEach(button=>button.addEventListener('click',()=>playCue(Number(button.dataset.pinCue))));
    $('[data-audio-play]').addEventListener('click',()=>{if(!audio.paused){audio.pause();return;}const activeStep=currentListeningStep();if(activeStep.kind==='guide')playListeningGuide(activeStep);else playCue(activeStep.cue);});
    $('[data-audio-seek]').addEventListener('input',event=>{audio.currentTime=Number(event.target.value);updateAudioState(audio);});
    $('[data-audio-rate]').addEventListener('change',event=>{state.playbackRate=Number(event.target.value);audio.playbackRate=state.playbackRate;save();});
    $('[data-toggle-pins]').addEventListener('click',event=>{const pins=$('.gm-cue-pins');pins.hidden=!pins.hidden;event.currentTarget.setAttribute('aria-pressed',String(!pins.hidden));event.currentTarget.textContent=pins.hidden?'顯示停頓點':'隱藏停頓點';});
    $('[data-open-transcript]').addEventListener('click',openTranscriptWindow);
    renderListeningStep();if(state.tab==='listen'&&state.transcriptOpen)openTranscriptWindow();else $('#gm-transcript-window').hidden=true;
    updateAudioState(audio);
  }
  function playListeningGuide(step){const audio=$('#gm-audio');if(!audio||step.kind!=='guide')return;playbackCue=null;playbackGuide=step;audioStopLock=false;audio.currentTime=step.from;lastAudioTime=step.from;updateAudioState(audio);audio.play().catch(()=>{playbackGuide=null;announce('錄音未能播放；請再按一次播放。');});announce(`Playing guided range to cue ${step.cue+1}: ${step.title}.`);}
  function playCue(index){const audio=$('#gm-audio'),cue=listeningData.cues[index];if(!audio||!cue)return;playbackGuide=null;playbackCue=index;audioStopLock=false;audio.currentTime=cue.start;lastAudioTime=cue.start;updateAudioState(audio);audio.play().catch(()=>{playbackCue=null;announce('錄音未能播放；請再按一次播放。');});announce(`Playing cue ${cue.index+1}: ${cue.text}`);}
  function markHeardRange(from,end){for(const cue of listeningData.cues)if(cue.end>from-.06&&cue.end<=end+.06&&!state.heardCues.includes(cue.index))state.heardCues.push(cue.index);state.heardCues.sort((a,b)=>a-b);}
  function handleAudioEvent(event,audio){
    if(event.type==='seeking'&&audio.currentTime<lastAudioTime-.12){if(noteTyping)cancelNoteTyping({restore:true,reason:'倒帶取消未完成的生成筆記。'});const active=Math.max(0,activeCueIndex(audio.currentTime));state.heardCues=state.heardCues.filter(index=>listeningData.cues[index].end<=audio.currentTime+.05);for(const note of noteDefinitions){if(state.heardCues.includes(note.cue))continue;const generated=state.generatedNotes[note.id];if(generated){state.notes[note.id]=removeExactGeneratedLine(state.notes[note.id],generated);const field=$(`[data-curation-note="${note.id}"]`);if(field)field.value=state.notes[note.id];delete state.generatedNotes[note.id];}}state.noteRevealed=state.noteRevealed.filter(id=>{const note=noteDefinitions.find(item=>item.id===id);return note&&state.heardCues.includes(note.cue);});state.listenCompleted=state.listenCompleted.filter(id=>{const step=listeningSteps.find(item=>item.id===id);return step?.kind==='guide'?step.end<=audio.currentTime+.05:step?.cue<=active;});if(currentListeningStep()?.kind==='transcript')state.listenIndex=LISTEN_GUIDE_COUNT+active;else{const firstIncomplete=listeningGuideSteps.findIndex(step=>step.end>audio.currentTime+.05);if(firstIncomplete>=0)state.listenIndex=Math.min(state.listenIndex,firstIncomplete);}for(const task of [8,9,10])state.bank[task]=state.bank[task].filter(id=>{const unit=unitById.get(id);return !unit?.audioCue||state.heardCues.includes(unit.audioCue.index);});playbackCue=null;playbackGuide=null;save();renderListeningStep({scrollTranscript:true});announce('已倒帶；之後的 guided stop、錄音稿步驟、生成筆記及 audio-evidence state 已重建，獨立手寫內容保留。');}
    if(playbackGuide&&!audioStopLock&&audio.currentTime>=playbackGuide.end-.06){audioStopLock=true;const completed=playbackGuide;audio.pause();audio.currentTime=completed.end;markHeardRange(completed.from,completed.end);if(!state.listenCompleted.includes(completed.id))state.listenCompleted.push(completed.id);playbackGuide=null;save();renderListeningStep();announce(`Guided stop ${completed.index+1} completed at ${formatTime(completed.end)}.`);if(completed.noteId)setTimeout(()=>typeSuggestedNote(completed.noteId),0);audioStopLock=false;}
    if(playbackCue!==null&&!audioStopLock){const completedIndex=playbackCue,cue=listeningData.cues[completedIndex];if(audio.currentTime>=cue.end-.06){audioStopLock=true;audio.pause();audio.currentTime=cue.end;if(!state.heardCues.includes(completedIndex))state.heardCues.push(completedIndex);state.heardCues.sort((a,b)=>a-b);playbackCue=null;save();announce(`Cue ${cue.index+1} completed and stopped at ${formatTime(cue.end)}.`);const note=noteDefinitions.find(item=>item.cue===completedIndex);if(note)setTimeout(()=>typeSuggestedNote(note.id),0);audioStopLock=false;}}
    if(event.type==='ended'){for(const cue of listeningData.cues)if(cue.end<=audio.currentTime+.05&&!state.heardCues.includes(cue.index))state.heardCues.push(cue.index);state.heardCues.sort((a,b)=>a-b);save();}
    lastAudioTime=audio.currentTime;updateAudioState(audio);
  }
  function activeCueIndex(time){let result=-1;for(const cue of listeningData.cues){if(cue.start<=time)result=cue.index;else break;}return result;}
  function updateAudioState(audio){
    const active=activeCueIndex(audio.currentTime);const cue=listeningData.cues[active];
    const now=$('.gm-now p');if(now)now.textContent=cue?`${formatTime(cue.start)} · ${cue.speaker}: ${cue.text}`:'錄音尚未開始。';
    for(const note of noteDefinitions){const card=$(`[data-note-card="${note.id}"]`);const heard=state.heardCues.includes(note.cue),generated=Boolean(state.generatedNotes[note.id]);card.classList.toggle('is-heard',heard);card.classList.toggle('is-revealed',heard&&state.noteRevealed.includes(note.id));const reveal=$(`[data-reveal-note="${note.id}"]`);reveal.disabled=!heard||noteTyping?.id===note.id;reveal.textContent=generated?'已寫入（重播不重複）':noteTyping?.id===note.id?'正在寫入…':'寫入建議筆記';}
    const play=$('[data-audio-play]');if(play){play.textContent=audio.paused?'▶':'❚❚';play.setAttribute('aria-label',audio.paused?'播放目前 cue':'暫停錄音');}
    const seek=$('[data-audio-seek]');if(seek){seek.max=String(Number.isFinite(audio.duration)?audio.duration:listeningData.lastEnd);seek.value=String(Math.min(audio.currentTime,Number(seek.max)));}
    const time=$('.gm-player-time');if(time)time.textContent=`${formatTime(audio.currentTime)} / ${formatTime(audio.duration||listeningData.lastEnd)}`;
    $$('[data-pin-cue]').forEach((pin,index)=>pin.classList.toggle('is-heard',state.heardCues.includes(index)));
    $$('.gm-floating-cue').forEach((section,index)=>{section.classList.toggle('is-active',index===active);section.classList.toggle('is-heard',state.heardCues.includes(index));});syncListeningMarks();
    shell.dataset.activeCue=String(active);
    updateController();
  }

  function renderEvidence(){explorerLayout($('#gm-evidence'),'evidence');}
  function renderCategorize(){
    const panel=$('#gm-categorize'),step=currentCategoryStep(),completed=state.categoryCompleted.length,progress=Math.round(completed/categorySteps.length*100);
    if(!step)return;
    const jump=`<label class="gm-category-jump">跳至步驟 <select data-category-jump aria-label="跳至資料分類步驟">${categorySteps.map(item=>`<option value="${item.index}" ${item.index===step.index?'selected':''}>${item.index+1} / ${categorySteps.length} · ${escape(item.title)}</option>`).join('')}</select></label>`;
    let teaching='';
    if(step.kind==='page'){
      const selected=selectedCategoryTasks(step);
      teaching=`<p class="gm-category-lead">${escape(step.entry.initial)}</p><p>先作暫定標記；讀到新的決定後再修正。分類是會更新的工作假設。</p><button class="gm-btn gm-category-revision-toggle" data-category-revision aria-expanded="false">顯示讀後修正</button><p class="gm-category-revision" hidden><strong>讀後分類：${step.entry.tasks.map(task=>`Task ${task}`).join(' + ')}</strong><br>${escape(step.entry.revision)}</p><fieldset class="gm-category-page-choices"><legend>你會先標哪個任務？</legend>${[8,9,10].map(task=>`<label><input type="checkbox" data-category-page-task="${task}" ${selected.includes(task)?'checked':''}> Task ${task}</label>`).join('')}</fieldset>`;
    }else{
      const task=step.entry.task;
      teaching=`<p class="gm-category-lead">${escape(step.entry.help)}</p><div class="gm-category-note-decision ${step.entry.kind==='noise'?'is-noise':`task${task}`}"><strong>${step.entry.kind==='noise'?'Type 6 · 不供三篇作文取證':`Task ${task}`}</strong><span>${step.entry.kind==='noise'?'紅線只表示這欄不進三篇 B2 作文；聆聽筆記仍要完成。':`這一步才在筆記表加 ${categoryTaskLetter[task]}／Task ${task} 標記。`}</span></div>`;
    }
    panel.innerHTML=`<div class="gm-category-progress"><strong>${step.index+1} / ${categorySteps.length}</strong><span><i style="width:${progress}%"></i></span><small>${completed} 已完成</small></div>${jump}<article class="gm-card gm-category-card" tabindex="-1" data-category-kind="${step.kind}" data-category-id="${step.id}"><p class="gm-kicker">Chapter 2 · classify before extraction</p><p class="gm-category-source">Data File 第 ${step.page} 頁${step.kind==='note'?' · 聆聽筆記表欄目':' · 文件標題'}</p><h3>${escape(step.title)}</h3>${teaching}<p class="gm-category-rule">這一章只建立來源路線，不抽取 evidence；逐句內容留待 Stage 4。</p></article>`;
    syncCategoryMarks();updateController();syncNativeSource({scroll:true});requestAnimationFrame(trackSpotlight);
  }

  function markedModelHtml(text,guide,task){
    const ranges=[],lower=text.toLocaleLowerCase();
    for(const [kind,phrases] of [['keyword',guide?.keywords||[]],['structure',guide?.patterns||[]]])for(const phrase of phrases){const start=lower.indexOf(String(phrase).toLocaleLowerCase());if(start>=0)ranges.push({start,end:start+String(phrase).length,kind});}
    const boundaries=[...new Set([0,text.length,...ranges.flatMap(range=>[range.start,range.end])])].sort((a,b)=>a-b);let html='';
    for(let index=0;index<boundaries.length-1;index+=1){const start=boundaries[index],end=boundaries[index+1],segment=escape(text.slice(start,end)),classes=[];if(ranges.some(range=>range.kind==='keyword'&&range.start<=start&&range.end>=end))classes.push('gm-model-keyword',`task${task}`);if(ranges.some(range=>range.kind==='structure'&&range.start<=start&&range.end>=end))classes.push('gm-model-structure');html+=classes.length?`<mark class="${classes.join(' ')}">${segment}</mark>`:segment;}
    return html;
  }
  function currentTeachingUnit(step=currentWritingStep()){if(!step)return null;if(step.kind==='model')return step;return writingSteps.find(item=>item.id===step.teachingId)||null;}
  function renderWritingPractice(step){
    const task=step.task,info=tasks[task],model=modelData.tasks[task],position=state.writingPositions[task],showModel=position>=writingTaskBounds[task].modelFirst,currentUnit=currentTeachingUnit(step);
    const taskTabs=`<nav class="gm-practice-tabs" role="tablist" aria-label="Writing task practice">${[8,9,10].map(number=>`<button type="button" role="tab" data-writing-task="${number}" aria-selected="${number===task}">Task ${number}</button>`).join('')}</nav>`;
    const modelUnits=writingTeachingUnits[task].map(unit=>{const revealed=unit.index<=position,current=unit.id===currentUnit?.id,tag=unit.modelKind==='title'?'h2':unit.modelKind==='heading'?'h3':'p';return `<${tag} class="gm-practice-unit gm-practice-${unit.modelKind} ${revealed?'is-revealed':''} ${current?'is-current':''}" data-writing-unit="${unit.id}" ${revealed?'':`hidden aria-hidden="true"`}>${markedModelHtml(unit.text,unit.guide,task)}</${tag}>`;}).join('');
    writingPractice.innerHTML=`${taskTabs}<article class="gm-practice-paper task${task}"><header><span>PP Writing Practice · Task ${task}</span><strong>${escape(info.genre)} · target ${escape(info.words)}</strong></header><section class="gm-practice-contract"><p class="gm-kicker">Authentic 2019 task</p><h2>${escape(info.name)}</h2><p>${escape(info.purpose)}</p><small>${escape(info.audience)} · ${escape(info.sources)}</small></section><details class="gm-draft-workspace" ${showModel?'':'open'}><summary>自己的寫作準備</summary><label><strong>Plan／selection table</strong><textarea data-writing-plan="${task}" rows="6" placeholder="列出內容點、來源和段落功能…">${escape(state.plans[task])}</textarea></label><label><strong>Your independent draft</strong><textarea data-writing-draft="${task}" rows="14" spellcheck="true" placeholder="先寫自己的完整版本…">${escape(state.drafts[task])}</textarea></label><div class="gm-practice-actions"><span data-writing-count>${wordCount(state.drafts[task])} words · target ${escape(info.words)}</span><button type="button" data-copy-qab="${task}">複製到 QAB</button><button type="button" data-native-page="${info.page}">看原題</button></div></details><details class="gm-benchmark" ${showModel?'open':''}><summary>Revised benchmark essay · ${writingTeachingUnits[task].length} teaching units</summary><article class="gm-benchmark-copy" lang="en">${showModel?modelUnits:'<p class="gm-model-gate">完成四個寫作準備步驟後，benchmark 會由標題開始逐項顯示。</p>'}</article>${showModel?`<aside class="gm-prohibited"><strong>Do not claim:</strong><ul>${model.prohibited.map(item=>`<li>${escape(item)}</li>`).join('')}</ul></aside>`:''}</details></article>`;
    const plan=$(`[data-writing-plan="${task}"]`,writingPractice),draft=$(`[data-writing-draft="${task}"]`,writingPractice);plan?.addEventListener('input',()=>{state.plans[task]=plan.value;save();});draft?.addEventListener('input',()=>{state.drafts[task]=draft.value;const count=$('[data-writing-count]',writingPractice);if(count)count.textContent=`${wordCount(draft.value)} words · target ${info.words}`;save();});
  }
  function renderWriting(){
    const step=currentWritingStep(),task=step.task,bounds=writingTaskBounds[task],taskPosition=step.index-bounds.first+1,taskLength=bounds.last-bounds.first+1;
    const tabs=`<div class="gm-writing-task-tabs" role="tablist" aria-label="Writing tasks">${[8,9,10].map(number=>`<button class="gm-btn" role="tab" data-writing-task="${number}" aria-selected="${number===task}">Task ${number}</button>`).join('')}</div>`;
    let body='';
    if(step.kind==='prep')body=`<p class="gm-kicker">Chapter 5 · draft before model</p><p class="gm-writing-source">PP Writing Practice · Task ${task}</p><h3>${escape(step.title)}</h3><blockquote class="gm-excerpt">${escape(step.quote)}</blockquote><p class="gm-writing-why">${escape(step.lead)}</p><p>${escape(step.hint)}</p>${step.prepIndex===2?'<p class="gm-writing-caution">先獨立寫草稿；右側證據庫只供核對內容點。</p>':''}`;
    else if(step.kind==='model')body=`<p class="gm-kicker">Chapter 5 · sentence-level teaching</p><p class="gm-writing-source">Task ${task} 參考範文 · 第 ${step.modelOrdinal} / ${writingTeachingUnits[task].length} 項</p><h3>${escape(step.title)}</h3><blockquote class="gm-excerpt">${escape(step.text)}</blockquote><p class="gm-writing-why"><strong>為何這樣寫：</strong>${escape(step.guide.why)}</p><p class="gm-writing-structure"><strong>可重用句式：</strong>${escape(step.guide.structure)}</p><p>${step.sources.length?`這一項使用 ${step.sources.length} 個來源點；下一步會逐一核對 evidence bank 和原文。`:'這一項服務文類、段落組織或語氣，不新增事實證據。'}</p>`;
    else if(step.kind==='source')body=`<p class="gm-kicker">Chapter 5 · evidence consumption</p><p class="gm-writing-source">${step.source.audioCue?'錄音稿':`Data File 第 ${step.page} 頁`} · ${escape(step.sourceId)}</p><h3>核對原文 · ${step.sourceIndex+1}/${currentTeachingUnit(step).sources.length}</h3><blockquote class="gm-excerpt">${escape(step.source.excerpt)}</blockquote><p class="gm-writing-why">右側證據列以紅線標示已用；浮動原文以海軍藍線標示取用，和 Type 6 淘汰紅線分開。</p><p>${escape(step.guide.why)}</p>`;
    else body=`<p class="gm-kicker">Chapter 5 · return to model</p><p class="gm-writing-source">Task ${task} 參考範文 · 第 ${step.modelOrdinal} 項</p><h3>已回到範文</h3><blockquote class="gm-excerpt">${escape(currentTeachingUnit(step).text)}</blockquote><p class="gm-writing-structure"><strong>可重用句式：</strong>${escape(step.guide.structure)}</p><p>剛才的來源仍保留在 evidence bank；下一步繼續這句的下一個來源或下一個範文單位。</p>`;
    $('#gm-writing').innerHTML=`${tabs}<div class="gm-writing-progress"><strong>${step.index+1} / ${writingSteps.length}</strong><span><i style="width:${Math.round((step.index+1)/writingSteps.length*100)}%"></i></span><small>Task ${task} · ${taskPosition}/${taskLength}</small></div><article class="gm-card gm-writing-step" data-writing-kind="${step.kind}" tabindex="-1">${body}</article>`;
    renderWritingPractice(step);writingPractice.hidden=state.tab!=='writing';
    if(step.kind==='source')openModelPreview([step.sourceId]);else closeModelPreview();
    renderEvidenceRail();updateController();syncNativeSource({scroll:false});requestAnimationFrame(()=>{syncNativeSource({scroll:true});});
  }
  function goWritingIndex(index,{rewind=true}={}){const previous=currentWritingStep(),next=writingSteps[Math.max(0,Math.min(writingSteps.length-1,index))];if(!next)return;if(rewind&&previous.task===next.task&&next.index<state.writingPositions[next.task])state.writingCompleted=state.writingCompleted.filter(id=>{const item=writingSteps.find(step=>step.id===id);return !item||item.task!==next.task||item.index<=next.index;});state.writingTask=next.task;state.writingIndex=next.index;state.writingPositions[next.task]=next.index;save();renderWriting();announce(`Stage 5 unit ${next.index+1} of ${writingSteps.length} · Task ${next.task}.`);}

  function renderAll(){renderContracts();renderCategorize();renderListening();renderEvidence();renderWriting();renderEvidenceRail();$('#gm-slot').value=activeSlot;$('#gm-question-draft').value=state.questionDraft;setTab(state.tab,false);addPageBadges();syncCategoryMarks();updateController();}
  function setTab(tab,focus=true){
    if(!['contracts','categorize','listen','evidence','writing'].includes(tab))tab='contracts';state.tab=tab;document.body.dataset.gmCurationTab=tab;save();
    $$('.gm-tab').forEach(button=>{const selected=button.dataset.tab===tab;button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1;});
    $$('.gm-panel').forEach(panel=>panel.hidden=panel.dataset.panel!==tab);writingPractice.hidden=tab!=='writing';if(tab==='writing')renderWriting();syncCategoryMarks();refreshNativeMarks();
    if(tab!=='listen'){if(noteTyping)cancelNoteTyping();restoreNativeNoteSheet();$('#gm-transcript-window').hidden=true;$('#gm-audio')?.pause();}else{mountNativeNoteSheet();if(state.transcriptOpen)openTranscriptWindow();}
    if(!['writing','evidence'].includes(tab))closeModelPreview();
    if(!['categorize','evidence'].includes(tab))routeGhostUnit=null;const activePanel=$(`.gm-panel[data-panel="${tab}"]`);animateArrival(activePanel);if(focus)$(`.gm-tab[data-tab="${tab}"]`).focus();announce(`Opened chapter ${tab}`);updateController();renderEvidenceRail();syncNativeSource({scroll:true});requestAnimationFrame(()=>{syncNativeSource({scroll:true});trackSpotlight();});
  }
  function setWritingTask(task){const number=Number(task);if(!writingTaskBounds[number])return;state.writingTask=number;state.writingIndex=state.writingPositions[number]??writingTaskBounds[number].first;save();renderWriting();announce(`Task ${number} writing workspace · saved position restored.`);}
  function jumpPage(page,openScan=false){
    state.returnRoute={tab:state.tab,unitId:state.unitId,evidenceIndex:state.evidenceIndex,writingTask:state.writingTask,label:state.tab==='writing'?`Task ${state.writingTask} writing`:state.tab};save();
    suspendSpotlight();
    if(page===3)restoreNativeNoteSheet();
    $$('.gm-page-target').forEach(node=>node.classList.remove('gm-page-target'));
    const target=$(`#page-${page}`);if(!target)return;
    target.classList.add('gm-page-target');
    if(openScan){const details=$('.reference-scan',target);if(details)details.open=true;}
    scrollInstant(target);updateController();announce(`Original page ${page} · use the fixed return control to resume.`);
  }
  function visitSourceRoute(unit){const route=EVIDENCE_ROUTES.get(unit.id);if(!route)return;state.returnRoute={tab:state.tab,unitId:unit.id,evidenceIndex:state.evidenceIndex,writingTask:state.writingTask,label:`${unit.id} route`,sourceRoute:true,page:route.page};save();suspendSpotlight();restoreNativeNoteSheet();const target=$(route.selector)||$(`#page-${route.page}`);if(!target){state.returnRoute=null;save();announce(`${unit.id} destination is unavailable; the route clue remains visible for manual navigation.`);return;}$$('.gm-page-target').forEach(node=>node.classList.remove('gm-page-target'));target.classList.add('gm-page-target');scrollInstant(target);updateController();announce(`Visited exact audited destination P${route.page} · ${route.label} for ${unit.id}.`);}
  function returnToCuration(){const route=state.returnRoute;if(!route)return;state.returnRoute=null;if(Number.isInteger(route.evidenceIndex))state.evidenceIndex=Math.max(0,Math.min(evidenceUnits.length-1,route.evidenceIndex));if(route.unitId&&evidenceIds.has(route.unitId))state.unitId=route.unitId;if([8,9,10].includes(Number(route.writingTask)))state.writingTask=Number(route.writingTask);routeGhostUnit=route.sourceRoute?route.unitId:null;setTab(route.tab||'contracts',false);if(state.tab==='writing')renderWriting();else if(state.tab==='categorize')renderCategorize();else if(state.tab==='evidence')renderEvidence();save();requestAnimationFrame(()=>syncNativeSource({scroll:true}));updateController();announce(route.sourceRoute?'Returned to the exact route origin; route remains as a 0.16 ghost.':'Returned to the exact Super Curation context.');}
  function addPageBadges(){
    for(let page=1;page<=19;page+=1){const header=$(`#page-${page}>header`);if(!header||$('.gm-page-badges',header))continue;const pageUnits=units.filter(unit=>sourcePage(unit)===page);const taskSet=new Set(pageUnits.flatMap(unit=>unit.tasks));const wrap=document.createElement('span');wrap.className='gm-page-badges';wrap.innerHTML=`<span class="gm-page-badge">${pageUnits.length} units</span>${[8,9,10].filter(task=>taskSet.has(task)).map(task=>`<span class="gm-page-badge t${task}">T${task}</span>`).join('')}`;header.append(wrap);}
  }
  function refreshNativeMarks(){
    const current=evidenceUnits[state.evidenceIndex]?.id,cutoff=state.evidenceIndex;
    const evidenceActive=state.tab==='evidence',writingActive=state.tab==='writing';
    $$('mark[data-unit]').forEach(mark=>{if(mark.classList.contains('gm-contract-mark')&&!evidenceActive&&!writingActive)return;const index=evidenceIndexById.get(mark.dataset.unit),visible=state.categoryRevealed.includes(mark.dataset.unit)||(index!=null&&((evidenceActive&&index<=cutoff&&(mark.dataset.unit===current||state.evidenceCompleted.includes(mark.dataset.unit)))||(writingActive&&state.evidenceCompleted.includes(mark.dataset.unit))));mark.classList.toggle('is-revealed',visible);});
  }
  function markNativePhrases(){
    let marked=0;
    for(const unit of evidenceUnits.filter(item=>sourcePage(item)!==4&&item.typeNumber>=1&&item.typeNumber<=6)){
      const phrase=unit.excerpt.replace(/[\[\]*]/g,'').replace(/^“|”$/g,'').trim();if(phrase.length<8||phrase.includes('...'))continue;
      const candidates=$$(`#page-${sourcePage(unit)} [lang="en"]`).filter(node=>!node.closest('.translation'));
      for(const candidate of candidates){
        const text=candidate.textContent;const start=text.toLocaleLowerCase().indexOf(phrase.toLocaleLowerCase());if(start<0)continue;
        const taskLabel=unit.tasks.length?unit.tasks.map(task=>`T${task}`).join(' · '):'route';candidate.classList.add('gm-source-paragraph');candidate.dataset.gmTasks=[...new Set([...(candidate.dataset.gmTasks||'').split(' · ').filter(Boolean),...taskLabel.split(' · ')])].join(' · ');candidate.setAttribute('aria-label',`${candidate.dataset.gmTasks} source paragraph: ${text.trim()}`);
        const walker=document.createTreeWalker(candidate,NodeFilter.SHOW_TEXT);const nodes=[];let node,offset=0;
        while((node=walker.nextNode())){nodes.push({node,start:offset,end:offset+node.length});offset+=node.length;}
        const first=nodes.find(item=>item.end>start);const last=nodes.find(item=>item.end>=start+phrase.length);if(!first||!last)continue;
        const range=document.createRange();range.setStart(first.node,start-first.start);range.setEnd(last.node,start+phrase.length-last.start);
        if($$('.gm-source-mark',candidate).some(existing=>range.intersectsNode(existing))){range.detach();continue;}
        const mark=document.createElement('mark');mark.className=`gm-source-mark gm-source-mark-t${unit.tasks[0]||0} gm-source-mark-type${unit.typeNumber} ${unit.decision==='不寫入答案'?'gm-source-mark-rejected':''}`;mark.dataset.unit=unit.id;mark.title=`${unit.id} · ${unit.decision}`;mark.classList.toggle('is-revealed',state.categoryRevealed.includes(unit.id)||(state.tab==='evidence'&&(unit.id===evidenceUnits[state.evidenceIndex]?.id||state.evidenceCompleted.includes(unit.id)))||(state.tab==='writing'&&state.evidenceCompleted.includes(unit.id)));
        try{mark.append(range.extractContents());range.insertNode(mark);marked+=1;}catch{}
        break;
      }
    }
    return marked;
  }
  function currentExplorerPanel(){return state.tab==='evidence'?$('#gm-evidence'):null;}
  function goUnit(direction){goEvidenceIndex(state.evidenceIndex+(direction==='next'?1:-1));}
  function openUnit(id){const unit=unitById.get(id);if(!unit)return;const evidenceIndex=evidenceIndexById.get(id);if(evidenceIndex!=null){state.evidenceIndex=evidenceIndex;state.unitId=id;setTab('evidence');renderEvidence();$('#gm-evidence .gm-unit')?.focus();return;}if(unit.audioCue){state.listenIndex=LISTEN_GUIDE_COUNT+unit.audioCue.index;setTab('listen');goListeningStep(state.listenIndex,{focusTranscript:true});return;}const contract=contractSteps.findIndex(step=>step.sourceIds?.includes(id)||step.sourceId===id);if(contract>=0){state.contractIndex=contract;setTab('contracts');renderContracts();syncNativeSource({scroll:true});return;}jumpPage(sourcePage(unit));}
  function completeTab(tab){if(!state.completedTabs.includes(tab))state.completedTabs.push(tab);save();}
  async function controllerNext(){
    if(state.tab==='contracts'){if(state.contractIndex<contractSteps.length-1){state.contractIndex+=1;save();renderContracts();updateController();syncNativeSource({scroll:true});trackSpotlight();announce(`Stage 1 unit ${state.contractIndex+1} of ${contractSteps.length}.`);return;}completeTab('contracts');setTab('categorize');return;}
    if(state.tab==='categorize'){const step=currentCategoryStep();if(step&&!state.categoryCompleted.includes(step.id))state.categoryCompleted.push(step.id);if(state.categoryIndex<categorySteps.length-1){state.categoryIndex+=1;save();renderCategorize();announce(`Stage 2 unit ${state.categoryIndex+1} of ${categorySteps.length}.`);return;}completeTab('categorize');setTab('listen');return;}
    if(state.tab==='evidence'){if(bankTransfers.has('stage4-transaction'))return;bankTransfers.add('stage4-transaction');const nextButton=$('#gm-next-step');nextButton.disabled=true;nextButton.setAttribute('aria-busy','true');try{const {list,index,unit}=currentUnit();await transferEvidenceUnit(unit);if(!state.evidenceCompleted.includes(unit.id))state.evidenceCompleted.push(unit.id);save();if(index<list.length-1){goEvidenceIndex(index+1);return;}const missing=list.find(item=>!state.evidenceCompleted.includes(item.id));if(missing){goEvidenceIndex(evidenceIndexById.get(missing.id));announce(`Stage 4 尚有未完成步驟：${state.evidenceIndex+1}/${evidenceUnits.length}。跳步不會冒充完成。`);return;}completeTab('evidence');setTab('writing');}finally{bankTransfers.delete('stage4-transaction');nextButton.disabled=false;nextButton.removeAttribute('aria-busy');}return;}
    if(state.tab==='listen'){const step=currentListeningStep();if(noteTyping)return;if(step.kind==='guide'&&!state.listenCompleted.includes(step.id)){playListeningGuide(step);return;}if(step.kind==='transcript'&&!state.listenCompleted.includes(step.id))state.listenCompleted.push(step.id);if(state.listenIndex<LISTEN_STEP_COUNT-1){goListeningStep(state.listenIndex+1,{focusTranscript:true});return;}const missing=listeningSteps.find(item=>!state.listenCompleted.includes(item.id));if(missing){save();goListeningStep(missing.index,{focusTranscript:true});announce(`Stage 3 still has an incomplete step: ${missing.index+1}/${LISTEN_STEP_COUNT}.`);return;}completeTab('listen');save();setTab('evidence');return;}
    if(state.tab==='writing'){const step=currentWritingStep();if(!state.writingCompleted.includes(step.id))state.writingCompleted.push(step.id);save();if(step.index<writingSteps.length-1){goWritingIndex(step.index+1,{rewind:false});return;}const missing=writingSteps.find(item=>!state.writingCompleted.includes(item.id));if(missing){goWritingIndex(missing.index,{rewind:false});announce(`Stage 5 尚有未完成步驟：${missing.index+1}/${writingSteps.length}。跳步不會冒充完成。`);return;}completeTab('writing');renderWriting();announce(`三項寫作已完成：${writingSteps.length}/${writingSteps.length}。`);}
  }
  function controllerPrev(){
    if(state.tab==='contracts'){if(state.contractIndex>0){state.contractIndex-=1;save();renderContracts();updateController();syncNativeSource({scroll:true});trackSpotlight();announce(`Stage 1 unit ${state.contractIndex+1} of ${contractSteps.length}.`);}return;}
    if(state.tab==='categorize'){if(state.categoryIndex>0){state.categoryIndex-=1;save();renderCategorize();announce(`Stage 2 unit ${state.categoryIndex+1} of ${categorySteps.length}.`);return;}setTab('contracts');return;}
    if(state.tab==='evidence'){const {index}=currentUnit();if(index>0){goEvidenceIndex(index-1);return;}setTab('listen');return;}
    if(state.tab==='listen'){if(state.listenIndex>0){goListeningStep(state.listenIndex-1,{focusTranscript:true});return;}setTab('categorize');return;}
    if(state.tab==='writing'){if(state.writingIndex>0){goWritingIndex(state.writingIndex-1);return;}setTab('evidence');}
  }
  function navigateBookmark(key){if(!key)return;const [kind,value]=key.split(':');if(kind==='categorize'){const index=categorySteps.findIndex(step=>step.id===value);if(index>=0)state.categoryIndex=index;setTab('categorize');renderCategorize();}
    else if(kind==='evidence'){const index=evidenceIndexById.get(value);if(index!=null)state.evidenceIndex=index;state.unitId=evidenceUnits[state.evidenceIndex].id;setTab('evidence');renderEvidence();}
    else if(kind==='listen'){const index=listeningSteps.findIndex(step=>step.id===value);if(index>=0)state.listenIndex=index;setTab('listen');goListeningStep(state.listenIndex,{focusTranscript:true});}
    else if(kind==='writing'){const step=writingSteps.find(item=>item.id===value);if(step){state.writingTask=step.task;state.writingIndex=step.index;state.writingPositions[step.task]=step.index;}else if([8,9,10].includes(Number(value)))setWritingTask(Number(value));setTab('writing');}else if(kind==='contracts'){state.contractIndex=Math.max(0,Math.min(contractSteps.length-1,Number(value)||0));renderContracts();setTab('contracts');}else setTab('contracts');save();}
  function openHelp(){const help={contracts:'依 Ringo 電郵的原文順序閱讀 27 個單位：19 個 boss-email 單位加八次即時來源探訪。顏色只標示任務或來源；圈號才是指定內容點；Type 6 紅線表示不寫入答案。',categorize:'依文件標題先做 8 個 page-level 暫定分類，再逐項判讀聆聽筆記表的 8 個欄目。跨任務頁會在「讀後修正」追加標記；這一章不提前抽取句子。',listen:'先完成 7 個 guided answer stops：連續播放會在指定句末自動停止，並把純錄音證據寫進原卷欄位。之後按原序逐句核對 107 個 transcript cues。跳步不冒充已聽或已完成；倒帶會重建之後的錄音狀態。',evidence:'按原卷第 4–11 頁完成 235 個 Data File 單位。跳步只改變目前畫面；按「下一步」才記錄完成並把「獨立寫入／合併寫入／只保留結論」自動收入正確 Task 證據庫。拒絕、被更新、metadata 和 route 單位不會入庫。',writing:`依 2019 真實模型完成 ${writingSteps.length} 個固定步驟：12 個寫作準備、47 個範文教學單位、111 次精確來源探訪和 111 次返回。內容詞用任務色，句式用淡紫色；證據庫紅線表示範文已用，浮動原文海軍藍線表示取用。`};$('#gm-help-content').innerHTML=`<p>${help[state.tab]}</p><p><strong>目前位置：</strong> ${escape($('#gm-step-status').textContent)}</p>`;$('#gm-question-draft').value=state.questionDraft;const dialog=$('#gm-help-dialog');if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');}
  function switchSlot(next){save();activeSlot=String(next);state=sanitizeState(slots[activeSlot]);renderAll();$('#gm-save-status').textContent=`Slot ${activeSlot} · 已切換並自動儲存`;announce(`Switched to save slot ${activeSlot}.`);}
  function exportSlot(){save();const payload={format:'edmund-paper3-curation-save',version:VERSION,year:2019,level:'B2',slot:activeSlot,createdAt:new Date().toISOString(),state:sanitizeState(state)};const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));const anchor=document.createElement('a');anchor.href=url;anchor.download=`paper3-2019-b2-curation-slot-${activeSlot}.json`;anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  async function importSlot(file){try{if(!file||file.size>1024*1024)throw Error('存檔缺失或超過 1 MB');const payload=JSON.parse(await file.text());if(payload?.format!=='edmund-paper3-curation-save'||payload.version!==VERSION||payload.year!==2019||String(payload.level).toUpperCase()!=='B2'||!payload.state||typeof payload.state!=='object')throw Error('這不是 2019 B2 v8 的有效存檔');state=sanitizeState(payload.state);save();renderAll();$('#gm-save-status').textContent=`已驗證並匯入至 Slot ${activeSlot}`;}catch(error){$('#gm-save-status').textContent=`匯入失敗：${error.message}`;}}

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
    const categoryRevision=event.target.closest('[data-category-revision]');if(categoryRevision){const revision=$('.gm-category-revision',$('#gm-categorize')),expanded=categoryRevision.getAttribute('aria-expanded')!=='true';categoryRevision.setAttribute('aria-expanded',String(expanded));categoryRevision.textContent=expanded?'隱藏讀後修正':'顯示讀後修正';if(revision)revision.hidden=!expanded;return;}
    const categoryPageTask=event.target.closest('[data-category-page-task]');if(categoryPageTask){const step=currentCategoryStep();if(step?.kind!=='page')return;const task=Number(categoryPageTask.dataset.categoryPageTask),selected=new Set(selectedCategoryTasks(step));categoryPageTask.checked?selected.add(task):selected.delete(task);state.categories[step.id]=[...selected].sort((a,b)=>a-b);save();syncCategoryMarks(categoryPageTask.checked?{page:step.page,task}:null);announce(`第 ${step.page} 頁暫定分類更新為 ${state.categories[step.id].length?state.categories[step.id].map(value=>`Task ${value}`).join(' + '):'未分類'}。`);return;}
    const start=event.target.closest('[data-start-task]');if(start){setWritingTask(start.dataset.startTask);setTab('writing');return;}
    const native=event.target.closest('[data-native-page]');if(native){jumpPage(Number(native.dataset.nativePage));return;}
    const evidenceTask=event.target.closest('[data-evidence-task]');if(evidenceTask){const task=Number(evidenceTask.dataset.evidenceTask),index=evidenceUnits.findIndex(unit=>unit.tasks.includes(task));if(index>=0)goEvidenceIndex(index);return;}
    const seek=event.target.closest('[data-seek-unit]');if(seek){setTab('listen');playCue(Number(seek.dataset.seekUnit));return;}
    const reveal=event.target.closest('[data-reveal-note]');if(reveal&&!reveal.disabled){typeSuggestedNote(reveal.dataset.revealNote);return;}
    const routeVisit=event.target.closest('[data-route-visit]');if(routeVisit){const unit=unitById.get(routeVisit.dataset.routeVisit);if(unit)visitSourceRoute(unit);return;}
    const writingTask=event.target.closest('[data-writing-task]');if(writingTask){setWritingTask(writingTask.dataset.writingTask);return;}
    const previewSource=event.target.closest('[data-preview-source]');if(previewSource){renderModelPreview(previewSource.dataset.previewSource);return;}
    const open=event.target.closest('[data-open-unit]');if(open){openUnit(open.dataset.openUnit);return;}
    const copy=event.target.closest('[data-copy-qab]');if(copy){const task=Number(copy.dataset.copyQab);const target=$(`#answer-${tasks[task].page}`);if(target){target.value=state.drafts[task];target.dispatchEvent(new Event('input',{bubbles:true}));jumpPage(tasks[task].page);announce(`Task ${task} draft copied to Question-Answer Book page`);}return;}
    const closeWindow=event.target.closest('[data-close-window]');if(closeWindow){closeWindow.dataset.closeWindow==='transcript'?closeTranscriptWindow():closeModelPreview();return;}
    const translationToggle=event.target.closest('[data-toggle-translation]');if(translationToggle){const windowNode=$('#gm-transcript-window'),show=windowNode.classList.toggle('show-translation');translationToggle.setAttribute('aria-pressed',String(show));translationToggle.textContent=show?'隱藏中文':'中文對照';return;}
    if(event.target.closest('#gm-reset')){if(confirm(`只重設 2019 B2 Super Curation Slot ${activeSlot} 的進度、筆記、證據庫和草稿？其他 slots 與原卷 reader 不受影響。`)){slots[activeSlot]=defaultState();state=sanitizeState(slots[activeSlot]);save();renderAll();announce(`Super Curation Slot ${activeSlot} reset`);}return;}
  });
  writingPractice.addEventListener('click',event=>{
    const task=event.target.closest('[data-writing-task]');if(task){setWritingTask(task.dataset.writingTask);return;}
    const copy=event.target.closest('[data-copy-qab]');if(copy){const number=Number(copy.dataset.copyQab),target=$(`#answer-${tasks[number].page}`);if(target){target.value=state.drafts[number];target.dispatchEvent(new Event('input',{bubbles:true}));jumpPage(tasks[number].page);announce(`Task ${number} draft copied to Question-Answer Book page.`);}return;}
    const native=event.target.closest('[data-native-page]');if(native)jumpPage(Number(native.dataset.nativePage));
  });
  $('.gm-evidence-rail').addEventListener('click',event=>{
    const open=event.target.closest('[data-open-unit]');if(!open)return;
    event.stopPropagation();
    if(state.tab==='writing')openModelPreview([open.dataset.openUnit]);else openUnit(open.dataset.openUnit);
  });
  shell.addEventListener('change',event=>{const categoryJump=event.target.closest('[data-category-jump]');if(categoryJump){state.categoryIndex=Math.max(0,Math.min(categorySteps.length-1,Number(categoryJump.value)||0));save();renderCategorize();announce(`Jumped to Stage 2 unit ${state.categoryIndex+1} of ${categorySteps.length}.`);return;}const evidenceJump=event.target.closest('[data-evidence-jump]');if(evidenceJump){goEvidenceIndex(Number(evidenceJump.value));announce(`Jumped to Stage 4 unit ${state.evidenceIndex+1} of ${evidenceUnits.length}; skipped units remain incomplete.`);}});
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
    if(event.key==='ArrowRight'&&state.tab==='categorize'){event.preventDefault();controllerNext();}
    if(event.key==='ArrowLeft'&&state.tab==='categorize'){event.preventDefault();controllerPrev();}
    if(event.key==='ArrowRight'&&state.tab==='listen'){event.preventDefault();controllerNext();}
    if(event.key==='ArrowLeft'&&state.tab==='listen'){event.preventDefault();controllerPrev();}
    if(event.key==='ArrowRight'&&state.tab==='evidence'){event.preventDefault();controllerNext();}
    if(event.key==='ArrowLeft'&&state.tab==='evidence'){event.preventDefault();controllerPrev();}
    if(event.key==='ArrowRight'&&state.tab==='writing'){event.preventDefault();controllerNext();}
    if(event.key==='ArrowLeft'&&state.tab==='writing'){event.preventDefault();controllerPrev();}
  });
  document.addEventListener('keydown',event=>{if(event.key!=='Escape')return;const preview=$('#gm-model-preview'),transcript=$('#gm-transcript-window'),dialog=$('#gm-help-dialog');if(preview&&!preview.hidden){closeModelPreview();event.preventDefault();return;}if(transcript&&!transcript.hidden){closeTranscriptWindow();event.preventDefault();return;}if(dialog?.open){dialog.close();event.preventDefault();}});

  const missingModelSources=[];
  for(const [task,model] of Object.entries(modelData.tasks))for(const section of model.sections)for(const sentence of section.sentences)for(const id of sentence.sources)if(!unitById.has(id))missingModelSources.push({task,sentence:sentence.text,id});
  renderAll();
  const nativeMarks=markNativePhrases();
  syncNativeSource({scroll:true});renderEvidenceRail();
  window.EDMUND_2019_B2_CURATION_DIAGNOSTICS=Object.freeze({version:VERSION,contractStepCount:contractSteps.length,contractBossCount:contractBossSteps.length,contractRouteCount:contractSteps.filter(step=>step.kind==='route').length,categoryStepCount:categorySteps.length,categoryPageCount:categorySteps.filter(step=>step.kind==='page').length,categoryNoteCount:categorySteps.filter(step=>step.kind==='note').length,listeningStepCount:listeningSteps.length,listeningGuideCount:listeningGuideSteps.length,listeningTranscriptCount:listeningTranscriptSteps.length,evidenceStepCount:evidenceUnits.length,evidenceIds:evidenceUnits.map(unit=>unit.id),evidenceFirstId:evidenceUnits[0].id,evidenceLastId:evidenceUnits.at(-1).id,evidencePageCounts:Object.fromEntries([...new Set(evidenceUnits.map(sourcePage))].map(page=>[page,evidenceUnits.filter(unit=>sourcePage(unit)===page).length])),evidenceBankableCounts:Object.fromEntries([8,9,10].map(task=>[task,evidenceUnits.filter(unit=>bankTasks(unit).includes(task)).length])),writingStepCount:writingSteps.length,writingPrepCount:writingSteps.filter(step=>step.kind==='prep').length,writingTeachingCount:writingSteps.filter(step=>step.kind==='model').length,writingSourceCount:writingSteps.filter(step=>step.kind==='source').length,writingReturnCount:writingSteps.filter(step=>step.kind==='return').length,writingTaskCounts:Object.fromEntries([8,9,10].map(task=>[task,writingSteps.filter(step=>step.task===task).length])),writingTeachingCounts:Object.fromEntries([8,9,10].map(task=>[task,writingTeachingUnits[task].length])),writingSteps:writingSteps.map(step=>({id:step.id,index:step.index,task:step.task,kind:step.kind,sourceId:step.sourceId||null,teachingId:step.teachingId||null})),unitCount:units.length,decisionCount:DECISIONS.length,cueCount:listeningData.cueCount,audioOwnerCount:$$('#gm-audio').length,nativeMarks,nativeTaskParagraphs:$$('.gm-source-paragraph,.gm-contract-paragraph').length,saveSlotCount:5,missingModelSources,getState:()=>JSON.parse(JSON.stringify(state)),getEnvelope:()=>JSON.parse(JSON.stringify({version:VERSION,activeSlot,slots}))});
})();
