import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir} from 'node:fs/promises';

const require = createRequire(import.meta.url);
const {chromium} = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const base = process.env.STUDY_TEST_URL || 'http://127.0.0.1:8774';
const output = '/private/tmp/dse-listening-2025-2026-qa';
await mkdir(output,{recursive:true});
const browser = await chromium.launch({headless:true});
try {
  const page = await browser.newPage({viewport:{width:1440,height:1000}});
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    return url.origin === base || url.hostname === 'edmund-neural-audio.edmundeducation.workers.dev' ? route.continue() : route.abort();
  });
  await page.addInitScript(() => {
    sessionStorage.setItem('edmund-listening-session-v1',JSON.stringify({id:'new-years-test',name:'Test',token:'test-token',role:'student'}));
    window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{user:{id:'auth-test'}}}})},rpc:async name=>({data:name==='flashcard_student_session_profile'?[{id:'new-years-test',name:'Test',session_token:'test-token'}]:[]})})};
  });
  for (const year of [2025,2026]) {
    for (const task of [1,2,3,4]) {
      await page.goto(`${base}/listening-system.html?section=dse&year=${year}&task=${task}`,{waitUntil:'domcontentloaded'});
      await page.locator('.dse-digital-paper-frame').waitFor();
      await page.locator(`[data-dse-audio-task="${task}"]`).waitFor({timeout:15000});
      assert.match(await page.locator(`[data-dse-audio-task="${task}"]`).getAttribute('src'), new RegExp(`${year}%20Part%20A%20Task%20${task}\\.mp3`));
      assert.ok(await page.locator('[data-dse-answer-q]').count()>0,`${year} Task ${task} controls`);
      assert.ok(await page.locator('.digital-paper-translation:visible').count()>0,`${year} Task ${task} translation`);
      assert.ok(await page.locator('[data-dse-transcript-line]').count()>=40,`${year} Task ${task} transcript`);
      assert.equal(await page.locator('[data-check-dse-task]:disabled').count(),1,`${year} Task ${task} no fabricated answer key`);
      await page.locator('[data-toggle-dse-digital-zh]').click();
      assert.equal(await page.locator('.digital-paper-translation:visible').count(),0,`${year} Task ${task} translation toggle`);
      await page.locator('[data-toggle-dse-digital-zh]').click();
      assert.ok(await page.locator('.digital-paper-translation:visible').count()>0);
      if(year===2026 && [1,2].includes(task)){
        const diagrams=page.locator('.dse-reconstructed-diagram');
        assert.ok(await diagrams.count()>=1,`${year} Task ${task} diagrams`);
        for(let i=0;i<await diagrams.count();i++) {
          assert.ok(await diagrams.nth(i).evaluate(image=>image.complete&&image.naturalWidth>0));
          await diagrams.nth(i).screenshot({path:`${output}/${year}-task-${task}-figure-${i+1}.png`});
        }
      }
      if(task===1){
        await page.screenshot({path:`${output}/${year}-desktop.png`,fullPage:false});
        await page.setViewportSize({width:390,height:844});
        await page.screenshot({path:`${output}/${year}-mobile.png`,fullPage:false});
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2),`${year} mobile overflow`);
        await page.setViewportSize({width:1440,height:1000});
      }
    }
  }
  assert.deepEqual(errors,[]);
  console.log('2025/2026 DSE browser: eight audio-backed interactive tasks, inline Chinese toggle, timed transcripts, SVG figures and mobile view passed.');
} finally {await browser.close();}
