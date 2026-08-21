-- Secure bookmarks shared by newer learning portals (Grammar and Listening).
begin;

create table if not exists public.learning_portal_bookmarks (
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  system_key text not null check (system_key in ('grammar', 'listening')),
  item_key text not null check (char_length(item_key) between 1 and 180),
  title text not null check (char_length(title) between 1 and 300),
  detail text not null default '' check (char_length(detail) <= 3000),
  href text not null check (char_length(href) between 1 and 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (student_id, system_key, item_key)
);

alter table public.learning_portal_bookmarks enable row level security;
revoke all on table public.learning_portal_bookmarks from public, anon, authenticated;

create or replace function public.learning_portal_set_bookmark(
  p_token uuid,
  p_system_key text,
  p_item_key text,
  p_title text,
  p_detail text,
  p_href text,
  p_bookmarked boolean
)
returns table(item_key text, bookmarked boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  v_student_id := public.flashcard_session_student_id(p_token);
  if v_student_id is null then
    raise exception 'Invalid or expired student session' using errcode = '42501';
  end if;
  if p_system_key not in ('grammar', 'listening')
    or char_length(coalesce(p_item_key, '')) not between 1 and 180
    or char_length(coalesce(p_title, '')) not between 1 and 300
    or char_length(coalesce(p_detail, '')) > 3000
    or char_length(coalesce(p_href, '')) not between 1 and 500
    or p_href ~* '^(?:[a-z]+:|//)'
    or p_href like '%..%'
  then
    raise exception 'Invalid bookmark data' using errcode = '22023';
  end if;

  if coalesce(p_bookmarked, false) then
    insert into public.learning_portal_bookmarks(student_id, system_key, item_key, title, detail, href)
    values (v_student_id, p_system_key, p_item_key, p_title, coalesce(p_detail, ''), p_href)
    on conflict (student_id, system_key, item_key) do update
      set title = excluded.title, detail = excluded.detail, href = excluded.href, updated_at = now();
    return query select p_item_key, true;
  else
    delete from public.learning_portal_bookmarks bookmark
    where bookmark.student_id = v_student_id
      and bookmark.system_key = p_system_key
      and bookmark.item_key = p_item_key;
    return query select p_item_key, false;
  end if;
end;
$$;

create or replace function public.learning_portal_list_bookmarks(p_token uuid, p_system_key text)
returns table(item_key text, title text, detail text, href text, created_at timestamptz)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  v_student_id := public.flashcard_session_student_id(p_token);
  if v_student_id is null then
    raise exception 'Invalid or expired student session' using errcode = '42501';
  end if;
  if p_system_key not in ('grammar', 'listening') then
    raise exception 'Invalid system key' using errcode = '22023';
  end if;
  return query
    select bookmark.item_key, bookmark.title, bookmark.detail, bookmark.href, bookmark.created_at
    from public.learning_portal_bookmarks bookmark
    where bookmark.student_id = v_student_id and bookmark.system_key = p_system_key
    order by bookmark.created_at desc, bookmark.item_key;
end;
$$;

revoke all on function public.learning_portal_set_bookmark(uuid, text, text, text, text, text, boolean) from public, anon, authenticated;
grant execute on function public.learning_portal_set_bookmark(uuid, text, text, text, text, text, boolean) to authenticated;
revoke all on function public.learning_portal_list_bookmarks(uuid, text) from public, anon, authenticated;
grant execute on function public.learning_portal_list_bookmarks(uuid, text) to authenticated;

commit;
