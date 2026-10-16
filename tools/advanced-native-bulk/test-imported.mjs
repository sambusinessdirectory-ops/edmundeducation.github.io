import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import imported from '../../natural-english/advanced-imported.generated.mjs';
import legacyAndImported from '../../natural-english/advanced-expressions.mjs';
import {moduleMap,allQuestionMap,hydrateModule} from '../../natural-english/catalogue.mjs';
import {targetPatterns,englishText} from '../../natural-english/advanced-display.mjs';
import {audioManifest} from '../../natural-english/audio/manifest.mjs';
import {normalise} from './schema.mjs';
const root=path.dirname(path.dirname(path.dirname(fileURLToPath(import.meta.url))));
const metadata=JSON.parse(fs.readFileSync(path.join(root,'natural-english/audio/advanced-metadata.json'),'utf8'));
const ids=new Set(),numbers=new Set();
for(const lesson of legacyAndImported){assert.ok(!ids.has(lesson.id),`Duplicate module ${lesson.id}`);ids.add(lesson.id);assert.ok(!numbers.has(lesson.number),`Duplicate number ${lesson.number}`);numbers.add(lesson.number);}
for(const entry of imported){
 const lesson=await hydrateModule(entry.id);
 assert.ok(lesson.number>10,'Legacy modules may not be overwritten by an appended generated record.');
 assert.equal(lesson.course,'advanced-native');assert.equal(moduleMap.get(lesson.id)?.id,lesson.id);
 assert.deepEqual(lesson.steps.map(s=>s.style),['audio','reply','scene','contrast','branch','speak','final']);
 assert.equal(lesson.questions.length,6);assert.equal(lesson.steps[0].audioOnly,true);
 const localIds=new Set(lesson.questions.map(q=>q.id));assert.equal(localIds.size,6);
 assert.deepEqual(lesson.steps.flatMap(s=>s.questions),lesson.questions.map(q=>q.id));
 for(const q of lesson.questions){
  assert.deepEqual(allQuestionMap.get(q.id),q);assert.ok(q.explanation);
  assert.equal(q.id,`${lesson.id}-${q.style==='reply'?'v2':'v1'}-${q.style}`);
  if(q.type==='mc'){
   assert.equal(q.options.length,new Set(q.options).size);assert.ok(q.answers.every(a=>q.options.includes(a)));
   assert.equal(Object.keys(q.optionIds).length,q.options.length,'Stable option identity is retained.');
   for(const option of q.options)if(/[A-Za-z]{2}/.test(option)&&!/[\u3400-\u9fff]/.test(option))assert.match(q.optionZh[option]||'',/[\u3400-\u9fff]/,`${q.id}: missing option translation.`);
  }
 }
 const pattern=targetPatterns[lesson.id];assert.ok(pattern,`${lesson.id}: reviewed display forms missing.`);
 const target=new RegExp(pattern,'i'),reply=lesson.questions[1],writing=lesson.questions.at(-1),speaking=lesson.steps[5];
 assert.equal(reply.allCorrect,true);assert.equal(reply.options.length,4);assert.equal(reply.answers.length,4);
 assert.equal(reply.options.filter(text=>target.test(text)).length,1);assert.ok(target.test(reply.golden));
 assert.match(reply.promptZh||'',/[\u3400-\u9fff]/);assert.equal(speaking.questions.length,0);assert.equal(speaking.recording,'phrase');
 assert.ok(speaking.displayModel.includes('__________________'));assert.ok(!target.test(speaking.displayModel));
 assert.equal(writing.type,'open');assert.equal(writing.answers.length,2);assert.ok(writing.glossary.length>=4&&writing.glossary.length<=6);
 for(const answer of writing.answers){assert.ok(target.test(answer));assert.match(writing.answersZh[answer]||'',/[\u3400-\u9fff]/);assert.ok(englishText(answer,lesson.id,'yellow').includes('target-yellow'));}
 for(const [english,chinese] of writing.glossary){assert.ok(writing.answers.some(a=>normalise(a).includes(normalise(english))));assert.ok(!target.test(english));assert.match(chinese,/[\u3400-\u9fff]/);}
 assert.ok(englishText(lesson.steps[0].model,lesson.id,'green').includes('target-green'));
 const texts=[lesson.steps[0].model,speaking.model,...lesson.takeaways];assert.equal(new Set(texts).size,4);
 for(const text of texts){
  const url=audioManifest[lesson.id]?.[text];assert.ok(url,`${lesson.id}: missing approved audio mapping for ${text}`);
  const row=metadata[lesson.id]?.find(r=>r.text===text);assert.ok(row&&row.duration>=.35&&/^[a-f0-9]{64}$/.test(row.sha256),`${lesson.id}: missing checked audio metadata.`);
  if(!/^https:\/\//.test(url))assert.ok(fs.statSync(path.join(root,url)).size>1800);
 }
 assert.equal(metadata[lesson.id].find(row=>row.text===speaking.model)?.voice,'bm_fable');
}
console.log(`Advanced Native imported release: ${imported.length} generated modules validated; legacy identities preserved.`);
