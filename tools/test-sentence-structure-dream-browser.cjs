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
 assert.equal(garden.zoom,1);assert.ok(garden.scale<.5);assert.ok(garden.artVisible,'Standard view includes both painted garden edges');assert.ok(garden.lamps.every(Boolean),'All five lanterns visible at standard garden entry zoom');
 fs.writeFileSync(path.join(out,'garden-standard-framing.json'),JSON.stringify(garden,null,2));await map.screenshot({path:path.join(out,'garden-standard.png')});
 await page.locator('.expression-map-picker select').selectOption('ss91');await page.waitForTimeout(3500);
 await page.waitForFunction(()=>document.querySelector('.dream-toy-train').dataset.poses&&document.querySelector('.dream-living-scenery').dataset.renderer);
 assert.equal(await page.locator('[data-map-level="90"]').getAttribute('data-arrived'),'true');
 await map.screenshot({path:path.join(out,'dream-standard.png')});
 const samples=[];
 for(let n=0;n<75;n++){
  samples.push(await page.evaluate(()=>{
   const hash=bytes=>{let h=2166136261;for(const b of bytes)h=Math.imul(h^b,16777619);return h;};
   const c=document.querySelector('.dream-living-scenery'),gl=c.getContext('webgl');
   const patch=(x,y,w,h)=>{const a=new Uint8Array(w*h*4);gl.readPixels(x,c.height-y-h,w,h,gl.RGBA,gl.UNSIGNED_BYTE,a);return hash(a);};
   const train=document.querySelector('.dream-toy-train');
   return {t:+c.dataset.time,breath:+c.dataset.breath,belly:patch(348,394,85,54),face:patch(310,319,70,37),clouds:[patch(680,285,62,34),patch(1073,262,46,45)],castle:patch(909,225,44,52),train:hash(train.getContext('2d').getImageData(0,0,train.width,train.height).data),poses:JSON.parse(train.dataset.poses),stars:[...document.querySelectorAll('.dream-hanging-star')].map(el=>({move:getComputedStyle(el).transform,light:+getComputedStyle(el.querySelector('.dream-star-light')).opacity})),moon:getComputedStyle(document.querySelector('.dream-moon')).transform,flags:[...document.querySelectorAll('.dream-castle-flag path')].map(el=>el.getAttribute('d')),twinkles:[...document.querySelectorAll('.dream-twinkle')].map(el=>+getComputedStyle(el).opacity),lamps:[...document.querySelectorAll('.dream-ambient-glow')].map(el=>+getComputedStyle(el).opacity)};
  }));await page.waitForTimeout(200);
 }
 fs.writeFileSync(path.join(out,'dream-motion.json'),JSON.stringify(samples,null,2));
 const distinct=a=>new Set(a).size,range=a=>Math.max(...a)-Math.min(...a);
 assert.ok(distinct(samples.map(s=>s.belly))>30,'Bear tummy gently breathes');assert.equal(distinct(samples.map(s=>s.face)),1,'Sleeping face stays at rest');assert.equal(distinct(samples.map(s=>s.castle)),1,'Castle walls stay still');
 for(let i=0;i<2;i++)assert.ok(distinct(samples.map(s=>s.clouds[i]))>30,'Background cloud pixels move');
 assert.ok(distinct(samples.map(s=>s.train))>30,'Toy train paints many clean moving frames');
 for(let i=0;i<3;i++)assert.ok(range(samples.map(s=>s.poses[i].x))>45,'Every train car travels forward');
 for(let i=0;i<7;i++){assert.ok(distinct(samples.map(s=>s.stars[i].move))>30);assert.ok(range(samples.map(s=>s.stars[i].light))>.09);}
 assert.ok(distinct(samples.map(s=>s.moon))>30,'Moon gently rocks');
 for(let i=0;i<4;i++)assert.ok(distinct(samples.map(s=>s.flags[i]))>30,'Each castle flag sways');
 for(let i=0;i<22;i++)assert.ok(range(samples.map(s=>s.twinkles[i]))>.2);
 for(let i=0;i<6;i++)assert.ok(range(samples.map(s=>s.lamps[i]))>.08);
 await viewport.evaluate(el=>{el.scrollTop=(6150+650)*Number(document.querySelector('[data-sentence-map]').dataset.scale);});await map.screenshot({path:path.join(out,'dream-train-view.png')});
 await page.evaluate(async()=>{
  const {createDreamTrain}=await import('/sentence-structure-dream-motion.mjs');const load=async name=>{const i=new Image();i.src='/assets/sentence-structure/dream/'+name+'.webp';await i.decode();return i;};
  const [bg,atlas]=await Promise.all([load('background'),load('train')]),rig=createDreamTrain(atlas),panel=document.createElement('div');panel.id='train-loop-review';panel.style='position:fixed;inset:0;z-index:99999;background:#302e41;padding:22px;display:grid;grid-template-columns:1fr 1fr;gap:12px;color:#ffefd3;font:16px system-ui';
  for(const t of [0,18,36,54]){const cell=document.createElement('div'),c=document.createElement('canvas'),moving=document.createElement('canvas');c.width=moving.width=860;c.height=moving.height=352;c.style='width:100%;height:auto';c.getContext('2d').drawImage(bg,1047,719,430,176,0,0,860,352);rig.paint(moving,t);c.getContext('2d').drawImage(moving,0,0);cell.append(c,document.createElement('br'),`Train at ${t} seconds`);panel.append(cell);}document.body.append(panel);
 });await page.locator('#train-loop-review').screenshot({path:path.join(out,'train-loop-review.png')});await page.locator('#train-loop-review').evaluate(el=>el.remove());
 await page.locator('[data-save-location]').click();await page.locator('[data-character=elsie]').click();assert.equal(await page.locator('.expression-map-flag.is-dream').count(),1);assert.equal(await page.locator('.expression-map-flag.is-zen').count(),0);
 await page.evaluate(()=>coastTest.logout());await page.evaluate(()=>coastTest.login('dream-other'));assert.equal(await page.locator('.expression-map-flag').isVisible(),false);
 await page.evaluate(()=>coastTest.logout());await page.evaluate(()=>coastTest.login());await page.locator('.expression-map-lesson-card').waitFor({state:'visible'});assert.equal(await page.locator('[data-map-level="90"]').getAttribute('data-arrived'),'true');
 for(const id of ['ss90','ss91']){await page.locator('.expression-map-picker select').selectOption(id);await page.waitForFunction(index=>document.querySelector(`[data-map-level="${index}"]`).dataset.arrived==='true',+id.slice(2)-1,{timeout:8000});}
 await viewport.evaluate(el=>{el.scrollTop=5920*Number(document.querySelector('[data-sentence-map]').dataset.scale);});await map.screenshot({path:path.join(out,'dream-cloud-border.png')});
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('.expression-map-picker select').selectOption('ss120');await page.locator('[data-save-location]').click();assert.equal(await page.locator('.expression-map-flag').getAttribute('data-flag-level'),'ss120');
 await page.locator('[data-map-open]').click();await page.waitForFunction(()=>coastTest.state.lessonId==='ss120'&&!document.querySelector('[data-view=lesson]').hidden);await page.evaluate(()=>coastTest.dashboard());
 assert.equal(await page.locator('.dream-moon').evaluate(el=>getComputedStyle(el).animationName),'none');assert.equal(await page.evaluate(()=>coastTest.state.attempts.length),0);
 for(const [name,width,height] of [['desktop',1440,1050],['tablet',820,1180],['phone',390,844]]){
  await page.setViewportSize({width,height});await map.scrollIntoViewIfNeeded();await page.locator('.expression-map-picker select').selectOption('ss105');
  while(!await page.locator('[data-zoom=out]').isDisabled())await page.locator('[data-zoom=out]').click();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await map.screenshot({path:path.join(out,`dream-${name}-overview.png`)});
 }
 await page.locator('[data-sentence-map-toggle]').click();assert.equal(await map.getAttribute('data-animating'),'false');assert.deepEqual(errors,[]);
 console.log('PASS: 120 lessons, standard garden framing, dream star/moon/cloud/flag/bear/train/twinkle motion, flags, border travel, reduced motion and responsive views');
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{await browser?.close();server.close();});
