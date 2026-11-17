begin;

create schema if not exists spelling_private;
revoke all on schema spelling_private from public, anon, authenticated;

create table if not exists spelling_private.attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  round_id uuid not null,
  started_at timestamptz not null,
  completed_at timestamptz,
  selected_count integer not null check (selected_count between 1 and 1000),
  required_correct integer not null check (required_correct between 1 and 100000),
  total_attempts integer not null default 0 check (total_attempts >= 0),
  correct_attempts integer not null default 0 check (correct_attempts >= 0 and correct_attempts <= total_attempts),
  duration_seconds integer not null default 0 check (duration_seconds >= 0),
  display_mode text not null check (display_mode in ('slots','line')),
  difficulty integer not null check (difficulty between 10 and 100),
  frequency integer not null check (frequency between 1 and 100),
  details jsonb not null default '[]'::jsonb check (jsonb_typeof(details) = 'array'),
  updated_at timestamptz not null default now(),
  unique (student_id, round_id)
);

alter table spelling_private.attempts enable row level security;

create index if not exists spelling_attempts_student_started_idx
  on spelling_private.attempts(student_id, started_at desc);

revoke all on table spelling_private.attempts from public, anon, authenticated;

create or replace function spelling_private.attempt_history(
  p_token uuid,
  p_action text default 'list',
  p_payload jsonb default '{}'::jsonb
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student uuid;
  v_round uuid;
begin
  if auth.uid() is null then
    raise exception 'Sign in required' using errcode = '28000';
  end if;
  v_student := public.flashcard_session_student_id(p_token);
  if v_student is null then
    raise exception 'Student session expired' using errcode = '28000';
  end if;

  if p_action = 'list' then
    return coalesce((
      select jsonb_agg(to_jsonb(a) - 'student_id' order by a.started_at desc)
      from (
        select * from spelling_private.attempts
        where student_id = v_student
        order by started_at desc
        limit 100
      ) a
    ), '[]'::jsonb);
  end if;

  if p_action <> 'upsert'
     or jsonb_typeof(p_payload) is distinct from 'object'
     or octet_length(p_payload::text) > 524288 then
    raise exception 'Invalid spelling history request' using errcode = '22023';
  end if;

  begin
    v_round := (p_payload ->> 'round_id')::uuid;
  exception when others then
    raise exception 'Invalid spelling round id' using errcode = '22023';
  end;

  if jsonb_typeof(coalesce(p_payload -> 'details', '[]'::jsonb)) is distinct from 'array' then
    raise exception 'Invalid spelling attempt details' using errcode = '22023';
  end if;

  insert into spelling_private.attempts(
    student_id, round_id, started_at, completed_at, selected_count,
    required_correct, total_attempts, correct_attempts, duration_seconds,
    display_mode, difficulty, frequency, details, updated_at
  ) values (
    v_student,
    v_round,
    coalesce((p_payload ->> 'started_at')::timestamptz, now()),
    nullif(p_payload ->> 'completed_at', '')::timestamptz,
    greatest(1, least(1000, coalesce((p_payload ->> 'selected_count')::integer, 1))),
    greatest(1, least(100000, coalesce((p_payload ->> 'required_correct')::integer, 1))),
    greatest(0, coalesce((p_payload ->> 'total_attempts')::integer, 0)),
    least(
      greatest(0, coalesce((p_payload ->> 'correct_attempts')::integer, 0)),
      greatest(0, coalesce((p_payload ->> 'total_attempts')::integer, 0))
    ),
    greatest(0, coalesce((p_payload ->> 'duration_seconds')::integer, 0)),
    case when p_payload ->> 'display_mode' = 'line' then 'line' else 'slots' end,
    greatest(10, least(100, coalesce((p_payload ->> 'difficulty')::integer, 50))),
    greatest(1, least(100, coalesce((p_payload ->> 'frequency')::integer, 2))),
    coalesce(p_payload -> 'details', '[]'::jsonb),
    now()
  )
  on conflict (student_id, round_id) do update set
    completed_at = excluded.completed_at,
    selected_count = excluded.selected_count,
    required_correct = excluded.required_correct,
    total_attempts = excluded.total_attempts,
    correct_attempts = least(excluded.correct_attempts, excluded.total_attempts),
    duration_seconds = excluded.duration_seconds,
    display_mode = excluded.display_mode,
    difficulty = excluded.difficulty,
    frequency = excluded.frequency,
    details = excluded.details,
    updated_at = now();

  return jsonb_build_object('ok', true, 'round_id', v_round);
end;
$$;

revoke all on function spelling_private.attempt_history(uuid,text,jsonb) from public, anon, authenticated;

create or replace function public.spelling_attempt_history(
  p_token uuid,
  p_action text default 'list',
  p_payload jsonb default '{}'::jsonb
) returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select spelling_private.attempt_history(p_token, p_action, p_payload);
$$;

revoke all on function public.spelling_attempt_history(uuid,text,jsonb) from public, anon, authenticated;
grant execute on function public.spelling_attempt_history(uuid,text,jsonb) to authenticated;

commit;
