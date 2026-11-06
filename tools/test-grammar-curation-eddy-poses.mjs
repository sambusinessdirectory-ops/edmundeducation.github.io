import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';

const root = path.resolve(import.meta.dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const manifest = JSON.parse(read('grammar-eddy-dialogues/curation-pose-manifest.json'));
assert.equal(manifest.cycleLength, 33);
assert.deepEqual(manifest.poses.map(pose => pose.rule), Array.from({ length: 33 }, (_, i) => i + 1));
assert.equal(new Set(manifest.poses.map(pose => pose.sourceFilename)).size, 33);
assert.ok(manifest.poses.every(pose => /^Grammar taeching rule \d+\b/i.test(pose.sourceFilename)));
assert.ok(manifest.poses.every(pose => fs.existsSync(path.join(root, pose.asset))));
assert.ok(manifest.excluded.every(name => !manifest.poses.some(pose => pose.sourceFilename === name)));

const require = createRequire(new URL('./email-qa/package.json', import.meta.url));
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<main data-learning-portal-root><section data-view="dashboard"><section data-grammar-library></section></section></main>',
  { runScripts: 'outside-only', url: 'https://example.test/grammar-system.html' });
dom.window.HTMLElement.prototype.scrollIntoView = function () {};
dom.window.requestAnimationFrame = () => 1;
for (const file of ['grammar-new-curations-data.js', 'grammar-indefinite-pronouns-data.js', 'grammar-new-curations.js']) {
  dom.window.eval(read(file));
}
const guide = dom.window.document.querySelector('[data-new-grammar-curation="indefinite-pronouns"]');
const cards = [...guide.querySelectorAll('.grammar-eddy-dialogue')];
assert.equal(cards.length, 68);
for (const [index, card] of cards.entries()) {
  const expected = manifest.poses[index % manifest.cycleLength];
  assert.equal(card.querySelector('img')?.getAttribute('src'), `https://edmund-public-media.edmundeducation.workers.dev/${expected.asset}?v=20261106-live-assets2`, `card ${index + 1}`);
  assert.ok(card.querySelector('figcaption')?.textContent.trim(), `card ${index + 1} needs its teaching note`);
}
assert.equal(cards[32].querySelector('img').getAttribute('src'), `https://edmund-public-media.edmundeducation.workers.dev/${manifest.poses[32].asset}?v=20261106-live-assets2`);
assert.equal(cards[33].querySelector('img').getAttribute('src'), `https://edmund-public-media.edmundeducation.workers.dev/${manifest.poses[0].asset}?v=20261106-live-assets2`);
assert.equal(cards[65].querySelector('img').getAttribute('src'), `https://edmund-public-media.edmundeducation.workers.dev/${manifest.poses[32].asset}?v=20261106-live-assets2`);
assert.equal(cards[66].querySelector('img').getAttribute('src'), `https://edmund-public-media.edmundeducation.workers.dev/${manifest.poses[0].asset}?v=20261106-live-assets2`);
const css = read('grammar-system.css');
assert.match(css, /\.grammar-new-body[^}]*overflow-wrap:\s*normal/);
assert.match(css, /\.grammar-eddy-dialogue__lesson-copy td[^}]*overflow-wrap:\s*normal/);
assert.match(css, /\.grammar-eddy-dialogue__lesson-copy \.grammar-new-table-wrap[^}]*overflow-x:\s*auto/);
dom.window.close();
console.log('PASS: assigned Eddy poses 1–33 cycle across all 68 cards; unassigned art excluded; table words stay intact.');
