const fs=require('fs'),path=require('path'),http=require('http'),assert=require('node:assert/strict');
const {chromium}=require(process.env.HOME+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{const file=path.join(root,new URL(req.url,'http://local').pathname);fs.readFile(file,(e,b)=>{res.writeHead(e?404:200,{'Content-Type':/\.(mjs|js)$/.test(file)?'text/javascript':'text/html'});res.end(e?'':b);});});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true});try{
 const page=await browser.newPage();let fail=true,calls=0;const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/__shop',r=>r.fulfill({contentType:'text/html',body:'<div id="inventory"></div>'}));
 await page.route('https://fixture.invalid/rest/v1/rpc/eddie_farm_snapshot',r=>{calls++;return r.fulfill({status:fail?503:200,contentType:'application/json',body:JSON.stringify(fail?{message:'Temporary shop outage'}:{balance:125,cosmetics:[]})});});
 await page.addInitScript(()=>{window.EdmundSystemNav={getStudentSession:()=>({id:'fixture',token:'fixture',role:'student'})};window.EDMUND_SUPABASE={url:'https://fixture.invalid',anonKey:'fixture'};window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{}}})},rpc:async name=>({data:name==='eddie_farm_owned_cosmetics'?['cream-cable-knit']:{equipped:{},outfits:[]}})})};});
 await page.goto('http://127.0.0.1:'+server.address().port+'/__shop');
 assert.equal(await page.evaluate(()=>!!window.EddieFarmAPI),false);
 await page.evaluate(async()=>{const {mountClosetInventory}=await import('/eddy-closet-inventory.mjs');mountClosetInventory(document.querySelector('#inventory'),new AbortController().signal);});
 await page.locator('[data-shop-retry]').waitFor({state:'visible'});assert.match(await page.locator('[data-shop-status]').innerText(),/Temporary/);
 fail=false;await page.locator('[data-shop-retry]').click();await page.waitForFunction(()=>document.querySelector('[data-closet-coins] strong').textContent==='125');
 await page.waitForFunction(()=>document.querySelector('[data-shop-status]').textContent==='');
 await page.locator('[data-cosmetic="cream-cable-knit"]').click();assert.equal(await page.locator('[data-cosmetic="cream-cable-knit"]').getAttribute('aria-pressed'),'true');
 assert.equal(calls,2);assert.deepEqual(errors,[]);console.log('PASS: missing API loaded, failed shop retried, balance restored and owned clothes equipped');
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
