import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import lesson007 from '../natural-english/lesson-007.mjs';
import lesson008 from '../natural-english/lesson-008.mjs';
import lesson009 from '../natural-english/lesson-009.mjs';
import lesson010 from '../natural-english/lesson-010.mjs';
import lesson011 from '../natural-english/lesson-011.mjs';
import lesson012 from '../natural-english/lesson-012.mjs';
import lesson014 from '../natural-english/lesson-014.mjs';
import lesson016 from '../natural-english/lesson-016.mjs';
import lesson017 from '../natural-english/lesson-017.mjs';
import lesson018 from '../natural-english/lesson-018.mjs';
import {audioManifest} from '../natural-english/audio/manifest.mjs';
import {plan} from './plan-native-english-redesign.mjs';

for(const [number,draft] of [[7,lesson007],[8,lesson008],[9,lesson009],[10,lesson010],[11,lesson011],[12,lesson012],[14,lesson014],[16,lesson016],[17,lesson017],[18,lesson018]]){
  const allocation=plan().rows.find(row=>row.number===number);
  const lessonId=`native-${String(number).padStart(3,'0')}`;
  const questionIds=new Set(draft.questions.map(question=>question.id));
  const stepQuestionIds=draft.steps.flatMap(step=>step.questions);
  assert.equal(draft.revision,2,lessonId);
  assert.ok(draft.steps.length>=5&&draft.steps.length<=6,lessonId);
  assert.equal(questionIds.size,draft.questions.length,lessonId);
  assert.deepEqual(new Set(stepQuestionIds),questionIds,lessonId);
  assert.deepEqual(new Set(draft.steps.map(step=>step.style)),new Set(allocation.styles),lessonId);
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
console.log('PASS: ten editorial drafts have five or six distinct styles, new progress IDs, no prompt/hint answer leaks, and existing model audio.');
