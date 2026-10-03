// Build two visually distinct all-character hats from transparent directional
// sources while preserving the accepted per-character cap landmarks.
const fs=require('node:fs'),path=require('node:path');
const sharp=require(process.env.HOME+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');

const root=path.resolve(__dirname,'..');
const sourceDir=path.join(root,'tools/mascot-art/wardrobe/all-fish-bucket-race-cap');
const mascotDir=path.join(root,'assets/speaking-system/mascots/v4');
const cosmeticDir=path.join(root,'assets/speaking-system/cosmetics');
const characters={
  eddy:{base:'eddy-standing.png',blink:'eddy-blink.png'},
  noir:{base:'noir-standing.png',blink:'noir-blink-v1.png'},
  celeste:{base:'celeste-standing.png',blink:'celeste-blink-v1.png'},
  phoebe:{base:'phoebe-standing.png',blink:'phoebe-blink.png'},
  elsie:{base:'elsie-standing.png',blink:'elsie-blink-registered.png'}
};
const hats={
  'navy-fish-bucket-hat':{
    source:'navy-fish-bucket-hat-source.png',widthScale:1.16,heightScale:1.08,bottomAdjust:0,
    minWidth:62,maxWidth:120,minHeight:30,maxHeight:66,minPixels:1450
  },
  'ivory-racecar-baseball-cap':{
    source:'ivory-racecar-baseball-cap-source.png',widthScale:1,heightScale:1,bottomAdjust:0,
    minWidth:54,maxWidth:108,minHeight:24,maxHeight:62,minPixels:950
  }
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

function cellBounds(data,cell,threshold=48){
  const ox=cell%4*256,oy=Math.floor(cell/4)*256;let minX=256,minY=256,maxX=-1,maxY=-1,pixels=0;
  for(let y=0;y<256;y++)for(let x=0;x<256;x++){
    const i=((oy+y)*1024+ox+x)*4;if(data[i+3]<threshold)continue;
    minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);pixels++;
  }
  return maxX<0?null:{minX,minY,maxX,maxY,width:maxX-minX+1,height:maxY-minY+1,pixels};
}

function cleanSourceCell(source,cell,minPixels){
  const ox=cell%4*256,oy=Math.floor(cell/4)*256,mask=new Uint8Array(256*256);
  for(let y=0;y<256;y++)for(let x=0;x<256;x++){
    const i=((oy+y)*1024+ox+x)*4;if(source[i+3]>=44)mask[y*256+x]=1;
  }
  const keep=components(mask,256,256).sort((a,b)=>b.length-a.length)[0]||[];
  if(keep.length<minPixels)throw Error(`source cell ${cell} is incomplete: ${keep.length}px`);
  let minX=256,minY=256,maxX=-1,maxY=-1;
  const out=Buffer.alloc(256*256*4);
  for(const p of keep){
    const x=p%256,y=Math.floor(p/256),src=((oy+y)*1024+ox+x)*4,dst=p*4;
    source.copy(out,dst,src,src+4);
    minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);
  }
  if(maxX-minX<45||maxY-minY<24)throw Error(`source cell ${cell} has implausible bounds`);
  // Image generation uses generic transparent ear holes.  Close every fully
  // enclosed transparent hole with the source hat's own average fabric colour;
  // the accepted character-specific ears are reopened after registration.
  let sr=0,sg=0,sb=0,samples=0;
  for(const p of keep){const i=p*4;if(out[i+3]>=180){sr+=out[i];sg+=out[i+1];sb+=out[i+2];samples++;}}
  const fabric=samples?[Math.round(sr/samples),Math.round(sg/samples),Math.round(sb/samples)]:[32,45,79];
  const outside=new Uint8Array(256*256),todo=[];
  for(let x=0;x<256;x++)for(const y of [0,255]){const p=y*256+x;if(out[p*4+3]<44&&!outside[p]){outside[p]=1;todo.push(p);}}
  for(let y=0;y<256;y++)for(const x of [0,255]){const p=y*256+x;if(out[p*4+3]<44&&!outside[p]){outside[p]=1;todo.push(p);}}
  for(let at=0;at<todo.length;at++){
    const p=todo[at],x=p%256,y=Math.floor(p/256);
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const nx=x+dx,ny=y+dy,n=ny*256+nx;
      if(nx>=0&&nx<256&&ny>=0&&ny<256&&out[n*4+3]<44&&!outside[n]){outside[n]=1;todo.push(n);}
    }
  }
  for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){
    const p=y*256+x,i=p*4;if(out[i+3]>=44||outside[p])continue;
    out[i]=fabric[0];out[i+1]=fabric[1];out[i+2]=fabric[2];out[i+3]=255;
  }
  return {out,minX,minY,maxX,maxY,width:maxX-minX+1,height:maxY-minY+1,pixels:keep.length};
}

function place(dst,rgba,w,h,left,top){
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const s=(y*w+x)*4,a=rgba[s+3];if(a<8)continue;
    const px=left+x,py=top+y;if(px<0||px>=256||py<0||py>=256)continue;
    const d=(py*256+px)*4;rgba.copy(dst,d,s,s+4);
  }
}

