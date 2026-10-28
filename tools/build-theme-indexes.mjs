import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {THEMES,classifyThemes} from './theme-taxonomy.mjs';
const read=f=>JSON.parse(fs.readFileSync(f,'utf8'));
const context={window:{}};
for(const file of ['dse-speaking-data.js','dse-speaking-paper-supplement.js','dse-speaking-translations.js','speaking-system-data.js','speaking-system-part1-data.js','speaking-system-part3-data.js'])vm.runInNewContext(fs.readFileSync(file,'utf8'),context);
const s=context.window;
const overrides=fs.existsSync('tools/theme-overrides.json')?read('tools/theme-overrides.json'):{};
const audit=[];const used=new Set();
const contexts=Object.fromEntries(fs.readFileSync('tools/dse-speaking-theme-contexts.txt','utf8').trim().split('\n').map(line=>{const [key,labels]=line.trim().split(/\s+/);return [key,labels.split(',')]}));
function add(collection,row,title,focus,body=''){
 const key=collection+':'+row.id;
 const result=classifyThemes(title,focus,body);
 const override=overrides[key]||overrides[collection+':title:'+row.title];
 if(overrides[key])used.add(key);
 if(overrides[collection+':title:'+row.title])used.add(collection+':title:'+row.title);
 const base=collection==='dse-speaking'?contexts[row.year+':'+row.set]:collection==='ielts-speaking'?override:null;
 if(collection==='dse-speaking'&&!base)throw Error('Missing set context '+row.id);
 row.themes=base?[...new Set([...base,...classifyThemes('',focus).signals.filter(x=>x.score>=6).map(x=>x.id)])].slice(0,4):override||result.themes;
 audit.push({collection,id:row.id,title:row.title,themes:row.themes,override:!!override,lowConfidence:result.lowConfidence,signals:result.signals,sourceCharacters:(title+focus+body).length,sourceHash:crypto.createHash('sha256').update(title+'\n'+focus+'\n'+body).digest('hex')});
 return row;
}
function write(collection,rows,unit,extra={}){
 if(new Set(rows.map(r=>r.id)).size!==rows.length)throw Error('Duplicate ids '+collection);
 const taxonomy=THEMES.map(({id,en,zh,aliases})=>({id,en,zh,aliases,count:rows.filter(r=>r.themes.includes(id)).length}));
 const data={version:'20261028-themes1',collection,unit,total:rows.length,...extra,themes:taxonomy,rows};
 fs.writeFileSync(collection+'-themes.json',JSON.stringify(data));
 console.log(collection,rows.length,'unclassified',rows.filter(r=>!r.themes.length).length);
}
const sets=[...s.EDMUND_DSE_SPEAKING_DATA.sets,...s.EDMUND_DSE_SPEAKING_SUPPLEMENT.sets];
const dse=sets.flatMap(set=>['group','individual'].flatMap(section=>{
 const key=section==='group'?'groupDiscussion':'individualResponse';
 return set[key].map((text,i)=>add('dse-speaking',{id:`${set.year}:${set.set}:${section}:${i+1}`,title:set.title,text,translation:s.EDMUND_DSE_SPEAKING_TRANSLATIONS[`${set.year}:${set.set}`]?.[key]?.[i]||'',year:set.year,set:set.set,section,number:i+1,href:`speaking-system.html?view=dse-question&paper=${set.year}-${set.set}&part=${section}&question=${i+1}`},set.title,text,set.sourceText||''));
}));
write('dse-speaking',dse,'questions',{setCount:sets.length});
const ielts=[];
for(const part of [1,2,3]){
 const data=part===1?s.EDMUND_SPEAKING_PART1_DATA:part===2?s.EDMUND_SPEAKING_DATA:s.EDMUND_SPEAKING_PART3_DATA;
 for(const book of data.books)for(const e of book.exercises){
  if(part===1){for(const q of e.questions)ielts.push(add('ielts-speaking',{id:e.id+':q'+q.number,exerciseId:e.id,title:e.title,text:q.questionEn,translation:q.questionZh,part,book:book.book,exerciseIndex:e.index,number:q.number,section:'Part 1',href:`speaking-system.html?exercise=${e.id}&question=${q.number}#part1-question-${String(q.number).padStart(2,'0')}`},e.title,q.questionEn));}
  else {const text=part===2?e.cue.promptEn:e.question.english;const title=part===2?e.title:e.categoryTitle;ielts.push(add('ielts-speaking',{id:e.id,exerciseId:e.id,title,text,translation:part===2?e.cue.promptZh:e.question.chinese,part,book:book.book,exerciseIndex:e.index,section:`Part ${part}`,href:`speaking-system.html?exercise=${e.id}`},title,text,part===2?e.cue.hints.map(h=>h.en).join(' '):''));}
 }
}
write('ielts-speaking',ielts,'questions');
for(const kind of ['dse','ielts']){
 const collection=kind+'-reading';
 const entries=kind==='ielts'?read('reading-comprehension-catalogue.json').articles:read('dse-reading-catalogue.json').years.flatMap(y=>Object.entries(y.sections).map(([section,p])=>({...p,year:y.year,section})));
 const rows=entries.map(e=>{
  const file=(kind==='ielts'?'reading-comprehension-data/':'dse-reading-data/')+e.id+'.json';
  const d=read(file);const body=d.paragraphs.map(p=>p.text||'').join('\n');
  if(!body.trim())throw Error('Missing full text '+file);
  const prompts=(d.questions||[]).map(q=>q.prompt||'').join('\n');
  return add(collection,{id:e.id,title:e.title,text:body.slice(0,220).replace(/\s+/g,' ')+'…',section:kind==='ielts'?`Passage ${e.passage}`:e.section,year:e.year,passage:e.passage,practice:e.practice,questionCount:d.questions.length,href:`reading-comprehension.html?article=${encodeURIComponent(e.id)}${kind==='ielts'?'&passage='+e.passage:''}`},e.title,d.paragraphs.slice(0,2).map(p=>p.text).join(' '),body+'\n'+prompts);
 });
 write(collection,rows,kind==='ielts'?'passages':'papers');
}
fs.mkdirSync('course-materials/theme-finder',{recursive:true});
fs.writeFileSync('course-materials/theme-finder/classification-audit.json',JSON.stringify({version:'20261028-themes1',rows:audit},null,2));
fs.writeFileSync('course-materials/theme-finder/review.tsv',audit.map(r=>[r.collection,r.id,r.title,r.themes.join(',')].join('\t')).join('\n')+'\n');
const unknown=Object.keys(overrides).filter(k=>!used.has(k));if(unknown.length)console.log('Unused title aliases:',unknown.join(','));
console.log('Needs review:',audit.filter(r=>!r.themes.length).map(r=>`${r.collection}\t${r.id}\t${r.title}`).join('\n'));
