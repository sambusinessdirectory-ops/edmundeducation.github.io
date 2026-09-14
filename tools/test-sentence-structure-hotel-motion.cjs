// Motion regressions identified in the user's September 14 screen recording.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||path.join(process.env.HOME,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const root=path.resolve(__dirname,'..'),out=process.env.MAP_TEST_ARTIFACTS||'/tmp/hotel-motion';fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{const f=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!f.startsWith(root+path.sep))return res.writeHead(403).end();fs.readFile(f,(e,b)=>{if(e)return res.writeHead(404).end();res.setHeader('Content-Type',f.endsWith('.mjs')?'text/javascript':f.endsWith('.png')?'image/png':'text/html');res.end(b);});});
let browser,context;
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await chromium.launch({headless:true});
 context=await browser.newContext({viewport:{width:480,height:878},recordVideo:{dir:path.join(out,'video'),size:{width:480,height:878}}});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('https://**/*',r=>r.abort());
 await page.goto(`http://127.0.0.1:${server.address().port}/sentence-structure.html`);
 await page.evaluate(async()=>{
  document.body.innerHTML='<main id="art"></main>';document.head.querySelectorAll('link[rel=stylesheet]').forEach(n=>n.remove());document.body.style.cssText='margin:0;overflow:hidden';
  const art=document.querySelector('#art');art.style.cssText='position:absolute;left:-922px;top:-40px;width:1402px;height:1122px;overflow:hidden';
  const {makeHotelPlate,createHotelScenery,createHotelEffects}=await import('/sentence-structure-hotel-scenery.mjs?v=20260914-hotel3');
  const {HOTEL_SCALE,hotelTrainPose}=await import('/sentence-structure-hotel-geometry.mjs?v=20260914-hotel3');
  const load=n=>new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src='/assets/sentence-structure/hotel/'+n+'.png';});
  const [reference,restoration,train,vegetation]=await Promise.all(['reference','restoration','funicular-complete','vegetation-clean'].map(load));
  const plate=makeHotelPlate(reference,restoration),c=()=>Object.assign(document.createElement('canvas'),{width:1402,height:1122}),scenery=c(),effects=c(),layer=document.createElement('div');
  for(const el of [plate,scenery,layer,effects]){el.style.cssText='position:absolute;inset:0';art.append(el);}
  layer.style.cssText=`position:absolute;left:0;top:0;width:1600px;height:${1122*HOTEL_SCALE}px;transform:scale(${1/HOTEL_SCALE});transform-origin:0 0`;
  const rig=createHotelScenery(scenery,plate,vegetation),fx=createHotelEffects(effects,reference,train,{trainLayer:layer});
  window.motionRig={rig,fx,layer,scenery,effects,samples:[],poses:hotelTrainPose};
  rig.paint(11.8);fx.paint(11.8);layer.querySelector('canvas').getAnimations()[0].pause();layer.querySelector('canvas').getAnimations()[0].currentTime=11800;
 });
 await page.screenshot({path:path.join(out,'fixed-train-and-trees.png')});
 const stable=await page.evaluate(async()=>{
  const {layer,rig,fx,samples}=motionRig,car=layer.querySelector('canvas'),animation=car.getAnimations()[0];
  // No vehicle canvas writes are allowed after preparation. Translation is a
  // compositor animation, independent of scenery frame rate or GPU uploads.
  const pixels=car.toDataURL();let writes=0;const ctx=car.getContext('2d');for(const key of ['clearRect','drawImage','putImageData']){const original=ctx[key];ctx[key]=function(...args){writes++;return original.apply(this,args);};}
  animation.currentTime=6500;animation.play();const start=performance.now();let previous=start;
  await new Promise(resolve=>{function frame(now){const t=6.5+(now-start)/1000;rig.paint(t);fx.paint(t);const m=new DOMMatrixReadOnly(getComputedStyle(car).transform);samples.push({t,dx:m.m41,dy:m.m42,dt:now-previous});previous=now;if(now-start<27000)requestAnimationFrame(frame);else resolve();}requestAnimationFrame(frame);});
  animation.pause();return {samePixels:car.toDataURL()===pixels,writes,samples,errors:[]};
 });
 assert.ok(stable.samePixels);assert.equal(stable.writes,0,'Carriage is never cleared/repainted while travelling');
 let wraps=0;for(let i=1;i<stable.samples.length;i++){const a=stable.samples[i-1],b=stable.samples[i];if(b.dx<a.dx-100)wraps++;else{assert.ok(b.dx>=a.dx-.01,'Continuous uphill translation');assert.ok(Math.abs((b.dy-a.dy)+.44*(b.dx-a.dx))<.02,'Wheel contact follows the rail slope throughout');}}
 assert.equal(wraps,1,'One invisible wrap and a second emergence were recorded');
 // Compare the actual sprite before/after restoring reduced-motion pose.
 await page.evaluate(()=>{motionRig.fx.paint(0,true);motionRig.rig.paint(0,true);});
 const stopped=await page.locator('.hotel-funicular').evaluate(c=>({state:c.getAnimations()[0].playState,t:c.getAnimations()[0].currentTime,transform:getComputedStyle(c).transform}));
 assert.equal(stopped.state,'paused');assert.equal(stopped.t,11800);
 assert.deepEqual(errors,[]);const dts=stable.samples.slice(2).map(s=>s.dt).sort((a,b)=>a-b);
 const summary={spritePixelsUnchanged:stable.samePixels,spriteRepaints:stable.writes,continuousRailContact:true,hiddenWraps:wraps,samples:stable.samples.length,sceneryMedianFrameMs:dts[Math.floor(dts.length*.5)],scenery95thFrameMs:dts[Math.floor(dts.length*.95)],reducedMotion:stopped,errors};
 fs.writeFileSync(path.join(out,'motion-regressions.json'),JSON.stringify(summary,null,2));console.log(JSON.stringify(summary));
 const video=page.video();await context.close();context=null;await video.saveAs(path.join(out,'hotel-motion-review.webm'));
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{await context?.close();await browser?.close();server.close();});
