#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import vm from 'node:vm';
import { inventory } from './reading-translations.mjs';
import { calculateAnswerProgress, scanningSections, BOOKMARK_LABELS, bookmarkTarget, readingBookmarkLink } from '../reading-comprehension-features.mjs';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');
const json = async (path) => JSON.parse(await read(path));
const catalogue = (await json('reading-comprehension-catalogue.json')).articles;
const audioContext = { window: {} };
vm.runInNewContext(await read('reading-comprehension-audio-manifest.js'), audioContext);
const audioManifest = audioContext.window.EDMUND_READING_AUDIO;
const translations = new Map((await inventory()).rows.map(row => [row.article_id, row.content]));
const seed = await json('tools/reading-comprehension-answer-seed.json');
const held = new Set([
  ...[8,13,22,25,53,66,71,79,90,91,107,112,118,121,133,164].map(n => `p1-${String(n).padStart(3,'0')}`),
  ...[31,43,67,79,91,103,115,127,136,140,152,164].map(n => `p2-${String(n).padStart(3,'0')}`),
  ...[2,6,19,22,23,74,83,116,119,173,174,175].map(n => `p3-${String(n).padStart(3,'0')}`)
]);
assert.equal(held.size, 40);
assert.equal(catalogue.length, 437);
assert.equal(new Set(catalogue.map(e => e.id)).size, 437);
assert.deepEqual(seed.map(e => e.id).sort(), catalogue.map(e => e.id).sort());
assert.deepEqual([1,2,3].map(p => catalogue.filter(e => e.passage === p).length), [147,137,153]);
let questionCount = 0, reviewCount = 0, imageCount = 0;
const articles = new Map();
const analysisPath = (e) => e.analysisId.startsWith('analysis-')
  ? `reading-comprehension-data/${e.analysisId}.json`
  : ['mungo-man','if-you-can-get-used-to-the-taste'].includes(e.analysisId)
    ? `reading-comprehension-data/analysis-${e.analysisId}.json`
    : `ielts-reading-analysis-data/${e.analysisId}.json`;
for (const entry of catalogue) {
  assert.ok(!held.has(entry.id.slice(0,6)), `Held article ${entry.id}`);
  const data = await json(`reading-comprehension-data/${entry.id}.json`);
  const analysis = await json(analysisPath(entry));
  articles.set(entry.id, { data, analysis });
  const keys = seed.find(e => e.id === entry.id).keys;
  assert.equal(data.id, entry.id);
  assert.equal(data.paragraphs.length, entry.paragraphCount);
  assert.equal(data.questions.length, entry.questionCount);
  assert.equal(Object.keys(keys).length, entry.questionCount);
  assert.equal(new Set(data.questions.map(q => q.number)).size, entry.questionCount);
  assert.ok(data.paragraphs.every(p => p.text.trim() && Number.isInteger(p.number)));
  for (const q of data.questions) {
    questionCount++;
    assert.ok(q.number >= 1 && q.number <= 40);
    assert.ok(q.prompt.trim());
    assert.ok(analysis.questions.some(a => (a.numbers || [a.number]).includes(q.number)), `${entry.id}: analysis Q${q.number}`);
    const key = keys[`q${q.number}`];
    assert.ok(Array.isArray(key.accepted) && key.accepted.length);
    if (key.requiresReview) reviewCount++;
    else assert.ok(key.accepted.every(a => !/[\u3400-\u9fff]/.test(a)), `${entry.id} Q${q.number}: explanatory text is not an answer`);
    if (q.type === 'choice' && !key.requiresReview) {
      assert.ok(key.accepted.some(a => q.options.some(o => String(typeof o === 'string' ? o : o.value).toLowerCase() === a.toLowerCase())), `${entry.id}: missing correct option Q${q.number}`);
    }
    if (q.type === 'multiple') assert.ok(q.slots >= 2 && q.options.length >= q.slots);
    if (data.questionGroups) assert.ok(data.questionGroups.some(g => g.id === q.group && q.number >= g.start && q.number <= g.end));
  }
  for (const path of data.questionPages || []) {
    assert.match(path, /^\/assets\/reading-comprehension\/questions\/p[123]-\d{3}\/page-\d+\.jpg$/);
    assert.ok((await stat(new URL(path.slice(1), root))).size > 1000, path);
    imageCount++;
  }
  if (entry.id !== 'p1-069-albert-einstein') {
    assert.equal(entry.audio, Boolean(audioManifest[entry.id]?.src), 'Only promise published narration');
    assert.equal(entry.translations, data.paragraphs.every(p => Boolean(p.translation)), 'Static catalogue flags describe bundled translations; database translations load separately');
    assert.ok(data.questionPages.length && data.questionGroups.length);
  }
}
assert.equal(reviewCount, 7);
assert.equal(questionCount, 5827);
assert.equal(await read('reading-comprehension-data/p1-069-albert-einstein.json'), execFileSync('git', ['show','HEAD:reading-comprehension-data/p1-069-albert-einstein.json'], { cwd: root, encoding:'utf8' }), 'Original Einstein content is unchanged');

