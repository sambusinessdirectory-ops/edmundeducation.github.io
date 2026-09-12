import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../flashcards.html', import.meta.url), 'utf8');
function extract(name) {
  let start = source.indexOf(`function ${name}(`);
  assert.ok(start >= 0, `Missing ${name}`);
  if (source.slice(start - 6, start) === 'async ') start -= 6;
  const next = source.indexOf('\n    }', start);
  assert.ok(next > start, `Unterminated ${name}`);
  return source.slice(start, next + 6);
}
const functions = [
  'cloneFlashcardSyncPayload', 'flashcardJsonEqual', 'isPlainFlashcardStateObject',
  'rebaseFlashcardGenericState', 'flashcardProgressAttemptId', 'flashcardProgressNumber',
  'flashcardProgressSnapshotStrength', 'compareFlashcardProgressSnapshotStrength',
  'mergeFlashcardProgressMap', 'mergeFlashcardProgressEntry', 'rebaseFlashcardProgressState',
  'flashcardAttemptIdentity', 'flashcardAttemptStrength', 'compareFlashcardAttemptStrength',
  'mergeFlashcardAttempts', 'attemptsForBackup', 'flashcardAttemptsPayloadBelongsToRecord',
  'reconcileFlashcardStateMutation'
];
if (source.includes('function rebaseFlashcardFamiliarityState(')) functions.push('rebaseFlashcardFamiliarityState');
const merge = vm.runInNewContext(`(() => {
  const ATTEMPTS_KEY = 'attempts', PROGRESS_KEY = 'progress', FAMILIARITY_KEY = 'familiarity';
  ${functions.map(extract).join('\n')}
  return { reconcile: reconcileFlashcardStateMutation, attempts: mergeFlashcardAttempts };
})()`);
const plain = value => JSON.parse(JSON.stringify(value));
const deck = 'Test Student::synthetic-deck';

// Two adjacent saves from ONE device can overlap at the deck level without
// conflicting at the card level. The previous generic merge rejected these.
const familiarity = merge.reconcile({
  key: 'familiarity',
  baseValue: { [deck]: { green: ['0'], red: [] } },
  payload: { [deck]: { green: ['0', '1'], red: [] } }
}, { [deck]: { green: ['0', '2'], red: [] } });
assert.equal(familiarity.safe, true, 'Independent card grades must merge, not enter safe recovery');
assert.deepEqual([...familiarity.value[deck].green].sort(), ['0', '1', '2']);

// Later per-card timestamps select the current grade; unrelated cards survive.
const changedGrade = merge.reconcile({
  key: 'familiarity',
  baseValue: { [deck]: { green: [], red: ['0'], updatedAtByCard: { 0: 10 } } },
  payload: { [deck]: { green: ['0'], red: [], updatedAtByCard: { 0: 30 } } }
}, { [deck]: { green: [], red: ['0', '2'], updatedAtByCard: { 0: 20, 2: 25 } } });
assert.equal(changedGrade.safe, true);
assert.deepEqual([...changedGrade.value[deck].green], ['0']);
assert.deepEqual([...changedGrade.value[deck].red], ['2']);

// Same-attempt partial snapshots must union card outcomes, not choose one list.
const combined = merge.attempts([
  { id: 'attempt', studentName: 'Test Student', answeredCount: 1,
    cardOutcomes: [{ key: 'a', status: 'green', answeredAt: 10 }], updatedAt: 10 }
], [
  { id: 'attempt', studentName: 'Test Student', answeredCount: 1,
    cardOutcomes: [{ key: 'b', status: 'green', answeredAt: 20 }], updatedAt: 20 }
]);
assert.equal(combined[0].cardOutcomes.length, 2, 'Neither independently recorded answer may disappear');
assert.equal(combined[0].answeredCount, 2);
const complete = merge.attempts([
  { id: 'attempt', studentName: 'Test Student', completed: true, answeredCount: 30, updatedAt: 30 }
], [{ id: 'attempt', studentName: 'Test Student', completed: false, answeredCount: 5, updatedAt: 50 }]);
assert.equal(complete[0].completed, true);
assert.equal(complete[0].answeredCount, 30);

