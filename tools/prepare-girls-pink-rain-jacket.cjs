// Extract only charcoal fabric and hot-pink piping from the three generated
// fitting atlases. Base character atlases remain the runtime source of truth.
const fs=require('fs'),path=require('path');
const sharp=require(process.env.HOME+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=path.resolve(__dirname,'..'),src=path.join(root,'tools/mascot-art/wardrobe/girls-pink-rain-jacket');
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
(async()=>{
 for(const character of ['celeste','phoebe','elsie']){
  const base=await sharp(path.join(root,'assets/speaking-system/mascots/v4',character+'-standing.png')).ensureAlpha().raw().toBuffer();
  const fit=await sharp(path.join(src,character+'-fit.png')).resize(1024,1024,{fit:'fill'}).ensureAlpha().raw().toBuffer();
  const rgba=Buffer.alloc(1024*1024*4);let pixels=0,pink=0;
  for(let cell=0;cell<16;cell++){
   const ox=cell%4*256,oy=Math.floor(cell/4)*256,mask=new Uint8Array(65536);
   for(let y=108;y<199;y++)for(let x=8;x<248;x++){
    const p=(oy+y)*1024+ox+x,i=p*4,r=fit[i],g=fit[i+1],b=fit[i+2],a=fit[i+3];
    if(a<100)continue;
    const dark=Math.max(r,g,b)<96&&Math.max(r,g,b)-Math.min(r,g,b)<38;
    const piping=r>150&&b>90&&r>g*1.32&&b>g*1.25;
    if(dark||piping)mask[y*256+x]=255;
   }
   const keep=new Uint8Array(65536);
   for(const part of components(mask,256,256))if(part.length>=4)for(const q of part)keep[q]=255;
   for(let y=108;y<199;y++)for(let x=8;x<248;x++){
    const q=y*256+x,p=(oy+y)*1024+ox+x;if(!keep[q])continue;
    const i=p*4,bi=p*4,r=fit[i],g=fit[i+1],b=fit[i+2];
    rgba[bi]=r;rgba[bi+1]=g;rgba[bi+2]=b;rgba[bi+3]=255;pixels++;
    if(r>150&&b>90&&r>g*1.32&&b>g*1.25)pink++;
   }
  }
  const dir=path.join(root,'assets/speaking-system/cosmetics',character);fs.mkdirSync(dir,{recursive:true});
  await sharp(rgba,{raw:{width:1024,height:1024,channels:4}}).webp({lossless:true}).toFile(path.join(dir,'pink-rain-jacket.webp'));
  await sharp(base,{raw:{width:1024,height:1024,channels:4}}).composite([{input:rgba,raw:{width:1024,height:1024,channels:4}}]).flatten({background:'#2a2928'}).png().toFile(path.join(src,character+'-composite-review.png'));
  console.log(character,'extracted pixels',pixels,'pink',pink);
 }
 const out=path.join(root,'assets/speaking-system/cosmetics/girls/pink-rain-jacket-display.png');
 fs.copyFileSync(path.join(src,'pink-rain-jacket-display.png'),out);
 console.log('transparent inventory image',out);
})();
