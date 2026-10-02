// Offline character-fitted extraction for the sleeveless navy/cream knit vest.
// The generated fitting sheets are references only: runtime always preserves the
// canonical character atlases and composites only the garment pixels extracted here.
const fs=require('fs'),path=require('path');
const sharp=require(process.env.HOME+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=path.resolve(__dirname,'..');
const source=path.join(root,'tools/mascot-art/wardrobe/girls-navy-cream-knit-vest');
const characters=['celeste','phoebe','elsie'];
const W=1024,H=1024,CELL=256;

function components(mask,w,h){
 const seen=new Uint8Array(mask.length),out=[];
 for(let p=0;p<mask.length;p++)if(mask[p]&&!seen[p]){
  const todo=[p];seen[p]=1;
  for(let k=0;k<todo.length;k++){
   const q=todo[k],x=q%w;
   for(const n of [q-w,q+w,...(x?[q-1]:[]),...(x<w-1?[q+1]:[])]){
    if(n>=0&&n<mask.length&&mask[n]&&!seen[n]){seen[n]=1;todo.push(n);}
   }
  }
  out.push(todo);
 }
 return out;
}

function dilateMask(mask,w,h,radius){
 const horizontal=new Uint8Array(mask.length),out=new Uint8Array(mask.length);
 for(let y=0;y<h;y++){
  let count=0;
  for(let x=0;x<w;x++){
   if(x+radius<w&&mask[y*w+x+radius])count++;
   if(x-radius-1>=0&&mask[y*w+x-radius-1])count--;
   if(count)horizontal[y*w+x]=255;
  }
 }
 for(let x=0;x<w;x++){
  let count=0;
  for(let y=0;y<h;y++){
   if(y+radius<h&&horizontal[(y+radius)*w+x])count++;
   if(y-radius-1>=0&&horizontal[(y-radius-1)*w+x])count--;
   if(count)out[y*w+x]=255;
  }
 }
 return out;
}

const navyCore=(r,g,b,a)=>a>80&&r<110&&g<115&&b<165&&b>r+7&&b>g+4;
const navyEdge=(r,g,b,a)=>a>30&&r<135&&g<135&&b<185&&b>r+1&&b>g;
const creamCore=(r,g,b,a)=>a>80&&r>145&&g>135&&b>100&&r-b>9&&g-b>4&&r-g<45;
const creamEdge=(r,g,b,a)=>a>30&&r>125&&g>115&&b>85&&r-b>6&&g-b>4&&r-g<50;

(async()=>{
 for(const character of characters){
  const base=await sharp(path.join(root,'assets/speaking-system/mascots/v4',character+'-standing.png')).ensureAlpha().raw().toBuffer();
  const blinkName=character==='celeste'?'celeste-blink-v1.png':character==='elsie'?'elsie-blink-registered.png':'phoebe-blink.png';
  const blink=await sharp(path.join(root,'assets/speaking-system/mascots/v4',blinkName)).ensureAlpha().raw().toBuffer();
  const fit=await sharp(path.join(source,character+'-fit.png')).resize(W,H,{fit:'fill'}).ensureAlpha().raw().toBuffer();
  const garment=Buffer.alloc(W*H*4);let pixels=0,creamPixels=0;

  for(let cell=0;cell<16;cell++){
   const ox=cell%4*CELL,oy=Math.floor(cell/4)*CELL;
   const navy=new Uint8Array(CELL*CELL),cream=new Uint8Array(CELL*CELL);
   for(let y=96;y<204;y++)for(let x=12;x<244;x++){
    const p=(oy+y)*W+ox+x,i=p*4,r=fit[i],g=fit[i+1],b=fit[i+2],a=fit[i+3];
    const br=base[i],bg=base[i+1],bb=base[i+2],ba=base[i+3];
    const difference=Math.abs(r-br)+Math.abs(g-bg)+Math.abs(b-bb)+((a>80)!==(ba>80)?255:0);
    if(navyCore(r,g,b,a)&&difference>32)navy[y*CELL+x]=255;
    if(creamCore(r,g,b,a)&&difference>24)cream[y*CELL+x]=255;
   }
   const keptNavy=new Uint8Array(CELL*CELL);
   for(const part of components(navy,CELL,CELL))if(part.length>=24)for(const q of part)keptNavy[q]=255;
   let topNavy=CELL;
   for(let q=0;q<keptNavy.length;q++)if(keptNavy[q])topNavy=Math.min(topNavy,Math.floor(q/CELL));
   const nearNavy=dilateMask(keptNavy,CELL,CELL,8);
   const keptCream=new Uint8Array(CELL*CELL);
   for(let q=0;q<cream.length;q++)if(cream[q]&&nearNavy[q]&&Math.floor(q/CELL)<=topNavy+30)keptCream[q]=255;
   for(const part of components(keptCream,CELL,CELL))if(part.length<5)for(const q of part)keptCream[q]=0;
   const core=new Uint8Array(CELL*CELL);
   for(let q=0;q<core.length;q++)if(keptNavy[q]||keptCream[q])core[q]=255;
   const halo=dilateMask(core,CELL,CELL,2);

   for(let y=96;y<204;y++)for(let x=12;x<244;x++){
    const q=y*CELL+x;if(!halo[q])continue;
    const p=(oy+y)*W+ox+x,i=p*4,r=fit[i],g=fit[i+1],b=fit[i+2],a=fit[i+3];
    const br=base[i],bg=base[i+1],bb=base[i+2],ba=base[i+3];
    const difference=Math.abs(r-br)+Math.abs(g-bg)+Math.abs(b-bb)+((a>80)!==(ba>80)?255:0);
    const isCream=creamEdge(r,g,b,a)&&nearNavy[q]&&y<=topNavy+31&&difference>18;
    if(!(navyEdge(r,g,b,a)&&difference>22)&&!isCream)continue;
    garment[i]=r;garment[i+1]=g;garment[i+2]=b;garment[i+3]=a;pixels++;
    if(isCream)creamPixels++;
   }
  }

  const assetDir=path.join(root,'assets/speaking-system/cosmetics',character);
  fs.mkdirSync(assetDir,{recursive:true});
  await sharp(garment,{raw:{width:W,height:H,channels:4}}).webp({lossless:true}).toFile(path.join(assetDir,'navy-cream-knit-vest.webp'));
  await sharp(garment,{raw:{width:W,height:H,channels:4}}).png().toFile(path.join(source,character+'-item-source.png'));

  for(const [label,background,characterPixels] of [
   ['dark','#292421',base],['light','#eee9df',base],['blink','#77716c',blink]
  ]){
   await sharp(characterPixels,{raw:{width:W,height:H,channels:4}})
    .composite([{input:garment,raw:{width:W,height:H,channels:4}}])
    .flatten({background}).jpeg({quality:94})
    .toFile(path.join(source,`qa-${character}-${label}.jpg`));
  }
  console.log(character,'garment pixels',pixels,'cream trim pixels',creamPixels);
 }
 const displayDir=path.join(root,'assets/speaking-system/cosmetics/girls');
 fs.mkdirSync(displayDir,{recursive:true});
 fs.copyFileSync(path.join(source,'navy-cream-knit-vest-display.png'),path.join(displayDir,'navy-cream-knit-vest-display.png'));
 console.log('inventory image copied to',path.join(displayDir,'navy-cream-knit-vest-display.png'));
})();
