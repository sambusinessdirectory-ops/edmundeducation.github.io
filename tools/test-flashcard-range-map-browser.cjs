const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {server}=require('./flashcard-range-fixture.cjs');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||path.join(process.env.HOME,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const out=process.env.RANGE_MAP_QA_DIR||'/tmp/flashcard-map-qa';fs.mkdirSync(out,{recursive:true});
let browser;
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin=`http://127.0.0.1:${server.address().port}`;
 browser=await chromium.launch({headless:true});const context=await browser.newContext({viewport:{width:1440,height:1100},deviceScaleFactor:1});
 await context.route('https://**/*',route=>route.abort());
 for(const script of ['pwa-register.js','shared-system-nav.js','pronunciation-checker.js','flashcard-pronunciation.js','page-loader.js'])await context.route(`**/${script}*`,r=>r.fulfill({contentType:'text/javascript',body:''}));
 const page=await context.newPage(),errors=[];page.on('pageerror',error=>{errors.push(error.message);console.error('Page error:',error.message);});
 const visit=async(query='')=>{await page.goto(origin+'/flashcards.html'+query);await page.waitForSelector('#flashcard-range-map [data-map-level]');await page.waitForFunction(()=>[...document.querySelectorAll('#flashcard-range-map .range-object')].every(i=>i.complete&&i.naturalWidth));await page.locator('#flashcard-range-map').scrollIntoViewIfNeeded();};
 const map=page.locator('#flashcard-range-map'),viewport=map.locator('.expression-map-viewport');
 const select=async(id)=>{await map.locator('.expression-map-picker select').selectOption(id);await page.waitForFunction(id=>document.querySelector(`[data-platform-id="${id}"]`)?.dataset.arrived==='true',id,{timeout:12000});};
 const shot=async(name)=>{await page.mouse.move(0,0);await map.screenshot({path:path.join(out,name+'.png'),animations:'disabled',style:'.topbar,.custom-cursor{visibility:hidden!important}'});};
 await visit();assert.equal(await map.locator('[data-map-level]').count(),40);
 assert.equal(await page.locator('#flashcard-range-worlds').isVisible(),false);
 assert.equal(await map.locator('[data-collection="30"] [data-map-level]').count(),11);
 assert.equal(await map.locator('[data-collection="10"] [data-map-level]').count(),21);
 assert.equal(await map.locator('.fc-map-spacer').count(),18);
 await page.evaluate(()=>rangeTest.progress(Array.from({length:30},(_,i)=>String(i))));
 assert.equal(await map.locator('.range-completed').count(),4);
 const before=await map.locator('.expression-map-horse').evaluate(e=>({x:parseFloat(e.style.left),y:parseFloat(e.style.top)}));
 await map.locator('[data-platform-id="standard:3"] .range-object').click();
 await page.waitForFunction(()=>document.querySelector('#flashcard-range-map .expression-map-horse').dataset.moving==='true');
 await page.waitForTimeout(250);
 const during=await map.locator('.expression-map-horse').evaluate(e=>({x:parseFloat(e.style.left),y:parseFloat(e.style.top)}));
 assert.ok(Math.hypot(during.x-before.x,during.y-before.y)>20,'Character actually advances toward a clicked platform');
 assert.equal(await page.evaluate(()=>rangeTest.selection()),null,'Selecting a platform must not start a session before arrival');
 await page.waitForFunction(()=>document.querySelector('[data-platform-id="standard:3"]').dataset.arrived==='true');
 await shot('abacus-walk');
 await map.locator('[data-map-open]').click();assert.equal((await page.evaluate(()=>rangeTest.selection())).queue.length,20);
 assert.equal(await map.locator('.expression-map').getAttribute('data-animating'),'false');
 await page.evaluate(()=>rangeTest.render());
 await select('30:6');await shot('medals-walk');
 await map.locator('[data-map-open]').click();assert.deepEqual((await page.evaluate(()=>rangeTest.selection())).queue,Array.from({length:30},(_,i)=>i+180));
 await page.evaluate(()=>rangeTest.render());await select('10:5');await shot('clover-walk');
 // Save one standing location and switch the established directional companions.
 await map.locator('[data-character="phoebe"]').click();
 assert.equal(await map.locator('.expression-map-horse').getAttribute('aria-label'),'Phoebe');
 await map.locator('[data-save-location]').click();
 assert.equal(await map.locator('.expression-map-flag').getAttribute('data-flag-level'),'10:5');
 await page.reload();await page.waitForSelector('[data-platform-id="10:5"][data-arrived="true"]');
 assert.equal(await map.locator('.expression-map-horse').getAttribute('aria-label'),'Phoebe');
 await page.evaluate(()=>rangeTest.owner('Range Preview B'));
 assert.equal(await map.locator('.expression-map-horse').getAttribute('aria-label'),'Eddie');
 assert.equal(await map.locator('.expression-map-flag').isVisible(),false);
 assert.equal(await map.locator('.range-completed').count(),0);
 await page.evaluate(()=>rangeTest.owner('Range Preview A'));
 assert.equal(await map.locator('.expression-map-horse').getAttribute('aria-label'),'Phoebe');
 await map.locator('[data-character="elsie"]').click();assert.equal(await map.locator('.expression-map-horse').getAttribute('aria-label'),'Elsie');
 // Keyboard walking is scoped to the focused map and stops on blur.
 await viewport.focus();const x=await map.locator('.expression-map-horse').evaluate(e=>parseFloat(e.style.left));
 await page.keyboard.down('ArrowRight');await page.waitForTimeout(300);await page.keyboard.up('ArrowRight');
 assert.ok(await map.locator('.expression-map-horse').evaluate((e,start)=>parseFloat(e.style.left)>start+30,x));
 await viewport.blur();
 await page.emulateMedia({reducedMotion:'reduce'});await select('10:20');
 await map.locator('[data-map-open]').click();assert.equal((await page.evaluate(()=>rangeTest.selection())).queue.length,137);
 await page.evaluate(()=>rangeTest.render());await select('30:10');
 await map.locator('[data-map-open]').click();assert.equal((await page.evaluate(()=>rangeTest.selection())).queue.length,37);
 await page.evaluate(()=>{rangeTest.render();rangeTest.count(35);});
 assert.equal(await map.locator('[data-map-level]').count(),14);await select('30:1');
 await map.locator('[data-map-open]').click();assert.deepEqual((await page.evaluate(()=>rangeTest.selection())).queue,[30,31,32,33,34]);
 await page.evaluate(()=>rangeTest.count(0));assert.equal(await map.isVisible(),false);assert.equal(await page.locator('#flashcard-range-worlds .range-choice:disabled').count(),40);
 await page.evaluate(()=>rangeTest.count(337));
 // All seven editions mount a real walkable map with isolated preferences/progress.
 const languages=['en'];
 for(const language of ['it','fr','de','es','ja','ko']) {
  await visit('?language='+language);assert.equal(await map.locator('[data-map-level]').count(),40);
  assert.equal(await map.locator('.expression-map-horse').getAttribute('aria-label'),'Eddie');assert.equal(await map.locator('.range-completed').count(),0);
  await select('10:5');await map.locator('[data-character="elsie"]').click();await map.locator('[data-map-open]').click();
  assert.deepEqual((await page.evaluate(()=>rangeTest.selection())).queue,Array.from({length:10},(_,i)=>i+50));languages.push(language);
 }
 await visit('?language=fr');await page.evaluate(()=>rangeTest.progress(Array.from({length:337},(_,i)=>String(i))));
 await select('10:5');assert.equal(await map.locator('.range-completed').count(),40);await shot('gems-mastered');
 for(const width of [768,390]) {
  await page.setViewportSize({width,height:1000});await select('10:5');await shot('map-'+width);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await map.locator('[data-map-overview]').click();assert.equal(await map.locator('.expression-map').getAttribute('data-overview'),'true');
  await shot('overview-'+width);
 }
 await visit('?language=ja&embedded=1&source=reading');await select('30:2');await shot('embedded-map');
 await page.evaluate(()=>document.documentElement.classList.add('flashcards-night'));await shot('night-map');
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 assert.equal(await map.locator('[data-platform-id="30:2"]').evaluate(e=>getComputedStyle(e).backgroundImage),'none');
 // A fast-selection fallback still launches the original native range buttons.
 await map.locator('.fc-map-toggle').click();assert.equal(await page.locator('#flashcard-range-worlds').isVisible(),true);
 await page.locator('#flashcard-range-worlds [data-range-world="10"] [data-range-start="21"]').click();
 assert.deepEqual((await page.evaluate(()=>rangeTest.selection())).queue,Array.from({length:10},(_,i)=>i+20));
 assert.deepEqual(errors,[]);
 const checks={languages,destinations:40,clickToWalk:true,visibleDisplacement:true,startOnlyAfterArrival:true,companions:['Eddie','Phoebe','Elsie'],savedLocation:true,ownerIsolation:true,languageIsolation:true,keyboard:true,partialAndRemainderRanges:true,allCompletionRewards:true,reducedMotion:true,mobileAndEmbedded:true,overview:true,quickSelect:true,errors};
 fs.writeFileSync(path.join(out,'checks.json'),JSON.stringify(checks,null,2));console.log(JSON.stringify(checks,null,2));
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{await browser?.close();server.close();});
