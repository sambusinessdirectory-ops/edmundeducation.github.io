#!/usr/bin/env node
// Deliberately stricter than the draft tests. Do not deploy a partial course.
import fs from 'node:fs';
import {plan} from './plan-native-english-redesign.mjs';
import {editorialIssues} from './test-native-editorial-quality.mjs';
import {moduleMap} from '../natural-english/catalogue.mjs';

const rows=plan().rows;
const missing=rows.filter(row=>row.status!=='draft-needs-editorial-review');
const unlinked=rows.filter(row=>{
  const module=moduleMap.get(row.id);
  return !module?.questions.length||module.questions.some(question=>!question.id.startsWith(`${row.id}-v2-`));
});
const migrations=fs.readdirSync(new URL('../supabase/migrations/',import.meta.url))
  .filter(name=>/native_english_redesign/.test(name)&&name.endsWith('.sql'));
const serverReady=migrations.some(name=>{
  const sql=fs.readFileSync(new URL('../supabase/migrations/'+name,import.meta.url),'utf8');
  return sql.includes("q->>'type'='open'")&&sql.includes('natural_english_private.sync_modules');
});

if(missing.length||unlinked.length||!serverReady||editorialIssues.length){
  console.error(`BLOCKED Native English release: ${missing.length} approved lessons still need authored drafts; ${unlinked.length} are not linked to v2 content; ${editorialIssues.length} editorial quality findings; ${serverReady?'open writing server support ready':'open writing server support missing'}.`);
  process.exitCode=1;
}else console.log(`PASS Native English release gate: ${rows.length} approved redesigned lessons linked with open-writing server support.`);
