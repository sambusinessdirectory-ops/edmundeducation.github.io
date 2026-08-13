-- Video class library expansion: multi-course lessons/series, private PDF
-- attachments, paged catalogues and editable/paged lesson feedback.
--
-- Apply only after the existing supabase-video-class.sql live schema. This is
-- intentionally incremental: it does not replay historical rollouts, student
-- keys, administrator accounts, catalogue seed data, or the pilot lesson.

begin;

set local lock_timeout = '15s';
set local statement_timeout = '0';

-- Prevent two operators from applying this migration concurrently.
select pg_catalog.pg_advisory_xact_lock(
  pg_catalog.hashtextextended('edmund-video-class-library-expansion-v1', 0)
);

do $$
begin
  if to_regclass('public.video_class_lessons') is null
    or to_regclass('public.video_class_courses') is null
    or to_regclass('public.video_class_official_playlists') is null
    or to_regclass('public.video_class_lesson_feedback') is null
    or to_regprocedure('public._video_class_worker_ok(text)') is null
    or to_regprocedure('public._video_class_admin_id(uuid)') is null
    or to_regprocedure('public._video_class_student_id(uuid)') is null
  then
    raise exception 'Install the existing video class schema before this incremental migration';
  end if;
end;
$$;

-- Hold the source catalogues stable while their one-to-many memberships are
-- backfilled and the insert trigger is installed. A short lock timeout makes
-- a busy deployment fail cleanly instead of waiting indefinitely.
lock table public.video_class_lessons,
  public.video_class_official_playlists,
  public.video_class_admin_audit_events
in share row exclusive mode;

create table if not exists public.video_class_lesson_courses (
  lesson_id uuid not null references public.video_class_lessons(id) on delete cascade,
  course_code text not null references public.video_class_courses(code)
    on update cascade on delete cascade,
  created_at timestamptz not null default now(),
  created_by uuid references public.video_class_admin_accounts(id) on delete set null,
  primary key (lesson_id, course_code)
);

create index if not exists video_class_lesson_courses_course_idx
  on public.video_class_lesson_courses (course_code, lesson_id);
create index if not exists video_class_lesson_courses_created_by_idx
  on public.video_class_lesson_courses (created_by)
  where created_by is not null;

create table if not exists public.video_class_official_playlist_courses (
  playlist_id uuid not null references public.video_class_official_playlists(id) on delete cascade,
  course_code text not null references public.video_class_courses(code)
    on update cascade on delete cascade,
  created_at timestamptz not null default now(),
  created_by uuid references public.video_class_admin_accounts(id) on delete set null,
  primary key (playlist_id, course_code)
);

create index if not exists video_class_official_playlist_courses_course_idx
  on public.video_class_official_playlist_courses (course_code, playlist_id);
create index if not exists video_class_official_playlist_courses_created_by_idx
  on public.video_class_official_playlist_courses (created_by)
  where created_by is not null;

create table if not exists public.video_class_lesson_attachments (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.video_class_lessons(id) on delete cascade,
  display_name text not null check (length(trim(display_name)) between 1 and 180),
  object_key text not null unique check (length(object_key) between 1 and 900),
  content_type text not null default 'application/pdf'
    check (content_type = 'application/pdf'),
  byte_length bigint not null check (byte_length > 0 and byte_length <= 1073741824),
  is_private boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.video_class_admin_accounts(id) on delete set null
);

create index if not exists video_class_attachments_lesson_visible_idx
  on public.video_class_lesson_attachments (lesson_id, sort_order, created_at, id)
  where is_private = false;
create index if not exists video_class_attachments_lesson_order_idx
  on public.video_class_lesson_attachments (lesson_id, sort_order, created_at, id);
create index if not exists video_class_attachments_created_by_idx
  on public.video_class_lesson_attachments (created_by)
  where created_by is not null;
create index if not exists video_class_lesson_feedback_admin_page_idx
  on public.video_class_lesson_feedback (updated_at desc, student_id, lesson_id);
create index if not exists video_class_student_playlist_items_order_idx
  on public.video_class_student_playlist_items (playlist_id, created_at, lesson_id);

insert into public.video_class_lesson_courses (lesson_id, course_code, created_by)
select lesson.id, lesson.course_code, lesson.created_by
from public.video_class_lessons lesson
on conflict (lesson_id, course_code) do nothing;

insert into public.video_class_official_playlist_courses (
  playlist_id, course_code, created_by
)
select playlist.id, playlist.course_code, playlist.created_by
from public.video_class_official_playlists playlist
on conflict (playlist_id, course_code) do nothing;

alter table public.video_class_lesson_courses enable row level security;
alter table public.video_class_official_playlist_courses enable row level security;
alter table public.video_class_lesson_attachments enable row level security;

revoke all on table public.video_class_lesson_courses from public, anon, authenticated;
revoke all on table public.video_class_official_playlist_courses from public, anon, authenticated;
revoke all on table public.video_class_lesson_attachments from public, anon, authenticated;

-- Extend the existing audit allow-list before any new mutation RPC can write.
do $$
begin
  if exists (
    select 1 from pg_catalog.pg_constraint constraint_record
    where constraint_record.conrelid = 'public.video_class_admin_audit_events'::regclass
      and constraint_record.conname = 'video_class_admin_audit_events_action_check'
  ) then
    alter table public.video_class_admin_audit_events
      drop constraint video_class_admin_audit_events_action_check;
  end if;
  alter table public.video_class_admin_audit_events
    add constraint video_class_admin_audit_events_action_check
    check (action in (
      'issue_key', 'rotate_key', 'clear_key', 'enable_access', 'disable_access',
      'enable_course', 'disable_course', 'enable_watermark', 'disable_watermark',
      'private_lesson', 'unprivate_lesson', 'publish_lesson',
      'set_lesson_courses', 'save_official_playlist', 'add_lesson_attachment',
      'private_attachment', 'unprivate_attachment', 'delete_lesson_attachment',
      'edit_lesson_feedback', 'delete_lesson_feedback'
    )) not valid;
  alter table public.video_class_admin_audit_events
    validate constraint video_class_admin_audit_events_action_check;
end;
$$;

create or replace function public.video_class_seed_primary_lesson_course()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.video_class_lesson_courses (lesson_id, course_code, created_by)
  values (new.id, new.course_code, new.created_by)
  on conflict (lesson_id, course_code) do nothing;
  return new;
end;
$$;

create or replace function public.video_class_validate_official_playlist_item()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.video_class_official_playlists playlist
    where playlist.id = new.playlist_id
  ) then
    raise exception 'Official playlist does not exist';
  end if;

  if not exists (
    select 1
    from public.video_class_lessons lesson
    where lesson.id = new.lesson_id
  ) then
    raise exception 'Official playlist lesson does not exist';
  end if;

  if not exists (
    select 1
    from public.video_class_official_playlist_courses playlist_course
    join public.video_class_lesson_courses lesson_course
      on lesson_course.course_code = playlist_course.course_code
     and lesson_course.lesson_id = new.lesson_id
    where playlist_course.playlist_id = new.playlist_id
  ) then
    raise exception 'Official playlist and lesson must share at least one course';
  end if;

  return new;
end;
$$;

create or replace function public.video_class_revoke_playbacks_on_course_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid := coalesce(old.student_id, new.student_id);
  v_course_code text := coalesce(old.course_code, new.course_code);