// Exercise the actual catalogue/render/save functions in an isolated VM.
// No browser, real login or student data is used.
const nodes = new Map(), groups = new Map(), formValues = new Map(), calls = [];
function node(selector) {
  if (!nodes.has(selector)) nodes.set(selector, {
    textContent:'',innerHTML:'',hidden:false,disabled:false,value:'',dataset:{},attributes:{},offsetHeight:70,
    classList:{ add(){},remove(){},toggle(){} },style:{setProperty(){}},
    setAttribute(k,v){this.attributes[k]=v;},getAttribute(k){return this.attributes[k];},removeAttribute(k){delete this.attributes[k];},
    querySelector:node,querySelectorAll:s=>groups.get(s)||[],pause(){},load(){},focus(){},scrollIntoView(){},addEventListener(){},
    insertAdjacentHTML(position,html){this.innerHTML=position==='afterbegin'?html+this.innerHTML:this.innerHTML+html;}
  });
  return nodes.get(selector);
}
const location = new URL('https://edmundeducation.com/reading-comprehension.html');
const rpc = async (name,args) => {
  calls.push({name,args});
  if(name==='reading_comprehension_article_translation') return translations.get(args.p_article_id) || null;
  if(name==='reading_comprehension_current_attempt') return { attempt_id:`test-${args.p_article_id}`,answers:{},duration_ms:0,status:'in_progress',question_results:[] };
  if(name==='reading_comprehension_save_attempt') return {attempt_id:args.p_attempt_id||'new-test',article_id:args.p_article_id,status:'in_progress',answers:args.p_answers,question_results:[]};
  return [];
};
const context = vm.createContext({
  console,URL,URLSearchParams,Map,Set,Number,String,Date,JSON,
  calculateAnswerProgress,scanningSections,BOOKMARK_LABELS,bookmarkTarget,readingBookmarkLink,
  window:{EDMUND_SUPABASE:{},scrollTo(){}},location,
  history:{replaceState(_s,_t,href){location.href=new URL(href,location.href).href;}},
  document:{querySelector:node,querySelectorAll:s=>groups.get(s)||[],documentElement:node('html'),getElementById:()=>null},
  matchMedia:()=>({matches:false}),getComputedStyle:()=>({position:'static'}),requestAnimationFrame:fn=>fn(),
  setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,clearInterval(){},
  localStorage:{getItem(){return null;},setItem(){}},sessionStorage:{removeItem(){}},
  FormData:class {getAll(name){return formValues.get(name)||[];}},
  fetch:async (url)=>({ok:true,json:()=>json(String(url).split('?')[0])}),
  testCatalogue:catalogue,testRpc:rpc
});
const source = await read('reading-comprehension.js');
vm.runInContext(source.replace(/^import[^\n]+\n/,'').split('el.loginForm.addEventListener("submit", handleLogin);')[0],context);
vm.runInContext(source.match(/^function updateTranslations\(\).*$/m)[0],context);
const run = code => vm.runInContext(code,context);
run('state.catalogue=testCatalogue; state.token="test-token"; state.user={name:"Test",id:"test"}; rpc=testRpc;');
for (const id of ['p1-001','p2-064','p2-119','p2-169','p3-079','p3-172']) {
  await run(`loadArticleData('${id}')`);
  run('renderPassage(); renderQuestions();');
  assert.equal(run('ARTICLE_ID'),id);
  assert.equal((node('[data-questions]').innerHTML.match(/data-scanning-tip=/g)||[]).length,articles.get(id).data.questions.length);
  assert.match(node('[data-questions]').innerHTML,/original-pages/);
  assert.equal(node('[data-translation-all]').disabled,!translations.has(id));
  assert.doesNotMatch(node('[data-passage]').innerHTML, /undefined/);
}
run('selectPassageTab(3);');
assert.equal((node('[data-exercise-catalogue]').innerHTML.match(/data-open-exercise=/g)||[]).length,18);
assert.match(node('[data-catalogue-status]').textContent,/153/);
run('state.cataloguePage=99; renderCatalogue();');
assert.equal(node('[data-catalogue-page]').textContent,'9 / 9');
assert.equal(node('[data-catalogue-next]').disabled,true);
node('[data-catalogue-search]').value='Mummies';
run('renderCatalogue()');
assert.match(node('[data-exercise-catalogue]').innerHTML,/p3-079/);
assert.equal(node('[data-catalogue-page]').textContent,'1 / 1');
node('[data-catalogue-search]').value='';
await run('openExercise("p2-064")');
assert.equal(run('state.exerciseReady'),true);
assert.equal(run('state.timerRunning'),false);
assert.equal(run('state.attemptId'),'test-p2-064');
assert.equal(node('[data-exercise-title]').textContent,articles.get('p2-064').data.title);
formValues.set('q14',['F']);
await run('saveAttempt(false,false,true)');
assert.equal(calls.at(-1).args.p_article_id,'p2-064');
assert.equal(calls.at(-1).args.p_answers.q14,'F');
formValues.delete('q14');
await run('saveAttempt(false,false,true)');
assert.deepEqual(Object.keys(calls.at(-1).args.p_answers),[],'Clearing the last answer persists an empty snapshot');
formValues.set('q14',['A']);
run('rpc=async()=>{throw new Error("offline test")};');
const warn=console.warn;console.warn=()=>{};
try { await run('openExercise("p3-079")'); } finally {console.warn=warn;}
assert.equal(run('ARTICLE_ID'),'p2-064','Do not switch articles after a failed save');
assert.equal(run('state.answers.q14'),'A');
run('rpc=testRpc;');
await run('openExercise("p3-079")');
assert.equal(run('ARTICLE_ID'),'p3-079');
assert.equal(run('state.attemptId'),'test-p3-079');
assert.equal(Object.keys(run('state.answers')).length,0,'Answers cannot leak into the next article');
assert.equal(run('state.timerRunning'),false);
assert.match(readingBookmarkLink(bookmarkTarget('word:p3-079:g27:w1')),/#question-27/);
console.log(`Reading catalogue: 436 new + Einstein; 40 held absent; ${questionCount} questions, ${imageCount} original pages, ${reviewCount} review-only questions; article switching, search, pagination and isolated draft saves passed.`);
