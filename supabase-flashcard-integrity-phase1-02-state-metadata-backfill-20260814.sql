-- Flashcard integrity phase 1 / stage 02 of 14: metadata-only DML backfill.
-- This is intentionally separate from stage 01 so no ALTER TABLE lock is retained.
-- Current production volume is small; this single idempotent UPDATE is bounded by a
-- five-minute statement timeout and changes only rows that need repair.

begin;
set local lock_timeout = '3s';
set local statement_timeout = '5min';
select pg_catalog.set_config('flashcard_integrity.preserve_updated_at', 'on', true);

update public.flashcard_student_state state
set version = greatest(coalesce(state.version, 1), 1),
    value_checksum = flashcard_integrity.jsonb_checksum(state.value)
where state.version is null
   or state.version < 1
   or state.value_checksum is distinct from flashcard_integrity.jsonb_checksum(state.value);

do $$
begin
  if exists (
    select 1
    from public.flashcard_student_state state
    where state.version is null
       or state.version < 1
       or state.value_checksum is null
       or state.value_checksum is distinct from flashcard_integrity.jsonb_checksum(state.value)
  ) then
    raise exception 'Flashcard state metadata backfill did not converge.';
  end if;
end;
$$;

commit;
