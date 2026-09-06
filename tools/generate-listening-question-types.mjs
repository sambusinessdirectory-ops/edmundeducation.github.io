import fs from 'node:fs';
import vm from 'node:vm';
const context = {window:{}}; vm.runInNewContext(fs.readFileSync('listening-practice-1-data.js','utf8'), context);
const labels = { 'multiple-choice':'Multiple Choice 選擇題 MC', 'multiple-answers':'Multiple Choice — Multiple Answers 多選題', matching:'Matching 配對題', map:'Map / Plan Labelling 地圖／平面圖標示', gap:'Fill in the Blanks 填空題', notes:'Note Completion 筆記填充', table:'Table Completion 表格填充', form:'Form Completion 表單填充', flowchart:'Flow-chart Completion 流程圖填充', sentence:'Sentence Completion 句子填充', summary:'Summary Completion 摘要填充' };
const rows=[];
for(let practice=1;practice<=20;practice++){
 const data=practice===1?context.window.EDMUND_IELTS_LISTENING_PRACTICE_1:JSON.parse(fs.readFileSync(`assets/listening/practices/practice-${practice}.json`));
 for(const part of data.parts){
  const source=[part.instruction,...(part.sourceBlocks||[]).map(b=>b.text||'')].join('\n');
  const types=new Set();
  if(/choose the correct letter/i.test(source)) types.add('multiple-choice');
  if(part.questions.some(q=>q.type==='multi'||q.type==='multiple')) types.add('multiple-answers');
  if(/choose (?:three|four|five|six|seven|eight|nine|ten) answers from the box/i.test(source)) types.add('matching');
  if(/label (?:the )?(?:map|plan)|map below|plan below/i.test(source)) types.add('map');
  if(part.questions.some(q=>q.type==='gap')) types.add('gap');
  for(const [id,pattern] of Object.entries({notes:/complete the notes/i,table:/complete the table/i,form:/complete the form/i,flowchart:/complete the flow[ -]?chart/i,sentence:/complete the sentences/i,summary:/complete the summary/i})) if(pattern.test(source))types.add(id);
  // Practice 1 uses its original structured instructions, rather than imported PDF blocks.
  if(practice===1 && part.part===1) {types.add('gap');types.add('table');}
  if(practice===1 && part.part===4) {types.add('gap');types.add('notes');}
  // Image-only instructions were checked against their source diagrams/tables.
  if(practice===3 && part.part===2) types.add('map');
  if([3,6,11].includes(practice) && part.part===1) types.add('table');
  if(practice===11 && part.part===1) types.add('form');
  if(practice===15 && part.part===2) types.add('matching');
  if(!types.size && part.questions.every(q=>q.type==='choice')) types.add('matching');
  rows.push({practice,part:part.part,types:[...types],questions:part.questions.flatMap(q=>q.numbers||[q.number])});
 }
}
fs.writeFileSync('listening-question-types.json',JSON.stringify({labels,rows},null,2)+'\n');
console.log('Indexed',rows.length,'parts:',Object.fromEntries(Object.keys(labels).map(k=>[k,rows.filter(r=>r.types.includes(k)).length])));
