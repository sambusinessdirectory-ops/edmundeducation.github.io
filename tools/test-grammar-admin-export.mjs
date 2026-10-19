import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {grammarModules,exportText,exportHtml,exportSections} from '../grammar-admin-export.mjs';
const scope={window:{}};vm.createContext(scope);
for(const f of ['grammar-tense-data.js','grammar-tense-curation-data.js','grammar-articles-data.js','grammar-advanced-articles-data.js'])vm.runInContext(fs.readFileSync(new URL('../'+f,import.meta.url),'utf8'),scope);
const modules=grammarModules(scope.window);
assert.deepEqual(modules.map(m=>[m.id,m.questions.length,m.topics.length]),[['tense',150,52],['articles',150,66],['advanced-articles',100,27]]);
let checks=0;
for(const m of modules){
 const c=exportText(m,'curation'),e=exportText(m,'exercises'),a=exportText(m,'exercises',true);
 for(const q of m.questions){for(const field of ['prompt','translation']){assert.ok(e.includes(q[field]),`${m.id} Q${q.number} ${field}`);checks++;}
 assert.ok(a.includes(q.answer));
 for(const s of q.steps || []){assert.ok(a.includes(s.title));assert.ok(a.includes(s.body));checks+=2;}
 for(const s of q.explanation || []){assert.ok(a.includes(s));checks++;}
 }
 for(const t of m.topics){assert.ok(c.includes(t.title));for(const f of ['body','focus','formula','check','source'])if(t[f])assert.ok(c.includes(t[f]));for(const ex of t.examples||[])for(const str of ex)assert.ok(c.includes(str));if(t.checkpoint){for(const str of [t.checkpoint.prompt,t.checkpoint.whyPrompt,...t.checkpoint.choices,...t.checkpoint.whyChoices,t.checkpoint.explanation])assert.ok(c.includes(str));}checks++;}
 if(m.appendix)assert.ok(c.includes(m.appendix));
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
console.log(`Grammar exports: 3 modules, 400 exercises, 145 curation topics and 2 appendices, ${checks} content checks passed.`);

const {createRequire}=await import('node:module');
const require=createRequire(new URL('./email-qa/package.json',import.meta.url));
const {JSDOM}=require('jsdom');
const doc=new JSDOM(`<div data-articles-stream><article class="grammar-articles-topic" id="articles-topic-1"><div class="grammar-articles-topic__focus"><p>On-screen editorial focus</p></div></article><section class="grammar-articles-topic--appendix"><p class="grammar-articles-map__intro">Map intro</p><div class="grammar-articles-map__checks"><ol><li>Map check</li></ol></div></section></div>`).window.document;
const withDisplay=grammarModules(scope.window,doc);
assert.ok(exportText(withDisplay[1],'curation').includes('On-screen editorial focus'));
assert.ok(exportText(withDisplay[1],'curation').includes('Map intro'));
assert.ok(exportText(withDisplay[1],'curation').includes('Map check'));
assert.ok(exportText(withDisplay[1],'curation').includes(scope.window.EDMUND_GRAMMAR_ARTICLES_DATA.topics[0].body));
console.log('On-screen summaries and complete source curation are both retained.');

for(const module of modules){
 const sections=exportSections(module,'exercises');
 const document=new JSDOM(exportHtml(module,'exercises')).window.document;
 const printed=[...document.querySelectorAll('section')];
 assert.equal(printed.length,module.questions.length);
 for(const [index,section] of sections.entries())assert.equal(printed[index].querySelector('p').textContent,section.body,`${module.id} Q${module.questions[index].number}: printable PDF contains every explanation character`);
}
console.log('All 400 default TXT/PDF exercise sections retain their own complete answers and explanations.');
