-- Common Expression systems: account-scoped lesson progress and bookmarks.
--
-- The browser signs in to Supabase Auth anonymously only to obtain the
-- `authenticated` database role.  That Auth identity is not the student
-- identity.  Every public RPC below derives the active student exclusively
-- from the existing, unguessable Flashcard session UUID supplied as p_token.
-- The underlying tables have RLS enabled, no permissive policies, and no
-- Data API grants.

begin;

do $$
begin
  if pg_catalog.to_regclass('public.flashcard_students') is null then
    raise exception 'Missing dependency: public.flashcard_students';
  end if;

  if pg_catalog.to_regprocedure(
    'public.flashcard_session_student_id(uuid)'
  ) is null then
    raise exception
      'Missing dependency: public.flashcard_session_student_id(uuid)';
  end if;
end;
$$;

-- Keep the accepted catalogue closed.  A caller cannot manufacture another
-- portal namespace and use these tables as arbitrary JSON storage.
create or replace function public._common_expression_system_key_valid(
  p_system_key text
)
returns boolean
language sql
immutable
parallel safe
set search_path = ''
as $$
  select coalesce(
    p_system_key in (
      'speaking',
      'written',
      'rhetorical-speaking',
      'rhetorical-writing',
      'professional-message',
      'business-speaking'
    ),
    false
  );
$$;

create or replace function public._common_expression_lesson_id_valid(
  p_lesson_id text
)
returns boolean
language sql
immutable
parallel safe
set search_path = ''
as $$
  -- 01..9999; zero and non-canonical forms are rejected.
  select coalesce(
    p_lesson_id ~ '^common-expression-(0[1-9]|[1-9][0-9]{1,3})$',
    false
  );
$$;

-- Return a parsed instant only for a complete RFC 3339 timestamp. Explicit
-- offsets are accepted in addition to Z, so imports such as +00:00 work.
create or replace function public._common_expression_rfc3339_timestamp(
  p_value text
)
returns timestamptz
language plpgsql
stable
parallel safe
set search_path = ''
as $$
declare
  v_timestamp_pattern constant text :=
    '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]{1,9})?(Z|[+-][0-9]{2}:[0-9]{2})$';
begin
  if p_value is null
    or p_value !~ v_timestamp_pattern
  then
    return null;
  end if;

  begin
    return p_value::timestamptz;
  exception
    when others then
      return null;
  end;
end;
$$;

-- Validate the complete browser snapshot before it reaches storage.  The
-- checks deliberately mirror the bounded client model while remaining
-- flexible enough for future reviewed Common Expression lessons.
create or replace function public._common_expression_state_valid(
  p_lesson_id text,
  p_state jsonb,
  p_duration_ms bigint
)
returns boolean
language plpgsql
stable
parallel safe
set search_path = ''
as $$
declare
  v_lesson_number text;
  v_duration_text text;
  v_answer_count integer;
  v_question_id text;
  v_answer jsonb;
  v_attempts_text text;
