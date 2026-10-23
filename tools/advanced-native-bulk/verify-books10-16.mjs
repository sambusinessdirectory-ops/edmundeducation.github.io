#!/usr/bin/env node
// Validates source intake and the first unpublished pilot; never grants release.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateCatalogue} from './schema.mjs';
import {buildArtifacts} from './build.mjs';

const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const base=path.join(repo,'course-materials/advanced-native');
const read=relative=>JSON.parse(fs.readFileSync(path.join(base,relative),'utf8'));
const readLines=relative=>fs.readFileSync(path.join(base,relative),'utf8').trim().split('\n').map(line=>JSON.parse(line));
const rows=readLines('books10-16/source-inventory.jsonl');
const intake=read('books10-16/intake-summary.json');
const reconciliation=readLines('books10-16/reconciliation-register.jsonl');
const release=read('release-index.json');
const pilot=read('drafts-books10-16/batch-2112-2119.json').lessons;
assert.equal(rows.length,2604);
assert.equal(reconciliation.length,rows.length);
assert.equal(intake.sourceRows,rows.length);
assert.deepEqual(intake.rowsWithoutPdfPage,[]);
assert.deepEqual(intake.unmatchedQuestionHeadings,[]);
assert.equal(new Set(rows.map(r=>r.sourceId)).size,rows.length);
assert.ok(rows.every(r=>r.renderedPdfPage>=1&&r.renderedPdfPage<=intake.renderedPdfPages));
for(const [book,count] of Object.entries(intake.reportedBookCounts)){
 assert.equal(intake.extractedBookCounts[book].questions,count.questions);
 assert.equal(intake.extractedBookCounts[book].expressions,count.expressions);
}
assert.equal(pilot.length,5);
assert.deepEqual(pilot.map(r=>r.id),['advanced-native-2112','advanced-native-2115','advanced-native-2117','advanced-native-2118','advanced-native-2119']);
const bySource=new Map(rows.map(row=>[row.sourceId,row]));
for(const lesson of pilot){
 const source=lesson.sources[0],entry=bySource.get(source.occurrenceId);
 assert.ok(entry,`${lesson.id}: source exists`);
 assert.equal(source.expression,entry.expression);
 assert.equal(source.sentence,entry.example);
 assert.equal(source.page,entry.renderedPdfPage);
 assert.equal(source.sha256,intake.sourceSha256);
 assert.equal(source.referenceSentenceKind,'guide_original_example');
 assert.equal(reconciliation.find(row=>row.sourceId===entry.sourceId).state,'drafted-pending-review-audio-qa');
}
const existing=release.canonicalInputFiles.flatMap(file=>{
 const value=read(file);return Array.isArray(value)?value:value.lessons;
});
assert.equal(existing.length,release.counts.authoredRecords);
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
assert.equal(nextIndex.length,1888);
assert.deepEqual(nextIndex.slice(0,baseIndex.length).map(row=>[row.id,row.number]),
                 baseIndex.map(row=>[row.id,row.number]));
assert.deepEqual(nextIndex.slice(-5).map(row=>row.number),[1894,1895,1896,1897,1898]);
console.log(JSON.stringify({intakeRows:rows.length,books:Object.keys(intake.reportedBookCounts).length,
 sourcePageGaps:0,existingCanonical:release.counts.totalCanonicalModules,
 pilotDrafts:pilot.length,pilotQuestions:pilot.length*6,pilotAudioRequests:pilot.length*4,
 projectedDisplayRange:'1894–1898',wholeCatalogueSchemaErrors:validation.errors.length,
 published:false,releaseApproved:false},null,2));