begin
  if tg_op = 'DELETE'
    or old.student_id is distinct from new.student_id
    or old.course_code is distinct from new.course_code
    or old.enabled is distinct from new.enabled
  then
    update public.video_class_playback_sessions playback
    set revoked_at = coalesce(playback.revoked_at, now())
    from public.video_class_lesson_courses lesson_course
    where playback.lesson_id = lesson_course.lesson_id
      and playback.student_id = v_student_id
      and lesson_course.course_code = v_course_code
      and playback.revoked_at is null;
  end if;
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create or replace function public._video_class_student_can_view_lesson(
  p_student_id uuid,
  p_lesson_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_student_id is not null
    and p_lesson_id is not null
    and exists (
      select 1
      from public.video_class_lessons lesson
      join public.video_class_lesson_courses lesson_course
        on lesson_course.lesson_id = lesson.id
      join public.video_class_courses course
        on course.code = lesson_course.course_code and course.published = true
      join public.video_class_student_courses access
        on access.student_id = p_student_id
       and access.course_code = lesson_course.course_code
       and access.enabled = true
      where lesson.id = p_lesson_id
        and lesson.published = true
    );
$$;

create or replace function public._video_class_student_playlist_json(
  p_student_id uuid,
  p_playlist_id uuid
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', playlist.id,
    'name', playlist.name,
    'lesson_ids', coalesce(item_state.lesson_ids, '[]'::jsonb),
    'lesson_count', coalesce(item_state.lesson_count, 0),
    'created_at', playlist.created_at,
    'updated_at', playlist.updated_at
  )
  from public.video_class_student_playlists playlist
  left join lateral (
    select
      jsonb_agg(item.lesson_id order by lesson.sort_order, lesson.created_at, lesson.id) as lesson_ids,
      count(*)::integer as lesson_count
    from public.video_class_student_playlist_items item
    join public.video_class_lessons lesson
      on lesson.id = item.lesson_id
     and lesson.published = true
    where item.playlist_id = playlist.id
      and public._video_class_student_can_view_lesson(p_student_id, lesson.id)
  ) item_state on true
  where playlist.id = p_playlist_id
    and playlist.student_id = p_student_id
  limit 1;
$$;

create or replace function public.video_class_student_list_courses(
  p_service_secret text,
  p_student_token uuid
)
returns table (
  course_code text,
  title text,
  sort_order integer,
  lesson_count bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
begin
  if not public._video_class_worker_ok(p_service_secret) then
    return;
  end if;
  v_student_id := public._video_class_student_id(p_student_token);
  if v_student_id is null then
    return;
  end if;

  return query
  select
    course.code,
    course.title,
    course.sort_order,
    count(lesson.id)::bigint
  from public.video_class_student_courses access
  join public.video_class_courses course
    on course.code = access.course_code and course.published = true
  left join public.video_class_lesson_courses lesson_course
    on lesson_course.course_code = course.code
  left join public.video_class_lessons lesson
    on lesson.id = lesson_course.lesson_id and lesson.published = true
  where access.student_id = v_student_id
    and access.enabled = true
  group by course.code, course.title, course.sort_order
  order by course.sort_order, course.code;
end;
$$;

create or replace function public.video_class_student_list_lessons(
  p_service_secret text,
  p_student_token uuid
)
returns table (
  lesson_id uuid,
  slug text,
  title text,
  description text,
  course_code text,
  course_title text,
  course_sort_order integer,
  course_label text,
  duration_seconds integer,
  sort_order integer,
  is_private boolean,
  resume_seconds numeric,
  completed_at timestamptz,
  progress_updated_at timestamptz,
  bookmarked boolean,
  note text,
  note_updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
begin
  if not public._video_class_worker_ok(p_service_secret) or p_student_token is null then
    return;
  end if;

  v_student_id := public._video_class_student_id(p_student_token);

  if v_student_id is null then
    return;
  end if;

  return query
  select
    lesson.id,
    lesson.slug,
    lesson.title,
    lesson.description,
    lesson.course_code,
    course.title,
    course.sort_order,
    lesson.course_label,
    lesson.duration_seconds,
    lesson.sort_order,
    lesson.is_private,
    coalesce(progress.position_seconds, 0),
    progress.completed_at,
    progress.updated_at,
    (bookmark.student_id is not null),
    note.note,
    note.updated_at
  from public.video_class_lessons lesson
  join public.video_class_courses course
    on course.code = lesson.course_code and course.published = true
  left join public.video_class_progress progress
    on progress.lesson_id = lesson.id and progress.student_id = v_student_id
  left join public.video_class_bookmarks bookmark
    on bookmark.lesson_id = lesson.id and bookmark.student_id = v_student_id
  left join public.video_class_notes note
    on note.lesson_id = lesson.id and note.student_id = v_student_id
  where lesson.published = true
    and public._video_class_student_can_view_lesson(v_student_id, lesson.id)
  order by course.sort_order, lesson.sort_order, lesson.created_at, lesson.id;
end;
$$;

create or replace function public.video_class_student_toggle_bookmark(
  p_service_secret text,
  p_student_token uuid,
  p_lesson_id uuid,
  p_bookmarked boolean
)
returns table (
  lesson_id uuid,
  bookmarked boolean,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
  v_updated_at timestamptz := clock_timestamp();
begin
  if not public._video_class_worker_ok(p_service_secret)
    or p_lesson_id is null
    or p_bookmarked is null
  then
    return;
  end if;
  v_student_id := public._video_class_student_id(p_student_token);
  if v_student_id is null
    or not public._video_class_student_can_view_lesson(v_student_id, p_lesson_id)
  then
    return;
  end if;

  if p_bookmarked then
    insert into public.video_class_bookmarks (student_id, lesson_id)
    values (v_student_id, p_lesson_id)
    on conflict on constraint video_class_bookmarks_pkey do nothing;

    select bookmark.created_at into v_updated_at
    from public.video_class_bookmarks bookmark
    where bookmark.student_id = v_student_id
      and bookmark.lesson_id = p_lesson_id;
  else
    delete from public.video_class_bookmarks bookmark
    where bookmark.student_id = v_student_id
      and bookmark.lesson_id = p_lesson_id;
  end if;

  return query select p_lesson_id, p_bookmarked, v_updated_at;
end;
$$;

create or replace function public.video_class_student_save_note(
  p_service_secret text,
  p_student_token uuid,
  p_lesson_id uuid,
  p_note text
)
returns table (
  lesson_id uuid,
  note text,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
  v_updated_at timestamptz := clock_timestamp();
begin
  if not public._video_class_worker_ok(p_service_secret)
    or p_lesson_id is null
    or p_note is null
    or length(p_note) > 5000
  then
    return;
  end if;
  v_student_id := public._video_class_student_id(p_student_token);
  if v_student_id is null
    or not public._video_class_student_can_view_lesson(v_student_id, p_lesson_id)
  then
    return;
  end if;

  if length(trim(p_note)) = 0 then
    delete from public.video_class_notes saved_note
    where saved_note.student_id = v_student_id
      and saved_note.lesson_id = p_lesson_id;
    return query select p_lesson_id, null::text, v_updated_at;
    return;
  end if;

  insert into public.video_class_notes as saved_note (student_id, lesson_id, note)
  values (v_student_id, p_lesson_id, p_note)
  on conflict on constraint video_class_notes_pkey do update
  set note = excluded.note,
      updated_at = now()
  returning saved_note.updated_at into v_updated_at;

  return query select p_lesson_id, p_note, v_updated_at;
end;
$$;

create or replace function public.video_class_student_library_page(
  p_service_secret text,
  p_student_token uuid,
  p_limit integer default 60,
  p_after_cursor text default null,
  p_course_code text default null,
  p_query text default '',
  p_view text default 'library',
  p_playlist_id uuid default null
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
  v_course_code text := nullif(lower(btrim(coalesce(p_course_code, ''))), '');
  v_query text := lower(btrim(coalesce(p_query, '')));
  v_view text := lower(btrim(coalesce(p_view, 'library')));
  v_after_sort integer;
  v_after_created timestamptz;
  v_after_id uuid;
  v_result jsonb;
begin
  if not public._video_class_worker_ok(p_service_secret)
    or p_student_token is null
    or coalesce(p_limit, 0) not between 1 and 100
    or length(v_query) > 100
    or v_view not in ('library', 'bookmarks', 'notes', 'playlist', 'official')
    or (v_view in ('playlist', 'official') and p_playlist_id is null)
    or (v_course_code is not null and v_course_code !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
  then
    return null;
  end if;
  v_student_id := public._video_class_student_id(p_student_token);
  if v_student_id is null then return null; end if;
  if p_after_cursor is not null then
    if p_after_cursor !~ '^-?[0-9]{1,10}\|[0-9]{1,11}(?:\.[0-9]{1,6})?\|[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$'
      or split_part(p_after_cursor, '|', 1)::numeric not between -2147483648 and 2147483647
      or split_part(p_after_cursor, '|', 2)::numeric not between 0 and 32503680000
    then
      return null;
    end if;
    v_after_sort := split_part(p_after_cursor, '|', 1)::integer;
    v_after_created := to_timestamp(split_part(p_after_cursor, '|', 2)::double precision);
    v_after_id := split_part(p_after_cursor, '|', 3)::uuid;
  end if;

  with eligible as materialized (
    select lesson.*, display_course.code as display_course_code,
      display_course.title as course_title,
      display_course.sort_order as course_sort_order,
      case
        when v_view = 'official' then coalesce((
          select item.sort_order
          from public.video_class_official_playlist_items item
          where item.playlist_id = p_playlist_id and item.lesson_id = lesson.id
        ), lesson.sort_order)
        when v_view = 'playlist' then coalesce((
          select count(*)::integer
          from public.video_class_student_playlist_items current_item
          join public.video_class_student_playlist_items preceding
            on preceding.playlist_id = current_item.playlist_id
           and (preceding.created_at, preceding.lesson_id)
             <= (current_item.created_at, current_item.lesson_id)
          where current_item.playlist_id = p_playlist_id
            and current_item.lesson_id = lesson.id
        ), lesson.sort_order)
        else lesson.sort_order
      end as page_sort_order
    from public.video_class_lessons lesson
    join lateral (
      select course.code, course.title, course.sort_order
      from public.video_class_lesson_courses membership
      join public.video_class_courses course
        on course.code = membership.course_code and course.published = true
      join public.video_class_student_courses access
        on access.student_id = v_student_id
       and access.course_code = membership.course_code
       and access.enabled = true
      where membership.lesson_id = lesson.id
      order by
        (v_course_code is not null and membership.course_code = v_course_code) desc,
        (membership.course_code = lesson.course_code) desc,
        course.sort_order,
        course.code
      limit 1
    ) display_course on true
    where lesson.published = true
      and public._video_class_student_can_view_lesson(v_student_id, lesson.id)
      and (
        v_view = 'library'
        or (v_view = 'bookmarks' and exists (
          select 1 from public.video_class_bookmarks saved
          where saved.student_id = v_student_id and saved.lesson_id = lesson.id
        ))
        or (v_view = 'notes' and exists (
          select 1 from public.video_class_notes saved
          where saved.student_id = v_student_id and saved.lesson_id = lesson.id
            and length(trim(saved.note)) > 0
        ))
        or (v_view = 'playlist' and exists (
          select 1
          from public.video_class_student_playlists playlist
          join public.video_class_student_playlist_items item on item.playlist_id = playlist.id
          where playlist.id = p_playlist_id and playlist.student_id = v_student_id
            and item.lesson_id = lesson.id
        ))
        or (v_view = 'official' and exists (
          select 1
          from public.video_class_official_playlists playlist
          join public.video_class_official_playlist_items item on item.playlist_id = playlist.id
          join public.video_class_official_playlist_courses playlist_course
            on playlist_course.playlist_id = playlist.id
          join public.video_class_lesson_courses lesson_course
            on lesson_course.lesson_id = lesson.id
           and lesson_course.course_code = playlist_course.course_code
          join public.video_class_student_courses access
            on access.student_id = v_student_id
           and access.course_code = playlist_course.course_code
           and access.enabled = true
          join public.video_class_courses shared_course
            on shared_course.code = playlist_course.course_code
           and shared_course.published = true
          where playlist.id = p_playlist_id and playlist.published = true
            and item.lesson_id = lesson.id
        ))
      )
      and (
        v_course_code is null
        or exists (
          select 1
          from public.video_class_lesson_courses membership
          join public.video_class_courses course
            on course.code = membership.course_code and course.published = true
          join public.video_class_student_courses access
            on access.student_id = v_student_id
           and access.course_code = membership.course_code
           and access.enabled = true
          where membership.lesson_id = lesson.id
            and membership.course_code = v_course_code
        )
      )
      and (
        length(v_query) = 0
        or lower(lesson.title) like '%' || v_query || '%'
        or lower(lesson.description) like '%' || v_query || '%'
        or exists (
          select 1
          from public.video_class_lesson_tags lesson_tag
          join public.video_class_tags tag on tag.id = lesson_tag.tag_id and tag.published = true
          where lesson_tag.lesson_id = lesson.id
            and (lower(tag.label) like '%' || v_query || '%' or lower(tag.slug) like '%' || v_query || '%')
        )
        or exists (
          select 1
          from public.video_class_student_playlist_items item
          join public.video_class_student_playlists playlist on playlist.id = item.playlist_id
          where item.lesson_id = lesson.id and playlist.student_id = v_student_id
            and lower(playlist.name) like '%' || v_query || '%'
        )
        or exists (
          select 1
          from public.video_class_official_playlist_items item
          join public.video_class_official_playlists playlist
            on playlist.id = item.playlist_id and playlist.published = true
          join public.video_class_official_playlist_courses playlist_course
            on playlist_course.playlist_id = playlist.id
          join public.video_class_lesson_courses lesson_course
            on lesson_course.lesson_id = lesson.id
           and lesson_course.course_code = playlist_course.course_code
          join public.video_class_student_courses access
            on access.student_id = v_student_id
           and access.course_code = playlist_course.course_code
           and access.enabled = true
          join public.video_class_courses shared_course
            on shared_course.code = playlist_course.course_code
           and shared_course.published = true
          where item.lesson_id = lesson.id
            and lower(playlist.name) like '%' || v_query || '%'
        )
      )
  ), candidates as materialized (
    select lesson.* from eligible lesson
    where p_after_cursor is null
      or (lesson.page_sort_order, lesson.created_at, lesson.id) > (v_after_sort, v_after_created, v_after_id)
    order by lesson.page_sort_order, lesson.created_at, lesson.id
    limit p_limit + 1
  ), page as materialized (
    select * from candidates order by page_sort_order, created_at, id limit p_limit
  )
  select jsonb_build_object(
    'lessons', coalesce((
      select jsonb_agg(jsonb_build_object(
        'lesson_id', lesson.id,
        'slug', lesson.slug,
        'title', lesson.title,
        'description', lesson.description,
        'course_code', lesson.display_course_code,
        'course_codes', coalesce((
          select jsonb_agg(membership.course_code order by course.sort_order, membership.course_code)
          from public.video_class_lesson_courses membership
          join public.video_class_courses course
            on course.code = membership.course_code and course.published = true
          join public.video_class_student_courses access
            on access.student_id = v_student_id
           and access.course_code = membership.course_code
           and access.enabled = true
          where membership.lesson_id = lesson.id
        ), '[]'::jsonb),
        'course_title', lesson.course_title,
        'course_sort_order', lesson.course_sort_order,
        'course_label', lesson.course_label,
        'duration_seconds', lesson.duration_seconds,
        'sort_order', lesson.sort_order,
        'created_at', lesson.created_at,
        'is_private', lesson.is_private,
        'resume_seconds', coalesce(progress.position_seconds, 0),
        'completed_at', progress.completed_at,
        'progress_updated_at', progress.updated_at,
        'bookmarked', bookmark.student_id is not null,
        'note', note.note,
        'note_updated_at', note.updated_at,
        'has_thumbnail', exists (
          select 1 from public.video_class_lesson_thumbnails thumbnail
          where thumbnail.lesson_id = lesson.id and thumbnail.enabled = true
        ),
        'attachments', coalesce((
          select jsonb_agg(jsonb_build_object(
            'id', attachment.id,
            'display_name', attachment.display_name,
            'content_type', attachment.content_type,
            'byte_length', attachment.byte_length
          ) order by attachment.sort_order, attachment.created_at, attachment.id)
          from public.video_class_lesson_attachments attachment
          where attachment.lesson_id = lesson.id and attachment.is_private = false
        ), '[]'::jsonb),
        'tags', coalesce((
          select jsonb_agg(jsonb_build_object('slug', tag.slug, 'label', tag.label)
            order by tag.sort_order, tag.slug)
          from public.video_class_lesson_tags lesson_tag
          join public.video_class_tags tag on tag.id = lesson_tag.tag_id and tag.published = true
          where lesson_tag.lesson_id = lesson.id
        ), '[]'::jsonb),
        'official_playlist_names', coalesce((
          select jsonb_agg(playlist.name order by playlist.sort_order, playlist.name)
          from public.video_class_official_playlist_items item
          join public.video_class_official_playlists playlist
            on playlist.id = item.playlist_id and playlist.published = true
          where item.lesson_id = lesson.id
            and exists (
              select 1
              from public.video_class_official_playlist_courses playlist_course
              join public.video_class_student_courses access
                on access.student_id = v_student_id
               and access.course_code = playlist_course.course_code
               and access.enabled = true
              join public.video_class_lesson_courses lesson_course
                on lesson_course.lesson_id = lesson.id
               and lesson_course.course_code = playlist_course.course_code
              join public.video_class_courses shared_course
                on shared_course.code = playlist_course.course_code
               and shared_course.published = true
              where playlist_course.playlist_id = playlist.id
            )
        ), '[]'::jsonb),
        'playlist_ids', coalesce((
          select jsonb_agg(item.playlist_id order by playlist.updated_at desc, playlist.id)
          from public.video_class_student_playlist_items item
          join public.video_class_student_playlists playlist
            on playlist.id = item.playlist_id and playlist.student_id = v_student_id
          where item.lesson_id = lesson.id
        ), '[]'::jsonb),
        'clips', coalesce((
          select jsonb_agg(jsonb_build_object(
            'id', clip.id,
            'lesson_id', clip.lesson_id,
            'title', clip.title,
            'display_title', case when length(trim(clip.title)) > 0 then clip.title
              else 'Clip ' || clip.clip_number::text end,
            'position_seconds', clip.position_seconds,
            'clip_number', clip.clip_number,
            'created_at', clip.created_at,
            'updated_at', clip.updated_at
          ) order by clip.clip_number, clip.created_at, clip.id)
          from public.video_class_student_clips clip
          where clip.student_id = v_student_id and clip.lesson_id = lesson.id
        ), '[]'::jsonb),
        'renditions', coalesce((
          select jsonb_agg(jsonb_build_object(
            'quality_code', rendition.quality_code,
            'display_label', rendition.display_label,
            'height_pixels', rendition.height_pixels,
            'is_default', rendition.is_default
          ) order by rendition.sort_order, rendition.height_pixels nulls last, rendition.quality_code)
          from public.video_class_lesson_renditions rendition
          where rendition.lesson_id = lesson.id and rendition.enabled = true
        ), '[]'::jsonb),
        'view_count', coalesce(progress.view_count, 0),
        'feedback', case when feedback.student_id is null then null else jsonb_build_object(
          'lesson_id', feedback.lesson_id,
          'picture_quality', feedback.picture_quality,
          'explanation_quality', feedback.explanation_quality,
          'audio_quality', feedback.audio_quality,
          'feedback_updated_at', feedback.updated_at
        ) end
      ) order by lesson.page_sort_order, lesson.created_at, lesson.id)
      from page lesson
      left join public.video_class_progress progress
        on progress.student_id = v_student_id and progress.lesson_id = lesson.id
      left join public.video_class_bookmarks bookmark
        on bookmark.student_id = v_student_id and bookmark.lesson_id = lesson.id
      left join public.video_class_notes note
        on note.student_id = v_student_id and note.lesson_id = lesson.id
      left join public.video_class_lesson_feedback feedback
        on feedback.student_id = v_student_id and feedback.lesson_id = lesson.id
    ), '[]'::jsonb),
    'playlists', case when p_after_cursor is not null then null else coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', playlist.id,
        'name', playlist.name,
        'lesson_ids', '[]'::jsonb,
        'lesson_count', (
          select count(*)::integer
          from public.video_class_student_playlist_items item
          where item.playlist_id = playlist.id
            and public._video_class_student_can_view_lesson(v_student_id, item.lesson_id)
        ),
        'created_at', playlist.created_at,
        'updated_at', playlist.updated_at
      ) order by playlist.updated_at desc, playlist.created_at, playlist.id)
      from (
        select owned.*
        from public.video_class_student_playlists owned
        where owned.student_id = v_student_id
        order by owned.updated_at desc, owned.created_at, owned.id
        limit 100
      ) playlist
    ), '[]'::jsonb) end,
    'officialPlaylists', case when p_after_cursor is not null then null else coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', playlist.id,
        'name', playlist.name,
        'description', playlist.description,
        'course_code', playlist.course_code,
        'course_codes', coalesce((
          select jsonb_agg(membership.course_code order by course.sort_order, membership.course_code)
          from public.video_class_official_playlist_courses membership
          join public.video_class_courses course
            on course.code = membership.course_code and course.published = true
          join public.video_class_student_courses access
            on access.student_id = v_student_id
           and access.course_code = membership.course_code
           and access.enabled = true
          where membership.playlist_id = playlist.id
        ), '[]'::jsonb),
        'lesson_ids', '[]'::jsonb,
        'lesson_count', (
          select count(*)::integer
          from public.video_class_official_playlist_items item
          join public.video_class_lessons lesson on lesson.id = item.lesson_id
          where item.playlist_id = playlist.id
            and public._video_class_student_can_view_lesson(v_student_id, lesson.id)
            and exists (
              select 1
              from public.video_class_official_playlist_courses playlist_course
              join public.video_class_lesson_courses lesson_course
                on lesson_course.lesson_id = lesson.id
               and lesson_course.course_code = playlist_course.course_code
              join public.video_class_student_courses access
                on access.student_id = v_student_id
               and access.course_code = playlist_course.course_code
               and access.enabled = true
              join public.video_class_courses course
                on course.code = playlist_course.course_code and course.published = true
              where playlist_course.playlist_id = playlist.id
            )
        )
      ) order by playlist.sort_order, playlist.name, playlist.id)
      from (
        select available.*
        from public.video_class_official_playlists available
        where available.published = true
          and exists (
            select 1
            from public.video_class_official_playlist_items available_item
            where available_item.playlist_id = available.id
              and public._video_class_student_can_view_lesson(v_student_id, available_item.lesson_id)
              and exists (
                select 1
                from public.video_class_official_playlist_courses playlist_course
                join public.video_class_lesson_courses lesson_course
                  on lesson_course.lesson_id = available_item.lesson_id
                 and lesson_course.course_code = playlist_course.course_code
                join public.video_class_student_courses access
                  on access.student_id = v_student_id
                 and access.course_code = playlist_course.course_code
                 and access.enabled = true
                join public.video_class_courses shared_course
                  on shared_course.code = playlist_course.course_code
                 and shared_course.published = true
                where playlist_course.playlist_id = available.id
              )
          )
        order by available.sort_order, available.name, available.id
        limit 500
      ) playlist
    ), '[]'::jsonb) end,
    'next_cursor', case when (select count(*) from candidates) > p_limit then (
      select page.page_sort_order::text || '|' || extract(epoch from page.created_at)::text || '|' || page.id::text
      from page order by page.page_sort_order desc, page.created_at desc, page.id desc limit 1
    ) else null end,
    'truncated', (select count(*) from candidates) > p_limit,
    'total_count', case when p_after_cursor is null then (select count(*) from eligible) else null end,
    'total_duration_seconds', case when p_after_cursor is null
      then (select coalesce(sum(duration_seconds), 0)::bigint from eligible) else null end
  ) into v_result;
  return v_result;
