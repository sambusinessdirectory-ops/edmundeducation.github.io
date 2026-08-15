-- DEPRECATED SAFETY GUARD
--
-- The original all-in-one migration held public-table locks for too long and must not
-- be applied. Follow FLASHCARD-INTEGRITY-PHASE1-RUNBOOK-20260814.md and execute the
-- ordered stage 01 through 13 files separately. Stage 14 is a manual Auth-role gate.

do $$
begin
  raise exception using
    errcode = '55000',
    message = 'Deprecated monolithic Flashcard migration refused; use the ordered production-safe migration series.';
end;
$$;
