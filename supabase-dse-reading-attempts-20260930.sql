-- Per-paper DSE Reading drafts and submissions. Answer keys are deliberately
-- absent: submitting records work for review and never invents a score.
create table if not exists public.dse_reading_attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  paper_id text not null check (paper_id ~ '^dse-20(1[2-9]|2[0-6])-(a|b1|b2)$' and paper_id <> 'dse-2024-a'),
  revision text not null check (char_length(revision) between 1 and 100),
  attempt_number integer not null check (attempt_number > 0),
  answers jsonb not null default '{}'::jsonb check (jsonb_typeof(answers) = 'object'),
  status text not null default 'draft' check (status in ('draft', 'submitted')),
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  submitted_at timestamptz,
  unique (student_id, paper_id, revision, attempt_number)
);
create unique index if not exists dse_reading_one_draft_idx
  on public.dse_reading_attempts(student_id, paper_id, revision) where status = 'draft';
create index if not exists dse_reading_attempts_student_idx
  on public.dse_reading_attempts(student_id, updated_at desc);
alter table public.dse_reading_attempts enable row level security;
revoke all on table public.dse_reading_attempts from public, anon, authenticated;

create or replace function public.dse_reading_attempt(
  p_token uuid, p_paper_id text, p_revision text,
  p_action text default 'get', p_attempt_id uuid default null,
  p_answers jsonb default null
) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_student uuid;
  v_row public.dse_reading_attempts%rowtype;
  v_key text;
  v_value jsonb;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  v_student := public.flashcard_session_student_id(p_token);
  if v_student is null then
    raise exception 'Invalid student session' using errcode = '42501';
  end if;
  if p_paper_id is null or p_paper_id !~ '^dse-20(1[2-9]|2[0-6])-(a|b1|b2)$'
     or p_paper_id = 'dse-2024-a'
     or p_revision is null or pg_catalog.char_length(p_revision) not between 1 and 100
     or p_action not in ('get', 'save', 'submit', 'new') then
    raise exception 'Invalid DSE paper request' using errcode = '22023';
  end if;
  if p_action in ('save', 'submit') then
    if pg_catalog.jsonb_typeof(p_answers) is distinct from 'object'
       or (select count(*) from pg_catalog.jsonb_object_keys(p_answers)) > 150
       or pg_catalog.length(p_answers::text) > 100000 then
      raise exception 'Invalid DSE answers' using errcode = '22023';
    end if;
    for v_key, v_value in select key, value from pg_catalog.jsonb_each(p_answers) loop
      if v_key !~ '^q[0-9]{1,3}(_[a-zA-Z0-9-]{1,25})?$'
         or pg_catalog.jsonb_typeof(v_value) <> 'string'
         or pg_catalog.char_length(v_value #>> '{}') > 1000 then
        raise exception 'Invalid DSE answer field' using errcode = '22023';
      end if;
    end loop;
  end if;

  if p_action = 'get' then
    select * into v_row from public.dse_reading_attempts
      where student_id = v_student and paper_id = p_paper_id and revision = p_revision
      order by (status = 'draft') desc, attempt_number desc limit 1;
  else
    perform pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended(v_student::text || ':' || p_paper_id || ':' || p_revision, 0)
    );
    if p_attempt_id is not null then
      select * into v_row from public.dse_reading_attempts
        where id = p_attempt_id and student_id = v_student
          and paper_id = p_paper_id and revision = p_revision for update;
      if not found then raise exception 'Attempt not found' using errcode = 'P0002'; end if;
    else
      select * into v_row from public.dse_reading_attempts
        where student_id = v_student and paper_id = p_paper_id
          and revision = p_revision and status = 'draft' for update;
    end if;
    if p_action = 'new' and v_row.id is null then
      insert into public.dse_reading_attempts(student_id, paper_id, revision, attempt_number)
      select v_student, p_paper_id, p_revision, coalesce(max(attempt_number), 0) + 1
      from public.dse_reading_attempts
      where student_id = v_student and paper_id = p_paper_id and revision = p_revision
      returning * into v_row;
    elsif p_action in ('save', 'submit') then
      if v_row.id is null then
        insert into public.dse_reading_attempts(student_id, paper_id, revision, attempt_number, answers)
        select v_student, p_paper_id, p_revision, coalesce(max(attempt_number), 0) + 1, p_answers
        from public.dse_reading_attempts
        where student_id = v_student and paper_id = p_paper_id and revision = p_revision
        returning * into v_row;
      elsif v_row.status = 'draft' then
        update public.dse_reading_attempts
          set answers = p_answers, updated_at = now()
          where id = v_row.id returning * into v_row;
      else
        raise exception 'Submitted attempts cannot be changed' using errcode = '22023';
      end if;
      if p_action = 'submit' then
        if v_row.answers = '{}'::jsonb then
          raise exception 'Answer at least one question before submission' using errcode = '22023';
        end if;
        update public.dse_reading_attempts
          set status = 'submitted', submitted_at = now(), updated_at = now()
          where id = v_row.id returning * into v_row;
      end if;
    end if;
  end if;
  if v_row.id is null then return null; end if;
  return pg_catalog.jsonb_build_object(
    'attempt_id', v_row.id, 'attempt_number', v_row.attempt_number,
    'paper_id', v_row.paper_id, 'revision', v_row.revision,
    'answers', v_row.answers, 'status', v_row.status,
    'updated_at', v_row.updated_at, 'submitted_at', v_row.submitted_at
  );
end;
$$;
revoke all on function public.dse_reading_attempt(uuid,text,text,text,uuid,jsonb) from public, anon, authenticated;
grant execute on function public.dse_reading_attempt(uuid,text,text,text,uuid,jsonb) to authenticated;
