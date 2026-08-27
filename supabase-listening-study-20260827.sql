-- Additive Listening-only extension. Existing Grammar/Listening bookmarks and
-- canonical student passwords/sessions are deliberately left intact.
begin;

alter table public.learning_portal_bookmarks
  add column if not exists difficulty smallint check (difficulty between 1 and 5);
create index if not exists listening_bookmarks_report_idx
  on public.learning_portal_bookmarks (updated_at desc, student_id, item_key)
  where system_key = 'listening';

create table public.listening_admin_accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  password_hash text not null,
  created_at timestamptz not null default now()
);
create unique index listening_admin_name_idx on public.listening_admin_accounts (lower(name));
create table public.listening_admin_sessions (
  token_hash bytea primary key,
  admin_id uuid not null references public.listening_admin_accounts(id) on delete cascade,
  expires_at timestamptz not null
);
create index listening_admin_sessions_admin_idx on public.listening_admin_sessions(admin_id);
create table public.listening_login_limits (
  name_hash bytea primary key,
  window_start timestamptz not null,
  attempts integer not null
);
create table public.listening_recordings (
  id uuid primary key,
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  practice integer not null check (practice between 1 and 20),
  part integer not null check (part between 1 and 4),
  row_index integer check (row_index between 0 and 9999),
  title text not null check (char_length(title) between 1 and 300),
  transcript text not null default '' check (char_length(transcript) <= 3000),
  size_bytes integer not null check (size_bytes between 512 and 3145728),
  duration_ms integer not null check (duration_ms between 1000 and 301000),
  sha256 text not null check (sha256 ~ '^[0-9a-f]{64}$'),
  object_path text not null unique,
  storage_state text not null default 'uploading' check (storage_state in ('uploading','ready','deleting')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index listening_recordings_student_idx on public.listening_recordings(student_id, created_at desc, id);

alter table public.listening_admin_accounts enable row level security;
alter table public.listening_admin_sessions enable row level security;
alter table public.listening_login_limits enable row level security;
alter table public.listening_recordings enable row level security;
revoke all on public.listening_admin_accounts, public.listening_admin_sessions,
  public.listening_login_limits, public.listening_recordings from public, anon, authenticated;
grant all on public.listening_admin_accounts, public.listening_admin_sessions,
  public.listening_login_limits, public.listening_recordings to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('listening-recordings', 'listening-recordings', false, 3145728, array['audio/mpeg'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
-- No browser Storage policies: the authenticated server brokers private media.

create function public.listening_student_profile(p_token uuid)
returns table(id uuid, name text)
language sql stable security definer set search_path = '' as $$
  select s.id, s.name from public.flashcard_student_sessions t
  join public.flashcard_students s on s.id=t.student_id
  where t.token=p_token and t.expires_at>now() and s.deleted_at is null limit 1;
$$;

create function public.listening_admin_login(p_name text, p_password text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  a public.listening_admin_accounts%rowtype;
  k bytea := extensions.digest(lower(btrim(coalesce(p_name,''))), 'sha256');
  count_attempts integer;
  t uuid := gen_random_uuid();
begin
  if char_length(coalesce(p_name,'')) not between 1 and 100
    or char_length(coalesce(p_password,'')) not between 1 and 200 then
    return jsonb_build_object('error','Invalid credentials');
  end if;
  -- Persistent, transaction-serialized rate limit, shared by every server instance.
  insert into public.listening_login_limits values(k, clock_timestamp(), 1)
  on conflict(name_hash) do update set
    attempts=case when listening_login_limits.window_start < clock_timestamp()-interval '1 minute' then 1 else listening_login_limits.attempts+1 end,
    window_start=case when listening_login_limits.window_start < clock_timestamp()-interval '1 minute' then clock_timestamp() else listening_login_limits.window_start end
  returning attempts into count_attempts;
  if count_attempts > 5 then return jsonb_build_object('limited',true); end if;
  select * into a from public.listening_admin_accounts where lower(name)=lower(btrim(p_name));
  if not found then
    perform extensions.crypt(p_password, extensions.gen_salt('bf',12));
    return jsonb_build_object('error','Invalid credentials');
  end if;
  if a.password_hash <> extensions.crypt(p_password,a.password_hash) then
    return jsonb_build_object('error','Invalid credentials');
  end if;
  delete from public.listening_admin_sessions where expires_at<=now();
  delete from public.listening_login_limits where window_start<now()-interval '1 day';
  insert into public.listening_admin_sessions values(extensions.digest(t::text,'sha256'),a.id,now()+interval '8 hours');
  return jsonb_build_object('token',t,'name',a.name,'expiresAt',now()+interval '8 hours');
end;
$$;
create function public.listening_admin_me(p_token uuid)
returns table(id uuid, name text) language sql stable security definer set search_path = '' as $$
  select a.id,a.name from public.listening_admin_sessions s
  join public.listening_admin_accounts a on a.id=s.admin_id
  where s.token_hash=extensions.digest(p_token::text,'sha256') and s.expires_at>now();
$$;
create function public.listening_admin_logout(p_token uuid)
returns void language sql security definer set search_path = '' as $$
  delete from public.listening_admin_sessions where token_hash=extensions.digest(p_token::text,'sha256');
$$;

create function public.listening_reserve_recording(
  p_student uuid, p_id uuid, p_practice integer, p_part integer, p_row integer,
  p_title text, p_transcript text, p_size integer, p_duration integer, p_sha256 text
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare r public.listening_recordings%rowtype; used bigint;
begin
  perform pg_advisory_xact_lock(hashtextextended('listening-recordings:'||p_student::text,0));
  select * into r from public.listening_recordings where id=p_id for update;
  if found then
    if r.student_id<>p_student or r.sha256<>p_sha256 or r.size_bytes<>p_size
      or r.practice<>p_practice or r.part<>p_part or r.row_index is distinct from p_row
      or r.title<>p_title or r.transcript<>p_transcript or r.storage_state='deleting' then
      return jsonb_build_object('error','Recording ID conflict','status',409);
    end if;
    update public.listening_recordings set updated_at=now() where id=r.id returning * into r;
    return jsonb_build_object('recording',to_jsonb(r));
  end if;
  select coalesce(sum(size_bytes),0) into used from public.listening_recordings where student_id=p_student;
  if used+p_size>104857600 then return jsonb_build_object('error','Listening storage is full (100 MB). Delete an older recording first.','status',413); end if;
  if (select count(*) from public.listening_recordings where student_id=p_student and created_at>now()-interval '1 minute')>=12 then
    return jsonb_build_object('error','Please wait a minute before saving another recording.','status',429);
  end if;
  insert into public.listening_recordings(id,student_id,practice,part,row_index,title,transcript,size_bytes,duration_ms,sha256,object_path)
  values(p_id,p_student,p_practice,p_part,p_row,p_title,p_transcript,p_size,p_duration,p_sha256,
    'students/'||p_student::text||'/'||p_id::text||'.mp3') returning * into r;
  return jsonb_build_object('recording',to_jsonb(r));
end;
$$;

create function public.listening_claim_recording_delete(p_student uuid, p_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare r public.listening_recordings%rowtype;
begin
  select * into r from public.listening_recordings where id=p_id and student_id=p_student for update;
  if not found then return jsonb_build_object('error','Recording not found','status',404); end if;
  if r.storage_state='uploading' and r.updated_at>now()-interval '10 minutes' then
    return jsonb_build_object('error','This upload is still processing. Retry saving the MP3, or delete the incomplete upload after 10 minutes.','status',409);
  end if;
  update public.listening_recordings set storage_state='deleting',updated_at=now() where id=p_id returning * into r;
  return jsonb_build_object('recording',to_jsonb(r));
end;
$$;

-- All custom-token functions are server-only. Anonymous Auth is not authority
-- to access another student's recordings or the admin reporting endpoint.
revoke all on function public.listening_student_profile(uuid), public.listening_admin_login(text,text),
  public.listening_admin_me(uuid), public.listening_admin_logout(uuid), public.listening_claim_recording_delete(uuid,uuid),
  public.listening_reserve_recording(uuid,uuid,integer,integer,integer,text,text,integer,integer,text)
  from public, anon, authenticated;
grant execute on function public.listening_student_profile(uuid), public.listening_admin_login(text,text),
  public.listening_admin_me(uuid), public.listening_admin_logout(uuid), public.listening_claim_recording_delete(uuid,uuid),
  public.listening_reserve_recording(uuid,uuid,integer,integer,integer,text,text,integer,integer,text)
  to service_role;

commit;
