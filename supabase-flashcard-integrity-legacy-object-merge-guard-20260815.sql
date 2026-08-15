-- Flashcard compatibility guard: prevent legacy v1 upsert RPCs from treating a
-- stale/subset object snapshot as a complete replacement.
--
-- Scope is deliberately narrow:
--   * UPDATE only (INSERT and DELETE semantics are unchanged)
--   * actor_kind legacy_student / legacy_admin only
--   * enabled, v2-writable, object-valued versioned_replace state only
--   * edmundFlashcardAttempts remains on its stronger canonical attempt-union path
--
-- PostgreSQL executes same-event triggers alphabetically.  The `zy` trigger runs
-- immediately before the existing `flashcard_state_zz_integrity_protect` trigger,
-- so the existing validator, version increment, checksum and revision audit all see
-- the losslessly merged value.

begin;
set local lock_timeout = '3s';
set local statement_timeout = '30s';

do $$
declare
  v_student_upsert pg_catalog.regprocedure := pg_catalog.to_regprocedure(
    'public.flashcard_student_upsert_state(uuid,text,jsonb)'
  );
  v_admin_upsert pg_catalog.regprocedure := pg_catalog.to_regprocedure(
    'public.flashcard_admin_upsert_student_state(text,text,text,text,jsonb)'
  );
begin
  if pg_catalog.to_regprocedure(
       'flashcard_integrity.protect_state_write()'
     ) is null
     or pg_catalog.to_regprocedure(
       'flashcard_integrity.record_alert(uuid,text,text,text,uuid,jsonb,jsonb,text,text)'
     ) is null
     or pg_catalog.to_regprocedure(
       'flashcard_integrity.missing_top_level_member_count(jsonb,jsonb)'
     ) is null
     or v_student_upsert is null
     or v_admin_upsert is null
     or not exists (
       select 1
       from pg_catalog.pg_trigger trigger_row
       where trigger_row.tgrelid = 'public.flashcard_student_state'::pg_catalog.regclass
         and trigger_row.tgname = 'flashcard_state_zz_integrity_protect'
         and not trigger_row.tgisinternal
         and trigger_row.tgenabled <> 'D'
     ) then
    raise exception using
      errcode = '55000',
      message = 'Flashcard phase-1 integrity prerequisites are not active; compatibility guard was not installed.';
  end if;

  if pg_catalog.strpos(
       pg_catalog.lower(pg_catalog.pg_get_functiondef(v_student_upsert)),
       'legacy_student'
     ) = 0
     or pg_catalog.strpos(
       pg_catalog.lower(pg_catalog.pg_get_functiondef(v_admin_upsert)),
       'legacy_admin'
     ) = 0 then
    raise exception using
      errcode = '55000',
      message = 'Legacy student/admin upsert wrappers do not identify their actor kind; compatibility guard was not installed.';
  end if;
end;
$$;

create or replace function flashcard_integrity.protect_legacy_object_members()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_kind text := flashcard_integrity.current_actor_kind();
  v_rule flashcard_integrity.state_key_rules%rowtype;
  v_incoming jsonb;
  v_missing_members bigint := 0;
  v_alert_id bigint;
begin
  -- The trigger itself is UPDATE-only, but keep a fail-open operation check so a
  -- future trigger edit cannot accidentally change INSERT/DELETE behavior.
  if tg_op <> 'UPDATE'
     or v_actor_kind not in ('legacy_student', 'legacy_admin')
     or new.value is not distinct from old.value then
    return new;
  end if;

  select * into v_rule
  from flashcard_integrity.state_key_rules rules
  where rules.state_key = new.key
    and rules.enabled
    and rules.v2_writable
    and rules.expected_json_type = 'object'
    and rules.write_strategy = 'versioned_replace';

  if not found
     or pg_catalog.jsonb_typeof(old.value) <> 'object'
     or pg_catalog.jsonb_typeof(new.value) <> 'object' then
    return new;
  end if;

  v_incoming := new.value;
  v_missing_members := flashcard_integrity.missing_top_level_member_count(
    old.value,
    v_incoming
  );

  if v_missing_members <= 0 then
    return new;
  end if;

  -- Existing-only top-level members survive; incoming values still win for keys the
  -- legacy client explicitly supplied.  This is intentionally shallow: nested state
  -- has application-specific semantics and is protected by v2 optimistic versions.
  new.value := old.value || v_incoming;

  v_alert_id := flashcard_integrity.record_alert(
    new.student_id,
    new.key,
    case when v_missing_members >= 5 then 'critical' else 'warning' end,
    'legacy_object_regression_prevented',
    flashcard_integrity.current_request_id(),
    flashcard_integrity.state_metrics(old.key, old.value)
      || pg_catalog.jsonb_build_object('missingTopLevelMembers', 0),
    flashcard_integrity.state_metrics(new.key, v_incoming)
      || pg_catalog.jsonb_build_object(
        'missingTopLevelMembers', v_missing_members,
        'preservedTopLevelMembers', v_missing_members
      ),
    'lossless_top_level_merge',
    v_actor_kind
  );

  return new;
end;
$$;

revoke all on function flashcard_integrity.protect_legacy_object_members()
  from public, anon, authenticated, service_role;

drop trigger if exists flashcard_state_zy_legacy_object_merge
  on public.flashcard_student_state;
create trigger flashcard_state_zy_legacy_object_merge
before update on public.flashcard_student_state
for each row
execute function flashcard_integrity.protect_legacy_object_members();

comment on function flashcard_integrity.protect_legacy_object_members() is
  'Compatibility-only lossless top-level object merge for legacy Flashcard v1 student/admin upsert actors.';
comment on trigger flashcard_state_zy_legacy_object_merge
  on public.flashcard_student_state is
  'Preserves top-level object members omitted by legacy v1 upserts before the phase-1 integrity trigger validates and audits the result.';

notify pgrst, 'reload schema';
commit;
