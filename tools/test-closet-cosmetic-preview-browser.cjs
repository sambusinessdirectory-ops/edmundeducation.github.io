const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const {chromium}=require(process.env.HOME+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const sharp=require('./email-qa/node_modules/sharp');
const root=path.resolve(__dirname,'..'),mime={'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp'};
const server=http.createServer((req,res)=>{const p=path.resolve(root,'.'+new URL(req.url,'http://local').pathname);if(!p.startsWith(root+'/'))return res.writeHead(403).end();fs.readFile(p,(e,b)=>{res.writeHead(e?404:200,{'Content-Type':mime[path.extname(p)]||'application/octet-stream'});res.end(e?'':b);});});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true});try{
 const page=await browser.newPage({viewport:{width:1400,height:950},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('https://**/*',r=>r.abort());
 await page.route('**/__closet_preview',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><link rel="stylesheet" href="/common-expression-map.css"><body></body>'}));
 await page.addInitScript(()=>{
  window.EdmundSystemNav={getStudentSession:()=>({id:'closet-preview-fixture',token:'fixture-token'})};
  window.EDMUND_SUPABASE={url:'https://fixture.invalid',anonKey:'fixture'};
  window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{user:{id:'fixture'}}}})},rpc:async(method)=>({data:method==='eddie_farm_owned_cosmetics'?['pink-rain-jacket']:{equipped:{},outfits:[]}})})};
 });
 await page.goto('http://127.0.0.1:'+server.address().port+'/__closet_preview');
 await page.evaluate(async()=>{window.cosmetics=await import('/eddy-cosmetics.mjs?v=20260923-admin-cosmetic-preview1');const {openCompanionCloset}=await import('/common-expression-closet-3d.mjs?v=20260924-closet-outfit1');window.closet=openCompanionCloset({character:'celeste'});});
 await page.waitForFunction(()=>document.querySelector('[data-closet-stage] canvas')?.dataset.actorPosition&&document.querySelector('[data-closet-loading]')?.hidden&&window.cosmetics.cosmeticsState().owned.includes('pink-rain-jacket'),null,{timeout:90000});
 const stage=page.locator('[data-closet-stage] canvas'),before=await stage.screenshot();
 await page.locator('dialog [data-cosmetic=pink-rain-jacket]').click();
 assert.equal(await page.locator('dialog [data-cosmetic=pink-rain-jacket]').getAttribute('aria-pressed'),'true');
 await page.waitForTimeout(600);
 const after=await stage.screenshot();
 const a=await sharp(before).removeAlpha().raw().toBuffer({resolveWithObject:true}),b=await sharp(after).removeAlpha().raw().toBuffer({resolveWithObject:true});
 assert.equal(a.info.width,b.info.width);assert.equal(a.info.height,b.info.height);
 let changed=0;for(let i=0;i<a.data.length;i+=3)if(Math.abs(a.data[i]-b.data[i])+Math.abs(a.data[i+1]-b.data[i+1])+Math.abs(a.data[i+2]-b.data[i+2])>80)changed++;
 assert.ok(changed>3000,`Inventory says Equipped, but Celeste's closet preview stayed bare (${changed} visibly changed pixels)`);
 assert.deepEqual(errors,[]);console.log('PASS: equipping Celeste\'s rain jacket visibly changes the 3D closet avatar; changed pixels:',changed);
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
