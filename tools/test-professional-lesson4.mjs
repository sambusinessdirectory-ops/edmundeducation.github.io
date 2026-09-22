import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('../professional-english/',import.meta.url);
const read=p=>readFileSync(new URL(p,root),'utf8');
const cards=JSON.parse(read('content/lesson-4-flashcards.json'));
assert.equal(cards.length,112);assert.equal(new Set(cards.map(c=>c.id)).size,112);
for(const [i,c] of cards.entries()){assert.ok(c.front&&c.back);assert.equal(c.examples.length,5);assert.equal(c.examples_zh.length,5);assert.equal(c.voice,i%2===0?'american-female':'british-male');assert.ok(c.audio.startsWith('/audio/lesson-4/'));assert.ok(existsSync(new URL('.'+c.audio,root)));}
const dialogueJs=read('dialogues.js');const dialogues=JSON.parse(dialogueJs.slice(dialogueJs.indexOf('=')+1,dialogueJs.lastIndexOf(';')).trim());const lesson4=dialogues.filter(d=>d.lesson===4);
assert.equal(lesson4.length,6);assert.deepEqual(new Set(lesson4.map(d=>d.variant)),new Set(['beginner','professional']));
const manifest=JSON.parse(read('dialogue-audio.json'));
for(const d of lesson4)for(const [i,line] of d.lines.entries()){assert.ok(['american-female','british-male'].includes(line.voice));const clip=manifest[`${d.id}:${i}`];assert.ok(clip);assert.equal(clip.voice,line.voice);assert.equal(clip.sourceSha256,createHash('sha256').update(line.en).digest('hex'));assert.ok(existsSync(new URL(clip.path,root)));}
const materials=JSON.parse(read('content/lesson-materials.json'));const lessonMaterial=materials.find(x=>x.lesson===4);assert.equal(lessonMaterial.pages.length,8);assert.ok(existsSync(new URL(lessonMaterial.pdf,root)));
const poly=JSON.parse(read('content/lesson-4-polysemy.json'));assert.equal(poly.words.length,36);assert.equal(poly.words.reduce((n,w)=>n+w.senses.length,0),360);assert.equal(poly.words.reduce((n,w)=>n+w.questions.length,0),720);
for(const word of poly.words){assert.equal(word.senses.length,10);assert.equal(word.questions.length,20);for(let i=0;i<word.questions.length-1;i++)assert.notEqual(word.questions[i].answer,word.questions[i+1].answer,`${word.word}: paired examples adjacent`);}
const enhancements=read('professional-enhancements.js');assert.match(enhancements,/36 個詞語 · 720 題練習/);assert.match(enhancements,/draft:lesson4-notice/);assert.match(enhancements,/l4d2-beginner/);const practice=read('dialogue-practice.mjs');assert.match(practice,/pro-whatsapp-practice/);assert.match(practice,/pro-whatsapp-composer/);assert.match(dialogueJs,/Miss Karen Wong/);
console.log('Lesson 4 verified: 112 cards, 54 dialogue lines, 8 PDF pages, 720 polysemy questions.');
