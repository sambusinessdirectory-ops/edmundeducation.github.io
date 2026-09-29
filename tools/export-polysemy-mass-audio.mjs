// Export source-order sentences for the established four Polysemy voice recipes.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import massIndex from '../polysemy-lab/mass-index.mjs';
import {modules} from '../polysemy-lab/catalogue.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=process.argv[2]||'/private/tmp/polysemy-mass-audio';
fs.mkdirSync(output,{recursive:true});
const cycle=['american-female','american-male','british-male','british-female'];
const local=Array.from({length:4},()=>[]),cloud=[],all=[];
for(const indexed of massIndex){
 const module=(await import(`../polysemy-lab/content/${encodeURIComponent(indexed.id)}.mjs`)).default;
 if(module.id!==indexed.id||module.questions.length!==indexed.questions.length)throw Error(`Index mismatch: ${indexed.id}`);
 for(const question of module.questions){
  const index=question.sentenceIndex;
  if(!Number.isInteger(index)||index<0)throw Error(`Missing source order: ${question.id}`);
  const voice=cycle[index%cycle.length];
  const row={id:question.id,en:question.en,index,voice,module:module.id};
  all.push(row);
  if(voice==='american-male')cloud.push(row);
  else local[module.number%local.length].push(row);
 }
}
const save=(file,rows)=>fs.writeFileSync(path.join(output,file),JSON.stringify(rows)+'\n');
save('all.json',all);save('cloud.json',cloud);
local.forEach((rows,index)=>save(`local-${index}.json`,rows));
const earlyAudio=Object.assign({},...['audio.json','audio-new.json'].map(file=>JSON.parse(fs.readFileSync(path.join(root,'polysemy-lab',file)))));
const olderPending=[];
for(const module of modules.filter(module=>!module.mass)){
 for(const question of module.questions){
  if(earlyAudio[question.id])continue;
  const index=question.sentenceIndex;
  if(!Number.isInteger(index)||cycle[index%cycle.length]!=='american-male')throw Error(`Unexpected older voice gap: ${question.id}`);
  olderPending.push({id:question.id,en:question.en,index,voice:'american-male',module:module.id});
 }
}
const massAudio=JSON.parse(fs.readFileSync(path.join(root,'polysemy-lab','audio-mass.json')));
const massCloudPending=cloud.filter(row=>!massAudio[row.id]);
save('cloud-pending.json',[...olderPending,...massCloudPending]);
console.log(JSON.stringify({questions:all.length,local:local.map(rows=>rows.length),cloud:cloud.length,olderCloudPending:olderPending.length,massCloudPending:massCloudPending.length,output}));
