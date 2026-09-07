begin;
create or replace function public.learning_hub_identity(p_token uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare sid uuid; a record;
begin
 sid:=public.flashcard_session_student_id(p_token);
 if sid is not null then return (select jsonb_build_object('id',id,'kind','student','name',name,'access',access-'__adminMessage') from public.flashcard_students where id=sid);end if;
 select * into a from public.speaking_admin_me(p_token);
 if a.id is not null then return jsonb_build_object('id',a.id,'kind','admin','name',a.name);end if;
 raise exception 'Please sign in' using errcode='42501';
end;$$;
create table public.learning_mistake_notes(student_id uuid not null references public.flashcard_students(id) on delete cascade,item_key text not null check(length(item_key) between 1 and 800),system text not null check(system in ('listening','reading')),context jsonb not null check(pg_column_size(context)<=40000),body text not null check(length(body)<=12000),version integer not null default 1,updated_at timestamptz not null default now(),primary key(student_id,item_key));
alter table public.learning_mistake_notes enable row level security;
revoke all on public.learning_mistake_notes from public,anon,authenticated;
create index learning_mistake_notes_date on public.learning_mistake_notes(student_id,updated_at desc);
create function public.learning_mistake_action(p_token uuid,p_action text,p_payload jsonb default '{}') returns jsonb language plpgsql security definer set search_path='' as $$
declare actor jsonb:=public.learning_hub_identity(p_token); uid uuid:=(actor->>'id')::uuid; result jsonb;
begin
 if actor->>'kind'<>'student' then raise exception 'Student account required' using errcode='42501';end if;
 if p_action='list' then
 return coalesce((select jsonb_agg(to_jsonb(n) order by n.updated_at desc) from (select * from public.learning_mistake_notes where student_id=uid and system=p_payload->>'system' and body<>'' order by updated_at desc,item_key limit 100 offset greatest(0,least(100000,coalesce((p_payload->>'offset')::int,0)))) n),'[]');
 elsif p_action='get' then select to_jsonb(n) into result from public.learning_mistake_notes n where student_id=uid and item_key=p_payload->>'key';return result;
 elsif p_action='save' then
 insert into public.learning_mistake_notes as n(student_id,item_key,system,context,body) values(uid,p_payload->>'key',p_payload->>'system',p_payload->'context',trim(p_payload->>'body')) on conflict(student_id,item_key) do update set body=excluded.body,context=excluded.context,version=n.version+1,updated_at=clock_timestamp() where n.version=coalesce((p_payload->>'version')::int,0) returning to_jsonb(n) into result;
 if result is null then raise exception 'Note changed on another device. Reload before saving.' using errcode='40001';end if;return result;
 end if;raise exception 'Invalid action';
end;$$;
revoke all on function public.learning_mistake_action(uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.learning_mistake_action(uuid,text,jsonb) to service_role;
notify pgrst,'reload schema';
commit;
