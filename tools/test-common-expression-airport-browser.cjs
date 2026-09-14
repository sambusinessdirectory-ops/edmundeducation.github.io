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
const artifactDir=process.env.MAP_TEST_ARTIFACTS || '/private/tmp/airport-qa';
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
  const {BUSINESS_AIRPORT,AIRPORT_INVENTORY}=await import('./common-expression-airport.mjs?v=20260915-dining1');
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
 assert.equal(errors.length,0,errors.join('\n'));
 console.log('Airport browser: 26 real lessons, 4 reserved platforms, motion, typing, pause, reduced motion, saved location, account separation and mobile containment passed.');
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{await browser?.close();server.close();});