begin
  if not public._common_expression_lesson_id_valid(p_lesson_id)
    or p_duration_ms is null
    or p_duration_ms < 0
    -- More than 365 aggregate days in one lesson is outside the product
    -- model and is treated as malformed input.
    or p_duration_ms > 31536000000
    or p_state is null
    or pg_catalog.jsonb_typeof(p_state) <> 'object'
    or pg_catalog.octet_length(p_state::text) > 131072
  then
    return false;
  end if;

  -- No unrecognised top-level payloads are accepted.
  if exists (
    select 1
    from pg_catalog.jsonb_object_keys(p_state) as item(key)
    where item.key not in (
      'lessonId',
      'answers',
      'durationMs',
      'completedAt',
      'updatedAt'
    )
  ) then
    return false;
  end if;

  if not (p_state ? 'lessonId')
    or not (p_state ? 'answers')
    or not (p_state ? 'durationMs')
    or not (p_state ? 'completedAt')
    or not (p_state ? 'updatedAt')
    or pg_catalog.jsonb_typeof(p_state -> 'lessonId') <> 'string'
    or p_state ->> 'lessonId' <> p_lesson_id
    or pg_catalog.jsonb_typeof(p_state -> 'answers') <> 'object'
    or pg_catalog.jsonb_typeof(p_state -> 'durationMs') <> 'number'
    or pg_catalog.jsonb_typeof(p_state -> 'completedAt') <> 'string'
    or pg_catalog.char_length(p_state ->> 'completedAt') > 64
    or pg_catalog.jsonb_typeof(p_state -> 'updatedAt') <> 'string'
    or pg_catalog.char_length(p_state ->> 'updatedAt') > 64
  then
    return false;
  end if;

  select count(*)::integer
  into v_answer_count
  from pg_catalog.jsonb_object_keys(p_state -> 'answers');

  if v_answer_count > 100 then
    return false;
  end if;

  v_duration_text := p_state ->> 'durationMs';
  if v_duration_text !~ '^[0-9]+$'
    or v_duration_text::numeric <> p_duration_ms::numeric
  then
    return false;
  end if;

  if (p_state ->> 'completedAt') <> ''
    and public._common_expression_rfc3339_timestamp(
      p_state ->> 'completedAt'
    ) is null
  then
    return false;
  end if;

  if (p_state ->> 'updatedAt') <> ''
    and public._common_expression_rfc3339_timestamp(
      p_state ->> 'updatedAt'
    ) is null
  then
    return false;
  end if;

  v_lesson_number := pg_catalog.substring(
    p_lesson_id,
    '^common-expression-([0-9]{2,4})$'
  );

  for v_question_id, v_answer in
    select item.key, item.value
    from pg_catalog.jsonb_each(p_state -> 'answers') as item(key, value)
  loop
    -- The question prefix must match the numeric component of its lesson.
    if v_question_id !~ (
      '^ce' || v_lesson_number || '-q(0[1-9]|[1-9][0-9]{1,2})$'
    )
      or pg_catalog.jsonb_typeof(v_answer) <> 'object'
      or pg_catalog.octet_length(v_answer::text) > 8192
    then
      return false;
    end if;

    if exists (
      select 1
      from pg_catalog.jsonb_object_keys(v_answer) as item(key)
      where item.key not in (
        'answer',
        'checkedAnswer',
        'correct',
        'attempts',
        'updatedAt'
      )
    ) then
      return false;
    end if;

    if not (v_answer ? 'answer')
      or not (v_answer ? 'correct')
      or not (v_answer ? 'attempts')
      or not (v_answer ? 'updatedAt')
      or pg_catalog.jsonb_typeof(v_answer -> 'answer') <> 'string'
      or pg_catalog.char_length(v_answer ->> 'answer') > 6000
      or (
        v_answer ? 'checkedAnswer'
        and (
          pg_catalog.jsonb_typeof(v_answer -> 'checkedAnswer') <> 'string'
          or pg_catalog.char_length(v_answer ->> 'checkedAnswer') > 6000
        )
      )
      or pg_catalog.jsonb_typeof(v_answer -> 'correct') <> 'boolean'
      or pg_catalog.jsonb_typeof(v_answer -> 'attempts') <> 'number'
      or pg_catalog.jsonb_typeof(v_answer -> 'updatedAt') <> 'string'
      or pg_catalog.char_length(v_answer ->> 'updatedAt') > 64
    then
      return false;
    end if;

    v_attempts_text := v_answer ->> 'attempts';
    if v_attempts_text !~ '^[0-9]+$'
      or v_attempts_text::numeric > 100
    then
      return false;
    end if;

    -- A persisted answer needs a real version timestamp for conflict merges.
    if public._common_expression_rfc3339_timestamp(
      v_answer ->> 'updatedAt'
    ) is null then
      return false;
    end if;
  end loop;

  return true;
end;
$$;

-- Tie supplied question IDs to the authoritative lesson question count.
create or replace function public._common_expression_state_matches_lesson(
  p_lesson_id text,
  p_state jsonb,
  p_question_count integer
)
returns boolean
language plpgsql
immutable
parallel safe
set search_path = ''
as $$
declare
  v_answer_count integer;
  v_question_id text;
  v_question_number_text text;
  v_expected_question_prefix text;
begin
  if p_question_count is null
    or p_question_count not between 1 and 100
    or p_state is null
    or pg_catalog.jsonb_typeof(p_state -> 'answers') <> 'object'
  then
    return false;
  end if;

  select count(*)::integer
  into v_answer_count
  from pg_catalog.jsonb_object_keys(p_state -> 'answers');

  if v_answer_count > p_question_count then
    return false;
  end if;

  -- Question ids are repeated across the six systems, but must still belong
  -- to the selected lesson number (for example common-expression-03 uses
  -- ce03-q01 ... ce03-q30).  This prevents a handcrafted client payload from
  -- recording a completion under a fabricated or different lesson prefix.
  v_expected_question_prefix := 'ce'
    || pg_catalog.substring(p_lesson_id, '([0-9]{2,4})$')
    || '-q';

  for v_question_id in
    select item.key
    from pg_catalog.jsonb_object_keys(p_state -> 'answers') as item(key)
  loop
    v_question_number_text := pg_catalog.substring(
      v_question_id,
      '-q([0-9]{2,3})$'
    );

    if v_question_id not like v_expected_question_prefix || '%'
      or v_question_number_text is null
      or v_question_number_text !~ '^[0-9]+$'
      or v_question_number_text::integer not between 1 and p_question_count
    then
      return false;
    end if;
  end loop;

  return true;
end;
$$;

-- Merge answer objects by their per-answer version, not by request arrival.
-- Equal instants use attempts, correctness and canonical jsonb text in that
-- order, making the result deterministic and commutative across stale tabs.
create or replace function public._common_expression_merge_answers(
  p_existing jsonb,
  p_incoming jsonb
)
returns jsonb
language plpgsql
stable
parallel safe
set search_path = ''
as $$
declare
  v_existing_answers jsonb := case
    when pg_catalog.jsonb_typeof(p_existing) = 'object' then p_existing
    else '{}'::jsonb
  end;
  v_incoming_answers jsonb := case
    when pg_catalog.jsonb_typeof(p_incoming) = 'object' then p_incoming
    else '{}'::jsonb
  end;
  v_result jsonb := '{}'::jsonb;
  v_question_id text;
  v_existing_answer jsonb;
  v_incoming_answer jsonb;
  v_chosen jsonb;
  v_existing_at timestamptz;
  v_incoming_at timestamptz;
  v_existing_attempts integer;
  v_incoming_attempts integer;
  v_existing_correct boolean;
  v_incoming_correct boolean;
