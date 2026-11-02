// Compile one reviewed, source-linked authoring record into a browser lesson.
// This compiler validates shape and exact source spans; editorial accuracy still requires human review.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const authoringPath=process.argv[2];
if(!authoringPath)throw Error('Usage: node tools/build-essay-memory-authored.mjs <authoring.mjs|json>');
const authoring=authoringPath.endsWith('.mjs')
  ? (await import(pathToFileURL(resolve(authoringPath)).href)).default
  : JSON.parse(fs.readFileSync(authoringPath,'utf8'));
const read=file=>fs.readFileSync(new URL(`../${file}`,import.meta.url),'utf8');
const index={window:{}};
vm.runInNewContext(read('essay-memory-catalog.js'),index);
const meta=index.window.ESSAY_MEMORY_CATALOG.find(row=>row.key===authoring.key);
if(!meta)throw Error(`Unknown essay: ${authoring.key}`);
const sourceContext={window:{}};
vm.runInNewContext(read(`essay-memory-lessons/${meta.id}.js`),sourceContext);
const essay=sourceContext.window.ESSAY_MEMORY_LESSONS[authoring.key];
const candidates=JSON.parse(read('tools/essay-memory-structure-candidates.json')).essays[authoring.key];
const sentenceGroups=JSON.parse(read('tools/essay-memory-sentence-groups.json')).essays[authoring.key];
const grouped=candidates.length!==essay.sentences.length;
const lessonSentences=grouped?sentenceGroups.map(group=>{
  const records=group.sourceIndices.map(i=>essay.sentences[i]);
  assert(records.length&&records.every(row=>row.paragraph===records[0].paragraph));
  const english=records.map(row=>row.english).join(' ');
  const chinese=records.map(row=>row.chinese).join('');
  assert.equal(english,group.english,`Grouped source English ${group.paragraph}.${group.sentence}`);
  assert.equal(chinese,group.chinese,`Grouped source Chinese ${group.paragraph}.${group.sentence}`);
  return {paragraph:group.paragraph-1,index:group.sentence-1,role:records[0].role,
    english,chinese,words:records.flatMap(row=>row.words),start:records[0].start,end:records.at(-1).end,
    sourceIndices:group.sourceIndices};
}):essay.sentences;
const count=lessonSentences.length;
assert.equal(authoring.simple.length,count,'One simple English bridge per source record');
assert.equal(authoring.vocabulary.length,count,'One reviewed vocabulary list per source record');
assert.equal(authoring.structures.length,count,'One reviewed structure card per source record');
assert.equal(candidates.length,count,'One reviewed structure candidate per complete sentence');

function chunks(text){
  const words=text.split(/\s+/).filter(Boolean);
  const desired=Math.min(4,Math.max(2,Math.round(words.length/7)));
  const pieces=[];
  let start=0;
  for(let left=desired;left>1;left--){
    const ideal=start+Math.round((words.length-start)/left);
    const low=Math.max(start+1,ideal-2),high=Math.min(words.length-left+1,ideal+2);
    let cut=ideal,best=-Infinity;
    for(let i=low;i<=high;i++){
      const before=words[i-1],after=words[i];
      let score=-Math.abs(i-ideal);
      if(/[,:;]$/.test(before))score+=3;
      if(/^(?:so|because|but|although|when|if|once|which|rather|instead|especially|therefore)$/i.test(after))score+=2;
      if(/^(?:a|an|the|of|to|and|or)$/i.test(after))score-=2;
      if(score>best){best=score;cut=i;}
    }
    pieces.push(words.slice(start,cut).join(' '));
    start=cut;
  }
  pieces.push(words.slice(start).join(' '));
  assert.equal(pieces.join(' '),text);
  assert(pieces.every(piece=>piece.length>0));
  return pieces;
}

