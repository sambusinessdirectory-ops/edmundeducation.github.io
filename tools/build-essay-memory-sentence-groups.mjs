// Join source records that were split for practice/audio without changing their order or wording.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=file=>fs.readFileSync(new URL(`../${file}`,import.meta.url),'utf8');
const catalogContext={window:{}};
vm.runInNewContext(read('essay-memory-catalog.js'),catalogContext);
const catalog=catalogContext.window.ESSAY_MEMORY_CATALOG;
const curated={window:{}};
for(const file of ['essay-80-memory-data.js','essay-memory-lessons-data.js'])vm.runInNewContext(read(file),curated);
function essayFor(meta){
  if(meta.key==='opinion:80')return curated.window.ESSAY_80_MEMORY_DATA;
  if(curated.window.ESSAY_MEMORY_LESSONS?.[meta.key])return curated.window.ESSAY_MEMORY_LESSONS[meta.key];
  const local={window:{}};
  vm.runInNewContext(read(`essay-memory-lessons/${meta.id}.js`),local);
  return local.window.ESSAY_MEMORY_LESSONS[meta.key];
}
const endOfSentence=text=>/[.!?][)”"'’]*$/.test(text.trim());
const output={};
const totals={essays:catalog.length,sourceRecords:0,completeSentences:0,fragmentRecords:0,joinedGroups:0,missingTerminalPunctuation:0};
for(const meta of catalog){
  const essay=essayFor(meta);
  const groups=[];
  let pending=[];
  let paragraph=-1;
  const flush=(missingTerminalPunctuation=false)=>{
    if(!pending.length)return;
    const first=pending[0];
    const group={paragraph:first.sentence.paragraph+1,sentence:groups.filter(row=>row.paragraph===first.sentence.paragraph+1).length+1,
      sourceIndices:pending.map(row=>row.index),english:pending.map(row=>row.sentence.english).join(' '),
      chinese:pending.map(row=>row.sentence.chinese).join(''),fragmented:pending.length>1,missingTerminalPunctuation};
    if(group.fragmented)totals.joinedGroups++;
    if(missingTerminalPunctuation)totals.missingTerminalPunctuation++;
    groups.push(group);
    pending=[];
  };
  essay.sentences.forEach((sentence,index)=>{
    if(paragraph!==sentence.paragraph){
      if(pending.length)flush(true);
      paragraph=sentence.paragraph;
    }
    pending.push({sentence,index});
    if(endOfSentence(sentence.english))flush();
  });
  if(pending.length)flush(true);
  assert.equal(groups.flatMap(group=>group.sourceIndices).join(','),essay.sentences.map((_,index)=>index).join(','));
  for(let p=0;p<meta.paragraphCount;p++)assert.equal(
    groups.filter(group=>group.paragraph===p+1).map(group=>group.english).join(' '),
    essay.sentences.filter(sentence=>sentence.paragraph===p).map(sentence=>sentence.english).join(' '),
    `${meta.key} paragraph ${p+1} changed while grouping`);
  output[meta.key]=groups;
  totals.sourceRecords+=essay.sentences.length;
  totals.completeSentences+=groups.length;
  totals.fragmentRecords+=essay.sentences.filter(sentence=>!endOfSentence(sentence.english)).length+
    essay.sentences.filter((sentence,index)=>index>0&&!endOfSentence(essay.sentences[index-1].english)&&sentence.paragraph===essay.sentences[index-1].paragraph&&endOfSentence(sentence.english)).length;
}
fs.writeFileSync(new URL('./essay-memory-sentence-groups.json',import.meta.url),JSON.stringify({totals,essays:output},null,2)+'\n');
console.log(JSON.stringify(totals,null,2));
