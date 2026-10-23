#!/usr/bin/env node
// Read-only cross-batch audit for provisional aliases to newly proposed owners.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const base=path.join(repo,'course-materials/advanced-native');
const decisionsDir=path.join(base,'books10-16');
const draftsDir=path.join(base,'drafts-books10-16');
const json=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const jsonl=file=>fs.readFileSync(file,'utf8').split(/\r?\n/).filter(Boolean).map(JSON.parse);

export function auditNewAliasOwners({decisions,sources,drafts}){
 const owners=new Map(decisions.filter(row=>row.action==='proposed-new-lesson').map(row=>[row.canonicalId,row]));
 const bySource=new Map(sources.map(row=>[row.sourceId,row]));
 const byDraft=new Map(drafts.map(row=>[row.id,row]));
 const aliases=decisions.filter(row=>row.action==='proposed-alias-new');
 const exceptions=[];
 let matchedDrafts=0;
 let awaitingDrafts=0;
 for(const alias of aliases){
  const owner=owners.get(alias.canonicalId);
  const source=bySource.get(alias.sourceId);
  const draft=byDraft.get(alias.canonicalId);
  let reason=null;
  if(!owner||owner.sourceOrdinal>=alias.sourceOrdinal)reason='earlier-proposed-owner-not-found';
  else if(!source?.example)reason='source-example-not-found';
  else if(!draft){awaitingDrafts++;continue;}
  else if(!draft.target?.pattern)reason='draft-target-pattern-not-found';
  else{
   try{
    if(new RegExp(draft.target.pattern,'gi').test(source.example))matchedDrafts++;
    else reason='source-example-does-not-match-owner';
   }catch{reason='invalid-owner-target-pattern';}
  }
  if(reason)exceptions.push({sourceOrdinal:alias.sourceOrdinal,canonicalId:alias.canonicalId,reason});
 }
 return {aliasNewRows:aliases.length,matchedDrafts,awaitingDrafts,exceptionCount:exceptions.length,exceptions};
}

export function runAudit({allDiscovered=false}={}){
 const decisionNames=allDiscovered
  ?fs.readdirSync(decisionsDir).filter(name=>/^editorial-decisions-\d+-\d+\.jsonl$/.test(name))
  :json(path.join(decisionsDir,'editorial-decision-manifest.json')).decisionFiles;
 const decisions=decisionNames.flatMap(name=>jsonl(path.join(decisionsDir,name)));
 const sources=jsonl(path.join(decisionsDir,'source-inventory.jsonl'));
 const draftNames=allDiscovered
  ?fs.readdirSync(draftsDir).filter(name=>/^batch-.*\.json$/.test(name))
  :json(path.join(draftsDir,'batch-manifest.json')).batchFiles;
 const drafts=draftNames.flatMap(name=>json(path.join(draftsDir,name)).lessons??[]);
 return {scope:allDiscovered?'all-discovered-provisional':'selected-manifests',decisionFiles:decisionNames.length,
  draftFiles:draftNames.length,...auditNewAliasOwners({decisions,sources,drafts})};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  const args=process.argv.slice(2);
  if(args.some(arg=>arg!=='--all-discovered'))throw new Error('Usage: audit-new-alias-owners.mjs [--all-discovered]');
  process.stdout.write(`${JSON.stringify(runAudit({allDiscovered:args.includes('--all-discovered')}))}\n`);
 }catch(error){console.error(error.message);process.exitCode=1;}
}
