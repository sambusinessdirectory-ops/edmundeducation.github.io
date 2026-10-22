const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const assert=require('node:assert/strict');
const {chromium}=require(process.env.HOME+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..');
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.m4a':'audio/mp4','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://local').pathname));
  if(!file.startsWith(root+'/'))return res.writeHead(403).end();
  fs.readFile(file,(error,data)=>{
    if(error)return res.writeHead(404).end();
    res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});
    res.end(data);
  });
});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser=await chromium.launch({headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.route('https://**/*',route=>route.abort());
    await page.goto(`http://127.0.0.1:${server.address().port}/paper3/2025-b2/index.html?curation=1`,{waitUntil:'domcontentloaded'});
    await page.locator('#curation-dock').waitFor({state:'visible'});
    assert.match(await page.locator('.curation-stage-item.active .curation-stage-count').innerText(),/^1\/24$/);
    const toolbar=await page.locator('.toolbar').evaluate(el=>({right:el.getBoundingClientRect().right,controls:[...el.children].filter(child=>child.getBoundingClientRect().width>0).map(child=>({x:child.getBoundingClientRect().x,right:child.getBoundingClientRect().right}))}));
    assert.ok(toolbar.controls.every((item,index)=>index===0||item.x>=toolbar.controls[index-1].right-1),'toolbar controls flow left to right');
    assert.ok(toolbar.controls.at(-1).right<toolbar.right-100,'all toolbar controls remain grouped left');
    await page.locator('#curation-spotlight').uncheck();
    async function jump(query){await page.locator('#curation-step-jump').click();await page.locator('#curation-picker-search').fill(query);await page.locator('.curation-picker-option:visible').first().click();}
    for(const route of [
      ['refer to the emails',5,'A'],['This is a brand-new event',8,'B'],['included screenshots of a WhatsApp',8,'B'],
      ['discussing this over email with Mr Singh',9,'C'],['sent you this exchange',9,'C'],['recording of our meeting',3,null]
    ]){
      await jump(route[0]);
      await page.locator('#curation-next').click();
      assert.match(await page.locator('#curation-title').innerText(),/即時標記來源/);
      assert.ok(await page.locator(`#page-${route[1]} .curation-target`).count()>0,`source cue ${route[0]} opens page ${route[1]}`);
      const targetTop=await page.locator(`#page-${route[1]} .curation-target`).evaluate(e=>e.getBoundingClientRect().top);assert.ok(targetTop>=130&&targetTop<page.viewportSize().height-80,`source page ${route[1]} lands in the visible reading area: ${targetTop}`);
      if(route[2])assert.ok(await page.locator(`#page-${route[1]} .curation-file-stamp-${route[2]}`).isVisible(),`source cue ${route[0]} marks Task ${route[2]}`);
      if(route[0]==='included screenshots of a WhatsApp'){await page.waitForTimeout(900);await page.screenshot({path:'/private/tmp/paper3-curation-source-detour.png',fullPage:false});}
      await page.locator('#curation-next').click();
      assert.match(await page.locator('#curation-title').innerText(),/Boss letter/,'next returns to boss-letter reading');
    }
    await jump('Dear Nico');assert.equal(await page.locator('#page-4 .curation-mark-hint.is-revealed').count(),0,'boss highlights rewind with the step');assert.equal(await page.locator('#page-5 .curation-file-stamp-A').count(),0,'future source tags also rewind');
    await page.locator('[data-chapter="categorize"]').click();
    await jump('聆聽筆記表');assert.ok(await page.locator('#page-3 .curation-file-stamp-A').isVisible());assert.ok(await page.locator('#page-3 .curation-file-stamp-C').isVisible());
    for(const [query,pageNo,task] of [['2024 健康月',6,'A'],['校園電視',7,'A'],['網誌',10,'C'],['運動雜誌',11,'B']]){
      await jump(query);
      assert.ok(await page.locator(`#page-${pageNo} .curation-file-stamp-${task}`).isVisible(),`${query} has Task ${task} stamp`);
      if(pageNo===10)assert.ok(await page.locator('#page-10 .curation-file-stamp-B').isVisible(),'the sports email on page 10 is tagged Task B alongside the blog Task C');
    }
    await page.locator('[data-chapter="data"]').click();
    const candidate=page.locator('#page-5 .sentence-item').filter({hasText:'I agree about the Crafting Session'}).first();
    await jump("Alex and Emma");
    assert.ok(await page.locator('#page-7 .curation-file-stamp-A').isVisible(),'interview starts with Task A');
    assert.ok(await page.locator('#page-7 .curation-file-stamp-C').isVisible(),'Alex reveals Task C on the interview page');
    assert.equal(await page.locator('#page-7 .curation-file-stamp-C').evaluate(e=>getComputedStyle(e).animationName),'curation-stamp-arrive');
    assert.ok(await candidate.locator('.curation-source-mark.is-revealed').count()>0,'earlier highlights appear at Alex step');
    await page.waitForTimeout(900);await page.screenshot({path:'/private/tmp/paper3-curation-alex-mixed.png',fullPage:false});await page.locator('#page-7 .page-heading').scrollIntoViewIfNeeded();await page.screenshot({path:'/private/tmp/paper3-curation-alex-tags.png',fullPage:false});
    await page.locator('#curation-next').click();
    assert.match(await page.locator('#curation-source').innerText(),/第 7 頁/,'reading continues on the interview page after Task C is discovered');
    const parentBenefit=page.locator('#page-7 .sentence-item').filter({hasText:"I've been a helper at some of the events"}).first();await parentBenefit.click();assert.match(await page.locator('#curation-source').innerText(),/第 7 頁/);assert.ok(await parentBenefit.locator('.curation-source-mark.is-revealed.curation-reference-rose').count()>0||await parentBenefit.evaluate(e=>e.classList.contains('curation-source-fallback')&&e.classList.contains('curation-reference-rose')&&e.classList.contains('is-revealed')),'interview changes to Task C rose highlighting without leaving the page');
    await page.locator('#curation-step-jump').click();await page.locator('.curation-picker-option:visible').first().click();
    assert.equal(await candidate.locator('.curation-source-mark.is-revealed').count(),0,'jumping back hides future highlights');
    assert.equal(await page.locator('#page-7 .curation-file-stamp-C').count(),0,'jumping back hides the later Task C tag');
    await jump("Alex and Emma");
    assert.ok(await candidate.locator('.curation-source-mark.is-revealed').count()>0,'jumping forward restores prior highlights');
    assert.ok(await page.locator('#page-7 .curation-file-stamp-C').isVisible(),'jumping forward restores Task C tag');
    await page.locator('#curation-step-jump').click();await page.locator('.curation-picker-option:visible').first().click();
    const rejected=page.locator('#page-6 .sentence-item.curation-strike').first();const ink=rejected.locator('.curation-pen-line');
    await page.waitForFunction(e=>getComputedStyle(e).backgroundSize.startsWith('0'),await ink.elementHandle(),{timeout:3000});
    await rejected.click();
    const duration=await ink.evaluate(e=>getComputedStyle(e).transitionDuration);
    assert.ok(duration.includes('0.85s'),'red strike animates across the sentence');
    await page.waitForFunction(e=>getComputedStyle(e).backgroundSize.startsWith('100%'),await ink.elementHandle(),{timeout:3000});
    await page.screenshot({path:'/private/tmp/paper3-curation-red-strike.png',fullPage:false});
    await page.locator('#curation-step-jump').click();await page.locator('.curation-picker-option:visible').first().click();
    await page.waitForFunction(e=>getComputedStyle(e).backgroundSize.startsWith('0'),await ink.elementHandle(),{timeout:3000});
    assert.deepEqual(errors,[]);
    const saved=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
    await saved.route('https://**/*',route=>route.abort());
    await saved.addInitScript(()=>localStorage.setItem('edmund-paper3-2025-b2-curation-v1',JSON.stringify({version:'2025-b2-super-curation-v1',activeSlot:'1',slots:{1:{chapter:'data',positions:{boss:5,categorize:0,podcast:0,data:205,writing:0},visited:[],completed:[]}}})));
    await saved.goto(`http://127.0.0.1:${server.address().port}/paper3/2025-b2/index.html?curation=1`,{waitUntil:'domcontentloaded'});
    await saved.locator('#curation-dock').waitFor({state:'visible'});
    assert.match(await saved.locator('#curation-quote').innerText(),/Alex and Emma/,'old save-slot step 206 migrates to the same sentence in the new reading order');
    await saved.close();
    const v2=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});await v2.route('https://**/*',route=>route.abort());
    await v2.addInitScript(()=>localStorage.setItem('edmund-paper3-2025-b2-curation-v1',JSON.stringify({version:'2025-b2-super-curation-v1',activeSlot:'1',slots:{1:{sequenceVersion:2,chapter:'data',positions:{boss:0,categorize:1,podcast:0,data:55,writing:0},spotlight:false,visited:[],completed:[]}}})));
    await v2.goto(`http://127.0.0.1:${server.address().port}/paper3/2025-b2/index.html?curation=1`,{waitUntil:'domcontentloaded'});await v2.locator('#curation-dock').waitFor({state:'visible'});
    assert.match(await v2.locator('#curation-quote').innerText(),/Alex and Emma/,'version-2 save stays on the same sentence after route insertion');
    assert.equal(await v2.locator('#curation-spotlight').isChecked(),true,'spotlight is restored for pre-revision saves');
    await v2.locator('[data-chapter="categorize"]').click();assert.match(await v2.locator('#curation-title').innerText(),/2024 健康月原海報/,'version-2 category position maps around the new note-sheet step');await v2.close();
    assert.equal(await page.locator('[data-curation-route-page]').count(),8,'each distinct cross-page cue has one route');
    await page.locator('#curation-spotlight').check();
    await jump('I recommend having the Fitness Challenge again');
    const oldSuggestion=page.locator('#page-5 .sentence-item').filter({hasText:'I recommend having the Fitness Challenge again'}).first();
    assert.equal(await oldSuggestion.locator('.curation-pen-line').count(),1,'early candidate is prepared for later correction');
    assert.equal(await oldSuggestion.evaluate(e=>e.classList.contains('is-revealed')),false,'candidate is not struck before the newer reply');
    assert.match(await page.locator('#curation-explanation').innerText(),/候選|暫定/);assert.doesNotMatch(await page.locator('#curation-explanation').innerText(),/後來 Melissa 明確反對/,'early guidance does not reveal the later email');
    await jump('OK, I agree with you about the Fitness Challenge');
    assert.equal(await oldSuggestion.evaluate(e=>e.classList.contains('is-revealed')),true,'latest agreement triggers delayed rejection of the old suggestion');
    await jump('Hi John,');
    const greeting=page.locator('#page-5 .sentence-item.curation-target');
    assert.equal(await greeting.getAttribute('data-curation-type'),'6');
    assert.equal(await greeting.evaluate(e=>e.classList.contains('curation-strike')&&e.classList.contains('is-revealed')),true,'Type 6 greeting is struck on its step');
    assert.ok(await page.locator('.curation-mask-top').isVisible(),'spotlight frames the Type 6 sentence');
    await jump('It depends on the transport situation');
    const transport=page.locator('#page-8 .sentence-item.curation-target');
    assert.equal(await transport.locator('.curation-source-mark.curation-reference-cyan').count(),0,'Task B transport is never blue');
    assert.ok(await transport.locator('.curation-source-mark.curation-reference-yellow').count()>0,'Task B transport is yellow');
    await jump('They also said that parking near Cheung Sha Beach');
    const parking=page.locator('#page-9 .sentence-item.curation-target');
    assert.equal(await parking.locator('.curation-source-mark.curation-reference-cyan').count(),0,'Task B parking is never blue');
    assert.ok(await parking.locator('.curation-source-mark.curation-reference-yellow').count()>0,'Task B parking is yellow');
    for(const phrase of ['Wushu is a sport','Another sport to try, if you']){
      await jump(phrase);const item=page.locator('#page-11 .sentence-item.curation-target');
      assert.ok(await item.locator('.curation-pen-line').count()>0&&await item.evaluate(e=>e.classList.contains('is-revealed')),`${phrase} is struck`);
      assert.ok(await item.locator('.curation-source-mark.curation-reference-yellow').count()>0||await item.evaluate(e=>e.classList.contains('curation-source-fallback')&&e.classList.contains('curation-reference-yellow')),`${phrase} keeps Task B yellow`);
    }
    await jump('Ask Manraj in the School Events Team');
    await page.waitForTimeout(850);
    assert.ok(await page.locator('#curation-route-arrow').isVisible(),'source hint draws a visible red arrow');
    assert.ok(await page.locator('.curation-route-callout').innerText().then(t=>t.includes('第 9 頁')));
    await page.screenshot({path:'/private/tmp/paper3-curation-route-source.png',fullPage:false});
    await page.locator('#curation-next').click();
    assert.match(await page.locator('#curation-title').innerText(),/第 9 頁/);
    assert.ok(await page.locator('#page-9 .curation-target').count()>0,'next pans to the referenced Data File');
    await page.locator('#curation-next').click();
    assert.match(await page.locator('#curation-title').innerText(),/回到原句/);
    await page.waitForTimeout(1000);
    assert.ok(await page.locator('#curation-route-arrow').evaluate(e=>e.classList.contains('is-faded')),'return leaves a faint arrow');await page.screenshot({path:'/private/tmp/paper3-curation-route-return.png',fullPage:false});
    await jump("attached the article to this email");await page.locator('#curation-next').click();
    assert.ok(await page.locator('#page-11 .curation-target').count()>0,'article cue pans to page 11');
    const colorErrors=await page.evaluate(()=>[...document.querySelectorAll('.sentence-item[data-curation-type]')].filter(e=>/^[1234]$/.test(e.dataset.curationType)).flatMap(e=>{const expected={1:'cyan',2:'yellow',3:'rose',4:'green'}[e.dataset.curationType];return [...e.querySelectorAll('.curation-source-mark')].filter(mark=>!mark.classList.contains(`curation-reference-${expected}`)).map(mark=>({text:e.textContent.slice(0,60),type:e.dataset.curationType,color:mark.className}));}));
    assert.deepEqual(colorErrors,[],'all direct-use source highlights obey task colors');
    const typeSixMissing=await page.evaluate(()=>[...document.querySelectorAll('.sentence-item[data-curation-type="6"]')].filter(e=>!e.classList.contains('curation-strike')).map(e=>e.textContent.slice(0,60)));
    assert.deepEqual(typeSixMissing,[],'all Type 6 Data File sentences have red-pen strokes');
    await page.locator('[data-chapter="categorize"]').click();await jump('聆聽筆記表');
    assert.equal(await page.locator('#page-3 .curation-note-noise').count(),6,'all irrelevant listening-note headings and fields are marked');
    assert.equal(await page.locator('#page-3 .curation-note-noise.is-revealed').count(),6);
    assert.equal(await page.locator('.curation-model-essay').count(),3,'all three supplied essays are back in PP writing practice');
    assert.match(await page.locator('#curation-model-A').textContent(),/Relax and Recover/);
    assert.match(await page.locator('#curation-model-B').textContent(),/Cafeteria Beach/);
    assert.match(await page.locator('#curation-model-C').textContent(),/school app/);await page.locator('[data-chapter="writing"]').click();await page.locator('#curation-model-A').evaluate(e=>e.open=true);await page.locator('#curation-model-A').scrollIntoViewIfNeeded();await page.screenshot({path:'/private/tmp/paper3-curation-model-essay.png',fullPage:false});
    console.log('Paper 3 curation workflow browser test passed');
  }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
