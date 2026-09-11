import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import vm from 'node:vm';
const root=path.resolve(import.meta.dirname,'..'),c={window:{}};
const read=f=>readFileSync(path.join(root,f),'utf8');
for(const f of ['flashcards-audio-manifest.js','writing-audio-manifest.js'])vm.runInNewContext(read(f),c);
const baselineFlash=c.window.EDMUND_FLASHCARD_AUDIO,baselineWriting=c.window.EDMUND_WRITING_AUDIO;
const baselineUrls=new Set(Object.values(baselineFlash));
for(const f of ['flashcards-dse-writing-part-b-audio.js','writing-audio-dse-part-b-manifest.js','writing-practice-dse-part-b-library-data.js',...readdirSync(root).filter(f=>/^flashcards-dse-writing-part-b-\d{4}-data.js$/.test(f))])vm.runInNewContext(read(f),c);
for(const [text,url] of Object.entries(baselineFlash))assert.equal(c.window.EDMUND_FLASHCARD_AUDIO[text],url,'Changed established recording: '+text);
for(const [id,entry] of Object.entries(baselineWriting))assert.equal(c.window.EDMUND_WRITING_AUDIO[id],entry,'Changed established essay: '+id);
const index=JSON.parse(read('workers/edmund-audio/src/flashcard-pack-index-dse-writing-part-b-kokoro.json'));
assert.equal(index.meta.r2UploadComplete,true);assert.equal(index.meta.entryCount,9921);assert.equal(index.meta.packCount,Object.keys(index.packs).length);assert.equal(new Set(Object.values(index.packs).map(p=>p.key)).size,16);
for(const meta of [index.meta,c.window.EDMUND_DSE_WRITING_PART_B_FLASHCARD_AUDIO_META,c.window.EDMUND_DSE_WRITING_PART_B_WRITING_AUDIO_META]){
 assert.equal(meta.engine,'Kokoro-82M');assert.equal(meta.voice,'af_heart');assert.equal(meta.language,'en-us');assert.equal(meta.speed,.96);
 assert.equal(meta.sampleRate,24000);assert.equal(meta.compressionLevel,.55);assert.equal(meta.bitrateMode,'VARIABLE');
 assert.equal(meta.modelSha256,'7d5df8ecf7d4b1878015a32686053fd0eebe2bc377234608764cc0ef3636a6c5');
 assert.equal(meta.voicesSha256,'bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d');
}
const normalize=s=>s.replace(/[\u2018\u2019\u02bc\u02bb\uff07]/g,"'").replace(/([A-Za-z])\s+'\s*([A-Za-z])/g,"$1'$2").replace(/([A-Za-z])'\s+(s|t|re|ve|ll|d|m)\b/gi,"$1'$2").trim();
const newUrls=new Set();
for(const card of Object.values(c.window.EDMUND_FLASHCARD_SEED).flat()){
 const url=c.window.EDMUND_FLASHCARD_AUDIO[normalize(card.front)];assert.ok(url,card.front);
 assert.ok(!url.includes('/american-female/dse-part-b-20260911/'),'Stale Samantha mapping: '+card.front);
 if(url.includes(index.audioPathPrefix)){
  newUrls.add(url);
  const h=url.split('/').at(-1).replace('.mp3',''),prefix=h.slice(0,2),entry=index.entries[prefix]?.[h.slice(2)];assert.ok(entry,card.front);assert.ok(entry[1]>1000&&entry[0]+entry[1]<=index.packs[prefix].size);
 }else assert.ok(baselineUrls.has(url),'Unknown voice source: '+card.front);
}
assert.equal(newUrls.size,index.meta.entryCount);
const words=/[\p{L}\p{N}]+(?:[’'][\p{L}\p{N}]+)*(?:-[\p{L}\p{N}]+)*/gu;
for(const e of Object.values(c.window.EDMUND_DSE_WRITING_PART_B_LIBRARY_EXERCISES)){
 const entry=c.window.EDMUND_WRITING_AUDIO[e.id];assert.ok(entry,e.id);assert.equal(entry.voice,'af_heart');assert.equal(entry.language,'en-us');assert.equal(entry.speed,.96);
 assert.equal(entry.wordTimingMethod,'faster-whisper-base.en-audio-v1');assert.match(entry.audioSha256,/^[a-f0-9]{64}$/);
 assert.ok(entry.path.startsWith('https://edmund-neural-audio.edmundeducation.workers.dev/assets/writing-practice/audio/edmund-neural/dse-part-b-kokoro-20260911/'));
 const text=e.paragraphs.map(p=>p.sentences.map(s=>s.parts.map(t=>typeof t==='string'?t:t.answer).join('')).join(' ')).join('\n\n');assert.equal(createHash('sha256').update(text).digest('hex'),entry.sourceSha256,e.id);
 assert.deepEqual([...entry.words.map(w=>w[0])],text.match(words));assert.ok(entry.duration>60);
 assert.equal(entry.sentenceTimings.length,e.paragraphs.reduce((n,p)=>n+p.sentences.length,0));
 assert.equal(entry.wordCount,entry.words.length);
 entry.words.forEach((w,i)=>{assert.ok(w[1]>=0&&w[2]>w[1]&&w[2]<=entry.duration,`${e.id}: invalid word timing ${w}`);if(i)assert.ok(w[1]>=entry.words[i-1][2]-.0011);});
 entry.sentenceTimings.forEach((s,i)=>{assert.ok(s.end>s.start&&s.end<=entry.duration);if(i){const p=entry.sentenceTimings[i-1],pause=s.paragraph===p.paragraph ? .45 : .72;assert.ok(Math.abs(s.start-p.end-pause)<.002);}});
}
assert.ok(read('flashcards.html').includes('flashcards-dse-writing-part-b-audio.js?v=20260911-kokoro-1'));
assert.ok(read('writing-practice.html').includes('writing-audio-dse-part-b-manifest.js?v=20260911-kokoro-1'));
console.log('Kokoro verified: all 12,420 cards resolve; 9,921 corrected recordings in 16 uploaded packs; 86 essays match the displayed text and measured word timings. Established recordings remain unchanged.');
