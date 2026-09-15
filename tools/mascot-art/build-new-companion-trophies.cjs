const fs=require('fs'),path=require('path'),sharp=require(process.env.HOME+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=path.resolve(__dirname,'../..'),src=path.join(__dirname,'new-companions/trophies'),out=path.join(root,'assets/sentence-structure/rewards');
(async()=>{for(const name of ['noir','celeste']){
 const gold=sharp(path.join(src,name+'-gold.png'));const gm=await gold.metadata();const alpha=await gold.extractChannel(3).raw().toBuffer();
 for(const tier of ['gold','silver','bronze']){
  const input=path.join(src,name+'-'+tier+'.png'),m=await sharp(input).metadata();
  // Variant geometry matches the gold master; use its real alpha to remove painted checkerboards.
  let img=sharp(input);if(!m.hasAlpha)img=sharp(await img.resize(gm.width,gm.height).removeAlpha().raw().toBuffer(),{raw:{width:gm.width,height:gm.height,channels:3}}).joinChannel(alpha,{raw:{width:gm.width,height:gm.height,channels:1}});
  const buf=await img.png().toBuffer();const cropped=await sharp(buf).trim({threshold:10}).resize({width:450,height:464,fit:'inside'}).png().toBuffer();const cm=await sharp(cropped).metadata();
  await sharp({create:{width:512,height:512,channels:4,background:'#00000000'}}).composite([{input:cropped,left:Math.round((512-cm.width)/2),top:488-cm.height}]).webp({quality:94}).toFile(path.join(out,(tier==='gold'?'golden':tier)+'-'+name+'-map-v1.webp'));
 }
}})();
