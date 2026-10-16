#!/usr/bin/env node
// Exact whole-sentence screening, not proof of originality or independent prose.
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(process.argv[2]||'work/advanced-native-full-20261016');
const read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const normalise=t=>String(t).toLowerCase().replace(/[’‘]/g,"'").replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const sources=new Map();
for(const o of read('sources/occurrences.json')){
 const text=normalise(o.reference_sentence);if(text.split(' ').length<5)continue;
 if(!sources.has(text))sources.set(text,[]);sources.get(text).push(o.occurrence_id);
}
const records=fs.readdirSync(path.join(root,'drafts')).filter(f=>/^batch-\d{4}-\d{4}\.json$/.test(f)).flatMap(f=>{const x=read('drafts/'+f);return Array.isArray(x)?x:x.lessons;});
const flags=[];
for(const r of records){
 const sentences=[['listening',r.listening.en],['speaking',r.speaking.en],...r.takeaways.map((s,i)=>['takeaway-'+(i+1),s.en]),...r.writing.examples.map((s,i)=>['writing-example-'+(i+1),s.en])];
 for(const [field,text]of sentences){const matches=sources.get(normalise(text));if(matches)flags.push({moduleId:r.id,field,text,sourceOccurrenceIds:matches,decision:'editorial-review-required'});}
}
const report={checkedAt:new Date().toISOString(),lessons:records.length,teachingTextsChecked:records.length*6,method:'Exact whole-text equality after punctuation/apostrophe/case normalisation; source sentences of at least five words.',limitations:'Does not detect every copied subsection or prove original wording, contextual diversity, rights clearance or semantic quality. A flag requests individual editorial comparison.',flags};
fs.writeFileSync(path.join(root,'source-originality-audit.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({lessons:records.length,teachingTextsChecked:records.length*6,flags:flags.length,findings:flags},null,2));
if(flags.length)process.exitCode=1;
