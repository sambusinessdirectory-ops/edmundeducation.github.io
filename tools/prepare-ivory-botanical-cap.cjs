// Build independently registered ivory botanical-cap overlays and shape-specific
// occlusion masks for every supported standing character.
const fs=require('fs'),path=require('path');
const sharp=require(process.env.HOME+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=path.resolve(__dirname,'..');
const sourceDir=path.join(root,'tools/mascot-art/wardrobe/ivory-botanical-cap');
const mascotDir=path.join(root,'assets/speaking-system/mascots/v4');
const sourcePath=path.join(sourceDir,'cap-directions-source.png');
const characters={
  eddy:{base:'eddy-standing.png',blink:'eddy-blink.png',fitting:'eddy-fitting-v2.png',maxWidth:94,maxHeight:51,restoreDepth:56},
  noir:{base:'noir-standing.png',blink:'noir-blink-v1.png',fitting:'noir-fitting-v2.png',maxWidth:104,maxHeight:58,restoreDepth:58},
  celeste:{base:'celeste-standing.png',blink:'celeste-blink-v1.png',fitting:'celeste-fitting-v2.png',maxWidth:104,maxHeight:62,restoreDepth:60},
  phoebe:{base:'phoebe-standing.png',blink:'phoebe-blink.png',fitting:'phoebe-fitting-v2.png',maxWidth:94,maxHeight:54,restoreDepth:58},
  elsie:{base:'elsie-standing.png',blink:'elsie-blink-registered.png',fitting:'elsie-fitting-v2.png',maxWidth:102,maxHeight:60,restoreDepth:60}
};

function components(mask,w,h){
  const seen=new Uint8Array(mask.length),found=[];
  for(let p=0;p<mask.length;p++)if(mask[p]&&!seen[p]){
    const todo=[p];seen[p]=1;
    for(let i=0;i<todo.length;i++){
      const q=todo[i],x=q%w,y=Math.floor(q/w);
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
        const nx=x+dx,ny=y+dy,n=ny*w+nx;
        if(nx>=0&&nx<w&&ny>=0&&ny<h&&mask[n]&&!seen[n]){seen[n]=1;todo.push(n);}
      }
    }
    found.push(todo);
  }
  return found;
}
const largestComponent=(mask,w,h)=>components(mask,w,h).sort((a,b)=>b.length-a.length)[0]||[];

function alphaBounds(data,ox,oy,yLimit=256){
  let minX=256,minY=256,maxX=-1,maxY=-1;
  for(let y=0;y<yLimit;y++)for(let x=0;x<256;x++){
    const i=((oy+y)*1024+ox+x)*4;if(data[i+3]<72)continue;
    minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);
  }
  return maxX<0?null:{minX,minY,maxX,maxY,width:maxX-minX+1,height:maxY-minY+1};
}

