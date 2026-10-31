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
const counts=[19,17,17];
for (let n=0;n<keys.length;n++) {
  const lesson=lessons[keys[n]];
  assert(lesson,keys[n]);
  assert.equal(lesson.sentences.length,counts[n]);
  const source=canonical.window[sourceCollections[n]][lesson.id];
  const sourceText=source.paragraphs.flatMap(paragraph=>paragraph.sentences.map(sentence=>sentence.parts.join(''))).join(' ').replace(/\s+/g,' ');
  const lessonText=lesson.sentences.map(sentence=>sentence.english).join(' ').replace(/\s+/g,' ');
  assert.equal(lessonText,sourceText,`${keys[n]} source text changed`);
  assert.equal(lesson.audio,canonical.window.EDMUND_WRITING_AUDIO[lesson.id].path);

  assert.equal(lesson.support.sentences.length,counts[n]);
  assert.equal(lesson.support.structures.length,7);
  assert.equal(lesson.support.transfer.length,n===0?5:6);
  assert.equal(lesson.support.evidence.length,5);
  assert.equal(lesson.support.logic.length,2);
  assert.equal(lesson.mediumAnswers.length,45);
  const allAnswers=[...lesson.mediumAnswers,...lesson.support.mediumExtras];
  for (const [index,sentence] of lesson.sentences.entries()) assert(allAnswers.some(answer=>sentence.english.toLowerCase().includes(answer.toLowerCase())),`${keys[n]} sentence ${index+1} lacks a medium blank`);
  assert(fs.existsSync(lesson.audio),lesson.audio);
  for (const [index,sentence] of lesson.sentences.entries()) {
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
    assert.equal(frame.options.length,4);
    assert.equal(new Set(frame.options).size,4);
    assert.equal(frame.explanations.length,4);
    assert(lesson.sentences.some(sentence=>sentence.paragraph+1===frame.source.paragraph&&sentence.index+1===frame.source.sentence));
    assert(!frame.options.some(option=>/museum|gallery|family-run|advertis/i.test(option)));
  }
  for(const item of lesson.support.transfer){
    assert.equal(item.options.length,4);
    assert.equal(item.explanations.length,4);
    assert(item.options.every(option=>/[\u3400-\u9fff]/.test(option)));
    assert(item.sourceSentenceIndices.every(index=>lesson.sentences[index]));
    assert(item.modelLink);
    const lengths=item.options.map(option=>option.length);
    assert(Math.max(...lengths)-Math.min(...lengths)<=9,`${keys[n]} transfer options reveal the answer by length`);

  }
}
const html=fs.readFileSync('writing-practice.html','utf8');
assert(html.includes('essay-memorization.html?essay=${encodeURIComponent(essayKey)}'));
const {chromium}=await import(process.env.PROFESSIONAL_QA_PLAYWRIGHT || '/Users/sammak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce',acceptDownloads:true});
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
  await page.locator('[data-stage="6"]').click();
  assert(await page.locator('.structure-part').count()>=3);
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
  const recording=await page.locator('[data-edmund-record-id]').getAttribute('data-edmund-record-id');
  assert(recording.startsWith(lesson.id+'-memory-'));
  const stored=await page.evaluate(id=>localStorage.getItem(`edmund-essay-memory-${id}-v1`),lesson.id);
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
