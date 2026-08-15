-- Flashcard integrity phase 1 / stage 10 of 14: brief NOT NULL finalization.
-- The validated CHECK constraints let PostgreSQL prove non-nullness without another
-- long table scan. If a lock is not available within three seconds, this unit aborts.

begin;
set local lock_timeout = '3s';
set local statement_timeout = '30s';

do $$
begin
  if exists (
    select 1 from public.flashcard_student_state
    where version is null or version < 1 or value_checksum is null
  ) then
    raise exception 'Cannot finalize Flashcard metadata: null/invalid rows remain.';
  end if;
end;
$$;

alter table public.flashcard_student_state
  alter column version set default 1,
  alter column version set not null,
  alter column value_checksum set not null;

commit;
