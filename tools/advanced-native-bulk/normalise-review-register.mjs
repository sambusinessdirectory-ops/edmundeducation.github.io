// Translate explicit saved independent verdicts; this performs no new review.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const positive=new Set(['editorial-passed','AI-independent-editorial-pass','independent-AI-editorial-pass','passed-independent-AI-editorial-review']);
export function normalisedVerdicts(filename,report){
 if(!/^independent-/.test(filename))return [];
 let rows=Array.isArray(report.lessons)?report.lessons:Array.isArray(report.records)?report.records:[];
 if(!rows.length&&positive.has(report.state)&&report.recordHashes&&typeof report.recordHashes==='object'){
  rows=Object.entries(report.recordHashes).map(([id,hash])=>({id,canonicalContentSha256:hash,state:report.state}));
 }
 return rows.flatMap(row=>{
  const states=[row.state,row.status,row.assessment].filter(Boolean);
  if(!states.some(s=>positive.has(s))||states.some(s=>/pending|requires|revision|repair|draft|unreviewed/i.test(s)))return [];
  if((row.findings||[]).some(f=>(f.severity==='required'||f.priority==='required')&&!f.resolved))return [];
  const id=row.lessonId||row.moduleId||row.id,hash=row.reviewedRecordSha256||row.canonicalContentSha256||row.contentSha256||row.hash;
  if(!/^advanced-native-\d+$/.test(id||'')||! /^[a-f0-9]{64}$/.test(hash||''))return [];
  return [{lessonId:id,canonicalContentSha256:hash,assessment:'no_blocking_editorial_issue_found_in_AI_review',sourceReport:filename,originalVerdict:states,scope:'Translation of an explicit existing independent verdict only. Original exact hash retained; current-revision matching remains required by progress.mjs.'}];
 });
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const root=path.resolve(process.argv[2]||'work/advanced-native-full-20261016'),directory=path.join(root,'reviews');
 const lessons=fs.readdirSync(directory).filter(f=>/^independent-.*\.json$/.test(f)).sort().flatMap(file=>normalisedVerdicts(file,JSON.parse(fs.readFileSync(path.join(directory,file),'utf8'))));
 const result={type:'existing-independent-review-verdict-normalisation',scope:'No content was reviewed or approved by this translator. Original independent reports and hashes remain authoritative. No human/media/device approval claimed.',lessons};
 fs.writeFileSync(path.join(directory,'normalised-independent-review-register.json'),JSON.stringify(result,null,2)+'\n');
 console.log(`${lessons.length} existing independent verdict rows normalised with original exact hashes.`);
}
