-- Emergency forward-disable for the external outbox acknowledgement endpoint.
-- This preserves every credential digest, delivery receipt, alert, and outbox row.
-- Run only in one reviewed session with the exact transaction-local approval value.

begin;
set local lock_timeout = '3s';
set local statement_timeout = '30s';

do $$
begin
  if pg_catalog.current_setting(
       'flashcard_integrity.outbox_ack_rollback_approved',
       true
     ) is distinct from
       'confirmed-outbox-ack-rollback-20260815' then
    raise exception using
      errcode = '55000',
      message = 'Outbox acknowledgement rollback approval is missing; no changes made.';
  end if;

  if pg_catalog.to_regprocedure(
       'public.flashcard_integrity_health_pre_outbox_ack_internal()'
     ) is null then
    raise exception using
      errcode = '55000',
      message = 'Preserved pre-ack watchdog is missing; no changes made.';
  end if;
end;
$$;

revoke all on function public.flashcard_integrity_acknowledge_outbox(
  text, timestamptz, text, text, text, text
) from public, anon, authenticated, service_role;
drop function if exists public.flashcard_integrity_acknowledge_outbox(
  text, timestamptz, text, text, text, text
);

drop function if exists public.flashcard_integrity_health();
alter function public.flashcard_integrity_health_pre_outbox_ack_internal()
  rename to flashcard_integrity_health;
revoke all on function public.flashcard_integrity_health()
  from public, anon, authenticated, service_role;
grant execute on function public.flashcard_integrity_health() to anon;

-- Deliberately retain watchdog_outbox_consumers, outbox_acknowledgements, their RLS,
-- the receipt immutability trigger, and all audit/delivery evidence.
notify pgrst, 'reload schema';
commit;