begin
  for v_question_id, v_existing_answer, v_incoming_answer in
    select
      coalesce(existing_answer.key, incoming_answer.key),
      existing_answer.value,
      incoming_answer.value
    from pg_catalog.jsonb_each(v_existing_answers)
      as existing_answer(key, value)
    full join pg_catalog.jsonb_each(v_incoming_answers)
      as incoming_answer(key, value)
      on incoming_answer.key = existing_answer.key
    order by coalesce(existing_answer.key, incoming_answer.key)
  loop
    if v_existing_answer is null then
      v_chosen := v_incoming_answer;
    elsif v_incoming_answer is null then
      v_chosen := v_existing_answer;
    else
      v_existing_at := public._common_expression_rfc3339_timestamp(
        v_existing_answer ->> 'updatedAt'
      );
      v_incoming_at := public._common_expression_rfc3339_timestamp(
        v_incoming_answer ->> 'updatedAt'
      );

      if v_existing_at is null and v_incoming_at is not null then
        v_chosen := v_incoming_answer;
      elsif v_incoming_at is null and v_existing_at is not null then
        v_chosen := v_existing_answer;
      elsif v_incoming_at is distinct from v_existing_at then
        if v_incoming_at > v_existing_at then
          v_chosen := v_incoming_answer;
        else
          v_chosen := v_existing_answer;
        end if;
      else
        v_existing_attempts := case
          when (v_existing_answer ->> 'attempts') ~ '^[0-9]+$'
            then (v_existing_answer ->> 'attempts')::integer
          else -1
        end;
        v_incoming_attempts := case
          when (v_incoming_answer ->> 'attempts') ~ '^[0-9]+$'
            then (v_incoming_answer ->> 'attempts')::integer
          else -1
        end;

        if v_incoming_attempts <> v_existing_attempts then
          if v_incoming_attempts > v_existing_attempts then
            v_chosen := v_incoming_answer;
          else
            v_chosen := v_existing_answer;
          end if;
        else
          v_existing_correct := case
            when pg_catalog.jsonb_typeof(v_existing_answer -> 'correct') =
              'boolean'
              then (v_existing_answer ->> 'correct')::boolean
            else false
          end;
          v_incoming_correct := case
            when pg_catalog.jsonb_typeof(v_incoming_answer -> 'correct') =
              'boolean'
              then (v_incoming_answer ->> 'correct')::boolean
            else false
          end;

          if v_incoming_correct <> v_existing_correct then
            if v_incoming_correct then
              v_chosen := v_incoming_answer;
            else
              v_chosen := v_existing_answer;
            end if;
          elsif v_incoming_answer::text > v_existing_answer::text then
            v_chosen := v_incoming_answer;
          else
            v_chosen := v_existing_answer;
          end if;
        end if;
      end if;
    end if;

    v_result := v_result || pg_catalog.jsonb_build_object(
      v_question_id,
      v_chosen
    );
  end loop;

  return v_result;
end;
$$;

-- This is the authoritative server-side catalogue. Only reviewed, enabled
-- rows can receive progress or bookmarks. Keep this seed aligned with the
-- reviewed browser catalogue before publishing new lessons.
create table if not exists public.common_expression_catalogue_lessons (
  system_key text not null,
  lesson_id text not null,
  question_count integer not null,
  content_version integer not null default 1,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (system_key, lesson_id),
  constraint common_expression_catalogue_lessons_system_key_check
    check (public._common_expression_system_key_valid(system_key)),
  constraint common_expression_catalogue_lessons_lesson_id_check
    check (public._common_expression_lesson_id_valid(lesson_id)),
  constraint common_expression_catalogue_lessons_question_count_check
    check (question_count between 1 and 100),
  constraint common_expression_catalogue_lessons_content_version_check
    check (content_version between 1 and 1000000)
);

