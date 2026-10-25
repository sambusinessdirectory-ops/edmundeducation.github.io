import assert from 'node:assert/strict';
import fs from 'node:fs';
import {curation} from '../ielts-practice2-curation-data.mjs';
import {initialProgress,rewindTo,replayCue,nextProgress,checkpointDue,sanitizeSession,progressFromSaved,annotationSegments} from '../ielts-curation-core.mjs';
const content=JSON.parse(fs.readFileSync(new URL('../assets/listening/practices/practice-2.json',import.meta.url)));
let spans=0,distractors=0,lines=0;
for(const part of curation.parts){
 const rows=content.transcript[part.part],times=content.timings.parts[part.part];
 assert.equal(part.audioSha256,times.audioSha256);assert.equal(part.transcriptSha256,times.transcriptSha256);
 assert.equal(part.annotations.length,rows.length);assert.equal(new Set(part.annotations.map(a=>a.line)).size,rows.length);lines+=rows.length;
 for(const a of part.annotations)assert.ok(['evidence','context','instruction','noise','distractor'].includes(a.role));
 assert.equal(part.cues.length,10);
 for(const [i,c] of part.cues.entries()){
  assert.equal(c.question,(part.part-1)*10+i+1);assert.ok(c.end>c.start&&c.end<part.duration);
  if(i)assert.ok(c.end>part.cues[i-1].end);
  assert.equal(c.end,times.lines[c.endLine].end);
  for(const e of c.evidence){assert.ok(rows[e.line].en.includes(e.quote),c.id+' exact evidence');assert.equal(e.revealAt,times.lines[e.line].end);assert.ok(e.revealAt<=c.end);spans++;}
  for(const d of c.distractors){assert.ok(rows[d.line].en.includes(d.quote));assert.ok(d.rejectAt>=d.candidateAt);assert.ok(d.rejectAt<=c.end);distractors++;}
  const q=content.parts[part.part-1].questions[i];assert.equal(c.answer.toLowerCase(),q.answer.toLowerCase());
  assert.equal(checkpointDue(part,{index:i,phase:'listening'},c.end-.01,true),false);
  assert.equal(checkpointDue(part,{index:i,phase:'listening'},c.end,true),true);
  assert.equal(checkpointDue(part,{index:i,phase:'listening'},c.end,false),false,'paused/seek does not award heard');
  assert.equal(checkpointDue(part,{index:i,phase:'typing'},c.end,true),false,'no duplicate writes');
  const replay=replayCue(part,i);assert.equal(replay.completed,i);assert.equal(replay.phase,'intro');assert.ok(replay.time<c.start);
  const back=rewindTo(part,{completed:10},Math.max(0,c.end-.1));assert.ok(back.completed<=i,'future notes removed');
 }
 const bigSeek=rewindTo(part,initialProgress(),99999);assert.equal(bigSeek.completed,0);assert.equal(bigSeek.time,part.cues[0].start,'large seek must hear current evidence');
 assert.equal(nextProgress(part,{phase:'typing'}).phase,'typing');
 assert.equal(nextProgress(part,{phase:'paused',completed:10,index:9}).phase,'done');
 const s=sanitizeSession({version:curation.version,practice:2,part:part.part,parts:{[part.part]:{completedIds:[part.cues[0].id,part.cues[2].id,'unknown'],drafts:{[part.cues[0].question]:'my independently written answer',999:'bad'}}}},curation);
 assert.deepEqual(s.parts[part.part].completedIds,[part.cues[0].id]);assert.equal(Object.keys(s.parts[part.part].drafts).length,1);
 assert.equal(progressFromSaved(part,s.parts[part.part]).time,part.cues[0].end);
}
assert.throws(()=>sanitizeSession({version:'old'},curation));
assert.deepEqual(annotationSegments('original words',[{quote:'not present',kind:'noise'}]),[{text:'original words',marks:[]}]);
assert.equal(curation.parts[0].cues[9].endLine,42,'Q10 waits for minimise it');
assert.equal(curation.parts[2].cues[2].endLine,17,'Q23 preserves uncertainty');
assert.equal(curation.parts[2].cues[8].endLine,61,'Q29 waits for final topic decision');
console.log(`IELTS curation: 40 checkpoints, ${lines} classified lines, ${spans} exact evidence spans, ${distractors} temporal distractor spans validated.`);
