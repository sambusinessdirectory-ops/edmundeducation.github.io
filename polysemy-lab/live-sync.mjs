// Match the shared feedback phase to the current run, independent of device.
export function sharedFeedback(events,{moduleId,replay,questionMap}){
 const state=replay(events);
 if(!state)return null;
 const answers=events.filter(e=>(e.module||'show')===moduleId&&e.run===state.run&&e.kind==='answer'&&questionMap.has(e.question)).sort((a,b)=>a.at.localeCompare(b.at)||a.id.localeCompare(b.id));
 const latest=answers.at(-1);
 if(!latest||events.some(e=>(e.module||'show')===moduleId&&e.kind==='next'&&e.run===state.run&&e.question===latest.question&&e.round===latest.round))return null;
 const previous=new Set(answers.slice(0,-1).map(e=>e.id));
 const prior=replay(events.filter(e=>e.kind!=='answer'||e.run!==state.run||previous.has(e.id)));
 return {question:questionMap.get(latest.question),choice:latest.choice,round:latest.round,position:prior?.position??0,review:prior?.review,filler:prior?.filler};
}
export function pollDelay({practice,lastActivity,now=Date.now()}){
 if(!practice)return 60000;
 return now-lastActivity<60000?2000:30000;
}
