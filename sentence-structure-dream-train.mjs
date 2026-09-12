import * as T from './assets/vendor/three-r186/three.module.js';
import {RoundedBoxGeometry} from './assets/vendor/three-r186/RoundedBoxGeometry.js';
import {DREAM_RAIL} from './sentence-structure-dream-geometry.mjs?v=20260912-dream-normal';
import {trainPose} from './sentence-structure-dream-motion.mjs?v=20260912-dream-normal';

// Real model geometry keeps body height, wheels and lighting consistent through every turn.
export function createDreamTrain(canvas){
 let renderer;
 try{renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,preserveDrawingBuffer:true});}
 catch{const still=document.createElement('img');still.src=new URL('./assets/sentence-structure/dream/train-fallback.webp',import.meta.url).href;still.alt='';still.className=canvas.className;still.style.cssText=canvas.style.cssText;still.dataset.renderer='static';canvas.replaceWith(still);return {paint(){},destroy(){}};}
 renderer.setPixelRatio(1);renderer.setSize(1320,720,false);renderer.setClearColor(0x000000,0);
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
 renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;
 const scene=new T.Scene(),camera=new T.OrthographicCamera(-330,330,210,-150,1,2200),s=DREAM_RAIL.ry/DREAM_RAIL.rx;
 camera.position.set(0,1000*s,1000*Math.sqrt(1-s*s));camera.lookAt(0,0,0);
 scene.add(new T.HemisphereLight(0xffedcf,0x78728b,2.5));
 const light=new T.DirectionalLight(0xffdb9d,3);light.position.set(-250,450,300);light.castShadow=true;light.shadow.mapSize.set(1024,1024);
 Object.assign(light.shadow.camera,{left:-360,right:360,top:360,bottom:-360,near:1,far:1100});light.shadow.bias=-.0005;light.shadow.normalBias=.8;light.shadow.radius=4;scene.add(light);
 const materials={},geometries=new Map();
 const mat=(name,color)=>materials[name]||(materials[name]=new T.MeshStandardMaterial({color,roughness:.72,metalness:0}));
 const wood=mat('wood','#ba8050'),goldWood=mat('goldWood','#e0ac6d'),darkWood=mat('darkWood','#78533a'),navy=mat('navy','#345b7b'),cream=mat('cream','#f3dba9'),brass=mat('brass','#cc9c51'),rubber=mat('rubber','#413930'),glass=mat('glass','#363640');
 const box=(w,h,d,r=2)=>{const key=[w,h,d,r].join(',');if(!geometries.has(key))geometries.set(key,new RoundedBoxGeometry(w,h,d,2,Math.min(r,w/4,h/4,d/4)));return geometries.get(key);};
 const add=(parent,g,m,x=0,y=0,z=0)=>{const mesh=new T.Mesh(g,m);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;};
 const block=(parent,m,w,h,d,x,y,z,r=2)=>add(parent,box(w,h,d,r),m,x,y,z);
 const cylinder=(parent,m,r,h,x,y,z,axis='y',r2=r)=>{const mesh=add(parent,new T.CylinderGeometry(r,r2,h,28),m,x,y,z);if(axis==='z')mesh.rotation.x=Math.PI/2;if(axis==='x')mesh.rotation.z=-Math.PI/2;return mesh;};
 const track=new T.Group();scene.add(track);
 for(let n=0;n<88;n++){const a=n*Math.PI*2/88,tie=block(track,n%3?wood:goldWood,11,4,68,DREAM_RAIL.rx*Math.cos(a),2,DREAM_RAIL.rx*Math.sin(a),1.5);tie.rotation.y=Math.PI/2-a;}
 for(const r of [DREAM_RAIL.rx-DREAM_RAIL.gauge/2,DREAM_RAIL.rx+DREAM_RAIL.gauge/2]){const rail=add(track,new T.TorusGeometry(r,2.6,8,192),brass,0,7,0);rail.rotation.x=Math.PI/2;}
 const ground=new T.Mesh(new T.PlaneGeometry(650,650),new T.ShadowMaterial({opacity:.2}));ground.rotation.x=-Math.PI/2;ground.position.y=.2;ground.receiveShadow=true;scene.add(ground);
 const cars=[],wheels=[],rods=[];
 const wheel=(parent,x,z,r=12)=>{const g=new T.Group();g.position.set(x,19,z);parent.add(g);cylinder(g,rubber,r,8,0,0,0,'z');cylinder(g,brass,4,9,0,0,0,'z');for(let k=0;k<3;k++){const spoke=block(g,goldWood,r*1.65,2.2,1.2,0,0,z>0?4.4:-4.4,.5);spoke.rotation.z=k*Math.PI/3;}wheels.push(g);};
 for(let i=0;i<3;i++){
  const g=new T.Group();scene.add(g);cars.push(g);const engine=i===0,len=engine?110:82;
  block(g,wood,len,10,45,0,29,0,3);
  for(const x of engine?[-39,-3,34]:[-25,25])for(const z of [-25,25])wheel(g,x,z,engine?12:11);
  if(engine){
   cylinder(g,navy,17,54,19,50,0,'x');for(const x of [-2,37])cylinder(g,brass,17.8,3,x,50,0,'x');
   cylinder(g,darkWood,15,3,48,50,0,'x');cylinder(g,brass,4,4,50,51,0,'x');
   block(g,goldWood,39,45,43,-30,58,0,3);block(g,navy,45,9,51,-30,85,0,4);
   for(const z of [-22,22]){block(g,glass,22,22,1.5,-30,66,z,2);block(g,cream,2.5,23,2,-30,66,z*1.02,.5);block(g,navy,35,10,1.5,-30,43,z,1);}
   cylinder(g,darkWood,6,23,28,76,0);cylinder(g,brass,10,5,28,89,0,'y',8);
   cylinder(g,brass,5,7,2,71,0);cylinder(g,cream,4,2,2,75,0);
   for(const z of [-31,31])rods.push(block(g,brass,77,3,3,-2,18,z,1));
  }else{
   block(g,goldWood,76,5,39,0,37,0,2);
   for(const z of [-21,21]){block(g,wood,79,25,6,0,48,z,2);block(g,navy,67,6,1.5,0,50,z*1.16,.5);block(g,goldWood,80,3,7,0,61,z,1);}
   for(const x of [-37,37])block(g,wood,7,25,43,x,48,0,2);
  }
  for(const x of [-len/2-6,len/2+6]){const ring=add(g,new T.TorusGeometry(5,1.6,6,18),darkWood,x,29,0);ring.rotation.y=Math.PI/2;}
 }
 const links=[0,1].map(()=>add(scene,new T.CylinderGeometry(1.8,1.8,1,8),darkWood));
 canvas.dataset.renderer='three';
 return {paint(t){
  const poses=cars.map((g,i)=>{const p=trainPose(t,i);g.position.set(DREAM_RAIL.rx*Math.cos(p.theta),0,DREAM_RAIL.rx*Math.sin(p.theta));g.rotation.y=-p.angle;return p;});
  const spin=-t*Math.PI*2/DREAM_RAIL.period*DREAM_RAIL.rx/12;wheels.forEach(g=>g.rotation.z=spin);rods.forEach(g=>{g.position.x=-2+Math.cos(spin)*3;g.position.y=18+Math.sin(spin)*3;});
  links.forEach((link,i)=>{cars[i].updateMatrixWorld(true);cars[i+1].updateMatrixWorld(true);const a=new T.Vector3(-(i===0?61:47),29,0).applyMatrix4(cars[i].matrixWorld),b=new T.Vector3(47,29,0).applyMatrix4(cars[i+1].matrixWorld);const delta=b.clone().sub(a);link.position.copy(a.add(b).multiplyScalar(.5));link.scale.y=delta.length();link.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());});
  renderer.render(scene,camera);canvas.dataset.poses=JSON.stringify(poses);canvas.dataset.time=String(t);
 },destroy(){const gs=new Set(),ms=new Set();scene.traverse(o=>{if(o.geometry)gs.add(o.geometry);if(o.material)ms.add(o.material);});gs.forEach(g=>g.dispose());ms.forEach(m=>m.dispose());renderer.dispose();renderer.forceContextLoss();}};
}
