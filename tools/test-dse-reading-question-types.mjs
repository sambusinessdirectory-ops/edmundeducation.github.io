import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {classifyQuestion,TYPES} from './generate-dse-reading-question-types.mjs';
const index = JSON.parse(await readFile('dse-reading-question-types.json','utf8'));
assert.equal(index.paperCount,45);
assert.equal(index.papers.length,45);
assert.equal(index.questionCount,1027);
assert.equal(new Set(index.papers.map(paper=>paper.id)).size,45);
const keys = new Set(TYPES.map(type=>type.id));
for (let year=2012;year<=2026;year++) for (const section of ['a','b1','b2']) {
  const id = `dse-${year}-${section}`;
  const paper = index.papers.find(entry=>entry.id===id);
  assert.ok(paper,id);
  const source = JSON.parse(await readFile(`dse-reading-data/${id}.json`,'utf8'));
  assert.equal(paper.questions.length,source.questions.length,id);
  for (const [position,question] of source.questions.entries()) {
    const indexed = paper.questions[position];
    assert.equal(indexed.number,question.number,`${id} question ${position}`);
    assert.deepEqual(indexed.types,classifyQuestion(question),`${id} Q${question.number}`);
    assert.ok(indexed.types.length && indexed.types.every(key=>keys.has(key)));
  }
}
const assigned = (id,number,type) => index.papers.find(p=>p.id===id).questions.find(q=>q.number===number).types.includes(type);
assert.ok(assigned('dse-2023-b1',24,'true-false-not-given'));
assert.ok(assigned('dse-2012-a',11,'vocabulary'));
assert.ok(assigned('dse-2012-a',11,'multiple-choice'));
assert.ok(assigned('dse-2012-a',8,'true-false-not-given'));
const source = await readFile('reading-comprehension.js','utf8');
const nodes = new Map();
const node = selector => {
  if (!nodes.has(selector)) nodes.set(selector,{
    innerHTML:'',textContent:'',value:'',hidden:false,dataset:{},style:{},classList:{add(){},remove(){},toggle(){}},
    replaceChildren(){this.innerHTML='';},querySelector:node,querySelectorAll:()=>[],addEventListener(){},setAttribute(){},removeAttribute(){}
  });
  return nodes.get(selector);
};
const context = vm.createContext({
  console, URL, URLSearchParams, Map, Set, Number, String, Date, JSON,
  window:{EDMUND_SUPABASE:{},EDMUND_IELTS_READING_QUESTION_TYPES:{taxonomy:[],articles:[]}},
  location:new URL('https://edmundeducation.com/reading-comprehension.html?view=dse'),
  document:{querySelector:node,querySelectorAll:()=>[],documentElement:node('html'),body:node('body')},
  history:{replaceState(){}},matchMedia:()=>({matches:false}),getComputedStyle:()=>({position:'static'}),
  requestAnimationFrame:fn=>fn(),setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,clearInterval(){},
  localStorage:{getItem:()=>null,setItem(){}},sessionStorage:{removeItem(){}}
});
vm.runInContext(source.replace(/^import[^\n]+\n/gm,'').split('el.loginForm.addEventListener("submit", handleLogin);')[0],context);
context.testIndex=index;
vm.runInContext('state.dseTypes=testIndex; renderDseQuestionTypes();',context);
assert.equal((node('[data-dse-question-type-chips]').innerHTML.match(/data-dse-question-type=/g)||[]).length,TYPES.length);
vm.runInContext('state.dseSelectedType="true-false-not-given"; renderDseQuestionTypes();',context);
assert.match(node('[data-dse-question-type-results]').innerHTML,/data-dse-type-paper="dse-2023-b1" data-dse-type-question="24"/);
assert.match(node('[data-dse-question-type-status]').textContent,/題，分佈於/);
console.log('DSE finder: all 45 Part A/B1/B2 papers and 1,027 source questions indexed with bilingual question types.');
