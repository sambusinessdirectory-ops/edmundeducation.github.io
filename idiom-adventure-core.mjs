// Pure progression rules. Adventure rewards are local; lesson answers use the existing account pipeline.
export const DAY = 86400000;
export const COMPANIONS = [
  { id: 'moss', name: '苔苔', en: 'Moss', role: '語意嚮導', skill: '語意燈籠', description: '照亮慣用語的意思，先掌握情境。', color: '#89d4a6' },
  { id: 'ember', name: '星尾', en: 'Ember', role: '線索獵手', skill: '差異視野', description: '標出選項的不同字詞，細看時態與語氣。', color: '#ffbb79' },
  { id: 'tide', name: '泡泡', en: 'Tide', role: '冷靜守護者', skill: '排除迷霧', description: '移除一個錯誤選項，縮小判斷範圍。', color: '#8cd4e8' }
];
export const REGIONS = [
  { name:'萌芽森林', en:'Firstlight Grove', color:'#78c9a5', motif:'forest' },
  { name:'珊瑚海灣', en:'Coral Cove', color:'#7fd1df', motif:'water' },
  { name:'琥珀沙丘', en:'Amber Dunes', color:'#eebc76', motif:'desert' },
  { name:'紫晶山脊', en:'Amethyst Ridge', color:'#b6a3e0', motif:'mountain' },
  { name:'雲端花園', en:'Cloud Gardens', color:'#a4d5b0', motif:'garden' },
  { name:'星光群峰', en:'Starlight Peaks', color:'#a6b8e6', motif:'stars' }
];
export const freshProfile = () => ({ version:1, sound:false, companion:'moss', region:0, records:{}, seals:{}, runs:0, active:null });
export function normalizeProfile(value) {
  const p=freshProfile();
  if (!value || value.version!==1) return p;
  if (COMPANIONS.some(c=>c.id===value.companion)) p.companion=value.companion;
  p.region=Math.min(5,Math.max(0,Math.trunc(Number(value.region)||0)));
  p.sound=value.sound===true;
  p.runs=Math.max(0,Math.trunc(Number(value.runs)||0));
  for(const [id,r] of Object.entries(value.records||{})) if(r && typeof r==='object' && Number.isFinite(r.due)) {
    p.records[id]={...r,xp:Math.max(0,Math.min(1000,Number(r.xp)||0)),interval:Math.max(1,Math.min(7,Number(r.interval)||1))};
  }
  for(const [id,n] of Object.entries(value.seals||{})) if(Number.isFinite(n)) p.seals[id]=n;
  const a=value.active;
  if(a && Array.isArray(a.ids) && a.ids.length===6 && new Set(a.ids).size===6 && a.ids.every(id=>typeof id==='string') && typeof a.lessonId==='string') {
    p.active={...a,index:Math.max(0,Math.min(6,Math.trunc(Number(a.index)||0))),charges:Math.max(0,Math.min(2,Math.trunc(Number(a.charges)||0))),solved:!!a.solved,attempted:!!a.attempted,help:!!a.help,earned:Math.max(0,Number(a.earned)||0)};
  }
  return p;
}
export function stats(p) {
  const records=Object.values(p.records), xp=records.reduce((n,r)=>n+r.xp,0);
  return { xp, level:1+Math.floor(xp/120), next:120-xp%120, seals:Object.keys(p.seals).length, learned:records.filter(r=>r.passed).length };
}
export function companionStage(p,id) {
  const count=Object.values(p.records).filter(r=>r.passed&&r.companion===id).length;
  return { count, level:count>=36?3:count>=12?2:1, next:count>=36?null:count>=12?36:12 };
}
export function planExpedition(questions,p,mode,completed=[],now=Date.now()) {
  const done=new Set(completed);
  return questions.map((q,i)=>({id:q.id,i,rank:mode==='review'
    ? (p.records[q.id]?.due<=now ? -20 : done.has(q.id)?0:10)
    : (p.records[q.id]?.missed ? -10 : !done.has(q.id)&&!p.records[q.id]?.passed ? 0 : 10), last:p.records[q.id]?.last||0}))
    .sort((a,b)=>a.rank-b.rank||a.last-b.last||a.i-b.i).slice(0,6).map(q=>q.id);
}
export function recordAnswer(p,id,correct,{now=Date.now(),assisted=false,firstTry=true}={}) {
  const previous=p.records[id];
  const r=previous?{...previous}:{xp:0,interval:1,passed:false,lastAward:0,companion:p.companion};
  if(!correct) { r.missed=true;r.due=now;r.interval=1;p.records[id]=r;return 0; }
  const reward=!r.passed?10:(r.due<=now && now-r.lastAward>=DAY?5:0);
  r.xp+=reward;r.last=now;if(reward)r.lastAward=now;
  r.interval=firstTry&&!assisted&&r.passed?Math.min(7,r.interval*2):1;
  r.passed=true;r.missed=!firstTry;r.due=now+r.interval*DAY;
  p.records[id]=r;return reward;
}
export function advance(p,now=Date.now()) {
  const a=p.active;
  if(!a?.solved) return false;
  a.index++;a.solved=false;a.attempted=false;a.help=false;a.selection=null;
  if(a.index===6){p.runs++;p.seals[a.lessonId]=now;return true;}
  return false;
}
