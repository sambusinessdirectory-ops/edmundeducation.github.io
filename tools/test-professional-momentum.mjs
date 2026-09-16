import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {rankBadges,teamGrowth,relativeAge,learningPoints,hkDate} from '../professional-english/momentum-core.mjs';
const people=Array.from({length:9},(_,i)=>({account_id:String(i),username:'Student '+i,cards:90-i*10}));
assert.deepEqual([...rankBadges(people).values()],['gold','silver','bronze',null,null,null,'flex','flex','flex']);
assert.deepEqual([...rankBadges(people.slice(0,2)).values()],['gold','silver']);
assert.equal(rankBadges([...people].reverse()).get('0'),'gold');
assert.deepEqual(teamGrowth({last_24h_questions:20,total_before_24h:150}),{gain:20,before:150,percent:13.3});
assert.equal(teamGrowth({last_24h_questions:20,total_before_24h:0}).percent,null);
assert.equal(teamGrowth({}),null);assert.equal(relativeAge(1000,121000),'2 分鐘前');assert.equal(relativeAge(2000,1000),'剛剛');
const now=Date.parse('2026-09-16T16:30:00Z');assert.equal(hkDate(now),'2026-09-17');
const daily=[{date:'2026-09-01',questions:150,cards:130,blanks:15,words:5},{date:'2026-09-16',questions:20,cards:10,blanks:8,words:2}];
let p=learningPoints(daily,'week',now);assert.equal(p.at(-1).from,'2026-09-17');assert.equal(p.at(-1).questions,0);assert.equal(p.at(-1).cumulative,170);assert.equal(p.at(-2).cards,10);
p=learningPoints(daily,'all',now);assert.equal(p.length,1);assert.equal(p[0].from,'2026-09-01');assert.equal(p[0].to,'2026-09-17');assert.equal(p[0].questions,170);
assert.equal(learningPoints([{date:'2025-12-20',questions:2}],'all',now).length,10);
const require=createRequire(new URL('./email-qa/package.json',import.meta.url)),{PGlite}=require('@electric-sql/pglite'),db=new PGlite();
await db.exec(`create role anon;create role authenticated;create role service_role;create schema extensions;create function extensions.digest(text,text) returns bytea language sql as $$select decode(md5($1),'hex')$$;create function extensions.crypt(text,text) returns text language sql as $$select 'hash:'||$1$$;create schema realtime;create function realtime.send(jsonb,text,text,boolean) returns void language sql as $$select$$;`);
for(const file of ['20260909120942_special_flash_card_portal.sql','20260909122706_special_flash_card_search.sql','20260910025843_special_flash_team_effort.sql','20260916035453_professional_learning_activity.sql','20260916110409_professional_library_messages_playlists.sql','20260916051841_professional_team_reporting_visibility.sql','20260916120429_professional_community_feedback_records.sql','20260916124646_professional_team_momentum_history.sql'])await db.exec(fs.readFileSync(new URL('../supabase/migrations/'+file,import.meta.url),'utf8'));
const scalar=async(sql,args=[])=>(await db.query(sql,args)).rows[0]?.value;
await db.exec("insert into special_flash_accounts(username,role) values('Momentum Alice','student'),('Momentum Bob','student'),('Momentum Hidden','student');update special_flash_accounts set team_effort_visible=false where username='Momentum Hidden';");
const login=name=>scalar('select special_flash_login($1) value',[name]),alice=await login('Momentum Alice'),bob=await login('Momentum Bob'),hidden=await login('Momentum Hidden');
const course=crypto.randomUUID(),deck=crypto.randomUUID(),card=crypto.randomUUID(),other=crypto.randomUUID();
await db.query('insert into special_flash_courses(id,title) values($1,\'Momentum QA\'),($2,\'Other QA\')',[course,other]);
await db.query('insert into special_flash_decks(id,course_id,title,cards) values($1,$2,\'Class 1\',$3)',[deck,course,JSON.stringify([{id:card,front:'Welcome',back:'歡迎'}])]);
for(const who of [alice,bob,hidden])await db.query('insert into special_flash_enrollments(account_id,course_id,all_decks) values($1,$2,true)',[who.user.id,course]);
await db.exec('begin');
await db.query(`insert into special_learning_events(account_id,course_id,event_key,kind,points,occurred_at) values
 ($1,$2,'before','card',150,now()-interval '24 hours 0.000001 seconds'),
 ($1,$2,'boundary','card',10,now()-interval '24 hours'),
 ($1,$2,'recent','blank',5,now()-interval '12 hours'),
 ($1,$2,'now','polysemy',5,now()),($3,$2,'hidden','card',1000,now())`,[alice.user.id,course,hidden.user.id]);
