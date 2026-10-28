// Regenerate the trusted question ID catalogue when trophy-bearing modules change.
// Run from the repository root: node tools/build-trophy-catalogue.mjs > /tmp/trophy-catalogue.sql
// Apply the reviewed SQL through the normal database migration process.
import fs from 'node:fs';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
const ctx={window:{}};vm.createContext(ctx);
for(const file of ['idiom-system-data.js','idiom-first-five-curation.js','idiom-compass-06-30-curation.js','idiom-compass-06-30-bonus.js','idiom-compass-31-curation.js','idiom-compass-32-108-curation.js','idiom-compass-109-138-curation.js','phrasal-verb-system-data.js','proverb-system-data.js','common-expression-system-data.js','common-expression-system-imported-data.js']) vm.runInContext(fs.readFileSync(file,'utf8'),ctx);
const rows=[];
function add(system,lessons){for(const l of lessons){const ids=l.questions.map(q=>String(q.id));if(!ids.length||new Set(ids).size!==ids.length)throw Error('Invalid question IDs: '+l.id);rows.push({system,lesson:l.id,ids});}}
const manifest=JSON.parse(execFileSync('git',['show','HEAD:assets/sentence-structure/library/manifest.json'],{maxBuffer:20_000_000}));
add('sentence-structure',manifest.lessons.filter(l=>l.questionRefs.length===50).map(l=>({...l,questions:l.questionRefs.map(([id])=>({id}))})));
for(const [system,key] of [['idioms','EDMUND_IDIOM_SYSTEM_DATA'],['proverbs','EDMUND_PROVERB_SYSTEM_DATA'],['phrasal-verbs','EDMUND_PHRASAL_VERB_SYSTEM_DATA']])add(system,ctx.window[key].lessons);
for(const [k,v] of Object.entries(ctx.window.EDMUND_COMMON_EXPRESSION_DATA.systems))add('common-expression-'+k,v.lessons);
for(let i=0;i<rows.length;i+=70){const json=JSON.stringify(rows.slice(i,i+70));if(json.includes('$catalog$'))throw Error('Invalid SQL delimiter in catalogue');console.log(`insert into eddie_farm.trophy_catalogue(system_key,lesson_id,question_ids) select x.system,x.lesson,array(select jsonb_array_elements_text(x.ids)) from jsonb_to_recordset($catalog$${json}$catalog$::jsonb) x(system text,lesson text,ids jsonb) on conflict(system_key,lesson_id) do update set question_ids=excluded.question_ids;`);}
