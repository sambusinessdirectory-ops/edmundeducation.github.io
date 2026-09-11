import fs from 'node:fs';
import vm from 'node:vm';
import {classify, labels} from './dse-speaking-question-types.mjs';
const c={window:{}};
for(const file of ['dse-speaking-data.js','dse-speaking-paper-supplement.js','dse-speaking-translations.js'])vm.runInNewContext(fs.readFileSync(file,'utf8'),c);
const sets=[...c.window.EDMUND_DSE_SPEAKING_DATA.sets,...c.window.EDMUND_DSE_SPEAKING_SUPPLEMENT.sets];
const translations=c.window.EDMUND_DSE_SPEAKING_TRANSLATIONS;
const overrides=JSON.parse(fs.readFileSync('tools/dse-speaking-question-type-overrides.json'));
const rows=sets.flatMap(set=>['group','individual'].flatMap(section=>{
  const key=section==='group'?'groupDiscussion':'individualResponse';
  return set[key].map((text,i)=>{
    const id=`${set.year}:${set.set}:${section}:${i+1}`;
    return {id,year:set.year,set:set.set,title:set.title,section,number:i+1,text,translation:translations[`${set.year}:${set.set}`]?.[key]?.[i]||'',types:overrides[id]||classify(text,section),href:`speaking-system.html?view=dse-question&paper=${set.year}-${set.set}&part=${section}&question=${i+1}`};
  });
}));
for(const id of Object.keys(overrides))if(!rows.some(r=>r.id===id))throw Error(`Unknown override ${id}`);
const counts=Object.fromEntries(Object.keys(labels).map(type=>{const matching=rows.filter(r=>r.types.includes(type));return [type,{questions:matching.length,group:matching.filter(r=>r.section==='group').length,individual:matching.filter(r=>r.section==='individual').length,sets:new Set(matching.map(r=>`${r.year}:${r.set}`)).size}];}));
fs.writeFileSync('dse-speaking-question-types.json',JSON.stringify({version:1,labels,counts,setCount:sets.length,questionCount:rows.length,rows},null,2)+'\n');
console.log(JSON.stringify(counts,null,2));
fs.writeFileSync('/tmp/dse-question-type-audit.txt',Object.keys(labels).map(type=>`\n${type.toUpperCase()}\n`+rows.filter(r=>r.types.length===1&&r.types[0]===type).map(r=>`${r.id}\t${r.text}`).join('\n')).join('\n'));
