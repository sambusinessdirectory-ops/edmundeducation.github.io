(() => {
  'use strict';
  const core = window.EdmundSentenceAnalysis;
  const benchmark = window.EDMUND_B2_SENTENCE_ANALYSIS?.records;
  if (!core || !benchmark || !document.querySelector('#page-4 .sentence-item')) return;

  const VERSION = '2025-b2-super-curation-v1';
  const STORAGE = 'edmund-paper3-2025-b2-curation-v1';
  const chapters = [
    {id:'boss', name:'1 · Boss letter', short:'任務指示', description:'先找寫作身分、文類、讀者、內容要求和指定來源。'},
    {id:'categorize', name:'2 · Data categorization', short:'資料分類', description:'先按題目與文件標題作暫定分類，再在閱讀後修正。'},
    {id:'podcast', name:'3 · Podcast', short:'聆聽錄音', description:'聽到經核對的關鍵段落開端時暫停，先記筆記，再看逐句稿。'},
    {id:'data', name:'4 · Data File / Fact file', short:'逐句取證', description:'依 Task A → B → C 閱讀，不按頁碼機械地讀。'},
    {id:'writing', name:'5 · Three writing tasks', short:'三篇寫作', description:'先組織自己的內容與草稿，再按任務要求校對。'}
  ];
  const labels = {1:'Task A · 可用內容',2:'Task B · 可用內容',3:'Task C · 可用內容',4:'語義相關 / 語氣',5:'提示 / 更新線索',6:'噪音 / 不採用'};
  const provisionalNotes={
    'duncan-henley-emails-8':'這是較早一封回覆。由寄件人和時間判斷位置；仍要讀最新回覆。',
    'duncan-henley-emails-9':'Henley 此刻贊成 Crafting Session，並建議 Wellness Fair。先記兩個候選活動；仍要看 Duncan 的最新確認。',
    'duncan-henley-emails-10':'「上次受歡迎」可作理由，但它單獨不能證明今年確定再辦。',
    'duncan-henley-emails-11':'新設 interactive booths 是今年的建議細節。先記下，等後續決定。',
    'duncan-henley-emails-12':'營養師未能到場，原本的 talk 暫時不可照抄；留意活動是否仍保留其他部分。',
    'duncan-henley-emails-13':'Henley 提議不再辦 Fitness Challenge 和 Gardening & Plant Care。先標為更新線索，等待最新回覆確認。',
    'duncan-henley-emails-14':'Sports Day at the Beach 是新構想；先留給 Task B，不可直接混入已確定再辦的 Task A 活動。',
    'duncan-henley-emails-15':'這是此電郵串較早的一封。時間順序決定我們如何理解後續更新。',
    'duncan-henley-emails-16':'Duncan 正徵求活動選項；此時仍未知道最後選哪三項。',
    'duncan-henley-emails-17':'去年的海報是候選清單，不是今年的確認清單。',
    'duncan-henley-emails-18':'Fitness Challenge 在此刻只是 Duncan 的初步建議。先記候選，不要當成已確定。',
    'duncan-henley-emails-19':'Crafting Session 及改為亞洲國家題材是此刻的建議。先記下細節，稍後對照回覆。',
    'duncan-henley-emails-20':'這是請對方回應的問句；下一封電郵可能更改活動選擇。'
  };
  const pageSections = {4:'boss-letter',5:'duncan-henley-emails',6:'wellness-poster',7:'student-interview',8:'whatsapp-chat',9:'duncan-singh-emails',10:'influator-blog',11:'sports-article'};
  const categoryPages = [
    {page:5,title:'Duncan ↔ Henley 電郵',initial:'Boss letter 指向這串電郵，先標 Task A；只把它當來源路線，未讀完前別抄活動名。',revision:'從最早一封往最新一封讀。Task A 的舊活動要受最新決定約束；新活動的線索則留給 Task B。',tasks:['A','B']},
    {page:6,title:'2024 健康月海報',initial:'標 Task A 的候選資料。這是 2024 年海報，不能假定每項活動在 2025 年都再辦。',revision:'逐項和第 5 頁最新電郵及錄音核對。保留獲確認活動，刪除取消或改動的細節。',tasks:['A']},
    {page:7,title:'校園電視訪問',initial:'Boss letter 要 student feedback；先標 Task A，留意訪談的說話者。',revision:'學生的評價支援 Task A；家長義工與親子互動的經驗可轉給 Task C。分類可在讀到後半段時追加。',tasks:['A','C']},
    {page:8,title:'WhatsApp 對話',initial:'Boss letter 指向 WhatsApp 作 proposal 起點，先標 Task B。',revision:'圈出活動目的與運動篩選條件；校長仍待看 proposal，不能寫成已批准。',tasks:['B']},
    {page:9,title:'Duncan ↔ Singh 電郵',initial:'Boss letter 指向 Singh 電郵處理家長義工，先標 Task C。',revision:'讀下去才會發現交通與海灘選擇也支援 Task B；將資料分別存入兩個任務。',tasks:['C','B']},
    {page:10,title:'網誌、圖表與運動電郵',initial:'先看各文件標題：家長參與網誌指向 Task C，運動電郵指向 Task B。',revision:'網誌的社會／氣氛理由須轉述；運動電郵提供排除條件。圖表不要不加解釋地當成健康月校內數據。',tasks:['C','B']},
    {page:11,title:'運動雜誌文章',initial:'按 WhatsApp 的選項條件，先標 Task B；不是所有介紹的運動都合適。',revision:'把每項運動與新鮮感、活動量、初學者難度、水上風險和交通條件逐一對照，排除不合者。',tasks:['B']}
  ];
  // Word onsets were aligned against the supplied 8:37.5 meeting recording and checked against the reader transcript.
  const podcastCues = [
    {id:'july',at:169.2,page:14,quote:'Wellness Month starts in July',title:'先抓年份與月份',task:'A',help:'健康月在七月，亞運週在十月。不要把兩件活動的日期合併。'},
    {id:'after-exams',at:201.7,page:14,quote:'Wellness Month is just after the students finish their exams',title:'理解舉辦時機',task:'A',help:'「考試後」支援文章引入與放鬆的需要；先記下時間，再等主題正式確定。'},
    {id:'theme',at:221.4,page:14,quote:'Relax and Recover fits in well',title:'辨認最後確定的主題',task:'A',help:'Hiking 是早前提議，已因七月炎熱被否定；Relax and Recover 才是最後決定。'},
    {id:'yoga',at:232.6,page:14,quote:'Yoga and Meditation sessions were a big hit',title:'瑜伽與冥想再辦',task:'A',help:'這裡提出去年受歡迎，下一句確認今年再辦；兩句要合起來判斷。'},
    {id:'focus',at:251.3,page:15,quote:'Yoga can improve your focus and attention span',title:'抓住新的宣傳好處',task:'A',help:'這項好處可放進校刊文章，但要用自然文句轉述，不是孤立列詞。'},
    {id:'instructors',at:296.7,page:15,quote:'I can get two famous instructors for sure',title:'導師人數確定，姓名未定',task:'A',help:'只可寫兩位知名導師；人名仍未確認，不能自己補。'},
    {id:'briefing',at:435.2,page:16,quote:'parents were asked to attend a briefing session',title:'義工簡介會',task:'C',help:'先記 briefing session；實際職責仍須核對 Singh 的電郵，因說話者此刻記不起。'},
    {id:'app',at:463.9,page:17,quote:'through the school app',title:'聽見更正：用 app 報名',task:'C',help:'school website 剛被更正；最終報名方法是 school app。'}
  ];
  const writingPrompts = {
    A:[
      ['拆解校刊任務','讀者是全校學生。寫 2025 年健康月的宣傳文章；只選已確認再辦的三個 2024 活動，並加入學生回饋。','先列三個活動及每項的最終版本，再從訪問選 2–3 個學生感受。不要把仍待批准的海灘運動日寫成確定活動。'],
      ['列內容骨架','用標題、引入、三個活動、學生回饋及號召結尾組成文章。','每段放一個目的；用證據庫核對活動名稱、更新和來源。'],
      ['寫自己的校刊文章','先完成自己的草稿。右邊的 Task A 證據是可用素材，不是可整段照抄的範文。','寫得像校刊，讓學生明白活動內容和參與價值。'],
      ['校對 Task A','核對年份、主題、三個已確認活動、學生回饋及校刊語氣。','刪除 2024 年已過時的南美洲內容、被取消的項目，以及未批的新活動。']
    ],
    B:[
      ['拆解 proposal','讀者是校長。你要提出理由、兩種運動的基本資料及選擇理由，並請求批准。','把 WhatsApp 的篩選條件和文章的運動特徵逐一對照，切勿假設校長已批准。'],
      ['選兩項運動與場地','先寫選擇表：新鮮感、活動量、初學者友善、是否入水及交通。','用 source evidence 排除不合條件的選項，場地要引用最新交通資料。'],
      ['寫自己的建議書','用清楚的小標題組織目的、理由、運動、場地與結論。','所有細節都應可回指原卷或錄音。'],
      ['校對 Task B','核對兩項運動、基本特徵、選擇原因、場地及批准狀態。','proposal 應提出建議，不應寫成已批准或已舉行。']
    ],
    C:[
      ['拆解家長信','讀者是家長。邀請他們做義工，交代好處、職責及參與方式。','以學生 Nico 的校內身份寫，保留禮貌而有說服力的語氣。'],
      ['整合三種來源','從訪問取家長經驗、從 Singh 電郵核對職責、從網誌取可轉述的效益，再用錄音核對簡介會與 app。','不要把被更正的「家長替學生準備活動」或 school website 當成最終答案。'],
      ['寫自己的家長信','寫稱呼、邀請、好處、職責、報名方式及得體結語。','讀者是家長；用清楚的行動呼籲收尾。'],
      ['校對 Task C','核對得益、義工實際工作、簡介會、school app，以及沒有偷換教師與家長的責任。','確認所有細節都是在相應來源出現後才採用。']
    ]
  };

  const $ = (sel,root=document) => root.querySelector(sel);
  const $$ = (sel,root=document) => [...root.querySelectorAll(sel)];
  const el = (tag,className,text) => {const n=document.createElement(tag);if(className)n.className=className;if(text!=null)n.textContent=text;return n;};
  const normalize = core.normalize;
  const recordFor = (text,section,context='') => core.matchRecords(text,section,benchmark,context)[0] || (/^(?:dear |hi |hey |thanks,|good luck with|mr duncan$|john$|melissa$|manraj$)/i.test(text.trim())?{id:'courtesy',section,quote:text,blocks:['類型：6 禮貌及行政語','這是電郵稱呼、禮貌結語或署名，用來辨認說話者與關係，不是三篇作文的內容點。']} : null);
  const typeOf = record => {const line=record?.blocks?.find(block=>block.startsWith('類型：')) || '';return Number(line.match(/^類型：([1-6])/)?.[1] || 0);};
  const canBank = record => {
    const line=record?.blocks?.find(block=>block.startsWith('類型：')) || '';
    return /^[1-3]$/.test(String(typeOf(record))) && /直接可用/.test(line) && !/淘汰|前半|部分/.test(line);
  };
  const sourceSection = span => {
    const page=Number(span.closest('.page')?.id?.replace('page-',''));
    return page===10 && span.closest('.email') ? 'sports-email' : pageSections[page];
  };
  function inferTask(page,section,record,text) {
    const type=typeOf(record);
    if(type===1) return 'A'; if(type===2) return 'B'; if(type===3) return 'C';
    if(section==='sports-email'||section==='sports-article'||section==='whatsapp-chat')return 'B';
    if(section==='influator-blog')return 'C';
    if(section==='wellness-poster')return 'A';
    if(section==='duncan-henley-emails')return /beach|Dr Chan.*approv|new event/i.test(text)?'B':'A';
    if(section==='duncan-singh-emails')return /bus|traffic|beach|parking|transport/i.test(text)?'B':'C';
    if(section==='student-interview')return /parent|volunteer|mum|dad|helping out/i.test(text)?'C':'A';
    return page===7?'A':page===9?'C':'B';
  }
  const steps = {boss:[],categorize:[],podcast:[],data:[],writing:[]};
  // A transcript speech can contain several sentences. Wrap each sentence so the spotlight has an exact target.
  const transcriptSentences=[];
  $$('.page[data-kind="transcript"] .recording-script .speech').forEach(speech=>{
    const line=$('p[lang="en"]',speech);if(!line)return;
    const page=Number(speech.closest('.page').id.replace('page-',''));
    const speaker=$('.speaker',speech)?.textContent||'';
    const text=line.textContent;
    const parts=core.sentences(text);
    if(!line.childElementCount){line.replaceChildren();for(const part of parts){const span=el('span','curation-transcript-sentence',part.text);line.append(span);transcriptSentences.push({span,page,speaker});}}
    else transcriptSentences.push({span:line,page,speaker});
  });
  const sourceItems = $$('.page[data-kind="data"] .sentence-item');
  sourceItems.forEach((span,index) => {
    const page=Number(span.closest('.page')?.id?.replace('page-',''));
    if(page<4||page>11) return;
    const section=sourceSection(span);
    const text=span.textContent.trim();
    const record=recordFor(text,section,span.parentElement?.textContent||'');
    const emailIndex=page===5?$$('#page-5 .email').indexOf(span.closest('.email')):-1;const base={id:`source-${page}-${index}`,target:span,page,quote:text,record,type:typeOf(record),order:index,section,provisional:emailIndex>0};
    if(page===4) steps.boss.push({...base,chapter:'boss',title:'Boss letter · 讀任務與來源',task:null});
    else steps.data.push({...base,chapter:'data',title:'Data File · 逐句判讀',task:inferTask(page,section,record,text)});
  });
  categoryPages.forEach((entry,index)=>steps.categorize.push({id:`category-${entry.page}`,chapter:'categorize',title:entry.title,page:entry.page,quote:entry.title,target:$(`#page-${entry.page} .page-heading h2`),entry,order:index}));
  podcastCues.forEach((cue,index)=>{const target=transcriptSentences.find(item=>item.page===cue.page&&normalize(item.span.textContent).includes(normalize(cue.quote)))?.span;steps.podcast.push({id:`cue-${cue.id}`,chapter:'podcast',title:cue.title,page:cue.page,quote:target?.textContent.trim()||cue.quote,target:target||$(`#page-${cue.page} .page-heading h2`),cue:{...cue,from:Math.max(0,cue.at-18)},bankTask:cue.task,order:index});});
  for(const task of ['A','B','C']) writingPrompts[task].forEach(([title,lead,hint],index)=>steps.writing.push({id:`writing-${task}-${index}`,chapter:'writing',title:`Task ${task} · ${title}`,quote:title,lead,hint,task,order:index,target:$('#practice')}));
  const pageRank={A:[5,6,7,8,9,10,11],B:[8,9,10,11,5,6,7],C:[9,10,7,5,6,8,11]};
  steps.data.sort((a,b)=>{
    if(a.task!==b.task)return 'ABC'.indexOf(a.task)-'ABC'.indexOf(b.task);
    const pages=pageRank[a.task];const pd=pages.indexOf(a.page)-pages.indexOf(b.page);if(pd)return pd;
    if([5,9].includes(a.page)){
      const emails=$$(`#page-${a.page} .email`);
      const ai=emails.indexOf(a.target.closest('.email')),bi=emails.indexOf(b.target.closest('.email'));
      if(ai>=0&&bi>=0&&ai!==bi)return bi-ai; // read an email chain from the oldest message upwards
    }
    return a.order-b.order;
  });
  // Revisit earlier suggestions only after the newest reply has confirmed the three returning events.
  const candidateIds=new Set(['duncan-henley-emails-9','duncan-henley-emails-11','duncan-henley-emails-12','duncan-henley-emails-19']);
  const confirmed=steps.data.filter(step=>step.task==='A'&&step.page===5&&candidateIds.has(step.record?.id)).map(step=>({...step,id:`${step.id}-confirmed`,title:'回看舊電郵 · 核對後才取證',provisional:false,confirmed:true}));
  const lastAEmail=steps.data.findLastIndex(step=>step.task==='A'&&step.page===5);
  if(lastAEmail>=0)steps.data.splice(lastAEmail+1,0,...confirmed);
  // After the guided answer pauses, every transcript sentence has its own optional review step.
  transcriptSentences.forEach(({span,page,speaker},index)=>{
    const quote=span.textContent.trim();
    let bankTask=null;
    if((page===14||page===15)&&/starts in July|just after the students finish their exams|Relax and Recover fits|Yoga and Meditation sessions were a big hit|focus and attention span|two famous instructors for sure/i.test(quote))bankTask='A';
    if((page===16||page===17)&&/attend a briefing session|through the school app/i.test(quote))bankTask='C';
    steps.podcast.push({id:`transcript-${page}-${index}`,chapter:'podcast',title:`逐句錄音稿 · ${speaker}`,page,quote,target:span,transcript:true,bankTask,order:index,speaker});
  });
  for(const ch of chapters)steps[ch.id].forEach((step,index)=>{step.index=index;step.total=steps[ch.id].length;});
  const allIds=new Set(chapters.flatMap(ch=>steps[ch.id].map(step=>step.id)));
  const blank=()=>({chapter:'boss',positions:Object.fromEntries(chapters.map(ch=>[ch.id,0])),completed:[],bookmarks:[],evidence:{A:[],B:[],C:[]},drafts:{A:'',B:'',C:''},categories:{},spotlight:true,dialogue:false,updated:Date.now()});
  const sanitize=raw=>{
    const state=blank();if(!raw||typeof raw!=='object')return state;
    if(chapters.some(ch=>ch.id===raw.chapter))state.chapter=raw.chapter;
    for(const ch of chapters)state.positions[ch.id]=Math.min(Math.max(Number(raw.positions?.[ch.id])||0,0),Math.max(0,steps[ch.id].length-1));
    state.completed=[...new Set((Array.isArray(raw.completed)?raw.completed:[]).filter(id=>allIds.has(id)))];
    state.bookmarks=[...new Set((Array.isArray(raw.bookmarks)?raw.bookmarks:[]).filter(id=>allIds.has(id)))];
    for(const t of 'ABC'){
      state.evidence[t]=[...new Set((Array.isArray(raw.evidence?.[t])?raw.evidence[t]:[]).filter(id=>allIds.has(id)))];
      state.drafts[t]=typeof raw.drafts?.[t]==='string'?raw.drafts[t].slice(0,30000):'';
    }
    if(raw.categories&&typeof raw.categories==='object')for(const key of Object.keys(raw.categories)){if(/^category-(5|6|7|8|9|10|11)$/.test(key))state.categories[key]=Array.isArray(raw.categories[key])?raw.categories[key].filter(x=>'ABC'.includes(x)):[];}state.spotlight=raw.spotlight!==false;state.dialogue=raw.dialogue===true;return state;
  };
  let slots={};let activeSlot='1';let state=blank();
  try {const stored=JSON.parse(localStorage.getItem(STORAGE)||'{}');if(stored.version===VERSION){slots=stored.slots||{};activeSlot=/^[1-5]$/.test(stored.activeSlot)?stored.activeSlot:'1';state=sanitize(slots[activeSlot]);}}catch{}
  function persist(){state.updated=Date.now();slots[activeSlot]=state;try{localStorage.setItem(STORAGE,JSON.stringify({version:VERSION,activeSlot,slots}));$('#curation-save-status').textContent=`儲存格 ${activeSlot} · 已保存在這部裝置`;}catch{$('#curation-save-status').textContent='儲存失敗，請匯出存檔。';}}

  const toggle=el('button','action-btn curation-launch','✦ Super Curation');toggle.type='button';toggle.id='curation-toggle';toggle.setAttribute('aria-pressed','false');$('.toolbar').append(toggle);
  const dock=el('aside','curation-dock');dock.id='curation-dock';dock.hidden=true;dock.setAttribute('aria-label','Super Curation 指導卡');
  dock.innerHTML=`<div class="curation-top"><span class="curation-kicker">SUPER CURATION · 2025 B2 PILOT</span><button type="button" id="curation-close" aria-label="離開導覽模式">×</button></div><div class="curation-header"><span id="curation-chapter"></span><button type="button" id="curation-bookmark" aria-label="將本步加入書籤">☆</button></div><nav class="curation-chapters" aria-label="五個導覽章節"></nav><select id="curation-chapter-select" aria-label="跳至五個章節"></select><div class="curation-jump"><label>跳至步驟 <select id="curation-step-jump"></select></label><label>書籤 <select id="curation-bookmark-jump"><option value="">選擇書籤</option></select></label></div><div id="curation-task-jump" class="curation-task-jump" hidden></div><div class="curation-legend" aria-label="資料標記顏色"><span class="color-A">A</span><span class="color-B">B</span><span class="color-C">C</span><span class="color-hint">來源提示</span><span class="color-spare">備用</span></div><div class="curation-progress"><span id="curation-step-count"></span><progress id="curation-progress" max="1" value="0"></progress></div><div class="curation-options"><label><input type="checkbox" id="curation-spotlight"> 聚光燈</label><label><input type="checkbox" id="curation-dialogue"> Eddy 對話</label></div><div class="curation-content"><p id="curation-source"></p><h2 id="curation-title"></h2><blockquote id="curation-quote" lang="en"></blockquote><div class="curation-character" hidden><span class="curation-eddy" role="img" aria-label="Eddy"></span><span>Eddy · 導讀</span></div><div id="curation-explanation"></div><div id="curation-step-actions"></div></div><div class="curation-actions"><button type="button" id="curation-prev">← 上一步</button><button type="button" id="curation-help">需要更多協助</button><button type="button" id="curation-next">下一步 →</button></div><details class="curation-save"><summary>遊戲存檔 · 自動儲存 / 匯出 / 匯入</summary><div><label for="curation-slot">遊戲存檔</label><select id="curation-slot" aria-label="選擇存檔格"></select><button type="button" id="curation-save-now">儲存</button></div><div><button type="button" id="curation-export">匯出存檔</button><label class="curation-import">匯入存檔<input id="curation-import" type="file" accept="application/json,.json"></label></div><small id="curation-save-status" role="status"></small></details>`;
  const bank=el('aside','curation-bank');bank.id='curation-bank';bank.hidden=true;bank.setAttribute('aria-label','三項寫作證據庫');bank.innerHTML='<h2>三項寫作證據庫</h2><p>按「下一步」時，已核實可用的句子會移到相應任務。舊資料或淘汰線索不會自動加入。</p><div id="curation-bank-groups"></div>';
  const masks=['top','left','right','bottom'].map(side=>{const m=el('div',`curation-mask curation-mask-${side}`);m.hidden=true;document.body.append(m);return m;});
  document.body.append(dock,bank);
  const nav=$('.curation-chapters',dock);for(const chapter of chapters){const b=el('button','',chapter.name);b.type='button';b.dataset.chapter=chapter.id;nav.append(b);$('#curation-chapter-select').append(new Option(chapter.name,chapter.id));}
  const slotSel=$('#curation-slot');for(let i=1;i<=5;i++){const opt=el('option','',`Slot ${i}`);opt.value=String(i);slotSel.append(opt);}slotSel.value=activeSlot;
  const bankGroups=$('#curation-bank-groups');for(const t of 'ABC'){const d=el('details',`curation-bank-${t}`);d.dataset.task=t;d.innerHTML=`<summary><span>Task ${t}</span><strong data-count>0 句</strong></summary><ol></ol>`;bankGroups.append(d);}
  let open=false;let helpOpen=false;let animation=null;let cueArmed=false;
  const audio=$('#page-3 .notes-audio audio');
  const current=()=>steps[state.chapter][state.positions[state.chapter]];
  const pageLabel=step=>step.page?`Data File ${step.page<=11?`第 ${step.page} 頁`:`附加錄音稿 ${step.page-11}`} · ${step.task?`Task ${step.task}`:step.chapter==='podcast'?'Podcast':''}`:'寫作練習';
  function explanation(step){
    const box=$('#curation-explanation');box.replaceChildren();$('#curation-step-actions').replaceChildren();
    const add=(text,cls='')=>{const p=el('p',cls,text);box.append(p);};
    if(step.chapter==='boss'){
      add('讀 boss letter 時，先辨認文類、讀者、指定內容與來源提示，再分類 Data File。這句是你目前真正可知道的資料。','curation-process');
      if(step.record)for(const block of step.record.blocks){if(block==='分析：'||block.startsWith('['))continue;add(block,block.startsWith('類型：')?'curation-type':'');}
      else add('這句主要用來辨認寄件人、稱呼或任務語境；不必直接搬進作文。');
    }else if(step.chapter==='categorize'){
      add(step.entry.initial,'curation-process');
      add('先作暫定標記；讀到新的決定後再修正。分類是會更新的工作假設。');
      const c=el('p','curation-revision',`讀後修正：${step.entry.revision}`);c.hidden=!helpOpen;box.append(c);
    }else if(step.chapter==='podcast'){
      if(step.cue){add(step.cue.detail,'curation-process');add(step.cue.help);add('錄音會在經核對的段落起點停下。繼續播放前，先用不完整句子記下關鍵詞；不顯示未核實的逐句秒數。');}
      else {add('完整錄音稿複習：先問這句是 Task A、B、C 的內容，還是更正、提示或干擾。','curation-process');const q=step.quote;if(step.bankTask)add(`這句經前後文確認，可支援 Task ${step.bankTask}。記下關鍵詞，按「下一步」才收入證據庫。`);else if(/hiking/i.test(q))add('這只是提議；後面以七月炎熱為由否定。不要採用。');else if(/school website/i.test(q))add('這是未更正的說法。繼續聽下一句，再決定報名途徑。');else if(/responsibilities|Mr Singh/i.test(q))add('這裡說話者尚未確認義工職責。先標記疑問，再去 Singh 電郵核對。');else if(/Asian Games|October|slogan|guest speaker/i.test(q))add('這句談亞運週。它在完整錄音中有用，但不是此 B2 三篇健康月寫作的內容點。');else add('暫時保留語境；核對說話者、時間和後面的更新。若沒有直接證明寫作要求，不要收入內容點。');}
    }else if(step.chapter==='data'){
      if(step.provisional&&!step.confirmed){add('按電郵時間順序，這句仍是較早的建議或討論；現在只作暫定標記。','curation-process');add(provisionalNotes[step.record?.id]||'先辨認寄件人、收件人和正在討論的事項，再等後續電郵確認。');add('暫定資料不會收入寫作證據庫。稍後會回來核對可用的細節。','curation-caution');return;}
      if(step.confirmed)add('你已讀到最新回覆。現在回看舊電郵，核對仍然成立的具體資料。','curation-process');
      add(`先問：這句在此時能證明甚麼？應屬 Task ${step.task}，還是只作線索？`,'curation-process');
      if(step.page===6)add('這是去年的海報。與 2025 年最新決定交叉核對之前，所有活動都只是候選。','curation-caution');
      if(step.page===5 && /recommend|suggest|plan|think/i.test(step.quote))add('電郵串要從最早往最新讀。這句先作暫定資料；後面的回覆可能改變決定。','curation-caution');
      if(step.page===9 && /think I remember|hanging around|prepare/i.test(step.quote))add('問句或回憶不是事實確認。等 Singh 的回覆才定義家長職責。','curation-caution');
      if(step.record){for(const block of step.record.blocks){if(block==='分析：'||block.startsWith('['))continue;add(block,block.startsWith('類型：')?'curation-type':'');}}
      else add('現有逐句基準資料沒有這句的獨立定論。保留原文，按最新來源及任務要求判斷；不要猜成可用內容點。','curation-caution');
      if(step.record && typeOf(step.record))add(`本句標記：${labels[typeOf(step.record)]}${canBank(step.record)?'；下一步會收進右側證據庫。':''}`,'curation-result');
    }else if(step.chapter==='writing'){
      add(step.lead,'curation-process');add(step.hint);
      if(step.order===2)add('先獨立寫草稿，右側證據庫只供核對內容點。範文不會在寫之前代替你的構思。','curation-caution');
    }
    const extra=$('#curation-step-actions');extra.replaceChildren();
    if(step.chapter==='categorize'){
      const b=el('button','curation-small','顯示讀後修正');b.type='button';b.addEventListener('click',()=>{helpOpen=!helpOpen;explanation(step);});extra.append(b);
      const choices=el('fieldset','curation-category-choices');choices.append(el('legend','',`你會先標哪個任務？`));for(const t of 'ABC'){const label=el('label');const input=el('input');input.type='checkbox';input.value=t;input.checked=(state.categories?.[step.id]||[]).includes(t);input.addEventListener('change',()=>{state.categories||={};state.categories[step.id]=$$('input:checked',choices).map(x=>x.value);persist();});label.append(input,document.createTextNode(` Task ${t}`));choices.append(label);}extra.append(choices);const line=el('p','',`讀後分類：${step.entry.tasks.map(t=>`Task ${t}`).join(' + ')}`);if(helpOpen)extra.append(line);
    }
    if(step.cue && audio){const b=el('button','curation-small',`▶ 播放至 ${Math.floor(step.cue.at/60)}:${String(Math.floor(step.cue.at%60)).padStart(2,'0')} 關鍵段落`);b.type='button';b.addEventListener('click',()=>{const play=()=>{audio.currentTime=step.cue.from;cueArmed=true;audio.play().catch(()=>{$('#curation-save-status').textContent='未能播放錄音；請按原播放器重試。';});};if(audio.readyState>=1)play();else{audio.addEventListener('loadedmetadata',play,{once:true});audio.load();}});extra.append(b);}
    if(step.chapter==='writing'){
      const area=el('textarea','curation-draft');area.rows=step.order===2?10:5;area.placeholder=`Task ${step.task}：在這裡寫你的${step.order===1?'提綱':'草稿或修訂'}…`;area.value=state.drafts[step.task];area.setAttribute('aria-label',`Task ${step.task} 寫作草稿`);area.addEventListener('input',()=>{state.drafts[step.task]=area.value;count.textContent=`${area.value.trim()?area.value.trim().split(/\s+/).length:0} words`;persist();});extra.append(area);const count=el('small','curation-word-count',`${area.value.trim()?area.value.trim().split(/\s+/).length:0} words`);extra.append(count);
    }
  }
  function renderBank(){for(const t of 'ABC'){const group=$(`.curation-bank-${t}`);const list=$('ol',group);list.replaceChildren();for(const id of state.evidence[t]){const s=chapters.flatMap(c=>steps[c.id]).find(x=>x.id===id);if(!s)continue;const li=el('li');const b=el('button','',s.quote);b.type='button';b.addEventListener('click',()=>{state.chapter='data';state.positions.data=s.index;render();});li.append(b,el('small','',s.chapter==='podcast'?`錄音稿 ${s.page-11}`:`Data File ${s.page}`));if(s.record?.id==='duncan-henley-emails-12')li.append(el('small','curation-bank-note','營養師講座已取消；只保留嘉年華其他已確認內容。'));if(s.record?.id==='duncan-singh-emails-5')li.append(el('small','curation-bank-note','這句用來釐清分工：準備學生的是老師。'));list.append(li);} $('[data-count]',group).textContent=`${state.evidence[t].length} 句`;}}
  function setMaskRect(mask,top,left,width,height){Object.assign(mask.style,{top:`${Math.max(0,top)}px`,left:`${Math.max(0,left)}px`,width:`${Math.max(0,width)}px`,height:`${Math.max(0,height)}px`});}
  function spotlight(){const step=current();const target=step?.target;if(!open||!state.spotlight||!target?.isConnected){masks.forEach(m=>m.hidden=true);return;}const r=target.getBoundingClientRect();if(!r.width||!r.height){masks.forEach(m=>m.hidden=true);return;}const pad=9,w=innerWidth,h=innerHeight,l=Math.max(0,r.left-pad),t=Math.max(0,r.top-pad),right=Math.min(w,r.right+pad),bottom=Math.min(h,r.bottom+pad);masks.forEach(m=>m.hidden=false);setMaskRect(masks[0],0,0,w,t);setMaskRect(masks[1],t,0,l,bottom-t);setMaskRect(masks[2],t,right,w-right,bottom-t);setMaskRect(masks[3],bottom,0,w,h-bottom);}
  function focusSource(step){if(!step?.target)return;const page=step.target.closest('.page');if(page?.hidden){const kind=page.dataset.kind;const filter=$(`[data-filter="${kind}"]`);filter?.click();}const behavior=matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth';if(innerWidth<=620){const r=step.target.getBoundingClientRect();window.scrollTo({top:window.scrollY+r.top-200,behavior});}else step.target.scrollIntoView({block:'center',behavior});let until=performance.now()+900;const track=()=>{spotlight();if(performance.now()<until)requestAnimationFrame(track);};requestAnimationFrame(track);}
  function render(focus=true){if(!open)return;const step=current();if(!step)return;helpOpen=false;$$('.curation-target').forEach(x=>x.classList.remove('curation-target'));step.target?.classList.add('curation-target');
    $$('#curation-dock [data-chapter]').forEach(b=>{const active=b.dataset.chapter===state.chapter;b.setAttribute('aria-current',active?'step':'false');b.classList.toggle('active',active);});
    $('#curation-chapter').textContent=chapters.find(c=>c.id===state.chapter)?.description||'';$('#curation-chapter-select').value=state.chapter;const jump=$('#curation-step-jump');jump.replaceChildren();for(const s of steps[state.chapter]){const opt=el('option','',`${s.index+1}. ${s.title}${s.chapter==='data'?` · Task ${s.task} · p${s.page}`:''}`);opt.value=String(s.index);jump.append(opt);}jump.value=String(step.index);const marks=$('#curation-bookmark-jump');marks.replaceChildren();marks.append(new Option('選擇書籤',''));for(const id of state.bookmarks){const s=chapters.flatMap(c=>steps[c.id]).find(x=>x.id===id);if(s)marks.append(new Option(`${chapters.find(c=>c.id===s.chapter).short} · ${s.index+1}`,id));}const taskJump=$('#curation-task-jump');taskJump.replaceChildren();taskJump.hidden=!['data','writing'].includes(state.chapter);if(!taskJump.hidden)for(const t of 'ABC'){const first=steps[state.chapter].find(x=>x.task===t);if(!first)continue;const b=el('button','',`Task ${t}`);b.type='button';b.dataset.step=String(first.index);b.addEventListener('click',()=>go(first.index));taskJump.append(b);}
    $('#curation-step-count').textContent=`${state.positions[state.chapter]+1} / ${steps[state.chapter].length} · ${state.completed.filter(id=>steps[state.chapter].some(s=>s.id===id)).length} 已完成`;
    const progress=$('#curation-progress');progress.max=steps[state.chapter].length;progress.value=state.positions[state.chapter]+1;
    $('#curation-source').textContent=pageLabel(step);$('#curation-title').textContent=step.title;$('#curation-quote').textContent=step.quote;
    $('#curation-quote').hidden=step.chapter==='categorize';
    $('#curation-bookmark').textContent=state.bookmarks.includes(step.id)?'★':'☆';$('#curation-bookmark').setAttribute('aria-pressed',String(state.bookmarks.includes(step.id)));
    $('#curation-prev').disabled=step.index===0;$('#curation-next').textContent=step.index===steps[state.chapter].length-1?'完成本章 ✓':'下一步 →';
    $('#curation-spotlight').checked=state.spotlight;$('#curation-dialogue').checked=state.dialogue;dock.classList.toggle('dialogue',state.dialogue);$('.curation-character').hidden=!state.dialogue;
    explanation(step);renderBank();if(step.cue&&audio&&!audio.paused&&audio.currentTime<step.cue.at)cueArmed=true;if(focus)focusSource(step);else spotlight();persist();
  }
  function setOpen(value){open=value;dock.hidden=!value;bank.hidden=!value;document.body.classList.toggle('curation-active',value);if(!value)$$('.curation-target').forEach(x=>x.classList.remove('curation-target'));toggle.setAttribute('aria-pressed',String(value));toggle.textContent=value?'✦ 離開 Curation':'✦ Super Curation';if(value)render();else{masks.forEach(m=>m.hidden=true);audio?.pause();}}
  async function flyToBank(step){if(!step.target||step.provisional)return;const t=step.bankTask||(canBank(step.record)?'ABC'[step.type-1]:null);if(!t||state.evidence[t].includes(step.id))return;const normalized=normalize(step.quote);if(state.evidence[t].some(id=>{const old=chapters.flatMap(c=>steps[c.id]).find(x=>x.id===id);return old&&normalize(old.quote)===normalized;}))return;
    const from=step.target.getBoundingClientRect(),to=$(`.curation-bank-${t} summary`).getBoundingClientRect();
    if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&from.width&&to.width){const flying=el('div',`curation-flying curation-flying-${t}`,step.quote);document.body.append(flying);Object.assign(flying.style,{left:`${from.left}px`,top:`${from.top}px`,width:`${Math.min(from.width,420)}px`});await new Promise(resolve=>{requestAnimationFrame(()=>{flying.style.transform=`translate(${to.left-from.left}px,${to.top-from.top}px) scale(.3)`;flying.style.opacity='0';});flying.addEventListener('transitionend',resolve,{once:true});setTimeout(resolve,700);});flying.remove();}
    state.evidence[t].push(step.id);renderBank();persist();
  }
  function go(stepIndex){state.positions[state.chapter]=Math.min(Math.max(stepIndex,0),steps[state.chapter].length-1);render();}
  $('#curation-step-jump').addEventListener('change',e=>go(Number(e.target.value)));$('#curation-bookmark-jump').addEventListener('change',e=>{const id=e.target.value;for(const ch of chapters){const found=steps[ch.id].find(x=>x.id===id);if(found){state.chapter=ch.id;state.positions[ch.id]=found.index;render();break;}}});toggle.addEventListener('click',()=>setOpen(!open));$('#curation-close').addEventListener('click',()=>setOpen(false));
  nav.addEventListener('click',e=>{const id=e.target.closest('[data-chapter]')?.dataset.chapter;if(!id)return;state.chapter=id;render();});$('#curation-chapter-select').addEventListener('change',e=>{state.chapter=e.target.value;render();});
  $('#curation-prev').addEventListener('click',()=>go(state.positions[state.chapter]-1));
  $('#curation-next').addEventListener('click',async()=>{if(animation)return;animation=true;const step=current();if(step.chapter==='data'||step.chapter==='podcast')await flyToBank(step);if(!state.completed.includes(step.id))state.completed.push(step.id);if(step.index<steps[state.chapter].length-1)go(step.index+1);else{render(false);$('#curation-save-status').textContent='本章完成 · 可自由切換其他章節，或回來重做。';}animation=false;});
  $('#curation-help').addEventListener('click',()=>{const step=current();helpOpen=true;explanation(step);const extra=$('#curation-step-actions');if(step.chapter==='boss')extra.append(el('p','curation-extra-help','用四個問題讀這句：我以誰的身份寫？寫給誰？文類是甚麼？哪份資料可作來源？'));if(step.chapter==='data')extra.append(el('p','curation-extra-help',`回到 Task ${step.task} 的要求，核對年份、說話者和是否有後來的更正。只有可直接使用且沒有被淘汰的句子才會入庫。`));if(step.chapter==='writing')extra.append(el('p','curation-extra-help',step.hint));});
  $('#curation-bookmark').addEventListener('click',()=>{const id=current().id;state.bookmarks=state.bookmarks.includes(id)?state.bookmarks.filter(x=>x!==id):[...state.bookmarks,id];render(false);});
  $('#curation-spotlight').addEventListener('change',e=>{state.spotlight=e.target.checked;spotlight();persist();});$('#curation-dialogue').addEventListener('change',e=>{state.dialogue=e.target.checked;render(false);});
  slotSel.addEventListener('change',()=>{persist();activeSlot=slotSel.value;state=sanitize(slots[activeSlot]);render();});$('#curation-save-now').addEventListener('click',persist);
  $('#curation-export').addEventListener('click',()=>{persist();const data={version:VERSION,created:new Date().toISOString(),state};const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=el('a');a.href=url;a.download=`paper3-2025-b2-curation-slot-${activeSlot}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
  $('#curation-import').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{if(file.size>1024*1024)throw Error('存檔過大');const value=JSON.parse(await file.text());if(value.version!==VERSION||!value.state||typeof value.state!=='object')throw Error('這不是 2025 B2 的有效存檔');state=sanitize(value.state);persist();render();$('#curation-save-status').textContent=`已匯入至 Slot ${activeSlot}`;}catch(error){$('#curation-save-status').textContent=`匯入失敗：${error.message}`;}e.target.value='';});
  if(audio){audio.addEventListener('play',()=>{if(!open||state.chapter!=='podcast')return;const cue=current()?.cue;cueArmed=!!cue&&audio.currentTime<cue.at-0.15;});audio.addEventListener('timeupdate',()=>{if(!cueArmed||!open||state.chapter!=='podcast')return;const cue=current()?.cue;if(cue&&audio.currentTime>=cue.at){cueArmed=false;audio.pause();audio.currentTime=cue.at;$('#curation-save-status').textContent=`錄音停在 ${cue.title} 段落 · 先聽、記筆記，再按下一步`;focusSource(current());}});}
  window.addEventListener('scroll',spotlight,{passive:true});window.addEventListener('resize',()=>{spotlight();if(open&&innerWidth<=620)setTimeout(()=>focusSource(current()),80);});window.visualViewport?.addEventListener('resize',spotlight);
  document.addEventListener('keydown',e=>{if(!open)return;if(e.key==='Escape'&&document.activeElement?.tagName!=='TEXTAREA')setOpen(false);});
  // Deep links allow teachers to send a chapter without exposing any unvisited evidence.
  if(new URLSearchParams(location.search).get('curation')==='1')setOpen(true);
})();
