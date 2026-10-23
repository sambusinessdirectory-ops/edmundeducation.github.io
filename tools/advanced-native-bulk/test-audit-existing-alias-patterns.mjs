import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {auditAliasPatterns,runAudit} from './audit-existing-alias-patterns.mjs';

const decision=(sourceOrdinal,sourceId,canonicalId)=>({sourceOrdinal,sourceId,canonicalId,
 phrase:'sample target',action:'proposed-alias-existing'});
const report=auditAliasPatterns({
 decisions:[decision(1,'a','good'),decision(2,'b','good'),decision(3,'c','missing'),
  {...decision(4,'d','good'),action:'hold-editorial'}],
 sources:[{sourceId:'a',example:'They came to an agreement.'},
  {sourceId:'b',example:'They did not agree.'},{sourceId:'c',example:'Another example.'}],
 lessons:[{id:'good',target:{pattern:'\\b(?:came|come) to an agreement\\b'}}]
});
assert.equal(report.selectedAliasDecisions,3);
assert.equal(report.matchingAliases,1);
assert.deepEqual(report.exceptions.map(row=>[row.sourceOrdinal,row.reason]),[
 [2,'source-example-does-not-match'],[3,'canonical-lesson-not-found']]);
assert.equal(report.exceptions[0].targetRegex,'\\b(?:came|come) to an agreement\\b');
const invalid=auditAliasPatterns({decisions:[decision(5,'z','invalid')],
 sources:[{sourceId:'z',example:'Any text.'}],lessons:[{id:'invalid',target:{pattern:'('}}]});
assert.equal(invalid.exceptions[0].reason,'invalid-canonical-target-regex');
const legacy=auditAliasPatterns({decisions:[decision(6,'legacy','old')],
 sources:[{sourceId:'legacy',example:'It was a stepping stone.'}],lessons:[],
 legacyTargetPatterns:{old:'\\bstepping\\s+stone\\b'}});
assert.equal(legacy.exceptionCount,0);
const escapedHyphen=auditAliasPatterns({decisions:[decision(7,'hyphen','hyphenated')],
 sources:[{sourceId:'hyphen',example:'The answer is black-and-white.'}],
 lessons:[{id:'hyphenated',target:{pattern:'black\\-and\\-white'}}]});
assert.equal(escapedHyphen.exceptionCount,0);
const selected=runAudit();
const selectedManifest=JSON.parse(readFileSync(new URL('../../course-materials/advanced-native/books10-16/editorial-decision-manifest.json',import.meta.url),'utf8'));
assert.deepEqual(selected.selectedDecisionFiles,selectedManifest.decisionFiles);
assert.ok(selected.selectedAliasDecisions>0);
assert.equal(selected.matchingAliases+selected.exceptionCount,selected.selectedAliasDecisions);
const explicit=runAudit(['--decision-file','editorial-decisions-2412-2471.jsonl']);
assert.deepEqual(explicit.selectedDecisionFiles,['editorial-decisions-2412-2471.jsonl']);
const discovered=runAudit(['--all-discovered']);
assert.ok(discovered.selectedDecisionFiles.length>=selected.selectedDecisionFiles.length);
console.log('Existing-alias pattern audit reports only uncovered or unavailable canonical targets.');
