-- Video Class: administrator dashboard reset controls.
--
-- A full reset removes all lesson and daily aggregates for one student.
-- A date reset removes the selected Hong Kong calendar date, then rebuilds
-- the affected lesson aggregates from the remaining daily rows. Both modes
-- revoke active playback grants first so a stale heartbeat cannot recreate
-- data immediately after the reset.

begin;

do $$
begin
  if to_regclass('public.video_class_progress') is null
    or to_regclass('public.video_class_daily_progress') is null
    or to_regclass('public.video_class_playback_sessions') is null
    or to_regclass('public.video_class_admin_audit_events') is null
    or to_regprocedure('public._video_class_worker_ok(text)') is null
    or to_regprocedure('public._video_class_admin_id(uuid)') is null
  then
    raise exception 'Apply the Video Class base schema first';
  end if;
end;
$$;

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
      'replace_student_series_access', 'set_official_playlist_order',
      'reset_student_progress', 'reset_student_daily_progress'
    ));
end;
$$;

create or replace function public.video_class_admin_reset_student_progress(
  p_service_secret text,
  p_admin_token uuid,
  p_student_id uuid,
  p_activity_date date default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid;
  v_student_name text;
  v_revoked_playbacks integer := 0;
  v_progress_rows integer := 0;
  v_daily_rows integer := 0;
  v_lessons_reset integer := 0;
  v_watched_seconds numeric(18,2) := 0;
  v_view_count bigint := 0;
  v_affected_lesson_ids uuid[] := array[]::uuid[];
begin
  if not public._video_class_worker_ok(p_service_secret)
    or p_student_id is null
  then
    raise exception 'Invalid dashboard reset request';
  end if;

  v_admin_id := public._video_class_admin_id(p_admin_token);
  if v_admin_id is null then
    raise exception 'Invalid or expired admin session';
  end if;

  select student.name
  into v_student_name
  from public.flashcard_students student
  where student.id = p_student_id
    and student.deleted_at is null
  for no key update;

  if not found then
    raise exception 'Student not found';
  end if;

  -- Playback creation follows the same parent -> access -> playback order.
  -- Locking the access row serializes this destructive reset with any grant
  -- already being created for the student.
  perform 1
  from public.video_class_student_access access
  where access.student_id = p_student_id
  for update;

  update public.video_class_playback_sessions playback
  set revoked_at = clock_timestamp()
  where playback.student_id = p_student_id
    and playback.revoked_at is null
    and playback.expires_at > clock_timestamp();
  get diagnostics v_revoked_playbacks = row_count;

  if p_activity_date is null then
    select
      count(*)::integer,
      coalesce(round(sum(progress.total_watched_seconds), 2), 0::numeric),
      coalesce(sum(progress.view_count), 0::bigint)
    into v_progress_rows, v_watched_seconds, v_view_count
    from public.video_class_progress progress
    where progress.student_id = p_student_id;

    select count(*)::integer
    into v_daily_rows
    from public.video_class_daily_progress daily
    where daily.student_id = p_student_id;

    v_lessons_reset := v_progress_rows;

    delete from public.video_class_daily_progress daily
    where daily.student_id = p_student_id;

    delete from public.video_class_progress progress
    where progress.student_id = p_student_id;

    insert into public.video_class_admin_audit_events (admin_id, student_id, action, detail)
    values (
      v_admin_id,
      p_student_id,
      'reset_student_progress',
      jsonb_build_object(
        'scope', 'all',
        'student_name', v_student_name,
        'progress_rows_deleted', v_progress_rows,
        'daily_rows_deleted', v_daily_rows,
        'lessons_reset', v_lessons_reset,
        'watched_seconds_removed', v_watched_seconds,
        'view_count_removed', v_view_count,
        'playbacks_revoked', v_revoked_playbacks
      )
    );
  else
    select
      coalesce(array_agg(distinct daily.lesson_id), array[]::uuid[]),
      count(*)::integer,
      count(distinct daily.lesson_id)::integer,
      coalesce(round(sum(daily.watched_seconds), 2), 0::numeric),
      coalesce(sum(daily.view_count), 0::bigint)
    into
      v_affected_lesson_ids,
      v_daily_rows,
      v_lessons_reset,
      v_watched_seconds,
      v_view_count
    from public.video_class_daily_progress daily
    where daily.student_id = p_student_id
      and daily.activity_date = p_activity_date;

    delete from public.video_class_daily_progress daily
    where daily.student_id = p_student_id
      and daily.activity_date = p_activity_date;

    -- Rebuild the lifetime counters for lessons that still have activity on
    -- other dates. Resume position is deliberately preserved: resetting a
    -- dashboard date must not make a student lose their place in the video.
    with remaining as (
      select
        daily.lesson_id,
        round(sum(daily.watched_seconds), 2) as watched_seconds,
        sum(daily.view_count)::bigint as view_count,
        min(daily.first_activity_at) as first_activity_at,
        max(daily.last_activity_at) as last_activity_at
      from public.video_class_daily_progress daily
      where daily.student_id = p_student_id
        and daily.lesson_id = any(v_affected_lesson_ids)
      group by daily.lesson_id
    )
    update public.video_class_progress progress
    set total_watched_seconds = remaining.watched_seconds,
        view_count = remaining.view_count,
        first_viewed_at = remaining.first_activity_at,
        last_viewed_at = remaining.last_activity_at,
        updated_at = clock_timestamp()
    from remaining
    where progress.student_id = p_student_id
      and progress.lesson_id = remaining.lesson_id;

    delete from public.video_class_progress progress
    where progress.student_id = p_student_id
      and progress.lesson_id = any(v_affected_lesson_ids)
      and not exists (
        select 1
        from public.video_class_daily_progress remaining
        where remaining.student_id = progress.student_id
          and remaining.lesson_id = progress.lesson_id
          and (remaining.watched_seconds > 0 or remaining.view_count > 0)
      );
    get diagnostics v_progress_rows = row_count;

    insert into public.video_class_admin_audit_events (admin_id, student_id, action, detail)
    values (
      v_admin_id,
      p_student_id,
      'reset_student_daily_progress',
      jsonb_build_object(
        'scope', 'date',
        'activity_date', p_activity_date,
        'student_name', v_student_name,
        'daily_rows_deleted', v_daily_rows,
        'progress_rows_deleted', v_progress_rows,
        'lessons_reset', v_lessons_reset,
        'watched_seconds_removed', v_watched_seconds,
        'view_count_removed', v_view_count,
        'playbacks_revoked', v_revoked_playbacks
      )
    );
  end if;

  return jsonb_build_object(
    'student_id', p_student_id,
    'student_name', v_student_name,
    'scope', case when p_activity_date is null then 'all' else 'date' end,
    'activity_date', p_activity_date,
    'lessons_reset', v_lessons_reset,
    'progress_rows_deleted', v_progress_rows,
    'daily_rows_deleted', v_daily_rows,
    'watched_seconds_removed', v_watched_seconds,
    'view_count_removed', v_view_count,
    'playbacks_revoked', v_revoked_playbacks,
    'reset_at', clock_timestamp()
  );
end;
$$;

revoke all on function public.video_class_admin_reset_student_progress(text, uuid, uuid, date)
  from public, anon, authenticated;
grant execute on function public.video_class_admin_reset_student_progress(text, uuid, uuid, date)
  to anon;

notify pgrst, 'reload schema';

commit;
