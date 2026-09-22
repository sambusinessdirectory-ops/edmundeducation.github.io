import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {createPolysemyQuiz,mountPolysemyPage} from '../professional-english/polysemy-practice.mjs';
import {mountDialoguePage,translationsText} from '../professional-english/dialogue-practice.mjs';
const require=createRequire(new URL('./email-qa/package.json',import.meta.url));const {JSDOM}=require('jsdom');
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const data=JSON.parse(read('professional-english/content/lesson-1-polysemy.json'));
assert.equal(data.words.length,16);assert.equal(data.words.reduce((n,w)=>n+w.questions.length,0),92);
for(const word of data.words){
 assert.equal(word.questions.at(-1).kind,'passage');assert.equal(word.questions.filter(q=>q.kind==='passage').length,1);
 assert.equal(new Set(word.senses.map(s=>s.id)).size,word.senses.length);
 assert.equal(new Set(word.senses.map(s=>s.zh)).size,word.senses.length);
 for(const q of word.questions){assert.ok(q.en&&q.zh&&q.zhMasked.includes('____'));assert.notEqual(q.zh,q.zhMasked);assert.ok(word.senses.some(s=>s.id===q.answer));}
 for(const s of word.senses)assert.ok(word.questions.some(q=>q.answer===s.id),'every meaning is exercised');
 const quiz=createPolysemyQuiz(word);assert.equal(quiz.next(),false);assert.equal(quiz.answer('invalid'),null);
 // Miss an example and the final passage. Only these return, in source order.
 const misses=[word.questions[0].id,word.questions.at(-1).id];
 while(quiz.state.round===1&&!quiz.state.complete){const q=quiz.state.question;const answer=misses.includes(q.id)?word.senses.find(s=>s.id!==q.answer).id:q.answer;assert.equal(quiz.answer(answer),!misses.includes(q.id));assert.equal(quiz.answer(q.answer),null);quiz.next();}
 assert.equal(quiz.state.round,2);assert.equal(quiz.state.total,2);assert.equal(quiz.state.question.id,misses[0]);
 quiz.answer(quiz.state.question.answer);quiz.next();assert.equal(quiz.state.question.kind,'passage');
 quiz.answer(word.senses.find(s=>s.id!==quiz.state.question.answer).id);quiz.next();assert.equal(quiz.state.round,3);assert.equal(quiz.state.total,1);
 quiz.answer(quiz.state.question.answer);quiz.next();assert.equal(quiz.state.complete,true);
}
const dom=new JSDOM('<body><div id="root"><section class="course-section"><div class="learning-panel"></div><div class="learning-panel learning-panel--future"></div><div class="team-effort"></div><div class="course-dashboards"></div></section></div></body>',{url:'https://edmundeducation.com/professional-english/polysemy.html',runScripts:'outside-only',pretendToBeVisual:true});const w=dom.window;
for(const key of ['window','document','localStorage','history','location','navigator','CustomEvent','innerHeight','innerWidth'])Object.defineProperty(globalThis,key,{value:w[key],configurable:true});
w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=function(){};
w.localStorage.setItem('special-flash-session-v1',JSON.stringify({token:'fixture',user:{id:'qa-one'}}));
globalThis.fetch=async()=>({ok:true,json:async()=>null});globalThis.confirm=()=>true;
const mounted=mountPolysemyPage({data});await mounted.ready;const {page}=mounted;assert.equal(page.querySelectorAll('[data-poly-word]').length,16);
page.querySelector('[data-poly-word="listed"]').click();await mounted.ready;const first=data.words[0].questions[0];
assert.ok(page.querySelector('.poly-translation').textContent.includes('____'));assert.ok(!page.querySelector('.poly-translation').textContent.includes('列了出來'));
assert.equal(page.querySelectorAll('[data-poly-answer]').length,5);page.querySelector('[data-poly-answer="listed-1"]').click();assert.match(page.querySelector('.poly-feedback').textContent,/下一輪/);assert.equal(page.querySelectorAll('[data-poly-answer]:disabled').length,5);
page.querySelector('[data-poly-next]').click();assert.equal(page.querySelectorAll('[data-poly-answer]:disabled').length,0);
page.querySelector('[data-poly-list]').click();page.querySelector('[data-poly-word="grant"]').click();await mounted.ready;const word=data.words.find(w=>w.id==='grant');
for(const q of word.questions){page.querySelector(`[data-poly-answer="${q.answer}"]`).click();assert.equal(page.querySelector('.poly-feedback').textContent,`答對了！${q.zh}`);page.querySelector('[data-poly-next]').click();}
assert.ok(page.querySelector('.poly-complete'));assert.ok(JSON.parse(localStorage.getItem('professional-polysemy-v1:qa-one:lesson-1')).grant);
localStorage.setItem('special-flash-session-v1',JSON.stringify({token:'fixture',user:{id:'qa-two'}}));const second=mountPolysemyPage({data});assert.match(second.page.querySelector('.poly-progress').textContent,/0 \/ 16/);
const all=JSON.parse(read('professional-english/dialogues.json'));const dialogues=all.dialogues.filter(d=>d.lesson===3);assert.equal(dialogues.length,8);assert.equal(dialogues.reduce((n,d)=>n+d.lines.length,0),80);
const manifest=JSON.parse(read('professional-english/dialogue-audio.json'));
for(const d of dialogues){assert.equal(d.lines.length,10);for(const [i,line] of d.lines.entries()){
 assert.equal(line.voice,line.role==='Tenant'?'british-male':'american-female');assert.ok(line.en&&line.zh);assert.ok(!line.en.includes('_'));
 const clip=manifest[`${d.id}:${i}`];assert.equal(clip.voice,line.voice);assert.equal(clip.sourceSha256,createHash('sha256').update(line.en).digest('hex'));assert.ok(clip.duration>0);assert.ok(fs.statSync(new URL('../professional-english/'+clip.path,import.meta.url)).size>256);
}}
assert.match(translationsText(dialogues[0]),/租戶：/);assert.match(translationsText(dialogues[0]),/保安／客戶服務主任：/);
history.replaceState(null,'','dialogue.html?id=l3d4-professional');const dpage=mountDialoguePage({dialogues:all.dialogues,audioManifest:manifest});await dpage.ready;assert.match(dpage.page.textContent,/租戶 · Tenant/);assert.match(dpage.page.textContent,/主任 · Officer/);assert.equal(dpage.page.querySelector('[data-play-all]').disabled,false);dpage.stop();w.dispatchEvent(new w.Event('pagehide'));
const cards=JSON.parse(read('professional-english/content/lesson-3-flashcards.json'));const cm=JSON.parse(read('professional-english/content/lesson-3-audio.json'));
assert.equal(cards.length,113);assert.equal(new Set(cards.map(c=>c.id)).size,113);assert.equal(cm.recipe.voice,'af_heart');assert.equal(cm.recipe.speed,.96);
for(const c of cards){assert.equal(c.examples.length,5);assert.equal(c.examples_zh.length,5);const clip=cm.clips[c.id];assert.equal(clip.sourceSha256,createHash('sha256').update(c.front).digest('hex'));assert.ok(clip.duration>0);assert.ok(fs.statSync(new URL('../professional-english/'+clip.path,import.meta.url)).size>256);}
const lesson2=JSON.parse(read('professional-english/content/lesson-2-flashcards.json'));const lesson2Audio=JSON.parse(read('professional-english/content/lesson-2-audio.json'));assert.equal(lesson2.length,50);assert.equal(lesson2Audio.recipe.voice,'af_heart');for(const card of lesson2){assert.equal(card.examples.length,3);assert.equal(card.examples_zh.length,3);assert.ok(lesson2Audio.clips[card.id].duration>0);assert.equal(lesson2Audio.clips[card.id].sourceSha256,createHash('sha256').update(card.front).digest('hex'));assert.ok(fs.statSync(new URL('../professional-english'+card.audio,import.meta.url)).size>256);}
const observers=[];const NativeObserver=w.MutationObserver;w.MutationObserver=class extends NativeObserver{constructor(cb){super(cb);observers.push(this);}};
w.EDMUND_PROFESSIONAL_DIALOGUES=all.dialogues;w.eval(read('professional-english/professional-enhancements.js'));
const course=w.document.querySelector('.course-section');assert.equal(course.querySelectorAll('.pro-lesson-card').length,4);assert.equal(course.querySelectorAll('a[href*="id=l3"]').length,8);assert.equal(course.querySelector('.learning-panel--future').nextElementSibling.className,'learning-panel learning-panel--polysemy learning-panel--practice-glow');
assert.equal(course.querySelectorAll('a[href="./polysemy.html"]').length,1);
assert.equal(course.querySelectorAll('[data-poly-lesson]').length,4);assert.equal(course.querySelectorAll('a[href="./polysemy.html?lesson=2"]').length,1);assert.equal(course.querySelectorAll('a[href="./polysemy.html?lesson=3"]').length,1);assert.equal(course.querySelectorAll('a[href="./polysemy.html?lesson=4"]').length,1);
const pairedTables=course.querySelectorAll('.pro-dialogue-table');assert.equal(pairedTables.length,3);assert.deepEqual([...pairedTables].map(table=>table.querySelectorAll('tbody tr').length),[3,4,3]);for(const table of pairedTables)for(const row of table.querySelectorAll('tbody tr'))assert.equal(row.querySelectorAll('td a').length,2);
console.log('Passed: 113 bilingual flashcards + audio, 8 dialogues/80 role-specific clips + Lesson 4, 16 words/92 questions, retry rounds, final passages, masked translations, account-isolated completion and course navigation.');await new Promise(r=>setTimeout(r,40));observers.forEach(o=>o.disconnect());w.close();
