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
 await page.evaluate(async()=>{window.cosmetics=await import('/eddy-cosmetics.mjs?v=20261002-ivory-facefix1');await cosmetics.restoreCosmetics(undefined,{force:true});});
 const savedCoats=[];
 for(const character of ['celeste','phoebe','elsie']){
  await page.evaluate(async character=>{window.controller?.abort();window.controller=new AbortController();document.querySelector('#inventory').replaceChildren();cosmetics.beginCosmeticsPreview();const {mountClosetInventory}=await import('/eddy-closet-inventory.mjs?v=20261002-ivory-facefix1');mountClosetInventory(document.querySelector('#inventory'),controller.signal,{character});},character);
  await page.waitForSelector('[data-cosmetic=ivory-tiered-dress]');assert.equal(await page.locator('[data-cosmetic]').count(),4);
  await page.locator('[data-cosmetic=ivory-tiered-dress]').click();
  const state=await page.evaluate(character=>cosmetics.cosmeticsState().equipped,character);
  assert.equal(state[character+'FullBody'],'ivory-tiered-dress');assert.equal(state[character+'Top'],undefined);
  await page.evaluate(async character=>{const base=new Image();base.src='/assets/speaking-system/mascots/v4/'+character+'-standing.png';await base.decode();window.base=base;window.character=character;cosmetics.cosmeticAtlas(character,base,{preview:true});},character);
  await page.waitForFunction(()=>cosmetics.cosmeticAtlas(character,base,{preview:true})!==base);
  const painted=await page.evaluate(()=>{const atlas=cosmetics.cosmeticAtlas(character,base,{preview:true}),ctx=document.querySelector('#qa').getContext('2d');ctx.clearRect(0,0,1024,1024);ctx.drawImage(atlas,0,0);return ctx.getImageData(0,0,1024,1024).data.some((x,i)=>i%4===3&&x>0);});assert.equal(painted,true);
  if(character==='celeste'){
   const faceSafe=await page.evaluate(()=>{const atlas=cosmetics.cosmeticAtlas(character,base,{preview:true}),a=document.createElement('canvas'),b=document.createElement('canvas');a.width=b.width=1024;a.height=b.height=1024;const ac=a.getContext('2d'),bc=b.getContext('2d');ac.drawImage(base,0,0);bc.drawImage(atlas,0,0);const original=ac.getImageData(0,0,1024,1024).data,dressed=bc.getImageData(0,0,1024,1024).data;let mismatches=0;for(let cell=0;cell<16;cell++){const ox=cell%4*256,oy=Math.floor(cell/4)*256;for(let y=0;y<120;y++)for(let x=0;x<256;x++){const i=((oy+y)*1024+ox+x)*4;if(original[i+3]>72&&(Math.abs(original[i]-dressed[i])>1||Math.abs(original[i+1]-dressed[i+1])>1||Math.abs(original[i+2]-dressed[i+2])>1||Math.abs(original[i+3]-dressed[i+3])>1))mismatches++;}}return mismatches===0;});assert.equal(faceSafe,true,'Celeste dress must not repaint any opaque head pixel in any direction');
  }
  await page.locator('[data-save-avatar]').click();await page.getByText(/Saved to your account/).waitFor();assert.equal(saved.equipped[character+'FullBody'],undefined);assert.equal(saved.equipped[character+'Top'],undefined);savedCoats.push(character);const persisted=await page.evaluate(()=>cosmetics.cosmeticsState().savedEquipment);for(const savedCharacter of savedCoats)assert.equal(persisted[savedCharacter+'FullBody'],'ivory-tiered-dress');
  await page.locator('[data-cosmetic=camel-coat-dress]').click();const switched=await page.evaluate(character=>cosmetics.cosmeticsState().equipped,character);assert.equal(switched[character+'FullBody'],'camel-coat-dress');
  await page.locator('[data-cosmetic=cream-sherpa-jacket]').click();const changed=await page.evaluate(character=>cosmetics.cosmeticsState().equipped,character);assert.equal(changed[character+'FullBody'],undefined);assert.equal(changed[character+'Top'],'cream-sherpa-jacket');
 }
 assert.deepEqual(errors,[]);console.log('PASS included full-body dresses: inventory, exclusivity, persistence and renderer for all three characters');
}finally{await browser.close();server.close();}})().catch(error=>{console.error(error);process.exitCode=1;server.close();});
