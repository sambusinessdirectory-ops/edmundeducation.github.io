(() => {
  'use strict';
  const requestedKey = new URLSearchParams(location.search).get('essay');
  const selectedLesson = window.ESSAY_MEMORY_LESSONS?.[requestedKey];
  if (requestedKey && requestedKey !== 'opinion:80' && !selectedLesson) {
    const meta = window.ESSAY_MEMORY_CATALOG?.find(item => item.key === requestedKey);
    const title = meta?.title || '找不到這篇範文';
    document.title = `${title} · 範文背書系統 | Edmund Education`;
    document.querySelector('.hero-copy .eyebrow').textContent = title.toUpperCase();
    document.querySelector('.setup-card strong').textContent = title;
    document.querySelector('.setup-card p').textContent = meta
      ? '這篇範文的背書教材正在逐句核對。你可以先閱讀原範文及使用原有的寫作練習。'
      : '此連結未對應任何範文。請返回寫作練習選擇範文。';
    const sourceLink = document.querySelector('.setup-card > a');
    sourceLink.href = meta ? `writing-practice.html?exercise=${encodeURIComponent(meta.id)}` : 'writing-practice.html';
    sourceLink.textContent = meta ? '查看原範文 ↗' : '返回寫作練習 ↗';
    for (const selector of ['.mission','.play-area','.pilot-note']) document.querySelector(selector).hidden = true;
    return;
  }
  const isPilot = !selectedLesson;
  const essay = selectedLesson || window.ESSAY_80_MEMORY_DATA;
  if (!essay?.sentences?.length) return;
  const isTask1 = essay.exam === 'IELTS Writing Task 1';
  const essayLabel = essay.title.replace(' - IELTS - ', ' · ');
  const writingUrl = `writing-practice.html?exercise=${encodeURIComponent(essay.id)}`;

  const $ = selector => document.querySelector(selector);
  const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  const sentences = essay.learningSentences || essay.sentences;
  const support = isPilot ? window.ESSAY_80_LEARNING_SUPPORT : essay.support;
  if (!support || support.sentences.length !== sentences.length) return;
  const approvedEssays=(window.ESSAY_MEMORY_CATALOG||[]).filter(item=>window.ESSAY_MEMORY_APPROVED?.[item.key]);
  if(approvedEssays.length>4){
    const panel=document.createElement('section');
    panel.className='memory-catalogue';
    panel.setAttribute('aria-label','搜尋已完成的範文背書教材');
    panel.innerHTML='<div class="memory-catalogue-heading"><div><strong>選擇範文</strong><p>搜尋已完成的背書教材；各篇進度分開儲存。</p></div><span data-memory-catalogue-count></span></div><div class="memory-catalogue-controls"><label>搜尋題目或編號<input type="search" data-memory-catalogue-search placeholder="例如：Model Essay 4、藝術、business"></label><label>類別<select data-memory-catalogue-type><option value="">全部類別</option></select></label></div><div class="memory-catalogue-results" data-memory-catalogue-results></div><button type="button" class="utility-button" data-memory-catalogue-more hidden>顯示更多範文</button>';
    document.querySelector('.memory-lessons').after(panel);
    const typeSelect=panel.querySelector('[data-memory-catalogue-type]');
    for(const type of [...new Set(approvedEssays.map(item=>`${item.exam} · ${item.taskType}`))]){
      const option=document.createElement('option');option.value=type;option.textContent=type;typeSelect.append(option);
    }
    let shown=24;
    const draw=()=>{
      const query=panel.querySelector('[data-memory-catalogue-search]').value.trim().toLowerCase();
      const category=typeSelect.value;
      const matches=approvedEssays.filter(item=>(!category||`${item.exam} · ${item.taskType}`===category)&&
        (!query||`${item.title} ${item.question} ${item.taskType} ${item.key}`.toLowerCase().includes(query)));
      const list=panel.querySelector('[data-memory-catalogue-results]');list.replaceChildren();
      for(const item of matches.slice(0,shown)){
        const link=document.createElement('a');link.href=`essay-memorization.html?essay=${encodeURIComponent(item.key)}`;
        const title=document.createElement('strong');title.textContent=item.title;
        const detail=document.createElement('small');detail.textContent=item.question;
        link.append(title,detail);if(item.key===(isPilot?'opinion:80':essay.key))link.setAttribute('aria-current','page');list.append(link);
      }
      panel.querySelector('[data-memory-catalogue-count]').textContent=`${Math.min(shown,matches.length)} / ${matches.length} 篇`;
      panel.querySelector('[data-memory-catalogue-more]').hidden=shown>=matches.length;
    };
    panel.querySelector('[data-memory-catalogue-search]').addEventListener('input',()=>{shown=24;draw();});
    typeSelect.addEventListener('change',()=>{shown=24;draw();});
    panel.querySelector('[data-memory-catalogue-more]').addEventListener('click',()=>{shown+=24;draw();});
    draw();
  }
  const byParagraph = paragraph => sentences.map((sentence, index) => ({ ...sentence, globalIndex: index })).filter(sentence => sentence.paragraph === paragraph);
  const groupedSentences = {
    'opinion:3': [[3,4],[6,7],[13,14],[15,16]],
    'opinion:4': [[6,7],[8,9],[10,11],[13,14]],
    'opinion:7': [[5,6]],
    'opinion:9': [[4,5]],
    'opinion:10': [[7,8],[9,10]],
    'opinion:11': [[6,7],[9,10],[12,13]],
    'direct-question:2': [[2,3],[5,6],[7,8],[9,10],[13,14],[15,16]],
    'direct-question:13': [[8,9],[11,12]],
    'direct-question:14': [[2,3],[7,8],[11,12]],
    'direct-question:15': [[13,14]],
    'cause-solution:4': [[6,7],[10,11],[12,13]],
    'cause-solution:6': [[3,4],[7,8],[13,14],[16,17]],
    'cause-solution:9': [[5,6],[10,11]],
    'cause-solution:10': [[0,1],[6,7,8],[12,13]],
    'cause-solution:11': [[3,4],[6,7],[8,9],[12,13],[16,17],[19,20]],
    'cause-solution:12': [[2,3],[6,7],[10,11]],
    'cause-solution:13': [[1,2],[6,7],[9,10],[12,13,14]],
    'cause-solution:14': [[5,6],[8,9],[11,12]],
    'cause-solution:15': [[2,3],[6,7],[9,10],[13,14]],
    'opinion:20': [[2,3]],
    'opinion:22': [[1,2]],
    'opinion:25': [[1,2]],
    'opinion:26': [[0,1]],
    'opinion:27': [[0,1],[8,9]],
    'opinion:30': [[5,6]],
    'opinion:36': [[7,8]],
    'opinion:37': [[6,7]],
    'opinion:39': [[1,2],[6,7]],
    'opinion:41': [[5,6],[8,9]],
    'opinion:42': [[6,7],[10,11]],
    'opinion:43': [[8,9]],
    'opinion:44': [[8,9],[11,12]],
    'opinion:45': [[8,9]],
    'opinion:47': [[11,12],[14,15]],
    'opinion:48': [[8,9]],
    'opinion:49': [[8,9],[12,13]],
    'opinion:50': [[12,13]],
    'opinion:46': [[6,7],[12,13]],
    'opinion:52': [[3,4,5],[16,17]],
    'opinion:53': [[2,3],[13,14]],
    'opinion:90': [[1,2],[3,4],[5,6],[10,11]],
    'opinion:91': [[6,7],[13,14]],
    'opinion:92': [[2,3],[4,5],[12,13]],
    'opinion:93': [[2,3],[4,5],[7,8],[10,11],[12,13]],
    'opinion:94': [[3,4],[6,7],[8,9],[12,13]],
    'opinion:95': [[3,4],[6,7],[8,9],[11,12],[13,14]],
    'opinion:96': [[1,2],[6,7],[11,12],[14,15]],
    'opinion:97': [[0,1],[5,6],[7,8],[9,10],[13,14],[15,16]],
    'opinion:54': [[8,9],[14,15]],
    'opinion:55': [[2,3]],
    'opinion:56': [[0,1],[2,3],[8,9],[13,14]],
    'opinion:57': [[1,2]],
    'opinion:58': [[13,14]],
    'opinion:59': [[3,4],[9,10],[15,16]],
    'opinion:60': [[3,4],[5,6],[13,14]],
    'opinion:61': [[12,13],[14,15]],
    'opinion:62': [[5,6],[11,12]],
    'opinion:63': [[8,9],[13,14]],
    'direct-question:16': [[1,2],[5,6],[12,13]],
    'direct-question:17': [[3,4],[6,7],[12,13]],
    'direct-question:25': [[6,7],[11,12]],
    'direct-question:26': [[7,8],[9,10],[11,12],[16,17]],
    'direct-question:27': [[7,8]],
    'direct-question:28': [[13,14]],
    'direct-question:29': [[3,4],[9,10]],
    'direct-question:30': [[9,10],[12,13]],
    'direct-question:31': [[4,5],[7,8],[15,16]],
    'direct-question:32': [[10,11],[12,13],[14,15,16]],
    'direct-question:33': [[3,4],[6,7],[11,12]],
    'direct-question:34': [[7,8],[9,10],[13,14]],
    'direct-question:35': [[8,9],[13,14]],
    'direct-question:36': [[8,9],[11,12]],
    'direct-question:37': [[8,9]],
    'direct-question:38': [[3,4],[5,6],[12,13]],
    'direct-question:39': [[1,2],[11,12]],
    'direct-question:40': [[5,6],[9,10],[16,17]],
    'direct-question:41': [[5,6],[10,11],[16,17]],
    'discuss-both-views:5': [[3,4],[8,9]],
    'cause-solution:16': [[3,4],[6,7],[9,10],[12,13]],
    'cause-solution:17': [[2,3],[6,7],[8,9],[11,12]],
    'cause-solution:18': [[6,7],[9,10],[12,13]],
    'cause-solution:19': [[6,7],[8,9]],
    'cause-solution:20': [[7,8]],
    'advantage-disadvantage:16': [[2,3],[9,10,11],[14,15]],
    'advantage-disadvantage:17': [[3,4],[6,7],[9,10,11]],
    'advantage-disadvantage:18': [[7,8],[11,12]],
    'advantage-disadvantage:19': [[5,6],[9,10],[13,14]],
    'advantage-disadvantage:20': [[6,7],[9,10],[15,16]],
    'advantage-disadvantage:21': [[3,4],[9,10],[12,13],[14,15]],
    'advantage-disadvantage:22': [[2,3],[7,8],[10,11]],
    'advantage-disadvantage:23': [[3,4],[5,6],[9,10],[12,13]],
    'advantage-disadvantage:24': [[3,4],[10,11]],
    'advantage-disadvantage:25': [[5,6],[9,10],[13,14]],
    'advantage-disadvantage:26': [[8,9],[11,12]],
    'advantage-disadvantage:27': [[3,4],[8,9],[11,12]],
    'advantage-disadvantage:28': [[9,10],[16,17]],
    'advantage-disadvantage:29': [[1,2],[3,4],[8,9]],
    'advantage-disadvantage:30': [[2,3],[6,7],[9,10]],
    'discuss-both-views:6': [[3,4],[8,9],[10,11],[14,15]],
    'discuss-both-views:7': [[3,4],[11,12],[14,15]],
    'discuss-both-views:8': [[6,7],[10,11],[15,16]],
    'discuss-both-views:9': [[6,7]],
    'discuss-both-views:10': [[13,14]],
    'discuss-both-views:12': [[6,7],[9,10],[13,14]],
    'discuss-both-views:13': [[8,9],[11,12],[15,16]],
    'discuss-both-views:14': [[2,3],[7,8],[11,12],[14,15]],
    'discuss-both-views:16': [[11,12],[14,15]],
    'discuss-both-views:15': [[2,3],[12,13]],
    'discuss-both-views:18': [[0,1],[3,4],[12,13,14],[15,16]],
    'discuss-both-views:19': [[0,1],[3,4],[7,8],[9,10],[13,14],[15,16]],
    'discuss-both-views:20': [[0,1],[4,5],[8,9],[12,13],[14,15]],
    'discuss-both-views:21': [[0,1],[3,4],[5,6],[9,10],[12,13]],
    'discuss-both-views:22': [[6,7],[9,10],[11,12],[13,14]],
    'discuss-both-views:23': [[3,4],[6,7],[11,12],[13,14]],
    'discuss-both-views:30': [[12,13]],
    'discuss-both-views:31': [[6,7],[13,14]],
    'discuss-both-views:32': [[6,7]],
    'discuss-both-views:34': [[13,14]],
    'direct-question:43': [[8,9],[11,12]],
    'direct-question:44': [[0,1],[9,10]],
    'direct-question:45': [[0,1],[6,7],[12,13]],
    'direct-question:46': [[10,11]],
    'direct-question:47': [[5,6],[10,11],[12,13]],
    'direct-question:48': [[8,9]],
    'advantage-disadvantage:15': [[6,7],[8,9]],
    'advantage-disadvantage:7': [[6,7],[9,10]],
    'advantage-disadvantage:11': [[3,4],[9,10],[13,14]],
    'advantage-disadvantage:12': [[1,2],[3,4],[7,8],[10,11],[13,14]],
    'advantage-disadvantage:14': [[5,6],[8,9],[12,13]],
    'discuss-both-views:4': [[1,2]],
  };
  function task1VocabularyGroups(){
    const pairs=[];
    for(let i=0;i<sentences.length;){
      const group=[i];let sourceCount=support.sentences[i].chunks.length;
      let simpleCount=support.sentences[i].simpleChunks.length;
      while(Math.min(sourceCount,simpleCount)<4&&i+group.length<sentences.length&&
        sentences[i+group.length].paragraph===sentences[i].paragraph){
        const next=i+group.length;group.push(next);
        sourceCount+=support.sentences[next].chunks.length;
        simpleCount+=support.sentences[next].simpleChunks.length;
      }
      if(group.length>1)pairs.push(group);
      i+=group.length;
    }
    return pairs;
  }
  const requestedGroups = isTask1 ? task1VocabularyGroups() : groupedSentences[requestedKey] || [];
  const groupedStarts = new Map(requestedGroups.map(group => [group[0], group]));
  const groupedMembers = new Set(requestedGroups.flat());
  const vocabularyGroups = sentences.flatMap((_, index) => groupedStarts.has(index) ? [groupedStarts.get(index)] : groupedMembers.has(index) ? [] : [[index]]);
  const paragraphNames = isTask1 ? ['引言','概覽','細節一','細節二'] : ['開場','第一主體段','第二主體段','總結'];
  const stageDefinitions = [
    {
      icon: '◎', title: '鎖定立場', en: 'THE COMPASS', description: '先記住作者站在哪一邊，以及全文的兩條主線。', rounds: [
        { type: 'quiz', prompt: '作者對題目採取甚麼立場？', detail: '圖書館應優先改善科技資源，還是擴大紙本館藏？', options: ['完全同意優先改善科技資源', '部分同意，兩者必須平均分配', '完全反對，應擴大紙本館藏'], correct: 0, why: '原文說 “I fully agree”，清楚表明完全同意優先發展科技資源。' },
        { type: 'multi', prompt: '選出全文的兩條主要理由', detail: '選兩項，再按「確認」。', options: ['讓更多人更方便地取得知識', '幫助使用者建立實用數碼技能', '讓圖書館賺取更多借書收入', '淘汰所有紙本書籍'], correct: [0, 1], why: 'Body 1 談更廣泛的知識取用；Body 2 談現代生活所需的數碼技能。' },
      ],
    },
    {
      icon: '◇', title: '排好四段', en: 'THE ROUTE', description: '從開場到總結，先在腦中建起整篇的路線。', rounds: [
        { type: 'sequence', prompt: '依照範文次序，逐一點選四張段落卡', detail: '先想想每段的任務，再選下一張。', items: [
          { title: '開場與立場', body: '交代圖書館角色改變；完全同意，提出兩條理由。' },
          { title: '第一主體段', body: '數碼資源可以服務更多人，突破到館限制。' },
          { title: '第二主體段', body: '圖書館協助大眾建立實用的數碼技能。' },
          { title: '總結', body: '重申立場；總結覆蓋面、效率和現代角色。' },
        ], why: '清楚的文章路線：背景與立場 → 取用更廣 → 數碼技能 → 重申。' },
      ],
    },
    {
      icon: '✧', title: '抓緊細節', en: 'EVIDENCE HUNT', description: '辨認兩段主體各自的支持細節與例子。', rounds: [
        { type: 'quiz', prompt: '第一主體段如何對比實體書與數碼資源？', options: ['實體書通常一次只供一人借閱；數碼資源可同時供多人取用', '實體書永遠比網上資料更快找到', '所有數碼資源只可在圖書館內使用'], correct: 0, why: '這是第一條理由的核心對比：一人借閱與多人同時取用。' },
        { type: 'quiz', prompt: '哪些人特別受惠於在家取用數碼資源？', options: ['學生、輪班工作者和未必能經常到館的長者', '只有圖書館職員', '只限每天都能親身到館的讀者'], correct: 0, why: '原文點名 students, shift workers and elderly people。' },
        { type: 'quiz', prompt: '第二主體段所說的「實用數碼技能」與哪些生活範疇有關？', options: ['教育、就業和公共服務', '只與電子遊戲有關', '只與借閱紙本書有關'], correct: 0, why: '這三個範疇對網上資訊的搜尋、評估和負責任使用愈來愈依賴。' },
        { type: 'quiz', prompt: '原文用了哪些具體使用者作例子？', options: ['兒童、求職者和需要網上政府服務的成年人', '只提到大學生', '只提到退休圖書館員'], correct: 0, why: '記住三組人物，便能重建第二主體段的第二個支持細節。' },
      ],
    },
    {
      icon: '↝', title: '接通論證', en: 'LOGIC LINKS', description: '把每段的理由、細節、例子和結論按原有邏輯接起來。', rounds: [
        { type: 'sequence', prompt: '第一主體段：數碼資源如何帶來更廣泛的取用？', detail: '逐一點選下一步。', items: [
          { title: '主張', body: '數碼資源服務的人比紙本書更多。' },
          { title: '實體限制', body: '一本實體書通常一次只能借給一人。' },
          { title: '數碼對比', body: '電子書、期刊和資料庫可多人同時在家取用。' },
          { title: '受惠者', body: '學生、輪班工作者及長者不一定能經常到館。' },
          { title: '具體例子', body: '學生可在幾分鐘內搜尋期刊，免去多次到訪。' },
          { title: '段落結論', body: '科技讓圖書館突破自身牆壁。' },
        ], why: '先立主張，再比較限制，指出受惠者，以例子具體化，最後結論。' },
        { type: 'sequence', prompt: '第二主體段：圖書館如何成為數碼學習中心？', detail: '逐一點選下一步。', items: [
          { title: '主張', body: '現代圖書館應培養實用數碼技能。' },
          { title: '現代需要', body: '教育、就業及公共服務仰賴網上資訊能力。' },
          { title: '圖書館做法', body: '投資電腦、媒體室、網上目錄及受訓職員。' },
          { title: '具體使用者', body: '兒童、求職者與成年人各有實際用途。' },
          { title: '排除替代', body: '單靠更多紙本書無法滿足這些需要。' },
          { title: '形象化結論', body: '只加紙本書，就像需要電燈時仍在增加蠟燭。' },
        ], why: '先說需要，提出圖書館的實際做法，再舉受惠者，最後用蠟燭比喻強化主張。' },
      ],
    },
    {
      icon: '▤', title: '還原句序', en: 'SENTENCE MAP', description: '先看每句意思，再按範文順序排好整段的句子。英文全部用小寫，請靠內容判斷。', rounds: [0,1,2,3].map(paragraph => ({
        type: 'sequence', sentenceMap: true, paragraph, prompt: `${paragraphNames[paragraph]} · 排好整段句序`,
        detail: '按意思排列整句；這一步練段落次序，下一關才拼回每句的原文字詞。',
        items: byParagraph(paragraph).map(sentence => ({title:sentence.english.toLowerCase(),body:sentence.chinese})), why: '已接回整段句序。'
      })),
    },
    {
      icon: 'Aa', title: '簡單字詞', en: 'SIMPLE WORDS', description: '先用白話讀懂原句；較短的句子與下一句合併，再從簡單說法還原原文。',
      rounds: vocabularyGroups.flatMap(sentenceIndices => [false,true].map(reverse=>({ type: 'vocabulary', sentenceIndex: sentenceIndices[0], sentenceIndices, reverse, prompt: `第 ${sentenceIndices[0] + 1}${sentenceIndices.length>1?'–'+(sentenceIndices.at(-1)+1):''} 句 · ${reverse?'從簡單說法拼回原文':'用簡單字詞重建整句'}` }))),
    },
    {
      icon: '▤', title: '拆解與運用句型', en: 'SENTENCE STRUCTURES', description: '逐句查看原文、中文和實際句型；辨認每句的語意連接方式。',
      rounds: support.structures.map(frame => ({ ...frame, type: 'structure', prompt: frame.prompt || frame.context, why: frame.explanations[0] })),
    },
    {
      icon: '✦', title: '原文重組', en: 'EXACT WORDING', description: '依照上一關的整段句序，逐句把英文小節拼回精確原文。',
      rounds: sentences.map((sentence, sentenceIndex) => ({ type: 'precision', sentenceIndex, prompt: `第 ${sentenceIndex + 1} / ${sentences.length} 句 · ${sentence.role}`,  why: '已還原此句。' })),
    },
    {
      icon: '♫', title: '有提示朗讀', en: 'SUPPORTED READING', description: '每次只讀一小節，再連成一句，最後把相鄰兩句接起來。英文提示一直可見。', rounds: speakingRounds(true),
    },
    {
      icon: '◉', title: '中階填空朗讀', en: 'RECORDED RECALL', description: '使用填充練習的中階遮字；補回空格並錄下完整一句，儲存後核對。', rounds: sentences.map((sentence,i)=>({type:'speaking',guided:false,sentenceIndices:[i],text:sentence.english,prompt:`第 ${i+1} 句 · 中階填空與整句錄音`})),
    },
    {icon:'↗',title:'跨主題論證應用',en:'TRANSFER THE LOGIC',description:'把兩段的主張、限制、做法、例子及結論運用到其他主題。',rounds:support.transfer.map(item=>({...item,type:'quiz'}))},
  ];

  if (!isPilot) {
    stageDefinitions[0].rounds = support.intro;
    stageDefinitions[1].rounds = support.route;
    stageDefinitions[2].rounds = support.evidence;
    stageDefinitions[3].rounds = support.logic;
    const titles={
      'Cause / Solution':'鎖定問題與方案',
      'Direct Question':'鎖定兩個問題',
      'Advantages / Disadvantages':'鎖定利弊取捨',
      'Discuss Both Views':'辨清雙方觀點',
    };
    stageDefinitions[0].title=isTask1?'看懂圖表':titles[essay.taskType]||'鎖定立場';
    stageDefinitions[0].description=isTask1
      ? '先看題目、圖表類型、單位和全文概覽，再找出主要資料。'
      : '先記住文章如何回應題目，以及兩段主體的主要方向。';
    stageDefinitions[2].description=isTask1
      ? '辨認概覽、關鍵數據、比較及變化；以原圖表為準。'
      : '辨認這篇範文兩段主體的支持細節與例子。';
    stageDefinitions[3].title=isTask1?'串起描述':'接通論證';
    stageDefinitions[3].description=isTask1
      ? '把概覽、比較、數值及變化按報告原有次序接起來。'
      : '把本篇的理由、細節、例子與結論接成兩條論證鏈。';
    if(isTask1){
      stageDefinitions[10].title='跨圖表描述應用';
      stageDefinitions[10].en='TRANSFER THE REPORT';
      stageDefinitions[10].description='把概覽、比較及數據描述的方法運用到新的圖表情境。';
    }
  }

  // Old indices remain the migration reference for existing local and downloaded progress.
  const stageOrder = [0,1,2,3,10,5,6,8,9,4,7];
  const oldStages = [...stageDefinitions];
  stageDefinitions.splice(0, stageDefinitions.length, ...stageOrder.map(index => oldStages[index]));
  function migrateStageOrder(value) {
    if (!isPilot || !value || value.stageOrder === '20261028') return value;
    const solved = {};
    for (const [key, result] of Object.entries(value.solved || {})) {
      const [stage, step] = key.split(':').map(Number);
      const next = stageOrder.indexOf(stage);
      if (next >= 0) solved[`${next}:${step}`] = result;
    }
    return {...value, stage: Math.max(0, stageOrder.indexOf(value.stage || 0)), solved, unlocked:0, stageOrder:'20261028'};
  }

  function speakingRounds(guided) {
    const rounds = [];
    sentences.forEach((sentence, index) => {
      support.sentences[index].chunks.forEach((text, chunkIndex) => rounds.push({type:'speaking', guided, sentenceIndices:[index], text, chunkIndex, prompt:`${guided?'有':'無'}提示朗讀 · 第 ${index+1} 句 · 小節 ${chunkIndex+1}/${support.sentences[index].chunks.length}`}));
      rounds.push({type:'speaking', guided, sentenceIndices:[index], text:sentence.english, prompt:`${guided?'有':'無'}提示朗讀 · 第 ${index+1} 句 · 連成一句`});
      if (sentence.index % 2 === 1) rounds.push({type:'speaking', guided, sentenceIndices:[index-1,index], text:sentences[index-1].english+'\n'+sentence.english, prompt:`${guided?'有':'無'}提示朗讀 · 第 ${index}–${index+1} 句 · 連起兩句`});
    });
    return rounds;
  }

  function migrateVocabularyProgress(value) {
    if (isPilot || !value || value.vocabularyFormat === 'paired-v1') return value;
    const oldSolved = value.solved || {};
    const solved = {...oldSolved};
    for (const key of Object.keys(solved)) if (/^5:\d+$/.test(key)) delete solved[key];
    vocabularyGroups.forEach((indices, groupIndex) => {
      for (const direction of [0,1]) {
        const scores = indices.map(index => oldSolved[`5:${index*2+direction}`]);
        if (scores.every(score => score === 1 || score === 2)) solved[`5:${groupIndex*2+direction}`] = Math.min(...scores);
      }
    });
    const sentenceIndex = Math.floor((value.round || 0)/2);
    const groupIndex = vocabularyGroups.findIndex(indices => indices.includes(sentenceIndex));
    return {...value, solved, round:value.stage===5 ? Math.max(0,groupIndex)*2 + ((value.round || 0)%2) : value.round, selection:value.stage===5?[]:value.selection, vocabularyFormat:'paired-v1'};
  }
  const totalRounds = stageDefinitions.reduce((count, stage) => count + stage.rounds.length, 0);
  const legacyStorageKey = isPilot ? 'edmund-essay80-memory-active-v4' : `edmund-essay-memory-${essay.id}-v1`;
  const studentId = window.EssayMemoryAuth?.user?.id;
  if (!studentId) return;
  const storageKey = `${legacyStorageKey}-student-${studentId}`;
  const legacyOwnerKey = 'edmund-essay-memory-legacy-owner-v1';
  const mayUseLegacy = (() => {
    try {
      const claimed = localStorage.getItem(legacyOwnerKey);
      if (claimed) return claimed === studentId;
      const hasLegacy = localStorage.getItem(legacyStorageKey) || (isPilot &&
        (localStorage.getItem('edmund-essay80-memory-active-v3') || localStorage.getItem('edmund-essay80-memory-scaffold-v2')));
      if (!hasLegacy) return false;
      localStorage.setItem(legacyOwnerKey, studentId);
      return true;
    } catch { return false; }
  })();
  const backupFormat = isPilot ? 'edmund-essay80-progress' : 'edmund-essay-memory-progress';
  const backupVersion = isPilot ? 4 : 1;
  const saved = migrateVocabularyProgress(migrateStageOrder((() => {
    try {
      const current = JSON.parse(localStorage.getItem(storageKey) || 'null');
      if (current) return current;
      if (!mayUseLegacy) return {};
      const legacy = JSON.parse(localStorage.getItem(legacyStorageKey) || 'null');
      if (legacy) return legacy;
      if (!isPilot) return {};
      const previous=JSON.parse(localStorage.getItem('edmund-essay80-memory-active-v3') || 'null');
      if(previous){
        const solved={};
        Object.entries(previous.solved||{}).forEach(([key,value])=>{
          const [stage,step]=key.split(':').map(Number);
          // Removed retelling and rewritten transfer exercises do not transfer completion.
          if(stage===7 || stage===11)return;
          solved[`${stage>7?stage-1:stage}:${step}`]=value;
        });
        const oldStage=Number(previous.stage)||0;
        return {stage:oldStage===7?5:oldStage>7?oldStage-1:oldStage,round:[7,11].includes(oldStage)?0:previous.round||0,solved};
      }
      const old=JSON.parse(localStorage.getItem('edmund-essay80-memory-scaffold-v2') || '{}');
      const solved={};
      Object.entries(old.solved||{}).forEach(([key,value])=>{const [stage,step]=key.split(':').map(Number);if([0,1,2,3,8].includes(stage))solved[`${stage===8?7:stage}:${step}`]=value;});
      return {stage:0,round:0,solved};
    } catch { return {}; }
  })()));
  const state = {
    stage: Number.isInteger(saved.stage) && saved.stage >= 0 && saved.stage < stageDefinitions.length ? saved.stage : 0,
    round: Number.isInteger(saved.round) ? saved.round : 0,
    unlocked: Number.isInteger(saved.unlocked) ? Math.max(0, Math.min(saved.unlocked, stageDefinitions.length)) : 0,
    solved: saved.solved && typeof saved.solved === 'object' ? saved.solved : {},
    selection: Array.isArray(saved.selection)?saved.selection:[], hadMistake: !!saved.hadMistake, revealTranslation: false, transitioning: false, checks: [], completed: !!saved.completed,
  };
  if (saved.mapFormat !== 'paragraph-v1') {
    for (const key of Object.keys(state.solved)) if (/^9:\d+$/.test(key)) delete state.solved[key];
    if (state.stage === 9) state.round = 0;
  }
  state.round = Math.min(Math.max(state.round, 0), stageDefinitions[state.stage].rounds.length - 1);
  state.selection = validatedSelection(state.stage,state.round,state.selection);


  if (!isPilot) {
    document.title = `範文背書系統 · ${essay.title} | Edmund Education`;
    document.querySelector('meta[name=description]').content = `範文背書系統：逐步理解和記住 ${essay.title}。`;
    const originalLinks = document.querySelectorAll('.memory-header .utility-button:first-child, .setup-card > a');
    originalLinks.forEach(link => { link.href = writingUrl; });
    document.querySelector('.hero-copy .eyebrow').innerHTML = `<span class="sparkle">✦</span> ${escapeHtml(essay.title.toUpperCase())}`;
    document.querySelector('.setup-card strong').textContent = essayLabel + ' · ' + essay.meta.topic;
    document.querySelector('.setup-card p').textContent = `題目：${essay.question.join(' ')} ${essay.meta.summary}${requestedKey === 'discuss-both-views:4' ? ' 此範文雖列於 Discuss Both Views 分類，正文主要論證反對家族經營是最佳模式。' : ''}`;
    if(isTask1){
      document.querySelector('.hero-tags span').textContent='圖表與概覽';
      const gallery=document.createElement('figure');
      gallery.className='memory-task1-visual';
      const caption=document.createElement('figcaption');
      caption.textContent='原題圖表 · 點選圖片放大查看';
      gallery.append(caption);
      for(const image of essay.questionImages||[]){
        const link=document.createElement('a');
        link.href=image.src;link.target='_blank';link.rel='noopener';
        const img=document.createElement('img');
        img.src=image.src;img.alt=image.alt||'IELTS Writing Task 1 原題圖表';img.loading='lazy';
        link.append(img);gallery.append(link);
      }
      document.querySelector('.setup-card').after(gallery);
    }
    document.querySelector('.pilot-note').textContent = `${essayLabel} · 選擇題及重組由系統核對；朗讀錄音只儲存在此瀏覽器的範文背書收藏，口說內容須自行重聽核對。進度自動儲存在本機；可下載備份及載入進度檔。`;
  }
  document.querySelectorAll('[data-memory-essay]').forEach(link => { if (link.dataset.memoryEssay === (isPilot ? 'opinion:80' : requestedKey)) link.setAttribute('aria-current', 'page'); });
  const audio = new Audio(essay.audio);
  audio.preload = 'metadata';
  const speedSelect = $('#playback-speed');
  speedSelect.value = localStorage.getItem('edmund-memory-playback-speed') || '1';
  audio.playbackRate = Number(speedSelect.value);
  speedSelect.addEventListener('change', () => { audio.playbackRate = Number(speedSelect.value); localStorage.setItem('edmund-memory-playback-speed', speedSelect.value); });
  const fontSizes = [{label:'標準',scale:1},{label:'大',scale:1.15},{label:'特大',scale:1.3}];
  let fontIndex = Math.max(0, fontSizes.findIndex(option => option.scale === Number(localStorage.getItem('edmund-memory-font-scale') || '1')));
  function applyFontSize() { document.documentElement.style.setProperty('--reader-scale', fontSizes[fontIndex].scale); $('#font-size-button').textContent = '字體大小：' + fontSizes[fontIndex].label + (fontIndex===fontSizes.length-1?'（按此還原）':'（按此放大）'); }
  $('#font-size-button').addEventListener('click', () => {fontIndex=(fontIndex+1)%fontSizes.length;localStorage.setItem('edmund-memory-font-scale',String(fontSizes[fontIndex].scale));applyFontSize();balanceTransferChoices();});
  applyFontSize();
  let segmentEnd = null;
  let audioButton = null;
  function progressSnapshot() { return {stageOrder:"20261028",mapFormat:"paragraph-v1",vocabularyFormat:"paired-v1",stage:state.stage,round:state.round,unlocked:state.unlocked,solved:state.solved,completed:state.completed,selection:state.transitioning?[]:state.selection,hadMistake:state.hadMistake,hintRetry:Object.fromEntries([...freshRecordingRequired].map(key=>[key,true])),savedAt:new Date().toISOString()}; }
  function save() {
    try { localStorage.setItem(storageKey,JSON.stringify(progressSnapshot()));$('#save-status').textContent='已儲存在此瀏覽器 · '+new Date().toLocaleTimeString('zh-HK',{hour:'2-digit',minute:'2-digit'});return true; }
    catch {$('#save-status').textContent='瀏覽器未能儲存，請下載備份以保留進度。';return false;}
  }
  function validatedSelection(stage,step,selection) {
    const item=stageDefinitions[stage]?.rounds[step];if(!item || !Array.isArray(selection))return [];
    if(item.type==='multi')return [...new Set(selection.filter(n=>Number.isInteger(n)&&n>=0&&n<item.options.length))].slice(0,2);
    const count=item.type==='vocabulary'?buildParts(item).length:item.type==='precision'?support.sentences[item.sentenceIndex].chunks.length:item.items?.length||0;
    return selection.length<count && selection.every((n,i)=>n===i)?selection:[];
  }
  function validateProgress(data) {
    if(data?.format!==backupFormat || data.version!==backupVersion || (data.essayId!==essay.id && !(isPilot && data.essayId == null)) || !data.progress || typeof data.progress!=='object')throw Error(`這不是本版本的 ${essayLabel} 進度檔。`);
    const p=migrateVocabularyProgress(migrateStageOrder(data.progress));if(p.mapFormat!=='paragraph-v1' && p.stage===9)p.round=0;if(!Number.isInteger(p.stage)||!stageDefinitions[p.stage]||!Number.isInteger(p.round)||!stageDefinitions[p.stage].rounds[p.round])throw Error('進度檔的關卡或步驟無效。');
    const solved={};for(const [key,value] of Object.entries(p.solved||{})){const [stage,step]=key.split(':').map(Number);if(p.mapFormat!=='paragraph-v1' && stage===9)continue;if(/^\d+:\d+$/.test(key)&&stageDefinitions[stage]?.rounds[step]&&[1,2].includes(value))solved[key]=value;}
    return {stage:p.stage,round:p.mapFormat!=='paragraph-v1' && p.stage===9 ? 0 : p.round,unlocked:0,solved,selection:validatedSelection(p.stage,p.round,p.selection),hadMistake:p.hadMistake===true,hintRetry:p.hintRetry&&typeof p.hintRetry==='object'?p.hintRetry:{},completed:false};
  }

  const roundKey = () => `${state.stage}:${state.round}`;
  const round = () => stageDefinitions[state.stage].rounds[state.round];
  let orderCache = new Map();
  function shuffled(length) {
    const values=Array.from({length},(_,i)=>i);
    for(let i=length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[values[i],values[j]]=[values[j],values[i]];}
    return values;
  }
  function orderedSeed(length, purpose='options') {
    const key=`${roundKey()}:${purpose}:${length}`;
    if(!orderCache.has(key)) orderCache.set(key,shuffled(length));
    return orderCache.get(key);
  }
  const answerSound = correct => document.dispatchEvent(new CustomEvent('edmund:answer-result',{detail:{correct}}));
  function flyCard(button, slotIndex) {
    if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const from=button.getBoundingClientRect(), clone=button.cloneNode(true);
    const target=$('#game-card').querySelectorAll('.sequence-slot')[slotIndex];
    if(!target)return;
    const to=target.getBoundingClientRect();
    Object.assign(clone.style,{position:'fixed',left:from.left+'px',top:from.top+'px',width:from.width+'px',height:from.height+'px',margin:'0',zIndex:10000,pointerEvents:'none',transformOrigin:'top left'});
    document.body.append(clone);
    clone.animate([{transform:'translate(0,0)',opacity:1},{transform:`translate(${to.left-from.left}px,${to.top-from.top}px) scale(${to.width/from.width},${to.height/from.height})`,opacity:0.15}],{duration:420,easing:'cubic-bezier(.2,.8,.2,1)'}).finished.finally(()=>clone.remove());
  }
  const phraseTiles = text => support.sentences[sentences.findIndex(s => s.english === text)].chunks;


  function feedback(message, kind = '') {
    const element = $('#feedback');
    element.textContent = message;
    element.className = `feedback ${kind}`;
  }
  function playAudio(start = 0, end = null, button = null) {
    if (!audio.paused) audio.pause();
    if (audioButton) audioButton.classList.remove('is-playing');
    audioButton = button;
    segmentEnd = end;
    const begin = () => {
      try { audio.currentTime = start; } catch { /* Metadata may still be loading. */ }
      audio.play().then(() => { button?.classList.add('is-playing'); feedback('正在播放範文朗讀。', 'hint'); }).catch(() => feedback('音訊未能播放。請按一下播放鍵重試。', 'error'));
    };
    if (audio.readyState >= 1) begin();
    else { audio.addEventListener('loadedmetadata', begin, { once: true }); audio.load(); }
  }
  let playbackFrame;
  audio.addEventListener('play',()=>{cancelAnimationFrame(playbackFrame);const check=()=>{if(segmentEnd!==null && audio.currentTime>=segmentEnd)audio.pause();if(!audio.paused)playbackFrame=requestAnimationFrame(check);};check();});
  audio.addEventListener('timeupdate', () => { if (segmentEnd !== null && audio.currentTime >= segmentEnd) audio.pause(); });
  audio.addEventListener('pause', () => audioButton?.classList.remove('is-playing'));
  audio.addEventListener('error', () => feedback('音訊未能載入。請稍後重試，或到原範文頁播放。', 'error'));

  function renderRail() {
    $('#stage-rail').innerHTML = stageDefinitions.map((stage, index) => {
      const done = stage.rounds.every((_, roundIndex) => state.solved[`${index}:${roundIndex}`]);
      const locked = false; // Let learners revisit any skill without replaying every earlier round.
      return `<button class="stage-node ${index === state.stage ? 'active' : ''} ${done ? 'done' : ''}" type="button" data-stage="${index}" ${locked ? 'disabled' : ''} aria-label="${escapeHtml(stage.title)}${locked ? '，尚未解鎖' : ''}" ${index === state.stage ? 'aria-current="step"' : ''}><span class="node-icon" aria-hidden="true">${done ? '✓' : stage.icon}</span><span class="node-copy"><small>${String(index + 1).padStart(2, '0')} · ${stage.en}</small><strong>${stage.title}</strong></span></button>`;
    }).join('');
    $('#journey-count').textContent = `${stageDefinitions.filter((stage, index) => stage.rounds.every((_, roundIndex) => state.solved[`${index}:${roundIndex}`])).length} / ${stageDefinitions.length} 完成`;
  }
  function renderHeader() {
    const stage = stageDefinitions[state.stage];
    $('#play-title').closest('.play-area').dataset.palette = state.stage % 5;
    const solvedCount = Object.keys(state.solved).filter(key => state.solved[key]).length;
    const stars = Object.values(state.solved).reduce((sum, value) => sum + (Number(value) || 0), 0);
    $('#stage-kicker').textContent = `MISSION ${String(state.stage + 1).padStart(2, '0')} / ${stage.en}`;
    $('#play-title').textContent = stage.title;
    $('#stage-description').textContent = stage.description;
    $('#star-count').textContent = stars;
    $('#round-number').textContent = `本關 ${state.round + 1} / ${stage.rounds.length}`;
    $('#overall-number').textContent = `全程 ${solvedCount} / ${totalRounds} 步`;
    const percent = Math.round(solvedCount / totalRounds * 100);
    $('#progress-fill').style.width = `${percent}%`;
    $('#overall-progress').setAttribute('aria-valuenow', String(percent));
    $('#step-picker-current').textContent=`${state.round+1} / ${stage.rounds.length} · ${stepTitle(round()).replace(/\n/g,' ')}`;
    $('#step-select').innerHTML=stage.rounds.map((item,i)=>`<option value="${i}" ${i===state.round?'selected':''}>${i+1}. ${escapeHtml(stepTitle(item))}${state.solved[`${state.stage}:${i}`]?' ✓':''}</option>`).join('');
  }
  function renderQuiz(item) {
    const indices = orderedSeed(item.options.length, state.stage * 43 + state.round * 17);
    return `<div class="question-intro"><span class="question-mark">?</span><div><p class="question-label">SELECT THE BEST ANSWER</p><h3>${item.context && item.question?`<span class="transfer-context">${escapeHtml(item.context)}</span><span class="transfer-question">${escapeHtml(item.question)}</span>`:escapeHtml(item.prompt)}</h3>${item.detail ? `<p>${escapeHtml(item.detail)}</p>` : ''}</div></div><div class="choice-grid">${indices.map(index => `<button class="choice-card" type="button" data-choice="${index}"><span class="choice-symbol" aria-hidden="true">${String.fromCharCode(65 + indices.indexOf(index))}</span><span class="choice-text">${escapeHtml(item.options[index])}</span><span class="choice-arrow" aria-hidden="true">↗</span></button>`).join('')}</div>`;
  }
  function shortChineseTail(element) {
    const lines = new Map();
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      for (let index = 0; index < node.textContent.length; index++) {
        const range = document.createRange();
        range.setStart(node, index);
        range.setEnd(node, index + 1);
        const rect = range.getBoundingClientRect();
        if (!rect.width && !rect.height) continue;
        const top = Math.round(rect.top);
        lines.set(top, (lines.get(top) || '') + node.textContent[index]);
      }
    }
    if (lines.size < 2) return false;
    const lastLine = [...lines].sort((a, b) => a[0] - b[0]).at(-1)[1];
    return /^[\u3400-\u9fff]{1,3}[。！？]?$/.test(lastLine.trim());
  }
  function balanceTransferChoices() {
    if (isPilot || state.stage !== 4) return;
    document.querySelectorAll('#game-card .choice-card .choice-text').forEach(span => {
      const fullText = span.dataset.fullText || span.textContent;
      span.dataset.fullText = fullText;
      span.textContent = fullText;
      span.style.textWrap = 'wrap';
      const needsBreak = shortChineseTail(span);
      span.style.textWrap = '';
      const breaks=needsBreak?[...fullText.matchAll(/，/g)]
        .map(match=>match.index+1)
        .filter(index=>index>=5&&fullText.length-index>=5)
        .sort((a,b)=>Math.abs(a-fullText.length/2)-Math.abs(b-fullText.length/2)):[];
      const split=breaks[0]??null;
      const tail=fullText.match(/(?:[\u3400-\u9fff]{4}|[0-9][0-9,]*\s*[\u3400-\u9fff]{1,4}|[A-Za-z0-9%$]+\s*[\u3400-\u9fff]{1,3}|[\u3400-\u9fff]{1,2}[、，][\u3400-\u9fff]{1,3})[。！？」』）]*$/);
      if(!tail){
        if(split!==null)span.replaceChildren(document.createTextNode(fullText.slice(0,split)),document.createElement('br'),document.createTextNode(fullText.slice(split)));
        return;
      }
      const tailStart=fullText.length-tail[0].length;
      const guard=document.createElement('span');
      guard.className='choice-tail';
      guard.textContent=tail[0];
      if(split!==null&&split<tailStart)span.replaceChildren(
        document.createTextNode(fullText.slice(0,split)),document.createElement('br'),
        document.createTextNode(fullText.slice(split,tailStart)),guard);
      else span.replaceChildren(document.createTextNode(fullText.slice(0,tailStart)),guard);
    });
  }
  let transferResizeFrame = 0;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(transferResizeFrame);
    transferResizeFrame = requestAnimationFrame(balanceTransferChoices);
  });
  function renderMulti(item) {
    const indices = orderedSeed(item.options.length, 29);
    return `<div class="question-intro"><span class="question-mark">2</span><div><p class="question-label">CHOOSE TWO</p><h3>${escapeHtml(item.prompt)}</h3><p>${escapeHtml(item.detail)}</p></div></div><div class="choice-grid">${indices.map(index => `<button class="choice-card ${state.selection.includes(index) ? 'selected' : ''}" type="button" data-multi="${index}" aria-pressed="${state.selection.includes(index)}"><span class="choice-symbol" aria-hidden="true">${state.selection.includes(index) ? '✓' : '+'}</span><span>${escapeHtml(item.options[index])}</span></button>`).join('')}</div><div class="action-bar"><span>已選 ${state.selection.length} / 2 項</span><button class="primary-button" type="button" data-confirm ${state.selection.length !== 2 ? 'disabled' : ''}>確認兩條理由 <span aria-hidden="true">→</span></button></div>`;
  }
  function renderSequence(item, precision = false) {
    const items = precision ? phraseTiles(sentences[item.sentenceIndex].english).map(title => ({ title })) : item.items;
    const indices = orderedSeed(items.length, state.stage * 101 + state.round * 19).filter(index => !item.sentenceMap || !state.selection.includes(index));
    const sentence = item.sentenceIndex == null ? null : sentences[item.sentenceIndex];
    const paragraph = Number.isInteger(item.paragraph) ? byParagraph(item.paragraph) : null;
    const extra = sentence ? `<div class="memory-tools"><span class="role-badge">${escapeHtml(sentence.role)}</span><button class="mini-button" type="button" data-play-sentence="${item.sentenceIndex}">♫ 聽這一句</button><button class="mini-button" type="button" data-translation>繁體中文提示</button></div>${state.revealTranslation ? `<p class="translation-line">${escapeHtml(sentence.chinese)}</p>` : ''}` : paragraph ? `<div class="memory-tools"><span class="role-badge">${['開場', '第一主體段', '第二主體段', '總結'][item.paragraph]}</span><button class="mini-button" type="button" data-translation>${state.revealTranslation ? '隱藏' : '顯示'}繁體中文</button></div>${state.revealTranslation ? `<div class="translation-list">${paragraph.map((line, index) => `<p><b>${index + 1}.</b> ${escapeHtml(line.chinese)}</p>`).join('')}</div>` : ''}` : '';
    return `<div class="question-intro"><span class="question-mark">${precision ? '✦' : '↝'}</span><div><p class="question-label">${precision ? 'REBUILD THE EXACT SENTENCE' : 'TAP IN THE CORRECT ORDER'}</p><h3>${escapeHtml(item.prompt)}</h3>${precision?'':`<p>${escapeHtml(item.detail || '逐一點選正確次序。')}</p>`}</div></div>${extra}<div class="sequence-track" aria-label="已選次序">${items.map((_, index) => `<div class="sequence-slot ${state.selection[index] == null ? '' : 'filled'}"><small>${String(index + 1).padStart(2, '0')}</small><span>${state.selection[index] == null ? '下一步' : escapeHtml(item.sentenceMap?items[state.selection[index]].title:items[state.selection[index]].body || items[state.selection[index]].title)}</span></div>`).join('')}</div><div class="option-heading"><span>${precision ? '片語卡' : '待排序卡'}</span><span>${state.selection.length} / ${items.length}</span></div><div class="sequence-options ${precision ? 'phrase-options' : ''}">${indices.map(index => `<button class="sequence-card ${state.selection.includes(index) ? 'used' : ''}" type="button" data-sequence="${index}" ${state.selection.includes(index) ? 'disabled' : ''}><span class="option-glyph" aria-hidden="true">${precision ? '✧' : '◆'}</span><span><strong>${escapeHtml(item.sentenceMap?items[index].title:items[index].body || items[index].title)}</strong>${items[index].body ? `<small>${escapeHtml(item.sentenceMap?items[index].body:items[index].title)}</small>` : ''}</span></button>`).join('')}</div><div class="action-bar"><span>${item.sentenceMap?'按段落原有句序依次點選':'按原有邏輯依次點選'}</span><button class="text-button" type="button" data-undo ${state.selection.length ? '' : 'disabled'}>撤銷上一步 ↶</button></div>`;
  }
  function lineHtml(text) { return String(text).split('\n').map(line => `<p>${escapeHtml(line)}</p>`).join(''); }
  function wordTable(content) {
    if (!content.synonyms.length) return `<p class="support-notes">這句很短，毋須硬加字詞替代；直接按原意重組。</p>`;
    return `<div class="table-scroll"><table class="support-table"><thead><tr><th>原文字詞</th><th>簡單說法</th><th>意思</th></tr></thead><tbody>${content.synonyms.map(p=>`<tr><td>${escapeHtml(p.original)}</td><td>${escapeHtml(p.simple)}</td><td>${escapeHtml(p.meaning)}</td></tr>`).join('')}</tbody></table></div>`;
  }
  function buildParts(item) {
    const ids=item.sentenceIndices || [item.sentenceIndex];
    return ids.flatMap(i=>(item.reverse?support.sentences[i].chunks:support.sentences[i].simpleChunks).map(text=>({text,sentenceIndex:i})));
  }
  function highlightedOriginal(index) {
    const sentenceText = sentences[index].english;
    const terms = support.sentences[index].synonyms.map(item => item.original).sort((a,b)=>b.length-a.length);
    if (!terms.length) return escapeHtml(sentenceText);
    const specials = '.+*?^$()[]{}|\\';
    const escapePattern = value => [...value].map(char => specials.includes(char) ? '\\' + char : char).join('');
    const pattern = new RegExp('(?<![\\p{L}])(?:' + terms.map(escapePattern).join('|') + ')(?![\\p{L}])','giu');
    let result='', cursor=0;
    for (const match of sentenceText.matchAll(pattern)) {
      result += escapeHtml(sentenceText.slice(cursor,match.index));
      result += `<mark class="vocabulary-highlight">${escapeHtml(match[0])}</mark>`;
      cursor = match.index + match[0].length;
    }
    return result + escapeHtml(sentenceText.slice(cursor));
  }
  function renderVocabulary(item) { return renderBuild(item); }
  function renderBuild(item) {
    if(item.reverse && !state.solved[`5:${state.round-1}`]) return `<h3>${escapeHtml(item.prompt)}</h3><p>先完成這組句子的簡單英文重組，再拼回原文。</p><button class="primary-button" data-build-prerequisite>前往簡單英文重組 →</button>`;
    const ids=item.sentenceIndices || [item.sentenceIndex];
    const parts=buildParts(item), position=state.selection.length;
    const synonyms=ids.flatMap(index=>support.sentences[index].synonyms);
    const lexicon={synonyms:synonyms.filter((entry,index)=>synonyms.findIndex(other=>other.original.toLowerCase()===entry.original.toLowerCase())===index)};
    const original=ids.map(index=>sentences[index].english).join(' ');
    const simple=ids.map(index=>support.sentences[index].simple).join(' ');
    const source=item.reverse
      ? `<div class="build-source"><span class="build-source-label">原文 · 標示可簡化字詞</span><p class="support-source">${ids.map(highlightedOriginal).join(' ')}</p><span class="build-source-label">簡單說法</span><p class="simple-source">${escapeHtml(simple)}</p></div>`
      : `<p class="support-source">${escapeHtml(original)}</p>`;
    const bank=parts.map(part=>part.text);
    const choices=[...new Set(parts.slice(position).map(part=>part.text))].slice(0,4);
    const indices=orderedSeed(choices.length,`build-${position}`);
    return `<p class="build-mode">${item.reverse?'第二步 · 還原原文':'第一步 · 用簡單字說出意思'}</p><h3>${escapeHtml(item.prompt)}</h3><p>${ids.length>1?'把相鄰句子連起來，':'選出下一小節，'}按正確次序完成。${item.reverse?'現在把簡單說法換回原文。':'保留原意，用較容易的字詞表達。'}</p>${source}${wordTable(lexicon)}<div class="table-scroll"><table class="support-table word-bank"><caption>這組句子的小節（次序已打亂）</caption><tbody>${orderedSeed(bank.length,'bank').map(i=>`<tr><td>${escapeHtml(bank[i])}</td></tr>`).join('')}</tbody></table></div><div class="sequence-track build-track">${state.selection.map(i=>`<div class="sequence-slot filled"><span>${escapeHtml(parts[i].text)}</span></div>`).join('')}<div class="sequence-slot">下一小節</div></div><div class="choice-grid">${indices.map(i=>`<button class="choice-card" data-build="${i}">${escapeHtml(choices[i])}</button>`).join('')}</div><p>${position} / ${parts.length} 小節已完成</p>`;
  }
  function renderStructure(item) {
    const source = sentences.find(s=>s.paragraph===item.source.paragraph-1 && s.index===item.source.sentence-1);
    return `<p class="question-label">第 ${item.source.paragraph} 段 · 第 ${item.source.sentence} 句</p><p class="support-source">${escapeHtml(source.english)}</p><p class="structure-translation" lang="zh-Hant">${escapeHtml(source.chinese)}</p><div class="structure-parts">${item.parts.map(p=>`<span class="structure-part ${p.kind}">${escapeHtml(p.text)}<small>${escapeHtml(p.label || (p.kind==='slot'?'原句內容':'連接詞'))}</small></span>`).join('')}</div><div class="concept-grid"><section class="concept-card"><span class="concept-label">01 · 意思</span><p>${escapeHtml(item.meaning)}</p></section><section class="concept-card"><span class="concept-label">02 · 甚麼時候用？</span><p>${escapeHtml(item.usage)}</p></section></div>${item.contextNote?`<aside class="concept-note">${escapeHtml(item.contextNote)}</aside>`:''}${renderQuiz(item)}<p class="support-notes">${item.patternType?'比較四句的句型及語意，選出正確使用標示結構的一句。':'比較四句的語意關係；選出符合這個句型的一句。'}</p>`;
  }
  const savedRecordings=new Set();
  const freshRecordingRequired = new Set(Object.keys(saved.hintRetry || {}).filter(key=>saved.hintRetry[key]===true));
  const attemptRecordingReady = new Set();
  const hintShown = new Set();
  const hintUsed = new Set();
  let recorder = null, microphone = null, recordedChunks = [], recordStartedAt = 0, recordingCancelled = false;
  EssayMemoryRecordings.list().then(records => {records.forEach(record=>savedRecordings.add(record.id));if(round().type==='speaking')$('#game-card').innerHTML=renderSpeaking(round());}).catch(()=>{});
  // Keep saved recording identifiers stable when the repeated stage is removed.
  const recordingId=()=>`${isPilot?'essay80':essay.id+'-memory'}-${state.stage>=7?state.stage+1:state.stage}-${state.round}`;
  const recordingReceipt=()=>recordingId();
  function mediumMask(text) {
    const phrases=[...essay.mediumAnswers,...(support.mediumExtras||[])].sort((a,b)=>b.length-a.length);
    const escapeRegex=x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    return text.replace(new RegExp('\\b('+phrases.map(escapeRegex).join('|')+')\\b','gi'),match=>'＿'.repeat(Math.min(12,Math.max(3,match.length))));
  }
  function renderSpeaking(item) {
    const receipt=recordingReceipt();
    const recorded=savedRecordings.has(receipt) && (!freshRecordingRequired.has(roundKey()) || attemptRecordingReady.has(roundKey()));
    const revealed=!item.guided && hintShown.has(roundKey());
    return `<h3>${escapeHtml(item.prompt)}</h3><p>${item.guided?'聽這一小步，再錄下自己的朗讀。':'補回空格並錄下完整一句。需要時可看原句；用了提示，下一次須不看提示再錄。'}</p><div class="speaking-text">${lineHtml(revealed||item.guided?item.text:mediumMask(item.text))}</div><div class="reading-controls">${item.guided?'<button class="mini-button" data-play-chunk>♫ 聽這一小步</button>':''}${!item.guided?`<button class="mini-button" data-reveal-full>${revealed?'隱藏原句':'顯示完整原句'}</button>`:''}<span>播放速度可在上方調整。</span></div><section class="question-card recording-practice"><button class="primary-button" type="button" data-record-toggle>${recorder?.state==='recording'?'■ 停止並儲存':'● 錄音練習'}</button><a class="mini-button" href="essay-memory-recordings.html" target="_blank" rel="noopener">我的範文背書錄音 ↗</a></section>${recorded?'<p class="recording-status">已儲存在此瀏覽器的範文背書錄音收藏。</p>':''}<button class="primary-button support-next" data-speaking-done ${!recorded?'disabled':''}>${revealed?'下一小步 · 不看提示再錄一次 →':'錄音已儲存 · 下一小步 →'}</button>`;
  }
  async function toggleRecording() {
    if (recorder?.state==='recording') { recorder.stop(); return; }
    try {
      microphone = await navigator.mediaDevices.getUserMedia({audio:true});
      const mimeType = ['audio/webm;codecs=opus','audio/mp4','audio/webm'].find(type=>MediaRecorder.isTypeSupported(type));
      recorder = new MediaRecorder(microphone, mimeType?{mimeType}:{});
      recordedChunks=[];
      const id=recordingReceipt(), title=`${essayLabel} · ${round().prompt}`;
      recorder.ondataavailable=event=>{if(event.data.size)recordedChunks.push(event.data);};
      const keyAtStart=roundKey();
      recorder.onstop=async()=>{
        microphone.getTracks().forEach(track=>track.stop());
        if(recordingCancelled) return;
        try {
          const blob=new Blob(recordedChunks,{type:recorder.mimeType||'audio/webm'});
          if(blob.size<1000 || Date.now()-recordStartedAt<700) throw Error('錄音太短，請重試。');
          await EssayMemoryRecordings.save({id,essayId:essay.id,title,savedAt:new Date().toISOString(),blob});
          savedRecordings.add(id);
          attemptRecordingReady.add(keyAtStart);
          if(!hintUsed.has(keyAtStart)) freshRecordingRequired.delete(keyAtStart);
          if(roundKey()===keyAtStart) $('#game-card').innerHTML=renderSpeaking(round());
          feedback('錄音已儲存到範文背書收藏。請自行重聽核對。','success');
        } catch(error) { feedback('未能儲存錄音：'+error.message,'error');$('#game-card').innerHTML=renderSpeaking(round()); }
      };
      recordingCancelled=false;recordStartedAt=Date.now(); recorder.start();
      $('#game-card').innerHTML=renderSpeaking(round());
    } catch(error) {feedback('無法使用咪高峰：'+error.message,'error');}
  }
  function render() {
    if(recorder?.state==='recording') {recordingCancelled=true;recorder.stop();}
    orderCache.clear();
    renderRail(); renderHeader(); feedback('');
    const item = round();
    const card = $('#game-card');
    card.classList.remove('card-enter','is-correct','sentence-map','simple-build','exact-build','structure-card');
    if (item.sentenceMap) card.classList.add('sentence-map');
    if (item.type === 'structure') card.classList.add('structure-card');
    if (item.type === 'vocabulary') card.classList.add(item.reverse ? 'exact-build' : 'simple-build'); void card.offsetWidth; card.classList.add('card-enter');
    card.innerHTML = item.type === 'quiz' ? renderQuiz(item) : item.type === 'structure' ? renderStructure(item) : item.type === 'vocabulary' ? renderVocabulary(item) : item.type==='speaking' ? renderSpeaking(item) : item.type === 'multi' ? renderMulti(item) : renderSequence(item, item.type === 'precision');
    balanceTransferChoices();
    save();
  }
  function celebrate() {
    const layer = $('#confetti');
    layer.innerHTML = Array.from({ length: 18 }, (_, index) => `<i style="--x:${Math.round((index / 17) * 100)}%;--delay:${index % 5 * 40}ms;--hue:${index % 2 ? 43 : 169}"></i>`).join('');
    setTimeout(() => { layer.innerHTML = ''; }, 1150);
  }
  function succeed(selfCheck = false, sounded = false) {
    if (state.transitioning) return;
    state.transitioning = true;
    if(!selfCheck && !sounded)answerSound(true);
    if (!state.solved[roundKey()]) state.solved[roundKey()] = state.hadMistake ? 1 : 2;
    save(); renderHeader(); renderRail();
    feedback(selfCheck ? '錄音已儲存。請在範文背書錄音收藏重聽；口說內容不會由系統自動評分。' : `答對了！${round().why || '你已接上這一段記憶。'}`, 'success');
    $('#game-card').classList.add('is-correct');
    $('#game-card').querySelectorAll('button').forEach(button => { button.disabled = true; });
    if(round().modelLink){
      const q=round();
      $('#game-card').insertAdjacentHTML('beforeend',`<section class="model-connection"><h4>${isTask1?'這題怎樣應用範文的描述方法？':'這題怎樣應用範文的論證？'}</h4><p>${escapeHtml(q.modelLink)}</p><details><summary>對照範文原句</summary>${q.sourceSentenceIndices.map(i=>`<blockquote><small>第 ${sentences[i].paragraph+1} 段 · 第 ${sentences[i].index+1} 句</small><p lang="en">${escapeHtml(sentences[i].english)}</p><p class="model-translation" lang="zh-Hant"><span>中文意思</span>${escapeHtml(sentences[i].chinese)}</p></blockquote>`).join('')}</details></section>`);
    }
    $('#game-card').insertAdjacentHTML('beforeend', '<button class="primary-button support-next" data-continue>下一小步 →</button>');
    if (!selfCheck) celebrate();
  }
  function advance() {
    audio.pause(); $('#game-card').classList.remove('is-correct');
    const stage = stageDefinitions[state.stage];
    if (state.round + 1 < stage.rounds.length) state.round++;
    else if (state.stage + 1 < stageDefinitions.length) {
      state.unlocked = Math.max(state.unlocked, state.stage + 1); state.stage++; state.round = 0;
    } else {
      state.transitioning = false; state.completed = stageDefinitions.every((stage,i)=>stage.rounds.every((_,j)=>state.solved[`${i}:${j}`]));
      if (state.completed) {renderEnd();save();return;}
      const nextStage=stageDefinitions.findIndex((stage,i)=>stage.rounds.some((_,j)=>!state.solved[`${i}:${j}`]));
      state.stage=nextStage;state.round=stageDefinitions[nextStage].rounds.findIndex((_,j)=>!state.solved[`${nextStage}:${j}`]);
    }
    state.selection=[];state.checks=[];state.hadMistake=false;state.revealTranslation=false;state.transitioning=false;
    render();
  }
  function mistake(button, message = '還差一點。留意句子之間的邏輯，再試一次。') {
    answerSound(false);
    state.hadMistake = true;save();
    feedback(message, 'error');
    button?.classList.remove('is-wrong'); void button?.offsetWidth; button?.classList.add('is-wrong');
  }
  function renderEnd() {
    renderRail(); renderHeader();
    $('#stage-kicker').textContent = 'JOURNEY COMPLETE';
    $('#play-title').textContent = `你已走完 ${essayLabel} 的記憶路線`;
    $('#stage-description').textContent = '你已完成字詞、句型、雙向句子重組，以及分小步的有提示與中階填空朗讀。';
    $('#round-number').textContent = '十一個關卡完成';
    const recap=isTask1
      ? '先說明圖表類型、單位及概覽，再依次報告主要數據、比較和變化，最後逐句還原英文。'
      : essay.taskType==='Cause / Solution'
        ? '先說出問題與解決路線，再依次講出兩段細節、例子與結論，最後逐句還原英文。'
        : '先說出文章如何回應題目，以及兩段主體的主要方向，再講出細節、例子與結論，最後逐句還原英文。';
    $('#game-card').innerHTML = `<div class="ending"><div class="ending-star" aria-hidden="true">✦</div><p class="question-label">JOURNEY COMPLETE</p><h3>你已完成所有朗讀小步與${isTask1?'跨圖表描述':'跨主題論證'}練習。</h3><p>現在可嘗試一次過背出整篇：${recap}你可以重玩任何關卡，或回原範文頁聽完整錄音。</p><div class="ending-actions"><button class="primary-button" type="button" data-replay>重玩原文重組 ↺</button><a class="secondary-button" href="${escapeHtml(writingUrl)}">對照原範文 ↗</a></div></div>`;
    feedback('完成！朗讀及重述為自行核對，系統不會自動判定口說準確度。', 'success');
  }

  $('#game-card').addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.hasAttribute('data-continue')) { advance(); return; }
    if (state.transitioning) return;
    const item = round();
    if(button.hasAttribute('data-build-prerequisite')) {state.round--;state.selection=[];render();}
    else if(button.hasAttribute('data-build')) {
      if(Number(button.dataset.build)!==0){mistake(button,'這個小節不能接在這裏。留意意思及句子次序。');return;}
      const old=button.cloneNode(true), rect=button.getBoundingClientRect();old.getBoundingClientRect=()=>rect;
      state.selection.push(state.selection.length);answerSound(true);
      const parts=buildParts(item);
      if(state.selection.length===parts.length){
        if(item.reverse){
          const ids=item.sentenceIndices || [item.sentenceIndex];
          const simple=ids.map(index=>support.sentences[index].simple).join(' ');
          $('#game-card').innerHTML=`<h3>${escapeHtml(item.prompt)}</h3><div class="build-source"><span class="build-source-label">原文 · 標示可簡化字詞</span><p class="support-source">${ids.map(highlightedOriginal).join(' ')}</p><span class="build-source-label">簡單說法</span><p class="simple-source">${escapeHtml(simple)}</p></div>`;
        } else $('#game-card').innerHTML=`<h3>${escapeHtml(item.prompt)}</h3><p class="speaking-text">${escapeHtml(parts.map(p=>p.text).join(' '))}</p>`;
        succeed(false,true);
      }
      else {$('#game-card').innerHTML=renderBuild(item);flyCard(old,state.selection.length-1);}
    } else if(button.hasAttribute('data-play-chunk')) {
      let first=sentences[item.sentenceIndices[0]],last=sentences[item.sentenceIndices.at(-1)],start=first.start,end=last.end;
      if(Number.isInteger(item.chunkIndex)){
        const offset=support.sentences[item.sentenceIndices[0]].chunks.slice(0,item.chunkIndex).join(' ').trim().split(/\s+/).filter(Boolean).length;
        const count=item.text.trim().split(/\s+/).length;
        start=first.words[offset][1];end=first.words[offset+count-1][2];
      }
      playAudio(start,end,button);
    } else if (button.hasAttribute('data-choice')) {
      const choice = Number(button.dataset.choice);
      if (choice === item.correct) { button.classList.add('is-right'); succeed(); }
      else mistake(button, item.explanations?.[choice] || '這一項與原文的立場或細節不符。再選一次。');
    } else if (button.hasAttribute('data-multi')) {
      const index = Number(button.dataset.multi);
      state.selection = state.selection.includes(index) ? state.selection.filter(value => value !== index) : state.selection.length < 2 ? [...state.selection, index] : state.selection;
      $('#game-card').innerHTML = renderMulti(item);
    } else if (button.hasAttribute('data-confirm')) {
      const correct = [...item.correct].sort().join(',') === [...state.selection].sort().join(',');
      if (correct) succeed(); else mistake(button, isPilot ? '兩條理由要分別對應「更廣泛取得知識」與「實用數碼技能」。' : '請對照這篇範文的兩條主線，再選一次。');
    } else if (button.hasAttribute('data-sequence')) {
      const index = Number(button.dataset.sequence);
      const expected = state.selection.length;
      if (index !== expected) { mistake(button); return; }
      const old=button.cloneNode(true), rect=button.getBoundingClientRect();old.getBoundingClientRect=()=>rect;
      state.selection.push(index);answerSound(true);
      const length = item.type === 'precision' ? phraseTiles(sentences[item.sentenceIndex].english).length : item.items.length;
      $('#game-card').innerHTML = renderSequence(item, item.type === 'precision');
      flyCard(old,expected);
      if (state.selection.length === length) succeed(false,true);
    } else if (button.hasAttribute('data-undo')) {
      state.selection.pop(); $('#game-card').innerHTML = renderSequence(item, item.type === 'precision'); feedback('已撤銷上一步。', 'hint');
    } else if (button.hasAttribute('data-translation')) {
      state.revealTranslation = !state.revealTranslation;
      $('#game-card').innerHTML = renderSequence(item, item.type === 'precision');
    } else if (button.hasAttribute('data-play-sentence')) {
      const sentence = sentences[Number(button.dataset.playSentence)];
      playAudio(sentence.start, sentence.end, button);
    } else if (button.hasAttribute('data-record-toggle')) {
      toggleRecording();
    } else if (button.hasAttribute('data-reveal-full')) {
      if(hintShown.has(roundKey())) hintShown.delete(roundKey()); else hintShown.add(roundKey());
      hintUsed.add(roundKey());freshRecordingRequired.add(roundKey());attemptRecordingReady.delete(roundKey());
      $('#game-card').innerHTML=renderSpeaking(item);
    } else if (button.hasAttribute('data-speaking-done')) {
      if(!savedRecordings.has(recordingReceipt()) || (freshRecordingRequired.has(roundKey()) && !attemptRecordingReady.has(roundKey()))) return;
      if(hintUsed.has(roundKey())) { hintShown.delete(roundKey()); hintUsed.delete(roundKey()); attemptRecordingReady.delete(roundKey()); freshRecordingRequired.add(roundKey()); $('#game-card').innerHTML=renderSpeaking(item); feedback('現在不看原句，再錄一次這句才會前往下一句。','hint'); }
      else {succeed(true);advance();}
    } else if (button.hasAttribute('data-guided-help')) {
      state.stage=7;state.checks=[];state.revealTranslation=false;render();
    } else if (button.hasAttribute('data-replay')) {
      state.stage = 10; state.round = 0; state.selection = []; state.hadMistake = false; state.revealTranslation = false; render();
    }
  });
  $('#stage-rail').addEventListener('click', event => {
    const button = event.target.closest('[data-stage]');
    if (!button || button.disabled) return;
    state.transitioning=false;state.checks=[];
    state.stage = Number(button.dataset.stage); state.round = 0; state.selection = []; state.hadMistake = false; state.revealTranslation = false;
    audio.pause(); render();
  });
  $('#step-select').addEventListener('change', event => { audio.pause();state.round=Number(event.target.value);state.selection=[];state.checks=[];state.transitioning=false;state.hadMistake=false;state.revealTranslation=false;render(); });
  $('#game-card').addEventListener('click',save);
  function stepTitle(item) { return item.type==='structure' ? item.frame : item.prompt; }
  function renderStepOptions() {
    const query=$('#step-search').value.trim().toLocaleLowerCase();
    const rows=stageDefinitions[state.stage].rounds.map((item,i)=>({item,i})).filter(({item,i})=>`${i+1} ${stepTitle(item)}`.toLocaleLowerCase().includes(query));
    $('#step-options').innerHTML=rows.map(({item,i})=>`<button type="button" data-pick-step="${i}" class="picker-option ${i===state.round?'current':''}" ${i===state.round?'aria-current="step"':''}><span class="picker-number">${String(i+1).padStart(2,'0')}</span><span>${escapeHtml(stepTitle(item).replace(/\n/g,' '))}<small>${state.solved[`${state.stage}:${i}`]?'已完成':i===state.round?'目前步驟':'尚未完成'}</small></span><span aria-hidden="true">${state.solved[`${state.stage}:${i}`]?'✓':'→'}</span></button>`).join('')||'<p class="picker-empty">找不到相符步驟，請試另一個字詞。</p>';
  }
  $('#step-picker-open').addEventListener('click',()=>{$('#step-search').value='';renderStepOptions();$('#step-dialog').showModal();$('#step-search').focus();});
  $('#step-picker-close').addEventListener('click',()=>$('#step-dialog').close());
  $('#step-search').addEventListener('input',renderStepOptions);
  $('#step-dialog').addEventListener('click',event=>{const button=event.target.closest('[data-pick-step]');if(!button)return;$('#step-select').value=button.dataset.pickStep;$('#step-select').dispatchEvent(new Event('change'));$('#step-dialog').close();});
  $('#step-options').addEventListener('keydown',event=>{if(!['ArrowDown','ArrowUp','Home','End'].includes(event.key))return;const buttons=[...$('#step-options').querySelectorAll('button')];if(!buttons.length)return;event.preventDefault();const i=buttons.indexOf(document.activeElement);buttons[event.key==='Home'?0:event.key==='End'?buttons.length-1:(i+(event.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length].focus();});
  $('#save-progress').addEventListener('click',()=>{save();});
  $('#export-progress').addEventListener('click',()=>{
    const blob=new Blob([JSON.stringify({format:backupFormat,version:backupVersion,essayId:essay.id,progress:progressSnapshot()},null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=essay.id+'-memory-progress-'+new Date().toISOString().slice(0,10)+'.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),10000);$('#save-status').textContent='進度備份已交給瀏覽器下載；可在其他裝置載入。';
  });
  $('#import-progress').addEventListener('click',()=>$('#progress-file').click());
  $('#progress-file').addEventListener('change',async event=>{
    const file=event.target.files[0];if(!file)return;
    try{if(file.size>1000000)throw Error('進度檔過大。');const progress=validateProgress(JSON.parse(await file.text()));if(!confirm(`載入備份會取代此瀏覽器目前的 ${essayLabel} 進度。繼續？`))return;audio.pause();Object.assign(state,progress,{transitioning:false,revealTranslation:false,checks:[]});freshRecordingRequired.clear();Object.keys(progress.hintRetry).forEach(key=>{if(progress.hintRetry[key]===true)freshRecordingRequired.add(key);});hintShown.clear();hintUsed.clear();attemptRecordingReady.clear();render();$('#save-status').textContent='已載入備份。'+$('#save-status').textContent;}
    catch(error){$('#save-status').textContent='未能載入：'+error.message;}finally{event.target.value='';}
  });

  $('#audio-full').addEventListener('click', event => playAudio(0, null, event.currentTarget));
  $('#restart-round').addEventListener('click', () => { audio.pause(); state.transitioning=false; state.checks=[]; state.selection = []; state.hadMistake = false; state.revealTranslation = false; render(); });
  $('#restart-all').addEventListener('click', () => {
    if (!confirm(`重新開始會清除 ${essayLabel} 的本機進度。確定嗎？`)) return;
    audio.pause(); state.transitioning=false;state.checks=[];state.completed=false;state.stage = 0; state.round = 0; state.unlocked = 0; state.solved = {}; state.selection = []; state.hadMistake = false; state.revealTranslation = false; freshRecordingRequired.clear();hintShown.clear();hintUsed.clear();attemptRecordingReady.clear();render();
  });

  // Format displayed Chinese prose only; source data, attributes and answer keys stay intact.
  function formatChineseSentences(root) {
    const nodes=[];
    if(root.nodeType===Node.TEXT_NODE) nodes.push(root);
    else {const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);while(walker.nextNode())nodes.push(walker.currentNode);}
    for(const node of nodes){
      if(!node.parentElement || node.parentElement.closest('script,style,option,textarea'))continue;
      const formatted=node.data.replace(/([。！？；][」』”）】]*)[ \t]*(?=[^\s」』”）】])/g,'$1\n');
      if(formatted!==node.data){node.parentElement.classList.add('sentence-lines');node.data=formatted;}
    }
  }
  for(const root of [$('.shell'),$('#step-dialog')]){
    formatChineseSentences(root);
    new MutationObserver(records=>{for(const record of records){if(record.type==='characterData')formatChineseSentences(record.target);else record.addedNodes.forEach(formatChineseSentences);}}).observe(root,{childList:true,subtree:true,characterData:true});
  }

  if (state.completed && stageDefinitions.every((stage,i)=>stage.rounds.every((_,j)=>state.solved[`${i}:${j}`]))) renderEnd(); else render();
})();
