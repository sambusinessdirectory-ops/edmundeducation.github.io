import {dogMotion} from './sentence-structure-toy-motion.mjs?v=20260912-toy1';
const TAU=Math.PI*2,eyes=[[786,345,36,46],[925,285,24,37]];
const vertex=`attribute vec2 a_position;varying vec2 v_uv;void main(){v_uv=vec2(a_position.x*.5+.5,.5-a_position.y*.5);gl_Position=vec4(a_position,0.,1.);}`;
const fragment=`precision highp float;uniform sampler2D u_image;uniform float u_tilt;varying vec2 v_uv;
void main(){vec2 p=(v_uv*vec2(660.,600.)-vec2(330.,560.))/.49+vec2(670.,1130.);vec2 q=p;
 for(int i=0;i<3;i++){float w=(1.-smoothstep(565.,735.,q.y))*smoothstep(355.,435.,q.x);float a=-u_tilt*w;vec2 d=p-vec2(756.,632.);q=vec2(cos(a)*d.x-sin(a)*d.y,sin(a)*d.x+cos(a)*d.y)+vec2(756.,632.);}
 if(q.x<0.||q.y<0.||q.x>1291.||q.y>1218.)gl_FragColor=vec4(0.);else gl_FragColor=texture2D(u_image,q/vec2(1291.,1218.));}`;
export function createToyDog(image){
 const source=document.createElement('canvas');source.width=1291;source.height=1218;const brush=source.getContext('2d'),states=new Map();let previousBlink=-1;
 // Sample neighbouring painted skin for eyelids; feather the join instead of drawing pale circles.
 const lids=eyes.map(([x,y,rx,ry])=>{const c=document.createElement('canvas');c.width=2*rx+16;c.height=2*ry+16;const ctx=c.getContext('2d');ctx.drawImage(image,x-rx*3-26,y-ry-8,c.width,c.height,0,0,c.width,c.height);ctx.globalCompositeOperation='destination-in';ctx.translate(c.width/2,c.height/2);ctx.scale(c.width/2,c.height/2);const g=ctx.createRadialGradient(0,0,.78,0,0,1);g.addColorStop(0,'#fff');g.addColorStop(1,'#fff0');ctx.fillStyle=g;ctx.fillRect(-1,-1,2,2);return c;});
 function init(canvas){const gl=canvas.getContext('webgl',{alpha:true,antialias:false,premultipliedAlpha:false,preserveDrawingBuffer:true});if(!gl)return {fallback:canvas.getContext('2d')};
  const shaders=[];const compile=(type,code)=>{const s=gl.createShader(type);gl.shaderSource(s,code);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));shaders.push(s);return s;};const program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const pos=gl.getAttribLocation(program,'a_position');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
  const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);canvas.dataset.renderer='webgl';return {gl,program,shaders,buffer,texture,tilt:gl.getUniformLocation(program,'u_tilt'),blink:-1};
 }
 return {paint(canvas,t,still=false){const motion=dogMotion(still?0:t);let state=states.get(canvas);if(!state){state=init(canvas);states.set(canvas,state);}
  if(motion.blink!==previousBlink){brush.clearRect(0,0,1291,1218);brush.drawImage(image,0,0);
   if(motion.blink>.005)eyes.forEach(([x,y,rx,ry],i)=>{brush.drawImage(lids[i],x-rx-8,y-ry-8);brush.save();brush.beginPath();brush.ellipse(x,y,rx+2,ry+2,0,0,TAU);brush.clip();brush.translate(x,y);brush.scale(1,Math.max(.035,1-motion.blink));brush.drawImage(image,x-rx-2,y-ry-2,rx*2+4,ry*2+4,-rx-2,-ry-2,rx*2+4,ry*2+4);brush.restore();});previousBlink=motion.blink;
  }
  if(state.gl){const {gl}=state;gl.useProgram(state.program);gl.bindTexture(gl.TEXTURE_2D,state.texture);if(state.blink!==motion.blink){gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source);state.blink=motion.blink;}gl.viewport(0,0,canvas.width,canvas.height);gl.uniform1f(state.tilt,motion.tilt);gl.drawArrays(gl.TRIANGLES,0,6);}
  else{const ctx=state.fallback;ctx.clearRect(0,0,660,600);ctx.drawImage(source,330-670*.49,560-1130*.49,1291*.49,1218*.49);}
  canvas.dataset.motion=JSON.stringify(motion);canvas.dataset.time=String(still?0:t);
 },destroy(){for(const s of states.values())if(s.gl){s.gl.deleteTexture(s.texture);s.gl.deleteBuffer(s.buffer);s.shaders.forEach(x=>s.gl.deleteShader(x));s.gl.deleteProgram(s.program);}states.clear();source.width=1;}};
}
