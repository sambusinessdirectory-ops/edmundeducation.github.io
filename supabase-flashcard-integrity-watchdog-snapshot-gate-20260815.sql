-- Flashcard watchdog supplemental hardening: explicit snapshot-check gate.
--
-- The aggregate watchdog may be activated before automatic nightly snapshots. Only
-- the exact request header value `false` disables snapshot lateness/corruption checks;
-- a missing, malformed, or stripped header defaults to enabled (fail closed).

begin;
set local lock_timeout = '3s';
set local statement_timeout = '2min';

do $$
begin
  if pg_catalog.to_regprocedure(
       'public.flashcard_integrity_health_snapshot_required_internal()'
     ) is null then
    if pg_catalog.to_regprocedure('public.flashcard_integrity_health()') is null then
      raise exception using
        errcode = '55000',
        message = 'Base Flashcard watchdog RPC is missing; apply its migration first.';
    end if;

    alter function public.flashcard_integrity_health()
      rename to flashcard_integrity_health_snapshot_required_internal;
  end if;
end;
$$;

-- The renamed implementation still performs token authorization and every original
-- aggregate check. It is an internal implementation detail, not a Data API endpoint.
revoke all on function public.flashcard_integrity_health_snapshot_required_internal()
  from public, anon, authenticated, service_role;

create or replace function public.flashcard_integrity_health()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_headers jsonb := '{}'::jsonb;
  v_snapshot_checks_enabled boolean := true;
  v_health jsonb;
  v_snapshot_check jsonb;
  v_incident_codes jsonb := '[]'::jsonb;
  v_healthy boolean;
begin
  begin
    v_headers := coalesce(
      nullif(pg_catalog.current_setting('request.headers', true), '')::jsonb,
      '{}'::jsonb
    );
  exception
    when others then
      v_headers := '{}'::jsonb;
  end;

  -- Only an explicit `false` from the authenticated watchdog request disables this
  -- one family of checks. All other values, including absence, enable it.
  v_snapshot_checks_enabled := coalesce(
    v_headers ->> 'x-flashcard-watchdog-snapshot-checks-enabled',
    'true'
  ) <> 'false';

  v_health := public.flashcard_integrity_health_snapshot_required_internal();
  v_snapshot_check := coalesce(v_health #> '{checks,snapshot}', '{}'::jsonb);

  if v_snapshot_checks_enabled then
    v_incident_codes := coalesce(v_health -> 'incidentCodes', '[]'::jsonb);
    v_snapshot_check := v_snapshot_check || pg_catalog.jsonb_build_object(
      'enabled', true
    );
  else
    -- Preserve the observed snapshot metrics for visibility, but temporarily remove
    -- only snapshot-family incidents from the overall decision. Every state, attempt,
    -- trigger, alert, outbox, endpoint, and authorization check remains fail closed.
    select coalesce(pg_catalog.jsonb_agg(code order by code), '[]'::jsonb)
    into v_incident_codes
    from pg_catalog.jsonb_array_elements_text(
      coalesce(v_health -> 'incidentCodes', '[]'::jsonb)
    ) incident(code)
    where code not in (
      'nightly_snapshot_late',
      'nightly_snapshot_failed',
      'nightly_snapshot_corrupt'
    );

    v_snapshot_check := v_snapshot_check || pg_catalog.jsonb_build_object(
      'enabled', false,
      'healthy', true
    );
  end if;

  -- Do not trust incident-code filtering alone. A malformed or internally
  -- inconsistent base response must remain unhealthy even when snapshot checks are
  -- temporarily disabled.
  v_healthy := pg_catalog.jsonb_array_length(v_incident_codes) = 0
    and coalesce((v_health #>> '{checks,state,healthy}')::boolean, false)
    and coalesce((v_health #>> '{checks,attempts,healthy}')::boolean, false)
    and coalesce((v_health #>> '{checks,triggers,healthy}')::boolean, false)
    and coalesce((v_health #>> '{checks,alerts,healthy}')::boolean, false)
    and coalesce((v_health #>> '{checks,outbox,healthy}')::boolean, false)
    and (
      not v_snapshot_checks_enabled
      or coalesce((v_health #>> '{checks,snapshot,healthy}')::boolean, false)
    );

  return v_health
    || pg_catalog.jsonb_build_object(
      'schemaVersion', '2026-08-15.1',
      'healthy', v_healthy,
      'status', case when v_healthy then 'healthy' else 'unhealthy' end,
      'incidentCodes', v_incident_codes,
      'checks', pg_catalog.jsonb_set(
        coalesce(v_health -> 'checks', '{}'::jsonb),
        '{snapshot}',
        v_snapshot_check,
        true
      )
    );
end;
$$;

revoke all on function public.flashcard_integrity_health()
  from public, anon, authenticated, service_role;
grant execute on function public.flashcard_integrity_health() to anon;

notify pgrst, 'reload schema';
commit;
