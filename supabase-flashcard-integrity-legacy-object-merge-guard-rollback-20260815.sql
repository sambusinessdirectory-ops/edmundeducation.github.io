-- Emergency forward rollback for the compatibility guard only.
-- No state/audit data is deleted.  The existing phase-1 validation, attempt union,
-- revision audit and physical-delete protection remain installed.
--
-- FAILS CLOSED. In the same database session, an operator must first run:
--   set flashcard_integrity.legacy_object_guard_rollback_approved =
--     'confirmed-legacy-object-guard-rollback-20260815';

begin;
set local lock_timeout = '3s';
set local statement_timeout = '30s';

do $$
begin
  if pg_catalog.current_setting(
       'flashcard_integrity.legacy_object_guard_rollback_approved', true
     ) is distinct from 'confirmed-legacy-object-guard-rollback-20260815' then
    raise exception using
      errcode = '55000',
      message = 'Legacy object guard rollback not approved in this session; no trigger or function was removed.';
  end if;
end;
$$;

drop trigger if exists flashcard_state_zy_legacy_object_merge
  on public.flashcard_student_state;
drop function if exists flashcard_integrity.protect_legacy_object_members();

notify pgrst, 'reload schema';
commit;
