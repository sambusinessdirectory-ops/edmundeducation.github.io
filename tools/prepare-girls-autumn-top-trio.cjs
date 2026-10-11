// Build nine independent girlsTop overlays from generated fitting references.
// The fitting character is a guide only: palette, canonical-difference,
// seed-connected, guide-envelope and slot-boundary gates keep anatomy out.
const fs=require('node:fs'),path=require('node:path');
const sharp=require(process.env.HOME+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');

const root=path.resolve(__dirname,'..');
const sourceDir=path.join(root,'tools/mascot-art/wardrobe/girls-autumn-top-trio');
const mascotDir=path.join(root,'assets/speaking-system/mascots/v4');
const W=1024,H=1024,CELL=256;
const characters={celeste:'celeste-standing.png',phoebe:'phoebe-standing.png',elsie:'elsie-standing.png'};
const guideIds=['cream-sherpa-jacket'];
const ivory=(r,g,b)=>r>=125&&g>=112&&b>=94&&Math.max(r,g,b)-Math.min(r,g,b)<=78;
const brown=(r,g,b)=>r>=46&&r<=190&&g>=26&&g<=135&&b>=18&&b<=115&&r>=g*1.12&&g>=b*.92;
const rose=(r,g,b)=>r>=105&&r<=245&&g>=52&&g<=190&&b>=62&&b<=195&&r>=g*1.12&&r>=b*1.08;
const metal=(r,g,b)=>Math.max(r,g,b)-Math.min(r,g,b)<=34&&r>=70&&r<=205;
const darkNeutral=(r,g,b)=>Math.max(r,g,b)<=95&&Math.max(r,g,b)-Math.min(r,g,b)<=42;
const garments={
 'ivory-bow-neck-blouse':{signature:ivory,palette:ivory,close:2,min:6400},
 'brown-zip-front-jacket':{signature:brown,palette:brown,detail:metal,close:2,min:6200},
 'dusty-rose-oversized-sweatshirt':{signature:rose,palette:(r,g,b)=>rose(r,g,b)&&r-g>=20,close:3,min:6800}
};

function components(mask,w,h){
 const seen=new Uint8Array(mask.length),all=[];
 for(let p=0;p<mask.length;p++)if(mask[p]&&!seen[p]){
  const todo=[p];seen[p]=1;
  for(let i=0;i<todo.length;i++){
   const q=todo[i],x=q%w,y=Math.floor(q/w);
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
    if(!dx&&!dy)continue;const nx=x+dx,ny=y+dy,n=ny*w+nx;
    if(nx>=0&&nx<w&&ny>=0&&ny<h&&mask[n]&&!seen[n]){seen[n]=1;todo.push(n);}
   }
  }
  all.push(todo);
 }
 return all;
}
function dilate(mask,w,h,radius){
 let current=Uint8Array.from(mask);
 for(let pass=0;pass<radius;pass++){
  const next=Uint8Array.from(current);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const p=y*w+x;if(current[p])continue;
   for(let dy=-1;dy<=1&&!next[p];dy++)for(let dx=-1;dx<=1;dx++){
    const nx=x+dx,ny=y+dy;if(nx>=0&&nx<w&&ny>=0&&ny<h&&current[ny*w+nx]){next[p]=255;break;}
   }
  }
  current=next;
 }
 return current;
}
function erode(mask,w,h,radius){
 let current=Uint8Array.from(mask);
 for(let pass=0;pass<radius;pass++){
  const next=new Uint8Array(current.length);
  for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){
   const p=y*w+x;if(!current[p])continue;let keep=true;
   for(let dy=-1;dy<=1&&keep;dy++)for(let dx=-1;dx<=1;dx++)if(!current[(y+dy)*w+x+dx]){keep=false;break;}
   if(keep)next[p]=255;
  }
  current=next;
 }
 return current;
}
function bounds(points,w=CELL){
 let minX=w,minY=w,maxX=-1,maxY=-1;
 for(const q of points){const x=q%w,y=Math.floor(q/w);minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);}
 return maxX<0?null:{minX,minY,maxX,maxY,width:maxX-minX+1,height:maxY-minY+1,centerX:(minX+maxX)/2};
}
function largestAlphaBounds(pixels,cell){
 const ox=cell%4*CELL,oy=Math.floor(cell/4)*CELL,mask=new Uint8Array(CELL*CELL);
 for(let y=0;y<CELL;y++)for(let x=0;x<CELL;x++)if(pixels[((oy+y)*W+ox+x)*4+3]>=24)mask[y*CELL+x]=255;
 const parts=components(mask,CELL,CELL).sort((a,b)=>b.length-a.length),box=bounds(parts[0]||[]);
 if(!box)throw Error('cell '+cell+': character alpha not found');return box;
}
const delta=(a,b,i)=>Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2]);
function extractCell(fit,base,guide,cell,character,garment,config){
 const ox=cell%4*CELL,oy=Math.floor(cell/4)*CELL,baseBox=largestAlphaBounds(base,cell),fitBox=largestAlphaBounds(fit,cell);
 const dx=Math.max(-6,Math.min(6,Math.round((baseBox.minX+baseBox.maxX-fitBox.minX-fitBox.maxX)/2)));
 const dy=Math.max(-6,Math.min(6,baseBox.maxY-fitBox.maxY));
 const y0=Math.max(78,fitBox.minY+dy+Math.round(fitBox.height*.26)),y1=Math.min(213,fitBox.minY+dy+Math.round(fitBox.height*.86));
 const x0=Math.max(22,fitBox.minX+dx-6),x1=Math.min(234,fitBox.maxX+dx+6);
 const signature=new Uint8Array(CELL*CELL),candidate=new Uint8Array(CELL*CELL);
 for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
  const sx=x-dx,sy=y-dy;if(sx<0||sx>=CELL||sy<0||sy>=CELL)continue;
  const p=y*CELL+x,i=((oy+sy)*W+ox+sx)*4,bi=((oy+y)*W+ox+x)*4;if(fit[i+3]<24||!guide[p])continue;
  const d=Math.abs(fit[i]-base[bi])+Math.abs(fit[i+1]-base[bi+1])+Math.abs(fit[i+2]-base[bi+2]),r=fit[i],g=fit[i+1],b=fit[i+2];
  if(config.palette(r,g,b)&&d>=16)candidate[p]=255;
  if(config.signature(r,g,b)&&d>=22)signature[p]=255;
 }
 const core=new Uint8Array(CELL*CELL);
 for(const part of components(signature,CELL,CELL)){
  const box=bounds(part),torso=box&&box.maxY>=118&&box.minY<=200&&box.centerX>=55&&box.centerX<=201;
  if(part.length>=4&&torso)for(const q of part)core[q]=255;
 }
 const nearCore=dilate(core,CELL,CELL,10),mask=new Uint8Array(CELL*CELL);
 for(const part of components(candidate,CELL,CELL)){
  const box=bounds(part),touches=part.some(q=>nearCore[q]);
  if(box&&touches&&box.maxY>=115&&box.minY<=210&&part.length>=2)for(const q of part)mask[q]=255;
 }
 let near=dilate(mask,CELL,CELL,8);
 if(config.detail){
  const details=new Uint8Array(CELL*CELL);
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
   const sx=x-dx,sy=y-dy;if(sx<0||sx>=CELL||sy<0||sy>=CELL)continue;
   const p=y*CELL+x,i=((oy+sy)*W+ox+sx)*4,bi=((oy+y)*W+ox+x)*4,d=Math.abs(fit[i]-base[bi])+Math.abs(fit[i+1]-base[bi+1])+Math.abs(fit[i+2]-base[bi+2]);
   if(near[p]&&guide[p]&&fit[i+3]>=24&&config.detail(fit[i],fit[i+1],fit[i+2])&&d>=14)details[p]=255;
  }
  for(const part of components(details,CELL,CELL))if(part.length>=2&&part.length<=1000)for(const q of part)mask[q]=255;
 }
 near=dilate(mask,CELL,CELL,3);
 for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
  const sx=x-dx,sy=y-dy;if(sx<0||sx>=CELL||sy<0||sy>=CELL)continue;
  const p=y*CELL+x,i=((oy+sy)*W+ox+sx)*4,bi=((oy+y)*W+ox+x)*4,d=Math.abs(fit[i]-base[bi])+Math.abs(fit[i+1]-base[bi+1])+Math.abs(fit[i+2]-base[bi+2]);
  if(near[p]&&guide[p]&&fit[i+3]>=24&&config.palette(fit[i],fit[i+1],fit[i+2])&&d>=12)mask[p]=255;
 }
 const closed=erode(dilate(mask,CELL,CELL,config.close),CELL,CELL,config.close),soft=dilate(mask,CELL,CELL,1),finalMask=new Uint8Array(CELL*CELL);
 for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
  const sx=x-dx,sy=y-dy;if(sx<0||sx>=CELL||sy<0||sy>=CELL)continue;
  const p=y*CELL+x,i=((oy+sy)*W+ox+sx)*4,bi=((oy+y)*W+ox+x)*4,d=Math.abs(fit[i]-base[bi])+Math.abs(fit[i+1]-base[bi+1])+Math.abs(fit[i+2]-base[bi+2]);
  if(guide[p]&&(mask[p]||closed[p]||(soft[p]&&fit[i+3]>=24&&d>=28)))finalMask[p]=255;
 }
 const points=[];for(let p=0;p<finalMask.length;p++)if(finalMask[p])points.push(p);
 const box=bounds(points);if(points.length<260||!box||box.maxY>213)throw Error(character+' '+garment+' cell '+cell+': invalid extraction '+points.length);
 const out=Buffer.alloc(CELL*CELL*4);let copied=0;
 for(const p of points){const x=p%CELL,y=Math.floor(p/CELL),sx=x-dx,sy=y-dy;if(sx<0||sx>=CELL||sy<0||sy>=CELL||y>=214)continue;const src=((oy+sy)*W+ox+sx)*4,dst=(y*CELL+x)*4;fit.copy(out,dst,src,src+4);copied++;}
 return {out,pixels:copied,box,dx,dy};
}
function extractItemCell(item,guide,cell,character,garment,config){
 const ox=cell%4*CELL,oy=Math.floor(cell/4)*CELL,candidate=new Uint8Array(CELL*CELL);
 for(let y=72;y<214;y++)for(let x=18;x<238;x++){
  const p=y*CELL+x,i=((oy+y)*W+ox+x)*4;
  if(item[i+3]>=24&&config.palette(item[i],item[i+1],item[i+2]))candidate[p]=255;
 }
 const mask=new Uint8Array(CELL*CELL);
 for(const part of components(candidate,CELL,CELL)){
  const box=bounds(part),valid=box&&box.minY<205&&box.maxY>100&&box.centerX>=34&&box.centerX<=222;
  if(valid&&part.length>=80)for(const p of part)mask[p]=255;
 }
 if(config.detail){
  const near=dilate(mask,CELL,CELL,8),detailMask=new Uint8Array(CELL*CELL);
  for(let y=72;y<214;y++)for(let x=18;x<238;x++){
   const p=y*CELL+x,i=((oy+y)*W+ox+x)*4;
   if(near[p]&&item[i+3]>=24&&config.detail(item[i],item[i+1],item[i+2]))detailMask[p]=255;
  }
  for(const part of components(detailMask,CELL,CELL))if(part.length>=2&&part.length<=450)for(const p of part)mask[p]=255;
 }
 const itemPoints=[];for(let p=0;p<mask.length;p++)if(mask[p])itemPoints.push(p);
 const itemBox=bounds(itemPoints),guidePoints=[];for(let p=0;p<guide.length;p++)if(guide[p])guidePoints.push(p);
 const guideBox=bounds(guidePoints);if(!itemBox||!guideBox)throw Error(character+' '+garment+' cell '+cell+': empty item or guide');
 const dx=Math.max(-6,Math.min(6,Math.round(guideBox.centerX-itemBox.centerX)));
 const dy=Math.max(-6,Math.min(6,guideBox.maxY-itemBox.maxY));
 // Preserve the already validated character-depth cutouts: muzzle, mane, tail
 // and hoof-hands must remain in front of top-slot garments.
 const allowed=dilate(guide,CELL,CELL,2),out=Buffer.alloc(CELL*CELL*4);let copied=0;
 for(const p of itemPoints){
  const x=p%CELL,y=Math.floor(p/CELL),tx=x+dx,ty=y+dy;if(tx<0||tx>=CELL||ty<0||ty>=214||!allowed[ty*CELL+tx])continue;
  const src=((oy+y)*W+ox+x)*4,dst=(ty*CELL+tx)*4;item.copy(out,dst,src,src+4);copied++;
 }
 if(copied<260)throw Error(character+' '+garment+' cell '+cell+': sparse item-only extraction '+copied);
 return {out,pixels:copied,box:itemBox,dx,dy};
}
function placeCell(atlas,cell,src){
 const ox=cell%4*CELL,oy=Math.floor(cell/4)*CELL;
 for(let y=0;y<CELL;y++)for(let x=0;x<CELL;x++){const s=(y*CELL+x)*4;if(!src[s+3])continue;const d=((oy+y)*W+ox+x)*4;src.copy(atlas,d,s,s+4);}
}
function padTransparentRgb(atlas){
 for(let cell=0;cell<16;cell++){
  const ox=cell%4*CELL,oy=Math.floor(cell/4)*CELL;
  for(let pass=0;pass<3;pass++){
   const source=Buffer.from(atlas);
   for(let y=1;y<CELL-1;y++)for(let x=1;x<CELL-1;x++){
    const p=((oy+y)*W+ox+x)*4;if(source[p+3])continue;let n=0,r=0,g=0,b=0;
    for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]]){const q=((oy+y+dy)*W+ox+x+dx)*4;if(source[q+3]){r+=source[q];g+=source[q+1];b+=source[q+2];n++;}}
    if(n){atlas[p]=Math.round(r/n);atlas[p+1]=Math.round(g/n);atlas[p+2]=Math.round(b/n);}
   }
  }
 }
}
async function guideMask(character){
 const mask=new Uint8Array(W*H);
 for(const id of guideIds){
  const file=path.join(root,'assets/speaking-system/cosmetics',character,id+'.webp');if(!fs.existsSync(file))continue;
  const pixels=await sharp(file).ensureAlpha().raw().toBuffer();
  const accepts=(r,g,b)=>id==='pink-rain-jacket'
   ? rose(r,g,b)
   : id==='navy-cream-knit-vest'
    ? (ivory(r,g,b)||(b>=42&&b>=r*1.12&&b>=g*1.04&&r<=110&&g<=120))
    : ivory(r,g,b);
  for(let cell=0;cell<16;cell++){
   const ox=cell%4*CELL,oy=Math.floor(cell/4)*CELL,local=new Uint8Array(CELL*CELL);
   for(let y=70;y<214;y++)for(let x=16;x<240;x++){
    const p=((oy+y)*W+ox+x)*4;if(pixels[p+3]>=24&&accepts(pixels[p],pixels[p+1],pixels[p+2]))local[y*CELL+x]=255;
   }
   for(const part of components(local,CELL,CELL)){
    const box=bounds(part),thinSmear=box&&box.width>140&&box.height<14;
    if(box&&part.length>=24&&!thinSmear&&box.maxY>95&&box.minY<214)for(const q of part){const x=q%CELL,y=Math.floor(q/CELL);mask[(oy+y)*W+ox+x]=255;}
   }
  }
 }
 const out=new Uint8Array(W*H);
 for(let cell=0;cell<16;cell++){
  const ox=cell%4*CELL,oy=Math.floor(cell/4)*CELL,local=new Uint8Array(CELL*CELL);
  for(let y=0;y<CELL;y++)for(let x=0;x<CELL;x++)local[y*CELL+x]=mask[(oy+y)*W+ox+x];
  // V5 anatomy-safety rule: stay very close to already validated top-slot
  // silhouettes. A wide envelope lets pale mane/body pixels into ivory items.
  const expanded=dilate(local,CELL,CELL,2);
  for(let y=0;y<CELL;y++)for(let x=0;x<CELL;x++)out[(oy+y)*W+ox+x]=expanded[y*CELL+x];
 }
 return out;
}
(async()=>{
 for(const [garment,config] of Object.entries(garments))for(const [character,baseName] of Object.entries(characters)){
  const base=await sharp(path.join(mascotDir,baseName)).resize(W,H,{fit:'fill'}).ensureAlpha().raw().toBuffer();
  const item=await sharp(path.join(sourceDir,character+'-'+garment+'-item-guide.png')).resize(W,H,{fit:'fill',kernel:'lanczos3'}).ensureAlpha().raw().toBuffer();
  const globalGuide=await guideMask(character),overlay=Buffer.alloc(W*H*4);let total=0;
  for(let cell=0;cell<16;cell++){
   const ox=cell%4*CELL,oy=Math.floor(cell/4)*CELL,guide=new Uint8Array(CELL*CELL);
   for(let y=0;y<CELL;y++)for(let x=0;x<CELL;x++)guide[y*CELL+x]=globalGuide[(oy+y)*W+ox+x];
   const result=extractItemCell(item,guide,cell,character,garment,config);placeCell(overlay,cell,result.out);total+=result.pixels;
   console.log(garment,character,'cell',cell,'pixels',result.pixels,'box',result.box.minX+','+result.box.minY+'-'+result.box.maxX+','+result.box.maxY,'shift',result.dx+','+result.dy);
  }
  if(total<config.min)throw Error(character+' '+garment+': overlay unexpectedly sparse '+total);
  padTransparentRgb(overlay);
  const assetDir=path.join(root,'assets/speaking-system/cosmetics',character);fs.mkdirSync(assetDir,{recursive:true});
  await sharp(overlay,{raw:{width:W,height:H,channels:4}}).webp({lossless:true}).toFile(path.join(assetDir,garment+'.webp'));
  await sharp(overlay,{raw:{width:W,height:H,channels:4}}).png().toFile(path.join(sourceDir,character+'-'+garment+'-item-source.png'));
  await sharp(base,{raw:{width:W,height:H,channels:4}}).composite([{input:overlay,raw:{width:W,height:H,channels:4}}]).flatten({background:'#292421'}).jpeg({quality:95}).toFile(path.join(sourceDir,'qa-'+character+'-'+garment+'-dark-flat.jpg'));
 }
 const shared=path.join(root,'assets/speaking-system/cosmetics/girls');fs.mkdirSync(shared,{recursive:true});
 for(const garment of Object.keys(garments))await sharp(path.join(sourceDir,garment+'-design.png')).resize(512,512,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).png().toFile(path.join(shared,garment+'-display.png'));
})().catch(error=>{console.error(error);process.exitCode=1;});
