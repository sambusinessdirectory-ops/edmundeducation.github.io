// Local fixture only: no student services, credentials or learning writes.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||path.join(process.env.HOME,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const sharp=require(path.join(process.env.HOME,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp'));
const root=path.resolve(__dirname,'..'),out=process.env.MAP_TEST_ARTIFACTS||'/tmp/phrasal-desert-review';fs.mkdirSync(out,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.json':'application/json'};
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(err,body)=>{if(err){res.writeHead(404).end();return;}res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(body);});});
let browser;
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const origin=`http://127.0.0.1:${server.address().port}`;
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1050},deviceScaleFactor:1});
 const errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/phrasal-verb-system.js?*',route=>{
  const source=fs.readFileSync(root+'/phrasal-verb-system.js','utf8').replace(/\ninitialise\(\)\.catch\([\s\S]*$/,'');
  return route.fulfill({contentType:'text/javascript',body:source+`\nbindEvents();window.desertTest={login(id='desert-fixture-a'){state.user={id,name:'Desert Preview',role:'student'};state.authToken='local-fixture';state.dashboardLoaded=true;renderLessonChoices();showView('dashboard',{preserveScroll:true});},dashboard(){renderLessonChoices();showView('dashboard',{preserveScroll:true});},logout(){clearSession();showView('login',{preserveScroll:true});},state,lessons:()=>lessonList(),openLesson};`});
 });
 for(const file of ['shared-system-nav.js','pwa-register.js','shared-speaking-practice.js'])await page.route(`**/${file}*`,route=>route.fulfill({contentType:'text/javascript',body:''}));
 await page.route('https://**/*',route=>{requests.push(route.request().url());return route.abort();});
 await page.goto(origin+'/phrasal-verb-system.html');await page.waitForFunction(()=>window.desertTest);await page.evaluate(()=>desertTest.login());
 const map=page.locator('[data-phrasal-map]'),viewport=page.locator('.expression-map-viewport');
 await page.waitForSelector('.desert-plant');await map.scrollIntoViewIfNeeded();await viewport.focus();await page.waitForTimeout(1800);
 assert.equal(await page.locator('.expression-map-stone').count(),329);
 assert.equal(await page.locator('.desert-tumbleweed').count(),2);
 await map.screenshot({path:path.join(out,'desert-standard.png')});
 fs.writeFileSync(path.join(out,'framing.json'),JSON.stringify(await page.evaluate(()=>{const r=document.querySelector('[data-phrasal-map]'),v=r.querySelector('.expression-map-viewport');return {viewport:[innerWidth,innerHeight],map:[v.clientWidth,v.clientHeight],scale:+r.dataset.scale,scroll:[v.scrollLeft,v.scrollTop],plantCount:r.querySelectorAll('.desert-plant').length};}),null,2));
 if(process.env.PREVIEW_ONLY)return;
 const pixelStart=await viewport.screenshot();
 const motion=[];
 for(let i=0;i<10;i++){
  motion.push(await page.evaluate(()=>({weeds:[...document.querySelectorAll('.desert-tumbleweed')].map(e=>JSON.parse(e.dataset.motion)),plants:[...document.querySelectorAll('.desert-foliage')].slice(0,26).map(e=>new DOMMatrix(getComputedStyle(e).transform).c*parseFloat(e.parentElement.style.height)),clouds:[...document.querySelectorAll('.desert-cloud')].map(e=>new DOMMatrix(getComputedStyle(e).transform).e),water:[...document.querySelectorAll('.desert-water-surface')].map(e=>new DOMMatrix(getComputedStyle(e).transform).e)})));
  await page.waitForTimeout(650);
 }
 const range=a=>Math.max(...a)-Math.min(...a);
 assert.ok(motion.at(-1).weeds[0].x>motion[0].weeds[0].x+40);
 assert.ok(motion.at(-1).weeds[1].x<motion[0].weeds[1].x-40);
 for(let i=0;i<26;i++)assert.ok(range(motion.map(s=>s.plants[i]))>1.4,`Plant ${i} visibly sways`);
 for(let i=0;i<3;i++)assert.ok(range(motion.map(s=>s.clouds[i]))>5,`Cloud ${i} moves`);
 for(let i=0;i<2;i++)assert.ok(range(motion.map(s=>s.water[i]))>1,`Pond ${i} moves`);
 fs.writeFileSync(path.join(out,'motion.json'),JSON.stringify(motion,null,2));
 const pixelEnd=await viewport.screenshot(),pixelRegions={};
 const scale=Number(await map.getAttribute('data-scale'));
 for(const [name,x,y,width,height] of [['palm',268,127,145,130],['cloud',140,10,240,62],['far-water',1010,232,90,25],['near-water',752,455,90,25],['tent',432,177,58,26],['ruins',1100,85,72,55]]){
  const region={left:Math.round(x*scale),top:Math.round(y*scale),width:Math.floor(width*scale),height:Math.floor(height*scale)};
  const [a,b]=await Promise.all([sharp(pixelStart).extract(region).removeAlpha().raw().toBuffer(),sharp(pixelEnd).extract(region).removeAlpha().raw().toBuffer()]);
  let changed=0,sum=0;for(let i=0;i<a.length;i++){const d=Math.abs(a[i]-b[i]);sum+=d;if(d>8)changed++;}
  pixelRegions[name]={changedFraction:changed/a.length,meanDelta:sum/a.length};
  if(['tent','ruins'].includes(name))assert.equal(changed,0,`${name} remains stationary`);else assert.ok(changed/a.length>.015,`${name} changes rendered pixels`);
 }
 fs.writeFileSync(path.join(out,'rendered-motion.json'),JSON.stringify(pixelRegions,null,2));
 await map.screenshot({path:path.join(out,'desert-motion-later.png')});
 if(process.env.GRAPHICS_ONLY){
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const [name,width,height] of [['desktop',1440,1050],['tablet',820,1180],['phone',390,844]]){
   await page.setViewportSize({width,height});await page.reload();await page.waitForFunction(()=>window.desertTest);await page.evaluate(()=>desertTest.login());await page.waitForSelector('.expression-map-stone');await map.scrollIntoViewIfNeeded();await page.waitForTimeout(400);
   assert.equal(await map.getAttribute('data-zoom'),'1','Fresh viewport uses the original standard zoom');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   await map.screenshot({path:path.join(out,`desert-${name}.png`)});
   while(!await page.locator('[data-zoom=out]').isDisabled())await page.locator('[data-zoom=out]').click();
   await map.screenshot({path:path.join(out,`desert-${name}-overview.png`)});
  }
  console.log('PASS: rendered motion, stationary landmarks and responsive graphics');return;
 }
 await page.locator('[data-save-location]').click();assert.equal(await page.locator('.expression-map-flag').getAttribute('data-flag-level'),'phrasal-verb-01');
 await page.locator('.expression-map-picker select').selectOption('phrasal-verb-14');await page.waitForTimeout(3400);
 assert.equal(await page.locator('[data-map-open]').isVisible(),true);
 assert.equal(await page.locator('.expression-map-flag').getAttribute('data-flag-level'),'phrasal-verb-01');
 await page.locator('[data-save-location]').click();await page.locator('[data-character=elsie]').click();
 await page.evaluate(()=>{desertTest.state.attempts=[{lessonId:'phrasal-verb-14',status:'completed',correctCount:70}];desertTest.dashboard();});
 assert.equal(await page.locator('[data-map-level="13"]').getAttribute('data-complete'),'true');
 await page.evaluate(()=>{desertTest.logout();desertTest.login('desert-fixture-b');});
 assert.equal(await page.locator('[data-character=eddy]').getAttribute('aria-pressed'),'true');assert.equal(await page.locator('.expression-map-flag').isVisible(),false);
 await page.evaluate(()=>{desertTest.logout();desertTest.login();});
 assert.equal(await page.locator('[data-character=elsie]').getAttribute('aria-pressed'),'true');assert.equal(await page.locator('.expression-map-flag').getAttribute('data-flag-level'),'phrasal-verb-14');
 await page.emulateMedia({reducedMotion:'reduce'});
 const catalogue=await page.evaluate(()=>desertTest.lessons().map(l=>({id:l.id,title:l.title||l.titleZh})));
 for(const lesson of catalogue){
  await page.locator('.expression-map-picker select').selectOption(lesson.id);
  assert.equal(await page.locator('[data-map-open]').isVisible(),true,`${lesson.id} entry is reachable`);
  await page.locator('[data-map-open]').click();await page.waitForFunction(id=>desertTest.state.lessonId===id&&!document.querySelector('[data-view="lesson"]').hidden,lesson.id);
  assert.equal(await page.evaluate(()=>desertTest.state.lessonPage),1);
  assert.equal(await page.locator('[data-lesson-title]').textContent(),lesson.title,`${lesson.id} opens its real title`);
  await page.evaluate(()=>desertTest.dashboard());
  if((catalogue.indexOf(lesson)+1)%50===0)console.log(`Verified ${catalogue.indexOf(lesson)+1} lesson entries`);
 }
 await map.screenshot({path:path.join(out,'desert-final-lesson.png')});
 const collisions=await page.locator('.expression-map-stone-caption').evaluateAll(elements=>{const rects=elements.filter(e=>getComputedStyle(e).opacity!=='0').map(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,text:e.textContent};});const hits=[];for(let i=0;i<rects.length;i++)for(let j=i+1;j<rects.length;j++){const a=rects[i],b=rects[j];if(a.x<b.right&&a.right>b.x&&a.y<b.bottom&&a.bottom>b.y)hits.push([a.text,b.text]);}return hits;});assert.deepEqual(collisions,[]);
 assert.equal(await page.locator('.desert-cloud').first().evaluate(e=>getComputedStyle(e).animationName),'none');
 const frozen=await page.locator('.desert-tumbleweed').first().getAttribute('data-motion');await page.waitForTimeout(600);assert.equal(await page.locator('.desert-tumbleweed').first().getAttribute('data-motion'),frozen);
 await page.locator('[data-phrasal-map-toggle]').click();assert.equal(await page.locator('[data-lesson-choice-grid]').isVisible(),true);assert.equal(await page.locator('[data-lesson-choice-grid] [data-open-lesson]').count(),329);assert.equal(await map.getAttribute('data-animating'),'false');
 await page.locator('[data-lesson-choice-grid] [data-open-lesson="phrasal-verb-329"]').click();assert.equal(await page.evaluate(()=>desertTest.state.lessonId),'phrasal-verb-329');await page.evaluate(()=>desertTest.dashboard());await page.locator('[data-phrasal-map-toggle]').click();
 await page.locator('.expression-map-picker select').selectOption('phrasal-verb-01');await map.scrollIntoViewIfNeeded();
 for(const [name,width,height] of [['desktop',1440,1050],['tablet',820,1180],['phone',390,844]]){
  await page.setViewportSize({width,height});await page.locator('.expression-map-picker select').selectOption('phrasal-verb-01');await map.scrollIntoViewIfNeeded();await page.waitForTimeout(250);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  assert.equal(await page.locator('[data-map-open]').isVisible(),true);
  await map.screenshot({path:path.join(out,`desert-${name}.png`)});
  while(!await page.locator('[data-zoom=out]').isDisabled())await page.locator('[data-zoom=out]').click();
  await map.screenshot({path:path.join(out,`desert-${name}-overview.png`)});
  await page.locator('.expression-map-picker select').selectOption('phrasal-verb-329');assert.equal(await page.locator('[data-map-open]').isVisible(),true);
 }
 await page.emulateMedia({reducedMotion:'no-preference'});await page.locator('.expression-map-picker select').selectOption('phrasal-verb-01');await page.waitForTimeout(3400);await map.scrollIntoViewIfNeeded();await page.evaluate(()=>window.dispatchEvent(new Event('blur')));assert.equal(await map.getAttribute('data-animating'),'true');
 assert.equal(await page.evaluate(()=>desertTest.state.attempts.length),0,'Travelling creates no learning attempts');
 assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({lessons:catalogue.length,collisions,errors,externalRequestsBlocked:requests.length,viewports:['1440x1050','820x1180','390x844']},null,2));
 console.log('PASS: all 329 real lesson entries, motion, caption spacing, progress, pins, accounts, list, reduced motion and responsive views');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{await browser?.close();server.close();});