const team=(await scalar('select special_flash_team_effort($1) value',[alice.token])).courses.find(c=>c.course_id===course);
assert.equal(team.total_cards,170);assert.equal(team.last_24h_questions,20);assert.equal(team.total_before_24h,150);assert.equal(team.members.length,2);assert.ok((await scalar('select special_flash_team_effort($1) value',[alice.token])).generated_at);
await db.exec('rollback');
const insert=async(key,kind,points,at)=>db.query('insert into special_learning_events(account_id,course_id,event_key,kind,points,occurred_at) values($1,$2,$3,$4,$5,$6)',[alice.user.id,course,key,kind,points,at]);
await insert(`card:${deck}:round:1:${card}`,'card',1,'2026-09-15T16:00:00Z');
await insert('blank:l2d1:attempt:0:2','blank',1,'2026-09-16T08:00:00Z');
await insert('polysemy:lesson-1:welcome:attempt:word','polysemy',1,'2026-09-16T15:59:59.999Z');
await insert(`legacy-marks:${deck}`,'card',3,'2026-09-16T10:00:00Z');
await insert('before','card',1,'2026-09-15T15:59:59.999Z');await insert('after','card',1,'2026-09-16T16:00:00Z');await insert('time','blank',0,'2026-09-16T09:00:00Z');
const details=(who=alice,from='2026-09-16',to=from,page=1,c=course)=>scalar('select special_flash_learning_details($1,$2,$3,$4,$5) value',[who?.token,c,from,to,page]);
const records=await details();assert.equal(records.total,4);assert.equal(records.questions,6);assert.equal(records.rows.find(r=>r.kind==='blank').item,'0:2');assert.equal(records.rows.find(r=>r.front==='Welcome').exercise,deck);assert.equal(records.rows.find(r=>r.kind==='polysemy').exercise,'lesson-1:welcome');assert.equal(records.rows.filter(r=>r.legacy).length,1);assert.equal(records.rows.find(r=>r.legacy).exercise,deck);
const summary=await scalar('select special_flash_learning_summary($1,$2) value',[alice.token,course]),day=summary.daily.find(d=>d.date==='2026-09-16');assert.deepEqual([day.questions,day.cards,day.blanks,day.words],[6,4,1,1]);
assert.equal((await details(bob)).total,0);await assert.rejects(details(null),e=>e.code==='42501');await assert.rejects(details(alice,'2026-09-16','2026-09-16',1,other),e=>e.code==='42501');await assert.rejects(details(alice,'2026-09-16','2026-09-15'),e=>e.code==='22023');await assert.rejects(details(alice,'2026-09-16','2026-09-16',0),e=>e.code==='22023');
for(let i=0;i<101;i++)await insert('blank:l2d1:page-'+i+':1:2','blank',1,'2026-09-18T01:00:00Z');
const first=await details(alice,'2026-09-18'),second=await details(alice,'2026-09-18','2026-09-18',2);assert.equal(first.total,101);assert.equal(first.rows.length,100);assert.equal(second.rows.length,1);assert.ok(!first.rows.some(r=>r.id===second.rows[0].id));
assert.equal(await scalar("select has_table_privilege('anon','special_learning_events','SELECT') value"),false);
await db.close();console.log('Momentum: ranks, zero baseline, rolling 24h exact boundary, hidden-member exclusion, Hong Kong dates, private history, source IDs, legacy labels and pagination passed.');
