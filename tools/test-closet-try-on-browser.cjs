const fs=require('fs'),path=require('path'),http=require('http'),assert=require('node:assert/strict');
const {chromium}=require(process.env.HOME+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const sharp=require(process.env.HOME+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+new URL(req.url,'http://local').pathname);if(!file.startsWith(root+'/'))return res.writeHead(403).end();fs.readFile(file,(e,b)=>{res.writeHead(e?404:200,{'Content-Type':({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png'})[path.extname(file)]||'text/html'});res.end(e?'':b);});});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true});try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://**/*',r=>r.abort());
 await page.route('**/__try_on',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><link rel="stylesheet" href="/common-expression-map.css"><body></body>'}));
 await page.addInitScript(()=>{
  window.fixture={balance:125,owned:[],calls:0,saves:0,fail:false,wardrobe:{equipped:{},outfits:[]}};
  const student={id:'preview-test',token:'test-token'};
  window.EdmundSystemNav={getStudentSession:()=>student};window.EDMUND_SUPABASE={url:'https://fixture.invalid',anonKey:'fixture'};
  window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{}}})},rpc:async(method,args)=>{
   if(method==='eddie_farm_owned_cosmetics')return {data:[...fixture.owned]};
   if(method==='character_closet_sync'){fixture.saves++;fixture.wardrobe={equipped:args.p_equipped,outfits:args.p_outfits};}
   return {data:fixture.wardrobe};
  }})};
  window.EddieFarmAPI={student:()=>student,snapshot:async()=>({balance:fixture.balance,cosmetics:[{id:'cream-cable-knit',price:25},{id:'blue-swordsman-jacket',price:35}]}),perform:async(kind,args)=>{
   fixture.calls++;await new Promise(r=>setTimeout(r,100));if(fixture.fail)throw Error('Purchase failed');
   fixture.balance-=args.p_item==='cream-cable-knit'?25:35;fixture.owned.push(args.p_item);return EddieFarmAPI.snapshot();
  }};
 });
 await page.goto('http://127.0.0.1:'+server.address().port+'/__try_on');
 await page.evaluate(async()=>{window.cosmetics=await import('/eddy-cosmetics.mjs?v=20261028-free-try-on1');const {openCompanionCloset}=await import('/common-expression-closet-3d.mjs?v=20261028-free-try-on1');window.closet=openCompanionCloset({character:'eddy'});});
 await page.waitForFunction(()=>document.querySelector('[data-closet-stage] canvas')?.dataset.actorPosition&&document.querySelector('[data-closet-loading]')?.hidden&&document.querySelector('[data-closet-coins] strong')?.textContent==='125',null,{timeout:90000});
 const stage=page.locator('[data-closet-stage] canvas'),card=page.locator('[data-cosmetic="cream-cable-knit"]'),buy=page.locator('[data-buy-cosmetic="cream-cable-knit"]');
 assert(await buy.isDisabled());const before=await stage.screenshot();await card.click();
 assert.equal(await card.getAttribute('aria-pressed'),'true');assert.equal(await page.evaluate(()=>fixture.calls),0);assert.equal(await page.evaluate(()=>fixture.balance),125);
 assert(await page.locator('[data-save-avatar]').isDisabled());assert(await page.locator('[data-outfit-form] button').isDisabled());
 await page.evaluate(async()=>{try{await cosmetics.saveAvatar('trial');throw Error('Unowned save succeeded');}catch(e){if(!e.message.includes('Buy or remove'))throw e;}});
 assert.equal(await page.evaluate(()=>fixture.saves),0);
 await page.waitForTimeout(800);const after=await stage.screenshot();
 const a=await sharp(before).removeAlpha().raw().toBuffer(),b=await sharp(after).removeAlpha().raw().toBuffer();let changed=0;
 for(let i=0;i<a.length;i+=3)if(Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2])>80)changed++;
 assert(changed>1000,`3D try-on did not visibly change (${changed} pixels)`);
 await page.screenshot({path:'/tmp/closet-free-preview-desktop.png'});
 await buy.evaluate(el=>{el.click();el.click();});await page.waitForFunction(()=>fixture.owned.includes('cream-cable-knit')&&document.querySelector('[data-buy-cosmetic="cream-cable-knit"]').hidden);
 assert.equal(await page.evaluate(()=>fixture.calls),1);assert.equal(await page.evaluate(()=>fixture.balance),100);assert.equal(await card.getAttribute('aria-pressed'),'true');
 await page.locator('[data-save-avatar]').click();await page.waitForFunction(()=>fixture.saves===1);
 await page.locator('[data-cosmetic="blue-swordsman-jacket"]').click();assert.equal(await page.evaluate(()=>fixture.calls),1);
 await page.evaluate(()=>fixture.fail=true);await page.locator('[data-buy-cosmetic="blue-swordsman-jacket"]').click();await page.waitForFunction(()=>document.querySelector('.closet-save-status').textContent==='Purchase failed');
 assert.equal(await page.evaluate(()=>fixture.balance),100);
 await page.evaluate(()=>fixture.balance=0);await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await page.waitForFunction(()=>document.querySelector('[data-closet-coins] strong').textContent==='0');
 assert(await page.locator('[data-buy-cosmetic="blue-swordsman-jacket"]').isDisabled());
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'/tmp/closet-free-preview-mobile.png'});
 assert(await page.locator('.expression-closet').evaluate(el=>el.scrollWidth<=el.clientWidth+1));
 page.on('dialog',dialog=>dialog.accept());await page.locator('[data-close-closet]').click();
 assert.equal(await page.evaluate(()=>cosmetics.cosmeticsState().equipped.eddyTop),'cream-cable-knit');
 assert.deepEqual(errors,[]);console.log(`PASS: free visible 3D try-on (${changed} changed pixels), no preview charge, save guard, explicit purchase once, failed purchase, insufficient coins, mobile layout, discard restores saved outfit.`);
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
