(function () {
  'use strict';
  const mode = document.body.dataset.logicView;
  const questions = window.READING_LOGIC_MODULE_1_QUESTIONS || [];
  const dashboard = document.querySelector('[data-view="dashboard"]');
  if (!dashboard || !['home', 'lesson', 'exercise'].includes(mode)) return;
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const lessonUrl = 'reading-logic-module-1.html';
  const exerciseUrl = 'reading-logic-exercise-1.html';
  const homeUrl = 'reading-logic-system.html';
  const phases = ['基礎建立', '範圍、分類與方向', '多重條件與隱藏陷阱', '綜合與高階判斷'];
  const state = { userId: '', stage: 0, beat: 0, question: 0, solved: new Set() };
  const stages = [
    {name:'全體 → 個體', accent:'gold', steps:[
      '<strong>原句說「全部」</strong>，就涵蓋群體裡的每一個成員。',
      '知道某個人或物件 <strong>確實在這個群體裡</strong>，才能把規則用在它身上。',
      '<span class="logic-formula">ALL A have B <span>＋</span> X is A <span>→</span> X has B</span>'
    ]},
    {name:'水果盒裡有甚麼？', accent:'blue', steps:[
      '盒子裡有 apple、banana、mango。先看一句話：<strong>I like all the fruit in the box.</strong>',
      '按一下盒子中的水果，看看「all the fruit」如何落在個別成員身上。',
      '<strong>all fruit ≠ mango</strong>；mango 是 fruit 這個集合中的一員。'
    ], special:'fruit'},
    {name:'從 all 開始', accent:'coral', steps:[
      '<strong>I like all fruit.</strong> ＋ Apples are fruit.',
      '所以：<strong>I like apples.</strong> 不是因為 fruit 和 apples 是同義詞，而是因為 apples 屬於 fruit。',
      '<strong>Tom eats all vegetables.</strong> Carrots are vegetables，因此 Tom eats carrots。'
    ]},
    {name:'every 也表示逐一涵蓋', accent:'green', steps:[
      '<strong>Every student has a book.</strong>',
      'Amy is a student。Amy 在這個群體裡，所以 <strong>Amy has a book.</strong>',
      '原文即使沒有逐字寫出 Amy has a book，也能從兩條資訊推出。'
    ]},
    {name:'地點：大範圍裡的小地點', accent:'blue', steps:[
      '<strong>We went to all the rooms in the house.</strong>',
      'The kitchen is a room in the house。於是我們也去了 kitchen。',
      '但如果某間店不在指定的 street，就不能套用 <strong>every shop in the street</strong>。'
    ]},
    {name:'人物：先確認他在群體內', accent:'coral', steps:[
      '<strong>John knows everyone in his class.</strong>',
      'Lucy is in John\'s class，因此 <strong>John knows Lucy.</strong>',
      '<strong>everyone in his class</strong> 不是 everyone at school；限制字眼不能省略。'
    ]},
    {name:'時間也有「全體 → 一個」', accent:'gold', steps:[
      '<strong>I work every day this week.</strong>',
      'Monday 是 this week 的一天，所以 I work on Monday。',
      '<strong>every morning last week</strong> 可以推出上週二早上，卻不能推出每個星期二早上。'
    ]},
    {name:'強句與弱句', accent:'green', steps:[
      '<strong>I like all fruit</strong> 比 <strong>I like mangoes</strong> 提供更多資訊。',
      '前一句涵蓋 apples、bananas、mangoes；後一句只談 mangoes。',
      '<span class="logic-formula">強句 <span>→</span> 弱句　　弱句 <span>↛</span> 強句</span>'
    ]},
    {name:'方向不能倒轉', accent:'coral', steps:[
      '<strong>Mary likes all animals.</strong> Dogs are animals，於是 Mary likes dogs。',
      '可是 <strong>Mary likes dogs</strong>，不能推出 Mary likes all animals。她可能不喜歡貓。',
      '試試下面的方向判斷：哪一個推理有原句支持？'
    ], special:'direction'},
    {name:'分類要真的符合', accent:'blue', steps:[
      '<strong>Lisa eats every fruit on the table.</strong>',
      '桌上的 apple 是 fruit，可以套用規則；桌上的 bread 不是 fruit，不能套用。',
      '只見到 <strong>every</strong> 還不夠；先檢查小東西是否真的在指定群體裡。'
    ]},
    {name:'群體的限制必須保留', accent:'green', steps:[
      '<strong>Tom knows every student in his class.</strong>',
      'Anna 如果在 Tom 的班，才可以推出 Tom knows Anna。',
      'Anna 如果在別的班，原句既不能證明他認識她，也不能證明他不認識她。'
    ]},
    {name:'三步解題法', accent:'gold', steps:[
      '<strong>① 找「全部」：</strong>all、every、everyone、everything，並看完整範圍。',
      '<strong>② 找「其中一個」：</strong>題目中的人、東西、地點或時間是誰？',
      '<strong>③ 確認在裡面：</strong>這個成員符合所有分類、地點、時間和附加條件嗎？'
    ]},
    {name:'正式邏輯模型', accent:'blue', steps:[
      '<strong>All A have B.</strong> 再知道 <strong>X is A.</strong>',
      '才能推出 <strong>X has B.</strong> 這叫全稱實例化（Universal Instantiation）。',
      '<strong>All students have a book</strong> ＋ <strong>Amy is a student</strong> → Amy has a book。'
    ]},
    {name:'閱讀理解真正要找的', accent:'coral', steps:[
      '第一層：答案與原文 <strong>字一樣</strong>。',
      '第二層：用字不同，但 <strong>意思一樣</strong>。',
      '第三層：原文沒有逐字說出，但 <strong>邏輯上一定包含</strong>。',
      '全體 → 個體，就是第三層最清晰的推理。準備好後，進入 40 題練習。'
    ]}
  ];

  function storageKey() { return `edmund-reading-logic-module-1:${state.userId}`; }
  function loadProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey()) || '{}');
      state.stage = Math.max(0, Math.min(stages.length - 1, Number(saved.stage) || 0));
      state.solved = new Set((saved.solved || []).filter((n) => Number.isInteger(n) && n >= 1 && n <= 40));
    } catch { state.stage = 0; state.solved = new Set(); }
  }
  function saveProgress() {
    try { localStorage.setItem(storageKey(), JSON.stringify({stage:state.stage,solved:[...state.solved]})); }
    catch { /* The lesson remains usable if browser storage is disabled. */ }
  }
  function shell(inner, wide=false) {
    dashboard.innerHTML = `<div class="logic-app ${wide?'logic-app--wide':''}">
      <div class="logic-topline"><a href="${homeUrl}">閱讀理解 · 題型邏輯</a><span>MODULE 01 / 全稱實例化</span></div>${inner}</div>`;
  }
  function renderHome() {
    shell(`<section class="logic-hero">
      <div class="logic-hero__copy"><p class="logic-kicker">READING LOGIC · 01</p><h1>全稱實例化</h1><p class="logic-hero__en">Universal Instantiation</p><p>原文說「全部」，答案問「其中一個」。沿着拼圖，一步步學懂怎樣判斷。</p>
      <div class="logic-hero__actions"><a class="logic-primary" href="${lessonUrl}">開始互動教材 <span aria-hidden="true">→</span></a><a class="logic-secondary" href="${exerciseUrl}">進入 40 題練習</a></div></div>
      <div class="logic-hero__art" aria-hidden="true"><div class="logic-piece logic-piece--hero logic-piece--gold">ALL</div><div class="logic-art-arrow">→</div><div class="logic-piece logic-piece--hero logic-piece--blue">ONE</div></div>
    </section>
    <section class="logic-home-grid"><a class="logic-home-card" href="${lessonUrl}"><span class="logic-number">01</span><span><small>CURATION · 14 個互動關卡</small><strong>全體 → 個體</strong><em>每次只看一小步，動手辨認集合、成員和推理方向。</em></span><b aria-hidden="true">↗</b></a>
    <a class="logic-home-card logic-home-card--practice" href="${exerciseUrl}"><span class="logic-number">02</span><span><small>EXERCISE · 40 題</small><strong>拼圖練習路線</strong><em>四個難度階段；錯答只翻開所選卡片的提示。</em></span><b aria-hidden="true">↗</b></a></section>
    <p class="logic-save-note">此裝置會按學生帳戶記住教材位置和已完成的練習。已完成 ${state.solved.size} / 40 題。</p>`);
  }
  function renderLesson() {
    const stage = stages[state.stage];
    const isLastBeat = state.beat >= stage.steps.length - 1;
    const isLastStage = state.stage === stages.length - 1;
    const beatCards = stage.steps.slice(0, state.beat + 1).map((step, index) => `<div class="logic-beat" style="--beat-index:${index}"><span class="logic-beat__number">${String(index+1).padStart(2,'0')}</span><p>${step}</p></div>`).join('');
    let special = '';
    if (stage.special === 'fruit' && state.beat >= 1) special = `<div class="logic-fruit-box"><p>FRUIT BOX · 點一下成員</p><div><button data-fruit="apple">apple</button><button data-fruit="banana">banana</button><button data-fruit="mango">mango</button></div><strong data-fruit-result aria-live="polite">哪個水果屬於 all the fruit？</strong></div>`;
    if (stage.special === 'direction' && isLastBeat) special = `<div class="logic-mini"><p>選一個有根據的方向</p><button data-direction="yes">all animals → dogs</button><button data-direction="no">dogs → all animals</button><strong data-direction-result aria-live="polite"></strong></div>`;
    const nextLabel = !isLastBeat ? '揭開下一步' : isLastStage ? '開始 40 題練習' : '下一個拼圖';
    shell(`<div class="logic-lesson-layout"><aside class="logic-lesson-rail"><p class="logic-kicker">CURATION · 互動教材</p><h1>全體 <span>→</span> 個體</h1><p>逐步揭開規則，再到練習頁驗證自己的判斷。</p><div class="logic-rail-progress"><span>第 ${state.stage+1} / ${stages.length} 關</span><span>${Math.round(((state.stage + (state.beat+1)/stage.steps.length) / stages.length)*100)}%</span></div><div class="logic-progress-track"><i style="width:${((state.stage + (state.beat+1)/stage.steps.length) / stages.length)*100}%"></i></div><nav aria-label="教材關卡">${stages.map((s,i)=>`<button class="logic-rail-node ${i===state.stage?'is-current':''} ${i<state.stage?'is-done':''}" data-stage="${i}" aria-current="${i===state.stage?'step':'false'}"><span>${String(i+1).padStart(2,'0')}</span>${esc(s.name)}</button>`).join('')}</nav></aside>
    <section class="logic-lesson-card logic-theme--${stage.accent}" aria-labelledby="logic-stage-title"><div class="logic-stage-header"><span class="logic-piece logic-piece--small">${String(state.stage+1).padStart(2,'0')}</span><div><p class="logic-kicker">PUZZLE ${String(state.stage+1).padStart(2,'0')} / ${String(stages.length).padStart(2,'0')}</p><h2 id="logic-stage-title">${esc(stage.name)}</h2></div></div><div class="logic-beats" aria-live="polite">${beatCards}</div>${special}<div class="logic-lesson-actions"><button class="logic-secondary" data-lesson-back ${state.stage===0&&state.beat===0?'disabled':''}>上一步</button><button class="logic-primary" data-lesson-next>${nextLabel} <span aria-hidden="true">→</span></button></div></section></div>`);
  }
  function renderExercise() {
    const q = questions[state.question];
    const solved = state.solved.has(q.number);
    const nodeGroups = phases.map((phase, group) => `<section class="logic-map-group"><h2>${String(group+1).padStart(2,'0')} · ${phase}</h2><div class="logic-map-nodes">${questions.slice(group*10, group*10+10).map((item,index)=>`<button class="logic-map-node logic-color-${(index+group)%4} ${item.number===q.number?'is-current':''} ${state.solved.has(item.number)?'is-solved':''}" data-question="${item.number-1}" aria-label="第 ${item.number} 題${state.solved.has(item.number)?'，已完成':''}" aria-current="${item.number===q.number?'true':'false'}"><span>${String(item.number).padStart(2,'0')}</span></button>`).join('')}</div></section>`).join('');
    shell(`<div class="logic-exercise-head"><div><p class="logic-kicker">EXERCISE · 40-PIECE PUZZLE</p><h1>拼圖練習路線</h1><p>選錯時，只翻開那張卡片的解說；答案仍由你找出。</p></div><a class="logic-secondary" href="${lessonUrl}">返回互動教材</a></div>
    <div class="logic-exercise-layout"><aside class="logic-map"><div class="logic-map-top"><strong>已完成 ${state.solved.size} / 40</strong><div class="logic-progress-track"><i style="width:${state.solved.size*2.5}%"></i></div></div>${nodeGroups}</aside>
    <section class="logic-question-wrap" aria-labelledby="logic-question-heading"><div class="logic-question-meta"><span class="logic-piece logic-piece--small logic-color-${Math.floor(state.question/10)}">${String(q.number).padStart(2,'0')}</span><span>${esc(phases[Math.floor(state.question/10)])}</span><span>QUESTION ${String(q.number).padStart(2,'0')} / 40</span></div><h2 id="logic-question-heading">Which statement can you prove?</h2><p class="logic-question-en">${esc(q.promptEn)}</p><p class="logic-question-zh">${esc(q.promptZh)}</p><div class="logic-option-grid">${q.options.map((option)=>`<button class="logic-option ${solved&&option.key===q.answer?'is-correct':''}" type="button" data-answer="${option.key}" aria-label="選項 ${option.key}: ${esc(option.en)}"><span class="logic-option-inner"><span class="logic-option-front"><b>${option.key}</b><span><strong>${esc(option.en)}</strong><small>${esc(option.zh)}</small></span></span><span class="logic-option-back"><b>${option.key}</b><span><strong>${solved&&option.key===q.answer?'推理成立':'再想一想'}</strong><small>${esc(option.feedback)}</small><em>${solved&&option.key===q.answer?'已完成這塊拼圖':'點此翻回選項，或試另一張卡片'}</em></span></span></span></button>`).join('')}</div><p class="logic-answer-status" role="status" aria-live="polite">${solved?'這題已完成。可以選另一塊拼圖，或再看看解說。':'找出原文必然支持的一句；錯答會顯示提示，但不會揭開正解。'}</p><div class="logic-question-actions"><button class="logic-secondary" data-question-prev ${state.question===0?'disabled':''}>上一題</button><button class="logic-primary" data-question-next>${state.question===39?'返回第一題':'下一題'} <span aria-hidden="true">→</span></button></div></section></div>`, true);
    if (solved) dashboard.querySelector(`.logic-option[data-answer="${q.answer}"]`)?.classList.add('is-flipped');
  }
  function render() { if(mode==='home')renderHome(); else if(mode==='lesson')renderLesson(); else renderExercise(); }
  function setQuestion(index) { state.question=(index+questions.length)%questions.length; renderExercise(); document.querySelector('.logic-question-wrap')?.scrollIntoView({behavior:'smooth',block:'start'}); }
  dashboard.addEventListener('click',(event)=>{
    const stageButton=event.target.closest('[data-stage]');
    if(stageButton){state.stage=Number(stageButton.dataset.stage);state.beat=0;saveProgress();renderLesson();return;}
    if(event.target.closest('[data-lesson-back]')){if(state.beat>0)state.beat--;else if(state.stage>0){state.stage--;state.beat=stages[state.stage].steps.length-1;}saveProgress();renderLesson();return;}
    if(event.target.closest('[data-lesson-next]')){if(state.beat<stages[state.stage].steps.length-1)state.beat++;else if(state.stage<stages.length-1){state.stage++;state.beat=0;}else{location.href=exerciseUrl;return;}saveProgress();renderLesson();return;}
    const fruit=event.target.closest('[data-fruit]');
    if(fruit){dashboard.querySelector('[data-fruit-result]').textContent=`I like the ${fruit.dataset.fruit}. 因為 ${fruit.dataset.fruit} 在盒子裡，也屬於 all the fruit。`;fruit.classList.add('is-picked');return;}
    const direction=event.target.closest('[data-direction]');
    if(direction){dashboard.querySelector('[data-direction-result]').textContent=direction.dataset.direction==='yes'?'對！all animals 的範圍包括 dogs。':'再想一想：只知道 dogs，不能推出 all animals。';return;}
    const node=event.target.closest('[data-question]');if(node){setQuestion(Number(node.dataset.question));return;}
    if(event.target.closest('[data-question-prev]')){setQuestion(Math.max(0,state.question-1));return;}
    if(event.target.closest('[data-question-next]')){setQuestion(state.question+1);return;}
    const option=event.target.closest('[data-answer]');if(!option||mode!=='exercise')return;
    const q=questions[state.question];const key=option.dataset.answer;
    if(key===q.answer){if(!state.solved.has(q.number)){state.solved.add(q.number);saveProgress();dashboard.querySelector('.logic-map-top strong').textContent=`已完成 ${state.solved.size} / 40`;dashboard.querySelector('.logic-map-top .logic-progress-track i').style.width=`${state.solved.size*2.5}%`;dashboard.querySelector(`.logic-map-node[data-question="${state.question}"]`)?.classList.add('is-solved');}option.classList.add('is-correct','is-flipped');dashboard.querySelector('.logic-answer-status').textContent='推理成立！這塊拼圖已完成。';}
    else{option.classList.toggle('is-flipped');dashboard.querySelector('.logic-answer-status').textContent='這張卡片背面有提示。想一想，再選一次。';}
  });
  window.addEventListener('edmund:learning-portal-session',(event)=>{
    if(event.detail?.portalId!=='reading-logic')return;
    if(!event.detail.user){state.userId='';return;}
    state.userId=String(event.detail.user.id);loadProgress();render();
  });
})();
