-- Churchill's annotations are stored privately, separately from the public
-- website bundle. The lesson is returned only to a valid speech account or
-- speech admin session.
create table speech_curation_private.lessons (
  slug text primary key,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table speech_curation_private.lessons enable row level security;

insert into speech_curation_private.lessons (slug) values ('churchill-1949');

insert into speech_curation_private.speeches(title, speaker, url, description)
select 'The Council of Europe, 1949', 'Winston Churchill',
  'https://edmundeducation.com/speech-curation-churchill.html',
  '1949 年歐洲團結與人權演說。逐句閱讀英文，按需要揭示中文翻譯與語言導讀。'
where not exists (
  select 1 from speech_curation_private.speeches
  where url = 'https://edmundeducation.com/speech-curation-churchill.html'
);

create or replace function public.speech_curation_lesson(
  p_slug text, p_account_token uuid default null, p_admin_token uuid default null
) returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare v_content jsonb;
begin
  if auth.uid() is null or p_slug <> 'churchill-1949' or not (
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
  select content into v_content from speech_curation_private.lessons where slug = p_slug;
  if v_content is null or v_content = '{}'::jsonb then raise exception 'Lesson unavailable'; end if;
  return v_content;
end $$;

revoke all on function public.speech_curation_lesson(text,uuid,uuid) from public, anon;
grant execute on function public.speech_curation_lesson(text,uuid,uuid) to authenticated;
