-- Forward rollback for conflict-alert deduplication.
--
-- FAILS CLOSED.  In the same SQL session, an operator must first run:
--   set flashcard_integrity.conflict_alert_containment_rollback_approved =
--     'confirmed-disable-dedup-20260815';
--
-- This restores one-call/one-alert behavior without deleting alert aggregation fields,
-- receipts, outbox delivery evidence, resolutions, constraints, or indexes.  CAS and
-- student state routines are untouched.

begin;
set local lock_timeout = '3s';
set local statement_timeout = '2min';

do $approval$
begin
  if pg_catalog.current_setting(
       'flashcard_integrity.conflict_alert_containment_rollback_approved', true
     ) is distinct from 'confirmed-disable-dedup-20260815' then
    raise exception using
      errcode = '55000',
      message = 'Conflict-alert containment rollback not approved in this session; no changes applied.';
  end if;
end;
$approval$;

create or replace function flashcard_integrity.record_alert(
  p_student_id uuid,
  p_state_key text,
  p_severity text,
  p_code text,
  p_request_id uuid,
  p_current_metrics jsonb,
  p_incoming_metrics jsonb,
  p_action_taken text,
  p_actor_kind text default null
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $record_alert$
declare
  v_alert_id bigint;
  v_now timestamptz := pg_catalog.clock_timestamp();
begin
  insert into flashcard_integrity.alerts (
    student_id,
    state_key,
    severity,
    code,
    request_id,
    current_metrics,
    incoming_metrics,
    action_taken,
    actor_kind,
    occurrence_count,
    last_seen_at,
    last_request_id,
    dedup_fingerprint,
    dedup_window_start
  )
  values (
    p_student_id,
    p_state_key,
    case when p_severity in ('info', 'warning', 'critical') then p_severity else 'warning' end,
    p_code,
    p_request_id,
    coalesce(p_current_metrics, '{}'::jsonb),
    coalesce(p_incoming_metrics, '{}'::jsonb),
    p_action_taken,
    coalesce(nullif(p_actor_kind, ''), flashcard_integrity.current_actor_kind()),
    1,
    v_now,
    p_request_id,
    null,
    null
  )
  returning alert_id into v_alert_id;

  insert into flashcard_integrity.alert_outbox (alert_id)
  values (v_alert_id);

  return v_alert_id;
end;
$record_alert$;

revoke all on function flashcard_integrity.record_alert(
  uuid, text, text, text, uuid, jsonb, jsonb, text, text
) from public, anon, authenticated, service_role;

commit;
