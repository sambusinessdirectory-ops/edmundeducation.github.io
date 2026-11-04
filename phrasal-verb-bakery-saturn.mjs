// A small, actual 3D model. The shared map clock owns playback; this module has no RAF.
const TAU=Math.PI*2, LIMIT=Math.PI*2/9, HALF_VIEW=1.65;
const palette=[[.94,.34,.53],[.37,.77,.83],[1,.75,.30],[.74,.57,.84],[.53,.78,.68],[.97,.48,.34]];
const add=(a,b)=>a.map((v,i)=>v+b[i]);
const mul=(a,s)=>a.map(v=>v*s);
const unit=a=>mul(a,1/Math.hypot(...a));
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export const saturnYaw=t=>LIMIT*Math.sin(TAU*((t%12+12)%12)/12);
export function turnY([x,y,z],angle){const c=Math.cos(angle),s=Math.sin(angle);return [x*c+z*s,y,-x*s+z*c];}
function ringTilt([x,y,z]){
 const a=.52,b=.30,yy=y*Math.cos(a)-z*Math.sin(a),zz=y*Math.sin(a)+z*Math.cos(a);
 return [x*Math.cos(b)-yy*Math.sin(b),x*Math.sin(b)+yy*Math.cos(b),zz];
}
const ringNormal=ringTilt([0,1,0]);
export const SATURN_SUGAR=Array.from({length:60},(_,i)=>{
 const y=1-2*(i+.5)/60,a=i*Math.PI*(3-Math.sqrt(5))+.4,r=Math.sqrt(1-y*y),n=[r*Math.sin(a),y,r*Math.cos(a)];
 const u=unit(cross(Math.abs(y)>.93?[1,0,0]:[0,1,0],n)),v=cross(n,u),tilt=i*1.91;
 return {n,u:add(mul(u,Math.cos(tilt)),mul(v,Math.sin(tilt))),v:add(mul(v,Math.cos(tilt)),mul(u,-Math.sin(tilt))),width:i%9===0?.034:.030,length:i%9===0?.035:.060+i%3*.008,color:palette[i%palette.length]};
});
// Orthographic camera: the globe's silhouette stays circular as its surface turns.
export function saturnPose(t){const yaw=saturnYaw(t);return {yaw,sugar:SATURN_SUGAR.map(s=>turnY(s.n,yaw)),ringNormal:turnY(ringNormal,yaw)};}
function mesh(){
 const data=[];
 function surface(nu,nv,point,color,kind){
  const vertex=(u,v)=>{const p=point(u,v);data.push(...p.position,...p.normal,...color,kind);};
  for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){
   const u=i/nu,v=j/nv,uu=(i+1)/nu,vv=(j+1)/nv;
   vertex(u,v);vertex(uu,v);vertex(uu,vv);vertex(u,v);vertex(uu,vv);vertex(u,vv);
  }
 }
 const sphere=(u,v)=>{const p=[Math.sin(v*Math.PI)*Math.cos(u*TAU),Math.cos(v*Math.PI),Math.sin(v*Math.PI)*Math.sin(u*TAU)];return {position:p,normal:p};};
 surface(80,48,sphere,[.95,.55,.70],0);
 surface(144,20,(u,v)=>{const a=u*TAU,b=v*TAU,r=1.31+.105*Math.cos(b);return {position:ringTilt([r*Math.cos(a),.038*Math.sin(b),r*Math.sin(a)]),normal:unit(ringTilt([Math.cos(b)*Math.cos(a)/.105,Math.sin(b)/.038,Math.cos(b)*Math.sin(a)/.105]))};},[1,.76,.40],1);
 for(const s of SATURN_SUGAR)surface(12,8,(u,v)=>{
  const p=sphere(u,v).position,point=add(add(mul(s.u,p[0]*s.width),mul(s.v,p[1]*s.length)),mul(s.n,1.013+p[2]*.027));
  const normal=unit(add(add(mul(s.u,p[0]/s.width),mul(s.v,p[1]/s.length)),mul(s.n,p[2]/.027)));
  return {position:point,normal};
 },s.color,2);
 return new Float32Array(data);
}
const vertexSource=`
 precision mediump float;
 attribute vec3 position,normal,color;
 attribute float kind;
 uniform float yaw;
 varying vec3 p,n,tint,local;
 varying float material;
 void main(){
  float c=cos(yaw),s=sin(yaw);
  mat3 turn=mat3(c,0.,-s,0.,1.,0.,s,0.,c);
  p=turn*position;n=turn*normal;tint=color;local=position;material=kind;
  gl_Position=vec4(p.x/${HALF_VIEW},p.y/${HALF_VIEW},-p.z/4.,1.);
 }`;
