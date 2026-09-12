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
 assert.equal(await page.locator('.expression-map-stone').count(),120);
 assert.equal(await page.locator('.expression-map-stone[data-zen]').count(),30);
 assert.equal(await page.locator('.expression-map-stone[data-dream]').count(),30);
 assert.equal(await page.locator('[data-remaining-lesson-grid] [data-open-lesson]').count(),225);
 assert.equal(await page.locator('.realm-connector,.zen-connector,.zen-route').count(),0);
 await page.locator('.expression-map-picker select').selectOption('ss61');await page.waitForTimeout(3500);
 const garden=await viewport.evaluate(el=>{const v=el.getBoundingClientRect(),art=document.querySelector('.zen-background').getBoundingClientRect();return {scale:+document.querySelector('[data-sentence-map]').dataset.scale,zoom:+document.querySelector('[data-sentence-map]').dataset.zoom,artVisible:art.left>=v.left-1&&art.right<=v.right+1,lamps:[...document.querySelectorAll('.zen-lamp-glow')].map(l=>{const r=l.getBoundingClientRect();return r.left>=v.left&&r.right<=v.right&&r.top>=v.top&&r.bottom<=v.bottom;})};});
 assert.equal(garden.zoom,1);assert.ok(garden.scale>.8);assert.equal(garden.artVisible,false,'Quiet extended scenery remains outside the normal view');assert.ok(garden.lamps.every(Boolean),'All five lanterns visible at standard garden entry zoom');
 fs.writeFileSync(path.join(out,'garden-standard-framing.json'),JSON.stringify(garden,null,2));await map.screenshot({path:path.join(out,'garden-standard.png')});
 await page.locator('.expression-map-picker select').selectOption('ss91');await page.waitForTimeout(3500);
 await page.waitForFunction(()=>document.querySelector('.dream-toy-train').dataset.poses&&document.querySelector('.dream-living-scenery').dataset.renderer);
 assert.equal(await page.locator('[data-map-level="90"]').getAttribute('data-arrived'),'true');
 await map.screenshot({path:path.join(out,'dream-standard.png')});
 fs.writeFileSync(path.join(out,'train-fallback.png'),Buffer.from(await page.locator('.dream-toy-train').evaluate(c=>c.toDataURL().split(',')[1]),'base64'));
 console.log('PREVIEW',await page.locator('.dream-toy-train').getAttribute('data-renderer'),errors);
 await page.evaluate(async()=>{
  const {createDreamTrain}=await import('/sentence-structure-dream-train.mjs');const bg=new Image();bg.src='/assets/sentence-structure/dream/background-normal.webp';await bg.decode();
  const panel=document.createElement('div');panel.id='train-loop-review';panel.style='position:fixed;inset:0;z-index:99999;background:#302e41;padding:22px;display:grid;grid-template-columns:1fr 1fr;gap:12px;color:#ffefd3;font:16px system-ui';
  for(const t of [0,8.5,17,25.5]){const cell=document.createElement('div'),c=document.createElement('canvas'),moving=document.createElement('canvas');c.width=1320;c.height=720;c.style='width:100%;height:auto';const ctx=c.getContext('2d');ctx.drawImage(bg,(780+800)*1672/3200,590*941/1850,660*1672/3200,360*941/1850,0,0,1320,720);const rig=createDreamTrain(moving);rig.paint(t);ctx.drawImage(moving,0,0);rig.destroy();cell.append(c,document.createElement('br'),`Train at ${t} seconds`);panel.append(cell);}document.body.append(panel);
 });await page.locator('#train-loop-review').screenshot({path:path.join(out,'train-loop-review.png')});await page.locator('#train-loop-review').evaluate(el=>el.remove());
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.setViewportSize({width:1640,height:2040});await map.scrollIntoViewIfNeeded();
 await page.locator('.expression-map-picker select').selectOption('ss91');
 await viewport.evaluate(el=>{el.style.height='1800px';el.scrollTop=5150*+document.querySelector('[data-sentence-map]').dataset.scale;});
 await map.screenshot({path:path.join(out,'dream-full-trail.png')});
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{await browser?.close();server.close();});