// Find the cap silhouette in a character-specific worn fitting reference.  The
// reference is deliberately not shipped as a replacement character; it is a
// landmark source for the hat's per-view position and scale.  Warm ivory cap
// pixels are separated from orange ears, blonde hair and pale white manes, then
// only sizeable components in the upper head band are allowed to contribute.
function fittingBounds(fitting,cell,baseBounds){
  const ox=cell%4*256,oy=Math.floor(cell/4)*256,mask=new Uint8Array(256*256);
  const yEnd=Math.min(132,baseBounds.minY+88);
  for(let y=Math.max(0,baseBounds.minY-5);y<yEnd;y++)for(let x=0;x<256;x++){
    const i=((oy+y)*1024+ox+x)*4,r=fitting[i],g=fitting[i+1],b=fitting[i+2],a=fitting[i+3];
    const cap=a>=96&&r>=148&&g>=142&&b>=118&&r-g<=42&&g-b<=54&&r-b>=6&&b<=222;
    if(cap)mask[y*256+x]=1;
  }
  const parts=components(mask,256,256).filter(part=>part.length>=24).map(part=>{
    let minX=256,minY=256,maxX=-1,maxY=-1;
    for(const p of part){const x=p%256,y=Math.floor(p/256);minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}
    return {part,minX,minY,maxX,maxY,width:maxX-minX+1,height:maxY-minY+1};
  }).filter(part=>part.width>=7&&part.height>=4);
  if(!parts.length)throw Error(`fitting reference cap not found in cell ${cell}`);
  parts.sort((a,b)=>b.part.length-a.part.length);
  const main=parts[0],selected=parts.filter(part=>
    part.minY<=main.maxY+10&&part.maxY>=main.minY-10&&
    part.minX<=main.maxX+18&&part.maxX>=main.minX-18
  );
  let minX=256,minY=256,maxX=-1,maxY=-1,pixels=0;
  for(const part of selected){minX=Math.min(minX,part.minX);minY=Math.min(minY,part.minY);maxX=Math.max(maxX,part.maxX);maxY=Math.max(maxY,part.maxY);pixels+=part.part.length;}
  if(pixels<180||maxX-minX<45||maxY-minY<22)throw Error(`fitting reference cap is incomplete in cell ${cell}: ${pixels}px ${maxX-minX+1}x${maxY-minY+1}`);
  return {minX,minY,maxX,maxY,width:maxX-minX+1,height:maxY-minY+1,pixels};
}

function cleanCell(source,cell){
  const ox=cell%4*256,oy=Math.floor(cell/4)*256,mask=new Uint8Array(256*256);
  for(let y=0;y<256;y++)for(let x=0;x<256;x++){
    const i=((oy+y)*1024+ox+x)*4;mask[y*256+x]=source[i+3]>=72?1:0;
  }
  const keep=largestComponent(mask,256,256);if(keep.length<1200)throw Error(`cap source cell ${cell} is incomplete`);
  let minX=256,minY=256,maxX=-1,maxY=-1;for(const q of keep){const x=q%256,y=Math.floor(q/256);minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}
  const w=maxX-minX+1,h=maxY-minY+1,rgba=Buffer.alloc(w*h*4);
  for(const q of keep){const x=q%256,y=Math.floor(q/256),src=((oy+y)*1024+ox+x)*4,dst=((y-minY)*w+x-minX)*4;source.copy(rgba,dst,src,src+4);}
  // ImageGen supplied generic dark/transparent ear sockets. Fill those
  // source openings, then cut the real character ears back in after fitting.
  // Small dark details (the botanical mark, seams and eyelets) remain.
  let sr=0,sg=0,sb=0,count=0;
  for(let p=0;p<w*h;p++){const i=p*4;if(rgba[i+3]>180&&rgba[i]>168&&rgba[i+1]>158&&rgba[i+2]>142){sr+=rgba[i];sg+=rgba[i+1];sb+=rgba[i+2];count++;}}
  const ivory=count?[Math.round(sr/count),Math.round(sg/count),Math.round(sb/count)]:[224,216,200];
  // Close the large, edge-connected notches that ImageGen used as generic
  // ear sockets.  A baseball-cap crown is continuous; the real ears are
  // restored from each canonical character after the fitted cap is placed.
  // Restrict this to the upper 72% so the brim's concave lower edge remains.
  for(let y=0;y<Math.floor(h*.72);y++){
    let rowMin=w,rowMax=-1;
    for(let x=0;x<w;x++)if(rgba[(y*w+x)*4+3]>=72){rowMin=Math.min(rowMin,x);rowMax=Math.max(rowMax,x);}
    if(rowMax-rowMin<Math.floor(w*.38))continue;
    for(let x=rowMin;x<=rowMax;x++){
      const i=(y*w+x)*4;
      if(rgba[i+3]>=72)continue;
      rgba[i]=ivory[0];rgba[i+1]=ivory[1];rgba[i+2]=ivory[2];rgba[i+3]=255;
    }
  }
  const outside=new Uint8Array(w*h),todo=[];
  for(let x=0;x<w;x++)for(const y of [0,h-1]){const p=y*w+x;if(rgba[p*4+3]<72&&!outside[p]){outside[p]=1;todo.push(p);}}
  for(let y=0;y<h;y++)for(const x of [0,w-1]){const p=y*w+x;if(rgba[p*4+3]<72&&!outside[p]){outside[p]=1;todo.push(p);}}
  for(let k=0;k<todo.length;k++){
    const q=todo[k],x=q%w,y=Math.floor(q/w);
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,n=ny*w+nx;if(nx>=0&&nx<w&&ny>=0&&ny<h&&!outside[n]&&rgba[n*4+3]<72){outside[n]=1;todo.push(n);}}
  }
  for(let p=0;p<w*h;p++)if(rgba[p*4+3]<72&&!outside[p]){const i=p*4;rgba[i]=ivory[0];rgba[i+1]=ivory[1];rgba[i+2]=ivory[2];rgba[i+3]=255;}
  const dark=new Uint8Array(w*h);
  for(let p=0;p<w*h;p++){const i=p*4;if(rgba[i+3]>=72&&rgba[i]<145&&rgba[i+1]<140&&rgba[i+2]<132)dark[p]=1;}
  for(const part of components(dark,w,h)){
    const xs=part.map(p=>p%w),ys=part.map(p=>Math.floor(p/w)),cw=Math.max(...xs)-Math.min(...xs)+1,ch=Math.max(...ys)-Math.min(...ys)+1;
    if(part.length<70||ch<9||cw>58)continue;
    for(const p of part){const i=p*4;rgba[i]=ivory[0];rgba[i+1]=ivory[1];rgba[i+2]=ivory[2];rgba[i+3]=255;}
  }
  // Remove residual dark ImageGen speckles/socket fragments. The product's
  // olive sprig is redrawn after fitting so it stays crisp and registered.
  for(let p=0;p<w*h;p++){
    const i=p*4;
    if(rgba[i+3]>=72&&rgba[i]<155&&rgba[i+1]<150&&rgba[i+2]<145){
      rgba[i]=ivory[0];rgba[i+1]=ivory[1];rgba[i+2]=ivory[2];rgba[i+3]=255;
    }
  }
  return {rgba,w,h};
}

