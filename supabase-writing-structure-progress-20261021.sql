-- Student-controlled confidence ticks for the Writing Submission sentence catalog.
begin;

create table if not exists public.writing_structure_progress (
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  structure_id text not null,
  updated_at timestamptz not null default now(),
  primary key (student_id, structure_id),
  constraint writing_structure_progress_id_check
    check (structure_id ~ '^S[0-9]{3}$'
      and substring(structure_id from 2)::integer between 1 and 789)
);

alter table public.writing_structure_progress enable row level security;
revoke all on table public.writing_structure_progress from public, anon, authenticated;

create or replace function public.writing_submission_structure_progress_get(p_student_id uuid)
returns table (structure_id text)
language sql stable security invoker set search_path = '' as $$
  select progress.structure_id
  from public.writing_structure_progress progress
  join public.flashcard_students student on student.id = progress.student_id
  where progress.student_id = p_student_id and student.deleted_at is null
  order by progress.structure_id;
$$;

create or replace function public.writing_submission_structure_progress_replace(
  p_student_id uuid, p_structures jsonb
)
returns table (structure_id text)
language plpgsql security invoker set search_path = '' as $$
declare
  v_count integer;
begin
  if p_student_id is null or p_structures is null
    or jsonb_typeof(p_structures) <> 'array'
    or octet_length(p_structures::text) > 12000
    or not exists (
      select 1 from public.flashcard_students student
      where student.id = p_student_id and student.deleted_at is null
    )
  then raise exception 'Invalid structure progress' using errcode = '22023'; end if;

  v_count := jsonb_array_length(p_structures);
  if v_count > 789 or exists (
    select 1 from jsonb_array_elements(p_structures) item
    where jsonb_typeof(item) <> 'string'
  ) or exists (
    select 1 from jsonb_array_elements_text(p_structures) selected(id)
    where selected.id !~ '^S[0-9]{3}$'
      or case when selected.id ~ '^S[0-9]{3}$'
        then substring(selected.id from 2)::integer not between 1 and 789
        else false end
  ) or v_count <> (
    select count(distinct selected.id) from jsonb_array_elements_text(p_structures) selected(id)
  ) then raise exception 'Invalid structure progress' using errcode = '22023'; end if;

  perform pg_advisory_xact_lock(pg_catalog.hashtextextended('writing-structure-progress:' || p_student_id::text, 0));
  delete from public.writing_structure_progress progress
  where progress.student_id = p_student_id
    and not exists (
      select 1 from jsonb_array_elements_text(p_structures) selected(id)
      where selected.id = progress.structure_id
    );
  insert into public.writing_structure_progress (student_id, structure_id, updated_at)
  select p_student_id, selected.id, clock_timestamp()
  from jsonb_array_elements_text(p_structures) selected(id)
  on conflict (student_id, structure_id) do nothing;

  return query
  select progress.structure_id from public.writing_structure_progress progress
  where progress.student_id = p_student_id order by progress.structure_id;
end;
$$;

revoke all on function public.writing_submission_structure_progress_get(uuid) from public, anon, authenticated;
revoke all on function public.writing_submission_structure_progress_replace(uuid,jsonb) from public, anon, authenticated;
grant execute on function public.writing_submission_structure_progress_get(uuid) to service_role;
grant execute on function public.writing_submission_structure_progress_replace(uuid,jsonb) to service_role;
grant select, insert, delete on public.writing_structure_progress to service_role;

commit;
