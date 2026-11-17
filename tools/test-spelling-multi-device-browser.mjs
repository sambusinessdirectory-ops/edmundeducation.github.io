import assert from 'node:assert/strict';

let chromium;
try {
  ({ chromium } = await import(process.env.PROFESSIONAL_QA_PLAYWRIGHT || 'playwright'));
} catch {
  ({ chromium } = await import('/Users/sammak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'));
}
const base = process.env.SPELLING_QA_BASE || 'http://127.0.0.1:8648';
const executablePath = process.env.PROFESSIONAL_QA_BROWSER || undefined;
const browser = await chromium.launch({ headless: true, executablePath });
const rows = new Map();
const errors = [];
let revision = 0;
const student = { id: '11111111-1111-4111-8111-111111111111', name: 'Spelling QA', role: 'student' };
const supabaseShim = `window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:null},error:null}),signInAnonymously:async()=>({data:{session:{user:{id:'qa'}}},error:null}),onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}})},rpc:()=>Promise.resolve({data:[],error:null})})};`;

async function makeDevice(token, user = student, device = {}) {
  const context = await browser.newContext({ serviceWorkers: 'block', ...device });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  page.on('pageerror', (error) => errors.push(error.message));
  await context.route('**/*', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.pathname.startsWith('/qa-rpc/')) {
      const args = request.postDataJSON();
      const key = `${args.p_token}:${args.p_system}:${args.p_scope}`;
      if (args.p_payload) rows.set(key, { revision: ++revision, payload: args.p_payload });
      const row = rows.get(key);
      return route.fulfill({ json: row ? { revision: row.revision, payload: row.revision !== args.p_since ? row.payload : null } : { revision: 0 } });
    }
    if (url.hostname === 'cdn.jsdelivr.net' && url.pathname.includes('supabase')) {
      return route.fulfill({ contentType: 'application/javascript', body: supabaseShim });
    }
    if (url.origin !== base) return route.abort();
    if (url.pathname === '/spelling-practice.js') {
      const response = await route.fetch();
      const bridge = `\nwindow.EDMUND_LEARNING_PORTAL_CONTEXT={portalId:'spelling',getSession:()=>({portalId:'spelling',user:${JSON.stringify(user)},token:${JSON.stringify(token)}}),rpc:async(name,args)=>(await fetch('/qa-rpc/'+name,{method:'POST',body:JSON.stringify(args)})).json()};window.__spellingSyncQa={setup:()=>{document.querySelector('[data-learning-portal-root] [data-view="login"]')?.setAttribute('hidden','');document.querySelector('[data-learning-portal-root] [data-view="dashboard"]')?.removeAttribute('hidden');activate(${JSON.stringify(user)});},state:()=>structuredClone(appState),choose:()=>{appState.selectedIds=VOCABULARY.slice(0,2).map(entry=>entry.id);appState.frequency=2;appState.phase='setup';render();persistAndPublish();},start:startRound,setStreak:value=>{appState.streak=Number(value)||0;},seedRecords:()=>{const [first,second]=VOCABULARY;const now=Date.now();appState.roundId=randomUuid();appState.startedAt=now-1000;appState.completedAt=now;appState.selectedIds=[first.id,second.id];appState.frequency=1;appState.totalAttempts=3;appState.totalCorrect=1;appState.attemptEvents=[{at:now-900,wordId:first.id,word:first.word,answer:'wrong',correct:false},{at:now-700,wordId:first.id,word:first.word,answer:first.word,correct:true},{at:now-500,wordId:second.id,word:second.word,answer:'wrong',correct:false}];appState.phase='setup';appState.setupView='bank';upsertLocalHistory(historyPayload());render();},masterDeck:id=>{const deck=CATALOG_DECKS.find(row=>row.id===id);if(!deck)return;appState.roundId=randomUuid();appState.startedAt=Date.now();appState.completedAt=Date.now();appState.totalAttempts=deck.entryIds.length;appState.totalCorrect=deck.entryIds.length;appState.attemptEvents=deck.entryIds.map((wordId,index)=>{const entry=VOCABULARY.find(row=>row.id===wordId);return {at:Date.now()+index,wordId,word:entry?.word||'',answer:entry?.word||'',correct:true};});render();persistAndPublish();},longPhrase:()=>{const entry=[...VOCABULARY].sort((a,b)=>Math.max(...b.word.split(' ').map(token=>token.length))-Math.max(...a.word.split(' ').map(token=>token.length)))[0];appState.displayMode='slots';appState.selectedIds=[entry.id];appState.frequency=1;appState.phase='practice';appState.correctById={[entry.id]:0};appState.totalCorrect=0;appState.totalAttempts=0;appState.queue=[entry.id];appState.currentId=entry.id;appState.mask=[...createMask(entry.word,50)];appState.draftLetters={};appState.feedback='';appState.awaitingNext=false;render();},typeOne:()=>{const input=document.querySelector('[data-letter-position]');input.value=currentEntry().word[Number(input.dataset.letterPosition)];input.dispatchEvent(new Event('input',{bubbles:true}));return input.dataset.letterPosition;},wrong:()=>{document.querySelectorAll('[data-letter-position]').forEach(input=>{input.value=currentEntry().word[Number(input.dataset.letterPosition)]==='z'?'x':'z';input.dispatchEvent(new Event('input',{bubbles:true}));});document.querySelector('[data-answer-form]').requestSubmit();},correct:()=>{document.querySelectorAll('[data-letter-position]').forEach(input=>{input.value=currentEntry().word[Number(input.dataset.letterPosition)];input.dispatchEvent(new Event('input',{bubbles:true}));});document.querySelector('[data-answer-form]').requestSubmit();},next:readyForNext};`;
      const bridgeExtensions = `\nObject.assign(window.__spellingSyncQa,{masterActive:()=>{const entries=activeLibraryEntries();const now=Date.now();appState.roundId=randomUuid();appState.startedAt=now-1000;appState.completedAt=now;appState.totalAttempts=entries.length;appState.totalCorrect=entries.length;appState.attemptEvents=entries.map((entry,index)=>({at:now+index,wordId:entry.id,word:entry.word,answer:entry.word,correct:true}));render();persistAndPublish();},spaceReady:()=>{const [first,second]=VOCABULARY;appState.phase='practice';appState.selectedIds=[first.id,second.id];appState.frequency=1;appState.queue=[second.id];appState.currentId=first.id;appState.correctById={[first.id]:1,[second.id]:0};appState.totalCorrect=1;appState.totalAttempts=1;appState.feedback='correct';appState.awaitingNext=false;appState.pendingNextId=second.id;appState.pendingNextMask=[...createMask(second.word,appState.difficulty)];appState.advanceAt=Date.now()+60000;render();}});`;
      const audioBridge = `\nwindow.__spellingSyncQa.audioState=()=>({created:Boolean(typingAudioContext),state:typingAudioContext?.state||'',lastAt:lastTypingSoundAt});`;
      return route.fulfill({ response, body: `${await response.text()}${bridge}${bridgeExtensions}${audioBridge}` });
    }
    return route.continue();
  });
  await page.goto(`${base}/spelling-system.html`);
  await page.waitForFunction(() => window.__spellingSyncQa);
  await page.evaluate(() => window.__spellingSyncQa.setup());
  return { context, page };
}

