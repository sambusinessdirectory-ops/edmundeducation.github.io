import { DREAM_CLOUDS,DREAM_BELLY } from './sentence-structure-dream-geometry.mjs?v=20260912-dream1';

// One complete repaint keeps cloud motion and breathing free of stale silhouettes.
function livingMask(image){
 const c=document.createElement('canvas');c.width=image.width;c.height=image.height;
 const ctx=c.getContext('2d',{willReadFrequently:true}),pixels=ctx.createImageData(c.width,c.height),p=pixels.data;
 for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){
  const i=(y*c.width+x)*4;
  const weight=(cx,cy,rx,ry)=>Math.max(0,1-((x-cx)/rx)**2-((y-cy)/ry)**2)**2;
  p[i]=Math.round(Math.max(...DREAM_CLOUDS.map(r=>weight(...r)))*255);
  const b=DREAM_BELLY;p[i+1]=Math.round(weight(b.x,b.y,b.rx,b.ry)*255);p[i+2]=0;p[i+3]=255;
 }
 ctx.putImageData(pixels,0,0);return c;
}
const vertex=`attribute vec2 a_position;varying vec2 v_uv;
void main(){v_uv=vec2(a_position.x*.5+.5,.5-a_position.y*.5);gl_Position=vec4(a_position,0.,1.);}`;
const fragment=`precision highp float;
uniform sampler2D u_image;uniform sampler2D u_mask;uniform float u_time;uniform float u_motion;varying vec2 v_uv;
void main(){
 vec3 mask=texture2D(u_mask,v_uv).rgb;vec2 p=v_uv*vec2(1536.,1024.);float t=u_time;
 vec2 delta=vec2(sin(t*.25+p.y*.018)*2.6,cos(t*.18+p.x*.012)*.85)*mask.r;
 float breath=sin(t*6.28318530718/5.8)*.013;
 delta+=vec2((p.x-387.)*(-breath*.25),(p.y-469.)*(-breath))*mask.g;
 vec2 uv=clamp(v_uv+delta*u_motion/vec2(1536.,1024.),vec2(.0001),vec2(.9999));
 gl_FragColor=vec4(texture2D(u_image,uv).rgb,1.);
}`;
export function createDreamScenery(canvas,image){
 const gl=canvas.getContext('webgl',{alpha:false,antialias:false,preserveDrawingBuffer:true});
 if(!gl)return createCanvasFallback(canvas,image);
 const shaders=[],textures=[];
 const compile=(type,code)=>{const s=gl.createShader(type);gl.shaderSource(s,code);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));shaders.push(s);return s;};
 const program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);
 if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));
 gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
 const position=gl.getAttribLocation(program,'a_position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
 for(const [i,source] of [image,livingMask(image)].entries()){
  const texture=gl.createTexture();textures.push(texture);gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,texture);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source);gl.uniform1i(gl.getUniformLocation(program,i?'u_mask':'u_image'),i);
 }
 const time=gl.getUniformLocation(program,'u_time'),motion=gl.getUniformLocation(program,'u_motion');
 canvas.dataset.renderer='webgl';
 return {paint(t,still=false){gl.viewport(0,0,canvas.width,canvas.height);gl.uniform1f(time,t);gl.uniform1f(motion,still?0:1);gl.drawArrays(gl.TRIANGLES,0,6);canvas.dataset.time=String(t);},
 destroy(){textures.forEach(x=>gl.deleteTexture(x));shaders.forEach(x=>gl.deleteShader(x));gl.deleteBuffer(buffer);gl.deleteProgram(program);}};
}

function createCanvasFallback(canvas,image){
 // Strip meshes are a low-resolution fallback for browsers without WebGL.
 const ctx=canvas.getContext('2d'),mask=livingMask(image),m=mask.getContext('2d').getImageData(0,0,mask.width,mask.height).data;
 canvas.dataset.renderer='canvas';
 return {paint(t,still=false){
  ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,canvas.width,canvas.height);
  if(!still)for(let y=0;y<image.height;y+=18)for(let x=0;x<image.width;x+=18){
   const index=(Math.min(image.height-1,y+9)*image.width+Math.min(image.width-1,x+9))*4;
   const strength=(m[index]+m[index+1]+m[index+2])/255;if(strength<.2)continue;
   const dx=Math.sin(t*.8+x*.011+y*.007)*strength*.7;
   ctx.drawImage(image,x,y,Math.min(18,image.width-x),Math.min(18,image.height-y),x+dx,y,Math.min(18,image.width-x),Math.min(18,image.height-y));
  }
  canvas.dataset.time=String(t);
 },destroy(){}};
}
