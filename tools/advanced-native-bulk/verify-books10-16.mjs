#!/usr/bin/env node
// Validates source intake and the first unpublished pilot; never grants release.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateCatalogue} from './schema.mjs';
import {buildArtifacts} from './build.mjs';
import {nearDuplicates} from './near-duplicates.mjs';

const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const base=path.join(repo,'course-materials/advanced-native');
const read=relative=>JSON.parse(fs.readFileSync(path.join(base,relative),'utf8'));
const readLines=relative=>fs.readFileSync(path.join(base,relative),'utf8').trim().split('\n').map(line=>JSON.parse(line));
const rows=readLines('books10-16/source-inventory.jsonl');
const intake=read('books10-16/intake-summary.json');
const reconciliation=readLines('books10-16/reconciliation-register.jsonl');
const decisions=readLines('books10-16/editorial-decisions-2112-2141.jsonl');
const release=read('release-index.json');
const pilot=[...read('drafts-books10-16/batch-2112-2119.json').lessons,...read('drafts-books10-16/batch-2113.json').lessons,...read('drafts-books10-16/batch-2120.json').lessons,...read('drafts-books10-16/batch-2123.json').lessons].sort((a,b)=>a.number-b.number);
assert.equal(rows.length,2604);
assert.equal(reconciliation.length,rows.length);
assert.equal(intake.sourceRows,rows.length);
assert.deepEqual(intake.rowsWithoutPdfPage,[]);
assert.deepEqual(intake.unmatchedQuestionHeadings,[]);
assert.equal(new Set(rows.map(r=>r.sourceId)).size,rows.length);
assert.equal(decisions.length,30);
assert.deepEqual(decisions.map(row=>row.sourceOrdinal),Array.from({length:30},(_,i)=>2112+i));
const sourceById=new Map(rows.map(row=>[row.sourceId,row]));
const existingIds=new Set(read('provenance/curated-module-index.json').map(row=>row.moduleId));
for(const decision of decisions){
 const source=sourceById.get(decision.sourceId);
 assert.ok(source,`${decision.sourceId}: source exists`);
 assert.equal(decision.sourceOrdinal,2111+Number(decision.sourceId.slice(-4)));
 assert.equal(decision.phrase,source.expression);
 assert.ok(['proposed-new-lesson','proposed-alias-existing','proposed-alias-new','hold-editorial'].includes(decision.action));
 if(decision.action==='proposed-new-lesson')assert.equal(decision.canonicalId,`advanced-native-${decision.sourceOrdinal}`);
 if(decision.action==='proposed-alias-existing')assert.ok(existingIds.has(decision.canonicalId),`${decision.sourceId}: existing alias target`);
 if(decision.action==='proposed-alias-new')assert.ok(decisions.some(other=>other.sourceOrdinal<decision.sourceOrdinal&&other.canonicalId===decision.canonicalId&&other.action==='proposed-new-lesson'),`${decision.sourceId}: earlier new alias target`);
 if(decision.action==='hold-editorial')assert.equal(decision.canonicalId,null);
 assert.ok(decision.reason.length>=30);
}
assert.ok(rows.every(r=>r.renderedPdfPage>=1&&r.renderedPdfPage<=intake.renderedPdfPages));
for(const [book,count] of Object.entries(intake.reportedBookCounts)){
 assert.equal(intake.extractedBookCounts[book].questions,count.questions);
 assert.equal(intake.extractedBookCounts[book].expressions,count.expressions);
}
assert.equal(pilot.length,8);
assert.deepEqual(pilot.map(r=>r.id),['advanced-native-2112','advanced-native-2113','advanced-native-2115','advanced-native-2117','advanced-native-2118','advanced-native-2119','advanced-native-2120','advanced-native-2123']);
const bySource=new Map(rows.map(row=>[row.sourceId,row]));
for(const lesson of pilot){
 for(const source of lesson.sources){
  const entry=bySource.get(source.occurrenceId);
  assert.ok(entry,`${lesson.id}: source exists`);
  assert.equal(source.expression,entry.expression);
  assert.equal(source.sentence,entry.example);
  assert.equal(source.page,entry.renderedPdfPage);
  assert.equal(source.sha256,intake.sourceSha256);
  assert.equal(source.referenceSentenceKind,'guide_original_example');
  assert.ok(reconciliation.find(row=>row.sourceId===entry.sourceId),`${entry.sourceId}: reconciliation row`);
 }
}
const existing=release.canonicalInputFiles.flatMap(file=>{
 const value=read(file);return Array.isArray(value)?value:value.lessons;
});
assert.equal(existing.length,release.counts.authoredRecords);
const normaliseSentence=text=>String(text).toLowerCase().replace(/[’‘]/g,"'").replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const sourceExamples=new Set(rows.map(row=>normaliseSentence(row.example)));
const pilotTexts=pilot.flatMap(record=>[record.listening.en,record.speaking.en,...record.takeaways.map(row=>row.en),...record.writing.examples.map(row=>row.en)]);
assert.equal(pilotTexts.length,pilot.length*6);
assert.ok(pilotTexts.every(text=>!sourceExamples.has(normaliseSentence(text))),'No full teaching sentence may copy a guide example verbatim.');
const pilotIds=new Set(pilot.map(row=>row.id));
const nearFlags=nearDuplicates([...existing,...pilot]).filter(flag=>pilotIds.has(flag.lessonA)||pilotIds.has(flag.lessonB));
assert.equal(nearFlags.length,0,JSON.stringify(nearFlags.slice(0,5)));
const validation=validateCatalogue([...existing,...pilot]);
assert.equal(validation.errors.length,0,JSON.stringify(validation.errors.slice(0,15)));
const baseBuild=buildArtifacts(existing);
const extended=buildArtifacts([...existing,...pilot]);
assert.equal(baseBuild.validation.errors.length,0);
assert.equal(extended.validation.errors.length,0);
const imported=body=>JSON.parse(body.slice(body.indexOf('export default ')+15).replace(/;\s*$/,''));
const baseIndex=imported(baseBuild.files['advanced-imported.generated.mjs']);
const nextIndex=imported(extended.files['advanced-imported.generated.mjs']);
assert.equal(baseIndex.length,1883);
assert.equal(nextIndex.length,1891);
assert.deepEqual(nextIndex.slice(0,baseIndex.length).map(row=>[row.id,row.number]),
                 baseIndex.map(row=>[row.id,row.number]));
assert.deepEqual(nextIndex.slice(-8).map(row=>row.number),[1894,1895,1896,1897,1898,1899,1900,1901]);
console.log(JSON.stringify({intakeRows:rows.length,books:Object.keys(intake.reportedBookCounts).length,
 sourcePageGaps:0,first30EditorialTriage:Object.fromEntries(['proposed-new-lesson','proposed-alias-existing','proposed-alias-new','hold-editorial'].map(action=>[action,decisions.filter(row=>row.action===action).length])),existingCanonical:release.counts.totalCanonicalModules,
 pilotDrafts:pilot.length,pilotQuestions:pilot.length*6,pilotAudioRequests:pilot.length*4,
 projectedDisplayRange:'1894–1901',wholeCatalogueSchemaErrors:validation.errors.length,exactGuideSentenceCopies:0,pilotNearDuplicateFlags:nearFlags.length,
 published:false,releaseApproved:false},null,2));