// The accepted botanical cap contains character-specific ear openings.  Punch
// those exact openings through each new hat wherever the canonical ear is
// present, so no generic source opening can cut an eye or bury an ear.
function identitySeed(character,r,g,b,a,x,center,width){
  if(a<72||Math.abs(x-center)<width*.13)return false;
  if(character==='celeste')return r>150&&r>g+16&&r>b+8&&g<180;
  if(character==='noir')return r>62&&r>g*1.22&&r>b*1.08&&g<105;
  const warmEar=r>88&&r>g*1.22&&r>b*1.35&&g<130;
  const blueBow=character==='elsie'&&b>72&&b>r*1.18&&b>g*1.08;
  return warmEar||blueBow;
}

function restoreAcceptedEarOpenings(cellOverlay,accepted,base,cell,landmark,character){
  const ox=cell%4*256,oy=Math.floor(cell/4)*256;
  const upperLimit=landmark.minY+Math.round(landmark.height*.76),center=(landmark.minX+landmark.maxX)/2;
  let opening=new Uint8Array(256*256);
  for(let y=Math.max(0,landmark.minY-4);y<=Math.min(255,upperLimit);y++)for(let x=Math.max(0,landmark.minX-6);x<=Math.min(255,landmark.maxX+6);x++){
    const atlas=((oy+y)*1024+ox+x)*4;
    if(accepted[atlas+3]<16&&identitySeed(character,base[atlas],base[atlas+1],base[atlas+2],base[atlas+3],x,center,landmark.width))opening[y*256+x]=1;
  }
  for(let pass=0;pass<2;pass++){
    const next=Uint8Array.from(opening);
    for(let y=1;y<255;y++)for(let x=1;x<255;x++){
      const p=y*256+x;if(opening[p]||(!opening[p-1]&&!opening[p+1]&&!opening[p-256]&&!opening[p+256]))continue;
      const atlas=((oy+y)*1024+ox+x)*4;
      if(accepted[atlas+3]<24&&base[atlas+3]>=32)next[p]=1;
    }
    opening=next;
  }
  for(let p=0;p<opening.length;p++)if(opening[p]){
    const i=p*4;if(cellOverlay[i+3]>=8)cellOverlay[i]=cellOverlay[i+1]=cellOverlay[i+2]=cellOverlay[i+3]=0;
  }
}

function padTransparentRgb(atlas,passes=3){
  let current=Buffer.from(atlas);
  for(let pass=0;pass<passes;pass++){
    const next=Buffer.from(current);
    for(let cell=0;cell<16;cell++){
      const ox=cell%4*256,oy=Math.floor(cell/4)*256;
      for(let y=0;y<256;y++)for(let x=0;x<256;x++){
        const d=((oy+y)*1024+ox+x)*4;if(current[d+3])continue;
        let r=0,g=0,b=0,n=0;
        for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
          const nx=x+dx,ny=y+dy;if(nx<0||nx>=256||ny<0||ny>=256)continue;
          const s=((oy+ny)*1024+ox+nx)*4;if(!current[s+3]&&!current[s]&&!current[s+1]&&!current[s+2])continue;
          r+=current[s];g+=current[s+1];b+=current[s+2];n++;
        }
        if(n){next[d]=Math.round(r/n);next[d+1]=Math.round(g/n);next[d+2]=Math.round(b/n);}
      }
    }
    current=next;
  }
  return current;
}

function atlasFromCells(target,cell,cellBuffer){
  const ox=cell%4*256,oy=Math.floor(cell/4)*256;
  for(let y=0;y<256;y++)for(let x=0;x<256;x++){
    const s=(y*256+x)*4,d=((oy+y)*1024+ox+x)*4;cellBuffer.copy(target,d,s,s+4);
  }
}

function closeDisplayEarSlots(source,maxGap=34){
  const out=Buffer.from(source);
  for(let y=0;y<256;y++){
    let x=0;
    while(x<256){
      while(x<256&&out[(y*256+x)*4+3]>=44)x++;
      const start=x;
      while(x<256&&out[(y*256+x)*4+3]<44)x++;
      const end=x-1,width=end-start+1;
      if(start===0||x>=256||width<1||width>maxGap)continue;
      const left=(y*256+start-1)*4,right=(y*256+x)*4;
      if(out[left+3]<44||out[right+3]<44)continue;
      for(let px=start;px<=end;px++){
        const t=(px-start+1)/(width+1),d=(y*256+px)*4;
        for(let channel=0;channel<3;channel++)out[d+channel]=Math.round(out[left+channel]*(1-t)+out[right+channel]*t);
        out[d+3]=255;
      }
    }
  }
  return out;
}