try {
  const first = await makeDevice('qa-same-account');
  const second = await makeDevice('qa-same-account', student, { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const isolated = await makeDevice('qa-different-account', { ...student, id: '22222222-2222-4222-8222-222222222222' }, { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  await first.page.evaluate(() => { __spellingSyncQa.choose(); __spellingSyncQa.start(); });
  const firstState = await first.page.evaluate(() => __spellingSyncQa.state());
  assert.equal(firstState.queue.length, 4);
  assert.deepEqual([...new Set(firstState.queue)].sort(), firstState.selectedIds.slice().sort());
  assert.ok(firstState.selectedIds.every((id) => firstState.queue.filter((queued) => queued === id).length === 2));
  assert.equal(await first.page.locator('.spelling-progress').count(), 1);
  assert.match(await first.page.locator('[data-elapsed]').innerText(), /^\d+:\d{2}$/);
  await second.page.waitForFunction((id) => __spellingSyncQa.state().currentId === id, firstState.currentId);
  assert.deepEqual(await second.page.evaluate(() => __spellingSyncQa.state().mask), firstState.mask);

  const typedPosition = await first.page.evaluate(() => __spellingSyncQa.typeOne());
  const typedValue = await first.page.evaluate((position) => __spellingSyncQa.state().draftLetters[position], typedPosition);
  assert.equal(await first.page.locator('[data-typing-effect-toggle]').getAttribute('aria-pressed'), 'true');
  assert.match(await first.page.locator('[data-typing-effect-toggle]').innerText(), /柔光聲效/);
  assert.ok(await first.page.locator('.spelling-writing-effect[data-mode="type"]').count() > 0);
  const typingAudioState = await first.page.evaluate(() => __spellingSyncQa.audioState());
  assert.equal(typingAudioState.created, true);
  assert.ok(typingAudioState.lastAt > 0);
  if (process.env.SPELLING_QA_SCREENSHOT) await first.page.screenshot({ path: `${process.env.SPELLING_QA_SCREENSHOT}-writing-effect.png` });
  await second.page.waitForFunction(({ position, value }) => __spellingSyncQa.state().draftLetters[position] === value, { position: typedPosition, value: typedValue });
  const mobileInputPresentation = await second.page.locator(`[data-letter-position="${typedPosition}"]`).evaluate((input) => ({
    value: input.value,
    color: getComputedStyle(input).color,
    fill: getComputedStyle(input).webkitTextFillColor,
    opacity: getComputedStyle(input).opacity
  }));
  assert.equal(mobileInputPresentation.value, typedValue);
  assert.doesNotMatch(`${mobileInputPresentation.color} ${mobileInputPresentation.fill}`, /transparent|rgba\(0, 0, 0, 0\)/);
  assert.equal(mobileInputPresentation.opacity, '1');
  assert.ok((await second.page.locator('.spelling-token').all()).length > 0);
  assert.ok((await second.page.locator('.spelling-token').evaluateAll((tokens) => tokens.every((token) => getComputedStyle(token).whiteSpace === 'nowrap'))));
  await first.page.evaluate((position) => {
    const input = document.querySelector(`[data-letter-position="${position}"]`);
    input.value = '';
    input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'deleteContentBackward' }));
  }, typedPosition);
  assert.ok(await first.page.locator('.spelling-writing-effect[data-mode="erase"]').count() > 0);
  const erasingAudioState = await first.page.evaluate(() => __spellingSyncQa.audioState());
  assert.ok(erasingAudioState.lastAt > typingAudioState.lastAt);
  await first.page.evaluate(() => document.querySelector('[data-typing-effect-toggle]').click());
  assert.equal(await first.page.locator('[data-typing-effect-toggle]').getAttribute('aria-pressed'), 'false');
  await first.page.waitForTimeout(850);
  assert.equal(await first.page.locator('.spelling-writing-effect').count(), 0);
  await first.page.evaluate(() => document.querySelector('[data-typing-effect-toggle]').click());
  assert.equal(await first.page.locator('[data-typing-effect-toggle]').getAttribute('aria-pressed'), 'true');

  await first.page.evaluate(() => __spellingSyncQa.wrong());
  await second.page.waitForFunction(() => __spellingSyncQa.state().awaitingNext === true);
  await second.page.waitForSelector('[data-feedback][data-state="wrong"]');
  const wrongFeedback = await second.page.locator('[data-feedback]').innerText();
  assert.match(wrongFeedback, /你的拼寫/);
  assert.match(wrongFeedback, /正確拼寫/);
  assert.ok(await second.page.locator('.spelling-comparison mark.is-different').count() > 0);

  await second.page.evaluate(() => __spellingSyncQa.next());
  const nextId = await second.page.evaluate(() => __spellingSyncQa.state().currentId);
  await first.page.waitForFunction((id) => __spellingSyncQa.state().awaitingNext === false && __spellingSyncQa.state().currentId === id, nextId);
  await second.page.evaluate(() => __spellingSyncQa.correct());
  await first.page.waitForFunction(() => __spellingSyncQa.state().feedback === 'correct');
  assert.match(await first.page.locator('[data-feedback]').innerText(), /拼寫正確/);
  await first.page.waitForFunction(() => __spellingSyncQa.state().feedback === '', null, { timeout: 8000 });
  await first.page.evaluate(() => {
    for (let index = 0; index < 8; index += 1) document.querySelector('.eddy-first-question-overlay:not(.eddy-five-streak-overlay) button')?.click();
  });
  await first.page.locator('.eddy-first-question-overlay:not(.eddy-five-streak-overlay)').waitFor({ state: 'detached' });
  await first.page.locator('[data-speak]').click();
  await first.page.waitForFunction(() => document.activeElement?.matches('[data-letter-position], [data-line-answer]'));
  await first.page.evaluate(() => { __spellingSyncQa.setStreak(4); __spellingSyncQa.correct(); });
  for (let index = 0; index < 12 && !await first.page.locator('.eddy-five-streak-overlay').count(); index += 1) {
    await first.page.evaluate(() => document.querySelector('.eddy-first-question-overlay:not(.eddy-five-streak-overlay) button')?.click());
    await first.page.waitForTimeout(150);
  }
  await first.page.locator('.eddy-five-streak-overlay').waitFor();
  assert.match(await first.page.locator('.eddy-five-streak-overlay').innerText(), /Eddy|氣勢|熱血/);
  await first.page.locator('.eddy-five-streak-overlay button').click();
  await first.page.waitForFunction(() => __spellingSyncQa.state().feedback === '', null, { timeout: 8000 });
  await first.page.evaluate(() => __spellingSyncQa.seedRecords());
  const masteredRow = first.page.locator('[data-word-row][data-mastered="true"]').first();
  await masteredRow.waitFor();
  assert.doesNotMatch(await masteredRow.innerText(), /已答對/);
  assert.equal(await masteredRow.evaluate((row) => getComputedStyle(row).backgroundColor), 'rgb(233, 246, 237)');
  if (process.env.SPELLING_QA_SCREENSHOT) {
    await first.page.locator('[data-word-filter] [data-dropdown-toggle]').click();
    await first.page.locator('.spelling-bank').last().screenshot({ path: `${process.env.SPELLING_QA_SCREENSHOT}-desktop.png` });
  }
  await first.page.locator('[data-setup-view="correct"]').click();
  await first.page.locator('[data-record-kind="correct"] .spelling-record-row').first().waitFor();
  assert.equal(await first.page.locator('[data-record-kind="correct"]').getAttribute('data-record-complete'), 'true');
  await first.page.locator('[data-setup-view="wrong"]').click();
  await first.page.locator('[data-record-kind="wrong"] .spelling-record-row').first().waitFor();
  await first.page.locator('[data-record-kind="wrong"] [data-practice-record-id]').first().click();
  const recordPractice = await first.page.evaluate(() => __spellingSyncQa.state());
  assert.equal(recordPractice.phase, 'practice');
  assert.equal(recordPractice.frequency, 1);
  assert.equal(recordPractice.selectedIds.length, 1);
  await first.page.evaluate(() => {
    for (let index = 0; index < 8; index += 1) document.querySelector('.eddy-first-question-overlay:not(.eddy-five-streak-overlay) button')?.click();
  });
  await first.page.locator('.eddy-first-question-overlay:not(.eddy-five-streak-overlay)').waitFor({ state: 'detached' });
  await first.page.evaluate(() => document.querySelector('[data-back-to-bank]')?.click());

  assert.equal((await isolated.page.evaluate(() => __spellingSyncQa.state())).phase, 'setup');
  await isolated.page.evaluate(() => __spellingSyncQa.spaceReady());
  for (let index = 0; index < 12 && await isolated.page.locator('.eddy-first-question-overlay').count(); index += 1) {
    await isolated.page.locator('.eddy-first-question-overlay button').click();
    await isolated.page.waitForTimeout(150);
  }
  await isolated.page.locator('.eddy-first-question-overlay').waitFor({ state: 'detached' });
  assert.match(await isolated.page.locator('[data-next-now]').innerText(), /Space[\s\S]*Enter/);
  if (process.env.SPELLING_QA_SCREENSHOT) await isolated.page.screenshot({ path: `${process.env.SPELLING_QA_SCREENSHOT}-mobile-practice.png` });
  await isolated.page.evaluate(() => { const app = document.querySelector('[data-spelling-app]'); app.tabIndex = -1; app.focus(); });
  const spaceReadyId = await isolated.page.evaluate(() => __spellingSyncQa.state().currentId);
  await isolated.page.keyboard.press('Space');
  await isolated.page.waitForFunction((previousId) => __spellingSyncQa.state().feedback === '' && __spellingSyncQa.state().currentId !== previousId, spaceReadyId);
  await isolated.page.evaluate(() => __spellingSyncQa.spaceReady());
  await isolated.page.evaluate(() => { const app = document.querySelector('[data-spelling-app]'); app.tabIndex = -1; app.focus(); });
  const enterReadyId = await isolated.page.evaluate(() => __spellingSyncQa.state().currentId);
  await isolated.page.keyboard.press('Enter');
  await isolated.page.waitForFunction((previousId) => __spellingSyncQa.state().feedback === '' && __spellingSyncQa.state().currentId !== previousId, enterReadyId);
  await isolated.page.locator('[data-back-to-bank]').click();
  assert.equal(await isolated.page.locator('.spelling-table-wrap thead th').count(), 3);
  assert.doesNotMatch(await isolated.page.locator('.spelling-bank').innerText(), /字母拆分/);
  assert.equal(await isolated.page.locator('[data-spelling-app] select').count(), 0);
  await isolated.page.locator('[data-word-filter] [data-dropdown-toggle]').click();
  assert.equal(await isolated.page.locator('[data-word-filter] [role="option"]').count(), 3);
  assert.ok(Number.parseFloat(await isolated.page.locator('[data-word-filter] .spelling-dropdown__menu').evaluate((menu) => getComputedStyle(menu).borderRadius)) >= 12);
  await isolated.page.locator('[data-word-filter] [data-dropdown-option="all"]').click();
  await isolated.page.locator('[data-setup-view="history"]').click();
  await isolated.page.getByText('每輪練習詳情').waitFor();
  await isolated.page.locator('[data-setup-view="bank"]').click();
  await isolated.page.locator('[data-quick-pick-random="10"]').click();
  assert.equal((await isolated.page.evaluate(() => __spellingSyncQa.state())).selectedIds.length, 10);
  await isolated.page.locator('[data-quick-range-select="10"] [data-dropdown-toggle]').click();
  await isolated.page.locator('[data-quick-range-select="10"] [data-dropdown-option="11"]').click();
  await isolated.page.locator('[data-quick-pick-range="10"]').click();
  assert.equal((await isolated.page.evaluate(() => __spellingSyncQa.state())).selectedIds.length, 10);
  await isolated.page.locator('[data-deselect-all]').click();
  const dragRows = isolated.page.locator('[data-word-row]:not([hidden])');
  const firstBox = await dragRows.nth(0).boundingBox();
  const thirdBox = await dragRows.nth(2).boundingBox();
  assert.ok(firstBox && thirdBox);
  const dragX = firstBox.x + firstBox.width - 14;
  await isolated.page.mouse.move(dragX, firstBox.y + firstBox.height / 2);
  await isolated.page.mouse.down();
  await isolated.page.mouse.move(dragX, thirdBox.y + thirdBox.height / 2, { steps: 12 });
  await isolated.page.mouse.up();
  assert.ok(await isolated.page.locator('[data-word-select]:checked').count() >= 3);
  await isolated.page.locator('[data-display-mode="line"]').click();
  await isolated.page.evaluate(() => { __spellingSyncQa.choose(); __spellingSyncQa.start(); });
  await isolated.page.locator('[data-line-answer]').waitFor();
  await isolated.page.locator('[data-line-answer]').fill('visible mobile answer');
  assert.equal(await isolated.page.locator('[data-line-answer]').inputValue(), 'visible mobile answer');
  await isolated.page.evaluate(() => __spellingSyncQa.longPhrase());
  assert.ok(await isolated.page.locator('.spelling-token').evaluateAll((tokens) => tokens.every((token) => token.getBoundingClientRect().right <= innerWidth + 1 && token.getBoundingClientRect().left >= -1)));
  await isolated.page.evaluate(() => {
    for (let index = 0; index < 8; index += 1) document.querySelector('.eddy-first-question-overlay:not(.eddy-five-streak-overlay) button')?.click();
    document.querySelector('[data-back-to-bank]')?.click();
  });
  await isolated.page.locator('.eddy-first-question-overlay:not(.eddy-five-streak-overlay)').waitFor({ state: 'detached' });
  await isolated.page.locator('[data-library-id="ielts"]').click();
  await isolated.page.locator('[data-deck-search]').fill('Model Essay 20 Cause');
  const searchResult = isolated.page.locator('.spelling-deck-search-result').filter({ hasText: 'Model Essay 20' }).first();
  await searchResult.waitFor();
  assert.match(await searchResult.innerText(), /Problem and Cause/);
  await searchResult.click();
  await isolated.page.locator('[data-library-group="ielts-task2"]').click();
  await isolated.page.locator('[data-library-section="ielts-t2-problem-and-cause"]').click();
  const compactLabels = await isolated.page.locator('.spelling-deck-grid--stage strong').allInnerTexts();
  assert.ok(compactLabels.length > 10);
  assert.ok(compactLabels.every((label) => /^Model Essay \d+$/.test(label)), 'Categorized essay decks must not repeat the IELTS/type/Band 9 wording.');
  const firstDeckId = await isolated.page.locator('.spelling-deck-grid--stage [data-deck-id]').first().getAttribute('data-deck-id');
  await isolated.page.evaluate((deckId) => __spellingSyncQa.masterDeck(deckId), firstDeckId);
  await isolated.page.locator(`.spelling-deck-grid--stage [data-deck-id="${firstDeckId}"].is-complete`).waitFor();
  assert.match(await isolated.page.locator(`.spelling-deck-grid--stage [data-deck-id="${firstDeckId}"]`).innerText(), /已完成/);
  await isolated.page.evaluate(() => __spellingSyncQa.masterActive());
  await isolated.page.locator('[data-quick-range-select="10"].is-complete [data-dropdown-toggle]').click();
  const completedRanges = isolated.page.locator('[data-quick-range-select="10"] [data-dropdown-option].is-complete');
  assert.ok(await completedRanges.count() > 0);
  assert.equal(await completedRanges.first().getAttribute('data-complete'), 'true');
  assert.notEqual(await completedRanges.first().evaluate((option) => getComputedStyle(option).backgroundColor), 'rgba(0, 0, 0, 0)');
  if (process.env.SPELLING_QA_SCREENSHOT) await isolated.page.locator('.spelling-quick-modes').screenshot({ path: `${process.env.SPELLING_QA_SCREENSHOT}-mobile.png` });
  assert.ok(await isolated.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'Mobile setup must not overflow horizontally.');
  assert.deepEqual(errors, []);
  await Promise.all([first.context.close(), second.context.close(), isolated.context.close()]);
  console.log('PASS spelling live sync and feature QA: audible typing/erase effects, Space/Enter next, Eddy streak, record re-practice, custom dropdowns and green completion.');
} finally {
  await browser.close();
}
