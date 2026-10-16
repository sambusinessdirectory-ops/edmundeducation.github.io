import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import imported from '../../natural-english/advanced-imported.generated.mjs';
const playwright=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const origin=process.argv[2]||'http://127.0.0.1:8768';
const out=process.argv[3]||'/private/tmp/advanced-native-partial-groups';
await fs.mkdir(out,{recursive:true});
const rows=[];
for(const engine of ['chromium','webkit']){
 const browser=await playwright[engine].launch({headless:true});
 try{
  for(const prefix of [10,15])for(const remainder of [1,2,3,4]){
   const count=prefix+remainder,selected=imported.slice(0,count-10);
   assert.equal(selected.length,count-10);
   const context=await browser.newContext({serviceWorkers:'block',reducedMotion:'reduce',viewport:{width:1280,height:1000}});
   await context.route('https://cdn.jsdelivr.net/**',r=>r.abort());
   await context.route('**/rest/v1/rpc/eddie_farm_visit',r=>r.fulfill({status:200,contentType:'application/json',body:'[]'}));
   await context.route('**/advanced-imported.generated.mjs*',r=>r.fulfill({contentType:'text/javascript',body:'export default '+JSON.stringify(selected)+';'}));
   await context.addInitScript(()=>{
    const id='f940019e-0588-4ab9-8b81-135b280a9066',token='46744942-d0cf-4823-92ba-b35581d407dc';
    window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{access_token:'synthetic-preview'}}})},rpc:name=>({abortSignal:async()=>({data:name==='flashcard_student_login'?[{session_token:token}]:name==='flashcard_student_session_profile'?[{id,name:'Partial Group Preview',session_token:token}]:{events:[],timeDays:[]},error:null})})})};
   });
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(origin+'/advanced-native.html',{waitUntil:'networkidle'});
   await page.locator('[name=username]').fill('Partial Group Preview');await page.locator('[name=password]').fill('preview');await page.locator('[data-login-form] [type=submit]').click();
   await page.waitForFunction(n=>document.querySelectorAll('[data-module-grid] [data-module]').length===n,count);
   await page.mouse.move(0,0);
   const group=page.locator('[data-module-grid]>.module-card-grid').last();
   const palette=prefix===10?'normal':'reversed',expected=Array.from({length:remainder},(_,i)=>palette==='normal'?i<3?'white':'black':i<2?'black':'white');
   assert.equal(await group.getAttribute('data-layout'),'results');
   assert.equal(await group.getAttribute('data-palette'),palette);
   assert.equal(await group.locator('[data-module]').count(),remainder,'No fake filler lessons.');
   const ids=await page.locator('[data-module-grid] [data-module]').evaluateAll(nodes=>nodes.map(n=>n.dataset.module));
   assert.deepEqual(ids.slice(10),selected.map(r=>r.id),'Order stays unchanged in partial groups.');
   for(const width of [1280,1024,768,600,390,320]){
    await page.setViewportSize({width,height:1000});await page.keyboard.press('Escape');await page.mouse.move(0,0);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${engine}/${count}/${width} overflow`);
    const colors=await group.locator('[data-module]').evaluateAll(nodes=>nodes.map(n=>getComputedStyle(n).backgroundColor==='rgb(23, 23, 23)'?'black':getComputedStyle(n).backgroundColor==='rgb(255, 255, 255)'?'white':getComputedStyle(n).backgroundColor));
    assert.deepEqual(colors,expected,`${engine}/${count}/${width} preserve truncated full-group palette`);
    if(width===1280||width===320)await group.screenshot({path:path.join(out,`${engine}-${count}-${width}.png`)});
    if(width===320){
     // Element screenshots scroll the whole tall group into view and may place
     // its first title beneath the fixed site header. Capture a separate actual
     // viewport with that first card below the header, without hiding the UI.
     const first=group.locator('[data-module]').first();
     const top=await first.evaluate(n=>n.getBoundingClientRect().top+scrollY);
     await page.evaluate(y=>window.scrollTo({top:Math.max(0,y-220),behavior:'instant'}),top);
     await page.screenshot({path:path.join(out,`${engine}-${count}-first-card-mobile.png`)});
    }
   }
   assert.deepEqual(errors,[]);rows.push({engine,count,remainder,palette,colors:expected,layout:'regular-responsive-grid',widths:[1280,1024,768,600,390,320],passed:true});
   await context.close();
  }
 }finally{await browser.close();}
}
const report={checkedAt:new Date().toISOString(),policy:'Only existing lessons are shown. The final incomplete group uses a regular responsive grid and the colours of the corresponding prefix of its odd/even five-lesson group. There are no placeholder lessons and DOM order is preserved.',syntheticAccount:true,physicalDeviceReviewClaimed:false,screenshotInspection:'pending',cases:rows};
await fs.writeFile(path.join(out,'result.json'),JSON.stringify(report,null,2)+'\n');
console.log(`${rows.length} partial-group browser cases passed; screenshot inspection remains separate.`);
