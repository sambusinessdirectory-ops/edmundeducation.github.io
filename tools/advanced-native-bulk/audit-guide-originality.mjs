#!/usr/bin/env node
// Flag learner-facing English that repeats long stretches of any source example.
// This is a review queue, not an automatic plagiarism or publication verdict.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const folder=path.join(root,'course-materials/advanced-native');
const manifest=JSON.parse(fs.readFileSync(path.join(folder,'drafts-books10-16/batch-manifest.json')));
const source=fs.readFileSync(path.join(folder,'books10-16/source-inventory.jsonl'),'utf8').trim().split(/\r?\n/).map(JSON.parse);
const words=s=>String(s??'').toLowerCase().replace(/[’‘]/g,"'").match(/[\p{L}\p{N}]+(?:'[\p{L}\p{N}]+)?/gu)??[];
const gram=(a,i)=>a.slice(i,i+6).join(' ');
const index=new Map();
for(let n=0;n<source.length;n++){
 const tokens=words(source[n].example); source[n]._tokens=tokens;
 for(let i=0;i+6<=tokens.length;i++){const key=gram(tokens,i);if(!index.has(key))index.set(key,[]);index.get(key).push([n,i]);}
}
const lessons=manifest.batchFiles.flatMap(name=>JSON.parse(fs.readFileSync(path.join(folder,'drafts-books10-16',name))).lessons);
const fields=l=>{
 const out=[];const add=(field,value)=>{if(typeof value==='string'&&value.trim())out.push({field,text:value});};
 add('listening.en',l.listening?.en);
 for(const [section,part] of [['listening',l.listening],['reply',l.reply],['scene',l.scene],['contrast',l.contrast],['dialogue',l.dialogue]]){
  add(`${section}.promptEn`,part?.promptEn);
  for(const [i,v] of (part?.options??[]).entries())add(`${section}.options[${i}].en`,v.en);
 }
 add('speaking.en',l.speaking?.en);
 for(const [i,v] of (l.takeaways??[]).entries())add(`takeaways[${i}].en`,v.en);
 for(const [i,v] of (l.writing?.examples??[]).entries())add(`writing.examples[${i}].en`,v.en);
 return out;
};
const hits=[];
for(const l of lessons)for(const field of fields(l)){
 const textTokens=words(field.text), best=new Map();
 for(let i=0;i+6<=textTokens.length;i++)for(const [n,j] of index.get(gram(textTokens,i))??[]){
  let startText=i,startSource=j,endText=i+6,endSource=j+6;
  while(startText&&startSource&&textTokens[startText-1]===source[n]._tokens[startSource-1]){startText--;startSource--;}
  while(endText<textTokens.length&&endSource<source[n]._tokens.length&&textTokens[endText]===source[n]._tokens[endSource]){endText++;endSource++;}
  const length=endText-startText;const prev=best.get(n);
  if(!prev||length>prev.length)best.set(n,{length,startText,startSource,endText,endSource});
 }
 for(const [n,match] of best){
  const s=source[n];const targetTokens=words(s.expression);const sourceCoverage=match.length/s._tokens.length;
  const excessTokens=match.length-targetTokens.length;
  const severity=field.text.trim().toLowerCase()===s.example.trim().toLowerCase()?'exact':
    (excessTokens>=4&&sourceCoverage>=.7?'high':excessTokens>=3&&match.length>=8?'medium':'target-or-short-overlap');
  hits.push({lesson:l.number,field:field.field,sourceId:s.sourceId,sourceExpression:s.expression,
   sourceExample:s.example,learnerText:field.text,sharedText:textTokens.slice(match.startText,match.endText).join(' '),
   sharedTokens:match.length,targetTokens:targetTokens.length,excessTokens,sourceCoverage:Number(sourceCoverage.toFixed(3)),severity});
 }
}
hits.sort((a,b)=>({exact:3,high:2,medium:1,'target-or-short-overlap':0}[b.severity]-{exact:3,high:2,medium:1,'target-or-short-overlap':0}[a.severity])||b.excessTokens-a.excessTokens||b.sharedTokens-a.sharedTokens||a.lesson-b.lesson);
const counts=Object.fromEntries(['exact','high','medium','target-or-short-overlap'].map(k=>[k,hits.filter(h=>h.severity===k).length]));
const report={status:'mechanical-review-queue-not-editorial-approval',selectedLessons:lessons.length,sourceExamples:source.length,learnerFacingStrings:lessons.reduce((n,l)=>n+fields(l).length,0),counts,hits};
const output=process.argv[2];if(output)fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({selectedLessons:report.selectedLessons,sourceExamples:report.sourceExamples,learnerFacingStrings:report.learnerFacingStrings,counts,output:output??null}));
