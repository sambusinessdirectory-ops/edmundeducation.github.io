// Convert the generator's deliberately solid blue background to sprite alpha.
// The sculpted trophy contains only gold/bronze; blue belongs to the backdrop.
const fs=require('node:fs');
const sharp=require(process.env.HOME+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
(async()=>{
 const input=process.argv[2];if(!input)throw Error('Supply the generated solid-blue trophy PNG');
 const {data,info}=await sharp(input).removeAlpha().raw().toBuffer({resolveWithObject:true});
 const rgba=Buffer.alloc(info.width*info.height*4);let transparent=0;
 for(let i=0,j=0;i<data.length;i+=3,j+=4){
  const r=data[i],g=data[i+1],b=data[i+2],peak=Math.max(r,g);
  let alpha=b>peak+15&&b>70?Math.max(0,Math.min(1,1-(b-peak*.2)/255)):1;
  if(alpha<.07)alpha=0;
  if(!alpha){transparent++;continue;}
  rgba[j]=Math.min(255,Math.round(r/alpha));rgba[j+1]=Math.min(255,Math.round(g/alpha));
  rgba[j+2]=Math.min(255,Math.max(0,Math.round((b-255*(1-alpha))/alpha)));rgba[j+3]=Math.round(alpha*255);
 }
 if(transparent<info.width*info.height*.3)throw Error('Expected a substantial solid-blue background');
 const out=process.argv[3]||'assets/sentence-structure/rewards/golden-eddie-map-v1.webp';
 await sharp(rgba,{raw:{width:info.width,height:info.height,channels:4}}).resize(720,720,{fit:'inside'}).extend({top:24,bottom:24,left:24,right:24,background:{r:0,g:0,b:0,alpha:0}}).webp({quality:93,alphaQuality:100}).toFile(out);
 console.log(JSON.stringify({out,transparentPixels:transparent,totalPixels:info.width*info.height}));
})();
