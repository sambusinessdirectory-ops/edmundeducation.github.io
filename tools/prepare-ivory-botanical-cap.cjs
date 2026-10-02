// Build independently registered ivory botanical-cap overlays and shape-specific
// occlusion masks for every supported standing character.
const fs=require('fs'),path=require('path');
const sharp=require(process.env.HOME+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=path.resolve(__dirname,'..');
const sourceDir=path.join(root,'tools/mascot-art/wardrobe/ivory-botanical-cap');
const mascotDir=path.join(root,'assets/speaking-system/mascots/v4');
const sourcePath=path.join(sourceDir,'cap-directions-source.png');
const characters={
  eddy:{base:'eddy-standing.png',blink:'eddy-blink.png',minWidth:92,maxWidth:106,widthFactor:.79,heightFactor:.54,topOffset:3,restoreDepth:48},
  noir:{base:'noir-standing.png',blink:'noir-blink-v1.png',minWidth:96,maxWidth:112,widthFactor:.76,heightFactor:.54,topOffset:3,restoreDepth:50},
  celeste:{base:'celeste-standing.png',blink:'celeste-blink-v1.png',minWidth:102,maxWidth:118,widthFactor:.70,heightFactor:.52,topOffset:4,restoreDepth:52},
  phoebe:{base:'phoebe-standing.png',blink:'phoebe-blink.png',minWidth:98,maxWidth:114,widthFactor:.72,heightFactor:.52,topOffset:4,restoreDepth:52},
  elsie:{base:'elsie-standing.png',blink:'elsie-blink-registered.png',minWidth:100,maxWidth:116,widthFactor:.70,heightFactor:.52,topOffset:4,restoreDepth:52}
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

(async()=>{
  const source=await sharp(sourcePath).resize(1024,1024,{fit:'fill'}).ensureAlpha().raw().toBuffer();
  let display;
  for(const [character,config] of Object.entries(characters)){
    const base=await sharp(path.join(mascotDir,config.base)).resize(1024,1024,{fit:'fill'}).ensureAlpha().raw().toBuffer();
    const blink=await sharp(path.join(mascotDir,config.blink)).resize(1024,1024,{fit:'fill'}).ensureAlpha().raw().toBuffer();
    const overlay=Buffer.alloc(1024*1024*4),hide=Buffer.alloc(1024*1024*4);let opaque=0;
    for(let cell=0;cell<16;cell++){
      const ox=cell%4*256,oy=Math.floor(cell/4)*256,baseBounds=alphaBounds(base,ox,oy);
      if(!baseBounds)throw Error(`${character} cell ${cell} has no canonical character`);
      const upperBottom=Math.min(256,baseBounds.minY+64),upper=alphaBounds(base,ox,oy,upperBottom);
      const headCenter=Math.round(((upper||baseBounds).minX+(upper||baseBounds).maxX)/2);
      const measured=(upper||baseBounds).width,capWidth=Math.round(Math.max(config.minWidth,Math.min(config.maxWidth,measured*config.widthFactor)));
      const capHeight=Math.round(capWidth*config.heightFactor);
      const resized=await resizedCell(source,cell,capWidth,capHeight),w=resized.info.width,h=resized.info.height;
      const left=Math.round(headCenter-w/2),top=baseBounds.minY+config.topOffset;
      const cellOverlay=Buffer.alloc(256*256*4),cellMask=new Uint8Array(256*256);
      place(cellOverlay,cellMask,resized.data,w,h,left,top);
      botanicalMark(cellOverlay,cell,left,top,w,h);
      // Keep the character's own ears (and Elsie's bow) in front of the cap.
      // Warm/pink inner-ear pixels seed a small base-alpha-clamped expansion,
      // so dark or pale outer ear edges survive without restoring the mane.
      const restoreBottom=Math.min(256,baseBounds.minY+config.restoreDepth);
      const seed=new Uint8Array(256*256);
      for(let y=baseBounds.minY;y<restoreBottom;y++)for(let x=0;x<256;x++){
        const src=((oy+y)*1024+ox+x)*4;
        if(identitySeed(character,base[src],base[src+1],base[src+2],base[src+3],x,headCenter,capWidth))seed[y*256+x]=1;
      }
      const identity=dilateIdentity(seed,base,ox,oy);
      for(let y=baseBounds.minY;y<restoreBottom;y++)for(let x=0;x<256;x++){
        const local=y*256+x;if(cellMask[local]<24||!identity[local])continue;
        const src=((oy+y)*1024+ox+x)*4,dst=local*4;base.copy(cellOverlay,dst,src,src+4);
      }
      for(let y=0;y<256;y++)for(let x=0;x<256;x++){
        const s=(y*256+x)*4,d=((oy+y)*1024+ox+x)*4,a=cellMask[y*256+x];
        if(cellOverlay[s+3])cellOverlay.copy(overlay,d,s,s+4);
        if(a){hide[d]=hide[d+1]=hide[d+2]=255;hide[d+3]=a;opaque++;}
      }
    }
    if(opaque<45000)throw Error(`${character} cap extraction is unexpectedly sparse: ${opaque}`);
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
    if(character==='eddy')display=await resizedCell(source,0,460);
  }
  const shared=path.join(root,'assets/speaking-system/cosmetics/shared');fs.mkdirSync(shared,{recursive:true});
  await sharp(display.data,{raw:{width:display.info.width,height:display.info.height,channels:4}}).png().toFile(path.join(shared,'ivory-botanical-cap-display.png'));
})();
