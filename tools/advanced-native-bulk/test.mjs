import assert from 'node:assert/strict';
import fs from 'node:fs';
import legacy from '../../natural-english/advanced-expressions.mjs';
import {validateRecord,compileRecord,normalise} from './schema.mjs';
import {buildArtifacts} from './build.mjs';
const lesson=legacy.find(l=>l.number===7);
const get=style=>lesson.questions.find(q=>q.style===style);
const question=style=>{
 const q=get(style);
 const options=q.options.map((en,index)=>({id:`option-${index+1}`,en,zh:q.optionZh?.[en]||''}));
 return {promptEn:q.promptZh?q.prompt:'',promptZh:q.promptZh||q.prompt,options,explanationZh:q.explanation,...(style==='reply'?{goldenId:options.find(o=>o.en===q.golden).id}:{answerId:options.find(o=>o.en===q.answers[0]).id})};
};
const speaking=lesson.steps.find(s=>s.style==='speak'),writing=get('final');
const target='got through it',start=speaking.model.indexOf(target);
const record={id:'advanced-native-1007',number:1007,titleEn:lesson.titleEn,titleZh:lesson.titleZh,category:'phrasal-verb',target:{pattern:String.raw`\b(?:get|gets|got|getting)\s+through\s+(?:it|this)\b`,glossaryForbidden:[String.raw`\b(?:get|gets|got|getting)\s+through\b`]},
 sources:[{file:'TEST FIXTURE ONLY.pdf',referenceSentenceKind:'guide_original_example',sha256:'0'.repeat(64),page:1,book:null,question:null,sample:null,locatorNote:'Synthetic test source; never published.',sentence:'We got through it.',expression:'get through it'}],
 brief:{meaningEn:'Endure or complete a difficult experience.',meaningZh:lesson.meaning,grammar:'get through + object',register:'neutral',boundaryZh:'完成困難不等於變得更強。',misconceptionZh:'過程不一定輕鬆。',outcomeZh:'辨別撐過與成長。'},
 listening:{...question('audio'),en:lesson.audio,zh:lesson.audioZh},reply:question('reply'),scene:question('scene'),contrast:question('contrast'),dialogue:question('branch'),
 speaking:{en:speaking.model,zh:speaking.zh,promptZh:speaking.speakingPrompt,targetSpan:{start,end:start+target.length}},
 writing:{promptZh:writing.prompt,selfCheckZh:writing.explanation,examples:writing.answers.map(en=>({en,zh:writing.answersZh[en]})),glossary:writing.glossary.map(([en,zh])=>{
  const exampleIndex=writing.answers.findIndex(a=>normalise(a).includes(normalise(en))),answer=writing.answers[exampleIndex],start=answer.toLowerCase().indexOf(en.toLowerCase());
  return {en,zh,exampleIndex,span:{start,end:start+en.length}};
 })},takeaways:lesson.takeaways.map(en=>({en,zh:lesson.takeawaysZh[en]})),review:{state:'drafted'}};
