const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require(process.env.HOME+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const sharp=require(process.env.HOME+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=path.resolve(__dirname,'..'),qa=path.join(root,'tools/mascot-art/wardrobe/all-fish-bucket-race-cap');
const hats=['navy-fish-bucket-hat','ivory-racecar-baseball-cap'];
const characters=['eddy','noir','celeste','phoebe','elsie'];
const mime={'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.bin':'application/octet-stream'};
const server=http.createServer((req,res)=>{
 const p=path.resolve(root,'.'+new URL(req.url,'http://local').pathname);
 if(!p.startsWith(root+'/'))return res.writeHead(403).end();
 fs.readFile(p,(error,body)=>{res.writeHead(error?404:200,{'Content-Type':mime[path.extname(p)]||'application/octet-stream'});res.end(error?'':body);});
});

async function assertHeadwearGeometry(){
 for(const character of characters){
  const widths={};
  for(const hat of hats){
   const {data,info}=await sharp(path.join(root,'assets/speaking-system/cosmetics',character,hat+'.webp')).ensureAlpha().raw().toBuffer({resolveWithObject:true});
   const mask=await sharp(path.join(root,'assets/speaking-system/cosmetics',character,hat+'-hide.webp')).ensureAlpha().raw().toBuffer();
   assert.equal(info.width,1024);assert.equal(info.height,1024);assert.equal(info.channels,4);
   let visible=0;const cellWidths=[];
   for(let cell=0;cell<16;cell++){
    const ox=cell%4*256,oy=Math.floor(cell/4)*256;let minX=256,maxX=-1,minY=256,maxY=-1,pixels=0;
    for(let y=0;y<256;y++)for(let x=0;x<256;x++){
     const i=((oy+y)*1024+ox+x)*4,a=data[i+3],m=mask[i+3];assert.equal(m,a,`${character} ${hat} cell ${cell} hide alpha mismatch`);
     if(a>=24){minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);pixels++;visible++;assert.ok(y<110,`${character} ${hat} cell ${cell} reaches the eye band`);}
    }
    assert.ok(pixels>900,`${character} ${hat} cell ${cell} is too sparse`);assert.ok(minY<55);assert.ok(maxY>45);cellWidths.push(maxX-minX+1);
   }
   assert.ok(visible>24000,`${character} ${hat} atlas is too sparse`);widths[hat]=cellWidths.reduce((a,b)=>a+b,0)/16;
  }
  assert.ok(widths['navy-fish-bucket-hat']>widths['ivory-racecar-baseball-cap']*1.08,character+' bucket brim must remain distinctly wider than the baseball cap');
 }
}

(async()=>{
 await assertHeadwearGeometry();
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1150,height:1100}}),errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/__allhats',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><body style="margin:0;background:#77716c"><div id="inventory"></div></body>'}));
  await page.addInitScript(({hats})=>{
   window.EdmundSystemNav={getStudentSession:()=>({id:'fixture',token:'fixture-token'})};window.EDMUND_SUPABASE={url:'fixture',anonKey:'fixture'};
   const owned=[...hats,'navy-blazer-cream-sweatshirt','ivory-tiered-dress','brown-shearling-lace-boots'];
   window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{}}})},rpc:async method=>({data:method==='eddie_farm_owned_cosmetics'?owned:{equipped:{},outfits:[]}})})};
   window.EddieFarmAPI={student:()=>({token:'fixture-token'}),snapshot:async()=>({balance:100,cosmetics:owned.map(id=>({id,price:40,owned:true}))})};
  },{hats});
  await page.goto('http://127.0.0.1:'+server.address().port+'/__allhats');
  await page.evaluate(async()=>{window.cosmetics=await import('/eddy-cosmetics.mjs?v=20261003-all-hats2');await cosmetics.restoreCosmetics(undefined,{force:true});});
  for(const character of characters){
   await page.evaluate(async character=>{
    window.controller?.abort();window.controller=new AbortController();document.querySelector('#inventory').replaceChildren();cosmetics.clearCosmetics(character);cosmetics.beginCosmeticsPreview();
    const {mountClosetInventory}=await import('/eddy-closet-inventory.mjs?v=20261003-all-hats2');mountClosetInventory(document.querySelector('#inventory'),controller.signal,{character});
    const THREE=await import('/vendor/three/three.module.js'),{MascotCharacters}=await import('/speaking-mascot-characters.mjs?v=20261003-all-hats2');
    const system=new MascotCharacters(undefined,undefined,{preview:true,cosmeticsEnabled:true}),actor=await system.create(character,'standing');
    const scene=new THREE.Scene();scene.background=new THREE.Color('#292421');scene.add(actor.mesh);
    const camera=new THREE.OrthographicCamera(-1.1,1.1,2.2,0,.1,20);camera.position.set(0,0,5);
    const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(1024,1024);renderer.setScissorTest(true);renderer.domElement.id='hat-atlas';document.body.append(renderer.domElement);
    const draw=(blink,background)=>{scene.background.set(background);for(let view=0;view<16;view++){system.update(actor,0,actor.angles[view]*Math.PI/180,0,true,false,0,0);actor.mesh.rotation.y=0;actor.mesh.material.uniforms.blink.value=blink;const row=Math.floor(view/4),col=view%4;renderer.setViewport(col*256,(3-row)*256,256,256);renderer.setScissor(col*256,(3-row)*256,256,256);renderer.render(scene,camera);}};
    window.hatQa={system,actor,renderer,scene,draw};
   },character);
   for(const hat of hats){
    await page.waitForSelector('[data-cosmetic="'+hat+'"]');
    await page.evaluate(({character,hat})=>{cosmetics.clearCosmetics(character);document.querySelector('[data-cosmetic="'+hat+'"]').click();},{character,hat});
    assert.equal(await page.locator('[data-cosmetic="'+hat+'"]').getAttribute('aria-pressed'),'true');
    assert.equal(await page.evaluate(character=>cosmetics.cosmeticsState().equipped[character+'Headwear'],character),hat);
    await page.evaluate(async({character,hat})=>{
     await Promise.all([hat,hat+'-hide'].map(async id=>{const image=new Image();image.src=cosmetics.cosmeticAsset(id,character);await image.decode();}));
     hatQa.actor.cosmeticWardrobe={equipped:{[character+'Headwear']:hat}};
     for(let n=0;n<120;n++){hatQa.system.refreshCosmetics();await new Promise(resolve=>setTimeout(resolve,20));}
     if(hatQa.actor.cosmeticOpen===hatQa.actor.resource.atlas.image)throw Error(character+' '+hat+' did not load');
     if(hatQa.actor.mesh.material.uniforms.flowStrength.value!==0)throw Error(character+' '+hat+' used bare-body optical flow');
     if(hatQa.actor.mesh.material.uniforms.hasWardrobeMask.value!==1)throw Error(character+' '+hat+' wardrobe colour mask is inactive');
     hatQa.draw(0,'#292421');
    },{character,hat});
    await page.locator('#hat-atlas').screenshot({path:path.join(qa,`qa-${character}-${hat}-3d-dark-open.jpg`),type:'jpeg',quality:95});
    await page.evaluate(()=>hatQa.draw(1,'#77716c'));
    await page.locator('#hat-atlas').screenshot({path:path.join(qa,`qa-${character}-${hat}-3d-mid-blink.jpg`),type:'jpeg',quality:95});
    await page.evaluate(()=>hatQa.draw(0,'#eee9df'));
    await page.locator('#hat-atlas').screenshot({path:path.join(qa,`qa-${character}-${hat}-3d-light-open.jpg`),type:'jpeg',quality:95});
    await page.evaluate(async({character,hat})=>{
     const isBoy=['eddy','noir'].includes(character),garment=isBoy?'navy-blazer-cream-sweatshirt':'ivory-tiered-dress',slot=isBoy?'Top':'FullBody';
     await Promise.all([garment,'brown-shearling-lace-boots'].map(async id=>{const image=new Image();image.src=cosmetics.cosmeticAsset(id,character);await image.decode();}));
     const previous=hatQa.actor.cosmeticOpen;hatQa.actor.cosmeticWardrobe={equipped:{[character+'Headwear']:hat,[character+slot]:garment,[character+'Feet']:'brown-shearling-lace-boots'}};
     for(let n=0;n<120;n++){hatQa.system.refreshCosmetics();await new Promise(resolve=>setTimeout(resolve,20));}
     if(hatQa.actor.cosmeticOpen===previous||hatQa.actor.cosmeticOpen===hatQa.actor.resource.atlas.image)throw Error(character+' '+hat+' combination did not load');
     hatQa.draw(0,'#77716c');
    },{character,hat});
    await page.locator('#hat-atlas').screenshot({path:path.join(qa,`qa-${character}-${hat}-combination-3d-open.jpg`),type:'jpeg',quality:95});
    await page.evaluate(()=>hatQa.draw(1,'#77716c'));
    await page.locator('#hat-atlas').screenshot({path:path.join(qa,`qa-${character}-${hat}-combination-3d-blink.jpg`),type:'jpeg',quality:95});
   }
   await page.evaluate(()=>{hatQa.system.dispose();hatQa.renderer.dispose();document.querySelector('#hat-atlas').remove();delete window.hatQa;});
  }
  assert.deepEqual(errors,[]);
  console.log('MECHANICAL PASS two all-character hats: distinct bucket/baseball silhouettes, ten independent fits, exact hide masks, actual 3D renderer, 160 directions, open/blink, light/dark/midtone backgrounds, high-risk clothing plus boots combinations, optical-flow disable and wardrobe-colour mask.');
 }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;server.close();});
