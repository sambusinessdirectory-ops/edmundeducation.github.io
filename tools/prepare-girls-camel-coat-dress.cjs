// Extract the camel coat dress from three separately fitted atlases.
// The canonical characters remain the runtime source of faces, hair, bodies and feet.
const fs=require('fs'),path=require('path');
const sharp=require(process.env.HOME+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=path.resolve(__dirname,'..'),src=path.join(root,'tools/mascot-art/wardrobe/girls-camel-coat-dress');

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

const camel=(r,g,b,a)=>a>=80&&r>=68&&r<=245&&g>=48&&g<=215&&b>=32&&b<=185&&r>g+7&&g>b+3&&r-g<94&&g-b<72&&r<g*1.68&&g<b*1.72;
const strongCamel=(r,g,b,a)=>camel(r,g,b,a)&&r>=105&&g>=72&&b>=48&&r-g>=13&&g-b>=8;

(async()=>{
 for(const character of ['celeste','phoebe','elsie']){
  const base=await sharp(path.join(root,'assets/speaking-system/mascots/v4',character+'-standing.png')).ensureAlpha().raw().toBuffer();
  const fit=await sharp(path.join(src,character+'-fit.png')).resize(1024,1024,{fit:'fill'}).ensureAlpha().raw().toBuffer();
  const rgba=Buffer.alloc(1024*1024*4);let pixels=0;
  for(let cell=0;cell<16;cell++){
   const ox=cell%4*256,oy=Math.floor(cell/4)*256,candidate=new Uint8Array(65536),seed=new Uint8Array(65536);
   for(let y=78;y<238;y++)for(let x=7;x<249;x++){
    const p=(oy+y)*1024+ox+x,i=p*4,r=fit[i],g=fit[i+1],b=fit[i+2],a=fit[i+3];
    if(camel(r,g,b,a))candidate[y*256+x]=255;
    if(y>=92&&strongCamel(r,g,b,a))seed[y*256+x]=255;
   }
   const keep=new Uint8Array(65536);
   for(const part of components(candidate,256,256))if(part.length>=24&&part.some(q=>seed[q]))for(const q of part)keep[q]=255;
   // Close tiny button/seam holes without filling the larger hand, mane or tail cutouts.
   const closed=await sharp(keep,{raw:{width:256,height:256,channels:1}}).dilate(2).erode(2).greyscale().raw().toBuffer();
   // Generated wool contains narrow orange-brown highlight and seam bands. Fill
   // only short gaps bounded by established camel fabric on the same scanline.
   const repaired=Buffer.from(closed);
   for(let y=78;y<238;y++){
    let left=-1;
    for(let x=7;x<249;x++){
     if(closed[y*256+x]){if(left>=0&&x-left<=18)for(let fill=left;fill<x;fill++)repaired[y*256+fill]=255;left=-1;}
     else if(left<0&&x>7&&closed[y*256+x-1])left=x;
    }
   }
   const expanded=Buffer.from(repaired);
   const radius=character==='elsie'?7:4;
   for(let y=78;y<238;y++)for(let x=7;x<249;x++)if(repaired[y*256+x]){
    for(let dy=-radius;dy<=radius;dy++)for(let dx=-radius;dx<=radius;dx++)if(dx*dx+dy*dy<=radius*radius){const nx=x+dx,ny=y+dy;if(nx>=7&&nx<249&&ny>=78&&ny<238)expanded[ny*256+nx]=255;}
   }
   for(let y=78;y<238;y++)for(let x=7;x<249;x++){
    const q=y*256+x;if(!expanded[q])continue;
    const p=(oy+y)*1024+ox+x,i=p*4;
    const r=fit[i],g=fit[i+1],b=fit[i+2],a=fit[i+3],hi=Math.max(r,g,b),lo=Math.min(r,g,b);
    if(a<80)continue;
    const paleHair=lo>145&&hi-lo<82;
    const goldenHair=r>170&&g>120&&b<105&&g-b>24;
    const elsieSkin=character==='elsie'&&r>140&&g<120&&b<86&&r-g>43;
    const phoebeSkin=character==='phoebe'&&r>88&&g<108&&b<78&&r-g>24;
    // Elsie's copper body is close to the coat's shadow palette. Below the
    // neckline, favour the fitted source so no orange body slivers survive at
    // cuffs, lapels or hem. The face remains protected above the neckline.
    if(!repaired[q]&&(paleHair||goldenHair||(elsieSkin&&y<105)||phoebeSkin))continue;
    // Side-positioned dark regions are canonical hands, not garment fabric.
    if(!repaired[q]&&hi<105&&(x<94||x>162||y>205))continue;
    rgba[i]=fit[i];rgba[i+1]=fit[i+1];rgba[i+2]=fit[i+2];rgba[i+3]=fit[i+3];pixels++;
   }
  }
  if(pixels<70000)throw Error(character+' coat-dress extraction is unexpectedly sparse: '+pixels);
  const dir=path.join(root,'assets/speaking-system/cosmetics',character);fs.mkdirSync(dir,{recursive:true});
  await sharp(rgba,{raw:{width:1024,height:1024,channels:4}}).webp({lossless:true}).toFile(path.join(dir,'camel-coat-dress.webp'));
  await sharp(base,{raw:{width:1024,height:1024,channels:4}}).composite([{input:rgba,raw:{width:1024,height:1024,channels:4}}]).flatten({background:'#2a2928'}).jpeg({quality:94}).toFile(path.join(src,'qa-'+character+'-composite.jpg'));
  console.log(character,'coat-dress pixels',pixels);
 }
 fs.copyFileSync(path.join(src,'camel-coat-dress-display.png'),path.join(root,'assets/speaking-system/cosmetics/girls/camel-coat-dress-display.png'));
})();