const fragmentSource=`
 precision mediump float;
 uniform float yaw;
 varying vec3 p,n,tint,local;
 varying float material;
 void main(){
  vec3 N=normalize(n),L=normalize(vec3(-.55,.8,1.2)),H=normalize(L+vec3(0.,0.,1.));
  float diffuse=max(0.,dot(N,L));
  vec3 base=tint;
  if(material<.5){base=mix(vec3(.77,.47,.65),tint,smoothstep(-1.1,.75,p.y));}
  vec3 lit=base*((material<.5?.52:.38)+(material<.5?.51:.66)*diffuse);
  float gloss=pow(max(0.,dot(N,H)),material>1.5?34.:material>.5?65.:22.);
  lit+=vec3(1.,.90,.78)*gloss*(material>.5?.24:.22);
  if(material<.5){
   // The raised gold ring casts a soft band onto the icing globe.
   float c=cos(yaw),s=sin(yaw);
   vec3 light=vec3(c*L.x-s*L.z,L.y,s*L.x+c*L.z);
   vec3 rn=vec3(${ringNormal.map(n=>n.toFixed(6)).join(',')});
   float distance=-dot(local,rn)/dot(light,rn);
   float radius=length(local+distance*light);
   float shadow=smoothstep(1.17,1.22,radius)*(1.-smoothstep(1.40,1.46,radius))*step(.01,distance);
   lit*=1.-shadow*.13;
   lit+=vec3(.16,.10,.21)*pow(1.-max(0.,N.z),3.)*.3;
  }
  gl_FragColor=vec4(lit,1.);
 }`;
