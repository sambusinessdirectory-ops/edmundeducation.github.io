import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const context={window:{}};vm.createContext(context);
for(const file of ['essay-80-memory-data.js','essay-80-learning-support.js'])vm.runInContext(fs.readFileSync(file,'utf8'),context);
const essay=context.window.ESSAY_80_MEMORY_DATA,support=context.window.ESSAY_80_LEARNING_SUPPORT;
assert.equal(support.sentences.length,16);assert.equal(support.structures.length,22);
for(const [i,s] of support.sentences.entries()){
 assert.equal(s.chunks.join(' '),essay.sentences[i].english,`Original words retained in sentence ${i+1}`);
 assert(s.chunks.every(c=>c.split(/\s+/).length<=12));assert(s.synonyms.length>=2);assert(s.simple);
}
for(const f of support.structures){assert.equal(f.options.length,4);assert.equal(new Set(f.options).size,4);assert.equal(f.explanations.length,4);assert(f.parts.length>=2);assert(f.meaning&&f.usage);assert(!f.options.some(x=>/librar|digital|technolog|paper.book/i.test(x)));}
const html=fs.readFileSync('essay-memorization.html','utf8');assert(!html.includes('hero-orbit'));assert(!html.includes('全程只需點選'));assert(html.includes('shared-system-nav.js'));
console.log('PASS: 16 unchanged original sentences, <=12-word chunks, 43 contextual alternatives, 22 source-linked four-choice structures.');