insert into public.common_expression_catalogue_lessons (
  system_key,
  lesson_id,
  question_count,
  content_version,
  is_enabled
)
values
  ('speaking', 'common-expression-01', 20, 1, true),
  ('speaking', 'common-expression-02', 20, 1, true),
  ('speaking', 'common-expression-03', 30, 1, true),
  ('speaking', 'common-expression-04', 30, 1, true),
  ('speaking', 'common-expression-05', 30, 1, true),
  ('speaking', 'common-expression-06', 30, 1, true),
  ('speaking', 'common-expression-07', 30, 1, true),
  ('speaking', 'common-expression-08', 30, 1, true),
  ('speaking', 'common-expression-09', 30, 1, true),
  ('speaking', 'common-expression-10', 30, 1, true),
  ('speaking', 'common-expression-11', 30, 1, true),
  ('speaking', 'common-expression-12', 30, 1, true),
  ('speaking', 'common-expression-13', 30, 1, true),
  ('written', 'common-expression-01', 30, 1, true),
  ('written', 'common-expression-02', 30, 1, true),
  ('written', 'common-expression-03', 30, 1, true),
  ('written', 'common-expression-04', 30, 1, true),
  ('written', 'common-expression-05', 30, 1, true),
  ('written', 'common-expression-06', 30, 1, true),
  ('written', 'common-expression-07', 30, 1, true),
  ('written', 'common-expression-08', 30, 1, true),
  ('written', 'common-expression-09', 30, 1, true),
  ('written', 'common-expression-10', 30, 1, true),
  ('written', 'common-expression-11', 30, 1, true),
  ('rhetorical-speaking', 'common-expression-01', 30, 1, true),
  ('rhetorical-speaking', 'common-expression-02', 30, 1, true),
  ('rhetorical-speaking', 'common-expression-03', 30, 1, true),
  ('rhetorical-speaking', 'common-expression-04', 30, 1, true),
  ('rhetorical-speaking', 'common-expression-05', 30, 1, true),
  ('rhetorical-speaking', 'common-expression-06', 30, 1, true),
  ('rhetorical-speaking', 'common-expression-07', 30, 1, true),
  ('rhetorical-speaking', 'common-expression-08', 30, 1, true),
  ('rhetorical-speaking', 'common-expression-09', 30, 1, true),
  ('rhetorical-speaking', 'common-expression-10', 30, 1, true),
  ('rhetorical-writing', 'common-expression-01', 30, 1, true),
  ('rhetorical-writing', 'common-expression-02', 30, 1, true),
  ('rhetorical-writing', 'common-expression-03', 30, 1, true),
  ('rhetorical-writing', 'common-expression-04', 30, 1, true),
  ('rhetorical-writing', 'common-expression-05', 30, 1, true),
  ('rhetorical-writing', 'common-expression-06', 30, 1, true),
  ('rhetorical-writing', 'common-expression-07', 30, 1, true),
  ('rhetorical-writing', 'common-expression-08', 30, 1, true),
  ('professional-message', 'common-expression-01', 30, 1, true),
  ('professional-message', 'common-expression-02', 30, 1, true),
  ('professional-message', 'common-expression-03', 30, 1, true),
  ('professional-message', 'common-expression-04', 30, 1, true),
  ('professional-message', 'common-expression-05', 30, 1, true),
  ('professional-message', 'common-expression-06', 30, 1, true),
  ('professional-message', 'common-expression-07', 30, 1, true),
  ('professional-message', 'common-expression-08', 30, 1, true),
  ('business-speaking', 'common-expression-01', 30, 1, true),
  ('business-speaking', 'common-expression-02', 30, 1, true),
  ('business-speaking', 'common-expression-03', 30, 1, true),
  ('business-speaking', 'common-expression-04', 30, 1, true),
  ('business-speaking', 'common-expression-05', 30, 1, true),
  ('business-speaking', 'common-expression-06', 30, 1, true),
  ('business-speaking', 'common-expression-07', 30, 1, true),
  ('business-speaking', 'common-expression-08', 30, 1, true)
on conflict (system_key, lesson_id) do update
set question_count = excluded.question_count,
    content_version = excluded.content_version,
    is_enabled = true,
    updated_at = now();

create table if not exists public.common_expression_lesson_states (
  student_id uuid not null
    references public.flashcard_students(id) on delete cascade,
  system_key text not null,
  lesson_id text not null,
  state jsonb not null,
  duration_ms bigint not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (student_id, system_key, lesson_id),
  constraint common_expression_lesson_states_system_key_check
    check (public._common_expression_system_key_valid(system_key)),
  constraint common_expression_lesson_states_lesson_id_check
    check (public._common_expression_lesson_id_valid(lesson_id)),
  constraint common_expression_lesson_states_state_check
    check (
      public._common_expression_state_valid(
        lesson_id,
        state,
        duration_ms
      )
    )
);

create table if not exists public.common_expression_bookmarks (
  student_id uuid not null
    references public.flashcard_students(id) on delete cascade,
  system_key text not null,
  lesson_id text not null,
  created_at timestamptz not null default now(),
  primary key (student_id, system_key, lesson_id),
  constraint common_expression_bookmarks_system_key_check
    check (public._common_expression_system_key_valid(system_key)),
  constraint common_expression_bookmarks_lesson_id_check
    check (public._common_expression_lesson_id_valid(lesson_id))
);

-- One authoritative first submission per student/question.  This matches the
-- Sentence Structure / Idiom / Proverb dashboards: a checked answer appears
-- once even when it still needs correction.  The server records the day only
-- after the bounded lesson-state validator has accepted the submission;
-- browser timestamps never determine live activity dates.
create table if not exists public.common_expression_question_completions (
  student_id uuid not null
    references public.flashcard_students(id) on delete cascade,
  system_key text not null,
  lesson_id text not null,
  question_id text not null,
  completed_at timestamptz not null default now(),
  primary key (student_id, system_key, lesson_id, question_id),
  foreign key (system_key, lesson_id)
    references public.common_expression_catalogue_lessons (system_key, lesson_id)
    on update cascade
    on delete restrict,
  constraint common_expression_question_completions_system_key_check
    check (public._common_expression_system_key_valid(system_key)),
  constraint common_expression_question_completions_lesson_id_check
    check (public._common_expression_lesson_id_valid(lesson_id)),
  constraint common_expression_question_completions_question_id_check
    check (question_id ~ '^ce[0-9]{2,4}-q(0[1-9]|[1-9][0-9]{1,2})$')
);

