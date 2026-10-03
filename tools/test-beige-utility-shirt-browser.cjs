const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const {chromium}=require(process.env.HOME+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..'),qa=path.join(root,'tools/mascot-art/wardrobe/beige-utility-shirt');
const garments=['beige-utility-shirt'];
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
  await page.route('**/__shirts',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><body style="margin:0;background:#77716c"><div id="inventory"></div></body>'}));
  await page.addInitScript(garments=>{
   window.EdmundSystemNav={getStudentSession:()=>({id:'fixture',token:'fixture-token'})};
   window.EDMUND_SUPABASE={url:'fixture',anonKey:'fixture'};
   const owned=[...garments,'ivory-botanical-cap','brown-shearling-lace-boots'];
   window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{}}})},rpc:async method=>({data:method==='eddie_farm_owned_cosmetics'?owned:{equipped:{},outfits:[]}})})};
   window.EddieFarmAPI={student:()=>({token:'fixture-token'}),snapshot:async()=>({balance:100,cosmetics:owned.map(id=>({id,price:35,owned:true}))})};
  },garments);
  await page.goto('http://127.0.0.1:'+server.address().port+'/__shirts');
  await page.evaluate(async()=>{
   window.cosmetics=await import('/eddy-cosmetics.mjs?v=20261003-all-hats2');
   await cosmetics.restoreCosmetics(undefined,{force:true});
  });

  for(const character of ['eddy','noir']){
   await page.evaluate(async character=>{
    window.controller?.abort();window.controller=new AbortController();document.querySelector('#inventory').replaceChildren();
    cosmetics.clearCosmetics(character);cosmetics.beginCosmeticsPreview();
    const {mountClosetInventory}=await import('/eddy-closet-inventory.mjs?v=20261003-all-hats2');
    mountClosetInventory(document.querySelector('#inventory'),controller.signal,{character});
    const THREE=await import('/vendor/three/three.module.js');
    const {MascotCharacters}=await import('/speaking-mascot-characters.mjs?v=20261003-all-hats2');
    const system=new MascotCharacters(undefined,undefined,{preview:true,cosmeticsEnabled:true});
    const actor=await system.create(character,'standing');
    const scene=new THREE.Scene();scene.background=new THREE.Color('#292421');scene.add(actor.mesh);
    const camera=new THREE.OrthographicCamera(-1.1,1.1,2.2,0,.1,20);camera.position.set(0,0,5);
    const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(1024,1024);renderer.setScissorTest(true);renderer.domElement.id='shirt-atlas';document.body.append(renderer.domElement);
    const draw=(blink,background)=>{
     scene.background.set(background);
     for(let view=0;view<16;view++){
      system.update(actor,0,actor.angles[view]*Math.PI/180,0,true,false,0,0);actor.mesh.rotation.y=0;actor.mesh.material.uniforms.blink.value=blink;
      const row=Math.floor(view/4),col=view%4;renderer.setViewport(col*256,(3-row)*256,256,256);renderer.setScissor(col*256,(3-row)*256,256,256);renderer.render(scene,camera);
     }
    };
    window.shirtQa={THREE,system,actor,renderer,scene,draw};
   },character);

   await page.evaluate(()=>shirtQa.draw(0,'#292421'));
   await page.locator('#shirt-atlas').screenshot({path:path.join(qa,'qa-'+character+'-bare-3d-dark-open.jpg'),type:'jpeg',quality:95});

   for(const garment of garments){
    await page.waitForSelector('[data-cosmetic="'+garment+'"]');
    await page.evaluate(({character,garment})=>{cosmetics.clearCosmetics(character);document.querySelector('[data-cosmetic="'+garment+'"]').click();},{character,garment});
    assert.equal(await page.locator('[data-cosmetic="'+garment+'"]').getAttribute('aria-pressed'),'true');
    assert.equal(await page.evaluate(({character})=>cosmetics.cosmeticsState().equipped[character+'Top'],{character}),garment);
    await page.evaluate(async({character,garment})=>{
     const preload=new Image();preload.src=cosmetics.cosmeticAsset(garment,character);await preload.decode();
     shirtQa.actor.cosmeticWardrobe={equipped:{[character+'Top']:garment}};
     for(let n=0;n<100;n++){shirtQa.system.refreshCosmetics();await new Promise(resolve=>setTimeout(resolve,20));}
     if(shirtQa.actor.cosmeticOpen===shirtQa.actor.resource.atlas.image)throw Error(character+' '+garment+' top did not load');
     if(shirtQa.actor.mesh.material.uniforms.flowStrength.value!==0)throw Error(character+' '+garment+' used bare-body optical flow');
     if(character==='eddy'){
      for(const [label,image] of [['open',shirtQa.actor.cosmeticOpen],['blink',shirtQa.actor.cosmeticBlink]]){
       const audit=document.createElement('canvas');audit.width=1024;audit.height=1024;const ctx=audit.getContext('2d');ctx.drawImage(image,0,0);const p=ctx.getImageData(0,0,1024,1024).data;let pale=0;
       // Shirt hems end no lower than y=212.  Audit only the legs/feet band so
       // legitimate ivory shirt panels and flame fill are never counted.
       for(let cell=0;cell<16;cell++){const ox=cell%4*256,oy=Math.floor(cell/4)*256;for(let y=214;y<250;y++)for(let x=30;x<230;x++){const i=((oy+y)*1024+ox+x)*4;if(p[i+3]>=8&&Math.min(p[i],p[i+1],p[i+2])>145&&Math.max(p[i],p[i+1],p[i+2])-Math.min(p[i],p[i+1],p[i+2])<85)pale++;}}
       if(pale)throw Error('Eddy '+label+' still has '+pale+' pale foot-fringe pixels');
      }
     }
     shirtQa.draw(0,'#292421');
    },{character,garment});
    await page.locator('#shirt-atlas').screenshot({path:path.join(qa,'qa-'+character+'-'+garment+'-3d-dark-open.jpg'),type:'jpeg',quality:95});
    await page.evaluate(()=>shirtQa.draw(1,'#77716c'));
    await page.locator('#shirt-atlas').screenshot({path:path.join(qa,'qa-'+character+'-'+garment+'-3d-blink.jpg'),type:'jpeg',quality:95});
    await page.evaluate(()=>shirtQa.draw(0,'#eee9df'));
    await page.locator('#shirt-atlas').screenshot({path:path.join(qa,'qa-'+character+'-'+garment+'-3d-light-open.jpg'),type:'jpeg',quality:95});

    await page.evaluate(async({character,garment})=>{
     await Promise.all(['ivory-botanical-cap','brown-shearling-lace-boots'].map(async id=>{const preload=new Image();preload.src=cosmetics.cosmeticAsset(id,character);await preload.decode();}));
     const previous=shirtQa.actor.cosmeticOpen;
     shirtQa.actor.cosmeticWardrobe={equipped:{[character+'Headwear']:'ivory-botanical-cap',[character+'Top']:garment,[character+'Feet']:'brown-shearling-lace-boots'}};
     for(let n=0;n<100;n++){shirtQa.system.refreshCosmetics();await new Promise(resolve=>setTimeout(resolve,20));}
     if(shirtQa.actor.cosmeticOpen===previous||shirtQa.actor.cosmeticOpen===shirtQa.actor.resource.atlas.image)throw Error(character+' '+garment+' combination did not load');
     shirtQa.draw(0,'#77716c');
    },{character,garment});
    await page.locator('#shirt-atlas').screenshot({path:path.join(qa,'qa-'+character+'-'+garment+'-combination-3d-open.jpg'),type:'jpeg',quality:95});
    await page.evaluate(()=>shirtQa.draw(1,'#77716c'));
    await page.locator('#shirt-atlas').screenshot({path:path.join(qa,'qa-'+character+'-'+garment+'-combination-3d-blink.jpg'),type:'jpeg',quality:95});
   }
   await page.evaluate(()=>{shirtQa.system.dispose();shirtQa.renderer.dispose();document.querySelector('#shirt-atlas').remove();delete window.shirtQa;});
  }
  for(const character of ['celeste','phoebe','elsie'])assert.deepEqual(await page.evaluate(({character,garments})=>garments.filter(id=>cosmetics.cosmeticsForCharacter(character).some(item=>item.id===id)),{character,garments}),[]);
  assert.deepEqual(errors,[]);
  console.log('MECHANICAL PASS beige utility shirt: boys-only inventory, independent Eddy/Noir fits, actual 3D renderer, 32 directions, open/blink, light/dark backgrounds, cap plus boots combinations, and zero pale Eddy foot-fringe pixels in open and blink atlases.');
 }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;server.close();});