const sentences=lessonSentences.map((source,i)=>{
  const simple=authoring.simple[i].trim();
  assert(simple&&simple.toLowerCase()!==source.english.toLowerCase(),`Unchanged simple sentence ${i+1}`);
  const synonyms=authoring.vocabulary[i].map(([original,plain,meaning])=>{
    assert(original&&plain&&meaning,`Incomplete vocabulary bridge ${i+1}`);
    assert(source.english.toLowerCase().includes(original.toLowerCase()),`Missing source vocabulary ${i+1}: ${original}`);
    assert(simple.toLowerCase().includes(plain.toLowerCase()),`Missing simple vocabulary ${i+1}: ${plain}`);
    return {original,simple:plain,meaning};
  });
  assert(synonyms.length>=2,`Too few real vocabulary bridges: ${i+1}`);
  const sourceChunks=authoring.chunkOverrides?.[i]||chunks(source.english);
  const simpleChunks=authoring.simpleChunkOverrides?.[i]||chunks(simple);
  assert.equal(sourceChunks.join(' '),source.english,`Source chunk override changed wording ${i+1}`);
  assert.equal(simpleChunks.join(' '),simple,`Simple chunk override changed wording ${i+1}`);
  assert(sourceChunks.length>=2&&simpleChunks.length>=2&&sourceChunks.every(Boolean)&&simpleChunks.every(Boolean),`Too few chunks ${i+1}`);
  return {simple,synonyms,chunks:sourceChunks,simpleChunks};
});

const structures=lessonSentences.map((source,i)=>{
  const edit=authoring.structures[i],candidate=candidates[i];
  if(!candidate||candidate.origin==='unmatched'&&!edit.frame)throw Error(`Unreviewed structure: ${i+1}`);
  const base=edit.frame||candidate;
  const parts=(base.parts||[]).map(part=>Array.isArray(part)?{text:part[0],kind:part[1],label:part[2]}:part);
  assert.equal(parts.map(part=>part.text).join(''),source.english,`Structure source span ${i+1}`);
  assert(parts.length>=2&&parts.some(part=>part.kind==='link')&&parts.some(part=>part.kind==='slot'),`Structure components ${i+1}`);
  const distractors=edit.distractors.map(index=>authoring.structures[index]);
  assert.equal(distractors.length,3,`Three local distractors ${i+1}`);
  const options=[edit.example,...distractors.map(row=>row.example)];
  assert.equal(new Set(options).size,4,`Distinct structure options ${i+1}`);
  const wrongReasons=edit.wrongReasons||distractors.map(row=>row.distractorReason);
  assert.equal(wrongReasons.length,3,`Three distractor explanations ${i+1}`);
  assert(wrongReasons.every(Boolean),`Empty distractor explanation ${i+1}`);
  return {id:`${meta.id}-frame-${String(i+1).padStart(2,'0')}`,frame:base.formula,
    meaning:base.meaning,usage:base.usage,source:{paragraph:source.paragraph+1,sentence:source.index+1},parts,
    prompt:'哪一句正確用了上面標示的句型及其功能？',options,correct:0,
    explanations:[edit.answerReason,...wrongReasons],patternType:edit.patternType||'reviewed'};
});
const support={sentences,intro:authoring.intro,route:authoring.route,evidence:authoring.evidence,
  logic:authoring.logic,structures,transfer:authoring.transfer,mediumExtras:authoring.mediumExtras||[]};
assert(support.intro?.length>=2&&support.route?.length&&support.evidence?.length>=4&&support.logic?.length===2);
assert(support.transfer?.length>=10);
for(const [i,item] of support.transfer.entries()){
  assert(item.options?.length===4&&item.explanations?.length===4&&item.correct===0,`Transfer choices ${i+1}`);
  assert(item.modelLink&&item.sourceSentenceIndices?.length&&item.sourceSentenceIndices.every(n=>Number.isInteger(n)&&n>=0&&n<count),`Transfer source ${i+1}`);
}
const out=`/* Individually authored and reviewed lesson support. */\n(()=>{const essay=window.ESSAY_MEMORY_LESSONS[${JSON.stringify(authoring.key)}];if(!essay)throw Error('Missing exact source for ${authoring.key}');${grouped?`essay.learningSentences=${JSON.stringify(lessonSentences)};`:''}essay.meta=${JSON.stringify(authoring.meta)};essay.support=${JSON.stringify(support)};})();\n`;
const target=new URL(`../essay-memory-support/${meta.id}.js`,import.meta.url);
fs.mkdirSync(new URL('../essay-memory-support/',import.meta.url),{recursive:true});
fs.writeFileSync(target,out);
console.log(`Compiled ${authoring.key}: ${count} sentences, ${structures.length} structures, ${support.transfer.length} transfers.`);
