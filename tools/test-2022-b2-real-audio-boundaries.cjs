const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||process.env.HOME+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..'),bundle='<link rel="stylesheet" href="/paper3/2022-b2/super-curation.css"><script defer src="/paper3/2022-b2/curation-data.js"></script><script defer src="/paper3/2022-b2/super-curation-v3.js"></script>';
const server=http.createServer((req,res)=>{const pathname=new URL(req.url,'http://local').pathname,file=path.resolve(root,'.'+(pathname.endsWith('/')?pathname+'index.html':pathname));if(!file.startsWith(root+path.sep))return res.writeHead(403).end();fs.readFile(file,(error,data)=>{if(error)return res.writeHead(404).end();let body=data;if(pathname==='/paper3/2022-b2/')body=Buffer.from(data.toString().replace('</head>',bundle+'</head>'));res.writeHead(200,{'Content-Type':path.extname(file)==='.js'?'text/javascript':path.extname(file)==='.css'?'text/css':'text/html','Content-Length':body.length});res.end(body);});});
(async()=>{await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const browser=await chromium.launch({headless:true,args:['--autoplay-policy=no-user-gesture-required']});try{
  const page=await browser.newPage({viewport:{width:1280,height:900},reducedMotion:'reduce'}),errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.route('https://**/*',route=>route.request().url().endsWith('DSE%202022%20Part%20B.mp3')?route.continue():route.abort());
  await page.goto('http://127.0.0.1:'+server.address().port+'/paper3/2022-b2/?curation=1',{waitUntil:'domcontentloaded'});await page.locator('#curation-dock').waitFor({state:'visible'});await page.locator('[data-chapter="podcast"]').click();
  await page.waitForFunction(()=>document.querySelector('#curation-2022-audio').readyState>=1,{timeout:30000});
  const duration=await page.locator('#curation-2022-audio').evaluate(audio=>audio.duration);assert.ok(Math.abs(duration-445.37)<.2,'authentic 7:25 recording loaded');
  const cueCount=await page.evaluate(()=>EDMUND_2022_B2_CURATION.podcast.cues.length);
  for(let index=0;index<cueCount;index++){
    const cue=await page.evaluate(index=>{const api=__EDMUND_2022_CURATION_TEST__,step=api.steps.podcast[index];api.state().positions.podcast=index;api.render(false,true);const audio=document.querySelector('#curation-2022-audio');audio.playbackRate=3;return step.cue;},index);
    await page.locator('#curation-step-actions .curation-small').click();
    await page.waitForFunction(id=>__EDMUND_2022_CURATION_TEST__.state().heard.includes('cue-'+id),cue.id,{timeout:Math.ceil((cue.at-cue.from)/3*1000)+12000});
    const result=await page.locator('#curation-2022-audio').evaluate(audio=>({time:audio.currentTime,paused:audio.paused}));
    assert.ok(result.paused,'cue '+cue.id+' stopped');assert.ok(Math.abs(result.time-cue.at)<.35,'cue '+cue.id+' stopped at '+cue.at+' (actual '+result.time+')');
  }
  assert.equal((await page.locator('[data-note="3-3"]').inputValue()).split('\n').filter(Boolean).length,2,'history writes two non-duplicate notes');
  assert.deepEqual(errors,[],'no real-audio runtime errors');console.log('PASS 2022 B2 real audio boundaries: '+cueCount+'/'+cueCount);
}finally{await browser.close();server.close();}})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
