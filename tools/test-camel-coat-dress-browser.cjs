const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const {chromium}=require(process.env.HOME+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..'),mime={'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp'};
const server=http.createServer((req,res)=>{const p=path.resolve(root,'.'+new URL(req.url,'http://local').pathname);if(!p.startsWith(root+'/'))return res.writeHead(403).end();fs.readFile(p,(e,b)=>{res.writeHead(e?404:200,{'Content-Type':mime[path.extname(p)]||'application/octet-stream'});res.end(e?'':b);});});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true});try{
 const origin='http://127.0.0.1:'+server.address().port,page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/__camel',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><link rel="stylesheet" href="/common-expression-map.css"><div id="inventory"></div><canvas id="qa" width="1024" height="1024"></canvas>'}));
 let saved={equipped:{celesteTop:'pink-rain-jacket',phoebeTop:'cream-sherpa-jacket',elsieTop:'pink-rain-jacket'},outfits:[]};
 await page.exposeFunction('closetRpc',(method,args)=>{
  if(method==='eddie_farm_owned_cosmetics')return ['cream-sherpa-jacket','pink-rain-jacket'];
  if(method==='character_closet_sync')return require('./wardrobe-fixture.cjs')(saved,args);
  return saved;
 });
 await page.addInitScript(()=>{
  window.EdmundSystemNav={getStudentSession:()=>({id:'fixture',token:'fixture-token'})};window.EDMUND_SUPABASE={url:'fixture',anonKey:'fixture'};
  window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{}}})},rpc:async(method,args)=>({data:await window.closetRpc(method,args)})})};
  window.EddieFarmAPI={student:()=>({token:'fixture-token'}),snapshot:async()=>({balance:100,cosmetics:['cream-sherpa-jacket','pink-rain-jacket'].map(id=>({id,price:35,owned:true}))})};
 });
 await page.goto(origin+'/__camel');
 await page.evaluate(async()=>{window.cosmetics=await import('/eddy-cosmetics.mjs?v=20261001-camel-coat2');await cosmetics.restoreCosmetics(undefined,{force:true});});
 const savedCoats=[];
 for(const character of ['celeste','phoebe','elsie']){
  await page.evaluate(async character=>{window.controller?.abort();window.controller=new AbortController();document.querySelector('#inventory').replaceChildren();cosmetics.beginCosmeticsPreview();const {mountClosetInventory}=await import('/eddy-closet-inventory.mjs?v=20261001-camel-coat2');mountClosetInventory(document.querySelector('#inventory'),controller.signal,{character});},character);
  await page.waitForSelector('[data-cosmetic=camel-coat-dress]');assert.equal(await page.locator('[data-cosmetic]').count(),3);
  await page.locator('[data-cosmetic=camel-coat-dress]').click();
  const state=await page.evaluate(character=>cosmetics.cosmeticsState().equipped,character);
  assert.equal(state[character+'FullBody'],'camel-coat-dress');assert.equal(state[character+'Top'],undefined);
  await page.evaluate(async character=>{const base=new Image();base.src='/assets/speaking-system/mascots/v4/'+character+'-standing.png';await base.decode();window.base=base;window.character=character;cosmetics.cosmeticAtlas(character,base,{preview:true});},character);
  await page.waitForFunction(()=>cosmetics.cosmeticAtlas(character,base,{preview:true})!==base);
  const painted=await page.evaluate(()=>{const atlas=cosmetics.cosmeticAtlas(character,base,{preview:true}),ctx=document.querySelector('#qa').getContext('2d');ctx.clearRect(0,0,1024,1024);ctx.drawImage(atlas,0,0);return ctx.getImageData(0,0,1024,1024).data.some((x,i)=>i%4===3&&x>0);});assert.equal(painted,true);
  await page.locator('[data-save-avatar]').click();await page.getByText(/Saved to your account/).waitFor();assert.equal(saved.equipped[character+'FullBody'],undefined);assert.equal(saved.equipped[character+'Top'],undefined);savedCoats.push(character);const persisted=await page.evaluate(()=>cosmetics.cosmeticsState().savedEquipment);for(const savedCharacter of savedCoats)assert.equal(persisted[savedCharacter+'FullBody'],'camel-coat-dress');
  await page.locator('[data-cosmetic=cream-sherpa-jacket]').click();const changed=await page.evaluate(character=>cosmetics.cosmeticsState().equipped,character);assert.equal(changed[character+'FullBody'],undefined);assert.equal(changed[character+'Top'],'cream-sherpa-jacket');
 }
 assert.deepEqual(errors,[]);console.log('PASS camel coat dress inventory, exclusivity, persistence and renderer for all three characters');
}finally{await browser.close();server.close();}})().catch(error=>{console.error(error);process.exitCode=1;server.close();});
