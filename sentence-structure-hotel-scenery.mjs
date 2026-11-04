import {HOTEL_ART,HOTEL_SCALE,HOTEL_TRAIN,HOTEL_TRAIN_OUTLINE,HOTEL_FLAGS,HOTEL_PLANTS,HOTEL_TREES,HOTEL_LIGHTS,HOTEL_SILHOUETTE,hotelTrainPose,hotelFlagOffset,hotelLightLevel} from './sentence-structure-hotel-geometry.mjs?v=20260914-hotel3b';
import {createHotelVegetation} from './sentence-structure-hotel-vegetation.mjs?v=20260914-hotel3b';
const W=HOTEL_ART.width,H=HOTEL_ART.height;
const makeCanvas=()=>Object.assign(document.createElement('canvas'),{width:W,height:H});
function polygon(ctx,points){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();}
export function exteriorClip(ctx){ctx.beginPath();ctx.rect(0,0,W,H);HOTEL_SILHOUETTE.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.rect(1244,15,140,94);ctx.clip('evenodd');}
// Exact text areas only. These matched overlays were approved after the image
// editor failed; each row preserves the surrounding plaster's light gradient.
export const HOTEL_LETTERING_REPAIRS=[
 [191,281,73,47],[182,390,89,46],[191,501,76,48],
 [190,610,77,47],[191,722,76,48],[191,835,76,48],
 [1123,277,96,51],[1123,381,98,63],[1131,500,91,52],
 [1127,608,99,54],[1121,726,107,52],[1131,827,88,64],
 [136,1040,110,46],[38,32,105,124]
];
function restorePaint(ctx,reference){
 const src=document.createElement('canvas');src.width=W;src.height=H;const read=src.getContext('2d',{willReadFrequently:true});read.drawImage(reference,0,0);
 const pixels=read.getImageData(0,0,W,H).data;
 for(const [x,y,w,h] of HOTEL_LETTERING_REPAIRS){
  const data=ctx.getImageData(x,y,w,h),d=data.data;
  if(y===32){
   // Inpaint only the lettering and its antialiasing from immediate sky
   // neighbours. A broad gradient made an inverted, pale text silhouette.
   const mask=new Uint8Array(w*h),core=new Uint8Array(w*h);
   for(let i=0;i<w*h;i++)core[i]=(d[i*4]+d[i*4+1]+d[i*4+2])/3<175?1:0;
   for(let yy=2;yy<h-2;yy++)for(let xx=2;xx<w-2;xx++)if(core[yy*w+xx])for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)mask[(yy+dy)*w+xx+dx]=1;
   const a=new Float32Array(d),b=new Float32Array(d);let old=a,next=b;
   for(let n=0;n<90;n++){for(let yy=1;yy<h-1;yy++)for(let xx=1;xx<w-1;xx++){const p=yy*w+xx;if(!mask[p])continue;for(let k=0;k<3;k++)next[p*4+k]=(old[(p-1)*4+k]+old[(p+1)*4+k]+old[(p-w)*4+k]+old[(p+w)*4+k])/4;}[old,next]=[next,old];}
   for(let i=0;i<w*h;i++)if(mask[i])for(let k=0;k<3;k++)d[i*4+k]=Math.round(old[i*4+k]);ctx.putImageData(data,x,y);continue;
  }
  for(let row=0;row<h;row++)for(let col=0;col<w;col++){
   const a=(y===390?(410*W+195):((y+row)*W+x-3))*4,b=(y===390?(410*W+255):((y+row)*W+x+w+3))*4,i=(row*w+col)*4,u=col/(w-1);
   let feather=Math.min(1,col/2,(w-1-col)/2,row/2,(h-1-row)/2);
   for(let k=0;k<3;k++)d[i+k]=Math.round(d[i+k]*(1-feather)+(pixels[a+k]*(1-u)+pixels[b+k]*u)*feather);
  }
  ctx.putImageData(data,x,y);
 }
 // Lettering follows the slight tilt of the painted van body.
 ctx.save();ctx.translate(190,1047);ctx.transform(1,-.015,.015,1,0,0);ctx.fillStyle='#534537';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='8.5px Georgia, serif';
 ['THE GRAND','ENGLISH','HOTEL'].forEach((line,i)=>ctx.fillText(line,0,i*13));ctx.restore();
}
// Runtime compositing retains original pixels outside authorized repair areas.
export function makeHotelPlate(reference,restoration){
 const c=makeCanvas(),ctx=c.getContext('2d');ctx.drawImage(reference,0,0,W,H);
 const repair=(points)=>{ctx.save();polygon(ctx,points);ctx.clip();ctx.drawImage(restoration,0,0,W,H);ctx.restore();};
 repair([[243,40],[307,40],[307,86],[243,88]]);repair([[1167,40],[1226,40],[1226,89],[1167,89]]);
 repair(HOTEL_TRAIN_OUTLINE);
 repair([[655,568],[739,568],[739,685],[655,685]]);
 repair([[1254,50],[1376,50],[1376,99],[1254,99]]);
 repair([[1201,1008],[1334,1008],[1334,1053],[1201,1053]]);
 restorePaint(ctx,reference);
 return c;
}
function masks(plate){
 const c=makeCanvas(),ctx=c.getContext('2d'),src=plate.getContext('2d',{willReadFrequently:true}).getImageData(0,0,W,H).data,m=ctx.createImageData(W,H),d=m.data;
 const ellipse=(x,y,r)=>{const q=((x-r[0])/r[2])**2+((y-r[1])/r[3])**2;return q<1?(1-q)**.7:0;};
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){
  const i=(y*W+x)*4,r=src[i],g=src[i+1],b=src[i+2];
  // Green foliage and muted blue-green conifers; warm plaster is excluded.
  const foliage=Math.min(1,Math.max(0,(g-r+22)/28))*Math.min(1,Math.max(0,(174-(r+g+b)/3)/60));
  let plant=0,tree=0,light=0,phase=0;
  for(const a of HOTEL_PLANTS)if(y<a[4])plant=Math.max(plant,ellipse(x,y,[a[0],a[1],a[2]*1.08,a[3]*1.18])*Math.min(1,(a[4]-y)/15));
  for(const a of HOTEL_TREES)if(y<a[4])tree=Math.max(tree,ellipse(x,y,[a[0],a[1],a[2]*1.12,a[3]*1.24])*Math.min(1,(a[4]-y)/40));
  for(let j=0;j<HOTEL_LIGHTS.length;j++){const [lx,ly,radius]=HOTEL_LIGHTS[j],dist=((x-lx)/radius)**2+((y-ly)/radius)**2,v=Math.exp(-dist*2.6);if(v>light){light=v;phase=(j*.61803398875)%1;}}
  d[i]=Math.round(plant*foliage*255);d[i+1]=Math.round(tree*foliage*255);d[i+2]=Math.round(light*255);d[i+3]=Math.round(phase*255);
 }
 // Upload bytes directly: a canvas would premultiply the phase channel and
 // erase the light mask wherever phase is zero.
 return d;
}
const vertex=`attribute vec2 a_position;varying vec2 v_uv;void main(){v_uv=vec2(a_position.x*.5+.5,.5-a_position.y*.5);gl_Position=vec4(a_position,0.,1.);}`;
const fragment=`precision highp float;uniform sampler2D u_image;uniform sampler2D u_mask;uniform sampler2D u_lift;uniform vec4 u_lift_rect;uniform float u_reveal;uniform float u_time;uniform float u_motion;varying vec2 v_uv;
void main(){vec4 mask=texture2D(u_mask,v_uv);vec2 p=v_uv*vec2(1402.,1122.);float t=u_time;
 vec3 color=texture2D(u_image,v_uv).rgb;
 float phase=mask.a*6.2831853;float level=.88+.18*sin(t*.69+phase)+.09*sin(t*.31+phase*2.1);
 color*=1.+(level-1.)*mask.b*u_motion;
 color+=vec3(1.,.69,.30)*max(0.,level-.97)*mask.b*.25*u_motion;
 vec2 liftUV=(p-u_lift_rect.xy)/u_lift_rect.zw;
 float oval=1.-smoothstep(.72,1.,length((liftUV-vec2(.5))/vec2(.48)));
 color=mix(color,texture2D(u_lift,clamp(liftUV,0.,1.)).rgb,oval*u_reveal);
 gl_FragColor=vec4(color,1.);}`;
