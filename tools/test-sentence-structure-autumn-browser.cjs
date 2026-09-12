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

 const map=page.locator('[data-sentence-map]'),viewport=page.locator('.expression-map-viewport');
 await map.scrollIntoViewIfNeeded();await viewport.focus();
 assert.equal(await page.locator('.expression-map-stone').count(),90);
 assert.equal(await page.locator('[data-remaining-lesson-grid] [data-open-lesson]').count(),255);
 await page.locator('.expression-map-picker select').selectOption('ss31');await page.waitForTimeout(3400);
 assert.equal(await page.locator('[data-map-level="30"]').getAttribute('data-arrived'),'true');
 await viewport.evaluate(el=>{el.scrollTop=1950*Number(document.querySelector('[data-sentence-map]').dataset.scale);});
 await page.waitForTimeout(500);await map.screenshot({path:path.join(out,'autumn-entrance.png')});
 const frames=[];
 // Sample brief eyelid closures at display cadence; 250ms screenshots can miss a blink.
 await page.evaluate(()=>{window.rabbitBlinkReview={active:true,max:0};const sample=()=>{const s=window.rabbitBlinkReview;if(!s.active)return;s.max=Math.max(s.max,JSON.parse(document.querySelector('.autumn-rabbit').dataset.motion).blink);requestAnimationFrame(sample);};requestAnimationFrame(sample);});
 for(let i=0;i<52;i++){
  frames.push(await page.evaluate(()=>{
   const c=document.querySelector('.autumn-rabbit'),bytes=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let hash=2166136261;for(const b of bytes)hash=Math.imul(hash^b,16777619);
   const tx=s=>new DOMMatrix(getComputedStyle(document.querySelector(s)).transform).e;
   return {hash,motion:JSON.parse(c.dataset.motion),river:tx('.autumn-river-surface'),fog:tx('.autumn-far-fog i'),glow:+getComputedStyle(document.querySelector('.autumn-window-glow')).opacity,leaf:getComputedStyle(document.querySelector('.autumn-leaves>span')).transform,current:+getComputedStyle(document.querySelector('.autumn-current')).strokeDashoffset.replace('px','')};
  }));await page.waitForTimeout(250);
 }
 const range=a=>Math.max(...a)-Math.min(...a);
 assert.ok(new Set(frames.map(f=>f.hash)).size>35,'Rabbit paints coherent intermediate frames');
 const blinkPeak=await page.evaluate(()=>{window.rabbitBlinkReview.active=false;return window.rabbitBlinkReview.max;});
 assert.ok(blinkPeak>.8,'Rabbit visibly blinks');
 for(const key of ['left','right'])assert.ok(range(frames.map(f=>f.motion[key]))>.06,key+' ear wags');
 assert.ok(range(frames.map(f=>f.river))>2,'River surface flows');
 assert.ok(range(frames.map(f=>f.current))>50,'Current runs downstream');
 assert.ok(range(frames.map(f=>f.fog))>4,'Distant fog drifts');
 assert.ok(range(frames.map(f=>f.glow))>.12,'Window bloom breathes gently');
 assert.ok(new Set(frames.map(f=>f.leaf)).size>30,'Leaves fall');
 fs.writeFileSync(path.join(out,'autumn-motion.json'),JSON.stringify(frames,null,2));
 // Render deterministic snapshots of the real rig at useful phases.
 await page.evaluate(async()=>{
  const {createAutumnRabbit,rabbitMotion}=await import('/sentence-structure-autumn-rabbit.mjs');const img=new Image();img.src='/assets/sentence-structure/autumn/rabbit.webp';await img.decode();const rig=createAutumnRabbit(img);
  const panel=document.createElement('div');panel.id='rabbit-review';panel.style='position:fixed;inset:0;z-index:99999;background:#b79b73;display:flex;align-items:center;justify-content:center;gap:10px';
  for(const t of [0,1.67,2.4,3.5,4.7]){const cell=document.createElement('div'),c=document.createElement('canvas');cell.style='text-align:center;font:16px sans-serif;color:#342716';c.width=360;c.height=350;c.style='width:230px';rig.paint(c,rabbitMotion(t));cell.append(c,`${t}s`);panel.append(cell);}document.body.append(panel);
 });
 await page.locator('#rabbit-review').screenshot({path:path.join(out,'rabbit-motion-review.png')});await page.locator('#rabbit-review').evaluate(el=>el.remove());
 await page.locator('[data-save-location]').click();
 assert.equal(await page.locator('.expression-map-flag').getAttribute('data-flag-level'),'ss31');
 await page.locator('[data-character=phoebe]').click();assert.equal(await page.locator('.expression-map-flag.is-autumn').count(),1);
 await page.evaluate(()=>{coastTest.logout();});await page.evaluate(()=>coastTest.login('autumn-other'));
 assert.equal(await page.locator('[data-character=eddy]').getAttribute('aria-pressed'),'true');
 assert.equal(await page.locator('.expression-map-flag').isVisible(),false);
 await page.evaluate(()=>coastTest.logout());await page.evaluate(()=>coastTest.login());
 assert.equal(await page.locator('[data-map-level="30"]').getAttribute('data-arrived'),'true');
 await page.locator('.expression-map-lesson-card').waitFor({state:'visible',timeout:4000});
 assert.equal(await page.locator('.expression-map-lesson-card').isVisible(),true,'Login centres the saved autumn stone');
 assert.equal(await page.locator('[data-character=phoebe]').getAttribute('aria-pressed'),'true');
 // Cross the penetrable realm border in both directions using real selector travel.
 for(const id of ['ss30','ss31','ss30','ss31']){await page.locator('.expression-map-picker select').selectOption(id);await page.waitForTimeout(3400);assert.equal(await page.locator(`[data-map-level="${Number(id.slice(2))-1}"]`).getAttribute('data-arrived'),'true');}
 await viewport.evaluate(el=>{el.scrollTop=1690*Number(document.querySelector('[data-sentence-map]').dataset.scale);});await map.screenshot({path:path.join(out,'realm-cloud-border.png')});
 // Walk through the mist with arrow keys, including camera-follow.
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('.expression-map-picker select').selectOption('ss30');
 await page.emulateMedia({reducedMotion:'no-preference'});await viewport.focus();
 await page.keyboard.down('ArrowDown');await page.waitForTimeout(1300);await page.keyboard.up('ArrowDown');
 const after=await page.locator('.expression-map-horse').evaluate(el=>parseFloat(el.style.top)+12);
 assert.ok(after>1950,'Keyboard walk passes through cloud border');
 await page.keyboard.down('ArrowUp');await page.waitForTimeout(1300);await page.keyboard.up('ArrowUp');
 assert.ok(await page.locator('.expression-map-horse').evaluate(el=>parseFloat(el.style.top)+12)<1950,'Keyboard returns to coast');
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('.expression-map-picker select').selectOption('ss60');
 await page.locator('[data-save-location]').click();
 assert.equal(await page.locator('.expression-map-flag').getAttribute('data-flag-level'),'ss60');
 await page.locator('[data-map-open]').click();await page.waitForFunction(()=>coastTest.state.lessonId==='ss60'&&!document.querySelector('[data-view=lesson]').hidden);await page.evaluate(()=>coastTest.dashboard());
 assert.equal(await page.locator('.autumn-current').first().evaluate(el=>getComputedStyle(el).animationName),'none');
 for(const [name,width,height] of [['desktop',1440,1050],['tablet',820,1180],['phone',390,844]]){
  await page.setViewportSize({width,height});await map.scrollIntoViewIfNeeded();
  await page.locator('.expression-map-picker select').selectOption('ss45');
  while(!await page.locator('[data-zoom=out]').isDisabled())await page.locator('[data-zoom=out]').click();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'No page overflow');
  const covered=await viewport.evaluate(el=>{const v=el.getBoundingClientRect(),a=document.querySelector('.autumn-background').getBoundingClientRect();return a.left<=v.left+1&&a.right>=v.right-16;});assert.ok(covered,'Painted autumn covers overview width');
  await map.screenshot({path:path.join(out,`autumn-${name}-overview.png`)});
 }
 assert.deepEqual(errors,[]);console.log('PASS: autumn realm, rabbit pixels and gestures, river/fog/bloom/leaves, border travel both ways, saved location and responsive painted overview');
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{await browser?.close();server.close();});
