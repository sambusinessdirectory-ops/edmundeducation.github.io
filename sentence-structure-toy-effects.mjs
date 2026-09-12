import * as T from './assets/vendor/three-r186/three.module.js';
import {TOY_HEIGHT,TOY_MARBLES,TOY_PLANES,TOY_KEY} from './sentence-structure-toy-geometry.mjs?v=20260912-toy1';
import {marbleMotion,planeMotion,dogMotion} from './sentence-structure-toy-motion.mjs?v=20260912-toy1';

// One transparent scene gives the glass, folded paper and key coherent light and depth.
export function createToyEffects(canvas){
 let renderer;
 try{renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,preserveDrawingBuffer:true});}
 catch{const still=new Image();still.src=new URL('./assets/sentence-structure/toy/effects-fallback.webp',import.meta.url).href;still.alt='';still.className=canvas.className;still.style.cssText=canvas.style.cssText;canvas.replaceWith(still);return {paint(){},destroy(){}};}
 renderer.setPixelRatio(1);renderer.setSize(1600,TOY_HEIGHT,false);renderer.setClearColor(0,0);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
 const scene=new T.Scene(),s=.64,c=Math.sqrt(1-s*s),camera=new T.OrthographicCamera(-800,800,TOY_HEIGHT/2,-TOY_HEIGHT/2,1,6000);
 camera.position.set(0,2200*s,2200*c);camera.lookAt(0,0,0);
 scene.add(new T.HemisphereLight(0xfff0d0,0x64778d,2.2));const sun=new T.DirectionalLight(0xffe4b0,2.8);sun.position.set(-600,1300,-700);scene.add(sun);const soft=new T.DirectionalLight(0xffffff,1.3);soft.position.set(300,700,1200);scene.add(soft);
 const environment=document.createElement('canvas');environment.width=512;environment.height=256;const ec=environment.getContext('2d'),gradient=ec.createLinearGradient(0,0,0,256);gradient.addColorStop(0,'#a1bdcf');gradient.addColorStop(.35,'#ffedcb');gradient.addColorStop(.6,'#a87c53');gradient.addColorStop(1,'#6d625b');ec.fillStyle=gradient;ec.fillRect(0,0,512,256);ec.fillStyle='#fffaf0';ec.fillRect(75,40,64,83);ec.fillRect(147,40,38,83);ec.fillStyle='#c8deeb';ec.fillRect(310,65,25,45);
 const env=new T.CanvasTexture(environment);env.mapping=T.EquirectangularReflectionMapping;env.colorSpace=T.SRGBColorSpace;const pmrem=new T.PMREMGenerator(renderer),envMap=pmrem.fromEquirectangular(env);scene.environment=envMap.texture;pmrem.dispose();env.dispose();
 const place=(object,x,y,h=0)=>{object.position.set(x-800,h,(y-TOY_HEIGHT/2+h*c)/s);return object;};
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=128;shadowCanvas.height=128;const sc=shadowCanvas.getContext('2d'),sg=sc.createRadialGradient(64,64,5,64,64,61);sg.addColorStop(0,'rgba(60,47,32,.28)');sg.addColorStop(.48,'rgba(60,47,32,.14)');sg.addColorStop(1,'rgba(60,47,32,0)');sc.fillStyle=sg;sc.fillRect(0,0,128,128);const shadowTexture=new T.CanvasTexture(shadowCanvas);
 const shadow=(x,y,rx,ry)=>{const o=new T.Sprite(new T.SpriteMaterial({map:shadowTexture,depthWrite:false,transparent:true}));o.scale.set(rx*2,ry*2,1);place(o,x,y,1);scene.add(o);return o;};
 const marbles=TOY_MARBLES.map((m,index)=>{
  const group=new T.Group(),sphere=new T.Mesh(new T.SphereGeometry(m.r,40,28),new T.MeshPhysicalMaterial({color:m.color,transparent:true,opacity:.60,roughness:.08,metalness:.08,clearcoat:1,clearcoatRoughness:.02,side:T.FrontSide,depthWrite:false,envMapIntensity:1.8}));group.add(sphere);
  const interior=new T.Group();group.add(interior);
  // Colored twisted glass ribbons make rolling observable while highlights follow the light.
  for(let k=0;k<3;k++){
   const points=[];for(let i=0;i<=32;i++){const a=-1.22+i/32*2.44,r=m.r*.67*Math.cos(a),angle=a*2.6+k*2.094;points.push(new T.Vector3(Math.sin(a)*m.r*.88,Math.cos(angle)*r,Math.sin(angle)*r));}
   const curve=new T.CatmullRomCurve3(points);interior.add(new T.Mesh(new T.TubeGeometry(curve,48,m.r*.13,6,false),new T.MeshStandardMaterial({color:k===1?'#f6ebc8':m.color,roughness:.16,metalness:.08,transparent:true,opacity:.94})));
  }
  const core=new T.Mesh(new T.SphereGeometry(m.r*.77,24,18),new T.MeshPhysicalMaterial({color:m.color,roughness:.1,transparent:true,opacity:.5,depthWrite:false,side:T.BackSide}));interior.add(core);
  scene.add(group);const shade=shadow(m.x,m.y+3,m.r*1.15,m.r*.4);return {group,interior,shade,m};
 });
 const paper=(points,color)=>{const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(points.flat(),3));g.computeVertexNormals();return new T.Mesh(g,new T.MeshStandardMaterial({color,roughness:.9,side:T.DoubleSide}));};
 const planes=TOY_PLANES.map(p=>{
  const g=new T.Group(),left=new T.Group(),right=new T.Group();
  left.add(paper([[58,0,0],[-45,3,-12],[-53,-1,-53]],'#fff5df'));right.add(paper([[58,0,0],[-53,-1,53],[-45,3,12]],'#fff9e9'));
  left.add(paper([[58,0,0],[-48,-6,0],[-45,3,-12]],'#e8d5b9'));right.add(paper([[58,0,0],[-45,3,12],[-48,-6,0]],'#f3e4cb'));
  g.add(left,right,paper([[58,0,0],[-48,-15,0],[-48,0,0]],'#cfbda5'));
  const scale=p.size;g.scale.setScalar(scale);g.rotation.y=p.heading;place(g,p.x,p.y,24);scene.add(g);const shade=shadow(p.x+10,p.y+24,60*scale,20*scale);shade.material.opacity=.48;return {g,left,right,p};
 });
 const keyRoot=new T.Group(),keySpin=new T.Group();keyRoot.add(keySpin);keyRoot.rotation.y=-.2;keyRoot.rotation.x=-.3;place(keyRoot,TOY_KEY.x,TOY_KEY.y,40);scene.add(keyRoot);
 const metal=new T.MeshStandardMaterial({color:'#c1a165',roughness:.32,metalness:.78,envMapIntensity:1.3});
 const keyShape=new T.Shape();keyShape.moveTo(-4,-10);keyShape.lineTo(-4,-1);keyShape.bezierCurveTo(-33,-5,-29,32,-11,25);keyShape.bezierCurveTo(-5,24,-3,18,0,15);keyShape.bezierCurveTo(3,18,5,24,11,25);keyShape.bezierCurveTo(29,32,33,-5,4,-1);keyShape.lineTo(4,-10);keyShape.closePath();
 for(const x of [-16,16]){const hole=new T.Path();hole.absellipse(x,13,6.6,8.2,0,Math.PI*2,true,0);keyShape.holes.push(hole);}
 const handle=new T.Mesh(new T.ExtrudeGeometry(keyShape,{depth:4,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:1,bevelThickness:1,curveSegments:20}),metal);handle.position.y=-6;keySpin.add(handle);
 const shaft=new T.Mesh(new T.CylinderGeometry(3.4,3.4,29,16),metal);shaft.rotation.x=Math.PI/2;shaft.position.z=-12;keyRoot.add(shaft);
 canvas.dataset.renderer='three';
 return {paint(t,still=false){
  const poses=marbles.map(({group,interior,shade,m})=>{const p=marbleMotion(still?0:t,m);group.position.set(p.x-800,m.r+2,(m.y-TOY_HEIGHT/2)/s);interior.rotation.z=p.roll;interior.rotation.x=.35;place(shade,p.x,p.y+3,1);return p;});
  const wings=planes.map(({g,left,right,p})=>{const motion=planeMotion(still?0:t,p);left.rotation.x=motion.left;right.rotation.x=motion.right;g.rotation.z=motion.rock;return motion;});
  const dog=dogMotion(still?0:t);keySpin.rotation.z=-dog.key;renderer.render(scene,camera);canvas.dataset.marbles=JSON.stringify(poses);canvas.dataset.wings=JSON.stringify(wings);canvas.dataset.key=String(dog.key);canvas.dataset.time=String(still?0:t);
 },destroy(){const gs=new Set(),ms=new Set();scene.traverse(o=>{if(o.geometry)gs.add(o.geometry);if(o.material)ms.add(o.material);});gs.forEach(g=>g.dispose());ms.forEach(m=>m.dispose());shadowTexture.dispose();envMap.dispose();renderer.dispose();renderer.forceContextLoss();}};
}
