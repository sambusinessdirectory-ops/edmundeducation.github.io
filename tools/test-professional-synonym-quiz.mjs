import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {correctSourceLetter,initialChoiceOrders,retryChoiceOrder,validChoiceOrder} from '../professional-english/synonym-quiz.mjs';
const modules=JSON.parse(readFileSync(new URL('../professional-english/content/lesson-5-synonyms.json',import.meta.url),'utf8')).modules;
function random(seed){let state=seed;return ()=>{state=(1664525*state+1013904223)>>>0;return state/2**32;};}
for(const [index,module] of modules.entries()){
 const orders=initialChoiceOrders(module.questions,random(index+1));
 assert.equal(orders.length,28);
 const positions=[];
 for(const [i,question] of module.questions.entries()){
  assert.ok(validChoiceOrder(question,orders[i]));
  const correct=correctSourceLetter(question),at=orders[i].indexOf(correct);
  positions.push(at);
  const retry=retryChoiceOrder(question,orders[i],random(i+31));
  assert.ok(validChoiceOrder(question,retry));
  assert.notEqual(retry.indexOf(correct),at,`${module.id}:${question.id} retry repeats answer position`);
 }
 const distribution=[0,1,2,3,4,5].map(n=>positions.filter(at=>at===n).length);
 assert.ok(distribution.every(n=>n>=4&&n<=5),`${module.id}: ${distribution}`);
 assert.notDeepEqual(orders,initialChoiceOrders(module.questions,random(index+51)));
}
console.log('Synonym quiz verified: all eight modules distribute correct answers across A–F; retries move the correct position.');
