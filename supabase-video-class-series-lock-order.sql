-- Video Class official-series/course concurrency correction.
-- Apply after supabase-video-class-library-expansion.sql.

begin;
select pg_advisory_xact_lock(hashtext('edmund_video_class_library_expansion'));
set local lock_timeout = '15s';

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

  -- Course updates use FOR UPDATE on these same lesson rows. Acquire the
  -- compatible shared locks before reading memberships so validation cannot
  -- be based on a snapshot that became stale while waiting for the lock.
  perform 1
  from public.video_class_lessons lesson
  where lesson.id = any(v_lessons)
  order by lesson.id
  for share;

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

revoke all on function public.video_class_admin_save_official_playlist(
  text, uuid, uuid, text, text, text[], uuid[], boolean
) from public, anon, authenticated;
grant execute on function public.video_class_admin_save_official_playlist(
  text, uuid, uuid, text, text, text[], uuid[], boolean
) to anon;

notify pgrst, 'reload schema';
commit;
