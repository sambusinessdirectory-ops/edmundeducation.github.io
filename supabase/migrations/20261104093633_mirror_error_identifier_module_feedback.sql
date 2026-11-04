-- Give Module 2 the same secure submit-and-reveal contract as Modules 1 and 3.
-- Reference answers remain private and are returned only for questions submitted
-- by the authenticated learner's linked student account.

create table error_identifier_private.indefinite_pronouns_progress (
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  number integer not null references error_identifier_private.indefinite_pronouns_key(number),
  answer jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (student_id, number)
);

alter table error_identifier_private.indefinite_pronouns_progress enable row level security;

create policy indefinite_pronouns_progress_deny_direct
on error_identifier_private.indefinite_pronouns_progress
for all
to authenticated
using (false)
with check (false);

revoke all on error_identifier_private.indefinite_pronouns_progress from public, anon, authenticated;

create function error_identifier_private.error_identifier_indefinite_action(
  p_token uuid,
  p_number integer default null,
  p_answer jsonb default null
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
  v_mark text;
  v_answer jsonb;
  v_result jsonb;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  v_student_id := public.flashcard_session_student_id(p_token);
  if v_student_id is null then
    raise exception 'Student session expired' using errcode = '42501';
  end if;

  if p_answer is not null then
    if p_number is null
      or p_number not between 1 and 200
      or jsonb_typeof(p_answer) <> 'object'
      or pg_column_size(p_answer) > 4000 then
      raise exception 'Invalid answer';
    end if;

    v_mark := coalesce(p_answer ->> 'mark', '');
    if v_mark not in ('tick', 'cross') then
      raise exception 'Invalid answer';
    end if;

    if v_mark = 'cross' and (
      length(trim(coalesce(p_answer ->> 'wrong', ''))) = 0
      or length(trim(coalesce(p_answer ->> 'fix', ''))) = 0
      or length(p_answer ->> 'wrong') > 180
      or length(p_answer ->> 'fix') > 180
    ) then
      raise exception 'Complete the correction';
    end if;

    v_answer := jsonb_build_object(
      'mark', v_mark,
      'wrong', case when v_mark = 'cross' then trim(p_answer ->> 'wrong') else '' end,
      'fix', case when v_mark = 'cross' then trim(p_answer ->> 'fix') else '' end
    );

    insert into error_identifier_private.indefinite_pronouns_progress (
      student_id,
      number,
      answer
    ) values (
      v_student_id,
      p_number,
      v_answer
    )
    on conflict (student_id, number) do update
      set answer = excluded.answer,
          updated_at = now();
  end if;

  select jsonb_build_object(
    'answers', coalesce(jsonb_object_agg(progress.number::text, progress.answer), '{}'::jsonb),
    'feedback', coalesce(jsonb_object_agg(progress.number::text, answer_key.data), '{}'::jsonb)
  )
  into v_result
  from error_identifier_private.indefinite_pronouns_progress as progress
  join error_identifier_private.indefinite_pronouns_key as answer_key using (number)
  where progress.student_id = v_student_id;

  return v_result;
end
$$;

revoke all on function error_identifier_private.error_identifier_indefinite_action(uuid, integer, jsonb)
from public, anon;
grant execute on function error_identifier_private.error_identifier_indefinite_action(uuid, integer, jsonb)
to authenticated;

create function public.error_identifier_indefinite_action(
  p_token uuid,
  p_number integer default null,
  p_answer jsonb default null
) returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select error_identifier_private.error_identifier_indefinite_action(p_token, p_number, p_answer)
$$;

revoke all on function public.error_identifier_indefinite_action(uuid, integer, jsonb)
from public, anon;
grant execute on function public.error_identifier_indefinite_action(uuid, integer, jsonb)
to authenticated;
