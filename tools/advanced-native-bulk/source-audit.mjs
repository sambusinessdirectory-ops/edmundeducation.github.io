#!/usr/bin/env node
// Reconcile every extracted occurrence, including redirects and genuine sense splits.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export function auditSources({expressions,occurrences,records,aliases=[],splits=[]}){
 const errors=[],warnings=[],occurrenceMap=new Map(occurrences.map(o=>[o.occurrence_id,o]));
 const recordMap=new Map(records.map(r=>[r.id,r])),aliasMap=new Map(),expected=new Map();
 const moduleId=value=>`advanced-native-${String(Number(String(value).match(/\d+$/)?.[0])).padStart(3,'0')}`;
 const expressionByOccurrence=new Map();
 for(const e of expressions)for(const occurrenceId of e.occurrence_ids){
  if(!occurrenceMap.has(occurrenceId))errors.push({code:'inventory-occurrence-missing',occurrenceId});
  if(expressionByOccurrence.has(occurrenceId))errors.push({code:'occurrence-in-two-labels',occurrenceId});
  expressionByOccurrence.set(occurrenceId,e.inventory_id);
 }
 for(const a of aliases){
  const source=a.inventoryId||a.sourceInventoryId,target=a.canonicalId||a.targetModuleId;
  if(!source||!target){errors.push({code:'invalid-alias',alias:a});continue;}
  if(aliasMap.has(source)&&aliasMap.get(source)!==target)errors.push({code:'conflicting-alias',source});
  aliasMap.set(source,target);
 }
 function destination(inventoryId){
  let id=moduleId(inventoryId);const seen=new Set();
  while(aliasMap.has(`expr-${String(Number(id.match(/\d+$/)[0])).padStart(4,'0')}`)){
   if(seen.has(id)){errors.push({code:'alias-cycle',id});break;}
   seen.add(id);id=aliasMap.get(`expr-${String(Number(id.match(/\d+$/)[0])).padStart(4,'0')}`);
  }
  return id;
 }
 for(const o of occurrences){
  const inventoryId=expressionByOccurrence.get(o.occurrence_id);
  if(!inventoryId){errors.push({code:'unindexed-occurrence',occurrenceId:o.occurrence_id});continue;}
  expected.set(o.occurrence_id,destination(inventoryId));
 }
 const splitSeen=new Set();
 for(const split of splits)for(const a of split.assignments||[]){
  if(!occurrenceMap.has(a.occurrenceId))errors.push({code:'split-unknown-occurrence',...a});
  if(splitSeen.has(a.occurrenceId))errors.push({code:'conflicting-split',...a});
  splitSeen.add(a.occurrenceId);expected.set(a.occurrenceId,a.moduleId);
 }
 const claims=new Map();
 for(const r of records)for(const s of r.sources||[]){
  const original=occurrenceMap.get(s.occurrenceId);
  if(!original){errors.push({code:'unknown-source-claim',id:r.id,occurrenceId:s.occurrenceId});continue;}
  if(!claims.has(s.occurrenceId))claims.set(s.occurrenceId,new Set());claims.get(s.occurrenceId).add(r.id);
  const source=original.source;
  const fields={sentence:original.reference_sentence,expression:original.phrase,referenceSentenceKind:original.reference_sentence_kind,file:path.basename(source.path),sha256:source.document_sha256,page:source.pdf_page,book:source.book,question:source.question,sample:source.sample};
  for(const [field,value] of Object.entries(fields))if((s[field]??null)!==(value??null))errors.push({code:'source-field-mismatch',id:r.id,occurrenceId:s.occurrenceId,field,expected:value,actual:s[field]});
  if(expected.get(s.occurrenceId)!==r.id)errors.push({code:'wrong-sense-or-alias-claim',id:r.id,occurrenceId:s.occurrenceId,expectedModuleId:expected.get(s.occurrenceId)});
 }
 const rows=occurrences.map(o=>{
  const id=expected.get(o.occurrence_id),owners=[...(claims.get(o.occurrence_id)||[])];
  const baseline=Number(id?.match(/\d+$/)?.[0])<=10;
  if(owners.length>1)errors.push({code:'multiple-source-owners',occurrenceId:o.occurrence_id,owners});
  if(recordMap.has(id)&&!owners.includes(id))errors.push({code:'canonical-source-not-attached',id,occurrenceId:o.occurrence_id});
  return {occurrenceId:o.occurrence_id,inventoryId:expressionByOccurrence.get(o.occurrence_id),canonicalModuleId:id,state:baseline?'existing-baseline-mapped':owners.includes(id)?'attached-to-draft':'awaiting-draft',senseSplit:splitSeen.has(o.occurrence_id)};
 });
 for(const [source,target] of aliasMap)if(recordMap.has(moduleId(source)))errors.push({code:'alias-still-has-active-draft',source,target});
 return {generatedAt:new Date().toISOString(),summary:{sourceLabels:expressions.length,sourceOccurrences:occurrences.length,activeDrafts:records.length,mappedAliases:aliasMap.size,splitOccurrences:splitSeen.size,existingBaselineOccurrences:rows.filter(r=>r.state==='existing-baseline-mapped').length,attachedDraftOccurrences:rows.filter(r=>r.state==='attached-to-draft').length,pendingOccurrences:rows.filter(r=>r.state==='awaiting-draft').length,errors:errors.length,warnings:warnings.length,complete:rows.every(r=>r.state!=='awaiting-draft')&&errors.length===0},errors,warnings,rows};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const root=path.resolve(process.argv[2]||'work/advanced-native-full-20261016'),read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
 const files=fs.readdirSync(path.join(root,'drafts'));
 const records=files.filter(f=>/^batch-\d{4}-\d{4}\.json$/.test(f)).flatMap(f=>{const d=read(path.join(root,'drafts',f));return Array.isArray(d)?d:d.lessons;});
 const aliases=files.filter(f=>/^aliases-.*\.json$/.test(f)).flatMap(f=>{const d=read(path.join(root,'drafts',f));return Array.isArray(d)?d:d.aliases||[];});
 const splits=fs.readdirSync(path.join(root,'reviews')).filter(f=>/^sense-split-.*\.json$/.test(f)).map(f=>read(path.join(root,'reviews',f)));
 const result=auditSources({expressions:read(path.join(root,'sources/expressions.json')),occurrences:read(path.join(root,'sources/occurrences.json')),records,aliases,splits});
 fs.writeFileSync(path.join(root,'source-reconciliation.json'),JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify(result.summary,null,2));if(result.errors.length){console.log(JSON.stringify(result.errors.slice(0,20),null,2));process.exitCode=1;}
}
