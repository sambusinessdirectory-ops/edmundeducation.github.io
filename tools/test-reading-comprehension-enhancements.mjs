#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { calculateAnswerProgress, scanningSections, BOOKMARK_LABELS, bookmarkTarget, readingBookmarkLink } from '../reading-comprehension-features.mjs';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [source, html, css, dataText, analysisText, flashcardsHtml, embedCss, professionalCss, professionalHtml] = await Promise.all([
  read('reading-comprehension.js'), read('reading-comprehension.html'), read('reading-comprehension.css'),
  read('reading-comprehension-data/p1-069-albert-einstein.json'), read('ielts-reading-analysis-data/p1-069-albert-einstein.json'),
  read('flashcards.html'), read('flashcards-reading-embed.css'),
  read('professional-english/professional-enhancements.css'), read('professional-english/index.html')
]);
const data = JSON.parse(dataText), analysis = JSON.parse(analysisText);
const catalogue = JSON.parse(await read('reading-comprehension-catalogue.json')).articles;
const id = data.id || 'p1-069-albert-einstein';
const blankParts = data.questions.flatMap((q) => q.type === 'choice'
  ? q.options.map((option) => ({ part: `q${q.number}`, type: 'radio', checked: false, value: typeof option === 'string' ? option : option.value }))
  : [{ part: `q${q.number}`, type: 'text', value: '' }]);
assert.deepEqual(calculateAnswerProgress(blankParts), { answered: 0, total: 13, percent: 0 });
for (let n = 1; n <= 5; n++) blankParts.find((part) => part.part === `q${n}`).checked = true;
assert.deepEqual(calculateAnswerProgress(blankParts), { answered: 5, total: 13, percent: 38.5 });
blankParts.find((part) => part.part === 'q9').value = '   \n\t';
assert.equal(calculateAnswerProgress(blankParts).answered, 5, 'whitespace is not an answer');
blankParts.find((part) => part.part === 'q9').value = 'points north';
assert.equal(calculateAnswerProgress(blankParts).answered, 6);
blankParts.find((part) => part.part === 'q9').value = '';
assert.equal(calculateAnswerProgress(blankParts).answered, 5, 'erasing an answer reduces progress');
assert.deepEqual(calculateAnswerProgress([
  { name: 'q1', part: 'q1-a', value: 'first' }, { name: 'q1', part: 'q1-b', value: '' },
  { name: 'q2', value: 'A', type: 'radio', checked: true }, { name: 'q2', value: 'B', type: 'radio', checked: false }
]), { answered: 2, total: 3, percent: 66.7 }, 'each blank counts independently, each radio group counts once');
assert.deepEqual(calculateAnswerProgress([
  { name: 'q1', slots: 2, type: 'checkbox', checked: true, value: 'A' },
  { name: 'q1', slots: 2, type: 'checkbox', checked: false, value: 'B' },
  { name: 'q1', slots: 2, type: 'checkbox', checked: false, value: 'C' }
]), { answered: 1, total: 2, percent: 50 });
assert.equal(calculateAnswerProgress([{ name: 'q1', value: 0, disabled: true }]).percent, 100, 'submitted/disabled answers remain counted');
assert.equal(calculateAnswerProgress([]).percent, 0);
assert.equal(calculateAnswerProgress([{ value: 'not an answer field' }]).total, 0);
assert.equal(scanningSections({ sections: [{ title: 'Scanning Tips' }, { id: 'read', title: 'Read' }] }).length, 1);
assert.deepEqual(scanningSections(null), []);
for (const q of analysis.questions) {
  const sections = scanningSections(q);
  assert.equal(sections.length, 1, `Q${q.number} has exactly one scanning section`);
  assert.equal(sections[0].id, 'scan');
}

