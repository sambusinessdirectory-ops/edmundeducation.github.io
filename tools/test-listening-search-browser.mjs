import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const sections=fs.readFileSync(path.join(root,'listening-system.html'),'utf8').match(/<section class="listening-search panel"[\s\S]*?<\/section>/g);
assert.equal(sections.length,2);
const html=`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/listening-system.css"><main class="listening-shell">${sections.join('')}</main><script type="module">import {mountListeningSearch} from '/listening-search.mjs';document.querySelectorAll('[data-listening-search]').forEach(root=>mountListeningSearch(root,{onOpen:entry=>{window.opened=entry;}}));window.ready=true;</script>`;
const server=http.createServer((req,res)=>{
 if(req.url==='/__search-test'){res.setHeader('Content-Type','text/html');res.end(html);return;}
 const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){res.writeHead(404).end();return;}
 res.setHeader('Content-Type',({'.css':'text/css','.mjs':'text/javascript','.json':'application/json'})[path.extname(file)]||'application/octet-stream');
 fs.createReadStream(file).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1300,height:950}});
 const requests=[],errors=[];page.on('request',req=>requests.push(req.url()));page.on('pageerror',error=>errors.push(error.message));
 const origin=`http://127.0.0.1:${server.address().port}`;
 await page.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
 await page.goto(origin+'/__search-test');await page.waitForFunction(()=>window.ready);
 assert.equal(requests.filter(x=>x.includes('/search/')).length,0,'index must not preload');
 const dse=page.locator('[data-listening-search="dse"]'),ielts=page.locator('[data-listening-search="ielts"]');
 await dse.locator('input').fill('e');await page.waitForTimeout(260);
 assert.equal(requests.filter(x=>x.includes('/search/')).length,0,'one letter should not fetch');
 await dse.locator('input').fill('emoji');await dse.locator('[data-search-results] a').first().waitFor();
 assert.equal(await dse.locator('[data-search-results] a').count(),1);
 assert.equal(await dse.locator('[data-search-results] a').getAttribute('href'),'listening-system.html?section=dse&year=2023&task=4');
 await dse.locator('[data-search-results] a').click();
 assert.equal(await page.evaluate(()=>window.opened.year),2023);assert.equal(await page.evaluate(()=>window.opened.part),4);
 await ielts.locator('input').fill('carers');await ielts.locator('input').press('Enter');
 await ielts.locator('a[href*="practice=2&part=1"]').waitFor();
 await ielts.locator('a[href*="practice=2&part=1"]').click();
 assert.equal(await page.evaluate(()=>window.opened.practice),2);assert.equal(await page.evaluate(()=>window.opened.part),1);
 await dse.locator('input').fill('the');await dse.locator('input').press('Enter');
 await dse.locator('[data-search-more]').waitFor();
 assert.equal(await dse.locator('[data-search-results] a').count(),12);
 await dse.locator('[data-search-more]').click();assert.equal(await dse.locator('[data-search-results] a').count(),24);
 await dse.locator('input').fill('qzxqzxzznohit');await dse.locator('input').press('Enter');
 assert.ok((await dse.locator('[data-search-status]').textContent()).includes('找不到'));
 await dse.locator('input').fill('');await dse.locator('input').press('Enter');
 assert.equal(await dse.locator('[data-search-results]').isVisible(),false);
 await page.setViewportSize({width:390,height:844});
 await dse.locator('input').fill('emoji');await dse.locator('input').press('Enter');
 await dse.locator('[data-search-results] a').waitFor();
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 assert.equal(requests.filter(x=>x.includes('/search/dse.json')).length,1);
 assert.equal(requests.filter(x=>x.includes('/search/ielts.json')).length,1);
 assert.equal(requests.some(x=>/\.(mp3|mp4|wav)|\/practices\/practice-/.test(x)),false,'search must not fetch audio or full practices');
 // Reload with one failed index response; retry must succeed and late results must not replace a cleared search.
 const retryPage=await browser.newPage();let failures=0;
 await retryPage.route('**/search/dse.json*',async route=>{
  if(failures++===0)return route.fulfill({status:503,body:'offline'});
  await new Promise(resolve=>setTimeout(resolve,350));return route.continue();
 });
 await retryPage.goto(origin+'/__search-test');await retryPage.waitForFunction(()=>window.ready);
 const retry=retryPage.locator('[data-listening-search="dse"]');
 await retry.locator('input').fill('emoji');await retry.locator('input').press('Enter');
 await retryPage.waitForFunction(()=>document.querySelector('[data-search-status]').textContent.includes('重試'));
 await retry.locator('input').press('Enter');
 await retry.locator('input').fill('');await retry.locator('input').press('Enter');await retryPage.waitForTimeout(420);
 assert.equal(await retry.locator('[data-search-results]').isVisible(),false);
 await retry.locator('input').fill('emoji');await retry.locator('input').press('Enter');await retry.locator('[data-search-results] a').waitFor();
 assert.deepEqual(errors,[]);
 if(process.env.DSE_QA_OUTPUT){fs.mkdirSync(process.env.DSE_QA_OUTPUT,{recursive:true});await page.screenshot({path:path.join(process.env.DSE_QA_OUTPUT,'listening-search-mobile.png'),fullPage:true});}
 console.log('Listening search browser: lazy text-only requests, matching DSE/IELTS parts, direct navigation callbacks, pagination, empty/no-results, mobile, retry and stale-response protection passed.');
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
