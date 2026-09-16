const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const {chromium}=require(process.env.HOME+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..'),mime={'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp'};
const server=http.createServer((req,res)=>{const p=path.resolve(root,'.'+new URL(req.url,'http://local').pathname);if(!p.startsWith(root+'/'))return res.writeHead(403).end();fs.readFile(p,(e,b)=>{res.writeHead(e?404:200,{'Content-Type':mime[path.extname(p)]||'application/octet-stream'});res.end(e?'':b);});});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port,browser=await chromium.launch({headless:true});try{
 const page=await browser.newPage({viewport:{width:1400,height:1050},hasTouch:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('https://**/*',r=>r.abort());
 await page.route('**/__outfits',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><link rel="stylesheet" href="/common-expression-map.css"><style>body{background:#e4dfcd}canvas.gallery{width:800px;height:800px}</style><div id="inventory"></div>'}));
 let saved={equipped:{headwear:'white-fedora',top:'blue-swordsman-jacket'},outfits:[{name:'Winter',equipped:{headwear:'white-fedora',top:'blue-swordsman-jacket'}}]};await page.exposeFunction('saveFixture',args=>{if(args.p_token!=='fixture-token')return {equipped:{},outfits:[]};return require('./wardrobe-fixture.cjs')(saved,args);});
 await page.addInitScript(()=>{
  window.EdmundSystemNav={getStudentSession:()=>({id:'fixture-a',token:'fixture-token'})};
  window.EDMUND_SUPABASE={url:'https://fixture.invalid',anonKey:'fixture'};
  window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{user:{id:'fixture'}}}})},rpc:async(n,args)=>({data:await window.saveFixture(args)})})};
 });

 await page.goto(origin+'/__outfits');
 async function mount(character){await page.evaluate(async character=>{
  window.cosmetics=await import('/eddy-cosmetics.mjs?v=20260916-girls-individual1');await cosmetics.restoreCosmetics();
  window.controller?.abort();window.controller=new AbortController();cosmetics.beginCosmeticsPreview();
  const {mountClosetInventory}=await import('/eddy-closet-inventory.mjs?v=20260916-girls-individual1');
  mountClosetInventory(document.querySelector('#inventory'),controller.signal,{character});
 },character);}
 async function save(){await page.locator('[data-save-avatar]').click();await page.getByRole('status').filter({hasText:'Saved to your account'}).waitFor();}
 await mount('elsie');await page.locator('[data-cosmetic=cream-sherpa-jacket]').click();
 await page.locator('#closet-outfit-name').fill('Winter');await page.locator('button[type=submit]').click();await page.getByRole('status').filter({hasText:'Saved to your account'}).waitFor();
 assert.deepEqual(saved.equipped,{headwear:'white-fedora',top:'blue-swordsman-jacket',elsieTop:'cream-sherpa-jacket'});
 for(const character of ['phoebe','celeste']){
  await mount(character);assert.equal(await page.locator('[data-cosmetic]').getAttribute('aria-pressed'),'false');
  assert.equal(await page.locator('[data-outfit=Winter]').count(),0);
  await page.evaluate(async character=>{const base=new Image();base.src='/assets/speaking-system/mascots/v4/'+character+'-standing.png';await base.decode();if(cosmetics.cosmeticAtlas(character,base)!==base)throw Error(character+' inherited Elsie outfit');},character);
 }
 await mount('phoebe');await page.locator('[data-cosmetic]').click();
 await page.locator('#closet-outfit-name').fill('Winter');await page.locator('button[type=submit]').click();await page.getByRole('status').filter({hasText:'Saved to your account'}).waitFor();
 assert.equal(saved.equipped.elsieTop,'cream-sherpa-jacket');assert.equal(saved.equipped.phoebeTop,'cream-sherpa-jacket');assert.equal(saved.equipped.celesteTop,undefined);
 await page.locator('[data-favorite=Winter]').click();await page.waitForFunction(()=>cosmetics.cosmeticsState().outfits.some(x=>x.character==='phoebe'&&x.favorite));
 assert.equal(saved.outfits.find(x=>x.character==='elsie').favorite,undefined);
 await mount('elsie');await page.locator('[data-remove-outfit]').click();await save();
 assert.equal(saved.equipped.elsieTop,undefined);assert.equal(saved.equipped.phoebeTop,'cream-sherpa-jacket');assert.equal(saved.equipped.top,'blue-swordsman-jacket');
 await page.reload();await mount('elsie');assert.equal(await page.locator('[data-cosmetic]').getAttribute('aria-pressed'),'false');
 await page.locator('[data-outfit=Winter]').click();await page.getByRole('status').filter({hasText:'Saved to your account'}).waitFor();
 assert.equal(saved.equipped.elsieTop,'cream-sherpa-jacket');assert.equal(saved.equipped.phoebeTop,'cream-sherpa-jacket');assert.equal(saved.equipped.celesteTop,undefined);
 await page.evaluate(async()=>{controller.abort();document.querySelector('#inventory').replaceChildren();cosmetics.discardCosmeticsPreview();const {openCompanionCloset}=await import('/common-expression-closet-3d.mjs?v=20260916-girls-individual1');window.closet=openCompanionCloset({character:'celeste'});});
 await page.waitForFunction(()=>document.querySelector('[data-closet-stage] canvas')?.dataset.actorPosition&&document.querySelector('[data-closet-loading]').hidden,null,{timeout:90000});
 assert.equal(await page.locator('dialog [data-cosmetic]').getAttribute('aria-pressed'),'false');
 await page.locator('dialog [data-cosmetic]').click();
 page.once('dialog',d=>d.accept());await page.locator('[data-close-closet]').click();
 assert.equal(saved.equipped.celesteTop,undefined);assert.equal(await page.evaluate(()=>cosmetics.cosmeticsState().equipped.celesteTop),undefined);
 assert.deepEqual(errors,[]);console.log('PASS: item available to all girls; independent equip, save, reload, remove, named sets, favorites, real closet and discard; boys unchanged');
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
