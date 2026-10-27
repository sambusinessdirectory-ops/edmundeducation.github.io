import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {grammarModules,exportText,exportHtml,exportSections,curationLines} from '../grammar-admin-export.mjs';
const scope={window:{}};vm.createContext(scope);
for(const f of ['grammar-tense-data.js','grammar-tense-curation-data.js','grammar-tense-extension-data.js','grammar-articles-data.js','grammar-advanced-articles-data.js','grammar-advanced-articles-extension-data.js','grammar-new-curations-data.js','grammar-three-sets-data.js'])vm.runInContext(fs.readFileSync(new URL('../'+f,import.meta.url),'utf8'),scope);
const modules=grammarModules(scope.window);
assert.deepEqual(modules.map(m=>[m.id,m.questions.length,m.topics.length]),[['tense',195,61],['articles',150,66],['advanced-articles',120,31],['so',150,30],['modal-verbs',150,42],['unless',150,24]]);
let checks=0;
for(const m of modules){
 const c=exportText(m,'curation'),e=exportText(m,'exercises'),a=exportText(m,'exercises',true);
 for(const q of m.questions){for(const field of ['prompt','translation']){assert.ok(e.includes(q[field]),`${m.id} Q${q.number} ${field}`);checks++;}
 assert.ok(a.includes(q.answer));
 for(const s of q.steps || []){assert.ok(a.includes(s.title));assert.ok(a.includes(s.body));checks+=2;}
 for(const s of q.explanation || []){assert.ok(a.includes(s));checks++;}
 }
 for(const t of m.topics){assert.ok(c.includes(t.title));for(const f of ['body','focus','formula','source'])if(t[f])assert.ok(c.includes(curationLines(t[f])));for(const ex of t.examples||[])for(const str of (Array.isArray(ex)?ex:[ex.text,ex.translation].filter(Boolean)))assert.ok(c.includes(curationLines(str)));if(t.checkpoint){for(const str of [t.checkpoint.prompt,t.checkpoint.whyPrompt,...t.checkpoint.choices,...t.checkpoint.whyChoices,t.checkpoint.explanation])assert.ok(c.includes(curationLines(str)));}checks++;}
 if(m.appendix)assert.ok(c.includes(curationLines(m.appendix)));
 assert.equal(exportSections(m,'exercises').length,m.questions.length);
 assert.ok(exportHtml(m,'curation').includes('lang="zh-Hant"'));
 assert.ok(e.includes('參考答案：'));
 const sections=exportSections(m,'exercises');
 const html=exportHtml(m,'exercises');
 for(const [index,q] of m.questions.entries()){
  const section=sections[index];
  assert.equal(section.title,`第 ${q.number} 題`);
  assert.ok(section.body.includes(q.prompt));
  assert.ok(section.body.includes(`參考答案：${q.answer}`));
  assert.ok(section.body.includes('本題完整解析'));
  for(const item of q.steps || [])for(const value of [item.title,item.body])assert.ok(section.body.includes(value),`${m.id} Q${q.number}: explanation must stay with its own question`);
  for(const value of q.explanation || [])assert.ok(section.body.includes(value),`${m.id} Q${q.number}: complete explanation`);
  if(q.completeSentence)assert.ok(section.body.includes(q.completeSentence));
 }
 assert.ok(html.includes('本題完整解析'));
 assert.equal((e.match(/本題完整解析/g)||[]).length,m.questions.length);
}
assert.ok(!exportText(modules[0],'exercises',true).includes('Mia'));
const injection={title:'<script>x</script>',id:'safe',questions:[{number:1,prompt:'<img onerror=x>',translation:'中文'}]};assert.ok(exportHtml(injection,'exercises').includes('&lt;img onerror=x&gt;'));
assert.throws(()=>exportText(modules[0],'bad'));
console.log(`Grammar exports: 6 modules, 915 exercises, 254 curation topics, ${checks} content checks passed.`);

const {createRequire}=await import('node:module');
const require=createRequire(new URL('./email-qa/package.json',import.meta.url));
const {JSDOM}=require('jsdom');
const doc=new JSDOM(`<div data-articles-stream><article class="grammar-articles-topic" id="articles-topic-1"><div class="grammar-articles-topic__focus"><p>On-screen editorial focus</p></div></article><section class="grammar-articles-topic--appendix"><p class="grammar-articles-map__intro">Map intro</p><div class="grammar-articles-map__checks"><ol><li>Map check</li></ol></div></section></div>`).window.document;
const withDisplay=grammarModules(scope.window,doc);
assert.ok(exportText(withDisplay[1],'curation').includes('On-screen editorial focus'));
assert.ok(exportText(withDisplay[1],'curation').includes('Map intro'));
assert.ok(exportText(withDisplay[1],'curation').includes('Map check'));
assert.ok(exportText(withDisplay[1],'curation').includes(curationLines(scope.window.EDMUND_GRAMMAR_ARTICLES_DATA.topics[0].body)));
console.log('On-screen summaries and complete source curation are both retained.');

