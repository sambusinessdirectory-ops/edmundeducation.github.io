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
let browser;
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const origin=`http://127.0.0.1:${server.address().port}`;
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1050},deviceScaleFactor:1});
 const page=await context.newPage(),errors=[];
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
 const alpha=await page.evaluate(async()=>{
  const results={};
  for(const [name,points] of [['props',[[0,0],[300,300],[815,275],[808,670]]],['wildlife',[[0,0],[208,256],[512,260],[968,859]]]]){
   const image=new Image();image.src=`assets/sentence-structure/coast/${name}.webp`;await image.decode();
   const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
   const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);
   results[name]=points.map(([x,y])=>ctx.getImageData(x,y,1,1).data[3]);
  }
  return results;
 });
 assert.equal(alpha.props[0],0);assert.equal(alpha.wildlife[0],0);
 assert.ok(alpha.props[1]>245,'Stone paint is opaque');assert.equal(alpha.props[2],0,'Rigging gap is transparent');
 assert.ok(alpha.props[3]>220,'White flower petal is preserved');
 assert.ok(alpha.wildlife.slice(1).every(a=>a>240),'Grey and white feather details remain opaque');
 const map=page.locator('[data-sentence-map]'),viewport=page.locator('.expression-map-viewport');
 await map.scrollIntoViewIfNeeded();await viewport.focus();await page.waitForTimeout(800);
 assert.equal(await page.locator('.expression-map-stone').count(),90);
 assert.equal(await page.locator('[data-remaining-lesson-grid] [data-open-lesson]').count(),255);
 assert.equal(await page.locator('[data-lesson-choice-grid]').isVisible(),false);
 assert.equal(await page.locator('[data-sentence-remaining]').isVisible(),true);
 assert.equal(await page.locator('[data-zoom=out]').isDisabled(),false);
 assert.equal(await page.locator('[data-character=eddy]').getAttribute('aria-pressed'),'true');
 assert.deepEqual(await page.locator('[data-milestone]').evaluateAll(nodes=>nodes.map(n=>n.dataset.milestone)),['10','20','30','40','50','60','70','80','90']);
 await map.screenshot({path:path.join(out,'sentence-coast-initial.png')});
 // Review actual raster frames, not merely animation state attributes.
 await page.evaluate(async()=>{
  const {createShoreWildlife,flyingGullMotion,perchedGullMotion,crabMotion}=await import('/sentence-structure-shore-wildlife.mjs');
  const img=new Image();img.src='/assets/sentence-structure/coast/wildlife.webp';await img.decode();const rig=createShoreWildlife(img);
  const panel=document.createElement('div');panel.id='wildlife-review';panel.style='position:fixed;inset:0;z-index:99999;background:#aecad1;display:grid;grid-template-columns:repeat(8,1fr);align-content:center;gap:4px;padding:12px';
  for(const [kind,fn,times,size] of [['fly',flyingGullMotion,[1.5,1.8,2.1,2.4,2.7,3,3.3,3.6],.45],['perch',perchedGullMotion,[0,1.8,2.3,2.7,3.1,3.7,4.5,5.5],.44],['crab',crabMotion,[0,1.4,2,2.5,3.1,4.3,5.1,5.8],.45]]){
   for(const t of times){const cell=document.createElement('div');cell.style='text-align:center;color:#163647;font:14px sans-serif';const canvas=document.createElement('canvas');canvas.width=360;canvas.height=390;canvas.style='width:100%;height:auto';rig.paint(canvas,kind,fn(t),size);cell.append(canvas,`${kind} ${t.toFixed(1)}s`);panel.append(cell);}
  }
  document.body.append(panel);
 });
 await page.locator('#wildlife-review').screenshot({path:path.join(out,'wildlife-motion-review.png')});
 await page.locator('#wildlife-review').evaluate(el=>el.remove());
 if(process.env.RIG_REVIEW_ONLY)return;
 await page.locator('[data-save-location]').click();
 assert.equal(await page.locator('.expression-map-flag').getAttribute('data-flag-level'),'ss1');
 const samples=[];
 for(let i=0;i<8;i++) {
  samples.push(await page.evaluate(()=>{
   const tx=s=>{const m=new DOMMatrix(getComputedStyle(document.querySelector(s)).transform);return [m.e,m.f];};
   return {boat:tx('.shore-boat'),clouds:[...document.querySelectorAll('.shore-cloud')].map(el=>new DOMMatrix(getComputedStyle(el).transform).e),ocean:tx('.shore-ocean-surface'),stream:tx('.shore-stream-surface'),gulls:[...document.querySelectorAll('.shore-flying-gull')].map(el=>new DOMMatrix(getComputedStyle(el).transform).e),plants:[...document.querySelectorAll('.shore-plant')].map(el=>{const m=new DOMMatrix(getComputedStyle(el.firstElementChild).transform);return {kind:el.dataset.plant,tip:m.b*parseFloat(el.style.height)};}),foam:[...document.querySelectorAll('.shore-foam')].map(el=>+getComputedStyle(el).opacity)};
  }));
  await page.waitForTimeout(700);
 }
 const range=values=>Math.max(...values)-Math.min(...values);
 assert.ok(range(samples.map(s=>s.boat[0]))>9,'Boat visibly glides over five seconds');
 const cloudMovement=samples[7].clouds.map((v,i)=>v-samples[0].clouds[i]);
 assert.ok(cloudMovement.some(v=>v>5)&&cloudMovement.some(v=>v< -5),'Varied clouds drift in opposed directions');
 assert.ok(range(samples.map(s=>s.ocean[0]))>1);assert.ok(range(samples.map(s=>s.stream[0]))>1);
 assert.ok(range(samples.map(s=>s.gulls[0]))>20);
 assert.ok(range(samples.map(s=>s.foam[0]))>.1);
 for(const kind of ['grass','daisies','shrub']){
  const indices=samples[0].plants.map((p,i)=>p.kind===kind?i:-1).filter(i=>i>=0);
  assert.ok(indices.some(i=>range(samples.map(s=>s.plants[i].tip))>2),kind+' visibly rocks');
 }
 fs.writeFileSync(path.join(out,'motion-measurements.json'),JSON.stringify({samples,cloudMovement},null,2));
 // Verify a visible map continues animating after keyboard focus leaves it.
 await page.evaluate(()=>window.dispatchEvent(new Event('blur')));assert.equal(await map.getAttribute('data-animating'),'true');
 await page.locator('.expression-map-picker select').selectOption('ss30');await page.waitForTimeout(100);
 assert.equal(await page.locator('[data-save-location]').isDisabled(),true);
 assert.equal(await page.locator('.expression-map-lesson-card').isVisible(),false);
 await page.waitForTimeout(3400);
 assert.equal(await page.locator('[data-map-level="29"]').getAttribute('data-arrived'),'true');
 assert.equal(await page.locator('.expression-map-lesson-card').isVisible(),true);
 await page.locator('[data-save-location]').click();
 for(const [character,color] of [['eddy','rgb(200, 68, 56)'],['phoebe','rgb(181, 160, 220)'],['elsie','rgb(237, 200, 74)']]){
  await page.locator(`[data-character="${character}"]`).click();
  assert.equal(await page.locator('.expression-map-flag-cloth').evaluate(el=>getComputedStyle(el).fill),color);
 }
 await page.evaluate(()=>coastTest.progress('ss30',3));await page.evaluate(()=>coastTest.dashboard());
 assert.equal(await page.locator('[data-map-level="29"] .expression-map-stone-status').textContent(),'3/50');
 await map.screenshot({path:path.join(out,'sentence-coast-level30.png')});
 await page.locator('[data-map-open]').click();await page.waitForSelector('[data-view="lesson"]:not([hidden])');
 assert.match(await page.locator('[data-lesson-title]').textContent(),/As/);
 await page.evaluate(()=>coastTest.dashboard());
 await page.locator('[data-sentence-map-toggle]').click();
 assert.equal(await page.locator('[data-lesson-choice-grid]').isVisible(),true);
 assert.equal(await page.locator('[data-remaining-lesson-grid]').isVisible(),true);
 await page.locator('[data-remaining-lesson-grid] [data-open-lesson="ss91"]').click();
 await page.waitForFunction(()=>coastTest.state.lessonId==='ss91'&&!document.querySelector('[data-view="lesson"]').hidden&&document.querySelector('[data-lesson-title]').textContent.includes('Superlative'));
 assert.equal(await page.evaluate(()=>coastTest.state.lessonId),'ss91');
 await page.evaluate(()=>coastTest.dashboard());await page.locator('[data-sentence-map-toggle]').click();
 await page.evaluate(()=>{coastTest.logout();});await page.evaluate(()=>coastTest.login('coast-fixture-b'));
 assert.equal(await page.locator('[data-character=eddy]').getAttribute('aria-pressed'),'true');
 assert.equal(await page.locator('.expression-map-flag').isVisible(),false);
 await page.evaluate(()=>coastTest.logout());await page.evaluate(()=>coastTest.login());
 assert.equal(await page.locator('.expression-map-flag').getAttribute('data-flag-level'),'ss30');
 assert.equal(await page.locator('[data-map-level="29"]').getAttribute('data-arrived'),'true');
 assert.equal(await page.locator('[data-character=elsie]').getAttribute('aria-pressed'),'true');
 // Reduced motion is also used to verify every real lesson link without waiting for journeys.
 await page.emulateMedia({reducedMotion:'reduce'});
 for(let i=1;i<=90;i++){
  await page.locator('.expression-map-picker select').selectOption('ss'+i);
  await page.locator('[data-map-open]').click();
  await page.waitForFunction(id=>coastTest.state.lessonId===id&&!document.querySelector('[data-view="lesson"]').hidden,'ss'+i);
  assert.equal(await page.evaluate(()=>coastTest.state.lessonPage),1);
  await page.evaluate(()=>coastTest.dashboard());
 }
 assert.equal(await page.locator('.shore-cloud').first().evaluate(el=>getComputedStyle(el).animationName),'none');
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.locator('.expression-map-picker select').selectOption('ss18');await page.waitForTimeout(3400);
 await viewport.evaluate(el=>{el.scrollTop=720;el.scrollLeft=800*Number(document.querySelector('[data-sentence-map]').dataset.scale);});await page.waitForTimeout(500);
 await map.screenshot({path:path.join(out,'sentence-coast-stream.png')});
 const animalFrames=[];
 // A blink is shorter than the screenshot interval; observe it at display cadence.
 await page.evaluate(()=>{window.gullBlinkReview={active:true,max:0};const sample=()=>{const s=window.gullBlinkReview;if(!s.active)return;s.max=Math.max(s.max,JSON.parse(document.querySelector('.shore-perched-gull').dataset.motion).blink);requestAnimationFrame(sample);};requestAnimationFrame(sample);});
 for(let i=0;i<50;i++){
  animalFrames.push(await page.evaluate(()=>Object.fromEntries([['gull','.shore-perched-gull'],['crab','.shore-crab'],['fly','.shore-flying-gull']].map(([key,selector])=>{
   const el=document.querySelector(selector),bytes=el.getContext('2d').getImageData(0,0,el.width,el.height).data;
   let hash=2166136261;for(let n=0;n<bytes.length;n++)hash=Math.imul(hash^bytes[n],16777619);
   return [key,{motion:JSON.parse(el.dataset.motion),hash}];
  }))));
  await page.waitForTimeout(250);
 }
 fs.writeFileSync(path.join(out,'wildlife-poses.json'),JSON.stringify(animalFrames,null,2));
 const blinkPeak=await page.evaluate(()=>{window.gullBlinkReview.active=false;return window.gullBlinkReview.max;});
 assert.ok(blinkPeak>.2,'Gull blinks');
 assert.ok(animalFrames.some(p=>p.gull.motion.wing>.8),'Gull stretches its wing');
 assert.ok(animalFrames.some(p=>p.crab.motion.left>.8||p.crab.motion.right>.8),'Crab moves its claws');
 for(const kind of ['gull','crab','fly'])assert.ok(new Set(animalFrames.map(p=>p[kind].hash)).size>30,kind+' paints many distinct, cleared frames');
 // A wider painted surround allows genuine overview zoom with no blank edges.
 const beforeScale=Number(await map.getAttribute('data-scale'));
 while(!await page.locator('[data-zoom=out]').isDisabled())await page.locator('[data-zoom=out]').click();
 const afterScale=Number(await map.getAttribute('data-scale'));assert.ok(afterScale<beforeScale*.7);
 const coverage=await viewport.evaluate(el=>{const v=el.getBoundingClientRect(),a=document.querySelector('.shore-extension').getBoundingClientRect(),b=document.querySelector('.autumn-background').getBoundingClientRect();return {covered:[a,b].every(r=>r.left<=v.left+1&&r.right>=v.right-15)&&a.top<=v.top+1&&b.bottom>=v.bottom-15&&Math.abs(a.bottom-b.top)<=1};});
 assert.ok(coverage.covered,'Contiguous painted realms cover the overview viewport');
 await map.screenshot({path:path.join(out,'sentence-coast-overview.png')});
 await page.locator('[data-zoom=in]').click();
 for(const [name,width,height] of [['tablet',820,1180],['phone',390,844]]){
  await page.setViewportSize({width,height});await page.locator('.expression-map-picker select').selectOption('ss1');await page.waitForTimeout(3400);await map.scrollIntoViewIfNeeded();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'No horizontal page overflow');
  while(!await page.locator('[data-zoom=out]').isDisabled())await page.locator('[data-zoom=out]').click();
  assert.equal(await page.locator('[data-zoom=out]').isDisabled(),true);
  await map.screenshot({path:path.join(out,`sentence-coast-${name}.png`)});
  await page.locator('[data-zoom=in]').click();await page.locator('[data-zoom=out]').click();
  assert.equal(await page.locator('[data-zoom=out]').isDisabled(),true);
 }
 await page.locator('[data-sentence-map-toggle]').click();assert.equal(await map.getAttribute('data-animating'),'false');
 assert.deepEqual(errors,[]);
 console.log('PASS: first-90 map, 255 later lessons, all lesson links, progress, pins, account isolation, motion, reduced motion, zoom and responsive views');
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{await browser?.close();server.close();});
