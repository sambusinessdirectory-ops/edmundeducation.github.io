import fs from 'node:fs';
export function audibleKey(s){
 s=s.toLowerCase().replace(/’/g,"'");
 for(const group of [["to", "too", "two"], ["there", "their", "they're"], ["your", "you're"], ["hear", "here"], ["its", "it's"], ["no", "know"], ["new", "knew"], ["right", "write"], ["one", "won"], ["weather", "whether"], ["grey", "gray"], ["travelling", "traveling"]])for(const word of group)s=s.replace(new RegExp('\\b'+word+'\\b','g'),group[0]);
 return s.replace(/colours?/g,x=>x.replace('u','')).replace(/favourite/g,'favorite').replace(/honour/g,'honor').replace(/centre/g,'center').replace(/recognise/g,'recognize').replace(/realise/g,'realize').replace(/[^a-z0-9]/g,'');
}
export function checkSong(d){
 const errors=[];
 for(const m of d.exercises||[]){
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
