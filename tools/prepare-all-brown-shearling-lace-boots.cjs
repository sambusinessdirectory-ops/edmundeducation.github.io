// Build character-specific feet-slot overlays from five independently generated
// fitting references. Runtime characters always come from the canonical atlases;
// only the fitted boot pixels extracted here are shipped.
const fs=require('fs'),path=require('path');
const sharp=require(process.env.HOME+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');

const root=path.resolve(__dirname,'..');
const sourceDir=path.join(root,'tools/mascot-art/wardrobe/all-brown-shearling-lace-boots');
const mascotDir=path.join(root,'assets/speaking-system/mascots/v4');
const W=1024,H=1024,CELL=256;
const characters={
 eddy:{base:'eddy-standing.png',blink:'eddy-blink.png'},
 noir:{base:'noir-standing.png',blink:'noir-blink-v1.png'},
 celeste:{base:'celeste-standing.png',blink:'celeste-blink-v1.png'},
 phoebe:{base:'phoebe-standing.png',blink:'phoebe-blink.png'},
 elsie:{base:'elsie-standing.png',blink:'elsie-blink-registered.png'}
};

function components(mask,w,h){
 const seen=new Uint8Array(mask.length),found=[];
 for(let p=0;p<mask.length;p++)if(mask[p]&&!seen[p]){
  const todo=[p];seen[p]=1;
  for(let i=0;i<todo.length;i++){
   const q=todo[i],x=q%w,y=Math.floor(q/w);
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
    if(!dx&&!dy)continue;
    const nx=x+dx,ny=y+dy,n=ny*w+nx;
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

function canonicalFootGeometry(base,cell){
 const ox=cell%4*CELL,oy=Math.floor(cell/4)*CELL;
 let ground=-1;
 for(let y=128;y<CELL;y++)for(let x=48;x<208;x++)if(base[((oy+y)*W+ox+x)*4+3]>=72)ground=Math.max(ground,y);
 if(ground<190)throw Error(`canonical ground not found in cell ${cell}`);
 const dark=new Uint8Array(CELL*CELL);
 for(let y=Math.max(150,ground-58);y<=ground;y++)for(let x=46;x<210;x++){
  const i=((oy+y)*W+ox+x)*4,r=base[i],g=base[i+1],b=base[i+2],a=base[i+3];
  if(a>=72&&r<115&&g<105&&b<100&&Math.max(r,g,b)-Math.min(r,g,b)<75)dark[y*CELL+x]=255;
 }
 const feet=components(dark,CELL,CELL).filter(part=>{
  const box=bounds(part);return part.length>=18&&box.maxY>=ground-4&&box.minY>=ground-56&&box.width>=5&&box.width<=62;
 });
 const pixels=feet.flat();
 if(pixels.length<35){
  const fallback=[];
  for(let y=ground-24;y<=ground;y++)for(let x=65;x<192;x++)if(base[((oy+y)*W+ox+x)*4+3]>=72)fallback.push(y*CELL+x);
  if(!fallback.length)throw Error(`canonical feet not found in cell ${cell}`);
  return {ground,centerX:bounds(fallback).centerX};
 }
 const candidate=feet.sort((a,b)=>Math.abs(bounds(a).centerX-128)-Math.abs(bounds(b).centerX-128)).slice(0,2).flat();
 return {ground,centerX:bounds(candidate).centerX};
}

function extractBootCell(fit,base,cell,character){
 const ox=cell%4*CELL,oy=Math.floor(cell/4)*CELL,{ground,centerX}=canonicalFootGeometry(base,cell);
 const leather=new Uint8Array(CELL*CELL);
 // Seed only from the lower-foot band.  Starting higher can connect a warm
 // brown character coat to the leather through antialiased cuff pixels.
 for(let y=Math.max(170,ground-44);y<Math.min(CELL,ground+14);y++)for(let x=42;x<216;x++){
  const i=((oy+y)*W+ox+x)*4,r=fit[i],g=fit[i+1],b=fit[i+2],a=fit[i+3];
  // Leather is warm but not the saturated orange/red seen in character coats
  // and generation-edge noise.  Requiring a brown middle channel keeps the
  // seed on the boot itself.
  const brown=a>=48&&r>=24&&r<=155&&g>=14&&g<=105&&b>=5&&b<100&&r>g+8&&g>b+2&&r+g+b<310;
  if(brown)leather[y*CELL+x]=255;
 }
 const candidates=components(leather,CELL,CELL).map(part=>({part,box:bounds(part)})).filter(({part,box})=>
  part.length>=24&&box.width>=5&&box.height>=6&&box.maxY>=ground-15&&box.minY>=ground-46&&box.centerX>42&&box.centerX<216
 );
 if(!candidates.length)throw Error(`${character} cell ${cell}: fitted boot leather not found`);
 candidates.sort((a,b)=>b.part.length-a.part.length);
 const primary=candidates[0],selected=candidates.filter(({box,part})=>
  part.length>=Math.max(24,primary.part.length*.11)&&box.maxY>=ground-18&&box.minY<=primary.box.maxY+9&&box.maxY>=primary.box.minY-9
 ).slice(0,3);
 const leatherCore=new Uint8Array(CELL*CELL);
 for(const {part} of selected)for(const q of part)leatherCore[q]=255;
 const leatherNear2=dilate(leatherCore,CELL,CELL,2),leatherNear5=dilate(leatherCore,CELL,CELL,5),leatherNear12=dilate(leatherCore,CELL,CELL,12);
 const coreBox=bounds(selected.flatMap(x=>x.part));
 const palette=new Uint8Array(CELL*CELL);
 for(let y=Math.max(0,coreBox.minY-14);y<=Math.min(255,coreBox.maxY+4);y++)for(let x=Math.max(0,coreBox.minX-5);x<=Math.min(255,coreBox.maxX+5);x++){
  const q=y*CELL+x,i=((oy+y)*W+ox+x)*4,r=fit[i],g=fit[i+1],b=fit[i+2],a=fit[i+3];
  if(a<18)continue;
  const redNoise=r>158&&g<82&&b<82&&r>g*1.7;
  const yellowNoise=r>195&&g>125&&b<92&&g>b*1.55;
  if(redNoise||yellowNoise)continue;
  const leatherPixel=r>=20&&r<=188&&r>g+7&&g>=b-8&&b<120&&r+g+b<370;
  const cream=r>132&&g>116&&b>86&&r-b>6&&g-b>-2&&r-g<58;
  const dark=Math.max(r,g,b)<112&&Math.max(r,g,b)-Math.min(r,g,b)<48;
  const brass=r>88&&g>48&&b<88&&r>g+7&&g>b+3;
  const belowLeatherTop=y>=coreBox.minY-3;
  const cuffBand=y>=ground-58;
  if((leatherPixel&&leatherNear2[q]&&belowLeatherTop)||(cream&&leatherNear12[q]&&cuffBand)||(dark&&leatherNear5[q]&&belowLeatherTop)||(brass&&leatherNear5[q]&&belowLeatherTop))palette[q]=255;
 }
 for(const q of selected.flatMap(x=>x.part))palette[q]=255;
 const halo=dilate(palette,CELL,CELL,1),kept=new Uint8Array(CELL*CELL);
 for(let q=0;q<halo.length;q++)if(halo[q]){
  const x=q%CELL,y=Math.floor(q/CELL),i=((oy+y)*W+ox+x)*4,r=fit[i],g=fit[i+1],b=fit[i+2],a=fit[i+3];
  const redNoise=r>158&&g<82&&b<82&&r>g*1.7,yellowNoise=r>195&&g>125&&b<92&&g>b*1.55;
  if(a>=12&&!redNoise&&!yellowNoise)kept[q]=255;
 }
 const parts=components(kept,CELL,CELL).filter(part=>part.some(q=>leatherCore[q]));
 const finalPixels=parts.flat(),bootBox=bounds(finalPixels);
 if(finalPixels.length<480||bootBox.height<18||bootBox.width<18)throw Error(`${character} cell ${cell}: incomplete boot extraction (${finalPixels.length}px)`);
 // Image generation preserves the atlas registration closely.  A small nudge
 // corrects sampling drift, while the clamp prevents a tail/hidden hoof from
 // pulling the complete boot pair sideways.
 const dx=Math.max(-6,Math.min(6,Math.round(centerX-bootBox.centerX))),dy=ground-bootBox.maxY;
 const out=Buffer.alloc(CELL*CELL*4);let copied=0;
 for(const q of finalPixels){
  const x=q%CELL,y=Math.floor(q/CELL),tx=x+dx,ty=y+dy;
  if(tx<0||tx>=CELL||ty<0||ty>=CELL)continue;
  const src=((oy+y)*W+ox+x)*4,dst=(ty*CELL+tx)*4;
  fit.copy(out,dst,src,src+4);copied++;
 }
 if(copied<450)throw Error(`${character} cell ${cell}: shifted boot extraction is incomplete (${copied}px)`);
 const placed=[];for(let q=0;q<CELL*CELL;q++)if(out[q*4+3]>=12)placed.push(q);
 const placedBox=bounds(placed);
 if(Math.abs(placedBox.maxY-ground)>1)throw Error(`${character} cell ${cell}: boot lost canonical ground contact`);
 if(placedBox.minY<ground-70)throw Error(`${character} cell ${cell}: boot exceeds ankle-safe height (${placedBox.minY}-${placedBox.maxY}, ground ${ground}, source ${coreBox.minY}-${coreBox.maxY})`);
 return {out,pixels:copied,box:placedBox,ground,dx,dy};
}

function placeCell(atlas,cell,cellPixels){
 const ox=cell%4*CELL,oy=Math.floor(cell/4)*CELL;
 for(let y=0;y<CELL;y++)for(let x=0;x<CELL;x++){
  const src=(y*CELL+x)*4;if(!cellPixels[src+3])continue;
  const dst=((oy+y)*W+ox+x)*4;cellPixels.copy(atlas,dst,src,src+4);
 }
}

(async()=>{
 for(const [character,config] of Object.entries(characters)){
  const base=await sharp(path.join(mascotDir,config.base)).resize(W,H,{fit:'fill'}).ensureAlpha().raw().toBuffer();
  const blink=await sharp(path.join(mascotDir,config.blink)).resize(W,H,{fit:'fill'}).ensureAlpha().raw().toBuffer();
  const fit=await sharp(path.join(sourceDir,`${character}-fit.png`)).resize(W,H,{fit:'fill',kernel:'lanczos3'}).ensureAlpha().raw().toBuffer();
  const overlay=Buffer.alloc(W*H*4);let total=0;
  for(let cell=0;cell<16;cell++){
   const extracted=extractBootCell(fit,base,cell,character);placeCell(overlay,cell,extracted.out);total+=extracted.pixels;
   console.log(character,'cell',cell,'pixels',extracted.pixels,'box',`${extracted.box.minX},${extracted.box.minY}-${extracted.box.maxX},${extracted.box.maxY}`,'shift',`${extracted.dx},${extracted.dy}`);
  }
  if(total<11000)throw Error(`${character}: boot atlas is unexpectedly sparse (${total}px)`);
  const assetDir=path.join(root,'assets/speaking-system/cosmetics',character);fs.mkdirSync(assetDir,{recursive:true});
  await sharp(overlay,{raw:{width:W,height:H,channels:4}}).webp({lossless:true}).toFile(path.join(assetDir,'brown-shearling-lace-boots.webp'));
  await sharp(overlay,{raw:{width:W,height:H,channels:4}}).png().toFile(path.join(sourceDir,`${character}-item-source.png`));
  for(const [label,background,input] of [['dark','#292421',base],['light','#eee9df',base],['blink','#77716c',blink]]){
   await sharp(input,{raw:{width:W,height:H,channels:4}}).composite([{input:overlay,raw:{width:W,height:H,channels:4}}]).flatten({background}).jpeg({quality:94}).toFile(path.join(sourceDir,`qa-${character}-${label}.jpg`));
  }
  console.log(character,'boot atlas pixels',total);
 }
 const shared=path.join(root,'assets/speaking-system/cosmetics/shared');fs.mkdirSync(shared,{recursive:true});
 await sharp(path.join(sourceDir,'brown-shearling-lace-boots-display.png')).resize({width:512,height:512,fit:'contain',background:{r:0,g:0,b:0,alpha:0},withoutEnlargement:true}).png().toFile(path.join(shared,'brown-shearling-lace-boots-display.png'));
})().catch(error=>{console.error(error);process.exitCode=1;});
