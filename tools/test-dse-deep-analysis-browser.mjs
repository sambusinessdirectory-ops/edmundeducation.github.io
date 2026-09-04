// Local-only browser integration test. All auth/RPC calls are mocked; no real users.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('playwright');
const base=process.env.READING_TEST_URL || 'http://127.0.0.1:8124';
assert.ok(new URL(base).hostname==='127.0.0.1','Never mock authentication against a deployed site');
const browser=await chromium.launch({headless:true});
const errors=[];
try {
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  await context.route('**/*',async route=>{
    const url=new URL(route.request().url());
    if(url.hostname==='cdn.jsdelivr.net') return route.fulfill({contentType:'application/javascript',body:`window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{user:{id:'local-test'}}}})},rpc:async(name)=>({data:name==='flashcard_admin_login'?(window.__sourceAdminAllowed?[{name:'Local Admin',role:'admin'}]:[]):name==='flashcard_student_session_profile'?[{id:'local-test',name:'Local Test',session_token:'test-only'}]:name==='flashcard_student_login'?[{session_token:'test-only'}]:name.includes('translation')?null:[],error:null})})};`});
    if(url.hostname!=='127.0.0.1') return route.abort();
    if(url.pathname==='/reading-comprehension.html') {const response=await route.fetch();return route.fulfill({response,body:(await response.text()).replace(/ integrity="[^"]+"/g,'')});}
    return route.continue();
  });
  const page=await context.newPage();page.on('pageerror',e=>{errors.push(e.message);console.error('PAGE ERROR',e.message)});
  await page.goto(`${base}/reading-comprehension.html?view=dse&year=2023&section=A&article=dse-2023-a`);
  await page.locator('input[name=username]').fill('Local Test');await page.locator('input[name=password]').fill('test-only');await page.locator('[data-login-button]').click();
  await page.locator('[data-deep-analysis="2"]').waitFor();
  assert.equal(await page.locator('[data-deep-analysis]').count(),22);
  await page.locator('[data-deep-analysis="2"]').click();assert.equal(await page.locator('dialog[open]').count(),0,'Unanswered question stays gated');
  await page.locator('[name=q2]').fill('unfortunately');await page.locator('[data-deep-analysis="2"]').click();
  await page.locator('[data-deep-main] .deep-page').waitFor({timeout:10000}).catch(async e=>{await page.screenshot({path:'/tmp/deep-error.png'});console.error(await page.locator('dialog').allTextContents());throw e;});
  assert.match(await page.locator('.deep-comparison').innerText(),/unfortunately/);
  await page.locator('[data-deep-step="2"]').click();
  await page.screenshot({path:'/tmp/dse-deep-desktop.png',fullPage:false});
  await page.locator('[data-deep-understood]').click();assert.match(await page.locator('[data-deep-progress-label]').innerText(),/1 \/ 6/);
  await page.locator('[data-deep-search]').fill('struggle');assert.ok(await page.locator('[data-deep-steps] button').count()>0);
  await page.locator('[data-deep-clear]').click();
  await page.locator('[data-deep-mode=full]').click();assert.equal(await page.locator('.deep-page').count(),6);
  assert.equal(await page.locator('[data-deep-mode=original], .deep-original, .deep-furniture, .deep-reader a[href$="/original.pdf"]').count(),0,'Source tools are absent for students');
  await page.locator('[data-deep-close]').click();assert.equal(await page.locator('[name=q2]').inputValue(),'unfortunately');assert.equal(await page.locator('[data-deep-analysis="2"]').evaluate(b=>document.activeElement===b),true);
  await page.locator('[data-deep-analysis="2"]').click();await page.locator('[data-deep-main] .deep-page').waitFor();assert.match(await page.locator('[data-deep-progress-label]').innerText(),/1 \/ 6/);await page.keyboard.press('Escape');
  // Large multiparts and source caveat: no automatic rejection of open answers.
  await page.locator('[name=q14_i]').fill('Chemistry');await page.locator('[name=q14_ii]').fill('mumbled');await page.locator('[name=q14_iii]').fill('enthused');
  await page.locator('[data-deep-analysis="14"]').click();assert.equal(await page.locator('dialog[open]').count(),0);
  await page.locator('[name=q14_iv]').fill('thug');await page.locator('[data-deep-analysis="14"]').click();await page.locator('[data-deep-main] .deep-page').waitFor();assert.equal(await page.locator('[data-deep-steps] button').count(),51);await page.keyboard.press('Escape');
  await page.setViewportSize({width:390,height:844});
  await page.locator('[data-deep-analysis="2"]').click();await page.locator('[data-deep-main] .deep-page').waitFor();await page.locator('[data-deep-step="2"]').click();
  assert.equal(await page.locator('.deep-reader').evaluate(d=>d.scrollWidth<=d.clientWidth+1),true,'No phone horizontal overflow');
  await page.screenshot({path:'/tmp/dse-deep-phone.png',fullPage:false});
  await page.locator('[data-deep-next]').click();assert.match(await page.locator('[data-deep-position]').innerText(),/4 \/ 6/);await page.keyboard.press('Escape');
  await page.setViewportSize({width:820,height:1180});await page.locator('[data-deep-analysis="2"]').click();await page.locator('[data-deep-main] .deep-page').waitFor();await page.locator('[data-deep-step="3"]').click();
  await page.screenshot({path:'/tmp/dse-deep-tablet.png',fullPage:false});
  assert.equal(await page.locator('.deep-reader').evaluate(d=>d.scrollWidth<=d.clientWidth+1),true);
  await page.keyboard.press('Escape');

  // Every source question is reachable after filling its controls (including table parts).
  for(let number=1;number<=22;number++){
    const card=page.locator(`[data-question="${number}"]`);
    await card.locator('[data-answer-part]').evaluateAll(inputs=>{
      const checked=new Set();
      for(const input of inputs){
        if(input.type==='radio'||input.type==='checkbox'){if(checked.has(input.name))continue;checked.add(input.name);input.checked=true;}
        else if(input.tagName==='SELECT') input.value=input.options[1].value;
        else input.value='Local test answer';
        input.dispatchEvent(new Event('input',{bubbles:true}));
      }
    });
    await page.locator(`[data-deep-analysis="${number}"]`).click();
    await page.locator('.deep-reader [data-deep-main] .deep-page').waitFor();
    assert.match(await page.locator('#deep-title').innerText(),new RegExp(`第 ${number} 題`));
    const emphasisPages={14:[173],16:[220,223],18:[248]};
    for(const sourcePage of emphasisPages[number]||[]){
      const start={14:154,16:210,18:242}[number];
      await page.locator(`[data-deep-step="${sourcePage-start}"]`).click();
      assert.ok(await page.locator('.deep-page .source-highlight').count()>0);
      await page.screenshot({path:`/tmp/dse-emphasis-p${sourcePage}.png`,fullPage:false});
      if(sourcePage===220){
        await page.setViewportSize({width:390,height:844});
        await page.locator('[data-deep-main]').evaluate(el=>el.scrollIntoView({block:'start'}));
        assert.equal(await page.locator('.deep-reader').evaluate(d=>d.scrollWidth<=d.clientWidth+1),true);
        const punctuation = await page.evaluate(async () => {
          const {renderRichBody} = await import('/dse-deep-analysis.mjs');
          const text = '兩者主語、動作、內容都不同。';
          const fixture = document.createElement('div');
          fixture.style.cssText = 'position:fixed;left:0;top:0;font:20px sans-serif;visibility:hidden';
          document.body.append(fixture);
          fixture.innerHTML = '<span>' + text.slice(0,-1) + '</span>';
          const width = fixture.firstChild.getBoundingClientRect().width + 1;
          fixture.style.width = width + 'px';
          fixture.innerHTML = renderRichBody({richBody:[{runs:[{text,style:{size:14}}]}]});
          const renderedText = fixture.textContent;
          const row = fixture.firstChild;
          const hangingHeight = row.getBoundingClientRect().height;
          const stop = fixture.querySelector('.deep-hanging-stop');
          const stopWidth = stop.getBoundingClientRect().width;
          stop.style.width = 'auto';
          const ordinaryHeight = row.getBoundingClientRect().height;
          fixture.remove();
          return {renderedText, text, stopWidth, hangingHeight, ordinaryHeight};
        });
        assert.equal(punctuation.renderedText, punctuation.text, 'Every source character, including the full stop, stays intact');
        assert.equal(punctuation.stopWidth, 0);
        assert.ok(punctuation.ordinaryHeight > punctuation.hangingHeight, 'A full stop no longer forces an extra line');
        await page.screenshot({path:'/tmp/dse-emphasis-phone.png',fullPage:false});
        await page.setViewportSize({width:1440,height:1000});
      }
    }
    if(number===21) assert.match(await page.locator('.deep-comparison').innerText(),/兩條有證據的路線/);
    assert.equal(await page.locator('.deep-original, .deep-furniture, [data-deep-mode=original]').count(),0);
    await page.keyboard.press('Escape');
  }
  // A saved role is insufficient: the server verification must accept it.
  await page.evaluate(() => {
    sessionStorage.setItem('edmundFlashcardSession', JSON.stringify({name:'Local Admin',role:'admin'}));
    sessionStorage.setItem('edmundFlashcardAdminPassword','local-test-only');
    window.__sourceAdminAllowed=false;
  });
  await page.locator('[data-deep-analysis="2"]').click();
  await page.locator('.deep-page').waitFor();
  assert.equal(await page.locator('.deep-original, .deep-furniture').count(),0,'Forged or rejected admin session stays hidden');
  await page.keyboard.press('Escape');
  await page.evaluate(() => {window.__sourceAdminAllowed=true;});
  await page.locator('[data-deep-analysis="2"]').click();
  await page.locator('.deep-original summary').waitFor();
  assert.equal(await page.locator('.deep-furniture').count(),1);
  await page.locator('.deep-original summary').click();
  await page.locator('.deep-original img').evaluate(img=>img.decode());
  await page.locator('[data-deep-mode=original]').click();
  await page.locator('.deep-page img').evaluate(img=>img.decode());
  await page.keyboard.press('Escape');
  await page.evaluate(() => {window.__sourceAdminAllowed=false;});
  await page.locator('[data-deep-analysis="2"]').click();
  await page.locator('.deep-page').waitFor();
  assert.equal(await page.locator('.deep-original, .deep-furniture, [data-deep-mode=original]').count(),0,'Admin privileges are rechecked on reopening');
  await page.keyboard.press('Escape');
  await page.evaluate(() => {
    sessionStorage.removeItem('edmundFlashcardSession');
    sessionStorage.removeItem('edmundFlashcardAdminPassword');
  });
  // A fresh page avoids the successful load cache. First load fails, retry succeeds.
  await page.reload();await page.locator('[data-deep-analysis="2"]').waitFor();
  let failed=false;
  await page.route('**/dse-reading-analysis/dse-2023-a/index.json*',route=>{if(!failed){failed=true;return route.fulfill({status:503,body:'Unavailable'});}return route.continue();});
  await page.locator('[data-deep-analysis="2"]').click();await page.locator('[data-deep-retry]').waitFor();
  await page.locator('[data-deep-retry]').click();await page.locator('.deep-reader [data-deep-main] .deep-page').waitFor();
  await page.keyboard.press('Escape');

  assert.deepEqual(errors,[]);
  console.log('Browser checks passed: all 22 entry buttons, unanswered/partial answer gates, original images, full text, search, saved understanding markers, preserved answers, Escape/focus return, phone/tablet layouts.');
}finally{await browser.close();}