end;
$$;

create or replace function public.video_class_student_analytics(
  p_service_secret text,
  p_student_token uuid
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
  v_result jsonb;
begin
  if not public._video_class_worker_ok(p_service_secret)
    or p_student_token is null
  then
    return null;
  end if;

  v_student_id := public._video_class_student_id(p_student_token);
  if v_student_id is null then
    return null;
  end if;

  with entitled_lessons as materialized (
    select
      lesson.id,
      lesson.slug,
      lesson.title,
      display_course.code as course_code,
      display_course.title as course_title,
      display_course.sort_order as course_sort_order,
      lesson.course_label,
      lesson.duration_seconds as catalog_duration_seconds,
      lesson.sort_order,
      lesson.is_private,
      lesson.created_at
    from public.video_class_lessons lesson
    join lateral (
      select course.code, course.title, course.sort_order
      from public.video_class_lesson_courses membership
      join public.video_class_courses course
        on course.code = membership.course_code and course.published = true
      join public.video_class_student_courses access
        on access.student_id = v_student_id
       and access.course_code = membership.course_code
       and access.enabled = true
      where membership.lesson_id = lesson.id
      order by
        (membership.course_code = lesson.course_code) desc,
        course.sort_order,
        course.code
      limit 1
    ) display_course on true
    where lesson.published = true
      and public._video_class_student_can_view_lesson(v_student_id, lesson.id)
  ),
  history_rows as materialized (
    select
      lesson.id as lesson_id,
      lesson.slug,
      lesson.title,
      lesson.course_code,
      lesson.course_title,
      lesson.course_sort_order,
      lesson.course_label,
      lesson.sort_order,
      lesson.is_private,
      coalesce(progress.duration_seconds, lesson.catalog_duration_seconds::numeric)
        as duration_seconds,
      progress.position_seconds,
      progress.total_watched_seconds as watched_seconds,
      progress.view_count,
      progress.first_viewed_at,
      coalesce(progress.last_viewed_at, progress.updated_at) as last_viewed_at,
      progress.updated_at,
      progress.completed_at,
      (
        progress.completed_at is not null
        or (
          coalesce(progress.duration_seconds, lesson.catalog_duration_seconds::numeric) > 0
          and progress.position_seconds
            / coalesce(progress.duration_seconds, lesson.catalog_duration_seconds::numeric) >= 0.92
        )
      ) as completed,
      case
        when coalesce(progress.duration_seconds, lesson.catalog_duration_seconds::numeric) > 0
        then least(
          100::numeric,
          round(
            progress.position_seconds
              / coalesce(progress.duration_seconds, lesson.catalog_duration_seconds::numeric)
              * 100,
            1
          )
        )
        else 0::numeric
      end as progress_percent
    from public.video_class_progress progress
    join entitled_lessons lesson on lesson.id = progress.lesson_id
    where progress.student_id = v_student_id
      and (
        progress.position_seconds > 0
        or progress.total_watched_seconds > 0
        or progress.view_count > 0
        or progress.first_viewed_at is not null
        or progress.last_viewed_at is not null
      )
  )
  select jsonb_build_object(
    'generated_at', now(),
    'timezone', 'Asia/Hong_Kong',
    'summary', jsonb_build_object(
      'watched_video_count', (
        select count(*)::integer from history_rows
      ),
      'completed_video_count', (
        select count(*)::integer from history_rows history where history.completed
      ),
      'unfinished_video_count', (
        select count(*)::integer
        from history_rows history
        where not history.completed and history.position_seconds > 0
      ),
      'total_view_count', coalesce((
        select sum(history.view_count)::bigint from history_rows history
      ), 0::bigint),
      'total_watched_seconds', coalesce((
        select round(sum(history.watched_seconds), 2) from history_rows history
      ), 0::numeric),
      'total_watched_minutes', coalesce((
        select round(sum(history.watched_seconds) / 60, 2) from history_rows history
      ), 0::numeric),
      'first_activity_at', (
        select min(history.first_viewed_at) from history_rows history
      ),
      'last_activity_at', (
        select max(history.last_viewed_at) from history_rows history
      )
    ),
    'daily_counts', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'date', daily_state.activity_date,
          'videos_watched', daily_state.videos_watched,
          'view_count', daily_state.view_count,
          'watched_seconds', daily_state.watched_seconds,
          'watched_minutes', round(daily_state.watched_seconds / 60, 2)
        )
        order by daily_state.activity_date
      )
      from (
        select
          daily.activity_date,
          count(distinct daily.lesson_id)::integer as videos_watched,
          sum(daily.view_count)::bigint as view_count,
          round(sum(daily.watched_seconds), 2) as watched_seconds
        from public.video_class_daily_progress daily
        join entitled_lessons lesson on lesson.id = daily.lesson_id
        where daily.student_id = v_student_id
          and (daily.watched_seconds > 0 or daily.view_count > 0)
        group by daily.activity_date
      ) daily_state
    ), '[]'::jsonb),
    'unfinished', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'lesson_id', history.lesson_id,
          'slug', history.slug,
          'title', history.title,
          'course_code', history.course_code,
          'course_title', history.course_title,
          'course_label', history.course_label,
          'duration_seconds', history.duration_seconds,
          'position_seconds', history.position_seconds,
          'watched_seconds', history.watched_seconds,
          'progress_percent', history.progress_percent,
          'view_count', history.view_count,
          'is_private', history.is_private,
          'last_viewed_at', history.last_viewed_at
        )
        order by history.last_viewed_at desc nulls last,
          history.course_sort_order, history.sort_order, history.lesson_id
      )
      from history_rows history
      where not history.completed
        and history.position_seconds > 0
    ), '[]'::jsonb),
    'history', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'lesson_id', history.lesson_id,
          'slug', history.slug,
          'title', history.title,
          'course_code', history.course_code,
          'course_title', history.course_title,
          'course_label', history.course_label,
          'duration_seconds', history.duration_seconds,
          'position_seconds', history.position_seconds,
          'watched_seconds', history.watched_seconds,
          'watched_minutes', round(history.watched_seconds / 60, 2),
          'progress_percent', history.progress_percent,
          'completed', history.completed,
          'completed_at', history.completed_at,
          'view_count', history.view_count,
          'is_private', history.is_private,
          'first_viewed_at', history.first_viewed_at,
          'last_viewed_at', history.last_viewed_at,
          'updated_at', history.updated_at
        )
        order by history.last_viewed_at desc nulls last,
          history.course_sort_order, history.sort_order, history.lesson_id
      )
      from history_rows history
    ), '[]'::jsonb),
    'csv_rows', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'last_viewed_date', (
            history.last_viewed_at at time zone 'Asia/Hong_Kong'
          )::date,
          'course_code', history.course_code,
          'course_title', history.course_title,
          'video_title', history.title,
          'lesson_slug', history.slug,
          'progress_percent', history.progress_percent,
          'position_seconds', history.position_seconds,
          'duration_seconds', history.duration_seconds,
          'watched_seconds', history.watched_seconds,
          'watched_minutes', round(history.watched_seconds / 60, 2),
          'view_count', history.view_count,
          'status', case when history.completed then 'completed' else 'unfinished' end,
          'first_viewed_at', history.first_viewed_at,
          'last_viewed_at', history.last_viewed_at
        )
        order by history.last_viewed_at desc nulls last,
          history.course_sort_order, history.sort_order, history.lesson_id
      )
      from history_rows history
    ), '[]'::jsonb)
  )
  into v_result;

  return v_result;
