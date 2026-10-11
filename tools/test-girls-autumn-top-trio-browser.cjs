const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require(process.env.HOME+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const sharp=require(process.env.HOME+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=path.resolve(__dirname,'..'),qa=path.join(root,'tools/mascot-art/wardrobe/girls-autumn-top-trio');
const characters=['celeste','phoebe','elsie'];
const garments=['ivory-bow-neck-blouse','brown-zip-front-jacket','dusty-rose-oversized-sweatshirt'];
const mime={'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.bin':'application/octet-stream'};
const server=http.createServer((req,res)=>{
 const p=path.resolve(root,'.'+new URL(req.url,'http://local').pathname);
 if(!p.startsWith(root+'/'))return res.writeHead(403).end();
 fs.readFile(p,(error,body)=>{res.writeHead(error?404:200,{'Content-Type':mime[path.extname(p)]||'application/octet-stream'});res.end(error?'':body);});
});

async function assertOverlayBounds(){
 for(const character of characters)for(const garment of garments){
  const {data,info}=await sharp(path.join(root,'assets/speaking-system/cosmetics',character,garment+'.webp')).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  assert.equal(info.width,1024);assert.equal(info.height,1024);assert.equal(info.channels,4);
  let visible=0,feetBand=0;
  for(let cell=0;cell<16;cell++){
   const ox=cell%4*256,oy=Math.floor(cell/4)*256;
   for(let y=0;y<256;y++)for(let x=0;x<256;x++){
    const alpha=data[((oy+y)*1024+ox+x)*4+3];if(alpha>=24){visible++;if(y>=214)feetBand++;}
   }
  }
  assert.ok(visible>20000,character+' '+garment+' overlay is too sparse');
  assert.equal(feetBand,0,character+' '+garment+' leaked into the lower-body/feet band');
 }
}

(async()=>{
 await assertOverlayBounds();
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1150,height:1100}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/__autumn',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><body style="margin:0;background:#77716c"><div id="inventory"></div></body>'}));
  await page.addInitScript(garments=>{
   window.EdmundSystemNav={getStudentSession:()=>({id:'fixture',token:'fixture-token'})};
   window.EDMUND_SUPABASE={url:'fixture',anonKey:'fixture'};
   const owned=[...garments,'ivory-racecar-baseball-cap','brown-shearling-lace-boots','ivory-tiered-dress'];
   window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{}}})},rpc:async method=>({data:method==='eddie_farm_owned_cosmetics'?owned:{equipped:{},outfits:[]}})})};
   window.EddieFarmAPI={student:()=>({token:'fixture-token'}),snapshot:async()=>({balance:100,cosmetics:owned.map(id=>({id,price:35,owned:true}))})};
  },garments);
  await page.goto('http://127.0.0.1:'+server.address().port+'/__autumn');
  await page.evaluate(async()=>{window.cosmetics=await import('/eddy-cosmetics.mjs?v=20261011-girls-autumn-trio1');await cosmetics.restoreCosmetics(undefined,{force:true});});

  for(const character of characters){
   await page.evaluate(async character=>{
    window.controller?.abort();window.controller=new AbortController();document.querySelector('#inventory').replaceChildren();
    cosmetics.clearCosmetics(character);cosmetics.beginCosmeticsPreview();
    const {mountClosetInventory}=await import('/eddy-closet-inventory.mjs?v=20261011-girls-autumn-trio1');
    mountClosetInventory(document.querySelector('#inventory'),controller.signal,{character});
    const THREE=await import('/vendor/three/three.module.js');
    const {MascotCharacters}=await import('/speaking-mascot-characters.mjs?v=20261011-girls-autumn-trio1');
    const system=new MascotCharacters(undefined,undefined,{preview:true,cosmeticsEnabled:true});
    const actor=await system.create(character,'standing');
    const scene=new THREE.Scene();scene.background=new THREE.Color('#292421');scene.add(actor.mesh);
    const camera=new THREE.OrthographicCamera(-1.1,1.1,2.2,0,.1,20);camera.position.set(0,0,5);
    const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(1024,1024);renderer.setScissorTest(true);renderer.domElement.id='autumn-atlas';document.body.append(renderer.domElement);
    const draw=(blink,background)=>{scene.background.set(background);for(let view=0;view<16;view++){system.update(actor,0,actor.angles[view]*Math.PI/180,0,true,false,0,0);actor.mesh.rotation.y=0;actor.mesh.material.uniforms.blink.value=blink;const row=Math.floor(view/4),col=view%4;renderer.setViewport(col*256,(3-row)*256,256,256);renderer.setScissor(col*256,(3-row)*256,256,256);renderer.render(scene,camera);}};
    window.autumnQa={system,actor,renderer,scene,draw};
   },character);

   for(const garment of garments){
    await page.waitForSelector('[data-cosmetic="'+garment+'"]');
    await page.locator('[data-cosmetic="'+garment+'"]').click();
    assert.equal(await page.locator('[data-cosmetic="'+garment+'"]').getAttribute('aria-pressed'),'true');
    assert.equal(await page.evaluate(character=>cosmetics.cosmeticsState().equipped[character+'Top'],character),garment);
    await page.locator('[data-cosmetic="ivory-tiered-dress"]').click();
    assert.equal(await page.evaluate(character=>cosmetics.cosmeticsState().equipped[character+'Top']||null,character),null);
    assert.equal(await page.evaluate(character=>cosmetics.cosmeticsState().equipped[character+'FullBody'],character),'ivory-tiered-dress');
    await page.locator('[data-cosmetic="'+garment+'"]').click();
    assert.equal(await page.evaluate(character=>cosmetics.cosmeticsState().equipped[character+'FullBody']||null,character),null);

    await page.evaluate(async({character,garment})=>{
     const image=new Image();image.src=cosmetics.cosmeticAsset(garment,character);await image.decode();
     autumnQa.actor.cosmeticWardrobe={equipped:{[character+'Top']:garment}};
     for(let n=0;n<120;n++){autumnQa.system.refreshCosmetics();await new Promise(resolve=>setTimeout(resolve,20));}
     if(autumnQa.actor.cosmeticOpen===autumnQa.actor.resource.atlas.image)throw Error(character+' '+garment+' top did not load');
     if(autumnQa.actor.mesh.material.uniforms.flowStrength.value!==0)throw Error(character+' '+garment+' used bare-body optical flow');
     if(autumnQa.actor.mesh.material.uniforms.hasWardrobeMask.value!==1)throw Error(character+' '+garment+' garment colour mask is inactive');
     autumnQa.draw(0,'#292421');
    },{character,garment});
    await page.locator('#autumn-atlas').screenshot({path:path.join(qa,'qa-'+character+'-'+garment+'-3d-dark-open.jpg'),type:'jpeg',quality:95});
    await page.evaluate(()=>autumnQa.draw(1,'#77716c'));
    await page.locator('#autumn-atlas').screenshot({path:path.join(qa,'qa-'+character+'-'+garment+'-3d-blink.jpg'),type:'jpeg',quality:95});
    await page.evaluate(()=>autumnQa.draw(0,'#eee9df'));
    await page.locator('#autumn-atlas').screenshot({path:path.join(qa,'qa-'+character+'-'+garment+'-3d-light-open.jpg'),type:'jpeg',quality:95});
    await page.evaluate(async({character,garment})=>{
     await Promise.all(['ivory-racecar-baseball-cap','brown-shearling-lace-boots'].map(async id=>{const image=new Image();image.src=cosmetics.cosmeticAsset(id,character);await image.decode();}));
     autumnQa.actor.cosmeticWardrobe={equipped:{[character+'Headwear']:'ivory-racecar-baseball-cap',[character+'Top']:garment,[character+'Feet']:'brown-shearling-lace-boots'}};
     for(let n=0;n<120;n++){autumnQa.system.refreshCosmetics();await new Promise(resolve=>setTimeout(resolve,20));}
     if(autumnQa.actor.cosmeticOpen===autumnQa.actor.resource.atlas.image)throw Error(character+' '+garment+' combination did not load');
     autumnQa.draw(0,'#77716c');
    },{character,garment});
    await page.locator('#autumn-atlas').screenshot({path:path.join(qa,'qa-'+character+'-'+garment+'-combination-3d-open.jpg'),type:'jpeg',quality:95});
    await page.evaluate(()=>autumnQa.draw(1,'#77716c'));
    await page.locator('#autumn-atlas').screenshot({path:path.join(qa,'qa-'+character+'-'+garment+'-combination-3d-blink.jpg'),type:'jpeg',quality:95});
   }
   await page.evaluate(()=>{autumnQa.system.dispose();autumnQa.renderer.dispose();document.querySelector('#autumn-atlas').remove();delete window.autumnQa;});
  }
  for(const character of ['eddy','noir'])assert.deepEqual(await page.evaluate(({character,garments})=>garments.filter(id=>cosmetics.cosmeticsForCharacter(character).some(item=>item.id===id)),{character,garments}),[]);
  assert.deepEqual(errors,[]);
  console.log('MECHANICAL PASS girls autumn top trio: girls-only inventory, independent Celeste/Phoebe/Elsie fits, exact garment bounds, top/full-body exclusivity, actual 3D renderer, 144 directions, open/blink, light/dark backgrounds, race-cap plus boots combinations, optical-flow disable and garment-colour mask.');
 }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;server.close();});
