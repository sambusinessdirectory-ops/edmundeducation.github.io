-- Emergency forward-disable for exact-batch acknowledgement schema .3.
-- Retains all credential digests, delivery receipts, digest evidence, alerts, and rows.
-- Run only in one reviewed transaction with the exact local approval setting.

begin;
set local lock_timeout = '3s';
set local statement_timeout = '30s';

do $approval$
begin
  if pg_catalog.current_setting(
       'flashcard_integrity.outbox_batch_digest_rollback_approved',
       true
     ) is distinct from
       'confirmed-outbox-batch-digest-rollback-20260815' then
    raise exception using
      errcode = '55000',
      message = 'Exact-batch acknowledgement rollback approval is missing; no changes made.';
  end if;

  if pg_catalog.to_regprocedure(
       'public.flashcard_integrity_health_pre_batch_digest_internal()'
     ) is null
     or pg_catalog.to_regprocedure(
       'public.flashcard_integrity_acknowledge_outbox_pre_batch_digest_internal(text,timestamptz,text,text,text,text)'
     ) is null then
    raise exception using
      errcode = '55000',
      message = 'Preserved schema .2 implementations are missing; no changes made.';
  end if;
end;
$approval$;

revoke all on function public.flashcard_integrity_acknowledge_outbox(
  text, timestamptz, text, text, text, text, text
) from public, anon, authenticated, service_role;
drop function if exists public.flashcard_integrity_acknowledge_outbox(
  text, timestamptz, text, text, text, text, text
);

alter function
  public.flashcard_integrity_acknowledge_outbox_pre_batch_digest_internal(
    text, timestamptz, text, text, text, text
  ) rename to flashcard_integrity_acknowledge_outbox;
revoke all on function public.flashcard_integrity_acknowledge_outbox(
  text, timestamptz, text, text, text, text
) from public, anon, authenticated, service_role;
grant execute on function public.flashcard_integrity_acknowledge_outbox(
  text, timestamptz, text, text, text, text
) to anon;

drop function if exists public.flashcard_integrity_health();
alter function public.flashcard_integrity_health_pre_batch_digest_internal()
  rename to flashcard_integrity_health;
revoke all on function public.flashcard_integrity_health()
  from public, anon, authenticated, service_role;
grant execute on function public.flashcard_integrity_health() to anon;

-- Deliberately retain observed_batch_digest, its constraint, all .2/.3 canonical
-- receipts, consumers, alerts, and outbox delivery evidence.
notify pgrst, 'reload schema';
commit;
