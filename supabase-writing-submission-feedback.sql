-- Writing Submission: durable, versioned teacher feedback.
-- Apply after supabase-writing-submission-drafts-admin.sql.
--
-- Feedback is deliberately stored in two normalized tables: one document
-- header per submission and an ordered set of sentence/comment fragments.
-- The browser has no table access. The private Writing Submission Worker is
-- the only caller of the narrowly scoped service-role RPCs below.

begin;

do $$
begin
  if to_regclass('public.writing_submissions') is null then
    raise exception 'Missing dependency: public.writing_submissions';
  end if;
  if to_regclass('public.writing_submission_admin_accounts') is null then
    raise exception 'Missing dependency: public.writing_submission_admin_accounts';
  end if;
  if to_regprocedure('public._writing_submission_admin_id(uuid)') is null then
    raise exception 'Missing dependency: public._writing_submission_admin_id(uuid)';
  end if;
end;
$$;

create table if not exists public.writing_submission_feedback (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null unique
    references public.writing_submissions(id) on delete cascade,
  student_id uuid not null
    references public.flashcard_students(id) on delete cascade,
  overall_comment text not null default '',
  final_comment text not null default '',
  status text not null default 'draft',
  version integer not null default 1,
  created_by_admin_id uuid
    references public.writing_submission_admin_accounts(id) on delete set null,
  updated_by_admin_id uuid
    references public.writing_submission_admin_accounts(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint writing_submission_feedback_overall_comment_size
    check (char_length(overall_comment) <= 20000 and octet_length(overall_comment) <= 80000),
  constraint writing_submission_feedback_final_comment_size
    check (char_length(final_comment) <= 20000 and octet_length(final_comment) <= 80000),
  constraint writing_submission_feedback_status_valid
    check (status in ('draft', 'published')),
  constraint writing_submission_feedback_version_valid
    check (version between 1 and 2147483647),
  constraint writing_submission_feedback_publication_state
    check (
      (status = 'draft' and published_at is null)
      or (status = 'published' and published_at is not null)
    )
);

create index if not exists writing_submission_feedback_student_history_idx
  on public.writing_submission_feedback (student_id, updated_at desc, id desc);
create index if not exists writing_submission_feedback_created_admin_idx
  on public.writing_submission_feedback (created_by_admin_id)
  where created_by_admin_id is not null;
create index if not exists writing_submission_feedback_updated_admin_idx
  on public.writing_submission_feedback (updated_by_admin_id)
  where updated_by_admin_id is not null;

create table if not exists public.writing_submission_feedback_fragments (
  id uuid primary key default gen_random_uuid(),
  feedback_id uuid not null
    references public.writing_submission_feedback(id) on delete cascade,
  position smallint not null,
  original_fragment text not null default '',
  edmund_comment text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint writing_submission_feedback_fragments_position_valid
    check (position between 1 and 200),
  constraint writing_submission_feedback_fragments_original_size
    check (char_length(original_fragment) <= 10000 and octet_length(original_fragment) <= 40000),
  constraint writing_submission_feedback_fragments_comment_size
    check (char_length(edmund_comment) <= 20000 and octet_length(edmund_comment) <= 80000),
  constraint writing_submission_feedback_fragments_not_empty
    check (char_length(btrim(original_fragment)) > 0 or char_length(btrim(edmund_comment)) > 0),
  unique (feedback_id, position)
);

create index if not exists writing_submission_feedback_fragments_order_idx
  on public.writing_submission_feedback_fragments (feedback_id, position);

create table if not exists public.writing_submission_feedback_audit (
  id bigint generated always as identity primary key,
  feedback_id uuid,
  submission_id uuid not null,
  student_id uuid
    references public.flashcard_students(id) on delete set null,
  admin_id uuid
    references public.writing_submission_admin_accounts(id) on delete set null,
  action text not null,
  feedback_version integer not null,
  created_at timestamptz not null default now(),
  constraint writing_submission_feedback_audit_action_valid
    check (action in ('save_draft', 'publish', 'delete')),
  constraint writing_submission_feedback_audit_version_valid
    check (feedback_version between 1 and 2147483647)
);

create index if not exists writing_submission_feedback_audit_submission_idx
  on public.writing_submission_feedback_audit (submission_id, created_at desc, id desc);
create index if not exists writing_submission_feedback_audit_student_idx
  on public.writing_submission_feedback_audit (student_id, created_at desc, id desc)
  where student_id is not null;
create index if not exists writing_submission_feedback_audit_admin_idx
  on public.writing_submission_feedback_audit (admin_id, created_at desc, id desc)
  where admin_id is not null;

alter table public.writing_submission_feedback enable row level security;
alter table public.writing_submission_feedback_fragments enable row level security;
alter table public.writing_submission_feedback_audit enable row level security;

revoke all on table public.writing_submission_feedback
  from public, anon, authenticated, service_role;
revoke all on table public.writing_submission_feedback_fragments
  from public, anon, authenticated, service_role;
revoke all on table public.writing_submission_feedback_audit
  from public, anon, authenticated, service_role;

create or replace function public._writing_submission_feedback_fragments_valid(
  p_fragments jsonb,
  p_status text
)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_item jsonb;
begin
  if p_status not in ('draft', 'published')
    or p_fragments is null
    or jsonb_typeof(p_fragments) <> 'array'
    or jsonb_array_length(p_fragments) > 200
    or octet_length(p_fragments::text) > 524288
  then
    return false;
  end if;

  for v_item in select value from jsonb_array_elements(p_fragments)
  loop
    if jsonb_typeof(v_item) <> 'object'
      or (select count(*) from jsonb_object_keys(v_item)) <> 2
      or exists (
        select 1
        from jsonb_object_keys(v_item) key_row(key_name)
        where key_name not in ('originalFragment', 'edmundComment')
      )
      or jsonb_typeof(v_item -> 'originalFragment') is distinct from 'string'
      or jsonb_typeof(v_item -> 'edmundComment') is distinct from 'string'
      or char_length(coalesce(v_item ->> 'originalFragment', '')) > 10000
      or octet_length(coalesce(v_item ->> 'originalFragment', '')) > 40000
      or regexp_replace(
        coalesce(v_item ->> 'originalFragment', ''),
        E'[\\n\\r\\t]',
        '',
        'g'
      ) ~ '[[:cntrl:]]'
      or char_length(coalesce(v_item ->> 'edmundComment', '')) > 20000
      or octet_length(coalesce(v_item ->> 'edmundComment', '')) > 80000
      or regexp_replace(
        coalesce(v_item ->> 'edmundComment', ''),
        E'[\\n\\r\\t]',
        '',
        'g'
      ) ~ '[[:cntrl:]]'
      or (
        char_length(btrim(coalesce(v_item ->> 'originalFragment', ''))) = 0
        and char_length(btrim(coalesce(v_item ->> 'edmundComment', ''))) = 0
      )
      or (
        p_status = 'published'
        and (
          char_length(btrim(coalesce(v_item ->> 'originalFragment', ''))) = 0
          or char_length(btrim(coalesce(v_item ->> 'edmundComment', ''))) = 0
        )
      )
    then
      return false;
    end if;
  end loop;

  return true;
end;
$$;

create or replace function public.writing_submission_feedback_student_get(
  p_student_id uuid,
  p_submission_id uuid
)
returns table (
  id uuid,
  submission_id uuid,
  overall_comment text,
  final_comment text,
  status text,
  version integer,
  published_at timestamptz,
  updated_at timestamptz,
  fragments jsonb
)
language sql
stable
security definer
set search_path = ''
as $$
  select feedback.id,
         feedback.submission_id,
         feedback.overall_comment,
         feedback.final_comment,
         feedback.status,
         feedback.version,
         feedback.published_at,
         feedback.updated_at,
         coalesce((
           select jsonb_agg(
             jsonb_build_object(
               'id', fragment.id,
               'position', fragment.position,
               'originalFragment', fragment.original_fragment,
               'edmundComment', fragment.edmund_comment
             ) order by fragment.position
           )
           from public.writing_submission_feedback_fragments fragment
           where fragment.feedback_id = feedback.id
         ), '[]'::jsonb)
  from public.writing_submission_feedback feedback
  join public.writing_submissions submission
    on submission.id = feedback.submission_id
   and submission.student_id = feedback.student_id
  where feedback.submission_id = p_submission_id
    and feedback.student_id = p_student_id
    and feedback.status = 'published'
    and submission.deleted_at is null
  limit 1;
$$;

create or replace function public.writing_submission_feedback_admin_get(
  p_admin_token uuid,
  p_submission_id uuid
)
returns table (
  id uuid,
  submission_id uuid,
  overall_comment text,
  final_comment text,
  status text,
  version integer,
  published_at timestamptz,
  updated_at timestamptz,
  fragments jsonb
)
language sql
stable
security definer
set search_path = ''
as $$
  select feedback.id,
         feedback.submission_id,
         feedback.overall_comment,
         feedback.final_comment,
         feedback.status,
         feedback.version,
         feedback.published_at,
         feedback.updated_at,
         coalesce((
           select jsonb_agg(
             jsonb_build_object(
               'id', fragment.id,
               'position', fragment.position,
               'originalFragment', fragment.original_fragment,
               'edmundComment', fragment.edmund_comment
             ) order by fragment.position
           )
           from public.writing_submission_feedback_fragments fragment
           where fragment.feedback_id = feedback.id
         ), '[]'::jsonb)
  from public.writing_submission_feedback feedback
  where feedback.submission_id = p_submission_id
    and public._writing_submission_admin_id(p_admin_token) is not null
  limit 1;
$$;

-- Remove the pre-concurrency signature during rolling upgrades. This is safe
-- to repeat and prevents PostgREST from exposing an obsolete overload which
-- could save without an expected version.
drop function if exists public.writing_submission_feedback_admin_save(
  uuid, uuid, text, jsonb, text, text
);
drop function if exists public.writing_submission_feedback_admin_save(
  uuid, uuid, text, jsonb, text, text, integer
);

create or replace function public.writing_submission_feedback_admin_save(
  p_admin_token uuid,
  p_submission_id uuid,
  p_overall_comment text,
  p_fragments jsonb,
  p_final_comment text,
  p_status text,
  p_expected_version integer,
  p_expected_feedback_id uuid
)
returns table (
  id uuid,
  submission_id uuid,
  overall_comment text,
  final_comment text,
  status text,
  version integer,
  published_at timestamptz,
  updated_at timestamptz,
  fragments jsonb
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid;
  v_student_id uuid;
  v_feedback_id uuid;
  v_version integer;
begin
  v_admin_id := public._writing_submission_admin_id(p_admin_token);
  if v_admin_id is null then return; end if;

  if p_submission_id is null
    or p_expected_version is null
    or p_expected_version < 0
    or (p_expected_version = 0 and p_expected_feedback_id is not null)
    or (p_expected_version > 0 and p_expected_feedback_id is null)
    or char_length(coalesce(p_overall_comment, '')) > 20000
    or octet_length(coalesce(p_overall_comment, '')) > 80000
    or regexp_replace(coalesce(p_overall_comment, ''), E'[\\n\\r\\t]', '', 'g') ~ '[[:cntrl:]]'
    or char_length(coalesce(p_final_comment, '')) > 20000
    or octet_length(coalesce(p_final_comment, '')) > 80000
    or regexp_replace(coalesce(p_final_comment, ''), E'[\\n\\r\\t]', '', 'g') ~ '[[:cntrl:]]'
    or not public._writing_submission_feedback_fragments_valid(p_fragments, p_status)
    or (
      p_status = 'published'
      and (
        char_length(btrim(coalesce(p_overall_comment, ''))) = 0
        or char_length(btrim(coalesce(p_final_comment, ''))) = 0
        or jsonb_array_length(p_fragments) = 0
      )
    )
    or (
      char_length(btrim(coalesce(p_overall_comment, ''))) = 0
      and char_length(btrim(coalesce(p_final_comment, ''))) = 0
      and jsonb_array_length(p_fragments) = 0
    )
  then
    raise exception 'Invalid writing feedback' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(
    pg_catalog.hashtextextended('writing-submission-feedback:' || p_submission_id::text, 0)
  );

  select submission.student_id into v_student_id
  from public.writing_submissions submission
  where submission.id = p_submission_id
  limit 1
  for update;
  if v_student_id is null then return; end if;

  select feedback.id, feedback.version
  into v_feedback_id, v_version
  from public.writing_submission_feedback feedback
  where feedback.submission_id = p_submission_id
  limit 1
  for update;

  if (
    v_feedback_id is null
    and (p_expected_version <> 0 or p_expected_feedback_id is not null)
  ) or (
    v_feedback_id is not null
    and (
      p_expected_version <> v_version
      or p_expected_feedback_id is distinct from v_feedback_id
    )
  )
  then
    raise exception 'Writing feedback version conflict' using errcode = 'P4090';
  end if;

  insert into public.writing_submission_feedback as feedback (
    submission_id,
    student_id,
    overall_comment,
    final_comment,
    status,
    version,
    created_by_admin_id,
    updated_by_admin_id,
    published_at,
    updated_at
  ) values (
    p_submission_id,
    v_student_id,
    coalesce(p_overall_comment, ''),
    coalesce(p_final_comment, ''),
    p_status,
    1,
    v_admin_id,
    v_admin_id,
    case when p_status = 'published' then clock_timestamp() else null end,
    clock_timestamp()
  )
  on conflict on constraint writing_submission_feedback_submission_id_key do update
  set student_id = excluded.student_id,
      overall_comment = excluded.overall_comment,
      final_comment = excluded.final_comment,
      status = excluded.status,
      version = feedback.version + 1,
      updated_by_admin_id = excluded.updated_by_admin_id,
      published_at = case
        when excluded.status = 'published' then clock_timestamp()
        else null
      end,
      updated_at = clock_timestamp()
  returning feedback.id, feedback.version into v_feedback_id, v_version;

  delete from public.writing_submission_feedback_fragments fragment
  where fragment.feedback_id = v_feedback_id;

  insert into public.writing_submission_feedback_fragments (
    feedback_id, position, original_fragment, edmund_comment
  )
  select v_feedback_id,
         item.ordinality::smallint,
         item.value ->> 'originalFragment',
         item.value ->> 'edmundComment'
  from jsonb_array_elements(p_fragments) with ordinality item(value, ordinality);

  insert into public.writing_submission_feedback_audit (
    feedback_id, submission_id, student_id, admin_id, action, feedback_version
  ) values (
    v_feedback_id,
    p_submission_id,
    v_student_id,
    v_admin_id,
    case when p_status = 'published' then 'publish' else 'save_draft' end,
    v_version
  );

  return query
  select feedback.id,
         feedback.submission_id,
         feedback.overall_comment,
         feedback.final_comment,
         feedback.status,
         feedback.version,
         feedback.published_at,
         feedback.updated_at,
         coalesce((
           select jsonb_agg(
             jsonb_build_object(
               'id', fragment.id,
               'position', fragment.position,
               'originalFragment', fragment.original_fragment,
               'edmundComment', fragment.edmund_comment
             ) order by fragment.position
           )
           from public.writing_submission_feedback_fragments fragment
           where fragment.feedback_id = feedback.id
         ), '[]'::jsonb)
  from public.writing_submission_feedback feedback
  where feedback.id = v_feedback_id;
end;
$$;

-- Remove the pre-concurrency signature during rolling upgrades. Repeating
-- this migration remains safe and no unversioned delete overload survives.
drop function if exists public.writing_submission_feedback_admin_delete(uuid, uuid);
drop function if exists public.writing_submission_feedback_admin_delete(uuid, uuid, integer);

create or replace function public.writing_submission_feedback_admin_delete(
  p_admin_token uuid,
  p_submission_id uuid,
  p_expected_version integer,
  p_expected_feedback_id uuid
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid;
  v_feedback_id uuid;
  v_student_id uuid;
  v_version integer;
  v_deleted integer;
begin
  v_admin_id := public._writing_submission_admin_id(p_admin_token);
  if v_admin_id is null then return 0; end if;
  if p_submission_id is null
    or p_expected_version is null
    or p_expected_version < 1
    or p_expected_feedback_id is null
  then
    raise exception 'Invalid writing feedback deletion' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(
    pg_catalog.hashtextextended('writing-submission-feedback:' || p_submission_id::text, 0)
  );

  select feedback.id, feedback.student_id, feedback.version
  into v_feedback_id, v_student_id, v_version
  from public.writing_submission_feedback feedback
  where feedback.submission_id = p_submission_id
  limit 1
  for update;
  if v_feedback_id is null
    or p_expected_version <> v_version
    or p_expected_feedback_id is distinct from v_feedback_id
  then
    raise exception 'Writing feedback version conflict' using errcode = 'P4090';
  end if;

  delete from public.writing_submission_feedback feedback
  where feedback.id = v_feedback_id;
  get diagnostics v_deleted = row_count;

  if v_deleted = 1 then
    insert into public.writing_submission_feedback_audit (
      feedback_id, submission_id, student_id, admin_id, action, feedback_version
    ) values (
      v_feedback_id, p_submission_id, v_student_id, v_admin_id, 'delete', v_version
    );
  end if;
  return v_deleted;
end;
$$;

revoke all on function public._writing_submission_feedback_fragments_valid(jsonb, text)
  from public, anon, authenticated, service_role;
revoke all on function public.writing_submission_feedback_student_get(uuid, uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.writing_submission_feedback_admin_get(uuid, uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.writing_submission_feedback_admin_save(uuid, uuid, text, jsonb, text, text, integer, uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.writing_submission_feedback_admin_delete(uuid, uuid, integer, uuid)
  from public, anon, authenticated, service_role;

grant execute on function public.writing_submission_feedback_student_get(uuid, uuid)
  to service_role;
grant execute on function public.writing_submission_feedback_admin_get(uuid, uuid)
  to service_role;
grant execute on function public.writing_submission_feedback_admin_save(uuid, uuid, text, jsonb, text, text, integer, uuid)
  to service_role;
grant execute on function public.writing_submission_feedback_admin_delete(uuid, uuid, integer, uuid)
  to service_role;

notify pgrst, 'reload schema';
commit;
