-- Video Class ↔ Homework deep-link catalogue and authorization resolver.
-- Apply after supabase-video-class.sql.

begin;

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
      'set_lesson_courses', 'save_official_playlist', 'delete_official_playlist',
      'add_lesson_attachment', 'private_attachment', 'unprivate_attachment',
      'delete_lesson_attachment', 'edit_lesson_feedback', 'delete_lesson_feedback',
      'edit_lesson', 'set_lesson_thumbnail', 'remove_lesson_thumbnail',
      'prepare_delete_lesson', 'delete_lesson', 'set_student_series_mode',
      'set_student_series_access', 'replace_student_series_access',
      'set_official_playlist_order', 'reset_student_progress',
      'reset_student_daily_progress'
    ));
end;
$$;

create or replace function public.video_class_homework_resource_catalog(
  p_service_secret text
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public._video_class_worker_ok(p_service_secret) then
    raise exception 'Invalid Video Class service credential';
  end if;

  return jsonb_build_object(
    'series', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', playlist.id,
        'title', playlist.name,
        'description', playlist.description,
        'lesson_count', (
          select count(*)::integer
          from public.video_class_official_playlist_items item
          join public.video_class_lessons lesson
            on lesson.id = item.lesson_id
           and lesson.published = true
           and lesson.is_private = false
          where item.playlist_id = playlist.id
            and exists (
              select 1
              from public.video_class_lesson_renditions rendition
              where rendition.lesson_id = lesson.id
                and rendition.enabled = true
            )
        ),
        'course_codes', coalesce((
          select jsonb_agg(membership.course_code order by course.sort_order, membership.course_code)
          from public.video_class_official_playlist_courses membership
          join public.video_class_courses course
            on course.code = membership.course_code
           and course.published = true
          where membership.playlist_id = playlist.id
        ), '[]'::jsonb),
        'updated_at', playlist.updated_at
      ) order by playlist.sort_order, playlist.name, playlist.id)
      from public.video_class_official_playlists playlist
      where playlist.published = true
        and exists (
          select 1
          from public.video_class_official_playlist_courses membership
          join public.video_class_courses course
            on course.code = membership.course_code
           and course.published = true
          where membership.playlist_id = playlist.id
        )
        and exists (
          select 1
          from public.video_class_official_playlist_items item
          join public.video_class_lessons lesson
            on lesson.id = item.lesson_id
           and lesson.published = true
           and lesson.is_private = false
          where item.playlist_id = playlist.id
            and exists (
              select 1
              from public.video_class_lesson_renditions rendition
              where rendition.lesson_id = lesson.id
                and rendition.enabled = true
            )
        )
    ), '[]'::jsonb),
    'videos', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', lesson.id,
        'title', lesson.title,
        'description', lesson.description,
        'duration_seconds', lesson.duration_seconds,
        'course_codes', coalesce((
          select jsonb_agg(membership.course_code order by course.sort_order, membership.course_code)
          from public.video_class_lesson_courses membership
          join public.video_class_courses course
            on course.code = membership.course_code
           and course.published = true
          where membership.lesson_id = lesson.id
        ), '[]'::jsonb),
        'updated_at', lesson.updated_at
      ) order by lesson.sort_order, lesson.title, lesson.id)
      from public.video_class_lessons lesson
      where lesson.published = true
        and lesson.is_private = false
        and exists (
          select 1
          from public.video_class_lesson_renditions rendition
          where rendition.lesson_id = lesson.id
            and rendition.enabled = true
        )
        and exists (
          select 1
          from public.video_class_lesson_courses membership
          join public.video_class_courses course
            on course.code = membership.course_code
           and course.published = true
          where membership.lesson_id = lesson.id
        )
    ), '[]'::jsonb)
  );
end;
$$;

