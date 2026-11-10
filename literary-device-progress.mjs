export const PROGRESS_KEY='literaryDeviceProgressV1';

export function emptyProgress(){
 return {version:1,modes:{},updatedAt:0};
}

function cleanAnswer(value){
 if(!value||typeof value!=='object')return null;
 return {
  correct:value.correct===true,
  selectedLabels:Array.isArray(value.selectedLabels)?value.selectedLabels.filter(v=>typeof v==='string').slice(0,4):[]
 };
}

export function normalizeProgress(value){
 const result=emptyProgress();
 if(!value||typeof value!=='object')return result;
 result.updatedAt=Number.isFinite(+value.updatedAt)?+value.updatedAt:0;
 for(const mode of ['#exercise','#correct-usage']){
  const source=value.modes?.[mode];
  if(!source||typeof source!=='object')continue;
  const answers={};
  for(const [id,answer] of Object.entries(source.answers||{})){
   const cleaned=cleanAnswer(answer);
   if(cleaned)answers[String(id)]=cleaned;
  }
  result.modes[mode]={
   order:Array.isArray(source.order)?source.order.map(String).filter(Boolean):[],
   currentId:source.currentId==null?'':String(source.currentId),
   answers,
   legacyCredit:Math.max(0,Math.floor(Number(source.legacyCredit)||0))
  };
 }
 return result;
}

export function mergeProgress(remoteValue,localValue){
 const remote=normalizeProgress(remoteValue),local=normalizeProgress(localValue);
 const merged=emptyProgress();
 for(const mode of ['#exercise','#correct-usage']){
  const a=remote.modes[mode],b=local.modes[mode];
  if(!a&&!b)continue;
  const newer=local.updatedAt>remote.updatedAt?b:a;
  merged.modes[mode]={
   order:[...(newer?.order||a?.order||b?.order||[])],
   currentId:newer?.currentId||a?.currentId||b?.currentId||'',
   answers:{...(a?.answers||{}),...(b?.answers||{})},
   legacyCredit:Math.max(a?.legacyCredit||0,b?.legacyCredit||0)
  };
 }
 merged.updatedAt=Math.max(remote.updatedAt,local.updatedAt);
 return merged;
}

export function progressCount(modeState,total){
 const answered=Object.keys(modeState?.answers||{}).length;
 return Math.min(total,answered+Math.max(0,modeState?.legacyCredit||0));
}
