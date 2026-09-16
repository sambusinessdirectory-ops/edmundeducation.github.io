import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {lineTokens} from '../professional-english/dialogue-practice.mjs';
const require=createRequire(new URL('./email-qa/package.json',import.meta.url));
const {PGlite}=require('@electric-sql/pglite');const db=new PGlite();
await db.exec(`create role anon;create role authenticated;create role service_role;create schema extensions;create function extensions.digest(text,text) returns bytea language sql as $$select decode(md5($1),'hex')$$;create function extensions.crypt(text,text) returns text language sql as $$select 'hash:'||$1$$;create schema realtime;create table realtime.notifications(payload jsonb,event text,topic text,private boolean);create function realtime.send(jsonb,text,text,boolean) returns void language sql as $$insert into realtime.notifications values($1,$2,$3,$4)$$;`);
for(const file of ['20260909120942_special_flash_card_portal.sql','20260909122706_special_flash_card_search.sql','20260910025843_special_flash_team_effort.sql'])await db.exec(fs.readFileSync(new URL('../supabase/migrations/'+file,import.meta.url),'utf8'));
const scalar=async(sql,args=[])=>(await db.query(sql,args)).rows[0]?.value;
await db.exec(`insert into special_flash_accounts(username,role,password_hash) values('Sam White Label Admin','admin','hash:secret');`);
const admin=await scalar("select special_flash_login('Sam White Label Admin','secret') value");
const action=(op,data)=>scalar('select special_flash_admin($1,$2,$3) value',[admin.token,op,data]);
const course=(await action('course_save',{title:'ProfessionalEnglish_ThreeGardenRoad_HK'})).id;
const card=crypto.randomUUID();const deck=(await action('deck_save',{course_id:course,title:'Test cards',cards:[{id:card,front:'Lift',back:'升降機'}]})).id;
const people=[];
for(let i=0;i<11;i++){const a=await action('account_save',{name:'Student '+i});if(i<10)await action('access_save',{account_id:a.id,course_id:course,all_decks:true,deck_ids:[]});people.push(await scalar('select special_flash_login($1,\'\') value',['Student '+i]));}
await db.query(`insert into special_flash_attempts(account_id,deck_id,attempt_key,ended_at,cards,known,review,duration_ms) values($1,$2,'legacy',now()-interval '1 day',10,7,3,30000)`,[people[0].user.id,deck]);
await db.exec(fs.readFileSync(new URL('../supabase/migrations/20260916035453_professional_learning_activity.sql',import.meta.url),'utf8'));
const summary=p=>scalar('select special_flash_learning_summary($1,$2) value',[p.token,course]);
const team=p=>scalar('select special_flash_team_effort($1) value',[p.token]);
const activity=(p,events)=>scalar('select special_flash_activity($1,$2) value',[p.token,events]);
const state=(p,key,value=null)=>scalar('select special_flash_learning_state($1,$2,$3) value',[p.token,key,value]);
// Seed state from the old l2d2 beginner script before the catalogue changes.
const originalBeginnerAnswers=(await db.query("select answers from special_learning_catalog where kind='blank' and exercise='l2d2'")).rows[0].answers;
const oldDraft={id:'old-beginner',answers:{'0:4':"I'm"},credited:['0:4'],complete:false,started:true};
const oldLast={difficulty:'standard',hint:'both',complete:false,started:true};
await state(people[0],'draft:l2d2:standard:both',oldDraft);
await state(people[0],'draft:l2d2:last',oldLast);
const versionOneDraft={...oldDraft,id:'version-one',contentVersion:1};
const versionOneLast={...oldLast,contentVersion:1};
await state(people[1],'draft:l2d2:standard:both',versionOneDraft);
await state(people[1],'draft:l2d2:last',versionOneLast);
const professionalDraft={...oldDraft,id:'new-professional',answers:{'0:4':'My'},contentVersion:2};
await state(people[2],'draft:l2d2:standard:both',professionalDraft);
await state(people[2],'draft:l2d2:last',{...oldLast,contentVersion:2});
const existingBeginner={...oldDraft,id:'already-started-beginner',answers:{'0:4':"I'm",'0:6':'ready'},contentVersion:1};
const existingLast={difficulty:'hard',hint:'none',complete:false,started:true,contentVersion:1};
await state(people[3],'draft:l2d2:standard:both',oldDraft);
await state(people[3],'draft:l2d2:last',oldLast);
await state(people[3],'draft:l2d2-beginner:standard:both',existingBeginner);
await state(people[3],'draft:l2d2-beginner:last',existingLast);
await state(people[4],'draft:l2d2:standard:both',{...oldDraft,contentVersion:null});
await state(people[4],'draft:l2d2:last',{...oldLast,contentVersion:'1'});
await state(people[4],'draft:l2d2:hard:none',42);
await state(people[4],'draft:l2d20:last',oldLast);
const catalogueMigration=fs.readFileSync(new URL('../supabase/migrations/20260916042135_professional_lessons_two_three_catalogue.sql',import.meta.url),'utf8');
await db.exec(catalogueMigration);
assert.deepEqual(await state(people[0],'draft:l2d2:standard:both'),oldDraft,'preserve the original unversioned draft');
assert.deepEqual(await state(people[0],'draft:l2d2:last'),oldLast,'preserve the original last-mode pointer');
assert.deepEqual(await state(people[0],'draft:l2d2-beginner:standard:both'),{...oldDraft,contentVersion:1});
assert.deepEqual(await state(people[0],'draft:l2d2-beginner:last'),{...oldLast,contentVersion:1});
assert.deepEqual(await state(people[1],'draft:l2d2-beginner:standard:both'),versionOneDraft);
assert.deepEqual(await state(people[1],'draft:l2d2-beginner:last'),versionOneLast);
assert.deepEqual(await state(people[2],'draft:l2d2:standard:both'),professionalDraft,'professional drafts remain under their original ID');
assert.equal(await state(people[2],'draft:l2d2-beginner:standard:both'),null,'never relabel a professional attempt as beginner');
assert.equal(await state(people[2],'draft:l2d2-beginner:last'),null,'never relabel a professional last-mode pointer');
assert.deepEqual(await state(people[3],'draft:l2d2-beginner:standard:both'),existingBeginner,'never overwrite a newer beginner attempt');
assert.deepEqual(await state(people[3],'draft:l2d2-beginner:last'),existingLast,'never overwrite a newer beginner last-mode pointer');
assert.equal(await scalar("select count(*)::integer value from special_learning_state where account_id=$1 and key like 'draft:l2d2-beginner:%'",[people[4].user.id]),0,'unknown versions and malformed drafts are not copied');
const migratedState=(await db.query('select account_id,key,value,updated_at from special_learning_state order by account_id,key')).rows;
await db.exec(catalogueMigration);
assert.deepEqual((await db.query('select account_id,key,value,updated_at from special_learning_state order by account_id,key')).rows,migratedState,'reapplying catalogue migration is safe and does not rewrite saved state');
const catalogue=(await db.query('select kind,exercise,answers from special_learning_catalog order by kind,exercise')).rows;
assert.equal(catalogue.length,78);
assert.equal(catalogue.filter(x=>x.kind==='blank').length,17);
assert.equal(catalogue.filter(x=>x.kind==='polysemy').length,61);
const dialogues=JSON.parse(fs.readFileSync(new URL('../professional-english/dialogues.json',import.meta.url),'utf8')).dialogues;
for(const d of dialogues){
 const actual=catalogue.find(x=>x.kind==='blank'&&x.exercise===d.id);
 const expected=Object.fromEntries(d.lines.flatMap((l,i)=>lineTokens(l.en).map((w,j)=>[`${i}:${j}`,w.toLowerCase().replaceAll('’',"'")]).filter(([,w])=>/^[a-z]/.test(w))));
 assert.deepEqual(actual?.answers,expected,`published dialogue answers match server catalogue: ${d.id}`);
}
const publishedWords=[1,2,3].flatMap(lesson=>JSON.parse(fs.readFileSync(new URL(`../professional-english/content/lesson-${lesson}-polysemy.json`,import.meta.url),'utf8')).words.map(word=>({lesson,word})));
for(const {lesson,word} of publishedWords){
 const actual=catalogue.find(x=>x.kind==='polysemy'&&x.exercise===`lesson-${lesson}:${word.id}`);
 assert.deepEqual(actual?.answers,Object.fromEntries(word.questions.map(q=>[q.id,q.answer])),`every published polysemy question has its canonical server answer: lesson-${lesson}:${word.id}`);
}
assert.equal(catalogue.find(x=>x.kind==='blank'&&x.exercise==='l2d2').answers['0:4'],'my','l2d2 now grades the professional dialogue');
assert.deepEqual(catalogue.find(x=>x.kind==='blank'&&x.exercise==='l2d2-beginner').answers,originalBeginnerAnswers,'the original beginner answers move to its explicit new ID');
assert.equal((await summary(people[0])).questions,7,'only correct legacy cards counted');
assert.equal((await summary(people[0])).duration_ms,30000);
const blank={kind:'blank',exercise:'l1d1',attempt:'attempt-1',item:'0:2',answer:'morning'};
// Select a real catalogue answer so this test follows the actual published dialogue.
const answers=(await db.query("select answers from special_learning_catalog where kind='blank' and exercise='l1d1'")).rows[0].answers;
[blank.item,blank.answer]=Object.entries(answers)[0];
const poly=(await db.query("select exercise,answers from special_learning_catalog where kind='polysemy' limit 1")).rows[0];
const events=[{kind:'card',exercise:deck,attempt:'round-1',item:card,answer:'green'},blank,{kind:'polysemy',exercise:poly.exercise,attempt:'poly-1',item:'word',answers:poly.answers},{kind:'blank',exercise:'l1d1',attempt:'timer-1',item:'time:tick-1',ms:15000}];
assert.equal((await activity(people[0],events)).accepted,4);
assert.equal((await summary(people[0])).questions,10);
assert.equal((await summary(people[0])).duration_ms,45000);
assert.equal((await activity(people[0],events)).accepted,0,'retry/offline resubmission cannot duplicate scores or time');
assert.equal((await summary(people[0])).questions,10);
await assert.rejects(activity(people[0],[{...blank,attempt:'wrong',answer:'WRONG'}]),/not correct/);
await assert.rejects(activity(people[0],[{...events[2],attempt:'incomplete',answers:{}}]),/every meaning/);
await assert.rejects(activity(people[0],[{...events[0],attempt:'wrong',answer:'red'}]),/Invalid card/);
await assert.rejects(activity(people[0],[{...events[3],item:'time:bad',ms:999999999}]),/Invalid study time/);
await assert.rejects(activity(people[10],[blank]),/not available/);
await assert.rejects(summary(people[10]),/not available/);
assert.equal((await team(people[10])).courses.length,0);
// Ten independent students can submit at once; each contributes one, with no lost updates.
await Promise.all(people.slice(0,10).map(p=>activity(p,[{...blank,attempt:'concurrent'}])));
assert.equal((await team(people[0])).courses[0].total_cards,20);
assert.equal((await summary(people[1])).questions,1,'personal history is only the signed-in account');
const twenty=Object.entries(answers).slice(0,20).map(([item,answer])=>({...blank,attempt:'twenty-blanks',item,answer}));
await activity(people[1],twenty);assert.equal((await summary(people[1])).questions,21,'20 blanks are 20 questions');
await state(people[0],'font:dialogue',5);assert.equal(await state(people[0],'font:dialogue'),5);assert.equal(await state(people[1],'font:dialogue'),null);
await assert.rejects(state(people[0],'font:dialogue',6),/1 to 5/);
const draft={id:'draft-1',answers:{'0:2':'morning'},credited:['0:2'],complete:false};
await state(people[0],'draft:l1d1:standard:both',draft);assert.deepEqual(await state(people[0],'draft:l1d1:standard:both'),draft);assert.equal(await state(people[1],'draft:l1d1:standard:both'),null);
const bookmark={word:'morning',bookmarked:true};await state(people[0],'bookmark:l1d1:morning',bookmark);assert.equal((await state(people[0],null))['bookmark:l1d1:morning'].word,'morning');assert.equal((await state(people[1],null))['bookmark:l1d1:morning'],undefined);
for(const table of ['catalog','events','state']){assert.equal(await scalar(`select has_table_privilege('anon','special_learning_${table}','SELECT') value`),false);assert.equal(await scalar(`select relrowsecurity value from pg_class where oid='public.special_learning_${table}'::regclass`),true);}
const notifications=(await db.query('select * from realtime.notifications')).rows;assert.ok(notifications.length>=11);for(const n of notifications){assert.deepEqual(n.payload,{});assert.equal(n.private,false);assert.equal(n.topic,'professional-learning');}
// All 45 newly added words are server-graded as a single completed word each.
const beforeNewWords=await summary(people[5]);
for(const {lesson,word} of publishedWords.filter(x=>x.lesson!==1)){
 const event={kind:'polysemy',exercise:`lesson-${lesson}:${word.id}`,attempt:`new-lesson-${lesson}-${word.id}`,item:'word',answers:Object.fromEntries(word.questions.map(q=>[q.id,q.answer]))};
 assert.equal((await activity(people[5],[event])).accepted,1,`credit completed word ${event.exercise}`);
 assert.equal((await activity(people[5],[event])).accepted,0,`deduplicate completed word ${event.exercise}`);
 const incomplete={...event.answers};delete incomplete[word.questions.at(-1).id];
 await assert.rejects(activity(people[5],[{...event,attempt:'incomplete-'+event.attempt,answers:incomplete}]),/every meaning/,`require final passage for ${event.exercise}`);
 const wrong={...event.answers,[word.questions[0].id]:'invalid-sense'};
 await assert.rejects(activity(people[5],[{...event,attempt:'wrong-'+event.attempt,answers:wrong}]),/every meaning/,`reject wrong answer for ${event.exercise}`);
}
const afterNewWords=await summary(people[5]);
assert.equal(afterNewWords.questions-beforeNewWords.questions,45,'45 words count as 45 questions, regardless of their meaning/example counts');
assert.equal(afterNewWords.words-beforeNewWords.words,45);
await assert.rejects(activity(people[5],[{kind:'blank',exercise:'l2d2',attempt:'old-script-under-new-id',item:'0:4',answer:"I'm"}]),/not correct/);
assert.equal((await activity(people[5],[{kind:'blank',exercise:'l2d2-beginner',attempt:'continued-old-beginner',item:'0:4',answer:"I'm"}])).accepted,1);
assert.equal((await activity(people[5],[{kind:'blank',exercise:'l2d2',attempt:'new-professional',item:'0:4',answer:'My'}])).accepted,1);
await scalar('select special_flash_logout($1) value',[people[0].token]);await assert.rejects(summary(people[0]),/sign in/);await assert.rejects(state(people[0],'font:home',2),/sign in/);
console.log('Passed: correct legacy totals, all three activities, 20 individual blanks, 10 simultaneous students, retry idempotence, wrong/incomplete rejection, own-account history/preferences/drafts/bookmarks, revoked sessions, RLS, data-free live notifications, 78 current catalogue rows, all 45 new polysemy words, and conservative/versioned/idempotent beginner draft migration.');await db.close();
