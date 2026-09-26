export const emptyChecklist = () => ({version:1,content:[],language:[]});
export function createProfessionalSession(settings, topic, now=Date.now()) {
  const minutes=Number(settings.minutes);
  if(!Number.isInteger(minutes)||minutes<1||minutes>120) throw new Error('請輸入 1–120 的整數分鐘。');
  if(!settings.group&&!settings.individual) throw new Error('請至少選擇一個練習部分。');
  const candidates=(settings.candidates||[]).filter(c=>c.enabled!==false).map((c,i)=>({id:String(c.id||'ABCD'[i]),name:String(c.name||'').trim().slice(0,100),grades:[null,null,null,null],comment:'',nervousness:null,accountId:String(c.accountId||''),mascot:['eddy','noir','celeste','phoebe','elsie'].includes(c.mascot)?c.mascot:['eddy','noir','celeste','phoebe','elsie'][i%5]}));
  if(!candidates.length||candidates.length>4||new Set(candidates.map(c=>c.id)).size!==candidates.length)throw new Error('請選擇 1–4 位考生。');
  if(!topic?.groupDiscussion?.length||!topic?.individualResponse?.length)throw new Error('請選擇完整題組。');
  const session={version:2,id:globalThis.crypto.randomUUID(),createdAt:now,settings:{minutes,group:!!settings.group,individual:!!settings.individual,preparation:!!settings.preparation,preparationMode:settings.preparationMode==='forced'?'forced':'soft',showCosmetics:!!settings.showCosmetics,nightClassroom:!!settings.nightClassroom,showFlags:!!settings.showFlags,showDeskTimer:!!settings.showDeskTimer,digitizedCard:!!settings.digitizedCard,language:settings.language||'bi',threeD:!!settings.threeD,transcription:!!settings.transcription},topic:JSON.parse(JSON.stringify(topic)),candidates,turns:[],activeTurn:null,phase:'lobby',deadline:null,individualIndex:0,groupStartedAt:null,completedAt:null,notes:'',overlaps:[],activeOverlap:null,preparationStartedAt:settings.preparation?now:null,pausedAt:null,pausePeriods:[],selectedQuestions:{}};
  if(settings.preparation){session.phase='preparation';session.deadline=now+600000;}else beginPractice(session,now);
  return session;
}
function beginPractice(s,now){if(s.settings.group){s.phase='group-wait';s.groupStartedAt=null;s.deadline=null;}else{s.phase='individual-wait';s.deadline=null;}}
export function closeTurn(s,now=Date.now()) {
  if(!s.activeTurn)return;
  const turn=s.turns.find(t=>t.id===s.activeTurn);
  if(turn){closeSegment(s,turn,now);turn.endedAt=Math.max(turn.startedAt,Math.min(now,s.pausedAt??s.deadline??now));turn.durationMs=Math.max(0,activeElapsedMs(s,turn.startedAt,turn.endedAt)+(turn.adjustmentMs||0));}
  s.activeTurn=null;
}
function complete(s,now){stopOverlap(s,now);s.phase='results';s.deadline=null;s.completedAt=now;}
export function advanceProfessionalSession(s,now=Date.now()) {
  if(s.phase==='preparation'&&s.settings.preparationMode==='forced'&&now>=s.deadline)beginPractice(s,s.deadline);
  if(s.pausedAt!=null)return s;
  if(s.phase==='group'&&now>=s.deadline){const end=s.deadline;closeTurn(s,end);stopOverlap(s,end);s.groupEndedAt=end;if(s.settings.individual){s.phase='individual-wait';s.deadline=null;}else complete(s,end);}
  if(s.phase==='individual'&&now>=s.deadline){const end=s.deadline;closeTurn(s,end);s.phase='individual-wait';s.deadline=null;}
  return s;
}
export function skipPreparation(s,now=Date.now()){if(s.phase==='preparation')beginPractice(s,now);return s;}
export function selectSpeaker(s,candidateId,now=Date.now()) {
  advanceProfessionalSession(s,now);
  if(s.phase!=='group'||s.pausedAt!=null||!s.candidates.some(c=>c.id===candidateId))return null;
  const current=s.turns.find(t=>t.id===s.activeTurn);closeTurn(s,now);
  if(current?.candidateId===candidateId)return null;
  const turn={id:globalThis.crypto.randomUUID(),candidateId,phase:'group',adjustmentMs:0,number:1+s.turns.filter(t=>t.candidateId===candidateId&&t.phase==='group').length,startedAt:now,endedAt:null,durationMs:0,checklist:emptyChecklist(),comment:'',mistakes:[],transcript:'',segments:[],activeSegment:null};
  s.turns.push(turn);s.activeTurn=turn.id;return turn;
}
export function selectIndividualQuestion(s,index,now=Date.now()) {
  advanceProfessionalSession(s,now);
  if(!['individual-wait','individual'].includes(s.phase)||!Number.isInteger(index)||!s.topic.individualResponse[index])return null;
  if(s.activeTurn)closeTurn(s,now);
  const candidate=s.candidates[s.individualIndex];s.phase='individual';s.deadline=now+60000;s.selectedQuestions??={};s.selectedQuestions[candidate.id]=index;
  const turn={id:globalThis.crypto.randomUUID(),candidateId:candidate.id,phase:'individual',adjustmentMs:0,number:1+s.turns.filter(t=>t.candidateId===candidate.id&&t.phase==='individual').length,question:s.topic.individualResponse[index],questionIndex:index,startedAt:now,endedAt:null,durationMs:0,checklist:emptyChecklist(),comment:'',mistakes:[],transcript:'',segments:[],activeSegment:null};s.turns.push(turn);s.activeTurn=turn.id;return turn;
}
function activeElapsedMs(s,start,end) {
  const paused=(s.pausePeriods||[]).reduce((total,p)=>total+Math.max(0,Math.min(end,p.endedAt)-Math.max(start,p.startedAt)),0);
  return Math.max(0,end-start-paused);
}
export function turnDuration(s,turn,now=Date.now()) {
  return turn.endedAt==null?Math.max(0,activeElapsedMs(s,turn.startedAt,Math.min(now,s.pausedAt??s.deadline??now))+(turn.adjustmentMs||0)):Math.max(0,turn.durationMs||0);
}
export function candidateSummary(s,id,now=Date.now()) {
  const turns=s.turns.filter(t=>t.candidateId===id&&t.phase==='group');
  const seconds=turns.reduce((total,t)=>total+turnDuration(s,t,now),0)/1000;
  const end=s.groupEndedAt??Math.min(now,s.pausedAt??s.deadline??now);
  const elapsed=s.groupStartedAt!=null?activeElapsedMs(s,s.groupStartedAt,end):s.settings.minutes*60000;
  // Historical records or manual corrections can exceed elapsed time. They must
  // never make one candidate's share, or the combined shares, exceed 100%.
  const recorded=s.turns.filter(t=>t.phase==='group').reduce((total,t)=>total+turnDuration(s,t,now),0);
  const groupMs=Math.max(elapsed,recorded);
  const percentage=groupMs>0?Math.min(100,seconds*1000/groupMs*100):0;
  return {seconds,percentage,rounds:turns.length,tone:percentage>50?'red':percentage<25?'yellow':'green'};
}

