// Build six independently registered top-slot overlays from the Eddy and Noir
// fitting references. Generated bodies are guides only: garment-coloured pixels
// inside the upper-body band are the only pixels allowed into runtime assets.
const fs=require('node:fs'),path=require('node:path');
const sharp=require(process.env.HOME+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');

const root=path.resolve(__dirname,'..');
const sourceDir=path.join(root,'tools/mascot-art/wardrobe/boys-smart-casual-trio');
const mascotDir=path.join(root,'assets/speaking-system/mascots/v4');
const W=1024,H=1024,CELL=256;
const characters={eddy:'eddy-standing.png',noir:'noir-standing.png'};

const neutral=(r,g,b,low=0,high=255,spread=64)=>Math.min(r,g,b)>=low&&Math.max(r,g,b)<=high&&Math.max(r,g,b)-Math.min(r,g,b)<=spread;
const light=(r,g,b)=>neutral(r,g,b,100,255,82);
const dark=(r,g,b)=>neutral(r,g,b,0,108,64);
const black=(r,g,b)=>neutral(r,g,b,0,88,22);
const navy=(r,g,b)=>b>=42&&b>=r*1.12&&b>=g*1.04&&r<=105&&g<=112;
const brass=(r,g,b)=>r>=75&&g>=44&&b<=66&&r>=g*1.12&&g>=b*1.15;
const silver=(r,g,b)=>neutral(r,g,b,88,205,36);

const garments={
 'white-shirt-black-tie':{
  signature:(r,g,b)=>light(r,g,b),
  palette:(r,g,b)=>light(r,g,b),
  detail:(r,g,b)=>black(r,g,b)||silver(r,g,b),
  detailRadius:12,
  detailLimit:1400,
  detailAccept:(box,mainBox)=>box.width<=48&&box.centerX>=mainBox.minX+mainBox.width*.24&&box.centerX<=mainBox.maxX-mainBox.width*.18&&box.minY>=mainBox.minY-2&&box.maxY<=mainBox.maxY+1,
  closeRadius:2
 },
 'black-v-neck-collar-sweater':{
  signature:(r,g,b)=>black(r,g,b)||light(r,g,b),
  palette:(r,g,b)=>black(r,g,b)||light(r,g,b)||silver(r,g,b),
  closeRadius:3
 },
 'navy-blazer-cream-sweatshirt':{
  signature:(r,g,b)=>navy(r,g,b),
  palette:(r,g,b)=>navy(r,g,b)||light(r,g,b),
  detail:(r,g,b)=>brass(r,g,b),
  detailRadius:8,
  detailLimit:350,
  detailAccept:(box,mainBox)=>box.width<=18&&box.height<=18&&box.centerX>=mainBox.minX+mainBox.width*.22&&box.centerX<=mainBox.maxX-mainBox.width*.18&&box.minY>=mainBox.minY+20&&box.maxY<=mainBox.maxY-5,
  closeRadius:2
 }
};

function components(mask,w,h){
 const seen=new Uint8Array(mask.length),found=[];
 for(let p=0;p<mask.length;p++)if(mask[p]&&!seen[p]){
  const todo=[p];seen[p]=1;
  for(let i=0;i<todo.length;i++){
   const q=todo[i],x=q%w,y=Math.floor(q/w);
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
    if(!dx&&!dy)continue;const nx=x+dx,ny=y+dy,n=ny*w+nx;
    if(nx>=0&&nx<w&&ny>=0&&ny<h&&mask[n]&&!seen[n]){seen[n]=1;todo.push(n);}
   }
  }
  found.push(todo);
 }
 return found;
}

