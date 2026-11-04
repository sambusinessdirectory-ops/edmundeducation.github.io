-- The publication packages are encrypted on the static host. Only a current
-- student session can obtain the lesson key and its own session expiration.
create schema if not exists news_reader_private;
revoke all on schema news_reader_private from public, anon, authenticated;
create table if not exists news_reader_private.publications (
  slug text primary key,
  content_key bytea not null check (octet_length(content_key) = 32)
);
revoke all on news_reader_private.publications from public, anon, authenticated;
insert into news_reader_private.publications values
  ('florida-jewelry', decode(replace(gen_random_uuid()::text || gen_random_uuid()::text,'-',''),'hex'))
on conflict (slug) do nothing;

create or replace function public.news_reader_student_publication(p_student_token uuid)
returns table(student_name text, expires_at timestamptz, content_key text)
language sql stable security definer set search_path = '' as $$
  select student.name, student.session_expires_at, encode(lesson.content_key, 'hex')
  from public.song_appreciation_student_me(p_student_token) student
  cross join news_reader_private.publications lesson
  where lesson.slug = 'florida-jewelry';
$$;
revoke all on function public.news_reader_student_publication(uuid) from public;
grant execute on function public.news_reader_student_publication(uuid) to anon, authenticated;
