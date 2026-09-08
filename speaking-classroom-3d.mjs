import * as THREE from './vendor/three/three.module.js';
import {GLTFLoader} from './vendor/three/loaders/GLTFLoader.js';
import {MascotCharacters} from './speaking-mascot-characters.mjs?v=20260908-mascots9';
import {updateAttention,listenerNod} from './speaking-mascot-behaviour.mjs?v=20260908-mascots9';
const cache=new Map();
const load=name=>{if(!cache.has(name))cache.set(name,new GLTFLoader().loadAsync(new URL(`./assets/speaking-system/classroom/${name}.glb?v=20260908`,import.meta.url).href));return cache.get(name);};
export function seatLayout(count,index){const angle=(index-(count-1)/2)*(count===2?.55:.40);return {x:Math.sin(angle)*3.25,z:1.15-Math.cos(angle)*3.25,yaw:-angle};}
export async function mountClassroom(root,candidates,onSelect,{seated=false}={}){
 let disposed=false,frame,activeId=null,free=false;
 const scene=new THREE.Scene();scene.background=new THREE.Color('#e8ece3');
 const camera=new THREE.PerspectiveCamera(40,1,.08,100),target=new THREE.Vector3(0,1,0);
 let yaw=.3,pitch=.57,distance=11;
 const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;
 const controls=document.createElement('div');controls.className='classroom-camera-controls';controls.innerHTML='<button type="button" data-camera="in" aria-label="Zoom in">＋ Zoom</button><button type="button" data-camera="out" aria-label="Zoom out">− Zoom</button><button type="button" data-camera="reset">Reset view · 重設視角</button><button type="button" data-camera="free" aria-pressed="false">Free camera · 自由鏡頭</button><span>Drag to orbit · Scroll / pinch to zoom · Shift-drag to pan</span><div data-camera-move hidden><button type="button" data-move="forward">↑ Forward</button><button type="button" data-move="back">↓ Back</button><button type="button" data-move="left">← Left</button><button type="button" data-move="right">→ Right</button><button type="button" data-move="up">Rise</button><button type="button" data-move="down">Lower</button><small>Drag to look · W A S D to move · Q / E down / up</small></div>';
 root.replaceChildren(controls,renderer.domElement);const canvas=renderer.domElement;canvas.tabIndex=0;canvas.style.touchAction='none';canvas.setAttribute('aria-label','Interactive classroom. Drag to orbit, scroll to zoom. Enable free camera for keyboard movement.');
 const orbit=()=>{camera.position.set(target.x+Math.sin(yaw)*Math.cos(pitch)*distance,target.y+Math.sin(pitch)*distance,target.z+Math.cos(yaw)*Math.cos(pitch)*distance);camera.lookAt(target);};orbit();
 const look=()=>{camera.rotation.order='YXZ';camera.rotation.set(-pitch,yaw,0);};
 scene.add(new THREE.HemisphereLight(0xfff9ee,0x879386,2.4));const sun=new THREE.DirectionalLight(0xfff4df,2.5);sun.position.set(-4,8,4);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.bias=-.0003;sun.shadow.normalBias=.045;Object.assign(sun.shadow.camera,{left:-7,right:7,top:7,bottom:-7,near:.5,far:25});scene.add(sun);
 const resize=()=>{const w=root.clientWidth||600,h=Math.max(350,Math.min(580,w*.70));renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();};const observer=new ResizeObserver(resize);observer.observe(root);resize();
 const pickables=[],rings=new Map(),actors=[],sprites=new MascotCharacters(),backWall=[],leftWall=[];
 const mark=o=>o.traverse(n=>{if(n.isMesh){n.castShadow=!n.userData.mascotSurface&&!/floor|wall/i.test(n.name);n.receiveShadow=true;}});
 try {
 const classroom=(await load('classroom')).scene.clone(true);mark(classroom);scene.add(classroom);
 for(const node of classroom.children){const name=node.name.replaceAll('_',' ');if(/Back plaster wall|Lower green wall|Chalkboard|chalkboard|noticeboard|Notice sheet|^Text/.test(name))backWall.push(node);if(/Left wall|Window/.test(name))leftWall.push(node);}
 for(let i=0;i<candidates.length;i++){
  const c=candidates[i],p=seatLayout(candidates.length,i),seat=new THREE.Group();seat.position.set(p.x,0,p.z);seat.rotation.y=p.yaw;seat.userData.candidateId=c.id;
  seat.add((await load('desk')).scene.clone(true));
  if(c.name?.trim()){const art=await sprites.create(c.mascot||['eddy','elsie','phoebe'][i%3],seated?'seated':'standing');art.mesh.position.set(0,.04,-.56);seat.add(art.mesh);actors.push({art,yaw:p.yaw,facingYaw:p.yaw,id:c.id,phase:i*1.37,slot:i,lookYaw:0,x:p.x-.56*Math.sin(p.yaw),z:p.z-.56*Math.cos(p.yaw)});}
  mark(seat);scene.add(seat);pickables.push(seat);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.66,.028,8,48),new THREE.MeshBasicMaterial({color:0x35a875}));ring.rotation.x=-Math.PI/2;ring.position.set(p.x,.03,p.z);ring.visible=false;scene.add(ring);rings.set(c.id,ring);
 }
 }catch(error){observer.disconnect();sprites.dispose();renderer.dispose();root.textContent='3D could not load. Use the 2D mode.';throw error;}
 const zoom=delta=>{if(free){const direction=new THREE.Vector3();camera.getWorldDirection(direction);camera.position.addScaledVector(direction,-delta);}else{distance=THREE.MathUtils.clamp(distance+delta,2.5,24);orbit();}};
 controls.onclick=e=>{const action=e.target.closest('[data-camera]')?.dataset.camera;if(action==='in')zoom(-.8);if(action==='out')zoom(.8);if(action==='reset'){free=false;yaw=.3;pitch=.57;distance=11;target.set(0,1,0);orbit();}if(action==='free'){free=!free;if(free){const d=new THREE.Vector3();camera.getWorldDirection(d);yaw=Math.atan2(-d.x,-d.z);pitch=-Math.asin(d.y);look();}else{target.copy(camera.position).addScaledVector(camera.getWorldDirection(new THREE.Vector3()),5);distance=5;yaw=Math.atan2(camera.position.x-target.x,camera.position.z-target.z);pitch=Math.asin((camera.position.y-target.y)/distance);orbit();}}controls.querySelector('[data-camera="free"]').setAttribute('aria-pressed',String(free));controls.querySelector('[data-camera-move]').hidden=!free;};
 const keys=new Set(),map={w:'forward',s:'back',a:'left',d:'right',q:'down',e:'up',ArrowUp:'forward',ArrowDown:'back',ArrowLeft:'left',ArrowRight:'right'};
 canvas.onkeydown=e=>{if(free&&map[e.key]){e.preventDefault();keys.add(map[e.key]);}};canvas.onkeyup=e=>keys.delete(map[e.key]);canvas.onblur=()=>keys.clear();
 controls.querySelectorAll('[data-move]').forEach(b=>{b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(b.dataset.move);};b.onpointerup=b.onpointercancel=b.onlostpointercapture=()=>keys.delete(b.dataset.move);});
 const pointers=new Map();let down=null,pinch=0;
 canvas.onpointerdown=e=>{canvas.focus({preventScroll:true});canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});down={x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,moved:false};if(pointers.size===2){const [a,b]=[...pointers.values()];pinch=Math.hypot(a.x-b.x,a.y-b.y);down.moved=true;}};
 canvas.onpointermove=e=>{if(!pointers.has(e.pointerId)||!down)return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===2){const [a,b]=[...pointers.values()],next=Math.hypot(a.x-b.x,a.y-b.y);zoom((pinch-next)*.025);pinch=next;down.moved=true;return;}const dx=e.clientX-down.lastX,dy=e.clientY-down.lastY;down.lastX=e.clientX;down.lastY=e.clientY;if(Math.hypot(e.clientX-down.x,e.clientY-down.y)>5)down.moved=true;if(!free&&(e.shiftKey||e.buttons===2)){const right=new THREE.Vector3().setFromMatrixColumn(camera.matrix,0),up=new THREE.Vector3().setFromMatrixColumn(camera.matrix,1);target.addScaledVector(right,-dx*distance*.0015).addScaledVector(up,dy*distance*.0015);orbit();}else{yaw-=dx*.005;pitch=THREE.MathUtils.clamp(pitch+dy*.005,free?-1.45:.08,1.45);if(free)look();else orbit();}};
 const ray=new THREE.Raycaster(),mouse=new THREE.Vector2();canvas.onpointerup=e=>{pointers.delete(e.pointerId);if(!down)return;if(!down.moved){const b=canvas.getBoundingClientRect();mouse.set((e.clientX-b.left)/b.width*2-1,-(e.clientY-b.top)/b.height*2+1);ray.setFromCamera(mouse,camera);const hit=ray.intersectObjects(pickables,true)[0];if(hit){let o=hit.object;while(o&&!o.userData.candidateId)o=o.parent;if(o)onSelect(o.userData.candidateId);}}down=null;};canvas.onpointercancel=()=>{pointers.clear();down=null;};canvas.oncontextmenu=e=>e.preventDefault();canvas.addEventListener('wheel',e=>{e.preventDefault();zoom(Math.sign(e.deltaY)*.6);},{passive:false});
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),clock=new THREE.Clock();let elapsed=0;
 const render=()=>{if(disposed)return;const dt=Math.min(clock.getDelta(),.05);elapsed+=dt;
 if(free&&keys.size){const forward=camera.getWorldDirection(new THREE.Vector3()),right=new THREE.Vector3().setFromMatrixColumn(camera.matrix,0);for(const k of keys){if(k==='forward'||k==='back')camera.position.addScaledVector(forward,(k==='forward'?1:-1)*dt*3);if(k==='left'||k==='right')camera.position.addScaledVector(right,(k==='right'?1:-1)*dt*3);if(k==='up'||k==='down')camera.position.y+=(k==='up'?1:-1)*dt*3;}camera.position.clamp(new THREE.Vector3(-12,.25,-12),new THREE.Vector3(12,12,12));}
 const speaker=actors.find(a=>a.id===activeId);
 for(const a of actors){a.art.mesh.getWorldPosition(a.art.world);const azimuth=Math.atan2(camera.position.x-a.art.world.x,camera.position.z-a.art.world.z);const looking=updateAttention(a,speaker,dt,reduced.matches),nod=listenerNod(elapsed,a.slot,!!speaker&&a!==speaker,reduced.matches);sprites.update(a.art,azimuth,a.yaw,elapsed+a.phase,reduced.matches,a.id===activeId,looking,nod);}
 // Open the wall nearest an outside camera so rear/side artwork stays visible.
 backWall.forEach(node=>node.visible=camera.position.z> -3.7);leftWall.forEach(node=>node.visible=camera.position.x> -4.8);
 renderer.render(scene,camera);frame=requestAnimationFrame(render);};render();
 return {active(id){activeId=id;rings.forEach((ring,key)=>ring.visible=key===id);},dispose(){disposed=true;cancelAnimationFrame(frame);observer.disconnect();sprites.dispose();renderer.dispose();renderer.forceContextLoss();root.replaceChildren();rings.forEach(r=>{r.geometry.dispose();r.material.dispose();});}};
}