function dilate(mask,w,h,radius){
 let current=Uint8Array.from(mask);
 for(let pass=0;pass<radius;pass++){
  const next=Uint8Array.from(current);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const p=y*w+x;if(current[p])continue;
   for(let dy=-1;dy<=1&&!next[p];dy++)for(let dx=-1;dx<=1;dx++){
    const nx=x+dx,ny=y+dy;
    if(nx>=0&&nx<w&&ny>=0&&ny<h&&current[ny*w+nx]){next[p]=255;break;}
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

function alphaBounds(pixels,cell){
 const ox=cell%4*CELL,oy=Math.floor(cell/4)*CELL,points=[];
 for(let y=0;y<CELL;y++)for(let x=0;x<CELL;x++)if(pixels[((oy+y)*W+ox+x)*4+3]>=24)points.push(y*CELL+x);
 const box=bounds(points);if(!box)throw Error('cell '+cell+': character alpha not found');return box;
}

const difference=(a,b,i)=>Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2]);

function extractCell(fit,base,cell,character,garment,config){
 const ox=cell%4*CELL,oy=Math.floor(cell/4)*CELL;
 const baseBox=alphaBounds(base,cell),fitBox=alphaBounds(fit,cell);
 const y0=Math.max(90,fitBox.minY+Math.round(fitBox.height*.35));
 const y1=Math.min(212,fitBox.minY+Math.round(fitBox.height*.85));
 const x0=Math.max(26,fitBox.minX-3),x1=Math.min(230,fitBox.maxX+3);
 const signature=new Uint8Array(CELL*CELL),candidate=new Uint8Array(CELL*CELL);
 for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
  const i=((oy+y)*W+ox+x)*4,r=fit[i],g=fit[i+1],b=fit[i+2],a=fit[i+3];if(a<24)continue;
  const delta=difference(fit,base,i),baseDark=dark(base[i],base[i+1],base[i+2]),isDark=dark(r,g,b);
  const preserveNaturalDark=isDark&&baseDark&&delta<(config.naturalDarkDelta||70);
  if(config.palette(r,g,b,x,y)&&delta>=18&&!preserveNaturalDark)candidate[y*CELL+x]=255;
  if(config.signature(r,g,b,x,y)&&delta>=22&&!preserveNaturalDark)signature[y*CELL+x]=255;
 }
 const core=new Uint8Array(CELL*CELL);
 for(const part of components(signature,CELL,CELL)){
  const box=bounds(part),torso=box&&box.maxY>=118&&box.minY<=202&&box.centerX>=62&&box.centerX<=194;
  if(part.length>=4&&torso)for(const q of part)core[q]=255;
 }
 const nearCore=dilate(core,CELL,CELL,8),mask=new Uint8Array(CELL*CELL);
 for(const part of components(candidate,CELL,CELL)){
  const box=bounds(part),touches=part.some(q=>nearCore[q]),torso=box&&box.maxY>=118&&box.minY<=210;
  if(touches&&torso&&part.length>=2)for(const q of part)mask[q]=255;
 }
 // Keep nested details such as tie bars, buttons, pocket squares and lapel edges.
 const garmentNear=dilate(mask,CELL,CELL,config.detailRadius||5);
 const mainPoints=[];for(let q=0;q<mask.length;q++)if(mask[q])mainPoints.push(q);
 const mainBox=bounds(mainPoints);
 if(config.detail&&mainBox){
  const detailCandidate=new Uint8Array(CELL*CELL);
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
   const q=y*CELL+x,i=((oy+y)*W+ox+x)*4;
   if(fit[i+3]>=24&&config.detail(fit[i],fit[i+1],fit[i+2],x,y)&&difference(fit,base,i)>=14)detailCandidate[q]=255;
  }
  for(const part of components(detailCandidate,CELL,CELL)){
   const box=bounds(part),inside=part.filter(q=>garmentNear[q]).length/part.length;
   const bounded=box&&box.minY>=mainBox.minY-4&&box.maxY<=mainBox.maxY+3&&box.centerX>=mainBox.minX-4&&box.centerX<=mainBox.maxX+4;
   const accepted=!config.detailAccept||config.detailAccept(box,mainBox,part);
   if(part.length>=2&&part.length<=(config.detailLimit||600)&&inside>=.75&&bounded&&accepted)for(const q of part)mask[q]=255;
  }
 }
 // Retain palette-coloured texture and seam pixels immediately beside the
 // accepted garment while refusing unrelated mane, muzzle, tail and body parts.
 for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
  const q=y*CELL+x;if(!garmentNear[q])continue;const i=((oy+y)*W+ox+x)*4;
  if(fit[i+3]>=24&&config.palette(fit[i],fit[i+1],fit[i+2],x,y)&&difference(fit,base,i)>=14)mask[q]=255;
 }
 // Close only one-pixel cracks in fabric. Larger anatomy and intended openings
 // remain protected by the fitted silhouette and the palette constraint below.
 const closeRadius=config.closeRadius||1;
 const closed=erode(dilate(mask,CELL,CELL,closeRadius),CELL,CELL,closeRadius);
 for(let q=0;q<mask.length;q++)if(closed[q]){
  const x=q%CELL,y=Math.floor(q/CELL),i=((oy+y)*W+ox+x)*4;
  if(config.palette(fit[i],fit[i+1],fit[i+2],x,y)||(config.detail&&config.detail(fit[i],fit[i+1],fit[i+2],x,y)))mask[q]=255;
 }
 const softened=dilate(mask,CELL,CELL,1),finalMask=new Uint8Array(CELL*CELL);
 for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
  const q=y*CELL+x,i=((oy+y)*W+ox+x)*4;
  if(mask[q]||(softened[q]&&fit[i+3]>=24&&difference(fit,base,i)>=30&&config.palette(fit[i],fit[i+1],fit[i+2],x,y)))finalMask[q]=255;
 }
 const points=[];for(let q=0;q<finalMask.length;q++)if(finalMask[q])points.push(q);
 const box=bounds(points);if(points.length<260||!box||box.maxY>213)throw Error(character+' '+garment+' cell '+cell+': invalid garment extraction '+points.length);
 const dx=Math.max(-6,Math.min(6,Math.round((baseBox.minX+baseBox.maxX-fitBox.minX-fitBox.maxX)/2)));
 const dy=Math.max(-6,Math.min(6,baseBox.maxY-fitBox.maxY));
 const out=Buffer.alloc(CELL*CELL*4);let copied=0;
 for(const q of points){const x=q%CELL,y=Math.floor(q/CELL),tx=x+dx,ty=y+dy;if(tx<0||tx>=CELL||ty<0||ty>=CELL)continue;const src=((oy+y)*W+ox+x)*4,dst=(ty*CELL+tx)*4;fit.copy(out,dst,src,src+4);copied++;}
 return {out,pixels:copied,box,dx,dy};
}

