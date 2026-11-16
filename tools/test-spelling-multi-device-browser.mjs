import assert from 'node:assert/strict';

let chromium;
try {
  ({ chromium } = await import(process.env.PROFESSIONAL_QA_PLAYWRIGHT || 'playwright'));
} catch {
  ({ chromium } = await import('/Users/sammak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'));
}
const base = 'http://127.0.0.1:8648';
const executablePath = process.env.PROFESSIONAL_QA_BROWSER || undefined;
const browser = await chromium.launch({ headless: true, executablePath });
const rows = new Map();
const errors = [];
let revision = 0;
const student = { id: '11111111-1111-4111-8111-111111111111', name: 'Spelling QA', role: 'student' };
const supabaseShim = `window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:null},error:null}),signInAnonymously:async()=>({data:{session:{user:{id:'qa'}}},error:null}),onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}})},rpc:()=>Promise.resolve({data:[],error:null})})};`;

async function makeDevice(token, user = student) {
  const context = await browser.newContext({ serviceWorkers: 'block' });
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
      const bridge = `\nwindow.EDMUND_LEARNING_PORTAL_CONTEXT={portalId:'spelling',getSession:()=>({portalId:'spelling',user:${JSON.stringify(user)},token:${JSON.stringify(token)}}),rpc:async(name,args)=>(await fetch('/qa-rpc/'+name,{method:'POST',body:JSON.stringify(args)})).json()};window.__spellingSyncQa={setup:()=>{document.querySelector('[data-learning-portal-root] [data-view="login"]')?.setAttribute('hidden','');document.querySelector('[data-learning-portal-root] [data-view="dashboard"]')?.removeAttribute('hidden');activate(${JSON.stringify(user)});},state:()=>structuredClone(appState),choose:()=>{appState.selectedIds=VOCABULARY.slice(0,2).map(entry=>entry.id);appState.frequency=2;appState.phase='setup';render();persistAndPublish();},start:startRound,typeOne:()=>{const input=document.querySelector('[data-letter-position]');input.value=currentEntry().word[Number(input.dataset.letterPosition)];input.dispatchEvent(new Event('input',{bubbles:true}));return input.dataset.letterPosition;},wrong:()=>{document.querySelectorAll('[data-letter-position]').forEach(input=>{input.value=currentEntry().word[Number(input.dataset.letterPosition)]==='z'?'x':'z';input.dispatchEvent(new Event('input',{bubbles:true}));});document.querySelector('[data-answer-form]').requestSubmit();},correct:()=>{document.querySelectorAll('[data-letter-position]').forEach(input=>{input.value=currentEntry().word[Number(input.dataset.letterPosition)];input.dispatchEvent(new Event('input',{bubbles:true}));});document.querySelector('[data-answer-form]').requestSubmit();},next:readyForNext};`;
      return route.fulfill({ response, body: `${await response.text()}${bridge}` });
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
  const second = await makeDevice('qa-same-account');
  const isolated = await makeDevice('qa-different-account', { ...student, id: '22222222-2222-4222-8222-222222222222' });

  await first.page.evaluate(() => { __spellingSyncQa.choose(); __spellingSyncQa.start(); });
  const firstState = await first.page.evaluate(() => __spellingSyncQa.state());
  await second.page.waitForFunction((id) => __spellingSyncQa.state().currentId === id, firstState.currentId);
  assert.deepEqual(await second.page.evaluate(() => __spellingSyncQa.state().mask), firstState.mask);

  const typedPosition = await first.page.evaluate(() => __spellingSyncQa.typeOne());
  const typedValue = await first.page.evaluate((position) => __spellingSyncQa.state().draftLetters[position], typedPosition);
  await second.page.waitForFunction(({ position, value }) => __spellingSyncQa.state().draftLetters[position] === value, { position: typedPosition, value: typedValue });

  await first.page.evaluate(() => __spellingSyncQa.wrong());
  await second.page.waitForFunction(() => __spellingSyncQa.state().awaitingNext === true);
  await second.page.waitForSelector('[data-feedback][data-state="wrong"]');
  assert.match(await second.page.locator('[data-feedback]').innerText(), /正確答案/);

  await second.page.evaluate(() => __spellingSyncQa.next());
  const nextId = await second.page.evaluate(() => __spellingSyncQa.state().currentId);
  await first.page.waitForFunction((id) => __spellingSyncQa.state().awaitingNext === false && __spellingSyncQa.state().currentId === id, nextId);
  await second.page.evaluate(() => __spellingSyncQa.correct());
  await first.page.waitForFunction(() => __spellingSyncQa.state().feedback === 'correct');
  assert.match(await first.page.locator('[data-feedback]').innerText(), /拼寫正確/);
  await first.page.waitForFunction(() => __spellingSyncQa.state().feedback === '', null, { timeout: 8000 });

  assert.equal((await isolated.page.evaluate(() => __spellingSyncQa.state())).phase, 'setup');
  assert.deepEqual(errors, []);
  await Promise.all([first.context.close(), second.context.close(), isolated.context.close()]);
  console.log('PASS spelling live sync: same-account setup, prompt, mask, typed letters, wrong-answer review, correct feedback and next state; different account isolated.');
} finally {
  await browser.close();
}
