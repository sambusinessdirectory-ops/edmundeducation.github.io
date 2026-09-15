const fs=require('fs'),path=require('path');const sharp=require(process.env.HOME+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=path.resolve(__dirname,'..'),src=path.join(root,'tools/mascot-art/wardrobe/noir'),out=path.join(root,'assets/speaking-system/cosmetics/noir');
function parts(mask,w=256){const seen=new Uint8Array(mask.length),groups=[];for(let p=0;p<mask.length;p++){if(!mask[p]||seen[p])continue;const a=[p];seen[p]=1;for(let k=0;k<a.length;k++){const q=a[k];for(const n of [q-w,q+w,...(q%w?[q-1]:[]),...(q%w<w-1?[q+1]:[])])if(n>=0&&n<mask.length&&mask[n]&&!seen[n]){seen[n]=1;a.push(n);}}groups.push(a);}return groups.sort((a,b)=>b.length-a.length);}
(async()=>{
const images={};for(const f of ['cream','charcoal','jacket','fedora'])images[f]=await sharp(path.join(src,f+'-fit.png')).resize(1024,1024).removeAlpha().raw().toBuffer();
const outputs=Object.fromEntries(['cream-cable-knit','charcoal-turtleneck','blue-swordsman-jacket','white-fedora','hat-hide'].map(n=>[n,Buffer.alloc(1024*1024*4)]));
for(let cell=0;cell<16;cell++){
 const ox=cell%4*256,oy=Math.floor(cell/4)*256,at=(x,y)=>((oy+y)*1024+ox+x),creamMask=Buffer.alloc(256*256);
 for(let y=100;y<207;y++)for(let x=0;x<256;x++){const p=at(x,y)*3,[r,g,b]=images.cream.subarray(p,p+3);if(r>130&&g>105&&b>70&&r-g>4&&g-b>5)creamMask[y*256+x]=255;}
 const closedMask=await sharp(creamMask,{raw:{width:256,height:256,channels:1}}).dilate(1).erode(1).greyscale().raw().toBuffer();
 const whiteMask=Buffer.alloc(256*256);for(let y=0;y<85;y++)for(let x=0;x<256;x++){const p=at(x,y)*3,[r,g,b]=images.fedora.subarray(p,p+3);if(Math.min(r,g,b)>125&&Math.max(r,g,b)-Math.min(r,g,b)<35)whiteMask[y*256+x]=255;}
 const whiteParts=parts(whiteMask).filter(a=>a.length>160),brim=new Int16Array(256).fill(-1);for(const group of whiteParts)for(const p of group)brim[p%256]=Math.max(brim[p%256],Math.floor(p/256));
 // Fill short gaps across the black hatband and preserve the generated ear cutouts.
 for(let x=1;x<255;x++)if(brim[x]<0&&brim[x-1]>=0&&brim[x+1]>=0)brim[x]=Math.round((brim[x-1]+brim[x+1])/2);
 const jacketMask=Buffer.alloc(256*256);
 for(let y=105;y<208;y++)for(let x=0;x<256;x++){const p=at(x,y)*3,[r,g,b]=images.jacket.subarray(p,p+3);if(!(g>r+35&&g>b+35)&&((b>r+8&&b>g+2)||(Math.min(r,g,b)>75&&Math.max(r,g,b)-Math.min(r,g,b)<45)))jacketMask[y*256+x]=255;}
 let jm=await sharp(jacketMask,{raw:{width:256,height:256,channels:1}}).dilate(2).erode(2).greyscale().raw().toBuffer();
 const keep=Buffer.alloc(256*256);for(const group of parts(jm).filter(a=>a.length>140))for(const p of group)keep[p]=255;
 for(let y=0;y<256;y++)for(let x=0;x<256;x++){
  const p=at(x,y),q=y*256+x;
  for(const [item,source,mask] of [['cream-cable-knit','cream',closedMask[q]],['charcoal-turtleneck','charcoal',closedMask[q]],['blue-swordsman-jacket','jacket',keep[q]||(closedMask[q]&&images.jacket[p*3]-images.jacket[p*3+1]<10?255:0)],['white-fedora','fedora',brim[x]>=y?255:0]]){
   if(!mask)continue;const [r,g,b]=images[source].subarray(p*3,p*3+3);if(g>r+35&&g>b+35)continue;
   const dst=outputs[item];dst[p*4]=r;dst[p*4+1]=g;dst[p*4+2]=b;dst[p*4+3]=255;
  }
  if(brim[x]>=y){const dst=outputs['hat-hide'];dst[p*4]=dst[p*4+1]=dst[p*4+2]=dst[p*4+3]=255;}
 }
}
for(const [name,data] of Object.entries(outputs))await sharp(data,{raw:{width:1024,height:1024,channels:4}}).webp({lossless:true}).toFile(path.join(out,name+'.webp'));
console.log('Built Noir full-canvas fits and brim-following mask');
})();
