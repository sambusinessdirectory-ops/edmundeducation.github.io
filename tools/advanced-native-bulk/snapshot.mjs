#!/usr/bin/env node
// Freeze the exact canonical inputs of a resumable production run. No release.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {buildArtifacts} from './build.mjs';
const root=path.resolve(process.argv[2]||'work/advanced-native-full-20261016');
const name=process.argv[3]||new Date().toISOString().replace(/[:.]/g,'-');
if(!/^[a-zA-Z0-9-]+$/.test(name))throw Error('Use a plain snapshot name.');
const draftDir=path.join(root,'drafts');
const inputs=fs.readdirSync(draftDir).filter(f=>/^batch-\d{4}-\d{4}\.json$/.test(f)).sort();
const records=inputs.flatMap(f=>{const d=JSON.parse(fs.readFileSync(path.join(draftDir,f)));return Array.isArray(d)?d:d.lessons;});
const output=path.join(root,'staging',name);if(fs.existsSync(output))throw Error('Snapshot already exists; use a fresh name so running jobs keep their exact inputs.');
const artifacts=buildArtifacts(records);if(artifacts.validation.errors.length)throw Error(JSON.stringify(artifacts.validation.errors));
fs.mkdirSync(output,{recursive:true});
for(const [file,body] of Object.entries(artifacts.files)){const dest=path.join(output,file);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,body);}
const body=JSON.stringify({schemaVersion:1,lessons:records},null,2)+'\n';
fs.writeFileSync(path.join(output,'canonical-snapshot.json'),body);
fs.writeFileSync(path.join(output,'snapshot.json'),JSON.stringify({createdAt:new Date().toISOString(),inputs,lessons:records.length,canonicalSha256:createHash('sha256').update(body).digest('hex'),purpose:'Draft production; not editorial or release approval'},null,2)+'\n');
console.log(JSON.stringify({output,lessons:records.length,warnings:artifacts.validation.warnings},null,2));
