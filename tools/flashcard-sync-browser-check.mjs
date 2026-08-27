// Local-only synthetic integration fixture. No student credentials/data or cloud
// endpoints are used. Exercise the shipped functions with native IndexedDB.
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../flashcards.html', import.meta.url), 'utf8');
const extract = name => {
  let start = source.indexOf(`function ${name}(`);
  if (start < 0) throw new Error(`Missing function ${name}`);
  if (source.slice(start - 6, start) === 'async ') start -= 6;
  return source.slice(start, source.indexOf('\n    }', start) + 6);
};
const names = [
  'normalizedLegacyOwnerName','cloneFlashcardSyncPayload','flashcardJsonEqual','isPlainFlashcardStateObject',
  'rebaseFlashcardGenericState','rebaseFlashcardFamiliarityState','flashcardProgressAttemptId',
  'flashcardProgressNumber','flashcardProgressSnapshotStrength','compareFlashcardProgressSnapshotStrength',
  'mergeFlashcardProgressMap','mergeFlashcardProgressEntry','rebaseFlashcardProgressState',
  'flashcardAttemptIdentity','flashcardAttemptStrength','compareFlashcardAttemptStrength','mergeFlashcardAttempts',
  'attemptsForBackup','flashcardAttemptsPayloadBelongsToRecord','reconcileFlashcardStateMutation',
  'flashcardIntegrityError','isFlashcardIntegrityError','flashcardOutboxMutationId','flashcardOutboxRetryDelay',
  'flashcardStateVersion','flashcardStateChecksum','setFlashcardStateMetadata','setFlashcardCanonicalValue',
  'flashcardCanonicalValue','flashcardStateAccountKey','captureSupabaseStateSaveContext',
  'isSupabaseStateContextCurrent','isSupabaseStateHydrated','flashcardMutationAllowed',
  'currentFlashcardBaseValue','createFlashcardOutboxMutation','createCoalescedFlashcardOutboxMutation',
  'flashcardOutboxLogicalMutationIds','flashcardOutboxRecordHasLogicalMutation','flashcardOutboxOwnerMatches',
  'legacyQuarantineRequest','legacyQuarantineTransaction','openFlashcardOutboxDatabase',
  'persistFlashcardOutboxMutation','listFlashcardOutboxMutations','updateFlashcardOutboxMutation',
  'claimFlashcardOutboxMutation','deleteFlashcardOutboxMutation','supersedeFlashcardOutboxMutation',
  'replaceFlashcardOutboxMutations','flashcardOutboxRowsForContext','refreshFlashcardOutboxStatus',
  'flashcardOutboxRecordRequiresResolution','flashcardOutboxTerminalScope','flashcardOutboxTerminalBlocksAccount',
  'flashcardOutboxStatusSummary','applyFlashcardOutboxStatusSummary','createRebasedFlashcardOutboxMutation',
  'createFastForwardedFlashcardOutboxMutation','prepareFlashcardOutboxRecordForV2',
  'compactFlashcardV2Receipt','parseFlashcardV2Receipt','resolveFlashcardCanonicalState',
  'applyFlashcardCanonicalState','handleFlashcardOutboxConflict','blockFlashcardOutboxMutation',
  'sendFlashcardOutboxMutationV2','markFlashcardV2TransportAvailable','sendFlashcardOutboxMutation',
  'isMissingFlashcardV2RpcError','isFlashcardAuthenticationError','scheduleFlashcardOutboxDrain',
  'drainFlashcardOutboxUnlocked','drainFlashcardOutbox','trackFlashcardOutboxPersistence','enqueueFlashcardOutboxMutation',
  'normalizeStoredValue','readJson','writeJson','defaultRemoteValueForKey',
  'flashcardTerminalRecoveryCode','createRecoveredFlashcardOutboxMutation','recoverFlashcardTerminalOutboxRows',
  'coalesceFlashcardOutboxForContext','overlayFlashcardOutboxForContext','prepareFlashcardOutboxForHydration',
  'getAttempts','getProgressStore','progressKey','savedProgressForDeck'
];
const prelude = source.slice(source.indexOf('    const ADMIN_NAME ='), source.indexOf('    function deckDataRevision('))
  .replace('const FLASHCARD_OUTBOX_DB = "edmund-flashcard-sync-outbox";', 'const FLASHCARD_OUTBOX_DB = "synthetic-sync-regression-" + fixtureId;');
