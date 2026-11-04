import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// Classify the answer slot shown in the site's source-checked DSE Part A paper.
// Structural rules cover ordinary controls; the reviewed ranges name layouts that
// a template alone cannot reveal (for example, a plan printed above an answer grid).
const overrides = JSON.parse(fs.readFileSync('tools/dse-listening-question-type-overrides.json', 'utf8'));
const labels = {
  'note-completion': ['Note / Fact-sheet Completion', '筆記／資料表填空', 'notes details facts 填空'],
  'table-grid': ['Table / Grid', '表格／對照欄', 'table grid matrix schedule chart 表格'],
  'single-choice': ['Single Choice', '單項選擇', 'multiple choice MC tick one circle yes no 單選'],
  'multiple-response': ['Choose Several', '多項選擇', 'tick two three four checkbox multiple select 多選'],
  'short-answer': ['Short Answer', '簡答題', 'who what why how where question answer 簡答'],
  'summary': ['Summary / Continuous Text', '摘要／連貫文字填空', 'summary report paragraph story text 摘要'],
  'survey-form': ['Survey / Form', '問卷／表單', 'survey questionnaire form feedback 問卷'],
  'webpage': ['Webpage / Interface', '網頁／介面填寫', 'website webpage menu interface application 網頁'],
  'map-plan': ['Map / Plan Location', '地圖／平面圖定位', 'map plan route location letter 地圖 平面圖'],
  'picture-diagram': ['Picture / Diagram Questions', '圖片／示意圖題', 'picture image diagram labels painting 圖片 示意圖'],
  'classification': ['Classify a View or Category', '觀點／類別分類', 'yes no maybe positive negative attitude compare 分類'],
  'ranking-order': ['Ranking / Order', '排序／先後次序', 'rank sequence order first second priority 排序'],
  'route-tracing': ['Route Tracing', '路線格標記', 'maze path route cells monster 迷宮 路線'],
  'editing': ['Editing / Proofreading', '改錯／校對', 'correct mistake tick proofreading 改錯 校對'],
  'process-flow': ['Process / Steps', '流程／步驟填空', 'process steps sequence flowchart 流程 步驟']
};
const primaryOrder = ['map-plan','picture-diagram','editing','process-flow','classification','ranking-order','route-tracing','multiple-response','single-choice','webpage','survey-form','table-grid','summary','short-answer','note-completion'];
const rangeMap = new Map();
for (const [type, ranges] of Object.entries(overrides)) {
  assert.ok(labels[type], `Unknown override type ${type}`);
  for (const range of ranges) {
    const match = /^(20\d{2})\.([1-4])\.(\d+)(?:-(\d+))?$/.exec(range);
    assert.ok(match, `Invalid override range ${range}`);
    const [,year,task,start,end = start] = match;
    for (let number = Number(start); number <= Number(end); number++) {
      const key = `${year}.${task}.${number}`;
      const set = rangeMap.get(key) || new Set();
      set.add(type); rangeMap.set(key, set);
    }
  }
}
const strip = value => String(value || '').replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g,' ').trim();
const numbered = source => [...String(source || '').matchAll(/\{\{(\d+)(?:\|([^{}]+))?\}\}/g)];
const inside = (source, position, tag) => source.lastIndexOf(`<${tag}`,position) > source.lastIndexOf(`</${tag}`,position);
function excerpt(source, match, heading, fallback) {
  if (!match) return strip(fallback || heading);
  const before = source.slice(0,match.index);
  const after = source.slice(match.index + match[0].length);
  const paragraph = Math.max(before.lastIndexOf('<p'),before.lastIndexOf('<li'),before.lastIndexOf('<tr'),before.lastIndexOf('<div'));
  const start = paragraph >= 0 ? paragraph : Math.max(0,match.index-100);
  const endOptions = ['</p>','</li>','</tr>','</div>'].map(tag=>source.indexOf(tag,match.index)).filter(pos=>pos>=0);
  const end = endOptions.length ? Math.min(...endOptions) : Math.min(source.length,match.index+140);
  let text = strip(source.slice(start,end).replace(match[0],'____').replace(/\{\{\d+(?:\|[^{}]+)?\}\}/g,'…'));
  if (text.length > 190) {
    const gap = text.indexOf('____');
    text = `${gap>85?'…':''}${text.slice(Math.max(0,gap-85),Math.min(text.length,gap+105))}${gap+105<text.length?'…':''}`;
  }
  if (text === '____' || text.length < 24) {
    const priorQuestions = [...before.matchAll(/<p[^>]*>([\s\S]*?\?)[\s\S]*?<\/p>/gi)].map(found=>strip(found[1]));
    const priorLabels = [...before.matchAll(/<strong[^>]*>([\s\S]*?)<\/strong>/gi)].map(found=>strip(found[1]));
    text = `${priorQuestions.at(-1) || priorLabels.at(-1) || strip(heading || fallback)} — ${text}`.replace(/^ — /,'');
  }
  return text.slice(0,230);
}
const context = vm.createContext({window:{}});
const papers = [];
const rows = [];
for (let year = 2012; year <= 2026; year++) {
  vm.runInContext(fs.readFileSync(`dse-listening-${year}-data.js`,'utf8'),context,{filename:`dse-listening-${year}-data.js`});
  const paper = context.window[`EDMUND_DSE_LISTENING_${year}`];
  assert.equal(paper.year,year);
  assert.equal(paper.tasks.length,4,`${year} task count`);
  const paperRows = [];
  for (const task of paper.tasks) {
    const taskRows = [];
    let heading = '';
    for (let blockIndex=0;blockIndex<task.blocks.length;blockIndex++) {
      const block=task.blocks[blockIndex];
      if (block.type==='heading') { heading=block.text; continue; }
      const sources = [block.html,block.copy,...(block.rows||[]).flatMap(row=>[row.copy,row.concern,row.consequence])].filter(Boolean);
      const matches = sources.flatMap(source => numbered(source).map(match=>({number:Number(match[1]),choices:match[2]||'',source,match})));
      const seen = new Set(matches.map(item=>item.number));
      for (const number of [block.number,...(block.numbers||[])].filter(Boolean)) if (!seen.has(Number(number))) matches.push({number:Number(number),choices:'',source:'',match:null});
      for (const item of matches) {
        const {number,choices,source,match} = item;
        const key=`${year}.${task.number}.${number}`;
        const reviewed=rangeMap.get(key)||new Set();
        const inTable=block.type==='event-table'||block.type==='concern-table'||Boolean(match&&inside(source,match.index,'table'));
        const inSteps=Boolean(match&&(inside(source,match.index,'ol')||/dse-process-list/.test(source)));
        const local=excerpt(source,match,heading,block.prompt||task.title);
        const questionText = `${heading} ${local}`;
        const directQuestion = /\?/.test(local) && /\b(?:who|what|why|how|where|when|which|did|does|is|are|was|were|can)\b/i.test(local);
        const headingQuestion = /\?/.test(heading) && strip(source).replace(/\{\{\d+(?:\|[^{}]+)?\}\}/g,'').length < 110;
        const types = new Set();
        if(block.type==='multiple-choice'||choices)types.add('single-choice');
        if(block.type==='multiple-select'||(block.type==='answer-group'&&block.mode==='choose'))types.add('multiple-response');
        if(block.type==='ranking'||(block.type==='answer-group'&&block.mode==='order'))types.add('ranking-order');
        if(block.type==='maze')types.add('route-tracing');
        if(inTable)types.add('table-grid');
        if(inSteps)types.add('process-flow');
        for(const type of reviewed) types.add(type);
        if(!types.size)types.add(directQuestion||headingQuestion?'short-answer':'note-completion');
        else if(types.has('survey-form')&&!types.has('table-grid')&&!types.has('single-choice'))types.add('note-completion');
        else if(types.has('webpage')&&!types.has('table-grid')&&!types.has('single-choice'))types.add('note-completion');
        if(types.has('summary'))types.delete('note-completion');
        if(types.has('map-plan'))types.delete('note-completion');
        if(types.has('picture-diagram'))types.delete('note-completion');
        if(types.has('editing'))types.delete('table-grid');
        if(types.has('process-flow'))types.delete('note-completion');
        const ordered = [...types].sort((a,b)=>primaryOrder.indexOf(a)-primaryOrder.indexOf(b));
        const row={id:`dse-${year}-task-${task.number}-q${number}`,year,task:task.number,number,title:task.title,text:local,types:ordered,sourceBlock:blockIndex,href:`listening-system.html?section=dse&year=${year}&task=${task.number}&question=${number}`};
        taskRows.push(row);paperRows.push(row);rows.push(row);
        rangeMap.delete(key);
      }
    }
    taskRows.sort((a,b)=>a.number-b.number);
    assert.ok(taskRows.length,`${year} Task ${task.number} has no questions`);
    assert.equal(new Set(taskRows.map(row=>row.number)).size,taskRows.length,`${year} Task ${task.number} duplicates`);
  }
  paperRows.sort((a,b)=>a.number-b.number);
  assert.deepEqual(paperRows.map(row=>row.number),Array.from({length:paper.questionCount},(_,index)=>index+1),`${year} numbered coverage`);
  papers.push({year,questionCount:paper.questionCount,tasks:paper.tasks.map(task=>({number:task.number,title:task.title,first:paperRows.find(row=>row.task===task.number).number,last:paperRows.filter(row=>row.task===task.number).at(-1).number}))});
}
assert.equal(rangeMap.size,0,`Overrides without source questions: ${[...rangeMap.keys()].join(', ')}`);
assert.equal(rows.length,817);
rows.sort((a,b)=>b.year-a.year || a.task-b.task || a.number-b.number);
const counts=Object.fromEntries(Object.keys(labels).map(type=>{
 const selected=rows.filter(row=>row.types.includes(type));
 return [type,{questions:selected.length,years:new Set(selected.map(row=>row.year)).size,tasks:new Set(selected.map(row=>`${row.year}:${row.task}`)).size}];
}));
const output={version:'20261104-dse-part-a-types1',scope:'DSE English Paper 3 Part A, 2012–2026',paperCount:papers.length,taskCount:papers.reduce((total,paper)=>total+paper.tasks.length,0),questionCount:rows.length,method:'Each numbered answer slot is mapped to its response action and paper layout. A question may appear under several types.',labels,counts,papers,rows};
fs.writeFileSync('dse-listening-question-types.json',JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify(counts,null,2));
