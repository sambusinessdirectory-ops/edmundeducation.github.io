-- Additive migration for durable Admin student-list ordering.
-- Safe to run more than once after supabase-flashcard-accounts.sql has been installed.

alter table public.flashcard_admins
  add column if not exists student_sort_mode text not null default 'custom';

alter table public.flashcard_students
  add column if not exists sort_order integer;

with ranked_students as (
  select
    s.id,
    row_number() over (order by s.created_at, s.id)::integer as next_sort_order
  from public.flashcard_students s
  where s.deleted_at is null
)
update public.flashcard_students s
set sort_order = ranked_students.next_sort_order
from ranked_students
where s.id = ranked_students.id
  and s.sort_order is null;

create or replace function public.flashcard_assign_student_sort_order()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.deleted_at is null and new.sort_order is null then
    select coalesce(max(s.sort_order), 0) + 1
    into new.sort_order
    from public.flashcard_students s
    where s.deleted_at is null
      and s.id is distinct from new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists flashcard_students_assign_sort_order on public.flashcard_students;
create trigger flashcard_students_assign_sort_order
before insert or update of deleted_at, sort_order on public.flashcard_students
for each row
execute function public.flashcard_assign_student_sort_order();

create or replace function public.flashcard_admin_get_student_list_preferences(
  p_admin_name text,
  p_admin_password text
)
returns table(sort_mode text, student_order jsonb)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.flashcard_admin_ok(p_admin_name, p_admin_password) then
    return;
  end if;

  return query
  select
    case
      when a.student_sort_mode in ('asc', 'desc', 'custom') then a.student_sort_mode
      else 'custom'
    end,
    coalesce(
      (
        select jsonb_agg(s.name order by s.sort_order nulls last, s.created_at, s.name)
        from public.flashcard_students s
        where s.deleted_at is null
      ),
      '[]'::jsonb
    )
  from public.flashcard_admins a
  where a.name = p_admin_name;
end;
$$;

create or replace function public.flashcard_admin_set_student_sort_mode(
  p_admin_name text,
  p_admin_password text,
  p_sort_mode text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sort_mode text := lower(trim(coalesce(p_sort_mode, '')));
begin
  if not public.flashcard_admin_ok(p_admin_name, p_admin_password) then
    return null;
  end if;

  if v_sort_mode not in ('asc', 'desc', 'custom') then
    raise exception 'Unsupported student sort mode.';
  end if;

  update public.flashcard_admins a
  set student_sort_mode = v_sort_mode
  where a.name = p_admin_name;

  return v_sort_mode;
end;
$$;

create or replace function public.flashcard_admin_reorder_students(
  p_admin_name text,
  p_admin_password text,
  p_student_names text[]
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_expected_count integer;
  v_submitted_count integer := coalesce(cardinality(p_student_names), 0);
  v_distinct_count integer;
  v_matching_count integer;
begin
  if not public.flashcard_admin_ok(p_admin_name, p_admin_password) then
    return false;
  end if;

  select count(*)::integer
  into v_expected_count
  from public.flashcard_students s
  where s.deleted_at is null;

  select count(distinct names.student_name)::integer
  into v_distinct_count
  from unnest(coalesce(p_student_names, array[]::text[])) as names(student_name);

  select count(*)::integer
  into v_matching_count
  from public.flashcard_students s
  join unnest(coalesce(p_student_names, array[]::text[])) as names(student_name)
    on names.student_name = s.name
  where s.deleted_at is null;

  if v_submitted_count <> v_expected_count
    or v_distinct_count <> v_submitted_count
    or v_matching_count <> v_expected_count
  then
    return false;
  end if;

  update public.flashcard_students s
  set sort_order = ordered.position::integer,
      updated_at = now()
  from unnest(p_student_names) with ordinality as ordered(student_name, position)
  where s.name = ordered.student_name
    and s.deleted_at is null;

  update public.flashcard_admins a
  set student_sort_mode = 'custom'
  where a.name = p_admin_name;

  return true;
end;
$$;

revoke all on function public.flashcard_admin_get_student_list_preferences(text, text) from public, anon, authenticated, service_role;
revoke all on function public.flashcard_admin_set_student_sort_mode(text, text, text) from public, anon, authenticated, service_role;
revoke all on function public.flashcard_admin_reorder_students(text, text, text[]) from public, anon, authenticated, service_role;

grant execute on function public.flashcard_admin_get_student_list_preferences(text, text) to authenticated;
grant execute on function public.flashcard_admin_set_student_sort_mode(text, text, text) to authenticated;
grant execute on function public.flashcard_admin_reorder_students(text, text, text[]) to authenticated;
