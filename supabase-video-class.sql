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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.video_class_admin_accounts(id) on delete set null
);

alter table public.video_class_lessons
  add column if not exists course_code text;

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
    check (content_type in ('image/jpeg', 'image/png', 'image/webp', 'image/avif')),
  byte_length bigint check (byte_length is null or byte_length > 0),
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.video_class_admin_accounts(id) on delete set null
);

create index if not exists video_class_thumbnails_created_by_idx
  on public.video_class_lesson_thumbnails (created_by)
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

create table if not exists public.video_class_student_courses (
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  course_code text not null references public.video_class_courses(code) on update cascade on delete cascade,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.video_class_admin_accounts(id) on delete set null,
  primary key (student_id, course_code)
);

create index if not exists video_class_student_courses_course_idx
  on public.video_class_student_courses (course_code, student_id)
  where enabled = true;
create index if not exists video_class_student_courses_course_fk_idx
  on public.video_class_student_courses (course_code, student_id);
create index if not exists video_class_student_courses_updated_by_idx
  on public.video_class_student_courses (updated_by)
  where updated_by is not null;

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
  add column if not exists last_viewed_at timestamptz;

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
end;
$$;

create index if not exists video_class_progress_lesson_idx
  on public.video_class_progress (lesson_id, updated_at desc);
create index if not exists video_class_progress_lesson_views_idx
  on public.video_class_progress (lesson_id, last_viewed_at desc, student_id)
  where view_count > 0;

