import * as THREE from './vendor/three/three.module.js';
import { cosmeticAtlas, supportsCosmetics, restoreCosmetics, subscribeCosmetics } from './eddy-cosmetics.mjs?v=20260916-three-tops1';
import {MASCOT_VIEWS} from './speaking-mascot-views.mjs?v=20260915-phoebe2';
import {viewPair, mouthOpening, blinkAmount, COAT_COLOURS} from './speaking-mascot-behaviour.mjs?v=20260915-phoebe2';
import {mascotMaterial, applyViewPair} from './speaking-mascot-material.mjs?v=20260915-tailored1';

export class MascotCharacters {
  constructor(loader=new THREE.TextureLoader(), request=globalThis.fetch.bind(globalThis),{preview=false}={}) {
    this.previewCosmetics=preview;this.loader=loader;this.fetch=request;this.resources=new Map();this.actors=[];this.disposed=false;
    this.unsubscribeCosmetics=subscribeCosmetics(()=>this.refreshCosmetics());
    void restoreCosmetics();
  }
  load(name,pose) {
    const key=name+'-'+pose;
    if(this.disposed)return Promise.resolve(null);
    if(this.resources.has(key))return this.resources.get(key).promise;
    const data=MASCOT_VIEWS[name][pose],entry={atlas:null,blink:null,flow:null,data};
    this.resources.set(key,entry);
    const base=new URL(`./assets/speaking-system/mascots/${data.folder||'v2'}/`,import.meta.url);
    const artwork=file=>pose==='standing'?file.replace(/\.png$/,'-clean.webp?v=20260915-tailored1'):file;
    const image=this.loader.loadAsync(new URL(artwork(data.image),base).href).then(texture=>{
      texture.colorSpace=THREE.SRGBColorSpace;texture.generateMipmaps=false;texture.minFilter=THREE.LinearFilter;
      if(this.disposed){texture.dispose();return null;}entry.atlas=texture;return texture;
    });
    const blink=data.blinkImage?this.loader.loadAsync(new URL(artwork(data.blinkImage),base).href).then(texture=>{
      texture.colorSpace=THREE.SRGBColorSpace;texture.generateMipmaps=false;texture.minFilter=THREE.LinearFilter;
      if(this.disposed){texture.dispose();return null;}entry.blink=texture;return texture;
    }):Promise.resolve(null);
    const field=this.fetch(new URL(data.flow,base).href).then(async response=>{
      if(!response.ok)throw new Error('Could not load view interpolation');
      const bytes=new Uint8Array(await response.arrayBuffer());
      const [columns,rows]=data.flowGrid,width=data.flowSize*columns,height=data.flowSize*rows;
      if(bytes.length!==width*height*4)throw new Error('Incomplete view interpolation');
      const texture=new THREE.DataTexture(bytes,width,height,THREE.RGBAFormat);
      texture.minFilter=texture.magFilter=THREE.LinearFilter;texture.needsUpdate=true;
      if(this.disposed){texture.dispose();return null;}entry.flow=texture;return texture;
    });
    entry.promise=Promise.allSettled([image,blink,field]).then(results=>{
      if(this.disposed)return null;
      if(results.some(result=>result.status==='rejected')){
        entry.atlas?.dispose();entry.blink?.dispose();entry.flow?.dispose();entry.atlas=entry.blink=entry.flow=null;
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
    const headResource=pose==='standing'?resource:await this.load(name,'standing');
    if(this.disposed||!headResource)return null;
    const ratio=1,offset=[0,0];
    const headData={...headResource.data,views:headResource.data.views.map(view=>({...view,
      layout:[view.layout[0]*ratio+offset[0],view.layout[1]*ratio+offset[1],view.layout[2]*ratio,view.layout[3]*ratio],
      mouth:[view.mouth[0]*ratio+offset[0],view.mouth[1]*ratio+offset[1],view.mouth[2]*ratio],
    }))};
    const material=mascotMaterial(resource.atlas,resource.flow,resource.data,COAT_COLOURS[name],headResource,[ratio,...offset]);
    // Standing sprites join at the neck, above the sweater, not the seated waist.
    material.uniforms.headBand.value.set(...(pose==='standing'?[.49,.53]:[.38,.46]));
    material.uniforms.alphaCutoff.value=pose==='standing'?.42:.18;
    const geometry=new THREE.PlaneGeometry(1,1,32,40).translate(0,.5,0);
    const mesh=new THREE.Mesh(geometry,material);
    mesh.name=name+'-'+pose+'-character';mesh.userData.mascotSurface=true;mesh.castShadow=false;
    const actor={name,pose,mesh,data:resource.data,headData,angles:resource.data.views.map(view=>view.angle),headAngles:headData.views.map(view=>view.angle),blinkSeed:this.actors.length+({eddy:1,elsie:5,phoebe:9}[name]||1),world:new THREE.Vector3()};
    actor.resource=resource;
    this.actors.push(actor);this.refreshCosmetics();this.update(actor,0,0,0,true,false,0,0);
    return actor;
  }
  refreshCosmetics() {
    for(const actor of this.actors){
      if(!supportsCosmetics(actor.name)||actor.pose!=='standing')continue;
      const r=actor.resource,u=actor.mesh.material.uniforms;
      const open=cosmeticAtlas(actor.name,r.atlas.image,{preview:this.previewCosmetics}),blink=cosmeticAtlas(actor.name,(r.blink||r.atlas).image,{preview:this.previewCosmetics});
      if(actor.cosmeticOpen===open&&actor.cosmeticBlink===blink)continue;
      actor.cosmeticTextures?.forEach(t=>t.dispose());
      actor.cosmeticTextures=[];
      const texture=(image,original)=>{if(image===original.image)return original;const t=new THREE.CanvasTexture(image);t.colorSpace=THREE.SRGBColorSpace;t.generateMipmaps=false;t.minFilter=THREE.LinearFilter;actor.cosmeticTextures.push(t);return t;};
      const a=texture(open,r.atlas),b=texture(blink,r.blink||r.atlas);
      u.atlas.value=u.headAtlas.value=a;u.headBlinkAtlas.value=b;
      u.flowStrength.value=open===r.atlas.image?1:0;
      actor.cosmeticOpen=open;actor.cosmeticBlink=blink;
    }
  }
  update(actor,cameraAzimuth,facingYaw,seconds,reducedMotion,speaking,lookYaw=0,nod=0) {
    const bodyTurn=lookYaw*.12,headTurn=lookYaw;
    const body=viewPair(facingYaw+bodyTurn-cameraAzimuth,actor.angles);
    const head=viewPair(facingYaw+headTurn-cameraAzimuth,actor.headAngles);
    applyViewPair(actor.mesh.material,'body',actor.data,body);
    applyViewPair(actor.mesh.material,'head',actor.headData,head);
    const uniforms=actor.mesh.material.uniforms;
    uniforms.mouthOpen.value=mouthOpening(seconds,speaking,reducedMotion);
    uniforms.blink.value=blinkAmount(seconds,actor.blinkSeed,reducedMotion);
    uniforms.nod.value=reducedMotion?0:nod;
    uniforms.headYaw.value=facingYaw+headTurn-cameraAzimuth;
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
    this.unsubscribeCosmetics();
    for(const actor of this.actors)actor.cosmeticTextures?.forEach(t=>t.dispose());
    for(const actor of this.actors){actor.mesh.geometry.dispose();actor.mesh.material.dispose();}
    for(const entry of this.resources.values()){entry.atlas?.dispose();entry.blink?.dispose();entry.flow?.dispose();}
    this.actors.length=0;this.resources.clear();
  }
}
