-- Private, owner-scoped short recordings. No public audio URLs or direct table access.
create table natural_english_private.recordings(
 student_id uuid not null references public.flashcard_students(id) on delete cascade,
 id uuid not null, run uuid not null, slot text not null check(slot in ('phrase','dialogue')),
 mime text not null check(mime in ('audio/webm','audio/mp4','audio/ogg')),
 audio bytea not null check(octet_length(audio) between 32 and 2097152),
 at timestamptz not null default now(), primary key(student_id,id)
);
alter table natural_english_private.recordings enable row level security;
revoke all on natural_english_private.recordings from public,anon,authenticated;
create function natural_english_private.recording(p_token uuid,p_action text,p_payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare sid uuid; data bytea; result jsonb; mt text;
begin
 if auth.uid() is null then raise exception 'Sign in required' using errcode='28000';end if;
 sid:=public.flashcard_session_student_id(p_token);
 if sid is null then raise exception 'Student session expired' using errcode='28000';end if;
 if p_action='list' then
 select coalesce(jsonb_agg(jsonb_build_object('id',r.id,'run',r.run,'slot',r.slot,'mime',r.mime,'at',r.at) order by r.at desc),'[]'::jsonb) into result from natural_english_private.recordings r where r.student_id=sid;return result;
 elsif p_action='get' then
 select jsonb_build_object('mime',r.mime,'audio',replace(encode(r.audio,'base64'),E'\n','')) into result from natural_english_private.recordings r where r.student_id=sid and r.id=(p_payload->>'id')::uuid;
 if result is null then raise exception 'Recording not found' using errcode='22023';end if;return result;
 elsif p_action='save' then
 if coalesce(length(p_payload->>'audio'),0) not between 40 and 2796204 or coalesce(p_payload->>'slot','') not in ('phrase','dialogue') or coalesce(p_payload->>'mime','') not in ('audio/webm','audio/mp4','audio/ogg') or p_payload->>'id' is null then raise exception 'Invalid recording' using errcode='22023';end if;
 if not exists(select 1 from natural_english_private.events e where e.student_id=sid and e.kind='start' and e.run=(p_payload->>'run')::uuid) then raise exception 'Unknown practice run' using errcode='22023';end if;
 data:=decode(p_payload->>'audio','base64');mt:=p_payload->>'mime';
 if octet_length(data) not between 32 and 2097152 or not ((mt='audio/webm' and substring(data from 1 for 4)=decode('1a45dfa3','hex')) or (mt='audio/mp4' and substring(data from 5 for 4)=convert_to('ftyp','UTF8')) or (mt='audio/ogg' and substring(data from 1 for 4)=convert_to('OggS','UTF8'))) then raise exception 'Invalid audio container' using errcode='22023';end if;
 perform pg_advisory_xact_lock(hashtextextended(sid::text,66));
 if not exists(select 1 from natural_english_private.recordings r where r.student_id=sid and r.id=(p_payload->>'id')::uuid) and (select coalesce(sum(octet_length(audio)),0) from natural_english_private.recordings where student_id=sid)+octet_length(data)>104857600 then raise exception 'Recording storage full' using errcode='22023';end if;
 insert into natural_english_private.recordings(student_id,id,run,slot,mime,audio) values(sid,(p_payload->>'id')::uuid,(p_payload->>'run')::uuid,p_payload->>'slot',mt,data) on conflict do nothing;return jsonb_build_object('saved',true);
 end if;
 raise exception 'Unknown action' using errcode='22023';
end;$$;
revoke all on function natural_english_private.recording(uuid,text,jsonb) from public,anon,authenticated;
grant execute on function natural_english_private.recording(uuid,text,jsonb) to authenticated;
create function public.natural_english_recording(p_token uuid,p_action text,p_payload jsonb default '{}'::jsonb) returns jsonb language sql security invoker set search_path='' as $$select natural_english_private.recording(p_token,p_action,p_payload);$$;
revoke all on function public.natural_english_recording(uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.natural_english_recording(uuid,text,jsonb) to authenticated;
-- Retain accepted legacy answer labels for clients with an already-open lesson.
update natural_english_private.catalogue set questions=jsonb_set(questions,'{cup,options}',(questions#>'{cup,options}') || '["你要朱古力還是雲呢拿？"]'::jsonb) where module='scoop';
notify pgrst,'reload schema';
