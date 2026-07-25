-- Sentence Structure: reliable bookmark replacement + lesson-level bookmarks.
-- Run once in the existing EdmundEducation Supabase project before publishing
-- the matching frontend/Worker. It is safe to run again.

begin;

create or replace function public._sentence_structure_bookmark_payload_valid(p_bookmarks jsonb)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_item jsonb;
  v_item_count integer;
  v_distinct_count integer;
begin
  if p_bookmarks is null
    or jsonb_typeof(p_bookmarks) <> 'array'
    or jsonb_array_length(p_bookmarks) > 6000
    or octet_length(p_bookmarks::text) > 524288
  then
    return false;
  end if;

  for v_item in
    select value
    from jsonb_array_elements(p_bookmarks)
  loop
    if jsonb_typeof(v_item) <> 'object'
      or (select count(*) from jsonb_object_keys(v_item)) <> 3
      or exists (
        select 1
        from jsonb_object_keys(v_item) as key_row(key_name)
        where key_name not in ('lessonId', 'questionId', 'includeAnswer')
      )
      or jsonb_typeof(v_item -> 'lessonId') <> 'string'
      or coalesce(v_item ->> 'lessonId', '') !~ '^ss([1-9]|[1-9][0-9]|10[0-9]|11[0-4])$'
      or jsonb_typeof(v_item -> 'questionId') <> 'string'
      or (
        coalesce(v_item ->> 'questionId', '') <> '__section__'
        and coalesce(v_item ->> 'questionId', '') !~ (
          '^' || (v_item ->> 'lessonId') || '-q(0[1-9]|[1-4][0-9]|50)$'
        )
      )
      or jsonb_typeof(v_item -> 'includeAnswer') <> 'boolean'
      or (
        coalesce(v_item ->> 'questionId', '') = '__section__'
        and v_item -> 'includeAnswer' <> 'false'::jsonb
      )
    then
      return false;
    end if;
  end loop;

  select count(*), count(distinct (
    value ->> 'lessonId',
    value ->> 'questionId'
  ))
  into v_item_count, v_distinct_count
  from jsonb_array_elements(p_bookmarks);

  return v_item_count = v_distinct_count;
end;
$$;

-- The original production table used an unnamed CHECK, which PostgreSQL named
-- `sentence_structure_bookmarks_check`. Newer installs use the explicit name.
-- Remove both idempotently before installing the combined section/question rule.
alter table public.sentence_structure_bookmarks
  drop constraint if exists sentence_structure_bookmarks_check;
alter table public.sentence_structure_bookmarks
  drop constraint if exists sentence_structure_bookmarks_question_id_check;
alter table public.sentence_structure_bookmarks
  add constraint sentence_structure_bookmarks_question_id_check
  check (
    (question_id = '__section__' and include_answer = false)
    or question_id ~ ('^' || lesson_id || '-q(0[1-9]|[1-4][0-9]|50)$')
  );

create or replace function public.sentence_structure_replace_bookmarks(
  p_student_id uuid,
  p_bookmarks jsonb
)
returns table (
  lesson_id text,
  question_id text,
  include_answer boolean,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.flashcard_students student
    where student.id = p_student_id
      and student.deleted_at is null
  ) then
    raise exception 'Active student not found' using errcode = '23503';
  end if;

  if not public._sentence_structure_bookmark_payload_valid(p_bookmarks) then
    raise exception 'Invalid Sentence Structure bookmarks' using errcode = '22023';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'sentence-structure-bookmarks:' || p_student_id::text,
      0
    )
  );

  insert into public.sentence_structure_bookmarks as bookmark (
    student_id,
    lesson_id,
    question_id,
    include_answer,
    created_at,
    updated_at
  )
  select
    p_student_id,
    item ->> 'lessonId',
    item ->> 'questionId',
    (item ->> 'includeAnswer')::boolean,
    now(),
    now()
  from jsonb_array_elements(p_bookmarks) item
  on conflict on constraint sentence_structure_bookmarks_pkey do update
  set include_answer = excluded.include_answer,
      updated_at = now();

  delete from public.sentence_structure_bookmarks bookmark
  where bookmark.student_id = p_student_id
    and not exists (
      select 1
      from jsonb_array_elements(p_bookmarks) item
      where item ->> 'lessonId' = bookmark.lesson_id
        and item ->> 'questionId' = bookmark.question_id
    );

  return query
  select
    bookmark.lesson_id,
    bookmark.question_id,
    bookmark.include_answer,
    bookmark.created_at
  from public.sentence_structure_bookmarks bookmark
  where bookmark.student_id = p_student_id
  order by bookmark.created_at desc, bookmark.lesson_id, bookmark.question_id;
end;
$$;

revoke all on function public._sentence_structure_bookmark_payload_valid(jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public.sentence_structure_replace_bookmarks(uuid, jsonb)
  from public, anon, authenticated, service_role;
grant execute on function public.sentence_structure_replace_bookmarks(uuid, jsonb)
  to service_role;

notify pgrst, 'reload schema';

commit;
