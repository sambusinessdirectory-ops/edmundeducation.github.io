// Synthetic accounts only; external database traffic is blocked.
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const base=process.env.LANGUAGE_QA_URL||'http://127.0.0.1:8765';
const output=process.env.LANGUAGE_QA_DIR||'/tmp/italian-lesson';await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1050},serviceWorkers:'block'});
const states=new Map(),calls=[],errors=[];
await context.exposeFunction('__languageQaRpc',async(name,p)=>{
 calls.push({name,args:p});
 if(name==='language_learning_access')return {data:{},error:null};
 if(name==='language_learning_rpc'){
  const scope=p.p_language+':'+p.p_system,a=p.p_args;const records=states.get(scope)||[];
  if(p.p_operation.includes('get_'))return {data:records,error:null};
  if(p.p_operation.includes('list_'))return {data:[],error:null};
  if(p.p_system==='flashcard'){
   const version=a.p_expected_version+1;states.set(scope,[...records.filter(r=>r.key!==a.p_key),{key:a.p_key,value:a.p_value,version,value_checksum:'qa-checksum'}]);
   return {data:{requestId:a.p_request_id,key:a.p_key,status:'accepted',code:'saved',actorKind:'student',expectedVersion:a.p_expected_version,resultingVersion:version,resultingChecksum:'qa-checksum',serverTime:new Date().toISOString()},error:null};
  }
  return {data:true,error:null};
 }
 if(/student_(login|session_profile|session_from_flashcard)$/.test(name))return {data:[{id:'qa',name:'Language QA',role:'student',access:{},session_token:'11111111-1111-4111-8111-111111111111'}],error:null};
 return {data:[],error:null};
});
await context.route(/cdn.jsdelivr.net.*supabase/,r=>r.fulfill({body:''}));
await context.route(/supabase.co/,r=>r.abort());
await context.addInitScript(()=>{window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{user:{id:'qa'}}}})},rpc:window.__languageQaRpc})};});
const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
async function open(type,language){
 await page.goto(`${base}/${type}.html?language=${language}`,{waitUntil:'domcontentloaded'});
 await page.waitForTimeout(250);
 if(await page.locator('input[name="username"]').isVisible()){
  await page.locator('input[name="username"]').fill('Language QA');await page.locator('input[type="password"]').first().fill('synthetic');await page.locator('form').first().evaluate(f=>f.requestSubmit());
 }
 await page.getByText('Food and Cooking',{exact:true}).first().waitFor();await page.waitForFunction(()=>!document.querySelector('[data-dashboard]')?.inert);
 for(const label of ['Culture','History','News','Conversations','Travelling'])assert.ok(await page.getByText(label,{exact:true}).count());
}
await open('writing-practice','it');
await page.getByText('Food and Cooking',{exact:true}).first().click();await page.locator('[data-open-writing-deck]').first().click();
assert.equal(await page.evaluate(()=>!!essayAudioTimingContext(currentExercise())),true,'Narration timing matches every displayed word');
await page.locator('[data-play-essay-audio]').click();await page.waitForTimeout(500);assert.equal(await page.locator('[data-play-essay-audio]').getAttribute('aria-pressed'),'true');await page.locator('[data-play-essay-audio]').click();
await page.locator('[data-essay-tab="translation"]').click();assert.equal(await page.locator('.translation-unit .language-en').count(),45);
await page.locator('[data-open-practice]').click();assert.equal(await page.locator('[data-start-practice-mode]').count(),16);
for(const [level,count]of [['standard',35],['medium',45],['hard',75],['hell',148]])for(const mode of ['blank','start','end','both']){
 await page.locator(`[data-start-practice-mode="${mode}"][data-practice-difficulty="${level}"]`).click();
 if(await page.locator("[data-chess-enter]").count())await page.locator("[data-chess-enter]").click();
 assert.equal(await page.locator('[data-practice-form] input').count(),count,level+':'+mode);
 await page.locator('[data-back-practice-mode]').click();
}
await page.screenshot({path:output+'/writing-modes.png'});
await open('flashcards','it');await page.getByText('Food and Cooking',{exact:true}).first().click();await page.locator('[data-open-deck]').first().click();
assert.equal(await page.evaluate(()=>getDeckCards().length),89);
assert.equal(await page.evaluate(()=>getDeckCards().every(c=>c.examples.length===5&&!!neuralAudioPathForText(c.front))),true);
await page.locator('[data-start-mode="order"]').click();await page.locator('[data-front-card]').click();
assert.equal(await page.locator('[data-back-card] .language-en').count(),6);assert.equal(await page.locator('[data-back-card] .language-zh').count(),6);
assert.equal(await page.locator('[data-back-card] .language-en').first().evaluate(e=>getComputedStyle(e).color),'rgb(116, 31, 56)');
await page.locator('[data-mark-card="green"]').click();await page.waitForTimeout(500);
assert.ok(calls.some(c=>c.name==='language_learning_rpc'&&c.args.p_language==='it'&&c.args.p_system==='flashcard'&&c.args.p_operation.includes('upsert')));
await page.screenshot({path:output+'/flashcard-study.png'});
await page.evaluate(()=>{localStorage.setItem('original-qa-marker','original');languageStorage.setItem('qa-edition-marker','Italian');});
for(const language of ['de','es','ja','ko'])for(const type of ['flashcards','writing-practice']){
 await open(type,language);assert.equal(await page.evaluate(()=>languageStorage.getItem('qa-edition-marker')),null);
 assert.equal(await page.evaluate(()=>localStorage.getItem('original-qa-marker')),'original');
 await page.getByText('Food and Cooking',{exact:true}).first().click();assert.ok(await page.getByText(/這個分類暫時未有/).count());
}
await open('writing-practice','fr');
assert.equal(await page.locator('.language-edition-nav').count(),0);
await page.getByText('Food and Cooking',{exact:true}).first().click();await page.locator('[data-open-writing-deck]').first().click();
assert.equal(await page.evaluate(()=>!!essayAudioTimingContext(currentExercise())),true,'French narration covers every displayed word');
await page.locator('[data-play-essay-audio]').click();await page.waitForTimeout(400);assert.equal(await page.locator('[data-play-essay-audio]').getAttribute('aria-pressed'),'true');await page.locator('[data-play-essay-audio]').click();
await page.locator('[data-essay-tab="translation"]').click();assert.equal(await page.locator('.translation-unit .language-en').count(),33);
await page.screenshot({path:output+'/french-writing-translations.png'});
await page.locator('[data-open-practice]').click();
for(const [level,count]of [['standard',34],['medium',45],['hard',75],['hell',97]])for(const mode of ['blank','start','end','both']){
 await page.locator(`[data-start-practice-mode="${mode}"][data-practice-difficulty="${level}"]`).click();
 if(await page.locator("[data-chess-enter]").count())await page.locator("[data-chess-enter]").click();
 assert.equal(await page.locator('[data-practice-form] input').count(),count,level+':'+mode);await page.locator('[data-back-practice-mode]').click();
}
await open('flashcards','fr');await page.getByText('Food and Cooking',{exact:true}).first().click();await page.locator('[data-open-deck]').first().click();
assert.equal(await page.evaluate(()=>getDeckCards().length),151);
assert.equal(await page.evaluate(()=>getDeckCards().every(c=>c.examples.length===5&&!!neuralAudioPathForText(c.front))),true);
await page.locator('[data-start-mode="order"]').click();await page.locator('[data-front-card]').click();
for(const [selector,color]of [['.language-it','rgb(20, 46, 83)'],['.language-en','rgb(116, 31, 56)'],['.language-zh','rgb(23, 80, 57)']])assert.equal(await page.locator('[data-back-card] '+selector).first().evaluate(e=>getComputedStyle(e).color),color);
await page.waitForTimeout(500);await page.locator('[data-back-card]').scrollIntoViewIfNeeded();await page.screenshot({path:output+'/french-flashcard.png'});
await page.locator('[data-mark-card="green"]').click();await page.waitForTimeout(500);
assert.ok(calls.some(c=>c.name==='language_learning_rpc'&&c.args.p_language==='fr'&&c.args.p_system==='flashcard'&&c.args.p_operation.includes('upsert')));
assert.equal(calls.some(c=>/^(flashcard|writing)_(student|admin)_(get_state|upsert_state|append_attempt|list_attempts)/.test(c.name)),false,'No original learning RPCs');
await page.goto(base+'/index.html',{waitUntil:'domcontentloaded'});await page.locator('[data-system-card-deck] input[type=search]').fill('寫作練習');await page.waitForTimeout(300);
await page.locator('[data-language-switch="writing"]').last().click();await page.getByRole('menuitemradio',{name:'Italian Practice System',exact:true}).click();await page.waitForTimeout(500);
assert.equal(await page.locator('a.category.writing-system-card').first().getAttribute('href'),'writing-practice.html?language=it');
for(const kind of ['writing','flashcard'])for(const [code,label]of [['fr','French'],['de','German'],['es','Spanish'],['ja','Japanese'],['ko','Korean']]){
 await page.locator('[data-system-card-deck] input[type=search]').fill(kind==='writing'?'寫作練習':'Flashcard');await page.waitForTimeout(200);
 await page.locator(`[data-language-switch="${kind}"]`).last().click();await page.getByRole('menuitemradio',{name:label+' '+(kind==='writing'?'Practice System':'Flashcard'),exact:true}).click();await page.waitForTimeout(450);
 assert.equal(await page.locator('a.category.'+(kind==='writing'?'writing-system-card':'flashcard-card')).first().getAttribute('href'),(kind==='writing'?'writing-practice':'flashcards')+'.html?language='+code);
}
await page.setViewportSize({width:390,height:844});await page.locator('[data-system-card-deck] input[type=search]').fill('寫作練習');await page.waitForTimeout(200);
await page.locator('[data-language-switch="writing"]').last().click();
assert.equal(await page.getByRole('menuitemradio').count(),7);
assert.ok(await page.locator('.language-card-menu').evaluate(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight;}));
await page.screenshot({path:output+'/seven-language-menu-mobile.png'});
assert.ok(page.url().endsWith('index.html'));assert.deepEqual(errors,[]);
console.log('PASS: seven homepage choices, six isolated language editions, Italian and French lessons, 32 worksheet modes, audio timing/playback, isolated progress, French lesson and four empty language catalogues, homepage switch');
await browser.close();
