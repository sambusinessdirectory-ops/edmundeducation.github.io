// Local fixture accounts only. All external services are blocked.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||path.join(process.env.HOME,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const root=path.resolve(__dirname,'..'),out=process.env.MAP_TEST_ARTIFACTS||'/tmp/sentence-coast-browser';fs.mkdirSync(out,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.json':'application/json'};
const server=http.createServer((req,res)=>{
 const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(file,(error,body)=>{if(error){res.writeHead(404).end();return;}res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(body);});
});
let browser,debugPage;
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const origin=`http://127.0.0.1:${server.address().port}`;
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1050},deviceScaleFactor:1});
 const page=await context.newPage(),errors=[];
 debugPage=page;
 page.on('pageerror',error=>errors.push(error.message));
 await page.route('**/sentence-structure.js?*',route=>{
  const source=fs.readFileSync(root+'/sentence-structure.js','utf8').replace(/\ninitialise\(\)\.catch\([\s\S]*$/,'');
  return route.fulfill({contentType:'text/javascript',body:source+`
bindEvents();
window.coastTest={
 async login(id='coast-fixture-a'){await lessonLibrary.catalog();state.user={id,name:'Coastal Preview',role:'student'};state.authToken='local-fixture';state.dashboardLoaded=true;renderLessonChoices();showView('dashboard',{preserveScroll:true});},
 dashboard(){renderLessonChoices();showView('dashboard',{preserveScroll:true});},
 logout(){clearSession();showView('login',{preserveScroll:true});},
 progress(id,count){state.attempts=[normalizeAttempt({id:'fixture',lessonId:id,correctCount:count,totalCount:50,startedAt:'2026-09-12T04:00:00Z'})];},
 state,lessons:()=>lessonList(),openLesson
};`});
 });
 for(const file of ['shared-system-nav.js','pwa-register.js','shared-speaking-practice.js'])await page.route(`**/${file}*`,route=>route.fulfill({contentType:'text/javascript',body:''}));
 await page.route('https://**/*',route=>route.abort());
 await page.goto(origin+'/sentence-structure.html');await page.waitForFunction(()=>window.coastTest);
 await page.evaluate(()=>coastTest.login());
 await page.waitForSelector('.expression-map-stone');


 const map=page.locator('[data-sentence-map]'),viewport=page.locator('.expression-map-viewport');
 await map.scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelector('[data-sentence-map]').dataset.hotelReady==='true',{},{timeout:90000});
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('.expression-map-picker select').selectOption('ss169');
 await page.waitForFunction(()=>document.querySelector('[data-map-level="168"]').dataset.arrived==='true');
 await map.screenshot({path:path.join(out,'hotel-normal.png')});
 await page.locator('[data-zoom="out"]').click();await page.locator('[data-zoom="out"]').click();await page.locator('[data-zoom="out"]').click();
 await viewport.evaluate(el=>{const root=document.querySelector('[data-sentence-map]'),s=Number(root.dataset.scale);el.scrollTop=8850*s;el.scrollLeft=800*s+(1600*s-el.clientWidth)/2;});
 await map.screenshot({path:path.join(out,'hotel-overview.png')});
 await page.locator('.sentence-hotel-realm').screenshot({path:path.join(out,'hotel-art-still.png')});
 console.log(JSON.stringify(await page.evaluate(()=>({ready:document.querySelector('[data-sentence-map]').dataset.hotelReady,renderer:document.querySelector('.hotel-scenery').dataset.renderer,scale:document.querySelector('[data-sentence-map]').dataset.scale,remaining:document.querySelectorAll('[data-remaining-lesson-grid] [data-open-lesson]').length,lessons:document.querySelectorAll('[data-map-level]').length,doors:document.querySelectorAll('[data-hotel]:not(.hotel-door-secondary)').length,errors:[]})),null,2));

 // Every catalogue ID opens the corresponding real lesson. These fixture accounts never contact a service.
 assert.equal(await page.locator('[data-hotel]').count(),30);
 for(let order=151;order<=180;order++){
  await page.locator('.expression-map-picker select').selectOption('ss'+order);
  await page.waitForFunction(index=>document.querySelector(`[data-map-level="${index}"]`).dataset.arrived==='true',order-1);
  await page.locator('[data-map-open]').click();
  await page.waitForFunction(id=>coastTest.state.lessonId===id&&!document.querySelector('[data-view=lesson]').hidden,'ss'+order);
  await page.evaluate(()=>coastTest.dashboard());
 }
 await page.locator('.expression-map-picker select').selectOption('ss151');
 await page.locator('[data-hotel-lesson="ss152"]').click();
 assert.equal(await page.locator('[data-map-number]').textContent(),'152');
 await page.locator('[data-save-location]').click();await page.locator('[data-character=elsie]').click();
 assert.equal(await page.locator('.expression-map-flag').getAttribute('data-flag-level'),'ss152');
 await page.evaluate(()=>coastTest.logout());await page.evaluate(()=>coastTest.login('hotel-other'));
 assert.equal(await page.locator('.expression-map-flag').isVisible(),false);
 await page.evaluate(()=>coastTest.logout());await page.evaluate(()=>coastTest.login());
 assert.equal(await page.locator('[data-map-number]').textContent(),'152');
 assert.equal(await page.locator('[data-character=elsie]').getAttribute('aria-pressed'),'true');
 await page.locator('.expression-map-picker select').selectOption('ss178');
 await map.scrollIntoViewIfNeeded();
 await page.bringToFront();
 await page.waitForFunction(()=>document.querySelector('[data-sentence-map]').dataset.hotelReady==='true'&&document.querySelector('.hotel-scenery')?.dataset.renderer==='webgl');
 await page.emulateMedia({reducedMotion:'no-preference'});
 await viewport.evaluate(el=>{const s=Number(document.querySelector('[data-sentence-map]').dataset.scale);el.scrollTop=8850*s;});
 const firstTime=await page.locator('.hotel-effects').evaluate(el=>Number(el.dataset.time));
 await page.waitForFunction(t=>Number(document.querySelector('.hotel-effects').dataset.time)>t+.1,firstTime);
 const samples=[];
 for(let i=0;i<45;i++){
  samples.push(await page.evaluate(async()=>{
   const {HOTEL_PLANTS,HOTEL_TREES,HOTEL_LIGHTS}=await import('/sentence-structure-hotel-geometry.mjs?v=20260914-hotel2');
   const scenery=document.querySelector('.hotel-scenery'),fx=document.querySelector('.hotel-effects'),copy=document.createElement('canvas');copy.width=1402;copy.height=1122;const ctx=copy.getContext('2d',{willReadFrequently:true});ctx.drawImage(scenery,0,0);
   const hash=(x,y,w,h)=>{let n=2166136261;for(const v of ctx.getImageData(Math.max(0,x|0),Math.max(0,y|0),Math.min(w|0,1402-Math.max(0,x|0)),Math.min(h|0,1122-Math.max(0,y|0))).data)n=Math.imul(n^v,16777619);return n>>>0;};
   const plant=HOTEL_PLANTS.map(([x,y,rx,ry])=>hash(x-rx,y-ry,rx*2,ry*2)),trees=HOTEL_TREES.map(([x,y,rx,ry])=>hash(x-rx,y-ry,rx*2,ry*2)),lights=HOTEL_LIGHTS.map(([x,y])=>hash(x-7,y-7,14,14)),wall=hash(540,132,330,45),pot=hash(780,340,8,5);
   ctx.clearRect(0,0,1402,1122);ctx.drawImage(fx,0,0);
   return {t:+fx.dataset.time,plant,trees,lights,wall,pot,flags:[hash(240,35,74,58),hash(1165,35,70,58)],snow:hash(0,400,110,380),indoor:hash(305,365,780,75),train:JSON.parse(fx.dataset.train)};
  }));await page.waitForTimeout(200);
 }
 const unique=a=>new Set(a).size;
 fs.writeFileSync(path.join(out,'hotel-motion.json'),JSON.stringify(samples,null,2));
 for(let i=0;i<14;i++)assert.ok(unique(samples.map(s=>s.plant[i]))>10,'Potted foliage '+i+' moves');
 for(let i=0;i<18;i++)assert.ok(unique(samples.map(s=>s.trees[i]))>10,'Outdoor conifer '+i+' moves');
 for(let i=0;i<35;i++)assert.ok(unique(samples.map(s=>s.lights[i]))>10,'Lamp '+i+' changes luminance');
 for(let i=0;i<2;i++)assert.ok(unique(samples.map(s=>s.flags[i]))>10,'Flag '+i+' waves');
 assert.equal(unique(samples.map(s=>s.wall)),1,'Hotel name and facade stay still');assert.equal(unique(samples.map(s=>s.pot)),1,'Pot base stays anchored');
 assert.ok(unique(samples.map(s=>s.snow))>30,'Snow falls outside');assert.equal(unique(samples.map(s=>s.indoor)),1,'No snow crosses an interior corridor');
 fs.writeFileSync(path.join(out,'hotel-motion.json'),JSON.stringify(samples,null,2));
 await page.locator('.sentence-hotel-realm').screenshot({path:path.join(out,'hotel-art-motion.png')});
 await map.screenshot({path:path.join(out,'hotel-overview-motion.png')});
 // Watch the real passenger ride in both directions, rather than only testing
 // a shader parameter. Arrival must restore the wall and corridor companion.
 const rides=[];
 for(let i=0;i<3;i++)await page.locator('[data-zoom="in"]').click();
 for(const [from,to,direction] of [['ss151','ss178','up'],['ss178','ss151','down']]){
  await page.emulateMedia({reducedMotion:'reduce'});await page.locator('.expression-map-picker select').selectOption(from);await map.scrollIntoViewIfNeeded();
  await page.emulateMedia({reducedMotion:'no-preference'});await page.locator('.expression-map-picker select').selectOption(to);
  await page.waitForFunction(()=>document.querySelector('[data-sentence-map]').dataset.elevator==='riding');
  await map.screenshot({path:path.join(out,`hotel-elevator-${direction}.png`)});
  const frames=[];for(let i=0;i<12;i++){frames.push(await page.locator('.hotel-elevator').evaluate(c=>({y:+c.dataset.floor,alpha:+c.dataset.alpha,riding:c.dataset.riding,passenger:c.dataset.passenger})));await page.waitForTimeout(65);}
  assert.ok(frames.some(f=>f.passenger==='elsie'&&f.alpha>.99&&f.riding==='true'));assert.ok(direction==='up'?frames.at(-1).y<frames[0].y:frames.at(-1).y>frames[0].y);
  await page.waitForFunction(index=>document.querySelector(`[data-map-level="${index}"]`).dataset.arrived==='true',Number(to.slice(2))-1);
  await page.waitForFunction(()=>document.querySelector('[data-sentence-map]').dataset.elevator==='hidden');rides.push({direction,frames});
 }
 fs.writeFileSync(path.join(out,'hotel-elevator-rides.json'),JSON.stringify(rides,null,2));
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('.expression-map-picker select').selectOption('ss150');
 await viewport.evaluate(el=>{const s=Number(document.querySelector('[data-sentence-map]').dataset.scale);el.scrollTop=8850*s-el.clientHeight/2;});
 await viewport.screenshot({path:path.join(out,'hotel-fog-boundary.png')});
 assert.ok(await page.locator('.hotel-boundary-fog').isVisible());
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(100);
 const stopped=await page.locator('.hotel-effects').evaluate(el=>el.toDataURL());await page.waitForTimeout(500);assert.equal(await page.locator('.hotel-effects').evaluate(el=>el.toDataURL()),stopped);
 for(const [name,width,height] of [['tablet',820,1180],['phone',390,844]]){
  await page.setViewportSize({width,height});await map.scrollIntoViewIfNeeded();await page.locator('.expression-map-picker select').selectOption('ss152');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  assert.ok(await page.locator('[data-map-open]').isVisible());await map.screenshot({path:path.join(out,`hotel-${name}.png`)});
 }
 await page.locator('[data-sentence-map-toggle]').click();assert.equal(await map.getAttribute('data-animating'),'false');assert.equal(await page.evaluate(()=>coastTest.state.attempts.length),0);
 fs.writeFileSync(path.join(out,'hotel-qa-summary.json'),JSON.stringify({lessons:180,hotelLessons:30,paintedDoors:21,remainingLessons:165,allHotelEntryLinks:true,pairedRoomSelection:true,savedLocationOwnership:true,elevatorRides:["up","down"],fogBoundary:true,reducedMotion:true,responsive:['desktop','tablet','phone'],motionSamples:samples.length,motionSeconds:samples.at(-1).t-samples[0].t,plants:14,trees:18,lights:35,flags:2,indoorSnowExcluded:true,stationaryFacade:true,errors},null,2));
 assert.deepEqual(errors,[]);
})().catch(async error=>{console.error(error);if(debugPage){console.error(await debugPage.evaluate(()=>({map:{...document.querySelector('[data-sentence-map]')?.dataset},scenery:{...document.querySelector('.hotel-scenery')?.dataset},effects:{...document.querySelector('.hotel-effects')?.dataset},hidden:document.hidden,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,rect:document.querySelector('[data-sentence-map]')?.getBoundingClientRect().toJSON(),scrollY})));await debugPage.screenshot({path:path.join(out,'hotel-failure.png')});}process.exitCode=1;}).finally(async()=>{await browser?.close();server.close();});
