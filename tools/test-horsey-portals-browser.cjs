// Every external request is blocked. Exercises use local fixture accounts only.
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const {chromium}=require(process.env.HOME+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..'),out=process.env.HORSEY_QA_DIR||'/tmp/horsey-portals-qa';fs.mkdirSync(out,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png'};
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+new URL(req.url,'http://local').pathname);if(!file.startsWith(root+'/'))return res.writeHead(403).end();fs.readFile(file,(err,data)=>{if(err)return res.writeHead(404).end();res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(data);});});
const portals=['idiom-system','phrasal-verb-system','proverb-system',...['speaking','written','rhetorical-speaking','rhetorical-writing','professional-message','business-speaking'].map(x=>'common-expression-'+x),'listening-system'];
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port,browser=await chromium.launch({headless:true});try{
for(const portal of portals.filter(p=>!process.env.PORTAL || p===process.env.PORTAL)){
 const page=await browser.newPage({viewport:{width:1440,height:1050}}),errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error(portal,e.message);});
 await page.route('https://**/*',r=>r.abort());
 await page.addInitScript(()=>localStorage.setItem('edmund-eddy-wardrobe-v1:fixture-a',JSON.stringify({equipped:{headwear:'white-fedora',top:'cream-cable-knit'},outfits:[]})));
 for(const file of ['shared-system-nav.js','shared-speaking-practice.js','pwa-register.js'])await page.route('**/'+file+'*',r=>r.fulfill({contentType:'text/javascript',body:''}));
 const ce=portal.startsWith('common-expression-'),listening=portal==='listening-system',file=ce?'common-expression-system':portal;
 await page.route('**/'+file+'.js?*',r=>{
  let s=fs.readFileSync(root+'/'+file+'.js','utf8').replace(/\ninitialise\(\)\.catch\([\s\S]*$/,'').replace(/\ninitialise\(\);/g,'\n');
  if(listening) s=s.replace('createListeningTrophyProgress({rpc,','createListeningTrophyProgress({rpc:async()=>[],');
  const fixture=ce ? `
   const fixtureLessons=SYSTEM.lessons;state.user={id:'fixture-a',name:'Fixture'};state.token='fixture';
   for(const [i,l] of fixtureLessons.entries()) if(i<3) for(const q of l.questions.slice(0,i===0?l.questions.length:Math.ceil(l.questions.length*(i===1?.5:.8))))lessonState(l.id).answers[q.id]={correct:true,updatedAt:"2026-09-14T10:00:00Z"};
   renderDashboard();showView('dashboard',{scroll:false});
   window.testHorsey={count:fixtureLessons.length,reset(){state.user.id='fixture-b';state.states.clear();renderDashboard();},exercise(){state.lessonId=fixtureLessons[0].id;renderQuestionList();}};
  ` : listening ? `
   rpc=async()=>[];state.user={id:'fixture-a',name:'Fixture'};state.token='fixture';await listeningTrophyProgress.restore();
   await listeningTrophyProgress.record(1,Array.from({length:40},(_,i)=>i+1));await listeningTrophyProgress.record(2,Array.from({length:20},(_,i)=>i+1));
   await listeningTrophyProgress.record(3,Array.from({length:32},(_,i)=>i+1));renderPracticeGrid();showView('ielts',{scroll:false});syncIeltsMap();
   window.testHorsey={count:CATALOGUE.practices.length,reset:async()=>{state.user.id='fixture-b';await listeningTrophyProgress.restore();syncIeltsMap();}};
  ` : `
   state.user={id:'fixture-a',name:'Fixture',role:'student'};state.authToken='fixture';const fixtureLessons=lessonList();
   state.attempts=fixtureLessons.slice(0,3).map((l,i)=>({lessonId:l.id,totalCount:l.questions.length,correctCount:i===0?l.questions.length:Math.ceil(l.questions.length*(i===1?.5:.8)),status:i===0?'completed':'in_progress',completedAt:"2026-09-14T10:00:00Z",result:{correctIds:l.questions.slice(0,i===0?l.questions.length:Math.ceil(l.questions.length*(i===1?.5:.8))).map(q=>q.id)}}));
   renderLessonChoices();showView('dashboard',{preserveScroll:true});
   window.testHorsey={count:fixtureLessons.length,reset(){state.user.id='fixture-b';state.attempts=[];renderLessonChoices();},exercise(){state.lessonId=fixtureLessons[0].id;ensureExercise(fixtureLessons[0]);state.exercise.correctIds=fixtureLessons[0].questions.map(q=>q.id);renderExercisePage(fixtureLessons[0]);}};
  `;
  return r.fulfill({contentType:'text/javascript',body:s+'\n'+fixture});
 });
 await page.goto(origin+'/'+portal+'.html');await page.waitForFunction(()=>window.testHorsey,{timeout:30000});
 const selector=ce?'[data-map-toggle]':listening?'[data-ielts-map-toggle]':portal==='phrasal-verb-system'?'[data-phrasal-map-toggle]':portal==='idiom-system'?'[data-idiom-map-toggle]':'[data-proverb-map-toggle]';
 await page.locator(selector).waitFor({state:'visible',timeout:30000});
 await page.waitForFunction(s=>!document.querySelector(s)?.disabled && document.querySelector('[data-horsey-map] .expression-map-viewport'),selector);
 if(await page.locator('[data-horsey-map]').isHidden())await page.locator(selector).click();
 await page.locator('[data-horsey-map] .ss-map-trophy').first().waitFor({timeout:30000});
 const mapRoot=page.locator('[data-horsey-map]');
 await page.waitForFunction(async()=>{const m=await import('/eddy-cosmetics.mjs?v=20260915-closet2');return m.cosmeticsState().equipped.headwear==='white-fedora';});
 for(const character of ['phoebe','elsie','eddy']){
  await mapRoot.locator('[data-character="'+character+'"]').click();
  assert.equal(await mapRoot.locator('[data-open-closet]').isEnabled(),character!=='phoebe');
  const image=mapRoot.locator('.ss-map-trophy img').first();
  await image.evaluate(img=>img.decode());
  if(character!=='eddy')for(const tier of ['silver','bronze']){const img=mapRoot.locator('.ss-map-trophy[data-trophy-tier='+tier+'] img');await img.evaluate(i=>i.decode());assert.ok((await img.getAttribute('src')).includes(tier+'-'+character));}
  if(portal==='common-expression-speaking'&&character!=='eddy')await mapRoot.screenshot({path:out+'/'+character+'-metals.png'});
  assert.ok((await image.getAttribute('src')).includes(character==='eddy'?'eddie':character));
  assert.ok((await page.locator('[data-horsey-shelf] summary img').getAttribute('src')).includes(character==='eddy'?'eddie':character));
 }
 const count=await page.evaluate(()=>testHorsey.count);
 assert.equal(await page.locator('[data-trophy-counter-value]').innerText(),'1 / '+count,portal+' counter');
 assert.equal(await page.locator('.ss-map-trophy[data-trophy-tier=gold]').count(),1);
 assert.equal(await page.locator('.ss-map-trophy[data-trophy-tier=silver]').count(),1);
 assert.equal(await page.locator('.ss-map-trophy[data-trophy-tier=bronze]').count(),1);
 const trophy=page.locator('.ss-map-trophy').first();await trophy.scrollIntoViewIfNeeded();await trophy.dispatchEvent('click');assert.match(await trophy.getAttribute('class'),/is-bouncing/);
 assert.equal(await trophy.locator('.ss-trophy-sparkles i').count(),10);
 await page.locator('[data-toggle-map-trophies]').click();assert.equal(await trophy.isVisible(),false);
 await page.locator('[data-toggle-map-trophies]').click();assert.equal(await trophy.isVisible(),true);

 const map=page.locator('[data-horsey-map]'),viewport=map.locator('.expression-map-viewport');
 await viewport.focus();await page.keyboard.down('d');await page.waitForFunction(()=>document.querySelector('[data-horsey-map]').dataset.walking==='true');
 assert.equal(await trophy.locator('.ss-trophy-sheen').evaluate(e=>getComputedStyle(e).display),'none','Walking pauses sheen');
 await page.keyboard.up('d');await page.waitForFunction(()=>document.querySelector('[data-horsey-map]').dataset.walking==='false');
 if(portal==='common-expression-speaking'){
  await page.locator('[data-open-closet]').click();
  await page.waitForFunction(()=>document.querySelector('[data-closet-stage] canvas')?.dataset.actorPosition,{timeout:60000});
  assert.equal(await map.getAttribute('data-animating'),'false','Closet suspends background map');
  const canvas=page.locator('[data-closet-stage] canvas'),before=await canvas.getAttribute('data-actor-position');
  await canvas.focus();await page.keyboard.down('KeyD');await page.waitForTimeout(500);await page.keyboard.up('KeyD');
  assert.notEqual(await canvas.getAttribute('data-actor-position'),before,'Closet WASD movement');
  await page.locator('[data-close-closet]').click();
  assert.equal(await page.locator('body').getAttribute('data-closet-open'),null);
  await page.waitForFunction(()=>document.querySelector('[data-horsey-map]').dataset.animating==='true');
 }
 const shelf=page.locator('[data-horsey-shelf]');await shelf.evaluate(e=>e.open=true);
 const individual=shelf.locator('[data-trophy-visibility-lesson]').first();await individual.click();
 assert.equal(await trophy.isVisible(),false,portal+' individual hiding');
 await page.locator('[data-show-all-trophies]').click();assert.equal(await trophy.isVisible(),true);
 assert.equal(await shelf.locator('[data-trophy-visibility-lesson]').first().getAttribute('aria-pressed'),'false');
 assert.ok(await shelf.locator('.ss-trophy-date time').count()>0,portal+' award date');
 await shelf.evaluate(e=>e.open=false);
 await page.locator('[data-horsey-map]').screenshot({path:out+'/'+portal+'.png'});
 await page.locator(selector).click();assert.equal(await page.locator('[data-horsey-map]').isHidden(),true);
 await page.locator(selector).click();assert.equal(await trophy.isVisible(),true);
 if(!listening) { await page.evaluate(()=>testHorsey.exercise());assert.equal(await page.locator('[data-horsey-celebration=gold]').count(),1); }
 await page.evaluate(()=>testHorsey.reset());await page.waitForFunction(()=>document.querySelectorAll('.ss-map-trophy').length===0);
 assert.equal(await page.locator('[data-trophy-counter-value]').innerText(),'0 / '+count);
 assert.deepEqual(errors,[],portal+' runtime errors');console.log('PASS',portal,count);await page.close();
}
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
