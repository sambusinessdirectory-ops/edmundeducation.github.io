#!/usr/bin/env node
// Reproduce one canonical calibration record from shipped lesson 7 and source inventory.
// This conversion does not grant new editorial, human, audio, or release approval.
import fs from 'node:fs';
import path from 'node:path';
import legacy from '../../natural-english/advanced-expressions.mjs';
import {normalise,validateRecord} from './schema.mjs';
const lesson=legacy.find(l=>l.number===7),get=style=>lesson.questions.find(q=>q.style===style);
const inventoryPath=process.argv[2],outputPath=process.argv[3];
if(!inventoryPath||!outputPath)throw new Error('Usage: node tools/advanced-native-bulk/convert-calibration.mjs occurrences.json output.json');
const occurrences=JSON.parse(fs.readFileSync(inventoryPath,'utf8')).filter(o=>normalise(o.phrase)==='get through it');
const question=style=>{
 const q=get(style),options=q.options.map((en,index)=>({id:`option-${index+1}`,en,zh:q.optionZh?.[en]||''}));
 return {promptEn:q.promptZh?q.prompt:'',promptZh:q.promptZh||q.prompt,options,explanationZh:q.explanation,...(style==='reply'?{goldenId:options.find(o=>o.en===q.golden).id}:{answerId:options.find(o=>o.en===q.answers[0]).id})};
};
const speaking=lesson.steps.find(s=>s.style==='speak'),writing=get('final'),target='got through it',start=speaking.model.indexOf(target);
const record={id:lesson.id,number:lesson.number,titleEn:lesson.titleEn,titleZh:lesson.titleZh,category:'phrasal-verb',contentRevision:1,
 target:{pattern:String.raw`\b(?:get|gets|got|getting)\s+through\s+(?:it|this)\b`,glossaryForbidden:[String.raw`\b(?:get|gets|got|getting)\s+through\b`]},
 sources:occurrences.map(o=>({occurrenceId:o.occurrence_id,file:path.basename(o.source.path),sha256:o.source.document_sha256,page:o.source.pdf_page,book:o.source.book,question:o.source.question,sample:o.source.sample,locatorNote:'The extracted source table does not identify its book, question or sample answer. Actual PDF page is retained; these unknown fields are not inferred.',sentence:o.reference_sentence,referenceSentenceKind:o.reference_sentence_kind,expression:o.phrase})),
 brief:{meaningEn:'Complete or endure a difficult experience.',meaningZh:lesson.meaning,grammar:'get through + difficult experience; common reference form: get through it',register:'neutral conversational English',boundaryZh:'熬過或完成困難經歷，不表示過程輕鬆，也不一定表示因此變得更強。',misconceptionZh:'不要把單純完成或忍受困難等同於成長或毫不費力。',outcomeZh:lesson.summary},
 listening:{...question('audio'),en:lesson.audio,zh:lesson.audioZh},reply:question('reply'),scene:question('scene'),contrast:question('contrast'),dialogue:question('branch'),
 speaking:{en:speaking.model,zh:speaking.zh,promptZh:speaking.speakingPrompt,targetSpan:{start,end:start+target.length},cloze:speaking.displayModel},
 writing:{promptZh:writing.prompt,selfCheckZh:writing.explanation,examples:writing.answers.map(en=>({en,zh:writing.answersZh[en]})),glossary:writing.glossary.map(([en,zh])=>{
  const exampleIndex=writing.answers.findIndex(answer=>normalise(answer).includes(normalise(en))),answer=writing.answers[exampleIndex],start=answer.toLowerCase().indexOf(en.toLowerCase());
  return {en,zh,exampleIndex,span:{start,end:start+en.length}};
 })},takeaways:lesson.takeaways.map(en=>({en,zh:lesson.takeawaysZh[en]})),
 review:{state:'drafted',calibration:{module:lesson.id,origin:'Existing repository module; converted without changing its authored English, translations, answer keys, glossary, or speaking cue.',independentHumanApproval:false},note:'Canonical migration example only. Automated structural validation does not certify language quality or a production release.'}};
const validation=validateRecord(record);if(validation.errors.length)throw new Error(JSON.stringify(validation));
fs.mkdirSync(path.dirname(outputPath),{recursive:true});fs.writeFileSync(outputPath,JSON.stringify({schemaVersion:1,batchId:'calibration-007',lessons:[record]},null,2)+'\n');
console.log(outputPath);