end;
$$;

create or replace function public.video_class_student_create_playlist(
  p_service_secret text,
  p_student_token uuid,
  p_name text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
  v_playlist_id uuid;
  v_name text := trim(p_name);
begin
  if not public._video_class_worker_ok(p_service_secret)
    or p_student_token is null
    or p_name is null
    or length(v_name) not between 1 and 80
  then
    return null;
  end if;

  v_student_id := public._video_class_student_id(p_student_token);
  if v_student_id is null then
    return null;
  end if;

  -- Keep the initial student library response bounded. A hundred personal
  -- playlists is generous for course organisation and prevents an account
  -- from manufacturing an unbounded catalogue payload.
  if (select count(*) from public.video_class_student_playlists playlist
      where playlist.student_id = v_student_id) >= 100 then
    return null;
  end if;

  insert into public.video_class_student_playlists (student_id, name)
  values (v_student_id, v_name)
  returning id into v_playlist_id;

  return public._video_class_student_playlist_json(v_student_id, v_playlist_id);
exception
  when unique_violation then
    return null;
end;
$$;

create or replace function public.video_class_student_create_clip(
  p_service_secret text,
  p_student_token uuid,
  p_lesson_id uuid,
  p_position_seconds numeric,
  p_title text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
  v_duration_seconds integer;
  v_clip_number integer;
  v_clip public.video_class_student_clips%rowtype;
  v_title text := coalesce(trim(p_title), '');
begin
  if not public._video_class_worker_ok(p_service_secret)
    or p_student_token is null
    or p_lesson_id is null
    or p_position_seconds is null
    or p_position_seconds < 0
    or p_position_seconds > 86400
    or length(v_title) > 120
  then
    return null;
  end if;

  v_student_id := public._video_class_student_id(p_student_token);
  if v_student_id is null then
    return null;
  end if;

  -- The lesson lock serializes clip numbering for this lesson and also keeps
  -- its duration stable while the timestamp is validated.
  select lesson.duration_seconds
  into v_duration_seconds
  from public.video_class_lessons lesson
  where lesson.id = p_lesson_id
    and lesson.published = true
    and public._video_class_student_can_view_lesson(v_student_id, lesson.id)
  for update of lesson;

  if not found
    or (v_duration_seconds is not null and p_position_seconds > v_duration_seconds)
  then
    return null;
  end if;

  select coalesce(max(clip.clip_number), 0) + 1
  into v_clip_number
  from public.video_class_student_clips clip
  where clip.student_id = v_student_id
    and clip.lesson_id = p_lesson_id;

  insert into public.video_class_student_clips (
    student_id, lesson_id, clip_number, position_seconds, title
  )
  values (
    v_student_id, p_lesson_id, v_clip_number, p_position_seconds, v_title
  )
  returning * into v_clip;

  return jsonb_build_object(
    'id', v_clip.id,
    'lesson_id', v_clip.lesson_id,
    'title', v_clip.title,
    'display_title', case
      when length(trim(v_clip.title)) > 0 then v_clip.title
      else 'Clip ' || v_clip.clip_number::text
    end,
    'position_seconds', v_clip.position_seconds,
    'clip_number', v_clip.clip_number,
    'created_at', v_clip.created_at,
    'updated_at', v_clip.updated_at
  );
end;
$$;

create or replace function public.video_class_admin_list_feedback_page(
  p_service_secret text,
  p_admin_token uuid,
  p_limit integer default 100,
  p_after_cursor text default null
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid;
  v_after_updated timestamptz;
  v_after_student uuid;
  v_after_lesson uuid;
  v_result jsonb;
begin
  if not public._video_class_worker_ok(p_service_secret)
    or p_admin_token is null
    or coalesce(p_limit, 0) not between 1 and 100
  then
    return null;
  end if;

  v_admin_id := public._video_class_admin_id(p_admin_token);
  if v_admin_id is null then
    return null;
  end if;

  if p_after_cursor is not null then
    if p_after_cursor !~ '^[0-9]{1,11}(?:\.[0-9]{1,6})?\|[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}\|[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$'
      or split_part(p_after_cursor, '|', 1)::numeric not between 0 and 32503680000
    then return null; end if;
    v_after_updated := to_timestamp(split_part(p_after_cursor, '|', 1)::double precision);
    v_after_student := split_part(p_after_cursor, '|', 2)::uuid;
    v_after_lesson := split_part(p_after_cursor, '|', 3)::uuid;
  end if;

  with candidates as materialized (
    select feedback.*
    from public.video_class_lesson_feedback feedback
    where p_after_cursor is null
      or feedback.updated_at < v_after_updated
      or (
        feedback.updated_at = v_after_updated
        and (feedback.student_id, feedback.lesson_id) > (v_after_student, v_after_lesson)
      )
    order by feedback.updated_at desc, feedback.student_id, feedback.lesson_id
    limit p_limit + 1
  ), page as materialized (
    select * from candidates
    order by updated_at desc, student_id, lesson_id
    limit p_limit
  )
  select jsonb_build_object(
    'feedback', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'student_id', feedback.student_id,
          'student_uuid', feedback.student_id,
          'student_name', student.name,
          'video_key', student_access.video_key,
          'lesson_id', feedback.lesson_id,
          'lesson_title', lesson.title,
          'course_code', lesson.course_code,
          'picture_quality', feedback.picture_quality,
          'explanation_quality', feedback.explanation_quality,
          'audio_quality', feedback.audio_quality,
          'created_at', feedback.created_at,
          'updated_at', feedback.updated_at,
          'feedback_updated_at', feedback.updated_at
        )
        order by feedback.updated_at desc, feedback.student_id, feedback.lesson_id
      )
      from page feedback
      join public.flashcard_students student on student.id = feedback.student_id
      left join public.video_class_student_access student_access
        on student_access.student_id = feedback.student_id
      join public.video_class_lessons lesson on lesson.id = feedback.lesson_id
    ), '[]'::jsonb),
    'summary', case when p_after_cursor is not null then null else (
      select jsonb_build_object(
        'response_count', count(*)::bigint,
        'picture_response_count', count(feedback.picture_quality)::bigint,
        'picture_average', round(avg(feedback.picture_quality)::numeric, 2),
        'explanation_response_count', count(feedback.explanation_quality)::bigint,
        'explanation_average', round(avg(feedback.explanation_quality)::numeric, 2),
        'audio_response_count', count(feedback.audio_quality)::bigint,
        'audio_average', round(avg(feedback.audio_quality)::numeric, 2)
      )
      from public.video_class_lesson_feedback feedback
    ) end,
    'next_cursor', case when (select count(*) from candidates) > p_limit then (
      select extract(epoch from feedback.updated_at)::text || '|' ||
        feedback.student_id::text || '|' || feedback.lesson_id::text
      from page feedback
      order by feedback.updated_at asc, feedback.student_id desc, feedback.lesson_id desc
      limit 1
    ) else null end,
    'truncated', (select count(*) from candidates) > p_limit
  )
  into v_result;

  return v_result;
