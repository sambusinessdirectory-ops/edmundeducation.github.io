import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=path.join(root,'polysemy-lab/content');
const destination=path.join(root,'supabase/migrations');
const files=(await fs.readdir(source)).filter(name=>name.endsWith('.mjs')).sort();
const updates=[];

for(const file of files){
 const module=(await import(pathToFileURL(path.join(source,file)).href)).default;
 if(!module.questions?.some(question=>question.correctOption))continue;
 const senses=module.senses.map(sense=>sense.id);
 const indexes=new Map(senses.map((id,index)=>[id,index]));
 const answers={};
 const options={};
 for(const question of module.questions){
  const answer=indexes.get(question.correctOption||question.sense);
  if(answer===undefined)throw Error(`${module.id}/${question.id}: missing correct meaning`);
  const choices=question.options.map(id=>indexes.get(id));
  if(choices.some(index=>index===undefined)||!choices.includes(answer))throw Error(`${module.id}/${question.id}: invalid choices`);
  if(options[answer]&&JSON.stringify(options[answer])!==JSON.stringify(choices))throw Error(`${module.id}/${question.id}: inconsistent choices`);
  answers[question.id]=answer;
  options[answer]=choices;
 }
 const data=JSON.stringify({senses,answers,options}).replaceAll("'","''");
 updates.push(`update polysemy_private.catalogue set mcq='${data}'::jsonb where module='${module.id.replaceAll("'","''")}';`);
}

const chunkSize=20;
for(let start=0;start<updates.length;start+=chunkSize){
 const part=String(Math.floor(start/chunkSize)+1).padStart(2,'0');
 const file=`202610022310${part}_polysemy_mcq_catalogue_${part}.sql`;
 const sql=`-- Exact current MCQ choices. Legacy catalogue columns stay intact for open older tabs.\n${updates.slice(start,start+chunkSize).join('\n')}\n`;
 await fs.writeFile(path.join(destination,file),sql);
}
console.log(JSON.stringify({modules:updates.length,chunks:Math.ceil(updates.length/chunkSize)}));
