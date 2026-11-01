import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {filterVocabulary} from '../ielts-chart-teaching/vocabulary.mjs';
const bank=JSON.parse(await readFile(new URL('../ielts-chart-teaching/vocabulary-data.json',import.meta.url)));
assert.equal(bank.bookPages.length,110);assert.equal(bank.categories.length,21);
assert.equal(new Set(bank.entries.map(e=>e.id)).size,bank.entries.length);
for(const e of bank.entries){assert(e.english.trim());assert(bank.categories.some(c=>c.id===e.category));assert(e.pages.every(p=>p>=1&&p<=110));}
for(const term of ['increase','account for','approximately'])assert(filterVocabulary(bank,{query:term}).length,term);
assert(filterVocabulary(bank,{query:'上升',category:'up'}).length);
assert.equal(filterVocabulary(bank,{query:'xyznotaword'}).length,0);
assert(filterVocabulary(bank,{kind:'warning'}).every(e=>e.kind==='warning'));
console.log(`PASS: ${bank.entries.length} entries, 21 scenarios, 110 source pages, search and source references`);
