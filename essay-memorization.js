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
      icon: '▤', title: '還原句序', en: 'SENTENCE MAP', description: '按原文次序排列每一段的句子，合共十六句。', rounds: [0, 1, 2, 3].map(paragraph => ({
        type: 'sequence', paragraph, prompt: ['開場：背景如何帶出立場？', '第一主體段：六句如何展開？', '第二主體段：六句如何展開？', '總結：哪句先重申立場？'][paragraph],
        detail: '逐一點選英文原句；完成後可看繁體中文提示。', items: byParagraph(paragraph).map(sentence => ({ title: sentence.english, body: sentence.role, sentenceIndex: sentence.globalIndex })),
        why: '請留意每句的角色，以及它怎樣引出下一句。',
      })),
    },
    {
      icon: 'Aa', title: '簡單字詞', en: 'SIMPLE WORDS', description: '每句先看字詞在這個語境中的簡單說法，再用自己的話說一次。',
      rounds: sentences.map((sentence, sentenceIndex) => ({ type: 'vocabulary', sentenceIndex, prompt: `第 ${sentenceIndex + 1} 句 · 換成容易明白的說法` })),
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
      icon: '◉', title: '無提示朗讀', en: 'INDEPENDENT RECALL', description: '先回想一小節，再一句，最後相鄰兩句。先朗讀，才揭曉原文核對；需要時可返回有提示練習。', rounds: speakingRounds(false),
    },
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
  const storageKey = 'edmund-essay80-memory-scaffold-v2';
  const saved = (() => {
    try {
      const current = JSON.parse(localStorage.getItem(storageKey) || 'null');
      if (current) return current;
      const old = JSON.parse(localStorage.getItem('edmund-essay80-memory-pilot-v1') || '{}');
      const solved = {};
      Object.entries(old.solved || {}).forEach(([key, value]) => {
        const [stage, round] = key.split(':').map(Number);
        if (stage < 5) solved[key] = value;
        else if (stage === 5 && round < 16) solved[`8:${round}`] = value;
      });
      // Old paragraph self-checks remain in the untouched v1 record; they do not certify new practice.
      return { stage: old.stage >= 5 ? 5 : old.stage || 0, round: old.stage >= 5 ? 0 : old.round || 0, unlocked: Math.min(old.unlocked || 0, 5), solved };
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
  const orderedSeed = (length, seed) => {
    const indices = Array.from({ length }, (_, index) => index);
    let x = seed + 137;
    for (let index = length - 1; index > 0; index--) {
      x = (Math.imul(x, 1664525) + 1013904223) >>> 0;
      const target = x % (index + 1);
      [indices[index], indices[target]] = [indices[target], indices[index]];
    }
    if (length > 1 && indices.every((value, index) => value === index)) indices.reverse();
    return indices;
  };
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
    return `<div class="question-intro"><span class="question-mark">${precision ? '✦' : '↝'}</span><div><p class="question-label">${precision ? 'REBUILD THE EXACT SENTENCE' : 'TAP IN THE CORRECT ORDER'}</p><h3>${escapeHtml(item.prompt)}</h3><p>${escapeHtml(item.detail || '逐一點選正確次序。')}</p></div></div>${extra}<div class="sequence-track" aria-label="已選次序">${items.map((_, index) => `<div class="sequence-slot ${state.selection[index] == null ? '' : 'filled'}"><small>${String(index + 1).padStart(2, '0')}</small><span>${state.selection[index] == null ? '下一步' : escapeHtml(items[state.selection[index]].title)}</span></div>`).join('')}</div><div class="option-heading"><span>${precision ? '片語卡' : '待排序卡'}</span><span>${state.selection.length} / ${items.length}</span></div><div class="sequence-options ${precision ? 'phrase-options' : ''}">${indices.map(index => `<button class="sequence-card ${state.selection.includes(index) ? 'used' : ''}" type="button" data-sequence="${index}" ${state.selection.includes(index) ? 'disabled' : ''}><span class="option-glyph" aria-hidden="true">${precision ? '✧' : '◆'}</span><span><strong>${escapeHtml(items[index].title)}</strong>${items[index].body ? `<small>${escapeHtml(items[index].body)}</small>` : ''}</span></button>`).join('')}</div><div class="action-bar"><span>按原有邏輯依次點選</span><button class="text-button" type="button" data-undo ${state.selection.length ? '' : 'disabled'}>撤銷上一步 ↶</button></div>`;
  }
  function lineHtml(text) { return String(text).split('\n').map(line => `<p>${escapeHtml(line)}</p>`).join(''); }
  function renderVocabulary(item) {
    const content = support.sentences[item.sentenceIndex];
    return `<div class="question-intro"><div><p class="question-label">WORDS IN CONTEXT</p><h3>${escapeHtml(item.prompt)}</h3></div></div><p class="support-source">${escapeHtml(sentences[item.sentenceIndex].english)}</p><table class="support-table"><thead><tr><th>原文字詞</th><th>這裏的簡單說法</th><th>意思</th></tr></thead><tbody>${content.synonyms.map(pair=>`<tr><td>${escapeHtml(pair.original)}</td><td>${escapeHtml(pair.simple)}</td><td>${escapeHtml(pair.meaning)}</td></tr>`).join('')}</tbody></table><p class="support-notes">這些是本句語境中的解釋或改寫；不一定可以逐字替換。先說出意思，再看簡單版本。</p><details><summary>查看簡單英文示範</summary><p class="speaking-text">${escapeHtml(content.simple)}</p></details><button class="primary-button support-next" data-support-done>我能用簡單字詞說出意思 →</button>`;
  }
  function renderStructure(item) {
    const source = sentences.find(s=>s.paragraph===item.source.paragraph-1 && s.index===item.source.sentence-1);
    return `<p class="question-label">第 ${item.source.paragraph} 段 · 第 ${item.source.sentence} 句</p><p class="support-source">${escapeHtml(source.english)}</p><h3 class="structure-frame">${escapeHtml(item.frame)}</h3><div class="structure-parts">${item.parts.map(p=>`<span class="structure-part ${p.kind}">${escapeHtml(p.text)}<small>${p.kind==='slot'?'換入符合這個意思的內容':'連接／句型固定部分'}</small></span>`).join('')}</div><div class="support-notes"><p><strong>意思：</strong>${escapeHtml(item.meaning)}</p><p><strong>功能與使用時機：</strong>${escapeHtml(item.usage)}</p>${item.contextNote?`<p>${escapeHtml(item.contextNote)}</p>`:''}</div>${renderQuiz(item)}<p class="support-notes">選出同時符合指定意思及句型的一句。</p>`;
  }
  function renderSpeaking(item) {
    const retell = item.type === 'retell';
    const visible = item.guided || state.revealTranslation;
    const answer = retell ? item.sentenceIndices.map(i=>support.sentences[i].simple).join('\n') : item.text;
    const labels = retell ? ['我有交代立場或本部分的主要意思。','我保留了本部分的原因、比較或例子，沒有改變意思。','我用了自己明白的簡單英文。'] : ['我已大聲讀出這一小步。','我已對照文字，檢查有沒有遺漏或讀錯。'];
    return `<div class="question-intro"><div><p class="question-label">${retell?'SIMPLE ENGLISH RETELLING':item.guided?'SUPPORTED READING':'RECALL AND CHECK'}</p><h3>${escapeHtml(item.prompt)}</h3><p>${retell?'先用自己的英文說一次，再查看示範。意思相同即可。':item.guided?'看著英文讀這一小步；不需要一次背整段。':'這裏不顯示英文或意思提示。先試讀，再揭曉核對。'}</p></div></div>${retell?`<div class="recall-cue">${lineHtml(item.cue)}</div>`:''}${visible?`<div class="recall-reveal speaking-text">${lineHtml(answer)}</div>${!retell && item.sentenceIndices.length===1?`<button class="mini-button" data-play-sentence="${item.sentenceIndices[0]}">♫ 聽完整這一句</button>`:''}<div class="self-checks">${labels.map((text,i)=>`<label><input type="checkbox" data-self-check="${i}" ${state.checks.includes(i)?'checked':''}>${escapeHtml(text)}</label>`).join('')}</div><div class="recall-actions"><button class="text-button" data-retry-speaking>再試一次 ↶</button><button class="primary-button" data-speaking-done ${state.checks.length===labels.length?'':'disabled'}>我已完成本小步自我核對 →</button></div>`:`<div class="speaking-hidden">${retell?'用簡單英文說，不必照背原文。':'先試著說出剛練過的小節或句子。'}</div><div class="recall-actions"><button class="primary-button" data-reveal-speaking>${retell?'查看簡單英文示範與核對清單':'揭曉本小步原文並核對'} →</button>${!retell?'<button class="text-button" data-guided-help>需要提示？返回相同小步練習</button>':''}</div>`}`;
  }
  function render() {
    renderRail(); renderHeader(); feedback('');
    const item = round();
    const card = $('#game-card');
    card.classList.remove('card-enter'); void card.offsetWidth; card.classList.add('card-enter');
    card.innerHTML = item.type === 'quiz' ? renderQuiz(item) : item.type === 'structure' ? renderStructure(item) : item.type === 'vocabulary' ? renderVocabulary(item) : ['speaking','retell'].includes(item.type) ? renderSpeaking(item) : item.type === 'multi' ? renderMulti(item) : renderSequence(item, item.type === 'precision');
    save();
  }
  function celebrate() {
    const layer = $('#confetti');
    layer.innerHTML = Array.from({ length: 18 }, (_, index) => `<i style="--x:${Math.round((index / 17) * 100)}%;--delay:${index % 5 * 40}ms;--hue:${index % 2 ? 43 : 169}"></i>`).join('');
    setTimeout(() => { layer.innerHTML = ''; }, 1150);
  }
  function succeed(selfCheck = false) {
    if (state.transitioning) return;
    state.transitioning = true;
    if (!state.solved[roundKey()]) state.solved[roundKey()] = state.hadMistake ? 1 : 2;
    save(); renderHeader(); renderRail();
    feedback(selfCheck ? '已記錄你的自我核對。口說內容不會由系統自動評分。' : `答對了！${round().why || '你已接上這一段記憶。'}`, 'success');
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
    state.hadMistake = true;
    feedback(message, 'error');
    button?.classList.remove('is-wrong'); void button?.offsetWidth; button?.classList.add('is-wrong');
  }
  function renderEnd() {
    renderRail(); renderHeader();
    $('#stage-kicker').textContent = 'JOURNEY COMPLETE';
    $('#play-title').textContent = '你已走完 Essay 80 的記憶路線';
    $('#stage-description').textContent = '你已完成字詞、句型、簡單英文重述，以及分小步的有提示與無提示朗讀。';
    $('#round-number').textContent = '十一個關卡完成';
    $('#game-card').innerHTML = `<div class="ending"><div class="ending-star" aria-hidden="true">✦</div><p class="question-label">JOURNEY COMPLETE</p><h3>你已完成所有朗讀小步與重述核對。</h3><p>現在可嘗試一次過背出整篇：先說出立場及兩條理由，再依次講出兩段細節、例子與收束，最後逐句還原英文。你可以重玩任何關卡，或回原範文頁聽完整錄音。</p><div class="ending-actions"><button class="primary-button" type="button" data-replay>重玩原文重組 ↺</button><a class="secondary-button" href="writing-practice.html?exercise=model-essay-80-ielts-opinion">對照原範文 ↗</a></div></div>`;
    feedback('完成！朗讀及重述為自行核對，系統不會自動判定口說準確度。', 'success');
  }

  $('#game-card').addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.hasAttribute('data-continue')) { advance(); return; }
    if (state.transitioning) return;
    const item = round();
    if (button.hasAttribute('data-choice')) {
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
      state.selection.push(index);
      const length = item.type === 'precision' ? phraseTiles(sentences[item.sentenceIndex].english).length : item.items.length;
      $('#game-card').innerHTML = renderSequence(item, item.type === 'precision');
      if (state.selection.length === length) succeed();
    } else if (button.hasAttribute('data-undo')) {
      state.selection.pop(); $('#game-card').innerHTML = renderSequence(item, item.type === 'precision'); feedback('已撤銷上一步。', 'hint');
    } else if (button.hasAttribute('data-translation')) {
      state.revealTranslation = !state.revealTranslation;
      $('#game-card').innerHTML = renderSequence(item, item.type === 'precision');
    } else if (button.hasAttribute('data-play-sentence')) {
      const sentence = sentences[Number(button.dataset.playSentence)];
      playAudio(sentence.start, sentence.end, button);
    } else if (button.hasAttribute('data-support-done')) {
      succeed(true);
    } else if (button.hasAttribute('data-reveal-speaking')) {
      state.revealTranslation=true; state.checks=[]; $('#game-card').innerHTML=renderSpeaking(item);
    } else if (button.hasAttribute('data-retry-speaking')) {
      state.revealTranslation=false;state.checks=[];$('#game-card').innerHTML=renderSpeaking(item);
    } else if (button.hasAttribute('data-speaking-done')) {
      if (state.checks.length === (item.type==='retell'?3:2)) succeed(true);
    } else if (button.hasAttribute('data-guided-help')) {
      state.stage=9;state.checks=[];state.revealTranslation=false;render();
    } else if (button.hasAttribute('data-replay')) {
      state.stage = 8; state.round = 0; state.selection = []; state.hadMistake = false; state.revealTranslation = false; render();
    }
  });
  $('#game-card').addEventListener('change', event => {
    if (!event.target.matches('[data-self-check]')) return;
    const i=Number(event.target.dataset.selfCheck);
    state.checks=event.target.checked?[...new Set([...state.checks,i])]:state.checks.filter(x=>x!==i);
    $('#game-card').querySelector('[data-speaking-done]').disabled=state.checks.length!==(round().type==='retell'?3:2);
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
