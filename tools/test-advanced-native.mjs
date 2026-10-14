import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import lessons from '../natural-english/advanced-expressions.mjs';
import {modules,moduleMap,allQuestionMap} from '../natural-english/catalogue.mjs';
import {audioManifest} from '../natural-english/audio/manifest.mjs';

const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const portal=fs.readFileSync(path.join(root,'advanced-native.html'),'utf8');
const app=fs.readFileSync(path.join(root,'natural-english/app.mjs'),'utf8');
assert.equal(lessons.length,5);
assert.deepEqual(lessons.map(m=>m.titleEn),[
  'stay in their comfort zone','coast along','wake-up call',
  'life throws them in at the deep end','the making of a person'
]);
assert.ok(html.includes('href="advanced-native.html"'));
assert.ok(html.includes('Advanced Native<br>進階學生使用<br>高級自然英文<br>學習系統'));
assert.ok(!html.includes('card-74.webp'),'Card 74 stays image-free for now');
assert.ok(portal.includes('data-course="advanced-native"'));
assert.ok(portal.includes('advanced-native/style.css'));
assert.ok(app.includes('visibleModules=modules.filter'));
assert.ok(app.includes('if(!m||!inThisCourse(id))return'));
assert.equal(modules.filter(m=>m.course==='advanced-native').length,5);

const seen=new Set();
for(const lesson of lessons){
  assert.equal(moduleMap.get(lesson.id)?.id,lesson.id);
  assert.equal(lesson.steps.length,7);
  assert.equal(lesson.questions.length,6);
  assert.equal(lesson.steps[1].style,'reply');
  assert.equal(lesson.questions[1].allCorrect,true);
  assert.equal(lesson.questions[1].answers.length,4);
  assert.ok(lesson.questions[1].options.includes(lesson.questions[1].golden));
  assert.ok(lesson.steps.some(s=>s.recording==='phrase'&&s.displayModel.includes('__________________')));
  assert.equal(lesson.steps[0].audioOnly,true);
  assert.ok(lesson.steps[0].model.length>20);
  assert.ok(lesson.steps.some(s=>s.recording==='phrase'&&s.speakingPrompt));
  assert.equal(lesson.steps.at(-1).questions.length,1);
  assert.equal(lesson.questions.at(-1).type,'open');
  for(const q of lesson.questions){
    assert.ok(!seen.has(q.id),`Duplicate question ${q.id}`);seen.add(q.id);
    assert.equal(allQuestionMap.get(q.id),q);
    assert.ok(q.explanation&&q.answers.length);
    if(q.type==='mc'){
      assert.equal(q.options.length,new Set(q.options).size);
      assert.ok(q.options.includes(q.answers[0]));
    }else assert.ok(q.answers.length>=2);
  }
  const texts=[...new Set([...lesson.steps.map(s=>s.model).filter(Boolean),...lesson.takeaways])];
  assert.equal(Object.keys(audioManifest[lesson.id]).length,texts.length);
  for(const text of texts){
    const url=audioManifest[lesson.id][text];
    assert.ok(url,`Missing audio for ${lesson.id}: ${text}`);
    assert.ok(fs.statSync(path.join(root,url)).size>1800,`Empty audio ${url}`);
  }
}
assert.equal(lessons[0].steps.find(s=>s.style==='speak').displayModel,'__________________ until I joined the debate club.');
assert.equal(seen.size,30);
console.log('Advanced Native: Card 74, five isolated modules, 30 questions, five golden replies, 20 local clips verified.');
