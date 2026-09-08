import * as THREE from './vendor/three/three.module.js';
import {MASCOT_ART} from './speaking-mascot-art.mjs?v=20260908-mascots8';

// A viewer to the horse's right sees its muzzle pointing left on screen.
export const VIEW_DIRECTIONS = ['s', 'sw', 'w', 'nw', 'n', 'ne', 'e', 'se'];
export function mascotDirection(cameraAzimuth, facingYaw) {
  const index = Math.round((cameraAzimuth - facingYaw) / (Math.PI / 4));
  return VIEW_DIRECTIONS[((index % 8) + 8) % 8];
}
export function idleFrame(seconds, reducedMotion = false) {
  return reducedMotion ? 1 : ((Math.floor(Math.max(0, seconds) * 6) % 12) + 1);
}
export function eddyFrameURL(direction, frame = 1) {
  if (!VIEW_DIRECTIONS.includes(direction) || !Number.isInteger(frame) || frame < 1 || frame > 12) throw new RangeError('Unknown Eddy frame');
  return new URL(`./eddy-carrot-patch/assets/production-v2/packages/animseq_eddy_idle_001/v001/${direction}/animseq_eddy_idle_001__${direction}__idle__v001__f${String(frame).padStart(3, '0')}.png`, import.meta.url).href;
}
export function atlasFrame(name, direction) {
  const {size: [width, height], frames} = MASCOT_ART[name];
  const [x, y, w, h] = frames[direction];
  return {repeat: [w / width, h / height], offset: [x / width, 1 - (y + h) / height], aspect: w / h};
}

// Each classroom owns and releases its textures. Eddy frames are shared by all
// candidates and only requested for viewing directions that have been used.
export class MascotSprites {
  constructor(loader = new THREE.TextureLoader()) {
    this.loader = loader;
    this.resources = new Map();
    this.actors = [];
    this.disposed = false;
  }
  request(url) {
    if (this.disposed) return Promise.resolve(null);
    if (this.resources.has(url)) return this.resources.get(url).promise;
    const entry = {texture: null};
    this.resources.set(url, entry);
    entry.promise = this.loader.loadAsync(url).then(texture => {
      if (this.disposed) { texture.dispose(); return null; }
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.generateMipmaps = false;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      entry.texture = texture;
      return texture;
    }).catch(() => null);
    return entry.promise;
  }
  async create(name = 'eddy') {
    if (!['eddy', 'elsie', 'phoebe'].includes(name)) name = 'eddy';
    const url = name === 'eddy' ? eddyFrameURL('s') : new URL(`./assets/speaking-system/mascots/${name}-directions-v1.png`, import.meta.url).href;
    const source = await this.request(url);
    if (this.disposed) return null;
    if (!source) throw new Error(`Could not load ${name} artwork`);
    const map = name === 'eddy' ? source : source.clone();
    map.needsUpdate = true;
    const material = new THREE.MeshBasicMaterial({map, transparent: true, alphaTest: .16, side: THREE.DoubleSide, toneMapped: false});
    const geometry = new THREE.PlaneGeometry(1, 1).translate(0, .5, 0);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = `${name}-artwork`;
    const actor = {name, mesh, map, direction: null, world: new THREE.Vector3(), requested: new Set(), lastFrame: -1};
    this.actors.push(actor);
    this.update(actor, 0, 0, 0, true, false);
    return actor;
  }
  update(actor, cameraAzimuth, facingYaw, seconds, reducedMotion, speaking) {
    const {mesh, name, map} = actor;
    const direction = mascotDirection(cameraAzimuth, facingYaw);
    mesh.rotation.y = cameraAzimuth - facingYaw;
    const height = 1.95 * (1 + (reducedMotion || name === 'eddy' ? 0 : Math.sin(seconds * 1.6) * .008));
    let aspect;
    if (name === 'eddy') {
      // One fixed crop preserves every supplied frame's breathing/foot alignment.
      aspect = 240 / 376;
      if (!actor.requested.has(direction)) {
        actor.requested.add(direction);
        for (let frame = 1; frame <= 12; frame++) this.request(eddyFrameURL(direction, frame));
      }
      const frame = idleFrame(seconds, reducedMotion);
      const ready = this.resources.get(eddyFrameURL(direction, frame))?.texture || this.resources.get(eddyFrameURL(direction, 1))?.texture;
      if (ready) {
        ready.repeat.set(240 / 512, 376 / 512);
        ready.offset.set(136 / 512, 1 - 449 / 512);
        mesh.material.map = ready;
        actor.map = ready;
      }
    } else {
      const frame = atlasFrame(name, direction);
      map.repeat.set(...frame.repeat);
      map.offset.set(...frame.offset);
      aspect = frame.aspect;
    }
    actor.direction = direction;
    mesh.scale.set(height * aspect, height, 1);
    mesh.rotation.z = !reducedMotion && speaking ? Math.sin(seconds * 2.5) * .012 : 0;
  }
  dispose() {
    this.disposed = true;
    for (const {name, mesh, map} of this.actors) { mesh.geometry.dispose(); mesh.material.dispose(); if (name !== 'eddy') map.dispose(); }
    for (const entry of this.resources.values()) entry.texture?.dispose();
    this.actors.length = 0;
    this.resources.clear();
  }
}
