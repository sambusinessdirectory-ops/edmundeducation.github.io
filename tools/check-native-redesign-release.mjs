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
const openMigration=new URL('../supabase/migrations/20260929043000_natural_english_open_review.sql',import.meta.url);
const catalogueMigration=new URL('../supabase/migrations/20260929050000_native_english_redesign_catalogue.sql',import.meta.url);
const bundle=new URL('../natural-english/editorial-lessons.mjs',import.meta.url);
const openReady=fs.existsSync(openMigration)&&fs.readFileSync(openMigration,'utf8').includes("q->>'type'='open'");
const catalogueSql=fs.existsSync(catalogueMigration)?fs.readFileSync(catalogueMigration,'utf8'):'';
const catalogueReady=!!catalogueSql&&rows.every(row=>catalogueSql.includes(`where module='${row.id}'`));
const bundleReady=fs.existsSync(bundle);

if(missing.length||unlinked.length||!openReady||!catalogueReady||!bundleReady||editorialIssues.length){
  console.error(`BLOCKED Native English release: ${missing.length} approved lessons still need authored drafts; ${unlinked.length} are not linked to v2 content; ${editorialIssues.length} editorial quality findings; ${openReady?'open writing server support ready':'open writing server support missing'}; ${catalogueReady?'v2 catalogue ready':'v2 catalogue missing'}; ${bundleReady?'browser bundle ready':'browser bundle missing'}.`);
  process.exitCode=1;
}else console.log(`PASS Native English release gate: ${rows.length} approved redesigned lessons linked with open-writing server support.`);
