// Build five independent top-slot overlays from registered worn references.
// The generated references guide the fit only; runtime always composites the
// extracted shirt over the untouched canonical character atlases.
const fs=require('fs'),path=require('path');
const sharp=require(process.env.HOME+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');

const root=path.resolve(__dirname,'..');
const sourceDir=path.join(root,'tools/mascot-art/wardrobe/all-white-oversized-tee');
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

function alphaBounds(pixels,cell){
 const ox=cell%4*CELL,oy=Math.floor(cell/4)*CELL,points=[];
 for(let y=0;y<CELL;y++)for(let x=0;x<CELL;x++)if(pixels[((oy+y)*W+ox+x)*4+3]>=24)points.push(y*CELL+x);
 const box=bounds(points);
 if(!box)throw Error(`cell ${cell}: character alpha not found`);
 return box;
}

function colorDifference(fit,base,index){
 return Math.abs(fit[index]-base[index])+Math.abs(fit[index+1]-base[index+1])+Math.abs(fit[index+2]-base[index+2]);
}

function extractShirtCell(fit,base,cell,character){
 const ox=cell%4*CELL,oy=Math.floor(cell/4)*CELL;
 const baseBox=alphaBounds(base,cell),fitBox=alphaBounds(fit,cell);
 const y0=Math.max(102,baseBox.minY+Math.round(baseBox.height*.27));
 const y1=Math.min(214,baseBox.minY+Math.round(baseBox.height*.83));
 const x0=Math.max(22,baseBox.minX-5),x1=Math.min(234,baseBox.maxX+5);
 const coreCandidate=new Uint8Array(CELL*CELL);
 for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
  const i=((oy+y)*W+ox+x)*4,r=fit[i],g=fit[i+1],b=fit[i+2],a=fit[i+3];
  if(a<38)continue;
  const max=Math.max(r,g,b),min=Math.min(r,g,b),difference=colorDifference(fit,base,i);
  // The generated shirt is a cool neutral white.  Requiring its blue channel
  // to stay close to red rejects Celeste/Elsie's warmer ivory hair and coat,
  // even where the garment and body have similar luminance.
  const coolWhite=r>=145&&g>=142&&b>=142&&max-min<=36&&b>=r-7&&g>=r-12;
  const changed=difference>=(character==='celeste'?5:character==='elsie'?12:28);
  if(coolWhite&&changed)coreCandidate[y*CELL+x]=255;
 }
 const candidateParts=components(coreCandidate,CELL,CELL).map(part=>({part,box:bounds(part)})).filter(({part,box})=>
  part.length>=16&&box.maxY>=128&&box.minY<=196&&box.centerX>=x0&&box.centerX<=x1
 );
 if(!candidateParts.length)throw Error(`${character} cell ${cell}: white shirt core not found`);
 candidateParts.sort((a,b)=>b.part.length-a.part.length);
 const largest=candidateParts[0].part.length;
 const core=new Uint8Array(CELL*CELL);
 for(const {part,box} of candidateParts){
  const nearTorso=box.maxY>=145&&box.minY<=198;
  if(part.length>=Math.max(16,largest*.025)&&nearTorso)for(const q of part)core[q]=255;
 }
 const nearCore=dilate(core,CELL,CELL,3),edgeCandidate=new Uint8Array(CELL*CELL);
 for(let y=Math.max(70,y0-8);y<=Math.min(220,y1+8);y++)for(let x=Math.max(15,x0-8);x<=Math.min(241,x1+8);x++){
  const q=y*CELL+x;if(!nearCore[q])continue;
  const i=((oy+y)*W+ox+x)*4,r=fit[i],g=fit[i+1],b=fit[i+2],a=fit[i+3];
  if(a<12)continue;
  const max=Math.max(r,g,b),min=Math.min(r,g,b),difference=colorDifference(fit,base,i);
  const neutralEdge=r>=98&&g>=96&&b>=96&&max-min<=52&&b>=r-12&&g>=r-18;
  const changed=difference>=(character==='celeste'?5:character==='elsie'?10:18);
  if(neutralEdge&&changed)edgeCandidate[q]=255;
 }
 for(let q=0;q<core.length;q++)if(core[q])edgeCandidate[q]=255;
 const finalMask=new Uint8Array(CELL*CELL);
 for(const part of components(edgeCandidate,CELL,CELL))if(part.some(q=>core[q]))for(const q of part)finalMask[q]=255;
 const finalPoints=[];for(let q=0;q<finalMask.length;q++)if(finalMask[q])finalPoints.push(q);
 const shirtBox=bounds(finalPoints);
 if(finalPoints.length<260||!shirtBox||shirtBox.height<20||shirtBox.width<18)throw Error(`${character} cell ${cell}: incomplete shirt extraction (${finalPoints.length}px)`);
 if(shirtBox.minY<67||shirtBox.maxY>221)throw Error(`${character} cell ${cell}: shirt escaped torso band (${shirtBox.minY}-${shirtBox.maxY})`);

 // Correct the one-to-three-pixel sampling drift left by the generated fitting
 // reference without allowing hair or tail width to move the garment far away.
 const baseCenter=(baseBox.minX+baseBox.maxX)/2,fitCenter=(fitBox.minX+fitBox.maxX)/2;
 const dx=Math.max(-4,Math.min(4,Math.round(baseCenter-fitCenter)));
 const dy=Math.max(-4,Math.min(4,baseBox.maxY-fitBox.maxY));
 const out=Buffer.alloc(CELL*CELL*4);let copied=0;
 for(const q of finalPoints){
  const x=q%CELL,y=Math.floor(q/CELL),tx=x+dx,ty=y+dy;
  if(tx<0||tx>=CELL||ty<0||ty>=CELL)continue;
  const src=((oy+y)*W+ox+x)*4,dst=(ty*CELL+tx)*4;
  fit.copy(out,dst,src,src+4);copied++;
 }
 return {out,pixels:copied,box:shirtBox,dx,dy};
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
   const extracted=extractShirtCell(fit,base,cell,character);placeCell(overlay,cell,extracted.out);total+=extracted.pixels;
   console.log(character,'cell',cell,'pixels',extracted.pixels,'box',`${extracted.box.minX},${extracted.box.minY}-${extracted.box.maxX},${extracted.box.maxY}`,'shift',`${extracted.dx},${extracted.dy}`);
  }
  if(total<9000)throw Error(`${character}: shirt atlas is unexpectedly sparse (${total}px)`);
  const assetDir=path.join(root,'assets/speaking-system/cosmetics',character);fs.mkdirSync(assetDir,{recursive:true});
  await sharp(overlay,{raw:{width:W,height:H,channels:4}}).webp({lossless:true}).toFile(path.join(assetDir,'white-oversized-tee.webp'));
  await sharp(overlay,{raw:{width:W,height:H,channels:4}}).png().toFile(path.join(sourceDir,`${character}-item-source.png`));
  for(const [label,background,input] of [['dark','#292421',base],['light','#d9e8f3',base],['blink','#77716c',blink]]){
   await sharp(input,{raw:{width:W,height:H,channels:4}}).composite([{input:overlay,raw:{width:W,height:H,channels:4}}]).flatten({background}).jpeg({quality:94}).toFile(path.join(sourceDir,`qa-${character}-${label}.jpg`));
  }
  console.log(character,'shirt atlas pixels',total);
 }
 const shared=path.join(root,'assets/speaking-system/cosmetics/shared');fs.mkdirSync(shared,{recursive:true});
 await sharp(path.join(sourceDir,'white-oversized-tee-display.png')).resize({width:512,height:512,fit:'contain',background:{r:0,g:0,b:0,alpha:0},withoutEnlargement:true}).png().toFile(path.join(shared,'white-oversized-tee-display.png'));
})().catch(error=>{console.error(error);process.exitCode=1;});
