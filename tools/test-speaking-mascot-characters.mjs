import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../vendor/three/three.module.js';
import {MascotCharacters} from '../speaking-mascot-characters.mjs';
import {MASCOT_VIEWS} from '../speaking-mascot-views.mjs';

const extraction=fs.readFileSync(new URL('./mascot-art/v3/extract-blink-sheets.py',import.meta.url),'utf8');
assert.ok(extraction.includes("MIRRORED_BASELINES = {'elsie': {12: 4, 13: 2, 14: 1}, 'phoebe': {13: 2}}"), 'known closed-eye and reversed-direction baseline cells are replaced');
assert.ok(extraction.includes("(high - low) <= 6"), 'background removal must preserve Elsie cream hair');

for(const [name,poses] of Object.entries(MASCOT_VIEWS))for(const [pose,data] of Object.entries(poses)){
 const folder=data.folder||'v2',base=`../assets/speaking-system/mascots/${folder}/`;
 const png=fs.readFileSync(new URL(base+data.image,import.meta.url));
 assert.equal(png[25],6,`${name} ${pose} is RGBA`);assert.equal(data.views.length,16);assert.ok(data.views.every(v=>Number.isInteger(v.sourceCell)&&v.sourceCell>=0&&v.sourceCell<16));assert.equal(data.views[0].angle,0);
 if(pose==='standing'){
  assert.equal(folder,'v4');assert.ok(data.blinkImage,`${name} has blink artwork`);if(name==='elsie')assert.equal(data.blinkImage,'elsie-blink-registered.png','Elsie uses the registered eye-only blink asset');
  const blink=fs.readFileSync(new URL(base+data.blinkImage,import.meta.url));assert.equal(blink[25],6,`${name} blink is RGBA`);
  assert.equal(blink.readUInt32BE(16),png.readUInt32BE(16));assert.equal(blink.readUInt32BE(20),png.readUInt32BE(20));
 }
 for(let i=0;i<16;i++){const v=data.views[i];if(i)assert.ok(v.angle>data.views[i-1].angle);assert.ok(v.rect[0]>=0&&v.rect[1]>=0&&v.rect[0]+v.rect[2]<=1&&v.rect[1]+v.rect[3]<=1);assert.ok(v.mouth.every(Number.isFinite));if(v.angle>97&&v.angle<263)assert.equal(v.mouth[2],0,'rear heads cannot display a floating mouth');}
 assert.equal(fs.statSync(new URL(base+data.flow,import.meta.url)).size,data.flowSize**2*data.flowGrid[0]*data.flowGrid[1]*4);
}

const textures=[],loads=[],requests=[];
const library=new MascotCharacters({async loadAsync(url){loads.push(url);const t=new THREE.Texture();textures.push(t);return t;}},async url=>{requests.push(url);return {ok:true,arrayBuffer:async()=>new ArrayBuffer(512*512*4)};});
const [a,b]=await Promise.all([library.create('eddy','seated'),library.create('eddy','seated')]);assert.equal(loads.length,3);assert.equal(requests.length,2,'candidates share seated, standing-head and blink resources');
library.update(a,0,0,.1,false,true,1,.08);library.update(b,0,0,.1,false,false,-1,0);assert.notDeepEqual(a.headView,b.headView,'listeners turn independently');assert.ok(a.mesh.material.uniforms.mouthOpen.value>0);assert.equal(b.mesh.material.uniforms.mouthOpen.value,0);assert.ok(Math.abs(a.mesh.position.y+a.mesh.scale.y*.06-.04)<1e-8,'feet stay anchored by the chair');
library.update(a,0,0,4.15,false,false,0,0);assert.ok(a.mesh.material.uniforms.blink.value>.9,'closed-eye sheet is reached during a natural blink');
library.update(a,0,0,1,true,true,1,.08);for(const key of ['mouthOpen','blink','nod','breath'])assert.equal(a.mesh.material.uniforms[key].value,0,'reduced motion');
let releases=0;const flows=[...library.resources.values()].map(resource=>resource.flow);for(const t of [...textures,...flows])t.addEventListener('dispose',()=>releases++);library.dispose();library.dispose();assert.equal(releases,5,'resources disposed once');

const finishes=[];const pending=new MascotCharacters({loadAsync:()=>new Promise(resolve=>finishes.push(resolve))},async()=>({ok:true,arrayBuffer:async()=>new ArrayBuffer(512*512*4)}));const loading=pending.create('elsie','standing');pending.dispose();let freed=0;for(const finish of finishes){const late=new THREE.Texture();late.addEventListener('dispose',()=>freed++);finish(late);}assert.equal(await loading,null);assert.equal(freed,2,'late open and blink textures cannot leak');
const broken=new MascotCharacters({async loadAsync(){return new THREE.Texture();}},async()=>({ok:true,arrayBuffer:async()=>new ArrayBuffer(8)}));await assert.rejects(broken.create('phoebe','seated'),error=>error.cause.message==='Incomplete view interpolation');broken.dispose();
console.log('Mascot characters: 96 views, v4 RGBA/blink integrity, shared loads, seated head reuse, independent attention, mouth/blink control, floor anchoring, reduced motion and disposal passed.');
