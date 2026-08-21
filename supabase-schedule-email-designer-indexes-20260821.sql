begin;

create index if not exists schedule_email_logs_student_idx
  on public.schedule_email_logs(student_id);

create index if not exists schedule_homework_link_groups_admin_idx
  on public.schedule_homework_link_groups(created_by_admin);

commit;