// A newer server version between receipt and read must not be called corruption.
const reloadContext = {
  ATTEMPTS_KEY: 'attempts',
  cloneFlashcardSyncPayload: structuredClone,
  defaultRemoteValueForKey: () => [],
  flashcardIntegrityError: message => Object.assign(new Error(message), {name:'FlashcardIntegrityError'}),
  flashcardStateVersion:()=>0,
  isSupabaseStateContextCurrent: () => true,
  callFlashcardStateReadV2: async () => ({transport:'v2',rows:[
    {key:'attempts',value:[{id:'newer'}],version:8,value_checksum:'v8'}
  ]})
};
vm.createContext(reloadContext);
vm.runInContext(extract('resolveFlashcardCanonicalState'), reloadContext);
const receipt={resultingVersion:7,resultingChecksum:'v7'};
assert.deepEqual(plain(await reloadContext.resolveFlashcardCanonicalState({key:'attempts'},receipt,{})),[{id:'newer'}]);
assert.equal(receipt.resultingVersion,8);
assert.equal(receipt.acknowledgedVersion,7);
await assert.rejects(reloadContext.resolveFlashcardCanonicalState({key:'attempts'},
  {resultingVersion:8,resultingChecksum:'wrong'},{}), /checksum/);
reloadContext.flashcardStateChecksum=()=>'v9';
reloadContext.flashcardCanonicalValue=()=>[{id:'newest-acknowledgement'}];
reloadContext.callFlashcardStateReadV2=async()=>{
  reloadContext.flashcardStateVersion=()=>9;
  return {transport:'v2',rows:[{key:'attempts',value:[{id:'older-read'}],version:8,value_checksum:'v8'}]};
};
const racedReceipt={resultingVersion:7,resultingChecksum:'v7'};
assert.deepEqual(plain(await reloadContext.resolveFlashcardCanonicalState({key:'attempts'},racedReceipt,{})),[{id:'newest-acknowledgement'}]);
assert.equal(racedReceipt.resultingVersion,9,'An in-flight read must not roll back a newer acknowledgement');
reloadContext.isSupabaseStateContextCurrent=()=>false;
await assert.rejects(reloadContext.resolveFlashcardCanonicalState({key:'attempts'},receipt,{}), /earlier session/);