-- Time is stored as one aggregate per lesson and Hong Kong calendar day.
-- The save RPC adds only the positive delta beyond the server's previous
-- lesson duration, so retries cannot count the same elapsed time twice.
create table if not exists public.common_expression_time_activity_days (
  student_id uuid not null
    references public.flashcard_students(id) on delete cascade,
  system_key text not null,
  lesson_id text not null,
  activity_date date not null,
  duration_ms bigint not null default 0,
  updated_at timestamptz not null default now(),
  primary key (student_id, system_key, lesson_id, activity_date),
  foreign key (system_key, lesson_id)
    references public.common_expression_catalogue_lessons (system_key, lesson_id)
    on update cascade
    on delete restrict,
  constraint common_expression_time_activity_days_system_key_check
    check (public._common_expression_system_key_valid(system_key)),
  constraint common_expression_time_activity_days_lesson_id_check
    check (public._common_expression_lesson_id_valid(lesson_id)),
  constraint common_expression_time_activity_days_duration_check
    check (duration_ms between 0 and 31536000000)
);

create index if not exists common_expression_question_completions_student_day_idx
  on public.common_expression_question_completions
  (student_id, system_key, completed_at);
create index if not exists common_expression_time_activity_days_student_day_idx
  on public.common_expression_time_activity_days
  (student_id, system_key, activity_date);

-- Upgrade an already-applied first version without failing on legacy rows.
-- NOT VALID still enforces the FK for every new write.  Validation succeeds
-- immediately on a clean/new install; a warning identifies legacy fabricated
-- rows without making this security patch impossible to deploy.
do $$
begin
  if not exists (
    select 1
    from pg_catalog.pg_constraint constraint_row
    where constraint_row.conrelid =
      'public.common_expression_lesson_states'::regclass
      and constraint_row.conname =
        'common_expression_lesson_states_catalogue_fk'
  ) then
    execute $ddl$
      alter table public.common_expression_lesson_states
      add constraint common_expression_lesson_states_catalogue_fk
      foreign key (system_key, lesson_id)
      references public.common_expression_catalogue_lessons (system_key, lesson_id)
      on update cascade
      on delete restrict
      not valid
    $ddl$;
  end if;

  if exists (
    select 1
    from pg_catalog.pg_constraint constraint_row
    where constraint_row.conrelid =
      'public.common_expression_lesson_states'::regclass
      and constraint_row.conname =
        'common_expression_lesson_states_catalogue_fk'
      and not constraint_row.convalidated
  ) then
    begin
      alter table public.common_expression_lesson_states
        validate constraint common_expression_lesson_states_catalogue_fk;
    exception
      when foreign_key_violation then
        raise warning
          'Legacy Common Expression lesson states contain uncatalogued IDs; new writes remain protected';
    end;
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_constraint constraint_row
    where constraint_row.conrelid =
      'public.common_expression_bookmarks'::regclass
      and constraint_row.conname =
        'common_expression_bookmarks_catalogue_fk'
  ) then
    execute $ddl$
      alter table public.common_expression_bookmarks
      add constraint common_expression_bookmarks_catalogue_fk
      foreign key (system_key, lesson_id)
      references public.common_expression_catalogue_lessons (system_key, lesson_id)
      on update cascade
      on delete restrict
      not valid
    $ddl$;
  end if;

  if exists (
    select 1
    from pg_catalog.pg_constraint constraint_row
    where constraint_row.conrelid =
      'public.common_expression_bookmarks'::regclass
      and constraint_row.conname =
        'common_expression_bookmarks_catalogue_fk'
      and not constraint_row.convalidated
  ) then
    begin
      alter table public.common_expression_bookmarks
        validate constraint common_expression_bookmarks_catalogue_fk;
    exception
      when foreign_key_violation then
        raise warning
          'Legacy Common Expression bookmarks contain uncatalogued IDs; new writes remain protected';
    end;
  end if;
end;
$$;

alter table public.common_expression_catalogue_lessons enable row level security;
alter table public.common_expression_lesson_states enable row level security;
alter table public.common_expression_bookmarks enable row level security;
alter table public.common_expression_question_completions enable row level security;
alter table public.common_expression_time_activity_days enable row level security;

-- There are intentionally no permissive policies.  All student ownership is
-- enforced by the three narrowly scoped RPCs below.
revoke all on table public.common_expression_catalogue_lessons
  from public, anon, authenticated, service_role;
revoke all on table public.common_expression_lesson_states
  from public, anon, authenticated, service_role;
revoke all on table public.common_expression_bookmarks
  from public, anon, authenticated, service_role;
revoke all on table public.common_expression_question_completions
  from public, anon, authenticated, service_role;
revoke all on table public.common_expression_time_activity_days
  from public, anon, authenticated, service_role;

