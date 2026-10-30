import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const task1 = JSON.parse(read('ielts-writing-preview/task1-diagrams.json'));
const task2 = JSON.parse(read('ielts-writing-preview/task2-questions.json'));
const homepage = read('index.html');
const app = read('ielts-writing-preview/app.js');
const imageUrlSource = app.match(/^  const imageUrl = (.+);$/m)?.[1];
assert.ok(imageUrlSource, 'Task 1 image URL resolver exists');
const imageUrl = new Function(`return ${imageUrlSource}`)();
assert.equal(imageUrl('assets/writing-practice/questions/example.webp'), '/assets/writing-practice/questions/example.webp');
assert.equal(imageUrl('https://edmund-site-assets.edmundeducation.workers.dev/site-assets/v1/assets/example.webp'), 'https://edmund-site-assets.edmundeducation.workers.dev/site-assets/v1/assets/example.webp', 'published R2 assets must remain absolute URLs');

assert.equal(task1.length, 60, 'All existing Task 1 diagrams should be available');
assert.equal(task2.length, 242, 'All 242 essay prompts extracted from the 39-page source should be available');
assert.equal(new Set(task1.map((item) => item.id)).size, 60);
assert.equal(new Set(task2.map((item) => item.id)).size, 242);
assert.equal(new Set(task2.map((item) => item.topic)).size, 20);
assert.equal(new Set(task2.map((item) => item.sourcePage)).size, 39);
for (const item of task1) {
  assert.ok(item.prompt && item.image && item.type, `${item.id} has a complete diagram record`);
  assert.ok(existsSync(new URL(`../${item.image}`, import.meta.url)), `${item.id} image exists`);
}
for (const item of task2) {
  assert.ok(item.en && item.zh && item.topic, `${item.id} has English, Traditional Chinese and a topic`);
  assert.match(item.zh, /[一-龥]/, `${item.id} has a Chinese translation`);
  assert.doesNotMatch(item.zh, /不是.{0,20}而是/, `${item.id} avoids the banned formula`);
  assert.doesNotMatch(item.en, /disadvantagess|payed|pervious|to what extend|opinion\.\./i, `${item.id} fixes source typos`);
}
const links = [...homepage.matchAll(/<a[^>]*class="category [^>]*href="([^"]+)"/g)].map((match) => match[1]);
assert.equal(links[76], 'ielts-writing-question-preview.html', 'Card 77 opens the new preview');
assert.equal(links.length, 78, 'All existing cards remain present');
assert.match(app, /translationsShown = false/, 'Translations start hidden');
assert.match(app, /localStorage\.setItem\(STORAGE_KEY/, 'Dropdown choices persist on this device');
for (const type of ['Opinions', 'Discuss both views + Opinions', 'Advantages & Disadvantages', 'Cause & Solution', 'Direct question']) {
  assert.ok(app.includes(type), `${type} is available in the dropdown`);
}
console.log('IELTS preview: 60 diagrams, 242 bilingual essays, card 77, all five choices verified.');
