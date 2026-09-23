import * as THREE from './vendor/three/three.module.js';
import {ROOM} from './speaking-classroom-camera.mjs?v=20260908-room10';
export const BLACKBOARD_LINES=Object.freeze(['Edmund Sir','DSE English Speaking Studio']);
const ASSETS=new URL('./assets/speaking-system/classroom/interior-v1/',import.meta.url);

export async function createClassroomEnvironment(deskScene,loader=new THREE.TextureLoader(),{night=false,flags=false,deskTimer=false}={}){
 const textures=new Set(),materials=new Set(),geometries=new Set(),group=new THREE.Group();group.name='Enclosed speaking studio';
 let disposed=false;
 const dispose=()=>{if(disposed)return;disposed=true;for(const resource of [...textures,...materials,...geometries])resource.dispose();};
 const loaded=await Promise.allSettled(['oak-floor.png','leafy-city.png'].map(file=>loader.loadAsync(new URL(file,ASSETS).href)));
 for(const result of loaded)if(result.status==='fulfilled')textures.add(result.value);
 if(loaded.some(result=>result.status==='rejected')){dispose();throw new Error('Could not load classroom materials');}
 const [oak,city]=loaded.map(result=>result.value);let nightMode=!!night;const nightObjects=[],glowMeshes=[];let timerTexture=null,timerContext=null;
 for(const t of [oak,city]){t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;}
 oak.wrapS=oak.wrapT=THREE.RepeatWrapping;oak.repeat.set(4,4);
 const material=(colour,extra={})=>{const m=new THREE.MeshStandardMaterial({color:colour,roughness:.85,...extra});materials.add(m);return m;};
 const paint=material('#ddd8c9'),sage=material('#81988a'),trim=material('#dae0cf'),frame=material('#967048'),floor=material('#ffffff',{map:oak,roughness:.68,bumpMap:oak,bumpScale:.006}),board=material('#284f42'),paper=material('#f5edda');
 const box=(name,x,y,z,w,h,d,mat,shadow=true)=>{
  const geometry=new THREE.BoxGeometry(w,h,d);geometries.add(geometry);const mesh=new THREE.Mesh(geometry,mat);mesh.name=name;mesh.position.set(x,y,z);mesh.castShadow=shadow;mesh.receiveShadow=true;group.add(mesh);return mesh;
 };
 const {left,right,back,front,height}=ROOM,width=right-left,depth=front-back,mid=(back+front)/2;
 box('Oak plank floor',0,-.08,mid,width+.3,.16,depth+.3,floor,false);
 box('Ceiling',0,height+.08,mid,width+.3,.16,depth+.3,material('#ede9dc',{emissive:'#c7bfab',emissiveIntensity:.24}),false);
 for(const [name,z]of [['Teaching wall',back],['Rear wall',front]]){
  box(name,0,height/2,z,width,height,.18,paint,false);
  box(name+' sage wainscot',0,.60,z+(z===back?.105:-.105),width,1.2,.035,sage,false);
  box(name+' chair rail',0,1.22,z+(z===back?.13:-.13),width,.055,.06,trim,false);
  box(name+' skirting',0,.075,z+(z===back?.14:-.14),width,.15,.06,trim,false);
 }
 box('Right wall',right,height/2,mid,.18,height,depth,paint,false);
 box('Right sage wainscot',right-.105,.60,mid,.035,1.2,depth,sage,false);
 box('Right chair rail',right-.13,1.22,mid,.06,.055,depth,trim,false);
 box('Right skirting',right-.14,.075,mid,.06,.15,depth,trim,false);
 const sill=1.25,lintel=3.65,windows=[-2.7,.8,4.3],windowWidth=2.7;
 box('Window wall base',left,sill/2,mid,.18,sill,depth,sage,true);
 box('Window wall lintel',left,(lintel+height)/2,mid,.18,height-lintel,depth,paint,true);
 box('Window wall skirting',left+.14,.075,mid,.06,.15,depth,trim,false);
 let start=back;
 for(const z of windows){
  const edge=z-windowWidth/2;
  box('Window wall pier',left,(sill+lintel)/2,(start+edge)/2,.18,lintel-sill,edge-start,paint,true);
  box('Window sill',left+.06,sill-.015,z,.38,.095,windowWidth+.20,trim);
  for(const y of [sill,(sill+lintel)/2,lintel])box('Window horizontal frame',left+.025,y,z,.12,.065,windowWidth+.12,trim);
  for(const zz of [z-windowWidth/2,z,z+windowWidth/2])box('Window vertical frame',left+.025,(sill+lintel)/2,zz,.12,lintel-sill,.065,trim);
  start=z+windowWidth/2;
 }
 box('Last window wall pier',left,(sill+lintel)/2,(start+front)/2,.18,lintel-sill,front-start,paint,true);
 // A distant panorama has real separation from the window frames and sill plants.
 const panoramaMaterial=new THREE.MeshBasicMaterial({map:city,side:THREE.DoubleSide});materials.add(panoramaMaterial);
 const panoramaGeometry=new THREE.PlaneGeometry(48,16);geometries.add(panoramaGeometry);
 const panorama=new THREE.Mesh(panoramaGeometry,panoramaMaterial);panorama.name='City outside the windows';panorama.position.set(left-5,3.3,mid);panorama.rotation.y=Math.PI/2;group.add(panorama);
 // Stars sit behind the city image, high in the sky; slim towers and small lit windows sit closer to the glass.
 for(let i=0;i<72;i++){
  const geo=new THREE.SphereGeometry(.018+(i%4)*.006,6,6);geometries.add(geo);
  const starMat=material('#fff6cb',{emissive:'#fff0aa',emissiveIntensity:1.4});const star=new THREE.Mesh(geo,starMat);star.userData.nightSkyStar=true;star.position.set(left-5.22,5.25+(i*37%22)/10,back+(i*17%100)/100*depth);
  star.visible=nightMode;group.add(star);nightObjects.push({mesh:star,star:true,phase:i*.31});
 }
 const cityWindow=material('#ffd581',{emissive:'#ffb84e',emissiveIntensity:.8});
 const buildingMaterials=['#35435e','#3e4c68','#46536a'].map(c=>material(c,{roughness:1}));
 for(let i=0;i<18;i++){
  const z=back+.25+(i*1.31)%(depth-.5),x=left-4.91+(i%3)*.045,h=1.05+(i*29%120)/100,w=.24+(i*13%48)/100;
  const building=box('Slim city tower beyond the windows',x,1.05+h/2,z,.025,h,w,buildingMaterials[i%buildingMaterials.length],false);
  building.visible=nightMode;nightObjects.push({mesh:building});
  const floors=Math.max(3,Math.floor(h/.20));
  for(let row=0;row<floors;row++)for(let col=0;col<2;col++){
   const lit=(i*7+row*3+col*5)%5!==0;
   const win=box('Pinpoint apartment window',x+.018,1.10+row*.17,z+(col?1:-1)*(w*.23),.012,.035,.026,cityWindow,false);
   win.visible=nightMode&&lit;nightObjects.push({mesh:win,window:true,phase:i*.7+row+col,mat:cityWindow,lit});
  }
 }
 // Accurate editable lettering, rendered separately from the illustrated exterior.
 const canvas=document.createElement('canvas');canvas.width=1800;canvas.height=540;const context=canvas.getContext('2d');
 context.fillStyle='#294e40';context.fillRect(0,0,canvas.width,canvas.height);
 let seed=37;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 context.fillStyle='rgba(232,233,207,.045)';for(let i=0;i<2600;i++)context.fillRect(random()*1800,random()*540,random()*3+1,1);
 context.textAlign='center';context.textBaseline='middle';context.fillStyle='#f3eedc';
 context.font='500 100px Georgia, serif';context.fillText(BLACKBOARD_LINES[0],900,185);
 context.font='500 76px Georgia, serif';context.fillText(BLACKBOARD_LINES[1],900,330);
 const lettering=new THREE.CanvasTexture(canvas);lettering.colorSpace=THREE.SRGBColorSpace;lettering.anisotropy=8;textures.add(lettering);
 const letteringMaterial=new THREE.MeshBasicMaterial({map:lettering});materials.add(letteringMaterial);
 box('Blackboard oak frame',0,2.65,back+.18,6.4,1.94,.15,frame);
 box('Blackboard surface',0,2.65,back+.27,6.17,1.75,.025,board);
 const textGeometry=new THREE.PlaneGeometry(6.15,1.73);geometries.add(textGeometry);const text=new THREE.Mesh(textGeometry,letteringMaterial);text.position.set(0,2.65,back+.285);text.name=BLACKBOARD_LINES.join('\n');group.add(text);
 box('Chalk tray',0,1.68,back+.31,6.38,.055,.20,frame);
 box('Board eraser',2.4,1.735,back+.33,.20,.045,.08,paper);
 for(const [i,x]of [-4.7,4.7].entries()){
  box('Noticeboard frame',x,2.55,back+.15,1.5,1.65,.12,frame);
  box('Noticeboard cork',x,2.55,back+.22,1.32,1.47,.025,material('#b8996a'));
  for(let k=0;k<3;k++)box('Classroom notice',x+(k===1?.25:-.2),2.95-k*.36,back+.245,.57,.31,.012,material(['#eee9d7','#c3d2c4','#e5d2b0'][(k+i)%3]),false);
 }
 // Finish the room behind the camera, so a complete turn remains indoors.
 box('Classroom door frame',right-.13,1.43,5.65,.15,2.86,1.52,frame);
 box('Classroom door',right-.23,1.37,5.65,.055,2.69,1.32,material('#b49b71'));
 box('Door glazed panel',right-.267,1.99,5.65,.02,.87,.95,material('#c6d3cc',{roughness:.45}));
 box('Door handle',right-.33,1.10,5.14,.085,.08,.16,material('#697571',{metalness:.35,roughness:.4}));
 const ceilingLights=[];
 const haloCanvas=document.createElement('canvas');haloCanvas.width=128;haloCanvas.height=128;const haloContext=haloCanvas.getContext('2d');if(haloContext.createRadialGradient){const haloGradient=haloContext.createRadialGradient(64,64,5,64,64,64);haloGradient.addColorStop(0,'rgba(255,247,211,.8)');haloGradient.addColorStop(.35,'rgba(255,239,186,.32)');haloGradient.addColorStop(1,'rgba(255,239,186,0)');haloContext.fillStyle=haloGradient;}else haloContext.fillStyle='rgba(255,245,205,.4)';haloContext.fillRect(0,0,128,128);const haloTexture=new THREE.CanvasTexture(haloCanvas);textures.add(haloTexture);
 for(const z of [-1.8,3.3])for(const x of [-2.8,2.8]){
  box('Ceiling light casing',x,height-.055,z,1.72,.07,.43,trim,false);
  const diffuser=material('#fffdf0',{emissive:'#fff2c3',emissiveIntensity:nightMode?1.8:1.05});const light=box('Ceiling diffuser',x,height-.10,z,1.60,.035,.32,diffuser,false);glowMeshes.push({mesh:light,phase:x+z,base:nightMode?1.8:1.05});
  const haloMaterial=new THREE.MeshBasicMaterial({map:haloTexture,color:0xfff1c2,transparent:true,opacity:nightMode?.5:.32,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});materials.add(haloMaterial);const haloGeometry=new THREE.PlaneGeometry(2.4,1.15);geometries.add(haloGeometry);const halo=new THREE.Mesh(haloGeometry,haloMaterial);halo.rotation.x=-Math.PI/2;halo.position.set(x,height-.145,z);group.add(halo);glowMeshes.push({mesh:halo,phase:x+z,base:haloMaterial.opacity,halo:true});
  const spill=new THREE.PointLight(0xffefca,nightMode?85:48,7.5,1.8);spill.position.set(x,height-.2,z);group.add(spill);ceilingLights.push(spill);
 }
 const plant=(z)=>{
  const potGeometry=new THREE.CylinderGeometry(.14,.10,.20,20);geometries.add(potGeometry);
  const pot=new THREE.Mesh(potGeometry,material('#b58060'));pot.position.set(left+.10,sill+.12,z);pot.castShadow=true;group.add(pot);
  const stem=material('#526842'),leaves=[material('#507b50'),material('#698a56')];
  box('Plant stem',left+.10,sill+.35,z,.02,.36,.02,stem);
  for(let i=0;i<7;i++){
   const geometry=new THREE.SphereGeometry(1,14,8);geometries.add(geometry);const leaf=new THREE.Mesh(geometry,leaves[i%2]);
   const angle=i*2.4;leaf.position.set(left+.10+Math.cos(angle)*.105,sill+.27+i*.038,z+Math.sin(angle)*.105);leaf.scale.set(.15,.025,.065);leaf.rotation.set(.15,angle,.4);leaf.castShadow=true;group.add(leaf);
  }
 };
 plant(-3.6);plant(5.1);
 for(const x of [-.75,.75]){const desk=deskScene.clone(true);desk.name='Examiner desk';desk.position.set(x,0,2.5);desk.rotation.y=Math.PI;desk.traverse(n=>{if(n.isMesh){n.castShadow=true;n.receiveShadow=true;}});group.add(desk);}
 if(flags){
  const logoFiles=['Static Images/HKU Logo.png','assets/homepage-optimized/company-logo.webp'];
  for(let i=0;i<logoFiles.length;i++){
   const source=await loader.loadAsync(new URL(logoFiles[i],import.meta.url).href);source.colorSpace=THREE.SRGBColorSpace;textures.add(source);
   const canvas=document.createElement('canvas');canvas.width=768;canvas.height=1152;const ctx=canvas.getContext('2d');
   ctx.fillStyle=i?'#17213f':'#fffdf6';ctx.fillRect(0,0,canvas.width,canvas.height);
   const image=source.image,scale=image?.width&&image?.height?Math.min((canvas.width*.82)/image.width,(canvas.height*.72)/image.height):1,w=(image?.width||0)*scale,h=(image?.height||0)*scale;
   if(image?.width&&image?.height)ctx.drawImage(image,(canvas.width-w)/2,(canvas.height-h)/2,w,h);
   const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;textures.add(texture);
   const x=(i?1:-1)*.76,z=front-.30;
   const poleGeo=new THREE.CylinderGeometry(.025,.025,1.38,10);geometries.add(poleGeo);const pole=new THREE.Mesh(poleGeo,material('#9c7b43',{metalness:.55,roughness:.35}));pole.position.set(x,3.22,z);group.add(pole);
   const sleeveGeo=new THREE.CylinderGeometry(.024,.024,.92,10);geometries.add(sleeveGeo);const sleeve=new THREE.Mesh(sleeveGeo,material('#c2a66b',{metalness:.5}));sleeve.rotation.z=Math.PI/2;sleeve.position.set(x,3.88,z);group.add(sleeve);
   const shape=new THREE.Shape();shape.moveTo(-.48,0);shape.lineTo(.48,0);shape.lineTo(.48,-1.12);shape.lineTo(0,-1.48);shape.lineTo(-.48,-1.12);
   const geo=new THREE.ShapeGeometry(shape);geometries.add(geo);const flagMat=new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide});materials.add(flagMat);
   const flag=new THREE.Mesh(geo,flagMat);flag.position.set(x,3.85,z-.02);flag.name=i?'Edmund Education gonfalon':'HKU gonfalon';group.add(flag);
  }
 }
 if(deskTimer){const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;timerContext=canvas.getContext('2d');timerTexture=new THREE.CanvasTexture(canvas);timerTexture.colorSpace=THREE.SRGBColorSpace;textures.add(timerTexture);const body=box('3D discussion timer',1.02,1.03,2.12,.62,.34,.10,material('#182a35',{roughness:.34,metalness:.25}));body.rotation.y=Math.PI;const kickstand=box('Timer kickstand',1.02,.82,2.19,.28,.06,.31,material('#65727a',{metalness:.48,roughness:.38}));kickstand.rotation.x=-.28;const screenGeo=new THREE.PlaneGeometry(.54,.22);geometries.add(screenGeo);const screenMat=new THREE.MeshBasicMaterial({map:timerTexture});materials.add(screenMat);const screen=new THREE.Mesh(screenGeo,screenMat);screen.position.set(1.02,1.05,2.055);group.add(screen);}
 const setNight=value=>{nightMode=!!value;panoramaMaterial.color.set(nightMode?'#64718d':'#ffffff');nightObjects.forEach(item=>{if(item.star)item.mesh.visible=nightMode;else if(item.window)item.mesh.visible=nightMode&&item.lit;else item.mesh.visible=nightMode;});ceilingLights.forEach(light=>light.intensity=nightMode?85:48);glowMeshes.forEach(light=>{light.base=nightMode?1.8:1.05;light.mesh.material.emissiveIntensity=light.base;});};
 const setTimer=value=>{if(!timerContext||!timerTexture)return;timerContext.clearRect(0,0,512,256);timerContext.fillStyle='#172936';timerContext.fillRect(0,0,512,256);timerContext.fillStyle='#f4e4a9';timerContext.font='700 132px ui-monospace,monospace';timerContext.textAlign='center';timerContext.textBaseline='middle';timerContext.fillText(String(value||'00:00'),256,132);timerTexture.needsUpdate=true;};
 setNight(night);setTimer('08:00');
 return {group,setNight,setTimer,update(elapsed){if(nightMode){nightObjects.filter(x=>x.star).forEach(x=>{const pulse=.5+.5*Math.sin(elapsed*2.1+x.phase);x.mesh.scale.setScalar(.72+.48*pulse);x.mesh.material.emissiveIntensity=1.1+.8*pulse;});if(cityWindow)cityWindow.emissiveIntensity=.52+.38*(.5+.5*Math.sin(elapsed*1.3));nightObjects.filter(x=>x.window).forEach(x=>{if(x.lit)x.mesh.visible=Math.sin(elapsed*.5+x.phase)>.92;});}glowMeshes.forEach(light=>{if(light.halo)light.mesh.material.opacity=light.base+(nightMode?.16:.09)*(.5+.5*Math.sin(elapsed*.8+light.phase));else light.mesh.material.emissiveIntensity=light.base+(nightMode?.35:.18)*(.5+.5*Math.sin(elapsed*.8+light.phase));});},dispose};
}