-- Upgrade existing progress into the two activity feeds.  The statements are
-- idempotent, use validated lesson/question identifiers, and never overwrite
-- an earlier authoritative completion time.
insert into public.common_expression_question_completions (
  student_id,
  system_key,
  lesson_id,
  question_id,
  completed_at
)
select
  lesson_state.student_id,
  lesson_state.system_key,
  lesson_state.lesson_id,
  answer.key,
  coalesce(
    public._common_expression_rfc3339_timestamp(answer.value ->> 'updatedAt'),
    lesson_state.updated_at
  )
from public.common_expression_lesson_states lesson_state
cross join lateral pg_catalog.jsonb_each(lesson_state.state -> 'answers')
  as answer(key, value)
join public.common_expression_catalogue_lessons catalogue_lesson
  on catalogue_lesson.system_key = lesson_state.system_key
  and catalogue_lesson.lesson_id = lesson_state.lesson_id
  and catalogue_lesson.is_enabled
where pg_catalog.jsonb_typeof(answer.value -> 'attempts') = 'number'
  and (answer.value ->> 'attempts')::integer > 0
  and public._common_expression_state_matches_lesson(
    lesson_state.lesson_id,
    pg_catalog.jsonb_build_object('answers', pg_catalog.jsonb_build_object(answer.key, answer.value)),
    catalogue_lesson.question_count
  )
on conflict (student_id, system_key, lesson_id, question_id) do update
set completed_at = least(
  public.common_expression_question_completions.completed_at,
  excluded.completed_at
);

insert into public.common_expression_time_activity_days (
  student_id,
  system_key,
  lesson_id,
  activity_date,
  duration_ms,
  updated_at
)
select
  lesson_state.student_id,
  lesson_state.system_key,
  lesson_state.lesson_id,
  (lesson_state.updated_at at time zone 'Asia/Hong_Kong')::date,
  lesson_state.duration_ms,
  lesson_state.updated_at
from public.common_expression_lesson_states lesson_state
join public.common_expression_catalogue_lessons catalogue_lesson
  on catalogue_lesson.system_key = lesson_state.system_key
  and catalogue_lesson.lesson_id = lesson_state.lesson_id
  and catalogue_lesson.is_enabled
where lesson_state.duration_ms > 0
on conflict (student_id, system_key, lesson_id, activity_date) do update
set duration_ms = greatest(
      public.common_expression_time_activity_days.duration_ms,
      excluded.duration_ms
    ),
    updated_at = greatest(
      public.common_expression_time_activity_days.updated_at,
      excluded.updated_at
    );

