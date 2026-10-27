(() => {
  'use strict';
  const essay = window.ESSAY_80_MEMORY_DATA;
  if (!essay?.sentences?.length) return;

  const $ = selector => document.querySelector(selector);
  const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  const sentences = essay.sentences;
  const support = window.ESSAY_80_LEARNING_SUPPORT;
  if (!support || support.sentences.length !== sentences.length) return;
  const byParagraph = paragraph => sentences.map((sentence, index) => ({ ...sentence, globalIndex: index })).filter(sentence => sentence.paragraph === paragraph);
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
      icon: '↝', title: '接通論證', en: 'LOGIC LINKS', description: '把每段的理由、細節、例子和收束按原有邏輯接起來。', rounds: [
        { type: 'sequence', prompt: '第一主體段：數碼資源如何帶來更廣泛的取用？', detail: '逐一點選下一步。', items: [
          { title: '主張', body: '數碼資源服務的人比紙本書更多。' },
          { title: '實體限制', body: '一本實體書通常一次只能借給一人。' },
          { title: '數碼對比', body: '電子書、期刊和資料庫可多人同時在家取用。' },
          { title: '受惠者', body: '學生、輪班工作者及長者不一定能經常到館。' },
          { title: '具體例子', body: '學生可在幾分鐘內搜尋期刊，免去多次到訪。' },
          { title: '段落收束', body: '科技讓圖書館突破自身牆壁。' },
        ], why: '先立主張，再比較限制，指出受惠者，以例子具體化，最後收束。' },
        { type: 'sequence', prompt: '第二主體段：圖書館如何成為數碼學習中心？', detail: '逐一點選下一步。', items: [
          { title: '主張', body: '現代圖書館應培養實用數碼技能。' },
          { title: '現代需要', body: '教育、就業及公共服務仰賴網上資訊能力。' },
          { title: '圖書館做法', body: '投資電腦、媒體室、網上目錄及受訓職員。' },
          { title: '具體使用者', body: '兒童、求職者與成年人各有實際用途。' },
          { title: '排除替代', body: '單靠更多紙本書無法滿足這些需要。' },
          { title: '形象化收束', body: '只加紙本書，就像需要電燈時仍在增加蠟燭。' },
        ], why: '先說需要，提出圖書館的實際做法，再舉受惠者，最後用蠟燭比喻強化主張。' },
      ],
    },
    {
      icon: '▤', title: '還原句序', en: 'SENTENCE MAP', description: '逐句用短小的意思卡串起每一段。', rounds: sentences.map((sentence, sentenceIndex) => ({
        type: 'sequence', sentenceIndex, prompt: `${['開場：背景如何帶出立場？','第一主體段','第二主體段','總結'][sentence.paragraph]} · 第 ${sentenceIndex+1} 句`,
        detail: '逐一點選短小的意思卡，接成這一句。', items: support.sentences[sentenceIndex].chunks.map(title=>({title})), why: '已接回完整原句。'
      })),
    },
    {
      icon: 'Aa', title: '簡單字詞', en: 'SIMPLE WORDS', description: '每句先看字詞在這個語境中的簡單說法，再用自己的話說一次。',
      rounds: sentences.flatMap((sentence, sentenceIndex) => [false,true].map(reverse=>({ type: 'vocabulary', sentenceIndex, reverse, prompt: `第 ${sentenceIndex + 1} 句 · ${reverse?'從簡單說法拼回原文':'用簡單字詞重建整句'}` }))),
    },
    {
      icon: '▤', title: '拆解與運用句型', en: 'SENTENCE STRUCTURES', description: '看懂每一部分的意思和作用，再用另一個生活情境練習。每題四選一。',
      rounds: support.structures.map(frame => ({ ...frame, type: 'structure', prompt: frame.context, why: frame.explanations[0] })),
    },
    {
      icon: '↗', title: '簡單英文重述', en: 'RETELL THE ARGUMENT', description: '從一個意思開始，用簡單英文說清楚，再連成一段及整篇論證。毋須逐字背簡化版本。',
      rounds: [
        ...sentences.map((sentence, sentenceIndex) => ({ type: 'retell', sentenceIndices: [sentenceIndex], prompt: `第 ${sentenceIndex + 1} 句 · 用簡單英文說出意思`, cue: sentence.chinese })),
        ...[0, 1, 2, 3].map(paragraph => ({ type: 'retell', sentenceIndices: byParagraph(paragraph).map(s => s.globalIndex), prompt: `${['開場','第一主體段','第二主體段','總結'][paragraph]} · 連起論點`, cue: byParagraph(paragraph).map(s => s.chinese).join('\n') })),
        { type: 'retell', sentenceIndices: sentences.map((_, i) => i), prompt: '用簡單英文重述整篇論證', cue: '立場：科技優先。\n理由一：讓更多人取得資料；比較實體限制與在家取用，說出受惠者及例子。\n理由二：培養實用技能；說出生活需要、圖書館做法及使用者例子。\n總結：單靠更多紙本書不足；重申更廣服務、更有效率及切合今天需要。' },
      ],
    },
    {
      icon: '✦', title: '原文重組', en: 'EXACT WORDING', description: '按意思小節逐句拼回原文。',
      rounds: sentences.map((sentence, sentenceIndex) => ({ type: 'precision', sentenceIndex, prompt: `第 ${sentenceIndex + 1} / ${sentences.length} 句 · ${sentence.role}`, detail: '點選意思小節，接回完整原句。', why: '已還原此句。' })),
    },
    {
      icon: '♫', title: '有提示朗讀', en: 'SUPPORTED READING', description: '每次只讀一小節，再連成一句，最後把相鄰兩句接起來。英文提示一直可見。', rounds: speakingRounds(true),
    },
    {
      icon: '◉', title: '中階填空朗讀', en: 'RECORDED RECALL', description: '使用填充練習的中階遮字；補回空格並錄下完整一句，儲存後核對。', rounds: sentences.map((sentence,i)=>({type:'speaking',guided:false,sentenceIndices:[i],text:sentence.english,prompt:`第 ${i+1} 句 · 中階填空與整句錄音`})),
    },
    {icon:'↗',title:'跨主題論證應用',en:'TRANSFER THE LOGIC',description:'把兩段的主張、限制、做法、例子及收束運用到其他主題。',rounds:support.transfer.map(item=>({...item,type:'quiz'}))},
  ];

  function speakingRounds(guided) {
    const rounds = [];
    sentences.forEach((sentence, index) => {
      support.sentences[index].chunks.forEach((text, chunkIndex) => rounds.push({type:'speaking', guided, sentenceIndices:[index], text, chunkIndex, prompt:`${guided?'有':'無'}提示朗讀 · 第 ${index+1} 句 · 小節 ${chunkIndex+1}/${support.sentences[index].chunks.length}`}));
      rounds.push({type:'speaking', guided, sentenceIndices:[index], text:sentence.english, prompt:`${guided?'有':'無'}提示朗讀 · 第 ${index+1} 句 · 連成一句`});
      if (sentence.index % 2 === 1) rounds.push({type:'speaking', guided, sentenceIndices:[index-1,index], text:sentences[index-1].english+'\n'+sentence.english, prompt:`${guided?'有':'無'}提示朗讀 · 第 ${index}–${index+1} 句 · 連起兩句`});
    });
    return rounds;
  }

  const totalRounds = stageDefinitions.reduce((count, stage) => count + stage.rounds.length, 0);
  const storageKey = 'edmund-essay80-memory-active-v3';
  const saved = (() => {
    try {
      const current = JSON.parse(localStorage.getItem(storageKey) || 'null');
      if (current) return current;
      const old = JSON.parse(localStorage.getItem('edmund-essay80-memory-scaffold-v2') || '{}');
      const solved = Object.fromEntries(Object.entries(old.solved||{}).filter(([key])=>[0,1,2,3,8].includes(Number(key.split(':')[0]))));
      // Earlier self-certification does not count as checked reconstruction or saved recording.
      return {stage:0,round:0,solved};
    } catch { return {}; }
  })();
  const state = {
    stage: Number.isInteger(saved.stage) && saved.stage >= 0 && saved.stage < stageDefinitions.length ? saved.stage : 0,
    round: Number.isInteger(saved.round) ? saved.round : 0,
    unlocked: Number.isInteger(saved.unlocked) ? Math.max(0, Math.min(saved.unlocked, stageDefinitions.length)) : 0,
    solved: saved.solved && typeof saved.solved === 'object' ? saved.solved : {},
    selection: [], hadMistake: false, revealTranslation: false, transitioning: false, checks: [], completed: !!saved.completed,
  };
  state.round = Math.min(Math.max(state.round, 0), stageDefinitions[state.stage].rounds.length - 1);


  const audio = new Audio(essay.audio);
  audio.preload = 'metadata';
  let segmentEnd = null;
  let audioButton = null;
  const save = () => { try { localStorage.setItem(storageKey, JSON.stringify({ stage: state.stage, round: state.round, unlocked: state.unlocked, solved: state.solved, completed: state.completed })); } catch { /* The game remains usable without storage. */ } };
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
    $('#step-select').innerHTML=stage.rounds.map((item,i)=>`<option value="${i}" ${i===state.round?'selected':''}>${i+1}. ${escapeHtml(item.prompt)}${state.solved[`${state.stage}:${i}`]?' ✓':''}</option>`).join('');
  }
  function renderQuiz(item) {
    const indices = orderedSeed(item.options.length, state.stage * 43 + state.round * 17);
    return `<div class="question-intro"><span class="question-mark">?</span><div><p class="question-label">SELECT THE BEST ANSWER</p><h3>${escapeHtml(item.prompt)}</h3>${item.detail ? `<p>${escapeHtml(item.detail)}</p>` : ''}</div></div><div class="choice-grid">${indices.map(index => `<button class="choice-card" type="button" data-choice="${index}"><span class="choice-symbol" aria-hidden="true">${String.fromCharCode(65 + indices.indexOf(index))}</span><span>${escapeHtml(item.options[index])}</span><span class="choice-arrow" aria-hidden="true">↗</span></button>`).join('')}</div>`;
  }
  function renderMulti(item) {
    const indices = orderedSeed(item.options.length, 29);
    return `<div class="question-intro"><span class="question-mark">2</span><div><p class="question-label">CHOOSE TWO</p><h3>${escapeHtml(item.prompt)}</h3><p>${escapeHtml(item.detail)}</p></div></div><div class="choice-grid">${indices.map(index => `<button class="choice-card ${state.selection.includes(index) ? 'selected' : ''}" type="button" data-multi="${index}" aria-pressed="${state.selection.includes(index)}"><span class="choice-symbol" aria-hidden="true">${state.selection.includes(index) ? '✓' : '+'}</span><span>${escapeHtml(item.options[index])}</span></button>`).join('')}</div><div class="action-bar"><span>已選 ${state.selection.length} / 2 項</span><button class="primary-button" type="button" data-confirm ${state.selection.length !== 2 ? 'disabled' : ''}>確認兩條理由 <span aria-hidden="true">→</span></button></div>`;
  }
  function renderSequence(item, precision = false) {
    const items = precision ? phraseTiles(sentences[item.sentenceIndex].english).map(title => ({ title })) : item.items;
    const indices = orderedSeed(items.length, state.stage * 101 + state.round * 19);
    const sentence = item.sentenceIndex == null ? null : sentences[item.sentenceIndex];
    const paragraph = Number.isInteger(item.paragraph) ? byParagraph(item.paragraph) : null;
    const extra = sentence ? `<div class="memory-tools"><span class="role-badge">${escapeHtml(sentence.role)}</span><button class="mini-button" type="button" data-play-sentence="${item.sentenceIndex}">♫ 聽這一句</button><button class="mini-button" type="button" data-translation>繁體中文提示</button></div>${state.revealTranslation ? `<p class="translation-line">${escapeHtml(sentence.chinese)}</p>` : ''}` : paragraph ? `<div class="memory-tools"><span class="role-badge">${['開場', '第一主體段', '第二主體段', '總結'][item.paragraph]}</span><button class="mini-button" type="button" data-translation>${state.revealTranslation ? '隱藏' : '顯示'}繁體中文</button></div>${state.revealTranslation ? `<div class="translation-list">${paragraph.map((line, index) => `<p><b>${index + 1}.</b> ${escapeHtml(line.chinese)}</p>`).join('')}</div>` : ''}` : '';
    return `<div class="question-intro"><span class="question-mark">${precision ? '✦' : '↝'}</span><div><p class="question-label">${precision ? 'REBUILD THE EXACT SENTENCE' : 'TAP IN THE CORRECT ORDER'}</p><h3>${escapeHtml(item.prompt)}</h3><p>${escapeHtml(item.detail || '逐一點選正確次序。')}</p></div></div>${extra}<div class="sequence-track" aria-label="已選次序">${items.map((_, index) => `<div class="sequence-slot ${state.selection[index] == null ? '' : 'filled'}"><small>${String(index + 1).padStart(2, '0')}</small><span>${state.selection[index] == null ? '下一步' : escapeHtml(items[state.selection[index]].body || items[state.selection[index]].title)}</span></div>`).join('')}</div><div class="option-heading"><span>${precision ? '片語卡' : '待排序卡'}</span><span>${state.selection.length} / ${items.length}</span></div><div class="sequence-options ${precision ? 'phrase-options' : ''}">${indices.map(index => `<button class="sequence-card ${state.selection.includes(index) ? 'used' : ''}" type="button" data-sequence="${index}" ${state.selection.includes(index) ? 'disabled' : ''}><span class="option-glyph" aria-hidden="true">${precision ? '✧' : '◆'}</span><span><strong>${escapeHtml(items[index].body || items[index].title)}</strong>${items[index].body ? `<small>${escapeHtml(items[index].title)}</small>` : ''}</span></button>`).join('')}</div><div class="action-bar"><span>按原有邏輯依次點選</span><button class="text-button" type="button" data-undo ${state.selection.length ? '' : 'disabled'}>撤銷上一步 ↶</button></div>`;
  }
  function lineHtml(text) { return String(text).split('\n').map(line => `<p>${escapeHtml(line)}</p>`).join(''); }
  function wordTable(content) {
    return `<div class="table-scroll"><table class="support-table"><thead><tr><th>原文字詞</th><th>簡單說法</th><th>意思</th></tr></thead><tbody>${content.synonyms.map(p=>`<tr><td>${escapeHtml(p.original)}</td><td>${escapeHtml(p.simple)}</td><td>${escapeHtml(p.meaning)}</td></tr>`).join('')}</tbody></table></div>`;
  }
  function buildParts(item) {
    const ids=item.sentenceIndices || [item.sentenceIndex];
    return ids.flatMap(i=>(item.reverse?support.sentences[i].chunks:support.sentences[i].simpleChunks).map(text=>({text,sentenceIndex:i})));
  }
  function renderVocabulary(item) { return renderBuild(item); }
  function renderBuild(item) {
    if(item.reverse && !state.solved[`5:${state.round-1}`]) return `<h3>${escapeHtml(item.prompt)}</h3><p>先完成這一句的簡單英文重組，再拼回原文。</p><button class="primary-button" data-build-prerequisite>前往簡單英文重組 →</button>`;
    const parts=buildParts(item), position=state.selection.length, current=parts[Math.min(position,parts.length-1)].sentenceIndex;
    const content=support.sentences[current];
    const bank=parts.filter(p=>p.sentenceIndex===current).map(p=>p.text);
    const pool=[...new Set(parts.map(p=>p.text).filter(t=>t!==parts[position]?.text))];
    const distractors=orderedSeed(pool.length,`distractors-${position}`).slice(0,3).map(i=>pool[i]);
    const choices=[parts[position]?.text,...distractors].filter(Boolean);
    const indices=orderedSeed(choices.length,`build-${position}`);
    return `<h3>${escapeHtml(item.prompt)}</h3><p>第 ${current+1} 句 · 選出下一小節，完成整句。${item.reverse?'現在把簡單說法換回原文。':'保留原意，用較容易的字詞表達。'}</p><p class="support-source">${escapeHtml(item.reverse?content.simple:item.type==='vocabulary'?sentences[current].english:sentences[current].chinese)}</p>${item.type==='vocabulary'?wordTable(content):''}<div class="table-scroll"><table class="support-table word-bank"><caption>本句所需全部字詞／小節（次序已打亂）</caption><tbody>${orderedSeed(bank.length,`bank-${current}`).map(i=>`<tr><td>${escapeHtml(bank[i])}</td></tr>`).join('')}</tbody></table></div><div class="sequence-track build-track">${state.selection.map(i=>`<div class="sequence-slot filled"><span>${escapeHtml(parts[i].text)}</span></div>`).join('')}<div class="sequence-slot">下一小節</div></div><div class="choice-grid">${indices.map(i=>`<button class="choice-card" data-build="${i}">${escapeHtml(choices[i])}</button>`).join('')}</div><p>${position} / ${parts.length} 小節已完成</p>`;
  }
  function renderStructure(item) {
    const source = sentences.find(s=>s.paragraph===item.source.paragraph-1 && s.index===item.source.sentence-1);
    return `<p class="question-label">第 ${item.source.paragraph} 段 · 第 ${item.source.sentence} 句</p><p class="support-source">${escapeHtml(source.english)}</p><h3 class="structure-frame">${escapeHtml(item.frame)}</h3><div class="structure-parts">${item.parts.map(p=>`<span class="structure-part ${p.kind}">${escapeHtml(p.text)}<small>${p.kind==='slot'?'換入符合這個意思的內容':'連接／句型固定部分'}</small></span>`).join('')}</div><div class="support-notes"><p><strong>意思：</strong>${escapeHtml(item.meaning)}</p><p><strong>功能與使用時機：</strong>${escapeHtml(item.usage)}</p>${item.contextNote?`<p>${escapeHtml(item.contextNote)}</p>`:''}</div>${renderQuiz(item)}<p class="support-notes">四句來自不同情境；選出句型所表達的關係與內容一致的一句。</p>`;
  }
  const savedRecordings=new Set();
  const recordingId=()=>`essay80-${roundKey().replace(':','-')}`;
  const recordingReceipt=()=>`${window.EdmundSystemNav?.getStudentSession?.()?.token || 'guest'}:${recordingId()}`;
  function mediumMask(text) {
    const phrases=[...essay.mediumAnswers].sort((a,b)=>b.length-a.length);
    const escapeRegex=x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    return text.replace(new RegExp('\\b('+phrases.map(escapeRegex).join('|')+')\\b','gi'),match=>'＿'.repeat(Math.min(12,Math.max(3,match.length))));
  }
  function renderSpeaking(item) {
    const recorded=savedRecordings.has(recordingReceipt());
    return `<h3>${escapeHtml(item.prompt)}</h3><p>${item.guided?'聽這一小步，再錄下自己的朗讀。':'補回空格，錄下完整一句並儲存到帳戶。儲存不代表系統已判定發音或內容正確。'}</p><div class="speaking-text">${lineHtml(item.guided?item.text:mediumMask(item.text))}</div>${item.guided?'<button class="mini-button" data-play-chunk>♫ 聽這一小步</button>':''}<section class="question-card recording-practice" data-edmund-record-id="${recordingId()}" data-edmund-record-title="Essay 80 · ${escapeHtml(item.prompt)}" data-edmund-min-recording-ms="${item.guided?0:Math.max(2000,item.text.split(/\s+/).length*120)}"><button class="primary-button" data-edmund-record-toggle>● 錄音練習</button><a class="mini-button" href="speaking-system.html?library=1" target="_blank" rel="noopener">我的錄音 · 儲存及重聽 ↗</a></section>${recorded?`<p class="recording-status">已儲存本步錄音，可到「我的錄音」重聽。</p>${!item.guided?`<details><summary>對照完整原句</summary>${lineHtml(item.text)}</details>`:''}`:''}<button class="primary-button support-next" data-speaking-done ${!recorded?'disabled':''}>錄音已儲存 · 下一小步 →</button>`;
  }
  document.addEventListener('edmund:recording-saved',event=>{
    if(event.detail?.recordId!==recordingId() || round().type!=='speaking')return;
    savedRecordings.add(recordingReceipt());$('#game-card').innerHTML=renderSpeaking(round());
  });
  function render() {
    orderCache.clear();
    renderRail(); renderHeader(); feedback('');
    const item = round();
    const card = $('#game-card');
    card.classList.remove('card-enter','is-correct'); void card.offsetWidth; card.classList.add('card-enter');
    card.innerHTML = item.type === 'quiz' ? renderQuiz(item) : item.type === 'structure' ? renderStructure(item) : item.type === 'vocabulary' ? renderVocabulary(item) : item.type==='retell' ? renderBuild(item) : item.type==='speaking' ? renderSpeaking(item) : item.type === 'multi' ? renderMulti(item) : renderSequence(item, item.type === 'precision');
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
    feedback(selfCheck ? '錄音已儲存。請在「我的錄音」重聽；口說內容不會由系統自動評分。' : `答對了！${round().why || '你已接上這一段記憶。'}`, 'success');
    $('#game-card').classList.add('is-correct');
    $('#game-card').querySelectorAll('button').forEach(button => { button.disabled = true; });
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
    state.hadMistake = true;
    feedback(message, 'error');
    button?.classList.remove('is-wrong'); void button?.offsetWidth; button?.classList.add('is-wrong');
  }
  function renderEnd() {
    renderRail(); renderHeader();
    $('#stage-kicker').textContent = 'JOURNEY COMPLETE';
    $('#play-title').textContent = '你已走完 Essay 80 的記憶路線';
    $('#stage-description').textContent = '你已完成字詞、句型、簡單英文重述，以及分小步的有提示與中階填空朗讀。';
    $('#round-number').textContent = '十二個關卡完成';
    $('#game-card').innerHTML = `<div class="ending"><div class="ending-star" aria-hidden="true">✦</div><p class="question-label">JOURNEY COMPLETE</p><h3>你已完成所有朗讀小步與重述核對。</h3><p>現在可嘗試一次過背出整篇：先說出立場及兩條理由，再依次講出兩段細節、例子與收束，最後逐句還原英文。你可以重玩任何關卡，或回原範文頁聽完整錄音。</p><div class="ending-actions"><button class="primary-button" type="button" data-replay>重玩原文重組 ↺</button><a class="secondary-button" href="writing-practice.html?exercise=model-essay-80-ielts-opinion">對照原範文 ↗</a></div></div>`;
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
      if(state.selection.length===parts.length){$('#game-card').innerHTML=`<h3>${escapeHtml(item.prompt)}</h3><p class="speaking-text">${escapeHtml(parts.map(p=>p.text).join(' '))}</p>`;succeed(false,true);}
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
      if (correct) succeed(); else mistake(button, '兩條理由要分別對應「更廣泛取得知識」與「實用數碼技能」。');
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
    } else if (button.hasAttribute('data-speaking-done')) {
      if(savedRecordings.has(recordingReceipt())) succeed(true);
    } else if (button.hasAttribute('data-guided-help')) {
      state.stage=9;state.checks=[];state.revealTranslation=false;render();
    } else if (button.hasAttribute('data-replay')) {
      state.stage = 8; state.round = 0; state.selection = []; state.hadMistake = false; state.revealTranslation = false; render();
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
  $('#audio-full').addEventListener('click', event => playAudio(0, null, event.currentTarget));
  $('#restart-round').addEventListener('click', () => { audio.pause(); state.transitioning=false; state.checks=[]; state.selection = []; state.hadMistake = false; state.revealTranslation = false; render(); });
  $('#restart-all').addEventListener('click', () => {
    if (!confirm('重新開始會清除 Essay 80 試驗版的本機進度。確定嗎？')) return;
    audio.pause(); state.transitioning=false;state.checks=[];state.completed=false;state.stage = 0; state.round = 0; state.unlocked = 0; state.solved = {}; state.selection = []; state.hadMistake = false; state.revealTranslation = false; render();
  });

  if (state.completed && stageDefinitions.every((stage,i)=>stage.rounds.every((_,j)=>state.solved[`${i}:${j}`]))) renderEnd(); else render();
})();