export function createHotelScenery(canvas,plate,vegetationPlate){
 const vegetation=vegetationPlate?createHotelVegetation(plate,vegetationPlate):null;
 const gl=canvas.getContext('webgl',{alpha:false,antialias:false,preserveDrawingBuffer:true});
 if(!gl){canvas.dataset.renderer='static';return {paint(){},destroy(){}};}
 const shaders=[],textures=[];const compile=(type,code)=>{const s=gl.createShader(type);gl.shaderSource(s,code);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));shaders.push(s);return s;};
 const program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);
 const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const position=gl.getAttribLocation(program,'a_position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
 [plate,masks(plate)].forEach((source,i)=>{const tx=gl.createTexture();textures.push(tx);gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,tx);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);if(i)gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,W,H,0,gl.RGBA,gl.UNSIGNED_BYTE,source);else gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source);gl.uniform1i(gl.getUniformLocation(program,i?'u_mask':'u_image'),i);});
 const liftTexture=gl.createTexture();textures.push(liftTexture);gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,liftTexture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([0,0,0,255]));gl.uniform1i(gl.getUniformLocation(program,'u_lift'),2);
 const time=gl.getUniformLocation(program,'u_time'),motion=gl.getUniformLocation(program,'u_motion'),liftRect=gl.getUniformLocation(program,'u_lift_rect'),reveal=gl.getUniformLocation(program,'u_reveal');canvas.dataset.renderer='webgl';
 return {vegetation,paint(t,still=false,lift){if(vegetation){gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,textures[0]);gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,gl.RGBA,gl.UNSIGNED_BYTE,vegetation.paint(t,still));}gl.viewport(0,0,canvas.width,canvas.height);gl.uniform1f(time,t);gl.uniform1f(motion,still?0:1);gl.uniform1f(reveal,lift?.alpha||0);const r=lift?.rect||{x:0,y:0,w:1,h:1};gl.uniform4f(liftRect,r.x,r.y,r.w,r.h);if(lift?.alpha){gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,liftTexture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,lift.canvas);}gl.drawArrays(gl.TRIANGLES,0,6);canvas.dataset.time=String(t);},destroy(){textures.forEach(x=>gl.deleteTexture(x));shaders.forEach(x=>gl.deleteShader(x));gl.deleteBuffer(buffer);gl.deleteProgram(program);gl.getExtension('WEBGL_lose_context')?.loseContext();}};
}
function cutout(reference,points){const c=makeCanvas(),ctx=c.getContext('2d');polygon(ctx,points);ctx.clip();ctx.drawImage(reference,0,0,W,H);return c;}
export function prepareHotelTrain(source){
 const c=Object.assign(document.createElement('canvas'),{width:source.width,height:source.height}),ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(source,0,0);const im=ctx.getImageData(0,0,c.width,c.height),d=im.data;let left=c.width,top=c.height,right=0,bottom=0;
 for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){const i=(y*c.width+x)*4,spill=d[i+1]-Math.max(d[i],d[i+2]),alpha=Math.max(0,Math.min(1,1-(spill-12)/45));d[i+3]=Math.round(alpha*255);if(spill>12)d[i+1]=Math.min(d[i+1],Math.max(d[i],d[i+2])+6);if(alpha>.5){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}}
 ctx.putImageData(im,0,0);
 const bounds={x:left,y:top,w:right-left+1,h:bottom-top+1};
 // Project each solid face once at 4x. A complete premultiplied sprite is
 // translated per frame, avoiding moving strip seams and alpha flicker.
 const sprite=Object.assign(document.createElement('canvas'),{width:448,height:400}),sc=sprite.getContext('2d');sc.scale(4,4);sc.imageSmoothingQuality='high';
 const split=bounds.w*.47,front=32,side=80,h=55,pad=24;
 sc.save();sc.transform(front/split,.42*front/split,0,h/bounds.h,0,pad);sc.drawImage(c,left,top,split+.5,bounds.h,0,0,split+.5,bounds.h);sc.restore();
 sc.save();sc.transform(side/(bounds.w-split),-.368*side/(bounds.w-split),0,h/bounds.h,front,pad+front*.42);sc.drawImage(c,left+split,top,bounds.w-split,bounds.h,0,0,bounds.w-split,bounds.h);sc.restore();
 return {canvas:c,bounds,sprite,width:112,height:100,contact:{x:26.5,y:pad+65.8}};
}
export function drawHotelTrain(ctx,train,pose){
 const x=1307+pose.dx;
 // Nearest rail digitised from the unchanged painting: (1260,316) to
 // (1380,263.2). Both wheelbase projection and travel use this same slope.
 const railY=316-.44*(x+train.contact.x-1260);
 ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 ctx.drawImage(train.sprite,x,railY-train.contact.y,train.width,train.height);
}
let trainClipId=0;
export function createHotelEffects(canvas,reference,completeTrain,{snow=true,trainLayer}={}){
 const ctx=canvas.getContext('2d');
 const train=completeTrain?prepareHotelTrain(completeTrain):null;
 let trainAnimation,trainVisible=true;
 if(train&&trainLayer){
  const id=`hotel-train-clip-${++trainClipId}`,path=points=>points.map(([x,y],i)=>`${i?'L':'M'}${x/W} ${y/H}`).join(' ')+'Z';
  trainLayer.innerHTML=`<svg width="0" height="0" aria-hidden="true"><defs><clipPath id="${id}" clipPathUnits="objectBoundingBox"><path clip-rule="evenodd" d="M0 0H1V1H0Z ${path(HOTEL_SILHOUETTE)} ${path([[1244,15],[1384,15],[1384,109],[1244,109]])}"/></clipPath></defs></svg>`;
  trainLayer.style.clipPath=`url(#${id})`;
  const c=train.sprite;c.className='hotel-funicular';
  c.style.cssText=`position:absolute;left:${1307*HOTEL_SCALE}px;top:${(316-.44*(1307+train.contact.x-1260)-train.contact.y)*HOTEL_SCALE}px;width:${train.width*HOTEL_SCALE}px;height:${train.height*HOTEL_SCALE}px;will-change:transform;`;
  trainLayer.append(c);
  trainAnimation=c.animate([HOTEL_TRAIN.from,HOTEL_TRAIN.to].map(dx=>({transform:`translate3d(${dx*HOTEL_SCALE}px,${dx*HOTEL_TRAIN.slope*HOTEL_SCALE}px,0)`})),{duration:HOTEL_TRAIN.period*1000,iterations:Infinity,easing:'linear'});trainAnimation.pause();
 }
 const flags=HOTEL_FLAGS.map(f=>cutout(reference,[[f.x+2,f.y+2],[f.x+13,f.y+1],[f.x+30,f.y+5],[f.x+44,f.y+9],[f.x+59,f.y+8],[f.x+59,f.y+38],[f.x+43,f.y+39],[f.x+28,f.y+34],[f.x+11,f.y+35],[f.x+2,f.y+38]]));
 const random=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
 return {paint(t,still=false){
  ctx.clearRect(0,0,canvas.width,canvas.height);ctx.save();ctx.scale(canvas.width/W,canvas.height/H);
  HOTEL_FLAGS.forEach((f,i)=>{for(let x=0;x<f.w;x+=2){const u=x/f.w,dy=still?0:hotelFlagOffset(t,u,f.phase);ctx.drawImage(flags[i],f.x+x,f.y,2,f.h,f.x+x,f.y+dy,2.15,f.h);}});
  const pose=still?hotelTrainPose(11.8):hotelTrainPose(t);ctx.save();exteriorClip(ctx);if(train&&!trainLayer)drawHotelTrain(ctx,train,pose);if(trainAnimation){if(still){trainAnimation.pause();trainAnimation.currentTime=11800;}else if(trainVisible&&trainAnimation.playState!=='running'){trainAnimation.currentTime=(t%HOTEL_TRAIN.period)*1000;trainAnimation.play();}}ctx.restore();
  if(!still&&snow){ctx.save();exteriorClip(ctx);for(let i=0;i<235;i++){const depth=random(i+700),speed=13+depth*24,x=(random(i+30)*W+Math.sin(t*.25+i)*8+t*(2+depth*2))%(W+12),y=(random(i+500)*H+t*speed)%(H+12)-6;ctx.globalAlpha=.25+depth*.5;ctx.fillStyle='#fff8ed';ctx.beginPath();ctx.ellipse(x,y,.65+depth*1.45,1+depth*1.9,.18,0,Math.PI*2);ctx.fill();}ctx.restore();}
  ctx.restore();canvas.dataset.time=String(t);canvas.dataset.train=JSON.stringify(pose);canvas.dataset.flags=JSON.stringify(HOTEL_FLAGS.map(f=>hotelFlagOffset(t,1,f.phase)));canvas.dataset.lights=JSON.stringify(HOTEL_LIGHTS.map((_,i)=>hotelLightLevel(t,((i*.61803398875)%1)*Math.PI*2)));
 },setVisible(value){trainVisible=value;if(!value)trainAnimation?.pause();},destroy(){trainAnimation?.cancel();trainLayer?.replaceChildren();}};
}
