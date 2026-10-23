import assert from 'node:assert/strict';
import {auditNewAliasOwners} from './audit-new-alias-owners.mjs';

const decisions=[
 {sourceOrdinal:2112,sourceId:'s1',action:'proposed-new-lesson',canonicalId:'advanced-native-2112'},
 {sourceOrdinal:2113,sourceId:'s2',action:'proposed-alias-new',canonicalId:'advanced-native-2112'},
 {sourceOrdinal:2114,sourceId:'s3',action:'proposed-alias-new',canonicalId:'advanced-native-2114'},
 {sourceOrdinal:2115,sourceId:'s4',action:'proposed-new-lesson',canonicalId:'advanced-native-2115'},
 {sourceOrdinal:2116,sourceId:'s5',action:'proposed-alias-new',canonicalId:'advanced-native-2115'},
];
const sources=[{sourceId:'s2',example:'They took a leap.'},{sourceId:'s3',example:'They took a leap.'},{sourceId:'s5',example:'He remained calm.'}];
const drafts=[{id:'advanced-native-2112',target:{pattern:'took a leap'}},
 {id:'advanced-native-2115',target:{pattern:'stayed calm'}}];
assert.deepEqual(auditNewAliasOwners({decisions,sources,drafts}),{
 aliasNewRows:3,matchedDrafts:1,awaitingDrafts:0,exceptionCount:2,exceptions:[
  {sourceOrdinal:2114,canonicalId:'advanced-native-2114',reason:'earlier-proposed-owner-not-found'},
  {sourceOrdinal:2116,canonicalId:'advanced-native-2115',reason:'source-example-does-not-match-owner'},
 ]});
assert.equal(auditNewAliasOwners({decisions,sources,drafts:[]}).awaitingDrafts,2);
process.stdout.write('New-owner alias audit checks owner existence and drafted target coverage.\n');
