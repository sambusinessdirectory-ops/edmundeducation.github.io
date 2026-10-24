import assert from 'node:assert/strict';
import {auditProvisionalDecisions} from './audit-provisional-decisions.mjs';

const sources=[{sourceId:'s1',expression:'one'},{sourceId:'s2',expression:'two'},
 {sourceId:'s3',expression:'three'},{sourceId:'s4',expression:'four'},
 {sourceId:'s5',expression:'a one-time comparison'}];
const decisions=[
 {sourceOrdinal:2112,sourceId:'s1',phrase:'one',action:'proposed-new-lesson',canonicalId:'advanced-native-2112',reason:'A distinct expression and instructional sense.'},
 {sourceOrdinal:2113,sourceId:'s2',phrase:'two',action:'proposed-alias-new',canonicalId:'advanced-native-2112',reason:'A contextual variant of the earlier new owner.'},
 {sourceOrdinal:2114,sourceId:'s3',phrase:'three',action:'proposed-alias-existing',canonicalId:'advanced-native-123',reason:'The same sense is already taught in the baseline.'},
 {sourceOrdinal:2115,sourceId:'s4',phrase:'four',action:'hold-editorial',canonicalId:null,reason:'The instructional unit needs an editorial check.'},
 {sourceOrdinal:2116,sourceId:'s5',phrase:'a one-time comparison',action:'excluded-one-off',canonicalId:null,
  reason:'This one-time comparison explains only this source example and contains no reusable English expression for a seven-step lesson.',
  exclusionApproval:{authority:'user',reference:'User-approved one-off exclusion policy in the current production request.'}},
];
const good=auditProvisionalDecisions({decisions,sources,existingIds:new Set(['advanced-native-123'])});
assert.equal(good.errorCount,0);
assert.deepEqual(good.counts,{'proposed-new-lesson':1,'proposed-alias-new':1,
 'proposed-alias-existing':1,'hold-editorial':1,'excluded-one-off':1});
assert.equal(good.decisionRows,5,'Exclusions retain one decision row per source');
assert.ok(auditProvisionalDecisions({decisions:decisions.slice(0,-1),sources,existingIds:new Set(['advanced-native-123'])})
 .errors.some(error=>error.reason==='decision-source-row-count-mismatch'),'Missing exclusion still leaves an auditable source-row gap');
const broken=structuredClone(decisions);
broken[1].canonicalId='advanced-native-2114';
broken[2].sourceOrdinal=2115;
broken[3].canonicalId='advanced-native-2112';
const bad=auditProvisionalDecisions({decisions:broken,sources,existingIds:new Set()});
assert.ok(bad.errors.some(e=>e.reason==='earlier-new-owner-not-found'));
assert.ok(bad.errors.some(e=>e.reason==='ordinal-gap-or-order'));
assert.ok(bad.errors.some(e=>e.reason==='duplicate-ordinal'));
assert.ok(bad.errors.some(e=>e.reason==='existing-owner-not-found'));
assert.ok(bad.errors.some(e=>e.reason==='held-row-has-owner'));
const invalidExcluded=structuredClone(decisions);
invalidExcluded[4].canonicalId='advanced-native-123';
invalidExcluded[4].reason='Skip it.';
delete invalidExcluded[4].exclusionApproval;
const rejected=auditProvisionalDecisions({decisions:invalidExcluded,sources,existingIds:new Set(['advanced-native-123'])});
for(const reason of ['excluded-row-has-owner','excluded-row-lacks-substantive-nonreusability-reason','excluded-row-lacks-user-approval-reference'])
 assert.ok(rejected.errors.some(error=>error.sourceOrdinal===2116&&error.reason===reason),`Reject ${reason}`);
process.stdout.write('All-discovered provisional decision audit checks source and owner integrity.\n');
