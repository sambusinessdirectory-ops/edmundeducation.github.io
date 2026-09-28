import assert from 'node:assert/strict';
import {modules, moduleMap} from '../natural-english/catalogue.mjs';
import {audioManifest} from '../natural-english/audio/manifest.mjs';

assert.deepEqual(modules.map(module => module.number), [1, 2, 3, 4, 5, 6]);
assert.equal(moduleMap.has('native-007'), false);
assert.equal(moduleMap.has('native-102'), false);
assert.equal(moduleMap.has('native-549'), false);
assert.ok(Object.keys(audioManifest).every(id => !id.startsWith('native-')));
console.log('PASS: imported Native English lessons are quarantined; original six lessons remain available.');
