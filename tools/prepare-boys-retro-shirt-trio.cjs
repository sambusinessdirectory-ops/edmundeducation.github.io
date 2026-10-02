// Build six independently registered top-slot overlays from the approved-style
// Eddy/Noir fitting references. Generated character sheets are fitting guides;
// only garment-coloured pixels inside the upper-body band can reach runtime.
const fs=require('fs'),path=require('path');
const sharp=require(process.env.HOME+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');

const root=path.resolve(__dirname,'..');
const sourceDir=path.join(root,'tools/mascot-art/wardrobe/boys-retro-shirt-trio');
const mascotDir=path.join(root,'assets/speaking-system/mascots/v4');
const W=1024,H=1024,CELL=256;
const characters={eddy:'eddy-standing.png',noir:'noir-standing.png'};
const garments={
 'black-ivory-retro-bowling-shirt':{
  signature:(r,g,b)=>ivory(r,g,b)||red(r,g,b),
  palette:(r,g,b)=>dark(r,g,b)||ivory(r,g,b)||red(r,g,b)
 },
 'burgundy-hot-rod-bowling-shirt':{
  signature:(r,g,b)=>burgundy(r,g,b),
  palette:(r,g,b)=>burgundy(r,g,b)||dark(r,g,b)||creamInk(r,g,b)
 },
 'ivory-black-flame-shirt':{
  signature:(r,g,b)=>ivory(r,g,b),
  palette:(r,g,b)=>ivory(r,g,b)||dark(r,g,b)
 }
};

function dark(r,g,b){return Math.max(r,g,b)<=105&&Math.max(r,g,b)-Math.min(r,g,b)<=67;}
function ivory(r,g,b){return r>=126&&g>=119&&b>=100&&Math.max(r,g,b)-Math.min(r,g,b)<=72;}
function red(r,g,b){return r>=72&&r>=g*1.32&&r>=b*1.20;}
function burgundy(r,g,b){return r>=54&&r>=g*1.23&&r>=b*1.10&&g<=115;}
function creamInk(r,g,b){return r>=118&&g>=99&&b>=78&&r-b<=105;}

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

function difference(a,b,i){return Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2]);}

function extractCell(fit,base,cell,character,garment,config){
 const ox=cell%4*CELL,oy=Math.floor(cell/4)*CELL;
 const baseBox=alphaBounds(base,cell),fitBox=alphaBounds(fit,cell);
 const y0=Math.max(94,fitBox.minY+Math.round(fitBox.height*.39));
 const y1=Math.min(211,fitBox.minY+Math.round(fitBox.height*.84));
 const x0=Math.max(28,fitBox.minX-2),x1=Math.min(228,fitBox.maxX+2);
 const signature=new Uint8Array(CELL*CELL),candidate=new Uint8Array(CELL*CELL);
 for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
  const i=((oy+y)*W+ox+x)*4,r=fit[i],g=fit[i+1],b=fit[i+2],a=fit[i+3];if(a<28)continue;
  const d=difference(fit,base,i),baseDark=dark(base[i],base[i+1],base[i+2]);
  const isDark=dark(r,g,b),protectNaturalDark=isDark&&baseDark&&d<125;
  if(config.palette(r,g,b)&&d>=18&&!protectNaturalDark)candidate[y*CELL+x]=255;
  if(config.signature(r,g,b)&&d>=18)signature[y*CELL+x]=255;
 }
 const core=new Uint8Array(CELL*CELL);
 for(const part of components(signature,CELL,CELL)){
  const box=bounds(part),torso=box&&box.maxY>=128&&box.minY<=202&&box.centerX>=72&&box.centerX<=184;
  if(part.length>=5&&torso)for(const q of part)core[q]=255;
 }
 const nearCore=dilate(core,CELL,CELL,4),mask=new Uint8Array(CELL*CELL);
 for(const part of components(candidate,CELL,CELL)){
  const box=bounds(part),touches=part.some(q=>nearCore[q]),torso=box&&box.maxY>=130&&box.minY<=205;
  if(touches&&torso)for(const q of part)mask[q]=255;
 }
 // Retain small buttons, piping and printed details nested inside the shirt.
 const garmentNear=dilate(mask,CELL,CELL,5);
 for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
  const q=y*CELL+x;if(!garmentNear[q])continue;
  const i=((oy+y)*W+ox+x)*4;if(fit[i+3]>=24&&config.palette(fit[i],fit[i+1],fit[i+2])&&difference(fit,base,i)>=16)mask[q]=255;
 }
 const softened=dilate(mask,CELL,CELL,1),finalMask=new Uint8Array(CELL*CELL);
 for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
  const q=y*CELL+x,i=((oy+y)*W+ox+x)*4;
  if(mask[q]||(softened[q]&&fit[i+3]>=24&&difference(fit,base,i)>=35))finalMask[q]=255;
 }
 const points=[];for(let q=0;q<finalMask.length;q++)if(finalMask[q])points.push(q);
 const box=bounds(points);if(points.length<300||!box||box.maxY>212)throw Error(character+' '+garment+' cell '+cell+': invalid garment extraction '+points.length);
 const baseCenter=(baseBox.minX+baseBox.maxX)/2,fitCenter=(fitBox.minX+fitBox.maxX)/2;
 const dx=Math.max(-5,Math.min(5,Math.round(baseCenter-fitCenter)));
 const dy=Math.max(-5,Math.min(5,baseBox.maxY-fitBox.maxY));
 const out=Buffer.alloc(CELL*CELL*4);let copied=0;
 for(const q of points){const x=q%CELL,y=Math.floor(q/CELL),tx=x+dx,ty=y+dy;if(tx<0||tx>=CELL||ty<0||ty>=CELL)continue;const src=((oy+y)*W+ox+x)*4,dst=(ty*CELL+tx)*4;fit.copy(out,dst,src,src+4);copied++;}
 return {out,pixels:copied,box,dx,dy};
}

