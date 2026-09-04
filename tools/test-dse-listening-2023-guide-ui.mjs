// Uses the actual portal renderer with an isolated mock account/RPC. All remote
// requests are blocked: this test cannot change a student's production data.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const out=process.env.DSE_QA_OUTPUT||'/private/tmp/dse-2023-guide-ui';fs.mkdirSync(out,{recursive:true});
const scripts=['listening-system-catalog.js','dse-listening-2023-transcript.js','dse-listening-2023-data.js'];
const html=fs.readFileSync(path.join(root,'listening-system.html'),'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace('</body>',`<script src="/__qa-config.js"></script>${scripts.map(file=>`<script src="/${file}"></script>`).join('')}<script type="module" src="/__qa-system.js"></script></body>`);
const js=fs.readFileSync(path.join(root,'listening-system.js'),'utf8').replace(/initialise\(\);\s*$/,`window.dseQA={state,open:openDseYear,render:renderDseTask,calls:[]};state.user={id:'qa',name:'QA'};state.token='isolated-qa';state.supabase={auth:{getSession:async()=>({data:{session:{user:{id:'qa'}}}})},rpc:async(name,args)=>{window.dseQA.calls.push({name,args});return {data:[],error:null};}};showView('dse');renderDseYearGrid();`);
let guideRequests=0;
const server=http.createServer((req,res)=>{
 const pathname=new URL(req.url,'http://localhost').pathname;
 if(pathname==='/__qa'){res.setHeader('Content-Type','text/html');res.end(html);return;}
 if(pathname==='/__qa-system.js'){res.setHeader('Content-Type','text/javascript');res.end(js);return;}
 if(pathname==='/__qa-config.js'){res.setHeader('Content-Type','text/javascript');res.end("window.EDMUND_SUPABASE={url:'https://database.test',anonKey:'qa'};");return;}
 if(pathname.endsWith('/2023/guide.json'))guideRequests++;
 const file=path.resolve(root,'.'+decodeURIComponent(pathname));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){res.writeHead(404).end();return;}
 res.setHeader('Content-Type',({'.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.webp':'image/webp'})[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 const origin=`http://127.0.0.1:${server.address().port}`;
 await page.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
 await page.goto(origin+'/__qa');await page.waitForFunction(()=>!!window.dseQA);
 assert.equal(guideRequests,0,'No guide fetched on login/home');
 await page.evaluate(()=>window.dseQA.open(2023,1));await page.waitForSelector('[data-dse-reveal="1"]');
 assert.equal(guideRequests,1);
 assert.equal(await page.locator('[data-dse-analysis]:visible').count(),0);
 assert.equal(await page.locator('[data-dse-question-zh]:visible').count(),0);
 assert.equal(await page.locator('[data-dse-zh]:visible').count(),0);
 await page.locator('[data-dse-answer-q="1"]').fill('my own answer');
 await page.locator('label').filter({has:page.locator('[data-dse-answer-q="4"][value="B"]')}).click();
 assert.equal(await page.locator('[data-dse-answer-q="4"][value="B"]').isChecked(),true);
 assert.equal(await page.locator('.dse-multiple-choice [data-dse-reveal]').count(),0,'Reveal outside clickable MC rows');
 assert.equal(await page.locator('[data-dse-reveal="4"]').count(),1);
 await page.locator('[data-dse-toggle-question-zh]').click();
 assert.equal(await page.locator('[data-dse-question-zh]:visible').count(),14);
 assert.equal(await page.locator('[data-dse-zh]:visible').count(),0,'Independent transcript toggle');
 assert.equal(await page.locator('[data-dse-analysis]:visible').count(),0,'Translation does not reveal answers');
 await page.screenshot({path:path.join(out,'questions-desktop.png')});
 await page.locator('[data-dse-reveal="4"]').click();await page.locator('[data-dse-analysis="4"]').click();
 assert.match(await page.locator('[data-dse-dialog-answer]').innerText(),/^A/);
 assert.match(await page.locator('[data-dse-dialog-copy]').innerText(),/外公/);
 await page.locator('[data-dse-dialog-actions] button').click();
 const saved=await page.evaluate(()=>window.dseQA.calls.at(-1));
 assert.equal(saved.name,'learning_portal_set_bookmark');
 assert.equal(saved.args.p_href,'listening-system.html?section=dse&year=2023&task=1#dse-analysis-q4');
 await page.keyboard.press('Escape');assert.equal(await page.locator('[data-dse-study-dialog]').isVisible(),false);
 await page.locator('[data-dse-all-answers]').click();assert.equal(await page.locator('[data-dse-analysis]:visible').count(),13);
 assert.equal(await page.locator('[data-dse-answer-q="1"]').inputValue(),'my own answer');
 assert.equal(await page.locator('[data-dse-answer-q="4"][value="B"]').isChecked(),true);
 assert.match(await page.locator('[data-dse-progress-copy]').innerText(),/^2 \/ 53/);
 await page.locator('[data-dse-hide-answers]').click();
 await page.locator('[data-dse-toggle-zh]').click();assert.equal(await page.locator('[data-dse-zh]:visible').count(),32);
 await page.evaluate(()=>window.dseQA.render(1));
 assert.equal(await page.locator('[data-dse-question-zh]:visible').count(),14);
 assert.equal(await page.locator('[data-dse-zh]:visible').count(),32);
 assert.equal(await page.locator('[data-dse-answer-q="1"]').inputValue(),'my own answer');
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:1000});
  for(const task of [1,2,3,4]){
   await page.evaluate(task=>window.dseQA.open(2023,task),task);
   assert.equal(await page.locator('[data-dse-reveal]').count(),{1:13,2:13,3:14,4:13}[task]);
   assert.equal(await page.locator('[data-dse-transcript-line]').count(),{1:32,2:19,3:39,4:15}[task]);
   if(await page.locator('[data-dse-toggle-question-zh]').getAttribute('aria-pressed')==='false')await page.locator('[data-dse-toggle-question-zh]').click();
   assert.equal(await page.locator('[data-dse-question-zh]:visible').count(),{1:14,2:12,3:14,4:14}[task]);
   await page.locator('[data-dse-full-analysis]').evaluate(node=>node.open=true);
   assert.equal(await page.locator('.listening-analysis-card:visible').count(),{1:13,2:13,3:14,4:13}[task]);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`Task ${task} at ${width}px`);
   await page.locator('.dse-paper-sheet').scrollIntoViewIfNeeded();
   await page.screenshot({path:path.join(out,`task-${task}-${width}.png`)});
  }
 }
 await page.evaluate(()=>{location.hash='dse-analysis-q27';window.dseQA.open(2023,3,{update:false});});
 assert.equal(await page.locator('#dse-analysis-q27').isVisible(),true);
 await page.setViewportSize({width:1440,height:1000});
 await page.locator('[data-dse-full-analysis]').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,'analysis.png')});
 await page.evaluate(()=>{window.dseQA.state.dseTracks.set('2023:part-a:3',{url:'https://audio.test/task3.mp3'});window.dseQA.render(3);const audio=document.querySelector('[data-dse-audio-task]');Object.defineProperty(audio,'currentTime',{value:0,writable:true});audio.play=()=>Promise.resolve();});
 await page.locator('[data-dse-toggle-zh]').click();
 await page.locator('[data-dse-transcript-line="7"]').click();
 assert.equal(await page.locator('[data-dse-audio-task]').evaluate(audio=>audio.currentTime),117.86);
 await page.locator('[data-dse-transcript-line="7"] [data-bookmark-item]').click();
 assert.equal(await page.evaluate(()=>window.dseQA.calls.at(-1).args.p_href),'listening-system.html?section=dse&year=2023&task=3#dse-transcript-3-7');
 await page.locator('[data-dse-transcript-line="7"]').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,'transcript.png')});
 assert.equal(guideRequests,1,'Guide reused across all tasks');assert.deepEqual(errors,[]);
 console.log('2023 UI passed: lazy loading, all 53 answers, independent translations, MC row safety, retained input/progress, bookmark links, audio jumps and all four mobile/desktop layouts. Screenshots:',out);
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
