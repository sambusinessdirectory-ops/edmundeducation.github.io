import {readFileSync} from 'node:fs';
import {reconstructions} from './reconstructions.mjs';
const catalogue=JSON.parse(readFileSync(new URL('../ielts-writing-preview/task1-diagrams.json',import.meta.url),'utf8'));
const missing=catalogue.filter(question=>question.id!=='T1-005'&&!reconstructions[question.id]).map(question=>question.id);
if(missing.length)throw new Error(`Missing interactive questions: ${missing.join(', ')}`);
const expected=new Set(catalogue.map(question=>question.id).filter(id=>id!=='T1-005'));
for(const [id,lesson] of Object.entries(reconstructions)){
 if(!expected.has(id))throw new Error(`Unexpected question: ${id}`);
 const panels=lesson.panels||[lesson];
 for(const panel of panels){
  const kind=panel.kind||lesson.kind;
  if(kind==='bar'||kind==='line'){
   const categories=panel.categories||lesson.categories,series=panel.series||lesson.series;
   if(!categories?.length||!series?.length)throw new Error(`${id}: missing ${kind} series`);
   const min=panel.min??lesson.min??0,max=panel.max??lesson.max;
   for(const item of series){
    if(item.values.length!==categories.length)throw new Error(`${id}: ${item.name} has ${item.values.length} values, expected ${categories.length}`);
    if(item.values.some(value=>!Number.isFinite(value)||value<min||value>max))throw new Error(`${id}: ${item.name} has an out-of-range value`);
   }
  }else if(kind==='pie'){
   const categories=panel.categories||lesson.categories;
   if(categories?.length!==panel.values?.length)throw new Error(`${id}: pie labels mismatch`);
   if(Math.abs(panel.values.reduce((a,b)=>a+b,0)-100)>0.01)throw new Error(`${id}: pie does not total 100%`);
  }else if(kind==='table'){
   if(!panel.columns?.length||!panel.rows?.length||panel.rows.some(row=>row.length!==panel.columns.length))throw new Error(`${id}: table shape mismatch`);
  }else if(kind==='process'){
   if(!(panel.stages||lesson.stages)?.length)throw new Error(`${id}: process has no stages`);
  }else if(kind==='map'){
   if(!panel.features?.length)throw new Error(`${id}: map has no selectable features`);
  }else throw new Error(`${id}: unknown kind ${kind}`);
 }
}
console.log(`Validated ${catalogue.length} Task 1 questions: ${expected.size} reconstructions and T1-005.`);
