create or replace function public.synonyms_progress_overview(p_token uuid)
returns table(module_id text, answered integer, mastered integer)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
begin
  if auth.uid() is null or p_token is null then
    raise exception 'Student authentication is required' using errcode = '42501';
  end if;

  select session.student_id
  into v_student_id
  from public.flashcard_student_sessions session
  join public.flashcard_students student on student.id = session.student_id
  where session.token = p_token
    and session.expires_at > pg_catalog.now()
    and student.deleted_at is null
  limit 1;

  if v_student_id is null then
    raise exception 'Student session is invalid or expired' using errcode = '42501';
  end if;

  return query
  select
    case
      when a.question_key ~ '^[0-9]+-[0-9]+$' then 'important'
      when a.question_key like 'social-%' then 'social-media'
      else pg_catalog.regexp_replace(a.question_key, '-[0-9]+-[0-9]+$', '')
    end as module_id,
    pg_catalog.count(*)::integer as answered,
    pg_catalog.count(*) filter (where a.mastered)::integer as mastered
  from public.synonyms_important_answers a
  where a.student_id = v_student_id
  group by 1
  order by 1;
end;
$$;

revoke all on function public.synonyms_progress_overview(uuid)
  from public, anon, authenticated;
grant execute on function public.synonyms_progress_overview(uuid) to authenticated;

notify pgrst, 'reload schema';