for(const module of modules){
 const sections=exportSections(module,'exercises');
 const document=new JSDOM(exportHtml(module,'exercises')).window.document;
 const printed=[...document.querySelectorAll('section')];
 assert.equal(printed.length,module.questions.length);
 for(const [index,section] of sections.entries())assert.equal(printed[index].querySelector('p').textContent,section.body,`${module.id} Q${module.questions[index].number}: printable PDF contains every explanation character`);
}
console.log('All 915 default TXT/PDF exercise sections retain their own complete answers and explanations.');

// All three curation views and both export formats share sentence boundaries.
const lessonDom = new JSDOM('<main data-learning-portal-root><section data-view="dashboard"><div class="learning-portal-empty"></div></section></main>', {runScripts:'outside-only',pretendToBeVisual:true,url:'https://example.test/grammar-system.html'});
lessonDom.window.HTMLElement.prototype.scrollIntoView=function(){};
for(const file of ['grammar-tense-data.js','grammar-tense-curation-data.js','grammar-tense-extension-data.js','grammar-articles-data.js','grammar-advanced-articles-data.js','grammar-advanced-articles-extension-data.js','grammar-system.js','grammar-articles.js','grammar-advanced-articles.js'])lessonDom.window.eval(fs.readFileSync(new URL('../'+file,import.meta.url),'utf8'));
const sentenceWithoutBreak=/。([）)」』】”’]*)[^\s）)」』】”’]/u;
for(const selector of ['[data-tense-curation]','[data-articles-curation]','[data-advanced-articles-curation]']){
 const view=lessonDom.window.document.querySelector(selector);
 assert.ok(view);
 const clone=view.cloneNode(true);clone.querySelectorAll('br').forEach(br=>br.replaceWith('\n'));
 for(const el of clone.querySelectorAll('p,pre,h3,h4,li,strong,span[lang]'))assert.doesNotMatch(el.textContent,sentenceWithoutBreak,`${selector}: sentence must start on a new line`);
 assert.ok(!view.textContent.includes('答題時檢查'));
}
assert.equal(lessonDom.window.document.querySelectorAll('[data-tense-checkpoint]').length,2,'interactive practice is retained');
const fixture=lessonDom.window.document.createElement('p');fixture.textContent='第一句。（引文完。）第二句。   第三句。\n第四句。';
const before=fixture.textContent.replace(/\s/g,'');
lessonDom.window.EDMUND_GRAMMAR_FORMAT_CURATION(fixture);
assert.equal(fixture.querySelectorAll('br').length,4);
assert.equal(fixture.textContent.replace(/\s/g,''),before,'sentence formatting preserves every non-whitespace character');
const once=fixture.innerHTML;lessonDom.window.EDMUND_GRAMMAR_FORMAT_CURATION(fixture);assert.equal(fixture.innerHTML,once,'formatting is idempotent');
assert.equal(curationLines('第一句。）下一句。'),'第一句。）\n下一句。','closing brackets stay with their sentence');
for(const module of grammarModules(lessonDom.window,lessonDom.window.document)){
 const textOutput=exportText(module,'curation');
 assert.doesNotMatch(textOutput,sentenceWithoutBreak);
 const printable=new JSDOM(exportHtml(module,'curation')).window.document;
 const sections=exportSections(module,'curation');
 for(const [index,element] of [...printable.querySelectorAll('section p')].entries())assert.equal(element.textContent,sections[index].body,'PDF print and TXT use the same line breaks');
 assert.ok(!textOutput.includes('答題時檢查'));
}
const marker={title:'Test',questions:[],topics:[{title:'Rule',focus:'Keep this.',check:'REMOVE_ONLY_THIS_CHECK_BLOCK',examples:[]}]};
assert.ok(!exportText(marker,'curation').includes('REMOVE_ONLY_THIS_CHECK_BLOCK'));
assert.ok(!exportHtml(marker,'curation').includes('REMOVE_ONLY_THIS_CHECK_BLOCK'));
console.log('All 3 curation modules: Chinese sentence breaks, attached closing brackets, removed answer-check blocks, and consistent TXT/PDF formatting passed.');
lessonDom.window.close();
