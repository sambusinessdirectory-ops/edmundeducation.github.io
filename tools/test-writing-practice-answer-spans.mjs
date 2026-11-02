// Every blank answer must occur in order in the exact displayed model essay.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const root=new URL('../',import.meta.url);
const html=fs.readFileSync(new URL('writing-practice.html',root),'utf8');
const files=[...html.matchAll(/<script src="(writing-practice[^"?]+-data\.js)(?:\?[^\"]*)?"/g)].map(match=>match[1]);
const context={window:{},URLSearchParams};
vm.createContext(context);
for(const file of files)vm.runInContext(fs.readFileSync(new URL(file,root),'utf8'),context,{filename:file});

const essays=new Map();
for(const value of Object.values(context.window)){
  if(!value||typeof value!=='object')continue;
  for(const [id,essay] of Object.entries(value)){
    if(id.startsWith('model-essay-')&&essay?.practiceDifficultySets)essays.set(id,essay);
  }
}
assert.equal(essays.size,288,'the full IELTS model-essay catalogue must be checked');
for(const [id,essay] of essays){
  const canonical=(essay.paragraphs||[]).map(paragraph=>(paragraph.sentences||[])
    .map(sentence=>(sentence.parts||[]).map(part=>typeof part==='string'?part:part.answer||'').join(''))
    .join(' ').replace(/\s+/g,' ').trim()).join('\n\n');
  assert(canonical.length>100,`${id}: missing source essay`);
  for(const level of essay.practiceDifficultySets){
    let cursor=0;
    for(const [index,answer] of level.answers.entries()){
      const found=canonical.indexOf(answer,cursor);
      assert(found>=0,`${id}/${level.key}: answer ${index+1} is absent or out of order: ${answer}`);
      cursor=found+answer.length;
    }
  }
}
console.log(`PASS: ordered blank answers match all ${essays.size} canonical IELTS model essays.`);
