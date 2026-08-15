-- Supplemental watchdog migration for environments where the public snapshot-gate
-- wrapper is already installed.
--
-- DO NOT reapply the base watchdog migration in that environment: doing so would
-- replace public.flashcard_integrity_health() and remove the snapshot gate.  This
-- migration leaves the public wrapper, its ACL, watchdog_credentials, and every
-- credential row untouched. It preserves the authorized seven-trigger implementation
-- under a private legacy name and installs an eight-trigger internal adapter at the
-- exact internal name already called by the public wrapper.

begin;
set local lock_timeout = '3s';
set local statement_timeout = '30s';

do $$
declare
  v_public_wrapper pg_catalog.regprocedure := pg_catalog.to_regprocedure(
    'public.flashcard_integrity_health()'
  );
  v_current_internal pg_catalog.regprocedure := pg_catalog.to_regprocedure(
    'public.flashcard_integrity_health_snapshot_required_internal()'
  );
  v_preserved_v7 pg_catalog.regprocedure := pg_catalog.to_regprocedure(
    'public.flashcard_integrity_health_snapshot_v7_internal()'
  );
  v_public_definition text;
  v_internal_definition text;
begin
  if v_public_wrapper is null then
    raise exception using
      errcode = '55000',
      message = 'Public Flashcard watchdog wrapper is missing; supplemental migration made no changes.';
  end if;

  v_public_definition := pg_catalog.lower(
    pg_catalog.pg_get_functiondef(v_public_wrapper)
  );
  if pg_catalog.strpos(
       v_public_definition,
       'x-flashcard-watchdog-snapshot-checks-enabled'
     ) = 0
     or pg_catalog.strpos(
       v_public_definition,
       'flashcard_integrity_health_snapshot_required_internal'
     ) = 0 then
    raise exception using
      errcode = '55000',
      message = 'Public watchdog is not the reviewed snapshot-gate wrapper; supplemental migration made no changes.';
  end if;

  if v_preserved_v7 is null then
    if v_current_internal is null then
      raise exception using
        errcode = '55000',
        message = 'Renamed watchdog implementation is missing; supplemental migration made no changes.';
    end if;

    v_internal_definition := pg_catalog.lower(
      pg_catalog.pg_get_functiondef(v_current_internal)
    );
    if pg_catalog.strpos(v_internal_definition, 'x-flashcard-watchdog-token') = 0
       or pg_catalog.strpos(v_internal_definition, 'watchdog_credentials') = 0
       or pg_catalog.strpos(
         v_internal_definition,
         'flashcard_state_zy_legacy_object_merge'
       ) > 0 then
      raise exception using
        errcode = '55000',
        message = 'Internal watchdog is not the reviewed authorized seven-trigger implementation; supplemental migration made no changes.';
    end if;

    alter function public.flashcard_integrity_health_snapshot_required_internal()
      rename to flashcard_integrity_health_snapshot_v7_internal;
  else
    v_internal_definition := pg_catalog.lower(
      pg_catalog.pg_get_functiondef(v_preserved_v7)
    );
    if pg_catalog.strpos(v_internal_definition, 'x-flashcard-watchdog-token') = 0
       or pg_catalog.strpos(v_internal_definition, 'watchdog_credentials') = 0
       or pg_catalog.strpos(
         v_internal_definition,
         'flashcard_state_zy_legacy_object_merge'
       ) > 0 then
      raise exception using
        errcode = '55000',
        message = 'Preserved v7 watchdog implementation failed identity checks; supplemental migration made no changes.';
    end if;

    if v_current_internal is not null
       and pg_catalog.strpos(
         pg_catalog.lower(pg_catalog.pg_get_functiondef(v_current_internal)),
         'flashcard_integrity_health_snapshot_v7_internal'
       ) = 0 then
      raise exception using
        errcode = '55000',
        message = 'Current internal watchdog is not the reviewed supplemental adapter/passthrough; supplemental migration made no changes.';
    end if;
  end if;
end;
$$;

-- The preserved implementation still performs token authorization and all original
-- state, attempt, seven-trigger, alert, outbox, and snapshot checks. Keep it private.
revoke all on function public.flashcard_integrity_health_snapshot_v7_internal()
  from public, anon, authenticated, service_role;

