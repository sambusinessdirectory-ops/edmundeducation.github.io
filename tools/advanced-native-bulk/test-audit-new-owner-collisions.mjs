#!/usr/bin/env node
import assert from 'node:assert/strict';
import {auditNewOwners,runAudit} from './audit-new-owner-collisions.mjs';

const fixture=auditNewOwners({
 decisions:[{sourceOrdinal:2120,sourceId:'sample-2120',phrase:'wear thin',action:'proposed-new-lesson'}],
 sources:[{sourceId:'sample-2120',example:'His excuses began to wear thin by the third week.'}],
 lessons:[{id:'advanced-native-1863',titleEn:'wear thin',target:{pattern:'\\b(?:wear|wears|wearing|wore|worn) thin\\b'},sources:[]}],
});
assert.equal(fixture.proposedNew,1);
assert.equal(fixture.collisions,1);
assert.equal(fixture.records[0].canonicalId,'advanced-native-1863');
assert.equal(fixture.records[0].exactTitle,true);
assert.equal(fixture.records[0].detectorMatch,true);

const current=runAudit();
assert.equal(current.records.some(row=>row.sourceOrdinal===2120),false,
 'withdrawn 2120 must not remain a selected new owner');
assert.equal(current.records.some(row=>row.sourceOrdinal===2266),false,
 'withdrawn 2266 must not remain a selected new owner');
assert.equal(current.records.some(row=>row.sourceOrdinal===2917),false,
 'reclassified 2917 must not remain a selected new owner');
process.stdout.write('New-owner collision screen detects duplicate owners and excludes withdrawn proposals.\n');
