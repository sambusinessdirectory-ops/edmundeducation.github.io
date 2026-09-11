import assert from 'node:assert/strict';
import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import vm from 'node:vm';
import {HOMEWORK_RESOURCE_CATALOG} from '../homework-resource-catalog.mjs';
import {DSE_WRITING_PART_B_CATALOG} from '../workers/model-essay-downloads/src/dse-writing-part-b-catalog.js';
const root=path.resolve(import.meta.dirname,'..');
const read=f=>readFileSync(path.join(root,f),'utf8');
const window={};const sandbox={window};
const files=readdirSync(root).filter(f=>/^flashcards-dse-writing-part-b-\d{4}-data\.js$/.test(f));
for(const f of ['dse-writing-part-b-topics.js','writing-practice-dse-part-b-library-data.js','dse-writing-part-b-downloads.js',...files])vm.runInNewContext(read(f),sandbox);
const es=window.EDMUND_DSE_WRITING_PART_B_LIBRARY_EXERCISES;
const decks=window.EDMUND_FLASHCARD_SEED;
assert.equal(Object.keys(decks).length,87);
assert.equal(Object.values(decks).flat().length,12420);
for(const [id,cards] of Object.entries(decks)){
 assert.match(id,/^dse\/writing\/part-b\/20\d{2}\/Q[2-9]$/);
 for(const card of cards){assert.ok(card.front&&card.meaning);assert.equal(card.examples.length,5);for(const x of card.examples)assert.ok(x.en&&/[\u3400-\u9fff]/u.test(x.zh));}
 const resource=HOMEWORK_RESOURCE_CATALOG.find(r=>r.id===`flash:${id}`);assert.ok(resource);assert.match(resource.label,/Q\d+ — .{8}/u);
}
assert.equal(Object.keys(es).length,86);
assert.equal(es['dse-writing-2016-part-b-q6'].practiceDifficultySets.find(d=>d.key==='hard').answers.length,75);
assert.equal(es['dse-writing-2012-part-b-q2'].practiceDifficultySets.find(d=>d.key==='hard').answers[24],'can turn a small living room into a');
assert.equal(Object.values(es).filter(e=>e.practiceDifficultySets).length,82);
const sources=new Set(Object.values(es).flatMap(e=>e.sourceFiles).filter(f=>f.startsWith('Fill in')));assert.equal(sources.size,83);
for(const e of Object.values(es)){
 assert.ok(e.questionPrompt[0].length>70);assert.match(e.title,/^20\d{2} Q\d+ — /u);
 assert.ok(HOMEWORK_RESOURCE_CATALOG.find(r=>r.id===`fill:${e.id}`));
 for(const d of e.practiceDifficultySets||[]){
  assert.equal(d.sourceParagraphs.length,e.paragraphs.length);
  const blanks=d.sourceParagraphs.flatMap(p=>p.sentences.flatMap(s=>s.parts.filter(p=>typeof p==='object')));
  assert.deepEqual([...blanks.map(b=>b.answer)],[...d.answers]);
  for(const b of blanks){assert.doesNotMatch(b.answer,/[_\uFFFD]/);assert.ok(b.speechUnits.length);for(const u of b.speechUnits)assert.ok(e.paragraphs[u.paragraphIndex].sentences[u.sentenceIndex]);}
 }
}
assert.match(es['dse-writing-2012-part-b-q5'].paragraphs[0].sentences[0].parts[0],/Speak Up/);
assert.match(es['dse-writing-2012-part-b-q7'].paragraphs[0].sentences[0].parts[0],/Key/);
assert.notEqual(es['dse-writing-2023-part-b-q8'].paragraphs[0].sentences[0].parts[0],es['dse-writing-2023-part-b-q8-bilingual'].paragraphs[0].sentences[0].parts[0]);
assert.equal(DSE_WRITING_PART_B_CATALOG.length,82);assert.equal(new Set(DSE_WRITING_PART_B_CATALOG.map(x=>`${x.year}-${x.question}`)).size,80);
assert.equal(window.EDMUND_DSE_WRITING_PART_B_DOWNLOADS.length,82);
for(const x of DSE_WRITING_PART_B_CATALOG)assert.ok(readFileSync(path.join(root,`assets/model-essays/dse-writing-part-b/${x.id}.webp`)).length>1000);
// Reuse the existing full application harness so imported data exercises the real
// selection, preparation, rendering and listening code, without external requests.
let harnessSource=read('tools/test-writing-translation-toggle.mjs').split('const source = inlineApplicationSource(html);')[0];
harnessSource=harnessSource.replace(/const repository = .*?;/,`const repository = ${JSON.stringify(root)};`);
const helpers=await import(`data:text/javascript;base64,${Buffer.from(harnessSource+'\nexport {createHarness,inlineApplicationSource,writingDataFiles,html};').toString('base64')}`);
const harness=helpers.createHarness(helpers.inlineApplicationSource(helpers.html),helpers.writingDataFiles);const h=harness.hooks;
h.installExercise(es['dse-writing-2012-part-b-q2']);h.setCurrentStudent({id:'test-dse-part-b',name:'DSE fixture',dse:true});
const plain=s=>s.parts.map(p=>typeof p==='string'?p:p.answer).join('');
const manifest={};
for(const e of Object.values(es)){
 const words=e.paragraphs.flatMap(p=>p.sentences.flatMap(s=>plain(s).match(/[\p{L}\p{N}]+(?:[’'][\p{L}\p{N}]+)*(?:-[\p{L}\p{N}]+)*/gu)||[]));
 manifest[e.id]={path:'test-only.mp3',duration:words.length*.3,words:words.map((w,i)=>[w,i*.3,(i+1)*.3-.02])};
}
h.setAudioManifest(manifest);
let rounds=0;
for(const e of Object.values(es)){
 h.useExercise(e.id);
 for(const key of e.practiceDifficultySets?.map(d=>d.key)||['']){
  h.startMode('both',key);const rendered=h.renderRound();assert.ok(rendered.includes('data-answer-id'),e.id+' '+key);
  const targets=h.state().targetBlankIds;const segs=h.useDifficulty(key);assert.ok(segs.length,e.id+' '+key+' listening');
  const ids=new Set(segs.flatMap(s=>s.blankIds));assert.equal(ids.size,key?e.practiceDifficultySets.find(d=>d.key===key).answers.length:e.paragraphs.flatMap(p=>p.sentences.flatMap(s=>s.parts.filter(x=>typeof x==='object'))).length,e.id+' '+key+' all blanks have listening');rounds++;
 }
}
if(process.env.DSE_PREVIEW_OUTPUT){
 h.useExercise('dse-writing-2012-part-b-q2');h.startMode('both','standard');
 const style=helpers.html.match(/<style>([\s\S]*?)<\/style>/)[1];
 writeFileSync(process.env.DSE_PREVIEW_OUTPUT,`<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${style}</style><body><main style="max-width:1100px;margin:30px auto"><h1>2012 Q2 — Virtual Sports versus Real Sports</h1>${h.renderRound()}</main></body></html>`);
}
console.log(`DSE Writing Part B passed: 87 decks, 12,420 cards, 83 worksheet sources, 86 models/passages, ${rounds} rendered difficulty rounds, 82 PDFs.`);
