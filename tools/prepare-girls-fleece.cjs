// Offline garment extraction; never regenerate base characters or process pixels during walking.
const fs=require('fs'),path=require('path');
const sharp=require(process.env.HOME+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=path.resolve(__dirname,'..'),src=path.join(root,'tools/mascot-art/wardrobe/girls-fleece');
function groups(mask){const seen=new Uint8Array(mask.length),out=[];for(let p=0;p<mask.length;p++){if(!mask[p]||seen[p])continue;const a=[p];seen[p]=1;for(let k=0;k<a.length;k++){let q=a[k];for(const n of [q-256,q+256,...(q%256?[q-1]:[]),...(q%256<255?[q+1]:[])])if(n>=0&&n<mask.length&&mask[n]&&!seen[n]){seen[n]=1;a.push(n);}}out.push(a);}return out;}
(async()=>{
for(const character of ['phoebe','elsie','celeste']){
 const base=await sharp(path.join(root,'assets/speaking-system/mascots/v4',character+'-standing.png')).ensureAlpha().raw().toBuffer();
 const fitting=await sharp(path.join(src,character+'-fit.png')).resize(1024,1024).removeAlpha().raw().toBuffer();
 const rgba=Buffer.alloc(1024*1024*4);
 for(let cell=0;cell<16;cell++){
  const ox=cell%4*256,oy=Math.floor(cell/4)*256,at=(x,y)=>(oy+y)*1024+ox+x;
  const seed=Buffer.alloc(65536),candidate=Buffer.alloc(65536);
  for(let y=100;y<210;y++)for(let x=0;x<256;x++){
   const p=at(x,y),[r,g,b]=fitting.subarray(p*3,p*3+3),[br,bg,bb,ba]=base.subarray(p*4,p*4+4);
   const warm=r>125&&g>100&&b>95&&r-g<60&&(character!=='celeste'||(g-b>6&&r-b>17));
   const hair=character!=='celeste'&&ba>100&&br>145&&bg>110&&bb>85&&bg/br>.74&&bb/bg>.67;
   if(warm&&!hair){candidate[y*256+x]=255;if(character!=='celeste'||(g-b>8&&r-b>22))seed[y*256+x]=255;}
  }
  // Join fine wool highlights while retaining cutouts around hair, hands, and the zipper.
  const expanded=await sharp(seed,{raw:{width:256,height:256,channels:1}}).dilate(3).greyscale().raw().toBuffer();
  const closed=await sharp(expanded,{raw:{width:256,height:256,channels:1}}).erode(3).greyscale().raw().toBuffer();
  const keep=Buffer.alloc(65536);for(const a of groups(closed).filter(a=>a.length>70))for(const q of a)keep[q]=255;
  for(let y=100;y<210;y++)for(let x=0;x<256;x++){
   const q=y*256+x,p=at(x,y);if(!keep[q])continue;
   const [r,g,b]=fitting.subarray(p*3,p*3+3),[br,bg,bb,ba]=base.subarray(p*4,p*4+4);
   if(g>r+25&&g>b+25)continue;
   if(character!=='celeste'&&ba>100&&br>145&&bg>110&&bb>85&&bg/br>.74&&bb/bg>.67)continue;
   rgba[p*4]=r;rgba[p*4+1]=g;rgba[p*4+2]=b;rgba[p*4+3]=255;
  }
 }
 const dir=path.join(root,'assets/speaking-system/cosmetics',character);fs.mkdirSync(dir,{recursive:true});
 await sharp(rgba,{raw:{width:1024,height:1024,channels:4}}).webp({lossless:true}).toFile(path.join(dir,'cream-sherpa-jacket.webp'));
 await sharp(base,{raw:{width:1024,height:1024,channels:4}}).composite([{input:rgba,raw:{width:1024,height:1024,channels:4}}]).flatten({background:'#2a2928'}).png().toFile(path.join(src,character+'-composite.png'));
 console.log(character,'garment pixels',rgba.filter((v,i)=>i%4===3&&v>0).length);
}
})();