function placeCell(atlas,cell,cellPixels){
 const ox=cell%4*CELL,oy=Math.floor(cell/4)*CELL;
 for(let y=0;y<CELL;y++)for(let x=0;x<CELL;x++){const src=(y*CELL+x)*4;if(!cellPixels[src+3])continue;const dst=((oy+y)*W+ox+x)*4;cellPixels.copy(atlas,dst,src,src+4);}
}

function padTransparentRgb(atlas){
 for(let cell=0;cell<16;cell++){
  const ox=cell%4*CELL,oy=Math.floor(cell/4)*CELL;
  for(let pass=0;pass<3;pass++){
   const source=Buffer.from(atlas);
   for(let y=1;y<CELL-1;y++)for(let x=1;x<CELL-1;x++){
    const p=((oy+y)*W+ox+x)*4;if(source[p+3])continue;
    let count=0,r=0,g=0,b=0;
    for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]]){const n=((oy+y+dy)*W+ox+x+dx)*4;if(source[n+3]){r+=source[n];g+=source[n+1];b+=source[n+2];count++;}}
    if(count){atlas[p]=Math.round(r/count);atlas[p+1]=Math.round(g/count);atlas[p+2]=Math.round(b/count);}
   }
  }
 }
}

function restrictToGuideAtlases(overlay,guides,radius=3){
 for(let cell=0;cell<16;cell++){
  const ox=cell%4*CELL,oy=Math.floor(cell/4)*CELL,guide=new Uint8Array(CELL*CELL);
  for(let y=0;y<CELL;y++)for(let x=0;x<CELL;x++){
   const p=((oy+y)*W+ox+x)*4;
   if(guides.some(buffer=>buffer[p+3]>=24))guide[y*CELL+x]=255;
  }
  const allowed=dilate(guide,CELL,CELL,radius);
  for(let y=0;y<CELL;y++)for(let x=0;x<CELL;x++)if(!allowed[y*CELL+x]){
   const p=((oy+y)*W+ox+x)*4;overlay[p]=overlay[p+1]=overlay[p+2]=overlay[p+3]=0;
  }
 }
}

