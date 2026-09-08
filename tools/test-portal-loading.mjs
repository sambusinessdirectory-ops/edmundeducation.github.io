import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import { createLessonLibrary } from '../lesson-library.mjs';

const root = new URL('../', import.meta.url);
const require = createRequire(new URL('./email-qa/package.json', import.meta.url));
const { JSDOM } = require('jsdom');
const read = file => readFile(new URL(file, root), 'utf8');

// A login page has empty, hidden lesson/exercise views. Reassigning hidden on
// every observer update used to starve the event loop before login could run.
const dom = new JSDOM('<section data-view="login"></section><section data-view="dashboard" hidden></section><section data-view="lesson" hidden></section><section data-view="exercise" hidden></section>', { url: 'https://edmundeducation.com/sentence-structure.html' });
const w = dom.window;
let updates = 0;
const context = vm.createContext({ window: w, document: w.document, localStorage: w.localStorage,
  Option: w.Option, MutationObserver: w.MutationObserver,
  queueMicrotask: callback => { assert.ok(++updates < 30, 'Question controls are trapping the browser in an update loop'); queueMicrotask(callback); }
});
vm.runInContext((await read('question-order.mjs')).replaceAll('export function', 'function') + ';installQuestionOrder({system:"sentence",owner:()=>"test",lessonId:()=>"ss1"});', context);
await new Promise(resolve => setTimeout(resolve, 20));
const settled = updates;
await new Promise(resolve => setTimeout(resolve, 20));
assert.equal(updates, settled, 'The idle login page must settle');
const lessonView = w.document.querySelector('[data-view="lesson"]');
lessonView.insertAdjacentHTML('beforeend', '<div><article class="question-card" data-question-id="q1"><span class="question-number">1</span></article><article class="question-card" data-question-id="q2"><span class="question-number">2</span></article></div>');
await new Promise(resolve => setTimeout(resolve, 20));
const select = lessonView.querySelector('.question-order-inline select');
select.value = 'desc'; select.dispatchEvent(new w.Event('change'));
await new Promise(resolve => setTimeout(resolve, 20));
assert.equal(lessonView.querySelector('.question-card').dataset.questionId, 'q2');
w.close();

const directory = new URL('assets/sentence-structure/library/', root);
const requests = [];
let failLesson = false;
const library = createLessonLibrary(new URL('manifest.json', directory), { fetcher: async url => {
  const name = new URL(url).pathname.split('/').pop(); requests.push(name);
  if (failLesson && name.startsWith('ss2.')) return { ok: false, status: 503 };
  return { ok: true, json: async () => JSON.parse(await readFile(url, 'utf8')) };
}});
assert.equal(requests.length, 0, 'Constructing the login app must not download course content');
await Promise.all([library.catalog(), library.catalog()]);
assert.equal(requests.length, 1, 'Share a single in-flight directory request');
assert.equal(library.content.lessons.length, 345);
assert.ok(library.content.lessons.every(l => l.questions.length === 50 && !l.questions[0].answer));
const first = library.content.lessons[0];
await Promise.all([library.lesson(first.id), library.lesson(first.id)]);
assert.equal(requests.length, 2, 'Opening one lesson downloads only that lesson, once');
assert.equal(first.questions.length, 50);
assert.ok(first.questions[0].answer);
assert.ok(library.loaded(first.id));
await library.lesson(first.id);
assert.equal(requests.length, 2, 'Reopening a lesson reuses it');
failLesson = true;
await assert.rejects(library.lesson('ss2'));
assert.equal(library.loaded('ss2'), false);
assert.equal(library.content.lessons.length, 345, 'An unavailable lesson must not lose the directory or other lessons');
failLesson = false;
await library.lesson('ss2');
assert.equal(library.loaded('ss2'), true, 'Failed requests must be retryable');
assert.equal(requests.some(name => name.startsWith('search.')), false, 'Search is also on demand');
const search = await library.search();
assert.ok(search.some(entry => entry.questionId === first.questions[0].id && entry.texts.includes(first.questions[0].answer)));
assert.ok(search.some(entry => entry.lessonId === 'ss345' && entry.page === 3));

// Verify every split lesson against the canonical source: IDs, translations,
// marking answers, illustrations and all existing lesson fields are unchanged.
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(await read('sentence-structure-lessons-5-345.js'), sandbox);
vm.runInContext(await read('sentence-structure-data.js'), sandbox);
const manifest = JSON.parse(await readFile(new URL('manifest.json', directory), 'utf8'));
for (const [i, meta] of manifest.lessons.entries()) {
  const lesson = JSON.parse(await readFile(new URL(meta.detail, directory), 'utf8'));
  assert.equal(JSON.stringify(lesson), JSON.stringify(sandbox.window.EDMUND_SENTENCE_STRUCTURE_DATA.lessons[i]));
}

const html = await read('sentence-structure.html');
assert.doesNotMatch(html, /<script[^>]+src="sentence-structure-(?:lessons|data)/);
assert.doesNotMatch(await read('sentence-structure.css'), /url\([^)]*\.ttf/);
const music = await read('background-music-player.mjs');
assert.match(music, /audio\.preload="none"/);
assert.doesNotMatch(await read('service-worker.js'), /\.mp3|background-music-catalog/);
console.log('Portal loading: idle UI settles; per-lesson downloads, retries, search and all 17,250 questions verified; music is not precached.');
