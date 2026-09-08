import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../vendor/three/three.module.js';
import {seatLayout} from '../speaking-classroom-3d.mjs';
import {MascotSprites, VIEW_DIRECTIONS, mascotDirection, idleFrame, eddyFrameURL, atlasFrame} from '../speaking-mascot-sprites.mjs';

for (const count of [2, 3, 4]) for (let i = 0; i < count; i++) {
  const seat = seatLayout(count, i);
  for (let view = 0; view < 8; view++) {
    for (const turns of [-2, 0, 3]) assert.equal(mascotDirection(seat.yaw + view * Math.PI / 4 + turns * Math.PI * 2, seat.yaw), VIEW_DIRECTIONS[view]);
  }
}
assert.equal(mascotDirection(Math.PI / 8 - .001, 0), 's');
assert.equal(mascotDirection(Math.PI / 8 + .001, 0), 'sw');
assert.deepEqual(Array.from({length: 13}, (_, i) => idleFrame(i / 6 + .00001)), [1,2,3,4,5,6,7,8,9,10,11,12,1]);
assert.equal(idleFrame(1.2, true), 1);
for (const direction of VIEW_DIRECTIONS) for (let frame = 1; frame <= 12; frame++) {
  const buffer = fs.readFileSync(new URL(eddyFrameURL(direction, frame)));
  assert.equal(buffer.readUInt32BE(16), 512); assert.equal(buffer.readUInt32BE(20), 512); assert.equal(buffer[25], 6, 'Eddy retains RGBA transparency');
}
for (const name of ['elsie', 'phoebe']) {
  const file = fs.readFileSync(new URL(`../assets/speaking-system/mascots/${name}-directions-v1.png`, import.meta.url));
  assert.equal(file[25], 6, `${name} must have real alpha`);
  for (const direction of VIEW_DIRECTIONS) {
    const {repeat, offset, aspect} = atlasFrame(name, direction);
    assert.ok(aspect > .3 && aspect < .8);
    for (let i = 0; i < 2; i++) assert.ok(offset[i] >= 0 && offset[i] + repeat[i] <= 1.00001);
  }
}
assert.throws(() => eddyFrameURL('invalid'), RangeError);
const calls = [], textures = [], originals = new Map();
const library = new MascotSprites({async loadAsync(url) { calls.push(url); const texture = new THREE.Texture({width: 512, height: 512}); originals.set(texture, texture.source); textures.push(texture); return texture; }});
const first = await library.create('eddy'), second = await library.create('eddy');
await Promise.resolve();
assert.equal(calls.length, 12, 'two Eddy candidates share the same frame loads');
library.update(first, Math.PI / 2, 0, .5, false, true);
await Promise.resolve();
library.update(first, Math.PI / 2, 0, .5, false, true);
assert.equal(first.direction, 'w'); assert.equal(calls.length, 24);
assert.equal(first.map.source, library.resources.get(eddyFrameURL('w', 4)).texture.source);
assert.notEqual(first.map.source, second.map.source, 'each candidate can show a different frame');
library.update(first, Math.PI / 2, 0, .5, true, true);
assert.equal(first.map.source, library.resources.get(eddyFrameURL('w', 1)).texture.source);
assert.equal(first.mesh.rotation.z, 0, 'reduced motion stops speaking sway');
const elsie = await library.create('elsie');
library.update(elsie, -Math.PI / 2, .1, 2, true, true);
assert.equal(elsie.direction, 'e'); assert.deepEqual(elsie.map.offset.toArray(), atlasFrame('elsie', 'e').offset);
for (const texture of textures) assert.equal(texture.source, originals.get(texture), 'frame switches must not mutate a texture source already owned by WebGL');
let released = 0;
for (const texture of textures) texture.addEventListener('dispose', () => released++);
library.dispose(); assert.equal(released, textures.length); assert.equal(library.resources.size, 0);
let finish;
const pending = new MascotSprites({loadAsync() { return new Promise(resolve => { finish = resolve; }); }});
const loading = pending.create('phoebe'); pending.dispose();
const late = new THREE.Texture(); let disposedLate = false; late.addEventListener('dispose', () => { disposedLate = true; }); finish(late);
assert.equal(await loading, null); assert.equal(disposedLate, true, 'late loading cannot leak a disposed classroom');
const broken = new MascotSprites({async loadAsync() { throw new Error('offline'); }});
await assert.rejects(broken.create('elsie'), /Could not load elsie artwork/); broken.dispose();
for (const name of ['eddy.glb', 'elsie.glb', 'phoebe.glb', 'classroom-source.blend']) assert.equal(fs.existsSync(new URL('../assets/speaking-system/classroom/' + name, import.meta.url)), false, 'rejected models are not published');
console.log('Mascot sprites: all 96 original RGBA frames, 8 directions × 2/3/4 seats, camera wrap/boundaries, atlas crops, independent animation, shared loads, reduced motion and disposal passed.');