function webglRenderer(canvas){
 const gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:true});if(!gl)return null;
 const shaders=[],buffers=[];let program;
 function dispose(){buffers.forEach(b=>gl.deleteBuffer(b));shaders.forEach(s=>gl.deleteShader(s));if(program)gl.deleteProgram(program);}
 try{
  for(const [type,source] of [[gl.VERTEX_SHADER,vertexSource],[gl.FRAGMENT_SHADER,fragmentSource]]){const s=gl.createShader(type);shaders.push(s);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));}
  program=gl.createProgram();shaders.forEach(s=>gl.attachShader(program,s));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));
  gl.useProgram(program);const data=mesh(),buffer=gl.createBuffer();buffers.push(buffer);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
  for(const [name,size,offset] of [['position',3,0],['normal',3,3],['color',3,6],['kind',1,9]]){const a=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,size,gl.FLOAT,false,40,offset*4);}
  const yaw=gl.getUniformLocation(program,'yaw');gl.enable(gl.DEPTH_TEST);gl.clearColor(0,0,0,0);
  return {mode:'webgl',draw(t){gl.viewport(0,0,canvas.width,canvas.height);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.uniform1f(yaw,saturnYaw(t));gl.drawArrays(gl.TRIANGLES,0,data.length/10);},destroy:dispose};
 }catch(error){canvas.dataset.shaderError=error.message;dispose();return null;}
}
// Devices without WebGL still get projected surface motion and front/back ring occlusion.
function canvasRenderer(canvas){
 const ctx=canvas.getContext('2d');
 const ring=Array.from({length:160},(_,i)=>[1.205,1.415].map(r=>ringTilt([r*Math.cos(i*TAU/160),0,r*Math.sin(i*TAU/160)])));
 return {mode:'canvas',draw(t){
  const yaw=saturnYaw(t),w=canvas.width/2,s=w/HALF_VIEW;
  ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);ctx.translate(w,w);ctx.scale(s,-s);
  const points=ring.map(pair=>pair.map(p=>turnY(p,yaw)));
  function drawRing(front){
   const side=p=>(p[0][2]>0)===front,count=points.length;
   const start=points.findIndex((p,i)=>side(p)&&!side(points[(i+count-1)%count]));
   if(start<0)return;const band=[];
   for(let j=0;j<=count;j++){const p=points[(start+j)%count];band.push(p);if(j&&!side(p))break;}
   const contour=[...band.map(p=>p[1]),...band.map(p=>p[0]).reverse()];
   ctx.beginPath();contour.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();
   const gold=ctx.createLinearGradient(0,-.8,0,.7);gold.addColorStop(0,front?'#dba353':'#c08a4a');gold.addColorStop(.38,'#ffe2a0');gold.addColorStop(1,'#ecc078');ctx.fillStyle=gold;ctx.fill();
   for(const edge of [0,1]){ctx.beginPath();band.forEach((p,i)=>i?ctx.lineTo(p[edge][0],p[edge][1]):ctx.moveTo(p[edge][0],p[edge][1]));ctx.strokeStyle=edge?'#ffe6af':'#d6a359';ctx.lineWidth=.014;ctx.stroke();}
  }
  drawRing(false);
  const shade=ctx.createRadialGradient(-.38,.4,.03,-.16,.1,1.22);shade.addColorStop(0,'#ffb7c8');shade.addColorStop(.48,'#ee91b0');shade.addColorStop(.82,'#be749e');shade.addColorStop(1,'#87557f');ctx.fillStyle=shade;ctx.beginPath();ctx.arc(0,0,1,0,TAU);ctx.fill();
  ctx.save();ctx.clip();
  for(const sugar of SATURN_SUGAR){const n=turnY(sugar.n,yaw);if(n[2]<=0)continue;const u=turnY(sugar.u,yaw),v=turnY(sugar.v,yaw);ctx.save();ctx.transform(u[0],u[1],v[0],v[1],n[0]*1.013,n[1]*1.013);ctx.beginPath();ctx.ellipse(0,0,sugar.width,sugar.length,0,0,TAU);ctx.fillStyle=`rgb(${sugar.color.map(v=>Math.round(v*255)).join(',')})`;ctx.fill();ctx.restore();}
  ctx.restore();drawRing(true);
 },destroy(){}};
}
export function mountSaturn(host){
 let canvas,renderer,disposed=false;
 function contextLost(event){event.preventDefault();renderer=null;host.dataset.renderer='lost';}
 function initialize(){
  canvas?.removeEventListener('webglcontextlost',contextLost);canvas?.removeEventListener('webglcontextrestored',initialize);canvas?.remove();
  if(disposed)return;
  canvas=document.createElement('canvas');canvas.className='bakery-saturn-model';canvas.setAttribute('aria-hidden','true');canvas.width=canvas.height=Math.round(310*Math.min(2,globalThis.devicePixelRatio||1));host.append(canvas);
  renderer=webglRenderer(canvas);host.dataset.renderIssue=canvas.dataset.shaderError||'';
  if(!renderer){canvas.remove();canvas=document.createElement('canvas');canvas.className='bakery-saturn-model';canvas.setAttribute('aria-hidden','true');canvas.width=canvas.height=620;host.append(canvas);renderer=canvasRenderer(canvas);}
  canvas.addEventListener('webglcontextlost',contextLost);canvas.addEventListener('webglcontextrestored',initialize);host.dataset.renderer=renderer.mode;renderer.draw(0);
 }
 initialize();
 return {draw(t){if(!renderer)return;renderer.draw(t);host.dataset.yaw=String(saturnYaw(t)*180/Math.PI);},destroy(){disposed=true;renderer?.destroy();canvas?.removeEventListener('webglcontextlost',contextLost);canvas?.removeEventListener('webglcontextrestored',initialize);canvas?.remove();}};
}
