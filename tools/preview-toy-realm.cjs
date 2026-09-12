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

 assert.equal(await page.locator('.expression-map-stone').count(),150);
 assert.equal(await page.locator('.expression-map-stone[data-toy]').count(),30);
 await page.locator('.expression-map-picker select').selectOption('ss121');await page.waitForTimeout(3000);
 await page.waitForFunction(()=>document.querySelector('.toy-dog').dataset.motion&&document.querySelector('.toy-effects').dataset.marbles);
 await map.screenshot({path:path.join(out,'toy-standard.png')});
 fs.writeFileSync(path.join(out,'effects-fallback.png'),Buffer.from(await page.locator('.toy-effects').evaluate(c=>c.toDataURL().split(',')[1]),'base64'));
 console.log('PREVIEW',errors);
 await page.evaluate(async()=>{
  const {createToyDog}=await import('/sentence-structure-toy-dog.mjs'),img=new Image();img.src='/assets/sentence-structure/toy/dog.webp';await img.decode();const rig=createToyDog(img),panel=document.createElement('div');panel.id='dog-review';panel.style='position:fixed;inset:0;z-index:99999;background:#718b80;padding:20px;display:grid;grid-template-columns:1fr 1fr;gap:12px;font:18px system-ui';
  for(const t of [0,1.88,2.2,4.6]){const cell=document.createElement('div'),c=document.createElement('canvas');c.width=660;c.height=600;c.style='width:100%;height:420px;object-fit:contain';rig.paint(c,t);cell.append(c,document.createElement('br'),`Dog at ${t}s`);panel.append(cell);}document.body.append(panel);
 });await page.locator('#dog-review').screenshot({path:path.join(out,'dog-poses.png')});await page.locator('#dog-review').evaluate(el=>el.remove());
 await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:1640,height:2040});await map.scrollIntoViewIfNeeded();await page.locator('.expression-map-picker select').selectOption('ss121');await viewport.evaluate(el=>{el.style.height='1800px';el.scrollTop=7000*+document.querySelector('[data-sentence-map]').dataset.scale;});await map.screenshot({path:path.join(out,'toy-full-trail.png')});
 assert.deepEqual(errors,[]);
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{await browser?.close();server.close();});
