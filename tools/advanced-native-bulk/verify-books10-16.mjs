#!/usr/bin/env node
// Validates source intake and the first unpublished pilot; never grants release.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateCatalogue} from './schema.mjs';
import {buildArtifacts} from './build.mjs';
import {nearDuplicates} from './near-duplicates.mjs';
import {runAudit as auditExistingAliasPatterns} from './audit-existing-alias-patterns.mjs';

const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const base=path.join(repo,'course-materials/advanced-native');
const read=relative=>JSON.parse(fs.readFileSync(path.join(base,relative),'utf8'));
const readLines=relative=>fs.readFileSync(path.join(base,relative),'utf8').trim().split('\n').map(line=>JSON.parse(line));
const rows=readLines('books10-16/source-inventory.jsonl');
const intake=read('books10-16/intake-summary.json');
const reconciliation=readLines('books10-16/reconciliation-register.jsonl');
const decisionManifest=read('books10-16/editorial-decision-manifest.json');
const decisionFiles=decisionManifest.decisionFiles;
assert.equal(new Set(decisionFiles).size,decisionFiles.length);
assert.ok(decisionFiles.every(name=>/^editorial-decisions-\d+-\d+\.jsonl$/.test(name)));
const decisions=decisionFiles.flatMap(name=>readLines(`books10-16/${name}`));
const exactAliasSuggestions=readLines('books10-16/exact-prior-alias-suggestions.jsonl');
const aliasCoverage=auditExistingAliasPatterns([]);
assert.equal(aliasCoverage.exceptionCount,0,JSON.stringify(aliasCoverage.exceptions.slice(0,5)));
const release=read('release-index.json');
const draftManifest=read('drafts-books10-16/batch-manifest.json');
const draftFiles=draftManifest.batchFiles;
assert.equal(new Set(draftFiles).size,draftFiles.length);
assert.ok(draftFiles.every(name=>/^batch-.*\.json$/.test(name)));
const pilot=draftFiles.flatMap(name=>read(`drafts-books10-16/${name}`).lessons).sort((a,b)=>a.number-b.number);
assert.equal(rows.length,2604);
assert.equal(reconciliation.length,rows.length);
assert.equal(intake.sourceRows,rows.length);
assert.deepEqual(intake.rowsWithoutPdfPage,[]);
assert.deepEqual(intake.unmatchedQuestionHeadings,[]);
assert.equal(new Set(rows.map(r=>r.sourceId)).size,rows.length);
assert.equal(decisions.length,decisionManifest.expectedSourceOrdinals);
assert.deepEqual(decisions.map(row=>row.sourceOrdinal),Array.from({length:decisions.length},(_,i)=>2112+i));
const sourceById=new Map(rows.map(row=>[row.sourceId,row]));
const existingIds=new Set(read('provenance/curated-module-index.json').map(row=>row.moduleId));
const oldLabels=new Map(read('provenance/source-labels.json').map(row=>[row.inventoryId,row]));
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
assert.equal(exactAliasSuggestions.length,816);
assert.equal(new Set(exactAliasSuggestions.map(row=>row.sourceId)).size,exactAliasSuggestions.length);
const normaliseMeaning=text=>String(text).toLowerCase().replace(/\s+/g,' ').trim();
for(const suggestion of exactAliasSuggestions){
 const source=sourceById.get(suggestion.sourceId);
 assert.ok(source,`${suggestion.sourceId}: source exists`);
 assert.equal(suggestion.sourceOrdinal,2111+Number(suggestion.sourceId.slice(-4)));
 assert.equal(suggestion.phrase,source.expression);
 assert.equal(suggestion.matchBasis,'exact_normalised_phrase_and_exact_normalised_guide_meaning');
 assert.ok(existingIds.has(suggestion.proposedCanonicalId));
 assert.ok(suggestion.priorInventoryIds.length>0);
 for(const priorId of suggestion.priorInventoryIds){
  const prior=oldLabels.get(priorId);
  assert.ok(prior,`${suggestion.sourceId}: prior inventory exists`);
  assert.equal(normaliseMeaning(prior.sourcePhrase),normaliseMeaning(source.expression));
  assert.ok(prior.canonicalModuleIds.includes(suggestion.proposedCanonicalId));
  assert.ok(prior.sourceMeanings.some(meaning=>normaliseMeaning(meaning)===normaliseMeaning(source.meaningAndReason)));
 }
 const manual=decisions.find(row=>row.sourceId===suggestion.sourceId);
 if(manual?.action==='proposed-alias-existing')assert.equal(manual.canonicalId,suggestion.proposedCanonicalId);
 // An exact phrase-and-guide-meaning hit is a suggestion; a distinct contextual sense may need a new lesson or hold.
}
assert.ok(rows.every(r=>r.renderedPdfPage>=1&&r.renderedPdfPage<=intake.renderedPdfPages));
for(const [book,count] of Object.entries(intake.reportedBookCounts)){
 assert.equal(intake.extractedBookCounts[book].questions,count.questions);
 assert.equal(intake.extractedBookCounts[book].expressions,count.expressions);
}
assert.equal(pilot.length,draftManifest.expectedSourceOrdinals.length);
assert.deepEqual(pilot.map(r=>r.number),draftManifest.expectedSourceOrdinals);
assert.equal(new Set(pilot.map(r=>r.id)).size,pilot.length);
for(const lesson of pilot){
 const decision=decisions.find(row=>row.sourceOrdinal===lesson.number);
 assert.equal(decision?.action,'proposed-new-lesson');
 assert.equal(decision.canonicalId,lesson.id);
}
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
assert.equal(nextIndex.length,baseIndex.length+pilot.length);
assert.deepEqual(nextIndex.slice(0,baseIndex.length).map(row=>[row.id,row.number]),
                 baseIndex.map(row=>[row.id,row.number]));
assert.deepEqual(nextIndex.slice(-pilot.length).map(row=>row.number),Array.from({length:pilot.length},(_,i)=>1894+i));
console.log(JSON.stringify({intakeRows:rows.length,books:Object.keys(intake.reportedBookCounts).length,
 sourcePageGaps:0,editorialDecisionRows:decisions.length,provisionalEditorialTriage:Object.fromEntries(['proposed-new-lesson','proposed-alias-existing','proposed-alias-new','hold-editorial'].map(action=>[action,decisions.filter(row=>row.action===action).length])),exactPriorAliasSuggestions:exactAliasSuggestions.length,exactSuggestionEditorialExceptions:exactAliasSuggestions.filter(row=>{const decision=decisions.find(other=>other.sourceId===row.sourceId);return decision&&decision.action!=='proposed-alias-existing';}).length,selectedExistingAliasPatternExceptions:aliasCoverage.exceptionCount,existingCanonical:release.counts.totalCanonicalModules,
 pilotDrafts:pilot.length,pilotQuestions:pilot.length*6,pilotAudioRequests:pilot.length*4,
 projectedDisplayRange:`1894–${1893+pilot.length}`,wholeCatalogueSchemaErrors:validation.errors.length,exactGuideSentenceCopies:0,pilotNearDuplicateFlags:nearFlags.length,
 published:false,releaseApproved:false},null,2));
