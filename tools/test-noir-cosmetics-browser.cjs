const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const {chromium}=require(process.env.HOME+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..'),mime={'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp'};
const server=http.createServer((req,res)=>{const p=path.resolve(root,'.'+new URL(req.url,'http://local').pathname);if(!p.startsWith(root+'/'))return res.writeHead(403).end();fs.readFile(p,(e,b)=>{res.writeHead(e?404:200,{'Content-Type':mime[path.extname(p)]||'application/octet-stream'});res.end(e?'':b);});});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port,browser=await chromium.launch({headless:true});try{
 const page=await browser.newPage({viewport:{width:1400,height:1050},hasTouch:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('https://**/*',r=>r.abort());
 await page.route('**/__outfits',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><link rel="stylesheet" href="/common-expression-map.css"><style>body{background:#e4dfcd}canvas.gallery{width:800px;height:800px}</style><div id="inventory"></div>'}));
 let saved={equipped:{},outfits:[]};await page.exposeFunction('saveFixture',args=>{if(args.p_token!=='fixture-token')return {equipped:{},outfits:[]};if(args.p_equipped)saved.equipped=args.p_equipped;if(args.p_outfits)saved.outfits=args.p_outfits;return saved;});
 await page.addInitScript(()=>{
  window.EdmundSystemNav={getStudentSession:()=>({id:'fixture-a',token:'fixture-token'})};
  window.EDMUND_SUPABASE={url:'https://fixture.invalid',anonKey:'fixture'};
  window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{user:{id:'fixture'}}}})},rpc:async(n,args)=>({data:await window.saveFixture(args)})})};
 });
 await page.goto(origin+'/__outfits');
 await page.evaluate(async()=>{
  window.cosmetics=await import('/eddy-cosmetics.mjs?v=20260916-girls-fleece1');await cosmetics.restoreCosmetics();
  window.base=new Image();base.src='/assets/speaking-system/mascots/v4/noir-standing.png';await base.decode();
  const {mountClosetInventory}=await import('/eddy-closet-inventory.mjs?v=20260916-girls-fleece1');mountClosetInventory(document.querySelector('#inventory'),new AbortController().signal);
 });
 await page.locator('[data-cosmetic=white-fedora]').click();await page.locator('[data-cosmetic=cream-cable-knit]').click();
 assert.equal(await page.locator('[data-cosmetic][aria-pressed=true]').count(),2);
 await page.locator('#closet-outfit-name').fill('Cream + fedora');await page.locator('button[type=submit]').click();await page.getByRole('status').filter({hasText:'Saved to your account'}).waitFor();
 assert.deepEqual(saved.equipped,{headwear:'white-fedora',top:'cream-cable-knit'});
 await page.evaluate(()=>cosmetics.cosmeticAtlas('noir',base,{preview:true}));await page.waitForFunction(()=>cosmetics.cosmeticAtlas('noir',base,{preview:true})!==base);
 await page.evaluate(()=>{const c=cosmetics.cosmeticAtlas('noir',base,{preview:true});c.className='gallery';document.body.prepend(c);});
 await page.locator('canvas.gallery').screenshot({path:'/tmp/noir-cream-fedora.png'});
 assert.equal(await page.evaluate(()=>cosmetics.cosmeticAtlas('noir',base,{preview:true})===cosmetics.cosmeticAtlas('noir',base,{preview:true})),true);
 assert.equal(await page.evaluate(()=>cosmetics.cosmeticAtlas('phoebe',base)===base),true);
 await page.locator('[data-cosmetic=charcoal-turtleneck]').click();
 assert.equal(await page.locator('[data-cosmetic=cream-cable-knit]').getAttribute('aria-pressed'),'false');
 assert.equal(await page.locator('[data-cosmetic=white-fedora]').getAttribute('aria-pressed'),'true');
 await page.evaluate(()=>cosmetics.cosmeticAtlas('noir',base,{preview:true}));await page.waitForFunction(()=>cosmetics.cosmeticAtlas('noir',base,{preview:true})!==base);
 await page.evaluate(()=>{document.querySelector('canvas.gallery').remove();const c=cosmetics.cosmeticAtlas('noir',base,{preview:true});c.className='gallery';document.body.prepend(c);});
 await page.locator('canvas.gallery').screenshot({path:'/tmp/noir-charcoal-fedora.png'});
 await page.locator('[data-cosmetic=blue-swordsman-jacket]').click();
 assert.equal(await page.locator('[data-cosmetic=charcoal-turtleneck]').getAttribute('aria-pressed'),'false');
 assert.equal(await page.locator('[data-cosmetic=white-fedora]').getAttribute('aria-pressed'),'true');
 await page.evaluate(()=>cosmetics.cosmeticAtlas('noir',base,{preview:true}));await page.waitForFunction(()=>cosmetics.cosmeticAtlas('noir',base,{preview:true})!==base);
 await page.evaluate(()=>{document.querySelector('canvas.gallery').remove();const c=cosmetics.cosmeticAtlas('noir',base,{preview:true});c.className='gallery';document.body.prepend(c);});
 await page.locator('canvas.gallery').screenshot({path:'/tmp/noir-jacket-fedora.png'});
 await page.locator('[data-cosmetic=white-fedora]').click();
 await page.evaluate(()=>{document.querySelector('canvas.gallery').remove();const c=cosmetics.cosmeticAtlas('noir',base,{preview:true});c.className='gallery';document.body.prepend(c);});
 await page.locator('canvas.gallery').screenshot({path:'/tmp/noir-jacket-alone.png'});
 assert.equal(await page.evaluate(()=>cosmetics.cosmeticAtlas('elsie',base)===base),true);
 await page.locator('[data-cosmetic=white-fedora]').click();
 await page.locator('#closet-outfit-name').fill('Swordsman');await page.locator('button[type=submit]').click();
 await page.getByRole('status').filter({hasText:'Saved to your account'}).waitFor();
 assert.deepEqual(saved.equipped,{headwear:'white-fedora',top:'blue-swordsman-jacket'});
 await page.getByRole('button',{name:'Favorite Swordsman',exact:true}).click();await page.waitForFunction(()=>cosmetics.cosmeticsState().outfits.find(x=>x.name==='Swordsman').favorite===true);assert.equal(saved.outfits.find(x=>x.name==='Swordsman').favorite,true);
 await page.locator('[data-remove-outfit]').click();assert.equal(await page.locator('[data-cosmetic][aria-pressed=true]').count(),0);
 await page.locator('[data-outfit]').filter({hasText:'Cream + fedora'}).click();await page.getByRole('status').filter({hasText:'Saved to your account'}).waitFor();assert.equal(await page.locator('[data-cosmetic][aria-pressed=true]').count(),2);
 await page.reload();await page.evaluate(async()=>{window.cosmetics=await import('/eddy-cosmetics.mjs?v=20260916-girls-fleece1');await cosmetics.restoreCosmetics();});assert.deepEqual(await page.evaluate(()=>cosmetics.cosmeticsState().equipped),saved.equipped);
 assert.equal(await page.evaluate(()=>cosmetics.cosmeticsState().outfits.find(x=>x.name==='Swordsman').favorite),true);
 await page.evaluate(()=>cosmetics.equipOutfit('Swordsman'));
 await page.evaluate(async()=>{
  const THREE=await import('/vendor/three/three.module.js');
  const {MascotCharacters}=await import('/speaking-mascot-characters.mjs?v=20260916-girls-fleece1');
  const system=new MascotCharacters(undefined,undefined,{preview:true});const actor=await system.create('noir','standing');
  for(const name of ['elsie','phoebe']){
   const companion=await system.create(name,'standing');
   if(!companion.resource.atlas.image.naturalWidth||!companion.resource.blink.image.naturalWidth)throw Error(name+' open/blink artwork did not load');
  }
  for(let i=0;i<100&&actor.mesh.material.uniforms.flowStrength.value!==0;i++)await new Promise(r=>setTimeout(r,20));
  if(actor.mesh.material.uniforms.flowStrength.value!==0)throw Error('Equipped outfit must not use bare-body optical flow');
  const scene=new THREE.Scene();scene.background=new THREE.Color('#292421');scene.add(actor.mesh);
  const camera=new THREE.OrthographicCamera(-1.1,1.1,2.2,0,.1,20);camera.position.set(0,0,5);
  const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(1024,600);renderer.setScissorTest(true);
  const angles=[0,60,90,180];
  for(let row=0;row<2;row++){
   cosmetics.equipCosmetic('white-fedora');
   for(let col=0;col<4;col++){
    system.update(actor,0,angles[col]*Math.PI/180,0,true,false,0,0);actor.mesh.rotation.y=0;
    if(actor.mesh.material.uniforms.flowStrength.value!==0)throw Error('Jacket must retain unwarped views with and without hat');
    renderer.setViewport(col*256,(1-row)*300,256,300);renderer.setScissor(col*256,(1-row)*300,256,300);renderer.render(scene,camera);
   }
  }
  renderer.domElement.id='turn-comparison';document.body.prepend(renderer.domElement);
  window.turnQA={system,renderer};
 });
 await page.locator('#turn-comparison').screenshot({path:'/tmp/noir-turn-comparison.png'});
 await page.evaluate(()=>{turnQA.system.dispose();turnQA.renderer.dispose();document.querySelector('#turn-comparison').remove();});
 await page.evaluate(async()=>{const {openCompanionCloset}=await import('/common-expression-closet-3d.mjs');window.closet=openCompanionCloset({character:'noir'});});
 await page.waitForFunction(()=>document.querySelector('[data-closet-stage] canvas')?.dataset.actorPosition,{timeout:60000});
 await page.waitForFunction(()=>document.querySelector('[data-closet-loading]').hidden);
 const savedLook=await page.evaluate(()=>cosmetics.cosmeticsState().savedEquipment);
 await page.locator('dialog [data-cosmetic=cream-cable-knit]').click();
 assert.deepEqual(await page.evaluate(()=>cosmetics.cosmeticsState().savedEquipment),savedLook);
 assert.equal(await page.evaluate(()=>cosmetics.cosmeticsState().dirty),true);
 page.once('dialog',d=>{assert.match(d.message(),/previously saved avatar will remain unchanged/);d.dismiss();});
 await page.locator('[data-close-closet]').click();assert.equal(await page.locator('dialog').count(),1);
 page.once('dialog',d=>d.accept());await page.locator('[data-close-closet]').click();
 assert.equal(await page.locator('dialog').count(),0);
 assert.deepEqual(await page.evaluate(()=>cosmetics.cosmeticsState().equipped),savedLook);
 assert.equal(await page.evaluate(()=>cosmetics.cosmeticsState().dirty),false);
 await page.evaluate(async()=>{const {openCompanionCloset}=await import('/common-expression-closet-3d.mjs');window.closet=openCompanionCloset({character:'noir'});});
 await page.waitForFunction(()=>document.querySelector('[data-closet-stage] canvas')?.dataset.actorPosition&&document.querySelector('[data-closet-loading]').hidden);

 const canvas=page.locator('[data-closet-stage] canvas');
 const before=await canvas.getAttribute('data-actor-position');
 const rect=await canvas.boundingBox();
 await page.touchscreen.tap(rect.x+rect.width*.25,rect.y+rect.height*.70);

 await page.waitForFunction(previous=>document.querySelector('[data-closet-stage] canvas').dataset.actorPosition!==previous,before,{timeout:10000});
 await page.waitForFunction(()=>{const c=document.querySelector('[data-closet-stage] canvas'),a=c.dataset.actorPosition.split(',').map(Number),b=c.dataset.walkDestination.split(',').map(Number);return Math.hypot(a[0]-b[0],a[1]-b[1])<.15;},{timeout:15000});
 await page.locator('dialog').screenshot({path:'/tmp/noir-closet-outfit.png'});
 await page.locator('dialog').screenshot({path:'/tmp/noir-jacket-closet.png'});
 await page.setViewportSize({width:390,height:844});
 await page.locator('[data-save-avatar]').scrollIntoViewIfNeeded();
 assert.equal(await page.locator('[data-save-avatar]').isVisible(),true);
 assert.equal(await page.locator('dialog').evaluate(e=>e.scrollWidth<=e.clientWidth+2),true,'Mobile closet has no horizontal overflow');
 await page.locator('dialog').screenshot({path:'/tmp/noir-closet-mobile.png'});
 await page.evaluate(()=>closet.close());
 for(const character of ['elsie','phoebe']){
  await page.evaluate(async character=>{const {openCompanionCloset}=await import('/common-expression-closet-3d.mjs');window.closet=openCompanionCloset({character});},character);
  await page.waitForFunction(()=>document.querySelector('[data-closet-stage] canvas')?.dataset.actorPosition&&document.querySelector('[data-closet-loading]').hidden,{timeout:60000});
  assert.equal(await page.locator('dialog').evaluate(e=>e.scrollWidth<=e.clientWidth+2),true);await page.evaluate(()=>closet.close());
 }
 await page.evaluate(async()=>{window.EdmundSystemNav.getStudentSession=()=>({id:'fixture-b',token:'other-token'});await cosmetics.restoreCosmetics();});assert.deepEqual(await page.evaluate(()=>cosmetics.cosmeticsState().equipped),{});
 assert.deepEqual(errors,[]);console.log('Noir PASS: slots, combined atlas caching, equipped state, named sets, save/reload, 3D closet and account isolation');
 }finally{await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