function placeCell(atlas,cell,cellPixels){
 const ox=cell%4*CELL,oy=Math.floor(cell/4)*CELL;
 for(let y=0;y<CELL;y++)for(let x=0;x<CELL;x++){const src=(y*CELL+x)*4;if(!cellPixels[src+3])continue;const dst=((oy+y)*W+ox+x)*4;cellPixels.copy(atlas,dst,src,src+4);}
}

(async()=>{
 for(const [garment,config] of Object.entries(garments))for(const [character,baseName] of Object.entries(characters)){
  const base=await sharp(path.join(mascotDir,baseName)).resize(W,H,{fit:'fill'}).ensureAlpha().raw().toBuffer();
  const fit=await sharp(path.join(sourceDir,character+'-'+garment+'-fit.png')).resize(W,H,{fit:'fill',kernel:'lanczos3'}).ensureAlpha().raw().toBuffer();
  const overlay=Buffer.alloc(W*H*4);let total=0;
  for(let cell=0;cell<16;cell++){
   const result=extractCell(fit,base,cell,character,garment,config);placeCell(overlay,cell,result.out);total+=result.pixels;
   console.log(garment,character,'cell',cell,'pixels',result.pixels,'box',result.box.minX+','+result.box.minY+'-'+result.box.maxX+','+result.box.maxY,'shift',result.dx+','+result.dy);
  }
  if(total<7000)throw Error(character+' '+garment+': overlay unexpectedly sparse '+total);
  const assetDir=path.join(root,'assets/speaking-system/cosmetics',character);fs.mkdirSync(assetDir,{recursive:true});
  await sharp(overlay,{raw:{width:W,height:H,channels:4}}).webp({lossless:true}).toFile(path.join(assetDir,garment+'.webp'));
  await sharp(overlay,{raw:{width:W,height:H,channels:4}}).png().toFile(path.join(sourceDir,character+'-'+garment+'-item-source.png'));
  await sharp(base,{raw:{width:W,height:H,channels:4}}).composite([{input:overlay,raw:{width:W,height:H,channels:4}}]).flatten({background:'#292421'}).jpeg({quality:95}).toFile(path.join(sourceDir,'qa-'+character+'-'+garment+'-dark-flat.jpg'));
 }
 const shared=path.join(root,'assets/speaking-system/cosmetics/shared');fs.mkdirSync(shared,{recursive:true});
 for(const garment of Object.keys(garments))await sharp(path.join(sourceDir,garment+'-display.png')).resize({width:512,height:512,fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).png().toFile(path.join(shared,garment+'-display.png'));
})().catch(error=>{console.error(error);process.exitCode=1;});