(async()=>{
 const buildOrder=['white-shirt-black-tie','navy-blazer-cream-sweatshirt','black-v-neck-collar-sweater'];
 for(const garment of buildOrder)for(const [character,baseName] of Object.entries(characters)){
  const config=garments[garment];
  const base=await sharp(path.join(mascotDir,baseName)).resize(W,H,{fit:'fill'}).ensureAlpha().raw().toBuffer();
  const fit=await sharp(path.join(sourceDir,character+'-'+garment+'-fit.png')).resize(W,H,{fit:'fill',kernel:'lanczos3'}).ensureAlpha().raw().toBuffer();
  const overlay=Buffer.alloc(W*H*4);let total=0;
  for(let cell=0;cell<16;cell++){
   const result=extractCell(fit,base,cell,character,garment,config);placeCell(overlay,cell,result.out);total+=result.pixels;
   console.log(garment,character,'cell',cell,'pixels',result.pixels,'box',result.box.minX+','+result.box.minY+'-'+result.box.maxX+','+result.box.maxY,'shift',result.dx+','+result.dy);
  }
  if(total<6200)throw Error(character+' '+garment+': overlay unexpectedly sparse '+total);
  if(garment==='black-v-neck-collar-sweater'){
   const guides=await Promise.all(['white-shirt-black-tie','navy-blazer-cream-sweatshirt'].map(id=>sharp(path.join(root,'assets/speaking-system/cosmetics',character,id+'.webp')).ensureAlpha().raw().toBuffer()));
   restrictToGuideAtlases(overlay,guides,3);
  }
  padTransparentRgb(overlay);
  const assetDir=path.join(root,'assets/speaking-system/cosmetics',character);fs.mkdirSync(assetDir,{recursive:true});
  await sharp(overlay,{raw:{width:W,height:H,channels:4}}).webp({lossless:true}).toFile(path.join(assetDir,garment+'.webp'));
  await sharp(overlay,{raw:{width:W,height:H,channels:4}}).png().toFile(path.join(sourceDir,character+'-'+garment+'-item-source.png'));
  await sharp(base,{raw:{width:W,height:H,channels:4}}).composite([{input:overlay,raw:{width:W,height:H,channels:4}}]).flatten({background:'#292421'}).jpeg({quality:95}).toFile(path.join(sourceDir,'qa-'+character+'-'+garment+'-dark-flat.jpg'));
 }
 const design=sharp(path.join(sourceDir,'design-reference.png'));const meta=await design.metadata();
 const crops={
  'white-shirt-black-tie':{left:0,width:Math.floor(meta.width/3)},
  'black-v-neck-collar-sweater':{left:Math.floor(meta.width/3),width:Math.floor(meta.width/3)},
  'navy-blazer-cream-sweatshirt':{left:Math.floor(meta.width*2/3),width:meta.width-Math.floor(meta.width*2/3)}
 };
 const shared=path.join(root,'assets/speaking-system/cosmetics/shared');fs.mkdirSync(shared,{recursive:true});
 for(const [garment,crop] of Object.entries(crops))await sharp(path.join(sourceDir,'design-reference.png')).extract({left:crop.left,top:0,width:crop.width,height:meta.height}).resize(512,512,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).png().toFile(path.join(shared,garment+'-display.png'));
})().catch(error=>{console.error(error);process.exitCode=1;});
