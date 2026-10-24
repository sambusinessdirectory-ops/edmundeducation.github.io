import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import {createRequire} from 'node:module';
import {modules,moduleMap,allQuestionMap,correct,completed,daily,hydrateModule} from '../natural-english/catalogue.mjs';
await Promise.all(modules.filter(module=>module.advancedLazy).map(module=>hydrateModule(module.id)));
const root=new URL('../',import.meta.url),manifest=JSON.parse(fs.readFileSync(new URL('../natural-english/audio/modules-2-6.json',import.meta.url),'utf8'));
const nativeModules=modules.filter(m=>m.course!=='advanced-native');assert.equal(nativeModules.length,466);assert.deepEqual(nativeModules.slice(0,6).map(m=>m.number),[1,2,3,4,5,6]);assert.equal(new Set(modules.map(m=>m.id)).size,modules.length);assert.equal(new Set(modules.flatMap(m=>m.questions.map(q=>q.id))).size,modules.reduce((n,m)=>n+m.questions.length,0));
for(const m of modules){assert.ok(m.steps.length>=5&&m.steps.length<=8,m.id);assert.deepEqual(new Set(m.steps.flatMap(s=>s.questions)),new Set(m.questions.map(q=>q.id)),m.id);assert.ok(m.questions.every(q=>q.answers.length&&['mc','blank','open'].includes(q.type)),m.id);}
assert.equal(nativeModules.slice(6).reduce((n,m)=>n+m.questions.length,0),2223);assert.ok(correct(moduleMap.get('flat').questionMap.get('flat-final'),"  It’s   flat. "));assert.ok(correct(moduleMap.get('flat').questionMap.get('flat-final'),"It's flat"),'terminal punctuation is optional');
const cycle=['american-female','british-male','british-female'];for(const m of modules.slice(1,6)){const rows=Object.values(manifest[m.id]);assert.ok(rows.length>=3,m.id);rows.forEach((r,i)=>{assert.equal(r.voice,cycle[i%3],m.id+' '+i);const file=new URL('../'+r.path,import.meta.url);assert.ok(fs.statSync(file).size>10000,r.path);});}
const html=fs.readFileSync(new URL('../natural-english.html',import.meta.url),'utf8'),app=fs.readFileSync(new URL('../natural-english/app.mjs',import.meta.url),'utf8');assert.match(html,/data-module-grid/);assert.doesNotMatch(html,/選擇一課，走進真實生活情境/);assert.match(html,/data-library-view/);assert.match(html,/data-lesson-view hidden/);assert.match(app,/natural_english_modules_sync/);assert.match(app,/natural_english_modules_recording/);assert.doesNotMatch(html,/data-module="box"/,'cards are generated after login, without lesson content at the bottom');assert.doesNotMatch(app,/esc\(m\.kicker\)/,'module cards omit category copy');assert.doesNotMatch(app,/課 · \$\{m\.kicker\}/,'lesson heading omits category copy');assert.doesNotMatch(app,/This soda is flat\. Oh, sorry about that\./);
const require=createRequire(new URL('./email-qa/package.json',import.meta.url)),{PGlite}=require('@electric-sql/pglite'),db=new PGlite();
await db.exec(`create role anon;create role authenticated;create schema auth;create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;create table flashcard_students(id uuid primary key);create table flashcard_student_sessions(token uuid primary key,student_id uuid references flashcard_students(id),expires_at timestamptz);create function flashcard_session_student_id(uuid) returns uuid language sql as $$select student_id from public.flashcard_student_sessions where token=$1 and expires_at>now()$$;`);
for(const f of ['20260917075707_natural_english_scoop.sql','20260917112016_natural_english_recordings_hk.sql','20260918173500_natural_english_modules_2_6.sql','20260928160000_natural_english_imported_lessons.sql','20260928233000_native_english_lesson_102_revision_2.sql','20260929043000_natural_english_open_review.sql','20260929050000_native_english_redesign_catalogue.sql','20261014194500_advanced_native_expressions.sql','20261014213000_advanced_native_revision_2.sql','20261014222500_advanced_native_progress_compatibility.sql','20261015112057_advanced_native_lessons_06_10.sql','20261016063303_advanced_native_catalogue_choices.sql','20261016080000_advanced_native_full_catalogue.sql',...fs.readdirSync(new URL('../supabase/migrations/',import.meta.url)).filter(f=>/^\d{14}_advanced_native_full_catalogue_\d+\.sql$/.test(f)).sort(),'20261024103554_advanced_native_books10_16_730_assessment.sql'])await db.exec(fs.readFileSync(new URL('../supabase/migrations/'+f,import.meta.url),'utf8'));
// A local bulk preview can test its pending data import before a migration is
// published. CI supplies no override and must match committed migrations.
if(process.env.ADVANCED_NATIVE_PREVIEW_SQL)await db.exec(fs.readFileSync(process.env.ADVANCED_NATIVE_PREVIEW_SQL,'utf8'));
assert.equal((await db.query('select count(*)::int n from natural_english_private.catalogue')).rows[0].n,modules.length);
const student=crypto.randomUUID(),other=crypto.randomUUID(),token=crypto.randomUUID(),token2=crypto.randomUUID();await db.query('insert into flashcard_students values($1),($2)',[student,other]);await db.query("insert into flashcard_student_sessions values($1,$2,now()+interval '1 day'),($3,$4,now()+interval '1 day')",[token,student,token2,other]);await db.query("select set_config('request.jwt.claim.sub',$1,false)",[crypto.randomUUID()]);
const event=x=>({id:crypto.randomUUID(),at:new Date().toISOString(),...x}),run=crypto.randomUUID();const sync=async(t,ev=[])=>(await db.query('select natural_english_modules_sync($1,$2) result',[t,JSON.stringify(ev)])).rows[0].result;
await sync(token,[event({module:'box',kind:'start',run})]);const correctEvent=event({module:'box',kind:'answer',run,round:1,question:'box-spot',choice:'Can I get a box?'});let result=await sync(token,[correctEvent]);assert.equal(result.events.find(e=>e.id===correctEvent.id).correct,true);assert.equal((await sync(token2)).events.length,0);
await assert.rejects(sync(token,[event({module:'flat',kind:'answer',run,round:1,question:'flat-spot',choice:"It's flat."})]),/Unknown practice run/);await assert.rejects(sync(token,[event({module:'box',kind:'answer',run,round:1,question:'box-spot',choice:'forged'})]),/Invalid answer/);
// Registered MC wording can exceed the old 160-character blank-answer limit.
// Membership remains exact; long forged choices and oversized free text still fail.
await db.exec('begin');
const longCorrect='This registered answer explains the distinction using enough context to preserve the original scope, rather than shortening the choice and accidentally changing its meaning. '+ 'It remains a catalogue-defined multiple-choice option.';
const longWrong='This registered alternative intentionally expresses the wrong interpretation while remaining a real, selectable catalogue choice, so the server must save it as incorrect. '+ 'It is also longer than the historical blank-answer limit.';
assert.ok(longCorrect.length>160&&longWrong.length>160);
await db.query("update natural_english_private.catalogue set questions=questions || $1::jsonb where module='box'",[JSON.stringify({'box-long-mc':{type:'mc',answers:[longCorrect],options:[longCorrect,longWrong]},'box-length-blank':{type:'blank',answers:['short']},'box-length-open':{type:'open',answers:['self-reviewed']}})]);
for(const [i,[choice,expected]] of [[longCorrect,true],[longWrong,false]].entries()){
 const answer=event({module:'box',kind:'answer',run,round:i+1,question:'box-long-mc',choice});
 assert.equal((await sync(token,[answer])).events.find(e=>e.id===answer.id).correct,expected,'Registered long MC choices retain server/client grading parity');
}
for(const [question,choice] of [['box-long-mc',longCorrect+' forged'],['box-length-blank','x'.repeat(161)],['box-length-open','x'.repeat(401)]]){
 await db.exec('savepoint invalid_length_choice');
 await assert.rejects(sync(token,[event({module:'box',kind:'answer',run,round:1,question,choice})]),/Invalid answer/);
 await db.exec('rollback to savepoint invalid_length_choice; release savepoint invalid_length_choice');
}
await db.exec('rollback');
const importedRun=crypto.randomUUID();await sync(token,[event({module:'native-007',kind:'start',run:importedRun})]);const importedAnswer=event({module:'native-007',kind:'answer',run:importedRun,round:1,question:'native-007-final',choice:'Do you have this in a medium'});const importedResult=await sync(token,[importedAnswer]);assert.equal(importedResult.events.find(e=>e.id===importedAnswer.id).correct,true,'server accepts punctuation omitted as the client does');
const selfReviewed=event({module:'native-007',kind:'answer',run:importedRun,round:1,question:'native-007-v2-final',choice:'Could I try this in a medium? I want to check the fit before deciding. '+ 'I can ask the shop assistant for a fitting room. '.repeat(5)});const selfResult=await sync(token,[selfReviewed]);const savedWriting=selfResult.events.find(e=>e.id===selfReviewed.id);assert.equal(savedWriting.choice,selfReviewed.choice);assert.equal(savedWriting.correct,undefined,'open production is self-reviewed, not exact-match graded');
const revisedRun=crypto.randomUUID();await sync(token,[event({module:'native-102',kind:'start',run:revisedRun})]);const revisedAnswer=event({module:'native-102',kind:'answer',run:revisedRun,round:1,question:'native-102-v2-final',choice:'I can’t complain'});assert.equal((await sync(token,[revisedAnswer])).events.find(e=>e.id===revisedAnswer.id).correct,true,'revision 2 answers match the client');
const advancedRun=crypto.randomUUID();await sync(token,[event({module:'advanced-native-001',kind:'start',run:advancedRun})]);
const advancedAnswer=event({module:'advanced-native-001',kind:'answer',run:advancedRun,round:1,question:'advanced-native-001-v1-scene',choice:'They are staying in their comfort zone.'});
assert.equal((await sync(token,[advancedAnswer])).events.find(e=>e.id===advancedAnswer.id).correct,true,'Advanced Native choices save against the new catalogue');
assert.ok(completed([advancedAnswer],advancedRun,moduleMap.get('advanced-native-001')).has('advanced-native-001-v1-scene'),'unchanged work remains completed');
for(const choice of moduleMap.get('advanced-native-001').questionMap.get('advanced-native-001-v2-reply').options){const replyRun=crypto.randomUUID();await sync(token,[event({module:'advanced-native-001',kind:'start',run:replyRun})]);const replyEvent=event({module:'advanced-native-001',kind:'answer',run:replyRun,round:1,question:'advanced-native-001-v2-reply',choice});assert.equal((await sync(token,[replyEvent])).events.find(e=>e.id===replyEvent.id).correct,true,'Every reply choice is accepted');}
const revisitRun=crypto.randomUUID(),replyQuestion=moduleMap.get('advanced-native-001').questionMap.get('advanced-native-001-v2-reply');await sync(token,[event({module:'advanced-native-001',kind:'start',run:revisitRun})]);const firstReply=event({module:'advanced-native-001',kind:'answer',run:revisitRun,round:1,question:replyQuestion.id,choice:replyQuestion.options.find(choice=>choice!==replyQuestion.golden)});await sync(token,[firstReply]);const goldenReply=event({module:'advanced-native-001',kind:'answer',run:revisitRun,round:2,question:replyQuestion.id,choice:replyQuestion.golden});const replayResult=await sync(token,[goldenReply]);assert.equal(replayResult.events.find(e=>e.id===goldenReply.id).correct,true,'Students can select the golden reply after another correct answer');assert.equal(completed(replayResult.events,revisitRun,moduleMap.get('advanced-native-001')).size,1,'Trying more replies does not inflate progress');
const advancedOpen=event({module:'advanced-native-001',kind:'answer',run:advancedRun,round:1,question:'advanced-native-001-v1-final',choice:'She stays with familiar clients, but a new brief might help her grow.'});
assert.equal((await sync(token,[advancedOpen])).events.find(e=>e.id===advancedOpen.id).correct,undefined,'Advanced Native writing remains self-reviewed');
// Exercise every imported definition without accumulating thousands of unrelated
// synthetic attempts. Each RPC returns the owner's full history, so retaining
// every fixture here makes this catalogue check quadratic as the course grows.
// Existing cross-run/history/owner-isolation assertions above remain intact.
await db.exec('begin');
for(const lesson of modules.filter(m=>m.course==='advanced-native'&&m.number>=6)){
 await db.exec('savepoint catalogue_lesson');
 const lessonRun=crypto.randomUUID();await sync(token,[event({module:lesson.id,kind:'start',run:lessonRun})]);
 for(const q of lesson.questions){
  const choices=q.type==='mc'?q.options:[q.answers[0]];
  for(const [i,choice] of choices.entries()){
   const answer=event({module:lesson.id,kind:'answer',run:lessonRun,round:i+1,question:q.id,choice});
   const saved=(await sync(token,[answer])).events.find(e=>e.id===answer.id);
   assert.equal(saved.choice,choice,`${q.id} saves the current answer`);
   assert.equal(saved.correct,q.type==='open'?undefined:correct(q,choice),`${q.id} uses the intended grading contract`);
  }
 }
 const saved=await sync(token);
 assert.equal(completed(saved.events,lessonRun,lesson).size,6,`${lesson.id} counts each assessed question once`);
 await db.exec('rollback to savepoint catalogue_lesson; release savepoint catalogue_lesson');
}
await db.exec('commit');
await sync(token,[event({module:'box',kind:'view',sense:`skipped:${run}:phrase`})]);const raw=Buffer.concat([Buffer.from('1a45dfa3','hex'),Buffer.alloc(40)]).toString('base64'),recordId=crypto.randomUUID();const rec=(await db.query('select natural_english_modules_recording($1,$2,$3) result',[token,'save',JSON.stringify({id:recordId,module:'box',run,slot:'phrase',mime:'audio/webm',audio:raw})])).rows[0].result;assert.equal(rec.saved,true);const list=(await db.query('select natural_english_modules_recording($1,$2,$3) result',[token,'list','{}'])).rows[0].result;assert.equal(list[0].module,'box');
const legacyRun=crypto.randomUUID();await db.query('select natural_english_sync($1,$2)',[token,JSON.stringify([event({kind:'start',run:legacyRun})])]);assert.ok((await sync(token)).events.some(e=>e.module==='scoop'&&e.run===legacyRun));
console.log(`PASS: ${nativeModules.length} numbered Native English modules and ${modules.filter(m=>m.course==='advanced-native').length} Advanced Native modules, 2,223 Native v2 questions, legacy audio, module-scoped progress, owner isolation, recordings and Scoop compatibility.`);