async function resizedCell(source,cell,width,height=null){
  const clean=cleanCell(source,cell);
  return sharp(clean.rgba,{raw:{width:clean.w,height:clean.h,channels:4}})
    .resize(height?{width,height,fit:'fill',kernel:'lanczos3'}:{width,height:null,fit:'inside',kernel:'lanczos3'})
    .ensureAlpha().raw().toBuffer({resolveWithObject:true});
}

function place(dst,mask,cap,w,h,left,top){
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const sx=(y*w+x)*4,a=cap[sx+3];if(a<10)continue;
    const px=left+x,py=top+y;if(px<0||px>=256||py<0||py>=256)continue;
    const d=(py*256+px)*4,af=a/255,bf=1-af;
    dst[d]=Math.round(cap[sx]*af+dst[d]*bf);dst[d+1]=Math.round(cap[sx+1]*af+dst[d+1]*bf);dst[d+2]=Math.round(cap[sx+2]*af+dst[d+2]*bf);dst[d+3]=Math.max(dst[d+3],a);
    mask[py*256+px]=Math.max(mask[py*256+px],a);
  }
}

function botanicalMark(dst,cell,left,top,w,h){
  const positions={0:.50,1:.57,2:.64,3:.70,4:.74,11:.26,12:.26,13:.30,14:.36,15:.43};
  if(positions[cell]===undefined)return;
  const cx=Math.round(left+w*positions[cell]),cy=Math.round(top+h*.47),olive=[73,78,43,255];
  const dot=(x,y)=>{if(x<0||x>=256||y<0||y>=256)return;const i=(y*256+x)*4;dst[i]=olive[0];dst[i+1]=olive[1];dst[i+2]=olive[2];dst[i+3]=255;};
  for(let k=-4;k<=4;k++)dot(cx,cy+k);
  for(const [dy,side] of [[-2,-1],[0,1],[2,-1]]){
    dot(cx+side,cy+dy);dot(cx+side*2,cy+dy-1);dot(cx+side*2,cy+dy);
  }
}

