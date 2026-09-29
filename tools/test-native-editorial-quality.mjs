#!/usr/bin/env node
// Editorial safeguards supplement structural validation; they never write lessons.
import {plan} from './plan-native-english-redesign.mjs';

const issues=[];
const drafts=await Promise.all(plan().rows.filter(row=>row.status==='draft-needs-editorial-review').map(async row=>({
  row,draft:(await import(new URL(`../natural-english/lesson-${String(row.number).padStart(3,'0')}.mjs`,import.meta.url))).default
})));
const boilerplate=new Map();
for(const {row,draft} of drafts){
  const id=row.id;
  const audio=draft.steps.findIndex(step=>step.style==='audio');
  const final=draft.steps.findIndex(step=>step.style==='final');
  if(audio>1)issues.push(`${id}: concealed listening appears after answer-bearing steps`);
  if(final>=0&&final!==draft.steps.length-1)issues.push(`${id}: final challenge is not last`);
  const explanations=new Map(),optionSets=new Map();
  for(const q of draft.questions){
    const explanation=String(q.explanation||'').trim();
    if(explanation.length<22)issues.push(`${id}: ${q.id} has non-specific feedback`);
    if(explanations.has(explanation))issues.push(`${id}: ${q.id} repeats ${explanations.get(explanation)} feedback`);
    else explanations.set(explanation,q.id);
    if(q.type==='mc'){
      const key=JSON.stringify([...q.options].sort());
      if(optionSets.has(key))issues.push(`${id}: ${q.id} recycles ${optionSets.get(key)} choices`);
      else optionSets.set(key,q.id);
    }
    if(q.type==='open'&&/兩句|一兩句|two sentences/i.test(q.prompt)){
      const complete=q.answers.filter(answer=>String(answer).length>=38&&/[.!?;。！？；].*[.!?。！？]/.test(answer));
      if(!complete.length)issues.push(`${id}: ${q.id} asks for two sentences but offers no complete two-part example`);
    }
  }
  for(const step of draft.steps){
    for(const text of [step.title,step.intro]){
      if(!text||/先自己說；錄音或跳過後才聽示範。|先口說；錄音或跳過後再聽示範。/.test(text))continue;
      const key=text.trim();
      if(!boilerplate.has(key))boilerplate.set(key,[]);
      boilerplate.get(key).push(id);
    }
  }
}
for(const [text,ids] of boilerplate){
  if(ids.length>=7)issues.push(`repeated step copy in ${ids.length} lessons: ${JSON.stringify(text)} (${ids.slice(0,4).join(', ')}...)`);
}
export const editorialIssues=issues;
if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href&&issues.length){
  console.error(`BLOCKED: ${issues.length} editorial quality issues across ${drafts.length} drafts.`);
  for(const issue of issues.slice(0,30))console.error(' - '+issue);
  if(issues.length>30)console.error(` - …${issues.length-30} more`);
  process.exitCode=1;
}else if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href)console.log(`PASS: ${drafts.length} editorial drafts avoid recycled answer sets, repeated feedback, placeholder final examples, and answer-first sequencing.`);
