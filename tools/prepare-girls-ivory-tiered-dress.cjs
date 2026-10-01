// Extract the ivory tiered dress from three independently fitted 4x4 atlases.
// Runtime characters continue to come from the canonical mascot atlases.
const fs=require('fs'),path=require('path');
const sharp=require(process.env.HOME+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=path.resolve(__dirname,'..'),src=path.join(root,'tools/mascot-art/wardrobe/girls-ivory-tiered-dress');

function components(mask,w,h){
 const seen=new Uint8Array(mask.length),out=[];
 for(let p=0;p<mask.length;p++)if(mask[p]&&!seen[p]){
  const todo=[p];seen[p]=1;
  for(let k=0;k<todo.length;k++){
   const q=todo[k],x=q%w;
   for(const n of [q-w,q+w,...(x?[q-1]:[]),...(x<w-1?[q+1]:[])])if(n>=0&&n<mask.length&&mask[n]&&!seen[n]){seen[n]=1;todo.push(n);}
  }
  out.push(todo);
 }
 return out;
}

const ivory=(r,g,b,a)=>a>=72&&r>=128&&g>=118&&b>=100&&r+14>=g&&g+16>=b&&r-b<=88;

(async()=>{
 for(const character of ['celeste','phoebe','elsie']){
  const base=await sharp(path.join(root,'assets/speaking-system/mascots/v4',character+'-standing.png')).ensureAlpha().raw().toBuffer();
  const sourceName=character==='celeste'?character+'-overlay-source.png':character+'-fit.png';
  const source=await sharp(path.join(src,sourceName)).resize(1024,1024,{fit:'fill'}).ensureAlpha().raw().toBuffer();
  const rgba=Buffer.alloc(1024*1024*4);let pixels=0;
  for(let cell=0;cell<16;cell++){
   const ox=cell%4*256,oy=Math.floor(cell/4)*256,mask=new Uint8Array(65536);
   for(let y=72;y<246;y++)for(let x=28;x<228;x++){
    const i=((oy+y)*1024+ox+x)*4,r=base[i],g=base[i+1],b=base[i+2],a=base[i+3];
    if(!ivory(source[i],source[i+1],source[i+2],source[i+3]))continue;
    const paleHair=r>166&&g>150&&b>132&&Math.max(r,g,b)-Math.min(r,g,b)<82;
    const goldenHair=r>168&&g>112&&r-b>64&&g-b>30;
    const difference=Math.abs(source[i]-r)+Math.abs(source[i+1]-g)+Math.abs(source[i+2]-b)+Math.abs(source[i+3]-a)/2;
    if(character==='elsie'&&paleHair)continue;
    if(character==='phoebe'&&goldenHair)continue;
    if(character==='celeste'&&sourceName.endsWith('-fit.png')&&difference<28)continue;
    mask[y*256+x]=255;
   }
   const closed=await sharp(mask,{raw:{width:256,height:256,channels:1}}).dilate(2).erode(2).greyscale().raw().toBuffer();
   const repaired=Buffer.from(closed);
   for(let y=92;y<238;y++){
    let gap=-1;
    for(let x=35;x<221;x++){
     if(closed[y*256+x]){if(gap>=0&&x-gap<=11)for(let fill=gap;fill<x;fill++)repaired[y*256+fill]=255;gap=-1;}
     else if(gap<0&&x>35&&closed[y*256+x-1])gap=x;
    }
   }
   const garment=components(repaired,256,256).filter(part=>part.length>110&&part.some(q=>{const x=q%256,y=Math.floor(q/256);return x>65&&x<195&&y>103&&y<231;})).flat();
   if(garment.length<650)throw Error(character+' cell '+cell+' has no complete dress component');
   for(const q of garment){
    const x=q%256,y=Math.floor(q/256),i=((oy+y)*1024+ox+x)*4;
    rgba[i]=source[i];rgba[i+1]=source[i+1];rgba[i+2]=source[i+2];rgba[i+3]=source[i+3];pixels++;
   }
  }
  if(pixels<30000)throw Error(character+' tiered-dress extraction is unexpectedly sparse: '+pixels);
  const dir=path.join(root,'assets/speaking-system/cosmetics',character);fs.mkdirSync(dir,{recursive:true});
  await sharp(rgba,{raw:{width:1024,height:1024,channels:4}}).webp({lossless:true}).toFile(path.join(dir,'ivory-tiered-dress.webp'));
  await sharp(base,{raw:{width:1024,height:1024,channels:4}}).composite([{input:rgba,raw:{width:1024,height:1024,channels:4}}]).flatten({background:'#2a2928'}).jpeg({quality:94}).toFile(path.join(src,'qa-'+character+'-composite.jpg'));
  console.log(character,'tiered-dress pixels',pixels);
 }
 const out=path.join(root,'assets/speaking-system/cosmetics/girls/ivory-tiered-dress-display.png');
 await sharp(path.join(src,'ivory-tiered-dress-display.png')).resize({width:512,height:768,fit:'inside',withoutEnlargement:true}).png().toFile(out);
})();
