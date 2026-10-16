#!/usr/bin/env node
// Select exact reviewed records with uploaded pinned audio for local QA only.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {audioQueue,validateCatalogue,hasRequiredPronunciation} from './schema.mjs';
const [rootArg,stateArg,name]=process.argv.slice(2);
if(!rootArg||!stateArg||!name||!/^[a-zA-Z0-9-]+$/.test(name))throw Error('Usage: select-preview.mjs PRODUCTION_ROOT FROZEN_AUDIO_STATE FRESH_NAME');
const root=path.resolve(rootArg),state=path.resolve(stateArg),read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const coverage=read(path.join(root,'editorial-coverage.json'));
const reviewed=new Set(coverage.reviewedCurrentIds);
const reviewedHashes=new Map((coverage.reviewedCurrentRecords||[]).map(r=>[r.id,r.canonicalContentSha256]));
const canonical=value=>Array.isArray(value)?value.map(canonical):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])])):value;
const digest=value=>createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
const records=fs.readdirSync(path.join(root,'drafts')).filter(f=>/^batch-\d{4}-\d{4}\.json$/.test(f)).sort().flatMap(f=>{const d=read(path.join(root,'drafts',f));return Array.isArray(d)?d:d.lessons;});
// Refuse stale status: callers must refresh progress.mjs after an author edits.
const status=read(path.join(root,'progress.json'));
if(status.savedDraftLessons!==records.length||Date.now()-Date.parse(status.updatedAt)>60000)throw Error('Refresh progress.mjs immediately before selecting a preview.');
const validation=validateCatalogue(records);if(validation.errors.length)throw Error(JSON.stringify(validation.errors));
const metadata=read(path.join(state,'metadata.json')),manifest=read(path.join(state,'public-manifest.json')),uploaded=read(path.join(state,'r2-uploaded.json'));
const selected=[],held=[];
for(const record of records){
 const reasons=[];
 if(!reviewed.has(record.id)||reviewedHashes.get(record.id)!==digest(record))reasons.push('current-revision-independent-AI-editorial-pass-pending');
 for(const clip of audioQueue(record)){
  const row=metadata[record.id]?.find(r=>r.text===clip.text&&r.role===clip.role&&r.voice===clip.voice&&r.lang===clip.lang&&r.speed===clip.speed);
  const url=manifest[record.id]?.[clip.text];
  if(!row||!url){reasons.push(`${clip.role}:exact-pinned-audio-pending`);continue;}
  if(!hasRequiredPronunciation(clip,row)){reasons.push(`${clip.role}:required-pronunciation-version-pending`);continue;}
  if(!url.startsWith('https://edmund-neural-audio.edmundeducation.workers.dev/assets/natural-english/audio/advanced-native/v1/')||uploaded[new URL(url).pathname.slice(1)]!==row.sha256)reasons.push(`${clip.role}:verified-upload-pending`);
 }
 if(reasons.length)held.push({id:record.id,reasons});else selected.push(record);
}
const destination=path.join(root,'staging',name);if(fs.existsSync(destination))throw Error('Use a fresh name; previous QA evidence must stay immutable.');
fs.mkdirSync(destination,{recursive:true});
fs.writeFileSync(path.join(destination,'canonical-selection.json'),JSON.stringify({schemaVersion:1,lessons:selected},null,2)+'\n');
fs.writeFileSync(path.join(destination,'selection-evidence.json'),JSON.stringify({createdAt:new Date().toISOString(),audioState:path.relative(root,state),draftsConsidered:records.length,selected:selected.length,held,independentHumanApprovalClaimed:false,releaseApproved:false,purpose:'Local QA only. Public delivery checks, final content/media/device/release checks remain separate.'},null,2)+'\n');
console.log(JSON.stringify({destination,selectedNew:selected.length,totalWithBaseline:selected.length+10,held:held.length,releaseApproved:false}));
