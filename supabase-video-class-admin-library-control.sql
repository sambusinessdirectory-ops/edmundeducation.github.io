-- Video Class admin/library control upgrade.
--
-- Adds editable lesson metadata, GIF/custom thumbnails, two-phase lesson/R2
-- deletion, per-student official-series entitlements, and administrator-
-- controlled series ordering. Existing students retain their present access.

begin;

do $$
begin
  if to_regclass('public.video_class_lessons') is null
    or to_regclass('public.video_class_lesson_courses') is null
    or to_regclass('public.video_class_lesson_renditions') is null
    or to_regclass('public.video_class_lesson_thumbnails') is null
    or to_regclass('public.video_class_lesson_attachments') is null
    or to_regclass('public.video_class_official_playlists') is null
    or to_regclass('public.video_class_official_playlist_courses') is null
    or to_regclass('public.video_class_official_playlist_items') is null
    or to_regclass('public.video_class_student_courses') is null
    or to_regclass('public.video_class_admin_audit_events') is null
    or to_regclass('public.video_class_tags') is null
    or to_regclass('public.video_class_lesson_tags') is null
    or to_regclass('public.video_class_playback_sessions') is null
    or to_regprocedure('public._video_class_worker_ok(text)') is null
    or to_regprocedure('public._video_class_admin_id(uuid)') is null
    or to_regprocedure('public._video_class_student_id(uuid)') is null
    or to_regprocedure('public._video_class_valid_object_key(text)') is null
    or to_regprocedure('public.video_class_touch_updated_at()') is null
    or (
      to_regprocedure('public.video_class_admin_publish_r2_object(text,uuid,text,text,text,text,text,text,integer,integer,text,bigint,jsonb,jsonb,jsonb)') is null
      and to_regprocedure('public._video_class_admin_publish_r2_object_single_course(text,uuid,text,text,text,text,text,text,integer,integer,text,bigint,jsonb,jsonb,jsonb)') is null
    )
  then
    raise exception 'Apply the Video Class base and library-expansion schemas first';
  end if;
end;
$$;

alter table public.video_class_lesson_thumbnails
  drop constraint if exists video_class_lesson_thumbnails_content_type_check;
alter table public.video_class_lesson_thumbnails
  add constraint video_class_lesson_thumbnails_content_type_check
  check (content_type in (
    'image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'
  ));

alter table public.video_class_student_courses
  add column if not exists official_playlist_mode text not null default 'all';

do $$
begin
  if not exists (
    select 1 from pg_catalog.pg_constraint constraint_record
    where constraint_record.conrelid = 'public.video_class_student_courses'::regclass
      and constraint_record.conname = 'video_class_student_courses_official_playlist_mode_check'
  ) then
    alter table public.video_class_student_courses
      add constraint video_class_student_courses_official_playlist_mode_check
      check (official_playlist_mode in ('all', 'none', 'manual'));
  end if;
end;
$$;

create table if not exists public.video_class_student_official_playlists (
  student_id uuid not null,
  course_code text not null,
  playlist_id uuid not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.video_class_admin_accounts(id) on delete set null,
  primary key (student_id, course_code, playlist_id),
  constraint video_class_student_official_playlists_student_course_fkey
    foreign key (student_id, course_code)
    references public.video_class_student_courses(student_id, course_code)
    on update cascade on delete cascade,
  constraint video_class_student_official_playlists_playlist_course_fkey
    foreign key (playlist_id, course_code)
    references public.video_class_official_playlist_courses(playlist_id, course_code)
    on update cascade on delete cascade
);

-- If an earlier pre-release draft created global overrides, preserve their
-- meaning by fanning each row out to the student's matching course grants.
do $$
declare
  v_primary_key_name text;
begin
  if not exists (
    select 1
    from pg_catalog.pg_attribute attribute
    where attribute.attrelid = 'public.video_class_student_official_playlists'::regclass
      and attribute.attname = 'course_code'
      and not attribute.attisdropped
  ) then
    create temporary table video_class_series_access_course_backfill
    on commit drop
    as
    select
      legacy.student_id,
      membership.course_code,
      legacy.playlist_id,
      legacy.enabled,
      legacy.created_at,
      legacy.updated_at,
      legacy.updated_by
    from public.video_class_student_official_playlists legacy
    join public.video_class_official_playlist_courses membership
      on membership.playlist_id = legacy.playlist_id
    join public.video_class_student_courses course_access
      on course_access.student_id = legacy.student_id
     and course_access.course_code = membership.course_code;

    alter table public.video_class_student_official_playlists
      add column course_code text;

    select constraint_record.conname
    into v_primary_key_name
    from pg_catalog.pg_constraint constraint_record
    where constraint_record.conrelid = 'public.video_class_student_official_playlists'::regclass
      and constraint_record.contype = 'p';
    if v_primary_key_name is not null then
      execute format(
        'alter table public.video_class_student_official_playlists drop constraint %I',
        v_primary_key_name
      );
    end if;

    delete from public.video_class_student_official_playlists;
    insert into public.video_class_student_official_playlists (
      student_id, course_code, playlist_id, enabled,
      created_at, updated_at, updated_by
    )
    select
      student_id, course_code, playlist_id, enabled,
      created_at, updated_at, updated_by
    from video_class_series_access_course_backfill;
  end if;

  alter table public.video_class_student_official_playlists
    alter column course_code set not null;

  if not exists (
    select 1
    from pg_catalog.pg_constraint constraint_record
    where constraint_record.conrelid = 'public.video_class_student_official_playlists'::regclass
      and constraint_record.contype = 'p'
      and pg_catalog.pg_get_constraintdef(constraint_record.oid)
        = 'PRIMARY KEY (student_id, course_code, playlist_id)'
  ) then
    select constraint_record.conname
    into v_primary_key_name
    from pg_catalog.pg_constraint constraint_record
    where constraint_record.conrelid = 'public.video_class_student_official_playlists'::regclass
      and constraint_record.contype = 'p';
    if v_primary_key_name is not null then
      execute format(
        'alter table public.video_class_student_official_playlists drop constraint %I',
        v_primary_key_name
      );
    end if;
    alter table public.video_class_student_official_playlists
      add primary key (student_id, course_code, playlist_id);
  end if;

  if not exists (
    select 1 from pg_catalog.pg_constraint constraint_record
    where constraint_record.conrelid = 'public.video_class_student_official_playlists'::regclass
      and constraint_record.conname = 'video_class_student_official_playlists_student_course_fkey'
  ) then
    alter table public.video_class_student_official_playlists
      add constraint video_class_student_official_playlists_student_course_fkey
      foreign key (student_id, course_code)
      references public.video_class_student_courses(student_id, course_code)
      on update cascade on delete cascade;
  end if;

  if not exists (
    select 1 from pg_catalog.pg_constraint constraint_record
    where constraint_record.conrelid = 'public.video_class_student_official_playlists'::regclass
      and constraint_record.conname = 'video_class_student_official_playlists_playlist_course_fkey'
  ) then
    alter table public.video_class_student_official_playlists
      add constraint video_class_student_official_playlists_playlist_course_fkey
      foreign key (playlist_id, course_code)
      references public.video_class_official_playlist_courses(playlist_id, course_code)
      on update cascade on delete cascade;
  end if;
end;
$$;

drop index if exists public.video_class_student_official_playlists_playlist_idx;
create index video_class_student_official_playlists_playlist_idx
  on public.video_class_student_official_playlists (playlist_id, course_code, student_id)
  where enabled = true;
create index if not exists video_class_student_official_playlists_student_playlist_idx
  on public.video_class_student_official_playlists (student_id, playlist_id, course_code);
create index if not exists video_class_student_official_playlists_updated_by_idx
  on public.video_class_student_official_playlists (updated_by)
  where updated_by is not null;

create table if not exists public.video_class_library_settings (
  singleton boolean primary key default true check (singleton),
  official_playlist_order_mode text not null default 'manual'
    check (official_playlist_order_mode in ('manual', 'random')),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.video_class_admin_accounts(id) on delete set null
);
insert into public.video_class_library_settings (singleton)
values (true) on conflict (singleton) do nothing;

create table if not exists public.video_class_lesson_deletion_jobs (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null unique references public.video_class_lessons(id) on delete cascade,
  object_keys text[] not null check (cardinality(object_keys) >= 1),
  lesson_title text not null,
  requested_at timestamptz not null default now(),
  requested_by uuid references public.video_class_admin_accounts(id) on delete set null
);
create index if not exists video_class_lesson_deletion_jobs_requested_idx
  on public.video_class_lesson_deletion_jobs (requested_at, id);
create index if not exists video_class_lesson_deletion_jobs_requested_by_idx
  on public.video_class_lesson_deletion_jobs (requested_by)
  where requested_by is not null;

