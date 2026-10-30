import fs from 'node:fs';
import {editorialIssues} from './song-editorial/quality.mjs';
export function audibleKey(s){
 s=s.toLowerCase().replace(/’/g,"'");
 for(const group of [["to", "too", "two"], ["there", "their", "they're"], ["your", "you're"], ["hear", "here"], ["its", "it's"], ["no", "know"], ["new", "knew"], ["right", "write"], ["one", "won"], ["weather", "whether"], ["grey", "gray"], ["travelling", "traveling"]])for(const word of group)s=s.replace(new RegExp('\\b'+word+'\\b','g'),group[0]);
 return s.replace(/colours?/g,x=>x.replace('u','')).replace(/favourite/g,'favorite').replace(/honour/g,'honor').replace(/centre/g,'center').replace(/recognise/g,'recognize').replace(/realise/g,'realize').replace(/[^a-z0-9]/g,'');
}
export function checkSong(d){
 const errors=editorialIssues(d);
 for(const m of d.exercises||[]){
  const ids=(d.translations||[]).filter(r=>!r.break).map(r=>r.lineId);
  const lines=m.listeningLines||[];
  if(new Set(ids).size!==ids.length || JSON.stringify(lines.map(l=>l.lineId))!==JSON.stringify(ids))errors.push(m.id+': lyric occurrences missing, merged or reordered');
  const byNumber=new Map(m.questions.map(q=>[q.number,q]));
  const route=lines.flatMap(l=>[...l.prompt.matchAll(/\{\{q:(\d+)\}\}/g)].map(x=>{const n=Number(x[1]);if(byNumber.get(n)?.lineId!==l.lineId)errors.push(m.id+': misplaced question '+n);return n;}));
  if(JSON.stringify([...route].sort((a,b)=>a-b))!==JSON.stringify([...byNumber.keys()].sort((a,b)=>a-b)))errors.push(m.id+': missing or duplicated question marker');
  const flowPositions=route.map(n=>{const q=byNumber.get(n);return q?.options.indexOf(q.answer);});
  flowPositions.forEach((p,i)=>{if(i>1&&p===flowPositions[i-1]&&p===flowPositions[i-2])errors.push(m.id+': three identical answer positions in song order');});
  const positions=[];
  for(const q of [...m.questions].sort((a,b)=>a.number-b.number)){
   const keys=q.options.map(audibleKey);if(new Set(keys).size!==keys.length)errors.push(m.id+' Q'+q.number+': indistinguishable choices');
   positions.push(q.options.indexOf(q.answer));
  }
  positions.forEach((p,i)=>{if(p<0)errors.push(m.id+': answer absent');if(i>1&&p===positions[i-1]&&p===positions[i-2])errors.push(m.id+' Q'+(i+1)+': three identical answer positions');});
 }
 const v=d.vocabulary||[];v.forEach((q,i)=>{if(i>1&&q.answer===v[i-1].answer&&q.answer===v[i-2].answer)errors.push('vocabulary Q'+q.number+': three identical answer positions');});
 return errors;
}
let failures=0,count=0;
for(const file of fs.readdirSync('tools/song-content').filter(x=>x.endsWith('.json'))){count++;const d=JSON.parse(fs.readFileSync('tools/song-content/'+file));for(const e of checkSong(d)){console.error(file+': '+e);failures++;}}
if(failures)process.exitCode=1;else console.log('Song quality gate passed: '+count+' lessons; no spelling/spacing/punctuation duplicates or answer-position triplets.');
