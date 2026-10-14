import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import lessons from '../natural-english/advanced-expressions.mjs';

const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const sqlText=value=>`'${String(value).replaceAll("'","''")}'`;
const rows=lessons.map(lesson=>{
  const questions=Object.fromEntries(lesson.questions.map(q=>[q.id,{type:q.type,answers:q.answers,options:q.options||[]}]));
  return `(${sqlText(lesson.id)}, '${JSON.stringify(['phrase'])}'::jsonb, ${sqlText(JSON.stringify(questions))}::jsonb)`;
});
const sql=`-- Advanced Native course: five new, independent expression modules.\n-- Generated from natural-english/advanced-expressions.mjs by tools/build-advanced-native-catalogue.mjs.\ninsert into natural_english_private.catalogue(module,senses,questions) values\n${rows.join(',\n')}\non conflict (module) do update set senses=excluded.senses,questions=excluded.questions;\n`;
const output=path.join(root,'supabase/migrations/20261014194500_advanced_native_expressions.sql');
fs.mkdirSync(path.dirname(output),{recursive:true});
if(process.argv.includes('--check')){
  if(!fs.existsSync(output)||fs.readFileSync(output,'utf8')!==sql)throw Error('Advanced Native SQL catalogue is stale');
  console.log('Advanced Native SQL catalogue is current');
}else{
  fs.writeFileSync(output,sql);
  console.log(output);
}