create table if not exists public.video_class_admin_preview_grants (
  preview_hash bytea primary key,
  admin_session_hash bytea not null
    references public.video_class_admin_sessions(token_hash) on delete cascade,
  admin_id uuid not null references public.video_class_admin_accounts(id) on delete cascade,
  lesson_id uuid not null references public.video_class_lessons(id) on delete cascade,
  user_agent_hash text not null check (user_agent_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  check (expires_at > created_at)
);
create index if not exists video_class_admin_preview_grants_expiry_idx
  on public.video_class_admin_preview_grants (expires_at);
create index if not exists video_class_admin_preview_grants_lesson_idx
  on public.video_class_admin_preview_grants (lesson_id, expires_at desc);
create index if not exists video_class_admin_preview_grants_admin_idx
  on public.video_class_admin_preview_grants (admin_id, expires_at desc);
create index if not exists video_class_admin_preview_grants_session_idx
  on public.video_class_admin_preview_grants (admin_session_hash);
create index if not exists video_class_library_settings_updated_by_idx
  on public.video_class_library_settings (updated_by)
  where updated_by is not null;

alter table public.video_class_student_official_playlists enable row level security;
alter table public.video_class_library_settings enable row level security;
alter table public.video_class_lesson_deletion_jobs enable row level security;
alter table public.video_class_admin_preview_grants enable row level security;
revoke all on table public.video_class_student_official_playlists from public, anon, authenticated;
revoke all on table public.video_class_library_settings from public, anon, authenticated;
revoke all on table public.video_class_lesson_deletion_jobs from public, anon, authenticated;
revoke all on table public.video_class_admin_preview_grants from public, anon, authenticated;

drop trigger if exists video_class_student_official_playlists_touch
  on public.video_class_student_official_playlists;
create trigger video_class_student_official_playlists_touch
before update on public.video_class_student_official_playlists
for each row execute function public.video_class_touch_updated_at();

drop trigger if exists video_class_library_settings_touch
  on public.video_class_library_settings;
create trigger video_class_library_settings_touch
before update on public.video_class_library_settings
for each row execute function public.video_class_touch_updated_at();

do $$
begin
  alter table public.video_class_admin_audit_events
    drop constraint if exists video_class_admin_audit_events_action_check;
  alter table public.video_class_admin_audit_events
    add constraint video_class_admin_audit_events_action_check
    check (action in (
      'issue_key', 'rotate_key', 'clear_key', 'enable_access', 'disable_access',
      'enable_course', 'disable_course', 'enable_watermark', 'disable_watermark',
      'private_lesson', 'unprivate_lesson', 'publish_lesson',
      'set_lesson_courses', 'save_official_playlist', 'add_lesson_attachment',
      'private_attachment', 'unprivate_attachment', 'delete_lesson_attachment',
      'edit_lesson_feedback', 'delete_lesson_feedback',
      'edit_lesson', 'set_lesson_thumbnail', 'remove_lesson_thumbnail',
      'prepare_delete_lesson', 'delete_lesson',
      'set_student_series_mode', 'set_student_series_access',
      'replace_student_series_access', 'set_official_playlist_order'
    ));
end;
$$;

create or replace function public.video_class_revoke_playbacks_on_course_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
  v_old_course_code text;
  v_course_code text;
begin
  if tg_op = 'DELETE' then
    v_student_id := old.student_id;
    v_old_course_code := old.course_code;
    v_course_code := old.course_code;
  else
    v_student_id := new.student_id;
    v_old_course_code := old.course_code;
    v_course_code := new.course_code;
  end if;
  if tg_op = 'DELETE'
    or (tg_op = 'UPDATE' and (
      old.student_id is distinct from new.student_id
      or old.course_code is distinct from new.course_code
      or old.enabled is distinct from new.enabled
      or old.official_playlist_mode is distinct from new.official_playlist_mode
    ))
  then
    update public.video_class_playback_sessions playback
    set revoked_at = coalesce(playback.revoked_at, now())
    from public.video_class_lesson_courses lesson_course
    where playback.lesson_id = lesson_course.lesson_id
      and playback.student_id = v_student_id
      and lesson_course.course_code = v_course_code
      and playback.revoked_at is null;
    if tg_op = 'UPDATE' and v_old_course_code is distinct from v_course_code then
      update public.video_class_playback_sessions playback
      set revoked_at = coalesce(playback.revoked_at, now())
      from public.video_class_lesson_courses lesson_course
      where playback.lesson_id = lesson_course.lesson_id
        and playback.student_id = v_student_id
        and lesson_course.course_code = v_old_course_code
        and playback.revoked_at is null;
    end if;
  end if;
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

revoke all on function public.video_class_revoke_playbacks_on_course_change()
  from public, anon, authenticated;

drop trigger if exists video_class_course_access_revoke_playbacks
  on public.video_class_student_courses;
create trigger video_class_course_access_revoke_playbacks
after update of student_id, course_code, enabled or delete
on public.video_class_student_courses
for each row execute function public.video_class_revoke_playbacks_on_course_change();

drop trigger if exists video_class_series_mode_revoke_playbacks
  on public.video_class_student_courses;
create trigger video_class_series_mode_revoke_playbacks
after update of official_playlist_mode
on public.video_class_student_courses
for each row execute function public.video_class_revoke_playbacks_on_course_change();

create or replace function public.video_class_revoke_playbacks_on_series_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
  v_playlist_id uuid;
begin
  if tg_op = 'DELETE' then
    v_student_id := old.student_id;
    v_playlist_id := old.playlist_id;
  else
    v_student_id := new.student_id;
    v_playlist_id := new.playlist_id;
  end if;
  if tg_op in ('INSERT', 'DELETE')
    or (tg_op = 'UPDATE' and (
      old.student_id is distinct from new.student_id
      or old.course_code is distinct from new.course_code
      or old.playlist_id is distinct from new.playlist_id
      or old.enabled is distinct from new.enabled
    ))
  then
    update public.video_class_playback_sessions playback
    set revoked_at = coalesce(playback.revoked_at, now())
    from public.video_class_official_playlist_items item
    where item.playlist_id = v_playlist_id
      and item.lesson_id = playback.lesson_id
      and playback.student_id = v_student_id
      and playback.revoked_at is null
      and not public._video_class_student_can_view_lesson(
        v_student_id,
        playback.lesson_id
      );
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

revoke all on function public.video_class_revoke_playbacks_on_series_change()
  from public, anon, authenticated;

drop trigger if exists video_class_series_access_revoke_playbacks
  on public.video_class_student_official_playlists;
create trigger video_class_series_access_revoke_playbacks
after insert or update or delete
on public.video_class_student_official_playlists
for each row execute function public.video_class_revoke_playbacks_on_series_change();

create or replace function public.video_class_block_object_change_during_delete()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (
    select 1
    from public.video_class_lesson_deletion_jobs deletion_job
    where deletion_job.lesson_id = new.lesson_id
  ) then
    raise exception 'Lesson deletion is already in progress';
  end if;
  return new;
end;
$$;

revoke all on function public.video_class_block_object_change_during_delete()
  from public, anon, authenticated;

drop trigger if exists video_class_renditions_block_pending_delete
  on public.video_class_lesson_renditions;
create trigger video_class_renditions_block_pending_delete
before insert or update
on public.video_class_lesson_renditions
for each row execute function public.video_class_block_object_change_during_delete();

drop trigger if exists video_class_thumbnails_block_pending_delete
  on public.video_class_lesson_thumbnails;
create trigger video_class_thumbnails_block_pending_delete
before insert or update
on public.video_class_lesson_thumbnails
for each row execute function public.video_class_block_object_change_during_delete();

drop trigger if exists video_class_attachments_block_pending_delete
  on public.video_class_lesson_attachments;
create trigger video_class_attachments_block_pending_delete
before insert or update
on public.video_class_lesson_attachments
for each row execute function public.video_class_block_object_change_during_delete();

create or replace function public._video_class_student_can_view_official_playlist(
  p_student_id uuid,
  p_playlist_id uuid,
  p_course_code text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_student_id is not null
    and p_playlist_id is not null
    and p_course_code is not null
    and exists (
      select 1
      from public.video_class_official_playlists playlist
      join public.video_class_official_playlist_courses playlist_course
        on playlist_course.playlist_id = playlist.id
      join public.video_class_student_courses course_access
        on course_access.student_id = p_student_id
       and course_access.course_code = playlist_course.course_code
       and course_access.enabled = true
      join public.video_class_courses course
        on course.code = playlist_course.course_code and course.published = true
      where playlist.id = p_playlist_id
        and playlist_course.course_code = p_course_code
        and playlist.published = true
        and (
          course_access.official_playlist_mode = 'all'
          or (
            course_access.official_playlist_mode = 'manual'
            and exists (
              select 1
              from public.video_class_student_official_playlists series_access
              where series_access.student_id = p_student_id
                and series_access.course_code = playlist_course.course_code
                and series_access.playlist_id = playlist.id
                and series_access.enabled = true
            )
          )
        )
    );
$$;

revoke all on function public._video_class_student_can_view_official_playlist(uuid, uuid, text)
  from public, anon, authenticated;

-- Backwards-safe wrapper for queries that intentionally ask whether any one
-- entitled course exposes this series. Course-filtered paths use the scoped
-- helper above.
create or replace function public._video_class_student_can_view_official_playlist(
  p_student_id uuid,
  p_playlist_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.video_class_official_playlist_courses membership
    where membership.playlist_id = p_playlist_id
      and public._video_class_student_can_view_official_playlist(
        p_student_id,
        p_playlist_id,
        membership.course_code
      )
  );
$$;

revoke all on function public._video_class_student_can_view_official_playlist(uuid, uuid)
  from public, anon, authenticated;

create or replace function public._video_class_student_can_view_lesson_via_course(
  p_student_id uuid,
  p_lesson_id uuid,
  p_course_code text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_student_id is not null
    and p_lesson_id is not null
    and p_course_code is not null
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
        and lesson_course.course_code = p_course_code
        and lesson.published = true
        and lesson.is_private = false
        and (
          not exists (
            select 1
            from public.video_class_official_playlist_items item
            join public.video_class_official_playlists playlist
              on playlist.id = item.playlist_id and playlist.published = true
            join public.video_class_official_playlist_courses playlist_course
              on playlist_course.playlist_id = playlist.id
             and playlist_course.course_code = lesson_course.course_code
            where item.lesson_id = lesson.id
          )
          or exists (
            select 1
            from public.video_class_official_playlist_items item
            join public.video_class_official_playlist_courses playlist_course
              on playlist_course.playlist_id = item.playlist_id
             and playlist_course.course_code = lesson_course.course_code
            where item.lesson_id = lesson.id
              and public._video_class_student_can_view_official_playlist(
                p_student_id,
                item.playlist_id,
                lesson_course.course_code
              )
          )
        )
    );
$$;

revoke all on function public._video_class_student_can_view_lesson_via_course(uuid, uuid, text)
  from public, anon, authenticated;

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
  select exists (
    select 1
    from public.video_class_lessons lesson
    join public.video_class_lesson_courses lesson_course
      on lesson_course.lesson_id = lesson.id
    join public.video_class_student_courses access
      on access.student_id = p_student_id
     and access.course_code = lesson_course.course_code
     and access.enabled = true
    where lesson.id = p_lesson_id
      and public._video_class_student_can_view_lesson_via_course(
        p_student_id,
        p_lesson_id,
        lesson_course.course_code
      )
  );
$$;

revoke all on function public._video_class_student_can_view_lesson(uuid, uuid)
  from public, anon, authenticated;

-- The upgraded roster adds the series_access OUT column. PostgreSQL cannot
-- change a TABLE-returning function's row type through CREATE OR REPLACE, so
-- remove the old signature inside this same transaction before recreating it.
drop function if exists public.video_class_admin_list_students(text, uuid);

create or replace function public.video_class_admin_list_students(
  p_service_secret text,
  p_admin_token uuid
)
returns table (
  student_id uuid,
  name text,
  video_key text,
  enabled boolean,
  watermark_enabled boolean,
  course_codes text[],
  series_access jsonb,
  account_created_at timestamptz,
  key_created_at timestamptz,
  key_updated_at timestamptz,
  last_video_login_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public._video_class_worker_ok(p_service_secret)
    or public._video_class_admin_id(p_admin_token) is null
  then
    raise exception 'Invalid or expired admin session';
  end if;

  return query
  select
    student.id,
    student.name,
    access.video_key,
    access.enabled,
    coalesce(access.watermark_enabled, true),
    coalesce(course_access.course_codes, array[]::text[]),
    coalesce(series_access.series_access, '[]'::jsonb),
    student.created_at,
    access.created_at,
    access.updated_at,
    login.last_video_login_at
  from public.flashcard_students student
  left join public.video_class_student_access access on access.student_id = student.id
  left join lateral (
    select max(session.created_at) as last_video_login_at
    from public.video_class_student_sessions session
    where session.student_id = student.id
  ) login on true
  left join lateral (
    select array_agg(student_course.course_code order by course.sort_order, student_course.course_code)
      as course_codes
    from public.video_class_student_courses student_course
    join public.video_class_courses course on course.code = student_course.course_code
    where student_course.student_id = student.id
      and student_course.enabled = true
  ) course_access on true
  left join lateral (
    select jsonb_agg(
      jsonb_build_object(
        'course_code', student_course.course_code,
        'course_title', course.title,
        'mode', student_course.official_playlist_mode,
        'playlists', coalesce((
          select jsonb_agg(
            jsonb_build_object(
              'playlist_id', playlist.id,
              'name', playlist.name,
              'published', playlist.published,
              'enabled', case
                when student_course.official_playlist_mode = 'all' then true
                when student_course.official_playlist_mode = 'none' then false
                else coalesce(series_override.enabled, false)
              end
            ) order by playlist.sort_order, playlist.name, playlist.id
          )
          from public.video_class_official_playlist_courses membership
          join public.video_class_official_playlists playlist
            on playlist.id = membership.playlist_id
          left join public.video_class_student_official_playlists series_override
            on series_override.student_id = student.id
           and series_override.course_code = student_course.course_code
           and series_override.playlist_id = playlist.id
          where membership.course_code = student_course.course_code
        ), '[]'::jsonb)
      ) order by course.sort_order, student_course.course_code
    ) as series_access
    from public.video_class_student_courses student_course
    join public.video_class_courses course on course.code = student_course.course_code
    where student_course.student_id = student.id
      and student_course.enabled = true
  ) series_access on true
  where student.deleted_at is null
  order by student.created_at, lower(student.name), student.id;
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
        and public._video_class_student_can_view_lesson_via_course(
          v_student_id,
          lesson.id,
          membership.course_code
        )
      order by
        (v_course_code is not null and membership.course_code = v_course_code) desc,
        (membership.course_code = lesson.course_code) desc,
        course.sort_order,
        course.code
      limit 1
    ) display_course on true
    where lesson.published = true
      and (
        (v_course_code is null and public._video_class_student_can_view_lesson(
          v_student_id,
          lesson.id
        ))
        or
        (v_course_code is not null and public._video_class_student_can_view_lesson_via_course(
          v_student_id,
          lesson.id,
          v_course_code
        ))
      )
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
            and public._video_class_student_can_view_official_playlist(
              v_student_id,
              playlist.id,
              playlist_course.course_code
            )
            and (v_course_code is null or playlist_course.course_code = v_course_code)
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
            and public._video_class_student_can_view_official_playlist(
              v_student_id,
              playlist.id,
              playlist_course.course_code
            )
            and (v_course_code is null or playlist_course.course_code = v_course_code)
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
            and public._video_class_student_can_view_lesson_via_course(
              v_student_id,
              lesson.id,
              membership.course_code
            )
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
                and public._video_class_student_can_view_official_playlist(
                  v_student_id,
                  playlist.id,
                  playlist_course.course_code
                )
                and (v_course_code is null or playlist_course.course_code = v_course_code)
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
        'sort_order', playlist.sort_order,
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
            and public._video_class_student_can_view_official_playlist(
              v_student_id,
              playlist.id,
              membership.course_code
            )
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
                and public._video_class_student_can_view_official_playlist(
                  v_student_id,
                  playlist.id,
                  playlist_course.course_code
                )
                and (v_course_code is null or playlist_course.course_code = v_course_code)
            )
        )
      ) order by playlist.sort_order, playlist.name, playlist.id)
      from (
        select available.*
        from public.video_class_official_playlists available
        where available.published = true
          and exists (
            select 1
            from public.video_class_official_playlist_courses entitled_course
            where entitled_course.playlist_id = available.id
              and public._video_class_student_can_view_official_playlist(
                v_student_id,
                available.id,
                entitled_course.course_code
              )
              and (v_course_code is null or entitled_course.course_code = v_course_code)
          )
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
                  and public._video_class_student_can_view_official_playlist(
                    v_student_id,
                    available.id,
                    playlist_course.course_code
                  )
                  and (v_course_code is null or playlist_course.course_code = v_course_code)
              )
          )
        order by available.sort_order, available.name, available.id
        limit 500
      ) playlist
    ), '[]'::jsonb) end,
    'officialPlaylistOrderMode', case when p_after_cursor is not null then null else coalesce((
      select settings.official_playlist_order_mode
      from public.video_class_library_settings settings
      where settings.singleton = true
    ), 'manual') end,
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
          'thumbnail', (
            select jsonb_build_object(
              'content_type', thumbnail.content_type,
              'byte_length', thumbnail.byte_length,
              'enabled', thumbnail.enabled,
              'updated_at', thumbnail.updated_at
            )
            from public.video_class_lesson_thumbnails thumbnail
            where thumbnail.lesson_id = lesson.id
          ),
          'deletion_pending', exists (
            select 1 from public.video_class_lesson_deletion_jobs deletion_job
            where deletion_job.lesson_id = lesson.id
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
    'order_mode', coalesce((
      select settings.official_playlist_order_mode
      from public.video_class_library_settings settings
      where settings.singleton = true
    ), 'manual'),
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
  v_playlist_created boolean := false;
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
    v_playlist_created := true;
  else
    update public.video_class_official_playlists playlist
    set course_code = v_primary_course, name = v_name, description = v_description, published = p_published
    where playlist.id = p_playlist_id
    returning * into v_playlist;
    if not found then raise exception 'Official series not found'; end if;
  end if;

  delete from public.video_class_official_playlist_items item where item.playlist_id = v_playlist.id;
  insert into public.video_class_official_playlist_courses (playlist_id, course_code, created_by)
  select v_playlist.id, code, v_admin_id from unnest(v_codes) code
  on conflict (playlist_id, course_code) do nothing;

  delete from public.video_class_official_playlist_courses membership
  where membership.playlist_id = v_playlist.id
    and not (membership.course_code = any(v_codes));

  -- Course grants default to all currently available series. Materializing an
  -- allow row at creation time also preserves that snapshot if an admin later
  -- changes the course to manual mode for the student.
  insert into public.video_class_student_official_playlists (
    student_id, course_code, playlist_id, enabled, updated_by
  )
  select access.student_id, access.course_code, v_playlist.id, true, v_admin_id
  from public.video_class_student_courses access
  where access.course_code = any(v_codes)
    and access.enabled = true
    and access.official_playlist_mode = 'all'
  on conflict (student_id, course_code, playlist_id) do nothing;
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

create or replace function public.video_class_admin_update_lesson(
  p_service_secret text,
  p_admin_token uuid,
  p_lesson_id uuid,
  p_title text,
  p_description text,
  p_course_codes text[],
  p_tags jsonb,
  p_duration_seconds integer
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid;
  v_lesson public.video_class_lessons%rowtype;
  v_title text := btrim(coalesce(p_title, ''));
  v_description text := coalesce(p_description, '');
  v_codes text[];
  v_previous_codes text[];
  v_primary_course text;
  v_tag jsonb;
  v_tag_label text;
  v_tag_slug text;
begin
  if not public._video_class_worker_ok(p_service_secret)
    or p_lesson_id is null
    or length(v_title) not between 1 and 160
    or length(v_description) > 2000
    or p_duration_seconds not between 1 and 86400
  then
    raise exception 'Invalid lesson metadata';
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

  p_tags := coalesce(p_tags, '[]'::jsonb);
  if jsonb_typeof(p_tags) <> 'array' or jsonb_array_length(p_tags) > 30 then
    raise exception 'Tags must be an array containing at most 30 entries';
  end if;
  for v_tag in select value from jsonb_array_elements(p_tags)
  loop
    if jsonb_typeof(v_tag) = 'string' then
      v_tag_label := btrim(v_tag #>> '{}');
      v_tag_slug := lower(regexp_replace(v_tag_label, '[^A-Za-z0-9]+', '-', 'g'));
      v_tag_slug := regexp_replace(v_tag_slug, '(^-+|-+$)', '', 'g');
    elsif jsonb_typeof(v_tag) = 'object' then
      v_tag_label := btrim(coalesce(v_tag ->> 'label', ''));
      v_tag_slug := lower(btrim(coalesce(v_tag ->> 'slug', '')));
      if length(v_tag_slug) = 0 then
        v_tag_slug := lower(regexp_replace(v_tag_label, '[^A-Za-z0-9]+', '-', 'g'));
        v_tag_slug := regexp_replace(v_tag_slug, '(^-+|-+$)', '', 'g');
      end if;
    else
      raise exception 'Each tag must be a label or an object';
    end if;
    if length(v_tag_slug) = 0 and length(v_tag_label) > 0 then
      v_tag_slug := 'tag-' || substr(
        encode(extensions.digest(lower(v_tag_label), 'sha256'), 'hex'), 1, 16
      );
    end if;
    if length(v_tag_label) not between 1 and 80
      or length(v_tag_slug) > 80
      or v_tag_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    then raise exception 'Invalid tag metadata'; end if;
  end loop;

  select lesson.* into v_lesson
  from public.video_class_lessons lesson
  where lesson.id = p_lesson_id
  for update;
  if not found then raise exception 'Lesson not found'; end if;
  if exists (
    select 1 from public.video_class_lesson_deletion_jobs deletion_job
    where deletion_job.lesson_id = p_lesson_id
  ) then raise exception 'Lesson deletion is already in progress'; end if;

  select array_agg(membership.course_code order by membership.course_code)
  into v_previous_codes
  from public.video_class_lesson_courses membership
  where membership.lesson_id = p_lesson_id;

  if exists (
    select 1
    from public.video_class_official_playlist_items item
    where item.lesson_id = p_lesson_id
      and not exists (
        select 1 from public.video_class_official_playlist_courses playlist_course
        where playlist_course.playlist_id = item.playlist_id
          and playlist_course.course_code = any(v_codes)
      )
  ) then
    raise exception 'Remove this lesson from incompatible official series before changing its courses';
  end if;

  select course.code into v_primary_course
  from public.video_class_courses course
  where course.code = any(v_codes)
  order by course.sort_order, course.code
  limit 1;

  delete from public.video_class_lesson_courses membership
  where membership.lesson_id = p_lesson_id;
  insert into public.video_class_lesson_courses (lesson_id, course_code, created_by)
  select p_lesson_id, code, v_admin_id from unnest(v_codes) code;

  update public.video_class_lessons lesson
  set title = v_title,
      description = v_description,
      course_code = v_primary_course,
      duration_seconds = p_duration_seconds
  where lesson.id = p_lesson_id
  returning lesson.* into v_lesson;

  delete from public.video_class_lesson_tags lesson_tag
  where lesson_tag.lesson_id = p_lesson_id;
  for v_tag in select value from jsonb_array_elements(p_tags)
  loop
    if jsonb_typeof(v_tag) = 'string' then
      v_tag_label := btrim(v_tag #>> '{}');
      v_tag_slug := lower(regexp_replace(v_tag_label, '[^A-Za-z0-9]+', '-', 'g'));
      v_tag_slug := regexp_replace(v_tag_slug, '(^-+|-+$)', '', 'g');
    else
      v_tag_label := btrim(v_tag ->> 'label');
      v_tag_slug := lower(btrim(coalesce(v_tag ->> 'slug', '')));
      if length(v_tag_slug) = 0 then
        v_tag_slug := lower(regexp_replace(v_tag_label, '[^A-Za-z0-9]+', '-', 'g'));
        v_tag_slug := regexp_replace(v_tag_slug, '(^-+|-+$)', '', 'g');
      end if;
    end if;
    if length(v_tag_slug) = 0 then
      v_tag_slug := 'tag-' || substr(
        encode(extensions.digest(lower(v_tag_label), 'sha256'), 'hex'), 1, 16
      );
    end if;
    insert into public.video_class_tags as tag (slug, label, published, created_by)
    values (v_tag_slug, v_tag_label, true, v_admin_id)
    on conflict (slug) do update
    set label = excluded.label, published = true,
        updated_at = case
          when tag.label is distinct from excluded.label or tag.published is distinct from true
          then now() else tag.updated_at end;
    insert into public.video_class_lesson_tags (lesson_id, tag_id, created_by)
    select p_lesson_id, tag.id, v_admin_id
    from public.video_class_tags tag where tag.slug = v_tag_slug
    on conflict (lesson_id, tag_id) do nothing;
  end loop;

  if coalesce(v_previous_codes, array[]::text[]) is distinct from v_codes then
    update public.video_class_playback_sessions playback
    set revoked_at = coalesce(playback.revoked_at, now())
    where playback.lesson_id = p_lesson_id and playback.revoked_at is null;
  end if;

  insert into public.video_class_admin_audit_events (admin_id, action, detail)
  values (v_admin_id, 'edit_lesson', jsonb_build_object(
    'lesson_id', p_lesson_id,
    'title', v_title,
    'course_codes', to_jsonb(v_codes),
    'duration_seconds', p_duration_seconds,
    'tag_count', jsonb_array_length(p_tags)
  ));

  return jsonb_build_object(
    'lesson_id', v_lesson.id,
    'slug', v_lesson.slug,
    'title', v_lesson.title,
    'description', v_lesson.description,
    'course_code', v_lesson.course_code,
    'course_codes', to_jsonb(v_codes),
    'duration_seconds', v_lesson.duration_seconds,
    'tags', coalesce((
      select jsonb_agg(jsonb_build_object('slug', tag.slug, 'label', tag.label)
        order by tag.sort_order, tag.slug)
      from public.video_class_lesson_tags lesson_tag
      join public.video_class_tags tag on tag.id = lesson_tag.tag_id
      where lesson_tag.lesson_id = p_lesson_id
    ), '[]'::jsonb),
    'updated_at', v_lesson.updated_at
  );
end;
$$;

create or replace function public.video_class_admin_set_thumbnail(
  p_service_secret text,
  p_admin_token uuid,
  p_lesson_id uuid,
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
  v_existing public.video_class_lesson_thumbnails%rowtype;
  v_thumbnail public.video_class_lesson_thumbnails%rowtype;
  v_content_type text := lower(btrim(coalesce(p_content_type, '')));
  v_previous_object_key text;
begin
  if not public._video_class_worker_ok(p_service_secret) or p_lesson_id is null then
    raise exception 'Invalid thumbnail update';
  end if;
  v_admin_id := public._video_class_admin_id(p_admin_token);
  if v_admin_id is null then raise exception 'Invalid or expired admin session'; end if;

  perform 1 from public.video_class_lessons lesson
  where lesson.id = p_lesson_id for update;
  if not found then raise exception 'Lesson not found'; end if;
  if exists (
    select 1 from public.video_class_lesson_deletion_jobs deletion_job
    where deletion_job.lesson_id = p_lesson_id
  ) then raise exception 'Lesson deletion is already in progress'; end if;

  select thumbnail.* into v_existing
  from public.video_class_lesson_thumbnails thumbnail
  where thumbnail.lesson_id = p_lesson_id
  for update;
  if found then v_previous_object_key := v_existing.object_key; end if;

  if p_object_key is null then
    delete from public.video_class_lesson_thumbnails thumbnail
    where thumbnail.lesson_id = p_lesson_id;
    if v_previous_object_key is not null then
      insert into public.video_class_admin_audit_events (admin_id, action, detail)
      values (v_admin_id, 'remove_lesson_thumbnail', jsonb_build_object(
        'lesson_id', p_lesson_id,
        'previous_object_sha256', encode(extensions.digest(v_previous_object_key, 'sha256'), 'hex')
      ));
    end if;
    return jsonb_build_object(
      'lesson_id', p_lesson_id,
      'previous_object_key', v_previous_object_key,
      'thumbnail', null
    );
  end if;

  if not public._video_class_valid_object_key(p_object_key)
    or v_content_type not in ('image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif')
    or p_byte_length is null
    or p_byte_length not between 1 and 10995116277760
  then raise exception 'Invalid thumbnail metadata'; end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_object_key, 5194));
  if exists (
    select 1 from public.video_class_lessons lesson where lesson.object_key = p_object_key
  ) or exists (
    select 1 from public.video_class_lesson_renditions rendition where rendition.object_key = p_object_key
  ) or exists (
    select 1 from public.video_class_lesson_attachments attachment where attachment.object_key = p_object_key
  ) or exists (
    select 1 from public.video_class_lesson_thumbnails thumbnail
    where thumbnail.object_key = p_object_key and thumbnail.lesson_id <> p_lesson_id
  ) then raise exception 'Thumbnail object is already assigned'; end if;

  insert into public.video_class_lesson_thumbnails as thumbnail (
    lesson_id, object_key, content_type, byte_length, enabled, created_by
  ) values (
    p_lesson_id, p_object_key, v_content_type, p_byte_length, true, v_admin_id
  )
  on conflict (lesson_id) do update
  set object_key = excluded.object_key,
      content_type = excluded.content_type,
      byte_length = excluded.byte_length,
      enabled = true,
      updated_at = now(),
      created_by = excluded.created_by
  returning thumbnail.* into v_thumbnail;

  insert into public.video_class_admin_audit_events (admin_id, action, detail)
  values (v_admin_id, 'set_lesson_thumbnail', jsonb_build_object(
    'lesson_id', p_lesson_id,
    'content_type', v_thumbnail.content_type,
    'byte_length', v_thumbnail.byte_length,
    'object_sha256', encode(extensions.digest(p_object_key, 'sha256'), 'hex'),
    'replaced', v_previous_object_key is not null and v_previous_object_key is distinct from p_object_key
  ));

  return jsonb_build_object(
    'lesson_id', p_lesson_id,
    'previous_object_key', case
      when v_previous_object_key is distinct from p_object_key then v_previous_object_key
      else null end,
    'thumbnail', jsonb_build_object(
      'content_type', v_thumbnail.content_type,
      'byte_length', v_thumbnail.byte_length,
      'enabled', v_thumbnail.enabled,
      'updated_at', v_thumbnail.updated_at
    )
  );
exception when unique_violation then
  raise exception 'Thumbnail object is already assigned';
end;
$$;

create or replace function public.video_class_admin_authorize_thumbnail(
  p_service_secret text,
  p_admin_token uuid,
  p_lesson_id uuid
)
returns table (object_key text, content_type text, byte_length bigint)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public._video_class_worker_ok(p_service_secret)
    or public._video_class_admin_id(p_admin_token) is null
  then return; end if;
  return query
  select thumbnail.object_key, thumbnail.content_type, thumbnail.byte_length
  from public.video_class_lesson_thumbnails thumbnail
  where thumbnail.lesson_id = p_lesson_id and thumbnail.enabled = true;
end;
$$;

create or replace function public.video_class_admin_authorize_lesson_preview(
  p_service_secret text,
  p_admin_token uuid,
  p_lesson_id uuid
)
returns table (
  object_key text,
  content_type text,
  byte_length bigint,
  lesson_id uuid
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public._video_class_worker_ok(p_service_secret)
    or public._video_class_admin_id(p_admin_token) is null
  then return; end if;
  return query
  select rendition.object_key, rendition.content_type,
    rendition.byte_length, rendition.lesson_id
  from public.video_class_lesson_renditions rendition
  where rendition.lesson_id = p_lesson_id
    and rendition.enabled = true
    and not exists (
      select 1 from public.video_class_lesson_deletion_jobs deletion_job
      where deletion_job.lesson_id = p_lesson_id
    )
  order by rendition.is_default desc, rendition.height_pixels desc nulls last,
    rendition.sort_order desc, rendition.id
  limit 1;
end;
$$;

create or replace function public.video_class_admin_create_preview(
  p_service_secret text,
  p_admin_token uuid,
  p_lesson_id uuid,
  p_user_agent_hash text
)
returns table (
  preview_id uuid,
  admin_id uuid,
  lesson_id uuid,
  slug text,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid;
  v_preview_id uuid := gen_random_uuid();
  v_expires_at timestamptz := now() + interval '10 minutes';
  v_slug text;
begin
  if not public._video_class_worker_ok(p_service_secret)
    or p_admin_token is null
    or p_lesson_id is null
    or p_user_agent_hash !~ '^[0-9a-f]{64}$'
  then return; end if;
  v_admin_id := public._video_class_admin_id(p_admin_token);
  if v_admin_id is null then return; end if;

  select lesson.slug into v_slug
  from public.video_class_lessons lesson
  where lesson.id = p_lesson_id
    and not exists (
      select 1 from public.video_class_lesson_deletion_jobs deletion_job
      where deletion_job.lesson_id = lesson.id
    );
  if not found then return; end if;

  delete from public.video_class_admin_preview_grants grant_record
  where grant_record.expires_at <= now();
  insert into public.video_class_admin_preview_grants (
    preview_hash, admin_session_hash, admin_id, lesson_id,
    user_agent_hash, expires_at
  ) values (
    extensions.digest(v_preview_id::text, 'sha256'),
    extensions.digest(p_admin_token::text, 'sha256'),
    v_admin_id, p_lesson_id, p_user_agent_hash, v_expires_at
  );
  return query select v_preview_id, v_admin_id, p_lesson_id, v_slug, v_expires_at;
end;
$$;

create or replace function public.video_class_admin_authorize_preview(
  p_service_secret text,
  p_preview_id uuid,
  p_admin_id uuid,
  p_lesson_id uuid,
  p_user_agent_hash text
)
returns table (
  object_key text,
  content_type text,
  byte_length bigint,
  lesson_id uuid
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public._video_class_worker_ok(p_service_secret)
    or p_preview_id is null
    or p_admin_id is null
    or p_lesson_id is null
    or p_user_agent_hash !~ '^[0-9a-f]{64}$'
  then return; end if;
  return query
  select rendition.object_key, rendition.content_type,
    rendition.byte_length, rendition.lesson_id
  from public.video_class_admin_preview_grants preview
  join public.video_class_admin_sessions session
    on session.token_hash = preview.admin_session_hash
   and session.admin_id = preview.admin_id
   and session.expires_at > now()
  join public.video_class_lesson_renditions rendition
    on rendition.lesson_id = preview.lesson_id and rendition.enabled = true
  where preview.preview_hash = extensions.digest(p_preview_id::text, 'sha256')
    and preview.admin_id = p_admin_id
    and preview.lesson_id = p_lesson_id
    and preview.user_agent_hash = p_user_agent_hash
    and preview.expires_at > now()
    and not exists (
      select 1 from public.video_class_lesson_deletion_jobs deletion_job
      where deletion_job.lesson_id = preview.lesson_id
    )
  order by rendition.is_default desc, rendition.height_pixels desc nulls last,
    rendition.sort_order desc, rendition.id
  limit 1;
end;
$$;

create or replace function public.video_class_admin_prepare_delete_lesson(
  p_service_secret text,
  p_admin_token uuid,
  p_lesson_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid;
  v_lesson public.video_class_lessons%rowtype;
  v_job public.video_class_lesson_deletion_jobs%rowtype;
  v_object_keys text[];
begin
  if not public._video_class_worker_ok(p_service_secret) or p_lesson_id is null then
    raise exception 'Invalid lesson delete request';
  end if;
  v_admin_id := public._video_class_admin_id(p_admin_token);
  if v_admin_id is null then raise exception 'Invalid or expired admin session'; end if;

  select lesson.* into v_lesson
  from public.video_class_lessons lesson
  where lesson.id = p_lesson_id
  for update;
  if not found then raise exception 'Lesson not found'; end if;

  select deletion_job.* into v_job
  from public.video_class_lesson_deletion_jobs deletion_job
  where deletion_job.lesson_id = p_lesson_id
  for update;
  if found then
    return jsonb_build_object(
      'delete_job_id', v_job.id,
      'lesson_id', v_job.lesson_id,
      'title', v_job.lesson_title,
      'object_keys', to_jsonb(v_job.object_keys),
      'requested_at', v_job.requested_at
    );
  end if;

  select array_agg(distinct objects.object_key order by objects.object_key)
  into v_object_keys
  from (
    select v_lesson.object_key as object_key
    union all
    select rendition.object_key
    from public.video_class_lesson_renditions rendition
    where rendition.lesson_id = p_lesson_id
    union all
    select thumbnail.object_key
    from public.video_class_lesson_thumbnails thumbnail
    where thumbnail.lesson_id = p_lesson_id
    union all
    select attachment.object_key
    from public.video_class_lesson_attachments attachment
    where attachment.lesson_id = p_lesson_id
  ) objects
  where objects.object_key is not null;

  if coalesce(cardinality(v_object_keys), 0) = 0
    or exists (
      select 1
      from unnest(v_object_keys) object_key
      where not public._video_class_valid_object_key(object_key)
    )
  then
    raise exception 'Lesson contains an invalid private object key';
  end if;

  insert into public.video_class_lesson_deletion_jobs (
    lesson_id, object_keys, lesson_title, requested_by
  ) values (
    p_lesson_id, v_object_keys, v_lesson.title, v_admin_id
  ) returning * into v_job;

  update public.video_class_lessons lesson
  set published = false, is_private = true
  where lesson.id = p_lesson_id;
  update public.video_class_playback_sessions playback
  set revoked_at = coalesce(playback.revoked_at, now())
  where playback.lesson_id = p_lesson_id and playback.revoked_at is null;

  insert into public.video_class_admin_audit_events (admin_id, action, detail)
  values (v_admin_id, 'prepare_delete_lesson', jsonb_build_object(
    'delete_job_id', v_job.id,
    'lesson_id', p_lesson_id,
    'lesson_title', v_lesson.title,
    'object_count', cardinality(v_object_keys)
  ));

  return jsonb_build_object(
    'delete_job_id', v_job.id,
    'lesson_id', v_job.lesson_id,
    'title', v_job.lesson_title,
    'object_keys', to_jsonb(v_job.object_keys),
    'requested_at', v_job.requested_at
  );
end;
$$;

create or replace function public.video_class_admin_finish_delete_lesson(
  p_service_secret text,
  p_admin_token uuid,
  p_delete_job_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid;
  v_job public.video_class_lesson_deletion_jobs%rowtype;
begin
  if not public._video_class_worker_ok(p_service_secret) or p_delete_job_id is null then
    return false;
  end if;
  v_admin_id := public._video_class_admin_id(p_admin_token);
  if v_admin_id is null then return false; end if;

  select deletion_job.* into v_job
  from public.video_class_lesson_deletion_jobs deletion_job
  where deletion_job.id = p_delete_job_id
  for update;
  if not found then return false; end if;

  insert into public.video_class_admin_audit_events (admin_id, action, detail)
  values (v_admin_id, 'delete_lesson', jsonb_build_object(
    'delete_job_id', v_job.id,
    'lesson_id', v_job.lesson_id,
    'lesson_title', v_job.lesson_title,
    'object_count', cardinality(v_job.object_keys),
    'object_sha256', (
      select jsonb_agg(encode(extensions.digest(object_key, 'sha256'), 'hex') order by object_key)
      from unnest(v_job.object_keys) as object_keys(object_key)
    )
  ));
  delete from public.video_class_lessons lesson where lesson.id = v_job.lesson_id;
  return found;
end;
$$;

create or replace function public._video_class_admin_student_series_access_json(
  p_student_id uuid
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'student_id', p_student_id,
    'courses', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'course_code', student_course.course_code,
          'course_title', course.title,
          'course_enabled', student_course.enabled,
          'mode', student_course.official_playlist_mode,
          'playlists', coalesce((
            select jsonb_agg(
              jsonb_build_object(
                'playlist_id', playlist.id,
                'name', playlist.name,
                'published', playlist.published,
                'sort_order', playlist.sort_order,
                'enabled', case
                  when not student_course.enabled then false
                  when student_course.official_playlist_mode = 'all' then true
                  when student_course.official_playlist_mode = 'none' then false
                  else coalesce(series_override.enabled, false)
                end
              ) order by playlist.sort_order, playlist.name, playlist.id
            )
            from public.video_class_official_playlist_courses membership
            join public.video_class_official_playlists playlist
              on playlist.id = membership.playlist_id
            left join public.video_class_student_official_playlists series_override
              on series_override.student_id = p_student_id
             and series_override.course_code = student_course.course_code
             and series_override.playlist_id = playlist.id
            where membership.course_code = student_course.course_code
          ), '[]'::jsonb)
        ) order by course.sort_order, student_course.course_code
      )
      from public.video_class_student_courses student_course
      join public.video_class_courses course on course.code = student_course.course_code
      where student_course.student_id = p_student_id
    ), '[]'::jsonb)
  );
$$;

revoke all on function public._video_class_admin_student_series_access_json(uuid)
  from public, anon, authenticated;

create or replace function public.video_class_admin_list_student_series_access(
  p_service_secret text,
  p_admin_token uuid,
  p_student_id uuid
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public._video_class_worker_ok(p_service_secret)
    or public._video_class_admin_id(p_admin_token) is null
    or not exists (
      select 1 from public.flashcard_students student
      where student.id = p_student_id and student.deleted_at is null
    )
  then return null; end if;
  return public._video_class_admin_student_series_access_json(p_student_id);
end;
$$;

-- Multi-course publication overload. The original single-course RPC remains
-- callable through the defaulted course array; internally it retains the
-- original object-validation and idempotency implementation.
do $$
begin
  if to_regprocedure('public._video_class_admin_publish_r2_object_single_course(text,uuid,text,text,text,text,text,text,integer,integer,text,bigint,jsonb,jsonb,jsonb)') is null then
    alter function public.video_class_admin_publish_r2_object(
      text, uuid, text, text, text, text, text, text, integer, integer,
      text, bigint, jsonb, jsonb, jsonb
    ) rename to _video_class_admin_publish_r2_object_single_course;
  end if;
end;
$$;

revoke all on function public._video_class_admin_publish_r2_object_single_course(
  text, uuid, text, text, text, text, text, text, integer, integer,
  text, bigint, jsonb, jsonb, jsonb
) from public, anon, authenticated;

create or replace function public.video_class_admin_publish_r2_object(
  p_service_secret text,
  p_admin_token uuid,
  p_object_key text,
  p_slug text,
  p_title text,
  p_description text,
  p_course_code text,
  p_course_label text,
  p_duration_seconds integer,
  p_sort_order integer,
  p_content_type text,
  p_byte_length bigint,
  p_tags jsonb default '[]'::jsonb,
  p_renditions jsonb default '[]'::jsonb,
  p_thumbnail jsonb default null,
  p_course_codes text[] default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid;
  v_result jsonb;
  v_lesson_id uuid;
  v_codes text[];
  v_previous_codes text[];
begin
  select array_agg(distinct normalized.code order by normalized.code)
  into v_codes
  from (
    select lower(btrim(code)) as code
    from unnest(
      case
        when coalesce(cardinality(p_course_codes), 0) = 0
          then array[p_course_code]
        else p_course_codes
      end
    ) selected(code)
  ) normalized;

  if coalesce(cardinality(v_codes), 0) not between 1 and 100
    or lower(btrim(coalesce(p_course_code, ''))) <> all(v_codes)
    or exists (
      select 1 from unnest(v_codes) code
      where code !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' or length(code) > 64
    )
    or (
      select count(*) from public.video_class_courses course
      where course.code = any(v_codes)
    ) <> cardinality(v_codes)
  then
    raise exception 'Invalid lesson course selection';
  end if;

  v_result := public._video_class_admin_publish_r2_object_single_course(
    p_service_secret,
    p_admin_token,
    p_object_key,
    p_slug,
    p_title,
    p_description,
    p_course_code,
    p_course_label,
    p_duration_seconds,
    p_sort_order,
    p_content_type,
    p_byte_length,
    p_tags,
    p_renditions,
    p_thumbnail
  );
  v_lesson_id := (v_result ->> 'lesson_id')::uuid;
  v_admin_id := public._video_class_admin_id(p_admin_token);

  select array_agg(membership.course_code order by membership.course_code)
  into v_previous_codes
  from public.video_class_lesson_courses membership
  where membership.lesson_id = v_lesson_id;

  -- Calls from the previous Worker omit the array. On an idempotent retry,
  -- preserve memberships already attached to the lesson.
  if coalesce(cardinality(p_course_codes), 0) = 0 then
    v_codes := coalesce(v_previous_codes, array[p_course_code]);
  end if;

  if exists (
    select 1
    from public.video_class_official_playlist_items item
    where item.lesson_id = v_lesson_id
      and not exists (
        select 1
        from public.video_class_official_playlist_courses playlist_course
        where playlist_course.playlist_id = item.playlist_id
          and playlist_course.course_code = any(v_codes)
      )
  ) then
    raise exception 'Lesson course selection conflicts with an official series';
  end if;

  insert into public.video_class_lesson_courses (
    lesson_id, course_code, created_by
  )
  select v_lesson_id, code, v_admin_id
  from unnest(v_codes) code
  on conflict (lesson_id, course_code) do nothing;

  delete from public.video_class_lesson_courses membership
  where membership.lesson_id = v_lesson_id
    and not (membership.course_code = any(v_codes));

  if coalesce(v_previous_codes, array[]::text[])
    is distinct from coalesce(v_codes, array[]::text[])
  then
    update public.video_class_playback_sessions playback
    set revoked_at = coalesce(playback.revoked_at, now())
    where playback.lesson_id = v_lesson_id
      and playback.revoked_at is null;

    insert into public.video_class_admin_audit_events (
      admin_id, action, detail
    )
    values (
      v_admin_id,
      'edit_lesson',
      jsonb_build_object(
        'lesson_id', v_lesson_id,
        'source', 'publish_r2_object',
        'previous_course_codes', to_jsonb(coalesce(v_previous_codes, array[]::text[])),
        'course_codes', to_jsonb(v_codes)
      )
    );
  end if;

  return jsonb_set(v_result, '{course_codes}', to_jsonb(v_codes), true);
end;
$$;

create or replace function public.video_class_admin_set_student_series_mode(
  p_service_secret text,
  p_admin_token uuid,
  p_student_id uuid,
  p_course_code text,
  p_mode text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid;
  v_mode text := lower(btrim(coalesce(p_mode, '')));
  v_previous_mode text;
begin
  if not public._video_class_worker_ok(p_service_secret)
    or p_student_id is null
    or p_course_code is null
    or p_course_code !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    or v_mode not in ('all', 'none', 'manual')
  then raise exception 'Invalid student series mode update'; end if;
  v_admin_id := public._video_class_admin_id(p_admin_token);
  if v_admin_id is null then raise exception 'Invalid or expired admin session'; end if;

  select access.official_playlist_mode into v_previous_mode
  from public.video_class_student_courses access
  where access.student_id = p_student_id
    and access.course_code = p_course_code
    and access.enabled = true
  for update;
  if not found then raise exception 'Student does not have access to this course'; end if;

  if v_mode = 'manual' and v_previous_mode <> 'manual' then
    insert into public.video_class_student_official_playlists as series_access (
      student_id, course_code, playlist_id, enabled, updated_by
    )
    select p_student_id, p_course_code, membership.playlist_id,
      (v_previous_mode = 'all'), v_admin_id
    from public.video_class_official_playlist_courses membership
    where membership.course_code = p_course_code
    on conflict (student_id, course_code, playlist_id) do nothing;
  end if;

  update public.video_class_student_courses access
  set official_playlist_mode = v_mode, updated_by = v_admin_id
  where access.student_id = p_student_id and access.course_code = p_course_code;

  insert into public.video_class_admin_audit_events (admin_id, student_id, action, detail)
  values (v_admin_id, p_student_id, 'set_student_series_mode', jsonb_build_object(
    'course_code', p_course_code,
    'previous_mode', v_previous_mode,
    'mode', v_mode
  ));
  return public._video_class_admin_student_series_access_json(p_student_id);
end;
$$;

create or replace function public.video_class_admin_set_student_official_playlist_access(
  p_service_secret text,
  p_admin_token uuid,
  p_student_id uuid,
  p_course_code text,
  p_playlist_id uuid,
  p_enabled boolean
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid;
  v_previous_mode text;
begin
  if not public._video_class_worker_ok(p_service_secret)
    or p_student_id is null
    or p_course_code is null
    or p_course_code !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    or p_playlist_id is null
    or p_enabled is null
  then raise exception 'Invalid student series access update'; end if;
  v_admin_id := public._video_class_admin_id(p_admin_token);
  if v_admin_id is null then raise exception 'Invalid or expired admin session'; end if;

  select access.official_playlist_mode
  into v_previous_mode
  from public.video_class_student_courses access
  where access.student_id = p_student_id
    and access.course_code = p_course_code
    and access.enabled = true
  for update;
  if not found then raise exception 'Student does not have access to this course'; end if;

  if not exists (
    select 1
    from public.video_class_official_playlist_courses membership
    where membership.playlist_id = p_playlist_id
      and membership.course_code = p_course_code
  ) then
    raise exception 'Official series does not belong to this course';
  end if;

  if v_previous_mode <> 'manual' then
    insert into public.video_class_student_official_playlists as series_access (
      student_id, course_code, playlist_id, enabled, updated_by
    )
    select p_student_id, p_course_code, membership.playlist_id,
      (v_previous_mode = 'all'), v_admin_id
    from public.video_class_official_playlist_courses membership
    where membership.course_code = p_course_code
    on conflict (student_id, course_code, playlist_id) do nothing;
  end if;

  update public.video_class_student_courses access
  set official_playlist_mode = 'manual', updated_by = v_admin_id
  where access.student_id = p_student_id and access.course_code = p_course_code;

  insert into public.video_class_student_official_playlists as series_access (
    student_id, course_code, playlist_id, enabled, updated_by
  ) values (p_student_id, p_course_code, p_playlist_id, p_enabled, v_admin_id)
  on conflict (student_id, course_code, playlist_id) do update
  set enabled = excluded.enabled, updated_by = excluded.updated_by, updated_at = now();

  insert into public.video_class_admin_audit_events (admin_id, student_id, action, detail)
  values (v_admin_id, p_student_id, 'set_student_series_access', jsonb_build_object(
    'course_code', p_course_code,
    'playlist_id', p_playlist_id,
    'enabled', p_enabled
  ));
  return public._video_class_admin_student_series_access_json(p_student_id);
end;
$$;

create or replace function public.video_class_admin_replace_student_official_playlist_access(
  p_service_secret text,
  p_admin_token uuid,
  p_student_id uuid,
  p_course_code text,
  p_enabled_playlist_ids uuid[]
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid;
  v_ids uuid[];
begin
  if not public._video_class_worker_ok(p_service_secret)
    or p_student_id is null
    or p_course_code is null
    or p_course_code !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  then raise exception 'Invalid bulk student series access update'; end if;
  v_admin_id := public._video_class_admin_id(p_admin_token);
  if v_admin_id is null then raise exception 'Invalid or expired admin session'; end if;

  select array_agg(distinct playlist_id order by playlist_id) into v_ids
  from unnest(coalesce(p_enabled_playlist_ids, array[]::uuid[])) as selected(playlist_id);
  v_ids := coalesce(v_ids, array[]::uuid[]);
  if cardinality(v_ids) > 500
    or (select count(*)
        from public.video_class_official_playlist_courses membership
        where membership.course_code = p_course_code
          and membership.playlist_id = any(v_ids)) <> cardinality(v_ids)
  then raise exception 'Invalid official series selection'; end if;

  perform 1 from public.video_class_student_courses access
  where access.student_id = p_student_id
    and access.course_code = p_course_code
    and access.enabled = true
  for update;
  if not found then raise exception 'Student does not have access to this course'; end if;

  update public.video_class_student_courses access
  set official_playlist_mode = 'manual', updated_by = v_admin_id
  where access.student_id = p_student_id and access.course_code = p_course_code;

  insert into public.video_class_student_official_playlists as series_access (
    student_id, course_code, playlist_id, enabled, updated_by
  )
  select p_student_id, p_course_code, membership.playlist_id,
    membership.playlist_id = any(v_ids), v_admin_id
  from public.video_class_official_playlist_courses membership
  where membership.course_code = p_course_code
  on conflict (student_id, course_code, playlist_id) do update
  set enabled = excluded.enabled, updated_by = excluded.updated_by, updated_at = now();

  insert into public.video_class_admin_audit_events (admin_id, student_id, action, detail)
  values (v_admin_id, p_student_id, 'replace_student_series_access', jsonb_build_object(
    'course_code', p_course_code,
    'enabled_playlist_ids', to_jsonb(v_ids)
  ));
  return public._video_class_admin_student_series_access_json(p_student_id);
end;
$$;

create or replace function public.video_class_admin_set_official_playlist_order(
  p_service_secret text,
  p_admin_token uuid,
  p_order_mode text,
  p_ordered_playlist_ids uuid[]
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid;
  v_mode text := lower(btrim(coalesce(p_order_mode, '')));
  v_ids uuid[];
begin
  if not public._video_class_worker_ok(p_service_secret)
    or v_mode not in ('manual', 'random')
  then raise exception 'Invalid official series order update'; end if;
  v_admin_id := public._video_class_admin_id(p_admin_token);
  if v_admin_id is null then raise exception 'Invalid or expired admin session'; end if;

  select array_agg(distinct playlist_id order by playlist_id) into v_ids
  from unnest(coalesce(p_ordered_playlist_ids, array[]::uuid[])) as selected(playlist_id);
  v_ids := coalesce(v_ids, array[]::uuid[]);
  if cardinality(v_ids) > 5000
    or (select count(*) from public.video_class_official_playlists playlist
        where playlist.id = any(v_ids)) <> cardinality(v_ids)
  then raise exception 'Invalid official series order'; end if;

  perform 1 from public.video_class_library_settings settings
  where settings.singleton = true for update;
  insert into public.video_class_library_settings as settings (
    singleton, official_playlist_order_mode, updated_by
  ) values (true, v_mode, v_admin_id)
  on conflict (singleton) do update
  set official_playlist_order_mode = excluded.official_playlist_order_mode,
      updated_by = excluded.updated_by,
      updated_at = now();

  update public.video_class_official_playlists playlist
  set sort_order = ordered.ordinal::integer * 10
  from unnest(coalesce(p_ordered_playlist_ids, array[]::uuid[]))
    with ordinality ordered(playlist_id, ordinal)
  where playlist.id = ordered.playlist_id;

  insert into public.video_class_admin_audit_events (admin_id, action, detail)
  values (v_admin_id, 'set_official_playlist_order', jsonb_build_object(
    'order_mode', v_mode,
    'ordered_playlist_ids', to_jsonb(coalesce(p_ordered_playlist_ids, array[]::uuid[]))
  ));
  return jsonb_build_object(
    'order_mode', v_mode,
    'ordered_playlist_ids', to_jsonb(coalesce(p_ordered_playlist_ids, array[]::uuid[]))
  );
end;
$$;

create or replace function public.video_class_admin_set_lesson_private(
  p_service_secret text,
  p_admin_token uuid,
  p_lesson_id uuid,
  p_is_private boolean
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid;
  v_lesson public.video_class_lessons%rowtype;
  v_previous_private boolean;
begin
  if not public._video_class_worker_ok(p_service_secret)
    or p_lesson_id is null
    or p_is_private is null
  then
    raise exception 'Invalid lesson privacy update';
  end if;

  v_admin_id := public._video_class_admin_id(p_admin_token);
  if v_admin_id is null then
    raise exception 'Invalid or expired admin session';
  end if;

  select lesson.*
  into v_lesson
  from public.video_class_lessons lesson
  where lesson.id = p_lesson_id
  for update;

  if not found then
    raise exception 'Lesson not found';
  end if;

  if exists (
    select 1 from public.video_class_lesson_deletion_jobs deletion_job
    where deletion_job.lesson_id = p_lesson_id
  ) then
    raise exception 'Lesson deletion is already in progress';
  end if;

  v_previous_private := v_lesson.is_private;

  update public.video_class_lessons lesson
  set is_private = p_is_private
  where lesson.id = p_lesson_id
  returning lesson.* into v_lesson;

  if p_is_private then
    update public.video_class_playback_sessions playback
    set revoked_at = coalesce(playback.revoked_at, now())
    where playback.lesson_id = p_lesson_id
      and playback.revoked_at is null
      and playback.expires_at > now();
  end if;

  insert into public.video_class_admin_audit_events (
    admin_id, action, detail
  )
  values (
    v_admin_id,
    case when p_is_private then 'private_lesson' else 'unprivate_lesson' end,
    jsonb_build_object(
      'lesson_id', v_lesson.id,
      'lesson_slug', v_lesson.slug,
      'lesson_title', v_lesson.title,
      'previous_is_private', v_previous_private,
      'is_private', v_lesson.is_private
    )
  );

  return jsonb_build_object(
    'lesson_id', v_lesson.id,
    'slug', v_lesson.slug,
    'title', v_lesson.title,
    'is_private', v_lesson.is_private,
    'updated_at', v_lesson.updated_at
  );
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
  perform 1 from public.video_class_lessons lesson
  where lesson.id = p_lesson_id for update;
  if not found then raise exception 'Lesson not found'; end if;
  if exists (
    select 1 from public.video_class_lesson_deletion_jobs deletion_job
    where deletion_job.lesson_id = p_lesson_id
  ) then raise exception 'Lesson deletion is already in progress'; end if;
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

revoke all on function public.video_class_admin_update_lesson(text, uuid, uuid, text, text, text[], jsonb, integer) from public, anon, authenticated;
revoke all on function public.video_class_admin_save_official_playlist(text, uuid, uuid, text, text, text[], uuid[], boolean) from public, anon, authenticated;
revoke all on function public.video_class_admin_set_thumbnail(text, uuid, uuid, text, text, bigint) from public, anon, authenticated;
revoke all on function public.video_class_admin_authorize_thumbnail(text, uuid, uuid) from public, anon, authenticated;
revoke all on function public.video_class_admin_authorize_lesson_preview(text, uuid, uuid) from public, anon, authenticated;
revoke all on function public.video_class_admin_create_preview(text, uuid, uuid, text) from public, anon, authenticated;
revoke all on function public.video_class_admin_authorize_preview(text, uuid, uuid, uuid, text) from public, anon, authenticated;
revoke all on function public.video_class_admin_prepare_delete_lesson(text, uuid, uuid) from public, anon, authenticated;
revoke all on function public.video_class_admin_finish_delete_lesson(text, uuid, uuid) from public, anon, authenticated;
revoke all on function public.video_class_admin_list_student_series_access(text, uuid, uuid) from public, anon, authenticated;
revoke all on function public.video_class_admin_set_student_series_mode(text, uuid, uuid, text, text) from public, anon, authenticated;
revoke all on function public.video_class_admin_set_student_official_playlist_access(text, uuid, uuid, text, uuid, boolean) from public, anon, authenticated;
revoke all on function public.video_class_admin_replace_student_official_playlist_access(text, uuid, uuid, text, uuid[]) from public, anon, authenticated;
revoke all on function public.video_class_admin_set_official_playlist_order(text, uuid, text, uuid[]) from public, anon, authenticated;
revoke all on function public.video_class_admin_publish_r2_object(
  text, uuid, text, text, text, text, text, text, integer, integer,
  text, bigint, jsonb, jsonb, jsonb, text[]
) from public, anon, authenticated;

grant execute on function public.video_class_admin_update_lesson(text, uuid, uuid, text, text, text[], jsonb, integer) to anon;
grant execute on function public.video_class_admin_save_official_playlist(text, uuid, uuid, text, text, text[], uuid[], boolean) to anon;
grant execute on function public.video_class_admin_set_thumbnail(text, uuid, uuid, text, text, bigint) to anon;
grant execute on function public.video_class_admin_authorize_thumbnail(text, uuid, uuid) to anon;
grant execute on function public.video_class_admin_authorize_lesson_preview(text, uuid, uuid) to anon;
grant execute on function public.video_class_admin_create_preview(text, uuid, uuid, text) to anon;
grant execute on function public.video_class_admin_authorize_preview(text, uuid, uuid, uuid, text) to anon;
grant execute on function public.video_class_admin_prepare_delete_lesson(text, uuid, uuid) to anon;
grant execute on function public.video_class_admin_finish_delete_lesson(text, uuid, uuid) to anon;
grant execute on function public.video_class_admin_list_student_series_access(text, uuid, uuid) to anon;
grant execute on function public.video_class_admin_set_student_series_mode(text, uuid, uuid, text, text) to anon;
grant execute on function public.video_class_admin_set_student_official_playlist_access(text, uuid, uuid, text, uuid, boolean) to anon;
grant execute on function public.video_class_admin_replace_student_official_playlist_access(text, uuid, uuid, text, uuid[]) to anon;
grant execute on function public.video_class_admin_set_official_playlist_order(text, uuid, text, uuid[]) to anon;
grant execute on function public.video_class_admin_publish_r2_object(
  text, uuid, text, text, text, text, text, text, integer, integer,
  text, bigint, jsonb, jsonb, jsonb, text[]
) to anon;

-- Re-assert the pre-existing public RPC grants after replacement.
revoke all on function public.video_class_admin_list_students(text, uuid) from public, anon, authenticated;
revoke all on function public.video_class_student_library_page(text, uuid, integer, text, text, text, text, uuid) from public, anon, authenticated;
revoke all on function public.video_class_admin_list_lessons_page(text, uuid, integer, uuid, text) from public, anon, authenticated;
revoke all on function public.video_class_admin_list_official_playlists_page(text, uuid, integer, uuid, text) from public, anon, authenticated;
grant execute on function public.video_class_admin_list_students(text, uuid) to anon;
grant execute on function public.video_class_student_library_page(text, uuid, integer, text, text, text, text, uuid) to anon;
grant execute on function public.video_class_admin_list_lessons_page(text, uuid, integer, uuid, text) to anon;
grant execute on function public.video_class_admin_list_official_playlists_page(text, uuid, integer, uuid, text) to anon;

notify pgrst, 'reload schema';

commit;
