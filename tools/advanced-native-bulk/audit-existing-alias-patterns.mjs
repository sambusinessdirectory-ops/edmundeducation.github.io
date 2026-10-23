#!/usr/bin/env node
// Read-only editorial audit: an alias is not proven covered merely by sharing a meaning.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {targetPatterns as displayTargetPatterns} from '../../natural-english/advanced-display.mjs';

const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const base=path.join(repo,'course-materials/advanced-native');
const sourceDir=path.join(base,'books10-16');
const readJson=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const readJsonl=file=>fs.readFileSync(file,'utf8').split(/\r?\n/).filter(Boolean).map((line,index)=>{
 try{return JSON.parse(line);}catch(error){throw new Error(`${file}:${index+1}: ${error.message}`);}
});

export function auditAliasPatterns({decisions,sources,lessons,legacyTargetPatterns={}}){
 const bySource=new Map(sources.map(row=>[row.sourceId,row]));
 const byLesson=new Map(lessons.map(row=>[row.id,row]));
 const aliases=decisions.filter(row=>row.action==='proposed-alias-existing')
  .sort((a,b)=>a.sourceOrdinal-b.sourceOrdinal);
 const exceptions=[];
 for(const decision of aliases){
  const source=bySource.get(decision.sourceId);
  const lesson=byLesson.get(decision.canonicalId);
  const sourceExample=source?.example??null;
  const targetRegex=lesson?.target?.pattern??legacyTargetPatterns[decision.canonicalId]??null;
  let reason=null;
  if(!source)reason='source-not-found';
  else if(typeof sourceExample!=='string'||!sourceExample)reason='source-example-unavailable';
  else if(!lesson&&!targetRegex)reason='canonical-lesson-not-found';
  else if(typeof targetRegex!=='string'||!targetRegex)reason='canonical-target-regex-unavailable';
  else{
   try{
    // Use the display renderer's flags so this audit accepts the same reviewed
    // legacy patterns (including escaped hyphens) that learners actually see.
    if(!new RegExp(targetRegex,'gi').test(sourceExample))reason='source-example-does-not-match';
   }catch{reason='invalid-canonical-target-regex';}
  }
  if(reason)exceptions.push({sourceOrdinal:decision.sourceOrdinal,phrase:decision.phrase,
   canonicalId:decision.canonicalId,sourceExample,targetRegex,reason});
 }
 return {selectedAliasDecisions:aliases.length,matchingAliases:aliases.length-exceptions.length,
  exceptionCount:exceptions.length,exceptions};
}

function argsToDecisionFiles(args){
 const files=[];
 let allDiscovered=false;
 for(let i=0;i<args.length;i++){
  if(args[i]==='--decision-file'){
   const name=args[++i];
   if(!name||name.startsWith('--'))throw new Error('--decision-file requires a filename');
   files.push(path.isAbsolute(name)?name:path.join(sourceDir,name));
  }else if(args[i]==='--all-discovered'){
   allDiscovered=true;
  }else if(args[i]==='--help'){
   process.stdout.write('Usage: node tools/advanced-native-bulk/audit-existing-alias-patterns.mjs [--decision-file editorial-decisions-START-END.jsonl ... | --all-discovered]\nBy default, audits only files selected in editorial-decision-manifest.json. JSON goes to stdout; source files are never changed.\n');
   return null;
  }else throw new Error(`Unknown option: ${args[i]}`);
 }
 if(files.length&&allDiscovered)throw new Error('--decision-file and --all-discovered cannot be combined');
 if(files.length)return files;
 if(!allDiscovered){
  const manifest=readJson(path.join(sourceDir,'editorial-decision-manifest.json'));
  if(!Array.isArray(manifest.decisionFiles))throw new Error('Editorial decision manifest has no decisionFiles array');
  return manifest.decisionFiles.map(name=>path.join(sourceDir,name));
 }
 return fs.readdirSync(sourceDir)
  .filter(name=>/^editorial-decisions-\d+-\d+\.jsonl$/.test(name))
  .sort((a,b)=>Number(a.match(/\d+/)[0])-Number(b.match(/\d+/)[0]))
  .map(name=>path.join(sourceDir,name));
}

export function runAudit(args=process.argv.slice(2)){
 const decisionFiles=argsToDecisionFiles(args);
 if(decisionFiles===null)return null;
 const decisions=decisionFiles.flatMap(readJsonl);
 const sources=readJsonl(path.join(sourceDir,'source-inventory.jsonl'));
 const release=readJson(path.join(base,'release-index.json'));
 const lessons=release.canonicalInputFiles.flatMap(name=>{
  const contents=readJson(path.join(base,name));
  return Array.isArray(contents)?contents:contents.lessons;
 });
 // The original ten lessons predate canonical JSON batches; their reviewed
 // target regexes are maintained in the live display module.
 const legacyTargetPatterns=Object.fromEntries(Array.from({length:10},(_,index)=>{
  const id=`advanced-native-${String(index+1).padStart(3,'0')}`;
  return [id,displayTargetPatterns[id]];
 }));
 const result=auditAliasPatterns({decisions,sources,lessons,legacyTargetPatterns});
 return {selectedDecisionFiles:decisionFiles.map(name=>path.basename(name)),
  selectedDecisionRows:decisions.length,...result};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  const report=runAudit();
  if(report)process.stdout.write(`${JSON.stringify(report)}\n`);
 }catch(error){console.error(error.message);process.exitCode=1;}
}
