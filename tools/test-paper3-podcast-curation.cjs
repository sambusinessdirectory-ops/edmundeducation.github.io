const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const assert=require('node:assert/strict');
const {chromium}=require(process.env.HOME+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.m4a':'audio/mp4'};
const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://local').pathname));
  if(!file.startsWith(root+'/'))return res.writeHead(403).end();
  fs.readFile(file,(error,data)=>{
    if(error)return res.writeHead(404).end();
    const type=mime[path.extname(file)]||'application/octet-stream';
    const range=req.headers.range?.match(/bytes=(\d+)-(\d*)/);
    if(range&&file.endsWith('.m4a')){
      const start=Number(range[1]),end=Math.min(range[2]?Number(range[2]):data.length-1,data.length-1);
      res.writeHead(206,{'Content-Type':type,'Accept-Ranges':'bytes','Content-Range':`bytes ${start}-${end}/${data.length}`,'Content-Length':end-start+1});
      res.end(data.subarray(start,end+1));
    }else{res.writeHead(200,{'Content-Type':type,'Content-Length':data.length});res.end(data);}
  });
});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser=await chromium.launch({headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/paper3/2025-b2/index.html?curation=1`,{waitUntil:'domcontentloaded'});
    const jump=async query=>{await page.locator('#curation-step-jump').click();await page.locator('#curation-picker-search').fill(query);await page.locator('.curation-picker-option:visible').first().click();};
    await page.locator('[data-chapter="categorize"]').click();
    assert.match(await page.locator('#curation-title').innerText(),/活動篩選電郵/);
    await jump('運動雜誌完整文章');await page.locator('#curation-next').click();
    assert.match(await page.locator('#curation-title').innerText(),/聆聽筆記表$/,'note-sheet classification follows the final Data File category');
    assert.equal(await page.locator('#page-3 .curation-note-noise.is-revealed').count(),0);
    await page.locator('#curation-next').click();
    assert.match(await page.locator('#curation-title').innerText(),/亞運週欄目/);
    assert.equal(await page.locator('#page-3 .curation-note-noise.is-revealed').count(),1);
    await jump('健康月欄目');
    assert.equal(await page.locator('#page-3 .curation-file-stamp-A').count(),1);
    assert.equal(await page.locator('#page-3 .curation-file-stamp-C').count(),0);
    await jump('家長參與欄目');
    assert.equal(await page.locator('#page-3 .curation-file-stamp-C').count(),1);
    await page.locator('#curation-next').click();
    assert.match(await page.locator('#curation-title').innerText(),/記下最後口號/);
    await page.locator('#curation-step-actions button').click();
    await page.waitForFunction(()=>document.querySelector('#page-3 audio').readyState>=1);
    assert.equal(await page.locator('#page-3 .notes-audio').evaluate(element=>getComputedStyle(element).position),'fixed','the same audio player floats throughout Podcast');
    await page.setViewportSize({width:390,height:844});
    const floating=await page.evaluate(()=>{const panel=document.querySelector('#page-3 .notes-audio').getBoundingClientRect(),bank=document.querySelector('#curation-bank').getBoundingClientRect();return {top:panel.top,right:panel.right,bankBottom:bank.bottom};});
    assert.ok(floating.top>=floating.bankBottom&&floating.right<=390,'the floating player fits below the evidence bank on a phone');
    await page.setViewportSize({width:1440,height:900});
    await page.evaluate(()=>{const audio=document.querySelector('#page-3 audio');audio.currentTime=31;audio.dispatchEvent(new Event('timeupdate'));});
    assert.ok(await page.locator('.curation-transcript-strike.is-revealed').count()>0,'unneeded transcript sentences receive red strikes during playback');
    assert.equal(await page.locator('#notes-slogan').inputValue(),'','the slogan waits until its audio cue');
    const checkpoints=[
      [69.8,'slogan','One Games, One Asia'],[122.4,'opening','13 October'],[138.6,'opening','afternoon'],[167.5,'opening','Main Hall'],
      [174.6,'wellness','July'],[212.2,'wellness','After students finish exams'],[226.4,'wellness','Relax and Recover'],
      [239.4,'wellness','Yoga and Meditation'],[257.4,'wellness','focus and attention span'],[299.6,'wellness','Two famous instructors'],
      [346.5,'topic','Athlete:'],[365.1,'topic','Survey students'],[381.4,'after','Discussion about the sport'],
      [403.2,'after','student questions'],[434.3,'parents','Mr Singh'],[447.9,'parents','briefing session'],
      [472.2,'parents','school app'],[487.7,'parents','Nico Lin'],[517.2,null,null]
    ];
    for(const [index,[at,field,answer]] of checkpoints.entries()){
      assert.equal(await page.locator('#curation-next').isDisabled(),true,`cue ${index+1} holds Next until its audio answer`);
      await page.evaluate(time=>{const audio=document.querySelector('#page-3 audio');audio.currentTime=time;audio.dispatchEvent(new Event('timeupdate'));},at);
      await page.waitForFunction(()=>document.querySelector('#page-3 audio').paused);
      assert.equal(await page.locator('#curation-next').isDisabled(),false,`cue ${index+1} releases Next after writing`);
      if(field)assert.ok((await page.locator(`#notes-${field}`).inputValue()).includes(answer),`cue ${index+1} wrote ${answer} into ${field}`);
      if(index===4)assert.equal(await page.locator('#notes-wellness').evaluate(element=>getComputedStyle(element).backgroundColor),'rgb(217, 245, 246)','Task A note field receives cyan after its first useful answer');
      if(index===14)assert.equal(await page.locator('#notes-parents').evaluate(element=>getComputedStyle(element).backgroundColor),'rgb(252, 225, 231)','Task C note field receives rose after its first useful answer');
      if(index===0){
        assert.equal(await page.locator('.curation-transcript-C.is-revealed').count(),0,'later Task C transcript remains hidden');
        assert.ok(await page.locator('.curation-transcript-listening.is-revealed').count()>0,'heard slogan is marked in transcript');
      }
      if(index<checkpoints.length-1){await page.locator('#curation-next').click();await page.waitForFunction(()=>!document.querySelector('#page-3 audio').paused);}
    }
    assert.ok(await page.locator('.curation-transcript-A.is-revealed').count()>0);
    assert.ok(await page.locator('.curation-transcript-C.is-revealed').count()>0);
    assert.ok(await page.locator('.curation-transcript-strike.is-revealed').count()>0);
    assert.match(await page.locator('#notes-opening').inputValue(),/13 October[\s\S]*afternoon[\s\S]*Main Hall/);
    await jump('記下最後口號');
    assert.equal(await page.locator('#notes-slogan').inputValue(),'','jumping back removes the system-written slogan');
    await page.evaluate(()=>{const audio=document.querySelector('#page-3 audio');audio.currentTime=69.8;audio.dispatchEvent(new Event('timeupdate'));});
    assert.match(await page.locator('#notes-slogan').inputValue(),/One Games, One Asia/,'seeking forward restores the heard slogan');
    await page.evaluate(()=>{const audio=document.querySelector('#page-3 audio');audio.currentTime=31;audio.dispatchEvent(new Event('timeupdate'));});
    assert.equal(await page.locator('#notes-slogan').inputValue(),'','scrubbing backward hides the slogan again');
    await page.locator('#notes-slogan').fill('My own note');
    await page.evaluate(()=>{const audio=document.querySelector('#page-3 audio');audio.currentTime=69.8;audio.dispatchEvent(new Event('timeupdate'));});
    assert.match(await page.locator('#notes-slogan').inputValue(),/My own note[\s\S]*One Games, One Asia/,'student notes remain alongside revealed answers');
    await page.evaluate(()=>{const audio=document.querySelector('#page-3 audio');audio.currentTime=31;audio.dispatchEvent(new Event('timeupdate'));});
    assert.equal(await page.locator('#notes-slogan').inputValue(),'My own note','rewind preserves student-authored notes');
    assert.ok(await page.locator('.curation-transcript-strike.is-revealed').count()>0,'early strikes remain at 31 seconds');
    assert.equal(await page.locator('.curation-transcript-listening.is-revealed').count(),0,'later slogan transcript highlights rewind with the playhead');
    assert.equal(await page.locator('#notes-wellness.curation-note-highlight-A').count(),0,'jumping back removes future note coloring');
    assert.equal(await page.locator('.curation-transcript-C.is-revealed').count(),0,'jumping back hides future transcript annotations');
    await jump('報名方法被更正');
    assert.ok(await page.locator('.curation-transcript-C.is-revealed').count()>0,'jumping forward restores Task C annotations');
    await page.reload({waitUntil:'domcontentloaded'});
    assert.match(await page.locator('#notes-slogan').inputValue(),/One Games, One Asia/,'completed notes persist after reload');
    await page.locator('[data-chapter="data"]').click();
    assert.notEqual(await page.locator('#page-3 .notes-audio').evaluate(element=>getComputedStyle(element).position),'fixed','the player returns to the note sheet outside Podcast');
    const parking=page.locator('.curation-source-mark[data-record-id="duncan-singh-emails-11"]').filter({hasText:'parking near Cheung Sha Beach is difficult'});
    assert.equal(await parking.count(),1);assert.ok(await parking.evaluate(element=>element.classList.contains('curation-reference-yellow')));
    assert.equal(await page.locator('#page-10').textContent().then(text=>text.includes('網誌中的情緒與表現說法屬題目提供的資料')),false);
    await jump('Ask Manraj in the School Events Team');
    await page.locator('#curation-next').click();
    const callout=page.locator('.curation-route-callout');
    assert.deepEqual(await callout.locator(':scope > *').allTextContents(),['第 9 頁','Manraj 電郵'],'route label uses page then title on separate lines');
    const geometry=await page.evaluate(()=>{const callout=document.querySelector('.curation-route-callout').getBoundingClientRect(),bank=document.querySelector('#curation-bank').getBoundingClientRect();return {calloutRight:callout.right,bankLeft:bank.left};});
    assert.ok(geometry.calloutRight<geometry.bankLeft,'arrow callout does not run under the evidence bank');
    assert.ok((await page.locator('.curation-route-path').getAttribute('d')).startsWith('M '));
    await page.setViewportSize({width:390,height:844});await page.waitForTimeout(350);
    const mobileCallout=await callout.evaluate(element=>{const r=element.getBoundingClientRect();return {left:r.left,right:r.right,hidden:element.hidden};});
    if(!mobileCallout.hidden)assert.ok(mobileCallout.left>=0&&mobileCallout.right<=390,'route label fits on a phone');
    const legacy=await browser.newPage({reducedMotion:'reduce'});
    await legacy.addInitScript(()=>localStorage.setItem('edmund-paper3-2025-b2-curation-v1',JSON.stringify({version:'2025-b2-super-curation-v1',activeSlot:'1',slots:{1:{sequenceVersion:3,chapter:'podcast',positions:{boss:0,categorize:0,podcast:13,data:0,writing:0},completed:[]}}})));
    await legacy.goto(`http://127.0.0.1:${server.address().port}/paper3/2025-b2/index.html?curation=1`,{waitUntil:'domcontentloaded'});
    assert.match(await legacy.locator('#curation-quote').innerText(),/Alright, let’s get started/,'version-3 rich transcript position maps to the same sentence');
    await legacy.locator('[data-chapter="categorize"]').click();assert.match(await legacy.locator('#curation-title').innerText(),/聆聽筆記表/,'version-3 note-sheet position moves with the page');await legacy.close();
    const motion=await browser.newPage({reducedMotion:'no-preference'});
    await motion.goto(`http://127.0.0.1:${server.address().port}/paper3/2025-b2/index.html?curation=1`,{waitUntil:'domcontentloaded'});
    await motion.locator('[data-chapter="podcast"]').click();await motion.locator('#curation-step-actions button').click();
    await motion.waitForFunction(()=>document.querySelector('#page-3 audio').readyState>=1);
    await motion.evaluate(()=>{const audio=document.querySelector('#page-3 audio');audio.currentTime=69.8;audio.dispatchEvent(new Event('timeupdate'));});
    await motion.locator('#notes-slogan.curation-note-writing').waitFor({state:'visible'});
    assert.equal(await motion.locator('#curation-next').isDisabled(),true,'Next remains paused during handwriting animation');
    await motion.waitForFunction(()=>document.querySelector('#notes-slogan').value==='One Games, One Asia');
    assert.equal(await motion.locator('#curation-next').isDisabled(),false);await motion.close();
    assert.deepEqual(errors,[]);
    console.log('Paper 3 podcast curation checkpoints passed');
  }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
