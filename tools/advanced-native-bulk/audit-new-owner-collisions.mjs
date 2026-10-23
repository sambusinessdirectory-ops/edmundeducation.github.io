#!/usr/bin/env node
// Read-only screen for new lesson proposals whose source also matches a prior owner.
// A regex hit is a review lead, never an automatic semantic merge.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {targetPatterns as legacyTargets} from '../../natural-english/advanced-display.mjs';

const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const base=path.join(repo,'course-materials/advanced-native');
const sourceDir=path.join(base,'books10-16');
const readJson=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const readJsonl=file=>fs.readFileSync(file,'utf8').split(/\r?\n/).filter(Boolean).map(JSON.parse);
const normalize=text=>String(text??'').toLowerCase().replace(/[’']/g,"'").replace(/[^\p{L}\p{N}]+/gu,' ').trim();

export function auditNewOwners({decisions,sources,lessons,legacyTargetPatterns={}}){
 const sourceById=new Map(sources.map(row=>[row.sourceId,row]));
 const collisions=[];
 for(const proposal of decisions.filter(row=>row.action==='proposed-new-lesson')){
  const source=sourceById.get(proposal.sourceId);
  if(!source)throw new Error(`${proposal.sourceId}: source missing`);
  for(const lesson of lessons){
   const pattern=lesson.target?.pattern??legacyTargetPatterns[lesson.id];
   const title=lesson.titleEn??lesson.expression??'';
   const exactTitle=normalize(proposal.phrase)===normalize(title);
   const exactSourceExpression=(lesson.sources??[]).some(item=>normalize(item.expression)===normalize(proposal.phrase));
   let detectorMatch=false;
   if(pattern){
    try{detectorMatch=new RegExp(pattern,'gi').test(source.example??'');}
    catch{continue;}
   }
   if(exactTitle||exactSourceExpression||detectorMatch)collisions.push({
    sourceOrdinal:proposal.sourceOrdinal,phrase:proposal.phrase,canonicalId:lesson.id,
    canonicalTitle:title,exactTitle,exactSourceExpression,detectorMatch,
    sourceExample:source.example,
   });
  }
 }
 collisions.sort((a,b)=>a.sourceOrdinal-b.sourceOrdinal||Number(b.exactTitle)-Number(a.exactTitle)||Number(b.exactSourceExpression)-Number(a.exactSourceExpression)||a.canonicalId.localeCompare(b.canonicalId));
 return {proposedNew:decisions.filter(row=>row.action==='proposed-new-lesson').length,
  collisions:collisions.length,exactTitleCollisions:collisions.filter(row=>row.exactTitle).length,
  exactSourceExpressionCollisions:collisions.filter(row=>row.exactSourceExpression).length,
  records:collisions};
}

export function runAudit(){
 const decisionManifest=readJson(path.join(sourceDir,'editorial-decision-manifest.json'));
 const decisions=decisionManifest.decisionFiles.flatMap(name=>readJsonl(path.join(sourceDir,name)));
 const sources=readJsonl(path.join(sourceDir,'source-inventory.jsonl'));
 const release=readJson(path.join(base,'release-index.json'));
 const lessons=release.canonicalInputFiles.flatMap(name=>{
  const content=readJson(path.join(base,name));
  return Array.isArray(content)?content:content.lessons;
 });
 const patterns=Object.fromEntries(Array.from({length:10},(_,index)=>{
  const id=`advanced-native-${String(index+1).padStart(3,'0')}`;
  return [id,legacyTargets[id]];
 }));
 return auditNewOwners({decisions,sources,lessons,legacyTargetPatterns:patterns});
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{process.stdout.write(`${JSON.stringify(runAudit())}\n`);}
 catch(error){console.error(error.message);process.exitCode=1;}
}
