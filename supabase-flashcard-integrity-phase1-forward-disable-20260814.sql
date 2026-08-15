-- Flashcard integrity phase 1: non-destructive forward-disable / rollback control.
--
-- This file intentionally RETAINS every state row, receipt, alert, revision, normalized
-- attempt, snapshot, function, checksum column, constraint, and private table.
-- Run it forward only; do not drop evidence while investigating an incident.

-- 1) Stop automation first. The staged rollout does not create this job, but this also
-- safely handles a database on which an older draft scheduled it.
begin;
set local lock_timeout = '3s';
set local statement_timeout = '30s';

do $$
declare
  v_job_id bigint;
begin
  if pg_catalog.to_regclass('cron.job') is not null then
    for v_job_id in execute
      'select jobid from cron.job where jobname = ''flashcard-integrity-nightly-hkt'''
    loop
      execute 'select cron.unschedule($1)' using v_job_id;
    end loop;
  end if;
end;
$$;

commit;

-- 2) Disable only the new v2 entry points. Existing v1 endpoint grants are left as-is,
-- so the old application can continue behind the lossless database trigger.
begin;
set local lock_timeout = '3s';
set local statement_timeout = '30s';

revoke all on function public.flashcard_student_get_state_v2(uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.flashcard_student_upsert_state_v2(uuid, text, jsonb, uuid, bigint)
  from public, anon, authenticated, service_role;
revoke all on function public.flashcard_admin_get_student_state_v2(text, text, text)
  from public, anon, authenticated, service_role;
revoke all on function public.flashcard_admin_upsert_student_state_v2(text, text, text, text, jsonb, uuid, bigint)
  from public, anon, authenticated, service_role;

select flashcard_integrity.record_alert(
  null,
  null,
  'critical',
  'phase1_v2_forward_disabled',
  null,
  '{}'::jsonb,
  pg_catalog.jsonb_build_object('database', pg_catalog.current_database()),
  'v2_execute_revoked_evidence_retained',
  'operator'
);

notify pgrst, 'reload schema';
commit;

-- 3) BREAK-GLASS ONLY: downgrade the public-state trigger if, and only if, independent
-- evidence proves that the full trigger itself is the outage source. This reopens the
-- stale-overwrite risk, so it is skipped unless the operator sets the exact session GUC:
--   set flashcard_integrity.break_glass_trigger_downgrade =
--     'confirmed-preserve-evidence-20260814';
-- The hard-delete guard and all immutable evidence-table triggers remain installed.
begin;
set local lock_timeout = '3s';
set local statement_timeout = '30s';

do $$
begin
  if pg_catalog.current_setting(
       'flashcard_integrity.break_glass_trigger_downgrade', true
     ) = 'confirmed-preserve-evidence-20260814' then
    execute 'lock table public.flashcard_student_state in share row exclusive mode';
    execute 'drop trigger if exists flashcard_state_zz_integrity_protect '
      || 'on public.flashcard_student_state';
    execute 'drop trigger if exists flashcard_state_revision_audit '
      || 'on public.flashcard_student_state';
    execute 'drop trigger if exists flashcard_state_metadata_guard '
      || 'on public.flashcard_student_state';
    execute 'create trigger flashcard_state_metadata_guard '
      || 'before insert or update on public.flashcard_student_state '
      || 'for each row execute function flashcard_integrity.maintain_state_metadata()';

    perform flashcard_integrity.record_alert(
      null,
      null,
      'critical',
      'phase1_break_glass_trigger_downgrade',
      null,
      '{}'::jsonb,
      pg_catalog.jsonb_build_object('database', pg_catalog.current_database()),
      'full_guard_removed_metadata_guard_retained',
      'operator'
    );
  else
    raise notice 'Full integrity trigger retained (break-glass confirmation not set).';
  end if;
end;
$$;

commit;
