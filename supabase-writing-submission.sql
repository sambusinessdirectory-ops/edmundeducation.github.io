-- Edmund Education Writing Submission: shared-student submissions, grammar
-- history, and dedicated administrator authentication.
--
-- Flashcard remains the only student credential store. Apply the shared
-- Flashcard account migrations before this file. The browser never receives
-- table privileges; a narrowly scoped private API service invokes only the
-- service-role RPCs granted at the end of this migration.

begin;

create extension if not exists pgcrypto with schema extensions;

do $$
begin
  if to_regclass('public.flashcard_students') is null then
    raise exception 'Missing dependency: public.flashcard_students';
  end if;
  if to_regclass('public.flashcard_student_sessions') is null then
    raise exception 'Missing dependency: public.flashcard_student_sessions';
  end if;
  if not exists (
    select 1
    from pg_catalog.pg_extension extension_row
    join pg_catalog.pg_namespace namespace_row
      on namespace_row.oid = extension_row.extnamespace
    where extension_row.extname = 'pgcrypto'
      and namespace_row.nspname = 'extensions'
  ) then
    raise exception 'pgcrypto must be installed in the extensions schema';
  end if;
end;
$$;

create or replace function public._writing_submission_word_count(p_value text)
returns integer
language sql
immutable
set search_path = ''
as $$
  select case
    when btrim(coalesce(p_value, '')) = '' then 0
    else cardinality(regexp_split_to_array(btrim(p_value), E'\\s+'))
  end;
$$;

-- The Worker performs the primary validation. This database guard
-- independently bounds every stored grammar occurrence and rejects malformed
-- batches if a future server implementation calls the RPC incorrectly.
create or replace function public._writing_submission_occurrence_batch_valid(
  p_document_id uuid,
  p_occurrences jsonb
)
returns boolean
language plpgsql
set search_path = ''
as $$
declare
  v_item jsonb;
  v_detected_at timestamptz;
  v_count integer;
begin
  if p_document_id is null
    or p_occurrences is null
    or jsonb_typeof(p_occurrences) <> 'array'
    or jsonb_array_length(p_occurrences) < 1
    or jsonb_array_length(p_occurrences) > 50
    or octet_length(p_occurrences::text) > 524288
  then
    return false;
  end if;

  for v_item in select value from jsonb_array_elements(p_occurrences)
  loop
    if jsonb_typeof(v_item) <> 'object'
      or (select count(*) from jsonb_object_keys(v_item)) <> 9
      or exists (
        select 1
        from jsonb_object_keys(v_item) key_row(key_name)
        where key_name not in (
          'id', 'fingerprint', 'ruleId', 'title', 'message',
          'originalText', 'suggestedText', 'sentenceText', 'detectedAt'
        )
      )
      or jsonb_typeof(v_item -> 'id') <> 'string'
      or coalesce(v_item ->> 'id', '') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
      or jsonb_typeof(v_item -> 'fingerprint') <> 'string'
      or coalesce(v_item ->> 'fingerprint', '') !~ '^[0-9a-f]{64}$'
      or jsonb_typeof(v_item -> 'ruleId') <> 'string'
      or char_length(coalesce(v_item ->> 'ruleId', '')) not between 1 and 120
      or octet_length(coalesce(v_item ->> 'ruleId', '')) > 480
      or coalesce(v_item ->> 'ruleId', '') ~ '[[:cntrl:]]'
      or jsonb_typeof(v_item -> 'title') <> 'string'
      or char_length(coalesce(v_item ->> 'title', '')) not between 1 and 200
      or octet_length(coalesce(v_item ->> 'title', '')) > 800
      or coalesce(v_item ->> 'title', '') ~ '[[:cntrl:]]'
      or jsonb_typeof(v_item -> 'message') <> 'string'
      or char_length(coalesce(v_item ->> 'message', '')) not between 1 and 2000
      or octet_length(coalesce(v_item ->> 'message', '')) > 8000
      or jsonb_typeof(v_item -> 'originalText') <> 'string'
      or char_length(coalesce(v_item ->> 'originalText', '')) > 2000
      or octet_length(coalesce(v_item ->> 'originalText', '')) > 8000
      or jsonb_typeof(v_item -> 'suggestedText') <> 'string'
      or char_length(coalesce(v_item ->> 'suggestedText', '')) > 2000
      or octet_length(coalesce(v_item ->> 'suggestedText', '')) > 8000
      or (
        coalesce(v_item ->> 'originalText', '') = ''
        and coalesce(v_item ->> 'suggestedText', '') = ''
      )
      or jsonb_typeof(v_item -> 'sentenceText') <> 'string'
      or char_length(coalesce(v_item ->> 'sentenceText', '')) not between 1 and 10000
      or octet_length(coalesce(v_item ->> 'sentenceText', '')) > 40000
      or jsonb_typeof(v_item -> 'detectedAt') <> 'string'
      or char_length(coalesce(v_item ->> 'detectedAt', '')) not between 20 and 40
    then
      return false;
    end if;

    begin
      v_detected_at := (v_item ->> 'detectedAt')::timestamptz;
    exception when others then
      return false;
    end;
    if v_detected_at < timestamptz '2020-01-01 00:00:00+00'
      or v_detected_at > clock_timestamp() + interval '5 minutes'
    then
      return false;
    end if;
  end loop;

  select count(*) into v_count from jsonb_array_elements(p_occurrences);
  if v_count <> (
    select count(distinct value ->> 'id')
    from jsonb_array_elements(p_occurrences)
  ) or v_count <> (
    select count(distinct value ->> 'fingerprint')
    from jsonb_array_elements(p_occurrences)
  ) then
    return false;
  end if;

  return true;
