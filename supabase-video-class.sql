-- EdmundEducation Video Class: shared student identities, manual entitlements,
-- secure admin sessions, playback audit, and private-R2 authorization.
--
-- Dependencies:
--   * public.flashcard_students
--   * public.flashcard_student_sessions
--   * public.flashcard_session_student_id(uuid)
--   * pgcrypto installed in the extensions schema
--
-- The first admin bcrypt and the Worker-secret SHA-256 are provisioned
-- separately during deployment. Plaintext credentials never belong here.

begin;

create extension if not exists pgcrypto with schema extensions;

do $$
begin
  if to_regclass('public.flashcard_students') is null then
    raise exception 'Missing dependency: public.flashcard_students';
  end if;
  if to_regclass('public.flashcard_student_sessions') is null then
    raise exception 'Missing dependency: public.flashcard_student_sessions';
  end if;
  if to_regprocedure('public.flashcard_session_student_id(uuid)') is null then
    raise exception 'Missing dependency: public.flashcard_session_student_id(uuid)';
  end if;
  if not exists (
    select 1
    from pg_catalog.pg_extension extension
    join pg_catalog.pg_namespace namespace on namespace.oid = extension.extnamespace
    where extension.extname = 'pgcrypto'
      and namespace.nspname = 'extensions'
  ) then
    raise exception 'pgcrypto must be installed in the extensions schema';
  end if;
end;
$$;

