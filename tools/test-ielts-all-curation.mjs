import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import {createHash} from 'node:crypto';
import {curation as pilot} from '../ielts-practice2-curation-data.mjs';
import {checkpointStartIndex,checkpointEndIndex,sanitizeSession,replayCue,rewindTo,progressFromSaved} from '../ielts-curation-core.mjs';
const legacy={window:{}};for(const name of ['data','analysis','transcript','timings'])vm.runInNewContext(fs.readFileSync(new URL(`../listening-practice-1-${name}.js`,import.meta.url),'utf8'),legacy);
const w=legacy.window;const first={...w.EDMUND_IELTS_LISTENING_PRACTICE_1,practice:1,transcript:w.EDMUND_IELTS_LISTENING_PRACTICE_1_TRANSCRIPT,analysis:w.EDMUND_IELTS_LISTENING_PRACTICE_1_ANALYSIS,timings:w.EDMUND_IELTS_LISTENING_PRACTICE_1_TIMINGS};
let questions=0,tracks=0,groups=0,spans=0,distractors=0;
for(let n=1;n<=20;n++){
 const c=n===1?first:JSON.parse(fs.readFileSync(new URL(`../assets/listening/practices/practice-${n}.json`,import.meta.url)));
 const ledger=n===2?pilot:JSON.parse(fs.readFileSync(new URL(`../ielts-curation-data/practice-${n}.json`,import.meta.url)));
 assert.equal(ledger.practice,n);assert.equal(ledger.parts.length,4);
 for(const p of ledger.parts){
  tracks++;const rows=c.transcript[p.part],timing=c.timings.parts[p.part];assert.equal(p.cues.length,10);assert.equal(p.annotations.length,rows.length);assert.equal(new Set(p.annotations.map(a=>a.line)).size,rows.length);
  assert.match(p.audioSha256,/^[a-f0-9]{64}$/);assert.equal(p.transcriptSha256,createHash('sha256').update(JSON.stringify(rows)).digest('hex'));
  if(n!==1)assert.equal(p.audioSha256,timing.audioSha256);
  for(const [i,cue] of p.cues.entries()){
   const label=`Practice ${n} Q${cue.question}`;questions++;assert.equal(cue.question,(p.part-1)*10+i+1);assert(c.analysis[cue.question].explanation.length>30,label);
   const q=c.parts[p.part-1].questions.find(q=>q.number===cue.question||q.numbers?.includes(cue.question));assert(q,label);
   assert.equal(cue.answer,q.answers?q.answers[q.numbers.indexOf(cue.question)]:q.answer.toLowerCase()===cue.answer?cue.answer:q.answer,label);
   assert(cue.start<cue.end&&cue.end<=p.duration+.05,label+' valid endpoint');assert.equal(cue.end,timing.lines[cue.endLine].end,label);
   if(i)assert(cue.end>=p.cues[i-1].end,label+' chronological');assert(cue.evidence.length,label+' source evidence');
   for(const e of cue.evidence){spans++;assert(rows[e.line].en.includes(e.quote),label+' exact quote');assert(e.revealAt<=cue.end,label);assert.equal(e.revealAt,timing.lines[e.line].end,label);}
   for(const d of cue.distractors){distractors++;assert(rows[d.line].en.includes(d.quote),label+' exact distractor');assert(d.candidateAt<=d.rejectAt&&d.rejectAt<=cue.end,label+' decision chronology');}
   if(q.numbers){assert.deepEqual(cue.groupQuestions,Array.from(q.numbers),label);assert(p.cues.filter(x=>q.numbers.includes(x.question)).every(x=>x.end===cue.end),label+' grouped stop');}
   const start=checkpointStartIndex(p,i),end=checkpointEndIndex(p,i);if(start!==end)groups++;
   assert.equal(replayCue(p,i).index,start,label+' replays complete group');assert.equal(rewindTo(p,{completed:10},cue.end-.01).completed,start,label+' removes complete group');
  }
 }
 const saved=sanitizeSession({version:ledger.version,practice:n,revealMode:'manual',parts:{1:{completedIds:ledger.parts[0].cues.map(c=>c.id),revealedIds:[ledger.parts[0].cues[0].id],drafts:{1:'independent attempt'}}}},ledger);
 assert.equal(saved.practice,n);assert.equal(saved.parts[1].drafts[1],'independent attempt');assert.equal(progressFromSaved(ledger.parts[0],saved.parts[1]).phase,'paused');
 assert.throws(()=>sanitizeSession({...saved,practice:n===20?1:n+1},ledger),'reject cross-practice imports');
}
console.log(`PASS ${questions} questions, ${tracks} recordings, ${spans} exact evidence spans, ${distractors} distractor spans, ${groups} grouped answer entries and isolated progress.`);
