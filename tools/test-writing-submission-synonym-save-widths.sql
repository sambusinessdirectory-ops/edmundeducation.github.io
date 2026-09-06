begin;
do $$
declare a uuid; s uuid:=gen_random_uuid(); d uuid:=gen_random_uuid(); t uuid:=gen_random_uuid(); r record; old_id uuid; old_version integer; rejected boolean:=false;
parts jsonb := '[{"originalSentence":{"text":"good","formatting":[]},"enhancement":{"text":"excellent","formatting":[]},"benefit":{"text":"precise","formatting":[]},"columnWidths":[34,33,33]}]';
begin
select id into a from public.writing_submission_admin_accounts where is_active limit 1;
insert into public.flashcard_students(id,name,password_hash) values(s,'__writing_save_qa_'||s::text,'test-fixture-not-a-password');
insert into public.writing_submissions(id,student_id,topic,answer,word_count) values(d,s,'Save regression test','Test writing.',2);
insert into public.writing_submission_admin_sessions(token_hash,admin_id,expires_at) values(extensions.digest(t::text,'sha256'),a,now()+interval '1 minute');
select * into r from public.writing_submission_feedback_admin_save_v5(t,d,'Test comment','[]','[]','','[]','','[]','[]','[]','[]','[]','[]','[]','[]','[]',parts,'draft',0,null);
if r.id is null or r.synonym_improvement_parts is distinct from parts or r.overall_comment is distinct from 'Test comment' then raise exception 'Create failed'; end if;
old_id:=r.id; old_version:=r.version;
select * into r from public.writing_submission_feedback_admin_save_v5(t,d,'Updated comment','[]','[]','','[]','','[]','[]','[]','[]','[]','[]','[]','[]','[]',parts,'draft',old_version,old_id);
if r.id is distinct from old_id or r.version<=old_version or r.synonym_improvement_parts is distinct from parts or r.overall_comment is distinct from 'Updated comment' then raise exception 'Update failed'; end if;
begin
perform * from public.writing_submission_feedback_admin_save_v5(t,d,'Stale comment','[]','[]','','[]','','[]','[]','[]','[]','[]','[]','[]','[]','[]',parts,'draft',old_version,old_id);
exception when sqlstate 'P4090' then rejected:=true;
end;
if not rejected then raise exception 'Concurrency protection failed'; end if;
rejected:=false;
begin
perform * from public.writing_submission_feedback_admin_save_v5(t,d,'Invalid widths','[]','[]','','[]','','[]','[]','[]','[]','[]','[]','[]','[]','[]',jsonb_set(parts,'{0,columnWidths}','[10,45,45]'),'draft',r.version,r.id);
exception when sqlstate '22023' then rejected:=true;
end;
if not rejected then raise exception 'Invalid widths accepted'; end if;
select * into r from public.writing_submission_feedback_admin_save_v5(t,d,'','[]','[]','','[]','','[]','[]','[]','[]','[]','[]','[]','[]','[]',parts,'draft',r.version,r.id);
if r.overall_comment is distinct from '' or r.synonym_improvement_parts is distinct from parts then raise exception 'Synonym-only save failed'; end if;
end $$;
rollback;
select 'PASS: create, update, widths preserved, stale-write protection, invalid widths rejected, synonym-only draft. All fixtures rolled back.' as result;
