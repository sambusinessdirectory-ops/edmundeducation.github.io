export const emptyChecklist = () => ({version:1,content:[],language:[]});
export function createProfessionalSession(settings, topic, now=Date.now()) {
  const minutes=Number(settings.minutes);
  if(!Number.isInteger(minutes)||minutes<1||minutes>120) throw new Error('請輸入 1–120 的整數分鐘。');
  if(!settings.group&&!settings.individual) throw new Error('請至少選擇一個練習部分。');
  const candidates=(settings.candidates||[]).filter(c=>c.enabled!==false).map((c,i)=>({id:String(c.id||'ABCD'[i]),name:String(c.name||`Candidate ${c.id||'ABCD'[i]}`).trim().slice(0,100),grades:[null,null,null,null],comment:''}));
  if(!candidates.length||candidates.length>4||new Set(candidates.map(c=>c.id)).size!==candidates.length)throw new Error('請選擇 1–4 位考生。');
  if(!topic?.groupDiscussion?.length||!topic?.individualResponse?.length)throw new Error('請選擇完整題組。');
  const session={version:1,id:globalThis.crypto.randomUUID(),createdAt:now,settings:{minutes,group:!!settings.group,individual:!!settings.individual,preparation:!!settings.preparation},topic:JSON.parse(JSON.stringify(topic)),candidates,turns:[],activeTurn:null,phase:'lobby',deadline:null,individualIndex:0,groupStartedAt:null,completedAt:null};
  if(settings.preparation){session.phase='preparation';session.deadline=now+600000;}else beginPractice(session,now);
  return session;
}
function beginPractice(s,now){if(s.settings.group){s.phase='group';s.groupStartedAt=now;s.deadline=now+s.settings.minutes*60000;}else{s.phase='individual-wait';s.deadline=null;}}
export function closeTurn(s,now=Date.now()) {
  if(!s.activeTurn)return;
  const turn=s.turns.find(t=>t.id===s.activeTurn);
  if(turn){turn.endedAt=Math.max(turn.startedAt,Math.min(now,s.deadline??now));turn.durationMs=turn.endedAt-turn.startedAt;}
  s.activeTurn=null;
}
function complete(s,now){s.phase='results';s.deadline=null;s.completedAt=now;}
export function advanceProfessionalSession(s,now=Date.now()) {
  if(s.phase==='preparation'&&now>=s.deadline)beginPractice(s,s.deadline);
  if(s.phase==='group'&&now>=s.deadline){const end=s.deadline;closeTurn(s,end);s.groupEndedAt=end;if(s.settings.individual){s.phase='individual-wait';s.deadline=null;}else complete(s,end);}
  if(s.phase==='individual'&&now>=s.deadline){const end=s.deadline;closeTurn(s,end);s.individualIndex++;if(s.individualIndex>=s.candidates.length)complete(s,end);else{s.phase='individual-wait';s.deadline=null;}}
  return s;
}
export function skipPreparation(s,now=Date.now()){if(s.phase==='preparation')beginPractice(s,now);return s;}
export function selectSpeaker(s,candidateId,now=Date.now()) {
  advanceProfessionalSession(s,now);
  if(s.phase!=='group'||!s.candidates.some(c=>c.id===candidateId))return null;
  const current=s.turns.find(t=>t.id===s.activeTurn);closeTurn(s,now);
  if(current?.candidateId===candidateId)return null;
  const turn={id:globalThis.crypto.randomUUID(),candidateId,phase:'group',number:1+s.turns.filter(t=>t.candidateId===candidateId&&t.phase==='group').length,startedAt:now,endedAt:null,durationMs:0,checklist:emptyChecklist()};
  s.turns.push(turn);s.activeTurn=turn.id;return turn;
}
export function selectIndividualQuestion(s,index,now=Date.now()) {
  advanceProfessionalSession(s,now);
  if(s.phase!=='individual-wait'||!Number.isInteger(index)||!s.topic.individualResponse[index])return null;
  const candidate=s.candidates[s.individualIndex];s.phase='individual';s.deadline=now+60000;
  const turn={id:globalThis.crypto.randomUUID(),candidateId:candidate.id,phase:'individual',number:1,question:s.topic.individualResponse[index],questionIndex:index,startedAt:now,endedAt:null,durationMs:0,checklist:emptyChecklist()};s.turns.push(turn);s.activeTurn=turn.id;return turn;
}
export function turnDuration(s,turn,now=Date.now()){return turn.endedAt==null?Math.max(0,Math.min(now,s.deadline??now)-turn.startedAt):turn.durationMs;}
export function candidateSummary(s,id,now=Date.now()) {
  const turns=s.turns.filter(t=>t.candidateId===id&&t.phase==='group');
  const seconds=turns.reduce((total,t)=>total+turnDuration(s,t,now),0)/1000;
  const percentage=seconds/(s.settings.minutes*60)*100;
  return {seconds,percentage,rounds:turns.length,tone:percentage>50?'red':percentage<25?'yellow':'green'};
}
