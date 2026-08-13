-- Repair UUID pagination cursors used by the video-class administrator.
--
-- Apply after supabase-video-class-library-expansion.sql. PostgreSQL does not
-- provide max(uuid); the terminal cursor must be selected from the ordered page.

begin;

set local lock_timeout = '15s';
set local statement_timeout = '0';

select pg_catalog.pg_advisory_xact_lock(
  pg_catalog.hashtextextended('edmund-video-class-pagination-cursor-fix-v1', 0)
);

do $$
begin
  if to_regprocedure('public.video_class_admin_list_lessons_page(text,uuid,integer,uuid,text)') is null
    or to_regprocedure('public.video_class_admin_list_official_playlists_page(text,uuid,integer,uuid,text)') is null
  then
    raise exception 'Install the video class library expansion before this migration';
  end if;
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

revoke all on function public.video_class_admin_list_lessons_page(text, uuid, integer, uuid, text)
  from public, anon, authenticated;
revoke all on function public.video_class_admin_list_official_playlists_page(text, uuid, integer, uuid, text)
  from public, anon, authenticated;

grant execute on function public.video_class_admin_list_lessons_page(text, uuid, integer, uuid, text) to anon;
grant execute on function public.video_class_admin_list_official_playlists_page(text, uuid, integer, uuid, text) to anon;

notify pgrst, 'reload schema';

commit;
