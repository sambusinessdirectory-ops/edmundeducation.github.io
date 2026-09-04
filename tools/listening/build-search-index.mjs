import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const context={window:{}};
const load=file=>vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),context);
const clean=text=>String(text||'').replace(/<[^>]*>/g,' ').replace(/\{\{[^}]*\}\}/g,' ')
 .replace(/&(amp|lt|gt|quot|#39|nbsp);/g,(_,x)=>({amp:'&',lt:'<',gt:'>',quot:'"','#39':"'",nbsp:' '})[x])
 .replace(/\s+/g,' ').trim();
// Index learner-facing text only, never answer keys, storage paths or timing metadata.
function copy(value){
 if(typeof value==='string')return clean(value);
 if(Array.isArray(value))return value.map(copy).filter(Boolean).join(' ');
 if(!value||typeof value!=='object')return '';
 return Object.entries(value).filter(([key])=>!['answer','answers','alternatives','source','sourcePages','src','image','href','url','timings','analysis','key','id','type','number','numbers','page','start','end'].includes(key))
  .map(([,item])=>copy(item)).filter(Boolean).join(' ');
}
load('listening-system-catalog.js');
const result={dse:[],ielts:[]};
for(const {year,available} of context.window.EDMUND_LISTENING_CATALOG.dseYears){
 if(!available)continue;
 load(`dse-listening-${year}-transcript.js`);load(`dse-listening-${year}-data.js`);
 const content=context.window[`EDMUND_DSE_LISTENING_${year}`];
 for(const task of content.tasks)result.dse.push({id:`dse-${year}-${task.number}`,section:'dse',year,part:task.number,title:task.title,
  text:clean([task.instruction,copy(task.blocks),copy(year===2021 ? JSON.parse(fs.readFileSync(path.join(root,'assets/dse-listening/2021/guide.json'),'utf8')).transcript[task.number] : content.transcript.partA[task.number])].join(' '))});
}
load('listening-practice-1-data.js');load('listening-practice-1-transcript.js');
for(const {practice} of context.window.EDMUND_LISTENING_CATALOG.practices){
 const content=practice===1?{...context.window.EDMUND_IELTS_LISTENING_PRACTICE_1,transcript:context.window.EDMUND_IELTS_LISTENING_PRACTICE_1_TRANSCRIPT}
  :JSON.parse(fs.readFileSync(path.join(root,`assets/listening/practices/practice-${practice}.json`),'utf8'));
 for(const part of content.parts)result.ielts.push({id:`ielts-${practice}-${part.part}`,section:'ielts',practice,part:part.part,
  title:part.title||part.heading||`Listening Practice ${practice}`,
  text:clean([copy(part),copy(content.transcript[part.part])].join(' '))});
}
for(const section of ['dse','ielts']){
 const file=path.join(root,`assets/listening/search/${section}.json`);
 const output=JSON.stringify({version:1,entries:result[section]})+'\n';
 if(process.argv.includes('--check')){
  if(fs.readFileSync(file,'utf8')!==output)throw Error(`Stale ${section} listening search index; run this script to rebuild.`);
 }else{fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,output);}
 console.log(`${section}: ${result[section].length} parts, ${Math.round(Buffer.byteLength(output)/1024)} KB text index`);
}
