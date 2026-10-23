#!/usr/bin/env node
// Freeze selected unpublished lessons plus canonical audio changed from the
// public site's main branch, including changes already committed to this draft.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {audioQueue,audioIdentityPayload} from './schema.mjs';

const destination=process.argv[2];
const selectedDirectory=process.argv[3];
const baseRef=process.argv[4]||'origin/main';
if(!destination||!selectedDirectory||process.argv.length>5)throw Error('Usage: node build-combined-audio-queue.mjs OUTPUT_DIRECTORY SELECTED_AUDIO_DIRECTORY [PUBLIC_BASE_REF]');
const baseCommit=execFileSync('git',['rev-parse','--verify',`${baseRef}^{commit}`],{encoding:'utf8'}).trim();
const selected=JSON.parse(fs.readFileSync(path.join(selectedDirectory,'audio-queue.generated.json'),'utf8'));
const selectedRecords=JSON.parse(fs.readFileSync(path.join(selectedDirectory,'canonical-snapshot.json'),'utf8')).lessons;
const changed=execFileSync('git',['diff','--name-only',baseCommit,'--','course-materials/advanced-native/batches'],{encoding:'utf8'}).trim().split(/\r?\n/).filter(Boolean);
const identity=clip=>{
 const key=audioIdentityPayload(clip);
 const serialized='{'+Object.keys(key).sort().map(name=>JSON.stringify(name)+': '+JSON.stringify(key[name])).join(', ')+'}';
 return createHash('sha256').update(serialized).digest('hex');
};
const clips=record=>audioQueue(record).map(clip=>({...clip,synthesisKey:identity(clip)}));
const canonicalChanges=[];const canonicalRecords=[];
for(const filename of changed){
 const oldData=JSON.parse(execFileSync('git',['show',`${baseCommit}:${filename}`],{encoding:'utf8',maxBuffer:32*1024*1024}));
 const nowData=JSON.parse(fs.readFileSync(filename,'utf8'));
 const oldRecords=Array.isArray(oldData)?oldData:oldData.lessons;
 const nowRecords=Array.isArray(nowData)?nowData:nowData.lessons;
 if(!Array.isArray(oldRecords)||!Array.isArray(nowRecords))throw Error(`Unexpected canonical batch: ${filename}`);
 const oldById=new Map(oldRecords.map(row=>[row.id,row]));
 for(const current of nowRecords){
  const before=oldById.get(current.id);if(!before)throw Error(`Unexpected new canonical record: ${current.id}`);
  if(JSON.stringify(before)===JSON.stringify(current))continue;
  const oldClips=new Map(clips(before).map(row=>[row.role,row]));
  const newClips=clips(current);
  canonicalRecords.push(current);
  for(const clip of newClips)if(oldClips.get(clip.role)?.synthesisKey!==clip.synthesisKey)canonicalChanges.push(clip);
 }
}
const queue=[...selected,...canonicalChanges];
const roles=new Set(queue.map(row=>`${row.moduleId}|${row.role}`));
if(roles.size!==queue.length)throw Error('Duplicate module/role in combined audio queue.');
const keys=new Set(queue.map(row=>row.synthesisKey));
if(keys.size!==queue.length)throw Error('Duplicate synthesis keys in combined audio queue.');
fs.mkdirSync(destination,{recursive:true});
const body=JSON.stringify(queue,null,2)+'\n';
fs.writeFileSync(path.join(destination,'audio-queue.generated.json'),body);
fs.writeFileSync(path.join(destination,'canonical-snapshot.json'),JSON.stringify({schemaVersion:1,lessons:[...selectedRecords,...canonicalRecords]},null,2)+'\n');
const report={status:'unpublished-local-audio-production',releaseApproved:false,publicBaseRef:baseRef,publicBaseCommit:baseCommit,selectedLessons:selectedRecords.length,selectedRoles:selected.length,changedCanonicalRecords:canonicalRecords.length,changedCanonicalAudioRoles:canonicalChanges.length,combinedRoles:queue.length,queueSha256:createHash('sha256').update(body).digest('hex')};
fs.writeFileSync(path.join(destination,'selected-revision.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
