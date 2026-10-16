import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {audioQueue} from './schema.mjs';

const directory=fs.mkdtempSync(path.join(os.tmpdir(),'advanced-preview-gate-'));
const script=fileURLToPath(new URL('./select-preview.mjs',import.meta.url));
const canonical=value=>Array.isArray(value)?value.map(canonical):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])])):value;
const digest=value=>createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
const fixture=JSON.parse(fs.readFileSync(new URL('./calibration-007.json',import.meta.url))).lessons[0];
fixture.id='advanced-native-011';fixture.number=11;
const state=path.join(directory,'state');
const write=(name,value)=>{const filename=path.join(directory,name);fs.mkdirSync(path.dirname(filename),{recursive:true});fs.writeFileSync(filename,JSON.stringify(value));};
const host='https://edmund-neural-audio.edmundeducation.workers.dev/assets/natural-english/audio/advanced-native/v1/';
function setup(){
 const clips=audioQueue(fixture).map(c=>({...c,synthesisKey:digest(c)})),metadata={},manifest={},uploaded={};
 metadata[fixture.id]=clips.map((c,i)=>({...c,sha256:String(i+1).repeat(64)}));
 manifest[fixture.id]=Object.fromEntries(clips.map(c=>[c.text,host+c.synthesisKey+'.mp3']));
 clips.forEach((c,i)=>uploaded['assets/natural-english/audio/advanced-native/v1/'+c.synthesisKey+'.mp3']=String(i+1).repeat(64));
 write('drafts/batch-0011-0025.json',{lessons:[fixture]});
 write('editorial-coverage.json',{reviewedCurrentIds:[fixture.id],reviewedCurrentRecords:[{id:fixture.id,canonicalContentSha256:digest(fixture)}]});
 write('progress.json',{savedDraftLessons:1,updatedAt:new Date().toISOString()});
 write('state/metadata.json',metadata);write('state/public-manifest.json',manifest);write('state/r2-uploaded.json',uploaded);
 return {clips,metadata,manifest,uploaded};
}
function run(name){
 const result=spawnSync(process.execPath,[script,directory,state,name],{encoding:'utf8'});
 assert.equal(result.status,0,result.stderr);
 return JSON.parse(fs.readFileSync(path.join(directory,'staging',name,'selection-evidence.json')));
}
try{
 setup();assert.equal(run('valid').selected,1);
 setup();const changed=structuredClone(fixture);changed.brief.meaningZh+='（資料修改）';write('drafts/batch-0011-0025.json',{lessons:[changed]});
 const stale=run('changed-text');assert.equal(stale.selected,0);assert.ok(stale.held[0].reasons.includes('current-revision-independent-AI-editorial-pass-pending'),'Same draft count cannot approve content changed after review.');
 let {metadata}=setup();metadata[fixture.id].find(c=>c.role==='speaking').voice='am_adam';write('state/metadata.json',metadata);
 assert.equal(run('wrong-voice').selected,0,'A text match cannot approve an American speaking voice.');
 setup();write('state/r2-uploaded.json',{});assert.equal(run('not-uploaded').selected,0,'A public URL without a matching upload digest is insufficient.');
 ({metadata}=setup());metadata[fixture.id].find(c=>c.role==='speaking').text+=' ';write('state/metadata.json',metadata);
 assert.equal(run('changed-audio-text').selected,0,'Audio is matched to exact text, not approximate wording.');
 setup();write('progress.json',{savedDraftLessons:1,updatedAt:new Date(Date.now()-120000).toISOString()});
 const expired=spawnSync(process.execPath,[script,directory,state,'expired'],{encoding:'utf8'});assert.notEqual(expired.status,0);assert.match(expired.stderr,/Refresh progress/);
 console.log('Preview gate: exact review revision, pinned voice, exact audio text, uploaded digest and fresh status verified.');
}finally{fs.rmSync(directory,{recursive:true,force:true});}
