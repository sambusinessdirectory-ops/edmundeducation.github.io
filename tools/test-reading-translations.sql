-- Temporary fixtures only. The entire test is rolled back.
begin;
do $$
declare v_student uuid := gen_random_uuid(); v_token uuid := gen_random_uuid(); v_content jsonb;
begin
  if has_table_privilege('anon','public.reading_comprehension_translations','SELECT')
    or has_table_privilege('authenticated','public.reading_comprehension_translations','SELECT')
    or has_table_privilege('authenticated','public.reading_comprehension_translations','UPDATE') then
    raise exception 'Direct translation access unexpectedly granted';
  end if;
  if has_function_privilege('anon','public.reading_comprehension_article_translation(uuid,text)','EXECUTE') then
    raise exception 'Anonymous translation RPC access';
  end if;
  perform set_config('request.jwt.claim.sub','',true);
  perform set_config('request.jwt.claims','{}',true);
  begin
    perform public.reading_comprehension_article_translation(v_token,'p1-001');
    raise exception 'Unauthenticated request accepted';
  exception when insufficient_privilege then null; end;
  perform set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
  begin
    perform public.reading_comprehension_article_translation(v_token,'p1-001');
    raise exception 'Invalid student token accepted';
  exception when insufficient_privilege then null; end;
  insert into public.flashcard_students(id,name,password_hash)
    values(v_student,'__reading_translation_qa_'||v_student::text,'test-fixture-not-a-password');
  insert into public.flashcard_student_sessions(token,student_id) values(v_token,v_student);
  perform set_config('reading_translation_test.token',v_token::text,true);
end;
$$;
set local role authenticated;
do $$
declare v_token uuid := current_setting('reading_translation_test.token')::uuid; v_content jsonb;
begin
  v_content := public.reading_comprehension_article_translation(v_token,'p1-001');
  if v_content->>'articleId' is distinct from 'p1-001'
    or jsonb_array_length(v_content->'paragraphs') is distinct from 9
    or v_content->'paragraphs'->0->>'translation' is null then
    raise exception 'Translation RPC round trip failed';
  end if;
  if public.reading_comprehension_article_translation(v_token,'p1-008') is not null then
    raise exception 'Held article returned';
  end if;
end;
$$;
reset role;
rollback;
select article_id, jsonb_array_length(content->'paragraphs') as paragraphs, published
from public.reading_comprehension_translations order by article_id;
