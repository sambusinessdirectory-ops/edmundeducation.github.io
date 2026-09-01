begin;

do $$
begin
  if pg_catalog.to_regclass('public.writing_submission_manual_topics') is null
    or pg_catalog.to_regclass('public.writing_submission_admin_accounts') is null
    or pg_catalog.to_regclass('public.schedule_admin_accounts') is null
    or pg_catalog.to_regprocedure('public._schedule_admin_id(uuid)') is null
  then
    raise exception 'Missing Homework or Writing Submission manual-topic dependency';
  end if;
end
$$;

alter table public.schedule_admin_accounts
  add column if not exists writing_submission_admin_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_catalog.pg_constraint constraint_row
    where constraint_row.conrelid = 'public.schedule_admin_accounts'::pg_catalog.regclass
      and constraint_row.conname = 'schedule_admin_accounts_writing_submission_admin_fk'
  ) then
    alter table public.schedule_admin_accounts
      add constraint schedule_admin_accounts_writing_submission_admin_fk
      foreign key (writing_submission_admin_id)
      references public.writing_submission_admin_accounts(id)
      on delete set null;
  end if;
end
$$;

-- The current installation has one administrator in each system. Establish
-- the initial cross-system identity without hard-coding either generated UUID.
update public.schedule_admin_accounts schedule_admin
set writing_submission_admin_id = (
  select writing_admin.id
  from public.writing_submission_admin_accounts writing_admin
  where writing_admin.is_active
  order by writing_admin.created_at, writing_admin.id
  limit 1
)
where schedule_admin.writing_submission_admin_id is null
  and (select pg_catalog.count(*) from public.schedule_admin_accounts) = 1
  and (select pg_catalog.count(*) from public.writing_submission_admin_accounts writing_admin where writing_admin.is_active) = 1;

create or replace function public.schedule_admin_create_manual_writing_resource(
  p_admin_token uuid,
  p_title text,
  p_prompt text
)
returns table (
  id text,
  type text,
  label text,
  url text,
  detail text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_schedule_admin_id uuid := public._schedule_admin_id(p_admin_token);
  v_writing_admin_id uuid;
  v_topic_id uuid;
  v_title text := pg_catalog.btrim(pg_catalog.coalesce(p_title, ''));
  v_prompt text := pg_catalog.btrim(pg_catalog.coalesce(p_prompt, ''));
begin
  if (select auth.uid()) is null or v_schedule_admin_id is null then
    raise exception 'Invalid or expired admin session' using errcode = '42501';
  end if;
  if pg_catalog.char_length(v_title) not between 1 and 300
    or v_title ~ '[[:cntrl:]]'
    or pg_catalog.char_length(v_prompt) not between 1 and 4000
  then
    raise exception 'Invalid manual writing topic' using errcode = '22023';
  end if;

  select writing_admin.id
  into v_writing_admin_id
  from public.schedule_admin_accounts schedule_admin
  join public.writing_submission_admin_accounts writing_admin
    on writing_admin.id = schedule_admin.writing_submission_admin_id
   and writing_admin.is_active
  where schedule_admin.id = v_schedule_admin_id
  limit 1;

  if v_writing_admin_id is null then
    raise exception 'Schedule admin is not linked to a Writing Submission admin account'
      using errcode = '42501';
  end if;

  insert into public.writing_submission_manual_topics as topic (
    title,
    prompt,
    created_by
  ) values (
    v_title,
    v_prompt,
    v_writing_admin_id
  )
  returning topic.id into v_topic_id;

  return query
  select
    'writing-submission:manual:' || created_topic.id::text,
    'writing-submission'::text,
    created_topic.title,
    'https://edmundeducation.com/writing-submission.html?manualTopic=' || created_topic.id::text,
    '手動創作題目 · 剛剛建立'::text
  from public.writing_submission_manual_topics created_topic
  where created_topic.id = v_topic_id;
end
$$;

revoke all on function public.schedule_admin_create_manual_writing_resource(uuid, text, text)
  from public, anon, authenticated;
grant execute on function public.schedule_admin_create_manual_writing_resource(uuid, text, text)
  to authenticated;

notify pgrst, 'reload schema';
commit;
