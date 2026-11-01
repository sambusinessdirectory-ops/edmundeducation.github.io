import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {searchSynonymLessons, synonymPracticeUrl} from '../writing-synonyms.mjs';
const entries=JSON.parse(fs.readFileSync(new URL('../synonyms/writing-search-index.json',import.meta.url)));
test('search finds source words, alternative expressions, Chinese meanings and normalized input',()=>{
  assert.ok(entries.length>1800);
  assert.equal(searchSynonymLessons(entries,' HELP ')[0].headword,'help');
  assert.ok(searchSynonymLessons(entries,'assist').some(item=>item.headword==='help'));
  assert.ok(searchSynonymLessons(entries,'幫助').length);
  assert.equal(searchSynonymLessons(entries,'ＨＥＬＰ')[0].headword,'help');
  assert.deepEqual(searchSynonymLessons(entries,''),[]);
  assert.deepEqual(searchSynonymLessons(entries,'zzzzunmatchedword'),[]);
  assert.ok(searchSynonymLessons(entries,'a').length<=50);
});
test('practice and guide links target the real synonym module',()=>{
  assert.equal(synonymPracticeUrl('lesson-v2-003'),'synonyms-system.html?embed=writing#lesson-v2-003:question');
  assert.equal(synonymPracticeUrl('lesson-v2-003','guide'),'synonyms-system.html?embed=writing#lesson-v2-003:guide');
});
test('search index reflects every published lesson and question count',async()=>{
  const {catalog,legacyCatalog}=await import('../synonyms/lesson-catalog.mjs');
  for(const lesson of [...catalog,...legacyCatalog]){
    const row=entries.find(item=>item.id===lesson.id);assert.ok(row,lesson.id);assert.equal(row.questions,lesson.questionCount);
  }
});

test('browse order matches the synonym curriculum including legacy positions',async()=>{
 const {catalog,legacyCatalog}=await import('../synonyms/lesson-catalog.mjs');
 const expected=['important',...[...catalog,...legacyCatalog].sort((a,b)=>a.rank-b.rank||Number(a.legacy||false)-Number(b.legacy||false)).map(row=>row.id),'social-media'];
 assert.deepEqual(entries.map(row=>row.id),expected);
 assert.equal(entries[1].headword,'a lot of');
});
