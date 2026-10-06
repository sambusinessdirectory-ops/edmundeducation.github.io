-- New speech editions remain private until their content and metadata pass QA.
alter table speech_curation_private.lessons
  add column if not exists published_at timestamptz;
update speech_curation_private.lessons
  set published_at = coalesce(published_at, now())
  where slug = 'churchill-1949' and content <> '{}'::jsonb;

-- The mark RPC already validates against the current lesson's JSON line count.
-- This table constraint must not retain the 1949 lesson's 221-line limit.
alter table speech_curation_private.reader_marks
  drop constraint reader_marks_line_index_check;
alter table speech_curation_private.reader_marks
  add constraint reader_marks_line_index_check check (line_index >= 0);

create or replace function public.speech_curation_lesson(
  p_slug text, p_account_token uuid default null, p_admin_token uuid default null
) returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare v_content jsonb;
begin
  if auth.uid() is null or not (
    exists (select 1 from speech_curation_private.admin_sessions s
      where s.token = p_admin_token and s.auth_uid = auth.uid() and s.expires_at > now())
    or exists (select 1 from speech_curation_private.account_sessions s
      join speech_curation_private.accounts a on a.id = s.account_id
      where s.token = p_account_token and s.auth_uid = auth.uid()
        and s.expires_at > now() and a.active)
    or exists (select 1 from public.flashcard_student_sessions s
      join public.flashcard_students st on st.id = s.student_id
      join speech_curation_private.accounts a on a.source_student_id = st.id
      where s.token = p_account_token and s.expires_at > now()
        and st.deleted_at is null and a.active)
  ) then raise exception 'Access denied'; end if;
  select l.content into v_content
    from speech_curation_private.lessons l
    where l.slug = p_slug and l.published_at is not null;
  if v_content is null or v_content = '{}'::jsonb then raise exception 'Lesson unavailable'; end if;
  return v_content;
end $$;

revoke all on function public.speech_curation_lesson(text,uuid,uuid) from public, anon;
grant execute on function public.speech_curation_lesson(text,uuid,uuid) to authenticated;
