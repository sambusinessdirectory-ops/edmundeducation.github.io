const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const script = fs.readFileSync(path.join(root, 'eddy-first-question-dialogue.js'), 'utf8');
const art = [
  'eddy-first-question-dialogue.webp',
  'eddy-tenth-question-dialogue.webp',
  'eddy-twentieth-question-dialogue.webp',
  'eddy-thirtieth-question-dialogue.webp',
  'eddy-fortieth-question-dialogue.webp',
  ...Array.from({ length: 5 }, (_, index) => `eddy-fiftieth-face-${index + 1}.webp`),
];

for (const name of art) {
  assert.match(script, new RegExp(name.replaceAll('.', '\\.') + "'"), `${name} is used by the shared game dialogue`);
  const bytes = fs.readFileSync(path.join(root, name));
  assert.equal(bytes.subarray(0, 4).toString('ascii'), 'RIFF', `${name} has a WebP RIFF header`);
  assert.equal(bytes.subarray(8, 12).toString('ascii'), 'WEBP', `${name} has a WebP signature`);
  assert.ok(bytes.length > 100_000, `${name} contains the complete lossless artwork`);
}

for (const name of art.map((name) => name.replace(/\.webp$/, '.png'))) {
  assert.ok(!script.includes(`'${name}'`), `${name} is not requested by the game runtime`);
}

const consumerVersion = 'eddy-first-question-dialogue.js?v=20261107-same-origin1';
const consumers = fs.readdirSync(root)
  .filter((name) => name.endsWith('.html'))
  .filter((name) => fs.readFileSync(path.join(root, name), 'utf8').includes('eddy-first-question-dialogue.js'));
assert.ok(consumers.length >= 20, 'the shared dialogue remains installed across the game portals');
for (const name of consumers) {
  assert.ok(fs.readFileSync(path.join(root, name), 'utf8').includes(consumerVersion), `${name} cache-busts the repaired shared dialogue`);
}

console.log(`PASS: ${art.length} same-origin game-dialogue images and ${consumers.length} consumers are release-safe.`);
