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


 assert.equal(await page.locator('.expression-map-stone').count(),150);assert.equal(await page.locator('.expression-map-stone[data-toy]').count(),30);assert.equal(await page.locator('.expression-map-stone[data-dream]').count(),30);assert.equal(await page.locator('[data-remaining-lesson-grid] [data-open-lesson]').count(),195);
 assert.equal(await page.locator('body').getByText('海岸・秋林・庭園・星夢之旅',{exact:true}).count(),0);
 assert.equal((await page.locator('.expression-map-heading h2').textContent()).trim(),'150 個課題 · 全部開放');
 await page.locator('.expression-map-picker select').selectOption('ss121');await page.waitForTimeout(3000);await page.waitForFunction(()=>document.querySelector('.toy-dog').dataset.motion&&document.querySelector('.toy-effects').dataset.marbles);
 const framing=await viewport.evaluate(el=>{const r=document.querySelector('[data-sentence-map]'),v=el.getBoundingClientRect(),s=+r.dataset.scale;return {scale:s,zoom:+r.dataset.zoom,label:parseFloat(getComputedStyle(document.querySelector('[data-toy] .expression-map-stone-caption')).fontSize)*s,dog:document.querySelector('.toy-dog').getBoundingClientRect().toJSON(),viewport:v.toJSON()};});assert.equal(framing.zoom,1);assert.ok(framing.scale>.8&&framing.label>=15);assert.ok(framing.dog.left>=framing.viewport.left&&framing.dog.right<=framing.viewport.right&&framing.dog.top>=framing.viewport.top&&framing.dog.bottom<=framing.viewport.bottom);
 const collisions=await page.evaluate(()=>{const a=[...document.querySelectorAll('[data-toy].expression-map-stone')].map(n=>({id:n.dataset.mapLevel,caption:n.querySelector('.expression-map-stone-caption').getBoundingClientRect(),block:n.querySelector('.toy-level-block').getBoundingClientRect()})),bad=[],hit=(a,b)=>Math.min(a.right,b.right)-Math.max(a.left,b.left)>2&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>2;for(const x of a)for(const y of a)if(x!==y&&(hit(x.caption,y.caption)||hit(x.caption,y.block)))bad.push([x.id,y.id]);return bad;});assert.deepEqual(collisions,[]);
 await map.screenshot({path:path.join(out,'toy-standard.png')});fs.writeFileSync(path.join(out,'effects-fallback.png'),Buffer.from(await page.locator('.toy-effects').evaluate(c=>c.toDataURL().split(',')[1]),'base64'));
 const samples=[];for(let i=0;i<100;i++){samples.push(await page.evaluate(async()=>{
  const {TOY_MARBLES,TOY_PLANES,TOY_KEY}=await import('/sentence-structure-toy-geometry.mjs');const fx=document.querySelector('.toy-effects'),dog=document.querySelector('.toy-dog'),fg=fx.getContext('webgl2'),dg=dog.getContext('webgl');
  const hash=(gl,c,x,y,w,h)=>{const bytes=new Uint8Array(w*h*4);gl.readPixels(x,c.height-y-h,w,h,gl.RGBA,gl.UNSIGNED_BYTE,bytes);let v=2166136261;for(let j=0;j<bytes.length;j+=7)v=Math.imul(v^bytes[j],16777619);return v;};
  return {t:+fx.dataset.time,marbles:JSON.parse(fx.dataset.marbles),wings:JSON.parse(fx.dataset.wings),key:+fx.dataset.key,dog:JSON.parse(dog.dataset.motion),marblePixels:TOY_MARBLES.map(m=>hash(fg,fx,m.x-60,m.y-65,120,90)),planePixels:TOY_PLANES.map(p=>hash(fg,fx,p.x-90,p.y-65,180,130)),keyPixels:hash(fg,fx,TOY_KEY.x-50,TOY_KEY.y-55,100,110),bodyPixels:hash(dg,dog,225,455,110,90),headPixels:hash(dg,dog,345,180,65,65)};
 }));await page.waitForTimeout(160);}
 const distinct=a=>new Set(a).size,range=a=>Math.max(...a)-Math.min(...a);
 for(let i=0;i<8;i++){assert.ok(range(samples.map(s=>s.marbles[i].x))*framing.scale>30,'Every marble rolls visibly at standard zoom');assert.ok(distinct(samples.map(s=>s.marblePixels[i]))>40);}
 for(let i=0;i<4;i++){assert.ok(range(samples.map(s=>s.wings[i].left))>.3);assert.ok(distinct(samples.map(s=>s.planePixels[i]))>40);}
 assert.ok(range(samples.map(s=>s.key))>Math.PI*2);assert.ok(distinct(samples.map(s=>s.keyPixels))>50);assert.ok(samples.some(s=>s.dog.blink>.97));assert.ok(range(samples.map(s=>s.dog.tilt))>.12);assert.equal(distinct(samples.map(s=>s.bodyPixels)),1,'The seated body and feet remain fixed');assert.ok(distinct(samples.map(s=>s.headPixels))>35);
 fs.writeFileSync(path.join(out,'toy-motion.json'),JSON.stringify(samples,null,2));fs.writeFileSync(path.join(out,'toy-framing.json'),JSON.stringify(framing,null,2));
 await page.locator('[data-save-location]').click();await page.locator('[data-character=phoebe]').click();assert.equal(await page.locator('.expression-map-flag.is-toy').count(),1);assert.equal(await page.locator('.expression-map-flag.is-dream').count(),0);
 await page.evaluate(()=>coastTest.logout());await page.evaluate(()=>coastTest.login('toy-other'));assert.equal(await page.locator('.expression-map-flag').isVisible(),false);await page.evaluate(()=>coastTest.logout());await page.evaluate(()=>coastTest.login());await page.locator('.expression-map-lesson-card').waitFor({state:'visible'});assert.equal(await page.locator('[data-map-level="120"]').getAttribute('data-arrived'),'true');
 for(const id of ['ss120','ss121']){await page.locator('.expression-map-picker select').selectOption(id);await page.waitForFunction(index=>document.querySelector(`[data-map-level="${index}"]`).dataset.arrived==='true',+id.slice(2)-1,{timeout:10000});}
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('.expression-map-picker select').selectOption('ss150');await page.locator('[data-save-location]').click();assert.equal(await page.locator('.expression-map-flag').getAttribute('data-flag-level'),'ss150');await page.waitForTimeout(200);const still=await page.locator('.toy-effects').getAttribute('data-time');await page.waitForTimeout(250);assert.equal(still,'0');assert.equal(await page.locator('.toy-effects').getAttribute('data-time'),'0');
 await page.locator('[data-map-open]').click();await page.waitForFunction(()=>coastTest.state.lessonId==='ss150'&&!document.querySelector('[data-view=lesson]').hidden);await page.evaluate(()=>coastTest.dashboard());assert.equal(await page.evaluate(()=>coastTest.state.attempts.length),0);
 for(const [name,width,height] of [['desktop',1440,1050],['tablet',820,1180],['phone',390,844]]){await page.setViewportSize({width,height});await map.scrollIntoViewIfNeeded();await page.locator('.expression-map-picker select').selectOption('ss136');while(!await page.locator('[data-zoom=out]').isDisabled())await page.locator('[data-zoom=out]').click();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await map.screenshot({path:path.join(out,`toy-${name}-overview.png`)});}
 await page.locator('[data-sentence-map-toggle]').click();assert.equal(await map.getAttribute('data-animating'),'false');assert.deepEqual(errors,[]);
 console.log('PASS: 150 lessons; empty realm title; normal framing; 8 rolling marbles; 4 flexing planes; key rotation; dog blinking and head tilts with fixed body; trail spacing; pins, accounts, border travel, reduced motion and responsive views');
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{await browser?.close();server.close();});
