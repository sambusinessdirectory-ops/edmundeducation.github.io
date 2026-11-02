import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {grammarModules,exportSections} from '../grammar-admin-export.mjs';

const scope={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../grammar-indefinite-pronouns-data.js',import.meta.url),'utf8'),scope);
const source=scope.window.EDMUND_INDEFINITE_PRONOUNS;
const rows=file=>fs.readFileSync(new URL(file,import.meta.url),'utf8').trimEnd().split('\n').slice(1).map(line=>line.split('\t'));
const grammar=rows('../course-materials/grammar/answer-keys/indefinite-pronouns-250.tsv');
const proofreading=rows('../course-materials/error-identifier/answer-keys/indefinite-pronouns-200.tsv');
assert.equal(grammar.length,250);
assert.equal(proofreading.length,200);
for(const [index,row] of grammar.entries()){
  assert.equal(Number(row[0]),index+1);assert.equal(row.length,3);assert(row[1]);assert(row[2]);
}
const sentences=source.passages.flatMap(passage=>passage.questions.map(question=>question.sentence));
for(const [index,row] of proofreading.entries()){
  assert.equal(Number(row[0]),index+1);assert.equal(row.length,5);assert(['tick','cross'].includes(row[1]));assert(row[4]);
  if(row[1]==='cross'){assert(row[2]&&row[3]);assert.equal(sentences[index].split(row[2]).length,2,`Q${index+1} single exact correction`);assert.notEqual(sentences[index].replace(row[2],row[3]),sentences[index]);}
  else assert(!row[2]&&!row[3]);
}
const modules=grammarModules(scope.window);
const module=modules.find(value=>value.id==='indefinite-pronouns');
assert(module);assert.equal(module.questions.length,250);
module.questions=module.questions.map((question,index)=>({...question,answer:grammar[index][1],explanation:grammar[index][2]}));
const sections=exportSections(module,'exercises');
assert.equal(sections.length,250);
for(const [index,section] of sections.entries()){
  assert(section.body.includes(grammar[index][1]),`Q${index+1} reference answer`);
  assert(section.body.includes(grammar[index][2]),`Q${index+1} explanation`);
}
const migration=fs.readFileSync(new URL('../supabase/migrations/20261102090000_indefinite_pronouns_admin_answer_keys.sql',import.meta.url),'utf8');
assert.equal((migration.match(/insert into grammar_admin_private\.indefinite_pronouns_key/g)||[]).length,250);
assert.equal((migration.match(/insert into error_identifier_private\.indefinite_pronouns_key/g)||[]).length,200);
assert(migration.includes('auth.uid() is null'));
assert(migration.includes('grammar_admin_private.profile(p_token)'));
assert(migration.includes('auth_id=auth.uid()'));
assert(!fs.readFileSync(new URL('../grammar-indefinite-pronouns-data.js',import.meta.url),'utf8').includes('Someone 指未指名的人；left 的過去時間'));
console.log('PASS: 250 grammar reference answers and 200 proofreading decisions/corrections; all exports, protected RPC checks and public-data separation.');
