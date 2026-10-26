import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {sanitizeSession,rewindTo,progressFromSaved,replayCue,checkpointEndIndex,nextProgress} from '../ielts-curation-core.mjs';
const {curation,content}=JSON.parse(fs.readFileSync(new URL('../dse-curation-data/2018.json',import.meta.url)));
const guide=JSON.parse(fs.readFileSync(new URL('../assets/dse-listening/2018/guide.json',import.meta.url)));
execFileSync(process.execPath,['tools/listening/build-dse2018-curation.mjs','--check'],{stdio:'inherit'});
assert.deepEqual(curation.parts.map(p=>p.cues.length),[13,13,13,12]);
assert.deepEqual(curation.parts.flatMap(p=>p.cues.map(c=>c.question)).sort((a,b)=>a-b),Array.from({length:51},(_,i)=>i+1));
assert.deepEqual(curation.parts[2].cues.slice(3,7).map(c=>c.question),[32,31,30,33]);
let evidence=0,stops=0;
for(const p of curation.parts){
 const rows=content.transcript[p.part],timings=content.timings.parts[p.part].lines;
 assert.equal(p.annotations.length,rows.length);assert.equal(timings.length,rows.length);
 assert.ok(p.duration>=timings.at(-1).end);
 for(let i=0;i<p.cues.length;i++){
  const c=p.cues[i];assert.ok(c.start<c.end&&c.end<p.duration);
  if(i)assert.ok(c.end>=p.cues[i-1].end);
  if(!i||c.end!==p.cues[i-1].end)stops++;
  assert.equal(c.end,timings[c.endLine].end);
  assert.equal(content.analysis[c.question].explanation,guide.analysis[c.question].explanation);
  assert.ok(c.hint.length>10&&c.paraphrase.length>10);
  for(const e of [...c.evidence,...c.distractors]){assert.ok(rows[e.line].en.includes(e.quote),`Q${c.question}: exact span`);assert.ok(e.revealAt<=c.end);assert.notEqual(p.annotations[e.line].role,'noise');evidence++;}
  for(const e of c.distractors){assert.ok(e.candidateAt<=e.rejectAt&&e.rejectAt<=c.end);assert.ok(e.why);}
  const replay=replayCue(p,i);assert.ok(replay.index<=i);assert.equal(replay.completed,replay.index);
  const rewind=rewindTo(p,{completed:i,index:i},p.duration);assert.ok(rewind.completed<=i);assert.ok(rewind.time<c.end);
 }
 assert.equal(nextProgress(p,{phase:'paused',completed:p.cues.length}).phase,'done');
 const raw={id:curation.id,version:curation.version,revealMode:'manual',part:p.part,parts:{[p.part]:{completedIds:p.cues.map(c=>c.id),revealedIds:p.cues.map(c=>c.id),drafts:{[p.cues[0].question]:'my work',999:'unknown'}}}};
 const clean=sanitizeSession(raw,curation);assert.equal(clean.parts[p.part].completedIds.length,p.cues.length);assert.equal(Object.keys(clean.parts[p.part].drafts).length,1);assert.equal(progressFromSaved(p,clean.parts[p.part]).time,p.cues.at(-1).end);
 for(let i=0;i<p.cues.length;i++){const end=checkpointEndIndex(p,i);if(end>i){raw.parts[p.part].completedIds=p.cues.slice(0,i+1).map(c=>c.id);assert.ok(sanitizeSession(raw,curation).parts[p.part].completedIds.length<=i,'incomplete group rolled back');}}
}
assert.throws(()=>sanitizeSession({version:curation.version,practice:2},curation));
assert.throws(()=>sanitizeSession({version:curation.version,id:'dse2019-part-a'},curation));
const cue=q=>curation.parts.flatMap(p=>p.cues).find(c=>c.question===q);
assert.equal(cue(17).end,277.69,'first route waits for monster');assert.equal(cue(18).end,315.38,'second route waits for success');
assert.equal(cue(38).end,458.48,'funny meaning confirmed');assert.equal(cue(43).end,190.6,'both positions heard');assert.equal(cue(49).end,320.1,'sometimes and purpose heard');
assert.ok(content.transcript[4][0].en.includes('Task 4'));assert.ok(content.transcript[3].at(-1).en.includes('tidy up'));
console.log(`PASS DSE 2018: 51 questions, ${stops} complete-context stops, ${evidence} exact spans, 322 rows, maze/painting chronology, source explanations and exam-isolated saves.`);
