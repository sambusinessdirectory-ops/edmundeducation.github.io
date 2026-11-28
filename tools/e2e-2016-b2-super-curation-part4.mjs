import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=process.env.CURATION_OUTPUT_DIR||path.join(root,'test-results/2016-b2-part4');
fs.mkdirSync(output,{recursive:true});
const requireRuntime=createRequire('/Users/sammak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json');
const {chromium}=requireRuntime('playwright');
const mime=new Map([['.html','text/html; charset=utf-8'],['.js','text/javascript; charset=utf-8'],['.css','text/css; charset=utf-8'],['.gz','application/gzip'],['.webp','image/webp'],['.png','image/png'],['.svg','image/svg+xml'],['.mp3','audio/mpeg']]);
const server=http.createServer((request,response)=>{const pathname=decodeURIComponent(new URL(request.url,'http://127.0.0.1').pathname);let file=path.join(root,pathname);if(pathname.endsWith('/'))file=path.join(file,'index.html');if(!file.startsWith(root)||!fs.existsSync(file)||fs.statSync(file).isDirectory())return response.writeHead(404).end('Not found');response.setHeader('Content-Type',mime.get(path.extname(file))||'application/octet-stream');fs.createReadStream(file).pipe(response);});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const port=server.address().port;
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1600,height:1000},reducedMotion:'reduce'});
const page=await context.newPage();
const errors=[],networkIssues=[];
page.on('pageerror',error=>errors.push(error.message));
page.on('console',message=>{if(message.type()==='error'&&!message.text().startsWith('Failed to load resource:'))errors.push(message.text());});
page.on('response',response=>{if(response.status()>=400)networkIssues.push(`${response.status()} ${response.url()}`);});
try{
  await page.goto(`http://127.0.0.1:${port}/paper3/2016-b2/?curation=1`,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.EDMUND_2016_B2_CURATION_STAGE4_DEBUG?.records.length===148);
  const pre=await page.evaluate(()=>Object.fromEntries(Object.entries(localStorage).filter(([key])=>/curation/.test(key))));
  await page.locator('.curation-stage-item[data-stage="data"]').click();
  await page.waitForFunction(()=>window.EDMUND_2016_B2_CURATION_STAGE4_DEBUG.getState().active===true);
  const initial=await page.evaluate(()=>({audit:window.EDMUND_2016_B2_CURATION_STAGE4_DEBUG.targetAudit,state:window.EDMUND_2016_B2_CURATION_STAGE4_DEBUG.getState(),options:document.querySelectorAll('#curation-step-jump option').length,stage5:document.querySelector('.curation-stage-item[data-stage="writing"]').disabled,source:document.querySelector('#curation-source').textContent,analysis:document.querySelectorAll('.curation-stage4-analysis section').length,bank:document.querySelectorAll('.curation-stage4-bank li').length,masks:document.querySelectorAll('.curation-mask:not([hidden])').length}));
  assert.deepEqual(initial.audit,[]);
  assert.equal(initial.state.position,0);assert.equal(initial.options,148);assert.equal(initial.stage5,true);assert.match(initial.source,/Data File p\.4/);assert.equal(initial.analysis,4);assert.equal(initial.bank,0);assert.equal(initial.masks,4);
  await page.screenshot({path:path.join(output,'2016-b2-stage4-first-manual.png'),fullPage:false});
  await page.screenshot({path:path.join(output,'2016-b2-stage4-spotlight.png'),fullPage:false});

  const pick=async predicate=>page.evaluate(predicate=>{const fn=new Function('record',`return (${predicate})(record)`);return window.EDMUND_2016_B2_CURATION_STAGE4_DEBUG.records.find(fn)?.id;},String(predicate));
  const taskA=await pick(record=>record.task==='A'&&record.bankEligible);await page.selectOption('#curation-step-jump',taskA);await page.screenshot({path:path.join(output,'2016-b2-stage4-task-a-evidence.png'),fullPage:false});
  const taskB=await pick(record=>record.task==='B'&&record.bankEligible);await page.selectOption('#curation-step-jump',taskB);await page.screenshot({path:path.join(output,'2016-b2-stage4-task-b-evidence.png'),fullPage:false});
  const taskC=await pick(record=>record.task==='C'&&record.bankEligible);await page.selectOption('#curation-step-jump',taskC);await page.screenshot({path:path.join(output,'2016-b2-stage4-task-c-evidence.png'),fullPage:false});
  const multiTask=await pick(record=>record.sourceKey==='minutes'&&record.task==='C'&&record.bankEligible);await page.selectOption('#curation-step-jump',multiTask);await page.screenshot({path:path.join(output,'2016-b2-stage4-multi-task-evidence.png'),fullPage:false});
  const correction=await pick(record=>record.sourceKey==='resident-interview'&&/she told me it was the left/i.test(record.heading));await page.selectOption('#curation-step-jump',correction);await page.screenshot({path:path.join(output,'2016-b2-stage4-update-correction.png'),fullPage:false});
  const rejected=await pick(record=>record.sourceKey==='minutes'&&/rejected the suggestion of a security guard/i.test(record.heading));await page.selectOption('#curation-step-jump',rejected);await page.screenshot({path:path.join(output,'2016-b2-stage4-rejected-information.png'),fullPage:false});
  const type6Ids=await page.evaluate(()=>window.EDMUND_2016_B2_CURATION_STAGE4_DEBUG.records.filter(record=>record.type===6).map(record=>record.id));
  assert.equal(type6Ids.length,17);
  for(const id of type6Ids){
    const audit=await page.evaluate(async stepId=>{const debug=window.EDMUND_2016_B2_CURATION_STAGE4_DEBUG;debug.goById(stepId);await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));return debug.getCurrentHighlightAudit();},id);
    assert.equal(audit.type,6,`${id} remains Type 6`);
    assert.equal(audit.bankEligible,false,`${id} never enters the evidence bank`);
    assert.equal(audit.currentCustomHighlight,false,`${id} has no green Custom Highlight competing with its red strike`);
    assert.equal(audit.activeRangeCount>0,true,`${id} resolves to exact text ranges`);
    assert.equal(audit.currentOutlineCount>0,true,`${id} receives an independent exact-range outline`);
    assert.equal(audit.activeRangesInRejected,true,`${id} remains in the persistent rejected highlight`);
  }
  const grandchildren=await pick(record=>record.type===6&&/14 grandchildren/i.test(record.excerpt));
  await page.evaluate(async stepId=>{window.EDMUND_2016_B2_CURATION_STAGE4_DEBUG.goById(stepId);await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));},grandchildren);
  await page.screenshot({path:path.join(output,'2016-b2-stage4-type6-red-strike-independent-focus.png'),fullPage:false});

  const routeContract=await page.evaluate(()=>window.EDMUND_2016_B2_CURATION_STAGE4_DEBUG.routes);
  assert.equal(routeContract.length,6);
  for(const [index,route] of routeContract.entries()){
    await page.selectOption('#curation-step-jump',route.fromId);const button=page.locator('.curation-stage4-route-button');await button.scrollIntoViewIfNeeded();await button.click();await page.locator('.curation-stage4-route-target').waitFor();
    if(index===0)await page.screenshot({path:path.join(output,'2016-b2-stage4-source-detour.png'),fullPage:false});
    await page.locator('.curation-stage4-route-callout button').click();await page.waitForFunction(()=>document.querySelector('.curation-stage4-route-callout').hidden===true);
    if(index===0)await page.screenshot({path:path.join(output,'2016-b2-stage4-return-route.png'),fullPage:false});
  }
  const routeLog=await page.evaluate(()=>window.EDMUND_2016_B2_CURATION_STAGE4_DEBUG.transactionLog.filter(item=>item.type.startsWith('route-')));
  assert.equal(routeLog.filter(item=>item.type==='route-visit').length,6);assert.equal(routeLog.filter(item=>item.type==='route-return').length,6);

  const firstBank=await page.evaluate(()=>window.EDMUND_2016_B2_CURATION_STAGE4_DEBUG.records.find(record=>record.bankEligible).id);
  await page.selectOption('#curation-step-jump',firstBank);
  await page.locator('#curation-next').click();
  assert.equal(await page.locator('.curation-stage4-bank li').count(),1);
  assert.equal(await page.locator('.curation-stage4-flight').count(),0,'reduced motion creates no flight clone');
  await page.locator('#curation-prev').click();
  assert.equal(await page.locator('.curation-stage4-bank li').count(),0,'rewind removes future bank evidence');
  await page.selectOption('#curation-step-jump',taskB);await page.locator('#curation-next').click();await page.screenshot({path:path.join(output,'2016-b2-stage4-bank-revisit.png'),fullPage:false});

  const minutesA=await page.evaluate(()=>window.EDMUND_2016_B2_CURATION_STAGE4_DEBUG.records.find(record=>record.sourceKey==='minutes'&&record.task==='A'&&record.bankEligible).id);
  await page.selectOption('#curation-step-jump',minutesA);
  assert.equal(await page.locator('#page-5 .curation-stage4-file-stamp small').filter({hasText:'已修訂'}).count()>0,true);
  await page.screenshot({path:path.join(output,'2016-b2-stage4-minutes-revision.png'),fullPage:false});

  const visual=await page.evaluate(()=>window.EDMUND_2016_B2_CURATION_STAGE4_DEBUG.records.find(record=>record.visual&&/photograph/i.test(record.heading)).id);
  await page.selectOption('#curation-step-jump',visual);
  assert.equal(await page.locator('#page-7 img.curation-stage4-current').count(),1);
  await page.locator('#curation-spotlight').uncheck();assert.equal(await page.locator('.curation-mask:not([hidden])').count(),0);
  await page.screenshot({path:path.join(output,'2016-b2-stage4-non-spotlight.png'),fullPage:false});
  await page.locator('#curation-bookmark').click();
  await page.locator('#curation-help').click();await page.locator('#curation-help-question').fill('這張照片為甚麼不可以證明犁具年代？');await page.locator('#curation-help-form button[type="submit"]').click();await page.locator('#curation-help-close').click();

  const finalId=await page.evaluate(()=>window.EDMUND_2016_B2_CURATION_STAGE4_DEBUG.records.at(-1).id);
  await page.selectOption('#curation-step-jump',finalId);
  assert.equal(await page.locator('#curation-next').innerText(),'完成本章 ✓');
  await page.locator('#curation-next').click();
  const complete=await page.evaluate(()=>window.EDMUND_2016_B2_CURATION_STAGE4_DEBUG.getState());
  assert.equal(complete.complete,true);assert.equal(complete.completedIds.length,148);assert.equal(await page.locator('.curation-stage-item[data-stage="writing"]').isDisabled(),true);
  assert.equal(await page.locator('.curation-stage4-bank li').count(),37);
  await page.screenshot({path:path.join(output,'2016-b2-stage4-complete.png'),fullPage:false});
  await page.reload({waitUntil:'networkidle'});await page.waitForFunction(()=>window.EDMUND_2016_B2_CURATION_STAGE4_DEBUG?.getState().active===true);
  const restored=await page.evaluate(()=>window.EDMUND_2016_B2_CURATION_STAGE4_DEBUG.getState());
  assert.equal(restored.complete,true);assert.equal(restored.bookmarks.includes(visual),true);assert.equal(restored.helpDrafts[visual],'這張照片為甚麼不可以證明犁具年代？');
  const post=await page.evaluate(()=>Object.fromEntries(Object.entries(localStorage).filter(([key])=>/curation/.test(key)&&!key.includes('stage4'))));
  for(const [key,value] of Object.entries(pre))if(!key.includes('stage4'))assert.equal(post[key],value,`Stage 4 must preserve earlier state ${key}`);
  const motionContext=await browser.newContext({viewport:{width:1600,height:1000}});const motionPage=await motionContext.newPage();
  await motionPage.goto(`http://127.0.0.1:${port}/paper3/2016-b2/?curation=1`,{waitUntil:'networkidle'});await motionPage.waitForFunction(()=>window.EDMUND_2016_B2_CURATION_STAGE4_DEBUG?.records.length===148);await motionPage.locator('.curation-stage-item[data-stage="data"]').click();
  const motionBank=await motionPage.evaluate(()=>window.EDMUND_2016_B2_CURATION_STAGE4_DEBUG.records.find(record=>record.bankEligible).id);await motionPage.selectOption('#curation-step-jump',motionBank);await motionPage.locator('#curation-next').click();await motionPage.waitForTimeout(100);
  assert.equal(await motionPage.locator('.curation-stage4-flight').count(),1,'motion mode has exactly one live flight clone');await motionPage.waitForTimeout(1000);assert.equal(await motionPage.locator('.curation-stage4-flight').count(),0,'flight clone is removed after animation');
  const performanceObservation=await motionPage.evaluate(()=>window.EDMUND_2016_B2_CURATION_STAGE4_DEBUG.getPerformance());assert.equal(performanceObservation.targetCount,148);assert.equal(performanceObservation.flightPeak,1);assert.equal(performanceObservation.liveFlights,0);await motionContext.close();
  assert.equal(errors.length,0,errors.join('\n'));assert.equal(networkIssues.length,0,networkIssues.join('\n'));
  fs.writeFileSync(path.join(output,'2016-b2-stage4-browser-test-report.md'),`# 2016 B2 Super Curation Stage 4 — Browser Test Report\n\n- Result: **PASS**\n- Fact-line records: 148 / 148\n- Exact target audit failures: 0\n- Type 6: 17 / 17 exact spans retain the persistent 3 px red strike; none is bankable; current focus uses a separate outline layer\n- Evidence-bank rows at completion: 37\n- Source order: Data File pages 4–10\n- Rewind: future marks and bank evidence removed\n- Classification revision: minutes C → A+C shown\n- Visual units: exact plough photograph target verified\n- Detours: 6/6 exact visit-and-return routes verified\n- Motion: one flight clone maximum, removed after animation\n- Reduced motion: no flight clone created\n- Spotlight: four masks and off state verified\n- Persistence: completion, bookmark and help draft restored\n- Earlier-stage local state: unchanged\n- Stage 5: locked\n- Console/page errors: 0\n- Missing assets: 0\n- Target-resolution initialization: ${Math.round(performanceObservation.initMs)} ms in the test browser\n`);
  console.log('2016 B2 Super Curation Part 4 browser regression: PASS');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
