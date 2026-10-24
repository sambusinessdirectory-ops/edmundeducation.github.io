#!/usr/bin/env node
// Checks that every user-approved one-off exclusion keeps its exact source and review trail.
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const base=resolve(root,'course-materials/advanced-native');
const lines=path=>readFileSync(resolve(base,path),'utf8').trim().split(/\r?\n/).filter(Boolean);
const sha=text=>createHash('sha256').update(text).digest('hex');
const source=new Map(lines('books10-16/source-inventory.jsonl').map(line=>{
 const row=JSON.parse(line);return [row.sourceId,row];
}));
const manifest=JSON.parse(readFileSync(resolve(base,'books10-16/editorial-decision-manifest.json'),'utf8'));
const decisions=new Map(manifest.decisionFiles.flatMap(name=>lines(`books10-16/${name}`).map(line=>{
 const row=JSON.parse(line);return [row.sourceOrdinal,{row,line,filename:name}];
})));
const register=lines('books10-16/one-off-exclusion-register.jsonl').map(JSON.parse);
const errors=[];
const seen=new Set();
for(const item of register){
 if(seen.has(item.sourceOrdinal))errors.push(`${item.sourceOrdinal}: duplicate register row`);
 seen.add(item.sourceOrdinal);
 const decision=decisions.get(item.sourceOrdinal);
 if(!decision||decision.row.action!=='excluded-one-off'||decision.row.canonicalId!==null)
  {errors.push(`${item.sourceOrdinal}: decision is not an ownerless exclusion`);continue;}
 if(item.sourceId!==decision.row.sourceId||item.expression!==decision.row.phrase||
    item.decisionFile!==decision.filename||item.excludedDecisionRowSha256!==sha(decision.line))
  errors.push(`${item.sourceOrdinal}: decision identity/hash mismatch`);
 if(source.get(item.sourceId)?.example!==item.exactSourceSentence)
  errors.push(`${item.sourceOrdinal}: exact source sentence mismatch`);
 if(decision.row.exclusionApproval?.authority!=='user'||
    decision.row.exclusionApproval.reference!==item.userApprovalReference||
    !decision.row.reason.includes(item.sourceSpecificReason))
  errors.push(`${item.sourceOrdinal}: approval/rationale mismatch`);
 if(item.reviewEvidencePath){
  const reviewPath=resolve(root,item.reviewEvidencePath);
  try{if(sha(readFileSync(reviewPath))!==item.reviewEvidenceSha256)
   errors.push(`${item.sourceOrdinal}: review-evidence hash mismatch`);
  }catch{errors.push(`${item.sourceOrdinal}: missing review evidence`);}
 }
}
for(const [ordinal,{row}] of decisions){
 if(row.action==='excluded-one-off'&&!seen.has(ordinal))errors.push(`${ordinal}: excluded source absent from register`);
}
console.log(JSON.stringify({excludedOneOff:register.length,sourceRows:source.size,
 registeredOrdinals:register.map(row=>row.sourceOrdinal),errorCount:errors.length,errors},null,2));
if(errors.length)process.exitCode=1;