create or replace function public.common_expression_student_snapshot(
  p_token uuid,
  p_system_key text
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
  v_student_name text;
  v_states jsonb;
  v_bookmarks jsonb;
  v_question_activity jsonb;
  v_time_activity jsonb;
begin
  v_student_id := public.flashcard_session_student_id(p_token);

  if v_student_id is null then
    raise exception 'Invalid or expired student session'
      using errcode = '28000';
  end if;

  if not public._common_expression_system_key_valid(p_system_key) then
    raise exception 'Invalid Common Expression system key'
      using errcode = '22023';
  end if;

  select student.name
  into v_student_name
  from public.flashcard_students student
  where student.id = v_student_id
    and student.deleted_at is null;

  if v_student_name is null then
    raise exception 'Active student not found'
      using errcode = '28000';
  end if;

  select coalesce(
    pg_catalog.jsonb_agg(
      pg_catalog.jsonb_build_object(
        'lesson_id', lesson_state.lesson_id,
        'state', lesson_state.state,
        'duration_ms', lesson_state.duration_ms,
        'completed_at', lesson_state.completed_at,
        'updated_at', lesson_state.updated_at
      )
      order by lesson_state.lesson_id
    ),
    '[]'::jsonb
  )
  into v_states
  from public.common_expression_lesson_states lesson_state
  join public.common_expression_catalogue_lessons catalogue_lesson
    on catalogue_lesson.system_key = lesson_state.system_key
    and catalogue_lesson.lesson_id = lesson_state.lesson_id
    and catalogue_lesson.is_enabled
  where lesson_state.student_id = v_student_id
    and lesson_state.system_key = p_system_key;

  select coalesce(
    pg_catalog.jsonb_agg(bookmark.lesson_id order by bookmark.lesson_id),
    '[]'::jsonb
  )
  into v_bookmarks
  from public.common_expression_bookmarks bookmark
  join public.common_expression_catalogue_lessons catalogue_lesson
    on catalogue_lesson.system_key = bookmark.system_key
    and catalogue_lesson.lesson_id = bookmark.lesson_id
    and catalogue_lesson.is_enabled
  where bookmark.student_id = v_student_id
    and bookmark.system_key = p_system_key;

  select coalesce(
    pg_catalog.jsonb_agg(
      pg_catalog.jsonb_build_object(
        'lessonId', completion.lesson_id,
        'questionId', completion.question_id,
        'completedAt', completion.completed_at
      )
      order by completion.completed_at, completion.lesson_id, completion.question_id
    ),
    '[]'::jsonb
  )
  into v_question_activity
  from public.common_expression_question_completions completion
  join public.common_expression_catalogue_lessons catalogue_lesson
    on catalogue_lesson.system_key = completion.system_key
    and catalogue_lesson.lesson_id = completion.lesson_id
    and catalogue_lesson.is_enabled
  where completion.student_id = v_student_id
    and completion.system_key = p_system_key;

  select coalesce(
    pg_catalog.jsonb_agg(
      pg_catalog.jsonb_build_object(
        'lessonId', activity.lesson_id,
        'date', activity.activity_date,
        'durationMs', activity.duration_ms
      )
      order by activity.activity_date, activity.lesson_id
    ),
    '[]'::jsonb
  )
  into v_time_activity
  from public.common_expression_time_activity_days activity
  join public.common_expression_catalogue_lessons catalogue_lesson
    on catalogue_lesson.system_key = activity.system_key
    and catalogue_lesson.lesson_id = activity.lesson_id
    and catalogue_lesson.is_enabled
  where activity.student_id = v_student_id
    and activity.system_key = p_system_key;

  return pg_catalog.jsonb_build_object(
    'student', pg_catalog.jsonb_build_object(
      'id', v_student_id,
      'name', v_student_name
    ),
    'system_key', p_system_key,
    'states', v_states,
    'bookmarks', v_bookmarks,
    'questionActivity', v_question_activity,
    'timeActivity', v_time_activity
  );
end;
$$;

create or replace function public.common_expression_save_lesson_state(
  p_token uuid,
  p_system_key text,
  p_lesson_id text,
  p_state jsonb,
  p_duration_ms bigint
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
  v_now timestamptz := pg_catalog.clock_timestamp();
  v_completed_at timestamptz;
  v_question_count integer;
  v_previous_duration_ms bigint := 0;
  v_duration_delta_ms bigint := 0;
  v_saved public.common_expression_lesson_states%rowtype;
begin
  v_student_id := public.flashcard_session_student_id(p_token);

  if v_student_id is null then
    raise exception 'Invalid or expired student session'
      using errcode = '28000';
  end if;

  if not public._common_expression_system_key_valid(p_system_key)
    or not public._common_expression_lesson_id_valid(p_lesson_id)
  then
    raise exception 'Invalid Common Expression lesson state'
      using errcode = '22023';
  end if;

  select catalogue_lesson.question_count
  into v_question_count
  from public.common_expression_catalogue_lessons catalogue_lesson
  where catalogue_lesson.system_key = p_system_key
    and catalogue_lesson.lesson_id = p_lesson_id
    and catalogue_lesson.is_enabled;

  if not found then
    raise exception 'Unknown or disabled Common Expression lesson'
      using errcode = '22023';
  end if;

  if not public._common_expression_state_valid(
      p_lesson_id,
      p_state,
      p_duration_ms
    )
    or not public._common_expression_state_matches_lesson(
      p_lesson_id,
      p_state,
      v_question_count
    )
  then
    raise exception 'Invalid Common Expression lesson state'
      using errcode = '22023';
  end if;

  if (p_state ->> 'completedAt') <> '' then
    -- Completion time is authoritative server time; the client timestamp is
    -- only a completion signal and is never written into this column.
    v_completed_at := v_now;
  end if;

  -- A lesson-scoped transaction lock also serialises the first insert, when
  -- no lesson-state row exists yet. This keeps duration deltas idempotent
  -- across retries and concurrent tabs.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      v_student_id::text || ':' || p_system_key || ':' || p_lesson_id,
      0
    )
  );

  select lesson_state.duration_ms
  into v_previous_duration_ms
  from public.common_expression_lesson_states lesson_state
  where lesson_state.student_id = v_student_id
    and lesson_state.system_key = p_system_key
    and lesson_state.lesson_id = p_lesson_id
  for update;

  v_previous_duration_ms := coalesce(v_previous_duration_ms, 0);

  insert into public.common_expression_lesson_states (
    student_id,
    system_key,
    lesson_id,
    state,
    duration_ms,
    completed_at,
    created_at,
    updated_at
  )
  values (
    v_student_id,
    p_system_key,
    p_lesson_id,
    p_state,
    p_duration_ms,
    v_completed_at,
    v_now,
    v_now
  )
  on conflict (student_id, system_key, lesson_id) do update
  set
    -- Preserve answers saved by another tab/device, while the newest value
    -- remains authoritative for any question present in both snapshots.
    state = excluded.state || pg_catalog.jsonb_build_object(
      'answers',
      public._common_expression_merge_answers(
        public.common_expression_lesson_states.state -> 'answers',
        excluded.state -> 'answers'
      ),
      'durationMs',
      greatest(
        public.common_expression_lesson_states.duration_ms,
        excluded.duration_ms
      )
    ),
    duration_ms = greatest(
      public.common_expression_lesson_states.duration_ms,
      excluded.duration_ms
    ),
    completed_at = coalesce(
      public.common_expression_lesson_states.completed_at,
      excluded.completed_at
    ),
    updated_at = v_now
  returning * into v_saved;

  v_duration_delta_ms := greatest(
    v_saved.duration_ms - v_previous_duration_ms,
    0
  );

  insert into public.common_expression_question_completions (
    student_id,
    system_key,
    lesson_id,
    question_id,
    completed_at
  )
  select
    v_student_id,
    p_system_key,
    p_lesson_id,
    answer.key,
    v_now
  from pg_catalog.jsonb_each(v_saved.state -> 'answers')
    as answer(key, value)
  where pg_catalog.jsonb_typeof(answer.value -> 'attempts') = 'number'
    and (answer.value ->> 'attempts')::integer > 0
  on conflict (student_id, system_key, lesson_id, question_id) do nothing;

  if v_duration_delta_ms > 0 then
    insert into public.common_expression_time_activity_days (
      student_id,
      system_key,
      lesson_id,
      activity_date,
      duration_ms,
      updated_at
    )
    values (
      v_student_id,
      p_system_key,
      p_lesson_id,
      (v_now at time zone 'Asia/Hong_Kong')::date,
      v_duration_delta_ms,
      v_now
    )
    on conflict (student_id, system_key, lesson_id, activity_date) do update
    set duration_ms = public.common_expression_time_activity_days.duration_ms
        + excluded.duration_ms,
        updated_at = v_now;
  end if;

  return pg_catalog.jsonb_build_object(
    'state_row', pg_catalog.jsonb_build_object(
      'lesson_id', v_saved.lesson_id,
      'state', v_saved.state,
      'duration_ms', v_saved.duration_ms,
      'completed_at', v_saved.completed_at,
      'updated_at', v_saved.updated_at
    ),
    'activity_recorded', pg_catalog.jsonb_build_object(
      'lesson_question_completions', (
        select count(*)
        from public.common_expression_question_completions completion
        where completion.student_id = v_student_id
          and completion.system_key = p_system_key
          and completion.lesson_id = p_lesson_id
      ),
      'duration_delta_ms', v_duration_delta_ms,
      'activity_date', (v_now at time zone 'Asia/Hong_Kong')::date
    )
  );
