import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createAdvancedExpressionLoader} from '../../natural-english/advanced-loader.mjs';
import importedIndex from '../../natural-english/advanced-imported.generated.mjs';
import {moduleMap,allQuestionMap,hydrateModule,completed,daily} from '../../natural-english/catalogue.mjs';
import {buildArtifacts} from './build.mjs';

const fixture=JSON.parse(fs.readFileSync(new URL('./calibration-007.json',import.meta.url),'utf8')).lessons[0];
const records=[11,12,61].map(number=>({...structuredClone(fixture),id:`advanced-native-${String(number).padStart(3,'0')}`,number}));
const artifacts=buildArtifacts(records);assert.equal(artifacts.validation.errors.length,0);
const parsedModule=body=>JSON.parse(body.slice(body.indexOf('export default ')+15).trim().replace(/;$/,''));
const index=parsedModule(artifacts.files['advanced-imported.generated.mjs']);
assert.deepEqual(index.map(r=>r.number),[11,12,13],'Display numbers remain consecutive after source-label deduplication.');
assert.deepEqual(index.map(r=>r.sourceNumber),[11,12,61],'Immutable source ordinals and lesson IDs remain intact.');
assert.equal(Object.keys(artifacts.files).filter(name=>name.startsWith('advanced-content/')).length,2,'Stable fifty-number partitions produce two shards.');
assert.ok(index.every(record=>record.advancedLazy&&!record.steps&&!record.questions.some(q=>q.options||q.answersZh||q.glossary)),'Initial index contains metadata and grading, not exercise payloads.');
assert.ok(index.every(record=>record.questions.length===6));
let requests=[];
const importer=async url=>{requests.push(url);return {default:parsedModule(artifacts.files[new URL(url).pathname.replace('/course/','')])};};
const loader=createAdvancedExpressionLoader({index,importer,baseUrl:'https://example.test/course/advanced-loader.mjs'});
assert.equal(requests.length,0,'Constructing the loader does not request content.');
const [first,second]=await Promise.all([loader.load(index[0].id),loader.load(index[1].id)]);
assert.equal(requests.length,1,'Concurrent lessons in one shard share a single request.');
assert.equal(first.number,11);assert.equal(first.sourceNumber,11);assert.equal(first.steps.length,7);assert.equal(second.questions.length,6);
await loader.load(index[0].id);assert.equal(requests.length,1,'Successful content is reused from the shard cache.');
await loader.load(index[2].id);assert.equal(requests.length,2,'Another partition is fetched only when requested.');
assert.equal(await loader.load('not-a-lesson'),null);

let attempts=0;const retryUrls=[];
const retry=createAdvancedExpressionLoader({index,baseUrl:'https://example.test/course/advanced-loader.mjs',importer:async url=>{
 retryUrls.push(url);if(attempts++===0)throw Error('temporary fetch failure');return importer(url);
}});
await assert.rejects(retry.load(index[0].id),/temporary/);
assert.equal(retry.pendingShardCount(),0,'A failed request does not leave a poisoned pending promise.');
assert.equal((await retry.load(index[0].id)).id,index[0].id);
assert.equal(new URL(retryUrls[1]).searchParams.get('retry'),'1','Retry receives a new module URL after a browser caches a failed import.');
let brokenCalls=0;
const broken=createAdvancedExpressionLoader({index,baseUrl:'https://example.test/course/advanced-loader.mjs',importer:async url=>{
 if(brokenCalls++===0)return {default:[first]};return importer(url);
}});
await assert.rejects(broken.load(index[0].id),/Incomplete/);
assert.equal((await broken.load(index[1].id)).id,index[1].id,'Invalid shard content can be retried.');

// Verify actual shared progress grading is identical before and after hydration.
if(importedIndex.length){
 const entry=importedIndex[0],placeholder=moduleMap.get(entry.id);
 const initialLazy=placeholder.advancedLazy;
 const questionMapBefore=new Map(placeholder.questions.map(q=>[q.id,q]));
 const run='00000000-0000-4000-8000-000000000001';
 const events=placeholder.questions.map((q,index)=>({id:`event-${index}`,kind:'answer',module:entry.id,run,question:q.id,choice:q.type==='open'?'I wrote my own response.':q.answers[0],at:'2026-10-16T00:00:00Z'}));
 const before=completed(events,run,placeholder),daysBefore=[...daily(events)];
 const loaded=await hydrateModule(entry.id);
 assert.equal(loaded,placeholder,'Hydration fills the existing module object in place.');
 assert.equal(loaded.advancedLazy,false);assert.equal(loaded.steps.length,7);assert.equal(loaded.questionMap.size,6);
 assert.deepEqual([...completed(events,run,loaded)],[...before]);assert.deepEqual([...daily(events)],daysBefore,'Daily historical grading does not depend on loading the lesson.');
 for(const question of loaded.questions){
  assert.equal(allQuestionMap.get(question.id),question);
  assert.equal(questionMapBefore.get(question.id).type,question.type);
  if(question.type!=='open')assert.deepEqual(questionMapBefore.get(question.id).answers,question.answers);
 }
 assert.equal(await hydrateModule('scoop'),moduleMap.get('scoop'),'The standard Native course remains synchronous data.');
 assert.equal(await hydrateModule('advanced-native-001'),moduleMap.get('advanced-native-001'),'Legacy Advanced modules do not need a shard.');
 assert.ok(initialLazy===true||initialLazy===false,'Tests can also run after another check has hydrated the module.');
}
console.log('Advanced Native lazy content: initial payload isolation, fifty-number shards, concurrency cache, failed/retried loads and indexed/full progress parity verified.');