create or replace function public.video_class_student_resolve_homework_target(
  p_service_secret text,
  p_student_token uuid,
  p_target_type text,
  p_target_id uuid
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
    or p_target_id is null
    or p_target_type is null
    or p_target_type not in ('series', 'video')
  then
    return null;
  end if;

  v_student_id := public._video_class_student_id(p_student_token);
  if v_student_id is null then
    return null;
  end if;

  if p_target_type = 'series' then
    select jsonb_build_object(
      'type', 'series',
      'id', playlist.id,
      'name', playlist.name,
      'description', playlist.description,
      'published', playlist.published,
      'entitled', true,
      'course_codes', coalesce((
        select jsonb_agg(membership.course_code order by course.sort_order, membership.course_code)
        from public.video_class_official_playlist_courses membership
        join public.video_class_courses course
          on course.code = membership.course_code
         and course.published = true
        where membership.playlist_id = playlist.id
          and public._video_class_student_can_view_official_playlist(
            v_student_id,
            playlist.id,
            membership.course_code
          )
      ), '[]'::jsonb),
      'lesson_ids', coalesce((
        select jsonb_agg(item.lesson_id order by item.sort_order, lesson.sort_order, lesson.id)
        from public.video_class_official_playlist_items item
        join public.video_class_lessons lesson
          on lesson.id = item.lesson_id
         and lesson.published = true
         and lesson.is_private = false
        where item.playlist_id = playlist.id
          and public._video_class_student_can_view_lesson(v_student_id, lesson.id)
          and exists (
            select 1
            from public.video_class_lesson_renditions rendition
            where rendition.lesson_id = lesson.id
              and rendition.enabled = true
          )
      ), '[]'::jsonb)
    )
    into v_result
    from public.video_class_official_playlists playlist
    where playlist.id = p_target_id
      and playlist.published = true
      and public._video_class_student_can_view_official_playlist(v_student_id, playlist.id)
      and exists (
        select 1
        from public.video_class_official_playlist_items item
        join public.video_class_lessons lesson
          on lesson.id = item.lesson_id
         and lesson.published = true
         and lesson.is_private = false
        where item.playlist_id = playlist.id
          and public._video_class_student_can_view_lesson(v_student_id, lesson.id)
          and exists (
            select 1
            from public.video_class_lesson_renditions rendition
            where rendition.lesson_id = lesson.id
              and rendition.enabled = true
          )
      );
  else
    select jsonb_build_object(
      'type', 'video',
      'id', lesson.id,
      'slug', lesson.slug,
      'title', lesson.title,
      'description', lesson.description,
      'duration_seconds', lesson.duration_seconds,
      'published', lesson.published,
      'is_private', lesson.is_private,
      'order', lesson.sort_order,
      'created_at', lesson.created_at,
      'course_code', lesson.course_code,
      'course_codes', coalesce((
        select jsonb_agg(membership.course_code order by course.sort_order, membership.course_code)
        from public.video_class_lesson_courses membership
        join public.video_class_courses course
          on course.code = membership.course_code
         and course.published = true
        where membership.lesson_id = lesson.id
          and public._video_class_student_can_view_lesson_via_course(
            v_student_id,
            lesson.id,
            membership.course_code
          )
      ), '[]'::jsonb),
      'tags', coalesce((
        select jsonb_agg(tag.label order by tag.sort_order, tag.label)
        from public.video_class_lesson_tags lesson_tag
        join public.video_class_tags tag
          on tag.id = lesson_tag.tag_id
         and tag.published = true
        where lesson_tag.lesson_id = lesson.id
      ), '[]'::jsonb),
      'view_count', 0
    )
    into v_result
    from public.video_class_lessons lesson
    where lesson.id = p_target_id
      and lesson.published = true
      and lesson.is_private = false
      and public._video_class_student_can_view_lesson(v_student_id, lesson.id)
      and exists (
        select 1
        from public.video_class_lesson_renditions rendition
        where rendition.lesson_id = lesson.id
          and rendition.enabled = true
      );
  end if;

  return v_result;
end;
$$;

create or replace function public.video_class_admin_delete_official_playlist(
  p_service_secret text,
  p_admin_token uuid,
  p_playlist_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid;
  v_name text;
begin
  if not public._video_class_worker_ok(p_service_secret)
    or p_admin_token is null
    or p_playlist_id is null
  then
    return false;
  end if;

  v_admin_id := public._video_class_admin_id(p_admin_token);
  if v_admin_id is null then
    return false;
  end if;

  select playlist.name
  into v_name
  from public.video_class_official_playlists playlist
  where playlist.id = p_playlist_id
  for update;
  if not found then
    return false;
  end if;

  delete from public.video_class_official_playlists playlist
  where playlist.id = p_playlist_id;

  insert into public.video_class_admin_audit_events (admin_id, action, detail)
  values (v_admin_id, 'delete_official_playlist', jsonb_build_object(
    'playlist_id', p_playlist_id,
    'name', v_name
  ));
  return true;
end;
$$;

revoke all on function public.video_class_homework_resource_catalog(text)
  from public, anon, authenticated;
revoke all on function public.video_class_student_resolve_homework_target(text, uuid, text, uuid)
  from public, anon, authenticated;
revoke all on function public.video_class_admin_delete_official_playlist(text, uuid, uuid)
  from public, anon, authenticated;

grant execute on function public.video_class_homework_resource_catalog(text) to anon;
grant execute on function public.video_class_student_resolve_homework_target(text, uuid, text, uuid) to anon;
grant execute on function public.video_class_admin_delete_official_playlist(text, uuid, uuid) to anon;

notify pgrst, 'reload schema';

commit;
