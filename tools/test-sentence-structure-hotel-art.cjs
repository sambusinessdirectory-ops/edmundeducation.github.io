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
  const {makeHotelPlate,createHotelScenery,createHotelEffects,HOTEL_LETTERING_REPAIRS}=await import('/sentence-structure-hotel-scenery.mjs?v=20260914-hotel3b');
  const load=src=>new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=reject;i.src=src;});
  const [reference,restoration,train,liftImage,vegetationPlate]=await Promise.all(['reference','restoration','funicular-complete','elevator-reference','vegetation-clean'].map(name=>load('/assets/sentence-structure/hotel/'+name+'.png')));
  const plate=makeHotelPlate(reference,restoration),scenery=Object.assign(document.createElement('canvas'),{width:1402,height:1122}),effects=Object.assign(document.createElement('canvas'),{width:1402,height:1122});
  for(const c of [plate,scenery,effects]){c.style.cssText='position:absolute;inset:0';document.body.append(c);}
  const rig=createHotelScenery(scenery,plate,vegetationPlate),fx=createHotelEffects(effects,reference,train,{snow:false});
  const {createHotelElevator}=await import('/sentence-structure-hotel-elevator.mjs?v=20260914-hotel3b');const liftCanvas=document.createElement('canvas'),elevator=createHotelElevator(liftImage,liftCanvas);
  window.artRig={plate,scenery,effects,rig,fx,elevator,liftCanvas,train};rig.paint(14);fx.paint(11.8);
  const canvas=Object.assign(document.createElement('canvas'),{width:1402,height:1122}),ctx=canvas.getContext('2d');ctx.drawImage(reference,0,0);const before=ctx.getImageData(0,0,1402,1122).data,after=plate.getContext('2d').getImageData(0,0,1402,1122).data;
  const repairs=[[242,39,67,51],[1166,39,62,52],[1304,207,98,70],[654,567,86,120],[1253,49,125,51],[1200,1007,136,48],...HOTEL_LETTERING_REPAIRS];
  let outsideChanges=0,unchangedPixels=0;for(let y=0;y<1122;y++)for(let x=0;x<1402;x++){if(repairs.some(([a,b,w,h])=>x>=a&&x<a+w&&y>=b&&y<b+h))continue;const i=(y*1402+x)*4;unchangedPixels++;if(before[i]!==after[i]||before[i+1]!==after[i+1]||before[i+2]!==after[i+2])outsideChanges++;}
  const fallback=Object.assign(document.createElement('canvas'),{width:1402,height:1122});fallback.getContext=()=>null;const still=createHotelScenery(fallback,plate);still.paint(100);still.destroy();
  const background=rig.vegetation.under.getContext('2d').getImageData(0,0,1402,1122).data;let parkedCarLeak=0;
  for(let y=220;y<265;y++)for(let x=1310;x<1395;x++){const i=(y*1402+x)*4;for(let k=0;k<3;k++)parkedCarLeak=Math.max(parkedCarLeak,Math.abs(background[i+k]-after[i+k]));}
  return {outsideChanges,unchangedPixels,parkedCarLeak,fallback:fallback.dataset.renderer};
 });
 assert.equal(result.outsideChanges,0,'Unedited source pixels are identical');assert.equal(result.fallback,'static');assert.ok(result.parkedCarLeak<=1,'The original parked train cannot leak through canopy gaps');
 await page.screenshot({path:path.join(out,'hotel-native-motion.png')});
 const poses=[];for(const t of [0,6,10,11.8,14,18,22.99,23]){await page.evaluate(t=>{artRig.rig.paint(t);artRig.fx.paint(t);},t);await page.screenshot({path:path.join(out,`hotel-train-${String(t).replace('.','_')}.png`),clip:{x:1190,y:150,width:212,height:265}});poses.push(await page.evaluate(()=>JSON.parse(artRig.effects.dataset.train)));}
 await page.evaluate(()=>{const p={x:225*1600/1402,y:8850+650*1600/1402};const lift=artRig.elevator.paint(p);artRig.rig.paint(12,false,lift);});
 await page.screenshot({path:path.join(out,'hotel-elevator-art.png'),clip:{x:126,y:390,width:300,height:355}});
 const motion=await page.evaluate(async()=>{
  const {prepareHotelTrain,drawHotelTrain}=await import('/sentence-structure-hotel-scenery.mjs?v=20260914-hotel3b');const {hotelTrainPose}=await import('/sentence-structure-hotel-geometry.mjs?v=20260914-hotel3b');
  const train=prepareHotelTrain(artRig.train),b=train.bounds,tc=train.canvas.getContext('2d'),row=tc.getImageData(b.x,b.y+Math.floor(b.h*.5),b.w,1).data;let solid=0;for(let i=3;i<row.length;i+=4)if(row[i]>240)solid++;
  const expected=document.createElement('canvas');expected.width=1402;expected.height=1122;const ec=expected.getContext('2d',{willReadFrequently:true});drawHotelTrain(ec,train,hotelTrainPose(11.8));artRig.fx.paint(11.8);
  const a=ec.getImageData(1250,150,152,180).data,z=artRig.effects.getContext('2d').getImageData(1250,150,152,180).data;let ea=0,za=0;for(let i=3;i<a.length;i+=4){ea+=a[i];za+=z[i];}
  const hidden=[];for(const t of [0,22.999,23]){artRig.fx.paint(t);const d=artRig.effects.getContext('2d').getImageData(1100,150,302,300).data;hidden.push(d.filter((_,i)=>i%4===3).some(v=>v>0));}
  const frame=document.createElement('canvas');frame.width=1402;frame.height=1122;const fc=frame.getContext('2d',{willReadFrequently:true});artRig.rig.paint(0,true);fc.drawImage(artRig.scenery,0,0);const base=fc.getImageData(0,0,1402,1122).data;
  const rois=[[1024,958,32,35],[491,922,37,35]],shifts=[[],[]],strip=document.createElement('canvas');strip.width=750;strip.height=180;const sc=strip.getContext('2d');sc.fillStyle='#f5eae4';sc.fillRect(0,0,750,180);
  for(const [n,t] of [0,1.6,3.2,4.8,6.4].entries()){artRig.rig.paint(t);fc.drawImage(artRig.scenery,0,0);const now=fc.getImageData(0,0,1402,1122).data;
   rois.forEach(([rx,ry,rw,rh],j)=>{let best=Infinity,shift=0;for(let dx=-12;dx<=12;dx++){let error=0,count=0;for(let y=ry;y<ry+rh;y++)for(let x=rx;x<rx+rw;x++){const i=(y*1402+x)*4,k=(y*1402+x+dx)*4;if(base[i+1]<base[i]-8||(base[i]+base[i+1]+base[i+2])/3>145)continue;for(let c=0;c<3;c++)error+=(base[i+c]-now[k+c])**2;count++;}if(count&&error/count<best){best=error/count;shift=dx;}}shifts[j].push(shift);});
   sc.fillStyle='#4a2931';sc.font='12px sans-serif';sc.fillText(`t = ${t}s`,n*150+10,15);sc.drawImage(artRig.scenery,990,935,120,160,n*150+10,20,120,160);
  }
  return {trainBodyRowCoverage:solid/b.w,fullTrainAlphaRatio:za/ea,hiddenAtLoopEnds:hidden,treeDisplacements:shifts.map(s=>({samples:s,range:Math.max(...s)-Math.min(...s)})),strip:strip.toDataURL()};
 });
 assert.ok(motion.trainBodyRowCoverage>.95,'Full carriage body has a continuous side');assert.ok(motion.fullTrainAlphaRatio>.995,'The entire carriage is visible mid-track');assert.deepEqual(motion.hiddenAtLoopEnds,[false,false,false]);
 for(const tree of motion.treeDisplacements)assert.ok(tree.range>=3,'Foliage moves at least three native pixels peak-to-peak: '+JSON.stringify(tree));
 fs.writeFileSync(path.join(out,'hotel-trees-motion-strip.png'),Buffer.from(motion.strip.split(',')[1],'base64'));delete motion.strip;fs.writeFileSync(path.join(out,'hotel-motion-geometry.json'),JSON.stringify(motion,null,2));
 await page.evaluate(()=>{const img=new Image();img.src='/assets/sentence-structure/hotel/reference.png';img.style.cssText='position:absolute;inset:0;width:1402px;height:1122px';document.body.append(img);return img.decode();});
 await page.screenshot({path:path.join(out,'hotel-train-reference.png'),clip:{x:1190,y:170,width:212,height:245}});
 await page.evaluate(()=>{artRig.rig.destroy();artRig.fx.destroy();});
 fs.writeFileSync(path.join(out,'hotel-art-qa.json'),JSON.stringify({...result,poses},null,2));console.log(JSON.stringify(result));
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{await browser?.close();server.close();});