create table if not exists public.video_class_admin_accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 100),
  password_hash text not null check (password_hash like '$2%'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists video_class_admin_name_lower_idx
  on public.video_class_admin_accounts (lower(trim(name)));

create table if not exists public.video_class_admin_sessions (
  token_hash bytea primary key,
  admin_id uuid not null references public.video_class_admin_accounts(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  check (expires_at > created_at)
);

create index if not exists video_class_admin_sessions_admin_idx
  on public.video_class_admin_sessions (admin_id, expires_at desc);
create index if not exists video_class_admin_sessions_expiry_idx
  on public.video_class_admin_sessions (expires_at);

create table if not exists public.video_class_worker_secrets (
  name text primary key check (name = 'video-class-worker'),
  secret_hash bytea not null,
  updated_at timestamptz not null default now()
);

-- Cross-IP login protection is keyed by an HMAC of the normalized login name.
-- Raw usernames, passwords, Turnstile tokens, and IP addresses are never stored.
create table if not exists public.video_class_login_attempts (
  realm text not null check (realm in ('student', 'admin')),
  identifier_hash bytea not null check (octet_length(identifier_hash) = 32),
  failure_count smallint not null default 0 check (failure_count between 0 and 10),
  last_failed_at timestamptz,
  blocked_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (realm, identifier_hash),
  check (failure_count = 0 or last_failed_at is not null)
);

create index if not exists video_class_login_attempts_updated_idx
  on public.video_class_login_attempts (updated_at);

-- A durable marker makes the launch entitlement rollout genuinely one-time,
-- even if this schema file is applied again after more students sign up.
create table if not exists public.video_class_rollouts (
  rollout_key text primary key check (rollout_key ~ '^[a-z0-9-]+$'),
  completed_at timestamptz not null default now()
);

create table if not exists public.video_class_courses (
  code text primary key check (code ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and length(code) <= 64),
  title text not null check (length(trim(title)) between 1 and 160),
  description text not null default '',
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.video_class_courses
  add column if not exists description text not null default '';

do $$
begin
  if not exists (
    select 1
    from pg_catalog.pg_constraint constraint_record
    where constraint_record.conrelid = 'public.video_class_courses'::regclass
      and constraint_record.conname = 'video_class_courses_description_check'
  ) then
    alter table public.video_class_courses
      add constraint video_class_courses_description_check
      check (length(description) <= 500);
  end if;
end;
$$;

create index if not exists video_class_courses_sort_idx
  on public.video_class_courses (sort_order, code);

-- Stable course codes are API identifiers. Titles may be refined without
-- invalidating entitlements, lesson foreign keys, or saved learning state.
insert into public.video_class_courses (code, title, description, sort_order, published)
values
  ('dse', 'DSE 中學文憑試', '', 10, true),
  ('ielts', 'IELTS 國際英文課程', '', 20, true),
  ('toefl', 'TOEFL 託福', '', 30, true),
  ('toeic', 'TOEIC 多益', '', 40, true),
  ('pte', 'Pearson Test of English (PTE)', '', 50, true),
  ('igcse', 'IGCSE', '', 60, true),
  ('sat', 'SAT', '', 70, true),
  ('ib', 'IB 課程', '', 80, true),
  ('grammar', 'Grammar', '英文語法課程', 90, true)
on conflict (code) do update
set title = excluded.title,
    description = case
      when length(excluded.description) > 0 then excluded.description
      else public.video_class_courses.description
    end,
    sort_order = excluded.sort_order,
    updated_at = case
      when public.video_class_courses.title is distinct from excluded.title
        or (
          length(excluded.description) > 0
          and public.video_class_courses.description is distinct from excluded.description
        )
        or public.video_class_courses.sort_order is distinct from excluded.sort_order
      then now()
      else public.video_class_courses.updated_at
    end
where public.video_class_courses.title is distinct from excluded.title
   or public.video_class_courses.sort_order is distinct from excluded.sort_order
   or (
     length(excluded.description) > 0
     and public.video_class_courses.description is distinct from excluded.description
   );

create table if not exists public.video_class_student_access (
  student_id uuid primary key references public.flashcard_students(id) on delete cascade,
  video_key text not null unique
    check (video_key ~ '^EDU-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$'),
  enabled boolean not null default true,
  watermark_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.video_class_admin_accounts(id) on delete set null
);

alter table public.video_class_student_access
  add column if not exists watermark_enabled boolean not null default true;

create index if not exists video_class_student_access_enabled_idx
  on public.video_class_student_access (student_id)
  where enabled = true;
create index if not exists video_class_student_access_updated_by_idx
  on public.video_class_student_access (updated_by)
  where updated_by is not null;

create table if not exists public.video_class_student_sessions (
  token_hash bytea primary key,
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  minted_flashcard_token uuid references public.flashcard_student_sessions(token) on delete set null,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  expires_at timestamptz not null,
  check (expires_at > created_at)
);

alter table public.video_class_student_sessions
  add column if not exists minted_flashcard_token uuid
  references public.flashcard_student_sessions(token) on delete set null;

create index if not exists video_class_student_sessions_student_idx
  on public.video_class_student_sessions (student_id, expires_at desc);
create index if not exists video_class_student_sessions_expiry_idx
  on public.video_class_student_sessions (expires_at);
create index if not exists video_class_student_sessions_minted_flashcard_idx
  on public.video_class_student_sessions (minted_flashcard_token)
  where minted_flashcard_token is not null;

create table if not exists public.video_class_lessons (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (length(trim(title)) between 1 and 160),
  description text not null default '' check (length(description) <= 2000),
  course_code text not null references public.video_class_courses(code) on update cascade on delete restrict,
  course_label text not null default '錄影班' check (length(trim(course_label)) between 1 and 120),
  object_key text not null unique check (length(object_key) between 1 and 900),
  duration_seconds integer check (duration_seconds is null or duration_seconds between 1 and 86400),
  sort_order integer not null default 0,
  published boolean not null default false,
  is_private boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.video_class_admin_accounts(id) on delete set null
);

alter table public.video_class_lessons
  add column if not exists course_code text;

alter table public.video_class_lessons
  add column if not exists is_private boolean not null default false;

update public.video_class_lessons
set is_private = false
where is_private is null;

alter table public.video_class_lessons
  alter column is_private set default false,
  alter column is_private set not null;

update public.video_class_lessons
set course_code = 'dse'
where course_code is null;

do $$
begin
  if not exists (
    select 1
    from pg_catalog.pg_constraint constraint_record
    where constraint_record.conrelid = 'public.video_class_lessons'::regclass
      and constraint_record.contype = 'f'
      and constraint_record.conname = 'video_class_lessons_course_code_fkey'
  ) then
    alter table public.video_class_lessons
      add constraint video_class_lessons_course_code_fkey
      foreign key (course_code) references public.video_class_courses(code)
      on update cascade on delete restrict;
  end if;
end;
$$;

alter table public.video_class_lessons
  alter column course_code set not null;

create index if not exists video_class_lessons_published_sort_idx
  on public.video_class_lessons (sort_order, created_at, id)
  where published = true;
create index if not exists video_class_lessons_course_published_sort_idx
  on public.video_class_lessons (course_code, sort_order, created_at, id)
  where published = true;
create index if not exists video_class_lessons_course_fk_idx
  on public.video_class_lessons (course_code);
create index if not exists video_class_lessons_created_by_idx
  on public.video_class_lessons (created_by)
  where created_by is not null;

-- A lesson keeps one primary course for backwards-compatible labels and sort
-- order, while this junction is the source of truth for every course library
-- in which it should appear. This avoids duplicating video rows or R2 objects.
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

insert into public.video_class_lesson_courses (lesson_id, course_code, created_by)
select lesson.id, lesson.course_code, lesson.created_by
from public.video_class_lessons lesson
on conflict (lesson_id, course_code) do nothing;

-- Progressive MP4 renditions remain private R2 object keys. Student-facing
-- functions expose only the presentation metadata needed for a quality picker.
create table if not exists public.video_class_lesson_renditions (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.video_class_lessons(id) on delete cascade,
  quality_code text not null
    check (quality_code in ('480p', '720p', '1080p', 'max')),
  display_label text not null check (length(trim(display_label)) between 1 and 40),
  height_pixels integer check (height_pixels is null or height_pixels between 1 and 16384),
  object_key text not null unique check (length(object_key) between 1 and 900),
  content_type text not null default 'video/mp4'
    check (content_type ~ '^video/[a-z0-9][a-z0-9.+-]*$'),
  byte_length bigint check (byte_length is null or byte_length > 0),
  sort_order integer not null default 0,
  is_default boolean not null default false,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.video_class_admin_accounts(id) on delete set null,
  unique (lesson_id, quality_code)
);

create unique index if not exists video_class_renditions_one_default_idx
  on public.video_class_lesson_renditions (lesson_id)
  where enabled = true and is_default = true;
create index if not exists video_class_renditions_lesson_enabled_idx
  on public.video_class_lesson_renditions (lesson_id, sort_order, height_pixels, quality_code)
  where enabled = true;
create index if not exists video_class_renditions_created_by_idx
  on public.video_class_lesson_renditions (created_by)
  where created_by is not null;

-- One protected card image per lesson keeps the authorization route keyed by
-- lesson UUID and prevents public thumbnail URLs from bypassing entitlements.
create table if not exists public.video_class_lesson_thumbnails (
  lesson_id uuid primary key references public.video_class_lessons(id) on delete cascade,
  object_key text not null unique check (length(object_key) between 1 and 900),
  content_type text not null
    check (content_type in ('image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif')),
  byte_length bigint check (byte_length is null or byte_length > 0),
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.video_class_admin_accounts(id) on delete set null
);

alter table public.video_class_lesson_thumbnails
  drop constraint if exists video_class_lesson_thumbnails_content_type_check;
alter table public.video_class_lesson_thumbnails
  add constraint video_class_lesson_thumbnails_content_type_check
  check (content_type in (
    'image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'
  ));

create index if not exists video_class_thumbnails_created_by_idx
  on public.video_class_lesson_thumbnails (created_by)
  where created_by is not null;

-- Downloadable PDF notes are private objects. Student-facing functions expose
-- only presentation metadata; the Worker receives the object key only after a
-- fresh entitlement check for the requested attachment.
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

create table if not exists public.video_class_tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and length(slug) <= 80),
  label text not null check (length(trim(label)) between 1 and 80),
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.video_class_admin_accounts(id) on delete set null
);

create index if not exists video_class_tags_published_sort_idx
  on public.video_class_tags (sort_order, slug, id)
  where published = true;
create index if not exists video_class_tags_created_by_idx
  on public.video_class_tags (created_by)
  where created_by is not null;

create table if not exists public.video_class_lesson_tags (
  lesson_id uuid not null references public.video_class_lessons(id) on delete cascade,
  tag_id uuid not null references public.video_class_tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  created_by uuid references public.video_class_admin_accounts(id) on delete set null,
  primary key (lesson_id, tag_id)
);

create index if not exists video_class_lesson_tags_tag_idx
  on public.video_class_lesson_tags (tag_id, lesson_id);
create index if not exists video_class_lesson_tags_created_by_idx
  on public.video_class_lesson_tags (created_by)
  where created_by is not null;

create table if not exists public.video_class_official_playlists (
  id uuid primary key default gen_random_uuid(),
  course_code text not null references public.video_class_courses(code)
    on update cascade on delete restrict,
  name text not null check (length(trim(name)) between 1 and 160),
  description text not null default '' check (length(description) <= 1000),
  sort_order integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.video_class_admin_accounts(id) on delete set null
);

create unique index if not exists video_class_official_playlists_course_name_idx
  on public.video_class_official_playlists (course_code, lower(trim(name)));
create index if not exists video_class_official_playlists_published_sort_idx
  on public.video_class_official_playlists (course_code, sort_order, id)
  where published = true;
create index if not exists video_class_official_playlists_created_by_idx
  on public.video_class_official_playlists (created_by)
  where created_by is not null;

-- One official series may be shown in several course libraries without
-- duplicating either the series or its lessons.
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

insert into public.video_class_official_playlist_courses (
  playlist_id, course_code, created_by
)
select playlist.id, playlist.course_code, playlist.created_by
from public.video_class_official_playlists playlist
on conflict (playlist_id, course_code) do nothing;

create table if not exists public.video_class_official_playlist_items (
  playlist_id uuid not null references public.video_class_official_playlists(id) on delete cascade,
  lesson_id uuid not null references public.video_class_lessons(id) on delete cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  created_by uuid references public.video_class_admin_accounts(id) on delete set null,
  primary key (playlist_id, lesson_id)
);

create index if not exists video_class_official_items_lesson_idx
  on public.video_class_official_playlist_items (lesson_id, playlist_id);
create index if not exists video_class_official_items_order_idx
  on public.video_class_official_playlist_items (playlist_id, sort_order, lesson_id);
create index if not exists video_class_official_items_created_by_idx
  on public.video_class_official_playlist_items (created_by)
  where created_by is not null;

create table if not exists public.video_class_student_playlists (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists video_class_student_playlists_name_idx
  on public.video_class_student_playlists (student_id, lower(trim(name)));
create index if not exists video_class_student_playlists_student_updated_idx
  on public.video_class_student_playlists (student_id, updated_at desc, id);

create table if not exists public.video_class_student_playlist_items (
  playlist_id uuid not null references public.video_class_student_playlists(id) on delete cascade,
  lesson_id uuid not null references public.video_class_lessons(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (playlist_id, lesson_id)
);

create index if not exists video_class_student_playlist_items_lesson_idx
  on public.video_class_student_playlist_items (lesson_id, playlist_id);
create index if not exists video_class_student_playlist_items_order_idx
  on public.video_class_student_playlist_items (playlist_id, created_at, lesson_id);

create table if not exists public.video_class_student_clips (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  lesson_id uuid not null references public.video_class_lessons(id) on delete cascade,
  clip_number integer not null check (clip_number > 0),
  position_seconds numeric(10,2) not null
    check (position_seconds >= 0 and position_seconds <= 86400),
  title text not null default '' check (length(title) <= 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, lesson_id, clip_number)
);

create index if not exists video_class_student_clips_lesson_idx
  on public.video_class_student_clips (lesson_id, created_at, id);
create index if not exists video_class_student_clips_student_idx
  on public.video_class_student_clips (student_id, lesson_id, clip_number);

create table if not exists public.video_class_lesson_feedback (
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  lesson_id uuid not null references public.video_class_lessons(id) on delete cascade,
  picture_quality smallint check (picture_quality is null or picture_quality between 1 and 5),
  explanation_quality smallint check (explanation_quality is null or explanation_quality between 1 and 5),
  audio_quality smallint check (audio_quality is null or audio_quality between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (student_id, lesson_id),
  check (picture_quality is not null or explanation_quality is not null or audio_quality is not null)
);

create index if not exists video_class_lesson_feedback_lesson_idx
  on public.video_class_lesson_feedback (lesson_id, updated_at desc, student_id);
create index if not exists video_class_lesson_feedback_admin_page_idx
  on public.video_class_lesson_feedback (updated_at desc, student_id, lesson_id);

create table if not exists public.video_class_student_courses (
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  course_code text not null references public.video_class_courses(code) on update cascade on delete cascade,
  enabled boolean not null default true,
  official_playlist_mode text not null default 'all'
    check (official_playlist_mode in ('all', 'none', 'manual')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.video_class_admin_accounts(id) on delete set null,
  primary key (student_id, course_code)
);

alter table public.video_class_student_courses
  add column if not exists official_playlist_mode text not null default 'all';

do $$
begin
  if not exists (
    select 1
    from pg_catalog.pg_constraint constraint_record
    where constraint_record.conrelid = 'public.video_class_student_courses'::regclass
      and constraint_record.conname = 'video_class_student_courses_official_playlist_mode_check'
  ) then
    alter table public.video_class_student_courses
      add constraint video_class_student_courses_official_playlist_mode_check
      check (official_playlist_mode in ('all', 'none', 'manual'));
  end if;
end;
$$;

create index if not exists video_class_student_courses_course_idx
  on public.video_class_student_courses (course_code, student_id)
  where enabled = true;
create index if not exists video_class_student_courses_course_fk_idx
  on public.video_class_student_courses (course_code, student_id);
create index if not exists video_class_student_courses_updated_by_idx
  on public.video_class_student_courses (updated_by)
  where updated_by is not null;

-- A course-level mode provides the fast allow-all/deny-all controls. Manual
-- mode consults this per-course, per-series override table. The course key is
-- essential because one official series can belong to several courses whose
-- access modes differ for the same student.
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

-- Upgrade the short-lived pre-release shape safely if this canonical schema is
-- reapplied after it created global (student, playlist) overrides. Each legacy
-- row is fanned out only to course memberships the student actually has.
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

-- This singleton controls how the student client presents official series.
-- Manual ordering uses each playlist's sort_order; random mode is shuffled by
-- the client so the all-videos row can still remain deterministically first.
create table if not exists public.video_class_library_settings (
  singleton boolean primary key default true check (singleton),
  official_playlist_order_mode text not null default 'manual'
    check (official_playlist_order_mode in ('manual', 'random')),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.video_class_admin_accounts(id) on delete set null
);

insert into public.video_class_library_settings (singleton)
values (true)
on conflict (singleton) do nothing;

-- The database freezes lesson metadata before the Worker deletes private R2
-- objects. A retry returns the same immutable object-key snapshot, preventing
-- a partial deletion from exposing a playable lesson again.
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

-- Opaque, short-lived grants let a native <video> element issue authenticated
-- Range requests without placing the administrator bearer token in its URL.
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

create table if not exists public.video_class_bookmarks (
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  lesson_id uuid not null references public.video_class_lessons(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (student_id, lesson_id)
);

create index if not exists video_class_bookmarks_lesson_idx
  on public.video_class_bookmarks (lesson_id, created_at desc);

create table if not exists public.video_class_notes (
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  lesson_id uuid not null references public.video_class_lessons(id) on delete cascade,
  note text not null check (length(note) between 1 and 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (student_id, lesson_id)
);

create index if not exists video_class_notes_lesson_idx
  on public.video_class_notes (lesson_id, updated_at desc);

create table if not exists public.video_class_playback_sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  lesson_id uuid not null references public.video_class_lessons(id) on delete cascade,
  student_session_hash bytea not null
    references public.video_class_student_sessions(token_hash) on delete cascade,
  video_key_snapshot text not null,
  user_agent_hash text not null check (user_agent_hash ~ '^[0-9a-f]{64}$'),
  network_hash text not null check (network_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  last_position_seconds numeric(10,2) not null default 0 check (last_position_seconds >= 0),
  view_counted_at timestamptz,
  check (expires_at > created_at)
);

alter table public.video_class_playback_sessions
  add column if not exists view_counted_at timestamptz;

create index if not exists video_class_playbacks_student_active_idx
  on public.video_class_playback_sessions (student_id, created_at desc)
  where revoked_at is null;
create index if not exists video_class_playbacks_lesson_idx
  on public.video_class_playback_sessions (lesson_id, created_at desc);
create index if not exists video_class_playbacks_expiry_idx
  on public.video_class_playback_sessions (expires_at)
  where revoked_at is null;
create index if not exists video_class_playbacks_student_session_idx
  on public.video_class_playback_sessions (student_session_hash);

create table if not exists public.video_class_progress (
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  lesson_id uuid not null references public.video_class_lessons(id) on delete cascade,
  position_seconds numeric(10,2) not null default 0 check (position_seconds >= 0),
  duration_seconds numeric(10,2) check (duration_seconds is null or duration_seconds > 0),
  total_watched_seconds numeric(14,2) not null default 0
    check (total_watched_seconds >= 0),
  completed_at timestamptz,
  view_count bigint not null default 0,
  first_viewed_at timestamptz,
  last_viewed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (student_id, lesson_id)
);

alter table public.video_class_progress
  add column if not exists view_count bigint not null default 0,
  add column if not exists first_viewed_at timestamptz,
  add column if not exists last_viewed_at timestamptz,
  add column if not exists total_watched_seconds numeric(14,2) not null default 0;

update public.video_class_progress
set total_watched_seconds = 0
where total_watched_seconds is null;

alter table public.video_class_progress
  alter column total_watched_seconds set default 0,
  alter column total_watched_seconds set not null;

do $$
begin
  if not exists (
    select 1
    from pg_catalog.pg_constraint constraint_record
    where constraint_record.conrelid = 'public.video_class_progress'::regclass
      and constraint_record.conname = 'video_class_progress_view_count_check'
  ) then
    alter table public.video_class_progress
      add constraint video_class_progress_view_count_check check (view_count >= 0);
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_constraint constraint_record
    where constraint_record.conrelid = 'public.video_class_progress'::regclass
      and constraint_record.conname = 'video_class_progress_total_watched_seconds_check'
  ) then
    alter table public.video_class_progress
      add constraint video_class_progress_total_watched_seconds_check
      check (total_watched_seconds >= 0);
  end if;
end;
$$;

create index if not exists video_class_progress_lesson_idx
  on public.video_class_progress (lesson_id, updated_at desc);
create index if not exists video_class_progress_lesson_views_idx
  on public.video_class_progress (lesson_id, last_viewed_at desc, student_id)
  where view_count > 0;

-- Daily aggregates preserve chart history without retaining a high-volume raw
-- heartbeat/event log. Lesson-level watch history remains in video_class_progress.
create table if not exists public.video_class_daily_progress (
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  lesson_id uuid not null references public.video_class_lessons(id) on delete cascade,
  activity_date date not null,
  watched_seconds numeric(14,2) not null default 0 check (watched_seconds >= 0),
  view_count bigint not null default 0 check (view_count >= 0),
  first_activity_at timestamptz not null default now(),
  last_activity_at timestamptz not null default now(),
  primary key (student_id, lesson_id, activity_date),
  check (last_activity_at >= first_activity_at)
);

create index if not exists video_class_daily_progress_student_date_idx
  on public.video_class_daily_progress (student_id, activity_date desc, lesson_id);
create index if not exists video_class_daily_progress_lesson_date_idx
  on public.video_class_daily_progress (lesson_id, activity_date desc, student_id);

-- Seed the new aggregates once from the best historical information available.
-- Existing progress stores one row per lesson, so the seed is attributed to
-- that row's latest activity date; future heartbeats retain exact daily totals.
do $$
begin
  insert into public.video_class_rollouts (rollout_key)
  values ('daily-analytics-progress-backfill-v1')
  on conflict (rollout_key) do nothing;

  if found then
    update public.video_class_progress progress
    set total_watched_seconds = greatest(
      progress.total_watched_seconds,
      least(
        progress.position_seconds,
        coalesce(progress.duration_seconds, progress.position_seconds)
      )
    )
    where progress.position_seconds > 0;

    insert into public.video_class_daily_progress (
      student_id, lesson_id, activity_date, watched_seconds, view_count,
      first_activity_at, last_activity_at
    )
    select
      progress.student_id,
      progress.lesson_id,
      (
        coalesce(
          progress.last_viewed_at,
          progress.updated_at,
          progress.first_viewed_at,
          now()
        ) at time zone 'Asia/Hong_Kong'
      )::date,
      progress.total_watched_seconds,
      progress.view_count,
      coalesce(progress.first_viewed_at, progress.updated_at, now()),
      coalesce(progress.last_viewed_at, progress.updated_at, now())
    from public.video_class_progress progress
    where progress.position_seconds > 0
       or progress.view_count > 0
       or progress.total_watched_seconds > 0
    on conflict (student_id, lesson_id, activity_date) do nothing;
  end if;
end;
$$;

create table if not exists public.video_class_admin_audit_events (
  id bigint generated always as identity primary key,
  admin_id uuid references public.video_class_admin_accounts(id) on delete set null,
  student_id uuid references public.flashcard_students(id) on delete set null,
  action text not null check (action in (
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
  )),
  detail jsonb not null default '{}'::jsonb check (jsonb_typeof(detail) = 'object'),
  created_at timestamptz not null default now()
);

-- Expand the pre-course audit constraint without depending on a destructive
-- table rebuild. The original migration uses this deterministic constraint name.
do $$
begin
  if exists (
    select 1
    from pg_catalog.pg_constraint constraint_record
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
      'edit_lesson_feedback', 'delete_lesson_feedback',
      'edit_lesson', 'set_lesson_thumbnail', 'remove_lesson_thumbnail',
      'prepare_delete_lesson', 'delete_lesson',
      'set_student_series_mode', 'set_student_series_access',
      'replace_student_series_access', 'set_official_playlist_order'
    ));
end;
$$;

create index if not exists video_class_admin_audit_time_idx
  on public.video_class_admin_audit_events (created_at desc, id desc);
create index if not exists video_class_admin_audit_student_idx
  on public.video_class_admin_audit_events (student_id, created_at desc);
create index if not exists video_class_admin_audit_admin_idx
  on public.video_class_admin_audit_events (admin_id, created_at desc);

alter table public.video_class_admin_accounts enable row level security;
alter table public.video_class_admin_sessions enable row level security;
alter table public.video_class_worker_secrets enable row level security;
alter table public.video_class_login_attempts enable row level security;
alter table public.video_class_rollouts enable row level security;
alter table public.video_class_courses enable row level security;
alter table public.video_class_student_access enable row level security;
alter table public.video_class_student_sessions enable row level security;
alter table public.video_class_lessons enable row level security;
alter table public.video_class_lesson_courses enable row level security;
alter table public.video_class_lesson_renditions enable row level security;
alter table public.video_class_lesson_thumbnails enable row level security;
alter table public.video_class_lesson_attachments enable row level security;
alter table public.video_class_tags enable row level security;
alter table public.video_class_lesson_tags enable row level security;
alter table public.video_class_official_playlists enable row level security;
alter table public.video_class_official_playlist_courses enable row level security;
alter table public.video_class_official_playlist_items enable row level security;
alter table public.video_class_student_playlists enable row level security;
alter table public.video_class_student_playlist_items enable row level security;
alter table public.video_class_student_clips enable row level security;
alter table public.video_class_lesson_feedback enable row level security;
alter table public.video_class_student_courses enable row level security;
alter table public.video_class_student_official_playlists enable row level security;
alter table public.video_class_library_settings enable row level security;
alter table public.video_class_lesson_deletion_jobs enable row level security;
alter table public.video_class_admin_preview_grants enable row level security;
alter table public.video_class_bookmarks enable row level security;
alter table public.video_class_notes enable row level security;
alter table public.video_class_playback_sessions enable row level security;
alter table public.video_class_progress enable row level security;
alter table public.video_class_daily_progress enable row level security;
alter table public.video_class_admin_audit_events enable row level security;

revoke all on table public.video_class_admin_accounts from public, anon, authenticated;
revoke all on table public.video_class_admin_sessions from public, anon, authenticated;
revoke all on table public.video_class_worker_secrets from public, anon, authenticated;
revoke all on table public.video_class_login_attempts from public, anon, authenticated;
revoke all on table public.video_class_rollouts from public, anon, authenticated;
revoke all on table public.video_class_courses from public, anon, authenticated;
revoke all on table public.video_class_student_access from public, anon, authenticated;
revoke all on table public.video_class_student_sessions from public, anon, authenticated;
revoke all on table public.video_class_lessons from public, anon, authenticated;
revoke all on table public.video_class_lesson_courses from public, anon, authenticated;
revoke all on table public.video_class_lesson_renditions from public, anon, authenticated;
revoke all on table public.video_class_lesson_thumbnails from public, anon, authenticated;
revoke all on table public.video_class_lesson_attachments from public, anon, authenticated;
revoke all on table public.video_class_tags from public, anon, authenticated;
revoke all on table public.video_class_lesson_tags from public, anon, authenticated;
revoke all on table public.video_class_official_playlists from public, anon, authenticated;
revoke all on table public.video_class_official_playlist_courses from public, anon, authenticated;
revoke all on table public.video_class_official_playlist_items from public, anon, authenticated;
revoke all on table public.video_class_student_playlists from public, anon, authenticated;
revoke all on table public.video_class_student_playlist_items from public, anon, authenticated;
revoke all on table public.video_class_student_clips from public, anon, authenticated;
revoke all on table public.video_class_lesson_feedback from public, anon, authenticated;
revoke all on table public.video_class_student_courses from public, anon, authenticated;
revoke all on table public.video_class_student_official_playlists from public, anon, authenticated;
revoke all on table public.video_class_library_settings from public, anon, authenticated;
revoke all on table public.video_class_lesson_deletion_jobs from public, anon, authenticated;
revoke all on table public.video_class_admin_preview_grants from public, anon, authenticated;
revoke all on table public.video_class_bookmarks from public, anon, authenticated;
revoke all on table public.video_class_notes from public, anon, authenticated;
revoke all on table public.video_class_playback_sessions from public, anon, authenticated;
revoke all on table public.video_class_progress from public, anon, authenticated;
revoke all on table public.video_class_daily_progress from public, anon, authenticated;
revoke all on table public.video_class_admin_audit_events from public, anon, authenticated;

create or replace function public.video_class_touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.video_class_touch_updated_at() from public, anon, authenticated;

drop trigger if exists video_class_admin_accounts_touch on public.video_class_admin_accounts;
create trigger video_class_admin_accounts_touch
before update on public.video_class_admin_accounts
for each row execute function public.video_class_touch_updated_at();

drop trigger if exists video_class_student_access_touch on public.video_class_student_access;
create trigger video_class_student_access_touch
before update on public.video_class_student_access
for each row execute function public.video_class_touch_updated_at();

drop trigger if exists video_class_courses_touch on public.video_class_courses;
create trigger video_class_courses_touch
before update on public.video_class_courses
for each row execute function public.video_class_touch_updated_at();

drop trigger if exists video_class_student_courses_touch on public.video_class_student_courses;
create trigger video_class_student_courses_touch
before update on public.video_class_student_courses
for each row execute function public.video_class_touch_updated_at();

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

drop trigger if exists video_class_notes_touch on public.video_class_notes;
create trigger video_class_notes_touch
before update on public.video_class_notes
for each row execute function public.video_class_touch_updated_at();

drop trigger if exists video_class_lessons_touch on public.video_class_lessons;
create trigger video_class_lessons_touch
before update on public.video_class_lessons
for each row execute function public.video_class_touch_updated_at();

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

revoke all on function public.video_class_seed_primary_lesson_course()
  from public, anon, authenticated;

drop trigger if exists video_class_lessons_seed_primary_course on public.video_class_lessons;
create trigger video_class_lessons_seed_primary_course
after insert on public.video_class_lessons
for each row execute function public.video_class_seed_primary_lesson_course();

drop trigger if exists video_class_renditions_touch on public.video_class_lesson_renditions;
create trigger video_class_renditions_touch
before update on public.video_class_lesson_renditions
for each row execute function public.video_class_touch_updated_at();

drop trigger if exists video_class_thumbnails_touch on public.video_class_lesson_thumbnails;
create trigger video_class_thumbnails_touch
before update on public.video_class_lesson_thumbnails
for each row execute function public.video_class_touch_updated_at();

drop trigger if exists video_class_attachments_touch on public.video_class_lesson_attachments;
create trigger video_class_attachments_touch
before update on public.video_class_lesson_attachments
for each row execute function public.video_class_touch_updated_at();

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

drop trigger if exists video_class_tags_touch on public.video_class_tags;
create trigger video_class_tags_touch
before update on public.video_class_tags
for each row execute function public.video_class_touch_updated_at();

drop trigger if exists video_class_official_playlists_touch on public.video_class_official_playlists;
create trigger video_class_official_playlists_touch
before update on public.video_class_official_playlists
for each row execute function public.video_class_touch_updated_at();

drop trigger if exists video_class_student_playlists_touch on public.video_class_student_playlists;
create trigger video_class_student_playlists_touch
before update on public.video_class_student_playlists
for each row execute function public.video_class_touch_updated_at();

drop trigger if exists video_class_student_clips_touch on public.video_class_student_clips;
create trigger video_class_student_clips_touch
before update on public.video_class_student_clips
for each row execute function public.video_class_touch_updated_at();

drop trigger if exists video_class_lesson_feedback_touch on public.video_class_lesson_feedback;
create trigger video_class_lesson_feedback_touch
before update on public.video_class_lesson_feedback
for each row execute function public.video_class_touch_updated_at();

create or replace function public.video_class_touch_student_playlist_from_item()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_playlist_id uuid;
begin
  v_playlist_id := case when tg_op = 'DELETE' then old.playlist_id else new.playlist_id end;
  update public.video_class_student_playlists playlist
  set updated_at = now()
  where playlist.id = v_playlist_id;
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

revoke all on function public.video_class_touch_student_playlist_from_item()
  from public, anon, authenticated;

drop trigger if exists video_class_student_playlist_items_touch_parent
  on public.video_class_student_playlist_items;
create trigger video_class_student_playlist_items_touch_parent
after insert or update on public.video_class_student_playlist_items
for each row execute function public.video_class_touch_student_playlist_from_item();

create or replace function public.video_class_touch_official_playlist_from_item()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_playlist_id uuid;
begin
  v_playlist_id := case when tg_op = 'DELETE' then old.playlist_id else new.playlist_id end;
  update public.video_class_official_playlists playlist
  set updated_at = now()
  where playlist.id = v_playlist_id;
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

revoke all on function public.video_class_touch_official_playlist_from_item()
  from public, anon, authenticated;

drop trigger if exists video_class_official_playlist_items_touch_parent
  on public.video_class_official_playlist_items;
create trigger video_class_official_playlist_items_touch_parent
after insert or update on public.video_class_official_playlist_items
for each row execute function public.video_class_touch_official_playlist_from_item();

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

revoke all on function public.video_class_validate_official_playlist_item()
  from public, anon, authenticated;

drop trigger if exists video_class_official_playlist_items_validate_course
  on public.video_class_official_playlist_items;
create trigger video_class_official_playlist_items_validate_course
before insert or update
on public.video_class_official_playlist_items
for each row execute function public.video_class_validate_official_playlist_item();

create or replace function public.video_class_revoke_admin_sessions_on_password_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.password_hash is distinct from new.password_hash then
    delete from public.video_class_admin_sessions session
    where session.admin_id = new.id;
  end if;
  return new;
end;
$$;

revoke all on function public.video_class_revoke_admin_sessions_on_password_change() from public, anon, authenticated;

drop trigger if exists video_class_admin_password_revoke on public.video_class_admin_accounts;
create trigger video_class_admin_password_revoke
after update of password_hash on public.video_class_admin_accounts
for each row execute function public.video_class_revoke_admin_sessions_on_password_change();

create or replace function public.video_class_revoke_student_sessions_on_password_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.password_hash is distinct from new.password_hash then
    -- A password change invalidates every shared bearer session as well as the
    -- derived video sessions, preventing immediate re-entry via token exchange.
    delete from public.flashcard_student_sessions session
    where session.student_id = new.id;

    delete from public.video_class_student_sessions session
    where session.student_id = new.id;
  end if;
  return new;
end;
$$;

revoke all on function public.video_class_revoke_student_sessions_on_password_change() from public, anon, authenticated;

-- This update-only trigger revokes video sessions after a shared-account
-- password change. It never creates an entitlement or key for a new student.
drop trigger if exists video_class_student_password_revoke on public.flashcard_students;
create trigger video_class_student_password_revoke
after update of password_hash on public.flashcard_students
for each row execute function public.video_class_revoke_student_sessions_on_password_change();

create or replace function public.video_class_revoke_playbacks_on_access_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
begin
  if tg_op = 'DELETE' then
    v_student_id := old.student_id;
    update public.video_class_playback_sessions playback
    set revoked_at = coalesce(playback.revoked_at, now())
    where playback.student_id = v_student_id
      and playback.revoked_at is null;
    return old;
  end if;

  v_student_id := new.student_id;

  if old.video_key is distinct from new.video_key
    or old.enabled is distinct from new.enabled
  then
    update public.video_class_playback_sessions playback
    set revoked_at = coalesce(playback.revoked_at, now())
    where playback.student_id = v_student_id
      and playback.revoked_at is null;
  elsif old.watermark_enabled is distinct from new.watermark_enabled then
    update public.video_class_playback_sessions playback
    set revoked_at = coalesce(playback.revoked_at, now())
    where playback.student_id = v_student_id
      and playback.revoked_at is null;
  end if;
  return new;
end;
$$;

revoke all on function public.video_class_revoke_playbacks_on_access_change() from public, anon, authenticated;

drop trigger if exists video_class_access_revoke_playbacks on public.video_class_student_access;
create trigger video_class_access_revoke_playbacks
after update of video_key, enabled, watermark_enabled or delete on public.video_class_student_access
for each row execute function public.video_class_revoke_playbacks_on_access_change();

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

create or replace function public._video_class_worker_ok(p_service_secret text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(length(p_service_secret), 0) >= 48
    and exists (
      select 1
      from public.video_class_worker_secrets secret
      where secret.name = 'video-class-worker'
        and secret.secret_hash = extensions.digest(p_service_secret, 'sha256')
    );
$$;

revoke all on function public._video_class_worker_ok(text) from public, anon, authenticated;

create or replace function public._video_class_login_identifier_hash(
  p_service_secret text,
  p_realm text,
  p_name text
)
returns bytea
language sql
immutable
set search_path = ''
as $$
  select extensions.hmac(
    pg_catalog.convert_to(p_realm, 'UTF8')
      || pg_catalog.decode('00', 'hex')
      || pg_catalog.convert_to(pg_catalog.lower(pg_catalog.btrim(p_name)), 'UTF8'),
    pg_catalog.convert_to(p_service_secret, 'UTF8')
      || pg_catalog.decode('00', 'hex')
      || pg_catalog.convert_to('edmund-video-class-login-v1', 'UTF8'),
    'sha256'
  );
$$;

revoke all on function public._video_class_login_identifier_hash(text, text, text)
  from public, anon, authenticated;

create or replace function public._video_class_login_delay_seconds(p_failure_count integer)
returns integer
language sql
immutable
set search_path = ''
as $$
  select case
    when p_failure_count >= 10 then 900
    when p_failure_count >= 7 then 300
    when p_failure_count >= 5 then 60
    else 0
  end;
$$;

revoke all on function public._video_class_login_delay_seconds(integer)
  from public, anon, authenticated;

create or replace function public._video_class_admin_id(p_admin_token uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select session.admin_id
  from public.video_class_admin_sessions session
  where p_admin_token is not null
    and session.token_hash = extensions.digest(p_admin_token::text, 'sha256')
    and session.expires_at > now()
  limit 1;
$$;

revoke all on function public._video_class_admin_id(uuid) from public, anon, authenticated;

create or replace function public._video_class_student_id(p_student_token uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select session.student_id
  from public.video_class_student_sessions session
  join public.flashcard_students student on student.id = session.student_id
  join public.video_class_student_access access on access.student_id = student.id
  where p_student_token is not null
    and session.token_hash = extensions.digest(p_student_token::text, 'sha256')
    and session.expires_at > now()
    and student.deleted_at is null
    and access.enabled = true
  limit 1;
$$;

revoke all on function public._video_class_student_id(uuid) from public, anon, authenticated;

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

-- Compatibility wrapper for catalogue-wide questions. Course-specific paths
-- must call the three-argument helper above so a shared-series grant cannot
-- bleed from one course into another.
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

revoke all on function public._video_class_student_playlist_json(uuid, uuid)
  from public, anon, authenticated;

create or replace function public._video_class_next_key()
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_raw text;
  v_key text;
begin
  loop
    v_raw := upper(encode(extensions.gen_random_bytes(6), 'hex'));
    v_key := 'EDU-' || substr(v_raw, 1, 4) || '-' || substr(v_raw, 5, 4) || '-' || substr(v_raw, 9, 4);
    exit when not exists (
      select 1 from public.video_class_student_access access
      where access.video_key = v_key
    );
  end loop;
  return v_key;
end;
$$;

revoke all on function public._video_class_next_key() from public, anon, authenticated;

drop function if exists public.video_class_student_login(text, text, text);

create or replace function public.video_class_student_login(
  p_service_secret text,
  p_name text,
  p_password text,
  p_turnstile_verified boolean
)
returns table (
  outcome text,
  challenge_required boolean,
  retry_after_seconds integer,
  video_token uuid,
  flashcard_token uuid,
  student_id uuid,
  name text,
  video_key text,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_identifier_hash bytea;
  v_failure_count smallint;
  v_last_failed_at timestamptz;
  v_blocked_until timestamptz;
  v_delay_seconds integer;
  v_student_id uuid;
  v_student_name text;
  v_password_hash text;
  v_video_key text;
  v_account_enabled boolean := false;
  v_password_matches boolean := false;
  v_video_token uuid := gen_random_uuid();
  v_flashcard_token uuid;
  v_now timestamptz := clock_timestamp();
  v_expires_at timestamptz := v_now + interval '8 hours';
begin
  if not public._video_class_worker_ok(p_service_secret)
    or nullif(trim(coalesce(p_name, '')), '') is null
    or length(trim(p_name)) > 100
    or p_password is null
    or length(p_password) > 200
  then
    return;
  end if;

  v_identifier_hash := public._video_class_login_identifier_hash(
    p_service_secret,
    'student',
    p_name
  );

  -- Keep random-name attacks from growing this private table forever while
  -- bounding cleanup work performed by any one login request.
  with stale as (
    select attempt.realm, attempt.identifier_hash
    from public.video_class_login_attempts attempt
    where attempt.updated_at < v_now - interval '24 hours'
    order by attempt.updated_at, attempt.realm, attempt.identifier_hash
    for update skip locked
    limit 100
  )
  delete from public.video_class_login_attempts attempt
  using stale
  where attempt.realm = stale.realm
    and attempt.identifier_hash = stale.identifier_hash;

  -- A successful concurrent login may delete the row between INSERT ... DO
  -- NOTHING and SELECT. Repeat until this transaction owns a locked row so a
  -- failure can never disappear through that race.
  loop
    insert into public.video_class_login_attempts (
      realm, identifier_hash, failure_count, created_at, updated_at
    )
    values ('student', v_identifier_hash, 0, v_now, v_now)
    on conflict (realm, identifier_hash) do nothing;

    select attempt.failure_count, attempt.last_failed_at, attempt.blocked_until
    into v_failure_count, v_last_failed_at, v_blocked_until
    from public.video_class_login_attempts attempt
    where attempt.realm = 'student'
      and attempt.identifier_hash = v_identifier_hash
    for update;
    exit when found;
  end loop;

  v_now := clock_timestamp();
  v_expires_at := v_now + interval '8 hours';

  if v_last_failed_at is not null
    and v_last_failed_at <= v_now - interval '30 minutes'
  then
    update public.video_class_login_attempts attempt
    set failure_count = 0,
        last_failed_at = null,
        blocked_until = null,
        updated_at = v_now
    where attempt.realm = 'student'
      and attempt.identifier_hash = v_identifier_hash;
    v_failure_count := 0;
    v_last_failed_at := null;
    v_blocked_until := null;
  end if;

  if v_blocked_until is not null and v_blocked_until > v_now then
    outcome := 'blocked';
    challenge_required := true;
    retry_after_seconds := greatest(
      1,
      ceil(extract(epoch from (v_blocked_until - v_now)))::integer
    );
    return next;
    return;
  end if;

  if v_failure_count >= 3 and p_turnstile_verified is not true then
    outcome := 'challenge_required';
    challenge_required := true;
    retry_after_seconds := 0;
    return next;
    return;
  end if;

  select
    student.id,
    student.name,
    student.password_hash,
    access.video_key,
    student.deleted_at is null and coalesce(access.enabled, false)
  into
    v_student_id,
    v_student_name,
    v_password_hash,
    v_video_key,
    v_account_enabled
  from public.flashcard_students student
  left join public.video_class_student_access access on access.student_id = student.id
  where lower(student.name) = lower(trim(p_name))
  limit 1
  for no key update of student;

  if found then
    v_password_matches := v_password_hash = extensions.crypt(p_password, v_password_hash);
  else
    -- Match the cost of a real bcrypt check so challenge timing does not reveal
    -- whether the normalized username exists.
    perform extensions.crypt(p_password, extensions.gen_salt('bf', 10));
  end if;

  if v_student_id is null or not v_account_enabled or not v_password_matches then
    v_now := clock_timestamp();
    v_failure_count := least(10, v_failure_count + 1)::smallint;
    v_delay_seconds := public._video_class_login_delay_seconds(v_failure_count);

    update public.video_class_login_attempts attempt
    set failure_count = v_failure_count,
        last_failed_at = v_now,
        blocked_until = case
          when v_delay_seconds > 0 then v_now + (v_delay_seconds * interval '1 second')
          else null
        end,
        updated_at = v_now
    where attempt.realm = 'student'
      and attempt.identifier_hash = v_identifier_hash;

    outcome := case when v_delay_seconds > 0 then 'blocked' else 'invalid' end;
    challenge_required := v_failure_count >= 3;
    retry_after_seconds := v_delay_seconds;
    return next;
    return;
  end if;

  v_now := clock_timestamp();
  v_expires_at := v_now + interval '8 hours';

  delete from public.video_class_login_attempts attempt
  where attempt.realm = 'student'
    and attempt.identifier_hash = v_identifier_hash;

  delete from public.video_class_student_sessions session
  where session.expires_at <= v_now;

  insert into public.flashcard_student_sessions (student_id, expires_at)
  values (v_student_id, v_expires_at)
  returning token into v_flashcard_token;

  insert into public.video_class_student_sessions (
    token_hash, student_id, minted_flashcard_token, expires_at
  )
  values (
    extensions.digest(v_video_token::text, 'sha256'),
    v_student_id,
    v_flashcard_token,
    v_expires_at
  );

  outcome := 'success';
  challenge_required := false;
  retry_after_seconds := 0;
  video_token := v_video_token;
  flashcard_token := v_flashcard_token;
  student_id := v_student_id;
  name := v_student_name;
  video_key := v_video_key;
  expires_at := v_expires_at;
  return next;
end;
$$;

create or replace function public.video_class_student_exchange(
  p_service_secret text,
  p_flashcard_token uuid
)
returns table (
  video_token uuid,
  flashcard_token uuid,
  student_id uuid,
  name text,
  video_key text,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
  v_student_name text;
  v_video_key text;
  v_video_token uuid := gen_random_uuid();
  v_now timestamptz := clock_timestamp();
  v_expires_at timestamptz := v_now + interval '8 hours';
begin
  if not public._video_class_worker_ok(p_service_secret) or p_flashcard_token is null then
    return;
  end if;

  -- Read the parent identifier, then lock in parent-to-child order and
  -- revalidate the exact bearer session. This serializes exchange with both
  -- password changes and shared-session logout.
  select session.student_id into v_student_id
  from public.flashcard_student_sessions session
  where session.token = p_flashcard_token
    and session.expires_at > clock_timestamp()
  limit 1;

  if not found then
    return;
  end if;

  select student.id, student.name, access.video_key
  into v_student_id, v_student_name, v_video_key
  from public.flashcard_students student
  join public.video_class_student_access access on access.student_id = student.id
  where student.id = v_student_id
    and student.deleted_at is null
    and access.enabled = true
  for key share of student;

  if not found then
    return;
  end if;

  perform session.token
  from public.flashcard_student_sessions session
  where session.token = p_flashcard_token
    and session.student_id = v_student_id
    and session.expires_at > clock_timestamp()
  for key share of session;

  if not found then
    return;
  end if;

  delete from public.video_class_student_sessions session
  where session.expires_at <= v_now;

  insert into public.video_class_student_sessions (token_hash, student_id, expires_at)
  values (extensions.digest(v_video_token::text, 'sha256'), v_student_id, v_expires_at);

  return query
  select v_video_token, p_flashcard_token, v_student_id, v_student_name, v_video_key, v_expires_at;
end;
$$;

create or replace function public.video_class_student_me(
  p_service_secret text,
  p_student_token uuid
)
returns table (
  student_id uuid,
  name text,
  video_key text,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public._video_class_worker_ok(p_service_secret) or p_student_token is null then
    return;
  end if;

  update public.video_class_student_sessions session
  set last_seen_at = now()
  where session.token_hash = extensions.digest(p_student_token::text, 'sha256')
    and session.expires_at > now();

  if not found then
    return;
  end if;

  return query
  select student.id, student.name, access.video_key, session.expires_at
  from public.video_class_student_sessions session
  join public.flashcard_students student on student.id = session.student_id
  join public.video_class_student_access access on access.student_id = student.id
  where session.token_hash = extensions.digest(p_student_token::text, 'sha256')
    and session.expires_at > now()
    and student.deleted_at is null
    and access.enabled = true
  limit 1;
end;
$$;

create or replace function public.video_class_student_logout(
  p_service_secret text,
  p_student_token uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_minted_flashcard_token uuid;
begin
  if not public._video_class_worker_ok(p_service_secret) or p_student_token is null then
    return false;
  end if;
  delete from public.video_class_student_sessions session
  where session.token_hash = extensions.digest(p_student_token::text, 'sha256')
  returning session.minted_flashcard_token into v_minted_flashcard_token;
  if not found then
    return false;
  end if;
  if v_minted_flashcard_token is not null then
    delete from public.flashcard_student_sessions session
    where session.token = v_minted_flashcard_token;
  end if;
  return true;
end;
$$;

drop function if exists public.video_class_admin_login(text, text, text);

create or replace function public.video_class_admin_login(
  p_service_secret text,
  p_name text,
  p_password text,
  p_turnstile_verified boolean
)
returns table (
  outcome text,
  challenge_required boolean,
  retry_after_seconds integer,
  admin_token uuid,
  name text,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_identifier_hash bytea;
  v_failure_count smallint;
  v_last_failed_at timestamptz;
  v_blocked_until timestamptz;
  v_delay_seconds integer;
  v_admin public.video_class_admin_accounts%rowtype;
  v_password_matches boolean := false;
  v_token uuid := gen_random_uuid();
  v_now timestamptz := clock_timestamp();
  v_expires_at timestamptz := v_now + interval '8 hours';
begin
  if not public._video_class_worker_ok(p_service_secret)
    or nullif(trim(coalesce(p_name, '')), '') is null
    or length(trim(p_name)) > 100
    or p_password is null
    or length(p_password) > 200
  then
    return;
  end if;

  v_identifier_hash := public._video_class_login_identifier_hash(
    p_service_secret,
    'admin',
    p_name
  );

  with stale as (
    select attempt.realm, attempt.identifier_hash
    from public.video_class_login_attempts attempt
    where attempt.updated_at < v_now - interval '24 hours'
    order by attempt.updated_at, attempt.realm, attempt.identifier_hash
    for update skip locked
    limit 100
  )
  delete from public.video_class_login_attempts attempt
  using stale
  where attempt.realm = stale.realm
    and attempt.identifier_hash = stale.identifier_hash;

  loop
    insert into public.video_class_login_attempts (
      realm, identifier_hash, failure_count, created_at, updated_at
    )
    values ('admin', v_identifier_hash, 0, v_now, v_now)
    on conflict (realm, identifier_hash) do nothing;

    select attempt.failure_count, attempt.last_failed_at, attempt.blocked_until
    into v_failure_count, v_last_failed_at, v_blocked_until
    from public.video_class_login_attempts attempt
    where attempt.realm = 'admin'
      and attempt.identifier_hash = v_identifier_hash
    for update;
    exit when found;
  end loop;

  v_now := clock_timestamp();
  v_expires_at := v_now + interval '8 hours';

  if v_last_failed_at is not null
    and v_last_failed_at <= v_now - interval '30 minutes'
  then
    update public.video_class_login_attempts attempt
    set failure_count = 0,
        last_failed_at = null,
        blocked_until = null,
        updated_at = v_now
    where attempt.realm = 'admin'
      and attempt.identifier_hash = v_identifier_hash;
    v_failure_count := 0;
    v_last_failed_at := null;
    v_blocked_until := null;
  end if;

  if v_blocked_until is not null and v_blocked_until > v_now then
    outcome := 'blocked';
    challenge_required := true;
    retry_after_seconds := greatest(
      1,
      ceil(extract(epoch from (v_blocked_until - v_now)))::integer
    );
    return next;
    return;
  end if;

  if v_failure_count >= 3 and p_turnstile_verified is not true then
    outcome := 'challenge_required';
    challenge_required := true;
    retry_after_seconds := 0;
    return next;
    return;
  end if;

  select admin.*
  into v_admin
  from public.video_class_admin_accounts admin
  where lower(trim(admin.name)) = lower(trim(p_name))
  limit 1
  for no key update of admin;

  if found then
    v_password_matches := v_admin.password_hash = extensions.crypt(p_password, v_admin.password_hash);
  else
    perform extensions.crypt(p_password, extensions.gen_salt('bf', 10));
  end if;

  if v_admin.id is null or not v_password_matches then
    v_now := clock_timestamp();
    v_failure_count := least(10, v_failure_count + 1)::smallint;
    v_delay_seconds := public._video_class_login_delay_seconds(v_failure_count);

    update public.video_class_login_attempts attempt
    set failure_count = v_failure_count,
        last_failed_at = v_now,
        blocked_until = case
          when v_delay_seconds > 0 then v_now + (v_delay_seconds * interval '1 second')
          else null
        end,
        updated_at = v_now
    where attempt.realm = 'admin'
      and attempt.identifier_hash = v_identifier_hash;

    outcome := case when v_delay_seconds > 0 then 'blocked' else 'invalid' end;
    challenge_required := v_failure_count >= 3;
    retry_after_seconds := v_delay_seconds;
    return next;
    return;
  end if;

  v_now := clock_timestamp();
  v_expires_at := v_now + interval '8 hours';

  delete from public.video_class_login_attempts attempt
  where attempt.realm = 'admin'
    and attempt.identifier_hash = v_identifier_hash;

  delete from public.video_class_admin_sessions session
  where session.expires_at <= v_now;

  insert into public.video_class_admin_sessions (token_hash, admin_id, expires_at)
  values (extensions.digest(v_token::text, 'sha256'), v_admin.id, v_expires_at);

  outcome := 'success';
  challenge_required := false;
  retry_after_seconds := 0;
  admin_token := v_token;
  name := v_admin.name;
  expires_at := v_expires_at;
  return next;
end;
$$;

create or replace function public.video_class_admin_me(
  p_service_secret text,
  p_admin_token uuid
)
returns table (admin_id uuid, name text, expires_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select admin.id, admin.name, session.expires_at
  from public.video_class_admin_sessions session
  join public.video_class_admin_accounts admin on admin.id = session.admin_id
  where public._video_class_worker_ok(p_service_secret)
    and p_admin_token is not null
    and session.token_hash = extensions.digest(p_admin_token::text, 'sha256')
    and session.expires_at > now()
  limit 1;
$$;

create or replace function public.video_class_admin_logout(
  p_service_secret text,
  p_admin_token uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public._video_class_worker_ok(p_service_secret) or p_admin_token is null then
    return false;
  end if;
  delete from public.video_class_admin_sessions session
  where session.token_hash = extensions.digest(p_admin_token::text, 'sha256');
  return found;
end;
$$;

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

create or replace function public.video_class_admin_list_courses(
  p_service_secret text,
  p_admin_token uuid
)
returns table (
  course_code text,
  title text,
  sort_order integer,
  published boolean
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
  select course.code, course.title, course.sort_order, course.published
  from public.video_class_courses course
  order by course.sort_order, course.code;
end;
$$;

create or replace function public.video_class_admin_list_lessons(
  p_service_secret text,
  p_admin_token uuid
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  if not public._video_class_worker_ok(p_service_secret)
    or public._video_class_admin_id(p_admin_token) is null
  then
    raise exception 'Invalid or expired admin session';
  end if;

  select jsonb_build_object(
    'lessons', coalesce(jsonb_agg(
      jsonb_build_object(
        'lesson_id', lesson.id,
        'slug', lesson.slug,
        'title', lesson.title,
        'description', lesson.description,
        'course_code', lesson.course_code,
        'course_title', course.title,
        'course_label', lesson.course_label,
        'duration_seconds', lesson.duration_seconds,
        'sort_order', lesson.sort_order,
        'published', lesson.published,
        'is_private', lesson.is_private,
        'total_view_count', coalesce((
          select sum(progress.view_count)::bigint
          from public.video_class_progress progress
          where progress.lesson_id = lesson.id
        ), 0::bigint),
        'has_thumbnail', exists (
          select 1
          from public.video_class_lesson_thumbnails thumbnail
          where thumbnail.lesson_id = lesson.id
            and thumbnail.enabled = true
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
        'tags', coalesce((
          select jsonb_agg(
            jsonb_build_object('slug', tag.slug, 'label', tag.label)
            order by tag.sort_order, tag.slug
          )
          from public.video_class_lesson_tags lesson_tag
          join public.video_class_tags tag on tag.id = lesson_tag.tag_id
          where lesson_tag.lesson_id = lesson.id
        ), '[]'::jsonb),
        'renditions', coalesce((
          select jsonb_agg(
            jsonb_build_object(
              'quality_code', rendition.quality_code,
              'display_label', rendition.display_label,
              'height_pixels', rendition.height_pixels,
              'byte_length', rendition.byte_length,
              'is_default', rendition.is_default,
              'enabled', rendition.enabled
            )
            order by rendition.sort_order, rendition.height_pixels nulls last,
              rendition.quality_code
          )
          from public.video_class_lesson_renditions rendition
          where rendition.lesson_id = lesson.id
        ), '[]'::jsonb),
        'created_at', lesson.created_at,
        'updated_at', lesson.updated_at
      )
      order by course.sort_order, lesson.sort_order, lesson.created_at, lesson.id
    ), '[]'::jsonb)
  )
  into v_result
  from public.video_class_lessons lesson
  join public.video_class_courses course on course.code = lesson.course_code;

  return v_result;
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

create or replace function public._video_class_valid_object_key(p_object_key text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select p_object_key is not null
    and length(p_object_key) between 1 and 900
    and p_object_key = btrim(p_object_key)
    and left(p_object_key, 1) <> '/'
    and right(p_object_key, 1) <> '/'
    and p_object_key !~ '[[:cntrl:]]'
    and p_object_key !~ '(^|/)\.{1,2}(/|$)';
$$;

revoke all on function public._video_class_valid_object_key(text)
  from public, anon, authenticated;

-- The Worker first inventories and HEAD-validates the private R2 object. This
-- transaction then publishes only validated metadata and never returns a key.
-- Repeating the same request for an already-created lesson is safe and returns
-- the same public metadata rather than creating a duplicate lesson.
drop function if exists public.video_class_admin_publish_r2_object(
  text, uuid, text, text, text, text, text, text, integer, integer,
  text, bigint, jsonb, jsonb, jsonb
);
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
  v_lesson public.video_class_lessons%rowtype;
  v_existing_lesson public.video_class_lessons%rowtype;
  v_result jsonb;
  v_object_key text;
  v_title text := btrim(coalesce(p_title, ''));
  v_description text := coalesce(p_description, '');
  v_course_label text := btrim(coalesce(p_course_label, ''));
  v_content_type text := lower(btrim(coalesce(p_content_type, '')));
  v_tag jsonb;
  v_tag_label text;
  v_tag_slug text;
  v_rendition jsonb;
  v_quality_code text;
  v_display_label text;
  v_rendition_key text;
  v_rendition_content_type text;
  v_height_pixels integer;
  v_rendition_byte_length bigint;
  v_rendition_sort_order integer;
  v_thumbnail_key text;
  v_thumbnail_content_type text;
  v_thumbnail_byte_length bigint;
  v_requested_key_count integer;
  v_distinct_key_count integer;
  v_codes text[];
  v_previous_codes text[];
  v_created boolean := false;
begin
  if not public._video_class_worker_ok(p_service_secret) then
    raise exception 'Worker authorization failed';
  end if;

  v_admin_id := public._video_class_admin_id(p_admin_token);
  if v_admin_id is null then
    raise exception 'Invalid or expired admin session';
  end if;

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

  if not public._video_class_valid_object_key(p_object_key)
    or p_slug is null
    or p_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    or length(p_slug) > 160
    or length(v_title) not between 1 and 160
    or length(v_description) > 2000
    or p_course_code is null
    or p_course_code !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    or length(p_course_code) > 64
    or coalesce(cardinality(v_codes), 0) not between 1 and 100
    or lower(btrim(p_course_code)) <> all(v_codes)
    or exists (
      select 1 from unnest(v_codes) code
      where code !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' or length(code) > 64
    )
    or length(v_course_label) not between 1 and 120
    or p_duration_seconds is null
    or p_duration_seconds not between 1 and 86400
    or p_sort_order is null
    or p_sort_order not between -1000000 and 1000000
    or v_content_type !~ '^video/[a-z0-9][a-z0-9.+-]*$'
    or p_byte_length is null
    or p_byte_length <= 0
    or p_byte_length > 10995116277760
  then
    raise exception 'Invalid lesson metadata';
  end if;

  if not exists (
    select 1
    from public.video_class_courses course
    where course.code = any(v_codes)
    having count(*) = cardinality(v_codes)
  ) then
    raise exception 'Course not found';
  end if;

  if p_tags is null then
    p_tags := '[]'::jsonb;
  end if;
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
        encode(extensions.digest(lower(v_tag_label), 'sha256'), 'hex'),
        1,
        16
      );
    end if;

    if length(v_tag_label) not between 1 and 80
      or length(v_tag_slug) > 80
      or v_tag_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    then
      raise exception 'Invalid tag metadata';
    end if;
  end loop;

  if p_renditions is null then
    p_renditions := '[]'::jsonb;
  end if;
  if jsonb_typeof(p_renditions) <> 'array'
    or jsonb_array_length(p_renditions) > 3
  then
    raise exception 'Renditions must be an array containing at most 3 alternatives';
  end if;

  for v_rendition in select value from jsonb_array_elements(p_renditions)
  loop
    if jsonb_typeof(v_rendition) <> 'object' then
      raise exception 'Each rendition must be an object';
    end if;

    v_quality_code := lower(btrim(coalesce(v_rendition ->> 'quality_code', '')));
    v_display_label := btrim(coalesce(v_rendition ->> 'display_label', ''));
    v_rendition_key := v_rendition ->> 'object_key';
    v_rendition_content_type := lower(btrim(coalesce(
      v_rendition ->> 'content_type',
      'video/mp4'
    )));

    if v_quality_code not in ('480p', '720p', '1080p')
      or length(v_display_label) not between 1 and 40
      or not public._video_class_valid_object_key(v_rendition_key)
      or v_rendition_content_type !~ '^video/[a-z0-9][a-z0-9.+-]*$'
      or coalesce(v_rendition ->> 'height_pixels', '') !~ '^[0-9]{1,5}$'
      or coalesce(v_rendition ->> 'byte_length', '') !~ '^[0-9]{1,14}$'
      or coalesce(v_rendition ->> 'sort_order', '0') !~ '^-?[0-9]{1,7}$'
    then
      raise exception 'Invalid rendition metadata';
    end if;

    v_height_pixels := (v_rendition ->> 'height_pixels')::integer;
    v_rendition_byte_length := (v_rendition ->> 'byte_length')::bigint;
    v_rendition_sort_order := coalesce((v_rendition ->> 'sort_order')::integer, 0);

    if v_height_pixels not between 1 and 16384
      or v_rendition_byte_length <= 0
      or v_rendition_byte_length > 10995116277760
      or v_rendition_sort_order not between -1000000 and 1000000
    then
      raise exception 'Invalid rendition limits';
    end if;
  end loop;

  if p_thumbnail is not null and jsonb_typeof(p_thumbnail) <> 'null' then
    if jsonb_typeof(p_thumbnail) <> 'object' then
      raise exception 'Thumbnail metadata must be an object';
    end if;

    v_thumbnail_key := p_thumbnail ->> 'object_key';
    v_thumbnail_content_type := lower(btrim(coalesce(p_thumbnail ->> 'content_type', '')));
    if not public._video_class_valid_object_key(v_thumbnail_key)
      or v_thumbnail_content_type not in (
        'image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'
      )
      or coalesce(p_thumbnail ->> 'byte_length', '') !~ '^[0-9]{1,14}$'
    then
      raise exception 'Invalid thumbnail metadata';
    end if;
    v_thumbnail_byte_length := (p_thumbnail ->> 'byte_length')::bigint;
    if v_thumbnail_byte_length <= 0 or v_thumbnail_byte_length > 10995116277760 then
      raise exception 'Invalid thumbnail size';
    end if;
  else
    v_thumbnail_key := null;
    v_thumbnail_content_type := null;
    v_thumbnail_byte_length := null;
  end if;

  select count(*), count(distinct requested.object_key)
  into v_requested_key_count, v_distinct_key_count
  from (
    select p_object_key as object_key
    union all
    select rendition ->> 'object_key'
    from jsonb_array_elements(p_renditions) rendition
    union all
    select v_thumbnail_key
    where v_thumbnail_key is not null
  ) requested;

  if v_requested_key_count <> v_distinct_key_count then
    raise exception 'Each R2 object can be assigned only once in a publish request';
  end if;

  -- Serialize all publications that touch the same set of R2 object keys. The
  -- deterministic order avoids deadlocks between concurrent admin requests.
  for v_object_key in
    select distinct requested.object_key
    from (
      select p_object_key as object_key
      union all
      select rendition ->> 'object_key'
      from jsonb_array_elements(p_renditions) rendition
      union all
      select v_thumbnail_key
      where v_thumbnail_key is not null
    ) requested
    order by requested.object_key
  loop
    perform pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended(v_object_key, 5194)
    );
  end loop;

  select lesson.*
  into v_existing_lesson
  from public.video_class_lessons lesson
  where lesson.object_key = p_object_key
  for update;

  if found then
    -- An older Worker omits p_course_codes. Preserve every existing membership
    -- on an idempotent republish instead of collapsing a multi-course lesson.
    if coalesce(cardinality(p_course_codes), 0) = 0 then
      select array_agg(membership.course_code order by membership.course_code)
      into v_codes
      from public.video_class_lesson_courses membership
      where membership.lesson_id = v_existing_lesson.id;
      v_codes := coalesce(v_codes, array[p_course_code]);
    end if;
    if v_existing_lesson.slug is distinct from p_slug
      or v_existing_lesson.title is distinct from v_title
      or v_existing_lesson.description is distinct from v_description
      or v_existing_lesson.course_code is distinct from p_course_code
      or v_existing_lesson.course_label is distinct from v_course_label
      or v_existing_lesson.duration_seconds is distinct from p_duration_seconds
      or v_existing_lesson.sort_order is distinct from p_sort_order
    then
      raise exception 'R2 object is already published with different lesson metadata';
    end if;
    v_lesson := v_existing_lesson;
  else
    if exists (
      select 1
      from public.video_class_lessons lesson
      where lesson.slug = p_slug
    ) then
      raise exception 'Lesson slug is already in use';
    end if;

    if exists (
      select 1
      from (
        select p_object_key as object_key
        union all
        select rendition ->> 'object_key'
        from jsonb_array_elements(p_renditions) rendition
        union all
        select v_thumbnail_key
        where v_thumbnail_key is not null
      ) requested
      where exists (
        select 1 from public.video_class_lessons lesson
        where lesson.object_key = requested.object_key
      )
         or exists (
        select 1 from public.video_class_lesson_renditions rendition
        where rendition.object_key = requested.object_key
      )
         or exists (
        select 1 from public.video_class_lesson_thumbnails thumbnail
        where thumbnail.object_key = requested.object_key
      )
    ) then
      raise exception 'An R2 object is already assigned to video class content';
    end if;

    insert into public.video_class_lessons (
      slug, title, description, course_code, course_label, object_key,
      duration_seconds, sort_order, published, is_private, created_by
    )
    values (
      p_slug, v_title, v_description, p_course_code, v_course_label, p_object_key,
      p_duration_seconds, p_sort_order, true, false, v_admin_id
    )
    returning * into v_lesson;
    v_created := true;
  end if;

  if exists (
    select 1
    from public.video_class_official_playlist_items item
    where item.lesson_id = v_lesson.id
      and not exists (
        select 1
        from public.video_class_official_playlist_courses playlist_course
        where playlist_course.playlist_id = item.playlist_id
          and playlist_course.course_code = any(v_codes)
      )
  ) then
    raise exception 'Lesson course selection conflicts with an official series';
  end if;

  select array_agg(membership.course_code order by membership.course_code)
  into v_previous_codes
  from public.video_class_lesson_courses membership
  where membership.lesson_id = v_lesson.id;

  insert into public.video_class_lesson_courses (lesson_id, course_code, created_by)
  select v_lesson.id, code, v_admin_id
  from unnest(v_codes) code
  on conflict (lesson_id, course_code) do nothing;

  delete from public.video_class_lesson_courses membership
  where membership.lesson_id = v_lesson.id
    and not (membership.course_code = any(v_codes));

  if coalesce(v_previous_codes, array[]::text[])
    is distinct from coalesce(v_codes, array[]::text[])
  then
    update public.video_class_playback_sessions playback
    set revoked_at = coalesce(playback.revoked_at, now())
    where playback.lesson_id = v_lesson.id
      and playback.revoked_at is null;

    if not v_created then
      insert into public.video_class_admin_audit_events (
        admin_id, action, detail
      )
      values (
        v_admin_id,
        'edit_lesson',
        jsonb_build_object(
          'lesson_id', v_lesson.id,
          'source', 'publish_r2_object',
          'previous_course_codes', to_jsonb(coalesce(v_previous_codes, array[]::text[])),
          'course_codes', to_jsonb(v_codes)
        )
      );
    end if;
  end if;

  if exists (
    select 1
    from public.video_class_lesson_renditions rendition
    where rendition.lesson_id = v_lesson.id
      and rendition.quality_code = 'max'
      and rendition.object_key is distinct from p_object_key
  ) then
    raise exception 'Existing maximum rendition uses a different R2 object';
  end if;

  update public.video_class_lesson_renditions rendition
  set is_default = false,
      updated_at = now()
  where rendition.lesson_id = v_lesson.id
    and rendition.quality_code <> 'max'
    and rendition.is_default = true;

  insert into public.video_class_lesson_renditions as rendition (
    lesson_id, quality_code, display_label, object_key, content_type,
    byte_length, sort_order, is_default, enabled, created_by
  )
  values (
    v_lesson.id, 'max', '最高畫質', p_object_key, v_content_type,
    p_byte_length, 1000, true, true, v_admin_id
  )
  on conflict (lesson_id, quality_code) do update
  set display_label = excluded.display_label,
      content_type = excluded.content_type,
      byte_length = excluded.byte_length,
      is_default = true,
      enabled = true,
      updated_at = now();

  for v_rendition in select value from jsonb_array_elements(p_renditions)
  loop
    v_quality_code := lower(btrim(v_rendition ->> 'quality_code'));
    v_display_label := btrim(v_rendition ->> 'display_label');
    v_rendition_key := v_rendition ->> 'object_key';
    v_rendition_content_type := lower(btrim(coalesce(
      v_rendition ->> 'content_type',
      'video/mp4'
    )));
    v_height_pixels := (v_rendition ->> 'height_pixels')::integer;
    v_rendition_byte_length := (v_rendition ->> 'byte_length')::bigint;
    v_rendition_sort_order := coalesce((v_rendition ->> 'sort_order')::integer, 0);

    if exists (
      select 1
      from public.video_class_lesson_renditions rendition
      where rendition.lesson_id = v_lesson.id
        and rendition.quality_code = v_quality_code
        and rendition.object_key is distinct from v_rendition_key
    ) or exists (
      select 1
      from public.video_class_lessons lesson
      where lesson.object_key = v_rendition_key
        and lesson.id <> v_lesson.id
    ) or exists (
      select 1
      from public.video_class_lesson_renditions rendition
      where rendition.object_key = v_rendition_key
        and (
          rendition.lesson_id <> v_lesson.id
          or rendition.quality_code <> v_quality_code
        )
    ) or exists (
      select 1
      from public.video_class_lesson_thumbnails thumbnail
      where thumbnail.object_key = v_rendition_key
    ) then
      raise exception 'Rendition R2 object or quality is already assigned';
    end if;

    insert into public.video_class_lesson_renditions as rendition (
      lesson_id, quality_code, display_label, height_pixels, object_key,
      content_type, byte_length, sort_order, is_default, enabled, created_by
    )
    values (
      v_lesson.id, v_quality_code, v_display_label, v_height_pixels,
      v_rendition_key, v_rendition_content_type, v_rendition_byte_length,
      v_rendition_sort_order, false, true, v_admin_id
    )
    on conflict (lesson_id, quality_code) do update
    set display_label = excluded.display_label,
        height_pixels = excluded.height_pixels,
        content_type = excluded.content_type,
        byte_length = excluded.byte_length,
        sort_order = excluded.sort_order,
        enabled = true,
        updated_at = now();
  end loop;

  if v_thumbnail_key is not null then
    if exists (
      select 1
      from public.video_class_lesson_thumbnails thumbnail
      where thumbnail.lesson_id = v_lesson.id
        and thumbnail.object_key is distinct from v_thumbnail_key
    ) or exists (
      select 1
      from public.video_class_lessons lesson
      where lesson.object_key = v_thumbnail_key
    ) or exists (
      select 1
      from public.video_class_lesson_renditions rendition
      where rendition.object_key = v_thumbnail_key
    ) or exists (
      select 1
      from public.video_class_lesson_thumbnails thumbnail
      where thumbnail.object_key = v_thumbnail_key
        and thumbnail.lesson_id <> v_lesson.id
    ) then
      raise exception 'Thumbnail R2 object is already assigned';
    end if;

    insert into public.video_class_lesson_thumbnails as thumbnail (
      lesson_id, object_key, content_type, byte_length, enabled, created_by
    )
    values (
      v_lesson.id, v_thumbnail_key, v_thumbnail_content_type,
      v_thumbnail_byte_length, true, v_admin_id
    )
    on conflict (lesson_id) do update
    set content_type = excluded.content_type,
        byte_length = excluded.byte_length,
        enabled = true,
        updated_at = now();
  end if;

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
        encode(extensions.digest(lower(v_tag_label), 'sha256'), 'hex'),
        1,
        16
      );
    end if;

    insert into public.video_class_tags as tag (
      slug, label, published, created_by
    )
    values (v_tag_slug, v_tag_label, true, v_admin_id)
    on conflict (slug) do update
    set label = excluded.label,
        published = true,
        updated_at = case
          when tag.label is distinct from excluded.label
            or tag.published is distinct from true
          then now()
          else tag.updated_at
        end;

    insert into public.video_class_lesson_tags (
      lesson_id, tag_id, created_by
    )
    select v_lesson.id, tag.id, v_admin_id
    from public.video_class_tags tag
    where tag.slug = v_tag_slug
    on conflict (lesson_id, tag_id) do nothing;
  end loop;

  if v_created then
    insert into public.video_class_admin_audit_events (
      admin_id, action, detail
    )
    values (
      v_admin_id,
      'publish_lesson',
      jsonb_build_object(
        'lesson_id', v_lesson.id,
        'lesson_slug', v_lesson.slug,
        'lesson_title', v_lesson.title,
        'course_code', v_lesson.course_code,
        'course_codes', to_jsonb(v_codes),
        'source_object_sha256', encode(
          extensions.digest(p_object_key, 'sha256'),
          'hex'
        ),
        'source_content_type', v_content_type,
        'source_byte_length', p_byte_length,
        'tag_count', jsonb_array_length(p_tags),
        'alternate_rendition_count', jsonb_array_length(p_renditions),
        'has_thumbnail', v_thumbnail_key is not null
      )
    );
  end if;

  select jsonb_build_object(
    'lesson_id', lesson.id,
    'slug', lesson.slug,
    'title', lesson.title,
    'description', lesson.description,
    'course_code', lesson.course_code,
    'course_codes', coalesce((
      select jsonb_agg(membership.course_code order by course_member.sort_order, membership.course_code)
      from public.video_class_lesson_courses membership
      join public.video_class_courses course_member on course_member.code = membership.course_code
      where membership.lesson_id = lesson.id
    ), '[]'::jsonb),
    'course_title', course.title,
    'course_label', lesson.course_label,
    'duration_seconds', lesson.duration_seconds,
    'sort_order', lesson.sort_order,
    'published', lesson.published,
    'is_private', lesson.is_private,
    'has_thumbnail', exists (
      select 1
      from public.video_class_lesson_thumbnails thumbnail
      where thumbnail.lesson_id = lesson.id
        and thumbnail.enabled = true
    ),
    'tags', coalesce((
      select jsonb_agg(
        jsonb_build_object('slug', tag.slug, 'label', tag.label)
        order by tag.sort_order, tag.slug
      )
      from public.video_class_lesson_tags lesson_tag
      join public.video_class_tags tag on tag.id = lesson_tag.tag_id
      where lesson_tag.lesson_id = lesson.id
    ), '[]'::jsonb),
    'renditions', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'quality_code', rendition.quality_code,
          'display_label', rendition.display_label,
          'height_pixels', rendition.height_pixels,
          'byte_length', rendition.byte_length,
          'is_default', rendition.is_default,
          'enabled', rendition.enabled
        )
        order by rendition.sort_order, rendition.height_pixels nulls last,
          rendition.quality_code
      )
      from public.video_class_lesson_renditions rendition
      where rendition.lesson_id = lesson.id
    ), '[]'::jsonb),
    'total_view_count', coalesce((
      select sum(progress.view_count)::bigint
      from public.video_class_progress progress
      where progress.lesson_id = lesson.id
    ), 0::bigint),
    'created_at', lesson.created_at,
    'updated_at', lesson.updated_at
  )
  into v_result
  from public.video_class_lessons lesson
  join public.video_class_courses course on course.code = lesson.course_code
  where lesson.id = v_lesson.id;

  return v_result;
exception
  when unique_violation then
    raise exception 'Lesson metadata conflicts with an existing R2 object, slug, or quality';
end;
$$;

-- The Worker already exposes object keys in its admin-only R2 inventory. This
-- bounded matcher lets that endpoint annotate which listed keys are published,
-- without adding object keys to the normal lesson administration response.
create or replace function public.video_class_admin_match_r2_objects(
  p_service_secret text,
  p_admin_token uuid,
  p_object_keys text[]
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  if not public._video_class_worker_ok(p_service_secret)
    or public._video_class_admin_id(p_admin_token) is null
  then
    raise exception 'Invalid or expired admin session';
  end if;

  if p_object_keys is null or cardinality(p_object_keys) = 0 then
    return jsonb_build_object('matches', '[]'::jsonb);
  end if;
  if cardinality(p_object_keys) > 500
    or exists (
      select 1
      from unnest(p_object_keys) requested(object_key)
      where not public._video_class_valid_object_key(requested.object_key)
    )
  then
    raise exception 'Invalid R2 inventory match request';
  end if;

  with assignments as (
    select
      lesson.object_key,
      lesson.id as lesson_id,
      lesson.slug,
      lesson.title,
      lesson.published,
      lesson.is_private,
      true as is_source,
      null::text as rendition_quality_code,
      false as is_thumbnail
    from public.video_class_lessons lesson
    where lesson.object_key = any(p_object_keys)
    union all
    select
      rendition.object_key,
      lesson.id,
      lesson.slug,
      lesson.title,
      lesson.published,
      lesson.is_private,
      false,
      rendition.quality_code,
      false
    from public.video_class_lesson_renditions rendition
    join public.video_class_lessons lesson on lesson.id = rendition.lesson_id
    where rendition.object_key = any(p_object_keys)
    union all
    select
      thumbnail.object_key,
      lesson.id,
      lesson.slug,
      lesson.title,
      lesson.published,
      lesson.is_private,
      false,
      null::text,
      true
    from public.video_class_lesson_thumbnails thumbnail
    join public.video_class_lessons lesson on lesson.id = thumbnail.lesson_id
    where thumbnail.object_key = any(p_object_keys)
  ),
  grouped as (
    select
      assignment.object_key,
      assignment.lesson_id,
      assignment.slug,
      assignment.title,
      assignment.published,
      assignment.is_private,
      bool_or(assignment.is_source) as is_source,
      coalesce(
        array_agg(assignment.rendition_quality_code order by assignment.rendition_quality_code)
          filter (where assignment.rendition_quality_code is not null),
        array[]::text[]
      ) as rendition_quality_codes,
      bool_or(assignment.is_thumbnail) as is_thumbnail
    from assignments assignment
    group by
      assignment.object_key,
      assignment.lesson_id,
      assignment.slug,
      assignment.title,
      assignment.published,
      assignment.is_private
  )
  select jsonb_build_object(
    'matches', coalesce(jsonb_agg(
      jsonb_build_object(
        'object_key', grouped.object_key,
        'lesson_id', grouped.lesson_id,
        'lesson_slug', grouped.slug,
        'lesson_title', grouped.title,
        'published', grouped.published,
        'is_private', grouped.is_private,
        'is_source', grouped.is_source,
        'rendition_quality_codes', grouped.rendition_quality_codes,
        'is_thumbnail', grouped.is_thumbnail
      )
      order by grouped.object_key, grouped.lesson_id
    ), '[]'::jsonb)
  )
  into v_result
  from grouped;

  return v_result;
end;
$$;

create or replace function public.video_class_admin_issue_key(
  p_service_secret text,
  p_admin_token uuid,
  p_student_id uuid,
  p_rotate boolean default false
)
returns table (student_id uuid, video_key text, enabled boolean, updated_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid;
  v_existing public.video_class_student_access%rowtype;
  v_key text;
  v_action text;
begin
  if not public._video_class_worker_ok(p_service_secret) then
    raise exception 'Worker authorization failed';
  end if;
  v_admin_id := public._video_class_admin_id(p_admin_token);
  if v_admin_id is null then
    raise exception 'Invalid or expired admin session';
  end if;
  if not exists (
    select 1 from public.flashcard_students student
    where student.id = p_student_id and student.deleted_at is null
  ) then
    raise exception 'Student not found';
  end if;

  select access.* into v_existing
  from public.video_class_student_access access
  where access.student_id = p_student_id;

  if found and not coalesce(p_rotate, false) then
    return query
    select v_existing.student_id, v_existing.video_key, v_existing.enabled, v_existing.updated_at;
    return;
  end if;

  v_key := public._video_class_next_key();
  v_action := case when v_existing.student_id is null then 'issue_key' else 'rotate_key' end;

  insert into public.video_class_student_access (student_id, video_key, enabled, updated_by)
  values (p_student_id, v_key, coalesce(v_existing.enabled, true), v_admin_id)
  -- Use the named constraint because RETURNS TABLE exposes a student_id
  -- output variable, which makes an unqualified conflict target ambiguous
  -- inside PL/pgSQL on current Postgres versions.
  on conflict on constraint video_class_student_access_pkey do update
  set video_key = excluded.video_key,
      enabled = public.video_class_student_access.enabled,
      updated_by = excluded.updated_by,
      updated_at = now();

  insert into public.video_class_admin_audit_events (admin_id, student_id, action)
  values (v_admin_id, p_student_id, v_action);

  return query
  select access.student_id, access.video_key, access.enabled, access.updated_at
  from public.video_class_student_access access
  where access.student_id = p_student_id;
end;
$$;

create or replace function public.video_class_admin_clear_key(
  p_service_secret text,
  p_admin_token uuid,
  p_student_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid;
begin
  if not public._video_class_worker_ok(p_service_secret) then
    return false;
  end if;
  v_admin_id := public._video_class_admin_id(p_admin_token);
  if v_admin_id is null then
    raise exception 'Invalid or expired admin session';
  end if;

  delete from public.video_class_student_access access
  where access.student_id = p_student_id;
  if not found then
    return false;
  end if;

  insert into public.video_class_admin_audit_events (admin_id, student_id, action)
  values (v_admin_id, p_student_id, 'clear_key');
  return true;
end;
$$;

create or replace function public.video_class_admin_set_enabled(
  p_service_secret text,
  p_admin_token uuid,
  p_student_id uuid,
  p_enabled boolean
)
returns table (student_id uuid, video_key text, enabled boolean, updated_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid;
begin
  if not public._video_class_worker_ok(p_service_secret) or p_enabled is null then
    raise exception 'Invalid access update';
  end if;
  v_admin_id := public._video_class_admin_id(p_admin_token);
  if v_admin_id is null then
    raise exception 'Invalid or expired admin session';
  end if;

  update public.video_class_student_access access
  set enabled = p_enabled,
      updated_by = v_admin_id,
      updated_at = now()
  where access.student_id = p_student_id;
  if not found then
    raise exception 'Issue a video key before changing access';
  end if;

  insert into public.video_class_admin_audit_events (admin_id, student_id, action)
  values (v_admin_id, p_student_id, case when p_enabled then 'enable_access' else 'disable_access' end);

  return query
  select access.student_id, access.video_key, access.enabled, access.updated_at
  from public.video_class_student_access access
  where access.student_id = p_student_id;
end;
$$;

create or replace function public.video_class_admin_set_course_access(
  p_service_secret text,
  p_admin_token uuid,
  p_student_id uuid,
  p_course_code text,
  p_enabled boolean
)
returns table (
  student_id uuid,
  course_code text,
  enabled boolean,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid;
begin
  if not public._video_class_worker_ok(p_service_secret)
    or p_student_id is null
    or p_enabled is null
    or p_course_code is null
    or p_course_code !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    or length(p_course_code) > 64
  then
    raise exception 'Invalid course access update';
  end if;

  v_admin_id := public._video_class_admin_id(p_admin_token);
  if v_admin_id is null then
    raise exception 'Invalid or expired admin session';
  end if;
  if not exists (
    select 1
    from public.flashcard_students student
    where student.id = p_student_id and student.deleted_at is null
  ) then
    raise exception 'Student not found';
  end if;
  if not exists (
    select 1 from public.video_class_courses course
    where course.code = p_course_code
  ) then
    raise exception 'Course not found';
  end if;

  insert into public.video_class_student_courses (
    student_id, course_code, enabled, updated_by
  )
  values (p_student_id, p_course_code, p_enabled, v_admin_id)
  on conflict on constraint video_class_student_courses_pkey do update
  set enabled = excluded.enabled,
      updated_by = excluded.updated_by,
      updated_at = now();

  insert into public.video_class_admin_audit_events (
    admin_id, student_id, action, detail
  )
  values (
    v_admin_id,
    p_student_id,
    case when p_enabled then 'enable_course' else 'disable_course' end,
    jsonb_build_object('course_code', p_course_code)
  );

  return query
  select access.student_id, access.course_code, access.enabled, access.updated_at
  from public.video_class_student_courses access
  where access.student_id = p_student_id
    and access.course_code = p_course_code;
end;
$$;

create or replace function public.video_class_admin_set_watermark(
  p_service_secret text,
  p_admin_token uuid,
  p_student_id uuid,
  p_enabled boolean
)
returns table (
  student_id uuid,
  watermark_enabled boolean,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid;
begin
  if not public._video_class_worker_ok(p_service_secret)
    or p_student_id is null
    or p_enabled is null
  then
    raise exception 'Invalid watermark update';
  end if;

  v_admin_id := public._video_class_admin_id(p_admin_token);
  if v_admin_id is null then
    raise exception 'Invalid or expired admin session';
  end if;

  update public.video_class_student_access access
  set watermark_enabled = p_enabled,
      updated_by = v_admin_id,
      updated_at = now()
  where access.student_id = p_student_id;
  if not found then
    raise exception 'Issue a video key before changing watermark settings';
  end if;

  insert into public.video_class_admin_audit_events (admin_id, student_id, action)
  values (
    v_admin_id,
    p_student_id,
    case when p_enabled then 'enable_watermark' else 'disable_watermark' end
  );

  return query
  select access.student_id, access.watermark_enabled, access.updated_at
  from public.video_class_student_access access
  where access.student_id = p_student_id;
end;
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

drop function if exists public.video_class_student_list_lessons(text, uuid);
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

create or replace function public.video_class_student_library(
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
  v_library jsonb;
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
      lesson.description,
      lesson.course_code,
      coalesce((
        select array_agg(lesson_course.course_code order by course_member.sort_order, lesson_course.course_code)
        from public.video_class_lesson_courses lesson_course
        join public.video_class_courses course_member
          on course_member.code = lesson_course.course_code
         and course_member.published = true
        join public.video_class_student_courses student_course
          on student_course.student_id = v_student_id
         and student_course.course_code = lesson_course.course_code
         and student_course.enabled = true
        where lesson_course.lesson_id = lesson.id
          and public._video_class_student_can_view_lesson_via_course(
            v_student_id,
            lesson.id,
            lesson_course.course_code
          )
      ), array[]::text[]) as course_codes,
      course.title as course_title,
      course.sort_order as course_sort_order,
      lesson.course_label,
      lesson.duration_seconds,
      lesson.sort_order,
      lesson.is_private,
      lesson.created_at
    from public.video_class_lessons lesson
    join public.video_class_courses course
      on course.code = lesson.course_code
     and course.published = true
    where lesson.published = true
      and public._video_class_student_can_view_lesson(v_student_id, lesson.id)
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
          'course_codes', lesson.course_codes,
          'course_title', lesson.course_title,
          'course_sort_order', lesson.course_sort_order,
          'course_label', lesson.course_label,
          'duration_seconds', lesson.duration_seconds,
          'sort_order', lesson.sort_order,
          'is_private', lesson.is_private,
          'resume_seconds', coalesce(progress.position_seconds, 0),
          'completed_at', progress.completed_at,
          'progress_updated_at', progress.updated_at,
          'bookmarked', bookmark.student_id is not null,
          'note', note.note,
          'note_updated_at', note.updated_at,
          'has_thumbnail', exists (
            select 1
            from public.video_class_lesson_thumbnails thumbnail
            where thumbnail.lesson_id = lesson.id
              and thumbnail.enabled = true
          ),
          'attachments', coalesce((
            select jsonb_agg(
              jsonb_build_object(
                'id', attachment.id,
                'display_name', attachment.display_name,
                'content_type', attachment.content_type,
                'byte_length', attachment.byte_length
              ) order by attachment.sort_order, attachment.created_at, attachment.id
            )
            from public.video_class_lesson_attachments attachment
            where attachment.lesson_id = lesson.id
              and attachment.is_private = false
          ), '[]'::jsonb),
          'tags', coalesce((
            select jsonb_agg(
              jsonb_build_object('slug', tag.slug, 'label', tag.label)
              order by tag.sort_order, tag.slug
            )
            from public.video_class_lesson_tags lesson_tag
            join public.video_class_tags tag
              on tag.id = lesson_tag.tag_id
             and tag.published = true
            where lesson_tag.lesson_id = lesson.id
          ), '[]'::jsonb),
          'official_playlist_names', coalesce((
            select jsonb_agg(playlist.name order by playlist.sort_order, playlist.name)
            from public.video_class_official_playlist_items item
            join public.video_class_official_playlists playlist
              on playlist.id = item.playlist_id
             and playlist.published = true
            where item.lesson_id = lesson.id
              and exists (
                select 1
                from public.video_class_official_playlist_courses playlist_course
                where playlist_course.playlist_id = playlist.id
                  and playlist_course.course_code = any(lesson.course_codes)
                  and public._video_class_student_can_view_official_playlist(
                    v_student_id,
                    playlist.id,
                    playlist_course.course_code
                  )
              )
          ), '[]'::jsonb),
          'playlist_ids', coalesce((
            select jsonb_agg(item.playlist_id order by playlist.updated_at desc, playlist.id)
            from public.video_class_student_playlist_items item
            join public.video_class_student_playlists playlist
              on playlist.id = item.playlist_id
             and playlist.student_id = v_student_id
            where item.lesson_id = lesson.id
          ), '[]'::jsonb),
          'clips', coalesce((
            select jsonb_agg(
              jsonb_build_object(
                'id', clip.id,
                'lesson_id', clip.lesson_id,
                'title', clip.title,
                'display_title', case
                  when length(trim(clip.title)) > 0 then clip.title
                  else 'Clip ' || clip.clip_number::text
                end,
                'position_seconds', clip.position_seconds,
                'clip_number', clip.clip_number,
                'created_at', clip.created_at,
                'updated_at', clip.updated_at
              )
              order by clip.clip_number, clip.created_at, clip.id
            )
            from public.video_class_student_clips clip
            where clip.student_id = v_student_id
              and clip.lesson_id = lesson.id
          ), '[]'::jsonb),
          'renditions', coalesce((
            select jsonb_agg(
              jsonb_build_object(
                'quality_code', rendition.quality_code,
                'display_label', rendition.display_label,
                'height_pixels', rendition.height_pixels,
                'is_default', rendition.is_default
              )
              order by rendition.sort_order, rendition.height_pixels nulls last,
                rendition.quality_code
            )
            from public.video_class_lesson_renditions rendition
            where rendition.lesson_id = lesson.id
              and rendition.enabled = true
          ), '[]'::jsonb),
          'view_count', coalesce(progress.view_count, 0),
          'feedback', case
            when feedback.student_id is null then null
            else jsonb_build_object(
              'lesson_id', feedback.lesson_id,
              'picture_quality', feedback.picture_quality,
              'explanation_quality', feedback.explanation_quality,
              'audio_quality', feedback.audio_quality,
              'feedback_updated_at', feedback.updated_at
            )
          end
        )
        order by lesson.course_sort_order, lesson.sort_order, lesson.created_at, lesson.id
      )
      from entitled_lessons lesson
      left join public.video_class_progress progress
        on progress.student_id = v_student_id
       and progress.lesson_id = lesson.id
      left join public.video_class_bookmarks bookmark
        on bookmark.student_id = v_student_id
       and bookmark.lesson_id = lesson.id
      left join public.video_class_notes note
        on note.student_id = v_student_id
       and note.lesson_id = lesson.id
      left join public.video_class_lesson_feedback feedback
        on feedback.student_id = v_student_id
       and feedback.lesson_id = lesson.id
    ), '[]'::jsonb),
    'playlists', coalesce((
      select jsonb_agg(
        public._video_class_student_playlist_json(v_student_id, playlist.id)
        order by playlist.updated_at desc, playlist.created_at, playlist.id
      )
      from public.video_class_student_playlists playlist
      where playlist.student_id = v_student_id
    ), '[]'::jsonb),
    'officialPlaylists', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', playlist.id,
          'name', playlist.name,
          'description', playlist.description,
          'course_code', playlist.course_code,
          'sort_order', playlist.sort_order,
          'course_codes', coalesce((
            select jsonb_agg(playlist_course.course_code order by course.sort_order, playlist_course.course_code)
            from public.video_class_official_playlist_courses playlist_course
            join public.video_class_courses course
              on course.code = playlist_course.course_code
             and course.published = true
            join public.video_class_student_courses access
              on access.student_id = v_student_id
             and access.course_code = playlist_course.course_code
             and access.enabled = true
            where playlist_course.playlist_id = playlist.id
              and public._video_class_student_can_view_official_playlist(
                v_student_id,
                playlist.id,
                playlist_course.course_code
              )
          ), '[]'::jsonb),
          'lesson_ids', coalesce((
            select jsonb_agg(item.lesson_id order by item.sort_order, lesson.sort_order, lesson.id)
            from public.video_class_official_playlist_items item
            join entitled_lessons lesson on lesson.id = item.lesson_id
            where item.playlist_id = playlist.id
              and exists (
                select 1
                from public.video_class_official_playlist_courses playlist_course
                where playlist_course.playlist_id = playlist.id
                  and playlist_course.course_code = any(lesson.course_codes)
                  and public._video_class_student_can_view_official_playlist(
                    v_student_id,
                    playlist.id,
                    playlist_course.course_code
                  )
              )
          ), '[]'::jsonb)
        )
        order by playlist.sort_order, playlist.name, playlist.id
      )
      from public.video_class_official_playlists playlist
      where playlist.published = true
        and exists (
          select 1
          from public.video_class_official_playlist_courses entitled_course
          where entitled_course.playlist_id = playlist.id
            and public._video_class_student_can_view_official_playlist(
              v_student_id,
              playlist.id,
              entitled_course.course_code
            )
        )
        and exists (
          select 1
          from public.video_class_official_playlist_items item
          join entitled_lessons lesson on lesson.id = item.lesson_id
          where item.playlist_id = playlist.id
        )
    ), '[]'::jsonb),
    'officialPlaylistOrderMode', coalesce((
      select settings.official_playlist_order_mode
      from public.video_class_library_settings settings
      where settings.singleton = true
    ), 'manual')
  )
  into v_library;

  return v_library;
end;
$$;

-- Student lesson inventory is cursor-paginated so a completionist catalogue
-- never builds one multi-megabyte nested JSON response. Search is performed in
-- the database across titles, descriptions, tags, and both playlist types.
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
        and public._video_class_student_can_view_lesson_via_course(
          v_student_id,
          lesson.id,
          membership.course_code
        )
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

create or replace function public.video_class_student_rename_playlist(
  p_service_secret text,
  p_student_token uuid,
  p_playlist_id uuid,
  p_name text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
  v_name text := trim(p_name);
begin
  if not public._video_class_worker_ok(p_service_secret)
    or p_student_token is null
    or p_playlist_id is null
    or p_name is null
    or length(v_name) not between 1 and 80
  then
    return null;
  end if;

  v_student_id := public._video_class_student_id(p_student_token);
  if v_student_id is null then
    return null;
  end if;

  update public.video_class_student_playlists playlist
  set name = v_name,
      updated_at = now()
  where playlist.id = p_playlist_id
    and playlist.student_id = v_student_id;

  if not found then
    return null;
  end if;

  return public._video_class_student_playlist_json(v_student_id, p_playlist_id);
exception
  when unique_violation then
    return null;
end;
$$;

create or replace function public.video_class_student_delete_playlist(
  p_service_secret text,
  p_student_token uuid,
  p_playlist_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
begin
  if not public._video_class_worker_ok(p_service_secret)
    or p_student_token is null
    or p_playlist_id is null
  then
    return false;
  end if;

  v_student_id := public._video_class_student_id(p_student_token);
  if v_student_id is null then
    return false;
  end if;

  delete from public.video_class_student_playlists playlist
  where playlist.id = p_playlist_id
    and playlist.student_id = v_student_id;

  return found;
end;
$$;

create or replace function public.video_class_student_set_playlist_lesson(
  p_service_secret text,
  p_student_token uuid,
  p_playlist_id uuid,
  p_lesson_id uuid,
  p_included boolean
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
begin
  if not public._video_class_worker_ok(p_service_secret)
    or p_student_token is null
    or p_playlist_id is null
    or p_lesson_id is null
    or p_included is null
  then
    return null;
  end if;

  v_student_id := public._video_class_student_id(p_student_token);
  if v_student_id is null then
    return null;
  end if;

  perform 1
  from public.video_class_student_playlists playlist
  where playlist.id = p_playlist_id
    and playlist.student_id = v_student_id
  for update;
  if not found then
    return null;
  end if;

  if not public._video_class_student_can_view_lesson(v_student_id, p_lesson_id) then
    return null;
  end if;

  if p_included then
    insert into public.video_class_student_playlist_items (playlist_id, lesson_id)
    values (p_playlist_id, p_lesson_id)
    on conflict on constraint video_class_student_playlist_items_pkey do nothing;
  else
    delete from public.video_class_student_playlist_items item
    where item.playlist_id = p_playlist_id
      and item.lesson_id = p_lesson_id;
    if found then
      update public.video_class_student_playlists playlist
      set updated_at = now()
      where playlist.id = p_playlist_id
        and playlist.student_id = v_student_id;
    end if;
  end if;

  return public._video_class_student_playlist_json(v_student_id, p_playlist_id);
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

create or replace function public.video_class_student_delete_clip(
  p_service_secret text,
  p_student_token uuid,
  p_clip_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
begin
  if not public._video_class_worker_ok(p_service_secret)
    or p_student_token is null
    or p_clip_id is null
  then
    return false;
  end if;

  v_student_id := public._video_class_student_id(p_student_token);
  if v_student_id is null then
    return false;
  end if;

  delete from public.video_class_student_clips clip
  where clip.id = p_clip_id
    and clip.student_id = v_student_id;

  return found;
end;
$$;

create or replace function public.video_class_student_save_feedback(
  p_service_secret text,
  p_student_token uuid,
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
declare
  v_student_id uuid;
  v_feedback public.video_class_lesson_feedback%rowtype;
begin
  if not public._video_class_worker_ok(p_service_secret)
    or p_student_token is null
    or p_lesson_id is null
    or (p_picture_quality is null and p_explanation_quality is null and p_audio_quality is null)
    or (p_picture_quality is not null and p_picture_quality not between 1 and 5)
    or (p_explanation_quality is not null and p_explanation_quality not between 1 and 5)
    or (p_audio_quality is not null and p_audio_quality not between 1 and 5)
  then
    return null;
  end if;

  v_student_id := public._video_class_student_id(p_student_token);
  if v_student_id is null
    or not public._video_class_student_can_view_lesson(v_student_id, p_lesson_id)
  then
    return null;
  end if;

  insert into public.video_class_lesson_feedback (
    student_id, lesson_id, picture_quality, explanation_quality, audio_quality
  )
  values (
    v_student_id, p_lesson_id, p_picture_quality, p_explanation_quality, p_audio_quality
  )
  on conflict on constraint video_class_lesson_feedback_pkey do update
  set picture_quality = coalesce(
        excluded.picture_quality,
        public.video_class_lesson_feedback.picture_quality
      ),
      explanation_quality = coalesce(
        excluded.explanation_quality,
        public.video_class_lesson_feedback.explanation_quality
      ),
      audio_quality = coalesce(
        excluded.audio_quality,
        public.video_class_lesson_feedback.audio_quality
      ),
      updated_at = now()
  returning * into v_feedback;

  return jsonb_build_object(
    'lesson_id', v_feedback.lesson_id,
    'picture_quality', v_feedback.picture_quality,
    'explanation_quality', v_feedback.explanation_quality,
    'audio_quality', v_feedback.audio_quality,
    'feedback_updated_at', v_feedback.updated_at
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

drop function if exists public.video_class_create_playback(text, uuid, text, text, text);
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

-- Cursor-paginated administration inventory. The UUID cursor is stable and
-- avoids OFFSET scans when the catalogue grows to thousands of short lessons.
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

  -- Delete only removed memberships. Deleting every membership first would
  -- cascade and erase per-course student overrides even for unchanged courses.
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

  -- Refuse to freeze a job the Worker cannot safely address. Otherwise one
  -- malformed legacy key could leave the lesson private but undeletable.
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

-- One-time rollout backfill. The durable marker is inserted atomically before
-- the backfill, so reapplying this schema never grants keys to future students.
do $$
begin
  insert into public.video_class_rollouts (rollout_key)
  values ('initial-current-students')
  on conflict (rollout_key) do nothing;

  -- A pre-marker deployment may already contain the original rollout. Treat
  -- any populated entitlement table as completed instead of backfilling users
  -- who joined later. A fresh install has no entitlement rows and runs once.
  if found and not exists (
    select 1 from public.video_class_student_access access
  ) then
    insert into public.video_class_student_access (student_id, video_key, enabled)
    select student.id, public._video_class_next_key(), true
    from public.flashcard_students student
    where student.deleted_at is null
    on conflict (student_id) do nothing;
  end if;
end;
$$;

-- Existing key holders receive the pilot DSE course once. The durable marker
-- deliberately prevents later key issuance or later schema re-runs from
-- granting a course automatically.
do $$
begin
  insert into public.video_class_rollouts (rollout_key)
  values ('dse-current-keyed-students')
  on conflict (rollout_key) do nothing;

  if found then
    insert into public.video_class_student_courses (
      student_id, course_code, enabled
    )
    select access.student_id, 'dse', true
    from public.video_class_student_access access
    join public.flashcard_students student on student.id = access.student_id
    where student.deleted_at is null
    on conflict (student_id, course_code) do nothing;
  end if;
end;
$$;

-- The pilot lesson points to the private bucket key populated during deployment.
insert into public.video_class_lessons (
  slug, title, description, course_code, course_label, object_key, duration_seconds, sort_order, published
)
values (
  'bourree',
  'Bourrée 示範課堂',
  'Edmund Sir 錄影班試播影片。登入後可隨時重溫。',
  'dse',
  '錄影班 · 試播課堂',
  'lessons/bourree.mp4',
  38,
  10,
  true
)
on conflict (slug) do nothing;

insert into public.video_class_lesson_courses (lesson_id, course_code, created_by)
select lesson.id, lesson.course_code, lesson.created_by
from public.video_class_lessons lesson
on conflict (lesson_id, course_code) do nothing;

-- Every legacy lesson receives an enabled private-R2 "max" rendition. Future
-- quality rows can be added without changing the original lesson object_key.
insert into public.video_class_lesson_renditions (
  lesson_id, quality_code, display_label, object_key, content_type,
  sort_order, is_default, enabled
)
select
  lesson.id,
  'max',
  '最高畫質',
  lesson.object_key,
  'video/mp4',
  1000,
  not exists (
    select 1
    from public.video_class_lesson_renditions existing_default
    where existing_default.lesson_id = lesson.id
      and existing_default.enabled = true
      and existing_default.is_default = true
  ),
  true
from public.video_class_lessons lesson
on conflict do nothing;

-- The pilot's verified private-R2 assets have stable keys and exact byte sizes.
-- Clear any competing default first so the partial unique index remains valid.
update public.video_class_lesson_renditions rendition
set is_default = false
from public.video_class_lessons lesson
where lesson.slug = 'bourree'
  and rendition.lesson_id = lesson.id
  and rendition.quality_code <> 'max'
  and rendition.is_default = true;

insert into public.video_class_lesson_renditions as rendition (
  lesson_id, quality_code, display_label, height_pixels, object_key,
  content_type, byte_length, sort_order, is_default, enabled
)
select
  lesson.id,
  seed.quality_code,
  seed.display_label,
  seed.height_pixels,
  seed.object_key,
  'video/mp4',
  seed.byte_length,
  seed.sort_order,
  seed.is_default,
  true
from public.video_class_lessons lesson
cross join (
  values
    ('480p'::text, '480p'::text, 480, 'lessons/bourree/v1/480p.mp4'::text, 4690550::bigint, 10, false),
    ('720p'::text, '720p'::text, 720, 'lessons/bourree/v1/720p.mp4'::text, 8736537::bigint, 20, false),
    ('max'::text, '最高（720p）'::text, 720, 'lessons/bourree.mp4'::text, 11147309::bigint, 30, true)
) as seed (
  quality_code, display_label, height_pixels, object_key,
  byte_length, sort_order, is_default
)
where lesson.slug = 'bourree'
on conflict (lesson_id, quality_code) do update
set display_label = excluded.display_label,
    height_pixels = excluded.height_pixels,
    object_key = excluded.object_key,
    content_type = excluded.content_type,
    byte_length = excluded.byte_length,
    sort_order = excluded.sort_order,
    is_default = excluded.is_default,
    enabled = true,
    updated_at = now()
where rendition.display_label is distinct from excluded.display_label
   or rendition.height_pixels is distinct from excluded.height_pixels
   or rendition.object_key is distinct from excluded.object_key
   or rendition.content_type is distinct from excluded.content_type
   or rendition.byte_length is distinct from excluded.byte_length
   or rendition.sort_order is distinct from excluded.sort_order
   or rendition.is_default is distinct from excluded.is_default
   or rendition.enabled is distinct from true;

insert into public.video_class_lesson_thumbnails as thumbnail (
  lesson_id, object_key, content_type, byte_length, enabled
)
select
  lesson.id,
  'lessons/bourree/v1/poster.jpg',
  'image/jpeg',
  24703,
  true
from public.video_class_lessons lesson
where lesson.slug = 'bourree'
on conflict (lesson_id) do update
set object_key = excluded.object_key,
    content_type = excluded.content_type,
    byte_length = excluded.byte_length,
    enabled = true,
    updated_at = now()
where thumbnail.object_key is distinct from excluded.object_key
   or thumbnail.content_type is distinct from excluded.content_type
   or thumbnail.byte_length is distinct from excluded.byte_length
   or thumbnail.enabled is distinct from true;

insert into public.video_class_tags (slug, label, sort_order, published)
values
  ('dse', 'DSE', 10, true),
  ('preview', '試播', 20, true)
on conflict (slug) do update
set label = excluded.label,
    sort_order = excluded.sort_order,
    published = true,
    updated_at = case
      when public.video_class_tags.label is distinct from excluded.label
        or public.video_class_tags.sort_order is distinct from excluded.sort_order
        or public.video_class_tags.published is distinct from true
      then now()
      else public.video_class_tags.updated_at
    end
where public.video_class_tags.label is distinct from excluded.label
   or public.video_class_tags.sort_order is distinct from excluded.sort_order
   or public.video_class_tags.published is distinct from true;

insert into public.video_class_lesson_tags (lesson_id, tag_id)
select lesson.id, tag.id
from public.video_class_lessons lesson
cross join public.video_class_tags tag
where lesson.slug = 'bourree'
  and tag.slug in ('dse', 'preview')
on conflict (lesson_id, tag_id) do nothing;

revoke all on function public.video_class_student_login(text, text, text, boolean) from public, anon, authenticated;
revoke all on function public.video_class_student_exchange(text, uuid) from public, anon, authenticated;
revoke all on function public.video_class_student_me(text, uuid) from public, anon, authenticated;
revoke all on function public.video_class_student_logout(text, uuid) from public, anon, authenticated;
revoke all on function public.video_class_admin_login(text, text, text, boolean) from public, anon, authenticated;
revoke all on function public.video_class_admin_me(text, uuid) from public, anon, authenticated;
revoke all on function public.video_class_admin_logout(text, uuid) from public, anon, authenticated;
revoke all on function public.video_class_admin_list_students(text, uuid) from public, anon, authenticated;
revoke all on function public.video_class_admin_list_courses(text, uuid) from public, anon, authenticated;
revoke all on function public.video_class_admin_list_lessons(text, uuid) from public, anon, authenticated;
revoke all on function public.video_class_admin_list_lessons_page(text, uuid, integer, uuid, text) from public, anon, authenticated;
revoke all on function public.video_class_admin_set_lesson_courses(text, uuid, uuid, text[]) from public, anon, authenticated;
revoke all on function public.video_class_admin_list_official_playlists_page(text, uuid, integer, uuid, text) from public, anon, authenticated;
revoke all on function public.video_class_admin_save_official_playlist(text, uuid, uuid, text, text, text[], uuid[], boolean) from public, anon, authenticated;
revoke all on function public.video_class_admin_update_lesson(text, uuid, uuid, text, text, text[], jsonb, integer) from public, anon, authenticated;
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
revoke all on function public.video_class_admin_add_attachment(text, uuid, uuid, text, text, text, bigint) from public, anon, authenticated;
revoke all on function public.video_class_admin_set_attachment_private(text, uuid, uuid, boolean) from public, anon, authenticated;
revoke all on function public.video_class_admin_prepare_delete_attachment(text, uuid, uuid) from public, anon, authenticated;
revoke all on function public.video_class_admin_finish_delete_attachment(text, uuid, uuid, text) from public, anon, authenticated;
revoke all on function public.video_class_authorize_attachment(text, uuid, uuid, uuid) from public, anon, authenticated;
revoke all on function public.video_class_admin_change_feedback(text, uuid, uuid, uuid, smallint, smallint, smallint) from public, anon, authenticated;
revoke all on function public.video_class_admin_set_lesson_private(text, uuid, uuid, boolean) from public, anon, authenticated;
revoke all on function public.video_class_admin_publish_r2_object(
  text, uuid, text, text, text, text, text, text, integer, integer,
  text, bigint, jsonb, jsonb, jsonb, text[]
) from public, anon, authenticated;
revoke all on function public.video_class_admin_match_r2_objects(text, uuid, text[])
  from public, anon, authenticated;
revoke all on function public.video_class_admin_issue_key(text, uuid, uuid, boolean) from public, anon, authenticated;
revoke all on function public.video_class_admin_clear_key(text, uuid, uuid) from public, anon, authenticated;
revoke all on function public.video_class_admin_set_enabled(text, uuid, uuid, boolean) from public, anon, authenticated;
revoke all on function public.video_class_admin_set_course_access(text, uuid, uuid, text, boolean) from public, anon, authenticated;
revoke all on function public.video_class_admin_set_watermark(text, uuid, uuid, boolean) from public, anon, authenticated;
revoke all on function public.video_class_student_list_courses(text, uuid) from public, anon, authenticated;
revoke all on function public.video_class_student_list_lessons(text, uuid) from public, anon, authenticated;
revoke all on function public.video_class_student_toggle_bookmark(text, uuid, uuid, boolean) from public, anon, authenticated;
revoke all on function public.video_class_student_save_note(text, uuid, uuid, text) from public, anon, authenticated;
revoke all on function public.video_class_student_library(text, uuid) from public, anon, authenticated;
revoke all on function public.video_class_student_library_page(text, uuid, integer, text, text, text, text, uuid) from public, anon, authenticated;
revoke all on function public.video_class_student_analytics(text, uuid) from public, anon, authenticated;
revoke all on function public.video_class_student_create_playlist(text, uuid, text) from public, anon, authenticated;
revoke all on function public.video_class_student_rename_playlist(text, uuid, uuid, text) from public, anon, authenticated;
revoke all on function public.video_class_student_delete_playlist(text, uuid, uuid) from public, anon, authenticated;
revoke all on function public.video_class_student_set_playlist_lesson(text, uuid, uuid, uuid, boolean) from public, anon, authenticated;
revoke all on function public.video_class_student_create_clip(text, uuid, uuid, numeric, text) from public, anon, authenticated;
revoke all on function public.video_class_student_delete_clip(text, uuid, uuid) from public, anon, authenticated;
revoke all on function public.video_class_student_save_feedback(text, uuid, uuid, smallint, smallint, smallint) from public, anon, authenticated;
revoke all on function public.video_class_admin_list_feedback_page(text, uuid, integer, text) from public, anon, authenticated;
revoke all on function public.video_class_authorize_thumbnail(text, uuid, uuid) from public, anon, authenticated;
revoke all on function public.video_class_playback_list_renditions(text, uuid) from public, anon, authenticated;
revoke all on function public.video_class_authorize_rendition(text, uuid, uuid, text, text, text, text) from public, anon, authenticated;
revoke all on function public.video_class_create_playback(text, uuid, text, text, text) from public, anon, authenticated;
revoke all on function public.video_class_authorize_playback(text, uuid, uuid, text, text, text) from public, anon, authenticated;
revoke all on function public.video_class_record_progress(text, uuid, uuid, numeric, numeric) from public, anon, authenticated;

-- PostgREST sees only narrow functions. Every function is additionally gated by
-- a high-entropy secret held by the Cloudflare Worker, never by the browser.
grant execute on function public.video_class_student_login(text, text, text, boolean) to anon;
grant execute on function public.video_class_student_exchange(text, uuid) to anon;
grant execute on function public.video_class_student_me(text, uuid) to anon;
grant execute on function public.video_class_student_logout(text, uuid) to anon;
grant execute on function public.video_class_admin_login(text, text, text, boolean) to anon;
grant execute on function public.video_class_admin_me(text, uuid) to anon;
grant execute on function public.video_class_admin_logout(text, uuid) to anon;
grant execute on function public.video_class_admin_list_students(text, uuid) to anon;
grant execute on function public.video_class_admin_list_courses(text, uuid) to anon;
grant execute on function public.video_class_admin_list_lessons(text, uuid) to anon;
grant execute on function public.video_class_admin_list_lessons_page(text, uuid, integer, uuid, text) to anon;
grant execute on function public.video_class_admin_set_lesson_courses(text, uuid, uuid, text[]) to anon;
grant execute on function public.video_class_admin_list_official_playlists_page(text, uuid, integer, uuid, text) to anon;
grant execute on function public.video_class_admin_save_official_playlist(text, uuid, uuid, text, text, text[], uuid[], boolean) to anon;
grant execute on function public.video_class_admin_update_lesson(text, uuid, uuid, text, text, text[], jsonb, integer) to anon;
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
grant execute on function public.video_class_admin_add_attachment(text, uuid, uuid, text, text, text, bigint) to anon;
grant execute on function public.video_class_admin_set_attachment_private(text, uuid, uuid, boolean) to anon;
grant execute on function public.video_class_admin_prepare_delete_attachment(text, uuid, uuid) to anon;
grant execute on function public.video_class_admin_finish_delete_attachment(text, uuid, uuid, text) to anon;
grant execute on function public.video_class_authorize_attachment(text, uuid, uuid, uuid) to anon;
grant execute on function public.video_class_admin_change_feedback(text, uuid, uuid, uuid, smallint, smallint, smallint) to anon;
grant execute on function public.video_class_admin_set_lesson_private(text, uuid, uuid, boolean) to anon;
grant execute on function public.video_class_admin_publish_r2_object(
  text, uuid, text, text, text, text, text, text, integer, integer,
  text, bigint, jsonb, jsonb, jsonb, text[]
) to anon;
grant execute on function public.video_class_admin_match_r2_objects(text, uuid, text[]) to anon;
grant execute on function public.video_class_admin_issue_key(text, uuid, uuid, boolean) to anon;
grant execute on function public.video_class_admin_clear_key(text, uuid, uuid) to anon;
grant execute on function public.video_class_admin_set_enabled(text, uuid, uuid, boolean) to anon;
grant execute on function public.video_class_admin_set_course_access(text, uuid, uuid, text, boolean) to anon;
grant execute on function public.video_class_admin_set_watermark(text, uuid, uuid, boolean) to anon;
grant execute on function public.video_class_student_list_courses(text, uuid) to anon;
grant execute on function public.video_class_student_list_lessons(text, uuid) to anon;
grant execute on function public.video_class_student_toggle_bookmark(text, uuid, uuid, boolean) to anon;
grant execute on function public.video_class_student_save_note(text, uuid, uuid, text) to anon;
grant execute on function public.video_class_student_library(text, uuid) to anon;
grant execute on function public.video_class_student_library_page(text, uuid, integer, text, text, text, text, uuid) to anon;
grant execute on function public.video_class_student_analytics(text, uuid) to anon;
grant execute on function public.video_class_student_create_playlist(text, uuid, text) to anon;
grant execute on function public.video_class_student_rename_playlist(text, uuid, uuid, text) to anon;
grant execute on function public.video_class_student_delete_playlist(text, uuid, uuid) to anon;
grant execute on function public.video_class_student_set_playlist_lesson(text, uuid, uuid, uuid, boolean) to anon;
grant execute on function public.video_class_student_create_clip(text, uuid, uuid, numeric, text) to anon;
grant execute on function public.video_class_student_delete_clip(text, uuid, uuid) to anon;
grant execute on function public.video_class_student_save_feedback(text, uuid, uuid, smallint, smallint, smallint) to anon;
grant execute on function public.video_class_admin_list_feedback_page(text, uuid, integer, text) to anon;
grant execute on function public.video_class_authorize_thumbnail(text, uuid, uuid) to anon;
grant execute on function public.video_class_playback_list_renditions(text, uuid) to anon;
grant execute on function public.video_class_authorize_rendition(text, uuid, uuid, text, text, text, text) to anon;
grant execute on function public.video_class_create_playback(text, uuid, text, text, text) to anon;
grant execute on function public.video_class_authorize_playback(text, uuid, uuid, text, text, text) to anon;
grant execute on function public.video_class_record_progress(text, uuid, uuid, numeric, numeric) to anon;

notify pgrst, 'reload schema';

commit;
