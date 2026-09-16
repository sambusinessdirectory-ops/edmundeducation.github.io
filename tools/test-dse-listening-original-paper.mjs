import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
const root=new URL('../assets/dse-listening/2016/original/',import.meta.url);
const paper=JSON.parse(await readFile(new URL('paper.json',root),'utf8'));
assert.equal(paper.year,2016);assert.equal(paper.pages.length,8);
const questions=new Map();
for(const page of paper.pages){
 assert.ok((await stat(new URL(`page-${page.page}.webp`,root))).size>20000);
 assert.ok(page.words.length>30);
 for(const field of page.fields){
  assert.ok(field.q>=1&&field.q<=58);assert.ok(field.x>=0&&field.y>=0&&field.w>0&&field.h>0);
  assert.ok(field.x+field.w<=page.width&&field.y+field.h<=page.height);
  const rows=questions.get(field.q)||[];rows.push(field);questions.set(field.q,rows);
 }
}
assert.deepEqual([...questions.keys()].sort((a,b)=>a-b),Array.from({length:58},(_,i)=>i+1));
for(const [q,fields] of questions){
 const choices=[10,11,12].includes(q)?['A','B']:[40,47].includes(q)?['A','B','C']:null;
 if(choices)assert.deepEqual(fields.map(f=>f.value),choices);else assert.equal(fields.length,1);
}
console.log('2016 original paper: 8 source pages, 58 unique questions, exact choice sets and all overlay bounds validated.');