export const MISTAKES = [
 ['grammar','Grammar','文法'],['repetitive-words','Repetitive words','用詞重複'],['wrong-paraphrasing','Wrong paraphrasing','改述不當'],
 ['lack-explanation','Lack of explanation','缺乏解釋'],['lack-example','Lack of example','缺乏例子'],['wrong-structure','Wrong sentence structure','句子結構錯誤'],
 ['lack-response','Lack of response','缺乏回應'],['irrelevance','Irrelevance','離題'],['inactive','Inactive','參與不足'],['dominance','Conversation dominance','過度主導討論']
];
function closeSegment(s,turn,now){const part=turn.segments?.find(p=>p.id===turn.activeSegment);if(part){part.endedAt=Math.max(part.startedAt,Math.min(now,s.pausedAt??s.deadline??now));part.durationMs=activeElapsedMs(s,part.startedAt,part.endedAt);}turn.activeSegment=null;}
export function selectTurnPart(s,kind,now=Date.now()){
 advanceProfessionalSession(s,now);const turn=s.turns.find(t=>t.id===s.activeTurn);
 if(!turn||turn.phase!=='group'||!['response','argument','first-speaker','move-on'].includes(kind))return;
 const previous=turn.segments?.find(p=>p.id===turn.activeSegment);if(previous?.kind===kind)return;
 closeSegment(s,turn,now);turn.segments??=[];const part={id:globalThis.crypto.randomUUID(),kind,startedAt:now,endedAt:null,durationMs:0};turn.segments.push(part);turn.activeSegment=part.id;
}
export function turnPartMs(s,turn,kind,now=Date.now()){return (turn.segments||[]).filter(p=>p.kind===kind).reduce((n,p)=>n+(p.endedAt==null?activeElapsedMs(s,p.startedAt,Math.min(now,turn.endedAt??s.pausedAt??s.deadline??now)):p.durationMs),0);}
export function stopOverlap(s,now=Date.now()){const overlap=s.overlaps?.find(o=>o.id===s.activeOverlap);if(overlap){overlap.endedAt=Math.max(overlap.startedAt,Math.min(now,s.pausedAt??s.deadline??now));}s.activeOverlap=null;}
export function toggleOverlap(s,now=Date.now()){advanceProfessionalSession(s,now);if(s.phase!=='group')return;if(s.activeOverlap){stopOverlap(s,now);return;}s.overlaps??=[];const o={id:globalThis.crypto.randomUUID(),startedAt:now,endedAt:null};s.overlaps.push(o);s.activeOverlap=o.id;}
export function overlapMs(s,turn=null,now=Date.now()){return (s.overlaps||[]).reduce((n,o)=>n+activeElapsedMs(s,Math.max(o.startedAt,turn?.startedAt??0),Math.min(o.endedAt??s.pausedAt??s.deadline??now,turn?.endedAt??s.pausedAt??s.deadline??now,now)),0);}
export function adjustTurnDuration(s,turnId,deltaMs){const turn=s.turns.find(t=>t.id===turnId&&t.phase==='group');if(!turn||!Number.isFinite(deltaMs))return false;if(turn.endedAt!=null){turn.durationMs=Math.max(0,turn.durationMs+deltaMs);turn.adjustmentMs=(turn.adjustmentMs||0)+deltaMs;}else turn.adjustmentMs=(turn.adjustmentMs||0)+deltaMs;return true;}
export function endIndividualResponse(s,now=Date.now()){advanceProfessionalSession(s,now);if(!s.phase.startsWith('individual'))return;closeTurn(s,now);s.phase='individual-wait';s.deadline=null;}
export function setIndividualCandidate(s,index,now=Date.now()){if(!Number.isInteger(index)||index<0||index>=s.candidates.length)return false;if(s.activeTurn)closeTurn(s,now);s.individualIndex=index;s.phase='individual-wait';s.deadline=null;return true;}
export function startGroup(s,now=Date.now()){if(s.phase!=='group-wait')return false;s.phase='group';s.groupStartedAt=now;s.deadline=now+s.settings.minutes*60000;return true;}
export function toggleTimerPause(s,now=Date.now()){if(!['group','individual'].includes(s.phase))return false;if(s.pausedAt==null){s.pausedAt=now;return true;}const shift=Math.max(0,now-s.pausedAt);if(s.deadline!=null)s.deadline+=shift;s.pausePeriods??=[];s.pausePeriods.push({startedAt:s.pausedAt,endedAt:now});s.pausedAt=null;return true;}
export function adjustTime(s,seconds,now=Date.now()){if(!Number.isFinite(seconds)||!s.deadline)return false;const min=s.phase==='preparation'?0:now+1000;s.deadline=Math.max(min,s.deadline+seconds*1000);return true;}
export function endProfessionalSession(s,now=Date.now()){advanceProfessionalSession(s,now);if(s.phase==='results')return;s.endedEarly=true;if(s.phase==='group')s.groupEndedAt=s.pausedAt??now;closeTurn(s,now);complete(s,now);}
