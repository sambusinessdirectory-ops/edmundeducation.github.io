import * as THREE from './vendor/three/three.module.js';
import {MASCOT_VIEWS} from './speaking-mascot-views.mjs?v=20260908-mascots9';
import {viewPair, mouthOpening, COAT_COLOURS} from './speaking-mascot-behaviour.mjs?v=20260908-mascots9';
import {mascotMaterial, applyViewPair} from './speaking-mascot-material.mjs?v=20260908-mascots9';

export class MascotCharacters {
  constructor(loader=new THREE.TextureLoader(), request=globalThis.fetch.bind(globalThis)) {
    this.loader=loader;this.fetch=request;this.resources=new Map();this.actors=[];this.disposed=false;
  }
  load(name,pose) {
    const key=name+'-'+pose;
    if(this.disposed)return Promise.resolve(null);
    if(this.resources.has(key))return this.resources.get(key).promise;
    const data=MASCOT_VIEWS[name][pose],entry={atlas:null,flow:null,data};
    this.resources.set(key,entry);
    const base=new URL('./assets/speaking-system/mascots/v2/',import.meta.url);
    const image=this.loader.loadAsync(new URL(data.image,base).href).then(texture=>{
      texture.colorSpace=THREE.SRGBColorSpace;texture.generateMipmaps=false;texture.minFilter=THREE.LinearFilter;
      if(this.disposed){texture.dispose();return null;}entry.atlas=texture;return texture;
    });
    const field=this.fetch(new URL(data.flow,base).href).then(async response=>{
      if(!response.ok)throw new Error('Could not load view interpolation');
      const bytes=new Uint8Array(await response.arrayBuffer());
      const [columns,rows]=data.flowGrid,width=data.flowSize*columns,height=data.flowSize*rows;
      if(bytes.length!==width*height*4)throw new Error('Incomplete view interpolation');
      const texture=new THREE.DataTexture(bytes,width,height,THREE.RGBAFormat);
      texture.minFilter=texture.magFilter=THREE.LinearFilter;texture.needsUpdate=true;
      if(this.disposed){texture.dispose();return null;}entry.flow=texture;return texture;
    });
    entry.promise=Promise.allSettled([image,field]).then(results=>{
      if(this.disposed)return null;
      if(results.some(result=>result.status==='rejected')){
        entry.atlas?.dispose();entry.flow?.dispose();entry.atlas=entry.flow=null;
        throw new Error(`Could not load ${name} character artwork`,{cause:results.find(result=>result.status==='rejected').reason});
      }
      return entry;
    });
    return entry.promise;
  }
  async create(name='eddy',pose='standing') {
    if(!MASCOT_VIEWS[name])name='eddy';
    if(!['standing','seated'].includes(pose))pose='standing';
    const resource=await this.load(name,pose);
    if(this.disposed||!resource)return null;
    const headResource=resource;
    if(this.disposed||!headResource)return null;
    const ratio=1,offset=[0,0];
    const headData={...headResource.data,views:headResource.data.views.map(view=>({...view,
      layout:[view.layout[0]*ratio+offset[0],view.layout[1]*ratio+offset[1],view.layout[2]*ratio,view.layout[3]*ratio],
      mouth:[view.mouth[0]*ratio+offset[0],view.mouth[1]*ratio+offset[1],view.mouth[2]*ratio],
    }))};
    const material=mascotMaterial(resource.atlas,resource.flow,resource.data,COAT_COLOURS[name],headResource,[ratio,...offset]);
    const geometry=new THREE.PlaneGeometry(1,1,32,40).translate(0,.5,0);
    const mesh=new THREE.Mesh(geometry,material);
    mesh.name=name+'-'+pose+'-character';mesh.userData.mascotSurface=true;mesh.castShadow=false;
    const actor={name,pose,mesh,data:resource.data,headData,angles:resource.data.views.map(view=>view.angle),headAngles:headData.views.map(view=>view.angle),world:new THREE.Vector3()};
    this.actors.push(actor);this.update(actor,0,0,0,true,false,0,0);
    return actor;
  }
  update(actor,cameraAzimuth,facingYaw,seconds,reducedMotion,speaking,lookYaw=0,nod=0) {
    const bodyTurn=lookYaw*.12,headTurn=lookYaw;
    const body=viewPair(facingYaw+bodyTurn-cameraAzimuth,actor.angles);
    const head=viewPair(facingYaw+headTurn-cameraAzimuth,actor.headAngles);
    applyViewPair(actor.mesh.material,'body',actor.data,body);
    applyViewPair(actor.mesh.material,'head',actor.headData,head);
    const uniforms=actor.mesh.material.uniforms;
    uniforms.mouthOpen.value=mouthOpening(seconds,speaking,reducedMotion);
    uniforms.nod.value=reducedMotion?0:nod;
    uniforms.breath.value=reducedMotion?0:Math.sin(seconds*1.5);
    actor.mesh.rotation.y=cameraAzimuth-facingYaw;
    const height=actor.pose==='seated'?1.80:2.15;
    actor.mesh.scale.set(height,height,1);
    actor.mesh.position.y=.04-height*.06;
    actor.view=body;actor.headView=head;
  }
  dispose() {
    if(this.disposed)return;
    this.disposed=true;
    for(const actor of this.actors){actor.mesh.geometry.dispose();actor.mesh.material.dispose();}
    for(const entry of this.resources.values()){entry.atlas?.dispose();entry.flow?.dispose();}
    this.actors.length=0;this.resources.clear();
  }
}
