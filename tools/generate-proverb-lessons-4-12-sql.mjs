import fs from 'node:fs';
const source=fs.readFileSync(new URL('../supabase-proverb-system-lessons-2-3.sql',import.meta.url),'utf8');
const old="'proverb-01', 'proverb-02', 'proverb-03'";
const newer=Array.from({length:12},(_,i)=>`'proverb-${String(i+1).padStart(2,'0')}'`).join(', ');
const legacyPattern="'-q(0[1-9]|[1-4][0-9]|50)$'";
const newPattern="'-q(0[1-9]|1[0-2])$'";
let sql=source
 .replace('Expand the existing Proverb System from lesson 1 to lessons 1–3.','Expand the existing Proverb System from lessons 1–3 to lessons 1–12.')
 .replaceAll('proverb-system-lessons-2-3','proverb-system-lessons-4-12')
 .replaceAll(old,newer)
 .replaceAll('153','270')
 .replace("v_question_pattern := '^' || p_lesson_id || "+legacyPattern+";",
  ()=>`v_question_pattern := '^' || p_lesson_id || case when p_lesson_id in (${old}) then ${legacyPattern} else ${newPattern} end;`)
 .replace("p_total_count <> 50",`((p_lesson_id in (${old}) and p_total_count <> 50) or (p_lesson_id not in (${old}) and p_total_count <> 12))`);
// The bookmark validator and row constraint must both retain each lesson's true range.
sql=sql.replaceAll("'^' || coalesce(v_item ->> 'lessonId', '') || "+legacyPattern,
  ()=>"'^' || coalesce(v_item ->> 'lessonId', '') || case when coalesce(v_item ->> 'lessonId', '') in ("+old+") then "+legacyPattern+" else "+newPattern+" end");
sql=sql.replace("question_id ~ ('^' || lesson_id || "+legacyPattern+")",
  ()=>"question_id ~ ('^' || lesson_id || case when lesson_id in ("+old+") then "+legacyPattern+" else "+newPattern+" end)");
const anchor="alter table public.proverb_system_bookmarks\n  drop constraint if exists proverb_system_bookmarks_lesson_id_check;";
const countConstraint=`alter table public.proverb_system_attempts\n  drop constraint if exists proverb_system_attempts_total_count_check;\nalter table public.proverb_system_attempts\n  add constraint proverb_system_attempts_total_count_check\n  check (total_count = case when lesson_id in (${old}) then 50 else 12 end) not valid;\nalter table public.proverb_system_attempts\n  validate constraint proverb_system_attempts_total_count_check;\n\n`;
if(!sql.includes(anchor)||!sql.includes('else '+newPattern)||!sql.includes('p_total_count <> 12'))throw Error('SQL transformation incomplete');
sql=sql.replace(anchor,countConstraint+anchor);
const target=new URL('../supabase-proverb-system-lessons-4-12.sql',import.meta.url);
if(process.argv.includes('--check')){if(fs.readFileSync(target,'utf8')!==sql)throw Error('Stale SQL migration');}else fs.writeFileSync(target,sql);
console.log('Generated 1–12 Proverb database expansion.');
