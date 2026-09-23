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
 await page.evaluate(async()=>{window.cosmetics=await import('/eddy-cosmetics.mjs?v=20260923-pink-rain-jacket1');await cosmetics.restoreCosmetics();});
 for(const character of ['celeste','phoebe','elsie']){
  await page.evaluate(async character=>{
   document.querySelector('#inventory').replaceChildren();cosmetics.beginCosmeticsPreview();
   const {mountClosetInventory}=await import('/eddy-closet-inventory.mjs?v=20260923-pink-rain-jacket1');
   window.inventoryController?.abort();window.inventoryController=new AbortController();
   mountClosetInventory(document.querySelector('#inventory'),inventoryController.signal,{character});
  },character);
  assert.equal(await page.locator('[data-cosmetic]').count(),1);
  assert.equal(await page.locator('[data-outfit="Winter"]').count(),0);
  {
   await page.locator('[data-cosmetic=cream-sherpa-jacket]').click();
   await page.locator('#closet-outfit-name').fill('Winter');await page.locator('button[type=submit]').click();
   await page.getByRole('status').filter({hasText:'Saved to your account'}).waitFor();
   assert.equal(saved.equipped[character+'Top'],'cream-sherpa-jacket');assert.equal(saved.equipped.top,'blue-swordsman-jacket');
   assert.equal(saved.outfits.filter(x=>x.character===character).length,1);assert.equal(saved.outfits[0].group,undefined);assert.equal(saved.outfits[1].group,'girls');
   await page.locator('[data-favorite=Winter]').click();await page.waitForFunction(()=>cosmetics.cosmeticsState().outfits.some(x=>x.group==='girls'&&x.favorite));
   assert.equal(saved.outfits[0].favorite,undefined);
  }
  assert.equal(await page.locator('[data-cosmetic=cream-sherpa-jacket]').getAttribute('aria-pressed'),'true');
  assert.equal(await page.locator('[data-cosmetic] img').evaluate(e=>e.complete&&e.naturalWidth>0),true);
  await page.evaluate(async character=>{
   const base=new Image();base.src='/assets/speaking-system/mascots/v4/'+character+'-standing.png';await base.decode();
   window.girlBase=base;window.girl=character;cosmetics.cosmeticAtlas(character,base);
  },character);
  await page.waitForFunction(()=>cosmetics.cosmeticAtlas(girl,girlBase)!==girlBase);
  const savedImage=await page.evaluate(()=>cosmetics.cosmeticAtlas(girl,girlBase).toDataURL());
  await page.locator('[data-remove-outfit]').click();
  assert.equal(await page.evaluate(()=>cosmetics.cosmeticAtlas(girl,girlBase).toDataURL()),savedImage);
  assert.equal(await page.evaluate(()=>cosmetics.cosmeticsState().equipped.top),'blue-swordsman-jacket');
  await page.evaluate(()=>cosmetics.discardCosmeticsPreview());
  await page.evaluate(async character=>{
   const THREE=await import('/vendor/three/three.module.js');
   const {MascotCharacters}=await import('/speaking-mascot-characters.mjs?v=20260923-pink-rain-jacket1');
   const system=new MascotCharacters(undefined,undefined,{preview:false});const actor=await system.create(character,'standing');
   for(let i=0;i<100&&actor.mesh.material.uniforms.flowStrength.value!==0;i++)await new Promise(r=>setTimeout(r,20));
   if(actor.mesh.material.uniforms.flowStrength.value!==0)throw Error('Dressed views must stay unwarped');
   const scene=new THREE.Scene();scene.background=new THREE.Color('#292421');scene.add(actor.mesh);
   const camera=new THREE.OrthographicCamera(-1.1,1.1,2.2,0,.1,20);camera.position.set(0,0,5);
   const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(1024,2400);renderer.setScissorTest(true);
   const angles=[0,30,60,75,90,115,145,160,180,210,235,250,270,300,330,350];
   for(let blink=0;blink<2;blink++)for(let i=0;i<16;i++){
    system.update(actor,0,angles[i]*Math.PI/180,0,true,!!blink,0,0);actor.mesh.rotation.y=0;actor.mesh.material.uniforms.blink.value=blink;
    const x=i%4*256,y=(7-(Math.floor(i/4)+blink*4))*300;
    renderer.setViewport(x,y,256,300);renderer.setScissor(x,y,256,300);renderer.render(scene,camera);
   }
   window.fleeceQA={system,renderer};renderer.domElement.id='fleece-turns';document.body.prepend(renderer.domElement);
  },character);
  await page.locator('#fleece-turns').screenshot({path:'/tmp/'+character+'-fleece-3d.png'});
  await page.evaluate(()=>{fleeceQA.system.dispose();fleeceQA.renderer.dispose();document.querySelector('#fleece-turns').remove();inventoryController.abort();document.querySelector('#inventory').replaceChildren();});
  await page.evaluate(async character=>{const {openCompanionCloset}=await import('/common-expression-closet-3d.mjs?v=20260923-pink-rain-jacket1');window.closet=openCompanionCloset({character});},character);
  await page.waitForFunction(()=>document.querySelector('[data-closet-stage] canvas')?.dataset.actorPosition&&document.querySelector('[data-closet-loading]').hidden,null,{timeout:90000});
  assert.match(await page.locator('[data-closet-stage] canvas').getAttribute('aria-label'),new RegExp(character,'i'));
  assert.equal(await page.locator('dialog [data-cosmetic]').count(),1);
  await page.locator('dialog').screenshot({path:'/tmp/'+character+'-fleece-closet.png'});
  await page.locator('dialog [data-cosmetic=cream-sherpa-jacket]').click();
  page.once('dialog',d=>{assert.match(d.message(),/previously saved avatar will remain unchanged/);d.dismiss();});
  await page.locator('[data-close-closet]').click();assert.equal(await page.locator('dialog').count(),1);
  page.once('dialog',d=>d.accept());await page.locator('[data-close-closet]').click();assert.equal(await page.locator('dialog').count(),0);
  assert.equal(await page.evaluate(()=>cosmetics.cosmeticsState().savedEquipment[girl+'Top']),'cream-sherpa-jacket');
  console.log('PASS fitted atlas, blink, closet, inventory, saved/draft:',character);
 }
 await page.reload();await page.evaluate(async()=>{window.cosmetics=await import('/eddy-cosmetics.mjs?v=20260923-pink-rain-jacket1');await cosmetics.restoreCosmetics();});
 assert.deepEqual(await page.evaluate(()=>cosmetics.cosmeticsState().equipped),saved.equipped);
 assert.deepEqual(errors,[]);console.log('PASS shared girls wardrobe with boys outfit preserved');
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
