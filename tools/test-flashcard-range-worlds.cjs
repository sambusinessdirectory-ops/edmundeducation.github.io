// Real page, synthetic local records only. Network/cloud authentication is blocked.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||path.join(process.env.HOME,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const root=path.resolve(__dirname,'..'), out=process.env.RANGE_QA_DIR||'/tmp/flashcard-range-qa';
fs.mkdirSync(out,{recursive:true});
const pageSource=fs.readFileSync(path.join(root,'flashcards.html'),'utf8');
const boot=`
// Fixture adapters replace only external services, catalogue and persistence.
const fixtureDeck='range-world-fixture';
let fixtureCount=337;
getDeckCards=()=>Array.from({length:fixtureCount},(_,i)=>({front:'Word '+(i+1),back:'意思 '+(i+1),examples:[]}));
deckDataRevision=()=>'';
privateDeckVisibleToStudent=()=>true;
readJson=(key,fallback)=>JSON.parse(languageStorage.getItem('range-test:'+key)||'null')||fallback;
writeJson=(key,value)=>{languageStorage.setItem('range-test:'+key,JSON.stringify(value));return true;};
requireFlashcardStateReady=()=>true;
logAttemptStart=()=> 'synthetic-attempt';
saveCurrentProgress=()=>{};
startStudyTimer=()=>{};
stopStudyTimer=()=>{};
renderStudyCard=()=>{};
cachePendingFamiliarityDeck=()=>{};
currentUser={name:'Range Preview A',role:'student'};
currentDeckId=fixtureDeck;currentDeckTitle='Flash Cards · '+languageEdition.label;
setupEvents();
window.rangeTest={
 render(){currentDeckId=fixtureDeck;refreshDeckStartPanel();showAppPanel('deck-start',false);},
 progress(green=[],red=[]){saveDeckFamiliarity(fixtureDeck,{green,red});this.render();},
 count(n){fixtureCount=n;this.render();},
 owner(name){currentUser=name?{name,role:'student'}:null;this.render();},
 selection(){return studySession?{mode:studySession.mode,limit:studySession.cardLimit,queue:studySession.initialQueue}:null;},
 language:languageEdition.language,
};
rangeTest.render();`;
const fixture=pageSource.replace('void initialiseFlashcardPortal();',boot);
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.json':'application/json'};
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 if(url.pathname==='/flashcards.html'){res.setHeader('Content-Type','text/html');res.end(fixture);return;}
 const file=path.resolve(root,'.'+decodeURIComponent(url.pathname));
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(file,(err,body)=>{if(err){res.writeHead(404).end();return;}res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(body);});
});
let browser;
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const origin=`http://127.0.0.1:${server.address().port}`;
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1});
 await context.route('https://**/*',r=>r.abort());
 for(const script of ['pwa-register.js','shared-system-nav.js','pronunciation-checker.js','flashcard-pronunciation.js','page-loader.js']) await context.route(`**/${script}*`,r=>r.fulfill({contentType:'text/javascript',body:''}));
 // Hide the fixed page header only during element captures; it otherwise cuts across tall collection screenshots.
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const visit=async(query='')=>{await page.goto(origin+'/flashcards.html'+query);await page.waitForFunction(()=>window.rangeTest);await page.evaluate(()=>document.querySelectorAll('.range-object').forEach(i=>i.loading='eager'));await page.waitForFunction(()=>[...document.querySelectorAll('.range-object')].every(i=>i.complete&&i.naturalWidth>0));};
 await visit();
 assert.equal(await page.locator('.range-choice').count(),40);
 assert.equal(await page.locator('[data-range-world="30"] .mode-grid').evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length),5);
 assert.equal(await page.locator('[data-range-world="10"] .mode-grid').evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length),4);
 assert.equal(await page.locator('.range-ribbon').count(),11);
 assert.equal(await page.locator('[data-gem-shape="four-leaf-clover"]').count(),2);
 assert.equal(await page.locator('[data-material="gem"]').evaluateAll(es=>new Set(es.map(e=>e.dataset.gemColor)).size),9);
 await page.waitForFunction(()=>document.querySelectorAll('.range-spacer-bead').length===18);
 assert.ok(await page.locator('.range-spacer-bead').evaluateAll(es=>es.every(e=>e.getBoundingClientRect().width>15&&e.getBoundingClientRect().height>35)));

 await page.evaluate(()=>rangeTest.progress(Array.from({length:30},(_,i)=>String(i))));
 assert.equal(await page.locator('[data-range-world="30"] .range-completed').count(),1);
 assert.equal(await page.locator('[data-range-world="10"] .range-completed').count(),3);
 assert.equal(await page.locator('[data-range-world="standard"] .range-completed').count(),0);
 for(const world of ['standard','30','10'])await page.locator(`[data-range-world="${world}"]`).screenshot({style:'.topbar { visibility:hidden !important; }',path:path.join(out,`${world}-desktop.png`)});
 await page.evaluate(()=>rangeTest.progress(Array.from({length:30},(_,i)=>String(i)),['3']));
 assert.equal(await page.locator('[data-range-world="30"] .range-completed').count(),0,'Red overrides stale green');
 assert.equal(await page.locator('[data-range-world="10"] .range-completed').count(),2);
 await page.locator('[data-gem-shape="four-leaf-clover"]').first().screenshot({style:'.topbar { visibility:hidden !important; }',path:path.join(out,'clover-incomplete.png')});
 await page.evaluate(()=>rangeTest.progress(Array.from({length:337},(_,i)=>String(i))));
 await page.waitForFunction(()=>getComputedStyle(document.querySelector('[data-gem-shape="four-leaf-clover"] .range-ornament')).opacity==='1');
 await page.locator('[data-gem-shape="four-leaf-clover"]').first().screenshot({style:'.topbar { visibility:hidden !important; }',path:path.join(out,'clover-completed.png')});
 assert.equal(await page.locator('.range-completed').count(),40);
 for(const world of ['standard','30','10'])await page.locator(`[data-range-world="${world}"]`).screenshot({style:'.topbar { visibility:hidden !important; }',path:path.join(out,`${world}-completed.png`)});
 await page.reload();await page.waitForFunction(()=>window.rangeTest);
 assert.equal(await page.locator('.range-completed').count(),40,'Rewards survive reload from saved mastery');
 await page.evaluate(()=>rangeTest.owner('Range Preview B'));
 assert.equal(await page.locator('.range-completed').count(),0,'Account B cannot inherit account A rewards');
 await page.evaluate(()=>rangeTest.owner('Range Preview A'));
 assert.equal(await page.locator('.range-completed').count(),40);
 await page.evaluate(()=>rangeTest.owner(null));
 assert.equal(await page.locator('.range-completed').count(),0);
 await page.evaluate(()=>{rangeTest.owner('Range Preview A');rangeTest.progress([]);rangeTest.count(35);});
 const partial=page.locator('[data-range-world="30"] [data-range-start="31"]');
 assert.equal(await partial.locator('.range-number').textContent(),'31–35');
 assert.equal(await partial.locator('.range-progress').textContent(),'0 / 5');
 await partial.locator('.range-object').click();
 assert.deepEqual(await page.evaluate(()=>rangeTest.selection().queue),[30,31,32,33,34]);
 await page.evaluate(()=>rangeTest.render());
 assert.equal(await page.locator('[data-range-world="30"] [data-range-start="61"]').isDisabled(),true);
 await page.evaluate(()=>rangeTest.count(0));
 assert.equal(await page.locator('.range-completed').count(),0);
 assert.equal(await page.locator('.range-choice:disabled').count(),40);
 await page.evaluate(()=>{rangeTest.count(337);rangeTest.progress(Array.from({length:30},(_,i)=>String(i)),['33']);});
 const selectors=['[data-start-mode="order"]','[data-start-mode="random"]:not([data-card-limit])','[data-card-limit="10"]','[data-card-limit="20"]','[data-card-limit="30"]','[data-card-limit="40"]','[data-start-mode="red-only"]','[data-start-mode="green-only"]','[data-range-world="10"] [data-range-start="201"]','[data-range-world="30"] [data-range-start="301"]'];
 for(const sel of selectors){await page.evaluate(()=>rangeTest.render());await page.locator(sel).click();const selected=await page.evaluate(()=>rangeTest.selection());assert.ok(selected.queue.length>0);if(sel.match(/limit="(\d+)/)){const n=+sel.match(/limit="(\d+)/)[1];assert.equal(selected.queue.length,n);assert.ok(selected.queue.every(i=>i>=30));}}
 await page.evaluate(()=>rangeTest.render());
 // All language editions load the same screen and read their own records.
 const languages=[];
 for(const language of ['it','fr','de','es','ja','ko']){
  await visit('?language='+language);
  assert.equal(await page.evaluate(()=>rangeTest.language),language);
  assert.equal(await page.locator('.range-completed').count(),0,'New language starts without English rewards');
  await page.evaluate(()=>rangeTest.progress(Array.from({length:10},(_,i)=>String(i))));
  assert.equal(await page.locator('[data-range-world="10"] .range-completed').count(),1);
  languages.push(language);
 }
 await visit('?language=fr');assert.equal(await page.locator('[data-range-world="10"] .range-completed').count(),1);
 await page.locator('[data-range-world="10"]').screenshot({style:'.topbar { visibility:hidden !important; }',path:path.join(out,'french-gems.png')});
 for(const width of [768,390]){
  await page.setViewportSize({width,height:1000});
  for(const world of ['standard','30','10'])await page.locator(`[data-range-world="${world}"]`).screenshot({style:'.topbar { visibility:hidden !important; }',path:path.join(out,`${world}-${width}.png`)});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No horizontal page overflow');
 }
 await page.setViewportSize({width:720,height:900});await visit('?language=ja&embedded=1&source=reading');
 await page.locator('.range-worlds').screenshot({style:'.topbar { visibility:hidden !important; }',path:path.join(out,'embedded-720.png')});
 await page.setViewportSize({width:390,height:844});
 await page.locator('.range-worlds').screenshot({style:'.topbar { visibility:hidden !important; }',path:path.join(out,'embedded-390.png')});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await page.locator('[data-range-world="10"] [data-range-start="201"]').scrollIntoViewIfNeeded();
 await page.locator('[data-range-world="10"] [data-range-start="201"]').click();
 assert.equal((await page.evaluate(()=>rangeTest.selection().queue)).length,137);
 await page.evaluate(()=>rangeTest.render());
 await page.emulateMedia({reducedMotion:'reduce'});
 assert.equal(await page.locator('.range-token').first().evaluate(e=>getComputedStyle(e).transitionDuration),'0s');
 await page.locator('[data-start-mode="order"]').focus();
 await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');
 assert.notEqual(await page.locator('[data-start-mode="order"]').evaluate(e=>getComputedStyle(e).outlineStyle),'none');
 await page.keyboard.press('Enter');assert.equal((await page.evaluate(()=>rangeTest.selection().queue)).length,337);
 await page.evaluate(()=>{rangeTest.render();document.documentElement.classList.add('flashcards-night');});
 assert.equal(await page.locator('[data-range-world="10"] .range-choice').first().evaluate(e=>getComputedStyle(e).backgroundImage),'none');
 await page.locator('.range-worlds').screenshot({style:'.topbar { visibility:hidden !important; }',path:path.join(out,'embedded-night.png')});
 assert.deepEqual(errors,[]);
 const result={languages:['en',...languages],buttons:40,medalsPerRow:5,gemsPerRow:4,ribbonVariants:11,gemColors:9,clover:true,desktopSpacers:18,completion:'green-only; red wins; empty never complete',accountIsolation:true,languageIsolation:true,reload:true,rangeClicks:true,standardModes:true,remainderRanges:true,partialRange:true,phoneTabletAndEmbedded:true,nightMode:true,keyboard:true,reducedMotion:true,errors};
 fs.writeFileSync(path.join(out,'checks.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{await browser?.close();server.close();});