for (const [suffix, kind] of [['passage', 'passage'], ['questions', 'questions'], ['paragraph:3', 'paragraph'], ['question:4', 'question'], ['skimming:2', 'skimming'], ['scanning:8', 'scanning'], ['q13', 'analysis'], ['analysis:4:read', 'section']]) {
  const target = bookmarkTarget(`${id}:${suffix}`);
  assert.equal(target.kind, kind);
  const link = new URL(readingBookmarkLink(target), 'https://edmundeducation.com/');
  assert.equal(link.pathname, '/reading-comprehension.html');
  assert.equal(link.searchParams.get('article'), id);
  if (kind === 'scanning') assert.equal(link.searchParams.get('view'), 'scanning');
  if (kind === 'section') { assert.equal(link.searchParams.get('section'), 'read'); assert.equal(link.hash, '#question-4'); }
}
assert.equal(new URL(readingBookmarkLink(bookmarkTarget(`word:${id}:p3:w2`)), 'https://edmundeducation.com').hash, '#paragraph-3');
assert.equal(new URL(readingBookmarkLink(bookmarkTarget(`word:${id}:q8:w2`)), 'https://edmundeducation.com').hash, '#question-8');
assert.equal(bookmarkTarget('javascript:alert(1)'), null);
assert.equal(new URL(readingBookmarkLink({ article: 'p3-001-example', kind: 'paragraph', number: 2 }), 'https://edmundeducation.com').searchParams.get('passage'), '3');

