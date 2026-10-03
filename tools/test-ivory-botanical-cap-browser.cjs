const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const {chromium}=require(process.env.HOME+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..'),qa=path.join(root,'tools/mascot-art/wardrobe/ivory-botanical-cap');
const mime={'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.bin':'application/octet-stream'};
const server=http.createServer((req,res)=>{const p=path.resolve(root,'.'+new URL(req.url,'http://local').pathname);if(!p.startsWith(root+'/'))return res.writeHead(403).end();fs.readFile(p,(e,b)=>{res.writeHead(e?404:200,{'Content-Type':mime[path.extname(p)]||'application/octet-stream'});res.end(e?'':b);});});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true});try{
 const page=await browser.newPage({viewport:{width:1150,height:1100}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/__cap',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><body style="margin:0;background:#77716c"><div id="inventory"></div></body>'}));
 await page.addInitScript(()=>{
  window.EdmundSystemNav={getStudentSession:()=>({id:'fixture',token:'fixture-token'})};window.EDMUND_SUPABASE={url:'fixture',anonKey:'fixture'};
  window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{}}})},rpc:async method=>({data:method==='eddie_farm_owned_cosmetics'?['ivory-botanical-cap','blue-swordsman-jacket']:{equipped:{},outfits:[]}})})};
  window.EddieFarmAPI={student:()=>({token:'fixture-token'}),snapshot:async()=>({balance:100,cosmetics:[{id:'ivory-botanical-cap',price:15,owned:true},{id:'blue-swordsman-jacket',price:0,owned:true}]})};
 });
 await page.goto('http://127.0.0.1:'+server.address().port+'/__cap');
 await page.evaluate(async()=>{window.cosmetics=await import('/eddy-cosmetics.mjs?v=20261003-all-hats2');await cosmetics.restoreCosmetics(undefined,{force:true});});
 for(const character of ['eddy','noir','celeste','phoebe','elsie']){
  await page.evaluate(async character=>{
   window.controller?.abort();window.controller=new AbortController();document.querySelector('#inventory').replaceChildren();cosmetics.clearCosmetics(character);cosmetics.beginCosmeticsPreview();
   const {mountClosetInventory}=await import('/eddy-closet-inventory.mjs?v=20261003-all-hats2');mountClosetInventory(document.querySelector('#inventory'),controller.signal,{character});
  },character);
  await page.waitForSelector('[data-cosmetic=ivory-botanical-cap]');await page.locator('[data-cosmetic=ivory-botanical-cap]').click();
  assert.equal(await page.locator('[data-cosmetic=ivory-botanical-cap]').getAttribute('aria-pressed'),'true');
  await page.evaluate(async character=>{
   const THREE=await import('/vendor/three/three.module.js'),{MascotCharacters}=await import('/speaking-mascot-characters.mjs?v=20261003-all-hats2');
   const system=new MascotCharacters(undefined,undefined,{preview:true,cosmeticsEnabled:true}),actor=await system.create(character,'standing');
   await new Promise(r=>setTimeout(r,700));system.refreshCosmetics();
   for(let n=0;n<180&&(actor.cosmeticOpen===actor.resource.atlas.image||actor.cosmeticBlink===(actor.resource.blink||actor.resource.atlas).image);n++){await new Promise(r=>setTimeout(r,20));system.refreshCosmetics();}
   if(actor.cosmeticOpen===actor.resource.atlas.image||actor.cosmeticBlink===(actor.resource.blink||actor.resource.atlas).image)throw Error(character+' dressed cap atlases did not load');
   const scene=new THREE.Scene();scene.background=new THREE.Color('#77716c');scene.add(actor.mesh);
   const camera=new THREE.OrthographicCamera(-1.1,1.1,2.2,0,.1,20);camera.position.set(0,0,5);
   const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(1024,1024);renderer.setScissorTest(true);
   const draw=blink=>{for(let view=0;view<16;view++){system.update(actor,0,actor.angles[view]*Math.PI/180,0,true,false,0,0);actor.mesh.rotation.y=0;actor.mesh.material.uniforms.blink.value=blink;const row=Math.floor(view/4),col=view%4;renderer.setViewport(col*256,(3-row)*256,256,256);renderer.setScissor(col*256,(3-row)*256,256,256);renderer.render(scene,camera);}};
   draw(0);renderer.domElement.id='cap-open';document.body.append(renderer.domElement);window.capQa={THREE,system,actor,renderer,draw};
  },character);
  await page.locator('#cap-open').screenshot({path:path.join(qa,'qa-'+character+'-3d-open.jpg'),type:'jpeg',quality:94});
  await page.evaluate(()=>capQa.draw(1));
  await page.locator('#cap-open').screenshot({path:path.join(qa,'qa-'+character+'-3d-blink.jpg'),type:'jpeg',quality:94});
  const combination=['eddy','noir'].includes(character)?'blue-swordsman-jacket':'ivory-tiered-dress';
  await page.evaluate(async({character,combination})=>{capQa.previousOpen=capQa.actor.cosmeticOpen;capQa.actor.cosmeticWardrobe={equipped:{[character+'Headwear']:'ivory-botanical-cap',[character+(['eddy','noir'].includes(character)?'Top':'FullBody')]:combination}};await new Promise(r=>setTimeout(r,1200));for(let n=0;n<90;n++){capQa.system.refreshCosmetics();await new Promise(r=>setTimeout(r,20));}if(capQa.actor.cosmeticOpen===capQa.previousOpen||capQa.actor.cosmeticOpen===capQa.actor.resource.atlas.image)throw Error(character+' representative combination did not load');},{character,combination});
  await page.evaluate(()=>capQa.draw(0));
  await page.locator('#cap-open').screenshot({path:path.join(qa,'qa-'+character+'-combination-3d-open.jpg'),type:'jpeg',quality:94});
  await page.evaluate(()=>capQa.draw(1));
  await page.locator('#cap-open').screenshot({path:path.join(qa,'qa-'+character+'-combination-3d-blink.jpg'),type:'jpeg',quality:94});
  const state=await page.evaluate(character=>cosmetics.cosmeticsState().equipped[character+'Headwear'],character);assert.equal(state,'ivory-botanical-cap');
  await page.evaluate(()=>{capQa.system.dispose();capQa.renderer.dispose();document.querySelector('#cap-open').remove();delete window.capQa;});
 }
 assert.deepEqual(errors,[]);console.log('MECHANICAL PASS botanical cap: actual 3D renderer, 16 directions, open/blink, and representative garment combinations for all five characters. Visual acceptance is a separate signed gate.');
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
