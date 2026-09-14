import * as THREE from './vendor/three/three.module.js';
import {mergeGeometries} from './vendor/three/utils/BufferGeometryUtils.js';

// Keep the mirror and transparent objects independent; group static opaque
// triangles by their material, including the six faces of folded garments.
export function batchClosetSurfaces(scene, group, resources, mirror) {
  scene.updateMatrixWorld(true);
  const buckets=new Map(), originals=new Set();
  group.traverse(mesh=>{
    if(!mesh.isMesh || mesh===mirror || mesh.matrixWorld.determinant()<0) return;
    const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];
    if(materials.some(m=>m.transparent)) return;
    const flat=mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry.clone();
    flat.applyMatrix4(mesh.matrixWorld);
    const groups=Array.isArray(mesh.material)?flat.groups:[{start:0,count:flat.attributes.position.count,materialIndex:0}];
    for(const segment of groups) {
      const material=materials[segment.materialIndex],part=new THREE.BufferGeometry();
      for(const [name,attribute] of Object.entries(flat.attributes)) {
        const start=segment.start*attribute.itemSize,end=(segment.start+segment.count)*attribute.itemSize;
        part.setAttribute(name,new THREE.BufferAttribute(attribute.array.slice(start,end),attribute.itemSize,attribute.normalized));
      }
      const key=[material.uuid,mesh.castShadow,mesh.receiveShadow,Object.keys(part.attributes).sort().join(',')].join(':');
      if(!buckets.has(key)) buckets.set(key,{material,cast:mesh.castShadow,receive:mesh.receiveShadow,parts:[]});
      buckets.get(key).parts.push(part);
    }
    flat.dispose();originals.add(mesh);
  });
  for(const bucket of buckets.values()) {
    const geometry=mergeGeometries(bucket.parts,false);
    bucket.parts.forEach(part=>part.dispose());
    if(!geometry) throw new Error('Closet surface batch attributes do not match');
    geometry.computeBoundingSphere();resources.geometries.add(geometry);
    const batch=new THREE.Mesh(geometry,bucket.material);
    batch.name='Static closet surfaces';batch.castShadow=bucket.cast;batch.receiveShadow=bucket.receive;batch.matrixAutoUpdate=false;
    scene.add(batch);
  }
  originals.forEach(mesh=>{mesh.removeFromParent();resources.geometries.delete(mesh.geometry);mesh.geometry.dispose();});
}
