import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const context = {window:{}}; vm.runInNewContext(fs.readFileSync('listening-practice-1-data.js','utf8'), context);
const ranges = JSON.parse(fs.readFileSync('tools/listening-question-type-ranges.json'));
const labels = {
  'multiple-choice': ['Multiple Choice — One Answer', '單項選擇', 'MC single choice 選擇題'],
  'multiple-answers': ['Multiple Choice — Multiple Answers', '多項選擇', 'MC multiple choice 多選題'],
  matching: ['Matching', '配對題', '分類 classification'],
  map: ['Map / Plan Labelling', '地圖／平面圖標示', 'label 地點 地圖題'],
  notes: ['Note Completion', '筆記填空', 'gap fill 填充'],
  table: ['Table Completion', '表格填空', 'gap fill 填充'],
  form: ['Form Completion', '表單填空', 'gap fill 填充 登記表'],
  flowchart: ['Flow-chart Completion', '流程圖填空', 'gap fill 填充 flowchart 流程圖配對']
};
const rows=[];
for(let practice=1;practice<=20;practice++) {
  const data=practice===1?JSON.parse(JSON.stringify(context.window.EDMUND_IELTS_LISTENING_PRACTICE_1)):JSON.parse(fs.readFileSync(`assets/listening/practices/practice-${practice}.json`));
  assert.equal(data.parts.length,4);
  for(const part of data.parts) {
    const covered=[];
    for(const range of ranges[practice][part.part-1].split(' ')) {
      const [type,numbers]=range.split(':'); const [first,last]=numbers.split('-').map(Number);
      assert.ok(labels[type]);
      const questions=part.questions.filter(q=>(q.numbers||[q.number]).some(n=>n>=first&&n<=last)).map(q=>({numbers:q.numbers||[q.number],prompt:q.prompt}));
      const actual=questions.flatMap(q=>q.numbers);
      assert.deepEqual(actual,Array.from({length:last-first+1},(_,i)=>first+i),`P${practice}.${part.part} ${range}`);
      covered.push(...actual);
      rows.push({id:`p${practice}-${first}-${last}`,practice,part:part.part,type,first,last,questions,sourcePages:part.sourcePages||[],href:`listening-system.html?section=ielts&practice=${practice}&part=${part.part}&question=${first}`});
    }
    assert.deepEqual(covered,Array.from({length:10},(_,i)=>(part.part-1)*10+i+1));
  }
}
const counts=Object.fromEntries(Object.keys(labels).map(type=>{
  const matching=rows.filter(r=>r.type===type);
  return [type,{questions:matching.reduce((n,r)=>n+r.last-r.first+1,0),groups:matching.length,parts:new Set(matching.map(r=>`${r.practice}:${r.part}`)).size,practices:new Set(matching.map(r=>r.practice)).size}];
}));
fs.writeFileSync('listening-question-types.json',JSON.stringify({version:2,labels,counts,practiceCount:20,partCount:80,questionCount:800,rows},null,2)+'\n');
console.log(JSON.stringify(counts,null,2));