end;
$$;

create table if not exists public.writing_submission_admin_accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  password_hash text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (name = btrim(name)),
  check (char_length(name) between 1 and 100),
  check (name !~ '[[:cntrl:]]'),
  check (password_hash ~ '^\$2[aby]\$12\$[./A-Za-z0-9]{53}$')
);

create unique index if not exists writing_submission_admin_name_lower_idx
  on public.writing_submission_admin_accounts (lower(name));

-- Raw admin tokens are returned once; Supabase stores only SHA-256 digests.
create table if not exists public.writing_submission_admin_sessions (
  token_hash bytea primary key,
  admin_id uuid not null
    references public.writing_submission_admin_accounts(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  check (octet_length(token_hash) = 32),
  check (expires_at > created_at)
);

create index if not exists writing_submission_admin_sessions_expires_idx
  on public.writing_submission_admin_sessions (expires_at);

create table if not exists public.writing_submissions (
  id uuid primary key,
  student_id uuid not null
    references public.flashcard_students(id) on delete cascade,
  topic text not null,
  answer text not null,
  word_count integer not null,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  check (char_length(btrim(topic)) between 1 and 4000),
  check (octet_length(topic) <= 16000),
  check (char_length(btrim(answer)) between 1 and 100000),
  check (octet_length(answer) <= 400000),
  check (word_count = public._writing_submission_word_count(answer)),
  check (word_count between 1 and 50000)
);

create index if not exists writing_submissions_student_history_idx
  on public.writing_submissions (student_id, submitted_at desc, id desc);

create table if not exists public.writing_submission_issue_occurrences (
  id uuid primary key,
  student_id uuid not null
    references public.flashcard_students(id) on delete cascade,
  document_id uuid not null,
  submission_id uuid
    references public.writing_submissions(id) on delete set null,
  fingerprint text not null,
  rule_id text not null,
  title text not null,
  message text not null,
  original_text text not null,
  suggested_text text not null,
  sentence_text text not null,
  detected_at timestamptz not null,
  created_at timestamptz not null default now(),
  check (fingerprint ~ '^[0-9a-f]{64}$'),
  check (char_length(rule_id) between 1 and 120 and octet_length(rule_id) <= 480),
  check (char_length(title) between 1 and 200 and octet_length(title) <= 800),
  check (char_length(message) between 1 and 2000 and octet_length(message) <= 8000),
  check (char_length(original_text) <= 2000 and octet_length(original_text) <= 8000),
  check (char_length(suggested_text) <= 2000 and octet_length(suggested_text) <= 8000),
  check (original_text <> '' or suggested_text <> ''),
  check (char_length(sentence_text) between 1 and 10000 and octet_length(sentence_text) <= 40000),
  unique (student_id, document_id, fingerprint)
);

create index if not exists writing_submission_issues_student_rule_idx
  on public.writing_submission_issue_occurrences
  (student_id, rule_id, detected_at desc, id desc);

create index if not exists writing_submission_issues_document_idx
  on public.writing_submission_issue_occurrences
  (student_id, document_id, detected_at, id);

alter table public.writing_submission_admin_accounts enable row level security;
alter table public.writing_submission_admin_sessions enable row level security;
alter table public.writing_submissions enable row level security;
alter table public.writing_submission_issue_occurrences enable row level security;

-- No permissive RLS policies are created. Security-definer RPCs are the only
-- data path, and their execute privileges are narrowed below.
revoke all on table public.writing_submission_admin_accounts
  from public, anon, authenticated, service_role;
revoke all on table public.writing_submission_admin_sessions
  from public, anon, authenticated, service_role;
revoke all on table public.writing_submissions
  from public, anon, authenticated, service_role;
revoke all on table public.writing_submission_issue_occurrences
  from public, anon, authenticated, service_role;

create or replace function public._writing_submission_revoke_admin_sessions()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.password_hash is distinct from new.password_hash
    or old.is_active is distinct from new.is_active
  then
    delete from public.writing_submission_admin_sessions session_row
    where session_row.admin_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists writing_submission_admin_security_change
  on public.writing_submission_admin_accounts;
create trigger writing_submission_admin_security_change
after update of password_hash, is_active
on public.writing_submission_admin_accounts
for each row execute function public._writing_submission_revoke_admin_sessions();

create or replace function public._writing_submission_admin_id(p_admin_token uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select session_row.admin_id
  from public.writing_submission_admin_sessions session_row
  join public.writing_submission_admin_accounts account
    on account.id = session_row.admin_id
  where session_row.token_hash = extensions.digest(p_admin_token::text, 'sha256')
    and session_row.expires_at > now()
    and account.is_active
  limit 1;
$$;

-- Owner-only provisioning. Generate the cost-12 bcrypt hash locally and pass
-- only the hash in a private Supabase SQL session. Re-provisioning revokes all
-- existing Writing Submission admin sessions.
create or replace function public.writing_submission_provision_admin(
  p_name text,
  p_bcrypt_hash text
)
returns table (admin_id uuid, admin_name text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text := btrim(coalesce(p_name, ''));
  v_admin_id uuid;
begin
  if char_length(v_name) not between 1 and 100
    or v_name ~ '[[:cntrl:]]'
    or coalesce(p_bcrypt_hash, '') !~ '^\$2[aby]\$12\$[./A-Za-z0-9]{53}$'
  then
    raise exception 'A valid name and cost-12 bcrypt hash are required'
      using errcode = '22023';
  end if;

  select account.id into v_admin_id
  from public.writing_submission_admin_accounts account
  where lower(account.name) = lower(v_name)
  limit 1
  for update;

  if v_admin_id is null then
    insert into public.writing_submission_admin_accounts (
      name, password_hash, is_active
    ) values (v_name, p_bcrypt_hash, true)
    returning id into v_admin_id;
  else
    update public.writing_submission_admin_accounts account
    set name = v_name,
        password_hash = p_bcrypt_hash,
        is_active = true,
        updated_at = now()
    where account.id = v_admin_id;
  end if;

  delete from public.writing_submission_admin_sessions session_row
  where session_row.admin_id = v_admin_id;

  return query
  select account.id, account.name
  from public.writing_submission_admin_accounts account
  where account.id = v_admin_id;
end;
$$;

create or replace function public.writing_submission_admin_login(
  p_name text,
  p_password text
)
returns table (
  admin_id uuid,
  admin_token uuid,
  name text,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text := lower(btrim(coalesce(p_name, '')));
  v_admin public.writing_submission_admin_accounts%rowtype;
  v_now timestamptz := clock_timestamp();
  v_token uuid := gen_random_uuid();
  v_expires_at timestamptz := v_now + interval '8 hours';
begin
  if char_length(v_name) not between 1 and 100
    or p_password is null
    or char_length(p_password) not between 1 and 200
  then
    return;
  end if;

  select account.* into v_admin
  from public.writing_submission_admin_accounts account
  where lower(account.name) = v_name
  limit 1
  for update;

  if not found then
    -- Equalize the expensive bcrypt path for unknown usernames. The Worker
    -- rate limiter bounds this operation.
    perform extensions.crypt(p_password, extensions.gen_salt('bf', 12));
    return;
  end if;

  if not v_admin.is_active
    or v_admin.password_hash <> extensions.crypt(p_password, v_admin.password_hash)
  then
    return;
  end if;

  delete from public.writing_submission_admin_sessions session_row
  where session_row.expires_at <= v_now;

  insert into public.writing_submission_admin_sessions (
    token_hash, admin_id, created_at, expires_at
  ) values (
    extensions.digest(v_token::text, 'sha256'),
    v_admin.id,
    v_now,
    v_expires_at
  );

  return query select v_admin.id, v_token, v_admin.name, v_expires_at;
end;
$$;

create or replace function public.writing_submission_admin_me(p_admin_token uuid)
returns table (id uuid, name text, expires_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select account.id, account.name, session_row.expires_at
  from public.writing_submission_admin_sessions session_row
  join public.writing_submission_admin_accounts account
    on account.id = session_row.admin_id
  where session_row.token_hash = extensions.digest(p_admin_token::text, 'sha256')
    and session_row.expires_at > now()
    and account.is_active
  limit 1;
$$;

create or replace function public.writing_submission_admin_logout(p_admin_token uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.writing_submission_admin_sessions session_row
  where session_row.token_hash = extensions.digest(p_admin_token::text, 'sha256');
  return found;
end;
$$;

-- Validate the canonical Flashcard session directly. The anonymous Supabase
-- Auth session used by the browser is not the student's application identity.
create or replace function public.writing_submission_student_profile(p_token uuid)
returns table (id uuid, name text, session_expires_at timestamptz, access jsonb)
language sql
stable
security definer
set search_path = ''
as $$
  select
    student.id,
    student.name,
    session_row.expires_at,
    student.access - '__adminMessage' as access
  from public.flashcard_student_sessions session_row
  join public.flashcard_students student
    on student.id = session_row.student_id
  where session_row.token = p_token
    and session_row.expires_at > now()
    and student.deleted_at is null
    and jsonb_typeof(student.access) = 'object'
    and not exists (
      select 1
      from jsonb_each(student.access) access_entry
      where access_entry.key <> '__adminMessage'
        and jsonb_typeof(access_entry.value) <> 'boolean'
    )
  limit 1;
$$;

create or replace function public.writing_submission_submit(
  p_id uuid,
  p_student_id uuid,
  p_topic text,
  p_answer text,
  p_word_count integer
)
returns table (
  id uuid,
  topic text,
  answer text,
  word_count integer,
  submitted_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_existing public.writing_submissions%rowtype;
  v_now timestamptz := clock_timestamp();
begin
  if not exists (
    select 1 from public.flashcard_students student
    where student.id = p_student_id and student.deleted_at is null
  ) then
    raise exception 'Active student not found' using errcode = '23503';
  end if;

  if p_id is null
    or char_length(btrim(coalesce(p_topic, ''))) not between 1 and 4000
    or octet_length(coalesce(p_topic, '')) > 16000
    or char_length(btrim(coalesce(p_answer, ''))) not between 1 and 100000
    or octet_length(coalesce(p_answer, '')) > 400000
    or p_word_count is distinct from public._writing_submission_word_count(p_answer)
    or p_word_count not between 1 and 50000
  then
    raise exception 'Invalid writing submission' using errcode = '22023';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('writing-submission-student:' || p_student_id::text, 0)
  );
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('writing-submission-document:' || p_id::text, 0)
  );

  select submission.* into v_existing
  from public.writing_submissions submission
  where submission.id = p_id
  for update;

  if found then
    if v_existing.student_id <> p_student_id
      or v_existing.topic <> p_topic
      or v_existing.answer <> p_answer
      or v_existing.word_count <> p_word_count
    then
      raise exception 'Submission identifier conflict' using errcode = '23505';
    end if;
  else
    if (
      select count(*) from public.writing_submissions submission
      where submission.student_id = p_student_id
    ) >= 2000 then
      return;
    end if;

    insert into public.writing_submissions (
      id, student_id, topic, answer, word_count, submitted_at, created_at
    ) values (
      p_id, p_student_id, p_topic, p_answer, p_word_count, v_now, v_now
    );
  end if;

  -- Grammar detections may arrive while the student is still typing. Link all
  -- occurrences for this document once its immutable submission is saved.
  update public.writing_submission_issue_occurrences occurrence
  set submission_id = p_id
  where occurrence.student_id = p_student_id
    and occurrence.document_id = p_id
    and occurrence.submission_id is null;

  return query
  select submission.id, submission.topic, submission.answer,
         submission.word_count, submission.submitted_at
  from public.writing_submissions submission
  where submission.id = p_id and submission.student_id = p_student_id;
end;
$$;

create or replace function public.writing_submission_get(
  p_student_id uuid,
  p_id uuid
)
returns table (
  id uuid,
  topic text,
  answer text,
  word_count integer,
  submitted_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select submission.id, submission.topic, submission.answer,
         submission.word_count, submission.submitted_at
  from public.writing_submissions submission
  where submission.student_id = p_student_id and submission.id = p_id
  limit 1;
$$;

create or replace function public.writing_submission_list(
  p_student_id uuid,
  p_limit integer,
  p_offset integer
)
returns table (
  id uuid,
  topic text,
  answer_preview text,
  word_count integer,
  submitted_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if p_limit not between 1 and 101 or p_offset not between 0 and 1000000 then
    raise exception 'Invalid submission page' using errcode = '22023';
  end if;
  return query
  select submission.id, submission.topic, left(submission.answer, 400),
         submission.word_count, submission.submitted_at
  from public.writing_submissions submission
  where submission.student_id = p_student_id
  order by submission.submitted_at desc, submission.id desc
  limit p_limit offset p_offset;
end;
$$;

create or replace function public.writing_submission_record_issue_batch(
  p_student_id uuid,
  p_document_id uuid,
  p_occurrences jsonb
)
returns table (accepted_count integer, inserted_count integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_submission_id uuid;
  v_current_count bigint;
  v_new_count bigint;
  v_inserted integer := 0;
begin
  if not exists (
    select 1 from public.flashcard_students student
    where student.id = p_student_id and student.deleted_at is null
  ) then
    raise exception 'Active student not found' using errcode = '23503';
  end if;
  if not public._writing_submission_occurrence_batch_valid(p_document_id, p_occurrences) then
    raise exception 'Invalid grammar occurrence batch' using errcode = '22023';
  end if;

  -- Use the same lock keys and order as writing_submission_submit. This makes
  -- pre-submit grammar writes and the final immutable submission atomic with
  -- respect to linking occurrences to their submission.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('writing-submission-student:' || p_student_id::text, 0)
  );
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('writing-submission-document:' || p_document_id::text, 0)
  );

  select submission.id into v_submission_id
  from public.writing_submissions submission
  where submission.id = p_document_id and submission.student_id = p_student_id
  limit 1;

  select count(*) into v_current_count
  from public.writing_submission_issue_occurrences occurrence
  where occurrence.student_id = p_student_id;

  select count(*) into v_new_count
  from jsonb_array_elements(p_occurrences) item
  where not exists (
    select 1
    from public.writing_submission_issue_occurrences occurrence
    where occurrence.student_id = p_student_id
      and occurrence.document_id = p_document_id
      and occurrence.fingerprint = item ->> 'fingerprint'
  );

  if v_current_count + v_new_count > 50000 then
    raise exception 'Grammar history limit reached' using errcode = '54000';
  end if;

  insert into public.writing_submission_issue_occurrences (
    id, student_id, document_id, submission_id, fingerprint, rule_id,
    title, message, original_text, suggested_text, sentence_text,
    detected_at, created_at
  )
  select
    (item ->> 'id')::uuid,
    p_student_id,
    p_document_id,
    v_submission_id,
    item ->> 'fingerprint',
    item ->> 'ruleId',
    item ->> 'title',
    item ->> 'message',
    item ->> 'originalText',
    item ->> 'suggestedText',
    item ->> 'sentenceText',
    (item ->> 'detectedAt')::timestamptz,
    now()
  from jsonb_array_elements(p_occurrences) item
  on conflict do nothing;

  get diagnostics v_inserted = row_count;

  return query
  select jsonb_array_length(p_occurrences), v_inserted;
end;
$$;

create or replace function public.writing_submission_list_occurrences(
  p_student_id uuid,
  p_document_id uuid,
  p_limit integer
)
returns table (
  id uuid,
  document_id uuid,
  fingerprint text,
  rule_id text,
  title text,
  message text,
  original_text text,
  suggested_text text,
  sentence_text text,
  detected_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if p_limit not between 1 and 2000 then
    raise exception 'Invalid occurrence limit' using errcode = '22023';
  end if;
  return query
  select occurrence.id, occurrence.document_id, occurrence.fingerprint,
         occurrence.rule_id, occurrence.title, occurrence.message,
         occurrence.original_text, occurrence.suggested_text,
         occurrence.sentence_text, occurrence.detected_at
  from public.writing_submission_issue_occurrences occurrence
  where occurrence.student_id = p_student_id
    and occurrence.document_id = p_document_id
  order by occurrence.detected_at, occurrence.id
  limit p_limit;
end;
$$;

create or replace function public.writing_submission_problem_summary(p_student_id uuid)
returns table (
  rule_id text,
  title text,
  occurrence_count bigint,
  first_seen_at timestamptz,
  last_seen_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select occurrence.rule_id,
         max(occurrence.title),
         count(*)::bigint,
         min(occurrence.detected_at),
         max(occurrence.detected_at)
  from public.writing_submission_issue_occurrences occurrence
  where occurrence.student_id = p_student_id
  group by occurrence.rule_id
  order by count(*) desc, max(occurrence.detected_at) desc, occurrence.rule_id
  limit 500;
$$;

create or replace function public.writing_submission_admin_list_students(p_admin_token uuid)
returns table (
  id uuid,
  name text,
  submission_count bigint,
  grammar_occurrence_count bigint,
  grammar_rule_count bigint,
  last_submission_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if public._writing_submission_admin_id(p_admin_token) is null then return; end if;
  return query
  select student.id, student.name,
         coalesce(submission_stats.submission_count, 0::bigint),
         coalesce(issue_stats.occurrence_count, 0::bigint),
         coalesce(issue_stats.rule_count, 0::bigint),
         submission_stats.last_submission_at
  from public.flashcard_students student
  left join (
    select submission.student_id, count(*)::bigint as submission_count,
           max(submission.submitted_at) as last_submission_at
    from public.writing_submissions submission
    group by submission.student_id
  ) submission_stats on submission_stats.student_id = student.id
  left join (
    select occurrence.student_id, count(*)::bigint as occurrence_count,
           count(distinct occurrence.rule_id)::bigint as rule_count
    from public.writing_submission_issue_occurrences occurrence
    group by occurrence.student_id
  ) issue_stats on issue_stats.student_id = student.id
  where student.deleted_at is null
  order by lower(student.name), student.id
  limit 5000;
end;
$$;

create or replace function public.writing_submission_admin_list_submissions(
  p_admin_token uuid,
  p_student_id uuid,
  p_limit integer,
  p_offset integer
)
returns table (
  id uuid,
  student_id uuid,
  student_name text,
  topic text,
  answer_preview text,
  word_count integer,
  submitted_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if public._writing_submission_admin_id(p_admin_token) is null then return; end if;
  if p_limit not between 1 and 101 or p_offset not between 0 and 1000000 then
    raise exception 'Invalid admin submission page' using errcode = '22023';
  end if;
  return query
  select submission.id, submission.student_id, student.name,
         submission.topic, left(submission.answer, 400),
         submission.word_count, submission.submitted_at
  from public.writing_submissions submission
  join public.flashcard_students student on student.id = submission.student_id
  where (p_student_id is null or submission.student_id = p_student_id)
    and student.deleted_at is null
  order by submission.submitted_at desc, submission.id desc
  limit p_limit offset p_offset;
end;
$$;

create or replace function public.writing_submission_admin_get_submission(
  p_admin_token uuid,
  p_id uuid
)
returns table (
  id uuid,
  student_id uuid,
  student_name text,
  topic text,
  answer text,
  word_count integer,
  submitted_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select submission.id, submission.student_id, student.name,
         submission.topic, submission.answer, submission.word_count,
         submission.submitted_at
  from public.writing_submissions submission
  join public.flashcard_students student on student.id = submission.student_id
  where public._writing_submission_admin_id(p_admin_token) is not null
    and submission.id = p_id
    and student.deleted_at is null
  limit 1;
$$;

create or replace function public.writing_submission_admin_list_occurrences(
  p_admin_token uuid,
  p_document_id uuid,
  p_limit integer
)
returns table (
  id uuid,
  document_id uuid,
  fingerprint text,
  rule_id text,
  title text,
  message text,
  original_text text,
  suggested_text text,
  sentence_text text,
  detected_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if public._writing_submission_admin_id(p_admin_token) is null then return; end if;
  if p_limit not between 1 and 2000 then
    raise exception 'Invalid admin occurrence limit' using errcode = '22023';
  end if;
  return query
  select occurrence.id, occurrence.document_id, occurrence.fingerprint,
         occurrence.rule_id, occurrence.title, occurrence.message,
         occurrence.original_text, occurrence.suggested_text,
         occurrence.sentence_text, occurrence.detected_at
  from public.writing_submission_issue_occurrences occurrence
  where occurrence.document_id = p_document_id
    and exists (
      select 1
      from public.writing_submissions submission
      join public.flashcard_students student on student.id = submission.student_id
      where submission.id = p_document_id
        and submission.student_id = occurrence.student_id
        and student.deleted_at is null
    )
  order by occurrence.detected_at, occurrence.id
  limit p_limit;
end;
$$;

-- Remove PostgreSQL's default PUBLIC execute privilege. Provisioning remains
-- owner-only; every browser-facing RPC is callable only by the Worker key.
revoke all on function public._writing_submission_word_count(text)
  from public, anon, authenticated, service_role;
revoke all on function public._writing_submission_occurrence_batch_valid(uuid, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public._writing_submission_revoke_admin_sessions()
  from public, anon, authenticated, service_role;
revoke all on function public._writing_submission_admin_id(uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.writing_submission_provision_admin(text, text)
  from public, anon, authenticated, service_role;
revoke all on function public.writing_submission_admin_login(text, text)
  from public, anon, authenticated, service_role;
revoke all on function public.writing_submission_admin_me(uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.writing_submission_admin_logout(uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.writing_submission_student_profile(uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.writing_submission_submit(uuid, uuid, text, text, integer)
  from public, anon, authenticated, service_role;
revoke all on function public.writing_submission_get(uuid, uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.writing_submission_list(uuid, integer, integer)
  from public, anon, authenticated, service_role;
revoke all on function public.writing_submission_record_issue_batch(uuid, uuid, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public.writing_submission_list_occurrences(uuid, uuid, integer)
  from public, anon, authenticated, service_role;
revoke all on function public.writing_submission_problem_summary(uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.writing_submission_admin_list_students(uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.writing_submission_admin_list_submissions(uuid, uuid, integer, integer)
  from public, anon, authenticated, service_role;
revoke all on function public.writing_submission_admin_get_submission(uuid, uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.writing_submission_admin_list_occurrences(uuid, uuid, integer)
  from public, anon, authenticated, service_role;

grant execute on function public.writing_submission_admin_login(text, text) to service_role;
grant execute on function public.writing_submission_admin_me(uuid) to service_role;
grant execute on function public.writing_submission_admin_logout(uuid) to service_role;
grant execute on function public.writing_submission_student_profile(uuid) to service_role;
grant execute on function public.writing_submission_submit(uuid, uuid, text, text, integer) to service_role;
grant execute on function public.writing_submission_get(uuid, uuid) to service_role;
grant execute on function public.writing_submission_list(uuid, integer, integer) to service_role;
grant execute on function public.writing_submission_record_issue_batch(uuid, uuid, jsonb) to service_role;
grant execute on function public.writing_submission_list_occurrences(uuid, uuid, integer) to service_role;
grant execute on function public.writing_submission_problem_summary(uuid) to service_role;
grant execute on function public.writing_submission_admin_list_students(uuid) to service_role;
grant execute on function public.writing_submission_admin_list_submissions(uuid, uuid, integer, integer) to service_role;
grant execute on function public.writing_submission_admin_get_submission(uuid, uuid) to service_role;
grant execute on function public.writing_submission_admin_list_occurrences(uuid, uuid, integer) to service_role;

notify pgrst, 'reload schema';

commit;