end;
$$;

create or replace function public.video_class_authorize_thumbnail(
  p_service_secret text,
  p_student_token uuid,
  p_lesson_id uuid
)
returns table (
  object_key text,
  content_type text,
  byte_length bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
begin
  if not public._video_class_worker_ok(p_service_secret)
    or p_student_token is null
    or p_lesson_id is null
  then
    return;
  end if;

  v_student_id := public._video_class_student_id(p_student_token);
  if v_student_id is null then
    return;
  end if;

  return query
  select thumbnail.object_key, thumbnail.content_type, thumbnail.byte_length
  from public.video_class_lesson_thumbnails thumbnail
  join public.video_class_lessons lesson
    on lesson.id = thumbnail.lesson_id
   and lesson.published = true
   and lesson.is_private = false
  where thumbnail.lesson_id = p_lesson_id
    and thumbnail.enabled = true
    and public._video_class_student_can_view_lesson(v_student_id, lesson.id);
end;
$$;

create or replace function public.video_class_playback_list_renditions(
  p_service_secret text,
  p_playback_id uuid
)
returns table (
  quality_code text,
  display_label text,
  height_pixels integer,
  is_default boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public._video_class_worker_ok(p_service_secret)
    or p_playback_id is null
  then
    return;
  end if;

  return query
  select
    rendition.quality_code,
    rendition.display_label,
    rendition.height_pixels,
    rendition.is_default
  from public.video_class_playback_sessions playback
  join public.video_class_student_sessions session
    on session.token_hash = playback.student_session_hash
   and session.student_id = playback.student_id
   and session.expires_at > now()
  join public.flashcard_students student
    on student.id = playback.student_id
   and student.deleted_at is null
  join public.video_class_student_access access
    on access.student_id = playback.student_id
   and access.enabled = true
   and access.video_key = playback.video_key_snapshot
  join public.video_class_lessons lesson
    on lesson.id = playback.lesson_id
   and lesson.published = true
   and lesson.is_private = false
  join public.video_class_lesson_renditions rendition
    on rendition.lesson_id = lesson.id
   and rendition.enabled = true
  where playback.id = p_playback_id
    and public._video_class_student_can_view_lesson(playback.student_id, lesson.id)
    and playback.revoked_at is null
    and playback.expires_at > now()
  order by rendition.sort_order, rendition.height_pixels nulls last,
    rendition.quality_code;
end;
$$;

create or replace function public.video_class_authorize_rendition(
  p_service_secret text,
  p_playback_id uuid,
  p_student_id uuid,
  p_lesson_slug text,
  p_quality_code text,
  p_user_agent_hash text,
  p_network_hash text
)
returns table (
  object_key text,
  content_type text,
  byte_length bigint,
  lesson_id uuid,
  expires_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public._video_class_worker_ok(p_service_secret)
    or p_playback_id is null
    or p_student_id is null
    or p_lesson_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    or p_quality_code not in ('480p', '720p', '1080p', 'max')
    or p_user_agent_hash !~ '^[0-9a-f]{64}$'
    or p_network_hash !~ '^[0-9a-f]{64}$'
  then
    return;
  end if;

  return query
  select
    rendition.object_key,
    rendition.content_type,
    rendition.byte_length,
    lesson.id,
    playback.expires_at
  from public.video_class_playback_sessions playback
  join public.video_class_student_sessions session
    on session.token_hash = playback.student_session_hash
   and session.student_id = playback.student_id
   and session.expires_at > now()
  join public.flashcard_students student
    on student.id = playback.student_id
   and student.deleted_at is null
  join public.video_class_student_access access
    on access.student_id = playback.student_id
   and access.enabled = true
   and access.video_key = playback.video_key_snapshot
  join public.video_class_lessons lesson
    on lesson.id = playback.lesson_id
   and lesson.published = true
   and lesson.is_private = false
  join public.video_class_lesson_renditions rendition
    on rendition.lesson_id = lesson.id
   and rendition.quality_code = p_quality_code
   and rendition.enabled = true
  where playback.id = p_playback_id
    and playback.student_id = p_student_id
    and public._video_class_student_can_view_lesson(playback.student_id, lesson.id)
    and lesson.slug = p_lesson_slug
    and playback.user_agent_hash = p_user_agent_hash
    and playback.network_hash = p_network_hash
    and playback.revoked_at is null
    and playback.expires_at > now();
end;
$$;

create or replace function public.video_class_create_playback(
  p_service_secret text,
  p_student_token uuid,
  p_lesson_slug text,
  p_user_agent_hash text,
  p_network_hash text
)
returns table (
  playback_id uuid,
  student_id uuid,
  lesson_id uuid,
  slug text,
  title text,
  object_key text,
  video_key text,
  watermark_enabled boolean,
  resume_seconds numeric,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
  v_session_hash bytea;
  v_session_expires_at timestamptz;
  v_video_key text;
  v_watermark_enabled boolean;
  v_lesson public.video_class_lessons%rowtype;
  v_playback_id uuid := gen_random_uuid();
  v_expires_at timestamptz;
  v_resume numeric := 0;
begin
  if not public._video_class_worker_ok(p_service_secret)
    or p_student_token is null
    or p_lesson_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    or p_user_agent_hash !~ '^[0-9a-f]{64}$'
    or p_network_hash !~ '^[0-9a-f]{64}$'
  then
    return;
  end if;

  -- Establish a consistent parent-to-child lock order. Password changes lock
  -- the shared student row first, so grants must do the same before locking the
  -- video session/access rows and finally touching playback rows.
  select session.student_id into v_student_id
  from public.video_class_student_sessions session
  where session.token_hash = extensions.digest(p_student_token::text, 'sha256')
    and session.expires_at > now()
  limit 1;

  if not found then
    return;
  end if;

  select student.id into v_student_id
  from public.flashcard_students student
  where student.id = v_student_id
    and student.deleted_at is null
  for key share;

  if not found then
    return;
  end if;

  select
    session.student_id,
    session.token_hash,
    session.expires_at,
    access.video_key,
    access.watermark_enabled
  into
    v_student_id,
    v_session_hash,
    v_session_expires_at,
    v_video_key,
    v_watermark_enabled
  from public.video_class_student_sessions session
  join public.flashcard_students student on student.id = session.student_id
  join public.video_class_student_access access on access.student_id = student.id
  where session.token_hash = extensions.digest(p_student_token::text, 'sha256')
    and session.expires_at > now()
    and student.id = v_student_id
    and student.deleted_at is null
    and access.enabled = true
  limit 1
  for update of session, access;

  if not found then
    return;
  end if;

  select lesson.* into v_lesson
  from public.video_class_lessons lesson
  where lesson.slug = p_lesson_slug
    and lesson.published = true
    and lesson.is_private = false
    and public._video_class_student_can_view_lesson(v_student_id, lesson.id)
  limit 1
  for no key update of lesson;

  if not found then
    return;
  end if;

  v_expires_at := least(v_session_expires_at, clock_timestamp() + interval '6 hours');

  update public.video_class_playback_sessions playback
  set revoked_at = coalesce(playback.revoked_at, now())
  where playback.student_id = v_student_id
    and playback.revoked_at is null
    and playback.expires_at > now();

  select coalesce(progress.position_seconds, 0)
  into v_resume
  from public.video_class_progress progress
  where progress.student_id = v_student_id
    and progress.lesson_id = v_lesson.id;

  insert into public.video_class_playback_sessions (
    id, student_id, lesson_id, student_session_hash, video_key_snapshot,
    user_agent_hash, network_hash, expires_at
  )
  values (
    v_playback_id, v_student_id, v_lesson.id, v_session_hash,
    v_video_key, p_user_agent_hash, p_network_hash, v_expires_at
  );

  return query
  select
    v_playback_id,
    v_student_id,
    v_lesson.id,
    v_lesson.slug,
    v_lesson.title,
    v_lesson.object_key,
    v_video_key,
    v_watermark_enabled,
    coalesce(v_resume, 0),
    v_expires_at;
end;
$$;

create or replace function public.video_class_authorize_playback(
  p_service_secret text,
  p_playback_id uuid,
  p_student_id uuid,
  p_lesson_slug text,
  p_user_agent_hash text,
  p_network_hash text
)
returns table (object_key text, video_key text, lesson_id uuid, expires_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public._video_class_worker_ok(p_service_secret)
    or p_playback_id is null
    or p_student_id is null
    or p_user_agent_hash !~ '^[0-9a-f]{64}$'
    or p_network_hash !~ '^[0-9a-f]{64}$'
  then
    return;
  end if;

  -- Media requests are intentionally read-only. Progress heartbeats update
  -- activity in a controlled cadence instead of writing for every byte range.
  return query
  select lesson.object_key, playback.video_key_snapshot, lesson.id, playback.expires_at
  from public.video_class_playback_sessions playback
  join public.video_class_lessons lesson on lesson.id = playback.lesson_id
  join public.flashcard_students student on student.id = playback.student_id
  join public.video_class_student_access access on access.student_id = student.id
  join public.video_class_student_sessions session
    on session.token_hash = playback.student_session_hash
  where playback.id = p_playback_id
    and playback.student_id = p_student_id
    and lesson.slug = p_lesson_slug
    and lesson.published = true
    and lesson.is_private = false
    and student.deleted_at is null
    and access.enabled = true
    and public._video_class_student_can_view_lesson(playback.student_id, lesson.id)
    and access.video_key = playback.video_key_snapshot
    and session.expires_at > now()
    and playback.user_agent_hash = p_user_agent_hash
    and playback.network_hash = p_network_hash
    and playback.revoked_at is null
    and playback.expires_at > now();
end;
$$;

create or replace function public.video_class_record_progress(
  p_service_secret text,
  p_student_token uuid,
  p_playback_id uuid,
  p_position_seconds numeric,
  p_duration_seconds numeric
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
  v_lesson_id uuid;
  v_completed_at timestamptz;
  v_view_counted_at timestamptz;
  v_previous_position_seconds numeric;
  v_previous_seen_at timestamptz;
  v_now timestamptz;
  v_elapsed_seconds numeric;
  v_watched_increment numeric(14,2) := 0;
  v_new_view boolean := false;
  v_has_activity boolean := false;
  v_activity_date date;
  v_should_count boolean;
begin
  if not public._video_class_worker_ok(p_service_secret)
    or p_student_token is null
    or p_playback_id is null
    or p_position_seconds is null
    or p_position_seconds < 0
    or p_position_seconds > 86400
    or p_duration_seconds is null
    or p_duration_seconds <= 0
    or p_duration_seconds > 86400
    or p_position_seconds > p_duration_seconds + 30
  then
    return false;
  end if;

  select
    playback.student_id,
    playback.lesson_id,
    playback.view_counted_at,
    playback.last_position_seconds,
    playback.last_seen_at
  into
    v_student_id,
    v_lesson_id,
    v_view_counted_at,
    v_previous_position_seconds,
    v_previous_seen_at
  from public.video_class_playback_sessions playback
  join public.video_class_student_sessions session
    on session.token_hash = playback.student_session_hash
    and session.student_id = playback.student_id
  join public.flashcard_students student on student.id = playback.student_id
  join public.video_class_student_access access on access.student_id = playback.student_id
  join public.video_class_lessons lesson on lesson.id = playback.lesson_id
  where playback.id = p_playback_id
    and session.token_hash = extensions.digest(p_student_token::text, 'sha256')
    and session.expires_at > now()
    and playback.revoked_at is null
    and playback.expires_at > now()
    and student.deleted_at is null
    and access.enabled = true
    and lesson.published = true
    and lesson.is_private = false
    and public._video_class_student_can_view_lesson(playback.student_id, lesson.id)
    and access.video_key = playback.video_key_snapshot
  limit 1
  for update of playback;

  if not found then
    return false;
  end if;

  v_now := clock_timestamp();
  v_elapsed_seconds := greatest(
    0::numeric,
    extract(epoch from (v_now - coalesce(v_previous_seen_at, v_now)))::numeric
  );

  -- Position deltas are bounded by elapsed wall time and the 2x speed limit.
  -- This records genuine viewing while preventing a forward seek from being
  -- counted as minutes watched. A small tolerance absorbs timer/network drift.
  v_watched_increment := round(greatest(
    0::numeric,
    least(
      p_position_seconds - coalesce(v_previous_position_seconds, p_position_seconds),
      v_elapsed_seconds * 2.25 + 2,
      45::numeric
    )
  ), 2);

  v_completed_at := case
    when p_duration_seconds >= 10 and p_position_seconds / p_duration_seconds >= 0.92 then v_now
    else null
  end;

  v_should_count := p_position_seconds >= 3
    or p_position_seconds / p_duration_seconds >= 0.10;
  v_new_view := v_should_count and v_view_counted_at is null;
  v_has_activity := v_watched_increment > 0 or v_new_view;
  v_activity_date := (v_now at time zone 'Asia/Hong_Kong')::date;

  -- The locked playback row and view_counted_at marker make retries and racing
  -- heartbeats contribute at most one view for this playback session, while
  -- the progress and daily aggregates update atomically in this transaction.
  insert into public.video_class_progress (
    student_id, lesson_id, position_seconds, duration_seconds,
    total_watched_seconds, completed_at, view_count,
    first_viewed_at, last_viewed_at, updated_at
  )
  values (
    v_student_id,
    v_lesson_id,
    p_position_seconds,
    p_duration_seconds,
    v_watched_increment,
    v_completed_at,
    case when v_new_view then 1 else 0 end,
    case when v_has_activity then v_now else null end,
    case when v_has_activity then v_now else null end,
    v_now
  )
  on conflict on constraint video_class_progress_pkey do update
  set position_seconds = excluded.position_seconds,
      duration_seconds = excluded.duration_seconds,
      total_watched_seconds = public.video_class_progress.total_watched_seconds
        + excluded.total_watched_seconds,
      completed_at = coalesce(public.video_class_progress.completed_at, excluded.completed_at),
      view_count = public.video_class_progress.view_count + excluded.view_count,
      first_viewed_at = coalesce(
        public.video_class_progress.first_viewed_at,
        excluded.first_viewed_at
      ),
      last_viewed_at = case
        when excluded.last_viewed_at is not null then excluded.last_viewed_at
        else public.video_class_progress.last_viewed_at
      end,
      updated_at = v_now;

  if v_has_activity then
    insert into public.video_class_daily_progress as daily (
      student_id, lesson_id, activity_date, watched_seconds, view_count,
      first_activity_at, last_activity_at
    )
    values (
      v_student_id,
      v_lesson_id,
      v_activity_date,
      v_watched_increment,
      case when v_new_view then 1 else 0 end,
      v_now,
      v_now
    )
    on conflict (student_id, lesson_id, activity_date) do update
    set watched_seconds = daily.watched_seconds + excluded.watched_seconds,
        view_count = daily.view_count + excluded.view_count,
        first_activity_at = least(daily.first_activity_at, excluded.first_activity_at),
        last_activity_at = greatest(daily.last_activity_at, excluded.last_activity_at);
  end if;

  update public.video_class_playback_sessions playback
  set last_seen_at = v_now,
      last_position_seconds = p_position_seconds,
      view_counted_at = case
        when v_new_view then v_now
        else playback.view_counted_at
      end
  where playback.id = p_playback_id;

  return true;
end;
$$;

create or replace function public.video_class_admin_list_lessons_page(
  p_service_secret text,
  p_admin_token uuid,
  p_limit integer default 50,
  p_after_id uuid default null,
  p_query text default ''
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_query text := lower(btrim(coalesce(p_query, '')));
  v_result jsonb;
begin
  if not public._video_class_worker_ok(p_service_secret)
    or public._video_class_admin_id(p_admin_token) is null
  then
    raise exception 'Invalid or expired admin session';
  end if;
  if p_limit not between 1 and 100 or length(v_query) > 100 then
    raise exception 'Invalid lesson page request';
  end if;

  with candidates as materialized (
    select lesson.*
    from public.video_class_lessons lesson
    where (p_after_id is null or lesson.id > p_after_id)
      and (
        length(v_query) = 0
        or lower(lesson.title) like '%' || v_query || '%'
        or lower(lesson.slug) like '%' || v_query || '%'
        or lower(lesson.description) like '%' || v_query || '%'
      )
    order by lesson.id
    limit p_limit + 1
  ), page as materialized (
    select * from candidates order by id limit p_limit
  )
  select jsonb_build_object(
    'lessons', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'lesson_id', lesson.id,
          'slug', lesson.slug,
          'title', lesson.title,
          'description', lesson.description,
          'course_code', lesson.course_code,
          'course_title', primary_course.title,
          'course_label', lesson.course_label,
          'course_codes', coalesce((
            select jsonb_agg(membership.course_code order by course.sort_order, membership.course_code)
            from public.video_class_lesson_courses membership
            join public.video_class_courses course on course.code = membership.course_code
            where membership.lesson_id = lesson.id
          ), '[]'::jsonb),
          'duration_seconds', lesson.duration_seconds,
          'sort_order', lesson.sort_order,
          'published', lesson.published,
          'is_private', lesson.is_private,
          'total_view_count', coalesce(view_state.total_view_count, 0::bigint),
          'has_thumbnail', exists (
            select 1 from public.video_class_lesson_thumbnails thumbnail
            where thumbnail.lesson_id = lesson.id and thumbnail.enabled = true
          ),
          'attachments', coalesce((
            select jsonb_agg(
              jsonb_build_object(
                'id', attachment.id,
                'display_name', attachment.display_name,
                'content_type', attachment.content_type,
                'byte_length', attachment.byte_length,
                'is_private', attachment.is_private,
                'sort_order', attachment.sort_order,
                'created_at', attachment.created_at,
                'updated_at', attachment.updated_at
              ) order by attachment.sort_order, attachment.created_at, attachment.id
            )
            from public.video_class_lesson_attachments attachment
            where attachment.lesson_id = lesson.id
          ), '[]'::jsonb),
          'official_playlist_ids', coalesce((
            select jsonb_agg(item.playlist_id order by item.playlist_id)
            from public.video_class_official_playlist_items item
            where item.lesson_id = lesson.id
          ), '[]'::jsonb),
          'created_at', lesson.created_at,
          'updated_at', lesson.updated_at
        ) order by lesson.id
      )
      from page lesson
      join public.video_class_courses primary_course on primary_course.code = lesson.course_code
      left join lateral (
        select coalesce(sum(progress.view_count), 0)::bigint as total_view_count
        from public.video_class_progress progress
        where progress.lesson_id = lesson.id
      ) view_state on true
    ), '[]'::jsonb),
    'next_cursor', case
      when (select count(*) from candidates) > p_limit
      then (select page.id::text from page order by page.id desc limit 1)
      else null
    end,
    'truncated', (select count(*) from candidates) > p_limit
  ) into v_result;

  return v_result;
end;
$$;

create or replace function public.video_class_admin_set_lesson_courses(
  p_service_secret text,
  p_admin_token uuid,
  p_lesson_id uuid,
  p_course_codes text[]
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid;
  v_primary_course text;
  v_codes text[];
begin
  if not public._video_class_worker_ok(p_service_secret) or p_lesson_id is null then
    raise exception 'Invalid lesson course update';
  end if;
  v_admin_id := public._video_class_admin_id(p_admin_token);
  if v_admin_id is null then raise exception 'Invalid or expired admin session'; end if;

  select array_agg(distinct lower(btrim(code)) order by lower(btrim(code)))
  into v_codes
  from unnest(coalesce(p_course_codes, array[]::text[])) code;
  if coalesce(cardinality(v_codes), 0) not between 1 and 20
    or exists (select 1 from unnest(v_codes) code where code !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
    or (select count(*) from public.video_class_courses course where course.code = any(v_codes)) <> cardinality(v_codes)
  then
    raise exception 'Invalid course selection';
  end if;

  perform 1 from public.video_class_lessons lesson where lesson.id = p_lesson_id for update;
  if not found then raise exception 'Lesson not found'; end if;

  select course.code into v_primary_course
  from public.video_class_courses course
  where course.code = any(v_codes)
  order by course.sort_order, course.code
  limit 1;

  if exists (
    select 1
    from public.video_class_official_playlist_items item
    where item.lesson_id = p_lesson_id
      and not exists (
        select 1
        from public.video_class_official_playlist_courses playlist_course
        where playlist_course.playlist_id = item.playlist_id
          and playlist_course.course_code = any(v_codes)
      )
  ) then
    raise exception 'Remove this lesson from incompatible official series before changing its courses';
  end if;

  delete from public.video_class_lesson_courses membership
  where membership.lesson_id = p_lesson_id;
  insert into public.video_class_lesson_courses (lesson_id, course_code, created_by)
  select p_lesson_id, code, v_admin_id from unnest(v_codes) code;
  update public.video_class_lessons lesson
  set course_code = v_primary_course
  where lesson.id = p_lesson_id;

  update public.video_class_playback_sessions playback
  set revoked_at = coalesce(playback.revoked_at, now())
  where playback.lesson_id = p_lesson_id
    and playback.revoked_at is null and playback.expires_at > now();

  insert into public.video_class_admin_audit_events (admin_id, action, detail)
  values (v_admin_id, 'set_lesson_courses', jsonb_build_object(
    'lesson_id', p_lesson_id, 'course_codes', to_jsonb(v_codes)
  ));
  return jsonb_build_object('lesson_id', p_lesson_id, 'course_code', v_primary_course, 'course_codes', to_jsonb(v_codes));
end;
$$;

create or replace function public.video_class_admin_list_official_playlists_page(
  p_service_secret text,
  p_admin_token uuid,
  p_limit integer default 50,
  p_after_id uuid default null,
  p_query text default ''
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_query text := lower(btrim(coalesce(p_query, '')));
  v_result jsonb;
begin
  if not public._video_class_worker_ok(p_service_secret)
    or public._video_class_admin_id(p_admin_token) is null
  then raise exception 'Invalid or expired admin session'; end if;
  if p_limit not between 1 and 100 or length(v_query) > 100 then
    raise exception 'Invalid series page request';
  end if;

  with candidates as materialized (
    select playlist.* from public.video_class_official_playlists playlist
    where (p_after_id is null or playlist.id > p_after_id)
      and (length(v_query) = 0 or lower(playlist.name) like '%' || v_query || '%')
    order by playlist.id limit p_limit + 1
  ), page as materialized (select * from candidates order by id limit p_limit)
  select jsonb_build_object(
    'playlists', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', playlist.id,
        'name', playlist.name,
        'description', playlist.description,
        'published', playlist.published,
        'sort_order', playlist.sort_order,
        'course_codes', coalesce((
          select jsonb_agg(membership.course_code order by course.sort_order, membership.course_code)
          from public.video_class_official_playlist_courses membership
          join public.video_class_courses course on course.code = membership.course_code
          where membership.playlist_id = playlist.id
        ), '[]'::jsonb),
        'lesson_ids', coalesce((
          select jsonb_agg(item.lesson_id order by item.sort_order, item.lesson_id)
          from public.video_class_official_playlist_items item
          where item.playlist_id = playlist.id
        ), '[]'::jsonb),
        'updated_at', playlist.updated_at
      ) order by playlist.id) from page playlist
    ), '[]'::jsonb),
    'next_cursor', case when (select count(*) from candidates) > p_limit then (select page.id::text from page order by page.id desc limit 1) else null end,
    'truncated', (select count(*) from candidates) > p_limit
  ) into v_result;
  return v_result;
end;
$$;

create or replace function public.video_class_admin_save_official_playlist(
  p_service_secret text,
  p_admin_token uuid,
  p_playlist_id uuid,
  p_name text,
  p_description text,
  p_course_codes text[],
  p_lesson_ids uuid[],
  p_published boolean default true
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid;
  v_playlist public.video_class_official_playlists%rowtype;
  v_codes text[];
  v_lessons uuid[];
  v_primary_course text;
  v_name text := btrim(coalesce(p_name, ''));
  v_description text := coalesce(p_description, '');
begin
  if not public._video_class_worker_ok(p_service_secret)
    or length(v_name) not between 1 and 160
    or length(v_description) > 1000
    or p_published is null
  then raise exception 'Invalid official series metadata'; end if;
  v_admin_id := public._video_class_admin_id(p_admin_token);
  if v_admin_id is null then raise exception 'Invalid or expired admin session'; end if;

  select array_agg(distinct lower(btrim(code)) order by lower(btrim(code))) into v_codes
  from unnest(coalesce(p_course_codes, array[]::text[])) code;
  select array_agg(distinct lesson_id order by lesson_id) into v_lessons
  from unnest(coalesce(p_lesson_ids, array[]::uuid[])) lesson_id;
  if coalesce(cardinality(v_codes), 0) not between 1 and 20
    or coalesce(cardinality(v_lessons), 0) not between 1 and 500
    or (select count(*) from public.video_class_courses course where course.code = any(v_codes)) <> cardinality(v_codes)
    or (select count(*) from public.video_class_lessons lesson where lesson.id = any(v_lessons)) <> cardinality(v_lessons)
  then raise exception 'Invalid series course or lesson selection'; end if;

  -- Serialize series membership with per-lesson course changes. Without these
  -- row locks, two administrators could concurrently create a series and
  -- remove its last shared course after both validations had passed.
  perform 1
  from public.video_class_lessons lesson
  where lesson.id = any(v_lessons)
  order by lesson.id
  for share;

  -- Validate course compatibility only after the locks are held. Otherwise a
  -- concurrent course update could commit while this transaction is waiting,
  -- leaving the new series incompatible with one of its lessons.
  if exists (
    select 1 from unnest(v_lessons) selected(lesson_id)
    where not exists (
      select 1 from public.video_class_lesson_courses membership
      where membership.lesson_id = selected.lesson_id and membership.course_code = any(v_codes)
    )
  ) then
    raise exception 'Invalid series course or lesson selection';
  end if;

  select course.code into v_primary_course from public.video_class_courses course
  where course.code = any(v_codes) order by course.sort_order, course.code limit 1;

  if p_playlist_id is null then
    insert into public.video_class_official_playlists (
      course_code, name, description, published, created_by
    ) values (v_primary_course, v_name, v_description, p_published, v_admin_id)
    returning * into v_playlist;
  else
    update public.video_class_official_playlists playlist
    set course_code = v_primary_course, name = v_name, description = v_description, published = p_published
    where playlist.id = p_playlist_id
    returning * into v_playlist;
    if not found then raise exception 'Official series not found'; end if;
  end if;

  delete from public.video_class_official_playlist_items item where item.playlist_id = v_playlist.id;
  delete from public.video_class_official_playlist_courses membership where membership.playlist_id = v_playlist.id;
  insert into public.video_class_official_playlist_courses (playlist_id, course_code, created_by)
  select v_playlist.id, code, v_admin_id from unnest(v_codes) code;
  insert into public.video_class_official_playlist_items (
    playlist_id, lesson_id, sort_order, created_by
  )
  select v_playlist.id, lesson_id, ordinal::integer * 10, v_admin_id
  from unnest(p_lesson_ids) with ordinality selected(lesson_id, ordinal)
  on conflict (playlist_id, lesson_id) do update set sort_order = excluded.sort_order;

  insert into public.video_class_admin_audit_events (admin_id, action, detail)
  values (v_admin_id, 'save_official_playlist', jsonb_build_object(
    'playlist_id', v_playlist.id, 'name', v_playlist.name,
    'course_codes', to_jsonb(v_codes), 'lesson_count', cardinality(v_lessons)
  ));
  return jsonb_build_object(
    'id', v_playlist.id, 'name', v_playlist.name, 'description', v_playlist.description,
    'published', v_playlist.published, 'course_codes', to_jsonb(v_codes),
    'lesson_ids', to_jsonb(p_lesson_ids), 'updated_at', v_playlist.updated_at
  );
exception when unique_violation then
  raise exception 'An official series with this name already exists in its primary course';
end;
$$;

create or replace function public.video_class_admin_add_attachment(
  p_service_secret text,
  p_admin_token uuid,
  p_lesson_id uuid,
  p_display_name text,
  p_object_key text,
  p_content_type text,
  p_byte_length bigint
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid;
  v_attachment public.video_class_lesson_attachments%rowtype;
  v_name text := btrim(coalesce(p_display_name, ''));
begin
  if not public._video_class_worker_ok(p_service_secret)
    or p_lesson_id is null
    or length(v_name) not between 1 and 180
    or not public._video_class_valid_object_key(p_object_key)
    or lower(btrim(coalesce(p_content_type, ''))) <> 'application/pdf'
    or p_byte_length not between 1 and 1073741824
  then raise exception 'Invalid attachment metadata'; end if;
  v_admin_id := public._video_class_admin_id(p_admin_token);
  if v_admin_id is null then raise exception 'Invalid or expired admin session'; end if;
  if not exists (select 1 from public.video_class_lessons lesson where lesson.id = p_lesson_id) then
    raise exception 'Lesson not found';
  end if;
  if exists (select 1 from public.video_class_lessons lesson where lesson.object_key = p_object_key)
    or exists (select 1 from public.video_class_lesson_renditions rendition where rendition.object_key = p_object_key)
    or exists (select 1 from public.video_class_lesson_thumbnails thumbnail where thumbnail.object_key = p_object_key)
  then raise exception 'Object is already assigned to video content'; end if;

  insert into public.video_class_lesson_attachments (
    lesson_id, display_name, object_key, content_type, byte_length, created_by
  ) values (
    p_lesson_id, v_name, p_object_key, 'application/pdf', p_byte_length, v_admin_id
  ) returning * into v_attachment;
  insert into public.video_class_admin_audit_events (admin_id, action, detail)
  values (v_admin_id, 'add_lesson_attachment', jsonb_build_object(
    'lesson_id', p_lesson_id, 'attachment_id', v_attachment.id,
    'display_name', v_attachment.display_name, 'byte_length', v_attachment.byte_length,
    'object_sha256', encode(extensions.digest(p_object_key, 'sha256'), 'hex')
  ));
  return jsonb_build_object(
    'id', v_attachment.id, 'lesson_id', v_attachment.lesson_id,
    'display_name', v_attachment.display_name, 'content_type', v_attachment.content_type,
    'byte_length', v_attachment.byte_length, 'is_private', v_attachment.is_private,
    'created_at', v_attachment.created_at, 'updated_at', v_attachment.updated_at
  );
exception when unique_violation then raise exception 'Attachment object is already assigned';
end;
$$;

create or replace function public.video_class_admin_set_attachment_private(
  p_service_secret text,
  p_admin_token uuid,
  p_attachment_id uuid,
  p_is_private boolean
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid;
  v_attachment public.video_class_lesson_attachments%rowtype;
begin
  if not public._video_class_worker_ok(p_service_secret) or p_attachment_id is null or p_is_private is null then
    raise exception 'Invalid attachment privacy update';
  end if;
  v_admin_id := public._video_class_admin_id(p_admin_token);
  if v_admin_id is null then raise exception 'Invalid or expired admin session'; end if;
  update public.video_class_lesson_attachments attachment
  set is_private = p_is_private where attachment.id = p_attachment_id
  returning * into v_attachment;
  if not found then raise exception 'Attachment not found'; end if;
  insert into public.video_class_admin_audit_events (admin_id, action, detail)
  values (v_admin_id, case when p_is_private then 'private_attachment' else 'unprivate_attachment' end,
    jsonb_build_object('attachment_id', v_attachment.id, 'lesson_id', v_attachment.lesson_id));
  return jsonb_build_object('id', v_attachment.id, 'lesson_id', v_attachment.lesson_id,
    'is_private', v_attachment.is_private, 'updated_at', v_attachment.updated_at);
end;
$$;

create or replace function public.video_class_admin_prepare_delete_attachment(
  p_service_secret text,
  p_admin_token uuid,
  p_attachment_id uuid
)
returns table (object_key text, lesson_id uuid, display_name text)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public._video_class_worker_ok(p_service_secret)
    or public._video_class_admin_id(p_admin_token) is null
  then return; end if;
  return query select attachment.object_key, attachment.lesson_id, attachment.display_name
  from public.video_class_lesson_attachments attachment
  where attachment.id = p_attachment_id;
end;
$$;

create or replace function public.video_class_admin_finish_delete_attachment(
  p_service_secret text,
  p_admin_token uuid,
  p_attachment_id uuid,
  p_object_key text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare v_admin_id uuid; v_lesson_id uuid; v_name text;
begin
  if not public._video_class_worker_ok(p_service_secret) then return false; end if;
  v_admin_id := public._video_class_admin_id(p_admin_token);
  if v_admin_id is null then return false; end if;
  delete from public.video_class_lesson_attachments attachment
  where attachment.id = p_attachment_id and attachment.object_key = p_object_key
  returning attachment.lesson_id, attachment.display_name into v_lesson_id, v_name;
  if not found then return false; end if;
  insert into public.video_class_admin_audit_events (admin_id, action, detail)
  values (v_admin_id, 'delete_lesson_attachment', jsonb_build_object(
    'attachment_id', p_attachment_id, 'lesson_id', v_lesson_id, 'display_name', v_name,
    'object_sha256', encode(extensions.digest(p_object_key, 'sha256'), 'hex')
  ));
  return true;
end;
$$;

create or replace function public.video_class_authorize_attachment(
  p_service_secret text,
  p_student_token uuid,
  p_lesson_id uuid,
  p_attachment_id uuid
)
returns table (object_key text, content_type text, byte_length bigint, display_name text)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare v_student_id uuid;
begin
  if not public._video_class_worker_ok(p_service_secret) then return; end if;
  v_student_id := public._video_class_student_id(p_student_token);
  if v_student_id is null or not public._video_class_student_can_view_lesson(v_student_id, p_lesson_id) then return; end if;
  return query select attachment.object_key, attachment.content_type,
    attachment.byte_length, attachment.display_name
  from public.video_class_lesson_attachments attachment
  join public.video_class_lessons lesson on lesson.id = attachment.lesson_id
  where attachment.id = p_attachment_id and attachment.lesson_id = p_lesson_id
    and attachment.is_private = false and lesson.is_private = false;
end;
$$;

create or replace function public.video_class_admin_change_feedback(
  p_service_secret text,
  p_admin_token uuid,
  p_student_id uuid,
  p_lesson_id uuid,
  p_picture_quality smallint,
  p_explanation_quality smallint,
  p_audio_quality smallint
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare v_admin_id uuid; v_feedback public.video_class_lesson_feedback%rowtype;
begin
  if not public._video_class_worker_ok(p_service_secret)
    or p_student_id is null or p_lesson_id is null
    or (p_picture_quality is not null and p_picture_quality not between 1 and 5)
    or (p_explanation_quality is not null and p_explanation_quality not between 1 and 5)
    or (p_audio_quality is not null and p_audio_quality not between 1 and 5)
  then raise exception 'Invalid feedback update'; end if;
  v_admin_id := public._video_class_admin_id(p_admin_token);
  if v_admin_id is null then raise exception 'Invalid or expired admin session'; end if;

  if p_picture_quality is null and p_explanation_quality is null and p_audio_quality is null then
    delete from public.video_class_lesson_feedback feedback
    where feedback.student_id = p_student_id and feedback.lesson_id = p_lesson_id
    returning * into v_feedback;
    if not found then raise exception 'Feedback not found'; end if;
    insert into public.video_class_admin_audit_events (admin_id, student_id, action, detail)
    values (v_admin_id, p_student_id, 'delete_lesson_feedback', jsonb_build_object('lesson_id', p_lesson_id));
    return jsonb_build_object('deleted', true, 'student_id', p_student_id, 'lesson_id', p_lesson_id);
  end if;

  update public.video_class_lesson_feedback feedback
  set picture_quality = p_picture_quality,
      explanation_quality = p_explanation_quality,
      audio_quality = p_audio_quality
  where feedback.student_id = p_student_id and feedback.lesson_id = p_lesson_id
  returning * into v_feedback;
  if not found then raise exception 'Feedback not found'; end if;
  insert into public.video_class_admin_audit_events (admin_id, student_id, action, detail)
  values (v_admin_id, p_student_id, 'edit_lesson_feedback', jsonb_build_object(
    'lesson_id', p_lesson_id, 'picture_quality', p_picture_quality,
    'explanation_quality', p_explanation_quality, 'audio_quality', p_audio_quality
  ));
  return jsonb_build_object('deleted', false, 'student_id', p_student_id,
    'lesson_id', p_lesson_id, 'picture_quality', v_feedback.picture_quality,
    'explanation_quality', v_feedback.explanation_quality,
    'audio_quality', v_feedback.audio_quality, 'feedback_updated_at', v_feedback.updated_at);
end;
$$;

-- Keep all new lessons, including lessons published by the pre-existing admin
-- RPC, represented in the multi-course junction without changing that RPC's
-- public signature during rollout.
drop trigger if exists video_class_lessons_seed_primary_course on public.video_class_lessons;
create trigger video_class_lessons_seed_primary_course
after insert on public.video_class_lessons
for each row execute function public.video_class_seed_primary_lesson_course();

drop trigger if exists video_class_attachments_touch on public.video_class_lesson_attachments;
create trigger video_class_attachments_touch
before update on public.video_class_lesson_attachments
for each row execute function public.video_class_touch_updated_at();

drop trigger if exists video_class_official_playlist_items_validate_course
  on public.video_class_official_playlist_items;
create trigger video_class_official_playlist_items_validate_course
before insert or update of playlist_id, lesson_id
on public.video_class_official_playlist_items
for each row execute function public.video_class_validate_official_playlist_item();

drop trigger if exists video_class_course_access_revoke_playbacks
  on public.video_class_student_courses;
create trigger video_class_course_access_revoke_playbacks
after update of student_id, course_code, enabled or delete
on public.video_class_student_courses
for each row execute function public.video_class_revoke_playbacks_on_course_change();

-- Trigger/helper functions are never callable through the REST roles.
revoke all on function public.video_class_seed_primary_lesson_course()
  from public, anon, authenticated;
revoke all on function public.video_class_validate_official_playlist_item()
  from public, anon, authenticated;
revoke all on function public.video_class_revoke_playbacks_on_course_change()
  from public, anon, authenticated;
revoke all on function public._video_class_student_can_view_lesson(uuid, uuid)
  from public, anon, authenticated;
revoke all on function public._video_class_student_playlist_json(uuid, uuid)
  from public, anon, authenticated;

-- Revoke PUBLIC's default function EXECUTE before exposing only the narrow,
-- service-secret-gated RPC surface used by the video Worker.
revoke all on function public.video_class_admin_list_lessons_page(text, uuid, integer, uuid, text)
  from public, anon, authenticated;
revoke all on function public.video_class_admin_set_lesson_courses(text, uuid, uuid, text[])
  from public, anon, authenticated;
revoke all on function public.video_class_admin_list_official_playlists_page(text, uuid, integer, uuid, text)
  from public, anon, authenticated;
revoke all on function public.video_class_admin_save_official_playlist(text, uuid, uuid, text, text, text[], uuid[], boolean)
  from public, anon, authenticated;
revoke all on function public.video_class_admin_add_attachment(text, uuid, uuid, text, text, text, bigint)
  from public, anon, authenticated;
revoke all on function public.video_class_admin_set_attachment_private(text, uuid, uuid, boolean)
  from public, anon, authenticated;
revoke all on function public.video_class_admin_prepare_delete_attachment(text, uuid, uuid)
  from public, anon, authenticated;
revoke all on function public.video_class_admin_finish_delete_attachment(text, uuid, uuid, text)
  from public, anon, authenticated;
revoke all on function public.video_class_authorize_attachment(text, uuid, uuid, uuid)
  from public, anon, authenticated;
revoke all on function public.video_class_admin_change_feedback(text, uuid, uuid, uuid, smallint, smallint, smallint)
  from public, anon, authenticated;
revoke all on function public.video_class_admin_list_feedback_page(text, uuid, integer, text)
  from public, anon, authenticated;
revoke all on function public.video_class_student_list_courses(text, uuid)
  from public, anon, authenticated;
revoke all on function public.video_class_student_list_lessons(text, uuid)
  from public, anon, authenticated;
revoke all on function public.video_class_student_toggle_bookmark(text, uuid, uuid, boolean)
  from public, anon, authenticated;
revoke all on function public.video_class_student_save_note(text, uuid, uuid, text)
  from public, anon, authenticated;
revoke all on function public.video_class_student_library_page(text, uuid, integer, text, text, text, text, uuid)
  from public, anon, authenticated;
revoke all on function public.video_class_student_analytics(text, uuid)
  from public, anon, authenticated;
revoke all on function public.video_class_student_create_playlist(text, uuid, text)
  from public, anon, authenticated;
revoke all on function public.video_class_student_create_clip(text, uuid, uuid, numeric, text)
  from public, anon, authenticated;
revoke all on function public.video_class_authorize_thumbnail(text, uuid, uuid)
  from public, anon, authenticated;
revoke all on function public.video_class_playback_list_renditions(text, uuid)
  from public, anon, authenticated;
revoke all on function public.video_class_authorize_rendition(text, uuid, uuid, text, text, text, text)
  from public, anon, authenticated;
revoke all on function public.video_class_create_playback(text, uuid, text, text, text)
  from public, anon, authenticated;
revoke all on function public.video_class_authorize_playback(text, uuid, uuid, text, text, text)
  from public, anon, authenticated;
revoke all on function public.video_class_record_progress(text, uuid, uuid, numeric, numeric)
  from public, anon, authenticated;

grant execute on function public.video_class_admin_list_lessons_page(text, uuid, integer, uuid, text) to anon;
grant execute on function public.video_class_admin_set_lesson_courses(text, uuid, uuid, text[]) to anon;
grant execute on function public.video_class_admin_list_official_playlists_page(text, uuid, integer, uuid, text) to anon;
grant execute on function public.video_class_admin_save_official_playlist(text, uuid, uuid, text, text, text[], uuid[], boolean) to anon;
grant execute on function public.video_class_admin_add_attachment(text, uuid, uuid, text, text, text, bigint) to anon;
grant execute on function public.video_class_admin_set_attachment_private(text, uuid, uuid, boolean) to anon;
grant execute on function public.video_class_admin_prepare_delete_attachment(text, uuid, uuid) to anon;
grant execute on function public.video_class_admin_finish_delete_attachment(text, uuid, uuid, text) to anon;
grant execute on function public.video_class_authorize_attachment(text, uuid, uuid, uuid) to anon;
grant execute on function public.video_class_admin_change_feedback(text, uuid, uuid, uuid, smallint, smallint, smallint) to anon;
grant execute on function public.video_class_admin_list_feedback_page(text, uuid, integer, text) to anon;
grant execute on function public.video_class_student_list_courses(text, uuid) to anon;
grant execute on function public.video_class_student_list_lessons(text, uuid) to anon;
grant execute on function public.video_class_student_toggle_bookmark(text, uuid, uuid, boolean) to anon;
grant execute on function public.video_class_student_save_note(text, uuid, uuid, text) to anon;
grant execute on function public.video_class_student_library_page(text, uuid, integer, text, text, text, text, uuid) to anon;
grant execute on function public.video_class_student_analytics(text, uuid) to anon;
grant execute on function public.video_class_student_create_playlist(text, uuid, text) to anon;
grant execute on function public.video_class_student_create_clip(text, uuid, uuid, numeric, text) to anon;
grant execute on function public.video_class_authorize_thumbnail(text, uuid, uuid) to anon;
grant execute on function public.video_class_playback_list_renditions(text, uuid) to anon;
grant execute on function public.video_class_authorize_rendition(text, uuid, uuid, text, text, text, text) to anon;
grant execute on function public.video_class_create_playback(text, uuid, text, text, text) to anon;
grant execute on function public.video_class_authorize_playback(text, uuid, uuid, text, text, text) to anon;
grant execute on function public.video_class_record_progress(text, uuid, uuid, numeric, numeric) to anon;

notify pgrst, 'reload schema';

commit;

-- The post-expansion administrator/library controls live in
-- supabase-video-class-admin-library-control.sql. Apply that migration next;
-- keeping it separate makes its destructive-object workflow auditable and
-- preserves this historical expansion migration for existing installations.