function identitySeed(character,r,g,b,a,x,headCenter,capWidth){
  if(a<96)return false;
  const side=Math.abs(x-headCenter)>capWidth*.18;
  if(character==='celeste')return side&&r>150&&r>g+16&&r>b+8&&g<175;
  if(character==='noir')return side&&r>62&&r>g*1.22&&r>b*1.08;
  const warmEar=r>88&&r>g*1.22&&r>b*1.35&&g<130;
  const blueBow=character==='elsie'&&b>72&&b>r*1.18&&b>g*1.08;
  return (side&&warmEar)||blueBow;
}

function dilateIdentity(seed,base,ox,oy,passes=0){
  let current=seed;
  for(let pass=0;pass<passes;pass++){
    const next=Uint8Array.from(current);
    for(let y=1;y<255;y++)for(let x=1;x<255;x++){
      const p=y*256+x;if(current[p])continue;
      if(!current[p-1]&&!current[p+1]&&!current[p-256]&&!current[p+256])continue;
      if(base[((oy+y)*1024+ox+x)*4+3]>=96)next[p]=1;
    }
    current=next;
  }
  return current;
}

function cleanCapOverlayCell(source,cell){
  const ox=cell%4*256,oy=Math.floor(cell/4)*256,mask=new Uint8Array(256*256);
  for(let y=0;y<256;y++)for(let x=0;x<256;x++){
    const i=((oy+y)*1024+ox+x)*4;
    if(source[i+3]>=56)mask[y*256+x]=1;
  }
  const keep=largestComponent(mask,256,256);
  if(keep.length<900)throw Error(`cap-only source cell ${cell} is incomplete: ${keep.length}px`);
  const out=Buffer.alloc(256*256*4);let minX=256,minY=256,maxX=-1,maxY=-1,pixels=0;
  for(const p of keep){
    const x=p%256,y=Math.floor(p/256),src=((oy+y)*1024+ox+x)*4,r=source[src],g=source[src+1],b=source[src+2],a=source[src+3];
    // Image generation can leave saturated red/yellow diagnostic flecks on
    // transparent edges. They are not part of the ivory/olive product.
    const coloredNoise=(r>155&&r>g*1.34&&r>b*1.34)||(r>190&&g>145&&b<105);
    if(coloredNoise||a<56)continue;
    const dst=p*4;out[dst]=r;out[dst+1]=g;out[dst+2]=b;out[dst+3]=a;
    minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);pixels++;
  }
  if(pixels<850||maxX-minX<45||maxY-minY<24)throw Error(`clean cap-only source cell ${cell} is incomplete: ${pixels}px`);
  return {out,minX,minY,maxX,maxY,width:maxX-minX+1,height:maxY-minY+1,pixels};
}

