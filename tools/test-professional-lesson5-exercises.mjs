import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const root=new URL('../professional-english/',import.meta.url);
const read=path=>JSON.parse(readFileSync(new URL(path,root),'utf8'));
const dialogues=read('dialogues.json').dialogues.filter(d=>d.lesson===5);
assert.equal(dialogues.length,8);
assert.deepEqual(dialogues.map(d=>d.id),['l5d1-beginner','l5d1-professional','l5d2-beginner','l5d2-professional','l5d3-beginner','l5d3-professional','l5d4-beginner','l5d4-professional']);
const audio=read('dialogue-audio.json');
for(const d of dialogues){assert.equal(d.lines.length,10);for(const [i,line] of d.lines.entries()){assert.ok(line.en&&line.zh);assert.equal(line.voice,/Security/.test(line.role)?'american-female':'british-male');const clip=audio[`${d.id}:${i}`];assert.equal(clip?.voice,line.voice);assert.ok(existsSync(new URL(clip.path,root)));}}

const synonyms=read('content/lesson-5-synonyms.json').modules;
assert.equal(synonyms.length,8);
for(const module of synonyms){assert.equal(module.guide.length,14,module.id);assert.equal(module.falseSynonyms.length,8,module.id);assert.equal(module.questions.length,28,module.id);assert.equal(new Set(module.questions.map(q=>q.id)).size,28,module.id);for(const q of module.questions){assert.equal(q.options.length,6,`${module.id}:${q.id}`);assert.equal(q.options.filter(o=>o.text===q.answer).length,1,`${module.id}:${q.id}`);assert.ok(q.original);assert.equal(Object.keys(q.feedback).length,6,`${module.id}:${q.id}`);}}
const situations=read('content/situation-cards.json').lessons;
assert.deepEqual(situations.map(l=>l.cards.length),[6,6,4,4,4]);
for(const l of situations){assert.equal(new Set(l.cards.map(c=>c.number)).size,l.cards.length);for(const c of l.cards){assert.ok(c.title);assert.ok(c.turns.length>=6);for(const t of c.turns)assert.ok(t.role&&t.en);}}
for(const p of ['synonyms.html','synonyms-practice.mjs','situation-cards.html','situation-cards.mjs'])assert.ok(existsSync(new URL(p,root)));
console.log('Lesson 5 exercises verified: 8 translated dialogues with 80 voice clips, 224 six-choice synonym questions, 24 situation cards across 5 lessons.');
