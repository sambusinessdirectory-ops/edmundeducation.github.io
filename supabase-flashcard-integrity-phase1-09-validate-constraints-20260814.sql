-- Flashcard integrity phase 1 / stage 09 of 14: online constraint validation.
-- VALIDATE uses a weaker lock than SET NOT NULL and permits ordinary reads/writes.

begin;
set local lock_timeout = '3s';
set local statement_timeout = '10min';

alter table public.flashcard_student_state
  validate constraint flashcard_state_version_present_positive;
alter table public.flashcard_student_state
  validate constraint flashcard_state_checksum_present;

commit;
