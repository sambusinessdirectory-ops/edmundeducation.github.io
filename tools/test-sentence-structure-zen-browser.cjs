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
 assert.equal(await page.locator('.realm-connector,.zen-connector,.zen-route').count(),0,'Unrequested connecting strips are removed');
 assert.equal(await page.locator('.realm-cloud-border').count(),2);
 assert.ok(await page.locator('.realm-cloud-border i').first().evaluate(el=>parseFloat(getComputedStyle(el).filter.match(/blur\(([^p]+)/)[1])>=40),'Realm clouds have broad soft blur');
 await page.locator('.expression-map-picker select').selectOption('ss61');await page.waitForTimeout(3500);
 assert.equal(await page.locator('[data-map-level="60"]').getAttribute('data-arrived'),'true');
 await page.waitForFunction(()=>document.querySelector('.zen-living-scenery').dataset.renderer);
 await map.screenshot({path:path.join(out,'zen-entrance.png')});
 await page.evaluate(()=>{
  window.zenBlinkReview={active:true,peaks:Array(6).fill(0)};
  const sample=()=>{const s=window.zenBlinkReview;if(!s.active)return;document.querySelectorAll('.zen-koi-position canvas').forEach((c,i)=>{if(c.dataset.motion)s.peaks[i]=Math.max(s.peaks[i],JSON.parse(c.dataset.motion).blink);});requestAnimationFrame(sample);};requestAnimationFrame(sample);
 });
 const frames=[];
 for(let i=0;i<75;i++){
  frames.push(await page.evaluate(()=>{
   const hash=bytes=>{let h=2166136261;for(const b of bytes)h=Math.imul(h^b,16777619);return h;};
   const c=document.querySelector('.zen-living-scenery'),gl=c.getContext('webgl');
   const patch=(x,y,w,h)=>{const bytes=new Uint8Array(w*h*4);gl.readPixels(x,c.height-y-h,w,h,gl.RGBA,gl.UNSIGNED_BYTE,bytes);return hash(bytes);};
   return {time:+c.dataset.time,renderer:c.dataset.renderer,foliage:patch(470,92,144,145),water:[patch(660,425,90,26),patch(650,597,85,28),patch(917,782,80,26)],cloth:patch(983,89,110,90),door:patch(905,100,37,37),
    koi:[...document.querySelectorAll('.zen-koi-position')].map(el=>{const c=el.querySelector('canvas');return {pose:JSON.parse(el.dataset.pose),motion:JSON.parse(c.dataset.motion),hash:hash(c.getContext('2d').getImageData(0,0,c.width,c.height).data)};}),
    cat:(()=>{const c=document.querySelector('.zen-sleeping-cat');return {motion:JSON.parse(c.dataset.motion),hash:hash(c.getContext('2d').getImageData(0,0,c.width,c.height).data)};})(),
    leaves:[...document.querySelectorAll('.zen-lotus')].map(el=>parseFloat(el.style.transform.slice(7))),
    glow:[...document.querySelectorAll('.zen-lamp-glow')].map(el=>+getComputedStyle(el).opacity),
    smoke:getComputedStyle(document.querySelector('.zen-door-steam i')).transform,
    falling:getComputedStyle(document.querySelector('.zen-falling-leaves>span')).transform,
    currents:[...document.querySelectorAll('.zen-current')].map(el=>parseFloat(getComputedStyle(el).strokeDashoffset))};
  }));await page.waitForTimeout(200);
 }
 const peaks=await page.evaluate(()=>{window.zenBlinkReview.active=false;return window.zenBlinkReview.peaks;});
 fs.writeFileSync(path.join(out,'zen-motion.json'),JSON.stringify({peaks,frames},null,2));
 const range=a=>Math.max(...a)-Math.min(...a),distinct=a=>new Set(a).size;
 assert.equal(frames[0].renderer,'webgl');
 assert.ok(distinct(frames.map(f=>f.foliage))>30,'Foliage pixels visibly sway');
 assert.equal(distinct(frames.map(f=>f.door)),1,'Solid teahouse remains stationary');
 assert.ok(distinct(frames.map(f=>f.cloth))>30,'Noren cloth sways');
 for(let i=0;i<3;i++)assert.ok(distinct(frames.map(f=>f.water[i]))>30,'Pond '+i+' water pixels move');
 for(let i=0;i<6;i++){
  assert.ok(peaks[i]>.8,'Koi '+i+' blinks');
  assert.ok(distinct(frames.map(f=>f.koi[i].hash))>30,'Koi '+i+' renders continuous body bends');
  assert.ok(range(frames.map(f=>f.koi[i].pose.x))>8,'Koi '+i+' swims');
 }
 assert.ok(range(frames.map(f=>f.cat.motion.tail))>.12,'Sleeping bobtail wags');
 assert.ok(distinct(frames.map(f=>f.cat.hash))>30,'Cat breathing and tail change pixels');
 for(let i=0;i<9;i++){const delta=frames.at(-1).leaves[i]-frames[0].leaves[i];assert.ok(i%2?delta<-.2:delta>.2,'Lotus turns in its assigned direction');}
 for(let i=0;i<5;i++)assert.ok(range(frames.map(f=>f.glow[i]))>.12,'Lamp '+i+' bloom changes');
 assert.ok(distinct(frames.map(f=>f.smoke))>30,'A little steam drifts from the doorway');
 assert.ok(distinct(frames.map(f=>f.falling))>30,'Sparse maple leaves fall');
 assert.ok(range(frames.map(f=>f.currents[0]))>30,'Water current moves');
 // Screenshots of all requested details and the complete connected realm.
 await viewport.evaluate(el=>{el.scrollTop=3900*Number(document.querySelector('[data-sentence-map]').dataset.scale);});
 await map.screenshot({path:path.join(out,'zen-teahouse.png')});
 await page.locator('.zen-sleeping-cat').screenshot({path:path.join(out,'sleeping-cat.png')});
 const smokeReview=page.locator('.zen-door-steam');
 for(const time of [1800,4300,7100]){
  await smokeReview.evaluate((el,time)=>el.getAnimations({subtree:true}).forEach(a=>{a.pause();a.currentTime=time;}),time);
  const clip=await smokeReview.evaluate(el=>{const r=el.getBoundingClientRect();return {x:Math.max(0,r.left-80),y:Math.max(0,r.top-90),width:r.width+170,height:r.height+140};});
  await page.screenshot({path:path.join(out,`door-steam-${time}.png`),clip});
 }
 await smokeReview.evaluate(el=>el.getAnimations({subtree:true}).forEach(a=>a.play()));
 await page.locator('[data-save-location]').click();assert.equal(await page.locator('.expression-map-flag').getAttribute('data-flag-level'),'ss61');
 await page.locator('[data-character=phoebe]').click();assert.equal(await page.locator('.expression-map-flag.is-zen').count(),1);
 await page.evaluate(()=>coastTest.logout());await page.evaluate(()=>coastTest.login('zen-other'));assert.equal(await page.locator('.expression-map-flag').isVisible(),false);
 await page.evaluate(()=>coastTest.logout());await page.evaluate(()=>coastTest.login());
 await page.locator('.expression-map-lesson-card').waitFor({state:'visible'});assert.equal(await page.locator('[data-map-level="60"]').getAttribute('data-arrived'),'true');
 assert.equal(await page.locator('[data-character=phoebe]').getAttribute('aria-pressed'),'true');
 for(const id of ['ss60','ss61']){await page.locator('.expression-map-picker select').selectOption(id);await page.waitForTimeout(3500);assert.equal(await page.locator(`[data-map-level="${Number(id.slice(2))-1}"]`).getAttribute('data-arrived'),'true');}
 await viewport.evaluate(el=>{el.scrollTop=3650*Number(document.querySelector('[data-sentence-map]').dataset.scale);});await map.screenshot({path:path.join(out,'zen-cloud-border.png')});
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.locator('.expression-map-picker select').selectOption('ss90');await page.locator('[data-save-location]').click();assert.equal(await page.locator('.expression-map-flag').getAttribute('data-flag-level'),'ss90');
 await page.locator('[data-map-open]').click();await page.waitForFunction(()=>coastTest.state.lessonId==='ss90'&&!document.querySelector('[data-view=lesson]').hidden);await page.evaluate(()=>coastTest.dashboard());
 assert.equal(await page.locator('.zen-current').first().evaluate(el=>getComputedStyle(el).animationName),'none');
 assert.equal(await page.locator('.zen-falling-leaves').isVisible(),false);
 assert.equal(await page.evaluate(()=>coastTest.state.attempts.length),0,'Exploration writes no learning records');
 for(const [name,width,height] of [['desktop',1440,1050],['tablet',820,1180],['phone',390,844]]){
  await page.setViewportSize({width,height});await map.scrollIntoViewIfNeeded();await page.locator('.expression-map-picker select').selectOption('ss75');
  while(!await page.locator('[data-zoom=out]').isDisabled())await page.locator('[data-zoom=out]').click();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'No page overflow');
  const covered=await viewport.evaluate(el=>{const v=el.getBoundingClientRect(),a=document.querySelector('.zen-background').getBoundingClientRect();return a.left<=v.left+1&&a.right>=v.right-16;});assert.ok(covered,'Painted garden covers overview width');
  await map.screenshot({path:path.join(out,`zen-${name}-overview.png`)});
 }
 await page.locator('[data-sentence-map-toggle]').click();assert.equal(await map.getAttribute('data-animating'),'false');
 assert.deepEqual(errors,[]);console.log('PASS: 90-level map, all garden motion, koi blinks and turns, stationary cat, saved flags, realm travel, reduced motion and responsive overview');
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{await browser?.close();server.close();});
