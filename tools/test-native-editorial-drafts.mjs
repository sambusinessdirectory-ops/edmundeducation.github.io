import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {audioManifest} from '../natural-english/audio/manifest.mjs';
import {authored,plan} from './plan-native-english-redesign.mjs';

const allocations=plan().rows.filter(row=>row.status==='draft-needs-editorial-review');
assert.equal(allocations.length,authored.size);
const answerPositions=[0,0,0,0];
for(const allocation of allocations){
  const number=allocation.number;
  const draft=(await import(new URL(`../natural-english/lesson-${String(number).padStart(3,'0')}.mjs`,import.meta.url))).default;
  const lessonId=`native-${String(number).padStart(3,'0')}`;
  const questionIds=new Set(draft.questions.map(question=>question.id));
  const stepQuestionIds=draft.steps.flatMap(step=>step.questions);
  assert.equal(draft.revision,2,lessonId);
  assert.ok(draft.steps.length>=5&&draft.steps.length<=6,lessonId);
  assert.equal(questionIds.size,draft.questions.length,lessonId);
  assert.equal(stepQuestionIds.length,questionIds.size,lessonId+' repeats a question');
  assert.deepEqual(new Set(stepQuestionIds),questionIds,lessonId);
  assert.deepEqual(new Set(draft.steps.map(step=>step.style)),new Set(allocation.styles),lessonId);
  assert.ok(draft.steps.every(step=>step.questions.length||step.recording),lessonId+' has an empty step');
  assert.ok(draft.steps.some(step=>step.style==='audio'&&step.audioOnly&&step.model),lessonId+' needs concealed listening');
  if(draft.steps.some(step=>step.style==='speak'))assert.ok(draft.steps.some(step=>step.speakingPrompt&&step.recording),lessonId);
  if(draft.steps.some(step=>step.style==='final'))assert.ok(draft.steps.some(step=>step.style==='final'&&step.questions.length),lessonId);
  for(const question of draft.questions){
    assert.match(question.id,new RegExp('^'+lessonId+'-v2-'));
    assert.ok(allocation.styles.includes(question.style),question.id);
    assert.ok(question.answers.every(answer=>answer.trim()),question.id);
    assert.ok(!question.answers.some(answer=>answer.length>10&&question.prompt.includes(answer)),question.id+' prompt leaks an answer');
    assert.ok(!question.answers.some(answer=>answer.length>10&&question.hint?.includes(answer)),question.id+' hint leaks an answer');
    if(question.type==='mc'){
      assert.ok(question.options.includes(question.answers[0]),question.id);
      assert.equal(new Set(question.options).size,question.options.length,question.id);
      if(question.options.length===4)answerPositions[question.options.indexOf(question.answers[0])]++;
    }else assert.equal(question.type,'blank',question.id);
  }
  for(const model of new Set([...draft.steps.map(step=>step.model).filter(Boolean),...draft.takeaways])){
    const path=audioManifest[lessonId]?.[model];
    assert.ok(path,'missing prerecording for '+model);
    const bytes=fs.readFileSync(new URL('../'+path,import.meta.url));
    assert.ok(bytes.length>1800);
    assert.match(createHash('sha256').update(bytes).digest('hex'),/^[0-9a-f]{64}$/);
  }
}
if(answerPositions.reduce((a,b)=>a+b,0)>=20)assert.ok(answerPositions.every(count=>count>=3),'answer positions must be distributed across A–D');
console.log(`PASS: ${allocations.length} editorial drafts have five or six distinct styles, new progress IDs, no prompt/hint answer leaks, and existing model audio.`);
