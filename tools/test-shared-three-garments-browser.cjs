const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const {chromium}=require(process.env.HOME+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..');
const mime={'.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp'};
const qa=path.join(root,'tools/mascot-art/wardrobe/shared-three-garments/qa');fs.mkdirSync(qa,{recursive:true});
const server=http.createServer((req,res)=>{const p=path.resolve(root,'.'+new URL(req.url,'http://local').pathname);if(!p.startsWith(root+'/'))return res.writeHead(403).end();fs.readFile(p,(e,b)=>{res.writeHead(e?404:200,{'Content-Type':mime[path.extname(p)]||'application/octet-stream'});res.end(e?'':b);});});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true});try{
 const page=await browser.newPage({viewport:{width:1250,height:1050}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('https://**/*',r=>r.abort());
 await page.route('**/__wardrobe_qa',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><style>body{background:#ddd;font:16px system-ui}canvas{display:block;width:1024px;height:1024px}</style><div id="gallery"></div>'}));
 await page.addInitScript(()=>{window.EdmundSystemNav={getStudentSession:()=>({id:'wardrobe-fixture',token:'fixture-token'})};});
 await page.goto('http://127.0.0.1:'+server.address().port+'/__wardrobe_qa');
 await page.evaluate(async()=>{
  window.cosmetics=await import('/eddy-cosmetics.mjs?v=20260916-three-tops1');await cosmetics.restoreCosmetics();cosmetics.beginCosmeticsPreview();
  window.bases={};for(const character of ['eddy','noir']){const im=new Image();im.src='/assets/speaking-system/mascots/v4/'+character+'-standing.png';await im.decode();bases[character]=im;}
 });
 const items=['brown-leather-bomber','sunburst-hoodie','black-blazer-hoodie'];
 for(const character of ['eddy','noir'])for(const item of items){
  await page.evaluate(item=>{cosmetics.clearCosmetics();cosmetics.equipCosmetic(item);},item);
  assert.deepEqual(await page.evaluate(()=>cosmetics.cosmeticsState().equipped),{top:item});
  await page.waitForFunction(({character})=>cosmetics.cosmeticAtlas(character,bases[character],{preview:true})!==bases[character],{character});
  await page.evaluate(character=>{document.querySelector('#gallery').replaceChildren(cosmetics.cosmeticAtlas(character,bases[character],{preview:true}));},character);
  await page.locator('#gallery canvas').screenshot({path:path.join(qa,character+'-'+item+'-alone.png')});
  await page.evaluate(()=>cosmetics.equipCosmetic('white-fedora'));
  assert.deepEqual(await page.evaluate(()=>cosmetics.cosmeticsState().equipped),{top:item,headwear:'white-fedora'});
  await page.waitForFunction(({character})=>cosmetics.cosmeticAtlas(character,bases[character],{preview:true})!==bases[character],{character});
  await page.evaluate(character=>{document.querySelector('#gallery').replaceChildren(cosmetics.cosmeticAtlas(character,bases[character],{preview:true}));},character);
  await page.locator('#gallery canvas').screenshot({path:path.join(qa,character+'-'+item+'-fedora.png')});
  assert.equal(await page.evaluate(character=>cosmetics.cosmeticAtlas(character,bases[character],{preview:true})===cosmetics.cosmeticAtlas(character,bases[character],{preview:true}),character),true);
  await page.evaluate(async character=>{
   const THREE=await import('/vendor/three/three.module.js');
   const {MascotCharacters}=await import('/speaking-mascot-characters.mjs?v=20260915-phoebe2');
   const system=new MascotCharacters(undefined,undefined,{preview:true});const actor=await system.create(character,'standing');
   for(let n=0;n<100&&actor.mesh.material.uniforms.flowStrength.value!==0;n++)await new Promise(r=>setTimeout(r,20));
   if(actor.mesh.material.uniforms.flowStrength.value!==0)throw Error('New fitted top used bare-body optical flow');
   if(actor.cosmeticOpen===actor.resource.atlas.image||actor.cosmeticBlink===actor.resource.blink.image)throw Error('Open/blink dressed atlases did not load');
   const scene=new THREE.Scene();scene.background=new THREE.Color('#292421');scene.add(actor.mesh);
   const camera=new THREE.OrthographicCamera(-1.1,1.1,2.2,0,.1,20);camera.position.set(0,0,5);
   const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(1024,1024);renderer.setScissorTest(true);
   for(let view=0;view<16;view++){
    system.update(actor,0,actor.angles[view]*Math.PI/180,0,true,false,0,0);actor.mesh.rotation.y=0;
    const row=Math.floor(view/4),col=view%4;renderer.setViewport(col*256,(3-row)*256,256,256);renderer.setScissor(col*256,(3-row)*256,256,256);renderer.render(scene,camera);
   }
   renderer.domElement.id='new-top-3d';document.body.prepend(renderer.domElement);window.qa3d={system,renderer};
  },character);
  await page.locator('#new-top-3d').screenshot({path:path.join(qa,character+'-'+item+'-3d-fedora.png')});
  await page.evaluate(()=>{qa3d.system.dispose();qa3d.renderer.dispose();document.querySelector('#new-top-3d').remove();});
 }
 assert.deepEqual(errors,[]);console.log('PASS: six independent new fits, alone/fedora composites, 16-view 3D open/blink atlases and cache reuse');
 }finally{await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
