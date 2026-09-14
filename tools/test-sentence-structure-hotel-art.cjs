// Deterministic visual checks of source fidelity, motion extrema and fallback.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||path.join(process.env.HOME,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const root=path.resolve(__dirname,'..'),out=process.env.MAP_TEST_ARTIFACTS||'/tmp/sentence-hotel-art';fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!file.startsWith(root+path.sep))return res.writeHead(403).end();fs.readFile(file,(error,body)=>{if(error)return res.writeHead(404).end();res.setHeader('Content-Type',file.endsWith('.mjs')?'text/javascript':file.endsWith('.png')?'image/png':'text/html');res.end(body);});});
let browser;
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1402,height:1122},deviceScaleFactor:1});
 await page.goto(`http://127.0.0.1:${server.address().port}/sentence-structure.html`);await page.evaluate(()=>{document.body.replaceChildren();document.body.style.cssText='margin:0;background:#c8a7a5';});
 const result=await page.evaluate(async()=>{
  const {makeHotelPlate,createHotelScenery,createHotelEffects,HOTEL_LETTERING_REPAIRS}=await import('/sentence-structure-hotel-scenery.mjs?v=20260914-hotel1');
  const load=src=>new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src=src;});
  const [reference,restoration]=await Promise.all(['reference','restoration'].map(name=>load('/assets/sentence-structure/hotel/'+name+'.png')));
  const plate=makeHotelPlate(reference,restoration),scenery=Object.assign(document.createElement('canvas'),{width:1402,height:1122}),effects=Object.assign(document.createElement('canvas'),{width:1402,height:1122});
  for(const c of [plate,scenery,effects]){c.style.cssText='position:absolute;inset:0';document.body.append(c);}
  const rig=createHotelScenery(scenery,plate),fx=createHotelEffects(effects,reference);window.artRig={plate,scenery,effects,rig,fx};rig.paint(14);fx.paint(14);
  const canvas=Object.assign(document.createElement('canvas'),{width:1402,height:1122}),ctx=canvas.getContext('2d');ctx.drawImage(reference,0,0);const before=ctx.getImageData(0,0,1402,1122).data,after=plate.getContext('2d').getImageData(0,0,1402,1122).data;
  const repairs=[[242,39,67,51],[1166,39,62,52],[1304,207,98,70],[654,567,86,120],[1253,49,125,51],[1200,1007,136,48],...HOTEL_LETTERING_REPAIRS];
  let outsideChanges=0,unchangedPixels=0;for(let y=0;y<1122;y++)for(let x=0;x<1402;x++){if(repairs.some(([a,b,w,h])=>x>=a&&x<a+w&&y>=b&&y<b+h))continue;const i=(y*1402+x)*4;unchangedPixels++;if(before[i]!==after[i]||before[i+1]!==after[i+1]||before[i+2]!==after[i+2])outsideChanges++;}
  const fallback=Object.assign(document.createElement('canvas'),{width:1402,height:1122});fallback.getContext=()=>null;const still=createHotelScenery(fallback,plate);still.paint(100);still.destroy();
  return {outsideChanges,unchangedPixels,fallback:fallback.dataset.renderer};
 });
 assert.equal(result.outsideChanges,0,'Unedited source pixels are identical');assert.equal(result.fallback,'static');
 await page.screenshot({path:path.join(out,'hotel-native-motion.png')});
 const poses=[];for(const t of [0,6,10,14,18,22.99,23]){await page.evaluate(t=>{artRig.rig.paint(t);artRig.fx.paint(t);},t);await page.screenshot({path:path.join(out,`hotel-train-${String(t).replace('.','_')}.png`),clip:{x:1190,y:170,width:212,height:245}});poses.push(await page.evaluate(()=>JSON.parse(artRig.effects.dataset.train)));}
 await page.evaluate(()=>{const img=new Image();img.src='/assets/sentence-structure/hotel/reference.png';img.style.cssText='position:absolute;inset:0;width:1402px;height:1122px';document.body.append(img);return img.decode();});
 await page.screenshot({path:path.join(out,'hotel-train-reference.png'),clip:{x:1190,y:170,width:212,height:245}});
 await page.evaluate(()=>{artRig.rig.destroy();artRig.fx.destroy();});
 fs.writeFileSync(path.join(out,'hotel-art-qa.json'),JSON.stringify({...result,poses},null,2));console.log(JSON.stringify(result));
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{await browser?.close();server.close();});
