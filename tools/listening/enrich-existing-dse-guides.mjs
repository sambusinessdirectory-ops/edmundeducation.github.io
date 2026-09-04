import fs from 'node:fs';
import assert from 'node:assert/strict';
import {questions2021,evidence2021} from './2021-guide-support.mjs';
import {locateGuideEvidence} from './guide-cue.mjs';
const root=new URL('../../',import.meta.url);
for(const year of [2021,2023]){
 const file=new URL(`assets/dse-listening/${year}/guide.json`,root);
 const guide=JSON.parse(fs.readFileSync(file,'utf8'));
 if(year===2021)guide.questions=questions2021;
 for(const [number,row]of Object.entries(guide.analysis)){
  if(year===2021)row.evidence=evidence2021[number];
  Object.assign(row,locateGuideEvidence(guide.transcript[row.task],row.evidence));
 }
 const output=JSON.stringify(guide,null,2)+'\n';
 if(process.argv.includes('--check'))assert.equal(fs.readFileSync(file,'utf8'),output);
 else fs.writeFileSync(file,output);
 console.log(`${year}: ${Object.keys(guide.analysis).length} replay cues, four question translations`);
}