create or replace function public.flashcard_integrity_health_snapshot_required_internal()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_health jsonb;
  v_checks jsonb := '{}'::jsonb;
  v_trigger_check jsonb := '{}'::jsonb;
  v_incident_codes jsonb := '[]'::jsonb;
  v_existing_missing bigint := 0;
  v_total_missing bigint := 0;
  v_guard_missing boolean := true;
  v_base_malformed boolean := false;
  v_base_healthy boolean := false;
  v_healthy boolean := false;
begin
  -- Authorization remains inside the preserved function. Missing/invalid tokens still
  -- raise the same indistinguishable insufficient_privilege response before the new
  -- inventory result is constructed.
  v_health := public.flashcard_integrity_health_snapshot_v7_internal();

  if pg_catalog.jsonb_typeof(v_health) <> 'object' then
    v_health := '{}'::jsonb;
    v_base_malformed := true;
  end if;

  v_checks := case
    when pg_catalog.jsonb_typeof(v_health -> 'checks') = 'object'
      then v_health -> 'checks'
    else '{}'::jsonb
  end;
  v_trigger_check := case
    when pg_catalog.jsonb_typeof(v_checks -> 'triggers') = 'object'
      then v_checks -> 'triggers'
    else '{}'::jsonb
  end;

  begin
    v_existing_missing := greatest(
      coalesce(nullif(v_trigger_check ->> 'missingCount', '')::bigint, 0),
      0
    );
    if pg_catalog.lower(coalesce(v_trigger_check ->> 'healthy', ''))
         not in ('true', 'false') then
      v_base_malformed := true;
      v_existing_missing := greatest(v_existing_missing, 1);
    elsif not (v_trigger_check ->> 'healthy')::boolean then
      v_existing_missing := greatest(v_existing_missing, 1);
    end if;
  exception
    when others then
      v_base_malformed := true;
      v_existing_missing := greatest(v_existing_missing, 1);
  end;

  select not exists (
    select 1
    from pg_catalog.pg_trigger trigger_row
    where trigger_row.tgrelid =
          'public.flashcard_student_state'::pg_catalog.regclass
      and trigger_row.tgname = 'flashcard_state_zy_legacy_object_merge'
      and not trigger_row.tgisinternal
      and trigger_row.tgenabled <> 'D'
  ) into v_guard_missing;

  v_total_missing := v_existing_missing + case when v_guard_missing then 1 else 0 end;

  begin
    if pg_catalog.lower(coalesce(v_health ->> 'healthy', '')) in ('true', 'false') then
      v_base_healthy := (v_health ->> 'healthy')::boolean;
    else
      v_base_healthy := false;
      v_base_malformed := true;
    end if;
  exception
    when others then
      v_base_healthy := false;
      v_base_malformed := true;
  end;

  select coalesce(pg_catalog.jsonb_agg(code order by code), '[]'::jsonb)
  into v_incident_codes
  from (
    select incident.code
    from pg_catalog.jsonb_array_elements_text(
      case
        when pg_catalog.jsonb_typeof(v_health -> 'incidentCodes') = 'array'
          then v_health -> 'incidentCodes'
        else '[]'::jsonb
      end
    ) incident(code)

    union
    select 'integrity_trigger_missing'::text
    where v_total_missing > 0

    union
    select 'watchdog_internal_response_invalid'::text
    where v_base_malformed
  ) incident_set;

  v_trigger_check := v_trigger_check || pg_catalog.jsonb_build_object(
    'healthy', v_total_missing = 0,
    'missingCount', v_total_missing,
    'expectedCount', 8,
    'supplementalEightTriggerInventory', true
  );
  v_checks := pg_catalog.jsonb_set(
    v_checks,
    '{triggers}',
    v_trigger_check,
    true
  );

  v_healthy := v_base_healthy
    and not v_base_malformed
    and v_total_missing = 0;

  return v_health || pg_catalog.jsonb_build_object(
    'healthy', v_healthy,
    'status', case when v_healthy then 'healthy' else 'unhealthy' end,
    'incidentCodes', v_incident_codes,
    'checks', v_checks
  );
end;
$$;

revoke all on function public.flashcard_integrity_health_snapshot_required_internal()
  from public, anon, authenticated, service_role;

-- Deliberately no CREATE/REPLACE/GRANT/REVOKE for public.flashcard_integrity_health().
-- Deliberately no DDL/DML against flashcard_integrity.watchdog_credentials.
commit;
