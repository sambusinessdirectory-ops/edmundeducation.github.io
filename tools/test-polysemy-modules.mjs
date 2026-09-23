import assert from 'node:assert/strict';
import fs from 'node:fs';import crypto from 'node:crypto';import {createRequire} from 'node:module';
import {modules,selectModule,replay,summary,dailyAnswers,highlighted,shuffledQuestions} from '../polysemy-lab/core.mjs';
const cycle=['american-female','american-male','british-male','british-female'];const cycleNew=['american-female','british-male','british-female'];
const manifest=JSON.parse(fs.readFileSync(new URL('../polysemy-lab/audio-new.json',import.meta.url)));
let missingAudio=[];const allIds=new Set();
assert.deepEqual(modules.slice(55).map(m=>m.number),[...Array.from({length:25},(_,i)=>i+56),82,89,90,91,103,106,107,124,125,126,127]);
for(const m of modules){
 selectModule(m.id);const senses=new Map(m.senses.map(s=>[s.id,s]));assert.equal(senses.size,m.senses.length);
 if(m.number>55){const bytes=fs.readFileSync(new URL('../polysemy-lab/'+m.source.path,import.meta.url));assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),m.source.sha256,m.id+' source PDF must match the imported lesson');}
 for(const s of m.senses){assert.match(s.title,/[\u3400-\u9fff]/u,s.id+' needs a Chinese answer label');assert.match(s.zh,/[\u3400-\u9fff]/u,s.id+' needs a Chinese explanation');}
 for(const q of m.questions){assert.ok(!allIds.has(q.id));allIds.add(q.id);assert.equal(new Set(q.options).size,Math.min(6,m.senses.length));assert.ok(q.options.includes(q.sense));assert.ok(q.options.every(id=>senses.has(id)));assert.ok(q.masked.includes('____'));assert.ok(!q.zh.includes('**'));assert.match(q.zh,/[\u3400-\u9fff]/u,q.id+' needs a full Chinese translation');assert.doesNotMatch(q.zh,/____|＿{2,}/u,q.id+' translation cannot contain blanks');assert.ok(highlighted(q.en).includes('<mark>'));
  if(m.id==='show')continue;
  assert.ok(q.options.filter(id=>id!==q.sense).every(id=>!senses.get(q.sense).excludedOverlaps.includes(id)),q.id+' has overlapping distractor');
  assert.equal(new Set(q.options.map(id=>senses.get(id).title)).size,Math.min(6,m.senses.length),q.id+' has duplicate labels');
  assert.equal(Object.keys(q.optionReasons).length,Math.min(6,m.senses.length));
  const row=manifest[q.id];if(!row){missingAudio.push(q.id);continue;}
  assert.equal(row.voice,(m.number>=16?cycleNew[q.sentenceIndex%3]:cycle[q.sentenceIndex%4]));assert.equal(row.text,q.en);assert.equal(row.sourceSha256,crypto.createHash('sha256').update(q.en).digest('hex'));assert.ok(row.duration>0.8);assert.ok(fs.statSync(new URL('../polysemy-lab/'+row.path,import.meta.url)).size>1000);
 }
 for(let seed=0;seed<10;seed++){const shuffled=shuffledQuestions(m.id+seed);assert.equal(new Set(shuffled.map(q=>q.id)).size,m.questions.length);assert.ok(shuffled.slice(1).every((q,i)=>q.sense!==shuffled[i].sense));}
 const run=crypto.randomUUID(),start={module:m.id,kind:'start',id:crypto.randomUUID(),run,at:new Date().toISOString()},events=[start];let first,retryAt;
 for(let i=0;i<m.questions.length+20;i++){const state=replay(events);if(state.complete)break;const q=state.question;if(i===0)first=q.id;else if(q.id===first&&state.review)retryAt=i;events.push({module:m.id,kind:'answer',id:crypto.randomUUID(),run,round:state.round,question:q.id,choice:i===0?q.options.find(s=>s!==q.sense):q.sense,at:new Date(Date.parse(start.at)+i+1).toISOString()});}
 assert.ok(retryAt===6||retryAt===7);assert.ok(replay(events).complete);assert.equal(summary(events).mastered.size,m.questions.length);assert.equal(dailyAnswers(events).reduce((a,d)=>a+d.correct,0),m.questions.length);
 selectModule(m.id==='show'?'busy':'show');assert.equal(replay(events),null);assert.equal(summary(events).mastered.size,0);
}
selectModule('work');assert.equal(highlighted('He works at a steel works.'),'He works at a steel <mark>works</mark>.');selectModule('show');
const require=createRequire(new URL('./email-qa/package.json',import.meta.url)),{PGlite}=require('@electric-sql/pglite'),db=new PGlite();
await db.exec(`create role anon;create role authenticated;create schema auth;create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;create table flashcard_students(id uuid primary key);create table flashcard_student_sessions(token uuid primary key,student_id uuid references flashcard_students(id),expires_at timestamptz);create function flashcard_session_student_id(uuid) returns uuid language sql as $$select student_id from public.flashcard_student_sessions where token=$1 and expires_at>now()$$;`);
for(const f of ['20260917015203_polysemy_lab_show.sql','20260918060607_polysemy_lab_media_shuffle.sql'])await db.exec(fs.readFileSync(new URL('../supabase/migrations/'+f,import.meta.url),'utf8'));
const sid=crypto.randomUUID(),other=crypto.randomUUID(),token=crypto.randomUUID(),otherToken=crypto.randomUUID();await db.query('insert into flashcard_students values($1),($2)',[sid,other]);await db.query("insert into flashcard_student_sessions values($1,$2,now()+interval '1 day'),($3,$4,now()+interval '1 day')",[token,sid,otherToken,other]);await db.query("select set_config('request.jwt.claim.sub',$1,false)",[crypto.randomUUID()]);
let apiVersion='';
const sync=async(e=[],t=token)=>(await db.query(`select polysemy_lab_${apiVersion}sync($1,$2) result`,[t,JSON.stringify(e)])).rows[0].result;
const recording=async(action,p={},t=token)=>(await db.query(`select polysemy_lab_${apiVersion}recording($1,$2,$3) result`,[t,action,JSON.stringify(p)])).rows[0].result;
const event=(module,kind,fields={})=>({module,kind,id:crypto.randomUUID(),at:new Date().toISOString(),...fields});
const oldRun=crypto.randomUUID(),oldQ=modules[0].questions[0],oldStart=event(undefined,'start',{run:oldRun}),oldAnswer=event(undefined,'answer',{run:oldRun,round:1,question:oldQ.id,choice:oldQ.sense});await sync([oldStart,oldAnswer]);
const bytes=Buffer.alloc(80);bytes.write('OggS');const oldRecording={id:crypto.randomUUID(),question:oldQ.id,mime:'audio/ogg',audio:bytes.toString('base64')};await recording('save',oldRecording);
await db.exec(fs.readFileSync(new URL('../supabase/migrations/20260918072120_polysemy_lab_modules_2_15.sql',import.meta.url),'utf8'));
apiVersion='modules_';
await db.exec(fs.readFileSync(new URL('../supabase/migrations/20260918193000_polysemy_lab_modules_16_32.sql',import.meta.url),'utf8'));
await db.exec(fs.readFileSync(new URL('../supabase/migrations/20260922120000_polysemy_lab_modules_33_55.sql',import.meta.url),'utf8'));
await db.exec(fs.readFileSync(new URL('../supabase/migrations/20260923210000_polysemy_selected_modules.sql',import.meta.url),'utf8'));
assert.equal((await sync()).events.length,2);assert.ok((await sync()).events.every(e=>e.module==='show'));assert.equal((await recording('list'))[0].module,'show');assert.equal((await recording('get',{id:oldRecording.id})).audio,oldRecording.audio);
for(const m of modules.slice(1)){
 const run=crypto.randomUUID(),q=m.questions[0],start=event(m.id,'start',{run}),answer=event(m.id,'answer',{run,round:1,question:q.id,choice:q.sense}),view=event(m.id,'view',{sense:q.sense}),time=event(m.id,'time',{seconds:15});
 await sync([start,answer,view,time]);const count=(await sync()).events.length;await sync([start,answer,view,time]);assert.equal((await sync()).events.length,count);
 await assert.rejects(sync([event(m.id,'answer',{run:oldRun,round:1,question:q.id,choice:q.sense})]),/Unknown practice/);
 await assert.rejects(sync([event(m.id,'answer',{run,round:2,question:oldQ.id,choice:oldQ.sense})]),/Invalid answer/);
 const rec={...oldRecording,id:crypto.randomUUID(),module:m.id,question:q.id};await recording('save',rec);assert.equal((await recording('get',{id:rec.id})).audio,rec.audio);
 await assert.rejects(recording('save',{...rec,module:'show'}),/Unknown question/);
}
apiVersion='';assert.equal((await sync()).events.length,2,'legacy Show endpoint stays Show-only');assert.equal((await recording('list')).length,1,'legacy recording list stays Show-only');apiVersion='modules_';
assert.equal((await sync()).events.length,2+(modules.length-1)*3);assert.equal((await sync()).timeDays.reduce((n,d)=>n+Number(d.seconds),0),(modules.length-1)*15);assert.equal((await recording('list')).length,modules.length);
assert.equal((await sync([],otherToken)).events.length,0);assert.equal((await recording('list',{},otherToken)).length,0);await assert.rejects(recording('get',{id:oldRecording.id},otherToken),/not found/);
await assert.rejects(sync([event('invented','time',{seconds:10})]),/Unknown module/);
const viewsBefore=(await sync()).events.length;await assert.rejects(sync([event('busy','view',{sense:'busy-02'}),event('train','view',{sense:'busy-02'})]),/Unknown meaning/);assert.equal((await sync()).events.length,viewsBefore);
const grants=(await db.query("select has_table_privilege('authenticated','polysemy_private.events','select') e,has_table_privilege('authenticated','polysemy_private.recordings','select') r,has_function_privilege('anon','public.polysemy_lab_sync(uuid,jsonb)','execute') a")).rows[0];assert.deepEqual(grants,{e:false,r:false,a:false});
await db.close();
if(process.argv.includes('--require-audio')){
 const pending=process.argv.includes('--allow-pending-audio')?JSON.parse(fs.readFileSync(new URL('../polysemy-lab/audio-pending.json',import.meta.url))).questions:[];
 assert.deepEqual([...missingAudio].sort(),[...pending].sort(),'Only explicitly approved pending audio may be absent');
}
console.log(`PASS: ${modules.length} modules, ${allIds.size} questions; variable-choice validation, shuffle/retry/counting, cross-module isolation, legacy Show migration, private recordings, atomic/idempotent storage. Missing audio: ${missingAudio.length}.`);
