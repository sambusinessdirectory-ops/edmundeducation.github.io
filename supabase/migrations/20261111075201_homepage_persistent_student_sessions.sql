create schema if not exists student_device_private;
revoke all on schema student_device_private from public, anon, authenticated;

create table if not exists student_device_private.sessions (
  auth_uid uuid primary key references auth.users(id) on delete cascade,
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  student_session_token uuid not null references public.flashcard_student_sessions(token) on delete cascade,
  password_hash_snapshot text not null,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create or replace function public.homepage_student_login(p_name text, p_password text)
returns table(id uuid, name text, role text, access jsonb, session_token uuid)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_auth_uid uuid := auth.uid();
  v_student public.flashcard_students%rowtype;
  v_token uuid;
  v_old_token uuid;
begin
  if v_auth_uid is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  select student.* into v_student
  from public.flashcard_students student
  where lower(student.name) = lower(trim(p_name))
    and student.deleted_at is null
    and student.password_hash = extensions.crypt(p_password, student.password_hash)
  limit 1;
  if not found then return; end if;
  select device.student_session_token into v_old_token
  from student_device_private.sessions device where device.auth_uid = v_auth_uid;
  if v_old_token is not null then
    delete from public.flashcard_student_sessions session_row where session_row.token = v_old_token;
  end if;
  insert into public.flashcard_student_sessions (student_id)
  values (v_student.id) returning token into v_token;
  insert into student_device_private.sessions (auth_uid, student_id, student_session_token, password_hash_snapshot)
  values (v_auth_uid, v_student.id, v_token, v_student.password_hash);
  return query select v_student.id, v_student.name, 'student'::text, v_student.access, v_token;
end;
$$;

create or replace function public.homepage_student_resume()
returns table(id uuid, name text, role text, access jsonb, session_token uuid)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_auth_uid uuid := auth.uid();
  v_device student_device_private.sessions%rowtype;
  v_student public.flashcard_students%rowtype;
  v_token uuid;
begin
  if v_auth_uid is null then return; end if;
  select device.* into v_device from student_device_private.sessions device where device.auth_uid = v_auth_uid;
  if not found then return; end if;
  select student.* into v_student from public.flashcard_students student
  where student.id = v_device.student_id and student.deleted_at is null;
  if not found or v_student.password_hash is distinct from v_device.password_hash_snapshot then
    delete from public.flashcard_student_sessions session_row where session_row.token = v_device.student_session_token;
    return;
  end if;
  select session_row.token into v_token from public.flashcard_student_sessions session_row
  where session_row.token = v_device.student_session_token
    and session_row.student_id = v_student.id
    and session_row.expires_at > now();
  if v_token is null then
    insert into public.flashcard_student_sessions (student_id) values (v_student.id) returning token into v_token;
    update student_device_private.sessions device
    set student_session_token = v_token, password_hash_snapshot = v_student.password_hash, last_seen_at = now()
    where device.auth_uid = v_auth_uid;
  else
    update student_device_private.sessions device set last_seen_at = now() where device.auth_uid = v_auth_uid;
  end if;
  return query select v_student.id, v_student.name, 'student'::text, v_student.access, v_token;
end;
$$;

create or replace function public.homepage_student_forget_device()
returns boolean language plpgsql security definer set search_path = '' as $$
declare v_auth_uid uuid := auth.uid(); v_token uuid; v_deleted integer;
begin
  if v_auth_uid is null then return false; end if;
  select device.student_session_token into v_token
  from student_device_private.sessions device where device.auth_uid = v_auth_uid;
  if v_token is null then return false; end if;
  delete from public.flashcard_student_sessions session_row where session_row.token = v_token;
  get diagnostics v_deleted = row_count;
  return v_deleted > 0;
end;
$$;

revoke all on function public.homepage_student_login(text, text) from public, anon;
revoke all on function public.homepage_student_resume() from public, anon;
revoke all on function public.homepage_student_forget_device() from public, anon;
grant execute on function public.homepage_student_login(text, text) to authenticated;
grant execute on function public.homepage_student_resume() to authenticated;
grant execute on function public.homepage_student_forget_device() to authenticated;
