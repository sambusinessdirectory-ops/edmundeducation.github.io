// Exercise the real flashcard adapter with synthetic accounts; never touch production data.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../flashcards.html',import.meta.url),'utf8');
const start=source.indexOf("    import('./classroom-live-sync.mjs");
const end=source.indexOf('    void initialiseFlashcardPortal()',start);
assert.ok(start>0&&end>start);
const adapter=source.slice(start,end).replace(/import\('[^']+'\)/,'Promise.resolve({createClassroomLiveSync})');
const deck='dse/speaking/2023/passage/3.3';
const session=(id,offset=0)=>({attemptId:id,cards:Array.from({length:60},(_,i)=>({front:`card ${i+1}`})),mode:'range',roundNumber:1,roundQueue:Array.from({length:10},(_,i)=>i+offset),initialQueue:Array.from({length:10},(_,i)=>i+offset),initialTotal:10,currentPosition:0,answers:{},outcomes:{},outcomeTimes:{},cardAttemptCounts:{},flipped:false,completed:false,reversalMode:false,startedAt:Date.now(),elapsedMs:0});
let config,renders=0;
const ctx=vm.createContext({console,Date,Map,Promise,currentUser:{id:'fixture-student'},studentSessionToken:'fixture-token',currentView:'deck-view',currentDeckId:deck,studySession:session('first'),classroomTickOverlays:new Map(),deckDataRevision:()=>'',getDeckFamiliarity:()=>({green:[],red:[]}),normalizeFamiliarity:x=>x,stopCountdownTimers(){},hideCountdownClock(){},renderStudyCard(){renders++;},updateSessionTimer(){},sessionElapsedMs:()=>314850,createClassroomLiveSync:c=>(config=c,{})});
await vm.runInContext(adapter,ctx);
const firstScope=config.context().scope;
ctx.studySession.completed=true;ctx.studySession.roundNumber=4;ctx.studySession.roundQueue=[];
ctx.studySession.outcomes=Object.fromEntries(Array.from({length:10},(_,i)=>[i,'green']));
const finished=structuredClone(config.read());
ctx.studySession=session('second',10);
const before=structuredClone(ctx.studySession);
config.apply(finished);
assert.deepEqual(ctx.studySession,before,'completed cards 1–10 must not replace a new 11–20 attempt');
assert.notEqual(config.context().scope,firstScope,'transport must isolate each attempt, not just each deck');
assert.equal(renders,0);
// Even the same range restarted is a new attempt.
ctx.studySession=session('restart');const restarted=structuredClone(ctx.studySession);
config.apply(finished);assert.deepEqual(ctx.studySession,restarted);
// Legacy cached payloads (before attempt identity was sent) cannot overwrite a new attempt.
const legacy=structuredClone(finished);delete legacy.attemptId;config.apply(legacy);
assert.deepEqual(ctx.studySession,restarted);
// Resuming the exact attempt on another device still receives live updates.
ctx.studySession=session('first');config.apply(finished);
assert.equal(ctx.studySession.completed,true);assert.equal(ctx.studySession.roundNumber,4);
assert.equal(ctx.studySession.elapsedMs,314850);assert.equal(ctx.studySession.attemptId,'first');
assert.equal(ctx.studySession.classroomFollowing,true);assert.equal(renders,1);
// Same attempt ID with a mismatched range or a malformed queue is rejected.
ctx.studySession=session('first',10);const wrongRange=structuredClone(ctx.studySession);config.apply(finished);
assert.deepEqual(ctx.studySession,wrongRange);
ctx.studySession=session('first');const malformed=structuredClone(finished);malformed.session.roundQueue=[60];
config.apply(malformed);assert.equal(ctx.studySession.completed,false);
ctx.studySession.attemptId='';assert.equal(config.context().scope,null,'unidentified attempts cannot consume deck-wide snapshots');
ctx.studySession=session('first');ctx.currentView='dashboard';assert.equal(config.context().scope,null);
console.log('PASS flashcard attempt isolation: cross-range, same-range restart, legacy payload, same-attempt resume, timer, queue validation, missing identity, leaving view.');
