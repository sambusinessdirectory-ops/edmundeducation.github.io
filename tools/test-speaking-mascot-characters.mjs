import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../vendor/three/three.module.js';
import {MascotCharacters} from '../speaking-mascot-characters.mjs';
import {MASCOT_VIEWS} from '../speaking-mascot-views.mjs';
for(const [name,poses] of Object.entries(MASCOT_VIEWS))for(const [pose,data] of Object.entries(poses)){
 const png=fs.readFileSync(new URL(`../assets/speaking-system/mascots/v2/${data.image}`,import.meta.url));
 assert.equal(png[25],6,`${name} ${pose} is RGBA`);assert.equal(data.views.length,16);assert.equal(new Set(data.views.map(v=>v.sourceCell)).size,16);assert.equal(data.views[0].angle,0);
 for(let i=0;i<16;i++){const v=data.views[i];if(i)assert.ok(v.angle>data.views[i-1].angle);assert.ok(v.rect[0]>=0&&v.rect[1]>=0&&v.rect[0]+v.rect[2]<=1&&v.rect[1]+v.rect[3]<=1);assert.ok(v.mouth.every(Number.isFinite));if(v.angle>97&&v.angle<263)assert.equal(v.mouth[2],0,'rear heads cannot display a floating mouth');}
 assert.equal(fs.statSync(new URL(`../assets/speaking-system/mascots/v2/${data.flow}`,import.meta.url)).size,data.flowSize**2*data.flowGrid[0]*data.flowGrid[1]*4);
}
const textures=[],loads=[],requests=[];
const library=new MascotCharacters({async loadAsync(url){loads.push(url);const t=new THREE.Texture();textures.push(t);return t;}},async url=>{requests.push(url);return {ok:true,arrayBuffer:async()=>new ArrayBuffer(512*512*4)};});
const [a,b]=await Promise.all([library.create('eddy','seated'),library.create('eddy','seated')]);assert.equal(loads.length,1);assert.equal(requests.length,1,'candidates share asset loading');
library.update(a,0,0,.1,false,true,1,.08);library.update(b,0,0,.1,false,false,-1,0);assert.notDeepEqual(a.headView,b.headView,'listeners turn independently');assert.ok(a.mesh.material.uniforms.mouthOpen.value>0);assert.equal(b.mesh.material.uniforms.mouthOpen.value,0);assert.ok(Math.abs(a.mesh.position.y+a.mesh.scale.y*.06-.04)<1e-8,'feet stay anchored by the chair');
library.update(a,0,0,1,true,true,1,.08);for(const key of ['mouthOpen','nod','breath'])assert.equal(a.mesh.material.uniforms[key].value,0,'reduced motion');
let releases=0;const flow=library.resources.get('eddy-seated').flow;for(const t of [...textures,flow])t.addEventListener('dispose',()=>releases++);library.dispose();library.dispose();assert.equal(releases,2,'resources disposed once');
let finish;const pending=new MascotCharacters({loadAsync:()=>new Promise(resolve=>finish=resolve)},async()=>({ok:true,arrayBuffer:async()=>new ArrayBuffer(512*512*4)}));const loading=pending.create('elsie','seated');pending.dispose();const late=new THREE.Texture();let freed=false;late.addEventListener('dispose',()=>freed=true);finish(late);assert.equal(await loading,null);assert.equal(freed,true);
const broken=new MascotCharacters({async loadAsync(){return new THREE.Texture();}},async()=>({ok:true,arrayBuffer:async()=>new ArrayBuffer(8)}));await assert.rejects(broken.create('phoebe','seated'),error=>error.cause.message==='Incomplete view interpolation');broken.dispose();
console.log('Mascot characters: 96 views, RGBA/flow integrity, shared loads, independent attention, mouth control, foot anchoring, reduced motion and disposal passed.');
