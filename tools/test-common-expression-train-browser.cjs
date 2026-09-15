// Run with: node tools/test-common-expression-map-browser.cjs
// Uses a local fixture account; no student service is contacted.
const path = require('node:path');
const http = require('node:http');
let playwright;
try { playwright = require(process.env.PLAYWRIGHT_MODULE || 'playwright'); }
catch { playwright = require(path.join(process.env.HOME, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')); }
const { chromium } = playwright;
const fs = require('fs');
const assert = require('assert/strict');
const root=path.resolve(__dirname,'..');
const system='business-speaking';
const written=system==='written', coast=system==='rhetorical-speaking';
const lessonCount=26, last=lessonCount-1, lastId=`common-expression-${lessonCount}`;
const artifactDir=process.env.MAP_TEST_ARTIFACTS || '/private/tmp/train-qa';
fs.mkdirSync(artifactDir,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.json':'application/json'};
const server=http.createServer((req,res)=>{
 const target=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
 if(!target.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(target,(error,body)=>{if(error){res.writeHead(404).end();return;}res.setHeader('Content-Type',types[path.extname(target)]||'application/octet-stream');res.end(body);});
});
let browser;
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const origin=`http://127.0.0.1:${server.address().port}`;
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1050},deviceScaleFactor:1});
 const page=await context.newPage();
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.route('**/common-expression-system.js?*',route=>route.fulfill({contentType:'text/javascript',body:fs.readFileSync(root+'/common-expression-system.js','utf8').replace('initialise();','')+`\nwindow.mapTest={ login(id='map-test-a'){state.user={id,name:'Map Preview'};state.token='local-fixture';renderDashboard();showView('dashboard',{scroll:false});}, dashboard:openDashboard, setProgress(index,count){const lesson=SYSTEM.lessons[index];const saved=lessonState(lesson.id);saved.answers=Object.fromEntries(lesson.questions.slice(0,count).map(q=>[q.id,{correct:true}]));}, logout(){clearSession();showView('login',{scroll:false});}, lessons:SYSTEM.lessons, state };`}));
 for(const file of ['shared-system-nav.js','pwa-register.js','shared-speaking-practice.js']) await page.route(`**/${file}*`,route=>route.fulfill({contentType:'text/javascript',body:''}));
 await page.route('https://**/*',route=>route.abort());

 await page.goto(origin+'/common-expression-business-speaking.html');
 await page.waitForFunction(()=>window.mapTest);await page.evaluate(()=>mapTest.login());
 await page.waitForSelector('.airport-motion');await page.locator('[data-expression-map]').scrollIntoViewIfNeeded();
 await page.waitForFunction(()=>Number(document.querySelector('.airport-motion').dataset.seconds)>.5);
 assert.equal(await page.locator('[data-map-level]').count(),26);assert.equal(await page.locator('.airport-reserved').count(),4);
 assert.equal(await page.locator('.expression-map-picker option').count(),26);
 await page.locator('[data-expression-map]').screenshot({path:artifactDir+'/normal.png'});
 const a=await page.locator('.airport-motion').evaluate(c=>c.toDataURL());
 const board=await page.locator('.airport-departures').innerText();await page.waitForTimeout(1800);
 assert.notEqual(await page.locator('.airport-motion').evaluate(c=>c.toDataURL()),a);
 assert.notEqual(await page.locator('.airport-departures').innerText(),board);
 await page.locator('.expression-map-picker select').selectOption({index:25});await page.waitForTimeout(3400);
 assert.equal(await page.locator('[data-map-level="25"]').getAttribute('data-arrived'),'true');
 await page.locator('[data-save-location]').click();
 await page.locator('.expression-map-header').evaluate(e=>window.scrollTo({top:window.scrollY+e.getBoundingClientRect().top-110,behavior:'instant'}));await page.waitForTimeout(120);
 await page.locator('[data-character="elsie"]').click();
 await page.locator('[data-map-open]').click();assert.ok(page.url().includes('lesson=common-expression-26'));
 const stopped=await page.locator('.airport-motion').getAttribute('data-seconds');await page.waitForTimeout(150);assert.equal(await page.locator('.airport-motion').getAttribute('data-seconds'),stopped);
 await page.evaluate(()=>{mapTest.setProgress(25,3);mapTest.dashboard();});await page.waitForTimeout(150);
 assert.equal(await page.locator('[data-map-level="25"] .expression-map-stone-status').textContent(),'3/30');
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(150);
 for(let i=0;i<26;i++){
  await page.locator('.expression-map-picker select').selectOption({index:i});
  await page.locator('[data-map-open]').click();assert.ok(page.url().includes('lesson='+String(await page.evaluate(i=>mapTest.lessons[i].id,i))));
  await page.locator('[data-back-dashboard]').click();
 }
 await page.locator('[data-map-overview]').click();await page.waitForTimeout(200);
 await page.locator('[data-expression-map]').screenshot({path:artifactDir+'/overview.png'});
 const still=await page.locator('.airport-motion').evaluate(c=>c.toDataURL());await page.waitForTimeout(200);assert.equal(await page.locator('.airport-motion').evaluate(c=>c.toDataURL()),still);
 await page.evaluate(()=>{mapTest.logout();mapTest.login('map-test-b');});await page.waitForTimeout(150);
 assert.equal(await page.locator('.expression-map-flag').isVisible(),false);
 await page.evaluate(()=>{mapTest.logout();mapTest.login('map-test-a');});await page.waitForTimeout(150);
 assert.equal(await page.locator('[data-character="elsie"]').getAttribute('aria-pressed'),'true');
 assert.equal(await page.locator('.expression-map-flag').getAttribute('data-flag-level'),'common-expression-26');
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(200);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.locator('[data-expression-map]').screenshot({path:artifactDir+'/phone.png'});

 await page.setViewportSize({width:1600,height:1300});
 const evidence=await page.evaluate(async()=>{
  const {BUSINESS_AIRPORT,AIRPORT_INVENTORY}=await import('./common-expression-airport.mjs?v=20260915-poker2');
  const root=document.createElement('div');root.className='expression-map';root.dataset.theme='airport';root.style.cssText='position:relative;width:1600px;height:1200px';
  root.innerHTML='<div class="expression-map-heading"><small></small></div>'+BUSINESS_AIRPORT.terrain([],mapTest.lessons);document.body.append(root);
  const animation=BUSINESS_AIRPORT.mount(root,{matches:false});await new Promise(r=>setTimeout(r,100));
  const canvas=root.querySelector('canvas'),ctx=canvas.getContext('2d');
  const regions={runway:[100,290,1390,75]};
  AIRPORT_INVENTORY.plants.forEach((p,i)=>{regions['foliage'+i]=[p.x-70,p.y-p.h,140,p.h*.55];regions['pot'+i]=[p.x-12,p.y-22,24,20];});
  AIRPORT_INVENTORY.lamps.forEach((p,i)=>regions['lamp'+i]=[p.x-25,p.y-p.h,50,p.h]);
  function samples(){return Object.fromEntries(Object.entries(regions).map(([k,r])=>[k,Array.from(ctx.getImageData(...r).data)]));}
  animation.draw(1000);const before=samples();for(let i=1;i<=200;i++)animation.draw(1000+i*32);const after=samples();
  const changes=Object.fromEntries(Object.keys(before).map(k=>[k,before[k].reduce((n,v,i)=>n+(v!==after[k][i]),0)]));
  window.airportReview={root,animation,time:7400};return changes;
 });
 for(const [key,count] of Object.entries(evidence)){if(key.startsWith('pot'))assert.equal(count,0,key+' remains grounded');else assert.ok(count>20,key+' visibly animates');}
 fs.writeFileSync(artifactDir+'/motion-evidence.json',JSON.stringify(evidence,null,2));
 await page.evaluate(()=>{airportReview.root.scrollIntoView();});
 await page.locator('body > .expression-map').screenshot({path:artifactDir+'/motion-scene.png'});
 await page.evaluate(()=>{airportReview.animation.destroy();airportReview.root.remove();});

 await page.setViewportSize({width:1440,height:1100});await page.emulateMedia({reducedMotion:'no-preference'});
 await page.locator('.business-area-tabs').evaluate(e=>window.scrollTo({top:window.scrollY+e.getBoundingClientRect().top-110,behavior:'instant'}));await page.waitForTimeout(120);
 const previousStates=await page.evaluate(()=>JSON.stringify([...mapTest.state.states]));
 await page.locator('.business-area-tabs [data-business-area="train"]').click();await page.waitForTimeout(400);
 assert.equal(await page.locator('.train-platform').count(),30);
 const noSelect=await page.locator('.train-background').evaluate(img=>({selection:getComputedStyle(img).userSelect,draggable:img.draggable,selectBlocked:!img.dispatchEvent(new Event('selectstart',{bubbles:true,cancelable:true})),dragBlocked:!img.dispatchEvent(new Event('dragstart',{bubbles:true,cancelable:true}))}));
 assert.deepEqual(noSelect,{selection:'none',draggable:false,selectBlocked:true,dragBlocked:true});
 const vp=page.locator('.expression-map-viewport'),box=await vp.boundingBox();
 const scrollBefore=await vp.evaluate(e=>e.scrollTop);
 await page.mouse.move(box.x+box.width*.7,box.y+box.height*.45);await page.mouse.down();await page.mouse.move(box.x+box.width*.7,box.y+box.height*.25,{steps:12});await page.mouse.up();
 assert.equal(await page.evaluate(()=>getSelection().toString()),'');
 assert.ok(await vp.evaluate(e=>e.scrollTop)>scrollBefore,'Map still pans by dragging');
 await page.locator('.business-area-tabs [data-business-area="train"]').click();await page.waitForTimeout(250);

 assert.equal(await page.locator('[data-expression-map]').getAttribute('data-business-area'),'train');
 await page.locator('[data-expression-map]').screenshot({path:artifactDir+'/train-normal.png'});
 const moving=await page.locator('.train-motion').evaluate(c=>c.toDataURL());await page.waitForTimeout(1300);
 assert.notEqual(await page.locator('.train-motion').evaluate(c=>c.toDataURL()),moving);
 await page.locator('[data-train-platform="60"]').click();await page.waitForTimeout(3400);
 assert.match(await page.locator('.train-reservation-note').textContent(),/60/);
 assert.equal(await page.locator('[data-map-open]').isVisible(),false,'Reserved platform does not offer a fabricated lesson');
 assert.equal(await page.evaluate(()=>JSON.stringify([...mapTest.state.states])),previousStates);
 await page.locator('[data-map-overview]').click();await page.waitForTimeout(250);
 await page.locator('[data-expression-map]').screenshot({path:artifactDir+'/train-overview.png'});
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(150);const frozen=await page.locator('.train-motion').evaluate(c=>c.toDataURL());await page.waitForTimeout(150);assert.equal(await page.locator('.train-motion').evaluate(c=>c.toDataURL()),frozen);
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(150);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.locator('[data-expression-map]').screenshot({path:artifactDir+'/train-phone.png'});
 await page.locator('.business-area-tabs').evaluate(e=>window.scrollTo({top:window.scrollY+e.getBoundingClientRect().top-110,behavior:'instant'}));await page.waitForTimeout(120);
 await page.locator('[data-business-area="airport"]').click();assert.equal(await page.locator('[data-expression-map]').getAttribute('data-business-area'),'airport');
 await page.setViewportSize({width:1600,height:1300});
 const trainEvidence=await page.evaluate(async()=>{
  const {trainTerrain,mountTrain}=await import('./common-expression-train.mjs?v=20260915-poker1');const root=document.createElement('div');root.style.cssText='position:relative;width:1600px;height:1200px';root.id='train-review';root.innerHTML=trainTerrain();root.querySelector('section').style.top='0';document.body.append(root);const motion=mountTrain(root,{matches:false});await new Promise(r=>setTimeout(r,150));const c=root.querySelector('canvas'),ctx=c.getContext('2d');
  const regions={bigWindow:[120,120,300,140],smallWindow:[1190,90,55,140],curtain:[970,40,190,280],lamp:[130,335,110,80],steam:[258,355,40,78],wall:[680,415,100,70]};
  function samples(){return Object.fromEntries(Object.entries(regions).map(([k,r])=>[k,Array.from(ctx.getImageData(...r).data)]));}
  motion.draw(1000);const a=samples();for(let i=1;i<=250;i++)motion.draw(1000+i*32);const b=samples();window.trainReview={root,motion};return Object.fromEntries(Object.keys(a).map(k=>[k,a[k].reduce((n,v,i)=>n+(v!==b[k][i]),0)]));
 });
 for(const [key,count] of Object.entries(trainEvidence)){if(key==='wall')assert.equal(count,0);else assert.ok(count>20,key+' motion remains visible');}
 fs.writeFileSync(artifactDir+'/train-motion.json',JSON.stringify(trainEvidence,null,2));
 await page.locator('#train-review').screenshot({path:artifactDir+'/train-detail.png'});
 await page.evaluate(()=>{trainReview.motion.destroy();trainReview.root.remove();});

 await page.setViewportSize({width:1440,height:1100});await page.emulateMedia({reducedMotion:'no-preference'});
 await page.locator('.business-area-tabs').evaluate(e=>window.scrollTo({top:window.scrollY+e.getBoundingClientRect().top-110,behavior:'instant'}));
 await page.locator('.business-area-tabs [data-business-area="dining"]').click();await page.waitForTimeout(300);
 assert.equal(await page.locator('.dining-platform').count(),30);assert.equal(await page.locator('.dining-place-setting').count(),30);assert.ok(await page.locator('.dining-place-setting').evaluateAll(images=>images.every(img=>img.complete&&img.naturalWidth>0))); assert.equal(await page.locator('.business-theme-mist').count(),3);
 assert.equal(await page.locator('[data-expression-map]').getAttribute('data-business-area'),'dining');
 await page.locator('[data-map-overview]').click();await page.waitForTimeout(150);
 await page.locator('[data-dining-platform="90"]').click();await page.waitForTimeout(3400);
 assert.match(await page.locator('.train-reservation-note').textContent(),/90/);assert.equal(await page.locator('[data-map-open]').isVisible(),false);
 assert.equal(await page.evaluate(()=>JSON.stringify([...mapTest.state.states])),previousStates);
 await page.locator('[data-expression-map]').screenshot({path:artifactDir+'/dining-overview.png'});
 const diningA=await page.locator('.dining-motion').evaluate(c=>c.toDataURL());await page.waitForTimeout(1100);assert.notEqual(await page.locator('.dining-motion').evaluate(c=>c.toDataURL()),diningA);
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(100);const diningStill=await page.locator('.dining-motion').evaluate(c=>c.toDataURL());await page.waitForTimeout(150);assert.equal(await page.locator('.dining-motion').evaluate(c=>c.toDataURL()),diningStill);
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(150);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.locator('[data-expression-map]').screenshot({path:artifactDir+'/dining-phone.png'});
 await page.setViewportSize({width:1600,height:1300});
 const diningEvidence=await page.evaluate(async()=>{
  const {diningTerrain,mountDining}=await import('./common-expression-dining.mjs?v=20260915-poker1');const root=document.createElement('div');root.style.cssText='position:relative;width:1600px;height:1200px';root.id='dining-review';root.innerHTML=diningTerrain();root.querySelector('section').style.top='0';document.body.append(root);const motion=mountDining(root,{matches:false});await new Promise(r=>setTimeout(r,100));const c=root.querySelector('canvas'),ctx=c.getContext('2d');
  const regions={window:[400,30,600,240],rose:[240,210,150,195],soup:[1170,340,120,150],coffee:[60,570,120,150],champagne:[956,385,44,76],wall:[750,350,100,60]};const samples=()=>Object.fromEntries(Object.entries(regions).map(([k,r])=>[k,Array.from(ctx.getImageData(...r).data)]));motion.draw(1000);const a=samples();for(let i=1;i<=240;i++)motion.draw(1000+i*32);const b=samples();window.diningReview={root,motion};return Object.fromEntries(Object.keys(a).map(k=>[k,a[k].reduce((n,v,i)=>n+(v!==b[k][i]),0)]));
 });
 for(const [key,count] of Object.entries(diningEvidence)){if(key==='wall')assert.equal(count,0);else assert.ok(count>20,key+' animation changes');}
 fs.writeFileSync(artifactDir+'/dining-motion.json',JSON.stringify(diningEvidence,null,2));await page.locator('#dining-review').screenshot({path:artifactDir+'/dining-detail.png'});
 await page.evaluate(()=>{diningReview.motion.destroy();diningReview.root.remove();});

 const folds=await page.locator('.dining-platform').evaluateAll(nodes=>nodes.map(n=>({n:Number(n.dataset.diningPlatform),fold:n.querySelector('img').dataset.fold,src:n.querySelector('img').src})));
 assert.ok(folds.every(p=>p.fold===(p.n%2?'single':'double')));assert.equal(new Set(folds.map(p=>p.src)).size,2);
 await page.setViewportSize({width:1440,height:1100});await page.emulateMedia({reducedMotion:'no-preference'});
 await page.locator('.business-area-tabs').evaluate(e=>window.scrollTo({top:window.scrollY+e.getBoundingClientRect().top-110,behavior:'instant'}));
 await page.locator('.business-area-tabs [data-business-area="poker"]').click();await page.waitForTimeout(200);
 assert.equal(await page.locator('.poker-platform').count(),30);assert.equal(await page.locator('.business-theme-mist').count(),3);assert.equal(await page.locator('.poker-platform[data-counter-kind="plaque"]').count(),5);
 assert.equal(await page.locator('[data-expression-map]').getAttribute('data-business-area'),'poker');
 await page.locator('[data-map-overview]').click();await page.locator('[data-poker-platform="120"]').click();await page.waitForTimeout(3400);
 assert.match(await page.locator('.train-reservation-note').textContent(),/120/);assert.equal(await page.locator('[data-map-open]').isVisible(),false);assert.equal(await page.evaluate(()=>JSON.stringify([...mapTest.state.states])),previousStates);
 await page.locator('[data-expression-map]').screenshot({path:artifactDir+'/poker-overview.png'});
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(100);const pokerStill=await page.locator('.poker-liquid').evaluate(c=>c.toDataURL());await page.waitForTimeout(150);assert.equal(await page.locator('.poker-liquid').evaluate(c=>c.toDataURL()),pokerStill);
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(150);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.locator('[data-expression-map]').screenshot({path:artifactDir+'/poker-phone.png'});
 await page.setViewportSize({width:1600,height:1300});
 const pokerEvidence=await page.evaluate(async()=>{
  const {pokerTerrain,mountPoker}=await import('./common-expression-poker.mjs?v=20260915-poker2');const root=document.createElement('div');root.style.cssText='position:relative;width:1600px;height:1200px';root.id='poker-review';root.innerHTML=pokerTerrain();root.querySelector('section').style.top='0';document.body.append(root);const motion=mountPoker(root,{matches:false});await new Promise(r=>setTimeout(r,100));const c=root.querySelector('canvas'),ctx=c.getContext('2d');const regions={martini:[220,135,190,100],whiskey:[1235,220,150,130],felt:[500,450,800,500],stem:[295,250,70,100]};const samples=()=>Object.fromEntries(Object.entries(regions).map(([k,r])=>[k,Array.from(ctx.getImageData(...r).data)]));motion.draw(1000);const a=samples();for(let i=1;i<=150;i++)motion.draw(1000+i*32);const b=samples();window.pokerReview={root,motion};return Object.fromEntries(Object.keys(a).map(k=>[k,a[k].reduce((n,v,i)=>n+(v!==b[k][i]),0)]));
 });
 assert.ok(pokerEvidence.martini>20&&pokerEvidence.whiskey>20);assert.equal(pokerEvidence.felt,0);assert.equal(pokerEvidence.stem,0);fs.writeFileSync(artifactDir+'/poker-motion.json',JSON.stringify(pokerEvidence,null,2));await page.locator('#poker-review').screenshot({path:artifactDir+'/poker-detail.png'});await page.evaluate(()=>{pokerReview.motion.destroy();pokerReview.root.remove();});
 assert.equal(errors.length,0,errors.join('\n'));
 console.log('Poker 91–120 and odd/even napkins passed. Only both liquids animate; felt and stems are static. Dining 61–90: moonlit window, rose, soup and coffee motion, reserved records and mobile passed. Train and airport browser: 30 reserved train platforms, unchanged records, synchronized outdoor motion, curtain/light/steam motion, static walls;  26 real lessons, 4 reserved platforms, motion, typing, pause, reduced motion, saved location, account separation and mobile containment passed.');
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{await browser?.close();server.close();});