create table if not exists public.video_class_admin_audit_events (
  id bigint generated always as identity primary key,
  admin_id uuid references public.video_class_admin_accounts(id) on delete set null,
  student_id uuid references public.flashcard_students(id) on delete set null,
  action text not null check (action in (
    'issue_key', 'rotate_key', 'clear_key', 'enable_access', 'disable_access',
    'enable_course', 'disable_course', 'enable_watermark', 'disable_watermark'
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
      'enable_course', 'disable_course', 'enable_watermark', 'disable_watermark'
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
alter table public.video_class_lesson_renditions enable row level security;
alter table public.video_class_lesson_thumbnails enable row level security;
alter table public.video_class_tags enable row level security;
alter table public.video_class_lesson_tags enable row level security;
alter table public.video_class_official_playlists enable row level security;
alter table public.video_class_official_playlist_items enable row level security;
alter table public.video_class_student_playlists enable row level security;
alter table public.video_class_student_playlist_items enable row level security;
alter table public.video_class_student_clips enable row level security;
alter table public.video_class_lesson_feedback enable row level security;
alter table public.video_class_student_courses enable row level security;
alter table public.video_class_bookmarks enable row level security;
alter table public.video_class_notes enable row level security;
alter table public.video_class_playback_sessions enable row level security;
alter table public.video_class_progress enable row level security;
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
revoke all on table public.video_class_lesson_renditions from public, anon, authenticated;
revoke all on table public.video_class_lesson_thumbnails from public, anon, authenticated;
revoke all on table public.video_class_tags from public, anon, authenticated;
revoke all on table public.video_class_lesson_tags from public, anon, authenticated;
revoke all on table public.video_class_official_playlists from public, anon, authenticated;
revoke all on table public.video_class_official_playlist_items from public, anon, authenticated;
revoke all on table public.video_class_student_playlists from public, anon, authenticated;
revoke all on table public.video_class_student_playlist_items from public, anon, authenticated;
revoke all on table public.video_class_student_clips from public, anon, authenticated;
revoke all on table public.video_class_lesson_feedback from public, anon, authenticated;
revoke all on table public.video_class_student_courses from public, anon, authenticated;
revoke all on table public.video_class_bookmarks from public, anon, authenticated;
revoke all on table public.video_class_notes from public, anon, authenticated;
revoke all on table public.video_class_playback_sessions from public, anon, authenticated;
revoke all on table public.video_class_progress from public, anon, authenticated;
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

drop trigger if exists video_class_notes_touch on public.video_class_notes;
create trigger video_class_notes_touch
before update on public.video_class_notes
for each row execute function public.video_class_touch_updated_at();

drop trigger if exists video_class_lessons_touch on public.video_class_lessons;
create trigger video_class_lessons_touch
before update on public.video_class_lessons
for each row execute function public.video_class_touch_updated_at();

drop trigger if exists video_class_renditions_touch on public.video_class_lesson_renditions;
create trigger video_class_renditions_touch
before update on public.video_class_lesson_renditions
for each row execute function public.video_class_touch_updated_at();

drop trigger if exists video_class_thumbnails_touch on public.video_class_lesson_thumbnails;
create trigger video_class_thumbnails_touch
before update on public.video_class_lesson_thumbnails
for each row execute function public.video_class_touch_updated_at();

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
declare
  v_playlist_course text;
  v_lesson_course text;
begin
  select playlist.course_code
  into v_playlist_course
  from public.video_class_official_playlists playlist
  where playlist.id = new.playlist_id;
  if not found then
    raise exception 'Official playlist does not exist';
  end if;

  select lesson.course_code
  into v_lesson_course
  from public.video_class_lessons lesson
  where lesson.id = new.lesson_id;
  if not found then
    raise exception 'Official playlist lesson does not exist';
  end if;

  if v_playlist_course is distinct from v_lesson_course then
    raise exception 'Official playlist lessons must belong to the playlist course';
  end if;

  return new;
end;
$$;

revoke all on function public.video_class_validate_official_playlist_item()
  from public, anon, authenticated;

drop trigger if exists video_class_official_playlist_items_validate_course
  on public.video_class_official_playlist_items;
create trigger video_class_official_playlist_items_validate_course
before insert or update of playlist_id, lesson_id
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
  v_student_id uuid := coalesce(new.student_id, old.student_id);
begin
  if tg_op = 'DELETE' then
    update public.video_class_playback_sessions playback
    set revoked_at = coalesce(playback.revoked_at, now())
    where playback.student_id = v_student_id
      and playback.revoked_at is null;
    return old;
  end if;

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
    from public.video_class_lessons lesson
    where playback.lesson_id = lesson.id
      and playback.student_id = v_student_id
      and lesson.course_code = v_course_code
      and playback.revoked_at is null;
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
      join public.video_class_courses course
        on course.code = lesson.course_code
       and course.published = true
      join public.video_class_student_courses access
        on access.student_id = p_student_id
       and access.course_code = lesson.course_code
       and access.enabled = true
      where lesson.id = p_lesson_id
        and lesson.published = true
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
    join public.video_class_courses course
      on course.code = lesson.course_code
     and course.published = true
    join public.video_class_student_courses access
      on access.student_id = p_student_id
     and access.course_code = lesson.course_code
     and access.enabled = true
    where item.playlist_id = playlist.id
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
  left join public.video_class_lessons lesson
    on lesson.course_code = course.code and lesson.published = true
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
    coalesce(progress.position_seconds, 0),
    progress.completed_at,
    progress.updated_at,
    (bookmark.student_id is not null),
    note.note,
    note.updated_at
  from public.video_class_lessons lesson
  join public.video_class_courses course
    on course.code = lesson.course_code and course.published = true
  join public.video_class_student_courses access
    on access.student_id = v_student_id
    and access.course_code = lesson.course_code
    and access.enabled = true
  left join public.video_class_progress progress
    on progress.lesson_id = lesson.id and progress.student_id = v_student_id
  left join public.video_class_bookmarks bookmark
    on bookmark.lesson_id = lesson.id and bookmark.student_id = v_student_id
  left join public.video_class_notes note
    on note.lesson_id = lesson.id and note.student_id = v_student_id
  where lesson.published = true
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
  if v_student_id is null or not exists (
    select 1
    from public.video_class_lessons lesson
    join public.video_class_courses course
      on course.code = lesson.course_code and course.published = true
    join public.video_class_student_courses access
      on access.student_id = v_student_id
      and access.course_code = lesson.course_code
      and access.enabled = true
    where lesson.id = p_lesson_id and lesson.published = true
  ) then
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
  if v_student_id is null or not exists (
    select 1
    from public.video_class_lessons lesson
    join public.video_class_courses course
      on course.code = lesson.course_code and course.published = true
    join public.video_class_student_courses access
      on access.student_id = v_student_id
      and access.course_code = lesson.course_code
      and access.enabled = true
    where lesson.id = p_lesson_id and lesson.published = true
  ) then
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
      course.title as course_title,
      course.sort_order as course_sort_order,
      lesson.course_label,
      lesson.duration_seconds,
      lesson.sort_order,
      lesson.created_at
    from public.video_class_lessons lesson
    join public.video_class_courses course
      on course.code = lesson.course_code
     and course.published = true
    join public.video_class_student_courses access
      on access.student_id = v_student_id
     and access.course_code = lesson.course_code
     and access.enabled = true
    where lesson.published = true
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
          'course_title', lesson.course_title,
          'course_sort_order', lesson.course_sort_order,
          'course_label', lesson.course_label,
          'duration_seconds', lesson.duration_seconds,
          'sort_order', lesson.sort_order,
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
             and playlist.course_code = lesson.course_code
            where item.lesson_id = lesson.id
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
          'lesson_ids', coalesce((
            select jsonb_agg(item.lesson_id order by item.sort_order, lesson.sort_order, lesson.id)
            from public.video_class_official_playlist_items item
            join entitled_lessons lesson on lesson.id = item.lesson_id
            where item.playlist_id = playlist.id
              and lesson.course_code = playlist.course_code
          ), '[]'::jsonb)
        )
        order by playlist.sort_order, playlist.name, playlist.id
      )
      from public.video_class_official_playlists playlist
      where playlist.published = true
        and exists (
          select 1
          from public.video_class_official_playlist_items item
          join entitled_lessons lesson on lesson.id = item.lesson_id
          where item.playlist_id = playlist.id
            and lesson.course_code = playlist.course_code
        )
    ), '[]'::jsonb)
  )
  into v_library;

  return v_library;
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
  join public.video_class_courses course
    on course.code = lesson.course_code
   and course.published = true
  join public.video_class_student_courses access
    on access.student_id = v_student_id
   and access.course_code = lesson.course_code
   and access.enabled = true
  where lesson.id = p_lesson_id
    and lesson.published = true
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

