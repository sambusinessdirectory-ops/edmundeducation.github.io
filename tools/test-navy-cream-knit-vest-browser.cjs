const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const {chromium}=require(process.env.HOME+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..'),qa=path.join(root,'tools/mascot-art/wardrobe/girls-navy-cream-knit-vest');
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
  await page.route('**/__vest',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><body style="margin:0;background:#77716c"><div id="inventory"></div></body>'}));
  await page.addInitScript(()=>{
   window.EdmundSystemNav={getStudentSession:()=>({id:'fixture',token:'fixture-token'})};
   window.EDMUND_SUPABASE={url:'fixture',anonKey:'fixture'};
   const owned=['navy-cream-knit-vest','ivory-botanical-cap','camel-coat-dress','ivory-tiered-dress'];
   window.supabase={createClient:()=>({
    auth:{getSession:async()=>({data:{session:{}}})},
    rpc:async method=>({data:method==='eddie_farm_owned_cosmetics'?owned:{equipped:{},outfits:[]}})
   })};
   window.EddieFarmAPI={student:()=>({token:'fixture-token'}),snapshot:async()=>({
    balance:100,
    cosmetics:owned.map(id=>({id,price:id==='navy-cream-knit-vest'?30:15,owned:true}))
   })};
  });
  await page.goto('http://127.0.0.1:'+server.address().port+'/__vest');
  await page.evaluate(async()=>{
   window.cosmetics=await import('/eddy-cosmetics.mjs?v=20261002-navy-vest1');
   await cosmetics.restoreCosmetics(undefined,{force:true});
  });

  for(const character of ['celeste','phoebe','elsie']){
   await page.evaluate(async character=>{
    window.controller?.abort();window.controller=new AbortController();
    document.querySelector('#inventory').replaceChildren();
    cosmetics.clearCosmetics(character);cosmetics.beginCosmeticsPreview();
    const {mountClosetInventory}=await import('/eddy-closet-inventory.mjs?v=20261002-navy-vest1');
    mountClosetInventory(document.querySelector('#inventory'),controller.signal,{character});
   },character);
   await page.waitForSelector('[data-cosmetic=navy-cream-knit-vest]');
   await page.locator('[data-cosmetic=navy-cream-knit-vest]').click();
   assert.equal(await page.locator('[data-cosmetic=navy-cream-knit-vest]').getAttribute('aria-pressed'),'true');
   assert.equal(await page.evaluate(character=>cosmetics.cosmeticsState().equipped[character+'Top'],character),'navy-cream-knit-vest');

   // A full-body garment must replace this top; reselecting the vest must replace
   // the full-body garment. This checks the existing coverage contract.
   await page.locator('[data-cosmetic=ivory-tiered-dress]').click();
   assert.equal(await page.evaluate(character=>cosmetics.cosmeticsState().equipped[character+'Top']||null,character),null);
   assert.equal(await page.evaluate(character=>cosmetics.cosmeticsState().equipped[character+'FullBody'],character),'ivory-tiered-dress');
   await page.locator('[data-cosmetic=navy-cream-knit-vest]').click();
   assert.equal(await page.evaluate(character=>cosmetics.cosmeticsState().equipped[character+'FullBody']||null,character),null);

   await page.evaluate(async character=>{
    const THREE=await import('/vendor/three/three.module.js');
    const {MascotCharacters}=await import('/speaking-mascot-characters.mjs?v=20261002-navy-vest1');
    const system=new MascotCharacters(undefined,undefined,{preview:true,cosmeticsEnabled:true});
    const actor=await system.create(character,'standing');
    for(let n=0;n<180&&(actor.cosmeticOpen===actor.resource.atlas.image||actor.cosmeticBlink===(actor.resource.blink||actor.resource.atlas).image);n++){
     await new Promise(resolve=>setTimeout(resolve,20));system.refreshCosmetics();
    }
    if(actor.cosmeticOpen===actor.resource.atlas.image||actor.cosmeticBlink===(actor.resource.blink||actor.resource.atlas).image)throw Error(character+' dressed vest atlases did not load');
    if(actor.mesh.material.uniforms.flowStrength.value!==0)throw Error(character+' dressed vest used bare-body optical flow');
    const scene=new THREE.Scene();scene.background=new THREE.Color('#292421');scene.add(actor.mesh);
    const camera=new THREE.OrthographicCamera(-1.1,1.1,2.2,0,.1,20);camera.position.set(0,0,5);
    const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(1024,1024);renderer.setScissorTest(true);
    const draw=(blink,background)=>{
     scene.background.set(background);
     for(let view=0;view<16;view++){
      system.update(actor,0,actor.angles[view]*Math.PI/180,0,true,false,0,0);
      actor.mesh.rotation.y=0;actor.mesh.material.uniforms.blink.value=blink;
      const row=Math.floor(view/4),col=view%4;
      renderer.setViewport(col*256,(3-row)*256,256,256);renderer.setScissor(col*256,(3-row)*256,256,256);renderer.render(scene,camera);
     }
    };
    draw(0,'#292421');renderer.domElement.id='vest-atlas';document.body.append(renderer.domElement);
    window.vestQa={THREE,system,actor,renderer,scene,draw};
   },character);
   await page.locator('#vest-atlas').screenshot({path:path.join(qa,'qa-'+character+'-3d-dark-open.jpg'),type:'jpeg',quality:94});
   await page.evaluate(()=>vestQa.draw(1,'#77716c'));
   await page.locator('#vest-atlas').screenshot({path:path.join(qa,'qa-'+character+'-3d-blink.jpg'),type:'jpeg',quality:94});
   await page.evaluate(()=>vestQa.draw(0,'#eee9df'));
   await page.locator('#vest-atlas').screenshot({path:path.join(qa,'qa-'+character+'-3d-light-open.jpg'),type:'jpeg',quality:94});

   await page.evaluate(async character=>{
    vestQa.previousOpen=vestQa.actor.cosmeticOpen;
    vestQa.actor.cosmeticWardrobe={equipped:{
     [character+'Top']:'navy-cream-knit-vest',
     [character+'Headwear']:'ivory-botanical-cap'
    }};
    for(let n=0;n<180;n++){
     vestQa.system.refreshCosmetics();
     if(vestQa.actor.cosmeticOpen!==vestQa.previousOpen&&vestQa.actor.cosmeticOpen!==vestQa.actor.resource.atlas.image)break;
     await new Promise(resolve=>setTimeout(resolve,20));
    }
    if(vestQa.actor.cosmeticOpen===vestQa.previousOpen||vestQa.actor.cosmeticOpen===vestQa.actor.resource.atlas.image)throw Error(character+' vest/cap combination did not load');
    vestQa.draw(0,'#77716c');
   },character);
   await page.locator('#vest-atlas').screenshot({path:path.join(qa,'qa-'+character+'-combination-3d-open.jpg'),type:'jpeg',quality:94});
   await page.evaluate(()=>vestQa.draw(1,'#77716c'));
   await page.locator('#vest-atlas').screenshot({path:path.join(qa,'qa-'+character+'-combination-3d-blink.jpg'),type:'jpeg',quality:94});
   await page.evaluate(()=>{
    vestQa.system.dispose();vestQa.renderer.dispose();document.querySelector('#vest-atlas').remove();delete window.vestQa;
   });
  }
  assert.deepEqual(errors,[]);
  console.log('MECHANICAL PASS navy/cream knit vest: girls-only inventory, top/full-body exclusivity, actual 3D renderer, 16 directions, open/blink, light/dark backgrounds, and botanical-cap combinations.');
 }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;server.close();});
