-- Writing Submission: admin-created writing topics with student deep links.
-- Apply after the current Writing Submission schema.
begin;

create table if not exists public.writing_submission_manual_topics (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  prompt text not null,
  flashcard_url text,
  writing_practice_url text,
  model_essay_url text,
  word_list text not null default '',
  created_by uuid not null references public.writing_submission_admin_accounts(id) on delete restrict,
  created_at timestamptz not null default pg_catalog.clock_timestamp(),
  updated_at timestamptz not null default pg_catalog.clock_timestamp(),
  check (pg_catalog.char_length(title) between 1 and 300),
  check (pg_catalog.char_length(prompt) between 1 and 4000),
  check (pg_catalog.char_length(word_list) <= 4000),
  check (flashcard_url is null or flashcard_url ~ '^https://edmundeducation\.com/flashcards\.html(?:\?|$)'),
  check (writing_practice_url is null or writing_practice_url ~ '^https://edmundeducation\.com/writing-practice\.html(?:\?|$)'),
  check (model_essay_url is null or model_essay_url ~ '^https://edmundeducation\.com/(?:model-essay-downloads|writing-practice)\.html(?:\?|$)')
);
alter table public.writing_submission_manual_topics enable row level security;
revoke all on table public.writing_submission_manual_topics from public,anon,authenticated;
create index if not exists writing_submission_manual_topics_created_idx on public.writing_submission_manual_topics(created_at desc,id);
create index if not exists writing_submission_manual_topics_created_by_idx on public.writing_submission_manual_topics(created_by);

create or replace function public._writing_manual_topic_rows()
returns table(id uuid,title text,prompt text,flashcard_url text,writing_practice_url text,model_essay_url text,word_list text,created_at timestamptz,updated_at timestamptz)
language sql stable security definer set search_path=''
as $$ select t.id,t.title,t.prompt,t.flashcard_url,t.writing_practice_url,t.model_essay_url,t.word_list,t.created_at,t.updated_at from public.writing_submission_manual_topics t order by t.created_at desc,t.id $$;

create or replace function public.writing_submission_student_list_manual_topics(p_token uuid)
returns table(id uuid,title text,prompt text,flashcard_url text,writing_practice_url text,model_essay_url text,word_list text,created_at timestamptz,updated_at timestamptz)
language sql stable security definer set search_path=''
as $$
  select t.id,t.title,t.prompt,t.flashcard_url,t.writing_practice_url,t.model_essay_url,t.word_list,t.created_at,t.updated_at
  from public._writing_manual_topic_rows() t
  where exists(select 1 from public.writing_submission_student_profile(p_token) student);
$$;

create or replace function public.writing_submission_admin_list_manual_topics(p_admin_token uuid)
returns table(id uuid,title text,prompt text,flashcard_url text,writing_practice_url text,model_essay_url text,word_list text,created_at timestamptz,updated_at timestamptz)
language sql stable security definer set search_path=''
as $$ select t.* from public._writing_manual_topic_rows() t where public._writing_submission_admin_id(p_admin_token) is not null $$;

