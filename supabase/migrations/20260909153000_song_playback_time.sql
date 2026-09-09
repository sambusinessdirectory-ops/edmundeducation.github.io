create table if not exists public.song_appreciation_playback_daily (
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  activity_date date not null,
  seconds bigint not null default 0 check (seconds between 0 and 604800),
  updated_at timestamptz not null default pg_catalog.now(),
  primary key (student_id, activity_date)
);

alter table public.song_appreciation_playback_daily enable row level security;
revoke all on table public.song_appreciation_playback_daily from public, anon, authenticated, service_role;

create or replace function public.song_appreciation_playback_list(p_student_token uuid)
returns table (activity_date date, seconds bigint)
language sql
security definer
set search_path = ''
as $$
  select daily.activity_date, daily.seconds
  from public.song_appreciation_playback_daily daily
  where daily.student_id = public._song_appreciation_student_id(p_student_token)
  order by daily.activity_date;
$$;

create or replace function public.song_appreciation_playback_add(
  p_student_token uuid,
  p_song_id uuid,
  p_seconds integer,
  p_played_at timestamptz
)
returns table (activity_date date, seconds bigint)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid := public._song_appreciation_student_id(p_student_token);
  v_day date;
begin
  if v_student_id is null then
    raise exception 'Unauthorized' using errcode = '42501';
  end if;
  if p_seconds is null or p_seconds < 1 or p_seconds > 60 then
    raise exception 'Invalid playback duration' using errcode = '22023';
  end if;
  if p_played_at is null or p_played_at < pg_catalog.now() - interval '1 day'
     or p_played_at > pg_catalog.now() + interval '5 minutes' then
    raise exception 'Invalid playback timestamp' using errcode = '22023';
  end if;
  if not exists (
    select 1
    from public.song_appreciation_songs song
    where song.id = p_song_id
      and song.published
      and not exists (
        select 1 from public.song_appreciation_access_overrides access_row
        where access_row.song_id = song.id
          and access_row.student_id = v_student_id
          and not access_row.allowed
      )
  ) then
    raise exception 'Forbidden' using errcode = '42501';
  end if;

  v_day := (p_played_at at time zone 'Asia/Hong_Kong')::date;
  insert into public.song_appreciation_playback_daily as daily
    (student_id, activity_date, seconds, updated_at)
  values (v_student_id, v_day, p_seconds, pg_catalog.now())
  on conflict on constraint song_appreciation_playback_daily_pkey do update
    set seconds = case
      when daily.seconds + excluded.seconds > 604800::bigint then 604800::bigint
      else daily.seconds + excluded.seconds
    end,
        updated_at = pg_catalog.now();

  return query
  select daily.activity_date, daily.seconds
  from public.song_appreciation_playback_daily daily
  where daily.student_id = v_student_id and daily.activity_date = v_day;
end;
$$;

revoke all on function public.song_appreciation_playback_list(uuid) from public, anon, authenticated, service_role;
revoke all on function public.song_appreciation_playback_add(uuid, uuid, integer, timestamptz) from public, anon, authenticated, service_role;
grant execute on function public.song_appreciation_playback_list(uuid) to anon, authenticated;
grant execute on function public.song_appreciation_playback_add(uuid, uuid, integer, timestamptz) to anon, authenticated;
