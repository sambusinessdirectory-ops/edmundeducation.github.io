begin;

create table if not exists public.schedule_learning_books (
  student_id uuid primary key references public.flashcard_students(id) on delete cascade,
  payload jsonb not null default '{"values":[],"habits":[],"plans":[]}'::jsonb,
  updated_at timestamptz not null default pg_catalog.now(),
  constraint schedule_learning_books_payload_is_object check (jsonb_typeof(payload) = 'object')
);

alter table public.schedule_learning_books enable row level security;
revoke all on table public.schedule_learning_books from public, anon, authenticated;

create or replace function public.schedule_student_get_learning_books(p_token uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
  v_row public.schedule_learning_books%rowtype;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  v_student_id := public.flashcard_session_student_id(p_token);
  if v_student_id is null then
    raise exception 'Invalid or expired student session' using errcode = '42501';
  end if;
  select * into v_row from public.schedule_learning_books where student_id = v_student_id;
  if not found then
    return pg_catalog.jsonb_build_object(
      'data', pg_catalog.jsonb_build_object('values','[]'::jsonb,'habits','[]'::jsonb,'plans','[]'::jsonb),
      'updatedAt', null
    );
  end if;
  return pg_catalog.jsonb_build_object('data',v_row.payload,'updatedAt',v_row.updated_at);
end;
$$;

create or replace function public.schedule_student_save_learning_books(p_token uuid, p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
  v_row public.schedule_learning_books%rowtype;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  v_student_id := public.flashcard_session_student_id(p_token);
  if v_student_id is null then
    raise exception 'Invalid or expired student session' using errcode = '42501';
  end if;
  if p_payload is null
    or pg_catalog.jsonb_typeof(p_payload) <> 'object'
    or pg_catalog.jsonb_typeof(p_payload->'values') is distinct from 'array'
    or pg_catalog.jsonb_typeof(p_payload->'habits') is distinct from 'array'
    or pg_catalog.jsonb_typeof(p_payload->'plans') is distinct from 'array'
    or pg_catalog.octet_length(p_payload::text) > 262144
    or exists (select 1 from pg_catalog.jsonb_array_elements(p_payload->'values') as item(value) where pg_catalog.jsonb_typeof(item.value) <> 'string')
  then
    raise exception 'Invalid learning books payload' using errcode = '22023';
  end if;
  if pg_catalog.jsonb_array_length(p_payload->'values') > 220
    or pg_catalog.jsonb_array_length(p_payload->'habits') > 1000
    or pg_catalog.jsonb_array_length(p_payload->'plans') > 1000
  then raise exception 'Learning books list limit exceeded' using errcode = '22023'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_student_id::text, 0));
  insert into public.schedule_learning_books(student_id,payload)
  values (v_student_id,p_payload)
  on conflict (student_id) do update set payload=excluded.payload,updated_at=pg_catalog.now()
  returning * into v_row;
  return pg_catalog.jsonb_build_object('data',v_row.payload,'updatedAt',v_row.updated_at);
end;
$$;

revoke all on function public.schedule_student_get_learning_books(uuid) from public, anon, authenticated;
revoke all on function public.schedule_student_save_learning_books(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.schedule_student_get_learning_books(uuid) to authenticated;
grant execute on function public.schedule_student_save_learning_books(uuid, jsonb) to authenticated;

commit;
