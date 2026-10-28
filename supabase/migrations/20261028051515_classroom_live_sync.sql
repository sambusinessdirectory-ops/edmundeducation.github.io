begin;
create schema if not exists classroom_private;
revoke all on schema classroom_private from public, anon;
grant usage on schema classroom_private to authenticated;
create sequence classroom_private.live_revision;
create table classroom_private.live_state (
 student_id uuid not null, system text not null, scope text not null,
 revision bigint not null default nextval('classroom_private.live_revision'),
 mutation uuid not null, payload jsonb not null, updated_at timestamptz not null default now(),
 primary key(student_id,system,scope)
);
alter table classroom_private.live_state enable row level security;
revoke all on classroom_private.live_state from public, anon, authenticated;
revoke all on sequence classroom_private.live_revision from public, anon, authenticated;
create function classroom_private.sync(p_token uuid,p_system text,p_scope text,p_since bigint,p_payload jsonb,p_mutation uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare student uuid; item classroom_private.live_state;
begin
 if auth.uid() is null then raise exception 'Sign in required' using errcode='28000'; end if;
 student:=public.flashcard_session_student_id(p_token);
 if student is null then raise exception 'Student session expired' using errcode='28000'; end if;
 if p_system is null or p_system not in ('synonyms','natural-english','advanced-native','common-expressions','sentence-structure','idiom','proverb','phrasal-verb','writing','flashcards')
 or p_scope is null or length(p_scope) not between 1 and 180 then raise exception 'Invalid classroom scope' using errcode='22023';end if;
 if p_payload is not null then
  if jsonb_typeof(p_payload) is distinct from 'object' or octet_length(p_payload::text)>524288 or p_mutation is null then raise exception 'Invalid classroom state' using errcode='22023';end if;
  delete from classroom_private.live_state where student_id=student and updated_at<now()-interval '24 hours';
  insert into classroom_private.live_state(student_id,system,scope,mutation,payload)
   values(student,p_system,p_scope,p_mutation,p_payload)
  on conflict(student_id,system,scope) do update set payload=excluded.payload,mutation=excluded.mutation,
   revision=nextval('classroom_private.live_revision'),updated_at=now()
  where live_state.mutation is distinct from excluded.mutation;
 end if;
 select * into item from classroom_private.live_state where student_id=student and system=p_system and scope=p_scope and updated_at>now()-interval '24 hours';
 if not found then return jsonb_build_object('revision',0);end if;
 return jsonb_build_object('revision',item.revision,'payload',case when item.revision<>coalesce(p_since,0) then item.payload else null end);
end;$$;
revoke all on function classroom_private.sync(uuid,text,text,bigint,jsonb,uuid) from public,anon;
grant execute on function classroom_private.sync(uuid,text,text,bigint,jsonb,uuid) to authenticated;
create function public.classroom_live_sync(p_token uuid,p_system text,p_scope text,p_since bigint default 0,p_payload jsonb default null,p_mutation uuid default null)
returns jsonb language sql security invoker set search_path='' as $$select classroom_private.sync(p_token,p_system,p_scope,p_since,p_payload,p_mutation)$$;
revoke all on function public.classroom_live_sync(uuid,text,text,bigint,jsonb,uuid) from public,anon;
grant execute on function public.classroom_live_sync(uuid,text,text,bigint,jsonb,uuid) to authenticated;
commit;