(async()=>{
  let display;
  for(const [character,config] of Object.entries(characters)){
    const base=await sharp(path.join(mascotDir,config.base)).resize(1024,1024,{fit:'fill'}).ensureAlpha().raw().toBuffer();
    const blink=await sharp(path.join(mascotDir,config.blink)).resize(1024,1024,{fit:'fill'}).ensureAlpha().raw().toBuffer();
    const fitting=await sharp(path.join(sourceDir,config.fitting)).resize(1024,1024,{fit:'fill'}).ensureAlpha().raw().toBuffer();
    const source=await sharp(path.join(sourceDir,`${character}-cap-overlay-v2-source.png`)).resize(1024,1024,{fit:'fill'}).ensureAlpha().raw().toBuffer();
    const overlay=Buffer.alloc(1024*1024*4),hide=Buffer.alloc(1024*1024*4);let opaque=0;
    for(let cell=0;cell<16;cell++){
      const ox=cell%4*256,oy=Math.floor(cell/4)*256,baseBounds=alphaBounds(base,ox,oy),clean=cleanCapOverlayCell(source,cell);
      if(!baseBounds)throw Error(`${character} cell ${cell} has no canonical character`);
      const target=fittingBounds(fitting,cell,baseBounds);
      const w=Math.max(54,Math.min(config.maxWidth,target.width-2));
      const h=Math.max(24,Math.min(config.maxHeight,target.height-1));
      const left=Math.round((target.minX+target.maxX+1-w)/2),top=target.minY;
      const resized=await sharp(clean.out,{raw:{width:256,height:256,channels:4}})
        .extract({left:clean.minX,top:clean.minY,width:clean.width,height:clean.height})
        .resize({width:w,height:h,fit:'fill',kernel:'lanczos3'}).ensureAlpha().raw().toBuffer();
      const cellOverlay=Buffer.alloc(256*256*4),cellMask=new Uint8Array(256*256);
      place(cellOverlay,cellMask,resized,w,h,left,top);
      console.log(character,'cell',cell,'fit',left,top,w,h,'source pixels',clean.pixels);
      for(let y=0;y<256;y++)for(let x=0;x<256;x++){
        const s=(y*256+x)*4,d=((oy+y)*1024+ox+x)*4,a=cellOverlay[s+3];
        if(a)cellOverlay.copy(overlay,d,s,s+4);
        if(a){hide[d]=hide[d+1]=hide[d+2]=255;hide[d+3]=a;opaque++;}
      }
    }
    if(opaque<30000)throw Error(`${character} cap extraction is unexpectedly sparse: ${opaque}`);
    const outDir=path.join(root,'assets/speaking-system/cosmetics',character);fs.mkdirSync(outDir,{recursive:true});
    await sharp(overlay,{raw:{width:1024,height:1024,channels:4}}).webp({lossless:true}).toFile(path.join(outDir,'ivory-botanical-cap.webp'));
    await sharp(hide,{raw:{width:1024,height:1024,channels:4}}).webp({lossless:true}).toFile(path.join(outDir,'ivory-botanical-cap-hide.webp'));
    for(const [label,background,input] of [['composite','#292725',base],['light','#eee8df',base],['blink','#77716c',blink]]){
      const composed=sharp(input,{raw:{width:1024,height:1024,channels:4}}).composite([
        {input:hide,raw:{width:1024,height:1024,channels:4},blend:'dest-out'},
        {input:overlay,raw:{width:1024,height:1024,channels:4}}
      ]);
      await composed.flatten({background}).jpeg({quality:94}).toFile(path.join(sourceDir,`qa-${character}-${label}.jpg`));
    }
    await sharp(base,{raw:{width:1024,height:1024,channels:4}}).composite([
      {input:hide,raw:{width:1024,height:1024,channels:4},blend:'dest-out'},
      {input:overlay,raw:{width:1024,height:1024,channels:4}}
    ]).png().toFile(path.join(sourceDir,`${character}-fit-reference.png`));
    console.log(character,'cap mask pixels',opaque);
    if(character==='eddy'){
      const front=cleanCapOverlayCell(source,0);
      display=await sharp(front.out,{raw:{width:256,height:256,channels:4}}).extract({left:front.minX,top:front.minY,width:front.width,height:front.height}).resize({width:460}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    }
  }
  const shared=path.join(root,'assets/speaking-system/cosmetics/shared');fs.mkdirSync(shared,{recursive:true});
  await sharp(display.data,{raw:{width:display.info.width,height:display.info.height,channels:4}}).png().toFile(path.join(shared,'ivory-botanical-cap-display.png'));
})();
