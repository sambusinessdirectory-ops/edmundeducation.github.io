-- Passage prompts are public, while reference answers remain in this restricted table.
create table if not exists public.error_identifier_passage_answer_key (
  passage_id integer not null check (passage_id between 1 and 11),
  line_no integer not null check (line_no between 1 and 16),
  mark text not null check (mark in ('tick', 'cross')),
  wrong text not null default '',
  fix text not null default '',
  correct_sentence text not null,
  reason text not null,
  tip text not null default '',
  primary key (passage_id, line_no)
);
alter table public.error_identifier_passage_answer_key enable row level security;
revoke all on public.error_identifier_passage_answer_key from public, anon, authenticated;

create table if not exists public.error_identifier_passage_submissions (
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  passage_id integer not null check (passage_id between 1 and 11),
  answers jsonb not null default '{}'::jsonb check (pg_catalog.jsonb_typeof(answers) = 'object'),
  answered_count integer not null check (answered_count between 0 and 16),
  is_complete boolean not null default false,
  submitted_at timestamptz not null default now(),
  primary key (student_id, passage_id),
  check (pg_catalog.pg_column_size(answers) <= 12000)
);
alter table public.error_identifier_passage_submissions enable row level security;
revoke all on public.error_identifier_passage_submissions from public, anon, authenticated;

create or replace function public.error_identifier_passage_action(
  p_token uuid, p_passage_id integer, p_action text, p_answers jsonb default '{}'::jsonb
) returns jsonb language plpgsql security definer set search_path = ''
as $function$
declare
  v_student uuid;
  v_saved public.error_identifier_passage_submissions%rowtype;
  v_key text;
  v_answer jsonb;
  v_count integer := 0;
  v_start integer;
  v_end integer;
begin
  if (select auth.uid()) is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  v_student := public.flashcard_session_student_id(p_token);
  if v_student is null then raise exception 'Student session expired' using errcode = '42501'; end if;
  if p_passage_id not between 1 and 11 then raise exception 'Invalid passage' using errcode = '22023'; end if;
  if p_action = 'get' then
    select * into v_saved from public.error_identifier_passage_submissions
      where student_id = v_student and passage_id = p_passage_id;
    return pg_catalog.jsonb_build_object(
      'answers', coalesce(v_saved.answers, '{}'::jsonb),
      'answered_count', coalesce(v_saved.answered_count, 0),
      'is_complete', coalesce(v_saved.is_complete, false),
      'submitted_at', v_saved.submitted_at
    );
  end if;
  if p_action <> 'submit' then raise exception 'Invalid action' using errcode = '22023'; end if;
  if p_answers is null or pg_catalog.jsonb_typeof(p_answers) <> 'object'
    or pg_catalog.pg_column_size(p_answers) > 12000 then
    raise exception 'Invalid answers' using errcode = '22023';
  end if;
  for v_key, v_answer in select key, value from pg_catalog.jsonb_each(p_answers) loop
    if v_key !~ '^(?:[1-9]|1[0-6])$' or pg_catalog.jsonb_typeof(v_answer) <> 'object' then
      raise exception 'Invalid line or answer' using errcode = '22023';
    end if;
    if v_answer->>'mark' = 'tick' then
      if v_answer <> '{"mark":"tick"}'::jsonb then
        raise exception 'Invalid correct mark' using errcode = '22023';
      end if;
    elsif v_answer->>'mark' = 'cross' then
      if (v_answer->>'start') !~ '^[0-9]{1,2}$'
        or (v_answer->>'end') !~ '^[0-9]{1,2}$' then
        raise exception 'Select the incorrect word' using errcode = '22023';
      end if;
      v_start := (v_answer->>'start')::integer;
      v_end := (v_answer->>'end')::integer;
      if v_start > v_end or v_end > 40
        or pg_catalog.length(coalesce(v_answer->>'selected','')) not between 1 and 180
        or pg_catalog.length(coalesce(v_answer->>'correction','')) > 180
        or (coalesce(v_answer->>'remove','false') <> 'true'
          and pg_catalog.length(pg_catalog.btrim(coalesce(v_answer->>'correction',''))) = 0) then
        raise exception 'Complete the correction before submitting' using errcode = '22023';
      end if;
    else
      raise exception 'Choose correct or incorrect' using errcode = '22023';
    end if;
    v_count := v_count + 1;
  end loop;
  if v_count = 0 then raise exception 'Answer at least one line' using errcode = '22023'; end if;
  insert into public.error_identifier_passage_submissions
    (student_id, passage_id, answers, answered_count, is_complete, submitted_at)
  values (v_student, p_passage_id, p_answers, v_count, v_count = 16, pg_catalog.now())
  on conflict (student_id, passage_id) do update set
    answers = excluded.answers,
    answered_count = excluded.answered_count,
    is_complete = excluded.is_complete,
    submitted_at = excluded.submitted_at
  returning * into v_saved;
  return pg_catalog.jsonb_build_object(
    'answers', v_saved.answers, 'answered_count', v_saved.answered_count,
    'is_complete', v_saved.is_complete, 'submitted_at', v_saved.submitted_at
  );
end;
$function$;
revoke all on function public.error_identifier_passage_action(uuid,integer,text,jsonb) from public, anon, authenticated;
grant execute on function public.error_identifier_passage_action(uuid,integer,text,jsonb) to authenticated;

create or replace function public.error_identifier_passage_feedback(p_token uuid, p_passage_id integer)
returns jsonb language plpgsql stable security definer set search_path = ''
as $function$
declare
  v_student uuid;
  v_result jsonb;
begin
  if (select auth.uid()) is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  v_student := public.flashcard_session_student_id(p_token);
  if v_student is null then raise exception 'Student session expired' using errcode = '42501'; end if;
  if p_passage_id not between 1 and 11 then raise exception 'Invalid passage' using errcode = '22023'; end if;
  select coalesce(pg_catalog.jsonb_object_agg(k.line_no::text,
    pg_catalog.jsonb_build_object(
      'mark', k.mark, 'wrong', k.wrong, 'fix', k.fix,
      'correct_sentence', k.correct_sentence, 'reason', k.reason, 'tip', k.tip
    ) order by k.line_no), '{}'::jsonb)
  into v_result
  from public.error_identifier_passage_submissions s
  join public.error_identifier_passage_answer_key k
    on k.passage_id = s.passage_id and s.answers ? k.line_no::text
  where s.student_id = v_student and s.passage_id = p_passage_id;
  return v_result;
end;
$function$;
revoke all on function public.error_identifier_passage_feedback(uuid,integer) from public, anon, authenticated;
grant execute on function public.error_identifier_passage_feedback(uuid,integer) to authenticated;