create or replace function public.writing_submission_admin_create_manual_topics(p_admin_token uuid,p_titles jsonb)
returns table(id uuid,title text,prompt text,created_at timestamptz,updated_at timestamptz)
language plpgsql security definer set search_path=''
as $$
declare v_admin uuid:=public._writing_submission_admin_id(p_admin_token); v_title text;
begin
  if v_admin is null then raise exception 'Invalid or expired admin session' using errcode='42501'; end if;
  if p_titles is null or pg_catalog.jsonb_typeof(p_titles)<>'array' or pg_catalog.jsonb_array_length(p_titles) not between 1 and 10 then raise exception 'Provide 1 to 10 topic titles' using errcode='22023'; end if;
  if exists(select 1 from pg_catalog.jsonb_array_elements(p_titles) e where pg_catalog.jsonb_typeof(e)<>'string' or pg_catalog.char_length(pg_catalog.btrim(e#>>'{}')) not between 1 and 300 or pg_catalog.btrim(e#>>'{}')~'[[:cntrl:]]') then raise exception 'Invalid topic title' using errcode='22023'; end if;
  return query
  insert into public.writing_submission_manual_topics(title,prompt,created_by)
  select pg_catalog.btrim(e#>>'{}'),pg_catalog.btrim(e#>>'{}'),v_admin from pg_catalog.jsonb_array_elements(p_titles) e
  returning writing_submission_manual_topics.id,writing_submission_manual_topics.title,writing_submission_manual_topics.prompt,writing_submission_manual_topics.created_at,writing_submission_manual_topics.updated_at;
end $$;

create or replace function public.writing_submission_admin_update_manual_topic(
  p_admin_token uuid,p_id uuid,p_title text,p_prompt text,p_flashcard_url text,p_writing_practice_url text,p_model_essay_url text,p_word_list text
)
returns table(id uuid,title text,prompt text,flashcard_url text,writing_practice_url text,model_essay_url text,word_list text,created_at timestamptz,updated_at timestamptz)
language plpgsql security definer set search_path=''
as $$
declare v_admin uuid:=public._writing_submission_admin_id(p_admin_token); v_title text:=pg_catalog.btrim(coalesce(p_title,'')); v_prompt text:=pg_catalog.btrim(coalesce(p_prompt,''));
begin
  if v_admin is null then raise exception 'Invalid or expired admin session' using errcode='42501'; end if;
  if pg_catalog.char_length(v_title) not between 1 and 300 or pg_catalog.char_length(v_prompt) not between 1 and 4000 or pg_catalog.char_length(coalesce(p_word_list,''))>4000 then raise exception 'Invalid manual topic' using errcode='22023'; end if;
  return query update public.writing_submission_manual_topics t set title=v_title,prompt=v_prompt,
    flashcard_url=nullif(pg_catalog.btrim(coalesce(p_flashcard_url,'')),''),writing_practice_url=nullif(pg_catalog.btrim(coalesce(p_writing_practice_url,'')),''),model_essay_url=nullif(pg_catalog.btrim(coalesce(p_model_essay_url,'')),''),word_list=coalesce(p_word_list,''),updated_at=pg_catalog.clock_timestamp()
    where t.id=p_id returning t.*;
  if not found then raise exception 'Manual topic not found' using errcode='P0002'; end if;
end $$;

create or replace function public.writing_submission_admin_delete_manual_topic(p_admin_token uuid,p_id uuid)
returns boolean language plpgsql security definer set search_path=''
as $$ begin
  if public._writing_submission_admin_id(p_admin_token) is null then raise exception 'Invalid or expired admin session' using errcode='42501'; end if;
  delete from public.writing_submission_manual_topics t where t.id=p_id; return found;
end $$;

create or replace function public.schedule_admin_list_manual_writing_resources(p_admin_token uuid)
returns table(id text,type text,label text,url text,detail text)
language sql stable security definer set search_path=''
as $$
  select
    'writing-submission:manual:' || t.id::text,
    'writing-submission'::text,
    t.title,
    'https://edmundeducation.com/writing-submission.html?manualTopic=' || t.id::text,
    '手動創作題目'::text
  from public.writing_submission_manual_topics t
  where public._schedule_admin_id(p_admin_token) is not null
  order by t.updated_at desc,t.id;
$$;

revoke all on function public._writing_manual_topic_rows(),public.writing_submission_student_list_manual_topics(uuid),public.writing_submission_admin_list_manual_topics(uuid),public.writing_submission_admin_create_manual_topics(uuid,jsonb),public.writing_submission_admin_update_manual_topic(uuid,uuid,text,text,text,text,text,text),public.writing_submission_admin_delete_manual_topic(uuid,uuid),public.schedule_admin_list_manual_writing_resources(uuid) from public,anon,authenticated;
grant execute on function public.writing_submission_student_list_manual_topics(uuid),public.writing_submission_admin_list_manual_topics(uuid),public.writing_submission_admin_create_manual_topics(uuid,jsonb),public.writing_submission_admin_update_manual_topic(uuid,uuid,text,text,text,text,text,text),public.writing_submission_admin_delete_manual_topic(uuid,uuid) to service_role;
grant execute on function public.schedule_admin_list_manual_writing_resources(uuid) to authenticated;
notify pgrst,'reload schema';
commit;
