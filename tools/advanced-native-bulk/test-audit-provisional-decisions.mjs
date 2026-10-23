import assert from 'node:assert/strict';
import {auditProvisionalDecisions} from './audit-provisional-decisions.mjs';

const sources=[{sourceId:'s1',expression:'one'},{sourceId:'s2',expression:'two'},
 {sourceId:'s3',expression:'three'},{sourceId:'s4',expression:'four'}];
const decisions=[
 {sourceOrdinal:2112,sourceId:'s1',phrase:'one',action:'proposed-new-lesson',canonicalId:'advanced-native-2112',reason:'A distinct expression and instructional sense.'},
 {sourceOrdinal:2113,sourceId:'s2',phrase:'two',action:'proposed-alias-new',canonicalId:'advanced-native-2112',reason:'A contextual variant of the earlier new owner.'},
 {sourceOrdinal:2114,sourceId:'s3',phrase:'three',action:'proposed-alias-existing',canonicalId:'advanced-native-123',reason:'The same sense is already taught in the baseline.'},
 {sourceOrdinal:2115,sourceId:'s4',phrase:'four',action:'hold-editorial',canonicalId:null,reason:'The instructional unit needs an editorial check.'},
];
const good=auditProvisionalDecisions({decisions,sources,existingIds:new Set(['advanced-native-123'])});
assert.equal(good.errorCount,0);
assert.deepEqual(good.counts,{'proposed-new-lesson':1,'proposed-alias-new':1,
 'proposed-alias-existing':1,'hold-editorial':1});
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
process.stdout.write('All-discovered provisional decision audit checks source and owner integrity.\n');
