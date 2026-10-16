#!/usr/bin/env node
// Generate assessment data for review. Applying a migration is a separate step.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {compileRecord,validateCatalogue} from './schema.mjs';
const literal=value=>`'${String(value).replaceAll("'","''")}'`;
export function backendArtifacts(records){
 const checked=validateCatalogue(records);if(checked.errors.length)throw Error(JSON.stringify(checked.errors));
 const modules=records.map(compileRecord);
 const rows=modules.map(module=>{
  const questions=Object.fromEntries(module.questions.map(q=>[q.id,{type:q.type,answers:q.answers,options:q.options||[]} ]));
  return `(${literal(module.id)}, '["phrase"]'::jsonb, ${literal(JSON.stringify(questions))}::jsonb)`;
 });
 if(!rows.length)throw Error('Refusing to generate an empty catalogue import.');
 const sql=`-- Generated from validated canonical records by tools/advanced-native-bulk/backend.mjs.\n-- Adds assessment definitions; preserves unrelated modules and historical question keys.\ninsert into natural_english_private.catalogue(module,senses,questions) values\n${rows.join(',\n')}\non conflict (module) do update set senses=excluded.senses,questions=natural_english_private.catalogue.questions || excluded.questions;\n`;
 const ids=modules.map(m=>literal(m.id)).join(',');
 const verify=`select module, (select count(*) from jsonb_object_keys(questions)) as assessed_questions, jsonb_array_length(questions->(module||'-v2-reply')->'answers') as accepted_replies from natural_english_private.catalogue where module in (${ids}) order by module;\n`;
 return {sql,verify,summary:{modules:modules.length,questions:modules.length*6,ids:modules.map(m=>m.id),applied:false}};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2),index=args.indexOf('--out-dir');
 if(index<1||!args[index+1])throw Error('Usage: backend.mjs INPUT.json [...] --out-dir OUTPUT');
 const records=args.slice(0,index).flatMap(file=>{const d=JSON.parse(fs.readFileSync(file));return Array.isArray(d)?d:d.lessons;});
 const result=backendArtifacts(records),output=args[index+1];fs.mkdirSync(output,{recursive:true});
 fs.writeFileSync(path.join(output,'assessment-catalogue.sql'),result.sql);fs.writeFileSync(path.join(output,'assessment-verify.sql'),result.verify);fs.writeFileSync(path.join(output,'assessment-summary.json'),JSON.stringify(result.summary,null,2)+'\n');
 console.log(`${result.summary.modules} compatible server definitions prepared; database application pending.`);
}