create or replace function public.video_class_admin_list_feedback(
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
  v_admin_id uuid;
  v_result jsonb;
begin
  if not public._video_class_worker_ok(p_service_secret)
    or p_admin_token is null
  then
    return null;
  end if;

  v_admin_id := public._video_class_admin_id(p_admin_token);
  if v_admin_id is null then
    return null;
  end if;

  select jsonb_build_object(
    'feedback', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'student_id', feedback.student_id,
          'student_name', student.name,
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
      from public.video_class_lesson_feedback feedback
      join public.flashcard_students student on student.id = feedback.student_id
      join public.video_class_lessons lesson on lesson.id = feedback.lesson_id
    ), '[]'::jsonb),
    'summary', (
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
    )
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
  join public.video_class_courses course
    on course.code = lesson.course_code
   and course.published = true
  join public.video_class_student_courses access
    on access.student_id = v_student_id
   and access.course_code = lesson.course_code
   and access.enabled = true
  where thumbnail.lesson_id = p_lesson_id
    and thumbnail.enabled = true;
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
  join public.video_class_courses course
    on course.code = lesson.course_code
   and course.published = true
  join public.video_class_student_courses course_access
    on course_access.student_id = playback.student_id
   and course_access.course_code = lesson.course_code
   and course_access.enabled = true
  join public.video_class_lesson_renditions rendition
    on rendition.lesson_id = lesson.id
   and rendition.enabled = true
  where playback.id = p_playback_id
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
  join public.video_class_courses course
    on course.code = lesson.course_code
   and course.published = true
  join public.video_class_student_courses course_access
    on course_access.student_id = playback.student_id
   and course_access.course_code = lesson.course_code
   and course_access.enabled = true
  join public.video_class_lesson_renditions rendition
    on rendition.lesson_id = lesson.id
   and rendition.quality_code = p_quality_code
   and rendition.enabled = true
  where playback.id = p_playback_id
    and playback.student_id = p_student_id
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
  join public.video_class_courses course
    on course.code = lesson.course_code and course.published = true
  join public.video_class_student_courses course_access
    on course_access.student_id = v_student_id
    and course_access.course_code = lesson.course_code
    and course_access.enabled = true
  where lesson.slug = p_lesson_slug
    and lesson.published = true
  limit 1
  for no key update of course_access;

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
  join public.video_class_student_courses course_access
    on course_access.student_id = playback.student_id
    and course_access.course_code = lesson.course_code
  join public.video_class_courses course
    on course.code = lesson.course_code and course.published = true
  join public.video_class_student_sessions session
    on session.token_hash = playback.student_session_hash
  where playback.id = p_playback_id
    and playback.student_id = p_student_id
    and lesson.slug = p_lesson_slug
    and lesson.published = true
    and student.deleted_at is null
    and access.enabled = true
    and course_access.enabled = true
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

  select playback.student_id, playback.lesson_id, playback.view_counted_at
  into v_student_id, v_lesson_id, v_view_counted_at
  from public.video_class_playback_sessions playback
  join public.video_class_student_sessions session
    on session.token_hash = playback.student_session_hash
    and session.student_id = playback.student_id
  join public.flashcard_students student on student.id = playback.student_id
  join public.video_class_student_access access on access.student_id = playback.student_id
  join public.video_class_lessons lesson on lesson.id = playback.lesson_id
  join public.video_class_courses course
    on course.code = lesson.course_code and course.published = true
  join public.video_class_student_courses course_access
    on course_access.student_id = playback.student_id
    and course_access.course_code = lesson.course_code
    and course_access.enabled = true
  where playback.id = p_playback_id
    and session.token_hash = extensions.digest(p_student_token::text, 'sha256')
    and session.expires_at > now()
    and playback.revoked_at is null
    and playback.expires_at > now()
    and student.deleted_at is null
    and access.enabled = true
    and lesson.published = true
    and access.video_key = playback.video_key_snapshot
  limit 1
  for update of playback;

  if not found then
    return false;
  end if;

  v_completed_at := case
    when p_duration_seconds >= 10 and p_position_seconds / p_duration_seconds >= 0.92 then now()
    else null
  end;

  v_should_count := p_position_seconds >= 3
    or p_position_seconds / p_duration_seconds >= 0.10;

  -- The progress row is created before its persistent view counter changes.
  -- The locked playback row and view_counted_at marker make retries and racing
  -- heartbeats contribute at most one view for this playback session.
  insert into public.video_class_progress (
    student_id, lesson_id, position_seconds, duration_seconds, completed_at, updated_at
  )
  values (
    v_student_id, v_lesson_id, p_position_seconds, p_duration_seconds, v_completed_at, now()
  )
  on conflict on constraint video_class_progress_pkey do update
  set position_seconds = excluded.position_seconds,
      duration_seconds = excluded.duration_seconds,
      completed_at = coalesce(public.video_class_progress.completed_at, excluded.completed_at),
      updated_at = now();

  if v_should_count and v_view_counted_at is null then
    update public.video_class_progress progress
    set view_count = progress.view_count + 1,
        first_viewed_at = coalesce(progress.first_viewed_at, now()),
        last_viewed_at = now()
    where progress.student_id = v_student_id
      and progress.lesson_id = v_lesson_id;
  end if;

  update public.video_class_playback_sessions playback
  set last_seen_at = now(),
      last_position_seconds = p_position_seconds,
      view_counted_at = case
        when v_should_count and playback.view_counted_at is null then now()
        else playback.view_counted_at
      end
  where playback.id = p_playback_id;

  return true;
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
revoke all on function public.video_class_student_create_playlist(text, uuid, text) from public, anon, authenticated;
revoke all on function public.video_class_student_rename_playlist(text, uuid, uuid, text) from public, anon, authenticated;
revoke all on function public.video_class_student_delete_playlist(text, uuid, uuid) from public, anon, authenticated;
revoke all on function public.video_class_student_set_playlist_lesson(text, uuid, uuid, uuid, boolean) from public, anon, authenticated;
revoke all on function public.video_class_student_create_clip(text, uuid, uuid, numeric, text) from public, anon, authenticated;
revoke all on function public.video_class_student_delete_clip(text, uuid, uuid) from public, anon, authenticated;
revoke all on function public.video_class_student_save_feedback(text, uuid, uuid, smallint, smallint, smallint) from public, anon, authenticated;
revoke all on function public.video_class_admin_list_feedback(text, uuid) from public, anon, authenticated;
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
grant execute on function public.video_class_student_create_playlist(text, uuid, text) to anon;
grant execute on function public.video_class_student_rename_playlist(text, uuid, uuid, text) to anon;
grant execute on function public.video_class_student_delete_playlist(text, uuid, uuid) to anon;
grant execute on function public.video_class_student_set_playlist_lesson(text, uuid, uuid, uuid, boolean) to anon;
grant execute on function public.video_class_student_create_clip(text, uuid, uuid, numeric, text) to anon;
grant execute on function public.video_class_student_delete_clip(text, uuid, uuid) to anon;
grant execute on function public.video_class_student_save_feedback(text, uuid, uuid, smallint, smallint, smallint) to anon;
grant execute on function public.video_class_admin_list_feedback(text, uuid) to anon;
grant execute on function public.video_class_authorize_thumbnail(text, uuid, uuid) to anon;
grant execute on function public.video_class_playback_list_renditions(text, uuid) to anon;
grant execute on function public.video_class_authorize_rendition(text, uuid, uuid, text, text, text, text) to anon;
grant execute on function public.video_class_create_playback(text, uuid, text, text, text) to anon;
grant execute on function public.video_class_authorize_playback(text, uuid, uuid, text, text, text) to anon;
grant execute on function public.video_class_record_progress(text, uuid, uuid, numeric, numeric) to anon;

notify pgrst, 'reload schema';

commit;
