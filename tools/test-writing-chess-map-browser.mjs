// Synthetic accounts only; external database traffic is blocked.
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const base=process.env.LANGUAGE_QA_URL||'http://127.0.0.1:8777';
const output=process.env.LANGUAGE_QA_DIR||'/tmp/chess-qa';await mkdir(output,{recursive:true});
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

await open('writing-practice','fr');
await page.getByText('Food and Cooking',{exact:true}).first().click();await page.locator('[data-open-writing-deck]').first().click();
await page.locator('[data-open-practice]').click();
await page.locator('.chess-stage').waitFor();await page.waitForFunction(()=>document.querySelector('.chess-table')?.naturalWidth>0);await page.waitForTimeout(1500);
await page.locator('.writing-chess-page').evaluate(e=>e.scrollIntoView({block:'start'}));
await page.locator('.writing-chess-page').screenshot({path:output+'/desktop.png'});
assert.equal(await page.locator('.chess-stop').count(),16);
assert.equal(await page.locator('.chess-difficulty').count(),4);
assert.equal(await page.locator('.chess-label small').count(),0);
assert.equal(await page.locator('.chess-route').count(),0);
await page.locator('.chess-stage').click({position:{x:550,y:355}});
await page.waitForTimeout(1100);
const freePosition=await page.locator('.chess-companion').evaluate(e=>({x:parseFloat(e.style.left),y:parseFloat(e.style.top)}));
assert.ok(Math.abs(freePosition.x-50)<1&&Math.abs(freePosition.y-48.4)<1,'Companion walks to an arbitrary board point');
await page.locator('[data-chess-index="0"]').click();await page.waitForTimeout(1100);

assert.equal((await page.locator('.chess-plaque').innerText()).replace(/\s/g,''),'♛請選擇練習模式及段落範圍');
await page.locator('[data-chess-index="6"]').click();await page.waitForTimeout(100);
assert.equal(await page.locator('.chess-companion').getAttribute('data-walking'),'true');
await page.screenshot({path:output+'/walking.png'});
await page.locator('[data-chess-enter]').click();assert.equal(await page.locator('[data-practice-form] input').count(),45);
await page.locator('[data-back-practice-mode]').click();await page.locator('.chess-stage').waitFor();
for(const [level,count]of [['standard',34],['medium',45],['hard',75],['hell',97]])for(const mode of ['blank','start','end','both']){
 await page.locator(`[data-start-practice-mode="${mode}"][data-practice-difficulty="${level}"]`).click();
 await page.locator('[data-chess-enter]').click();
 assert.equal(await page.locator('[data-practice-form] input').count(),count,level+':'+mode);
 await page.locator('[data-back-practice-mode]').click();await page.locator('.chess-stage').waitFor();
}
await page.locator('[data-toggle-paragraph-selector]').click();
await page.locator('[data-practice-paragraph="1"]').uncheck();await page.locator('.chess-stage').waitFor();
await page.locator('[data-chess-enter]').click();assert.equal(await page.evaluate(()=>practiceState.selectedParagraphs.includes(1)),false);
await page.locator('[data-back-practice-mode]').click();await page.locator('.chess-stage').waitFor();
await page.locator('[data-select-full-essay]').click();await page.locator('.chess-stage').waitFor();
assert.equal(await page.evaluate(()=>practiceState.selectedParagraphs.length),12);
await page.locator('[data-chess-character="phoebe"]').click();
await page.locator('[data-chess-enter]').click();await page.locator('[data-back-practice-mode]').click();await page.locator('.chess-stage').waitFor();
assert.equal(await page.locator('[data-chess-character="phoebe"]').getAttribute('aria-pressed'),'true');
await page.emulateMedia({reducedMotion:'reduce'});await page.locator('[data-chess-index="0"]').click();
assert.equal(await page.locator('.chess-companion').getAttribute('data-walking'),'false');
await page.locator('[data-chess-character="elsie"]').click();await page.waitForTimeout(300);
await page.screenshot({path:output+'/elsie.png',fullPage:true});
await page.setViewportSize({width:390,height:844});await page.waitForTimeout(200);await page.screenshot({path:output+'/mobile.png',fullPage:true});
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'No document overflow');
assert.ok(await page.locator('.chess-scroll').evaluate(e=>e.scrollWidth>e.clientWidth),'Board scrolls within its viewport');
assert.equal(errors.length,0,errors.join('\n'));
await page.setViewportSize({width:1440,height:1050});
await open('writing-practice','it');await page.getByText('Food and Cooking',{exact:true}).first().click();await page.locator('[data-open-writing-deck]').first().click();await page.locator('[data-open-practice]').click();await page.locator('.chess-stage').waitFor();
assert.equal(await page.locator('[data-chess-character="eddy"]').getAttribute('aria-pressed'),'true','Italian preferences independent from French');
for(const [level,count]of [['standard',35],['medium',45],['hard',75],['hell',148]])for(const mode of ['blank','start','end','both']){
 await page.locator(`[data-start-practice-mode="${mode}"][data-practice-difficulty="${level}"]`).click();await page.locator('[data-chess-enter]').click();assert.equal(await page.locator('[data-practice-form] input').count(),count);await page.locator('[data-back-practice-mode]').click();await page.locator('.chess-stage').waitFor();
}
await browser.close();console.log('Chess map: sixteen modes, live motion, character persistence, reduced motion and mobile layout passed.');
