import assert from 'node:assert/strict';
import fs from 'node:fs';
import {modules,allQuestionMap,loadModule,selectModule,isCorrectAnswer,isCorrectEvent,summary,replay,dailyAnswers,orderedOptions} from '../polysemy-lab/core.mjs';
const report=JSON.parse(fs.readFileSync(new URL('./polysemy-fairness/report.json',import.meta.url)));
const repairs=new Map(report.changedAnswers.map(x=>[x.question,x]));
let count=0,changed=0;const ids=new Set();
for(const indexed of [...modules]){
 const compact=new Map(indexed.questions.map(q=>[q.id,{...q}]));
 const m=await loadModule(indexed.id);const labels=new Map([...m.senses,...m.mcqMeanings||[]].map(s=>[s.id,s.title]));
 for(const q of m.questions){
  count++;assert.ok(!ids.has(q.id));ids.add(q.id);
  assert.ok(q.en&&q.zh&&q.masked,'complete sentence/translation: '+q.id);
  assert.ok(q.options.length>=2&&q.options.length<=(m.id==='show'?6:4),q.id);
  assert.equal(new Set(q.options).size,q.options.length,q.id);
  assert.equal(q.options.filter(id=>isCorrectAnswer(q,id)).length,1,q.id+' must have exactly one graded choice');
  assert.equal(new Set(q.options.map(id=>labels.get(id))).size,q.options.length,q.id+' duplicate meaning');
  for(const id of q.options){assert.ok(labels.get(id),q.id+' missing label '+id);assert.doesNotMatch(labels.get(id),/[；;]\s*例句[：:]/);}
  assert.deepEqual(new Set(orderedOptions(q)),new Set(q.options));
  if(indexed.mass){assert.equal(compact.get(q.id).correctOption,q.correctOption);assert.equal(compact.get(q.id).previousCorrectOption,q.previousCorrectOption);assert.equal(compact.get(q.id).answerRevisedAt,q.answerRevisedAt);}
  if(q.previousCorrectOption){
   changed++;assert.equal(repairs.get(q.id).answer,q.correctOption);
   const old={kind:'answer',module:m.id,question:q.id,choice:q.previousCorrectOption,run:'historical',round:1,at:new Date(Date.parse(q.answerRevisedAt)-1).toISOString()};
   assert.ok(isCorrectEvent(q,old));assert.ok(!isCorrectAnswer(q,old.choice));assert.ok(!isCorrectEvent(q,{...old,at:q.answerRevisedAt}));assert.ok(isCorrectEvent(q,{...old,at:q.answerRevisedAt,correct:true}),'persisted server credit must survive a key correction');
   selectModule(m.id);assert.ok(summary([old]).mastered.has(q.id));assert.equal(dailyAnswers([old])[0].correct,1);
  }
 }
}
assert.equal(modules.length,1089);assert.equal(count,48033);assert.equal(changed,report.changedAnswers.length);
const spend=await loadModule('spend');const labels=new Map([...spend.senses,...spend.mcqMeanings||[]].map(s=>[s.id,s.title]));
for(const text of ['strength','three weeks','too much money','months working','a lot of energy']){
 const q=spend.questions.find(q=>q.en.includes(text));assert.ok(q,text);
 const label=labels.get(q.correctOption||q.sense);
 assert.match(label,text.includes('money')?/金錢|花錢/:text.includes('weeks')||text.includes('months')?/時間/:/體力|精力/);
 console.log(q.id,q.en,JSON.stringify(q.options.map(id=>labels.get(id))));
}
selectModule('spend');const run='test-run';const events=[{id:'start',kind:'start',module:'spend',run,at:new Date().toISOString()}];let failed,returned=-1;
for(let i=0;i<spend.questions.length+20;i++){
 const s=replay(events);if(s.complete)break;const q=s.question;if(i===0)failed=q.id;else if(q.id===failed&&s.review)returned=i;
 events.push({id:String(i),kind:'answer',module:'spend',run,round:s.round,question:q.id,choice:i===0?q.options.find(id=>!isCorrectAnswer(q,id)):(q.correctOption||q.sense),at:new Date(Date.now()+i+1).toISOString()});
}
assert.ok([6,7].includes(returned));assert.ok(replay(JSON.parse(JSON.stringify(events))).complete);assert.equal(summary(events).mastered.size,spend.questions.length);
console.log(`PASS: ${modules.length} modules, ${count} questions, ${changed} corrected keys; choices, lazy/full parity, historical credit, new grading and retry/resume.`);
