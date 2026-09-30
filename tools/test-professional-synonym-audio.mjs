import assert from 'node:assert/strict';
import {readFileSync,existsSync,statSync,openSync,readSync,closeSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('../professional-english/',import.meta.url);
const data=JSON.parse(readFileSync(new URL('content/lesson-5-synonyms.json',root),'utf8'));
const manifest=JSON.parse(readFileSync(new URL('content/lesson-5-synonym-audio.json',root),'utf8'));
let checked=0;
for(const module of data.modules)for(const question of module.questions){
 const key=`${module.id}:${question.id}`,clip=manifest[key];
 assert.ok(clip,`Missing clip: ${key}`);
 assert.equal(clip.voice,'american-female');
 assert.equal(clip.sourceSha256,createHash('sha256').update(question.original.trim()).digest('hex'));
 const file=new URL(clip.path,root);
 assert.ok(existsSync(file),`Missing audio file: ${key}`);
 assert.ok(statSync(file).size>1000,`Empty audio file: ${key}`);
 const fd=openSync(file,'r'),header=Buffer.alloc(3);readSync(fd,header,0,3,0);closeSync(fd);
 assert.ok(header.toString()==='ID3'||header[0]===0xff,`Invalid MP3: ${key}`);
 assert.ok(clip.duration>0);
 checked++;
}
assert.equal(checked,224);
assert.equal(Object.keys(manifest).length,224);
console.log(`Synonym audio verified: ${checked} American female question recordings.`);
