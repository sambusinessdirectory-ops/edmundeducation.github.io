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
 await map.scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelector('[data-sentence-map]').dataset.hotelReady==='true');
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('.expression-map-picker select').selectOption('ss150');
 // Fog must never wash over the original companion-card heading.
 await viewport.evaluate(el=>{const s=+document.querySelector('[data-sentence-map]').dataset.scale;el.scrollTop=8850*s-55*s;el.scrollLeft=1e7;});
 await page.waitForTimeout(100);
 const card=await page.locator('.hotel-companion-card').boundingBox();
 const header={x:card.x+6,y:card.y+6,width:card.width-12,height:card.height*33/94-12};
 await page.locator('.hotel-boundary-fog').evaluate(el=>el.style.opacity='0');
 const noFog=await page.screenshot({clip:header});
 await page.locator('.hotel-boundary-fog').evaluate(el=>el.style.opacity='1');
 const withFog=await page.screenshot({clip:header});fs.writeFileSync(path.join(out,'heading-with-fog.png'),withFog);fs.writeFileSync(path.join(out,'heading-without-fog.png'),noFog);assert.ok(withFog.equals(noFog),'The heading is unchanged under fog');
 await viewport.screenshot({path:path.join(out,'hotel-fog-right-edge.png')});


 for(const [name,width,height] of [['desktop',1440,1050],['tablet',820,1180],['phone',390,844]]){
  await page.setViewportSize({width,height});await map.scrollIntoViewIfNeeded();await page.locator('.expression-map-picker select').selectOption('ss152');
  for(const edge of [0,1e7]){await viewport.evaluate((el,x)=>el.scrollLeft=x,edge);await page.waitForTimeout(80);const b=await page.evaluate(()=>{const v=document.querySelector('.expression-map-viewport').getBoundingClientRect(),a=document.querySelector('.sentence-hotel-realm').getBoundingClientRect();return {viewLeft:v.left,viewRight:v.right,artLeft:a.left,artRight:a.right};});assert.ok(b.artLeft<=b.viewLeft+1&&b.artRight>=b.viewRight-1,'No exposed gutter on '+name);}
 }
 assert.deepEqual(errors,[]);console.log(JSON.stringify({fogHeadingUnchanged:true,horizontalEdges:['desktop','tablet','phone'],errors}));
 fs.writeFileSync(path.join(out,'framing-regressions.json'),JSON.stringify({fogHeadingUnchanged:true,horizontalEdges:['desktop','tablet','phone'],errors},null,2));
})().catch(async error=>{console.error(error);if(debugPage){console.error(await debugPage.evaluate(()=>({map:{...document.querySelector('[data-sentence-map]')?.dataset},scenery:{...document.querySelector('.hotel-scenery')?.dataset},effects:{...document.querySelector('.hotel-effects')?.dataset},hidden:document.hidden,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,rect:document.querySelector('[data-sentence-map]')?.getBoundingClientRect().toJSON(),scrollY})));await debugPage.screenshot({path:path.join(out,'hotel-failure.png')});}process.exitCode=1;}).finally(async()=>{await browser?.close();server.close();});
