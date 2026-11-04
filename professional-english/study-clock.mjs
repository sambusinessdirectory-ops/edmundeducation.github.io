// Only advancing the exercise renews the ten-minute allowance. Scrolling,
// audio, focus changes and unrelated controls must not extend an idle session.
export const STUDY_IDLE_MS=10*60*1000;
export function createStudyClock({now=Date.now,initialMs=0,active=true}={}){
 let previous=now(),deadline=previous+STUDY_IDLE_MS,elapsedMs=Number.isFinite(Number(initialMs))?Math.max(0,Number(initialMs)):0,running=active;
 function sample(){
  const time=now();
  if(running)elapsedMs+=Math.max(0,Math.min(time,deadline)-previous);
  previous=time;
  return {elapsedMs,paused:time>=deadline};
 }
 return {
  sample,
  progress(){sample();deadline=now()+STUDY_IDLE_MS;return sample();},
  setActive(value){sample();running=Boolean(value);return sample();}
 };
}
