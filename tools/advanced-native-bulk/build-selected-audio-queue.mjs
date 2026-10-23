#!/usr/bin/env node
// Freeze the selected unpublished draft revision for resumable local audio production.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {buildArtifacts} from './build.mjs';

const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const manifestPath=path.join(repo,'course-materials/advanced-native/drafts-books10-16/batch-manifest.json');
const destination=process.argv[2];
if(!destination||process.argv.length!==3)throw Error('Usage: node build-selected-audio-queue.mjs OUTPUT_DIRECTORY');
const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
if(manifest.status!=='unpublished-drafts'||!Array.isArray(manifest.batchFiles))throw Error('Expected selected unpublished draft manifest.');
const selected=manifest.batchFiles.map(name=>{
 if(!/^batch-[\w-]+\.json$/.test(name))throw Error(`Unexpected selected batch filename: ${name}`);
 const filename=path.join(path.dirname(manifestPath),name);
 const bytes=fs.readFileSync(filename);
 const data=JSON.parse(bytes);
 if(!Array.isArray(data.lessons))throw Error(`Missing lessons in ${name}`);
 return {name,sha256:createHash('sha256').update(bytes).digest('hex'),lessons:data.lessons};
});
const records=selected.flatMap(batch=>batch.lessons);
if(records.length!==manifest.expectedSourceOrdinals.length)throw Error('Selected lesson count and manifest ordinal count differ.');
const actual=records.map(row=>row.number).sort((a,b)=>a-b);
const expected=[...manifest.expectedSourceOrdinals].sort((a,b)=>a-b);
if(JSON.stringify(actual)!==JSON.stringify(expected))throw Error('Selected source ordinals differ from the draft manifest.');
const artifacts=buildArtifacts(records);
if(artifacts.validation.errors.length)throw Error(JSON.stringify(artifacts.validation.errors));
const queue=artifacts.files['audio-queue.generated.json'];
fs.mkdirSync(destination,{recursive:true});
const queuePath=path.join(destination,'audio-queue.generated.json');
fs.writeFileSync(queuePath,queue);
const evidence={status:'unpublished-local-audio-production',releaseApproved:false,
 selectedLessons:records.length,audioRoles:JSON.parse(queue).length,
 queueSha256:createHash('sha256').update(queue).digest('hex'),
 selectedBatches:selected.map(({name,sha256})=>({name,sha256}))};
fs.writeFileSync(path.join(destination,'selected-revision.json'),JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({queuePath,selectedLessons:evidence.selectedLessons,audioRoles:evidence.audioRoles,queueSha256:evidence.queueSha256}));
