// Navigation cues use the existing transcript time base. Where an evidence
// phrase starts within a long cue, interpolate its word position; this is not
// forced alignment and intentionally retains a 15-second context lead-in.
const words = text => [...String(text).toLowerCase().replaceAll('’',"'").matchAll(/[a-z0-9]+/g)].map(match=>match[0]);
export function locateGuideEvidence(rows, evidence) {
 const needle=words(evidence), haystack=[], positions=[];
 for(const row of rows){
  const tokens=words(row.text);
  tokens.forEach((token,i)=>{haystack.push(token);positions.push({time:row.start+(row.end-row.start)*i/tokens.length,end:row.end});});
 }
 for(let i=0;i<=haystack.length-needle.length;i++){
  if(needle.length && needle.every((token,j)=>token===haystack[i+j]))return {audioTime:Math.round(positions[i].time*100)/100,audioEnd:positions[i+needle.length-1].end};
 }
 throw new Error(`Evidence not present in transcript: ${evidence}`);
}
