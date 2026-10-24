#!/usr/bin/env node
// Read-only intake/ownership audit across every discovered provisional batch.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const base=path.join(repo,'course-materials/advanced-native');
const dir=path.join(base,'books10-16');
const json=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const jsonl=file=>fs.readFileSync(file,'utf8').split(/\r?\n/).filter(Boolean).map(JSON.parse);
export const DECISION_ACTIONS=['proposed-new-lesson','proposed-alias-existing','proposed-alias-new','hold-editorial','excluded-one-off'];

// Exclusion is a user-approved disposition, not an unaudited synonym for hold.
// Required JSONL fields: action:'excluded-one-off', canonicalId:null, a source-specific
// nonreusability reason, and exclusionApproval:{authority:'user',reference:'...'}.
export function oneOffExclusionErrors(row){
 const errors=[];
 if(row.canonicalId!==null)errors.push('excluded-row-has-owner');
 if(typeof row.reason!=='string'||row.reason.trim().length<80||
    !/\b(?:one[- ](?:off|time)|non[- ]reusable|not reusable|no reusable)\b/i.test(row.reason))
  errors.push('excluded-row-lacks-substantive-nonreusability-reason');
 if(row.exclusionApproval?.authority!=='user'||
    typeof row.exclusionApproval.reference!=='string'||row.exclusionApproval.reference.trim().length<20)
  errors.push('excluded-row-lacks-user-approval-reference');
 return errors;
}

export function auditProvisionalDecisions({decisions,sources,existingIds,firstOrdinal=2112}){
 const errors=[];
 if(decisions.length!==sources.length)errors.push({reason:'decision-source-row-count-mismatch',decisions:decisions.length,sources:sources.length});
 const sourceById=new Map(sources.map(source=>[source.sourceId,source]));
 const ownerById=new Map();
 const seenOrdinals=new Set();
 const seenSourceIds=new Set();
 const counts=Object.fromEntries(DECISION_ACTIONS.map(action=>[action,0]));
 const actions=new Set(DECISION_ACTIONS);
 for(let i=0;i<decisions.length;i++){
  const row=decisions[i];
  const ordinal=firstOrdinal+i;
  if(row.sourceOrdinal!==ordinal)errors.push({sourceOrdinal:row.sourceOrdinal,reason:'ordinal-gap-or-order',expected:ordinal});
  if(seenOrdinals.has(row.sourceOrdinal))errors.push({sourceOrdinal:row.sourceOrdinal,reason:'duplicate-ordinal'});
  if(seenSourceIds.has(row.sourceId))errors.push({sourceOrdinal:row.sourceOrdinal,reason:'duplicate-source-id'});
  seenOrdinals.add(row.sourceOrdinal);seenSourceIds.add(row.sourceId);
  const source=sourceById.get(row.sourceId);
  if(!source)errors.push({sourceOrdinal:row.sourceOrdinal,reason:'source-not-found'});
  else if(source.expression!==row.phrase)errors.push({sourceOrdinal:row.sourceOrdinal,reason:'source-phrase-mismatch'});
  if(!actions.has(row.action))errors.push({sourceOrdinal:row.sourceOrdinal,reason:'invalid-action'});
  else counts[row.action]=(counts[row.action]??0)+1;
  if(typeof row.reason!=='string'||row.reason.length<30)errors.push({sourceOrdinal:row.sourceOrdinal,reason:'insufficient-reason'});
  if(row.action==='proposed-new-lesson'){
   if(row.canonicalId!==`advanced-native-${row.sourceOrdinal}`)errors.push({sourceOrdinal:row.sourceOrdinal,reason:'new-owner-id-mismatch'});
   if(ownerById.has(row.canonicalId))errors.push({sourceOrdinal:row.sourceOrdinal,reason:'duplicate-new-owner'});
   ownerById.set(row.canonicalId,row.sourceOrdinal);
  }else if(row.action==='proposed-alias-existing'){
   if(!existingIds.has(row.canonicalId))errors.push({sourceOrdinal:row.sourceOrdinal,reason:'existing-owner-not-found'});
  }else if(row.action==='proposed-alias-new'){
   if(!ownerById.has(row.canonicalId))errors.push({sourceOrdinal:row.sourceOrdinal,reason:'earlier-new-owner-not-found'});
  }else if(row.action==='excluded-one-off'){
   for(const reason of oneOffExclusionErrors(row))errors.push({sourceOrdinal:row.sourceOrdinal,reason});
  }else if(row.action==='hold-editorial'&&row.canonicalId!==null){
   errors.push({sourceOrdinal:row.sourceOrdinal,reason:'held-row-has-owner'});
  }
 }
 return {decisionRows:decisions.length,firstOrdinal,throughOrdinal:firstOrdinal+decisions.length-1,
  counts,errorCount:errors.length,errors};
}

export function runAudit(){
 const files=fs.readdirSync(dir).filter(name=>/^editorial-decisions-\d+-\d+\.jsonl$/.test(name))
  .sort((a,b)=>Number(a.match(/\d+/)[0])-Number(b.match(/\d+/)[0]));
 const decisions=files.flatMap(name=>jsonl(path.join(dir,name)));
 const sources=jsonl(path.join(dir,'source-inventory.jsonl'));
 const existingIds=new Set(json(path.join(base,'provenance/curated-module-index.json')).map(row=>row.moduleId));
 return {decisionFiles:files.length,...auditProvisionalDecisions({decisions,sources,existingIds})};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{process.stdout.write(`${JSON.stringify(runAudit())}\n`);}
 catch(error){console.error(error.message);process.exitCode=1;}
}
