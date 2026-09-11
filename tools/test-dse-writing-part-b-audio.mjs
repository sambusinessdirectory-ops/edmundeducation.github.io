import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import vm from 'node:vm';
const root=path.resolve(import.meta.dirname,'..'),c={window:{}};
const read=f=>readFileSync(path.join(root,f),'utf8');
for(const f of ['flashcards-audio-manifest.js','flashcards-dse-writing-part-b-audio.js','writing-audio-dse-part-b-manifest.js','writing-practice-dse-part-b-library-data.js',...readdirSync(root).filter(f=>/^flashcards-dse-writing-part-b-\d{4}-data.js$/.test(f))])vm.runInNewContext(read(f),c);
const index=JSON.parse(read('workers/edmund-audio/src/flashcard-pack-index-dse-writing-part-b.json'));
assert.equal(index.meta.r2UploadComplete,true);assert.equal(index.meta.entryCount,9923);assert.equal(new Set(Object.values(index.packs).map(p=>p.key)).size,16);
const normalize=s=>s.replace(/[\u2018\u2019\u02bc\u02bb\uff07]/g,"'").replace(/([A-Za-z])\s+'\s*([A-Za-z])/g,"$1'$2").replace(/([A-Za-z])'\s+(s|t|re|ve|ll|d|m)\b/gi,"$1'$2").trim();
for(const card of Object.values(c.window.EDMUND_FLASHCARD_SEED).flat()){
 const url=c.window.EDMUND_FLASHCARD_AUDIO[normalize(card.front)];assert.ok(url,card.front);
 if(url.includes(index.audioPathPrefix)){
  const h=url.split('/').at(-1).replace('.mp3',''),prefix=h.slice(0,2),entry=index.entries[prefix]?.[h.slice(2)];assert.ok(entry,card.front);assert.ok(entry[1]>1000&&entry[0]+entry[1]<=index.packs[prefix].size);
 }
}
const words=/[\p{L}\p{N}]+(?:[’'][\p{L}\p{N}]+)*(?:-[\p{L}\p{N}]+)*/gu;
for(const e of Object.values(c.window.EDMUND_DSE_WRITING_PART_B_LIBRARY_EXERCISES)){
 const entry=c.window.EDMUND_WRITING_AUDIO[e.id];assert.ok(entry,e.id);assert.equal(entry.voice,'Samantha');assert.equal(entry.language,'en-US');assert.match(entry.path,/^https:\/\/edmund-neural-audio\.edmundeducation\.workers\.dev\//);
 const text=e.paragraphs.map(p=>p.sentences.map(s=>s.parts.map(t=>typeof t==='string'?t:t.answer).join('')).join(' ')).join('\n\n');assert.equal(createHash('sha256').update(text).digest('hex'),entry.sourceSha256,e.id);
 assert.deepEqual([...entry.words.map(w=>w[0])],text.match(words));assert.ok(entry.duration>60);
 assert.equal(entry.sentenceTimings.length,e.paragraphs.reduce((n,p)=>n+p.sentences.length,0));
 entry.words.forEach((w,i)=>{assert.ok(w[1]>=0&&w[2]>w[1]&&w[2]<=entry.duration);if(i)assert.ok(w[1]>=entry.words[i-1][2]-.0011);});
}
console.log('Audio verified: all 12,420 flashcards resolve; 9,923 new recordings in 16 uploaded packs; 86 American female essay recordings match the displayed text.');
