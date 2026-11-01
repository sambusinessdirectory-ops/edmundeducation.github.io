const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const port = Number(process.env.PORT || 8799);
const {chromium} = require(process.env.HOME+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch();
 try{
  const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  const assetBase='https://edmund-site-assets.edmundeducation.workers.dev/site-assets/v1/';
  await page.route('**/ielts-writing-preview/task1-diagrams.json*',route=>{const catalogue=JSON.parse(fs.readFileSync('ielts-writing-preview/task1-diagrams.json','utf8'));for(const item of catalogue)item.image=assetBase+item.image;return route.fulfill({json:catalogue});});
  await page.route('**/site-assets/v1/assets/**',route=>{const localPath=path.resolve(process.cwd(),new URL(route.request().url()).pathname.replace('/site-assets/v1/',''));return route.fulfill({path:localPath,contentType:'image/webp'});});
  await page.route('**/ielts-chart-teaching/auth.mjs*',route=>route.fulfill({contentType:'text/javascript',body:"window.chartStudentId='catalog-test'; document.querySelector('#student-login').hidden=true; document.querySelector('#student-workspace').hidden=false; import('/ielts-chart-teaching/app.mjs?v=20261101-2');"}));
  await page.goto(`http://127.0.0.1:${port}/ielts-chart-teaching.html`,{waitUntil:'networkidle'});
  await page.locator('#chart-selector option').last().waitFor({state:'attached'});
  assert.equal(await page.locator('#chart-selector option').count(),60);
  assert.equal(await page.locator('.chart-row').count(),10);
  await page.locator('#chart-selector').selectOption('T1-001');
  assert.equal(await page.locator('.source-chart-image').count(),1);
  assert((await page.locator('.source-chart-image').getAttribute('src')).startsWith(assetBase));
  await page.waitForFunction(()=>{const img=document.querySelector('.source-chart-image');return img?.complete&&img.naturalWidth>0;});
  await page.locator('.source-chart-image').click({position:{x:130,y:100}});
  await page.locator('#point-label').fill('High income households');
  await page.locator('#point-value').fill('29');
  await page.locator('#point-form button[type=submit]').click();
  assert.equal(await page.locator('.image-pin').count(),1);
  await page.locator('[data-group=blue]').click();
  await page.locator('.image-pin').click();
  assert(await page.locator('.image-pin').evaluate(el=>el.classList.contains('multi-group')));
  await page.locator('[data-mode=calculate]').click();
  await page.locator('.image-pin').click();
  await page.locator('#manual-number').fill('2');
  await page.locator('#manual-form button').click();
  assert.equal(await page.locator('#result').innerText(),'31');
  await page.locator('[data-mode=organize]').click();
  await page.locator('.image-pin').click();
  assert.equal(await page.locator('.organization-item').count(),1);
  await page.screenshot({path:'/private/tmp/ielts-chart-catalog-desktop.png',fullPage:true});
  await page.locator('#chart-selector').selectOption('T1-024');
  assert.equal(await page.locator('.source-chart-image').count(),1);
  await page.locator('#chart-selector').selectOption('T1-001');
  assert.equal(await page.locator('.image-pin').count(),1);
  assert.equal(await page.locator('.organization-item').count(),1);
  assert(await page.locator('.image-pin').evaluate(el=>el.classList.contains('multi-group')));
  for(const id of ['T1-018','T1-033','T1-043','T1-054','T1-060']){
   await page.locator('#chart-selector').selectOption(id);
   await page.waitForFunction(()=>{const img=document.querySelector('.source-chart-image');return img?.complete&&img.naturalWidth>0;});
  }
  await page.setViewportSize({width:390,height:844});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.screenshot({path:'/private/tmp/ielts-chart-catalog-mobile.png',fullPage:true});
  assert.deepEqual(errors,[]);
  console.log('PASS: 60 charts, image loading, pins, grouping, calculator, organization, persistence, mobile');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
