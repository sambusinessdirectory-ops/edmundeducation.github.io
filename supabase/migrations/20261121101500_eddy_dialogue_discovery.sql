create schema if not exists eddy_dialogue_private;
revoke all on schema eddy_dialogue_private from public, anon, authenticated;

create table if not exists eddy_dialogue_private.discoveries (
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  dialogue_id text not null check (dialogue_id ~ '^eddy-[a-z0-9-]{1,90}$'),
  discovered_at timestamptz not null default now(),
  primary key (student_id, dialogue_id)
);

alter table eddy_dialogue_private.discoveries enable row level security;
revoke all on eddy_dialogue_private.discoveries from public, anon, authenticated;

create or replace function public.eddy_dialogue_discovery_list(p_token uuid)
returns table(dialogue_id text, discovered_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select discovery.dialogue_id, discovery.discovered_at
  from eddy_dialogue_private.discoveries discovery
  where discovery.student_id = public.flashcard_session_student_id(p_token)
  order by discovery.discovered_at, discovery.dialogue_id;
$$;

create or replace function public.eddy_dialogue_discovery_record(p_token uuid, p_dialogue_id text)
returns table(dialogue_id text, discovered_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  student uuid := public.flashcard_session_student_id(p_token);
  normalized_id text := lower(trim(coalesce(p_dialogue_id, '')));
begin
  if student is null then
    raise exception 'Please log in again' using errcode = '42501';
  end if;
  if normalized_id !~ '^eddy-[a-z0-9-]{1,90}$' then
    raise exception 'Invalid dialogue identifier' using errcode = '22023';
  end if;

  insert into eddy_dialogue_private.discoveries(student_id, dialogue_id)
  values (student, normalized_id)
  on conflict (student_id, dialogue_id) do nothing;

  return query
  select discovery.dialogue_id, discovery.discovered_at
  from eddy_dialogue_private.discoveries discovery
  where discovery.student_id = student
    and discovery.dialogue_id = normalized_id;
end;
$$;

revoke all on function public.eddy_dialogue_discovery_list(uuid) from public;
revoke all on function public.eddy_dialogue_discovery_record(uuid, text) from public;
grant execute on function public.eddy_dialogue_discovery_list(uuid) to anon, authenticated, service_role;
grant execute on function public.eddy_dialogue_discovery_record(uuid, text) to anon, authenticated, service_role;
