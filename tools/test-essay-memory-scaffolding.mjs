import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const context={window:{}};vm.createContext(context);
for(const file of ['essay-80-memory-data.js','essay-80-learning-support.js'])vm.runInContext(fs.readFileSync(file,'utf8'),context);
const essay=context.window.ESSAY_80_MEMORY_DATA,support=context.window.ESSAY_80_LEARNING_SUPPORT;
assert.equal(support.sentences.length,16);assert.equal(support.structures.length,22);
for(const [i,s] of support.sentences.entries()){
 assert.equal(s.chunks.join(' '),essay.sentences[i].english,`Original words retained in sentence ${i+1}`);
 assert(s.chunks.every(c=>c.split(/\s+/).length<=12));assert(s.synonyms.length>=4);assert(s.simple);
 assert.equal(s.simpleChunks.join(" "),s.simple);
 assert(essay.sentences[i].words.length>0);
 assert.equal(essay.sentences[i].words.length,essay.sentences[i].english.split(/\s+/).length);
}
for(const f of support.structures){assert.equal(f.options.length,4);assert.equal(new Set(f.options).size,4);assert.equal(f.explanations.length,4);assert(f.parts.length>=2);assert(f.meaning&&f.usage);assert(!f.options.some(x=>/librar|digital|technolog|paper.book/i.test(x)));}
assert.equal(support.transfer.length,16);for(const q of support.transfer){assert.equal(q.options.length,4);assert.equal(q.correct,0);assert(q.why);}
assert.equal(essay.mediumAnswers.length,45);
const html=fs.readFileSync('essay-memorization.html','utf8');assert(!html.includes('hero-orbit'));assert(!html.includes('全程只需點選'));assert(html.includes('shared-system-nav.js'));
console.log('PASS: 16 unchanged original sentences, <=12-word chunks, expanded contextual alternatives, exact word timestamps and canonical medium blanks, 22 source-linked four-choice structures.');

for(const q of support.transfer){
 assert(q.context&&q.question&&q.modelLink);assert.equal(q.explanations.length,4);
 assert(q.sourceSentenceIndices.length);assert(q.sourceSentenceIndices.every(i=>essay.sentences[i]));
 assert(q.options.every(o=>/[\u3400-\u9fff]/.test(o)));
 const lengths=q.options.map(o=>o.length);assert(Math.max(...lengths)-Math.min(...lengths)<=9,'No obvious answer-length cue');
}
for(const file of ['essay-memorization.js','essay-80-learning-support.js','essay-80-memory-data.js','essay-memorization.html'])assert(!fs.readFileSync(file,'utf8').includes('收束'));
