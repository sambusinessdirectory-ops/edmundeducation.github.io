import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import {newProverbs} from './proverb-new-lessons/specs.mjs';
import {practice} from './proverb-new-lessons/practice.mjs';
import {shuffled,evaluate} from '../proverb-curation-core.mjs';

const root=new URL('../',import.meta.url);
const context={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../proverb-system-data.js',import.meta.url),'utf8'),context);
const lessons=context.window.EDMUND_PROVERB_SYSTEM_DATA.lessons;

test('nine source-bank-free lessons have 12 distinct authored scenes each',()=>{
 assert.equal(newProverbs.length,9);
 assert.equal(lessons.length,12);
 const seen=new Set();
 for(const spec of newProverbs){
  const lesson=lessons.find(l=>l.id===spec.id);
  assert(lesson,spec.id);assert.equal(lesson.questions.length,12);assert.equal(practice[spec.id].length,12);
  for(const row of practice[spec.id]){assert(!seen.has(row.en),`duplicate scene: ${row.en}`);seen.add(row.en);assert(row.zh&&row.en&&row.lines.length===4&&row.reasons.length===4);}
 }
 assert.equal(seen.size,108);
});

test('new guides keep Traditional Chinese above English and four distinct decisions',()=>{
 for(const spec of newProverbs){const guide=spec.guide;for(const field of ['meaning','model','picture','boundary','where','tone','readAloud'])assert(guide[field].zh&&guide[field].en,`${spec.id}.${field}`);assert.equal(guide.checks.length,3);for(const stage of [2,3,5,6]){const decision=guide.choices[stage];assert(decision.prompt.zh&&decision.prompt.en);assert.equal(decision.options.length,3);assert.equal(decision.options.filter(o=>o.correct).length,1);for(const option of decision.options)assert(option.zh&&option.en&&option.reasonZh);}}
});

test('each new item has a single supported key, balanced full-sentence choices and reasons',()=>{
 for(const spec of newProverbs){
  const l=JSON.parse(fs.readFileSync(new URL(`../content/proverb-compass/${spec.id}.json`,import.meta.url),'utf8'));
  const source=lessons.find(x=>x.id===l.id);
  assert.equal(l.scoredCount,12);assert.equal(l.items.length,12);
  for(const [index,q] of l.items.entries()){
   assert.equal(q.id,`${l.id}-q${String(index+1).padStart(2,'0')}`);
   assert.equal(q.options.length,4);assert.equal(q.options.filter(o=>o.correct).length,1);
   assert.equal(new Set(q.options.map(o=>o.text)).size,4);
   assert.equal(q.options[0].text,source.questions[index].answer);
   const counts=q.options.map(o=>o.text.split(/\s+/u).length);
   assert(Math.max(...counts)/Math.min(...counts)<=1.6,`${q.id}: ${counts}`);
   for(const option of q.options){assert(option.text.toLowerCase().includes(spec.titleEn.toLowerCase()),q.id);assert(/[\u3400-\u9fff]/u.test(option.reasonZh),q.id);}
   const opts=shuffled(q.options,q.id);
   for(let j=0;j<4;j++){const result=evaluate(opts,j);assert.equal(result.correct,opts[j].correct);assert.equal(result.reasons.length,opts[j].correct?4:1);}
  }
 }
});
