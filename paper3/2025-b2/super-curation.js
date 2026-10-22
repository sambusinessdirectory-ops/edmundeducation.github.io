(() => {
  'use strict';
  const core = window.EdmundSentenceAnalysis;
  const benchmark = window.EDMUND_B2_SENTENCE_ANALYSIS?.records;
  const referenceHighlights = window.EDMUND_B2_CURATION_HIGHLIGHTS || {};
  if (!core || !benchmark || !document.querySelector('#page-4 .sentence-item')) return;

  const VERSION = '2025-b2-super-curation-v1';
  const STORAGE = 'edmund-paper3-2025-b2-curation-v1';
  const chapters = [
    {id:'boss', name:'1 · Boss letter', short:'任務指示', description:'先找寫作身分、文類、讀者、內容要求和指定來源。'},
    {id:'categorize', name:'2 · Data categorization', short:'資料分類', description:'先按題目與文件標題作暫定分類，再在閱讀後修正。'},
    {id:'podcast', name:'3 · Podcast', short:'聆聽錄音', description:'聽到應記的答案後暫停，逐項寫入筆記，再看逐句稿。'},
    {id:'data', name:'4 · Data File / Fact file', short:'逐句取證', description:'按資料頁連續閱讀；讀到跨任務線索，就換相應顏色並追加標記。'},
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
    {page:5,title:'活動篩選電郵',initial:'Boss letter 指向這串電郵，先標 Task A；只把它當來源路線，未讀完前別抄活動名。',revision:'從最早一封往最新一封讀。Task A 的舊活動要受最新決定約束；新活動的線索則留給 Task B。',tasks:['A','B']},
    {page:6,title:'2024 健康月原海報',initial:'標 Task A 的候選資料。這是 2024 年海報，不能假定每項活動在 2025 年都再辦。',revision:'逐項和第 5 頁最新電郵及錄音核對。保留獲確認活動，刪除取消或改動的細節。',tasks:['A']},
    {page:7,title:'校園電視完整訪問',initial:'Boss letter 要 student feedback；先標 Task A，留意訪談的說話者。',revision:'學生的評價支援 Task A；家長義工與親子互動的經驗可轉給 Task C。分類可在讀到後半段時追加。',tasks:['A','C']},
    {page:8,title:'WhatsApp 完整對話',initial:'Boss letter 指向 WhatsApp 作 proposal 起點，先標 Task B。',revision:'圈出活動目的與運動篩選條件；校長仍待看 proposal，不能寫成已批准。',tasks:['B']},
    {page:9,title:'家長職責與交通安排',initial:'Boss letter 指向 Singh 電郵處理家長義工，先標 Task C。',revision:'讀下去才會發現交通與海灘選擇也支援 Task B；將資料分別存入兩個任務。',tasks:['C','B']},
    {page:10,title:'網誌、原圖表與運動電郵',initial:'先看各文件標題：家長參與網誌指向 Task C，運動電郵指向 Task B。',revision:'網誌的社會／氣氛理由須轉述；運動電郵提供排除條件。圖表不要不加解釋地當成健康月校內數據。',tasks:['C','B']},
    {page:11,title:'運動雜誌完整文章',initial:'按 WhatsApp 的選項條件，先標 Task B；不是所有介紹的運動都合適。',revision:'把每項運動與新鮮感、活動量、初學者難度、水上風險和交通條件逐一對照，排除不合者。',tasks:['B']},
    {page:3,title:'聆聽筆記表',initial:'先看筆記表的欄目。Wellness Month 及家長參與分別指向 Task A 和 Task C；Asian Games Week 是這三篇作文的干擾。',revision:'錄音核對後，把健康月活動寫進 Task A，把家長義工、簡介會及報名方式寫進 Task C。',tasks:['A','C']}
  ];
  const categoryInitialTasks=entry=>entry.page===3?[]:entry.page===10?['B','C']:[entry.tasks[0]];
  // Answer endpoints aligned to the supplied 8:37.5 recording with word-level speech timing.
  const podcastCues = [
    {id:'slogan',at:69.8,page:12,quote:'One Games, One Asia',title:'記下最後口號',field:'slogan',note:'One Games, One Asia',help:'口號中間有逗號。Passion, Pride, Performance 是先提出、後來沒有採用的版本。'},
    {id:'opening-date',at:122.4,page:13,quote:'the 13th of October',title:'開幕日期改為 10 月 13 日',field:'opening',note:'13 October',help:'6 October 是先前提議；因 7 日假期而改成 13 October。'},
    {id:'opening-time',at:138.6,page:13,quote:'just an afternoon',title:'記開幕時段',field:'opening',note:'Guest speaker; afternoon',help:'嘉賓活動只需一個下午，不是全日。'},
    {id:'opening-venue',at:167.5,page:14,quote:'Hold it in the Main Hall',title:'場地最後選禮堂',field:'opening',note:'Main Hall',help:'sports ground 是早期想法；最後為免天氣影響，改在 Main Hall。'},
    {id:'july',at:174.6,page:14,quote:'Wellness Month starts in July',title:'先搵月份',field:'wellness',note:'July',task:'A',help:'健康月在七月，亞運週在十月；不要把兩件活動的日期合併。'},
    {id:'after-exams',at:212.2,page:14,quote:'Wellness Month is just after the students finish their exams',title:'記舉辦時機',field:'wellness',note:'After students finish exams',task:'A',help:'「考試後」支援文章引入與放鬆的需要。'},
    {id:'theme',at:226.4,page:14,quote:'Relax and Recover fits in well',title:'主題最後確定',field:'wellness',note:'Theme: Relax and Recover',task:'A',help:'Hiking 因七月炎熱被否定；Relax and Recover 才是最後決定。'},
    {id:'yoga',at:239.4,page:14,quote:'Yoga and Meditation sessions were a big hit',title:'瑜伽與冥想再辦',field:'wellness',note:'Yoga and Meditation sessions again',task:'A',help:'這裡確認今年再辦，可用於 Task A。'},
    {id:'focus',at:257.4,page:15,quote:'Yoga can improve your focus and attention span',title:'記新宣傳好處',field:'wellness',note:'Yoga: improves focus and attention span',task:'A',help:'這項好處可放進校刊文章，但要自然轉述。'},
    {id:'instructors',at:299.6,page:15,quote:'I can get two famous instructors for sure',title:'記已確認導師數目',field:'wellness',note:'Two famous instructors; names not confirmed',task:'A',help:'只可寫兩位知名導師；姓名仍未確認。'},
    {id:'speech-topic',at:346.5,page:15,quote:'why they think their sport should be added to the Asian Games',title:'記嘉賓演講方向',field:'topic',note:'Athlete: why their sport should be added to the Asian Games',help:'嘉賓姓名未定；確定的是演講方向。'},
    {id:'topic-survey',at:365.1,page:15,quote:'set up a survey',title:'記學生問卷',field:'topic',note:'Survey students about sports they want to hear about',help:'校長會調查學生希望聽哪種運動，之後才選嘉賓。'},
    {id:'discussion',at:381.4,page:16,quote:'holding a discussion about the sport',title:'記演講後討論',field:'after',note:'Discussion about the sport after the speech',help:'演講之後安排討論，增加互動。'},
    {id:'questions',at:403.2,page:16,quote:'plenty of time for students to ask questions',title:'記學生提問時間',field:'after',note:'Allow plenty of time for student questions',help:'除了討論，還要給學生充足時間提問。'},
    {id:'parent-records',at:434.3,page:16,quote:'check our records and see what responsibilities the parents had',title:'義工職責先待核對',field:'parents',note:'Check Mr Singh’s email for actual parent responsibilities',task:'C',help:'錄音此時沒有列出具體職責；稍後要回看 Singh 電郵。'},
    {id:'briefing',at:447.9,page:16,quote:'parents were asked to attend a briefing session',title:'記義工簡介會',field:'parents',note:'Parents attend a briefing session before helping',task:'C',help:'曾有簡介會，這年也同意安排類似做法。'},
    {id:'app',at:472.2,page:17,quote:'through the school app',title:'報名方法被更正',field:'parents',note:'Sign up through the school app (not website)',task:'C',help:'school website 隨即被更正；最後方法是 school app。'},
    {id:'letter',at:487.7,page:17,quote:'Nico Lin, president of the Healthy Living Club, to write the letter',title:'確認家長信作者',field:'parents',note:'Nico Lin writes the invitation letter to parents',task:'C',help:'Nico 的身份及信件目的可幫助你掌握 Task C 的文類和語氣。'},
    {id:'end',at:517.2,page:17,quote:'See you later',title:'錄音完結 · 核對筆記',field:null,note:null,help:'六個欄目已按錄音順序完成。現在可在逐句稿核對取證與淘汰內容。'}
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
  const transcriptSentences=[];const v3TranscriptTargets=[];
  $$('.page[data-kind="transcript"] .recording-script .speech').forEach(speech=>{
    const line=$('p[lang="en"]',speech);if(!line)return;
    const page=Number(speech.closest('.page').id.replace('page-',''));
    const speaker=$('.speaker',speech)?.textContent||'';
    const text=line.textContent;
    const legacyRichLine=line.childElementCount>0;
    const parts=core.sentences(text);
    const wrapped=[];
    for(const part of parts.slice().reverse()){
      const walker=document.createTreeWalker(line,NodeFilter.SHOW_TEXT),nodes=[];let node,offset=0;
      while((node=walker.nextNode())){nodes.push({node,start:offset,end:offset+node.length});offset+=node.length;}
      const first=nodes.find(item=>item.end>part.start),last=nodes.find(item=>item.end>=part.end);if(!first||!last)continue;
      const range=document.createRange();range.setStart(first.node,part.start-first.start);range.setEnd(last.node,part.end-last.start);
      const span=el('span','curation-transcript-sentence');span.append(range.extractContents());range.insertNode(span);wrapped.unshift(span);
    }
    for(const [index,span] of wrapped.entries()){transcriptSentences.push({span,page,speaker});if(!legacyRichLine||index===0)v3TranscriptTargets.push(span);}
  });
  const noteSheet=$('#page-3 .note-sheet');
  const noteSheetMarks=[
    {id:'asian-week',selector:'h3:first-of-type',title:'亞運週欄目',kind:'noise',help:'這欄要按錄音完成聆聽筆記；它不提供 B2 三篇健康月寫作的內容。'},
    {id:'slogan',selector:'label[for="notes-slogan"]',title:'口號欄',kind:'noise',help:'仍要聽清楚最後口號並填進筆記表；對三篇 B2 作文則不取證。'},
    {id:'opening',selector:'label[for="notes-opening"]',title:'開幕活動欄',kind:'noise',help:'日期、時段和場地需要在錄音中核對並寫在這裡；不要混進健康月作文。'},
    {id:'wellness',selector:'h3:nth-of-type(2)',title:'健康月欄目',kind:'task',task:'A',help:'健康月的時間、主題、活動和宣傳賣點支援 Task A。聽到更新時才逐項寫下。'},
    {id:'guest',selector:'h3:nth-of-type(3)',title:'亞運嘉賓欄目',kind:'noise',help:'嘉賓演講內容要記在聆聽筆記；不屬三篇 B2 健康月寫作。'},
    {id:'topic',selector:'label[for="notes-topic"]',title:'演講主題欄',kind:'noise',help:'仍要記下最後確定的演講方向；B2 作文不採用。'},
    {id:'after',selector:'label[for="notes-after"]',title:'演講之後欄',kind:'noise',help:'仍要記下演講後的討論和提問安排；B2 作文不採用。'},
    {id:'parents',selector:'h3:nth-of-type(4)',title:'家長參與欄目',kind:'task',task:'C',help:'義工簡介會、報名方法與家長信相關。職責要再核對 Singh 電郵。'}
  ];
  if(noteSheet)for(const mark of noteSheetMarks){
    const item=$(mark.selector,noteSheet);if(!item)continue;mark.target=item;item.dataset.noteMark=mark.id;
    if(mark.kind==='task'){item.classList.add('curation-note-task',`curation-note-task-${mark.task}`);item.dataset.task=mark.task;}
    else {const ink=el('span','curation-pen-line');while(item.firstChild)ink.append(item.firstChild);item.append(ink);item.classList.add('curation-note-noise');}
  }
  const sourceItems = $$('.page[data-kind="data"] .sentence-item');
  sourceItems.forEach((span,index) => {
    const page=Number(span.closest('.page')?.id?.replace('page-',''));
    if(page<4||page>11) return;
    const section=sourceSection(span);
    const text=span.textContent.trim();
    const record=recordFor(text,section,span.parentElement?.textContent||'');
    const emailIndex=page===5?$$('#page-5 .email').indexOf(span.closest('.email')):-1;const base={id:`source-${page}-${index}`,target:span,page,quote:text,record,type:typeOf(record),order:index,section,provisional:emailIndex>0 && typeOf(record)===1};
    if(page===4) steps.boss.push({...base,chapter:'boss',title:'Boss letter · 讀任務與來源',task:null});
    else steps.data.push({...base,chapter:'data',title:'Data File · 逐句判讀',task:inferTask(page,section,record,text)});
  });
  categoryPages.forEach((entry,index)=>steps.categorize.push({id:`category-${entry.page}`,chapter:'categorize',title:entry.title,page:entry.page,quote:entry.title,target:$(`#page-${entry.page} .page-heading h2`),entry,order:index}));
  for(const mark of noteSheetMarks){if(!mark.target)continue;steps.categorize.push({id:`category-note-${mark.id}`,chapter:'categorize',title:`聆聽筆記表 · ${mark.title}`,page:3,quote:mark.target.textContent.trim(),target:mark.target,noteMark:mark,order:steps.categorize.length});}
  podcastCues.forEach((cue,index)=>{const transcriptTarget=transcriptSentences.find(item=>item.page===cue.page&&normalize(item.span.textContent).includes(normalize(cue.quote)))?.span;const target=cue.field?$(`#notes-${cue.field}`):$('#page-3 .notes-audio audio');steps.podcast.push({id:`cue-${cue.id}`,chapter:'podcast',title:cue.title,page:cue.page,quote:transcriptTarget?.textContent.trim()||cue.quote,target:target||transcriptTarget,transcriptTarget,cue:{...cue,from:index?podcastCues[index-1].at:0},bankTask:['parent-records','letter'].includes(cue.id)?null:cue.task,order:index});});
  for(const task of ['A','B','C']) writingPrompts[task].forEach(([title,lead,hint],index)=>steps.writing.push({id:`writing-${task}-${index}`,chapter:'writing',title:`Task ${task} · ${title}`,quote:title,lead,hint,task,order:index,target:$('#practice')}));
  // Preserve the old order only to migrate existing save-slot positions.
  const pageRank={A:[5,6,7,8,9,10,11],B:[8,9,10,11,5,6,7],C:[9,10,7,5,6,8,11]};
  const legacyTaskOrder=(a,b)=>{
    if(a.task!==b.task)return 'ABC'.indexOf(a.task)-'ABC'.indexOf(b.task);
    const pd=pageRank[a.task].indexOf(a.page)-pageRank[b.task].indexOf(b.page);if(pd)return pd;
    if([5,9].includes(a.page)){
      const emails=$$(`#page-${a.page} .email`);
      const ai=emails.indexOf(a.target.closest('.email')),bi=emails.indexOf(b.target.closest('.email'));
      if(ai>=0&&bi>=0&&ai!==bi)return bi-ai;
    }
    return a.order-b.order;
  };
  const candidateIds=new Set(['duncan-henley-emails-9','duncan-henley-emails-11','duncan-henley-emails-12','duncan-henley-emails-19']);
  const legacyDataSteps=steps.data.slice().sort(legacyTaskOrder);
  const legacyConfirmed=legacyDataSteps.filter(step=>step.task==='A'&&step.page===5&&candidateIds.has(step.record?.id)).map(step=>({...step,id:`${step.id}-confirmed`}));
  const legacyLastA=legacyDataSteps.findLastIndex(step=>step.task==='A'&&step.page===5);
  if(legacyLastA>=0)legacyDataSteps.splice(legacyLastA+1,0,...legacyConfirmed);
  const legacyDataIds=legacyDataSteps.map(step=>step.id);
  // Keep reading the current page when its evidence changes task; only email threads run oldest to newest.
  steps.data.sort((a,b)=>{
    if(a.page!==b.page)return a.page-b.page;
    if([5,9].includes(a.page)){
      const emails=$$(`#page-${a.page} .email`);
      const ai=emails.indexOf(a.target.closest('.email')),bi=emails.indexOf(b.target.closest('.email'));
      if(ai>=0&&bi>=0&&ai!==bi)return bi-ai;
    }
    return a.order-b.order;
  });
  // Revisit earlier proposals at the end of page 5 after the newest email confirms the choices.
  const confirmed=steps.data.filter(step=>step.page===5&&candidateIds.has(step.record?.id)).map(step=>({...step,id:`${step.id}-confirmed`,title:'回看舊電郵 · 核對後才取證',provisional:false,confirmed:true}));
  const lastPageFive=steps.data.findLastIndex(step=>step.page===5);
  if(lastPageFive>=0)steps.data.splice(lastPageFive+1,0,...confirmed);
  const v2DataIds=steps.data.map(step=>step.id);
  const v2CategoryIds=categoryPages.filter(entry=>entry.page!==3).map(entry=>`category-${entry.page}`);
  const v3CategoryIds=['category-3',...v2CategoryIds];
  const v3PodcastIds=['july','after-exams','theme','yoga','focus','instructors','briefing','app'].map(id=>`cue-${id}`);
  // A page cue is read in context, visited immediately, then returned to its original reading position.
  const sourceRoutes={
    'duncan-henley-emails-17':{page:6,task:'A',name:'2024 健康月原海報'},
    'whatsapp-chat-14':{page:9,task:'B',name:'交通與場地電郵'},
    'whatsapp-chat-16':{page:9,task:'B',name:'Manraj 電郵'},
    'whatsapp-chat-17':{page:9,task:'B',name:'Manraj 電郵'},
    'duncan-singh-emails-8':{page:10,task:'C',name:'家長參與網誌'},
    'duncan-singh-emails-11':{page:8,task:'B',name:'三個候選海灘'},
    'sports-email-2':{page:11,task:'B',name:'運動雜誌完整文章'},
    'sports-email-7':{page:11,task:'B',name:'運動雜誌完整文章'}
  };
  for(let i=steps.data.length-1;i>=0;i--){
    const cue=steps.data[i],duplicate=(cue.section==='whatsapp-chat'&&/^I[’']ll get him to ask/i.test(cue.quote))||(cue.record?.id==='sports-email-7'&&/^Have a read through/i.test(cue.quote));
    const route=!cue.confirmed&&!duplicate&&(cue.quote.startsWith('Ask Manraj in the School Events Team')?sourceRoutes['whatsapp-chat-16']:cue.record?.id==='whatsapp-chat-16'?null:sourceRoutes[cue.record?.id]);if(!route)continue;
    cue.route=route;cue.target.dataset.curationRoutePage=String(route.page);
    steps.data.splice(i+1,0,
      {id:`route-visit-${cue.id}`,chapter:'data',routeVisit:true,routeFrom:cue.id,route,page:route.page,quote:`第 ${route.page} 頁 · ${route.name}`,title:`跟線索到第 ${route.page} 頁`,target:$(`#page-${route.page} .page-heading h2`),type:5},
      {id:`route-return-${cue.id}`,chapter:'data',routeReturn:true,routeFrom:cue.id,route,page:cue.page,quote:cue.quote,title:'回到原句 · 繼續閱讀',target:cue.target,type:5});
  }
  // After the guided answer pauses, every transcript sentence has its own optional review step.
  const transcriptKind=(page,quote)=>{
    if(page===12&&/Wellness Month in July/i.test(quote))return 'mixed';
    if((page===14&&/Wellness Month starts in July|students finish their exams|Relax and Recover fits|Let's go with that|Yoga and Meditation sessions were a big hit|run these again this year|focus on another benefit/i.test(quote))||(page===15&&/focus and attention span|Mention this benefit|two famous instructors|can't use their names just yet|names just yet|great selling point|students who struggle|help them out|celebrity Yoga instructors|popular last year/i.test(quote)))return 'A';
    if((page===16&&/Mr Singh on the Events Team|check our records|briefing session|similar arrangement this year|don’t quite remember exactly what their responsibilities were|don't quite remember exactly what their responsibilities were|need some help once the Wellness Month begins|parents involved in the events|difficult to get parents to sign up/i.test(quote))||(page===17&&/through the school app|Through the app|letter from one of the students|Nico Lin, president|write the letter/i.test(quote)))return 'C';
    if((page===12&&/One Games, One Asia|comma in between/i.test(quote))||(page===13&&/going with One Games|13th of October|just an afternoon/i.test(quote))||(page===14&&/Hold it in the Main Hall|better hold it in the Main Hall/i.test(quote))||(page===15&&/athlete who represents an interesting sport|sport should be added to the Asian Games|set up a survey/i.test(quote))||(page===16&&/discussion about the sport|time for students to ask questions|plenty of time for students to ask questions/i.test(quote)))return 'listening';
    return 'strike';
  };
  transcriptSentences.forEach(({span,page,speaker},index)=>{
    const quote=span.textContent.trim(),kind=transcriptKind(page,quote),bankTask='ABC'.includes(kind)?kind:null;
    span.classList.add(`curation-transcript-${kind}`);
    if(kind==='mixed'){const walker=document.createTreeWalker(span,NodeFilter.SHOW_TEXT);let node;while((node=walker.nextNode())){const at=node.textContent.indexOf('Wellness Month in July');if(at<0)continue;const range=document.createRange();range.setStart(node,at);range.setEnd(node,at+'Wellness Month in July'.length);const mark=el('mark','curation-transcript-inline-A');mark.append(range.extractContents());range.insertNode(mark);break;}}
    if(kind==='strike'){const ink=el('span','curation-pen-line');while(span.firstChild)ink.append(span.firstChild);span.append(ink);}
    steps.podcast.push({id:`transcript-${page}-${index}`,chapter:'podcast',title:`逐句錄音稿 · ${speaker}`,page,quote,target:span,transcript:true,bankTask,kind,order:index,speaker});
  });
  const transcriptCueIndex=transcriptSentences.map((item,index)=>{
    const next=steps.podcast.findIndex(step=>step.cue&&step.transcriptTarget&&transcriptSentences.findIndex(t=>t.span===step.transcriptTarget)>=index);
    return next<0?podcastCues.length-1:next;
  });
  const legacyBossIds=steps.boss.map(step=>step.id);
  const bossAnnotations=[
    {find:'draft an article',marks:[['an article','A'],['the Wellness Month','A']]},
    {find:'The article should give',marks:[['basic information about the three events from 2024','A','1'],['decided to include again','A']]},
    {find:'Make sure to include student feedback',marks:[['student feedback on the 2024 Wellness Month','A','2']]},
    {find:'refer to the emails between',marks:[['emails between Ms Henley and I to begin with','hint']]},
    {find:'draft a proposal',marks:[['a proposal','B'],['Sports Day at the Beach','B']]},
    {find:'brand-new event',marks:[['Dr Chan’s approval first','hint']]},
    {find:'Make sure you explain why',marks:[['explain why we are proposing this new event','B','1'],['which two sports we’ve chosen','B','2'],['some basic information about them','B','3'],['why we included these sports','B','4']]},
    {find:'included screenshots of a WhatsApp',marks:[['screenshots of a WhatsApp chat between Ms Henley and Dr Chan, which would be a good place to start','hint']]},
    {find:'write a letter to parents',marks:[['a letter to parents','C']]},
    {find:'highlight the benefits',marks:[['highlight the benefits','C','1'],['outline the responsibilities','C','2'],['how they can get involved','C','3']]},
    {find:'discussing this over email',marks:[['discussing this over email with Mr Singh','hint']]},
    {find:'sent you this exchange',marks:[['this exchange to read','hint']]},
    {find:'recording of our meeting',marks:[['recording of our meeting with Ms Henley','hint']]}
  ];
  function markPhrase(root,phrase,kind,point,stepId){
    const text=root.textContent;const canonical=value=>value.replace(/[’‘]/g,"'");const at=canonical(text).indexOf(canonical(phrase));if(at<0)return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const nodes=[];let node;let offset=0;
    while((node=walker.nextNode())){nodes.push({node,start:offset,end:offset+node.length});offset+=node.length;}
    const first=nodes.find(n=>n.end>at),last=nodes.find(n=>n.end>=at+phrase.length);
    if(!first||!last)return;
    const range=document.createRange();range.setStart(first.node,at-first.start);range.setEnd(last.node,at+phrase.length-last.start);
    const mark=el('mark',`curation-mark curation-mark-${kind}`);if(phrase.length<=25)mark.classList.add('curation-short-phrase');mark.dataset.stepId=stepId;if(point)mark.dataset.point=point;
    mark.append(range.extractContents());range.insertNode(mark);
  }
  function highlightPanelPhrase(root,phrase,color){
    const canonical=value=>value.replace(/[’‘]/g,"'");
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;
    while((node=walker.nextNode())){
      if(node.parentElement.closest('.curation-reference-mark'))continue;
      const at=canonical(node.textContent).toLocaleLowerCase().indexOf(canonical(phrase).toLocaleLowerCase());if(at<0)continue;
      const range=document.createRange();range.setStart(node,at);range.setEnd(node,at+phrase.length);
      const mark=el('mark',`curation-reference-mark curation-reference-${color}`);mark.append(range.extractContents());range.insertNode(mark);return true;
    }
    return false;
  }
  function syncDataMarks(){
    const limit=progressCutoff('data');
    const seen=new Set(steps.data.slice(0,limit+1).map(step=>step.target));
    const noteLimit=progressCutoff('categorize');
    for(const mark of noteSheetMarks){const visible=steps.categorize.find(item=>item.noteMark===mark)?.index<=noteLimit;mark.target?.classList.toggle('is-revealed',visible);}
    $$('.curation-source-mark').forEach(mark=>mark.classList.toggle('is-revealed',seen.has(mark.closest('.sentence-item'))));
    $$('.curation-source-fallback').forEach(sentence=>sentence.classList.toggle('is-revealed',seen.has(sentence)));
    const latestReply=steps.data.findIndex(step=>step.record?.id==='duncan-henley-emails-2');
    $$('.curation-strike').forEach(sentence=>{
      const step=steps.data.find(item=>item.target===sentence&&item.record)||steps.boss.find(item=>item.target===sentence&&item.record);
      const boss=step?.chapter==='boss';const visible=boss?steps.boss.indexOf(step)<=progressCutoff('boss'):seen.has(sentence);
      const provisional=step?.record?.id==='duncan-henley-emails-18'||step?.record?.id==='duncan-henley-emails-13';
      sentence.classList.toggle('is-revealed',visible&&(!provisional||limit>=latestReply));
    });
  }
  function protectBossTail(root){
    const match=root.textContent.match(/(?:[A-Za-z][\w’'-]*\s+){2}[A-Za-z][\w’'-]*[.!?]?$/);
    if(!match)return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;
    while((node=walker.nextNode())){
      if(node.parentElement.closest('.curation-mark'))continue;
      const index=node.textContent.lastIndexOf(match[0]);if(index<0)continue;
      const range=document.createRange();range.setStart(node,index);range.setEnd(node,index+match[0].length);
      const nowrap=el('span','curation-no-orphan');nowrap.append(range.extractContents());range.insertNode(nowrap);return;
    }
  }
  function protectBossHead(root){
    const match=root.textContent.match(/^(?:[A-Za-z][\w’'-]*\s+){2}[A-Za-z][\w’'-]*/);
    if(!match)return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;
    while((node=walker.nextNode())){
      if(node.parentElement.closest('.curation-mark'))continue;
      const index=node.textContent.indexOf(match[0]);if(index<0)continue;
      const range=document.createRange();range.setStart(node,index);range.setEnd(node,index+match[0].length);
      const nowrap=el('span','curation-no-orphan');nowrap.append(range.extractContents());range.insertNode(nowrap);return;
    }
  }
  for(const step of steps.boss){
    const spec=bossAnnotations.find(entry=>step.quote.includes(entry.find));if(!spec)continue;
    step.task=spec.marks.find(mark=>/[ABC]/.test(mark[1]))?.[1]||null;
    for(const [phrase,kind,point] of spec.marks)markPhrase(step.target,phrase,kind,point,step.id);
    protectBossHead(step.target);
    protectBossTail(step.target);
    const paragraph=step.target.closest('p[lang="en"]');if(paragraph&&step.task)paragraph.dataset.curationTask=step.task;
  }
  // A green source cue is followed immediately by a visit to that source, then the next boss sentence.
  const bossRoutes=[
    {find:'refer to the emails between',page:5,task:'A',name:'Duncan ↔ Henley 電郵',note:'Boss letter 指向這串電郵。立即在第 5 頁標 Task A；稍後逐封核對才取內容點。'},
    {find:'brand-new event',page:8,task:'B',name:'WhatsApp 對話',note:'新活動仍待 Dr Chan 批准。先把相關對話暫標 Task B，不可當成已獲批准。'},
    {find:'included screenshots of a WhatsApp',page:8,task:'B',name:'WhatsApp 對話',note:'這句直接指定 WhatsApp 作 proposal 起點；在第 8 頁標 Task B。'},
    {find:'discussing this over email with Mr Singh',page:9,task:'C',name:'Duncan ↔ Singh 電郵',note:'Boss letter 指向 Singh 電郵。先在第 9 頁標 Task C，後續讀到交通線索再追加 Task B。'},
    {find:'sent you this exchange',page:9,task:'C',name:'Duncan ↔ Singh 電郵',note:'這封往來電郵是家長信的來源線索。確認第 9 頁已有 Task C 標記。'},
    {find:'recording of our meeting',page:3,task:null,tasks:[],name:'會議錄音',note:'這句指定會議錄音。立即找到第 3 頁的播放器；錄音會在 Podcast 章節逐段處理。'}
  ];
  for(let i=steps.boss.length-1;i>=0;i--){
    const cue=steps.boss[i],route=bossRoutes.find(item=>cue.quote.includes(item.find));if(!route)continue;
    const target=route.page===3?$('#page-3 .notes-audio')||$('#page-3 .page-heading h2'):$(`#page-${route.page} .page-heading h2`);
    steps.boss.splice(i+1,0,{id:`source-route-${cue.id}`,chapter:'boss',sourceJump:true,sourceFrom:cue.id,title:`即時標記來源 · ${route.name}`,page:route.page,tagTask:route.task,tagTasks:route.tasks,quote:route.note,target});
  }
  const v2BossIds=steps.boss.map(step=>step.id);
  for(const ch of chapters)steps[ch.id].forEach((step,index)=>{step.index=index;step.total=steps[ch.id].length;});
  // Preserve the PDF's exact phrase colors, then fill Type 1–4 gaps from the author's bullet points.
  const isElimination=step=>step.record?.blocks?.some(block=>block.startsWith('類型：')&&/淘汰線索|不應直接採用/.test(block));
  const attachStrike=step=>{if(!step.target||step.target.classList.contains('curation-strike'))return;const ink=el('span','curation-pen-line');while(step.target.firstChild)ink.append(step.target.firstChild);step.target.append(ink);step.target.classList.add('curation-strike');};
  for(const step of [...steps.boss,...steps.data]){
    if(!step.record)continue;
    step.target.dataset.curationType=String(step.type);
    if(step.type===6||isElimination(step))attachStrike(step);
  }
  const colorForStep=step=>({1:'cyan',2:'yellow',3:'rose',4:'green'}[step.type]||(isElimination(step)?({A:'cyan',B:'yellow',C:'rose'}[step.task]||'yellow'):null));
  const markedTargets=new WeakSet();
  function wrapSourcePhrase(root,id,phrase,color){
    const canonical=value=>value.replace(/[’‘]/g,"'");
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;
    while((node=walker.nextNode())){
      if(node.parentElement.closest('.curation-source-mark'))continue;
      const at=canonical(node.textContent).toLocaleLowerCase().indexOf(canonical(phrase).toLocaleLowerCase());if(at<0)continue;
      const range=document.createRange();range.setStart(node,at);range.setEnd(node,at+phrase.length);
      const mark=el('mark',`curation-source-mark curation-reference-${color}`);mark.dataset.recordId=id;mark.append(range.extractContents());range.insertNode(mark);return true;
    }
    return false;
  }
  for(const step of steps.data){
    const id=step.record?.id;if(!id||markedTargets.has(step.target)||(!colorForStep(step)))continue;
    markedTargets.add(step.target);
    for(const item of referenceHighlights[id]?.source||[])wrapSourcePhrase(step.target,id,item.text,colorForStep(step));
    if(!$('.curation-source-mark',step.target)){
      const color=colorForStep(step);
      const bullets=(step.record.blocks||[]).filter(block=>/^●\s*/.test(block)).map(block=>block.replace(/^●\s*/,''));
      for(const phrase of bullets)wrapSourcePhrase(step.target,id,phrase,color);
      if(!$('.curation-source-mark',step.target)){
        step.target.classList.add('curation-source-fallback',`curation-reference-${color}`);
        step.target.dataset.curationRecordId=id;
      }
    }
  }
  function progressCutoff(chapter){
    const active=chapters.findIndex(item=>item.id===state.chapter),target=chapters.findIndex(item=>item.id===chapter);
    return active<target?-1:active>target?steps[chapter].length-1:state.positions[chapter];
  }
  function syncBossMarks(){
    const visible=new Set(steps.boss.slice(0,progressCutoff('boss')+1).map(step=>step.id));
    $$('#page-4 .curation-mark').forEach(mark=>mark.classList.toggle('is-revealed',visible.has(mark.dataset.stepId)));
    $$('#page-4 [data-curation-task]').forEach(paragraph=>paragraph.classList.toggle('curation-task-revealed',!!$('.curation-mark.is-revealed',paragraph)));
  }
  v3PodcastIds.push(...v3TranscriptTargets.map(span=>steps.podcast.find(step=>step.transcript&&step.target===span)?.id).filter(Boolean));
  const allIds=new Set(chapters.flatMap(ch=>steps[ch.id].map(step=>step.id)));
  const blank=()=>({sequenceVersion:4,chapter:'boss',visited:[],positions:Object.fromEntries(chapters.map(ch=>[ch.id,0])),completed:[],bookmarks:[],evidence:{A:[],B:[],C:[]},drafts:{A:'',B:'',C:''},categories:{},heard:[],spotlight:true,dialogue:false,updated:Date.now()});
  const sanitize=raw=>{
    const state=blank();if(!raw||typeof raw!=='object')return state;
    if(chapters.some(ch=>ch.id===raw.chapter))state.chapter=raw.chapter;
    for(const ch of chapters){
      const previous=Math.max(Number(raw.positions?.[ch.id])||0,0);
      const oldIds=raw.sequenceVersion===2?({boss:v2BossIds,categorize:v2CategoryIds,data:v2DataIds}[ch.id]||null):raw.sequenceVersion===3&&ch.id==='categorize'?v3CategoryIds:raw.sequenceVersion===3&&ch.id==='podcast'?v3PodcastIds:raw.sequenceVersion===3?null:ch.id==='boss'?legacyBossIds:ch.id==='data'?legacyDataIds:null;
      const migrated=oldIds?steps[ch.id].findIndex(step=>step.id===oldIds[Math.min(previous,oldIds.length-1)]):previous;
      state.positions[ch.id]=Math.min(Math.max(migrated,0),Math.max(0,steps[ch.id].length-1));
    }
    state.completed=[...new Set((Array.isArray(raw.completed)?raw.completed:[]).filter(id=>allIds.has(id)))];
    state.heard=[...new Set((Array.isArray(raw.heard)?raw.heard:[]).filter(id=>allIds.has(id)))];
    state.visited=[...new Set((Array.isArray(raw.visited)?raw.visited:state.completed).filter(id=>allIds.has(id)))];
    state.bookmarks=[...new Set((Array.isArray(raw.bookmarks)?raw.bookmarks:[]).filter(id=>allIds.has(id)))];
    for(const t of 'ABC'){
      state.evidence[t]=[...new Set((Array.isArray(raw.evidence?.[t])?raw.evidence[t]:[]).filter(id=>allIds.has(id)))];
      state.drafts[t]=typeof raw.drafts?.[t]==='string'?raw.drafts[t].slice(0,30000):'';
    }
    if(raw.categories&&typeof raw.categories==='object')for(const key of Object.keys(raw.categories)){if(/^category-(3|5|6|7|8|9|10|11)$/.test(key))state.categories[key]=Array.isArray(raw.categories[key])?raw.categories[key].filter(x=>'ABC'.includes(x)):[];}state.spotlight=raw.sequenceVersion>=3?raw.spotlight!==false:true;state.dialogue=raw.dialogue===true;return state;
  };
  let slots={};let activeSlot='1';let state=blank();
  try {const stored=JSON.parse(localStorage.getItem(STORAGE)||'{}');if(stored.version===VERSION){slots=stored.slots||{};activeSlot=/^[1-5]$/.test(stored.activeSlot)?stored.activeSlot:'1';state=sanitize(slots[activeSlot]);}}catch{}
  function persist(){state.updated=Date.now();slots[activeSlot]=state;try{localStorage.setItem(STORAGE,JSON.stringify({version:VERSION,activeSlot,slots}));$('#curation-save-status').textContent=`儲存格 ${activeSlot} · 已保存在這部裝置`;}catch{$('#curation-save-status').textContent='儲存失敗，請匯出存檔。';}}

  const toggle=el('button','action-btn curation-launch','✦ Super Curation');toggle.type='button';toggle.id='curation-toggle';toggle.setAttribute('aria-pressed','false');$('.toolbar').append(toggle);
  const dock=el('aside','curation-dock');dock.id='curation-dock';dock.hidden=true;dock.setAttribute('aria-label','Super Curation 指導卡');
  dock.innerHTML=`<div class="curation-top"><span class="curation-kicker">SUPER CURATION · 2025 B2 PILOT</span><button type="button" id="curation-close" aria-label="離開導覽模式">×</button></div><div class="curation-actions"><button type="button" id="curation-prev">← 上一步</button><button type="button" id="curation-help">需要更多協助</button><button type="button" id="curation-next">下一步 →</button></div><div class="curation-header"><span id="curation-chapter"></span><button type="button" id="curation-bookmark" aria-label="將本步加入書籤">☆</button></div><div class="curation-jump"><div><span>跳至步驟</span><button type="button" id="curation-step-jump" aria-haspopup="dialog" aria-controls="curation-picker"></button></div><div><span>書籤</span><button type="button" id="curation-bookmark-jump" aria-haspopup="dialog" aria-controls="curation-picker">選擇書籤</button></div></div><div id="curation-task-jump" class="curation-task-jump" hidden></div><div class="curation-legend" aria-label="資料標記顏色"><span class="color-A">A</span><span class="color-B">B</span><span class="color-C">C</span><span class="color-hint">語氣 / Type 4</span><span class="color-spare">備用</span></div><div class="curation-local-progress"><span id="curation-step-count"></span></div><div class="curation-options"><label><input type="checkbox" id="curation-spotlight"> 聚光燈</label><label><input type="checkbox" id="curation-dialogue"> Eddy 對話</label></div><div class="curation-content"><p id="curation-source"></p><h2 id="curation-title"></h2><blockquote id="curation-quote" lang="en"></blockquote><div class="curation-character" hidden><span class="curation-eddy" role="img" aria-label="Eddy"></span><span>Eddy · 導讀</span></div><div id="curation-explanation"></div><div id="curation-step-actions"></div></div><details class="curation-save"><summary>遊戲存檔 · 自動儲存 / 匯出 / 匯入</summary><div><label for="curation-slot">遊戲存檔</label><select id="curation-slot" aria-label="選擇存檔格"></select><button type="button" id="curation-save-now">儲存</button></div><div><button type="button" id="curation-export">匯出存檔</button><label class="curation-import">匯入存檔<input id="curation-import" type="file" accept="application/json,.json"></label></div><small id="curation-save-status" role="status"></small></details>`;
  const stage=el('nav','curation-stage');stage.id='curation-stage';stage.hidden=true;stage.setAttribute('aria-label','Super Curation 五個階段');
  stage.innerHTML='<div class="curation-stage-line" aria-hidden="true"></div><div class="curation-stage-fill" aria-hidden="true"></div><div class="curation-stage-items"></div>';
  const picker=el('dialog','curation-picker');picker.id='curation-picker';picker.setAttribute('aria-label','選擇導覽步驟');picker.innerHTML='<div class="curation-picker-head"><div><small>SUPER CURATION</small><h2 id="curation-picker-title">選擇步驟</h2></div><button type="button" id="curation-picker-close" aria-label="關閉">×</button></div><input id="curation-picker-search" type="search" placeholder="搜尋步驟或原文…" aria-label="搜尋步驟"><div id="curation-picker-list" class="curation-picker-list"></div>';
  const bank=el('aside','curation-bank');bank.id='curation-bank';bank.hidden=true;bank.setAttribute('aria-label','三項寫作證據庫');bank.innerHTML='<h2>三項寫作證據庫</h2><p>按「下一步」時，已核實可用的句子會移到相應任務。舊資料或淘汰線索不會自動加入。</p><div id="curation-bank-groups"></div>';
  const masks=['top','left','right','bottom'].map(side=>{const m=el('div',`curation-mask curation-mask-${side}`);m.hidden=true;document.body.append(m);return m;});
  const routeArrow=document.createElementNS('http://www.w3.org/2000/svg','svg');routeArrow.id='curation-route-arrow';routeArrow.setAttribute('aria-hidden','true');routeArrow.innerHTML='<defs><marker id="curation-route-tip" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M 1 1 L 7 4 L 1 7" fill="none" stroke="#d0282d" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></marker></defs><path class="curation-route-path" pathLength="1" marker-end="url(#curation-route-tip)"/>';
  const routeCallout=el('div','curation-route-callout');routeCallout.setAttribute('aria-live','polite');routeArrow.setAttribute('hidden','');routeCallout.hidden=true;
  document.body.append(stage,dock,bank,picker,routeArrow,routeCallout);
  const nav=$('.curation-stage-items',stage);for(const [index,chapter] of chapters.entries()){const b=el('button','curation-stage-item');b.type='button';b.dataset.chapter=chapter.id;b.innerHTML=`<span class="curation-stage-dot">${index+1}</span><span class="curation-stage-label">${chapter.short}</span><small class="curation-stage-count"></small>`;nav.append(b);}
  const slotSel=$('#curation-slot');for(let i=1;i<=5;i++){const opt=el('option','',`Slot ${i}`);opt.value=String(i);slotSel.append(opt);}slotSel.value=activeSlot;
  const bankGroups=$('#curation-bank-groups');for(const t of 'ABC'){const d=el('details',`curation-bank-${t}`);d.dataset.task=t;d.innerHTML=`<summary><span>Task ${t}</span><strong data-count>0 句</strong></summary><ol></ol>`;bankGroups.append(d);}
  let open=false;let helpOpen=false;let animation=null;let cueArmed=false;let noteTyping=false;let noteTimer=null;
  const audio=$('#page-3 .notes-audio audio');
  const current=()=>steps[state.chapter][state.positions[state.chapter]];
  function syncPodcastMarks(){
    let limit=progressCutoff('podcast');
    const active=current();
    if(active?.cue&&!state.heard.includes(active.id))limit--;
    transcriptSentences.forEach(({span},index)=>span.classList.toggle('is-revealed',transcriptCueIndex[index]<=limit));
    for(const [task,fieldId] of [['A','wellness'],['C','parents']]){const field=$(`#notes-${fieldId}`);if(!field)continue;const reached=steps.podcast.some(step=>step.cue?.task===task&&step.index<=limit);field.classList.toggle(`curation-note-highlight-${task}`,reached&&!!field.value.trim());}
  }
  function writeCueNote(step){
    const cue=step.cue,field=cue?.field?$(`#notes-${cue.field}`):null;if(!field||!cue.note)return;
    const prior=field.value.trimEnd();if(prior.includes(cue.note))return;
    const prefix=prior?`${prior}\n`:'';const final=`${prefix}${cue.note}`;
    const commit=value=>{field.value=value;field.dispatchEvent(new Event('input',{bubbles:true}));field.scrollTop=field.scrollHeight;};
    if(matchMedia('(prefers-reduced-motion: reduce)').matches){commit(final);return;}
    if(noteTimer)clearInterval(noteTimer);noteTyping=true;let count=0;field.classList.add('curation-note-writing');
    const cancelOnUserInput=event=>{if(!event.isTrusted)return;if(noteTimer)clearInterval(noteTimer);noteTimer=null;noteTyping=false;field.classList.remove('curation-note-writing');field.removeEventListener('input',cancelOnUserInput);syncPodcastMarks();$('#curation-next').disabled=false;};
    field.addEventListener('input',cancelOnUserInput);
    noteTimer=setInterval(()=>{count=Math.min(cue.note.length,count+2);commit(prefix+cue.note.slice(0,count));if(count>=cue.note.length){clearInterval(noteTimer);noteTimer=null;noteTyping=false;field.classList.remove('curation-note-writing');field.removeEventListener('input',cancelOnUserInput);syncPodcastMarks();$('#curation-next').disabled=false;}},28);
  }
  function completeCue(step){
    if(!state.heard.includes(step.id))state.heard.push(step.id);
    cueArmed=false;audio.pause();audio.currentTime=step.cue.at;
    writeCueNote(step);syncPodcastMarks();persist();
    $('#curation-save-status').textContent=`錄音停在 ${step.title} · 筆記寫好後按下一步`;
    if(!noteTyping)$('#curation-next').disabled=false;
  }
  function playToCue(step,replay=false){
    if(!audio||!step?.cue)return;
    const play=()=>{audio.currentTime=replay?step.cue.from:Math.max(0,Math.min(audio.currentTime,step.cue.from));cueArmed=true;$('#curation-next').disabled=true;audio.play().catch(()=>{cueArmed=false;$('#curation-next').disabled=false;$('#curation-save-status').textContent='錄音未能自動播放；請按播放器或「重聽」再試。';});};
    if(audio.readyState>=1)play();else{audio.addEventListener('loadedmetadata',play,{once:true});audio.load();}
  }

  const pageLabel=step=>step.cue?'聆聽筆記表 · 會議錄音':step.sourceJump?(step.page===3?'錄音來源 · 第 3 頁':`Data File 第 ${step.page} 頁 · 暫標 Task ${step.tagTask}`):step.page?`Data File ${step.page<=11?`第 ${step.page} 頁`:`附加錄音稿 ${step.page-11}`} · ${step.chapter==='data'&&step.type>=4?`類型 ${step.type} · ${step.type===4?'語氣':step.type===5?'提示':'噪音'}`:step.task?`Task ${step.task}`:step.chapter==='podcast'?'Podcast':''}`:'寫作練習';
  function explanation(step){
    const box=$('#curation-explanation');box.replaceChildren();$('#curation-step-actions').replaceChildren();
    const add=(text,cls='')=>{const sentences=cls==='curation-translation'?[String(text)]:String(text).split(/(?<=。)(?![」』\]])/u).filter(Boolean);for(const sentence of sentences){const p=el('p',cls,sentence);box.append(p);}};
    if(step.sourceJump){
      add(step.quote,'curation-process');
      add(step.page===3?'先找到聆聽筆記表；下一步返回 Boss letter。完成 Data File 分類後，再逐欄標記並聆聽。':`看清第 ${step.page} 頁的標題，在左上角加 Task ${step.tagTask}。這是來源分類，尚未抄入任何內容點。下一步返回 Boss letter。`);
    }else if(step.routeVisit){add(`紅色箭頭指向第 ${step.route.page} 頁的「${step.route.name}」。先找到這一頁，暫標 Task ${step.route.task}；下一步返回原句。`,'curation-process');}
    else if(step.routeReturn){add('已回到剛才的線索。紅箭頭淡化保留，現在按資料原有順序繼續讀。','curation-process');}
    else if(step.chapter==='boss'){
      add('讀 boss letter 時，先辨認文類、讀者、指定內容與來源提示，再分類 Data File。這句是你目前真正可知道的資料。','curation-process');
      if(step.task)add(`Task ${step.task} 需記錄 ${({A:2,B:4,C:3})[step.task]} 類內容要求；原文上的圈號逐項對應。`,'curation-requirement-summary');
      if(step.record)for(const block of step.record.blocks){if(block==='分析：'||block.startsWith('[')||(step.task&&block.startsWith('類型：')))continue;add(block,block.startsWith('類型：')?`curation-type curation-type-${step.type}`:'');}
      else add('這句主要用來辨認寄件人、稱呼或任務語境；不必直接搬進作文。');
    }else if(step.noteMark){
      add(step.noteMark.help,'curation-process');
      add(step.noteMark.kind==='task'?`這一步才在筆記表加 Task ${step.noteMark.task}；下一步按欄目順序繼續。`:'紅筆表示這欄不供 B2 作文取證；聆聽時仍要把答案記在筆記表。');
    }else if(step.chapter==='categorize'){
      add(step.entry.initial,'curation-process');
      add('先作暫定標記；讀到新的決定後再修正。分類是會更新的工作假設。');
      const c=el('p','curation-revision',`讀後修正：${step.entry.revision}`);c.hidden=!helpOpen;box.append(c);
    }else if(step.chapter==='podcast'){
      if(step.cue){add(`聽到「${step.cue.quote}」後，錄音會暫停並寫入${step.cue.field?`「${$(`label[for=\"notes-${step.cue.field}\"]`)?.textContent.trim()}」`:'筆記表'}。`,'curation-process');add(step.cue.help);add('看清寫下的內容，再按「下一步」繼續播放到下一個關鍵點。');}
      else {add('完整錄音稿複習：先問這句是 Task A、B、C 的內容，還是更正、提示或干擾。','curation-process');const q=step.quote;if(step.bankTask)add(`這句經前後文確認，可支援 Task ${step.bankTask}。記下關鍵詞，按「下一步」才收入證據庫。`);else if(/hiking/i.test(q))add('這只是提議；後面以七月炎熱為由否定。不要採用。');else if(/school website/i.test(q))add('這是未更正的說法。繼續聽下一句，再決定報名途徑。');else if(/responsibilities|Mr Singh/i.test(q))add('這裡說話者尚未確認義工職責。先標記疑問，再去 Singh 電郵核對。');else if(/Asian Games|October|slogan|guest speaker/i.test(q))add('這句談亞運週。它在完整錄音中有用，但不是此 B2 三篇健康月寫作的內容點。');else add('暫時保留語境；核對說話者、時間和後面的更新。若沒有直接證明寫作要求，不要收入內容點。');}
    }else if(step.chapter==='data'){
      if(step.record){
        const earlyCandidate=['duncan-henley-emails-18','duncan-henley-emails-13'].includes(step.record.id)&&!step.confirmed;
        if(earlyCandidate){
          add(step.record.blocks.find(block=>block.startsWith('['))||step.quote,'curation-translation');
          add('類型：5 暫定更新線索',`curation-type curation-type-${step.type}`);
          add(provisionalNotes[step.record.id],'curation-process');
          add('目前只標為候選或待核對；讀到較新電郵確認後才畫淘汰線。','curation-caution');
        }else for(const block of step.record.blocks){
          const before=box.children.length;
          const cls=block.startsWith('類型：')?`curation-type curation-type-${step.type}`:block.startsWith('[')?'curation-translation':block==='分析：'||block.startsWith('分析 -')?'curation-analysis-heading':'';
          add(block,cls);
          for(const paragraph of [...box.children].slice(before))for(const item of referenceHighlights[step.record.id]?.analysis||[])highlightPanelPhrase(paragraph,item.text,step.type>=1&&step.type<=4?colorForStep(step):item.color);
        }
      }else add('現有逐句基準資料沒有這句的獨立定論。保留原文，按最新來源及任務要求判斷；不要猜成可用內容點。','curation-caution');
      if(step.provisional&&!step.confirmed){add('時間順序提醒：這是較早的活動建議。先保留原稿分析，但要等最新電郵核對，才把仍然成立的 Task A 細節收入證據庫。','curation-caution');}
      if(step.confirmed)add('你已讀到最新回覆。現在回看舊電郵，核對仍然成立的具體資料。','curation-process');
      if(step.page===6)add('這是去年的海報。與 2025 年最新決定交叉核對之前，所有活動都只是候選。','curation-caution');
      if(step.page===9 && /think I remember|hanging around|prepare/i.test(step.quote))add('問句或回憶不是事實確認。等 Singh 的回覆才定義家長職責。','curation-caution');
      if(step.record && canBank(step.record))add(step.provisional&&!step.confirmed?'核對最新回覆後再收入證據庫。':'下一步會收進右側證據庫。','curation-result');
    }else if(step.chapter==='writing'){
      add(step.lead,'curation-process');add(step.hint);
      if(step.order===2)add('先獨立寫草稿，右側證據庫只供核對內容點。範文不會在寫之前代替你的構思。','curation-caution');
    }
    const extra=$('#curation-step-actions');extra.replaceChildren();
    if(step.chapter==='categorize'&&step.entry&&step.entry.page!==3){
      const b=el('button','curation-small','顯示讀後修正');b.type='button';b.addEventListener('click',()=>{helpOpen=!helpOpen;explanation(step);});extra.append(b);
      const choices=el('fieldset','curation-category-choices');choices.append(el('legend','',`你會先標哪個任務？`));for(const t of 'ABC'){const label=el('label');const input=el('input');input.type='checkbox';input.value=t;input.checked=(Object.hasOwn(state.categories,step.id)?state.categories[step.id]:categoryInitialTasks(step.entry)).includes(t);input.addEventListener('change',()=>{state.categories||={};state.categories[step.id]=$$('input:checked',choices).map(x=>x.value);syncFileStamps(input.checked?{page:step.page,task:t}:null);persist();});label.append(input,document.createTextNode(` Task ${t}`));choices.append(label);}extra.append(choices);const line=el('p','',`讀後分類：${step.entry.tasks.map(t=>`Task ${t}`).join(' + ')}`);if(helpOpen)extra.append(line);
    }
    if(step.cue && audio){const b=el('button','curation-small',`↻ 重聽至 ${Math.floor(step.cue.at/60)}:${String(Math.floor(step.cue.at%60)).padStart(2,'0')}`);b.type='button';b.addEventListener('click',()=>playToCue(step,true));extra.append(b);}
    if(step.chapter==='writing'){
      const model=$(`#curation-model-${step.task}`);
      if(model){const view=el('button','curation-small',`查看 Task ${step.task} 參考範文`);view.type='button';view.addEventListener('click',()=>{model.open=true;model.scrollIntoView({block:'center',behavior:'smooth'});});extra.append(view);}
      const area=el('textarea','curation-draft');area.rows=step.order===2?10:5;area.placeholder=`Task ${step.task}：在這裡寫你的${step.order===1?'提綱':'草稿或修訂'}…`;area.value=state.drafts[step.task];area.setAttribute('aria-label',`Task ${step.task} 寫作草稿`);area.addEventListener('input',()=>{state.drafts[step.task]=area.value;count.textContent=`${area.value.trim()?area.value.trim().split(/\s+/).length:0} words`;persist();});extra.append(area);const count=el('small','curation-word-count',`${area.value.trim()?area.value.trim().split(/\s+/).length:0} words`);extra.append(count);
    }
  }
  function renderBank(){for(const t of 'ABC'){const group=$(`.curation-bank-${t}`);const list=$('ol',group);list.replaceChildren();for(const id of state.evidence[t]){const s=chapters.flatMap(c=>steps[c.id]).find(x=>x.id===id);if(!s)continue;const li=el('li');const b=el('button','',s.quote);b.type='button';b.addEventListener('click',()=>{state.chapter=s.chapter;state.positions[s.chapter]=s.index;render();});li.append(b,el('small','',s.chapter==='podcast'?`錄音稿 ${s.page-11}`:`Data File ${s.page}`));if(s.record?.id==='duncan-henley-emails-12')li.append(el('small','curation-bank-note','營養師講座已取消；只保留嘉年華其他已確認內容。'));if(s.record?.id==='duncan-singh-emails-5')li.append(el('small','curation-bank-note','這句用來釐清分工：準備學生的是老師。'));list.append(li);} $('[data-count]',group).textContent=`${state.evidence[t].length} 句`;}}
  function bossSourceFile(step){return step.sourceJump&&(step.tagTask||step.tagTasks)?{page:step.page,task:step.tagTask,tasks:step.tagTasks}:null;}
  function discoveredPageTask(step){
    if(step.chapter!=='data')return null;
    if(step.page===7&&step.record?.id==='student-interview-5')return {page:7,task:'C'};
    if(step.type>=1&&step.type<=3)return {page:step.page,task:'ABC'[step.type-1]};
    return null;
  }
  function stampFromStep(step){
    if(step.noteMark)return step.noteMark.task?{page:3,task:step.noteMark.task}:null;
    if(step.chapter==='categorize')return {page:step.page,tasks:categoryInitialTasks(step.entry)};
    if(step.routeVisit)return {page:step.route.page,task:step.route.task};
    return bossSourceFile(step)||discoveredPageTask(step);
  }
  function syncFileStamps(animate=null){
    const bossLimit=progressCutoff('boss'),categoryLimit=progressCutoff('categorize'),dataLimit=progressCutoff('data');
    for(const entry of categoryPages){
      const header=$(`#page-${entry.page} .page-heading`);if(!header)continue;
      let holder=$('.curation-file-stamps',header);
      if(!holder){holder=el('div','curation-file-stamps');holder.setAttribute('aria-label','這頁的暫定任務標記');header.prepend(holder);}
      let selected=steps.boss.slice(0,bossLimit+1).map(bossSourceFile).filter(link=>link?.page===entry.page).flatMap(link=>link.tasks||[link.task]);
      const categoryStep=steps.categorize.find(step=>step.page===entry.page);
      if(categoryStep?.index<=categoryLimit)selected=entry.page===3?[]:Object.hasOwn(state.categories,categoryStep.id)?state.categories[categoryStep.id].slice():categoryInitialTasks(entry);
      if(entry.page===3)selected.push(...steps.categorize.slice(0,categoryLimit+1).filter(item=>item.noteMark?.task).map(item=>item.noteMark.task));
      selected.push(...steps.data.slice(0,dataLimit+1).flatMap(item=>[discoveredPageTask(item),item.routeVisit?{page:item.route.page,task:item.route.task}:null]).filter(link=>link?.page===entry.page).map(link=>link.task));
      selected=[...new Set(selected.filter(task=>'ABC'.includes(task)))].sort();
      if($$('[data-task]',holder).map(x=>x.dataset.task).join('')!==selected.join('')){
        holder.replaceChildren();
        for(const task of selected){const badge=el('span',`curation-file-stamp curation-file-stamp-${task}`,task);badge.dataset.task=task;badge.setAttribute('role','img');badge.setAttribute('aria-label',`暫定標記：Task ${task}`);if(animate?.page===entry.page&&(animate.task===task||animate.tasks?.includes(task)))badge.classList.add('curation-file-stamp-enter');holder.append(badge);}
      }
      header.classList.toggle('curation-has-file-stamps',selected.length>0);
    }
  }
  let lastArrowKey='';
  function updateRouteArrow(){
    const step=current(),limit=progressCutoff('data');
    const cue=step?.routeFrom?steps.data.find(item=>item.id===step.routeFrom):steps.data.slice(0,limit+1).findLast(item=>item.route&&!item.routeVisit&&!item.routeReturn);
    const active=!!(open&&cue&&step?.chapter==='data'&&(step===cue||step.routeFrom===cue.id||step.page===cue.page));
    if(!active){routeArrow.setAttribute('hidden','');routeCallout.hidden=true;lastArrowKey='';return;}
    const anchor=step.routeVisit?step.target:cue.target,r=anchor?.getBoundingClientRect();
    if(!r||r.bottom<148||r.top>innerHeight-85){routeArrow.setAttribute('hidden','');routeCallout.hidden=true;return;}
    const faded=step!==cue&&!step.routeVisit;
    const key=`${cue.id}:${step.routeVisit?'visit':faded?'faded':'new'}`;
    routeArrow.removeAttribute('hidden');routeCallout.hidden=false;
    routeArrow.classList.toggle('is-faded',faded);routeCallout.classList.toggle('is-faded',faded);
    routeCallout.replaceChildren(el('strong','',`第 ${cue.route.page} 頁`),el('span','',cue.route.name));routeCallout.dataset.cueId=cue.id;routeCallout.dataset.stepId=step.id;
    routeArrow.setAttribute('viewBox',`0 0 ${innerWidth} ${innerHeight}`);
    const labelWidth=Math.min(248,Math.max(170,routeCallout.scrollWidth));
    const bankLeft=bank.hidden?innerWidth-12:bank.getBoundingClientRect().left-14;
    const safeRight=Math.max(180,Math.min(innerWidth-12,bankLeft));
    const safeLeft=innerWidth<=620?12:Math.max(12,dock.getBoundingClientRect().right+16);
    const rightward=r.right+labelWidth+54<safeRight;
    const leftward=!rightward&&r.left-labelWidth-54>safeLeft;
    const labelX=rightward?r.right+42:leftward?r.left-labelWidth-42:Math.max(12,Math.min(safeRight-labelWidth,Math.max(safeLeft,r.left+30)));
    const labelY=Math.max(155,Math.min(innerHeight-75,rightward||leftward?r.top+Math.min(r.height/2,26)-24:r.bottom+76));
    Object.assign(routeCallout.style,{left:`${labelX}px`,top:`${labelY}px`});
    let startX,startY,endX,endY,path;
    if(rightward||leftward){
      startX=rightward?r.right+5:r.left-5;endX=rightward?labelX-7:labelX+labelWidth+7;
      startY=Math.min(innerHeight-70,Math.max(155,r.top+Math.min(r.height/2,26)));endY=labelY+routeCallout.offsetHeight/2;
      const bend=Math.min(35,Math.abs(endX-startX)*.3)*(rightward?1:-1);
      path=`M ${startX} ${startY} C ${startX+bend} ${startY}, ${endX-bend} ${endY}, ${endX} ${endY}`;
    }else{
      startX=r.left+Math.min(r.width*.65,180);startY=r.bottom+4;endX=labelX+labelWidth/2;endY=labelY-7;
      path=`M ${startX} ${startY} C ${startX} ${startY+14}, ${endX} ${endY-14}, ${endX} ${endY}`;
    }
    if(step.routeVisit){const fromX=labelX+labelWidth/2,fromY=labelY-6,toX=r.left+Math.min(r.width*.65,180),toY=r.bottom+5;path=`M ${fromX} ${fromY} C ${fromX} ${fromY-14}, ${toX} ${toY+14}, ${toX} ${toY}`;}
    routeArrow.querySelector('.curation-route-path').setAttribute('d',path);
    if(lastArrowKey!==key){routeArrow.classList.remove('is-drawing');void routeArrow.getBoundingClientRect();if(!faded)routeArrow.classList.add('is-drawing');lastArrowKey=key;}
  }
  function shouldHighlight(step){
    if(step?.chapter==='data'||step?.chapter==='boss'||step?.chapter==='categorize'||step?.chapter==='podcast')return true;
    return false;
  }
  function setMaskRect(mask,top,left,width,height){Object.assign(mask.style,{top:`${Math.max(0,top)}px`,left:`${Math.max(0,left)}px`,width:`${Math.max(0,width)}px`,height:`${Math.max(0,height)}px`});}
  function spotlight(){updateRouteArrow();const step=current();const target=step?.target;if(!open||!state.spotlight||!shouldHighlight(step)||!target?.isConnected){masks.forEach(m=>m.hidden=true);return;}const r=target.getBoundingClientRect();if(!r.width||!r.height){masks.forEach(m=>m.hidden=true);return;}const pad=9,w=innerWidth,h=innerHeight,l=Math.max(0,r.left-pad),t=Math.max(0,r.top-pad),right=Math.min(w,r.right+pad),bottom=Math.min(h,r.bottom+pad);masks.forEach(m=>m.hidden=false);setMaskRect(masks[0],0,0,w,t);setMaskRect(masks[1],t,0,l,bottom-t);setMaskRect(masks[2],t,right,w-right,bottom-t);setMaskRect(masks[3],bottom,0,w,h-bottom);}
  function focusSource(step){if(!step?.target)return;const page=step.target.closest('.page');if(page?.hidden){const kind=page.dataset.kind;const filter=$(`[data-filter="${kind}"]`);filter?.click();}const behavior=step.sourceJump||step.routeVisit||step.route||matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth';if(step.sourceJump||step.routeVisit||step.route){const r=step.target.getBoundingClientRect();window.scrollTo({top:Math.max(0,window.scrollY+r.top-(step.route&&!step.routeVisit?(innerWidth<=620?190:Math.min(410,innerHeight*.42)):(innerWidth<=620?160:180))),behavior:'instant'});}else if(innerWidth<=620){const r=step.target.getBoundingClientRect();window.scrollTo({top:window.scrollY+r.top-200,behavior});}else step.target.scrollIntoView({block:'center',behavior});let until=performance.now()+900;const track=()=>{spotlight();if(performance.now()<until)requestAnimationFrame(track);};requestAnimationFrame(track);}
  let lastRenderedStepId='';
  function render(focus=true){if(!open)return;const step=current();if(!step)return;const stepChanged=lastRenderedStepId!==step.id;helpOpen=false;if(stepChanged)audio?.pause();
    if((state.chapter==='boss'||state.chapter==='data')&&!state.visited.includes(step.id))state.visited.push(step.id);
    syncBossMarks();syncDataMarks();syncPodcastMarks();syncFileStamps(stampFromStep(step));
    $$('.curation-target').forEach(x=>{x.classList.remove('curation-target');x.removeAttribute('data-curation-current');});
    if(step.target&&step.chapter!=='categorize'&&step.chapter!=='writing'){step.target.classList.add('curation-target');step.target.dataset.curationCurrent=step.chapter==='data'&&step.type===4?'type-4':step.chapter==='data'&&step.type>=5?'neutral':step.task||step.bankTask||step.cue?.task||'neutral';}
    const stageIndex=chapters.findIndex(ch=>ch.id===state.chapter);
    $$('#curation-stage [data-chapter]').forEach((b,index)=>{const active=index===stageIndex;const done=steps[chapters[index].id].every(s=>state.completed.includes(s.id));b.classList.toggle('active',active);b.classList.toggle('done',done);b.setAttribute('aria-current',active?'step':'false');b.querySelector('.curation-stage-dot').textContent=done?'✓':String(index+1);b.querySelector('.curation-stage-count').textContent=active?`${state.positions[state.chapter]+1}/${steps[state.chapter].length}`:done?'完成':'';});
    $('.curation-stage-fill').style.width=`${stageIndex*20}%`;
    const chapterHeader=$('#curation-chapter');const description=chapters[stageIndex]?.description||'';const tail=description.slice(-7);chapterHeader.replaceChildren(document.createTextNode(description.slice(0,-7)),el('span','curation-nowrap',tail));
    $('#curation-step-jump').textContent=`${step.index+1} / ${steps[state.chapter].length} · ${step.quote.slice(0,31)}${step.quote.length>31?'…':''}　⌄`;
    $('#curation-bookmark-jump').textContent=state.bookmarks.length?`${state.bookmarks.length} 個書籤　⌄`:'選擇書籤　⌄';
    const taskJump=$('#curation-task-jump');taskJump.replaceChildren();taskJump.hidden=!['data','writing'].includes(state.chapter);if(!taskJump.hidden)for(const t of 'ABC'){const first=steps[state.chapter].find(x=>x.task===t);if(!first)continue;const b=el('button','',`Task ${t}`);b.type='button';b.dataset.step=String(first.index);b.addEventListener('click',()=>go(first.index));taskJump.append(b);}
    $('#curation-step-count').textContent=`${state.positions[state.chapter]+1} / ${steps[state.chapter].length} · ${state.completed.filter(id=>steps[state.chapter].some(s=>s.id===id)).length} 已完成`;
    $('#curation-source').textContent=pageLabel(step);$('#curation-title').textContent=step.title;$('#curation-quote').textContent=step.quote;
    $('#curation-quote').hidden=step.chapter==='categorize'||step.sourceJump;
    $('#curation-bookmark').textContent=state.bookmarks.includes(step.id)?'★':'☆';$('#curation-bookmark').setAttribute('aria-pressed',String(state.bookmarks.includes(step.id)));
    $('#curation-prev').disabled=step.index===0;$('#curation-next').disabled=!!(step.cue&&!state.heard.includes(step.id));$('#curation-next').textContent=step.index===steps[state.chapter].length-1?(stageIndex===chapters.length-1?'返回第一章 ↺':'完成本章 ✓'):'下一步 →';
    $('#curation-spotlight').checked=state.spotlight;$('#curation-dialogue').checked=state.dialogue;dock.classList.toggle('dialogue',state.dialogue);$('.curation-character').hidden=!state.dialogue;
    explanation(step);if(stepChanged){$('.curation-content').scrollTop=0;lastRenderedStepId=step.id;}renderBank();if(step.cue&&audio&&!audio.paused&&audio.currentTime<step.cue.at)cueArmed=true;if(focus)focusSource(step);else spotlight();persist();
  }
  function setOpen(value){open=value;stage.hidden=!value;dock.hidden=!value;bank.hidden=!value;if(!value&&picker.open)picker.close();document.body.classList.toggle('curation-active',value);if(!value){$$('.curation-target').forEach(x=>x.classList.remove('curation-target'));routeArrow.setAttribute('hidden','');routeCallout.hidden=true;}toggle.setAttribute('aria-pressed',String(value));toggle.textContent=value?'✦ 離開 Curation':'✦ Super Curation';if(value)render();else{masks.forEach(m=>m.hidden=true);audio?.pause();}}
  async function flyToBank(step){if(!step.target||step.provisional)return;const t=step.bankTask||(canBank(step.record)?'ABC'[step.type-1]:null);if(!t||state.evidence[t].includes(step.id))return;const normalized=normalize(step.quote);if(state.evidence[t].some(id=>{const old=chapters.flatMap(c=>steps[c.id]).find(x=>x.id===id);return old&&normalize(old.quote)===normalized;}))return;
    const from=step.target.getBoundingClientRect(),to=$(`.curation-bank-${t} summary`).getBoundingClientRect();
    if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&from.width&&to.width){const flying=el('div',`curation-flying curation-flying-${t}`,step.quote);document.body.append(flying);Object.assign(flying.style,{left:`${from.left}px`,top:`${from.top}px`,width:`${Math.min(from.width,420)}px`});await new Promise(resolve=>{requestAnimationFrame(()=>{flying.style.transform=`translate(${to.left-from.left}px,${to.top-from.top}px) scale(.3)`;flying.style.opacity='0';});flying.addEventListener('transitionend',resolve,{once:true});setTimeout(resolve,700);});flying.remove();}
    state.evidence[t].push(step.id);renderBank();persist();
  }
  function go(stepIndex){if(state.chapter==='podcast')audio?.pause();state.positions[state.chapter]=Math.min(Math.max(stepIndex,0),steps[state.chapter].length-1);render();}
  function showPicker(kind){
    const list=$('#curation-picker-list');list.replaceChildren();$('#curation-picker-title').textContent=kind==='step'?'跳至步驟':'已儲存的書籤';
    const source=kind==='step'?steps[state.chapter]:state.bookmarks.map(id=>chapters.flatMap(ch=>steps[ch.id]).find(s=>s.id===id)).filter(Boolean);
    for(const item of source){const b=el('button','curation-picker-option');b.type='button';b.dataset.search=`${item.title} ${item.quote} ${item.page||''}`.toLowerCase();b.append(el('strong','',`${item.index+1}. ${item.chapter==='boss'?item.quote.slice(0,62):item.title}`),el('span','',item.quote.length>110?item.quote.slice(0,110)+'…':item.quote));b.addEventListener('click',()=>{picker.close();state.chapter=item.chapter;state.positions[item.chapter]=item.index;render();});list.append(b);}
    if(!source.length)list.append(el('p','curation-picker-empty','暫時沒有書籤。按導覽卡右上角的星號新增。'));
    $('#curation-picker-search').value='';picker.showModal();(kind==='step'?$('#curation-step-jump'):$('#curation-bookmark-jump')).setAttribute('aria-expanded','true');$('#curation-picker-search').focus();
  }
  $('#curation-step-jump').addEventListener('click',()=>showPicker('step'));
  $('#curation-bookmark-jump').addEventListener('click',()=>showPicker('bookmark'));
  $('#curation-picker-close').addEventListener('click',()=>picker.close());
  $('#curation-picker-search').addEventListener('input',e=>{const query=e.target.value.trim().toLowerCase();$$('.curation-picker-option',picker).forEach(b=>b.hidden=!b.dataset.search.includes(query));});
  picker.addEventListener('click',e=>{if(e.target===picker)picker.close();});
  picker.addEventListener('close',()=>{$('#curation-step-jump').setAttribute('aria-expanded','false');$('#curation-bookmark-jump').setAttribute('aria-expanded','false');});
  toggle.addEventListener('click',()=>setOpen(!open));$('#curation-close').addEventListener('click',()=>setOpen(false));
  nav.addEventListener('click',e=>{const id=e.target.closest('[data-chapter]')?.dataset.chapter;if(!id)return;state.chapter=id;render();});
  $('#curation-prev').addEventListener('click',()=>go(state.positions[state.chapter]-1));
  $('#curation-next').addEventListener('click',async()=>{if(animation||noteTyping)return;animation=true;const step=current();if(step.chapter==='data'||step.chapter==='podcast')await flyToBank(step);if(!state.completed.includes(step.id))state.completed.push(step.id);if(step.index<steps[state.chapter].length-1)go(step.index+1);else{const nextIndex=(chapters.findIndex(ch=>ch.id===state.chapter)+1)%chapters.length;state.chapter=chapters[nextIndex].id;render();$('#curation-save-status').textContent=nextIndex===0?'已返回第一章 · 可重溫整個導覽。':`已進入第 ${nextIndex+1} 章 · ${chapters[nextIndex].short}`;}animation=false;if(current()?.cue)playToCue(current());else if(state.chapter!=='podcast')audio?.pause();});
  const selectSourceSentence=(target,event)=>{
    if(!open||!target?.matches('.page[data-kind="data"] .sentence-item'))return false;
    const matches=[...steps.boss,...steps.data].filter(step=>step.target===target);
    if(!matches.length)return false;
    const step=matches.find(item=>item.chapter===state.chapter&&item.index===state.positions[state.chapter])||matches.find(item=>!item.confirmed)||matches[0];
    event.preventDefault();event.stopImmediatePropagation();
    state.chapter=step.chapter;state.positions[step.chapter]=step.index;render(false);
    return true;
  };
  document.addEventListener('click',event=>selectSourceSentence(event.target.closest?.('.sentence-item'),event),true);
  document.addEventListener('keydown',event=>{if((event.key==='Enter'||event.key===' ')&&event.target.matches?.('.sentence-item'))selectSourceSentence(event.target,event);},true);
  $('#curation-help').addEventListener('click',()=>{let attempts=0;const openQuestion=()=>{const launcher=$('.learning-question-launcher');if(launcher){launcher.click();return;}if(attempts++<50)setTimeout(openQuestion,100);else $('#curation-save-status').textContent='提問功能未能載入，請重新整理頁面再試。';};openQuestion();});
  $('#curation-bookmark').addEventListener('click',()=>{const id=current().id;state.bookmarks=state.bookmarks.includes(id)?state.bookmarks.filter(x=>x!==id):[...state.bookmarks,id];render(false);});
  $('#curation-spotlight').addEventListener('change',e=>{state.spotlight=e.target.checked;spotlight();persist();});$('#curation-dialogue').addEventListener('change',e=>{state.dialogue=e.target.checked;render(false);});
  slotSel.addEventListener('change',()=>{persist();activeSlot=slotSel.value;state=sanitize(slots[activeSlot]);render();});$('#curation-save-now').addEventListener('click',persist);
  $('#curation-export').addEventListener('click',()=>{persist();const data={version:VERSION,created:new Date().toISOString(),state};const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=el('a');a.href=url;a.download=`paper3-2025-b2-curation-slot-${activeSlot}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
  $('#curation-import').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{if(file.size>1024*1024)throw Error('存檔過大');const value=JSON.parse(await file.text());if(value.version!==VERSION||!value.state||typeof value.state!=='object')throw Error('這不是 2025 B2 的有效存檔');state=sanitize(value.state);persist();render();$('#curation-save-status').textContent=`已匯入至 Slot ${activeSlot}`;}catch(error){$('#curation-save-status').textContent=`匯入失敗：${error.message}`;}e.target.value='';});
  if(audio){audio.addEventListener('play',()=>{if(!open||state.chapter!=='podcast')return;const cue=current()?.cue;cueArmed=!!cue&&!state.heard.includes(current().id);});audio.addEventListener('timeupdate',()=>{if(!cueArmed||!open||state.chapter!=='podcast')return;const step=current();if(step?.cue&&audio.currentTime>=step.cue.at){completeCue(step);focusSource(step);}});}
  window.addEventListener('scroll',spotlight,{passive:true});window.addEventListener('resize',()=>{spotlight();if(open&&innerWidth<=620)setTimeout(()=>focusSource(current()),80);});window.visualViewport?.addEventListener('resize',spotlight);
  document.addEventListener('keydown',e=>{if(!open)return;if(e.key==='Escape'&&picker.open){e.preventDefault();picker.close();return;}if(e.key==='Escape'&&$('.learning-question-dialog[open]'))return;if(e.key==='Escape'&&document.activeElement?.tagName!=='TEXTAREA')setOpen(false);});
  // Deep links allow teachers to send a chapter without exposing any unvisited evidence.
  if(new URLSearchParams(location.search).get('curation')==='1')setOpen(true);
})();
