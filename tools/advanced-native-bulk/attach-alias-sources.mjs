#!/usr/bin/env node
// Attach only the source occurrences already assigned by an explicit alias record.
// The source audit is the authority for destinations; exercise wording is untouched.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const root=path.resolve(process.argv[2]||'work/advanced-native-full-20261016');
const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
const sha=r=>createHash('sha256').update(JSON.stringify(canonical(r))).digest('hex');
const audit=read(path.join(root,'source-reconciliation.json'));
if(audit.errors.some(e=>e.code!=='canonical-source-not-attached'))throw Error('Resolve non-attachment source audit errors first.');
const occurrences=new Map(read(path.join(root,'sources/occurrences.json')).map(o=>[o.occurrence_id,o]));
const changes=[];
for(const file of fs.readdirSync(path.join(root,'drafts')).filter(f=>/^batch-\d{4}-\d{4}\.json$/.test(f))){
 const filename=path.join(root,'drafts',file),data=read(filename),records=Array.isArray(data)?data:data.lessons;let modified=false;
 for(const record of records){
  const missing=audit.errors.filter(e=>e.code==='canonical-source-not-attached'&&e.id===record.id);if(!missing.length)continue;
  const beforeRecord=structuredClone(record),added=[];
  for(const e of missing){
   const o=occurrences.get(e.occurrenceId),s=o.source;
   if(record.sources.some(existing=>existing.occurrenceId===o.occurrence_id))continue;
   record.sources.push({occurrenceId:o.occurrence_id,file:path.basename(s.path),sha256:s.document_sha256,page:s.pdf_page,book:s.book,question:s.question,sample:s.sample,locatorNote:s.book===null||s.question===null||s.sample===null?'The guide gives no online book/question/sample locator for this highlighted source sentence.':'',sentence:o.reference_sentence,expression:o.phrase,referenceSentenceKind:o.reference_sentence_kind,sourceCategory:o.type});
   added.push(o.occurrence_id);
  }
  changes.push({moduleId:record.id,beforeSha256:sha(beforeRecord),afterSha256:sha(record),addedOccurrenceIds:added,beforeRecord});modified=true;
 }
 if(modified){const temp=filename+'.source-tmp';fs.writeFileSync(temp,JSON.stringify(data,null,2)+'\n');fs.renameSync(temp,filename);}
}
const evidence={recordedAt:new Date().toISOString(),type:'verified-source-only-transformation',scope:'Only sources arrays changed; inherit prior editorial review only when its exact before-record hash passed. This is not a new full editorial, listening or release approval.',changes};
const output=path.join(root,'reviews',`source-only-transform-${Date.now()}.json`);fs.writeFileSync(output,JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({changedRecords:changes.length,addedOccurrences:changes.reduce((n,c)=>n+c.addedOccurrenceIds.length,0),evidence:output},null,2));