// In-memory unit harness: exercise the real portal functions without a browser,
// student credentials, network writes, or changes to anyone's saved records.
const nodes = new Map(), groups = new Map();
function node(selector) {
  if (!nodes.has(selector)) nodes.set(selector, {
    textContent: '', innerHTML: '', hidden: false, disabled: false, value: '', dataset: {}, attributes: {}, offsetHeight: 70,
    classList: { add() {}, remove() {}, toggle() {} }, style: { setProperty() {} },
    setAttribute(key, value) { this.attributes[key] = value; }, getAttribute(key) { return this.attributes[key]; },
    querySelector: node, querySelectorAll: (key) => groups.get(key) || [], pause() {}, focus() {}, scrollIntoView() {}
  });
  return nodes.get(selector);
}
const location = new URL(`https://edmundeducation.com/reading-comprehension.html?passage=1`);
const storage = new Map();
const calls = [];
const context = vm.createContext({
  console, URL, URLSearchParams, Map, Set, Number, String, Date, JSON,
  calculateAnswerProgress, scanningSections, BOOKMARK_LABELS, bookmarkTarget, readingBookmarkLink,
  window: { EDMUND_SUPABASE: {}, scrollTo() {} }, location,
  history: { replaceState(_state, _title, href) { location.href = new URL(href, location.href).href; } },
  document: { querySelector: node, querySelectorAll: (selector) => groups.get(selector) || [], documentElement: node('html'), getElementById: () => null },
  matchMedia: () => ({ matches: false }), getComputedStyle: () => ({ position: 'static' }),
  requestAnimationFrame: (fn) => fn(), setTimeout: () => 1, clearTimeout() {}, setInterval: () => 1, clearInterval() {},
  localStorage: { setItem: (k, v) => storage.set(k, v), getItem: (k) => storage.get(k) },
  sessionStorage: { removeItem() {} }, testData: data, testAnalysis: analysis, testCatalogue: catalogue,
  testRpc: async (name, args) => { calls.push({ name, args }); return []; }
});
const definitions = source.replace(/^import[^\n]+\n/gm, '').split('el.loginForm.addEventListener("submit", handleLogin);')[0];
vm.runInContext(definitions, context);
const run = (code) => vm.runInContext(code, context);
run('state.data = testData; state.analysis = testAnalysis; state.catalogue = testCatalogue; state.token = "test-only-token"; state.user = {name:"Test",id:"test"}; rpc = testRpc;');
node('[data-bookmark-filter]').value = 'all';
run('renderPassage(); renderQuestions();');
assert.equal((node('[data-passage]').innerHTML.match(/data-bookmark-kind="paragraph"/g) || []).length, 5);
assert.equal((node('[data-questions]').innerHTML.match(/data-bookmark-kind="question"/g) || []).length, 13);
assert.equal((node('[data-questions]').innerHTML.match(/data-scanning-tip=/g) || []).length, 13);
for (const q of analysis.questions) {
  run(`openAnalysis(${q.number}, 'scanning')`);
  assert.equal(node('[data-analysis-answer]').hidden, true);
  assert.equal(node('[data-analysis-answer]').textContent, '');
  assert.match(node('[data-analysis-content]').innerHTML, /<h3>Scan<\/h3>/);
  assert.doesNotMatch(node('[data-analysis-content]').innerHTML, /<h3>(Read|Skim|中伏位)<\/h3>/);
  assert.equal(Object.keys(run('state.answers')).length, 0, 'viewing hints does not fill answers');
}
run('openAnalysis(1)');
assert.equal(node('[data-analysis-answer]').hidden, false);
assert.match(node('[data-analysis-answer]').textContent, /TRUE/);
run('openAnalysis(1, "analysis", "read")');
assert.equal(node('[data-analysis-answer]').hidden, true);
assert.match(node('[data-analysis-content]').innerHTML, /<h3>Read<\/h3>/);
assert.doesNotMatch(node('[data-analysis-content]').innerHTML, /<h3>Scan<\/h3>/);
assert.equal(run('readingBookmarkItem("section", 1, "scan").key'), `${id}:scanning:1`);
assert.equal(run('readingBookmarkItem("analysis", 1).key'), `${id}:q1`, 'old analysis keys stay compatible');
assert.equal(run('readingBookmarkItem("question", 1).key'), `${id}:question:1`, 'saving a question does not overwrite its analysis');
await run('toggleReadingBookmark(readingBookmarkItem("paragraph", 3))');
assert.equal(calls.at(-1).args.p_bookmarked, true);
assert.equal(calls.at(-1).args.p_system_key, 'reading-comprehension');
assert.match(node('[data-reading-bookmark-list]').innerHTML, /data-open-reading-bookmark=/);
assert.equal(run('state.bookmarks.has(readingBookmarkItem("paragraph", 3).key)'), true);
await run('toggleReadingBookmark(readingBookmarkItem("paragraph", 3))');
assert.equal(calls.at(-1).args.p_bookmarked, false);
assert.equal(run('state.bookmarkItems.size'), 0);
run('rpc = async () => { throw new Error("offline test"); };');
const oldWarn = console.warn; console.warn = () => {};
try { await run('toggleReadingBookmark(readingBookmarkItem("question", 2))'); }
finally { console.warn = oldWarn; }
assert.equal(run('state.bookmarkItems.size'), 0, 'failed writes must not show a saved bookmark');
run('rpc = testRpc; setBookmarkLibraryOpen(true);');
groups.set('[data-passage-tab]', [1, 2, 3].map((n) => Object.assign(node(`tab${n}`), { dataset: { passageTab: String(n) } })));
groups.set('[data-passage-page]', [1, 2, 3].map((n) => Object.assign(node(`page${n}`), { dataset: { passagePage: String(n) } })));
run('selectPassageTab(3);');
assert.equal(node('[data-bookmark-library]').hidden, false, 'Passage switches never close bookmark mode');
assert.match(node('[data-exercise-catalogue]').innerHTML, /PASSAGE 3/);
assert.doesNotMatch(node('[data-exercise-catalogue]').innerHTML, /PASSAGE 1/);
assert.equal((node('[data-exercise-catalogue]').innerHTML.match(/data-open-exercise=/g) || []).length, 18);
assert.ok(html.indexOf('class="bookmark-library panel"') < html.indexOf('data-passage-page="1"'), 'bookmarks are the first exercise option');
run('setAnswerProgressVisible(false, true)');
assert.equal(storage.get('edmund-reading-progress-hidden'), 'true');
assert.equal(node('[data-answer-progress-content]').hidden, true);
run('setAnswerProgressVisible(true, true)');
assert.equal(node('[data-answer-progress-content]').hidden, false);
assert.match(source, /let progressVisible = true/);
assert.match(html, /data-interactive-flashcards-panel/, 'interactive flashcards render inside the reading page');
assert.match(html, /data-interactive-flashcards-resize/, 'interactive flashcards expose a visible resize grip');
assert.equal((html.match(/data-resize-corner="(?:nw|ne|sw|se)"/g) || []).length, 4, 'all four floating-panel corners can resize');
assert.match(html, /frame-src 'self'/, 'the embedded same-origin flashcard frame is allowed');
assert.match(source, /panel\.hidden = false/);
assert.match(source, /frame\.src = url\.href/);
assert.match(source, /closeInteractiveFlashcards\(\{ clearFrame: true \}\)/, 'leaving the exercise closes and clears the embedded session');
assert.match(source, /function snapInteractiveFlashcards/, 'floating flashcards snap naturally to nearby corners');
assert.match(source, /resize\.setPointerCapture/, 'students can freely resize the floating flashcards');
assert.match(source, /resizeHandles\.forEach/, 'each corner receives resize behavior');
assert.match(source, /function restoreInteractiveFlashcards/, 'collapsed flashcards have an explicit restore path');
assert.match(source, /restoreInteractiveFlashcards\(panel\)/, 'reopening restores a collapsed flashcard panel');
assert.doesNotMatch(source, /window\.open\(url\.href/, 'interactive flashcards must not open a separate browser tab');
assert.match(css, /\.interactive-flashcards-panel\s*\{[\s\S]*?position:\s*fixed/);
assert.match(flashcardsHtml, /data-embedded-range-columns/, 'embedded range selection groups all choices together');
assert.match(embedCss, /grid-template-columns:minmax\(0,.78fr\) minmax\(0,1fr\) minmax\(0,1fr\)/, 'embedded range view uses three columns at every panel width');
assert.match(embedCss, /\[data-card-hint\][\s\S]*?display:none!important/, 'embedded card instructions are removed');
assert.match(embedCss, /\.mouse-click-icon[\s\S]*?\.card-note-panel\{display:none!important\}/, 'mouse graphics and private notes stay out of the companion panel');
assert.match(embedCss, /\.pwa-install-button[\s\S]*?\.pwa-notice[\s\S]*?display:none!important/, 'duplicate installation prompts stay out of the companion panel');
assert.match(embedCss, /\.study-layout\{display:grid;grid-template-columns:minmax\(0,1fr\) minmax\(78px,92px\)/, 'card and grading controls use separate non-overlapping columns');
assert.match(professionalCss, /html\.theme-day \.pro-practice-heading h3\{color:#174b36!important/, 'day mode uses a dark readable practice heading');
assert.match(professionalCss, /html\.theme-day \.pro-lesson-card button b\{color:#426400!important/, 'day mode replaces pale yellow dialogue labels');
assert.match(professionalHtml, /professional-enhancements\.css\?v=20260910-feedback3/, 'day contrast and chart CSS is cache-busted');
run('state.exerciseReady = true; state.answers = {q1:"TRUE"}; state.results = {};');
await run(`openReadingBookmark('${id}:scanning:8')`);
assert.equal(location.searchParams.get('view'), 'scanning');
assert.equal(location.hash, '#question-8');
assert.equal(run('state.answers.q1'), 'TRUE', 'bookmark navigation preserves current answers');
assert.equal(run('state.timerRunning'), false, 'bookmark navigation never starts the timer');
assert.equal(run('state.activeAnalysis'), 8);
assert.match(css, /\.answer-progress-dock\s*\{\s*position: sticky/);
assert.match(source, /!radio\.disabled/);
console.log('Reading enhancements: completion fractions, scanning-only access, granular account-synced bookmarks, pinned cross-Passage mode and safe deep links passed.');
