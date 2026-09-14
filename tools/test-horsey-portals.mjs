import assert from 'node:assert/strict';
import {horseyState,horseyCollection} from '../horsey-trophies.mjs';
import {createListeningTrophyProgress} from '../listening-trophy-progress.mjs';
for(const total of [20,30,40,50,1,7]) {
 const lesson={id:'lesson',questions:Array.from({length:total},(_,i)=>({id:String(i+1)}))};
 const attempt=n=>({lessonId:lesson.id,totalCount:total,correctCount:n,status:n===total?'completed':'in_progress',result:{correctIds:lesson.questions.slice(0,n).map(q=>q.id)}});
 assert.equal(horseyState(lesson,[attempt(Math.ceil(total/2)-1)]).tier,null);
 assert.equal(horseyState(lesson,[attempt(Math.ceil(total/2))]).tier,total===1?'gold':'silver');
 assert.equal(horseyState(lesson,[attempt(total),attempt(0)]).tier,'gold');
 assert.equal(horseyState(lesson,[{...attempt(total),totalCount:total+1}]).tier,null);
 assert.equal(horseyState(lesson,[{...attempt(total),result:{correctIds:['unknown']}}]).tier,null);
 assert.equal(horseyState(lesson,[attempt(total),attempt(total)]).correct,total);
 const answers=Object.fromEntries(lesson.questions.map(q=>[q.id,{correct:true}]));answers.unknown={correct:true};
 assert.equal(horseyState(lesson,[],answers).correct,total);
 assert.equal(horseyCollection([lesson],{answersFor:()=>answers})[0].tier,'gold');
}
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)};
let owner='a', token='token-a', resolve;
const progress=createListeningTrophyProgress({getOwner:()=>owner,getToken:()=>token,onChange:()=>{},rpc:async()=>[]});
await progress.restore();await progress.record(2,[1,1,2,41,-1]);
assert.deepEqual(Object.keys(progress.answersFor('ielts-listening-practice-2')),['1','2']);
await progress.restore();assert.equal(Object.keys(progress.answersFor('ielts-listening-practice-2')).length,2);
owner='b';token='token-b';await progress.restore();assert.equal(Object.keys(progress.answersFor('ielts-listening-practice-2')).length,0);
console.log('PASS: varied thresholds, valid IDs, stale attempts, monotonic awards, local restoration and student isolation');