assert.deepEqual(validateRecord(record).errors,[]);
const overlongAudio=structuredClone(record);overlongAudio.listening.en+=' '.repeat(241);
assert.ok(validateRecord(overlongAudio).errors.some(e=>e.path==='audio[0]'),'Reject generator-length failures before producing a frozen audio queue.');
const compiled=compileRecord(record);
assert.equal(compiled.steps.length,7);assert.equal(compiled.questions.length,6);
assert.equal(compiled.completionTitle,'本課練習已完成！','Activity completion does not certify mastery.');
assert.equal(compiled.steps[5].displayModel,speaking.displayModel);
assert.equal(compiled.questions[1].allCorrect,true);
assert.equal(compiled.questions[1].options.length,4);
assert.equal(compiled.questions[1].answers.length,4);
for(const option of compiled.questions[1].options){
 const original=record.reply.options.find(o=>o.en===option);
 assert.equal(compiled.questions[1].optionZh[option],original.zh);
 assert.equal(compiled.questions[1].optionIds[option],original.id);
}
const artifacts=buildArtifacts([record]);
assert.ok(artifacts.files['advanced-imported.generated.mjs']);
const clips=JSON.parse(artifacts.files['audio-queue.generated.json']);
assert.equal(clips.length,4);assert.equal(clips[1].voice,'bm_fable');assert.equal(clips[1].lang,'en-gb');
assert.equal(clips[1].text,speaking.model);
assert.deepEqual(buildArtifacts([record]),artifacts,'Compilation is deterministic.');
const changed=structuredClone(record);changed.writing.examples[0].en='A completely changed answer.';
assert.ok(validateRecord(changed).errors.some(e=>e.path.includes('span')),'Example edits invalidate glossary source spans.');
const leaked=structuredClone(record);leaked.writing.glossary[0]={en:'got through it',zh:'撐過',exampleIndex:0,span:{start:record.writing.examples[0].en.indexOf('got through it'),end:record.writing.examples[0].en.indexOf('got through it')+14}};
assert.ok(validateRecord(leaked).errors.some(e=>e.message.includes('reveals')),'Target forms cannot enter glossary.');
const fragment=structuredClone(record);fragment.writing.glossary[0]={en:'got through',zh:'撐過',exampleIndex:0,span:{start:record.writing.examples[0].en.indexOf('got through'),end:record.writing.examples[0].en.indexOf('got through')+11}};
assert.ok(validateRecord(fragment).errors.some(e=>e.message.includes('fragment')||e.message.includes('overlaps')),'Partial target fragments cannot enter glossary.');
const twoGolden=structuredClone(record);twoGolden.reply.options[0].en='They got through it with help.';twoGolden.reply.options[1].en='We got through it together.';
assert.ok(validateRecord(twoGolden).errors.some(e=>e.path==='reply.goldenId'),'Reply cannot contain two target options.');
const books1016=JSON.parse(fs.readFileSync(new URL('../../course-materials/advanced-native/drafts-books10-16/batch-2112-2119.json',import.meta.url),'utf8')).lessons[0];
const missingSceneTarget=structuredClone(books1016);
missingSceneTarget.scene.options.find(option=>option.id===missingSceneTarget.scene.answerId).en='Choose a convenient time and write it down.';
assert.ok(validateRecord(missingSceneTarget).errors.some(e=>e.path==='scene.answerId'),'A Books 10–16 keyed scene must use the expression being chosen for that situation.');
const missingDialogueTarget=structuredClone(books1016);
missingDialogueTarget.dialogue.options.find(option=>option.id===missingDialogueTarget.dialogue.answerId).en='Use headphones in the study room.';
assert.ok(validateRecord(missingDialogueTarget).errors.some(e=>e.path==='dialogue.answerId'),'A Books 10–16 keyed dialogue must actually model its target expression.');
assert.ok(validateRecord(record,{release:true}).errors.some(e=>e.path==='review.media'),'Draft metadata cannot claim release approval.');
const unstable=structuredClone(record);unstable.speaking.cloze='__________________';
assert.ok(validateRecord(unstable).errors.some(e=>e.path==='speaking.cloze'),'Surrounding speaking text cannot disappear.');
const metaTakeaway=structuredClone(record);metaTakeaway.takeaways[0].en='Explain the meaning of this phrase.';
assert.ok(validateRecord(metaTakeaway).errors.some(e=>e.path==='takeaways[0].en'),'Takeaways must model the target rather than issue abstract learning instructions.');
for(const explanation of ['第一句符合情境。','第二項才是答案。','選項 A 是正確答案。']){
 const positional=structuredClone(record);positional.scene.explanationZh=explanation;
 assert.ok(validateRecord(positional).errors.some(e=>e.path==='scene.explanationZh'),'Shuffled options cannot have position-dependent feedback.');
}
console.log('Advanced Native bulk schema: deterministic compilation, paired options, glossary provenance/leakage, speaking cloze, audio voice and honest release gates verified.');
