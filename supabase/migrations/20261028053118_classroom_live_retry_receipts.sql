begin;
-- Retain receipts independently of the last writer, so a lost-response retry
-- cannot restore an older screen after another device has advanced it.
create table classroom_private.live_receipts (
 student_id uuid not null, mutation uuid not null, created_at timestamptz not null default now(),
 primary key(student_id,mutation)
);
alter table classroom_private.live_receipts enable row level security;
revoke all on classroom_private.live_receipts from public,anon,authenticated;
create or replace function classroom_private.sync(p_token uuid,p_system text,p_scope text,p_since bigint,p_payload jsonb,p_mutation uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare student uuid; item classroom_private.live_state; fresh boolean;
begin
 if auth.uid() is null then raise exception 'Sign in required' using errcode='28000'; end if;
 student:=public.flashcard_session_student_id(p_token);
 if student is null then raise exception 'Student session expired' using errcode='28000'; end if;
 if p_system is null or p_system not in ('synonyms','natural-english','advanced-native','common-expressions','sentence-structure','idiom','proverb','phrasal-verb','writing','flashcards')
 or p_scope is null or length(p_scope) not between 1 and 180 then raise exception 'Invalid classroom scope' using errcode='22023';end if;
 if p_payload is not null then
  if jsonb_typeof(p_payload) is distinct from 'object' or octet_length(p_payload::text)>524288 or p_mutation is null then raise exception 'Invalid classroom state' using errcode='22023';end if;
  delete from classroom_private.live_receipts where student_id=student and created_at<now()-interval '24 hours';
  insert into classroom_private.live_receipts(student_id,mutation) values(student,p_mutation) on conflict do nothing;
  fresh:=found;
  if fresh then
  delete from classroom_private.live_state where student_id=student and updated_at<now()-interval '24 hours';
  insert into classroom_private.live_state(student_id,system,scope,mutation,payload)
   values(student,p_system,p_scope,p_mutation,p_payload)
  on conflict(student_id,system,scope) do update set payload=excluded.payload,mutation=excluded.mutation,
   revision=nextval('classroom_private.live_revision'),updated_at=now()
  where live_state.mutation is distinct from excluded.mutation;
  end if;
 end if;
 select * into item from classroom_private.live_state where student_id=student and system=p_system and scope=p_scope and updated_at>now()-interval '24 hours';
 if not found then return jsonb_build_object('revision',0);end if;
 return jsonb_build_object('revision',item.revision,'payload',case when item.revision<>coalesce(p_since,0) then item.payload else null end);
end;$$;
commit;
