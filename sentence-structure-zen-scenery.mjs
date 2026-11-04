import { WATER_SHAPES, NORREN, ART_SIZE } from './sentence-structure-zen-geometry.mjs?v=20260912-garden-normal';

// The living-paint mask separates foliage, water and cloth from the hardscape.
// The entire scene is redrawn once, so moving foliage leaves no old silhouette.
function livingMask(image){
 const c=document.createElement('canvas');c.width=image.width;c.height=image.height;
 const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);
 const pixels=ctx.getImageData(0,0,c.width,c.height),p=pixels.data;
 for(let i=0;i<p.length;i+=4){
  const x=(i/4)%c.width,y=Math.floor(i/4/c.width),r=p[i],g=p[i+1],b=p[i+2];
  const green=Math.max(0,Math.min(1,(g-Math.max(r*.96,b*1.1)-1)/22));
  const maple=((x>400&&x<800&&y<150)||(x>1260&&x<1640&&y>400))?Math.max(0,Math.min(1,(r-g-30)/60)):0;
  p[i]=Math.round(Math.max(green,maple)*255);p[i+1]=0;p[i+2]=0;p[i+3]=255;
 }
 ctx.putImageData(pixels,0,0);ctx.fillStyle='#00ff00';
 for(const poly of WATER_SHAPES){ctx.beginPath();poly.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();}
 const n=NORREN;ctx.fillStyle='#0000ff';ctx.fillRect(n.left-5,n.top,n.width+10,n.height+8);
 return c;
}
const vertex=`attribute vec2 a_position;varying vec2 v_uv;
void main(){v_uv=vec2(a_position.x*.5+.5,.5-a_position.y*.5);gl_Position=vec4(a_position,0.,1.);}`;
const fragment=`precision mediump float;
uniform sampler2D u_image;uniform sampler2D u_mask;uniform float u_time;uniform float u_motion;varying vec2 v_uv;
void main(){
 vec3 mask=texture2D(u_mask,v_uv).rgb;vec2 p=v_uv*vec2(${ART_SIZE.width.toFixed(1)},${ART_SIZE.height.toFixed(1)});float t=u_time;
 // Trunks/roots and all rock, sand, lantern and building pixels stay anchored.
 float phase=p.x*.011+p.y*.007;
 float wind=sin(t*.87+phase)*1.35+sin(t*.53-p.y*.016)*.52;
 vec2 delta=vec2(wind,sin(t*.67+phase)*.35)*mask.r;
 // Water receives its own slow refraction rather than the foliage oscillation.
 delta+=vec2(sin(t*.48+p.y*.12)*1.6+sin(t*.24+p.x*.028)*.8,cos(t*.43+p.x*.035)*.55)*mask.g;
 float cloth=clamp((p.y-${NORREN.top.toFixed(1)})/${NORREN.height.toFixed(1)},0.,1.);
 delta+=vec2(sin(t*.8+cloth*1.9)*2.1*cloth*cloth,sin(t*.65)*.38*cloth)*mask.b;
 vec2 uv=clamp(v_uv+delta*u_motion/vec2(${ART_SIZE.width.toFixed(1)},${ART_SIZE.height.toFixed(1)}),vec2(.0001),vec2(.9999));
 gl_FragColor=vec4(texture2D(u_image,uv).rgb,1.);
}`;
export function createGardenScenery(canvas,image){
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
