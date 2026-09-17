import {showModule,questions} from './show.mjs?v=20260917-1';
export {showModule,questions};
export const senses=new Map(showModule.senses.map(s=>[s.id,s]));
export const questionMap=new Map(questions.map(q=>[q.id,q]));
export function orderedOptions(q,round=1){let seed=[...q.id+':'+round].reduce((n,c)=>(n*31+c.charCodeAt(0))>>>0,7);return q.options.map(id=>({id,n:(seed=(Math.imul(seed,1664525)+1013904223)>>>0)})).sort((a,b)=>a.n-b.n).map(x=>x.id);}
export function replay(events){
 const starts=events.filter(e=>e.kind==='start').sort((a,b)=>a.at.localeCompare(b.at)||a.id.localeCompare(b.id));
 const run=starts.at(-1)?.run;if(!run)return null;
 const answers=events.filter(e=>e.kind==='answer'&&e.run===run);
 let queue=questions,round=1;const correct=new Set();
 while(round<=1000){const missed=[];for(let i=0;i<queue.length;i++){const q=queue[i],a=answers.find(e=>e.round===round&&e.question===q.id);if(!a)return {run,round,queue,position:i,question:q,correct,complete:false};if(a.choice===q.sense)correct.add(q.id);else missed.push(q);}
 if(!missed.length)return {run,round,queue,position:queue.length,correct,complete:true};queue=missed;round++;}
 return null;
}
export function summary(events){const seen=new Set(events.filter(e=>e.kind==='view').map(e=>e.sense)),mastered=new Set(events.filter(e=>e.kind==='answer'&&e.choice===questionMap.get(e.question)?.sense).map(e=>e.question));return {seen,mastered};}
export const hkDate=at=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Hong_Kong',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(at));
export function dailyAnswers(events){const rows=new Map();for(const e of [...events].sort((a,b)=>a.at.localeCompare(b.at))){if(e.kind!=='answer'||!questionMap.has(e.question))continue;const date=hkDate(e.at);if(!rows.has(date))rows.set(date,{date,attempts:0,correct:0});rows.get(date).attempts++;}
 const first=new Map();for(const e of [...events].sort((a,b)=>a.at.localeCompare(b.at))){if(e.kind==='answer'&&e.choice===questionMap.get(e.question)?.sense&&!first.has(e.run+e.question)){first.set(e.run+e.question,true);rows.get(hkDate(e.at)).correct++;}}
 return [...rows.values()].sort((a,b)=>a.date.localeCompare(b.date));}
export const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function highlighted(text){return esc(text).replace(/\b(for show|showed|showing|shown|shows|show)\b/gi,'<mark>$1</mark>');}
