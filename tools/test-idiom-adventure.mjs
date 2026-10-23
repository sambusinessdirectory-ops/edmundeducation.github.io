import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {DAY,freshProfile,normalizeProfile,stats,companionStage,planExpedition,recordAnswer,advance} from '../idiom-adventure-core.mjs';
const now=2_000_000_000_000;
test('six unique encounters cover every lesson without changing source IDs',()=>{
 const sandbox={window:{}};vm.createContext(sandbox);
 vm.runInContext(fs.readFileSync(new URL('../idiom-system-data.js',import.meta.url),'utf8'),sandbox);
 const lessons=sandbox.window.EDMUND_IDIOM_SYSTEM_DATA.lessons;
 assert.equal(lessons.length,138);
 for(const l of lessons){const ids=planExpedition(l.questions,freshProfile(),'new',[],now);assert.equal(ids.length,6);assert.equal(new Set(ids).size,6);assert.ok(ids.every(id=>l.questions.some(q=>q.id===id)));}
});
test('new routes prioritize unfinished questions and revisit mistakes',()=>{
 const p=freshProfile(),qs=Array.from({length:10},(_,i)=>({id:'q'+i}));
 recordAnswer(p,'q8',false,{now});
 const ids=planExpedition(qs,p,'new',['q0','q1'],now);
 assert.deepEqual(ids,['q8','q2','q3','q4','q5','q6']);
});
test('review routes prioritize due questions and then account-completed ones',()=>{
 const p=freshProfile();recordAnswer(p,'c',true,{now});
 assert.deepEqual(planExpedition(['a','b','c'].map(id=>({id})),p,'review',['b'],now+DAY),['c','b','a']);
});
test('correcting mistakes rewards once; repeated clicks cannot farm XP',()=>{
 const p=freshProfile();assert.equal(recordAnswer(p,'a',false,{now}),0);
 assert.equal(recordAnswer(p,'a',true,{now,firstTry:false}),10);
 for(let i=0;i<100;i++){recordAnswer(p,'a',false,{now});assert.equal(recordAnswer(p,'a',true,{now}),0);}
 assert.equal(stats(p).xp,10);
});
test('spaced review rewards require both due date and 24-hour reward cooldown',()=>{
 const p=freshProfile();recordAnswer(p,'a',true,{now});
 assert.equal(recordAnswer(p,'a',true,{now:now+DAY-1}),0);
 // The early revisit schedules a later recall; intentionally not eligible at the old date.
 assert.equal(recordAnswer(p,'a',true,{now:now+DAY}),0);
 const due=p.records.a.due;
 assert.equal(recordAnswer(p,'a',true,{now:due}),5);
 assert.equal(recordAnswer(p,'a',true,{now:due}),0);
});
test('assistance and mistakes shorten recall interval; confident recall grows to seven days',()=>{
 const p=freshProfile();recordAnswer(p,'a',true,{now});
 for(let i=0;i<6;i++)recordAnswer(p,'a',true,{now:p.records.a.due});
 assert.equal(p.records.a.interval,7);
 recordAnswer(p,'a',true,{now:p.records.a.due,assisted:true});assert.equal(p.records.a.interval,1);
 recordAnswer(p,'a',false,{now});assert.equal(p.records.a.due,now);
});
test('companion growth counts distinct completed questions, never wrong attempts',()=>{
 const p=freshProfile();for(let i=0;i<36;i++)recordAnswer(p,'q'+i,true,{now});
 assert.equal(companionStage(p,'moss').level,3);assert.equal(companionStage(p,'ember').level,1);
 for(let i=0;i<100;i++)recordAnswer(p,'wrong'+i,false,{now});
 assert.equal(companionStage(p,'moss').count,36);assert.equal(stats(p).level,4);
});
test('no stamp before all six answers; next cannot advance twice',()=>{
 const p=freshProfile();p.active={lessonId:'idiom-138',ids:['a','b','c','d','e','f'],index:0,solved:false};
 assert.equal(advance(p,now),false);assert.equal(p.active.index,0);
 for(let i=0;i<6;i++){p.active.solved=true;assert.equal(advance(p,now),i===5);if(i<5){assert.equal(advance(p,now),false);assert.equal(stats(p).seals,0);}}
 assert.equal(stats(p).seals,1);assert.equal(p.runs,1);assert.equal(advance(p,now),false);assert.equal(p.runs,1);
});
test('saved expedition resumes at the exact encounter with support use retained',()=>{
 const p=freshProfile();p.active={lessonId:'idiom-01',ids:['a','b','c','d','e','f'],index:3,charges:1,solved:true,attempted:true,help:true,earned:30,companion:'tide'};
 assert.deepEqual(normalizeProfile(JSON.parse(JSON.stringify(p))).active,{...p.active});
});
test('malformed saves reset safely; duplicate or invalid queues are rejected',()=>{
 assert.deepEqual(normalizeProfile(null),freshProfile());assert.deepEqual(normalizeProfile({version:9}),freshProfile());
 const p=normalizeProfile({version:1,region:999,companion:'bad',active:{lessonId:'x',ids:Array(6).fill('same')},records:{bad:{due:'not a date'}}});
 assert.equal(p.region,5);assert.equal(p.companion,'moss');assert.equal(p.active,null);assert.deepEqual(p.records,{});
});
