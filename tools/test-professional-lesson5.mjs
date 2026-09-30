import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';

const root=new URL('../professional-english/',import.meta.url);
const read=path=>JSON.parse(readFileSync(new URL(path,root),'utf8'));
const cards=read('content/lesson-5-flashcards.json');
const manifest=read('content/lesson-5-audio.json');
assert.equal(cards.length,159);
assert.equal(new Set(cards.map(card=>card.id)).size,cards.length);
assert.equal(new Set(cards.map(card=>card.front.toLowerCase())).size,cards.length);
for(const card of cards){
 assert.ok(card.front&&card.back);
 assert.equal(card.examples.length,5);
 assert.equal(card.examples_zh.length,5);
 assert.equal(card.voice,'american-female');
 assert.ok(card.audio.startsWith('/audio/lesson-5/'));
 assert.ok(existsSync(new URL('.'+card.audio,root)),`Audio missing: ${card.front}`);
 assert.equal(manifest.clips[card.id]?.sourceSha256,createHash('sha256').update(card.front).digest('hex'));
}
const materials=read('content/lesson-materials.json');
const lesson=materials.find(item=>item.lesson===5);
assert.equal(lesson.pages.length,8);
assert.ok(existsSync(new URL(lesson.pdf,root)));
const support=read('content/reader-support.json');
for(const page of [2,3,4,5]){
 const turns=support.pages[`5:${page}`];
 assert.equal(turns.length,20,`Page ${page} must translate both dialogue versions`);
 for(const turn of turns)assert.ok(turn.en&&turn.zh);
}
for(const page of [1,6,7,8])assert.ok(support.pageNotes[`5:${page}`]?.length);
console.log('Lesson 5 verified: 159 bilingual cards with female audio, 8 PDF pages, 80 translated dialogue turns and page notes.');
