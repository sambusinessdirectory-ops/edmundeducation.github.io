const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const assert=require('node:assert/strict');
const {chromium}=require(process.env.HOME+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const root=path.resolve(__dirname,'..');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.mp3':'audio/mpeg'};
const server=http.createServer((request,response)=>{
  const file=path.resolve(root,'.'+decodeURIComponent(new URL(request.url,'http://local').pathname));
  if(!file.startsWith(root+'/'))return response.writeHead(403).end();
  fs.readFile(file,(error,data)=>{
    if(error)return response.writeHead(404).end();
    response.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Content-Length':data.length});response.end(data);
  });
});

(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser=await chromium.launch({headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1440,height:950},reducedMotion:'no-preference'});
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/paper3/2023-b2/curation/index.html?curation=1`,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>!document.documentElement.hasAttribute('data-loading'));
    const jump=async query=>{
      await page.locator('#curation-step-jump').click();
      await page.locator('#curation-picker-search').fill(query);
      await page.locator('.curation-picker-option:visible').first().click();
    };

    await jump('see the article from Big Cheese Celebrity Food Gossip');
    const sourceMark=page.locator('.native-reader-host mark.curation-mark.curation-target').first();
    assert.equal(await sourceMark.count(),1,'active source phrase uses the canonical target state');
    assert.match(await sourceMark.evaluate(element=>getComputedStyle(element).transitionDuration),/0.4s/,'source evidence fades with the canonical duration');
    await page.locator('#curation-route-arrow').waitFor({state:'visible'});
    assert.match(await page.locator('.curation-route-callout').innerText(),/第 5 頁/,'route callout identifies the destination');
    assert.match(await page.locator('.curation-route-path').evaluate(element=>getComputedStyle(element).animationName),/curation-route-draw/,'route pen draws in');
    await page.screenshot({path:'/private/tmp/2023-b2-v3-route.png',fullPage:false});
    await page.locator('#curation-next').click();
    const stamp=page.locator('.native-reader-host .curation-file-stamp-A');
    assert.equal(await stamp.count(),1,'route visit adds the canonical Task A stamp');
    const stampMotion=await stamp.evaluate(element=>({className:element.className,animation:getComputedStyle(element).animationName}));
    assert.ok(stampMotion.className.includes('curation-file-stamp-enter')&&/curation-stamp-arrive/.test(stampMotion.animation),`new stamp uses blur/overshoot choreography: ${JSON.stringify(stampMotion)}`);
    await page.locator('#curation-next').click();
    await page.waitForTimeout(100);
    assert.equal(await page.locator('#curation-route-arrow').evaluate(element=>element.classList.contains('is-faded')),true,'return keeps a faint route cue');

    await page.locator('.curation-stage-item[data-chapter="podcast"]').click();
    await jump('And thanks for joining us today');
    const rejected=page.locator('#turns .curation-transcript-sentence.curation-target.curation-transcript-strike');
    assert.equal(await rejected.count(),1,'review mode uses the canonical transcript target and strike');
    assert.equal(await rejected.locator('.curation-pen-line').count(),1,'rejected transcript text owns one pen layer');
    assert.match(await rejected.locator('.curation-pen-line').evaluate(element=>getComputedStyle(element).transitionDuration),/0.85s/,'rejected transcript pen follows M11');

    await page.locator('.curation-stage-item[data-chapter="writing"]').click();
    await jump('Teen NetChef TV supports');
    const currentEssay=page.locator('.curation-model-essay .curation-essay-unit.is-current');
    assert.equal(await currentEssay.count(),1,'one essay unit glides into current focus');
    assert.match(await currentEssay.evaluate(element=>getComputedStyle(element).transitionDuration),/0.25s/,'essay focus follows M16');
    assert.ok(await currentEssay.locator('.curation-essay-keyword-A').count()>0,'essay content keyword uses the canonical reveal class');
    await page.locator('#curation-next').click();
    const preview=page.locator('dialog.curation-source-preview[open]');
    assert.equal(await preview.count(),1,'source confirmation opens in the canonical preview');
    assert.equal(await preview.isVisible(),true,'source confirmation preview is visible above the essay');
    assert.match(await preview.evaluate(element=>getComputedStyle(element).animationName),/curation-preview-enter/,'preview fades upward and scales in');
    assert.ok(await page.locator('.curation-bank-A li.curation-bank-used-new').count()>0,'newly used bank evidence draws its red line');
    assert.match(await preview.locator('mark .curation-navy-ink').first().evaluate(element=>getComputedStyle(element).animationName),/sourceInk/,'preview delays and draws the navy source line');
    await page.waitForTimeout(400);
    await page.screenshot({path:'/private/tmp/2023-b2-v3-preview.png',fullPage:false});
    await page.locator('#curation-prev').click();
    assert.equal(await page.locator('dialog.curation-source-preview[open]').count(),0,'Back closes the preview and rewinds the transient source step');

    assert.deepEqual(errors,[]);
    const reduced=await browser.newPage({viewport:{width:1440,height:950},reducedMotion:'reduce'});
    await reduced.goto(`http://127.0.0.1:${server.address().port}/paper3/2023-b2/curation/index.html?curation=1`,{waitUntil:'domcontentloaded'});
    await reduced.waitForFunction(()=>!document.documentElement.hasAttribute('data-loading'));
    assert.equal(await reduced.locator('.curation-mask').first().evaluate(element=>getComputedStyle(element).transitionDuration),'0s','reduced motion disables spotlight transitions');
    await reduced.close();
    console.log('PASS: 2023 B2 V3 motion wiring, rewind, and reduced-motion checks.');
  }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
