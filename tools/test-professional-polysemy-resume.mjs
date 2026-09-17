import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {createPolysemyQuiz,mountPolysemyPage,highlightSentence} from '../professional-english/polysemy-practice.mjs';
import {flush,getCached} from '../professional-english/learning-state.mjs?v=20260916-idle1';
const require=createRequire(new URL('./email-qa/package.json',import.meta.url));const {JSDOM}=require('jsdom');
const lessons=[1,2,3].map(n=>JSON.parse(fs.readFileSync(new URL(`../professional-english/content/lesson-${n}-polysemy.json`,import.meta.url),'utf8')));
for(const data of lessons)for(const word of data.words){
 for(const question of word.questions)assert.ok(highlightSentence(word,question.en).includes('<mark>'),`target form highlighted: lesson ${data.lesson} ${question.id}`);
 const quiz=createPolysemyQuiz(word);
 const original=quiz.snapshot();assert.equal(createPolysemyQuiz(word,original).restored,true);
 for(const q of word.questions){assert.equal(quiz.state.question.id,q.id);quiz.answer(word.senses.find(s=>!(q.acceptedAnswers||[q.answer]).includes(s.id))?.id||q.answer);const saved=quiz.snapshot();const restored=createPolysemyQuiz(word,saved);assert.equal(restored.restored,true);assert.deepEqual(restored.state,quiz.state);quiz.next();}
 if(!quiz.state.complete){assert.equal(quiz.state.round,2);assert.equal(quiz.snapshot().queue.at(-1),word.questions.at(-1).id);}
 while(!quiz.state.complete){quiz.answer(quiz.state.question.answer);quiz.next();}
 assert.equal(quiz.state.correctCount,word.questions.length);assert.equal(createPolysemyQuiz(word,quiz.snapshot()).state.complete,true);
 for(const corrupt of [{...original,content:'old content'},{...original,queue:['unknown']},{...original,position:999},{...original,complete:true},{...original,correctAnswers:{unknown:'wrong'}},{...original,answered:true,selected:'unknown'}])assert.equal(createPolysemyQuiz(word,corrupt).restored,false);
 const changed=structuredClone(word);changed.questions[0].en+=' Changed.';assert.equal(createPolysemyQuiz(changed,original).restored,false,'changed content invalidates a stale snapshot');
}
// Accepted alternatives retain the canonical catalogue answer and never retry.
{
 const word=structuredClone(lessons[0].words[0]),question=word.questions[0],alternative=word.senses.find(s=>s.id!==question.answer).id;
 question.acceptedAnswers=[question.answer,alternative];const quiz=createPolysemyQuiz(word);assert.equal(quiz.answer(alternative),true);assert.equal(quiz.state.correctAnswers[question.id],question.answer);assert.equal(quiz.state.missed,0);
 const restored=createPolysemyQuiz(word,quiz.snapshot());assert.equal(restored.restored,true);assert.equal(restored.state.correct,true);assert.equal(restored.state.selected,alternative);
 quiz.next();while(!quiz.state.complete){quiz.answer(quiz.state.question.answer);quiz.next();}assert.equal(quiz.state.round,1);
}
const dom=new JSDOM('<body></body>',{url:'https://edmundeducation.com/professional-english/polysemy.html?lesson=1',pretendToBeVisual:true}),w=dom.window;
for(const key of ['window','document','localStorage','history','location','navigator','CustomEvent','innerHeight','innerWidth'])Object.defineProperty(globalThis,key,{value:w[key],configurable:true});
w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=function(){};
const alice={token:'alice',user:{id:'alice'}},bob={token:'bob',user:{id:'bob'}};
localStorage.setItem('special-flash-session-v1',JSON.stringify(alice));let allowLeave=false,confirmations=0;
globalThis.confirm=()=>{confirmations++;return allowLeave;};
const cloud=new Map(),credited=new Map(),requests=[];
globalThis.fetch=async(url,options)=>{
 const body=JSON.parse(options.body);requests.push(body);let value=null;
 if(url.endsWith('special_flash_learning_state')){
  const key=body.p_token+':'+body.p_key;
  if(Object.hasOwn(body,'p_value'))cloud.set(key,structuredClone(body.p_value));value=cloud.get(key)??null;
 }else if(url.endsWith('special_flash_activity')){
  for(const e of body.p_events)if(e.kind==='polysemy'&&!e.item.startsWith('time:'))credited.set(body.p_token+':'+e.exercise+':'+e.attempt+':'+e.item,e);
  value={accepted:body.p_events.length};
 }
 return {ok:true,json:async()=>value};
};
const word=lessons[0].words[0],key=`draft:poly:lesson-1:${word.id}`;
let mounted=mountPolysemyPage({data:lessons[0]});await mounted.ready;
mounted.page.querySelector(`[data-poly-word="${word.id}"]`).click();await mounted.ready;
const clickAnswer=id=>mounted.page.querySelector(`[data-poly-answer="${id}"]`).click();
const next=()=>mounted.page.querySelector('[data-poly-next]').click();
clickAnswer(word.questions[0].answer);await flush();assert.equal(credited.size,1,'first question earns credit before word completion');assert.equal(mounted.page.querySelector('progress#poly-word-progress').value,1);next();
const wrong=word.senses.find(s=>s.id!==word.questions[1].answer).id;clickAnswer(wrong);
assert.ok(mounted.page.querySelector(`[data-poly-answer="${word.questions[1].answer}"]`).classList.contains('is-correct'),'correct answer green after wrong selection');
assert.ok(mounted.page.querySelector(`[data-poly-answer="${wrong}"]`).classList.contains('is-wrong'));next();
assert.match(mounted.page.querySelector('.poly-toolbar').textContent,/3 \/ 6/);
const attempt=getCached(key).attempt;
const unload=new w.Event('beforeunload',{cancelable:true});w.dispatchEvent(unload);assert.equal(unload.defaultPrevented,true);
mounted.page.querySelector('[data-poly-list]').click();assert.ok(mounted.page.querySelector('.poly-question'),'cancel stays in quiz');assert.equal(confirmations,1);
allowLeave=true;mounted.page.querySelector('[data-poly-list]').click();assert.ok(mounted.page.querySelector('.poly-word-grid'));assert.equal(getCached(key).quiz.position,2);
mounted.page.querySelector(`[data-poly-word="${word.id}"]`).click();await mounted.ready;assert.match(mounted.page.querySelector('.poly-toolbar').textContent,/3 \/ 6/);assert.equal(getCached(key).attempt,attempt);
const thirdWrong=word.senses.find(s=>s.id!==word.questions[2].answer).id;clickAnswer(thirdWrong);await flush();mounted.destroy();
// Simulate another device: preserve login, discard device cache, restore from RPC.
for(const k of Object.keys(localStorage))if(k!=='special-flash-session-v1')localStorage.removeItem(k);
mounted=mountPolysemyPage({data:lessons[0]});await mounted.ready;
assert.match(mounted.page.querySelector('.poly-toolbar').textContent,/3 \/ 6/);assert.equal(getCached(key).attempt,attempt);
assert.equal(mounted.page.querySelectorAll('[data-poly-answer]:disabled').length,word.senses.length);
assert.ok(mounted.page.querySelector(`[data-poly-answer="${thirdWrong}"]`).classList.contains('is-wrong'));assert.ok(mounted.page.querySelector(`[data-poly-answer="${word.questions[2].answer}"]`).classList.contains('is-correct'));
next();let sawRetry=false;
while(!mounted.page.querySelector('.poly-complete')){
 const sentence=mounted.page.querySelector('.poly-sentence').textContent;const question=word.questions.find(q=>q.en===sentence);assert.ok(question);
 if(mounted.page.querySelector('.poly-toolbar').textContent.includes('第 2 輪'))sawRetry=true;
 clickAnswer(question.answer);next();
}
assert.equal(sawRetry,true);await flush();assert.equal(credited.size,word.questions.length);assert.equal([...credited.values()][0].exercise,`lesson-1:${word.id}`);assert.deepEqual(new Set([...credited.values()].map(e=>e.item)),new Set(word.questions.map(q=>q.id)));
assert.equal(mounted.page.querySelector('progress').value,word.questions.length);mounted.page.querySelector('[data-poly-list]').click();
assert.ok(mounted.page.querySelector(`[data-poly-word="${word.id}"].is-complete .poly-tile-check`));
await mounted.openWord(word.id);assert.ok(mounted.page.querySelector('.poly-complete'),'completed selection shows results, not a new attempt');
mounted.page.querySelector('[data-poly-redo]').click();await mounted.ready;assert.notEqual(getCached(key).attempt,attempt);assert.equal(mounted.page.querySelector('progress#poly-word-progress').value,0);
// Browser Back cancellation keeps the word URL; confirmation saves then leaves.
allowLeave=false;const current=location.href;history.replaceState(null,'','?lesson=1');w.dispatchEvent(new w.PopStateEvent('popstate'));assert.equal(location.href,current);assert.ok(mounted.page.querySelector('.poly-question'));
allowLeave=true;history.replaceState(null,'','?lesson=1');w.dispatchEvent(new w.PopStateEvent('popstate'));assert.ok(mounted.page.querySelector('.poly-word-grid'));mounted.destroy();
// Lesson-specific IDs, cloud keys and source context. Complete one full word each.
for(const lesson of [2,3]){
 history.replaceState(null,'',`?lesson=${lesson}`);const data=lessons[lesson-1];mounted=mountPolysemyPage({data});await mounted.ready;assert.match(mounted.page.textContent,new RegExp(`LESSON ${lesson}`));
 const selected=data.words[0];await mounted.openWord(selected.id);
 for(const question of selected.questions){clickAnswer(question.answer);next();}
 await flush();assert.ok([...credited.values()].some(e=>e.exercise===`lesson-${lesson}:${selected.id}`));assert.ok(cloud.has(`alice:draft:poly-complete:lesson-${lesson}:${selected.id}`));mounted.destroy();
}
// Old Lesson 1 completion records remain visible without awarding them again.
const legacy=lessons[0].words.at(-1);cloud.set(`alice:draft:poly-complete:${legacy.id}`,{completedAt:1234,rounds:1});
history.replaceState(null,'','?lesson=1');mounted=mountPolysemyPage({data:lessons[0]});await mounted.ready;assert.ok(mounted.page.querySelector(`[data-poly-word="${legacy.id}"].is-complete`));
const before=credited.size;await mounted.openWord(legacy.id);assert.ok(mounted.page.querySelector('.poly-complete'));await flush();assert.equal(credited.size,before);
// Switching accounts while a question is open cannot write the previous attempt.
mounted.page.querySelector('[data-poly-redo]').click();await mounted.ready;localStorage.setItem('special-flash-session-v1',JSON.stringify(bob));
mounted.page.querySelector('[data-poly-answer]').click();w.dispatchEvent(new w.Event('pagehide'));mounted.destroy();assert.equal(Object.keys(localStorage).filter(k=>k.startsWith('professional-learning-v2:bob:')).length,0);
w.close();
console.log('Passed: all three lessons; valid/stale/corrupt snapshots; exact question, selection, missed-round and UUID resume; cloud/device resume; leave/back/unload guards; green correct answers; unique-question progress; one score per correct question; explicit redo; legacy completion fallback; account isolation.');
