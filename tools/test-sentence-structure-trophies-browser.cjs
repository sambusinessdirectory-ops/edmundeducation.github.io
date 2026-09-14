// Local fixtures only; every remote request is mocked or blocked.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require(process.env.HOME+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..'),out=process.env.TROPHY_QA_DIR||'/tmp/golden-horsey-qa';fs.mkdirSync(out,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.json':'application/json'};
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(e,b)=>{if(e){res.writeHead(404).end();return;}res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(b);});});
let browser;
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
 browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1440,height:1050},deviceScaleFactor:1});const errors=[],saved=new Map();
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://**/*',route=>{const request=route.request(),url=new URL(request.url());if(url.pathname.startsWith('/v1/attempts/')&&request.method()==='PUT'){const body=request.postDataJSON(),id=url.pathname.split('/').at(-1);const record={id,...body};saved.set(id,record);return route.fulfill({contentType:'application/json',body:JSON.stringify({attempt:record})});}return route.abort();});
 for(const file of ['shared-system-nav.js','pwa-register.js','shared-speaking-practice.js'])await page.route(`**/${file}*`,r=>r.fulfill({contentType:'text/javascript',body:''}));
 await page.route('**/sentence-structure.js?*',route=>{const source=fs.readFileSync(root+'/sentence-structure.js','utf8').replace(/\ninitialise\(\)\.catch\([\s\S]*$/,'');return route.fulfill({contentType:'text/javascript',body:source+`
bindEvents();window.trophyTest={
 async login(id='trophy-a',attempts=[]){clearSession();await lessonLibrary.catalog();state.user={id,name:'Trophy Preview',role:'student'};state.authToken='fixture-'+id;state.attempts=attempts.map(normalizeAttempt);state.dashboardLoaded=true;renderLessonChoices();showView('dashboard',{preserveScroll:true});},
 async nearFinish(id){await openLesson(id,{page:4});await state.attemptSaveQueue;const lesson=getLesson();state.exercise.correctIds=lesson.questions.slice(0,49).map(q=>q.id);for(const q of lesson.questions.slice(0,49))state.exercise.questionState[q.id]={status:'correct',lastAnswer:q.answer,reveal:true};await persistExercise();renderExercisePage(lesson);return {id:lesson.questions[49].id,answer:lesson.questions[49].answer};},
 dashboard(){renderLessonChoices();showView('dashboard',{preserveScroll:true});},state
};`});});
 await page.goto(origin+'/sentence-structure.html');await page.waitForFunction(()=>window.trophyTest);
 const prior=['ss1','ss31','ss152','ss181'].map((id,i)=>({id:'prior-'+i,lessonId:id,status:'completed',correctCount:50,totalCount:50}));
 await page.evaluate(rows=>trophyTest.login('trophy-a',rows),prior);await page.waitForSelector('.expression-map-stone');
 const shelf=page.locator('[data-sentence-trophy-shelf]'),map=page.locator('[data-sentence-map]'),counter=page.locator('[data-sentence-trophy-counter]');
 assert.equal(await counter.locator('[data-trophy-counter-value]').innerText(),'4 / 345');
 assert.match(await counter.getAttribute('aria-label'),/4.*345/);
 await counter.locator('img').evaluate(i=>i.decode());
 assert.equal(await shelf.locator('[data-trophy-count]').innerText(),'4 / 345\n已獲得獎座');
 assert.equal(await map.locator('.ss-trophy-marker').count(),3);
 await counter.click();await page.waitForFunction(()=>document.querySelector('[data-sentence-trophy-shelf]').open);assert.equal(await shelf.locator('[data-trophy-earned="true"]').count(),4);
 assert.equal(await shelf.locator('[data-trophy-lesson="ss181"]').getAttribute('data-trophy-earned'),'true');
 const final=await page.evaluate(()=>trophyTest.nearFinish('ss4'));
 assert.equal(await page.locator('[data-sentence-trophy-reveal]').count(),0,'49 answers do not unlock the trophy');
 await page.locator(`[data-answer-input="${final.id}"]`).fill(final.answer);await page.locator('[data-submit-all]').click();
 await page.waitForSelector('[data-sentence-trophy-reveal]');await page.waitForFunction(()=>!trophyTest.state.saveInFlight);
 assert.ok([...saved.values()].some(r=>r.lessonId==='ss4'&&r.correctCount===50&&r.status==='completed'&&new Set(r.result.correctIds).size===50));
 await page.locator('[data-sentence-trophy-reveal] img').evaluate(i=>i.decode());
 const sparkle=page.locator('[data-sentence-trophy-reveal] .ss-trophy-sparkles i').first();
 assert.equal(await page.locator('[data-sentence-trophy-reveal] .ss-trophy-sparkles i').count(),6);
 const firstSparkle=await sparkle.evaluate(e=>getComputedStyle(e).transform);await page.waitForTimeout(350);assert.notEqual(await sparkle.evaluate(e=>getComputedStyle(e).transform),firstSparkle,'Sparkles actually drift through successive frames');
 assert.equal(await sparkle.evaluate(e=>getComputedStyle(e.parentElement).pointerEvents),'none');
 assert.equal(await page.locator('[data-sentence-trophy-reveal] p strong').first().evaluate(e=>getComputedStyle(e).color),'rgb(255, 228, 163)');
 await page.locator('[data-sentence-trophy-reveal]').screenshot({path:path.join(out,'completion-trophy.png'),animations:'disabled',style:'.site-header,[data-toast]{visibility:hidden!important}'});
 await page.locator('[data-sentence-trophy-reveal] [data-view-sentence-trophies]').click();await page.waitForFunction(()=>document.querySelector('[data-sentence-trophy-shelf]').open&&!document.querySelector('[data-view=dashboard]').hidden);
 assert.equal(await shelf.locator('[data-trophy-earned="true"]').count(),5);
 assert.equal(await counter.locator('[data-trophy-counter-value]').innerText(),'5 / 345');
 await map.locator('.expression-map-header').screenshot({path:path.join(out,'trophy-counter-desktop.png'),animations:'disabled',style:'.site-header,[data-toast]{visibility:hidden!important}'});
 assert.equal(await shelf.locator('[data-trophy-earned="true"] .ss-trophy-sparkles i').count(),30);
 assert.equal(await shelf.locator('[data-trophy-earned="false"] .ss-trophy-sparkles').count(),0);
 await shelf.locator('img').evaluateAll(images=>Promise.all(images.map(i=>i.decode())));
 await shelf.screenshot({path:path.join(out,'trophy-collection.png'),animations:'disabled',style:'.site-header,[data-toast]{visibility:hidden!important}'});
 await shelf.locator('summary').click();await map.scrollIntoViewIfNeeded();await page.emulateMedia({reducedMotion:'reduce'});
 await map.locator('.expression-map-picker select').selectOption('ss5');await page.waitForFunction(()=>document.querySelector('[data-map-level="4"]').dataset.arrived==='true');
 await map.locator('[data-map-level="3"] .ss-trophy-marker').evaluate(i=>i.decode());
 assert.equal(await map.locator('[data-map-level="3"] .ss-trophy-sparkles i').count(),6);
 assert.equal(await map.locator('[data-map-level="3"] .ss-trophy-sparkles').evaluate(e=>getComputedStyle(e).display),'none','Reduced motion disables particles');
 await map.screenshot({path:path.join(out,'trophy-on-map.png'),animations:'disabled',style:'.site-header,[data-toast]{visibility:hidden!important}'});
 const box=await map.locator('[data-map-level="3"]').boundingBox();
 await page.screenshot({path:path.join(out,'platform-04-trophy.png'),clip:{x:Math.max(0,box.x-50),y:Math.max(0,box.y-150),width:280,height:335},animations:'disabled',style:'.site-header,[data-toast],.expression-map-lesson-card{visibility:hidden!important}'});
 if(process.env.TROPHY_CAPTURE_GIF==='1') {
  await page.emulateMedia({reducedMotion:'no-preference'});await map.scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelector('[data-sentence-map]').dataset.animating==='true');
  const frames=path.join(out,'sparkle-frames');fs.mkdirSync(frames,{recursive:true});
  const particle=map.locator('[data-map-level="3"] .ss-trophy-sparkles i').first(),before=await particle.evaluate(e=>getComputedStyle(e).transform);
  const crop=await map.locator('[data-map-level="3"]').boundingBox();
  for(let i=0;i<20;i++){await page.screenshot({path:path.join(frames,String(i).padStart(3,'0')+'.png'),clip:{x:Math.max(0,crop.x-50),y:Math.max(0,crop.y-150),width:280,height:335},style:'.site-header,[data-toast],.expression-map-lesson-card{visibility:hidden!important}'});await page.waitForTimeout(200);}
  assert.notEqual(await particle.evaluate(e=>getComputedStyle(e).transform),before,'Map sparkle particles animate while the map is visible');
  await page.emulateMedia({reducedMotion:'reduce'});
 }
 assert.match(await map.locator('[data-map-level="3"] .ss-trophy-marker').getAttribute('src'),/golden-eddie-map/);
 assert.match(await map.locator('[data-map-level="151"] .ss-trophy-marker').getAttribute('src'),/golden-eddie-v1/);
 assert.equal(await map.locator('[data-map-level="151"] .ss-trophy-marker').evaluate(e=>getComputedStyle(e).visibility),'visible','A completed secondary hotel lesson has a visible statue at its shared door');
 await page.locator('[data-sentence-map-toggle]').click();assert.ok(await page.locator('[data-lesson-choice-grid] [data-open-lesson="ss4"] .ss-trophy-list-icon').isVisible());
 const stored=[...prior,...saved.values()];await page.reload();await page.waitForFunction(()=>window.trophyTest);await page.evaluate(rows=>trophyTest.login('trophy-a',rows),stored);
 assert.equal(await shelf.locator('[data-trophy-earned="true"]').count(),5,'Trophies restore from saved module attempts');
 await page.locator('[data-sentence-map-toggle]').click();
 assert.equal(await counter.locator('[data-trophy-counter-value]').innerText(),'5 / 345','Counter restores when returning from saved normal mode');
 await page.setViewportSize({width:390,height:900});
 await map.locator('.expression-map-header').screenshot({path:path.join(out,'trophy-counter-phone.png'),animations:'disabled',style:'.site-header,[data-toast]{visibility:hidden!important}'});
 assert.ok(await counter.isVisible());
 await shelf.locator('summary').click();await shelf.screenshot({path:path.join(out,'trophy-collection-phone.png'),animations:'disabled',style:'.site-header,[data-toast]{visibility:hidden!important}'});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Phone view must fit without horizontal overflow');
 await page.evaluate(()=>trophyTest.login('trophy-b'));
 assert.equal(await shelf.locator('[data-trophy-earned="true"]').count(),0);assert.equal(await map.locator('.ss-trophy-marker').count(),0);assert.equal(await shelf.evaluate(e=>e.open),false);
 assert.equal(await counter.locator('[data-trophy-counter-value]').innerText(),'0 / 345','Counter must not leak another account’s trophies');
 assert.deepEqual(errors,[]);
 const checks={headerTrophyCounter:true,headerCounterShortcut:true,headerCounterRestored:true,exact50QuestionUnlock:true,finalAnswerSubmitted:true,savedAttemptRestored:true,priorCompletions:true,all345Eligible:true,ownerIsolation:true,mapViewAngle:true,hotelFrontView:true,lessonList:true,phone:true,sparkleParticles:true,sparklesMove:true,sparklesIgnorePointer:true,reducedMotion:true,errors};fs.writeFileSync(path.join(out,'checks.json'),JSON.stringify(checks,null,2));console.log(JSON.stringify(checks,null,2));
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{await browser?.close();server.closeAllConnections();server.close();});
