import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../vendor/three/three.module.js';
import {CAMERA_START,CAMERA_BOUNDS,ROOM,interiorOrbit,constrainCamera,constrainTarget} from '../speaking-classroom-camera.mjs';
import {createClassroomEnvironment,BLACKBOARD_LINES} from '../speaking-classroom-environment.mjs';
import {listenerNod} from '../speaking-mascot-behaviour.mjs';
const inside=p=>{for(const axis of ['x','y','z'])assert.ok(p[axis]>=CAMERA_BOUNDS.min[axis]-1e-9&&p[axis]<=CAMERA_BOUNDS.max[axis]+1e-9,`camera ${axis} stays indoors`);};
for(const t of [{...CAMERA_START.target},{x:-99,y:99,z:-99},{x:99,y:-99,z:99}])for(let yaw=-Math.PI*2;yaw<=Math.PI*2;yaw+=.09)for(const pitch of [-1.45,-.18,.12,.6,1.45])for(const distance of [2,7.8,12,100])inside(interiorOrbit({...t},yaw,pitch,distance));
inside(constrainCamera({x:-100,y:-100,z:100}));inside(constrainCamera({x:100,y:100,z:-100}));inside(interiorOrbit({...CAMERA_START.target},CAMERA_START.yaw,CAMERA_START.pitch,CAMERA_START.distance));
const target={x:99,y:99,z:99};constrainTarget(target);assert.ok(target.x<ROOM.right&&target.y<ROOM.height&&target.z<ROOM.front);
for(let slot=0;slot<4;slot++){
 const values=Array.from({length:2400},(_,i)=>listenerNod(i/120,slot,true));
 assert.ok(Math.max(...values)<.043,'delicate nod stays below 2.5 degrees');
 assert.ok(Math.max(...values)>.035,'nod remains visible');
 assert.ok(Math.max(...values.slice(1).map((v,i)=>Math.abs(v-values[i])*120))<.23,'nod has a gentle angular speed');
 assert.ok(values.filter(v=>v===0).length>values.length*.75,'listeners mostly stay still');
}
const drawCalls=[];globalThis.document={createElement(){return {getContext(){return {fillRect(){},fillText(text){drawCalls.push(text);}};}};}};
const textures=[];const loader={async loadAsync(url){assert.ok(fs.existsSync(new URL(url)));const t=new THREE.Texture();textures.push(t);return t;}};
const environment=await createClassroomEnvironment(new THREE.Group(),loader);environment.group.updateMatrixWorld(true);
assert.deepEqual(drawCalls,['Edmund Sir','DSE English Speaking Studio']);assert.deepEqual(BLACKBOARD_LINES,drawCalls);
const floor=environment.group.getObjectByName('Oak plank floor');assert.equal(floor.material.map.wrapS,THREE.RepeatWrapping);
const windowView=new THREE.Raycaster(new THREE.Vector3(0,2.95,1.4),new THREE.Vector3(-1,0,0)).intersectObject(environment.group,true);
assert.equal(windowView[0].object.name,'Leafy city beyond the windows','windows are real openings onto exterior scenery');
const origin=new THREE.Vector3().copy(interiorOrbit({...CAMERA_START.target},CAMERA_START.yaw,CAMERA_START.pitch,CAMERA_START.distance));
for(const direction of [new THREE.Vector3(0,1,0),new THREE.Vector3(0,-1,0),new THREE.Vector3(1,0,0),new THREE.Vector3(0,0,1),new THREE.Vector3(0,0,-1),new THREE.Vector3(-1,0,0)]){
 const hits=new THREE.Raycaster(origin,direction).intersectObject(environment.group,true);assert.ok(hits.length,'walls, ceiling, floor or exterior cover every principal view');
}
const owned=new Set();environment.group.traverse(o=>{if(o.isMesh){owned.add(o.geometry);owned.add(o.material);if(o.material.map)owned.add(o.material.map);}});let released=0;for(const r of owned)r.addEventListener('dispose',()=>released++);environment.dispose();environment.dispose();assert.equal(released,owned.size);
const lateTexture=new THREE.Texture();let freed=false;lateTexture.addEventListener('dispose',()=>freed=true);let call=0;await assert.rejects(createClassroomEnvironment(new THREE.Group(),{async loadAsync(){if(call++===0)return lateTexture;throw Error('offline');}}),/classroom materials/);assert.ok(freed,'failed material loading releases successful textures');delete globalThis.document;
console.log('Classroom interior: camera confinement across orbit/pan/zoom, subtle nod limits, exact board lettering, enclosure, wood mapping and resource disposal passed.');
