import assert from 'node:assert/strict';
import fs from 'node:fs';
// Supply PLAYWRIGHT_MODULE when using the bundled desktop runtime.
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
import {shuffled} from '../proverb-curation-core.mjs';
const base=process.env.PROVERB_REVIEW_URL||'http://127.0.0.1:8876/proverb-curation-review.html';
const browser=await chromium.launch({headless:true,args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
const lessons=[1,2,3].map(n=>JSON.parse(fs.readFileSync(new URL(`../content/proverb-compass/proverb-0${n}.json`,import.meta.url))));
try{
 for(const l of lessons){
  await page.goto(`${base}#${l.id}/8`);await page.waitForSelector('.question');assert.equal(await page.locator('.question').count(),60);assert.equal(await page.locator('.question .option').count(),240);
  const checks=l.items.map(q=>{const opts=shuffled(q.options,q.id),key=opts.findIndex(o=>o.correct),wrong=opts.findIndex(o=>!o.correct);return{id:q.id,key,wrong,wrongReason:opts[wrong].reasonZh,keyReason:opts[key].reasonZh};});
  // Real delegated DOM clicks, all 180 cards: reveal rules, retry and completion.
  const results=await page.evaluate(checks=>checks.map(q=>{const card=document.getElementById(q.id),buttons=card.querySelectorAll('[data-choice]'),fb=card.querySelector('.feedback');buttons[q.wrong].click();const wrongOK=fb.textContent.includes(q.wrongReason)&&!fb.textContent.includes(q.keyReason)&&fb.querySelectorAll('li').length===0&&!buttons[q.key].disabled;buttons[q.key].click();return{wrongOK,rightOK:fb.querySelectorAll('li').length===4&&buttons[q.key].classList.contains('is-right')&&[...buttons].every(b=>b.disabled)};}),checks);
  assert(results.every(r=>r.wrongOK&&r.rightOK),l.id);assert.match(await page.locator('.progress').innerText(),/60 \/ 60/);await page.reload();await page.waitForSelector('.question');assert.match(await page.locator('.progress').innerText(),/60 \/ 60/);
  for(const stage of [1,2,3,5,6,7]){
   await page.goto(`${base}#${l.id}/${stage}`);await page.waitForSelector('.page');assert.equal(await page.locator('#stages a').count(),7);
   if(l.guide.choices[stage]){const opts=shuffled(l.guide.choices[stage].options,`${l.id}:guide:${stage}`),key=opts.findIndex(o=>o.correct),wrong=opts.findIndex(o=>!o.correct);await page.locator('.decision .option').nth(wrong).click();assert.equal(await page.locator('.decision .feedback li').count(),0);await page.locator('.decision .option').nth(key).click();assert.equal(await page.locator('.decision .feedback li').count(),3);}
  }
 }
 await page.goto(`${base}#proverb-01/4`);await page.waitForSelector('h2');assert.match(await page.locator('h2').innerText(),/用諺語回應/);
 await page.goto(`${base}#proverb-03/8`);await page.waitForSelector('.question');await page.locator('[data-bookmark="proverb-03-q01"]').click();await page.reload();await page.waitForSelector('.question');assert.equal(await page.locator('[data-bookmark="proverb-03-q01"]').getAttribute('aria-pressed'),'true');
 await page.goto(`${base}#proverb-01/7`);await page.waitForSelector('[data-record]');
 await page.evaluate(()=>{window.__spoken=[];speechSynthesis.speak=u=>{window.__spoken.push({text:u.text,lang:u.lang});u.onstart?.();u.onend?.();};});
 await page.locator('[data-speak]').click();const spoken=await page.evaluate(()=>window.__spoken);assert.equal(spoken[0].text,lessons[0].guide.readAloud.en);assert.equal(spoken[0].lang,'en-GB');
 await page.locator('[data-record]').click();await page.waitForFunction(()=>document.querySelector('[data-record]').textContent.includes('停止'));await new Promise(r=>setTimeout(r,250));await page.locator('[data-record]').click();await page.waitForSelector('audio[src^="blob:"]');
 await page.locator('#stages a').first().click();await page.waitForFunction(()=>document.querySelector('h2')?.textContent.includes('一眼懂'));assert.equal(await page.locator('audio').count(),0);
 await page.goto(`${base}#proverb-02/7`);await page.waitForSelector('[data-record]');await page.evaluate(()=>{navigator.mediaDevices.getUserMedia=async()=>{throw new DOMException('Denied','NotAllowedError');};});await page.locator('[data-record]').click();await page.waitForFunction(()=>document.querySelector('.audio-status').textContent.includes('無法使用麥克風'));await page.locator('#stages a').last().click();await page.waitForSelector('.question');assert.equal(await page.locator('.question').count(),60);
 // Phone layout: every lesson and stage, including the longest explanation sets.
 await page.setViewportSize({width:390,height:844});for(const l of lessons)for(const stage of [1,2,3,5,6,7,8]){await page.goto(`${base}#${l.id}/${stage}`);await page.waitForSelector('.page');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${l.id}/${stage} overflow`);}
 await page.screenshot({path:'/tmp/proverb-review-mobile-final.png',fullPage:false});assert.deepEqual(errors,[]);
 console.log('PASS: 180 wrong→correct retries + reload persistence; 12 guide decisions; 21 mobile views; retired stage; bookmarks; speech request; recorded audio; microphone denial; no JS errors.');
}finally{await browser.close();}
