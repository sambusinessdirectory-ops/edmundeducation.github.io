import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {tasksByYear} from './listening/archive-question-layouts.mjs';
import {questionNumbers} from '../dse-listening-question-ui.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const allTasksByYear={...tasksByYear}, dataContext={window:{}};
for(const year of [2016,2021,2023]){
 vm.runInNewContext(fs.readFileSync(path.join(root,`dse-listening-${year}-data.js`),'utf8'),dataContext);
 allTasksByYear[year]=JSON.parse(JSON.stringify(dataContext.window[`EDMUND_DSE_LISTENING_${year}`].tasks));
}
const playwright=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const source=fs.readFileSync(path.join(root,'listening-system.js'),'utf8');
// Exercise the production renderer, not a second implementation of its markup.
const renderer=source.slice(source.indexOf('function dseAnswerInput('),source.indexOf('function dseAllQuestionNumbers('));
const fixture=`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/listening-system.css"><main class="listening-shell"><div class="dse-paper-sheet" id="host"></div></main><script type="module">
import {answerTokens,nativeBlock,questionNumbers,handleNativeInput,handleMazeClick} from '/dse-listening-question-ui.mjs';
import {upgradeDseImages} from '/dse-listening-images.mjs';
const state={dseAnswers:new Map()};
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
${renderer}
window.qa={state,render(task){document.getElementById('host').innerHTML=task.blocks.map(renderDseBlock).join('');},answers(){return Object.fromEntries(state.dseAnswers);}};
document.addEventListener('input',event=>{
 if(handleNativeInput(event.target,document,state.dseAnswers))return;
 const target=event.target;
 if(target.matches('[data-dse-answer-q]')){
  const n=Number(target.dataset.dseAnswerQ);
  if(target.type==='checkbox'){
   const limit=Number(target.dataset.dseChoiceLimit);
   if(limit && document.querySelectorAll('[data-dse-answer-q="'+n+'"]:checked').length>limit)target.checked=false;
   state.dseAnswers.set(n,[...document.querySelectorAll('[data-dse-answer-q="'+n+'"]:checked')].map(x=>x.value).join(','));
  }else state.dseAnswers.set(n,target.value);
 }
});
document.addEventListener('click',event=>handleMazeClick(event.target,state.dseAnswers));
</script>`;
const server=http.createServer((req,res)=>{
 if(req.url==='/__question-test'){res.setHeader('Content-Type','text/html');res.end(fixture);return;}
 const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){res.writeHead(404).end();return;}
 const types={'.css':'text/css','.mjs':'text/javascript','.js':'text/javascript','.webp':'image/webp'};
 res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');
 fs.createReadStream(file).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser;
try {
 browser=await playwright.chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 const origin=`http://127.0.0.1:${server.address().port}`;
 await page.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
 await page.goto(origin+'/__question-test');
 await page.waitForFunction(()=>!!window.qa);
 const render=async(year,task)=>page.evaluate(task=>window.qa.render(task),tasksByYear[year][task-1]);
 const answers=()=>page.evaluate(()=>window.qa.answers());
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:1000});
  for(const [year,tasks] of Object.entries(allTasksByYear))for(const task of tasks){
   await page.evaluate(task=>{window.qa.state.dseAnswers.clear();window.qa.render(task);},task);
   await page.locator('img').evaluateAll(images=>Promise.all(images.map(im=>im.decode().catch(()=>{}))));
   const checks=await page.evaluate(()=>({
    overflow:document.documentElement.scrollWidth>window.innerWidth+1,
    images:[...document.images].every(im=>im.naturalWidth>0),
    enhanced:[...document.images].every(im=>im.currentSrc.includes('/enhanced-v1/')&&!im.currentSrc.includes('-3840.webp')),
    placeholders:/\{\{\d/.test(document.getElementById('host').textContent),
    numbers:[...new Set([...document.querySelectorAll('[data-dse-answer-q],[data-dse-answer-group],[data-dse-order-group],[data-dse-ranking],[data-dse-maze-q]')].flatMap(el=>(el.dataset.dseAnswerQ||el.dataset.dseAnswerGroup||el.dataset.dseOrderGroup||el.dataset.dseRanking||el.dataset.dseMazeQ).split(',').map(Number)))].sort((a,b)=>a-b)
   }));
   assert.equal(checks.overflow,false,`${year} Task ${task.number}, ${width}px page overflow`);
   assert.equal(checks.images,true,`${year} Task ${task.number} broken image`);
   assert.equal(checks.enhanced,true,`${year} Task ${task.number} must load compact enhanced images, not full 4K`);
   assert.equal(checks.placeholders,false,`${year} Task ${task.number} unreplaced token`);
   assert.deepEqual(checks.numbers,questionNumbers(task),`${year} Task ${task.number} input coverage`);
  }
 }
 await page.setViewportSize({width:1440,height:1000});
 await render(2020,1);
 for(const key of ['A','B','C','D'])await page.locator(`[data-dse-answer-group="8,9,10"][value="${key}"]`).check({force:true}).catch(()=>{});
 assert.equal(await page.locator('[data-dse-answer-group]:checked').count(),3);
 assert.deepEqual([(await answers())[8],(await answers())[9],(await answers())[10]],['A','B','C']);
 await page.locator('[data-dse-answer-q="11"]').selectOption('G');
 await render(2020,2);await render(2020,1);
 assert.equal(await page.locator('[data-dse-answer-q="11"]').inputValue(),'G');
 await render(2020,2);
 await page.locator('[data-dse-order-group][data-choice="C"]').selectOption('1');
 await page.locator('[data-dse-order-group][data-choice="E"]').selectOption('2');
 await page.locator('[data-dse-order-group][data-choice="A"]').selectOption('1');
 assert.equal((await answers())[20],'A');assert.equal((await answers())[21],'E');
 assert.equal(await page.locator('[data-dse-order-group][data-choice="C"]').inputValue(),'');
 await render(2013,2);
 await page.locator('[data-dse-ranking][data-item="0"]').selectOption('1');
 await page.locator('[data-dse-ranking][data-item="1"]').selectOption('1');
 assert.deepEqual(JSON.parse((await answers())[15]),{'1':'1'});
 await render(2018,2);
 const cell=page.locator('[data-dse-maze-q="17"][data-cell="A1"]');
 await cell.click();assert.equal(JSON.parse((await answers())[17]).A1,'O');
 await cell.click();assert.equal(JSON.parse((await answers())[17]).A1,'M');
 await render(2018,1);await render(2018,2);
 assert.equal(await cell.textContent(),'M');await cell.click();assert.equal((await answers())[17],'');
 assert.equal(await page.locator('[data-dse-maze-q="17"][data-cell="E6"]').isDisabled(),true);
 const out=process.env.DSE_QA_OUTPUT;
 if(out){
  fs.mkdirSync(out,{recursive:true});
  for(const [year,task] of [[2013,3],[2018,2],[2020,1],[2020,2]]){
   await page.evaluate(()=>window.qa.state.dseAnswers.clear());
   await render(year,task);await page.screenshot({path:path.join(out,`${year}-task${task}.png`),fullPage:true});
  }
  await page.setViewportSize({width:390,height:844});await render(2020,2);
  await page.screenshot({path:path.join(out,'2020-task2-mobile.png'),fullPage:true});
 }
 assert.deepEqual(errors,[]);
 console.log('Native DSE questions: all 44 tasks pass desktop/mobile layout, enhanced-image and field coverage; group limits, ordering, ranking, maze and task-switch retention passed.');
} finally {await browser?.close();await new Promise(resolve=>server.close(resolve));}
