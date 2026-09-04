-- Synthetic fixtures and session claims are rolled back after verification.
begin;
do $$
declare v_student uuid := gen_random_uuid(); v_token uuid := gen_random_uuid();
begin
  if has_table_privilege('anon','public.dse_reading_translations','SELECT')
    or has_table_privilege('authenticated','public.dse_reading_translations','SELECT')
    or has_table_privilege('authenticated','public.dse_reading_translations','UPDATE') then
    raise exception 'Direct DSE translation access unexpectedly granted';
  end if;
  if not (select relrowsecurity from pg_class where oid='public.dse_reading_translations'::regclass) then
    raise exception 'DSE translation RLS is disabled';
  end if;
  if has_function_privilege('anon','public.dse_reading_article_translation(uuid,text)','EXECUTE') then
    raise exception 'Anonymous DSE translation RPC access';
  end if;
  perform set_config('request.jwt.claim.sub','',true);
  perform set_config('request.jwt.claims','{}',true);
  begin
    perform public.dse_reading_article_translation(v_token,'dse-2026-a');
    raise exception 'Unauthenticated request accepted';
  exception when insufficient_privilege then null; end;
  perform set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
  begin
    perform public.dse_reading_article_translation(v_token,'dse-2026-a');
    raise exception 'Invalid student token accepted';
  exception when insufficient_privilege then null; end;
  insert into public.flashcard_students(id,name,password_hash)
    values(v_student,'__dse_translation_qa_'||v_student::text,'test-fixture-not-a-password');
  insert into public.flashcard_student_sessions(token,student_id) values(v_token,v_student);
  perform set_config('dse_translation_test.token',v_token::text,true);
  perform set_config('dse_translation_test.ids',(select jsonb_agg(article_id)::text from public.dse_reading_translations where published),true);
end;
$$;
set local role authenticated;
do $$
declare v_token uuid := current_setting('dse_translation_test.token')::uuid; v_content jsonb; v_id text;
begin
  for v_id in select jsonb_array_elements_text(current_setting('dse_translation_test.ids')::jsonb) loop
    v_content := public.dse_reading_article_translation(v_token,v_id);
    if v_content->>'articleId' is distinct from v_id
      or v_content->>'locale' is distinct from 'zh-Hant'
      or jsonb_array_length(v_content->'entries') < 1 then
      raise exception 'DSE translation RPC round trip failed for %', v_id;
    end if;
  end loop;
  if public.dse_reading_article_translation(v_token,'dse-2024-a') is not null
    or public.dse_reading_article_translation(v_token,'p1-008') is not null then
    raise exception 'Unavailable or unrelated article returned';
  end if;
end;
$$;
reset role;
rollback;
select count(*) as published_sections,
  sum(jsonb_array_length(content->'entries')) as translated_fields
from public.dse_reading_translations where published;
