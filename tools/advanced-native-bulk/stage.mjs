#!/usr/bin/env node
// Prepare a local browser preview; this neither approves nor deploys a release.
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {buildArtifacts} from './build.mjs';
import {audioQueue,hasRequiredPronunciation} from './schema.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const args=process.argv.slice(2),stateIndex=args.indexOf('--audio-state');
if(stateIndex<0||!args[stateIndex+1])throw Error('Usage: stage.mjs INPUT.json [...] --audio-state STATE_DIR');
const inputs=args.slice(0,stateIndex),state=path.resolve(args[stateIndex+1]);
const load=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const records=inputs.flatMap(file=>{const data=load(file);return Array.isArray(data)?data:data.lessons;});
if(!records.length||records.some(r=>r.number<=10))throw Error('Stage only new records; the approved first ten are preserved.');
const artifacts=buildArtifacts(records);
if(artifacts.validation.errors.length)throw Error(JSON.stringify(artifacts.validation));
const publicManifest=load(path.join(state,'public-manifest.json')),metadata=load(path.join(state,'metadata.json'));
// The shared production queue may contain later, unfinished batches. Verify
// every selected role below rather than treating unrelated pending work as a
// reason to accept or reject this exact preview selection.
const uploaded=load(path.join(state,'r2-uploaded.json'));
for(const record of records)for(const clip of audioQueue(record)){
 const url=publicManifest[record.id]?.[clip.text];
 const row=metadata[record.id]?.find(r=>r.text===clip.text&&r.role===clip.role);
 if(!url||!row||row.voice!==clip.voice||row.lang!==clip.lang||row.speed!==clip.speed)throw Error(`${record.id}: missing/mismatched ${clip.role} audio.`);
 if(!hasRequiredPronunciation(clip,row))throw Error(`${record.id}: required pronunciation version missing/mismatched for ${clip.role}.`);
 const key=new URL(url).pathname.slice(1);
 if(!url.startsWith('https://edmund-neural-audio.edmundeducation.workers.dev/assets/natural-english/audio/advanced-native/v1/')||uploaded[key]!==row.sha256)throw Error(`${record.id}: audio upload is not evidenced.`);
}
const oldManifest=(await import(pathToFileURL(path.join(root,'natural-english/audio/advanced-manifest.mjs')))).default;
const oldMetadata=load(path.join(root,'natural-english/audio/advanced-metadata.json'));
const atomicWrite=(filename,body)=>{
 fs.mkdirSync(path.dirname(filename),{recursive:true});
 if(fs.existsSync(filename)&&fs.readFileSync(filename,'utf8')===body)return;
 const temporary=filename+'.stage-tmp';fs.writeFileSync(temporary,body);fs.renameSync(temporary,filename);
};
// Install immutable hashed payloads first and the index last. Keep old shards
// available for a browser that still has the preceding cached index.
for(const [name,body] of Object.entries(artifacts.files))if(name.startsWith('advanced-content/'))atomicWrite(path.join(root,'natural-english',name),body);
atomicWrite(path.join(root,'natural-english/advanced-targets.generated.mjs'),artifacts.files['advanced-targets.generated.mjs']);
const selectedManifest=Object.fromEntries(records.map(r=>[r.id,publicManifest[r.id]]));
const selectedMetadata=Object.fromEntries(records.map(r=>[r.id,metadata[r.id]]));
atomicWrite(path.join(root,'natural-english/audio/advanced-manifest.mjs'),'export default '+JSON.stringify({...oldManifest,...selectedManifest})+';\n');
atomicWrite(path.join(root,'natural-english/audio/advanced-metadata.json'),JSON.stringify({...oldMetadata,...selectedMetadata})+'\n');
atomicWrite(path.join(root,'natural-english/advanced-imported.generated.mjs'),artifacts.files['advanced-imported.generated.mjs']);
fs.writeFileSync(path.join(state,'local-stage.json'),JSON.stringify({stagedAt:new Date().toISOString(),ids:records.map(r=>r.id),questions:records.length*6,releaseApproved:false,publicCourseDeployment:'pending'},null,2)+'\n');
console.log(`Locally staged ${records.length} new lessons with uploaded audio. Publication is still pending.`);