// A stale sender may only claim a still-present durable row, never recreate it.
assert.match(extract('claimFlashcardOutboxMutation'), /store\.get\(mutationId\)/);
assert.match(extract('claimFlashcardOutboxMutation'), /if \(!current/);
assert.match(extract('drainFlashcardOutboxUnlocked'), /await claimFlashcardOutboxMutation/);
const persistence=extract('persistFlashcardOutboxMutation');
assert.equal((persistence.match(/database\.transaction\(/g)||[]).length,1,
  'Persistence verification must share the write transaction to avoid false storage failures');

// Completed durable attempts are authoritative even if resume cleanup is delayed.
const resumeContext={
  currentUser:{name:'Test Student'},
  getProgressStore:()=>({[deck]:{attemptId:'done',currentPosition:28}}),
  progressKey:()=>deck,
  getAttempts:()=>[{id:'done',studentName:'Test Student',completed:true}],
  deckDataRevision:()=>'', clearSavedProgress:()=>{throw new Error('Must not erase during a read');}
};
vm.createContext(resumeContext);
vm.runInContext(extract('savedProgressForDeck'),resumeContext);
assert.equal(resumeContext.savedProgressForDeck('synthetic-deck'),null);
resumeContext.getAttempts=()=>[{id:'other',studentName:'Test Student',completed:true}];
assert.equal(resumeContext.savedProgressForDeck('synthetic-deck').currentPosition,28,
  'An unrelated completion must never conceal another attempt');

// Only routine conflicts are key-scoped; authentication/identity failures stay blocked.
const scopeContext={PROGRESS_KEY:'progress',FAMILIARITY_KEY:'familiarity',FLASHCARD_TERMINAL_RECOVERY_CODES:new Set(['version_conflict','request_id_reuse'])};
vm.createContext(scopeContext);
vm.runInContext(['flashcardOutboxRecordRequiresResolution','flashcardTerminalRecoveryCode','flashcardOutboxTerminalScope'].map(extract).join('\n'),scopeContext);
assert.equal(scopeContext.flashcardOutboxTerminalScope({status:'conflict',terminalScope:'account',receipt:{code:'version_conflict'}}),'key');
assert.equal(scopeContext.flashcardOutboxTerminalScope({status:'blocked',receipt:{code:'authentication_failed'}}),'account');
const legacyGradeConflict={key:'familiarity',status:'blocked',terminalScope:'account',
  lastError:'A queued mutation needs review (overlap:Test Student::synthetic-deck).'};
assert.equal(scopeContext.flashcardTerminalRecoveryCode(legacyGradeConflict),'local_rebase_review');
assert.equal(scopeContext.flashcardOutboxTerminalScope(legacyGradeConflict),'key');
for(const error of ['The canonical checksum does not match its verified version.',
  'Authentication rejected this pending change; it remains quarantined and was not retried.']) {
  assert.equal(scopeContext.flashcardTerminalRecoveryCode({...legacyGradeConflict,lastError:error}),'');
  assert.equal(scopeContext.flashcardOutboxTerminalScope({...legacyGradeConflict,lastError:error}),'account');
}
assert.doesNotMatch(extract('runFlashcardTerminalRecovery'),/releaseFlashcardTerminalOutboxRows/);

// Background reconciliation must never un-hydrate an active student or purge work.
let finishRead;
const readGate=new Promise(resolve=>{finishRead=resolve;});
const activeContext={type:'student',owner:'synthetic',epoch:1};
let pendingRows=[{status:'conflict',requiresResolution:true,key:'progress'}];
const recoveryContext={
  console:{warn(){}}, currentView:'deck-view', flashcardTerminalRecoveryPromise:null,
  flashcardRecoveryRows:pendingRows, flashcardRecoveryUiState:{mode:'idle'},
  flashcardOutboxDrainPromise:null, FLASHCARD_OUTBOX_RETRY_CAP_MS:300000,
  flashcardAutomaticRecoveryAttemptedOwners:new Set(),
  FLASHCARD_SYNC_PHASES:{READY:'ready',HYDRATING:'hydrating'},
  SUPABASE_SYNC_KEYS:['progress'],
  supabaseState:{phase:'ready',hydratedOwner:'synthetic',hydratedEpoch:1,outboxErrorClass:'terminal'},
  captureSupabaseStateSaveContext:()=>activeContext,
  reloadForCurrentFlashcardClientUpdate:async()=>false,
  flashcardOutboxRowsForContext:async()=>pendingRows,
  renderFlashcardRecoveryPanel(){}, waitForFlashcardHydrationToSettle:async()=>true,
  callFlashcardStateReadV2:async()=>{await readGate;return {transport:'v2',rows:[]};},
  loadStudentStateFromSupabase:()=>{throw new Error('Must not reset hydration during study');},
  isSupabaseStateContextCurrent:()=>true,
  setFlashcardCanonicalValue(){},setFlashcardStateMetadata(){},flashcardStateVersion:()=>0,defaultRemoteValueForKey:()=>({}),
  flashcardOutboxRecordRequiresResolution:row=>!!row.requiresResolution,
  recoverFlashcardTerminalOutboxRows:async()=>{pendingRows=[];},
  applyFlashcardOutboxStatusSummary:rows=>({errorClass:rows.length?'terminal':'',globalBlock:false,lastError:''}),
  drainFlashcardOutbox:async()=>{}, hydrateFlashcardDisplayPreferences(){},updateSupabaseStatus(){},
  refreshCurrentView:()=>{throw new Error('Must not replace the active card on recovery');},
  document:{querySelector:()=>null},window:{setTimeout(){}},
  isFlashcardAuthenticationError:()=>false,isTransientFlashcardStateReadError:()=>false
};
vm.createContext(recoveryContext);
vm.runInContext(extract('runFlashcardTerminalRecovery'),recoveryContext);
const recovering=recoveryContext.runFlashcardTerminalRecovery({automatic:true});
await new Promise(resolve=>setImmediate(resolve));
assert.equal(recoveryContext.supabaseState.phase,'ready','Students must remain able to save while a background read is delayed');
finishRead();
assert.equal(await recovering,true);
assert.equal(recoveryContext.supabaseState.phase,'ready');

pendingRows=[{status:'conflict',requiresResolution:true,key:'progress'}];
recoveryContext.recoverFlashcardTerminalOutboxRows=async()=>{};
assert.equal(await recoveryContext.runFlashcardTerminalRecovery({automatic:true}),false);
assert.equal(pendingRows.length,1,'Unresolved changes must never be purged by recovery');
assert.equal(recoveryContext.supabaseState.phase,'ready');

// A completed cloud attempt proves a stale resume snapshot can be retired.
// Use the actual recovery/replacement path so logical writes stay durable until
// normal server acknowledgement; a visible/local completion is insufficient.
const progressKey = 'Test Student::synthetic-deck';
const staleProgress = {
  attemptId: 'finished-attempt', deckId: 'synthetic-deck', savedAt: 100,
  elapsedMs: 80, roundNumber: 1, initialQueue: [0, 1, 2],
  outcomes: { 0: 'green', 1: 'red' }, answers: { 0: 'green', 1: 'red' },
  outcomeTimes: { 0: 50, 1: 90 }, cardAttemptCounts: { 0: 1, 1: 1 }
};
const verifiedCompletion = {
  id: 'finished-attempt', studentName: 'Test Student', deckId: 'synthetic-deck',
  completed: true, completedAt: 200, durationMs: 180, roundNumber: 2,
  cardOutcomes: [
    { deckId: 'synthetic-deck', index: 0, status: 'green', answeredAt: 50 },
    { deckId: 'synthetic-deck', index: 1, status: 'green', answeredAt: 150 },
    { deckId: 'synthetic-deck', index: 2, status: 'green', answeredAt: 190 }
  ],
  cardAttempts: [{ deckId: 'synthetic-deck', index: 1, count: 2 }]
};
const blockedProgress = {
  key: 'progress', status: 'blocked', terminalScope: 'key', owner: 'owner',
  studentName: 'Test Student', studentId: 'student-id', transportType: 'student',
  mutationId: 'old-write', logicalMutationIds: ['answer-write', 'timer-write'],
  recoveryClass: 'fresh-canonical-rebase', expectedVersion: 3,
  baseValue: { [progressKey]: { ...staleProgress, savedAt: 95 } },
  payload: { [progressKey]: staleProgress }
};
const completionContext = {
  ATTEMPTS_KEY: 'attempts', PROGRESS_KEY: 'progress', FAMILIARITY_KEY: 'familiarity',
  FLASHCARD_TERMINAL_RECOVERY_CODES: new Set(['version_conflict', 'request_id_reuse']),
  flashcardCanonicalValues: new Map([['attempts', [verifiedCompletion]], ['progress', {}]]),
  flashcardOutboxOwnerMatches: record => record.owner === 'owner',
  flashcardStateVersion: () => 9, flashcardStateChecksum: () => 'verified-v9',
  flashcardOutboxMutationId: () => 'new-write',
  flashcardIntegrityError: message => new Error(message),
  structuredClone
};
vm.createContext(completionContext);
vm.runInContext([...functions, 'flashcardCanonicalValue', 'flashcardOutboxLogicalMutationIds', 'flashcardOutboxRecordRequiresResolution',
  'flashcardTerminalRecoveryCode', 'reconcileCompletedFlashcardProgressMutation',
  'createFastForwardedFlashcardOutboxMutation', 'createRecoveredFlashcardOutboxMutation',
  'recoverFlashcardTerminalOutboxRows'].map(extract).join('\n'), completionContext);
const recoveredProgress = completionContext.createRecoveredFlashcardOutboxMutation(blockedProgress);
assert.ok(recoveredProgress, 'Cloud-proven completion must unblock the obsolete resume snapshot');
assert.equal(recoveredProgress.status, 'queued');
assert.equal(recoveredProgress.mutationId, 'new-write');
assert.equal(recoveredProgress.expectedVersion, 9);
assert.deepEqual(plain(recoveredProgress.payload), {});
assert.deepEqual(plain(recoveredProgress.logicalMutationIds), ['answer-write', 'timer-write', 'old-write']);
assert.equal(blockedProgress.payload[progressKey].outcomes[1], 'red', 'Original evidence is not mutated');
assert.equal(verifiedCompletion.cardOutcomes[1].status, 'green', 'Completed answers must not be rolled back');

for (const change of [
  value => { value.completed = false; },
  value => { value.id = 'different-attempt'; },
  value => { value.studentName = 'Someone Else'; },
  value => { value.deckId = 'another-deck'; },
  value => { value.completedAt = 99; },
  value => { value.durationMs = 79; },
  value => { value.cardOutcomes = value.cardOutcomes.slice(0, 2); },
  value => { value.cardOutcomes[1].answeredAt = 89; },
  value => { value.cardOutcomes[1].answeredAt = 90; },
  value => { value.cardOutcomes[0].status = 'red'; }
]) {
  const insufficient = structuredClone(verifiedCompletion);
  change(insufficient);
  completionContext.flashcardCanonicalValues.set('attempts', [insufficient]);
  assert.equal(completionContext.createRecoveredFlashcardOutboxMutation(blockedProgress), null,
    'Missing, older, conflicting or unrelated cloud evidence must keep the update blocked');
}
completionContext.flashcardCanonicalValues.delete('attempts');
assert.equal(completionContext.createRecoveredFlashcardOutboxMutation(blockedProgress), null);
completionContext.flashcardCanonicalValues.set('attempts', [verifiedCompletion]);
assert.equal(completionContext.createRecoveredFlashcardOutboxMutation({ ...blockedProgress, owner: 'other' }), null);
assert.equal(completionContext.createRecoveredFlashcardOutboxMutation({
  ...blockedProgress, receipt: { status: 'rejected', code: 'authentication_failed' }
}), null, 'Completion evidence must never bypass authentication quarantine');

const unrelatedKey = 'Test Student::unrelated-deck';
const unrelatedProgress = { ...staleProgress, attemptId: 'different-attempt', deckId: 'unrelated-deck' };
const mixedRecord = {
  ...blockedProgress,
  baseValue: { ...blockedProgress.baseValue, [unrelatedKey]: { ...unrelatedProgress, savedAt: 95 } },
  payload: { ...blockedProgress.payload, [unrelatedKey]: unrelatedProgress }
};
assert.equal(completionContext.createRecoveredFlashcardOutboxMutation(mixedRecord), null,
  'One proven completion cannot discard another unresolved deck');
const newWork = { ...blockedProgress, payload: { ...blockedProgress.payload, [unrelatedKey]: unrelatedProgress } };
assert.deepEqual(plain(completionContext.createRecoveredFlashcardOutboxMutation(newWork).payload),
  { [unrelatedKey]: unrelatedProgress }, 'Unrelated new progress must survive recovery');

const durableRows = new Map([['old-write', blockedProgress]]);
completionContext.flashcardOutboxRowsForContext = async () => [...durableRows.values()];
completionContext.supersedeFlashcardOutboxMutation = async (id, replacement) => {
  assert.equal(durableRows.get(id), blockedProgress);
  durableRows.set(replacement.mutationId, replacement);
  durableRows.delete(id);
  return true;
};
assert.equal(await completionContext.recoverFlashcardTerminalOutboxRows({}), 1);
assert.equal(durableRows.size, 1, 'Recovered writes remain durable until server acknowledgement');
assert.equal(durableRows.get('new-write').status, 'queued');

console.log('Flashcard sync resilience merge, receipt-race, completion, isolation and background-recovery checks passed.');
