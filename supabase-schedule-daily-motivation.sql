-- EdmundEducation Homework System: daily student motivation ratings.
-- Apply after supabase-schedule-system.sql.

begin;

do $$
begin
  if pg_catalog.to_regclass('public.flashcard_students') is null
    or pg_catalog.to_regprocedure('public.flashcard_session_student_id(uuid)') is null
    or pg_catalog.to_regprocedure('public._schedule_admin_id(uuid)') is null
    or pg_catalog.to_regprocedure('public._schedule_week_start_valid(date)') is null
    or pg_catalog.to_regprocedure('public._schedule_lock_student_mutations(uuid)') is null
    or pg_catalog.to_regprocedure('public.schedule_touch_updated_at()') is null
  then
    raise exception 'Missing Schedule System dependencies';
  end if;
end;
$$;

create table if not exists public.schedule_daily_motivation_ratings (
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  schedule_date date not null,
  rating smallint not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (student_id, schedule_date),
  check (schedule_date between date '2026-01-01' and date '2050-12-31'),
  check (rating between 1 and 5)
);

create index if not exists schedule_daily_motivation_date_student_idx
  on public.schedule_daily_motivation_ratings (schedule_date desc, student_id);

alter table public.schedule_daily_motivation_ratings enable row level security;
revoke all on table public.schedule_daily_motivation_ratings
  from public, anon, authenticated;

drop trigger if exists schedule_daily_motivation_touch_updated_at
  on public.schedule_daily_motivation_ratings;
create trigger schedule_daily_motivation_touch_updated_at
before update on public.schedule_daily_motivation_ratings
for each row execute function public.schedule_touch_updated_at();

create or replace function public._schedule_motivation_week_payload(
  p_student_id uuid,
  p_week_start date
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    pg_catalog.jsonb_agg(
      pg_catalog.jsonb_build_object(
        'scheduleDate', rating.schedule_date,
        'rating', rating.rating,
        'updatedAt', rating.updated_at
      )
      order by rating.schedule_date
    ),
    '[]'::jsonb
  )
  from public.schedule_daily_motivation_ratings rating
  where rating.student_id = p_student_id
    and rating.schedule_date between p_week_start and p_week_start + 6;
$$;

