// Export content from the same module data used by the learner interface.
const text = value => String(value ?? '');
const escape = value => text(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const displayedTense = value => JSON.parse(JSON.stringify(value).replace(/\bMia\b/g,'Tom').replaceAll('米婭','湯姆'));
export function grammarModules(source, document) {
  const tense = displayedTense(source.EDMUND_GRAMMAR_TENSE_QUESTIONS || []);
  const modules = [
    {id:'tense',title:'Tense · 時態',questions:tense,topics:displayedTense(source.EDMUND_GRAMMAR_TENSE_CURATION || []),appendix:''},
    {id:'articles',title:'Articles · 冠詞',...source.EDMUND_GRAMMAR_ARTICLES_DATA,id:'articles'},
    {id:'advanced-articles',title:'Advanced Articles · 進階冠詞',...source.EDMUND_GRAMMAR_ADVANCED_ARTICLES_DATA,id:'advanced-articles'}
  ].filter(m => m.questions?.length);
  // Keep the on-screen editorial summaries as well as the complete imported text.
  if (document) for (const module of modules) {
    const selector = module.id === 'articles' ? '[data-articles-stream]' : module.id === 'advanced-articles' ? '[data-advanced-articles-stream]' : '';
    if (!selector) continue;
    const stream = document.querySelector(selector);
    if (!stream) continue;
    module.topics = module.topics.map(topic => {
      const card = [...stream.querySelectorAll('.grammar-articles-topic')].find(el => el.id.endsWith(`topic-${topic.number}`));
      const focus = card?.querySelector('.grammar-articles-topic__focus p')?.textContent;
      return focus ? {...topic, body:`核心規則\n${focus}\n\n完整講解與所有例句\n${topic.body}`} : topic;
    });
    const map = stream.querySelector('.grammar-articles-topic--appendix');
    const summary = map ? [...map.querySelectorAll('.grammar-articles-map__intro,.grammar-articles-map__choice,.grammar-articles-map__checks li')].map(el => [...el.querySelectorAll('strong,p,small')].map(part => part.textContent).join('\n') || el.textContent).join('\n\n') : '';
    if (summary) module.appendix = `畫面上的解題總表\n${summary}\n\n完整原文\n${module.appendix}`;
  }
  return modules;
}
function answer(q) { return q.answer || (q.answers || q.acceptedAnswers || []).join(' / '); }
function explanation(q) { return q.steps?.map(s=>`${s.title}\n${s.body}`).join('\n\n') || (q.explanation || []).join('\n'); }
function checkpointText(c) {return [c.prompt,...c.choices.map((v,i)=>`${String.fromCharCode(65+i)}. ${v}`),`答案：${String.fromCharCode(65+c.answer)}`,c.whyPrompt,...c.whyChoices.map((v,i)=>`${String.fromCharCode(65+i)}. ${v}`),`原因答案：${String.fromCharCode(65+c.whyAnswer)}`,c.explanation].join('\n');}
export function exportSections(module, kind) {
  if (!['curation','exercises'].includes(kind)) throw new Error('Unknown export type');
  if (kind === 'curation') {
    const topics = (module.topics || []).map((t,i)=>({title:`${t.number || i+1}. ${t.title}`,body:t.body || [t.chapter,t.focus,t.formula,...(t.examples || []).map(e=>e.join('\n')),t.check,t.source,t.checkpoint ? checkpointText(t.checkpoint) : ''].filter(Boolean).join('\n\n')}));
    if (module.appendix) topics.push({title:'附錄 · Decision Map',body:module.appendix});
    if (topics.length) return topics;
    return module.questions.map(q=>({title:`第 ${q.number} 題 · ${q.tense || ''}`,body:`${q.prompt}\n${q.translation}\n\n答案：${answer(q)}\n\n${explanation(q)}`}));
  }
  return module.questions.map(q=>({title:`第 ${q.number} 題`,body:[q.context,q.passage,q.prompt,q.translation,...(q.options || []).map(o=>typeof o==='string'?o:JSON.stringify(o)), '答案：________________________________',`參考答案：${answer(q)}${q.completeSentence?'\n'+q.completeSentence:''}\n\n本題完整解析\n${explanation(q)}`].filter(Boolean).join('\n\n')}));
}
export function exportText(module,kind) {
  const label=kind==='curation'?'教學內容 / Curation':'全部練習 / All exercises';
  return `${module.title}\n${label}\n共 ${module.questions.length} 題${kind==='exercises'?' · 包括每題參考答案及完整解析':''}\n\n`+exportSections(module,kind).map(s=>`${s.title}\n${s.body}`).join('\n\n'+'='.repeat(55)+'\n\n');
}
export function exportHtml(module,kind) {
  const label=kind==='curation'?'教學內容 / Curation':'全部練習 / All exercises';
  return `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escape(module.id)}-${kind}</title><style>@page{size:A4;margin:18mm}*{box-sizing:border-box}body{font:12pt/1.65 Arial,"PingFang TC","Microsoft JhengHei",sans-serif;color:#111;background:#fff;margin:0 auto;max-width:180mm;padding:12mm}h1{font-size:24pt}h2{font-size:15pt;break-after:avoid}p{white-space:pre-wrap;overflow-wrap:anywhere;line-break:strict;word-break:normal;orphans:3;widows:3}section{margin:9mm 0;border-top:1px solid #bbb}button{font:inherit;padding:10px 20px}.tools{background:#eef3f8;padding:12px}@media print{body{padding:0;max-width:none}.tools{display:none}}</style></head><body><div class="tools"><p>按「列印」，在目的地選擇「儲存為 PDF」。</p><button onclick="window.print()">列印 / 儲存為 PDF</button></div><h1>${escape(module.title)}</h1><p>${escape(label)} · 共 ${module.questions.length} 題${kind==='exercises'?' · 包括每題參考答案及完整解析':''}</p>${exportSections(module,kind).map(s=>`<section><h2>${escape(s.title)}</h2><p>${escape(s.body)}</p></section>`).join('')}</body></html>`;
}
