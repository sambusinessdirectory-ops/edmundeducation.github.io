-- Flashcard integrity phase 1 / stage 08 of 14: add invariants without scanning.

begin;
set local lock_timeout = '3s';
set local statement_timeout = '30s';

do $$
begin
  if not exists (
    select 1 from pg_catalog.pg_constraint
    where conrelid = 'public.flashcard_student_state'::regclass
      and conname = 'flashcard_state_version_present_positive'
  ) then
    alter table public.flashcard_student_state
      add constraint flashcard_state_version_present_positive
      check (version is not null and version >= 1) not valid;
  end if;

  if not exists (
    select 1 from pg_catalog.pg_constraint
    where conrelid = 'public.flashcard_student_state'::regclass
      and conname = 'flashcard_state_checksum_present'
  ) then
    alter table public.flashcard_student_state
      add constraint flashcard_state_checksum_present
      check (value_checksum is not null) not valid;
  end if;
end;
$$;

commit;