const fixtureId = Date.now().toString(36);
const state = new Map(), receipts = new Map();
let writes = 0, offline = false, failAfter = 4, droppedReply = false;
const rows = () => [...state].map(([key, item]) => ({ key, value: item.value, version: item.version, value_checksum: item.checksum }));
const script = `
const fixtureId = ${JSON.stringify(fixtureId)};
${prelude}
const currentUser = {role:'student',id:'synthetic-id',name:'Test Student'};
const studentSessionToken = 'synthetic-local-only', adminPasswordForSession = '';
const adminStudentStateCache = {}, adminStudentStateMetadataCache = {};
let currentView = 'deck-view';
let terminalCount = 0, localFailure = false;
const updateSupabaseStatus = () => {};
const cacheJsonLocally = () => true;
const cacheAccountAttemptsBackup = () => true;
const readFlashcardLastSyncedAt = () => 0;
const cacheFlashcardLastSyncedAt = () => {};
const clearSyncedPendingFamiliarity = () => {};
const refreshCurrentView = () => {};
const renderFlashcardRecoveryPanel = rows => {
  if (rows?.some(row => row.requiresResolution)) terminalCount++;
};
const scheduleFlashcardAutomaticTerminalRecovery = () => {};
const deckDataRevision = () => '';
${names.map(extract).join('\n')}
async function callSupabaseRpc(_name, args) {
  const response = await fetch('/rpc', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(args)});
  if (!response.ok) { const error = new Error('Synthetic temporary connection failure'); error.status=response.status; throw error; }
  return response.json();
}
async function callFlashcardStateReadV2() {
  return { transport:'v2', rows: await (await fetch('/state')).json() };
}
const log = text => document.querySelector('pre').textContent += text+'\\n';
async function describe(label) {
  const pending = await flashcardOutboxRowsForContext();
  const attempt = getAttempts().find(row=>row.id==='synthetic-attempt');
  const saved = savedProgressForDeck('synthetic-deck');
  const result = {label, answered:attempt?.answeredCount||0, completed:!!attempt?.completed,
    pending:pending.length, terminalRows:pending.filter(flashcardOutboxRecordRequiresResolution).length,
    falseRecoveryEvents:terminalCount, phase:supabaseState.phase, offersRedo:!!saved, localFailure};
  log(JSON.stringify(result));
  return result;
}
async function ready() {
  supabaseState.epoch=1;
  const context=captureSupabaseStateSaveContext();
  const remote = await callFlashcardStateReadV2();
  for (const key of SUPABASE_SYNC_KEYS) {
    const row=remote.rows.find(row=>row.key===key);
    const value=row?.value ?? defaultRemoteValueForKey(key);
    remoteStore[key]=value;setFlashcardCanonicalValue(key,value);setFlashcardStateMetadata(key,row?.version||0,row?.value_checksum||'');
  }
  supabaseState.phase=FLASHCARD_SYNC_PHASES.READY;supabaseState.v2Availability='available';
  supabaseState.hydratedOwner=context.owner;supabaseState.hydratedEpoch=context.epoch;
  await prepareFlashcardOutboxForHydration(context);
  await describe('Loaded from durable outbox');
}
async function run() {
  document.querySelector('#run').disabled=true;
  const deck='Test Student::synthetic-deck', outcomes={}, times={};
  for(let i=0;i<30;i++) {
    outcomes[i]='green';times[i]=Date.now();
    const snapshot={attemptId:'synthetic-attempt',deckId:'synthetic-deck',roundNumber:1,roundQueue:Array.from({length:30},(_,i)=>i),
      initialQueue:Array.from({length:30},(_,i)=>i),currentPosition:i,answers:{...outcomes},outcomes:{...outcomes},
      outcomeTimes:{...times},cardAttemptCounts:Object.fromEntries(Object.keys(outcomes).map(k=>[k,1])),savedAt:Date.now(),startedAt:1,elapsedMs:i*100};
    const tasks=[
      writeJson(FAMILIARITY_KEY,{[deck]:{green:Object.keys(outcomes),red:[],updatedAtByCard:{...times}}}),
      writeJson(ATTEMPTS_KEY,[{id:'synthetic-attempt',studentName:'Test Student',deckId:'synthetic-deck',answeredCount:i+1,
        completed:i===29,totalCards:30,green:i+1,red:0,updatedAt:Date.now(),
        cardOutcomes:Object.keys(outcomes).map(key=>({key,status:'green',answeredAt:times[key]}))}]),
      writeJson(PROGRESS_KEY,i===29?{}:{[deck]:snapshot})
    ];
    if ((await Promise.all(tasks)).some(ok=>!ok)) localFailure=true;
    await new Promise(resolve=>setTimeout(resolve,5));
  }
  await Promise.allSettled([...flashcardOutboxPersistencePromises]);
  await new Promise(resolve=>setTimeout(resolve,100));
  const result=await describe('Finished 30 cards while connection fails');
  log(result.answered===30&&result.completed&&!result.terminalRows&&!result.falseRecoveryEvents&&!result.offersRedo&&!result.localFailure
    ? 'PASS: all 30 answers retained locally; no recovery trap; no redo' : 'FAIL: local completion invariant');
}
async function reconnect() {
  await fetch('/reconnect',{method:'POST'});
  for(let i=0;i<100;i++) {
    await drainFlashcardOutbox({force:true});
    if(!(await flashcardOutboxRowsForContext()).length) break;
    await new Promise(resolve=>setTimeout(resolve,5));
  }
  await describe('Reconnected');
  const remote=await callFlashcardStateReadV2();
  const attempts=remote.rows.find(row=>row.key===ATTEMPTS_KEY)?.value||[];
  const familiarity=remote.rows.find(row=>row.key===FAMILIARITY_KEY)?.value||{};
  const attempt=attempts.find(row=>row.id==='synthetic-attempt');
  const pending=await flashcardOutboxRowsForContext();
  log(attempt?.completed&&attempt.answeredCount===30&&attempt.cardOutcomes.length===30
    &&familiarity['Test Student::synthetic-deck']?.green.length===30&&!pending.length
    ? 'PASS: server has all 30 answers and completed attempt; queue empty' : 'FAIL: server completion invariant');
}
document.querySelector('#run').onclick=()=>run().catch(error=>log('FAIL: '+error.message));
document.querySelector('#reconnect').onclick=()=>reconnect().catch(error=>log('FAIL: '+error.message));
document.querySelector('#reload').onclick=()=>location.reload();
ready().catch(error=>log('FAIL: '+error.message));
`;
createServer(async (req,res) => {
  const json = (value, status=200) => {res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(value));};
  if(req.url==='/state') return json(rows());
  if(req.url==='/reconnect'&&req.method==='POST') {offline=false;failAfter=Infinity;return json({ok:true});}
  if(req.url==='/rpc'&&req.method==='POST') {
    let body=''; for await(const chunk of req) body+=chunk;
    const args=JSON.parse(body);
    await new Promise(resolve=>setTimeout(resolve,40));
    if(offline) return json({error:'synthetic offline'},503);
    const id=args.p_request_id, key=args.p_key, value=args.p_value;
    if(receipts.has(id)) return json(receipts.get(id));
    const old=state.get(key)||{value:key.includes('Attempts')?[]:{},version:0,checksum:''};
    let receipt={requestId:id,key,actorKind:'student',expectedVersion:args.p_expected_version};
    if(args.p_expected_version!==old.version) receipt={...receipt,status:'conflict',code:'version_conflict',resultingVersion:old.version,resultingChecksum:old.checksum,canonicalValue:old.value};
    else {
      const next={value,version:old.version+1,checksum:'synthetic-'+(old.version+1)};
      state.set(key,next);writes++;
      receipt={...receipt,status:'accepted',code:'accepted',resultingVersion:next.version,resultingChecksum:next.checksum};
    }
    receipts.set(id,receipt);
    // The first commit succeeds but its response is lost: idempotent replay must
    // not duplicate attempts or require manual recovery.
    if(!droppedReply) {droppedReply=true;return json({error:'synthetic lost reply after commit'},504);}
    if(writes>=failAfter) offline=true;
    return json(receipt);
  }
  if(req.url==='/fixture.js') {res.writeHead(200,{'Content-Type':'text/javascript','Cache-Control':'no-store'});return res.end(script);}
  res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Content-Security-Policy':"default-src 'self'; connect-src 'self'; script-src 'self'; style-src 'unsafe-inline'"});
  res.end('<!doctype html><title>Flashcard synthetic sync regression</title><style>body{font:18px system-ui;padding:28px}button{padding:14px;margin:8px}pre{white-space:pre-wrap}</style><h1>Flashcard sync regression — synthetic data only</h1><button id="run">Run 30-card interrupted-sync test</button><button id="reload">Reload and verify local completion</button><button id="reconnect">Reconnect and verify cloud copy</button><pre></pre><script src="/fixture.js"></script>');
}).listen(8768,'127.0.0.1',()=>console.log('Synthetic Flashcard fixture: http://127.0.0.1:8768/'));