end;
$$;

create or replace function public.common_expression_set_bookmark(
  p_token uuid,
  p_system_key text,
  p_lesson_id text,
  p_bookmarked boolean
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
begin
  v_student_id := public.flashcard_session_student_id(p_token);

  if v_student_id is null then
    raise exception 'Invalid or expired student session'
      using errcode = '28000';
  end if;

  if not public._common_expression_system_key_valid(p_system_key)
    or not public._common_expression_lesson_id_valid(p_lesson_id)
    or p_bookmarked is null
  then
    raise exception 'Invalid Common Expression bookmark'
      using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.common_expression_catalogue_lessons catalogue_lesson
    where catalogue_lesson.system_key = p_system_key
      and catalogue_lesson.lesson_id = p_lesson_id
      and catalogue_lesson.is_enabled
  ) then
    raise exception 'Unknown or disabled Common Expression lesson'
      using errcode = '22023';
  end if;

  if p_bookmarked then
    insert into public.common_expression_bookmarks (
      student_id,
      system_key,
      lesson_id
    )
    values (v_student_id, p_system_key, p_lesson_id)
    on conflict (student_id, system_key, lesson_id) do nothing;
  else
    delete from public.common_expression_bookmarks bookmark
    where bookmark.student_id = v_student_id
      and bookmark.system_key = p_system_key
      and bookmark.lesson_id = p_lesson_id;
  end if;

  return pg_catalog.jsonb_build_object(
    'system_key', p_system_key,
    'lesson_id', p_lesson_id,
    'bookmarked', p_bookmarked
  );
end;
$$;

-- PostgreSQL grants new functions to PUBLIC by default.  Remove those grants
-- explicitly before publishing the three authenticated RPC entry points.
revoke all on function public._common_expression_system_key_valid(text)
  from public, anon, authenticated, service_role;
revoke all on function public._common_expression_lesson_id_valid(text)
  from public, anon, authenticated, service_role;
revoke all on function public._common_expression_rfc3339_timestamp(text)
  from public, anon, authenticated, service_role;
revoke all on function public._common_expression_state_valid(text, jsonb, bigint)
  from public, anon, authenticated, service_role;
revoke all on function public._common_expression_state_matches_lesson(
  text,
  jsonb,
  integer
) from public, anon, authenticated, service_role;
revoke all on function public._common_expression_merge_answers(jsonb, jsonb)
  from public, anon, authenticated, service_role;

revoke all on function public.common_expression_student_snapshot(uuid, text)
  from public, anon, authenticated, service_role;
revoke all on function public.common_expression_save_lesson_state(
  uuid,
  text,
  text,
  jsonb,
  bigint
) from public, anon, authenticated, service_role;
revoke all on function public.common_expression_set_bookmark(
  uuid,
  text,
  text,
  boolean
) from public, anon, authenticated, service_role;

grant execute on function public.common_expression_student_snapshot(uuid, text)
  to authenticated;
grant execute on function public.common_expression_save_lesson_state(
  uuid,
  text,
  text,
  jsonb,
  bigint
) to authenticated;
grant execute on function public.common_expression_set_bookmark(
  uuid,
  text,
  text,
  boolean
) to authenticated;

notify pgrst, 'reload schema';

commit;
