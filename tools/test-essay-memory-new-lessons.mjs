import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const node = {window:{}};
vm.createContext(node);
for (const file of ['essay-memory-lessons-data.js','essay-memory-new-support.js']) vm.runInContext(fs.readFileSync(file,'utf8'),node,{filename:file});
const canonical = {window:{}};
vm.createContext(canonical);
for(const file of ['writing-practice-model-essays-opinion-3-16-data.js','writing-practice-model-essays-discuss-4-23-data.js','writing-practice-model-essays-cause-2-20-data.js','writing-audio-manifest.js']) vm.runInContext(fs.readFileSync(file,'utf8'),canonical,{filename:file});
const sourceCollections=['EDMUND_IELTS_WRITING_OPINIONS_3_16_EXERCISES','EDMUND_IELTS_WRITING_DISCUSS_4_23_EXERCISES','EDMUND_IELTS_WRITING_CAUSE_2_20_EXERCISES'];
const lessons = node.window.ESSAY_MEMORY_LESSONS;
const keys=['opinion:3','discuss-both-views:4','cause-solution:2'];
const counts=[19,18,17];
const vocabularyRoundCounts=[28,34,34];
const patternAnswers={
  'how-clause':/help shape how/i,'instead of':/instead of/i,stance:/disagree/i,
  because:/because/i,causative:/\bmakes?\b/i,if:/\bif\b/i,when:/\bwhen\b/i,
  sequencing:/^Second,/i,so:/,\s*so\b/i,consequence:/^For that reason,/i,
  benefit:/also benefits/i,'by contrast':/by contrast/i,'for instance':/for instance/i,
  'in conclusion':/^In conclusion,/i,and:/,\s*and\b/i,'for example':/^For example,/i,
  problem:/(?:problem|issue) is that/i,relative:/\bwho\b/i,progression:/^Over time,/i,
  method:/\b(?:through|by\s+\w+ing)\b/i,however:/\bhowever\b/i,
  'participle-result':/,\s*creating\b/i,overall:/^Overall,/i,'as-change':/^As\b/i,
  'parallel-verbs':/\band\b/i,'rather than':/rather than/i,'as a result':/^As a result,/i,
  purpose:/^To\s+\w+/i,list:/,\s*and\b/i,transformation:/\bturn(?:ed|s)?\b.*\binto\b/i,
  reminder:/\bremind(?:s|ed)?\b.+\bthat\b/i,but:/,\s*but\b/i,
  'enumerated-consequence':/^This creates.+:/i,
};
for (let n=0;n<keys.length;n++) {
  const lesson=lessons[keys[n]];
  const taught=lesson.learningSentences||lesson.sentences;
  assert(lesson,keys[n]);
  assert.equal(taught.length,counts[n]);
  const source=canonical.window[sourceCollections[n]][lesson.id];
  const sourceText=source.paragraphs.flatMap(paragraph=>paragraph.sentences.map(sentence=>sentence.parts.join(''))).join(' ').replace(/\s+/g,' ');
  const lessonText=taught.map(sentence=>sentence.english).join(' ').replace(/\s+/g,' ');
  assert.equal(lessonText,sourceText,`${keys[n]} source text changed`);
  assert.equal(lesson.audio,canonical.window.EDMUND_WRITING_AUDIO[lesson.id].path);

  assert.equal(lesson.support.sentences.length,counts[n]);
  assert.equal(lesson.support.structures.length,counts[n]);
  assert.equal(lesson.support.transfer.length,n===0?10:12);
  assert.equal(new Set(lesson.support.transfer.map(item=>item.context)).size,lesson.support.transfer.length);
  assert.equal(lesson.support.evidence.length,5);
  assert.equal(lesson.support.logic.length,2);
  assert.equal(lesson.mediumAnswers.length,45);
  const allAnswers=[...lesson.mediumAnswers,...lesson.support.mediumExtras];
  for (const [index,sentence] of taught.entries()) assert(allAnswers.some(answer=>sentence.english.toLowerCase().includes(answer.toLowerCase())),`${keys[n]} sentence ${index+1} lacks a medium blank`);
  assert(fs.existsSync(lesson.audio),lesson.audio);
  for (const [index,sentence] of taught.entries()) {
    const bridge=lesson.support.sentences[index];
    assert.equal(bridge.chunks.join(' '),sentence.english);
    assert.equal(bridge.simpleChunks.join(' '),bridge.simple);
    assert(bridge.chunks.every(chunk=>chunk.split(/\s+/).length<=12));
    assert(bridge.simpleChunks.every(chunk=>chunk.split(/\s+/).length<=12));
    assert(bridge.simple);
    assert(sentence.chinese);
    assert(sentence.words.length>0);
    assert(sentence.start<sentence.end);
    if(sentence.english.split(/\s+/).length>10) assert(bridge.synonyms.length>=4,`${keys[n]} sentence ${index+1}: only ${bridge.synonyms.length} lexical bridges`);
    for(const synonym of bridge.synonyms) assert(synonym.original&&synonym.simple&&synonym.meaning);
  }
  for(const frame of lesson.support.structures){
    const sourceSentence=taught.find(sentence=>sentence.paragraph+1===frame.source.paragraph&&sentence.index+1===frame.source.sentence);
    assert.equal(frame.parts.map(part=>part.text).join(''),sourceSentence.english);
    assert(frame.parts.length>=2);
    assert(frame.meaning.length>12 && frame.usage.length>12);
    assert.equal(frame.prompt,'哪一句正確用了上面標示的句型？');
    assert(!frame.usage.includes('清楚陳述一項意思'));
    assert(!/觀眾|藝術|博物館|美術館|本地|家族|公司|企業|商店|購物|產品|消費者|學生|作品|展覽|零食|大品牌|廣告/.test(frame.usage),`${keys[n]} ${frame.id}: topic-specific usage`);
    assert(patternAnswers[frame.patternType],`${keys[n]} ${frame.id}: unaudited pattern`);
    assert(patternAnswers[frame.patternType].test(frame.options[0]),`${keys[n]} ${frame.id}: quiz answer misses ${frame.patternType}`);
    assert.equal(frame.options.length,4);
    assert.equal(new Set(frame.options).size,4);
    assert.equal(frame.explanations.length,4);
    assert(taught.some(sentence=>sentence.paragraph+1===frame.source.paragraph&&sentence.index+1===frame.source.sentence));
    assert(!frame.options.some(option=>/museum|gallery|family-run|advertis/i.test(option)));
  }
  for(const item of lesson.support.transfer){
    assert.equal(item.options.length,4);
    assert.equal(item.explanations.length,4);
    assert(item.options.every(option=>/[\u3400-\u9fff]/.test(option)));
    assert(item.sourceSentenceIndices.every(index=>taught[index]));
    assert(item.modelLink);
    const lengths=item.options.map(option=>option.length);
    assert(Math.max(...lengths)-Math.min(...lengths)<=9,`${keys[n]} transfer options reveal the answer by length`);

  }
}
const html=fs.readFileSync('writing-practice.html','utf8');
const insteadFrame=lessons['opinion:3'].support.structures[1];
assert(insteadFrame.meaning.includes('採用的做法') && insteadFrame.meaning.includes('被排除的做法'));
assert(insteadFrame.usage.includes('instead of 後接名詞或 -ing 動詞'));
assert(!insteadFrame.usage.includes('引言'));
assert.equal(insteadFrame.parts[0].label,'提出主張及採用的做法');
assert.equal(insteadFrame.parts[2].label,'被排除的另一做法');
const opinionSo=lessons['opinion:3'].support.structures[8];
assert.equal(opinionSo.patternType,'so');
assert(opinionSo.usage.includes('A, so B'));
assert(!opinionSo.usage.includes('觀眾'));
assert.equal(opinionSo.parts[0].label,'原因／情況');
assert.equal(opinionSo.parts[2].label,'結果');
assert(html.includes('essay-memorization.html?essay=${encodeURIComponent(essayKey)}'));
const {chromium}=await import(process.env.PROFESSIONAL_QA_PLAYWRIGHT || '/Users/sammak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce',acceptDownloads:true});
await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',route=>route.fulfill({contentType:'application/javascript',body:''}));
await page.addInitScript(() => {
  sessionStorage.setItem('edmund-essay-memory-student-v1',JSON.stringify({id:'qa-student',name:'QA student',role:'student',token:'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'}));
  window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{user:{id:'anonymous'}}},error:null})},rpc:async()=>({data:[{id:'qa-student',name:'QA student',role:'student',session_token:'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'}],error:null})})};
});
const errors=[];
page.on('pageerror',error=>errors.push(error.message));
const base=process.env.MEMORY_QA_URL || 'http://127.0.0.1:8764/essay-memorization.html';
for(const key of keys){
  const lesson=lessons[key];
  await page.goto(`${base}?essay=${encodeURIComponent(key)}`);
  assert((await page.title()).includes(lesson.title));
  assert.equal(await page.locator('[data-stage]').count(),11);
  assert.equal(await page.locator('[data-memory-essay][aria-current=page]').getAttribute('data-memory-essay'),key);
  assert.equal(await page.locator('.setup-card strong').innerText(),lesson.title.replace(' - IELTS - ',' · ')+' · '+lesson.meta.topic);
  for(const stage of [0,1,2,3,4,5,6,7,8,9,10]){
    await page.locator(`[data-stage="${stage}"]`).click();
    assert(await page.locator('#step-select option').count()>0,`${key}: stage ${stage}`);
    assert((await page.locator('#game-card').innerText()).length>20);
    assert(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)),`${key}: overflow stage ${stage}`);
  }
  await page.locator('[data-stage="5"]').click();
  assert.equal(await page.locator('#step-select option').count(),vocabularyRoundCounts[keys.indexOf(key)]);
  await page.locator('[data-stage="4"]').click();
  assert.equal(await page.locator('#step-select option').count(),key===keys[0]?10:12);
  for(let index=0;index<lesson.support.transfer.length;index++){
    await page.locator('#step-select').evaluate((select,value)=>{select.value=String(value);select.dispatchEvent(new Event('change'));},index);
    assert.equal(await page.locator('[data-choice]').count(),4,`${key}: transfer ${index+1} choices`);
    assert((await page.locator('.transfer-question').textContent()).includes(lesson.support.transfer[index].question));
    assert(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)),`${key}: transfer ${index+1} overflows mobile`);
  }
  await page.locator('[data-stage="6"]').click();
  assert(await page.locator('.structure-part').count()>=1);
  assert.equal(await page.locator('.structure-translation').count(),1);
  for(let index=0;index<lesson.support.structures.length;index++){
    await page.locator('#step-select').evaluate((select,value)=>{select.value=String(value);select.dispatchEvent(new Event('change'));},index);
    assert.equal((await page.locator('.concept-card').last().locator('p').textContent()).replace(/\s+/g,''),lesson.support.structures[index].usage.replace(/\s+/g,''));
    assert.equal(await page.locator('.structure-part').count(),lesson.support.structures[index].parts.length);
    assert.equal(await page.locator('.question-intro h3').textContent(),lesson.support.structures[index].prompt);
    assert(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)),`${key}: structure ${index+1} overflows mobile`);
  }
  await page.locator('#step-select').evaluate(select=>{select.value='0';select.dispatchEvent(new Event('change'));});
  await page.locator('[data-choice="1"]').click();
  assert.equal(await page.locator('[data-continue]').count(),0);
  await page.locator('[data-choice="0"]').click();
  assert.equal(await page.locator('[data-continue]').count(),1);
  await page.locator('[data-stage="4"]').click();
  assert.equal(await page.locator('.transfer-question').count(),1);
  await page.locator('[data-choice="0"]').click();
  assert(await page.locator('.model-connection blockquote').count()>0);
  await page.locator('[data-stage="8"]').click();
  const recallCount=await page.locator('#step-select option').count();
  for(let index=0;index<recallCount;index++){
    await page.locator('#step-select').evaluate((select,value)=>{select.value=String(value);select.dispatchEvent(new Event('change'));},index);
    assert((await page.locator('.speaking-text').innerText()).includes('＿'),`${key} recall sentence ${index+1} lacks blanks`);
  }
  assert.equal(await page.locator('[data-edmund-record-id]').count(),0);
  assert((await page.locator('.recording-practice a').getAttribute('href')).includes('essay-memory-recordings.html'));
  const previousScale=await page.evaluate(()=>document.documentElement.style.getPropertyValue('--reader-scale'));
  await page.locator('#font-size-button').click();
  assert.notEqual(await page.evaluate(()=>document.documentElement.style.getPropertyValue('--reader-scale')),previousScale);
  await page.locator('#playback-speed').selectOption('0.75');
  assert.equal(await page.evaluate(()=>document.querySelector('#playback-speed').value),'0.75');
  await page.locator('[data-stage="9"]').click();
  assert.equal(await page.locator('#step-select option').count(),4);
  await page.locator('[data-stage="10"]').click();
  assert.equal(await page.locator('#step-select option').count(),counts[keys.indexOf(key)]);
  const stored=await page.evaluate(id=>localStorage.getItem(`edmund-essay-memory-${id}-v1-student-qa-student`),lesson.id);
  assert(stored);
}
// A backup belongs to one essay and cannot silently overwrite another lesson.
await page.goto(`${base}?essay=opinion%3A3`);
const downloadPromise=page.waitForEvent('download');
await page.locator('#export-progress').click();
const download=await downloadPromise;
const backup='/private/tmp/essay3-memory-progress-qa.json';
await download.saveAs(backup);
await page.goto(`${base}?essay=discuss-both-views%3A4`);
await page.locator('#progress-file').setInputFiles(backup);
await page.waitForFunction(()=>document.querySelector('#save-status').textContent.includes('未能載入'));
assert((await page.locator('#save-status').innerText()).includes('未能載入'));
assert.deepEqual(errors,[]);
await browser.close();
console.log('PASS: three source-linked lessons, eleven stages, mobile layout, transfer feedback, distinct recording/progress IDs and backup isolation.');