create or replace function public.schedule_student_get_motivation_week(
  p_token uuid,
  p_week_start date
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_student_id uuid := public.flashcard_session_student_id(p_token);
begin
  if v_student_id is null then
    raise exception 'Invalid or expired student session';
  end if;
  if not public._schedule_week_start_valid(p_week_start) then
    raise exception 'Invalid schedule week' using errcode = '22023';
  end if;
  return public._schedule_motivation_week_payload(v_student_id, p_week_start);
end;
$$;

create or replace function public.schedule_admin_get_motivation_week(
  p_admin_token uuid,
  p_student_id uuid,
  p_week_start date
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if public._schedule_admin_id(p_admin_token) is null then
    raise exception 'Invalid or expired admin session';
  end if;
  if not public._schedule_week_start_valid(p_week_start) then
    raise exception 'Invalid schedule week' using errcode = '22023';
  end if;
  if not exists (
    select 1 from public.flashcard_students student
    where student.id = p_student_id and student.deleted_at is null
  ) then
    raise exception 'Student not found';
  end if;
  return public._schedule_motivation_week_payload(p_student_id, p_week_start);
end;
$$;

create or replace function public.schedule_student_save_motivation_rating(
  p_token uuid,
  p_schedule_date date,
  p_rating integer
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid := public.flashcard_session_student_id(p_token);
  v_saved public.schedule_daily_motivation_ratings%rowtype;
begin
  if v_student_id is null then
    raise exception 'Invalid or expired student session';
  end if;
  if p_schedule_date is null
    or p_schedule_date not between date '2026-01-01' and date '2050-12-31'
    or p_rating is null
    or p_rating not between 1 and 5
  then
    raise exception 'Invalid motivation rating' using errcode = '22023';
  end if;

  perform public._schedule_lock_student_mutations(v_student_id);
  insert into public.schedule_daily_motivation_ratings as rating (
    student_id,
    schedule_date,
    rating
  ) values (
    v_student_id,
    p_schedule_date,
    p_rating
  )
  on conflict (student_id, schedule_date) do update
  set rating = excluded.rating,
      updated_at = now()
  returning * into v_saved;

  return pg_catalog.jsonb_build_object(
    'scheduleDate', v_saved.schedule_date,
    'rating', v_saved.rating,
    'updatedAt', v_saved.updated_at
  );
end;
$$;

create or replace function public.schedule_admin_save_motivation_rating(
  p_admin_token uuid,
  p_student_id uuid,
  p_schedule_date date,
  p_rating integer
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_saved public.schedule_daily_motivation_ratings%rowtype;
begin
  if public._schedule_admin_id(p_admin_token) is null then
    raise exception 'Invalid or expired admin session';
  end if;
  if p_schedule_date is null
    or p_schedule_date not between date '2026-01-01' and date '2050-12-31'
    or p_rating is null
    or p_rating not between 1 and 5
  then
    raise exception 'Invalid motivation rating' using errcode = '22023';
  end if;
  if not exists (
    select 1 from public.flashcard_students student
    where student.id = p_student_id and student.deleted_at is null
  ) then
    raise exception 'Student not found';
  end if;

  perform public._schedule_lock_student_mutations(p_student_id);
  insert into public.schedule_daily_motivation_ratings as rating (
    student_id,
    schedule_date,
    rating
  ) values (
    p_student_id,
    p_schedule_date,
    p_rating
  )
  on conflict (student_id, schedule_date) do update
  set rating = excluded.rating,
      updated_at = now()
  returning * into v_saved;

  return pg_catalog.jsonb_build_object(
    'scheduleDate', v_saved.schedule_date,
    'rating', v_saved.rating,
    'updatedAt', v_saved.updated_at
  );
end;
$$;

create or replace function public.schedule_admin_list_motivation_ratings(
  p_admin_token uuid,
  p_date_from date,
  p_date_to date,
  p_student_query text default '',
  p_limit integer default 500,
  p_offset integer default 0
)
returns table (
  student_id uuid,
  student_name text,
  schedule_date date,
  rating smallint,
  updated_at timestamptz,
  total_count bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_query text := pg_catalog.lower(pg_catalog.btrim(coalesce(p_student_query, '')));
begin
  if public._schedule_admin_id(p_admin_token) is null then
    raise exception 'Invalid or expired admin session';
  end if;
  if p_date_from is null
    or p_date_to is null
    or p_date_from > p_date_to
    or p_date_from < date '2026-01-01'
    or p_date_to > date '2050-12-31'
  then
    raise exception 'Invalid motivation report date range' using errcode = '22023';
  end if;
  if p_limit is null or p_limit not between 1 and 1000
    or p_offset is null or p_offset < 0
  then
    raise exception 'Invalid motivation report pagination' using errcode = '22023';
  end if;

  return query
  select
    student.id,
    student.name,
    motivation.schedule_date,
    motivation.rating,
    motivation.updated_at,
    pg_catalog.count(*) over ()
  from public.schedule_daily_motivation_ratings motivation
  join public.flashcard_students student on student.id = motivation.student_id
  where motivation.schedule_date between p_date_from and p_date_to
    and student.deleted_at is null
    and (
      v_query = ''
      or pg_catalog.strpos(pg_catalog.lower(student.name), v_query) > 0
    )
  order by motivation.schedule_date desc, pg_catalog.lower(student.name), student.id
  limit p_limit offset p_offset;
end;
$$;

revoke all on function public._schedule_motivation_week_payload(uuid, date)
  from public, anon, authenticated;
revoke all on function public.schedule_student_get_motivation_week(uuid, date)
  from public, anon, authenticated;
revoke all on function public.schedule_admin_get_motivation_week(uuid, uuid, date)
  from public, anon, authenticated;
revoke all on function public.schedule_student_save_motivation_rating(uuid, date, integer)
  from public, anon, authenticated;
revoke all on function public.schedule_admin_save_motivation_rating(uuid, uuid, date, integer)
  from public, anon, authenticated;
revoke all on function public.schedule_admin_list_motivation_ratings(uuid, date, date, text, integer, integer)
  from public, anon, authenticated;

grant execute on function public.schedule_student_get_motivation_week(uuid, date)
  to authenticated;
grant execute on function public.schedule_admin_get_motivation_week(uuid, uuid, date)
  to authenticated;
grant execute on function public.schedule_student_save_motivation_rating(uuid, date, integer)
  to authenticated;
grant execute on function public.schedule_admin_save_motivation_rating(uuid, uuid, date, integer)
  to authenticated;
grant execute on function public.schedule_admin_list_motivation_ratings(uuid, date, date, text, integer, integer)
  to authenticated;

notify pgrst, 'reload schema';

commit;