(async()=>{
  const normalized={};
  for(const [id,hat] of Object.entries(hats)){
    normalized[id]=await sharp(path.join(sourceDir,hat.source)).resize(1024,1024,{fit:'fill',kernel:'lanczos3'}).ensureAlpha().raw().toBuffer();
  }
  for(const [character,config] of Object.entries(characters)){
    const base=await sharp(path.join(mascotDir,config.base)).resize(1024,1024,{fit:'fill'}).ensureAlpha().raw().toBuffer();
    const blink=await sharp(path.join(mascotDir,config.blink)).resize(1024,1024,{fit:'fill'}).ensureAlpha().raw().toBuffer();
    const accepted=await sharp(path.join(cosmeticDir,character,'ivory-botanical-cap.webp')).ensureAlpha().raw().toBuffer();
    for(const [id,hat] of Object.entries(hats)){
      const overlay=Buffer.alloc(1024*1024*4),hide=Buffer.alloc(1024*1024*4);let visible=0;
      for(let cell=0;cell<16;cell++){
        const landmark=cellBounds(accepted,cell);if(!landmark)throw Error(`${character} cell ${cell} has no accepted cap landmark`);
        const source=cleanSourceCell(normalized[id],cell,hat.minPixels);
        const w=Math.max(hat.minWidth,Math.min(hat.maxWidth,Math.round(landmark.width*hat.widthScale)));
        const h=Math.max(hat.minHeight,Math.min(hat.maxHeight,Math.round(landmark.height*hat.heightScale)));
        const left=Math.round((landmark.minX+landmark.maxX+1-w)/2);
        const bottom=Math.min(landmark.maxY+hat.bottomAdjust,landmark.maxY);
        const top=bottom-h+1;
        const resized=await sharp(source.out,{raw:{width:256,height:256,channels:4}})
          .extract({left:source.minX,top:source.minY,width:source.width,height:source.height})
          .resize({width:w,height:h,fit:'fill',kernel:'lanczos3'}).ensureAlpha().raw().toBuffer();
        const cellOverlay=Buffer.alloc(256*256*4);place(cellOverlay,resized,w,h,left,top);
        restoreAcceptedEarOpenings(cellOverlay,accepted,base,cell,landmark,character);
        atlasFromCells(overlay,cell,cellOverlay);
        for(let y=0;y<256;y++)for(let x=0;x<256;x++){
          const s=(y*256+x)*4;if(cellOverlay[s+3]<8)continue;
          const d=((Math.floor(cell/4)*256+y)*1024+(cell%4*256+x))*4;
          hide[d]=hide[d+1]=hide[d+2]=255;hide[d+3]=cellOverlay[s+3];visible++;
        }
        console.log(character,id,'cell',cell,'fit',left,top,w,h,'source',source.pixels);
      }
      if(visible<24000)throw Error(`${character} ${id} is unexpectedly sparse: ${visible}`);
      const padded=padTransparentRgb(overlay,3),outDir=path.join(cosmeticDir,character);fs.mkdirSync(outDir,{recursive:true});
      await sharp(padded,{raw:{width:1024,height:1024,channels:4}}).webp({lossless:true}).toFile(path.join(outDir,`${id}.webp`));
      await sharp(hide,{raw:{width:1024,height:1024,channels:4}}).webp({lossless:true}).toFile(path.join(outDir,`${id}-hide.webp`));
      await sharp(overlay,{raw:{width:1024,height:1024,channels:4}}).png().toFile(path.join(sourceDir,`${character}-${id}-item-source.png`));
      for(const [label,background,input] of [['dark','#292725',base],['light','#eee8df',base],['blink','#77716c',blink]]){
        await sharp(input,{raw:{width:1024,height:1024,channels:4}}).composite([
          {input:hide,raw:{width:1024,height:1024,channels:4},blend:'dest-out'},
          {input:overlay,raw:{width:1024,height:1024,channels:4}}
        ]).flatten({background}).jpeg({quality:94}).toFile(path.join(sourceDir,`qa-${character}-${id}-${label}.jpg`));
      }
      console.log(character,id,'visible pixels',visible);
    }
  }
  const shared=path.join(cosmeticDir,'shared');fs.mkdirSync(shared,{recursive:true});
  for(const id of Object.keys(hats)){
    // Build the shop card from the unpadded QA atlas. Runtime WebPs carry
    // transparent RGB edge padding for clean bilinear sampling; trimming that
    // padded image can retain faint neighbouring-cell colour at the card edge.
    // The shop card is a clean product view, not a character-fit view, so use
    // the source cell after its generic ear holes are closed but before Eddy's
    // character-specific ear openings are restored.
    const sourceFront=cleanSourceCell(normalized[id],0,hats[id].minPixels),displaySource=closeDisplayEarSlots(sourceFront.out);
    const front=await sharp(displaySource,{raw:{width:256,height:256,channels:4}})
      .extract({left:sourceFront.minX,top:sourceFront.minY,width:sourceFront.width,height:sourceFront.height})
      .resize({width:460,height:300,fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer();
    await sharp({create:{width:520,height:360,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite([{input:front,gravity:'center'}]).png().toFile(path.join(shared,`${id}-display.png`));
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
