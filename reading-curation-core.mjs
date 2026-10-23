// Pure curriculum/state operations: source offsets and rewind are deterministic.
export const STAGES = ['讀卷定位', '原文逐句', '逐題取證', '解說精讀', '答案回證'];
export function buildCourse(data, article, analysis) {
  if (data.articleId !== article.id || data.sourceSha256 !== analysis.sourceSha256) throw new Error('教材版本未能核實，請重新整理。');
  const steps = [];
  const add = (stage, id, kind, title, more = {}) => steps.push({stage, id, kind, title, ...more});
  add(0, 'welcome', 'welcome', '先建立閱讀路線');
  for (const p of data.sourceParagraphs) {
    const source = article.paragraphs.find(x => x.number === p.number);
    if (!source) throw new Error('找不到原文段落');
    for (const s of p.sentences) if (source.text.slice(s.start, s.end) !== s.text) throw new Error('原文版本與逐句定位不一致');
    add(0, `map-p${p.number}`, 'map', p.title, {paragraph:p.number, note:p.summary});
    for (const s of p.sentences) add(1, s.id, 'sentence', s.title, {paragraph:p.number, sentence:s, note:s.note});
  }
  for (const q of data.questions) {
    if (!article.questions.some(x => x.number === q.number)) throw new Error('找不到原題');
    add(2, `q${q.number}-attempt`, 'attempt', q.title, {question:q.number, note:q.contract});
    for (const u of q.units) {
      for (const e of u.evidence) {
        if (article.paragraphs.find(p => p.number === e.paragraph)?.text.slice(e.start,e.end) !== e.quote) throw new Error('證據定位與原文不一致');
        add(2, e.id, 'evidence', u.title, {question:q.number, unit:u.id, evidence:e, paragraph:e.paragraph});
      }
      add(2, `${u.id}-reason`, 'reason', u.title, {question:q.number, unit:u.id, note:u.why});
      u.traps.forEach((trap,i) => add(2, `${u.id}-trap-${i}`, 'trap', '檢查這個候選答案', {question:q.number, unit:u.id, trap}));
    }
    add(2, `q${q.number}-transfer`, 'transfer', '下次遇到這類題目', {question:q.number, note:q.review});
    for (const page of q.analysisPages) {
      const original = analysis.pages.find(p => p.number === page);
      if (!original || !analysis.questions.find(x=>x.number===q.number)?.pages.includes(page)) throw new Error('解說頁來源不一致');
      add(3, `analysis-${page}`, 'analysis', original.title || `完整解說 p.${page}`, {question:q.number, page});
    }
    for (const u of q.units) {
      add(4, `${u.id}-answer`, 'answer', u.title, {question:q.number, unit:u.id});
      u.evidence.forEach((e,i)=>add(4, `${u.id}-verify-${i}`, 'verify', '帶著答案回到原文', {question:q.number, unit:u.id, evidence:e, paragraph:e.paragraph}));
      add(4, `${u.id}-check`, 'check', '回到自己的答案', {question:q.number, unit:u.id});
    }
  }
  add(4,'finish','finish','把閱讀方法帶到下一篇');
  const ordered = steps.sort((a,b)=>a.stage-b.stage);
  if (new Set(ordered.map(s=>s.id)).size !== ordered.length) throw new Error('教學步驟編號重複');
  return ordered;
}
export function emptyProgress(data) {
  return {version:data.version,articleId:data.articleId,current:'welcome',done:[],bookmarks:[],drafts:{},checks:[],preferences:{spotlight:false,large:false,bilingual:false},updatedAt:null};
}
export function cleanProgress(raw,data,steps) {
  if (!raw || raw.version !== data.version || raw.articleId !== data.articleId) throw new Error('這份進度不屬於目前教材版本，未有取代現有進度。');
  const ids = new Set(steps.map(s=>s.id));
  const filter = values => Array.isArray(values) ? [...new Set(values.filter(x=>typeof x==='string' && ids.has(x)))].slice(0,steps.length) : [];
  const result = emptyProgress(data);
  result.current = ids.has(raw.current) ? raw.current : 'welcome';
  result.done = filter(raw.done); result.bookmarks = filter(raw.bookmarks); result.checks = filter(raw.checks);
  for (const q of data.questions) if (typeof raw.drafts?.[q.number] === 'string') result.drafts[q.number] = raw.drafts[q.number].slice(0,10000);
  result.preferences = {spotlight:raw.preferences?.spotlight===true,large:raw.preferences?.large===true,bilingual:raw.preferences?.bilingual===true};
  result.updatedAt = typeof raw.updatedAt === 'string' ? raw.updatedAt.slice(0,40) : null;
  return result;
}
export function visibleEvidence(data,steps,index) {
  const step=steps[index]; if (!step?.question) return [];
  const q=data.questions.find(q=>q.number===step.question);
  if (step.stage < 2 || step.kind==='attempt') return [];
  if (step.stage>=3) {
    const used=new Set(steps.slice(0,index+1).filter(s=>s.stage===4&&s.question===step.question&&s.kind==='verify').map(s=>s.evidence.id));
    return q.units.flatMap(u=>u.evidence.map(e=>({...e,unit:u.id,used:step.stage===4&&used.has(e.id)})));
  }
  const reached = new Set(steps.slice(0,index+1).filter(s=>s.stage===2 && s.question===step.question && s.evidence).map(s=>s.evidence.id));
  return q.units.flatMap(u=>u.evidence.filter(e=>reached.has(e.id)).map(e=>({...e,unit:u.id,used:false})));
}
export const escapeHtml = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function markedText(text,marks,activeId='') {
  const esc=escapeHtml;
  const safe=marks.filter(m=>Number.isInteger(m.start)&&Number.isInteger(m.end)&&m.start>=0&&m.end<=text.length&&m.end>m.start);
  const points=[...new Set([0,text.length,...safe.flatMap(m=>[m.start,m.end])])].sort((a,b)=>a-b);
  return points.slice(0,-1).map((start,i)=>{
    const end=points[i+1], cover=safe.filter(m=>m.start<=start&&m.end>=end), value=esc(text.slice(start,end));
    if(!cover.length)return value;
    const active=cover.some(m=>m.id===activeId), used=cover.some(m=>m.used), kind=cover.some(m=>m.kind==='reading')?'reading':cover.some(m=>m.kind==='logic')?'logic':cover.some(m=>m.kind==='language')?'language':'evidence';
    return `<mark class="rc-mark rc-${kind}${active?' rc-active':''}${used?' rc-used':''}" data-evidence-ids="${esc(cover.map(m=>m.id).join(' '))}" title="${used?'已用於目前答案':kind==='logic'?'邏輯關係':kind==='language'?'語言線索':'原文證據'}">${value}</mark>`;
  }).join('');
}
