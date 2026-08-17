-- Reject incomparable Phrasal attempt branches even when their scalar counters
-- appear to move forward. The browser receives SQLSTATE 22023 as HTTP 409 and
-- performs its lossless canonical reload/merge under a fresh mutation ID.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

do $migration$
declare
  v_signature regprocedure :=
    'public.phrasal_verb_system_upsert_attempt(uuid,uuid,text,text,text,integer,integer,integer,integer,timestamp with time zone,jsonb)'::regprocedure;
  v_helper_signature regprocedure :=
    'public._phrasal_verb_system_snapshot_is_dominated(jsonb,jsonb)'::regprocedure;
  v_definition text;
  v_helper_definition text;
  v_old_declaration text := $old$
  -- PHRASAL_STALE_SNAPSHOT_NOOP_V1
  v_existing public.phrasal_verb_system_attempts%rowtype;
  v_now timestamptz := clock_timestamp();
  v_started_at timestamptz;
  v_moves_backwards boolean;
$old$;
  v_new_declaration text := $new$
  -- PHRASAL_STALE_SNAPSHOT_NOOP_V1
  -- PHRASAL_BRANCH_DIVERGENCE_GUARD_V2
  v_existing public.phrasal_verb_system_attempts%rowtype;
  v_now timestamptz := clock_timestamp();
  v_started_at timestamptz;
  v_incoming_dominates boolean;
  v_canonical_dominates boolean;
$new$;
  v_old_guard text := $old$
    -- Completed attempts remain immutable and retries remain idempotent.
    if v_existing.status <> 'completed' then
      v_moves_backwards := p_round_number < v_existing.round_number
        or p_correct_count < v_existing.correct_count
        or p_duration_ms < v_existing.duration_ms
        or exists (
          select 1
          from jsonb_array_elements_text(v_existing.result -> 'correctIds')
            as old_id(question_id)
          where not (p_result -> 'correctIds' ? old_id.question_id)
        );

      if v_moves_backwards then
        if p_status = 'in_progress'
          and p_round_number <= v_existing.round_number
          and p_correct_count <= v_existing.correct_count
          and p_duration_ms <= v_existing.duration_ms
          and public._phrasal_verb_system_snapshot_is_dominated(
            v_existing.result,
            p_result
          )
        then
          -- Delayed retry of an entirely represented snapshot: deliberately do
          -- not change result, counters, timestamps, or updated_at.
          null;
        else
          raise exception 'Attempt progress cannot move backwards'
            using errcode = '22023';
        end if;
      else
        update public.phrasal_verb_system_attempts attempt
        set status = p_status,
            round_number = p_round_number,
            correct_count = p_correct_count,
            total_count = p_total_count,
            duration_ms = p_duration_ms,
            result = p_result,
            completed_at = case
              when p_status = 'completed' then greatest(v_now, v_existing.started_at)
              else null
            end,
            updated_at = v_now
        where attempt.id = p_id;
      end if;
    end if;
$old$;
  v_new_guard text := $new$
    -- Completed attempts remain immutable and retries remain idempotent.
    if v_existing.status <> 'completed' then
      v_incoming_dominates := p_round_number >= v_existing.round_number
        and p_correct_count >= v_existing.correct_count
        and p_duration_ms >= v_existing.duration_ms
        and public._phrasal_verb_system_snapshot_is_dominated(
          p_result,
          v_existing.result
        );

      v_canonical_dominates := p_status = 'in_progress'
        and p_round_number <= v_existing.round_number
        and p_correct_count <= v_existing.correct_count
        and p_duration_ms <= v_existing.duration_ms
        and public._phrasal_verb_system_snapshot_is_dominated(
          v_existing.result,
          p_result
        );

      if v_incoming_dominates then
        update public.phrasal_verb_system_attempts attempt
        set status = p_status,
            round_number = p_round_number,
            correct_count = p_correct_count,
            total_count = p_total_count,
            duration_ms = p_duration_ms,
            result = p_result,
            completed_at = case
              when p_status = 'completed' then greatest(v_now, v_existing.started_at)
              else null
            end,
            updated_at = v_now
        where attempt.id = p_id;
      elsif v_canonical_dominates then
        -- Delayed retry of an entirely represented snapshot: deliberately do
        -- not change result, counters, timestamps, or updated_at.
        null;
      else
        raise exception 'Attempt progress branches diverged'
          using errcode = '22023';
      end if;
    end if;
$new$;
begin
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'edmund-phrasal-verb-branch-divergence-guard-v2',
      0
    )
  );

  select pg_catalog.pg_get_functiondef(v_signature),
         pg_catalog.pg_get_functiondef(v_helper_signature)
  into v_definition, v_helper_definition;

  if pg_catalog.strpos(v_definition, 'PHRASAL_BRANCH_DIVERGENCE_GUARD_V2') > 0 then
    if pg_catalog.strpos(v_definition, 'Attempt progress branches diverged') = 0
      or pg_catalog.strpos(v_definition, 'v_incoming_dominates') = 0
      or pg_catalog.strpos(v_definition, 'v_canonical_dominates') = 0
    then
      raise exception 'Existing V2 Phrasal branch guard is incomplete';
    end if;
    return;
  end if;

  if md5(v_definition) <> '10af1df40e59487746e5c3f6f868ebf8' then
    raise exception 'Unreviewed Phrasal V1 upsert drift; refusing branch-guard replacement';
  end if;

  if md5(v_helper_definition) <> '82f2622814f04bd03651ffec3a6fe68c' then
    raise exception 'Unreviewed Phrasal dominance-helper drift; refusing branch-guard replacement';
  end if;

  if pg_catalog.strpos(v_definition, v_old_declaration) = 0
    or pg_catalog.strpos(v_definition, v_old_guard) = 0
  then
    raise exception 'Reviewed Phrasal V1 replacement anchors are missing';
  end if;

  v_definition := pg_catalog.replace(v_definition, v_old_declaration, v_new_declaration);
  v_definition := pg_catalog.replace(v_definition, v_old_guard, v_new_guard);
  execute v_definition;

  if pg_catalog.strpos(
    pg_catalog.pg_get_functiondef(v_signature),
    'PHRASAL_BRANCH_DIVERGENCE_GUARD_V2'
  ) = 0 then
    raise exception 'Phrasal branch-divergence guard marker was not installed';
  end if;
end;
$migration$;

revoke all on function public.phrasal_verb_system_upsert_attempt(
  uuid, uuid, text, text, text, integer, integer, integer, integer,
  timestamp with time zone, jsonb
) from public, anon, authenticated, service_role;
grant execute on function public.phrasal_verb_system_upsert_attempt(
  uuid, uuid, text, text, text, integer, integer, integer, integer,
  timestamp with time zone, jsonb
) to service_role;

select pg_catalog.pg_notify('pgrst', 'reload schema');

commit;
