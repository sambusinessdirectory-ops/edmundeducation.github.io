import {modules,moduleMap,allQuestionMap} from './catalogue.mjs?v=20260923-polysemy-127';
export {modules,moduleMap,allQuestionMap};
export let showModule,questions,senses,questionMap;
export function selectModule(id='show'){const m=moduleMap.get(id);if(!m)throw Error('Unknown module');showModule=m;questions=m.questions;senses=new Map(m.senses.map(s=>[s.id,s]));questionMap=new Map(questions.map(q=>[q.id,q]));}
selectModule();
export function orderedOptions(q,round=1){let seed=[...q.id+':'+round].reduce((n,c)=>(n*31+c.charCodeAt(0))>>>0,7);return q.options.map(id=>({id,n:(seed=(Math.imul(seed,1664525)+1013904223)>>>0)})).sort((a,b)=>a.n-b.n).map(x=>x.id);}
// A run UUID is the shuffle seed, so resuming on another device keeps the order.
function random(seed){let n=[...seed].reduce((n,c)=>(Math.imul(n,31)+c.charCodeAt(0))>>>0,7);return()=>((n=(Math.imul(n,1664525)+1013904223)>>>0)/4294967296);}
export function shuffledQuestions(run){const rand=random(run),pool=[...questions],out=[];while(pool.length){const candidates=pool.filter(q=>q.sense!==out.at(-1)?.sense),q=(candidates.length?candidates:pool)[Math.floor(rand()*(candidates.length||pool.length))];out.push(q);pool.splice(pool.indexOf(q),1);}for(let i=1;i<out.length;i++){if(out[i].sense!==out[i-1].sense)continue;const j=out.findIndex((q,k)=>k<i-1&&q.sense!==out[i-1].sense&&q.sense!==out[i+1]?.sense&&out[i].sense!==out[k-1]?.sense&&out[i].sense!==out[k+1]?.sense);if(j>=0)[out[i],out[j]]=[out[j],out[i]];}return out;}
export function replay(events){
 events=events.filter(e=>(e.module||'show')===showModule.id);
 const start=events.filter(e=>e.kind==='start').sort((a,b)=>a.at.localeCompare(b.at)||a.id.localeCompare(b.id)).at(-1);
 if(!start)return null;const run=start.run;
 // Folding actual saved answers also preserves unfinished runs from the old ordered engine.
 const answers=events.filter(e=>e.kind==='answer'&&e.run===run&&questionMap.has(e.question)).sort((a,b)=>a.at.localeCompare(b.at)||a.id.localeCompare(b.id));
 const correct=new Set(),attempts=new Map(),pending=new Map(),seen=new Set();let streak=0,bestStreak=0;
 answers.forEach((a,i)=>{seen.add(a.question);attempts.set(a.question,Math.max(attempts.get(a.question)||0,a.round));if(a.choice===questionMap.get(a.question).sense){correct.add(a.question);pending.delete(a.question);streak++;bestStreak=Math.max(bestStreak,streak);}else{streak=0;const gap=5+Math.floor(random(run+':'+a.question+':'+a.round)()*2);pending.set(a.question,i+gap+1);}});
 const order=shuffledQuestions(run),fresh=order.filter(q=>!seen.has(q.id)),due=[...pending].filter(([,at])=>at<=answers.length).sort((a,b)=>a[1]-b[1]),complete=!fresh.length&&!pending.size;
 let q=due.length?questionMap.get(due[0][0]):fresh[0],filler=false;
 if(!q&&!complete){filler=true;const pool=order.filter(q=>!pending.has(q.id)&&q.sense!==questionMap.get(answers.at(-1)?.question)?.sense);const eligible=pool.length?pool:order.filter(q=>!pending.has(q.id));q=eligible[Math.floor(random(run+':filler:'+answers.length)()*eligible.length)];}
 return {run,round:q?(attempts.get(q.id)||0)+1:Math.max(1,...attempts.values()),queue:order,position:answers.length,question:q,correct,streak,bestStreak,complete,filler,review:!!q&&pending.has(q.id)};
}
export function summary(events){events=events.filter(e=>(e.module||'show')===showModule.id);const seen=new Set(events.filter(e=>e.kind==='view').map(e=>e.sense)),mastered=new Set(events.filter(e=>e.kind==='answer'&&e.choice===questionMap.get(e.question)?.sense).map(e=>e.question));return {seen,mastered};}
export const hkDate=at=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Hong_Kong',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(at));
export function dailyAnswers(events){const rows=new Map();for(const e of [...events].sort((a,b)=>a.at.localeCompare(b.at))){if(e.kind!=='answer'||!allQuestionMap.has(e.question))continue;const date=hkDate(e.at);if(!rows.has(date))rows.set(date,{date,attempts:0,correct:0});rows.get(date).attempts++;}
 const first=new Map();for(const e of [...events].sort((a,b)=>a.at.localeCompare(b.at))){if(e.kind==='answer'&&e.choice===allQuestionMap.get(e.question)?.sense&&!first.has(e.run+e.question)){first.set(e.run+e.question,true);rows.get(hkDate(e.at)).correct++;}}
 return [...rows.values()].sort((a,b)=>a.date.localeCompare(b.date));}
export const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const patterns={watch:'watchful|watchers|watcher|watching|watched|watches|watch',cancel:'non-cancellable|non-cancelable|noise-cancelling|noise-canceling|cancellations|cancellation|cancellable|cancelable|cancelling|canceling|cancelled|canceled|cancels|cancel',show:'for show|showed|showing|shown|shows|show',busy:'busybody|busybodies|busily|busiest|busier|busy',train:'trainees|trainee|trainers|trainer|training|trained|trains|train',buy:'buybacks|buyback|buyouts|buyout|buyers|buyer|buying|bought|buys|buy',catch:'catching|catches|catchy|caught|catch',pair:'pairwise|pairing|paired|pairs|pair',see:'seeing|seers|seer|seen|sees|saw|see',late:'latecomers|latecomer|lateness|belated|latest|lately|later|late',work:'workmanship|workplaces|workplace|workforce|workshops|workshop|overworked|overwork|workable|workers|worker|working|worked|works|work',home:'homeownership|homeowners|homeowner|homelessness|homeless|homesickness|homesick|homecoming|homemade|homegrown|homebody|homeward|hometown|homeland|homes|home',immediate:'immediacy|immediately|immediate',full:'fullness|fully|full',empty:'emptiness|emptying|emptied|empties|empty'};
export function highlighted(text){
 const q=questions.find(q=>q.en===text),targets=q?.targets;
 if(!targets?.length)return esc(text).replace(new RegExp('\\b('+patterns[showModule.id]+')\\b','gi'),'<mark>$1</mark>');
 const spans=[];let from=0;for(const target of targets){const at=q.targetOccurrence==='last'?text.lastIndexOf(target):text.indexOf(target,from);if(at<0)continue;spans.push([at,at+target.length]);from=at+target.length;}
 if(!spans.length)return esc(text);let cursor=0,result='';for(const [a,b] of spans){result+=esc(text.slice(cursor,a))+'<mark>'+esc(text.slice(a,b))+'</mark>';cursor=b;}return result+esc(text.slice(cursor));
}
