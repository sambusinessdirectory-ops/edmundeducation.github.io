(function () {
  'use strict';
  let mode = document.body.dataset.logicView;
  const exactMiaToMary = (value) => String(value ?? '').replace(/\bMia\b/g, 'Mary');
  const questions = (window.READING_LOGIC_MODULE_1_QUESTIONS || []).map((question) => ({
    ...question,
    promptEn: exactMiaToMary(question.promptEn),
    promptZh: exactMiaToMary(question.promptZh),
    options: question.options.map((option) => ({
      ...option, en: exactMiaToMary(option.en), zh: exactMiaToMary(option.zh), feedback: exactMiaToMary(option.feedback)
    }))
  }));
  const dashboard = document.querySelector('[data-view="dashboard"]');
  if (!dashboard || !['home', 'lesson', 'exercise'].includes(mode)) return;
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const lessonUrl = 'reading-logic-module-1.html';
  const exerciseUrl = 'reading-logic-exercise-1.html';
  const homeUrl = 'reading-logic-system.html';
  const routes = {
    [homeUrl]: { mode: 'home', title: 'Reading Logic｜閱讀理解｜題型邏輯｜EdmundEducation' },
    [lessonUrl]: { mode: 'lesson', title: '全稱實例化｜互動教材｜EdmundEducation' },
    [exerciseUrl]: { mode: 'exercise', title: '全稱實例化｜40 題練習｜EdmundEducation' }
  };
  const phases = ['基礎建立', '範圍、分類與方向', '多重條件與隱藏陷阱', '綜合與高階判斷'];
  const state = { userId: '', stage: 0, question: 0, reverse: false, solved: new Set(), streak: 0, bestStreak: 0 };
  const companionNames = { eddy: 'Eddie', phoebe: 'Phoebe', elsie: 'Elsie', noir: 'Noir', celeste: 'Celeste' };
  let companionApi;
  let lessonObserver;
  let lessonScrollFrame = 0;
  let lessonHasMovedAway = false;
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
    ], quiz:{prompt:'Every student has a book. Amy is a student. 哪一句一定成立？', options:[
      {label:'Amy has a book.', correct:true, feedback:'對！Amy 是 student，所以 every student 的規則適用於她。'},
      {label:'Amy has every book.', correct:false, feedback:'再想想：every student 有一本書，不代表 Amy 擁有所有書。'}
    ]}},
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
    ], quiz:{prompt:'「I worked every morning last week.」哪個時間一定包括在內？', options:[
      {label:'上週二早上', correct:true, feedback:'對！上週二早上屬於 last week 的 mornings。'},
      {label:'每個星期二早上', correct:false, feedback:'再想想：原句只說 last week，不能擴大到每個星期。'}
    ]}},
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
    ], quiz:{prompt:'桌上有 apple 和 bread。Lisa eats every fruit on the table. 可以推出她吃了哪一個？', options:[
      {label:'桌上的 apple', correct:true, feedback:'對！apple 既在桌上，也是 fruit，符合完整範圍。'},
      {label:'桌上的 bread', correct:false, feedback:'再想想：bread 在桌上，但不是 fruit。分類條件仍要符合。'}
    ]}},
    {name:'群體的限制必須保留', accent:'green', steps:[
      '<strong>Tom knows every student in his class.</strong>',
      'Anna 如果在 Tom 的班，才可以推出 Tom knows Anna。',
      'Anna 如果在別的班，原句既不能證明他認識她，也不能證明他不認識她。'
    ], quiz:{prompt:'Anna 在另一班。Tom knows every student in his class. 我們能判斷 Tom 是否認識 Anna 嗎？', options:[
      {label:'不能判斷', correct:true, feedback:'對！規則只涵蓋 Tom 的班，Anna 在範圍外。'},
      {label:'Tom 一定不認識 Anna', correct:false, feedback:'再想想：規則沒有涵蓋 Anna，但不代表 Tom 一定不認識她。'}
    ]}},
    {name:'三步解題法', accent:'gold', steps:[
      '<strong>① 找「全部」：</strong>all、every、everyone、everything，並看完整範圍。',
      '<strong>② 找「其中一個」：</strong>題目中的人、東西、地點或時間是誰？',
      '<strong>③ 確認在裡面：</strong>這個成員符合所有分類、地點、時間和附加條件嗎？'
    ]},
    {name:'正式邏輯模型', accent:'blue', steps:[
      '<strong>All A have B.</strong> 再知道 <strong>X is A.</strong>',
      '才能推出 <strong>X has B.</strong> 這叫全稱實例化（Universal Instantiation）。',
      '<strong>All students have a book</strong> ＋ <strong>Amy is a student</strong> → Amy has a book。'
    ], quiz:{prompt:'All A have B. X is A. 哪一個結論有根據？', options:[
      {label:'X has B.', correct:true, feedback:'對！X 是 A 的成員，所以可以套用 All A have B。'},
      {label:'All B are A.', correct:false, feedback:'再想想：這把推理方向倒轉了，原句沒有說所有 B 都是 A。'}
    ]}},
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
      state.streak = Math.max(0, Number(saved.streak) || 0);
      state.bestStreak = Math.max(state.streak, Number(saved.bestStreak) || 0);
    } catch { state.stage = 0; state.solved = new Set(); state.streak = 0; state.bestStreak = 0; }
  }
  function saveProgress() {
    try { localStorage.setItem(storageKey(), JSON.stringify({stage:state.stage,solved:[...state.solved],streak:state.streak,bestStreak:state.bestStreak})); }
    catch { /* The lesson remains usable if browser storage is disabled. */ }
  }
  function companionForStudent() { return companionApi?.selectedCompanion(state.userId) || 'eddy'; }
  function cheerText() {
    return state.streak >= 15 ? `連中 ${state.streak} 題！太厲害了！` :
      state.streak >= 5 ? `連中 ${state.streak} 題！做得好！` :
      state.streak >= 2 ? `連中 ${state.streak} 題，繼續！` : '你做得到！';
  }
  function updateStreakDisplay() {
    const streak = dashboard.querySelector('.logic-streak');
    if (!streak) return;
    const companion = companionForStudent();
    streak.dataset.companion = companion;
    streak.dataset.streakStage = String(Math.min(5, Math.floor(state.streak / 5)));
    streak.querySelector('[data-streak-current]').textContent = `連續答對 ${state.streak} 題`;
    streak.querySelector('[data-streak-best]').textContent = `最高連勝 ${state.bestStreak} 題`;
    streak.querySelector('[data-streak-cheer]').textContent = cheerText();
    streak.querySelector('.logic-streak-sprite').setAttribute('aria-label', `${companionNames[companion]} 為你的連勝打氣`);
  }
  import('../shared-companion.mjs?v=20260928-sync1').then((api) => { companionApi = api; updateStreakDisplay(); }).catch(() => { /* Eddie remains available. */ });
  function shell(inner, wide=false) {
    dashboard.innerHTML = `<div class="logic-app ${wide?'logic-app--wide':''}">
      <div class="logic-topline"><a href="${homeUrl}">閱讀理解 · 題型邏輯</a><span>MODULE 01 / 全稱實例化</span></div>${inner}</div>`;
  }
  function moduleNav(active) {
    return `<div class="logic-module-heading"><p class="logic-kicker">MODULE 01</p><h1>全稱實例化 <span lang="en">Universal Instantiation</span></h1><p>全體 → 個體</p><nav aria-label="第一單元內容"><a href="${lessonUrl}" ${active==='lesson'?'aria-current="page"':''}>互動教材</a><a href="${exerciseUrl}" ${active==='exercise'?'aria-current="page"':''}>40 題練習</a></nav></div>`;
  }
  function renderHome() {
    shell(`<section class="logic-home-intro"><p class="logic-kicker">READING LOGIC</p><h1>閱讀理解 · 題型邏輯</h1><p>一步步看懂原文，再找出一定成立的答案。</p></section>
    <a class="logic-module-card" href="${lessonUrl}"><span class="logic-number">01</span><span><small>MODULE 01</small><strong>全稱實例化 <span lang="en">Universal Instantiation</span></strong><em>全體 → 個體</em><small>互動教材 · 40 題練習</small></span><b aria-hidden="true">↗</b></a>
    <p class="logic-save-note">此裝置會按學生帳戶記住教材位置和已完成的練習。已完成 ${state.solved.size} / 40 題。</p>`);
  }
  function renderLesson() {
    const resumeStage = state.stage;
    lessonHasMovedAway = false;
    const sections = stages.map((stage, index) => {
      const ideas = stage.steps.map((step, idea) => `<article class="logic-scroll-idea logic-reveal"><span class="logic-beat__number">${String(idea+1).padStart(2,'0')}</span><p>${step}</p></article>`).join('');
      const special = stage.special === 'fruit' ? `<div class="logic-fruit-box logic-reveal"><p>FRUIT BOX · 點一下成員</p><div><button data-fruit="apple">apple</button><button data-fruit="banana">banana</button><button data-fruit="mango">mango</button></div><strong data-fruit-result aria-live="polite">哪個水果屬於 all the fruit？</strong></div>` : stage.special === 'direction' ? `<div class="logic-mini logic-reveal"><p>選一個有根據的方向</p><button data-direction="yes">all animals → dogs</button><button data-direction="no">dogs → all animals</button><strong data-direction-result aria-live="polite"></strong></div>` : '';
      const quizOrder = index % 2 ? [1, 0] : [0, 1];
      const quiz = stage.quiz ? `<div class="logic-check logic-reveal" data-check="${index}" role="group" aria-label="第 ${index+1} 節小練習"><p class="logic-check__eyebrow">試一試 · QUICK CHECK</p><h3>${esc(stage.quiz.prompt)}</h3><div class="logic-check__choices">${quizOrder.map((answer) => `<button type="button" data-logic-check="${answer}" aria-label="${esc(stage.quiz.options[answer].label)}">${esc(stage.quiz.options[answer].label)}</button>`).join('')}</div><p class="logic-check__result" data-check-result role="status" aria-live="polite">選一個有根據的答案。</p></div>` : '';
      return `<section class="logic-scroll-stage logic-theme--${stage.accent}" data-stage-section="${index}" id="logic-stage-${index+1}" aria-labelledby="logic-stage-title-${index+1}"><div class="logic-stage-header logic-reveal"><span class="logic-piece logic-piece--small">${String(index+1).padStart(2,'0')}</span><div><p class="logic-kicker">IDEA ${String(index+1).padStart(2,'0')} / ${stages.length}</p><h2 id="logic-stage-title-${index+1}">${esc(stage.name)}</h2></div></div><div class="logic-scroll-ideas">${ideas}</div>${special}${quiz}</section>`;
    }).join('');
    shell(`${moduleNav('lesson')}<div class="logic-lesson-layout"><aside class="logic-lesson-rail"><p class="logic-kicker">CURATION · 互動教材</p><h2>全體 <span>→</span> 個體</h2><div class="logic-rail-progress"><span data-lesson-position>第 ${state.stage+1} / ${stages.length} 節</span><span data-lesson-percent>${Math.round((state.stage+1)/stages.length*100)}%</span></div><div class="logic-progress-track"><i data-lesson-progress style="width:${(state.stage+1)/stages.length*100}%"></i></div><nav aria-label="教材章節">${stages.map((s,i)=>`<button class="logic-rail-node ${i===state.stage?'is-current':''}" data-stage="${i}" aria-current="${i===state.stage?'step':'false'}"><span>${String(i+1).padStart(2,'0')}</span>${esc(s.name)}</button>`).join('')}</nav></aside><div class="logic-lesson-stream">${sections}<div class="logic-lesson-finish"><h2>準備好練習了嗎？</h2><a class="logic-primary" href="${exerciseUrl}">開始 40 題練習 <span aria-hidden="true">→</span></a></div></div></div>`, true);
    observeLessonIdeas();
    requestAnimationFrame(() => {
      if (mode !== 'lesson') return;
      if (resumeStage > 0) dashboard.querySelector(`[data-stage-section="${resumeStage}"]`)?.scrollIntoView({behavior:'auto',block:'start'});
      updateLessonProgress();
    });
  }
  function observeLessonIdeas() {
    lessonObserver?.disconnect();
    const items = dashboard.querySelectorAll('.logic-reveal');
    if (!('IntersectionObserver' in window)) { items.forEach((item) => item.classList.add('is-visible')); return; }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, {threshold:0.12, rootMargin:'0px 0px -8% 0px'});
    lessonObserver = observer;
    items.forEach((item) => observer.observe(item));
  }
  function resetLessonRevealAtTop() {
    if (!lessonHasMovedAway || window.scrollY > 24) return;
    lessonHasMovedAway = false;
    dashboard.querySelectorAll('.logic-reveal.is-visible').forEach((item) => item.classList.remove('is-visible'));
    observeLessonIdeas();
  }
  function updateLessonProgress() {
    if (mode !== 'lesson' || !state.userId) return;
    const sections = [...dashboard.querySelectorAll('[data-stage-section]')];
    if (!sections.length) return;
    const pivot = Math.min(innerHeight * 0.4, 260);
    let active = 0;
    sections.forEach((section, index) => { if (section.getBoundingClientRect().top <= pivot) active = index; });
    if (active !== state.stage) { state.stage = active; saveProgress(); }
    dashboard.querySelector('[data-lesson-position]').textContent = `第 ${active+1} / ${stages.length} 節`;
    dashboard.querySelector('[data-lesson-percent]').textContent = `${Math.round((active+1)/stages.length*100)}%`;
    dashboard.querySelector('[data-lesson-progress]').style.width = `${(active+1)/stages.length*100}%`;
    dashboard.querySelectorAll('.logic-rail-node').forEach((node, index) => {
      node.classList.toggle('is-current', index === active);
      node.setAttribute('aria-current', index === active ? 'step' : 'false');
    });
  }
  function fitOptionCards() {
    const cards=[...dashboard.querySelectorAll('.logic-option')];
    const columns=matchMedia('(max-width:680px)').matches ? 1 : 2;
    cards.forEach((card)=>{card.style.height='';card.querySelector('.logic-option-inner').style.height='';});
    for(let start=0;start<cards.length;start+=columns){
      const row=cards.slice(start,start+columns);
      const height=Math.max(170,...row.flatMap((card)=>[card.querySelector('.logic-option-front').scrollHeight,card.querySelector('.logic-option-back').scrollHeight]))+2;
      row.forEach((card)=>{card.style.height=`${height}px`;card.querySelector('.logic-option-inner').style.height=`${height}px`;});
    }
  }
  function statementOnly(text) {
    return text.replace(/\s+(?:Which statement|What can we conclude)[^?]*\?$/i, '').trim();
  }
  function translationOnly(text) {
    return text.replace(/。[^。]*？\s*）$/, '。）');
  }
  function sentenceLines(text) {
    const segments = typeof Intl.Segmenter === 'function'
      ? [...new Intl.Segmenter('en', {granularity:'sentence'}).segment(text)].map((part) => part.segment.trim()).filter(Boolean)
      : text.split(/(?<=[.!?])\s+(?=[A-Z])/u);
    const parts = [];
    segments.forEach((segment) => {
      if (parts.length && /\b(?:Mr|Mrs|Ms|Dr|Prof|Rev|Mdm|Capt|Sgt|Gen|St)\.$/i.test(parts[parts.length-1]))
        parts[parts.length-1] += ` ${segment}`;
      else parts.push(segment);
    });
    return parts.map((part) => `<span class="logic-sentence-line">${esc(part)}</span>`).join('');
  }
  function feedbackLines(text) {
    return String(text).split(/(?<=[。；！？])\s*/u).map((part) => part.trim()).filter(Boolean)
      .map((part) => `<span class="logic-feedback-line">${esc(part)}</span>`).join('');
  }
  function streakMarkup() {
    const companion = companionForStudent();
    return `<section class="logic-streak" data-companion="${companion}" data-streak-stage="${Math.min(5,Math.floor(state.streak/5))}" aria-live="polite"><div class="logic-streak-copy"><img src="/assets/schedule/day-streak-fire.gif" alt="" aria-hidden="true"><div><strong data-streak-current>連續答對 ${state.streak} 題</strong><small data-streak-best>最高連勝 ${state.bestStreak} 題</small></div></div><div class="logic-streak-companion"><span class="logic-streak-sprite" role="img" aria-label="${companionNames[companion]} 為你的連勝打氣"></span><span class="logic-streak-cheer" data-streak-cheer>${cheerText()}</span></div></section>`;
  }
  function renderExercise() {
    const q = questions[state.question];
    const solved = state.solved.has(q.number);
    const groupOrder = state.reverse ? [3, 2, 1, 0] : [0, 1, 2, 3];
    const nodeGroups = groupOrder.map((group) => {
      const items = questions.slice(group*10, group*10+10);
      if (state.reverse) items.reverse();
      return `<section class="logic-map-group"><h2>${String(group+1).padStart(2,'0')} · ${phases[group]}</h2><div class="logic-map-nodes">${items.map((item,index)=>`<button class="logic-map-node logic-color-${(index+group)%4} ${item.number===q.number?'is-current':''} ${state.solved.has(item.number)?'is-solved':''}" data-question="${item.number-1}" aria-label="第 ${item.number} 題${state.solved.has(item.number)?'，已完成':''}" aria-current="${item.number===q.number?'true':'false'}"><span>${String(item.number).padStart(2,'0')}</span></button>`).join('')}</div></section>`;
    }).join('');
    const optionCards = q.options.map((option) => {
      const correct = option.key === q.answer;
      const verdict = correct ? '推理成立' : solved ? '不成立' : '再想一想';
      const footer = solved ? '' : '<em>點此翻回選項，或試另一張卡片</em>';
      return `<button class="logic-option ${solved&&correct?'is-correct':''} ${solved?'is-flipped':''}" type="button" data-answer="${option.key}" aria-label="選項 ${option.key}: ${esc(option.en)}"><span class="logic-option-inner"><span class="logic-option-front"><b>${option.key}</b><span><strong>${esc(option.en)}</strong><small>${esc(option.zh)}</small></span></span><span class="logic-option-back"><b>${option.key}</b><span><strong><span class="logic-verdict">${verdict} ·</span><span class="logic-option-sentence">${esc(option.en)}</span></strong><small>${feedbackLines(option.feedback)}</small>${footer}</span></span></span></button>`;
    }).join('');
    shell(`${moduleNav('exercise')}<div class="logic-exercise-head"><h1>練習時間！</h1><a class="logic-secondary" href="${lessonUrl}">返回互動教材</a></div>${streakMarkup()}
    <div class="logic-exercise-layout"><aside class="logic-map"><div class="logic-map-top"><strong>已完成 ${state.solved.size} / 40</strong><div class="logic-progress-track"><i style="width:${state.solved.size*2.5}%"></i></div><div class="logic-order-switch" role="group" aria-label="題目順序"><button type="button" data-order="forward" aria-pressed="${!state.reverse}">1 → 40</button><button type="button" data-order="reverse" aria-pressed="${state.reverse}">40 → 1</button></div></div>${nodeGroups}</aside>
    <section class="logic-question-wrap" aria-labelledby="logic-question-heading"><div class="logic-question-meta"><span class="logic-piece logic-piece--small logic-color-${Math.floor(state.question/10)}">${String(q.number).padStart(2,'0')}</span><span>${esc(phases[Math.floor(state.question/10)])}</span><span>QUESTION ${String(q.number).padStart(2,'0')} / 40</span></div><div class="logic-question-heading-row"><h2 id="logic-question-heading">Which statement must be true?</h2><span lang="zh-Hant">以下哪一句一定是真的？</span></div><div class="logic-question-statement"><p class="logic-question-en">${sentenceLines(statementOnly(q.promptEn))}</p><p class="logic-question-zh">${esc(translationOnly(q.promptZh))}</p></div><div class="logic-option-grid">${optionCards}</div><p class="logic-answer-status" role="status" aria-live="polite"></p><div class="logic-question-actions"><button class="logic-secondary" data-question-prev ${(state.reverse?state.question===39:state.question===0)?'disabled':''}>上一題</button><button class="logic-primary" data-question-next>${(state.reverse?state.question===0:state.question===39)?`返回第 ${state.reverse?'40':'1'} 題`:'下一題'} <span aria-hidden="true">→</span></button></div></section></div>`, true);
    fitOptionCards();
  }
  function render() { if(mode!=='lesson')lessonObserver?.disconnect(); if(mode==='home')renderHome(); else if(mode==='lesson')renderLesson(); else renderExercise(); }
  function routeTo(file, replace = false) {
    const route = routes[file];
    if (!route) return false;
    if (replace) history.replaceState({ readingLogic: route.mode }, '', file);
    else if (location.pathname.split('/').pop() !== file) history.pushState({ readingLogic: route.mode }, '', file);
    mode = route.mode;
    document.body.dataset.logicView = mode;
    document.title = route.title;
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', `https://edmundeducation.com/${file}`);
    render();
    window.scrollTo({ top: 0, behavior: 'auto' });
    return true;
  }
  function setQuestion(index) { state.question=(index+questions.length)%questions.length; renderExercise(); document.querySelector('.logic-question-wrap')?.scrollIntoView({behavior:'smooth',block:'start'}); }
  document.addEventListener('click',(event)=>{
    if (!state.userId) return;
    const internalLink=event.target.closest('a[href]');
    if (internalLink && !event.defaultPrevented && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && !internalLink.target) {
      const destination=new URL(internalLink.href,location.href);
      if (destination.origin===location.origin && routes[destination.pathname.split('/').pop()]) {
        event.preventDefault();routeTo(destination.pathname.split('/').pop());return;
      }
    }
  });
  dashboard.addEventListener('click',(event)=>{
    const stageButton=event.target.closest('[data-stage]');
    if(stageButton){state.stage=Number(stageButton.dataset.stage);saveProgress();dashboard.querySelector(`[data-stage-section="${state.stage}"]`)?.scrollIntoView({behavior:'smooth',block:'start'});return;}
    const fruit=event.target.closest('[data-fruit]');
    if(fruit){dashboard.querySelector('[data-fruit-result]').textContent=`I like the ${fruit.dataset.fruit}. 因為 ${fruit.dataset.fruit} 在盒子裡，也屬於 all the fruit。`;fruit.classList.add('is-picked');return;}
    const direction=event.target.closest('[data-direction]');
    if(direction){dashboard.querySelector('[data-direction-result]').textContent=direction.dataset.direction==='yes'?'對！all animals 的範圍包括 dogs。':'再想一想：只知道 dogs，不能推出 all animals。';return;}
    const checkChoice=event.target.closest('[data-logic-check]');
    if(checkChoice){
      const check=checkChoice.closest('[data-check]');
      if(check?.dataset.complete==='true')return;
      const answer=stages[Number(check.dataset.check)]?.quiz?.options[Number(checkChoice.dataset.logicCheck)];
      if(!answer)return;
      check.querySelectorAll('[data-logic-check]').forEach((choice)=>choice.classList.remove('is-wrong','is-correct'));
      checkChoice.classList.add(answer.correct?'is-correct':'is-wrong');
      check.querySelector('[data-check-result]').textContent=answer.feedback;
      if(answer.correct){check.dataset.complete='true';check.querySelectorAll('[data-logic-check]').forEach((choice)=>{choice.disabled=true;});}
      document.dispatchEvent(new CustomEvent('edmund:answer-result',{detail:{correct:answer.correct}}));
      return;
    }
    const orderButton=event.target.closest('[data-order]');
    if(orderButton){const reverse=orderButton.dataset.order==='reverse';if(state.reverse!==reverse){state.reverse=reverse;state.question=reverse?39:0;renderExercise();}return;}
    const node=event.target.closest('[data-question]');if(node){setQuestion(Number(node.dataset.question));return;}
    if(event.target.closest('[data-question-prev]')){setQuestion(state.question+(state.reverse?1:-1));return;}
    if(event.target.closest('[data-question-next]')){setQuestion(state.question+(state.reverse?-1:1));return;}
    const option=event.target.closest('[data-answer]');if(!option||mode!=='exercise')return;
    const q=questions[state.question];const key=option.dataset.answer;
    if (state.solved.has(q.number)) return;
    if (key===q.answer) {
      state.solved.add(q.number);
      state.streak++;
      state.bestStreak=Math.max(state.bestStreak,state.streak);
      saveProgress();
      updateStreakDisplay();
      dashboard.querySelector('.logic-map-top strong').textContent=`已完成 ${state.solved.size} / 40`;
      dashboard.querySelector('.logic-map-top .logic-progress-track i').style.width=`${state.solved.size*2.5}%`;
      dashboard.querySelector(`.logic-map-node[data-question="${state.question}"]`)?.classList.add('is-solved');
      dashboard.querySelectorAll('.logic-option').forEach((card) => {
        const isCorrect=card.dataset.answer===q.answer;
        card.classList.add('is-flipped');
        if (isCorrect) card.classList.add('is-correct');
        else card.querySelector('.logic-verdict').textContent='不成立 ·';
        card.querySelector('.logic-option-back em')?.remove();
      });
      dashboard.querySelector('.logic-answer-status').textContent='';
      document.dispatchEvent(new CustomEvent('edmund:answer-result',{detail:{correct:true}}));
    } else {
      const showing=option.classList.toggle('is-flipped');
      dashboard.querySelector('.logic-answer-status').textContent='這張卡片背面有提示。想一想，再選一次。';
      if(showing){state.streak=0;saveProgress();updateStreakDisplay();document.dispatchEvent(new CustomEvent('edmund:answer-result',{detail:{correct:false}}));}
    }
  });
  window.addEventListener('scroll',()=>{
    if(mode!=='lesson'||lessonScrollFrame)return;
    lessonScrollFrame=requestAnimationFrame(()=>{
      lessonScrollFrame=0;
      if(window.scrollY>350)lessonHasMovedAway=true;
      resetLessonRevealAtTop();
      updateLessonProgress();
    });
  },{passive:true});
  window.addEventListener('storage',(event)=>{
    if(!state.userId||!event.key)return;
    if(event.key===storageKey()){
      loadProgress();render();return;
    }
    if(event.key===companionApi?.companionKey(state.userId)||event.key.startsWith('edmund-lesson-map-v1:')||event.key.startsWith('edmund-expression-meadow-v2:')||event.key.startsWith('writing-chess-map-v1:')) updateStreakDisplay();
  });
  window.addEventListener('resize',()=>{if(mode==='exercise'&&state.userId)fitOptionCards();});
  window.addEventListener('popstate',()=>{
    const file=location.pathname.split('/').pop();
    if(routes[file] && state.userId) routeTo(file, true);
  });
  window.addEventListener('edmund:learning-portal-session',(event)=>{
    if(event.detail?.portalId!=='reading-logic')return;
    if(!event.detail.user){state.userId='';return;}
    state.userId=String(event.detail.user.id);loadProgress();render();
  });
})();
