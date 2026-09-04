// Uses the actual portal renderer with an isolated mock account/RPC. All remote
// requests are blocked: this test cannot change a student's production data.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const out=process.env.DSE_QA_OUTPUT||'/private/tmp/dse-archive-guide-ui';fs.mkdirSync(out,{recursive:true});
const years=process.env.DSE_GUIDE_YEARS?.split(',').map(Number)||[2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2023];
const scripts=['listening-system-catalog.js',...years.flatMap(year=>[`dse-listening-${year}-transcript.js`,`dse-listening-${year}-data.js`])];
const html=fs.readFileSync(path.join(root,'listening-system.html'),'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace('</body>',`<script src="/__qa-config.js"></script>${scripts.map(file=>`<script src="/${file}"></script>`).join('')}<script type="module" src="/__qa-system.js"></script></body>`);
const js=fs.readFileSync(path.join(root,'listening-system.js'),'utf8').replace(/initialise\(\);\s*$/,`window.dseQA={state,open:openDseYear,render:renderDseTask,calls:[]};state.user={id:'qa',name:'QA'};state.token='isolated-qa';state.supabase={auth:{getSession:async()=>({data:{session:{user:{id:'qa'}}}})},rpc:async(name,args)=>{window.dseQA.calls.push({name,args});return {data:[],error:null};}};showView('dse');renderDseYearGrid();`);
let guideRequests=0;
const server=http.createServer((req,res)=>{
 const pathname=new URL(req.url,'http://localhost').pathname;
 if(pathname==='/__qa'){res.setHeader('Content-Type','text/html');res.end(html);return;}
 if(pathname==='/__qa-system.js'){res.setHeader('Content-Type','text/javascript');res.end(js);return;}
 if(pathname==='/__qa-config.js'){res.setHeader('Content-Type','text/javascript');res.end("window.EDMUND_SUPABASE={url:'https://database.test',anonKey:'qa'};");return;}
 if(/\/20\d{2}\/guide\.json$/.test(pathname))guideRequests++;
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

 let tasks=0;
 for(const year of years){
  const guide=JSON.parse(fs.readFileSync(path.join(root,`assets/dse-listening/${year}/guide.json`),'utf8'));
  for(const width of [1440,390]){
   await page.setViewportSize({width,height:1000});
   for(const task of [1,2,3,4]){
    const entries=Object.entries(guide.analysis).filter(([,row])=>row.task===task),number=entries[0][0];
    await page.evaluate(({year,task})=>{window.dseQA.state.dseTracks.set(`${year}:part-a:${task}`,{url:'https://audio.test/isolated.mp3'});window.dseQA.open(year,task);},{year,task});
    await page.waitForSelector(`[data-dse-reveal="${number}"]`);
    assert.equal(await page.locator('[data-dse-reveal]').count(),entries.length,`${year} T${task} every question control`);
    assert.equal(await page.locator('[data-dse-answer-replay]').count(),entries.length);
    assert.equal(await page.locator('label [data-dse-reveal]').count(),0,'Tools outside clickable option labels');
    assert.equal(await page.locator('[data-dse-transcript-line]').count(),guide.transcript[task].length);
    if(await page.locator('[data-dse-toggle-question-zh]').getAttribute('aria-pressed')==='false')await page.locator('[data-dse-toggle-question-zh]').click();
    assert.equal(await page.locator('[data-dse-question-zh]:visible').count(),guide.questions[task].blocks.length+1);
    const field=page.locator('input[data-dse-answer-q]:not([type="radio"]):not([type="checkbox"])').first();
    if(await field.count())await field.fill('preserve this answer');
    const answersBefore=await page.evaluate(()=>[...window.dseQA.state.dseAnswers]);
    await page.locator('[data-dse-full-analysis]').evaluate(node=>node.open=true);
    await page.evaluate(()=>{
     const audio=document.querySelector('[data-dse-audio-task]');
     Object.defineProperty(audio,'currentTime',{value:0,writable:true,configurable:true});
     window.dseQA.playCalls=0;audio.play=()=>{window.dseQA.playCalls++;return Promise.resolve();};
     window.dseQA.state.speed=1.25;
    });
    await page.locator(`#dse-analysis-q${number} [data-dse-answer-replay]`).click();
    const position=await page.locator('[data-dse-audio-task]').evaluate(audio=>({time:audio.currentTime,rate:audio.playbackRate}));
    assert.equal(position.time,Math.max(0,entries[0][1].audioTime-15));
    assert.equal(position.rate,1.25);
    assert.equal(await page.evaluate(()=>window.dseQA.playCalls),1);
    if(await page.locator(`[data-dse-reveal="${number}"]`).getAttribute('aria-pressed')==='false')await page.locator(`[data-dse-reveal="${number}"]`).click();
    await page.locator(`[data-dse-analysis="${number}"]`).click();
    assert.equal(await page.locator('[data-dse-study-dialog]').isVisible(),true);
    await page.locator('[data-dse-dialog-actions] [data-dse-answer-replay]').click();
    assert.equal(await page.evaluate(()=>window.dseQA.playCalls),2);
    assert.deepEqual(await page.evaluate(()=>[...window.dseQA.state.dseAnswers]),answersBefore);
    await page.keyboard.press('Escape');
    await page.locator('[data-dse-toggle-question-zh]').click();
    assert.equal(await page.locator('[data-dse-question-zh]:visible').count(),0);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`${year} T${task} at ${width}px`);
    if(task===1||year===2018&&task===2){
     await page.locator('[data-dse-full-analysis]').scrollIntoViewIfNeeded();
     await page.screenshot({path:path.join(out,`${year}-task${task}-${width}.png`)});
    }
    tasks++;
   }
  }
 }
 assert.equal(guideRequests,years.length,'One lazy guide request per opened year');
 assert.deepEqual(errors,[]);
 console.log(`Archive browser QA passed: ${tasks} task/viewport combinations, translations, every reveal/replay control, 15-second seek, speed retention and unchanged answers. ${out}`);
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
