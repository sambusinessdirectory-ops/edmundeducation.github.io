-- Reader state belongs to the independent speech account, so a mapped student
-- sees the same bookmarks whether entering through student or speech login.
create table speech_curation_private.reader_marks (
  owner_key text not null,
  slug text not null references speech_curation_private.lessons(slug) on delete cascade,
  line_index integer not null check (line_index between 0 and 220),
  kind text not null check (kind in ('view', 'line', 'idea')),
  idea_index integer not null default -1 check (idea_index between -1 and 30),
  saved_at timestamptz not null default now(),
  primary key (owner_key, slug, line_index, kind, idea_index),
  check ((kind = 'idea' and idea_index >= 0) or (kind <> 'idea' and idea_index = -1))
);
create index speech_reader_marks_recent on speech_curation_private.reader_marks(owner_key, saved_at desc);
alter table speech_curation_private.reader_marks enable row level security;

create or replace function speech_curation_private.reader_identity(
  p_account_token uuid, p_admin_token uuid
) returns table(owner_key text, is_student boolean)
language plpgsql stable security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Access denied'; end if;
  return query
    select 'account:' || a.id::text, a.source_student_id is not null
    from speech_curation_private.account_sessions s
    join speech_curation_private.accounts a on a.id = s.account_id
    where s.token = p_account_token and s.auth_uid = auth.uid()
      and s.expires_at > now() and a.active
    limit 1;
  if found then return; end if;
  return query
    select 'account:' || a.id::text, true
    from public.flashcard_student_sessions s
    join public.flashcard_students st on st.id = s.student_id
    join speech_curation_private.accounts a on a.source_student_id = st.id
    where s.token = p_account_token and s.expires_at > now()
      and st.deleted_at is null and a.active
    limit 1;
  if found then return; end if;
  return query
    select 'admin:' || s.admin_name, false
    from speech_curation_private.admin_sessions s
    where s.token = p_admin_token and s.auth_uid = auth.uid()
      and s.expires_at > now()
    limit 1;
  if not found then raise exception 'Access denied'; end if;
end $$;
revoke all on function speech_curation_private.reader_identity(uuid,uuid) from public, anon, authenticated;

create or replace function public.speech_curation_reader_state(
  p_slug text, p_account_token uuid default null, p_admin_token uuid default null
) returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare v_owner text; v_student boolean; v_marks jsonb;
begin
  select i.owner_key, i.is_student into v_owner, v_student
    from speech_curation_private.reader_identity(p_account_token, p_admin_token) i;
  if not exists (select 1 from speech_curation_private.lessons where slug = p_slug)
    then raise exception 'Lesson unavailable'; end if;
  select coalesce(jsonb_agg(jsonb_build_object(
    'line_index', m.line_index, 'kind', m.kind,
    'idea_index', m.idea_index, 'saved_at', m.saved_at
  ) order by m.saved_at desc), '[]'::jsonb) into v_marks
  from speech_curation_private.reader_marks m
  where m.owner_key = v_owner and m.slug = p_slug;
  return jsonb_build_object('is_student', v_student, 'marks', v_marks);
end $$;

create or replace function public.speech_curation_reader_mark(
  p_slug text, p_line_index integer, p_kind text, p_idea_index integer,
  p_active boolean, p_account_token uuid default null, p_admin_token uuid default null
) returns boolean language plpgsql security definer set search_path = '' as $$
declare v_owner text; v_line_count integer; v_note_count integer;
begin
  select i.owner_key into v_owner
    from speech_curation_private.reader_identity(p_account_token, p_admin_token) i;
  select jsonb_array_length(content -> 'lines') into v_line_count
    from speech_curation_private.lessons where slug = p_slug;
  if v_line_count is null or p_line_index is null or p_line_index < 0
     or p_line_index >= v_line_count or p_kind not in ('view','line','idea')
     or (p_kind = 'idea' and (p_idea_index is null or p_idea_index < 0 or p_idea_index > 30))
     or (p_kind <> 'idea' and p_idea_index <> -1)
    then raise exception 'Invalid reader mark'; end if;
  if p_kind = 'idea' then
    select jsonb_array_length(content -> 'lines' -> p_line_index -> 'notes') into v_note_count
      from speech_curation_private.lessons where slug = p_slug;
    if v_note_count is null or p_idea_index >= v_note_count
      then raise exception 'Invalid reader idea'; end if;
  end if;
  if p_kind = 'view' or coalesce(p_active, false) then
    insert into speech_curation_private.reader_marks(owner_key, slug, line_index, kind, idea_index)
      values (v_owner, p_slug, p_line_index, p_kind, p_idea_index)
      on conflict (owner_key, slug, line_index, kind, idea_index) do nothing;
    return true;
  end if;
  delete from speech_curation_private.reader_marks m
    where m.owner_key = v_owner and m.slug = p_slug and m.line_index = p_line_index
      and m.kind = p_kind and m.idea_index = p_idea_index;
  return false;
end $$;

revoke all on function public.speech_curation_reader_state(text,uuid,uuid) from public, anon;
revoke all on function public.speech_curation_reader_mark(text,integer,text,integer,boolean,uuid,uuid) from public, anon;
grant execute on function public.speech_curation_reader_state(text,uuid,uuid) to authenticated;
grant execute on function public.speech_curation_reader_mark(text,integer,text,integer,boolean,uuid,uuid) to authenticated;
