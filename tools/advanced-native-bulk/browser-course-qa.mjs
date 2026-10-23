import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const playwright=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const engine=process.env.ADVANCED_NATIVE_QA_BROWSER||'chromium';
if(!['chromium','webkit'].includes(engine))throw Error('Use chromium or webkit.');
const {default:lessonIndex}=await import(path.join(root,'natural-english/advanced-expressions.mjs'));
const {hydrateModule}=await import(path.join(root,'natural-english/catalogue.mjs'));
const selected=process.env.ADVANCED_NATIVE_QA_IDS?.split(',');
const lessons=await Promise.all(lessonIndex.filter(lesson=>!selected||selected.includes(lesson.id)).map(lesson=>hydrateModule(lesson.id)));
const origin=process.argv[2]||'http://127.0.0.1:8768';
const output=process.argv[3]||'/private/tmp/advanced-native-polish-qa';
await fs.mkdir(output,{recursive:true});
const browser=await playwright[engine].launch({headless:true});
const context=await browser.newContext({serviceWorkers:'block',viewport:{width:1280,height:1000},reducedMotion:'reduce'});
await context.route('https://cdn.jsdelivr.net/**',route=>route.abort());
// The shared header sends its independent farm-visit request with fetch, not
// the synthetic Supabase client. Keep this preview wholly off production RPC.
await context.route('**/rest/v1/rpc/eddie_farm_visit',route=>route.fulfill({status:200,contentType:'application/json',body:'[]'}));
await context.addInitScript(()=>{
 window.__answerResults=[];window.__notes=0;
 document.addEventListener('edmund:answer-result',e=>window.__answerResults.push(e.detail.correct));
 const ac=window.AudioContext||window.webkitAudioContext;
 if(ac){const create=ac.prototype.createOscillator;ac.prototype.createOscillator=function(...args){window.__notes++;return create.apply(this,args);};}

 const id='f940019e-0588-4ab9-8b81-135b280a9066',token='46744942-d0cf-4823-92ba-b35581d407dc',events=new Map();
 window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{access_token:'synthetic-preview'}}}),signInAnonymously:async()=>({data:{}})},rpc:(name,args)=>({abortSignal:async()=>{
  let data=[];
  if(name==='flashcard_student_login')data=[{session_token:token}];
  else if(name==='flashcard_student_session_profile')data=[{id,name:'Course Preview',session_token:token}];
  else if(name==='natural_english_modules_sync'){for(const event of args.p_events||[])events.set(event.id,event);data={events:[...events.values()],timeDays:[]};}
  return {data,error:null};
 }})})};
});
const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(origin+'/advanced-native.html',{waitUntil:'networkidle'});
await page.locator('[name=username]').fill('Course Preview');await page.locator('[name=password]').fill('preview');await page.locator('[data-login-form] [type=submit]').click();
await page.locator('[data-module="advanced-native-010"]').waitFor();
let checkedOptions=0,checkedPrompts=0,checkedExamples=0,checkedTakeaways=0;const wraps=[],completedLessons=[];
const bracketZh=value=>{const text=String(value).trim();return /^（[\s\S]*）$/.test(text)?text:`（${text}）`;};
let activeLesson=null,activeStep=null;
async function checkpoint(failure=null){
 await fs.writeFile(`${output}/wrap-audit.json`,JSON.stringify(wraps,null,2));
 await fs.writeFile(`${output}/checkpoint.json`,JSON.stringify({origin,engine,completedLessons,activeLesson,activeStep,checkedPrompts,checkedOptions,checkedExamples,checkedTakeaways,pageErrors:errors,failure},null,2));
}
process.on('uncaughtException',async error=>{
 console.error(error);
 try{await checkpoint({message:error.message,stack:error.stack});await page.screenshot({path:`${output}/failure.png`,fullPage:false});}
 finally{await browser.close();process.exit(1);}
});
async function widths(label){
 for(const width of [1280,1024,768,600,390,320]){
  await page.setViewportSize({width,height:1000});
  const size=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));
  assert.ok(size.scroll<=size.width+1,`${label}: ${JSON.stringify(size)}`);
  const orphans=await page.evaluate(()=>{
   const out=[];
   for(const el of document.querySelectorAll('.advanced-module-card .module-card-copy strong,.advanced-module-card em,[data-lesson-title],.writing-glossary td,.writing-glossary strong,.writing-glossary>p,.feedback p,.stage-heading h2,.stage-heading>p:last-child,.question h3,.choice-original,.sentence-translation,.open-review li>span:first-child,.open-review>p,.model-sentence')){
    if(!el.getBoundingClientRect().height)continue;
    const lines=[],walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let node;
    while(node=walker.nextNode()){
     if(!el.matches('.sentence-translation')&&node.parentElement.closest('.sentence-translation'))continue;
     for(let i=0;i<node.length;i++){
      const ch=node.data[i];
      const range=document.createRange();range.setStart(node,i);range.setEnd(node,i+1);const r=range.getBoundingClientRect();
      if(!r.height)continue;let line=lines.find(x=>Math.abs(x.y-r.y)<4);if(!line){line={y:r.y,text:''};lines.push(line);}line.text+=ch;
     }
    }
    lines.sort((a,b)=>a.y-b.y);if(lines.length<2)continue;
    const last=lines.at(-1).text;if(last.includes('_')&&/^[_\s\p{P}\p{S}]+$/u.test(last))continue;
    // A dialogue cloze can intentionally end with a speaker cue and blank.
    if(el.matches('.sentence-translation')&&/^[甲乙丙丁][：:][_\s]+[）)]?$/.test(last.trim()))continue;
    const plain=last.replace(/[\s\p{P}\p{S}]/gu,'');
    const chinese=(plain.match(/[\u3400-\u9fff]/g)||[]).length;
    if(!plain||chinese===1&&!/[A-Za-z]/.test(plain)||!last.includes('_')&&!chinese&&(el.textContent.match(/[A-Za-z]+/g)||[]).length>3&&(last.match(/[A-Za-z]+/g)||[]).length===1)out.push({tag:el.className||el.tagName,last,text:el.textContent.slice(0,160)});
   }
   return out;
  });
  wraps.push(...orphans.map(x=>({label,width,...x})));
 }
 await page.setViewportSize({width:1280,height:1000});
}
await widths('library');
for(const lesson of lessons){
 activeLesson=lesson.id;activeStep=null;
 const card=page.locator(`[data-module="${lesson.id}"]`);
 await card.evaluate(el=>el.scrollIntoView({behavior:'instant',block:'center'}));
 // WebKit can lose a coordinate click after repeated viewport/scroll changes.
 // Activate the native button by keyboard for deterministic content inspection;
 // pointer activation has separate coverage in the resilience browser suite.
 if(engine==='webkit'){await card.focus();await page.keyboard.press('Enter');}else await card.click();
 await page.waitForFunction(label=>document.querySelector('[data-lesson-kicker]').textContent===label,`第 ${lesson.number} 課`);
 assert.ok(!(await page.locator('[data-stage]').innerText()).includes(lesson.steps[0].zh),'first listening attempt keeps translation concealed');
 for(const [index,step] of lesson.steps.entries()){
  activeStep=index+1;
  await page.mouse.move(0, 0); await page.keyboard.press('Escape');
  await page.locator(`[data-step="${index}"]`).click();
  if(step.questions.length){
   const q=lesson.questions.find(q=>q.id===step.questions[0]);
   if(q.promptZh){assert.equal(await page.locator('h3 .sentence-translation').textContent(),bracketZh(q.promptZh));checkedPrompts++;}
   if(q.type==='mc'){
    for(const button of await page.locator(`[data-q="${q.id}"]`).all()){
     const choice=q.options[Number(await button.getAttribute('data-choice'))],translation=q.optionZh?.[choice];
     if(translation){assert.equal(await button.locator('.sentence-translation').textContent(),bracketZh(translation));checkedOptions++;}
    }
    if(q.style==='audio'){
     const bad=q.options.find(option=>!q.answers.includes(option));
     await page.locator(`[data-q="${q.id}"][data-choice="${q.options.indexOf(bad)}"]`).click();
     assert.equal(await page.evaluate(()=>window.__answerResults.at(-1)),false);
    }
    if(q.style==='reply'){
     const other=q.options.find(option=>option!==q.golden);
     await page.locator(`[data-q="${q.id}"][data-choice="${q.options.indexOf(other)}"]`).click();
     assert.equal(await page.locator(`[data-q="${q.id}"]:disabled`).count(),0);
     const goldenButton=page.locator(`[data-q="${q.id}"][data-choice="${q.options.indexOf(q.golden)}"]`);
     // Answer feedback scrolls smoothly. Position the next choice explicitly
     // before clicking so WebKit cannot hit its former screen coordinates.
     await goldenButton.evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));
     await goldenButton.click();
     await page.waitForFunction(id=>document.querySelectorAll(`[data-q="${id}"].golden`).length===1,q.id);
     assert.equal(await page.locator(`[data-q="${q.id}"].golden`).count(),1);
     if(lesson.number===6)await page.screenshot({path:`${output}/lesson-06-reply.png`,fullPage:true});
    }else{
     if(lesson.number===6&&q.style==='branch')await page.screenshot({path:`${output}/lesson-06-dialogue.png`,fullPage:true});
     await page.locator(`[data-q="${q.id}"][data-choice="${q.options.indexOf(q.answers[0])}"]`).click({force:true});
     assert.equal(await page.evaluate(()=>window.__answerResults.at(-1)),true);
     if(q.style==='audio')assert.ok(await page.locator('.model .target-green').count());
     if(q.style==='audio')assert.equal(await page.locator('.model .sentence-translation').textContent(),bracketZh(lesson.steps[0].zh));
    }
   }else{
    assert.equal(await page.locator('.open-review').count(),0,'writing examples stay hidden until the attempt');
    await page.locator('textarea').fill(q.answers[0]);await page.locator('[data-open-reveal]').click();
    assert.ok(await page.locator('.open-review .target-yellow').count());
    for(const [i,answer] of q.answers.entries()){
     assert.equal(await page.locator('.open-review li .sentence-translation').nth(i).textContent(),bracketZh(q.answersZh[answer]));checkedExamples++;
    }
    if(lesson.number===6)await page.screenshot({path:`${output}/lesson-06-writing.png`,fullPage:true});
    await page.locator('[data-open-complete]').click();
   }
  }else{
   assert.equal(await page.locator('.model .sentence-translation').textContent(),bracketZh(step.zh));
   await page.locator('[data-skip]').click();
  }
  await widths(`${lesson.id} step ${index+1}`);
 }
 assert.match(await page.locator('[data-count]').innerText(),/6 \/ 6/);
 await page.locator('[data-next]').click();await page.locator('.finish').waitFor();
 const colours=await page.locator('.finish').evaluate(e=>({background:getComputedStyle(e).backgroundColor,text:getComputedStyle(e.querySelector('h2')).color,stage:getComputedStyle(e.parentElement).backgroundColor}));
 assert.deepEqual(colours,{background:'rgb(255, 255, 255)',text:'rgb(17, 17, 17)',stage:'rgb(255, 255, 255)'});
 assert.ok(await page.locator('.finish h2').isVisible());
 for(const [i,text] of lesson.takeaways.entries()){
  const button=page.locator('.finish .takeaway').nth(i);
  assert.equal(await button.getAttribute('data-say'),text,'audio still uses only the English sentence');
  assert.equal(await button.locator('.sentence-translation').textContent(),bracketZh(lesson.takeawaysZh[text]));checkedTakeaways++;
 }
 await widths(`${lesson.id} completion`);
 if ([11,61,75,125].includes(lesson.number)) {await page.setViewportSize({width:390,height:1000});await page.screenshot({path:`${output}/lesson-${lesson.number}-new-mobile.png`,fullPage:true});await page.setViewportSize({width:1280,height:1000});}
 console.log('checked',lesson.id);
 if(lesson.number===6)await page.screenshot({path:`${output}/lesson-06-finish.png`,fullPage:true});
 if(lesson.number===10){await page.setViewportSize({width:390,height:1000});await page.screenshot({path:`${output}/lesson-10-finish-mobile.png`,fullPage:true});await page.setViewportSize({width:1280,height:1000});}
 await page.locator('.finish [data-back-modules]').click();
 completedLessons.push(lesson.id);await checkpoint();
}
const native=await context.newPage();await native.goto(origin+'/natural-english.html',{waitUntil:'networkidle'});
if(await native.locator('[data-login]').isVisible()){
 await native.locator('[name=username]').fill('Course Preview');await native.locator('[name=password]').fill('preview');await native.locator('[data-login-form] [type=submit]').click();
}
await native.locator('[data-module="box"]').waitFor();
assert.equal(await native.locator('[data-module]').count(),466,'Native English keeps its own course library');
await native.locator('[data-module="box"]').click();assert.equal(await native.locator('.sentence-translation').count(),0,'Advanced Native translations are scoped to its course');
assert.deepEqual(errors,[]);
assert.ok(await page.evaluate(()=>window.__notes>0),'answer sound produces audio oscillator notes');
await fs.writeFile(`${output}/wrap-audit.json`,JSON.stringify(wraps,null,2));
assert.equal(wraps.length,0,JSON.stringify(wraps.slice(0,15),null,2));
const result={origin,engine,syntheticAccount:true,humanDeviceReviewClaimed:false,lessons:lessons.length,steps:lessons.reduce((sum,l)=>sum+l.steps.length,0),checkedPrompts,checkedOptions,checkedExamples,checkedTakeaways,lightCompletionScreens:lessons.length,widths:[1280,1024,768,600,390,320],pageErrors:errors};
await fs.writeFile(`${output}/result.json`,JSON.stringify(result,null,2));console.log('PASS bilingual and completion browser QA',JSON.stringify(result));await browser.close();
