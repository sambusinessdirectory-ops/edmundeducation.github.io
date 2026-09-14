// Asset preparation only: key the generated flat matte, split cells, normalize and encode.
// Usage: node tools/build-flashcard-gems-v2.cjs generated-chroma-sheet.png
const fs=require('node:fs'),path=require('node:path');
const sharp=require(process.env.SHARP_MODULE||path.join(process.env.HOME,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp'));
const names=['ivory-round','burgundy-oval','emerald-step','royal-round','blush-pear','aqua-clover','amethyst-cushion','amber-marquise','teal-hexagon'];
(async()=>{
 const source=process.argv[2];if(!source)throw new Error('Provide the generated chroma sheet.');
 const meta=await sharp(source).metadata();
 if(!meta.width||meta.width!==meta.height||meta.width%3!==0)throw new Error('Expected a square atlas with three equal rows and columns.');
 const cell=meta.width/3,out=path.resolve(__dirname,'../assets/flashcards/range-worlds/gems-v2');fs.mkdirSync(out,{recursive:true});
 for(let i=0;i<9;i++){
  const {data,info}=await sharp(source).extract({left:(i%3)*cell,top:Math.floor(i/3)*cell,width:cell,height:cell}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const seen=new Uint8Array(cell*cell),queue=[];
  const isMatte=n=>{const p=n*4;return data[p+1]>190&&data[p+1]>data[p]+90&&data[p+1]>data[p+2]+90;};
  const add=n=>{if(n>=0&&n<seen.length&&!seen[n]&&isMatte(n)){seen[n]=1;queue.push(n);}};
  for(let n=0;n<cell;n++){add(n);add((cell-1)*cell+n);add(n*cell);add(n*cell+cell-1);}
  for(let q=0;q<queue.length;q++){const n=queue[q],x=n%cell;if(x)add(n-1);if(x<cell-1)add(n+1);add(n-cell);add(n+cell);}
  for(let n=0;n<seen.length;n++){
   const p=n*4;if(seen[n]){data[p]=data[p+1]=data[p+2]=data[p+3]=0;continue;}
   const x=n%cell,edge=(x&&seen[n-1])||(x<cell-1&&seen[n+1])||seen[n-cell]||seen[n+cell];
   const excess=data[p+1]-Math.max(data[p],data[p+2]);
   if(edge&&excess>28){const alpha=Math.max(.25,1-(excess-28)/227);data[p+3]=Math.round(alpha*255);data[p+1]=Math.min(data[p+1],Math.max(data[p],data[p+2])+28);}
  }
  const trimmed=await sharp(data,{raw:info}).trim().png().toBuffer();
  const scaled=await sharp(trimmed).resize({width:370,height:370,fit:'inside'}).png().toBuffer();
  const m=await sharp(scaled).metadata();
  await sharp({create:{width:480,height:480,channels:4,background:'#00000000'}}).composite([{input:scaled,left:Math.round((480-m.width)/2),top:Math.round((480-m.height)/2)}]).webp({quality:93,alphaQuality:100,effort:6}).toFile(path.join(out,names[i]+'.webp'));
  console.log(names[i],{transparentPixels:queue.length});
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
