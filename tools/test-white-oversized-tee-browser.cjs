const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const {chromium}=require(process.env.HOME+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..'),qa=path.join(root,'tools/mascot-art/wardrobe/all-white-oversized-tee');
const mime={'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.bin':'application/octet-stream'};
const server=http.createServer((req,res)=>{
 const p=path.resolve(root,'.'+new URL(req.url,'http://local').pathname);
 if(!p.startsWith(root+'/'))return res.writeHead(403).end();
 fs.readFile(p,(e,b)=>{res.writeHead(e?404:200,{'Content-Type':mime[path.extname(p)]||'application/octet-stream'});res.end(e?'':b);});
});

(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1150,height:1100}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/__tee',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><body style="margin:0;background:#77716c"><div id="inventory"></div></body>'}));
  await page.addInitScript(()=>{
   window.EdmundSystemNav={getStudentSession:()=>({id:'fixture',token:'fixture-token'})};
   window.EDMUND_SUPABASE={url:'fixture',anonKey:'fixture'};
   const owned=['white-oversized-tee','ivory-tiered-dress','ivory-botanical-cap','brown-shearling-lace-boots'];
   window.supabase={createClient:()=>({
    auth:{getSession:async()=>({data:{session:{}}})},
    rpc:async method=>({data:method==='eddie_farm_owned_cosmetics'?owned:{equipped:{},outfits:[]}})
   })};
   window.EddieFarmAPI={student:()=>({token:'fixture-token'}),snapshot:async()=>({balance:100,cosmetics:owned.map(id=>({id,price:35,owned:true}))})};
  });
  await page.goto('http://127.0.0.1:'+server.address().port+'/__tee');
  await page.evaluate(async()=>{
   window.cosmetics=await import('/eddy-cosmetics.mjs?v=20261002-white-tee1');
   await cosmetics.restoreCosmetics(undefined,{force:true});
  });

  for(const character of ['eddy','noir','celeste','phoebe','elsie']){
   await page.evaluate(async character=>{
    window.controller?.abort();window.controller=new AbortController();document.querySelector('#inventory').replaceChildren();
    cosmetics.clearCosmetics(character);cosmetics.beginCosmeticsPreview();
    const {mountClosetInventory}=await import('/eddy-closet-inventory.mjs?v=20261002-white-tee1');
    mountClosetInventory(document.querySelector('#inventory'),controller.signal,{character});
   },character);
   await page.waitForSelector('[data-cosmetic=white-oversized-tee]');
   await page.locator('[data-cosmetic=white-oversized-tee]').click();
   assert.equal(await page.locator('[data-cosmetic=white-oversized-tee]').getAttribute('aria-pressed'),'true');
   assert.equal(await page.evaluate(character=>cosmetics.cosmeticsState().equipped[character+'Top'],character),'white-oversized-tee');
   if(['celeste','phoebe','elsie'].includes(character)){
    await page.locator('[data-cosmetic=ivory-tiered-dress]').click();
    assert.equal(await page.evaluate(character=>cosmetics.cosmeticsState().equipped[character+'FullBody'],character),'ivory-tiered-dress');
    assert.equal(await page.evaluate(character=>cosmetics.cosmeticsState().equipped[character+'Top'],character),undefined);
    await page.locator('[data-cosmetic=white-oversized-tee]').click();
    assert.equal(await page.evaluate(character=>cosmetics.cosmeticsState().equipped[character+'Top'],character),'white-oversized-tee');
    assert.equal(await page.evaluate(character=>cosmetics.cosmeticsState().equipped[character+'FullBody'],character),undefined);
   }

   await page.evaluate(async character=>{
    const preload=new Image();preload.src=cosmetics.cosmeticAsset('white-oversized-tee',character);await preload.decode();
    const THREE=await import('/vendor/three/three.module.js');
    const {MascotCharacters}=await import('/speaking-mascot-characters.mjs?v=20261002-white-tee1');
    const system=new MascotCharacters(undefined,undefined,{preview:true,cosmeticsEnabled:true});
    const actor=await system.create(character,'standing');
    for(let n=0;n<180&&(actor.cosmeticOpen===actor.resource.atlas.image||actor.cosmeticBlink===(actor.resource.blink||actor.resource.atlas).image);n++){
     await new Promise(resolve=>setTimeout(resolve,20));system.refreshCosmetics();
    }
    if(actor.cosmeticOpen===actor.resource.atlas.image||actor.cosmeticBlink===(actor.resource.blink||actor.resource.atlas).image)throw Error(character+' shirt atlases did not load');
    if(actor.mesh.material.uniforms.flowStrength.value!==0)throw Error(character+' shirt used bare-body optical flow');
    const scene=new THREE.Scene();scene.background=new THREE.Color('#292421');scene.add(actor.mesh);
    const camera=new THREE.OrthographicCamera(-1.1,1.1,2.2,0,.1,20);camera.position.set(0,0,5);
    const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(1024,1024);renderer.setScissorTest(true);
    const draw=(blink,background)=>{
     scene.background.set(background);
     for(let view=0;view<16;view++){
      system.update(actor,0,actor.angles[view]*Math.PI/180,0,true,false,0,0);actor.mesh.rotation.y=0;actor.mesh.material.uniforms.blink.value=blink;
      const row=Math.floor(view/4),col=view%4;
      renderer.setViewport(col*256,(3-row)*256,256,256);renderer.setScissor(col*256,(3-row)*256,256,256);renderer.render(scene,camera);
     }
    };
    draw(0,'#292421');renderer.domElement.id='tee-atlas';document.body.append(renderer.domElement);
    window.teeQa={THREE,system,actor,renderer,scene,draw};
   },character);
   await page.locator('#tee-atlas').screenshot({path:path.join(qa,'qa-'+character+'-3d-dark-open.jpg'),type:'jpeg',quality:94});
   await page.evaluate(()=>teeQa.draw(1,'#77716c'));
   await page.locator('#tee-atlas').screenshot({path:path.join(qa,'qa-'+character+'-3d-blink.jpg'),type:'jpeg',quality:94});
   await page.evaluate(()=>teeQa.draw(0,'#eee9df'));
   await page.locator('#tee-atlas').screenshot({path:path.join(qa,'qa-'+character+'-3d-light-open.jpg'),type:'jpeg',quality:94});

   await page.evaluate(async character=>{
    await Promise.all(['ivory-botanical-cap','brown-shearling-lace-boots'].map(async id=>{const preload=new Image();preload.src=cosmetics.cosmeticAsset(id,character);await preload.decode();}));
    teeQa.previousOpen=teeQa.actor.cosmeticOpen;
    teeQa.actor.cosmeticWardrobe={equipped:{
     [character+'Headwear']:'ivory-botanical-cap',
     [character+'Top']:'white-oversized-tee',
     [character+'Feet']:'brown-shearling-lace-boots'
    }};
    // The corrected Eddy/Noir base canvas can briefly differ from the canonical image
    // before all three cosmetic layers finish composing. Wait through that intermediate
    // state so the open and blink screenshots lock the same complete outfit.
    for(let n=0;n<100;n++){teeQa.system.refreshCosmetics();await new Promise(resolve=>setTimeout(resolve,20));}
    if(teeQa.actor.cosmeticOpen===teeQa.previousOpen||teeQa.actor.cosmeticOpen===teeQa.actor.resource.atlas.image)throw Error(character+' high-risk shirt combination did not load');
    teeQa.draw(0,'#77716c');
   },character);
   await page.locator('#tee-atlas').screenshot({path:path.join(qa,'qa-'+character+'-combination-3d-open.jpg'),type:'jpeg',quality:94});
   await page.evaluate(()=>teeQa.draw(1,'#77716c'));
   await page.locator('#tee-atlas').screenshot({path:path.join(qa,'qa-'+character+'-combination-3d-blink.jpg'),type:'jpeg',quality:94});
   await page.evaluate(()=>{teeQa.system.dispose();teeQa.renderer.dispose();document.querySelector('#tee-atlas').remove();delete window.teeQa;});
  }
  assert.deepEqual(errors,[]);
  console.log('MECHANICAL PASS white oversized tee: all-character inventory, top-slot persistence, girls full-body exclusivity, actual 3D renderer, 16 directions, open/blink, light/dark backgrounds, and botanical-cap plus shearling-boots combinations.');
 }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;server.close();});
