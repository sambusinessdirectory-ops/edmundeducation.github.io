import fs from 'node:fs';import assert from 'node:assert/strict';import crypto from 'node:crypto';import {modules} from '../polysemy-lab/catalogue.mjs';
const root=new URL('../polysemy-lab/',import.meta.url),voices=['american-female','american-male','british-male','british-female'];
const local=JSON.parse(fs.readFileSync(new URL('audio-new-local.json',root))),cloud=JSON.parse(fs.readFileSync(new URL('audio-new-cloud.json',root))),merged={...local,...cloud},manifest={};
for(const m of modules.filter(m=>m.id!=='show'))for(const q of m.questions){const r=merged[q.id];assert.ok(r,'Missing audio: '+q.id);assert.equal(r.voice,voices[q.sentenceIndex%4]);assert.equal(r.text,q.en);assert.equal(r.sourceSha256,crypto.createHash('sha256').update(q.en).digest('hex'));assert.ok(fs.statSync(new URL(r.path,root)).size>1000);manifest[q.id]=r;}
fs.writeFileSync(new URL('audio-new.json',root),JSON.stringify(manifest,null,2)+'\n');console.log('Complete audio manifest:',Object.keys(manifest).length);
