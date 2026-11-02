import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../grammar-indefinite-pronouns-data.js', import.meta.url), 'utf8');
const context = {window: {}};
vm.runInNewContext(source, context, {timeout: 5000});
const data = context.window.EDMUND_INDEFINITE_PRONOUNS;
const grammarQuestions = data.exercises;
const proofreadingQuestions = data.passages.flatMap(passage => passage.questions);
const readRows = path => fs.readFileSync(new URL(path, import.meta.url), 'utf8').trimEnd().split('\n').slice(1).map(line => line.split('\t'));
const grammarRows = readRows('../course-materials/grammar/answer-keys/indefinite-pronouns-250.tsv');
const proofreadingRows = readRows('../course-materials/error-identifier/answer-keys/indefinite-pronouns-200.tsv');
const sqlString = value => `'${String(value).replaceAll("'", "''")}'`;
const jsonSql = value => `${sqlString(JSON.stringify(value))}::jsonb`;
function assertCount(rows, count, width) {
  if (rows.length !== count) throw new Error(`Expected ${count} rows, found ${rows.length}`);
  for (const [index, row] of rows.entries()) {
    if (row.length !== width || Number(row[0]) !== index + 1 || row.some(value => value == null)) throw new Error(`Invalid answer row ${index + 1}`);
  }
}
assertCount(grammarRows, 250, 3);
assertCount(proofreadingRows, 200, 5);
const grammarKey = grammarRows.map(([number, answer, explanation], index) => {
  if (!answer || !explanation) throw new Error(`Empty grammar key ${number}`);
  return {number: Number(number), prompt: grammarQuestions[index].prompt, answer, explanation};
});
const proofreadingKey = proofreadingRows.map(([number, mark, wrong, fix, reason], index) => {
  const sentence = proofreadingQuestions[index].sentence;
  if (!reason || !['tick', 'cross'].includes(mark)) throw new Error(`Invalid proofreading key ${number}`);
  if (mark === 'tick' && (wrong || fix)) throw new Error(`Tick has correction ${number}`);
  if (mark === 'cross' && (!wrong || !fix || sentence.split(wrong).length !== 2)) throw new Error(`Correction mismatch ${number}`);
  return {number: Number(number), sentence, mark, wrong, fix,
    correct_sentence: mark === 'tick' ? sentence : sentence.replace(wrong, fix), reason};
});
const header = `-- Individually reviewed reference answers for the student-only indefinite-pronouns sources.\n-- The source files did not supply answer keys. Keep these rows off public site assets.\ncreate table if not exists grammar_admin_private.indefinite_pronouns_key (number integer primary key check (number between 1 and 250), data jsonb not null);\ncreate table if not exists error_identifier_private.indefinite_pronouns_key (number integer primary key check (number between 1 and 200), data jsonb not null);\nrevoke all on grammar_admin_private.indefinite_pronouns_key,error_identifier_private.indefinite_pronouns_key from public,anon,authenticated;\ncreate or replace function grammar_admin_private.indefinite_pronouns_answers(p_token uuid) returns jsonb language plpgsql stable security definer set search_path='' as $function$\nbegin\n if auth.uid() is null or not exists(select 1 from grammar_admin_private.profile(p_token)) then raise exception 'Admin session expired' using errcode='42501'; end if;\n return coalesce((select jsonb_agg(data order by number) from grammar_admin_private.indefinite_pronouns_key),'[]'::jsonb);\nend $function$;\ncreate or replace function public.grammar_admin_indefinite_pronouns_answers(p_token uuid) returns jsonb language sql stable security invoker set search_path='' as $function$ select grammar_admin_private.indefinite_pronouns_answers(p_token) $function$;\nrevoke all on function grammar_admin_private.indefinite_pronouns_answers(uuid),public.grammar_admin_indefinite_pronouns_answers(uuid) from public,anon;\ngrant execute on function grammar_admin_private.indefinite_pronouns_answers(uuid),public.grammar_admin_indefinite_pronouns_answers(uuid) to authenticated;\ncreate or replace function error_identifier_private.error_identifier_admin_answers(p_token uuid,p_logout boolean default false) returns jsonb language plpgsql security definer set search_path='' as $function$\nbegin\n if auth.uid() is null or not exists(select 1 from public.error_identifier_admin_sessions where token=p_token and auth_id=auth.uid() and expires_at>now()) then raise exception 'Admin session expired' using errcode='42501'; end if;\n if p_logout then delete from public.error_identifier_admin_sessions where token=p_token; return '{}'::jsonb; end if;\n return jsonb_build_object('single',(select jsonb_agg(to_jsonb(k) order by question_no) from public.error_identifier_answer_key k),'passages',(select jsonb_agg(to_jsonb(k) order by passage_id,line_no) from public.error_identifier_passage_answer_key k),'jayden',(select jsonb_agg(data order by number) from public.error_identifier_jayden_key),'indefinite',(select jsonb_agg(data order by number) from error_identifier_private.indefinite_pronouns_key));\nend $function$;\nrevoke all on function error_identifier_private.error_identifier_admin_answers(uuid,boolean) from public,anon;\ngrant execute on function error_identifier_private.error_identifier_admin_answers(uuid,boolean) to authenticated;\n`;
const grammarSql = grammarKey.map(row => `insert into grammar_admin_private.indefinite_pronouns_key(number,data) values (${row.number},${jsonSql(row)}) on conflict(number) do update set data=excluded.data;`).join('\n');
const proofSql = proofreadingKey.map(row => `insert into error_identifier_private.indefinite_pronouns_key(number,data) values (${row.number},${jsonSql(row)}) on conflict(number) do update set data=excluded.data;`).join('\n');
const target = new URL('../supabase/migrations/20261102090000_indefinite_pronouns_admin_answer_keys.sql', import.meta.url);
fs.writeFileSync(target, `${header}\n${grammarSql}\n${proofSql}\n`);
console.log(`Generated ${grammarKey.length} grammar and ${proofreadingKey.length} proofreading reference answers.`);
